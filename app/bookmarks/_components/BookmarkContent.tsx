"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useBookmarkData } from "../_hooks/useBookmarkData";
import { useBookmarkToggle } from "@components/app/articles/_hooks/useBookmarkToggle";
import { lowerURL } from "@components/lib/util/lowerURL";
import { useLoginModalStore } from "@components/store/loginModalStore";
import { useIsClient } from "@components/lib/hooks/useIsClient";
import { LoginRequiredState } from "@components/components/LoginRequiredState";
import { CategoryFilterPanel } from "@components/components/CategoryFilterPanel";
import { PostListItem } from "@components/components/PostListItem";
import PageLoading from "@components/components/loading/PageLoading";

export default function BookmarkContent() {
  const isClient = useIsClient();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
    const selectedIds = new Set(selectedCategories.map(Number));
    const filtered = selectedIds.size
      ? bookmarkedPosts.filter((post) => selectedIds.has(post.category_id))
      : bookmarkedPosts;

    return [...filtered].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [bookmarkedPosts, selectedCategories]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  };

  if (!isClient || isLoading) {
    return <PageLoading />;
  }

  if (!session) {
    return (
      <LoginRequiredState
        description="로그인하면 마음에 드는 아티클을 저장하고 언제든 다시 볼 수 있어요."
        actionLabel="로그인하기"
        onLoginClick={openLogin}
      />
    );
  }

  if (bookmarkedPosts.length === 0) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
        <Image
          src="/no-bookmark.png"
          alt="저장한 아티클이 없는 상태"
          width={192}
          height={192}
          quality={75}
          className="h-auto w-40 sm:w-48"
          sizes="(max-width: 640px) 160px, 192px"
        />
        <h1 className="mt-5 text-2xl font-semibold text-gray-950 dark:text-gray-50">
          아직 저장해 둔 아티클이 없어요
        </h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-metricsText">
          마음에 드는 아티클을 북마크해 두면 언제든 편하게 다시 읽어볼 수
          있어요.
        </p>
      </section>
    );
  }

  return (
    <div className="my-6 flex w-full flex-1 flex-col md:my-8">
      <header className="mb-8 pt-8 sm:pt-12">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-4xl font-bold tracking-[-0.03em] text-gray-950 dark:text-white">
            Bookmarks
          </h1>
          <span className="text-lg font-semibold text-gray-400 dark:text-gray-500">
            ({filteredAndSortedPosts.length})
          </span>
        </div>
      </header>

      <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] xl:gap-12">
        <section className="order-2 min-w-0 lg:order-1 lg:col-start-1 lg:row-start-1">
          {filteredAndSortedPosts.length > 0 ? (
            <div className="flex flex-col gap-10">
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
                  <PostListItem
                    key={post.id}
                    post={post}
                    categoryName={category?.name || "미분류"}
                    categorySlug={categorySlug}
                    thumbnailUrl={thumbnailUrl}
                    commentCount={commentCount}
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
            <div className="flex min-h-72 w-full items-center justify-center">
              <p className="text-center text-sm leading-6 text-metricsText">
                선택한 카테고리에 저장된 아티클이 아직 없어요.
              </p>
            </div>
          )}
        </section>

        <aside className="order-1 min-w-0 lg:order-2 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-24">
          <CategoryFilterPanel
            options={categoryOptions.map((category) => ({
              value: String(category.id),
              label: category.name,
              count: category.count,
            }))}
            selectedValues={selectedCategories}
            totalCount={bookmarkedPosts.length}
            onToggle={toggleCategory}
            onClear={() => setSelectedCategories([])}
          />
        </aside>
      </div>
    </div>
  );
}
