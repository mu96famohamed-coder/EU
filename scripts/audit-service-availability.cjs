const fs=require('fs');
const catalog=fs.readFileSync('lib/serviceCatalog.js','utf8');
const availability=fs.readFileSync('lib/serviceAvailability.js','utf8');
const services=fs.readFileSync('lib/services.js','utf8');
const home=fs.readFileSync('app/[lang]/page.js','utf8');
const page=fs.readFileSync('app/[lang]/services/[slug]/page.js','utf8');
const sitemap=fs.readFileSync('app/sitemap.js','utf8');
const slugs=[...catalog.matchAll(/\['([^']+)','(poa|property|company|vehicle|notary|notices|rental|apostille)'/g)].map(m=>m[1]);
const missing=slugs.filter(slug=>!new RegExp(`['\"]${slug}['\"]\\s*:\\s*(?:true|false)`).test(availability));
const checks=[
 ['all catalog services have a switch',missing.length===0],
 ['service list filters disabled services',services.includes('filter(([slug])=>isServiceEnabled(slug))')],
 ['category list hides disabled/empty groups',services.includes('isGroupEnabled(c.id)')&&services.includes('SERVICES.some')],
 ['static service routes use enabled slugs',page.includes('getEnabledServiceSlugs().map')],
 ['sitemap uses enabled slugs',sitemap.includes('getEnabledServiceSlugs()')],
 ['home search/cards derive from filtered services',home.includes('getCategoryServices')&&home.includes('const services=categories.flatMap')],
 ['internal links derive targets from filtered services',page.includes('semanticTargets.map(x=>all.find')&&page.includes('all=getServices')],
];
let fail=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'}: ${name}`);if(!ok)fail++;}
console.log(`Services controlled: ${slugs.length}`); if(missing.length)console.log('Missing:',missing.join(', '));
process.exitCode=fail?1:0;
