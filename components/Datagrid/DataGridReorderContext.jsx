import React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableHeader({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <th
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="cursor-grab select-none p-2 text-sm font-semibold whitespace-nowrap"
    >
      {children}
    </th>
  );
}

export default function DataGridReorderContext({
  columnOrder,
  setColumnOrder,
  children,
}) {
  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setColumnOrder((old) => {
        const oldIndex = old.indexOf(active.id);
        const newIndex = old.indexOf(over.id);
        return arrayMove(old, oldIndex, newIndex);
      });
    }
  };
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={columnOrder}
        strategy={horizontalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}
