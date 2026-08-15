import { initWasm, Resvg } from "@resvg/resvg-wasm";
import satori from "satori";
import { SITE_URL } from "@components/lib/siteUrl";

export const runtime = "nodejs";

const size = {
  width: 1200,
  height: 630,
};

let resvgWasmReady: Promise<void> | null = null;

const ensureResvgWasm = (requestUrl: string) => {
  if (!resvgWasmReady) {
    const wasmUrl = new URL("/resvg.wasm", requestUrl);
    resvgWasmReady = initWasm(fetch(wasmUrl));
  }

  return resvgWasmReady;
};

interface RouteContext {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

type OgPost = {
  title: string;
  created_at: string;
  category_id: number;
};

type CategoryData = {
  name: string;
  thumbnail: string | null;
};

const baseUrl = SITE_URL;

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
  if (!url) return `${baseUrl}/default.png`;
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return `${baseUrl}/default.png`;
  }
};

const toSatoriCompatibleImageUrl = (url?: string | null) => {
  const absoluteUrl = toAbsoluteUrl(url);

  if (!absoluteUrl.includes("res.cloudinary.com")) {
    return absoluteUrl;
  }

  if (absoluteUrl.includes("/upload/")) {
    return absoluteUrl.replace(
      /\/upload\/(?:[^/]+\/)?/,
      "/upload/f_png,q_auto,w_1200/",
    );
  }

  return absoluteUrl;
};

const getOgFont = async (origin: string) => {
  const fallbackResponse = await fetch(`${origin}/fonts/malgunbd.ttf`);
  const contentType = fallbackResponse.headers.get("content-type") ?? "";

  if (!fallbackResponse.ok || contentType.includes("text/html")) {
    throw new Error("OG font asset could not be loaded.");
  }

  return fallbackResponse.arrayBuffer();
};

const getThumbnailLogoSrc = async (origin: string) => {
  const response = await fetch(`${origin}/thumbnail-logo.svg`);
  const svg = await response.text();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const fetchSupabaseRows = async <T,>(
  table: string,
  params: Record<string, string>,
) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return [];

  const url = new URL(`/rest/v1/${table}`, supabaseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!response.ok) return [];

  return (await response.json()) as T[];
};

const fetchPostBySlug = async (slug: string) => {
  for (const candidate of getPostSlugCandidates(slug)) {
    const [post] = await fetchSupabaseRows<OgPost>("posts", {
      select: "title,created_at,category_id",
      slug: `eq.${candidate}`,
      order: "created_at.desc",
      limit: "1",
    });

    if (post) return post;
  }

  return null;
};

const fetchCategoryById = async (categoryId?: number) => {
  if (!categoryId) return null;

  const [category] = await fetchSupabaseRows<CategoryData>("categories", {
    select: "name,thumbnail",
    id: `eq.${categoryId}`,
    limit: "1",
  });

  return category ?? null;
};

const CalendarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path
      d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
      stroke="#f8fafc"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TagIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path
      d="M20.59 13.41 12 22l-9-9V4h9l8.59 8.59a2 2 0 0 1 0 2.82Z"
      stroke="#f8fafc"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.5 7.5h.01"
      stroke="#f8fafc"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export async function GET(request: Request, { params }: RouteContext) {
  await ensureResvgWasm(request.url);

  const { id } = await params;
  const assetOrigin = new URL(request.url).origin;
  const [fontData, logoSrc, post] = await Promise.all([
    getOgFont(assetOrigin),
    getThumbnailLogoSrc(assetOrigin),
    fetchPostBySlug(id),
  ]);

  const category = await fetchCategoryById(post?.category_id);
  const title = post?.title ?? "TaeHyun's Devlog";
  const categoryName = category?.name ?? "Devlog";
  const thumbnailUrl = toSatoriCompatibleImageUrl(category?.thumbnail);
  const date = post?.created_at
    ? new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(post.created_at))
    : "";

  const svg = await satori(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#020617",
        color: "#ffffff",
        fontFamily: "Pretendard, Arial, sans-serif",
      }}
    >
      <img
        src={thumbnailUrl}
        alt=""
        width={1200}
        height={630}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#000000",
          opacity: 0.45,
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "54px 72px 66px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 760,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 54,
              fontWeight: 900,
              lineHeight: 1.06,
              letterSpacing: 0,
              color: "#ffffff",
              textShadow: "0 8px 32px rgba(0,0,0,0.58)",
              textWrap: "balance",
              whiteSpace: "normal",
              wordBreak: "keep-all",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 72,
            bottom: 58,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 12,
            color: "#f8fafc",
            fontSize: 22,
            fontWeight: 600,
            lineHeight: 1.2,
            textShadow: "0 4px 18px rgba(0,0,0,0.45)",
          }}
        >
          {date ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <CalendarIcon />
              <span>{date}</span>
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <TagIcon />
            <span>{categoryName}</span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 72,
            bottom: 58,
            display: "flex",
          }}
        >
          <img
            src={logoSrc}
            alt=""
            width={64}
            height={68}
            style={{
              width: 64,
              height: 68,
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Pretendard",
          data: fontData,
          weight: 900,
          style: "normal",
        },
      ],
    },
  );

  const png = new Resvg(svg).render().asPng();
  const pngBlob = new Blob([new Uint8Array(png)], { type: "image/png" });

  return new Response(pngBlob, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/png",
    },
  });
}
