import { useEffect, useState } from "react";
import { api } from "../api";
import { getUser } from "../auth";
import "./Comments.css";

function formatDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : "Unknown date";
}

export default function Comments({ ticketId }) {
  const me = getUser();
  const [comments, setComments] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const list = await api(`/api/Comments/ticket/${ticketId}`);
    setComments(Array.isArray(list) ? list : []);
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    api(`/api/Comments/ticket/${ticketId}`)
      .then((list) => { if (active) setComments(Array.isArray(list) ? list : []); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [ticketId]);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api("/api/Comments", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          authorId: me.userId,
          ticketId,
          isInternal: false,
        }),
      });
      setTitle("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(comment) {
    setError("");
    setEditingId(comment.commentId);
    setEditTitle(comment.title);
    setEditDescription(comment.description);
  }

  async function saveEdit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api(`/api/Comments/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({ title: editTitle.trim(), description: editDescription.trim() }),
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="comments" aria-label="Ticket comments">
      <h4>Comments</h4>
      {error && <p className="error" role="alert">{error}</p>}
      {loading && <p className="muted">Loading comments…</p>}
      {!loading && comments.length === 0 && <p className="muted">No comments yet.</p>}

      {comments.map((comment) => {
        const mine = comment.authorId === me?.userId;
        if (editingId === comment.commentId) {
          return (
            <form className="comment mine" key={comment.commentId} onSubmit={saveEdit}>
              <input aria-label="Comment title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength={100} required />
              <textarea aria-label="Comment text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} maxLength={500} required />
              <div className="comment-actions">
                <button type="submit" disabled={submitting}>Save</button>
                <button type="button" className="secondary" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </form>
          );
        }

        return (
          <article className={`comment${mine ? " mine" : ""}`} key={comment.commentId}>
            <strong>{comment.title}</strong>
            <p>{comment.description}</p>
            <small>
              {mine ? "You" : comment.authorUsername || `User #${comment.authorId}`} · {formatDate(comment.createdAt)}
              {comment.isInternal ? " · Internal" : ""}
            </small>
            {mine && (
              <div className="comment-actions">
                <button type="button" className="secondary" onClick={() => startEdit(comment)}>Edit</button>
              </div>
            )}
          </article>
        );
      })}

      <form onSubmit={handleAdd}>
        <input aria-label="Comment title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
        <textarea aria-label="Comment text" placeholder="Write a comment…" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} required />
        <button type="submit" disabled={submitting}>{submitting ? "Adding…" : "Add comment"}</button>
      </form>
    </section>
  );
}
