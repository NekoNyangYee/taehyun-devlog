"use client";

import { LockIcon } from "lucide-react";
import { useLoginModalStore } from "@components/store/loginModalStore";
import { motion } from "framer-motion";
import { contentReveal } from "@components/components/motion/contentReveal";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileInfo } from "./ProfileInfo";
import { AccountInfoSection } from "./AccountInfoSection";
import { UserPostsSection } from "./UserPostsSection";
import { BannerModal } from "./BannerModal";
import { useMyInfoData } from "../_hooks/useMyInfoData";
import { useProfileData } from "../_hooks/useProfileData";
import { useBannerUpdate } from "../_hooks/useBannerUpdate";

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
  const openLogin = useLoginModalStore((s) => s.open);

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
      <motion.section
        {...contentReveal}
        className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 px-4 text-center"
      >
        <LockIcon size={48} className="text-metricsText" />
        <p className="text-lg font-semibold">로그인이 필요합니다.</p>
        <p className="text-sm text-metricsText">
          내 정보 페이지는 로그인 후 이용할 수 있습니다.
        </p>
        <button
          onClick={openLogin}
          className="rounded-button bg-action px-6 py-3 text-action-foreground transition-colors hover:bg-action-hover"
        >
          로그인하러 가기
        </button>
      </motion.section>
    );
  }

  const isEditor = profiles.some((p) => p.role === "edit");
  const currentBanner = profiles[0]?.profile_banner || "/default.png";
  const publicProfileUrl =
    typeof window !== "undefined" && session?.user?.id
      ? `${window.location.origin}/users/${session.user.id}`
      : "";

  return (
    <motion.section
      {...contentReveal}
      className="flex w-full flex-col px-4 py-8 md:py-10"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <ProfileBanner bannerUrl={currentBanner} onEditClick={openModal} />

        <ProfileInfo
          avatar={profile.avatar}
          name={profile.name}
          email={profile.email}
          audience={profile.audience}
          isEditor={isEditor}
          postCount={userPosts.length}
          publicProfileUrl={publicProfileUrl}
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            <AccountInfoSection accountDetails={accountDetails} />

            {isEditor && (
              <UserPostsSection
                posts={userPosts}
                categories={categories}
                commentCountMap={commentCountMap}
              />
            )}
          </div>

          <aside className="space-y-4">
            <section className="rounded-container border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950">
              <h2 className="text-lg font-semibold text-gray-950 dark:text-gray-50">
                프로필 설정
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                <button className="flex w-full items-center justify-between rounded-button px-1 py-2 text-left transition hover:text-gray-500 dark:hover:text-gray-300">
                  <span>
                    <span className="block font-medium">권한 상태</span>
                    <span className="text-metricsText">
                      {isEditor ? "콘텐츠 편집 가능" : "일반 계정"}
                    </span>
                  </span>
                  <span className="text-metricsText">›</span>
                </button>
                <button className="flex w-full items-center justify-between rounded-button px-1 py-2 text-left transition hover:text-gray-500 dark:hover:text-gray-300">
                  <span>
                    <span className="block font-medium">인증 상태</span>
                    <span className="text-metricsText">
                      {profile.audience ? "인증됨" : "미인증"}
                    </span>
                  </span>
                  <span className="text-metricsText">›</span>
                </button>
              </div>
            </section>

            <section className="rounded-container border border-gray-200 bg-white p-5 text-center shadow-sm dark:border-white/10 dark:bg-zinc-950">
              <h2 className="text-lg font-semibold text-gray-950 dark:text-gray-50">
                활동 요약
              </h2>
              <p className="mt-2 text-sm text-metricsText">
                작성한 게시글과 공개 댓글 기준으로 블로그 활동을 확인할 수
                있습니다.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-container bg-gray-50 px-3 py-4 dark:bg-white/5">
                  <p className="text-metricsText">게시물</p>
                  <p className="mt-1 text-xl font-semibold">
                    {userPosts.length}
                  </p>
                </div>
                <div className="rounded-container bg-gray-50 px-3 py-4 dark:bg-white/5">
                  <p className="text-metricsText">권한</p>
                  <p className="mt-1 text-xl font-semibold">
                    {isEditor ? "Edit" : "Read"}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

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
            }
          }}
        />
      )}
    </motion.section>
  );
}
