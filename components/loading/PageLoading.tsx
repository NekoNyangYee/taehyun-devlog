"use client";

import { usePathname } from "next/navigation";

import { Skeleton } from "./Skeleton";

const rowKeys = [0, 1, 2, 3];

function LoadingRegion({ children }: { children: React.ReactNode }) {
  return (
    <section aria-busy="true" aria-label="페이지를 불러오는 중" className="w-full">
      <span className="sr-only" role="status">
        페이지를 불러오는 중입니다.
      </span>
      {children}
    </section>
  );
}

function HomeListRow() {
  return (
    <div className="flex min-w-0 items-center gap-5 sm:gap-8">
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
        <Skeleton className="mt-4 h-6 w-[92%] rounded-md sm:h-7" />
        <Skeleton className="mt-2 h-6 w-3/5 rounded-md sm:h-7" />
        <div className="mt-4 flex gap-4">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-4 w-10 rounded-full" />
          <Skeleton className="h-4 w-10 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-24 w-32 shrink-0 rounded-xl sm:h-32 sm:w-56" />
    </div>
  );
}

function HomeSkeleton() {
  return (
    <LoadingRegion>
      <div className="my-6 flex w-full flex-col gap-6 md:my-8 md:gap-8">
        <section className="relative">
          <div className="grid min-h-[29rem] grid-cols-1 items-center gap-7 pb-20 pt-4 lg:min-h-[27rem] lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.78fr)] lg:gap-12 lg:pb-16 lg:pt-5">
            <div className="order-2 flex min-w-0 flex-col items-start lg:order-1">
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="mt-5 h-10 w-[92%] rounded-lg sm:h-14" />
              <Skeleton className="mt-3 h-10 w-3/4 rounded-lg sm:h-14" />
              <div className="mt-6 flex flex-wrap gap-5">
                <Skeleton className="h-4 w-36 rounded-full" />
                <Skeleton className="h-4 w-10 rounded-full" />
                <Skeleton className="h-4 w-10 rounded-full" />
              </div>
            </div>

            <Skeleton className="order-1 aspect-[16/10] w-full rounded-3xl lg:order-2" />
          </div>

          <div className="absolute bottom-6 left-0 flex gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </section>

        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-12">
          <main className="min-w-0">
            <Skeleton className="mb-8 h-11 w-40 rounded-lg" />
            <div className="flex flex-col gap-10">
              {rowKeys.map((key) => (
                <HomeListRow key={key} />
              ))}
            </div>

            <div className="mt-12 flex items-center justify-center gap-1 py-4">
              {[0, 1, 2, 3, 4].map((key) => (
                <Skeleton className="h-10 w-10 rounded-lg" key={key} />
              ))}
            </div>
          </main>

          <aside className="flex min-w-0 flex-col gap-6">
            <div className="rounded-3xl bg-gray-100 p-6 dark:bg-zinc-900">
              <Skeleton className="mb-5 h-7 w-28 rounded-md" />
              <div className="flex flex-col gap-3">
                {rowKeys.map((key) => (
                  <div className="flex items-start gap-3 px-1 py-2" key={key}>
                    <Skeleton className="h-8 w-8 shrink-0 rounded-lg bg-white dark:bg-zinc-800" />
                    <div className="min-w-0 flex-1 space-y-2 pt-1">
                      <Skeleton className="h-4 w-full rounded-full" />
                      <Skeleton className="h-4 w-3/4 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-gray-100 p-6 dark:bg-zinc-900">
              <Skeleton className="mb-5 h-7 w-24 rounded-md" />
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map((key) => (
                  <div className="rounded-xl bg-white p-4 dark:bg-zinc-800" key={key}>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-3 w-20 rounded-full" />
                    </div>
                    <Skeleton className="mt-3 h-4 w-full rounded-full" />
                    <Skeleton className="mt-2 h-3 w-3/4 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <section className="py-8 sm:py-12">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Skeleton className="h-11 w-32 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>

          <div className="flex gap-5 overflow-hidden">
            {rowKeys.map((key) => (
              <div
                className="flex min-h-[27rem] w-full shrink-0 flex-col rounded-3xl bg-gray-100 p-5 dark:bg-zinc-900 sm:w-[calc((100%_-_1.25rem)/2)] xl:w-[calc((100%_-_3.75rem)/4)]"
                key={key}
              >
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="mt-5 h-6 w-3/4 rounded-md" />
                <Skeleton className="mt-3 h-4 w-full rounded-full" />
                <Skeleton className="mt-2 h-4 w-4/5 rounded-full" />
                <Skeleton className="mt-auto h-7 w-24 rounded-full bg-white dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </LoadingRegion>
  );
}

function PostListSkeleton({ titleWidth = "w-28" }: { titleWidth?: string }) {
  return (
    <LoadingRegion>
      <div className="my-6 flex w-full flex-1 flex-col md:my-8">
        <div className="mb-8 flex items-center gap-2.5 pt-8 sm:pt-12">
          <Skeleton className={`h-11 rounded-lg ${titleWidth}`} />
          <Skeleton className="h-6 w-10 rounded-md" />
        </div>

        <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] xl:gap-12">
          <section className="order-2 min-w-0 lg:order-1 lg:col-start-1 lg:row-start-1">
            <div className="flex flex-col gap-10">
              {[0, 1, 2, 3, 4].map((key) => (
                <HomeListRow key={key} />
              ))}
            </div>
          </section>

          <aside className="order-1 min-w-0 lg:order-2 lg:col-start-2 lg:row-start-1">
            <Skeleton className="h-14 w-full rounded-2xl lg:hidden" />

            <div className="hidden rounded-3xl bg-gray-100 p-6 dark:bg-zinc-900 lg:block">
              <div className="mb-5 flex items-center justify-between gap-4">
                <Skeleton className="h-7 w-24 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>

              <div className="flex flex-col gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map((key) => (
                  <div className="flex items-center gap-3 py-2" key={key}>
                    <Skeleton className="h-5 w-5 shrink-0 rounded-md" />
                    <Skeleton
                      className={`h-4 rounded-full ${
                        key % 3 === 0
                          ? "w-24"
                          : key % 3 === 1
                            ? "w-32"
                            : "w-20"
                      }`}
                    />
                    <Skeleton className="ml-auto h-3 w-5 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </LoadingRegion>
  );
}

function PostDetailSkeleton() {
  return (
    <LoadingRegion>
      <div className="my-6 flex w-full flex-1 flex-col md:my-8">
        <div className="w-full max-w-4xl py-10 sm:py-14 lg:py-16">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="mt-6 h-10 w-[85%] rounded-lg md:h-12" />
          <Skeleton className="mt-3 h-10 w-3/5 rounded-lg md:h-12" />
          <div className="mt-5 flex gap-4">
            <Skeleton className="h-3 w-32 rounded-full" />
          </div>
        </div>
        <div className="flex min-h-[42rem] flex-col-reverse gap-10 border-t border-gray-100 pt-8 dark:border-white/10 sm:pt-10 lg:flex-row lg:items-start xl:gap-14">
          <article className="min-w-0 flex-1 py-4 lg:py-0">
            <Skeleton className="h-7 w-2/5 rounded-md" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-[94%] rounded-full" />
              <Skeleton className="h-4 w-[82%] rounded-full" />
            </div>
            <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
            <Skeleton className="mt-10 h-7 w-1/3 rounded-md" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-[90%] rounded-full" />
              <Skeleton className="h-4 w-3/4 rounded-full" />
            </div>
          </article>
          <aside className="hidden w-72 shrink-0 rounded-3xl bg-gray-100/80 p-5 dark:bg-white/[0.06] lg:block">
            <Skeleton className="h-5 w-16 rounded-md" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="ml-4 h-3 w-4/5 rounded-full" />
              <Skeleton className="ml-4 h-3 w-3/5 rounded-full" />
              <Skeleton className="h-4 w-5/6 rounded-full" />
              <Skeleton className="ml-4 h-3 w-2/3 rounded-full" />
            </div>
          </aside>
        </div>
      </div>
    </LoadingRegion>
  );
}

function ProfileSkeleton() {
  return (
    <LoadingRegion>
      <div className="my-8 w-full flex-1 sm:my-12 lg:my-16">
        <div className="py-6 sm:py-10">
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="mt-4 h-11 w-40 rounded-xl" />
          <Skeleton className="mt-4 h-5 w-80 max-w-[90%] rounded-full" />
        </div>
        <div className="mt-10 flex flex-col gap-10 sm:mt-14 sm:gap-14">
          {[0, 1].map((section) => (
            <div key={section}>
              <Skeleton className="h-7 w-28 rounded-lg" />
              <div className="mt-5 rounded-3xl bg-gray-100/80 p-5 dark:bg-white/[0.055] sm:p-7">
                <div className="flex flex-wrap gap-3">
                  {[0, 1, 2, 3, 4, 5].map((key) => (
                    <Skeleton className="h-10 w-24 rounded-xl" key={key} />
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="grid gap-8 lg:grid-cols-2">
          {[0, 1].map((column) => (
            <div key={column}>
              <Skeleton className="h-7 w-20 rounded-lg" />
              <div className="mt-5 flex flex-col gap-3">
              {rowKeys.slice(0, 2).map((key) => (
                <div className="rounded-2xl bg-gray-100/80 p-5 dark:bg-white/[0.055]" key={key}>
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="mt-3 h-4 w-1/2 rounded-full" />
                </div>
              ))}
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}

export default function PageLoading() {
  const pathname = usePathname();

  if (pathname === "/") return <HomeSkeleton />;
  if (pathname === "/profile") return <ProfileSkeleton />;
  if (/^\/articles\/[^/]+\/[^/]+$/.test(pathname)) return <PostDetailSkeleton />;
  if (pathname === "/bookmarks") return <PostListSkeleton titleWidth="w-52" />;
  if (pathname === "/articles" || pathname.startsWith("/articles/")) return <PostListSkeleton />;

  return <HomeSkeleton />;
}
