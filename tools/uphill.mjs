// tools/uphill.mjs — UPHILL IS SLOWER (Daniel, 2026-09-25: "going up a slope doesn't really slow you down").
// In the real page, on THE SUNKEN CARAVAN's own dunes: a hero set on a slope and walked UP it for a moment settles at
// UPHILL.steep (steep) or UPHILL.gentle (gentle) of the speed the same hero reaches walking the other way, DOWN it, which is
// UPHILL.down of a run. Proved red first: on the old movement cap both ways ran at the same speed. `node tools/uphill.mjs`
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(4), fonts: false });
try {
  const out = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js'); const { SLOPE, slopeRise, slopeGrade } = await import('/src/slopes.js');
    const i = LEVELS.findIndex(l => l.id === 'caravan'); BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    BK.load(i); BK.state = 'play'; const L = BK.L, K = BK.keys, P = BK.P, isS = t => t >= SLOPE.R1 && t <= SLOPE.L2B;
    BK.enemies().length = 0;
    /* runs of at least 4 slope tiles of one grade, the surface stepping one way: a hill long enough to reach a walking speed on */
    const runs = [];
    for (let y = 2; y < L.H - 1; y++) for (let x = 2; x < L.W - 8; x++) { const t = L.grid[y * L.W + x]; if (!isS(t)) continue;
      const g = slopeGrade(t), r = slopeRise(t); let n = 0, xx = x, yy = y;
      while (n < 8) { const u = L.grid[yy * L.W + xx]; if (!isS(u) || slopeGrade(u) !== g || slopeRise(u) !== r) break; n++; xx++; if (g === 1 || (u === SLOPE.R2B || u === SLOPE.L2B)) yy -= r; }
      if (n >= 4) runs.push({ x, y, n, g, r }); }
    const res = [];
    for (const want of [1, 0.5]) { const h = runs.find(q => q.g === want); if (!h) { res.push({ grade: want, none: true }); continue; }
      const mid = h.x + (h.n >> 1), speed = dir => { for (const k in K) K[k] = false; BK.tp(mid, h.y - 1); for (let f = 0; f < 20; f++) BK.sim(1);
        K[dir > 0 ? 'right' : 'left'] = true; let best = 0; for (let f = 0; f < 22; f++) { BK.sim(1); if (P.ground) best = Math.max(best, Math.abs(P.vx)); } K.right = K.left = false; return best; };
      const up = speed(h.r), down = speed(-h.r); res.push({ grade: want, at: [h.x, h.y, h.n], up: Math.round(up), down: Math.round(down), ratio: +(up / down).toFixed(2) }); }
    return res; })()`);
  console.log(JSON.stringify(out));
  const steep = out.find(r => r.grade === 1), gentle = out.find(r => r.grade === 0.5);
  assert(steep && !steep.none, 'the caravan has a steep hill of four tiles or more to walk');
  assert(steep.ratio <= 0.7, 'walking UP a steep dune is slower than walking down it (0.6 / 1.1 = 0.55): ' + JSON.stringify(steep));
  if (gentle && !gentle.none) assert(gentle.ratio <= 0.82 && gentle.ratio > steep.ratio - 0.02, 'a gentle dune slows you less than a steep one (0.8 / 1.1 = 0.73): ' + JSON.stringify(gentle));
  console.log('uphill: steep ' + steep.up + ' up / ' + steep.down + ' down' + (gentle && !gentle.none ? ', gentle ' + gentle.up + ' / ' + gentle.down : ''));
} finally { pg.close(); }
