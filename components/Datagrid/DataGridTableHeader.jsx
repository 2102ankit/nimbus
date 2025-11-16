import React from "react";
import { flexRender } from "@tanstack/react-table";

export function DataGridTableHeader({
  table,
  getDensityPadding,
  getHeaderBorderClasses,
  getLeftPosition,
  getRightPosition,
}) {
  return (
    <thead className="sticky top-0 z-20 bg-gradient-to-r from-muted to-background border-b-2 border-border">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const isPinned = header.column.getIsPinned();
            const leftPos =
              isPinned === "left" ? getLeftPosition(header.column) : undefined;
            const rightPos =
              isPinned === "right"
                ? getRightPosition(header.column)
                : undefined;

            return (
              <th
                key={header.id}
                className={`text-left align-middle font-bold text-slate-700 dark:text-slate-300 ${getDensityPadding()} ${getHeaderBorderClasses()} ${
                  isPinned
                    ? `sticky z-30 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 ${
                        isPinned === "left"
                          ? "shadow-[2px_0_8px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_8px_rgba(0,0,0,0.3)]"
                          : "shadow-[-2px_0_8px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_8px_rgba(0,0,0,0.3)]"
                      }`
                    : ""
                }`}
                style={{
                  width: header.getSize(),
                  minWidth: header.getSize(),
                  maxWidth: header.getSize(),
                  left: leftPos !== undefined ? `${leftPos}px` : undefined,
                  right: rightPos !== undefined ? `${rightPos}px` : undefined,
                }}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}

export default DataGridTableHeader;
