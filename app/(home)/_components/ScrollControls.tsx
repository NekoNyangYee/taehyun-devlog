import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 스크롤 컨트롤 버튼 컴포넌트 (Presentational)
 * - 좌우 스크롤 버튼만 렌더링
 * - 로직은 부모에서 주입받음
 */
interface ScrollControlsProps {
    canScrollLeft: boolean;
    canScrollRight: boolean;
    onScrollLeft: () => void;
    onScrollRight: () => void;
}

export function ScrollControls({
    canScrollLeft,
    canScrollRight,
    onScrollLeft,
    onScrollRight,
}: ScrollControlsProps) {
    return (
        <div className="flex items-center justify-end gap-3">
            <button
                onClick={onScrollLeft}
                disabled={!canScrollLeft}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:scale-100"
                aria-label="왼쪽으로 스크롤"
            >
                <ChevronLeft size={18} className="text-gray-700" />
            </button>
            <button
                onClick={onScrollRight}
                disabled={!canScrollRight}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:scale-100"
                aria-label="오른쪽으로 스크롤"
            >
                <ChevronRight size={18} className="text-gray-700" />
            </button>
        </div>
    );
}
