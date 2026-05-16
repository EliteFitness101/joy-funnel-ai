import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getRef, loadSession, saveSession, track } from "@/lib/funnel";

export const Route = createFileRoute("/upgrade")({
  head: () => ({ meta: [{ title: "Upgrade — ResoFlex Premium (₦3,000)" }] }),
  component: Upgrade,
});

function Upgrade() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (s.email) setEmail(s.email);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, plan: "premium", ref: getRef() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      saveSession({ email, user_id: data.user_id, last_reference: data.reference });
      track("upsell_click", { plan: "premium", stage: "redirect" });
      window.location.href = data.authorization_url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-md">
        <Link to="/vault" className="text-sm text-muted-foreground hover:text-foreground">← back to vault</Link>
        <h1 className="mt-6 text-4xl md:text-5xl">Premium Upgrade</h1>
        <p className="mt-2 text-muted-foreground">21-day transformation · <span className="text-primary">₦3,000</span></p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-input px-4 py-3 outline-none focus:border-primary"
            placeholder="you@example.com"
          />
          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <button
            disabled={loading}
            className="w-full rounded-full bg-primary px-6 py-4 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Redirecting…" : "Pay ₦3,000 with Paystack"}
          </button>
        </form>
      </div>
    </main>
  );
}
