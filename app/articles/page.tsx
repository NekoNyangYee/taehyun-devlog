import { Metadata } from "next";
import PostsContent from "./_components/PostsContent";
import { fetchPostsQueryFn } from "@components/queries/postQueries";
import { fetchCategoriesQueryFn } from "@components/queries/categoryQueries";
import { fetchCommentCountsQueryFn } from "@components/queries/commentQueries";
import { SITE_URL } from "@components/lib/siteUrl";

// 동적 렌더링 강제 (빌드 시 정적 생성 방지)
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "아티클 목록 | TaeHyun's Devlog",
  description: "프론트엔드 개발자 김태현의 기술 블로그 아티클 목록입니다.",
  openGraph: {
    title: "아티클 목록 | TaeHyun's Devlog",
    description: "프론트엔드 개발자 김태현의 기술 블로그 아티클 목록입니다.",
    url: `${SITE_URL}/articles`,
    siteName: "TaeHyun's Devlog",
    type: "website",
    images: [
      {
        url: "/profile.jpg",
        width: 1200,
        height: 630,
        alt: "TaeHyun's Devlog",
      },
    ],
  },
};

// 메타데이터용 JSON-LD 생성
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "태현 블로그 아티클 목록",
  description: "프론트엔드 개발자 김태현의 기술 블로그 아티클 목록.",
  author: {
    "@type": "Person",
    name: "김태현",
  },
  publisher: {
    "@type": "Organization",
    name: "TaeHyun's Devlog",
    logo: {
      "@type": "ImageObject",
      url: "/profile.jpg",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${SITE_URL}/articles`,
  },
};

/**
 * Posts 페이지 (Server Component)
 * - 서버에서 데이터 미리 가져오기 (SSR)
 * - Client Component에 초기 데이터 전달
 */
interface ArticlePageProps {
  searchParams: Promise<{
    category?: string | string[];
  }>;
}

export default async function PostPage({ searchParams }: ArticlePageProps) {
  const resolvedSearchParams = await searchParams;
  // 서버 사이드에서 데이터 미리 가져오기 (SSR)
  const [initialPosts, initialCategories] = await Promise.all([
    fetchPostsQueryFn(),
    fetchCategoriesQueryFn(),
  ]);
  const initialComments = initialPosts.length
    ? await fetchCommentCountsQueryFn(initialPosts.map((post) => post.id))
    : [];
  const requestedCategoryIds = Array.isArray(resolvedSearchParams.category)
    ? resolvedSearchParams.category
    : resolvedSearchParams.category
      ? [resolvedSearchParams.category]
      : [];
  const validCategoryIds = new Set(
    initialCategories.map((category) => String(category.id)),
  );
  const initialSelectedCategoryIds = Array.from(
    new Set(requestedCategoryIds),
  ).filter((id) => validCategoryIds.has(id));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostsContent
        initialPosts={initialPosts}
        initialCategories={initialCategories}
        initialComments={initialComments}
        initialSelectedCategoryIds={initialSelectedCategoryIds}
      />
    </>
  );
}

