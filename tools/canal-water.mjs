/* tools/canal-water.mjs - NO WATER IN THE FOG CANAL KEEPS YOU (claude/canalfix3; Daniel 10-02: "you fall in the water accidentally and get stuck there").
   Node only: no page, no port, no Chrome.

   THE RULE. Every water body a hero can get into - a pound, a lock chamber at either of its levels, the weed, the wading race, the mill cut, the
   lower river, the dock, Jenny's chamber at every height she keeps, and the SAFE SWIMS behind their grates - has a way out within a few tiles:
     - DEEP canal water (not shallow, not a swim) in a level that says L.waterHurts HANDS YOU BACK (main.js: a bite, and the last dry ground you
       stood on). That is its exit, and the check proves it is deep enough at every level its water can stand at to do it (over 9 px of water);
     - water you WADE (shallow) or SWIM in must offer dry footing within NEAR tiles of walking, wading, swimming and a REAL hero's jump - rise
       JUMP_UP rows, ACROSS tiles over (the reach model's six-tile leap is not a hero's: common rules, ~3.2-4.5 tiles), climbing any ladder - or
       water that hands you back (a deep pool you can wade into), or the pool says `handBack` (main.js then hands you back from it too).
   For every cell of every such water at every height, from where a hero ends up (on its bed, or anywhere in a swim), the walk is searched.
     node tools/canal-water.mjs          (the check)        node tools/canal-water.mjs --list   (every water body and its exit) */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';

export const NEAR = 14, NEAR_SWIM = 24, JUMP_UP = 3, ACROSS = 4, TS = 16;
const lv = LEVELS.find(l => l.id === 'canal'); assert.ok(lv, 'no canal level');
const L = lv.build(), W = L.W, H = L.H, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x];
const solid = t => t === T.SOLID || t === T.CRATE;
const stand = t => solid(t) || t === T.ONEWAY;
const D = L.canal || {};
const levelsOf = p => { if (p.lock) { const d = [0, 40, 48, 80, 112]; return d.map(v => p.bottom - v); }   /* Jenny's chamber: dry, the fog's shoal, low, half, high (src/jenny-greenteeth.js GT.lv) */
  const r = (D.reaches || []).find(q => q.id === p.canal); return r ? [...new Set([r.lo, r.hi])].map(row => row * TS + 4) : [p.y]; };
const deep = p => !p.shallow && !p.swim;
const pools = (L.pools || []).filter(p => !p.dry || p.lock);
/* a deep, hurting pool at a given cell (and its water there): reaching it is an exit - the canal hands you back */
const handsBack = (x, y) => L.waterHurts && pools.some(q => deep(q) && x * TS + 8 > q.x0 && x * TS + 8 < q.x1 && (y + 1) * TS > q.y + 9 && (q.bottom === undefined || y * TS < q.bottom));
const report = [], fails = [];
for (const p of pools) {
  const name = (p.canal || (p.lock ? 'jenny' : p.swimName || 'pool')) + '@' + Math.floor(p.x0 / TS) + '-' + Math.floor((p.x1 - 1) / TS);
  if (deep(p)) { const lows = levelsOf(p).map(sy => (p.bottom ?? sy + 64) - sy); const ok = L.waterHurts && lows.every(d => d > 9);
    report.push('  ' + name.padEnd(22) + (ok ? 'hands you back (deep at every level: ' + lows.map(Math.round).join('/') + ' px)' : 'DEEP BUT DOES NOT HAND YOU BACK'));
    if (!ok) fails.push(name + ': deep water that does not hand you back at every level (' + lows.join('/') + ' px)'); continue; }
  if (p.handBack) { report.push('  ' + name.padEnd(22) + 'hands you back (pool.handBack)'); continue; }
  let worst = 0, worstAt = null, none = null;
  for (const surfPx of levelsOf(p)) {
    const sr = Math.floor(surfPx / TS), bot = Math.ceil((p.bottom ?? surfPx + 64) / TS), x0 = Math.floor(p.x0 / TS), x1 = Math.ceil(p.x1 / TS) - 1;
    const wet = (x, y) => x >= x0 && x <= x1 && (y + 1) * TS > surfPx + 2 && y < bot;   /* a cell whose feet are under this water */
    if (p.swim && surfPx >= (p.bottom ?? 0) - 2) continue;   /* (no water at this height: the chamber stands dry) */
    const swimAt = (x, y) => p.swim && wet(x, y) && !solid(at(x, y));
    const foot = (x, y) => !solid(at(x, y)) && (stand(at(x, y + 1)) || at(x, y) === T.NET || at(x, y + 1) === T.NET || swimAt(x, y));
    const dry = (x, y) => foot(x, y) && !wet(x, y) && !pools.some(q => q !== p && !deep(q) && x * TS + 8 > q.x0 && x * TS + 8 < q.x1 && (y + 1) * TS > q.y + 2 && y * TS < (q.bottom ?? q.y + 64));
    const fall = (x, y) => { let k = 0; while (!foot(x, y) && y < H - 1 && k++ < 60) y++; return foot(x, y) ? y : null; };
    /* every place a hero ends up in this water: on its bed (wading), or any open cell (swimming) */
    const starts = []; for (let x = x0; x <= x1; x++) for (let y = sr; y < bot; y++) if (wet(x, y) && foot(x, y) && !solid(at(x, y))) starts.push([x, y]);
    for (const [sx, sy] of starts) {
      const seen = new Map([[sx + ',' + sy, 0]]), q = [[sx, sy, 0]]; let found = null;
      while (q.length && found === null) { const [x, y, d] = q.shift(); if (d > (p.swim ? NEAR_SWIM : NEAR)) continue;
        if (dry(x, y) || handsBack(x, y)) { found = d; break; }
        const add = (nx, ny, c = 1) => { if (ny === null || nx < 0 || nx >= W) return; const k = nx + ',' + ny; if (seen.has(k)) return; seen.set(k, d + c); q.push([nx, ny, d + c]); };
        for (const dx of [-1, 1]) if (!solid(at(x + dx, y))) add(x + dx, swimAt(x + dx, y) ? y : fall(x + dx, y));
        if (swimAt(x, y - 1)) add(x, y - 1); if (swimAt(x, y + 1)) add(x, y + 1);
        if (at(x, y) === T.NET || at(x, y - 1) === T.NET) { if (!solid(at(x, y - 1))) add(x, y - 1); }
        /* a real hero's jump: up JUMP_UP rows (from the bed, or from the surface row of a swim), ACROSS tiles over, the column clear over his head */
        const canJump = !p.swim || y <= sr + 1 || !swimAt(x, y);
        if (canJump) for (let dy = -JUMP_UP; dy <= 0; dy++) { let clear = true; for (let k = 1; k <= -dy; k++) if (solid(at(x, y - k))) clear = false; if (!clear) break;
          for (let dx = -ACROSS; dx <= ACROSS; dx++) { if (!dx && !dy) continue; const nx = x + dx, ny = y + dy; let ok = true; const s = Math.sign(dx); for (let k = s; k !== dx + s && ok; k += s) if (solid(at(x + k, ny)) && !(ny === y + dy && k === dx)) ok = false;
            if (ok && foot(nx, ny)) add(nx, ny, Math.max(1, Math.abs(dx))); } } }
      if (found === null) { none = none || [sx, sy, surfPx]; } else if (found > worst) { worst = found; worstAt = [sx, sy]; }
    }
  }
  if (none) fails.push(name + ': a hero at (' + none[0] + ', ' + none[1] + ') with the water at row ' + (none[2] / TS).toFixed(1) + ' finds no way out within ' + (p.swim ? NEAR_SWIM : NEAR) + ' tiles (real jump: ' + JUMP_UP + ' up, ' + ACROSS + ' across)');
  report.push('  ' + name.padEnd(22) + (none ? 'STUCK at ' + none[0] + ',' + none[1] : (p.swim ? 'swim' : 'wade') + ': out within ' + worst + ' tiles (the worst from ' + (worstAt || []).join(',') + ')'));
}
/* the hands keep the promise: a handBack pool is handed back from (src/canal-hands.js), and no hand-back ground is ever ON the water (a weed mat, a wading bed) */
{ const HS = (await import('node:fs')).readFileSync(new URL('../src/canal-hands.js', import.meta.url), 'utf8');
  if (!HS.includes("p.handBack && b.mode !== 'loose'")) fails.push('src/canal-hands.js does not hand a hero back from a handBack pool');
  if (!HS.includes('!atWater(H, P)) P.safe =')) fails.push('src/canal-hands.js may make a spot ON the water (a weed mat, a wading bed) the ground a hero is handed back to'); }
if (process.argv.includes('--list') || fails.length) console.log(report.join('\n'));
assert.equal(fails.length, 0, 'water that keeps you:\n  ' + fails.join('\n  '));
console.log('ok  canal-water  ' + pools.length + ' water bodies in THE FOG CANAL: the deep ones hand you back at every level, every one you wade or swim has a way out within ' + NEAR + ' tiles of a real jump');
