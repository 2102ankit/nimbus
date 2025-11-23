// DataGridTableHeader.jsx
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { flexRender } from "@tanstack/react-table";

const SortableHeaderCell = ({ header, isPinned, leftPos, rightPos, getDensityPadding, getHeaderBorderClasses, focusedColumnIndex }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: header.column.id,
  });
  
  const isFocused = !isPinned && focusedColumnIndex !== null && (() => {
    const table = header.getContext().table;
    const nonPinnedColumns = table.getVisibleLeafColumns()
      .filter(c => c.id !== 'select' && c.id !== 'expand' && !c.getIsPinned());
    const columnIndexInNonPinned = nonPinnedColumns.findIndex(c => c.id === header.column.id);
    return columnIndexInNonPinned === focusedColumnIndex;
  })();

  return (
    <th
      ref={setNodeRef}
      data-column-id={header.column.id}
      {...attributes}
      {...listeners}
      style={{
        opacity: isDragging ? 0.7 : 1,
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
        boxShadow: isPinned
          ? isPinned === "left"
            ? "2px 0 8px rgba(0,0,0,0.1)"
            : "-2px 0 8px rgba(0,0,0,0.1)"
          : "none",
      }}
      className={`text-left align-middle font-bold ${getDensityPadding()} ${getHeaderBorderClasses()}`}
    >
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}
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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  // Live reordering: update column order while dragging
  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeCol = table.getAllLeafColumns().find(c => c.id === active.id);
    const overCol = table.getAllLeafColumns().find(c => c.id === over.id);
    if (!activeCol || !overCol) return;

    // Move column in real time
    table.setColumnOrder((prev) => {
      const prevItems = Array.from(prev);
      const activeIndex = prevItems.indexOf(active.id);
      const overIndex = prevItems.indexOf(over.id);

      if (activeIndex === -1 || overIndex === -1) return prevItems;

      const newItems = [...prevItems];
      newItems.splice(activeIndex, 1);
      newItems.splice(overIndex, 0, active.id);

      return newItems;
    });
  };

  return (
    <thead className="sticky top-0 z-20 border-b-2" style={{ background: "var(--color-background)" }}>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragOver={handleDragOver}   // This enables live reordering
            onDragEnd={() => { }}          // Optional: cleanup if needed
          >
            <SortableContext
              items={headerGroup.headers.map(h => h.column.id)}
              strategy={horizontalListSortingStrategy}
            >
              {headerGroup.headers.map((header) => {
                const isPinned = header.column.getIsPinned();
                const leftPos = isPinned === "left" ? getLeftPosition(header.column) : undefined;
                const rightPos = isPinned === "right" ? getRightPosition(header.column) : undefined;
                return <SortableHeaderCell header={header} isPinned={isPinned} leftPos={leftPos} rightPos={rightPos} getDensityPadding={getDensityPadding} getHeaderBorderClasses={getHeaderBorderClasses}
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