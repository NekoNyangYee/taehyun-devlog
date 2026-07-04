"use client";

import Link from "next/link";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { lowerURL } from "@components/lib/util/lowerURL";

interface PopularSidebarProps {
  posts: PostStateWithoutContents[];
  categories: Category[];
}

export function PopularSidebar({ posts, categories }: PopularSidebarProps) {
  if (posts.length === 0) return null;

  return (
    <section className="min-w-0 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-5">
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
            <li key={post.id}>
              <Link
                href={`/posts/${categorySlug}/${post.slug}`}
                className="group flex min-w-0 items-start gap-3"
              >
                <span className="shrink-0 text-lg font-bold leading-snug text-blue-500 dark:text-blue-400">
                  {i + 1}
                </span>
                <div className="min-w-0 flex flex-col gap-1">
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-800 dark:text-gray-100 group-hover:text-gray-500 dark:group-hover:text-white">
                    {post.title}
                  </p>
                  <span className="text-xs text-metricsText">
                    {post.author_name || "익명"}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
