import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const tracked=execFileSync('git',['ls-files'],{encoding:'utf8'}).trim().split(/\r?\n/);
const sources=tracked.filter(p=>/\.(tsx?|jsx?|mjs|css|html|json|svg)$/.test(p)&&!p.startsWith('scripts/')&&!p.startsWith('docs/')&&!/lock/.test(p));
const text=sources.map(p=>fs.readFileSync(p,'utf8')).join('\n');
const pngs=tracked.filter(p=>p.startsWith('public/')&&p.endsWith('.png'));
// Runtime-generated menu/provider/rank paths and externally consumed OG images stay.
const dynamic=/^public\/(menu-icons\/|casino-providers\/logos\/|badges\/badge-\d+\.png$|og\.png$)/;
const unused=pngs.filter(p=>!text.includes(path.basename(p))&&!text.includes(p.slice(7))&&!dynamic.test(p));
console.log(JSON.stringify({trackedPngs:pngs.length,unused:unused.map(file=>({file,bytes:fs.statSync(file).size})),bytes:unused.reduce((n,p)=>n+fs.statSync(p).size,0)},null,2));
