import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { getUser } from "../../auth";

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [categoryId, setCategoryId] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api("/api/Tickets", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          status: "Pending",
          priority,
          authorId: user.userId,
          categoryId: categoryId ? Number(categoryId) : null,
          departmentId: departmentId ? Number(departmentId) : null,          
          receiverId: null,
        }),
      });
      navigate("/tickets", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <form className="panel panel-create" onSubmit={handleCreate}>
        <h2>باز کردن تیکت جدید</h2>
        <label>عنوان
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
        </label>
        <label>متن
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} required />
        </label>
        <label>اولویت
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Low">پایین</option>
            <option value="Medium">متوسط</option>
            <option value="High">بالا</option>
          </select>
        </label>
        <label>دسته‌بندی
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">— انتخاب کنید —</option>
            <option value="1">مالی</option>
            <option value="2">سخت‌افزاری</option>
            <option value="3">نرم‌افزاری</option>
            <option value="4">...</option>
          </select>
        </label>
        <label>دپارتمان
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
            <option value="">— انتخاب کنید —</option>
            <option value="1">مالی</option>
            <option value="2">IT</option>
            <option value="3">منابع انسانی</option>
            <option value="4">مدیریت</option>
            <option value="5">امنیت</option>
            <option value="6">خدمات مشتریان</option>
          </select>
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" className="cancel" onClick={() => navigate("/tickets")}>لغو</button>
          <button type="submit" disabled={submitting}> {submitting ? "در حال ساخت..." : "باز کردن تیکت"}</button>
        </div>
      </form>
  );
}
