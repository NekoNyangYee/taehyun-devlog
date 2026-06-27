import { supabase } from "@components/lib/supabaseClient";
import { Profile } from "@components/store/profileStore";

export const profileQueryKey = (userId?: string) =>
  userId ? ["profile", userId] : ["profiles"];

export const fetchProfileQueryFn = async (
  userId?: string
): Promise<Profile[]> => {
  let query = supabase
    .from("profiles")
    .select(
      "id, nickname, last_login, created_at, profile_image, profile_banner"
    );

  if (userId) {
    query = query.eq("id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("프로필 가져오기 에러:", error);
    throw error;
  }

  const profiles = data ?? [];
  const profileIds = profiles.map((profile) => profile.id);

  if (profileIds.length === 0) {
    return [];
  }

  const { data: rolesData, error: rolesError } = await supabase
    .from("user_roles")
    .select("user_id, roles(name)")
    .in("user_id", profileIds);

  if (rolesError) {
    console.error("역할 가져오기 에러:", rolesError);
    return profiles;
  }

  type UserRoleRow = {
    user_id: string;
    roles: { name: string } | { name: string }[] | null;
  };

  return profiles.map((profile) => {
    const userRole = (rolesData as UserRoleRow[] | null)?.find(
      (role) => role.user_id === profile.id
    );
    const roleRelation = Array.isArray(userRole?.roles)
      ? userRole?.roles[0]
      : userRole?.roles;
    const roleName = roleRelation?.name;

    return {
      ...profile,
      role:
        roleName === "editor" ? "edit" : roleName === "viewer" ? "read" : "none",
    };
  });
};
