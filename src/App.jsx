import AdvancedDataGrid from "@/components/Datagrid/AdvancedDataGrid";
import ThemeProvider from "@/components/ThemeProvider";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import DynamicDataGrid from "./DynamicDataGrid";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top of the window
  }, [pathname]); // Re-run this effect whenever the pathname changes

  return null; // This component doesn't render anything
};

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<AdvancedDataGrid />} />
          <Route path="/beta" element={<DynamicDataGrid />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;