// Department IDs match the database.
export const DEPARTMENTS = [
  { id: 1, label: "IT" }, // IT
  { id: 2, label: "مالی" }, // Finance
  { id: 3, label: "منابع انسانی" }, // HR
  { id: 8, label: "اداری و مدیریت" }, // Administration
  { id: 9, label: "امنیت" }, // Security
  { id: 10, label: "خدمات مشتریان" }, // Customer Service
];

export const CATEGORIES = [
  { id: 1, label: "مالی", departmentId: 2 }, // Finance -> Finance
  { id: 2, label: "سخت‌افزار", departmentId: 1 }, // Hardware -> IT
  { id: 3, label: "نرم‌افزار", departmentId: 1 }, // Software -> IT
  { id: 4, label: "سایر", departmentId: null }, // Other -> no default
];

const DEPARTMENT_TRANSLATIONS = new Map([
  ["finance", "مالی"],
  ["it", "IT"],
  ["information technology", "فناوری اطلاعات"],
  ["hr", "منابع انسانی"],
  ["human resources", "منابع انسانی"],
  ["administration", "اداری و مدیریت"],
  ["management", "اداری و مدیریت"],
  ["security", "امنیت"],
  ["customer service", "خدمات مشتریان"],
]);

const CATEGORY_TRANSLATIONS = new Map([
  ["finance", "مالی"],
  ["hardware", "سخت‌افزار"],
  ["software", "نرم‌افزار"],
  ["other", "سایر"],
  ["others", "سایر"],
]);

export function translateDepartment(value, id) {
  const byId = DEPARTMENTS.find((item) => item.id === Number(id));

  if (byId) return byId.label;

  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  return DEPARTMENT_TRANSLATIONS.get(normalized) || value || "—";
}

export function departmentForCategory(categoryId) {
  return CATEGORIES.find((item) => item.id === Number(categoryId))?.departmentId ?? null;
}


export function translateCategory(value, id) {
  const byId = CATEGORIES.find((item) => item.id === Number(id));

  if (byId) return byId.label;

  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  return CATEGORY_TRANSLATIONS.get(normalized) || value || "—";
}
