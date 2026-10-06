// underwell_dress.js - THE UNDERWELL's DRESSING and what holds its ledges up (claude/underwellart). Art only: nothing here is a tile, an entity or a number - it is read OFF the built grid
// and drawn behind the heroes, so the level hash, the routes and the marks do not move.
//   FLOORS   oil drums (upright, oil-streaked, toppled and leaking), clay amphorae, pipe stubs with brass valve wheels, brass spigots on pedestals, lamp racks, rope coils, rubble, scorpion
//            husks and claw-gouges, egg-sac clusters round the nests and the brood chambers, silt mounds in the sump, a broken pillar stump, the well-keeper's bucket
//   CEILINGS riveted pipe runs with flanges and brass valves, chains, unlit bronze lamps hung on them, cobwebs in the corners
//   WALLS    vertical pipes, damp streaks with a limescale tail, candle niches (a lit stub in a recess: a real light), claw-gouges, egg-sacs
//   SUPPORTS every ledge (ONEWAY run) is either keyed into the rock at an end (a stone corbel / an iron bracket) or stands on a post or hangs from chains to the ceiling:
//            planSupports() is what tools/underwell-aloft.mjs measures - NOTHING FLOATS (copy of the unburied-aloft / moor-aloft idea)
// planDress(L, T) -> { items, supports, candles }  (cached on the level)   drawDress(g, cx, cy, VW, time, plan)
import { canvas, rect, px, mulberry, outline } from '../px.js';
import { UC, hash, zoneOf } from './underwell_tiles.js';
const TS = 16, OUTC = '#0a0807';
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const P = (g, x, y, c) => px(g, x, y, c);
const ell = (g, cx, cy, rx, ry, col) => { for (let dy = -ry; dy <= ry; dy++) { const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry || 1)))); rect(g, cx - hw, cy + dy, hw * 2 + 1, 1, col); } };

/* ----------------------------------------------------------------- THE SPRITES ----------------------------------------------------------------- */
const SPR = {
  drum(v) { const [c, g] = canvas(12, 16);
    rect(g, 1, 1, 10, 14, '#4e4036'); rect(g, 1, 1, 2, 14, '#7a6652'); rect(g, 2, 1, 1, 14, '#9a8468'); rect(g, 9, 1, 2, 14, '#2c241e');
    for (const by of [4, 11]) { rect(g, 1, by, 10, 2, '#2a211c'); rect(g, 1, by, 10, 1, '#6a5848'); }
    rect(g, 1, 1, 10, 2, '#6a5a4a'); rect(g, 1, 1, 10, 1, '#a89478'); rect(g, 5, 7, 2, 2, '#a4742a'); P(g, 5, 7, '#fcdc84');
    if (v & 1) { rect(g, 1, 1, 10, 3, UC.o1); rect(g, 1, 1, 10, 1, UC.o4); P(g, 4, 2, UC.o5); for (let k = 3; k < 11; k++) rect(g, 3, k, 2, 1, k > 8 ? UC.o2 : UC.o0); rect(g, 6, 3, 1, 5, UC.o1); }
    else { for (const [x, y] of [[4, 6], [8, 9], [3, 13], [7, 3]]) P(g, x, y, '#7a3a1a'); }
    return outline(c, OUTC); },
  drumTip() { const [c, g] = canvas(22, 13);
    ell(g, 10, 11, 10, 1, UC.o1); rect(g, 2, 11, 16, 1, UC.o0); P(g, 5, 11, UC.o5); P(g, 12, 11, UC.o4);
    rect(g, 3, 3, 14, 8, '#4e4036'); rect(g, 3, 3, 14, 2, '#7a6652'); rect(g, 3, 9, 14, 2, '#2c241e'); rect(g, 6, 3, 2, 8, '#2a211c'); rect(g, 12, 3, 2, 8, '#2a211c');
    rect(g, 16, 4, 2, 6, '#6a5a4a'); rect(g, 17, 5, 1, 4, UC.o0); rect(g, 1, 5, 3, 4, '#3a3028'); rect(g, 18, 8, 3, 3, UC.o1); P(g, 19, 9, UC.o4); P(g, 20, 10, UC.o2);
    return outline(c, OUTC); },
  amph(v) { const [c, g] = canvas(12, 15);
    const body = v & 1 ? ['#8a4a2e', '#b87048', '#4a2214'] : ['#a65e3a', '#d28c5a', '#5a2e1c'];
    ell(g, 6, 9, 4, 5, body[0]); rect(g, 3, 9, 1, 3, body[1]); rect(g, 8, 8, 1, 5, body[2]); rect(g, 5, 2, 3, 3, body[0]); rect(g, 4, 1, 5, 1, body[1]); rect(g, 5, 4, 1, 2, body[1]); rect(g, 2, 3, 1, 4, body[2]); rect(g, 10, 3, 1, 4, body[2]);
    rect(g, 4, 7, 5, 1, body[2]); P(g, 4, 6, body[1]);
    if (v & 2) { rect(g, 4, 1, 5, 2, 'rgba(0,0,0,0)'); P(g, 4, 1, 'rgba(0,0,0,0)'); g.clearRect(5, 1, 2, 1); P(g, 7, 2, UC.s0); P(g, 5, 5, UC.s0); }
    return outline(c, OUTC); },
  pipeStub() { const [c, g] = canvas(10, 20);
    rect(g, 3, 4, 4, 16, '#34343e'); rect(g, 3, 4, 1, 16, '#6a6a78'); rect(g, 6, 4, 1, 16, '#14141a'); rect(g, 2, 8, 6, 2, '#2c2c36'); rect(g, 2, 8, 6, 1, '#8282a0');
    rect(g, 2, 14, 6, 2, '#2c2c36'); rect(g, 2, 14, 6, 1, '#8282a0'); rect(g, 4, 1, 2, 4, '#6c4a10'); rect(g, 0, 0, 10, 2, '#a4742a'); rect(g, 0, 0, 10, 1, '#fcdc84'); P(g, 0, 1, '#6c4a10'); P(g, 9, 1, '#6c4a10');
    P(g, 3, 18, '#3a1c0c'); P(g, 6, 12, '#3a1c0c'); return outline(c, OUTC); },
  spigot() { const [c, g] = canvas(14, 16);
    rect(g, 1, 9, 12, 6, '#5a5044'); rect(g, 1, 9, 12, 1, '#9a8c78'); rect(g, 1, 14, 12, 1, '#2a2420'); rect(g, 3, 10, 1, 4, '#3a342c'); rect(g, 9, 10, 1, 4, '#3a342c');
    rect(g, 6, 3, 3, 7, '#a4742a'); rect(g, 6, 3, 1, 7, '#fcdc84'); rect(g, 3, 3, 6, 2, '#a4742a'); rect(g, 3, 3, 6, 1, '#fcdc84'); rect(g, 2, 5, 2, 3, '#a4742a'); rect(g, 4, 0, 4, 2, '#d8a444'); rect(g, 3, 0, 1, 2, '#6c4a10');
    return outline(c, OUTC); },
  rubble() { const [c, g] = canvas(18, 10); const r = mulberry(11);
    for (const [x, y, w, h, col] of [[1, 5, 7, 4, '#4f463d'], [7, 3, 6, 6, '#6a5e50'], [12, 5, 5, 4, '#3b342e'], [4, 2, 5, 3, '#8a7c68'], [10, 1, 3, 3, '#4f463d']]) { rect(g, x, y, w, h, col); rect(g, x, y, w, 1, '#a89a82'); rect(g, x + w - 1, y + 1, 1, h - 1, '#1b1816'); }
    for (let i = 0; i < 5; i++) P(g, 1 + ((r() * 15) | 0), 8, UC.si3); return outline(c, OUTC); },
  husk() { const [c, g] = canvas(16, 9);
    rect(g, 1, 4, 10, 4, '#c8bea0'); rect(g, 1, 4, 10, 1, '#f0e8cc'); rect(g, 1, 7, 10, 1, '#7a7258'); for (let x = 3; x < 11; x += 3) rect(g, x, 4, 1, 4, '#7a7258');
    rect(g, 11, 2, 3, 3, '#c8bea0'); rect(g, 13, 1, 2, 2, '#f0e8cc'); P(g, 14, 0, '#fcdc84'); rect(g, 0, 2, 2, 3, '#c8bea0'); P(g, 0, 1, '#f0e8cc'); P(g, 3, 8, '#7a7258'); P(g, 8, 8, '#7a7258');
    return outline(c, OUTC); },
  rack() { const [c, g] = canvas(16, 20);
    rect(g, 1, 1, 2, 18, '#34343e'); rect(g, 1, 1, 1, 18, '#6a6a78'); rect(g, 13, 1, 2, 18, '#34343e'); rect(g, 13, 1, 1, 18, '#6a6a78'); rect(g, 0, 1, 16, 2, '#2c2c36'); rect(g, 0, 1, 16, 1, '#82829a');
    for (const lx of [3, 7, 11]) { rect(g, lx + 1, 3, 1, 3, '#4a4a56'); rect(g, lx, 6, 3, 5, '#a4742a'); rect(g, lx, 6, 3, 1, '#d8a444'); rect(g, lx + 1, 8, 1, 2, '#1a1006'); rect(g, lx - 1, 11, 5, 1, '#6c4a10'); }
    rect(g, 0, 18, 16, 2, '#2c2c36'); rect(g, 0, 18, 16, 1, '#6a6a78'); return outline(c, OUTC); },
  coil() { const [c, g] = canvas(10, 7); ell(g, 5, 4, 4, 2, UC.h2); ell(g, 5, 3, 3, 1, UC.h4); ell(g, 5, 3, 1, 0, UC.hd); rect(g, 8, 5, 2, 1, UC.h3); rect(g, 1, 4, 8, 1, UC.h1); return outline(c, OUTC); },
  eggs() { const [c, g] = canvas(18, 13);
    const sac = (x, y, rr, lit) => { for (let dy = -rr; dy <= rr; dy++) { const hw = Math.round(rr * Math.sqrt(Math.max(0, 1 - (dy * dy) / (rr * rr)))); rect(g, x - hw, y + dy, hw * 2 + 1, 1, dy < -rr / 3 ? '#e4dcc0' : dy < rr / 3 ? '#bcb498' : '#807a62'); } rect(g, x - 1, y - rr + 1, 2, 1, '#fffae0'); if (lit) { P(g, x - 1, y, '#8fe04a'); P(g, x + 1, y, '#8fe04a'); } };
    sac(5, 8, 4, true); sac(11, 9, 3, false); sac(8, 5, 3, true); sac(14, 6, 2, false); rect(g, 0, 11, 18, 1, '#a8a088');
    g.globalAlpha = 0.6; for (const [x0, y0, x1, y1] of [[1, 2, 5, 5], [16, 1, 12, 5], [9, 0, 8, 3]]) { g.strokeStyle = '#e8e2cc'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0 + 0.5, y0 + 0.5); g.lineTo(x1 + 0.5, y1 + 0.5); g.stroke(); } g.globalAlpha = 1;
    return outline(c, OUTC); },
  mound() { const [c, g] = canvas(24, 8); for (let x = 0; x < 24; x++) { const t = (x - 11.5) / 11.5, h = Math.round(6 * Math.sqrt(Math.max(0, 1 - t * t)) * (0.85 + 0.15 * Math.sin(x * 0.9))); if (h <= 0) continue; rect(g, x, 7 - h, 1, h, UC.si2); rect(g, x, 7 - h, 1, 1, UC.si5); if (h > 2) rect(g, x, 8 - h, 1, 1, UC.si4); rect(g, x, 6, 1, 1, UC.si1); }
    P(g, 6, 5, '#c8bea0'); P(g, 7, 5, '#c8bea0'); return outline(c, '#1c140c'); },
  stump() { const [c, g] = canvas(16, 24);
    rect(g, 2, 6, 12, 17, '#3a322a'); rect(g, 2, 6, 2, 17, '#6a5e50'); rect(g, 12, 6, 2, 17, '#1b1816'); rect(g, 6, 10, 1, 12, '#2a2420'); rect(g, 9, 10, 1, 12, '#2a2420'); rect(g, 2, 14, 12, 1, '#1b1816');
    rect(g, 2, 6, 3, 1, '#a89a82'); for (const [x, y] of [[4, 5], [6, 4], [8, 5], [10, 3], [12, 5]]) rect(g, x, y, 2, 6 - y + 1, '#3a322a'); rect(g, 3, 20, 10, 3, '#4f463d'); rect(g, 3, 20, 10, 1, '#8a7c68');
    rect(g, 0, 21, 4, 2, '#4f463d'); rect(g, 12, 22, 4, 1, '#4f463d'); return outline(c, OUTC); },
  bucket() { const [c, g] = canvas(12, 11); rect(g, 2, 4, 7, 6, '#4a4a56'); rect(g, 2, 4, 1, 6, '#82829a'); rect(g, 8, 4, 1, 6, '#1a1a20'); rect(g, 2, 4, 7, 1, '#9a9aa8'); rect(g, 3, 6, 5, 1, '#2c2c36');
    g.strokeStyle = '#a4742a'; g.lineWidth = 1; g.beginPath(); g.moveTo(2.5, 4.5); g.quadraticCurveTo(5.5, -1, 8.5, 4.5); g.stroke(); rect(g, 9, 8, 3, 1, UC.h3); rect(g, 10, 9, 1, 1, UC.h2); return outline(c, OUTC); },
  web(n) { const [c, g] = canvas(14, 14); g.strokeStyle = 'rgba(220,214,190,0.7)'; g.lineWidth = 1;
    for (let i = 0; i < 6; i++) { const a = (i / 5) * Math.PI / 2; g.beginPath(); g.moveTo(0.5, 0.5); g.lineTo(13 * Math.cos(a) + 0.5, 13 * Math.sin(a) + 0.5); g.stroke(); }
    for (let k = 1; k <= 3; k++) { g.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 5) * Math.PI / 2, r = k * 3.6; const x = r * Math.cos(a) + 0.5, y = r * Math.sin(a) + 0.5; if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); }
    return c; },
  gouge() { const [c, g] = canvas(14, 12); g.strokeStyle = '#7a705a'; g.lineWidth = 1; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(1.5 + i * 4, 1.5); g.lineTo(5.5 + i * 4, 10.5); g.stroke(); } g.strokeStyle = '#14100d'; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(2.5 + i * 4, 1.5); g.lineTo(6.5 + i * 4, 10.5); g.stroke(); } return c; },
  streak(h) { const [c, g] = canvas(5, h); for (let k = 0; k < h; k++) { rect(g, 1 + (k % 9 === 8 ? 1 : 0), k, 2, 1, k > h - 4 ? '#5a554a' : '#0c0a08'); } rect(g, 1, h - 3, 2, 1, '#8c8672'); P(g, 1, h - 1, '#b8b29a'); return c; },
  niche() { const [c, g] = canvas(12, 16);
    rect(g, 0, 3, 12, 13, '#4f463d'); rect(g, 0, 3, 12, 1, '#a89a82'); rect(g, 2, 5, 8, 11, '#08060a'); rect(g, 3, 4, 6, 1, '#08060a'); rect(g, 4, 3, 4, 1, '#08060a'); rect(g, 0, 15, 12, 1, '#1b1816');
    rect(g, 5, 11, 3, 4, '#f0e4c0'); rect(g, 5, 11, 1, 4, '#fffae0'); rect(g, 4, 14, 5, 1, '#8c7a50'); P(g, 7, 13, '#d8c898'); P(g, 5, 15, '#d8c898'); rect(g, 6, 9, 1, 2, '#2a1a0a');
    return outline(c, OUTC); },
  hangLamp(len) { const [c, g] = canvas(10, len + 12); for (let k = 0; k < len; k += 3) { rect(g, 4, k, k % 6 === 0 ? 1 : 3, 2, k % 6 === 0 ? '#2c2c34' : '#6a6a78'); }
    rect(g, 3, len, 4, 2, '#6c4a10'); rect(g, 2, len + 2, 6, 6, '#a4742a'); rect(g, 2, len + 2, 6, 1, '#fcdc84'); rect(g, 2, len + 2, 1, 6, '#d8a444'); rect(g, 7, len + 2, 1, 6, '#6c4a10'); rect(g, 4, len + 4, 2, 3, '#14100a'); rect(g, 3, len + 8, 4, 1, '#6c4a10'); return outline(c, OUTC); },
  chain(len) { const [c, g] = canvas(5, len); for (let k = 0; k < len; k += 3) { rect(g, 2, k, k % 6 === 0 ? 1 : 3, 2, k % 6 === 0 ? '#2c2c34' : '#7a7a88'); } return c; },
  pipeRun(a) { const [len, v] = String(a).split(':').map(Number), h = 14, [c, g] = canvas(len, h);
    rect(g, 0, 4, len, 6, '#2a2a32'); rect(g, 0, 4, len, 1, '#82829a'); rect(g, 0, 5, len, 1, '#4a4a56'); rect(g, 0, 8, len, 1, '#14141a'); rect(g, 0, 9, len, 1, '#0a0a0e');
    for (let fx = 12; fx < len - 8; fx += 44) { rect(g, fx, 2, 5, 10, '#363640'); rect(g, fx, 2, 5, 1, '#9a9ab0'); rect(g, fx + 1, 4, 1, 1, '#d4d4e0'); rect(g, fx + 1, 9, 1, 1, '#d4d4e0'); rect(g, fx + 4, 2, 1, 10, '#0c0c10'); }
    for (let bx = 4; bx < len; bx += 24) { rect(g, bx, 0, 2, 4, '#1b1816'); rect(g, bx, 0, 1, 4, '#4a4a56'); }
    if (v) { const vx = ((len / 2) | 0); rect(g, vx, 9, 2, 3, '#6c4a10'); rect(g, vx - 4, 11, 10, 2, '#a4742a'); rect(g, vx - 4, 11, 10, 1, '#fcdc84'); P(g, vx - 4, 12, '#6c4a10'); P(g, vx + 5, 12, '#6c4a10'); }
    return outline(c, OUTC); },
  wallPipe(len) { const [c, g] = canvas(7, len);
    rect(g, 1, 0, 5, len, '#2c2c34'); rect(g, 1, 0, 1, len, '#82829a'); rect(g, 2, 0, 1, len, '#4a4a56'); rect(g, 5, 0, 1, len, '#0c0c10');
    for (let fy = 6; fy < len - 6; fy += 38) { rect(g, 0, fy, 7, 4, '#363640'); rect(g, 0, fy, 7, 1, '#9a9ab0'); rect(g, 0, fy + 3, 7, 1, '#0c0c10'); P(g, 1, fy + 1, '#d4d4e0'); P(g, 5, fy + 1, '#d4d4e0'); }
    for (let k = len - 8; k < len; k++) P(g, 3, k, '#3a1c0c'); return outline(c, OUTC); },
};
const spr = (k, v) => once(k + ':' + (v === undefined ? '' : v), () => SPR[k](v));

/* ----------------------------------------------------------------- THE PLAN ----------------------------------------------------------------- */
const AVOID = new Set(['sign', 'check', 'skinwell', 'fountain', 'stray', 'silver', 'nestplug', 'oilfire', 'greatlamp', 'gate', 'sconce']);
const FLOOR_BY_ZONE = [   /* [kind, weight, variant count] */
  [['bucket', 3], ['coil', 3], ['rubble', 4], ['amph', 3], ['stump', 1]],                                  /* the dry well */
  [['drumTip', 3], ['rack', 3], ['amph', 4], ['rubble', 4], ['pipeStub', 3], ['husk', 2], ['stump', 2]],    /* the brood hall */
  [['drum', 8], ['drumTip', 3], ['pipeStub', 5], ['spigot', 3], ['rack', 2], ['coil', 2], ['rubble', 2]],   /* the oil works */
  [['mound', 7], ['husk', 4], ['rubble', 2], ['amph', 2]],                                                 /* the silted sump */
  [['drum', 3], ['rack', 3], ['pipeStub', 3], ['amph', 2], ['rubble', 3], ['husk', 2], ['spigot', 1]],      /* the lamp stair */
  [['husk', 5], ['rubble', 3], ['eggs', 3]]];                                                              /* the Queen's cistern */
const DENS = [14, 21, 26, 14, 20, 16];

export function planDress(L, T) {
  if (L.__uwDress) return L.__uwDress;
  const W = L.W, H = L.H, gr = L.grid, tt = (x, y) => x < 0 || y < 0 || x >= W || y >= H ? T.SOLID : gr[y * W + x];
  const air = (x, y) => { const v = tt(x, y); return v === T.AIR; };
  const standable = v => v === T.SOLID || v === T.ONEWAY;
  const items = [], candles = [], ex = (L.ents || []).filter(e => AVOID.has(e.t)).map(e => [e.x, e.y]);
  const nearEnt = (x, y, r = 2) => ex.some(([a, b]) => Math.abs(a - x) <= r && Math.abs(b - y) <= r + 1);
  const nests = (L.nests || []);
  const nearNest = x => nests.some(m => x >= m.x0 - 10 && x <= m.x1 + 10);
  const inRoom = (x, y) => (L.interiors || []).some(([a, b, c, d]) => x >= a && x <= b && y >= c && y <= d);
  const pick = (list, h) => { let tot = 0; for (const [, w] of list) tot += w; let q = h % tot; for (const [k, w] of list) { if (q < w) return k; q -= w; } return list[0][0]; };
  const last = new Map();   /* surface row -> last x a floor prop stood */
  /* FLOORS */
  for (let y = 2; y < H - 1; y++) for (let x = 2; x < W - 2; x++) {
    if (!standable(tt(x, y)) || !air(x, y - 1) || !air(x, y - 2)) continue;
    if (tt(x, y) === T.ONEWAY && (x % 2)) continue;
    const z = zoneOf(x), h = hash(x * 3 + 1, y * 7 + 2), r = h % 100, lx = last.get(y) ?? -99;
    const onSlab = tt(x, y) === T.ONEWAY;
    const near = nearNest(x);
    if (x - lx < 3 || nearEnt(x, y, 2)) continue;
    if (near && !onSlab && r < 38 && (z === 1 || z === 2 || z === 4)) { items.push({ k: 'eggs', x: x * TS + 8, y: (y) * TS, v: h >> 8 & 3 }); last.set(y, x); continue; }
    if (r >= DENS[z]) continue;
    let k = pick(FLOOR_BY_ZONE[z], h >> 4);
    if (onSlab && !['rubble', 'coil', 'amph', 'bucket', 'husk'].includes(k)) k = 'rubble';
    if (z === 3 && tt(x, y) === T.SOLID && !(L.sand || []).some(([a, b, row]) => row === y && x >= a && x <= b)) { if (k === 'mound') k = 'rubble'; }
    if (k === 'stump' && !(air(x - 1, y - 1) && air(x + 1, y - 1) && air(x, y - 3) && air(x, y - 4))) k = 'rubble';
    if (k === 'rack' && !(air(x, y - 3) && air(x, y - 4))) k = 'amph';
    if ((k === 'pipeStub') && !air(x, y - 3)) k = 'drum';
    items.push({ k, x: x * TS + 8, y: y * TS, v: (h >> 9) & 3 }); last.set(y, x);
  }
  /* CEILINGS: pipe runs (a run of ceiling >= 9 tiles with 3 rows clear under it), chains and lamps, cobwebs in the corners */
  for (let y = 2; y < H - 3; y++) { let x = 2;
    while (x < W - 2) {
      const ceil = xx => tt(xx, y) === T.SOLID && air(xx, y + 1) && air(xx, y + 2) && air(xx, y + 3);
      if (!ceil(x)) { x++; continue; } let x1 = x; while (x1 + 1 < W - 2 && ceil(x1 + 1)) x1++;
      const len = x1 - x + 1;
      if (len >= 9 && hash(x, y) % 100 < (zoneOf(x) === 3 ? 25 : 60)) { const a = x + 1, b = Math.min(x1 - 1, a + 8 + (hash(x + 5, y) % 7)); items.push({ k: 'pipeRun', x: a * TS, y: (y + 1) * TS - 2, w: (b - a + 1) * TS, v: hash(a, y) & 1 }); }
      for (let xx = x; xx <= x1; xx++) { const h = hash(xx + 9, y + 3), r = h % 100;
        if (inRoom(xx, y + 1)) continue;
        if (r < 5 && !items.some(it => it.k === 'chain' && Math.abs(it.x - xx * TS) < 5 * TS && it.y === (y + 1) * TS)) { const clear = (() => { let n = 0; while (air(xx, y + 1 + n) && n < 12) n++; return n; })(); items.push({ k: 'chain', x: xx * TS + 8, y: (y + 1) * TS, len: Math.max(8, Math.min(clear - 3, 5 + (h >> 8) % 4) * TS), lamp: (h >> 12) % 3 === 0 }); }
        if (xx === x && !air(xx - 1, y + 1) === true && r < 80) items.push({ k: 'web', x: xx * TS, y: (y + 1) * TS, flip: 0 });
        if (xx === x1 && !air(xx + 1, y + 1) === true && r < 80) items.push({ k: 'web', x: (xx + 1) * TS, y: (y + 1) * TS, flip: 1 }); }
      x = x1 + 1; } }
  /* WALLS: for every wall face on the east or west side of a room: streaks, vertical pipes, candle niches, gouges, egg-sacs near the nests */
  for (let x = 2; x < W - 2; x++) { let y = 2;
    while (y < H - 2) {
      const solidAt = (yy, side) => tt(x, yy) === T.SOLID && air(x + side, yy);
      for (const side of [1, -1]) {
        if (!solidAt(y, side)) continue; let y1 = y; while (y1 + 1 < H - 2 && solidAt(y1 + 1, side)) y1++;
        const len = y1 - y + 1, z = zoneOf(x), hh = hash(x * 5 + side, y);
        if (len >= 3 && !inRoom(x + side, y) && !inRoom(x, y)) {
          if (len >= 7 && (z === 1 || z === 2 || z === 4) && hh % 100 < 22 && !(L.lines || []).some(([lx]) => Math.abs(lx - x) <= 1)) items.push({ k: 'wallPipe', x: x * TS + (side > 0 ? TS - 6 : -1), y: y * TS, len: Math.min(len, 12) * TS - 4, side });
          if (len >= 4 && hh % 100 < 30) items.push({ k: 'streak', x: x * TS + (side > 0 ? TS - 3 : 1), y: (y + 1) * TS, h: 10 + (hh >> 8) % 20, side });
          if (len >= 4 && (hh >> 3) % 100 < 7 && z !== 0) { let fl = 0; for (let k = 1; k < 12; k++) if (!air(x + side, y1 + k)) { fl = k; break; } if (fl && fl < 8) { const cy = Math.max(y + 1, y1 - 2); if (!candles.some(c => Math.abs(c.x - x * TS) < 18 * TS)) { candles.push({ x: x * TS + 8, y: cy * TS + 10 }); items.push({ k: 'niche', x: x * TS + 2, y: cy * TS, side }); } } }
          if (len >= 3 && (z === 5 || nearNest(x)) && (hh >> 5) % 100 < 18) items.push({ k: 'gouge', x: x * TS + 1, y: (y + 1) * TS, side });
        }
        y = y1 + 1; }
      y++; } }
  items.sort((a, b) => a.x - b.x);
  /* SUPPORTS */
  const supports = planSupports(L, T);
  return (L.__uwDress = { items, supports, candles });
}

/* what holds each ledge up: [{ x0, x1, y, ends: [{ x, how: 'rock' | 'post' | 'chain' | 'corbel', y0, y1 }], ok }] - read by tools/underwell-aloft.mjs */
export function planSupports(L, T) {
  if (L.__uwSup) return L.__uwSup;
  const W = L.W, H = L.H, gr = L.grid, tt = (x, y) => x < 0 || y < 0 || x >= W || y >= H ? T.SOLID : gr[y * W + x];
  const runs = [];
  for (let y = 0; y < H; y++) { let x = 0; while (x < W) { if (tt(x, y) !== T.ONEWAY) { x++; continue; } let x1 = x; while (x1 + 1 < W && tt(x1 + 1, y) === T.ONEWAY) x1++; runs.push([x, x1, y]); x = x1 + 1; } }
  const out = [];
  for (const [x0, x1, y] of runs) {
    const keyed = x => tt(x, y + 1) === T.SOLID || tt(x - 1, y) === T.SOLID && x === x0 || tt(x + 1, y) === T.SOLID && x === x1;
    const floorUnder = x => { for (let r = y + 1; r < H; r++) if (tt(x, r) === T.SOLID) return r; return -1; };
    const ceilOver = x => { for (let r = y - 1; r >= 0; r--) if (tt(x, r) === T.SOLID) return r; return -1; };
    const sup = [];
    const addEnd = (x) => {
      if (keyed(x)) { sup.push({ x, how: x === x0 ? (tt(x0 - 1, y) === T.SOLID ? 'corbel' : 'rock') : (tt(x1 + 1, y) === T.SOLID ? 'corbel' : 'rock'), y0: y, y1: y }); return; }
      const f = floorUnder(x);
      if (f > 0 && f - y <= 14) sup.push({ x, how: 'post', y0: y + 1, y1: f }); else { const c = ceilOver(x); if (c >= 0 && y - c <= 16) sup.push({ x, how: 'chain', y0: c + 1, y1: y }); else sup.push({ x, how: 'none', y0: y, y1: y }); }
    };
    addEnd(x0); if (x1 !== x0) addEnd(x1);
    for (let x = x0 + 8; x < x1 - 3; x += 8) addEnd(x);   /* a long run is held up in the middle too */
    /* a CANTILEVER (a board let into one wall, the shaft's ledges): its free end hangs off a diagonal STRUT up from the wall, as a corbel's long arm does */
    const kEnd = sup.find(e => e.how === 'rock' || e.how === 'corbel');
    if (kEnd) for (const e of sup) if (e.how === 'none') { const wallX = kEnd.x === x0 ? x0 - 1 : x1 + 1; if (x1 - x0 >= 2 && tt(wallX, y) === T.SOLID && tt(wallX, y + 5) === T.SOLID) { e.how = 'strut'; e.wallX = wallX; e.y0 = y + 1; e.y1 = y + 5; } }
    out.push({ x0, x1, y, ends: sup, ok: sup.every(s => s.how !== 'none') });
  }
  return (L.__uwSup = out);
}

/* ----------------------------------------------------------------- THE DRAW ----------------------------------------------------------------- */
const post = (zone, h) => once('post' + zone + h, () => { const iron = zone === 2 || zone === 4, w = iron ? 6 : 10, [c, g] = canvas(w, h);
  if (iron) { rect(g, 1, 0, 4, h, '#2c2c36'); rect(g, 1, 0, 1, h, '#82829a'); rect(g, 4, 0, 1, h, '#0c0c10'); for (let y = 6; y < h - 4; y += 14) { rect(g, 0, y, 6, 2, '#363640'); rect(g, 0, y, 6, 1, '#9a9ab0'); } rect(g, 0, h - 3, 6, 3, '#363640'); rect(g, 0, h - 3, 6, 1, '#9a9ab0'); }
  else { rect(g, 1, 0, 8, h, '#3b342e'); rect(g, 1, 0, 2, h, '#6a5e50'); rect(g, 8, 0, 1, h, '#1b1816'); for (let y = 8; y < h - 4; y += 12) rect(g, 1, y, 8, 1, '#1b1816'); rect(g, 0, 0, 10, 3, '#4f463d'); rect(g, 0, 0, 10, 1, '#a89a82'); rect(g, 0, h - 3, 10, 3, '#4f463d'); rect(g, 0, h - 3, 10, 1, '#8a7c68'); }
  return outline(c, OUTC); });
const corbel = (zone) => once('corbel' + zone, () => { const [c, g] = canvas(14, 9); const iron = zone === 2 || zone === 4;
  for (let k = 0; k < 8; k++) rect(g, 0, k, 13 - k * 1.5, 1, iron ? (k === 0 ? '#9a9ab0' : '#363640') : (k === 0 ? '#a89a82' : '#4f463d'));
  rect(g, 0, 0, 2, 9, iron ? '#2c2c36' : '#3b342e'); return outline(c, OUTC); });

export function drawSupports(g, cx, cy, VW, time, plan, L) {
  for (const s of plan.supports) {
    if ((s.x1 + 1) * TS < cx - 20 || s.x0 * TS > cx + VW + 20) continue;
    const zone = zoneOf(s.x0);
    for (const e of s.ends) {
      if (e.how === 'post') { const h = (e.y1 - e.y0) * TS; if (h < 6) continue; const sp = post(zone, h), x = e.x * TS + 8 - (sp.width >> 1) - (e.x === s.x0 ? -2 : e.x === s.x1 ? 2 : 0); g.drawImage(sp, Math.round(x - cx), Math.round(e.y0 * TS - cy)); }
      else if (e.how === 'chain') { const h = (e.y1 - e.y0) * TS; if (h < 6) continue; const ch = spr('chain', h); for (const dx of e.x === s.x0 ? [3] : e.x === s.x1 ? [9] : [6]) g.drawImage(ch, Math.round(e.x * TS + dx - 2 - cx), Math.round(e.y0 * TS - cy)); }
      else if (e.how === 'strut') { const wx = (e.wallX > e.x ? e.wallX * TS : (e.wallX + 1) * TS) - cx, fx = e.x * TS + (e.wallX > e.x ? 12 : 4) - cx, ty = (s.y + 1) * TS - cy, by = (e.y1) * TS - cy;
        for (const [col, dy] of [['#0a0807', 0], ['#2c2c36', 1], ['#585866', 2]]) { g.strokeStyle = col; g.lineWidth = dy === 0 ? 5 : dy === 1 ? 3 : 1; g.beginPath(); g.moveTo(Math.round(wx) + 0.5, Math.round(by) + 0.5); g.lineTo(Math.round(fx) + 0.5, Math.round(ty) + 0.5 + (dy === 2 ? -1 : 0)); g.stroke(); }
        g.fillStyle = '#82829a'; g.fillRect(Math.round(wx) - (e.wallX > e.x ? 2 : -1), Math.round(by) - 2, 2, 5); g.fillRect(Math.round(fx) - 1, Math.round(ty), 3, 2); }
      else if (e.how === 'corbel' || e.how === 'rock') { const sp = corbel(zone), left = e.x === s.x0 ? L.grid[s.y * L.W + e.x - 1] === 1 : false; if (e.how === 'corbel') { g.save(); if (!left) { g.translate(Math.round(e.x * TS + 16 - cx), Math.round((s.y + 1) * TS - cy)); g.scale(-1, 1); g.drawImage(sp, 0, 0); } else g.drawImage(sp, Math.round(e.x * TS - cx), Math.round((s.y + 1) * TS - cy)); g.restore(); } }
    }
  }
}

export function drawDress(g, cx, cy, VW, time, plan) {
  const items = plan.items; let lo = 0, hi = items.length; const xmin = cx - 120; while (lo < hi) { const m = (lo + hi) >> 1; if (items[m].x < xmin) lo = m + 1; else hi = m; }
  for (let i = lo; i < items.length; i++) { const it = items[i]; if (it.x > cx + VW + 40) break;
    const sx = Math.round(it.x - cx), sy = Math.round(it.y - cy);
    switch (it.k) {
      case 'drum': { const s = spr('drum', it.v & 1); g.drawImage(s, sx - 6, sy - s.height + 1); break; }
      case 'drumTip': { const s = spr('drumTip'); g.drawImage(s, sx - 11, sy - s.height + 1); break; }
      case 'amph': { const s = spr('amph', it.v); g.drawImage(s, sx - 6, sy - s.height + 1); if (it.v & 1) g.drawImage(s, sx + 4, sy - s.height + 1); break; }
      case 'pipeStub': { const s = spr('pipeStub'); g.drawImage(s, sx - 5, sy - s.height + 1);
        if (Math.sin(time * 1.3 + it.x * 0.1) > 0.7) { g.fillStyle = UC.o4; g.fillRect(sx + 1, sy - 10 + (((time * 14) | 0) % 9), 1, 2); } break; }
      case 'spigot': { const s = spr('spigot'); g.drawImage(s, sx - 7, sy - s.height + 1); const d = (time * 0.9 + it.x * 0.013) % 1; if (d < 0.55) { g.fillStyle = '#9ad0f0'; g.fillRect(sx - 6, sy - 9 + Math.round(d * 20), 1, 2); } break; }
      case 'rubble': { const s = spr('rubble'); g.drawImage(s, sx - 9, sy - s.height + 1); break; }
      case 'husk': { const s = spr('husk'); g.drawImage(s, sx - 8, sy - s.height + 1); break; }
      case 'rack': { const s = spr('rack'); g.drawImage(s, sx - 8, sy - s.height + 1); break; }
      case 'coil': { const s = spr('coil'); g.drawImage(s, sx - 5, sy - s.height + 1); break; }
      case 'eggs': { const s = spr('eggs'); g.drawImage(s, sx - 9, sy - s.height + 1); break; }
      case 'mound': { const s = spr('mound'); g.drawImage(s, sx - 12, sy - s.height + 2); break; }
      case 'stump': { const s = spr('stump'); g.drawImage(s, sx - 8, sy - s.height + 1); break; }
      case 'bucket': { const s = spr('bucket'); g.drawImage(s, sx - 6, sy - s.height + 1); break; }
      case 'pipeRun': { const s = spr('pipeRun', it.w + ':' + it.v); g.drawImage(s, sx, sy); break; }
      case 'chain': { const s = spr('chain', it.len); g.drawImage(s, sx - 2, sy); if (it.lamp) { const l = spr('hangLamp', 3); g.drawImage(l, sx - 5, sy + it.len - 3); } break; }
      case 'web': { const s = spr('web'); if (it.flip) { g.save(); g.translate(sx, sy); g.scale(-1, 1); g.drawImage(s, 0, 0); g.restore(); } else g.drawImage(s, sx, sy); break; }
      case 'wallPipe': { const s = spr('wallPipe', it.len); g.drawImage(s, sx, sy); break; }
      case 'streak': { const s = spr('streak', it.h); g.globalAlpha = 0.85; g.drawImage(s, sx, sy); g.globalAlpha = 1; break; }
      case 'gouge': { const s = spr('gouge'); g.globalAlpha = 0.8; g.drawImage(s, sx, sy); g.globalAlpha = 1; break; }
      case 'niche': { const s = spr('niche'); const dx = it.side > 0 ? sx - 6 : sx - 6 + 6; g.drawImage(s, sx - (it.side > 0 ? 0 : 0) - 0, sy); const fl = 0.6 + 0.4 * Math.sin(time * 9 + it.x); g.fillStyle = '#ff8a2a'; g.fillRect(sx + 6, sy + 8, 1, 2); g.fillStyle = '#ffe9a0'; g.globalAlpha = fl; g.fillRect(sx + 6, sy + 7, 1, 2); g.globalAlpha = 1; break; }
    }
  }
}
export { SPR as DRESS_SPRITES };
