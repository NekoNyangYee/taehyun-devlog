"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/components/ui/accordion";
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
      className={`lg:hidden fixed top-[75px] left-0 right-0 z-30 px-4 transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      <div className="mx-auto max-w-[600px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <Accordion
          type="single"
          collapsible
          value={openValue}
          onValueChange={setOpenValue}
        >
          <AccordionItem value="toc" className="border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="text-sm font-semibold truncate text-left flex-1 pr-2">
                {activeHeading?.text || "목차"}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 max-h-[60vh] overflow-y-auto">
              <nav className="flex flex-col gap-3">
                {headingGroups.map((group, index) => (
                  <div key={group.h2.id} className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleClick(group.h2.id)}
                      className={`text-sm font-bold text-left ${
                        activeId === group.h2.id
                          ? "text-blue-500"
                          : "text-gray-900"
                      }`}
                    >
                      {`${index + 1}. ${group.h2.text}`}
                    </button>
                    {group.h3.length > 0 && (
                      <div className="ml-3 flex flex-col gap-2">
                        {group.h3.map((subHeading) => (
                          <button
                            key={subHeading.id}
                            type="button"
                            onClick={() => handleClick(subHeading.id)}
                            className={`text-xs text-left ${
                              activeId === subHeading.id
                                ? "text-blue-500"
                                : "text-gray-600"
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
      </div>
    </div>
  );
}
