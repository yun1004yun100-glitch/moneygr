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
function load(relativePath) {
  const file = path.resolve(relativePath);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  }).outputText, {
    exports: module.exports, module,
    require: id => id.startsWith('.') ? load(path.resolve(path.dirname(file), `${id}.ts`)) : require(id),
  });
  return module.exports;
}
const { getJourneyLayout, getJourneyMarker } = load('app/achievement-journey.ts');
const { MemberAchievementJourney } = load('app/MemberAchievementJourney.tsx');
const { INITIAL_DETAILED_ACHIEVEMENTS: achievements } = load('app/achievements-data.ts');
const source = fs.readFileSync('app/MenuCenter.tsx', 'utf8');
const original = execFileSync('git', ['show', 'HEAD:app/MenuCenter.tsx'], { encoding: 'utf8' });
const json = value => JSON.parse(JSON.stringify(value));
const arrayNames = {
  level: 'levelValues', referral: 'referralValues', deposit: 'depositValues', withdraw: 'withdrawValues',
  casino: 'casinoValues', sports: 'sportsValues', slots: 'slotValues', mini: 'miniValues',
};
let titleCount = 0;
for (const [road, name] of Object.entries(arrayNames)) {
  const pattern = new RegExp(`const ${name} = (\\[[^;]+\\]);`);
  const literal = source.match(pattern)?.[1];
  assert.equal(literal, original.match(pattern)?.[1], `${road}: preserve every existing milestone`);
  const values = vm.runInNewContext(literal);
  const records = achievements.filter(item => item.category === road || (item.category === 'game' && item.gameType === road));
  const { points, height = 375 } = getJourneyLayout(road, values.length);
  assert.equal(points.length, values.length);
  assert.equal(points.at(-1)[0], 50, `${road}: final badge must be centered`);
  assert.ok(points.at(-1)[1] > 75, `${road}: final badge belongs at the bottom`);
  for (const [x, y] of points) {
    assert.ok(x >= 14 && x <= 86 && y > 0 && y < 100, `${road}: node outside its card`);
    assert.ok((y / 100) * height >= 90, `${road}: preserve header clearance`);
  }
  for (let i = 0; i < values.length; i++) {
    assert.deepEqual(json(getJourneyMarker(values, points, values[i])), json(points[i]), `${road}: exact milestone arrow`);
    if (i === 0) continue;
    const middle = (values[i - 1] + values[i]) / 2;
    const marker = getJourneyMarker(values, points, middle);
    assert.deepEqual(json(marker), json(points[i].map((value, axis) => (value + points[i - 1][axis]) / 2)));
  }
  assert.deepEqual(json(getJourneyMarker(values, points, -1)), json(points[0]));
  assert.deepEqual(json(getJourneyMarker(values, points, values.at(-1) * 2)), json(points.at(-1)));

  const props = { road, title: `${road} 여정`, values, current: values[0], label: value => `${value} 달성`, achievements: records };
  const html = renderToStaticMarkup(createElement(MemberAchievementJourney, props));
  assert.equal((html.match(/class="member-level-node /g) || []).length, values.length);
  assert.equal((html.match(/class="member-level-marker"/g) || []).length, 1);
  assert.equal((html.match(/class="member-final-badge"/g) || []).length, 1);
  assert.equal((html.match(/class="title-reward"/g) || []).length, records.length);
  for (const achievement of records) {
    assert.ok(html.includes(`class="title-reward">${achievement.rewardTitle} 칭호</small>`), `${road}: missing full title pill`);
    assert.ok(html.includes(`src="${achievement.badge}"`), `${road}: wrong badge`);
    assert.ok(html.includes(`data-achievement-id="${achievement.id}"`));
    titleCount++;
  }
  assert.ok(html.includes(`${records.at(-1).rewardTitle} 칭호 + 전용 뱃지`), `${road}: footer must match actual reward`);
  if (road === 'sports') assert.ok(html.includes('현재 적중 0폴더'));

  if (road !== 'level') {
    // At the narrowest supported card, bound the actual node boxes and title wrapping.
    for (const width of [260, 280, 320, 375, 560, 1000]) {
      points.forEach(([x, y], index) => {
        const final = index === points.length - 1;
        const baseWidth = final && width > 560 ? 106 : width > 560 ? 72 : 68;
        const nodeWidth = final ? baseWidth : Math.min(baseWidth, width * .21);
        assert.ok((x / 100) * width - nodeWidth / 2 >= 0, `${road}: left edge clipping`);
        assert.ok((x / 100) * width + nodeWidth / 2 <= width, `${road}: right edge clipping`);
        assert.ok((y / 100) * height + (final ? 55 : 38) < height, `${road}: bottom clipping`);
      });
    }
    const rowYs = [...new Set(points.slice(0, -1).map(point => point[1]))];
    for (let row = 1; row < rowYs.length; row++) {
      assert.ok(((rowYs[row] - rowYs[row - 1]) / 100) * height >= 95, `${road}: keep full-size badge/title rows apart`);
    }
  }
}
assert.equal(titleCount, 38, 'Cover every title across all eight journeys');
assert.ok(source.includes('<MemberAchievementJourney'));
assert.ok(source.includes('achievements={filteredAchievements}'));
assert.ok(!source.includes('const rewardNote'), 'Do not restore divergent hardcoded title tables');
const styles = postcss.parse(fs.readFileSync('app/achievement-center.css', 'utf8'));
let wrapping = false;
styles.walkRules(rule => {
  if (rule.selector === '.member-achievement-journey .member-level-node small.title-reward') {
    wrapping = rule.nodes.some(decl => decl.prop === 'white-space' && decl.value === 'normal');
  }
});
assert.ok(wrapping, 'Long title names must wrap without clipping');
assert.equal(fs.readFileSync('app/achievements-data.ts', 'utf8').replace(/\r/g, ''),
  execFileSync('git', ['show', 'HEAD:app/achievements-data.ts'], { encoding: 'utf8' }).replace(/\r/g, ''),
  'Do not alter achievement targets, payouts or claiming data');
console.log(`PASS: eight journeys, ${titleCount} complete title/badge rewards, centered final goals, preserved milestones and bounded arrows.`);
