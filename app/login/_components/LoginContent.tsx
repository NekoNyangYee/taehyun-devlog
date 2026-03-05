"use client";

import LoginPageLogoIcon from "@components/components/icons/LoginPageLogoIcon";
import { ArrowLeft, House } from "lucide-react";
import Link from "next/link";
import { SocialLoginButton } from "./SocialLoginButton";
import { useLogin } from "../_hooks/useLogin";

/**
 * 로그인 페이지 컨텐츠 (Container Component)
 * - Hook으로 로직 관리
 * - Presentational 컴포넌트 조합
 */
export default function LoginContent() {
  const { isLoading, handleSocialLogin } = useLogin();

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="w-full px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto flex w-full max-w-[460px] flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex w-fit items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            <ArrowLeft size={20} />
            <span>뒤로가기</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            <House size={18} />
            홈으로
          </Link>
        </div>

        <div className="w-full rounded-3xl bg-white p-6 md:p-7">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <LoginPageLogoIcon />
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900 md:text-[28px]">
                  블로그 로그인
                </h1>
                <p className="text-sm leading-relaxed text-slate-500">
                  로그인하여 게시글에 공감과 댓글을 남겨보세요.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium tracking-wide text-slate-400">
                간편 로그인
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex flex-col gap-2.5">
              <SocialLoginButton
                provider="google"
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading}
              />
              <SocialLoginButton
                provider="kakao"
                onClick={() => handleSocialLogin("kakao")}
                disabled={isLoading}
              />
            </div>

            <p className="text-center text-xs leading-relaxed text-slate-400">
              로그인하면 댓글 작성, 북마크 등 개인화 기능을 사용할 수 있어요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
