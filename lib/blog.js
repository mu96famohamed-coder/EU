import {BRAND} from './brand';
import data from '../content/blog.json';
import langs from './langs.json';
import { createBlogStore } from './blog-core.mjs';

const store = createBlogStore(data, langs.map(language => language.code),{authorName:BRAND.name});
export const { getArticle, getArticles, getArticleLanguages, getBlogLanguages, getBlogSlugs, getBlogRoutes, getArticleAlternates, getBlogAlternates } = store;
export { formatBlogDate, safeBlogJsonLd } from './blog-core.mjs';
