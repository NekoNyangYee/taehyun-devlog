"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  EyeIcon,
  Grid2X2Plus,
  HeartIcon,
  MessageSquareTextIcon,
} from "lucide-react";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { CommentCountRow } from "@components/queries/commentQueries";
import { lowerURL } from "@components/lib/util/lowerURL";
import { formatDate } from "@components/lib/util/dayjs";

interface FeaturedCarouselProps {
  posts: PostStateWithoutContents[];
  categories: Category[];
  comments: CommentCountRow[];
}

const FEATURED_COUNT = 5;
const AUTO_PLAY_MS = 5000;
const carouselVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 48 : -48,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -48 : 48,
  }),
};

export function FeaturedCarousel({
  posts,
  categories,
  comments,
}: FeaturedCarouselProps) {
  const featured = posts.slice(0, FEATURED_COUNT);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  const updateProgress = useCallback((next: number) => {
    progressRef.current = next;
    setProgress(next);
  }, []);

  const paginate = useCallback(
    (dir: number) => {
      setIsPaused(false);
      updateProgress(0);
      setDirection(dir);
      setIndex((prev) => (prev + dir + featured.length) % featured.length);
    },
    [featured.length, updateProgress],
  );

  useEffect(() => {
    updateProgress(0);
  }, [index, updateProgress]);

  useEffect(() => {
    if (featured.length <= 1 || isPaused) return;

    let frame = 0;
    const startedAt = window.performance.now();

    const tick = (now: number) => {
      const nextProgress = Math.min((now - startedAt) / AUTO_PLAY_MS, 1);
      updateProgress(nextProgress);

      if (nextProgress >= 1) {
        updateProgress(0);
        paginate(1);
        return;
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [featured.length, index, isPaused, paginate, updateProgress]);

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
    <section
      aria-label="추천 게시물"
      className="w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.article
            key={post.id}
            custom={direction}
            variants={carouselVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={`/posts/${categorySlug}/${post.slug}`}
              className="group grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12"
            >
              <div className="order-2 flex flex-col gap-4 lg:order-1">
                <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                  {categoryName}
                </span>
                <h2 className="line-clamp-3 text-2xl font-bold leading-tight text-gray-900 group-hover:text-gray-700 dark:text-gray-100 dark:group-hover:text-white md:text-3xl lg:text-4xl">
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

              <div className="relative order-1 h-52 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900 md:h-64 lg:order-2 lg:h-80">
                {thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt={post.title}
                    fill
                    priority
                    quality={70}
                    className="object-cover"
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

      {featured.length > 1 && (
        <div className="mt-6 flex items-center gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="이전 게시물"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="다음 게시물"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex gap-1.5">
            {featured.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (i === index) return;
                  setIsPaused(false);
                  updateProgress(0);
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
                aria-label={`${i + 1}번째 게시물`}
                className={`relative h-1.5 overflow-hidden rounded-full transition-all ${
                  i === index
                    ? "w-8 bg-gray-300 dark:bg-zinc-700"
                    : "w-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                }`}
              >
                {i === index && (
                  <motion.span
                    className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gray-900 dark:bg-gray-100"
                    animate={{ scaleX: progress }}
                    transition={{ duration: 0.08, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
