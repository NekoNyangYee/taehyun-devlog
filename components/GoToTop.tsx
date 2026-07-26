"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type GotoTopVariant = "fixed" | "toc" | "mobile";

export function GotoTop({ variant = "fixed" }: { variant?: GotoTopVariant }) {
  const [currentHeight, setCurrentHeight] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setCurrentHeight(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    if (isDisabled) return;
    setIsDisabled(true);
    const scrollContainer = document.scrollingElement || document.documentElement;
    const startPosition = Math.max(
      window.scrollY,
      scrollContainer.scrollTop,
      document.documentElement.scrollTop,
      document.body.scrollTop,
    );
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 0 : 450;
    const startedAt = performance.now();

    const setScrollPosition = (top: number) => {
      window.scrollTo(0, top);
      document.documentElement.scrollTop = top;
      document.body.scrollTop = top;
    };

    const animate = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setScrollPosition(Math.round(startPosition * (1 - easedProgress)));

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
        setScrollPosition(0);
        setIsDisabled(false);
      }
    };

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={
        variant === "toc"
          ? `flex w-full shrink-0 items-center justify-between border-0 px-3 py-3 text-sm font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-200 dark:hover:bg-white/10 ${
              currentHeight
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            }`
          : variant === "mobile"
            ? `flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-lg transition-all duration-300 hover:bg-gray-100 disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-white/10 ${
                currentHeight
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-2 opacity-0"
              }`
          : `fixed bottom-8 right-8 z-50 rounded-full bg-gray-800 p-3 text-white shadow-lg transition-all duration-300 hover:bg-gray-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200 ${
              currentHeight
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            }`
      }
      aria-label="맨 위로 이동"
    >
      {variant === "toc" && <span>Top</span>}
      <ArrowUp size={variant === "fixed" ? 24 : 18} />
    </button>
  );
}
