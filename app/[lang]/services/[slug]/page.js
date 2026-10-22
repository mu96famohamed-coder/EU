import scopeCopy from '../../../../lib/serviceScopeCopy.json';
import {getServiceSeo} from '../../../../lib/serviceSeo';
import {identitySchema,IDENTITY_ID} from '../../../../lib/contentIdentity';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {CODES,DOMAIN,MAIL,getM} from '../../../../lib/i18n';
import {BRAND} from '../../../../lib/brand';
import {getEnabledServiceSlugs} from '../../../../lib/serviceAvailability';
import {getService,getServices,getCategories,getUi} from '../../../../lib/services';
import {getServiceContent,getResearch} from '../../../../lib/serviceContent';
import marketProfiles from '../../../../lib/marketProfiles.json';
import {isSearchReady} from '../../../../lib/editorial';
import {reviewedLanguageAlternates,absolute,breadcrumbSchema,safeJsonLd,OG_LOCALE,defaultSocialImages} from '../../../../lib/seo';
import {findContextualSpan,buildAnchorVariants} from '../../../../lib/internalLinks';
import semanticLinkMap from '../../../../lib/semanticLinkMap.json';
import {semanticLinkLead} from '../../../../lib/semanticLinkCopy';
import StickyProcessGuard from '../../../../components/StickyProcessGuard';
export const dynamicParams=false;
export function generateStaticParams(){return CODES.flatMap(lang=>getEnabledServiceSlugs().map(slug=>({lang,slug})))}

const labels=(lang,u,m)=>({
  what:u.overview,
  before:u.process,
  remote:u.remote,
  questions:u.faq,
  problems:u.next
});

export async function generateMetadata({params}){
 const {lang,slug}=await params,m=await getM(lang),s=getService(m,slug,lang),r=getResearch(slug);if(!s)return{};
 const {seoTitle:title,seoDescription:description}=getServiceSeo(slug,lang,s),url=absolute(lang,`/services/${slug}`);
 return{title,description,keywords:getServiceContent(slug,lang)?.keywords||r?.research?.secondaryKeywords||[],alternates:{canonical:url,languages:reviewedLanguageAlternates(`/services/${slug}`)},robots:{index:isSearchReady(lang),follow:true},openGraph:{images:defaultSocialImages(lang),title,description,url,siteName:BRAND.name,locale:OG_LOCALE(lang),type:'website'},twitter:{images:defaultSocialImages(lang).map(i=>i.url),card:'summary_large_image',title,description}};
}

export default async function ServicePage({params}){
 const {lang,slug}=await params,m=await getM(lang),u=getUi(lang),service=getService(m,slug,lang);if(!service)notFound();
 const waNumber=process.env.NEXT_PUBLIC_WHATSAPP_NUMBER||'';
 const waHref=waNumber?`https://wa.me/${waNumber.replace(/\D/g,'')}?text=${encodeURIComponent(service.title)}`:'';
 const content=getServiceContent(slug,lang),all=getServices(m,lang),research=getResearch(slug),category=getCategories(lang).find(c=>c.id===service.category),url=absolute(lang,`/services/${slug}`),L=labels(lang,u,m),market=marketProfiles[lang]||marketProfiles.en;
 const semanticTargets=(semanticLinkMap[slug]||[]).filter(x=>x!==slug);
 const related=semanticTargets.map(x=>all.find(s=>s.slug===x)).filter(Boolean);
 const linkedDestinations=new Set();
 const anchorVariants=(r)=>buildAnchorVariants(r,lang,getServiceContent(r.slug,lang));
 const renderText=(text)=>{
   if(!text)return text;
   let parts=[String(text)];
   for(const r of related){
     if(r.slug===slug||linkedDestinations.has(r.slug))continue;
     const variants=anchorVariants(r);
     let linked=false;
     for(const phrase of variants){
       if(linked)break;
       const next=[];
       for(const part of parts){
         if(typeof part!=='string'||linked){next.push(part);continue;}
         const span=findContextualSpan(part,phrase,lang);
         if(!span){next.push(part);continue;}
         const before=part.slice(0,span.start),match=part.slice(span.start,span.end),after=part.slice(span.end);
         if(before)next.push(before);
         next.push(<Link className="internal-link" key={`${r.slug}-${linkedDestinations.size}`} href={`/${lang}/services/${r.slug}`}>{match}</Link>);
         if(after)next.push(after);
         linked=true;linkedDestinations.add(r.slug);
       }
       parts=next;
     }
   }
   return parts;
 };
 const semanticFallback=()=>{
   const missing=related.filter(r=>!linkedDestinations.has(r.slug));
   if(!missing.length)return null;
   return <span className="semantic-link-bridge"> {' '}{semanticLinkLead(lang)} {missing.map((r,i)=><span key={r.slug}>{i>0?(i===missing.length-1?' · ':' · '):''}<Link className="internal-link" href={`/${lang}/services/${r.slug}`}>{r.title}</Link></span>)}.</span>;
 };
 const agencyVideoNote = ['general-power-of-attorney','special-power-of-attorney','poa-online-notarisation'].includes(slug);
 const scopeNote = agencyVideoNote ? m.note : scopeCopy[lang];
 const faq=(content?.faq||[]).slice(0,5).map(x=>({q:x.q,a:x.a}));
 const schemas=[identitySchema(lang),{'@context':'https://schema.org','@type':'Service','@id':`${url}#service`,name:service.title,description:service.summary,serviceType:service.title,provider:{'@id':IDENTITY_ID},url},breadcrumbSchema(lang,[{name:BRAND.name,path:''},{name:category?.title||m.sh,path:`#${service.category}`},{name:service.title,path:`/services/${slug}`}]),{'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(x=>({'@type':'Question',name:x.q,acceptedAnswer:{'@type':'Answer',text:x.a}}))}];
 return <main id="main-content" className="w service-page">
  <nav aria-label="Breadcrumb" className="breadcrumbs"><Link href={`/${lang}`}>{BRAND.name}</Link><span>›</span><Link href={`/${lang}#${service.category}`}>{category?.title||m.sh}</Link><span>›</span><span aria-current="page">{service.title}</span></nav>
  <section className="service-hero"><span className="kicker">{BRAND.name} · {u.euUae}</span><h1>{service.title}</h1><p>{content?.shortDescription||service.summary}</p><div className="hero-actions">{waHref?<a className="btn service-whatsapp whatsapp-site-cta" href={waHref} target="_blank" rel="noopener noreferrer">{m.wa||'WhatsApp'}</a>:<span className="btn service-whatsapp whatsapp-site-cta whatsapp-disabled" aria-disabled="true">{m.wa||'WhatsApp'}</span>}<a className="btn p" href={`mailto:${MAIL}?subject=${encodeURIComponent(service.title)}`}>{m.mail}</a><Link className="btn outline back-to-category" href={`/${lang}#${service.category}`}><span className="back-arrow" aria-hidden="true"></span><span>{category?.title}</span></Link></div></section>
  <section className="service-content"><article>
   <span className="kicker">{u.overview}</span><h2>{service.title}</h2><p>{renderText(content?.intro)}</p>
   <h2>{L.what}</h2><p>{renderText(content?.what)}</p>
   <h2>{u.howHelp}</h2><p>{renderText(content?.howHelp)}</p>
   <h2>{L.before}</h2><p>{renderText(content?.beforeYouStart)}</p>
   <h2>{L.remote}</h2><p>{renderText(content?.remote)}</p>
   <div className="service-mobile-process" aria-label={u.process}><span className="kicker">{u.process}</span>{m.st.map((step,i)=><div className={`mini-step${i===3?' process-complete':''}`} key={i}><b>{i+1}</b><span>{step[0]}</span></div>)}<div className="scope-box"><b>{u.independent}</b><p>{scopeNote}</p></div></div>
   <div className="pre-faq-cta"><div className="pre-faq-copy"><h2>{u.preFaqWhatsapp?.title || u.faqPrompt}</h2><p>{u.preFaqWhatsapp?.text || u.faqPrompt}</p></div>{waHref?<a className="btn service-whatsapp whatsapp-site-cta" href={waHref} target="_blank" rel="noopener noreferrer">{m.wa||'WhatsApp'}</a>:<span className="btn service-whatsapp whatsapp-site-cta whatsapp-disabled" aria-disabled="true">{m.wa||'WhatsApp'}</span>}</div>
   <h2>{L.questions}</h2><div className="faq-list">{faq.map((x,i)=><details key={i}><summary>{x.q}</summary><p>{renderText(x.a)}</p></details>)}</div>
  </article><StickyProcessGuard><span className="kicker">{u.process}</span>{m.st.map((step,i)=><div className={`mini-step${i===3?' process-complete':''}`} key={i}><b>{i+1}</b><span>{step[0]}</span></div>)}<div className="scope-box"><b>{u.independent}</b><p>{scopeNote}</p></div><div className="desktop-sticky-whatsapp"><h2>{u.preFaqWhatsapp?.title || u.faqPrompt}</h2>{waHref?<a className="btn service-whatsapp whatsapp-site-cta" href={waHref} target="_blank" rel="noopener noreferrer">{m.wa||'WhatsApp'}</a>:<span className="btn service-whatsapp whatsapp-site-cta whatsapp-disabled" aria-disabled="true">{m.wa||'WhatsApp'}</span>}</div></StickyProcessGuard></section>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJsonLd(schemas)}}/>
 </main>;
}
