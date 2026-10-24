import { useEffect, useState } from "react";
import { api } from "../api";
import { getUser, isSupportRole } from "../auth";
import "./Comments.css";

function formatDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString("fa-IR") : "نامشخص";
}

export default function Comments({ ticketId }) {
  const me = getUser();
  const staff = isSupportRole(me?.role);
  const [comments, setComments] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    api(`/api/Comments/ticket/${ticketId}`)
      .then((list) => {
        if (!active) return;
        const safeList = Array.isArray(list) ? list : [];
        setComments(staff ? safeList : safeList.filter((comment) => !comment.isInternal));
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [ticketId, staff]);

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
          isInternal: staff && isInternal,
        }),
      });

      setTitle("");
      setDescription("");
      setIsInternal(false);
      const list = await api(`/api/Comments/ticket/${ticketId}`);
      const safeList = Array.isArray(list) ? list : [];
      setComments(staff ? safeList : safeList.filter((comment) => !comment.isInternal));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="comments" aria-label="دیدگاه‌های تیکت" dir="rtl">
      <h4>گفت‌وگو درباره تیکت</h4>
      {error && <p className="error" role="alert">{error}</p>}
      {loading && <p className="muted">در حال بارگذاری دیدگاه‌ها…</p>}
      {!loading && comments.length === 0 && !error && <p className="muted">هنوز دیدگاهی ثبت نشده است.</p>}

      {comments.map((comment) => {
        const mine = Number(comment.authorId) === Number(me?.userId);
        return (
          <article className={`comment${mine ? " mine" : ""}${comment.isInternal ? " internal" : ""}`} key={comment.commentId}>
            <strong>{comment.title}</strong>
            <p>{comment.description}</p>
            <small>
              {mine ? "شما" : comment.authorUsername || `کاربر شماره ${comment.authorId}`} · {formatDate(comment.createdAt)}
              {comment.isInternal ? " · یادداشت داخلی" : ""}
            </small>
          </article>
        );
      })}

      <form onSubmit={handleAdd}>
        <h4>ثبت دیدگاه جدید</h4>
        <label>عنوان دیدگاه
          <input aria-label="عنوان دیدگاه" placeholder="عنوان دیدگاه" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
        </label>
        <label>متن دیدگاه
          <textarea aria-label="متن دیدگاه" placeholder="پیام خود را بنویسید…" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} required />
        </label>
        {staff && (
          <label className="checkbox-label">
            <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
            یادداشت داخلی (فقط برای مدیران و کارشناسان)
          </label>
        )}
        <button type="submit" disabled={submitting}>{submitting ? "در حال ثبت…" : "ثبت دیدگاه"}</button>
      </form>
    </section>
  );
}
