import React, { useState } from "react";
import { GripVertical, Pin, Filter, ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function DataGridHeader({ header, onPin, onFilter }) {
  const [showMenu, setShowMenu] = useState(false);

  const handlePinLeft = () => onPin("left", header.column.id);
  const handlePinRight = () => onPin("right", header.column.id);
  const handleUnpin = () => onPin(false, header.column.id);

  const isSorted = header.column.getIsSorted();

  return (
    <div className="relative">
      <div
        className="flex items-center gap-1 cursor-pointer select-none"
        onClick={header.column.getToggleSortingHandler()}
      >
        <GripVertical className="w-4 h-4 text-neutral-400" />
        {header.column.columnDef.header}
        {isSorted === "asc" && <ArrowUp className="h-3 w-3" />}
        {isSorted === "desc" && <ArrowDown className="h-3 w-3" />}
        <Filter
          className="h-3.5 w-3.5 ml-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        />
      </div>

      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-0 z-10 mt-1 w-44 rounded-lg bg-white dark:bg-neutral-800 shadow-md border border-neutral-200 dark:border-neutral-700 p-2 space-y-2"
        >
          {header.column.columnDef.enableColumnFilter &&
            (header.column.columnDef.filterVariant === "select" ? (
              <Select
                multiple={header.column.columnDef.filterMulti}
                value={header.column.getFilterValue() ?? []}
                onChange={(e) => {
                  const val = Array.from(e.target.selected).map((o) => o.value);
                  header.column.setFilterValue(val.length ? val : undefined);
                }}
              >
                {header.column.columnDef.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                type={
                  header.column.columnDef.filterVariant === "range"
                    ? "number"
                    : "text"
                }
                value={header.column.getFilterValue() ?? ""}
                onChange={(e) =>
                  header.column.setFilterValue(e.target.value || undefined)
                }
                placeholder="Filter..."
              />
            ))}

          <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-300 pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <button
              onClick={handlePinLeft}
              className="hover:underline flex items-center gap-1"
            >
              <Pin size={12} /> Left
            </button>
            <button onClick={handleUnpin} className="hover:underline">
              Unpin
            </button>
            <button
              onClick={handlePinRight}
              className="hover:underline flex items-center gap-1"
            >
              Right <Pin size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
