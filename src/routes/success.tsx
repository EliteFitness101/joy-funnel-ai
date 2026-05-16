import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadSession, saveSession, track } from "@/lib/funnel";

export const Route = createFileRoute("/success")({
  head: () => ({
    meta: [{ title: "Payment Successful — ResoFlex" }],
  }),
  component: Success,
});

function Success() {
  const [status, setStatus] = useState<"checking" | "ok" | "pending">("checking");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference =
      params.get("reference") || params.get("trxref") || loadSession().last_reference;
    if (!reference) {
      setStatus("pending");
      return;
    }
    (async () => {
      // poll up to ~15s for webhook to mark success
      for (let i = 0; i < 8; i++) {
        const r = await fetch(`/api/verify?reference=${encodeURIComponent(reference)}`);
        const j = await r.json();
        if (j.status === "success") {
          saveSession({
            last_reference: reference,
            paid_plans: Array.from(new Set([...(loadSession().paid_plans ?? []), j.plan])),
          });
          track("payment_success", { plan: j.plan, reference });
          setStatus("ok");
          return;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      setStatus("pending");
    })();
  }, []);

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        {status === "checking" && (
          <>
            <h1 className="text-4xl md:text-5xl">Confirming payment…</h1>
            <p className="mt-4 text-muted-foreground">Hold on a sec.</p>
          </>
        )}
        {status === "pending" && (
          <>
            <h1 className="text-4xl md:text-5xl">Almost there</h1>
            <p className="mt-4 text-muted-foreground">
              We're still confirming with Paystack. Refresh in a moment, or open your vault — we'll
              unlock as soon as it's verified.
            </p>
            <Link
              to="/vault"
              className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-primary-foreground"
            >
              Open Vault
            </Link>
          </>
        )}
        {status === "ok" && (
          <>
            <span className="inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              ✓ Payment confirmed
            </span>
            <h1 className="mt-6 text-5xl md:text-6xl">
              Welcome to <span className="italic text-primary">ResoFlex</span>.
            </h1>
            <p className="mt-4 text-muted-foreground">Your 7-Day Reset Kit is unlocked.</p>

            {/* SINGLE upsell only */}
            <div className="mt-12 rounded-3xl border border-primary/30 bg-card p-8 text-left shadow-xl">
              <div className="text-xs uppercase tracking-widest text-primary">
                One-time upgrade · 70% off
              </div>
              <h2 className="mt-3 text-3xl md:text-4xl">
                Premium Transformation — 21 days, faster results.
              </h2>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>• 21-day structured transformation plan</li>
                <li>• Advanced workouts (resistance + HIIT)</li>
                <li>• Faster-results system & weekly tracker</li>
              </ul>
              <div className="mt-6 flex items-end gap-3">
                <span className="text-4xl font-bold text-primary">₦3,000</span>
                <span className="text-sm text-muted-foreground line-through">₦10,000</span>
              </div>
              <Link
                to="/upgrade"
                onClick={() => track("upsell_click", { plan: "premium" })}
                className="mt-6 inline-block w-full rounded-full bg-primary px-6 py-4 text-center font-semibold text-primary-foreground"
              >
                Upgrade for faster results
              </Link>
              <Link to="/vault" className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground">
                No thanks, just take me to my Kit →
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
