import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Settings, X, Check, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useCallback, useEffect, useMemo, memo, useRef } from "react";
import { setColumnConfig, getColumnConfig, clearColumnConfigs } from "./columnConfigSystem";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export const ColumnConfigurationMenu = memo(function ColumnConfigurationMenu({ columns = [], onConfigChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedColumnId, setSelectedColumnId] = useState(null);
    const [localConfigs, setLocalConfigs] = useState({});
    const [showSaved, setShowSaved] = useState(false);
    const [isEditingHeader, setIsEditingHeader] = useState(false);
    const [editedHeaderText, setEditedHeaderText] = useState("");
    const headerInputRef = useRef(null);

    const dataTypeOptions = useMemo(() => [
        { value: 'text', label: 'Text' },
        { value: 'number', label: 'Number' },
        { value: 'currency', label: 'Currency ($)' },
        { value: 'percentage', label: 'Percentage (%)' },
        { value: 'date', label: 'Date' },
        { value: 'boolean', label: 'Boolean' },
        { value: 'phone', label: 'Phone Number' },
        { value: 'email', label: 'Email' },
        { value: 'url', label: 'URL' },
    ], []);

    const aggregationOptions = useMemo(() => [
        { value: 'none', label: 'None' },
        { value: 'sum', label: 'Sum' },
        { value: 'mean', label: 'Average (Mean)' },
        { value: 'median', label: 'Median' },
        { value: 'min', label: 'Minimum' },
        { value: 'max', label: 'Maximum' },
        { value: 'count', label: 'Count' },
    ], []);

    const filteredColumns = useMemo(() => {
        return columns.filter(col =>
            col.id !== 'select' &&
            col.id !== 'expand' &&
            (col.accessorKey || col.accessorFn)
        );
    }, [columns]);

    const getColumnTitle = useCallback((col) => {
        const config = getColumnConfig(col.id);
        if (config?.headerText) return config.headerText;

        const header = col.header || col.columnDef?.header || col.meta?.headerText || col.accessorKey;
        if (typeof header === 'function' || typeof header === 'object') {
            return col.meta?.headerText || col.meta?.originalKey || col.accessorKey || col.id;
        }
        return String(header);
    }, []);

    const getColumnType = useCallback((col) => {
        return col.meta?.dataType || col.columnDef?.meta?.dataType || 'text';
    }, []);

    const getColumnAggregation = useCallback((col) => {
        return col.columnDef?.aggregationFn || col.aggregationFn || 'none';
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                if (isEditingHeader) {
                    setIsEditingHeader(false);
                } else {
                    setIsOpen(false);
                }
            }
        };
        // Task 8: Reset configs when closing without save
        useEffect(() => {
            if (!isOpen && selectedColumnId) {
                // Reset to saved config when modal closes
                const savedConfig = getColumnConfig(selectedColumnId);
                setLocalConfigs(savedConfig || {});
            }
        }, [isOpen, selectedColumnId]);

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, isEditingHeader]);

    useEffect(() => {
        if (isEditingHeader && headerInputRef.current) {
            headerInputRef.current.focus();
            headerInputRef.current.select();
        }
    }, [isEditingHeader]);

    const handleColumnSelect = useCallback((columnId) => {
        setSelectedColumnId(columnId);
        const existingConfig = getColumnConfig(columnId);
        const selectedCol = filteredColumns.find(col => col.id === columnId);

        if (!existingConfig && selectedCol) {
            setLocalConfigs({
                dataType: selectedCol.meta?.dataType || 'text',
                forceEnum: selectedCol.meta?.isEnum || false,
                sortable: true,
                filterable: true,
                resizable: true,
                hideInGrid: false,
                aggregationFn: selectedCol.columnDef?.aggregationFn || 'none',
            });
        } else {
            setLocalConfigs(existingConfig || {});
        }
    }, [filteredColumns]);

    const handleConfigChange = useCallback((key, value) => {
        setLocalConfigs(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const handleSaveConfig = useCallback(() => {
        if (selectedColumnId) {
            setColumnConfig(selectedColumnId, localConfigs);
            if (onConfigChange) {
                onConfigChange();
            }
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 2000);
        }
    }, [selectedColumnId, localConfigs, onConfigChange]);

    const handleClearAll = useCallback(() => {
        if (confirm('Clear all column configurations?')) {
            clearColumnConfigs();
            setSelectedColumnId(null);
            setLocalConfigs({});
            if (onConfigChange) {
                onConfigChange();
            }
        }
    }, [onConfigChange]);

    const handleStartHeaderEdit = useCallback(() => {
        const selectedCol = filteredColumns.find(col => col.id === selectedColumnId);
        setEditedHeaderText(localConfigs.headerText || getColumnTitle(selectedCol));
        setIsEditingHeader(true);
    }, [selectedColumnId, localConfigs, filteredColumns, getColumnTitle]);

    const handleSaveHeaderEdit = useCallback(() => {
        handleConfigChange('headerText', editedHeaderText);
        setIsEditingHeader(false);
    }, [editedHeaderText, handleConfigChange]);

    const handleCancelHeaderEdit = useCallback(() => {
        setIsEditingHeader(false);
        setEditedHeaderText("");
    }, []);

    const selectedColumn = useMemo(() =>
        filteredColumns.find(col => col.id === selectedColumnId),
        [filteredColumns, selectedColumnId]
    );

    const canAggregate = useMemo(() => {
        if (!selectedColumn) return false;
        const dataType = localConfigs.dataType || getColumnType(selectedColumn);
        return ['number', 'currency', 'percentage'].includes(dataType) || localConfigs.forceEnum;
    }, [selectedColumn, localConfigs, getColumnType]);

    return (
        <div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(true)}
                            className="h-11 border-2 shadow-sm bg-background text-foreground hover:bg-muted"
                            style={{
                                borderColor: "var(--color-border)",
                            }}
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Configure columns</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card border-2 border-border rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                        <Settings className="h-6 w-6" />
                                        Column Configuration
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Customize column appearance, behavior, and aggregations
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClearAll}
                                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                                    >
                                        Reset All
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsOpen(false)}
                                        className="h-8 w-8"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-hidden flex">
                                {/* Column List */}
                                <div className="w-1/3 border-r border-border overflow-y-auto bg-muted/10">
                                    <div className="p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                                        <p className="text-sm font-semibold text-foreground">Columns ({filteredColumns.length})</p>
                                    </div>
                                    <div className="flex flex-col">
                                        {filteredColumns.map(col => {
                                            const colId = col.id;
                                            const isSelected = selectedColumnId === colId;
                                            const columnTitle = getColumnTitle(col);
                                            const columnType = getColumnType(col);

                                            return (
                                                <button
                                                    key={colId}
                                                    onClick={() => handleColumnSelect(colId)}
                                                    className={cn(
                                                        "w-full flex flex-col text-left px-4 py-3 border-b border-border transition-all",
                                                        isSelected
                                                            ? "bg-primary/15 border-l-4 border-l-primary text-foreground"
                                                            : "hover:bg-muted/50 text-foreground border-l-4 border-l-transparent"
                                                    )}
                                                >
                                                    <span className="font-semibold text-sm truncate">{columnTitle}</span>
                                                    <span className="text-xs text-muted-foreground capitalize mt-0.5">
                                                        {columnType}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Configuration Panel */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    {selectedColumn ? (
                                        <div className="space-y-4">
                                            {/* Header Text with Inline Edit */}
                                            <div className="bg-muted/30 border border-border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Label className="text-sm font-semibold text-foreground">
                                                        Column Header
                                                    </Label>
                                                    {!isEditingHeader && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleStartHeaderEdit}
                                                            className="h-7 px-2"
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                                {isEditingHeader ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            ref={headerInputRef}
                                                            type="text"
                                                            className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                                            value={editedHeaderText}
                                                            onChange={(e) => setEditedHeaderText(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleSaveHeaderEdit();
                                                                if (e.key === 'Escape') handleCancelHeaderEdit();
                                                            }}
                                                        />
                                                        <Button size="sm" onClick={handleSaveHeaderEdit} className="h-9">
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={handleCancelHeaderEdit} className="h-9">
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="text-lg font-medium text-foreground truncate">
                                                        {localConfigs.headerText || getColumnTitle(selectedColumn)}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Data Type */}
                                                <div className="bg-card border border-border rounded-lg p-4">
                                                    <Label htmlFor="data-type" className="text-sm font-semibold text-foreground mb-2 block">
                                                        Data Type
                                                    </Label>
                                                    <Select
                                                        value={localConfigs.dataType || getColumnType(selectedColumn)}
                                                        onValueChange={(value) => handleConfigChange('dataType', value)}
                                                    >
                                                        <SelectTrigger id="data-type" className="w-full bg-background border border-border text-foreground">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-card border border-border">
                                                            {dataTypeOptions.map(opt => (
                                                                <SelectItem
                                                                    key={opt.value}
                                                                    value={opt.value}
                                                                    className="text-foreground hover:bg-muted focus:bg-muted"
                                                                >
                                                                    {opt.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Precision (Task 10) */}
                                                {['number', 'currency', 'percentage'].includes(localConfigs.dataType || getColumnType(selectedColumn)) && (
                                                    <div className="bg-card border border-border rounded-lg p-4">
                                                        <Label htmlFor="precision" className="text-sm font-semibold text-foreground mb-2 block">
                                                            Precision (Decimals)
                                                        </Label>
                                                        <Input
                                                            id="precision"
                                                            type="number"
                                                            min="0"
                                                            max="10"
                                                            value={localConfigs.precision !== undefined ? localConfigs.precision : ''}
                                                            onChange={(e) => handleConfigChange('precision', e.target.value === '' ? undefined : parseInt(e.target.value))}
                                                            className="bg-background border border-border text-foreground"
                                                            placeholder="Default"
                                                        />
                                                    </div>
                                                )}

                                                {/* Enum Toggle */}
                                                <div className="bg-card border border-border rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="force-enum" className="text-sm font-semibold text-foreground">
                                                            Enum
                                                        </Label>
                                                        <Switch
                                                            id="force-enum"
                                                            checked={localConfigs.forceEnum !== undefined ? localConfigs.forceEnum : (selectedColumn?.meta?.isEnum || false)}
                                                            onCheckedChange={(checked) => handleConfigChange('forceEnum', checked)}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">Colored badges</p>
                                                </div>

                                                {/* Aggregation Function */}
                                                {canAggregate && (
                                                    <div className="bg-card border border-border rounded-lg p-4 col-span-2">
                                                        <Label htmlFor="aggregation-fn" className="text-sm font-semibold text-foreground mb-2 block">
                                                            Aggregation Function
                                                        </Label>
                                                        <Select
                                                            value={localConfigs.aggregationFn || getColumnAggregation(selectedColumn)}
                                                            onValueChange={(value) => handleConfigChange('aggregationFn', value)}
                                                        >
                                                            <SelectTrigger id="aggregation-fn" className="w-full bg-background border border-border text-foreground">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-card border border-border">
                                                                {aggregationOptions.map(opt => (
                                                                    <SelectItem
                                                                        key={opt.value}
                                                                        value={opt.value}
                                                                        className="text-foreground hover:bg-muted focus:bg-muted"
                                                                    >
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            Used when grouping data by other columns
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Sortable */}
                                                <div className="bg-card border border-border rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="sortable" className="text-sm font-semibold text-foreground">
                                                            Sortable
                                                        </Label>
                                                        <Switch
                                                            id="sortable"
                                                            checked={localConfigs.sortable !== false}
                                                            onCheckedChange={(checked) => handleConfigChange('sortable', checked)}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">Allow sorting</p>
                                                </div>

                                                {/* Filterable */}
                                                <div className="bg-card border border-border rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="filterable" className="text-sm font-semibold text-foreground">
                                                            Filterable
                                                        </Label>
                                                        <Switch
                                                            id="filterable"
                                                            checked={localConfigs.filterable !== false}
                                                            onCheckedChange={(checked) => handleConfigChange('filterable', checked)}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">Allow filtering</p>
                                                </div>

                                                {/* Resizable */}
                                                <div className="bg-card border border-border rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="resizable" className="text-sm font-semibold text-foreground">
                                                            Resizable
                                                        </Label>
                                                        <Switch
                                                            id="resizable"
                                                            checked={localConfigs.resizable !== false}
                                                            onCheckedChange={(checked) => handleConfigChange('resizable', checked)}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">Width adjustment</p>
                                                </div>

                                                {/* Hide Column */}
                                                <div className="bg-destructive/5 border border-destructive/50 rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="hide-grid" className="text-sm font-semibold text-foreground">
                                                            Hide
                                                        </Label>
                                                        <Switch
                                                            id="hide-grid"
                                                            checked={localConfigs.hideInGrid || false}
                                                            onCheckedChange={(checked) => handleConfigChange('hideInGrid', checked)}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">Hide column</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-4">
                                                <Button
                                                    onClick={handleSaveConfig}
                                                    className="bg-primary text-primary-foreground hover:bg-primary/90 relative"
                                                    disabled={showSaved}
                                                >
                                                    {showSaved ? (
                                                        <>
                                                            <Check className="h-4 w-4 mr-2" />
                                                            Saved!
                                                        </>
                                                    ) : (
                                                        'Save Changes'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <p>Select a column to configure</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});