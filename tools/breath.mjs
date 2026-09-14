// tools/breath.mjs — HOW LONG IS THE LONGEST BREATH YOU HAVE TO HOLD?
// A level whose rule is AIR is a level of distances, and nobody had measured one. The knight holds a full breath for
// SIX SECONDS (main.js: breathMax), it drains a second a second once his head is more than 24 px under, and he swims
// 96 px a second sideways, 140 down and 190 up. This lays every air source the running game knows about over the
// water - the holds (L.airRooms), the bells, the pockets, vents, clams, bulbs and bell-wrecks of src/deepair.js, the
// surface and every dry tile - and asks two questions of the water between them:
//   REQUIRED  of every way from the start to the end, which has the SHORTEST longest-leg? That leg is the breath the
//             level demands of you, whichever way you go. (A widest-path search over the air sources.)
//   OPTIONAL  for every coin, silver and quest item under water: out from the nearest air and back to any air.
// Both are printed as seconds and as a share of a full breath. Swim times are straight-line best cases through open
// water; a fight on the way is extra. Clams and bulbs count as air where they sit: struck, they give it there.
//   node tools/breath.mjs [levelId=deep] [-v]
import { LEVELS, T } from '../src/level.js';
import { airBoxes } from '../src/deepair.js';

const TS = 16, want = process.argv[2] && !process.argv[2].startsWith('-') ? process.argv[2] : 'deep', verbose = process.argv.includes('-v');
const BREATH = 6, SIDE = 16 / 96, DOWN = 16 / 140, UP = 16 / 190;
const lv = LEVELS.find(l => l.id === want); if (!lv) { console.log('no level ' + want); process.exit(1); }
const L = lv.build(), W = L.W, H = L.H, g = L.grid;
const solid = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.WEB || t === T.CLIMB;
const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
const pools = (L.pools || []).filter(p => p.swim && !p.dry);
/* the pool the loop would find for feet at this cell (main.js: the first swim pool the feet are inside) */
const poolAt = (x, y) => { const fx = x * TS + 8, fy = (y + 1) * TS; return pools.find(p => fx > p.x0 && fx < p.x1 && fy > p.y + 8 && (p.bottom === undefined || fy <= p.bottom + 4)); };
/* a body is two tiles tall: a cell is somewhere to be if it and the one over it are open */
const open = (x, y) => !solid(at(x, y)) && !solid(at(x, y - 1));
const boxes = airBoxes(L);
const inAir = (x, y) => { const fx = x * TS + 8, fy = (y + 1) * TS, hy = fy - 8;   /* nearAir is asked at the feet minus eight */
  for (const b of boxes) if (fx > b.l && fx < b.r && hy > b.t && hy < b.b) return true;
  return false; };
const N = W * H, cell = new Int8Array(N);   /* 0 rock, 1 water, 2 air (dry or a source) */
for (let y = 1; y < H; y++) for (let x = 0; x < W; x++) { if (!open(x, y)) continue; const p = poolAt(x, y);
  if (!p) { cell[y * W + x] = 2; continue; }
  const under = p.capped ? 99 : (y + 1) * TS - p.y;
  cell[y * W + x] = under <= 24 || inAir(x, y) ? 2 : 1; }
/* air blobs: connected air cells are one place to breathe */
const blob = new Int32Array(N).fill(-1); let nb = 0; const blobCells = [];
for (let i = 0; i < N; i++) if (cell[i] === 2 && blob[i] < 0) { const st = [i], cells = []; blob[i] = nb;
  while (st.length) { const j = st.pop(); cells.push(j); const x = j % W, y = (j / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (y + dy) * W + x + dx; if (x + dx >= 0 && x + dx < W && y + dy >= 0 && y + dy < H && cell[k] === 2 && blob[k] < 0) { blob[k] = nb; st.push(k); } } }
  blobCells.push(cells); nb++; }
/* a heap for Dijkstra */
class Heap { constructor() { this.a = []; } push(k, v) { const a = this.a; a.push([k, v]); let i = a.length - 1; while (i) { const p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() { const a = this.a, top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top; } get size() { return this.a.length; } }
const step = (dx, dy) => dy === 0 ? SIDE : dx === 0 ? (dy > 0 ? DOWN : UP) : Math.max(SIDE, dy > 0 ? DOWN : UP);
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
/* from a set of cells, time through WATER to every other cell (air cells are reached but not crossed) */
function flood(srcCells, reverse = false) {
  const dist = new Float64Array(N).fill(Infinity), h = new Heap();
  for (const i of srcCells) { dist[i] = 0; h.push(0, i); }
  while (h.size) { const [d, i] = h.pop(); if (d > dist[i]) continue; const x = i % W, y = (i / W) | 0;
    if (d > 0 && cell[i] === 2) continue;   /* breathing again: the leg ends here */
    for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const k = ny * W + nx; if (!cell[k]) continue;
      if (dx && dy && (!cell[y * W + nx] || !cell[ny * W + x])) continue;   /* no squeezing past a corner */
      const nd = d + (reverse ? step(-dx, -dy) : step(dx, dy)); if (nd < dist[k]) { dist[k] = nd; h.push(nd, k); } } }
  return dist; }
/* the leg graph: every blob to every blob it can swim to without breathing in between */
const legs = Array.from({ length: nb }, () => new Map());
for (let b = 0; b < nb; b++) { const d = flood(blobCells[b]);
  for (let c = 0; c < nb; c++) if (c !== b) { let best = Infinity; for (const i of blobCells[c]) if (d[i] < best) best = d[i]; if (best < Infinity) legs[b].set(c, best); } }
const blobOf = (x, y) => { for (let r = 0; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const k = (y + dy) * W + x + dx; if (blob[k] >= 0) return blob[k]; } return -1; };
const centre = b => { let sx = 0, sy = 0; for (const i of blobCells[b]) { sx += i % W; sy += (i / W) | 0; } return [Math.round(sx / blobCells[b].length), Math.round(sy / blobCells[b].length)]; };
/* REQUIRED: the widest path - minimise the longest leg - from the start to the arena door */
/* THE END is the arena's DOOR, three tiles outside its left wall on its floor - the breath of the fight is the arena's own
   question, answered below - or the far end of a level with no arena */
const A = L.arena, endX = A ? Math.floor(A.x0 / TS) - 3 : W - 8, endY = A ? Math.floor(A.floor / TS) - 1 : 0;
const s0 = blobOf(L.START.x, L.START.y);
const toDoor = flood([endY * W + endX], true);   /* time from every cell to the door, through water */
let e0 = -1, lastLeg = Infinity;
const worst = new Float64Array(nb).fill(Infinity), prev = new Int32Array(nb).fill(-1), done = new Uint8Array(nb);
worst[s0] = 0; for (;;) { let u = -1; for (let b = 0; b < nb; b++) if (!done[b] && worst[b] < Infinity && (u < 0 || worst[b] < worst[u])) u = b; if (u < 0) break; done[u] = 1;
  for (const [v, t] of legs[u]) { const w2 = Math.max(worst[u], t); if (w2 < worst[v]) { worst[v] = w2; prev[v] = u; } } }
for (let b = 0; b < nb; b++) { if (worst[b] === Infinity) continue; let d = Infinity; for (const i of blobCells[b]) if (toDoor[i] < d) d = toDoor[i];
  if (d < Infinity && Math.max(worst[b], d) < Math.max(e0 < 0 ? Infinity : worst[e0], lastLeg)) { e0 = b; lastLeg = d; } }
const pct = s => Math.round(100 * s / BREATH) + '%';
console.log('== ' + want + ': ' + nb + ' places to breathe (' + boxes.length + ' air boxes), a full breath is ' + BREATH + 's');
if (e0 < 0 || worst[e0] === Infinity) console.log('REQUIRED: the end is not reachable through the water from the start');
else { const path = []; for (let b = e0; b >= 0; b = prev[b]) path.unshift(b);
  let wl = lastLeg, wAt = [centre(e0), [endX, endY]]; for (let i = 1; i < path.length; i++) { const t = legs[path[i - 1]].get(path[i]); if (t > wl) { wl = t; wAt = [centre(path[i - 1]), centre(path[i])]; } }
  console.log('REQUIRED  worst leg ' + wl.toFixed(2) + 's (' + pct(wl) + ')  from ' + wAt[0] + ' to ' + wAt[1] + ', over ' + (path.length - 1) + ' legs');
  if (verbose) { const legsOut = []; for (let i = 1; i < path.length; i++) { const t = legs[path[i - 1]].get(path[i]); if (t > 0.9) legsOut.push(centre(path[i - 1]) + '->' + centre(path[i]) + ' ' + t.toFixed(2) + 's'); } console.log('  legs over 0.9s: ' + legsOut.join(' | ')); } }
/* OPTIONAL: every pickup in the water, out and back */
const fwd = flood(blobCells.flat()), back = flood(blobCells.flat(), true);
const items = (L.ents || []).filter(e => e.t === 'coin' || e.t === 'silver' || e.t === 'stray');
const rows = [];
for (const e of items) { const i = e.y * W + e.x; if (cell[i] !== 1) continue; const t = fwd[i] + back[i]; if (t < Infinity) rows.push({ t, e }); }
rows.sort((a, b) => b.t - a.t);
const over = rows.filter(r => r.t > BREATH * 0.9);
console.log('OPTIONAL  ' + rows.length + ' pickups under water; worst round trip ' + (rows[0] ? rows[0].t.toFixed(2) + 's (' + pct(rows[0].t) + ') for the ' + rows[0].e.t + ' at ' + rows[0].e.x + ',' + rows[0].e.y : 'none') + '; ' + over.length + ' over 90%');
if (verbose) for (const r of rows.slice(0, 8)) console.log('  ' + r.e.t.padEnd(7) + (r.e.x + ',' + r.e.y).padEnd(9) + r.t.toFixed(2) + 's ' + pct(r.t));
/* and the worst spot in the open water: the furthest any swimmable cell is from its nearest air, out and back */
let far = 0, farAt = null; for (let i = 0; i < N; i++) if (cell[i] === 1 && fwd[i] + back[i] < Infinity && fwd[i] + back[i] > far) { far = fwd[i] + back[i]; farAt = [i % W, (i / W) | 0]; }
console.log('DEEPEST   the furthest water from air is ' + farAt + ': ' + far.toFixed(2) + 's there and back (' + pct(far) + ')');
/* THE FIGHT: the furthest any water between the arena's walls is from a breath, out and back */
if (A && A.wallL !== undefined) { let aw = 0, aAt = null; const ay0 = Math.floor((A.y0 !== undefined ? A.y0 : A.floor - 320) / TS);
  for (let y = ay0; y < Math.floor(A.floor / TS); y++) for (let x = A.wallL + 1; x < A.wallR; x++) { const i = y * W + x; if (cell[i] === 1 && fwd[i] + back[i] < Infinity && fwd[i] + back[i] > aw) { aw = fwd[i] + back[i]; aAt = [x, y]; } }
  console.log('ARENA     the furthest water in the fight from air is ' + aAt + ': ' + aw.toFixed(2) + 's there and back (' + pct(aw) + ')'); }
