import { DataGridPagination } from "@/components/Datagrid/DataGridPagination";
import { DataGridStatusBar } from "@/components/Datagrid/DataGridStatusBar";
import { DataGridTableBody } from "@/components/Datagrid/DataGridTableBody";
import { DataGridTableHeader } from "@/components/Datagrid/DataGridTableHeader";
import { DataGridToolbar } from "@/components/Datagrid/DataGridToolbar";
import { KeyboardShortcutsModal } from "@/components/Datagrid/KeyboardShortcutsModal";
import {
  addHeadersToColumns,
  createColumns,
} from "@/components/Datagrid/columnDefinitions";
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
} from "@/components/Datagrid/dataGridUtils";
import { generateSampleData } from "@/components/Datagrid/sampleDataGenerator";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

const AdvancedDataGrid = () => {
  const { theme, toggleTheme, density, showGridLines, showHeaderLines, showRowLines } = useTheme();

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
    prefs.columnVisibility || {}
  );
  const [columnOrder, setColumnOrder] = useState(prefs.columnOrder || []);
  const [columnSizing, setColumnSizing] = useState(prefs.columnSizing || {});
  const [columnPinning, setColumnPinning] = useState(
    prefs.columnPinning || { left: [], right: [] }
  );
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [exportMode, setExportMode] = useState(null);

  // Refs for keyboard shortcuts
  const searchInputRef = useRef(null);
  const viewButtonRef = useRef(null);
  const columnsButtonRef = useRef(null);
  const groupButtonRef = useRef(null);
  const rowsButtonRef = useRef(null);
  const exportButtonRef = useRef(null);

  // Save preferences automatically
  const handleSavePrefs = useCallback(
    (newPrefs) => {
      const merged = { ...prefs, ...newPrefs };
      savePreferences(merged);
      setPrefs(merged);
    },
    [prefs]
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
    [columns]
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
    defaultColumn: {
      minSize: 50, // Minimum width to prevent overflow of 3-dot menu and resizer
      maxSize: 600, // Maximum width for columns
    },
    initialState: {
      pagination: {
        pageSize: prefs.pageSize || 20,
      },
    },
  });

  // Keyboard shortcuts using react-hotkeys-hook (after table initialization)
  useHotkeys('/', (e) => {
    e.preventDefault();
    searchInputRef.current?.focus();
  }, { enableOnFormTags: false });

  useHotkeys('shift+r, R', (e) => {
    e.preventDefault();
    loadData();
  }, { enableOnFormTags: false });

  useHotkeys('r', (e) => {
    e.preventDefault();
    rowsButtonRef.current?.click();
  }, { enableOnFormTags: false });

  useHotkeys('v', (e) => {
    e.preventDefault();
    viewButtonRef.current?.click();
  }, { enableOnFormTags: false });

  useHotkeys('c', (e) => {
    e.preventDefault();
    if (exportMode === 'export') {
      const rows = table.getFilteredRowModel().rows.map(r => r.original);
      const cols = table.getVisibleLeafColumns()
        .filter(col => col.id !== 'select' && col.id !== 'actions' && col.id !== 'expand')
        .map(col => ({ id: col.id, header: col.columnDef.meta?.headerText || col.id }));
      exportToCSV(rows, cols);
      setExportMode(null);
    } else {
      columnsButtonRef.current?.click();
    }
  }, { enableOnFormTags: false });

  useHotkeys('g', (e) => {
    e.preventDefault();
    groupButtonRef.current?.click();
  }, { enableOnFormTags: false });

  useHotkeys('e', () => {
    if (exportMode === 'export') {
      const rows = table.getFilteredRowModel().rows.map(r => r.original);
      const cols = table.getVisibleLeafColumns()
        .filter(col => col.id !== 'select' && col.id !== 'actions' && col.id !== 'expand')
        .map(col => ({ id: col.id, header: col.columnDef.meta?.headerText || col.id }));
      exportToExcel(rows, cols);
      setExportMode(null);
    } else {
      exportButtonRef.current?.click();
      setExportMode('export');
      setTimeout(() => setExportMode(null), 3000);
    }
  }, { enableOnFormTags: false });

  useHotkeys('j', () => {
    if (exportMode === 'export') {
      const rows = table.getFilteredRowModel().rows.map(r => r.original);
      const cols = table.getVisibleLeafColumns()
        .filter(col => col.id !== 'select' && col.id !== 'actions' && col.id !== 'expand')
        .map(col => ({ id: col.id, header: col.columnDef.meta?.headerText || col.id }));
      exportToJSON(rows, cols);
      setExportMode(null);
    }
  }, { enableOnFormTags: false });

  useHotkeys('i', () => setShowShortcutsModal(true), { enableOnFormTags: false });

  useHotkeys('pageup', (e) => {
    e.preventDefault();
    if (table.getCanPreviousPage()) table.previousPage();
  }, { enableOnFormTags: false });

  useHotkeys('pagedown', (e) => {
    e.preventDefault();
    if (table.getCanNextPage()) table.nextPage();
  }, { enableOnFormTags: false });

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

  // Density classes - removed right padding
  const getDensityPadding = () => {
    switch (density) {
      case "compact":
        return "py-1 pl-2";
      case "comfortable":
        return "py-4 pl-4";
      default:
        return "py-2 pl-4";
    }
  };

  const isEmpty = table.getFilteredRowModel().rows.length === 0;

  // Border classes based on settings
  const getCellBorderClasses = () => {
    const borders = [];
    if (showRowLines) borders.push("border-b");
    if (showGridLines) borders.push("border-r");
    return borders.join(" ") + " border-(--color-border)";
  };

  const getHeaderBorderClasses = () => {
    const borders = ["border-b-2"];
    if (showHeaderLines || showGridLines) borders.push("border-r-2");
    return (
      borders.join(" ") +
      " border-[color-mix(in_oklch,var(--color-border),transparent_50%)]"
    );
  };

  // Position helpers
  const getLeftPos = (column) => getLeftPosition(column, table);
  const getRightPos = (column) => getRightPosition(column, table);

  return (
    <div
      className="w-full min-h-screen transition-colors p-8 pt-4 relative"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Dark Mode Toggle - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          onClick={toggleTheme}
          variant="outline"
          size="icon"
          className="h-11 w-11 border-2 shadow-lg transition-all bg-card"
          style={{
            borderColor: "var(--color-border)",
          }}
          title={
            theme === "dark"
              ? "Switch to Light Mode"
              : "Switch to Dark Mode"
          }
        >
          {theme === "dark" ? (
            <Sun
              className="h-5 w-5"
              style={{ color: "var(--color-chart-3)" }}
            />
          ) : (
            <Moon
              className="h-5 w-5"
              style={{ color: "var(--color-foreground)" }}
            />
          )}
        </Button>
      </div>

      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6 w-full text-center">
          <h1 className="text-4xl font-black mb-2 bg-clip-text text-primary">
            Nimbus - Advanced Enterprise DataGrid
          </h1>
          <p
            className="text-md max-w-2xl mx-auto tracking-tighter leading-tight"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Complete table with Advanced Filters, Multi-Column Sort, Column
            Reordering, Pinning, Resizing, Row Expansion, Grouping Aggregation &
            More
          </p>
        </div>

        {/* Main Table Container */}
        <div
          className="border-2 rounded-xl shadow-2xl overflow-hidden"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <DataGridToolbar
            table={table}
            columns={columns}
            onExport={handleExport}
            onResetPreferences={handleResetPreferences}
            onRefresh={loadData}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            searchInputRef={searchInputRef}
            viewButtonRef={viewButtonRef}
            columnsButtonRef={columnsButtonRef}
            groupButtonRef={groupButtonRef}
            exportButtonRef={exportButtonRef}
          />

          <div className="relative overflow-auto" style={{ maxHeight: "60vh" }}>
            <table className="w-full text-sm border-collapse">
              <AnimatePresence mode="wait">
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
              </AnimatePresence>
            </table>
          </div>

          {!loading && !isEmpty && <DataGridPagination table={table} />}
        </div>

        {/* Status Bar */}
        <div className="mt-6">
          <DataGridStatusBar table={table} />
        </div>

        <div className="text-center mt-6 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          Built with 💌 by Ankit Mishra • Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm">i</kbd> for keyboard shortcuts
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        open={showShortcutsModal}
        onOpenChange={setShowShortcutsModal}
      />
    </div>
  );
};

export default AdvancedDataGrid;
