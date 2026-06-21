import { create } from "zustand";

// UI 상태만 관리 (서버 상태는 TanStack Query에서 관리)
interface CommentProps {
  isCommentsLoading: boolean;
  editingCommentId: number | null;
  editingContent: string;
  editingStatus: boolean;
  setCommentsLoading: (loading: boolean) => void;
  startEditingComment: (id: number, content: string, status: boolean) => void;
  setEditingContent: (content: string) => void;
  setEditingStatus: (status: boolean) => void;
  cancelEditingComment: () => void;
}

export const useCommentStore = create<CommentProps>((set) => ({
  isCommentsLoading: false,
  editingCommentId: null,
  editingContent: "",
  editingStatus: false,
  setCommentsLoading: (loading) => set({ isCommentsLoading: loading }),
  startEditingComment: (id, content, status) =>
    set({
      editingCommentId: id,
      editingContent: content,
      editingStatus: status,
    }),
  setEditingContent: (content) => set({ editingContent: content }),
  setEditingStatus: (status) => set({ editingStatus: status }),
  cancelEditingComment: () =>
    set({
      editingCommentId: null,
      editingContent: "",
      editingStatus: false,
    }),
}));
