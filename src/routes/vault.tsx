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
          Logged in as {data.email}. Use the Reset Kit sections below on your phone.
        </p>

        <section className="mt-10 grid gap-4">
          <VaultItem title="7-Day Reset Guide" sub="Your daily reset rhythm" href="#kit" />
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

        <section id="kit" className="mt-8 scroll-mt-24">
          <LuxeCard>
            <LuxeCardTitle>7-Day Reset Guide</LuxeCardTitle>
            <LuxeCardMeta>Keep the routine practical: plan balanced meals, move at a comfortable level, drink water regularly, and protect a consistent sleep window. This is general wellness guidance, not medical treatment or a promise of a specific result.</LuxeCardMeta>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {["Plan tomorrow's meals before bed", "Include protein and vegetables where practical", "Choose movement you can complete safely", "Track consistency, energy and sleep"].map((item) => (
                <div key={item} className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">{item}</div>
              ))}
            </div>
          </LuxeCard>
        </section>

        <section id="meals" className="mt-6 scroll-mt-24">
          <LuxeCard>
            <LuxeCardTitle>Nigerian Meal Plan</LuxeCardTitle>
            <LuxeCardMeta>Flexible meal ideas. Swap foods you do not tolerate and follow clinician guidance for any medical dietary requirements.</LuxeCardMeta>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Day 1", "Oats and fruit", "Rice, beans and vegetables", "Fish or beans with plantain and greens"],
                ["Day 2", "Eggs with whole-grain bread", "Yam with egg sauce and vegetables", "Eba or amala with vegetable soup and protein"],
                ["Day 3", "Yogurt or soy yogurt with fruit", "Jollof rice with protein and salad", "Boiled potatoes with vegetables and eggs or beans"],
                ["Day 4", "Moi moi with fruit", "Beans and plantain with vegetables", "Rice with sauce, vegetables and protein"],
                ["Day 5", "Pap with moi moi or eggs", "Sweet potato with fish or beans", "Vegetable soup with a suitable swallow portion"],
                ["Day 6", "Oats with groundnuts or seeds", "Yam porridge with vegetables", "Rice with stew, vegetables and protein"],
                ["Day 7", "Akara with pap or fruit", "Beans, rice and vegetables", "A familiar home meal with vegetables and protein"]
              ].map(([day, breakfast, lunch, dinner]) => (
                <article key={day} className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card/90 to-primary/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">{day}</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Breakfast</span><br />{breakfast}</p>
                    <p><span className="text-muted-foreground">Lunch</span><br />{lunch}</p>
                    <p><span className="text-muted-foreground">Dinner</span><br />{dinner}</p>
                  </div>
                </article>
              ))}
            </div>
          </LuxeCard>
        </section>

        <section id="workouts" className="mt-6 scroll-mt-24">
          <LuxeCard>
            <LuxeCardTitle>10-Minute Home Workouts</LuxeCardTitle>
            <LuxeCardMeta>Rest when needed and stop if you feel pain, dizziness or unusual shortness of breath. Choose easier variations whenever necessary.</LuxeCardMeta>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Day 1", "March in place, chair squats, wall push-ups, calf raises"],
                ["Day 2", "Gentle walk in place, hip hinges, knee lifts, shoulder circles"],
                ["Day 3", "March in place, supported reverse steps, wall push-ups, seated reach"],
                ["Day 4", "Recovery walk and gentle hip, ankle, shoulder and back mobility"],
                ["Day 5", "Chair squats, wall push-ups, side steps and calf raises"],
                ["Day 6", "Comfortable movement intervals with easy recovery between rounds"],
                ["Day 7", "Easy walk, full-body mobility and review how the week felt"]
              ].map(([day, moves]) => (
                <article key={day} className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card/90 to-primary/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">{day}</p>
                  <p className="mt-2 text-sm leading-6">{moves}</p>
                </article>
              ))}
            </div>
          </LuxeCard>
        </section>

        <section id="checklist" className="mt-6 scroll-mt-24">
          <LuxeCard>
            <LuxeCardTitle>Daily Checklist</LuxeCardTitle>
            <LuxeCardMeta>Selections are local to this page session and are not saved to your account.</LuxeCardMeta>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {["Planned balanced meals", "Had water regularly", "Completed comfortable movement or recovery", "Included fruit or vegetables where practical", "Made time for rest", "Noted one thing that went well"].map((item) => (
                <label key={item} className="flex min-h-12 items-start gap-3 rounded-xl border border-primary/20 bg-card/70 p-4 text-sm">
                  <input type="checkbox" className="mt-0.5 h-4 w-4" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </LuxeCard>
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
