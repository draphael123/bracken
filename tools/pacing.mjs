// tools/pacing.mjs — THE RHYTHM OF A LEVEL, measured along the way you actually walk it.
// curve.mjs says how much is IN a level; quality.mjs says how dense it is per hundred columns. Neither says what it
// is like to PLAY it in order: three fights with nothing between them, sixty tiles of empty floor, a climb that
// doubles back on itself. This finds the main route (the reach fill's movement graph, start to gate, rides on),
// cuts it into stretches of eight tiles walked, and tags each stretch by what is happening on it.
//
//   node tools/pacing.mjs                    every campaign and secret level
//   node tools/pacing.mjs wood reef          just those
//   node tools/pacing.mjs --json=out.json    also write the strips, stats and routes as JSON (the video bot reads the routes)
//
// THE STRIP, one character per eight tiles of route:
//   F fight (creatures in the way)   P platforming (jumps, climbs, rides, hazards, little combat)   H both at once
//   W a swim with nothing else on it   A ambush room   M mini-boss room   B boss arena   X set-piece (a machine, a key,
//   a gate, a thing the level does)   R rest (a checkpoint or somebody to talk to, and quiet)   S quiet, with an
//   optional pocket off it   - light (a little of something)   . EMPTY (nothing: no creature, hazard or jump)
// THE MARKS under it:  c checkpoint on the route   s a dead-end pocket hangs off here   $ loot off the route nearby
//                      < the route doubles back here   ~ a ride the reach model cannot follow was bridged here
// It is a STATIC read of the data, like curve.mjs: what the level lays in front of you, not how a player does.
import { writeFileSync } from 'fs';
import { LEVELS, T, TS } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { findDeadEnds } from '../src/deadends.js';
import { THREAT } from '../src/threat.js';

const args = process.argv.slice(2);
const want = args.filter(a => !a.startsWith('-'));
const jsonOut = (args.find(a => a.startsWith('--json=')) || '').slice(7);
const STEP = 8, RX = 8, RY = 6, EMPTY_RUN = 40;

const HAZARD_FOE = new Set(['rockfall', 'skybolt', 'catapult', 'dropcage', 'firepit', 'firevent', 'hotplate', 'hammer', 'towertop']);
const SETPIECE = new Set(['lever', 'crank', 'winch', 'sluice', 'capstan', 'pump', 'firebox', 'sheet', 'cannon', 'bell', 'seabell', 'lockgate',
  'key', 'felltree', 'deadfall', 'ram', 'cart', 'plank', 'keg', 'loosegun', 'cargowall', 'bulkhead', 'davit', 'stormkite', 'resonance', 'mirror',
  'weight', 'support', 'rod', 'boiler', 'roller', 'nest', 'cage', 'plate', 'timber', 'throne', 'sail', 'bridge', 'gas',
  'tbell', 'pwheel']);   /* THE MONASTERY: a bell that brings a bridge down, a prayer wheel that turns a stair */
const PLATFORM = new Set(['mover', 'pad', 'vent', 'balloon', 'stal']);
const REST = new Set(['check', 'npc', 'guest', 'shrine', 'shop']);
const LOOT = new Set(['silver', 'relic', 'stray', 'mend']);
const SYSTEMS = ['gusts', 'wash', 'streetTide', 'bore', 'slide', 'sleeps', 'flight', 'roll', 'airRooms', 'deep', 'timber', 'lampAir', 'swell',
  'hullZones', 'darkZones', 'scree', 'vines', 'perches', 'slick', 'hags', 'thermals', 'storm2', 'masts', 'ballast', 'hush', 'roofs', 'cloudSea', 'wetZone', 'ropes'];

export function pacing(lv) {
  const L = lv.build(), W = L.W, H = L.H, N = W * H, ents = L.ents || [];
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x];
  const R = floodReach(L, T, { rides: true });
  const parse = k => { const c = k.indexOf(','); return [+k.slice(0, c), +k.slice(c + 1)]; };
  const foot = new Uint8Array(N);
  for (const k of R.footing) { const [x, y] = parse(k); if (x >= 0 && y >= 0 && x < W && y < H) foot[y * W + x] = 1; }
  const water = new Uint8Array(N);
  for (const p of (L.pools || [])) { if (!p.swim || p.arenaTide) continue; const topPx = p.streetTide ? p.base + p.tideHi : p.y; const r0 = Math.floor(topPx / TS), r1 = Math.floor(((p.bottom ?? topPx + 64) - 1) / TS);
    for (let x = Math.max(0, Math.floor(p.x0 / TS)); x < Math.min(W, Math.ceil(p.x1 / TS)); x++) for (let y = Math.max(0, r0); y <= Math.min(H - 1, r1); y++) water[y * W + x] = 1; }
  const settle = (x, y) => { x = Math.max(0, Math.min(W - 1, x)); let yy = Math.max(0, y); while (yy < H - 1 && !foot[yy * W + x]) yy++; return foot[yy * W + x] ? yy * W + x : -1; };

  // ---- THE ROUTE: a directed movement graph and the cheapest way from the start to the gate ----
  const adjCache = new Map();
  const edges = u => { let a = adjCache.get(u); if (a) return a; a = []; const ux = u % W, uy = (u / W) | 0, stamp = new Set();
    R.expand(ux, uy, (nx, ny) => { if (nx < 0 || ny < 0 || nx >= W || ny >= H) return; const v = ny * W + nx; if (v === u || !foot[v] || stamp.has(v)) return; stamp.add(v);
      a.push(v, Math.min(16, Math.max(1, Math.abs(nx - ux), Math.abs(ny - uy)))); });
    /* THE WIND CARRIES YOU. reachcore has no gust (Gale Moor's six-tile gaps are crossed on a tailwind), so a tile
       inside a gust reaches footing up to ten tiles downwind of it, a little above or below. Route only: no tool that
       fails a level uses this. */
    for (const gu of (L.gusts || [])) { if (gu.arena || ux * TS < gu.x0 || ux * TS >= gu.x1 || uy * TS < gu.y0 - 3 * TS || uy * TS >= gu.y1) continue;
      for (let k = 2; k <= 10; k++) for (let dy = -3; dy <= 4; dy++) { const x = ux + gu.dir * k, y = uy + dy; if (x < 0 || y < 0 || x >= W || y >= H) continue; const v = y * W + x; if (foot[v] && !stamp.has(v)) { stamp.add(v); a.push(v, k); } } }
    adjCache.set(u, a); return a; };
  const bridges = new Map();   /* u -> [[v, w]]: a way on the model cannot see (a gust, a creature chain, a ride it does not know) */
  const gate = ents.find(e => e.t === 'gate'), A = L.arena;
  let s0 = settle(L.START.x, L.START.y);
  /* THE END IS THE FIGHT. Several levels stand their gate at the arena door, so a route to the gate stops short of the boss */
  const goalXY = A ? [Math.round((A.x0 + A.x1) / 2 / TS), Math.round(A.floor / TS) - 1] : gate ? [gate.x, gate.y] : null;
  const dist = new Float64Array(N).fill(Infinity), par = new Int32Array(N).fill(-1);
  const run = srcs => { const B = []; for (const s of srcs) (B[dist[s]] ||= []).push(s);
    for (let k = 0; k < B.length; k++) { const b = B[k]; if (!b) continue; B[k] = null;
      for (const u of b) { if (dist[u] !== k) continue; const a = edges(u);
        const relax = (v, w) => { const nd = k + w; if (nd < dist[v]) { dist[v] = nd; par[v] = u; (B[nd] ||= []).push(v); } };
        for (let j = 0; j < a.length; j += 2) relax(a[j], a[j + 1]);
        const x = bridges.get(u); if (x) for (const [v, w] of x) relax(v, w); } } };
  dist[s0] = 0; run([s0]);
  let goal = -1;
  if (goalXY) goal = settle(goalXY[0], goalXY[1]);
  if (goal < 0) { let bx = -1; for (let i = 0; i < N; i++) if (dist[i] < Infinity && i % W > bx) { bx = i % W; goal = i; } }
  // a goal the fill does not reach: bridge from the reached ground nearest the unreached ground that lies toward the goal
  let bridged = 0;
  for (let pass = 0; pass < 150 && dist[goal] === Infinity; pass++) {
    const gx = goal % W, gy = (goal / W) | 0; let best = null;
    /* only the reached ground nearest the goal is worth bridging from: scanning all of it every pass is minutes on the moor */
    const front = []; for (let u = 0; u < N; u++) if (foot[u] && dist[u] !== Infinity) front.push([Math.hypot(u % W - gx, ((u / W) | 0) - gy), u]);
    front.sort((p, q) => p[0] - q[0]);
    /* a gap the model cannot see is usually a few tiles; a kite flight is a few hundred. Look near first, then far. */
    for (const [RXB, RYB] of [[12, 12], [40, 14], [220, 20]]) { if (best) break;
      for (const [, u] of front.slice(0, 250)) { const ux = u % W, uy = (u / W) | 0;
        for (let dy = -RYB; dy <= RYB; dy++) for (let dx = -RXB; dx <= RXB; dx++) { const x = ux + dx, y = uy + dy; if (x < 0 || y < 0 || x >= W || y >= H) continue; const v = y * W + x;
          if (!foot[v] || dist[v] !== Infinity) continue; const score = Math.max(Math.abs(dx), Math.abs(dy)) * 3 + Math.hypot(x - gx, y - gy) - Math.hypot(ux - gx, uy - gy);
          if (!best || score < best.score) best = { u, v, score, w: Math.min(16, Math.max(1, Math.abs(dx), Math.abs(dy))) }; } } }
    if (process.env.PACE_DEBUG) console.log('  bridge pass ' + pass + ': ' + (best ? (best.u % W) + ',' + ((best.u / W) | 0) + ' -> ' + (best.v % W) + ',' + ((best.v / W) | 0) : 'none') + ' front ' + front.length);
    if (!best) break;
    if (!bridges.has(best.u)) bridges.set(best.u, []); bridges.get(best.u).push([best.v, best.w]); bridged++;
    if (dist[best.u] + best.w < dist[best.v]) { dist[best.v] = dist[best.u] + best.w; par[best.v] = best.u; run([best.v]); }
  }
  const route = []; for (let u = goal; u >= 0 && route.length < N; u = par[u]) { route.push(u); if (u === s0) break; }
  route.reverse();
  const isBridge = (u, v) => (bridges.get(u) || []).some(([b]) => b === v);

  // ---- WHAT EACH STEP OF IT IS ----
  const pts = route.map(u => [u % W, (u / W) | 0]);
  const cum = [0], kind = ['start'];
  for (let i = 1; i < route.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], dx = x1 - x0, dy = y1 - y0, w = Math.min(16, Math.max(1, Math.abs(dx), Math.abs(dy)));
    cum.push(cum[i - 1] + w);
    let k = 'walk';
    if (isBridge(route[i - 1], route[i])) k = 'bridge';
    else if (water[route[i]] && water[route[i - 1]]) k = 'swim';
    else if (Math.abs(dx) > 8 || Math.abs(dy) > 8) k = 'ride';
    else if (at(x1, y1) === T.CLIMB || at(x1, y1 + 1) === T.NET || at(x1, y1) === T.NET) k = Math.abs(dy) >= 1 ? 'climb' : 'walk';
    else if (dy < -1 || (Math.abs(dx) >= 2 && dy <= 0)) k = dy < -4 ? 'ride' : 'jump';
    else if (dy >= 2) k = 'fall';
    kind.push(k);
  }
  const total = cum[cum.length - 1] || 0, nb = Math.max(1, Math.ceil((total + 1) / STEP));
  const bucketOf = i => Math.min(nb - 1, Math.floor(cum[i] / STEP));
  const nearestRoute = (x, y, rx = RX, ry = RY) => { let bi = -1, bd = 1e9; for (let i = 0; i < pts.length; i++) { const dx = Math.abs(pts[i][0] - x), dy = Math.abs(pts[i][1] - y); if (dx <= rx && dy <= ry && dx + dy < bd) { bd = dx + dy; bi = i; } } return bi; };

  const B = Array.from({ length: nb }, () => ({ threat: 0, foes: 0, haz: 0, plat: 0, swim: 0, tiles: 0, set: [], rest: [], region: null, marks: new Set(), x: null, y: null }));
  const inRect = (x, y, r) => x >= r[0] && x <= r[1] && y >= r[2] && y <= r[3];
  const regions = [];
  if (A) regions.push({ c: 'B', r: [A.x0 / TS, A.x1 / TS, A.floor / TS - 16, A.floor / TS + 2] });
  if (L.mini) { const M = L.mini; regions.push({ c: 'M', r: [M.x0 / TS, M.x1 / TS, M.y0 !== undefined ? M.y0 / TS - 1 : M.floor / TS - 16, (M.y1 !== undefined ? M.y1 / TS : M.floor / TS) + 2] }); }
  for (const Q of (L.ambushes || [])) regions.push({ c: 'A', name: Q.name, r: [Q.wallL, Q.wallR, (Q.y0 !== undefined ? Q.y0 : Q.row - 9) - 1, Q.row + 2] });
  const spikeSeen = new Set();
  for (let i = 0; i < pts.length; i++) {
    const b = B[bucketOf(i)], [x, y] = pts[i]; b.tiles++; if (b.x === null) { b.x = x; b.y = y; }
    const k = kind[i];
    if (k !== 'walk' && k !== 'start') b.moves = (b.moves || 0) + 1;
    if (k === 'jump') b.plat += 1; else if (k === 'fall') b.plat += 0.5; else if (k === 'climb') b.plat += 0.5; else if (k === 'ride') b.plat += 2; else if (k === 'swim') b.swim++;
    if (k === 'bridge') b.marks.add('~');
    if (i > 0) b.plat += Math.abs(pts[i][1] - pts[i - 1][1]) / 4;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -2; dx <= 2; dx++) if (at(x + dx, y + dy) === T.SPIKE && !spikeSeen.has((x + dx) + ',' + (y + dy))) { spikeSeen.add((x + dx) + ',' + (y + dy)); b.haz += 0.5; }
    for (const p of (L.pools || [])) if (p.harm && x * TS >= p.x0 && x * TS < p.x1 && y >= Math.floor(p.y / TS) - 3 && y <= Math.floor((p.bottom ?? p.y + 64) / TS)) { b.haz += 0.25; }
    for (const g of (L.gusts || [])) if (!g.arena && x * TS >= g.x0 && x * TS < g.x1 && y * TS >= g.y0 && y * TS < g.y1) b.plat += 0.25;
    for (const rg of regions) if (inRect(x, y, rg.r)) b.regionVotes = (b.regionVotes || new Map()).set(rg.c, ((b.regionVotes && b.regionVotes.get(rg.c)) || 0) + 1);
  }
  for (const b of B) if (b.regionVotes) { const [c, n] = [...b.regionVotes].sort((p, q) => q[1] - p[1])[0]; if (n * 2 >= b.tiles) b.region = c; }

  // ---- WHAT STANDS BESIDE IT ----
  const bossT = new Set([A && A.boss, L.mini && L.mini.boss].filter(Boolean));
  const activity = new Uint8Array(pts.length);   /* a route tile with something going on within reach of it */
  for (let i = 1; i < pts.length; i++) if (kind[i] !== 'walk') activity[i] = 1;
  for (const i of spikeSeen) { const [sx, sy] = i.split(',').map(Number); for (let j = 0; j < pts.length; j++) if (Math.abs(pts[j][0] - sx) <= 2 && Math.abs(pts[j][1] - sy) <= 2) activity[j] = 1; }
  const offLoot = [], onLoot = [];
  let foesOn = 0, foesOff = 0;
  for (const e of ents) {
    const w = THREAT[e.t] || 0;
    const cat = bossT.has(e.t) ? null : HAZARD_FOE.has(e.t) ? 'haz' : w > 0 ? 'foe' : SETPIECE.has(e.t) ? 'set' : PLATFORM.has(e.t) ? 'plat' : REST.has(e.t) ? 'rest' : LOOT.has(e.t) ? 'loot' : null;
    if (!cat) continue;
    const i = nearestRoute(e.x, e.y, cat === 'loot' ? 4 : RX, cat === 'loot' ? 4 : RY);
    if (cat === 'loot') { if (i < 0) { const j = nearestRoute(e.x, e.y, 40, 30); offLoot.push(e.t + '@' + e.x + ',' + e.y); if (j >= 0) B[bucketOf(j)].marks.add('$'); } else onLoot.push(e.t); continue; }
    if (i < 0) { if (cat === 'foe') foesOff++; continue; }
    const b = B[bucketOf(i)];
    if (cat === 'foe') { b.threat += w; b.foes++; foesOn++; }
    else if (cat === 'haz') b.haz += 2;
    else if (cat === 'set') b.set.push(e.t);
    else if (cat === 'plat') { b.plat += 1.5; b.platEnt = 1; }
    else if (cat === 'rest') { b.rest.push(e.t); if (e.t === 'check') b.marks.add('c'); }
    if (cat !== 'rest') for (let j = 0; j < pts.length; j++) if (Math.abs(pts[j][0] - e.x) <= RX && Math.abs(pts[j][1] - e.y) <= RY) activity[j] = 1;
  }
  for (const m of (L.moversExtra || [])) { const mx = Math.floor((m.px ?? m.x ?? m.x0 ?? 0) / TS), my = Math.floor((m.py ?? m.y ?? m.y0 ?? 0) / TS); const i = nearestRoute(mx, my, 10, 10); if (i >= 0) { B[bucketOf(i)].plat += 1.5; B[bucketOf(i)].platEnt = 1; for (let j = Math.max(0, i - 6); j < Math.min(pts.length, i + 6); j++) activity[j] = 1; } }
  for (const Q of (L.ambushes || [])) for (const wv of Q.waves) for (const [t] of wv) { const v = THREAT[t]; if (v > 0) foesOn++; }

  // the pockets off the route (tools/deadends.mjs's own finder), marked where they hang off it
  let pockets = [];
  try { pockets = findDeadEnds(L, T).pockets || []; } catch { pockets = []; }
  for (const p of pockets) { const [sx, sy] = p.saddle || [p.x, p.y]; const i = nearestRoute(sx, sy, 20, 16); if (i >= 0) B[bucketOf(i)].marks.add('s'); }

  // ---- TAG EACH STRETCH ----
  const strip = B.map(b => {
    if (b.region) return b.region;
    if (b.set.length) return 'X';
    /* thresholds from --calib over the whole campaign: a stretch's threat is 2.5 at the 75th percentile and 4.5 at
       the 90th; platforming+hazard is 2 and 3.5. So FIGHT and PLATFORMING are roughly the busiest fifth of stretches. */
    const fight = b.threat >= 3, busy = b.plat + b.haz >= 3;
    if (fight && busy) return 'H';
    if (fight) return 'F';
    if (busy) return 'P';
    if (b.swim * 2 >= b.tiles && b.tiles) return 'W';
    if (b.rest.length) return 'R';
    if (b.marks.has('s') || b.marks.has('$')) return 'S';
    if (b.threat === 0 && b.haz === 0 && !b.moves && !b.platEnt) return '.';
    return '-';
  }).join('');
  // the doubling back: moves against the level's direction of travel
  const tall = H > 60, sx = pts.length ? pts[0] : [0, 0], gxy = pts.length ? pts[pts.length - 1] : [0, 0];
  const axis = tall ? 1 : 0, sgn = Math.sign(gxy[axis] - sx[axis]) || 1;
  let back = 0, runBack = 0, runFrom = null; const backRuns = [];
  for (let i = 1; i < pts.length; i++) { if (kind[i] === 'ride' || kind[i] === 'bridge') { runBack = 0; continue; }
    const d = (pts[i][axis] - pts[i - 1][axis]) * sgn;
    if (d < 0) { back += -d; if (!runBack) runFrom = i - 1; runBack += -d; }
    else if (d > 0) { if (runBack >= 12) { backRuns.push({ from: pts[runFrom], to: pts[i - 1], tiles: runBack }); B[bucketOf(runFrom)].marks.add('<'); } runBack = 0; } }
  if (runBack >= 12) backRuns.push({ from: pts[runFrom], to: pts[pts.length - 1], tiles: runBack });
  const marks = B.map(b => b.marks.has('c') ? 'c' : b.marks.has('<') ? '<' : b.marks.has('~') ? '~' : b.marks.has('s') ? 's' : b.marks.has('$') ? '$' : ' ').join('');

  // ---- THE NUMBERS ----
  let longest = { c: '', n: 0, at: 0 };
  for (let i = 0; i < strip.length;) { let j = i; while (j < strip.length && strip[j] === strip[i]) j++; if (j - i > longest.n && !'ABM'.includes(strip[i])) longest = { c: strip[i], n: j - i, at: i }; i = j; }
  const empties = [];
  for (let i = 0; i < pts.length;) { if (activity[i]) { i++; continue; } let j = i; while (j < pts.length && !activity[j]) j++;
    const len = cum[j - 1] - cum[i]; if (len >= EMPTY_RUN && !regions.some(rg => inRect(pts[i][0], pts[i][1], rg.r))) empties.push({ from: pts[i], to: pts[j - 1], tiles: len }); i = j; }
  /* a tall level is floors: a checkpoint at the far end of the floor the route crosses is still on the way */
  const checks = ents.filter(e => e.t === 'check').map(e => { const i = tall ? nearestRoute(e.x, e.y, 48, 4) : nearestRoute(e.x, e.y, 12, 8); return i < 0 ? null : cum[i]; }).filter(v => v !== null).sort((a, b) => a - b);
  const endAt = (() => { if (!A) return total; const i = pts.findIndex(([x, y]) => x >= A.trigger / TS && inRect(x, y, regions[0].r)); return i < 0 ? total : cum[i]; })();
  const stops = [0, ...checks.filter(c => c < endAt), endAt]; let maxGap = 0, gapAt = 0;
  for (let i = 1; i < stops.length; i++) if (stops[i] - stops[i - 1] > maxGap) { maxGap = stops[i] - stops[i - 1]; gapAt = stops[i - 1]; }
  /* CHEAP HITS AND BLIND DROPS. A landing (the end of a jump, a fall or a ride) with a creature standing within two tiles
     of it is a hit you take for arriving; a fall of eight rows or more lands below the bottom of the view before you see
     the floor (the camera keeps the hero about 60% down a 180px screen). */
  const landingFoes = [], blindDrops = [];
  const foesAt = ents.filter(e => (THREAT[e.t] || 0) > 0 && !HAZARD_FOE.has(e.t) && !bossT.has(e.t));
  for (let i = 1; i < pts.length; i++) { const k = kind[i]; if (!['jump', 'fall', 'ride', 'bridge'].includes(k) || (i + 1 < pts.length && kind[i + 1] === k)) continue;
    const [x, y] = pts[i]; const f = foesAt.find(e => Math.abs(e.x - x) <= 2 && Math.abs(e.y - y) <= 1);
    if (f && !regions.some(rg => inRect(x, y, rg.r))) landingFoes.push(f.t + '@' + x + ',' + y);
    if (k === 'fall' && pts[i][1] - pts[i - 1][1] >= 8) blindDrops.push(pts[i - 1][0] + ',' + pts[i - 1][1] + '+' + (pts[i][1] - pts[i - 1][1])); }
  const setKinds = new Set(); for (const b of B) for (const s of b.set) setKinds.add(s);
  const systems = SYSTEMS.filter(k => L[k] && (!Array.isArray(L[k]) || L[k].length));
  if ((L.pools || []).some(p => p.swim)) systems.push('swim'); if ((L.pools || []).some(p => p.harm)) systems.push('harm-water');
  const setPieces = setKinds.size + (L.ambushes || []).length + (L.mini ? 1 : 0) + (A ? 1 : 0);
  // how much of the ground you can reach is well away from the route: the optional space
  const near = new Uint8Array(N); for (const [x, y] of pts) for (let dy = -RY; dy <= RY; dy++) for (let dx = -RX; dx <= RX; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H) near[yy * W + xx] = 1; }
  let reach = 0, off = 0; for (const k of R.seen) { const [x, y] = parse(k); if (x < 0 || y < 0 || x >= W || y >= H) continue; reach++; if (!near[y * W + x]) off++; }
  const count = c => [...strip].filter(q => q === c).length;
  const mix = Object.fromEntries(['F', 'H', 'P', 'W', 'X', 'A', 'M', 'B', 'R', 'S', '-', '.'].map(c => [c, count(c)]));
  const alternations = (() => { let n = 0, prev = null; for (const c of strip) { const g = 'FH'.includes(c) ? 'fight' : 'PW'.includes(c) ? 'plat' : 'XAMB'.includes(c) ? 'set' : null; if (g && g !== prev) { n++; prev = g; } } return n; })();
  return {
    id: lv.id, name: lv.name, W, H, tall, strip, marks,
    stats: { routeTiles: total, stretches: nb, bridged, longest: { type: longest.c, stretches: longest.n, tiles: longest.n * STEP, atRoute: longest.at * STEP, x: B[longest.at] && B[longest.at].x },
      empties, maxCheckGap: maxGap, checkGapAtRoute: gapAt, checksOnRoute: checks.length, checksTotal: ents.filter(e => e.t === 'check').length,
      setPieces, setKinds: [...setKinds], ambushes: (L.ambushes || []).map(q => q.name), mini: L.mini ? L.mini.boss : null, boss: A ? A.boss : null, systems,
      backtrack: back, backtrackPct: total ? Math.round(back / total * 100) : 0, backRuns, offRoutePct: reach ? Math.round(off / reach * 100) : 0,
      pockets: pockets.length, offLoot, foesOnRoute: foesOn, foesOffRoute: foesOff, mix, alternations, landingFoes, blindDrops },
    xAt: B.map(b => b.x), yAt: B.map(b => b.y), raw: B.map(b => [+b.threat.toFixed(1), +(b.plat + b.haz).toFixed(1)]),
    route: pts, cum,
  };
}

const LEGEND = 'F fight  P platforming  H both  W swim  A ambush  M mini  B boss  X set-piece  R rest  S quiet+optional  - light  . EMPTY\n' +
  'marks: c checkpoint  s dead-end pocket  $ loot off-route  < route doubles back  ~ bridged ride (the model cannot see it)';
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  console.log('THE PACING MAP — one character per ' + STEP + ' tiles of the main route\n' + LEGEND + '\n');
  const out = [];
  for (const lv of LEVELS) {
    if (lv.hidden && !lv.secret) continue;
    if (want.length && !want.includes(lv.id)) continue;
    let r; try { r = pacing(lv); } catch (e) { console.log('== ' + lv.id + ': failed ' + e.message); continue; }
    out.push(r); const s = r.stats;
    console.log('== ' + r.id.toUpperCase() + '  ' + r.name + '  (' + r.W + 'x' + r.H + (r.tall ? ', tall' : '') + ')  route ' + s.routeTiles + ' tiles' + (s.bridged ? ', ' + s.bridged + ' ride(s) bridged' : ''));
    const CH = 80;
    for (let i = 0; i < r.strip.length; i += CH) {
      console.log('  ' + String(i * STEP).padStart(4) + ' ' + r.strip.slice(i, i + CH) + '   x' + r.xAt[i] + ',y' + r.yAt[i]);
      if (r.marks.slice(i, i + CH).trim()) console.log('       ' + r.marks.slice(i, i + CH));
    }
    const m = s.mix;
    console.log('  mix      fight ' + (m.F + m.H) + '  platform ' + (m.P + m.H + m.W) + '  set-piece ' + (m.X + m.A + m.M + m.B) + '  rest ' + m.R + '  optional ' + m.S + '  light ' + m['-'] + '  EMPTY ' + m['.'] + '   (alternations ' + s.alternations + ')');
    console.log('  longest  ' + s.longest.stretches + ' x "' + s.longest.type + '" = ' + s.longest.tiles + ' tiles from route ' + s.longest.atRoute + ' (x' + s.longest.x + ')');
    console.log('  empty    ' + (s.empties.length ? s.empties.map(e => e.tiles + ' tiles at x' + e.from[0] + ',y' + e.from[1] + '..x' + e.to[0] + ',y' + e.to[1]).join('; ') : 'none of ' + EMPTY_RUN + '+ tiles'));
    console.log('  checks   ' + s.checksOnRoute + '/' + s.checksTotal + ' on the route, worst gap ' + s.maxCheckGap + ' route tiles (from route ' + s.checkGapAtRoute + ')');
    console.log('  set      ' + s.setPieces + ' distinct: ' + [...s.setKinds, ...s.ambushes.map(a => 'ambush ' + a), s.mini ? 'mini ' + s.mini : null, s.boss ? 'boss ' + s.boss : null].filter(Boolean).join(', '));
    console.log('  systems  ' + (s.systems.join(', ') || '-'));
    console.log('  back     ' + s.backtrack + ' tiles against the direction of travel (' + s.backtrackPct + '%)' + (s.backRuns.length ? ': ' + s.backRuns.slice(0, 5).map(b => b.tiles + ' from x' + b.from[0] + ',y' + b.from[1]).join('; ') : ''));
    console.log('  landings ' + s.landingFoes.length + ' with a creature within 2 tiles' + (s.landingFoes.length ? ': ' + s.landingFoes.slice(0, 8).join(' ') : '') + '   blind drops (8+ rows) ' + s.blindDrops.length + (s.blindDrops.length ? ': ' + s.blindDrops.slice(0, 6).join(' ') : ''));
    console.log('  optional ' + s.offRoutePct + '% of reachable footing is off the route, ' + s.pockets + ' dead-end pocket(s), loot off-route: ' + (s.offLoot.join(' ') || '-'));
    console.log('');
  }
  if (args.includes('--calib')) { const th = out.flatMap(r => r.raw.map(q => q[0])).sort((a, b) => a - b), pl = out.flatMap(r => r.raw.map(q => q[1])).sort((a, b) => a - b);
    const pc = (a, p) => a[Math.min(a.length - 1, Math.floor(a.length * p))];
    console.log('threat per stretch  p25 ' + pc(th, .25) + '  p50 ' + pc(th, .5) + '  p60 ' + pc(th, .6) + '  p75 ' + pc(th, .75) + '  p90 ' + pc(th, .9));
    console.log('platform+hazard     p25 ' + pc(pl, .25) + '  p50 ' + pc(pl, .5) + '  p60 ' + pc(pl, .6) + '  p75 ' + pc(pl, .75) + '  p90 ' + pc(pl, .9)); }
  if (jsonOut) { writeFileSync(jsonOut, JSON.stringify(out.map(r => ({ ...r, cum: undefined })))); console.log('wrote ' + jsonOut); }
}
