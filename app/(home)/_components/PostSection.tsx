"use client";

import { PostCard } from "./PostCard";
import { ScrollControls } from "./ScrollControls";
import { useHorizontalScroll } from "../_hooks/useHorizontalScroll";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { CommentRow } from "@components/types/comment";
import { lowerURL } from "@components/lib/util/lowerURL";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * 게시물 섹션 컴포넌트
 * - 수평 스크롤 가능한 게시물 목록
 * - Hook으로 로직 분리
 * - Presentational 컴포넌트 조합
 */
interface PostSectionProps {
    title: string;
    description: string;
    icon: LucideIcon;
    iconColor?: string;
    posts: PostStateWithoutContents[];
    categories: Category[];
    comments: CommentRow[];
    variant?: "default" | "popular";
    showViewAll?: boolean;
}

export function PostSection({
    title,
    description,
    icon: Icon,
    iconColor = "text-gray-900",
    posts,
    categories,
    comments,
    variant = "default",
    showViewAll = false,
}: PostSectionProps) {
    const { scrollRef, canScrollLeft, canScrollRight, scroll, checkScroll } =
        useHorizontalScroll();

    if (posts.length === 0) {
        return (
            <section className="flex flex-col gap-6 md:px-0">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="flex gap-3 text-3xl md:text-4xl font-bold items-center">
                            <Icon size={32} className={iconColor} />
                            {title}
                        </h2>
                        <p className="text-metricsText text-sm md:text-base">{description}</p>
                    </div>
                </div>
                <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-containerColor bg-white">
                    <p className="text-lg font-semibold text-metricsText">
                        게시물이 없습니다.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="flex flex-col gap-6 md:px-0">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h2 className="flex gap-3 text-3xl md:text-4xl font-bold items-center">
                        <Icon size={32} className={iconColor} />
                        {title}
                    </h2>
                    <p className="text-metricsText text-sm md:text-base">{description}</p>
                </div>
                {showViewAll && (
                    <Link
                        href="/posts"
                        className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900 transition"
                    >
                        전체보기 <ChevronRight size={20} />
                    </Link>
                )}
            </div>

            <div className="flex flex-col gap-4">
                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="overflow-x-auto scroll-smooth scrollbar-hide"
                >
                    <div className="flex gap-6 pb-2 min-w-min">
                        {posts.map((post) => {
                            const category = categories.find(
                                (cat) => cat.id === post.category_id
                            );
                            const thumbnailUrl = category?.thumbnail;
                            const categoryName = category?.name || "미분류";
                            const categorySlug = lowerURL(category?.name || "");
                            const commentCount = comments.filter(
                                (comment) => comment.post_id === post.id
                            ).length;

                            return (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    categoryName={categoryName}
                                    categorySlug={categorySlug}
                                    thumbnailUrl={thumbnailUrl}
                                    commentCount={commentCount}
                                    variant={variant}
                                />
                            );
                        })}
                    </div>
                </div>

                <ScrollControls
                    canScrollLeft={canScrollLeft}
                    canScrollRight={canScrollRight}
                    onScrollLeft={() => scroll("left")}
                    onScrollRight={() => scroll("right")}
                />
            </div>
        </section>
    );
}
