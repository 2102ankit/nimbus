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
import { ColumnConfigurationMenu } from "@/src/ColumnConfigurationMenu";
import { generateSampleData } from "@/components/Datagrid/sampleDataGenerator";
import { getColumnConfig, setColumnConfig } from "@/src/columnConfigSystem";
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
import { Info, Maximize2, Minimize2, Layout } from "lucide-react";
import { animate } from "motion";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import StatusBarModal from "./StatusBarModal";
import { Link } from "react-router-dom";

const AdvancedDataGrid = () => {
  const { theme, toggleTheme, density, showGridLines, showHeaderLines, showRowLines, currency, locale } = useTheme();

  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    setSearchInputValue(globalFilter);
  }, [globalFilter]);

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
  const [focusedColumnIndex, setFocusedColumnIndex] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Refs for keyboard shortcuts
  const searchInputRef = useRef(null);
  const viewButtonRef = useRef(null);
  const columnsButtonRef = useRef(null);
  const groupButtonRef = useRef(null);
  const exportButtonRef = useRef(null);

  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const updateGlobalFilter = useCallback((value) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setGlobalFilter(value);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const columns = useMemo(() => createColumns([], currency, locale), [currency, locale]);

  // Save preferences automatically
  const handleSavePrefs = useCallback(
    (newPrefs) => {
      setPrefs(prev => {
        const merged = { ...prev, ...newPrefs };
        // Only update if something actually changed to avoid "hasn't mounted yet" warnings
        if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;

        savePreferences(merged);
        return merged;
      });
    },
    []
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
      setData(generateSampleData(250));
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Define columns and apply configurations
  const columnsWithHeaders = useMemo(() => {
    const baseColumns = createColumns([], currency, locale);
    const configuredColumns = baseColumns.map(col => {
      const config = getColumnConfig(col.id || col.accessorKey);
      if (!config) return col;

      return {
        ...col,
        header: config.headerText || col.header,
        enableSorting: config.sortable !== undefined ? config.sortable : col.enableSorting,
        enableColumnFilter: config.filterable !== undefined ? config.filterable : col.enableColumnFilter,
        enableResizing: config.resizable !== undefined ? config.resizable : col.enableResizing,
        enableGrouping: config.forceEnum !== undefined ? config.forceEnum : col.enableGrouping,
        meta: {
          ...col.meta,
          headerText: config.headerText || col.meta?.headerText,
          dataType: config.dataType || col.meta?.dataType,
        }
      };
    });
    return addHeadersToColumns(configuredColumns);
  }, [columns, currency, locale, prefs]); // prefs as dependency to trigger re-render on save

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

  // Task 3: Implement persistent row reordering
  const onRowReorder = useCallback((activeId, overId) => {
    setData((old) => {
      const oldIndex = old.findIndex((r) => r.id === activeId);
      const newIndex = old.findIndex((r) => r.id === overId);
      if (oldIndex === -1 || newIndex === -1) return old;

      const newData = [...old];
      const [movedRow] = newData.splice(oldIndex, 1);
      newData.splice(newIndex, 0, movedRow);
      return newData;
    });
  }, []);

  // Task 3: Row pinning state (if needed to be persistent beyond session)
  // Note: TanStack Table's row pinning is usually transient. 
  // We can track pinned row IDs in preferences if desired.
  useEffect(() => {
    // This is a placeholder if we want to persist row pinning
    // handleSavePrefs({ pinnedRowIds: table.getState().rowPinning });
  }, [table.getState().rowPinning]);

  const scrollColumnIntoView = (column, direction, isWrapping = false) => {
    if (!column) return;

    setTimeout(() => {
      const tableContainer = document.querySelector('.overflow-auto');
      if (!tableContainer) return;

      const columnId = column.id;
      const headerCell = document.querySelector(`[data-column-id="${columnId}"]`);
      if (!headerCell) return;

      // Calculate total width of left pinned columns
      const leftPinnedColumns = table.getState().columnPinning.left || [];
      let leftPinnedWidth = 0;
      leftPinnedColumns.forEach(colId => {
        const col = table.getAllLeafColumns().find(c => c.id === colId);
        if (col) leftPinnedWidth += col.getSize();
      });

      // Calculate right pinned columns width
      const rightPinnedColumns = table.getState().columnPinning.right || [];
      let rightPinnedWidth = 0;
      rightPinnedColumns.forEach(colId => {
        const col = table.getAllLeafColumns().find(c => c.id === colId);
        if (col) rightPinnedWidth += col.getSize();
      });

      const containerRect = tableContainer.getBoundingClientRect();
      const cellRect = headerCell.getBoundingClientRect();

      // Get current scroll position
      const currentScroll = tableContainer.scrollLeft;

      const borderWidth = 2;
      let targetScrollLeft;

      if (direction === 'right') {
        // Moving right: align left border of cell to right border of left-pinned columns
        const cellLeftRelativeToScroll = cellRect.left - containerRect.left + currentScroll;
        targetScrollLeft = cellLeftRelativeToScroll - leftPinnedWidth;
      } else if (direction === 'left') {
        // Moving left: align right border of cell to left border of right-pinned columns
        const cellRightRelativeToScroll = cellRect.right - containerRect.left + currentScroll;
        const visibleAreaEnd = containerRect.width - rightPinnedWidth;
        targetScrollLeft = cellRightRelativeToScroll + borderWidth - visibleAreaEnd;
      }

      // If wrapping around, use instant scroll; otherwise animate smoothly
      if (isWrapping) {
        tableContainer.scrollLeft = targetScrollLeft;
      } else {
        // Animate the scroll with framer motion
        animate(currentScroll, targetScrollLeft, {
          duration: 0.3,
          ease: [0.4, 0.0, 0.2, 1],
          onUpdate: (latest) => {
            tableContainer.scrollLeft = latest;
          }
        });
      }
    }, 0);
  };

  const clearAllFilters = () => {
    table.resetColumnFilters();
    table.resetSorting();
    table.setGrouping([]);
    updateGlobalFilter("");
  };

  // Keyboard shortcuts using react-hotkeys-hook (after table initialization)
  useHotkeys('slash', (e) => {
    e.preventDefault();
    searchInputRef.current?.focus();
  }, { enableOnFormTags: true });

  useHotkeys('shift+r, R', (e) => {
    e.preventDefault();
    clearAllFilters();
  }, { enableOnFormTags: false });

  useHotkeys('r', (e) => {
    e.preventDefault();
    clearAllFilters();
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

  useHotkeys('esc', () => {
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

  useHotkeys('left', (e) => {
    if (document.activeElement === searchInputRef.current) return;
    e.preventDefault();

    const visibleColumns = table.getVisibleLeafColumns()
      .filter(col => col.id !== 'select' && col.id !== 'expand' && !col.getIsPinned());

    if (visibleColumns.length === 0) return;

    setFocusedColumnIndex(prev => {
      const isWrapping = prev === null || prev <= 0;

      if (isWrapping) {
        const newIndex = visibleColumns.length - 1;
        scrollColumnIntoView(visibleColumns[newIndex], 'left', true); // Pass true for wrapping
        return newIndex;
      }

      const newIndex = prev - 1;
      scrollColumnIntoView(visibleColumns[newIndex], 'left', false);
      return newIndex;
    });
  }, { enableOnFormTags: false });

  useHotkeys('right', (e) => {
    if (document.activeElement === searchInputRef.current) return;
    e.preventDefault();

    const visibleColumns = table.getVisibleLeafColumns()
      .filter(col => col.id !== 'select' && col.id !== 'expand' && !col.getIsPinned());

    if (visibleColumns.length === 0) return;


    setFocusedColumnIndex(prev => {
      const isWrapping = prev === null || prev >= visibleColumns.length - 1;

      if (isWrapping) {
        scrollColumnIntoView(visibleColumns[0], 'right', true); // Pass true for wrapping
        return 0;
      }

      const newIndex = prev + 1;
      scrollColumnIntoView(visibleColumns[newIndex], 'right', false);
      return newIndex;
    });
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
                  Nimbus<span className="text-white!">☁️</span>- Enterprise DataGrid
                </h1>
                <p className="text-md max-w-2xl mx-auto tracking-tighter leading-tight text-muted-foreground">
                  Complete table with Advanced Filters, Multi-Column Sort, Column Reordering, Pinning, Resizing, Row Expansion, Grouping Aggregation & More
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="flex flex-col bg-card border border-border shadow-sm overflow-hidden"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
              height: isFullscreen ? "100dvh" : "auto",
              maxHeight: isFullscreen ? "none" : "80vh",
            }}
            animate={{
              borderRadius: isFullscreen ? 0 : 12
            }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1]
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
              onGlobalFilterChange={updateGlobalFilter}
              searchInputValue={searchInputValue}
              onSearchInputChange={setSearchInputValue}
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
              clearAllFilters={clearAllFilters}
              extraButtons={
                <div className="flex gap-2">
                  <ColumnConfigurationMenu
                    columns={table.getAllLeafColumns()}
                    onConfigChange={() => {
                      // Trigger a re-render by updating prefs
                      setPrefs(loadPreferences());
                    }}
                  />
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
                </div>
              }
            />

            {/* Scrollable Table */}
            <div
              className="flex-1 overflow-auto min-h-0"
              style={{
                overscrollBehavior: 'none',
              }}
            >
              <table className="w-full text-sm border-collapse"
                style={{
                  width: 'max-content',
                  minWidth: '100%'
                }}
              >
                <DataGridTableHeader
                  table={table}
                  getDensityPadding={getDensityPadding}
                  getHeaderBorderClasses={getHeaderBorderClasses}
                  getLeftPosition={getLeftPos}
                  getRightPosition={getRightPos}
                  focusedColumnIndex={focusedColumnIndex}
                />
                <DataGridTableBody
                  table={table}
                  loading={loading}
                  isEmpty={isEmpty}
                  getDensityPadding={getDensityPadding}
                  getCellBorderClasses={getCellBorderClasses}
                  getLeftPosition={getLeftPos}
                  getRightPosition={getRightPos}
                  onRowReorder={onRowReorder}
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
              • Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm">i</kbd> for shortcuts • {" "}
              <Link to="/beta">Dynamic Grid (beta)</Link>
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
