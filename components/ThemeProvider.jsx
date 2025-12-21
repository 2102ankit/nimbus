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
  currency: "USD",
  setCurrency: () => { },
  locale: "en-US",
  setLocale: () => { },
  showStripedColumns: false,
  toggleStripedColumns: () => { },
  fontFamily: "Inter",
  setFontFamily: () => { },
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
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem("datagrid-currency") || "USD";
  });
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem("datagrid-locale") || "en-US";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("datagrid-theme", theme);

    // Apply font family
    const fontMap = {
      'Inter': 'var(--font-inter)',
      'JetBrains Mono': 'var(--font-jetbrains)',
      'Geist Mono': 'var(--font-geist)',
      'Google Sans Flex': 'var(--font-google)',
      'system-ui': 'system-ui',
      'monospace': 'monospace'
    };
    const fontValue = fontMap[fontFamily] || 'var(--font-inter)';
    root.style.setProperty("--font-sans", fontValue);
    root.style.fontFamily = fontValue;
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

  const handleSetCurrency = (curr) => {
    localStorage.setItem("datagrid-currency", curr);
    setCurrency(curr);
  };

  const handleSetLocale = (loc) => {
    localStorage.setItem("datagrid-locale", loc);
    setLocale(loc);
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
        currency,
        setCurrency: handleSetCurrency,
        locale,
        setLocale: handleSetLocale,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
