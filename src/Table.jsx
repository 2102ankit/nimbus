import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { filterFunctions } from "../components/Datagrid/AdvancedColumnFilter";
import { ColumnHeader } from "../components/Datagrid/ColumnHeader";
import { EnhancedToolbar } from "../components/Datagrid/EnhancedToolbar";
import { useTheme } from "../components/ThemeProvider";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";

// ============ CUSTOM FILTER const ============
const advancedFilterFn = (row, columnId, filterValue) => {
  if (!filterValue || !filterValue.operator) return true;

  const cellValue = row.getValue(columnId);
  const { operator, value } = filterValue;

  // Determine data type
  const column = row
    .getAllCells()
    .find((c) => c.column.id === columnId)?.column;
  const dataType = column?.columnDef?.meta?.dataType || "text";

  const filterFn = filterFunctions[dataType]?.[operator];
  if (!filterFn) return true;

  return filterFn(cellValue, value);
};

// ============ EXPORT FUNCTIONS ============
const exportToCSV = (data, columns) => {
  const headers = columns
    .map((c) => (typeof c.header === "string" ? c.header : c.id))
    .join(",");
  const rows = data
    .map((row) =>
      columns
        .map((c) => `"${String(row[c.id] || "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const csv = `${headers}\n${rows}`;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportToJSON = (data, columns) => {
  const exportData = data.map((row) => {
    const obj = {};
    columns.forEach((c) => {
      obj[c.id] = row[c.id];
    });
    return obj;
  });

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportToExcel = (data, columns) => {
  let html = "<table><thead><tr>";
  columns.forEach((c) => {
    html += `<th>${typeof c.header === "string" ? c.header : c.id}</th>`;
  });
  html += "</tr></thead><tbody>";
  data.forEach((row) => {
    html += "<tr>";
    columns.forEach((c) => {
      html += `<td>${row[c.id] || ""}</td>`;
    });
    html += "</tr>";
  });
  html += "</tbody></table>";

  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export-${Date.now()}.xls`;
  a.click();
  URL.revokeObjectURL(url);
};

// ============ GENERATE SAMPLE DATA ============
const generateData = (count = 100) => {
  const statuses = ["Active", "Inactive", "Pending", "Suspended"];
  const roles = ["Admin", "User", "Manager", "Guest"];
  const departments = ["Engineering", "Sales", "Marketing", "Support", "HR"];
  const firstNames = [
    "John",
    "Jane",
    "Alice",
    "Bob",
    "Charlie",
    "Diana",
    "Eve",
    "Frank",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `usr_${String(i + 1).padStart(5, "0")}`,
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
      lastNames[Math.floor(Math.random() * lastNames.length)]
    }`,
    email: `user${i + 1}@example.com`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    salary: Math.floor(Math.random() * 100000) + 40000,
    joinDate: new Date(
      2020 + Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28)
    )
      .toISOString()
      .split("T")[0],
    performance: Math.floor(Math.random() * 100),
  }));
};

// ============ MAIN DATAGRID COMPONENT ============
const AdvancedDataGrid = () => {
  const { theme, density, showGridLines, showHeaderLines, showRowLines } =
    useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState({});
  const [pinnedRows, setPinnedRows] = useState({ top: [], bottom: [] });

  // Load preferences from localStorage
  const loadPrefs = () => {
    try {
      const stored = localStorage.getItem("datagrid-prefs-v2");
      return stored
        ? JSON.parse(stored)
        : {
            columnVisibility: {},
            columnOrder: [],
            columnSizing: {},
            columnPinning: { left: [], right: [] },
            sorting: [],
            pageSize: 20,
          };
    } catch {
      return {
        columnVisibility: {},
        columnOrder: [],
        columnSizing: {},
        columnPinning: { left: [], right: [] },
        sorting: [],
        pageSize: 20,
      };
    }
  };

  const [prefs, setPrefs] = useState(loadPrefs);
  const [sorting, setSorting] = useState(prefs.sorting || []);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState(
    prefs.columnVisibility || {}
  );
  const [columnOrder, setColumnOrder] = useState(prefs.columnOrder || []);
  const [columnSizing, setColumnSizing] = useState(prefs.columnSizing || {});
  const [columnPinning, setColumnPinning] = useState(
    prefs.columnPinning || { left: [], right: [] }
  );

  // Save preferences
  const savePrefs = useCallback(
    (newPrefs) => {
      const merged = { ...prefs, ...newPrefs };
      localStorage.setItem("datagrid-prefs-v2", JSON.stringify(merged));
      setPrefs(merged);
    },
    [prefs]
  );

  // Auto-save on changes
  useEffect(() => {
    savePrefs({ sorting });
  }, [sorting]);
  useEffect(() => {
    savePrefs({ columnVisibility });
  }, [columnVisibility]);
  useEffect(() => {
    savePrefs({ columnOrder });
  }, [columnOrder]);
  useEffect(() => {
    savePrefs({ columnSizing });
  }, [columnSizing]);
  useEffect(() => {
    savePrefs({ columnPinning });
  }, [columnPinning]);

  // Load data
  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateData(100));
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Define columns
  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
          />
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        enablePinning: true,
      },
      {
        id: "expand",
        header: "",
        cell: ({ row }) =>
          row.getCanExpand() ? (
            <button
              onClick={() => row.toggleExpanded()}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <button
              onClick={() => row.toggleExpanded()}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
      },
      {
        accessorKey: "id",
        header: "ID",
        size: 150,
        meta: { dataType: "text" },
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 200,
        meta: { dataType: "text" },
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 250,
        meta: { dataType: "text" },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue();
          const colors = {
            Active:
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            Inactive:
              "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
            Pending:
              "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
            Suspended:
              "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          };
          return (
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colors[status]}`}
            >
              {status}
            </span>
          );
        },
        size: 130,
        meta: { dataType: "text" },
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 130,
        meta: { dataType: "text" },
      },
      {
        accessorKey: "department",
        header: "Department",
        size: 150,
        meta: { dataType: "text" },
      },
      {
        accessorKey: "salary",
        header: "Salary",
        cell: ({ getValue }) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(getValue()),
        size: 150,
        meta: { dataType: "number" },
      },
      {
        accessorKey: "performance",
        header: "Performance",
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-xs font-medium w-10">{value}%</span>
            </div>
          );
        },
        size: 180,
        meta: { dataType: "number" },
      },
      {
        accessorKey: "joinDate",
        header: "Join Date",
        size: 150,
        meta: { dataType: "date" },
      },
    ],
    []
  );

  // Add headers to columns
  const columnsWithHeaders = columns.map((col) => ({
    ...col,
    header:
      typeof col.header === "string"
        ? ({ column, table, header }) => (
            <ColumnHeader
              header={header}
              column={column}
              title={col.header}
              table={table}
              dataType={col.meta?.dataType}
            />
          )
        : col.header,
  }));

  // Initialize table
  const table = useReactTable({
    data,
    columns: columnsWithHeaders,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnOrder,
      columnSizing,
      columnPinning,
      expanded,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    enableSorting: true,
    enableMultiSort: true,
    enableFilters: true,
    enablePinning: true,
    enableExpanding: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onColumnPinningChange: setColumnPinning,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    filterFns: {
      advanced: advancedFilterFn,
    },
    globalFilterFn: "includesString",
    initialState: {
      pagination: {
        pageSize: prefs.pageSize || 20,
      },
    },
  });

  // Handle export
  const handleExport = (format, rows, cols) => {
    switch (format) {
      case "csv":
        exportToCSV(rows, cols);
        break;
      case "excel":
        exportToExcel(rows, cols);
        break;
      case "json":
        exportToJSON(rows, cols);
        break;
    }
  };

  // Reset preferences
  const handleResetPreferences = () => {
    localStorage.removeItem("datagrid-prefs-v2");
    setSorting([]);
    setColumnVisibility({});
    setColumnOrder([]);
    setColumnSizing({});
    setColumnPinning({ left: [], right: [] });
    setColumnFilters([]);
    setGlobalFilter("");
    table.resetColumnVisibility();
    table.resetColumnOrder();
    table.resetColumnSizing();
    table.resetSorting();
    table.setPageSize(20);
  };

  // Density classes
  const getDensityPadding = () => {
    switch (density) {
      case "compact":
        return "p-2";
      case "comfortable":
        return "p-6";
      default:
        return "p-4";
    }
  };

  const isEmpty = table.getFilteredRowModel().rows.length === 0;

  // Border classes based on settings
  const getBorderClasses = () => {
    const borders = [];
    if (showRowLines) borders.push("border-b");
    if (showGridLines) borders.push("border-r");
    return borders.join(" ");
  };

  const getHeaderBorderClasses = () => {
    const borders = ["border-b-2"];
    if (showHeaderLines) borders.push("border-r");
    return borders.join(" ");
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 p-8 transition-colors">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-100">
            Advanced Enterprise DataGrid
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Complete table with: Advanced Filters, Multi-Column Sort, Column
            Reordering, Pinning (Left & Right), Resizing, Row Expansion, Dark
            Mode, Density Control, Customizable Grid Lines & More
          </p>
        </div>

        <div className="border rounded-lg shadow-lg overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 dark:text-slate-100">
          <EnhancedToolbar
            table={table}
            columns={columns}
            onExport={handleExport}
            onResetPreferences={handleResetPreferences}
            onRefresh={loadData}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />

          <div
            className="relative overflow-auto"
            style={{ maxHeight: "600px" }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400 mr-2" />
                <span className="text-slate-500 dark:text-slate-400">
                  Loading data...
                </span>
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full p-3 mb-4 bg-slate-100 dark:bg-slate-800">
                  <svg
                    className="h-8 w-8 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1 text-slate-900 dark:text-slate-100">
                  No results found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className={
                        getHeaderBorderClasses() +
                        " border-slate-300 dark:border-slate-700"
                      }
                    >
                      {headerGroup.headers.map((header) => {
                        const isPinned = header.column.getIsPinned();
                        return (
                          <th
                            key={header.id}
                            className={`text-left align-middle font-medium text-slate-700 dark:text-slate-300 ${getDensityPadding()} ${getHeaderBorderClasses()} border-slate-300 dark:border-slate-700 last:border-r-0 ${
                              isPinned
                                ? `sticky z-30 bg-slate-100 dark:bg-slate-800 ${
                                    isPinned === "left"
                                      ? "left-0 shadow-[2px_0_5px_rgba(0,0,0,0.1)]"
                                      : "right-0 shadow-[-2px_0_5px_rgba(0,0,0,0.1)]"
                                  }`
                                : ""
                            }`}
                            style={{ width: header.getSize() }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {table.getRowModel().rows.map((row, idx) => (
                      <React.Fragment key={row.id}>
                        <motion.tr
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, delay: idx * 0.01 }}
                          className={`${getBorderClasses()} border-slate-200 dark:border-slate-800 dark:text-slate-100 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 ${
                            row.getIsSelected()
                              ? "bg-blue-50 dark:bg-blue-950"
                              : ""
                          }`}
                        >
                          {row.getVisibleCells().map((cell) => {
                            const isPinned = cell.column.getIsPinned();
                            return (
                              <td
                                key={cell.id}
                                className={`align-middle ${getDensityPadding()} ${getBorderClasses()} border-slate-200 dark:border-slate-800 dark:text-slate-100 last:border-r-0 ${
                                  isPinned
                                    ? `sticky z-10 bg-white dark:bg-slate-950 ${
                                        row.getIsSelected()
                                          ? "bg-blue-50 dark:bg-blue-950"
                                          : ""
                                      } ${
                                        isPinned === "left"
                                          ? "left-0 shadow-[2px_0_5px_rgba(0,0,0,0.05)]"
                                          : "right-0 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]"
                                      }`
                                    : ""
                                }`}
                                style={{ width: cell.column.getSize() }}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </td>
                            );
                          })}
                        </motion.tr>

                        {row.getIsExpanded() && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <td
                              colSpan={row.getVisibleCells().length}
                              className="p-0"
                            >
                              <div className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 dark:text-slate-100 p-6">
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold text-sm mb-3 text-slate-900 dark:text-slate-100">
                                      Full Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      {Object.entries(row.original).map(
                                        ([key, value]) => (
                                          <div key={key} className="flex">
                                            <span className="font-medium w-32 text-slate-600 dark:text-slate-400">
                                              {key}:
                                            </span>
                                            <span className="text-slate-900 dark:text-slate-100">
                                              {String(value)}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm mb-3 text-slate-900 dark:text-slate-100">
                                      Actions
                                    </h4>
                                    <div className="flex gap-2 flex-wrap">
                                      <Button size="sm">View Profile</Button>
                                      <Button size="sm" variant="outline">
                                        Edit
                                      </Button>
                                      <Button size="sm" variant="outline">
                                        Duplicate
                                      </Button>
                                      <Button size="sm" variant="destructive">
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </React.Fragment>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>

          {!loading && !isEmpty && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-slate-200 dark:border-slate-800 dark:text-slate-100">
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Rows per page:
                  </span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="h-8 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1 text-sm"
                  >
                    {[10, 20, 30, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-slate-500 dark:text-slate-400 mr-4">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="mt-4 p-4 rounded-lg border bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-100">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Features & Shortcuts
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>✨ Features:</strong> Advanced Column Filters
            (text/number/date operators), Multi-Column Sort (Shift+Click),
            Column Reordering (Drag headers), Column Pinning (Left & Right),
            Manual Resizing (Drag column edges), Row Expansion, Dark Mode,
            Density Control, Customizable Grid Lines, Export (CSV/Excel/JSON),
            Auto-Save Preferences
            <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
              <strong>💡 Tips:</strong> Shift+Click column headers for
              multi-sort • Use advanced filters for precise data filtering •
              Drag column headers to reorder • Pin important columns to left or
              right • Double-click column edge to auto-fit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDataGrid;
