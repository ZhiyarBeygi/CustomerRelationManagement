import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { saveAuth, homePath } from "../auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() => {
    if (sessionStorage.getItem("sessionExpired")) {
      sessionStorage.removeItem("sessionExpired");
      return "نشست شما پایان یافته است. لطفاً دوباره وارد شوید.";
    }
    return "";
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await api("/api/Users/login", {
        method: "POST",
        body: JSON.stringify({ username: username.trim(), password }),
      });
      saveAuth(data);
      navigate(homePath(data?.user ?? data), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="login panel panel-create" onSubmit={handleSubmit} dir="rtl">
      <h1>ورود به سامانه</h1>
      <label>نام کاربری
        <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus maxLength={100} required />
      </label>
      <label>رمز عبور
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" disabled={submitting}>{submitting ? "در حال ورود…" : "ورود"}</button>
    </form>
  );
}
