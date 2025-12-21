import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DataGridPagination({ table, totalRows: totalRowsProp, totalSelectedRows: totalSelectedRowsProp }) {
  const pageSize = table.getState().pagination.pageSize;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();
  // Use props if provided (for manual pagination), otherwise fall back to table model
  const totalRows = totalRowsProp !== undefined ? totalRowsProp : table.getFilteredRowModel().rows.length;
  const selectedRows = totalSelectedRowsProp !== undefined ? totalSelectedRowsProp : table.getFilteredSelectedRowModel().rows.length;

  const handlePageSizeChange = (e) => {
    table.setPageSize(Number(e.target.value));
  };

  return (
    <div
      className="flex items-center justify-between px-5 py-1 border-t-2"
      style={{
        background: `var(--color-muted)`,
        borderTopColor: "var(--color-border)",
      }}
    >
      {/* Selected Rows Info */}
      <div className="flex items-center gap-5">
        <div
          className="text-sm font-medium"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <span className="font-bold" style={{ color: "var(--color-primary)" }}>
            {selectedRows}
          </span>{" "}
          of{" "}
          <span
            className="font-bold"
            style={{ color: "var(--color-foreground)" }}
          >
            {totalRows}
          </span>{" "}
          row(s) selected
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2.5">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Rows per page:
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger
              className="h-9 w-20 border-2 shadow-sm"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                color: "var(--color-foreground)",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-3"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {/* Page Info */}
        <div
          className="text-sm font-medium mr-2"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          Page{" "}
          <span
            className="font-bold"
            style={{ color: "var(--color-foreground)" }}
          >
            {pageIndex + 1}
          </span>{" "}
          of{" "}
          <span
            className="font-bold"
            style={{ color: "var(--color-foreground)" }}
          >
            {pageCount}
          </span>
        </div>

        {/* Navigation Buttons */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(0)}
                disabled={!canPreviousPage}
                className="h-9 w-9 border-2"
                style={{ borderColor: "var(--color-border)" }}
                onMouseEnter={(e) =>
                  !canPreviousPage &&
                  (e.currentTarget.style.backgroundColor =
                    "color-mix(in oklch, var(--color-muted), transparent 90%)")
                }
                onMouseLeave={(e) =>
                  !canPreviousPage &&
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>First page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!canPreviousPage}
                className="h-9 w-9 border-2"
                style={{ borderColor: "var(--color-border)" }}
                onMouseEnter={(e) =>
                  !canPreviousPage &&
                  (e.currentTarget.style.backgroundColor =
                    "color-mix(in oklch, var(--color-muted), transparent 90%)")
                }
                onMouseLeave={(e) =>
                  !canPreviousPage &&
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!canNextPage}
                className="h-9 w-9 border-2"
                style={{ borderColor: "var(--color-border)" }}
                onMouseEnter={(e) =>
                  !canNextPage &&
                  (e.currentTarget.style.backgroundColor =
                    "color-mix(in oklch, var(--color-muted), transparent 90%)")
                }
                onMouseLeave={(e) =>
                  !canNextPage &&
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(pageCount - 1)}
                disabled={!canNextPage}
                className="h-9 w-9 border-2"
                style={{ borderColor: "var(--color-border)" }}
                onMouseEnter={(e) =>
                  !canNextPage &&
                  (e.currentTarget.style.backgroundColor =
                    "color-mix(in oklch, var(--color-muted), transparent 90%)")
                }
                onMouseLeave={(e) =>
                  !canNextPage &&
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Last page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default DataGridPagination;
