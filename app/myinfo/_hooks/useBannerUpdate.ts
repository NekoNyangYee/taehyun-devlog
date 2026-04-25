"use client";

import { useState, useEffect } from "react";
import { useProfileStore } from "@components/store/profileStore";
import {
    uploadImageToCloudinary,
    validateImageFile,
} from "@components/lib/util/cloudinary";

/**
 * 배너 수정 로직 Hook
 * - 파일 선택 및 미리보기
 * - 배너 업로드 및 업데이트
 * - 모달 상태 관리
 */
export function useBannerUpdate() {
    const { updateProfile } = useProfileStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [willDeleteBanner, setWillDeleteBanner] = useState(false);

    useEffect(() => {
        if (isModalOpen) {
            setIsVisible(true);
            document.body.style.overflow = "hidden";
            const timer = setTimeout(() => {
                setIsAnimating(true);
            }, 10);
            return () => clearTimeout(timer);
        }

        document.body.style.overflow = "auto";
        if (isVisible) {
            setIsAnimating(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isModalOpen, isVisible]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateImageFile(file);
        if (!validation.isValid) {
            alert(validation.error);
            return;
        }

        setSelectedFile(file);
        setWillDeleteBanner(false);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const updateBanner = async () => {
        setIsUpdating(true);
        try {
            if (!selectedFile) {
                // 파일이 없으면 기본 배너로 변경
                await updateProfile({ profile_banner: "/default.png" });
                setPreviewUrl("");
                setWillDeleteBanner(false);
                closeModal();
            } else {
                // 파일이 있으면 업로드 후 변경
                const { url } = await uploadImageToCloudinary(selectedFile);
                await updateProfile({ profile_banner: url });
                setSelectedFile(null);
                setPreviewUrl("");
                setWillDeleteBanner(false);
                closeModal();
            }
            // 프로필 업데이트 후 다시 불러오기 (UI 즉시 반영)
            window.location.reload();
        } catch (error) {
            console.error("배너 업데이트 실패:", error);
            alert("배너 업데이트에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsUpdating(false);
        }
    };

    const cancelUpdate = () => {
        if (selectedFile) {
            const confirmCancel = window.confirm(
                "변경 사항이 저장되지 않습니다. 정말 취소하시겠습니까?"
            );
            if (!confirmCancel) return;
        }
        setSelectedFile(null);
        setPreviewUrl("");
        closeModal();
    };

    const openModal = () => {
        setIsModalOpen(true);
        setWillDeleteBanner(false);
    };

    const closeModal = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setIsModalOpen(false);
        }, 300);
    };

    const resetSelection = () => {
        setSelectedFile(null);
        setPreviewUrl("");
    };

    return {
        isModalOpen,
        selectedFile,
        previewUrl,
        isUpdating,
        isVisible,
        isAnimating,
        willDeleteBanner,
        setWillDeleteBanner,
        handleFileSelect,
        updateBanner,
        cancelUpdate,
        openModal,
        closeModal,
        resetSelection,
        setSelectedFile,
        setPreviewUrl,
    };
}
