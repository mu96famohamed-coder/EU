import { notFound, permanentRedirect } from 'next/navigation';
import { CODES } from '../../../lib/i18n';

export const dynamicParams = false;
export const generateStaticParams = () => CODES.map(lang => ({ lang }));

export default async function ServicesIndex({ params }) {
  const { lang } = await params;
  if (!CODES.includes(lang)) notFound();
  permanentRedirect(`/${lang}#services`);
}
