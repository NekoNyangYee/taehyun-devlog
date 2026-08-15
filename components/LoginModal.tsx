"use client";

import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { SocialLoginButton } from "./SocialLoginButton";
import { useLogin } from "@components/lib/hooks/useLogin";
import { useLoginModalStore } from "@components/store/loginModalStore";
import { supabase } from "@components/lib/supabaseClient";
import { useSessionStore } from "@components/store/sessionStore";

export default function LoginModal() {
  const isOpen = useLoginModalStore((s) => s.isOpen);
  const close = useLoginModalStore((s) => s.close);
  const addSession = useSessionStore((s) => s.addSession);
  const { isLoading, handleSocialLogin } = useLogin();

  // ESC + body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, close]);

  // 로그인 성공 시 모달 자동 닫기
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          addSession(session);
          close();
        }
      },
    );
    return () => listener?.subscription.unsubscribe();
  }, [addSession, close]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative max-h-[calc(100vh-2rem)] w-full max-w-[760px] overflow-y-auto rounded-[2rem] border border-gray-100 bg-white shadow-[0_16px_60px_rgba(15,23,42,0.18)] scrollbar-hide dark:border-white/10 dark:bg-zinc-950"
          >
            <button
              onClick={close}
              aria-label="로그인 창 닫기"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-white/10 dark:hover:text-gray-200 sm:right-6 sm:top-6"
            >
              <XIcon size={20} />
            </button>

            <section className="flex min-h-[34rem] items-center px-6 py-16 sm:px-12 sm:py-20 md:px-16">
              <div className="mx-auto w-full max-w-[25rem]">
                <p className="text-sm font-semibold text-[#3182f6] dark:text-blue-300">
                  TaeHyun&apos;s Devlog
                </p>
                <h1
                  className="mt-3 text-[1.7rem] font-bold tracking-[-0.03em] text-gray-950 dark:text-white sm:text-[2rem]"
                  style={{ lineHeight: 1.4 }}
                >
                  반가워요.
                  <br />
                  편하게 로그인해 주세요
                </h1>
                <p
                  className="mt-4 text-sm text-gray-500 dark:text-gray-400 sm:text-[15px]"
                  style={{ lineHeight: 1.7 }}
                >
                  로그인하면 마음에 드는 아티클을 저장하고,
                  <br className="hidden sm:block" /> 댓글로 함께 이야기할 수
                  있어요.
                </p>

                <div className="mt-7 rounded-2xl bg-gray-50 px-5 py-4 dark:bg-zinc-900">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    로그인 후 이용할 수 있어요
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>아티클 북마크</span>
                    <span>댓글 작성</span>
                    <span>내 활동 관리</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
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

                <p
                  className="mt-5 text-center text-xs text-gray-400 dark:text-gray-500"
                  style={{ lineHeight: 1.6 }}
                >
                  사용하던 계정으로 간단하게 시작할 수 있어요.
                </p>
              </div>
            </section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
