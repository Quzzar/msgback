import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";

const manifestForPlugin: Partial<VitePWAOptions> = {
  registerType: "prompt",
  includeAssets: ["apple-icon-180.png", "maskable_icon.png"],
  manifest: {
    name: "MsgBack",
    short_name: "MsgBack",
    description: "Talk to people and get a date with the help of AI.",
    icons: [
      {
        src: "/apple-icon-180.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/maskable_icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/maskable_icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    theme_color: "#f8f9fa",
    background_color: "#f8f9fa",
    display: "standalone",
    scope: "/",
    start_url: "/",
    orientation: "portrait",
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), VitePWA(manifestForPlugin)],
});
