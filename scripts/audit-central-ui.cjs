const fs=require('fs');
const ui=JSON.parse(fs.readFileSync('lib/uiCopy.json','utf8'));
const page=fs.readFileSync('app/[lang]/page.js','utf8');
const service=fs.readFileSync('app/[lang]/services/[slug]/page.js','utf8');
const linker=fs.readFileSync('lib/internalLinks.js','utf8');
const search=fs.readFileSync('components/HeroServiceSearch.js','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
const errors=[];
for(const [lang,u] of Object.entries(ui)){
 const s=u.serviceSearch||{};
 for(const k of ['label','placeholder','results','noResultsTitle','noResultsText','whatsapp']) if(!String(s[k]||'').trim()) errors.push(`${lang}: missing serviceSearch.${k}`);
}
if(!linker.includes("PROTECTED_BRAND_NAMES=['POA Dubai']"))errors.push('central protected brand list missing');
if(!service.includes('findContextualSpan(part,phrase,lang)'))errors.push('service contextual linker not using central protected matcher');
if(!linker.includes('isProtectedBrandPhrase(phrase)'))errors.push('brand phrase not excluded from anchors');
if(!page.includes('<HeroServiceSearch'))errors.push('hero service search missing');
if(!page.includes('NEXT_PUBLIC_WHATSAPP_NUMBER'))errors.push('central WhatsApp env missing');
if(!page.includes('whatsapp-primary'))errors.push('primary WhatsApp CTA missing');
if(!search.includes('noResultsTitle')||!search.includes('noResultsText'))errors.push('no-results contact route missing');
if(!search.includes('keywords'))errors.push('search does not use localized keywords');
if(!css.includes('.btn.whatsapp-primary'))errors.push('WhatsApp primary styling missing');
console.log(`Locales checked: ${Object.keys(ui).length}`);
console.log(`Errors: ${errors.length}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('CENTRAL UI / BRAND PROTECTION AUDIT: PASS');
