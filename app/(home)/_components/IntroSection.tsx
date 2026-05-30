"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpenText, EyeIcon, HeartIcon } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  postsQueryKey,
  fetchPostsQueryFn,
} from "@components/queries/postQueries";

const TAGS = ["React", "Next.js", "TypeScript", "UI/UX", "CS", "Devlog"];

const formatMetric = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
};

/**
 * 홈 인트로 섹션 — 블로그 소개 + 통계 + CTA
 * - 게시물 목록 대신 한눈에 블로그를 파악할 수 있는 진입 카드
 */
export function IntroSection() {
  const { data: posts = [] } = useQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPostsQueryFn,
  });

  const { totalPosts, totalLikes, totalViews } = useMemo(() => {
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, p) => sum + (p.like_count ?? 0), 0);
    const totalViews = posts.reduce((sum, p) => sum + (p.view_count ?? 0), 0);
    return { totalPosts, totalLikes, totalViews };
  }, [posts]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full overflow-hidden rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm shadow-sm"
    >
      <div className="grid gap-8 px-6 py-10 md:grid-cols-[1.4fr_1fr] md:gap-12 md:px-10 md:py-14">
        {/* Left — 인사 + 태그 + CTA */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-[0.18em] text-gray-500 dark:text-gray-400 uppercase">
              TaeHyun&apos;s Devlog
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-gray-100">
              배움과 시행착오를
              <br />
              기록하는 공간
            </h1>
            <p className="mt-2 text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
              대학생 프론트엔드 개발자의 학습과 프로젝트 인사이트, 그리고
              일상적인 개발 노트를 공유합니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 dark:bg-white/10 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-1">
            <Link
              href="/posts"
              className="group inline-flex items-center gap-2 rounded-full bg-zinc-800 dark:bg-zinc-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-900 dark:hover:bg-zinc-600 transition-colors"
            >
              <BookOpenText size={16} />
              게시물 둘러보기
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-white/15 px-5 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              프로필 보기
            </Link>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-3 mt-3 max-w-md">
            <StatCard
              label="POSTS"
              value={formatMetric(totalPosts)}
              icon={BookOpenText}
            />
            <StatCard
              label="LIKES"
              value={formatMetric(totalLikes)}
              icon={HeartIcon}
            />
            <StatCard
              label="VIEWS"
              value={formatMetric(totalViews)}
              icon={EyeIcon}
            />
          </div>
        </div>

        {/* Right — 프로필 카드 */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-full max-w-md rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800 p-6 shadow-md">
            <div className="flex items-center gap-2 mb-5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-300">
                현재 활동 중
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl ring-2 ring-gray-200 dark:ring-white/10 shrink-0">
                <Image
                  src="/profile.webp"
                  alt="태현 프로필"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Frontend Engineer
                </span>
                <span className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                  TaeHyun Kim
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  React · Next.js · TypeScript
                </p>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-200 dark:border-white/10 grid grid-cols-3 gap-3 text-xs">
              <MetaItem label="언어" value="한국어" />
              <MetaItem label="위치" value="Seoul, KR" />
              <MetaItem
                label="상태"
                value="활동중"
                accent="text-emerald-600 dark:text-emerald-300"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof BookOpenText;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/40 dark:bg-white/5 px-3 py-3 text-center">
      <div className="flex items-center justify-center gap-1 mb-1 text-gray-500 dark:text-gray-400">
        <Icon size={12} />
        <span className="text-[10px] font-semibold tracking-[0.15em]">
          {label}
        </span>
      </div>
      <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

function MetaItem({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <div className="text-gray-500 dark:text-gray-400">{label}</div>
      <div
        className={`font-semibold mt-1 ${accent ?? "text-gray-900 dark:text-white"}`}
      >
        {value}
      </div>
    </div>
  );
}
