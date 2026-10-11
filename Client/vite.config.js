import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The API allows requests from http://localhost:5173, so keep this port
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
