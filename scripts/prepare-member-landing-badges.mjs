// User-approved local processing of the eight generated badge assets; no regeneration.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const [manifestFile, destination] = process.argv.slice(2);
if (!manifestFile || !destination) throw new Error('Usage: node scripts/prepare-member-landing-badges.mjs manifest.json output-directory');
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const outputDirectory = path.resolve(destination);
fs.mkdirSync(outputDirectory, { recursive: true });
const results = [];

for (const asset of manifest.assets) {
  const input = asset.workspaceDraftPath ?? asset.generatedPath;
  const { data, info } = await sharp(input).removeAlpha().toColourspace('srgb').raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const count = width * height;
  const neutral = new Uint8Array(count);
  const background = new Uint8Array(count);
  const queue = new Int32Array(count);
  let head = 0, tail = 0;
  for (let p = 0; p < count; p++) {
    const offset = p * channels;
    const r = data[offset], g = data[offset + 1], b = data[offset + 2];
    const high = Math.max(r, g, b), low = Math.min(r, g, b);
    // Both checkerboard tones are near neutral gray. Jewel enamel and gold remain opaque.
    neutral[p] = high - low < Math.max(22, high * .145) && (r + g + b) / 3 > 65 ? 1 : 0;
  }
  const visit = p => {
    if (neutral[p] && !background[p]) {
      background[p] = 1;
      queue[tail++] = p;
    }
  };
  for (let x = 0; x < width; x++) { visit(x); visit((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { visit(y * width); visit(y * width + width - 1); }
  while (head < tail) {
    const p = queue[head++], x = p % width;
    if (x > 0) visit(p - 1);
    if (x < width - 1) visit(p + 1);
    if (p >= width) visit(p - width);
    if (p < count - width) visit(p + width);
  }

  // Remove disconnected specks left in the exterior, not sizeable separate stars/ornaments.
  const seen = new Uint8Array(count);
  for (let start = 0; start < count; start++) {
    if (background[start] || seen[start]) continue;
    head = 0; tail = 1; queue[0] = start; seen[start] = 1;
    while (head < tail) {
      const p = queue[head++], x = p % width;
      const add = next => {
        if (!background[next] && !seen[next]) { seen[next] = 1; queue[tail++] = next; }
      };
      if (x > 0) add(p - 1);
      if (x < width - 1) add(p + 1);
      if (p >= width) add(p - width);
      if (p < count - width) add(p + width);
    }
    if (tail < 80) for (let n = 0; n < tail; n++) background[queue[n]] = 1;
  }

  const rgba = Buffer.alloc(count * 4);
  let transparentPixels = 0;
  for (let p = 0; p < count; p++) {
    const src = p * channels, dst = p * 4;
    rgba[dst] = data[src]; rgba[dst + 1] = data[src + 1]; rgba[dst + 2] = data[src + 2];
    rgba[dst + 3] = background[p] ? 0 : 255;
    if (background[p]) transparentPixels++;
  }
  const output = path.join(outputDirectory, `${asset.id}-v1.png`);
  await sharp(rgba, { raw: { width, height, channels: 4 } }).resize(512, 512).png({ compressionLevel: 9 }).toFile(output);
  const metadata = await sharp(output).metadata();
  if (!metadata.hasAlpha) throw new Error(`Missing alpha: ${asset.id}`);
  const result = { id: asset.id, output, width: metadata.width, height: metadata.height, hasAlpha: metadata.hasAlpha, transparentPercent: Math.round(transparentPixels / count * 1000) / 10 };
  results.push(result);
  console.log(JSON.stringify(result));
}

const tiles = await Promise.all(results.map(async (result, index) => ({
  input: await sharp(result.output).resize(224, 224).png().toBuffer(),
  left: (index % 4) * 240 + 8,
  top: Math.floor(index / 4) * 240 + 8,
})));
await sharp({ create: { width: 960, height: 480, channels: 4, background: '#10382f' } }).composite(tiles).png().toFile(path.join(outputDirectory, 'badge-review.png'));
fs.writeFileSync(path.join(outputDirectory, 'processing-results.json'), JSON.stringify(results, null, 2));
