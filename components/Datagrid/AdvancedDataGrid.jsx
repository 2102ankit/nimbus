import {
  addHeadersToColumns,
  createColumns,
} from "@/components/Datagrid/columnDefinitions";
import { DataGridPagination } from "@/components/Datagrid/DataGridPagination";
import { DataGridTableBody } from "@/components/Datagrid/DataGridTableBody";
import { DataGridTableHeader } from "@/components/Datagrid/DataGridTableHeader";
import { DataGridToolbar } from "@/components/Datagrid/DataGridToolbar";
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
import { KeyboardShortcutsModal } from "@/components/Datagrid/KeyboardShortcutsModal";
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
import { Info, Maximize2, Minimize2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import StatusBarModal from "./StatusBarModal";

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

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Refs for keyboard shortcuts
  const searchInputRef = useRef(null);
  const viewButtonRef = useRef(null);
  const columnsButtonRef = useRef(null);
  const groupButtonRef = useRef(null);
  const rowsButtonRef = useRef(null);
  const exportButtonRef = useRef(null);

  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

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
  useHotkeys('slash', (e) => {
    e.preventDefault();
    searchInputRef.current?.focus();
  }, { enableOnFormTags: true });

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
    setViewMenuOpen((v) => !v);
  }, { enableOnFormTags: false });

  useHotkeys('g', (e) => {
    e.preventDefault();
    setGroupMenuOpen((v) => !v);
  }, { enableOnFormTags: false });

  useHotkeys('e', () => {
    if (exportMenuOpen) {
      // Menu is open, close it without exporting
      setExportMenuOpen(false);
      setExportMode(null);
    } else if (exportMode === 'export') {
      // Menu was just closed, now export
      const rows = table.getFilteredRowModel().rows.map(r => r.original);
      const cols = table.getVisibleLeafColumns()
        .filter(col => col.id !== 'select' && col.id !== 'actions' && col.id !== 'expand')
        .map(col => ({ id: col.id, header: col.columnDef.meta?.headerText || col.id }));
      exportToExcel(rows, cols);
      setExportMode(null);
    } else {
      // Open menu and set export mode
      setExportMenuOpen(true);
      setExportMode('export');
      setTimeout(() => {
        if (!exportMenuOpen) {
          setExportMode(null);
        }
      }, 3000);
    }
  }, { enableOnFormTags: false });

  useHotkeys('c', (e) => {
    e.preventDefault();
    if (!exportMenuOpen) {
      if (exportMode === 'export') {
        const rows = table.getFilteredRowModel().rows.map(r => r.original);
        const cols = table.getVisibleLeafColumns()
          .filter(col => col.id !== 'select' && col.id !== 'actions' && col.id !== 'expand')
          .map(col => ({ id: col.id, header: col.columnDef.meta?.headerText || col.id }));
        exportToCSV(rows, cols);
        setExportMode(null);
      } else {
        setColumnsMenuOpen((v) => !v);
      }
    }
  }, { enableOnFormTags: false });

  useHotkeys('j', () => {
    if (exportMode === 'export' && !exportMenuOpen) {
      const rows = table.getFilteredRowModel().rows.map(r => r.original);
      const cols = table.getVisibleLeafColumns()
        .filter(col => col.id !== 'select' && col.id !== 'actions' && col.id !== 'expand')
        .map(col => ({ id: col.id, header: col.columnDef.meta?.headerText || col.id }));
      exportToJSON(rows, cols);
      setExportMode(null);
    }
  }, { enableOnFormTags: false });

  useHotkeys('d', () => toggleTheme(), { enableOnFormTags: false });

  useHotkeys('i', () => setShowShortcutsModal((v) => !v), { enableOnFormTags: false });

  useHotkeys('f', () => setIsFullscreen((v) => !v), { enableOnFormTags: false });

  useHotkeys('s', () => setShowStatusModal((v) => !v), { enableOnFormTags: false });

useHotkeys('esc', (e) => {
  // e.preventDefault();
  if (document.activeElement === searchInputRef.current) {
    searchInputRef.current?.blur();
  } else if (isFullscreen) {
    setIsFullscreen(false);
  }
}, { enableOnFormTags: true });

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
      className="w-full min-h-screen transition-colors relative scrollbar-hide"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Main Content */}
      <motion.div
        layout
        className="w-full relative z-10"
        animate={{
          padding: isFullscreen ? "0" : "0.5rem 2rem",
          marginTop: isFullscreen ? "0" : "0",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className={`max-w-[1600px] mx-auto ${isFullscreen ? "h-screen" : ""}`}>
          {/* Header - Hidden in fullscreen */}
          <AnimatePresence>
            {!isFullscreen && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3 }}
                className="mb-4 w-full text-center"
              >
                <h1 className="text-4xl font-black mb-1 bg-clip-text text-transparent bg-linear-to-r from-primary to-primary/60">
                  Nimbus - Advanced Enterprise DataGrid
                </h1>
                <p className="text-md max-w-2xl mx-auto tracking-tighter leading-tight text-muted-foreground">
                  Complete table with Advanced Filters, Multi-Column Sort, Column Reordering, Pinning, Resizing, Row Expansion, Grouping Aggregation & More
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {!isFullscreen && (

            <Info className="absolute top-0 right-0 text-primary m-4" onClick={() => (setShowShortcutsModal((v) => !v))} />

          )}
          {/* Table Card */}
          <motion.div
            layout="position"
            className="border-2 rounded-xl shadow-2xl overflow-hidden flex flex-col"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
              height: isFullscreen ? "100dvh" : "auto",
              maxHeight: isFullscreen ? "none" : "80vh",
            }}
            animate={{
              borderRadius: isFullscreen ? "0" : "12px",
              // boxShadow: isFullscreen
              //   ? "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
              //   : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            // transition={{ type: "spring", stiffness: 300, damping: 30 }}
            transition={{
              layout: { duration: 0, stiffness: 0 }, // disable layout animation
              borderRadius: {
                type: "spring",
                stiffness: 300,
                damping: 30
              },
            }}
          >
            {/* Toolbar with Fullscreen Toggle */}
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
              viewMenuOpen={viewMenuOpen}
              setViewMenuOpen={setViewMenuOpen}
              columnsMenuOpen={columnsMenuOpen}
              setColumnsMenuOpen={setColumnsMenuOpen}
              groupMenuOpen={groupMenuOpen}
              setGroupMenuOpen={setGroupMenuOpen}
              exportMenuOpen={exportMenuOpen}
              setExportMenuOpen={setExportMenuOpen}
              extraButtons={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  className="h-11 border-2 shadow-sm bg-background color-foreground border-border"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>

              }
            />

            {/* Scrollable Table */}
            <div
              className="flex-1 overflow-auto min-h-0"
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
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DataGridPagination table={table} />
            </motion.div>
          </motion.div>

          {/* Footer Credit */}
          {!isFullscreen && (
            <div className="text-center mt-6 text-sm text-muted-foreground">
              Built with ❤️ by {" "}
              <a href="https://x.com/2102ankit" target="_blank" className="underline px-0" > Ankit Mishra</a> {" "}
              • Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm">i</kbd> for shortcuts
            </div>
          )}
        </div>
      </motion.div>

      <StatusBarModal open={showStatusModal} onOpenChange={setShowStatusModal} table={table} rowSelection={rowSelection} />
      <KeyboardShortcutsModal open={showShortcutsModal} onOpenChange={setShowShortcutsModal} />
    </div>
  );
};

export default AdvancedDataGrid;
