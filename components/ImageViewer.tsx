"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageViewerProps {
  images: string[];
  selectedIndex: number | null;
  onClose: () => void;
  onSelect: (index: number) => void;
}

export default function ImageViewer({
  images,
  selectedIndex,
  onClose,
  onSelect,
}: ImageViewerProps) {
  const isOpen = selectedIndex !== null;
  const [visible, setVisible] = useState(false);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (selectedIndex === null) return;
    thumbnailRefs.current[selectedIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedIndex]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    onSelect(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
  }, [selectedIndex, images.length, onSelect]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    onSelect(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
  }, [selectedIndex, images.length, onSelect]);

  // 등장 애니메이션
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleClose, handlePrev, handleNext]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || images.length === 0) return null;

  const selectedSrc = images[selectedIndex];

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      {/* 블러 배경 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* 닫기 버튼 */}
      <button
        className="absolute top-4 right-4 z-20 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"
        onClick={handleClose}
      >
        <X size={24} />
      </button>

      {/* 이전/다음 화살표 - 데스크탑: 양옆 고정 */}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white rounded-full p-2 transition-colors bg-black/50 hover:bg-black/80 hidden md:block"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          >
            <ChevronLeft size={28} />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white rounded-full p-2 transition-colors bg-black/50 hover:bg-black/80 hidden md:block"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* 메인 이미지 영역 */}
      <div
        className={`relative z-10 flex flex-1 items-center justify-center w-full px-2 md:px-16 min-h-0 transition-transform duration-200 ${
          visible ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={selectedSrc}
          alt={`이미지 ${selectedIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* 하단 고정 영역 */}
      {images.length > 1 && (
        <div
          className="relative z-10 flex-shrink-0 flex flex-col items-center gap-2 pb-4 pt-2 w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 모바일 하단 화살표 */}
          <div className="flex items-center gap-6 md:hidden">
            <button
              className="text-white rounded-full p-2 bg-black/50 active:bg-black/80"
              onClick={handlePrev}
            >
              <ChevronLeft size={24} />
            </button>
            <span className="text-white text-sm">
              {selectedIndex + 1} / {images.length}
            </span>
            <button
              className="text-white rounded-full p-2 bg-black/50 active:bg-black/80"
              onClick={handleNext}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* 이미지 카운터 - 데스크탑만 */}
          <div className="text-white text-sm bg-black/40 px-3 py-1 rounded-full hidden md:block">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* 썸네일 목록 */}
          <div className="w-full overflow-x-auto scrollbar-viewer flex md:justify-center">
            <div className="flex gap-2 px-4 py-2">
              {images.map((src, index) => (
                <button
                  key={index}
                  ref={(el) => {
                    thumbnailRefs.current[index] = el;
                  }}
                  onClick={() => onSelect(index)}
                  className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                    index === selectedIndex
                      ? "border-white ring-2 ring-white ring-offset-1 ring-offset-black opacity-100"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <img
                    src={src}
                    alt={`썸네일 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
