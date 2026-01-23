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

        const { data: existingData, error: fetchError } = await supabase
            .from("profiles")
            .select("role, created_at")
            .eq("id", userSessionData.id);

        if (fetchError) {
            console.log("프로필을 조회하는 중 문제가 발생하였어요.", fetchError);
            return;
        }

        if (Array.isArray(existingData) && existingData.length === 0) {
            const { error: insertError } = await supabase
                .from("profiles")
                .insert([
                    {
                        id: userSessionData.id,
                        role: 'read',
                        nickname: userSessionData.nickname,
                        profile_image: userSessionData?.profile || "",
                        last_login: KoreanTime,
                    },
                ]);

            if (insertError) {
                console.log("프로필을 추가하는 중 문제가 발생하였어요.", insertError);
                return;
            }

            console.log("프로필 추가 완료");
        } else {
            console.log("이미 존재하는 유저입니다.");
        }

    } catch (error) {
        console.log(error);
    }
};