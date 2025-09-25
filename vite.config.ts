import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"
// import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  base: "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@store": fileURLToPath(new URL("./src/store", import.meta.url)),
      "@gameconfig": fileURLToPath(new URL("./src/game-config", import.meta.url)),
    },
  },
  plugins: [react()],
});
