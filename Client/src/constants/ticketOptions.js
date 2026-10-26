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
  // IT
  { id: 2, label: "سخت‌افزار", departmentId: 1 }, // Hardware
  { id: 3, label: "نرم‌افزار", departmentId: 1 }, // Software
  { id: 5, label: "شبکه و اینترنت", departmentId: 1 }, // Network & Internet
  { id: 6, label: "ایمیل و حساب کاربری", departmentId: 1 }, // Email & Accounts
  // Finance
  { id: 1, label: "مالی", departmentId: 2 }, // Financial
  { id: 7, label: "حقوق و دستمزد", departmentId: 2 }, // Payroll
  { id: 8, label: "فاکتور و پرداخت", departmentId: 2 }, // Invoices & Payments
  // HR
  { id: 9, label: "مرخصی و حضور و غیاب", departmentId: 3 }, // Leave & Attendance
  { id: 10, label: "قرارداد و مزایا", departmentId: 3 }, // Contracts & Benefits
  // Management
  { id: 11, label: "خرید و تدارکات", departmentId: 8 }, // Purchases & Supplies
  { id: 12, label: "امکانات و تعمیرات", departmentId: 8 }, // Facilities & Maintenance
  // Security
  { id: 13, label: "حادثه امنیتی", departmentId: 9 }, // Security Incident
  { id: 14, label: "دسترسی فیزیکی", departmentId: 9 }, // Physical Access
  // Customer Service (CRM)
  { id: 15, label: "شکایت مشتری", departmentId: 10 }, // Customer Complaint
  { id: 16, label: "مشکل حساب مشتری", departmentId: 10 }, // Customer Account Issue
  // No default department
  { id: 4, label: "سایر", departmentId: null }, // Other
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
  ["network & internet", "شبکه و اینترنت"],
  ["email & accounts", "ایمیل و حساب کاربری"],
  ["payroll", "حقوق و دستمزد"],
  ["invoices & payments", "فاکتور و پرداخت"],
  ["leave & attendance", "مرخصی و حضور و غیاب"],
  ["contracts & benefits", "قرارداد و مزایا"],
  ["purchases & supplies", "خرید و تدارکات"],
  ["facilities & maintenance", "امکانات و تعمیرات"],
  ["security incident", "حادثه امنیتی"],
  ["physical access", "دسترسی فیزیکی"],
  ["customer complaint", "شکایت مشتری"],
  ["customer account issue", "مشکل حساب مشتری"],
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
