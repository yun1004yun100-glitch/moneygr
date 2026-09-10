import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import postcss from 'postcss';

const source = fs.readFileSync('app/page.tsx', 'utf8');
const ast = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function find(root, predicate) {
  if (predicate(root)) return root;
  return ts.forEachChild(root, child => find(child, predicate));
}
function handler(name, context, root = ast) {
  const node = find(root, node => ts.isVariableDeclaration(node) && node.name.getText(ast) === name);
  assert.ok(node?.initializer, name);
  const compiled = ts.transpileModule(`exports.call = ${node.initializer.getText(ast)};`, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, Error, ...context });
  return exports.call;
}

// Repeating the same accepted bet must restart its notification and expiry.
let feedbackId = 0;
const messages = [];
const notify = memberFeedback => handler('notifyBetting', {
  memberFeedback,
  setMemberFeedbackId: update => { feedbackId = update(feedbackId); },
  setToast: message => messages.push(message),
});
notify(true)('배팅이 완료되었습니다.');
notify(true)('배팅이 완료되었습니다.');
assert.equal(feedbackId, 2);
assert.equal(messages.length, 2);
notify(false)('기존 골드 알림');
assert.equal(feedbackId, 2, 'Gold keeps its original notification lifecycle');
assert.ok(source.includes("memberFeedback?5000:2600"));
assert.ok(source.includes('[toast,memberFeedback,memberFeedbackId]'));
assert.ok(source.includes('key={memberFeedbackId} className="toast member-feedback-toast" role="status" aria-live="polite" aria-atomic="true"'));
assert.ok(source.includes('aria-label="알림 닫기" onClick={()=>setToast(\'\')}'));
assert.ok(source.includes('<MemberFlash gameId={selectedMiniGame} onBack={()=>setSelectedMiniGame(null)} onToast={notifyBetting}'));
assert.ok(source.includes("import './member-feedback.css'"));

// The previous generic glass/card rule must not put feedback back in document flow.
const css = postcss.parse(fs.readFileSync('app/member-feedback.css', 'utf8'));
let base;
css.walkRules(rule => {
  assert.ok(rule.selectors.every(selector => selector.includes('.member-feedback-')), `Unscoped selector: ${rule.selector}`);
  if (rule.selector === '.toast.member-feedback-toast' && rule.parent.type === 'root') base = rule;
});
const declaration = name => base.nodes.find(node => node.prop === name);
assert.equal(declaration('position').value, 'fixed');
assert.ok(declaration('position').important, 'Override the later generic position:relative rule');
assert.equal(declaration('inset').value, '50% auto auto 50%');
assert.equal(declaration('transform').value, 'translate(-50%, -50%)');
assert.ok(Number(declaration('z-index').value) > 99999);
assert.ok(declaration('z-index').important);
assert.equal(declaration('min-width').value, '0');
assert.ok(declaration('width').value.includes('100vw - 32px'));
assert.equal(declaration('overflow-y').value, 'auto');

// Exercise the actual mini-game click handler, including the delayed settlement.
const mini = find(ast, node => ts.isFunctionDeclaration(node) && node.name?.text === 'MemberFlash');
assert.ok(mini);
function miniContext(overrides = {}) {
  const feedback = [];
  const timers = [];
  let settled = 0;
  const context = {
    rollingRef: { current: false }, pick: '짝', amount: 10000, available: 100000,
    isBaccarat: false, gameKind: 'oddeven', funding: 'money', unit: '원',
    betFundingError: (amount, available) => amount > available ? '보유머니가 부족합니다.' : null,
    onToast: message => feedback.push(message),
    setRolling() {}, setResult() {}, setHistory() {},
    onBet: async () => { settled++; return { resultNumber: 2, resultPick: '짝', won: true, leveledUp: false }; },
    window: { setTimeout: (callback, delay) => timers.push({ callback, delay }) },
    ...overrides,
  };
  return { context, feedback, timers, settled: () => settled };
}
for (const funding of ['money', 'support']) {
  const test = miniContext({ funding, unit: funding === 'support' ? 'P' : '원' });
  const play = handler('play', test.context, mini);
  play();
  assert.deepEqual(test.feedback, ['배팅을 처리하고 있습니다…']);
  assert.equal(test.settled(), 0, 'Never report success before settlement');
  play();
  assert.equal(test.timers.length, 1, 'Repeated clicks while processing cannot submit again');
  assert.equal(test.timers[0].delay, 720);
  await test.timers[0].callback();
  assert.equal(test.settled(), 1);
  assert.ok(test.feedback.at(-1).startsWith('배팅이 완료되었습니다.\n'));
  assert.ok(test.feedback.at(-1).includes(`20,000${test.context.unit}`));
  assert.equal(test.context.rollingRef.current, false);
}
for (const overrides of [{ pick: null }, { amount: 0 }, { available: 1 }]) {
  const test = miniContext(overrides);
  handler('play', test.context, mini)();
  assert.equal(test.timers.length, 0);
  assert.equal(test.feedback.length, 1);
  assert.ok(!test.feedback[0].includes('완료되었습니다'));
}
const lost = miniContext({ onBet: async () => ({ resultNumber: 1, resultPick: '홀', won: false, leveledUp: false }) });
handler('play', lost.context, mini)();
await lost.timers[0].callback();
assert.ok(lost.feedback.at(-1).startsWith('배팅이 완료되었습니다.\n홀 결과 · 낙첨'));
const failed = miniContext({ onBet: async () => { throw new Error('접수에 실패했습니다.'); } });
handler('play', failed.context, mini)();
await failed.timers[0].callback();
assert.equal(failed.feedback.at(-1), '접수에 실패했습니다.');
assert.ok(failed.feedback.every(message => !message.includes('완료되었습니다')));
assert.equal(failed.context.rollingRef.current, false);
console.log('PASS: centered fixed member feedback, expiry/repeat behavior, mini bet processing/success/loss/errors, funding units and duplicate-click guard.');
