import { ChevronDown, ChevronRight } from "lucide-react";
import { ColumnHeader } from "../Datagrid/ColumnHeader";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";

export const createColumns = () => [
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
    enableColumnFilter: false,
  },
  {
    id: "expand",
    header: "",
    cell: ({ row }) => (
      <button
        onClick={() => row.toggleExpanded()}
        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
      >
        {row.getIsExpanded() ? (
          <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        )}
      </button>
    ),
    size: 150,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    size: 150,
    meta: { dataType: "text", headerText: "ID" },
    enableColumnFilter: true,
    enableGrouping: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    size: 200,
    meta: { dataType: "text", headerText: "Name" },
    enableColumnFilter: true,
    enableGrouping: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 250,
    meta: { dataType: "text", headerText: "Email" },
    enableColumnFilter: true,
    enableGrouping: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue();
      const colors = {
        Active:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-300 dark:border-green-700",
        Inactive: "bg-muted text-muted-foreground border-border",
        Pending:
          "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-amber-300 dark:border-amber-700",
        Suspended: "bg-destructive/10 text-destructive border-destructive/30",
      };
      return (
        <Badge
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm border-2 ${colors[status]}`}
        >
          {status}
        </Badge>
      );
    },
    size: 130,
    meta: { dataType: "text", headerText: "Status" },
    enableColumnFilter: true,
    enableGrouping: true,
    aggregationFn: "count",
    aggregatedCell: ({ getValue }) => (
      <span className="font-bold text-blue-700 dark:text-blue-400">
        {getValue()} items
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    size: 130,
    meta: { dataType: "text", headerText: "Role" },
    enableColumnFilter: true,
    enableGrouping: true,
  },
  {
    accessorKey: "department",
    header: "Department",
    size: 150,
    meta: { dataType: "text", headerText: "Department" },
    enableColumnFilter: true,
    enableGrouping: true,
  },
  {
    accessorKey: "salary",
    header: "Salary",
    cell: ({ getValue }) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(getValue()),
    size: 150,
    meta: { dataType: "number", headerText: "Salary" },
    enableColumnFilter: true,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => (
      <span className="font-bold text-green-700 dark:text-green-400">
        Total:{" "}
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(getValue())}
      </span>
    ),
  },
  {
    accessorKey: "performance",
    header: "Performance",
    cell: ({ getValue }) => {
      const value = getValue();
      const getColor = (val) => {
        if (val >= 80) return "bg-green-500 dark:bg-green-400";
        if (val >= 60) return "bg-blue-500 dark:bg-blue-400";
        if (val >= 40) return "bg-yellow-500 dark:bg-yellow-400";
        return "bg-red-500 dark:bg-red-400";
      };

      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div
              className={`${getColor(
                value,
              )} h-2.5 rounded-full transition-all duration-300`}
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-xs font-bold w-10 text-slate-700 dark:text-slate-300">
            {value}%
          </span>
        </div>
      );
    },
    size: 180,
    meta: { dataType: "number", headerText: "Performance" },
    enableColumnFilter: true,
    aggregationFn: "mean",
    aggregatedCell: ({ getValue }) => (
      <span className="font-bold text-blue-700 dark:text-blue-400">
        Avg: {Math.round(getValue())}%
      </span>
    ),
  },
  {
    accessorKey: "joinDate",
    header: "Join Date",
    size: 150,
    meta: { dataType: "date", headerText: "Join Date" },
    enableColumnFilter: true,
  },
];

export const addHeadersToColumns = (columns) => {
  return columns.map((col) => ({
    ...col,
    header:
      typeof col.header === "string"
        ? ({ column, table, header }) => (
            <ColumnHeader
              header={header}
              column={column}
              title={col.header}
              table={table}
              dataType={col.meta?.dataType}
            />
          )
        : col.header,
  }));
};
