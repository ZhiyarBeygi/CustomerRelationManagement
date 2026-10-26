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
