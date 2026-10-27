import { useEffect, useState } from "react";
import { api } from "../api";
import { translateDepartment } from "../constants/ticketOptions";
import {
  REQUEST_STATUS_LABELS,
  describeRequestTarget,
  describeReview,
  formatDate,
  priorityLabel,
} from "../transferText";

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

// showRequests (staff only) also lists the transfer requests made for this ticket.
export default function TransferHistory({ ticketId, showRequests = false }) {
  const [transfers, setTransfers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [priorityRequests, setPriorityRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const calls = [api(`/api/Tickets/${ticketId}/transfers`)];
    if (showRequests) {
      calls.push(api(`/api/Tickets/${ticketId}/transfer-requests`));
      calls.push(api(`/api/Tickets/${ticketId}/priority-requests`));
    }
    Promise.all(calls)
      .then(([transferList, requestList, priorityList]) => {
        if (!active) return;
        setTransfers(Array.isArray(transferList) ? transferList : []);
        setRequests(Array.isArray(requestList) ? requestList : []);
        setPriorityRequests(Array.isArray(priorityList) ? priorityList : []);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [ticketId, showRequests]);

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

      {showRequests && requests.length > 0 && (
        <>
          <h4>درخواست‌های ارجاع</h4>
          <ul>
            {requests.map((request) => (
              <li key={request.requestId}>
                <strong>
                  {describeRequestTarget(request)}{" "}
                  <span className={`badge ${request.status}`}>
                    {REQUEST_STATUS_LABELS[request.status] || request.status}
                  </span>
                </strong>
                <small>
                  {formatDate(request.createdAt)} · توسط {request.requestedByUsername}
                </small>
                <p>دلیل: {request.reason}</p>
                {request.status !== "Pending" && <p>{describeReview(request)}</p>}
              </li>
            ))}
          </ul>
        </>
      )}

      {showRequests && priorityRequests.length > 0 && (
        <>
          <h4>درخواست‌های تغییر اولویت</h4>
          <ul>
            {priorityRequests.map((request) => (
              <li key={request.requestId}>
                <strong>
                  تغییر اولویت از «{priorityLabel(request.currentPriority)}» به «
                  {priorityLabel(request.requestedPriority)}»{" "}
                  <span className={`badge ${request.status}`}>
                    {REQUEST_STATUS_LABELS[request.status] || request.status}
                  </span>
                </strong>
                <small>
                  {formatDate(request.createdAt)} · توسط {request.requestedByUsername}
                </small>
                <p>دلیل: {request.reason}</p>
                {request.status !== "Pending" && <p>{describeReview(request)}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
