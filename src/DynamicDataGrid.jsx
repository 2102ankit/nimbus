import { addHeadersToColumns } from "@/components/Datagrid/columnDefinitions";
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
import { Info, Maximize2, Minimize2, Upload } from "lucide-react";
import { animate } from "motion";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import StatusBarModal from "../components/Datagrid/StatusBarModal";
import { analyzeData } from "./dataAnalyzer";
import { FileUploadHandler } from "./FileUploadHandler";
import { generateSampleData } from "@/components/Datagrid/sampleDataGenerator";
import { applyColumnConfigs } from "./columnConfigSystem";
import { ColumnConfigurationMenu } from "./ColumnConfigurationMenu";

const DynamicDataGrid = () => {
    const { theme, toggleTheme, density, showGridLines, showHeaderLines, showRowLines } = useTheme();

    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [filename, setFilename] = useState("");

    // Separate state for immediate UI update and debounced filter
    const [searchInputValue, setSearchInputValue] = useState("");
    const [globalFilter, setGlobalFilter] = useState("");
    const debounceTimeoutRef = useRef(null);

    const [rowSelection, setRowSelection] = useState({});
    const [expanded, setExpanded] = useState({});
    const [grouping, setGrouping] = useState([]);

    const [prefs, setPrefs] = useState(loadPreferences);
    const [sorting, setSorting] = useState(prefs.sorting || []);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState(prefs.columnVisibility || {});
    const [columnOrder, setColumnOrder] = useState(prefs.columnOrder || []);
    const [columnSizing, setColumnSizing] = useState(prefs.columnSizing || {});
    const [columnPinning, setColumnPinning] = useState(prefs.columnPinning || { left: [], right: [] });
    const [showShortcutsModal, setShowShortcutsModal] = useState(false);
    const [exportMode, setExportMode] = useState(null);
    const [focusedColumnIndex, setFocusedColumnIndex] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    const searchInputRef = useRef(null);
    const [viewMenuOpen, setViewMenuOpen] = useState(false);
    const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
    const [groupMenuOpen, setGroupMenuOpen] = useState(false);
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const [configReloadTrigger, setConfigReloadTrigger] = useState(0);

    const handleConfigChange = useCallback(() => {
        setConfigReloadTrigger(t => t + 1);
    }, []);

    // Debounced global filter update
    useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
            setGlobalFilter(searchInputValue);
        }, 300);

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [searchInputValue]);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const sampleData = generateSampleData(250);
            const analyzed = analyzeData(sampleData);
            setData(analyzed.data);
            setColumns(analyzed.columns);
            setMetadata(analyzed.metadata);
            setLoading(false);
        }, 500);
    }, []);

    const handleSavePrefs = useCallback((newPrefs) => {
        const merged = { ...prefs, ...newPrefs };
        savePreferences(merged);
        setPrefs(merged);
    }, [prefs]);

    // Batch preference saves
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSavePrefs({
                sorting,
                columnVisibility,
                columnOrder,
                columnSizing,
                columnPinning
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [sorting, columnVisibility, columnOrder, columnSizing, columnPinning, handleSavePrefs]);

    const handleDataLoaded = useCallback((rawData, name = "Uploaded File") => {
        setLoading(true);
        setShowUpload(false);
        setFilename(name);

        // Reset all state
        setSorting([]);
        setColumnFilters([]);
        setColumnVisibility({});
        setRowSelection({});
        setSearchInputValue("");
        setGlobalFilter("");
        setColumnOrder([]);
        setColumnSizing({});
        setColumnPinning({ left: [], right: [] });
        setExpanded({});
        setGrouping([]);

        requestAnimationFrame(() => {
            setTimeout(() => {
                const analyzed = analyzeData(rawData);
                setData(analyzed.data);
                setColumns(analyzed.columns);
                setMetadata(analyzed.metadata);
                setLoading(false);
            }, 300);
        });
    }, []);

    // Memoize columns processing
    const columnsWithHeadersAndConfigs = useMemo(() => {
        if (columns.length === 0) return [];
        const configuredColumns = applyColumnConfigs(columns);
        const withHeaders = addHeadersToColumns(configuredColumns);
        return withHeaders;
    }, [columns, configReloadTrigger]);

    const table = useReactTable({
        data,
        columns: columnsWithHeadersAndConfigs,
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
        columnResizeDirection: "ltr",
        enableSorting: true,
        enableMultiSort: true,
        enableFilters: true,
        enablePinning: true,
        enableExpanding: metadata?.hasNestedData || false,
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
            size: 200,
            minSize: 50,
            maxSize: 600,
        },
        initialState: {
            pagination: {
                pageSize: prefs.pageSize || 20,
            },
        },
    });

    const scrollColumnIntoView = useCallback((column, direction, isWrapping = false) => {
        if (!column) return;

        requestAnimationFrame(() => {
            const tableContainer = document.querySelector('[role="grid"]')?.parentElement;
            if (!tableContainer) return;

            const headerCell = Array.from(document.querySelectorAll('th')).find(
                th => th.textContent?.includes(column.columnDef?.meta?.headerText || column.id)
            );
            if (!headerCell) return;

            const leftPinnedColumns = table.getState().columnPinning.left || [];
            let leftPinnedWidth = 0;
            leftPinnedColumns.forEach(colId => {
                const col = table.getAllLeafColumns().find(c => c.id === colId);
                if (col) leftPinnedWidth += col.getSize();
            });

            const rightPinnedColumns = table.getState().columnPinning.right || [];
            let rightPinnedWidth = 0;
            rightPinnedColumns.forEach(colId => {
                const col = table.getAllLeafColumns().find(c => c.id === colId);
                if (col) rightPinnedWidth += col.getSize();
            });

            const containerRect = tableContainer.getBoundingClientRect();
            const cellRect = headerCell.getBoundingClientRect();
            const currentScroll = tableContainer.scrollLeft;
            let targetScrollLeft = currentScroll;

            if (direction === 'right') {
                const cellLeftRelativeToScroll = cellRect.left - containerRect.left + currentScroll;
                targetScrollLeft = cellLeftRelativeToScroll - leftPinnedWidth - 10;
            } else if (direction === 'left') {
                const cellRightRelativeToScroll = cellRect.right - containerRect.left + currentScroll;
                const visibleAreaEnd = containerRect.width - rightPinnedWidth;
                targetScrollLeft = cellRightRelativeToScroll + 10 - visibleAreaEnd;
            }

            if (isWrapping) {
                tableContainer.scrollLeft = targetScrollLeft;
            } else {
                animate(currentScroll, targetScrollLeft, {
                    duration: 0.25,
                    ease: [0.25, 1, 0.5, 1],
                    onUpdate: (latest) => {
                        tableContainer.scrollLeft = latest;
                    }
                });
            }
        });
    }, [table]);

    // Keyboard shortcuts
    useHotkeys('slash', (e) => {
        e.preventDefault();
        searchInputRef.current?.focus();
    }, { enableOnFormTags: true });

    useHotkeys('u', (e) => {
        e.preventDefault();
        setShowUpload(true);
    }, { enableOnFormTags: false });

    useHotkeys('d', () => toggleTheme(), { enableOnFormTags: false });
    useHotkeys('i', () => setShowShortcutsModal((v) => !v), { enableOnFormTags: false });
    useHotkeys('f', () => setIsFullscreen((v) => !v), { enableOnFormTags: false });
    useHotkeys('s', () => setShowStatusModal((v) => !v), { enableOnFormTags: false });

    useHotkeys('c', (e) => {
        e.preventDefault();
        if (!exportMenuOpen) {
            if (exportMode === 'export') {
                const rows = table.getFilteredRowModel().rows.map(r => r.original);
                const cols = table.getVisibleLeafColumns()
                    .filter(col => col.id !== 'select' && col.id !== 'expand')
                    .map(col => ({ id: col.id, header: col.columnDef.meta?.headerText || col.id }));
                exportToCSV(rows, cols);
                setExportMode(null);
            } else {
                setColumnsMenuOpen((v) => !v);
            }
        }
    }, { enableOnFormTags: false });

    useHotkeys('e', () => {
        if (exportMenuOpen) {
            setExportMenuOpen(false);
            setExportMode(null);
        } else if (exportMode === 'export') {
            const rows = table.getFilteredRowModel().rows.map(r => r.original);
            const cols = table.getVisibleLeafColumns()
                .filter(col => col.id !== 'select' && col.id !== 'expand')
                .map(col => ({ id: col.id, header: col.columnDef.meta?.headerText || col.id }));
            exportToExcel(rows, cols);
            setExportMode(null);
        } else {
            setExportMenuOpen(true);
            setExportMode('export');
            setTimeout(() => {
                if (!exportMenuOpen) {
                    setExportMode(null);
                }
            }, 3000);
        }
    }, { enableOnFormTags: false });

    useHotkeys('j', () => {
        if (exportMode === 'export' && !exportMenuOpen) {
            const rows = table.getFilteredRowModel().rows.map(r => r.original);
            const cols = table.getVisibleLeafColumns()
                .filter(col => col.id !== 'select' && col.id !== 'expand')
                .map(col => ({ id: col.id, header: col.columnDef.meta?.headerText || col.id }));
            exportToJSON(rows, cols);
            setExportMode(null);
        }
    }, { enableOnFormTags: false });

    useHotkeys('v', (e) => {
        e.preventDefault();
        setViewMenuOpen((v) => !v);
    }, { enableOnFormTags: false });

    useHotkeys('g', (e) => {
        e.preventDefault();
        setGroupMenuOpen((v) => !v);
    }, { enableOnFormTags: false });

    useHotkeys('esc', (e) => {
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
                scrollColumnIntoView(visibleColumns[newIndex], 'left', true);
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
                scrollColumnIntoView(visibleColumns[0], 'right', true);
                return 0;
            }
            const newIndex = prev + 1;
            scrollColumnIntoView(visibleColumns[newIndex], 'right', false);
            return newIndex;
        });
    }, { enableOnFormTags: false });

    const handleExport = useCallback((format, rows, cols) => {
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
    }, []);

    const handleResetPreferences = useCallback(() => {
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
    }, [table]);

    const getDensityPadding = useCallback(() => {
        switch (density) {
            case "compact":
                return "py-1 pl-2";
            case "comfortable":
                return "py-4 pl-4";
            default:
                return "py-2 pl-4";
        }
    }, [density]);

    const isEmpty = table.getFilteredRowModel().rows.length === 0;

    const getCellBorderClasses = useCallback(() => {
        const borders = [];
        if (showRowLines) borders.push("border-b");
        if (showGridLines) borders.push("border-r");
        return borders.join(" ") + " border-(--color-border)";
    }, [showRowLines, showGridLines]);

    const getHeaderBorderClasses = useCallback(() => {
        const borders = ["border-b-2"];
        if (showHeaderLines || showGridLines) borders.push("border-r-2");
        return (
            borders.join(" ") +
            " border-[color-mix(in_oklch,var(--color-border),transparent_50%)]"
        );
    }, [showHeaderLines, showGridLines]);

    const getLeftPos = useCallback((column) => getLeftPosition(column, table), [table]);
    const getRightPos = useCallback((column) => getRightPosition(column, table), [table]);

    return (
        <div
            className="w-full min-h-screen transition-colors relative scrollbar-hide"
            style={{
                backgroundColor: "var(--color-background)",
                willChange: isFullscreen ? 'padding, margin' : 'auto'
            }}
        >
            <AnimatePresence>
                {showUpload && (
                    <FileUploadHandler
                        onDataLoaded={handleDataLoaded}
                        onClose={() => setShowUpload(false)}
                    />
                )}
            </AnimatePresence>

            <motion.div
                layout
                className="w-full relative z-10"
                animate={{
                    padding: isFullscreen ? "0" : "0.5rem 2rem",
                    marginTop: isFullscreen ? "0" : "0",
                }}
                transition={{
                    type: "tween",
                    duration: 0.3,
                    ease: [0.25, 1, 0.5, 1]
                }}
            >
                <div className={`max-w-[1600px] mx-auto ${isFullscreen ? "h-screen" : ""}`}>
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
                    {!isFullscreen && (
                        <Info className="absolute top-0 right-0 text-primary m-4 cursor-pointer" onClick={() => (setShowShortcutsModal((v) => !v))} />
                    )}

                    {data.length > 0 && !isFullscreen && (
                        <Button
                            onClick={() => setShowUpload(true)}
                            variant="outline"
                            className="absolute top-0 right-12 m-4 border-2"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload New File
                        </Button>
                    )}

                    {data.length > 0 && (
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
                                borderRadius: isFullscreen ? "0" : "12px"
                            }}
                            transition={{
                                layout: { duration: 0 },
                                borderRadius: {
                                    type: "tween",
                                    duration: 0.3,
                                    ease: [0.25, 1, 0.5, 1]
                                },
                            }}
                        >
                            <DataGridToolbar
                                table={table}
                                columns={columns}
                                onExport={handleExport}
                                onResetPreferences={handleResetPreferences}
                                onRefresh={() => {
                                    setLoading(true);
                                    setTimeout(() => {
                                        const sampleData = generateSampleData(250);
                                        const analyzed = analyzeData(sampleData);
                                        setData(analyzed.data);
                                        setColumns(analyzed.columns);
                                        setMetadata(analyzed.metadata);
                                        setLoading(false);
                                    }, 500);
                                }}
                                globalFilter={globalFilter}
                                onGlobalFilterChange={setGlobalFilter}
                                searchInputValue={searchInputValue}
                                onSearchInputChange={(e) => setSearchInputValue(e.target.value)}
                                searchInputRef={searchInputRef}
                                viewMenuOpen={viewMenuOpen}
                                setViewMenuOpen={setViewMenuOpen}
                                columnsMenuOpen={columnsMenuOpen}
                                setColumnsMenuOpen={setColumnsMenuOpen}
                                groupMenuOpen={groupMenuOpen}
                                setGroupMenuOpen={setGroupMenuOpen}
                                exportMenuOpen={exportMenuOpen}
                                setExportMenuOpen={setExportMenuOpen}
                                extraButtons={
                                    <>
                                        <ColumnConfigurationMenu
                                            columns={columnsWithHeadersAndConfigs}
                                            onConfigChange={handleConfigChange}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsFullscreen(!isFullscreen)}
                                            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                                            className="h-11 border-2 shadow-sm bg-background color-foreground border-border transition-all duration-150 hover:scale-105"
                                            style={{ color: "var(--color-muted-foreground)" }}
                                        >
                                            {isFullscreen ? (
                                                <Minimize2 className="h-4 w-4" />
                                            ) : (
                                                <Maximize2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </>
                                }
                            />

                            <div
                                className="flex-1 overflow-auto min-h-0"
                                style={{
                                    overscrollBehavior: 'none',
                                    scrollBehavior: 'auto',
                                    willChange: 'scroll-position',
                                }}
                                role="grid"
                            >
                                <table
                                    className="w-full text-sm border-collapse"
                                    style={{
                                        width: 'max-content',
                                        minWidth: '100%',
                                        contain: 'layout style paint',
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
                    )}

                    {!isFullscreen && (
                        <div className="text-center mt-6 text-sm text-muted-foreground">
                            Built with ❤️ by {" "}
                            <a href="https://x.com/2102ankit" target="_blank" className="underline px-0" > Ankit Mishra</a> {" "}
                            • Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm">i</kbd> for shortcuts
                        </div>
                    )}
                </div>
            </motion.div>

            <StatusBarModal open={showStatusModal} onOpenChange={setShowStatusModal} table={table} rowSelection={rowSelection} filename={filename} />
            <KeyboardShortcutsModal open={showShortcutsModal} onOpenChange={setShowShortcutsModal} />
        </div>
    );
};

export default DynamicDataGrid;