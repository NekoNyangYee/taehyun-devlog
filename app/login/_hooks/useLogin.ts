"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@components/lib/supabaseClient";

/**
 * 로그인 로직 Hook
 * - OAuth 로그인 처리
 * - 세션 확인 및 리다이렉트
 * - 로딩 상태 관리
 */
export function useLogin() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getRedirectURL = () => {
        let url;
        if (typeof window === "undefined") {
            url = process.env.NEXT_PUBLIC_REDIRECT_URL || "http://localhost:3000/";
        } else {
            url = `${window.location.origin}/`;
        }
        console.log("🔄 결정된 Redirect URL:", url);
        return url;
    };

    const handleSocialLogin = async (provider: "google" | "kakao") => {
        setIsLoading(true);

        try {
            const redirectTo = getRedirectURL();
            console.log(`🔹 [${provider}] 로그인 시도. RedirectTo:`, redirectTo);

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

    const hasUserSession = useCallback(async () => {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.log("세션 가져오기 에러:", error);
                return;
            }

            if (data.session) {
                router.replace("/");
            }
        } catch (error) {
            console.log("세션 확인 중 오류 발생:", error);
        }
    }, [router]);

    useEffect(() => {
        hasUserSession();

        // ✅ 로그인 감지: 로그인 성공 시 자동 리다이렉트
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session) {
                    router.push("/");
                }
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [hasUserSession, router]);

    return {
        isLoading,
        handleSocialLogin,
    };
}
