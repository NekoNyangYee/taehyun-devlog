import { supabase } from "@components/lib/supabaseClient";
import { create } from "zustand";
import { AppRole, resolveHighestAppRole } from "@components/lib/roles";

export interface Profile {
  id: string;
  nickname: string;
  last_login: string;
  created_at: string;
  profile_image: string;
  profile_banner: string;
  // RBAC: role은 user_roles 테이블에서 조회
  role?: AppRole;
}

interface ProfileProps {
  profiles: Profile[];
  isCached: boolean;
  cachedUserId: string | null;
  isLoading: boolean;
  fetchProfiles: (userId?: string) => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
  checkAdminStatus?: (userId: string) => Promise<boolean>;
  clearCache: () => void;
}

export const useProfileStore = create<ProfileProps>((set, get) => ({
  profiles: [],
  isCached: false,
  cachedUserId: null,
  isLoading: false,
  fetchProfiles: async (userId?: string) => {
    const state = get();

    // 캐시가 있으면 데이터베이스 호출 건너뛰기
    if (
      state.isCached &&
      state.profiles.length > 0 &&
      state.cachedUserId === (userId ?? null)
    ) {
      return;
    }

    set({ isLoading: true });

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
        set({ profiles: [], isCached: false, cachedUserId: null });
        return;
      }


      // 2. user_roles 테이블에서 role 정보 조회
      const profileIds = (profilesData ?? []).map((p) => p.id);

      if (profileIds.length === 0) {
        set({ profiles: [], isCached: true, cachedUserId: userId ?? null });
        return;
      }

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role_id, roles(name)")
        .in("user_id", profileIds);

      if (rolesError) {
        console.error("역할 가져오기 에러:", rolesError);
        // role 없이도 프로필은 반환
        set({
          profiles: profilesData ?? [],
          isCached: true,
          cachedUserId: userId ?? null,
        });
        return;
      }

      type UserRoleRow = {
        user_id: string;
        role_id: number;
        roles: { name: string } | { name: string }[] | null;
      };

      // 3. profiles와 roles 데이터 병합
      const profilesWithRoles = (profilesData ?? []).map((profile) => {
        const userRoles = (rolesData as UserRoleRow[] | null)?.filter(
          (r) => r.user_id === profile.id
        ) ?? [];
        const roleNames = userRoles.flatMap((userRole) => {
          const relations = Array.isArray(userRole.roles)
            ? userRole.roles
            : userRole.roles
              ? [userRole.roles]
              : [];
          return relations.map((relation) => relation.name);
        });

        return {
          ...profile,
          role: resolveHighestAppRole(roleNames),
        };
      });

      set({
        profiles: profilesWithRoles,
        isCached: true,
        cachedUserId: userId ?? null,
      });
    } catch (error) {
      console.error("프로필 조회 중 예외 발생:", error);
      set({ profiles: [], isCached: false, cachedUserId: null });
    } finally {
      set({ isLoading: false });
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
    const profileUpdateData: Partial<Profile> = { ...profileData };
    delete profileUpdateData.role;

    const { error } = await supabase
      .from("profiles")
      .update(profileUpdateData)
      .eq("id", user.id);

    if (error) {
      console.error("프로필 업데이트 에러:", error);
      return;
    }

    // 업데이트 후 캐시 초기화하여 다음 fetch에서 최신 데이터 가져오기
    set({ isCached: false, cachedUserId: null });
    await get().fetchProfiles(user.id);
  },
  clearCache: () => {
    set({ isCached: false, cachedUserId: null, profiles: [] });
  },
}));
