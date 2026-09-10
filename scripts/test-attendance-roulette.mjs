import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import assert from 'node:assert/strict';

// Exercise the real component handlers without a browser or altering user data.
const source = fs.readFileSync(new URL('../app/AttendanceRoulette.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
let hooks = [], cursor = 0, effects = [], now = '2026-09-10T14:59:00Z', finish;
const storage = new Map();
const react = {
  useState(initial) { const i = cursor++; if (!(i in hooks)) hooks[i] = initial; return [hooks[i], value => { hooks[i] = typeof value === 'function' ? value(hooks[i]) : value; }]; },
  useRef(initial) { const i = cursor++; return hooks[i] ??= { current: initial }; },
  useEffect(callback) { const i = cursor++; if (!(i in hooks)) { hooks[i] = true; effects.push(callback); } },
};
const jsx = (type, props) => ({ type, props });
const context = { exports: {}, require: name => name === 'react' ? react : name === 'react/jsx-runtime' ? { jsx, jsxs: jsx } : {},
  localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  window: { addEventListener() {}, removeEventListener() {} }, navigator: { locks: { request: async (_, fn) => fn() } },
  crypto: { getRandomValues: data => { data[0] = 99; return data; } },
  Date: class extends Date { constructor(...args) { super(...(args.length ? args : [now])); } }, Intl,
  setTimeout: fn => { finish = fn; return 1; }, clearTimeout() {},
};
vm.runInNewContext(compiled, context);
const counts = [0, 0, 0, 0, 0, 0];
for (let ticket = 0; ticket < 100; ticket++) counts[vm.runInNewContext(`prizeIndexForTicket(${ticket})`, context)]++;
assert.deepEqual(counts, [5, 50, 30, 10, 3, 2]);
function render() { cursor = 0; const tree = context.exports.AttendanceRoulette({ nickname: 'test' }); for (const effect of effects.splice(0)) effect(); return tree; }
function nodes(node) { if (!node || typeof node !== 'object') return []; if (Array.isArray(node)) return node.flatMap(nodes); return [node, ...nodes(node.props?.children)]; }
function find(predicate) { return nodes(render()).find(predicate); }
const check = n => find(x => x.type === 'button' && x.props['aria-label']?.startsWith(`${n}일차 `));
const spin = () => find(x => x.props?.className === 'ar-spin');
const record = () => JSON.parse([...storage.values()][0]);
render();
assert.equal(spin().props.disabled, true);
await check(2).props.onClick(); assert.equal(storage.size, 0);
await check(1).props.onClick(); assert.equal(record().days, 1);
await check(2).props.onClick(); assert.equal(record().days, 1);
assert.ok(hooks.some(x => typeof x === 'string' && x.includes('00시')));
now = '2026-09-10T15:00:00Z';
await check(2).props.onClick(); assert.equal(record().days, 2);
for (let day = 3; day <= 10; day++) { now = `2026-09-${String(day + 9).padStart(2, '0')}T15:00:00Z`; await check(day).props.onClick(); }
assert.equal(record().days, 10); assert.equal(spin().props.disabled, false);
await spin().props.onClick(); assert.equal(record().prize, 5000); assert.equal(spin().props.disabled, true);
finish();
await check(1).props.onClick(); assert.equal(record().days, 10);
now = '2026-09-20T15:00:00Z'; await check(1).props.onClick(); assert.equal(record().days, 1); assert.equal(record().prize, null);
hooks = []; render(); render(); assert.equal(spin().props.disabled, true);
assert.equal(record().days, 1);
console.log('PASS: day order, duplicate check, Korea midnight boundary, 10-day unlock, saved prize, next cycle, reopen');
