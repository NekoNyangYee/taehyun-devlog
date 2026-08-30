"use client";

import {
    useAddBookmark,
    useRemoveBookmark,
} from "@components/queries/postMutations";
import { useAppAlertDialog } from "@components/components/AppAlertDialogProvider";

/**
 * 북마크 토글 로직 Hook
 * - 북마크 추가/제거 mutation
 * - 로그인 체크
 */
export function useBookmarkToggle(userId?: string) {
    const addBookmarkMutation = useAddBookmark(userId);
    const removeBookmarkMutation = useRemoveBookmark(userId);
    const { showAlert } = useAppAlertDialog();

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
            await showAlert({
                title: "로그인이 필요합니다",
                description: "북마크를 사용하려면 로그인해주세요.",
                type: "warning",
            });
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
