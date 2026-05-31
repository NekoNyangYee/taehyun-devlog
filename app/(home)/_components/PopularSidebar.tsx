"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { lowerURL } from "@components/lib/util/lowerURL";

interface PopularSidebarProps {
  posts: PostStateWithoutContents[];
  categories: Category[];
}

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut, staggerChildren: 0.06 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, x: 12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: easeOut } },
};

/**
 * 인기 있는 글 사이드바 — 조회수 상위 게시물을 번호와 함께 나열
 */
export function PopularSidebar({ posts, categories }: PopularSidebarProps) {
  if (posts.length === 0) return null;

  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-5"
    >
      <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-gray-100">
        인기 있는 글
      </h3>
      <ol className="flex flex-col gap-4 list-none p-0 m-0">
        {posts.map((post, i) => {
          const category = categories.find(
            (cat) => cat.id === post.category_id,
          );
          const categorySlug = lowerURL(category?.name || "");

          return (
            <motion.li key={post.id} variants={item}>
              <Link
                href={`/posts/${categorySlug}/${post.id}`}
                className="group flex items-start gap-3"
              >
                <span className="shrink-0 text-lg font-bold leading-snug text-blue-500 dark:text-blue-400">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-800 dark:text-gray-100 group-hover:text-gray-500 dark:group-hover:text-white transition-colors">
                    {post.title}
                  </p>
                  <span className="text-xs text-metricsText">
                    {post.author_name || "익명"}
                  </span>
                </div>
              </Link>
            </motion.li>
          );
        })}
      </ol>
    </motion.section>
  );
}
