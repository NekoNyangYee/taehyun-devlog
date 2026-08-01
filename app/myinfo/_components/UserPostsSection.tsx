import Link from "next/link";

import { PostListItem } from "@components/components/PostListItem";
import { lowerURL } from "@components/lib/util/lowerURL";
import { Category } from "@components/types/category";
import { PostStateWithoutContents } from "@components/types/post";

interface UserPostsSectionProps {
  posts: PostStateWithoutContents[];
  categories: Category[];
}

export function UserPostsSection({
  posts,
  categories,
}: UserPostsSectionProps) {
  return (
    <section className="bg-white dark:bg-zinc-950">
      <div className="flex min-h-12 items-center justify-between border-b border-gray-200 bg-gray-50 px-5 dark:border-white/10 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <h2 className="font-mono text-sm font-semibold tracking-[0.08em] text-gray-700 dark:text-gray-200">
            My Posts
          </h2>
          <span className="font-mono text-xs text-metricsText">
            {String(posts.length).padStart(2, "0")}
          </span>
        </div>
        <Link
          href="/posts"
          className="text-xs font-medium text-metricsText transition hover:text-gray-950 dark:hover:text-white"
        >
          전체 게시물 보기 →
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center px-5 text-center text-metricsText">
          <p className="text-sm font-medium">아직 작성한 게시물이 없습니다.</p>
          <Link
            href="/posts"
            className="mt-4 border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-100 dark:border-white/15 dark:hover:bg-white/10"
          >
            게시물 보러가기
          </Link>
        </div>
      ) : (
        <div>
          {posts.slice(0, 6).map((post) => {
            const category = categories.find(
              (item) => item.id === post.category_id,
            );

            return (
              <PostListItem
                key={post.id}
                post={post}
                categoryName={category?.name || "미분류"}
                categorySlug={lowerURL(category?.name || "posts")}
                thumbnailUrl={category?.thumbnail}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
