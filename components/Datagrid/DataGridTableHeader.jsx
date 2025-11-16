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
    <thead
      className="sticky top-0 z-20 border-b-2"
      style={{
        background: `var(--color-background)`,
        borderBottomColor: "var(--color-border)",
      }}
    >
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
                className={`text-left align-middle font-bold ${getDensityPadding()} ${getHeaderBorderClasses()} ${
                  isPinned ? "sticky z-30" : ""
                }
                  bg-card
                  `}
                style={{
                  color: "var(--color-foreground)",
                  width: header.getSize(),
                  minWidth: header.getSize(),
                  maxWidth: header.getSize(),
                  left: leftPos !== undefined ? `${leftPos}px` : undefined,
                  right: rightPos !== undefined ? `${rightPos}px` : undefined,
                  boxShadow: isPinned
                    ? isPinned === "left"
                      ? "2px 0 8px rgba(0,0,0,0.1)"
                      : "-2px 0 8px rgba(0,0,0,0.1)"
                    : "none",
                }}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
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
