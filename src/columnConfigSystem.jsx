/**
 * Column Configuration System - FIXED
 * Properly applies configurations to columns
 */

let globalColumnConfig = {};

/**
 * Set explicit configuration for specific columns
 */
export function setColumnConfig(columnId, config) {
    globalColumnConfig[columnId] = {
        ...globalColumnConfig[columnId],
        ...config
    };
}

/**
 * Set multiple column configurations at once
 */
export function setColumnsConfig(configs) {
    Object.entries(configs).forEach(([colId, config]) => {
        setColumnConfig(colId, config);
    });
}

/**
 * Get configuration for a specific column
 */
export function getColumnConfig(columnId) {
    return globalColumnConfig[columnId] || {};
}

/**
 * Clear all configurations
 */
export function clearColumnConfigs() {
    globalColumnConfig = {};
}

/**
 * Get all configurations
 */
export function getAllColumnConfigs() {
    return { ...globalColumnConfig };
}

/**
 * Apply column configurations to columns array
 * THIS IS THE KEY FUNCTION THAT WAS MISSING
 */
export function applyColumnConfigs(columns) {
    return columns.map(column => {
        const config = globalColumnConfig[column.id];
        if (!config || Object.keys(config).length === 0) {
            return column;
        }

        const updatedColumn = { ...column };

        // Apply forceEnum
        if (config.forceEnum !== undefined) {
            updatedColumn.meta = {
                ...updatedColumn.meta,
                isEnum: config.forceEnum,
                forceEnum: config.forceEnum
            };
        }

        // Apply dataType
        if (config.dataType) {
            updatedColumn.meta = {
                ...updatedColumn.meta,
                dataType: config.dataType
            };
        }

        // Apply hideInGrid
        if (config.hideInGrid !== undefined) {
            updatedColumn.enableHiding = !config.hideInGrid;
            if (config.hideInGrid) {
                // If hiding, we might want to set initial visibility to false
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
 * Apply template configuration
 */
export function applyTemplate(columnId, template) {
    setColumnConfig(columnId, template);
}

/**
 * Configuration UI Helper
 */
export function getConfigurationUISchema() {
    return {
        forceEnum: {
            type: 'boolean',
            label: 'Force as Enum/Category',
            description: 'Treat column as categorical with limited unique values',
        },
        dataType: {
            type: 'select',
            label: 'Data Type',
            options: [
                { value: 'text', label: 'Text' },
                { value: 'number', label: 'Number' },
                { value: 'currency', label: 'Currency' },
                { value: 'percentage', label: 'Percentage' },
                { value: 'date', label: 'Date' },
                { value: 'boolean', label: 'Boolean' },
                { value: 'phone', label: 'Phone Number' },
                { value: 'email', label: 'Email' },
                { value: 'url', label: 'URL' },
                { value: 'nested', label: 'Nested Object' },
            ],
            description: 'Select the data type for this column',
        },
        hideInGrid: {
            type: 'boolean',
            label: 'Hide in Grid',
            description: 'Hide this column from the data grid',
        },
        sortable: {
            type: 'boolean',
            label: 'Allow Sorting',
            description: 'Allow users to sort by this column',
            default: true,
        },
        filterable: {
            type: 'boolean',
            label: 'Allow Filtering',
            description: 'Allow users to filter by this column',
            default: true,
        },
        resizable: {
            type: 'boolean',
            label: 'Allow Resizing',
            description: 'Allow users to resize this column',
            default: true,
        },
    };
}

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