import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ALLOWED = new Set([
  "page_view",
  "checkout_start",
  "payment_success",
  "upsell_click",
  "referral_conversion",
  "vault_access",
]);

export const Route = createFileRoute("/api/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const event = String(body.event ?? "");
          if (!ALLOWED.has(event)) return Response.json({ ok: true });
          const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
            request.headers.get("cf-connecting-ip") ??
            null;
          await supabaseAdmin.from("analytics").insert({
            event,
            meta: body.meta ?? {},
            user_id: body.user_id ?? null,
            ip,
          });
          return Response.json({ ok: true });
        } catch {
          return Response.json({ ok: true });
        }
      },
    },
  },
});
