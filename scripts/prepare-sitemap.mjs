import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBlogStore } from '../lib/blog-core.mjs';
import { fingerprint, mergeState, validState } from '../lib/sitemap-tracking.mjs';

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = async (root, path, fallback) => {
  try { return JSON.parse(await readFile(resolve(root, path), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT' && fallback !== undefined) return fallback; throw error; }
};
const pick = (data, keys) => Object.fromEntries(keys.map(key => [key, data?.[key]]));
async function loadJs(root, path, replacements = []) {
  let code = await readFile(resolve(root, path), 'utf8');
  for (const [from, to] of replacements) code = code.replace(from, to);
  const url = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  return {module: await import(url), url};
}
export async function collectInputs(root = defaultRoot, origin = 'https://www.poadubai.eu') {
  const files = ['lib/langs.json','lib/serviceResearch.json','lib/uiCopy.json','lib/aboutCopy.json','lib/editorialCopy.json','lib/serviceSeo.json','lib/serviceScopeCopy.json','lib/guidePages.json','lib/marketProfiles.json','lib/seoCopy.json','lib/articleSources.json','content/blog.json'];
  const [langs, research, ui, about, editorial, seo, scope, guides, markets, seoCopy, sources, blog] = await Promise.all(files.map(path => readJson(root, path, {})));
  const {module: catalog, url} = await loadJs(root, 'lib/serviceCatalog.js');
  const {module: availability} = await loadJs(root, 'lib/serviceAvailability.js', [[/(['"])\.\/serviceCatalog(?:\.js)?\1/, JSON.stringify(url)]]);
  const enabled = availability.getEnabledServiceSlugs();
  const store = createBlogStore(blog, langs.map(l => l.code), {authorName: 'POA DUBAI'});
  const imageCache = new Map();
  async function imageInfo(value) {
    if (!value || typeof value !== 'string') return null;
    let url;
    try { url = new URL(value, origin); } catch { return null; }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    if (imageCache.has(url.href)) return imageCache.get(url.href);
    let bytesHash;
    if (url.origin === origin) {
      const path = decodeURIComponent(url.pathname);
      if (path.includes('..') || path.includes('\\')) return null;
      const candidates = [resolve(root, `public${path}`)];
      if (path.startsWith('/images/blog/')) candidates.unshift(resolve(root, 'content/images', path.slice('/images/blog/'.length)));
      for (const candidate of candidates) {
        try { bytesHash = fingerprint((await readFile(candidate)).toString('base64')); break; }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
      }
      if (!bytesHash) throw new Error(`Sitemap image is missing: ${value}. Check content/images and the existing image sync step.`);
    }
    const result = {url: url.href, ...(bytesHash ? {hash: bytesHash} : {})};
    imageCache.set(url.href, result);
    return result;
  }
  const inputs = {};
  const add = (path, content, extras = {}) => { inputs[path] = {content, ...extras}; };
  for (const {code: lang} of langs) {
    const m = await readJson(root, `messages/${lang}.json`);
    const u = ui[lang] || ui.en;
    const cards = enabled.map(slug => {
      const row = catalog.SERVICES.find(s => s[0] === slug);
      const r = research[slug]?.[lang] || research[slug]?.en;
      return {slug, category: row?.[1], title: r?.title || row?.[2], summary: r?.shortDescription || row?.[3]};
    });
    add(`/${lang}`, {main: pick(m, ['t','h1','sub','sh','ph','st','note']), ui: pick(u, ['remote','euUae','inside','multilingual','directory','directoryIntro','categories','simple','preFaqWhatsapp','faqPrompt']), authorities: pick(about[lang], ['authorities','authoritiesTitle','authoritiesCta']), cards});
    add(`/${lang}/about`, {about: about[lang], editorial: editorial[lang]});
    add(`/${lang}/contact`, {lead: m.sub, form: pick(u, ['contactBrand','contact','form','independent']), services: cards.map(({slug,title}) => ({slug,title})), seo: seoCopy[lang]?.[0]});
    add(`/${lang}/faq`, {faq: m.faq, lead: m.sub, title: m.faqLabel || u.faq, seo: seoCopy[lang]?.[1]});
    for (const slug of ['privacy','terms','refunds','how-it-works','pricing','document-requirements','document-rejection']) add(`/${lang}/${slug}`, guides[slug]?.[lang]);
    for (const slug of enabled) add(`/${lang}/services/${slug}`, {content: research[slug]?.[lang] || research[slug]?.en, seo: seo[slug]?.[lang], scope: ['general-power-of-attorney','special-power-of-attorney','poa-online-notarisation'].includes(slug) ? m.note : scope[lang], process: m.st.map(step => step[0]), market: markets[lang] || markets.en});
    const posts = store.getArticles(lang);
    const localized = await Promise.all(posts.map(async post => {
      const image = await imageInfo(post.image);
      return {post, image};
    }));
    for (const {post, image} of localized) {
      const references = post.sources || (sources.articles?.[post.slug] || []).map(id => sources.sources?.[id]);
      add(`/${lang}/blog/${post.slug}`, {post, image, references}, {lastModified: post.updatedAt, images: image ? [image.url] : []});
    }
    for (let index = 0; index < posts.length; index += 10) {
      const batch = localized.slice(index, index + 10);
      const page = index / 10 + 1;
      const path = `/${lang}/blog${page === 1 ? '' : `/page/${page}`}`;
      add(path, {seo:seoCopy[lang]?.[2], posts:batch.map(({post, image}) => ({slug: post.slug, title: post.title, description: post.description, publishedAt: post.publishedAt, image}))}, {
        lastModified: batch.map(({post}) => post.updatedAt).sort().at(-1),
        images: [...new Set(batch.flatMap(({image}) => image ? [image.url] : []))],
      });
    }
  }
  // Destination pages remain controlled by the original availability switch.
  if (availability.isServiceEnabled('apostille')) {
    const {module: apostille} = await loadJs(root, 'lib/apostille.js');
    for (const destination of apostille.APOSTILLE_DESTINATIONS) add(`/en/apostille/${destination.slug}`, {destination, scope: apostille.APOSTILLE_SCOPE, content: research.apostille?.en});
  }
  return inputs;
}

export async function prepareSitemap({root = defaultRoot, previous, fetchHistory = true, now = new Date(), fetcher = fetch} = {}) {
  const origin = 'https://www.poadubai.eu';
  const legacyOrigin = 'https://poadubai.eu';
  let historyStatus = previous ? 'provided' : 'baseline';
  let historyError;
  if (previous === undefined && fetchHistory) {
    try {
      const response = await fetcher(`${origin}/sitemap-state.json`, {cache:'no-store', signal:AbortSignal.timeout(12000)});
      if (response.ok) {
        const text = await response.text();
        if (text.length > 5_000_000) throw new Error('History response too large');
        const candidate = JSON.parse(text);
        if (!validState(candidate, origin, now) && !validState(candidate, legacyOrigin, now)) throw new Error('Invalid published sitemap history');
        previous = candidate;
        historyStatus = 'published';
      } else if (response.status !== 404) throw new Error(`History HTTP ${response.status}`);
    } catch (error) {
      historyStatus = 'unavailable';
      historyError = error;
    }
  }
  // Local builds can retain history. Vercel always prefers the actual production deployment.
  if (previous === undefined && !process.env.VERCEL) {
    const cached = await readJson(root, 'public/sitemap-state.json', null);
    if ((validState(cached, origin, now) || validState(cached, legacyOrigin, now)) && Object.keys(cached.pages).length) {
      previous = cached;
      historyStatus = 'local';
    }
  }
  if (historyError && !previous) throw new Error(`[sitemap] Cannot preserve published history: ${historyError.message}. Retry the build when /sitemap-state.json is reachable; existing deployment is unaffected.`);
  const inputs = await collectInputs(root, origin);
  if (previous?.origin === legacyOrigin) {
    if (!validState(previous, legacyOrigin, now)) throw new Error('Invalid legacy sitemap history');
    // A hostname change is not an editorial update. Rebase fingerprints only
    // where the actual page content still matches the published legacy input.
    const legacyInputs = await collectInputs(root, legacyOrigin);
    const pages = Object.fromEntries(Object.entries(previous.pages).map(([path, page]) => {
      const unchanged = legacyInputs[path] && inputs[path]
        && page.hash === fingerprint(legacyInputs[path].content);
      return [path, unchanged ? {...page, hash:fingerprint(inputs[path].content)} : page];
    }));
    previous = {...previous, origin, pages};
  }
  const state = {...mergeState(inputs, previous, origin, now), historyStatus};
  const target = resolve(root, 'public/sitemap-state.json');
  await mkdir(dirname(target), {recursive:true});
  await writeFile(`${target}.tmp`, JSON.stringify(state));
  await rename(`${target}.tmp`, target);
  console.log(`[sitemap] ${Object.keys(state.pages).length} pages; history: ${historyStatus}; dates only when known.`);
  return state;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await prepareSitemap();
