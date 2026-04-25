import { supabase } from "@components/lib/supabaseClient";
import dayjs from "dayjs";

interface UserData {
    id: string;
    role?: 'none' | 'read' | 'edit';
    nickname: string;
    last_login?: string;
    profile_image?: string;
    created_at?: string;
    profile: string;
};

export const addUserToProfileTable = async <T extends UserData>(userSessionData: T) => {
    try {
        const KoreanTime = dayjs().format("YYYY-MM-DD HH:mm:ss");

        // 1. profiles 테이블에서 사용자 확인 (role 제외)
        const { data: existingData, error: fetchError } = await supabase
            .from("profiles")
            .select("created_at")
            .eq("id", userSessionData.id);

        if (fetchError) {
            console.log("프로필을 조회하는 중 문제가 발생하였어요.", fetchError);
            return;
        }

        if (Array.isArray(existingData) && existingData.length === 0) {
            // 2. profiles 테이블에 기본 정보 추가 (role 제외)
            const { error: insertError } = await supabase
                .from("profiles")
                .insert([
                    {
                        id: userSessionData.id,
                        nickname: userSessionData.nickname,
                        profile_image: userSessionData?.profile || "",
                        last_login: KoreanTime,
                    },
                ]);

            if (insertError) {
                console.log("프로필을 추가하는 중 문제가 발생하였어요.", insertError);
                return;
            }

            // 3. user_roles 테이블에 기본 role 할당 (viewer = read)
            // roles 테이블에서 'viewer' role의 ID를 조회
            const { data: viewerRole, error: roleError } = await supabase
                .from("roles")
                .select("id")
                .eq("name", "viewer")
                .single();

            if (roleError || !viewerRole) {
                console.log("viewer role을 찾을 수 없습니다:", roleError);
                return;
            }

            // user_roles 테이블에 role 할당
            const { error: userRoleError } = await supabase
                .from("user_roles")
                .insert([
                    {
                        user_id: userSessionData.id,
                        role_id: viewerRole.id,
                    },
                ]);

            if (userRoleError) {
                console.log("사용자 role 할당 중 문제가 발생하였어요:", userRoleError);
                return;
            }

            console.log("프로필 추가 및 role 할당 완료");
        } else {
            console.log("이미 존재하는 유저입니다.");
        }

    } catch (error) {
        console.log(error);
    }
};
