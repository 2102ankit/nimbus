import { BarChart3, CheckSquare, Filter, Layers, SortAsc } from "lucide-react";

export function DataGridStatusBar({ table }) {
  const totalRows = table.getFilteredRowModel().rows.length;
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;
  const activeFilters = table.getState().columnFilters.length;
  const groupedColumns = table.getState().grouping.length;
  const sortedColumns = table.getState().sorting.length;

  const stats = [
    {
      label: "Total Rows",
      value: totalRows,
      icon: BarChart3,
      colorVar: "primary",
    },
    {
      label: "Selected",
      value: selectedRows,
      icon: CheckSquare,
      colorVar: "chart-2", // green
    },
    {
      label: "Active Filters",
      value: activeFilters,
      icon: Filter,
      colorVar: "chart-5", // purple
    },
    {
      label: "Grouped By",
      value: groupedColumns || "-",
      icon: Layers,
      colorVar: "chart-3", // amber
    },
    {
      label: "Sort Columns",
      value: sortedColumns || "-",
      icon: SortAsc,
      colorVar: "chart-4", // pink
    },
  ];

  return (
    <div
      className="p-5 rounded-lg border-2 shadow-lg"
      style={{
        backgroundColor: "var(--color-card)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const bgLight = `color-mix(in oklch, var(--color-${stat.colorVar}), transparent 90%)`;
          const bgDark = `color-mix(in oklch, var(--color-${stat.colorVar}), transparent 80%)`;
          const hoverBorder = `color-mix(in oklch, var(--color-${stat.colorVar}), transparent 70%)`;

          return (
            <div
              key={stat.label}
              className="rounded-lg p-4 border-2 border-transparent transition-all hover:shadow-md"
              style={{
                backgroundColor: bgLight,
                borderColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = bgDark;
                e.currentTarget.style.borderColor = hoverBorder;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = bgLight;
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  className="h-4 w-4"
                  style={{ color: `var(--color-${stat.colorVar})` }}
                />
                <div
                  className="text-xs uppercase font-bold"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {stat.label}
                </div>
              </div>
              <div
                className="text-3xl font-bold"
                style={{ color: `var(--color-${stat.colorVar})` }}
              >
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DataGridStatusBar;