"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const WINDOW_SIZE = 8;

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
  const [windowStart, setWindowStart] = useState(0);
  const prevIndexRef = useRef<number | null>(null);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    onSelect(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
  }, [selectedIndex, images.length, onSelect]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    onSelect(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
  }, [selectedIndex, images.length, onSelect]);

  // 슬라이딩 윈도우: selectedIndex가 윈도우 경계를 넘으면 한 칸씩 이동
  // 순환 이동 시(마지막→처음, 처음→마지막)는 윈도우도 함께 초기화
  useEffect(() => {
    if (selectedIndex === null) return;
    const maxStart = Math.max(0, images.length - WINDOW_SIZE);
    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = selectedIndex;

    // 순환: 마지막 → 처음
    if (selectedIndex === 0 && prevIndex === images.length - 1) {
      setWindowStart(0);
      return;
    }
    // 순환: 처음 → 마지막
    if (selectedIndex === images.length - 1 && prevIndex === 0) {
      setWindowStart(maxStart);
      return;
    }

    setWindowStart((prev) => {
      if (selectedIndex >= prev + WINDOW_SIZE)
        return Math.min(prev + 1, maxStart);
      if (selectedIndex < prev) return Math.max(prev - 1, 0);
      return prev;
    });
  }, [selectedIndex, images.length]);

  // 뷰어가 열릴 때 선택된 이미지가 윈도우 중앙에 오도록 초기화
  useEffect(() => {
    if (!isOpen || selectedIndex === null) return;
    const maxStart = Math.max(0, images.length - WINDOW_SIZE);
    setWindowStart(
      Math.min(
        Math.max(0, selectedIndex - Math.floor(WINDOW_SIZE / 2)),
        maxStart,
      ),
    );
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // 등장 애니메이션
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      prevIndexRef.current = null;
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
  const visibleThumbnails = images.slice(
    windowStart,
    windowStart + WINDOW_SIZE,
  );

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
          className="relative z-10 flex-shrink-0 flex flex-col items-center gap-2 pb-4 pt-2"
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

          {/* 썸네일 슬라이딩 윈도우 (최대 7개) */}
          <div className="flex gap-2 px-4 pb-1">
            {visibleThumbnails.map((src, i) => {
              const realIndex = windowStart + i;
              return (
                <button
                  key={realIndex}
                  onClick={() => onSelect(realIndex)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                    realIndex === selectedIndex
                      ? "border-white scale-105 opacity-100"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <img
                    src={src}
                    alt={`썸네일 ${realIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
