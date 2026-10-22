import {identitySchema,IDENTITY_ID,articleAuthorSchema,getArticleSources,getEditorialCopy,getArticleBody} from '../../../../lib/contentIdentity';
import {defaultSocialImages} from '../../../../lib/seo';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getM, RTL, DOMAIN } from '../../../../lib/i18n';
import { BRAND } from '../../../../lib/brand';
import { getArticle, getBlogRoutes, getArticleAlternates, formatBlogDate, safeBlogJsonLd } from '../../../../lib/blog';
import BlogContent from '../../../../components/BlogContent';
import { getUi } from '../../../../lib/services';
import { articleModifiedAt } from '../../../../lib/articleDates';

export const dynamicParams = false;
export const generateStaticParams = () => getBlogRoutes();

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const post = getArticle(slug,lang);
  if (!post) notFound();
  const title = post.seoTitle || `${post.title} | ${BRAND.name}`;
  const description = post.seoDescription || post.description;
  const images = /\.svg(?:$|\?)/i.test(post.image) ? defaultSocialImages(lang) : [{url:new URL(post.image,DOMAIN).href,alt:post.imageAlt || post.title}];
  return {
    title,description,
    alternates:{canonical:`/${lang}/blog/${slug}`,languages:getArticleAlternates(slug,DOMAIN)},
    openGraph:{title,description,url:`${DOMAIN}/${lang}/blog/${slug}`,type:'article',siteName:BRAND.name,locale:lang.replace('-','_'),publishedTime:post.publishedAt,modifiedTime:articleModifiedAt(post,lang),authors:[post.author || BRAND.name],...(images ? {images} : {})},
    twitter:{card:'summary_large_image',title,description,...(images ? {images:[images[0].url]} : {})},
    robots:{index:true,follow:true},
  };
}

export default async function Article({ params }) {
  const { lang, slug } = await params;
  const post = getArticle(slug,lang);
  if (!post) notFound();
  const m = await getM(lang);
  const u = getUi(lang);
  const sources=getArticleSources(post,lang),editorial=getEditorialCopy(lang);
  const waNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(post.title)}` : '';
  const url = `${DOMAIN}/${lang}/blog/${slug}`;
  const ld = {
    '@context':'https://schema.org','@type':'BlogPosting',headline:post.title,description:post.description,inLanguage:lang,
    datePublished:post.publishedAt,dateModified:articleModifiedAt(post,lang),image:new URL(post.image,DOMAIN).href,
    author:articleAuthorSchema(post,lang),publisher:{'@id':IDENTITY_ID},
    ...(sources.length ? {citation:sources.map(source=>source.url)} : {}),
    mainEntityOfPage:{'@type':'WebPage','@id':url},
  };
  return <main id="main-content" className="w">
    <article id="art">
      <Link className="back" href={`/${lang}/blog`}>{RTL.includes(lang) ? '→ ' : '← '}{m.blogLabel}</Link>
      <div className="bi"><img src={post.image} alt={post.imageAlt || post.title} width="400" height="225" style={{display:'block',width:'100%',height:'auto',aspectRatio:'400 / 225',objectFit:'cover'}} /></div>
      <div className="bm">{post.author && post.author!==BRAND.name ? post.author : <Link href={`/${lang}/about#content`} rel="author" style={{color:'inherit',textDecoration:'none'}}>{BRAND.name}</Link>} &nbsp;·&nbsp; <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt,lang)}</time></div>
      <h1>{post.title}</h1>
      <p className="lead">{post.description}</p>
      <BlogContent content={getArticleBody(post)} />
      {sources.length ? <section className="article-sources" style={{marginTop:24}} aria-labelledby="article-sources-title"><h2 id="article-sources-title">{editorial.sourcesTitle}</h2><ul>{sources.map(source=><li key={source.url}><a className="internal-link" href={source.url} target="_blank" rel="noopener noreferrer">{source.name}</a></li>)}</ul></section> : null}
      <div className="blog-whatsapp-box" style={{marginTop:'32px',padding:'12px',border:'1.5px solid color-mix(in srgb,var(--navy) 72%,#fff)',borderRadius:'12px',background:'#f7f4ee',boxShadow:'0 8px 24px rgba(8,31,48,.06)',minWidth:0}}>
        <h2 style={{margin:'0 0 10px',fontSize:'17px',lineHeight:1.25,overflowWrap:'anywhere'}}>{u.preFaqWhatsapp?.title || u.faqPrompt}</h2>
        {waHref ? <a className="btn service-whatsapp whatsapp-site-cta" style={{width:'100%',minWidth:0,justifyContent:'center'}} href={waHref} target="_blank" rel="noopener noreferrer">{m.wa}</a> : <span className="btn service-whatsapp whatsapp-site-cta whatsapp-disabled" style={{width:'100%',minWidth:0,justifyContent:'center'}} aria-disabled="true">{m.wa}</span>}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeBlogJsonLd([identitySchema(lang),ld])}} />
    </article>
  </main>;
}
