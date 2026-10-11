export function saveAuth(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

export const getToken = () => localStorage.getItem("token");
export const getUser = () => JSON.parse(localStorage.getItem("user") || "null");

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
