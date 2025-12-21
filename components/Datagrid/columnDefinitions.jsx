import { ColumnHeader } from "@/components/Datagrid/ColumnHeader";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight, Pin, PinOff, GripVertical } from "lucide-react";
import { useRowDrag } from "./RowDragContext";

export const createColumns = (dynamicColumns) => {
  const dragAndPinColumns = [
    {
      id: "drag",
      header: "",
      cell: ({ row }) => {
        const { attributes, listeners } = useRowDrag();
        return (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground flex justify-center"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        );
      },
      size: 40,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      enablePinning: false,
      enableReordering: false,
      enableColumnFilter: false,
      enableDrag: false,
    },
    {
      id: "pin",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => row.pin(row.getIsPinned() ? false : 'top')}
          className="p-1 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
          title={row.getIsPinned() ? "Unpin row" : "Pin row to top"}
        >
          {row.getIsPinned() ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
        </button>
      ),
      size: 40,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      enablePinning: false,
      enableReordering: false,
      enableColumnFilter: false,
      enableDrag: false,
    },
  ];

  if (dynamicColumns && dynamicColumns.length > 0) {
    return [...dragAndPinColumns, ...dynamicColumns];
  }

  return [
    ...dragAndPinColumns,
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={String(table.getIsSomePageRowsSelected())}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
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
    },
    {
      id: "expand",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => row.toggleExpanded()}
          className="p-1 rounded-md transition-colors"
          style={{
            backgroundColor:
              "color-mix(in oklch, var(--color-muted), transparent 90%)",
            color: "var(--color-foreground)",
          }}
          onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor =
            "color-mix(in oklch, var(--color-muted), transparent 70%)")
          }
          onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor =
            "color-mix(in oklch, var(--color-muted), transparent 90%)")
          }
        >
          {row.getIsExpanded() ? (
            <ChevronDown
              className="h-4 w-4"
              style={{ color: "var(--color-muted-foreground)" }}
            />
          ) : (
            <ChevronRight
              className="h-4 w-4"
              style={{ color: "var(--color-muted-foreground)" }}
            />
          )}
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
    },
    {
      accessorKey: "id",
      filterFn: "advanced",
      header: "ID",
      size: 200,
      meta: { dataType: "text", headerText: "ID" },
      enableColumnFilter: true,
      enableGrouping: false,
    },
    {
      accessorKey: "name",
      filterFn: "advanced",
      header: "Name",
      size: 200,
      meta: { dataType: "text", headerText: "Name" },
      enableColumnFilter: true,
      enableGrouping: true,
    },
    {
      accessorKey: "email",
      filterFn: "advanced",
      header: "Email",
      size: 250,
      meta: { dataType: "text", headerText: "Email" },
      enableColumnFilter: true,
      enableGrouping: false,
    },
    {
      accessorKey: "status",
      filterFn: "advanced",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue();
        const colors = {
          Active: {
            bg: "color-mix(in oklch, var(--color-chart-2), transparent 90%)",
            text: "var(--color-chart-2)",
            border: "color-mix(in oklch, var(--color-chart-2), transparent 70%)",
          },
          Inactive: {
            bg: "var(--color-muted)",
            text: "var(--color-muted-foreground)",
            border: "var(--color-border)",
          },
          Pending: {
            bg: "color-mix(in oklch, var(--color-chart-3), transparent 90%)",
            text: "var(--color-chart-3)",
            border: "color-mix(in oklch, var(--color-chart-3), transparent 70%)",
          },
          Suspended: {
            bg: "color-mix(in oklch, var(--color-destructive), transparent 90%)",
            text: "var(--color-destructive)",
            border:
              "color-mix(in oklch, var(--color-destructive), transparent 70%)",
          },
        };

        const style = colors[status] || colors.Inactive;

        return (
          <Badge
            className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm border-2"
            style={{
              backgroundColor: style.bg,
              color: style.text,
              borderColor: style.border,
            }}
          >
            {status}
          </Badge>
        );
      },
      size: 200,
      meta: { dataType: "text", headerText: "Status" },
      enableColumnFilter: true,
      enableGrouping: true,
      aggregationFn: "count",
      aggregatedCell: ({ getValue }) => (
        <span className="font-bold" style={{ color: "var(--color-primary)" }}>
          {getValue()} items
        </span>
      ),
    },
    {
      accessorKey: "role",
      filterFn: "advanced",
      header: "Role",
      size: 200,
      meta: { dataType: "text", headerText: "Role" },
      enableColumnFilter: true,
      enableGrouping: true,
    },
    {
      accessorKey: "department",
      filterFn: "advanced",
      header: "Department",
      size: 250,
      meta: { dataType: "text", headerText: "Department" },
      enableColumnFilter: true,
      enableGrouping: true,
    },
    {
      accessorKey: "salary",
      filterFn: "advanced",
      header: "Salary",
      cell: ({ getValue }) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(getValue()),
      size: 200,
      meta: { dataType: "number", headerText: "Salary" },
      enableColumnFilter: true,
      aggregationFn: "sum",
      aggregatedCell: ({ getValue }) => (
        <span className="font-bold" style={{ color: "var(--color-chart-2)" }}>
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
      filterFn: "advanced",
      header: "Performance",
      cell: ({ getValue }) => {
        const value = getValue();
        const getColor = (val) => {
          if (val >= 80) return "var(--color-chart-2)"; // green
          if (val >= 60) return "var(--color-primary)"; // blue
          if (val >= 40) return "var(--color-chart-3)"; // yellow
          return "var(--color-destructive)"; // red
        };

        return (
          <div className="flex items-center gap-2">
            <div
              className="flex-1 rounded-full h-2.5 overflow-hidden"
              style={{ backgroundColor: "var(--color-muted)" }}
            >
              <div
                className="h-2.5 rounded-full transition-all duration-150"
                style={{
                  backgroundColor: getColor(value),
                  width: `${value}%`,
                }}
              />
            </div>
            <span
              className="text-xs font-bold w-10"
              style={{ color: "var(--color-foreground)" }}
            >
              {value}%
            </span>
          </div>
        );
      },
      size: 250,
      meta: { dataType: "number", headerText: "Performance" },
      enableColumnFilter: true,
      aggregationFn: "mean",
      aggregatedCell: ({ getValue }) => (
        <span className="font-bold" style={{ color: "var(--color-primary)" }}>
          Avg: {Math.round(getValue())}%
        </span>
      ),
    },
    {
      accessorKey: "joinDate",
      filterFn: "advanced",
      header: "Join Date",
      size: 250,
      meta: { dataType: "date", headerText: "Join Date" },
      enableColumnFilter: true,
    },
  ];
};

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
            enableSort={col.enableSorting}
            enableFilter={col.enableColumnFilter}
            enableResize={col.enableResizing}
            enableDrag={col.enableDrag}
          />
        )
        : col.header,
  }));
};
