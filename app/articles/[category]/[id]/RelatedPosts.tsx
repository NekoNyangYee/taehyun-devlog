import Link from "next/link";
import { ArrowRight, CalendarDays, Heart } from "lucide-react";
import { Category } from "@components/types/category";
import { PostStateWithoutContents } from "@components/types/post";
import { formatDate } from "@components/lib/util/dayjs";
import { lowerURL } from "@components/lib/util/lowerURL";

const RELATED_POST_LIMIT = 6;

interface RelatedPostsProps {
  post: PostStateWithoutContents;
  posts: PostStateWithoutContents[];
  category?: Category;
}

export function RelatedPosts({ post, posts, category }: RelatedPostsProps) {
  const relatedPosts = posts.filter(
    (item) =>
      item.id !== post.id &&
      item.category_id === post.category_id &&
      item.visibility === "public",
  );

  if (!category || relatedPosts.length === 0) return null;

  const categorySlug = encodeURIComponent(lowerURL(category.name));

  return (
    <section className="mt-8 whitespace-normal" aria-labelledby="related-posts-heading">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="related-posts-heading" className="text-xl font-bold tracking-[-0.02em] text-gray-950 dark:text-white">
          {category.name}의 다른 게시물
        </h2>
        {relatedPosts.length >= RELATED_POST_LIMIT ? (
          <Link
            href={`/articles?category=${category.id}`}
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-gray-600 transition-colors hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
          >
            더보기
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.slice(0, RELATED_POST_LIMIT).map((item) => (
          <article key={item.id} className="min-w-0">
            <Link
              href={`/articles/${categorySlug}/${item.slug}`}
              className="flex h-full min-h-24 flex-col gap-3 rounded-2xl bg-gray-100 px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:bg-zinc-900"
            >
              <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-950 dark:text-gray-100">
                {item.title}
              </h3>
              <div className="mt-auto flex items-center justify-between gap-3 text-xs text-metricsText">
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} aria-hidden="true" />
                  {formatDate(item.created_at)}
                </span>
                <span className="flex items-center gap-1.5" aria-label={`좋아요 ${item.like_count ?? 0}개`}>
                  <Heart size={14} aria-hidden="true" />
                  {item.like_count ?? 0}
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
