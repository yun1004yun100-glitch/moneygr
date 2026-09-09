import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';

const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const source=walk('app').filter(p=>/\.(tsx?|css|js)$/.test(p)).map(p=>fs.readFileSync(p,'utf8')).join('\n');
const refs=new Set([...source.matchAll(/["'`]\/([^"'`\s<>?]+?\.(?:png|jpe?g|webp|gif|svg|avif|ico|mp4|webm))/g)].map(m=>m[1]).filter(p=>!/[${}\\]/.test(p)));
const missing=[...refs].filter(p=>!fs.existsSync(path.join('public',p)));
assert.deepEqual(missing,[],'Missing statically referenced public media');
for(const name of ['deposit','withdraw','coupon','event','notice','friend','check','star','cs','message','mypage','point']) assert.ok(fs.existsSync(`public/menu-icons/${name}.png`));
const games=fs.readFileSync('app/page.tsx','utf8');
for(const match of games.matchAll(/image:'\/casino-providers\/([^']+)-portrait-v2\.png'/g)) assert.ok(fs.existsSync(`public/casino-providers/logos/${match[1]}.png`));
for(let n=1;n<=15;n++) assert.ok(fs.existsSync(`public/badges/badge-${n}.png`));
const modules={};
const load=name=>{
  if(modules[name])return modules[name];
  const exports={};modules[name]=exports;
  const code=ts.transpileModule(fs.readFileSync(`app/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
  vm.runInNewContext(code,{exports,require:p=>load(p.replace('./',''))});return exports;
};
const {ACHIEVEMENT_BADGES}=load('achievement-badges');
const {resolveBadgeAsset}=load('badge-assets');
for(const asset of Object.values(ACHIEVEMENT_BADGES)){
 assert.equal(resolveBadgeAsset(asset),asset);
 if(asset.endsWith('-transparent-v3.png'))assert.equal(resolveBadgeAsset(asset.replace('-transparent-v3.png','-v2.png')),asset);
}
console.log(`PASS: ${refs.size} static media paths, dynamic menus/provider logos/ranking badges, and saved legacy badge migration.`);
