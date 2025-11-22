// DataGridTableHeader.jsx
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender } from "@tanstack/react-table";
import { motion } from "framer-motion";

export function DataGridTableHeader({
  table,
  getDensityPadding,
  getHeaderBorderClasses,
  getLeftPosition,
  getRightPosition,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 2 } }),
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
                const { attributes, listeners, setNodeRef, isDragging } = useSortable({
                  id: header.column.id,
                });

                const isPinned = header.column.getIsPinned();
                const leftPos = isPinned === "left" ? getLeftPosition(header.column) : undefined;
                const rightPos = isPinned === "right" ? getRightPosition(header.column) : undefined;

                return (
                  <motion.th
                    ref={setNodeRef}
                    layout="position"
                    layoutRoot // Critical: makes this the animation root
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 40,
                      mass: 0.8,
                    }}
                    {...attributes}
                    {...listeners}
                    style={{
                      opacity: isDragging ? 0.7 : 1,
                      transform: isDragging ? CSS.Transform.toString({ x: 0, y: 0, scale: 1.02 }) : undefined,
                      zIndex: isDragging ? 50 : isPinned ? 30 : 1,
                      position: "relative",
                      background: isDragging ? "var(--color-primary)/0.1" : "inherit",
                      color: "var(--color-foreground)",
                      width: header.getSize(),
                      minWidth: header.getSize(),
                      maxWidth: header.getSize(),
                      left: leftPos ? `${leftPos}px` : undefined,
                      right: rightPos ? `${rightPos}px` : undefined,
                      boxShadow: isPinned
                        ? isPinned === "left"
                          ? "2px 0 8px rgba(0,0,0,0.1)"
                          : "-2px 0 8px rgba(0,0,0,0.1)"
                        : "none",
                    }}
                    className={`text-left align-middle font-bold ${getDensityPadding()} ${getHeaderBorderClasses()} ${isPinned ? "sticky z-30" : ""} bg-card`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </motion.th>
                );
              })}
            </SortableContext>
          </DndContext>
        </tr>
      ))}
    </thead>
  );
}