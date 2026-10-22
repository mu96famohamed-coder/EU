const text = value => typeof value === 'string' && value.trim().length > 0;
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
function validInlineLink(href) {
  if (typeof href !== 'string') return false;
  if (/^\/[a-z]{2}\/services\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(href)) return true;
  try { const u = new URL(href); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; }
}
function contentError(content) {
  if (!Array.isArray(content) || !content.length) return 'content must be a nonempty array';
  const internalLinks = [];
  for (const block of content) {
    if (text(block)) continue;
    if (!block || typeof block !== 'object' || Array.isArray(block)) return 'invalid content block';
    if (block.type === 'paragraph' && Array.isArray(block.children)) {
      if (!block.children.length || !block.children.every(part => part && typeof part === 'object' && text(part.text) && (part.href === undefined || validInlineLink(part.href)))) return 'invalid inline paragraph or link';
      for (const part of block.children) if (part.href?.startsWith('/')) internalLinks.push(part.href);
      continue;
    }
    if (block.type === 'paragraph' && text(block.text)) continue;
    if (block.type === 'heading' && text(block.text) && [undefined, 2, 3].includes(block.level)) continue;
    if (block.type === 'list' && Array.isArray(block.items) && block.items.length && block.items.every(text) && (block.ordered === undefined || typeof block.ordered === 'boolean')) continue;
    return 'use a paragraph string, a paragraph block, a heading (level 2 or 3), or a list';
  }
  if (internalLinks.length > 5) return 'at most five internal links per article';
  if (new Set(internalLinks).size !== internalLinks.length) return 'internal destinations must not be repeated in one article';
  return null;
}
export function createBlogStore(data, languageCodes, options={}) {
  const codes = new Set(languageCodes);
  if (!data || !Array.isArray(data.articles)) throw new Error('content/blog.json: articles must be an array');
  const seen = new Set();
  for (const post of data.articles) {
    const fail = message => { throw new Error(`content/blog.json [${post?.slug || 'missing slug'}]: ${message}`); };
    if (!post || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug || '')) fail('slug must contain lowercase English letters, digits and single hyphens');
    if (seen.has(post.slug)) fail('duplicate slug');
    seen.add(post.slug);
    if (typeof post.published !== 'boolean') fail('published must be true or false');
    if (!validDate(post.publishedAt)) fail('publishedAt must be a real YYYY-MM-DD date');
    if (post.updatedAt !== undefined && (!validDate(post.updatedAt) || post.updatedAt < post.publishedAt)) fail('updatedAt must be a valid date on or after publishedAt');
    if (post.image && !(typeof post.image === 'string' && (/^\/(?!\/)/.test(post.image) || /^https:\/\//.test(post.image)))) fail('image must be a site path or an HTTPS URL');
    if (post.author !== undefined && !text(post.author)) fail('author must be nonempty text');
    if (post.sources !== undefined && (!Array.isArray(post.sources) || !post.sources.every(source=>source && text(source.name) && validInlineLink(source.url) && source.url.startsWith('https://')))) fail('sources must contain names and HTTPS URLs');
    if (!post.translations || typeof post.translations !== 'object' || Array.isArray(post.translations)) fail('translations must be an object keyed by language');
    for (const [lang, translation] of Object.entries(post.translations)) {
      if (!codes.has(lang)) fail(`unknown language: ${lang}`);
      if (translation === null) continue;
      if (typeof translation !== 'object' || Array.isArray(translation)) fail(`${lang}: translation must be an object or null`);
      if (!post.published) continue;
      if (translation.sources !== undefined && (!Array.isArray(translation.sources) || !translation.sources.every(source=>source && text(source.name) && validInlineLink(source.url) && source.url.startsWith('https://')))) fail(`${lang}: sources must contain names and HTTPS URLs`);
      if (!text(translation.title) || !text(translation.description)) fail(`${lang}: title and description are required; use null for an unavailable translation`);
      const error = contentError(translation.content);
      if (error) fail(`${lang}: ${error}`);
      for (const key of ['seoTitle', 'seoDescription', 'imageAlt']) if (own(translation, key) && !text(translation[key])) fail(`${lang}: ${key} must be nonempty when supplied`);
    }
    if (post.published && !Object.values(post.translations).some(t => t && text(t.title))) fail('a published article needs at least one complete translation');
  }
  const published = data.articles.filter(post => post.published).slice().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug));
  const languagesFor = post => post ? languageCodes.filter(lang => post.translations[lang] !== null && own(post.translations, lang)) : [];
  const localize = (post, lang) => ({
    slug: post.slug, publishedAt: post.publishedAt, updatedAt: post.updatedAt || post.publishedAt,
    image: post.image || '/images/blog/default.svg', author: post.author || options.authorName, sources: post.sources,
    lang, ...post.translations[lang],
  });
  const getArticle = (slug, lang) => {
    if (!codes.has(lang)) return null;
    const post = published.find(item => item.slug === slug);
    return post && languagesFor(post).includes(lang) ? localize(post, lang) : null;
  };
  const getArticles = lang => codes.has(lang) ? published.filter(post => languagesFor(post).includes(lang)).map(post => localize(post, lang)) : [];
  const getArticleLanguages = slug => languagesFor(published.find(post => post.slug === slug));
  const getBlogLanguages = () => languageCodes.filter(lang => getArticles(lang).length > 0);
  const alternates = (locales, path, domain) => {
    const root = domain.replace(/\/$/, '');
    const links = Object.fromEntries(locales.map(lang => [lang, `${root}/${lang}${path}`]));
    if (locales.length) links['x-default'] = links[locales.includes('en') ? 'en' : locales[0]];
    return links;
  };
  return {
    getArticle, getArticles, getArticleLanguages, getBlogLanguages,
    getBlogSlugs: () => published.map(post => post.slug),
    getBlogRoutes: () => published.flatMap(post => languagesFor(post).map(lang => ({lang, slug: post.slug}))),
    getArticleAlternates: (slug, domain) => alternates(getArticleLanguages(slug), `/blog/${slug}`, domain),
    getBlogAlternates: domain => alternates(getBlogLanguages(), '/blog', domain),
  };
}
export function formatBlogDate(date, lang) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(lang, { year:'numeric', month:'long', day:'numeric', timeZone:'UTC' });
}
export function safeBlogJsonLd(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
