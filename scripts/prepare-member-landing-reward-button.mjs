// Same user-approved local cutout workflow as the landing badges: preserve source pixels, no generation.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const [sourceFile, outputFile] = process.argv.slice(2);
if (!sourceFile || !outputFile) throw new Error('Usage: node scripts/prepare-member-landing-reward-button.mjs source.png output.png');
const { data, info } = await sharp(sourceFile).removeAlpha().raw().toBuffer({ resolveWithObject: true });
if (info.width !== 367 || info.height !== 116) throw new Error('This preservation mask is calibrated to the supplied 367×116 reference.');
const rgba = Buffer.alloc(info.width * info.height * 4);
const smoothstep = (start, end, value) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};

const glowEnvelope = (x, y) =>
  smoothstep(2, 27, Math.min(x, info.width - 1 - x)) *
  smoothstep(2, 22, y) *
  smoothstep(2, 15, info.height - 1 - y);

const insideFace = (x, y) => {
  // Preserve the dark Korean lettering as opaque, not mistaken for the black backdrop.
  const left = 35, right = 306, top = 32, bottom = 93, radius = 12;
  if (x < left || x > right || y < top || y > bottom) return false;
  const cx = Math.max(left + radius, Math.min(right - radius, x));
  const cy = Math.max(top + radius, Math.min(bottom - radius, y));
  return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2;
};

for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const pixel = y * info.width + x;
    const src = pixel * info.channels, dst = pixel * 4;
    const rgb = [data[src], data[src + 1], data[src + 2]];
    // This is a clipped caption from the badge above, not part of the button/glow.
    if (x >= 294 && x <= 321 && y <= 12) continue;
    if (insideFace(x, y)) {
      rgba.set([...rgb, 255], dst);
      continue;
    }
    // Unmatte the dark teal/black exterior. Encode rays as colored partial alpha,
    // so their original light contribution survives on the page's own backdrop.
    const light = [rgb[0], Math.max(0, rgb[1] - 5), Math.max(0, rgb[2] - 5)];
    const strength = Math.max(...light);
    if (strength === 0) continue;
    // Discard neutral residual matte/one-pixel screenshot rules, not the warm rays.
    // Bright white highlights remain; low-level gray/teal is not gold light.
    const warmLight = Math.max(
      smoothstep(0, 14, rgb[0] - rgb[2]),
      smoothstep(180, 245, Math.min(...rgb)),
    );
    // Smoothly reach zero before the canvas edge; a nonzero final row creates
    // a visible rectangle even when the rest of the PNG has real alpha.
    const coverage = glowEnvelope(x, y) * smoothstep(5, 18, strength) * warmLight;
    const outputAlpha = Math.round(strength * coverage);
    if (outputAlpha === 0) continue;
    const alpha = strength / 255;
    rgba[dst] = Math.round(light[0] / alpha);
    rgba[dst + 1] = Math.round(light[1] / alpha);
    rgba[dst + 2] = Math.round(light[2] / alpha);
    rgba[dst + 3] = outputAlpha;
  }
}

fs.mkdirSync(path.dirname(path.resolve(outputFile)), { recursive: true });
await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(outputFile);
console.log(`Saved original 367×116 reward button with transparent background and soft glow: ${outputFile}`);
