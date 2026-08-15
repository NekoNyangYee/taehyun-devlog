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
import { SITE_URL } from "@components/lib/siteUrl";

const getPostSlugCandidates = (slug: string) => {
  const candidates = new Set([slug]);

  try {
    candidates.add(decodeURIComponent(slug));
  } catch {
    /* keep original slug */
  }

  return Array.from(candidates).filter(Boolean);
};

// 게시물 정보 가져오기 (Server Side) - Request Memoization 적용
const getPost = cache(async (id: string, minimal = false) => {
  const slugCandidates = getPostSlugCandidates(id);
  if (slugCandidates.length === 0) return null;

  if (minimal) {
    // 메타데이터용 최소 필드만 가져오기
    const { data, error } = await supabase
      .from("posts")
      .select("id, slug, title, category_id, updated_at")
      .in("slug", slugCandidates)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as {
      id: number;
      slug: string;
      title: string;
      category_id: number;
      updated_at: string | null;
    };
  } else {
    // 전체 필드 가져오기
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .in("slug", slugCandidates)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

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
      title: "아티클을 찾을 수 없습니다 | TaeHyun's Devlog",
      description: "요청하신 아티클을 찾을 수 없습니다.",
    };
  }

  const categoryData = await getCategory(post.category_id);

  // description은 제목 기반으로 생성 (본문이 없으므로)
  const description = `${post.title} - ${categoryData?.name || ''} 카테고리의 아티클입니다.`;

  const baseUrl = SITE_URL;
  const postUrl = `${baseUrl}/articles/${encodeURIComponent(category)}/${encodeURIComponent(id)}`;
  const ogImageVersion = post.updated_at ?? post.slug;
  const ogImage = `${postUrl}/opengraph-image?v=${encodeURIComponent(ogImageVersion)}`;

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
