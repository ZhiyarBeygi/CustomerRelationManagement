
import { useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
import MyTicketsPage from "./pages/UserTickets/MyTicketsPage";
import CreateTicketPage from "./pages/UserTickets/CreateTicketsPage";
import AdminPage from "./pages/AdminPage/AdminPage";
import { getUser, homePath } from "./auth";
import Layout from "./components/Layout";

const initParticles = async (engine) => {
  await loadSlim(engine);
};

function HomeRedirect() {
  return <Navigate to={homePath(getUser())} replace />;
}

export default function App() {
  const particleOptions = useMemo(
    () => ({
      fullScreen: {
        enable: false,
      },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: {
          value: 65,
          density: {
            enable: true,
          },
        },
        color: {
          value: "#0f6f78",
        },
        links: {
          enable: true,
          color: "#0f6f78",
          distance: 150,
          opacity: 0.3,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.8,
          outModes: {
            default: "out",
          },
        },
        opacity: {
          value: 0.6,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: {
            min: 2,
            max: 4,
          },
        },
      },
    }),
    []
  );

  return (
    <ParticlesProvider load={initParticles}>
      <Particles
        id="tsparticles"
        options={particleOptions}
        particlesLoaded={(container) => {
          console.log("Particles loaded:", container);
        }}
      />

      <div className="app-content">
        <Routes>
          <Route path="/" element={<HomeRedirect />} />

          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/register" element={<RegisterPage />} /> */}

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

          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </div>
    </ParticlesProvider>
  );
}
