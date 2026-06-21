import type { LucideIcon } from "lucide-react";

interface AccountInfoSectionProps {
  accountDetails: Array<{
    label: string;
    value: string;
    description: string;
    icon: LucideIcon;
  }>;
}

export function AccountInfoSection({ accountDetails }: AccountInfoSectionProps) {
  return (
    <section className="rounded-container border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950">
      <div className="border-b border-gray-200 pb-4 dark:border-white/10">
        <h2 className="text-xl font-semibold text-gray-950 dark:text-gray-50">
          프로필 정보
        </h2>
        <p className="mt-1 text-sm text-metricsText">
          로그인, 세션, 계정 식별 정보를 한곳에서 확인합니다.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {accountDetails.map(({ label, value, description, icon: Icon }) => (
          <div
            key={label}
            className="flex min-w-0 items-center gap-3 rounded-container border border-gray-200 bg-gray-50 px-4 py-4 dark:border-white/10 dark:bg-white/5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-950 text-white dark:bg-white dark:text-black">
              <Icon size={18} />
            </span>
            <div className="min-w-0 text-left">
              <p className="truncate text-xs font-medium text-metricsText">
                {label}
              </p>
              <p className="truncate text-base font-semibold text-gray-950 dark:text-gray-50">
                {value}
              </p>
              <p className="mt-0.5 truncate text-xs text-metricsText">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
