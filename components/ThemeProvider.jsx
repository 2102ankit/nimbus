import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  density: "normal",
  setDensity: () => {},
  showGridLines: true,
  toggleGridLines: () => {},
  showHeaderLines: true,
  toggleHeaderLines: () => {},
  showRowLines: true,
  toggleRowLines: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [density, setDensity] = useState("normal");
  const [showGridLines, setShowGridLines] = useState(true);
  const [showHeaderLines, setShowHeaderLines] = useState(true);
  const [showRowLines, setShowRowLines] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const toggleGridLines = () => setShowGridLines((prev) => !prev);
  const toggleHeaderLines = () => setShowHeaderLines((prev) => !prev);
  const toggleRowLines = () => setShowRowLines((prev) => !prev);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        density,
        setDensity,
        showGridLines,
        toggleGridLines,
        showHeaderLines,
        toggleHeaderLines,
        showRowLines,
        toggleRowLines,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
