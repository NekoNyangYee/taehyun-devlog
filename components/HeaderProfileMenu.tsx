"use client";

import type { Session } from "@supabase/supabase-js";
import { BookmarkIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface HeaderProfileMenuProps {
  session: Session;
  onLogout: () => Promise<void>;
}

export default function HeaderProfileMenu({
  session,
  onLogout,
}: HeaderProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const metadata = session.user.user_metadata;
  const avatarUrl = metadata.avatar_url || metadata.picture || "/default.png";
  const displayName =
    metadata.full_name || metadata.name || session.user.email || "사용자";

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="프로필 메뉴"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex h-9 items-center rounded-lg p-0.5 text-gray-600 transition-colors hover:bg-white/50 dark:text-gray-300 dark:hover:bg-white/10"
      >
        <img
          src={avatarUrl}
          alt=""
          className="h-8 w-8 rounded-md object-cover ring-1 ring-black/10 dark:ring-white/15"
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-11 w-60 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl shadow-black/10 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/40"
        >
          <div className="border-b border-gray-200 px-4 py-3 dark:border-white/10">
            <p className="truncate text-sm font-semibold text-gray-950 dark:text-gray-50">
              {displayName}
            </p>
            <p className="mt-0.5 truncate text-xs text-metricsText">
              {session.user.email}
            </p>
          </div>

          <div className="p-1.5">
            <Link
              href="/bookmarks"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex h-10 items-center gap-2.5 rounded-md px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <BookmarkIcon size={17} />
              북마크
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                setIsOpen(false);
                await onLogout();
              }}
              className="flex h-10 w-full items-center gap-2.5 rounded-md px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <LogOutIcon size={17} />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
