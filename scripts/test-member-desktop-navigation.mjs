import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import ts from 'typescript';
import postcss from 'postcss';

const require = createRequire(import.meta.url);
const page = fs.readFileSync('app/page.tsx', 'utf8');
const ast = ts.createSourceFile('page.tsx', page, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let services;
const visit = node => {
  if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'serviceMenus') {
    services = vm.runInNewContext(`(${node.initializer.getText(ast)})`);
  }
  ts.forEachChild(node, visit);
};
visit(ast);
assert.ok(services);

const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/MemberDesktopNavigation.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText, { exports, require: id => id.endsWith('.css') ? {} : require(id) });
const { MemberDesktopNavigation } = exports;
const calls = [];
const props = {
  view: 'mini', menuScreen: null, supportOpen: false, achievementCount: 11, services,
  onNavigate: target => calls.push(`view:${target}`), onMenu: target => calls.push(`menu:${target}`),
  onCommunity: () => calls.push('community'), onSupport: () => calls.push('support'),
  onSupportFund: () => calls.push('support-fund'),
  onBettingHistory: () => calls.push('betting-history'),
  onBigWheel: () => calls.push('big-wheel'),
};
const buttons = [];
const collect = node => {
  if (Array.isArray(node)) return node.forEach(collect);
  if (!node?.props) return;
  if (node.type === 'button') buttons.push(node);
  collect(node.props.children);
};
collect(MemberDesktopNavigation(props));
assert.equal(buttons.length, 20);
buttons.forEach(button => { assert.equal(button.props.type, 'button'); button.props.onClick(); });
assert.deepEqual(calls, [
  'view:home', 'view:casino', 'view:sports', 'view:mini', 'big-wheel', 'menu:events', 'menu:achievement', 'menu:coupon', 'community', 'support',
  'menu:deposit', 'menu:withdraw', 'menu:notice', 'menu:referral', 'menu:attendance', 'menu:messages', 'betting-history', 'menu:money', 'support-fund', 'menu:profile',
]);
const html = renderToStaticMarkup(createElement(MemberDesktopNavigation, props));
for (const label of ['빅휠', '쿠폰', '커뮤니티', '고객센터', '입금신청', '출금신청', '출석부', '지인추천', '배팅내역', '머니내역', '지원금 안내', '마이페이지']) {
  assert.ok(html.includes(label), `Missing member service: ${label}`);
}
assert.ok(html.includes('class="active">미니게임'));
assert.ok(renderToStaticMarkup(createElement(MemberDesktopNavigation, { ...props, achievementCount: 120 })).includes('99+'));
assert.ok(!renderToStaticMarkup(createElement(MemberDesktopNavigation, { ...props, achievementCount: 0 })).includes('0개 알림'));

const css = postcss.parse(fs.readFileSync('app/member-desktop-navigation.css', 'utf8'));
css.walkRules(rule => {
  for (const selector of rule.selectors) assert.ok(selector.includes('member-desktop-header'), `Unscoped desktop rule: ${selector}`);
  assert.equal(rule.parent.type, 'atrule', 'All desktop styles must be breakpoint-scoped');
});
assert.ok(css.toString().includes('flex-wrap: wrap'), 'Keep all links visible on narrower desktop windows');
assert.ok(css.toString().includes('@media (max-width: 720px)'), 'Preserve mobile bottom navigation');
for (const [className, display] of [['member-top-balances', 'flex'], ['member-top-balance', 'grid']]) {
  let visibleOnDesktop = false;
  css.walkRules(rule => {
    if (rule.selector === `main > .member-desktop-header .${className}` && rule.nodes.some(node => node.prop === 'display' && node.value === display)) {
      assert.equal(rule.parent.params, '(min-width: 721px)', 'Wallet visibility changes are desktop-only');
      visibleOnDesktop = true;
    }
  });
  assert.ok(visibleOnDesktop, `Restore desktop ${className} visibility`);
}
assert.ok(page.includes('<small>보유금</small><b>{credit.toLocaleString()} <em>원</em>'), 'Use the live money balance');
assert.ok(page.includes('<small>지원금</small><b>{supportFund.toLocaleString()} <em>P</em>'), 'Use the live support balance');
assert.ok(page.includes('className="member-top-balance member-top-point" onClick={()=>setSupportFundOpen(true)}'), 'Preserve support-fund information action');
const original = execFileSync('git', ['show', 'HEAD:app/page.tsx'], { encoding: 'utf8' });
const goldNav = source => source.match(/<nav aria-label="꽁게임 주요 메뉴">[\s\S]*?<\/nav>/)[0];
assert.equal(goldNav(page), goldNav(original), 'Do not change Gold primary navigation');
const bottomNav = source => source.slice(source.indexOf('aria-label="꽁게임 모바일 메뉴"'), source.indexOf('{loginOpen&&<LoginModal'));
assert.equal(bottomNav(page), bottomNav(original), 'Do not change either mobile bottom bar');
assert.ok(page.includes('<MemberDesktopNavigation'));
assert.ok(renderToStaticMarkup(createElement(MemberDesktopNavigation, { ...props, view: 'bettingHistory' })).includes('class="active">배팅내역'));
assert.ok(renderToStaticMarkup(createElement(MemberDesktopNavigation, { ...props, view: 'bigwheel' })).includes('class="active">빅휠'));
assert.ok(page.includes("onBigWheel={()=>loggedIn?navigate('bigwheel'):setLoginOpen(true)}"), 'Use the existing login-gated Big Wheel entry');
assert.ok(page.includes("{isHomeScreen&&!modalActive&&<BigWheelLaunch onOpen={()=>loggedIn?navigate('bigwheel'):setLoginOpen(true)}/>}"), 'Keep the existing mobile launcher');
console.log('PASS: all 20 desktop actions, Big Wheel entry/active state, mobile parity, inline counts, history/community/support callbacks and Gold/mobile isolation.');
