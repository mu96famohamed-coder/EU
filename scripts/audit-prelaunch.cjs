const fs=require('fs');
const errors=[]; const read=p=>fs.readFileSync(p,'utf8');
const langs=JSON.parse(read('lib/langs.json')),ui=JSON.parse(read('lib/uiCopy.json'));
const brand=read('lib/brand.js'),css=read('app/globals.css'),layout=read('app/[lang]/layout.js'),search=read('components/HeroServiceSearch.js'),next=read('next.config.mjs');
if(langs.length!==32) errors.push(`expected 32 locales, got ${langs.length}`);
for(const l of langs){const s=ui[l.code]?.serviceSearch||{};for(const k of ['label','placeholder','results','noResultsTitle','noResultsText','whatsapp'])if(!String(s[k]||'').trim())errors.push(`${l.code}: missing ${k}`)}
if(!brand.includes("domain: 'https://poadubai.eu'")) errors.push('production domain missing');
if(!layout.includes("viewportFit: 'cover'")) errors.push('viewport export missing');
if(!layout.includes('skip-link')) errors.push('skip link missing');
if(!search.includes('aria-live="polite"')) errors.push('search live region missing');
if(!search.includes('role="combobox"')) errors.push('search combobox semantics missing');
if(!search.includes('noResultsTitle')||!search.includes('/contact')) errors.push('search no-result contact fallback missing');
if(!css.includes('overflow-x:clip')) errors.push('horizontal overflow guard missing');
if(!css.includes('prefers-reduced-motion')) errors.push('reduced motion support missing');
for(const h of ['X-Content-Type-Options','Referrer-Policy','Permissions-Policy','X-Frame-Options']) if(!next.includes(h)) errors.push(`security header missing: ${h}`);
console.log(`Locales checked: ${langs.length}`); console.log(`Errors: ${errors.length}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)} console.log('PRE-LAUNCH STATIC AUDIT: PASS');
