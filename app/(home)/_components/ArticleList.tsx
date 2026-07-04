"use client";

import Image from "next/image";
import Link from "next/link";
import {
  EyeIcon,
  HeartIcon,
  MessageSquareTextIcon,
} from "lucide-react";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { CommentCountRow } from "@components/queries/commentQueries";
import { lowerURL } from "@components/lib/util/lowerURL";

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
    <section className="min-w-0 flex flex-col gap-2">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
        전체 아티클
      </h2>

      {posts.length === 0 ? (
        <div className="mt-4 flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-white/15">
          <p className="text-metricsText">게시물이 없습니다.</p>
        </div>
      ) : (
        <ul
          className={`flex flex-col list-none p-0 m-0 ${
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
              <li
                key={post.id}
                className="border-b border-gray-100 dark:border-white/10"
              >
                <Link
                  href={`/posts/${categorySlug}/${post.slug}`}
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

                    <h3 className="line-clamp-2 text-lg sm:text-xl font-semibold leading-snug text-gray-900 dark:text-gray-100 group-hover:text-gray-600 dark:group-hover:text-white">
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
                        className="object-cover"
                        sizes="(max-width: 640px) 112px, 176px"
                      />
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
