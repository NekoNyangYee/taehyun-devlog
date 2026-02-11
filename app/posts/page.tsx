import { Metadata } from "next";
import PostsContent from "./_components/PostsContent";
import { fetchPostsQueryFn } from "@components/queries/postQueries";
import { fetchCategoriesQueryFn } from "@components/queries/categoryQueries";

// 동적 렌더링 강제 (빌드 시 정적 생성 방지)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "게시물 목록 | TaeHyun's Devlog",
  description: "프론트엔드 개발자 김태현의 기술 블로그 포스트 목록입니다.",
  openGraph: {
    title: "게시물 목록 | TaeHyun's Devlog",
    description: "프론트엔드 개발자 김태현의 기술 블로그 포스트 목록입니다.",
    url: "https://taehyun-devlog.vercel.app/posts",
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
  headline: "태현 블로그 포스트 목록",
  description: "프론트엔드 개발자 김태현의 기술 블로그 포스트 목록.",
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
    "@id": "https://taehyun-devlog.vercel.app/posts",
  },
};

/**
 * Posts 페이지 (Server Component)
 * - 서버에서 데이터 미리 가져오기 (SSR)
 * - Client Component에 초기 데이터 전달
 */
export default async function PostPage() {
  // 서버 사이드에서 데이터 미리 가져오기 (SSR)
  const [initialPosts, initialCategories] = await Promise.all([
    fetchPostsQueryFn(),
    fetchCategoriesQueryFn(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostsContent
        initialPosts={initialPosts}
        initialCategories={initialCategories}
      />
    </>
  );
}

