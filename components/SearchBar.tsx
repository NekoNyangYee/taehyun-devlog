"use client";

import {
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSessionStore } from "@components/store/sessionStore";
import Link from "next/link";
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
  commentsQueryKey,
  fetchCommentsQueryFn,
} from "@components/queries/commentQueries";
import { PostStateWithoutContents } from "@components/types/post";
import { CommentRow } from "@components/types/comment";

export default function SearchBar({ isLight = false }: { isLight?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showAllBookmarks, setShowAllBookmarks] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
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

  const { data: comments = [] } = useQuery({
    queryKey: commentsQueryKey(postIds),
    queryFn: () => fetchCommentsQueryFn(postIds),
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

  const filteredComments = normalizedKeyword
    ? comments.filter((comment) =>
        comment.content.toLowerCase().includes(normalizedKeyword)
      )
    : [];

  const filteredBookmarkedPosts = normalizedKeyword
    ? bookmarkedPosts.filter((post) =>
        post.title.toLowerCase().includes(normalizedKeyword)
      )
    : [];

  const getCategory = (post: PostStateWithoutContents) =>
    categories.find((cat) => cat.id === post.category_id);

  const getCategoryName = (post: PostStateWithoutContents) =>
    getCategory(post)?.name ?? "";

  const getCommentPost = (comment: CommentRow) =>
    posts.find((post) => post.id === comment.post_id);

  const highlightKeyword = (text: string) => {
    if (!keyword.trim()) return text;

    const regex = new RegExp(
      `(${keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );

    return text.split(regex).map((part, index) =>
      part.toLowerCase() === normalizedKeyword ? (
        <mark
          key={`${part}-${index}`}
          className="rounded bg-amber-100 px-0.5 text-amber-900 dark:bg-amber-300/20 dark:text-amber-100"
        >
          {part}
        </mark>
      ) : (
        <span key={`${part}-${index}`}>{part}</span>
      )
    );
  };

  const resetExpandedState = () => {
    setShowAllPosts(false);
    setShowAllBookmarks(false);
    setShowAllComments(false);
  };

  const handleOpen = () => {
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetExpandedState();
    setTimeout(() => setKeyword(""), 300);
  };

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
  }, [isOpen]);

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
    variant: "post" | "bookmark" = "post"
  ) => {
    const category = getCategory(post);

    return (
      <Link
        key={`${variant}-${post.id}`}
        href={`/posts/${getCategoryName(post)}/${post.id}`}
        className="group flex min-h-20 items-center gap-4 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
        onClick={handleClose}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <span className="truncate">{category?.name || "미분류"}</span>
            {variant === "bookmark" && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-white/10 dark:text-gray-300">
                북마크
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-gray-950 dark:text-gray-50">
            {highlightKeyword(post.title)}
          </p>
        </div>
        {category?.thumbnail && (
          <img
            src={category.thumbnail}
            alt=""
            className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-black/5 dark:ring-white/10"
          />
        )}
      </Link>
    );
  };

  const renderCommentItem = (comment: CommentRow) => {
    const post = getCommentPost(comment);
    if (!post) return null;

    return (
      <Link
        key={`comment-${comment.id}`}
        href={`/posts/${getCategoryName(post)}/${post.id}`}
        className="group flex min-h-20 items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
        onClick={handleClose}
      >
        <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300">
          <MessageSquare size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
            {post.title}
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-950 dark:text-gray-50">
            {highlightKeyword(comment.content)}
          </p>
        </div>
      </Link>
    );
  };

  const renderSection = <T,>({
    title,
    count,
    items,
    showAll,
    onToggle,
    renderItem,
  }: {
    title: string;
    count: number;
    items: T[];
    showAll: boolean;
    onToggle: () => void;
    renderItem: (item: T) => React.ReactNode;
  }) => {
    if (count === 0) return null;

    return (
      <section className="border-t border-gray-100 px-3 py-4 first:border-t-0 dark:border-white/10">
        <div className="mb-2 flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-gray-950 dark:text-gray-50">
            {title}
          </h3>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {count}
          </span>
        </div>
        <div className="space-y-1">{items.map(renderItem)}</div>
        {count > 5 && (
          <div className="mt-3 px-1">
            <button
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:bg-white/10"
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
    filteredPosts.length > 0 ||
    filteredComments.length > 0 ||
    filteredBookmarkedPosts.length > 0;

  const popup = (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      <div className="absolute left-1/2 top-[8vh] w-full max-w-2xl -translate-x-1/2 px-4">
        <div
          className={`flex max-h-[min(80vh,44rem)] flex-col overflow-hidden rounded-lg border border-white/70 bg-white shadow-2xl shadow-black/20 transition-all duration-300 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/50 ${
            isOpen
              ? "translate-y-3 scale-100 opacity-100"
              : "translate-y-0 scale-95 opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="검색"
        >
          <div className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 px-4 dark:border-white/10">
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
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-50"
              onClick={handleClose}
              aria-label="검색 닫기"
            >
              <X size={18} />
            </button>
          </div>

          <div
            id="search-results-container"
            className="max-h-[calc(min(80vh,44rem)-4rem)] overflow-y-auto scrollbar-hide bg-white dark:bg-zinc-950"
          >
            {!hasKeyword && (
              <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300">
                  <Search size={22} />
                </div>
                <p className="mt-4 text-sm font-semibold text-gray-950 dark:text-gray-50">
                  게시물, 북마크, 댓글을 검색할 수 있어요.
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  제목이나 댓글 내용을 입력해 주세요.
                </p>
              </div>
            )}

            {hasKeyword && !hasResults && (
              <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300">
                  <Search size={22} />
                </div>
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
                title: "게시물",
                count: filteredPosts.length,
                items: filteredPosts.slice(
                  0,
                  showAllPosts ? filteredPosts.length : 5
                ),
                showAll: showAllPosts,
                onToggle: () => setShowAllPosts((current) => !current),
                renderItem: (post) => renderPostItem(post),
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

            {hasKeyword &&
              hasResults &&
              renderSection({
                title: "댓글",
                count: filteredComments.length,
                items: filteredComments.slice(
                  0,
                  showAllComments ? filteredComments.length : 5
                ),
                showAll: showAllComments,
                onToggle: () => setShowAllComments((current) => !current),
                renderItem: renderCommentItem,
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
              : "text-gray-700 hover:bg-white/40 hover:backdrop-blur-md dark:text-gray-200 dark:hover:bg-white/10 dark:hover:backdrop-blur-md"
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
