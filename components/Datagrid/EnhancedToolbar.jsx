import React from "react";
import { 
  X, 
  ChevronDown, 
  Download, 
  Filter, 
  Settings,
  Pin,
  PinOff,
  Search,
  FileDown,
  FileSpreadsheet,
  FileJson
} from "lucide-react";
import { motion } from "motion/react";

const Button = ({ children, variant = "default", size = "default", className = "", disabled, ...props }) => {
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
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
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

const Dropdown = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);
  
  return (
    <div ref={ref} className="relative">
      {React.Children.map(children, child => React.cloneElement(child, { open, setOpen }))}
    </div>
  );
};

const DropdownTrigger = ({ children, open, setOpen }) =>
  React.cloneElement(children, { onClick: (e) => { e.stopPropagation(); setOpen(!open); }});

const DropdownContent = ({ children, open, align = "end" }) => {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute ${align === "end" ? "right-0" : "left-0"} z-50 mt-2 min-w-[200px] max-h-96 overflow-auto rounded-md border bg-white p-2 shadow-lg`}
    >
      {children}
    </motion.div>
  );
};

const DropdownItem = ({ children, onClick, className = "" }) => (
  <div
    onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    className={`flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm hover:bg-slate-100 ${className}`}
  >
    {children}
  </div>
);

const DropdownSeparator = () => <div className="my-1 h-px bg-slate-100" />;

export function EnhancedToolbar({ 
  table, 
  columns, 
  onExport,
  columnPinning,
  onTogglePin,
  onResetPreferences,
  globalFilter,
  onGlobalFilterChange 
}) {
  const [filterColumn, setFilterColumn] = React.useState("");
  const [filterValue, setFilterValue] = React.useState("");
  const [searchDebounce, setSearchDebounce] = React.useState(null);
  
  const filterableColumns = columns.filter(c => c.enableColumnFilter !== false);
  const hasFilters = table.getState().columnFilters.length > 0 || globalFilter;
  
  // Debounced search
  const handleGlobalSearch = (value) => {
    if (searchDebounce) clearTimeout(searchDebounce);
    const timeout = setTimeout(() => {
      onGlobalFilterChange(value);
    }, 300);
    setSearchDebounce(timeout);
  };
  
  const clearFilters = () => {
    table.resetColumnFilters();
    onGlobalFilterChange("");
    setFilterValue("");
    setFilterColumn("");
  };
  
  const exportData = (format) => {
    const rows = table.getFilteredRowModel().rows.map(row => row.original);
    const visibleColumns = table.getVisibleLeafColumns()
      .filter(col => col.id !== 'select' && col.id !== 'actions')
      .map(col => ({ id: col.id, header: col.columnDef.header }));
    
    onExport(format, rows, visibleColumns);
  };
  
  return (
    <div className="flex flex-col gap-4 p-4 border-b bg-slate-50/50">
      {/* Top Row - Search and Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search all columns... (debounced)"
            defaultValue={globalFilter ?? ""}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" /> Clear All
          </Button>
        )}
        
        {/* Export Menu */}
        <Dropdown>
          <DropdownTrigger>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </DropdownTrigger>
          <DropdownContent>
            <DropdownItem onClick={() => exportData('csv')}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> Export as CSV
            </DropdownItem>
            <DropdownItem onClick={() => exportData('excel')}>
              <FileDown className="h-4 w-4 mr-2" /> Export as Excel
            </DropdownItem>
            <DropdownItem onClick={() => exportData('json')}>
              <FileJson className="h-4 w-4 mr-2" /> Export as JSON
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
        
        {/* Column Settings */}
        <Dropdown>
          <DropdownTrigger>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" /> Columns
            </Button>
          </DropdownTrigger>
          <DropdownContent>
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase">
              Column Visibility
            </div>
            {table.getAllColumns().filter(c => c.getCanHide()).map((col) => (
              <div key={col.id} className="flex items-center justify-between px-2 py-2 hover:bg-slate-100 rounded">
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
                      const currentPin = col.getIsPinned();
                      onTogglePin(col.id, currentPin === 'left' ? false : 'left');
                    }}
                    className={`p-1 rounded hover:bg-slate-200 ${
                      col.getIsPinned() === 'left' ? 'text-blue-600' : 'text-slate-400'
                    }`}
                    title={col.getIsPinned() === 'left' ? 'Unpin' : 'Pin to left'}
                  >
                    {col.getIsPinned() === 'left' ? <Pin className="h-3 w-3" /> : <PinOff className="h-3 w-3" />}
                  </button>
                )}
              </div>
            ))}
            <DropdownSeparator />
            <DropdownItem onClick={onResetPreferences}>
              <X className="h-4 w-4 mr-2" /> Reset All Preferences
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
      
      {/* Column Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-slate-500" />
        <select
          value={filterColumn}
          onChange={(e) => { 
            setFilterColumn(e.target.value); 
            setFilterValue("");
            table.getColumn(e.target.value)?.setFilterValue(undefined);
          }}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
        >
          <option value="">Add column filter...</option>
          {filterableColumns.map((col) => (
            <option key={col.id} value={col.id}>{col.header}</option>
          ))}
        </select>
        
        {filterColumn && (
          <>
            {filterableColumns.find(c => c.id === filterColumn)?.filterVariant === "select" ? (
              <select
                value={filterValue}
                onChange={(e) => {
                  setFilterValue(e.target.value);
                  table.getColumn(filterColumn)?.setFilterValue(e.target.value);
                }}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
              >
                <option value="">All</option>
                {filterableColumns.find(c => c.id === filterColumn)?.filterOptions?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : filterableColumns.find(c => c.id === filterColumn)?.filterVariant === "range" ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filterValue?.min || ""}
                  onChange={(e) => {
                    const newVal = { ...(filterValue || {}), min: e.target.value };
                    setFilterValue(newVal);
                    table.getColumn(filterColumn)?.setFilterValue(newVal);
                  }}
                  className="w-24 h-9"
                />
                <span className="text-slate-400">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filterValue?.max || ""}
                  onChange={(e) => {
                    const newVal = { ...(filterValue || {}), max: e.target.value };
                    setFilterValue(newVal);
                    table.getColumn(filterColumn)?.setFilterValue(newVal);
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
                  if (searchDebounce) clearTimeout(searchDebounce);
                  const timeout = setTimeout(() => {
                    table.getColumn(filterColumn)?.setFilterValue(e.target.value);
                  }, 300);
                  setSearchDebounce(timeout);
                }}
                className="max-w-xs h-9"
              />
            )}
          </>
        )}
      </div>
      
      {/* Active Filters Display */}
      {table.getState().columnFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-500 font-medium">Active filters:</span>
          {table.getState().columnFilters.map((filter) => (
            <motion.div
              key={filter.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
            >
              <span className="font-semibold">{filter.id}:</span>
              <span>
                {typeof filter.value === 'object' 
                  ? `${filter.value.min || '∞'} - ${filter.value.max || '∞'}`
                  : filter.value}
              </span>
              <button 
                onClick={() => table.getColumn(filter.id)?.setFilterValue(undefined)} 
                className="ml-1 hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EnhancedToolbar;