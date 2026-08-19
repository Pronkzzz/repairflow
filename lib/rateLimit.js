// Simpele in-memory rate limiter. Prima voor 1 server-instantie (Vercel serverless
// functies zijn kortstondig, dus dit reset regelmatig — voor zware bescherming later
// eventueel Upstash Redis rate limiting toevoegen).
const hits = new Map();

export function rateLimit(key, { windowMs = 60_000, max = 5 } = {}) {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now - entry.start > windowMs) {
    hits.set(key, { start: now, count: 1 });
    return { allowed: true };
  }

  if (entry.count >= max) {
    return { allowed: false, retryAfterMs: windowMs - (now - entry.start) };
  }

  entry.count += 1;
  return { allowed: true };
}
