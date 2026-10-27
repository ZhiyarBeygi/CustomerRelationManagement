import { useState } from "react";

// Approve / reject buttons for one request. Rejecting asks the admin for a note first.
export default function RequestReviewActions({
  busy = false,
  approveLabel = "تأیید",
  onApprove,
  onReject,
}) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");

  function submitReject() {
    if (!note.trim()) {
      setNoteError("لطفاً دلیل رد درخواست را بنویسید.");
      return;
    }
    onReject(note.trim());
  }

  if (rejecting) {
    return (
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
        {noteError && (
          <p className="error" role="alert">
            {noteError}
          </p>
        )}
        <div className="request-actions">
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setRejecting(false);
              setNote("");
              setNoteError("");
            }}
            disabled={busy}
          >
            انصراف
          </button>
          <button type="button" className="cancel" onClick={submitReject} disabled={busy}>
            ثبت رد درخواست
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="request-actions">
      <button type="button" onClick={onApprove} disabled={busy}>
        {busy ? "در حال انجام…" : approveLabel}
      </button>
      <button
        type="button"
        className="secondary"
        onClick={() => setRejecting(true)}
        disabled={busy}
      >
        رد درخواست
      </button>
    </div>
  );
}
