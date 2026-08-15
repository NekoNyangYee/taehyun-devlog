"use client";

import { motion } from "framer-motion";
import { LoginRequiredState } from "@components/components/LoginRequiredState";
import PageLoading from "@components/components/loading/PageLoading";
import { useLoginModalStore } from "@components/store/loginModalStore";
import { ROLE_PRESENTATION, type AppRole } from "@components/lib/roles";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileInfo } from "./ProfileInfo";
import { AccountInfoSection } from "./AccountInfoSection";
import { UserPostsSection } from "./UserPostsSection";
import { BannerModal } from "./BannerModal";
import { useMyInfoData } from "../_hooks/useMyInfoData";
import { useProfileData } from "../_hooks/useProfileData";
import { useBannerUpdate } from "../_hooks/useBannerUpdate";

export default function MyInfoContent() {
  const { session, isLoading, profiles, categories, userPosts } =
    useMyInfoData();
  const { profile, accountDetails } = useProfileData(session);
  const openLogin = useLoginModalStore((state) => state.open);
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

  if (isLoading) return <PageLoading />;

  if (!profile) {
    return (
      <LoginRequiredState
        description="로그인하면 내 정보와 활동을 편하게 확인할 수 있어요."
        actionLabel="로그인하기"
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
    <motion.main className="my-8 w-full flex-1 sm:my-12 lg:my-16">
      <div className="flex flex-col gap-8 sm:gap-10">
        <div className="overflow-hidden rounded-3xl bg-gray-100/80 dark:bg-white/[0.055]">
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
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex min-w-0 flex-col gap-8">
            <AccountInfoSection accountDetails={accountDetails} />
            {rolePresentation.canEdit && (
              <UserPostsSection posts={userPosts} categories={categories} />
            )}
          </div>

          <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24">
            <section className="rounded-3xl bg-gray-100/80 p-5 dark:bg-white/[0.055] sm:p-6">
              <h2 className="text-xl font-bold text-gray-950 dark:text-white">
                계정 상태
              </h2>
              <div className="mt-5 flex flex-col gap-3 text-sm">
                <InfoRow
                  label="권한"
                  value={rolePresentation.description}
                />
                <InfoRow
                  label="인증"
                  value={profile.audience ? "인증됨" : "미인증"}
                />
              </div>
            </section>

            <section className="rounded-3xl bg-gray-100/80 p-5 dark:bg-white/[0.055] sm:p-6">
              <h2 className="text-xl font-bold text-gray-950 dark:text-white">
                활동 요약
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                작성한 아티클을 기준으로 현재 활동을 보여드려요.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <SummaryCard label="아티클" value={String(userPosts.length)} />
                <SummaryCard label="권한" value={rolePresentation.summary} />
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
    </motion.main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 dark:bg-white/[0.06]">
      <p className="font-semibold text-gray-950 dark:text-white">{label}</p>
      <p className="mt-1 leading-5 text-gray-500 dark:text-gray-400">{value}</p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 dark:bg-white/[0.06]">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 break-words text-lg font-bold text-gray-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}
