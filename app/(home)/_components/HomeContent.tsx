"use client";

import { useCallback, useRef, useState } from "react";
import { CategoryGrid } from "./CategoryGrid";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { ArticleList } from "./ArticleList";
import { Pagination } from "./Pagination";
import { PopularSidebar } from "./PopularSidebar";
import { RecentComments } from "./RecentComments";
import { useHomeData } from "../_hooks/useHomeData";

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
    if (next === page) return;

    setPage(next);
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  return (
    <div className="my-6 flex w-full flex-col gap-6 md:my-8 md:gap-8">
      <FeaturedCarousel
        posts={featured}
        categories={categories}
        comments={comments}
      />

      <div
        ref={listTopRef}
        className="grid min-w-0 scroll-mt-24 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-12"
      >
        <main className="min-w-0">
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
        </main>

        <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-20">
          <PopularSidebar posts={popularPosts} categories={categories} />
          <RecentComments
            comments={recentComments}
            posts={recentCommentPosts}
            categories={categories}
          />
        </aside>
      </div>

      <CategoryGrid categories={categories} counts={categoryCounts} />
    </div>
  );
}
