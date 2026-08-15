import Image from "next/image";

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
      "border-gray-200 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-200 dark:bg-white dark:text-gray-800 dark:hover:bg-gray-50",
  },
  kakao: {
    label: "카카오 로그인",
    logo: "/kakao-logo.png",
    className:
      "border-[#fee500] bg-[#fee500] text-[#191919] hover:bg-[#f5dc00]",
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
      className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border px-4 text-[15px] font-semibold transition-colors duration-200 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 ${config.className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <Image src={config.logo} alt={provider} width={20} height={20} />
      {config.label}
    </button>
  );
}
