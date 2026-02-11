import Link from "next/link";
import { BookmarkIcon, EyeIcon, HeartIcon, MessageSquareTextIcon } from "lucide-react";
import { formatDate } from "@components/lib/util/dayjs";
import { cn } from "@components/lib/utils";
import { PostStateWithoutContents } from "@components/types/post";

/**
 * 게시물 그리드 카드 컴포넌트 (Presentational)
 * - 북마크 버튼 포함
 * - 순수하게 화면만 렌더링
 */
interface PostGridCardProps {
    post: PostStateWithoutContents;
    categoryName: string;
    categorySlug: string;
    thumbnailUrl?: string;
    commentCount: number;
    isBookmarked: boolean;
    showBookmark: boolean;
    onBookmarkToggle: (e: React.MouseEvent) => void;
}

export function PostGridCard({
    post,
    categoryName,
    categorySlug,
    thumbnailUrl,
    commentCount,
    isBookmarked,
    showBookmark,
    onBookmarkToggle,
}: PostGridCardProps) {
    return (
        <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-containerColor/70 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
            <Link
                href={`/posts/${encodeURIComponent(categorySlug)}/${post.id}`}
                className="flex flex-col h-full"
            >
                <div className="relative h-40 w-full bg-gray-100">
                    {thumbnailUrl ? (
                        <img
                            src={thumbnailUrl}
                            alt="Post Thumbnail"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm text-metricsText">
                            이미지 없음
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-center justify-between">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            {categoryName}
                        </span>
                        {showBookmark && (
                            <button
                                onClick={onBookmarkToggle}
                                className="relative z-20 pointer-events-auto"
                                type="button"
                            >
                                <BookmarkIcon
                                    size={18}
                                    className={cn(
                                        isBookmarked ? "fill-yellow-500 stroke-none" : "fill-none"
                                    )}
                                />
                            </button>
                        )}
                    </div>

                    <h3 className="truncate text-lg font-semibold leading-tight text-gray-900">
                        {post.title}
                    </h3>
                    <p className="text-sm text-metricsText">by {post.author_name || "익명"}</p>
                    <p className="text-sm text-metricsText">{formatDate(post.created_at)}</p>

                    <div className="mt-auto flex items-center gap-4 pt-3 text-sm text-metricsText">
                        <span className="flex items-center gap-1">
                            <EyeIcon size={16} />
                            {post.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                            <HeartIcon size={16} />
                            {post.like_count}
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageSquareTextIcon size={16} />
                            {commentCount}
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
}
