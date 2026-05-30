"use client";

import { LockIcon, ListXIcon } from "lucide-react";
import { BookmarkCard } from "./BookmarkCard";
import { useBookmarkData } from "../_hooks/useBookmarkData";
import { useBookmarkToggle } from "@components/app/posts/_hooks/useBookmarkToggle";
import { lowerURL } from "@components/lib/util/lowerURL";
import { useLoginModalStore } from "@components/store/loginModalStore";
import { motion } from "framer-motion";
import { contentReveal } from "@components/components/motion/contentReveal";

/**
 * 북마크 페이지 메인 컨텐츠 (Container Component)
 * - Hook으로 데이터와 로직 관리
 * - Presentational 컴포넌트 조합
 */
export default function BookmarkContent() {
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

  // 데이터 패칭 중에는 빈 상태 대신 로딩 표시
  if (isLoading) {
    return (
      <div className="p-container w-full h-full min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-t-2 border-b-2 border-gray-500 dark:border-gray-400 rounded-full animate-spin" />
      </div>
    );
  }

  // 로그인 안 되었을 때
  if (!session) {
    return (
      <motion.section
        {...contentReveal}
        className="flex w-full min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center"
      >
        <LockIcon size={48} className="text-metricsText" />
        <p className="text-lg font-semibold">로그인이 필요합니다.</p>
        <p className="text-sm text-metricsText">
          북마크 페이지는 로그인 후 이용할 수 있어요.
        </p>
        <button
          onClick={openLogin}
          className="p-button rounded-button border border-editButton bg-editButton px-6 py-3 text-loginText"
        >
          로그인 하러 가기
        </button>
      </motion.section>
    );
  }

  // 북마크된 게시물이 없을 때
  if (bookmarkedPosts.length === 0) {
    return (
      <motion.div
        {...contentReveal}
        className="p-container w-full h-full flex flex-col gap-2 justify-center items-center"
      >
        <ListXIcon size={40} className="text-gray-500" />
        <p className="text-gray-500 text-center">
          북마크 된 게시물이 없습니다.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      {...contentReveal}
      className="p-container w-full flex flex-col gap-6"
    >
      <h1 className="text-3xl font-bold">북마크</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
        {bookmarkedPosts.map((post) => {
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
    </motion.div>
  );
}
