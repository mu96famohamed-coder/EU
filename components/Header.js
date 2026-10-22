import HeaderClient from './HeaderClient';
import { getUi, getCategories, getServices } from '../lib/services';
import aboutCopy from '../lib/aboutCopy.json';
import navCopy from '../lib/navigationCopy.json';

export default function Header({ lang, m }) {
  const u = getUi(lang);
  return <HeaderClient lang={lang} m={m} u={{euUae:u.euUae}}
    t={navCopy[lang] || navCopy.en} aboutTitle={aboutCopy[lang]?.title}
    categories={getCategories(lang).map(({id,title})=>({id,title}))}
    services={getServices(m,lang).map(({slug,category,title})=>({slug,category,title}))}/>;
}
