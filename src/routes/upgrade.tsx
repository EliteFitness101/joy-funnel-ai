import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, Sparkles, Check } from "lucide-react";
import { getRef, loadSession, saveSession, track } from "@/lib/funnel";
import { ResetMediaCarousel } from "@/components/premium/ResetMediaCarousel";

export const Route = createFileRoute("/upgrade")({
  head: () => ({
    meta: [
      { title: "Reset Plans — ResoFlex" },
      { name: "description", content: "Choose Reset, Meal Move, or NaijaFitRev 90-Day Fitness Evolution." },
    ],
  }),
  component: Upgrade,
});

const PLANS = [
  {
    id: "reset",
    name: "Reset",
    price: "₦1,000",
    summary: "Entry-level reset",
    duration: "7-day starter",
    benefits: ["7-Day Reset PDF", "Nigerian meal guidance", "10-minute home workouts", "Daily reset checklist"],
    featured: false,
  },
  {
    id: "meal_move",
    name: "Meal Move",
    price: "₦5,000",
    summary: "Your next step in daily consistency",
    duration: "Enhanced Meal & Move",
    benefits: ["Practical meal structure", "Movement plan", "Habit-building guidance", "Digital access"],
    featured: true,
  },
  {
    id: "naijafitrev_90_day",
    name: "NaijaFitRev",
    price: "₦10,000",
    summary: "90-Day Fitness Evolution",
    duration: "90-day evolution",
    benefits: ["90-day fitness evolution guide", "Meal and workout structure", "Progressive consistency plan", "Digital access"],
    featured: false,
  },
] as const;

type PlanId = (typeof PLANS)[number]["id"];

function Upgrade() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("meal_move");
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
        body: JSON.stringify({ email, phone, plan: selectedPlan, ref: getRef() }),
      });
      const result = await response.json();
      if (!response.ok || !result.authorization_url) {
        throw new Error(result.error ?? "checkout");
      }
      saveSession({ email, user_id: result.user_id, last_reference: result.reference });
      track("upsell_click", { plan: selectedPlan, stage: "redirect", sku: result.sku });
      window.location.href = result.authorization_url;
    } catch {
      setError("We couldn’t start checkout for that plan. Please try again in a moment.");
      setLoading(false);
    }
  }

  const chosenPlan = PLANS.find((plan) => plan.id === selectedPlan)!;

  return (
    <main className="luxe-gradient-bg min-h-screen px-4 pb-28 pt-8 sm:px-6 md:pb-16 md:pt-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <nav className="flex flex-wrap items-center gap-2" aria-label="Page navigation">
          <Link to="/" className="rounded-full border border-border bg-card/70 px-4 py-2 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground">Home</Link>
          <Link to="/status" className="rounded-full border border-border bg-card/70 px-4 py-2 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground">Payment status</Link>
          <Link to="/vault" className="rounded-full border border-border bg-card/70 px-4 py-2 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground">My Vault</Link>
        </nav>

        <section className="grid items-center gap-8 md:grid-cols-[1fr_1fr]">
          <div className="luxe-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary"><Crown size={14} /> ResoFlex plans</span>
            <h1 className="mt-5 text-4xl leading-[1.04] md:text-6xl">Your next level. <span className="italic text-primary luxe-glow">Your pace.</span></h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">Start with Reset, build consistency with Meal Move, or commit to a 90-day NaijaFitRev Fitness Evolution.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-border bg-card/70 px-3 py-2 text-xs text-muted-foreground">One-time payment</span>
              <span className="rounded-full border border-border bg-card/70 px-3 py-2 text-xs text-muted-foreground">Digital access</span>
              <span className="rounded-full border border-border bg-card/70 px-3 py-2 text-xs text-muted-foreground">Built for everyday life</span>
            </div>
          </div>
          <ResetMediaCarousel compact collection="premium" title="Meal Move and Fitness Evolution · video previews" />
        </section>

        <section aria-labelledby="plans-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Choose your plan</span>
              <h2 id="plans-heading" className="mt-2 text-3xl font-semibold md:text-4xl">Three clear ways to begin.</h2>
            </div>
            <p className="text-sm text-muted-foreground">No ₦3,000 tier. No recurring subscription.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((plan) => (
              <article key={plan.id} className={`luxe-card relative flex h-full flex-col ${plan.featured ? "border-primary/60 luxe-shadow" : ""}`}>
                {plan.featured && <span className="mb-3 inline-flex w-fit rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Recommended next step</span>}
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{plan.duration}</p>
                <h3 className="mt-2 text-2xl font-semibold">{plan.name}</h3>
                <p className="mt-2 min-h-10 text-sm text-muted-foreground">{plan.summary}</p>
                <p className="mt-5 font-display text-4xl text-primary">{plan.price}</p>
                <ul className="my-5 flex-1 space-y-3">
                  {plan.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  aria-pressed={selectedPlan === plan.id}
                  onClick={() => { setSelectedPlan(plan.id); setError(null); }}
                  className={`min-h-12 w-full rounded-full px-5 py-3 text-sm font-semibold transition ${selectedPlan === plan.id ? "bg-primary text-primary-foreground" : "border border-primary/40 text-primary hover:bg-primary/10"}`}
                >
                  {selectedPlan === plan.id ? "Selected plan" : `Choose ${plan.name}`}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="luxe-card mx-auto w-full max-w-2xl">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary"><Sparkles size={20} /></span>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Secure checkout</span>
              <h2 className="mt-2 text-2xl font-semibold">Continue with {chosenPlan.name} · {chosenPlan.price}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Enter your details to continue to Paystack.</p>
            </div>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="plan-email" className="block text-sm font-medium">Email address</label>
              <input id="plan-email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="mt-2 min-h-12 w-full rounded-full border border-border bg-background/70 px-5 outline-none transition focus:border-primary" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="plan-phone" className="block text-sm font-medium">Phone number</label>
              <input id="plan-phone" required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" className="mt-2 min-h-12 w-full rounded-full border border-border bg-background/70 px-5 outline-none transition focus:border-primary" placeholder="+234…" />
            </div>
            {error && <p role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <button disabled={loading} className="luxe-ripple flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Preparing secure checkout…" : `Continue to checkout · ${chosenPlan.price}`}
            </button>
            <p className="text-center text-xs text-muted-foreground">One-time payment · No recurring subscription</p>
          </form>
        </section>
      </div>
    </main>
  );
}
