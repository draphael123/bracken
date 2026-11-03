import { readFileSync } from 'fs';
import { LEVELS, T } from '../src/level.js';
const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const setOf = name => { const i = MAIN.indexOf("const " + name + " = new Set(["); const j = MAIN.indexOf("]);", i); return new Set([...MAIN.slice(i, j).matchAll(/'([A-Za-z]+)'/g)].map(x => x[1])); };
const HUNG_DECO = setOf('HUNG_DECO'), DECO_AIR = setOf('DECO_AIR'), STANDS_T = setOf('STANDS_T');
const decoHangs = e => !e.stand && (!!e.hang || (HUNG_DECO.has(e.kind) && e.kind !== 'banner' && e.kind !== 'hangCage' && e.kind !== 'spire'));
const SOLID = new Set([T.SOLID, T.CRATE, T.PALISADE, T.PORT, T.CLIMB, T.SOFT, T.ICE, T.WEB]);
const LEDGE = new Set([T.ONEWAY, T.REED, T.PLANK, T.BOUNCER, T.SHELF, T.RAIL, T.CRYST]);
const ids = process.argv.slice(2);
for (const lv of LEVELS) { if (ids.length && !ids.includes(lv.id)) continue;
  const R = lv.build(); const { W, H, grid, ents } = R;
  const tile = (x, y) => (x < 0 || x >= W) ? T.SOLID : (y < 0 || y >= H) ? T.AIR : grid[y * W + x];
  const gnd = (x, y) => SOLID.has(tile(x, y)) || LEDGE.has(tile(x, y));
  const settle = (x, y0) => { let y = y0, n = 0; while (gnd(x, y) && n++ < 3) y--; if (gnd(x, y)) return null; n = 0; while (!gnd(x, y + 1) && n++ < 3) y++; return gnd(x, y + 1) ? y : null; };
  const out = [];
  for (const e of ents) { const dec = e.t === 'deco';
    if (dec && decoHangs(e)) { let k = 0; while (k < 5 && !SOLID.has(tile(e.x, e.y - 1 - k))) k++; if (k >= 5) out.push(['UNHUNG-DROP', e.kind, e.x, e.y, e.hang ? 'hang' : 'hungset', e.dressed ? 'dressed' : 'hand']); continue; }
    if (dec ? (decoHangs(e) || DECO_AIR.has(e.kind)) : (!STANDS_T.has(e.t) || e.perch)) continue;
    const y = settle(e.x, e.y); let nx = e.x, ny = y;
    if (y === null) for (let dx = 1; dx <= 3 && ny === null; dx++) for (const sx of [e.x - dx, e.x + dx]) if (ny === null) { const yy = settle(sx, e.y); if (yy !== null) { nx = sx; ny = yy; } }
    if (ny === null) out.push([dec ? 'DROP' : 'AIR', e.kind || e.t, e.x, e.y, '', e.dressed ? 'dressed' : 'hand']);
    else if (ny !== e.y || nx !== e.x) out.push(['SETDOWN', e.kind || e.t, e.x, e.y, '->' + nx + ',' + ny + ' (d' + (nx - e.x) + ',' + (ny - e.y) + ')', e.dressed ? 'dressed' : 'hand']);
  }
  console.log('== ' + lv.id + ' ' + W + 'x' + H + ' n=' + out.length); for (const o of out) console.log('  ' + o.join(' '));
}
