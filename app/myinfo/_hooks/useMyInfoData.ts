"use client";

import { useEffect, useMemo } from "react";

import { useSessionStore } from "@components/store/sessionStore";
import { useProfileStore } from "@components/store/profileStore";
import { useQuery } from "@tanstack/react-query";
import {
    postsQueryKey,
    fetchPostsQueryFn,
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
 * MyInfo 페이지 데이터 관리 Hook
 * - 세션 및 프로필 관리
 * - 사용자 게시물 및 댓글 조회
 */
export function useMyInfoData() {
    const { session, isLoading, fetchSession } = useSessionStore();
    const { profiles, fetchProfiles } = useProfileStore();
    const userId = session?.user?.id;

    // 서버 상태 조회
    const { data: posts = [] } = useQuery({
        queryKey: postsQueryKey,
        queryFn: fetchPostsQueryFn,
    });

    const { data: categories = [] } = useQuery({
        queryKey: categoriesQueryKey,
        queryFn: fetchCategoriesQueryFn,
    });

    useEffect(() => {
        if (!session) {
            fetchSession();
        }
    }, [session, fetchSession]);

    useEffect(() => {
        if (!userId) return;
        fetchProfiles(userId);
    }, [userId, fetchProfiles]);

    // 사용자 게시물 필터링 + 최신순 정렬 (파생 상태)
    const sortedUserPosts = useMemo(() => {
        if (!userId) return [];
        return posts
            .filter((post) => post.author_id === userId)
            .sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            );
    }, [posts, userId]);

    const userPostIds = useMemo(
        () => sortedUserPosts.map((post) => post.id),
        [sortedUserPosts]
    );

    const { data: comments = [] } = useQuery({
        queryKey: commentsQueryKey(userPostIds),
        queryFn: () => fetchCommentsQueryFn(userPostIds),
        enabled: userPostIds.length > 0,
        staleTime: 1000 * 60 * 5,
    });

    // 댓글 수 맵 (파생 상태)
    const commentCountMap = useMemo(() => {
        const map = new Map<number, number>();
        comments.forEach((comment) => {
            map.set(comment.post_id, (map.get(comment.post_id) || 0) + 1);
        });
        return map;
    }, [comments]);

    return {
        session,
        isLoading,
        profiles,
        categories,
        userPosts: sortedUserPosts,
        commentCountMap,
    };
}
