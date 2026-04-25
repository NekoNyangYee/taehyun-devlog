"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSessionStore } from "@components/store/sessionStore";
import {
    bookmarkQueryKey,
    fetchBookmarksQueryFn,
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
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";

/**
 * Posts 페이지 데이터 관리 Hook
 * - 서버 상태는 TanStack Query로 관리
 * - 북마크는 사용자별로 조회
 */
export function usePostsData(
    initialPosts?: PostStateWithoutContents[],
    initialCategories?: Category[]
) {
    const { session } = useSessionStore();
    const userId = session?.user?.id;

    const { data: posts = [] } = useQuery({
        queryKey: postsQueryKey,
        queryFn: fetchPostsQueryFn,
        initialData: initialPosts,
    });

    const { data: categories = [] } = useQuery({
        queryKey: categoriesQueryKey,
        queryFn: fetchCategoriesQueryFn,
        initialData: initialCategories,
    });

    const { data: bookmarks = [] } = useQuery({
        queryKey: bookmarkQueryKey(userId),
        queryFn: () => fetchBookmarksQueryFn(userId),
        enabled: Boolean(userId),
    });

    const postIds = useMemo(() => posts.map((post) => post.id), [posts]);

    const { data: comments = [] } = useQuery({
        queryKey: commentsQueryKey(postIds),
        queryFn: () => fetchCommentsQueryFn(postIds),
        enabled: postIds.length > 0,
    });

    return {
        posts,
        categories,
        comments,
        bookmarks,
        userId,
        session,
    };
}
