"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/components/ui/accordion";
import { useEffect, useState } from "react";
import { GotoTop } from "@components/components/GoToTop";

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

export default function MobileTOC({
  headingGroups,
  activeId,
  onScrollTo,
}: MobileTOCProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [openValue, setOpenValue] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (headingGroups.length === 0) return null;

  const activeHeading = headingGroups
    .flatMap((group) => [group.h2, ...group.h3])
    .find((h) => h.id === activeId);

  const handleClick = (id: string) => {
    onScrollTo(id);
    setOpenValue("");
  };

  return (
    <div
      className={`fixed bottom-8 left-0 right-0 z-30 px-3 transition-all duration-300 sm:px-4 lg:hidden ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-4xl items-end gap-2">
        <Accordion
          type="single"
          collapsible
          value={openValue}
          onValueChange={setOpenValue}
          className="min-w-0 flex-1 overflow-hidden rounded-[28px] bg-gray-100/95 backdrop-blur-md dark:bg-zinc-900/95"
        >
          <AccordionItem value="toc" className="flex flex-col-reverse border-none">
            <AccordionTrigger className="min-h-12 px-6 py-3 hover:no-underline sm:px-8 [&>svg]:rotate-180 [&[data-state=open]>svg]:rotate-0">
              <span className="flex-1 truncate pr-2 text-left text-base font-semibold leading-6">
                {activeHeading?.text || "목차"}
              </span>
            </AccordionTrigger>
            <AccordionContent className="max-h-[65dvh] overflow-y-auto px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
              <nav className="flex flex-col gap-3.5">
                {headingGroups.map((group, index) => (
                  <div key={group.h2.id} className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleClick(group.h2.id)}
                      className={`py-1.5 text-left text-[15px] font-bold leading-6 ${
                        activeId === group.h2.id
                          ? "text-blue-500 dark:text-blue-300"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {`${index + 1}. ${group.h2.text}`}
                    </button>
                    {group.h3.length > 0 && (
                      <div className="ml-4 flex flex-col gap-1">
                        {group.h3.map((subHeading) => (
                          <button
                            key={subHeading.id}
                            type="button"
                            onClick={() => handleClick(subHeading.id)}
                            className={`py-1 text-left text-sm leading-5 ${
                              activeId === subHeading.id
                                ? "text-blue-500 dark:text-blue-300"
                                : "text-gray-600 dark:text-gray-400"
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <GotoTop variant="mobile" />
      </div>
    </div>
  );
}
