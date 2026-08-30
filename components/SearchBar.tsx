"use client";

import { Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useSessionStore } from "@components/store/sessionStore";
import { useQuery } from "@tanstack/react-query";
import {
  postsQueryKey,
  fetchPostsQueryFn,
  bookmarkQueryKey,
  fetchBookmarksQueryFn,
} from "@components/queries/postQueries";
import {
  categoriesQueryKey,
  fetchCategoriesQueryFn,
} from "@components/queries/categoryQueries";
import {
  commentCountsQueryKey,
  fetchCommentCountsQueryFn,
} from "@components/queries/commentQueries";
import { PostStateWithoutContents } from "@components/types/post";
import { lowerURL } from "@components/lib/util/lowerURL";
import { PostListItem } from "./PostListItem";

export default function SearchBar({ isLight = false }: { isLight?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showAllBookmarks, setShowAllBookmarks] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const { session } = useSessionStore();
  const userId = session?.user?.id;
  const normalizedKeyword = keyword.trim().toLowerCase();

  const { data: posts = [] } = useQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPostsQueryFn,
    enabled: isVisible,
  });

  const { data: categories = [] } = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategoriesQueryFn,
    enabled: isVisible,
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: bookmarkQueryKey(userId),
    queryFn: () => fetchBookmarksQueryFn(userId),
    enabled: isVisible && Boolean(userId),
  });

  const postIds = useMemo(() => posts.map((post) => post.id), [posts]);

  const { data: commentCounts = [] } = useQuery({
    queryKey: commentCountsQueryKey(postIds),
    queryFn: () => fetchCommentCountsQueryFn(postIds),
    enabled: isVisible && postIds.length > 0,
  });

  const bookmarkedPosts = useMemo(
    () => posts.filter((post) => bookmarks.includes(post.id)),
    [bookmarks, posts]
  );

  const filteredPosts = normalizedKeyword
    ? posts.filter((post) =>
        post.title.toLowerCase().includes(normalizedKeyword)
      )
    : [];

  const filteredBookmarkedPosts = normalizedKeyword
    ? bookmarkedPosts.filter((post) =>
        post.title.toLowerCase().includes(normalizedKeyword)
      )
    : [];

  const getCategory = (post: PostStateWithoutContents) =>
    categories.find((cat) => cat.id === post.category_id);

  const resetExpandedState = useCallback(() => {
    setShowAllPosts(false);
    setShowAllBookmarks(false);
  }, []);

  const handleOpen = () => {
    setIsVisible(true);
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    resetExpandedState();
    setTimeout(() => setKeyword(""), 300);
  }, [resetExpandedState]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, isOpen]);

  useEffect(() => {
    if (!isVisible) return;

    const raf = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(raf);
  }, [isVisible]);

  useEffect(() => {
    if (isOpen || !isVisible) return;

    closeTimeout.current = setTimeout(() => setIsVisible(false), 300);
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, [isOpen, isVisible]);

  const renderPostItem = (
    post: PostStateWithoutContents,
    variant: "post" | "bookmark" = "post",
  ) => {
    const category = getCategory(post);
    const commentCount = commentCounts.filter(
      (comment) => comment.post_id === post.id,
    ).length;

    return (
      <div
        key={`${variant}-${post.id}`}
        onClick={handleClose}
      >
        <PostListItem
          post={post}
          categoryName={category?.name || "미분류"}
          categorySlug={lowerURL(category?.name || "")}
          thumbnailUrl={category?.thumbnail}
          commentCount={commentCount}
          variant="compact"
        />
      </div>
    );
  };

  const renderSection = <T,>({
    title,
    count,
    items,
    showAll,
    onToggle,
    renderItem,
    hideHeader = false,
  }: {
    title: string;
    count: number;
    items: T[];
    showAll: boolean;
    onToggle: () => void;
    renderItem: (item: T) => React.ReactNode;
    hideHeader?: boolean;
  }) => {
    if (count === 0) return null;

    return (
      <section className="mb-8 last:mb-0">
        {!hideHeader && (
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-950 dark:text-white">
              {title}
            </h3>
            <span className="text-sm font-medium text-metricsText">{count}</span>
          </div>
        )}
        <div className="flex flex-col gap-6">{items.map(renderItem)}</div>
        {count > 5 && (
          <div className="mt-8">
            <button
              className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-200 dark:bg-white/10 dark:text-gray-100 dark:hover:bg-white/15"
              onClick={onToggle}
            >
              {showAll ? "접기" : `더보기 (${count - 5}개)`}
            </button>
          </div>
        )}
      </section>
    );
  };

  const hasKeyword = keyword.trim().length > 0;
  const hasResults =
    filteredPosts.length > 0 || filteredBookmarkedPosts.length > 0;

  const popup = (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      <div className="absolute bottom-3 left-1/2 top-20 w-full max-w-4xl -translate-x-1/2 px-3 sm:bottom-5 sm:top-24 sm:px-5">
        <div
          className={`flex h-full max-h-[42rem] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-black/20 ring-1 ring-black/5 transition-all duration-300 dark:bg-zinc-950 dark:shadow-black/50 dark:ring-white/10 ${
            isOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-2 opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="검색"
        >
          <div className="flex shrink-0 items-center justify-between px-6 pb-2 pt-6 sm:px-8 sm:pt-7">
            <span className="text-xl font-bold tracking-[-0.02em] text-gray-950 dark:text-white">
              Search
            </span>
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-50"
              onClick={handleClose}
              aria-label="검색 닫기"
            >
              <X size={18} />
            </button>
          </div>
          <div className="mx-6 mb-5 mt-3 flex h-16 shrink-0 items-center gap-3 rounded-2xl bg-gray-100 px-5 dark:bg-white/[0.07] sm:mx-8">
            <Search size={20} className="shrink-0 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              className="h-full min-w-0 flex-1 bg-transparent text-base font-medium text-gray-950 outline-none placeholder:text-gray-400 dark:text-gray-50 dark:placeholder:text-gray-500"
              autoFocus
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                if (event.target.value.length === 0) resetExpandedState();
              }}
            />
          </div>

          <div
            id="search-results-container"
            className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide sm:px-8 sm:pb-8"
          >
            {!hasKeyword && (
              <div className="flex h-full min-h-0 flex-col items-center justify-center px-6 py-12 text-center">
                <Image
                  src="/search.png"
                  alt="아티클 검색"
                  width={240}
                  height={160}
                  quality={75}
                  className="h-auto w-48 sm:w-56"
                  sizes="(max-width: 640px) 192px, 224px"
                  priority
                />
                <p className="text-sm font-semibold text-gray-950 dark:text-gray-50">
                  궁금한 아티클을 찾아보세요.
                </p>
                <p className="mt-1 text-sm text-center text-gray-500 dark:text-gray-400">
                  제목을 입력하면 관련 아티클과 북마크를 함께 확인할 수 있어요.
                </p>
              </div>
            )}

            {hasKeyword && !hasResults && (
              <div className="flex h-full min-h-0 flex-col items-center justify-center px-6 py-12 text-center">
                <Image
                  src="/search.png"
                  alt="검색 결과 없음"
                  width={240}
                  height={160}
                  quality={75}
                  className="h-auto w-48 sm:w-56"
                  sizes="(max-width: 640px) 192px, 224px"
                />
                <p className="mt-4 text-sm font-semibold text-gray-950 dark:text-gray-50">
                  검색 결과가 없습니다.
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  다른 검색어로 다시 시도해 주세요.
                </p>
              </div>
            )}

            {hasKeyword &&
              hasResults &&
              renderSection({
                title: "아티클",
                count: filteredPosts.length,
                items: filteredPosts.slice(
                  0,
                  showAllPosts ? filteredPosts.length : 5
                ),
                showAll: showAllPosts,
                onToggle: () => setShowAllPosts((current) => !current),
                renderItem: (post) => renderPostItem(post),
                hideHeader: true,
              })}

            {hasKeyword &&
              hasResults &&
              session &&
              renderSection({
                title: "나의 북마크",
                count: filteredBookmarkedPosts.length,
                items: filteredBookmarkedPosts.slice(
                  0,
                  showAllBookmarks ? filteredBookmarkedPosts.length : 5
                ),
                showAll: showAllBookmarks,
                onToggle: () => setShowAllBookmarks((current) => !current),
                renderItem: (post) => renderPostItem(post, "bookmark"),
              })}

          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative">
        <button
          onClick={handleOpen}
          aria-label="검색"
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-300 ${
            isLight
              ? "text-white hover:bg-white/15"
              : "text-[rgba(3,18,40,0.7)] hover:bg-white/40 hover:backdrop-blur-md dark:text-gray-200 dark:hover:bg-white/10 dark:hover:backdrop-blur-md"
          }`}
        >
          <Search size={20} className="transition-colors duration-300" />
        </button>
      </div>
      {isVisible &&
        typeof window !== "undefined" &&
        createPortal(popup, document.body)}
    </>
  );
}
