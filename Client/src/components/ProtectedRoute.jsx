import { Navigate } from "react-router-dom";
import { getUser, homePath, isAdminRole, isSupportRole } from "../auth";

export default function ProtectedRoute({ children, adminOnly = false, staffOnly = false }) {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdminRole(user.role)) return <Navigate to={homePath(user)} replace />;
  if (staffOnly && !isSupportRole(user.role)) return <Navigate to="/tickets" replace />;

  return children;
}
