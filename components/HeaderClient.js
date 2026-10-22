'use client';

import WhatsAppIcon from './WhatsAppIcon';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {usePathname,useRouter} from 'next/navigation';
import langs from '../lib/langs.json';
import {BRAND} from '../lib/brand';

export default function HeaderClient({lang,m,u,t,categories,services,aboutTitle}){
 const text=value=>typeof value==='string'?value.replace(/(?:\s*\u2014\s*|\s+\u2013\s+)/g,lang==='ar'?'، ':', '):value;
 const [open,setOpen]=useState(null),[mobile,setMobile]=useState(false),[menuTop,setMenuTop]=useState(76);
 const shell=useRef(null),router=useRouter(),path=usePathname();
 const waNumber=(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER||'').replace(/\D/g,'');
 const waHref=waNumber?`https://wa.me/${waNumber}`:null;
 const waLabel=text(m.wa||'WhatsApp');
 const whatsappIcon=<WhatsAppIcon className="lux-whatsapp-icon"/>;
 const whatsappButton=(className)=>waHref?<a className={className} href={waHref} target="_blank" rel="noopener noreferrer" onClick={close}>{whatsappIcon}<span>{waLabel}</span></a>:<span className={className+' lux-wa-unavailable'} aria-disabled="true">{whatsappIcon}<span>{waLabel}</span></span>;
 const guides=[['how-it-works',t.how],['pricing',t.pricing],['document-requirements',t.documents],['document-rejection',t.issues],['faq',m.faqLabel]];
 const change=e=>{const next=e.target.value;setOpen(null);setMobile(false);if(/^\/en\/apostille\//.test(path)&&next!=='en')return router.push(`/${next}/services/apostille`);router.push(path.replace(/^\/[^/]+/,'/'+next));};
 useEffect(()=>{setOpen(null);setMobile(false)},[path]);
 useEffect(()=>{const click=e=>{if(shell.current&&!shell.current.contains(e.target)){setOpen(null);setMobile(false)}};const key=e=>{if(e.key==='Escape'){setOpen(null);setMobile(false)}};document.addEventListener('pointerdown',click);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',click);document.removeEventListener('keydown',key)}},[]);
 const toggle=id=>{if(shell.current)setMenuTop(shell.current.getBoundingClientRect().bottom+8);setOpen(x=>x===id?null:id)};
 const close=()=>{setOpen(null);setMobile(false)};
 const group=(id,label,content,large=false)=><div className={'lux-nav-group'+(open===id?' active':'')} key={id}>
  <button type="button" className="lux-nav-trigger" aria-expanded={open===id} aria-controls={'lux-panel-'+id} onClick={()=>toggle(id)}>{text(label)}<svg aria-hidden="true" className="lux-nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 9 5.5 5.5L17.5 9"/></svg></button>
  <div id={'lux-panel-'+id} className={'lux-nav-panel'+(large?' lux-nav-mega':'')} hidden={open!==id}>{content}</div>
 </div>;
 return <header className="site-header lux-header" dir={lang==='ar'?'rtl':'ltr'} ref={shell} style={{"--lux-menu-top":`${menuTop}px`}}>
  <style jsx global>{`
 .lux-header .brand-logo-image {width:42px;height:42px;object-fit:contain;flex:0 0 auto;display:block;}
 @media(max-width:600px){.lux-header .brand-logo-image{width:38px;height:38px;}}
 @media(max-width:560px){.lux-header .brand-logo-image{width:35px;height:35px;}}

 .hero-shell .hero-actions .btn.whatsapp-primary.whatsapp-site-cta {
  display: flex !important; align-items: center; justify-content: center;
  width: 260px !important; max-width: 100% !important; min-width: 0 !important;
  flex: 0 1 260px !important; min-height: 52px !important; height: auto !important;
  padding: 12px 18px !important; font-size: 15px !important;
  white-space: normal !important; overflow-wrap: anywhere; word-break: normal;
  line-height: 1.4 !important; text-align: center; box-sizing: border-box; gap: 9px;
 }
 .hero-shell .hero-actions .btn.whatsapp-primary.whatsapp-site-cta::before {
  position: static !important; inset: auto !important; transform: none !important;
  flex: 0 0 20px; width: 20px; height: 20px;
 }
 @media (max-width: 600px) {
  .hero-shell .hero-actions .btn.whatsapp-primary.whatsapp-site-cta {
   width: 100% !important; flex-basis: 100% !important;
  }
 }
`}</style>
  <Link className="logo" href={`/${lang}`} onClick={close} aria-label={BRAND.name}><Image className="brand-logo-image" src="/images/brand/logo.png" alt="" width={42} height={42} sizes="(max-width: 560px) 35px, (max-width: 600px) 38px, 42px" priority /><span className="brand-copy"><b>POA DUBAI</b><small>{text(u.euUae)}</small></span></Link>
  <nav className={'lux-navigation'+(mobile?' mobile-visible':'')} id="nav" aria-label={text(t.navigation)}>
   <Link className="lux-nav-home" href={`/${lang}`} onClick={close}>{text(m.nav[0])}</Link>
   {group('services',m.servicesLabel||t.services,<div className="lux-mega-layout"><div className="lux-mega-main"><div className="lux-panel-intro"><span>{text(t.services)}</span><p>{text(t.serviceIntro)}</p></div><div className="lux-service-groups">{categories.map(c=><div className="lux-service-category" key={c.id}><Link className="lux-category-title" href={`/${lang}#category-${c.id}`} onClick={close}>{text(c.title)}<span aria-hidden="true">↗</span></Link>{services.filter(s=>s.category===c.id).slice(0,3).map(s=><Link key={s.slug} href={`/${lang}/services/${s.slug}`} onClick={close}>{text(s.title)}</Link>)}</div>)}</div></div><aside className="lux-mega-aside"><span className="lux-aside-kicker">POA DUBAI</span><strong>{text(t.needHelp)}</strong><p>{text(t.helpDescription)}</p>{whatsappButton("lux-aside-whatsapp")}</aside></div>,true)}
   {group('guides',t.guides,<div className="lux-small-panel"><p className="lux-panel-heading">{text(t.guideIntro)}</p>{guides.map(([slug,label])=><Link key={slug} href={`/${lang}/${slug}`} onClick={close}>{text(label)}<span aria-hidden="true">↗</span></Link>)}</div>)}
   {group('explore',t.explore,<div className="lux-small-panel"><p className="lux-panel-heading">{text(t.exploreIntro)}</p><Link href={`/${lang}/about`} onClick={close}>{text(aboutTitle||t.about)}<span aria-hidden="true">↗</span></Link><Link href={`/${lang}/blog`} onClick={close}>{text(m.blogLabel)}<span aria-hidden="true">↗</span></Link><Link href={`/${lang}/faq`} onClick={close}>{text(m.faqLabel)}<span aria-hidden="true">↗</span></Link><Link href={`/${lang}/contact`} onClick={close}>{text(m.nav[1])}<span aria-hidden="true">↗</span></Link></div>)}
   {whatsappButton("lux-nav-cta lux-nav-whatsapp")}
  </nav>
  <div className="lux-header-tools"><select id="lang" aria-label={text(t.language)} value={lang} onChange={change}>{langs.map(l=><option key={l.code} value={l.code}>{l.name}</option>)}</select><button type="button" className="lux-mobile-toggle" aria-expanded={mobile} aria-controls="nav" aria-label={text(mobile?t.close:t.menu)} onClick={()=>{setMobile(v=>!v);setOpen(null)}}><span aria-hidden="true">{mobile?'×':'☰'}</span></button></div>
 </header>;
}
