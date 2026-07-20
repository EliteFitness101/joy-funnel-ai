import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

const PRICES = {
  reset: 1000,
  premium: 3000,
} as const;

type Plan = keyof typeof PRICES;

function getClientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();

  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function genReference(plan: Plan) {
  const rand = crypto.getRandomValues(new Uint8Array(8));
  const hex = Array.from(rand)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `rf_${plan}_${Date.now().toString(36)}_${hex}`;
}

async function checkRateLimit(ip: string): Promise<boolean> {
  const now = new Date();

  const { data } = await supabaseAdmin
    .from("rate_limits")
    .select("*")
    .eq("ip", ip)
    .maybeSingle();

  if (!data) {
    await supabaseAdmin.from("rate_limits").insert({
      ip,
      count: 1,
      window_start: now.toISOString(),
    });

    return true;
  }

  const windowStart = new Date(data.window_start).getTime();

  if (now.getTime() - windowStart > RATE_WINDOW_MS) {
    await supabaseAdmin
      .from("rate_limits")
      .update({
        count: 1,
        window_start: now.toISOString(),
      })
      .eq("ip", ip);

    return true;
  }

  if (data.count >= RATE_MAX) {
    return false;
  }

  await supabaseAdmin
    .from("rate_limits")
    .update({
      count: data.count + 1,
    })
    .eq("ip", ip);

  return true;
}

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));

          const email = String(body.email ?? "")
            .trim()
            .toLowerCase();

          const phone = body.phone
            ? String(body.phone).trim()
            : null;

          const plan = (
            body.plan === "premium"
              ? "premium"
              : "reset"
          ) as Plan;

          const ref = body.ref
            ? String(body.ref).slice(0, 64)
            : null;

          const ip = getClientIp(request);

          if (
            !email ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ) {
            return Response.json(
              { error: "Valid email required" },
              { status: 400 }
            );
          }

          const allowed = await checkRateLimit(ip);

          if (!allowed) {
            return Response.json(
              {
                error:
                  "Too many requests. Try again later.",
              },
              { status: 429 }
            );
          }


          // Find or create user
          const { data: existing } =
            await supabaseAdmin
              .from("users")
              .select("id, referred_by")
              .eq("email", email)
              .maybeSingle();


          let userId: string;


          if (existing) {
            userId = existing.id;

            if (!existing.referred_by && ref) {
              await supabaseAdmin
                .from("users")
                .update({
                  referred_by: ref,
                  phone: phone ?? undefined,
                  ip,
                })
                .eq("id", userId);
            }

          } else {

            const { data: created, error } =
              await supabaseAdmin
                .from("users")
                .insert({
                  email,
                  phone,
                  ip,
                  referred_by: ref,
                })
                .select("id")
                .single();


            if (error || !created) {
              return Response.json(
                {
                  error:
                    "Could not create user",
                },
                { status: 500 }
              );
            }

            userId = created.id;
          }


          // Prevent duplicate successful payments
          const { data: existingPay } =
            await supabaseAdmin
              .from("payments")
              .select("reference,status")
              .eq("user_id", userId)
              .eq("plan", plan)
              .eq("status", "success")
              .maybeSingle();


          if (existingPay) {
            return Response.json(
              {
                error:
                  "You've already paid for this plan.",
              },
              { status: 409 }
            );
          }


          const reference = genReference(plan);

          const amount = PRICES[plan];


          // Save pending payment
          const { error: paymentError } =
            await supabaseAdmin
              .from("payments")
              .insert({
                user_id: userId,
                reference,
                amount,
                plan,
                status: "pending",
              });


          if (paymentError) {
            return Response.json(
              {
                error:
                  "Could not record payment",
              },
              { status: 500 }
            );
          }



          // Paystack Initialize
          const origin =
            new URL(request.url).origin;


          const psRes = await fetch(
            "https://api.paystack.co/transaction/initialize",
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

                "Content-Type":
                  "application/json",
              },


              body: JSON.stringify({

                email,

                amount:
                  amount * 100,

                reference,


                callback_url:
                  `${origin}/success?reference=${encodeURIComponent(reference)}`,


                metadata: {

                  user_id:
                    userId,


                  ref_id:
                    ref,


                  chat_id:
                    `paystack_${userId}`,


                  plan_type:
                    plan === "reset"
                      ? "Meal Plan Reset"
                      : "Premium Reset",


                  product_sku:
                    plan === "reset"
                      ? "resoflex-reset"
                      : "resoflex-premium",


                  funnel_origin:
                    plan === "reset"
                      ? "7_day_reset"
                      : "premium",


                  rsid:
                    ref,

                },

              }),
            }
          );


          const psJson: any =
            await psRes.json();


          if (!psRes.ok || !psJson.status) {

            await supabaseAdmin
              .from("payments")
              .update({
                status: "failed",
              })
              .eq(
                "reference",
                reference
              );


            return Response.json(
              {
                error:
                  psJson.message ||
                  "Paystack init failed",
              },
              {
                status: 502,
              }
            );
          }



          await supabaseAdmin
            .from("analytics")
            .insert({

              user_id: userId,

              event:
                "checkout_start",

              meta: {
                plan,
                reference,
              },

              ip,

            });



          return Response.json({

            authorization_url:
              psJson.data.authorization_url,

            reference,

            user_id:
              userId,

          });


        } catch (e: any) {

          console.error(
            "checkout error",
            e
          );


          return Response.json(
            {
              error:
                e?.message ||
                "Server error",
            },
            {
              status: 500,
            }
          );
        }
      },
    },
  },
});
