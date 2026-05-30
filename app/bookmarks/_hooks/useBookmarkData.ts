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
 * 북마크 페이지 데이터 관리 Hook
 * - TanStack Query로 데이터 관리
 * - 북마크된 게시물만 필터링
 */
export function useBookmarkData() {
  const { session } = useSessionStore();
  const userId = session?.user?.id;

  const postsQuery = useQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPostsQueryFn,
  });
  const posts = postsQuery.data ?? [];

  const categoriesQuery = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategoriesQueryFn,
  });
  const categories = categoriesQuery.data ?? [];

  const bookmarksQuery = useQuery({
    queryKey: bookmarkQueryKey(userId),
    queryFn: () => fetchBookmarksQueryFn(userId),
    enabled: Boolean(userId),
  });
  const bookmarks = bookmarksQuery.data ?? [];

  const postIds = useMemo(() => posts.map((post) => post.id), [posts]);

  const { data: comments = [] } = useQuery({
    queryKey: commentsQueryKey(postIds),
    queryFn: () => fetchCommentsQueryFn(postIds),
    enabled: postIds.length > 0,
  });

  // 북마크된 게시물만 필터링
  const bookmarkedPosts = useMemo(
    () => posts.filter((post) => bookmarks.includes(post.id)),
    [posts, bookmarks],
  );

  // session 있을 때만 bookmarks fetch가 시작되므로, 그 때만 로딩 체크
  const isLoading =
    postsQuery.isPending ||
    categoriesQuery.isPending ||
    (Boolean(userId) && bookmarksQuery.isPending);

  return {
    bookmarkedPosts,
    categories,
    comments,
    bookmarks,
    userId,
    session,
    isLoading,
  };
}
