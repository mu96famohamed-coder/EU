import {identitySchema,IDENTITY_ID} from '../../../../lib/contentIdentity';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isServiceEnabled } from '../../../../lib/serviceAvailability';
import { CODES, DOMAIN, MAIL } from '../../../../lib/i18n';
import { BRAND } from '../../../../lib/brand';
import { APOSTILLE_DESTINATIONS, apostilleDestination } from '../../../../lib/apostille';
import { absolute, languageAlternates, breadcrumbSchema, safeJsonLd, OG_LOCALE } from '../../../../lib/seo';

export const dynamicParams=false;
export function generateStaticParams(){ return isServiceEnabled('apostille') ? APOSTILLE_DESTINATIONS.map(d=>({lang:'en',country:d.slug})) : []; }
export async function generateMetadata({params}){
 if(!isServiceEnabled('apostille'))notFound();
 const {lang,country}=await params; const d=apostilleDestination(country); if(!d)return{};
 const title=`Apostille for Swedish Documents for Use in ${d.name} | ${BRAND.name}`;
 const description=`Arrange Apostille for eligible documents issued in Sweden and intended for use in ${d.name}. Sweden-origin documents only at present; destination requirements are checked before processing.`;
 const path=`/apostille/${country}`; const url=absolute(lang,path);
 return {title,description,alternates:{canonical:url,languages:languageAlternates(path)},robots:{index:lang==='en',follow:true},openGraph:{title,description,url,siteName:BRAND.name,locale:OG_LOCALE(lang),type:'website'},twitter:{card:'summary_large_image',title,description}};
}
export default async function Page({params}){
 if(!isServiceEnabled('apostille'))notFound();
 const {lang,country}=await params; const d=apostilleDestination(country); if(!d)notFound(); const url=absolute(lang,`/apostille/${country}`);
 const schemas=[identitySchema(lang),{'@context':'https://schema.org','@type':'Service','@id':`${url}#service`,name:`Apostille for Swedish Documents for Use in ${d.name}`,description:`Apostille coordination for eligible Sweden-issued documents intended for use in ${d.name}.`,provider:{'@id':IDENTITY_ID},areaServed:{'@type':'Country',name:d.name},url},breadcrumbSchema(lang,[{name:BRAND.name,path:''},{name:'Apostille Services',path:'/services/apostille'},{name:d.name,path:`/apostille/${country}`}])];
 return <main id="main-content" className="w service-page">
  <nav aria-label="Breadcrumb" className="breadcrumbs"><Link href={`/${lang}`}>{BRAND.name}</Link><span>›</span><Link href={`/${lang}/services/apostille`}>Apostille Services</Link><span>›</span><span>{d.name}</span></nav>
  <section className="service-hero"><span className="kicker">Swedish documents · International use</span><h1>Apostille for Swedish Documents for Use in {d.name}</h1><p>We coordinate Apostille for eligible documents <b>issued in Sweden</b> that are intended for use in {d.name}. We check the intended use and document type before processing.</p><div className="hero-actions"><a className="btn p" href={`mailto:${MAIL}?subject=${encodeURIComponent(`Apostille Sweden to ${d.name}`)}`}>Request an Apostille check</a><Link className="btn outline" href={`/${lang}/services/apostille`}>Apostille overview</Link></div></section>
  <section className="service-content"><div><span className="kicker">Current service scope</span><h2>Sweden is the document-origin country</h2><p>This service currently covers eligible public documents issued in Sweden. An Apostille is issued in the country of origin by a designated competent authority; in Sweden, Notaries Public (Notarius Publicus) are designated competent authorities.</p><h3>Typical documents</h3><ul className="service-list"><li>Birth, marriage and other eligible civil-status documents</li><li>Education and diploma documents where eligible</li><li>Company and business documents where eligible</li><li>Powers of attorney, declarations and notarised documents where eligible</li></ul><h3>How the route works</h3><ul className="service-list"><li>Tell us which Swedish document you have and where it will be used in {d.name}</li><li>We check whether Apostille is the appropriate route for the intended use</li><li>Any required notarisation or document preparation is identified first</li><li>Apostille is coordinated through the appropriate Swedish Notarius Publicus route</li><li>The completed document is returned according to the agreed digital/original-document process</li></ul><div className="route-note"><b>Not every international document follows the same route</b><p>Acceptance can depend on document type, receiving authority and the Convention's application between the relevant states. We confirm the route before accepting processing.</p></div></div><aside><span className="kicker">Built to expand</span><div className="scope-box"><b>Sweden first</b><p>POA Dubai currently offers this Apostille workflow for Sweden-issued documents. The platform is structured so additional origin countries can be activated later when a verified lawful electronic or partner-supported processing route is available.</p></div><div className="scope-box"><b>UAE is different</b><p>Documents intended for the UAE are handled through our UAE Legalisation / Attestation route, not presented as an Apostille destination.</p><Link href={`/${lang}/services/uae-document-attestation`}>UAE Document Attestation →</Link></div></aside></section>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJsonLd(schemas)}} />
 </main>
}
