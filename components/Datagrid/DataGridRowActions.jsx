import * as React from "react";
import { MoreHorizontal, Pencil, Copy, Trash } from "lucide-react";
import { motion } from "motion/react";

const Button = ({ children, variant = "ghost", size = "icon", className = "", ...props }) => {
  const variants = {
    ghost: "hover:bg-slate-100",
  };
  const sizes = {
    icon: "h-8 w-8",
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

const DropdownMenuContent = ({ children, open }) => {
  if (!open) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-slate-200 bg-white shadow-lg"
    >
      {children}
    </motion.div>
  );
};

const DropdownMenuLabel = ({ children, className = "" }) => (
  <div className={`px-2 py-1.5 text-sm font-semibold ${className}`}>
    {children}
  </div>
);

const DropdownMenuSeparator = () => (
  <div className="my-1 h-px bg-slate-100" />
);

const DropdownMenuItem = ({ children, onClick, className = "" }) => (
  <div
    onClick={(e) => {
      e.stopPropagation();
      onClick?.();
    }}
    className={`relative flex cursor-pointer select-none items-center px-2 py-2 text-sm outline-none hover:bg-slate-100 ${className}`}
  >
    {children}
  </div>
);

export function DataGridRowActions({ row, onEdit, onDuplicate, onDelete }) {
  const handleEdit = () => {
    onEdit?.(row.original);
    console.log("Edit:", row.original);
  };
  
  const handleDuplicate = () => {
    onDuplicate?.(row.original);
    console.log("Duplicate:", row.original);
  };
  
  const handleDelete = () => {
    onDelete?.(row.original);
    console.log("Delete:", row.original);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>
          <Copy className="mr-2 h-4 w-4" />
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DataGridRowActions;