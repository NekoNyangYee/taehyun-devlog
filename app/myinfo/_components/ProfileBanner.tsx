import { PencilIcon } from "lucide-react";
import Image from "next/image";

interface ProfileBannerProps {
  bannerUrl: string;
  onEditClick: () => void;
}

export function ProfileBanner({ bannerUrl, onEditClick }: ProfileBannerProps) {
  const src = bannerUrl || "/default.png";

  return (
    <section className="relative h-44 w-full overflow-hidden border-b border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-zinc-900 sm:h-52 md:h-60">
      <Image
        src={src}
        alt="프로필 배경 이미지"
        fill
        priority
        quality={75}
        sizes="(max-width: 768px) 100vw, 1200px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15" />
      <button
        onClick={onEditClick}
        className="absolute bottom-0 right-0 z-10 inline-flex h-11 items-center gap-2 border-l border-t border-white/20 bg-black/65 px-4 text-sm text-white backdrop-blur-sm transition hover:bg-black/80"
      >
        <PencilIcon size={15} />
        배경 이미지 편집
      </button>
    </section>
  );
}
