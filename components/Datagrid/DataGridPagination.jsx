// src/components/DataGrid/DataGridPagination.jsx
import React from "react";
import { Button } from "../ui/button";

export default function DataGridPagination({ table }) {
  const pagination = table.getState().pagination;
  const pageCount = table.getPageCount() || 1;
  const currentPage = pagination?.pageIndex + 1 || 1;

  return (
    <div className="flex items-center justify-between gap-2 mt-3">
      <div className="flex gap-1">
        <Button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </Button>
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </Button>
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </Button>
        <Button
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </Button>
      </div>

      <div className="text-sm text-gray-600 dark:text-neutral-300">
        Page <strong>{currentPage}</strong> of <strong>{pageCount}</strong>
      </div>
    </div>
  );
}
