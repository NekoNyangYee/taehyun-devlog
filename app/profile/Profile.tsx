"use client";

import { useState } from "react";
import GitHubCalendar from "react-github-calendar";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import {
  BriefcaseBusinessIcon,
  GithubIcon,
  GraduationCapIcon,
  MailIcon,
} from "lucide-react";
import { PageTitlePanel } from "@components/components/PageTitlePanel";

const panelHeaderClass =
  "flex min-h-12 items-center border-b border-gray-200 bg-gray-50 px-5 font-mono text-sm font-semibold tracking-[0.08em] text-gray-700 dark:border-white/10 dark:bg-zinc-900 dark:text-gray-200";

export default function ProfileDetailPage() {
  const [profile] = useState({
    name: "김태현",
    username: "NekoNyangYee",
    email: "kth08122570@gmail.com",
    github: "https://github.com/NekoNyangYee",
    description: "안녕하세요! 프론트엔드 개발자 김태현입니다.",
    stacks: [
      { name: "React", bgcolor: "33302E", logocolor: "61DAFB" },
      { name: "JavaScript", bgcolor: "F7DF1E", logocolor: "000000" },
      { name: "TypeScript", bgcolor: "3178C6", logocolor: "FFFFFF" },
      { name: "Next.js", bgcolor: "000000", logocolor: "FFFFFF" },
      { name: "TailwindCSS", bgcolor: "06B6D4", logocolor: "FFFFFF" },
      { name: "Zustand", bgcolor: "3178C6", logocolor: "FFFFFF" },
      { name: "Vercel", bgcolor: "000000", logocolor: "FFFFFF" },
      { name: "shadcnui", bgcolor: "000000", logocolor: "FFFFFF" },
      { name: "git", bgcolor: "F05032", logocolor: "FFFFFF" },
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
    <motion.div className="my-6 flex w-full flex-1 flex-col border border-gray-200 bg-white dark:border-white/10 dark:bg-zinc-950 md:my-8">
      <PageTitlePanel title="Profile" />

      <section className="flex flex-col border-b border-gray-200 dark:border-white/10 md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-8 md:px-8 md:py-10">
          <span className="font-mono text-sm tracking-[0.08em] text-metricsText">
            About Me
          </span>
          <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-gray-50">
            {profile.name}
          </h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
            {profile.description}
          </p>
        </div>

        <div className="flex shrink-0 border-t border-gray-200 dark:border-white/10 md:border-l md:border-t-0">
          <a
            href={`mailto:${profile.email}`}
            aria-label={`이메일 보내기: ${profile.email}`}
            title={profile.email}
            className="flex min-h-16 flex-1 items-center justify-center border-r border-gray-200 px-7 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white md:flex-none"
          >
            <MailIcon size={22} />
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub 프로필 열기"
            title="GitHub"
            className="flex min-h-16 flex-1 items-center justify-center px-7 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white md:flex-none"
          >
            <GithubIcon size={22} />
          </a>
        </div>
      </section>

      <section className="border-b border-gray-200 dark:border-white/10">
        <h2 className={panelHeaderClass}>Tech Stack</h2>
        <div className="flex flex-wrap gap-2 p-5 md:p-6">
          {profile.stacks.map((stack) => (
            <img
              key={stack.name}
              src={`https://img.shields.io/badge/${stack.name}-${stack.bgcolor}?style=for-the-badge&logo=${stack.name}&logoColor=${stack.logocolor}`}
              alt={stack.name}
            />
          ))}
        </div>
      </section>

      <section className="border-b border-gray-200 dark:border-white/10">
        <h2 className={panelHeaderClass}>GitHub Contributions</h2>
        <div className="overflow-x-auto p-5 md:p-6">
          <GitHubCalendar
            username={profile.username}
            transformData={transformData}
            colorScheme="light"
            theme={{
              light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
            }}
            hideColorLegend
            hideTotalCount={false}
            hideMonthLabels={false}
            showWeekdayLabels
            labels={{
              totalCount: `${profile.name}님은 {{count}}번 잔디를 심었습니다. 🌱`,
            }}
          />
        </div>
      </section>

      <div className="grid md:grid-cols-2">
        <section className="border-b border-gray-200 dark:border-white/10 md:border-b-0 md:border-r">
          <h2 className={panelHeaderClass}>Education</h2>
          <div>
            {profile.education.map((education, index) => (
              <div
                key={education.school}
                className="flex items-start gap-4 border-b border-gray-200 px-5 py-5 last:border-b-0 dark:border-white/10"
              >
                <GraduationCapIcon
                  size={20}
                  className="mt-0.5 shrink-0 text-metricsText"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-950 dark:text-gray-50">
                    {education.school}
                  </p>
                  <p className="mt-1 text-sm text-metricsText">
                    {education.period}
                  </p>
                </div>
                <span className="ml-auto font-mono text-xs text-metricsText">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className={panelHeaderClass}>Experience</h2>
          <div>
            {profile.career.map((career, index) => (
              <div
                key={career.company}
                className="flex items-start gap-4 border-b border-gray-200 px-5 py-5 last:border-b-0 dark:border-white/10"
              >
                <BriefcaseBusinessIcon
                  size={20}
                  className="mt-0.5 shrink-0 text-metricsText"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-950 dark:text-gray-50">
                    {career.company}
                  </p>
                  <p className="mt-1 text-sm text-metricsText">
                    {career.period}
                  </p>
                </div>
                <span className="ml-auto font-mono text-xs text-metricsText">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
