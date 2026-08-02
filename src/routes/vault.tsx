import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadSession, track } from "@/lib/funnel";
import { BrandedLoader } from "@/components/premium/BrandedLoader";
import { EmptyState } from "@/components/premium/States";
import { LuxeCard, LuxeCardMeta, LuxeCardTitle } from "@/components/premium/LuxeCard";



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
    <main className="luxe-gradient-bg min-h-screen px-5 pb-28 pt-10 sm:px-6 md:pb-16">
      <div className="mx-auto max-w-3xl">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <Link to="/" className="truncate text-sm text-muted-foreground">← home</Link>
          <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-primary">
            {isPremium ? "Premium · Unlocked" : "Reset · Unlocked"}
          </span>
        </div>
        <h1 className="luxe-rise mt-6 text-5xl md:text-6xl">
          Your <span className="italic text-primary luxe-glow">Vault</span>
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
              <div className="mt-6 text-xs uppercase tracking-[0.22em] text-primary">Premium</div>
              <VaultItem title="21-Day Transformation Plan" sub="Structured 3-week system" href="#21day" />
              <VaultItem title="Advanced Workouts" sub="HIIT + resistance progressions" href="#advanced" />
              <VaultItem title="Faster Results System" sub="Weekly tracker + nutrition rules" href="#system" />
            </>
          )}
        </section>

        {!isPremium && (
          <LuxeCard className="mt-12">
            <LuxeCardTitle>Ready for faster results?</LuxeCardTitle>
            <LuxeCardMeta>
              Unlock the 21-day Premium Transformation for ₦3,000.
            </LuxeCardMeta>
            <Link
              to="/upgrade"
              data-track="vault-upsell"
              onClick={() => track("upsell_click", { plan: "premium", from: "vault" })}
              className="luxe-ripple mt-5 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
            >
              Upgrade for faster results
            </Link>
          </LuxeCard>
        )}
      </div>
    </main>
  );
}

function VaultItem({ title, sub, href }: { title: string; sub: string; href: string }) {
  return (
    <a
      href={href}
      data-track={`vault-item:${title}`}
      className="luxe-card luxe-border-anim flex items-center justify-between gap-4 !p-5"
    >
      <div className="min-w-0">
        <div className="truncate font-semibold">{title}</div>
        <div className="truncate text-sm text-muted-foreground">{sub}</div>
      </div>
      <span className="shrink-0 text-primary">↓</span>
    </a>

  );
}
