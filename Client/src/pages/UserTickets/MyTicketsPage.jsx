import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { getUser } from "../../auth";
import TicketCard from "../../components/TicketCard";

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadTickets() {
    setLoading(true);
    setError("");
    try {
      const result = await api(`/api/Tickets/author/${user.userId}`);
      setTickets(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [user.userId]);

  // An author can only change the text of their own ticket (and only while it is pending).
  async function updateTicket(ticket, changes) {
    setError("");
    const title = changes.title ?? ticket.title;
    const description = changes.description ?? ticket.description;
    try {
      await api(`/api/Tickets/${ticket.ticketId}/content`, {
        method: "PUT",
        body: JSON.stringify({ title, description }),
      });
      setTickets((current) =>
        current.map((item) =>
          item.ticketId === ticket.ticketId ? { ...item, title, description } : item
        )
      );
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  return (
    <div dir="rtl">
      <div className="row page-title-row">
        <h1>تیکت‌های من</h1>
        <button onClick={() => navigate("/createTicket")}>ثبت تیکت جدید</button>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <section className="panel panel-list">
        <h2>درخواست‌های ثبت‌شده</h2>
        {loading && <p className="muted">در حال بارگذاری تیکت‌ها…</p>}
        {!loading && tickets.length === 0 && !error && (
          <p className="muted">هنوز تیکتی ثبت نکرده‌اید.</p>
        )}
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.ticketId}
            ticket={ticket}
            onChange={updateTicket}
            canEditContent
          />
        ))}
      </section>
    </div>
  );
}
