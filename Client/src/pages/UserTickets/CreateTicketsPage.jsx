import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import Layout from "../../components/Layout";

export default function NewTicketPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [error, setError] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/tickets", {
        method: "POST",
        body: JSON.stringify({ title, description, priority }),
      });
      navigate("/tickets"); // back to the list, where the new ticket now appears
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout>
      <h1>New ticket</h1>

      <form className="panel panel-create" onSubmit={handleCreate}>
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
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">Create ticket</button>
          <button type="button" className="secondary" onClick={() => navigate("/tickets")}>Cancel</button>
        </div>
      </form>
    </Layout>
  );
}