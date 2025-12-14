import { getCellRenderer } from "./dataAnalyzer";

// In-memory storage only - no localStorage blocking
let globalColumnConfig = {};

export function getColumnConfig(columnId) {
    return globalColumnConfig[columnId];
}

export function setColumnConfig(columnId, config) {
    globalColumnConfig[columnId] = {
        ...globalColumnConfig[columnId],
        ...config
    };
}

export function setColumnsConfig(configs) {
    Object.entries(configs).forEach(([colId, config]) => {
        globalColumnConfig[colId] = {
            ...globalColumnConfig[colId],
            ...config
        };
    });
}

export function clearColumnConfigs() {
    globalColumnConfig = {};
}

export function applyColumnConfigs(columns) {
    return columns.map(column => {
        const columnId = column.id || column.accessorKey;
        const config = globalColumnConfig[columnId];

        if (!config || Object.keys(config).length === 0) {
            return column;
        }

        const updatedColumn = { ...column };

        const effectiveDataType = config.dataType || updatedColumn.meta?.dataType || 'text';
        const effectiveIsEnum = config.forceEnum !== undefined ? config.forceEnum : updatedColumn.meta?.isEnum;
        const uniqueValues = updatedColumn.meta?.uniqueValues || [];

        if (config.forceEnum !== undefined) {
            updatedColumn.meta = {
                ...updatedColumn.meta,
                isEnum: config.forceEnum,
                forceEnum: config.forceEnum
            };
            updatedColumn.enableGrouping = config.forceEnum;
        }

        if (config.dataType) {
            updatedColumn.meta = {
                ...updatedColumn.meta,
                dataType: config.dataType
            };
        }

        const newRenderer = getCellRenderer(effectiveDataType, effectiveIsEnum, uniqueValues);
        if (newRenderer) {
            updatedColumn.cell = newRenderer;
        }

        if (config.headerText && typeof config.headerText === 'string' && config.headerText !== '[object Object]') {
            updatedColumn.header = config.headerText;
        }

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
            updatedColumn.aggregationFn = undefined;
            updatedColumn.aggregatedCell = undefined;
        }

        if (config.hideInGrid !== undefined) {
            updatedColumn.enableHiding = !config.hideInGrid;
            if (config.hideInGrid) {
                updatedColumn.defaultIsVisible = false;
            }
        }

        if (config.sortable !== undefined) {
            updatedColumn.enableSorting = config.sortable;
        }

        if (config.filterable !== undefined) {
            updatedColumn.enableColumnFilter = config.filterable;
        }

        if (config.resizable !== undefined) {
            updatedColumn.enableResizing = config.resizable;
        }

        return updatedColumn;
    });
}

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

export function exportConfig() {
    return JSON.stringify(globalColumnConfig, null, 2);
}

export function importConfig(jsonString) {
    try {
        globalColumnConfig = JSON.parse(jsonString);
        return true;
    } catch (error) {
        console.error('Failed to import config:', error);
        return false;
    }
}

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

export function applyPreset(presetName) {
    const preset = PRESET_CONFIGS[presetName.toUpperCase()];
    if (preset) {
        setColumnsConfig(preset);
        return true;
    }
    console.warn(`Preset "${presetName}" not found`);
    return false;
}