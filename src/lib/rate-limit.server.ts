// Best-effort in-memory rate limiter for serverless workers.
// Per-instance only; intended to blunt brute-force scans, not as a hard quota.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  b.count += 1;
  if (b.count > limit) {
    return { ok: false, remaining: 0, resetAt: b.resetAt };
  }
  return { ok: true, remaining: limit - b.count, resetAt: b.resetAt };
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
