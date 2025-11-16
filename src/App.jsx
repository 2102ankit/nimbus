import ThemeProvider from "../components/ThemeProvider";
import AdvancedDataGrid from "./Table";

const App = () => {
  // return <DataGridDemo />;
  return (
    <ThemeProvider>
      <AdvancedDataGrid />
    </ThemeProvider>
  );
};

export default App;
