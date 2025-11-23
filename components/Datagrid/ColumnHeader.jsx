import { AdvancedColumnFilter } from "@/components/Datagrid/AdvancedColumnFilter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  EyeOff,
  GripVertical,
  Pin,
  PinOff,
} from "lucide-react";

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
  const isSorted = column.getIsSorted();
  const isPinned = column.getIsPinned();

  const SortIcon =
    isSorted === "asc"
      ? ArrowUp
      : isSorted === "desc"
        ? ArrowDown
        : ArrowUpDown;

  const sortIndex = table
    .getState()
    .sorting.findIndex((s) => s.id === column.id);
  const showSortIndex = table.getState().sorting.length > 1 && sortIndex !== -1;
  // Determine if any menu options should be shown for this column
  const hasMenuOptions = enableSort || (enablePin && column.columnDef.enablePinning !== false) || (enableHide && column.columnDef.enableHiding !== false);

  // Drag handling using @dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isDnDDragging,
  } = useSortable({
    id: column.id,
    disabled: !enableDrag || column.columnDef.enableReordering === false,
  });

  // Merge dragging state with local state for opacity handling
  const isDragging = isDnDDragging;

  // Apply transform style
  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Resize handlers
  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    header.getResizeHandler()(e);
  };


  return (
    <div
      className="flex items-center justify-between w-full gap-1 group relative"
    >
      {/* Column Title & Sort */}
      <div className="flex items-center flex-1 min-w-0"
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: isDragging ? "grabbing" : "default",
          ...dndStyle,
        }}
      >
        {/* Drag Handle */}
        {enableDrag && (
          <div className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity shrink-0 px-2 py-1 rounded">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {enableSort ? (
          <button
            onClick={(e) => {
              const isMulti = e.shiftKey;
              column.toggleSorting(undefined, isMulti);
            }}
            className="flex items-center gap-2 min-w-0 flex-1 text-left hover:text-foreground transition-colors"
            title="Click to sort, Shift+Click for multi-sort"
          >
            <span className="font-semibold truncate">{title}</span>
            <div className="flex items-center gap-1 shrink-0">
              <SortIcon
                className={`h-4 w-4 ${isSorted ? "text-primary" : "text-muted-foreground"
                  }`}
              />
              {showSortIndex && (
                <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-4 h-4 flex items-center justify-center">
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
      <div className="flex items-center gap-1 shrink-0">
        {/* Filter */}
        {enableFilter && (
          <AdvancedColumnFilter column={column} dataType={dataType} />
        )}

        {/* Column Menu */}
        {hasMenuOptions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity  mr-2"
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
                  <DropdownMenuItem onClick={() => column.pin(isPinned === "left" ? false : "left")}>
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
                  <DropdownMenuItem onClick={() => column.pin(isPinned === "right" ? false : "right")}>
                    {isPinned === "right" ? (
                      <>
                        <PinOff className="mr-2 h-4 w-4" />
                        Unpin from Right
                      </>
                    ) : (
                      <>
                        <Pin className="mr-2 h-4 w-4 rotate-270" />
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
        )}
      </div >

      {
        enableResize && column.getCanResize() && (
          <div
            onMouseDown={handleResizeMouseDown}
            onTouchStart={handleResizeMouseDown}
            onDoubleClick={() => column.resetSize()}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            data-dnd-kit-disabled="true"
            className={`absolute -right-1 -top-2 h-10 w-2 cursor-col-resize touch-none 
            select-none transition-colors ${column.getIsResizing() ? "bg-primary" : "hover:bg-primary/50"}`}
            style={{ userSelect: "none" }}
          />
        )
      }
    </div >
  );
}

export default ColumnHeader;
