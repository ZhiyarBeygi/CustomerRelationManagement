import { NavLink } from "react-router-dom";
import { getUser, isAdminRole, isExpertRole } from "../auth";
import "./Sidebar.css";

export default function Sidebar({ collapsed = false, onToggleCollapse = () => {} }) {
  const user = getUser();
  const isAdmin = isAdminRole(user?.role);
  const isExpert = isExpertRole(user?.role);

  return (
    <aside className={`sidebar${collapsed ? " is-collapsed" : ""}`} dir="rtl">
      <div className="sidebar-heading">
        {!collapsed && <span>منوی اصلی</span>}
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "باز کردن منو" : "جمع‌کردن منو"}
          title={collapsed ? "باز کردن منو" : "جمع‌کردن منو"}
        >
          {collapsed ? "«" : "»"}
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="ناوبری اصلی">
        <NavLink
          title={collapsed ? "تیکت‌های من" : undefined}
          to="/tickets"
          className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
        >
          {collapsed ? "🎫" : "تیکت‌های من"}
        </NavLink>
        <NavLink
          title={collapsed ? "ثبت تیکت جدید" : undefined}
          to="/createTicket"
          className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
        >
          {collapsed ? "＋" : "ثبت تیکت جدید"}
        </NavLink>

        {isAdmin && (
          <>
            <div className="sidebar-section">
              {!collapsed && <div className="sidebar-section-title">مدیریت</div>}
              <NavLink
                title={collapsed ? "مدیریت کاربران و تیکت‌ها" : undefined}
                to="/admin"
                className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
              >
                {collapsed ? "⚙" : "مدیریت کاربران و تیکت‌ها"}
              </NavLink>
            </div>
            <div className="sidebar-section sidebar-requests-section">
              {!collapsed && <div className="sidebar-section-title">درخواست‌ها</div>}
              <NavLink
                title={collapsed ? "مدیریت درخواست‌ها" : undefined}
                to="/requests"
                className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
              >
                {collapsed ? "📨" : "مدیریت درخواست‌ها"}
              </NavLink>
            </div>
          </>
        )}

        {isExpert && (
          <NavLink
            title={collapsed ? "صف کارشناسی" : undefined}
            to="/expert"
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            {collapsed ? "✓" : "صف کارشناسی"}
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
