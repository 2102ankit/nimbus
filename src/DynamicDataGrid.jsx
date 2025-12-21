import { addHeadersToColumns } from "@/components/Datagrid/columnDefinitions";
import { DataGridPagination } from "@/components/Datagrid/DataGridPagination";
import { DataGridTableBody } from "@/components/Datagrid/DataGridTableBody";
import { DataGridTableHeader } from "@/components/Datagrid/DataGridTableHeader";
import { DataGridToolbar } from "@/components/Datagrid/DataGridToolbar";
import {
    exportToExcel,
    exportToCSV,
    exportToJSON,
    getLeftPosition,
    getRightPosition,
    loadPreferences,
    resetPreferences,
    savePreferences,
} from "@/components/Datagrid/dataGridUtils";
import { KeyboardShortcutsModal } from "@/components/Datagrid/KeyboardShortcutsModal";
import { useTheme } from "@/components/ThemeProvider";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
    getCoreRowModel,
    getExpandedRowModel,
    getGroupedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { arrayMove } from "@dnd-kit/sortable";
import { Info, Maximize2, Minimize2, Upload, ArrowRight } from "lucide-react";
import { animate } from "motion";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import StatusBarModal from "../components/Datagrid/StatusBarModal";
import { analyzeData } from "./dataAnalyzer";
import { FileUploadHandler } from "./FileUploadHandler";
import { generateSampleData } from "@/components/Datagrid/sampleDataGenerator";
import { applyColumnConfigs } from "./columnConfigSystem";
import { ColumnConfigurationMenu } from "./ColumnConfigurationMenu";
import { useDataWorker } from "./useDataWorker";
import { Link } from "react-router-dom";
import { createColumns } from "@/components/Datagrid/columnDefinitions";

const DynamicDataGrid = () => {
    const { theme, toggleTheme, density, showGridLines, showHeaderLines, showRowLines } = useTheme();
    const { isReady: workerReady, processData } = useDataWorker();

    const [rawData, setRawData] = useState([]);
    const [displayData, setDisplayData] = useState([]);
    const [filteredCount, setFilteredCount] = useState(0);
    const [columns, setColumns] = useState([]);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [filename, setFilename] = useState("");

    const [searchInputValue, setSearchInputValue] = useState("");
    const [globalFilter, setGlobalFilter] = useState("");
    const debounceTimeoutRef = useRef(null);

    const [rowSelection, setRowSelection] = useState({});
    const [expanded, setExpanded] = useState({});
    const [grouping, setGrouping] = useState([]);
    const [pivotMode, setPivotMode] = useState(false);

    const [prefs, setPrefs] = useState(loadPreferences);
    const [sorting, setSorting] = useState(prefs.sorting || []);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState(prefs.columnVisibility || {});
    const [columnOrder, setColumnOrder] = useState(prefs.columnOrder || []);
    const [columnSizing, setColumnSizing] = useState(prefs.columnSizing || {});
    const [columnPinning, setColumnPinning] = useState(prefs.columnPinning || { left: [], right: [] });
    const [rowPinning, setRowPinning] = useState({ top: [], bottom: [] });
    const [showShortcutsModal, setShowShortcutsModal] = useState(false);
    const [exportMode, setExportMode] = useState(null);
    const [focusedColumnIndex, setFocusedColumnIndex] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [pageIndex, setPageIndex] = useState(prefs.pageIndex || 0);
    const [pageSize, setPageSize] = useState(prefs.pageSize || 20);

    const searchInputRef = useRef(null);
    const [viewMenuOpen, setViewMenuOpen] = useState(false);
    const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
    const [groupMenuOpen, setGroupMenuOpen] = useState(false);
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const [configReloadTrigger, setConfigReloadTrigger] = useState(0);


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

    const handleConfigChange = useCallback(() => {
        setConfigReloadTrigger(t => t + 1);
    }, []);

    // Process data with worker
    const processDataWithWorker = useCallback(async () => {
        if (!workerReady || rawData.length === 0) return;

        setProcessing(true);
        try {
            // Log what we're sending to worker
            console.log('Processing with worker:', {
                dataCount: rawData.length,
                sorting,
                filters: columnFilters,
                globalFilter
            });

            const result = await processData('FULL_PROCESS', rawData, {
                filters: columnFilters,
                globalFilter: globalFilter,
                sorting: sorting,
                pageIndex: pageIndex,
                pageSize: pageSize
            });

            console.log('Worker result:', {
                filteredCount: result.totalRows,
                paginatedCount: result.paginated.length
            });

            setDisplayData(result.paginated);
            setFilteredCount(result.totalRows);
        } catch (error) {
            console.error('Worker processing error:', error);
            // Fallback to client-side processing
            let processed = [...rawData];

            // Apply global filter
            if (globalFilter) {
                const searchLower = globalFilter.toLowerCase();
                processed = processed.filter(row => {
                    return Object.values(row).some(value => {
                        if (value == null) return false;
                        return String(value).toLowerCase().includes(searchLower);
                    });
                });
            }

            // Apply column filters
            if (columnFilters.length > 0) {
                processed = processed.filter(row => {
                    return columnFilters.every(filter => {
                        const { id, value } = filter;
                        let cellValue = row[id];

                        // Handle sanitized keys
                        if (cellValue === undefined) {
                            const keys = Object.keys(row);
                            const matchingKey = keys.find(k => k.replace(/[^a-zA-Z0-9_]/g, '_') === id);
                            if (matchingKey) cellValue = row[matchingKey];
                        }

                        if (!value) return true;

                        const { operator, value: filterValue } = value;

                        if (operator === 'isEmpty') {
                            return cellValue == null || String(cellValue).trim() === '';
                        }
                        if (operator === 'isNotEmpty') {
                            return cellValue != null && String(cellValue).trim() !== '';
                        }

                        const strValue = String(cellValue || '').toLowerCase();
                        const strFilter = String(filterValue).toLowerCase();

                        switch (operator) {
                            case 'contains': return strValue.includes(strFilter);
                            case 'notContains': return !strValue.includes(strFilter);
                            case 'equals': return strValue === strFilter;
                            case 'notEquals': return strValue !== strFilter;
                            case 'startsWith': return strValue.startsWith(strFilter);
                            case 'endsWith': return strValue.endsWith(strFilter);
                            default: return true;
                        }
                    });
                });
            }

            // Apply sorting
            if (sorting.length > 0) {
                processed.sort((a, b) => {
                    for (const sort of sorting) {
                        const { id, desc } = sort;
                        let aVal = a[id];
                        let bVal = b[id];

                        // Handle sanitized keys
                        if (aVal === undefined) {
                            const keys = Object.keys(a);
                            const matchingKey = keys.find(k => k.replace(/[^a-zA-Z0-9_]/g, '_') === id);
                            if (matchingKey) aVal = a[matchingKey];
                        }
                        if (bVal === undefined) {
                            const keys = Object.keys(b);
                            const matchingKey = keys.find(k => k.replace(/[^a-zA-Z0-9_]/g, '_') === id);
                            if (matchingKey) bVal = b[matchingKey];
                        }

                        if (aVal === bVal) continue;

                        if (aVal == null) return desc ? 1 : -1;
                        if (bVal == null) return desc ? -1 : 1;

                        // Try numeric comparison
                        const aNum = parseFloat(aVal);
                        const bNum = parseFloat(bVal);
                        if (!isNaN(aNum) && !isNaN(bNum)) {
                            const comparison = aNum - bNum;
                            return desc ? -comparison : comparison;
                        }

                        // String comparison
                        if (typeof aVal === 'string' && typeof bVal === 'string') {
                            const comparison = aVal.localeCompare(bVal, undefined, { numeric: true });
                            return desc ? -comparison : comparison;
                        }

                        const comparison = aVal < bVal ? -1 : 1;
                        return desc ? -comparison : comparison;
                    }
                    return 0;
                });
            }

            setFilteredCount(processed.length);
            setDisplayData(processed.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize));
        } finally {
            setProcessing(false);
        }
    }, [workerReady, rawData, columnFilters, globalFilter, sorting, pageIndex, pageSize, processData]);

    // Debounced global filter update
    useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
            setGlobalFilter(searchInputValue);
        }, 150);

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [searchInputValue]);

    // Trigger data processing when dependencies change
    useEffect(() => {
        if (rawData.length > 0) {
            processDataWithWorker();
        }
    }, [processDataWithWorker, rawData.length]);

    // Reset page index when filters change
    useEffect(() => {
        setPageIndex(0);
    }, [columnFilters, globalFilter, sorting]);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const sampleData = generateSampleData(250);
            const analyzed = analyzeData(sampleData);
            setRawData(analyzed.data);
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

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSavePrefs({
                sorting,
                columnVisibility,
                columnOrder,
                columnSizing,
                columnPinning,
                pageSize,
                pageIndex,
                columnFilters
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [sorting, columnVisibility, columnOrder, columnSizing, columnPinning, pageSize, columnFilters, pageIndex, handleSavePrefs]);

    // Pivot Mode Logic
    useEffect(() => {
        if (pivotMode) {
            // Try to find a good grouping column
            const candidate = columns.find(c =>
                ['category', 'status', 'role', 'department', 'country'].includes(c.accessorKey?.toLowerCase())
            );
            if (candidate) {
                setGrouping([candidate.id || candidate.accessorKey]);
            }
        } else {
            setGrouping([]);
        }
    }, [pivotMode, columns]);

    const handleRowReorder = useCallback((activeId, overId) => {
        setRawData((currentData) => {
            // Assuming rows have 'id' property. If not, we might need to use index or generate ID.
            // But dnd-kit uses IDs.
            const oldIndex = currentData.findIndex((item) => item.id === activeId);
            const newIndex = currentData.findIndex((item) => item.id === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                return arrayMove(currentData, oldIndex, newIndex);
            }
            return currentData;
        });
    }, []);

    const handleDataLoaded = useCallback((rawData, name = "Uploaded File") => {
        setLoading(true);
        setShowUpload(false);
        setFilename(name);

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
        setPageIndex(0);

        requestAnimationFrame(() => {
            setTimeout(() => {
                const analyzed = analyzeData(rawData);
                setRawData(analyzed.data);
                setColumns(analyzed.columns);
                setMetadata(analyzed.metadata);
                setLoading(false);
            }, 300);
        });
        // Pivot Mode Logic
        useEffect(() => {
            if (pivotMode) {
                // Find categorical columns to group by
                const categoricalColumns = columns.filter(col =>
                    col.meta?.isEnum ||
                    (col.meta?.uniqueValues && col.meta.uniqueValues.length < 20) ||
                    col.meta?.dataType === 'text'
                );

                if (categoricalColumns.length > 0) {
                    // Prefer 'category', 'status', 'role', 'department', 'country'
                    const preferred = ['category', 'status', 'role', 'department', 'country'];
                    const bestColumn = categoricalColumns.find(col => {
                        const name = col.id.toLowerCase();
                        return preferred.some(p => name.includes(p));
                    }) || categoricalColumns[0];

                    setGrouping([bestColumn.id]);
                } else if (columns.length > 0) {
                    // Fallback to first non-select/expand column
                    const firstDataCol = columns.find(c => c.id !== 'select' && c.id !== 'expand');
                    if (firstDataCol) setGrouping([firstDataCol.id]);
                }
            } else {
                setGrouping([]);
            }
        }, [pivotMode, columns]);

        const columnsWithHeadersAndConfigs = useMemo(() => {
            if (columns.length === 0) return [];
            const configuredColumns = applyColumnConfigs(columns);
            const withHeaders = addHeadersToColumns(configuredColumns);
            return createColumns(withHeaders);
        }, [columns, configReloadTrigger]);

        // Create a manual pagination model for the table
        const paginationState = useMemo(() => ({
            pageIndex,
            pageSize
        }), [pageIndex, pageSize]);

        const table = useReactTable({
            data: displayData,
            columns: columnsWithHeadersAndConfigs,
            pageCount: Math.ceil(filteredCount / pageSize),
            state: {
                sorting,
                columnFilters,
                columnVisibility,
                rowSelection,
                globalFilter,
                columnOrder,
                columnSizing,
                columnPinning,
                rowPinning,
                expanded,
                grouping,
                pivotMode, // N5
                pagination: paginationState
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
            enableRowPinning: true,
            keepPinnedRows: true,
            enableExpanding: metadata?.hasNestedData || false,
            enableGrouping: true,
            manualPagination: true,
            manualFiltering: true,
            manualSorting: true,
            onSortingChange: setSorting,
            onColumnFiltersChange: setColumnFilters,
            onColumnVisibilityChange: setColumnVisibility,
            onRowSelectionChange: setRowSelection,
            onGlobalFilterChange: setGlobalFilter,
            onColumnOrderChange: setColumnOrder,
            onColumnSizingChange: setColumnSizing,
            onColumnPinningChange: setColumnPinning,
            onRowPinningChange: setRowPinning,
            onExpandedChange: setExpanded,
            onGroupingChange: setGrouping,
            onPaginationChange: (updater) => {
                const newState = typeof updater === 'function'
                    ? updater(paginationState)
                    : updater;
                setPageIndex(newState.pageIndex);
                setPageSize(newState.pageSize);
            },
            getCoreRowModel: getCoreRowModel(),
            getExpandedRowModel: getExpandedRowModel(),
            getGroupedRowModel: getGroupedRowModel(),
            defaultColumn: {
                size: 200,
                minSize: 50,
                maxSize: 600,
            },
        });

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
                    // Moving right: align left edge of cell just after left-pinned area
                    const cellLeftRelativeToScroll = cellRect.left - containerRect.left + currentScroll;
                    targetScrollLeft = cellLeftRelativeToScroll - leftPinnedWidth;
                } else if (direction === 'left') {
                    // Moving left: align right edge of cell just before right-pinned area
                    const cellRightRelativeToScroll = cellRect.right - containerRect.left + currentScroll;
                    const visibleAreaEnd = containerRect.width - rightPinnedWidth;
                    targetScrollLeft = cellRightRelativeToScroll + borderWidth - visibleAreaEnd;
                } else {
                    return;
                }

                tableContainer.scroll({
                    left: targetScrollLeft,
                    behavior: isWrapping ? 'instant' : 'smooth'
                });
            }, 0);
        };

        const clearAllFilters = () => {
            table.resetColumnFilters();
            table.resetSorting();
            table.setGrouping([]);
            updateGlobalFilter("");
        };

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


        useHotkeys('r', (e) => {
            e.preventDefault();
            clearAllFilters();
        }, { enableOnFormTags: false });

        useHotkeys('c', (e) => {
            e.preventDefault();
            if (!exportMenuOpen) {
                if (exportMode === 'export') {
                    handleExport('csv');
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
                handleExport('excel');
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
                handleExport('json');
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
            // ESC layered close: close most recent overlay first
            // Priority: search input blur > dropdowns > modals > fullscreen
            if (document.activeElement === searchInputRef.current) {
                searchInputRef.current?.blur();
                return;
            }
            // Check if any dropdown menus are open
            if (viewMenuOpen) {
                setViewMenuOpen(false);
                return;
            }
            if (columnsMenuOpen) {
                setColumnsMenuOpen(false);
                return;
            }
            if (groupMenuOpen) {
                setGroupMenuOpen(false);
                return;
            }
            if (exportMenuOpen) {
                setExportMenuOpen(false);
                return;
            }
            // Check if modals are open
            if (showShortcutsModal) {
                setShowShortcutsModal(false);
                return;
            }
            if (showStatusModal) {
                setShowStatusModal(false);
                return;
            }
            if (showUpload) {
                setShowUpload(false);
                return;
            }
            // Finally close fullscreen if nothing else is open
            if (isFullscreen) {
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

        const handleExport = useCallback((format, rows, columns) => {
            try {
                if (format === 'csv') {
                    exportToCSV(table, rows, columns);
                } else if (format === 'json') {
                    exportToJSON(table, rows, columns);
                } else if (format === 'excel') {
                    exportToExcel(table, rows, columns);
                }
            } catch (error) {
                console.error('Export error:', error);
            }
        }, [table]);

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
            setPageIndex(0);
            setPageSize(20);
            table.resetColumnVisibility();
            table.resetColumnOrder();
            table.resetColumnSizing();
            table.resetSorting();
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

        const isEmpty = displayData.length === 0 && !loading;

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
                    willChange: isFullscreen ? 'padding, margin' : 'auto',
                    textSizeAdjust: 'none',           // Add this
                    WebkitTextSizeAdjust: 'none',     // Add this (for Safari)
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
                    layout="position"
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
                                    initial={{ opacity: 0, y: -50 }}   // Start from hidden and above
                                    animate={{ opacity: 1, y: 0 }}     // Animate to visible and in position
                                    exit={{ opacity: 0, y: -50 }}      // Exit by fading and sliding up
                                    transition={{
                                        duration: 0.3,
                                        ease: [0.25, 1, 0.5, 1]        // Matches your other smooth easings
                                    }}
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
                            <>
                                <Link
                                    to="/"
                                    className="absolute top-0 left-0 m-4 text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                                >
                                    <ArrowRight className="h-4 w-4 rotate-180" />
                                    Regular Grid
                                </Link>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="absolute top-0 right-0 text-primary m-4 cursor-pointer" onClick={() => (setShowShortcutsModal((v) => !v))} />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Show shortcuts</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </>
                        )}

                        {rawData.length > 0 && !isFullscreen && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={() => setShowUpload(true)}
                                            variant="outline"
                                            className="absolute top-0 right-12 m-4 border-2"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload New File
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Upload new file</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        {rawData.length > 0 && (
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
                                    columns={columnsWithHeadersAndConfigs}
                                    onExport={handleExport}
                                    onResetPreferences={handleResetPreferences}
                                    onRefresh={() => {
                                        setLoading(true);
                                        setTimeout(() => {
                                            const sampleData = generateSampleData(250);
                                            const analyzed = analyzeData(sampleData);
                                            setRawData(analyzed.data);
                                            setColumns(analyzed.columns);
                                            setMetadata(analyzed.metadata);
                                            setLoading(false);
                                        }, 500);
                                    }}
                                    globalFilter={globalFilter}
                                    onGlobalFilterChange={updateGlobalFilter}
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
                                    clearAllFilters={clearAllFilters}
                                    pivotMode={pivotMode}
                                    setPivotMode={setPivotMode}
                                    extraButtons={
                                        <>
                                            <ColumnConfigurationMenu
                                                columns={columnsWithHeadersAndConfigs}
                                                onConfigChange={handleConfigChange}
                                            />
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setIsFullscreen(!isFullscreen)}
                                                            className="h-11 border-2 shadow-sm bg-background color-foreground border-border transition-all duration-150 hover:scale-105"
                                                            style={{ color: "var(--color-muted-foreground)" }}
                                                        >
                                                            {isFullscreen ? (
                                                                <Minimize2 className="h-4 w-4" />
                                                            ) : (
                                                                <Maximize2 className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </>
                                    }
                                />

                                <div
                                    className="flex-1 overflow-auto min-h-0 scroll-smooth"
                                    style={{
                                        overscrollBehavior: 'none',
                                        scrollBehavior: 'smooth',
                                        willChange: 'scroll-position',
                                        transform: 'translateZ(0)',
                                        backfaceVisibility: 'hidden',
                                    }}
                                    role="grid"
                                >
                                    <table
                                        className="w-full text-sm border-collapse font-medium"  // add font-medium
                                        style={{
                                            width: 'max-content',
                                            minWidth: '100%',
                                            contain: 'layout style paint',
                                            fontSize: '0.875rem',
                                            lineHeight: '1.25rem',
                                            textRendering: 'optimizeLegibility',
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
                                            loading={loading || processing}
                                            isEmpty={isEmpty}
                                            getDensityPadding={getDensityPadding}
                                            getCellBorderClasses={getCellBorderClasses}
                                            getLeftPosition={getLeftPos}
                                            getRightPosition={getRightPos}
                                            minRows={pageSize}
                                            onRowReorder={handleRowReorder}
                                        />
                                    </table>
                                </div>

                                <motion.div
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <DataGridPagination
                                        table={table}
                                        totalRows={filteredCount}
                                        totalSelectedRows={Object.keys(rowSelection).length}
                                    />
                                </motion.div>
                            </motion.div>
                        )}

                        {!isFullscreen && (
                            <div className="text-center mt-6 text-sm text-muted-foreground bottom-0">
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
