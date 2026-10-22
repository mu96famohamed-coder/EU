import { getArticles } from './blog';
import { CODES, DOMAIN } from './i18n';
import copy from './blogPaginationCopy.json';

export const BLOG_PAGE_SIZE = 10;
export const blogPagePath = (lang, page=1) => page===1 ? `/${lang}/blog` : `/${lang}/blog/page/${page}`;
export const getBlogPageCount = lang => Math.ceil(getArticles(lang).length / BLOG_PAGE_SIZE);
export function getBlogPageInfo(lang, requestedPage=1) {
  if (!CODES.includes(lang) || !/^[1-9]\d*$/.test(String(requestedPage))) return null;
  const page=Number(requestedPage), posts=getArticles(lang), pageCount=Math.ceil(posts.length/BLOG_PAGE_SIZE);
  if (!Number.isSafeInteger(page) || page>Math.max(1,pageCount)) return null;
  return {page,pageCount,total:posts.length,posts:posts.slice((page-1)*BLOG_PAGE_SIZE,page*BLOG_PAGE_SIZE),copy:copy[lang],
    previous:page>1 ? blogPagePath(lang,page-1) : null,next:page<pageCount ? blogPagePath(lang,page+1) : null};
}
export function getBlogPageAlternates(page=1) {
  const langs=CODES.filter(lang=>getBlogPageCount(lang)>=page);
  const links=Object.fromEntries(langs.map(lang=>[lang,`${DOMAIN}${blogPagePath(lang,page)}`]));
  if (langs.length) links['x-default']=links[langs.includes('en')?'en':langs[0]];
  return links;
}
export function getAdditionalBlogPages() {
  return CODES.flatMap(lang=>Array.from({length:Math.max(0,getBlogPageCount(lang)-1)},(_,index)=>({lang,page:String(index+2)})));
}
