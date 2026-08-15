import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <Image
        src="/not-found.png"
        alt="페이지를 찾을 수 없음"
        width={192}
        height={192}
        quality={75}
        className="h-auto w-40 sm:w-48"
        sizes="(max-width: 640px) 160px, 192px"
        priority
      />
      <h1 className="text-2xl font-semibold text-gray-950 dark:text-gray-50">
        찾으시는 페이지가 보이지 않아요
      </h1>
      <p className="text-center text-sm leading-6 text-metricsText">
        주소가 바뀌었거나 페이지가 이동되었을 수 있어요.
      </p>
      <Link
        href="/"
        className="p-button rounded-button bg-action px-6 py-3 text-action-foreground transition-colors hover:bg-action-hover"
      >
        홈으로 돌아가기
      </Link>
    </section>
  );
}
