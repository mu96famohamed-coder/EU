import aboutCopy from './aboutCopy.json';
import editorialCopy from './editorialCopy.json';
import sourceData from './articleSources.json';
import {BRAND} from './brand';
import {DOMAIN} from './i18n';

export const IDENTITY_ID = `${DOMAIN}/#identity`;
export function getEditorialCopy(lang) { return editorialCopy[lang] || editorialCopy.en; }
export function identitySchema(lang='en') {
  const digits=String(BRAND.phone||'').replace(/\D/g,'');
  return {
    '@context':'https://schema.org','@type':'Organization','@id':IDENTITY_ID,
    name:BRAND.name,url:DOMAIN,email:BRAND.email,
    logo:{'@type':'ImageObject',url:`${DOMAIN}/images/brand/logo.png`},
    address:{'@type':'PostalAddress',...BRAND.address},
    ...(digits ? {telephone:`+${digits}`} : {}),
  };
}
export function articleAuthorSchema(post,lang) {
  // The site is the default author; a real named author can still be specified in blog.json.
  return post.author && post.author!==BRAND.name
    ? {'@type':'Person',name:post.author}
    : {'@type':'Organization','@id':IDENTITY_ID,name:BRAND.name,url:`${DOMAIN}/${lang}/about#content`};
}
// Move a terminal list of external reference links into the unified source section.
// Match the structure, rather than translated heading text; retain every other block verbatim.
export function splitArticleReferences(content=[]) {
  const externalOnly=block=>block && block.type==='paragraph' &&
    Array.isArray(block.children) && block.children.length>0 &&
    block.children.every(part=>part && typeof part.text==='string' && /^https:\/\//i.test(part.href||''));
  let start=content.length;
  while(start>0 && externalOnly(content[start-1]))start--;
  const heading=content[start-1];
  if(start===content.length || !heading || heading.type!=='heading' || ![undefined,2].includes(heading.level) || !sourceData.legacyHeadings.includes(heading.text))
    return {content,references:[]};
  return {content:content.slice(0,start-1),references:content.slice(start).flatMap(block=>block.children.map(part=>({name:part.text,url:part.href})))};
}
export function getArticleBody(post) { return splitArticleReferences(post.content).content; }
export function sourceKey(url) {
  try {
    const u=new URL(url);u.hash='';u.hostname=u.hostname.replace(/^www\./i,'');
    u.pathname=u.pathname.replace(/\/+$/,'')||'/';
    if(u.hostname==='mofa.gov.ae')u.pathname=u.pathname.toLowerCase();
    for(const key of [...u.searchParams.keys()])if(key.startsWith('utm_'))u.searchParams.delete(key);
    u.searchParams.sort();return u.href;
  } catch {return String(url);}
}
export function getArticleSources(post,lang='en') {
  const a=aboutCopy[lang]?.authorities || aboutCopy.en.authorities,e=getEditorialCopy(lang);
  const names={'dubai-notary':a[0],mofa:a[2],'land-sale':a[3],
    'land-faq':`${a[3]} · ${e.sourcesFAQ}`,vehicle:a[4],translator:a[1],
    ejari:`${a[3]} · Ejari`,'land-revocation':a[3],'moj-cancellation':a[1],
    'bank-authority':e.bankSource,children:e.childrenSource,
    'nbd-poa':lang==='ar'?'الإمارات دبي الوطني':'Emirates NBD',etihad:lang==='ar'?'الاتحاد للطيران':'Etihad Airways',
    'eu-minors':lang==='ar'?'بوابة أوروبا الخاصة بك، وثائق سفر القاصرين':'Your Europe'};
  const curated=sourceData.articles[post.slug];
  const sources=post.sources || (curated
    ? curated.map(id=>({...sourceData.sources[id],name:names[id]||sourceData.sources[id].name}))
    : splitArticleReferences(post.content).references);
  const seen=new Set();
  return sources.filter(source=>{
    if(!source || !/^https:\/\//i.test(source.url||''))return false;
    const key=sourceKey(source.url);if(seen.has(key))return false;seen.add(key);return true;
  }).map(source=>({name:source.name,url:source.url}));
}
