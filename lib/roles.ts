export type AppRole = "none" | "read" | "edit" | "admin";

export function normalizeAppRole(roleName?: string | null): AppRole {
  switch (roleName?.trim().toLowerCase()) {
    case "admin":
    case "administrator":
    case "super_admin":
      return "admin";
    case "editor":
    case "edit":
      return "edit";
    case "viewer":
    case "read":
    case "member":
      return "read";
    default:
      return "none";
  }
}

const ROLE_PRIORITY: Record<AppRole, number> = {
  none: 0,
  read: 1,
  edit: 2,
  admin: 3,
};

export function resolveHighestAppRole(
  roleNames: Array<string | null | undefined>,
): AppRole {
  return roleNames.reduce<AppRole>((highestRole, roleName) => {
    const role = normalizeAppRole(roleName);
    return ROLE_PRIORITY[role] > ROLE_PRIORITY[highestRole] ? role : highestRole;
  }, "none");
}

export const ROLE_PRESENTATION: Record<
  AppRole,
  { label: string; summary: string; description: string; canEdit: boolean }
> = {
  admin: {
    label: "관리자",
    summary: "관리자",
    description: "전체 콘텐츠 및 권한 관리 가능",
    canEdit: true,
  },
  edit: {
    label: "사원",
    summary: "사원",
    description: "콘텐츠 편집 가능",
    canEdit: true,
  },
  read: {
    label: "방문객",
    summary: "방문객",
    description: "게시물 읽기 및 개인 활동 가능",
    canEdit: false,
  },
  none: {
    label: "방문객",
    summary: "방문객",
    description: "할당된 권한 없음",
    canEdit: false,
  },
};
