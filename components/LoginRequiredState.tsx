"use client";

import { LogInIcon } from "lucide-react";
import { cn } from "@components/lib/utils";

interface LoginRequiredStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  className?: string;
  onLoginClick: () => void;
}

export function LoginRequiredState({
  title = "로그인이 필요합니다.",
  description = "로그인 후 이용할 수 있습니다.",
  actionLabel = "로그인하러 가기",
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
      <div className="flex h-14 w-14 items-center justify-center rounded-container bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
        <LogInIcon size={28} />
      </div>
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
