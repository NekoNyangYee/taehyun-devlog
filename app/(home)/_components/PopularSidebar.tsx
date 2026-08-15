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
    <section className="min-w-0 rounded-3xl bg-gray-100 p-6 dark:bg-zinc-900">
      <h2 className="mb-5 text-lg font-bold text-gray-700 dark:text-gray-200">
        인기 아티클
      </h2>
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {posts.map((post, i) => {
          const category = categories.find(
            (cat) => cat.id === post.category_id,
          );
          const categorySlug = lowerURL(category?.name || "");

          return (
            <li key={post.id}>
              <Link
                href={`/articles/${categorySlug}/${post.slug}`}
                className="group flex min-w-0 items-start gap-3 px-1 py-2"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white font-mono text-sm font-bold text-blue-600 dark:bg-zinc-800 dark:text-blue-400">
                  {i + 1}
                </span>
                <div className="min-w-0 flex flex-col gap-1 pt-1">
                  <p className="line-clamp-2 text-sm font-semibold leading-relaxed text-gray-800 transition-colors group-hover:text-gray-500 dark:text-gray-100 dark:group-hover:text-gray-300">
                    {post.title}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
