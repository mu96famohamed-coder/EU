
import { SERVICE_CATEGORIES, SERVICES } from './serviceCatalog';
import { isGroupEnabled, isServiceEnabled } from './serviceAvailability';
import uiData from './uiCopy.json';
import arTitles from './serviceTitles.ar.json';
import {getServiceContent} from './serviceContent';

const catIndex={poa:0,property:1,company:2,vehicle:3,notary:4,notices:5,rental:6,apostille:7};
function normalizeUiPunctuation(value,lang){
 if(typeof value==='string') return value.replace(/(?:\s*\u2014\s*|\s+\u2013\s+)/g,lang==='ar'?'، ':', ');
 if(Array.isArray(value)) return value.map(item=>normalizeUiPunctuation(item,lang));
 if(value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,normalizeUiPunctuation(item,lang)]));
 return value;
}
export function getUi(lang){ return normalizeUiPunctuation(uiData[lang] || uiData.en,lang); }
export function getCategories(lang='en'){
 const u=getUi(lang);
 return SERVICE_CATEGORIES.map((c,i)=>({...c,title:u.categories[i],
   intro: lang==='en' ? c.intro : `${u.categories[i]}${lang==='ar'?'، ':', '}${u.directoryIntro}`}))
   .filter(c=>isGroupEnabled(c.id) && SERVICES.some(([slug,category])=>category===c.id && isServiceEnabled(slug)));
}
function localizedTitle(lang, slug, english){
 const local=getServiceContent(slug,lang);
 if(local?.title) return local.title;
 if(lang==='ar' && arTitles[slug]) return arTitles[slug];
 return english;
}
export function getServices(m,lang='en'){
 const u=getUi(lang);
 return SERVICES.filter(([slug])=>isServiceEnabled(slug)).map(([slug,category,title,summary])=>({
   slug,category,title:localizedTitle(lang,slug,title),
   summary: getServiceContent(slug,lang)?.shortDescription || (lang==='en' ? summary : `${u.categories[catIndex[category]]}: ${u.directoryIntro}`),
   detail:summary,items:[]
 }));
}
export function getService(m,slug,lang='en'){ return getServices(m,lang).find(s=>s.slug===slug); }
export function getCategoryServices(id,m={},lang='en'){ return getServices(m,lang).filter(s=>s.category===id); }
export const legacy=['power-of-attorney','legal-notices','attestation-legalisation'];
