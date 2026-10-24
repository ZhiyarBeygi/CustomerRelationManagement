import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import App from "./App.jsx";
import "./index.css";

const initParticles = async (engine) => {
  await loadSlim(engine);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <ParticlesProvider init={initParticles}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ParticlesProvider>
);
