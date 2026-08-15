"use client";

import { supabase } from "@components/lib/supabaseClient";
import { useSessionStore } from "@components/store/sessionStore";
import { useLoginModalStore } from "@components/store/loginModalStore";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import LogoIcon from "./icons/LogoIcon";
import MobileNavBar from "./MobileNav";
import ScrollProgressBar from "./ScrollProgressBar";
import SearchBar from "./SearchBar";
import LoginModal from "./LoginModal";
import ThemeToggle from "./ThemeToggle";
import HeaderProfileMenu from "./HeaderProfileMenu";
import { usePathname, useRouter } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/articles", label: "Articles" },
  { href: "/bookmarks", label: "Bookmarks" },
  { href: "/profile", label: "About" },
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
  const closeMobileNav = useCallback(() => setMobileNavVisible(false), []);

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

  if (currentPath === "/login") return null;

  return (
    <>
      <header
        className={`w-full fixed top-0 z-30 transition-colors duration-300 ${
          isScrolled || isMobileNavVisible
            ? "bg-white dark:bg-zinc-950 shadow-sm dark:shadow-black/40"
            : "bg-gradient-to-b from-white/70 via-white/30 to-transparent dark:from-zinc-950/70 dark:via-zinc-950/30 dark:to-transparent pointer-events-none"
        }`}
      >
        <div
          className={`site-container flex h-[65px] items-center justify-between gap-4 ${
            isScrolled || isMobileNavVisible ? "" : "pointer-events-auto"
          }`}
        >
          <div className="flex items-center min-w-0">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity dark:[&_svg_path]:fill-white dark:[&_svg_rect]:fill-white dark:[&_svg_path]:stroke-white"
            >
              <LogoIcon />
            </Link>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center rounded-lg px-3 py-2 text-[15px] font-semibold leading-[1.5] text-[rgba(3,18,40,0.7)] transition-colors duration-200 hover:bg-white/40 hover:text-gray-950 hover:backdrop-blur-md dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white dark:hover:backdrop-blur-md"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <ThemeToggle />
            <SearchBar />

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
                    className="flex h-9 items-center justify-center rounded-lg bg-zinc-800 px-3 text-[15px] font-semibold leading-[1.5] text-white transition-colors hover:bg-zinc-900 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
                  >
                    로그인
                  </button>
                ))}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={toggleMobileNav}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[rgba(3,18,40,0.7)] transition-colors hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white lg:hidden"
              aria-label={isMobileNavVisible ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={isMobileNavVisible}
            >
              {isMobileNavVisible ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
        <MobileNavBar
          isOpen={isMobileNavVisible}
          onClose={closeMobileNav}
          onLoginClick={openLogin}
        />
      </header>
      <LoginModal />
      <ScrollProgressBar />
    </>
  );
}
