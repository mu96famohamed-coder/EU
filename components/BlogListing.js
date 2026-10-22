import {defaultSocialImages} from '../lib/seo';
import {getSeoCopy} from '../lib/seoCopy';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getM, DOMAIN } from '../lib/i18n';
import { BRAND } from '../lib/brand';
import { formatBlogDate, safeBlogJsonLd } from '../lib/blog';
import { BLOG_PAGE_SIZE, blogPagePath, getBlogPageInfo, getBlogPageAlternates } from '../lib/blog-pagination';

export async function blogListingMetadata(lang, page=1) {
  const info=getBlogPageInfo(lang,page);
  if (!info) notFound();
  const m=await getM(lang);
  const title=info.page===1 ? `${m.blogLabel} | ${BRAND.name}` : `${m.blogLabel} | ${info.copy.page} ${new Intl.NumberFormat(lang).format(info.page)} | ${BRAND.name}`;
  const description=getSeoCopy(lang).blogDescription+(info.page>1 ? ` ${info.copy.page} ${new Intl.NumberFormat(lang).format(info.page)}.` : '');
  const path=blogPagePath(lang,info.page);
  return {title,description,alternates:{canonical:path,languages:getBlogPageAlternates(info.page)},
    openGraph:{images:defaultSocialImages(lang),title,description,url:`${DOMAIN}${path}`,type:'website',siteName:BRAND.name},robots:{index:info.total>0,follow:true}};
}

export default async function BlogListing({lang,page=1}) {
  const info=getBlogPageInfo(lang,page);
  if (!info) notFound();
  const m=await getM(lang),number=new Intl.NumberFormat(lang);
  const ld={'@context':'https://schema.org','@type':'ItemList',name:m.blogLabel,itemListElement:info.posts.map((post,index)=>({'@type':'ListItem',position:(info.page-1)*BLOG_PAGE_SIZE+index+1,name:post.title,url:`${DOMAIN}/${lang}/blog/${post.slug}`}))};
  return <main id="main-content" className="w">
    <section id="blog">
      <h1 style={{fontSize:'clamp(28px,4vw,40px)',marginBottom:28}}>{m.blogLabel}</h1>
      <div id="bll" style={{gridTemplateColumns:'repeat(auto-fill, minmax(min(100%, 290px), 1fr))'}}>{info.posts.map(post=><article className="bc" key={post.slug}>
        <div className="bi"><img src={post.image} alt={post.imageAlt || post.title} width="400" height="225" loading="lazy" style={{display:'block',width:'100%',height:'auto',aspectRatio:'400 / 225',objectFit:'cover'}} /></div>
        <div className="bm">{post.author || 'POA DUBAI'} &nbsp;·&nbsp; <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt,lang)}</time></div>
        <h3><Link className="blog-title-link" href={`/${lang}/blog/${post.slug}`}>{post.title}</Link></h3>
        <p>{post.description}</p>
      </article>)}</div>
      {info.pageCount>1 ? <nav aria-label={info.copy.nav} style={{display:'flex',alignItems:'center',justifyContent:'center',flexWrap:'wrap',gap:'16px',marginTop:'32px'}}>
        {info.previous ? <Link className="btn p" href={info.previous} rel="prev">{info.copy.previous}</Link> : null}
        <span aria-current="page">{info.copy.page} {number.format(info.page)} / {number.format(info.pageCount)}</span>
        {info.next ? <Link className="btn p" href={info.next} rel="next">{info.copy.next}</Link> : null}
      </nav> : null}
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeBlogJsonLd(ld)}} />
  </main>;
}
