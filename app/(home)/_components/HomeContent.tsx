"use client";

import { useCallback, useRef, useState } from "react";
import { CategoryGrid } from "./CategoryGrid";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { ArticleList } from "./ArticleList";
import { Pagination } from "./Pagination";
import { PopularSidebar } from "./PopularSidebar";
import { RecentComments } from "./RecentComments";
import { useHomeData } from "../_hooks/useHomeData";
import { motion } from "framer-motion";
import { contentReveal } from "@components/components/motion/contentReveal";

const PAGE_SIZE = 8;

export default function HomeContent() {
  const [page, setPage] = useState(1);
  const listTopRef = useRef<HTMLDivElement>(null);

  const {
    featured,
    posts,
    totalPages,
    isPageFetching,
    categories,
    categoryCounts,
    comments,
    popularPosts,
    recentComments,
    recentCommentPosts,
  } = useHomeData(page, PAGE_SIZE);

  const handlePageChange = useCallback((next: number) => {
    setPage(next);
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <motion.div
      {...contentReveal}
      className="w-full flex flex-col gap-12 md:gap-16 p-container max-w-[80rem] mx-auto"
    >
      <FeaturedCarousel
        posts={featured}
        categories={categories}
        comments={comments}
      />

      {/* 메인(전체 아티클) + 사이드바(인기 글 / 최신 댓글) */}
      <div
        ref={listTopRef}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 scroll-mt-24"
      >
        <div className="lg:col-span-2">
          <ArticleList
            posts={posts}
            categories={categories}
            comments={comments}
            isFetching={isPageFetching}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={handlePageChange}
          />
        </div>
        <aside className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-24 self-start">
          <PopularSidebar posts={popularPosts} categories={categories} />
          <RecentComments
            comments={recentComments}
            posts={recentCommentPosts}
            categories={categories}
          />
        </aside>
      </div>

      <CategoryGrid categories={categories} counts={categoryCounts} />
    </motion.div>
  );
}
