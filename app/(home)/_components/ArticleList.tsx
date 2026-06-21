"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  EyeIcon,
  HeartIcon,
  MessageSquareTextIcon,
} from "lucide-react";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { CommentRow } from "@components/types/comment";
import { lowerURL } from "@components/lib/util/lowerURL";

interface ArticleListProps {
  posts: PostStateWithoutContents[];
  categories: Category[];
  comments: CommentRow[];
  /** 페이지 전환 패칭 중 — 목록을 살짝 흐리게 처리 */
  isFetching?: boolean;
}

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const listContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const listItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
};

/**
 * 전체 아티클 목록 (토스테크 메인 칼럼 스타일)
 * - 좌측 텍스트(카테고리·작성자·제목·메트릭) + 우측 썸네일의 가로 행
 */
export function ArticleList({
  posts,
  categories,
  comments,
  isFetching = false,
}: ArticleListProps) {
  return (
    <section className="min-w-0 flex flex-col gap-2">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
        전체 아티클
      </h2>

      {posts.length === 0 ? (
        <div className="mt-4 flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-white/15">
          <p className="text-metricsText">게시물이 없습니다.</p>
        </div>
      ) : (
        <motion.ul
          // 페이지가 바뀌면 새 항목 stagger를 다시 재생 (whileInView+once는
          // 페이지네이션으로 교체되는 항목이 hidden(opacity:0)에 멈춰 안 보이는 문제가 있음)
          key={posts.map((p) => p.id).join("-")}
          variants={listContainer}
          initial="hidden"
          animate="show"
          className={`flex flex-col list-none p-0 m-0 transition-opacity duration-200 ${
            isFetching ? "opacity-50" : "opacity-100"
          }`}
        >
          {posts.map((post) => {
            const category = categories.find(
              (cat) => cat.id === post.category_id,
            );
            const categoryName = category?.name || "미분류";
            const categorySlug = lowerURL(category?.name || "");
            const thumbnailUrl = category?.thumbnail;
            const commentCount = comments.filter(
              (comment) => comment.post_id === post.id,
            ).length;

            return (
              <motion.li
                key={post.id}
                variants={listItem}
                className="border-b border-gray-100 dark:border-white/10"
              >
                <Link
                  href={`/posts/${categorySlug}/${post.id}`}
                  className="group flex min-w-0 items-start gap-4 py-6 sm:gap-6"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="max-w-full truncate rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
                        {categoryName}
                      </span>
                      <span className="min-w-0 truncate text-metricsText">
                        {post.author_name || "익명"}
                      </span>
                    </div>

                    <h3 className="line-clamp-2 text-lg sm:text-xl font-semibold leading-snug text-gray-900 dark:text-gray-100 group-hover:text-gray-600 dark:group-hover:text-white transition-colors">
                      {post.title}
                    </h3>

                    <div className="mt-1 flex items-center gap-4 text-sm text-metricsText">
                      <span className="flex items-center gap-1.5">
                        <EyeIcon size={15} />
                        {post.view_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HeartIcon size={15} />
                        {post.like_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageSquareTextIcon size={15} />
                        {commentCount}
                      </span>
                    </div>
                  </div>

                  {thumbnailUrl && (
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-44">
                      <Image
                        src={thumbnailUrl}
                        alt={post.title}
                        fill
                        quality={60}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 112px, 176px"
                      />
                    </div>
                  )}
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </section>
  );
}
