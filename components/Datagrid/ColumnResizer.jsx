import React from "react";
import { GripVertical } from "lucide-react";

export function ColumnResizer({ header }) {
  const [isResizing, setIsResizing] = React.useState(false);
  
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    header.getResizeHandler()(e);
  };
  
  React.useEffect(() => {
    const handleMouseUp = () => setIsResizing(false);
    
    if (isResizing) {
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);
  
  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-blue-500 ${
        isResizing ? 'bg-blue-500' : 'bg-transparent'
      } group`}
      style={{ userSelect: 'none' }}
    >
      <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}

export function useColumnResize(table) {
  const columnSizeVars = React.useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes = {};
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }
    
    return colSizes;
  }, [table.getState().columnSizingInfo, table.getState().columnSizing]);
  
  return columnSizeVars;
}

export default ColumnResizer;