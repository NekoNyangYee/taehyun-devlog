import { Mail } from "lucide-react";
import Image from "next/image";
import LogoIcon from "./icons/LogoIcon";

const GITHUB_URL = "https://github.com/kth08";
const EMAIL = "mailto:kth08.dev@gmail.com";

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-zinc-950">
      <div className="site-container flex min-h-24 flex-col justify-between gap-4 py-4 text-gray-700 dark:text-gray-300 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 dark:[&_svg_path]:fill-white dark:[&_svg_path]:stroke-white dark:[&_svg_rect]:fill-white">
            <LogoIcon />
            <span className="whitespace-nowrap text-base font-bold text-gray-900 dark:text-white">
              TaeHyun&apos;s Devlog
            </span>
          </div>

          <span className="hidden h-5 w-px bg-gray-300 dark:bg-white/15 sm:block" />

          <div className="flex items-center gap-1">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-white/10"
            >
              <Image
                src="/github.svg"
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 dark:invert"
              />
            </a>
            <a
              href={EMAIL}
              aria-label="이메일"
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-white/10"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-left sm:items-end sm:text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            개발 과정에서 배운 내용과 경험을 기록하는 기술 블로그입니다.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            &copy; 2025 - 2026 TaeHyun&apos;s Devlog. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
