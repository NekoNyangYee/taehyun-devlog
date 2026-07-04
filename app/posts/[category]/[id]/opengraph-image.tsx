import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export const alt = "TaeHyun's Devlog post preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

type CategoryData = {
  name: string;
  thumbnail: string | null;
};

type OgPost = {
  title: string;
  author_name: string | null;
  created_at: string;
  categories: CategoryData | CategoryData[] | null;
};

const baseUrl = "https://taehyun-devlog.vercel.app";

const getPostSlugCandidates = (slug: string) => {
  const candidates = new Set([slug]);

  try {
    candidates.add(decodeURIComponent(slug));
  } catch {
    /* keep original slug */
  }

  return Array.from(candidates).filter(Boolean);
};

const toAbsoluteUrl = (url?: string | null) => {
  if (!url) return `${baseUrl}/profile.webp`;
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return `${baseUrl}/profile.webp`;
  }
};

const getCategory = (categories: OgPost["categories"]) =>
  Array.isArray(categories) ? categories[0] : categories;

export default async function Image({ params }: ImageProps) {
  const { id } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data } = await supabase
    .from("posts")
    .select(
      `
        title,
        author_name,
        created_at,
        categories (
          name,
          thumbnail
        )
      `,
    )
    .in("slug", getPostSlugCandidates(id))
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const post = data as OgPost | null;
  const category = getCategory(post?.categories ?? null);
  const title = post?.title ?? "TaeHyun's Devlog";
  const categoryName = category?.name ?? "Devlog";
  const thumbnailUrl = toAbsoluteUrl(category?.thumbnail);
  const date = post?.created_at
    ? new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(post.created_at))
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#0f172a",
          overflow: "hidden",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <img
          src={thumbnailUrl}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.42,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(90deg, rgba(2,6,23,0.94) 0%, rgba(15,23,42,0.72) 48%, rgba(15,23,42,0.34) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "64px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  display: "flex",
                  borderRadius: 10,
                  backgroundColor: "#ffffff",
                }}
              />
              <span>TaeHyun's Devlog</span>
            </div>
            <span style={{ color: "#cbd5e1", fontSize: 24 }}>
              {categoryName}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 28,
              maxWidth: 850,
            }}
          >
            <div
              style={{
                display: "flex",
                width: "fit-content",
                padding: "12px 18px",
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.14)",
                color: "#dbeafe",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {categoryName}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 70,
                fontWeight: 800,
                lineHeight: 1.14,
                letterSpacing: 0,
                textWrap: "balance",
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                gap: 18,
                color: "#cbd5e1",
                fontSize: 26,
                fontWeight: 600,
              }}
            >
              <span>{post?.author_name ?? "TaeHyun"}</span>
              {date ? <span>{date}</span> : null}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
