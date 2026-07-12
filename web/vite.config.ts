import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VitePWA } from "vite-plugin-pwa";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "src",
  plugins: [
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      },
      manifest: {
        name: 'Culinary Alchemy',
        short_name: 'Culinary',
        description: 'An educational web-to-Steam cooking game',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone'
      }
    })
  ],
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
