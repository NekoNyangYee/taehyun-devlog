"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Grid2X2Plus,
  HeartIcon,
  MessageSquareTextIcon,
} from "lucide-react";
import { PostStateWithoutContents } from "@components/types/post";
import { Category } from "@components/types/category";
import { CommentCountRow } from "@components/queries/commentQueries";
import { lowerURL } from "@components/lib/util/lowerURL";
import { formatDate } from "@components/lib/util/dayjs";
import { CategoryLabel } from "@components/components/CategoryLabel";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@components/components/ui/carousel";

interface FeaturedCarouselProps {
  posts: PostStateWithoutContents[];
  categories: Category[];
  comments: CommentCountRow[];
}

const FEATURED_COUNT = 5;
const AUTO_PLAY_MS = 5500;

export function FeaturedCarousel({
  posts,
  categories,
  comments,
}: FeaturedCarouselProps) {
  const featured = posts.slice(0, FEATURED_COUNT);
  const [api, setApi] = useState<CarouselApi>();
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!api || featured.length <= 1 || isPaused) return;

    const timer = window.setInterval(() => api.scrollNext(), AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [api, featured.length, isPaused]);

  if (featured.length === 0) return null;

  return (
    <section aria-label="추천 아티클" className="relative w-full">
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "start" }}
        className="relative w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
      >
        <div className="relative">
          <CarouselContent>
            {featured.map((post, index) => {
            const category = categories.find(
              (item) => item.id === post.category_id,
            );
            const categoryName = category?.name || "미분류";
            const categorySlug = lowerURL(category?.name || "");
            const postHref = `/articles/${categorySlug}/${post.slug}`;
            const commentCount = comments.filter(
              (comment) => comment.post_id === post.id,
            ).length;

            return (
              <CarouselItem key={post.id}>
                <Link
                  href={postHref}
                  className="group grid min-h-[29rem] grid-cols-1 items-center gap-7 pb-20 pt-4 lg:min-h-[27rem] lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.78fr)] lg:gap-12 lg:pb-16 lg:pt-5"
                >
                  <div className="order-2 flex min-w-0 flex-col items-start lg:order-1">
                    <CategoryLabel name={categoryName} />

                    <h1
                      className="mt-5 line-clamp-3 max-w-2xl text-3xl font-bold tracking-[-0.03em] text-gray-950 transition-colors group-hover:text-gray-500 dark:text-white dark:group-hover:text-gray-300 sm:text-4xl lg:text-[2.75rem]"
                      style={{ lineHeight: 1.5 }}
                    >
                      {post.title}
                    </h1>

                    <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={15} />
                        {formatDate(post.created_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HeartIcon size={15} />
                        {post.like_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageSquareTextIcon size={15} />
                        {commentCount}
                      </span>
                    </div>

                  </div>

                  <div className="relative order-1 aspect-[16/10] w-full overflow-hidden rounded-3xl bg-gray-100 dark:bg-zinc-900 lg:order-2">
                    {category?.thumbnail ? (
                      <Image
                        src={category.thumbnail}
                        alt={post.title}
                        fill
                        priority={index === 0}
                        quality={75}
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        sizes="(max-width: 1024px) calc(100vw - 2rem), 40vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-600">
                        <Grid2X2Plus size={40} />
                      </div>
                    )}
                  </div>
                </Link>
              </CarouselItem>
            );
            })}
          </CarouselContent>

          {featured.length > 1 && (
            <div className="absolute bottom-6 left-0 z-20 flex items-center gap-2">
              <CarouselPrevious
                aria-label="이전 추천 아티클"
                className="static h-9 w-9 translate-x-0 translate-y-0 border-gray-200 bg-white/80 backdrop-blur hover:bg-white dark:border-white/10 dark:bg-zinc-900/80 dark:hover:bg-zinc-800"
              />
              <CarouselNext
                aria-label="다음 추천 아티클"
                className="static h-9 w-9 translate-x-0 translate-y-0 border-gray-200 bg-white/80 backdrop-blur hover:bg-white dark:border-white/10 dark:bg-zinc-900/80 dark:hover:bg-zinc-800"
              />
            </div>
          )}
        </div>
      </Carousel>
    </section>
  );
}
