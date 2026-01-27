import { Metadata } from "next";
import { supabase } from "@components/lib/supabaseClient";
import PostDetailClient from "./PostDetailClient";

interface PageProps {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

import { cache } from "react";
import { PostState } from "@components/types/post";

// 게시물 정보 가져오기 (Server Side) - Request Memoization 적용
const getPost = cache(async (id: string, minimal = false) => {
  const postId = Number(id);
  if (!Number.isFinite(postId)) return null;

  if (minimal) {
    // 메타데이터용 최소 필드만 가져오기
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, category_id")
      .eq("id", postId)
      .single();

    if (error || !data) return null;
    return data as { id: number; title: string; category_id: number };
  } else {
    // 전체 필드 가져오기
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error || !data) return null;
    return data;
  }
});

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



// Metadata generation uses cached getPost
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { id, category } = resolvedParams;

  // 메타데이터 생성용으로 최소 필드만 가져오기 (성능 최적화)
  const post = await getPost(id, true);

  // 게시물이 없으면 기본 메타데이터 반환
  if (!post) {
    return {
      title: "게시물을 찾을 수 없습니다 | TaeHyun's Devlog",
      description: "요청하신 게시물을 찾을 수 없습니다.",
    };
  }

  const categoryData = await getCategory(post.category_id);

  // 카테고리 썸네일을 OG 이미지로 사용 (본문 파싱 제거로 성능 향상)
  const ogImage = categoryData?.thumbnail || "/profile.jpg";

  // description은 제목 기반으로 생성 (본문이 없으므로)
  const description = `${post.title} - ${categoryData?.name || ''} 카테고리의 게시물입니다.`;

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

export default async function PostDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.id);

  return <PostDetailClient />;
}
