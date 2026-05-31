"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  EyeIcon,
  HeartIcon,
  MessageSquareTextIcon,
  Grid2X2Plus,
} from "lucide-react";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { CommentRow } from "@components/types/comment";
import { lowerURL } from "@components/lib/util/lowerURL";
import { formatDate } from "@components/lib/util/dayjs";

interface FeaturedCarouselProps {
  posts: PostStateWithoutContents[];
  categories: Category[];
  comments: CommentRow[];
}

const SLIDE_INTERVAL_MS = 5000;
const FEATURED_COUNT = 5;
const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** 방향(direction)에 따라 좌/우로 슬라이드되는 전환 변형 */
const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -48 : 48 }),
};

/**
 * 상단 추천 캐러셀 (토스테크 히어로 스타일)
 * - 좌측: 카테고리/제목/메타, 하단에 이전·다음 화살표
 * - 우측: 카테고리 썸네일 이미지
 * - 5초마다 자동 전환, framer-motion 방향 인지 슬라이드
 */
export function FeaturedCarousel({
  posts,
  categories,
  comments,
}: FeaturedCarouselProps) {
  const featured = posts.slice(0, FEATURED_COUNT);
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);

  const paginate = useCallback(
    (dir: number) => {
      setState(([prev]) => [
        (prev + dir + featured.length) % featured.length,
        dir,
      ]);
    },
    [featured.length],
  );

  const goTo = useCallback(
    (next: number) => {
      setState(([prev]) => [next, next > prev ? 1 : -1]);
    },
    [],
  );

  useEffect(() => {
    if (featured.length <= 1) return;
    const id = window.setInterval(() => paginate(1), SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [featured.length, paginate]);

  if (featured.length === 0) return null;

  const post = featured[index];
  const category = categories.find((cat) => cat.id === post.category_id);
  const categoryName = category?.name || "미분류";
  const categorySlug = lowerURL(category?.name || "");
  const thumbnailUrl = category?.thumbnail;
  const commentCount = comments.filter(
    (comment) => comment.post_id === post.id,
  ).length;

  return (
    <section aria-label="추천 게시물" className="w-full">
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.article
            key={post.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: easeOut }}
          >
            <Link
              href={`/posts/${categorySlug}/${post.id}`}
              className="group grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
            >
              {/* 좌측: 텍스트 */}
              <div className="flex flex-col gap-4 order-2 lg:order-1">
                <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                  {categoryName}
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-gray-900 dark:text-gray-100 line-clamp-3 group-hover:text-gray-700 dark:group-hover:text-white transition-colors">
                  {post.title}
                </h2>
                <div className="flex items-center gap-3 text-sm text-metricsText">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {post.author_name || "익명"}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-zinc-600" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-metricsText">
                  <span className="flex items-center gap-1.5">
                    <EyeIcon size={16} />
                    {post.view_count ?? 0}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HeartIcon size={16} />
                    {post.like_count ?? 0}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquareTextIcon size={16} />
                    {commentCount}
                  </span>
                </div>
              </div>

              {/* 우측: 이미지 */}
              <div className="relative order-1 lg:order-2 h-52 md:h-64 lg:h-80 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900">
                {thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt={post.title}
                    fill
                    priority
                    quality={70}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 640px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-metricsText">
                    <Grid2X2Plus size={40} />
                  </div>
                )}
              </div>
            </Link>
          </motion.article>
        </AnimatePresence>
      </div>

      {/* 컨트롤: 이전·다음 화살표 + 인디케이터 */}
      {featured.length > 1 && (
        <div className="mt-6 flex items-center gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="이전 게시물"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="다음 게시물"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex gap-1.5">
            {featured.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${i + 1}번째 게시물`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? "w-6 bg-gray-900 dark:bg-gray-100"
                    : "w-1.5 bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 dark:hover:bg-zinc-600"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
