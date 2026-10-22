import 'server-only';
import langs from './langs.json';
import { getEnabledServiceSlugs } from './serviceAvailability';
import { SERVICE_CATEGORIES, SERVICES } from './serviceCatalog';
import { getServiceContent } from './serviceContent';
export function getServiceSearchIndex(language) {
  const selected = language ? langs.filter(item=>item.code===language) : langs;
  const enabled = new Set(getEnabledServiceSlugs());
  const slugs = SERVICE_CATEGORIES.flatMap(category=>SERVICES.filter(([slug,group])=>group===category.id&&enabled.has(slug)).map(([slug])=>slug));
  return slugs.flatMap(slug=>selected.map(item=>{
    const c=getServiceContent(slug,item.code)||{};
    return {slug,lang:item.code,languageName:item.name,title:c.title||slug,
      summary:c.shortDescription||c.intro||'',keywords:c.keywords||[]};
  }));
}
