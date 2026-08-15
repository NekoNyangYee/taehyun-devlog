"use client";

import Image from "next/image";
import { cn } from "@components/lib/utils";

interface LoginRequiredStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  className?: string;
  onLoginClick: () => void;
}

export function LoginRequiredState({
  title = "로그인하고 계속해 볼까요?",
  description = "로그인하면 저장한 아티클과 내 활동을 편하게 확인할 수 있어요.",
  actionLabel = "로그인하기",
  className,
  onLoginClick,
}: LoginRequiredStateProps) {
  return (
    <section
      className={cn(
        "mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 text-center",
        className,
      )}
    >
      <Image
        src="/need-login.png"
        alt="로그인이 필요한 서비스"
        width={192}
        height={192}
        quality={75}
        className="h-auto w-40 sm:w-48"
        sizes="(max-width: 640px) 160px, 192px"
      />
      <h1 className="text-2xl font-semibold text-gray-950 dark:text-gray-50">
        {title}
      </h1>
      <p className="text-sm leading-6 text-metricsText">{description}</p>
      <button
        type="button"
        onClick={onLoginClick}
        className="p-button rounded-button bg-action px-6 py-3 text-action-foreground transition-colors hover:bg-action-hover"
      >
        {actionLabel}
      </button>
    </section>
  );
}
