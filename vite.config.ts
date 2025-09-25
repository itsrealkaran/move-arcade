import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"
// import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@gameconfig": path.resolve(__dirname, "./src/game-config"),
    },
  },
  plugins: [react()],
});
