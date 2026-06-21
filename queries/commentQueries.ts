import { supabase } from "@components/lib/supabaseClient";
import {
  CommentInsertPayload,
  CommentRow,
  CommentUpdatePayload,
} from "@components/types/comment";

export const commentsQueryKey = (
  postIds?: number[] | string,
  includePrivate = false
) =>
  [
    "comments",
    Array.isArray(postIds) ? postIds.join(",") : postIds,
    includePrivate ? "all" : "public",
  ] as const;

export const recentCommentsQueryKey = (limit: number) =>
  ["comments", "recent", limit] as const;

/** 최신 댓글 사이드바용 — 승인된 댓글 최신순 (limit개) */
export const fetchRecentCommentsQueryFn = async (
  limit = 5
): Promise<CommentRow[]> => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("status", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`🚨 최신 댓글 불러오기 실패: ${error.message}`);
  }

  return data ?? [];
};

export const fetchCommentsQueryFn = async (
  postIds: number[],
  options: { includePrivate?: boolean } = {}
): Promise<CommentRow[]> => {
  let query = supabase
    .from("comments")
    .select("*")
    .in("post_id", postIds)
    .order("created_at", { ascending: true });

  if (!options.includePrivate) {
    query = query.eq("status", false);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`🚨 댓글 불러오기 실패: ${error.message}`);
  }

  return data ?? [];
};

export const addCommentMutationFn = async (
  payload: CommentInsertPayload
): Promise<CommentRow> => {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      ...payload,
      post_id: Number(payload.post_id),
      parent_id: payload.parent_id ?? null,
      status: Boolean(payload.status),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`🚨 댓글 추가 실패: ${error.message}`);
  }

  if (!data) {
    throw new Error("🚨 댓글 추가 실패: 응답 데이터가 없습니다.");
  }

  return data;
};

export const deleteCommentMutationFn = async (
  commentId: number | string
): Promise<void> => {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    throw new Error(`🚨 댓글 삭제 실패: ${error.message}`);
  }
};

export const updateCommentMutationFn = async (
  payload: CommentUpdatePayload
): Promise<CommentRow> => {
  const { id, ...fieldsToUpdate } = payload;
  const { data, error } = await supabase
    .from("comments")
    .update(fieldsToUpdate)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`🚨 댓글 업데이트 실패: ${error.message}`);
  }

  if (!data) {
    throw new Error("🚨 댓글 업데이트 실패: 응답 데이터가 없습니다.");
  }

  return data;
};
