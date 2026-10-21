import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadSession, track } from "@/lib/funnel";
import { BrandedLoader } from "@/components/premium/BrandedLoader";
import { LuxeCard, LuxeCardMeta, LuxeCardTitle } from "@/components/premium/LuxeCard";
import { ResetMediaCarousel } from "@/components/premium/ResetMediaCarousel";
import { BookOpen, Utensils, Dumbbell, ListChecks, Crown } from "lucide-react";

export const Route = createFileRoute("/vault")({
  head: () => ({ meta: [{ title: "Your Vault — ResoFlex" }] }),
  component: Vault,
});

type VaultData = { plans: string[]; email?: string; reference?: string };
type VaultTab = "guide" | "meals" | "workouts" | "checklist" | "premium";

const TAB_ITEMS = [
  { id: "guide", label: "Reset guide", icon: BookOpen },
  { id: "meals", label: "Meals", icon: Utensils },
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "checklist", label: "Checklist", icon: ListChecks },
] as const;

const MEALS = [
  ["Day 1", "Oatmeal with groundnuts", "Jollof rice with boiled egg", "Steamed okra and fish"],
  ["Day 2", "Moin moin (bean cake)", "Sweet potato and vegetables", "Garden egg salad"],
  ["Day 3", "Boiled yam and egg sauce", "Beans and plantain", "Clear fish broth"],
  ["Day 4", "Pap (ogi) and akara", "Rice and beans with stew", "Boiled corn and coconut"],
  ["Day 5", "Seasonal fruit", "Amala and ewedu with ponmo", "Grilled mackerel and cabbage"],
  ["Day 6", "Whole-wheat bread and tea", "Stir-fry noodles with vegetables", "Vegetable soup"],
  ["Day 7", "Pancakes with egg and milk", "Rice and a small chicken portion", "Light vegetable salad"],
];

const MOVES = [
  ["Day 1", "March in place, chair squats, wall push-ups, calf raises"],
  ["Day 2", "Gentle walk in place, hip hinges, knee lifts, shoulder circles"],
  ["Day 3", "March in place, supported reverse steps, wall push-ups, seated reach"],
  ["Day 4", "Recovery walk and gentle full-body mobility"],
  ["Day 5", "Chair squats, wall push-ups, side steps and calf raises"],
  ["Day 6", "Comfortable movement intervals with easy recovery"],
  ["Day 7", "Easy walk, full-body mobility and weekly reflection"],
];

function Vault() {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "ok">("loading");
  const [data, setData] = useState<VaultData>({ plans: [] });
  const [tab, setTab] = useState<VaultTab>("guide");
  const [checks, setChecks] = useState<string[]>([]);

  useEffect(() => {
    const session = loadSession();
    const reference = session.last_reference;
    const email = session.email;
    if (!reference && !email) {
      navigate({ to: "/status" });
      return;
    }
    (async () => {
      const query = reference ? `reference=${encodeURIComponent(reference)}` : `email=${encodeURIComponent(email!)}`;
      try {
        const response = await fetch(`/api/vault?${query}`);
        const result = await response.json();
        if (response.ok && result.verified && result.plans?.length) {
          setData({ plans: result.plans, email, reference: reference || undefined });
          setState("ok");
          track("vault_access", { plans: result.plans });
        } else navigate({ to: "/status" });
      } catch {
        navigate({ to: "/status" });
      }
    })();
  }, [navigate]);

  if (state === "loading") return <main><BrandedLoader messages={["Getting your Reset Kit ready…", "Opening your personal guide…", "Almost there…"]} /></main>;

  const isPremium = data.plans.includes("premium");
  const activeTabs = isPremium ? [...TAB_ITEMS, { id: "premium" as const, label: "Premium", icon: Crown }] : TAB_ITEMS;
  const checklist = ["Planned balanced meals", "Had water regularly", "Completed comfortable movement or recovery", "Included fruit or vegetables where practical", "Made time for rest", "Noted one thing that went well"];

  return (
    <main className="luxe-gradient-bg min-h-screen px-4 pb-28 pt-8 sm:px-6 md:pb-16 md:pt-12">
      <div className="mx-auto max-w-5xl space-y-7">
        <nav className="flex flex-wrap items-center gap-2" aria-label="Page navigation">
          <Link to="/" className="rounded-full border border-border bg-card/70 px-4 py-2 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground">Home</Link>
          <Link to="/status" className="rounded-full border border-border bg-card/70 px-4 py-2 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground">Payment status</Link>
          <Link to="/upgrade" className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20">Premium</Link>
          <span className="ml-auto rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">{isPremium ? "Premium access" : "Reset access"}</span>
        </nav>

        <header className="luxe-rise">
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary">Your personal collection</p>
          <h1 className="mt-3 text-5xl md:text-6xl">Your <span className="italic text-primary luxe-glow">Vault</span></h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Your guide, meal rhythm, movement sessions and daily checklist — together in one place.</p>
        </header>

        <ResetMediaCarousel title="Reset in motion · short preview" />

        <section aria-label="Vault sections">
          <div className="flex gap-2 overflow-x-auto pb-3" role="tablist" aria-label="Vault tabs">
            {activeTabs.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${tab === id ? "bg-primary text-primary-foreground luxe-shadow" : "border border-border bg-card/70 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
                <Icon size={16} />{label}
              </button>
            ))}
          </div>

          <div role="tabpanel" className="mt-3">
            {tab === "guide" && (
              <LuxeCard>
                <LuxeCardTitle>7-Day Reset Guide</LuxeCardTitle>
                <LuxeCardMeta>Keep the routine practical: plan balanced meals, move at a comfortable level, drink water regularly and protect a consistent sleep window.</LuxeCardMeta>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {["Plan tomorrow’s meals before bed", "Include protein and vegetables where practical", "Choose movement you can complete safely", "Track consistency, energy and sleep"].map((item, index) => <article key={item} className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card/90 to-primary/5 p-4"><span className="text-xs font-semibold text-primary">0{index + 1}</span><p className="mt-2 text-sm">{item}</p></article>)}
                </div>
              </LuxeCard>
            )}
            {tab === "meals" && (
              <LuxeCard>
                <LuxeCardTitle>Nigerian Meal Plan</LuxeCardTitle>
                <LuxeCardMeta>Seven days of familiar meal ideas. Adjust portions and swap foods to suit your needs and preferences.</LuxeCardMeta>
                {data.reference && <a href={`/api/meal-guide?reference=${encodeURIComponent(data.reference)}`} className="luxe-ripple mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Download meal-plan PDF</a>}
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {MEALS.map(([day, breakfast, lunch, dinner]) => <article key={day} className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card/90 to-primary/5 p-4"><p className="text-xs font-semibold uppercase tracking-widest text-primary">{day}</p><div className="mt-3 space-y-3 text-sm"><p><span className="text-muted-foreground">Breakfast</span><br />{breakfast}</p><p><span className="text-muted-foreground">Lunch</span><br />{lunch}</p><p><span className="text-muted-foreground">Dinner</span><br />{dinner}</p></div></article>)}
                </div>
              </LuxeCard>
            )}
            {tab === "workouts" && (
              <LuxeCard>
                <LuxeCardTitle>10-Minute Home Workouts</LuxeCardTitle>
                <LuxeCardMeta>Choose comfortable variations, rest when needed and stop if you feel pain, dizziness or unusual shortness of breath.</LuxeCardMeta>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {MOVES.map(([day, moves]) => <article key={day} className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card/90 to-primary/5 p-4"><p className="text-xs font-semibold uppercase tracking-widest text-primary">{day}</p><p className="mt-3 text-sm leading-6">{moves}</p></article>)}
                </div>
              </LuxeCard>
            )}
            {tab === "checklist" && (
              <LuxeCard>
                <LuxeCardTitle>Daily Checklist</LuxeCardTitle>
                <LuxeCardMeta>Tick off the habits you complete today. Your selections stay in this page session.</LuxeCardMeta>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {checklist.map((item) => <label key={item} className="flex min-h-12 items-start gap-3 rounded-2xl border border-primary/20 bg-card/70 p-4 text-sm"><input type="checkbox" checked={checks.includes(item)} onChange={(event) => setChecks((current) => event.target.checked ? [...current, item] : current.filter((entry) => entry !== item))} className="mt-0.5 h-4 w-4 accent-primary" /><span>{item}</span></label>)}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">{checks.length} of {checklist.length} habits checked</p>
              </LuxeCard>
            )}
            {tab === "premium" && (
              <LuxeCard>
                <LuxeCardTitle>21-Day Premium Transformation</LuxeCardTitle>
                <LuxeCardMeta>Explore a longer progression with structured movement, practical nutrition guidance and a weekly consistency review.</LuxeCardMeta>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">{["21-day structured plan", "Advanced workout progressions", "Weekly tracker"].map((item) => <div key={item} className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">{item}</div>)}</div>
              </LuxeCard>
            )}
          </div>
        </section>

        {!isPremium && <LuxeCard className="mt-4"><LuxeCardTitle>Ready for the next step?</LuxeCardTitle><LuxeCardMeta>Explore the 21-day Premium Transformation for ₦3,000.</LuxeCardMeta><Link to="/upgrade" data-track="vault-upsell" onClick={() => track("upsell_click", { plan: "premium", from: "vault" })} className="luxe-ripple mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Explore Premium · ₦3,000</Link></LuxeCard>}
      </div>
    </main>
  );
}
