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

function PanelHeader({ width = "w-28" }: { width?: string }) {
  return (
    <div className="flex min-h-12 items-center border-b border-gray-200 bg-gray-50 px-4 dark:border-white/10 dark:bg-zinc-900 sm:px-5">
      <Skeleton className={`h-3 rounded-full ${width}`} />
    </div>
  );
}

function HomeListRow() {
  return (
    <div className="flex min-h-32 items-stretch gap-4 border-b border-gray-200 px-4 py-4 last:border-b-0 dark:border-white/10 sm:gap-6 sm:px-5 sm:py-5">
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="mt-3 h-5 w-[92%] rounded-md" />
        <div className="mt-4 flex gap-3">
          <Skeleton className="h-3 w-10 rounded-full" />
          <Skeleton className="h-3 w-10 rounded-full" />
          <Skeleton className="h-3 w-10 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-20 w-28 shrink-0 sm:h-28 sm:w-44" />
    </div>
  );
}

function HomeSkeleton() {
  return (
    <LoadingRegion>
      <div className="my-6 flex w-full flex-col border border-gray-200 bg-white dark:border-white/10 dark:bg-zinc-950 md:my-8">
        <PanelHeader width="w-32" />
        <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="order-2 flex min-h-64 flex-col justify-center px-5 py-7 sm:px-8 lg:order-1 lg:min-h-[22rem] lg:px-10">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="mt-5 h-8 w-[88%] rounded-md md:h-10" />
            <Skeleton className="mt-3 h-8 w-2/3 rounded-md md:h-10" />
            <Skeleton className="mt-6 h-3 w-32 rounded-full" />
            <div className="mt-5 flex gap-4">
              <Skeleton className="h-3 w-10 rounded-full" />
              <Skeleton className="h-3 w-10 rounded-full" />
              <Skeleton className="h-3 w-10 rounded-full" />
            </div>
          </div>
          <Skeleton className="order-1 h-52 w-full border-b border-gray-200 dark:border-white/10 md:h-72 lg:order-2 lg:h-full lg:min-h-[22rem] lg:border-b-0 lg:border-l" />
        </div>
        <div className="flex h-14 items-center gap-4 border-t border-gray-200 bg-gray-50 px-4 dark:border-white/10 dark:bg-zinc-900 sm:px-5">
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
          <Skeleton className="h-1.5 w-20 rounded-full" />
        </div>

        <div className="grid min-w-0 border-t border-gray-200 dark:border-white/10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
          <div className="min-w-0 lg:border-r lg:border-gray-200 dark:lg:border-white/10">
            <PanelHeader width="w-24" />
            {rowKeys.map((key) => <HomeListRow key={key} />)}
            <div className="flex h-16 items-center justify-center gap-2 border-t border-gray-200 dark:border-white/10">
              {rowKeys.map((key) => <Skeleton className="size-8" key={key} />)}
            </div>
          </div>
          <aside className="border-t border-gray-200 dark:border-white/10 lg:border-t-0">
            <PanelHeader width="w-24" />
            {rowKeys.map((key) => (
              <div className="flex gap-3 border-b border-gray-200 px-4 py-4 dark:border-white/10" key={key}>
                <Skeleton className="h-4 w-6 shrink-0 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-full rounded-full" />
                  <Skeleton className="h-3 w-3/4 rounded-full" />
                </div>
              </div>
            ))}
            <PanelHeader width="w-28" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-3 w-5/6 rounded-full" />
              <Skeleton className="h-3 w-2/3 rounded-full" />
              <Skeleton className="h-3 w-3/4 rounded-full" />
            </div>
          </aside>
        </div>
      </div>
    </LoadingRegion>
  );
}

function PostListSkeleton({ titleWidth = "w-20" }: { titleWidth?: string }) {
  return (
    <LoadingRegion>
      <div className="my-6 flex w-full flex-1 flex-col border border-gray-200 bg-white dark:border-white/10 dark:bg-zinc-950 md:my-8">
        <PanelHeader width={titleWidth} />
        <div className="flex min-h-12 items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 px-4 dark:border-white/10 dark:bg-zinc-900 sm:px-5">
          <div className="flex gap-2">
            <Skeleton className="h-7 w-16 rounded-button" />
            <Skeleton className="hidden h-7 w-20 rounded-button sm:block" />
            <Skeleton className="hidden h-7 w-16 rounded-button md:block" />
          </div>
          <Skeleton className="h-8 w-24 rounded-button" />
        </div>
        <div>
          {[0, 1, 2, 3, 4].map((key) => (
            <div className="flex h-32 items-stretch border-b border-gray-200 last:border-b-0 dark:border-white/10 sm:h-36" key={key}>
              <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3 sm:px-5 sm:py-5">
                <Skeleton className="h-5 w-[88%] rounded-md" />
                <Skeleton className="mt-3 h-3 w-44 max-w-[75%] rounded-full" />
              </div>
              <Skeleton className="h-full w-40 shrink-0 border-l border-gray-200 dark:border-white/10 sm:w-60" />
            </div>
          ))}
        </div>
      </div>
    </LoadingRegion>
  );
}

function PostDetailSkeleton() {
  return (
    <LoadingRegion>
      <div className="my-6 flex w-full flex-1 flex-col border border-gray-200 bg-white dark:border-white/10 dark:bg-zinc-950 md:my-8">
        <PanelHeader width="w-24" />
        <div className="border-b border-gray-200 px-5 py-8 dark:border-white/10 md:px-8 md:py-10">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="mt-5 h-9 w-[85%] rounded-md md:h-11" />
          <Skeleton className="mt-3 h-9 w-3/5 rounded-md md:h-11" />
          <div className="mt-5 flex gap-4">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-3 w-14 rounded-full" />
          </div>
        </div>
        <div className="flex min-h-[42rem] flex-col-reverse lg:flex-row">
          <article className="min-w-0 flex-1 px-5 py-8 md:px-8 lg:px-10 lg:py-10">
            <Skeleton className="h-7 w-2/5 rounded-md" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-[94%] rounded-full" />
              <Skeleton className="h-4 w-[82%] rounded-full" />
            </div>
            <Skeleton className="mt-8 h-64 w-full rounded-container" />
            <Skeleton className="mt-10 h-7 w-1/3 rounded-md" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-[90%] rounded-full" />
              <Skeleton className="h-4 w-3/4 rounded-full" />
            </div>
          </article>
          <aside className="hidden w-80 border-l border-gray-200 dark:border-white/10 lg:block">
            <PanelHeader width="w-36" />
            <div className="space-y-4 p-5">
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

function AccountSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <LoadingRegion>
      <div
        className={
          compact
            ? "flex w-full flex-col gap-4 py-8 md:py-10"
            : "my-6 flex w-full flex-1 flex-col border border-gray-200 bg-white dark:border-white/10 dark:bg-zinc-950 md:my-8"
        }
      >
        {!compact && (
          <div className="flex min-h-40 items-center justify-center border-b border-gray-200 dark:border-white/10">
            <Skeleton className="h-9 w-40 rounded-md" />
          </div>
        )}
        <Skeleton
          className={`h-44 w-full sm:h-52 md:h-60 ${
            compact
              ? "rounded-container"
              : "border-b border-gray-200 dark:border-white/10"
          }`}
        />
        <div
          className={
            compact
              ? "rounded-container border border-gray-200 p-5 dark:border-white/10"
              : "border-b border-gray-200 p-5 dark:border-white/10 md:px-8 md:py-7"
          }
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Skeleton className="size-24 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-7 w-48 max-w-[70%] rounded-md" />
              <Skeleton className="mt-3 h-3 w-56 max-w-[85%] rounded-full" />
              <Skeleton className="mt-4 h-3 w-72 max-w-full rounded-full" />
              <div className="mt-5 flex gap-5">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-3 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-full rounded-button sm:w-36" />
          </div>
        </div>
        {!compact && (
          <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0 lg:border-r lg:border-gray-200 dark:lg:border-white/10">
              <div className="border-b border-gray-200 dark:border-white/10">
                <PanelHeader width="w-28" />
                <div className="grid md:grid-cols-2">
                  {rowKeys.map((key) => (
                    <div className="flex items-center gap-3 border-b border-gray-200 p-5 dark:border-white/10 md:even:border-l" key={key}>
                      <Skeleton className="size-10 shrink-0 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-16 rounded-full" />
                        <Skeleton className="h-4 w-4/5 rounded-md" />
                        <Skeleton className="h-3 w-3/5 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <PanelHeader width="w-20" />
                {[0, 1, 2].map((key) => (
                  <div className="flex h-32 border-b border-gray-200 last:border-b-0 dark:border-white/10" key={key}>
                    <div className="flex flex-1 flex-col justify-center px-5">
                      <Skeleton className="h-5 w-4/5 rounded-md" />
                      <Skeleton className="mt-3 h-3 w-40 rounded-full" />
                    </div>
                    <Skeleton className="h-full w-40 border-l border-gray-200 dark:border-white/10 sm:w-52" />
                  </div>
                ))}
              </div>
            </div>
            <aside className="border-t border-gray-200 dark:border-white/10 lg:border-t-0">
              <PanelHeader width="w-28" />
              <div className="space-y-3 border-b border-gray-200 p-5 dark:border-white/10">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-3/4 rounded-full" />
                <Skeleton className="h-4 w-5/6 rounded-full" />
              </div>
              <PanelHeader width="w-28" />
              <div className="p-5">
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="mt-3 h-3 w-4/5 rounded-full" />
                <div className="mt-5 grid grid-cols-2 gap-px bg-gray-200 dark:bg-white/10">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </LoadingRegion>
  );
}

function ProfileSkeleton() {
  return (
    <LoadingRegion>
      <div className="my-6 flex w-full flex-1 flex-col border border-gray-200 bg-white dark:border-white/10 dark:bg-zinc-950 md:my-8">
        <PanelHeader width="w-20" />
        <div className="flex min-h-44 items-center border-b border-gray-200 px-5 dark:border-white/10 md:px-8">
          <div className="w-full">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="mt-4 h-8 w-40 rounded-md" />
            <Skeleton className="mt-3 h-4 w-80 max-w-[90%] rounded-full" />
          </div>
        </div>
        {["w-20", "w-40"].map((width) => (
          <div className="border-b border-gray-200 dark:border-white/10" key={width}>
            <PanelHeader width={width} />
            <div className="flex flex-wrap gap-3 p-5 md:p-6">
              {[0, 1, 2, 3, 4, 5].map((key) => <Skeleton className="h-7 w-24 rounded-md" key={key} />)}
            </div>
          </div>
        ))}
        <div className="grid md:grid-cols-2">
          {[0, 1].map((column) => (
            <div className="md:border-r md:last:border-r-0 md:dark:border-white/10" key={column}>
              <PanelHeader width="w-24" />
              {rowKeys.slice(0, 2).map((key) => (
                <div className="border-b border-gray-200 p-5 dark:border-white/10" key={key}>
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="mt-3 h-3 w-1/2 rounded-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </LoadingRegion>
  );
}

export default function PageLoading() {
  const pathname = usePathname();

  if (pathname === "/") return <HomeSkeleton />;
  if (pathname === "/myinfo") return <AccountSkeleton />;
  if (pathname.startsWith("/users/")) return <AccountSkeleton compact />;
  if (pathname === "/profile") return <ProfileSkeleton />;
  if (/^\/posts\/[^/]+\/[^/]+$/.test(pathname)) return <PostDetailSkeleton />;
  if (pathname === "/bookmarks") return <PostListSkeleton titleWidth="w-24" />;
  if (pathname === "/posts" || pathname.startsWith("/posts/")) return <PostListSkeleton />;

  return <HomeSkeleton />;
}
