import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { rateLimit, clientIp } from "@/lib/rate-limit.server";

async function markPaymentSuccess(payment: any, paystackData: any) {
  const eventId = String(paystackData.id ?? payment.reference);

  const { error: updateError } = await supabaseAdmin
    .from("payments")
    .update({
      status: "success",
      paystack_event_id: eventId,
      verified_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (updateError) return;

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

  await supabaseAdmin.from("analytics").insert({
    user_id: payment.user_id,
    event: "payment_success",
    meta: { plan: payment.plan, reference: payment.reference, amount: payment.amount },
  });
}

export const Route = createFileRoute("/api/verify")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const ip = clientIp(request);
        const rl = rateLimit(`verify:${ip}`, 20, 60_000);
        const rlHeaders = {
          "X-RateLimit-Limit": "20",
          "X-RateLimit-Remaining": String(rl.remaining),
          "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
        };
        if (!rl.ok) {
          return Response.json(
            { error: "rate_limited" },
            {
              status: 429,
              headers: {
                ...rlHeaders,
                "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
              },
            },
          );
        }

        const url = new URL(request.url);
        const reference = url.searchParams.get("reference");
        if (!reference || reference.length > 128 || !/^[A-Za-z0-9_-]+$/.test(reference)) {
          return Response.json({ error: "invalid reference" }, { status: 400, headers: rlHeaders });
        }

        const { data } = await supabaseAdmin
          .from("payments")
          .select("id, user_id, reference, amount, status, plan")
          .eq("reference", reference)
          .maybeSingle();
        if (!data) return Response.json({ status: "unknown" }, { headers: rlHeaders });
        if (data.status === "success")
          return Response.json({ status: data.status, plan: data.plan }, { headers: rlHeaders });

        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (secret) {
          try {
            const paystackRes = await fetch(
              `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
              {
                headers: { Authorization: `Bearer ${secret}` },
                signal: AbortSignal.timeout(7000),
              },
            );
            const paystackJson: any = await paystackRes.json().catch(() => ({}));
            const paystackData = paystackJson.data ?? {};
            const paidNaira = Math.floor(Number(paystackData.amount ?? 0) / 100);

            if (paystackRes.ok && paystackData.status === "success" && paidNaira === data.amount) {
              await markPaymentSuccess(data, paystackData);
              return Response.json({ status: "success", plan: data.plan }, { headers: rlHeaders });
            }
          } catch (error) {
            console.error("paystack verify fallback failed", error);
          }
        }

        return Response.json({ status: data.status, plan: data.plan }, { headers: rlHeaders });
      },
    },
  },
});
