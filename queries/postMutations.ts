import { useMutation, useQueryClient } from "@tanstack/react-query";
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
    onSuccess: () => {
      // 게시물 상세 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["posts", "detail"],
      });
      // 전체 게시물 목록 캐시 무효화
      queryClient.invalidateQueries({
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
