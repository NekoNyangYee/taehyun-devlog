import { supabase } from "@components/lib/supabaseClient";
import {
  PostMetrics,
  PostState,
  PostStateWithoutContents,
} from "@components/types/post";

/** 목록/카드에 필요한 게시물 컬럼 (본문 contents 제외) */
const POST_LIST_COLUMNS =
  "id, title, author_id, author_name, visibility, created_at, updated_at, view_count, like_count, category_id, liked_by_user";

export const postsQueryKey = ["posts"] as const;
export const bookmarkQueryKey = (userId?: string) =>
  ["bookmarks", userId] as const;
export const postDetailQueryKey = (postId: number | string) =>
  ["posts", "detail", Number(postId)] as const;

export const fetchPostsQueryFn = async (): Promise<
  PostStateWithoutContents[]
> => {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_LIST_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`게시물 불러오는 도중 에러: ${error.message}`);
  }

  const safeData = (data ?? []).filter((post) => post.visibility === "public");
  return safeData;
};

export interface PostsPage {
  posts: PostStateWithoutContents[];
  total: number;
}

export const postsPageQueryKey = (page: number, pageSize: number) =>
  ["posts", "page", page, pageSize] as const;

/**
 * 서버 사이드 페이지네이션 — Supabase range + exact count.
 * visibility 필터를 DB단(`.eq`)에서 처리하고 페이지당 행만 가져온다.
 */
export const fetchPostsPageQueryFn = async (
  page: number,
  pageSize: number
): Promise<PostsPage> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("posts")
    .select(POST_LIST_COLUMNS, { count: "exact" })
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`게시물 페이지 불러오기 에러: ${error.message}`);
  }

  return {
    posts: (data ?? []) as PostStateWithoutContents[],
    total: count ?? 0,
  };
};

export const featuredPostsQueryKey = (limit: number) =>
  ["posts", "featured", limit] as const;

/** 캐러셀용 최신 공개 게시물 (limit개) */
export const fetchFeaturedPostsQueryFn = async (
  limit = 5
): Promise<PostStateWithoutContents[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_LIST_COLUMNS)
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`추천 게시물 불러오기 에러: ${error.message}`);
  }

  return (data ?? []) as PostStateWithoutContents[];
};

export const popularPostsQueryKey = (limit: number) =>
  ["posts", "popular", limit] as const;

/** 인기 글 사이드바용 — 조회수 상위 공개 게시물 (limit개) */
export const fetchPopularPostsQueryFn = async (
  limit = 4
): Promise<PostStateWithoutContents[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_LIST_COLUMNS)
    .eq("visibility", "public")
    .order("view_count", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`인기 게시물 불러오기 에러: ${error.message}`);
  }

  return (data ?? []) as PostStateWithoutContents[];
};

export const postsByIdsQueryKey = (ids: number[]) =>
  ["posts", "byIds", [...ids].sort((a, b) => a - b)] as const;

/** 특정 id 목록의 게시물 메타 조회 (최신 댓글의 게시물 제목 매핑용) */
export const fetchPostsByIdsQueryFn = async (
  ids: number[]
): Promise<PostStateWithoutContents[]> => {
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("posts")
    .select(POST_LIST_COLUMNS)
    .in("id", ids);

  if (error) {
    throw new Error(`게시물 조회 에러: ${error.message}`);
  }

  return (data ?? []) as PostStateWithoutContents[];
};

export const fetchBookmarksQueryFn = async (
  userId?: string
): Promise<number[]> => {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .select("post_id")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`북마크 게시물 불러오는 중 에러: ${error.message}`);
  }

  return (data ?? []).map((b) => b.post_id);
};

export const fetchPostByIdQueryFn = async (
  postId: number
): Promise<PostState> => {
  const postIdNum = Number(postId);

  if (!Number.isFinite(postIdNum)) {
    throw new Error("유효하지 않은 게시물 ID입니다.");
  }

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postIdNum)
    .single();

  if (error) {
    throw new Error(`게시물 상세 불러오기 에러: ${error.message}`);
  }

  if (!data) {
    throw new Error("게시물을 찾을 수 없습니다.");
  }

  return data as PostState;
};

export const incrementViewCountMutationFn = async (postId: number) => {
  const postIdNum = Number(postId);

  const { data, error } = await supabase
    .from("posts")
    .select("view_count")
    .eq("id", postIdNum)
    .single();

  if (error) {
    throw new Error(`조회수 증가 중 에러: ${error.message}`);
  }

  const viewCount = data?.view_count ?? 0;
  const { error: updateError } = await supabase
    .from("posts")
    .update({ view_count: viewCount + 1 })
    .eq("id", postIdNum);

  if (updateError) {
    throw new Error(`조회수 업데이트 실패: ${updateError.message}`);
  }
};

interface ToggleLikePayload {
  postId: number | string;
  likedByUser: string;
}

export const toggleLikeMutationFn = async ({
  postId,
  likedByUser,
}: ToggleLikePayload): Promise<PostMetrics> => {
  const postIdNumber = Number(postId);

  const { data: post, error } = await supabase
    .from("posts")
    .select("liked_by_user, like_count")
    .eq("id", postIdNumber)
    .single();

  if (error) {
    throw new Error(`좋아요 증가 중 에러: ${error.message}`);
  }

  const likedByUserList: string[] = post?.liked_by_user ?? [];
  const isLiked = likedByUserList.includes(likedByUser);

  let newLikeCount = post?.like_count ?? 0;

  if (isLiked) {
    newLikeCount -= 1;
    likedByUserList.splice(likedByUserList.indexOf(likedByUser), 1);
  } else {
    newLikeCount += 1;
    likedByUserList.push(likedByUser);
  }

  const { error: updateError } = await supabase
    .from("posts")
    .update({ like_count: newLikeCount, liked_by_user: likedByUserList })
    .eq("id", postIdNumber);

  if (updateError) {
    throw new Error(`좋아요 수 업데이트 실패: ${updateError.message}`);
  }

  return {
    id: postIdNumber,
    like_count: newLikeCount,
    liked_by_user: likedByUserList,
  };
};

interface BookmarkPayload {
  userId: string;
  postId: number;
}

export const addBookmarkMutationFn = async ({
  userId,
  postId,
}: BookmarkPayload): Promise<void> => {
  const { error } = await supabase
    .from("bookmarks")
    .insert([{ user_id: userId, post_id: postId }]);

  if (error) {
    throw new Error(`북마크 추가 실패: ${error.message}`);
  }
};

export const removeBookmarkMutationFn = async ({
  userId,
  postId,
}: BookmarkPayload): Promise<void> => {
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("post_id", postId);

  if (error) {
    throw new Error(`북마크 삭제 실패: ${error.message}`);
  }
};
