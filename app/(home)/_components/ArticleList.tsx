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
                <div className="group flex min-w-0 items-center gap-5 sm:gap-8">
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
                      <CategoryLabel
                        name={categoryName}
                        href={category ? `/articles?category=${category.id}` : "/articles"}
                      />
                      <span className="max-w-40 truncate rounded-md bg-gray-100 px-2.5 py-1 font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
                        {post.author_name}
                      </span>
                    </div>

                    <Link href={`/articles/${categorySlug}/${post.slug}`}>
                      <h3 className="mt-1 line-clamp-2 text-xl font-bold leading-snug tracking-[-0.02em] text-gray-950 transition-colors group-hover:text-gray-500 dark:text-gray-100 dark:group-hover:text-gray-300 sm:text-2xl">
                        {post.title}
                      </h3>
                    </Link>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-metricsText">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={15} />
                        {formatDate(post.created_at)}
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
                    <Link
                      href={`/articles/${categorySlug}/${post.slug}`}
                      className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-900 sm:h-32 sm:w-56"
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
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
