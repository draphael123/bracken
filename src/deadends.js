// src/deadends.js — WHERE DOES THE WALK GO FOR NOTHING?
// "Whenever there's a dead end like this, like in the deep, there needs to be some type of collectible." The old finder
// walked floors and called a floor under swim water a riverbed you swim up off anywhere, so every flooded tunnel read as
// having a way on along its whole length; it let a lone coin or a sign pay forty tiles; and it never saw a ledge. It
// found three dead ends in the whole game. This one asks the movement graph instead, and it is shared: the build pass in
// src/level.js (payDeadEnds) pays what it finds, and tools/deadends.mjs (npm run check) fails on anything left unpaid.
//
// HOW. Every tile the reach fill (src/reachcore.js, with rides) can stand or swim in is a node; every move between two of
// them is an edge, both ways. The DETOUR of a tile is how far out of your way it is: distance from the start + distance
// to the goal - the length of the best route. Walk into a pocket that ends at a wall and the detour climbs by two a tile
// (in, and back out again); walk a loop or a ledge that drops you on ahead and it stays flat. So a dead end is a PEAK of
// detour, and how far it stands above the junction it hangs off (its prominence, halved) is how many tiles you travel
// past the last way on. Peaks are found the way a map finds mountains: tiles from highest detour down, joined into
// components, and a component dies (is a pocket) when it runs into a higher one.
// What is NOT a dead end: an open room (the far corner of the trench is not a corridor), a boss or mini arena or an
// ambush room, the few tiles behind the start, anything with a doorway, gate, keeper or lever in it (that is the point
// of going), and anything under five tiles.
// What PAYS: a silver, a quest stray, a relic, a key, a heart put down for good ('mend'), or a cache of four coins or
// more - within reach of the last six tiles of the pocket. A single coin or a sign does not.
import { floodReach } from './reachcore.js';

const TS = 16;
export const DEADEND_MIN = 5;          /* tiles past the last way on before a pocket has to pay */
export const CACHE_COINS = 4;          /* a coin cache is this many at the far end */
const POINT = new Set(['doorway', 'gate', 'lockgate', 'npc', 'shop', 'lever', 'exit', 'shrine', 'winch', 'crank']);
const ANCHOR = new Set(['check', 'sign', 'stray', 'silver', 'key', 'relic', 'npc', 'gate', 'doorway']);
export const LOOT = new Set(['silver', 'stray', 'relic', 'key', 'mend']);

export function findDeadEnds(L, T, opts = {}) {
  const MIN = opts.min || DEADEND_MIN;
  const W = L.W, H = L.H, N = W * H, ents = L.ents || [];
  const R = floodReach(L, T, { rides: true });
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x];
  const solid = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.WEB || t === T.CLIMB;
  const stand = t => solid(t) || t === T.ONEWAY || t === T.PLANK || t === T.SHELF || t === T.RAIL || t === T.BOUNCER || t === T.REED || t === T.CRYST || t === T.NET;
  const parse = k => { const c = k.indexOf(','); return [+k.slice(0, c), +k.slice(c + 1)]; };
  const foot = new Uint8Array(N), node = new Uint8Array(N);
  for (const k of R.footing) { const [x, y] = parse(k); if (x >= 0 && y >= 0 && x < W && y < H) foot[y * W + x] = 1; }
  for (const k of R.seen) { const [x, y] = parse(k); if (x >= 0 && y >= 0 && x < W && y < H && foot[y * W + x]) node[y * W + x] = 1; }
  const settle = (x, y) => { x = Math.max(0, Math.min(W - 1, x)); let yy = Math.max(0, y); while (yy < H - 1 && !foot[yy * W + x]) yy++; return foot[yy * W + x] ? yy * W + x : -1; };

  // THE WATER, as the reach fill counts it (so a pocket can say it is a swim)
  const water = new Uint8Array(N);
  for (const p of (L.pools || [])) { if (!p.swim || p.arenaTide) continue; const topPx = p.streetTide ? p.base + p.tideHi : p.y; const r0 = Math.floor(topPx / TS), r1 = Math.floor(((p.bottom ?? topPx + 64) - 1) / TS);
    for (let x = Math.max(0, Math.floor(p.x0 / TS)); x < Math.min(W, Math.ceil(p.x1 / TS)); x++) for (let y = Math.max(0, r0); y <= Math.min(H - 1, r1); y++) water[y * W + x] = 1; }

  // THE GOAL: the gate, or the middle of the boss floor
  const A = L.arena, gate = ents.find(e => e.t === 'gate');
  const goalXY = gate ? [gate.x, gate.y] : A ? [Math.round((A.x0 + A.x1) / 2 / TS), Math.round(A.floor / TS) - 1] : null;

  // A RIDE THE MODEL CANNOT FOLLOW still goes somewhere: ground the level put a checkpoint, a sign or a quest item on is
  // ground you are meant to reach, so it is filled forward from there too (roofs have nothing on them and stay out)
  const fwd = start => { const st = [start]; node[start] = 1;
    while (st.length) { const u = st.pop(); R.expand(u % W, (u / W) | 0, (nx, ny) => { if (nx < 0 || ny < 0 || nx >= W || ny >= H) return; const v = ny * W + nx; if (foot[v] && !node[v]) { node[v] = 1; st.push(v); } }); } };
  for (const e of ents) if (ANCHOR.has(e.t)) { const s = settle(e.x, e.y); if (s >= 0 && !node[s]) fwd(s); }
  if (goalXY) { const s = settle(goalXY[0], goalXY[1]); if (s >= 0 && !node[s]) fwd(s); }

  // EVERY MOVE, BOTH WAYS, weighted by the tiles it covers
  const eu = [], ev = [], ew = [], stamp = new Int32Array(N).fill(-1);
  const list = []; for (let i = 0; i < N; i++) if (node[i]) list.push(i);
  for (const u of list) { const ux = u % W, uy = (u / W) | 0;
    R.expand(ux, uy, (nx, ny) => { if (nx < 0 || ny < 0 || nx >= W || ny >= H) return; const v = ny * W + nx; if (v === u || !node[v] || stamp[v] === u) return; stamp[v] = u;
      eu.push(u); ev.push(v); ew.push(Math.min(16, Math.max(1, Math.abs(nx - ux), Math.abs(ny - uy)))); }); }
  const deg = new Int32Array(N + 1); for (let i = 0; i < eu.length; i++) { deg[eu[i] + 1]++; deg[ev[i] + 1]++; }
  for (let i = 0; i < N; i++) deg[i + 1] += deg[i];
  const adj = new Int32Array(deg[N]), wgt = new Uint8Array(deg[N]), fill = deg.slice(0, N);
  for (let i = 0; i < eu.length; i++) { adj[fill[eu[i]]] = ev[i]; wgt[fill[eu[i]]++] = ew[i]; adj[fill[ev[i]]] = eu[i]; wgt[fill[ev[i]]++] = ew[i]; }
  const extra = new Map();   /* bridges from ground only a ride reaches */
  const each = (u, f) => { for (let j = deg[u]; j < deg[u + 1]; j++) f(adj[j], wgt[j]); const x = extra.get(u); if (x) for (const [v, w] of x) f(v, w); };
  const dijk = srcs => { const d = new Float64Array(N).fill(Infinity), B = [];
    for (const s of srcs) { d[s] = 0; (B[0] ||= []).push(s); }
    for (let k = 0; k < B.length; k++) { const b = B[k]; if (!b) continue; B[k] = null;
      for (const u of b) { if (d[u] !== k) continue; each(u, (v, w) => { const nd = k + w; if (nd < d[v]) { d[v] = nd; (B[nd] ||= []).push(v); } }); } }
    return d; };
  const nearestNode = (x, y) => { let best = -1, bd = 1e9; for (const i of list) { const dd = Math.abs(i % W - x) + Math.abs(((i / W) | 0) - y); if (dd < bd) { bd = dd; best = i; } } return best; };
  const s0 = node[settle(L.START.x, L.START.y)] ? settle(L.START.x, L.START.y) : nearestNode(L.START.x, L.START.y);
  let dS = dijk([s0]);
  for (let pass = 0; pass < 6; pass++) {
    const far = list.filter(i => dS[i] === Infinity); if (!far.length) break;
    const near = list.filter(i => dS[i] !== Infinity), seenC = new Uint8Array(N);
    for (const f of far) { if (seenC[f]) continue;
      const comp = [], st = [f]; seenC[f] = 1; while (st.length) { const u = st.pop(); comp.push(u); each(u, v => { if (!seenC[v] && dS[v] === Infinity) { seenC[v] = 1; st.push(v); } }); }
      let bu = -1, bv = -1, bd = 1e9;
      for (const u of comp) { const ux = u % W, uy = (u / W) | 0; for (const v of near) { const dd = Math.max(Math.abs(v % W - ux), Math.abs(((v / W) | 0) - uy)); if (dd < bd) { bd = dd; bu = u; bv = v; } } }
      if (bu < 0) continue; const w = Math.min(16, Math.max(1, bd));
      if (!extra.has(bu)) extra.set(bu, []); if (!extra.has(bv)) extra.set(bv, []); extra.get(bu).push([bv, w]); extra.get(bv).push([bu, w]); }
    dS = dijk([s0]); }
  const g0 = goalXY ? (node[settle(goalXY[0], goalXY[1])] ? settle(goalXY[0], goalXY[1]) : nearestNode(goalXY[0], goalXY[1])) : -1;
  if (g0 < 0) return { pockets: [], skipped: [], why: 'no goal' };
  const dG = dijk([g0]), D = dS[g0];

  // WHERE A POCKET IS NOT A POCKET: the fights that lock you in, and the start
  const rooms = [L.arena, L.mini].filter(Boolean).map(Q => [Q.x0 / TS - 2, Q.x1 / TS + 2, Q.y0 !== undefined ? Q.y0 / TS - 1 : Q.floor / TS - 16, (Q.y1 !== undefined ? Q.y1 / TS : Q.floor / TS) + 2])
    .concat((L.ambushes || []).map(Q => [Q.wallL - 1, Q.wallR + 1, (Q.y0 !== undefined ? Q.y0 : Q.row - 9) - 1, Q.row + 2]));
  const excluded = (x, y) => rooms.some(([a, b, c, d]) => x >= a && x <= b && y >= c && y <= d) || (Math.abs(x - L.START.x) <= 8 && Math.abs(y - L.START.y) <= 8);
  const det = new Float64Array(N);
  /* AND PAST THE GOAL: a tile whose best way from the start already runs through the goal (the walk on past the boss to
     whoever waits there) is not out of anyone's way - the level is over by then */
  for (const i of list) { const x = i % W, y = (i / W) | 0; det[i] = (dS[i] === Infinity || dG[i] === Infinity || excluded(x, y) || dS[i] - dG[i] >= D - 2) ? 0 : Math.max(0, dS[i] + dG[i] - D); }

  // THE PEAKS: highest detour first, joined as they touch; the lower of two meeting components is a pocket
  const order = list.slice().sort((a, b) => det[b] - det[a] || a - b);
  const parent = new Int32Array(N).fill(-1), peak = new Int32Array(N), mem = new Map(), raw = [];
  const find = u => { while (parent[u] !== u) { parent[u] = parent[parent[u]]; u = parent[u]; } return u; };
  for (const u of order) { parent[u] = u; peak[u] = u; mem.set(u, [u]);
    each(u, v => { if (parent[v] < 0) return; let ru = find(u), rv = find(v); if (ru === rv) return;
      const hi = (det[peak[ru]] > det[peak[rv]] || (det[peak[ru]] === det[peak[rv]] && peak[ru] < peak[rv])) ? ru : rv, lo = hi === ru ? rv : ru;
      const prom = det[peak[lo]] - det[u];
      if (prom >= 2 * MIN) raw.push({ peak: peak[lo], saddle: u, prom, cells: mem.get(lo).slice() });
      const a = mem.get(hi), b = mem.get(lo); if (a.length >= b.length) { for (const c of b) a.push(c); } else { for (const c of a) b.push(c); mem.set(hi, b); }
      mem.delete(lo); parent[lo] = hi; }); }
  for (const [r, cells] of mem) if (parent[r] === r && det[peak[r]] >= 2 * MIN) raw.push({ peak: peak[r], saddle: -1, prom: det[peak[r]], cells: cells.slice() });

  const coinsAt = new Map(); for (const e of ents) if (e.t === 'coin' || LOOT.has(e.t)) { const k = e.x + ',' + e.y; if (!coinsAt.has(k)) coinsAt.set(k, []); coinsAt.get(k).push(e); }
  const pockets = [], skipped = [];
  for (const P of raw) {
    const p = P.peak, px = p % W, py = (p / W) | 0, len = Math.round(P.prom / 2);
    const inCells = new Set(P.cells);
    /* THE LAST TEN TILES, as ground joined to the far end - not every tile of the same detour anywhere in the component,
       which gathered the far corners of the trench into the Deep's flooded tunnel and called it a room */
    const saddleDet = P.saddle >= 0 ? det[P.saddle] : 0;
    /* flood from the far end over the pocket's own tiles, above its junction and within reach of the end: a short pocket
       hanging straight off the route has a junction at nothing, and without the floor and the radius it flooded the level */
    const flood = (floor, rad) => { const out = [], seen2 = new Uint8Array(N); seen2[p] = 1;
      for (const st = [p]; st.length;) { const u = st.pop(); out.push(u);
        each(u, v => { if (seen2[v] || !inCells.has(v) || det[v] < floor || Math.max(Math.abs(v % W - px), Math.abs(((v / W) | 0) - py)) > rad) return; seen2[v] = 1; st.push(v); }); }
      return out; };
    const top = flood(Math.max(det[p] - 2 * Math.min(len, 10), saddleDet + 1), 14);
    // A CORRIDOR, NOT A ROOM. Only water makes a room (footing on land is a line however the ledges stack): along its last
    // ten tiles a swim is no more than eight tiles of water thick one way or the other
    const cc = new Map(), rc = new Map(); let x0 = W, x1 = 0, y0 = H, y1 = 0;
    for (const c of top) { const x = c % W, y = (c / W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      if (water[c]) { cc.set(x, (cc.get(x) || 0) + 1); rc.set(y, (rc.get(y) || 0) + 1); } }
    let vert = 0, horiz = 0; for (const [, n] of cc) vert = Math.max(vert, n); for (const [, n] of rc) horiz = Math.max(horiz, n);
    const where = { x: px, y: py, len, det: det[p], saddleDet };
    if (Math.min(vert, horiz) > 8) { skipped.push({ ...where, why: 'open water ' + vert + 'x' + horiz + ' top ' + top.length + ' cells ' + P.cells.length }); continue; }
    /* A POCKET YOU CAN WALK: a perch a ride drops you on is two tiles, however far the bridge to it says it is */
    if (Math.max(x1 - x0, y1 - y0) < DEADEND_MIN - 1) { skipped.push({ ...where, why: 'too small ' + (x1 - x0 + 1) + 'x' + (y1 - y0 + 1) }); continue; }
    /* A DOOR, A GATE, A KEEPER OR A LEVER AT THE END IS WHY YOU WENT: one halfway along does not pay the tail past it */
    const topSet = new Set(top);
    const pointHere = ents.find(e => POINT.has(e.t) && [-1, 0, 1].some(dx => [-1, 0, 1, 2].some(dy => { const x = e.x + dx, y = e.y + dy; return x >= 0 && y >= 0 && x < W && y < H && topSet.has(y * W + x); })));
    if (pointHere) { skipped.push({ ...where, why: 'has a ' + pointHere.t }); continue; }
    // THE FAR END: the last six tiles, joined to the end and near it, nearest the wall first
    const zone = flood(Math.max(det[p] - 12, saddleDet + 1), 8).sort((a, b) => det[b] - det[a] || a - b);
    const zset = new Set(zone);
    const found = []; const seenE = new Set();
    for (const c of zone) { const zx = c % W, zy = (c / W) | 0;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -3; dy <= 1; dy++) { const list2 = coinsAt.get((zx + dx) + ',' + (zy + dy)); if (list2) for (const e of list2) if (!seenE.has(e)) { seenE.add(e); found.push(e); } } }
    const coins = found.filter(e => e.t === 'coin').length, loot = found.filter(e => LOOT.has(e.t));
    const wet = top.filter(c => water[c]).length * 2 >= top.length;
    const ledge = top.filter(c => { const x = c % W, y = (c / W) | 0; if (water[c]) return false;
      return [-1, 1].some(dx => { if (solid(at(x + dx, y))) return false; for (let k = 1; k <= 5; k++) if (stand(at(x + dx, y + k))) return false; return true; }); }).length;
    const kind = wet ? 'water' : ledge * 3 >= top.length ? 'air' : 'land';
    let spikes = 0; for (const c of P.cells) { const x = c % W, y = (c / W) | 0; for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [0, 0]]) if (at(x + dx, y + dy) === T.SPIKE) spikes++; }
    const wall = solid(at(px + 1, py)) || solid(at(px - 1, py));
    pockets.push({ ...where, kind, wall, spikes, danger: spikes > 0 || (wet && len >= 10), paid: loot.length > 0 || coins >= CACHE_COINS,
      coins, loot: loot.map(e => e.t), cells: P.cells.length, saddle: P.saddle >= 0 ? [P.saddle % W, (P.saddle / W) | 0] : null,
      zone: zone.map(c => [c % W, (c / W) | 0, water[c] ? 1 : 0]), inZone: (x, y) => zset.has(y * W + x) });
  }
  pockets.sort((a, b) => (a.y - b.y) || (a.x - b.x));
  return { pockets, skipped, assisted: R.assisted, stats: { nodes: list.length, seen: R.seen.size, D, infS: list.filter(i => dS[i] === Infinity).length, infG: list.filter(i => dG[i] === Infinity).length, start: [s0 % W, (s0 / W) | 0], goal: [g0 % W, (g0 / W) | 0], raw: raw.length } };
}
