import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadSession, saveSession, track } from "@/lib/funnel";

export const Route = createFileRoute("/success")({
  head: () => ({
    meta: [{ title: "Payment Verified — ResoFlex" }],
  }),
  component: Success,
});

const GOLD = "#D4AF37";

type Phase = "checking" | "ok" | "pending";

function Success() {
  const [status, setStatus] = useState<Phase>("checking");
  const [reference, setReference] = useState<string>("");
  const [step, setStep] = useState(0);

  const steps = [
    "Authenticating Paystack charge ID…",
    "Cross-referencing Maria profile credentials…",
    "Decrypting biometric blueprint…",
    "Provisioning vault access…",
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref =
      params.get("reference") || params.get("trxref") || loadSession().last_reference || "";
    setReference(ref);

    if (!ref) {
      setStatus("pending");
      return;
    }

    const stepTimer = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 900);

    (async () => {
      for (let i = 0; i < 8; i++) {
        try {
          const r = await fetch(`/api/verify?reference=${encodeURIComponent(ref)}`);
          if (r.status === 429) {
            await new Promise((r) => setTimeout(r, 3000));
            continue;
          }
          const j = await r.json();
          if (j.status === "success") {
            saveSession({
              last_reference: ref,
              paid_plans: Array.from(new Set([...(loadSession().paid_plans ?? []), j.plan])),
            });
            track("payment_success", { plan: j.plan, reference: ref });
            clearInterval(stepTimer);
            setStatus("ok");
            // Auto-redirect to external dashboard after reveal
            setTimeout(() => {
              window.location.href = "https://reso-dash.lovable.app";
            }, 6000);
            return;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 2000));
      }
      clearInterval(stepTimer);
      setStatus("pending");
    })();

    return () => clearInterval(stepTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-black text-neutral-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        {status === "checking" && (
          <ValidatingPanel reference={reference} step={step} steps={steps} />
        )}

        {status === "pending" && (
          <div className="rounded-3xl border border-[color:var(--gold)]/30 bg-neutral-950 p-10 text-center"
               style={{ ["--gold" as any]: GOLD }}>
            <h1 className="text-3xl md:text-4xl">Awaiting confirmation</h1>
            <p className="mt-3 text-neutral-400">
              We're still syncing with Paystack. Your reference{" "}
              <code className="text-[color:var(--gold)]">{reference || "—"}</code> will unlock
              automatically.
            </p>
            <Link
              to="/vault"
              className="mt-8 inline-block rounded-full px-6 py-3 font-semibold text-black"
              style={{ background: GOLD }}
            >
              Open Vault
            </Link>
          </div>
        )}

        {status === "ok" && <SuccessPanel reference={reference} />}
      </div>
    </main>
  );
}

function ValidatingPanel({
  reference,
  step,
  steps,
}: {
  reference: string;
  step: number;
  steps: string[];
}) {
  return (
    <div
      className="rounded-3xl border bg-neutral-950 p-10"
      style={{ borderColor: `${GOLD}55` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-3 w-3 animate-pulse rounded-full"
          style={{ background: GOLD, boxShadow: `0 0 18px ${GOLD}` }}
        />
        <span
          className="text-xs uppercase tracking-[0.35em]"
          style={{ color: GOLD }}
        >
          Secure Validation
        </span>
      </div>

      <h1 className="mt-6 text-3xl md:text-4xl">
        Maria — <span style={{ color: GOLD }}>Credentials Checked &amp; Validated</span>
      </h1>
      <p className="mt-2 text-sm text-neutral-400">
        Reference:{" "}
        <code style={{ color: GOLD }}>{reference || "—"}</code>
      </p>

      <ul className="mt-8 space-y-3">
        {steps.map((s, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <li
              key={s}
              className="flex items-center gap-3 rounded-xl border px-4 py-3 transition"
              style={{
                borderColor: active ? GOLD : "#222",
                background: active ? `${GOLD}10` : "transparent",
              }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  background: done || active ? GOLD : "#444",
                  boxShadow: active ? `0 0 10px ${GOLD}` : undefined,
                }}
              />
              <span className={done ? "text-neutral-500 line-through" : "text-neutral-200"}>
                {s}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-neutral-900">
        <div
          className="h-full animate-pulse"
          style={{ width: "65%", background: GOLD }}
        />
      </div>
    </div>
  );
}

function SuccessPanel({ reference }: { reference: string }) {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: `${GOLD}20`, color: GOLD }}
        >
          ✓ Charge verified
        </span>
        <h1 className="mt-5 text-4xl md:text-5xl">
          Welcome, <span style={{ color: GOLD }}>Maria</span>.
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Reference <code style={{ color: GOLD }}>{reference}</code>
        </p>
      </div>

      {/* Biometric configuration card */}
      <section
        className="rounded-3xl border bg-neutral-950 p-8 shadow-2xl"
        style={{ borderColor: `${GOLD}66` }}
      >
        <div className="text-[10px] uppercase tracking-[0.4em]" style={{ color: GOLD }}>
          Personalized Biometric Configuration
        </div>
        <h2 className="mt-2 text-2xl md:text-3xl">Your blueprint is live</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div
            className="rounded-2xl border p-5"
            style={{ borderColor: `${GOLD}33`, background: "#0a0a0a" }}
          >
            <div className="text-xs uppercase tracking-widest text-neutral-500">
              Target Vectors
            </div>
            <div className="mt-2 text-lg" style={{ color: GOLD }}>
              Tummy Flatness &amp; Lean Arms
            </div>
          </div>
          <div
            className="rounded-2xl border p-5"
            style={{ borderColor: `${GOLD}33`, background: "#0a0a0a" }}
          >
            <div className="text-xs uppercase tracking-widest text-neutral-500">Protocol</div>
            <div className="mt-2 text-lg text-neutral-100">7-Day Reset · Tier I</div>
          </div>
        </div>

        {/* Allergy alert */}
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-2xl border-l-4 px-5 py-4"
          style={{
            borderColor: GOLD,
            background: `${GOLD}10`,
          }}
        >
          <span className="text-xl leading-none" style={{ color: GOLD }}>
            ⚠
          </span>
          <div>
            <div className="text-xs uppercase tracking-widest" style={{ color: GOLD }}>
              Strict Dietary Lock
            </div>
            <div className="mt-1 font-semibold text-neutral-100">
              Strictly No Onions (Allergy Blueprint Activated)
            </div>
          </div>
        </div>
      </section>

      {/* Upsell / Cross-sell */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl">
            Stack <span style={{ color: GOLD }}>your edge</span>
          </h2>
          <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">
            Upsell · Cross-sell
          </span>
        </div>

        {/* Hyper-Tone Stack action card */}
        <a
          href="https://paystack.shop/bodybuilding"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("upsell_click", { plan: "hyper-tone-stack" })}
          className="group relative block overflow-hidden rounded-3xl border p-8 transition hover:-translate-y-0.5"
          style={{
            borderColor: GOLD,
            background:
              "linear-gradient(135deg, #0a0a0a 0%, #161616 60%, rgba(212,175,55,0.18) 100%)",
          }}
        >
          <div
            className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl transition group-hover:opacity-50"
            style={{ background: GOLD }}
          />
          <div className="text-[10px] uppercase tracking-[0.4em]" style={{ color: GOLD }}>
            Featured Upgrade
          </div>
          <h3 className="mt-3 text-3xl md:text-4xl">Accelerated Hyper-Tone Stack</h3>
          <p className="mt-3 max-w-xl text-neutral-400">
            Advanced resistance + thermogenic protocol engineered to compound your Reset results.
          </p>
          <div
            className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-black"
            style={{ background: GOLD }}
          >
            Unlock the Stack <span aria-hidden>→</span>
          </div>
        </a>

        {/* Split button column */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <a
            href="https://paystack.shop/resoflex-luxe"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("crosssell_click", { store: "resoflex-luxe" })}
            className="group flex flex-col justify-between rounded-2xl border bg-neutral-950 p-6 transition hover:border-[color:var(--gold)]"
            style={{ borderColor: `${GOLD}44`, ["--gold" as any]: GOLD }}
          >
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em]" style={{ color: GOLD }}>
                Equipment Line
              </div>
              <div className="mt-2 text-xl text-neutral-100">ResoFlex Luxe</div>
              <p className="mt-2 text-sm text-neutral-500">
                Studio-grade gear for the at-home transformation suite.
              </p>
            </div>
            <div
              className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm transition group-hover:bg-[color:var(--gold)] group-hover:text-black"
              style={{ borderColor: GOLD, color: GOLD }}
            >
              Shop Luxe <span aria-hidden>→</span>
            </div>
          </a>

          <a
            href="https://paystack.shop/resonancefitness-store"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("crosssell_click", { store: "resonancefitness-store" })}
            className="group flex flex-col justify-between rounded-2xl border bg-neutral-950 p-6 transition hover:border-[color:var(--gold)]"
            style={{ borderColor: `${GOLD}44`, ["--gold" as any]: GOLD }}
          >
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em]" style={{ color: GOLD }}>
                Lifestyle Line
              </div>
              <div className="mt-2 text-xl text-neutral-100">Resonance Fitness Store</div>
              <p className="mt-2 text-sm text-neutral-500">
                Apparel, recovery & daily essentials to live the protocol.
              </p>
            </div>
            <div
              className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm transition group-hover:bg-[color:var(--gold)] group-hover:text-black"
              style={{ borderColor: GOLD, color: GOLD }}
            >
              Shop Lifestyle <span aria-hidden>→</span>
            </div>
          </a>
        </div>
      </section>

      {/* Vault CTA */}
      <div className="pt-2 text-center">
        <Link
          to="/vault"
          className="inline-block rounded-full px-8 py-3 font-semibold text-black"
          style={{ background: GOLD }}
        >
          Enter your Vault →
        </Link>
      </div>
    </div>
  );
}
