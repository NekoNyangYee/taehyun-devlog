"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PostCard } from "./PostCard";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { CommentRow } from "@components/types/comment";
import { lowerURL } from "@components/lib/util/lowerURL";

interface PostCarouselProps {
  posts: PostStateWithoutContents[];
  categories: Category[];
  comments: CommentRow[];
}

const SLIDE_INTERVAL_MS = 5000;

/**
 * 자동 슬라이드쇼 — 5초마다 한 게시물씩 교체.
 * framer-motion의 AnimatePresence로 페이드/슬라이드 전환.
 */
export function PostCarousel({
  posts,
  categories,
  comments,
}: PostCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % posts.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [posts.length]);

  if (posts.length === 0) return null;

  const post = posts[index];
  const category = categories.find((cat) => cat.id === post.category_id);
  const thumbnailUrl = category?.thumbnail;
  const categoryName = category?.name || "미분류";
  const categorySlug = lowerURL(category?.name || "");
  const commentCount = comments.filter(
    (comment) => comment.post_id === post.id,
  ).length;

  return (
    <section
      aria-label="게시물 슬라이드"
      className="w-full flex flex-col items-center gap-4"
    >
      <div className="relative w-full max-w-[320px] min-h-[420px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <PostCard
              post={post}
              categoryName={categoryName}
              categorySlug={categorySlug}
              thumbnailUrl={thumbnailUrl}
              commentCount={commentCount}
              variant="default"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 인디케이터 — 현재 슬라이드 표시 */}
      {posts.length > 1 && (
        <div className="flex gap-1.5">
          {posts.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}번째 게시물`}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-gray-900 dark:bg-gray-100"
                  : "w-1.5 bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 dark:hover:bg-zinc-600"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
