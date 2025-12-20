import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function StatusBarModal({ table, rowSelection, open, onOpenChange, filename }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto"
                style={{ color: "var(--color-muted-foreground)" }}

            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Info className="h-5 w-5 text-primary" />
                        Table Status
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">File</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="font-medium truncate max-w-[300px] cursor-help">{filename || "No file loaded"}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{filename || "No file loaded"}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Rows</span>
                        <span className="font-medium">{table.getFilteredRowModel().rows.length.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Visible Rows</span>
                        <span className="font-medium">{table.getPaginationRowModel().rows.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Selected Rows</span>
                        <span className="font-medium">{Object.keys(rowSelection).length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Page</span>
                        <span className="font-medium">
                            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Rows per page</span>
                        <span className="font-medium">{table.getState().pagination.pageSize}</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default StatusBarModal;
