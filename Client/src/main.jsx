
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

import App from "./App.jsx";
import "./index.css";

const initParticles = async (engine) => {
  await loadSlim(engine);
};

const particleOptions = {
  fullScreen: {
    enable: false,
  },
  fpsLimit: 60,
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
      speed: 1,
    },
    opacity: {
      value: 0.7,
    },
    size: {
      value: {
        min: 2,
        max: 4,
      },
    },
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ParticlesProvider init={initParticles}>
        <Particles
          id="tsparticles"
          options={particleOptions}
          particlesLoaded={(container) => {
            console.log("Particles loaded:", container);
          }}
        />

        <div className="app-content">
          <App />
        </div>
      </ParticlesProvider>
    </BrowserRouter>
  </StrictMode>
);
