import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const funding = readFileSync(new URL('../app/bet-funding.ts', import.meta.url), 'utf8').replace(/export /g, '');
const section = (start, end) => page.slice(page.indexOf(start), page.indexOf(end, page.indexOf(start)));
const code = funding
  + section('  const updateCredit=', '  const claimMemberRewards=')
  + section('  const placeBet =', '  const toggleFav=')
  + section('  const settleMemberBet=', '  const refillGold=')
  + '\nglobalThis.runMini=settleMemberBet; globalThis.runSports=placeBet;';

function setup({ money=100000, support=18500, source='support', amount=10000, random=0 }={}) {
  const storage = new Map();
  const ctx = {
    creditRef: { current: money }, supportFundRef: { current: support },
    sportsSubmitting: { current: false }, sportsFunding: source,
    bets: [{}], stake: amount, limit: 5000000, view: 'sports',
    setCredit(value) { ctx.money = value; }, setSupportFund(value) { ctx.support = value; },
    setBets(value) { ctx.bets = value; }, setSlipOpen() {},
    setToast(value) { ctx.toast = value; }, updateMemberPlayer() {}, recordResult() {},
    window: { localStorage: { setItem(key, value) { storage.set(key, value); } }, setTimeout() {} },
    Math: Object.assign(Object.create(Math), { random: () => random }),
    money, support, storage,
  };
  vm.createContext(ctx);
  vm.runInContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText, ctx);
  return ctx;
}

let ctx = setup();
await ctx.runMini(10000, '홀', 'oddeven', 'support');
assert.equal(ctx.support, 28500); assert.equal(ctx.money, 100000);
assert.equal(ctx.storage.get('moneyground_support_fund'), '28500');
ctx = setup();
await ctx.runMini(10000, '짝', 'oddeven', 'support');
assert.equal(ctx.support, 8500); assert.equal(ctx.money, 100000);
ctx = setup();
await ctx.runMini(10000, '홀', 'oddeven', 'money');
assert.equal(ctx.money, 110000); assert.equal(ctx.support, 18500);
ctx = setup();
await ctx.runMini(10000, '타이', 'baccarat', 'support');
assert.equal(ctx.support, 88500); assert.equal(ctx.money, 100000);
for (const value of [0, -1, NaN, Infinity, 1.5, 20000]) {
  ctx = setup();
  await assert.rejects(ctx.runMini(value, '홀', 'oddeven', 'support'));
  assert.equal(ctx.support, 18500); assert.equal(ctx.money, 100000);
}
ctx = setup({ amount:18500 }); ctx.runSports();
assert.equal(ctx.support, 0); assert.equal(ctx.money, 100000);
assert.equal(ctx.storage.get('moneyground_support_fund'), '0');
ctx.runSports(); assert.equal(ctx.support, 0);
ctx = setup({ source:'money' }); ctx.runSports();
assert.equal(ctx.money, 90000); assert.equal(ctx.support, 18500);
ctx = setup({ amount:20000 }); ctx.runSports();
assert.equal(ctx.support, 18500); assert.equal(ctx.money, 100000);
ctx = setup(); ctx.supportFundRef.current = 0;
await assert.rejects(ctx.runMini(10000, '홀', 'oddeven', 'support'));
assert.equal(ctx.money, 100000);
assert.equal((page.match(/onFundingChange={setSportsFunding}/g) || []).length, 2);
assert.ok(page.includes('Math.min(available, a + chip)'));
assert.ok(page.includes('setAmount(available)'));
assert.ok(page.includes('supportFund={supportFund} onBet={settleMemberBet}'));
console.log('PASS: source isolation, wins/losses, zero persistence, validation, duplicate sports submit, latest balances and both slips.');
