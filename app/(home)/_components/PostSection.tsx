"use client";

import { PostCard } from "./PostCard";
import { ScrollControls } from "./ScrollControls";
import { useHorizontalScroll } from "../_hooks/useHorizontalScroll";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { CommentCountRow } from "@components/queries/commentQueries";
import { lowerURL } from "@components/lib/util/lowerURL";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PostSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  posts: PostStateWithoutContents[];
  categories: Category[];
  comments: CommentCountRow[];
  variant?: "default" | "popular";
  showViewAll?: boolean;
}

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
    <section className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
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
            href="/articles"
            className="group flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition shrink-0"
          >
            전체보기
            <ChevronRight
              size={18}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/15 bg-white dark:bg-zinc-900">
          <p className="text-lg font-semibold text-metricsText">
            아티클이 없습니다.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div
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
                  <div key={post.id}>
                    <PostCard
                      post={post}
                      categoryName={categoryName}
                      categorySlug={categorySlug}
                      thumbnailUrl={thumbnailUrl}
                      commentCount={commentCount}
                      variant={variant}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <ScrollControls
            canScrollLeft={canScrollLeft}
            canScrollRight={canScrollRight}
            onScrollLeft={() => scroll("left")}
            onScrollRight={() => scroll("right")}
          />
        </div>
      )}
    </section>
  );
}
