const fs=require('fs');
const langs=JSON.parse(fs.readFileSync('lib/langs.json','utf8')).map(x=>x.code);
const copy=JSON.parse(fs.readFileSync('lib/aboutCopy.json','utf8'));
const required=['title','lead','intro','start','startText','how','howText','role','roleText','why','whyText','cta','ctaText'];
let errors=[];
for(const l of langs){if(!copy[l]) errors.push(`${l}: missing About copy`); else for(const k of required) if(!String(copy[l][k]||'').trim()) errors.push(`${l}: missing ${k}`)}
const footer=fs.readFileSync('components/Footer.js','utf8');
if(!footer.includes('getServices(m,lang)')) errors.push('Footer does not derive service links from availability-filtered services');
if(!footer.includes('footer-grid')) errors.push('Footer grid missing');
const sitemap=fs.readFileSync('app/sitemap.js','utf8'); if(!sitemap.includes("languageAlternates('/about')")) errors.push('About sitemap alternates missing');
console.log(`About locales checked: ${langs.length}`);console.log(`Errors: ${errors.length}`);if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log('ABOUT + FOOTER AUDIT: PASS');
