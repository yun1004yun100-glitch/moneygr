import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = readFileSync(resolve(root, 'app/achievement-badges.ts'), 'utf8');
const badges = JSON.parse(source.slice(source.indexOf('=') + 1).trim().replace(/;$/, ''));
const data = readFileSync(resolve(root, 'app/achievements-data.ts'), 'utf8');
const titles = [...data.matchAll(/rewardTitle: '([^']+)'/g)].map(match => match[1]);
assert.equal(titles.length, 48);
assert.equal(Object.keys(badges).length, titles.length);
assert.equal(new Set(Object.values(badges)).size, titles.length, 'Duplicate badge assignments');
const hashes = new Set();
for (const title of titles) {
  const path = badges[title];
  assert.ok(path, 'Missing mapping: ' + title);
  assert.ok(data.includes("badge: ACHIEVEMENT_BADGES['" + title + "']"), 'Unmapped reward: ' + title);
  const file = resolve(root, 'public' + path);
  assert.ok(existsSync(file), 'Missing asset: ' + path);
  const hash = createHash('sha256').update(readFileSync(file)).digest('hex');
  assert.ok(!hashes.has(hash), 'Duplicate image content: ' + title);
  hashes.add(hash);
}
console.log('PASS: 48 achievements, 48 unique images, all asset paths valid.');
