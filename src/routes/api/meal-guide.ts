import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { rateLimit, clientIp } from "@/lib/rate-limit.server";
import guideDataUrl from "@/lib/reset/meal/ResoFlex_N1000_Meal_Plan_Reset.pdf?inline";

export const Route = createFileRoute("/api/meal-guide")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const ip = clientIp(request);
        const rl = rateLimit(`meal-guide:${ip}`, 20, 60_000);
        if (!rl.ok) {
          return Response.json({ error: "rate_limited" }, { status: 429 });
        }

        const url = new URL(request.url);
        const reference = url.searchParams.get("reference");
        if (!reference || reference.length > 128 || !/^[A-Za-z0-9_-]+$/.test(reference)) {
          return Response.json({ error: "valid payment reference required" }, { status: 401 });
        }

        const { data: payment, error } = await supabaseAdmin
          .from("payments")
          .select("status, plan")
          .eq("reference", reference)
          .eq("plan", "reset")
          .maybeSingle();

        if (error || !payment || payment.status !== "success") {
          return Response.json({ error: "verified payment required" }, { status: 403 });
        }

        const encoded = guideDataUrl.split(",")[1];
        if (!encoded) {
          return Response.json({ error: "guide unavailable" }, { status: 500 });
        }

        const bytes = Buffer.from(encoded, "base64");
        return new Response(bytes, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="ResoFlex_N1000_Meal_Plan_Reset.pdf"',
            "Content-Length": String(bytes.byteLength),
            "Cache-Control": "private, no-store, max-age=0",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});
