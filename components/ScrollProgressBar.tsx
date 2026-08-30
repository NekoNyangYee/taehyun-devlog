"use client";

import { useUIStore } from "@components/store/postLoadingStore";
import { usePathname } from "next/navigation";
import React, { CSSProperties, useEffect, useState } from "react";

export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const currentPath = usePathname();

  const isPostLoading = useUIStore((state) => state.isPostLoading);

  useEffect(() => {
    const handleClientScrollBar = () => {
      const { documentElement } = document;
      const { scrollHeight, clientHeight } = documentElement;

      const totalHeight = scrollHeight - clientHeight;
      const scrolledHeight = window.scrollY;
      const progress =
        totalHeight > 0 ? (scrolledHeight / totalHeight) * 100 : 0;

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleClientScrollBar, { passive: true });
    handleClientScrollBar();
    return () => window.removeEventListener("scroll", handleClientScrollBar);
  }, []);

  const shouldShowProgressBar = /^\/articles\/[^\/]+\/[^\/]+$/.test(currentPath);

  return shouldShowProgressBar && !isPostLoading ? (
    <div className="pointer-events-none absolute left-0 top-16 h-1 w-full">
      <div
        className="h-full bg-gray-950 transition-colors dark:bg-gray-100"
        style={{ width: `${scrollProgress}%` } as CSSProperties}
      />
    </div>
  ) : null;
}
