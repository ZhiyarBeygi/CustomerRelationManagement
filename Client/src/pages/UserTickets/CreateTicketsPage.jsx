import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { getUser, homePath, isSupportRole } from "../../auth";
import { CATEGORIES, DEPARTMENTS } from "../../constants/ticketOptions";

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState(user?.departmentId ? String(user.departmentId) : "");
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
      navigate(isSupportRole(user?.role) ? homePath(user) : "/tickets", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel panel-create ticket-form" onSubmit={handleCreate} dir="rtl">
      <h1>ثبت تیکت جدید</h1>
      <p className="muted">موضوع و دپارتمان مرتبط را انتخاب کنید تا درخواست به تیم مناسب ارجاع شود.</p>
      <label>عنوان تیکت
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
      </label>
      <label>شرح درخواست
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
          <option value="">انتخاب دسته‌بندی (اختیاری)</option>
          {CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
        </select>
      </label>
      <label>دپارتمان مسئول
        <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
          <option value="">انتخاب دپارتمان</option>
          {DEPARTMENTS.map((department) => <option key={department.id} value={department.id}>{department.label}</option>)}
        </select>
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="button" className="cancel" onClick={() => navigate(-1)}>لغو</button>
        <button type="submit" disabled={submitting}>{submitting ? "در حال ثبت…" : "ثبت تیکت"}</button>
      </div>
    </form>
  );
}
