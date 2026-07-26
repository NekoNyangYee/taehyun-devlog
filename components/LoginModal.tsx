"use client";

import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import Image from "next/image";
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
            className="relative max-h-[calc(100vh-2rem)] w-full max-w-[760px] overflow-y-auto border border-gray-200 bg-white shadow-2xl scrollbar-hide dark:border-white/10 dark:bg-zinc-950"
          >
            <div className="flex h-12 items-center justify-between border-b border-gray-200 bg-gray-50 pl-5 dark:border-white/10 dark:bg-zinc-900">
              <span className="font-mono text-sm font-semibold tracking-[0.08em] text-gray-600 dark:text-gray-300">
                Blog Login
              </span>
              <button
                onClick={close}
                aria-label="닫기"
                className="flex h-12 w-12 items-center justify-center border-l border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:border-white/10 dark:text-gray-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <XIcon size={19} />
              </button>
            </div>

            <div className="grid md:grid-cols-[0.9fr_1.1fr]">
              <section className="relative min-h-56 overflow-hidden border-b border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-zinc-900 md:min-h-[360px] md:border-b-0 md:border-r">
                <Image
                  src="/login-banner.png"
                  alt=""
                  fill
                  priority
                  quality={80}
                  sizes="(max-width: 767px) 100vw, 340px"
                  className="object-cover"
                />
              </section>

              <section className="flex min-h-[360px] flex-col justify-center p-6 sm:p-8 md:p-10">
                <div>
                  <p className="font-mono text-xs font-semibold tracking-[0.12em] text-gray-500 dark:text-gray-400">
                    TaeHyun&apos;s Devlog
                  </p>
                  <h1 className="mt-3 text-2xl font-semibold leading-snug text-gray-950 dark:text-gray-50">
                    개발의 과정과 배움을
                    <br />
                    함께 기록하는 공간
                  </h1>
                </div>

                <div className="mt-8 flex flex-col gap-2">
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

                <p className="mt-5 text-xs leading-relaxed text-gray-400 dark:text-gray-500">
                  로그인하면 댓글 작성, 북마크 등 개인화 기능을 사용할 수
                  있어요.
                </p>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
