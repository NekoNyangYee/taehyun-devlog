"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Monitor, MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme, type ThemeMode } from "./ThemeProvider";

const OPTIONS: { value: ThemeMode; label: string; icon: typeof SunIcon }[] = [
  { value: "light", label: "라이트", icon: SunIcon },
  { value: "dark", label: "다크", icon: MoonIcon },
  { value: "system", label: "시스템", icon: Monitor },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // outside click 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  // 헤더 아이콘은 사용자가 선택한 모드 그대로 반영 (system → Monitor)
  const CurrentIcon =
    theme === "dark" ? MoonIcon : theme === "system" ? Monitor : SunIcon;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="테마 변경"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/40 hover:backdrop-blur-md dark:hover:bg-white/10 dark:hover:backdrop-blur-md transition-colors"
      >
        <CurrentIcon size={18} className="text-gray-700 dark:text-gray-200" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden z-50"
          >
            {OPTIONS.map(({ value, label, icon: Icon }) => {
              const selected = theme === value;
              return (
                <button
                  key={value}
                  onClick={() => {
                    setTheme(value);
                    setIsOpen(false);
                  }}
                  role="menuitemradio"
                  aria-checked={selected}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                    selected
                      ? "bg-gray-100 dark:bg-zinc-800 font-semibold text-gray-900 dark:text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
