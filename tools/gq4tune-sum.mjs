/* GQ4TUNE-d: sum damage sources (hb) and stage of death over boss-rates --out json files. node tools/gq4tune-sum.mjs file.json [..] */
import { readFileSync } from 'node:fs';
const rows = process.argv.slice(2).flatMap(f => JSON.parse(readFileSync(f, 'utf8'))).filter(x => !x.err);
const hb = {}, by = {}; let n = 0, w = 0;
for (const x of rows) { n++; if (x.outcome === 'win') w++; const k = x.hero; (by[k] = by[k] || { w: 0, n: 0 }).n++; if (x.outcome === 'win') by[k].w++;
  for (const [m, v] of Object.entries(x.hb || {})) hb[m] = (hb[m] || 0) + v; }
console.log('wins', w + '/' + n, Object.entries(by).map(([h, v]) => h + ' ' + v.w + '/' + v.n).join(' '));
console.log('avg dmg taken per fight by source:', Object.entries(hb).sort((a, b) => b[1] - a[1]).map(([m, v]) => m + ' ' + (v / n).toFixed(0)).join(' | '));
const st = {}; for (const x of rows) { const s = x.outcome === 'win' ? 'win' : (x.gq ? x.gq.stage : '?'); st[s] = (st[s] || 0) + 1; } console.log('end stage', JSON.stringify(st));
