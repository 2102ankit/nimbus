import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataGridInfoPanel } from "../Datagrid/DataGridInfoPanel";
import { DataGridPagination } from "../Datagrid/DataGridPagination";
import { DataGridStatusBar } from "../Datagrid/DataGridStatusBar";
import { DataGridTableBody } from "../Datagrid/DataGridTableBody";
import { DataGridTableHeader } from "../Datagrid/DataGridTableHeader";
import { DataGridToolbar } from "../Datagrid/DataGridToolbar";
import {
  addHeadersToColumns,
  createColumns,
} from "../Datagrid/columnDefinitions";
import {
  advancedFilterFn,
  exportToCSV,
  exportToExcel,
  exportToJSON,
  getLeftPosition,
  getRightPosition,
  loadPreferences,
  resetPreferences,
  savePreferences,
} from "../Datagrid/dataGridUtils";
import { generateSampleData } from "../Datagrid/sampleDataGenerator";
import { useTheme } from "../ThemeProvider";

const AdvancedDataGrid = () => {
  const { density, showGridLines, showHeaderLines, showRowLines } = useTheme();

  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState({});
  const [grouping, setGrouping] = useState([]);

  // Load preferences
  const [prefs, setPrefs] = useState(loadPreferences);
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

  // Save preferences automatically
  const handleSavePrefs = useCallback(
    (newPrefs) => {
      const merged = { ...prefs, ...newPrefs };
      savePreferences(merged);
      setPrefs(merged);
    },
    [prefs],
  );

  useEffect(() => {
    handleSavePrefs({ sorting });
  }, [sorting]);
  useEffect(() => {
    handleSavePrefs({ columnVisibility });
  }, [columnVisibility]);
  useEffect(() => {
    handleSavePrefs({ columnOrder });
  }, [columnOrder]);
  useEffect(() => {
    handleSavePrefs({ columnSizing });
  }, [columnSizing]);
  useEffect(() => {
    handleSavePrefs({ columnPinning });
  }, [columnPinning]);

  // Load data
  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateSampleData(100));
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Define columns
  const columns = useMemo(() => createColumns(), []);
  const columnsWithHeaders = useMemo(
    () => addHeadersToColumns(columns),
    [columns],
  );

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
    resetPreferences();
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

  // Position helpers
  const getLeftPos = (column) => getLeftPosition(column, table);
  const getRightPos = (column) => getRightPosition(column, table);

  return (
    <div className="w-full min-h-screen bg-background p-8 transition-colors">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Advanced Enterprise DataGrid
          </h1>
          <p className="text-muted-foreground text-lg">
            Complete table with Advanced Filters, Multi-Column Sort, Column
            Reordering, Pinning, Resizing, Row Expansion, Grouping & More
          </p>
        </div>

        {/* Main Table Container */}
        <div className="border-2 rounded-xl shadow-2xl overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DataGridToolbar
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
            <table className="w-full text-sm border-collapse">
              <DataGridTableHeader
                table={table}
                getDensityPadding={getDensityPadding}
                getHeaderBorderClasses={getHeaderBorderClasses}
                getLeftPosition={getLeftPos}
                getRightPosition={getRightPos}
              />
              <DataGridTableBody
                table={table}
                loading={loading}
                isEmpty={isEmpty}
                getDensityPadding={getDensityPadding}
                getCellBorderClasses={getCellBorderClasses}
                getLeftPosition={getLeftPos}
                getRightPosition={getRightPos}
              />
            </table>
          </div>

          {!loading && !isEmpty && <DataGridPagination table={table} />}
        </div>

        {/* Status Bar */}
        <div className="mt-6">
          <DataGridStatusBar table={table} />
        </div>

        {/* Info Panel */}
        <div className="mt-6">
          <DataGridInfoPanel />
        </div>
      </div>
    </div>
  );
};

export default AdvancedDataGrid;
