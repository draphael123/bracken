// skyroad_dress.js - THE SKY ROAD's DRESSING and what holds its ledges up (claude/skyroadart). Art only: nothing here is a tile, an entity or a number - it is read OFF the built
// grid and drawn behind the heroes, so the level hash, the routes and the marks do not move (the same idea as src/redraw/underwell_dress.js).
//   FLOORS   cairns (a stack of stones: the road's waymarks), bleached bones, kite-line SPOOLS (a drum of cord on an iron stand), folded war-kites leaning on the rock, clay jars, ballast
//            sacks, rope coils, dry tufts, rubble, iron mooring bollards, bird nests (the roosts), braziers (a light: at every checkpoint and the Eyrie), lantern poles (a light), tall
//            iron masts with a streaming pennant, bunting strung between two posts
//   WALLS    sun-wheels scratched into the faces, iron rings with frayed cord, guano streaks
//   UNDER    kite-tail ribbons hanging from the undersides of the cloth decks and slabs, stirring in the wind
//   SUPPORTS every ledge (ONEWAY run) is either keyed into the rock at an end (a corbel), or stands on a PIER/POLE that runs down to rock, or is STAYED: a cable from its end to an iron
//            ring in rock, the way a rigger hangs a platform off a cliff. planSupports() is what tools/skyroad-aloft.mjs measures - NOTHING FLOATS.
// planDress(L, T) -> { items, supports, lights }  (cached on the level)   drawSupports / drawDress(g, cx, cy, VW, time, plan)
import { canvas, rect, px, outline, mulberry } from '../px.js';
import { ZONE, zoneOf, hash } from './skyroad_tiles.js';
const TS = 16, OUTC = '#241c2c';
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const P = (g, x, y, c) => px(g, x, y, c);
const ell = (g, cx, cy, rx, ry, col) => { for (let dy = -ry; dy <= ry; dy++) { const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry || 1)))); rect(g, cx - hw, cy + dy, hw * 2 + 1, 1, col); } };

/* ----------------------------------------------------------------- THE SPRITES ----------------------------------------------------------------- */
const SPR = {
  cairn(z, v) { const [c, g] = canvas(12, 12), S = ZONE[z].s; ell(g, 6, 9, 5, 2, S[3]); rect(g, 1, 9, 10, 2, S[3]); rect(g, 1, 10, 10, 1, S[1]);
    ell(g, 6, 6, 3, 2, S[4]); rect(g, 3, 5, 6, 1, S[5]); P(g, 4, 5, S[6]); ell(g, 6, 3, 2, 1, S[5]); P(g, 5, 2, S[6]); if (v & 1) { rect(g, 5, 0, 2, 1, S[4]); P(g, 5, 0, S[6]); }
    P(g, 8, 8, S[1]); P(g, 2, 9, S[5]); return outline(c, OUTC); },
  bones(z, v) { const [c, g] = canvas(16, 9), B = ZONE[z].bone;
    if (v & 1) { for (let i = 0; i < 4; i++) { rect(g, 2 + i * 3, 1 + (i === 1 || i === 2 ? 0 : 1), 1, 6 - (i === 1 || i === 2 ? 0 : 2), B); P(g, 2 + i * 3, 1 + (i === 1 || i === 2 ? 0 : 1), '#fffaee'); } rect(g, 1, 7, 14, 1, '#c8b890'); }   /* a ribcage on its spine */
    else { ell(g, 5, 5, 3, 3, B); P(g, 4, 4, '#2a2030'); P(g, 6, 4, '#2a2030'); rect(g, 4, 7, 3, 1, '#c8b890'); rect(g, 8, 6, 6, 2, B); P(g, 13, 6, '#fffaee'); P(g, 8, 6, '#fffaee'); }   /* a skull and a long bone */
    return outline(c, OUTC); },
  spool() { const [c, g] = canvas(14, 14);
    rect(g, 1, 11, 12, 2, '#3a3a48'); rect(g, 1, 11, 12, 1, '#7a7a8e'); rect(g, 2, 3, 2, 9, '#2c2c38'); rect(g, 10, 3, 2, 9, '#2c2c38'); P(g, 2, 3, '#9a9ab0'); P(g, 10, 3, '#9a9ab0');
    rect(g, 4, 4, 6, 7, '#efe6d2'); for (let y = 5; y < 11; y += 2) rect(g, 4, y, 6, 1, '#b8a888'); rect(g, 4, 4, 1, 7, '#fffaee');
    rect(g, 11, 6, 3, 1, '#3a3a48'); rect(g, 13, 5, 1, 3, '#7a5a34'); P(g, 12, 6, '#9a9ab0'); return outline(c, OUTC); },
  kitefold(v) { const [c, g] = canvas(11, 15), A = v & 1 ? ['#8a2a22', '#c9463d', '#e8705a'] : ['#7a5a2a', '#c8a050', '#e8c878'];
    for (let y = 0; y < 14; y++) { const hw = y < 6 ? 1 + y * 0.6 : Math.max(1, 5 - (y - 6) * 0.55), x0 = Math.round(5 - hw + (y >> 2)), x1 = Math.round(5 + hw + (y >> 2)); rect(g, x0, y, Math.max(1, x1 - x0), 1, A[1]); P(g, x0, y, A[2]); P(g, x1 - 1, y, A[0]); }
    rect(g, 6, 0, 1, 14, '#e6d8b8'); rect(g, 1, 6, 9, 1, '#e6d8b8'); P(g, 6, 14, '#e6d8b8'); return outline(c, OUTC); },
  jar(z, v) { const [c, g] = canvas(9, 11), b = v & 1 ? ['#8a4a2e', '#b87048', '#4a2214'] : ['#a65e3a', '#d28c5a', '#5a2e1c'];
    ell(g, 4, 7, 3, 3, b[0]); rect(g, 1, 6, 1, 3, b[1]); rect(g, 6, 6, 2, 3, b[2]); rect(g, 3, 2, 3, 2, b[0]); rect(g, 2, 1, 5, 1, b[1]); rect(g, 2, 5, 5, 1, b[2]); if (v & 2) { rect(g, 3, 1, 3, 1, '#efe6d2'); } return outline(c, OUTC); },
  sack() { const [c, g] = canvas(11, 10); ell(g, 5, 6, 4, 3, '#b89a68'); rect(g, 1, 6, 1, 3, '#d8bc84'); rect(g, 8, 5, 2, 4, '#8a7048'); rect(g, 4, 1, 3, 3, '#a88a58'); rect(g, 3, 3, 5, 1, '#5a4a2e'); P(g, 4, 5, '#d8bc84'); P(g, 6, 8, '#6a5434'); return outline(c, OUTC); },
  coil() { const [c, g] = canvas(12, 6); ell(g, 6, 3, 5, 2, '#6a5a3a'); ell(g, 6, 3, 3, 1, '#2a2418'); rect(g, 2, 2, 8, 1, '#a8946a'); rect(g, 3, 4, 6, 1, '#4a3e28'); rect(g, 9, 0, 3, 1, '#a8946a'); return outline(c, OUTC); },
  tuft(z) { const [c, g] = canvas(7, 6); for (const [x, h, col] of [[1, 3, '#a89860'], [2, 5, '#c8b878'], [3, 4, '#a89860'], [4, 5, '#d8c888'], [5, 3, '#a89860']]) rect(g, x, 6 - h, 1, h, col); return c; },
  rubble(z) { const [c, g] = canvas(14, 7), S = ZONE[z].s; ell(g, 4, 5, 3, 2, S[3]); ell(g, 10, 5, 3, 2, S[2]); ell(g, 7, 3, 3, 2, S[4]); rect(g, 5, 2, 2, 1, S[6]); rect(g, 2, 4, 2, 1, S[5]); rect(g, 9, 4, 2, 1, S[4]); rect(g, 0, 6, 14, 1, S[1]); return outline(c, OUTC); },
  anchor() { const [c, g] = canvas(8, 9); rect(g, 2, 4, 4, 5, '#3a3a48'); rect(g, 2, 4, 1, 5, '#8a8aa0'); rect(g, 1, 3, 6, 2, '#4a4a5a'); rect(g, 1, 3, 6, 1, '#b4b4c8'); rect(g, 3, 0, 2, 3, '#2a2a36'); P(g, 3, 0, '#9a9ab0'); rect(g, 2, 1, 4, 1, '#2a2a36'); return outline(c, OUTC); },
  brazier() { const [c, g] = canvas(12, 14); rect(g, 2, 8, 1, 6, '#2c2c38'); rect(g, 9, 8, 1, 6, '#2c2c38'); rect(g, 5, 9, 2, 5, '#2c2c38'); rect(g, 0, 5, 12, 4, '#3a3a48'); rect(g, 0, 5, 12, 1, '#9a9ab0'); rect(g, 1, 8, 10, 1, '#1c1c26'); for (const x of [2, 6, 9]) P(g, x, 6, '#6a6a80');
    rect(g, 2, 3, 8, 2, '#c04a1a'); rect(g, 3, 3, 6, 1, '#ff8a2a'); P(g, 5, 3, '#ffd870'); return outline(c, OUTC); },
  lantern() { const [c, g] = canvas(8, 22); rect(g, 3, 4, 2, 18, '#2c2c38'); rect(g, 3, 4, 1, 18, '#7a7a90'); rect(g, 0, 3, 7, 1, '#2c2c38'); rect(g, 6, 3, 1, 5, '#2c2c38'); rect(g, 4, 20, 3, 2, '#2c2c38');
    rect(g, 4, 8, 5, 6, '#3a2a18'); rect(g, 5, 9, 3, 4, '#ffcf6a'); rect(g, 5, 9, 3, 1, '#fff2b0'); rect(g, 4, 7, 5, 1, '#2c2c38'); rect(g, 4, 14, 5, 1, '#2c2c38'); return outline(c, OUTC); },
  nestb(z) { const [c, g] = canvas(14, 7); ell(g, 7, 4, 6, 2, '#6a4e30'); ell(g, 7, 3, 5, 1, '#3a2a18'); for (let x = 1; x < 13; x += 2) { P(g, x, 3 + (x & 1), '#a88a58'); P(g, x + 1, 5, '#4a3620'); } rect(g, 5, 2, 2, 2, '#efe8d8'); P(g, 5, 2, '#fff'); rect(g, 8, 2, 2, 2, '#d8d0bc'); rect(g, 3, 1, 4, 1, '#a88a58'); return outline(c, OUTC); },
  glyph(z) { const [c, g] = canvas(11, 11), S = ZONE[z].s; ell(g, 5, 5, 3, 3, S[5]); ell(g, 5, 5, 1, 1, S[1]); for (const [dx, dy] of [[0, -5], [0, 5], [-5, 0], [5, 0], [4, 4], [-4, -4], [4, -4], [-4, 4]]) P(g, 5 + dx, 5 + dy, S[6]); for (const [dx, dy] of [[0, -4], [0, 4], [-4, 0], [4, 0]]) P(g, 5 + dx, 5 + dy, S[5]); return c; },
  ring() { const [c, g] = canvas(8, 14); rect(g, 2, 0, 4, 3, '#3a3a48'); rect(g, 2, 0, 4, 1, '#9a9ab0'); ell(g, 4, 5, 2, 2, '#4a4a5a'); ell(g, 4, 5, 1, 1, 'rgba(0,0,0,0)'); g.clearRect(3, 4, 2, 2); rect(g, 3, 7, 2, 7, '#c8b894'); P(g, 3, 9, '#8a7a58'); P(g, 4, 12, '#8a7a58'); P(g, 3, 13, '#c8b894'); return outline(c, OUTC); },
  streak(h) { const [c, g] = canvas(5, h); for (let y = 0; y < h; y++) { const w = y < 3 ? 2 : y > h - 4 ? 1 : 3 + ((y * 7) % 2); rect(g, 2 - (w >> 1), y, w, 1, y % 5 ? '#dcd8e8' : '#fffaee'); } rect(g, 1, 0, 4, 2, '#eee8f4'); return c; },
  tails(n) { const [c, g] = canvas(9, n); rect(g, 0, 0, 9, 1, '#e6d8b8'); for (let i = 0; i < 3; i++) { const l = n - 2 - ((i * 5) % 5), col = ['#c9463d', '#efe6d2', '#c9463d'][i]; rect(g, 1 + i * 3, 1, 2, l, col); P(g, 1 + i * 3, 1, '#fff8e8'); } return c; },
  pole(h) { const [c, g] = canvas(7, h); rect(g, 2, 3, 3, h - 3, '#2c2c38'); rect(g, 2, 3, 1, h - 3, '#8a8aa2'); rect(g, 4, 3, 1, h - 3, '#14141c'); for (let y = 10; y < h - 4; y += 12) { rect(g, 1, y, 5, 2, '#3a3a48'); rect(g, 1, y, 5, 1, '#9a9ab0'); } rect(g, 1, h - 3, 5, 3, '#3a3a48'); rect(g, 1, h - 3, 5, 1, '#9a9ab0'); rect(g, 2, 0, 3, 4, '#3a3a48'); rect(g, 3, 0, 1, 1, '#ffd870'); return outline(c, OUTC); },
};
const spr = (k, a, b) => once(k + ':' + a + ':' + b, () => SPR[k](a, b));

/* ----------------------------------------------------------------- THE PLAN ----------------------------------------------------------------- */
const AVOID = new Set(['sign', 'check', 'sunstone', 'sundisc', 'cloak', 'loft', 'silver', 'stray', 'mast', 'gate', 'roc', 'vent', 'coin', 'crow', 'kite', 'harpy']);
const FOES = new Set(['shield', 'archer', 'rockgoblin', 'horn', 'goat', 'kiterider']);
export function planDress(L, T) {
  if (L.__skyDress) return L.__skyDress;
  const W = L.W, H = L.H, gr = L.grid, tt = (x, y) => x < 0 || y < 0 || x >= W || y >= H ? T.SOLID : gr[y * W + x];
  const air = (x, y) => tt(x, y) === T.AIR, standable = v => v === T.SOLID || v === T.ONEWAY;
  const items = [], lights = [], ex = (L.ents || []).filter(e => AVOID.has(e.t) || FOES.has(e.t)).map(e => [e.x, e.y, e.t === 'vent' ? 2 : 1]);
  const nearEnt = (x, y) => ex.some(([a, b, r]) => Math.abs(a - x) <= r && Math.abs(b - (y - 1)) <= 2);
  const crumb = (x, y) => (L.crumbles || []).some(q => q.row === y && x >= q.x0 - 1 && x <= q.x1 + 1);
  const cage = (x) => x >= 148 && x <= 151;
  const last = new Map();
  const pick = (list, h) => { let tot = 0; for (const [, w] of list) tot += w; let q = h % tot; for (const [k, w] of list) { if (q < w) return k; q -= w; } return list[0][0]; };
  const KINDS = [   /* weights by zone: [kind, weight] */
    [['cairn', 4], ['bones', 3], ['tuft', 5], ['rubble', 4], ['jar', 2], ['coil', 2], ['sack', 1]],
    [['spool', 3], ['kitefold', 3], ['sack', 3], ['jar', 3], ['coil', 2], ['cairn', 2], ['anchor', 2], ['tuft', 2], ['pole', 1]],
    [['bones', 4], ['nestb', 4], ['rubble', 3], ['tuft', 3], ['cairn', 2], ['anchor', 1]],
    [['rubble', 5], ['cairn', 3], ['anchor', 3], ['bones', 2], ['tuft', 2], ['coil', 1]],
    [['bones', 4], ['nestb', 3], ['rubble', 3], ['anchor', 1]]];
  /* FLOORS */
  for (let y = 2; y < H - 1; y++) for (let x = 2; x < W - 2; x++) {
    if (!standable(tt(x, y)) || !air(x, y - 1) || !air(x, y - 2)) continue;
    if (crumb(x, y) || cage(x) && y > 20) continue;
    const z = zoneOf(x), h = hash(x * 3 + 1, y * 7 + 2), r = h % 100, lx = last.get(y) ?? -99, onSlab = tt(x, y) === T.ONEWAY;
    const gap = onSlab ? 5 : 3; if (x - lx < gap || nearEnt(x, y)) continue;
    if (r > (onSlab ? 40 : 72)) continue;
    let k = pick(KINDS[z], h >>> 7);
    if (onSlab && (k === 'pole' || k === 'spool')) k = 'jar';
    if (k === 'pole') { /* a tall mast needs a floor three tiles wide and open sky over it */
      if (!(standable(tt(x - 1, y)) && standable(tt(x + 1, y)) && air(x, y - 3) && air(x, y - 4))) k = 'cairn'; }
    last.set(y, x);
    items.push({ k, x: x * TS + 8, y: y * TS, v: (h >>> 11) & 3, z, ph: (h >>> 3) % 100 });
  }
  /* BRAZIERS and LANTERNS: a light at every checkpoint, the kite reel's deck, the tower, the loft and the Eyrie door */
  const top = (x, y0) => { for (let y = y0 - 3; y <= y0 + 3; y++) if (standable(tt(x, y)) && air(x, y - 1) && air(x, y - 2) && !crumb(x, y)) return y; return -1; };
  const place = (k, x, y, extra) => { const y2 = top(x, y); if (y2 < 0) return; if (items.some(i => Math.abs(i.x - (x * TS + 8)) < 20 && Math.abs(i.y - y2 * TS) < 40)) { const j = items.findIndex(i => Math.abs(i.x - (x * TS + 8)) < 20 && Math.abs(i.y - y2 * TS) < 40); items.splice(j, 1); } items.push(Object.assign({ k, x: x * TS + 8, y: y2 * TS, v: 0, z: zoneOf(x), ph: (x * 7) % 100 }, extra || {})); };
  for (const [x, y] of [[110, 46], [172, 14], [272, 18], [340, 16], [393, 18], [103, 34]]) place('pole', x, y);
  for (const e of L.ents) { if (e.t === 'check') { place('brazier', e.x + 2, e.y + 1); place('lantern', e.x - 2, e.y + 1); } }
  for (const [x, y] of [[119, 38], [153, 14], [334, 16], [362, 12], [391, 18], [439, 18], [440, 18], [100, 34], [171, 14], [268, 18], [341, 16]]) place(x < 395 && x > 330 || x === 100 ? 'lantern' : x >= 391 ? 'brazier' : 'lantern', x, y);
  /* WALLS: faces of rock the sun can see */
  for (let y = 4; y < H - 8; y++) for (let x = 3; x < W - 3; x++) {
    if (tt(x, y) !== T.SOLID || tt(x, y - 1) !== T.SOLID || tt(x, y + 1) !== T.SOLID) continue;
    const eL = air(x - 1, y), eR = air(x + 1, y); if (!eL && !eR) continue;
    const h = hash(x * 13 + 5, y * 17 + 3), z = zoneOf(x); if (h % 100 > 2) continue;
    const kind = ['glyph', 'ring', 'streak'][(h >>> 9) % 3]; if (kind === 'streak' && z !== 2) continue;
    if (kind === 'glyph' && y > 44) continue;
    if (nearEnt(x, y + 1)) continue;
    items.push({ k: kind, x: eL ? x * TS : (x + 1) * TS, y: y * TS + 2, side: eL ? -1 : 1, z, v: (h >>> 13) & 3, h: 12 + ((h >>> 5) % 18) });
  }
  /* UNDER: kite tails hanging from the underside of a ledge (cloth decks and slabs over open air) */
  for (let y = 2; y < H - 3; y++) for (let x = 2; x < W - 2; x++) { if (tt(x, y) !== T.ONEWAY || !air(x, y + 1) || !air(x, y + 2)) continue; const h = hash(x * 5 + 9, y * 11 + 1); if (h % 100 > 14) continue; items.push({ k: 'tails', x: x * TS + 3 + (h % 7), y: y * TS + 10, n: 12 + (h >>> 8) % 8, z: zoneOf(x), ph: h % 100 }); }
  items.sort((a, b) => a.x - b.x);
  for (const it of items) if (it.k === 'brazier') lights.push({ x: it.x, y: it.y - 9, r: 44, a: 0.3, c: '255,150,60', fl: 1 }); else if (it.k === 'lantern') lights.push({ x: it.x + 2, y: it.y - 12, r: 34, a: 0.26, c: '255,206,110', fl: 0.4 });
  const supports = planSupports(L, T);
  return (L.__skyDress = { items, supports, lights });
}

export function planSupports(L, T) {
  if (L.__skySup) return L.__skySup;
  const W = L.W, H = L.H, gr = L.grid, tt = (x, y) => x < 0 || y < 0 || x >= W || y >= H ? T.SOLID : gr[y * W + x];
  const solid = (x, y) => tt(x, y) === T.SOLID, standTop = (x, y) => solid(x, y) && tt(x, y - 1) !== T.SOLID;
  const out = [];
  for (let y = 0; y < H; y++) { let x = 0; while (x < W) { if (tt(x, y) !== T.ONEWAY) { x++; continue; } const x0 = x; while (tt(x, y) === T.ONEWAY) x++; const x1 = x - 1;
    const ends = [];
    for (const ex of x0 === x1 ? [x0] : [x0, x1]) {
      if (solid(ex + (ex === x0 ? -1 : 1), y) || solid(ex, y + 1)) { ends.push({ x: ex, how: 'rock' }); continue; }
      let fy = -1; for (let k = 1; k <= 14; k++) { if (standTop(ex, y + k)) { fy = y + k; break; } if (tt(ex, y + k) === T.ONEWAY) break; }
      if (fy > 0) { ends.push({ x: ex, how: 'post', y0: y + 1, y1: fy }); continue; }
      /* STAYED: the nearest firm top within nine columns and fourteen rows, a cable to an iron ring set in it */
      let best = null; for (let dx = -9; dx <= 9; dx++) for (let dy = -3; dy <= 14; dy++) { const ax = ex + dx, ay = y + dy; if (!standTop(ax, ay)) continue; const d = Math.hypot(dx, dy * 0.8); if (!best || d < best.d) best = { d, ax, ay }; }
      if (best) ends.push({ x: ex, how: 'stay', ax: best.ax, ay: best.ay }); else ends.push({ x: ex, how: 'none' });
    }
    /* a SHORT ledge let into a wall at one end is a cantilever: a girder runs back to the wall under it (never a pier that stands in the way) */
    if (x1 - x0 + 1 <= 4) { const wl = solid(x0 - 1, y) ? x0 : solid(x1 + 1, y) ? x1 : -1; if (wl >= 0) for (const e of ends) if (e.x !== wl && e.how !== 'rock') { e.how = 'girder'; e.wall = wl === x0 ? x0 - 1 : x1 + 1; delete e.y0; delete e.y1; delete e.ax; delete e.ay; } }
    /* a long run is held in the middle too, by a pier where the floor is close under it */
    if (x1 - x0 + 1 > 8) for (let mx = x0 + 6; mx < x1 - 2; mx += 6) { for (let k = 1; k <= 14; k++) { if (standTop(mx, y + k)) { ends.push({ x: mx, how: 'post', y0: y + 1, y1: y + k, mid: true }); break; } } }
    out.push({ x0, x1, y, ends, ok: ends.every(e => e.how !== 'none') }); } }
  return (L.__skySup = out);
}

/* ----------------------------------------------------------------- THE DRAW ----------------------------------------------------------------- */
const pier = (zone, h) => once('pier' + zone + ':' + h, () => { const [c, g] = canvas(10, h), S = ZONE[zone].s, iron = zone === 2 || zone === 4;
  if (iron) { rect(g, 3, 0, 4, h, '#2c2c38'); rect(g, 3, 0, 1, h, '#8a8aa2'); rect(g, 6, 0, 1, h, '#12121a'); for (let y = 4; y < h - 3; y += 10) { rect(g, 2, y, 6, 2, '#3a3a48'); rect(g, 2, y, 6, 1, '#a0a0b8'); } rect(g, 1, h - 3, 8, 3, '#3a3a48'); rect(g, 1, h - 3, 8, 1, '#a0a0b8'); }
  else { rect(g, 1, 0, 8, h, S[3]); rect(g, 1, 0, 2, h, S[5]); rect(g, 7, 0, 2, h, S[1]); for (let y = 6; y < h - 2; y += 7) { rect(g, 1, y, 8, 1, S[1]); rect(g, 1, y + 1, 8, 1, S[4]); } rect(g, 0, h - 3, 10, 3, S[2]); rect(g, 0, h - 3, 10, 1, S[5]); rect(g, 3, 1, 4, 3, '#7a5a34'); rect(g, 3, 1, 4, 1, '#c8a060'); }
  return outline(c, OUTC); });
const corbel = zone => once('corbel' + zone, () => { const [c, g] = canvas(14, 9), S = ZONE[zone].s, iron = zone === 2 || zone === 4;
  for (let k = 0; k < 8; k++) rect(g, 0, k, 13 - k * 1.5, 1, iron ? (k === 0 ? '#9a9ab0' : '#363644') : (k === 0 ? S[5] : S[2])); rect(g, 0, 0, 2, 9, iron ? '#2c2c38' : S[1]); return outline(c, OUTC); });

export function drawSupports(g, cx, cy, VW, time, plan, L) {
  for (const s of plan.supports) {
    if ((s.x1 + 1) * TS < cx - 140 || s.x0 * TS > cx + VW + 140) continue;
    const zone = zoneOf(s.x0);
    for (const e of s.ends) {
      if (e.how === 'post') { const h = (e.y1 - e.y0) * TS; if (h < 6) continue; const sp = pier(zone, h), off = e.mid ? 0 : e.x === s.x0 ? 2 : -2; g.drawImage(sp, Math.round(e.x * TS + 8 - 5 + off - cx), Math.round(e.y0 * TS - cy)); }
      else if (e.how === 'stay') {   /* a cable from the end of the ledge's underside to an iron ring in the rock */
        const x0 = e.x * TS + 8 - cx, y0 = (s.y + 1) * TS - cy, x1 = e.ax * TS + 8 - cx, y1 = e.ay * TS + 2 - cy, sag = Math.min(8, Math.abs(x1 - x0) * 0.08 + 1);
        for (const [col, w] of [['#241c2c', 3], ['#8a7a58', 1]]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(Math.round(x0) + 0.5, Math.round(y0) + 0.5); g.quadraticCurveTo(Math.round((x0 + x1) / 2) + 0.5, Math.round((y0 + y1) / 2 + sag) + 0.5, Math.round(x1) + 0.5, Math.round(y1) + 0.5); g.stroke(); }
        g.fillStyle = '#3a3a48'; g.fillRect(Math.round(x1) - 3, Math.round(y1) - 1, 7, 3); g.fillStyle = '#b0b0c8'; g.fillRect(Math.round(x1) - 3, Math.round(y1) - 1, 7, 1); g.fillRect(Math.round(x0) - 1, Math.round(y0) - 1, 3, 3); }
      else if (e.how === 'girder') { const x0 = Math.min(s.x0, s.x1) * TS, w = (s.x1 - s.x0 + 1) * TS, y = (s.y + 1) * TS - cy, iron = zone === 2 || zone === 4, wl = e.wall < e.x;   /* a girder under the whole ledge, back into the wall, and a gusset at the wall */
        g.fillStyle = '#14141c'; g.fillRect(Math.round(x0 - cx), Math.round(y), w, 4); g.fillStyle = iron ? '#3a3a48' : '#4a4252'; g.fillRect(Math.round(x0 - cx), Math.round(y), w, 3); g.fillStyle = '#9a9ab0'; g.fillRect(Math.round(x0 - cx), Math.round(y), w, 1);
        for (let rx = 5; rx < w; rx += 12) { g.fillStyle = '#c8c8d8'; g.fillRect(Math.round(x0 - cx) + rx, Math.round(y) + 1, 1, 1); }
        const gx = wl ? x0 - cx : x0 + w - cx; g.fillStyle = '#14141c'; for (let k = 0; k < 10; k++) g.fillRect(Math.round(wl ? gx : gx - 1 - k), Math.round(y + 3 + k), 1 + k, 1); g.fillStyle = '#3a3a48'; for (let k = 0; k < 9; k++) g.fillRect(Math.round(wl ? gx : gx - k), Math.round(y + 3 + k), k, 1); }
      else if (e.how === 'rock') { const sp = corbel(zone), left = e.x === s.x0 ? L.grid[s.y * L.W + e.x - 1] === 1 : false, right = e.x === s.x1 ? L.grid[s.y * L.W + e.x + 1] === 1 : false;
        if (left || right) { g.save(); if (right) { g.translate(Math.round(e.x * TS + 16 - cx), Math.round((s.y + 1) * TS - cy)); g.scale(-1, 1); } else g.translate(Math.round(e.x * TS - cx), Math.round((s.y + 1) * TS - cy)); g.drawImage(sp, 0, 0); g.restore(); } }
    }
  }
}
const glow = (g, x, y, r, a, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
export function drawDress(g, cx, cy, VW, time, plan) {
  const items = plan.items; let lo = 0, hi = items.length; const xmin = cx - 140; while (lo < hi) { const m = (lo + hi) >> 1; if (items[m].x < xmin) lo = m + 1; else hi = m; }
  const wind = (a) => Math.sin(time * 2.1 + a) * 0.5 + Math.sin(time * 5.3 + a * 2) * 0.25;
  for (let i = lo; i < items.length; i++) { const it = items[i]; if (it.x > cx + VW + 40) break;
    const sx = Math.round(it.x - cx), sy = Math.round(it.y - cy); if (sy < -60 || sy > 440) continue;
    switch (it.k) {
      case 'cairn': { const s = spr('cairn', it.z, it.v & 1); g.drawImage(s, sx - 7, sy - s.height + 1); break; }
      case 'bones': { const s = spr('bones', it.z, it.v & 1); g.drawImage(s, sx - 8, sy - s.height + 1); break; }
      case 'spool': { const s = spr('spool'); g.drawImage(s, sx - 7, sy - s.height + 1); break; }
      case 'kitefold': { const s = spr('kitefold', it.v & 1); g.drawImage(s, sx - 5, sy - s.height + 1); break; }
      case 'jar': { const s = spr('jar', it.z, it.v); g.drawImage(s, sx - 5, sy - s.height + 1); if (it.v & 1) g.drawImage(s, sx + 4, sy - s.height + 1); break; }
      case 'sack': { const s = spr('sack'); g.drawImage(s, sx - 6, sy - s.height + 1); break; }
      case 'coil': { const s = spr('coil'); g.drawImage(s, sx - 6, sy - s.height + 1); break; }
      case 'tuft': { const s = spr('tuft', it.z); const sw = Math.round(wind(it.ph) * 0.8); g.drawImage(s, sx - 3 + sw, sy - s.height + 1); break; }
      case 'rubble': { const s = spr('rubble', it.z); g.drawImage(s, sx - 7, sy - s.height + 1); break; }
      case 'anchor': { const s = spr('anchor'); g.drawImage(s, sx - 4, sy - s.height + 1); break; }
      case 'nestb': { const s = spr('nestb', it.z); g.drawImage(s, sx - 7, sy - s.height + 1); break; }
      case 'brazier': { const s = spr('brazier'); g.drawImage(s, sx - 6, sy - s.height + 1);
        const f = 0.7 + 0.3 * Math.sin(time * 11 + it.ph) + 0.1 * Math.sin(time * 23 + it.ph * 3), fh = Math.round(5 + 3 * f); g.fillStyle = '#ff7a1a'; g.fillRect(sx - 3, sy - 13 - fh + 5, 6, fh); g.fillStyle = '#ffb83a'; g.fillRect(sx - 2, sy - 13 - fh + 8, 4, fh - 3); g.fillStyle = '#ffee9a'; g.fillRect(sx - 1, sy - 13 - fh + 11, 2, Math.max(1, fh - 6)); break; }
      case 'lantern': { const s = spr('lantern'); g.drawImage(s, sx - 3, sy - s.height + 1); break; }
      case 'pole': { const h = 34 + (it.ph % 3) * 6, s = spr('pole', h); g.drawImage(s, sx - 3, sy - h + 1);
        const wv = wind(it.ph) * 3; g.fillStyle = '#c9463d'; g.beginPath(); g.moveTo(sx + 1, sy - h + 4); g.lineTo(sx + 14, sy - h + 5 + wv); g.lineTo(sx + 24, sy - h + 9 + wv * 1.6); g.lineTo(sx + 13, sy - h + 12 + wv); g.lineTo(sx + 1, sy - h + 11); g.closePath(); g.fill();
        g.fillStyle = '#efe6d2'; g.fillRect(sx + 3, sy - h + 7, 14, 2); break; }
      case 'glyph': { const s = spr('glyph', it.z); g.globalAlpha = 0.85; g.drawImage(s, sx + (it.side > 0 ? -9 : -1), sy); g.globalAlpha = 1; break; }
      case 'ring': { const s = spr('ring'); g.drawImage(s, sx + (it.side > 0 ? -7 : -1), sy); break; }
      case 'streak': { const s = spr('streak', it.h); g.globalAlpha = 0.8; g.drawImage(s, sx + (it.side > 0 ? -4 : -1), sy); g.globalAlpha = 1; break; }
      case 'tails': { const s = spr('tails', it.n), sw = wind(it.ph); g.save(); g.translate(sx, sy); g.transform(1, 0, sw * 0.18, 1, 0, 0); g.drawImage(s, 0, 0); g.restore(); break; }
    }
  }
  /* THE LIGHT POOLS of the braziers and lanterns: warm, flickering, additive (the level is daylit, so a lit thing throws a glow, not a hole) */
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const l of plan.lights) { if (l.x < cx - 60 || l.x > cx + VW + 60) continue; const f = 1 + (l.fl ? 0.12 * Math.sin(time * 9 + l.x) + 0.06 * Math.sin(time * 19 + l.x * 2) : 0); glow(g, Math.round(l.x - cx), Math.round(l.y - cy), Math.round(l.r * f), l.a, l.c); }
  g.restore();
}
export { SPR as DRESS_SPRITES };
