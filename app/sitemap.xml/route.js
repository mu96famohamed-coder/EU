import { unifiedSitemapXml } from '../../lib/sitemap';

export const dynamic = 'force-static';

export function GET() {
  return new Response(unifiedSitemapXml(), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
