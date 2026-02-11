import type { LucideIcon } from "lucide-react";

/**
 * 계정 정보 섹션 컴포넌트 (Presentational)
 * - 로그인 수단, 세션 정보 등 표시
 */
interface AccountInfoSectionProps {
    lastSignIn: string;
    accountDetails: Array<{
        label: string;
        value: string;
        icon: LucideIcon;
    }>;
}

export function AccountInfoSection({
    lastSignIn,
    accountDetails,
}: AccountInfoSectionProps) {
    return (
        <section className="rounded-container border border-containerColor bg-white p-4 md:p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-containerColor/60 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">계정 정보</h2>
                    <p className="text-sm text-metricsText">
                        로그인 및 세션 정보를 확인하세요.
                    </p>
                </div>
                <span className="text-xs uppercase tracking-wide text-metricsText">
                    {lastSignIn !== "-"
                        ? `마지막 로그인 ${lastSignIn}`
                        : "최근 로그인 정보 없음"}
                </span>
            </div>

            <div className="mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                {accountDetails.map(({ label, value, icon: Icon }) => (
                    <div
                        key={label}
                        className="flex items-start gap-3 rounded-2xl border border-containerColor/60 bg-gray-50 px-3 py-3 md:px-4 md:py-4"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-sm">
                            <Icon size={18} />
                        </span>
                        <div className="text-left">
                            <p className="text-xs font-semibold uppercase tracking-wide text-metricsText">
                                {label}
                            </p>
                            <p className="text-base font-semibold text-gray-900">{value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
