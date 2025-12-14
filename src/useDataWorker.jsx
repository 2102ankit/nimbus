import { useEffect, useRef, useState, useCallback } from 'react';

export function useDataWorker() {
    const workerRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const pendingCallbacks = useRef(new Map());
    const requestId = useRef(0);

    useEffect(() => {
        // Create worker
        const workerCode = `
      // Sorting functions
      function sortData(data, sorting) {
        if (!sorting || sorting.length === 0) return data;
        
        return [...data].sort((a, b) => {
          for (const sort of sorting) {
            const { id, desc } = sort;
            
            // Get values - handle nested keys
            let aVal = a[id];
            let bVal = b[id];
            
            // If value is undefined, try to find it in the original object
            if (aVal === undefined) {
              const keys = Object.keys(a);
              const matchingKey = keys.find(k => k.replace(/[^a-zA-Z0-9_]/g, '_') === id);
              if (matchingKey) aVal = a[matchingKey];
            }
            if (bVal === undefined) {
              const keys = Object.keys(b);
              const matchingKey = keys.find(k => k.replace(/[^a-zA-Z0-9_]/g, '_') === id);
              if (matchingKey) bVal = b[matchingKey];
            }
            
            if (aVal === bVal) continue;
            
            if (aVal == null) return desc ? 1 : -1;
            if (bVal == null) return desc ? -1 : 1;
            
            // Parse numbers if they look like numbers
            const aNum = parseFloat(aVal);
            const bNum = parseFloat(bVal);
            if (!isNaN(aNum) && !isNaN(bNum) && typeof aVal !== 'boolean' && typeof bVal !== 'boolean') {
              const comparison = aNum - bNum;
              return desc ? -comparison : comparison;
            }
            
            if (typeof aVal === 'string' && typeof bVal === 'string') {
              const comparison = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
              return desc ? -comparison : comparison;
            }
            
            const comparison = aVal < bVal ? -1 : 1;
            return desc ? -comparison : comparison;
          }
          return 0;
        });
      }

      function filterData(data, filters, globalFilter) {
        let filtered = data;
        
        if (globalFilter && globalFilter.trim()) {
          const searchLower = globalFilter.toLowerCase();
          filtered = filtered.filter(row => {
            return Object.values(row).some(value => {
              if (value == null) return false;
              return String(value).toLowerCase().includes(searchLower);
            });
          });
        }
        
        if (filters && filters.length > 0) {
          filtered = filtered.filter(row => {
            return filters.every(filter => {
              const { id, value } = filter;
              
              // Get cell value - handle nested keys
              let cellValue = row[id];
              if (cellValue === undefined) {
                const keys = Object.keys(row);
                const matchingKey = keys.find(k => k.replace(/[^a-zA-Z0-9_]/g, '_') === id);
                if (matchingKey) cellValue = row[matchingKey];
              }
              
              if (!value) return true;
              
              const { operator, value: filterValue, dataType } = value;
              
              if (operator === 'isEmpty') {
                return cellValue == null || String(cellValue).trim() === '';
              }
              if (operator === 'isNotEmpty') {
                return cellValue != null && String(cellValue).trim() !== '';
              }
              
              if (dataType === 'number') {
                const num = Number(cellValue);
                const fNum = Number(filterValue);
                
                switch (operator) {
                  case 'equals': return num === fNum;
                  case 'notEquals': return num !== fNum;
                  case 'greaterThan': return num > fNum;
                  case 'greaterThanOrEqual': return num >= fNum;
                  case 'lessThan': return num < fNum;
                  case 'lessThanOrEqual': return num <= fNum;
                  case 'between':
                    const min = filterValue.min ? Number(filterValue.min) : -Infinity;
                    const max = filterValue.max ? Number(filterValue.max) : Infinity;
                    return num >= min && num <= max;
                  default: return true;
                }
              }
              
              if (dataType === 'date') {
                const date = new Date(cellValue);
                const fDate = new Date(filterValue);
                
                switch (operator) {
                  case 'equals': return date.toDateString() === fDate.toDateString();
                  case 'notEquals': return date.toDateString() !== fDate.toDateString();
                  case 'before': return date < fDate;
                  case 'after': return date > fDate;
                  case 'between':
                    const from = filterValue.from ? new Date(filterValue.from) : new Date(-8640000000000000);
                    const to = filterValue.to ? new Date(filterValue.to) : new Date(8640000000000000);
                    return date >= from && date <= to;
                  default: return true;
                }
              }
              
              const strValue = String(cellValue || '').toLowerCase();
              const strFilter = String(filterValue).toLowerCase();
              
              switch (operator) {
                case 'contains': return strValue.includes(strFilter);
                case 'notContains': return !strValue.includes(strFilter);
                case 'equals': return strValue === strFilter;
                case 'notEquals': return strValue !== strFilter;
                case 'startsWith': return strValue.startsWith(strFilter);
                case 'endsWith': return strValue.endsWith(strFilter);
                default: return true;
              }
            });
          });
        }
        
        return filtered;
      }

      function paginateData(data, pageIndex, pageSize) {
        const start = pageIndex * pageSize;
        const end = start + pageSize;
        return data.slice(start, end);
      }

      function exportToCSV(data, columns) {
        const headers = columns.map(col => col.header).join(',');
        const rows = data.map(row => 
          columns.map(col => {
            const value = row[col.id];
            const str = String(value ?? '');
            return str.includes(',') || str.includes('"') || str.includes('\\n') 
              ? '"' + str.replace(/"/g, '""') + '"'
              : str;
          }).join(',')
        ).join('\\n');
        
        return headers + '\\n' + rows;
      }

      function exportToJSON(data, columns) {
        const exported = data.map(row => {
          const obj = {};
          columns.forEach(col => {
            obj[col.header] = row[col.id];
          });
          return obj;
        });
        return JSON.stringify(exported, null, 2);
      }

      self.onmessage = function(e) {
        const { type, data, payload, id } = e.data;
        
        try {
          let result;
          
          switch (type) {
            case 'FULL_PROCESS':
              let processed = data;
              
              if (payload.filters || payload.globalFilter) {
                processed = filterData(processed, payload.filters, payload.globalFilter);
              }
              
              if (payload.sorting) {
                processed = sortData(processed, payload.sorting);
              }
              
              result = {
                filtered: processed,
                paginated: payload.pageIndex !== undefined 
                  ? paginateData(processed, payload.pageIndex, payload.pageSize)
                  : processed,
                totalRows: processed.length
              };
              break;
              
            case 'EXPORT_CSV':
              result = exportToCSV(data, payload.columns);
              break;
              
            case 'EXPORT_JSON':
              result = exportToJSON(data, payload.columns);
              break;
              
            default:
              throw new Error('Unknown operation: ' + type);
          }
          
          self.postMessage({ type: 'SUCCESS', result, requestType: type, id });
        } catch (error) {
          self.postMessage({ 
            type: 'ERROR', 
            error: error.message,
            requestType: type,
            id
          });
        }
      };
    `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);

        worker.onmessage = (e) => {
            const { type, result, error, id } = e.data;

            if (pendingCallbacks.current.has(id)) {
                const { resolve, reject } = pendingCallbacks.current.get(id);
                pendingCallbacks.current.delete(id);

                if (type === 'SUCCESS') {
                    resolve(result);
                } else {
                    reject(new Error(error));
                }
            }
        };

        worker.onerror = (error) => {
            console.error('Worker error:', error);
        };

        workerRef.current = worker;
        setIsReady(true);

        return () => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
        };
    }, []);

    const processData = useCallback((type, data, payload) => {
        return new Promise((resolve, reject) => {
            if (!workerRef.current || !isReady) {
                reject(new Error('Worker not ready'));
                return;
            }

            const id = requestId.current++;
            pendingCallbacks.current.set(id, { resolve, reject });

            workerRef.current.postMessage({ type, data, payload, id });
        });
    }, [isReady]);

    return {
        isReady,
        processData
    };
}