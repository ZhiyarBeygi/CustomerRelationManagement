import { useState } from "react";
import Comments from "./Comments";

function statusClass(status) {
  const normalized = String(status || "Pending").trim().toLowerCase();
  if (normalized === "in progress" || normalized === "in-progress" || normalized === "inprogress") return "In-Progress";
  if (normalized === "done" || normalized === "completed") return "Done";
  return "Pending";
}

function statusBadge(status) {
  const labels = {
    "pending": "در انتظار",
    "in progress": "در حال انجام",
    "done": "تکمیل شده"
  };

  return labels[String(status || "").trim().toLowerCase()] || status || "—";
}

function formatDate(value) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString();
}
function priorityLabel(priority){
  const labels = {
    high: "بالا",
    medium: "متوسط",
    low: "پایین"
  }

  return labels[String(priority || "").toLowerCase()] || priority || "—";
}

export default function TicketCard({ ticket, onChange }) {
  const [showComments, setShowComments] = useState(false);
  const status = ticket.status || "Pending";
  const statusCss = statusClass(status);



  return (
    <article className={`card ticket ${statusCss}`}>
      <div className="row ticket-heading">
        <div>
          <h3>{ticket.referenceCode ? `${ticket.referenceCode} · ` : ""}{ticket.title}</h3>
          {ticket.authorUsername && <small>نویسنده:  {ticket.authorUsername}</small>}
        </div>
        {onChange ? (
          <div className="row ticket-controls">
            <select
              aria-label="Priority"
              value={ticket.priority || "Medium"}
              onChange={(e) => onChange(ticket, { priority: e.target.value })}
            >
              <option value="Low">پایین</option>
              <option value="Medium">متوسط</option>
              <option value="High">بالا</option>
            </select>
            <select
              aria-label="Status"
              value={status}
              onChange={(e) => onChange(ticket, { status: e.target.value })}
            >
              <option value="Pending">در انتظار تائید</option>
              <option value="In Progress">در حال انجام</option>
              <option value="Done">بسته شده</option>
            </select>
          </div>
        ) : (
          <span className={`badge ${statusCss}`} dir="rtl">
            {statusBadge(status)}
          </span>        )}
      </div>

      <p>{ticket.description}</p>
      <small>
        {!onChange && 
        (<span 
          dir="rtl" style={{ unicodeBidi: "isolate" }}> اولویت: <bdi dir="rtl">{priorityLabel(ticket.priority)}</bdi>
          {" · "}
        </span>
  )}        ساخته شده: {formatDate(ticket.createdAt)}
        {ticket.category ? ` · دسته‌بندی: ${ticket.category}` : ""}
        {ticket.department ? ` · دپارتمنت: ${ticket.department}` : ""}
        {ticket.receiverUsername ? ` · مسئول: ${ticket.receiverUsername}` : ""}
      </small>

      <div className="card-actions">
        <button className="secondary comments-toggle" onClick={() => setShowComments((current) => !current)}>
          {showComments ? "Hide comments" : "کامنت‌ها"}
        </button>
      </div>
      {showComments && <Comments ticketId={ticket.ticketId} />}
    </article>
  );
}
