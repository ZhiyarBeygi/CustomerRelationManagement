import { useEffect, useState } from "react";
import { api } from "../api";
import Layout from "../components/Layout";
import TicketCard from "../components/TicketCard";

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [error, setError] = useState("");

  async function loadTickets() {
    setTickets(await api("/api/tickets/mine"));
  }

  useEffect(() => {
    loadTickets().catch((err) => setError(err.message));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/tickets", {
        method: "POST",
        body: JSON.stringify({ title, description, priority }),
      });
      setTitle("");
      setDescription("");
      setPriority("Medium");
      await loadTickets();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout>
      <h1>My tickets</h1>

      <form className="card" onSubmit={handleCreate}>
        <h2>Open a new ticket</h2>
        <label>Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
        </label>
        <label>Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} required />
        </label>
        <label>Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Create ticket</button>
      </form>

      {tickets.length === 0 && <p className="muted">You have no tickets yet. Open one above.</p>}
      {tickets.map((t) => <TicketCard key={t.ticket_id} ticket={t} />)}
    </Layout>
  );
}
