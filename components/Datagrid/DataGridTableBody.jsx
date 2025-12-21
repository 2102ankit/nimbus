import { Button } from "@/components/ui/button";
import { flexRender } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Layers, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RowDragProvider } from "./RowDragContext";

// Loading State Component
export function LoadingState({ minHeight = 300 }) {
  return (
    <tr>
      <td colSpan={100} className="p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center"
          style={{ height: minHeight }}
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
export function GroupRow({ row, getDensityPadding, table, getLeftPosition, getRightPosition }) {
  const depth = row.depth || 0;
  const indentPx = depth * 32;

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
        const leftPos = isPinned === "left" ? getLeftPosition(cell.column) : undefined;
        const rightPos = isPinned === "right" ? getRightPosition(cell.column) : undefined;
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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
    disabled: isGrouped,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    zIndex: isDragging ? 20 : 1,
    backgroundColor: row.getIsSelected()
      ? "color-mix(in oklch, var(--color-primary), transparent 95%)"
      : showStripedColumns && idx % 2 === 1
        ? "var(--color-muted)"
        : "transparent",
    borderLeft: row.getIsSelected()
      ? "4px solid var(--color-primary)"
      : "none",
  };

  if (isGrouped) {
    return <GroupRow row={row} getDensityPadding={getDensityPadding} table={table} getLeftPosition={getLeftPosition} getRightPosition={getRightPosition} />;
  }

  return (
    <RowDragProvider value={{ attributes, listeners }}>
      <React.Fragment>
        <tr
          ref={setNodeRef}
          style={style}
          className={`${row.getIsPinned() ? `sticky-pinned-row sticky-pinned-row-${row.getIsPinned()}` : ""}`}
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
                  } ${isBeforeRightPinned ? 'before-right-pinned' : ''} ${row.getIsPinned() ? `sticky z-20 sticky-pinned-td sticky-pinned-td-${row.getIsPinned()}` : ""}`}
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
                  boxShadow: "none",
                }}
              >
                {cell.getIsGrouped() ? (
                  <button
                    onClick={() => row.toggleExpanded()}
                    className="flex items-center gap-2 font-semibold transition-colors"
                    style={{
                      color: "var(--color-foreground)",
                    }}
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
                <div className="flex gap-8">
                  <div className="flex-1">
                    <h4
                      className="font-bold text-sm mb-3 flex items-center gap-2"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      <Layers className="h-4 w-4" />
                      <span>Full Details</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <div className="w-64">
                    <h4
                      className="font-bold text-sm mb-3 flex items-center gap-2"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      <ChevronRight className="h-4 w-4" />
                      Actions
                    </h4>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="w-full shadow-sm">
                        View Profile
                      </Button>
                      <Button size="sm" variant="secondary" className="w-full shadow-sm">
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full shadow-sm"
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
    </RowDragProvider>
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
  onRowReorder,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      onRowReorder && onRowReorder(active.id, over.id);
    }
  };

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <tbody style={{ backgroundColor: "var(--color-card)" }}>
        <SortableContext
          items={table.getRowModel().rows.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            {/* Top Pinned Rows */}
            {table.getTopRows().map((row, idx) => (
              <DataRow
                key={`top-${row.id}`}
                row={row}
                idx={idx}
                getDensityPadding={getDensityPadding}
                getCellBorderClasses={getCellBorderClasses}
                getLeftPosition={getLeftPosition}
                getRightPosition={getRightPosition}
                table={table}
              />
            ))}

            {/* Center Rows */}
            {(table.getPaginationRowModel()?.rows || table.getRowModel().rows)
              .filter(r => !r.getIsPinned())
              .map((row, idx) => (
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

            {/* Bottom Pinned Rows */}
            {table.getBottomRows().map((row, idx) => (
              <DataRow
                key={`bottom-${row.id}`}
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
        </SortableContext>
      </tbody>
    </DndContext>
  );
}

export default DataGridTableBody;