import Link from "next/link";
import {
  BookmarkIcon,
  Clock3Icon,
  ImageIcon,
} from "lucide-react";
import { cn } from "@components/lib/utils";
import { formatDate } from "@components/lib/util/dayjs";
import { PostStateWithoutContents } from "@components/types/post";
import { CategoryLabel } from "./CategoryLabel";

interface PostListItemProps {
  post: PostStateWithoutContents;
  categoryName: string;
  categorySlug: string;
  thumbnailUrl?: string;
  showBookmark?: boolean;
  isBookmarked?: boolean;
  onBookmarkToggle?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function PostListItem({
  post,
  categoryName,
  categorySlug,
  thumbnailUrl,
  showBookmark = false,
  isBookmarked = false,
  onBookmarkToggle,
}: PostListItemProps) {
  return (
    <article className="relative h-32 border-b border-gray-200 last:border-b-0 dark:border-white/10 sm:h-36">
      <Link
        href={`/posts/${encodeURIComponent(categorySlug)}/${post.slug}`}
        className="group flex h-full min-w-0 items-stretch transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
      >
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col justify-center px-4 py-3 sm:px-5 sm:py-5",
            showBookmark && "pr-14 sm:pr-14",
          )}
        >
          <h3 className="line-clamp-2 shrink-0 text-lg font-semibold leading-snug text-gray-950 transition-colors group-hover:text-gray-600 dark:text-gray-50 dark:group-hover:text-white sm:text-xl">
            {post.title}
          </h3>

          <div className="mt-2 flex min-w-0 shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-metricsText sm:mt-3 sm:gap-y-2">
            <CategoryLabel name={categoryName} />
            <span className="flex items-center gap-1.5">
              <Clock3Icon size={13} />
              {formatDate(post.created_at)}
            </span>
          </div>
        </div>

        <div className="relative h-full w-40 shrink-0 border-l border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-zinc-900 sm:w-60">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-metricsText">
              <ImageIcon size={24} />
            </div>
          )}
        </div>
      </Link>

      {showBookmark && (
        <button
          type="button"
          onClick={onBookmarkToggle}
          aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
          className="absolute right-[10.5rem] top-2 z-10 flex h-8 w-8 items-center justify-center border border-gray-200 bg-white/90 text-gray-600 transition-colors hover:bg-white hover:text-gray-950 dark:border-white/15 dark:bg-zinc-950/90 dark:text-gray-300 dark:hover:bg-zinc-900 dark:hover:text-white sm:right-[15.5rem]"
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
