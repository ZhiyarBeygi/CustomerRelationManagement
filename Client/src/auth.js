function normalizeUser(user) {
  if (!user) return null;

  return {
    ...user,
    userId: user.userId ?? user.user_id ?? user.id ?? null,
    username: user.username ?? user.userName ?? "",
    roleId: user.roleId ?? user.role_id ?? null,
    role: user.role ?? user.roleName ?? "",
    departmentId: user.departmentId ?? user.department_id ?? null,
  };
}

// The current API returns the user directly (not { token, user }).
// Keep compatibility with an older { token, user } response if one is used later.
export function saveAuth(data) {
  const user = normalizeUser(data?.user ?? data);
  if (!user) throw new Error("The login response did not contain a user.");

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

export function isAdminRole(role) {
  return String(role ?? "").trim().toLowerCase() === "admin";
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
