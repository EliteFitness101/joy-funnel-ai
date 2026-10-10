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
    "Confirming your Reset Kit order…",
    "Preparing your Reset Kit access…",
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
      className="rounded-3xl border bg-neutral-950/70 p-10 backdrop-blur-xl shadow-2xl"
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
        Checking your payment — <span style={{ color: GOLD }}>secure validation in progress</span>
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
    <div className="space-y-8">
      <section
        className="rounded-3xl border bg-neutral-950/80 p-6 shadow-2xl sm:p-10"
        style={{ borderColor: "rgba(212,175,55,.4)" }}
      >
        <span
          className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: "rgba(212,175,55,.12)", color: GOLD }}
        >
          ✓ Paystack charge verified
        </span>
        <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl">
          Your <span style={{ color: GOLD }}>7-Day Reset Kit</span> is ready.
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-300">
          Your payment reference has been verified. Open your ResoFlex vault to continue.
        </p>
        <p className="mt-4 break-all text-xs text-neutral-500">
          Reference: <code style={{ color: GOLD }}>{reference}</code>
        </p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2" aria-label="Included with the Reset Kit">
        {[
          ["01", "7-Day Reset PDF Guide"],
          ["02", "Nigerian Meal Plan"],
          ["03", "10-Minute Home Workouts"],
          ["04", "Daily Checklist"],
        ].map(([number, title]) => (
          <div
            key={number}
            className="flex min-w-0 items-center gap-4 rounded-2xl border p-4 sm:p-5"
            style={{ borderColor: "rgba(212,175,55,.2)", background: "linear-gradient(135deg, #111 0%, #080808 100%)" }}
          >
            <span className="shrink-0 font-semibold" style={{ color: GOLD }}>{number}</span>
            <span className="min-w-0 text-sm sm:text-base">{title}</span>
          </div>
        ))}
      </section>
      <div className="text-center">
        <Link
          to="/vault"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full px-8 py-3 font-semibold text-black sm:w-auto"
          style={{ background: GOLD }}
        >
          Open Your Vault →
        </Link>
        <p className="mt-3 text-xs text-neutral-500">
          Access is checked against your verified payment. If it is still syncing, use Payment Status.
        </p>
        <Link to="/status" className="mt-3 inline-block text-sm underline underline-offset-4" style={{ color: GOLD }}>
          Check payment status
        </Link>
      </div>
    </div>
  );
}
