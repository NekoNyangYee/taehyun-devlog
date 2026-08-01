"use client";

import { useLoginModalStore } from "@components/store/loginModalStore";
import { motion } from "framer-motion";
import { LoginRequiredState } from "@components/components/LoginRequiredState";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileInfo } from "./ProfileInfo";
import { AccountInfoSection } from "./AccountInfoSection";
import { UserPostsSection } from "./UserPostsSection";
import { BannerModal } from "./BannerModal";
import { useMyInfoData } from "../_hooks/useMyInfoData";
import { useProfileData } from "../_hooks/useProfileData";
import { useBannerUpdate } from "../_hooks/useBannerUpdate";
import PageLoading from "@components/components/loading/PageLoading";
import { ROLE_PRESENTATION, type AppRole } from "@components/lib/roles";
import { PageTitlePanel } from "@components/components/PageTitlePanel";

export default function MyInfoContent() {
  const {
    session,
    isLoading,
    profiles,
    categories,
    userPosts,
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
    return <PageLoading />;
  }

  if (!profile) {
    return (
      <LoginRequiredState
        description="내 정보 페이지는 로그인 후 이용할 수 있습니다."
        actionLabel="로그인하러 가기"
        onLoginClick={openLogin}
      />
    );
  }

  const currentUserProfile = profiles.find(
    (item) => item.id === session?.user?.id,
  );
  const role: AppRole = currentUserProfile?.role ?? "none";
  const rolePresentation = ROLE_PRESENTATION[role];
  const currentBanner = currentUserProfile?.profile_banner || "/default.png";
  const publicProfileUrl =
    typeof window !== "undefined" && session?.user?.id
      ? `${window.location.origin}/users/${session.user.id}`
      : "";

  return (
    <motion.section
      className="my-6 flex w-full flex-1 flex-col border border-gray-200 bg-white dark:border-white/10 dark:bg-zinc-950 md:my-8"
    >
      <PageTitlePanel title="My Info" />

      <div className="flex w-full flex-col">
        <ProfileBanner bannerUrl={currentBanner} onEditClick={openModal} />

        <ProfileInfo
          avatar={profile.avatar}
          name={profile.name}
          email={profile.email}
          audience={profile.audience}
          role={role}
          postCount={userPosts.length}
          publicProfileUrl={publicProfileUrl}
        />

        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 lg:border-r lg:border-gray-200 dark:lg:border-white/10">
            <AccountInfoSection accountDetails={accountDetails} />

            {rolePresentation.canEdit && (
              <UserPostsSection
                posts={userPosts}
                categories={categories}
              />
            )}
          </div>

          <aside className="min-w-0 border-t border-gray-200 dark:border-white/10 lg:border-t-0">
            <section className="border-b border-gray-200 dark:border-white/10">
              <h2 className="flex min-h-12 items-center border-b border-gray-200 bg-gray-50 px-5 font-mono text-sm font-semibold tracking-[0.08em] text-gray-700 dark:border-white/10 dark:bg-zinc-900 dark:text-gray-200">
                Profile Settings
              </h2>
              <div className="text-sm">
                <button className="flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                  <span>
                    <span className="block font-medium">권한 상태</span>
                    <span className="text-metricsText">
                      {rolePresentation.description}
                    </span>
                  </span>
                  <span className="text-metricsText">›</span>
                </button>
                <button className="flex w-full items-center justify-between border-t border-gray-200 px-5 py-3 text-left transition hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/[0.03]">
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

            <section>
              <h2 className="flex min-h-12 items-center border-b border-gray-200 bg-gray-50 px-5 font-mono text-sm font-semibold tracking-[0.08em] text-gray-700 dark:border-white/10 dark:bg-zinc-900 dark:text-gray-200">
                Activity Summary
              </h2>
              <p className="px-5 pt-5 text-sm text-metricsText">
                작성한 게시글과 공개 댓글 기준으로 블로그 활동을 확인할 수 있습니다.
              </p>
              <div className="mt-5 grid grid-cols-2 border-t border-gray-200 text-sm dark:border-white/10">
                <div className="border-r border-gray-200 bg-gray-50 px-5 py-5 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-metricsText">게시물</p>
                  <p className="mt-1 text-xl font-semibold">
                    {userPosts.length}
                  </p>
                </div>
                <div className="bg-gray-50 px-5 py-5 dark:bg-white/[0.03]">
                  <p className="text-metricsText">권한</p>
                  <p className="mt-1 text-xl font-semibold">
                    {rolePresentation.summary}
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
