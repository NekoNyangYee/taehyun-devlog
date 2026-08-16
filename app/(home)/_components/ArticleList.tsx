"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  HeartIcon,
  MessageSquareTextIcon,
} from "lucide-react";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { CommentCountRow } from "@components/queries/commentQueries";
import { lowerURL } from "@components/lib/util/lowerURL";
import { CategoryLabel } from "@components/components/CategoryLabel";
import { formatDate } from "@components/lib/util/dayjs";
import { cn } from "@components/lib/utils";

interface ArticleListProps {
  posts: PostStateWithoutContents[];
  categories: Category[];
  comments: CommentCountRow[];
  isFetching?: boolean;
}

export function ArticleList({
  posts,
  categories,
  comments,
  isFetching = false,
}: ArticleListProps) {
  return (
    <section className="min-w-0">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-[-0.03em] text-gray-950 dark:text-white">
          전체 아티클
        </h2>
      </div>

      {posts.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-metricsText">아티클이 없습니다.</p>
        </div>
      ) : (
        <ul
          className={`m-0 flex list-none flex-col gap-10 p-0 ${
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
              <li key={post.id}>
                <div
                  className={cn(
                    "group grid min-w-0 items-center gap-y-3",
                    thumbnailUrl
                      ? "grid-cols-[minmax(0,1fr)_8rem] gap-x-5 sm:grid-cols-[minmax(0,1fr)_14rem] sm:gap-x-8"
                      : "grid-cols-1",
                  )}
                >
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                    <div className="flex min-w-0 items-center text-xs">
                      <CategoryLabel
                        name={categoryName}
                        href={category ? `/articles?category=${category.id}` : "/articles"}
                      />
                    </div>

                    <Link href={`/articles/${categorySlug}/${post.slug}`}>
                      <h3 className="mt-1 line-clamp-2 text-xl font-bold leading-snug tracking-[-0.02em] text-gray-950 transition-colors group-hover:text-gray-500 dark:text-gray-100 dark:group-hover:text-gray-300 sm:text-2xl">
                        {post.title}
                      </h3>
                    </Link>
                  </div>

                  {thumbnailUrl && (
                    <Link
                      href={`/articles/${categorySlug}/${post.slug}`}
                      className="relative col-start-2 row-start-1 h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:row-span-2 sm:h-32 sm:w-56 dark:bg-zinc-900"
                    >
                      <Image
                        src={thumbnailUrl}
                        alt={post.title}
                        fill
                        quality={65}
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 128px, 224px"
                      />
                    </Link>
                  )}

                  <div
                    className={cn(
                      "row-start-2 flex min-w-0 items-center justify-between text-xs text-metricsText sm:mt-1 sm:text-sm",
                      thumbnailUrl
                        ? "col-span-2 sm:col-span-1 sm:col-start-1"
                        : "col-start-1",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
                      <CalendarDays className="shrink-0" size={15} />
                      {formatDate(post.created_at)}
                    </span>
                    <span className="ml-4 flex shrink-0 items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <HeartIcon size={15} />
                        {post.like_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageSquareTextIcon size={15} />
                        {commentCount}
                      </span>
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
