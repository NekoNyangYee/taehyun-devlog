"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import dayjs from "@components/lib/util/dayjs";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";

/**
 * Posts 페이지 필터링 및 정렬 로직 Hook
 * - selectedCategory는 pathname에서 파생 (단일 소스)
 * - setSelectedCategory는 router.push로 URL 변경
 */
export function usePostsFilter(
  posts: PostStateWithoutContents[],
  categories: Category[],
  initialCategoryIds: string[] = [],
  isClient = true,
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const validCategoryIds = useMemo(
    () => new Set(categories.map((category) => String(category.id))),
    [categories],
  );
  const urlCategoryIds = useMemo(
    () =>
      Array.from(new Set(searchParams.getAll("category"))).filter((id) =>
        validCategoryIds.has(id),
      ),
    [searchParams, validCategoryIds],
  );
  const initialValidCategoryIds = useMemo(
    () =>
      Array.from(new Set(initialCategoryIds)).filter((id) =>
        validCategoryIds.has(id),
      ),
    [initialCategoryIds, validCategoryIds],
  );
  const selectedCategoryIds = isClient
    ? urlCategoryIds
    : initialValidCategoryIds;

  const updateCategoryParams = useCallback(
    (categoryIds: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("category");
      categoryIds.forEach((id) => params.append("category", id));
      const query = params.toString();
      router.push(query ? `/articles?${query}` : "/articles");
    },
    [router, searchParams],
  );

  const toggleCategory = useCallback(
    (categoryId: string) => {
      const nextCategoryIds = selectedCategoryIds.includes(categoryId)
        ? selectedCategoryIds.filter((id) => id !== categoryId)
        : [...selectedCategoryIds, categoryId];
      updateCategoryParams(nextCategoryIds);
    },
    [selectedCategoryIds, updateCategoryParams],
  );

  const clearCategories = useCallback(
    () => updateCategoryParams([]),
    [updateCategoryParams],
  );

  const filteredAndSortedPosts = useMemo(() => {
    const selectedIds = new Set(selectedCategoryIds.map(Number));
    const filtered = selectedIds.size
      ? posts.filter((post) => selectedIds.has(post.category_id))
      : posts;

    return [...filtered].sort(
      (a, b) =>
        dayjs(b.created_at).toDate().getTime() -
        dayjs(a.created_at).toDate().getTime(),
    );
  }, [posts, selectedCategoryIds]);

  return {
    selectedCategoryIds,
    toggleCategory,
    clearCategories,
    filteredAndSortedPosts,
  };
}
