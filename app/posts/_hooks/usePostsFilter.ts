"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import dayjs from "@components/lib/util/dayjs";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { lowerURL } from "@components/lib/util/lowerURL";

/**
 * Posts 페이지 필터링 및 정렬 로직 Hook
 * - selectedCategory는 pathname에서 파생 (단일 소스)
 * - setSelectedCategory는 router.push로 URL 변경
 */
export function usePostsFilter(
    posts: PostStateWithoutContents[],
    categories: Category[]
) {
    const pathname = usePathname();
    const router = useRouter();
    const [sortOrder, setSortOrder] = useState<string>("new-sort");

    // pathname에서 선택된 카테고리 파생
    const selectedCategory = useMemo<string | null>(() => {
        const segment = pathname.split("/").pop() || "";
        if (!segment || segment === "posts") return null;
        try {
            return decodeURIComponent(segment);
        } catch {
            return segment;
        }
    }, [pathname]);

    const setSelectedCategory = useCallback(
        (category: string | null) => {
            if (!category) {
                router.push("/posts");
            } else {
                router.push(`/posts/${lowerURL(category)}`);
            }
        },
        [router]
    );

    // 필터링 및 정렬된 게시물 (파생 상태)
    const filteredAndSortedPosts = useMemo(() => {
        const filtered = selectedCategory
            ? posts.filter((post) => {
                  const category = categories.find((cat) => cat.id === post.category_id);
                  return (
                      category?.name.toLowerCase() === selectedCategory.toLowerCase()
                  );
              })
            : posts;

        return [...filtered].sort((a, b) => {
            const dateA = dayjs(a.created_at).toDate();
            const dateB = dayjs(b.created_at).toDate();

            if (sortOrder === "new-sort") return dateB.getTime() - dateA.getTime();
            if (sortOrder === "old-sort") return dateA.getTime() - dateB.getTime();
            if (sortOrder === "max-view-sort")
                return (b.view_count ?? 0) - (a.view_count ?? 0);
            if (sortOrder === "min-view-sort")
                return (a.view_count ?? 0) - (b.view_count ?? 0);
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
