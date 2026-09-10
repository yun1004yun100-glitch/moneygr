import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import ts from 'typescript';
import postcss from 'postcss';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const modules = {};
const load = (name, extension = 'ts') => {
  if (modules[name]) return modules[name];
  const exports = {};
  modules[name] = exports;
  const code = ts.transpileModule(fs.readFileSync(`app/${name}.${extension}`, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, {
    exports,
    require: id => id.endsWith('.css') ? {} : id.startsWith('./') ? load(id.slice(2)) : require(id),
  });
  return exports;
};

const { MEMBER_LANDING_BADGES: badges } = load('member-landing-badges');
assert.equal(badges.length, 8);
assert.equal(new Set(badges.map(badge => badge.image)).size, 8);
assert.equal(new Set(badges.map(badge => badge.id)).size, 8);
assert.equal(Array.from(badges, badge => badge.label).join('|'), '슬롯스핀 10회|첫 입금 성공|첫 배팅 적중|스포츠 3폴더 적중|첫 3연승|5배 롤링 성공|지인 추천 1명|스포츠 10배당 적중');
for (const badge of badges) {
  const png = fs.readFileSync(`public${badge.image}`);
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  const ratio = png.readUInt32BE(16) / png.readUInt32BE(20);
  assert.ok(ratio > .95 && ratio < 1.05, `Badge must be square: ${badge.id}`);
  const metadata = await sharp(png).metadata();
  assert.ok(metadata.hasAlpha, `Badge requires real transparency: ${badge.id}`);
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparent = 0;
  for (let p = 3; p < data.length; p += 4) if (data[p] === 0) transparent++;
  assert.ok(transparent > info.width * info.height * .2, `Background not removed: ${badge.id}`);
  assert.ok(transparent < info.width * info.height * .7, `Too much foreground removed: ${badge.id}`);
  for (const pixel of [0, info.width - 1, (info.height - 1) * info.width, info.width * info.height - 1]) {
    assert.equal(data[pixel * 4 + 3], 0, `Opaque corner: ${badge.id}`);
  }
}

const { MemberLandingAchievements } = load('MemberLandingAchievements', 'tsx');
let claims = 0;
const onClaim = () => { claims++; };
const html = renderToStaticMarkup(createElement(MemberLandingAchievements, { onClaim }));
assert.equal((html.match(/<img /g) || []).length, 9, 'Eight badges and the original reward-button artwork');
assert.equal((html.match(/<li>/g) || []).length, 8);
for (const badge of badges) assert.ok(html.includes(`<span>${badge.label}</span>`));
assert.ok(!html.includes('landing-achievement-rewards.png'));
assert.ok(fs.readFileSync('app/page.tsx', 'utf8').includes('<MemberLandingAchievements onClaim={onLogin}/>'));
assert.ok(html.includes('class="landing-rewards-content"'));
assert.ok(html.includes('class="landing-reward-claim"'));
assert.ok(html.includes('aria-label="보상 받기"'));
assert.ok(html.includes('src="/landing-reward-claim-cutout-v2.png"'));
const root = MemberLandingAchievements({ onClaim });
const claimButton = root.props.children[1];
assert.equal(claimButton.type, 'button');
assert.equal(claimButton.props.type, 'button');
assert.equal(claimButton.props['aria-label'], '보상 받기');
claimButton.props.onClick();
assert.equal(claims, 1, 'The real reward button must retain the login/claim callback');

const css = postcss.parse(fs.readFileSync('app/member-landing-achievements.css', 'utf8'));
css.walkRules(rule => rule.selectors.forEach(selector => assert.ok(selector.startsWith('main.landing-view'))));
assert.ok(css.toString().includes('grid-template-columns: repeat(4, minmax(0, 1fr))'));
assert.ok(css.toString().includes('grid-template-rows: repeat(2, minmax(0, 1fr))'));
assert.ok(css.toString().includes('inset: var(--landing-rewards-top) 0 0'));
assert.ok(css.toString().includes('grid-template-rows: minmax(0, 1fr) auto'));
assert.ok(css.toString().includes(':focus-visible'));
console.log('PASS: 8 transparent badges, real captions, 4×2 grid, shared lower background and accessible image-button callback.');
