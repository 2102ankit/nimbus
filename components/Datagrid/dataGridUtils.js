export const exportToCSV = (table, dataRows, dataColumns) => {
  const columns = dataColumns || table.getVisibleLeafColumns().filter(c => c.id !== 'select' && c.id !== 'expand');
  const rows = dataRows || table.getRowModel().rows;

  const headers = columns
    .map((c) => {
      const header = c.header || c.columnDef?.header;
      return typeof header === "string" ? header : c.id;
    })
    .join(",");

  const csvRows = rows
    .map((row) =>
      columns
        .map((c) => {
          const val = row.getValue ? row.getValue(c.id) : row[c.id];
          return `"${String(val || "").replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\n");

  const csv = `${headers}\n${csvRows}`;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToJSON = (table, dataRows, dataColumns) => {
  const columns = dataColumns || table.getVisibleLeafColumns().filter(c => c.id !== 'select' && c.id !== 'expand');
  const rows = dataRows || table.getRowModel().rows;

  const exportData = rows.map((row) => {
    const obj = {};
    columns.forEach((c) => {
      const val = row.getValue ? row.getValue(c.id) : row[c.id];
      obj[c.id] = val;
    });
    return obj;
  });

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToExcel = (table, dataRows, dataColumns) => {
  const columns = dataColumns || table.getVisibleLeafColumns().filter(c => c.id !== 'select' && c.id !== 'expand');
  const rows = dataRows || table.getRowModel().rows;

  let html = "<table><thead><tr>";
  columns.forEach((c) => {
    const header = c.header || c.columnDef?.header;
    html += `<th>${typeof header === "string" ? header : c.id}</th>`;
  });
  html += "</tr></thead><tbody>";
  rows.forEach((row) => {
    html += "<tr>";
    columns.forEach((c) => {
      const val = row.getValue ? row.getValue(c.id) : row[c.id];
      html += `<td>${val || ""}</td>`;
    });
    html += "</tr>";
  });
  html += "</tbody></table>";

  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export-${Date.now()}.xls`;
  a.click();
  URL.revokeObjectURL(url);
};

// ============ PREFERENCES MANAGEMENT (Async) ============
// Use in-memory cache with async localStorage operations
let prefsCache = null;
let saveTimeout = null;

export const loadPreferences = () => {
  if (prefsCache) return prefsCache;

  try {
    const stored = localStorage.getItem("datagrid-prefs-v3");
    prefsCache = stored
      ? JSON.parse(stored)
      : {
        columnVisibility: {},
        columnOrder: [],
        columnSizing: {},
        columnPinning: { left: [], right: [] },
        rowPinning: { top: [], bottom: [] },
        sorting: [],
        pageIndex: 0,
        columnFilters: [],
        pageSize: 20,
      };
  } catch {
    prefsCache = {
      columnVisibility: {},
      columnOrder: [],
      columnSizing: {},
      columnPinning: { left: [], right: [] },
      rowPinning: { top: [], bottom: [] },
      sorting: [],
      pageIndex: 0,
      columnFilters: [],
      pageSize: 20,
    };
  }
  return prefsCache;
};

// Debounced async save to avoid blocking
export const savePreferences = (prefs) => {
  prefsCache = prefs;

  // Clear existing timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // Debounce save operation
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem("datagrid-prefs-v3", JSON.stringify(prefs));
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  }, 100); // Save after 100ms of inactivity
};

export const resetPreferences = () => {
  prefsCache = null;
  try {
    localStorage.removeItem("datagrid-prefs-v3");
  } catch (error) {
    console.error("Failed to reset preferences:", error);
  }
};

// ============ COLUMN POSITION CALCULATIONS (Memoizable) ============
export const getLeftPosition = (column, table) => {
  const leftPinnedColumns = table.getState().columnPinning.left || [];
  const index = leftPinnedColumns.indexOf(column.id);
  if (index === -1) return 0;

  let left = 0;
  for (let i = 0; i < index; i++) {
    const col = table
      .getAllLeafColumns()
      .find((c) => c.id === leftPinnedColumns[i]);
    if (col) {
      left += col.getSize();
    }
  }
  return left;
};

export const getRightPosition = (column, table) => {
  const rightPinnedColumns = table.getState().columnPinning.right || [];
  const index = rightPinnedColumns.indexOf(column.id);
  if (index === -1) return 0;

  let right = 0;
  for (let i = index + 1; i < rightPinnedColumns.length; i++) {
    const col = table
      .getAllLeafColumns()
      .find((c) => c.id === rightPinnedColumns[i]);
    if (col) {
      right += col.getSize();
    }
  }
  return right;
};

// ============ CUSTOM FILTER FUNCTION ============
export const advancedFilterFn = (row, columnId, filterValue) => {
  if (!filterValue || !filterValue.operator || !filterValue.dataType)
    return true;

  const cellValue = row.getValue(columnId);
  const { operator, value, dataType } = filterValue;

  const filterFunctions = {
    text: {
      contains: (v, fv) => {
        if (!fv) return true;
        return String(v || "")
          .toLowerCase()
          .includes(String(fv).toLowerCase());
      },
      notContains: (v, fv) => {
        if (!fv) return true;
        return !String(v || "")
          .toLowerCase()
          .includes(String(fv).toLowerCase());
      },
      equals: (v, fv) => {
        if (!fv) return true;
        return String(v || "").toLowerCase() === String(fv).toLowerCase();
      },
      notEquals: (v, fv) => {
        if (!fv) return true;
        return String(v || "").toLowerCase() !== String(fv).toLowerCase();
      },
      startsWith: (v, fv) => {
        if (!fv) return true;
        return String(v || "")
          .toLowerCase()
          .startsWith(String(fv).toLowerCase());
      },
      endsWith: (v, fv) => {
        if (!fv) return true;
        return String(v || "")
          .toLowerCase()
          .endsWith(String(fv).toLowerCase());
      },
      isEmpty: (v) => v === null || v === undefined || String(v).trim() === "" || v === "-",
      isNotEmpty: (v) => v !== null && v !== undefined && String(v).trim() !== "" && v !== "-",
    },
    number: {
      equals: (v, fv) => {
        if (fv === "" || fv === null || fv === undefined) return true;
        return Number(v) === Number(fv);
      },
      notEquals: (v, fv) => {
        if (fv === "" || fv === null || fv === undefined) return true;
        return Number(v) !== Number(fv);
      },
      greaterThan: (v, fv) => {
        if (fv === "" || fv === null || fv === undefined) return true;
        return Number(v) > Number(fv);
      },
      greaterThanOrEqual: (v, fv) => {
        if (fv === "" || fv === null || fv === undefined) return true;
        return Number(v) >= Number(fv);
      },
      lessThan: (v, fv) => {
        if (fv === "" || fv === null || fv === undefined) return true;
        return Number(v) < Number(fv);
      },
      lessThanOrEqual: (v, fv) => {
        if (fv === "" || fv === null || fv === undefined) return true;
        return Number(v) <= Number(fv);
      },
      between: (v, fv) => {
        if (!fv || (!fv.min && !fv.max)) return true;
        const num = Number(v);
        const min = fv.min ? Number(fv.min) : -Infinity;
        const max = fv.max ? Number(fv.max) : Infinity;
        return num >= min && num <= max;
      },
      isEmpty: (v) => v === null || v === undefined || String(v).trim() === "" || v === "-",
      isNotEmpty: (v) => v !== null && v !== undefined && String(v).trim() !== "" && v !== "-",
    },
    date: {
      equals: (v, fv) => {
        if (!fv) return true;
        return new Date(v).toDateString() === new Date(fv).toDateString();
      },
      notEquals: (v, fv) => {
        if (!fv) return true;
        return new Date(v).toDateString() !== new Date(fv).toDateString();
      },
      before: (v, fv) => {
        if (!fv) return true;
        return new Date(v) < new Date(fv);
      },
      after: (v, fv) => {
        if (!fv) return true;
        return new Date(v) > new Date(fv);
      },
      between: (v, fv) => {
        if (!fv || (!fv.from && !fv.to)) return true;
        const date = new Date(v);
        const from = fv.from ? new Date(fv.from) : new Date(-8640000000000000);
        const to = fv.to ? new Date(fv.to) : new Date(8640000000000000);
        return date >= from && date <= to;
      },
      isEmpty: (v) => !v,
      isNotEmpty: (v) => !!v,
    },
    boolean: {
      isTrue: (v) => {
        if (typeof v === 'boolean') return v === true;
        if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1' || v.toLowerCase() === 'yes';
        return !!v;
      },
      isFalse: (v) => {
        if (typeof v === 'boolean') return v === false;
        if (typeof v === 'string') return v.toLowerCase() === 'false' || v === '0' || v.toLowerCase() === 'no';
        return !v;
      },
      isEmpty: (v) => v === null || v === undefined || v === "",
      isNotEmpty: (v) => v !== null && v !== undefined && v !== "",
    },
  };

  const filterFn = filterFunctions[dataType]?.[operator];
  if (!filterFn) return true;

  return filterFn(cellValue, value);
};