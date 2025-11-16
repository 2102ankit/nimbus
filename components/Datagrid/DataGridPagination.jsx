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
    <div className="flex items-center justify-between px-5 py-4 border-t-2 border-border bg-gradient-to-r from-background to-muted">
      {/* Selected Rows Info */}
      <div className="flex items-center gap-5">
        <div className="text-sm font-medium text-muted-foreground">
          <span className="font-bold text-primary">{selectedRows}</span> of{" "}
          <span className="font-bold text-foreground">{totalRows}</span> row(s)
          selected
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Rows per page:
          </span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="h-9 rounded-md border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1 text-sm font-medium text-slate-900 dark:text-slate-100 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mr-2">
          Page{" "}
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {pageIndex + 1}
          </span>{" "}
          of{" "}
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {pageCount}
          </span>
        </div>

        {/* Navigation Buttons */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.setPageIndex(0)}
          disabled={!canPreviousPage}
          className="h-9 w-9 border-2 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700"
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!canPreviousPage}
          className="h-9 w-9 border-2 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700"
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!canNextPage}
          className="h-9 w-9 border-2 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700"
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!canNextPage}
          className="h-9 w-9 border-2 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700"
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default DataGridPagination;
