import 'server-only';
import research from './serviceResearch.json';

export function getServiceContent(slug, lang='en'){
  const item=research[slug];
  if(!item) return null;
  return item[lang] || item.en;
}

export function getResearch(slug){ return research[slug] || null; }
