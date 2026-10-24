// These IDs match the options that were already configured in the uploaded client.
// The current API has no department/category lookup endpoints, so keep them centralized here.
export const DEPARTMENTS = [
  { id: 1, label: "مالی" },
  { id: 2, label: "فناوری اطلاعات" },
  { id: 3, label: "منابع انسانی" },
  { id: 4, label: "اداری و مدیریت" },
  { id: 5, label: "امنیت" },
  { id: 6, label: "خدمات مشتریان" },
];

export const CATEGORIES = [
  { id: 1, label: "مالی" },
  { id: 2, label: "سخت‌افزار" },
  { id: 3, label: "نرم‌افزار" },
  { id: 4, label: "سایر" },
];

export function departmentLabel(id) {
  return DEPARTMENTS.find((item) => item.id === Number(id))?.label || "—";
}

export function categoryLabel(id) {
  return CATEGORIES.find((item) => item.id === Number(id))?.label || "—";
}


const DEPARTMENT_TRANSLATIONS = new Map([
  ["finance", "مالی"], ["it", "فناوری اطلاعات"], ["information technology", "فناوری اطلاعات"],
  ["hr", "منابع انسانی"], ["human resources", "منابع انسانی"], ["administration", "اداری و مدیریت"],
  ["management", "اداری و مدیریت"], ["security", "امنیت"], ["customer service", "خدمات مشتریان"],
]);
const CATEGORY_TRANSLATIONS = new Map([
  ["finance", "مالی"], ["hardware", "سخت‌افزار"], ["software", "نرم‌افزار"],
  ["other", "سایر"], ["others", "سایر"],
]);

export function translateDepartment(value, id) {
  const byId = DEPARTMENTS.find((item) => item.id === Number(id));
  if (byId) return byId.label;
  const normalized = String(value ?? "").trim().toLowerCase();
  return DEPARTMENT_TRANSLATIONS.get(normalized) || value || "—";
}

export function translateCategory(value, id) {
  const byId = CATEGORIES.find((item) => item.id === Number(id));
  if (byId) return byId.label;
  const normalized = String(value ?? "").trim().toLowerCase();
  return CATEGORY_TRANSLATIONS.get(normalized) || value || "—";
}
