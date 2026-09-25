import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { captureAttributionFromUrl, getAttribution, loadSession, saveSession, track } from "@/lib/funnel";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — ResoFlex 7-Day Reset (₦1,000)" },
      { name: "description", content: "Pay ₦1,000 to unlock the ResoFlex 7-Day Reset Kit." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (s.email) setEmail(s.email);
    captureAttributionFromUrl();
    track("checkout_start", { plan: "reset", sku: "res-dig-reset" });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const attr = getAttribution();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          plan: "reset",
          sku: "res-dig-reset",
          ref: attr.ref,
          rsid: attr.rsid,
          session_id: attr.session_id,
          ttclid: attr.ttclid,
          funnel_origin: attr.funnel_origin ?? "7_day_reset",
          utm_source: attr.utm_source,
          utm_medium: attr.utm_medium,
          utm_campaign: attr.utm_campaign,
          utm_term: attr.utm_term,
          utm_content: attr.utm_content,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      saveSession({ email, user_id: data.user_id, last_reference: data.reference, rsid: data.rsid ?? attr.rsid });
      window.location.href = data.authorization_url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-md">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← back
        </Link>
        <h1 className="mt-6 text-4xl md:text-5xl">Checkout</h1>
        <p className="mt-2 text-muted-foreground">
          ResoFlex 7-Day Reset Kit · <span className="text-primary">₦1,000</span>
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-input px-4 py-3 outline-none focus:border-primary" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Phone (required for Paystack checkout)</label>
            <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-input px-4 py-3 outline-none focus:border-primary" placeholder="+234…" />
          </div>

          {error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <button disabled={loading} className="w-full rounded-full bg-primary px-6 py-4 text-base font-semibold text-primary-foreground disabled:opacity-60">
            {loading ? "Redirecting to Paystack…" : "Pay ₦1,000 with Paystack"}
          </button>
          <p className="text-center text-xs text-muted-foreground">Secure payment · Instant vault access after success</p>
        </form>
      </div>
    </main>
  );
}

