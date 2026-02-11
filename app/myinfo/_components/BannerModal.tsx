"use client";

import { Upload, X, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

/**
 * 배너 수정 모달 컴포넌트 (Presentational)
 * - 파일 선택 UI
 * - 미리보기
 * - 업로드/취소 버튼
 */
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
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const getFilenameFromUrl = (url: string): string => {
    try {
        const urlParts = url.split("/");
        const filename = urlParts[urlParts.length - 1];
        return filename.split("?")[0];
    } catch {
        return "배너 이미지";
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

    const displayBanner = previewUrl
        ? previewUrl
        : willDeleteBanner
            ? "/default.png"
            : currentBanner || "/default.png";

    const hasCustomBanner = currentBanner && currentBanner !== "/default.png";

    return (
        <div
            onClick={onBackdropClick}
            style={{ willChange: isOpen ? "opacity" : "auto" }}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all duration-300 ease-out ${isOpen && isAnimating ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ willChange: isOpen ? "transform, opacity" : "auto" }}
                className={`relative w-full max-w-2xl rounded-2xl border border-containerColor bg-white p-6 shadow-xl transition-all duration-300 ease-out ${isOpen && isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
                    }`}
            >
                <h2 className="mb-6 text-2xl font-semibold">프로필 배너 수정</h2>
                <div className="space-y-6">
                    {/* 미리보기 */}
                    <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-gray-700">
                            배너 미리보기
                        </label>
                        <div className="relative h-40 w-full overflow-hidden rounded-lg border border-containerColor bg-gray-100">
                            {!imageError ? (
                                <img
                                    src={displayBanner}
                                    alt="배너 미리보기"
                                    className="h-full w-full object-cover"
                                    onError={() => {
                                        console.error("배너 이미지 로드 실패:", displayBanner);
                                        setImageError(true);
                                    }}
                                    onLoad={() => setImageError(false)}
                                />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center text-gray-500">
                                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm">이미지를 불러올 수 없습니다</p>
                                    <p className="text-xs text-gray-400 mt-1">{displayBanner}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 파일 선택 */}
                    <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-gray-700">
                            배너 이미지 선택
                        </label>

                        {!selectedFile ? (
                            <>
                                {hasCustomBanner && !willDeleteBanner ? (
                                    <>
                                        {/* 현재 배너 정보 */}
                                        <div className="flex items-center justify-between w-full p-4 border border-containerColor rounded-lg bg-white">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="flex items-center justify-center w-12 h-12 flex-shrink-0 rounded-lg bg-black text-white">
                                                    <svg
                                                        className="w-6 h-6"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {getFilenameFromUrl(currentBanner)}
                                                    </p>
                                                    <p className="text-xs text-metricsText truncate">
                                                        현재 배너 이미지
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                                <label
                                                    htmlFor="bannerFile"
                                                    className="p-2 rounded-lg bg-black text-white hover:bg-gray-800 transition cursor-pointer"
                                                    title="새 이미지 선택"
                                                >
                                                    <Upload size={18} />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={onDeleteBanner}
                                                    disabled={isUpdating}
                                                    className="p-2 rounded-lg border border-containerColor bg-white text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="선택 취소"
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
                                        {/* 파일 업로드 UI */}
                                        <div className="flex flex-col gap-2">
                                            <label
                                                htmlFor="bannerFile"
                                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-containerColor rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <svg
                                                        className="w-10 h-10 mb-3 text-metricsText"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                        />
                                                    </svg>
                                                    <p className="mb-2 text-sm text-gray-700">
                                                        <span className="font-semibold">클릭하여 파일 선택</span>
                                                    </p>
                                                    <p className="text-xs text-metricsText">
                                                        JPG, PNG, GIF, WEBP (최대 5MB)
                                                    </p>
                                                </div>
                                            </label>
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
                                )}
                            </>
                        ) : (
                            /* 선택된 파일 정보 */
                            <div className="flex items-center justify-between w-full p-4 border border-containerColor rounded-lg bg-white">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="flex items-center justify-center w-12 h-12 flex-shrink-0 rounded-lg bg-black text-white">
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-metricsText truncate">
                                            {formatFileSize(selectedFile.size)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                    <label
                                        htmlFor="bannerFileReselect"
                                        className="p-2 rounded-lg bg-black text-white hover:bg-gray-800 transition cursor-pointer"
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
                                        className="p-2 rounded-lg border border-containerColor bg-white text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="선택 취소"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 버튼 */}
                    <div className="flex justify-end gap-3 items-center">
                        {willDeleteBanner && hasCustomBanner && (
                            <button
                                onClick={onRestoreBanner}
                                className="mr-auto flex items-center gap-2 text-sm text-metricsText hover:text-gray-900 transition underline underline-offset-4"
                            >
                                <RotateCcw size={16} />
                                기존 배너 복원
                            </button>
                        )}
                        <button
                            onClick={onCancel}
                            disabled={isUpdating}
                            className={`rounded-button border border-containerColor bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 ${isUpdating ? "cursor-not-allowed opacity-50" : ""
                                }`}
                        >
                            취소
                        </button>
                        <button
                            onClick={onUpdate}
                            disabled={(!selectedFile && !willDeleteBanner) || isUpdating}
                            className={`rounded-button bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 ${isUpdating ? "cursor-not-allowed opacity-50" : ""
                                }`}
                        >
                            {isUpdating ? "변경 중..." : "배너 변경"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
