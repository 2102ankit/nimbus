import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => { },
  density: "normal",
  setDensity: () => { },
  showGridLines: true,
  toggleGridLines: () => { },
  showHeaderLines: true,
  toggleHeaderLines: () => { },
  showRowLines: true,
  toggleRowLines: () => { },
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("datagrid-theme");
    return stored || "light";
  });
  const [density, setDensity] = useState(() => {
    const stored = localStorage.getItem("datagrid-density");
    return stored || "normal";
  });
  const [showGridLines, setShowGridLines] = useState(() => {
    const stored = localStorage.getItem("datagrid-gridlines");
    return stored !== "false";
  });
  const [showHeaderLines, setShowHeaderLines] = useState(() => {
    const stored = localStorage.getItem("datagrid-headerlines");
    return stored !== "false";
  });
  const [showRowLines, setShowRowLines] = useState(() => {
    const stored = localStorage.getItem("datagrid-rowlines");
    return stored !== "false";
  });
  const [showStripedColumns, setShowStripedColumns] = useState(() => {
    const stored = localStorage.getItem("datagrid-stripedcolumns");
    return stored === "true";
  });
  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem("datagrid-font") || "Inter";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("datagrid-theme", theme);

    if (theme === "dark") {
      root.style.setProperty("--bg-primary", "#1e293b");
      root.style.setProperty("--bg-secondary", "#0f172a");
      root.style.setProperty("--bg-tertiary", "#334155");
      root.style.setProperty("--text-primary", "#f1f5f9");
      root.style.setProperty("--text-secondary", "#cbd5e1");
      root.style.setProperty("--text-muted", "#94a3b8");
      root.style.setProperty("--border-color", "#334155");
      root.style.setProperty("--hover-bg", "#334155");
    } else {
      root.style.setProperty("--bg-primary", "#ffffff");
      root.style.setProperty("--bg-secondary", "#f8fafc");
      root.style.setProperty("--bg-tertiary", "#f1f5f9");
      root.style.setProperty("--text-primary", "#0f172a");
      root.style.setProperty("--text-secondary", "#334155");
      root.style.setProperty("--text-muted", "#64748b");
      root.style.setProperty("--border-color", "#e2e8f0");
      root.style.setProperty("--hover-bg", "#f8fafc");
      root.style.setProperty("--hover-bg", "#f8fafc");
    }

    // Apply font family
    root.style.setProperty("--font-family", fontFamily);
    root.style.fontFamily = fontFamily;
  }, [theme, fontFamily]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleSetDensity = (d) => {
    setDensity(d);
    localStorage.setItem("datagrid-density", d);
  };

  const toggleGridLines = () => {
    setShowGridLines((prev) => {
      localStorage.setItem("datagrid-gridlines", String(!prev));
      return !prev;
    });
  };

  const toggleHeaderLines = () => {
    setShowHeaderLines((prev) => {
      localStorage.setItem("datagrid-headerlines", String(!prev));
      return !prev;
    });
  };

  const toggleStripedColumns = () => {
    setShowStripedColumns((prev) => {
      const newValue = !prev;
      localStorage.setItem("datagrid-stripedcolumns", String(newValue));
      // Update CSS variable or attribute for instant feedback if possible, 
      // but since we use inline styles in DataRow, we might need to refactor DataRow to use CSS classes.
      return newValue;
    });
  };

  // Effect to sync striped state with a global class/attribute for potential CSS usage
  useEffect(() => {
    const root = window.document.documentElement;
    if (showStripedColumns) {
      root.setAttribute("data-striped", "true");
    } else {
      root.removeAttribute("data-striped");
    }
  }, [showStripedColumns]);

  const handleSetFont = (font) => {
    localStorage.setItem("datagrid-font", font);
    setFontFamily(font);
  };

  const toggleRowLines = () => {
    setShowRowLines((prev) => {
      localStorage.setItem("datagrid-rowlines", String(!prev));
      return !prev;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        density,
        setDensity: handleSetDensity,
        showGridLines,
        toggleGridLines,
        showHeaderLines,
        toggleHeaderLines,
        showRowLines,
        toggleRowLines,
        showStripedColumns,
        toggleStripedColumns,
        fontFamily,
        setFontFamily: handleSetFont,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
