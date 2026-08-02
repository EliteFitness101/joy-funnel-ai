import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ShieldCheck, Lock, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/status", label: "Status", icon: ShieldCheck },
  { to: "/vault", label: "Vault", icon: Lock },
  { to: "/upgrade", label: "Premium", icon: Crown },
] as const;

/** Thumb-reachable bottom nav (mobile only), safe-area aware. */
export function MobileBottomNav() {
  const pathname = useRouterState({
    select: (r) => r.location.pathname,
  });

  return (
    <nav
      aria-label="Primary"
      className="luxe-glass fixed inset-x-0 bottom-0 z-40 border-t md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Sticky primary CTA for mobile funnel pages. */
export function StickyCta({
  to,
  label,
  note,
}: {
  to: string;
  label: string;
  note?: string;
}) {
  return (
    <div
      className="luxe-glass fixed inset-x-0 bottom-[64px] z-30 px-4 py-3 md:hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <Link
        to={to}
        data-track={`sticky-cta:${label}`}
        className="luxe-ripple flex min-h-[52px] items-center justify-center rounded-full bg-primary px-6 text-center text-sm font-bold text-primary-foreground"
      >
        {label}
      </Link>
      {note && (
        <p className="mt-1.5 text-center text-[11px] text-muted-foreground">{note}</p>
      )}
    </div>
  );
}
