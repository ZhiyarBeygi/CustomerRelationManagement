import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { saveAuth } from "../auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await api("/api/users/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      saveAuth(data);
      // The role decides where you land
      navigate(data.user.role === "Admin" ? "/admin" : "/tickets");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="login card" onSubmit={handleSubmit}>
      <h1>Log in</h1>
      <label>Username
        <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
      </label>
      <label>Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit">Log in</button>
    </form>
  );
}
