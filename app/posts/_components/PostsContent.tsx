"use client";

import { useEffect, useState } from "react";
import CategoryButtons from "@components/components/CategoryButtons";
import { PostGridCard } from "./PostGridCard";
import { SortSelect } from "./SortSelect";
import { usePostsData } from "../_hooks/usePostsData";
import { usePostsFilter } from "../_hooks/usePostsFilter";
import { useBookmarkToggle } from "../_hooks/useBookmarkToggle";
import { lowerURL } from "@components/lib/util/lowerURL";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";

/**
 * Posts 페이지 메인 컨텐츠 (Container Component)
 * - Hook으로 데이터와 로직 관리
 * - Presentational 컴포넌트 조합
 */
interface PostsContentProps {
    initialPosts?: PostStateWithoutContents[];
    initialCategories?: Category[];
}

export default function PostsContent({
    initialPosts = [],
    initialCategories = [],
}: PostsContentProps) {
    const [isClient, setIsClient] = useState(false);

    // 클라이언트 마운트 확인 - Hydration 에러 방지
    useEffect(() => {
        setIsClient(true);
    }, []);

    // 데이터 관리
    const { posts, categories, comments, bookmarks, userId, session } =
        usePostsData(initialPosts, initialCategories);

    // 필터링 및 정렬
    const {
        selectedCategory,
        setSelectedCategory,
        sortOrder,
        setSortOrder,
        filteredAndSortedPosts,
    } = usePostsFilter(posts, categories);

    // 북마크 토글
    const { toggleBookmark } = useBookmarkToggle(userId);

    return (
        <div className="p-container w-full flex flex-col flex-1 gap-4">
            <h2 className="text-2xl font-bold">게시물</h2>

            <div className="flex justify-between items-center gap-4">
                <CategoryButtons
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />
                <SortSelect value={sortOrder} onChange={setSortOrder} />
            </div>

            {/* 게시글 목록 */}
            {!isClient ? (
                <div className="w-full h-[386px] flex items-center justify-center">
                    <p className="text-gray-500">로딩 중...</p>
                </div>
            ) : filteredAndSortedPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
                    {filteredAndSortedPosts.map((post) => {
                        const category = categories.find(
                            (cat) => cat.id === post.category_id
                        );
                        const thumbnailUrl = category?.thumbnail;
                        const categoryName = category?.name || "미분류";
                        const categorySlug = lowerURL(category?.name || "");
                        const isBookmarked = bookmarks.includes(post.id);
                        const commentCount = comments.filter(
                            (comment) => comment.post_id === post.id
                        ).length;

                        return (
                            <PostGridCard
                                key={post.id}
                                post={post}
                                categoryName={categoryName}
                                categorySlug={categorySlug}
                                thumbnailUrl={thumbnailUrl}
                                commentCount={commentCount}
                                isBookmarked={isBookmarked}
                                showBookmark={isClient && !!session}
                                onBookmarkToggle={(e) =>
                                    toggleBookmark(post.id, isBookmarked, e)
                                }
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="w-full h-[386px] flex items-center justify-center border border-containerColor rounded-container">
                    <p className="text-gray-500 text-center">
                        해당 카테고리에 게시물이 없습니다.
                    </p>
                </div>
            )}
        </div>
    );
}
