"use client";

import { useCallback, useRef, useState } from "react";
import { CategoryGrid } from "./CategoryGrid";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { ArticleList } from "./ArticleList";
import { Pagination } from "./Pagination";
import { PopularSidebar } from "./PopularSidebar";
import { RecentComments } from "./RecentComments";
import { SidebarScrollArea } from "./SidebarScrollArea";
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
    <div className="my-6 flex w-full flex-col border border-gray-200 bg-white dark:border-white/10 dark:bg-zinc-950 md:my-8">
      <FeaturedCarousel
        posts={featured}
        categories={categories}
        comments={comments}
      />

      <div
        ref={listTopRef}
        className="grid min-w-0 scroll-mt-24 border-t border-gray-200 dark:border-white/10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]"
      >
        <div className="min-w-0 lg:border-r lg:border-gray-200 dark:lg:border-white/10">
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
        <aside className="min-w-0 self-start border-t border-gray-200 bg-white dark:border-white/10 dark:bg-zinc-950 lg:sticky lg:top-16 lg:border-t-0">
          <SidebarScrollArea>
            <PopularSidebar posts={popularPosts} categories={categories} />
            <RecentComments
              comments={recentComments}
              posts={recentCommentPosts}
              categories={categories}
            />
          </SidebarScrollArea>
        </aside>
      </div>

      <div className="border-t border-gray-200 dark:border-white/10">
        <CategoryGrid categories={categories} counts={categoryCounts} />
      </div>
    </div>
  );
}
