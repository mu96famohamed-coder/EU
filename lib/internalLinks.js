export const PROTECTED_BRAND_NAMES=['POA Dubai'];
const BRAND_NAME=PROTECTED_BRAND_NAMES[0];

const escapeRegExp=(s)=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const BRAND_RE=new RegExp(escapeRegExp(BRAND_NAME).replace(/\\ /g,'\\s+'),'ig');

export function isProtectedBrandPhrase(value=''){
  return String(value).trim().toLocaleLowerCase()===BRAND_NAME.trim().toLocaleLowerCase();
}

function protectedBrandRanges(source){
  const ranges=[];
  BRAND_RE.lastIndex=0;
  let m;
  while((m=BRAND_RE.exec(source))) ranges.push([m.index,m.index+m[0].length]);
  return ranges;
}

const normalize=(s)=>String(s||'').toLocaleLowerCase().normalize('NFKC');
const words=(s)=>String(s||'').match(/[\p{L}\p{N}]+/gu)||[];

// Build multilingual anchors from the localized service data itself. Full
// service phrases always win. A distinctive single-word alias is allowed only
// when it identifies one related destination unambiguously and is not a common
// token across the service directory. This lets natural text such as
// "traduction", "translation" or "ترجمة" link to Certified Translation without
// maintaining 32 hand-written dictionaries.
export function buildAnchorVariants(service,lang='en',localContent=null){
  const title=String(service?.title||'').trim();
  const raw=[title,...(localContent?.keywords||[]),...(localContent?.keywordVariants||[])];
  const approved=[];
  for(const value of raw){
    for(const part of String(value||'').split(/\s*[\/|]\s*|\s*\([^)]*\)\s*/u)){
      const phrase=part.trim();
      if(phrase.length<4||isProtectedBrandPhrase(phrase)) continue;
      const tokenCount=words(phrase).length;
      // The localized service title is always an approved anchor. Keyword
      // variants must be explicit service phrases (2+ words), never generic
      // one-word associations such as "verifiable" or "drafting".
      if(phrase===title||tokenCount>=2) approved.push(phrase);
    }
  }
  return [...new Set(approved)].sort((a,b)=>b.length-a.length);
}

// Returns the exact span to link. A service phrase written with spaces may also
// match the same phrase written with hyphens, e.g. "certified translation"
// matches "certified-translation" as one complete anchor.
export function findContextualSpan(text, phrase, lang='en'){
  if(!text||!phrase||isProtectedBrandPhrase(phrase)) return null;
  const source=String(text), clean=String(phrase).trim();
  if(!clean) return null;
  const isStem=clean.endsWith('*');
  const base=isStem?clean.slice(0,-1):clean;
  const tokens=base.split(/[\s-]+/u).filter(Boolean).map(escapeRegExp);
  if(!tokens.length) return null;
  let core=tokens.join('[\\s\\-\\u2010-\\u2015]+');
  if(isStem) core += '[\\p{L}\\p{M}]*';
  const re=new RegExp(core,'giu');
  const brandRanges=protectedBrandRanges(source);
  let m;
  while((m=re.exec(source))){
    const start=m.index,end=start+m[0].length;
    const before=start>0?source[start-1]:'';
    const after=end<source.length?source[end]:'';
    if((before&&/[\p{L}\p{N}]/u.test(before))||(after&&/[\p{L}\p{N}]/u.test(after))) continue;
    if(brandRanges.some(([a,b])=>start<b&&end>a)) continue;
    return {start,end,match:m[0]};
  }
  return null;
}

export function findContextualMatch(text, phrase, lang='en'){
  const span=findContextualSpan(text,phrase,lang);
  return span?span.start:-1;
}
