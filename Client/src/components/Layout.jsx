import { Link, useNavigate } from "react-router-dom";
import { getUser, clearAuth } from "../auth";

export default function Layout({ children }) {
  const user = getUser();
  const navigate = useNavigate();

  function logout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <>
      <header className="topbar">
        <strong>Support Tickets</strong>
        <nav>
          {user.role === "Admin" ? (
            <Link to="/admin">Ticket management</Link>
          ) : (
            <>
              <Link to="/tickets">My tickets</Link>
              <Link to="/createTicket">New ticket</Link>
            </>
          )}
        </nav>
        <span className="who">{user.username} ({user.role})</span>
        <button className="secondary" onClick={logout}>Log out</button>
      </header>
      <main>{children}</main>
    </>
  );
}
