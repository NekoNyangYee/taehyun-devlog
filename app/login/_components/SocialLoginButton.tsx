import Image from "next/image";

/**
 * 소셜 로그인 버튼 컴포넌트 (Presentational)
 * - 순수하게 UI만 렌더링
 * - 이벤트 핸들러는 Props로 주입
 */
interface SocialLoginButtonProps {
    provider: "google" | "kakao";
    onClick: () => void;
    disabled: boolean;
}

const PROVIDER_CONFIG = {
    google: {
        label: "구글 로그인",
        logo: "/google-logo.png",
        className:
            "flex justify-center gap-2 border border-slate-containerColor bg-google p-button rounded-button",
    },
    kakao: {
        label: "카카오 로그인",
        logo: "/kakao-logo.png",
        className: "flex justify-center gap-2 bg-kakao p-button rounded-button",
    },
};

export function SocialLoginButton({
    provider,
    onClick,
    disabled,
}: SocialLoginButtonProps) {
    const config = PROVIDER_CONFIG[provider];

    return (
        <button
            className={config.className}
            onClick={onClick}
            disabled={disabled}
        >
            <Image src={config.logo} alt={provider} width={24} height={24} />
            {config.label}
        </button>
    );
}
