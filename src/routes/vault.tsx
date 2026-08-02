import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadSession, track } from "@/lib/funnel";
import { BrandedLoader } from "@/components/premium/BrandedLoader";
import { EmptyState } from "@/components/premium/States";


export const Route = createFileRoute("/vault")({
  head: () => ({ meta: [{ title: "Your Vault — ResoFlex" }] }),
  component: Vault,
});

type VaultData = {
  plans: string[];
  email?: string;
};

function Vault() {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "ok" | "locked">("loading");
  const [data, setData] = useState<VaultData>({ plans: [] });

  useEffect(() => {
    const s = loadSession();
    const ref = s.last_reference;
    const email = s.email;
    if (!ref && !email) {
      navigate({ to: "/status" });
      return;
    }
    (async () => {
      const qs = ref
        ? `reference=${encodeURIComponent(ref)}`
        : `email=${encodeURIComponent(email!)}`;
      try {
        const r = await fetch(`/api/vault?${qs}`);
        const j = await r.json();
        if (j.verified && j.plans?.length) {
          setData({ plans: j.plans, email });
          setState("ok");
          track("vault_access", { plans: j.plans });
        } else {
          navigate({ to: "/status" });
        }
      } catch {
        navigate({ to: "/status" });
      }
    })();
  }, [navigate]);

  if (state === "loading") {
    return (
      <main>
        <BrandedLoader
          messages={[
            "Authenticating your Resonance session…",
            "Decrypting your vault keys…",
            "Assembling your personalised kit…",
          ]}
        />
      </main>
    );
  }

  if (state === "locked") {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <EmptyState
            title="Vault locked"
            body="Complete your ₦1,000 payment and your Reset Kit unlocks here instantly."
            action={
              <button
                onClick={() => navigate({ to: "/checkout" })}
                className="luxe-ripple rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
              >
                Get the Kit — ₦1,000
              </button>
            }
          />
        </div>
      </main>
    );
  }


  const isPremium = data.plans.includes("premium");

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-sm text-muted-foreground">← home</Link>
          <span className="text-xs uppercase tracking-widest text-primary">
            {isPremium ? "Premium · Unlocked" : "Reset · Unlocked"}
          </span>
        </div>
        <h1 className="mt-6 text-5xl md:text-6xl">
          Your <span className="italic text-primary">Vault</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Logged in as {data.email}. Open files on your phone or download.
        </p>

        <section className="mt-10 grid gap-4">
          <VaultItem title="ResoFlex 7-Day Reset Kit (PDF)" sub="Core program guide" href="#kit" />
          <VaultItem title="Nigerian Fat-Loss Meal Plan" sub="Jollof-friendly weekly meals" href="#meals" />
          <VaultItem title="10-Minute Home Workouts" sub="No equipment needed" href="#workouts" />
          <VaultItem title="Daily Checklist" sub="Print or save to phone" href="#checklist" />

          {isPremium && (
            <>
              <div className="mt-6 text-xs uppercase tracking-widest text-primary">Premium</div>
              <VaultItem title="21-Day Transformation Plan" sub="Structured 3-week system" href="#21day" />
              <VaultItem title="Advanced Workouts" sub="HIIT + resistance progressions" href="#advanced" />
              <VaultItem title="Faster Results System" sub="Weekly tracker + nutrition rules" href="#system" />
            </>
          )}
        </section>

        {!isPremium && (
          <div className="mt-12 rounded-2xl border border-primary/30 bg-card p-6">
            <h3 className="text-2xl">Ready for faster results?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Unlock the 21-day Premium Transformation for ₦3,000.
            </p>
            <Link
              to="/upgrade"
              onClick={() => track("upsell_click", { plan: "premium", from: "vault" })}
              className="mt-4 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
            >
              Upgrade for faster results
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function VaultItem({ title, sub, href }: { title: string; sub: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition hover:border-primary/60"
    >
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{sub}</div>
      </div>
      <span className="text-primary">↓</span>
    </a>
  );
}
