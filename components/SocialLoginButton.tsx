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
      "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/15 dark:bg-zinc-950 dark:text-gray-200 dark:hover:bg-zinc-900",
  },
  kakao: {
    label: "카카오 로그인",
    logo: "/kakao-logo.png",
    className:
      "border-amber-300 bg-amber-300 text-amber-950 hover:bg-amber-400",
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
      className={`flex h-12 w-full items-center justify-center gap-2 border px-4 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 ${config.className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <Image src={config.logo} alt={provider} width={20} height={20} />
      {config.label}
    </button>
  );
}
