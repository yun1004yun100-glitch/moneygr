import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const context = {
  exports: {},
  require(name) {
    if (name === 'react') return { useId: () => 'funding-test' };
    if (name.endsWith('.css')) return {};
    if (name === './bet-funding') return { BET_FUNDING: { money: {label:'보유머니',unit:'원'}, support: {label:'지원금',unit:'P'} } };
    return require(name);
  },
};
vm.createContext(context);
vm.runInContext(ts.transpileModule(readFileSync(new URL('../app/BetFundingSelector.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
}).outputText, context);
function radios(node, found=[]) {
  if (!node || typeof node !== 'object') return found;
  if (node.type === 'input') found.push(node);
  for (const child of [node.props?.children].flat(Infinity)) radios(child, found);
  return found;
}
for (const support of [0, -1, NaN, Infinity, 1, 18500]) {
  const events = [];
  const tree = context.exports.BetFundingSelector({ value:'support', money:100000, support, onChange:v=>events.push(v) });
  const [money, bonus] = radios(tree);
  const enabled = Number.isFinite(support) && support > 0;
  assert.equal(bonus.props.disabled, !enabled);
  bonus.props.onChange();
  assert.equal(events.length, enabled ? 1 : 0);
  assert.equal(money.props.disabled, false);
}
console.log('PASS: support selectable only with positive finite balance; zero/invalid balances disabled and guarded.');
