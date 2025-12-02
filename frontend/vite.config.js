import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // PENTING: Mematikan source map agar kode asli tidak muncul di browser user
    chunkSizeWarningLimit: 1600, // Opsional: Supaya tidak muncul warning jika file agak besar
  },
});
