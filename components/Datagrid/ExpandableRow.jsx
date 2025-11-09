import React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function ExpandableRow({ row, children, renderSubComponent }) {
  return (
    <>
      {children}
      <AnimatePresence>
        {row.getIsExpanded() && renderSubComponent && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <td colSpan={row.getVisibleCells().length} className="p-0">
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                className="bg-slate-50 border-t border-b p-4"
              >
                {renderSubComponent({ row })}
              </motion.div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

export function ExpandButton({ row }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        row.toggleExpanded();
      }}
      className="p-1 hover:bg-slate-100 rounded transition-colors"
      aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
    >
      {row.getIsExpanded() ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  );
}

// Sub-row detail component example
export function DetailPanel({ row }) {
  const data = row.original;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-semibold text-sm text-slate-700 mb-2">Details</h4>
        <div className="space-y-2 text-sm">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex">
              <span className="font-medium text-slate-600 w-32">{key}:</span>
              <span className="text-slate-900">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-sm text-slate-700 mb-2">Additional Info</h4>
        <div className="text-sm text-slate-600">
          <p>Created: {new Date().toLocaleDateString()}</p>
          <p>Last Modified: {new Date().toLocaleDateString()}</p>
          <p>Status: Active</p>
        </div>
      </div>
    </div>
  );
}

export default { ExpandableRow, ExpandButton, DetailPanel };