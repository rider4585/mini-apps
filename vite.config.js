import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "widget-dev-rewrite",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/w/dsr") {
            req.url = "/w/dsr/";
          }
          next();
        });
      }
    },
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "apple-touch-icon.png",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/icon-512-maskable.png"
      ],
      manifest: {
        name: "DSR Mail Generator",
        short_name: "DSR Mails",
        description:
          "Generate daily status report emails and monthly timesheet Excel files.",
        theme_color: "#4F46E5",
        background_color: "#FFFFFF",
        display: "standalone",
        start_url: "/",
        orientation: "portrait",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true
      }
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        widget_dsr: path.resolve(__dirname, "w/dsr/index.html")
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./shared"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@apps": path.resolve(__dirname, "./apps")
    }
  }
});