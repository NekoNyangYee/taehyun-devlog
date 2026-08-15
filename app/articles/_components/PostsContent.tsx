"use client";

import Image from "next/image";
import { useMemo } from "react";
import { CategoryFilterPanel } from "@components/components/CategoryFilterPanel";
import { PostListItem } from "@components/components/PostListItem";
import { usePostsData } from "../_hooks/usePostsData";
import { usePostsFilter } from "../_hooks/usePostsFilter";
import { useBookmarkToggle } from "../_hooks/useBookmarkToggle";
import { useIsClient } from "@components/lib/hooks/useIsClient";
import { lowerURL } from "@components/lib/util/lowerURL";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { CommentCountRow } from "@components/queries/commentQueries";

interface PostsContentProps {
  initialPosts?: PostStateWithoutContents[];
  initialCategories?: Category[];
  initialComments?: CommentCountRow[];
  initialSelectedCategoryIds?: string[];
}

export default function PostsContent({
  initialPosts = [],
  initialCategories = [],
  initialComments = [],
  initialSelectedCategoryIds = [],
}: PostsContentProps) {
  const isClient = useIsClient();

  const { posts, categories, comments, bookmarks, userId, session } =
    usePostsData(initialPosts, initialCategories, initialComments);

  const {
    selectedCategoryIds,
    toggleCategory,
    clearCategories,
    filteredAndSortedPosts,
  } = usePostsFilter(
    posts,
    categories,
    initialSelectedCategoryIds,
    isClient,
  );

  const { toggleBookmark } = useBookmarkToggle(userId);
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: String(category.id),
        label: category.name,
        count: posts.filter((post) => post.category_id === category.id).length,
      })),
    [categories, posts],
  );

  return (
    <div className="my-6 flex w-full flex-1 flex-col md:my-8">
      <header className="mb-8 pt-8 sm:pt-12">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-4xl font-bold tracking-[-0.03em] text-gray-950 dark:text-white">
            Articles
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
                const thumbnailUrl = category?.thumbnail;
                const categoryName = category?.name || "미분류";
                const categorySlug = lowerURL(category?.name || "");
                const isBookmarked = bookmarks.includes(post.id);
                const commentCount = comments.filter(
                  (comment) => comment.post_id === post.id,
                ).length;
                return (
                  <PostListItem
                    key={post.id}
                    post={post}
                    categoryName={categoryName}
                    categorySlug={categorySlug}
                    thumbnailUrl={thumbnailUrl}
                    commentCount={commentCount}
                    isBookmarked={isBookmarked}
                    showBookmark={isClient && !!session}
                    onBookmarkToggle={(event) =>
                      toggleBookmark(post.id, isBookmarked, event)
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[28rem] w-full flex-col items-center justify-center px-4 text-center">
              <Image
                src="/no-posts.png"
                alt="아티클이 없는 상태"
                width={192}
                height={192}
                quality={75}
                className="h-auto w-40 sm:w-48"
                sizes="(max-width: 640px) 160px, 192px"
              />
              <h2 className="mt-4 text-center text-2xl font-semibold text-gray-950 dark:text-gray-50">
                {selectedCategoryIds.length > 0
                  ? "선택한 카테고리의 아티클이 아직 없어요"
                  : "아직 등록된 아티클이 없어요"}
              </h2>
              <p className="mt-2 text-center text-sm leading-6 text-metricsText">
                {selectedCategoryIds.length > 0
                  ? "다른 카테고리를 선택하면 새로운 아티클을 만나볼 수 있어요."
                  : "새로운 아티클을 준비하고 있으니 조금만 기다려 주세요."}
              </p>
            </div>
          )}
        </section>

        <aside className="order-1 min-w-0 lg:order-2 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-24">
          <CategoryFilterPanel
            options={categoryOptions}
            selectedValues={selectedCategoryIds}
            totalCount={posts.length}
            onToggle={toggleCategory}
            onClear={clearCategories}
          />
        </aside>
      </div>
    </div>
  );
}
