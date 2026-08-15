"use client";

import { RotateCcw, Upload, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

interface BannerModalProps {
  isOpen: boolean;
  isAnimating: boolean;
  isUpdating: boolean;
  currentBanner: string;
  previewUrl: string;
  selectedFile: File | null;
  willDeleteBanner: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdate: () => void;
  onCancel: () => void;
  onBackdropClick: () => void;
  onRestoreBanner: () => void;
  onDeleteBanner: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const unit = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(unit));
  return `${Math.round((bytes / Math.pow(unit, index)) * 100) / 100} ${sizes[index]}`;
};

const getBannerMetadata = (url: string): { filename: string; bytes?: number } => {
  try {
    const parsedUrl = new URL(url, "http://localhost");
    const storedFilename = parsedUrl.searchParams.get("filename");
    const pathFilename = decodeURIComponent(
      parsedUrl.pathname.split("/").filter(Boolean).at(-1) || "",
    );
    const bytes = Number(parsedUrl.searchParams.get("bytes"));

    return {
      filename: storedFilename || pathFilename || "배너 이미지",
      bytes: Number.isFinite(bytes) && bytes > 0 ? bytes : undefined,
    };
  } catch {
    return { filename: "배너 이미지" };
  }
};

export function BannerModal({
  isOpen,
  isAnimating,
  isUpdating,
  currentBanner,
  previewUrl,
  selectedFile,
  willDeleteBanner,
  onFileSelect,
  onUpdate,
  onCancel,
  onBackdropClick,
  onRestoreBanner,
  onDeleteBanner,
}: BannerModalProps) {
  const [imageError, setImageError] = useState(false);
  const [remoteFileSize, setRemoteFileSize] = useState<{
    url: string;
    bytes: number | null;
  }>({ url: "", bytes: null });

  const displayBanner = previewUrl
    ? previewUrl
    : willDeleteBanner
      ? "/default.png"
      : currentBanner || "/default.png";
  const hasCustomBanner = Boolean(
    currentBanner && currentBanner !== "/default.png",
  );
  const canSubmit = Boolean(selectedFile || willDeleteBanner);
  const currentBannerMeta = useMemo(
    () => getBannerMetadata(currentBanner),
    [currentBanner],
  );
  const currentBannerBytes =
    currentBannerMeta.bytes ??
    (remoteFileSize.url === currentBanner ? remoteFileSize.bytes : null);
  const isCurrentSizeLoading =
    hasCustomBanner &&
    !currentBannerMeta.bytes &&
    remoteFileSize.url !== currentBanner;

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isUpdating) onCancel();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isUpdating, onCancel]);

  useEffect(() => {
    if (!isOpen || !hasCustomBanner || currentBannerMeta.bytes) return;

    let isCancelled = false;

    const resolveRemoteFileSize = async () => {
      try {
        const headResponse = await fetch(currentBanner, { method: "HEAD" });
        const contentLength = Number(
          headResponse.headers.get("content-length") || 0,
        );

        if (contentLength > 0) {
          if (!isCancelled) {
            setRemoteFileSize({ url: currentBanner, bytes: contentLength });
          }
          return;
        }

        const imageResponse = await fetch(currentBanner);
        const imageBlob = await imageResponse.blob();
        if (!isCancelled) {
          setRemoteFileSize({ url: currentBanner, bytes: imageBlob.size });
        }
      } catch {
        if (!isCancelled) {
          setRemoteFileSize({ url: currentBanner, bytes: null });
        }
      }
    };

    void resolveRemoteFileSize();

    return () => {
      isCancelled = true;
    };
  }, [currentBanner, currentBannerMeta.bytes, hasCustomBanner, isOpen]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isOpen && isAnimating ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onBackdropClick}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="banner-modal-title"
        onClick={(event) => event.stopPropagation()}
        className={`relative max-h-[calc(100vh-2rem)] w-full max-w-[860px] overflow-y-auto rounded-3xl bg-white shadow-2xl transition-all duration-300 scrollbar-hide dark:bg-zinc-950 ${
          isOpen && isAnimating
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.97] opacity-0"
        }`}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-5 sm:px-7 sm:pt-7">
          <h2
            id="banner-modal-title"
            className="text-xl font-bold tracking-[-0.02em] text-gray-950 dark:text-white"
          >
            배경 편집
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={isUpdating}
            aria-label="닫기"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <XIcon size={19} />
          </button>
        </div>

        <div className="grid gap-5 px-5 pb-5 sm:px-7 sm:pb-7 md:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <section className="rounded-2xl bg-gray-100/80 p-4 dark:bg-white/[0.055] sm:p-5">
            <h3 className="text-sm font-bold text-gray-950 dark:text-white">
              미리보기
            </h3>
            <div className="mt-4">
              <div className="relative aspect-[47/12] w-full overflow-hidden rounded-2xl bg-gray-200 dark:bg-zinc-900">
                {!imageError ? (
                  <Image
                    src={displayBanner}
                    alt="배너 미리보기"
                    fill
                    unoptimized
                    sizes="(max-width: 767px) 100vw, 500px"
                    className="object-contain object-center"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center px-4 text-center text-metricsText">
                    <Upload size={30} />
                    <p className="mt-3 text-sm">이미지를 불러올 수 없습니다.</p>
                  </div>
                )}
              </div>
              <p className="mt-3 text-xs leading-5 text-metricsText">
                프로필 상단과 동일한 47:12 비율로 미리 보여드립니다.
              </p>
            </div>
          </section>

          <section className="flex min-h-0 flex-col rounded-2xl bg-gray-100/80 p-4 dark:bg-white/[0.055] sm:p-5">
            <h3 className="text-sm font-bold text-gray-950 dark:text-white">
              이미지 선택
            </h3>
            <div className="flex flex-1 items-center pt-4">
              <div className="w-full">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    사용할 이미지
                  </p>
                  <p className="mt-1 text-xs leading-5 text-metricsText">
                    한 장의 이미지만 선택할 수 있으며 새 파일을 고르면 기존 선택을 대체합니다.
                  </p>
                </div>

                {selectedFile || (hasCustomBanner && !willDeleteBanner) ? (
                <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 dark:bg-white/[0.06] dark:ring-white/10">
                  <div className="flex min-w-0 items-center gap-3 p-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white dark:bg-white dark:text-black">
                      <Upload size={19} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {selectedFile?.name || currentBannerMeta.filename}
                      </p>
                      <p className="mt-1 truncate text-xs text-metricsText">
                        {selectedFile
                          ? formatFileSize(selectedFile.size)
                          : currentBannerBytes
                            ? `현재 이미지 · ${formatFileSize(currentBannerBytes)}`
                            : isCurrentSizeLoading
                              ? "현재 이미지 · 용량 확인 중..."
                              : "현재 이미지 · 용량을 확인할 수 없음"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                    <label
                      htmlFor="bannerFileReselect"
                      className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-100 text-xs font-semibold transition hover:bg-gray-200 dark:bg-white/[0.07] dark:hover:bg-white/10"
                    >
                      <Upload size={15} />
                      다시 선택
                    </label>
                    <button
                      type="button"
                      onClick={onDeleteBanner}
                      disabled={isUpdating}
                      className="flex h-10 items-center justify-center gap-2 rounded-xl bg-gray-100 text-xs font-semibold transition hover:bg-gray-200 disabled:opacity-50 dark:bg-white/[0.07] dark:hover:bg-white/10"
                    >
                      <XIcon size={15} />
                      {selectedFile ? "선택 취소" : "배너 삭제"}
                    </button>
                  </div>
                  <input
                    id="bannerFileReselect"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={onFileSelect}
                    disabled={isUpdating}
                    className="hidden"
                  />
                </div>
                ) : (
                <label
                  htmlFor="bannerFile"
                  className="flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white text-center transition hover:bg-gray-50 dark:border-white/15 dark:bg-white/[0.06] dark:hover:bg-white/10"
                >
                  <Upload size={28} className="text-metricsText" />
                  <span className="mt-3 text-sm font-semibold">파일 선택</span>
                  <span className="mt-1 text-xs text-metricsText">
                    JPG, PNG, GIF, WEBP · 최대 5MB
                  </span>
                </label>
                )}
                <input
                  id="bannerFile"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={onFileSelect}
                  disabled={isUpdating}
                  className="hidden"
                />

                {willDeleteBanner && hasCustomBanner && (
                  <button
                    type="button"
                    onClick={onRestoreBanner}
                    className="mt-4 flex items-center gap-2 text-xs text-metricsText underline underline-offset-4 transition hover:text-gray-950 dark:hover:text-white"
                  >
                    <RotateCcw size={14} />
                    기존 배너 복원
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 pb-5 sm:px-7 sm:pb-7">
          <button
            type="button"
            onClick={onCancel}
            disabled={isUpdating}
            className="h-11 rounded-xl bg-gray-100 px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/[0.07] dark:text-gray-200 dark:hover:bg-white/10"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onUpdate}
            disabled={!canSubmit || isUpdating}
            className="h-11 rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:disabled:bg-white/20 dark:disabled:text-gray-500"
          >
            {isUpdating ? "변경 중..." : "변경 사항 저장"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
