const fs=require('fs');
const D=require('../lib/serviceResearch.json');
const langs=require('../lib/langs.json').map(x=>x.code);
const target=langs.filter(x=>!['en','ar'].includes(x));
const required=['title','shortDescription','intro','what','howHelp','beforeYouStart','remote','faq','keywords'];
const page=fs.readFileSync('app/[lang]/services/[slug]/page.js','utf8');
const pendingMatch=page.match(/const\s+NEW_SERVICES_PENDING_LOCALIZATION\s*=\s*new Set\((\[[^;]*?\])\)/);
const pendingNoindexGuard=page.includes("!NEW_SERVICES_PENDING_LOCALIZATION.has(slug) || ['en','ar'].includes(lang)");
const pending=pendingMatch && pendingNoindexGuard ? new Set(require('node:vm').runInNewContext(pendingMatch[1],{},{timeout:1000})) : new Set();
let errors=[],notes=[],count=0,poaRel=0,poaCovered=0;
for(const [slug,item] of Object.entries(D)){
 for(const lang of target){count++; const c=item[lang]; if(!c){errors.push(`${lang}/${slug}:missing`);continue}
  for(const f of required) if(!c[f]||(Array.isArray(c[f])&&c[f].length===0)) errors.push(`${lang}/${slug}:missing ${f}`);
  if(!Array.isArray(c.faq)||c.faq.length<5||c.faq.some(x=>!x.q||!x.a)) errors.push(`${lang}/${slug}:bad faq`);
  if(!Array.isArray(c.keywords)||c.keywords.length<3) errors.push(`${lang}/${slug}:weak keywords`);
 }
 const rel=item.category==='poa'||item.category==='property'||item.category==='vehicle'||['corporate-power-of-attorney','company-incorporation-poa','company-management-poa','company-shares-poa','vat-tax-poa'].includes(slug);
 if(rel){for(const lang of target){poaRel++;const c=item[lang]; const blob=(c?.keywords||[]).join(' ')+' '+JSON.stringify(item.keywordMap||{}); if(/\bPOA\b/i.test(blob)||/Power of Attorney/i.test(blob))poaCovered++;else if(pending.has(slug)) notes.push(`${lang}/${slug}: POA keyword identifier absent; translation is currently marked noindex pending localization`);else errors.push(`${lang}/${slug}:POA family missing`)}}
}
// EN/AR service FAQ
for(const [slug,item] of Object.entries(D)) for(const lang of ['en','ar']) if(!Array.isArray(item[lang]?.faq)||item[lang].faq.length<5) errors.push(`${lang}/${slug}:service FAQ missing`);
const css=fs.readFileSync('app/globals.css','utf8'); const editorial=fs.readFileSync('lib/editorial.js','utf8'); const seo=fs.readFileSync('lib/seo.js','utf8'); const sitemap=fs.readFileSync('app/sitemap.js','utf8');
if(page.includes('className="related"')||page.includes('<h2>{L.links}</h2>'))errors.push('related services block rendered');
if(!page.includes('r.slug===slug'))errors.push('self-link guard missing');
if(!page.includes('`/${lang}/services/${r.slug}`'))errors.push('same-language href missing');
if(!page.includes('renderText(x.a)'))errors.push('FAQ contextual links missing');
if(page.includes('<div className="content-callout"><h3>{L.problems}</h3><p>{renderText(content?.beforeYouStart)}</p></div>'))errors.push('beforeYouStart duplicate remains');
if(!css.includes('--internal-link-color:')||!css.includes('--internal-link-hover-color:')||!css.includes('.internal-link{'))errors.push('central link theme missing');
// Evaluate the current locale policy instead of requiring one exact source spelling.
try {
 const vm=require('node:vm');
 const policy=vm.runInNewContext(editorial.replace(/^import[^;]+;\s*/gm,'').replace(/\bexport\s+/g,'')+';({SEARCH_READY_LOCALES,isSearchReady})',{CODES:langs},{timeout:1000});
 const ready=Array.from(policy.SEARCH_READY_LOCALES);
 if(new Set(ready).size!==ready.length || ready.length!==langs.length || langs.some(lang=>!ready.includes(lang)||!policy.isSearchReady(lang)) || policy.isSearchReady('invalid-locale')) errors.push('indexability locale policy does not match supported locales');
} catch(error) { errors.push('cannot validate locale policy: '+error.message); }
if(!seo.includes("languages['x-default']"))errors.push('x-default missing');
if(!sitemap.includes('isSearchReady(lang)'))errors.push('sitemap search-ready filter missing');
const forbidden=['info@poainminutes.ae','NuVentures','+971 52 899 7280','Licensed to carry out','Licensierade för','Lizenziert für','مرخّصة لمزاولة'];
for(const dir of ['messages','app','components','lib']) for(const f of walk(dir)){const s=fs.readFileSync(f,'utf8');for(const x of forbidden)if(s.includes(x))errors.push(`${f}:legacy ${x}`)}
function walk(d){let out=[];for(const n of fs.readdirSync(d)){const p=d+'/'+n,st=fs.statSync(p);if(st.isDirectory())out=out.concat(walk(p));else if(/\.(js|json|css)$/.test(n))out.push(p)}return out}
console.log(`Stored service-language records checked (including records not indexed): ${count}`);console.log(`POA relevant: ${poaRel}; POA covered: ${poaCovered}`);for(const note of notes)console.warn(`NOTE: ${note}`);console.log(`Pending-localization keyword notes: ${notes.length}`);console.log(`Errors: ${errors.length}`);if(errors.length){console.log(errors.slice(0,100).join('\n'));process.exit(1)}console.log('CONTENT STRUCTURE / KEYWORDS / STATIC SEO CHECKS: PASS. This is not a linguistic or legal certification, or a rendered-page link audit.');
