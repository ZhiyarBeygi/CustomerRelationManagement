import { translateDepartment } from "./constants/ticketOptions";

export const REQUEST_STATUS_LABELS = {
  Pending: "در انتظار بررسی",
  Approved: "تأیید شد",
  Rejected: "رد شد",
};

export function formatDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString("fa-IR") : "نامشخص";
}

// "to department X" or "to expert Y", depending on what the request asks for.
export function describeRequestTarget(request) {
  if (request.toDepartmentId != null) {
    return `ارجاع به دپارتمان ${translateDepartment(request.toDepartment, request.toDepartmentId)}`;
  }
  return `واگذاری به ${request.toReceiverUsername || "—"}`;
}

export function priorityLabel(priority) {
  const labels = { low: "پایین", medium: "متوسط", high: "بالا" };
  return (
    labels[
      String(priority ?? "")
        .trim()
        .toLowerCase()
    ] ||
    priority ||
    "—"
  );
}

// Notes the database writes by itself when it closes a request automatically.
const SYSTEM_NOTES = {
  "The ticket was closed.": "تیکت بسته شد.",
  "The ticket was moved by another action.": "تیکت با اقدام دیگری جابه‌جا شد.",
};

// "Reviewed by X · note" for a request that is no longer pending.
export function describeReview(request) {
  const who = request.reviewedByUsername
    ? `بررسی توسط ${request.reviewedByUsername}`
    : "بسته‌شدن خودکار توسط سیستم";
  const note = request.reviewNote ? (SYSTEM_NOTES[request.reviewNote] ?? request.reviewNote) : "";
  return note ? `${who} · ${note}` : who;
}
