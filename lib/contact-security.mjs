import { createHash } from 'node:crypto';

const WINDOW_SECONDS = 15 * 60;
const MAX_REQUESTS = 5;
const MAX_KEYS = 2000;
// This fallback is per process. Configure Redis for counters shared by Vercel instances.
const buckets = new Map();
const script = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]); end; return {n,redis.call('TTL',KEYS[1])}";

export async function contactRateLimit(ip, now = Date.now()) {
  const key = `poa:contact:${createHash('sha256').update(ip).digest('hex')}`;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url || token) {
    if (!url || !token || new URL(url).protocol !== 'https:') throw new Error('Rate limit configuration');
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['EVAL', script, '1', key, String(WINDOW_SECONDS)]),
      signal: AbortSignal.timeout(5000), cache: 'no-store',
    });
    if (!response.ok) throw new Error('Rate limit unavailable');
    const data = await response.json();
    if (!Array.isArray(data.result) || data.result.length !== 2 ||
        !data.result.every(Number.isFinite) || data.result[0] < 1) throw new Error('Rate limit response');
    return { allowed: data.result[0] <= MAX_REQUESTS, retryAfter: Math.max(1, data.result[1]) };
  }
  for (const [id, bucket] of buckets) if (bucket.expires <= now) buckets.delete(id);
  let bucket = buckets.get(key);
  if (!bucket) {
    if (buckets.size >= MAX_KEYS) return { allowed: false, retryAfter: WINDOW_SECONDS };
    bucket = { count: 0, expires: now + WINDOW_SECONDS * 1000 };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  return { allowed: bucket.count <= MAX_REQUESTS, retryAfter: Math.max(1, Math.ceil((bucket.expires - now) / 1000)) };
}

export async function readContactJson(request) {
  const limit = 32768;
  if (Number(request.headers.get('content-length') || 0) > limit) {
    throw Object.assign(new Error('Too large'), { status: 413 });
  }
  if (!request.body) throw Object.assign(new Error('Invalid request'), { status: 400 });
  const reader = request.body.getReader();
  const chunks = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > limit) {
        await reader.cancel();
        throw Object.assign(new Error('Too large'), { status: 413 });
      }
      chunks.push(Buffer.from(value));
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } finally { reader.releaseLock(); }
}
