"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
    fetchPostsQueryFn,
    postsQueryKey,
} from "@components/queries/postQueries";
import {
    categoriesQueryKey,
    fetchCategoriesQueryFn,
} from "@components/queries/categoryQueries";
import {
    commentsQueryKey,
    fetchCommentsQueryFn,
} from "@components/queries/commentQueries";

/**
 * 홈 페이지 데이터 관리 Hook
 * - 서버 상태는 TanStack Query로 관리
 * - 파생 상태는 useMemo로 계산
 * - 데이터 로직과 UI 완전 분리
 */
export function useHomeData() {
    // 서버 상태 조회
    const { data: posts = [] } = useQuery({
        queryKey: postsQueryKey,
        queryFn: fetchPostsQueryFn,
    });

    const { data: categories = [] } = useQuery({
        queryKey: categoriesQueryKey,
        queryFn: fetchCategoriesQueryFn,
    });

    const postIds = useMemo(() => posts.map((post) => post.id), [posts]);

    const { data: comments = [] } = useQuery({
        queryKey: commentsQueryKey(postIds),
        queryFn: () => fetchCommentsQueryFn(postIds),
        enabled: postIds.length > 0,
    });

    // 파생 상태: 인기 게시물 (조회수 기준 정렬)
    const popularPosts = useMemo(
        () =>
            [...posts]
                .sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
                .slice(0, 4),
        [posts]
    );

    // 파생 상태: 최신 게시물
    const latestPosts = useMemo(() => posts.slice(0, 7), [posts]);

    return {
        posts,
        categories,
        comments,
        popularPosts,
        latestPosts,
    };
}
