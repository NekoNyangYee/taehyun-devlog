"use client";

import Image from "next/image";
import Link from "next/link";
import { Grid2X2Plus } from "lucide-react";
import { Category } from "@components/types/category";
import { lowerURL } from "@components/lib/util/lowerURL";

interface CategoryGridProps {
  categories: Category[];
  counts?: Record<number, number>;
}

export function CategoryGrid({ categories, counts = {} }: CategoryGridProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="flex gap-3 text-2xl md:text-3xl font-bold items-center text-gray-900 dark:text-gray-100">
          <span className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300">
            <Grid2X2Plus size={22} />
          </span>
          카테고리
        </h2>
        <p className="text-metricsText text-sm md:text-base pl-1">
          주제별로 게시물을 탐색해보세요
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {categories.map((category) => {
          const imageUrl = category?.thumbnail;
          const categoryLink = lowerURL(category.name);
          const count = counts[category.id] ?? 0;

          return (
            <Link
              key={category.id}
              href={`/posts/${categoryLink}`}
              className="group flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-3 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={category.name}
                    fill
                    quality={50}
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-metricsText">
                    <Grid2X2Plus size={20} />
                  </span>
                )}
              </span>
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
