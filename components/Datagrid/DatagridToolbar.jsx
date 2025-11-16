import {
  Check,
  Columns,
  Download,
  Eye,
  FileDown,
  FileJson,
  FileSpreadsheet,
  Grid3x3,
  Layers,
  Moon,
  Pin,
  RotateCcw,
  Rows,
  Search,
  Settings,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../ThemeProvider";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { ActiveFilters } from "./AdvancedColumnFilter";

export function DataGridToolbar({
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
    table.setGrouping([]);
    onGlobalFilterChange("");
  };

  const hasFilters =
    table.getState().columnFilters.length > 0 ||
    table.getState().sorting.length > 0 ||
    table.getState().grouping.length > 0 ||
    globalFilter;

  const exportData = (format) => {
    const rows = table.getFilteredRowModel().rows.map((row) => row.original);
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter(
        (col) =>
          col.id !== "select" && col.id !== "actions" && col.id !== "expand"
      )
      .map((col) => ({
        id: col.id,
        header: col.columnDef.meta?.headerText || col.id,
      }));

    onExport(format, rows, visibleColumns);
  };

  return (
    <div
      className="border-b-2"
      style={{
        background: `linear-gradient(to right, 
          color-mix(in oklch, var(--color-muted), transparent 90%), 
          color-mix(in oklch, var(--color-background), transparent 95%))`,
        borderBottomColor: "var(--color-border)",
      }}
    >
      <div className="flex flex-col gap-4 p-2">
        {/* Top Row - Search and Actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Global Search */}
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "var(--color-muted-foreground)" }}
            />
            <Input
              placeholder="Search all columns..."
              defaultValue={globalFilter ?? ""}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              className="pl-10 h-11 border-2 shadow-sm focus:ring-2"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                color: "var(--color-foreground)",
                ringColor: "var(--color-ring)",
              }}
            />
          </div>

          <div className="flex gap-3">
            {/* Refresh */}
            {onRefresh && (
              <Button
                onClick={onRefresh}
                variant="outline"
                size="sm"
                className="h-11 border-2 shadow-sm bg-background"
                style={{ borderColor: "var(--color-border)" }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}

            {/* Reset All */}
            {hasFilters && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                size="sm"
                className="h-11 border-2 shadow-sm bg-background"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
            )}

            {/* Export Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 border-2 shadow-sm bg-background"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 shadow-lg">
                <DropdownMenuItem
                  onClick={() => exportData("csv")}
                  className="cursor-pointer"
                >
                  <FileSpreadsheet
                    className="h-4 w-4 mr-2"
                    style={{ color: "var(--color-chart-2)" }}
                  />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exportData("excel")}
                  className="cursor-pointer"
                >
                  <FileDown
                    className="h-4 w-4 mr-2"
                    style={{ color: "var(--color-primary)" }}
                  />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exportData("json")}
                  className="cursor-pointer"
                >
                  <FileJson
                    className="h-4 w-4 mr-2"
                    style={{ color: "var(--color-chart-5)" }}
                  />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 border-2 shadow-sm bg-background"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-lg">
                <DropdownMenuLabel
                  className="text-xs font-bold"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  DENSITY
                </DropdownMenuLabel>
                {["compact", "normal", "comfortable"].map((d) => (
                  <DropdownMenuItem
                    key={d}
                    onClick={() => setDensity(d)}
                    className="cursor-pointer"
                  >
                    {density === d && (
                      <Check
                        className="h-4 w-4 mr-2"
                        style={{ color: "var(--color-primary)" }}
                      />
                    )}
                    <span className={density !== d ? "ml-6" : ""}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </span>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuLabel
                  className="text-xs font-bold"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  GRID LINES
                </DropdownMenuLabel>
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

            {/* Column Visibility & Pinning */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 border-2 shadow-sm bg-background"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 shadow-lg">
                <DropdownMenuLabel
                  className="text-xs font-bold"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  COLUMN VISIBILITY & PINNING
                </DropdownMenuLabel>
                <div className="max-h-96 overflow-auto">
                  {table
                    .getAllColumns()
                    .filter((col) => col.getCanHide())
                    .map((col) => {
                      const isPinned = col.getIsPinned();
                      return (
                        <div
                          key={col.id}
                          className="flex items-center justify-between px-3 py-2.5 rounded-md mx-1 transition-colors bg-background"
                          style={{
                            backgroundColor: "transparent",
                          }}
                        >
                          <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={col.getIsVisible()}
                              onChange={() => col.toggleVisibility()}
                              className="h-4 w-4 rounded border-2 text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-ring)]"
                              style={{
                                borderColor: "var(--color-border)",
                              }}
                            />
                            <span
                              className="text-sm capitalize font-medium"
                              style={{ color: "var(--color-foreground)" }}
                            >
                              {col.id}
                            </span>
                          </label>
                          {col.getCanPin() && (
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  col.pin(isPinned === "left" ? false : "left");
                                }}
                                className="p-1.5 rounded-md transition-colors bg-background"
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
                                  col.pin(
                                    isPinned === "right" ? false : "right"
                                  );
                                }}
                                className="p-1.5 rounded-md transition-colors bg-background"
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
                <DropdownMenuItem
                  onClick={onResetPreferences}
                  className="cursor-pointer font-medium"
                  style={{ color: "var(--color-destructive)" }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All Preferences
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Grouping */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 border-2 shadow-sm bg-background"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Group
                  {table.getState().grouping.length > 0 &&
                    ` (${table.getState().grouping.length})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-lg">
                <DropdownMenuLabel
                  className="text-xs font-bold"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  GROUP BY COLUMN
                </DropdownMenuLabel>
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanGroup && col.getCanGroup())
                  .map((col) => {
                    const isGrouped = table
                      .getState()
                      .grouping.includes(col.id);
                    return (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        checked={isGrouped}
                        onCheckedChange={() => {
                          const grouping = table.getState().grouping;
                          table.setGrouping(
                            isGrouped
                              ? grouping.filter((g) => g !== col.id)
                              : [...grouping, col.id]
                          );
                        }}
                      >
                        <span className="capitalize">{col.id}</span>
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                {table.getState().grouping.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => table.setGrouping([])}
                      className="cursor-pointer font-medium"
                      style={{ color: "var(--color-destructive)" }}
                    >
                      Clear All Grouping
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="icon"
              className="h-11 w-11 border-2 shadow-sm transition-all bg-background ml-4"
              style={{
                borderColor: "var(--color-border)",
              }}
              title={
                theme === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"
              }
            >
              {theme === "dark" ? (
                <Sun
                  className="h-5 w-5"
                  style={{ color: "var(--color-chart-3)" }}
                />
              ) : (
                <Moon
                  className="h-5 w-5"
                  style={{ color: "var(--color-foreground)" }}
                />
              )}
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        <ActiveFilters table={table} columns={columns} />
      </div>
    </div>
  );
}

export default DataGridToolbar;
