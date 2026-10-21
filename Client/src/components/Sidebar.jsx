import { useState } from "react";
import { NavLink } from "react-router-dom";
import { getUser, isAdminRole } from "../auth";
import "./Sidebar.css";

// The whole menu is data. To add a page later, add one line here.
const menu = [
  {
    id: "tickets",
    label: "تیکت‌ها",
    icon: "🎫",
    userOnly: true,
    children: [
      { path: "/tickets", label: "تیکت‌های من" },
      { path: "/createTicket", label: "ایجاد تیکت جدید" },
    ],
  },
  {
    id: "admin",
    label: "مدیریت",
    icon: "🛠️",
    adminOnly: true,
    children: [{ path: "/admin", label: "مدیریت تیکت‌ها" }],
  },
];

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const user = getUser();
  const isAdmin = isAdminRole(user?.role);

  // all groups start open
  const [openGroups, setOpenGroups] = useState(
    Object.fromEntries(menu.map((group) => [group.id, true]))
  );

  function toggleGroup(id) {
    setOpenGroups((current) => ({ ...current, [id]: !current[id] }));
  }

  // keep only the groups this user is allowed to see
  const visibleMenu = menu.filter((group) => {
    if (group.adminOnly) return isAdmin;
    if (group.userOnly) return !isAdmin;
    return true;
  });

  return (
    <aside className={`sidebar ${collapsed ? "is-collapsed" : ""}`} dir="rtl">
      <div className="sidebar-heading">
        {!collapsed && <span>منو</span>}
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "باز کردن منو" : "بستن منو"}
        >
          {collapsed ? "«" : "»"}
        </button>
      </div>

      <nav>
        {visibleMenu.map((group) => (
          <div key={group.id} className="sidebar-group">
            <button
              type="button"
              className="sidebar-group-btn"
              title={collapsed ? group.label : undefined}
              onClick={() => toggleGroup(group.id)}
            >
              <span>{group.icon}</span>
              {!collapsed && <span className="sidebar-group-label">{group.label}</span>}
              {!collapsed && <span>{openGroups[group.id] ? "▾" : "▸"}</span>}
            </button>

            {!collapsed && openGroups[group.id] && (
              <div className="sidebar-children">
                {group.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) =>
                      "sidebar-link" + (isActive ? " is-active" : "")
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}