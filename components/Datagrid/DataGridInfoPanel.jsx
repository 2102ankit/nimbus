import React from "react";
import { Info, Keyboard, Sparkles } from "lucide-react";

export function DataGridInfoPanel() {
  return (
    <div className="p-5 rounded-lg border-2 bg-background shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg text-foreground">
          Features & Keyboard Shortcuts
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800 dark:text-blue-300">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-semibold text-base text-blue-900 dark:text-blue-200">
            <Sparkles className="h-4 w-4" />
            Features
          </div>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                •
              </span>
              <span>Advanced Column Filters with multiple operators</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                •
              </span>
              <span>Multi-Column Sort (Shift+Click headers)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                •
              </span>
              <span>Drag & Drop Column Reordering</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                •
              </span>
              <span>Column Pinning (Left & Right)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                •
              </span>
              <span>Manual Column Resizing (drag edges)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                •
              </span>
              <span>Row Expansion with details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                •
              </span>
              <span>Grouping with Aggregations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                •
              </span>
              <span>Dark Mode & Theme Customization</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 font-semibold text-base text-blue-900 dark:text-blue-200">
            <Keyboard className="h-4 w-4" />
            Shortcuts
          </div>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <kbd className="px-2 py-1 bg-background rounded text-xs font-mono shadow-sm">
                Shift+Click
              </kbd>
              <span>header for multi-sort</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                •
              </span>
              <span>Drag column headers to reorder</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                •
              </span>
              <span>Drag column edges to resize</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                •
              </span>
              <span>Click filter icon for advanced filters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                •
              </span>
              <span>Use pin buttons in column menu</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                •
              </span>
              <span>Toggle dark mode with sun/moon icon</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                •
              </span>
              <span>Customize density & grid lines in View menu</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-400">
          <span className="text-xl">💡</span>
          <div>
            <span className="font-bold">Pro Tips:</span> All preferences (column
            order, sizing, pinning, sorting) are automatically saved to
            localStorage. Use the "Reset All Preferences" button in the Columns
            menu to restore defaults. Click the theme toggle button (sun/moon
            icon) in the toolbar to instantly switch between light and dark
            modes!
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataGridInfoPanel;
