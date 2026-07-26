"use client";

import Link from "next/link";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { lowerURL } from "@components/lib/util/lowerURL";
import { HomePanelHeader } from "./HomePanelHeader";

interface PopularSidebarProps {
  posts: PostStateWithoutContents[];
  categories: Category[];
}

export function PopularSidebar({ posts, categories }: PopularSidebarProps) {
  if (posts.length === 0) return null;

  return (
    <section className="min-w-0 overflow-hidden bg-white dark:bg-zinc-950">
      <HomePanelHeader title="Popular Posts" />
      <ol className="m-0 flex list-none flex-col p-0">
        {posts.map((post, i) => {
          const category = categories.find(
            (cat) => cat.id === post.category_id,
          );
          const categorySlug = lowerURL(category?.name || "");

          return (
            <li
              key={post.id}
              className="border-b border-gray-200 last:border-b-0 dark:border-white/10"
            >
              <Link
                href={`/posts/${categorySlug}/${post.slug}`}
                className="group flex min-w-0 items-start gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
              >
                <span className="shrink-0 font-mono text-sm font-bold leading-snug text-blue-600 dark:text-blue-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex flex-col gap-1">
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-800 dark:text-gray-100 group-hover:text-gray-500 dark:group-hover:text-white">
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
