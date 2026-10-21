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

  useEffect(() => {
    api(`/api/Tickets/author/${user.userId}`)
      .then(setTickets)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user.userId]);

  return (
    <>
      <div className="row">
        <h1>تیکت‌های شما</h1>
        <button onClick={() => navigate("/createTicket")}>تیکت جدید</button>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <section className="panel panel-list">
        {loading && <p className="muted">در حال برگذاری…</p>}
        {!loading && tickets.length === 0 && !error && <p className="muted">شما تیکتی ندارید.</p>}
        {tickets.map((ticket) => (
          <TicketCard key={ticket.ticketId} ticket={ticket} />
        ))}
      </section>
    </>
  );
}