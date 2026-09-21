// tools/draft-level.mjs — ANY LEVEL DRAFT measured against the rules before a build session touches it. A draft is a module in
// src/draft/ exporting build(T) (a level object like LEVELS' builds return) and `meta`:
//   meta = { name, orientation: 'h' | 'v', landmarks: [mark names], sun: true|false, density: [lo, hi], extra(L, api) }
// It runs, for every draft: F1 seven sections (60-100 columns across, 20-40 rows up), F2 the landmarks placed, the slope lint,
// F7 3 silvers / 3 strays / a relic got by the reach fill, B1 the start reaches the arena, B6 checkpoints (every 100 columns, or
// every 40 rows) and one outside the arena, B2 nothing standing in the air, A7 an arena of <= 44 tiles, foes a screen (24 columns
// across, 12 rows up), and for horizontal levels shape.mjs's flat-screen count; the sun rule when meta.sun; then meta.extra.
// usage: node tools/draft-level.mjs sunken-caravan | well-town | red-gorge     (exit 1 on any failure)
import { install } from './node-canvas.mjs';
install();
const name = process.argv[2]; if (!name) { console.log('usage: node tools/draft-level.mjs <draft name in src/draft/>'); process.exit(1); }
const { T } = await import('../src/level.js');
const D = await import(`../src/draft/${name}.js`), meta = D.meta;
const { slopeReachGrid, slopeLint } = await import('../src/reach-slopes.js');
const { floodReach } = await import('../src/reachcore.js');
const { isSlope, heightAt } = await import('../src/slopes.js');
const { SUN, shadeZones, inShade, roofShade, sunStretches } = await import('../src/sunstroke.js');

let fails = 0; const log = s => console.log(s), ok = (c, m) => { log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const L = D.build(T), W = L.W, H = L.H, TS = 16, at = (x, y) => (x < 0 || x >= W) ? T.SOLID : (y < 0 || y >= H) ? T.AIR : L.grid[y * W + x];
const V = meta.orientation === 'v', A = L.arena, ax0 = A.x0 / TS, ax1 = A.x1 / TS, afl = A.floor / TS;
log(`${meta.name} (draft): ${W} x ${H} tiles, ${L.ents.length} ents, ${V ? 'a climb' : 'left to right'}`);
// F1 / F2
const SEC = Object.entries(L.sections).filter(([k]) => k !== 'arena').sort((a, b) => V ? b[1] - a[1] : a[1] - b[1]);
const endOf = V ? (L.sections.arena ?? 0) : (L.sections.arena ?? ax0);
const lens = SEC.map(([k, v], i) => [k, Math.abs((i + 1 < SEC.length ? SEC[i + 1][1] : endOf) - v)]);
const [lo, hi] = V ? [20, 40] : [60, 100];
ok(SEC.length === 7 && lens.every(([, n]) => n >= lo && n <= hi), `F1: seven sections of ${lo}-${hi} ${V ? 'rows' : 'columns'} (${lens.map(([k, n]) => k + ' ' + n).join(', ')})`);
ok(meta.landmarks.length >= 5 && meta.landmarks.every(k => L.marks[k] !== undefined), `F2: ${meta.landmarks.length} landmarks placed (${meta.landmarks.join(', ')})`);
const lint = slopeLint(L, T); ok(lint.length === 0, `slopeLint: ${lint.length} complaints ${lint.slice(0, 3).map(b => b.join(' ')).join('; ')}`);
// reach
const R = floodReach(slopeReachGrid(D.asPlayed ? D.asPlayed(L, T) : L, T), T, { rides: true });   /* reach as the player plays it (a level whose rule opens the way says how: asPlayed) */
const want = t => L.ents.filter(e => e.t === t), got = e => R.jumpNear(e.x, e.y), cnt = t => `${want(t).filter(got).length}/${want(t).length}`;
ok(want('silver').length === 3 && want('stray').length === 3 && want('relic').length === 1 && [...want('silver'), ...want('stray'), ...want('relic')].every(got), `F7 + reach: silvers ${cnt('silver')}, strays ${cnt('stray')}, relic ${cnt('relic')} got by the fill`);
let arenaReached = false; for (let x = ax0; x < ax1; x++) for (let y = 0; y < H; y++) if (R.seen.has(x + ',' + y)) arenaReached = true;
ok(arenaReached, `B1: the start reaches the arena (${A.boss})`);
ok(ax1 - ax0 <= 44, `A7: the arena is ${ax1 - ax0} tiles across`);
// B6
const checks = want('check'), pos = checks.map(e => V ? e.y : e.x).sort((a, b) => V ? b - a : a - b), gaps = pos.slice(1).map((p, i) => Math.abs(p - pos[i]));
const outside = checks.some(e => V ? (e.y >= afl && e.y <= afl + 6 && e.x >= ax0 - 4 && e.x <= ax1 + 4) || (e.y > afl) : (e.x < ax0 && e.x >= ax0 - 6));
const first = V ? Math.abs(L.START.y - pos[0]) : pos[0];
ok(Math.max(first, ...gaps) <= (V ? 40 : 100) && outside && checks.every(e => R.near(e.x, e.y)), `B6: ${checks.length} checkpoints, the widest gap ${Math.max(...gaps)} ${V ? 'rows' : 'columns'}, one outside the arena, all reachable`);
// B2
const standT = t => t === T.SOLID || t === T.ONEWAY || t === T.PLANK || t === T.NET || t === T.CRATE || isSlope(t);
const flyers = new Set(['vulture', 'silver', 'coin', 'raptor', 'bat', 'wisp']);
const floating = L.ents.filter(e => !flyers.has(e.t) && !e.hung && !standT(at(e.x, e.y + 1)) && !isSlope(at(e.x, e.y)));
ok(floating.length === 0, `B2: nothing stands in the air (${floating.length}: ${floating.slice(0, 4).map(e => e.t + '@' + e.x + ',' + e.y).join(' ')})`);
// density (and shape, across)
const FOES = new Set(meta.foes);
let win = 0, foes = 0, minF = 99, flat = 0, hs = 0; const seen = [...R.seen].map(k => k.split(',').map(Number));
if (V) { for (let y = H - 12; y - 12 >= 0; y -= 12) { if (y <= afl + 1 && y >= afl - 12) continue; win++; const n = L.ents.filter(e => FOES.has(e.t) && e.y >= y - 12 && e.y < y).length; foes += n; minF = Math.min(minF, n); } }
else for (let x = 0; x + 24 <= ax0; x += 24) { win++; const n = L.ents.filter(e => FOES.has(e.t) && e.x >= x && e.x < x + 24).length; foes += n; minF = Math.min(minF, n);
  const ys = new Set(seen.filter(([sx]) => sx >= x && sx < x + 24).map(([, y]) => y)); hs += ys.size; if (ys.size <= 2) flat++; }
const per = foes / win;
ok(per >= meta.density[0] && per <= meta.density[1] && minF >= 2, `density: ${per.toFixed(1)} foes a screen over ${win} screens (thinnest ${minF}); the rule ${meta.density.join('-')}`);
if (!V) ok(flat / win < 0.33, `shape: ${(hs / win).toFixed(1)} standable heights a screen, ${Math.round(100 * flat / win)}% flat screens (Burial reached 27%)`);
// the sun
if (meta.sun) {
  const Z = shadeZones(L); for (const w of want('winch')) Z.push([w.canopy.x0 * TS, (w.canopy.x1 + 1) * TS, w.canopy.row * TS, H * TS]);
  const low = new Map(); for (const k of R.seen) { const [x, y] = k.split(',').map(Number); if (!low.has(x) || y > low.get(x)) low.set(x, y); }
  const route = []; for (let x = 8; x < ax0 * TS; x += 4) { const tx = Math.floor(x / TS), cy = low.get(tx); if (cy === undefined) continue; const t = at(tx, cy); route.push([x, isSlope(t) ? cy * TS + heightAt(t, x - tx * TS) : (cy + 1) * TS]); }
  const shaded = (x, y) => inShade(Z, x, y - 1) || roofShade((tx, ty) => at(tx, ty), x, y - 14, t => t === T.SOLID);
  const st = sunStretches(route, shaded); ok(st[0].s <= SUN.maxWalk, `THE SUN: the longest walk in the open is ${st[0].s.toFixed(1)} s (columns ${Math.round(st[0].x0 / TS)}-${Math.round(st[0].x1 / TS)}), the rule ${SUN.maxWalk} s`);
}
if (meta.extra) await meta.extra(L, { ok, log, R, at, T, TS, floodReach, slopeReachGrid, want });
const kinds = {}; for (const e of L.ents) if (FOES.has(e.t)) kinds[e.t] = (kinds[e.t] || 0) + 1;
log('    the draft GARRISON: ' + Object.entries(kinds).map(([k, n]) => k + ' ' + n).join(', '));
console.log(fails ? `\n${name}: ${fails} FAILED` : `\n${name}: all passed`);
process.exit(fails ? 1 : 0);
