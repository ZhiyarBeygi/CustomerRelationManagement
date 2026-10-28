import { useEffect, useState } from "react";
import { api } from "../api";
import { DEPARTMENTS } from "../constants/ticketOptions";

// Forward a ticket to another department, or hand it to another expert in the same department.
// With asRequest the form sends a transfer request that the admin must approve.
export default function ForwardForm({ ticket, onForwarded, onCancel, asRequest = false }) {
  const hasDepartment = ticket.departmentId != null;
  const [mode, setMode] = useState("department"); // "department" | "expert"
  const [toDepartmentId, setToDepartmentId] = useState("");
  const [toReceiverId, setToReceiverId] = useState("");
  const [reason, setReason] = useState("");
  const [experts, setExperts] = useState([]);
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const departments = DEPARTMENTS.filter((item) => item.id !== Number(ticket.departmentId));
  const expertsDepartmentId =
    mode === "expert"
      ? ticket.departmentId == null
        ? ""
        : String(ticket.departmentId)
      : !asRequest && toDepartmentId
        ? toDepartmentId
        : "";
  const expertOptions =
    mode === "expert"
      ? experts.filter((expert) => Number(expert.userId) !== Number(ticket.receiverId))
      : experts;

  useEffect(() => {
    let active = true;
    setExperts([]);
    setToReceiverId("");

    if (!expertsDepartmentId) {
      setLoadingExperts(false);
      return () => {
        active = false;
      };
    }

    setLoadingExperts(true);
    api(
      `/api/Tickets/${ticket.ticketId}/experts?departmentId=${encodeURIComponent(expertsDepartmentId)}`
    )
      .then((list) => {
        if (active) setExperts(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (active) {
          setExperts([]);
          setError(err.message || "دریافت فهرست کارشناسان ناموفق بود.");
        }
      })
      .finally(() => {
        if (active) setLoadingExperts(false);
      });

    return () => {
      active = false;
    };
  }, [ticket.ticketId, expertsDepartmentId]);

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (mode === "department" && !toDepartmentId) {
      setError("لطفاً دپارتمان مقصد را انتخاب کنید.");
      return;
    }
    if (mode === "department" && !asRequest && !toReceiverId) {
      setError("لطفاً کارشناس دپارتمان مقصد را انتخاب کنید.");
      return;
    }
    if (mode === "expert" && !toReceiverId) {
      setError("لطفاً کارشناس مقصد را انتخاب کنید.");
      return;
    }
    if (!reason.trim()) {
      setError("لطفاً دلیل ارجاع را بنویسید.");
      return;
    }

    setSubmitting(true);
    try {
      const path = asRequest ? "transfer-requests" : "forward";
      await api(`/api/Tickets/${ticket.ticketId}/${path}`, {
        method: "POST",
        body: JSON.stringify({
          toDepartmentId: mode === "department" ? Number(toDepartmentId) : null,
          toReceiverId:
            mode === "expert" || (mode === "department" && !asRequest)
              ? Number(toReceiverId)
              : null,
          reason: reason.trim(),
        }),
      });
      onForwarded?.();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form className="forward-form" onSubmit={submit}>
      <h4>{asRequest ? "درخواست ارجاع تیکت" : "ارجاع تیکت"}</h4>

      {hasDepartment && (
        <label>
          نوع ارجاع
          <select
            value={mode}
            onChange={(event) => {
              setMode(event.target.value);
              setToDepartmentId("");
              setToReceiverId("");
              setExperts([]);
              setError("");
            }}
          >
            <option value="department">ارجاع به دپارتمان دیگر</option>
            <option value="expert">واگذاری به کارشناس دیگر همین دپارتمان</option>
          </select>
        </label>
      )}

      {mode === "department" && (
        <>
          <label>
            دپارتمان مقصد
            <select
              value={toDepartmentId}
              onChange={(event) => {
                setToDepartmentId(event.target.value);
                setToReceiverId("");
                setExperts([]);
                setError("");
              }}
              required
            >
              <option value="">انتخاب کنید…</option>
              {departments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <p className="muted">
            {asRequest
              ? "پس از تأیید مدیر، تیکت به صف دپارتمان مقصد منتقل می‌شود."
              : "پس از انتخاب دپارتمان، انتخاب یک کارشناس از همان دپارتمان الزامی است. تیکت مستقیماً به او واگذار می‌شود."}
          </p>
        </>
      )}

      {(mode === "expert" || (mode === "department" && !asRequest && Boolean(toDepartmentId))) && (
        <label>
          کارشناس مقصد
          <select
            value={toReceiverId}
            onChange={(event) => setToReceiverId(event.target.value)}
            required
            disabled={loadingExperts || !expertsDepartmentId}
          >
            <option value="">
              {loadingExperts
                ? "در حال دریافت فهرست کارشناسان…"
                : !expertsDepartmentId
                  ? "ابتدا دپارتمان را انتخاب کنید"
                  : expertOptions.length === 0
                    ? "کارشناس واجد شرایطی در این دپارتمان نیست"
                    : "انتخاب کنید…"}
            </option>
            {expertOptions.map((expert) => (
              <option key={expert.userId} value={expert.userId}>
                {expert.username}
              </option>
            ))}
          </select>
        </label>
      )}

      {asRequest && mode === "expert" && (
        <p className="muted">پس از تأیید مدیر، تیکت به کارشناس انتخاب‌شده سپرده می‌شود.</p>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <label>
        دلیل ارجاع
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={300}
          required
          placeholder="دلیل ارجاع را بنویسید…"
        />
      </label>

      <div className="form-actions">
        <button type="button" className="secondary" onClick={onCancel} disabled={submitting}>
          انصراف
        </button>
        <button type="submit" disabled={submitting || loadingExperts}>
          {submitting
            ? asRequest
              ? "در حال ارسال…"
              : "در حال ارجاع…"
            : asRequest
              ? "ارسال درخواست"
              : "ارجاع تیکت"}
        </button>
      </div>
    </form>
  );
}
