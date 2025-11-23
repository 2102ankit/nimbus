import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

/**
 * Wrappable cell component with expand functionality
 */
export function WrappableCell({ value, maxLines = 2 }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (value === null || value === undefined) {
        return <span className="text-muted-foreground">-</span>;
    }

    const stringValue = String(value);
    const lines = stringValue.split('\n');
    const isLongText = lines.length > maxLines || stringValue.length > 100;

    if (!isLongText) {
        return (
            <span className="text-sm text-foreground" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                {stringValue}
            </span>
        );
    }

    return (
        <>
            <div
                className="text-sm text-foreground"
                style={{
                    display: '-webkit-box',
                    WebkitLineClamp: maxLines,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                }}
            >
                {stringValue}
            </div>
            <button
                onClick={() => setIsExpanded(true)}
                className="text-xs text-primary hover:underline mt-1"
            >
                ...more
            </button>

            {isExpanded && (
                <CellExpandedModal value={stringValue} onClose={() => setIsExpanded(false)} />
            )}
        </>
    );
}

/**
 * Modal for displaying expanded cell content
 */
export function CellExpandedModal({ value, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-card rounded-xl shadow-2xl p-6 max-w-2xl w-full border border-border max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Full Content</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="overflow-auto flex-1">
                    <pre className="break-words whitespace-pre-wrap text-sm bg-muted/50 text-foreground p-4 rounded-lg font-mono">
                        {value}
                    </pre>
                </div>

                <div className="mt-4 flex justify-end">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/**
 * Nested data viewer for expanded rows
 */
export function NestedDataViewer({ data }) {
    if (!data || typeof data !== 'object') {
        return <span className="text-muted-foreground">-</span>;
    }

    if (Array.isArray(data)) {
        return (
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                <p className="font-semibold text-sm mb-2 text-foreground">Array ({data.length} items)</p>
                <div className="overflow-x-auto">
                    <pre className="text-xs bg-background text-foreground p-2 rounded border border-border overflow-auto max-h-60">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
            <p className="font-semibold text-sm mb-2 text-foreground">Object</p>
            <div className="space-y-1">
                {Object.entries(data).map(([key, val]) => (
                    <div key={key} className="text-sm text-foreground">
                        <span className="font-mono text-primary">{key}:</span>
                        {typeof val === 'object' ? (
                            <pre className="text-xs bg-background text-foreground p-2 rounded border border-border mt-1 overflow-auto">
                                {JSON.stringify(val, null, 2)}
                            </pre>
                        ) : (
                            <span className="ml-2">{String(val)}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}