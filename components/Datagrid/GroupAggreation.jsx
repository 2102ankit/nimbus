import React from "react";
import { ChevronRight, ChevronDown, Layers } from "lucide-react";
import { motion } from "motion/react";

// Aggregation functions
export const aggregationFns = {
  sum: (values) => values.reduce((sum, val) => sum + (Number(val) || 0), 0),
  avg: (values) => {
    const nums = values.filter(v => !isNaN(Number(v))).map(Number);
    return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  },
  count: (values) => values.length,
  min: (values) => Math.min(...values.filter(v => !isNaN(Number(v))).map(Number)),
  max: (values) => Math.max(...values.filter(v => !isNaN(Number(v))).map(Number)),
  unique: (values) => new Set(values).size,
};

// Group row component
export function GroupRow({ row, visibleCells }) {
  const groupValue = row.getValue(row.groupingColumnId);
  const aggregatedData = row.subRows.reduce((acc, subRow) => {
    visibleCells.forEach(cell => {
      const columnId = cell.column.id;
      const value = subRow.original[columnId];
      if (!acc[columnId]) acc[columnId] = [];
      acc[columnId].push(value);
    });
    return acc;
  }, {});
  
  return (
    <tr className="bg-slate-100 font-semibold hover:bg-slate-200">
      <td colSpan={visibleCells.length} className="p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => row.toggleExpanded()}
            className="p-1 hover:bg-slate-300 rounded transition-colors"
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <Layers className="h-4 w-4 text-slate-600" />
          <span className="text-slate-900">
            {row.groupingColumnId}: <strong>{groupValue}</strong>
          </span>
          <span className="text-slate-600 text-sm ml-2">
            ({row.subRows.length} {row.subRows.length === 1 ? 'item' : 'items'})
          </span>
          
          {/* Aggregations */}
          <div className="ml-auto flex gap-4 text-xs text-slate-600">
            {Object.entries(aggregatedData).map(([columnId, values]) => {
              if (columnId === 'select' || columnId === 'actions' || columnId === 'expand') return null;
              const sum = aggregationFns.sum(values);
              if (sum > 0 && columnId === 'salary') {
                return (
                  <span key={columnId}>
                    Total: <strong className="text-slate-900">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(sum)}
                    </strong>
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      </td>
    </tr>
  );
}

// Grouping controls
export function GroupingControls({ table, columns }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);
  
  const groupableColumns = columns.filter(c => 
    c.enableGrouping !== false && 
    c.id !== 'select' && 
    c.id !== 'actions' && 
    c.id !== 'expand'
  );
  
  const grouping = table.getState().grouping;
  
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-8 px-3 border border-slate-200 bg-white hover:bg-slate-100"
      >
        <Layers className="h-4 w-4 mr-2" />
        Group By {grouping.length > 0 && `(${grouping.length})`}
      </button>
      
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute left-0 z-50 mt-2 w-64 rounded-md border bg-white p-2 shadow-lg"
        >
          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase">
            Group by column
          </div>
          {groupableColumns.map((col) => {
            const isGrouped = grouping.includes(col.id);
            return (
              <label
                key={col.id}
                className="flex items-center gap-2 px-2 py-2 hover:bg-slate-100 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isGrouped}
                  onChange={() => {
                    if (isGrouped) {
                      table.setGrouping(grouping.filter(g => g !== col.id));
                    } else {
                      table.setGrouping([...grouping, col.id]);
                    }
                  }}
                  className="h-4 w-4"
                />
                <span className="capitalize text-sm">{col.id}</span>
              </label>
            );
          })}
          {grouping.length > 0 && (
            <>
              <div className="my-1 h-px bg-slate-100" />
              <button
                onClick={() => table.setGrouping([])}
                className="w-full text-left px-2 py-2 text-sm hover:bg-slate-100 rounded text-red-600"
              >
                Clear grouping
              </button>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default { GroupRow, GroupingControls, aggregationFns };