import { createFileRoute } from "@tanstack/react-router";

const CANONICAL_PAYSTACK_INIT =
  "https://vbqjvmnhdtdhmeeudqnn.supabase.co/functions/v1/paystack-init";

const PLAN_SKUS = {
  reset: "res-dig-reset",
  meal_move: "SHOPIFY-PRODUCT-10403922870552",
  naijafitrev_90_day: "SHOPIFY-PRODUCT-10410533650712",
} as const;

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const plan = String(body.plan ?? "reset") as keyof typeof PLAN_SKUS;
          const sku = PLAN_SKUS[plan];

          if (!sku) {
            return Response.json({ error: "Invalid plan selected" }, { status: 400 });
          }

          const email = String(body.email ?? "").trim().toLowerCase();
          const phone = String(body.phone ?? "").trim();
          const name = String(body.name ?? "").trim() || email.split("@")[0];
          const ref = body.ref ? String(body.ref).slice(0, 128) : "";

          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return Response.json({ error: "Valid email required" }, { status: 400 });
          }

          if (!phone) {
            return Response.json({ error: "Phone number required" }, { status: 400 });
          }

          const response = await fetch(CANONICAL_PAYSTACK_INIT, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              sku,
              email,
              name,
              phone,
              rsid: ref,
              funnel_origin: plan === "reset" ? "7_day_reset" : plan,
              session_id: body.session_id ? String(body.session_id).slice(0, 128) : null,
              campaign: body.campaign ? String(body.campaign).slice(0, 128) : null,
              ttclid: body.ttclid ? String(body.ttclid).slice(0, 255) : null,
              utm_source: body.utm_source ? String(body.utm_source).slice(0, 128) : null,
              utm_medium: body.utm_medium ? String(body.utm_medium).slice(0, 128) : null,
              utm_campaign: body.utm_campaign ? String(body.utm_campaign).slice(0, 128) : null,
              utm_term: body.utm_term ? String(body.utm_term).slice(0, 128) : null,
              utm_content: body.utm_content ? String(body.utm_content).slice(0, 128) : null,
            }),
          });

          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            const status = response.status >= 400 && response.status < 500
              ? response.status
              : 502;
            return Response.json(
              { error: data.error ?? "Checkout initialization failed" },
              { status },
            );
          }

          return Response.json({
            authorization_url: data.authorization_url,
            reference: data.reference,
            user_id: null,
            rsid: data.rsid,
            sku: data.sku,
          });
        } catch (error: any) {
          console.error("checkout error", error);
          return Response.json(
            { error: "Checkout initialization failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});
