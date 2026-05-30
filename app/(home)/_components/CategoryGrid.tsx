"use client";

import Image from "next/image";
import Link from "next/link";
import { Grid2X2Plus } from "lucide-react";
import { Category } from "@components/types/category";
import { lowerURL } from "@components/lib/util/lowerURL";
import { motion, type Variants } from "framer-motion";

interface CategoryGridProps {
  categories: Category[];
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
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const gridItem: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeOut },
  },
};

export function CategoryGrid({ categories }: CategoryGridProps) {
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
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        {categories.map((category) => {
          const imageUrl = category?.thumbnail;
          const categoryLink = lowerURL(category.name);

          return (
            <motion.div
              key={category.id}
              variants={gridItem}
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link href={`/posts/${categoryLink}`}>
                <div className="group relative h-32 sm:h-40 overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-containerColor/50">
                  <Image
                    src={imageUrl}
                    alt={category.name}
                    fill
                    quality={65}
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-start p-4">
                    <span className="text-white font-bold text-base sm:text-lg leading-tight">
                      {category.name}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
