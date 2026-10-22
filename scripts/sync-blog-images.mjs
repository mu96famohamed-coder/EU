import { readdir, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'content/images');
const destination = path.join(root, 'public/images/blog');
const extensions = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.ico']);

async function sync(directory, target) {
  const entries = await readdir(directory, { withFileTypes: true });
  await mkdir(target, { recursive: true });
  let count = 0;
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const from = path.join(directory, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) count += await sync(from, to);
    else if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) {
      await copyFile(from, to);
      count += 1;
    }
  }
  return count;
}

try {
  const count = await sync(source, destination);
  console.log(`Blog images: ${count} files copied from content/images to public/images/blog.`);
} catch (error) {
  console.error('Unable to prepare blog images. Check content/images:', error.message);
  process.exitCode = 1;
}
