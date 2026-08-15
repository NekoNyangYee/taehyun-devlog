"use client";

import { useState, type ReactNode } from "react";
import GitHubCalendar from "react-github-calendar";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import {
  BriefcaseBusinessIcon,
  GithubIcon,
  GraduationCapIcon,
  MailIcon,
} from "lucide-react";
import { useTheme } from "@components/components/ThemeProvider";

export default function ProfileDetailPage() {
  const { resolvedTheme } = useTheme();
  const [profile] = useState({
    name: "김태현",
    username: "NekoNyangYee",
    email: "kth08122570@gmail.com",
    github: "https://github.com/NekoNyangYee",
    description: "안녕하세요! 프론트엔드 개발자 김태현입니다.",
    stacks: [
      { name: "React", color: "#61DAFB" },
      { name: "JavaScript", color: "#F7DF1E" },
      { name: "TypeScript", color: "#3178C6" },
      { name: "Next.js", color: "#111111" },
      { name: "TailwindCSS", color: "#06B6D4" },
      { name: "Zustand", color: "#9A6B4F" },
      { name: "Vercel", color: "#111111" },
      { name: "shadcn/ui", color: "#64748B" },
      { name: "Git", color: "#F05032" },
    ],
    education: [
      { school: "청석고등학교", period: "2018 ~ 2021 졸업" },
      {
        school: "청주대학교 디지털보안학과",
        period: "2021. 3 ~ 현재 재학 중",
      },
    ],
    career: [
      {
        company: "청주대학교 디지털보안학과 연구실",
        period: "2024. 11 ~ 현재",
      },
      {
        company: "청주대학교 창업동아리",
        period: "2025. 04 ~ 현재",
      },
    ],
  });

  const transformData = (
    contributions: { date: string; count: number; level: number }[],
  ) =>
    contributions.map((activity) => ({
      date: dayjs(activity.date).format("YYYY-MM-DD"),
      count: activity.count,
      level: Math.min(4, Math.max(0, activity.level)) as 0 | 1 | 2 | 3 | 4,
    }));

  return (
    <motion.main className="my-8 w-full flex-1 sm:my-12 lg:my-16">
      <header className="flex flex-col gap-8 py-6 sm:py-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-blue-500 dark:text-blue-300">
            프로필
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-gray-950 dark:text-white sm:text-5xl">
            {profile.name}
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300 sm:text-lg">
            {profile.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={`mailto:${profile.email}`}
            aria-label={`이메일 보내기: ${profile.email}`}
            title={profile.email}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gray-100 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-950 dark:bg-white/[0.07] dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <MailIcon size={18} />
            이메일
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub 프로필 열기"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gray-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
          >
            <GithubIcon size={18} />
            GitHub
          </a>
        </div>
      </header>

      <div className="mt-10 flex flex-col gap-10 sm:mt-14 sm:gap-14">
        <section aria-labelledby="tech-stack-title">
          <h2
            id="tech-stack-title"
            className="text-2xl font-bold tracking-[-0.03em] text-gray-950 dark:text-white"
          >
            기술 스택
          </h2>
          <div className="mt-5 flex flex-wrap gap-2.5 rounded-3xl bg-gray-100/80 p-5 dark:bg-white/[0.055] sm:p-7">
            {profile.stacks.map((stack) => (
              <span
                key={stack.name}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3.5 text-sm font-semibold text-gray-800 ring-1 ring-gray-200 dark:bg-white/[0.07] dark:text-gray-100 dark:ring-white/10"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: stack.color }}
                  aria-hidden="true"
                />
                {stack.name}
              </span>
            ))}
          </div>
        </section>

        <section aria-labelledby="github-activity-title">
          <h2
            id="github-activity-title"
            className="text-2xl font-bold tracking-[-0.03em] text-gray-950 dark:text-white"
          >
            GitHub 활동
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            꾸준히 쌓아 온 개발 기록입니다.
          </p>
          <div className="mt-5 overflow-x-auto rounded-3xl bg-gray-100/80 p-5 dark:bg-white/[0.055] sm:p-7">
            <div className="min-w-[720px]">
              <GitHubCalendar
                username={profile.username}
                transformData={transformData}
                colorScheme={resolvedTheme}
                theme={{
                  light: ["#e5e7eb", "#bfdbfe", "#60a5fa", "#3182f6", "#1d4ed8"],
                  dark: ["#25272d", "#173d68", "#1d5fa7", "#3182f6", "#90c2ff"],
                }}
                hideColorLegend
                hideTotalCount={false}
                hideMonthLabels={false}
                showWeekdayLabels
                labels={{
                  totalCount: `${profile.name}님이 지난 1년 동안 {{count}}개의 기여를 남겼어요.`,
                }}
              />
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <ProfileHistorySection
            title="학력"
            icon={<GraduationCapIcon size={20} />}
            items={profile.education.map((item) => ({
              title: item.school,
              period: item.period,
            }))}
          />
          <ProfileHistorySection
            title="경력"
            icon={<BriefcaseBusinessIcon size={20} />}
            items={profile.career.map((item) => ({
              title: item.company,
              period: item.period,
            }))}
          />
        </div>
      </div>
    </motion.main>
  );
}

function ProfileHistorySection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: ReactNode;
  items: { title: string; period: string }[];
}) {
  return (
    <section aria-labelledby={`profile-${title}`}>
      <h2
        id={`profile-${title}`}
        className="text-2xl font-bold tracking-[-0.03em] text-gray-950 dark:text-white"
      >
        {title}
      </h2>
      <div className="mt-5 flex flex-col gap-3">
        {items.map((item, index) => (
          <div
            key={item.title}
            className="flex items-start gap-4 rounded-2xl bg-gray-100/80 p-5 dark:bg-white/[0.055] sm:p-6"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-700 ring-1 ring-gray-200 dark:bg-white/[0.07] dark:text-gray-200 dark:ring-white/10">
              {icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-6 text-gray-950 dark:text-white">
                {item.title}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {item.period}
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
