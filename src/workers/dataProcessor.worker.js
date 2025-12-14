// Web Worker for data processing operations
/* eslint-disable no-restricted-globals */

// Sorting functions
function sortData(data, sorting) {
    if (!sorting || sorting.length === 0) return data;

    return [...data].sort((a, b) => {
        for (const sort of sorting) {
            const { id, desc } = sort;
            const aVal = a[id];
            const bVal = b[id];

            if (aVal === bVal) continue;

            // Handle null/undefined
            if (aVal == null) return desc ? -1 : 1;
            if (bVal == null) return desc ? 1 : -1;

            // Compare values
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                const comparison = aVal.localeCompare(bVal, undefined, { numeric: true });
                return desc ? -comparison : comparison;
            }

            const comparison = aVal < bVal ? -1 : 1;
            return desc ? -comparison : comparison;
        }
        return 0;
    });
}

// Filtering functions
function filterData(data, filters, globalFilter) {
    let filtered = data;

    // Apply global filter
    if (globalFilter && globalFilter.trim()) {
        const searchLower = globalFilter.toLowerCase();
        filtered = filtered.filter(row => {
            return Object.values(row).some(value => {
                if (value == null) return false;
                return String(value).toLowerCase().includes(searchLower);
            });
        });
    }

    // Apply column filters
    if (filters && filters.length > 0) {
        filtered = filtered.filter(row => {
            return filters.every(filter => {
                const { id, value } = filter;
                const cellValue = row[id];

                if (!value) return true;

                const { operator, value: filterValue, dataType } = value;

                // Handle empty/not empty
                if (operator === 'isEmpty') {
                    return cellValue == null || String(cellValue).trim() === '';
                }
                if (operator === 'isNotEmpty') {
                    return cellValue != null && String(cellValue).trim() !== '';
                }

                // Type-specific filtering
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

                // Text filtering
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

// Grouping function
function groupData(data, grouping) {
    if (!grouping || grouping.length === 0) return data;

    const grouped = {};

    data.forEach(row => {
        let currentLevel = grouped;

        grouping.forEach((groupKey, index) => {
            const groupValue = row[groupKey] || 'Unknown';

            if (!currentLevel[groupValue]) {
                currentLevel[groupValue] = {
                    _group: true,
                    _groupKey: groupKey,
                    _groupValue: groupValue,
                    _items: [],
                    _children: {}
                };
            }

            if (index === grouping.length - 1) {
                currentLevel[groupValue]._items.push(row);
            } else {
                currentLevel = currentLevel[groupValue]._children;
            }
        });
    });

    return grouped;
}

// Pagination
function paginateData(data, pageIndex, pageSize) {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
}

// Export functions
function exportToCSV(data, columns) {
    const headers = columns.map(col => col.header).join(',');
    const rows = data.map(row =>
        columns.map(col => {
            const value = row[col.id];
            const str = String(value ?? '');
            return str.includes(',') || str.includes('"') || str.includes('\n')
                ? `"${str.replace(/"/g, '""')}"`
                : str;
        }).join(',')
    ).join('\n');

    return headers + '\n' + rows;
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

// Message handler
self.onmessage = function (e) {
    const { type, data, payload } = e.data;

    try {
        let result;

        switch (type) {
            case 'SORT':
                result = sortData(data, payload.sorting);
                break;

            case 'FILTER':
                result = filterData(data, payload.filters, payload.globalFilter);
                break;

            case 'SORT_AND_FILTER':
                let processed = filterData(data, payload.filters, payload.globalFilter);
                processed = sortData(processed, payload.sorting);
                result = processed;
                break;

            case 'PAGINATE':
                result = paginateData(data, payload.pageIndex, payload.pageSize);
                break;

            case 'GROUP':
                result = groupData(data, payload.grouping);
                break;

            case 'EXPORT_CSV':
                result = exportToCSV(data, payload.columns);
                break;

            case 'EXPORT_JSON':
                result = exportToJSON(data, payload.columns);
                break;

            case 'FULL_PROCESS':
                // Complete data processing pipeline
                let fullProcessed = data;

                // Filter
                if (payload.filters || payload.globalFilter) {
                    fullProcessed = filterData(fullProcessed, payload.filters, payload.globalFilter);
                }

                // Sort
                if (payload.sorting) {
                    fullProcessed = sortData(fullProcessed, payload.sorting);
                }

                result = {
                    filtered: fullProcessed,
                    paginated: payload.pageIndex !== undefined
                        ? paginateData(fullProcessed, payload.pageIndex, payload.pageSize)
                        : fullProcessed,
                    totalRows: fullProcessed.length
                };
                break;

            default:
                throw new Error(`Unknown operation: ${type}`);
        }

        self.postMessage({ type: 'SUCCESS', result, requestType: type });
    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            error: error.message,
            requestType: type
        });
    }
};