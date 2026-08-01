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
        className={`relative max-h-[calc(100vh-2rem)] w-full max-w-[860px] overflow-y-auto border border-gray-200 bg-white shadow-2xl transition-all duration-300 scrollbar-hide dark:border-white/10 dark:bg-zinc-950 ${
          isOpen && isAnimating
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.97] opacity-0"
        }`}
      >
        <div className="flex h-12 items-center justify-between border-b border-gray-200 bg-gray-50 pl-5 dark:border-white/10 dark:bg-zinc-900">
          <h2
            id="banner-modal-title"
            className="font-mono text-sm font-semibold tracking-[0.08em] text-gray-600 dark:text-gray-300"
          >
            Banner Editor
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={isUpdating}
            aria-label="닫기"
            className="flex h-12 w-12 items-center justify-center border-l border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <XIcon size={19} />
          </button>
        </div>

        <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <section className="border-b border-gray-200 dark:border-white/10 md:border-b-0 md:border-r">
            <div className="flex min-h-12 items-center border-b border-gray-200 bg-gray-50 px-5 text-xs font-medium text-metricsText dark:border-white/10 dark:bg-zinc-900">
              Preview
            </div>
            <div className="p-5 md:p-6">
              <div className="relative aspect-[47/12] w-full overflow-hidden border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-zinc-900">
                {!imageError ? (
                  <Image
                    src={displayBanner}
                    alt="배너 미리보기"
                    fill
                    unoptimized
                    sizes="(max-width: 767px) 100vw, 500px"
                    className="object-cover"
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

          <section className="flex min-h-0 flex-col">
            <div className="flex min-h-12 items-center border-b border-gray-200 bg-gray-50 px-5 text-xs font-medium text-metricsText dark:border-white/10 dark:bg-zinc-900">
              Image File
            </div>
            <div className="flex flex-1 items-center p-5 md:p-6">
              <div className="w-full">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    배너 이미지 1개
                  </p>
                  <p className="mt-1 text-xs leading-5 text-metricsText">
                    한 장의 이미지만 선택할 수 있으며 새 파일을 고르면 기존 선택을 대체합니다.
                  </p>
                </div>

                {selectedFile || (hasCustomBanner && !willDeleteBanner) ? (
                <div className="border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex min-w-0 items-center gap-3 p-4">
                    <div className="flex size-11 shrink-0 items-center justify-center bg-gray-950 text-white dark:bg-white dark:text-black">
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
                  <div className="grid grid-cols-2 border-t border-gray-200 dark:border-white/10">
                    <label
                      htmlFor="bannerFileReselect"
                      className="flex h-10 cursor-pointer items-center justify-center gap-2 border-r border-gray-200 text-xs font-medium transition hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10"
                    >
                      <Upload size={15} />
                      다시 선택
                    </label>
                    <button
                      type="button"
                      onClick={onDeleteBanner}
                      disabled={isUpdating}
                      className="flex h-10 items-center justify-center gap-2 text-xs font-medium transition hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-white/10"
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
                  className="flex h-44 w-full cursor-pointer flex-col items-center justify-center border border-dashed border-gray-300 bg-gray-50 text-center transition hover:bg-gray-100 dark:border-white/15 dark:bg-white/[0.03] dark:hover:bg-white/10"
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

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-zinc-900">
          <button
            type="button"
            onClick={onCancel}
            disabled={isUpdating}
            className="h-10 border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-zinc-950 dark:text-gray-200 dark:hover:bg-white/10"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onUpdate}
            disabled={!canSubmit || isUpdating}
            className="h-10 bg-gray-950 px-5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:disabled:bg-white/20 dark:disabled:text-gray-500"
          >
            {isUpdating ? "변경 중..." : "변경 사항 저장"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
