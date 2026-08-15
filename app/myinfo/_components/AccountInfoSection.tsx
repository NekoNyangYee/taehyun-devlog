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
    <section>
      <div>
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-gray-950 dark:text-white">
          계정 정보
        </h2>
        <p className="mt-1 text-sm text-metricsText">
          로그인, 세션, 계정 식별 정보를 한곳에서 확인합니다.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {accountDetails.map(({ label, value, description, icon: Icon }) => (
          <div
            key={label}
            className="flex min-w-0 items-center gap-4 rounded-2xl bg-gray-100/80 p-5 dark:bg-white/[0.055] sm:p-6"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-700 ring-1 ring-gray-200 dark:bg-white/[0.07] dark:text-gray-200 dark:ring-white/10">
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
