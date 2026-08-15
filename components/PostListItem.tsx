import Link from "next/link";
import {
  BookmarkIcon,
  CalendarDays,
  HeartIcon,
  ImageIcon,
  MessageSquareTextIcon,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@components/lib/utils";
import { formatDate } from "@components/lib/util/dayjs";
import { PostStateWithoutContents } from "@components/types/post";
import { CategoryLabel } from "./CategoryLabel";

interface PostListItemProps {
  post: PostStateWithoutContents;
  categoryName: string;
  categorySlug: string;
  thumbnailUrl?: string;
  commentCount?: number;
  showBookmark?: boolean;
  isBookmarked?: boolean;
  onBookmarkToggle?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "default" | "compact";
}

export function PostListItem({
  post,
  categoryName,
  categorySlug,
  thumbnailUrl,
  commentCount = 0,
  showBookmark = false,
  isBookmarked = false,
  onBookmarkToggle,
  variant = "default",
}: PostListItemProps) {
  const isCompact = variant === "compact";

  return (
    <article className="relative min-w-0">
      <Link
        href={`/articles/${encodeURIComponent(categorySlug)}/${post.slug}`}
        className={cn(
          "group flex min-w-0 items-center",
          isCompact
            ? "min-h-20 gap-4 sm:min-h-24 sm:gap-5"
            : "min-h-24 gap-5 sm:min-h-32 sm:gap-8",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col justify-center",
            isCompact ? "gap-1.5" : "gap-2",
          )}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
            <CategoryLabel name={categoryName} />
            <span className="max-w-40 truncate rounded-md bg-gray-100 px-2.5 py-1 font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
              {post.author_name}
            </span>
          </div>

          <h3
            className={cn(
              "mt-1 line-clamp-2 font-bold leading-snug tracking-[-0.02em] text-gray-950 transition-colors group-hover:text-gray-500 dark:text-gray-100 dark:group-hover:text-gray-300",
              isCompact ? "text-base sm:text-lg" : "text-xl sm:text-2xl",
            )}
          >
            {post.title}
          </h3>

          <div
            className={cn(
              "flex min-w-0 shrink-0 flex-wrap items-center text-metricsText",
              isCompact ? "mt-1 gap-3 text-xs" : "mt-2 gap-4 text-sm",
            )}
          >
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

        <span
          className={cn(
            "relative shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-900",
            isCompact
              ? "h-20 w-28 sm:h-24 sm:w-40"
              : "h-24 w-32 sm:h-32 sm:w-56",
          )}
        >
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={post.title}
              fill
              quality={65}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 128px, 224px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-metricsText">
              <ImageIcon size={24} />
            </div>
          )}
        </span>
      </Link>

      {showBookmark && (
        <button
          type="button"
          onClick={onBookmarkToggle}
          aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
          className="absolute right-36 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:bg-zinc-950/90 dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-white sm:right-60"
        >
          <BookmarkIcon
            size={16}
            className={cn(
              isBookmarked
                ? "fill-yellow-500 text-yellow-500"
                : "fill-none",
            )}
          />
        </button>
      )}
    </article>
  );
}
