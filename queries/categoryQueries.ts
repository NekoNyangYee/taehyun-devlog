import { supabase } from "@components/lib/supabaseClient";
import { Category } from "@components/types/category";

export const categoriesQueryKey = ["categories"] as const;

export const fetchCategoriesQueryFn = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, thumbnail");

  if (error) {
    throw new Error(`카테고리 가져오기 에러: ${error.message}`);
  }

  return data ?? [];
};

export const categoryCountsQueryKey = ["categories", "counts"] as const;

/**
 * 카테고리별 공개 게시물 수.
 * category_id 컬럼만 단일 쿼리로 받아 클라이언트에서 집계 (페이로드 최소화).
 */
export const fetchCategoryCountsQueryFn = async (): Promise<
  Record<number, number>
> => {
  const { data, error } = await supabase
    .from("posts")
    .select("category_id")
    .eq("visibility", "public");

  if (error) {
    throw new Error(`카테고리 집계 에러: ${error.message}`);
  }

  const counts: Record<number, number> = {};
  for (const row of data ?? []) {
    const id = (row as { category_id: number }).category_id;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
};
