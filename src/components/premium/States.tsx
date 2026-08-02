import { cn } from "@/lib/utils";

type Props = {
  icon?: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
};

/** Branded empty state — never show a blank section. */
export function EmptyState({ icon, title, body, action, className }: Props) {
  return (
    <div
      className={cn(
        "luxe-card luxe-gradient-bg flex flex-col items-center gap-3 py-12 text-center",
        className,
      )}
    >
      <span className="luxe-float grid h-14 w-14 place-items-center rounded-2xl border border-border bg-card text-primary">
        {icon ?? <SparkGlyph />}
      </span>
      <h3 className="font-display text-2xl">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Branded error state with retry + offline awareness. */
export function ErrorState({
  title = "Something interrupted the connection",
  body = "Your data is safe. Give it another try — we'll pick up where you left off.",
  onRetry,
  offline = false,
  className,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
  offline?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "luxe-card flex flex-col items-center gap-3 py-12 text-center",
        className,
      )}
      role="alert"
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-destructive/40 bg-destructive/10 text-destructive">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 8v5m0 3.5h.01M10.3 3.9 2.6 17.4A2 2 0 0 0 4.3 20.4h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <h3 className="font-display text-2xl">
        {offline ? "You're offline" : title}
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        {offline
          ? "We'll reconnect automatically the moment your network returns."
          : body}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="luxe-ripple mt-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5"
        >
          Try again
        </button>
      )}
    </div>
  );
}

function SparkGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
