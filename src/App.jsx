import AdvancedDataGrid from "@/components/Datagrid/AdvancedDataGrid";
import ThemeProvider from "@/components/ThemeProvider";
import { useState } from "react";
import DynamicDataGrid from "./DynamicDataGrid";

const App = () => {
  // const [isDynamic, setIsDynamic] = useState(false);

  return (
    <ThemeProvider>
      {/* {isDynamic ? <DynamicDataGrid isDynamic={isDynamic} onToggle={setIsDynamic} /> : <AdvancedDataGrid isDynamic={isDynamic} onToggle={setIsDynamic} />} */}
      <DynamicDataGrid isDynamic={true} onToggle={true} />
    </ThemeProvider>
  );
};

export default App;