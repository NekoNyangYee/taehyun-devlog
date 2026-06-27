"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, CheckCheck, UserRoundIcon } from "lucide-react";
import { motion } from "framer-motion";
import { contentReveal } from "@components/components/motion/contentReveal";
import { useIsClient } from "@components/lib/hooks/useIsClient";
import {
  fetchProfileQueryFn,
  profileQueryKey,
} from "@components/queries/profileQueries";
import {
  fetchPostsQueryFn,
  postsQueryKey,
} from "@components/queries/postQueries";

export default function PublicUserProfileContent() {
  const isClient = useIsClient();
  const params = useParams();
  const profileId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: profiles = [], isLoading: isProfileLoading } = useQuery({
    queryKey: profileQueryKey(profileId),
    queryFn: () => fetchProfileQueryFn(profileId),
    enabled: Boolean(profileId),
  });

  const { data: posts = [] } = useQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPostsQueryFn,
  });

  const profile = profiles[0];
  const userPosts = posts.filter((post) => post.author_id === profileId);
  const isEditor = profile?.role === "edit";

  if (!isClient || isProfileLoading) {
    return (
      <section className="flex min-h-[60vh] w-full items-center justify-center">
        <p className="text-metricsText">프로필을 불러오는 중입니다...</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <motion.section
        {...contentReveal}
        className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-container bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
          <UserRoundIcon size={28} />
        </div>
        <h1 className="text-2xl font-semibold text-gray-950 dark:text-gray-50">
          프로필을 찾을 수 없습니다.
        </h1>
        <p className="text-sm leading-6 text-metricsText">
          공유 링크가 올바른지 다시 확인해 주세요.
        </p>
      </motion.section>
    );
  }

  return (
    <motion.section
      {...contentReveal}
      className="flex w-full flex-col px-4 py-8 md:py-10"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div className="relative h-56 w-full overflow-hidden rounded-container bg-gray-100 dark:bg-zinc-900 md:h-64">
          <Image
            src={profile.profile_banner || "/default.png"}
            alt="프로필 배너"
            fill
            priority
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover"
          />
        </div>

        <section className="rounded-container border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-800">
              <Image
                src={profile.profile_image || "/default.png"}
                alt="프로필 이미지"
                fill
                priority
                quality={75}
                sizes="96px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-semibold leading-tight text-gray-950 dark:text-gray-50">
                  {profile.nickname || "이름 정보 없음"}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200">
                  <CheckCheck size={13} />
                  공개
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                공개 프로필입니다.
              </p>

              <div className="mt-4 flex flex-wrap gap-5 text-sm">
                <span>
                  게시물 <strong className="font-semibold">{userPosts.length}</strong>
                </span>
                <span>
                  권한{" "}
                  <strong className="font-semibold">
                    {isEditor ? "Editor" : "Member"}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Link
            href="/myinfo"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-button border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-zinc-950 dark:text-gray-100 dark:hover:bg-white/10 sm:w-auto"
          >
            <ArrowLeftIcon size={16} />
            내 정보로 돌아가기
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
