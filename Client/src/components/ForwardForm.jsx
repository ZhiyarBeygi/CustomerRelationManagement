import { useEffect, useState } from "react";
import { api } from "../api";
import { DEPARTMENTS } from "../constants/ticketOptions";

// Forward a ticket to another department, or hand it to another expert in the same department.
export default function ForwardForm({ ticket, onForwarded, onCancel }) {
  const hasDepartment = ticket.departmentId != null;
  const [mode, setMode] = useState("department"); // "department" | "expert"
  const [toDepartmentId, setToDepartmentId] = useState("");
  const [toReceiverId, setToReceiverId] = useState("");
  const [reason, setReason] = useState("");
  const [experts, setExperts] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const departments = DEPARTMENTS.filter((item) => item.id !== Number(ticket.departmentId));
  const otherExperts = experts.filter((expert) => expert.userId !== ticket.receiverId);

  useEffect(() => {
    if (!hasDepartment) return undefined;
    let active = true;
    api(`/api/Tickets/${ticket.ticketId}/experts`)
      .then((list) => active && setExperts(Array.isArray(list) ? list : []))
      .catch(() => active && setExperts([]));
    return () => {
      active = false;
    };
  }, [ticket.ticketId, hasDepartment]);

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (mode === "department" && !toDepartmentId) {
      setError("لطفاً دپارتمان مقصد را انتخاب کنید.");
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
      await api(`/api/Tickets/${ticket.ticketId}/forward`, {
        method: "POST",
        body: JSON.stringify({
          toDepartmentId: mode === "department" ? Number(toDepartmentId) : null,
          toReceiverId: mode === "expert" ? Number(toReceiverId) : null,
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
      <h4>ارجاع تیکت</h4>

      {hasDepartment && (
        <label>
          نوع ارجاع
          <select value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="department">ارجاع به دپارتمان دیگر</option>
            <option value="expert">واگذاری به کارشناس دیگر همین دپارتمان</option>
          </select>
        </label>
      )}

      {mode === "department" ? (
        <>
          <label>
            دپارتمان مقصد
            <select
              value={toDepartmentId}
              onChange={(event) => setToDepartmentId(event.target.value)}
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
            تیکت به صف دپارتمان مقصد می‌رود، کارشناس مسئول برداشته می‌شود و وضعیت آن به «در انتظار»
            برمی‌گردد.
          </p>
        </>
      ) : (
        <label>
          کارشناس مقصد
          <select value={toReceiverId} onChange={(event) => setToReceiverId(event.target.value)}>
            <option value="">
              {otherExperts.length === 0 ? "کارشناس دیگری در این دپارتمان نیست" : "انتخاب کنید…"}
            </option>
            {otherExperts.map((expert) => (
              <option key={expert.userId} value={expert.userId}>
                {expert.username}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        دلیل ارجاع
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={300}
          placeholder="دلیل ارجاع را بنویسید…"
        />
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button type="button" className="secondary" onClick={onCancel} disabled={submitting}>
          انصراف
        </button>
        <button type="submit" disabled={submitting}>
          {submitting ? "در حال ارجاع…" : "ارجاع تیکت"}
        </button>
      </div>
    </form>
  );
}
