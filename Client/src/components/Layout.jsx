import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getUser, clearAuth, roleLabel } from "../auth";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const user = getUser();
  const navigate = useNavigate();

  function logout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <header className="topbar" dir="rtl">
        <strong>سامانه پشتیبانی و تیکت‌ها</strong>
        <span className="who" style={{ marginInlineStart: "auto" }}>
          {user?.username} · {roleLabel(user?.role)}
        </span>
        <ThemeToggle />
        <button className="secondary" onClick={logout}>
          خروج از حساب
        </button>
      </header>

      <div className="app-body" dir="rtl">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((current) => !current)}
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
