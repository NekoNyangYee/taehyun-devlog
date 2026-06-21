"use client";

import {
  CheckCheck,
  CircleAlert,
  CopyIcon,
  Share2Icon,
  UserCheckIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ProfileInfoProps {
  avatar: string;
  name: string;
  email: string;
  audience: string;
  isEditor: boolean;
  postCount: number;
}

export function ProfileInfo({
  avatar,
  name,
  email,
  audience,
  isEditor,
  postCount,
}: ProfileInfoProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const handleShare = async () => {
    const url = shareUrl || window.location.href;
    const isPc = window.matchMedia("(pointer: fine)").matches;

    if (!isPc && navigator.share) {
      try {
        await navigator.share({
          title: `${name} 프로필`,
          text: `${name}님의 프로필을 확인해보세요.`,
          url,
        });
        return;
      } catch (error) {
        if ((error as DOMException).name === "AbortError") return;
      }
    }

    setIsShareModalOpen(true);
  };

  const handleCopy = async () => {
    const url = shareUrl || window.location.href;
    await navigator.clipboard.writeText(url);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1500);
  };

  return (
    <>
      <section className="rounded-container border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-800">
              <Image
                src={avatar || "/default.png"}
                alt="프로필 이미지"
                fill
                priority
                quality={75}
                sizes="96px"
                className="object-cover"
              />
              {isEditor && (
                <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 shadow-sm">
                  <UserCheckIcon size={16} className="text-white" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-semibold leading-tight text-gray-950 dark:text-gray-50">
                  {name}
                </h1>
                {audience ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200">
                    <CheckCheck size={13} />
                    인증
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 dark:bg-red-500/10">
                    <CircleAlert size={13} />
                    미인증
                  </span>
                )}
              </div>
              <p className="mt-1 truncate text-sm text-metricsText">{email}</p>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {isEditor
                  ? "블로그 콘텐츠를 작성하고 관리할 수 있는 계정입니다."
                  : "개인 활동과 계정 정보를 확인할 수 있는 계정입니다."}
              </p>

              <div className="mt-4 flex flex-wrap gap-5 text-sm">
                <span>
                  게시물 <strong className="font-semibold">{postCount}</strong>
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

          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 rounded-button bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-200 md:w-44 dark:bg-white/10 dark:text-gray-100 dark:hover:bg-white/15"
          >
            <Share2Icon size={15} />
            프로필 공유
          </button>
        </div>
      </section>

      {isShareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-container border border-gray-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-950 dark:text-gray-50">
                프로필 공유
              </h2>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="rounded-full p-1.5 text-metricsText transition hover:bg-gray-100 dark:hover:bg-white/10"
                aria-label="닫기"
              >
                <XIcon size={18} />
              </button>
            </div>
            <p className="mt-2 text-sm text-metricsText">
              아래 링크를 복사해서 프로필을 공유할 수 있습니다.
            </p>
            <div className="mt-4 flex min-w-0 items-center gap-2 rounded-container border border-gray-200 bg-gray-50 p-2 dark:border-white/10 dark:bg-white/5">
              <input
                readOnly
                value={shareUrl}
                className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
              />
              <button
                onClick={handleCopy}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-button bg-gray-950 px-3 py-2 text-sm text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                <CopyIcon size={14} />
                {copyState === "copied" ? "복사됨" : "복사"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
