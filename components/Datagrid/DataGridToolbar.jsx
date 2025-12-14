import { Checkbox } from "@/components/ui/checkbox";
import { getColumnConfig } from "../../src/columnConfigSystem";

import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Columns,
  Download,
  Eye,
  FileDown,
  FileJson,
  FileSpreadsheet,
  Grid3x3,
  Layers,
  Layout,
  Maximize,
  Minimize,
  Moon,
  Pin,
  RotateCcw,
  Rows,
  Search,
  Sun,
  Sigma
} from "lucide-react";
import { ActiveFilters } from "./AdvancedColumnFilter";
import { HotkeyLabel } from "./HotkeyLabel";

export function DataGridToolbar({
  table,
  columns,
  onExport,
  onResetPreferences,
  onRefresh,
  clearAllFilters,
  globalFilter,
  onGlobalFilterChange,
  searchInputRef,
  viewMenuOpen,
  setViewMenuOpen,
  columnsMenuOpen,
  setColumnsMenuOpen,
  groupMenuOpen,
  setGroupMenuOpen,
  exportMenuOpen,
  setExportMenuOpen,
  extraButtons,
  searchInputValue,
  onSearchInputChange,
}) {
  const {
    density,
    theme, toggleTheme,
    setDensity,
    showGridLines,
    toggleGridLines,
    showHeaderLines,
    toggleHeaderLines,
    showRowLines,
    toggleRowLines,
  } = useTheme();

  const getColumnHeaderText = (col) => {
    const columnId = col.id;
    const config = getColumnConfig(columnId);
    if (config?.headerText) return config.headerText;

    const header = col.columnDef?.header || col.columnDef?.meta?.headerText || col.id;
    if (typeof header === 'function' || typeof header === 'object') {
      return col.columnDef?.meta?.headerText || col.columnDef?.meta?.originalKey || col.id;
    }
    return String(header);
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

  const handleAggregationChange = (columnId, aggregationFn) => {
    const column = table.getAllColumns().find(c => c.id === columnId);
    if (column) {
      column.columnDef.aggregationFn = aggregationFn === 'none' ? undefined : aggregationFn;
      table.resetColumnFilters(); // Trigger a re-render
    }
  };

  const getColumnAggregation = (col) => {
    return col.columnDef?.aggregationFn || 'none';
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
              ref={searchInputRef}
              placeholder="(/) Search all columns..."
              value={searchInputValue}           // Live value (instant)
              onChange={onSearchInputChange}
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
            {/* {onRefresh && (
              <Button
                onClick={onRefresh}
                variant="outline"
                size="sm"
                className="h-11 border-2 shadow-sm bg-background"
                style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                <HotkeyLabel hotkey={"R"}>Refresh</HotkeyLabel>
              </Button>
            )} */}

            {/* Reset All */}
            {hasFilters && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                size="sm"
                className="h-11 border-2 shadow-sm bg-background"
                style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                <HotkeyLabel hotkey={"R"}>Reset All</HotkeyLabel>
              </Button>
            )}

            {/* Export Menu */}
            <DropdownMenu open={exportMenuOpen} onOpenChange={setExportMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 border-2 shadow-sm bg-background"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  <HotkeyLabel hotkey={"E"}>Export</HotkeyLabel>
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
            <DropdownMenu open={viewMenuOpen} onOpenChange={setViewMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 border-2 shadow-sm bg-background"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
                >
                  <Layout className="h-4 w-4 mr-2" />
                  <HotkeyLabel hotkey={"V"}>View</HotkeyLabel>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-lg">
                <DropdownMenuLabel
                  className="text-xs font-bold"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  DENSITY
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
                  <DropdownMenuRadioItem value="compact">
                    <Minimize className="h-4 w-4 mr-2" />
                    Compact</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="normal">
                    <Rows className="h-4 w-4 mr-2" />
                    Normal</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="comfortable">
                    <Maximize className="h-4 w-4 mr-2" />
                    Comfortable</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
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
            <DropdownMenu open={columnsMenuOpen} onOpenChange={setColumnsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 border-2 shadow-sm bg-background"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  <HotkeyLabel hotkey={"C"}>Columns</HotkeyLabel>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 shadow-lg overflow-hidden">
                <DropdownMenuLabel
                  className="text-xs font-bold"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  COLUMN VISIBILITY & PINNING
                </DropdownMenuLabel>

                <div className="max-h-72 overflow-auto">
                  {table
                    .getAllColumns()
                    .filter((col) => col.getCanHide())
                    .map((col) => {
                      const isPinned = col.getIsPinned();
                      return (
                        <div
                          key={col.id}
                          className="flex items-center justify-between px-3 py-2.5 rounded-md mx-1 transition-colors hover:bg-muted/50"
                        >
                          <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                            <Checkbox
                              checked={col.getIsVisible()}
                              onCheckedChange={() => col.toggleVisibility()}
                              className="h-4 w-4"
                            />
                            <span className="text-sm font-medium text-foreground truncate">
                              {getColumnHeaderText(col)}
                            </span>
                          </label>
                          {col.getCanPin() && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  col.pin(isPinned === "left" ? false : "left");
                                }}
                                title={isPinned === "left" ? "Unpin from left" : "Pin to left"}
                              >
                                <Pin className={`h-3.5 w-3.5 ${isPinned === "left" ? "text-primary" : ""}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  col.pin(isPinned === "right" ? false : "right");
                                }}
                                title={isPinned === "right" ? "Unpin from right" : "Pin to right"}
                              >
                                <Pin className={`h-3.5 w-3.5 rotate-90 ${isPinned === "right" ? "text-primary" : ""}`} />
                              </Button>
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

            {/* Grouping & Aggregation */}
            <DropdownMenu open={groupMenuOpen} onOpenChange={setGroupMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 border-2 shadow-sm bg-background"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
                >
                  <Layers className="h-4 w-4 mr-2" />
                  <HotkeyLabel hotkey={"G"}>Group</HotkeyLabel>
                  {table.getState().grouping.length > 0 &&
                    ` (${table.getState().grouping.length})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 max-h-96 shadow-lg overflow-auto">
                <DropdownMenuLabel
                  className="text-xs font-bold"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  GROUP BY COLUMN
                </DropdownMenuLabel>
                {table
                  .getAllColumns()
                  .filter((col) => {
                    if (!col.columnDef?.enableGrouping) return false;
                    return col.getCanGroup && col.getCanGroup();
                  })
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
                        <span>{getColumnHeaderText(col)}</span>
                      </DropdownMenuCheckboxItem>
                    );
                  })}

                <DropdownMenuSeparator />

                <DropdownMenuLabel
                  className="text-xs font-bold"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  AGGREGATIONS
                </DropdownMenuLabel>
                {table
                  .getAllColumns()
                  .filter((col) => {
                    const dataType = col.columnDef?.meta?.dataType;
                    return ['number', 'currency', 'percentage'].includes(dataType);
                  })
                  .map((col) => {
                    const currentAgg = getColumnAggregation(col);
                    return (
                      <DropdownMenuSub key={col.id}>
                        <DropdownMenuSubTrigger>
                          <Sigma className="h-4 w-4 mr-2" />
                          <span className="truncate">{getColumnHeaderText(col)}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuRadioGroup
                            value={currentAgg}
                            onValueChange={(value) => handleAggregationChange(col.id, value)}
                          >
                            <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="sum">Sum</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="mean">Average</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="median">Median</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="min">Minimum</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="max">Maximum</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="count">Count</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
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
            {extraButtons}
          </div>
        </div>

        {/* Active Filters */}
        <ActiveFilters table={table} columns={columns} />
      </div>
    </div>
  );
}

export default DataGridToolbar;