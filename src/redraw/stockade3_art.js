// src/redraw/stockade3_art.js - THE STOCKADE's wall, ground and camp dressing (claude/stockade3, Daniel 10-22: "visually still needs work"). ART ONLY: nothing here changes a tile
// kind, a hitbox or a level entity (the level hash stands); it redraws and decorates.
//   palTile / palTop   the palisade wall with DEPTH: logs of uneven tone with dark gaps, a lashed rail across them with its shadow under it, stones and mud at the foot; and its
//                      tips - a back row of taller dark stakes behind a front row of pale cut points, every run different
//   dress              ground variety (trodden paths with ruts and boot scuffs, mud with a wet sheen - baked into the surface tiles) and camp life on the ground (stake clusters, kennels
//                      by the hounds, a big war tent, chop blocks, wood piles, stretched hides, bone scatter, a water trough), all as `decor` (not level data)
import { canvas, px, rect, fillPoly, line, mulberry } from '../px.js';
import { ST } from './stockade2_art.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };

/* ------------------------------------------------------------------ the palisade ------------------------------------------------------------------ */
/* one 16x16 cell of the wall. x = column (variants), foot = the cell under it is not wall (ground meets it), rail = a lashed pole crosses this cell (every other row) */
export function palTile(x, foot, y = 0) {
  const v = ((x * 7) % 5 + 5) % 5, rail = (y & 1) === 0;
  return once('pt' + v + (foot ? 'f' : '') + (rail ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(v * 13 + 7);
    for (let i = 0; i < 4; i++) { const lx = i * 4, tone = (i + v) % 3, body = tone === 1 ? ST.w3 : ST.w2;       /* four logs, 4 px, each a different tone: a dark seam, a lit edge, the body, a shaded edge */
      rect(g, lx, 0, 1, 16, ST.w0); rect(g, lx + 1, 0, 1, 16, tone === 1 ? ST.w5 : ST.w4); rect(g, lx + 2, 0, 1, 16, body); rect(g, lx + 3, 0, 1, 16, ST.w1);
      for (let k = 0; k < 2; k++) { const ky = 1 + ((r() * 14) | 0); px(g, lx + 2, ky, ST.w1); px(g, lx + 1, ky + 1, ST.w2); }                                  /* a knot and a bark seam */ }
    if (rail) { rect(g, 0, 5, 16, 3, ST.w1); rect(g, 0, 5, 16, 1, ST.w3); rect(g, 0, 7, 16, 1, ST.w0);                                                     /* the lashed rail across the logs, its shadow under it */
      for (let i = 0; i < 4; i += 2) { rect(g, i * 4 + 1, 4, 3, 5, ST.r0); rect(g, i * 4 + 1, 4, 3, 1, ST.r1); px(g, i * 4 + 2, 6, ST.w0); px(g, i * 4 + 1, 7, ST.w1); }   /* a rope wrap on every second log */
      rect(g, 0, 8, 16, 1, 'rgba(14,8,4,0.55)'); }
    if (foot) { rect(g, 0, 12, 16, 4, ST.dirt); rect(g, 0, 12, 16, 1, ST.w0);                                                                          /* packed earth and stones heaped against the foot */
      for (const sx of [0, 5, 10]) { rect(g, sx + (v & 1), 13, 5, 3, ST.stone); rect(g, sx + (v & 1), 13, 5, 1, ST.stoneHi); rect(g, sx + (v & 1), 15, 5, 1, ST.o); }
      for (let i = 0; i < 6; i++) px(g, (r() * 16) | 0, 12 + ((r() * 2) | 0), '#3a2418'); }
    return c; });
}
/* the tips of a run of wall: `tx` varies them. A back row of taller, darker stakes (the far face of the wall) behind the front row's pale cut points. 16 x 10, drawn bottom-anchored on the cell. */
export function palTop(tx) {
  const v = ((tx * 5) % 7 + 7) % 7;
  return once('ptop' + v, () => {
    const [c, g] = canvas(16, 10), r = mulberry(v * 29 + 3);
    for (let i = 0; i < 3; i++) { const bx = 1 + i * 5 + ((r() * 2) | 0), h = 7 + ((r() * 3) | 0); rect(g, bx, 10 - h + 2, 3, h, ST.w0); rect(g, bx, 10 - h + 2, 1, h, ST.w1); px(g, bx + 1, 10 - h + 1, ST.w0); }   /* the back stakes */
    for (let i = 0; i < 4; i++) { const lx = i * 4, h = 3 + ((r() * 4) | 0) + (((i + v) % 5) === 0 ? 2 : 0), top = 10 - h;     /* the front stakes: uneven, each with a cut tip */
      rect(g, lx + 1, top + 2, 3, h - 2, ST.w2); rect(g, lx + 1, top + 2, 1, h - 2, ST.w4); rect(g, lx + 3, top + 2, 1, h - 2, ST.w1);
      rect(g, lx + 2, top + 1, 1, 2, ST.w3); px(g, lx + 2, top, ST.w5); px(g, lx + 2, top + 1, ST.w5); px(g, lx + 1, top + 2, ST.w5); }
    return c; });
}

/* ------------------------------------------------------------------ ground variants (baked into a surface tile) ------------------------------------------------------------------ */
const wr = new WeakMap();
/* the camp's ground is not one lawn: kind 'path' = trodden (grass worn to packed earth, wheel ruts, boot scuffs), 'mud' = a wet churned patch with a sheen. Returns a NEW canvas (cached per source sprite). */
export function groundVariant(spr, kind, seed) {
  let m = wr.get(spr); if (!m) { m = new Map(); wr.set(spr, m); }
  const key = kind + (seed % 4); if (m.has(key)) return m.get(key);
  const [c, g] = canvas(16, spr.height || 16), r = mulberry(seed * 19 + (kind === 'mud' ? 5 : 11));
  g.drawImage(spr, 0, 0);
  if (kind === 'path') {
    rect(g, 0, 0, 16, 6, '#6e5038'); rect(g, 0, 0, 16, 1, '#9a7650'); rect(g, 0, 1, 16, 1, '#86643f'); rect(g, 0, 5, 16, 1, '#5a4030');   /* the grass is gone: packed, pale earth, fading into the dirt */
    for (let i = 0; i < 14; i++) px(g, (r() * 16) | 0, (r() * 5) | 0, r() < 0.5 ? '#8a6a46' : '#4a3220');
    rect(g, 0, 3, 16, 1, '#4a3220'); if (seed % 2) { rect(g, 2, 2, 6, 1, '#3e2a1c'); rect(g, 10, 2, 5, 1, '#3e2a1c'); }   /* wheel ruts */
    for (let i = 0; i < 2; i++) { const bx = 2 + ((r() * 11) | 0); rect(g, bx, 0, 3, 1, '#b08a5c'); px(g, bx, 1, '#4a3220'); px(g, bx + 2, 1, '#4a3220'); }   /* boot scuffs */
    for (let i = 0; i < 2; i++) { const sx = (r() * 14) | 0; rect(g, sx, 1, 2, 1, '#8a8478'); px(g, sx, 1, '#b4ae9e'); }   /* a pebble or two */
  } else {
    rect(g, 0, 0, 16, 7, '#46291c'); rect(g, 0, 0, 16, 1, '#62402c'); rect(g, 0, 6, 16, 1, '#2e1c12'); rect(g, 0, 3, 16, 1, '#3a2216');
    for (let i = 0; i < 14; i++) px(g, (r() * 16) | 0, (r() * 6) | 0, r() < 0.5 ? '#2e1c12' : '#5c3c28');
    const px0 = 1 + ((r() * 7) | 0); rect(g, px0, 1, 8, 3, '#2a3652'); rect(g, px0 + 1, 1, 6, 1, '#4a5e8a'); rect(g, px0 + 1, 1, 3, 1, '#7a92c0'); px(g, px0 + 5, 2, '#c8d6f0');   /* a puddle with a sheen */
  }
  m.set(key, c); return c;
}

/* ------------------------------------------------------------------ ground props (decor sprites) ------------------------------------------------------------------ */
function stakeCluster(v) {
  return once('stk' + v, () => { const [c, g] = canvas(18, 14);
    for (const [x, lean, h] of v ? [[3, -1, 11], [8, 0, 13], [13, 1, 10]] : [[2, -1, 9], [7, -1, 12], [12, 1, 11], [15, 1, 8]]) {   /* sharpened stakes leaning out, lashed once */
      for (let y = 0; y < h; y++) { const xx = x + Math.round(lean * y / h * -3); rect(g, xx, 14 - y - 1, 3, 1, y > h - 4 ? ST.w4 : ST.w2); rect(g, xx, 14 - y - 1, 1, 1, ST.w4); rect(g, xx + 2, 14 - y - 1, 1, 1, ST.w1); }
      px(g, x + Math.round(lean * (h - 1) / h * -3) + 1, 14 - h - 0, ST.w5); }
    rect(g, 0, 11, 18, 3, ST.r1); rect(g, 0, 11, 18, 1, ST.r2); rect(g, 0, 13, 18, 1, ST.r0);
    return c; });
}
function chopBlock() {
  return once('chop', () => { const [c, g] = canvas(16, 12);
    rect(g, 2, 5, 9, 7, ST.o); rect(g, 3, 6, 7, 6, ST.w2); rect(g, 3, 6, 1, 6, ST.w4); rect(g, 9, 6, 1, 6, ST.w1); rect(g, 2, 3, 9, 3, ST.w4); rect(g, 3, 4, 7, 1, ST.w5); rect(g, 5, 4, 3, 1, ST.w3); px(g, 6, 4, ST.w4);
    line(g, 11, 0, 8, 7, '#8a5a32', 1); line(g, 12, 0, 9, 7, ST.w1, 1); rect(g, 11, 0, 4, 3, ST.iron); rect(g, 11, 0, 4, 1, ST.ironHi);   /* the axe, buried in the block */
    for (const [x, y] of [[0, 10], [12, 11], [13, 9], [1, 8]]) { rect(g, x, y, 3, 1, ST.w3); px(g, x, y, ST.w5); }                                                  /* chips */
    return c; });
}
function woodPile() { return once('pile', () => { const [c, g] = canvas(20, 11);
  for (let i = 0; i < 4; i++) { rect(g, 1 + i * 5, 6, 5, 5, ST.o); rect(g, 2 + i * 5, 7, 3, 3, ST.w3); px(g, 3 + i * 5, 8, ST.w5); }
  for (let i = 0; i < 3; i++) { rect(g, 3 + i * 5, 1, 5, 5, ST.o); rect(g, 4 + i * 5, 2, 3, 3, ST.w2); px(g, 5 + i * 5, 3, ST.w4); }
  return c; }); }
function bonesScatter(v) { return once('bone' + v, () => { const [c, g] = canvas(16, 5);
  rect(g, 1, 3, 5, 1, ST.bone); px(g, 0, 2, ST.bone); px(g, 0, 4, ST.bone); px(g, 6, 2, ST.bone); px(g, 6, 4, ST.bone);
  if (v) { rect(g, 9, 3, 4, 2, ST.boneLo); px(g, 10, 3, ST.o); px(g, 12, 3, ST.o); rect(g, 13, 4, 2, 1, ST.boneLo); } else { rect(g, 8, 4, 3, 1, ST.boneLo); rect(g, 12, 2, 1, 3, ST.bone); }
  return c; }); }
function waterTrough() { return once('trough', () => { const [c, g] = canvas(22, 11);
  rect(g, 1, 3, 20, 6, ST.o); rect(g, 2, 4, 18, 4, ST.w3); rect(g, 2, 4, 18, 1, ST.w5); rect(g, 3, 5, 16, 2, '#2e3a58'); rect(g, 5, 5, 6, 1, '#6a82b0');
  rect(g, 3, 9, 2, 2, ST.w1); rect(g, 17, 9, 2, 2, ST.w1); return c; }); }
function hideFrame() { return once('hide', () => { const [c, g] = canvas(24, 22);
  rect(g, 1, 0, 2, 22, ST.w1); rect(g, 21, 0, 2, 22, ST.w1); rect(g, 1, 1, 22, 2, ST.w2); rect(g, 1, 17, 22, 2, ST.w2);
  fillPoly(g, [[4, 4], [20, 4], [21, 12], [18, 17], [6, 17], [3, 11]], '#8a6a54'); fillPoly(g, [[5, 5], [12, 5], [12, 16], [6, 16]], '#a07e64');
  for (const x of [4, 8, 12, 16, 20]) { px(g, x, 3, ST.r1); px(g, x, 18, ST.r1); } return c; }); }
/* a doghouse of lashed planks, its roof pitched, a chain staked to the ground, two eyes in the dark door */
export function kennel() { return once('kennel', () => { const [c, g] = canvas(30, 20);
  rect(g, 3, 8, 22, 12, ST.o); rect(g, 4, 9, 20, 11, ST.w2); for (let x = 5; x < 24; x += 4) rect(g, x, 9, 1, 11, ST.w1); rect(g, 4, 9, 20, 1, ST.w4);
  fillPoly(g, [[1, 9], [14, 1], [27, 9]], ST.w1); fillPoly(g, [[3, 9], [14, 3], [25, 9]], ST.w3); line(g, 3, 9, 14, 3, ST.w5, 1); rect(g, 13, 1, 2, 3, ST.w0);
  rect(g, 9, 11, 10, 9, '#0e0a10'); rect(g, 8, 10, 1, 10, ST.w4); rect(g, 19, 10, 1, 10, ST.w1);
  rect(g, 11, 14, 2, 1, '#e0602c'); rect(g, 16, 14, 2, 1, '#e0602c'); px(g, 11, 14, '#ffd070'); px(g, 16, 14, '#ffd070');   /* the hound's eyes */
  rect(g, 26, 18, 1, 2, ST.ironHi); for (let i = 0; i < 4; i++) rect(g, 22 + i, 17 + (i & 1), 1, 1, ST.iron);               /* the chain to its stake */
  return c; }); }
/* a war tent: a tall hide cone with a lit door, a skull on the ridge, a banner pole */
export function bigTent() { return once('bigtent', () => { const [c, g] = canvas(48, 36);
  fillPoly(g, [[24, 4], [46, 35], [2, 35]], '#3a2a3a'); fillPoly(g, [[24, 4], [15, 35], [2, 35]], '#4e3a4e'); fillPoly(g, [[24, 4], [46, 35], [34, 35]], '#2a1e2c');
  for (const [x0, y0, x1, y1] of [[24, 5, 12, 35], [24, 5, 24, 35], [24, 5, 36, 35]]) line(g, x0, y0, x1, y1, '#1e1420', 1);
  rect(g, 23, 0, 2, 6, ST.w2); rect(g, 22, 0, 4, 3, ST.bone); px(g, 23, 1, ST.o); px(g, 25, 1, ST.o);
  fillPoly(g, [[24, 17], [32, 35], [16, 35]], '#12080a'); fillPoly(g, [[24, 21], [29, 35], [19, 35]], '#c0602a'); fillPoly(g, [[24, 26], [27, 35], [21, 35]], '#ffd070');
  rect(g, 40, 8, 1, 26, ST.w2); rect(g, 40, 8, 8, 9, ST.red); rect(g, 40, 8, 8, 1, '#e06a5a'); rect(g, 43, 11, 2, 2, '#1a0e10');
  return c; }); }

/* ------------------------------------------------------------------ dressing ------------------------------------------------------------------ */
/* Walks the level once at load: decor props that stand on the floor and ground variants baked into surface tiles. Seeded: the same camp every time. */
export function dress(decor, lights, L, tileAt, T, tileSpr, LW, TS) {
  const r = mulberry(31022), W = L.W, H = L.H, areas = (L.stockade && L.stockade.areas) || [];
  const areaOf = t => { for (const a of areas) if (t >= a[1] && t < a[2]) return a[0]; return 'THE GREAT HALL'; };
  const inBox = (x, boxes) => (boxes || []).some(b => x >= b.x0 - 1 && x <= b.x1 + 1);
  const arena = L.arena ? [Math.floor(L.arena.x0 / TS) - 6, Math.ceil(L.arena.x1 / TS) + 2] : [1e9, -1];
  const busy = new Set(); for (const e of L.ents) if (['sign', 'check', 'gate', 'barrel', 'torch', 'crank', 'rack', 'brazier', 'cage', 'cart', 'logpile', 'catapult', 'oathlance', 'chief', 'towertop', 'treehouse', 'deco', 'bridge', 'shield', 'brute', 'pike', 'sapper', 'hound', 'archer', 'sprig'].includes(e.t)) for (let d = -2; d <= 2; d++) busy.add(e.x + d);
  for (const l of lights) if (l.dress || l.torch) busy.add(Math.round((l.x - 8) / TS));
  const floor = x => { for (let y = 12; y < H - 3; y++) if (tileAt(x, y) === T.SOLID && tileAt(x, y - 1) === T.AIR) return y; return -1; };
  const flat = (x, y) => y > 0 && floor(x - 1) === y && floor(x + 1) === y;
  const ok = (x, w) => { if (x < 3 || x > W - 4 || (x >= arena[0] && x <= arena[1])) return false; for (let d = 0; d < w; d++) if (busy.has(x + d)) return false; return true; };
  const put = (c, x, y, bg = false) => decor.push({ k: 'stk3', kind: 'stk3', x: x * TS + ((TS - c.width) >> 1), y: y * TS - c.height + 1, c, bg, sway: 0, ph: r() * 6, fire: false });
  let runKind = null, rem = 0, lastProp = -99;
  for (let x = 4; x < W - 4; x++) {
    const a = areaOf(x), y = floor(x); if (y < 0 || inBox(x, L.stkTowers) || (x >= arena[0] && x <= arena[1])) { rem = 0; runKind = null; continue; }
    if (rem <= 0) { const q = r(), camp = a === 'THE OUTER CAMP' || a === 'THE YARD', wall = a === 'THE WALL WALK AND THE KENNELS';
      if (q < (camp ? 0.34 : wall ? 0.3 : 0.12)) { runKind = 'path'; rem = 7 + ((r() * 9) | 0); } else if (q < (camp ? 0.46 : wall ? 0.46 : 0.2)) { runKind = 'mud'; rem = 3 + ((r() * 4) | 0); } else { runKind = null; rem = 3 + ((r() * 7) | 0); } }
    rem--;
    const i = y * LW + x, spr = tileSpr[i];
    if (runKind && spr && flat(x, y)) tileSpr[i] = groundVariant(spr, runKind, x);
    /* props: one now and then, spaced, on flat ground with nothing near it */
    if (x - lastProp >= 7 && flat(x, y)) {
      const q = r();
      if (q < 0.1 && ok(x, 2)) { put(stakeCluster((x >> 1) & 1), x, y); lastProp = x; }
      else if (q < 0.16 && ok(x, 2)) { put(chopBlock(), x, y); lastProp = x; }
      else if (q < 0.21 && ok(x, 2)) { put(woodPile(), x, y); lastProp = x; }
      else if (q < 0.26 && ok(x, 1)) { put(bonesScatter(x & 1), x, y); lastProp = x - 3; }
      else if (q < 0.285 && ok(x, 2) && (a === 'THE YARD' || a === 'THE WALL WALK AND THE KENNELS')) { put(waterTrough(), x, y); lastProp = x; }
      else if (q < 0.315 && ok(x, 2) && a !== 'THE WALL WALK AND THE KENNELS') { put(hideFrame(), x, y, true); lastProp = x; }
      else if (q < 0.33 && ok(x, 3) && a === 'THE OUTER CAMP') { put(bigTent(), x + 1, y, true); lastProp = x + 2; }
    }
  }
  /* a kennel beside every hound the level places, on its floor (the camp keeps its dogs in these) */
  for (const e of L.ents) if (e.t === 'hound') { const y = floor(e.x - 3); if (y > 0 && ok(e.x - 4, 1)) put(kennel(), e.x - 4, y, true); }
}
