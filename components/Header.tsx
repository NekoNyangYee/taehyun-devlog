"use client";

import { supabase } from "@components/lib/supabaseClient";
import { useSessionStore } from "@components/store/sessionStore";
import { useLoginModalStore } from "@components/store/loginModalStore";
import Link from "next/link";
import { useEffect, useState } from "react";
import LogoIcon from "./icons/LogoIcon";
import {
  Grid2X2Icon,
  HandIcon,
  LayoutDashboardIcon,
  LogInIcon,
  PanelLeftOpen,
  StarIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import MobileNavBar from "./MobileNav";
import ScrollProgressBar from "./ScrollProgressBar";
import SearchBar from "./SearchBar";
import LoginModal from "./LoginModal";
import ThemeToggle from "./ThemeToggle";
import HeaderProfileMenu from "./HeaderProfileMenu";
import { usePathname, useRouter } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "메인", icon: LayoutDashboardIcon },
  { href: "/posts", label: "게시물", icon: Grid2X2Icon },
  { href: "/bookmarks", label: "북마크", icon: StarIcon },
  { href: "/profile", label: "안녕하세요!", icon: HandIcon },
];

export default function Header() {
  const currentPath: string = usePathname();
  const router = useRouter();
  const { session, addSession } = useSessionStore();
  const [isMobileNavVisible, setMobileNavVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const openLogin = useLoginModalStore((s) => s.open);

  const toggleMobileNav = () => setMobileNavVisible((prev) => !prev);

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) addSession(data.session);
      else addSession(null);
      if (error) console.error(error);
      setSessionHydrated(true);
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileNavVisible(false);
    };

    const handleScroll = () => {
      const y =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setIsScrolled(y > 200);
    };

    fetchSession();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
    };
  }, [addSession]);

  const handleLogout = async () => {
    alert("로그아웃 되었습니다.");
    await supabase.auth.signOut();
    addSession(null);
    router.push("/");
  };

  const isActive = (path: string) =>
    currentPath === path ||
    (path === "/posts" && currentPath.startsWith("/posts")) ||
    (path === "/myinfo" && currentPath.startsWith("/users/"));

  if (currentPath === "/login") return null;

  return (
    <>
      <header
        className={`w-full fixed top-0 z-30 transition-colors duration-300 ${
          isScrolled
            ? "bg-white dark:bg-zinc-950 shadow-sm dark:shadow-black/40"
            : "bg-gradient-to-b from-white/70 via-white/30 to-transparent dark:from-zinc-950/70 dark:via-zinc-950/30 dark:to-transparent pointer-events-none"
        }`}
      >
        <div
          className={`site-container flex h-[65px] items-center justify-between gap-4 ${
            isScrolled ? "" : "pointer-events-auto"
          }`}
        >
          <div className="flex items-center gap-4 min-w-0">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity dark:[&_svg_path]:fill-white dark:[&_svg_rect]:fill-white dark:[&_svg_path]:stroke-white"
            >
              <LogoIcon />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      active
                        ? "bg-zinc-800 text-white dark:bg-zinc-700 dark:text-white"
                        : "text-gray-700 hover:bg-white/40 hover:backdrop-blur-md hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:backdrop-blur-md dark:hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-1 shrink-0">
            <SearchBar />
            <ThemeToggle />

            {/* Session button (icon only) — 세션 hydration 완료 전까지는 자리만 차지하여 깜빡임 방지 */}
            <div className="hidden lg:block min-w-9 h-9">
              {sessionHydrated &&
                (session ? (
                  <HeaderProfileMenu
                    session={session}
                    onLogout={handleLogout}
                  />
                ) : (
                  <button
                    onClick={openLogin}
                    aria-label="로그인"
                    title="로그인"
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-800 text-white hover:bg-zinc-900 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600 transition-colors"
                  >
                    <LogInIcon size={18} />
                  </button>
                ))}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={toggleMobileNav}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-700 hover:bg-white/40 hover:backdrop-blur-md dark:text-gray-300 dark:hover:bg-white/10 dark:hover:backdrop-blur-md transition-colors"
              aria-label="메뉴 열기"
            >
              <PanelLeftOpen size={20} />
            </button>
          </div>
        </div>
      </header>
      <MobileNavBar
        isOpen={isMobileNavVisible}
        onClose={toggleMobileNav}
        onLoginClick={openLogin}
      />
      <LoginModal />
      <ScrollProgressBar />
    </>
  );
}
