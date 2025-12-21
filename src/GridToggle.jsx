import { Layout, Grid3x3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";

export function GridToggle() {
    const location = useLocation();
    const isBeta = location.pathname === "/beta";

    return (
        <div className="flex p-1 bg-muted/30 border border-border rounded-xl shadow-none">
            <Link to="/" className="relative px-4 py-2 flex items-center gap-2 text-sm font-semibold transition-colors rounded-lg overflow-hidden group">
                {location.pathname === "/" && (
                    <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-background border border-border rounded-lg shadow-none"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <Layout className={`h-4 w-4 relative z-10 ${location.pathname === "/" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span className={`relative z-10 ${location.pathname === "/" ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                    Regular
                </span>
            </Link>

            <Link to="/beta" className="relative px-4 py-2 flex items-center gap-2 text-sm font-semibold transition-colors rounded-lg overflow-hidden group">
                {location.pathname === "/beta" && (
                    <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-background border border-border rounded-lg shadow-none"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <Grid3x3 className={`h-4 w-4 relative z-10 ${location.pathname === "/beta" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span className={`relative z-10 ${location.pathname === "/beta" ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                    Dynamic
                </span>
            </Link>
        </div>
    );
}
