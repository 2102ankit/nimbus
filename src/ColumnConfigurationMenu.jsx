import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Settings, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useCallback, useEffect, useMemo, memo } from "react";
import { setColumnConfig, getColumnConfig, clearColumnConfigs } from "./columnConfigSystem";

export const ColumnConfigurationMenu = memo(function ColumnConfigurationMenu({ columns = [], onConfigChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedColumnId, setSelectedColumnId] = useState(null); // FIXED: Use column ID only
    const [localConfigs, setLocalConfigs] = useState({});

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
        { value: 'nested', label: 'Nested Object' },
    ], []);

    const filteredColumns = useMemo(() =>
        columns.filter(col => col.id !== 'select' && col.id !== 'expand'),
        [columns]
    );

    const getColumnTitle = useCallback((col) => {
        if (typeof col?.header === 'string') {
            return col.header;
        } else if (col?.meta?.headerText) {
            return col.meta.headerText;
        } else if (col?.columnDef?.meta?.headerText) {
            return col.columnDef.meta.headerText;
        }
        return col.id;
    }, []);

    const getColumnType = useCallback((col) => {
        return col.meta?.dataType || col.columnDef?.meta?.dataType || 'text';
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const handleColumnSelect = useCallback((columnId) => {
        setSelectedColumnId(columnId); // FIXED: Store ID only
        const existingConfig = getColumnConfig(columnId);
        setLocalConfigs(existingConfig || {});
    }, []);

    const handleConfigChange = useCallback((key, value) => {
        setLocalConfigs(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const handleSaveConfig = useCallback(() => {
        if (selectedColumnId) {
            setColumnConfig(selectedColumnId, localConfigs); // Use ID
            if (onConfigChange) {
                onConfigChange();
            }
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

    // FIXED: Find selected column by ID for display
    const selectedColumn = useMemo(() =>
        filteredColumns.find(col => col.id === selectedColumnId),
        [filteredColumns, selectedColumnId]
    );

    return (
        <div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                title="Configure columns"
                className="h-11 border-2 shadow-sm bg-background text-foreground hover:bg-muted"
            >
                <Settings className="h-4 w-4" />
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-card rounded-xl shadow-2xl border-2 border-border max-w-5xl w-full max-h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b-2 border-border bg-card rounded-t-xl">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">Column Configuration</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Customize how columns behave and display</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-foreground hover:bg-muted">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="flex flex-1 overflow-hidden">
                                <div className="w-80 border-r-2 border-border overflow-y-auto bg-muted/20">
                                    <div className="sticky top-0 p-4 border-b-2 border-border bg-card z-10">
                                        <p className="text-sm font-semibold text-foreground">Columns ({filteredColumns.length})</p>
                                    </div>
                                    <div className="flex flex-col">
                                        {filteredColumns.map(col => {
                                            // FIXED: Compare by ID only
                                            const isSelected = selectedColumnId === col.id;
                                            const columnTitle = getColumnTitle(col);
                                            const columnType = getColumnType(col);

                                            // Get actual column definition to check for special rendering
                                            const hasSpecialRendering = col.cell && typeof col.cell === 'function';

                                            return (
                                                <button
                                                    key={col.id}
                                                    onClick={() => handleColumnSelect(col.id)}
                                                    className={`w-full flex flex-col text-left px-4 py-3 border-b border-border transition-all ${isSelected
                                                        ? 'bg-primary/15 border-l-4 border-l-primary text-foreground'
                                                        : 'hover:bg-muted/50 text-foreground border-l-4 border-l-transparent'
                                                        }`}
                                                >
                                                    <div className="font-medium truncate">{columnTitle}</div>
                                                    <div className="text-xs text-muted-foreground truncate mt-1">
                                                        <span className="bg-muted px-1.5 py-0.5 rounded text-xs">
                                                            {columnType}
                                                            {hasSpecialRendering && columnType === 'percentage' && ' (with bar)'}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 bg-background">
                                    {selectedColumn ? (
                                        <div className="space-y-4 max-w-2xl">
                                            <div className="bg-card border border-border rounded-lg p-4 flex justify-between">
                                                <h3 className="text-lg font-semibold text-foreground">
                                                    {getColumnTitle(selectedColumn)}
                                                </h3>
                                                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                                    <span className="bg-muted px-2 py-0.5 rounded">{getColumnType(selectedColumn)}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
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

                                                <div className="bg-card border border-border rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="force-enum" className="text-sm font-semibold text-foreground">
                                                            Category
                                                        </Label>
                                                        <Switch
                                                            id="force-enum"
                                                            checked={localConfigs.forceEnum || false}
                                                            onCheckedChange={(checked) => handleConfigChange('forceEnum', checked)}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">Colored badges</p>
                                                </div>

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
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center space-y-4">
                                                <Settings className="h-16 w-16 text-muted-foreground mx-auto" />
                                                <p className="text-lg text-muted-foreground">Select a column to configure</p>
                                                <p className="text-sm text-muted-foreground">Choose from the list on the left</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t-2 border-border p-6 flex gap-3 justify-end bg-card rounded-b-xl">
                                <Button
                                    variant="outline"
                                    onClick={handleClearAll}
                                    className="mr-auto border-2 text-foreground hover:bg-muted"
                                >
                                    Clear All
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    className="border-2 text-foreground hover:bg-muted"
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={handleSaveConfig}
                                    disabled={!selectedColumn}
                                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    <Check className="h-4 w-4" />
                                    Save Configuration
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

export default ColumnConfigurationMenu;