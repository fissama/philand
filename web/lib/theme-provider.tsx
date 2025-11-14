"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

type Theme = "light" | "dark" | "colorful";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("philand-theme") as Theme;
    if (savedTheme && ["light", "dark", "colorful"].includes(savedTheme)) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to light theme
      applyTheme("light");
    }
  }, []);

  const applyTheme = useCallback((theme: Theme) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "colorful");
    root.classList.add(theme);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("philand-theme", newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
