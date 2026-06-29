"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";

export type Theme = "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "saddleup_theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.add("dark");
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "dark");
    }
  }, []);

  const value: ThemeContextValue = {
    theme: "dark",
    setTheme: () => {},
    toggle: () => {},
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
