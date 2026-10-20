import { Link, Outlet, useNavigate } from "react-router-dom";
import { getUser, clearAuth, isAdminRole } from "../auth";
import Sidebar from "./Sidebar";

export default function Layout() {
  const user = getUser();
  const navigate = useNavigate();
  const isAdmin = isAdminRole(user?.role);

  function logout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <header className="topbar">
        <strong>مدیریت ارتباط با مشتری</strong>

        <nav>
          {isAdmin ? (
            <Link to="/admin">مدیریت تیکت‌ها</Link>
          ) : (
            <>
              <Link to="/tickets">تیکت‌های شما</Link>
              <Link to="/createTicket">تیکت جدید</Link>
            </>
          )}
        </nav>

        <span className="who">
          {user?.username} ({user?.role || "User"})
        </span>

        <button className="secondary" onClick={logout}>
          خروج از حساب
        </button>
      </header>

      <div className="app-body" dir="rtl">
        <Sidebar />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}