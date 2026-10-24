import { getToken } from "./auth";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5237").replace(/\/$/, "");

function translateApiMessage(message, status) {
  const text = String(message || "").trim();
  const known = new Map([
    ["Invalid username or password.", "نام کاربری یا رمز عبور نادرست است."],
    ["That username is already in use.", "این نام کاربری قبلاً استفاده شده است."],
    ["Ticket was not found.", "تیکت موردنظر پیدا نشد."],
    ["Comment was not found.", "دیدگاه موردنظر پیدا نشد."],
    ["The request is invalid.", "اطلاعات ارسال‌شده معتبر نیست."],
  ]);
  if (known.has(text)) return known.get(text);
  if (status === 400) return "اطلاعات ارسال‌شده معتبر نیست. لطفاً ورودی‌ها را بررسی کنید.";
  if (status === 401) return "برای ادامه، دوباره وارد حساب شوید.";
  if (status === 403) return "شما اجازه انجام این عملیات را ندارید.";
  if (status === 404) return "مورد درخواستی پیدا نشد.";
  if (status === 409) return "این اطلاعات با اطلاعات موجود تداخل دارد.";
  if (status >= 500) return "در سرور خطایی رخ داد. لطفاً دوباره تلاش کنید.";
  return text || "در انجام درخواست خطایی رخ داد.";
}

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
    throw new Error(`ارتباط با سرویس برقرار نشد (${API_URL}). بررسی کنید که بک‌اند در حال اجرا باشد.`);
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
    let message = typeof body === "string" ? body : "";
    if (body && typeof body === "object") {
      const validationMessage = body.errors ? Object.values(body.errors).flat()[0] : null;
      message = validationMessage || body.message || body.title || message;
    }
    throw new Error(translateApiMessage(message, response.status));
  }

  return body;
}
