import { Metadata } from "next";
import { supabase } from "@components/lib/supabaseClient";
import PostDetailClient from "./PostDetailClient";

interface PageProps {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

// 게시물 정보 가져오기 (Server Side)
async function getPost(id: string) {
  const postId = Number(id);
  if (!Number.isFinite(postId)) return null;

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, contents, category_id")
    .eq("id", postId)
    .single();

  if (error || !data) return null;
  return data;
}

// 카테고리 정보 가져오기 (Server Side)
async function getCategory(categoryId: number) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, thumbnail")
    .eq("id", categoryId)
    .single();

  if (error || !data) return null;
  return data;
}

// 본문에서 첫 번째 이미지 추출
function extractFirstImage(htmlContent: string): string | null {
  const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch ? imgMatch[1] : null;
}

// 본문에서 텍스트만 추출하여 description 생성
function extractDescription(htmlContent: string, maxLength = 160): string {
  // HTML 태그 제거
  const textContent = htmlContent
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (textContent.length <= maxLength) return textContent;
  return textContent.slice(0, maxLength).trim() + "...";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { id, category } = resolvedParams;

  const post = await getPost(id);

  // 게시물이 없으면 기본 메타데이터 반환
  if (!post) {
    return {
      title: "게시물을 찾을 수 없습니다 | TaeHyun's Devlog",
      description: "요청하신 게시물을 찾을 수 없습니다.",
    };
  }

  const categoryData = await getCategory(post.category_id);

  // 썸네일 우선순위: 본문 첫 이미지 > 카테고리 썸네일 > 기본 이미지
  const firstImageFromContent = extractFirstImage(post.contents || "");
  const ogImage = firstImageFromContent || categoryData?.thumbnail || "/profile.jpg";

  // description 생성
  const description = extractDescription(post.contents || "");

  const baseUrl = "https://taehyun-devlog.vercel.app";
  const postUrl = `${baseUrl}/posts/${encodeURIComponent(category)}/${id}`;

  return {
    title: `${post.title} | TaeHyun's Devlog`,
    description: description || `${post.title} - TaeHyun's Devlog`,
    openGraph: {
      title: post.title,
      description: description || `${post.title} - TaeHyun's Devlog`,
      url: postUrl,
      siteName: "TaeHyun's Devlog",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: "ko_KR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: description || `${post.title} - TaeHyun's Devlog`,
      images: [ogImage],
    },
  };
}

export default function PostDetailPage() {
  return <PostDetailClient />;
}
