import {sitemapStyles} from '../../lib/sitemap-style';
export const dynamic = 'force-static';
export function GET() {
  return new Response(sitemapStyles(), {headers:{'Content-Type':'text/css; charset=utf-8','X-Robots-Tag':'noindex'}});
}
