import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  EyeOff,
  GripVertical,
  Pin,
  PinOff,
} from "lucide-react";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { motion } from "motion/react";
import { AdvancedColumnFilter } from "../Datagrid/AdvancedColumnFilter";
import { Button } from "../ui/button";
export function ColumnHeader({
  header,
  column,
  title,
  table,
  dataType = "text",
  enableFilter = true,
  enableSort = true,
  enablePin = true,
  enableHide = true,
  enableResize = true,
  enableDrag = true,
  onDragStart,
  onDragEnd,
}) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", column.id);
    onDragStart?.(column.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain");
    if (sourceId !== column.id) {
      const currentOrder = table.getState().columnOrder;
      const sourceIndex = currentOrder.indexOf(sourceId);
      const targetIndex = currentOrder.indexOf(column.id);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        const newOrder = [...currentOrder];
        newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, sourceId);
        table.setColumnOrder(newOrder);
      }
    }
  };

  const isSorted = column.getIsSorted();
  const isPinned = column.getIsPinned();

  const SortIcon =
    isSorted === "asc"
      ? ArrowUp
      : isSorted === "desc"
      ? ArrowDown
      : ArrowUpDown;

  // Multi-sort indicator
  const sortIndex = table
    .getState()
    .sorting.findIndex((s) => s.id === column.id);
  const showSortIndex = table.getState().sorting.length > 1 && sortIndex !== -1;

  return (
    <div
      draggable={enableDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center justify-between w-full gap-1 group"
    >
      {/* Drag Handle */}
      {enableDrag && (
        <div className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4 text-slate-400" />
        </div>
      )}

      {/* Column Title & Sort */}
      <div className="flex items-center flex-1 min-w-0">
        {enableSort ? (
          <button
            onClick={(e) => {
              const isMulti = e.shiftKey;
              column.toggleSorting(undefined, isMulti);
            }}
            className="flex items-center gap-2 min-w-0 flex-1 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <span className="font-medium truncate">{title}</span>
            <div className="flex items-center gap-1">
              <motion.div
                animate={{ rotate: isSorted === "desc" ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <SortIcon
                  className={`h-4 w-4 ${
                    isSorted
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400"
                  }`}
                />
              </motion.div>
              {showSortIndex && (
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {sortIndex + 1}
                </span>
              )}
            </div>
          </button>
        ) : (
          <span className="font-medium truncate">{title}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Filter */}
        {enableFilter && (
          <AdvancedColumnFilter column={column} dataType={dataType} />
        )}

        {/* Column Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="sr-only">Column menu</span>
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
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {enableSort && (
              <>
                <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Sort Ascending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Sort Descending
                </DropdownMenuItem>
                {isSorted && (
                  <DropdownMenuItem onClick={() => column.clearSorting()}>
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Clear Sort
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
              </>
            )}

            {enablePin && (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    column.pin(isPinned === "left" ? false : "left")
                  }
                >
                  {isPinned === "left" ? (
                    <>
                      <PinOff className="mr-2 h-4 w-4" />
                      Unpin from Left
                    </>
                  ) : (
                    <>
                      <Pin className="mr-2 h-4 w-4" />
                      Pin to Left
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    column.pin(isPinned === "right" ? false : "right")
                  }
                >
                  {isPinned === "right" ? (
                    <>
                      <PinOff className="mr-2 h-4 w-4" />
                      Unpin from Right
                    </>
                  ) : (
                    <>
                      <Pin className="mr-2 h-4 w-4" />
                      Pin to Right
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {enableHide && (
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Column
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Resize Handle */}
      {enableResize && column.getCanResize() && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors"
          style={{ userSelect: "none" }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-8 bg-slate-300 dark:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
}

export default ColumnHeader;
