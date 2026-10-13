// Order of the status groups, top to bottom (change the order here to reorder them)
const STATUS_ORDER = ["Done", "In Progress", "Pending"];
// Inside each status, high priority comes first and low priority sinks to the bottom
const PRIORITY_ORDER = ["High", "Medium", "Low"];

// Position of a value in a list; anything unknown or empty goes last
const rank = (list, value) => {
  const i = list.indexOf(value);
  return i === -1 ? list.length : i;
};

export function sortTickets(tickets) {
  return [...tickets].sort(
    (a, b) =>
      rank(STATUS_ORDER, a.status) - rank(STATUS_ORDER, b.status) ||
      rank(PRIORITY_ORDER, a.priority) - rank(PRIORITY_ORDER, b.priority) ||
      new Date(b.created_at) - new Date(a.created_at) // same status and priority: newest first
  );
}
