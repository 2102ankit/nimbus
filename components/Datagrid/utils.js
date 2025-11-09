import React from "react";

const STORAGE_KEY = "datagrid-preferences";

export function useTablePreferences(tableId = "default") {
  const storageKey = `${STORAGE_KEY}-${tableId}`;

  // Load preferences
  const loadPreferences = React.useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
    return {
      columnVisibility: {},
      columnOrder: [],
      columnSizing: {},
      columnPinning: { left: [], right: [] },
      sorting: [],
      pageSize: 10,
    };
  }, [storageKey]);

  const [preferences, setPreferences] = React.useState(loadPreferences);

  // Save preferences
  const savePreferences = React.useCallback(
    (newPrefs) => {
      try {
        const merged = { ...preferences, ...newPrefs };
        localStorage.setItem(storageKey, JSON.stringify(merged));
        setPreferences(merged);
      } catch (error) {
        console.error("Failed to save preferences:", error);
      }
    },
    [storageKey, preferences]
  );

  // Update specific preference
  const updatePreference = React.useCallback(
    (key, value) => {
      savePreferences({ [key]: value });
    },
    [savePreferences]
  );

  // Reset preferences
  const resetPreferences = React.useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      const defaults = {
        columnVisibility: {},
        columnOrder: [],
        columnSizing: {},
        columnPinning: { left: [], right: [] },
        sorting: [],
        pageSize: 10,
      };
      setPreferences(defaults);
      return defaults;
    } catch (error) {
      console.error("Failed to reset preferences:", error);
    }
  }, [storageKey]);

  return {
    preferences,
    updatePreference,
    savePreferences,
    resetPreferences,
  };
}

// Auto-save table state
export function useAutoSaveTableState(table, preferences, updatePreference) {
  const state = table.getState();

  // Save column visibility
  React.useEffect(() => {
    const visibility = state.columnVisibility;
    if (
      JSON.stringify(visibility) !==
      JSON.stringify(preferences.columnVisibility)
    ) {
      updatePreference("columnVisibility", visibility);
    }
  }, [state.columnVisibility]);

  // Save column order
  React.useEffect(() => {
    const order = state.columnOrder;
    if (JSON.stringify(order) !== JSON.stringify(preferences.columnOrder)) {
      updatePreference("columnOrder", order);
    }
  }, [state.columnOrder]);

  // Save column sizing
  React.useEffect(() => {
    const sizing = state.columnSizing;
    if (JSON.stringify(sizing) !== JSON.stringify(preferences.columnSizing)) {
      updatePreference("columnSizing", sizing);
    }
  }, [state.columnSizing]);

  // Save column pinning
  React.useEffect(() => {
    const pinning = state.columnPinning;
    if (JSON.stringify(pinning) !== JSON.stringify(preferences.columnPinning)) {
      updatePreference("columnPinning", pinning);
    }
  }, [state.columnPinning]);

  // Save sorting
  React.useEffect(() => {
    const sorting = state.sorting;
    if (JSON.stringify(sorting) !== JSON.stringify(preferences.sorting)) {
      updatePreference("sorting", sorting);
    }
  }, [state.sorting]);

  // Save page size
  React.useEffect(() => {
    const pageSize = state.pagination.pageSize;
    if (pageSize !== preferences.pageSize) {
      updatePreference("pageSize", pageSize);
    }
  }, [state.pagination.pageSize]);
}

export function useKeyboardNavigation(table, options = {}) {
  const {
    enableArrowKeys = true,
    enableTabNavigation = true,
    enablePageKeys = true,
    enableHomeEnd = true,
  } = options;

  const [focusedCell, setFocusedCell] = React.useState({ row: 0, col: 0 });

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      const rows = table.getRowModel().rows;
      const columns = table.getVisibleLeafColumns();

      if (!rows.length || !columns.length) return;

      const maxRow = rows.length - 1;
      const maxCol = columns.length - 1;

      // Arrow key navigation
      if (enableArrowKeys) {
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            setFocusedCell((prev) => ({
              ...prev,
              row: Math.max(0, prev.row - 1),
            }));
            break;
          case "ArrowDown":
            e.preventDefault();
            setFocusedCell((prev) => ({
              ...prev,
              row: Math.min(maxRow, prev.row + 1),
            }));
            break;
          case "ArrowLeft":
            e.preventDefault();
            setFocusedCell((prev) => ({
              ...prev,
              col: Math.max(0, prev.col - 1),
            }));
            break;
          case "ArrowRight":
            e.preventDefault();
            setFocusedCell((prev) => ({
              ...prev,
              col: Math.min(maxCol, prev.col + 1),
            }));
            break;
        }
      }

      // Tab navigation
      if (enableTabNavigation && e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+Tab - previous cell
          setFocusedCell((prev) => {
            if (prev.col > 0) {
              return { ...prev, col: prev.col - 1 };
            } else if (prev.row > 0) {
              return { row: prev.row - 1, col: maxCol };
            }
            return prev;
          });
        } else {
          // Tab - next cell
          setFocusedCell((prev) => {
            if (prev.col < maxCol) {
              return { ...prev, col: prev.col + 1 };
            } else if (prev.row < maxRow) {
              return { row: prev.row + 1, col: 0 };
            }
            return prev;
          });
        }
      }

      // Page Up/Down
      if (enablePageKeys) {
        const pageSize = table.getState().pagination.pageSize;
        if (e.key === "PageUp") {
          e.preventDefault();
          setFocusedCell((prev) => ({
            ...prev,
            row: Math.max(0, prev.row - pageSize),
          }));
        } else if (e.key === "PageDown") {
          e.preventDefault();
          setFocusedCell((prev) => ({
            ...prev,
            row: Math.min(maxRow, prev.row + pageSize),
          }));
        }
      }

      // Home/End
      if (enableHomeEnd) {
        if (e.key === "Home") {
          e.preventDefault();
          if (e.ctrlKey) {
            setFocusedCell({ row: 0, col: 0 });
          } else {
            setFocusedCell((prev) => ({ ...prev, col: 0 }));
          }
        } else if (e.key === "End") {
          e.preventDefault();
          if (e.ctrlKey) {
            setFocusedCell({ row: maxRow, col: maxCol });
          } else {
            setFocusedCell((prev) => ({ ...prev, col: maxCol }));
          }
        }
      }

      // Enter - toggle row selection
      if (e.key === "Enter") {
        e.preventDefault();
        const row = rows[focusedCell.row];
        if (row) {
          row.toggleSelected();
        }
      }

      // Space - toggle row expansion if available
      if (e.key === " ") {
        e.preventDefault();
        const row = rows[focusedCell.row];
        if (row && row.getCanExpand) {
          row.toggleExpanded();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    table,
    focusedCell,
    enableArrowKeys,
    enableTabNavigation,
    enablePageKeys,
    enableHomeEnd,
  ]);

  // Focus the cell
  React.useEffect(() => {
    const cell = document.querySelector(
      `[data-row-index="${focusedCell.row}"][data-col-index="${focusedCell.col}"]`
    );
    if (cell) {
      cell.focus();
      cell.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [focusedCell]);

  return {
    focusedCell,
    setFocusedCell,
    getCellProps: (rowIndex, colIndex) => ({
      "data-row-index": rowIndex,
      "data-col-index": colIndex,
      tabIndex:
        rowIndex === focusedCell.row && colIndex === focusedCell.col ? 0 : -1,
      className:
        rowIndex === focusedCell.row && colIndex === focusedCell.col
          ? "ring-2 ring-blue-500 ring-inset"
          : "",
    }),
  };
}

// Accessibility helper
export function getAccessibilityProps(table, row, cell) {
  const rowIndex = row.index;
  const columnIndex = cell.column.getIndex();
  const isSelected = row.getIsSelected();

  return {
    role: "gridcell",
    "aria-rowindex": rowIndex + 2, // +2 for header row and 1-indexed
    "aria-colindex": columnIndex + 1,
    "aria-selected": isSelected ? "true" : "false",
    "aria-label": `${cell.column.id}: ${cell.getValue()}`,
  };
}

// CSV Export
export function exportToCSV(data, columns, filename = "export.csv") {
  const headers = columns.map((col) =>
    typeof col.header === "string" ? col.header : col.id
  );

  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      columns
        .map((col) => {
          const value = row[col.id];
          // Escape commas and quotes
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ].join("\n");

  downloadFile(csvContent, filename, "text/csv");
}

// Excel Export (using CSV format with .xlsx extension for simplicity)
export function exportToExcel(data, columns, filename = "export.xlsx") {
  // For true Excel, you'd use a library like xlsx
  // This is a simplified version using CSV
  const headers = columns.map((col) =>
    typeof col.header === "string" ? col.header : col.id
  );

  let content = "<table>";
  content += "<thead><tr>";
  headers.forEach((h) => {
    content += `<th>${h}</th>`;
  });
  content += "</tr></thead><tbody>";

  data.forEach((row) => {
    content += "<tr>";
    columns.forEach((col) => {
      content += `<td>${row[col.id] || ""}</td>`;
    });
    content += "</tr>";
  });

  content += "</tbody></table>";

  downloadFile(content, filename, "application/vnd.ms-excel");
}

// JSON Export
export function exportToJSON(data, columns, filename = "export.json") {
  const exportData = data.map((row) => {
    const obj = {};
    columns.forEach((col) => {
      obj[col.id] = row[col.id];
    });
    return obj;
  });

  const jsonContent = JSON.stringify(exportData, null, 2);
  downloadFile(jsonContent, filename, "application/json");
}

// Download helper
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Export handler hook
export function useExport() {
  const handleExport = React.useCallback((format, data, columns) => {
    const timestamp = new Date().toISOString().split("T")[0];

    switch (format) {
      case "csv":
        exportToCSV(data, columns, `export-${timestamp}.csv`);
        break;
      case "excel":
        exportToExcel(data, columns, `export-${timestamp}.xlsx`);
        break;
      case "json":
        exportToJSON(data, columns, `export-${timestamp}.json`);
        break;
      default:
        console.error("Unknown export format:", format);
    }
  }, []);

  return handleExport;
}

export default {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  useExport,
  useKeyboardNavigation,
  getAccessibilityProps,
  useTablePreferences,
  useAutoSaveTableState,
};
