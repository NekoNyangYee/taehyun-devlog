import { CheckCheck, CircleAlert, UserCheckIcon } from "lucide-react";

/**
 * 프로필 정보 컴포넌트 (Presentational)
 * - 아바타, 이름, 이메일, 인증 상태 표시
 */
interface ProfileInfoProps {
    avatar: string;
    name: string;
    email: string;
    audience: string;
    isEditor: boolean;
}

export function ProfileInfo({
    avatar,
    name,
    email,
    audience,
    isEditor,
}: ProfileInfoProps) {
    return (
        <div className="relative z-10 -mt-14 sm:-mt-16 md:-mt-20 flex flex-col items-center gap-5 sm:gap-6 px-3 sm:px-4 pb-8 md:pb-10 text-center">
            <div className="relative">
                <img
                    src={avatar}
                    alt="프로필 이미지"
                    className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-full border-4 border-white shadow-xl object-cover"
                />
                {isEditor && (
                    <div className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#0075FF] shadow-lg">
                        <UserCheckIcon size={20} className="text-white" />
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center gap-1.5">
                <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-semibold leading-tight flex-wrap">
                    {name}
                </h1>
                <p className="text-sm sm:text-base text-metricsText">{email}</p>
                <div className="flex gap-2 items-center text-sm">
                    {audience ? (
                        <>
                            <CheckCheck size={16} className="text-green-500" />
                            <p className="text-green-500">
                                해당 계정은 TaeHyun's Devlog의 인증된 계정입니다.
                            </p>
                        </>
                    ) : (
                        <>
                            <CircleAlert size={16} className="text-red-500" />
                            <p className="text-red-500">
                                해당 계정은 TaeHyun's Devlog의 미인증된 계정입니다.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
