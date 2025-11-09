import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileDown,
  FileJson,
  FileSpreadsheet,
  Filter,
  Info,
  Layers,
  Loader2,
  Moon,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Redo2,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  Sun,
  Table2,
  Trash,
  Undo2,
  X
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ============ THEME CONTEXT ============
const ThemeContext = createContext();

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [density, setDensity] = useState("normal"); // compact, normal, comfortable
  const [stripedRows, setStripedRows] = useState(false);

  const toggleDark = () => setIsDark(!isDark);
  const toggleStripes = () => setStripedRows(!stripedRows);

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleDark,
        density,
        setDensity,
        stripedRows,
        toggleStripes,
      }}
    >
      <div className={isDark ? "dark" : ""}>{children}</div>
    </ThemeContext.Provider>
  );
};

// ============ EDIT HISTORY ============
const useEditHistory = () => {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const addEdit = (edit) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(edit);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      return history[currentIndex - 1];
    }
    return null;
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return history[currentIndex + 1];
    }
    return null;
  };

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return { addEdit, undo, redo, canUndo, canRedo, history };
};

// ============ UI COMPONENTS ============
const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  disabled,
  ...props
}) => {
  const { isDark } = useTheme();
  const variants = {
    default: isDark
      ? "bg-slate-700 text-slate-50 hover:bg-slate-600"
      : "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
    outline: isDark
      ? "border border-slate-600 bg-slate-800 hover:bg-slate-700"
      : "border border-slate-200 bg-white hover:bg-slate-100",
    ghost: isDark ? "hover:bg-slate-800" : "hover:bg-slate-100",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    icon: "h-8 w-8",
  };
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = forwardRef(({ className = "", type = "text", ...props }, ref) => {
  const { isDark } = useTheme();
  return (
    <input
      ref={ref}
      type={type}
      className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 ${
        isDark
          ? "border-slate-600 bg-slate-800 text-slate-100 focus-visible:ring-slate-500"
          : "border-slate-200 bg-white focus-visible:ring-slate-950"
      } ${className}`}
      {...props}
    />
  );
});

const Checkbox = ({ checked, onCheckedChange, indeterminate, ...props }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-950"
      {...props}
    />
  );
};

const Dropdown = ({ children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      {Children.map(children, (child) =>
        cloneElement(child, { open, setOpen })
      )}
    </div>
  );
};

const DropdownTrigger = ({ children, open, setOpen }) =>
  cloneElement(children, {
    onClick: (e) => {
      e.stopPropagation();
      setOpen(!open);
    },
  });
const DropdownContent = ({ children, open, align = "end" }) => {
  const { isDark } = useTheme();
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute ${
        align === "end" ? "right-0" : "left-0"
      } z-50 mt-2 min-w-[200px] max-h-96 overflow-auto rounded-md border p-2 shadow-lg ${
        isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      }`}
    >
      {children}
    </motion.div>
  );
};
const DropdownItem = ({ children, onClick, className = "" }) => {
  const { isDark } = useTheme();
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm ${
        isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"
      } ${className}`}
    >
      {children}
    </div>
  );
};
const DropdownSeparator = () => {
  const { isDark } = useTheme();
  return (
    <div className={`my-1 h-px ${isDark ? "bg-slate-700" : "bg-slate-100"}`} />
  );
};

// ============ CELL EDITORS ============
const TextEditor = ({ value, onChange, onComplete }) => {
  const [val, setVal] = useState(value);
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onChange(val);
      onComplete();
    } else if (e.key === "Escape") {
      onComplete();
    }
  };

  return (
    <Input
      ref={ref}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => {
        onChange(val);
        onComplete();
      }}
      className="h-8"
    />
  );
};

const NumberEditor = ({ value, onChange, onComplete }) => {
  const [val, setVal] = useState(value);
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onChange(Number(val));
      onComplete();
    } else if (e.key === "Escape") {
      onComplete();
    }
  };

  return (
    <Input
      ref={ref}
      type="number"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => {
        onChange(Number(val));
        onComplete();
      }}
      className="h-8"
    />
  );
};

const SelectEditor = ({ value, options, onChange, onComplete }) => {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleChange = (e) => {
    onChange(e.target.value);
    onComplete();
  };

  return (
    <select
      ref={ref}
      value={value}
      onChange={handleChange}
      onBlur={onComplete}
      className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
};

const DateEditor = ({ value, onChange, onComplete }) => {
  const [val, setVal] = useState(value);
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onChange(val);
      onComplete();
    } else if (e.key === "Escape") {
      onComplete();
    }
  };

  return (
    <Input
      ref={ref}
      type="date"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => {
        onChange(val);
        onComplete();
      }}
      className="h-8"
    />
  );
};

// ============ EDITABLE CELL ============
const EditableCell = ({
  value,
  row,
  column,
  updateData,
  editorType = "text",
  options = [],
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [cellValue, setCellValue] = useState(value);

  const handleComplete = () => setIsEditing(false);

  const handleChange = (newValue) => {
    setCellValue(newValue);
    updateData(row.index, column.id, newValue);
  };

  if (isEditing) {
    switch (editorType) {
      case "number":
        return (
          <NumberEditor
            value={cellValue}
            onChange={handleChange}
            onComplete={handleComplete}
          />
        );
      case "select":
        return (
          <SelectEditor
            value={cellValue}
            options={options}
            onChange={handleChange}
            onComplete={handleComplete}
          />
        );
      case "date":
        return (
          <DateEditor
            value={cellValue}
            onChange={handleChange}
            onComplete={handleComplete}
          />
        );
      default:
        return (
          <TextEditor
            value={cellValue}
            onChange={handleChange}
            onComplete={handleComplete}
          />
        );
    }
  }

  return (
    <div
      className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
      onDoubleClick={() => setIsEditing(true)}
      title="Double-click to edit"
    >
      {cellValue}
    </div>
  );
};

// ============ EXPORT FUNCTIONS ============
const exportToCSV = (data, columns) => {
  const headers = columns.map((c) => c.id).join(",");
  const rows = data
    .map((row) => columns.map((c) => `"${row[c.id] || ""}"`).join(","))
    .join("\n");
  const csv = `${headers}\n${rows}`;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportToJSON = (data, columns) => {
  const exportData = data.map((row) => {
    const obj = {};
    columns.forEach((c) => {
      obj[c.id] = row[c.id];
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

const exportToExcel = (data, columns) => {
  let html = "<table><thead><tr>";
  columns.forEach((c) => {
    html += `<th>${c.id}</th>`;
  });
  html += "</tr></thead><tbody>";
  data.forEach((row) => {
    html += "<tr>";
    columns.forEach((c) => {
      html += `<td>${row[c.id] || ""}</td>`;
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

// ============ ENHANCED TOOLBAR ============
const EnhancedToolbar = ({
  table,
  columns,
  onExport,
  onResetPreferences,
  onRefresh,
  globalFilter,
  onGlobalFilterChange,
  editHistory,
}) => {
  const {
    isDark,
    toggleDark,
    density,
    setDensity,
    stripedRows,
    toggleStripes,
  } = useTheme();
  const [filterColumn, setFilterColumn] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  const filterableColumns = columns.filter(
    (c) => c.enableColumnFilter !== false
  );
  const hasFilters = table.getState().columnFilters.length > 0 || globalFilter;

  const handleGlobalSearch = (value) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => onGlobalFilterChange(value), 300);
    setSearchTimeout(timeout);
  };

  const clearFilters = () => {
    table.resetColumnFilters();
    onGlobalFilterChange("");
    setFilterValue("");
    setFilterColumn("");
  };

  const exportData = (format) => {
    const rows = table.getFilteredRowModel().rows.map((r) => r.original);
    const cols = table
      .getVisibleLeafColumns()
      .filter((c) => !["select", "actions", "rowNum"].includes(c.id));
    onExport(format, rows, cols);
  };

  return (
    <div
      className={`flex flex-col gap-4 p-4 border-b ${
        isDark
          ? "bg-slate-800 border-slate-700"
          : "bg-slate-50/50 border-slate-200"
      }`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search all columns..."
            defaultValue={globalFilter ?? ""}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          title="Refresh Data"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" /> Clear
          </Button>
        )}

        <Dropdown>
          <DropdownTrigger>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </DropdownTrigger>
          <DropdownContent>
            <DropdownItem onClick={() => exportData("csv")}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> CSV
            </DropdownItem>
            <DropdownItem onClick={() => exportData("excel")}>
              <FileDown className="h-4 w-4 mr-2" /> Excel
            </DropdownItem>
            <DropdownItem onClick={() => exportData("json")}>
              <FileJson className="h-4 w-4 mr-2" /> JSON
            </DropdownItem>
          </DropdownContent>
        </Dropdown>

        <Dropdown>
          <DropdownTrigger>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" /> View
            </Button>
          </DropdownTrigger>
          <DropdownContent>
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">
              DENSITY
            </div>
            {["compact", "normal", "comfortable"].map((d) => (
              <DropdownItem key={d} onClick={() => setDensity(d)}>
                {density === d && <Check className="h-3 w-3 mr-2" />}
                <span className={density !== d ? "ml-5" : ""}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </span>
              </DropdownItem>
            ))}
            <DropdownSeparator />
            <DropdownItem onClick={toggleStripes}>
              {stripedRows && <Check className="h-3 w-3 mr-2" />}
              <span className={!stripedRows ? "ml-5" : ""}>Striped Rows</span>
            </DropdownItem>
            <DropdownItem onClick={toggleDark}>
              {isDark ? (
                <Sun className="h-4 w-4 mr-2" />
              ) : (
                <Moon className="h-4 w-4 mr-2" />
              )}
              {isDark ? "Light Mode" : "Dark Mode"}
            </DropdownItem>
          </DropdownContent>
        </Dropdown>

        <Dropdown>
          <DropdownTrigger>
            <Button variant="outline" size="sm">
              <Table2 className="h-4 w-4 mr-2" /> Columns
            </Button>
          </DropdownTrigger>
          <DropdownContent>
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">
              VISIBILITY & PINNING
            </div>
            {table
              .getAllColumns()
              .filter((c) => c.getCanHide())
              .map((col) => (
                <div
                  key={col.id}
                  className="flex items-center justify-between px-2 py-2 hover:bg-slate-100 rounded"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={col.getIsVisible()}
                      onChange={() => col.toggleVisibility()}
                      className="h-4 w-4"
                    />
                    <span className="capitalize text-sm">{col.id}</span>
                  </label>
                  {col.getCanPin() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        col.pin(col.getIsPinned() ? false : "left");
                      }}
                      className={`p-1 rounded hover:bg-slate-200 ${
                        col.getIsPinned() ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      {col.getIsPinned() ? (
                        <Pin className="h-3 w-3" />
                      ) : (
                        <PinOff className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            <DropdownSeparator />
            <DropdownItem onClick={onResetPreferences}>
              <RotateCcw className="h-4 w-4 mr-2" /> Reset Preferences
            </DropdownItem>
          </DropdownContent>
        </Dropdown>

        <Dropdown>
          <DropdownTrigger>
            <Button variant="outline" size="sm">
              <Layers className="h-4 w-4 mr-2" /> Group{" "}
              {table.getState().grouping.length > 0 &&
                `(${table.getState().grouping.length})`}
            </Button>
          </DropdownTrigger>
          <DropdownContent>
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">
              GROUP BY
            </div>
            {columns
              .filter(
                (c) =>
                  c.enableGrouping !== false &&
                  !["select", "actions", "rowNum", "id"].includes(c.id)
              )
              .map((col) => {
                const isGrouped = table.getState().grouping.includes(col.id);
                return (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 px-2 py-2 hover:bg-slate-100 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isGrouped}
                      onChange={() => {
                        const grouping = table.getState().grouping;
                        table.setGrouping(
                          isGrouped
                            ? grouping.filter((g) => g !== col.id)
                            : [...grouping, col.id]
                        );
                      }}
                      className="h-4 w-4"
                    />
                    <span className="capitalize text-sm">{col.id}</span>
                  </label>
                );
              })}
            {table.getState().grouping.length > 0 && (
              <>
                <DropdownSeparator />
                <DropdownItem
                  onClick={() => table.setGrouping([])}
                  className="text-red-600"
                >
                  Clear grouping
                </DropdownItem>
              </>
            )}
          </DropdownContent>
        </Dropdown>

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={editHistory.undo}
            disabled={!editHistory.canUndo}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={editHistory.redo}
            disabled={!editHistory.canRedo}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-slate-400" />
        <select
          value={filterColumn}
          onChange={(e) => {
            setFilterColumn(e.target.value);
            setFilterValue("");
          }}
          className={`h-9 rounded-md border px-3 py-1 text-sm ${
            isDark
              ? "border-slate-600 bg-slate-800"
              : "border-slate-200 bg-white"
          }`}
        >
          <option value="">Add filter...</option>
          {filterableColumns.map((col) => (
            <option key={col.id} value={col.id}>
              {col.header}
            </option>
          ))}
        </select>
        {filterColumn &&
          (filterableColumns.find((c) => c.id === filterColumn)
            ?.filterVariant === "select" ? (
            <select
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
                table.getColumn(filterColumn)?.setFilterValue(e.target.value);
              }}
              className={`h-9 rounded-md border px-3 py-1 text-sm ${
                isDark
                  ? "border-slate-600 bg-slate-800"
                  : "border-slate-200 bg-white"
              }`}
            >
              <option value="">All</option>
              {filterableColumns
                .find((c) => c.id === filterColumn)
                ?.filterOptions?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
            </select>
          ) : filterableColumns.find((c) => c.id === filterColumn)
              ?.filterVariant === "range" ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                onChange={(e) => {
                  const val = { ...(filterValue || {}), min: e.target.value };
                  setFilterValue(val);
                  if (searchTimeout) clearTimeout(searchTimeout);
                  const timeout = setTimeout(
                    () => table.getColumn(filterColumn)?.setFilterValue(val),
                    300
                  );
                  setSearchTimeout(timeout);
                }}
                className="w-24 h-9"
              />
              <span className="text-slate-400">to</span>
              <Input
                type="number"
                placeholder="Max"
                onChange={(e) => {
                  const val = { ...(filterValue || {}), max: e.target.value };
                  setFilterValue(val);
                  if (searchTimeout) clearTimeout(searchTimeout);
                  const timeout = setTimeout(
                    () => table.getColumn(filterColumn)?.setFilterValue(val),
                    300
                  );
                  setSearchTimeout(timeout);
                }}
                className="w-24 h-9"
              />
            </div>
          ) : (
            <Input
              placeholder={`Filter ${filterColumn}...`}
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
                if (searchTimeout) clearTimeout(searchTimeout);
                const timeout = setTimeout(
                  () =>
                    table
                      .getColumn(filterColumn)
                      ?.setFilterValue(e.target.value),
                  300
                );
                setSearchTimeout(timeout);
              }}
              className="max-w-xs h-9"
            />
          ))}
      </div>

      {table.getState().columnFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-500 font-medium">Active:</span>
          {table.getState().columnFilters.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
            >
              <span className="font-semibold">{f.id}:</span>
              <span>
                {typeof f.value === "object"
                  ? `${f.value.min || "∞"}-${f.value.max || "∞"}`
                  : f.value}
              </span>
              <button
                onClick={() => table.getColumn(f.id)?.setFilterValue(undefined)}
                className="ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ COLUMN HEADER ============
const ColumnHeader = ({ header, title, table }) => {
  const { isDark } = useTheme();
  const column = header.column;
  if (!column.getCanSort())
    return <div className="flex items-center gap-2">{title}</div>;
  const isSorted = column.getIsSorted();
  const SortIcon =
    isSorted === "asc"
      ? ArrowUp
      : isSorted === "desc"
      ? ArrowDown
      : ArrowUpDown;

  return (
    <div className="flex items-center relative">
      <Dropdown>
        <DropdownTrigger>
          <Button variant="ghost" size="sm" className="-ml-3">
            {title}
            <motion.div
              animate={{ rotate: isSorted === "desc" ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <SortIcon className="ml-2 h-4 w-4" />
            </motion.div>
          </Button>
        </DropdownTrigger>
        <DropdownContent align="start">
          <DropdownItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="mr-2 h-3.5 w-3.5" /> Asc
          </DropdownItem>
          <DropdownItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="mr-2 h-3.5 w-3.5" /> Desc
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="mr-2 h-3.5 w-3.5" /> Hide
          </DropdownItem>
          <DropdownItem
            onClick={() => column.pin(column.getIsPinned() ? false : "left")}
          >
            {column.getIsPinned() ? (
              <PinOff className="mr-2 h-3.5 w-3.5" />
            ) : (
              <Pin className="mr-2 h-3.5 w-3.5" />
            )}
            {column.getIsPinned() ? "Unpin" : "Pin Left"}
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
      {header.column.getCanResize() && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none ${
            isDark ? "hover:bg-blue-400" : "hover:bg-blue-500"
          }`}
        />
      )}
    </div>
  );
};

// ============ ROW ACTIONS ============
const RowActions = ({ row }) => (
  <Dropdown>
    <DropdownTrigger>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownTrigger>
    <DropdownContent>
      <div className="px-2 py-1.5 text-sm font-semibold">Actions</div>
      <DropdownItem
        onClick={() => navigator.clipboard.writeText(row.original.id)}
      >
        <Copy className="mr-2 h-4 w-4" /> Copy ID
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem onClick={() => console.log("Edit:", row.original)}>
        <Pencil className="mr-2 h-4 w-4" /> Edit
      </DropdownItem>
      <DropdownItem onClick={() => console.log("Duplicate:", row.original)}>
        <Copy className="mr-2 h-4 w-4" /> Duplicate
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem
        onClick={() => console.log("Delete:", row.original)}
        className="text-red-600"
      >
        <Trash className="mr-2 h-4 w-4" /> Delete
      </DropdownItem>
    </DropdownContent>
  </Dropdown>
);

// ============ PAGINATION ============
const Pagination = ({ table }) => {
  const { isDark } = useTheme();
  const { pageSize, pageIndex } = table.getState().pagination;
  return (
    <div
      className={`flex items-center justify-between px-4 py-4 border-t ${
        isDark ? "border-slate-700" : "border-slate-200"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} selected
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Rows:
          </span>
          <select
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className={`h-8 rounded-md border px-2 py-1 text-sm ${
              isDark
                ? "border-slate-600 bg-slate-800"
                : "border-slate-200 bg-white"
            }`}
          >
            {[10, 20, 30, 50, 100].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`text-sm mr-4 ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Page {pageIndex + 1} of {table.getPageCount()}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// ============ RANGE FILTER FUNCTION ============
const rangeFilterFn = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  const numValue = Number(value);
  if (isNaN(numValue)) return true;

  const min = filterValue?.min ? Number(filterValue.min) : -Infinity;
  const max = filterValue?.max ? Number(filterValue.max) : Infinity;

  return numValue >= min && numValue <= max;
};

// ============ DATA GENERATOR ============
const generateData = () => {
  const statuses = ["Active", "Inactive", "Pending", "Suspended"];
  const roles = ["Admin", "User", "Manager", "Guest"];
  const depts = ["Engineering", "Sales", "Marketing", "Support", "HR"];
  const first = [
    "John",
    "Jane",
    "Alice",
    "Bob",
    "Charlie",
    "Diana",
    "Eve",
    "Frank",
    "Grace",
    "Henry",
  ];
  const last = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Martinez",
    "Lopez",
  ];

  return Array.from({ length: 100 }, (_, i) => ({
    id: `usr_${String(i + 1).padStart(5, "0")}`,
    name: `${first[Math.floor(Math.random() * first.length)]} ${
      last[Math.floor(Math.random() * last.length)]
    }`,
    email: `user${i + 1}@example.com`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    department: depts[Math.floor(Math.random() * depts.length)],
    salary: Math.floor(Math.random() * 100000) + 40000,
    joinDate: new Date(
      2020 + Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28)
    )
      .toISOString()
      .split("T")[0],
    performance: Math.floor(Math.random() * 100),
    // subRows:
    //   Math.random() > 0.7
    //     ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
    //         id: `usr_${String(i + 1).padStart(5, "0")}_${j}`,
    //         name: `Sub ${first[Math.floor(Math.random() * first.length)]}`,
    //         email: `sub${i + 1}_${j}@example.com`,
    //         status: statuses[Math.floor(Math.random() * statuses.length)],
    //         role: roles[Math.floor(Math.random() * roles.length)],
    //         department: depts[Math.floor(Math.random() * depts.length)],
    //         salary: Math.floor(Math.random() * 50000) + 30000,
    //         joinDate: new Date(
    //           2021 + Math.floor(Math.random() * 4),
    //           Math.floor(Math.random() * 12),
    //           Math.floor(Math.random() * 28)
    //         )
    //           .toISOString()
    //           .split("T")[0],
    //         performance: Math.floor(Math.random() * 100),
    //       }))
    //     : undefined,
  }));
};

// ============ MAIN COMPONENT ============
function CompleteDataGrid() {
  const { isDark, density, stripedRows } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const editHistory = useEditHistory();

  // Load preferences
  const loadPrefs = () => {
    try {
      const stored = localStorage.getItem("datagrid-prefs");
      return stored
        ? JSON.parse(stored)
        : {
            columnVisibility: {},
            columnOrder: [],
            columnSizing: {},
            columnPinning: { left: [], right: [] },
            sorting: [],
            pageSize: 10,
          };
    } catch {
      return {
        columnVisibility: {},
        columnOrder: [],
        columnSizing: {},
        columnPinning: { left: [], right: [] },
        sorting: [],
        pageSize: 10,
      };
    }
  };

  const [prefs, setPrefs] = useState(loadPrefs);

  const savePrefs = (newPrefs) => {
    const merged = { ...prefs, ...newPrefs };
    localStorage.setItem("datagrid-prefs", JSON.stringify(merged));
    setPrefs(merged);
  };

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateData());
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateData = (rowIndex, columnId, value) => {
    editHistory.addEdit({
      rowIndex,
      columnId,
      oldValue: data[rowIndex][columnId],
      newValue: value,
    });
    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return { ...old[rowIndex], [columnId]: value };
        }
        return row;
      })
    );
  };

  const columns = useMemo(
    () => [
      {
        id: "rowNum",
        header: "#",
        cell: ({ row }) => (
          <div className="text-slate-500 font-mono text-xs">
            {row.index + 1}
          </div>
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        enableGrouping: false,
        enableColumnFilter: false,
      },
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
          />
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        enableGrouping: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "id",
        id: "id",
        header: "ID",
        cell: ({ row, getValue }) => (
          <div className="flex items-center gap-2">
            {row.getCanExpand() ? (
              <button
                onClick={() => row.toggleExpanded()}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                {row.getIsExpanded() ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <span className="font-mono text-xs">{getValue()}</span>
          </div>
        ),
        enableColumnFilter: true,
        size: 150,
        enableGrouping: false,
      },
      {
        accessorKey: "name",
        id: "name",
        header: "Name",
        cell: ({ row, getValue }) => (
          <EditableCell
            value={getValue()}
            row={row}
            column={{ id: "name" }}
            updateData={updateData}
            editorType="text"
          />
        ),
        enableColumnFilter: true,
        size: 200,
      },
      {
        accessorKey: "email",
        id: "email",
        header: "Email",
        cell: ({ row, getValue }) => (
          <EditableCell
            value={getValue()}
            row={row}
            column={{ id: "email" }}
            updateData={updateData}
            editorType="text"
          />
        ),
        enableColumnFilter: true,
        size: 250,
      },
      {
        accessorKey: "status",
        id: "status",
        header: "Status",
        cell: ({ row, getValue }) => {
          const s = getValue();
          const colors = {
            Active:
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            Inactive:
              "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
            Pending:
              "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
            Suspended:
              "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          };
          return (
            <div
              onDoubleClick={() => {
                const newStatus = [
                  "Active",
                  "Inactive",
                  "Pending",
                  "Suspended",
                ][Math.floor(Math.random() * 4)];
                updateData(row.index, "status", newStatus);
              }}
            >
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colors[s]}`}
              >
                {s}
              </span>
            </div>
          );
        },
        filterVariant: "select",
        filterOptions: ["Active", "Inactive", "Pending", "Suspended"],
        enableGrouping: true,
        enableColumnFilter: true,
        size: 120,
      },
      {
        accessorKey: "role",
        id: "role",
        header: "Role",
        cell: ({ row, getValue }) => (
          <EditableCell
            value={getValue()}
            row={row}
            column={{ id: "role" }}
            updateData={updateData}
            editorType="select"
            options={["Admin", "User", "Manager", "Guest"]}
          />
        ),
        filterVariant: "select",
        filterOptions: ["Admin", "User", "Manager", "Guest"],
        enableGrouping: true,
        enableColumnFilter: true,
        size: 120,
      },
      {
        accessorKey: "department",
        id: "department",
        header: "Department",
        cell: ({ row, getValue }) => (
          <EditableCell
            value={getValue()}
            row={row}
            column={{ id: "department" }}
            updateData={updateData}
            editorType="select"
            options={["Engineering", "Sales", "Marketing", "Support", "HR"]}
          />
        ),
        filterVariant: "select",
        filterOptions: ["Engineering", "Sales", "Marketing", "Support", "HR"],
        enableGrouping: true,
        enableColumnFilter: true,
        size: 150,
      },
      {
        accessorKey: "salary",
        id: "salary",
        header: "Salary",
        cell: ({ row, getValue }) => (
          <EditableCell
            value={getValue()}
            row={row}
            column={{ id: "salary" }}
            updateData={updateData}
            editorType="number"
          />
        ),
        filterVariant: "range",
        enableColumnFilter: true,
        aggregationFn: "sum",
        aggregatedCell: ({ getValue }) => (
          <div className="font-bold text-green-700 dark:text-green-400">
            Total:{" "}
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(getValue())}
          </div>
        ),
        size: 150,
      },
      {
        accessorKey: "performance",
        id: "performance",
        header: "Performance",
        cell: ({ row, getValue }) => {
          const value = getValue();
          return (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-xs font-medium w-10">{value}%</span>
            </div>
          );
        },
        filterVariant: "range",
        enableColumnFilter: true,
        aggregationFn: "mean",
        aggregatedCell: ({ getValue }) => (
          <div className="font-bold text-blue-700 dark:text-blue-400">
            Avg: {Math.round(getValue())}%
          </div>
        ),
        size: 180,
      },
      {
        accessorKey: "joinDate",
        id: "joinDate",
        header: "Join Date",
        cell: ({ row, getValue }) => (
          <EditableCell
            value={getValue()}
            row={row}
            column={{ id: "joinDate" }}
            updateData={updateData}
            editorType="date"
          />
        ),
        enableColumnFilter: true,
        size: 150,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <RowActions row={row} />,
        size: 80,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
      },
    ],
    [updateData]
  );

  const columnsWithHeader = columns.map((col) => ({
    ...col,
    header:
      typeof col.header === "string"
        ? ({ column, table, header }) => (
            <ColumnHeader
              header={header}
              column={column}
              title={col.header}
              table={table}
            />
          )
        : col.header,
  }));

  const [sorting, setSorting] = useState(prefs.sorting);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState(
    prefs.columnVisibility
  );
  const [rowSelection, setRowSelection] = useState({});
  const [columnOrder, setColumnOrder] = useState(prefs.columnOrder);
  const [columnSizing, setColumnSizing] = useState(prefs.columnSizing);
  const [columnPinning, setColumnPinning] = useState(prefs.columnPinning);
  const [expanded, setExpanded] = useState({});
  const [grouping, setGrouping] = useState([]);

  console.log(grouping);

  // Auto-save preferences
  useEffect(() => {
    savePrefs({ sorting });
  }, [sorting]);
  useEffect(() => {
    savePrefs({ columnVisibility });
  }, [columnVisibility]);
  useEffect(() => {
    savePrefs({ columnOrder });
  }, [columnOrder]);
  useEffect(() => {
    savePrefs({ columnSizing });
  }, [columnSizing]);
  useEffect(() => {
    savePrefs({ columnPinning });
  }, [columnPinning]);

  const table = useReactTable({
    data,
    columns: columnsWithHeader,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnOrder,
      columnSizing,
      columnPinning,
      expanded,
      grouping,
    },
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    enableSorting: true,
    enableMultiSort: true,
    enableFilters: true,
    enableGrouping: true,
    enableExpanding: true,
    enablePinning: true,
    getSubRows: (row) => row.subRows,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onColumnPinningChange: setColumnPinning,
    onExpandedChange: setExpanded,
    onGroupingChange: setGrouping,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    filterFns: {
      range: rangeFilterFn,
    },
    globalFilterFn: "includesString",
    initialState: {
      pagination: {
        pageSize: prefs.pageSize,
      },
    },
  });

  // Keyboard navigation
  const [focusedCell, setFocusedCell] = useState({ row: 0, col: 0 });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const rows = table.getRowModel().rows;
      const columns = table.getVisibleLeafColumns();
      if (!rows.length || !columns.length) return;

      const maxRow = rows.length - 1;
      const maxCol = columns.length - 1;

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
        case "Enter":
          e.preventDefault();
          const row = rows[focusedCell.row];
          if (row) row.toggleSelected();
          break;
        case " ":
          e.preventDefault();
          const expandRow = rows[focusedCell.row];
          if (expandRow && expandRow.getCanExpand) expandRow.toggleExpanded();
          break;
        case "Home":
          e.preventDefault();
          if (e.ctrlKey) {
            setFocusedCell({ row: 0, col: 0 });
          } else {
            setFocusedCell((prev) => ({ ...prev, col: 0 }));
          }
          break;
        case "End":
          e.preventDefault();
          if (e.ctrlKey) {
            setFocusedCell({ row: maxRow, col: maxCol });
          } else {
            setFocusedCell((prev) => ({ ...prev, col: maxCol }));
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [table, focusedCell]);

  const handleExport = (format, rows, cols) => {
    switch (format) {
      case "csv":
        exportToCSV(rows, cols);
        break;
      case "excel":
        exportToExcel(rows, cols);
        break;
      case "json":
        exportToJSON(rows, cols);
        break;
    }
  };

  const handleResetPreferences = () => {
    const defaults = {
      columnVisibility: {},
      columnOrder: [],
      columnSizing: {},
      columnPinning: { left: [], right: [] },
      sorting: [],
      pageSize: 10,
    };
    localStorage.removeItem("datagrid-prefs");
    setPrefs(defaults);
    setSorting([]);
    setColumnVisibility({});
    setColumnOrder([]);
    setColumnSizing({});
    setColumnPinning({ left: [], right: [] });
    table.resetColumnVisibility();
    table.resetColumnOrder();
    table.resetColumnSizing();
    table.resetSorting();
    table.setPageSize(10);
  };

  const getDensityClass = () => {
    switch (density) {
      case "compact":
        return "p-2";
      case "comfortable":
        return "p-6";
      default:
        return "p-4";
    }
  };

  const getRowHeightClass = () => {
    switch (density) {
      case "compact":
        return "h-8";
      case "comfortable":
        return "h-16";
      default:
        return "h-12";
    }
  };

  const isEmpty = table.getFilteredRowModel().rows.length === 0;

  return (
    <div
      className={`w-full min-h-screen transition-colors ${
        isDark ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 to-slate-100"
      } p-8`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1
            className={`text-3xl font-bold mb-2 ${
              isDark ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Advanced Enterprise DataGrid
          </h1>
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>
            Complete table with: Cell Editing (Inline), Undo/Redo, Dark Mode,
            Tree Data, Row Numbers, Density Control, Striped Rows, Tooltips,
            Sparklines & All Previous Features
          </p>
        </div>

        <div
          className={`border rounded-lg shadow-lg overflow-hidden ${
            isDark
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-slate-200"
          }`}
        >
          <EnhancedToolbar
            table={table}
            columns={columns}
            onExport={handleExport}
            onResetPreferences={handleResetPreferences}
            onRefresh={loadData}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            editHistory={editHistory}
          />

          <div
            className="relative overflow-auto"
            style={{ maxHeight: "600px" }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2
                  className={`h-8 w-8 animate-spin ${
                    isDark ? "text-slate-400" : "text-slate-400"
                  }`}
                />
                <span
                  className={`ml-2 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Loading data...
                </span>
              </div>
            ) : isEmpty ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div
                  className={`rounded-full p-3 mb-4 ${
                    isDark ? "bg-slate-700" : "bg-slate-100"
                  }`}
                >
                  <Info
                    className={`h-8 w-8 ${
                      isDark ? "text-slate-400" : "text-slate-400"
                    }`}
                  />
                </div>
                <h3
                  className={`text-lg font-semibold mb-1 ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  No results found
                </h3>
                <p
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Try adjusting your filters
                </p>
              </motion.div>
            ) : (
              <table className="w-full text-sm">
                <thead
                  className={`sticky top-0 z-10 ${
                    isDark ? "bg-slate-700" : "bg-slate-100"
                  }`}
                >
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className={`border-b-2 ${
                        isDark ? "border-slate-600" : "border-slate-300"
                      }`}
                    >
                      {headerGroup.headers.map((header) => {
                        const isPinned = header.column.getIsPinned();
                        return (
                          <th
                            key={header.id}
                            className={`text-left align-middle font-medium ${
                              isDark
                                ? "text-slate-300 border-slate-600"
                                : "text-slate-700 border-slate-200"
                            } ${getDensityClass()} border-r last:border-r-0 ${
                              isPinned
                                ? `sticky z-20 ${
                                    isDark ? "bg-slate-700" : "bg-slate-100"
                                  }`
                                : ""
                            } ${isPinned === "left" ? "left-0" : ""} ${
                              isPinned === "right" ? "right-0" : ""
                            }`}
                            style={{
                              width: header.getSize(),
                              position: isPinned ? "sticky" : "relative",
                            }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {table.getRowModel().rows.map((row, idx) => {
                      console.log(row);
                      const isGrouped = row.getIsGrouped();
                      const isStriped = stripedRows && idx % 2 === 1;

                      if (isGrouped) {
                        return (
                          <motion.tr
                            key={row.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`font-semibold border-b ${
                              isDark
                                ? "bg-slate-700 hover:bg-slate-600 border-slate-600"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                            }`}
                          >
                            <td
                              colSpan={row.getVisibleCells().length}
                              className={getDensityClass()}
                            >
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => row.toggleExpanded()}
                                  className={`p-1 rounded ${
                                    isDark
                                      ? "hover:bg-slate-600"
                                      : "hover:bg-slate-200"
                                  }`}
                                >
                                  {row.getIsExpanded() ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRightIcon className="h-4 w-4" />
                                  )}
                                </button>
                                <Layers
                                  className={`h-4 w-4 ${
                                    isDark ? "text-slate-400" : "text-slate-600"
                                  }`}
                                />
                                <span
                                  className={
                                    isDark ? "text-slate-100" : "text-slate-900"
                                  }
                                >
                                  {row.groupingColumnId}:{" "}
                                  <strong>{row.groupingValue}</strong>
                                </span>
                                <span
                                  className={`text-sm ml-2 ${
                                    isDark ? "text-slate-400" : "text-slate-600"
                                  }`}
                                >
                                  ({row.subRows.length}{" "}
                                  {row.subRows.length === 1 ? "item" : "items"})
                                </span>

                                {/* Show aggregations for grouped rows */}
                                <div className="ml-auto flex gap-4 text-xs">
                                  {row.subRows.length > 0 && (
                                    <>
                                      <span
                                        className={
                                          isDark
                                            ? "text-green-400"
                                            : "text-green-700"
                                        }
                                      >
                                        Total Salary:{" "}
                                        <strong>
                                          {new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                          }).format(
                                            row.subRows.reduce(
                                              (sum, r) =>
                                                sum + (r.original.salary || 0),
                                              0
                                            )
                                          )}
                                        </strong>
                                      </span>
                                      <span
                                        className={
                                          isDark
                                            ? "text-blue-400"
                                            : "text-blue-700"
                                        }
                                      >
                                        Avg Performance:{" "}
                                        <strong>
                                          {Math.round(
                                            row.subRows.reduce(
                                              (sum, r) =>
                                                sum +
                                                (r.original.performance || 0),
                                              0
                                            ) / row.subRows.length
                                          )}
                                          %
                                        </strong>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      }

                      return (
                        <Fragment key={row.id}>
                          <motion.tr
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, delay: idx * 0.02 }}
                            className={`border-b transition-colors ${
                              isDark
                                ? `border-slate-700 ${
                                    isStriped ? "bg-slate-800/50" : ""
                                  } hover:bg-slate-700`
                                : `border-slate-200 ${
                                    isStriped ? "bg-slate-50" : ""
                                  } hover:bg-slate-50`
                            } ${
                              row.getIsSelected()
                                ? isDark
                                  ? "bg-blue-900/30"
                                  : "bg-blue-50"
                                : ""
                            }`}
                            style={{ paddingLeft: `${row.depth * 2}rem` }}
                          >
                            {row.getVisibleCells().map((cell, cellIdx) => {
                              const isPinned = cell.column.getIsPinned();
                              const isFocused =
                                focusedCell.row === idx &&
                                focusedCell.col === cellIdx;

                              return (
                                <td
                                  key={cell.id}
                                  className={`align-middle ${getDensityClass()} ${
                                    isDark
                                      ? `border-slate-700 ${
                                          isStriped
                                            ? "bg-slate-800/50"
                                            : "bg-slate-800"
                                        }`
                                      : `border-slate-200 ${
                                          isStriped ? "bg-slate-50" : "bg-white"
                                        }`
                                  } ${isPinned ? `sticky z-10` : ""} ${
                                    isPinned === "left" ? "left-0" : ""
                                  } ${isPinned === "right" ? "right-0" : ""} ${
                                    isFocused
                                      ? "ring-2 ring-blue-500 ring-inset"
                                      : ""
                                  }`}
                                  style={{
                                    width: cell.column.getSize(),
                                  }}
                                  tabIndex={isFocused ? 0 : -1}
                                  data-row-index={idx}
                                  data-col-index={cellIdx}
                                >
                                  {cell.getIsGrouped() ? (
                                    <button
                                      onClick={() => row.toggleExpanded()}
                                      className="flex items-center gap-2 font-semibold"
                                    >
                                      {row.getIsExpanded() ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRightIcon className="h-4 w-4" />
                                      )}
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                      )}{" "}
                                      ({row.subRows.length})
                                    </button>
                                  ) : cell.getIsAggregated() ? (
                                    flexRender(
                                      cell.column.columnDef.aggregatedCell ??
                                        cell.column.columnDef.cell,
                                      cell.getContext()
                                    )
                                  ) : cell.getIsPlaceholder() ? null : (
                                    flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )
                                  )}
                                </td>
                              );
                            })}
                          </motion.tr>

                          {row.getIsExpanded() && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <td
                                colSpan={row.getVisibleCells().length}
                                className="p-0"
                              >
                                <div
                                  className={`border-t border-b p-4 ${
                                    isDark
                                      ? "bg-slate-700 border-slate-600"
                                      : "bg-slate-50 border-slate-200"
                                  }`}
                                >
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4
                                        className={`font-semibold text-sm mb-2 ${
                                          isDark
                                            ? "text-slate-300"
                                            : "text-slate-700"
                                        }`}
                                      >
                                        Full Details
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        {Object.entries(row.original)
                                          .filter(([key]) => key !== "subRows")
                                          .map(([key, value]) => (
                                            <div key={key} className="flex">
                                              <span
                                                className={`font-medium w-32 ${
                                                  isDark
                                                    ? "text-slate-400"
                                                    : "text-slate-600"
                                                }`}
                                              >
                                                {key}:
                                              </span>
                                              <span
                                                className={
                                                  isDark
                                                    ? "text-slate-200"
                                                    : "text-slate-900"
                                                }
                                              >
                                                {String(value)}
                                              </span>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                    <div>
                                      <h4
                                        className={`font-semibold text-sm mb-2 ${
                                          isDark
                                            ? "text-slate-300"
                                            : "text-slate-700"
                                        }`}
                                      >
                                        Quick Actions
                                      </h4>
                                      <div className="flex gap-2 flex-wrap">
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            console.log(
                                              "View details",
                                              row.original
                                            )
                                          }
                                        >
                                          <Eye className="h-3 w-3 mr-1" /> View
                                          Profile
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            console.log("Edit", row.original)
                                          }
                                        >
                                          <Edit3 className="h-3 w-3 mr-1" />{" "}
                                          Edit
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            console.log("Copy", row.original)
                                          }
                                        >
                                          <Copy className="h-3 w-3 mr-1" />{" "}
                                          Duplicate
                                        </Button>
                                      </div>

                                      {row.original.subRows &&
                                        row.original.subRows.length > 0 && (
                                          <div className="mt-4">
                                            <h5
                                              className={`font-semibold text-xs mb-2 ${
                                                isDark
                                                  ? "text-slate-400"
                                                  : "text-slate-600"
                                              }`}
                                            >
                                              Sub-Items (
                                              {row.original.subRows.length})
                                            </h5>
                                            <div className="space-y-1">
                                              {row.original.subRows.map(
                                                (subRow, i) => (
                                                  <div
                                                    key={i}
                                                    className={`text-xs p-2 rounded ${
                                                      isDark
                                                        ? "bg-slate-800"
                                                        : "bg-white"
                                                    }`}
                                                  >
                                                    {subRow.name} -{" "}
                                                    {subRow.email}
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>

          {!loading && !isEmpty && <Pagination table={table} />}
        </div>

        {/* Status Bar */}
        <div
          className={`mt-4 p-4 rounded-lg border ${
            isDark
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <div
                className={`text-xs uppercase ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Total Rows
              </div>
              <div
                className={`text-lg font-bold ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {table.getFilteredRowModel().rows.length}
              </div>
            </div>
            <div>
              <div
                className={`text-xs uppercase ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Selected
              </div>
              <div
                className={`text-lg font-bold ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {table.getFilteredSelectedRowModel().rows.length}
              </div>
            </div>
            <div>
              <div
                className={`text-xs uppercase ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Active Filters
              </div>
              <div
                className={`text-lg font-bold ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {table.getState().columnFilters.length}
              </div>
            </div>
            <div>
              <div
                className={`text-xs uppercase ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Grouped By
              </div>
              <div
                className={`text-lg font-bold ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {table.getState().grouping.length || "-"}
              </div>
            </div>
            <div>
              <div
                className={`text-xs uppercase ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Edits
              </div>
              <div
                className={`text-lg font-bold ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {editHistory.history.length}
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div
          className={`mt-4 p-4 rounded-lg border ${
            isDark
              ? "bg-blue-900/20 border-blue-800"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <h3
            className={`font-semibold mb-2 flex items-center gap-2 ${
              isDark ? "text-blue-300" : "text-blue-900"
            }`}
          >
            <Info className="h-4 w-4" />
            Keyboard Shortcuts & Features
          </h3>
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-2 text-sm ${
              isDark ? "text-blue-200" : "text-blue-800"
            }`}
          >
            <div>
              <kbd
                className={`px-2 py-1 rounded border ${
                  isDark
                    ? "bg-slate-800 border-slate-600"
                    : "bg-white border-blue-300"
                }`}
              >
                ↑↓←→
              </kbd>{" "}
              Navigate
            </div>
            <div>
              <kbd
                className={`px-2 py-1 rounded border ${
                  isDark
                    ? "bg-slate-800 border-slate-600"
                    : "bg-white border-blue-300"
                }`}
              >
                Enter
              </kbd>{" "}
              Select
            </div>
            <div>
              <kbd
                className={`px-2 py-1 rounded border ${
                  isDark
                    ? "bg-slate-800 border-slate-600"
                    : "bg-white border-blue-300"
                }`}
              >
                Space
              </kbd>{" "}
              Expand
            </div>
            <div>
              <kbd
                className={`px-2 py-1 rounded border ${
                  isDark
                    ? "bg-slate-800 border-slate-600"
                    : "bg-white border-blue-300"
                }`}
              >
                Double-Click
              </kbd>{" "}
              Edit
            </div>
            <div>
              <kbd
                className={`px-2 py-1 rounded border ${
                  isDark
                    ? "bg-slate-800 border-slate-600"
                    : "bg-white border-blue-300"
                }`}
              >
                Ctrl+Z
              </kbd>{" "}
              Undo (via toolbar)
            </div>
            <div>
              <kbd
                className={`px-2 py-1 rounded border ${
                  isDark
                    ? "bg-slate-800 border-slate-600"
                    : "bg-white border-blue-300"
                }`}
              >
                Ctrl+Y
              </kbd>{" "}
              Redo (via toolbar)
            </div>
            <div>
              <kbd
                className={`px-2 py-1 rounded border ${
                  isDark
                    ? "bg-slate-800 border-slate-600"
                    : "bg-white border-blue-300"
                }`}
              >
                Home/End
              </kbd>{" "}
              Jump
            </div>
            <div>
              <kbd
                className={`px-2 py-1 rounded border ${
                  isDark
                    ? "bg-slate-800 border-slate-600"
                    : "bg-white border-blue-300"
                }`}
              >
                Drag
              </kbd>{" "}
              Resize Cols
            </div>
          </div>
          <div
            className={`mt-3 text-xs ${
              isDark ? "text-blue-300" : "text-blue-700"
            }`}
          >
            <strong>✨ Features:</strong> Cell Editing
            (Text/Number/Select/Date), Undo/Redo History, Dark Mode, Density
            Control (Compact/Normal/Comfortable), Striped Rows, Row Numbers,
            Tree Data (Hierarchical), Column Pinning, Resizing, Reordering,
            Grouping with Aggregations, Multi-Column Sorting, Global & Column
            Filters, Range Filters, Export (CSV/Excel/JSON), Expandable Details,
            Performance Sparklines, Status Badges, Keyboard Navigation, Status
            Bar, Auto-Save Preferences
          </div>
          <div
            className={`mt-2 p-2 rounded text-xs ${
              isDark ? "bg-slate-800 text-slate-300" : "bg-white text-slate-700"
            }`}
          >
            <strong>💡 Tip:</strong> When you use the "Group" button to group by
            a column (like Department or Status), the table shows group summary
            rows with aggregated totals. Click the expand icon on group rows to
            see individual items. Clear grouping to see all rows with edit
            options. The ID column now includes the expand/collapse button!
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CompleteDataGrid />
    </ThemeProvider>
  );
}
