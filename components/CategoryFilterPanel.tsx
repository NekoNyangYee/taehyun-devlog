"use client";

import { TagsIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "./ui/select";

export interface CategoryFilterOption {
  value: string;
  label: string;
  count: number;
}

interface CategoryFilterPanelProps {
  options: CategoryFilterOption[];
  selectedValue: string;
  totalCount: number;
  onChange: (value: string) => void;
}

export function CategoryFilterPanel({
  options,
  selectedValue,
  totalCount,
  onChange,
}: CategoryFilterPanelProps) {
  const selectedOption =
    selectedValue === "all"
      ? { label: "전체", count: totalCount }
      : options.find((option) => option.value === selectedValue) ?? {
          label: "카테고리 선택",
          count: 0,
        };

  return (
    <Select value={selectedValue} onValueChange={onChange}>
      <SelectTrigger className="h-12 min-w-0 w-[calc(100vw-9.125rem)] max-w-60 rounded-none border-0 border-r border-gray-200 bg-transparent dark:border-white/10 sm:w-60">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
          <span className="flex min-w-0 items-center gap-2">
            <TagsIcon size={14} className="shrink-0" />
            <span className="truncate">{selectedOption.label}</span>
          </span>
          <span className="shrink-0 text-metricsText">
            {selectedOption.count}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-none bg-white dark:border-white/10 dark:bg-zinc-900">
        <SelectItem
          value="all"
          className="pr-3 [&>span:last-child]:w-full"
        >
          <span className="flex w-full min-w-0 items-center justify-between gap-4">
            <span className="flex min-w-0 items-center gap-2">
              <TagsIcon size={14} className="shrink-0" />
              <span className="truncate">전체</span>
            </span>
            <span className="shrink-0 text-metricsText">{totalCount}</span>
          </span>
        </SelectItem>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="pr-3 [&>span:last-child]:w-full"
          >
              <span className="flex w-full min-w-0 items-center justify-between gap-4">
                <span className="flex min-w-0 items-center gap-2">
                  <TagsIcon size={14} className="shrink-0" />
                  <span className="truncate">{option.label}</span>
                </span>
                <span className="shrink-0 text-metricsText">
                  {option.count}
                </span>
              </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
