import {IDENTITY_ID} from './contentIdentity';
import { CODES, DOMAIN } from './i18n';
import { SEARCH_READY_LOCALES } from './editorial';

export const DEFAULT_LOCALE = 'en';
export const OG_LOCALE = (lang) => lang.replace('-', '_');
export function languageAlternates(path='', locales=CODES) {
  const p = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  const languages = Object.fromEntries(locales.map(c => [c, `${DOMAIN}/${c}${p}`]));
  if (locales.includes(DEFAULT_LOCALE)) languages['x-default'] = `${DOMAIN}/${DEFAULT_LOCALE}${p}`;
  return languages;
}
export function absolute(lang, path='') {
  const p = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${DOMAIN}/${lang}${p}`;
}
export function breadcrumbSchema(lang, items) {
  return {
    '@context':'https://schema.org','@type':'BreadcrumbList',
    itemListElement: items.map((x,i)=>({'@type':'ListItem',position:i+1,name:x.name,item:x.url || absolute(lang,x.path||'')}))
  };
}
export function websiteSchema() {
  return {'@context':'https://schema.org','@type':'WebSite','@id':`${DOMAIN}/#website`,
    name:'POA DUBAI',url:DOMAIN,publisher:{'@id':IDENTITY_ID}};
}
export function safeJsonLd(data){ return JSON.stringify(data).replace(/</g,'\\u003c'); }

export function reviewedLanguageAlternates(path='') { return languageAlternates(path, SEARCH_READY_LOCALES); }

export function defaultSocialImages(lang) {
  return [{url:`${DOMAIN}/${lang}/opengraph-image.png`,width:1200,height:630,alt:'POA DUBAI'}];
}
