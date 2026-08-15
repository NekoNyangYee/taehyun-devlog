"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { useMemo } from "react";
import { Category } from "@components/types/category";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@components/components/ui/carousel";

interface CategoryGridProps {
  categories: Category[];
  counts?: Record<number, number>;
}

export function CategoryGrid({ categories, counts = {} }: CategoryGridProps) {
  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) =>
        a.name.localeCompare(b.name, "en", {
          sensitivity: "base",
          numeric: true,
        }),
      ),
    [categories],
  );

  return (
    <section className="py-8 sm:py-12">
      <Carousel opts={{ align: "start" }} className="w-full">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-[-0.03em] text-gray-950 dark:text-white">
            카테고리
          </h2>

          {sortedCategories.length > 1 && (
            <div className="flex shrink-0 items-center gap-2">
              <CarouselPrevious className="static h-9 w-9 translate-x-0 translate-y-0 border-gray-200 bg-white/80 backdrop-blur hover:bg-white dark:border-white/10 dark:bg-zinc-900/80 dark:hover:bg-zinc-800" />
              <CarouselNext className="static h-9 w-9 translate-x-0 translate-y-0 border-gray-200 bg-white/80 backdrop-blur hover:bg-white dark:border-white/10 dark:bg-zinc-900/80 dark:hover:bg-zinc-800" />
            </div>
          )}
        </div>

        <CarouselContent className="-ml-5">
          {sortedCategories.map((category) => {
            const count = counts[category.id] ?? 0;

            return (
              <CarouselItem
                key={category.id}
                className="pl-5 sm:basis-1/2 xl:basis-1/4"
              >
                <Link
                  href={`/articles?category=${category.id}`}
                  className="group flex h-full min-h-[27rem] flex-col rounded-3xl bg-gray-100 p-5 dark:bg-zinc-900"
                >
                  <span className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-200 dark:bg-zinc-800">
                    {category.thumbnail ? (
                      <Image
                        src={category.thumbnail}
                        alt={category.name}
                        fill
                        quality={65}
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 280px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-600">
                        <ImageIcon size={32} />
                      </span>
                    )}
                  </span>

                  <span className="mt-5 line-clamp-2 text-xl font-bold leading-snug tracking-[-0.02em] text-gray-950 transition-colors group-hover:text-[#3182f6] dark:text-white dark:group-hover:text-blue-300">
                    {category.name}
                  </span>
                  <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    {category.name} 주제로 작성한 기술 아티클을 모았습니다.
                  </span>
                  <span className="mt-auto self-start rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 dark:bg-zinc-800 dark:text-gray-300">
                    {count}개의 아티클
                  </span>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
