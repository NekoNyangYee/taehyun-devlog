"use client";

import { useState } from "react";
import { supabase } from "@components/lib/supabaseClient";

/**
 * 로그인 로직 Hook
 * - OAuth 로그인 처리 (구글, 카카오)
 * - 로딩 상태 관리
 * - 로그인 성공 시 onAuthStateChange로 sessionStore가 자동 업데이트되어 모달은 외부에서 닫으면 됨
 */
export function useLogin() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getRedirectURL = () => {
    if (typeof window === "undefined") {
      return process.env.NEXT_PUBLIC_REDIRECT_URL || "http://localhost:3000/";
    }
    return `${window.location.origin}/`;
  };

  const handleSocialLogin = async (provider: "google" | "kakao") => {
    setIsLoading(true);
    try {
      const redirectTo = getRedirectURL();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });

      if (error) {
        alert("로그인 실패. 다시 시도해주세요.");
        console.error("로그인 에러:", error.message);
        setIsLoading(false);
      }
    } catch (err) {
      alert("로그인 중 문제가 발생했습니다.");
      console.error("handleSocialLogin 에러:", err);
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSocialLogin,
  };
}
