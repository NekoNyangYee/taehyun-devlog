"use client";

import { useMemo } from "react";
import { CategoryFilterPanel } from "@components/components/CategoryFilterPanel";
import { PostListItem } from "@components/components/PostListItem";
import { PageTitlePanel } from "@components/components/PageTitlePanel";
import { SortSelect } from "./SortSelect";
import { usePostsData } from "../_hooks/usePostsData";
import { usePostsFilter } from "../_hooks/usePostsFilter";
import { useBookmarkToggle } from "../_hooks/useBookmarkToggle";
import { useIsClient } from "@components/lib/hooks/useIsClient";
import { lowerURL } from "@components/lib/util/lowerURL";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";

interface PostsContentProps {
  initialPosts?: PostStateWithoutContents[];
  initialCategories?: Category[];
}

export default function PostsContent({
  initialPosts = [],
  initialCategories = [],
}: PostsContentProps) {
  const isClient = useIsClient();

  const { posts, categories, bookmarks, userId, session } =
    usePostsData(initialPosts, initialCategories);

  const {
    selectedCategory,
    setSelectedCategory,
    sortOrder,
    setSortOrder,
    filteredAndSortedPosts,
  } = usePostsFilter(posts, categories);

  const { toggleBookmark } = useBookmarkToggle(userId);
  const selectedCategoryId = useMemo(
    () =>
      categories.find(
        (category) =>
          lowerURL(category.name) === selectedCategory?.toLowerCase(),
      )?.id,
    [categories, selectedCategory],
  );
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
    <div className="my-6 flex w-full flex-1 flex-col border border-gray-200 bg-white dark:border-white/10 dark:bg-zinc-950 md:my-8">
      <PageTitlePanel
        title="Posts"
      />

      <div className="flex min-h-12 items-center justify-between border-b border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-zinc-900">
        <CategoryFilterPanel
          options={categoryOptions}
          selectedValue={
            selectedCategoryId === undefined
              ? "all"
              : String(selectedCategoryId)
          }
          totalCount={posts.length}
          onChange={(value) => {
            if (value === "all") {
              setSelectedCategory(null);
              return;
            }
            const category = categories.find(
              (item) => String(item.id) === value,
            );
            setSelectedCategory(category?.name || null);
          }}
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
              const thumbnailUrl = category?.thumbnail;
              const categoryName = category?.name || "미분류";
              const categorySlug = lowerURL(category?.name || "");
              const isBookmarked = bookmarks.includes(post.id);
              return (
                <PostListItem
                  key={post.id}
                  post={post}
                  categoryName={categoryName}
                  categorySlug={categorySlug}
                  thumbnailUrl={thumbnailUrl}
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
          <div className="flex h-72 w-full items-center justify-center">
            <p className="text-center text-gray-500 dark:text-gray-400">
              해당 카테고리에 게시물이 없습니다.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
