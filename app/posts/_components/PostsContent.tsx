"use client";

import CategoryButtons from "@components/components/CategoryButtons";
import { PostGridCard } from "./PostGridCard";
import { SortSelect } from "./SortSelect";
import { usePostsData } from "../_hooks/usePostsData";
import { usePostsFilter } from "../_hooks/usePostsFilter";
import { useBookmarkToggle } from "../_hooks/useBookmarkToggle";
import { useIsClient } from "@components/lib/hooks/useIsClient";
import { lowerURL } from "@components/lib/util/lowerURL";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { AnimatePresence, motion } from "framer-motion";
import { contentReveal } from "@components/components/motion/contentReveal";

interface PostsContentProps {
  initialPosts?: PostStateWithoutContents[];
  initialCategories?: Category[];
}

export default function PostsContent({
  initialPosts = [],
  initialCategories = [],
}: PostsContentProps) {
  const isClient = useIsClient();

  const { posts, categories, comments, bookmarks, userId, session } =
    usePostsData(initialPosts, initialCategories);

  const {
    selectedCategory,
    setSelectedCategory,
    sortOrder,
    setSortOrder,
    filteredAndSortedPosts,
  } = usePostsFilter(posts, categories);

  const { toggleBookmark } = useBookmarkToggle(userId);

  // 카테고리 또는 정렬 변경 시 그리드 재마운트 (가벼운 fade)
  const gridKey = `${selectedCategory ?? "__all__"}::${sortOrder}`;

  // useQuery가 initialData로 캐시된 게시물을 즉시 반환하므로 별도 로딩 게이트 없이 바로 렌더.
  // 북마크처럼 세션 의존 UI만 isClient로 가드한다 (PostGridCard.showBookmark prop).

  return (
    <motion.div
      {...contentReveal}
      className="p-container w-full flex flex-col flex-1 gap-4"
    >
      <h2 className="text-2xl font-bold">게시물</h2>

      <div className="flex justify-between items-center gap-4">
        <CategoryButtons
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <SortSelect value={sortOrder} onChange={setSortOrder} />
      </div>

      {/* 카테고리/정렬 변경 시 그리드만 페이드 — 페이지 진입 애니메이션과 분리 */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={gridKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full"
        >
          {filteredAndSortedPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
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
                  <PostGridCard
                    key={post.id}
                    post={post}
                    categoryName={categoryName}
                    categorySlug={categorySlug}
                    thumbnailUrl={thumbnailUrl}
                    commentCount={commentCount}
                    isBookmarked={isBookmarked}
                    showBookmark={isClient && !!session}
                    onBookmarkToggle={(e) =>
                      toggleBookmark(post.id, isBookmarked, e)
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="w-full h-[386px] flex items-center justify-center border border-gray-200 dark:border-white/10 rounded-container">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                해당 카테고리에 게시물이 없습니다.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
