"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

interface SidebarScrollAreaProps {
  children: ReactNode;
}

export function SidebarScrollArea({ children }: SidebarScrollAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasMeasured, setHasMeasured] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const isLargeViewport = window.matchMedia("(min-width: 1024px)").matches;
      const nextCanScroll =
        isLargeViewport && el.scrollHeight > el.clientHeight + 8;
      setHasMeasured(true);
      setCanScroll(nextCanScroll);
      setAtTop(el.scrollTop <= 1);
      setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 1);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(update)
        : null;
    resizeObserver?.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <div className="relative min-w-0">
      <div
        ref={scrollRef}
        className="min-w-0 flex flex-col gap-6 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:scrollbar-hide"
      >
        {children}
      </div>
      {hasMeasured && canScroll && !atTop && (
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-10 bg-gradient-to-b from-background to-transparent lg:block" />
      )}
      {hasMeasured && canScroll && !atBottom && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-10 bg-gradient-to-t from-background to-transparent lg:block" />
      )}
    </div>
  );
}
