import React, { useState } from "react";
import {
  Search,
  Download,
  Settings,
  Eye,
  RotateCcw,
  Sun,
  Moon,
  Grid3x3,
  Rows,
  Columns,
  FileSpreadsheet,
  FileJson,
  FileDown,
  Pin,
  Check,
  Layers,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActiveFilters } from "@/components/Datagrid/AdvancedColumnFilter";
import { useTheme } from "@/components/ThemeProvider";

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
        backgroundColor: "var(--color-muted)",
        borderBottomColor: "var(--color-border)",
      }}
    >
      <div className="flex flex-col gap-3 p-4">
        {/* Top Row - Search and Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Global Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "var(--color-muted-foreground)" }}
            />
            <Input
              placeholder="Search all columns..."
              defaultValue={globalFilter ?? ""}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              className="pl-9"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                color: "var(--color-foreground)",
              }}
            />
          </div>

          {/* Refresh */}
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              className="border-2 shadow-sm bg-background"
              style={{ color: "var(--color-foreground)" }}
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
              className="border-2 shadow-sm bg-background"
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
                className="border-2 shadow-sm bg-background"
                style={{ borderColor: "var(--color-border)" }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
                className="border-2 shadow-sm bg-background"
              >
                <Settings className="h-4 w-4 mr-2" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel style={{ color: "var(--color-foreground)" }}>
                APPEARANCE
              </DropdownMenuLabel>

              <DropdownMenuItem
                onClick={toggleTheme}
                className="cursor-pointer"
              >
                {theme === "dark" ? (
                  <>
                    <Sun
                      className="h-4 w-4 mr-2"
                      style={{ color: "var(--color-chart-3)" }}
                    />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon
                      className="h-4 w-4 mr-2"
                      style={{ color: "var(--color-foreground)" }}
                    />
                    Dark Mode
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel style={{ color: "var(--color-foreground)" }}>
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

              <DropdownMenuLabel style={{ color: "var(--color-foreground)" }}>
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
                className="border-2 shadow-sm bg-background"
              >
                <Eye className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel style={{ color: "var(--color-foreground)" }}>
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
                        className="flex items-center justify-between px-2 py-2 rounded bg-background"
                        style={{
                          backgroundColor: "transparent",
                        }}
                      >
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={col.getIsVisible()}
                            onChange={() => col.toggleVisibility()}
                            className="h-4 w-4 rounded border-2"
                            style={{
                              borderColor: "var(--color-border)",
                              accentColor: "var(--color-primary)",
                            }}
                          />
                          <span
                            className="text-sm capitalize"
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
                              className="p-1 rounded transition-colors bg-background"
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
                              className="p-1 rounded transition-colors bg-background"
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
                className="cursor-pointer"
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
                className="border-2 shadow-sm bg-background"
              >
                <Layers className="h-4 w-4 mr-2" />
                Group
                {table.getState().grouping.length > 0 &&
                  ` (${table.getState().grouping.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel style={{ color: "var(--color-foreground)" }}>
                GROUP BY COLUMN
              </DropdownMenuLabel>
              {table
                .getAllColumns()
                .filter((col) => col.getCanGroup && col.getCanGroup())
                .map((col) => {
                  const isGrouped = table.getState().grouping.includes(col.id);
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
                    className="cursor-pointer"
                    style={{ color: "var(--color-destructive)" }}
                  >
                    Clear All Grouping
                  </DropdownMenuItem>
                </>
              )}
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
