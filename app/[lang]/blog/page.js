import BlogListing, { blogListingMetadata } from '../../../components/BlogListing';

export async function generateMetadata({params}) {
  const {lang}=await params;
  return blogListingMetadata(lang);
}
export default async function Blog({params}) {
  const {lang}=await params;
  return <BlogListing lang={lang}/>;
}
