import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getUser, clearAuth } from "../auth";
import Sidebar from "./Sidebar";

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
      <header className="topbar">
        <strong>مدیریت ارتباط با مشتری</strong>


        <span className="who" style={{ marginInlineStart: "auto" }}>
          {user?.username} ({user?.role || "User"})
        </span>
        <button className="secondary" onClick={logout}>
          خروج از حساب
        </button>
      </header>

      <div className="app-body" dir="rtl">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}