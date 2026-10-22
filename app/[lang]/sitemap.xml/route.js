import { getSitemapLanguages, languageSitemapXml } from '../../../lib/sitemap';

export const dynamic = 'force-static';
export const dynamicParams = false;
export const generateStaticParams = () => getSitemapLanguages().map(lang => ({ lang }));

export async function GET(_request, { params }) {
  const { lang } = await params;
  if (!getSitemapLanguages().includes(lang)) return new Response('Not Found', { status: 404 });
  return new Response(languageSitemapXml(lang), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
