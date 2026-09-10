import assert from 'node:assert/strict';
import fs from 'node:fs';
import sharp from 'sharp';
import postcss from 'postcss';
import { createHash } from 'node:crypto';

const path = 'public/landing-reward-claim-cutout-v2.png';
const metadata = await sharp(path).metadata();
assert.equal(metadata.format, 'png');
assert.ok(metadata.hasAlpha, 'The reward button must have actual transparency');
assert.ok(metadata.width / metadata.height > 2.7 && metadata.width / metadata.height < 3.5,
  'Keep the wide reference composition, including the glow');
const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let clear = 0;
let translucent = 0;
let solid = 0;
for (let offset = 3; offset < data.length; offset += 4) {
  if (data[offset] === 0) clear++;
  else if (data[offset] < 255) translucent++;
  else solid++;
}
const total = info.width * info.height;
assert.ok(clear / total > .1, 'Remove the exterior background');
assert.ok(translucent / total > .02, 'Retain soft, partially transparent bloom instead of a hard cutout');
assert.ok(solid / total > .2, 'Preserve the solid gold button face and lettering');

for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const distance = Math.min(x, y, info.width - 1 - x, info.height - 1 - y);
    if (distance <= 2) assert.equal(data[(y * info.width + x) * 4 + 3], 0,
      `Residual rectangular edge at ${x},${y}`);
  }
}
// The central button face and lettering must not be faded along with the glow.
// Preserve the original face regression check without shipping an unused v1 PNG.
const faceHash = createHash('sha256');
for (let y = 35; y <= 90; y++) {
  faceHash.update(data.subarray((y * info.width + 50) * 4, (y * info.width + 291) * 4));
}
assert.equal(faceHash.digest('hex'), '550923363964f71aac821106927576b8cc7a42b975d5d09cdd16080cb22d730a', 'Button lettering/face changed');

const component = fs.readFileSync('app/MemberLandingAchievements.tsx', 'utf8');
assert.ok(component.includes('src="/landing-reward-claim-cutout-v2.png"'));
assert.ok(component.includes('aria-label="보상 받기"'));
assert.ok(!component.includes('<span>보상 받기</span>'), 'Do not add duplicate text on top of the original lettering');

const css = postcss.parse(fs.readFileSync('app/member-landing-achievements.css', 'utf8'));
const buttonRule = css.nodes.find(node => node.selector === 'main.landing-view .landing-reference .landing-reward-claim');
const translation = buttonRule.nodes.find(node => node.prop === 'translate');
assert.equal(translation?.value, '3.27% 0', 'Center the visible gold face, not its asymmetric transparent margins');
const correctedCenter = 171 + info.width * parseFloat(translation.value) / 100;
assert.ok(Math.abs(correctedCenter - (info.width - 1) / 2) < .1, 'Gold face must align with the container center');
const imageRule = css.nodes.find(node => node.selector === 'main.landing-view .landing-reference .landing-reward-claim img');
assert.ok(imageRule, 'The artwork needs its own scoped image rule');
assert.ok(imageRule.nodes.some(node => node.prop === 'object-fit' && node.value === 'contain'), 'Never crop the rays or distort the original artwork');
assert.ok(imageRule.nodes.some(node => node.prop === 'pointer-events' && node.value === 'none'), 'The semantic button owns click handling');
console.log('PASS: fully transparent canvas edges, feathered glow, pixel-identical button face, accessible label and uncropped rendering.');
