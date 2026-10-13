import { useEffect, useState } from "react";
import { api } from "../api";
import { getUser } from "../auth";
import "./Comments.css";

// The comments of one ticket, with add / edit / delete
export default function Comments({ ticketId }) {
  const me = getUser();
  const isAdmin = me.role === "Admin";
  const [comments, setComments] = useState([]);
  const [names, setNames] = useState({}); // author_id -> "username (Role)"
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null); // the comment being edited
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const list = await api(`/api/tickets/${ticketId}/comments`);
    setComments(list);

    // Comments only store the author's id, so we look up the names of the other authors
    const ids = [...new Set(list.map((c) => c.author_id))].filter((id) => id !== me.user_id);
    const users = await Promise.all(ids.map((id) => api(`/api/users/${id}`).catch(() => null)));
    setNames(Object.fromEntries(users.filter(Boolean).map((u) => [u.user_id, `${u.username} (${u.role})`])));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [ticketId]);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await api(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });
      setTitle("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(c) {
    setError("");
    setEditingId(c.comment_id);
    setEditTitle(c.title);
    setEditDescription(c.description);
  }

  async function saveEdit(e) {
    e.preventDefault();
    setError("");
    try {
      await api(`/api/tickets/${ticketId}/comments/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(c) {
    setError("");
    try {
      await api(`/api/tickets/${ticketId}/comments/${c.comment_id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="comments">
      {comments.length === 0 && <p className="muted">No comments yet.</p>}
      {comments.map((c) => {
        const mine = c.author_id === me.user_id;

        // Edit mode: the comment turns into a small form
        if (editingId === c.comment_id) {
          return (
            <form className="comment mine" key={c.comment_id} onSubmit={saveEdit}>
              <input aria-label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength={100} required />
              <textarea aria-label="Text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} maxLength={500} required />
              <div className="comment-actions">
                <button type="submit">Save</button>
                <button type="button" className="secondary" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </form>
          );
        }

        return (
          <div className={"comment" + (mine ? " mine" : "")} key={c.comment_id}>
            <strong>{c.title}</strong>
            <p>{c.description}</p>
            <small>
              {mine ? "You" : names[c.author_id] || `User #${c.author_id}`} | {new Date(c.created_at).toLocaleString()}
            </small>
            {/* Only the author can edit; the author or an admin can delete */}
            {(mine || isAdmin) && (
              <div className="comment-actions">
                {mine && <button className="secondary" onClick={() => startEdit(c)}>Edit</button>}
                <button className="danger" onClick={() => handleDelete(c)}>Delete</button>
              </div>
            )}
          </div>
        );
      })}

      <form onSubmit={handleAdd}>
        <input aria-label="Comment title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
        <textarea aria-label="Comment text" placeholder="Write a comment..." value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} required />
        {error && <p className="error">{error}</p>}
        <button type="submit">Add comment</button>
      </form>
    </div>
  );
}
