// Replit plugin typings moved to types/replit-plugins.d.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

declare const process: {
  env: {
    NODE_ENV?: string | undefined;
    REPL_ID?: string | undefined;
    [key: string]: string | undefined;
  };
};

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? await (async () => {
          const plugins: any[] = [];
          try {
            const cartoName = "@replit/vite-plugin-cartographer";
            const cartoMod: any = await import(cartoName);
            if (cartoMod && typeof cartoMod.cartographer === "function") {
              plugins.push(cartoMod.cartographer());
            }
          } catch (e) {
            // ignore if module not available
          }
          try {
            const bannerName = "@replit/vite-plugin-dev-banner";
            const bannerMod: any = await import(bannerName);
            if (bannerMod && typeof bannerMod.devBanner === "function") {
              plugins.push(bannerMod.devBanner());
            }
          } catch (e) {
            // ignore if module not available
          }
          return plugins;
        })()
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
