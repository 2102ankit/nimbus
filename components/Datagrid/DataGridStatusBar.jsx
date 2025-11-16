import React from "react";
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
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Selected",
      value: selectedRows,
      icon: CheckSquare,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Active Filters",
      value: activeFilters,
      icon: Filter,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "Grouped By",
      value: groupedColumns || "-",
      icon: Layers,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Sort Columns",
      value: sortedColumns || "-",
      icon: SortAsc,
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
    },
  ];

  return (
    <div className="p-5 rounded-lg border-2 bg-card border-border shadow-lg">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-lg p-4 border-2 border-transparent hover:border-primary/30 transition-all hover:shadow-md`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${stat.color}`} />
                <div className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
                  {stat.label}
                </div>
              </div>
              <div className={`text-3xl font-bold ${stat.color}`}>
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
