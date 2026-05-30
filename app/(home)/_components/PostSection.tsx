"use client";

import { PostCard } from "./PostCard";
import { ScrollControls } from "./ScrollControls";
import { useHorizontalScroll } from "../_hooks/useHorizontalScroll";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { CommentRow } from "@components/types/comment";
import { lowerURL } from "@components/lib/util/lowerURL";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";

interface PostSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  posts: PostStateWithoutContents[];
  categories: Category[];
  comments: CommentRow[];
  variant?: "default" | "popular";
  showViewAll?: boolean;
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

const cardContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeOut },
  },
};

export function PostSection({
  title,
  description,
  icon: Icon,
  iconColor = "text-gray-900",
  posts,
  categories,
  comments,
  variant = "default",
  showViewAll = false,
}: PostSectionProps) {
  const { scrollRef, canScrollLeft, canScrollRight, scroll, checkScroll } =
    useHorizontalScroll();

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="flex flex-col gap-6"
    >
      <motion.div
        variants={headerVariants}
        className="flex items-end justify-between gap-4"
      >
        <div className="flex flex-col gap-2">
          <h2 className="flex gap-3 text-2xl md:text-3xl font-bold items-center text-gray-900 dark:text-gray-100">
            <span
              className={`flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gray-100 dark:bg-white/10 ${iconColor} dark:text-gray-100`}
            >
              <Icon size={22} />
            </span>
            {title}
          </h2>
          <p className="text-metricsText text-sm md:text-base pl-1">
            {description}
          </p>
        </div>
        {showViewAll && (
          <Link
            href="/posts"
            className="group flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition shrink-0"
          >
            전체보기
            <ChevronRight
              size={18}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        )}
      </motion.div>

      {posts.length === 0 ? (
        <motion.div
          variants={headerVariants}
          className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/15 bg-white dark:bg-zinc-900"
        >
          <p className="text-lg font-semibold text-metricsText">
            게시물이 없습니다.
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          <motion.div
            variants={cardContainer}
            ref={scrollRef}
            onScroll={checkScroll}
            className="overflow-x-auto scroll-smooth scrollbar-hide"
          >
            <div className="flex gap-6 pb-2 min-w-min">
              {posts.map((post) => {
                const category = categories.find(
                  (cat) => cat.id === post.category_id,
                );
                const thumbnailUrl = category?.thumbnail;
                const categoryName = category?.name || "미분류";
                const categorySlug = lowerURL(category?.name || "");
                const commentCount = comments.filter(
                  (comment) => comment.post_id === post.id,
                ).length;

                return (
                  <motion.div key={post.id} variants={cardItem}>
                    <PostCard
                      post={post}
                      categoryName={categoryName}
                      categorySlug={categorySlug}
                      thumbnailUrl={thumbnailUrl}
                      commentCount={commentCount}
                      variant={variant}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <ScrollControls
            canScrollLeft={canScrollLeft}
            canScrollRight={canScrollRight}
            onScrollLeft={() => scroll("left")}
            onScrollRight={() => scroll("right")}
          />
        </div>
      )}
    </motion.section>
  );
}
