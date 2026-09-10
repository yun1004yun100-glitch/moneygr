import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import postcss from 'postcss';

const require = createRequire(import.meta.url);
const cache = new Map();
const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText;
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  vm.runInNewContext(compile(fs.readFileSync(file, 'utf8')), {
    exports, crypto: globalThis.crypto,
    require: id => id.endsWith('.css') ? {} : id.startsWith('.') ? load(path.resolve(path.dirname(file), `${id}.ts`)) : require(id),
  });
  return exports;
}
const model = load('app/member-bet-history.ts');
const { MemberBetHistory, MemberBetHistoryCard } = load('app/MemberBetHistory.tsx');
const bets = [{ title: '서울 : 부산', pick: '홈', odd: 1.74 }, { title: '런던 : 머지', pick: '무', odd: 3.45 }];
const sports = model.createSportsBetRecord(bets, 10000, 'support');
assert.equal(sports.category, 'sports');
assert.equal(sports.status, 'pending');
assert.equal(sports.payout, null, 'Pending is not a paid-out win');
assert.equal(sports.selections.length, 2);
assert.equal(sports.odds, 1.74 * 3.45);
const mini = model.createMiniBetRecord({ gameId: 'baccarat-2', amount: 10000, funding: 'money', pick: '뱅커', result: '뱅커', won: true });
assert.equal(mini.game, '바카라2');
assert.equal(mini.status, 'won');
assert.equal(mini.payout, 19500);
const lost = model.createMiniBetRecord({ gameId: 'lotus-baccarat', amount: 10000, funding: 'support', pick: '타이', result: '플레이어', won: false });
assert.equal(lost.payout, 0);
assert.equal(lost.status, 'lost');
const records = [sports, mini, lost];
assert.equal(new Set(records.map(record => record.id)).size, 3);
assert.equal(model.filterMemberBets(records, 'all', 'all').length, 3);
assert.equal(model.filterMemberBets(records, 'mini', 'won')[0].id, mini.id);
assert.equal(model.filterMemberBets(records, 'sports', 'lost').length, 0);
assert.deepEqual(Object.keys(model.MEMBER_BET_CATEGORIES), ['sports', 'mini']);
const sportsHtml = renderToStaticMarkup(createElement(MemberBetHistoryCard, { record: sports }));
for (const label of ['스포츠 2폴더', '서울 : 부산', '런던 : 머지', '결과 대기', '지원금', '10,000 P', '예상 당첨금']) assert.ok(sportsHtml.includes(label), label);
const miniHtml = renderToStaticMarkup(createElement(MemberBetHistoryCard, { record: mini }));
for (const label of ['바카라2', '당첨', '보유머니', '19,500 원', '지급금액']) assert.ok(miniHtml.includes(label), label);
const renderPage = (loggedIn, records = []) => renderToStaticMarkup(createElement(MemberBetHistory, { records, loggedIn, onLogin() {}, onBack() {} }));
assert.ok(renderPage(true).includes('배팅내역이 없습니다'));
assert.ok(!renderPage(true).includes('카지노'));
assert.ok(!renderPage(true).includes('슬롯'));
assert.ok(renderPage(true).includes('새로고침 또는 로그아웃 시 초기화'));
assert.ok(renderPage(true, records).includes('조회 내역'));
const loggedOut = renderPage(false, records);
assert.ok(loggedOut.includes('로그인 후 확인'));
assert.ok(!loggedOut.includes(sports.id), 'Signed-out views must not expose records');

// Exercise actual page handlers without a browser or simulated backend.
const page = fs.readFileSync('app/page.tsx', 'utf8');
const ast = ts.createSourceFile('page.tsx', page, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const variables = new Map();
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.initializer) variables.set(node.name.getText(ast), node.initializer.getText(ast));
  ts.forEachChild(node, visit);
}
visit(ast);
function pageFunction(name, context) {
  const exports = {};
  vm.runInNewContext(compile(`exports.call = ${variables.get(name)};`), { exports, ...context });
  return exports.call;
}
const funding = load('app/bet-funding.ts');
function context(overrides = {}) {
  let history = [];
  const feedback = [];
  let money = 100000;
  let support = 100000;
  const base = {
    loggedIn: true, memberFeedback: true, view: 'sports', bets, stake: 10000, limit: 5000000, sportsFunding: 'support', selectedMiniGame: 'baccarat-2',
    sportsSubmitting: { current: false }, supportFundRef: { current: support }, creditRef: { current: money },
    ...funding, ...model,
    setToast() {}, setBets() {}, setSlipOpen() {}, updateMemberPlayer() {}, recordResult() {},
    notifyBetting: message => feedback.push(message),
    updateCredit: updater => { money = updater(money); }, updateSupportFund: updater => { support = updater(support); },
    setMemberBetHistory: updater => { history = updater(history); },
    window: { setTimeout: callback => callback() },
    ...overrides,
  };
  return { base, read: () => ({ history, money, support, feedback }) };
}
let c = context();
pageFunction('placeBet', c.base)();
assert.equal(c.read().history.length, 1);
assert.equal(c.read().history[0].funding, 'support');
assert.equal(c.read().support, 90000);
assert.ok(c.read().feedback[0].startsWith('배팅이 완료되었습니다.'));
assert.ok(c.read().feedback[0].includes('지원금 10,000 P · 2경기 접수'));
for (const overrides of [{ bets: [] }, { stake: 0 }, { supportFundRef: { current: 1 } }, { sportsSubmitting: { current: true } }]) {
  c = context(overrides); pageFunction('placeBet', c.base)();
  assert.equal(c.read().history.length, 0, 'Rejected bets never enter history');
  assert.equal(c.read().support, 100000);
  assert.ok(c.read().feedback.every(message => !message.includes('완료되었습니다')), 'Rejected bets must never show success');
  if (!overrides.sportsSubmitting) assert.equal(c.read().feedback.length, 1, 'Validation failures must show a reason');
}
c = context({ view: 'goldSports', memberFeedback: false }); pageFunction('placeBet', c.base)();
assert.equal(c.read().history.length, 0, 'Never mix Gold bets into paid-member history');
assert.ok(c.read().feedback[0].includes('베팅이 접수되었습니다 · MG'), 'Preserve the Gold confirmation text');
for (const [pick, kind, randoms, expectedPayout] of [['뱅커', 'baccarat', [.1, .8], 19500], ['타이', 'baccarat', [.4, .4], 80000], ['짝', 'oddeven', [.1], 20000], ['홀', 'oddeven', [.1], 0]]) {
  const values = [...randoms];
  c = context({ Math: { ...Math, floor: Math.floor, random: () => values.shift() }, selectedMiniGame: kind === 'oddeven' ? 'lotus-oddeven' : 'baccarat-2' });
  await pageFunction('settleMemberBet', c.base)(10000, pick, kind, 'money');
  assert.equal(c.read().history.length, 1);
  assert.equal(c.read().history[0].payout, expectedPayout);
  assert.equal(c.read().money, 90000 + expectedPayout, 'Recorded return equals wallet settlement');
}
c = context({ creditRef: { current: 0 } });
await assert.rejects(pageFunction('settleMemberBet', c.base)(10000, '짝', 'oddeven', 'money'));
assert.equal(c.read().history.length, 0);

// Profile menu callbacks and native dialog semantics, without browser UI automation.
let open = false;
let mobile = true;
const calls = [];
const profileExports = {};
vm.runInNewContext(compile(fs.readFileSync('app/MemberProfileMenu.tsx', 'utf8')), {
  exports: profileExports, window: { matchMedia: () => ({ matches: mobile }) },
  require: id => id.endsWith('.css') ? {} : id === 'react' ? { useEffect() {}, useRef: () => ({ current: null }), useState: () => [open, value => { open = value; }] } : require(id),
});
const profileProps = { nickname: '테스트', onHistory: () => calls.push('history'), onProfile: () => calls.push('profile') };
function elements(node, type) {
  if (Array.isArray(node)) return node.flatMap(item => elements(item, type));
  if (!node?.props) return [];
  return [...(node.type === type ? [node] : []), ...elements(node.props.children, type)];
}
let tree = profileExports.MemberProfileMenu(profileProps);
elements(tree, 'button')[0].props.onClick(); assert.equal(open, true);
tree = profileExports.MemberProfileMenu(profileProps);
assert.equal(elements(tree, 'dialog').length, 1);
let buttons = elements(tree, 'button');
buttons.find(button => elements(button, 'span').some(span => span.props.children === '배팅내역')).props.onClick();
assert.equal(open, false); assert.deepEqual(calls, ['history']);
open = true; tree = profileExports.MemberProfileMenu(profileProps);
elements(tree, 'button').find(button => elements(button, 'span').some(span => span.props.children === '개인정보 수정')).props.onClick();
assert.equal(open, false); assert.deepEqual(calls, ['history', 'profile']);
open = true; tree = profileExports.MemberProfileMenu(profileProps);
elements(tree, 'dialog')[0].props.onCancel(); assert.equal(open, false);
mobile = false; tree = profileExports.MemberProfileMenu(profileProps);
elements(tree, 'button')[0].props.onClick(); assert.equal(open, false); assert.equal(calls.at(-1), 'profile');

assert.equal(pageFunction('viewFromPath', {})('/betting-history'), 'bettingHistory');
assert.ok(page.includes("bettingHistory:'/betting-history'"));
assert.ok(page.includes('onBettingHistory={openMemberBetHistory}'));
assert.ok(page.includes('onHistory={openMemberBetHistory}'));
assert.ok(page.includes('setLoggedIn(false);setMemberBetHistory([]);'));
const original = execFileSync('git', ['show', 'HEAD:app/page.tsx'], { encoding: 'utf8' });
const goldSettlement = text => text.slice(text.indexOf('  const settleGoldBet='), text.indexOf('  const useGoldVoucher='));
assert.equal(goldSettlement(page), goldSettlement(original), 'Keep Gold game/reward logic unchanged');
for (const file of ['app/member-bet-history.css', 'app/member-profile-menu.css']) {
  postcss.parse(fs.readFileSync(file, 'utf8')).walkRules(rule => {
    for (const selector of rule.selectors) assert.ok(selector.startsWith('.member-'), `Unscoped style: ${selector}`);
  });
}
console.log('PASS: history route, mobile profile choices, PC profile behavior, login gate, filters, payouts, rejected bets, units and Gold isolation.');
