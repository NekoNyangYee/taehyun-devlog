"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@components/lib/supabaseClient";
import { useSessionStore } from "@components/store/sessionStore";
import { useIsClient } from "@components/lib/hooks/useIsClient";
import { useAnimatedMount } from "@components/lib/hooks/useAnimatedMount";

const MOBILE_NAV_ITEMS = [
  { href: "/articles", label: "Articles" },
  { href: "/bookmarks", label: "Bookmarks" },
  { href: "/profile", label: "About" },
];

export default function MobileNavBar({
  isOpen,
  onClose,
  onLoginClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick?: () => void;
}) {
  const router = useRouter();
  const { session, addSession } = useSessionStore();
  const isClient = useIsClient();
  const { isVisible, isAnimating } = useAnimatedMount(isOpen, 250);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    addSession(null);
    router.push("/");
    onClose();
  };

  if (!isVisible) return null;

  return (
    <>
      <button
        type="button"
        aria-label="모바일 메뉴 닫기"
        className={`fixed inset-x-0 bottom-0 top-[65px] z-0 bg-black/30 backdrop-blur-sm transition-opacity duration-[250ms] lg:hidden ${
          isAnimating ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <nav
        aria-label="모바일 메뉴"
        className={`relative z-10 grid bg-white transition-[grid-template-rows,opacity] duration-[250ms] ease-out dark:bg-zinc-950 lg:hidden ${
          isAnimating
            ? "grid-rows-[1fr] opacity-100"
            : "pointer-events-none grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 max-h-[calc(100dvh-65px)] overflow-y-auto">
          <div className="site-container py-5 sm:py-6">
          <div className="flex flex-col">
            {MOBILE_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="py-3 text-base font-semibold text-gray-900 transition-colors hover:text-blue-500 dark:text-gray-100 dark:hover:text-blue-400"
              >
                {item.label}
              </Link>
            ))}

          </div>

          {isClient && session && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 dark:bg-white/[0.06]">
              <Link
                href="/myinfo"
                onClick={onClose}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <img
                  src={session.user.user_metadata?.avatar_url || "/default.png"}
                  alt="프로필"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-950 dark:text-white">
                    {session.user.user_metadata?.name || "사용자"}
                  </p>
                  <p className="truncate text-xs text-metricsText">
                    {session.user.email}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                로그아웃
              </button>
            </div>
          )}

          {isClient && !session && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLoginClick?.();
                }}
                className="h-12 w-full rounded-xl bg-gray-950 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
              >
                로그인
              </button>
            </div>
          )}
          </div>
        </div>
      </nav>
    </>
  );
}
