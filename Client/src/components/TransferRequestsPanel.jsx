import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { translateDepartment } from "../constants/ticketOptions";
import { describeRequestTarget, formatDate } from "../transferText";

// Admin queue: transfer requests sent by experts, waiting for approval.
export default function TransferRequestsPanel({ onChanged }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    try {
      const list = await api("/api/Tickets/transfer-requests/pending");
      setRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function review(request, action, body) {
    setBusyId(request.requestId);
    setError("");
    try {
      await api(`/api/Tickets/transfer-requests/${request.requestId}/${action}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setRejectingId(null);
      setNote("");
      await load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  function reject(request) {
    if (!note.trim()) {
      setError("لطفاً دلیل رد درخواست را بنویسید.");
      return;
    }
    review(request, "reject", { note: note.trim() });
  }

  return (
    <section className="panel panel-create transfer-requests-panel" dir="rtl">
      <div className="row section-heading">
        <h2>درخواست‌های ارجاع در انتظار تأیید</h2>
        <span className="count-badge">{requests.length} درخواست</span>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {loading && <p className="muted">در حال بارگذاری…</p>}
      {!loading && requests.length === 0 && <p className="muted">درخواستی در انتظار بررسی نیست.</p>}

      {requests.map((request) => (
        <article className="request-card" key={request.requestId}>
          <h3>
            T-{request.ticketId} · {request.ticketTitle}
          </h3>
          <p>
            <strong>{request.requestedByUsername}</strong> درخواست {describeRequestTarget(request)}{" "}
            را دارد.
          </p>
          <p className="muted">
            دپارتمان فعلی:{" "}
            {translateDepartment(request.ticketDepartment, request.ticketDepartmentId)} ·{" "}
            {formatDate(request.createdAt)}
          </p>
          <p>دلیل: {request.reason}</p>

          {rejectingId === request.requestId ? (
            <div className="request-reject">
              <label>
                دلیل رد درخواست
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={300}
                  placeholder="دلیل رد را برای کارشناس بنویسید…"
                />
              </label>
              <div className="request-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setRejectingId(null);
                    setNote("");
                    setError("");
                  }}
                  disabled={busyId === request.requestId}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  className="cancel"
                  onClick={() => reject(request)}
                  disabled={busyId === request.requestId}
                >
                  ثبت رد درخواست
                </button>
              </div>
            </div>
          ) : (
            <div className="request-actions">
              <button
                type="button"
                onClick={() => review(request, "approve", { note: null })}
                disabled={busyId === request.requestId}
              >
                {busyId === request.requestId ? "در حال انجام…" : "تأیید و ارجاع"}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setRejectingId(request.requestId);
                  setNote("");
                  setError("");
                }}
                disabled={busyId === request.requestId}
              >
                رد درخواست
              </button>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
