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
            return Object.values(row).some(val =>
                val !== null && val !== undefined && val !== ''
            );
        })
        .map(row => {
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
    const sampleSize = Math.min(data.length, 100);

    const allKeys = new Set();
    data.slice(0, sampleSize).forEach(row => {
        Object.keys(row).forEach(key => allKeys.add(key));
    });

    allKeys.forEach(key => {
        const values = data.slice(0, sampleSize)
            .map(row => row[key])
            .filter(val => val !== null && val !== undefined && val !== '');

        const isNested = values.some(val => typeof val === 'object' && val !== null);

        columns[key] = {
            name: key,
            dataType: isNested ? 'nested' : detectDataType(values),
            isEnum: !isNested && isEnumColumn(values),
            uniqueValues: getUniqueValues(values),
            hasNulls: data.some(row => row[key] === null || row[key] === undefined || row[key] === ''),
            maxLength: getMaxLength(values),
            isNested: isNested,
        };
    });

    return columns;
}

/**
 * Detects the data type of a column based on its values
 */
function detectDataType(values) {
    if (values.length === 0) return 'text';

    const datePattern = /^\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}/;
    if (values.slice(0, 10).every(val =>
        typeof val === 'string' && datePattern.test(val)
    )) {
        return 'date';
    }

    const numericValues = values.filter(val =>
        typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val))
    );

    if (numericValues.length / values.length > 0.8) {
        const currencyPattern = /^\$|â‚¬|Â£|Â¥/;
        if (values.some(val =>
            typeof val === 'string' && currencyPattern.test(val)
        )) {
            return 'currency';
        }

        if (values.some(val =>
            typeof val === 'string' && val.includes('%')
        )) {
            return 'percentage';
        }

        return 'number';
    }

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
 * Determines if a column should be treated as an enum
 */
function isEnumColumn(values) {
    if (values.length === 0) return false;

    // Convert all values to strings for comparison, handle booleans explicitly
    const uniqueValues = new Set(
        values.map(v => {
            if (typeof v === 'boolean') return String(v); // 'true' or 'false'
            return String(v).toLowerCase();
        })
    );
    const uniqueRatio = uniqueValues.size / values.length;

    return uniqueValues.size <= 10 || uniqueRatio < 0.2;
}

/**
 * Gets unique values for enum detection
 */
function getUniqueValues(values) {
    const unique = new Set(
        values.map(v => {
            // Handle booleans explicitly
            if (typeof v === 'boolean') return String(v);
            return String(v);
        })
    );
    return Array.from(unique).slice(0, 20);
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

    // Selection column
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

    // Expand column if nested data exists
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
                    {row.getIsExpanded() ? 'â–¼' : 'â–¶'}
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

    // Data columns
    Object.entries(columnAnalysis).forEach(([key, analysis]) => {
        if (analysis.isNested) {
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

        if (analysis.isEnum) {
            column.cell = ({ getValue }) => {
                const value = getValue();
                // Ensure value is converted to string for display
                const displayValue = typeof value === 'boolean' ? String(value) : value;
                return (
                    <Badge
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm border-2"
                        style={{
                            backgroundColor: getEnumColor(displayValue, analysis.uniqueValues).bg,
                            color: getEnumColor(displayValue, analysis.uniqueValues).text,
                            borderColor: getEnumColor(displayValue, analysis.uniqueValues).border,
                        }}
                    >
                        {displayValue}
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
 * Uses smart estimation including header length
 */
function calculateColumnWidth(analysis) {
    const CHAR_WIDTH = 8.5;
    const PADDING = 32;
    const MIN_WIDTH = 80;
    const MAX_WIDTH = 500;

    // Start with a type-based minimum
    const typeMinWidths = {
        'date': 120,
        'number': 110,
        'currency': 130,
        'percentage': 140,
        'boolean': 100,
        'nested': 150,
        'text': 120,
    };

    let baseWidth = typeMinWidths[analysis.dataType] || 120;

    // For enums, consider the unique values
    if (analysis.isEnum) {
        const maxValueLength = Math.max(
            ...analysis.uniqueValues.map(v => String(v).length)
        );
        baseWidth = Math.max(baseWidth, maxValueLength * CHAR_WIDTH + 60);
    } else {
        // For text, use the actual max length observed
        if (analysis.dataType === 'text' || analysis.dataType === 'nested') {
            baseWidth = Math.max(
                baseWidth,
                Math.min(analysis.maxLength * CHAR_WIDTH, 300) + PADDING
            );
        }
    }

    return Math.min(baseWidth, MAX_WIDTH);
}

/**
 * Generates color scheme for enum values
 */
function getEnumColor(value, allValues) {
    // Normalize value for comparison
    const normalizedValue = typeof value === 'boolean' ? String(value) : String(value);
    const index = allValues.indexOf(normalizedValue);
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