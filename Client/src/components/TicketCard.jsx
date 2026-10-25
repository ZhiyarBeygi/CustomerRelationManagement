import { useState } from "react";
import Comments from "./Comments";
import {
  CATEGORIES,
  DEPARTMENTS,
  translateCategory,
  translateDepartment,
} from "../constants/ticketOptions";

function normalizeStatus(status) {
  return String(status || "Pending")
    .trim()
    .toLowerCase()
    .replaceAll("-", " ");
}

function statusClass(status) {
  const normalized = normalizeStatus(status);
  if (normalized === "in progress" || normalized === "inprogress") return "In-Progress";
  if (normalized === "done" || normalized === "completed") return "Done";
  return "Pending";
}

function statusLabel(status) {
  const labels = {
    pending: "در انتظار",
    "in progress": "در حال انجام",
    done: "بسته‌شده",
    completed: "بسته‌شده",
  };
  return labels[normalizeStatus(status)] || status || "نامشخص";
}

function statusOptionValue(status) {
  const normalized = normalizeStatus(status);
  if (normalized === "pending") return "Pending";
  if (normalized === "in progress" || normalized === "inprogress") return "In Progress";
  if (normalized === "done" || normalized === "completed") return "Done";
  return status || "Pending";
}

function priorityLabel(priority) {
  const labels = { low: "پایین", medium: "متوسط", high: "بالا" };
  return (
    labels[
      String(priority || "")
        .trim()
        .toLowerCase()
    ] ||
    priority ||
    "—"
  );
}

function formatDate(value) {
  if (!value) return "نامشخص";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "نامشخص" : date.toLocaleString("fa-IR");
}

export default function TicketCard({
  ticket,
  onChange,
  canEditContent = false,
  canManageFields = false,
  experts = [],
}) {
  const [showComments, setShowComments] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [editTitle, setEditTitle] = useState(ticket.title || "");
  const [editDescription, setEditDescription] = useState(ticket.description || "");
  const [savingContent, setSavingContent] = useState(false);
  const [actionError, setActionError] = useState("");
  const status = ticket.status || "Pending";
  const statusCss = statusClass(status);

  async function saveContent(e) {
    e.preventDefault();
    if (!editTitle.trim() || !editDescription.trim()) return;

    setSavingContent(true);
    setActionError("");
    try {
      const succeeded = await onChange?.(ticket, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      if (succeeded !== false) setEditingContent(false);
    } catch (err) {
      setActionError(err.message || "ذخیره تغییرات انجام نشد.");
    } finally {
      setSavingContent(false);
    }
  }

  function updateField(changes) {
    setActionError("");
    onChange?.(ticket, changes);
  }

  return (
    <article className={`card ticket ${statusCss}`} dir="rtl">
      <div className="row ticket-heading">
        <div className="ticket-title-block">
          {editingContent ? (
            <form className="ticket-content-editor" onSubmit={saveContent}>
              <label>
                عنوان تیکت
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={100}
                  required
                />
              </label>
              <label>
                شرح تیکت
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  maxLength={500}
                  required
                />
              </label>
              <div className="card-actions">
                <button type="submit" disabled={savingContent}>
                  {savingContent ? "در حال ذخیره…" : "ذخیره تغییرات"}
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setEditingContent(false);
                    setEditTitle(ticket.title || "");
                    setEditDescription(ticket.description || "");
                  }}
                >
                  انصراف
                </button>
              </div>
            </form>
          ) : (
            <>
              <h3>
                {ticket.referenceCode ? `${ticket.referenceCode} · ` : ""}
                {ticket.title}
              </h3>
              {ticket.authorUsername && <small>ثبت‌کننده: {ticket.authorUsername}</small>}
            </>
          )}
        </div>

        {canManageFields && onChange ? (
          <div className="ticket-controls">
            <label>
              اولویت
              <select
                aria-label="اولویت"
                value={ticket.priority || "Medium"}
                onChange={(e) => updateField({ priority: e.target.value })}
              >
                <option value="Low">پایین</option>
                <option value="Medium">متوسط</option>
                <option value="High">بالا</option>
              </select>
            </label>
            <label>
              وضعیت
              <select
                aria-label="وضعیت"
                value={statusOptionValue(status)}
                onChange={(e) => updateField({ status: e.target.value })}
              >
                <option value="Pending">در انتظار</option>
                <option value="In Progress">در حال انجام</option>
                <option value="Done">بسته‌شده</option>
              </select>
            </label>
            <label>
              دپارتمان
              <select
                aria-label="دپارتمان"
                value={ticket.departmentId ?? ""}
                onChange={(e) =>
                  updateField({
                    departmentId: e.target.value ? Number(e.target.value) : null,
                    department:
                      DEPARTMENTS.find((d) => d.id === Number(e.target.value))?.label ?? null,
                  })
                }
              >
                <option value="">بدون دپارتمان</option>
                {DEPARTMENTS.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              دسته‌بندی
              <select
                aria-label="دسته‌بندی"
                value={ticket.categoryId ?? ""}
                onChange={(e) =>
                  updateField({
                    categoryId: e.target.value ? Number(e.target.value) : null,
                    category:
                      CATEGORIES.find((c) => c.id === Number(e.target.value))?.label ?? null,
                  })
                }
              >
                <option value="">بدون دسته‌بندی</option>
                {CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            {experts.length > 0 && (
              <label>
                کارشناس مسئول
                <select
                  aria-label="کارشناس مسئول"
                  value={ticket.receiverId ?? ""}
                  onChange={(e) =>
                    updateField({
                      receiverId: e.target.value ? Number(e.target.value) : null,
                      receiverUsername:
                        experts.find((expert) => expert.userId === Number(e.target.value))
                          ?.username ?? null,
                    })
                  }
                >
                  <option value="">تعیین نشده</option>
                  {experts.map((expert) => (
                    <option key={expert.userId} value={expert.userId}>
                      {expert.username}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        ) : (
          <span className={`badge ${statusCss}`} dir="rtl">
            {statusLabel(status)}
          </span>
        )}
      </div>

      {!editingContent && <p className="ticket-description">{ticket.description}</p>}

      <div className="ticket-meta">
        <span>
          <strong>اولویت:</strong> {priorityLabel(ticket.priority)}
        </span>
        <span>
          <strong>وضعیت:</strong> {statusLabel(status)}
        </span>
        <span>
          <strong>تاریخ ثبت:</strong> {formatDate(ticket.createdAt)}
        </span>
        {(ticket.category || ticket.categoryId) && (
          <span>
            <strong>دسته‌بندی:</strong> {translateCategory(ticket.category, ticket.categoryId)}
          </span>
        )}
        {(ticket.department || ticket.departmentId) && (
          <span>
            <strong>دپارتمان:</strong> {translateDepartment(ticket.department, ticket.departmentId)}
          </span>
        )}
        {ticket.receiverUsername && (
          <span>
            <strong>کارشناس مسئول:</strong> {ticket.receiverUsername}
          </span>
        )}
      </div>

      {actionError && (
        <p className="error" role="alert">
          {actionError}
        </p>
      )}

      <div className="card-actions">
        <button
          type="button"
          className="secondary comments-toggle"
          onClick={() => setShowComments((current) => !current)}
        >
          {showComments ? "بستن دیدگاه‌ها" : "دیدگاه‌ها"}
        </button>
        {canEditContent && onChange && !editingContent && (
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setEditTitle(ticket.title || "");
              setEditDescription(ticket.description || "");
              setEditingContent(true);
            }}
          >
            ویرایش متن تیکت
          </button>
        )}
      </div>

      {showComments && <Comments ticketId={ticket.ticketId} />}
    </article>
  );
}
