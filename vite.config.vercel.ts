// Vercel-specific Vite config. Used by Vercel builds via `vercel.json` → buildCommand
// (`bun run build:vercel`). Lovable's local preview keeps using `vite.config.ts`
// (Cloudflare adapter) — that file must stay untouched.
//
// Deployment model: TanStack Start v1 no longer ships per-host adapters
// (`@tanstack/start-adapter-vercel` does not exist). Hosting output is produced by
// Nitro's Vite plugin using the `vercel` preset, which emits `.vercel/output`
// (Build Output API v3: one server function + static assets), so every route under
// `src/routes/api/**` deploys as a serverless function.
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      // src/server.ts — custom fetch-based SSR error wrapper (web-standard, works on Nitro).
      server: { entry: "server" },
    }),
    nitro({
      preset: "vercel",
      compatibilityDate: "2025-09-24",
    }),
    viteReact(),
  ],
  resolve: {
    alias: { "@": "/src" },
  },
});
