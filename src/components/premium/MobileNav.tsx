import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ShieldCheck, Lock, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Home", caption: "Discover", icon: Home },
  { to: "/status", label: "Status", caption: "Your order", icon: ShieldCheck },
  { to: "/vault", label: "Vault", caption: "Your kit", icon: Lock },
  { to: "/upgrade", label: "Premium", caption: "Go further", icon: Crown },
] as const;

/** Thumb-reachable, safe-area aware navigation with a consistent pill language. */
export function MobileBottomNav() {
  const pathname = useRouterState({ select: (router) => router.location.pathname });

  return (
    <nav aria-label="Primary" className="luxe-glass fixed inset-x-0 bottom-0 z-40 border-t border-white/10 md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <ul className="mx-auto grid max-w-md grid-cols-4 gap-1 px-2 py-2">
        {ITEMS.map(({ to, label, caption, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to} className="min-w-0">
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-center transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
                  active ? "border border-primary/30 bg-primary/10 text-primary shadow-[0_0_24px_-12px_hsl(var(--primary))]" : "border border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                <Icon size={18} strokeWidth={active ? 2.3 : 1.7} />
                <span className="text-[10px] font-semibold leading-none">{label}</span>
                <span className={cn("text-[9px] leading-none", active ? "text-primary/80" : "text-muted-foreground/70")}>{caption}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Sticky primary CTA for mobile funnel pages. */
export function StickyCta({ to, label, note }: { to: string; label: string; note?: string }) {
  return (
    <div className="luxe-glass fixed inset-x-0 bottom-[78px] z-30 px-4 py-3 md:hidden" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
      <Link to={to} data-track={`sticky-cta:${label}`} className="luxe-ripple flex min-h-[50px] items-center justify-center rounded-full bg-primary px-6 text-center text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5">
        {label}
      </Link>
      {note && <p className="mt-1.5 text-center text-[11px] text-muted-foreground">{note}</p>}
    </div>
  );
}
