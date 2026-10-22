import {getLanguageSitemap, getSitemapLanguages} from './sitemap';
const languageNames=new Intl.DisplayNames(['en'],{type:'language'});

// One same-origin stylesheet serves both the transformed HTML and native XML.
// CSS remains supported when a browser no longer applies XSLT.
export function sitemapStyles(lang) {
  const sets=getSitemapLanguages().map(lang=>({lang,entries:getLanguageSitemap(lang)}));
  const total=sets.reduce((sum,set)=>sum+set.entries.length,0);
  const images=sets.reduce((sum,set)=>sum+set.entries.reduce((count,entry)=>count+entry.images.length,0),0);
  const quote=value=>JSON.stringify(String(value)).replace(/\\n/g,'\\A ');
  const indexRules=sets.map(({lang,entries},index)=>`
s|sitemapindex > s|sitemap:nth-of-type(${index+1})::before{content:${quote(`${languageNames.of(lang)} · ${lang.toUpperCase()}`)}}
s|sitemapindex > s|sitemap:nth-of-type(${index+1})::after{content:${quote(`${entries.length} page URLs · ${entries.reduce((count,entry)=>count+entry.images.length,0)} image entries`)}}
`).join('');
  const publicationRules=(sets.find(set=>set.lang===lang)?.entries || []).map((entry,index)=>entry.publishedAt
    ? `s|urlset > s|url:nth-of-type(${index+1})::after{content: ${quote('Images: ')} counter(row-images) ${quote('\nPublished: '+entry.publishedAt)}}`
    : '').join('\n');
  return `@charset "UTF-8";
@namespace s url("http://www.sitemaps.org/schemas/sitemap/0.9");
@namespace i url("http://www.google.com/schemas/sitemap-image/1.1");
@namespace x url("http://www.w3.org/1999/xhtml");
:root{color-scheme:light;--ink:#202a35;--muted:#596777;--brown:#805c2e;--line:#e7e1d8}
*{box-sizing:border-box}html{background:#f7f5f1}body{margin:0;color:var(--ink);font:15px/1.6 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{max-width:1180px;padding:40px 24px 64px;margin:auto}a{color:var(--brown);text-underline-offset:4px}a:hover{color:#402a12}a:focus-visible{outline:3px solid var(--brown);outline-offset:4px}header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-bottom:24px;border-bottom:1px solid var(--line)}.brand{flex-shrink:0;white-space:nowrap;font-size:17px;font-weight:750;letter-spacing:2px;text-decoration:none}.eyebrow{text-transform:uppercase;font-size:12px;letter-spacing:2px;color:var(--brown);margin-top:32px}h1{font-size:clamp(28px,4vw,42px);line-height:1.2;margin:10px 0 18px}p{max-width:850px}.muted{color:var(--muted)}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:28px 0}.stat{padding:20px;background:white;border:1px solid var(--line);border-radius:12px}.stat strong{display:block;font-size:30px;line-height:1.2}.stat span{display:block;font-size:13px;color:var(--muted);margin-top:8px}.panel{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:white}.panel-title{margin:0;padding:20px;font-size:18px}.table-scroll{overflow:auto}table{width:100%;border-collapse:collapse;text-align:left}th{background:#f3efe8;font-size:12px;letter-spacing:.2px;color:#4b5059}th,td{padding:16px 20px;border-top:1px solid var(--line);vertical-align:top}tbody tr:hover{background:#fcfaf6}td.url{min-width:230px;max-width:570px;overflow-wrap:anywhere}time{font-size:12px;white-space:nowrap}.language{display:flex;align-items:center;gap:12px;text-decoration:none;min-height:28px}.tag,.count{font-size:12px;border-radius:5px;background:#f2ece2;padding:3px 8px;color:#614725}.language bdi{min-width:100px}.sitemap-address{display:block;font-size:11px;color:var(--muted);margin-top:6px;overflow-wrap:anywhere}.note{border-inline-start:3px solid #a8814a;padding:12px 16px;margin:24px 0;color:var(--muted);background:#f0ece5;border-radius:0 8px 8px 0}.foot{font-size:12px;margin-top:24px;color:var(--muted)}.image-urls{margin:9px 0 0;padding:0;list-style:none;font-size:12px;max-width:260px}.image-urls li{margin-top:7px;overflow-wrap:anywhere}ul{padding-inline-start:18px}li{overflow-wrap:anywhere;margin-top:8px}nav a{display:inline-block;padding:8px}nav{display:flex;flex-wrap:wrap;gap:4px}
@media(max-width:800px){main{padding:20px 14px 40px}.stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.stat{padding:14px}.stat strong{font-size:26px}header{align-items:flex-start}.brand{font-size:14px;letter-spacing:1px}nav{font-size:12px;justify-content:flex-end}thead{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}table,tbody{display:block}tbody tr{display:block;padding:14px;border-top:1px solid var(--line)}tbody td{display:block;border:0!important;padding:4px 0!important;min-width:0!important;max-width:none!important}td:nth-child(2)::before{content:"Images: ";font-size:12px;color:var(--muted)}td:nth-child(3)::before{content:"Last modified: ";font-size:12px;color:var(--muted)}.overview td:nth-child(2)::before{content:"Page URLs: "}.overview td:nth-child(3)::before{content:"Images: "}.detail td:nth-child(3)::before{content:"Published: ";font-size:12px;color:var(--muted)}.detail td:nth-child(4)::before{content:"Last modified: ";font-size:12px;color:var(--muted)}.overview td:nth-child(4)::before{content:"Last modified: ";font-size:12px;color:var(--muted)}}
/* Native XML presentation: no HTML response, JavaScript or separate viewer page. */
s|sitemapindex,s|urlset{display:block;margin:0 auto;padding:38px 24px 64px;max-width:1180px;background:#f7f5f1;color:#202a35;font:15px/1.6 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;counter-reset:xml-urls xml-images}
s|sitemapindex::before,s|urlset::before{display:block;white-space:pre-wrap;font-weight:650;color:#202a35;font-size:24px;line-height:1.7;margin-bottom:26px}
s|sitemapindex::before{content:${quote(`POA DUBAI\nXML Sitemap\n${sets.length} languages · ${total} page URLs · ${images} image entries\nSelect and copy a URL to open it`)}}
s|urlset::before{content:"POA DUBAI\\A XML Sitemap\\A Page addresses, images and known modification dates\\A Select and copy a URL to open it"}
s|sitemapindex > s|sitemap{display:block;padding:20px;margin-bottom:10px;background:white;border:1px solid #e7e1d8;border-radius:10px;overflow-wrap:anywhere}
s|sitemapindex > s|sitemap::before{display:block;font-weight:650;color:#805c2e;margin-bottom:5px}
s|sitemapindex > s|sitemap::after{display:block;font-size:12px;color:#596777;margin-top:8px}
s|sitemapindex > s|sitemap > s|loc{display:block;user-select:all;font-size:13px}
s|urlset > s|url{display:grid;grid-template-columns:minmax(0,1fr) 150px 190px;gap:14px;position:relative;padding:20px;margin-bottom:10px;background:white;border:1px solid #e7e1d8;border-radius:10px;counter-increment:xml-urls;counter-reset:row-images}
s|urlset > s|url > s|loc{display:block;grid-column:1;grid-row:1;color:#805c2e;overflow-wrap:anywhere;user-select:all}
s|urlset > s|url > s|lastmod{display:block;grid-column:3;grid-row:1;font-size:12px;color:#596777;overflow-wrap:anywhere}
s|urlset > s|url > s|lastmod::before{content:"Last modified\\A ";white-space:pre-wrap;font-weight:600}
s|urlset > s|url:not(:has(s|lastmod))::before{content:"Last modified\\A Not recorded";white-space:pre-wrap;grid-column:3;grid-row:1;font-size:12px;color:#596777}
s|urlset > s|url::after{content:"Images: " counter(row-images);grid-column:2;grid-row:1;font-size:12px;color:#596777}
s|urlset > s|url > i|image{display:block;grid-column:1;counter-increment:row-images xml-images;font-size:12px;color:#596777;overflow-wrap:anywhere}\ns|urlset > s|url > i|image::before{content:"Image URL: ";font-weight:600}\ns|urlset > s|url > i|image > i|loc{display:block;user-select:all;overflow-wrap:anywhere}
s|urlset > s|url > x|link{display:none}
s|urlset::after{display:block;white-space:pre-wrap;padding-top:20px;font-size:13px;color:#596777;content:"Total page URLs: " counter(xml-urls) " · Image entries: " counter(xml-images) "\\A Unknown dates are omitted. Time zone: UTC."}
s|sitemapindex::after{display:block;padding-top:20px;color:#596777;font-size:13px;content:"XML data is unchanged by this presentation"}
${indexRules}\n${publicationRules}
@media(max-width:800px){s|sitemapindex,s|urlset{padding:22px 14px 40px}s|sitemapindex::before,s|urlset::before{font-size:18px}s|urlset > s|url{display:block;padding:16px}s|urlset > s|url > s|lastmod,s|urlset > s|url::after,s|urlset > s|url:not(:has(s|lastmod))::before{display:block;margin-top:12px}s|sitemapindex > s|sitemap{padding:16px}}
`;
}
