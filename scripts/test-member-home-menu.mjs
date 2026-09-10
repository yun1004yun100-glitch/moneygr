import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const start = source.indexOf('function MemberMobileV2(');
const component = source.slice(start, source.indexOf('function MemberIntroSlider', start));
const tiles = component.slice(0, component.indexOf('  return ('));
assert.equal((tiles.match(/kind:'/g) || []).length, 9);
const kinds = [...tiles.matchAll(/kind:'([^']+)'/g)].map(match => match[1]);
assert.equal(kinds[1], 'money');
assert.equal(kinds[7], 'attendance');
for (const [label, action] of [
  ['입출금 신청', 'onFinance'],
  ['출석부 룰렛', 'onAttendance'],
  ['미니게임&가상게임', 'onMini'],
  ['머니내역', 'onMoney'],
]) {
  assert.match(tiles, new RegExp(`label:'${label}'[^\\n]+action:${action}`));
}
for (const binding of [
  "onFinance={()=>setMenuScreen('deposit')}",
  "onAttendance={()=>setMenuScreen('attendance')}",
  "onMoney={()=>setMenuScreen('money')}",
  "onMini={()=>go('mini')}",
]) assert.ok(source.includes(binding), binding);
assert.ok(!tiles.includes('onVirtual'));
assert.ok(!tiles.includes('onWithdraw'));
const menus = fs.readFileSync(new URL('../app/MenuCenter.tsx', import.meta.url), 'utf8');
assert.ok(menus.includes("{key:'withdraw',label:'출금신청'"));
assert.ok(menus.includes("screen==='attendance'&&<Attendance"));
assert.ok(menus.includes("screen==='money'&&<Money"));
console.log('PASS: 9 member home tiles and existing component connections');
