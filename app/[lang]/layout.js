import '../globals.css';
import { notFound } from 'next/navigation';
import { CODES, RTL, DOMAIN, getM } from '../../lib/i18n';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { isSearchReady } from '../../lib/editorial';
import { BRAND } from '../../lib/brand';
import { languageAlternates, OG_LOCALE } from '../../lib/seo';
import FloatingActions from '../../components/FloatingActions';

export const dynamicParams = false;
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };
export const generateStaticParams = () => CODES.map((lang) => ({ lang }));

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!CODES.includes(lang)) return {};
  const m = await getM(lang);
  const languages = languageAlternates('');
  return { metadataBase: new URL(DOMAIN), title: m.t, description: m.sub, alternates: { canonical: `/${lang}`, languages }, openGraph: { title: m.t, description: m.sub, url: `/${lang}`, siteName: BRAND.name, locale: OG_LOCALE(lang), type: 'website' }, robots:{index:isSearchReady(lang),follow:true}, twitter:{card:'summary_large_image',title:m.t,description:m.sub} };
}

export default async function Layout({ children, params }) {
  const { lang } = await params;
  if (!CODES.includes(lang)) notFound();
  const m = await getM(lang);
  return <html lang={lang} dir={RTL.includes(lang) ? 'rtl' : 'ltr'}><body><a className="skip-link" href="#main-content">{lang === 'ar' ? 'تخطَّ إلى المحتوى' : lang === 'sv' ? 'Hoppa till innehållet' : 'Skip to content'}</a><div className="header-frame"><Header lang={lang} m={{ nav: m.nav, faqLabel: m.faqLabel, blogLabel: m.blogLabel, servicesLabel: m.sh }} /></div>{children}<Footer m={m} lang={lang} /><FloatingActions whatsappLabel={m.wa || 'WhatsApp'} /></body></html>;
}
