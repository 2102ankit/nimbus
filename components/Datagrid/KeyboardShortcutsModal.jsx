import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard, Sparkles } from "lucide-react";

export function KeyboardShortcutsModal({ open, onOpenChange }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto"
                style={{ color: "var(--color-muted-foreground)" }}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Keyboard className="h-6 w-6 text-primary" />
                        Features & Keyboard Shortcuts
                    </DialogTitle>
                    <DialogDescription>
                        Learn about all the powerful features and keyboard shortcuts available in the DataGrid
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Features Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 font-semibold text-base">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Features
                        </div>
                        <ul className="space-y-2 ml-6 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Advanced Column Filters with multiple operators</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Multi-Column Sort (Shift+Click headers)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Drag & Drop Column Reordering</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Column Pinning (Left & Right)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Manual Column Resizing</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Row Expansion with details</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Grouping with Aggregations</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Dark Mode & Theme Customization</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Global Search across all columns</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Multi-Row Selection with checkboxes</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Export to CSV, Excel & JSON</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Column Visibility Toggle</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Customizable Density (Compact/Normal/Comfortable)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Grid Lines Customization</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Pagination with configurable page sizes</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Persistent Preferences (auto-saved)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Fullscreen Mode for focused viewing</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Status Bar with selection summary</span>
                            </li>
                        </ul>
                    </div>

                    {/* Keyboard Shortcuts Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 font-semibold text-base">
                            <Keyboard className="h-4 w-4 text-primary" />
                            Keyboard Shortcuts
                        </div>
                        <div className="space-y-2 ml-6 text-sm">
                            <div className="flex items-center gap-3">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm min-w-[80px] text-center">
                                    PageUp/Dn
                                </kbd>
                                <span>Navigate pages</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm min-w-[80px] text-center">
                                    /
                                </kbd>
                                <span>Focus global search</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm min-w-[80px] text-center">
                                    R
                                </kbd>
                                <span>Refresh data</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm min-w-[80px] text-center">
                                    V
                                </kbd>
                                <span>Open view menu</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm min-w-[80px] text-center">
                                    C
                                </kbd>
                                <span>Open columns menu</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm min-w-[80px] text-center">
                                    G
                                </kbd>
                                <span>Open groups menu</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm min-w-[80px] text-center">
                                    r
                                </kbd>
                                <span>Rows per page</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm min-w-[80px] text-center">
                                    E
                                </kbd>
                                <span>Export menu</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm min-w-[80px] text-center">
                                    c/e/j
                                </kbd>
                                <span className="text-xs text-muted-foreground">Then CSV/Excel/JSON</span>
                            </div>
                            {/* <div className="flex items-center gap-3">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm min-w-[80px] text-center">
                                    ?
                                </kbd>
                                <span>Show this dialog</span>
                            </div> */}
                            <div className="flex items-center gap-3">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm min-w-[80px] text-center">
                                    F
                                </kbd>
                                <span>Toggle fullscreen</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm min-w-[80px] text-center">
                                    S
                                </kbd>
                                <span>Toggle status bar</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm min-w-[80px] text-center">
                                    I
                                </kbd>
                                <span>Toggle shortcuts modal</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm min-w-[80px] text-center">
                                    Esc
                                </kbd>
                                <span>Exit fullscreen</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm min-w-[80px] text-center">
                                    Shift+Click
                                </kbd>
                                <span>Multi-column sort</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono shadow-sm min-w-[80px] text-center">
                                    Drag
                                </kbd>
                                <span>Reorder columns</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pro Tips Section */}
                <div className="mt-6 pt-6 border-t">
                    <div className="flex items-start gap-2 text-sm">
                        <span className="text-md">⚫</span>
                        <div>
                            <span className="font-bold">Pro Tips:</span> All preferences (column order, sizing,
                            pinning, sorting) are automatically saved to localStorage. Use the "Reset All
                            Preferences" button in the Columns menu to restore defaults. Shift+Click column
                            headers for multi-column sorting. Drag column headers to reorder them.
                        </div>
                    </div>
                    <div className="mt-4 flex items-start gap-2 text-sm">
                        <span className="text-md">⚫</span>
                        <div>
                            <span className="font-bold">Filter Tips:</span> Use advanced column filters with operators like
                            contains, equals, starts with, ends with, greater than, less than, and more. Combine multiple
                            filters for precise data analysis.
                        </div>
                    </div>
                    <div className="mt-4 flex items-start gap-2 text-sm">
                        <span className="text-md">⚫</span>
                        <div>
                            <span className="font-bold">Performance:</span> All operations are optimized for large datasets.
                            Filtering, sorting, and grouping happen instantly even with hundreds of rows.
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default KeyboardShortcutsModal;
