import { Navigate } from "react-router-dom";
import { getUser, homePath, isAdminRole, isExpertRole } from "../auth";

export default function ProtectedRoute({ children, adminOnly = false, expertOnly = false }) {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdminRole(user.role)) return <Navigate to={homePath(user)} replace />;
  if (expertOnly && !isExpertRole(user.role)) return <Navigate to={homePath(user)} replace />;

  return children;
}
