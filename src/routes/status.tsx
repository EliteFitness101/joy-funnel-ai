import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Payment Status — ChatB2K" },
      { name: "description", content: "Check the verification state of your Paystack payment." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { reference?: string } => ({
    reference: (s.reference as string) ?? (s.trxref as string) ?? "",
  }),
  component: StatusPage,
});

type VerifyResp = { status?: string; plan?: string; error?: string };

function StatusPage() {
  const { reference: initialRef } = Route.useSearch();
  const [reference, setReference] = useState(initialRef ?? "");
  const [data, setData] = useState<VerifyResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const callbackUrl = `${origin}/status`;

  async function check(ref: string) {
    if (!ref) return;
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/verify?reference=${encodeURIComponent(ref)}`);
      const j = (await r.json()) as VerifyResp;
      setData(j);
    } catch (e: any) {
      setErr(e?.message ?? "request failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialRef) check(initialRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRef]);

  const status = data?.status ?? "—";
  const statusColor =
    status === "success"
      ? "text-green-600"
      : status === "pending"
      ? "text-amber-600"
      : status === "failed"
      ? "text-red-600"
      : "text-muted-foreground";

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="max-w-xl mx-auto space-y-8">
        <header className="space-y-2">
          <Link to="/" className="text-sm text-muted-foreground hover:underline">← Home</Link>
          <h1 className="text-3xl font-bold">Payment Status</h1>
          <p className="text-muted-foreground text-sm">
            Look up a Paystack reference and see the current verification state from the database.
          </p>
        </header>

        <section className="space-y-3 border rounded-lg p-4">
          <label className="text-sm font-medium">Paystack reference</label>
          <div className="flex gap-2">
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="rf_reset_..."
              className="flex-1 px-3 py-2 rounded-md border bg-background text-sm font-mono"
            />
            <button
              onClick={() => check(reference)}
              disabled={loading || !reference}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Checking…" : "Check"}
            </button>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          {data && (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-semibold uppercase ${statusColor}`}>{status}</span>
              </div>
              {data.plan && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-mono">{data.plan}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-xs break-all">{reference}</span>
              </div>
              {status === "success" && (
                <Link
                  to="/vault"
                  className="block mt-4 text-center px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium"
                >
                  Open Vault →
                </Link>
              )}
            </div>
          )}
        </section>

        <section className="space-y-3 border rounded-lg p-4 bg-muted/30">
          <h2 className="text-lg font-semibold">Paystack Callback URL</h2>
          <p className="text-sm text-muted-foreground">
            Paste this in your Paystack dashboard → Settings → API Keys & Webhooks → Callback URL.
            Paystack will redirect users here with <code className="px-1 bg-background rounded">?reference=...</code> after payment.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={callbackUrl}
              className="flex-1 px-3 py-2 rounded-md border bg-background text-sm font-mono"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(callbackUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="px-4 py-2 rounded-md border text-sm font-medium"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">Webhook URL (optional)</summary>
            <p className="mt-2">
              For server-to-server <code>charge.success</code> events, set the Webhook URL to{" "}
              <code className="px-1 bg-background rounded">{origin}/api/paystack/webhook</code> if you have one configured.
              The callback URL above is enough for the client-side verify flow.
            </p>
          </details>
        </section>
      </div>
    </div>
  );
}
