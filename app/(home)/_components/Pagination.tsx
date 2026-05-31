"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const WINDOW = 2; // 현재 페이지 양옆으로 보여줄 페이지 수

/**
 * 숫자 페이지네이션 — 현재 페이지 주변 윈도우 + 양끝 점프, 이전/다음.
 */
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  let start = Math.max(1, page - WINDOW);
  let end = Math.min(totalPages, page + WINDOW);
  if (page <= WINDOW) end = Math.min(totalPages, 1 + WINDOW * 2);
  if (page > totalPages - WINDOW) start = Math.max(1, totalPages - WINDOW * 2);

  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const base =
    "flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors";
  const ghost =
    "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10";

  return (
    <nav
      aria-label="페이지네이션"
      className="mt-8 flex items-center justify-center gap-1.5"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="이전 페이지"
        className={`${base} border border-gray-200 dark:border-white/15 ${ghost} disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <ChevronLeft size={16} />
      </button>

      {start > 1 && (
        <>
          <button
            type="button"
            onClick={() => onChange(1)}
            className={`${base} ${ghost}`}
          >
            1
          </button>
          {start > 2 && (
            <span className="px-1 text-metricsText">…</span>
          )}
        </>
      )}

      {pages.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={`${base} ${
            n === page
              ? "bg-action text-action-foreground"
              : ghost
          }`}
        >
          {n}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-1 text-metricsText">…</span>
          )}
          <button
            type="button"
            onClick={() => onChange(totalPages)}
            className={`${base} ${ghost}`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="다음 페이지"
        className={`${base} border border-gray-200 dark:border-white/15 ${ghost} disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
