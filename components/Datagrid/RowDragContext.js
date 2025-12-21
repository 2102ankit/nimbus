import { createContext, useContext } from 'react';

export const RowDragContext = createContext(null);

export const useRowDrag = () => {
    const context = useContext(RowDragContext);
    if (!context) {
        return { attributes: {}, listeners: {} };
    }
    return context;
};
export const RowDragProvider = RowDragContext.Provider;
