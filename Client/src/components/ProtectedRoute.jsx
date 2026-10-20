import { Navigate } from "react-router-dom";
import { getUser, isAdminRole } from "../auth";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdminRole(user.role)) return <Navigate to="/tickets" replace />;

  return children;
}
