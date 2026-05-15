import { Metadata } from "next";
import PostsContent from "../_components/PostsContent";
import { fetchPostsQueryFn } from "@components/queries/postQueries";
import { fetchCategoriesQueryFn } from "@components/queries/categoryQueries";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  let decoded = category;
  try {
    decoded = decodeURIComponent(category);
  } catch {}
  const title = `${decoded} | TaeHyun's Devlog`;
  return {
    title,
    description: `${decoded} 카테고리의 게시물 목록입니다.`,
    openGraph: {
      title,
      description: `${decoded} 카테고리의 게시물 목록입니다.`,
    },
  };
}

export default async function CategoryPage() {
  // 카테고리 필터링은 client에서 pathname 기반으로 처리 (usePostsFilter)
  const [initialPosts, initialCategories] = await Promise.all([
    fetchPostsQueryFn(),
    fetchCategoriesQueryFn(),
  ]);

  return (
    <PostsContent
      initialPosts={initialPosts}
      initialCategories={initialCategories}
    />
  );
}
