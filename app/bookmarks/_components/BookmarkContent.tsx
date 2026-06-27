"use client";

import {
  BookmarkCheckIcon,
  LockIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { BookmarkCard } from "./BookmarkCard";
import { useBookmarkData } from "../_hooks/useBookmarkData";
import { useBookmarkToggle } from "@components/app/posts/_hooks/useBookmarkToggle";
import { lowerURL } from "@components/lib/util/lowerURL";
import { useLoginModalStore } from "@components/store/loginModalStore";
import { AnimatePresence, motion } from "framer-motion";
import { contentReveal } from "@components/components/motion/contentReveal";
import { useIsClient } from "@components/lib/hooks/useIsClient";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@components/components/ui/select";
import { cn } from "@components/lib/utils";

/**
 * 북마크 페이지 메인 컨텐츠 (Container Component)
 * - Hook으로 데이터와 로직 관리
 * - Presentational 컴포넌트 조합
 */
export default function BookmarkContent() {
  const isClient = useIsClient();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("new-sort");

  // 데이터 관리
  const {
    bookmarkedPosts,
    categories,
    comments,
    bookmarks,
    userId,
    session,
    isLoading,
  } = useBookmarkData();

  // 북마크 토글
  const { toggleBookmark } = useBookmarkToggle(userId);

  const openLogin = useLoginModalStore((s) => s.open);
  const categoryOptions = useMemo(
    () =>
      categories
        .map((category) => ({
          ...category,
          count: bookmarkedPosts.filter(
            (post) => post.category_id === category.id,
          ).length,
        }))
        .filter((category) => category.count > 0),
    [bookmarkedPosts, categories],
  );

  const filteredAndSortedPosts = useMemo(() => {
    const filtered =
      selectedCategory === "all"
        ? bookmarkedPosts
        : bookmarkedPosts.filter(
            (post) => String(post.category_id) === selectedCategory,
          );

    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case "old-sort":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "max-view-sort":
          return (b.view_count ?? 0) - (a.view_count ?? 0);
        case "min-view-sort":
          return (a.view_count ?? 0) - (b.view_count ?? 0);
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });
  }, [bookmarkedPosts, selectedCategory, sortOrder]);
  const gridKey = `${selectedCategory}::${sortOrder}`;

  // 데이터 패칭 중에는 빈 상태 대신 로딩 표시
  if (!isClient || isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-container border border-gray-200 bg-white px-5 py-4 text-sm text-metricsText shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin dark:border-zinc-700 dark:border-t-gray-100" />
          북마크를 불러오는 중입니다.
        </div>
      </div>
    );
  }

  // 로그인 안 되었을 때
  if (!session) {
    return (
      <motion.section
        {...contentReveal}
        className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-container bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
          <LockIcon size={28} />
        </div>
        <h1 className="text-2xl font-semibold text-gray-950 dark:text-gray-50">
          로그인이 필요합니다.
        </h1>
        <p className="text-sm leading-6 text-metricsText">
          북마크 페이지는 로그인 후 이용할 수 있어요.
        </p>
        <button
          onClick={openLogin}
          className="p-button rounded-button bg-action px-6 py-3 text-action-foreground transition-colors hover:bg-action-hover"
        >
          로그인 하러 가기
        </button>
      </motion.section>
    );
  }

  // 북마크된 게시물이 없을 때
  if (bookmarkedPosts.length === 0) {
    return (
      <motion.section
        {...contentReveal}
        className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-container bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
          <BookmarkCheckIcon size={30} />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-gray-950 dark:text-gray-50">
          아직 저장한 게시물이 없습니다.
        </h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-metricsText">
          다시 읽고 싶은 글의 북마크 버튼을 눌러두면 이곳에서 빠르게 모아볼
          수 있습니다.
        </p>
      </motion.section>
    );
  }

  return (
    <motion.div
      {...contentReveal}
      className="p-container w-full flex flex-col flex-1 gap-4"
    >
      <h2 className="text-2xl font-bold">북마크</h2>

      <div className="flex justify-between items-center gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent
            className={cn("w-auto bg-white dark:border-white/10 dark:bg-zinc-900")}
          >
            <SelectGroup>
              <SelectLabel>카테고리</SelectLabel>
              <SelectItem value="all">전체 ({bookmarkedPosts.length})</SelectItem>
              {categoryOptions.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name} ({category.count})
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent
            className={cn("w-auto bg-white dark:border-white/10 dark:bg-zinc-900")}
          >
            <SelectItem value="new-sort">최신순</SelectItem>
            <SelectItem value="old-sort">오래된순</SelectItem>
            <SelectItem value="max-view-sort">조회수 높은순</SelectItem>
            <SelectItem value="min-view-sort">조회수 낮은순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={gridKey}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full"
        >
          {filteredAndSortedPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
              {filteredAndSortedPosts.map((post) => {
                const category = categories.find(
                  (cat) => cat.id === post.category_id,
                );
                const categorySlug = lowerURL(category?.name || "unknown");
                const thumbnailUrl = category?.thumbnail;
                const isBookmarked = bookmarks.includes(post.id);

                const commentCount = comments.filter(
                  (comment) => comment.post_id === post.id,
                ).length;

                return (
                  <BookmarkCard
                    key={post.id}
                    post={post}
                    categoryName={category?.name || "미분류"}
                    categorySlug={categorySlug}
                    thumbnailUrl={thumbnailUrl}
                    commentCount={commentCount}
                    isBookmarked={isBookmarked}
                    onBookmarkToggle={(e) => {
                      e.preventDefault();
                      toggleBookmark(post.id, isBookmarked, e);
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="w-full h-[386px] flex items-center justify-center border border-gray-200 dark:border-white/10 rounded-container">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                선택한 카테고리에 저장된 게시물이 없습니다.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
