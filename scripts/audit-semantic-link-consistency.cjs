const fs = require('node:fs');
const vm = require('node:vm');
const research = require('../lib/serviceResearch.json');
const map = require('../lib/semanticLinkMap.json');
const arTitles = require('../lib/serviceTitles.ar.json');
const langs = require('../lib/langs.json').map(x => x.code);
const read = file => fs.readFileSync(file, 'utf8');
const errors = [];
// Evaluate the actual catalog and availability policy, without Next.js.
const catalog = vm.runInNewContext(
  read('lib/serviceCatalog.js').replace(/\bexport\s+/g, '') + ';({SERVICES,SERVICE_SLUGS})',
  {}, {timeout:1000}
);
const availability = vm.runInNewContext(
  read('lib/serviceAvailability.js').replace(/^import[^;]+;\s*/gm, '').replace(/\bexport\s+/g, '') + ';({getEnabledServiceSlugs,isServiceEnabled})',
  {SERVICES:catalog.SERVICES,SERVICE_SLUGS:catalog.SERVICE_SLUGS}, {timeout:1000}
);
const enabled = Array.from(availability.getEnabledServiceSlugs());
const known = new Set(catalog.SERVICE_SLUGS);
function localTitle(slug,lang) {
  return research[slug]?.[lang]?.title || (lang==='ar' ? arTitles[slug] : lang==='en' ? catalog.SERVICES.find(row=>row[0]===slug)?.[2] : null);
}
let comparisons = 0;
let filtered = 0;
for (const [slug, targets] of Object.entries(map)) {
  if (!research[slug]) errors.push(`${slug}: source content missing`);
  if (!known.has(slug)) errors.push(`${slug}: source not in service catalog`);
  if (!Array.isArray(targets)) { errors.push(`${slug}: targets must be an array`); continue; }
  // Zero to five destinations are allowed; three is not a site requirement.
  if (targets.length > 5) errors.push(`${slug}: exceeds the five-destination limit`);
  if (new Set(targets).size !== targets.length) errors.push(`${slug}: duplicate target`);
  if (targets.includes(slug)) errors.push(`${slug}: self target`);
  for (const target of targets) {
    if (typeof target !== 'string' || !known.has(target)) errors.push(`${slug}: unknown target ${target}`);
    if (!research[target]) errors.push(`${slug}: target content missing: ${target}`);
    if (known.has(target) && !availability.isServiceEnabled(target)) filtered++;
  }
}
for (const slug of enabled) {
  const targets = Array.isArray(map[slug]) ? map[slug].filter(t => t !== slug && availability.isServiceEnabled(t)) : [];
  for (const lang of langs) {
    for (const target of targets) {
      comparisons++;
      if (!localTitle(target,lang)?.trim()) errors.push(`${slug}/${lang}: target ${target} lacks a title in this language`);
    }
  }
}
const page = read('app/[lang]/services/[slug]/page.js');
for (const [name, ok] of [
  ['central semantic map', page.includes('semanticLinkMap[slug]')],
  ['availability-filtered service list', /all\s*=\s*getServices\(m,lang\)/.test(page)],
  ['destinations resolved from that list', page.includes('semanticTargets.map(x=>all.find') && page.includes('.filter(Boolean)')],
  ['self-link exclusion', page.includes('x!==slug') && page.includes('r.slug===slug')],
  ['duplicate-destination exclusion', page.includes('linkedDestinations.has(r.slug)') && page.includes('linkedDestinations.add(r.slug)')],
  ['same-language service URL', page.includes('`/${lang}/services/${r.slug}`')],
  ['contextual links in FAQ answers', page.includes('renderText(x.a)')],
  ['plain FAQ questions', page.includes('<summary>{x.q}</summary>')],
]) if (!ok) errors.push(`page: missing ${name}`);
if (page.includes('research?.related||[]')) errors.push('page still uses legacy related destinations');
const internal = read('lib/internalLinks.js');
if (internal.includes('aliases.push') || internal.includes("+'*'")) errors.push('generic/stem alias expansion enabled');
if (!internal.includes('isProtectedBrandPhrase(phrase)')) errors.push('brand-name protection missing');
console.log(`Enabled services: ${enabled.length}; mapped services: ${Object.keys(map).length}; supported locales: ${langs.length}`);
console.log(`Localized destination title checks: ${comparisons}`);
console.log(`Services without an explicit map (no contextual destinations): ${enabled.filter(slug=>!Object.hasOwn(map,slug)).length}`);
if (filtered) console.warn(`NOTE: ${filtered} disabled map targets are filtered by the page; they must not be rendered.`);
console.log(`Errors: ${errors.length}`);
if (errors.length) { console.error(errors.slice(0,100).join('\n')); process.exitCode = 1; }
else console.log('SEMANTIC MAP / LOCALE TITLE / STATIC LINK GUARDS: PASS. This does not measure rendered link coverage or certify translation meaning.');
