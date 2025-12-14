import { BrowserRouter, Routes, Route } from "react-router-dom";
import ThemeProvider from "@/components/ThemeProvider";
import AdvancedDataGrid from "@/components/Datagrid/AdvancedDataGrid";
import DynamicDataGrid from "./DynamicDataGrid";

const App = () => {
  return (
    <BrowserRouter>
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