import * as React from "react";
import { X, ChevronDown } from "lucide-react";

// Minimal inline components
const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
    outline: "border border-slate-200 bg-white hover:bg-slate-100",
    ghost: "hover:bg-slate-100",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = React.forwardRef(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 ${className}`}
    {...props}
  />
));

const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(value);
  const SelectContext = React.createContext();

  return (
    <SelectContext.Provider
      value={{ open, setOpen, selected, setSelected, onValueChange }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const DropdownContext = React.createContext();

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownContext.Provider>
  );
};

export function DataGridToolbar({ table, columns }) {
  const [filterColumn, setFilterColumn] = React.useState("");
  const [filterValue, setFilterValue] = React.useState("");
  const [columnVisibility, setColumnVisibility] = React.useState({});

  const filterableColumns = columns.filter(
    (col) => col.enableColumnFilter !== false
  );
  const hasActiveFilters = table.getState().columnFilters.length > 0;

  React.useEffect(() => {
    setColumnVisibility(table.getState().columnVisibility);
  }, [table.getState().columnVisibility]);

  const handleGlobalFilter = (e) => {
    table.setGlobalFilter(e.target.value);
  };

  const handleColumnFilter = (value) => {
    if (filterColumn && value) {
      table.getColumn(filterColumn)?.setFilterValue(value);
    }
  };

  const clearAllFilters = () => {
    table.resetColumnFilters();
    table.setGlobalFilter("");
    setFilterValue("");
  };

  const toggleColumnVisibility = (columnId) => {
    table.getColumn(columnId)?.toggleVisibility();
  };

  return (
    <div className="flex flex-col gap-4 p-4 border-b">
      {/* Global Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search all columns..."
          value={table.getState().globalFilter ?? ""}
          onChange={handleGlobalFilter}
          className="max-w-sm"
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-10 px-3"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Column Filter & Visibility */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Column Filter */}
        <div className="flex items-center gap-2">
          <select
            value={filterColumn}
            onChange={(e) => {
              setFilterColumn(e.target.value);
              setFilterValue("");
            }}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Select column to filter...</option>
            {filterableColumns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.header}
              </option>
            ))}
          </select>

          {filterColumn && (
            <>
              {filterableColumns.find((c) => c.id === filterColumn)
                ?.filterVariant === "select" ? (
                <select
                  value={filterValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilterValue(val);
                    handleColumnFilter(val);
                  }}
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
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
              ) : (
                <Input
                  placeholder={`Filter ${filterColumn}...`}
                  value={filterValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilterValue(val);
                    handleColumnFilter(val);
                  }}
                  className="max-w-xs"
                />
              )}
            </>
          )}
        </div>

        {/* Column Visibility Toggle */}
        <div className="relative ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              const dropdown = e.currentTarget.nextElementSibling;
              dropdown.style.display =
                dropdown.style.display === "none" ? "block" : "none";
            }}
          >
            Columns <ChevronDown className="ml-2 h-4 w-4" />
          </Button>

          <div
            style={{ display: "none" }}
            className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-slate-200 bg-white p-2 shadow-md"
          >
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <label
                  key={col.id}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-slate-100 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={() => toggleColumnVisibility(col.id)}
                    className="h-4 w-4"
                  />
                  <span className="capitalize">{col.id}</span>
                </label>
              ))}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {table.getState().columnFilters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-sm"
            >
              <span className="font-medium">{filter.id}:</span>
              <span>{filter.value}</span>
              <button
                onClick={() =>
                  table.getColumn(filter.id)?.setFilterValue(undefined)
                }
                className="ml-1 hover:text-slate-900"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DataGridToolbar;
