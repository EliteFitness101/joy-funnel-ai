// Behavior signal layer — captures scroll depth, time-on-page, exit intent,
// and click events, then forwards to /api/track. Additive over funnel.ts.
import { track } from "./funnel";

type Options = {
  page: string;
  meta?: Record<string, unknown>;
};

export function installBehaviorSignals({ page, meta = {} }: Options) {
  if (typeof window === "undefined") return () => {};

  const startedAt = Date.now();
  let maxScroll = 0;
  let exitFired = false;
  let unloadFired = false;

  void track("page_view", { page, ...meta });

  const onScroll = () => {
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    if (total <= 0) return;
    const pct = Math.min(100, Math.round(((window.scrollY || 0) / total) * 100));
    if (pct > maxScroll) maxScroll = pct;
  };

  const onClick = (e: MouseEvent) => {
    const el = (e.target as HTMLElement | null)?.closest("a,button,[data-track]");
    if (!el) return;
    const label =
      el.getAttribute("data-track") ||
      el.getAttribute("aria-label") ||
      (el.textContent ?? "").trim().slice(0, 64);
    void track("click", { page, label, tag: el.tagName.toLowerCase() });
  };

  const onMouseOut = (e: MouseEvent) => {
    if (exitFired) return;
    if (e.clientY <= 0 || (!e.relatedTarget && e.movementY < 0)) {
      exitFired = true;
      void track("exit_intent", { page, dwell_ms: Date.now() - startedAt });
    }
  };

  const flush = () => {
    if (unloadFired) return;
    unloadFired = true;
    void track("session_end", {
      page,
      dwell_ms: Date.now() - startedAt,
      scroll_depth: maxScroll,
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("click", onClick, true);
  document.addEventListener("mouseout", onMouseOut);
  window.addEventListener("pagehide", flush);
  window.addEventListener("beforeunload", flush);

  return () => {
    flush();
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("mouseout", onMouseOut);
    window.removeEventListener("pagehide", flush);
    window.removeEventListener("beforeunload", flush);
  };
}
