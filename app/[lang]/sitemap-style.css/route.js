import {sitemapStyles} from '../../../lib/sitemap-style';
import {getSitemapLanguages} from '../../../lib/sitemap';
export const dynamic = 'force-static';
export const dynamicParams = false;
export function generateStaticParams() { return getSitemapLanguages().map(lang=>({lang})); }
export async function GET(_request,{params}) {
  const {lang}=await params;
  if (!getSitemapLanguages().includes(lang)) return new Response('Not found',{status:404});
  return new Response(sitemapStyles(lang),{headers:{'Content-Type':'text/css; charset=utf-8','X-Robots-Tag':'noindex'}});
}
