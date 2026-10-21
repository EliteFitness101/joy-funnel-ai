import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, Sparkles, Check } from "lucide-react";
import { getRef, loadSession, saveSession, track } from "@/lib/funnel";
import { ResetMediaCarousel } from "@/components/premium/ResetMediaCarousel";

export const Route = createFileRoute("/upgrade")({
  head: () => ({ meta: [{ title: "Premium Upgrade — ResoFlex" }, { name: "description", content: "Explore the ResoFlex 21-day Premium Transformation plan." }] }),
  component: Upgrade,
});

const BENEFITS = [
  "A structured 21-day routine",
  "Progressive home workout sessions",
  "Practical meal and habit guidance",
  "Weekly review and consistency tracker",
];

function Upgrade() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = loadSession();
    if (session.email) setEmail(session.email);
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, plan: "premium", ref: getRef() }),
      });
      const result = await response.json();
      if (!response.ok || !result.authorization_url) throw new Error("checkout");
      saveSession({ email, user_id: result.user_id, last_reference: result.reference });
      track("upsell_click", { plan: "premium", stage: "redirect" });
      window.location.href = result.authorization_url;
    } catch {
      setError("We couldn’t start checkout right now. Please try again in a moment.");
      setLoading(false);
    }
  }

  return (
    <main className="luxe-gradient-bg min-h-screen px-4 pb-28 pt-8 sm:px-6 md:pb-16 md:pt-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <nav className="flex flex-wrap items-center gap-2" aria-label="Page navigation">
          <Link to="/" className="rounded-full border border-border bg-card/70 px-4 py-2 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground">Home</Link>
          <Link to="/status" className="rounded-full border border-border bg-card/70 px-4 py-2 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground">Payment status</Link>
          <Link to="/vault" className="rounded-full border border-border bg-card/70 px-4 py-2 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground">My Vault</Link>
        </nav>

        <section className="grid items-center gap-8 md:grid-cols-[1.05fr_.95fr]">
          <div className="luxe-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary"><Crown size={14} /> ResoFlex Premium</span>
            <h1 className="mt-5 text-4xl leading-[1.04] md:text-6xl">Build a rhythm that <span className="italic text-primary luxe-glow">lasts.</span></h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">A guided 21-day progression for your meals, movement and daily habits — designed to fit around everyday life.</p>
            <div className="mt-6 flex flex-wrap items-end gap-3">
              <span className="font-display text-5xl text-primary">₦3,000</span>
              <span className="pb-1 text-sm text-muted-foreground">one-time payment</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-border bg-card/70 px-3 py-2 text-xs text-muted-foreground">21-day plan</span>
              <span className="rounded-full border border-border bg-card/70 px-3 py-2 text-xs text-muted-foreground">At-home movement</span>
              <span className="rounded-full border border-border bg-card/70 px-3 py-2 text-xs text-muted-foreground">Practical meals</span>
            </div>
          </div>
          <ResetMediaCarousel compact collection="premium" title="Premium offers · video previews" />
        </section>

        <section className="luxe-card">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary"><Sparkles size={20} /></span>
            <div><h2 className="text-2xl font-semibold">What’s inside</h2><p className="mt-1 text-sm text-muted-foreground">A clear structure to help you show up one day at a time.</p></div>
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {BENEFITS.map((benefit) => <li key={benefit} className="flex items-start gap-3 rounded-2xl border border-border bg-background/50 p-4 text-sm"><Check size={17} className="mt-0.5 shrink-0 text-primary" /><span>{benefit}</span></li>)}
          </ul>
        </section>

        <section className="luxe-card mx-auto w-full max-w-xl">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Start Premium</span>
          <h2 className="mt-2 text-2xl font-semibold">Your next 21 days start here.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Enter your email to continue to secure checkout.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label htmlFor="premium-email" className="block text-sm font-medium">Email address</label>
            <input id="premium-email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="min-h-12 w-full rounded-full border border-border bg-background/70 px-5 outline-none transition focus:border-primary" placeholder="you@example.com" />
            {error && <p role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <button disabled={loading} className="luxe-ripple flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Preparing secure checkout…" : "Continue to checkout · ₦3,000"}</button>
            <p className="text-center text-xs text-muted-foreground">One-time payment · No recurring subscription</p>
          </form>
        </section>
      </div>
    </main>
  );
}
