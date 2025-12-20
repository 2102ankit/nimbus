import { Button } from "@/components/ui/button";
import { flexRender } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Layers, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { useTheme } from "@/components/ThemeProvider";

// Loading State Component
export function LoadingState({ minHeight = 300 }) {
  return (
    <tr>
      <td colSpan={100} className="p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center"
          style={{ height: `${minHeight}px` }}
        >
          <Loader2
            className="h-10 w-10 animate-spin mb-4"
            style={{ color: "var(--color-primary)" }}
          />
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-muted-foreground)" }}
          >
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
          <div
            className="rounded-full p-5 mb-4 border-2"
            style={{
              backgroundColor:
                "color-mix(in oklch, var(--color-muted), transparent 90%)",
              borderColor:
                "color-mix(in oklch, var(--color-border), transparent 50%)",
            }}
          >
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3
            className="text-lg font-bold mb-1"
            style={{ color: "var(--color-foreground)" }}
          >
            No results found
          </h3>
          <p
            className="text-sm"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Try adjusting your filters or search
          </p>
        </motion.div>
      </td>
    </tr>
  );
}

// Group Row Component
export function GroupRow({ row, getDensityPadding, table }) {
  const depth = row.depth || 0;
  const indentPx = depth * 32 * 0;

  return (
    <tr
      className="font-semibold border-b-2 transition-all"
      style={{
        background: `linear-gradient(to right, 
          color-mix(in oklch, var(--color-muted), transparent 90%), 
          color-mix(in oklch, var(--color-muted), transparent 95%))`,
        borderBottomColor: "var(--color-border)",
      }}
    >
      {row.getVisibleCells().map((cell) => {
        const isPinned = cell.column.getIsPinned();
        const leftPos = isPinned === "left" ? getLeftPosition(cell.column, table) : undefined;
        const rightPos = isPinned === "right" ? getRightPosition(cell.column, table) : undefined;
        const isGroupedCell = cell.getIsGrouped();

        return (
          <td
            key={cell.id}
            className={getDensityPadding()}
            style={{
              position: isPinned ? 'sticky' : 'relative',
              left: leftPos !== undefined ? `${leftPos}px` : undefined,
              right: rightPos !== undefined ? `${rightPos}px` : undefined,
              backgroundColor: isPinned ? 'var(--color-muted)' : 'transparent',
              zIndex: isPinned ? 10 : 1,
            }}
          >
            {isGroupedCell ? (
              <div className="flex items-center gap-3" style={{ paddingLeft: `${indentPx}px` }}>
                <button
                  onClick={() => row.toggleExpanded()}
                  className="p-1.5 rounded-md transition-colors"
                  style={{
                    backgroundColor: "transparent",
                  }}
                >
                  {row.getIsExpanded() ? (
                    <ChevronDown
                      className="h-4 w-4"
                      style={{ color: "var(--color-foreground)" }}
                    />
                  ) : (
                    <ChevronRight
                      className="h-4 w-4"
                      style={{ color: "var(--color-foreground)" }}
                    />
                  )}
                </button>
                <Layers
                  className="h-4 w-4"
                  style={{ color: "var(--color-muted-foreground)" }}
                />
                <span style={{ color: "var(--color-foreground)" }}>
                  {cell.column.columnDef.meta?.headerText || cell.column.id}:{" "}
                  <strong style={{ color: "var(--color-primary)" }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </strong>
                </span>
                <span
                  className="text-sm ml-2 px-2.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: "var(--color-muted)",
                    color: "var(--color-muted-foreground)",
                  }}
                >
                  {row.subRows.length} {row.subRows.length === 1 ? "item" : "items"}
                </span>
              </div>
            ) : cell.getIsAggregated() ? (
              <div>
                {flexRender(
                  cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                  cell.getContext()
                )}
              </div>
            ) : cell.getIsPlaceholder() ? null : (
              flexRender(cell.column.columnDef.cell, cell.getContext())
            )}
          </td>
        );
      })}
    </tr>
  );
}

// Helper functions for pinned columns
function getLeftPosition(column, table) {
  const leftPinnedColumns = table.getState().columnPinning.left || [];
  const index = leftPinnedColumns.indexOf(column.id);
  if (index === -1) return 0;

  let left = 0;
  for (let i = 0; i < index; i++) {
    const col = table.getAllLeafColumns().find((c) => c.id === leftPinnedColumns[i]);
    if (col) left += col.getSize();
  }
  return left;
}

function getRightPosition(column, table) {
  const rightPinnedColumns = table.getState().columnPinning.right || [];
  const index = rightPinnedColumns.indexOf(column.id);
  if (index === -1) return 0;

  let right = 0;
  for (let i = index + 1; i < rightPinnedColumns.length; i++) {
    const col = table.getAllLeafColumns().find((c) => c.id === rightPinnedColumns[i]);
    if (col) right += col.getSize();
  }
  return right;
}

// Data Row Component
export function DataRow({
  row,
  idx,
  getDensityPadding,
  getCellBorderClasses,
  getLeftPosition,
  getRightPosition,
  table
}) {
  const { showStripedColumns } = useTheme();
  const isGrouped = row.getIsGrouped();

  if (isGrouped) {
    return <GroupRow row={row} getDensityPadding={getDensityPadding} table={table} />;
  }

  return (
    <React.Fragment>
      <tr
        style={{
          backgroundColor: row.getIsSelected()
            ? "color-mix(in oklch, var(--color-primary), transparent 95%)"
            : showStripedColumns && idx % 2 === 1
              ? "var(--color-muted)" // Striped effect
              : "transparent",
          borderLeft: row.getIsSelected()
            ? `4px solid var(--color-primary)`
            : "none",
        }}
      >
        {row.getVisibleCells().map((cell) => {
          const isPinned = cell.column.getIsPinned();
          const leftPos =
            isPinned === "left" ? getLeftPosition(cell.column) : undefined;
          const rightPos =
            isPinned === "right" ? getRightPosition(cell.column) : undefined;

          const allColumns = table.getVisibleLeafColumns();
          const currentIndex = allColumns.findIndex(c => c.id === cell.column.id);
          const nextColumn = allColumns[currentIndex + 1];
          const isBeforeRightPinned = nextColumn && nextColumn.getIsPinned() === 'right';

          return (
            <motion.td
              layout="position"
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 40,
                mass: 0.8,
              }}
              key={cell.id}
              className={`align-middle relative ${getDensityPadding()} ${!isPinned && !isBeforeRightPinned ? getCellBorderClasses() : ''
                } ${isPinned ? "sticky z-10" : ""} ${isPinned === "left" ? "pinned-left-border" : isPinned === "right" ? "pinned-right-border" : ""
                } ${isBeforeRightPinned ? 'before-right-pinned' : ''}`}
              style={{
                color: "var(--color-foreground)",
                width: cell.column.getSize(),
                minWidth: cell.column.getSize(),
                maxWidth: cell.column.getSize(),
                left: leftPos !== undefined ? `${leftPos}px` : undefined,
                right: rightPos !== undefined ? `${rightPos}px` : undefined,
                backgroundColor: isPinned
                  ? row.getIsSelected()
                    ? "color-mix(in oklch, var(--color-primary), transparent 95%)"
                    : showStripedColumns && idx % 2 === 1
                      ? "var(--color-muted)"
                      : "var(--color-card)"
                  : "inherit",
                borderBottom: "1px solid var(--color-border)",
                borderRight: isBeforeRightPinned ? 'none' : undefined,
                boxShadow: isPinned
                  ? isPinned === "left"
                    ? "2px 0 5px rgba(0,0,0,0.05)"
                    : "-2px 0 5px rgba(0,0,0,0.05)"
                  : "none",
              }}
            >
              {cell.getIsGrouped() ? (
                <button
                  onClick={() => row.toggleExpanded()}
                  className="flex items-center gap-2 font-semibold transition-colors"
                  style={{
                    color: "var(--color-foreground)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--color-primary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--color-foreground)")
                  }
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
                  cell.getContext()
                )
              ) : cell.getIsPlaceholder() ? null : (
                flexRender(cell.column.columnDef.cell, cell.getContext())
              )}
            </motion.td>
          );
        })}
      </tr>

      {row.getIsExpanded() && !isGrouped && (
        <tr>
          <td colSpan={row.getVisibleCells().length} className="p-0">
            <div
              className="border-y-2 p-6"
              style={{
                background: `linear-gradient(to right, 
                  color-mix(in oklch, var(--color-muted), transparent 95%), 
                  color-mix(in oklch, var(--color-primary), transparent 95%))`,
                borderColor:
                  "color-mix(in oklch, var(--color-primary), transparent 80%)",
              }}
            >
              <div className="flex gap-92">
                <div>
                  <h4
                    className="font-bold text-sm mb-3 flex items-center gap-2"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    <svg
                      className="h-4 w-6"
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
                    <span>Full Details</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(row.original).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span
                          className="font-semibold w-32"
                          style={{ color: "var(--color-muted-foreground)" }}
                        >
                          {key}:
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "var(--color-foreground)" }}
                        >
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4
                    className="font-bold text-sm mb-3 flex items-center gap-2"
                    style={{ color: "var(--color-foreground)" }}
                  >
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
                    <Button size="sm" variant="secondary" className="shadow-sm">
                      Edit
                    </Button>
                    <Button size="sm" variant="secondary" className="shadow-sm">
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
        </tr>
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
  minRows = 10,
}) {
  if (loading) {
    return (
      <tbody style={{ backgroundColor: "var(--color-card)" }}>
        <LoadingState minHeight={minRows * 48} />
      </tbody>
    );
  }

  if (isEmpty) {
    return (
      <tbody style={{ backgroundColor: "var(--color-card)" }}>
        <EmptyState />
      </tbody>
    );
  }

  return (
    <tbody style={{ backgroundColor: "var(--color-card)" }}>
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
            table={table}
          />
        ))}
      </AnimatePresence>
    </tbody>
  );
}

export default DataGridTableBody;