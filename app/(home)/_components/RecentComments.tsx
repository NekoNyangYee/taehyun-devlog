"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { CommentRow } from "@components/types/comment";
import { lowerURL } from "@components/lib/util/lowerURL";

interface RecentCommentsProps {
  comments: CommentRow[];
  posts: PostStateWithoutContents[];
  categories: Category[];
}

const RECENT_COUNT = 5;
const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut, staggerChildren: 0.06 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, x: 12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: easeOut } },
};

/**
 * 최신 댓글 사이드바 — 최근 작성된 댓글과 해당 게시물 링크
 */
export function RecentComments({
  comments,
  posts,
  categories,
}: RecentCommentsProps) {
  // 서버에서 이미 승인·최신순·limit 처리되어 옴 (방어적으로 한 번 더 자른다)
  const recent = comments.slice(0, RECENT_COUNT);

  if (recent.length === 0) return null;

  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="min-w-0 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-5"
    >
      <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-gray-100">
        최신 댓글
      </h3>
      <ul className="flex flex-col gap-4 list-none p-0 m-0">
        {recent.map((comment) => {
          const post = posts.find((p) => p.id === comment.post_id);
          const category = post
            ? categories.find((cat) => cat.id === post.category_id)
            : undefined;
          const categorySlug = lowerURL(category?.name || "");
          const href = post
            ? `/posts/${categorySlug}/${post.id}`
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
            <motion.li
              key={comment.id}
              variants={item}
              className="border-b border-gray-100 dark:border-white/10 pb-4 last:border-b-0 last:pb-0"
            >
              {href ? (
                <Link href={href} className="group block min-w-0">
                  {body}
                </Link>
              ) : (
                body
              )}
            </motion.li>
          );
        })}
      </ul>
    </motion.section>
  );
}
