"use client";

import Link from "next/link";
import { LockIcon } from "lucide-react";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileInfo } from "./ProfileInfo";
import { AccountInfoSection } from "./AccountInfoSection";
import { UserPostsSection } from "./UserPostsSection";
import { BannerModal } from "./BannerModal";
import { useMyInfoData } from "../_hooks/useMyInfoData";
import { useProfileData } from "../_hooks/useProfileData";
import { useBannerUpdate } from "../_hooks/useBannerUpdate";

/**
 * MyInfo 페이지 메인 컨텐츠 (Container Component)
 * - Hook으로 데이터와 로직 관리
 * - Presentational 컴포넌트 조합
 */
export default function MyInfoContent() {
  const {
    session,
    isLoading,
    profiles,
    categories,
    userPosts,
    commentCountMap,
  } = useMyInfoData();

  const { profile, accountDetails } = useProfileData(session);

  const {
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
    setSelectedFile,
    setPreviewUrl,
  } = useBannerUpdate();

  if (isLoading) {
    return (
      <section className="flex min-h-[60vh] w-full items-center justify-center">
        <p className="text-metricsText">내 정보를 불러오는 중입니다...</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="flex w-full min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <LockIcon size={48} className="text-metricsText" />
        <p className="text-lg font-semibold">로그인이 필요합니다.</p>
        <p className="text-sm text-metricsText">
          내 정보 페이지는 로그인 후 이용할 수 있어요.
        </p>
        <Link
          href="/login"
          className="p-button rounded-button border border-editButton bg-editButton px-6 py-3 text-loginText"
        >
          로그인 하러 가기
        </Link>
      </section>
    );
  }

  // profiles 배열이 비어있을 수 있으므로 안전하게 처리
  const isEditor =
    profiles.length > 0 && profiles.some((p) => p.role === "edit");
  const currentBanner =
    profiles.length > 0 && profiles[0]?.profile_banner
      ? profiles[0].profile_banner
      : "/default.png";

  return (
    <section className="flex w-full flex-col">
      {/* 헤더 */}
      <header className="relative flex w-full flex-col items-center overflow-hidden border-y border-containerColor bg-white">
        <ProfileBanner bannerUrl={currentBanner} onEditClick={openModal} />
        <ProfileInfo
          avatar={profile.avatar}
          name={profile.name}
          email={profile.email}
          audience={profile.audience}
          isEditor={isEditor}
        />
      </header>

      {/* 본문 */}
      <div className="flex w-full justify-center px-2 sm:px-4 py-6 md:py-10">
        <div className="w-full max-w-5xl space-y-8 md:space-y-10">
          <AccountInfoSection
            lastSignIn={profile.lastSignIn}
            accountDetails={accountDetails}
          />

          {isEditor && (
            <UserPostsSection
              posts={userPosts}
              categories={categories}
              commentCountMap={commentCountMap}
            />
          )}
        </div>
      </div>

      {/* 배너 수정 모달 */}
      {isVisible && (
        <BannerModal
          isOpen={isModalOpen}
          isAnimating={isAnimating}
          isUpdating={isUpdating}
          currentBanner={currentBanner}
          previewUrl={previewUrl}
          selectedFile={selectedFile}
          willDeleteBanner={willDeleteBanner}
          onFileSelect={handleFileSelect}
          onUpdate={updateBanner}
          onCancel={cancelUpdate}
          onBackdropClick={cancelUpdate}
          onRestoreBanner={() => setWillDeleteBanner(false)}
          onDeleteBanner={() => {
            if (confirm("정말 배너를 삭제하시겠습니까?")) {
              setWillDeleteBanner(true);
              setSelectedFile(null);
              setPreviewUrl("");
              return;
            }
          }}
        />
      )}
    </section>
  );
}
