import Image from "next/image";
import Link from "next/link";
import {
  BookmarkIcon,
  EyeIcon,
  HeartIcon,
  MessageSquareTextIcon,
} from "lucide-react";
import { formatDate } from "@components/lib/util/dayjs";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { lowerURL } from "@components/lib/util/lowerURL";

interface UserPostsSectionProps {
  posts: PostStateWithoutContents[];
  categories: Category[];
  commentCountMap: Map<number, number>;
}

export function UserPostsSection({
  posts,
  categories,
  commentCountMap,
}: UserPostsSectionProps) {
  if (posts.length === 0) {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-950 dark:text-gray-50">
            내가 작성한 글
          </h2>
          <p className="mt-1 text-sm text-metricsText">
            아직 작성한 게시물이 없습니다.
          </p>
        </div>
        <div className="flex h-48 flex-col items-center justify-center rounded-container border border-dashed border-gray-300 bg-white text-center text-metricsText dark:border-white/15 dark:bg-zinc-950">
          <p className="text-base font-medium">첫 게시물을 작성해보세요.</p>
          <Link
            href="/posts"
            className="mt-3 rounded-button border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-100 dark:border-white/15 dark:hover:bg-white/10"
          >
            게시물 보러가기
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-950 dark:text-gray-50">
            내가 작성한 글
          </h2>
          <p className="mt-1 text-sm text-metricsText">
            총 {posts.length}개의 게시물이 있습니다.
          </p>
        </div>
        <Link
          href="/posts"
          className="self-start rounded-button border border-gray-300 px-4 py-2 text-sm text-metricsText transition hover:bg-gray-100 dark:border-white/15 dark:hover:bg-white/10"
        >
          전체 게시물 보기
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {posts.slice(0, 6).map((post) => {
          const category = categories.find((cat) => cat.id === post.category_id);
          const imageUrl = category?.thumbnail;
          const categoryName = category?.name || "미분류";
          const categorySlug = category ? lowerURL(category.name) : "posts";
          const commentCount = commentCountMap.get(post.id) || 0;

          return (
            <Link
              key={post.id}
              href={`/posts/${categorySlug}/${post.id}`}
              className="group min-w-0"
            >
              <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-container border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-md dark:border-white/10 dark:bg-zinc-950 dark:hover:border-white/20">
                <div className="relative h-36 w-full bg-gray-100 dark:bg-zinc-800">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={`${categoryName} 썸네일`}
                      fill
                      quality={65}
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 320px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-metricsText">
                      이미지 없음
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <span className="min-w-0 truncate rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
                      {categoryName}
                    </span>
                    <BookmarkIcon
                      size={17}
                      className="shrink-0 text-yellow-500"
                      fill="currentColor"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="line-clamp-2 text-base font-semibold leading-snug text-gray-950 dark:text-gray-50">
                    {post.title}
                  </h3>
                  <div className="mt-auto space-y-3">
                    <p className="truncate text-sm text-metricsText">
                      {formatDate(post.created_at)}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-metricsText">
                      <span className="flex items-center gap-1">
                        <EyeIcon size={15} />
                        {post.view_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <HeartIcon size={15} />
                        {post.like_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquareTextIcon size={15} />
                        {commentCount}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
