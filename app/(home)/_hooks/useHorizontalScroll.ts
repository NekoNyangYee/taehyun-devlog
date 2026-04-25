"use client";

import { useRef, useState, useCallback, useEffect } from "react";

/**
 * 수평 스크롤 제어 Hook
 * - UI와 로직 분리
 * - 스크롤 가능 여부 상태 관리
 * - 스크롤 동작 제어
 */
export function useHorizontalScroll() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    }, []);

    const scroll = useCallback(
        (direction: "left" | "right") => {
            if (scrollRef.current) {
                const scrollAmount = 350;
                scrollRef.current.scrollBy({
                    left: direction === "left" ? -scrollAmount : scrollAmount,
                    behavior: "smooth",
                });
                setTimeout(() => {
                    checkScroll();
                }, 300);
            }
        },
        [checkScroll]
    );

    useEffect(() => {
        checkScroll();
    }, [checkScroll]);

    return {
        scrollRef,
        canScrollLeft,
        canScrollRight,
        scroll,
        checkScroll,
    };
}
