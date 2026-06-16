import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get("x-paystack-signature");
        const body = await request.text();
        const secret = process.env.PAYSTACK_SECRET_KEY;

        if (secret && signature) {
          const { createHmac } = await import("crypto");
          const hash = createHmac("sha512", secret).update(body).digest("hex");
          if (hash !== signature) {
            return new Response("Invalid signature", { status: 401 });
          }
        }

        let payload: any;
        try {
          payload = JSON.parse(body);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const event = payload.event as string;
        const data = payload.data ?? {};

        if (event === "charge.success") {
          const reference = data.reference as string;
          const amountKobo = Number(data.amount ?? 0);
          const amountNaira = Math.floor(amountKobo / 100);
          const eventId = String(data.id ?? reference);

          const { data: payment } = await supabaseAdmin
            .from("payments")
            .select("id, user_id, amount, status, plan")
            .eq("reference", reference)
            .maybeSingle();

          if (payment && payment.status !== "success") {
            if (payment.amount === amountNaira) {
              const { randomBytes } = await import("crypto");
              const rsid = `rsid_${randomBytes(16).toString("base64url")}`;
              const { error: updateError } = await supabaseAdmin
                .from("payments")
                .update({
                  status: "success",
                  paystack_event_id: eventId,
                  verified_at: new Date().toISOString(),
                  rsid,
                })
                .eq("id", payment.id);

              if (!updateError) {
                const { data: user } = await supabaseAdmin
                  .from("users")
                  .select("referred_by")
                  .eq("id", payment.user_id)
                  .maybeSingle();

                if (user?.referred_by) {
                  await supabaseAdmin.from("referrals").insert({
                    referrer_code: user.referred_by,
                    referred_user_id: payment.user_id,
                    payment_id: payment.id,
                    credited: true,
                  });
                }

                await supabaseAdmin.from("entitlements").insert({
                  user_id: payment.user_id,
                  payment_id: payment.id,
                  rsid,
                  plan: payment.plan,
                  access_granted: true,
                });

                await supabaseAdmin.from("analytics").insert({
                  user_id: payment.user_id,
                  event: "payment_success",
                  meta: { plan: payment.plan, reference, amount: payment.amount, source: "webhook" },
                });
              }
            }
          }
        }

        return new Response("OK", { status: 200 });
      },
    },
  },
});
