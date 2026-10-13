import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { saveAuth } from "../auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      // 1) create the account
      await api("/api/users/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      // 2) log in right away with the same details
      const data = await api("/api/users/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      saveAuth(data);
      navigate("/tickets"); // new accounts are always normal users
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="login panel panel-create" onSubmit={handleSubmit}>
      <h1>Create account</h1>
      <label>Username
        <input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={100} autoFocus required />
      </label>
      <label>Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={4} required />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit">Create account</button>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </form>
  );
}