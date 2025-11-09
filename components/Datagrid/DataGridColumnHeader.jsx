import * as React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, EyeOff } from "lucide-react";
import { motion } from "motion/react";

const Button = ({ children, variant = "ghost", size = "sm", className = "", ...props }) => {
  const variants = {
    ghost: "hover:bg-slate-100",
  };
  const sizes = {
    sm: "h-8 px-2 text-xs",
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);
  
  return (
    <div ref={ref} className="relative">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { open, setOpen })
      )}
    </div>
  );
};

const DropdownMenuTrigger = ({ children, open, setOpen }) => {
  return React.cloneElement(children, {
    onClick: (e) => {
      e.stopPropagation();
      setOpen(!open);
    },
  });
};

const DropdownMenuContent = ({ children, open, setOpen }) => {
  if (!open) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="absolute right-0 z-50 mt-2 w-40 rounded-md border border-slate-200 bg-white p-1 shadow-md"
    >
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { setOpen })
      )}
    </motion.div>
  );
};

const DropdownMenuItem = ({ children, onClick, setOpen, className = "" }) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
        setOpen?.(false);
      }}
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 ${className}`}
    >
      {children}
    </div>
  );
};

const DropdownMenuSeparator = () => (
  <div className="my-1 h-px bg-slate-100" />
);

export function DataGridColumnHeader({ column, title, className = "" }) {
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>;
  }
  
  const isSorted = column.getIsSorted();
  
  const SortIcon = () => {
    if (isSorted === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    if (isSorted === "desc") {
      return <ArrowDown className="ml-2 h-4 w-4" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-slate-100"
          >
            <span>{title}</span>
            <motion.div
              animate={{
                rotate: isSorted === "desc" ? 180 : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              <SortIcon />
            </motion.div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="mr-2 h-3.5 w-3.5 text-slate-500" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="mr-2 h-3.5 w-3.5 text-slate-500" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="mr-2 h-3.5 w-3.5 text-slate-500" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default DataGridColumnHeader;