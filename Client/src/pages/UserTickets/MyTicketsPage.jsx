import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { getUser } from "../../auth";
import Layout from "../../components/Layout";
import TicketCard from "../../components/TicketCard";

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/tickets/mine")
      .then(setTickets)
      .catch((err) => setError(err.message));
  }, []);

  async function handleDelete(ticket) {
    if (!window.confirm("Delete this ticket and all its comments?")) return;
    setError("");
    try {
      await api(`/api/tickets/${ticket.ticket_id}`, { method: "DELETE" });
      setTickets(tickets.filter((t) => t.ticket_id !== ticket.ticket_id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout>
      <div className="row">
        <h1>My tickets</h1>
        <button onClick={() => navigate("/createTicket")}>New ticket</button>
      </div>
      {error && <p className="error">{error}</p>}

      <section className="panel panel-list">
        <h2>Your tickets</h2>
        {tickets.length === 0 && <p className="muted">You have no tickets yet.</p>}
        {tickets.map((t) => (
          <TicketCard key={t.ticket_id} ticket={t} /*onDelete={canDelete ? handleDelete : undefined*/ />
        ))}
      </section>
    </Layout>
  );
}
