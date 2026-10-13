import { useState } from "react";
import Comments from "./Comments";

// Shows one ticket. If onChange is given (admin page), status and priority become dropdowns.
// If onDelete is given (user page), a Delete button is shown.
export default function TicketCard({ ticket, onChange, onDelete }) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className={"card ticket " + ticket.status.replace(" ", "-")}>
      <div className="row">
        <h3>{ticket.title}</h3>
        {onChange ? (
          <div className="row">
            <select
              aria-label="Priority"
              value={ticket.priority || "Medium"}
              onChange={(e) => onChange(ticket, { priority: e.target.value })}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <select
              aria-label="Status"
              value={ticket.status}
              onChange={(e) => onChange(ticket, { status: e.target.value })}
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </div>
        ) : (
          <span className={"badge " + ticket.status.replace(" ", "-")}>{ticket.status}</span>
        )}
      </div>
      <p>{ticket.description}</p>
      <small>
        {onChange ? "" : `Priority: ${ticket.priority || "-"} | `}Opened {new Date(ticket.created_at).toLocaleString()}
      </small>

      <div className="card-actions">
        <button className="secondary comments-toggle" onClick={() => setShowComments(!showComments)}>
          {showComments ? "Hide comments" : "Comments"}
        </button>
        {onDelete && (
          <button className="danger comments-toggle" onClick={() => onDelete(ticket)}>Delete ticket</button>
        )}
      </div>
      {showComments && <Comments ticketId={ticket.ticket_id} />}
    </div>
  );
}
