import { useEffect, useState } from "react";
import { api } from "../../api";
import TicketCard from "../../components/TicketCard";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api("/api/Users"), api("/api/Tickets")])
      .then(([userList, ticketList]) => {
        setUsers(userList);
        setTickets(ticketList);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const userTickets = selected
    ? tickets.filter((ticket) => ticket.authorId === selected.userId)
    : [];

  async function updateTicket(ticket, changes) {
    setError("");
    const updated = { ...ticket, ...changes };
    try {
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
      setTickets((current) => current.map((item) => item.ticketId === ticket.ticketId ? updated : item));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h1>مدیریت تیکت‌ها</h1>
      {error && <p className="error" role="alert">{error}</p>}
      {loading && <p className="muted">در حال بارگذاری...</p>}

      <div className="split">
        <aside className="panel panel-users">
          <h2>کاربران</h2>
          {users.map((user) => (
            <button
              key={user.userId}
              className={"user" + (selected?.userId === user.userId ? " active" : "")}
              onClick={() => setSelected(user)}
            >
              <span>
                {user.username}
                <small>{user.role || "No role assigned"}</small>
              </span>
              <small>{tickets.filter((ticket) => ticket.authorId === user.userId).length} تیکت‌ها</small>
            </button>
          ))}
          {!loading && users.length === 0 && <p className="muted">هیچ کاربری پیدا نشد.</p>}
        </aside>

        <section className="panel panel-list">
          {!selected && <p className="muted">برای مشاهده تیکت‌ها کاربر مورد نظر را انتخاب کنید.</p>}
          {selected && <h2>تیکت‌های  {selected.username}</h2>}
          {selected && userTickets.length === 0 && <p className="muted">کاربر هیچ تیکتی ندارد.</p>}
          {userTickets.map((ticket) => (
            <TicketCard key={ticket.ticketId} ticket={ticket} onChange={updateTicket} />
          ))}
        </section>
      </div>
    </>
  );
}
