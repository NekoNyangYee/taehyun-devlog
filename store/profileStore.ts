import { supabase } from "@components/lib/supabaseClient";
import { create } from "zustand";

export interface Profile {
  id: string;
  nickname: string;
  last_login: string;
  created_at: string;
  profile_image: string;
  profile_banner: string;
  // RBAC: role은 user_roles 테이블에서 조회
  role?: 'none' | 'read' | 'edit';
}

interface ProfileProps {
  profiles: Profile[];
  isCached: boolean;
  fetchProfiles: (userId?: string) => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
  checkAdminStatus?: (userId: string) => Promise<boolean>;
  clearCache: () => void;
}

export const useProfileStore = create<ProfileProps>((set, get) => ({
  profiles: [],
  isCached: false,
  fetchProfiles: async (userId?: string) => {
    const state = get();

    // 캐시가 있으면 데이터베이스 호출 건너뛰기
    if (state.isCached && state.profiles.length > 0) {
      return;
    }

    try {
      // 1. profiles 테이블에서 기본 정보 조회 (role 제외)
      let profileQuery = supabase
        .from("profiles")
        .select(
          "id, nickname, last_login, created_at, profile_image, profile_banner"
        );

      // userId가 제공되면 특정 사용자만 조회
      if (userId) {
        profileQuery = profileQuery.eq("id", userId);
      }

      const { data: profilesData, error: profilesError } = await profileQuery;

      if (profilesError) {
        console.error("프로필 가져오기 에러:", profilesError);
        set({ profiles: [] });
        return;
      }


      // 2. user_roles 테이블에서 role 정보 조회
      const profileIds = (profilesData ?? []).map((p) => p.id);

      if (profileIds.length === 0) {
        set({ profiles: [], isCached: true });
        return;
      }

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role_id, roles(name)")
        .in("user_id", profileIds);

      if (rolesError) {
        console.error("역할 가져오기 에러:", rolesError);
        // role 없이도 프로필은 반환
        set({ profiles: profilesData ?? [], isCached: true });
        return;
      }

      // 3. profiles와 roles 데이터 병합
      const profilesWithRoles = (profilesData ?? []).map((profile) => {
        // Supabase 조인 결과 타입 처리
        const userRole = (rolesData as any)?.find((r: any) => r.user_id === profile.id);
        const roleName = userRole?.roles?.name as string | undefined;

        // role 매핑: 'editor' -> 'edit', 'viewer' -> 'read', 기타 -> 'none'
        let role: 'none' | 'read' | 'edit' = 'none';
        if (roleName === 'editor') {
          role = 'edit';
        } else if (roleName === 'viewer') {
          role = 'read';
        }

        return {
          ...profile,
          role,
        };
      });

      set({ profiles: profilesWithRoles, isCached: true });
    } catch (error) {
      console.error("프로필 조회 중 예외 발생:", error);
      set({ profiles: [] });
    }
  },
  updateProfile: async (profileData: Partial<Profile>) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("로그인된 사용자가 없습니다");
      return;
    }

    // role은 profiles 테이블에 없으므로 제거
    const { role, ...profileUpdateData } = profileData;

    const { error } = await supabase
      .from("profiles")
      .update(profileUpdateData)
      .eq("id", user.id);

    if (error) {
      console.error("프로필 업데이트 에러:", error);
      return;
    }

    // 업데이트 후 캐시 초기화하여 다음 fetch에서 최신 데이터 가져오기
    set({ isCached: false });
    await get().fetchProfiles(user.id);
  },
  clearCache: () => {
    set({ isCached: false, profiles: [] });
  },
}));
