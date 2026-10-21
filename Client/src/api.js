import { getToken } from "./auth";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5237").replace(/\/$/, "");

export async function api(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(`Could not connect to the API at ${API_URL}. Check that SupportTicketSystem is running.`);
  }

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    let message = typeof body === "string" ? body : `Request failed (${response.status})`;
    if (body && typeof body === "object") {
      const validationMessage = body.errors ? Object.values(body.errors).flat()[0] : null;
      message = validationMessage || body.message || body.title || message;
    }
    throw new Error(message);
  }

  return body;
}
