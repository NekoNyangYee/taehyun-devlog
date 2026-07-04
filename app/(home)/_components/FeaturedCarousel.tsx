"use client";

import { useCallback, useState } from "react";
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
import { CommentCountRow } from "@components/queries/commentQueries";
import { lowerURL } from "@components/lib/util/lowerURL";
import { formatDate } from "@components/lib/util/dayjs";

interface FeaturedCarouselProps {
  posts: PostStateWithoutContents[];
  categories: Category[];
  comments: CommentCountRow[];
}

const FEATURED_COUNT = 5;

export function FeaturedCarousel({
  posts,
  categories,
  comments,
}: FeaturedCarouselProps) {
  const featured = posts.slice(0, FEATURED_COUNT);
  const [index, setIndex] = useState(0);

  const paginate = useCallback(
    (dir: number) => {
      setIndex((prev) => (prev + dir + featured.length) % featured.length);
    },
    [featured.length],
  );

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
        <article key={post.id}>
          <Link
            href={`/posts/${categorySlug}/${post.slug}`}
            className="group grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
          >
            <div className="flex flex-col gap-4 order-2 lg:order-1">
              <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                {categoryName}
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-gray-900 dark:text-gray-100 line-clamp-3 group-hover:text-gray-700 dark:group-hover:text-white">
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

            <div className="relative order-1 lg:order-2 h-52 md:h-64 lg:h-80 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900">
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
        </article>
      </div>

      {featured.length > 1 && (
        <div className="mt-6 flex items-center gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="이전 게시물"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="다음 게시물"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex gap-1.5">
            {featured.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}번째 게시물`}
                className={`h-1.5 rounded-full ${
                  i === index
                    ? "w-8 bg-gray-900 dark:bg-gray-100"
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
