import { getCellRenderer } from "./dataAnalyzer";

// Persistence key
const STORAGE_KEY = "nimbus-column-configs";

// Initialize from localStorage
let globalColumnConfig = {};
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    globalColumnConfig = JSON.parse(stored);
  }
} catch (e) {
  console.error("Failed to load column configs from localStorage", e);
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalColumnConfig));
  } catch (e) {
    console.error("Failed to save column configs to localStorage", e);
  }
}

export function getColumnConfig(columnId) {
  return globalColumnConfig[columnId];
}

export function setColumnConfig(columnId, config) {
  globalColumnConfig[columnId] = {
    ...globalColumnConfig[columnId],
    ...config,
  };
  saveToStorage();
}

export function setColumnsConfig(configs) {
  Object.entries(configs).forEach(([colId, config]) => {
    globalColumnConfig[colId] = {
      ...globalColumnConfig[colId],
      ...config,
    };
  });
  saveToStorage();
}

export function clearColumnConfigs() {
  globalColumnConfig = {};
  localStorage.removeItem(STORAGE_KEY);
}

// Helper function to parse numeric values from various formats
function parseNumericValue(value) {
  if (value === null || value === undefined) return null;

  // If already a number, return it
  if (typeof value === 'number') return value;

  // Convert to string and clean
  const strValue = String(value);

  // Remove currency symbols, commas, and percentage signs
  const cleaned = strValue.replace(/[$€£¥,\s%]/g, '');

  // Parse the cleaned value
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? null : parsed;
}

export function applyColumnConfigs(columns) {
  return columns.map((column) => {
    const columnId = column.id || column.accessorKey;
    const config = globalColumnConfig[columnId];

    if (!config || Object.keys(config).length === 0) {
      return column;
    }

    const updatedColumn = { ...column };

    const effectiveDataType =
      config.dataType || updatedColumn.meta?.dataType || "text";
    const effectiveIsEnum =
      config.forceEnum !== undefined
        ? config.forceEnum
        : updatedColumn.meta?.isEnum;
    const uniqueValues = updatedColumn.meta?.uniqueValues || [];

    if (config.forceEnum !== undefined) {
      updatedColumn.meta = {
        ...updatedColumn.meta,
        isEnum: config.forceEnum,
        forceEnum: config.forceEnum,
      };
      updatedColumn.enableGrouping = config.forceEnum;
    }

    if (config.dataType) {
      updatedColumn.meta = {
        ...updatedColumn.meta,
        dataType: config.dataType,
      };
    }

    const newRenderer = getCellRenderer(
      effectiveDataType,
      effectiveIsEnum,
      uniqueValues
    );
    if (newRenderer) {
      updatedColumn.cell = newRenderer;
    }

    if (
      config.headerText &&
      typeof config.headerText === "string" &&
      config.headerText !== "[object Object]"
    ) {
      updatedColumn.header = config.headerText;
      updatedColumn.meta = {
        ...updatedColumn.meta,
        headerText: config.headerText,
      };
    }

    // Set aggregation based on data type
    if (effectiveIsEnum) {
      updatedColumn.aggregationFn = "count";
      updatedColumn.aggregatedCell = ({ getValue }) => (
        <span className="font-bold text-primary">{getValue()} items</span>
      );
    } else if (effectiveDataType === "currency") {
      updatedColumn.aggregationFn = (columnId, leafRows, childRows) => {
        let sum = 0;
        leafRows.forEach((row) => {
          const value = row.getValue(columnId);
          const numValue = parseNumericValue(value);
          if (numValue !== null) {
            sum += numValue;
          }
        });
        return sum;
      };
      updatedColumn.aggregatedCell = ({ getValue, column }) => {
        const value = getValue();
        const config = getColumnConfig(column.id);
        const currencySymbol = config?.currencySymbol || "$";

        return (
          <span className="font-bold text-chart-2">
            Total:{" "}
            {currencySymbol}
            {new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(value || 0)}
          </span>
        );
      };
    } else if (effectiveDataType === "percentage") {
      updatedColumn.aggregationFn = (columnId, leafRows, childRows) => {
        let sum = 0;
        let count = 0;
        leafRows.forEach((row) => {
          const value = row.getValue(columnId);
          const numValue = parseNumericValue(value);
          if (numValue !== null) {
            sum += numValue;
            count++;
          }
        });
        return count > 0 ? sum / count : 0;
      };
      updatedColumn.aggregatedCell = ({ getValue }) => (
        <span className="font-bold text-primary">
          Avg: {Math.round(getValue() || 0)}%
        </span>
      );
    } else if (effectiveDataType === "number") {
      updatedColumn.aggregationFn = (columnId, leafRows, childRows) => {
        let sum = 0;
        leafRows.forEach((row) => {
          const value = row.getValue(columnId);
          const numValue = parseNumericValue(value);
          if (numValue !== null) {
            sum += numValue;
          }
        });
        return sum;
      };
      updatedColumn.aggregatedCell = ({ getValue }) => (
        <span className="font-bold text-primary">
          Sum: {(getValue() || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
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

    if (config.aggregationFn !== undefined) {
      updatedColumn.aggregationFn =
        config.aggregationFn === "none" ? undefined : config.aggregationFn;
    }

    return updatedColumn;
  });
}

export const COLUMN_CONFIG_TEMPLATES = {
  STATUS: { forceEnum: true, dataType: "text" },
  STATE: { forceEnum: true, dataType: "text" },
  ACTIVE: { forceEnum: true, dataType: "boolean" },
  ENABLED: { forceEnum: true, dataType: "boolean" },
  PHONE: { forceEnum: false, dataType: "phone" },
  EMAIL: { forceEnum: false, dataType: "email" },
  URL: { forceEnum: false, dataType: "url" },
  DATE: { dataType: "date" },
  TIMESTAMP: { dataType: "date" },
  DATETIME: { dataType: "date" },
  PRICE: { dataType: "currency" },
  AMOUNT: { dataType: "currency" },
  RATE: { dataType: "percentage" },
  PERCENTAGE: { dataType: "percentage" },
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
    saveToStorage();
    return true;
  } catch (error) {
    console.error("Failed to import config:", error);
    return false;
  }
}

export const PRESET_CONFIGS = {
  ECOMMERCE: {
    product_id: { forceEnum: false },
    product_name: { forceEnum: false },
    category: { forceEnum: true },
    price: { dataType: "currency" },
    discount: { dataType: "percentage" },
    status: { forceEnum: true },
    created_at: { dataType: "date" },
  },
  CRM: {
    id: { forceEnum: false },
    name: { forceEnum: false },
    email: { dataType: "email" },
    phone: { dataType: "phone" },
    status: { forceEnum: true },
    company: { forceEnum: false },
    country: { forceEnum: true },
    created_date: { dataType: "date" },
  },
  HR: {
    employee_id: { forceEnum: false },
    name: { forceEnum: false },
    department: { forceEnum: true },
    role: { forceEnum: true },
    status: { forceEnum: true },
    salary: { dataType: "currency" },
    hire_date: { dataType: "date" },
    gender: { forceEnum: true },
  },
  ANALYTICS: {
    event_id: { forceEnum: false },
    event_type: { forceEnum: true },
    user_id: { forceEnum: false },
    timestamp: { dataType: "date" },
    duration: { dataType: "number" },
    revenue: { dataType: "currency" },
    status: { forceEnum: true },
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