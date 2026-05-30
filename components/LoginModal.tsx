"use client";

import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import LoginPageLogoIcon from "./icons/LoginPageLogoIcon";
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
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
            className="relative w-full max-w-[440px] rounded-3xl bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-2xl"
          >
            <button
              onClick={close}
              aria-label="닫기"
              className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
            >
              <XIcon size={20} />
            </button>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-3 text-center pt-2">
                <LoginPageLogoIcon />
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold text-slate-900 dark:text-gray-100">
                    블로그 로그인
                  </h1>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    로그인하여 게시글에 공감과 댓글을 남겨보세요.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                <span className="text-xs font-medium tracking-wide text-slate-400 dark:text-slate-500">
                  간편 로그인
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
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

              <p className="text-center text-xs leading-relaxed text-slate-400 dark:text-slate-500">
                로그인하면 댓글 작성, 북마크 등 개인화 기능을 사용할 수 있어요.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
