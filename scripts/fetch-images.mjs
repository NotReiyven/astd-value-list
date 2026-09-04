import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../public/units');
const imagesFile = path.join(__dirname, './images.ts');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function run() {
  if (!fs.existsSync(imagesFile)) {
    console.error(`[ERROR] images.ts not found at ${imagesFile}. Please ensure it is placed in the scripts/ folder.`);
    return;
  }

  const content = fs.readFileSync(imagesFile, 'utf-8');
  const regex = /"([^"]+)"\s*:\s*"([^"]+)"/g;
  let match;

  console.log('Fetching and compressing images to public/units...');

  while ((match = regex.exec(content)) !== null) {
    const id = match[1];
    const url = match[2];

    if (url === 'PLACEHOLDER_URL' || !url.startsWith('http')) continue;

    const outPath = path.join(publicDir, `${id}.webp`);
    if (fs.existsSync(outPath)) continue; // Skip already downloaded images

    try {
      // Strip scaling parameters to retrieve the uncompressed source image
      const cleanUrl = url
        .replace('/revision/latest/scale-to-width-down/250', '/revision/latest')
        .replace('/revision/latest/scale-to-width-down/1000', '/revision/latest');

      const res = await fetch(cleanUrl);
      if (!res.ok) throw new Error(`Status ${res.status}`);

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await sharp(buffer)
        .resize(150, 150, { fit: 'cover', position: 'top' })
        .webp({ quality: 80 })
        .toFile(outPath);

      console.log(`[OK] Created ${id}.webp`);
    } catch (err) {
      console.error(`[ERROR] Failed to process ${id}:`, err.message);
    }
  }

  console.log('Done! Image processing finished.');
}

run();