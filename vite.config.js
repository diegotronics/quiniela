import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Plugin: sustituye `%SITE_URL%` en index.html por VITE_SITE_URL.
// Fallback robusto al dominio Vercel del proyecto si la env var no está
// definida — así los previews de WhatsApp/Telegram/Facebook nunca quedan rotos.
function siteUrlPlugin(siteUrl) {
  return {
    name: "lcf-site-url",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return html.replaceAll("%SITE_URL%", siteUrl);
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = (env.VITE_SITE_URL || "https://lacopafamiliar.vercel.app").replace(/\/$/, "");

  return {
    plugins: [react(), siteUrlPlugin(siteUrl)],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    // Vitest: solo tests unitarios; los de tests/ui son de Playwright.
    test: {
      include: ["tests/unit/**/*.test.js"],
      environment: "node",
    },
  };
});
