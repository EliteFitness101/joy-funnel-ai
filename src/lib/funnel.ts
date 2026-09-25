// Client-side funnel helpers: referral/attribution capture, session restore, tracking.
export const SESSION_KEY = "resoflex_session_v1";
export const REF_KEY = "resoflex_ref";
export const ATTRIBUTION_KEY = "resofit_attribution_v1";
export const SESSION_ID_KEY = "resofit_session_id_v1";

const TRACKED_PARAMS = [
  "rsid",
  "ttclid",
  "funnel_origin",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type Attribution = Partial<Record<(typeof TRACKED_PARAMS)[number], string>>;

export type FunnelSession = Attribution & {
  user_id?: string;
  email?: string;
  ref?: string;
  last_reference?: string;
  paid_plans?: string[];
  session_id?: string;
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

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;
    const id = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_ID_KEY, id);
    saveSession({ session_id: id });
    return id;
  } catch {
    return "";
  }
}

export function captureAttributionFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const stored: Attribution = (() => {
    try {
      return JSON.parse(localStorage.getItem(ATTRIBUTION_KEY) ?? "{}");
    } catch {
      return {};
    }
  })();

  for (const key of TRACKED_PARAMS) {
    const value = url.searchParams.get(key);
    if (value) stored[key] = value.slice(0, 255);
  }

  try {
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(stored));
  } catch {
    /* quota */
  }

  const ref = url.searchParams.get("ref");
  const sessionId = getSessionId();
  saveSession({
    ...stored,
    ...(ref ? { ref: ref.slice(0, 128) } : {}),
    ...(sessionId ? { session_id: sessionId } : {}),
  });
}

export function captureRefFromUrl() {
  captureAttributionFromUrl();
}

export function getRef(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(REF_KEY) ?? loadSession().ref;
}

export function getAttribution(): Attribution & { session_id?: string; ref?: string } {
  if (typeof window === "undefined") return {};
  try {
    const stored = JSON.parse(localStorage.getItem(ATTRIBUTION_KEY) ?? "{}") as Attribution;
    const session = loadSession();
    return { ...stored, ...session, session_id: session.session_id ?? getSessionId() };
  } catch {
    return { session_id: getSessionId() };
  }
}

export async function track(event: string, meta: Record<string, unknown> = {}) {
  try {
    const session = loadSession();
    const attribution = getAttribution();
    await fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event,
        meta: { ...meta, attribution },
        user_id: session.user_id,
        rsid: attribution.rsid,
        session_id: attribution.session_id,
        funnel_origin: attribution.funnel_origin,
        utm: {
          source: attribution.utm_source,
          medium: attribution.utm_medium,
          campaign: attribution.utm_campaign,
          term: attribution.utm_term,
          content: attribution.utm_content,
        },
      }),
      keepalive: true,
    });
  } catch {
    // best-effort
  }
}
