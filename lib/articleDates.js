import tracking from '../public/sitemap-state.json';

// Use the same known modification date for the sitemap and article metadata.
// Publication dates always stay exactly as written in content/blog.json.
export function articleModifiedAt(post, lang) {
  return tracking.pages?.[`/${lang}/blog/${post.slug}`]?.lastModified || post.updatedAt || post.publishedAt;
}
