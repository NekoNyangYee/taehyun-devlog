import { PencilIcon } from "lucide-react";
import Image from "next/image";

interface ProfileBannerProps {
  bannerUrl: string;
  onEditClick: () => void;
}

export function ProfileBanner({ bannerUrl, onEditClick }: ProfileBannerProps) {
  const src = bannerUrl || "/default.png";

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-container bg-gray-100 sm:h-52 md:h-60 dark:bg-zinc-900">
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
        className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-button bg-black/55 px-3 py-2 text-sm text-white shadow-sm backdrop-blur-sm transition hover:bg-black/75"
      >
        <PencilIcon size={15} />
        배경 이미지 편집
      </button>
    </div>
  );
}
