import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { getUser, isAdminRole, isExpertRole, roleLabel } from "../../auth";
import { DEPARTMENTS, departmentForCategory } from "../../constants/ticketOptions";
import TicketCard from "../../components/TicketCard";
import PriorityRequestsPanel from "../../components/PriorityRequestsPanel";
import TransferRequestsPanel from "../../components/TransferRequestsPanel";

export default function AdminPage() {
  const currentUser = getUser();
  const isAdmin = isAdminRole(currentUser?.role);
  const isExpert = isExpertRole(currentUser?.role);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [panelsVersion, setPanelsVersion] = useState(0); // bump to reload the request panels
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expertTicketFilter, setExpertTicketFilter] = useState("all");
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [userSubmitting, setUserSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [ticketList, userList, roleList] = await Promise.all([
        api("/api/Tickets"),
        api("/api/Users"),
        api("/api/Roles"),
      ]);
      setTickets(Array.isArray(ticketList) ? ticketList : []);
      setUsers(Array.isArray(userList) ? userList : []);
      setRoles(Array.isArray(roleList) ? roleList : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [isAdmin, isExpert]);

  const roleOptions = useMemo(
    () =>
      roles
        .filter((role) => role.roleId != null && role.role)
        .map((role) => ({ id: role.roleId, role: role.role })),
    [roles]
  );

  const experts = useMemo(() => users.filter((user) => isExpertRole(user.role)), [users]);

  const visibleTickets = useMemo(() => {
    let list =
      selected && isAdmin
        ? tickets.filter((ticket) => ticket.authorId === selected.userId)
        : tickets;
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) {
      list = list.filter((ticket) =>
        [
          ticket.title,
          ticket.description,
          ticket.referenceCode,
          ticket.authorUsername,
          ticket.receiverUsername,
          ticket.department,
          ticket.category,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(normalizedQuery)
        )
      );
    }
    if (statusFilter !== "all") {
      list = list.filter(
        (ticket) =>
          String(ticket.status || "")
            .trim()
            .toLowerCase()
            .replaceAll("-", " ") === statusFilter
      );
    }
    if (isExpert && expertTicketFilter === "mine") {
      list = list.filter((ticket) => Number(ticket.receiverId) === Number(currentUser?.userId));
    } else if (isExpert && expertTicketFilter === "unassigned") {
      list = list.filter((ticket) => ticket.receiverId == null);
    }
    return list;
  }, [
    tickets,
    selected,
    isAdmin,
    query,
    statusFilter,
    isExpert,
    expertTicketFilter,
    currentUser?.userId,
  ]);

  function beginCreateUser() {
    setEditingUserId(null);
    setUsername("");
    setPassword("");
    setRoleId(
      roleOptions
        .find((role) =>
          ["user", "normal user", "standard user"].includes(String(role.role).trim().toLowerCase())
        )
        ?.id?.toString() || ""
    );
    setDepartmentId("");
    setShowUserForm(true);
    setSelected(null);
    setError("");
  }

  function beginEditUser(user) {
    setEditingUserId(user.userId);
    setUsername(user.username || "");
    setPassword("");
    setRoleId(user.roleId == null ? "" : String(user.roleId));
    setDepartmentId(user.departmentId == null ? "" : String(user.departmentId));
    setShowUserForm(true);
    setError("");
  }

  async function saveUser(e) {
    e.preventDefault();
    setError("");
    if (!roleId) {
      setError("لطفاً یک نقش انتخاب کنید.");
      return;
    }
    setUserSubmitting(true);
    try {
      if (editingUserId) {
        await api(`/api/Users/${editingUserId}`, {
          method: "PUT",
          body: JSON.stringify({
            username: username.trim(),
            roleId: Number(roleId),
            departmentId: departmentId ? Number(departmentId) : null,
          }),
        });
      } else {
        await api("/api/Users", {
          method: "POST",
          body: JSON.stringify({
            username: username.trim(),
            password,
            roleId: Number(roleId),
            departmentId: departmentId ? Number(departmentId) : null,
          }),
        });
      }
      setShowUserForm(false);
      setPassword("");
      const refreshedUsers = await api("/api/Users");
      setUsers(Array.isArray(refreshedUsers) ? refreshedUsers : []);
      if (editingUserId)
        setSelected(refreshedUsers.find((user) => user.userId === editingUserId) || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUserSubmitting(false);
    }
  }

  async function updateTicket(ticket, changes) {
    setError("");
    const updated = { ...ticket, ...changes };
    try {
      // A status change goes through the status endpoint, so its rules apply
      // (for example, closing a ticket also closes its waiting requests).
      if (changes.status && Object.keys(changes).length === 1) {
        await api(`/api/Tickets/${ticket.ticketId}/status`, {
          method: "PUT",
          body: JSON.stringify({ status: changes.status }),
        });
        setTickets((current) =>
          current.map((item) => (item.ticketId === ticket.ticketId ? updated : item))
        );
        setPanelsVersion((current) => current + 1);
        return true;
      }

      await api(`/api/Tickets/${ticket.ticketId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: updated.title,
          description: updated.description,
          status: updated.status,
          priority: updated.priority || "Medium",
          categoryId: updated.categoryId ?? null,
          departmentId: updated.departmentId ?? null,
          receiverId: updated.receiverId ?? null,
        }),
      });

      // New category -> send the ticket to that category's department (recorded in the forward history).
      const target = changes.categoryId ? departmentForCategory(changes.categoryId) : null;
      if (target && target !== ticket.departmentId) {
        await api(`/api/Tickets/${ticket.ticketId}/forward`, {
          method: "POST",
          body: JSON.stringify({ toDepartmentId: target, reason: "تغییر دسته‌بندی تیکت" }),
        });
        setPanelsVersion((current) => current + 1);
        await loadData();
        return true;
      }

      setTickets((current) =>
        current.map((item) => (item.ticketId === ticket.ticketId ? updated : item))
      );
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }
  return (
    <div dir="rtl">
      <div className="row page-title-row">
        <div>
          <h1>{isAdmin ? "مدیریت کاربران و تیکت‌ها" : "صف کارشناسی"}</h1>
          <p className="muted">
            {isAdmin
              ? "حساب‌های کاربری و درخواست‌های پشتیبانی را مدیریت کنید."
              : "تیکت‌ها را بررسی کنید، وضعیت آن‌ها را به‌روزرسانی کنید و درخواست‌های تخصیص‌یافته را پیگیری کنید."}
          </p>
        </div>
        <button onClick={() => navigate("/createTicket")}>ثبت تیکت جدید</button>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {loading && <p className="muted">در حال بارگذاری اطلاعات…</p>}

      {isAdmin && <TransferRequestsPanel key={`t${panelsVersion}`} onChanged={loadData} />}
      {isAdmin && <PriorityRequestsPanel key={`p${panelsVersion}`} onChanged={loadData} />}

      <div className={`staff-dashboard${isAdmin ? " is-admin" : ""}`}>
        {isAdmin &&
          (showUserForm ? (
            <aside className="panel panel-users user-form-panel">
              <div className="row section-heading">
                <h2>{editingUserId ? "ویرایش کاربر" : "ایجاد کاربر جدید"}</h2>
              </div>

              <form className="user-form" onSubmit={saveUser}>
                <label>
                  نام کاربری
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    minLength={3}
                    maxLength={100}
                    required
                  />
                </label>

                {!editingUserId && (
                  <label>
                    رمز عبور اولیه
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      maxLength={100}
                      required
                    />
                  </label>
                )}

                <label>
                  نقش
                  <select value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
                    <option value="">انتخاب نقش</option>
                    {roleOptions.map((role) => (
                      <option key={role.id} value={role.id}>
                        {roleLabel(role.role)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  دپارتمان
                  <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                    <option value="">بدون دپارتمان</option>
                    {DEPARTMENTS.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      setShowUserForm(false);
                      setError("");
                    }}
                  >
                    انصراف
                  </button>
                  <button type="submit" disabled={userSubmitting}>
                    {userSubmitting ? "در حال ذخیره…" : "ذخیره"}
                  </button>
                </div>
              </form>
            </aside>
          ) : (
            <aside className="panel panel-users">
              <div className="row section-heading">
                <h2>کاربران</h2>
                <button type="button" onClick={beginCreateUser}>
                  کاربر جدید
                </button>
              </div>

              <button
                type="button"
                className={`user ${selected === null ? "active" : ""}`}
                onClick={() => setSelected(null)}
              >
                <span>همه کاربران</span>
                <small>{users.length}</small>
              </button>

              {users.map((user) => (
                <div className="user-entry" key={user.userId}>
                  <button
                    type="button"
                    className={`user ${selected?.userId === user.userId ? "active" : ""}`}
                    onClick={() => setSelected(user)}
                  >
                    <span className="user-name-block">
                      {user.username}
                      <small>
                        {roleLabel(user.role)}
                        {user.department ? ` · ${user.department}` : ""}
                      </small>
                    </span>
                    <small>
                      {tickets.filter((ticket) => ticket.authorId === user.userId).length} تیکت
                    </small>
                  </button>
                  <button
                    type="button"
                    className="secondary user-edit-button"
                    onClick={() => beginEditUser(user)}
                  >
                    ویرایش
                  </button>
                </div>
              ))}

              {!loading && users.length === 0 && <p className="muted">کاربری پیدا نشد.</p>}

              {selected && (
                <button
                  type="button"
                  className="secondary full-width"
                  onClick={() => beginEditUser(selected)}
                >
                  ویرایش کاربر انتخاب‌شده
                </button>
              )}
            </aside>
          ))}

        <section className="panel panel-list staff-ticket-panel">
          <div className="row section-heading">
            <h2>
              {isAdmin && selected ? `تیکت‌های ثبت‌شده توسط ${selected.username}` : "همه تیکت‌ها"}
            </h2>
            <span className="count-badge">{visibleTickets.length} تیکت</span>
          </div>
          <div className="ticket-filters">
            <label>
              جست‌وجو
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="عنوان، متن، کد یا ثبت‌کننده…"
              />
            </label>
            <label>
              وضعیت
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">همه وضعیت‌ها</option>
                <option value="pending">در انتظار</option>
                <option value="in progress">در حال انجام</option>
                <option value="done">بسته‌شده</option>
              </select>
            </label>
            {isExpert && (
              <label>
                نمایش تیکت‌ها
                <select
                  value={expertTicketFilter}
                  onChange={(e) => setExpertTicketFilter(e.target.value)}
                >
                  <option value="all">همه تیکت‌ها</option>
                  <option value="mine">تیکت‌های تخصیص‌یافته به من</option>
                  <option value="unassigned">تیکت‌های بدون کارشناس</option>
                </select>
              </label>
            )}
          </div>
          {!loading && visibleTickets.length === 0 && (
            <p className="muted">تیکتی مطابق فیلترهای انتخاب‌شده پیدا نشد.</p>
          )}
          {visibleTickets.map((ticket) => (
            <TicketCard
              key={ticket.ticketId}
              ticket={ticket}
              onChange={updateTicket}
              canEditContent
              canManageFields
              onForwarded={loadData}
            />
          ))}
          {isExpert && experts.length === 0 && (
            <p className="muted">
              در فهرست کاربران، حسابی با نقش «کارشناس» پیدا نشد؛ تخصیص تیکت به کارشناس تا افزودن
              چنین کاربری امکان‌پذیر نیست.
            </p>
          )}
        </section>
      </div>

      <div>
        
      </div>
    </div>
  );
}
