import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
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
  Layers,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { filterFunctions } from "../components/Datagrid/AdvancedColumnFilter";
import { ColumnHeader } from "../components/Datagrid/ColumnHeader";
import { EnhancedToolbar } from "../components/Datagrid/EnhancedToolbar";
import { useTheme } from "../components/ThemeProvider";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";

// ============ CUSTOM FILTER FUNCTION - FIXED ============
const advancedFilterFn = (row, columnId, filterValue) => {
  if (!filterValue || !filterValue.operator || !filterValue.dataType)
    return true;

  const cellValue = row.getValue(columnId);
  const { operator, value, dataType } = filterValue;

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
        .join(","),
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
    "Grace",
    "Henry",
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
    "Martinez",
    "Lopez",
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
      Math.floor(Math.random() * 28),
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
  const [grouping, setGrouping] = useState([]);

  // Load preferences from localStorage
  const loadPrefs = () => {
    try {
      const stored = localStorage.getItem("datagrid-prefs-v3");
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
    prefs.columnVisibility || {},
  );
  const [columnOrder, setColumnOrder] = useState(prefs.columnOrder || []);
  const [columnSizing, setColumnSizing] = useState(prefs.columnSizing || {});
  const [columnPinning, setColumnPinning] = useState(
    prefs.columnPinning || { left: [], right: [] },
  );

  // Save preferences
  const savePrefs = useCallback(
    (newPrefs) => {
      const merged = { ...prefs, ...newPrefs };
      localStorage.setItem("datagrid-prefs-v3", JSON.stringify(merged));
      setPrefs(merged);
    },
    [prefs],
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
        enableColumnFilter: false,
      },
      {
        id: "expand",
        header: "",
        cell: ({ row }) => (
          <button
            onClick={() => row.toggleExpanded()}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            )}
          </button>
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "id",
        header: "ID",
        size: 150,
        meta: { dataType: "text", headerText: "ID" },
        enableColumnFilter: true,
        enableGrouping: false,
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 200,
        meta: { dataType: "text", headerText: "Name" },
        enableColumnFilter: true,
        enableGrouping: true,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 250,
        meta: { dataType: "text", headerText: "Email" },
        enableColumnFilter: true,
        enableGrouping: false,
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
          const statusTypes = {
            Active: "success",
            Inactive: "secondary",
            Pending: "warning",
            Suspended: "error",
          };
          return (
            <Badge
              variant={statusTypes[status]}
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colors[status]}`}
            >
              {status}
            </Badge>
          );
        },
        size: 130,
        meta: { dataType: "text", headerText: "Status" },
        enableColumnFilter: true,
        enableGrouping: true,
        aggregationFn: "count",
        aggregatedCell: ({ getValue }) => `${getValue()} items`,
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 130,
        meta: { dataType: "text", headerText: "Role" },
        enableColumnFilter: true,
        enableGrouping: true,
      },
      {
        accessorKey: "department",
        header: "Department",
        size: 150,
        meta: { dataType: "text", headerText: "Department" },
        enableColumnFilter: true,
        enableGrouping: true,
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
        meta: { dataType: "number", headerText: "Salary" },
        enableColumnFilter: true,
        aggregationFn: "sum",
        aggregatedCell: ({ getValue }) => (
          <span className="font-bold text-green-700 dark:text-green-400">
            Total:{" "}
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(getValue())}
          </span>
        ),
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
                  className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all"
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-xs font-medium w-10 text-slate-700 dark:text-slate-300">
                {value}%
              </span>
            </div>
          );
        },
        size: 180,
        meta: { dataType: "number", headerText: "Performance" },
        enableColumnFilter: true,
        aggregationFn: "mean",
        aggregatedCell: ({ getValue }) => (
          <span className="font-bold text-blue-700 dark:text-blue-400">
            Avg: {Math.round(getValue())}%
          </span>
        ),
      },
      {
        accessorKey: "joinDate",
        header: "Join Date",
        size: 150,
        meta: { dataType: "date", headerText: "Join Date" },
        enableColumnFilter: true,
      },
    ],
    [],
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
      grouping,
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
    enableGrouping: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onColumnPinningChange: setColumnPinning,
    onExpandedChange: setExpanded,
    onGroupingChange: setGrouping,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
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
    localStorage.removeItem("datagrid-prefs-v3");
    setSorting([]);
    setColumnVisibility({});
    setColumnOrder([]);
    setColumnSizing({});
    setColumnPinning({ left: [], right: [] });
    setColumnFilters([]);
    setGlobalFilter("");
    setGrouping([]);
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
  const getCellBorderClasses = () => {
    const borders = [];
    if (showRowLines) borders.push("border-b");
    if (showGridLines) borders.push("border-r");
    return borders.join(" ") + " border-slate-200 dark:border-slate-700";
  };

  const getHeaderBorderClasses = () => {
    const borders = ["border-b-2"];
    if (showHeaderLines || showGridLines) borders.push("border-r");
    return borders.join(" ") + " border-slate-300 dark:border-slate-600";
  };

  // Calculate left position for pinned columns - FIXED
  const getLeftPosition = (column) => {
    const leftPinnedColumns = table.getState().columnPinning.left || [];
    const index = leftPinnedColumns.indexOf(column.id);
    if (index === -1) return 0;

    let left = 0;
    for (let i = 0; i < index; i++) {
      const col = table
        .getAllLeafColumns()
        .find((c) => c.id === leftPinnedColumns[i]);
      if (col) {
        left += col.getSize();
      }
    }
    return left;
  };

  // Calculate right position for pinned columns - FIXED
  const getRightPosition = (column) => {
    const rightPinnedColumns = table.getState().columnPinning.right || [];
    const index = rightPinnedColumns.indexOf(column.id);
    if (index === -1) return 0;

    let right = 0;
    for (let i = index + 1; i < rightPinnedColumns.length; i++) {
      const col = table
        .getAllLeafColumns()
        .find((c) => c.id === rightPinnedColumns[i]);
      if (col) {
        right += col.getSize();
      }
    }
    return right;
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-slate-900 p-8 transition-colors">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-100">
            Advanced Enterprise DataGrid
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Complete table with: Advanced Filters, Multi-Column Sort, Column
            Reordering, Pinning (Left & Right), Resizing, Row Expansion,
            Grouping, Dark Mode, Density Control, Customizable Grid Lines
          </p>
        </div>

        <div className="border-2 rounded-lg shadow-xl overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
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
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mr-3" />
                <span className="text-slate-600 dark:text-slate-400">
                  Loading data...
                </span>
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full p-4 mb-4 bg-slate-100 dark:bg-slate-800">
                  <svg
                    className="h-12 w-12 text-slate-400 dark:text-slate-500"
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
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Try adjusting your filters or search
                </p>
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        const isPinned = header.column.getIsPinned();
                        const leftPos =
                          isPinned === "left"
                            ? getLeftPosition(header.column)
                            : undefined;
                        const rightPos =
                          isPinned === "right"
                            ? getRightPosition(header.column)
                            : undefined;

                        return (
                          <th
                            key={header.id}
                            className={`text-left align-middle font-semibold text-slate-700 dark:text-slate-300 ${getDensityPadding()} ${getHeaderBorderClasses()} ${
                              isPinned
                                ? `sticky z-30 bg-slate-100 dark:bg-slate-800 ${
                                    isPinned === "left"
                                      ? "shadow-[2px_0_5px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.3)]"
                                      : "shadow-[-2px_0_5px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_5px_rgba(0,0,0,0.3)]"
                                  }`
                                : ""
                            }`}
                            style={{
                              width: header.getSize(),
                              minWidth: header.getSize(),
                              maxWidth: header.getSize(),
                              left:
                                leftPos !== undefined
                                  ? `${leftPos}px`
                                  : undefined,
                              right:
                                rightPos !== undefined
                                  ? `${rightPos}px`
                                  : undefined,
                            }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white dark:bg-slate-800">
                  <AnimatePresence mode="popLayout">
                    {table.getRowModel().rows.map((row, idx) => {
                      const isGrouped = row.getIsGrouped();

                      if (isGrouped) {
                        return (
                          <motion.tr
                            key={row.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="font-semibold bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border-b-2 border-slate-300 dark:border-slate-600"
                          >
                            <td
                              colSpan={row.getVisibleCells().length}
                              className={getDensityPadding()}
                            >
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => row.toggleExpanded()}
                                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors"
                                >
                                  {row.getIsExpanded() ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                                <Layers className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                <span className="text-slate-900 dark:text-slate-100">
                                  {row.groupingColumnId}:{" "}
                                  <strong>{row.groupingValue}</strong>
                                </span>
                                <span className="text-sm ml-2 text-slate-600 dark:text-slate-400">
                                  ({row.subRows.length}{" "}
                                  {row.subRows.length === 1 ? "item" : "items"})
                                </span>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      }

                      return (
                        <React.Fragment key={row.id}>
                          <motion.tr
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15, delay: idx * 0.01 }}
                            className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 ${
                              row.getIsSelected()
                                ? "bg-blue-50 dark:bg-blue-950/50"
                                : ""
                            }`}
                          >
                            {row.getVisibleCells().map((cell) => {
                              const isPinned = cell.column.getIsPinned();
                              const leftPos =
                                isPinned === "left"
                                  ? getLeftPosition(cell.column)
                                  : undefined;
                              const rightPos =
                                isPinned === "right"
                                  ? getRightPosition(cell.column)
                                  : undefined;

                              return (
                                <td
                                  key={cell.id}
                                  className={`align-middle text-slate-700 dark:text-slate-300 ${getDensityPadding()} ${getCellBorderClasses()} ${
                                    isPinned
                                      ? `sticky z-10 bg-white dark:bg-slate-800 ${
                                          row.getIsSelected()
                                            ? "bg-blue-50 dark:bg-blue-950/50"
                                            : ""
                                        } ${
                                          isPinned === "left"
                                            ? "shadow-[2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.2)]"
                                            : "shadow-[-2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[-2px_0_5px_rgba(0,0,0,0.2)]"
                                        }`
                                      : ""
                                  }`}
                                  style={{
                                    width: cell.column.getSize(),
                                    minWidth: cell.column.getSize(),
                                    maxWidth: cell.column.getSize(),
                                    left:
                                      leftPos !== undefined
                                        ? `${leftPos}px`
                                        : undefined,
                                    right:
                                      rightPos !== undefined
                                        ? `${rightPos}px`
                                        : undefined,
                                  }}
                                >
                                  {cell.getIsGrouped() ? (
                                    <button
                                      onClick={() => row.toggleExpanded()}
                                      className="flex items-center gap-2 font-semibold"
                                    >
                                      {row.getIsExpanded() ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                      )}{" "}
                                      ({row.subRows.length})
                                    </button>
                                  ) : cell.getIsAggregated() ? (
                                    flexRender(
                                      cell.column.columnDef.aggregatedCell ??
                                        cell.column.columnDef.cell,
                                      cell.getContext(),
                                    )
                                  ) : cell.getIsPlaceholder() ? null : (
                                    flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext(),
                                    )
                                  )}
                                </td>
                              );
                            })}
                          </motion.tr>

                          {row.getIsExpanded() && !isGrouped && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <td
                                colSpan={row.getVisibleCells().length}
                                className="p-0"
                              >
                                <div className="bg-slate-50 dark:bg-slate-900 border-y-2 border-slate-200 dark:border-slate-700 p-6">
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
                                          ),
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
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>

          {!loading && !isEmpty && (
            <div className="flex items-center justify-between px-4 py-4 border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Rows per page:
                  </span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="h-9 rounded-md border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1 text-sm text-slate-900 dark:text-slate-100"
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
                <div className="text-sm text-slate-600 dark:text-slate-400 mr-4">
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

        {/* Status Bar */}
        <div className="mt-4 p-4 rounded-lg border-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Total Rows
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {table.getFilteredRowModel().rows.length}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Selected
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {table.getFilteredSelectedRowModel().rows.length}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Active Filters
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {table.getState().columnFilters.length}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Grouped By
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {table.getState().grouping.length || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Sort Columns
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {table.getState().sorting.length || "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-4 p-4 rounded-lg border-2 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-200">
            <svg
              className="h-5 w-5"
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
            Features & Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <div>
              <strong className="block mb-2">✨ Features:</strong>
              <ul className="space-y-1 list-disc list-inside">
                <li>Advanced Column Filters with multiple operators</li>
                <li>Multi-Column Sort (Shift+Click headers)</li>
                <li>Drag & Drop Column Reordering</li>
                <li>Column Pinning (Left & Right)</li>
                <li>Manual Column Resizing (drag edges)</li>
                <li>Row Expansion with details</li>
                <li>Grouping with Aggregations</li>
              </ul>
            </div>
            <div>
              <strong className="block mb-2">⌨️ Shortcuts:</strong>
              <ul className="space-y-1 list-disc list-inside">
                <li>
                  <kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 border rounded text-xs">
                    Shift+Click
                  </kbd>{" "}
                  header for multi-sort
                </li>
                <li>Drag column headers to reorder</li>
                <li>Drag column edges to resize</li>
                <li>Click filter icon for advanced filters</li>
                <li>Use pin buttons in column menu</li>
                <li>Toggle dark mode, density & grid lines in View menu</li>
              </ul>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t-2 border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-400">
            <strong>💡 Pro Tips:</strong> All preferences (column order, sizing,
            pinning, sorting) are automatically saved to localStorage. Use the
            "Reset All Preferences" button in the Columns menu to restore
            defaults.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDataGrid;
