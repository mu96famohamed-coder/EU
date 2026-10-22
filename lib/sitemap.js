import { CODES, DOMAIN } from './i18n';
import { getEnabledServiceSlugs, isServiceEnabled } from './serviceAvailability';
import { languageAlternates, reviewedLanguageAlternates } from './seo';
import { APOSTILLE_DESTINATIONS } from './apostille';
import { isSearchReady } from './editorial';
import { getArticles, getArticleAlternates } from './blog';
import { getBlogPageCount, getBlogPageInfo, blogPagePath, getBlogPageAlternates } from './blog-pagination';
import tracking from '../public/sitemap-state.json';

export function getLanguageSitemap(lang) {
  const out = [];
  if (!CODES.includes(lang) || !isSearchReady(lang)) return out;
    out.push({ url:`${DOMAIN}/${lang}`, alternates:{languages:languageAlternates('')} });
    out.push({ url:`${DOMAIN}/${lang}/about`, alternates:{languages:languageAlternates('/about')} });
    out.push({ url:`${DOMAIN}/${lang}/contact`, alternates:{languages:languageAlternates('/contact')} });
    if (["en", "ar", "sv", "de", "fr", "es", "it", "nl", "da", "no", "fi", "pt", "pl", "cs", "sk", "ro", "hu", "bg", "el", "et", "hr", "ru", "lt", "lv", "is", "mt", "sl", "tr", "ga", "sr", "uk", "sq"].includes(lang)) for (const slug of ['privacy','terms','refunds','how-it-works','pricing','document-requirements','document-rejection']) out.push({url:`${DOMAIN}/${lang}/${slug}`,alternates:{languages:Object.fromEntries(["en", "ar", "sv", "de", "fr", "es", "it", "nl", "da", "no", "fi", "pt", "pl", "cs", "sk", "ro", "hu", "bg", "el", "et", "hr", "ru", "lt", "lv", "is", "mt", "sl", "tr", "ga", "sr", "uk", "sq"].map(code=>[code,`${DOMAIN}/${code}/${slug}`]))}});
    out.push({ url:`${DOMAIN}/${lang}/faq`, alternates:{languages:languageAlternates('/faq')} });
    if (isSearchReady(lang)) for (const slug of getEnabledServiceSlugs()) out.push({ url:`${DOMAIN}/${lang}/services/${slug}`, alternates:{languages:reviewedLanguageAlternates(`/services/${slug}`)} });
    if (lang === 'en' && isServiceEnabled('apostille')) for (const d of APOSTILLE_DESTINATIONS) out.push({ url:`${DOMAIN}/${lang}/apostille/${d.slug}` });
    const posts = getArticles(lang);
    for (let page=1;page<=getBlogPageCount(lang);page++) {
      const pagePosts=getBlogPageInfo(lang,page).posts;
      out.push({url:`${DOMAIN}${blogPagePath(lang,page)}`,lastModified:pagePosts.reduce((latest,post)=>post.updatedAt>latest?post.updatedAt:latest,pagePosts[0].updatedAt),alternates:{languages:getBlogPageAlternates(page)}});
    }
    for (const post of posts) out.push({ url:`${DOMAIN}/${lang}/blog/${post.slug}`, publishedAt:post.publishedAt, lastModified:post.updatedAt, alternates:{languages:getArticleAlternates(post.slug,DOMAIN)} });
  return out.map(entry => {
    const saved = tracking.pages?.[new URL(entry.url).pathname];
    return {...entry, ...(saved?.lastModified ? {lastModified:saved.lastModified} : {}), images:saved?.images || []};
  });
}

export const getSitemapLanguages = () => CODES.filter(isSearchReady);
const xmlEscape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));
// Presentation instructions and comments do not alter any sitemap elements.
const xmlHeader = (lang) => '<?xml version="1.0" encoding="UTF-8"?>\n' + `<?xml-stylesheet type="text/css" href="${lang ? `/${lang}` : ''}/sitemap-style.css"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n`;
const languageNames = new Intl.DisplayNames(['en'], {type:'language'});
const viewComment = fields => `<!-- ${Object.entries(fields).map(([key,value]) => `${key}:${String(value).replace(/--/g,'- -').replace(/;/g,',')};`).join(' ')} -->`;
export function sitemapIndexXml() {
  const languages = getSitemapLanguages().map(lang => ({lang, entries:getLanguageSitemap(lang)}));
  const entries = languages.flatMap(item => item.entries);
  return xmlHeader() + '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + viewComment({URLs:entries.length, Images:entries.reduce((sum,entry)=>sum+entry.images.length,0), Unique:new Set(entries.flatMap(entry=>entry.images)).size}) + '\n'
    + languages.map(({lang,entries}) => `<sitemap>${viewComment({Name:languageNames.of(lang), Code:lang.toUpperCase(), URLs:entries.length, Images:entries.reduce((sum,entry)=>sum+entry.images.length,0)})}<loc>${xmlEscape(`${DOMAIN}/${lang}/sitemap.xml`)}</loc></sitemap>`).join('\n')
    + '\n</sitemapindex>\n';
}
export function languageSitemapXml(lang) {
  const entries = getLanguageSitemap(lang).map(entry => {
    const fields = [`<loc>${xmlEscape(entry.url)}</loc>`];
    for (const [code, href] of Object.entries(entry.alternates?.languages || {})) {
      fields.push(`<xhtml:link rel="alternate" hreflang="${xmlEscape(code)}" href="${xmlEscape(href)}" />`);
    }
    if (entry.lastModified) fields.push(`<lastmod>${xmlEscape(entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified)}</lastmod>`);
    for (const image of entry.images || []) fields.push(`<image:image><image:loc>${xmlEscape(image)}</image:loc></image:image>`);
    return `<url>${entry.publishedAt ? viewComment({Published:entry.publishedAt}) : ''}${fields.join('')}</url>`;
  });
  return xmlHeader(lang) + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
    + viewComment({Name:languageNames.of(lang), Code:lang.toUpperCase()}) + '\n'
    + entries.join('\n') + '\n</urlset>\n';
}
