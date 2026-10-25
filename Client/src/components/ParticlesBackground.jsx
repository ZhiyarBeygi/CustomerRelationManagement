import { useMemo } from "react";
import Particles from "@tsparticles/react";

export default function ParticlesBackground() {
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
        color: { value: "#969fab" },
        links: {
          color: "#969fab",
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
    []
  );

  return <Particles id="tsparticles" options={options} className="particles-bg" />;
}
