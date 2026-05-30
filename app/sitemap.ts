import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 서버 사이드 전용 Supabase 클라이언트 생성
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const baseUrl = "https://taehyun-devlog.vercel.app";

    // 정적 페이지들
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/posts`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/bookmarks`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/myinfo`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/profile`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
    ];

    // 모든 공개 게시물 가져오기 (카테고리 정보 포함)
    const { data: posts } = await supabase
        .from("posts")
        .select(`
            id, 
            updated_at, 
            created_at, 
            categories (
                name
            )
        `)
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

    type SitemapPost = {
        id: number;
        updated_at: string | null;
        created_at: string;
        categories: { name: string } | { name: string }[] | null;
    };

    // 게시물 URL 생성
    const postPages: MetadataRoute.Sitemap =
        (posts as SitemapPost[] | null)?.map((post) => {
            // 조인된 카테고리 데이터에서 이름 추출 (단일/배열 모두 대응)
            const rawCategory = Array.isArray(post.categories)
                ? post.categories[0]
                : post.categories;
            const categoryName = rawCategory?.name || "uncategorized";

            return {
                url: `${baseUrl}/posts/${encodeURIComponent(categoryName)}/${post.id}`,
                lastModified: new Date(post.updated_at || post.created_at),
                changeFrequency: "weekly" as const,
                priority: 0.8,
            };
        }) || [];

    return [...staticPages, ...postPages];
}
