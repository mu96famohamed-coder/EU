import { DOMAIN } from '../lib/i18n';

export default function robots() {
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: [`${DOMAIN}/sitemap.xml`, `${DOMAIN}/sitemap-all.xml`],
  };
}