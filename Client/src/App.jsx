
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyTicketsPage from "./pages/UserTickets/MyTicketsPage";
import CreateTicketPage from "./pages/UserTickets/CreateTicketsPage";
import AdminPage from "./pages/AdminPage/AdminPage";
import { getUser, isAdminRole } from "./auth";
import Layout from "./components/Layout";

function HomeRedirect() {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={isAdminRole(user.role) ? "/admin" : "/tickets"}
      replace
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<Layout />}>
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <MyTicketsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/createTicket"
          element={
            <ProtectedRoute>
              <CreateTicketPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
