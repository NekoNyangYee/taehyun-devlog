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
          "group grid min-w-0 items-center",
          isCompact
            ? "min-h-20 grid-cols-[minmax(0,1fr)_7rem] gap-x-4 gap-y-3 sm:min-h-24 sm:grid-cols-[minmax(0,1fr)_10rem] sm:gap-x-5"
            : "min-h-24 grid-cols-[minmax(0,1fr)_8rem] gap-x-5 gap-y-3 sm:min-h-32 sm:grid-cols-[minmax(0,1fr)_14rem] sm:gap-x-8",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col justify-center",
            isCompact ? "gap-1.5" : "gap-2",
          )}
        >
          <div className="flex min-w-0 items-center text-xs">
            <CategoryLabel name={categoryName} />
          </div>

          <h3
            className={cn(
              "mt-1 line-clamp-2 font-bold leading-snug tracking-[-0.02em] text-gray-950 transition-colors group-hover:text-gray-500 dark:text-gray-100 dark:group-hover:text-gray-300",
              isCompact ? "text-base sm:text-lg" : "text-xl sm:text-2xl",
            )}
          >
            {post.title}
          </h3>

        </div>

        <span
          className={cn(
            "relative col-start-2 row-start-1 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:row-span-2 dark:bg-zinc-900",
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

        <div
          className={cn(
            "col-span-2 row-start-2 flex min-w-0 items-center justify-between text-metricsText sm:col-span-1 sm:col-start-1",
            isCompact ? "text-xs" : "text-xs sm:mt-1 sm:text-sm",
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
