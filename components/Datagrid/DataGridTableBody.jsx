import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { flexRender } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Layers, Loader2 } from "lucide-react";
import { Button } from "../ui/button";

// Loading State Component
export function LoadingState() {
  return (
    <tr>
      <td colSpan={100} className="p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading data...
          </p>
        </motion.div>
      </td>
    </tr>
  );
}

// Empty State Component
export function EmptyState() {
  return (
    <tr>
      <td colSpan={100} className="p-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="rounded-full p-5 mb-4 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
            <svg
              className="h-12 w-12 text-slate-400 dark:text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-100">
            No results found
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Try adjusting your filters or search
          </p>
        </motion.div>
      </td>
    </tr>
  );
}

// Group Row Component
export function GroupRow({ row, getDensityPadding }) {
  return (
    <motion.tr
      key={row.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="font-semibold bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 hover:from-slate-200 hover:to-slate-100 dark:hover:from-slate-600 dark:hover:to-slate-700 border-b-2 border-slate-300 dark:border-slate-600 transition-all"
    >
      <td
        colSpan={row.getVisibleCells().length}
        className={getDensityPadding()}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => row.toggleExpanded()}
            className="p-1.5 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            )}
          </button>
          <Layers className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span className="text-slate-900 dark:text-slate-100">
            {row.groupingColumnId}:{" "}
            <strong className="text-blue-700 dark:text-blue-400">
              {row.groupingValue}
            </strong>
          </span>
          <span className="text-sm ml-2 px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium">
            {row.subRows.length} {row.subRows.length === 1 ? "item" : "items"}
          </span>
        </div>
      </td>
    </motion.tr>
  );
}

// Data Row Component
export function DataRow({
  row,
  idx,
  getDensityPadding,
  getCellBorderClasses,
  getLeftPosition,
  getRightPosition,
}) {
  const isGrouped = row.getIsGrouped();

  if (isGrouped) {
    return <GroupRow row={row} getDensityPadding={getDensityPadding} />;
  }

  return (
    <React.Fragment key={row.id}>
      <motion.tr
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15, delay: idx * 0.01 }}
        className={`transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
          row.getIsSelected()
            ? "bg-blue-50 dark:bg-blue-950/50 border-l-4 border-l-blue-500 dark:border-l-blue-400"
            : ""
        }`}
      >
        {row.getVisibleCells().map((cell) => {
          const isPinned = cell.column.getIsPinned();
          const leftPos =
            isPinned === "left" ? getLeftPosition(cell.column) : undefined;
          const rightPos =
            isPinned === "right" ? getRightPosition(cell.column) : undefined;

          return (
            <td
              key={cell.id}
              className={`align-middle text-slate-700 dark:text-slate-300 ${getDensityPadding()} ${getCellBorderClasses()} ${
                isPinned
                  ? `sticky z-10 bg-white dark:bg-slate-800 ${
                      row.getIsSelected()
                        ? "bg-blue-50 dark:bg-blue-950/50"
                        : ""
                    } ${
                      isPinned === "left"
                        ? "shadow-[2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.2)]"
                        : "shadow-[-2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[-2px_0_5px_rgba(0,0,0,0.2)]"
                    }`
                  : ""
              }`}
              style={{
                width: cell.column.getSize(),
                minWidth: cell.column.getSize(),
                maxWidth: cell.column.getSize(),
                left: leftPos !== undefined ? `${leftPos}px` : undefined,
                right: rightPos !== undefined ? `${rightPos}px` : undefined,
              }}
            >
              {cell.getIsGrouped() ? (
                <button
                  onClick={() => row.toggleExpanded()}
                  className="flex items-center gap-2 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {row.getIsExpanded() ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  {flexRender(cell.column.columnDef.cell, cell.getContext())} (
                  {row.subRows.length})
                </button>
              ) : cell.getIsAggregated() ? (
                flexRender(
                  cell.column.columnDef.aggregatedCell ??
                    cell.column.columnDef.cell,
                  cell.getContext(),
                )
              ) : cell.getIsPlaceholder() ? null : (
                flexRender(cell.column.columnDef.cell, cell.getContext())
              )}
            </td>
          );
        })}
      </motion.tr>

      {row.getIsExpanded() && !isGrouped && (
        <motion.tr
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <td colSpan={row.getVisibleCells().length} className="p-0">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/30 border-y-2 border-blue-200 dark:border-blue-800 p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-sm mb-3 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Full Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(row.original).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="font-semibold w-32 text-slate-600 dark:text-slate-400">
                          {key}:
                        </span>
                        <span className="text-slate-900 dark:text-slate-100 font-medium">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-3 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Actions
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" className="shadow-sm">
                      View Profile
                    </Button>
                    <Button size="sm" variant="outline" className="shadow-sm">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="shadow-sm">
                      Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="shadow-sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </motion.tr>
      )}
    </React.Fragment>
  );
}

// Table Body Component
export function DataGridTableBody({
  table,
  loading,
  isEmpty,
  getDensityPadding,
  getCellBorderClasses,
  getLeftPosition,
  getRightPosition,
}) {
  if (loading) {
    return (
      <tbody className="bg-white dark:bg-slate-800">
        <LoadingState />
      </tbody>
    );
  }

  if (isEmpty) {
    return (
      <tbody className="bg-white dark:bg-slate-800">
        <EmptyState />
      </tbody>
    );
  }

  return (
    <tbody className="bg-white dark:bg-slate-800">
      <AnimatePresence mode="popLayout">
        {table.getRowModel().rows.map((row, idx) => (
          <DataRow
            key={row.id}
            row={row}
            idx={idx}
            getDensityPadding={getDensityPadding}
            getCellBorderClasses={getCellBorderClasses}
            getLeftPosition={getLeftPosition}
            getRightPosition={getRightPosition}
          />
        ))}
      </AnimatePresence>
    </tbody>
  );
}

export default DataGridTableBody;
