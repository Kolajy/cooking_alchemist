import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "src",
  plugins: [basicSsl()],
  resolve: {
    alias: {
      "@culinary-alchemy/content": path.resolve(rootDir, "../content")
    }
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    target: "esnext"
  },
  server: {
    port: 5173,
    open: true
  },
  preview: {
    port: 5173
  }
});
