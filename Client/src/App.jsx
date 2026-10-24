
import { Routes, Route, Navigate } from "react-router-dom";
import ParticlesBackground from "./components/ParticlesBackground";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import MyTicketsPage from "./pages/UserTickets/MyTicketsPage";
import CreateTicketPage from "./pages/UserTickets/CreateTicketsPage";
import AdminPage from "./pages/AdminPage/AdminPage";
import ExpertPage from "./pages/ExpertPage/ExpertPage"
import { getUser, homePath } from "./auth";
import Layout from "./components/Layout";

function HomeRedirect() {
  return <Navigate to={homePath(getUser())} replace />;
}

function LoginWithParticles() {
  return (
    <>
      <ParticlesBackground />
      <LoginPage />
    </>
  );
}

export default function App() {
  return (
    <div className="app-content">
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route
          path="/login"
          element={<LoginWithParticles />}
        />

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
              <ProtectedRoute staffOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Route>

          <Route
            path="/expert"
            element={
              <ProtectedRoute experOnly>
                <ExpertPage/>
              </ProtectedRoute>
            }
          />        

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </div>
  );
}
