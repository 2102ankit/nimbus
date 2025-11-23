import { Badge } from "@/components/ui/badge";
import { getEnumColor, ExpandableTextCell, getCellRenderer } from "./dataAnalyzer";

const STORAGE_KEY = 'nimbus_column_config_v1';

// Initialize from localStorage if available
let globalColumnConfig = {};
try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        globalColumnConfig = JSON.parse(saved);
    }
} catch (e) {
    console.error('Failed to load column config:', e);
}

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(globalColumnConfig));
    } catch (e) {
        console.error('Failed to save column config:', e);
    }
}

export function getColumnConfig(columnId) {
    return globalColumnConfig[columnId];
}

export function setColumnConfig(columnId, config) {
    globalColumnConfig[columnId] = {
        ...globalColumnConfig[columnId],
        ...config
    };
    saveToStorage();
}

export function setColumnsConfig(configs) {
    Object.entries(configs).forEach(([colId, config]) => {
        globalColumnConfig[colId] = {
            ...globalColumnConfig[colId],
            ...config
        };
    });
    saveToStorage();
}

export function clearColumnConfigs() {
    globalColumnConfig = {};
    saveToStorage();
}

export function applyColumnConfigs(columns) {
    return columns.map(column => {
        // CRITICAL FIX: Use same ID logic as ColumnConfigurationMenu
        // Configs are saved with (col.id || col.accessorKey), so we must look them up the same way
        const columnId = column.id || column.accessorKey;
        const config = globalColumnConfig[columnId];

        if (!config || Object.keys(config).length === 0) {
            return column;
        }

        const updatedColumn = { ...column };

        // Determine effective properties
        const effectiveDataType = config.dataType || updatedColumn.meta?.dataType || 'text';
        const effectiveIsEnum = config.forceEnum !== undefined ? config.forceEnum : updatedColumn.meta?.isEnum;
        const uniqueValues = updatedColumn.meta?.uniqueValues || [];

        // Apply forceEnum metadata
        if (config.forceEnum !== undefined) {
            updatedColumn.meta = {
                ...updatedColumn.meta,
                isEnum: config.forceEnum,
                forceEnum: config.forceEnum
            };
            updatedColumn.enableGrouping = config.forceEnum;
        }

        // Apply dataType metadata
        if (config.dataType) {
            updatedColumn.meta = {
                ...updatedColumn.meta,
                dataType: config.dataType
            };
        }

        // Apply new cell renderer based on effective configuration
        const newRenderer = getCellRenderer(effectiveDataType, effectiveIsEnum, uniqueValues);
        if (newRenderer) {
            updatedColumn.cell = newRenderer;
        }

        // Apply header text if configured and valid
        if (config.headerText && typeof config.headerText === 'string' && config.headerText !== '[object Object]') {
            updatedColumn.header = config.headerText;
        }

        // Update aggregation function if type changed
        if (effectiveIsEnum) {
            updatedColumn.aggregationFn = "count";
            updatedColumn.aggregatedCell = ({ getValue }) => (
                <span className="font-bold text-primary">
                    {getValue()} items
                </span>
            );
        } else if (effectiveDataType === 'currency') {
            updatedColumn.aggregationFn = "sum";
            updatedColumn.aggregatedCell = ({ getValue }) => (
                <span className="font-bold text-chart-2">
                    Total: {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                    }).format(getValue())}
                </span>
            );
        } else if (effectiveDataType === 'percentage') {
            updatedColumn.aggregationFn = "mean";
            updatedColumn.aggregatedCell = ({ getValue }) => (
                <span className="font-bold text-primary">
                    Avg: {Math.round(getValue())}%
                </span>
            );
        } else {
            // Reset aggregation for other types
            updatedColumn.aggregationFn = undefined;
            updatedColumn.aggregatedCell = undefined;
        }

        // Apply hideInGrid
        if (config.hideInGrid !== undefined) {
            updatedColumn.enableHiding = !config.hideInGrid;
            if (config.hideInGrid) {
                updatedColumn.defaultIsVisible = false;
            }
        }

        // Apply sortable
        if (config.sortable !== undefined) {
            updatedColumn.enableSorting = config.sortable;
        }

        // Apply filterable
        if (config.filterable !== undefined) {
            updatedColumn.enableColumnFilter = config.filterable;
        }

        // Apply resizable
        if (config.resizable !== undefined) {
            updatedColumn.enableResizing = config.resizable;
        }

        return updatedColumn;
    });
}

/**
 * Configuration templates for common use cases
 */
export const COLUMN_CONFIG_TEMPLATES = {
    STATUS: { forceEnum: true, dataType: 'text' },
    STATE: { forceEnum: true, dataType: 'text' },
    ACTIVE: { forceEnum: true, dataType: 'boolean' },
    ENABLED: { forceEnum: true, dataType: 'boolean' },
    PHONE: { forceEnum: false, dataType: 'phone' },
    EMAIL: { forceEnum: false, dataType: 'email' },
    URL: { forceEnum: false, dataType: 'url' },
    DATE: { dataType: 'date' },
    TIMESTAMP: { dataType: 'date' },
    DATETIME: { dataType: 'date' },
    PRICE: { dataType: 'currency' },
    AMOUNT: { dataType: 'currency' },
    RATE: { dataType: 'percentage' },
    PERCENTAGE: { dataType: 'percentage' },
    CATEGORY: { forceEnum: true },
    LEVEL: { forceEnum: true },
    PRIORITY: { forceEnum: true },
    SEVERITY: { forceEnum: true },
    ROLE: { forceEnum: true },
    GENDER: { forceEnum: true },
};

/**
 * Export config as JSON
 */
export function exportConfig() {
    return JSON.stringify(globalColumnConfig, null, 2);
}

/**
 * Import config from JSON
 */
export function importConfig(jsonString) {
    try {
        globalColumnConfig = JSON.parse(jsonString);
        saveToStorage();
        return true;
    } catch (error) {
        console.error('Failed to import config:', error);
        return false;
    }
}

/**
 * Preset configurations for common scenarios
 */
export const PRESET_CONFIGS = {
    ECOMMERCE: {
        'product_id': { forceEnum: false },
        'product_name': { forceEnum: false },
        'category': { forceEnum: true },
        'price': { dataType: 'currency' },
        'discount': { dataType: 'percentage' },
        'status': { forceEnum: true },
        'created_at': { dataType: 'date' },
    },
    CRM: {
        'id': { forceEnum: false },
        'name': { forceEnum: false },
        'email': { dataType: 'email' },
        'phone': { dataType: 'phone' },
        'status': { forceEnum: true },
        'company': { forceEnum: false },
        'country': { forceEnum: true },
        'created_date': { dataType: 'date' },
    },
    HR: {
        'employee_id': { forceEnum: false },
        'name': { forceEnum: false },
        'department': { forceEnum: true },
        'role': { forceEnum: true },
        'status': { forceEnum: true },
        'salary': { dataType: 'currency' },
        'hire_date': { dataType: 'date' },
        'gender': { forceEnum: true },
    },
    ANALYTICS: {
        'event_id': { forceEnum: false },
        'event_type': { forceEnum: true },
        'user_id': { forceEnum: false },
        'timestamp': { dataType: 'date' },
        'duration': { dataType: 'number' },
        'revenue': { dataType: 'currency' },
        'status': { forceEnum: true },
    },
};

/**
 * Apply preset configuration
 */
export function applyPreset(presetName) {
    const preset = PRESET_CONFIGS[presetName.toUpperCase()];
    if (preset) {
        setColumnsConfig(preset);
        return true;
    }
    console.warn(`Preset "${presetName}" not found`);
    return false;
}