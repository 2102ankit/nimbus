// src/components/DataGrid/DataGridToolbar.jsx
import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { Eye, EyeOff, SunMoon } from "lucide-react";

export default function DataGridToolbar({
  table,
  globalFilter,
  setGlobalFilter,
  pageSize,
  setPageSize,
}) {
  const allLeaf = table.getAllLeafColumns();

  function toggleDark() {
    const html = document.documentElement;
    html.classList.toggle("dark");
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Global search..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />

        <Select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {[5, 10, 20, 50].map((s) => (
            <option key={s} value={s}>
              Show {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {allLeaf.map((col) => (
          <Button
            key={col.id}
            variant="ghost"
            size="sm"
            onClick={() => col.toggleVisibility()}
            className="flex items-center gap-1"
          >
            {col.getIsVisible() ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            <span className="hidden sm:inline text-xs">
              {col.columnDef.header}
            </span>
          </Button>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDark}
          title="Toggle dark"
        >
          <SunMoon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
