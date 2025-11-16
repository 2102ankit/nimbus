import React from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  EyeOff,
  Pin,
  PinOff,
  GripVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { AdvancedColumnFilter } from "../Datagrid/AdvancedColumnFilter";
import { motion } from "motion/react";

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
}) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);

  const isSorted = column.getIsSorted();
  const isPinned = column.getIsPinned();

  // FIXED: Show correct icon based on sort direction
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

  // Drag handlers
  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("columnId", column.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("columnId");

    if (sourceId && sourceId !== column.id) {
      const allColumns = table.getAllColumns().map((col) => col.id);
      const sourceIndex = allColumns.indexOf(sourceId);
      const targetIndex = allColumns.indexOf(column.id);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        const newOrder = [...allColumns];
        const [removed] = newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, removed);
        table.setColumnOrder(newOrder);
      }
    }
  };

  // Resize handlers
  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    header.getResizeHandler()(e);
  };

  React.useEffect(() => {
    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
      }
    };

    if (isResizing) {
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div
      draggable={enableDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? "grabbing" : "default",
      }}
      className="flex items-center justify-between w-full gap-1 group relative"
    >
      {/* Drag Handle */}
      {enableDrag && (
        <div className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <GripVertical className="h-4 w-4 text-slate-400 dark:text-slate-500" />
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
            className="flex items-center gap-2 min-w-0 flex-1 text-left hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            title="Click to sort, Shift+Click for multi-sort"
          >
            <span className="font-semibold truncate">{title}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* FIXED: Icon shows correctly based on sort state */}
              <SortIcon
                className={`h-4 w-4 ${
                  isSorted
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              {showSortIndex && (
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-full w-4 h-4 flex items-center justify-center">
                  {sortIndex + 1}
                </span>
              )}
            </div>
          </button>
        ) : (
          <span className="font-semibold truncate">{title}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Filter */}
        {enableFilter && (
          <AdvancedColumnFilter column={column} dataType={dataType} />
        )}

        {/* Column Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
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
                      <Pin className="mr-2 h-4 w-4 rotate-90" />
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

      {/* Resize Handle - FIXED */}
      {enableResize && column.getCanResize() && (
        <div
          onMouseDown={handleResizeMouseDown}
          onTouchStart={handleResizeMouseDown}
          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors ${
            isResizing ? "bg-blue-500 dark:bg-blue-400" : ""
          }`}
          style={{ userSelect: "none" }}
        >
          <div
            className={`absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-12 bg-slate-400 dark:bg-slate-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
              isResizing ? "opacity-100 bg-blue-500 dark:bg-blue-400" : ""
            }`}
          />
        </div>
      )}
    </div>
  );
}

export default ColumnHeader;
