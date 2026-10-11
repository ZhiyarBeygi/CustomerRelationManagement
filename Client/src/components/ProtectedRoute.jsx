import { Navigate } from "react-router-dom";
import { getUser } from "../auth";

// Not logged in -> login page. Normal user on an admin page -> their own tickets.
export default function ProtectedRoute({ children, adminOnly }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== "Admin") return <Navigate to="/tickets" />;
  return children;
}
