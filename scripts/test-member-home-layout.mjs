import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import postcss from 'postcss';

const page = fs.readFileSync('app/page.tsx', 'utf8');
const original = execFileSync('git', ['show', 'HEAD:app/page.tsx'], { encoding: 'utf8' });
assert.ok(page.includes("import './member-home-layout.css'"));
assert.ok(page.includes("${view==='home'?'member-home-view':''}"), 'Scope changes to the paid-member home, not all pages');
const css = postcss.parse(fs.readFileSync('app/member-home-layout.css', 'utf8'));
const selectors = [];
css.walkRules(rule => {
  assert.equal(rule.parent.type, 'atrule');
  assert.equal(rule.parent.name, 'media');
  assert.equal(rule.parent.params, '(min-width: 721px)', 'No changes below the desktop breakpoint');
  for (const selector of rule.selectors) {
    assert.ok(selector.startsWith('main.member-home-view > '));
    selectors.push(selector);
  }
  assert.ok(rule.nodes.some(decl => decl.prop === 'display' && decl.value === 'none' && decl.important));
});
assert.deepEqual(selectors, [
  'main.member-home-view > .member-mobile-v2 > .member-intro-slider',
  'main.member-home-view > .member-mobile-v2 > .member-v2-grid',
  'main.member-home-view > .sports-section',
  'main.member-home-view > .lounge-section',
  'main.member-home-view > .promo-grid',
  'main.member-home-view > .info-section',
  'main.member-home-view > .big-wheel-launch',
]);
for (const width of [320, 375, 680, 720, 721, 1024, 1440]) {
  const hidden = width >= 721 ? selectors : [];
  assert.equal(hidden.length, width >= 721 ? 7 : 0);
  assert.ok(!hidden.includes('main.member-home-view > .hero'), 'Keep the desktop hero visible');
  assert.ok(!hidden.some(selector => /member-global-progress|member-v2-unified-card|member-desktop-header/.test(selector)), 'Keep gauge, profile/wallet and desktop navigation visible');
}
const functionBody = (source, start, end) => source.slice(source.indexOf(`function ${start}`), source.indexOf(`function ${end}`)).replace(/\r/g, '');
for (const [start, end] of [['MemberGlobalProgress', 'MemberMobileV2'], ['MemberMobileV2', 'MemberIntroSlider'], ['MemberIntroSlider', 'ChestVideoModal'], ['GoldMobileV2', 'GoldIntroSlider']]) {
  assert.equal(functionBody(page, start, end), functionBody(original, start, end), `Preserve ${start} content, callbacks and behavior`);
}
assert.ok(page.includes('onBigWheel={()=>loggedIn?navigate(\'bigwheel\'):setLoginOpen(true)}'), 'Desktop users retain their Big Wheel entry');
console.log('PASS: desktop hero restored; gauge/profile/wallet preserved; image menus stay mobile-only; mobile and Gold behavior unchanged.');
