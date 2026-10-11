import { getToken, clearAuth } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5237";

export async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(API_URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Token missing or expired: go back to the login page
  if (res.status === 401 && path !== "/api/users/login") {
    clearAuth();
    window.location.href = "/login";
    return;
  }

  const text = await res.text();
  if (!res.ok) {
    let message = text || `Request failed (${res.status})`;
    try {
      const body = JSON.parse(text); // validation errors come back as JSON
      message = body.errors ? Object.values(body.errors).flat()[0] : body.title || message;
    } catch {}
    throw new Error(message);
  }
  return text ? JSON.parse(text) : null;
}
