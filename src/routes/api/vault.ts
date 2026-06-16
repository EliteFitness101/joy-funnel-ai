import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { rateLimit, clientIp } from "@/lib/rate-limit.server";

export const Route = createFileRoute("/api/vault")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const ip = clientIp(request);
        const rl = rateLimit(`vault:${ip}`, 30, 60_000);
        if (!rl.ok) {
          return Response.json({ error: "rate_limited", plans: [] }, { status: 429 });
        }

        const url = new URL(request.url);
        const reference = url.searchParams.get("reference");
        const rsid = url.searchParams.get("rsid");
        const email = (url.searchParams.get("email") ?? "").toLowerCase();

        // Preferred path: gate by RSID (issued only after verified payment).
        if (rsid) {
          if (rsid.length > 128 || !/^rsid_[A-Za-z0-9_-]+$/.test(rsid)) {
            return Response.json({ plans: [], verified: false }, { status: 400 });
          }
          const { data: ents } = await supabaseAdmin
            .from("entitlements")
            .select("plan, access_granted")
            .eq("rsid", rsid)
            .eq("access_granted", true);
          const plans = Array.from(new Set((ents ?? []).map((e) => e.plan)));
          return Response.json({ plans, verified: plans.length > 0 });
        }

        // Fallback: gate by verified paystack reference (no PII required client-side)
        if (reference) {
          if (reference.length > 128 || !/^[A-Za-z0-9_-]+$/.test(reference)) {
            return Response.json({ plans: [], verified: false }, { status: 400 });
          }
          const { data: pay } = await supabaseAdmin
            .from("payments")
            .select("user_id, plan, status")
            .eq("reference", reference)
            .maybeSingle();

          if (!pay || pay.status !== "success") {
            return Response.json({ plans: [], verified: false });
          }
          const { data: pays } = await supabaseAdmin
            .from("payments")
            .select("plan")
            .eq("user_id", pay.user_id)
            .eq("status", "success");
          const plans = Array.from(new Set((pays ?? []).map((p) => p.plan)));
          return Response.json({ plans, verified: true });
        }

        if (!email) return Response.json({ plans: [], verified: false });

        const { data: user } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        if (!user) return Response.json({ plans: [], verified: false });

        const { data: pays } = await supabaseAdmin
          .from("payments")
          .select("plan")
          .eq("user_id", user.id)
          .eq("status", "success");

        const plans = Array.from(new Set((pays ?? []).map((p) => p.plan)));
        return Response.json({ plans, verified: plans.length > 0 });
      },
    },
  },
});
