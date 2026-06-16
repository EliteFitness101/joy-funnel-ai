// Vercel-specific Vite config. Used by Vercel builds via `vercel.json` → buildCommand.
// Lovable's local preview keeps using `vite.config.ts` (Cloudflare adapter).
//
// NOTE: TanStack Start ships official adapters per host. To activate this on
// Vercel, install the Vercel adapter once (locally or via Vercel's install step):
//
//   bun add -d @tanstack/start-adapter-vercel
//
// Then Vercel will build with `target: "vercel"` and emit `.vercel/output/`
// (server functions + static assets) that Vercel deploys natively — including
// every route under `src/routes/api/**`.
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      target: "vercel",
      server: { entry: "server" },
    }),
    viteReact(),
  ],
  resolve: {
    alias: { "@": "/src" },
  },
});
