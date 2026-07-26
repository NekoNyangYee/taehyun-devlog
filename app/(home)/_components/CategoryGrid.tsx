"use client";

import Link from "next/link";
import { TagIcon } from "lucide-react";
import { Category } from "@components/types/category";
import { lowerURL } from "@components/lib/util/lowerURL";
import { HomePanelHeader } from "./HomePanelHeader";

interface CategoryGridProps {
  categories: Category[];
  counts?: Record<number, number>;
}

export function CategoryGrid({ categories, counts = {} }: CategoryGridProps) {
  return (
    <section className="overflow-hidden bg-white dark:bg-zinc-950">
      <HomePanelHeader title="Categories" href="/posts" />

      <div className="grid grid-cols-1 gap-px bg-gray-200 dark:bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((category) => {
          const categoryLink = lowerURL(category.name);
          const count = counts[category.id] ?? 0;

          return (
            <Link
              key={category.id}
              href={`/posts/${categoryLink}`}
              className="group flex min-h-16 items-center gap-3 bg-white px-4 py-3 transition-colors hover:bg-gray-50 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              <TagIcon
                size={16}
                className="shrink-0 text-gray-500 dark:text-gray-400"
              />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {category.name}
                </span>
                <span className="text-xs text-metricsText">{count}개의 글</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
