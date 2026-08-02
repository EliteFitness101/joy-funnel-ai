import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Animated ResoFlex monogram — pure inline SVG, no external spinner libs. */
export function BrandMark({ size = 56 }: { size?: number }) {
  return (
    <span
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="absolute inset-0 rounded-full border"
        style={{
          borderColor: "color-mix(in oklab, var(--luxe) 45%, transparent)",
          animation: "luxe-pulse-ring 1.8s ease-out infinite",
        }}
      />
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none">
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="var(--border)"
          strokeWidth="2"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="var(--luxe)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="34 92"
          style={{ transformOrigin: "center", animation: "luxe-spin 1.1s linear infinite" }}
        />
        <path
          d="M18 31V17h6.5a4.5 4.5 0 0 1 0 9H19l7 5"
          stroke="var(--luxe)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Three-dot "ChatB2K is thinking" indicator. */
export function ThinkingDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-end gap-1", className)} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block h-1.5 w-1.5 rounded-full bg-primary"
          style={{ animation: `luxe-dot 1.2s ${i * 0.15}s ease-in-out infinite` }}
        />
      ))}
    </span>
  );
}

/** Indeterminate premium progress bar. */
export function LuxeProgress({ value }: { value?: number }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-border/60">
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(4, value ?? 0))}%` }}
      />
    </div>
  );
}

/**
 * Branded full-surface loading screen with rotating status copy.
 * Replaces generic "Loading…" text everywhere.
 */
export function BrandedLoader({
  messages = ["Preparing your experience..."],
  subtle = false,
  className,
}: {
  messages?: string[];
  subtle?: boolean;
  className?: string;
}) {
  const [i, setI] = useState(0);
  const [pct, setPct] = useState(12);

  useEffect(() => {
    const m = window.setInterval(
      () => setI((p) => (p + 1) % Math.max(1, messages.length)),
      1600,
    );
    const p = window.setInterval(
      () => setPct((v) => (v >= 92 ? 92 : v + Math.random() * 9)),
      450,
    );
    return () => {
      window.clearInterval(m);
      window.clearInterval(p);
    };
  }, [messages.length]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "luxe-gradient-bg flex flex-col items-center justify-center gap-5 px-6 text-center",
        subtle ? "py-16" : "min-h-screen",
        className,
      )}
    >
      <span className="luxe-float">
        <BrandMark />
      </span>
      <div className="luxe-rise">
        <p className="font-display text-2xl luxe-glow">{messages[i]}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          ResoFlex Secure Layer
        </p>
      </div>
      <div className="w-full max-w-xs">
        <LuxeProgress value={pct} />
      </div>
    </div>
  );
}

/** Animated skeleton card — use instead of blank pages. */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="luxe-card p-5">
      <div className="luxe-shimmer h-4 w-2/5 rounded-full bg-border/70" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="luxe-shimmer h-3 rounded-full bg-border/50"
            style={{ width: `${92 - i * 14}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
