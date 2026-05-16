// Client-side funnel helpers: referral capture, session restore, tracking.
export const SESSION_KEY = "resoflex_session_v1";
export const REF_KEY = "resoflex_ref";

export type FunnelSession = {
  user_id?: string;
  email?: string;
  ref?: string;
  last_reference?: string;
  paid_plans?: string[];
};

export function loadSession(): FunnelSession {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveSession(patch: Partial<FunnelSession>) {
  if (typeof window === "undefined") return;
  const cur = loadSession();
  const next = { ...cur, ...patch };
  localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  return next;
}

export function captureRefFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const ref = url.searchParams.get("ref");
  if (ref) {
    localStorage.setItem(REF_KEY, ref);
    saveSession({ ref });
  }
}

export function getRef(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(REF_KEY) ?? loadSession().ref;
}

export async function track(event: string, meta: Record<string, unknown> = {}) {
  try {
    const session = loadSession();
    await fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event, meta, user_id: session.user_id }),
      keepalive: true,
    });
  } catch {
    // best-effort
  }
}
