import { Layout, Grid3x3 } from "lucide-react";
import { motion } from "motion/react";

export function GridToggle({ isDynamic, onToggle }) {
    return (
        <div className="flex p-1 bg-muted/30 border border-border rounded-xl shadow-none">
            <button 
                onClick={() => onToggle(false)}
                className="relative px-4 py-2 flex items-center gap-2 text-sm font-semibold transition-colors rounded-lg overflow-hidden group"
            >
                {!isDynamic && (
                    <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-background border border-border rounded-lg shadow-none"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <Layout className={`h-4 w-4 relative z-10 ${!isDynamic ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span className={`relative z-10 ${!isDynamic ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                    Advanced
                </span>
            </button>

            <button 
                onClick={() => onToggle(true)}
                className="relative px-4 py-2 flex items-center gap-2 text-sm font-semibold transition-colors rounded-lg overflow-hidden group"
            >
                {isDynamic && (
                    <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-background border border-border rounded-lg shadow-none"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <Grid3x3 className={`h-4 w-4 relative z-10 ${isDynamic ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span className={`relative z-10 ${isDynamic ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                    Dynamic
                </span>
            </button>
        </div>
    );
}
