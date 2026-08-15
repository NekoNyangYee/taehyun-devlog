"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";

export interface CategoryFilterOption {
  value: string;
  label: string;
  count: number;
}

interface CategoryFilterPanelProps {
  options: CategoryFilterOption[];
  selectedValues?: string[];
  selectedValue?: string;
  totalCount: number;
  onToggle?: (value: string) => void;
  onClear?: () => void;
  onChange?: (value: string) => void;
}

export function CategoryFilterPanel({
  options,
  selectedValues,
  selectedValue,
  onToggle,
  onClear,
  onChange,
}: CategoryFilterPanelProps) {
  const activeValues =
    selectedValues ??
    (selectedValue && selectedValue !== "all" ? [selectedValue] : []);
  const categoryItems = options;

  const renderCategoryItems = (keyPrefix: string) => (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {categoryItems.map((option) => {
        const isSelected = activeValues.includes(option.value);

        return (
          <li key={`${keyPrefix}-${option.value}`}>
            <button
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => {
                if (onToggle) onToggle(option.value);
                else onChange?.(option.value);
              }}
              className="flex w-full min-w-0 items-center gap-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300"
            >
              <span
                className={`h-5 w-5 shrink-0 rounded-md border ${
                  isSelected
                    ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                    : "border-gray-300 bg-transparent dark:border-zinc-600"
                }`}
              >
                {isSelected && <CheckIcon className="h-full w-full p-0.5" />}
              </span>
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              <span className="shrink-0 text-xs text-metricsText">
                {option.count}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <details className="group overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
          <span className="text-base font-bold text-gray-800 dark:text-gray-100">
            카테고리
          </span>
          <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {activeValues.length > 0
              ? `${activeValues.length}개 선택`
              : "선택하기"}
            <ChevronDownIcon className="h-4 w-4 transition-transform group-open:rotate-180" />
          </span>
        </summary>

        <div className="border-t border-gray-200 px-5 pb-5 pt-4 dark:border-white/10 sm:px-6 sm:pb-6">
          {activeValues.length > 0 && (
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => (onClear ? onClear() : onChange?.("all"))}
                className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
              >
                초기화
              </button>
            </div>
          )}
          <div className="max-h-64 overflow-y-auto overscroll-contain pr-1">
            {renderCategoryItems("mobile")}
          </div>
        </div>
      </details>

      <section className="hidden rounded-3xl bg-gray-100 p-6 dark:bg-zinc-900 lg:block">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            카테고리
          </h2>
          {activeValues.length > 0 && (
            <button
              type="button"
              onClick={() => (onClear ? onClear() : onChange?.("all"))}
              className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
            >
              초기화
            </button>
          )}
        </div>

        {renderCategoryItems("desktop")}
      </section>
    </>
  );
}
