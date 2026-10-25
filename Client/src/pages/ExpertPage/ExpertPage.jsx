import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import { getUser } from "../../auth";
import Comments from "../../components/Comments";
import { translateDepartment } from "../../constants/ticketOptions";

const normalize = (value) => String(value ?? "").normalize("NFKC").trim().toLowerCase().replace(/[\s_\-./]+/g, " ");

function statusKey(value) {
  return normalize(value);
}

function statusLabel(status) {
  const labels = {
    pending: "در انتظار",
    "in progress": "در حال انجام",
    inprogress: "در حال انجام",
    done: "بسته‌شده",
    completed: "بسته‌شده",
  };
  return labels[statusKey(status)] || status || "نامشخص";
}

function statusClass(status) {
  const key = statusKey(status);
  if (key === "in progress" || key === "inprogress") return "In-Progress";
  if (key === "done" || key === "completed") return "Done";
  return "Pending";
}

function priorityLabel(priority) {
  return ({ low: "پایین", medium: "متوسط", high: "بالا" })[normalize(priority)] || priority || "نامشخص";
}

function formatDate(value) {
  if (!value) return "نامشخص";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "نامشخص" : date.toLocaleString("fa-IR");
}

function belongsToDepartment(ticket, expert) {
  return expert?.departmentId != null && ticket?.departmentId != null &&
    Number(expert.departmentId) === Number(ticket.departmentId);
}

export default function ExpertPage() {
  const expert = getUser();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedComments, setExpandedComments] = useState({});
  const [requestTicketId, setRequestTicketId] = useState(null);
  const [requestedPriority, setRequestedPriority] = useState("Medium");
  const [priorityReason, setPriorityReason] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [message, setMessage] = useState("");

  const hasDepartment = expert?.departmentId != null && Number.isInteger(Number(expert.departmentId)) && Number(expert.departmentId) > 0;

  const loadTickets = useCallback(async () => {
    if (!expert?.userId) {
      setTickets([]);
      setError("اطلاعات کارشناس در دسترس نیست. لطفاً دوباره وارد شوید.");
      setLoading(false);
      return;
    }

    if (!hasDepartment) {
      setTickets([]);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await api("/api/Tickets");
      setTickets(Array.isArray(result) ? result.filter((ticket) => belongsToDepartment(ticket, expert)) : []);
    } catch (err) {
      setTickets([]);
      setError(err.message || "دریافت تیکت‌ها ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, [expert?.userId, expert?.departmentId, expert?.department, hasDepartment]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const visibleTickets = useMemo(() => {
    const search = normalize(query);
    return tickets.filter((ticket) => {
      if (statusFilter !== "all" && statusKey(ticket.status) !== statusFilter) return false;
      if (!search) return true;
      return [ticket.title, ticket.description, ticket.referenceCode, ticket.authorUsername, ticket.receiverUsername]
        .some((value) => normalize(value).includes(search));
    });
  }, [tickets, query, statusFilter]);

  function beginPriorityRequest(ticket) {
    setRequestTicketId(ticket.ticketId);
    setRequestedPriority(ticket.priority || "Medium");
    setPriorityReason("");
    setMessage("");
    setError("");
  }

  async function submitPriorityRequest(event, ticket) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!priorityReason.trim()) {
      setError("لطفاً دلیل درخواست تغییر اولویت را بنویسید.");
      return;
    }
    if (normalize(requestedPriority) === normalize(ticket.priority)) {
      setError("اولویت پیشنهادی با اولویت فعلی یکسان است.");
      return;
    }

    setSubmittingRequest(true);
    try {
      await api("/api/Comments", {
        method: "POST",
        body: JSON.stringify({
          title: `درخواست تغییر اولویت به ${priorityLabel(requestedPriority)}`,
          description: `اولویت فعلی: ${priorityLabel(ticket.priority)}\nاولویت پیشنهادی: ${priorityLabel(requestedPriority)}\nدلیل درخواست: ${priorityReason.trim()}`,
          authorId: expert.userId,
          ticketId: ticket.ticketId,
          isInternal: true,
        }),
      });
      setRequestTicketId(null);
      setPriorityReason("");
      setMessage("درخواست تغییر اولویت برای بررسی مدیر ثبت شد.");
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
              ? `تیکت‌های دپارتمان شما: ${translateDepartment(expert.department, expert.departmentId)}`
              : "برای حساب کاربری شما دپارتمانی تعیین نشده است."}
          </p>
        </div>
        <button type="button" onClick={loadTickets} disabled={loading}>به‌روزرسانی</button>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {message && <p className="success-message" role="status">{message}</p>}

      {!hasDepartment && (
        <section className="panel">
          <h2>دپارتمان تعیین نشده است</h2>
          <p>تا زمانی که مدیر سیستم دپارتمان شما را مشخص نکند، تیکتی نمایش داده نمی‌شود.</p>
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
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="عنوان، شرح یا کد تیکت…" />
            </label>
            <label>فیلتر وضعیت
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">همه وضعیت‌ها</option>
                <option value="pending">در انتظار</option>
                <option value="in progress">در حال انجام</option>
                <option value="done">بسته‌شده</option>
              </select>
            </label>
          </div>

          {loading && <p className="muted">در حال بارگذاری تیکت‌ها…</p>}
          {!loading && visibleTickets.length === 0 && !error && <p className="muted">تیکتی در دپارتمان شما با این فیلترها پیدا نشد.</p>}

          {visibleTickets.map((ticket) => (
            <article className={`card ticket ${statusClass(ticket.status)}`} key={ticket.ticketId}>
              <div className="row ticket-heading">
                <div className="ticket-title-block">
                  <h3>{ticket.referenceCode ? `${ticket.referenceCode} · ` : ""}{ticket.title}</h3>
                  {ticket.authorUsername && <small>ثبت‌کننده: {ticket.authorUsername}</small>}
                </div>
                <span className={`badge ${statusClass(ticket.status)}`} dir="rtl">{statusLabel(ticket.status)}</span>
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

              {requestTicketId === ticket.ticketId && (
                <form className="priority-request-form" onSubmit={(event) => submitPriorityRequest(event, ticket)}>
                  <h4>درخواست تغییر اولویت برای مدیر</h4>
                  <p className="muted">این انتخاب اولویت تیکت را تغییر نمی‌دهد؛ فقط پیشنهاد شما را برای بررسی مدیر ثبت می‌کند.</p>
                  <label>اولویت پیشنهادی
                    <select value={requestedPriority} onChange={(event) => setRequestedPriority(event.target.value)} required>
                      <option value="Low">پایین</option>
                      <option value="Medium">متوسط</option>
                      <option value="High">بالا</option>
                    </select>
                  </label>
                  <label>دلیل درخواست
                    <textarea value={priorityReason} onChange={(event) => setPriorityReason(event.target.value)} maxLength={300} required placeholder="دلیل نیاز به تغییر اولویت را بنویسید…" />
                  </label>
                  <div className="form-actions">
                    <button type="button" className="secondary" onClick={() => setRequestTicketId(null)} disabled={submittingRequest}>انصراف</button>
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
