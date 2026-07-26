"use client";

import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { CommentRow } from "@components/types/comment";
import { lowerURL } from "@components/lib/util/lowerURL";
import { HomePanelHeader } from "./HomePanelHeader";

interface RecentCommentsProps {
  comments: CommentRow[];
  posts: PostStateWithoutContents[];
  categories: Category[];
}

const RECENT_COUNT = 5;

export function RecentComments({
  comments,
  posts,
  categories,
}: RecentCommentsProps) {
  const recent = comments.slice(0, RECENT_COUNT);

  return (
    <section className="min-w-0 overflow-hidden border-t border-gray-200 bg-white dark:border-white/10 dark:bg-zinc-950">
      <HomePanelHeader title="Recent Comments" />

      {recent.length === 0 ? (
        <div className="flex min-h-24 items-center justify-center px-4 text-center text-sm text-metricsText">
          아직 표시할 댓글이 없습니다.
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {recent.map((comment) => {
            const post = posts.find((p) => p.id === comment.post_id);
            const category = post
              ? categories.find((cat) => cat.id === post.category_id)
              : undefined;
            const categorySlug = lowerURL(category?.name || "");
            const href = post
              ? `/posts/${categorySlug}/${post.slug}`
              : undefined;

            const body = (
              <div className="min-w-0 flex flex-col gap-1.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-700">
                    {comment.profile_image ? (
                      <Image
                        src={comment.profile_image}
                        alt={comment.author_name}
                        fill
                        quality={50}
                        className="object-cover"
                        sizes="24px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-metricsText">
                        <UserRound size={14} />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 truncate text-xs font-medium text-gray-800 dark:text-gray-100">
                    {comment.author_name}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm leading-snug text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
                {post && (
                  <span className="line-clamp-1 text-xs text-metricsText">
                    {post.title}
                  </span>
                )}
              </div>
            );

            return (
              <li
                key={comment.id}
                className="border-b border-gray-200 px-4 py-3.5 last:border-b-0 dark:border-white/10"
              >
                {href ? (
                  <Link href={href} className="group block min-w-0">
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
