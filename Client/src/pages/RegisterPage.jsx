/*
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { saveAuth } from "../auth";

async function resolveDefaultUserRoleId() {
  const configuredRoleId = Number(import.meta.env.VITE_DEFAULT_USER_ROLE_ID);
  if (Number.isInteger(configuredRoleId) && configuredRoleId > 0) return configuredRoleId;

  const users = await api("/api/Users");
  const normalUser = users.find((user) => String(user.role ?? "").trim().toLowerCase() === "user");
  return normalUser?.roleId ?? null;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const roleId = await resolveDefaultUserRoleId();
      if (!roleId) {
        throw new Error("شناسه نقش کاربر عادی پیدا نشد. مقدار VITE_DEFAULT_USER_ROLE_ID را در فایل .env تنظیم کنید.");
      }

      await api("/api/Users", {
        method: "POST",
        body: JSON.stringify({ username: username.trim(), password, roleId, departmentId: null }),
      });

      const loginData = await api("/api/Users/login", {
        method: "POST",
        body: JSON.stringify({ username: username.trim(), password }),
      });
      saveAuth(loginData);
      navigate("/tickets", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="login panel panel-create" onSubmit={handleSubmit} dir="rtl">
      <h1>ایجاد حساب کاربری</h1>
      <label>نام کاربری
        <input value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} maxLength={100} autoComplete="username" autoFocus required />
      </label>
      <label>رمز عبور
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} maxLength={100} autoComplete="new-password" required />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" disabled={submitting}>{submitting ? "در حال ساخت حساب…" : "ثبت‌نام"}</button>
      <p>قبلاً حساب ساخته‌اید؟ <Link to="/login">وارد شوید</Link></p>
    </form>
  );
}
*/