export const norm=(v='')=>String(v).toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
export function rankServices(searchIndex, value, lang){
 const query=norm(value);
    if(!query) return [];
    // Reject obvious non-search input (e.g. aaaaaaa / ///////) before scoring.
    const compact=query.replace(/\s+/g,'');
    if(compact.length<2 || (/^(.)\1{3,}$/u.test(compact))) return [];
    const tokens=query.split(/\s+/).filter(t=>t.length>1);
    if(!tokens.length) return [];
    const scored=searchIndex.map(s=>{
      const title=norm(s.title), keywords=norm((s.keywords||[]).join(' | ')), summary=norm(s.summary||'');
      const primary=`${title} | ${keywords}`;
      const allText=`${primary} | ${summary}`;
      const allTokensMatch=tokens.length>1&&tokens.every(t=>allText.includes(t));
      const primaryTokenMatch=tokens.some(t=>primary.includes(t));
      // A single generic word must occur in the service title/approved keywords.
      // Descriptions can support a multi-word query, but can never create a result alone.
      let score=title===query?140:title.startsWith(query)?120:title.includes(query)?105:keywords.includes(query)?90:primary.includes(query)?80:(allTokensMatch&&primaryTokenMatch)?55:0;
      if(s.lang===lang && score>0) score+=3;
      return {...s,score};
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
    const seen=new Set();
    return scored.filter(x=>{const k=`${x.slug}:${x.lang}`;if(seen.has(k))return false;seen.add(k);return true;}).slice(0,6);

}
