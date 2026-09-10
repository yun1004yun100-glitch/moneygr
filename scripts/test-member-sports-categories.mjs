import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { MEMBER_SPORTS_CATEGORIES, filterMemberSportsMatches } from '../app/member-sports-categories.ts';

const source = fs.readFileSync('app/page.tsx', 'utf8');
const ast = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let matches;
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'matches') matches = vm.runInNewContext(node.initializer.getText(ast));
  ts.forEachChild(node, visit);
}
visit(ast);
assert.deepEqual(MEMBER_SPORTS_CATEGORIES, ['국내스포츠', '해외스포츠', '스페셜', '실시간']);
const ids = category => Array.from(filterMemberSportsMatches(matches, category), match => match.id);
assert.deepEqual(ids('국내스포츠'), [1, 2, 3]);
assert.deepEqual(ids('해외스포츠'), [4]);
assert.deepEqual(ids('실시간'), [1, 2]);
assert.deepEqual(ids('스페셜'), [], 'Never invent special markets');
assert.equal(filterMemberSportsMatches([{ league: 'KBO', special: true }], '스페셜').length, 1);
assert.equal(filterMemberSportsMatches(matches.filter(match => match.sport === '야구'), '실시간').length, 0);
assert.ok(source.includes("view === 'sports' ? filterMemberSportsMatches(filteredMatches, sportsCategory) : filteredMatches"), 'Home and Gold keep their existing lists');
assert.ok(source.includes("view==='sports'?'section-head member-sports-heading':'section-head'"));
assert.ok(source.includes('aria-pressed={sportsCategory===category} onClick={()=>setSportsCategory(category)}'));
assert.ok(source.includes("['전체','축구','야구','농구'].map"));
assert.ok(source.includes('선택한 조건에 등록된 경기가 없습니다.'));
console.log('PASS: four sports category buttons, actual match filtering, empty special state, retained sport filters and Gold/home isolation.');
