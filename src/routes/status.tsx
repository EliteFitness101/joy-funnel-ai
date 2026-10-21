import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ResetMediaCarousel } from "@/components/premium/ResetMediaCarousel";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Payment Status — ResoFlex Reset" },
      { name: "description", content: "Check your Reset Kit payment and continue to your wellness guide." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { reference?: string } => ({
    reference: (s.reference as string) ?? (s.trxref as string) ?? "",
  }),
  component: StatusPage,
});

type VerifyResp = { status?: string; plan?: string };

function StatusPage() {
  const { reference: initialRef } = Route.useSearch();
  const [reference, setReference] = useState(initialRef ?? "");
  const [data, setData] = useState<VerifyResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  async function check(ref: string) {
    if (!ref.trim()) {
      setData(null);
      setChecked(false);
      return;
    }
    setLoading(true);
    setData(null);
    setChecked(false);
    try {
      const response = await fetch(`/api/verify?reference=${encodeURIComponent(ref.trim())}`);
      if (!response.ok) throw new Error("verification");
      const result = (await response.json()) as VerifyResp;
      setData(result);
    } catch {
      setData(null);
      setChecked(true);
      setLoading(false);
      return;
    }
    setChecked(true);
    setLoading(false);
  }

  useEffect(() => {
    if (initialRef) void check(initialRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRef]);

  const status = data?.status;
  const success = status === "success";
  const pending = status === "pending";
  const failed = status === "failed";

  return (
    <main className="luxe-gradient-bg min-h-screen px-4 pb-28 pt-8 sm:px-6 md:pb-16 md:pt-12">
      <div className="mx-auto max-w-3xl space-y-7">
        <nav className="flex flex-wrap items-center gap-2" aria-label="Page navigation">
          <Link to="/" className="rounded-full border border-border bg-card/70 px-4 py-2 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground">Home</Link>
          <Link to="/vault" className="rounded-full border border-border bg-card/70 px-4 py-2 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground">My Vault</Link>
          <Link to="/upgrade" className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20">Premium</Link>
        </nav>

        <header className="luxe-rise">
          <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Your order · Secure check</span>
          <h1 className="mt-4 text-4xl md:text-6xl">Payment <span className="italic text-primary luxe-glow">status</span></h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">Enter your payment reference to check your order and continue to your Reset Kit.</p>
        </header>

        <section className="luxe-card space-y-4">
          <label htmlFor="payment-reference" className="text-sm font-semibold">Payment reference</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input id="payment-reference" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Enter your payment reference" autoComplete="off" className="min-h-12 min-w-0 flex-1 rounded-full border border-border bg-background/70 px-5 text-sm outline-none transition focus:border-primary" />
            <button type="button" onClick={() => void check(reference)} disabled={loading || !reference.trim()} className="luxe-ripple min-h-12 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Checking…" : "Check payment"}</button>
          </div>

          {checked && !data && (
            <div role="status" className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">We couldn’t check that reference just now. Please review it and try again.</div>
          )}
          {data && (
            <div role="status" className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Order update</p>
              <h2 className="mt-2 text-xl font-semibold">{success ? "Payment confirmed" : pending ? "Payment is processing" : failed ? "Payment not completed" : "No confirmed payment yet"}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{success ? "Your payment is confirmed. Open your Vault to access the kit." : pending ? "Your payment is still being processed. Check again shortly." : failed ? "This payment was not completed. You can return to checkout and try again." : "We don’t have a confirmed payment for that reference. Double-check it or try again shortly."}</p>
              {success && <Link to="/vault" className="luxe-ripple mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Open my Vault <span aria-hidden="true" className="ml-2">→</span></Link>}
              {!success && <button type="button" onClick={() => void check(reference)} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-primary/40 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10">Check again</button>}
            </div>
          )}
        </section>

        <ResetMediaCarousel compact collection="lifestyle" title="From market to kitchen · everyday wellness" />

        <p className="text-center text-xs text-muted-foreground">Need help? Keep your payment reference handy when contacting support.</p>
      </div>
    </main>
  );
}
