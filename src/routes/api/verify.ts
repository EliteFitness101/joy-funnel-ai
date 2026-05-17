import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
        const url = new URL(request.url);
        const reference = url.searchParams.get("reference");
        if (!reference) return Response.json({ error: "missing reference" }, { status: 400 });

        const { data } = await supabaseAdmin
          .from("payments")
          .select("id, user_id, reference, amount, status, plan")
          .eq("reference", reference)
          .maybeSingle();
        if (!data) return Response.json({ status: "unknown" });
        if (data.status === "success") return Response.json({ status: data.status, plan: data.plan });

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
              return Response.json({ status: "success", plan: data.plan });
            }
          } catch (error) {
            console.error("paystack verify fallback failed", error);
          }
        }

        return Response.json({ status: data.status, plan: data.plan });
      },
    },
  },
});
