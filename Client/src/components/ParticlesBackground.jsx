import { useMemo } from "react";
import Particles from "@tsparticles/react";
import { useTheme } from "../theme";

const PARTICLE_COLORS = { light: "#969fab", dark: "#7d8fa6" };

export default function ParticlesBackground() {
  const color = PARTICLE_COLORS[useTheme()];
  const options = useMemo(
    () => ({
      background: {
        color: { value: "transparent" },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: { enable: true, mode: "repulse" },
        },
        modes: {
          repulse: { distance: 140, duration: 0.4 },
        },
      },
      particles: {
        color: { value: color },
        links: {
          color,
          distance: 160,
          enable: true,
          opacity: 0.5,
          width: 0.5,
        },
        move: {
          enable: true,
          speed: 2.25,
          outModes: { default: "out" },
        },
        number: {
          value: 200,
          density: { enable: true, area: 900 },
        },
        opacity: { value: 0.1 },
        shape: { type: "circle" },
        size: { value: { min: 0.5, max: 3 } },
      },
      detectRetina: true,
    }),
    [color]
  );

  return <Particles id="tsparticles" options={options} className="particles-bg" />;
}
