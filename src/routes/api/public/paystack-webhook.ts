import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/paystack-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get("x-paystack-signature");
        const body = await request.text();
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) return new Response("Server misconfigured", { status: 500 });
        if (!signature) return new Response("Missing signature", { status: 401 });

        const expected = createHmac("sha512", secret).update(body).digest("hex");
        const a = Buffer.from(signature);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: any;
        try {
          payload = JSON.parse(body);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        // Only accept charge.success
        if (payload.event !== "charge.success") {
          return new Response("ignored", { status: 200 });
        }

        const data = payload.data ?? {};
        const reference: string | undefined = data.reference;
        const eventId: string = String(data.id ?? reference ?? "");
        if (!reference || !eventId) return new Response("ok", { status: 200 });

        // Idempotency: if we've already processed this event id, no-op.
        const { data: dup } = await supabaseAdmin
          .from("payments")
          .select("id")
          .eq("paystack_event_id", eventId)
          .maybeSingle();
        if (dup) return new Response("ok", { status: 200 });

        // Find pending payment
        const { data: payment } = await supabaseAdmin
          .from("payments")
          .select("*")
          .eq("reference", reference)
          .maybeSingle();
        if (!payment) return new Response("ok", { status: 200 });
        if (payment.status === "success") return new Response("ok", { status: 200 });

        // Verify amount matches what we expect (kobo → naira)
        const paidNaira = Math.floor(Number(data.amount ?? 0) / 100);
        if (paidNaira !== payment.amount) {
          await supabaseAdmin
            .from("payments")
            .update({ status: "failed", paystack_event_id: eventId })
            .eq("id", payment.id);
          return new Response("amount mismatch", { status: 200 });
        }

        // Mark success atomically with event id (unique constraint = replay protection)
        const { error: upErr } = await supabaseAdmin
          .from("payments")
          .update({
            status: "success",
            paystack_event_id: eventId,
            verified_at: new Date().toISOString(),
          })
          .eq("id", payment.id);
        if (upErr) {
          // Unique violation = concurrent webhook already processed
          return new Response("ok", { status: 200 });
        }

        // Credit referral if user was referred and not yet credited
        const { data: user } = await supabaseAdmin
          .from("users")
          .select("referred_by")
          .eq("id", payment.user_id)
          .maybeSingle();
        if (user?.referred_by) {
          await supabaseAdmin
            .from("referrals")
            .insert({
              referrer_code: user.referred_by,
              referred_user_id: payment.user_id,
              payment_id: payment.id,
              credited: true,
            })
            .then(() =>
              supabaseAdmin.from("analytics").insert({
                user_id: payment.user_id,
                event: "referral_conversion",
                meta: { referrer_code: user.referred_by, plan: payment.plan },
              })
            );
        }

        await supabaseAdmin.from("analytics").insert({
          user_id: payment.user_id,
          event: "payment_success",
          meta: { plan: payment.plan, reference, amount: payment.amount },
        });

        return new Response("ok", { status: 200 });
      },
    },
  },
});
