"use client";

import LoginPageLogoIcon from "@components/components/icons/LoginPageLogoIcon";
import { ArrowLeft } from "lucide-react";
import { SocialLoginButton } from "./SocialLoginButton";
import { useLogin } from "../_hooks/useLogin";

/**
 * 로그인 페이지 컨텐츠 (Container Component)
 * - Hook으로 로직 관리
 * - Presentational 컴포넌트 조합
 */
export default function LoginContent() {
    const { isLoading, handleSocialLogin } = useLogin();

    const handleBack = () => {
        window.history.back();
    };

    return (
        <div className="flex justify-center items-center w-full px-4">
            <div className="flex flex-col gap-4 max-w-lg w-full md:max-w-[562px]">
                <button
                    onClick={handleBack}
                    className="flex gap-2 items-center self-start text-metricsText hover:text-mainTitle transition-colors mt-8"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm">뒤로가기</span>
                </button>

                <div className="flex flex-col gap-4 border border-containerColor p-container h-auto rounded-container w-full">
                    <div className="flex flex-col items-center">
                        <LoginPageLogoIcon />
                        <h1 className="text-mainTitle text-center">
                            Welcome to visit my Devlog!
                        </h1>
                        <label className="text-metricsText text-center">
                            로그인 하여 여러분의 첫 공감 및 댓글을 남겨보세요!
                        </label>
                    </div>

                    <div className="flex flex-col gap-2">
                        <SocialLoginButton
                            provider="google"
                            onClick={() => handleSocialLogin("google")}
                            disabled={isLoading}
                        />
                        <SocialLoginButton
                            provider="kakao"
                            onClick={() => handleSocialLogin("kakao")}
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
