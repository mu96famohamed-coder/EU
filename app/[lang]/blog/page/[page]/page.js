import { notFound } from 'next/navigation';
import BlogListing, { blogListingMetadata } from '../../../../../components/BlogListing';
import { getAdditionalBlogPages, getBlogPageInfo } from '../../../../../lib/blog-pagination';

export const dynamicParams=false;
export const generateStaticParams=()=>getAdditionalBlogPages();
function validate(lang,page) {
  if (String(page)==='1' || !getBlogPageInfo(lang,page)) notFound();
}
export async function generateMetadata({params}) {
  const {lang,page}=await params;validate(lang,page);
  return blogListingMetadata(lang,page);
}
export default async function BlogPage({params}) {
  const {lang,page}=await params;validate(lang,page);
  return <BlogListing lang={lang} page={page}/>;
}
