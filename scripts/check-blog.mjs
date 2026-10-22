import {readFile} from 'node:fs/promises';
import {createBlogStore} from '../lib/blog-core.mjs';
const data = JSON.parse(await readFile(new URL('../content/blog.json',import.meta.url),'utf8'));
const langs = JSON.parse(await readFile(new URL('../lib/langs.json',import.meta.url),'utf8')).map(language=>language.code);
const store = createBlogStore(data,langs);
console.log(`Blog valid: ${store.getBlogSlugs().length} published articles, ${store.getBlogRoutes().length} translated pages.`);
