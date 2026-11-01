import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostState } from "@components/types/post";
import {
  toggleLikeMutationFn,
  addBookmarkMutationFn,
  removeBookmarkMutationFn,
  postsQueryKey,
  bookmarkQueryKey,
} from "./postQueries";

// 좋아요 토글 Mutation
export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLikeMutationFn,
    onSuccess: (metrics) => {
      // 저장된 결과를 먼저 반영하여 재조회 전에도 상세 캐시를 최신으로 유지한다.
      queryClient.setQueriesData<PostState>(
        { queryKey: ["posts", "detail"] },
        (post) => post?.id === metrics.id ? { ...post, ...metrics } : post,
      );
      void queryClient.invalidateQueries({
        queryKey: postsQueryKey,
      });
    },
  });
};

// 북마크 추가 Mutation
export const useAddBookmark = (userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBookmarkMutationFn,
    onSuccess: () => {
      // 북마크 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: bookmarkQueryKey(userId),
      });
    },
  });
};

// 북마크 제거 Mutation
export const useRemoveBookmark = (userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeBookmarkMutationFn,
    onSuccess: () => {
      // 북마크 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: bookmarkQueryKey(userId),
      });
    },
  });
};
