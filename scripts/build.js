import { copyFile, readFile, writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
}

async function main() {
  // Ensure directories exist
  await ensureDir(resolve(root, 'dist'));
  await ensureDir(resolve(root, 'dist/icons'));
  await ensureDir(resolve(root, 'dist/assets'));

  // Copy manifest
  await copyFile(
    resolve(root, 'manifest.json'),
    resolve(root, 'dist/manifest.json')
  );

  // Copy icons
  for (const size of ['16', '48', '128']) {
    await copyFile(
      resolve(root, `public/icons/icon${size}.png`),
      resolve(root, `dist/icons/icon${size}.png`)
    );
  }

  // Fix popup.html paths
  const indexHtml = await readFile(resolve(root, 'dist/index.html'), 'utf-8');
  const popupHtml = indexHtml
    .replace(/src="\/assets\//g, 'src="./assets/')
    .replace(/href="\/assets\//g, 'href="./assets/')
    .replace(/href="\/icons\//g, 'href="./icons/');
  
  await writeFile(resolve(root, 'dist/popup.html'), popupHtml);

  // Create content script bundle
  const contentScript = await readFile(resolve(root, 'src/content.ts'), 'utf-8');
  await writeFile(resolve(root, 'dist/content.js'), contentScript);
}

main().catch(console.error);