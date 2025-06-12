import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  server: {
    proxy: {
      "/dev-api": {
        target: "http://45.192.105.111:8080",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/dev-api/, ""),
      },
    },
  },
});
