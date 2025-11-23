/**
 * Column Configuration System
 * Allows users to explicitly configure column behavior
 */

// Global column overrides - users can set this before data analysis
let globalColumnConfig = {};

/**
 * Set explicit configuration for specific columns
 * @param {string} columnName - Column name/header
 * @param {object} config - Configuration object
 * 
 * @example
 * setColumnConfig('status', { forceEnum: true });
 * setColumnConfig('email', { dataType: 'email', hideInGrid: false });
 * setColumnConfig('phone', { dataType: 'phone', forceEnum: true });
 */
export function setColumnConfig(columnName, config) {
    globalColumnConfig[columnName] = {
        ...globalColumnConfig[columnName],
        ...config
    };
}

/**
 * Set multiple column configurations at once
 * @param {object} configs - Object mapping column names to config objects
 * 
 * @example
 * setColumnsConfig({
 *     'status': { forceEnum: true },
 *     'priority': { forceEnum: true },
 *     'phone': { dataType: 'phone' },
 *     'email': { dataType: 'email' }
 * });
 */
export function setColumnsConfig(configs) {
    Object.entries(configs).forEach(([colName, config]) => {
        setColumnConfig(colName, config);
    });
}

/**
 * Get configuration for a specific column
 */
export function getColumnConfig(columnName) {
    return globalColumnConfig[columnName] || {};
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
 * Apply column configurations to analysis results
 * Call this after analyzeData() to apply user overrides
 */
export function applyColumnConfigs(columnAnalysis) {
    const updated = { ...columnAnalysis };

    Object.entries(globalColumnConfig).forEach(([columnName, config]) => {
        if (updated[columnName]) {
            // Force enum
            if (config.forceEnum === true) {
                updated[columnName].isEnum = true;
                updated[columnName].forceEnum = true;
            } else if (config.forceEnum === false) {
                updated[columnName].isEnum = false;
                updated[columnName].forceEnum = false;
            }

            // Override data type
            if (config.dataType) {
                updated[columnName].dataType = config.dataType;
            }

            // Merge other configs
            updated[columnName] = {
                ...updated[columnName],
                ...config
            };
        }
    });

    return updated;
}

/**
 * Configuration templates for common use cases
 */
export const COLUMN_CONFIG_TEMPLATES = {
    // Boolean-like columns
    STATUS: { forceEnum: true, dataType: 'text' },
    STATE: { forceEnum: true, dataType: 'text' },
    ACTIVE: { forceEnum: true, dataType: 'boolean' },
    ENABLED: { forceEnum: true, dataType: 'boolean' },

    // Contact info
    PHONE: { forceEnum: false, dataType: 'phone' },
    EMAIL: { forceEnum: false, dataType: 'email' },
    URL: { forceEnum: false, dataType: 'url' },

    // Date/Time
    DATE: { dataType: 'date' },
    TIMESTAMP: { dataType: 'date' },
    DATETIME: { dataType: 'date' },

    // Finance
    PRICE: { dataType: 'currency' },
    AMOUNT: { dataType: 'currency' },
    RATE: { dataType: 'percentage' },
    PERCENTAGE: { dataType: 'percentage' },

    // Categorical
    CATEGORY: { forceEnum: true },
    LEVEL: { forceEnum: true },
    PRIORITY: { forceEnum: true },
    SEVERITY: { forceEnum: true },
    ROLE: { forceEnum: true },
    GENDER: { forceEnum: true },
};

/**
 * Quick setup helper - apply template configurations
 * @example
 * applyTemplate('status', COLUMN_CONFIG_TEMPLATES.STATUS);
 */
export function applyTemplate(columnName, template) {
    setColumnConfig(columnName, template);
}

/**
 * Configuration UI Helper - generates form fields for column configuration
 * Returns configuration object that can be displayed in a UI
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
 * Export current config as JSON for saving/sharing
 */
export function exportConfig() {
    return JSON.stringify(globalColumnConfig, null, 2);
}

/**
 * Import config from JSON string
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
 * Quick preset for common data scenarios
 */
export const PRESET_CONFIGS = {
    // E-commerce
    ECOMMERCE: {
        'product_id': { forceEnum: false },
        'product_name': { forceEnum: false },
        'category': { forceEnum: true },
        'price': { dataType: 'currency' },
        'discount': { dataType: 'percentage' },
        'status': { forceEnum: true },
        'created_at': { dataType: 'date' },
    },

    // CRM/Contacts
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

    // HR/Employee
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

    // Analytics/Events
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
 * Apply a preset configuration
 * @example
 * applyPreset('ECOMMERCE');
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