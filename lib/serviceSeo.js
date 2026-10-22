import 'server-only';
import metadata from './serviceSeo.json';

export function getServiceSeo(slug,lang,fallback={}) {
  const entry=metadata[slug]?.[lang];
  return entry || {
    seoTitle:`${fallback.title || slug} | POA DUBAI`,
    seoDescription:fallback.summary || '',
  };
}
