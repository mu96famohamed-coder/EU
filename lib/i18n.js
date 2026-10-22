import langs from './langs.json';
import { BRAND } from './brand';
import { getBlogSlugs } from './blog';
export const LANGS = langs;
export const CODES = langs.map((l) => l.code);
export const RTL = ['ar'];
export const DOMAIN = BRAND.domain;
export const MAIL = BRAND.email;
// Compatibility export, derived automatically from content/blog.json.
export const SLUGS = getBlogSlugs();
export async function getM(lang) {
  return (await import(`../messages/${lang}.json`)).default;
}
export const fmt = (d, l) => new Date(d).toLocaleDateString(l, { year: 'numeric', month: 'long', day: 'numeric' });
