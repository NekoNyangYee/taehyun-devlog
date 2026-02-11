import Image from "next/image";
import Link from "next/link";
import { EyeIcon, HeartIcon, MessageSquareTextIcon, Grid2X2Plus } from "lucide-react";
import { formatDate } from "@components/lib/util/dayjs";
import { PostStateWithoutContents } from "@components/types/post";

/**
 * 게시물 카드 컴포넌트 (Presentational)
 * - Props로 모든 데이터 받음
 * - 순수하게 화면만 렌더링
 * - 로직 없음, 상태 없음
 */
interface PostCardProps {
    post: PostStateWithoutContents;
    categoryName: string;
    categorySlug: string;
    thumbnailUrl?: string;
    commentCount: number;
    variant?: "default" | "popular";
}

export function PostCard({
    post,
    categoryName,
    categorySlug,
    thumbnailUrl,
    commentCount,
    variant = "default",
}: PostCardProps) {
    const isPopular = variant === "popular";

    return (
        <Link
            href={`/posts/${categorySlug}/${post.id}`}
            className="min-w-[300px] max-w-[300px]"
        >
            <article className="group h-full flex flex-col overflow-hidden rounded-2xl border border-containerColor/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-containerColor relative">
                {isPopular && (
                    <div className="absolute top-3 right-3 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white flex items-center gap-1">
                        <HeartIcon size={12} fill="currentColor" />
                        인기
                    </div>
                )}

                <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {thumbnailUrl ? (
                        <Image
                            src={thumbnailUrl}
                            alt={post.title}
                            fill
                            quality={65}
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-metricsText">
                            <Grid2X2Plus size={32} />
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-center justify-between gap-2">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${isPopular
                                ? "bg-red-50 text-red-600"
                                : "bg-gray-100 text-gray-600"
                                }`}
                        >
                            {categoryName}
                        </span>
                    </div>

                    <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-gray-900 group-hover:text-gray-700 transition">
                        {post.title}
                    </h3>

                    <p className="text-sm text-metricsText">by {post.author_name || "익명"}</p>
                    <p className="text-xs text-metricsText">{formatDate(post.created_at)}</p>

                    <div className="mt-auto flex items-center gap-4 pt-4 text-sm text-metricsText border-t border-gray-100">
                        <span
                            className={`flex items-center gap-1.5 ${isPopular ? "font-semibold text-gray-700" : "hover:text-gray-700"
                                } transition`}
                        >
                            <EyeIcon size={16} />
                            {post.view_count ?? 0}
                        </span>
                        <span
                            className={`flex items-center gap-1.5 ${isPopular
                                ? "font-semibold text-red-500"
                                : "hover:text-gray-700 transition"
                                }`}
                        >
                            <HeartIcon size={16} />
                            {post.like_count ?? 0}
                        </span>
                        <span className="flex items-center gap-1.5 hover:text-gray-700 transition">
                            <MessageSquareTextIcon size={16} />
                            {commentCount}
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
