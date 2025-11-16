import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "../ui/button";

export function DataGridPagination({ table }) {
  const pageSize = table.getState().pagination.pageSize;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();
  const totalRows = table.getFilteredRowModel().rows.length;
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;

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
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="h-9 rounded-md border-2 px-3 py-1 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
              color: "var(--color-foreground)",
              ringColor: "var(--color-ring)",
              accentColor: "var(--color-primary)",
            }}
          >
            {[10, 20, 30, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-3">
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
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.setPageIndex(0)}
          disabled={!canPreviousPage}
          className="h-9 w-9 border-2 shadow-sm"
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
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!canPreviousPage}
          className="h-9 w-9 border-2 shadow-sm"
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
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!canNextPage}
          className="h-9 w-9 border-2 shadow-sm"
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
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!canNextPage}
          className="h-9 w-9 border-2 shadow-sm"
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
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default DataGridPagination;
