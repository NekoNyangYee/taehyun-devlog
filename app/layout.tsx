import type { Metadata } from "next";
import "./globals.css";
import Header from "@components/components/Header";
import { Suspense, type ReactNode } from "react";
import PageLoading from "@components/components/loading/PageLoading";
import Footer from "@components/components/Footer";
import PageTransition from "@components/components/PageTransition";
import { AuroraBackground } from "@components/components/ui/aurora";
import { ThemeProvider } from "@components/components/ThemeProvider";
import Script from "next/script";
import { ReactQueryProvider } from "./ReactQueryProvider";

// FOUC 방지: body 파싱 전에 html에 dark 클래스 + color-scheme 적용
// color-scheme은 CSS 파싱 전에 브라우저가 사용하는 기본 캔버스/스크롤바 색상까지 맞춰주어 깜빡임 최소화
const themeInitScript = `
(function(){try{var t=localStorage.getItem('app-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d){r.classList.add('dark');}r.style.colorScheme=d?'dark':'light';}catch(e){}})();
`;

export const metadata: Metadata = {
  title: "TaeHyun's Devlog",
  description:
    "프론트엔드 개발자 김태현의 기술 블로그입니다. 개발, 공부, 프로젝트, 일상 등 다양한 이야기를 공유합니다.",
  keywords: [
    "프론트엔드",
    "개발",
    "블로그",
    "React",
    "Next.js",
    "TypeScript",
    "김태현",
  ],
  openGraph: {
    title: "TaeHyun's Devlog",
    description: "프론트엔드 개발자 김태현의 기술 블로그입니다.",
    url: "https://taehyun-devlog.vercel.app", // 실제 도메인으로 변경 필요
    siteName: "TaeHyun's Devlog",
    images: [
      {
        url: "/profile.jpg",
        width: 800,
        height: 600,
        alt: "블로그 대표 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaeHyun's Devlog",
    description: "프론트엔드 개발자 김태현의 기술 블로그입니다.",
    images: ["/profile.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22223b" />
        <link
          rel="apple-touch-icon"
          href="/icons/LogoIcon.png"
          sizes="192x192"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        <link rel="icon" href="/logo.png" type="image/png" />

        {/* LCP 이미지 Preload */}
        <link
          rel="preload"
          as="image"
          href="/profile.webp"
          fetchPriority="high"
        />

        {/* Preconnect to external CDNs */}
        <link rel="preconnect" href="https://cdn.mos.cms.futurecdn.net" />
        <link rel="preconnect" href="https://s3.ap-northeast-2.amazonaws.com" />
        <link rel="preconnect" href="https://img.freepik.com" />
        <link
          rel="preconnect"
          href="https://odflryzaijseaabpixhw.supabase.co"
        />

        {/* ✅ Highlight.js CSS (테마) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
        />
        {/* 테마 FOUC 방지 인라인 스크립트 */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="relative isolate flex min-h-screen flex-col">
        {/*
         * 전역 Aurora 배경 (Aceternity / shadcn.io 샘플)
         * AuroraBackground 컴포넌트의 className으로 base 스타일(h-[100vh], bg-zinc-50/bg-zinc-900, relative)을 모두 덮어쓴다:
         * - h-[300px]            → 작은 상단 배너 영역만 차지
         * - bg-transparent       → body 배경이 비치도록 (light에서 zinc-50 회색감 제거)
         * - absolute top-0 ...   → 페이지 상단에 고정 (스크롤 시 함께 위로 사라짐)
         * - z-[1]                → 콘텐츠(z:0) 위, 헤더(z:30) 아래
         * - pointer-events-none  → 클릭 통과
         */}
        <AuroraBackground
          showRadialGradient
          animationSpeed={40}
          className="absolute top-0 left-0 right-0 h-[300px] min-h-0 bg-transparent dark:bg-transparent -z-10 pointer-events-none"
        >
          <></>
        </AuroraBackground>
        <ThemeProvider>
          <ReactQueryProvider>
            <Header />
            <div className="flex flex-1 max-w-[90rem] box-border mx-auto w-full pt-[65px]">
              <Suspense fallback={<PageLoading />}>
                <PageTransition>{children}</PageTransition>
              </Suspense>
            </div>
            <Footer />
          </ReactQueryProvider>
        </ThemeProvider>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
          strategy="afterInteractive"
        />
        <Script id="hljs-init" strategy="afterInteractive">{`
          if (typeof window !== 'undefined' && window.hljs) {
            window.hljs.highlightAll();
          }
        `}</Script>
      </body>
    </html>
  );
}
