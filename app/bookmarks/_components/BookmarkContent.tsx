"use client";

import { BookmarkCheckIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { BookmarkCard } from "./BookmarkCard";
import { useBookmarkData } from "../_hooks/useBookmarkData";
import { useBookmarkToggle } from "@components/app/posts/_hooks/useBookmarkToggle";
import { lowerURL } from "@components/lib/util/lowerURL";
import { useLoginModalStore } from "@components/store/loginModalStore";
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
import { LoginRequiredState } from "@components/components/LoginRequiredState";

export default function BookmarkContent() {
  const isClient = useIsClient();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("new-sort");

  const {
    bookmarkedPosts,
    categories,
    comments,
    bookmarks,
    userId,
    session,
    isLoading,
  } = useBookmarkData();

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

  if (!session) {
    return (
      <LoginRequiredState
        description="북마크 페이지는 로그인 후 이용할 수 있습니다."
        actionLabel="로그인하러 가기"
        onLoginClick={openLogin}
      />
    );
  }

  if (bookmarkedPosts.length === 0) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
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
      </section>
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-4 py-container">
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

      <div className="w-full">
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
      </div>
    </div>
  );
}
