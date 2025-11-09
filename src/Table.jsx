import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  X,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash,
} from "lucide-react";

// ============ UI Components ============
const Button = ({ children, variant = "default", size = "default", className = "", disabled, ...props }) => {
  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
    outline: "border border-slate-200 bg-white hover:bg-slate-100",
    ghost: "hover:bg-slate-100",
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

const Input = React.forwardRef(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 ${className}`}
    {...props}
  />
));

const Checkbox = ({ checked, onCheckedChange, ...props }) => {
  const handleChange = (e) => onCheckedChange?.(e.target.checked);
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={handleChange}
      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-950"
      {...props}
    />
  );
};

const Table = ({ children }) => (
  <div className="relative w-full overflow-auto">
    <table className="w-full caption-bottom text-sm">{children}</table>
  </div>
);

const TableHeader = ({ children }) => <thead className="border-b bg-slate-50">{children}</thead>;
const TableBody = ({ children }) => <tbody className="[&_tr:last-child]:border-0">{children}</tbody>;
const TableRow = ({ children, className = "", ...props }) => (
  <tr className={`border-b transition-colors hover:bg-slate-50 ${className}`} {...props}>
    {children}
  </tr>
);
const TableHead = ({ children, className = "" }) => (
  <th className={`h-12 px-4 text-left align-middle font-medium text-slate-500 ${className}`}>
    {children}
  </th>
);
const TableCell = ({ children, className = "" }) => (
  <td className={`p-4 align-middle ${className}`}>{children}</td>
);

// ============ Dropdown Component ============
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
      className={`absolute ${align === "end" ? "right-0" : "left-0"} z-50 mt-2 min-w-[8rem] rounded-md border bg-white p-1 shadow-md`}
    >
      {children}
    </motion.div>
  );
};

const DropdownItem = ({ children, onClick, className = "" }) => (
  <div
    onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    className={`flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-slate-100 ${className}`}
  >
    {children}
  </div>
);

const DropdownSeparator = () => <div className="my-1 h-px bg-slate-100" />;

// ============ Column Header Component ============
const ColumnHeader = ({ column, title }) => {
  if (!column.getCanSort()) return <div>{title}</div>;
  
  const isSorted = column.getIsSorted();
  const SortIcon = isSorted === "asc" ? ArrowUp : isSorted === "desc" ? ArrowDown : ArrowUpDown;
  
  return (
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
      </DropdownContent>
    </Dropdown>
  );
};

// ============ Row Actions Component ============
const RowActions = ({ row }) => {
  const actions = {
    copy: () => navigator.clipboard.writeText(row.original.id),
    edit: () => console.log("Edit:", row.original),
    duplicate: () => console.log("Duplicate:", row.original),
    delete: () => console.log("Delete:", row.original),
  };
  
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownTrigger>
      <DropdownContent>
        <div className="px-2 py-1.5 text-sm font-semibold">Actions</div>
        <DropdownItem onClick={actions.copy}>
          <Copy className="mr-2 h-4 w-4" /> Copy ID
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem onClick={actions.edit}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownItem>
        <DropdownItem onClick={actions.duplicate}>
          <Copy className="mr-2 h-4 w-4" /> Duplicate
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem onClick={actions.delete} className="text-red-600">
          <Trash className="mr-2 h-4 w-4" /> Delete
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
};

// ============ Toolbar Component ============
const Toolbar = ({ table, columns }) => {
  const [filterColumn, setFilterColumn] = React.useState("");
  const [filterValue, setFilterValue] = React.useState("");
  
  const filterableColumns = columns.filter(c => c.enableColumnFilter !== false);
  const hasFilters = table.getState().columnFilters.length > 0;
  
  const clearFilters = () => {
    table.resetColumnFilters();
    table.setGlobalFilter("");
    setFilterValue("");
  };
  
  return (
    <div className="flex flex-col gap-4 p-4 border-b">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search all columns..."
          value={table.getState().globalFilter ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" /> Clear Filters
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={filterColumn}
          onChange={(e) => { setFilterColumn(e.target.value); setFilterValue(""); }}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select column to filter...</option>
          {filterableColumns.map((col) => (
            <option key={col.id} value={col.id}>{col.header}</option>
          ))}
        </select>
        
        {filterColumn && (
          filterableColumns.find(c => c.id === filterColumn)?.filterVariant === "select" ? (
            <select
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
                table.getColumn(filterColumn)?.setFilterValue(e.target.value);
              }}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {filterableColumns.find(c => c.id === filterColumn)?.filterOptions?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <Input
              placeholder={`Filter ${filterColumn}...`}
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
                table.getColumn(filterColumn)?.setFilterValue(e.target.value);
              }}
              className="max-w-xs"
            />
          )
        )}
        
        <Dropdown>
          <DropdownTrigger>
            <Button variant="outline" size="sm" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownTrigger>
          <DropdownContent>
            {table.getAllColumns().filter(c => c.getCanHide()).map((col) => (
              <label key={col.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={col.getIsVisible()}
                  onChange={() => col.toggleVisibility()}
                  className="h-4 w-4"
                />
                <span className="capitalize text-sm">{col.id}</span>
              </label>
            ))}
          </DropdownContent>
        </Dropdown>
      </div>
      
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {table.getState().columnFilters.map((filter) => (
            <div key={filter.id} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-sm">
              <span className="font-medium">{filter.id}:</span>
              <span>{filter.value}</span>
              <button onClick={() => table.getColumn(filter.id)?.setFilterValue(undefined)} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ Pagination Component ============
const Pagination = ({ table }) => {
  const { pageSize, pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  
  return (
    <div className="flex items-center justify-between px-4 py-4 border-t">
      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-500">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-sm text-slate-500 mr-4">Page {pageIndex + 1} of {pageCount}</div>
        <Button variant="outline" size="icon" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// ============ Dummy Data ============
const generateData = () => {
  const statuses = ["Active", "Inactive", "Pending", "Suspended"];
  const roles = ["Admin", "User", "Manager", "Guest"];
  const departments = ["Engineering", "Sales", "Marketing", "Support", "HR"];
  const firstNames = ["John", "Jane", "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"];
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: `usr_${String(i + 1).padStart(5, "0")}`,
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    email: `user${i + 1}@example.com`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    salary: Math.floor(Math.random() * 100000) + 40000,
    joinDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toLocaleDateString(),
  }));
};

// ============ Main DataGrid Demo ============
export default function DataGridDemo() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    setTimeout(() => {
      setData(generateData());
      setLoading(false);
    }, 1000);
  }, []);
  
  const columns = React.useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      id: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      id: "email",
      header: "Email",
    },
    {
      accessorKey: "status",
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        const colors = {
          Active: "bg-green-100 text-green-800",
          Inactive: "bg-gray-100 text-gray-800",
          Pending: "bg-yellow-100 text-yellow-800",
          Suspended: "bg-red-100 text-red-800",
        };
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colors[status]}`}>
            {status}
          </span>
        );
      },
      filterVariant: "select",
      filterOptions: ["Active", "Inactive", "Pending", "Suspended"],
    },
    {
      accessorKey: "role",
      id: "role",
      header: "Role",
      filterVariant: "select",
      filterOptions: ["Admin", "User", "Manager", "Guest"],
    },
    {
      accessorKey: "department",
      id: "department",
      header: "Department",
      filterVariant: "select",
      filterOptions: ["Engineering", "Sales", "Marketing", "Support", "HR"],
    },
    {
      accessorKey: "salary",
      id: "salary",
      header: "Salary",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("salary"));
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
      },
    },
    {
      accessorKey: "joinDate",
      id: "joinDate",
      header: "Join Date",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <RowActions row={row} />,
      enableSorting: false,
      enableHiding: false,
    },
  ], []);
  
  const columnsWithHeader = columns.map(col => ({
    ...col,
    header: typeof col.header === "string" ? ({ column }) => <ColumnHeader column={column} title={col.header} /> : col.header,
  }));
  
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  
  const table = useReactTable({
    data,
    columns: columnsWithHeader,
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });
  
  const isEmpty = table.getFilteredRowModel().rows.length === 0;
  
  return (
    <div className="w-full p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Advanced DataGrid</h1>
          <p className="text-slate-600">
            Featuring sorting, filtering, pagination, row selection, and more
          </p>
        </div>
        
        <div className="border rounded-lg bg-white shadow-sm">
          <Toolbar table={table} columns={columns.filter(c => c.id !== "select" && c.id !== "actions")} />
          
          <div className="relative">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id}>
                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columnsWithHeader.length}>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-12"
                      >
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-4" />
                        <p className="text-sm text-slate-500">Loading data...</p>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                ) : isEmpty ? (
                  <TableRow>
                    <TableCell colSpan={columnsWithHeader.length}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-12 text-center"
                      >
                        <div className="rounded-full bg-slate-100 p-3 mb-4">
                          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No results found</h3>
                        <p className="text-sm text-slate-500">Try adjusting your search or filter</p>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {table.getRowModel().rows.map((row, i) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, delay: i * 0.02 }}
                        className="border-b transition-colors hover:bg-slate-50"
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>
          
          {!loading && !isEmpty && <Pagination table={table} />}
        </div>
      </div>
    </div>
  );
}