import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-xl font-bold tracking-tight">
          Reso<span className="text-primary">Flex</span><sup className="text-xs">™</sup>
        </div>
        <Link
          to="/checkout"
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Get the Kit
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 md:pt-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="inline-block rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              ₦1,000 · Instant Access
            </span>
            <h1 className="mt-6 text-5xl leading-[1.05] md:text-7xl">
              Drop the weight.<br />
              <span className="italic text-primary">Keep your jollof.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              The ResoFlex 7-Day Reset Kit: a Nigerian fat-loss meal plan,
              10-minute home workouts, and a daily checklist. Built for real
              Lagos & Abuja life.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/checkout"
                className="rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:translate-y-[-1px]"
              >
                Start my 7-Day Reset — ₦1,000
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Pay once · Instant vault access · Works on phone
            </p>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl border border-border bg-card p-8 shadow-2xl">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
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
            </div>
          </div>
        </div>
      </section>

      {/* Proof */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-3">
            <Stat n="2,400+" l="Resets delivered" />
            <Stat n="7 days" l="Visible results" />
            <Stat n="₦1,000" l="One-time payment" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="text-4xl md:text-5xl">
          Your reset starts <span className="italic text-primary">today.</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          One payment. Instant vault. No subscriptions.
        </p>
        <Link
          to="/checkout"
          className="mt-8 inline-block rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground"
        >
          Get my Kit — ₦1,000
        </Link>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ResoFlex™ — Reset Funnel OS
      </footer>
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
      <div className="font-display text-5xl text-primary">{n}</div>
      <div className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">{l}</div>
    </div>
  );
}
