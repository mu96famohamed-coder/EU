import { createHash } from 'node:crypto';

// Compare semantic JSON values, not file formatting, archive dates or build times.
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().filter(key => value[key] !== undefined).map(key => [key, stable(value[key])]));
  return value;
}
export const fingerprint = value => createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
export function validDate(value, now = new Date()) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}\.\d{3}Z)?$/.test(value)) return false;
  const parsed = new Date(value);
  return Number.isFinite(+parsed) && parsed.toISOString().startsWith(value.slice(0, 10)) && +parsed <= +now;
}
export function validState(state, origin, now = new Date()) {
  return !!state && state.version === 1 && state.origin === origin && state.pages && !Array.isArray(state.pages)
    && Object.entries(state.pages).every(([path, page]) => /^\/[a-z]{2}(?:\/[a-z0-9-]+)*$/.test(path)
      && /^[a-f0-9]{64}$/.test(page?.hash || '') && (!page.lastModified || validDate(page.lastModified, now)));
}
export function mergeState(inputs, previous, origin, now = new Date()) {
  if (previous && !validState(previous, origin, now)) throw new Error('Invalid sitemap history');
  // Keep history for temporarily disabled pages; they still stay out of the XML.
  const pages = {...previous?.pages};
  for (const [path, input] of Object.entries(inputs)) {
    const old = previous?.pages[path];
    const hash = fingerprint(input.content);
    const explicit = validDate(input.lastModified, now) ? input.lastModified : undefined;
    // First encounter is a baseline, never evidence of a historical publication date.
    const lastModified = old ? (old.hash !== hash ? now.toISOString() : old.lastModified || explicit) : explicit;
    pages[path] = {hash, ...(lastModified ? {lastModified} : {}), ...(input.images?.length ? {images: input.images} : {})};
  }
  return {version: 1, origin, pages};
}
