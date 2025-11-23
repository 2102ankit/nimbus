// DataGridTableHeader.jsx
import { closestCenter, DndContext, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender } from "@tanstack/react-table";
import { NoDragOnResizerSensor } from "./NoDragOnResizerSensor";
import { useState } from "react";

function SortableHeaderCell({ header, isPinned, leftPos, rightPos, getDensityPadding, getHeaderBorderClasses, focusedColumnIndex, isDraggingAny }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: header.column.id,
    disabled: isPinned || header.column.id === 'select' || header.column.id === 'expand',
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
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

  // Smooth transform with CSS
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : isPinned ? 30 : 20,
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
    borderRight: isBeforeRightPinned ? 'none' : undefined,
    boxShadow: isPinned
      ? isPinned === "left"
        ? "2px 0 8px rgba(0,0,0,0.1)"
        : "-2px 0 8px rgba(0,0,0,0.1)"
      : isFocused
        ? "inset 0 0 0 2px var(--color-primary)"
        : isDragging
          ? "0 10px 30px rgba(0, 0, 0, 0.2)"
          : "none",
    cursor: isDragging ? 'grabbing' : isPinned ? 'default' : 'grab',
    userSelect: 'none',
    willChange: isDraggingAny ? 'transform' : 'auto',
  };

  return (
    <th
      ref={setNodeRef}
      data-column-id={header.column.id}
      {...attributes}
      {...listeners}
      style={style}
      className={`text-left align-middle font-bold relative ${getDensityPadding()} ${!isPinned && !isBeforeRightPinned ? getHeaderBorderClasses() : ''
        } ${isPinned === "left" ? "pinned-left-border" : isPinned === "right" ? "pinned-right-border" : ""
        } ${isBeforeRightPinned ? 'before-right-pinned' : ''}`}
    >
      {
        header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())
      }
    </th>
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
  const [activeId, setActiveId] = useState(null);

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

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

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

  const handleDragEnd = () => {
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <thead className="sticky top-0 z-20 border-b-2 border-border" style={{ background: "var(--color-background)" }}>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
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
                  isDraggingAny={activeId !== null}
                />
              })}
            </SortableContext>
          </DndContext>
        </tr>
      ))}
    </thead>
  );
}

export default DataGridTableHeader;