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

/**
 * MyInfo 페이지 데이터 관리 Hook
 * - 세션 및 프로필 관리
 * - 사용자 게시물 및 댓글 조회
 */
export function useMyInfoData() {
    const { session, isLoading: isSessionLoading, fetchSession } = useSessionStore();
    const {
        profiles,
        fetchProfiles,
        isCached: isProfileCached,
        cachedUserId,
        isLoading: isProfileLoading,
    } = useProfileStore();
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

    return {
        session,
        isLoading:
            isSessionLoading ||
            (Boolean(userId) &&
                (isProfileLoading || !isProfileCached || cachedUserId !== userId)),
        profiles,
        categories,
        userPosts: sortedUserPosts,
    };
}
