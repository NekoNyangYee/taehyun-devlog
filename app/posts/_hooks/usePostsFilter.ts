"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import dayjs from "@components/lib/util/dayjs";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";

/**
 * Posts 페이지 필터링 및 정렬 로직 Hook
 * - URL 기반 카테고리 필터링
 * - 정렬 옵션 관리
 * - 파생 상태 계산
 */
export function usePostsFilter(
    posts: PostStateWithoutContents[],
    categories: Category[]
) {
    const pathname = usePathname();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<string>("new-sort");

    // URL에서 카테고리 추출
    useEffect(() => {
        let categoryFromURL = pathname.split("/").pop() || "";
        try {
            categoryFromURL = decodeURIComponent(categoryFromURL);
        } catch { }

        if (
            categoryFromURL &&
            categoryFromURL !== "posts" &&
            selectedCategory !== categoryFromURL
        ) {
            setSelectedCategory(categoryFromURL);
        } else if (categoryFromURL === "posts") {
            setSelectedCategory(null);
        }
    }, [pathname, selectedCategory]);

    // 필터링 및 정렬된 게시물 (파생 상태)
    const filteredAndSortedPosts = useMemo(() => {
        let filtered = posts;

        // 카테고리 필터링
        if (selectedCategory) {
            filtered = posts.filter((post) => {
                const category = categories.find((cat) => cat.id === post.category_id);
                return category?.name.toLowerCase() === selectedCategory.toLowerCase();
            });
        }

        // 정렬
        return [...filtered].sort((a, b) => {
            const dateA = dayjs(a.created_at).toDate();
            const dateB = dayjs(b.created_at).toDate();

            if (sortOrder === "new-sort") {
                return dateB.getTime() - dateA.getTime();
            } else if (sortOrder === "old-sort") {
                return dateA.getTime() - dateB.getTime();
            } else if (sortOrder === "max-view-sort") {
                return (b.view_count ?? 0) - (a.view_count ?? 0);
            } else if (sortOrder === "min-view-sort") {
                return (a.view_count ?? 0) - (b.view_count ?? 0);
            }
            return 0;
        });
    }, [posts, categories, selectedCategory, sortOrder]);

    return {
        selectedCategory,
        setSelectedCategory,
        sortOrder,
        setSortOrder,
        filteredAndSortedPosts,
    };
}
