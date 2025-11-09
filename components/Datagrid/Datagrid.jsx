import { Button } from "@/components/ui/button";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import DataGridHeader from "./DataGridHeader";
import DataGridReorderContext, {
  SortableHeader,
} from "./DataGridReorderContext";

export default function DataGrid({ data, columns }) {
  const [sorting, setSorting] = useState([]);
  const [columnOrder, setColumnOrder] = useState(
    columns.map((c) => c.accessorKey)
  );
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnPinning, setColumnPinning] = useState({ left: [], right: [] });

  const orderedColumns = useMemo(() => {
    return columnOrder
      .map((id) => columns.find((c) => c.accessorKey === id))
      .filter(Boolean);
  }, [columns, columnOrder]);

  const table = useReactTable({
    data,
    columns: orderedColumns,
    state: {
      sorting,
      columnFilters,
      columnOrder,
      columnPinning,
    },
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
    getColumnResizeMode: () => "onEnd",
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handlePin = (side, id) => {
    setColumnPinning((prev) => {
      const newPin = { ...prev };
      ["left", "right"].forEach(
        (s) => (newPin[s] = newPin[s].filter((cid) => cid !== id))
      );
      if (side === "left") newPin.left.push(id);
      if (side === "right") newPin.right.push(id);
      return newPin;
    });
  };

  return (
    <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-2xl shadow-md p-4 overflow-x-auto w-full">
      <table className="min-w-full border-collapse text-sm">
        <DataGridReorderContext
          columnOrder={columnOrder}
          setColumnOrder={setColumnOrder}
        >
          <thead className="border-b border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <SortableHeader key={header.id} id={header.column.id}>
                    <DataGridHeader header={header} onPin={handlePin} />
                  </SortableHeader>
                ))}
              </tr>
            ))}
          </thead>
        </DataGridReorderContext>

        <tbody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center p-4 text-neutral-500"
              >
                No results found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
