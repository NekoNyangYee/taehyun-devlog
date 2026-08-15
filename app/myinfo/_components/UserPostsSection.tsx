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
    <section>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-gray-950 dark:text-white">
            내 아티클
          </h2>
          <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">
            {posts.length}
          </span>
        </div>
        <Link
          href="/articles"
          className="text-sm font-semibold text-gray-500 transition hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-300"
        >
          전체 아티클 보기 →
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="mt-5 flex h-48 flex-col items-center justify-center rounded-3xl bg-gray-100/80 px-5 text-center text-metricsText dark:bg-white/[0.055]">
          <p className="text-sm font-medium">아직 작성한 아티클이 없습니다.</p>
          <Link
            href="/articles"
            className="mt-4 rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
          >
            아티클 보러가기
          </Link>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
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
