import { PencilIcon } from "lucide-react";

/**
 * 프로필 배너 컴포넌트 (Presentational)
 * - 배너 이미지 표시
 * - 수정 버튼
 */
interface ProfileBannerProps {
    bannerUrl: string;
    onEditClick: () => void;
}

export function ProfileBanner({ bannerUrl, onEditClick }: ProfileBannerProps) {
    return (
        <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 w-full overflow-hidden">
            <div
                className="absolute h-full inset-0 transform bg-cover bg-center"
                style={{
                    backgroundImage: `url(${bannerUrl || "/default.png"})`,
                }}
            />
            <div className="absolute inset-0 bg-white/25" />
            <button
                onClick={onEditClick}
                className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-button border border-white/50 bg-black/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition hover:bg-black/70"
            >
                <PencilIcon size={16} />
                배너 수정
            </button>
        </div>
    );
}
