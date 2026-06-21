import { useMemo } from "react";
import { formatDate } from "@components/lib/util/dayjs";
import type { LucideIcon } from "lucide-react";
import {
  CalendarIcon,
  ClockIcon,
  LogInIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Session } from "@supabase/supabase-js";

const PROVIDER_LABEL: Record<string, string> = {
  kakao: "카카오",
  google: "구글",
  github: "깃허브",
  email: "이메일",
};

export function useProfileData(session: Session | null) {
  const profile = useMemo(() => {
    const user = session?.user;
    if (!user) return null;

    const rawProvider =
      user.app_metadata?.provider || user.identities?.[0]?.provider;

    return {
      avatar:
        (user.user_metadata as { avatar_url?: string })?.avatar_url ||
        "/default.png",
      name:
        (user.user_metadata as { name?: string; full_name?: string })?.name ||
        (user.user_metadata as { full_name?: string })?.full_name ||
        "이름 정보 없음",
      email: user.email || "-",
      provider:
        (rawProvider && PROVIDER_LABEL[rawProvider]) || rawProvider || "-",
      lastSignIn: user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "-",
      createdAt: user.created_at ? formatDate(user.created_at) : "-",
      sessionExpiresAt: session.expires_at
        ? formatDate(new Date(session.expires_at * 1000))
        : "-",
      audience: user.aud || "",
    };
  }, [session]);

  const accountDetails = useMemo(() => {
    if (!profile) return [];

    const items: Array<{
      label: string;
      value: string;
      description: string;
      icon: LucideIcon;
    }> = [
      {
        label: "로그인 수단",
        value: profile.provider,
        description: "현재 계정의 인증 제공자",
        icon: LogInIcon,
      },
      {
        label: "마지막 로그인",
        value: profile.lastSignIn,
        description: "최근 접속한 시간",
        icon: ClockIcon,
      },
      {
        label: "계정 생성일",
        value: profile.createdAt,
        description: "처음 가입한 날짜",
        icon: CalendarIcon,
      },
      {
        label: "세션 만료 예정",
        value: profile.sessionExpiresAt,
        description: "현재 로그인 세션의 만료 시간",
        icon: ShieldCheckIcon,
      },
    ];

    return items.filter((item) => item.value && item.value !== "-");
  }, [profile]);

  return {
    profile,
    accountDetails,
  };
}
