import Link from "next/link";
import { BookmarkIcon, EyeIcon, HeartIcon, MessageSquareTextIcon } from "lucide-react";
import { formatDate } from "@components/lib/util/dayjs";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { lowerURL } from "@components/lib/util/lowerURL";

/**
 * 사용자 게시물 섹션 컴포넌트 (Presentational)
 * - 사용자가 작성한 게시물 목록 표시
 */
interface UserPostsSectionProps {
    posts: PostStateWithoutContents[];
    categories: Category[];
    commentCountMap: Map<number, number>;
}

export function UserPostsSection({
    posts,
    categories,
    commentCountMap,
}: UserPostsSectionProps) {
    if (posts.length === 0) {
        return (
            <section className="space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold">내가 작성한 글</h2>
                        <p className="text-sm text-metricsText">
                            총 0개의 게시물이 있습니다.
                        </p>
                    </div>
                </div>
                <div className="flex h-40 md:h-56 flex-col items-center justify-center rounded-container border border-dashed border-containerColor bg-white text-center text-metricsText">
                    <p className="text-base font-medium">
                        아직 작성한 게시물이 없습니다.
                    </p>
                    <Link
                        href="/posts"
                        className="mt-3 rounded-button border border-containerColor px-4 py-2 text-sm transition hover:bg-gray-100"
                    >
                        게시물 보러가기
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">내가 작성한 글</h2>
                    <p className="text-sm text-metricsText">
                        총 {posts.length}개의 게시물이 있습니다.
                    </p>
                </div>
                <Link
                    href="/posts"
                    className="self-start rounded-button border border-containerColor px-4 py-2 text-sm text-metricsText transition hover:bg-gray-100"
                >
                    전체 게시물 보기
                </Link>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {posts.slice(0, 6).map((post) => {
                    const category = categories.find((cat) => cat.id === post.category_id);
                    const imageUrl = category?.thumbnail;
                    const categoryName = category?.name || "미분류";
                    const categorySlug = category ? lowerURL(category.name) : "posts";
                    const commentCount = commentCountMap.get(post.id) || 0;

                    return (
                        <Link
                            key={post.id}
                            href={`/posts/${categorySlug}/${post.id}`}
                            className="group"
                        >
                            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-containerColor/70 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                                <div className="relative h-32 sm:h-36 md:h-40 w-full bg-gray-100">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={`${categoryName} 썸네일`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm text-metricsText">
                                            이미지 없음
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                                    <div className="flex items-center justify-between">
                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                            {categoryName}
                                        </span>
                                        <BookmarkIcon
                                            size={18}
                                            className="text-yellow-500"
                                            fill="currentColor"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <h3 className="truncate text-lg font-semibold leading-tight text-gray-900">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-metricsText">by {post.author_name || "익명"}</p>
                                    <p className="text-sm text-metricsText">
                                        {formatDate(post.created_at)}
                                    </p>
                                    <div className="mt-auto flex items-center gap-4 pt-3 text-sm text-metricsText">
                                        <span className="flex items-center gap-1">
                                            <EyeIcon size={16} />
                                            {post.view_count ?? 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <HeartIcon size={16} />
                                            {post.like_count ?? 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageSquareTextIcon size={16} />
                                            {commentCount}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
