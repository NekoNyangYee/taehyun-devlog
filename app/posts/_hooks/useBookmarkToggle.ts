"use client";

import {
    useAddBookmark,
    useRemoveBookmark,
} from "@components/queries/postMutations";

/**
 * 북마크 토글 로직 Hook
 * - 북마크 추가/제거 mutation
 * - 로그인 체크
 */
export function useBookmarkToggle(userId?: string) {
    const addBookmarkMutation = useAddBookmark(userId);
    const removeBookmarkMutation = useRemoveBookmark(userId);

    const toggleBookmark = async (
        postId: number,
        isBookmarked: boolean,
        e?: React.MouseEvent
    ) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!userId) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (isBookmarked) {
            await removeBookmarkMutation.mutateAsync({ userId, postId });
        } else {
            await addBookmarkMutation.mutateAsync({ userId, postId });
        }
    };

    return { toggleBookmark };
}
