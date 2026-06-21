"use client";

import { RotateCcw, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

const getBannerMetadata = (url: string): { filename: string; bytes?: number } => {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    const filename = parsedUrl.searchParams.get("filename");
    const bytes = Number(parsedUrl.searchParams.get("bytes"));

    return {
      filename: filename || "배너 이미지",
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
  const [fetchedBytes, setFetchedBytes] = useState<number | null>(null);

  const displayBanner = previewUrl
    ? previewUrl
    : willDeleteBanner
      ? "/default.png"
      : currentBanner || "/default.png";

  const hasCustomBanner = currentBanner && currentBanner !== "/default.png";
  const canSubmit = selectedFile || willDeleteBanner;
  const currentBannerMeta = useMemo(
    () => getBannerMetadata(currentBanner),
    [currentBanner],
  );
  const currentBannerBytes = currentBannerMeta.bytes ?? fetchedBytes;

  useEffect(() => {
    if (!hasCustomBanner || currentBannerMeta.bytes) {
      setFetchedBytes(null);
      return;
    }

    let isMounted = true;

    fetch(currentBanner, { method: "HEAD" })
      .then((response) => {
        const length = response.headers.get("content-length");
        const bytes = length ? Number(length) : NaN;
        if (isMounted && Number.isFinite(bytes) && bytes > 0) {
          setFetchedBytes(bytes);
        }
      })
      .catch(() => {
        if (isMounted) setFetchedBytes(null);
      });

    return () => {
      isMounted = false;
    };
  }, [currentBanner, currentBannerMeta.bytes, hasCustomBanner]);

  return (
    <div
      onClick={onBackdropClick}
      style={{ willChange: isOpen ? "opacity" : "auto" }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm transition-all duration-300 ease-out dark:bg-black/70 ${
        isOpen && isAnimating ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ willChange: isOpen ? "transform, opacity" : "auto" }}
        className={`relative w-full max-w-2xl rounded-container border border-gray-200 bg-white p-6 text-gray-950 shadow-xl transition-all duration-300 ease-out dark:border-white/10 dark:bg-zinc-950 dark:text-gray-50 ${
          isOpen && isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <h2 className="mb-6 text-2xl font-semibold">프로필 배너 수정</h2>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              배너 미리보기
            </label>
            <div className="relative h-40 w-full overflow-hidden rounded-container border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-zinc-900">
              {!imageError ? (
                <img
                  src={displayBanner}
                  alt="배너 미리보기"
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                  onLoad={() => setImageError(false)}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center px-4 text-center text-metricsText">
                  <Upload size={32} />
                  <p className="mt-2 text-sm">이미지를 불러올 수 없습니다.</p>
                  <p className="mt-1 max-w-full truncate text-xs">
                    {displayBanner}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              배너 이미지 선택
            </label>

            {!selectedFile ? (
              hasCustomBanner && !willDeleteBanner ? (
                <>
                  <div className="flex w-full items-center justify-between rounded-container border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-button bg-gray-950 text-white dark:bg-white dark:text-black">
                        <Upload size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-950 dark:text-gray-50">
                          {currentBannerMeta.filename}
                        </p>
                        <p className="truncate text-xs text-metricsText">
                          {currentBannerBytes
                            ? `현재 배너 이미지 · ${formatFileSize(currentBannerBytes)}`
                            : "현재 배너 이미지"}
                        </p>
                      </div>
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-2">
                      <label
                        htmlFor="bannerFile"
                        className="rounded-button bg-gray-950 p-2 text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        title="새 이미지 선택"
                      >
                        <Upload size={18} />
                      </label>
                      <button
                        type="button"
                        onClick={onDeleteBanner}
                        disabled={isUpdating}
                        className="rounded-button border border-gray-200 bg-white p-2 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-950 dark:text-gray-200 dark:hover:bg-white/10"
                        title="배너 삭제"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  <input
                    id="bannerFile"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={onFileSelect}
                    disabled={isUpdating}
                    className="hidden"
                  />
                </>
              ) : (
                <>
                  <label
                    htmlFor="bannerFile"
                    className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-container border-2 border-dashed border-gray-200 bg-gray-50 text-center transition hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <Upload size={32} className="mb-3 text-metricsText" />
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                      <span className="font-semibold">클릭하여 파일 선택</span>
                    </p>
                    <p className="mt-1 text-xs text-metricsText">
                      JPG, PNG, GIF, WEBP (최대 5MB)
                    </p>
                  </label>
                  <input
                    id="bannerFile"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={onFileSelect}
                    disabled={isUpdating}
                    className="hidden"
                  />
                </>
              )
            ) : (
              <div className="flex w-full items-center justify-between rounded-container border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-button bg-gray-950 text-white dark:bg-white dark:text-black">
                    <Upload size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-950 dark:text-gray-50">
                      {selectedFile.name}
                    </p>
                    <p className="truncate text-xs text-metricsText">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-2">
                  <label
                    htmlFor="bannerFileReselect"
                    className="rounded-button bg-gray-950 p-2 text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    title="다시 선택"
                  >
                    <Upload size={18} />
                  </label>
                  <input
                    id="bannerFileReselect"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={onFileSelect}
                    disabled={isUpdating}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={onDeleteBanner}
                    disabled={isUpdating}
                    className="rounded-button border border-gray-200 bg-white p-2 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-950 dark:text-gray-200 dark:hover:bg-white/10"
                    title="선택 취소"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            {willDeleteBanner && hasCustomBanner && (
              <button
                onClick={onRestoreBanner}
                className="mr-auto flex items-center gap-2 text-sm text-metricsText underline underline-offset-4 transition hover:text-gray-950 dark:hover:text-gray-50"
              >
                <RotateCcw size={16} />
                기존 배너 복원
              </button>
            )}
            <button
              onClick={onCancel}
              disabled={isUpdating}
              className="rounded-button border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-950 dark:text-gray-200 dark:hover:bg-white/10"
            >
              취소
            </button>
            <button
              onClick={onUpdate}
              disabled={!canSubmit || isUpdating}
              className="rounded-button bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:disabled:bg-white/20 dark:disabled:text-gray-500"
            >
              {isUpdating ? "변경 중..." : "배너 변경"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
