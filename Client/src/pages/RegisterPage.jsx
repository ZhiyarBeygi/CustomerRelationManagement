import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { saveAuth } from "../auth";

async function resolveDefaultUserRoleId() {
  const configuredRoleId = Number(import.meta.env.VITE_DEFAULT_USER_ROLE_ID);
  if (Number.isInteger(configuredRoleId) && configuredRoleId > 0) return configuredRoleId;

  // The current backend does not expose a Roles lookup endpoint. Reuse the role ID
  // from an existing normal user when one exists, without guessing database IDs.
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
        throw new Error(
          "The API does not expose role lookup yet. Set VITE_DEFAULT_USER_ROLE_ID in Client/.env to the RoleId for the normal User role, then restart Vite."
        );
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
    <form className="login panel panel-create" onSubmit={handleSubmit}>
      <h1>Create account</h1>
      <label>Username
        <input value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} maxLength={100} autoComplete="username" autoFocus required />
      </label>
      <label>Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} maxLength={100} autoComplete="new-password" required />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" disabled={submitting}>{submitting ? "Creating account…" : "Create account"}</button>
      <p>Already have an account? <Link to="/login">ورود</Link></p>
    </form>
  );
}
