function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function normalizeUser(user) {
  if (!user) return null;

  const rawRole = firstDefined(
    user.role,
    user.Role,
    user.roleName,
    user.RoleName,
    user.role_name,
    user.role_name_text
  );
  const role = rawRole && typeof rawRole === "object"
    ? firstDefined(rawRole.role, rawRole.name, rawRole.roleName, "")
    : rawRole ?? "";

  return {
    ...user,
    userId: firstDefined(user.userId, user.UserId, user.user_id, user.id, null),
    username: firstDefined(user.username, user.Username, user.userName, user.UserName, ""),
    roleId: firstDefined(user.roleId, user.RoleId, user.role_id, null),
    role,
    departmentId: firstDefined(user.departmentId, user.DepartmentId, user.department_id, null),
    department: firstDefined(user.department, user.Department, user.departmentName, user.DepartmentName, ""),
  };
}

export function saveAuth(data) {
  const user = normalizeUser(data?.user ?? data);
  if (!user) throw new Error("اطلاعات کاربر در پاسخ ورود وجود ندارد.");

  localStorage.setItem("user", JSON.stringify(user));
  if (data?.token) localStorage.setItem("token", data.token);
  else localStorage.removeItem("token");
}

export const getToken = () => localStorage.getItem("token");

export function getUser() {
  try {
    return normalizeUser(JSON.parse(localStorage.getItem("user") || "null"));
  } catch {
    return null;
  }
}

function normalizedRole(role) {
  return String(role ?? "")
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\s_\-./]+/g, "");
}

export function isAdminRole(role) {
  return ["admin", "administrator", "systemadmin", "systemadministrator", "مدیر", "مدیرسیستم"]
    .includes(normalizedRole(role));
}

export function isExpertRole(role) {
  return [
    "expert",
    "supportexpert",
    "supporttechnician",
    "ticketexpert",
    "technician",
    "agent",
    "کارشناس",
    "کارشناسپشتیبانی",
    "متخصص",
  ].includes(normalizedRole(role));
}

export function isSupportRole(role) {
  return isAdminRole(role) || isExpertRole(role);
}

export function roleLabel(role) {
  if (isAdminRole(role)) return "مدیر سیستم";
  if (isExpertRole(role)) return "کارشناس";
  if (["user", "standarduser", "normaluser", "کاربر", "کاربرعادی"]
    .includes(normalizedRole(role))) return "کاربر";
  return role || "کاربر";
}

export function homePath(user) {
  if (!user) return "/login";
  if (isAdminRole(user.role)) return "/admin";
  if (isExpertRole(user.role)) return "/expert";
  return "/tickets";
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
