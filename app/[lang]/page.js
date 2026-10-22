import {identitySchema} from '../../lib/contentIdentity';
import {websiteSchema} from '../../lib/seo';
import Link from 'next/link';
import { getM, MAIL, DOMAIN } from '../../lib/i18n';
import { BRAND } from '../../lib/brand';
import { getCategories, getCategoryServices, getUi } from '../../lib/services';
import { getServiceSearchIndex } from '../../lib/serviceSearchIndex';
import { getSeoCopy } from '../../lib/seoCopy';
import HeroServiceSearch from '../../components/HeroServiceSearch';
import AuthorityMarquee from '../../components/AuthorityMarquee';
import aboutCopy from '../../lib/aboutCopy.json';

export default async function Home({ params }) {
 const {lang}=await params; const m=await getM(lang); const u=getUi(lang); const categories=getCategories(lang); const about=aboutCopy[lang]||aboutCopy.en;
 const services=categories.flatMap(c=>getCategoryServices(c.id,m,lang));
 const searchIndex=getServiceSearchIndex(lang);
 const waNumber=process.env.NEXT_PUBLIC_WHATSAPP_NUMBER||'';
 const waHref=waNumber?`https://wa.me/${waNumber.replace(/\D/g,'')}`:'';
 const ld=[identitySchema(lang),websiteSchema(),
 {'@context':'https://schema.org','@type':'ItemList',name:m.sh,itemListElement:services.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.title,url:`${DOMAIN}/${lang}/services/${s.slug}`}))}];
 return <main id="main-content">
  <section className="hero-shell"><div className="w hero"><div className="hero-layout"><div className="trust-row"><span>{u.remote}</span><span>{u.euUae}</span><span>{u.inside}</span><span>{u.multilingual}</span></div><div className="hero-copy"><div className="eyebrow">{u.euUae}</div><h1>{m.h1}</h1><p>{m.sub}</p><AuthorityMarquee authorities={about.authorities} label={about.authoritiesTitle}/><p className="hero-authority-message">{about.authoritiesCta}</p></div>
   <div className="hero-finder"><HeroServiceSearch lang={lang} searchIndex={searchIndex} labels={u.serviceSearch} loadingLabel={getSeoCopy(lang).searchLoading}/></div>
   <div className="hero-actions">{waHref?<a className="btn whatsapp-primary whatsapp-site-cta" href={waHref} target="_blank" rel="noopener noreferrer">{u.serviceSearch.whatsapp}</a>:<span className="btn whatsapp-primary whatsapp-site-cta whatsapp-unconfigured" aria-disabled="true">{u.serviceSearch.whatsapp}</span>}<a className="btn p hero-email-secondary" href={`mailto:${MAIL}`}>{m.mail}</a><a className="btn g" href="#services">{u.explore}</a></div></div>
  </div></section>
  <div className="w">
   <section id="services" className="section-head"><div><span className="kicker">{u.directory}</span><h2>{m.sh}</h2></div><p className="section-intro">{u.directoryIntro}</p></section>
   <nav className="category-nav" aria-label={m.sh}>{categories.map(c=><a key={c.id} href={`#${c.id}`}>{c.title}</a>)}</nav>
   {categories.map(category=><section className="service-category" id={category.id} key={category.id}>
    <div className="category-heading"><div><span className="kicker">POA Dubai</span><h2>{category.title}</h2></div><p>{category.intro}</p></div>
    <div className="service-grid catalog-grid">{getCategoryServices(category.id,m,lang).map(service=><Link className="service-card compact" href={`/${lang}/services/${service.slug}`} key={service.slug}><h3>{service.title}</h3><p>{service.summary}</p></Link>)}</div>
   </section>)}
   <section className="process-section"><div className="section-head"><div><span className="kicker">{u.simple}</span><h2>{m.ph}</h2></div></div><div className="process-grid">{m.st.map((v,i)=><div className="process-card" key={i}><span>{i+1}</span><h3>{v[0]}</h3><p>{v[1]}</p></div>)}</div><p className="note">{m.note}</p><div className="pre-faq-cta home-whatsapp-conversion"><div className="pre-faq-copy"><h2>{u.preFaqWhatsapp?.title || u.faqPrompt}</h2><p>{u.preFaqWhatsapp?.text || u.faqPrompt}</p></div>{waHref?<a className="btn service-whatsapp whatsapp-site-cta" href={waHref} target="_blank" rel="noopener noreferrer">{m.wa||u.serviceSearch?.whatsapp||'WhatsApp'}</a>:<span className="btn service-whatsapp whatsapp-site-cta whatsapp-disabled" aria-disabled="true">{m.wa||u.serviceSearch?.whatsapp||'WhatsApp'}</span>}</div></section>
  </div><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld).replace(/</g,'\\u003c')}}/>
 </main>;
}