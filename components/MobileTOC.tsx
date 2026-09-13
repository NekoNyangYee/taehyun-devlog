"use client";

import { GotoTop } from "@components/components/GoToTop";
import { useIsClient } from "@components/lib/hooks/useIsClient";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, ListTree } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
}

interface HeadingGroup {
  h2: Heading;
  h3: Heading[];
}

interface MobileTOCProps {
  headingGroups: HeadingGroup[];
  activeId: string;
  onScrollTo: (id: string) => void;
}

const sheetTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 36,
  mass: 0.85,
};

export default function MobileTOC({
  headingGroups,
  activeId,
  onScrollTo,
}: MobileTOCProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isClient = useIsClient();

  useEffect(() => {
    const handleScroll = () => {
      const shouldBeVisible = window.scrollY > 200;
      setIsVisible(shouldBeVisible);
      if (!shouldBeVisible) setIsOpen(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isClient || headingGroups.length === 0) return null;

  const activeHeading = headingGroups
    .flatMap((group) => [group.h2, ...group.h3])
    .find((heading) => heading.id === activeId);

  const handleHeadingClick = (id: string) => {
    setIsOpen(false);
    onScrollTo(id);
  };

  return createPortal(
    <>
      <AnimatePresence>
        {isVisible && isOpen && (
          <motion.button
            type="button"
            aria-label="목차 닫기"
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden dark:bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-x-0 z-50 px-3 sm:px-4 lg:hidden"
            style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={sheetTransition}
          >
            <motion.div
              layout
              transition={sheetTransition}
              className={`mx-auto w-full max-w-4xl overflow-hidden border border-black/[0.08] bg-white shadow-[0_16px_50px_rgba(15,23,42,0.24)] dark:border-white/[0.12] dark:bg-zinc-900 dark:shadow-[0_16px_50px_rgba(0,0,0,0.55)] ${
                isOpen ? "rounded-[28px]" : "rounded-[22px]"
              }`}
            >
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id="mobile-table-of-contents"
                    key="toc-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={sheetTransition}
                    className="overflow-hidden"
                  >
                    <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-gray-300 dark:bg-zinc-600" />
                    <nav
                      aria-label="이 글의 목차"
                      className="max-h-[min(62dvh,34rem)] overflow-y-auto overscroll-contain px-4 pb-3 pt-3 sm:px-5"
                    >
                      {headingGroups.map((group, index) => (
                        <div key={group.h2.id} className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleHeadingClick(group.h2.id)}
                            className={`rounded-xl px-3 py-2.5 text-left text-[15px] font-bold leading-6 transition-colors active:scale-[0.99] ${
                              activeId === group.h2.id
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300"
                                : "text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-white/[0.07]"
                            }`}
                          >
                            {`${index + 1}. ${group.h2.text}`}
                          </button>
                          {group.h3.length > 0 && (
                            <div className="mb-1 ml-4 flex flex-col border-l border-gray-200 pl-2 dark:border-white/10">
                              {group.h3.map((subHeading) => (
                                <button
                                  key={subHeading.id}
                                  type="button"
                                  onClick={() => handleHeadingClick(subHeading.id)}
                                  className={`rounded-lg px-3 py-2 text-left text-sm leading-5 transition-colors active:scale-[0.99] ${
                                    activeId === subHeading.id
                                      ? "bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300"
                                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.07]"
                                  }`}
                                >
                                  {subHeading.text}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </nav>
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className="flex h-14 items-center border-t border-transparent px-2 data-[open=true]:border-gray-200 dark:data-[open=true]:border-white/10"
                data-open={isOpen}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls="mobile-table-of-contents"
                  onClick={() => setIsOpen((open) => !open)}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-gray-900 transition-colors hover:bg-gray-100 active:bg-gray-200/70 dark:text-gray-100 dark:hover:bg-white/[0.07] dark:active:bg-white/10"
                >
                  <ListTree size={18} className="shrink-0 text-blue-500" />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
                    {activeHeading?.text || "목차"}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={sheetTransition}
                    className="flex shrink-0 text-gray-400"
                  >
                    <ChevronUp size={18} />
                  </motion.span>
                </button>
                <div className="mx-1 h-6 w-px shrink-0 bg-gray-200 dark:bg-white/10" />
                <GotoTop variant="mobile" onActivate={() => setIsOpen(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}
