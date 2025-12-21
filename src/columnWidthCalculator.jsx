/**
 * Intelligent column width calculator based on header length and data type
 * Provides sensible defaults and auto-sizing capabilities
 */

const CHAR_WIDTH_ESTIMATE = 8.5; // pixels per character (approximate for monospace/default font)
const PADDING = 32; // horizontal padding (left + right in cells)
const HEADER_PADDING = 16; // extra padding for header content
const MIN_WIDTH = 120;
const MAX_WIDTH = 600;

/**
 * Calculate width based on header text length
 * This is a fast estimation without needing to render
 */
export function calculateHeaderBasedWidth(headerText, dataType = 'text') {
    if (!headerText) return MIN_WIDTH;

    const baseHeaderWidth = headerText.length * CHAR_WIDTH_ESTIMATE + HEADER_PADDING;

    // Type-specific minimum widths
    const typeMinWidths = {
        'date': 120,
        'number': 110,
        'currency': 130,
        'percentage': 140,
        'boolean': 100,
        'text': 120,
        'nested': 150,
    };

    const typeMinWidth = typeMinWidths[dataType] || 120;
    const calculatedWidth = Math.max(baseHeaderWidth, typeMinWidth);

    return Math.min(calculatedWidth, MAX_WIDTH);
}

/**
 * Calculate width based on content analysis
 * Used when actual data is available
 */
export function calculateContentBasedWidth(values, dataType = 'text') {
    if (!values || values.length === 0) return MIN_WIDTH;

    let maxLength = 0;
    values.forEach(val => {
        if (val !== null && val !== undefined) {
            const strVal = String(val);
            maxLength = Math.max(maxLength, strVal.length);
        }
    });

    const typeBaseWidths = {
        'date': 120,
        'number': 100,
        'currency': 130,
        'percentage': 140,
        'boolean': 90,
        'nested': 150,
    };

    const typeBase = typeBaseWidths[dataType] || 120;
    const contentWidth = Math.min(maxLength * CHAR_WIDTH_ESTIMATE, 300) + PADDING;

    return Math.max(contentWidth, typeBase, MIN_WIDTH);
}

/**
 * Calculate combined width using both header and content
 */
export function calculateOptimalWidth(headerText, values, dataType = 'text') {
    const headerWidth = calculateHeaderBasedWidth(headerText, dataType);
    const contentWidth = calculateContentBasedWidth(values, dataType);

    // Use the larger of the two, but respect max width
    return Math.min(Math.max(headerWidth, contentWidth), MAX_WIDTH);
}

/**
 * Distributor function to fill remaining table width
 * Use this when you have extra space to distribute
 */
export function distributeRemainingWidth(columns, totalWidth, usedWidth) {
    if (totalWidth <= usedWidth) return columns.map(c => c.size);

    const remainingWidth = totalWidth - usedWidth;
    const distributionFactor = remainingWidth / columns.length;

    return columns.map(col => Math.min(col.size + distributionFactor, MAX_WIDTH));
}

/**
 * Get size recommendation for a column
 * Returns suggested size based on all available information
 */
export function getSizeRecommendation(column, values = []) {
    const headerText = column.header || column.name || column.id || '';
    const dataType = column.meta?.dataType || column.dataType || 'text';

    if (values && values.length > 0) {
        return calculateOptimalWidth(headerText, values, dataType);
    }

    return calculateHeaderBasedWidth(headerText, dataType);
}

/**
 * Pre-calculate all column widths for a dataset
 * Useful for initializing column sizes before rendering
 */
export function precalculateColumnWidths(columns, data = []) {
    return columns.reduce((acc, column) => {
        const columnKey = column.accessorKey || column.id;
        const values = data.map(row => row[columnKey]).filter(v => v !== null && v !== undefined);

        acc[column.id] = getSizeRecommendation(column, values);

        return acc;
    }, {});
}

/**
 * Calculate table fill factor
 * Returns how much of the available width is being used
 */
export function calculateTableFillFactor(columnWidths, tableWidth) {
    if (tableWidth <= 0) return 0;

    const totalColumnWidth = Object.values(columnWidths).reduce((sum, w) => sum + w, 0);
    return (totalColumnWidth / tableWidth) * 100;
}

/**
 * Proportionally expand columns to fill available width
 */
export function expandColumnsProportionally(columnWidths, targetTableWidth) {
    const totalCurrentWidth = Object.values(columnWidths).reduce((sum, w) => sum + w, 0);

    if (totalCurrentWidth >= targetTableWidth) {
        return columnWidths;
    }

    const scale = targetTableWidth / totalCurrentWidth;
    const expanded = {};

    Object.entries(columnWidths).forEach(([colId, width]) => {
        expanded[colId] = Math.min(width * scale, MAX_WIDTH);
    });

    return expanded;
}

/**
 * Smart width suggestion with flex distribution
 * For responsive tables - distributes remaining space flexibly
 */
export function calculateFlexibleWidths(columns, minTableWidth = 1000) {
    const baseSizes = columns.map(col => ({
        id: col.id,
        base: calculateHeaderBasedWidth(col.header || col.id, col.meta?.dataType),
        flex: 1, // default flex growth
    }));

    const totalBase = baseSizes.reduce((sum, s) => sum + s.base, 0);

    if (totalBase >= minTableWidth) {
        return Object.fromEntries(baseSizes.map(s => [s.id, s.base]));
    }

    // Distribute remaining space
    const remaining = minTableWidth - totalBase;
    const flexGrowPerUnit = remaining / baseSizes.reduce((sum, s) => sum + s.flex, 0);

    const flexible = {};
    baseSizes.forEach(size => {
        flexible[size.id] = Math.min(
            size.base + (size.flex * flexGrowPerUnit),
            MAX_WIDTH
        );
    });

    return flexible;
}