import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink } from "lucide-react";
import { getColumnConfig } from "./columnConfigSystem";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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

export function UrlCell({ value }) {
    const [showWarning, setShowWarning] = useState(false);

    if (!value) return <span className="text-muted-foreground">-</span>;

    const handleClick = (e) => {
        e.preventDefault();
        const dontShowAgain = sessionStorage.getItem("datagrid-url-warning-dismissed");
        if (dontShowAgain === "true") {
            window.open(value, '_blank', 'noopener,noreferrer');
        } else {
            setShowWarning(true);
        }
    };

    const handleConfirm = () => {
        setShowWarning(false);
        window.open(value, '_blank', 'noopener,noreferrer');
    };

    const handleDismiss = (checked) => {
        if (checked) {
            sessionStorage.setItem("datagrid-url-warning-dismissed", "true");
        } else {
            sessionStorage.removeItem("datagrid-url-warning-dismissed");
        }
    };

    return (
        <>
            <a
                href={value}
                onClick={handleClick}
                className="text-primary hover:underline cursor-pointer flex items-center gap-1 truncate max-w-full"
            >
                <span className="truncate">{value}</span>
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>

            <Dialog open={showWarning} onOpenChange={setShowWarning}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>External Link Warning</DialogTitle>
                        <DialogDescription>
                            You are about to leave the application and visit an external website:
                            <br />
                            <span className="font-mono text-xs mt-2 block bg-muted p-2 rounded break-all">{value}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 py-4">
                        <Checkbox id="dont-show" onCheckedChange={handleDismiss} className="border-foreground/20" />
                        <label
                            htmlFor="dont-show"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Don't show this warning again
                        </label>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowWarning(false)}>Cancel</Button>
                        <Button onClick={handleConfirm}>Continue</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function ExpandableTextCell({ value }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (value === null || value === undefined) {
        return <span className="text-muted-foreground">-</span>;
    }

    const stringValue = String(value);

    const content = (
        <div
            className="text-sm cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
                wordBreak: isExpanded ? 'break-word' : 'normal',
                overflowWrap: isExpanded ? 'break-word' : 'normal',
                whiteSpace: isExpanded ? 'normal' : 'nowrap',
                overflow: isExpanded ? 'visible' : 'hidden',
                textOverflow: isExpanded ? 'clip' : 'ellipsis',
                maxWidth: '100%',
            }}
        >
            {stringValue}
        </div>
    );

    if (isExpanded) {
        return content;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {content}
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs break-words">{stringValue}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export function analyzeData(rawData) {
    if (!rawData || rawData.length === 0) {
        return { columns: [], data: [], metadata: {} };
    }

    const cleanedData = cleanData(rawData);
    const hasNestedData = detectNestedData(cleanedData);
    const columnAnalysis = analyzeColumns(cleanedData);
    const columns = generateColumnDefinitions(columnAnalysis, hasNestedData);
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
                    let cleanedValue = value.trim();
                    if (cleanedValue.startsWith('="') && cleanedValue.endsWith('"')) {
                        cleanedValue = cleanedValue.slice(2, -1);
                    }
                    cleaned[key] = cleanedValue;
                } else {
                    cleaned[key] = value;
                }
            }
            return cleaned;
        });
}

function detectNestedData(data) {
    return data.some(row =>
        Object.values(row).some(val =>
            typeof val === 'object' && val !== null
        )
    );
}

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
        const dataType = isNested ? 'nested' : detectDataType(values, key);

        columns[key] = {
            name: key,
            dataType: dataType,
            isEnum: !isNested && isEnumColumn(values, key),
            uniqueValues: getUniqueValues(values),
            hasNulls: data.some(row => row[key] === null || row[key] === undefined || row[key] === ''),
            maxLength: getMaxLength(values),
            isNested: isNested,
            forceEnum: false,
        };
    });

    return columns;
}

function detectDataType(values, columnName) {
    if (values.length === 0) return 'text';

    const lowerColumnName = columnName.toLowerCase();

    // Check for phone columns by name first
    const phoneKeywords = ['phone', 'mobile', 'tel', 'contact'];
    const isPhoneColumn = phoneKeywords.some(keyword => lowerColumnName.includes(keyword));

    if (isPhoneColumn) {
        const phonePattern = /^[\d\s\-\(\)\+]+$/;
        const phoneValues = values.filter(val =>
            typeof val === 'string' && phonePattern.test(val) && val.replace(/\D/g, '').length >= 7
        );
        if (phoneValues.length / values.length > 0.5) {
            return 'phone';
        }
    }

    // Check for dates
    const datePattern = /^\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}/;
    if (values.slice(0, 10).every(val =>
        typeof val === 'string' && datePattern.test(val)
    )) {
        return 'date';
    }

    // Check for URLs
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (values.some(val => typeof val === 'string' && urlPattern.test(val))) {
        return 'url';
    }

    // Check for numbers
    const numericValues = values.filter(val =>
        typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val))
    );

    if (numericValues.length / values.length > 0.8) {
        const currencyPattern = /^\$|€|£|¥/;
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

function isEnumColumn(values, key) {
    if (values.length === 0) return false;

    const uniqueValues = new Set(
        values.map(v => {
            if (typeof v === 'boolean') return String(v);
            return String(v).toLowerCase();
        })
    );
    const uniqueRatio = uniqueValues.size / values.length;
    return uniqueValues.size <= 10 || uniqueRatio < 0.2;
}

function getUniqueValues(values) {
    const unique = new Set(
        values.map(v => {
            if (typeof v === 'boolean') return String(v);
            return String(v);
        })
    );
    return Array.from(unique).slice(0, 20);
}

function getMaxLength(values) {
    return Math.max(...values.map(v => String(v).length), 0);
}

// Sanitize column key to make it safe as an accessor
function sanitizeColumnKey(key) {
    // Replace special characters with underscores, but keep the mapping
    return key.replace(/[^a-zA-Z0-9_]/g, '_');
}

// Exported function to get cell renderer based on data type
export function getCellRenderer(dataType, isEnum, uniqueValues = []) {
    if (isEnum) {
        return ({ getValue }) => {
            const value = getValue();
            const displayValue = typeof value === 'boolean' ? String(value) : value;
            return (
                <Badge
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border-2"
                    style={{
                        backgroundColor: getEnumColor(displayValue, uniqueValues).bg,
                        color: getEnumColor(displayValue, uniqueValues).text,
                        borderColor: getEnumColor(displayValue, uniqueValues).border,
                    }}
                >
                    {displayValue ? displayValue : "-"}
                </Badge>
            );
        };
    }

    if (dataType === 'url') {
        return ({ getValue }) => <UrlCell value={getValue()} />;
    }

    if (dataType === 'currency') {
        return ({ getValue, column }) => {
            const value = getValue();
            const config = getColumnConfig(column.id);
            const currencySymbol = config?.currencySymbol || "$";

            const numValue = parseNumericValue(value);

            if (numValue === null) return <span className="text-muted-foreground">-</span>;

            // Use precision from config if available
            const precision = config?.precision !== undefined ? config.precision : 2;

            const formatted = new Intl.NumberFormat("en-US", {
                minimumFractionDigits: precision,
                maximumFractionDigits: precision,
            }).format(numValue);

            return (
                <span className="text-foreground text-sm tabular-nums">
                    {currencySymbol}{formatted}
                </span>
            );
        };
    }

    if (dataType === 'percentage') {
        return ({ getValue }) => {
            const value = getValue();
            const numValue = parseNumericValue(value);

            if (numValue === null) return <span className="text-muted-foreground">-</span>;

            return (
                <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-full h-2.5 overflow-hidden bg-muted">
                        <div
                            className="h-2.5 rounded-full transition-all duration-150"
                            style={{
                                backgroundColor: numValue >= 70 ? "var(--color-chart-2)" :
                                    numValue >= 40 ? "var(--color-chart-3)" :
                                        "var(--color-destructive)",
                                width: `${Math.min(Math.max(numValue, 0), 100)}%`,
                            }}
                        />
                    </div>
                    <span className="text-xs w-10 text-foreground tabular-nums">
                        {numValue}%
                    </span>
                </div>
            );
        };
    }

    if (dataType === 'phone') {
        return ({ getValue }) => {
            const value = getValue();
            if (!value) return <span className="text-muted-foreground">-</span>;

            const phoneStr = String(value);
            const digits = phoneStr.replace(/\D/g, '');
            let formattedPhone = phoneStr;

            // Handle international format (e.g., 919000000000 -> +91 900 000 0000)
            if (digits.length === 12 && digits.startsWith('91')) {
                formattedPhone = `+91 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
            } else if (digits.length === 11 && digits.startsWith('91')) {
                formattedPhone = `+91 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
            } else if (digits.length === 10) {
                formattedPhone = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
            } else if (digits.length === 11 && digits.startsWith('1')) {
                formattedPhone = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
            }

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <a
                                href={`tel:${digits}`}
                                className="text-primary hover:underline text-sm whitespace-nowrap"
                            >
                                {formattedPhone}
                            </a>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Call {formattedPhone}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        };
    }

    if (dataType === 'number') {
        return ({ getValue, column }) => {
            const value = getValue();
            if (value === null || value === undefined) {
                return <span className="text-muted-foreground">-</span>;
            }

            const config = getColumnConfig(column.id);
            const precision = config?.precision !== undefined ? config.precision : undefined;

            let displayValue = value;
            if (typeof value === 'number') {
                // Always format large numbers to avoid scientific notation
                if (Math.abs(value) >= 1e10) {
                    // For very large numbers, show as integer without decimals
                    displayValue = value.toLocaleString('en-US', { maximumFractionDigits: 0, useGrouping: true });
                } else if (Math.abs(value) >= 1e15) {
                    displayValue = BigInt(Math.round(value)).toString();
                } else {
                    if (precision !== undefined) {
                        displayValue = value.toLocaleString('en-US', {
                            minimumFractionDigits: precision,
                            maximumFractionDigits: precision
                        });
                    } else {
                        displayValue = value.toLocaleString('en-US', { maximumFractionDigits: 3 });
                    }
                }
            }
            return <span className="text-foreground text-sm tabular-nums">{displayValue}</span>;
        };
    }

    if (dataType === 'text') {
        return ({ getValue }) => <ExpandableTextCell value={getValue()} />;
    }

    return undefined;
}

function generateColumnDefinitions(columnAnalysis, hasNestedData) {
    const columns = [];

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
        maxSize: 50,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        enablePinning: false,
        enableReordering: false,
        enableColumnFilter: false,
        enableDrag: false,
    });

    if (hasNestedData) {
        columns.push({
            id: "expand",
            header: "",
            cell: ({ row }) => (
                <button
                    onClick={() => row.toggleExpanded()}
                    className="p-1 rounded-md transition-colors bg-muted/50 hover:bg-muted text-foreground"
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

    Object.entries(columnAnalysis).forEach(([key, analysis]) => {
        if (analysis.isNested) return;

        const sanitizedKey = sanitizeColumnKey(key);

        const column = {
            id: sanitizedKey,
            // Use accessorFn instead of accessorKey to handle keys with dots
            accessorFn: (row) => row[key],
            header: formatHeaderName(key),
            filterFn: "advanced",
            size: calculateColumnWidth(analysis, key),
            meta: {
                dataType: mapDataType(analysis.dataType),
                headerText: formatHeaderName(key),
                uniqueValues: analysis.uniqueValues,
                isEnum: analysis.isEnum,
                originalKey: key, // Store original key
            },
            enableColumnFilter: true,
            enableGrouping: analysis.isEnum,
        };

        const renderer = getCellRenderer(analysis.dataType, analysis.isEnum, analysis.uniqueValues);
        if (renderer) {
            column.cell = renderer;
        }

        // Add aggregation functions based on data type
        if (analysis.isEnum) {
            column.aggregationFn = "count";
            column.aggregatedCell = ({ getValue }) => (
                <span className="font-bold text-primary">
                    {getValue()} items
                </span>
            );
        } else if (analysis.dataType === 'currency' || analysis.dataType === 'number') {
            // For numeric columns, enable multiple aggregations
            column.aggregationFn = "sum";
            column.aggregatedCell = ({ getValue, column }) => {
                const aggFn = column.columnDef.aggregationFn;
                if (analysis.dataType === 'currency') {
                    return (
                        <span className="font-bold text-chart-2">
                            {aggFn === 'sum' && 'Total: '}
                            {aggFn === 'mean' && 'Avg: '}
                            {aggFn === 'min' && 'Min: '}
                            {aggFn === 'max' && 'Max: '}
                            {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                            }).format(getValue())}
                        </span>
                    );
                } else {
                    return (
                        <span className="font-bold text-primary">
                            {aggFn === 'sum' && 'Sum: '}
                            {aggFn === 'mean' && 'Avg: '}
                            {aggFn === 'min' && 'Min: '}
                            {aggFn === 'max' && 'Max: '}
                            {aggFn === 'median' && 'Median: '}
                            {aggFn === 'count' && 'Count: '}
                            {typeof getValue() === 'number' ? getValue().toLocaleString('en-US', { maximumFractionDigits: 2 }) : getValue()}
                        </span>
                    );
                }
            };
        } else if (analysis.dataType === 'percentage') {
            column.aggregationFn = "mean";
            column.aggregatedCell = ({ getValue }) => (
                <span className="font-bold text-primary">
                    Avg: {Math.round(getValue())}%
                </span>
            );
        }

        columns.push(column);
    });

    return columns;
}

function formatHeaderName(key) {
    if (!key) return '';

    // Truncate very long headers
    if (key.length > 50) {
        return key.substring(0, 47) + '...';
    }

    return key
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function mapDataType(dataType) {
    const validTypes = ['text', 'number', 'currency', 'percentage', 'date', 'boolean', 'phone', 'email', 'url', 'nested'];
    return validTypes.includes(dataType) ? dataType : 'text';
}

function calculateColumnWidth(analysis, columnName) {
    const CHAR_WIDTH = 10;
    const HEADER_PADDING = 60;
    const MIN_WIDTH = 200;
    const MAX_WIDTH = 600;

    const headerText = formatHeaderName(columnName);
    const headerLength = Math.min(headerText.length, 50);
    const headerBasedWidth = (headerLength * CHAR_WIDTH) + HEADER_PADDING;

    const typeMinWidths = {
        'date': 150,
        'number': 150,
        'currency': 150,
        'percentage': 160,
        'boolean': 110,
        'nested': 180,
        'text': 150,
        'phone': 150,
        'email': 220,
        'url': 220,
    };

    let baseWidth = typeMinWidths[analysis.dataType] || 150;

    if (analysis.isEnum) {
        const maxValueLength = Math.max(
            ...analysis.uniqueValues.map(v => String(v).length)
        );
        baseWidth = Math.max(baseWidth, maxValueLength * CHAR_WIDTH + 60);
    }

    const finalWidth = Math.max(headerBasedWidth, baseWidth);
    return Math.min(Math.max(finalWidth, MIN_WIDTH), MAX_WIDTH);
}

export function getEnumColor(value, allValues) {
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