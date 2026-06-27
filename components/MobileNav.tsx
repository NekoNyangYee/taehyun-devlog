"use client";

import {
  Grid2X2Icon,
  HomeIcon,
  LogOutIcon,
  LogInIcon,
  HandIcon,
  StarIcon,
  UserRoundCog,
  PanelRightClose,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { supabase } from "@components/lib/supabaseClient";
import { useSessionStore } from "@components/store/sessionStore";
import { useIsClient } from "@components/lib/hooks/useIsClient";
import { useAnimatedMount } from "@components/lib/hooks/useAnimatedMount";

export default function MobileNavBar({
  isOpen,
  onClose,
  onLoginClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick?: () => void;
}) {
  const currentPath: string = usePathname();
  const router = useRouter();
  const { session, addSession } = useSessionStore();
  const isClient = useIsClient();
  const { isVisible, isAnimating } = useAnimatedMount(isOpen, 300);

  // 모달 열림 시 body 스크롤 잠금
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleLogout = async () => {
    alert("로그아웃 되었습니다.");
    await supabase.auth.signOut();
    addSession(null);
    router.push("/");
    handleClose();
  };

  const isActive = (path: string) =>
    currentPath === path ||
    (path === "/posts" && currentPath.startsWith("/posts")) ||
    (path === "/myinfo" && currentPath.startsWith("/users/"))
      ? "bg-black text-white font-semibold dark:bg-zinc-800 dark:text-white"
      : "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10";

  if (!isVisible) return null;

  return (
    <>
      {isVisible && (
        <div
          className={`fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-md z-30 transition-opacity duration-300 ${
            isAnimating ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleClose}
        ></div>
      )}
      <aside
        className={`fixed top-0 right-0 pt-16 w-[70%] max-w-[300px] h-full bg-white dark:bg-zinc-950 flex flex-col justify-between items-center gap-2 z-40 shadow-lg transition-transform duration-300 ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-0 left-0 m-4 bg-transparent shadow-none rounded-full text-gray-700 dark:text-gray-200"
        >
          <PanelRightClose size={24} />
        </button>
        <div className="p-container w-full flex flex-col overflow-auto scrollbar-hide">
          <Link
            href={"/"}
            className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
              "/",
            )}`}
            onClick={handleClose}
          >
            <HomeIcon size={18} />
            <span className="truncate">홈</span>
          </Link>
          <Link
            href="/posts"
            className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
              "/posts",
            )}`}
            onClick={handleClose}
          >
            <Grid2X2Icon size={18} />
            <span className="truncate">게시물</span>
          </Link>
          <Link
            href={"/bookmarks"}
            className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
              "/bookmarks",
            )}`}
            onClick={handleClose}
          >
            <StarIcon size={18} />
            <span className="truncate">북마크</span>
          </Link>
          <Link
            href={"/myinfo"}
            className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
              "/myinfo",
            )}`}
            onClick={handleClose}
          >
            <UserRoundCog size={18} />
            <span className="truncate">내 정보</span>
          </Link>
          <Link
            href={"/profile"}
            className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
              "/profile",
            )}`}
            onClick={handleClose}
          >
            <HandIcon size={18} />
            <span className="truncate">안녕하세요!</span>
          </Link>
        </div>
        <div className="flex flex-col gap-2 w-full p-container border-t border-gray-200 dark:border-white/10 items-center">
          {isClient && session && (
            <div className="flex gap-2 mb-4 w-full">
              <img
                src={session?.user?.user_metadata?.avatar_url || "/default.png"}
                alt="Profile Picture"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex flex-col justify-between">
                <span className="break-all text-[14px] font-bold">
                  {session?.user?.user_metadata?.name}
                </span>
                <span className="text-[12px] font-semibold text-metricsText">
                  {session?.user?.email}
                </span>
              </div>
            </div>
          )}
          {isClient && session ? (
            <>
              <Button
                onClick={handleLogout}
                className="w-full h-10 p-button border border-logoutColor bg-logoutButton text-logoutText flex items-center gap-2"
              >
                <LogOutIcon size={18} />
                로그아웃
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                handleClose();
                onLoginClick?.();
              }}
              className="w-full h-10 p-button rounded-button bg-action text-action-foreground transition-colors hover:bg-action-hover flex items-center justify-center gap-2"
            >
              <LogInIcon size={18} />
              로그인
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
