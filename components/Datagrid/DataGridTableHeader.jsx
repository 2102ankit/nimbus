// DataGridTableHeader.jsx
import { closestCenter, DndContext, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { flexRender } from "@tanstack/react-table";
import { motion } from "motion/react";
import { NoDragOnResizerSensor } from "./NoDragOnResizerSensor";

function SortableHeaderCell({ header, isPinned, leftPos, rightPos, getDensityPadding, getHeaderBorderClasses, focusedColumnIndex }) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: header.column.id,
    disabled: !header.column.columnDef.ena || header.column.columnDef.enableReordering === false,
  });

  const isFocused = !isPinned && focusedColumnIndex !== null && (() => {
    const table = header.getContext().table;
    const nonPinnedColumns = table.getVisibleLeafColumns()
      .filter(c => c.id !== 'select' && c.id !== 'expand' && !c.getIsPinned());
    const columnIndexInNonPinned = nonPinnedColumns.findIndex(c => c.id === header.column.id);
    return columnIndexInNonPinned === focusedColumnIndex;
  })();

  // Check if this column is right before a right-pinned column
  const table = header.getContext().table;
  const allColumns = table.getVisibleLeafColumns();
  const currentIndex = allColumns.findIndex(c => c.id === header.column.id);
  const nextColumn = allColumns[currentIndex + 1];
  const isBeforeRightPinned = nextColumn && nextColumn.getIsPinned() === 'right';

  return (
    <motion.th
      ref={setNodeRef}
      data-column-id={header.column.id}
      {...attributes}
      {...listeners}
      style={{
        opacity: isDragging ? 0.9 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 50 : isPinned ? 30 : 20,
        position: "sticky",
        top: 0,
        backgroundColor: "var(--color-card)",
        color: "var(--color-foreground)",
        width: header.getSize(),
        minWidth: header.getSize(),
        maxWidth: header.getSize(),
        left: leftPos !== undefined ? `${leftPos}px` : undefined,
        right: rightPos !== undefined ? `${rightPos}px` : undefined,
        borderBottom: "2px solid var(--color-border)",
        borderRight: isBeforeRightPinned ? 'none' : undefined, // Remove border if before right-pinned
        boxShadow: isPinned
          ? isPinned === "left"
            ? "2px 0 8px rgba(0,0,0,0.1)"
            : "-2px 0 8px rgba(0,0,0,0.1)"
          : isFocused
            ? "inset 0 0 0 2px var(--color-primary)"
            : "none",
      }}
      className={`text-left align-middle font-bold relative ${getDensityPadding()} ${!isPinned && !isBeforeRightPinned ? getHeaderBorderClasses() : ''
        } ${isPinned === "left" ? "pinned-left-border" : isPinned === "right" ? "pinned-right-border" : ""
        } ${isBeforeRightPinned ? 'before-right-pinned' : ''}`}
    >
      {
        header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())
      }
    </motion.th >
  );
}

export function DataGridTableHeader({
  table,
  getDensityPadding,
  getHeaderBorderClasses,
  getLeftPosition,
  getRightPosition,
  focusedColumnIndex,
}) {
  const sensors = useSensors(
    useSensor(NoDragOnResizerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // ONLY CENTER COLUMNS – NEVER PINNED, NEVER SPECIAL
  const reorderableIds = table
    .getCenterLeafColumns()
    .filter((c) => c.id !== "select" && c.id !== "expand")
    .map((c) => c.id);

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;

    // Only allow reordering of center columns (not pinned, not select/expand)
    if (!reorderableIds.includes(activeId) || !reorderableIds.includes(overId)) {
      return;
    }

    table.setColumnOrder((prev) => {
      // If columnOrder is empty, initialize with all column IDs
      const currentOrder = prev.length > 0
        ? prev
        : table.getAllLeafColumns().map(c => c.id);

      const newOrder = [...currentOrder];
      const fromIndex = newOrder.indexOf(activeId);
      const toIndex = newOrder.indexOf(overId);

      // Safety check
      if (fromIndex === -1 || toIndex === -1) {
        return currentOrder;
      }

      // Perform the reorder
      newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, activeId);

      return newOrder;
    });
  };

  return (
    <thead className="sticky top-0 z-20 border-b-2 border-border" style={{ background: "var(--color-background)" }}>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragOver={handleDragOver}
          >
            <SortableContext
              items={reorderableIds}
              strategy={horizontalListSortingStrategy}
            >
              {headerGroup.headers.map((header) => {
                const isPinned = header.column.getIsPinned();
                const leftPos = isPinned === "left" ? getLeftPosition(header.column) : undefined;
                const rightPos = isPinned === "right" ? getRightPosition(header.column) : undefined;
                return <SortableHeaderCell
                  key={header.id}
                  header={header}
                  isPinned={isPinned}
                  leftPos={leftPos}
                  rightPos={rightPos}
                  getDensityPadding={getDensityPadding}
                  getHeaderBorderClasses={getHeaderBorderClasses}
                  focusedColumnIndex={focusedColumnIndex}
                />
              })}
            </SortableContext>
          </DndContext>
        </tr>
      ))}
    </thead>
  );
}