import { Badge } from "@/components/ui/badge";

/**
 * Analyzes uploaded data and generates intelligent column definitions
 */
export function analyzeData(rawData) {
    if (!rawData || rawData.length === 0) {
        return { columns: [], data: [], metadata: {} };
    }

    // Clean and prepare data
    const cleanedData = cleanData(rawData);

    // Detect nested data
    const hasNestedData = detectNestedData(cleanedData);

    // Analyze each column
    const columnAnalysis = analyzeColumns(cleanedData);

    // Generate column definitions
    const columns = generateColumnDefinitions(columnAnalysis, hasNestedData);

    // Add IDs if not present
    const dataWithIds = addIdsToData(cleanedData);

    return {
        columns,
        data: dataWithIds,
        metadata: {
            rowCount: dataWithIds.length,
            columnCount: columns.length,
            hasNestedData,
            analyzedAt: new Date().toISOString(),
        }
    };
}

/**
 * Cleans raw data - removes empty rows, trims strings
 */
function cleanData(data) {
    return data
        .filter(row => {
            // Filter out completely empty rows
            return Object.values(row).some(val =>
                val !== null && val !== undefined && val !== ''
            );
        })
        .map(row => {
            // Trim string values
            const cleaned = {};
            for (const [key, value] of Object.entries(row)) {
                if (typeof value === 'string') {
                    cleaned[key] = value.trim();
                } else {
                    cleaned[key] = value;
                }
            }
            return cleaned;
        });
}

/**
 * Detects if data has nested objects/arrays
 */
function detectNestedData(data) {
    return data.some(row =>
        Object.values(row).some(val =>
            typeof val === 'object' && val !== null
        )
    );
}

/**
 * Analyzes all columns to determine their data types and characteristics
 */
function analyzeColumns(data) {
    const columns = {};
    const sampleSize = Math.min(data.length, 100); // Sample first 100 rows

    // Get all unique column names
    const allKeys = new Set();
    data.slice(0, sampleSize).forEach(row => {
        Object.keys(row).forEach(key => allKeys.add(key));
    });

    // Analyze each column
    allKeys.forEach(key => {
        const values = data.slice(0, sampleSize)
            .map(row => row[key])
            .filter(val => val !== null && val !== undefined && val !== '');

        columns[key] = {
            name: key,
            dataType: detectDataType(values),
            isEnum: isEnumColumn(values),
            uniqueValues: getUniqueValues(values),
            hasNulls: data.some(row => row[key] === null || row[key] === undefined || row[key] === ''),
            maxLength: getMaxLength(values),
            isNested: values.some(val => typeof val === 'object' && val !== null),
        };
    });

    return columns;
}

/**
 * Detects the data type of a column based on its values
 */
function detectDataType(values) {
    if (values.length === 0) return 'text';

    // Check for dates
    const datePattern = /^\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}/;
    if (values.slice(0, 10).every(val =>
        typeof val === 'string' && datePattern.test(val)
    )) {
        return 'date';
    }

    // Check for numbers
    const numericValues = values.filter(val =>
        typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val))
    );

    if (numericValues.length / values.length > 0.8) {
        // Check if it's currency
        const currencyPattern = /^\$|€|£|¥/;
        if (values.some(val =>
            typeof val === 'string' && currencyPattern.test(val)
        )) {
            return 'currency';
        }

        // Check if it's percentage
        if (values.some(val =>
            typeof val === 'string' && val.includes('%')
        )) {
            return 'percentage';
        }

        return 'number';
    }

    // Check for booleans
    const boolValues = values.filter(val =>
        typeof val === 'boolean' ||
        (typeof val === 'string' && ['true', 'false', 'yes', 'no', '1', '0'].includes(val.toLowerCase()))
    );

    if (boolValues.length / values.length > 0.8) {
        return 'boolean';
    }

    return 'text';
}

/**
 * Determines if a column should be treated as an enum (categorical data)
 */
function isEnumColumn(values) {
    if (values.length === 0) return false;

    const uniqueValues = new Set(values.map(v => String(v).toLowerCase()));
    const uniqueRatio = uniqueValues.size / values.length;

    // Consider it an enum if:
    // 1. Less than 10 unique values OR
    // 2. Unique values ratio is less than 20% (repeated values)
    return uniqueValues.size <= 10 || uniqueRatio < 0.2;
}

/**
 * Gets unique values for enum detection
 */
function getUniqueValues(values) {
    const unique = new Set(values.map(v => String(v)));
    return Array.from(unique).slice(0, 20); // Return max 20 for display
}

/**
 * Gets max length for text columns
 */
function getMaxLength(values) {
    return Math.max(
        ...values.map(v => String(v).length),
        0
    );
}

/**
 * Generates column definitions for TanStack Table
 */
function generateColumnDefinitions(columnAnalysis, hasNestedData) {
    const columns = [];

    // Add selection column
    columns.push({
        id: "select",
        header: ({ table }) => (
            <input
                type="checkbox"
                checked={table.getIsAllPageRowsSelected()}
                onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            />
        ),
        cell: ({ row }) => (
            <input
                type="checkbox"
                checked={row.getIsSelected()}
                onChange={(e) => row.toggleSelected(!!e.target.checked)}
                className="mx-auto"
            />
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        enablePinning: false,
        enableReordering: false,
        enableColumnFilter: false,
        enableDrag: false,
    });

    // Add expand column if nested data exists
    if (hasNestedData) {
        columns.push({
            id: "expand",
            header: "",
            cell: ({ row }) => (
                <button
                    onClick={() => row.toggleExpanded()}
                    className="p-1 rounded-md transition-colors"
                    style={{
                        backgroundColor: "color-mix(in oklch, var(--color-muted), transparent 90%)",
                        color: "var(--color-foreground)",
                    }}
                >
                    {row.getIsExpanded() ? '▼' : '▶'}
                </button>
            ),
            size: 50,
            enableSorting: false,
            enableHiding: false,
            enableResizing: false,
            enablePinning: false,
            enableReordering: false,
            enableColumnFilter: false,
            enableDrag: false,
        });
    }

    // Add data columns
    Object.entries(columnAnalysis).forEach(([key, analysis]) => {
        if (analysis.isNested) {
            // Skip nested columns for now, they'll be shown in expansion
            return;
        }

        const column = {
            accessorKey: key,
            header: formatHeaderName(key),
            filterFn: "advanced",
            size: calculateColumnWidth(analysis),
            meta: {
                dataType: mapDataType(analysis.dataType),
                headerText: formatHeaderName(key),
            },
            enableColumnFilter: true,
            enableGrouping: analysis.isEnum,
        };

        // Add custom cell renderer for enums
        if (analysis.isEnum) {
            column.cell = ({ getValue }) => {
                const value = getValue();
                return (
                    <Badge
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm border-2"
                        style={{
                            backgroundColor: getEnumColor(value, analysis.uniqueValues).bg,
                            color: getEnumColor(value, analysis.uniqueValues).text,
                            borderColor: getEnumColor(value, analysis.uniqueValues).border,
                        }}
                    >
                        {value}
                    </Badge>
                );
            };

            column.aggregationFn = "count";
            column.aggregatedCell = ({ getValue }) => (
                <span className="font-bold" style={{ color: "var(--color-primary)" }}>
                    {getValue()} items
                </span>
            );
        }

        // Add custom cell renderer for currency
        if (analysis.dataType === 'currency') {
            column.cell = ({ getValue }) => {
                const value = getValue();
                const numValue = typeof value === 'string'
                    ? parseFloat(value.replace(/[^0-9.-]/g, ''))
                    : value;
                return new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(numValue);
            };

            column.aggregationFn = "sum";
            column.aggregatedCell = ({ getValue }) => (
                <span className="font-bold" style={{ color: "var(--color-chart-2)" }}>
                    Total: {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                    }).format(getValue())}
                </span>
            );
        }

        // Add custom cell renderer for percentage
        if (analysis.dataType === 'percentage') {
            column.cell = ({ getValue }) => {
                const value = getValue();
                const numValue = typeof value === 'string'
                    ? parseFloat(value.replace('%', ''))
                    : value;

                return (
                    <div className="flex items-center gap-2">
                        <div
                            className="flex-1 rounded-full h-2.5 overflow-hidden"
                            style={{ backgroundColor: "var(--color-muted)" }}
                        >
                            <div
                                className="h-2.5 rounded-full transition-all duration-150"
                                style={{
                                    backgroundColor: numValue >= 70 ? "var(--color-chart-2)" :
                                        numValue >= 40 ? "var(--color-chart-3)" :
                                            "var(--color-destructive)",
                                    width: `${numValue}%`,
                                }}
                            />
                        </div>
                        <span className="text-xs font-bold w-10" style={{ color: "var(--color-foreground)" }}>
                            {numValue}%
                        </span>
                    </div>
                );
            };

            column.aggregationFn = "mean";
            column.aggregatedCell = ({ getValue }) => (
                <span className="font-bold" style={{ color: "var(--color-primary)" }}>
                    Avg: {Math.round(getValue())}%
                </span>
            );
        }

        columns.push(column);
    });

    return columns;
}

/**
 * Formats column name for display
 */
function formatHeaderName(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();
}

/**
 * Maps internal data type to table data type
 */
function mapDataType(dataType) {
    switch (dataType) {
        case 'currency':
        case 'percentage':
        case 'number':
            return 'number';
        case 'date':
            return 'date';
        default:
            return 'text';
    }
}

/**
 * Calculates optimal column width based on content
 */
function calculateColumnWidth(analysis) {
    const baseWidth = 150;
    const charWidth = 8;

    if (analysis.isEnum) {
        const maxValueLength = Math.max(
            ...analysis.uniqueValues.map(v => String(v).length)
        );
        return Math.min(Math.max(baseWidth, maxValueLength * charWidth + 60), 300);
    }

    if (analysis.dataType === 'date') {
        return 200;
    }

    if (analysis.dataType === 'number' || analysis.dataType === 'currency') {
        return 180;
    }

    if (analysis.dataType === 'percentage') {
        return 250;
    }

    // For text, use max length as guide
    const estimatedWidth = Math.min(
        Math.max(baseWidth, analysis.maxLength * charWidth),
        400
    );

    return estimatedWidth;
}

/**
 * Generates color scheme for enum values
 */
function getEnumColor(value, allValues) {
    const index = allValues.indexOf(String(value));
    const colors = [
        {
            bg: "color-mix(in oklch, var(--color-chart-2), transparent 90%)",
            text: "var(--color-chart-2)",
            border: "color-mix(in oklch, var(--color-chart-2), transparent 70%)",
        },
        {
            bg: "color-mix(in oklch, var(--color-primary), transparent 90%)",
            text: "var(--color-primary)",
            border: "color-mix(in oklch, var(--color-primary), transparent 70%)",
        },
        {
            bg: "color-mix(in oklch, var(--color-chart-3), transparent 90%)",
            text: "var(--color-chart-3)",
            border: "color-mix(in oklch, var(--color-chart-3), transparent 70%)",
        },
        {
            bg: "color-mix(in oklch, var(--color-chart-5), transparent 90%)",
            text: "var(--color-chart-5)",
            border: "color-mix(in oklch, var(--color-chart-5), transparent 70%)",
        },
        {
            bg: "var(--color-muted)",
            text: "var(--color-muted-foreground)",
            border: "var(--color-border)",
        },
    ];

    return colors[index % colors.length] || colors[colors.length - 1];
}

/**
 * Adds unique IDs to data rows if not present
 */
function addIdsToData(data) {
    return data.map((row, index) => {
        if (!row.id) {
            return {
                id: `row_${String(index + 1).padStart(5, '0')}`,
                ...row
            };
        }
        return row;
    });
}