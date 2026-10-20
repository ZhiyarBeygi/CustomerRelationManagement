import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar" dir="rtl">
      <h2 className="sidebar-title">منو</h2>

      <nav className="sidebar-nav">
        <NavLink to="/tickets" className="sidebar-link">
          تیکت‌های من
        </NavLink>

        <NavLink to="/createTicket" className="sidebar-link">
          ایجاد تیکت جدید
        </NavLink>
      </nav>
    </aside>
  );
}