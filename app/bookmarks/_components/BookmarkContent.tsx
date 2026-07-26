"use client";

import { BookmarkCheckIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useBookmarkData } from "../_hooks/useBookmarkData";
import { useBookmarkToggle } from "@components/app/posts/_hooks/useBookmarkToggle";
import { lowerURL } from "@components/lib/util/lowerURL";
import { useLoginModalStore } from "@components/store/loginModalStore";
import { useIsClient } from "@components/lib/hooks/useIsClient";
import { LoginRequiredState } from "@components/components/LoginRequiredState";
import { CategoryFilterPanel } from "@components/components/CategoryFilterPanel";
import { PostListItem } from "@components/components/PostListItem";
import { SortSelect } from "@components/app/posts/_components/SortSelect";
import { PageTitlePanel } from "@components/components/PageTitlePanel";

export default function BookmarkContent() {
  const isClient = useIsClient();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("new-sort");

  const {
    bookmarkedPosts,
    categories,
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
    <div className="my-6 flex w-full flex-1 flex-col border border-gray-200 bg-white dark:border-white/10 dark:bg-zinc-950 md:my-8">
      <PageTitlePanel
        title="Bookmarks"
      />

      <div className="flex min-h-12 items-center justify-between border-b border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-zinc-900">
        <CategoryFilterPanel
          options={categoryOptions.map((category) => ({
            value: String(category.id),
            label: category.name,
            count: category.count,
          }))}
          selectedValue={selectedCategory}
          totalCount={bookmarkedPosts.length}
          onChange={setSelectedCategory}
        />
        <SortSelect value={sortOrder} onChange={setSortOrder} />
      </div>

      <section>
        {filteredAndSortedPosts.length > 0 ? (
          <div>
            {filteredAndSortedPosts.map((post) => {
              const category = categories.find(
                (cat) => cat.id === post.category_id,
              );
              const categorySlug = lowerURL(category?.name || "unknown");
              const thumbnailUrl = category?.thumbnail;
              const isBookmarked = bookmarks.includes(post.id);
              return (
                <PostListItem
                  key={post.id}
                  post={post}
                  categoryName={category?.name || "미분류"}
                  categorySlug={categorySlug}
                  thumbnailUrl={thumbnailUrl}
                  isBookmarked={isBookmarked}
                  showBookmark
                  onBookmarkToggle={(event) =>
                    toggleBookmark(post.id, isBookmarked, event)
                  }
                />
              );
            })}
          </div>
        ) : (
          <div className="flex h-72 w-full items-center justify-center">
            <p className="text-center text-gray-500 dark:text-gray-400">
              선택한 카테고리에 저장된 게시물이 없습니다.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
