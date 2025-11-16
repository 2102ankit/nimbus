import {
  Check,
  Columns,
  Download,
  Eye,
  FileDown,
  FileJson,
  FileSpreadsheet,
  Grid3x3,
  Moon,
  Pin,
  RotateCcw,
  Rows,
  Search,
  Settings,
  Sun,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { ActiveFilters } from "../Datagrid/AdvancedColumnFilter";
import { useTheme } from "../ThemeProvider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function EnhancedToolbar({
  table,
  columns,
  onExport,
  onResetPreferences,
  onRefresh,
  globalFilter,
  onGlobalFilterChange,
}) {
  const {
    theme,
    toggleTheme,
    density,
    setDensity,
    showGridLines,
    toggleGridLines,
    showHeaderLines,
    toggleHeaderLines,
    showRowLines,
    toggleRowLines,
  } = useTheme();

  const [searchDebounce, setSearchDebounce] = useState(null);

  const handleGlobalSearch = (value) => {
    if (searchDebounce) clearTimeout(searchDebounce);
    const timeout = setTimeout(() => {
      onGlobalFilterChange(value);
    }, 300);
    setSearchDebounce(timeout);
  };

  const clearAllFilters = () => {
    table.resetColumnFilters();
    table.resetSorting();
    onGlobalFilterChange("");
  };

  const hasFilters =
    table.getState().columnFilters.length > 0 ||
    table.getState().sorting.length > 0 ||
    globalFilter;

  const exportData = (format) => {
    const rows = table.getFilteredRowModel().rows.map((row) => row.original);
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter(
        (col) =>
          col.id !== "select" && col.id !== "actions" && col.id !== "expand"
      )
      .map((col) => ({ id: col.id, header: col.columnDef.header }));

    onExport(format, rows, visibleColumns);
  };

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col gap-3 p-4">
        {/* Top Row - Search and Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Global Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search all columns..."
              defaultValue={globalFilter ?? ""}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Refresh */}
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          {/* Reset All */}
          {hasFilters && (
            <Button onClick={clearAllFilters} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Filters & Sort
            </Button>
          )}

          {/* Export Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportData("csv")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData("excel")}>
                <FileDown className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData("json")}>
                <FileJson className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>APPEARANCE</DropdownMenuLabel>

              <DropdownMenuItem onClick={toggleTheme}>
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>DENSITY</DropdownMenuLabel>
              {["compact", "normal", "comfortable"].map((d) => (
                <DropdownMenuItem key={d} onClick={() => setDensity(d)}>
                  {density === d && <Check className="h-4 w-4 mr-2" />}
                  <span className={density !== d ? "ml-6" : ""}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </span>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuLabel>GRID LINES</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={showGridLines}
                onCheckedChange={toggleGridLines}
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                All Grid Lines
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showHeaderLines}
                onCheckedChange={toggleHeaderLines}
              >
                <Columns className="h-4 w-4 mr-2" />
                Header Lines
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showRowLines}
                onCheckedChange={toggleRowLines}
              >
                <Rows className="h-4 w-4 mr-2" />
                Row Lines
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>COLUMN VISIBILITY & PINNING</DropdownMenuLabel>
              <div className="max-h-96 overflow-auto">
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => {
                    const isPinned = col.getIsPinned();
                    return (
                      <div
                        key={col.id}
                        className="flex items-center justify-between px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                      >
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={col.getIsVisible()}
                            onChange={() => col.toggleVisibility()}
                            className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
                          />
                          <span className="text-sm capitalize">{col.id}</span>
                        </label>
                        {col.getCanPin() && (
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                col.pin(isPinned === "left" ? false : "left");
                              }}
                              className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${
                                isPinned === "left"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-slate-400"
                              }`}
                              title={
                                isPinned === "left"
                                  ? "Unpin from left"
                                  : "Pin to left"
                              }
                            >
                              <Pin className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                col.pin(isPinned === "right" ? false : "right");
                              }}
                              className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${
                                isPinned === "right"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-slate-400"
                              }`}
                              title={
                                isPinned === "right"
                                  ? "Unpin from right"
                                  : "Pin to right"
                              }
                            >
                              <Pin className="h-3.5 w-3.5 rotate-90" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onResetPreferences}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All Preferences
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active Filters */}
        <ActiveFilters table={table} columns={columns} />
      </div>
    </div>
  );
}

export default EnhancedToolbar;
