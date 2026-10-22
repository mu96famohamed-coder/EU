import { NextResponse } from 'next/server';
import { contactRateLimit, readContactJson } from '../../../lib/contact-security.mjs';

export const runtime = 'nodejs';
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const json = (body, status = 200, headers = {}) => NextResponse.json(body, {
  status, headers: { 'Cache-Control': 'no-store', ...headers },
});

export async function POST(request) {
  const origin = request.headers.get('origin');
  const url = new URL(request.url);
  // Use the public request host; Next.js can use an internal hostname in request.url.
  const host = request.headers.get('host') || url.host;
  const protocol = request.headers.get('x-forwarded-proto')?.split(',')[0].trim() || url.protocol.slice(0, -1);
  const expectedOrigin = `${protocol}://${host}`;
  if (request.headers.get('sec-fetch-site') === 'cross-site' ||
      (origin && origin !== expectedOrigin)) return json({ error: 'Forbidden' }, 403);
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return json({ error: 'JSON required' }, 415);
  }
  try {
    // Vercel sets these headers. A different host must supply a trusted client IP.
    const ip = (request.headers.get('x-vercel-forwarded-for') ||
      request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim().slice(0, 100);
    let rate;
    try { rate = await contactRateLimit(ip); }
    catch { return json({ error: 'Please try again later' }, 503); }
    if (!rate.allowed) return json({ error: 'Too many requests' }, 429, { 'Retry-After': String(rate.retryAfter) });

    const data = await readContactJson(request);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return json({ error: 'Invalid input' }, 400);
    // Silently discard automated submissions that fill the hidden field.
    if (clean(data.website, 1024)) return json({ ok: true });
    const name = clean(data.name, 120), email = clean(data.email, 254), message = clean(data.message, 5000);
    if (!name || !message || !emailPattern.test(email)) return json({ error: 'Invalid input' }, 400);
    const key = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM_EMAIL?.trim();
    const to = process.env.CONTACT_TO_EMAIL?.trim();
    if (!key || !from || /[\r\n]/.test(from) || !to || !emailPattern.test(to)) {
      return json({ error: 'Email service not configured' }, 503);
    }
    const lines = [['Name', name], ['Email', email], ['Phone', clean(data.phone, 40)],
      ['Location', clean(data.location, 120)], ['Service', clean(data.service, 150)],
      ['Language', clean(data.lang, 10)], ['Message', message]];
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject: 'POA Dubai — website enquiry',
        text: lines.map(([k, v]) => `${k}: ${v}`).join('\n'), reply_to: email }),
      signal: AbortSignal.timeout(10000), cache: 'no-store',
    });
    if (!result.ok) {
      console.error('Contact email delivery failed, provider status:', result.status);
      return json({ error: 'Delivery failed' }, 502);
    }
    return json({ ok: true });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') return json({ error: 'Delivery timed out' }, 504);
    return json({ error: error?.status === 413 ? 'Too large' : 'Invalid request' }, error?.status === 413 ? 413 : 400);
  }
}
