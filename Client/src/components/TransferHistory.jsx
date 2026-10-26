import { useEffect, useState } from "react";
import { api } from "../api";
import { translateDepartment } from "../constants/ticketOptions";

function formatDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString("fa-IR") : "نامشخص";
}

function describe(transfer) {
  // A department change (Forward) has two different departments; a HandOff stays in one.
  if (transfer.fromDepartmentId !== transfer.toDepartmentId) {
    const from = translateDepartment(transfer.fromDepartment, transfer.fromDepartmentId);
    const to = translateDepartment(transfer.toDepartment, transfer.toDepartmentId);
    return `ارجاع از دپارتمان ${from} به دپارتمان ${to}`;
  }
  const from = transfer.fromReceiverUsername || "بدون کارشناس";
  return `واگذاری از ${from} به ${transfer.toReceiverUsername || "—"}`;
}

export default function TransferHistory({ ticketId }) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api(`/api/Tickets/${ticketId}/transfers`)
      .then((list) => active && setTransfers(Array.isArray(list) ? list : []))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [ticketId]);

  return (
    <div className="transfer-history">
      <h4>سابقه ارجاع</h4>
      {loading && <p className="muted">در حال بارگذاری…</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && transfers.length === 0 && (
        <p className="muted">برای این تیکت ارجاعی ثبت نشده است.</p>
      )}
      <ul>
        {transfers.map((transfer) => (
          <li key={transfer.transferId}>
            <strong>{describe(transfer)}</strong>
            <small>
              {formatDate(transfer.createdAt)}
              {transfer.transferredByUsername ? ` · توسط ${transfer.transferredByUsername}` : ""}
            </small>
            {transfer.reason && <p>دلیل: {transfer.reason}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
