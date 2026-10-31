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
    ["A closed ticket cannot be forwarded.", "تیکت بسته‌شده قابل ارجاع نیست."],
    ["Status is not valid.", "وضعیت انتخاب‌شده معتبر نیست."],
    [
      "This ticket already has a pending priority request.",
      "برای این تیکت یک درخواست تغییر اولویت در انتظار بررسی وجود دارد.",
    ],
    ["Priority request was not found.", "درخواست تغییر اولویت پیدا نشد."],
    ["The ticket already has this priority.", "تیکت هم‌اکنون همین اولویت را دارد."],
    ["Priority is not valid.", "اولویت انتخاب‌شده معتبر نیست."],
    ["A closed ticket cannot change priority.", "اولویت تیکت بسته‌شده قابل تغییر نیست."],
    ["A closed ticket cannot receive comments.", "برای تیکت بسته‌شده نمی‌توان دیدگاه ثبت کرد."],
    ["Only a pending ticket can be edited.", "فقط تیکت در وضعیت «در انتظار» قابل ویرایش است."],
    [
      "Only an admin can reopen a closed ticket.",
      "فقط مدیر می‌تواند تیکت بسته‌شده را دوباره باز کند.",
    ],
    [
      "A ticket can only move forward: Pending, In Progress, then Done.",
      "وضعیت تیکت فقط به‌ترتیب «در انتظار»، «در حال انجام» و «بسته‌شده» پیش می‌رود.",
    ],
    [
      "This ticket already has a pending transfer request.",
      "برای این تیکت یک درخواست ارجاع در انتظار بررسی وجود دارد.",
    ],
    ["Transfer request was not found.", "درخواست ارجاع پیدا نشد."],
    ["This request has already been reviewed.", "این درخواست قبلاً بررسی شده است."],
    ["A rejection note is required.", "نوشتن دلیل رد درخواست الزامی است."],
    [
      "Choose either a department or an expert, not both.",
      "فقط یک مقصد (دپارتمان یا کارشناس) را انتخاب کنید.",
    ],
    ["The ticket is already in this department.", "تیکت هم‌اکنون در همین دپارتمان است."],
    ["Department was not found.", "دپارتمان موردنظر پیدا نشد."],
    ["The expert must belong to the ticket department.", "کارشناس باید عضو دپارتمان تیکت باشد."],
    ["The expert must belong to the destination department.", "کارشناس باید عضو دپارتمان مقصد باشد."],
    ["An expert must be selected for the forwarding destination.", "انتخاب کارشناس برای مقصد ارجاع الزامی است."],
    ["The ticket must have a department before it can be forwarded.", "پیش از ارجاع، باید دپارتمان تیکت مشخص شود."],
    ["Choose a destination department or expert.", "دپارتمان یا کارشناس مقصد را انتخاب کنید."],
    [
      "The ticket is already assigned to this expert.",
      "تیکت هم‌اکنون به همین کارشناس سپرده شده است.",
    ],
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
    throw new Error(
      `ارتباط با سرویس برقرار نشد (${API_URL}). بررسی کنید که بک‌اند در حال اجرا باشد.`
    );
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
