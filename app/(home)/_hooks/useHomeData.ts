"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
    featuredPostsQueryKey,
    fetchFeaturedPostsQueryFn,
    popularPostsQueryKey,
    fetchPopularPostsQueryFn,
    postsPageQueryKey,
    fetchPostsPageQueryFn,
    postsByIdsQueryKey,
    fetchPostsByIdsQueryFn,
} from "@components/queries/postQueries";
import {
    categoriesQueryKey,
    fetchCategoriesQueryFn,
    categoryCountsQueryKey,
    fetchCategoryCountsQueryFn,
} from "@components/queries/categoryQueries";
import {
    commentsQueryKey,
    fetchCommentsQueryFn,
    recentCommentsQueryKey,
    fetchRecentCommentsQueryFn,
} from "@components/queries/commentQueries";
import { PostStateWithoutContents } from "@components/types/post";

const FEATURED_LIMIT = 5;
const POPULAR_LIMIT = 4;
const RECENT_COMMENTS_LIMIT = 5;

/** 렌더마다 새 배열을 만들지 않도록 안정적인 빈 배열 참조 */
const EMPTY_POSTS: PostStateWithoutContents[] = [];

/**
 * 홈 페이지 데이터 관리 Hook
 * - 전체 아티클은 서버 사이드 페이지네이션(range + count)으로 페이지 단위 조회
 * - 캐러셀/인기 글/최신 댓글은 각각 가벼운 전용 쿼리로 분리해 과다 패칭 방지
 */
export function useHomeData(page: number, pageSize: number) {
    const { data: categories = [] } = useQuery({
        queryKey: categoriesQueryKey,
        queryFn: fetchCategoriesQueryFn,
    });

    const { data: categoryCounts = {} } = useQuery({
        queryKey: categoryCountsQueryKey,
        queryFn: fetchCategoryCountsQueryFn,
    });

    // 상단 캐러셀 (최신 공개 게시물 5개)
    const { data: featured = [] } = useQuery({
        queryKey: featuredPostsQueryKey(FEATURED_LIMIT),
        queryFn: () => fetchFeaturedPostsQueryFn(FEATURED_LIMIT),
    });

    // 인기 있는 글 (조회수 상위)
    const { data: popularPosts = [] } = useQuery({
        queryKey: popularPostsQueryKey(POPULAR_LIMIT),
        queryFn: () => fetchPopularPostsQueryFn(POPULAR_LIMIT),
    });

    // 전체 아티클 — 서버 페이지네이션. 페이지 전환 시 이전 데이터 유지(깜빡임 방지)
    const { data: pageData, isFetching: isPageFetching } = useQuery({
        queryKey: postsPageQueryKey(page, pageSize),
        queryFn: () => fetchPostsPageQueryFn(page, pageSize),
        placeholderData: keepPreviousData,
    });
    const posts = pageData?.posts ?? EMPTY_POSTS;
    const total = pageData?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // 현재 페이지 + 캐러셀에 노출된 게시물의 댓글만 조회 (수 표시용)
    const visiblePostIds = useMemo(
        () => Array.from(new Set([...posts, ...featured].map((p) => p.id))),
        [posts, featured]
    );
    const { data: comments = [] } = useQuery({
        queryKey: commentsQueryKey(visiblePostIds),
        queryFn: () => fetchCommentsQueryFn(visiblePostIds),
        enabled: visiblePostIds.length > 0,
    });

    // 최신 댓글 (전역) + 해당 게시물 제목 매핑
    const { data: recentComments = [] } = useQuery({
        queryKey: recentCommentsQueryKey(RECENT_COMMENTS_LIMIT),
        queryFn: () => fetchRecentCommentsQueryFn(RECENT_COMMENTS_LIMIT),
    });
    const recentPostIds = useMemo(
        () => Array.from(new Set(recentComments.map((c) => c.post_id))),
        [recentComments]
    );
    const { data: recentCommentPosts = [] } = useQuery({
        queryKey: postsByIdsQueryKey(recentPostIds),
        queryFn: () => fetchPostsByIdsQueryFn(recentPostIds),
        enabled: recentPostIds.length > 0,
    });

    return {
        featured,
        posts,
        total,
        totalPages,
        isPageFetching,
        categories,
        categoryCounts,
        comments,
        popularPosts,
        recentComments,
        recentCommentPosts,
    };
}
