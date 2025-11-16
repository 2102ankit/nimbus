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

    // Set CSS custom properties for better color control
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
    }
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
