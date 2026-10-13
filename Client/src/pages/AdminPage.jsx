import { useEffect, useState } from "react";
import { api } from "../api";
import Layout from "../components/Layout";
import TicketCard from "../components/TicketCard";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null); // the user the admin clicked
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api("/api/users"), api("/api/tickets")])
      .then(([u, t]) => {
        setUsers(u);
        setTickets(t);
      })
      .catch((err) => setError(err.message));
  }, []);

  // The API gives us all tickets, so we pick the ones that belong to the clicked user
  const userTickets = selected ? tickets.filter((t) => t.author_id === selected.user_id) : [];

  // "changes" is either { status } or { priority }
  async function updateTicket(ticket, changes) {
    setError("");
    const updated = { ...ticket, ...changes };
    try {
      await api(`/api/tickets/${ticket.ticket_id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: updated.title,
          description: updated.description,
          status: updated.status,
          priority: updated.priority || "Medium",
        }),
      });
      setTickets(tickets.map((t) => (t.ticket_id === ticket.ticket_id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout>
      <h1>Ticket management</h1>
      {error && <p className="error">{error}</p>}

      <div className="split">
        <aside className="panel panel-users">
          <h2>Users</h2>
          {users.map((u) => (
            <button
              key={u.user_id}
              className={"user" + (selected?.user_id === u.user_id ? " active" : "")}
              onClick={() => setSelected(u)}
            >
              {u.username}
              <small>{tickets.filter((t) => t.author_id === u.user_id).length} tickets</small>
            </button>
          ))}
        </aside>

        <section className="panel panel-list">
          {!selected && <p className="muted">Select a user to see their tickets.</p>}
          {selected && <h2>Tickets of {selected.username}</h2>}
          {selected && userTickets.length === 0 && <p className="muted">This user has no tickets.</p>}
          {userTickets.map((t) => (
            <TicketCard key={t.ticket_id} ticket={t} onChange={updateTicket} />
          ))}
        </section>
      </div>
    </Layout>
  );
}
