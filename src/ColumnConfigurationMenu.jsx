import { Button } from "@/components/ui/button";
import { Settings, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useCallback } from "react";
import { setColumnConfig, getColumnConfig, clearColumnConfigs } from "./columnConfigSystem";

export function ColumnConfigurationMenu({ columns = [], onConfigChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState(null);
    const [localConfigs, setLocalConfigs] = useState({});

    const dataTypeOptions = [
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
    ];

    const handleColumnSelect = useCallback((column) => {
        setSelectedColumn(column);
        setLocalConfigs(getColumnConfig(column.name) || {});
    }, []);

    const handleConfigChange = useCallback((key, value) => {
        setLocalConfigs(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const handleSaveConfig = useCallback(() => {
        if (selectedColumn) {
            setColumnConfig(selectedColumn.name, localConfigs);
            onConfigChange?.();
            setSelectedColumn(null);
        }
    }, [selectedColumn, localConfigs, onConfigChange]);

    const handleClearAll = useCallback(() => {
        if (confirm('Clear all column configurations?')) {
            clearColumnConfigs();
            setSelectedColumn(null);
            setLocalConfigs({});
            onConfigChange?.();
        }
    }, [onConfigChange]);

    return (
        <div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                title="Configure columns"
                className="h-11 border-2 shadow-sm"
                style={{ color: "var(--color-muted-foreground)" }}
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
                            className="bg-card rounded-xl shadow-2xl border border-border max-w-4xl w-full max-h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <h2 className="text-2xl font-bold">Configure Columns</h2>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Main Content */}
                            <div className="flex flex-1 overflow-hidden gap-4 p-6">
                                {/* Column List */}
                                <div className="w-64 border border-border rounded-lg overflow-y-auto flex flex-col">
                                    <div className="sticky top-0 p-3 border-b border-border bg-muted/50 z-10">
                                        <p className="text-sm font-semibold">Columns ({columns.length})</p>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        {columns.map(col => (
                                            <button
                                                key={col.id}
                                                onClick={() => handleColumnSelect(col)}
                                                className={`w-full text-left px-3 py-2 text-sm border-b border-border/50 transition-colors ${selectedColumn?.id === col.id
                                                        ? 'bg-primary/20 text-primary font-medium'
                                                        : 'hover:bg-muted/50'
                                                    }`}
                                            >
                                                <div className="truncate">{col.header || col.name || col.id}</div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {col.meta?.dataType || 'text'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Configuration Panel */}
                                <div className="flex-1 overflow-y-auto">
                                    {selectedColumn ? (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">
                                                    {selectedColumn.header || selectedColumn.name || selectedColumn.id}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    ID: {selectedColumn.id}
                                                </p>
                                            </div>

                                            {/* Data Type */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold">Data Type</label>
                                                <select
                                                    value={localConfigs.dataType || selectedColumn.meta?.dataType || 'text'}
                                                    onChange={(e) => handleConfigChange('dataType', e.target.value)}
                                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                                                >
                                                    {dataTypeOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="text-xs text-muted-foreground">
                                                    How to interpret and display this column's data
                                                </p>
                                            </div>

                                            {/* Force as Enum */}
                                            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
                                                <div>
                                                    <p className="text-sm font-semibold">Treat as Category/Enum</p>
                                                    <p className="text-xs text-muted-foreground">Display with colored badges</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={localConfigs.forceEnum || false}
                                                        onChange={(e) => handleConfigChange('forceEnum', e.target.checked)}
                                                        className="w-5 h-5"
                                                    />
                                                </label>
                                            </div>

                                            {/* Sortable */}
                                            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                                                <div>
                                                    <p className="text-sm font-semibold">Allow Sorting</p>
                                                    <p className="text-xs text-muted-foreground">Users can sort by this column</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={localConfigs.sortable !== false}
                                                        onChange={(e) => handleConfigChange('sortable', e.target.checked)}
                                                        className="w-5 h-5"
                                                    />
                                                </label>
                                            </div>

                                            {/* Filterable */}
                                            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                                                <div>
                                                    <p className="text-sm font-semibold">Allow Filtering</p>
                                                    <p className="text-xs text-muted-foreground">Users can filter by this column</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={localConfigs.filterable !== false}
                                                        onChange={(e) => handleConfigChange('filterable', e.target.checked)}
                                                        className="w-5 h-5"
                                                    />
                                                </label>
                                            </div>

                                            {/* Resizable */}
                                            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                                                <div>
                                                    <p className="text-sm font-semibold">Allow Resizing</p>
                                                    <p className="text-xs text-muted-foreground">Users can resize this column</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={localConfigs.resizable !== false}
                                                        onChange={(e) => handleConfigChange('resizable', e.target.checked)}
                                                        className="w-5 h-5"
                                                    />
                                                </label>
                                            </div>

                                            {/* Hide Column */}
                                            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-destructive/10">
                                                <div>
                                                    <p className="text-sm font-semibold">Hide in Grid</p>
                                                    <p className="text-xs text-muted-foreground">Hide this column from view</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={localConfigs.hideInGrid || false}
                                                        onChange={(e) => handleConfigChange('hideInGrid', e.target.checked)}
                                                        className="w-5 h-5"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-center">
                                            <p className="text-muted-foreground">Select a column to configure</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-border p-6 flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={handleClearAll}
                                    className="mr-auto"
                                >
                                    Clear All
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={handleSaveConfig}
                                    disabled={!selectedColumn}
                                    className="gap-2"
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
}

export default ColumnConfigurationMenu;