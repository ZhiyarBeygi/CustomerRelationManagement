import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import { getUser } from "../../auth";
import Comments from "../../components/Comments";
import { translateDepartment } from "../../constants/ticketOptions";

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s_\-./]+/g, " ");
}

function normalizeStatus(status) {
  return normalizeText(status).replaceAll("-", " ");
}

function statusLabel(status) {
  const key = normalizeStatus(status);
  const labels = {
    pending: "در انتظار",
    "in progress": "در حال انجام",
    done: "بسته‌شده",
    completed: "بسته‌شده",
  };
  return labels[key] || status || "نامشخص";
}

function statusClass(status) {
  const key = normalizeStatus(status);
  if (key === "in progress" || key === "inprogress") return "In-Progress";
  if (key === "done" || key === "completed") return "Done";
  return "Pending";
}

function statusOption(status) {
  const key = normalizeStatus(status);
  if (key === "in progress" || key === "inprogress") return "In Progress";
  if (key === "done" || key === "completed") return "Done";
  return "Pending";
}

function priorityLabel(priority) {
  const labels = { low: "پایین", medium: "متوسط", high: "بالا" };
  return labels[normalizeText(priority)] || priority || "نامشخص";
}

function formatDate(value) {
  if (!value) return "نامشخص";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "نامشخص" : date.toLocaleString("fa-IR");
}

function ticketBelongsToDepartment(ticket, expert) {
  // Prefer IDs; use names only when one side does not provide an ID.
  if (expert.departmentId != null && ticket.departmentId != null) {
    return Number(expert.departmentId) === Number(ticket.departmentId);
  }

  const expertDepartment = normalizeText(expert.department);
  const ticketDepartment = normalizeText(ticket.department);
  return Boolean(expertDepartment && ticketDepartment && expertDepartment === ticketDepartment);
}

export default function ExpertPage() {
  const expert = getUser();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedComments, setExpandedComments] = useState({});
  const [priorityRequestTicketId, setPriorityRequestTicketId] = useState(null);
  const [requestedPriority, setRequestedPriority] = useState("Medium");
  const [priorityReason, setPriorityReason] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  const hasDepartment = expert?.departmentId != null || Boolean(String(expert?.department ?? "").trim());

  const loadTickets = useCallback(async () => {
    if (!expert?.userId) {
      setError("اطلاعات کارشناس در دسترس نیست. لطفاً دوباره وارد شوید.");
      setTickets([]);
      setLoading(false);
      return;
    }

    if (!hasDepartment) {
      setError("برای حساب کارشناس شما دپارتمانی تعیین نشده است. لطفاً از مدیر سیستم بخواهید دپارتمان شما را مشخص کند.");
      setTickets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await api("/api/Tickets");
      setTickets(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message || "دریافت تیکت‌ها ناموفق بود.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [expert?.userId, hasDepartment]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const departmentTickets = useMemo(() => {
    if (!hasDepartment) return [];
    return tickets.filter((ticket) => ticketBelongsToDepartment(ticket, expert));
  }, [tickets, expert, hasDepartment]);

  const visibleTickets = useMemo(() => {
    let result = departmentTickets;
    if (statusFilter !== "all") {
      result = result.filter((ticket) => normalizeStatus(ticket.status) === statusFilter);
    }
    const search = normalizeText(query);
    if (search) {
      result = result.filter((ticket) =>
        [ticket.title, ticket.description, ticket.referenceCode, ticket.authorUsername, ticket.receiverUsername]
          .some((value) => normalizeText(value).includes(search))
      );
    }
    return result;
  }, [departmentTickets, statusFilter, query]);

  async function updateStatus(ticket, nextStatus) {
    setError("");
    try {
      await api(`/api/Tickets/${ticket.ticketId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: ticket.title,
          description: ticket.description,
          status: nextStatus,
          priority: ticket.priority || "Medium",
          categoryId: ticket.categoryId ?? null,
          departmentId: ticket.departmentId ?? null,
          receiverId: ticket.receiverId ?? null,
        }),
      });
      setTickets((current) => current.map((item) =>
        item.ticketId === ticket.ticketId ? { ...item, status: nextStatus } : item
      ));
    } catch (err) {
      setError(err.message || "به‌روزرسانی وضعیت تیکت ناموفق بود.");
    }
  }

  function beginPriorityRequest(ticket) {
    setPriorityRequestTicketId(ticket.ticketId);
    setRequestedPriority(ticket.priority || "Medium");
    setPriorityReason("");
    setRequestMessage("");
  }

  async function submitPriorityRequest(e, ticket) {
    e.preventDefault();
    setError("");
    setRequestMessage("");
    if (!priorityReason.trim()) {
      setError("لطفاً دلیل درخواست تغییر اولویت را بنویسید.");
      return;
    }
    if (requestedPriority === ticket.priority) {
      setError("اولویت درخواستی با اولویت فعلی یکسان است.");
      return;
    }

    setSubmittingRequest(true);
    try {
      // The backend currently has no dedicated priority-approval endpoint.
      // Save the request as an internal comment visible to support staff/admins.
      await api("/api/Comments", {
        method: "POST",
        body: JSON.stringify({
          title: `درخواست تغییر اولویت به ${priorityLabel(requestedPriority)}`,
          description: `کارشناس درخواست تغییر اولویت این تیکت را ثبت کرده است.\nاولویت فعلی: ${priorityLabel(ticket.priority)}\nاولویت درخواستی: ${priorityLabel(requestedPriority)}\nدلیل درخواست: ${priorityReason.trim()}`,
          authorId: expert.userId,
          ticketId: ticket.ticketId,
          isInternal: true,
        }),
      });
      setRequestMessage("درخواست اولویت برای بررسی مدیر ثبت شد.");
      setPriorityRequestTicketId(null);
      setPriorityReason("");
      setExpandedComments((current) => ({ ...current, [ticket.ticketId]: true }));
    } catch (err) {
      setError(err.message || "ثبت درخواست تغییر اولویت ناموفق بود.");
    } finally {
      setSubmittingRequest(false);
    }
  }

  return (
    <div className="expert-page" dir="rtl">
      <div className="row page-title-row">
        <div>
          <h1>صف کارشناسی</h1>
          <p className="muted">
            {hasDepartment
              ? `تیکت‌های دپارتمان شما: ${translateDepartment(expert?.department, expert?.departmentId)}`
              : "حساب شما دپارتمان ندارد."}
          </p>
        </div>
        <button type="button" onClick={loadTickets} disabled={loading}>به‌روزرسانی</button>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {requestMessage && <p className="success-message" role="status">{requestMessage}</p>}

      {!hasDepartment && !loading && (
        <section className="panel">
          <h2>دپارتمان تعیین نشده است</h2>
          <p>برای جلوگیری از نمایش تیکت‌های دپارتمان‌های دیگر، تا زمان تعیین دپارتمان هیچ تیکتی نمایش داده نمی‌شود.</p>
        </section>
      )}

      {hasDepartment && (
        <section className="panel panel-list">
          <div className="row section-heading">
            <h2>تیکت‌های دپارتمان من</h2>
            <span className="count-badge">{visibleTickets.length} تیکت</span>
          </div>

          <div className="ticket-filters">
            <label>جست‌وجو
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="عنوان، شرح یا کد تیکت…" />
            </label>
            <label>وضعیت
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">همه وضعیت‌ها</option>
                <option value="pending">در انتظار</option>
                <option value="in progress">در حال انجام</option>
                <option value="done">بسته‌شده</option>
              </select>
            </label>
          </div>

          {loading && <p className="muted">در حال بارگذاری تیکت‌ها…</p>}
          {!loading && visibleTickets.length === 0 && !error && (
            <p className="muted">تیکتی در دپارتمان شما با این فیلترها پیدا نشد.</p>
          )}

          {visibleTickets.map((ticket) => (
            <article className={`card ticket ${statusClass(ticket.status)}`} key={ticket.ticketId}>
              <div className="row ticket-heading">
                <div className="ticket-title-block">
                  <h3>{ticket.referenceCode ? `${ticket.referenceCode} · ` : ""}{ticket.title}</h3>
                  {ticket.authorUsername && <small>ثبت‌کننده: {ticket.authorUsername}</small>}
                </div>
                <span className={`badge ${statusClass(ticket.status)}`}>{statusLabel(ticket.status)}</span>
              </div>

              <p className="ticket-description">{ticket.description}</p>

              <div className="ticket-meta">
                <span><strong>اولویت:</strong> {priorityLabel(ticket.priority)}</span>
                <span><strong>دپارتمان:</strong> {translateDepartment(ticket.department, ticket.departmentId)}</span>
                {ticket.category && <span><strong>دسته‌بندی:</strong> {ticket.category}</span>}
                {ticket.receiverUsername && <span><strong>کارشناس مسئول:</strong> {ticket.receiverUsername}</span>}
                <span><strong>تاریخ ثبت:</strong> {formatDate(ticket.createdAt)}</span>
              </div>

              <div className="expert-ticket-actions">
                <label>به‌روزرسانی وضعیت
                  <select value={statusOption(ticket.status)} onChange={(e) => updateStatus(ticket, e.target.value)}>
                    <option value="Pending">در انتظار</option>
                    <option value="In Progress">در حال انجام</option>
                    <option value="Done">بسته‌شده</option>
                  </select>
                </label>
                <button type="button" className="secondary" onClick={() => beginPriorityRequest(ticket)}>
                  درخواست تغییر اولویت
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setExpandedComments((current) => ({ ...current, [ticket.ticketId]: !current[ticket.ticketId] }))}
                >
                  {expandedComments[ticket.ticketId] ? "بستن دیدگاه‌ها" : "دیدگاه‌ها و افزودن دیدگاه"}
                </button>
              </div>

              {priorityRequestTicketId === ticket.ticketId && (
                <form className="priority-request-form" onSubmit={(e) => submitPriorityRequest(e, ticket)}>
                  <h4>درخواست تغییر اولویت برای مدیر</h4>
                  <label>اولویت پیشنهادی
                    <select value={requestedPriority} onChange={(e) => setRequestedPriority(e.target.value)} required>
                      <option value="Low">پایین</option>
                      <option value="Medium">متوسط</option>
                      <option value="High">بالا</option>
                    </select>
                  </label>
                  <label>دلیل درخواست
                    <textarea value={priorityReason} onChange={(e) => setPriorityReason(e.target.value)} maxLength={300} required placeholder="دلیل نیاز به تغییر اولویت را بنویسید…" />
                  </label>
                  <div className="form-actions">
                    <button type="button" className="secondary" onClick={() => setPriorityRequestTicketId(null)} disabled={submittingRequest}>انصراف</button>
                    <button type="submit" disabled={submittingRequest}>
                      {submittingRequest ? "در حال ثبت درخواست…" : "ارسال درخواست به مدیر"}
                    </button>
                  </div>
                </form>
              )}

              {expandedComments[ticket.ticketId] && <Comments ticketId={ticket.ticketId} />}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
