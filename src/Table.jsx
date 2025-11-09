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
  ArrowRightFromLine,
  ArrowUpFromLine,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft, ChevronRight,
  ChevronRight as ChevronRightIcon,
  ChevronsLeft, ChevronsRight,
  Copy,
  Download,
  EyeOff,
  FileDown,
  FileJson,
  FileSpreadsheet,
  Filter,
  Info,
  Layers,
  Loader2,
  MoreHorizontal,
  Pencil,
  Pin, PinOff, Search,
  Settings,
  Trash,
  X
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
// ============ UI Components ============
const Button = ({ children, variant = "default", size = "default", className = "", disabled, ...props }) => {
  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
    outline: "border border-slate-200 bg-white hover:bg-slate-100",
    ghost: "hover:bg-slate-100",
  };
  const sizes = { default: "h-10 px-4 py-2", sm: "h-8 px-3 text-xs", icon: "h-8 w-8" };
  return (
    <button disabled={disabled} className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = React.forwardRef(({ className = "", ...props }, ref) => (
  <input ref={ref} className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 ${className}`} {...props} />
));

const Checkbox = ({ checked, onCheckedChange, indeterminate, ...props }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return <input ref={ref} type="checkbox" checked={checked} onChange={(e) => onCheckedChange?.(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-950" {...props} />;
};

const Dropdown = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);
  return <div ref={ref} className="relative">{React.Children.map(children, child => React.cloneElement(child, { open, setOpen }))}</div>;
};

const DropdownTrigger = ({ children, open, setOpen }) => React.cloneElement(children, { onClick: (e) => { e.stopPropagation(); setOpen(!open); }});
const DropdownContent = ({ children, open, align = "end" }) => !open ? null : (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`absolute ${align === "end" ? "right-0" : "left-0"} z-50 mt-2 min-w-[200px] max-h-96 overflow-auto rounded-md border bg-white p-2 shadow-lg`}>{children}</motion.div>
);
const DropdownItem = ({ children, onClick, className = "" }) => (
  <div onClick={(e) => { e.stopPropagation(); onClick?.(); }} className={`flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm hover:bg-slate-100 ${className}`}>{children}</div>
);
const DropdownSeparator = () => <div className="my-1 h-px bg-slate-100" />;

// ============ Export Functions ============
const exportToCSV = (data, columns) => {
  const headers = columns.map(c => c.id).join(',');
  const rows = data.map(row => columns.map(c => `"${row[c.id] || ''}"`).join(',')).join('\n');
  const csv = `${headers}\n${rows}`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `export-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportToJSON = (data, columns) => {
  const exportData = data.map(row => {
    const obj = {};
    columns.forEach(c => { obj[c.id] = row[c.id]; });
    return obj;
  });
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportToExcel = (data, columns) => {
  let html = '<table><thead><tr>';
  columns.forEach(c => { html += `<th>${c.id}</th>`; });
  html += '</tr></thead><tbody>';
  data.forEach(row => {
    html += '<tr>';
    columns.forEach(c => { html += `<td>${row[c.id] || ''}</td>`; });
    html += '</tr>';
  });
  html += '</tbody></table>';
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `export-${Date.now()}.xls`;
  a.click();
  URL.revokeObjectURL(url);
};

// ============ Enhanced Toolbar ============
const EnhancedToolbar = ({ table, columns, onExport, onResetPreferences, globalFilter, onGlobalFilterChange }) => {
  const [filterColumn, setFilterColumn] = React.useState("");
  const [filterValue, setFilterValue] = React.useState("");
  const [searchTimeout, setSearchTimeout] = React.useState(null);
  
  const filterableColumns = columns.filter(c => c.enableColumnFilter !== false);
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
    const rows = table.getFilteredRowModel().rows.map(r => r.original);
    const cols = table.getVisibleLeafColumns().filter(c => c.id !== 'select' && c.id !== 'actions' && c.id !== 'expand');
    onExport(format, rows, cols);
  };
  
  return (
    <div className="flex flex-col gap-4 p-4 border-b bg-slate-50/50">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm text-blue-800">
            Keyboard Shortcuts
            <div><kbd className="px-2 py-1 bg-white rounded border">↑↓←→</kbd> Navigate</div>
            <div><kbd className="px-2 py-1 bg-white rounded border">Enter</kbd> Select</div>
            <div><kbd className="px-2 py-1 bg-white rounded border">Space</kbd> Expand</div>
            <div><kbd className="px-2 py-1 bg-white rounded border">Home/End</kbd> Jump</div>
          </div>
        </div>
        
      <div className="flex items-center gap-2 flex-wrap">
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search all columns..." defaultValue={globalFilter ?? ""} onChange={(e) => handleGlobalSearch(e.target.value)} className="pl-9" />
        </div>
        {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-4 w-4 mr-2" /> Clear</Button>}
        
        <Dropdown>
          <DropdownTrigger><Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Export</Button></DropdownTrigger>
          <DropdownContent>
            <DropdownItem onClick={() => exportData('csv')}><FileSpreadsheet className="h-4 w-4 mr-2" /> CSV</DropdownItem>
            <DropdownItem onClick={() => exportData('excel')}><FileDown className="h-4 w-4 mr-2" /> Excel</DropdownItem>
            <DropdownItem onClick={() => exportData('json')}><FileJson className="h-4 w-4 mr-2" /> JSON</DropdownItem>
          </DropdownContent>
        </Dropdown>
        
        <Dropdown>
          <DropdownTrigger><Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2" /> Columns</Button></DropdownTrigger>
          <DropdownContent>
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">VISIBILITY & PINNING</div>
            {table.getAllColumns().filter(c => c.getCanHide()).map((col) => (
              <div key={col.id} className="flex items-center justify-between px-2 py-2 hover:bg-slate-100 rounded">
                <label className="flex items-center gap-2 cursor-pointer flex-1">
                  <input type="checkbox" checked={col.getIsVisible()} onChange={() => col.toggleVisibility()} className="h-4 w-4" />
                  <span className="capitalize text-sm">{col.id}</span>
                </label>
                {col.getCanPin() && (
                  <button onClick={(e) => { e.stopPropagation(); col.pin(col.getIsPinned() ? false : 'left'); }} className={`p-1 rounded hover:bg-slate-200 ${col.getIsPinned() ? 'text-blue-600' : 'text-slate-400'}`}>
                    {col.getIsPinned() ? <Pin className="h-3 w-3" /> : <PinOff className="h-3 w-3" />}
                  </button>
                )}
              </div>
            ))}
            <DropdownSeparator />
            <DropdownItem onClick={onResetPreferences}><X className="h-4 w-4 mr-2" /> Reset Preferences</DropdownItem>
          </DropdownContent>
        </Dropdown>
        
        <Dropdown>
          <DropdownTrigger><Button variant="outline" size="sm"><Layers className="h-4 w-4 mr-2" /> Group {table.getState().grouping.length > 0 && `(${table.getState().grouping.length})`}</Button></DropdownTrigger>
          <DropdownContent>
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">GROUP BY</div>
            {columns.filter(c => c.enableGrouping !== false && !['select', 'actions', 'expand'].includes(c.id)).map((col) => {
              const isGrouped = table.getState().grouping.includes(col.id);
              return (
                <label key={col.id} className="flex items-center gap-2 px-2 py-2 hover:bg-slate-100 rounded cursor-pointer">
                  <input type="checkbox" checked={isGrouped} onChange={() => {
                    const grouping = table.getState().grouping;
                    table.setGrouping(isGrouped ? grouping.filter(g => g !== col.id) : [...grouping, col.id]);
                  }} className="h-4 w-4" />
                  <span className="capitalize text-sm">{col.id}</span>
                </label>
              );
            })}
            {table.getState().grouping.length > 0 && (
              <><DropdownSeparator /><DropdownItem onClick={() => table.setGrouping([])} className="text-red-600">Clear grouping</DropdownItem></>
            )}
          </DropdownContent>
        </Dropdown>
      
      {/* </div>
      
      <div className="flex items-center gap-2 flex-wrap"> */}

        <Filter className="h-4 w-4 text-slate-500 ml-auto"  />
        <select value={filterColumn} onChange={(e) => { setFilterColumn(e.target.value); setFilterValue(""); }} className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm">
          <option value="">Add filter...</option>
          {filterableColumns.map((col) => <option key={col.id} value={col.id}>{col.header}</option>)}
        </select>
        {filterColumn && (
          filterableColumns.find(c => c.id === filterColumn)?.filterVariant === "select" ? (
            <select value={filterValue} onChange={(e) => { setFilterValue(e.target.value); table.getColumn(filterColumn)?.setFilterValue(e.target.value); }} className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm">
              <option value="">All</option>
              {filterableColumns.find(c => c.id === filterColumn)?.filterOptions?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : filterableColumns.find(c => c.id === filterColumn)?.filterVariant === "range" ? (
            <div className="flex items-center gap-2">
              <Input type="number" placeholder="Min" onChange={(e) => {
                const val = { ...(filterValue || {}), min: e.target.value };
                setFilterValue(val);
                if (searchTimeout) clearTimeout(searchTimeout);
                const timeout = setTimeout(() => table.getColumn(filterColumn)?.setFilterValue(val), 300);
                setSearchTimeout(timeout);
              }} className="w-24 h-9" />
              <span className="text-slate-400">to</span>
              <Input type="number" placeholder="Max" onChange={(e) => {
                const val = { ...(filterValue || {}), max: e.target.value };
                setFilterValue(val);
                if (searchTimeout) clearTimeout(searchTimeout);
                const timeout = setTimeout(() => table.getColumn(filterColumn)?.setFilterValue(val), 300);
                setSearchTimeout(timeout);
              }} className="w-24 h-9" />
            </div>
          ) : (
            <Input placeholder={`Filter ${filterColumn}...`} value={filterValue} onChange={(e) => {
              setFilterValue(e.target.value);
              if (searchTimeout) clearTimeout(searchTimeout);
              const timeout = setTimeout(() => table.getColumn(filterColumn)?.setFilterValue(e.target.value), 300);
              setSearchTimeout(timeout);
            }} className="max-w-xs h-9" />
          )
        )}
      </div>
      
      {table.getState().columnFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-500 font-medium">Active:</span>
          {table.getState().columnFilters.map((f) => (
            <motion.div key={f.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              <span className="font-semibold">{f.id}:</span>
              <span>{typeof f.value === 'object' ? `${f.value.min || '∞'}-${f.value.max || '∞'}` : f.value}</span>
              <button onClick={() => table.getColumn(f.id)?.setFilterValue(undefined)} className="ml-1"><X className="h-3 w-3" /></button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ Column Header ============
const ColumnHeader = ({ header, title, table }) => {
  const column = header.column;
  if (!column.getCanSort()) return <div className="flex items-center gap-2">{title}</div>;
  const isSorted = column.getIsSorted();
  const SortIcon = isSorted === "asc" ? ArrowUp : isSorted === "desc" ? ArrowDown : ArrowUpDown;
  
  return (
    <div className="flex items-center relative">
      <Dropdown>
        <DropdownTrigger>
          <Button variant="ghost" size="sm" className="-ml-3">
            {title}
            <motion.div animate={{ rotate: isSorted === "desc" ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <SortIcon className="ml-2 h-4 w-4" />
            </motion.div>
          </Button>
        </DropdownTrigger>
        <DropdownContent align="start">
          <DropdownItem onClick={() => column.toggleSorting(false)}><ArrowUp className="mr-2 h-3.5 w-3.5" /> Asc</DropdownItem>
          <DropdownItem onClick={() => column.toggleSorting(true)}><ArrowDown className="mr-2 h-3.5 w-3.5" /> Desc</DropdownItem>
          <DropdownSeparator />
          <DropdownItem onClick={() => column.toggleVisibility(false)}><EyeOff className="mr-2 h-3.5 w-3.5" /> Hide</DropdownItem>
          <DropdownItem onClick={() => column.pin(column.getIsPinned() ? false : 'left')}>
            {column.getIsPinned() ? <PinOff className="mr-2 h-3.5 w-3.5" /> : <Pin className="mr-2 h-3.5 w-3.5" />}
            {column.getIsPinned() ? 'Unpin' : 'Pin Left'}
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
      {header.column.getCanResize() && (
        <div onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 touch-none" />
      )}
    </div>
  );
};

// ============ Row Actions ============
const RowActions = ({ row }) => (
  <Dropdown>
    <DropdownTrigger><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownTrigger>
    <DropdownContent>
      <div className="px-2 py-1.5 text-sm font-semibold">Actions</div>
      <DropdownItem onClick={() => navigator.clipboard.writeText(row.original.id)}><Copy className="mr-2 h-4 w-4" /> Copy ID</DropdownItem>
      <DropdownSeparator />
      <DropdownItem onClick={() => console.log("Edit:", row.original)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownItem>
      <DropdownItem onClick={() => console.log("Duplicate:", row.original)}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownItem>
      <DropdownSeparator />
      <DropdownItem onClick={() => console.log("Delete:", row.original)} className="text-red-600"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownItem>
    </DropdownContent>
  </Dropdown>
);

// ============ Pagination ============
const Pagination = ({ table }) => {
  const { pageSize, pageIndex } = table.getState().pagination;
  return (
    <div className="flex items-center justify-between px-4 py-4 border-t">
      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-500">{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} selected</div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Rows:</span>
          <select value={pageSize} onChange={(e) => table.setPageSize(Number(e.target.value))} className="h-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm">
            {[10, 20, 30, 50, 100].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-sm text-slate-500 mr-4">Page {pageIndex + 1} of {table.getPageCount()}</div>
        <Button variant="outline" size="icon" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
};

// ============ Range Filter Function ============
const rangeFilterFn = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  const numValue = Number(value);
  if (isNaN(numValue)) return true;
  
  const min = filterValue?.min ? Number(filterValue.min) : -Infinity;
  const max = filterValue?.max ? Number(filterValue.max) : Infinity;
  
  return numValue >= min && numValue <= max;
};

// ============ Data Generator ============
const generateData = () => {
  const statuses = ["Active", "Inactive", "Pending", "Suspended"];
  const roles = ["Admin", "User", "Manager", "Guest"];
  const depts = ["Engineering", "Sales", "Marketing", "Support", "HR"];
  const first = ["John", "Jane", "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry"];
  const last = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Martinez", "Lopez"];
  
  return Array.from({ length: 100 }, (_, i) => ({
    id: `usr_${String(i + 1).padStart(5, "0")}`,
    name: `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`,
    email: `user${i + 1}@example.com`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    department: depts[Math.floor(Math.random() * depts.length)],
    salary: Math.floor(Math.random() * 100000) + 40000,
    joinDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toLocaleDateString(),
    performance: Math.floor(Math.random() * 100),
  }));
};

// ============ Main Component ============
export default function CompleteDataGrid() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [globalFilter, setGlobalFilter] = React.useState("");
  
  // Load preferences
  const loadPrefs = () => {
    try {
      const stored = localStorage.getItem('datagrid-prefs');
      return stored ? JSON.parse(stored) : {
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
        pageSize: 10 
      }; 
    }
  };
  
  const [prefs, setPrefs] = React.useState(loadPrefs);
  
  const savePrefs = (newPrefs) => {
    const merged = { ...prefs, ...newPrefs };
    localStorage.setItem('datagrid-prefs', JSON.stringify(merged));
    setPrefs(merged);
  };
  
  React.useEffect(() => {
    setTimeout(() => { 
      setData(generateData()); 
      setLoading(false); 
    }, 1000);
  }, []);
  
  const columns = React.useMemo(() => [
    {
      id: "expand",
      header: "",
      cell: ({ row }) => row.getCanExpand() ? (
        <button onClick={() => row.toggleExpanded()} className="p-1 hover:bg-slate-100 rounded">
          {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
        </button>
      ) : null,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
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
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} />,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
    },
    { 
      accessorKey: "name", 
      id: "name", 
      header: "Name", 
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>, 
      enableColumnFilter: true 
    },
    { 
      accessorKey: "email", 
      id: "email", 
      header: "Email", 
      enableColumnFilter: true 
    },
    {
      accessorKey: "status",
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.getValue("status");
        const colors = { 
          Active: "bg-green-100 text-green-800", 
          Inactive: "bg-gray-100 text-gray-800", 
          Pending: "bg-yellow-100 text-yellow-800", 
          Suspended: "bg-red-100 text-red-800" 
        };
        return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colors[s]}`}>{s}</span>;
      },
      filterVariant: "select",
      filterOptions: ["Active", "Inactive", "Pending", "Suspended"],
      enableGrouping: true,
      enableColumnFilter: true,
    },
    { 
      accessorKey: "role", 
      id: "role", 
      header: "Role", 
      filterVariant: "select", 
      filterOptions: ["Admin", "User", "Manager", "Guest"], 
      enableGrouping: true,
      enableColumnFilter: true,
    },
    { 
      accessorKey: "department", 
      id: "department", 
      header: "Department", 
      filterVariant: "select", 
      filterOptions: ["Engineering", "Sales", "Marketing", "Support", "HR"], 
      enableGrouping: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "salary",
      id: "salary",
      header: "Salary",
      cell: ({ row }) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(row.getValue("salary")),
      filterVariant: "range",
      enableColumnFilter: true,
      aggregationFn: 'sum',
      aggregatedCell: ({ getValue }) => (
        <div className="font-bold text-green-700">
          Total: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(getValue())}
        </div>
      ),
    },
    { 
      accessorKey: "performance", 
      id: "performance", 
      header: "Performance", 
      cell: ({ row }) => `${row.getValue("performance")}%`, 
      filterVariant: "range",
      enableColumnFilter: true,
      aggregationFn: 'mean', 
      aggregatedCell: ({ getValue }) => <div className="font-bold text-blue-700">Avg: {Math.round(getValue())}%</div> 
    },
    { 
      accessorKey: "joinDate", 
      id: "joinDate", 
      header: "Join Date",
      enableColumnFilter: true,
    },
    { 
      id: "actions", 
      header: "Actions", 
      cell: ({ row }) => <RowActions row={row} />, 
      enableSorting: false, 
      enableHiding: false, 
      enableResizing: false 
    },
  ], []);
  
  const columnsWithHeader = columns.map(col => ({
    ...col,
    header: typeof col.header === "string" ? ({ column, table, header }) => <ColumnHeader header={header} column={column} title={col.header} table={table} /> : col.header,
  }));
  
  const [sorting, setSorting] = React.useState(prefs.sorting);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState(prefs.columnVisibility);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnOrder, setColumnOrder] = React.useState(prefs.columnOrder);
  const [columnSizing, setColumnSizing] = React.useState(prefs.columnSizing);
  const [columnPinning, setColumnPinning] = React.useState(prefs.columnPinning);
  const [expanded, setExpanded] = React.useState({});
  const [grouping, setGrouping] = React.useState([]);
  
  // Auto-save preferences
  React.useEffect(() => {
    savePrefs({ sorting });
  }, [sorting]);
  
  React.useEffect(() => {
    savePrefs({ columnVisibility });
  }, [columnVisibility]);
  
  React.useEffect(() => {
    savePrefs({ columnOrder });
  }, [columnOrder]);
  
  React.useEffect(() => {
    savePrefs({ columnSizing });
  }, [columnSizing]);
  
  React.useEffect(() => {
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
      grouping 
    },
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    enableSorting: true,
    enableMultiSort: true,
    enableFilters: true,
    enableGrouping: true,
    enableExpanding: true,
    enablePinning: true,
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
    globalFilterFn: 'includesString',
    initialState: {
      pagination: {
        pageSize: prefs.pageSize,
      },
    },
  });
  
  // Keyboard navigation
  const [focusedCell, setFocusedCell] = React.useState({ row: 0, col: 0 });
  
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      const rows = table.getRowModel().rows;
      const columns = table.getVisibleLeafColumns();
      if (!rows.length || !columns.length) return;
      
      const maxRow = rows.length - 1;
      const maxCol = columns.length - 1;
      
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setFocusedCell((prev) => ({ ...prev, row: Math.max(0, prev.row - 1) }));
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedCell((prev) => ({ ...prev, row: Math.min(maxRow, prev.row + 1) }));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setFocusedCell((prev) => ({ ...prev, col: Math.max(0, prev.col - 1) }));
          break;
        case "ArrowRight":
          e.preventDefault();
          setFocusedCell((prev) => ({ ...prev, col: Math.min(maxCol, prev.col + 1) }));
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
      case 'csv':
        exportToCSV(rows, cols);
        break;
      case 'excel':
        exportToExcel(rows, cols);
        break;
      case 'json':
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
    localStorage.removeItem('datagrid-prefs');
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
  
  const { left, center, right } = React.useMemo(() => {
    const leftCols = table.getLeftLeafColumns();
    const centerCols = table.getCenterLeafColumns();
    const rightCols = table.getRightLeafColumns();
    return { left: leftCols, center: centerCols, right: rightCols };
  }, [table.getState().columnPinning]);
  
  const isEmpty = table.getFilteredRowModel().rows.length === 0;
  
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Advanced DataGrid</h1>
          <p className="text-slate-600">Complete table with all features: sorting, filtering, grouping, pinning, resizing, keyboard navigation & more</p>
        </div> */}
        
        <div className="border rounded-lg bg-white shadow-lg overflow-hidden">
          <EnhancedToolbar
            table={table}
            columns={columns}
            onExport={handleExport}
            onResetPreferences={handleResetPreferences}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
          
          <div className="relative overflow-auto" style={{ maxHeight: '600px' }}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                <span className="ml-2 text-slate-500">Loading data...</span>
              </div>
            ) : isEmpty ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="rounded-full bg-slate-100 p-3 mb-4">
                  <Info className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No results found</h3>
                <p className="text-sm text-slate-500">Try adjusting your filters</p>
              </motion.div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-100 sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        const isPinned = header.column.getIsPinned();
                        return (
                          <th
                            key={header.id}
                            className={`h-12 px-4 text-left align-middle font-medium text-slate-700 border-r last:border-r-0 ${
                              isPinned ? 'sticky bg-slate-100 z-20' : ''
                            } ${isPinned === 'left' ? 'left-0' : ''} ${isPinned === 'right' ? 'right-0' : ''}`}
                            style={{
                              width: header.getSize(),
                              position: isPinned ? 'sticky' : 'relative',
                            }}
                          >
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {table.getRowModel().rows.map((row, idx) => {
                      const isGrouped = row.getIsGrouped();
                      
                      if (isGrouped) {
                        return (
                          <motion.tr
                            key={row.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-slate-50 font-semibold hover:bg-slate-100 border-b"
                          >
                            <td colSpan={row.getVisibleCells().length} className="p-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => row.toggleExpanded()} className="p-1 hover:bg-slate-200 rounded">
                                  {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                                </button>
                                <Layers className="h-4 w-4 text-slate-600" />
                                <span className="text-slate-900">
                                  {row.groupingColumnId}: <strong>{row.groupingValue}</strong>
                                </span>
                                <span className="text-slate-600 text-sm ml-2">
                                  ({row.subRows.length} {row.subRows.length === 1 ? 'item' : 'items'})
                                </span>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      }
                      
                      return (
                        <React.Fragment key={row.id}>
                          <motion.tr
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, delay: idx * 0.02 }}
                            className={`border-b transition-colors hover:bg-slate-50 ${
                              row.getIsSelected() ? 'bg-blue-50' : ''
                            }`}
                          >
                            {row.getVisibleCells().map((cell, cellIdx) => {
                              const isPinned = cell.column.getIsPinned();
                              const isFocused = focusedCell.row === idx && focusedCell.col === cellIdx;
                              
                              return (
                                <td
                                  key={cell.id}
                                  className={`p-4 align-middle ${
                                    isPinned ? "sticky bg-white z-10" : ""
                                  } ${isPinned === "left" ? "left-0" : ""} ${
                                    isPinned === "right" ? "right-0" : ""
                                  } ${
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
                                    <>
                                      {cell.column.columnDef.id === "expand" ? (
                                        row.getIsExpanded() ? (
                                          <ArrowUpFromLine />
                                        ) : (
                                          <ArrowRightFromLine />
                                        )
                                      ) : null}
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                      )}
                                    </>
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
                              <td colSpan={row.getVisibleCells().length} className="p-0">
                                <div className="bg-slate-50 border-t border-b p-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Full Details</h4>
                                      <div className="space-y-2 text-sm">
                                        {Object.entries(row.original).map(([key, value]) => (
                                          <div key={key} className="flex">
                                            <span className="font-medium text-slate-600 w-32">{key}:</span>
                                            <span className="text-slate-900">{String(value)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Actions</h4>
                                      <div className="flex gap-2">
                                        <Button size="sm" onClick={() => console.log("View details", row.original)}>
                                          View Full Profile
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => console.log("Edit", row.original)}>
                                          Edit
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
          
          {!loading && !isEmpty && <Pagination table={table} />}
        </div>
        
        {/* <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-800">
            <div><kbd className="px-2 py-1 bg-white rounded border">↑↓←→</kbd> Navigate</div>
            <div><kbd className="px-2 py-1 bg-white rounded border">Enter</kbd> Select</div>
            <div><kbd className="px-2 py-1 bg-white rounded border">Space</kbd> Expand</div>
            <div><kbd className="px-2 py-1 bg-white rounded border">Home/End</kbd> Jump</div>
          </div>
        </div> */}
      </div>
    </div>
  );
}