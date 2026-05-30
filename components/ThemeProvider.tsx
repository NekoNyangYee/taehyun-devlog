"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "app-theme";

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyThemeClass = (resolved: ResolvedTheme, withTransition = false) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  if (withTransition) {
    root.classList.add("theme-transitioning");
    window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 450);
  }

  if (resolved === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  // SSR-safe initial value
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const isFirstRun = useRef(true);

  // mount: read localStorage + system preference
  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode) || "system";
    setThemeState(stored);
  }, []);

  // theme 변경 시 해석된 테마 계산 + DOM class 적용
  useEffect(() => {
    const resolve = (): ResolvedTheme =>
      theme === "system" ? getSystemTheme() : theme;
    const r = resolve();
    setResolvedTheme(r);

    // 첫 마운트에는 DOM 변경을 건너뛴다.
    // head의 FOUC 인라인 스크립트가 이미 정확한 dark 클래스를 적용해두었으므로
    // 여기서 다시 만지면 잠시 라이트 색이 비치는 깜빡임이 발생함.
    if (isFirstRun.current) {
      isFirstRun.current = false;
    } else {
      applyThemeClass(r, true);
    }

    // system mode일 때 OS 설정 변경 감지
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const nr = getSystemTheme();
      setResolvedTheme(nr);
      applyThemeClass(nr, true);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setThemeState(mode);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

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
