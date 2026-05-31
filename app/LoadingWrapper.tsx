"use client";

import { useEffect, useState } from "react";
import PageLoading from "../components/loading/PageLoading";
import { supabase } from "../lib/supabaseClient";
import { addUserToProfileTable } from "../lib/loginUtils";
import NotFound from "./not-found";
import { usePathname } from "next/navigation";
import { useIsRestoring, useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@components/store/sessionStore";
import {
  featuredPostsQueryKey,
  fetchFeaturedPostsQueryFn,
} from "@components/queries/postQueries";

const FEATURED_LIMIT = 5;

export default function LoadingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { addSession } = useSessionStore();
  const [showNotFound, setShowNotFound] = useState(false);
  // 캐시 영속 복원 동안에는 콘텐츠가 곧 채워지므로, isRestoring + isLoading 모두 끝났을 때만 children 마운트
  const isRestoring = useIsRestoring();

  useEffect(() => {
    const ensureSignedOutForPendingSignup = async () => {
      if (typeof window === "undefined") return;

      const pendingSignup = sessionStorage.getItem("pending-signup-user");
      if (!pendingSignup) return;

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await supabase.auth.signOut();
      }

      addSession(null);

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("blog-user-session");
        localStorage.removeItem("session-storage");
      }
    };

    ensureSignedOutForPendingSignup();
  }, [addSession, pathname]);

  // 홈 로딩 게이트 — 무거운 전체 게시물 대신 캐러셀용 최신 5개만 패칭
  const postsQuery = useQuery({
    queryKey: featuredPostsQueryKey(FEATURED_LIMIT),
    queryFn: () => fetchFeaturedPostsQueryFn(FEATURED_LIMIT),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (!postsQuery.isLoading) return;

    const timeoutId = setTimeout(() => {
      setShowNotFound(true);
    }, 5000);

    const addUser = async () => {
      if (pathname.startsWith("/signup/confirm")) {
        return;
      }

      if (typeof window !== "undefined") {
        const authIntent = sessionStorage.getItem("auth-intent");
        const pendingSignup = sessionStorage.getItem("pending-signup-user");
        if (authIntent || pendingSignup) {
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("세션 가져오기 에러:", error);
        return;
      }

      if (data.session) {
        const userSessionData = {
          id: data.session.user.id,
          nickname: data.session.user.user_metadata.full_name || "",
          profile: data.session.user.user_metadata.avatar_url || "",
          email: data.session.user.email,
        };
        await addUserToProfileTable(userSessionData);
      }
    };

    addUser();

    return () => clearTimeout(timeoutId);
  }, [pathname, postsQuery.isLoading]);

  if (showNotFound) {
    return <NotFound />;
  }

  // 캐시 복원 중 OR 첫 패칭 중이면 PageLoading 표시.
  // 둘 다 끝난 시점에 children 마운트 → contentReveal 애니메이션 첫 마운트 시 재생됨.
  // (cached data는 restore 직후 query.data로 동기 반영되므로 추가 fetch 로딩 없이 바로 콘텐츠 노출)
  if (isRestoring || postsQuery.isLoading) {
    return <PageLoading />;
  }

  return <>{children}</>;
}
