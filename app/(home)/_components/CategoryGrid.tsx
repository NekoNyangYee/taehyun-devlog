"use client";

import Image from "next/image";
import Link from "next/link";
import { Grid2X2Plus } from "lucide-react";
import { Category } from "@components/types/category";
import { lowerURL } from "@components/lib/util/lowerURL";
import { motion, type Variants } from "framer-motion";

interface CategoryGridProps {
  categories: Category[];
  /** category_id -> 공개 게시물 수 */
  counts?: Record<number, number>;
}

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

const gridContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

const gridItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
};

/**
 * 카테고리 — 컴팩트 아이콘 카드 그리드
 * - 작은 썸네일 아이콘 + 이름 + 글 개수
 */
export function CategoryGrid({ categories, counts = {} }: CategoryGridProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="flex flex-col gap-6"
    >
      <motion.div variants={headerVariants} className="flex flex-col gap-2">
        <h2 className="flex gap-3 text-2xl md:text-3xl font-bold items-center text-gray-900 dark:text-gray-100">
          <span className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300">
            <Grid2X2Plus size={22} />
          </span>
          카테고리
        </h2>
        <p className="text-metricsText text-sm md:text-base pl-1">
          주제별로 게시물을 탐색해보세요
        </p>
      </motion.div>

      <motion.div
        variants={gridContainer}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
      >
        {categories.map((category) => {
          const imageUrl = category?.thumbnail;
          const categoryLink = lowerURL(category.name);
          const count = counts[category.id] ?? 0;

          return (
            <motion.div
              key={category.id}
              variants={gridItem}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <Link
                href={`/posts/${categoryLink}`}
                className="group flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-3 transition-colors hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={category.name}
                      fill
                      quality={50}
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
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
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
