import { createFileRoute, Link } from "@tanstack/react-router";
import { LuxeCard, LuxeCardMeta, LuxeCardTitle } from "@/components/premium/LuxeCard";
import { SECTIONS, SectionIcon, ThemedSection, type SectionKey } from "@/components/premium/sections";
import { StickyCta } from "@/components/premium/MobileNav";
import { usePersona } from "@/hooks/usePersona";

export const Route = createFileRoute("/")({
  component: Landing,
});

const PILLARS: SectionKey[] = [
  "fitness",
  "nutrition",
  "therapy",
  "recovery",
  "women",
  "supplements",
];

function Landing() {
  const persona = usePersona();

  return (
    <main className="min-h-screen pb-40 md:pb-0">
      {/* Nav */}
      <header className="luxe-glass sticky top-0 z-30 border-b">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-6">
          <div className="min-w-0 truncate text-lg font-bold tracking-tight">
            Reso<span className="text-primary">Flex</span>
            <sup className="text-[10px]">™</sup>
          </div>
          <Link
            to={persona.nextAction.to}
            data-track="nav-cta"
            className="luxe-ripple hidden shrink-0 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 md:block"
          >
            {persona.isMember ? "My Vault" : "Get the Kit"}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <ThemedSection section="dashboard" className="luxe-gradient-bg">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-6 md:pt-20">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="luxe-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                ₦1,000 · Instant Access
              </span>
              <p className="mt-5 text-sm uppercase tracking-[0.28em] text-muted-foreground">
                {persona.greeting}
                {persona.firstName ? `, ${persona.firstName}` : ""}
              </p>
              <h1 className="mt-3 text-[2.75rem] leading-[1.03] md:text-7xl">
                Drop the weight.
                <br />
                <span className="italic text-primary luxe-glow">Keep your jollof.</span>
              </h1>
              <p className="mt-6 max-w-md text-lg text-muted-foreground">
                The ResoFlex 7-Day Reset Kit: a Nigerian fat-loss meal plan,
                10-minute home workouts, and a daily checklist. Built for real
                Lagos &amp; Abuja life.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to={persona.nextAction.to}
                  data-track="hero-cta"
                  className="luxe-ripple rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground luxe-shadow transition hover:-translate-y-0.5"
                >
                  {persona.nextAction.label}
                </Link>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                {persona.nextAction.note} · Works on phone
              </p>
              {persona.isReferred && (
                <p className="mt-2 text-xs text-primary">
                  Referral credit applied to this session.
                </p>
              )}
            </div>

            <div className="relative">
              <LuxeCard className="aspect-[4/5] !p-7 luxe-shadow">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      Inside the Kit
                    </div>
                    <ul className="mt-6 space-y-4 text-lg">
                      <KitItem n="01" t="7-Day Reset PDF Guide" />
                      <KitItem n="02" t="Nigerian Meal Plan" />
                      <KitItem n="03" t="10-min Home Workouts" />
                      <KitItem n="04" t="Daily Checklist" />
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-4 text-sm text-primary">
                    Delivered instantly after payment.
                  </div>
                </div>
              </LuxeCard>
            </div>
          </div>
        </div>
      </ThemedSection>

      {/* Proof */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <Stat n="2,400+" l="Resets delivered" />
            <Stat n="7 days" l="Visible results" />
            <Stat n="₦1,000" l="One-time payment" />
          </div>
        </div>
      </section>

      {/* Pillars — each card carries its own section theme */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
        <h2 className="text-4xl md:text-5xl">
          One ecosystem. <span className="italic text-primary">Every pillar.</span>
        </h2>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Fitness, nutrition, therapy, recovery and more — tuned to how you
          actually live.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((key) => {
            const s = SECTIONS[key];
            return (
              <div key={key} className={s.theme}>
                <LuxeCard>
                  <div className="flex min-w-0 items-start gap-4">
                    <SectionIcon section={key} />
                    <div className="min-w-0">
                      <LuxeCardTitle>{s.label}</LuxeCardTitle>
                      <LuxeCardMeta>{s.blurb}</LuxeCardMeta>
                    </div>
                  </div>
                </LuxeCard>
              </div>
            );
          })}
        </div>
      </section>

      {/* Elite + Referral */}
      <div className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 sm:px-6 md:grid-cols-2">
        <ThemedSection section="elite" className="rounded-3xl">
          <LuxeCard className="h-full">
            <SectionIcon section="elite" />
            <LuxeCardTitle className="mt-4">Elite Concierge</LuxeCardTitle>
            <LuxeCardMeta>
              Programming, check-ins and adjustments handled for you.
            </LuxeCardMeta>
            <Link
              to="/upgrade"
              data-track="elite-card"
              className="luxe-ripple mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Explore Premium
            </Link>
          </LuxeCard>
        </ThemedSection>

        <ThemedSection section="referral" className="rounded-3xl">
          <LuxeCard className="h-full">
            <SectionIcon section="referral" />
            <LuxeCardTitle className="mt-4">Invite &amp; Earn</LuxeCardTitle>
            <LuxeCardMeta>
              Share your link — referral credit lands automatically once your
              friend completes payment.
            </LuxeCardMeta>
            <Link
              to="/status"
              data-track="referral-card"
              className="mt-6 inline-block rounded-full border border-primary/50 px-6 py-3 text-sm font-semibold text-primary"
            >
              View my status
            </Link>
          </LuxeCard>
        </ThemedSection>
      </div>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-6">
        <h2 className="text-4xl md:text-5xl">
          Your reset starts <span className="italic text-primary">today.</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          One payment. Instant vault. No subscriptions.
        </p>
        <Link
          to={persona.nextAction.to}
          data-track="footer-cta"
          className="luxe-ripple mt-8 inline-block rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground luxe-shadow"
        >
          {persona.nextAction.label}
        </Link>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ResoFlex™ — Reset Funnel OS
      </footer>

      <StickyCta
        to={persona.nextAction.to}
        label={persona.nextAction.label}
        note={persona.nextAction.note}
      />
    </main>
  );
}

function KitItem({ n, t }: { n: string; t: string }) {
  return (
    <li className="flex items-start gap-4">
      <span className="font-display text-primary">{n}</span>
      <span>{t}</span>
    </li>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-5xl text-primary luxe-glow">{n}</div>
      <div className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
        {l}
      </div>
    </div>
  );
}
