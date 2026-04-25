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
      "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-300",
  },
  kakao: {
    label: "카카오 로그인",
    logo: "/kakao-logo.png",
    className:
      "border-amber-300 bg-amber-300 text-amber-950 hover:bg-amber-400 focus-visible:ring-amber-400",
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
      className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${config.className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <Image src={config.logo} alt={provider} width={20} height={20} />
      {config.label}
    </button>
  );
}
