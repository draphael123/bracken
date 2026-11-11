// scree-art.js - THE SCREE PATH's OWN STONE (claude/scree2; Daniel 10-08: "too many 'ice blocks'"). The foothills are OCHRE: the level's scree, its
// loose rock, its standing stones and its fold gates were baked in a cold blue-grey that read as ice at 320x180, and the Glass Quarry's seam (the cut
// Suncatcher's T.CRYST floor) WAS glass. This holds the quarry's dressing - the hill folk's STONE QUARRY now: stacks of cut blocks with the chisel's marks
// on them, a shear-legs derrick with a block on its rope, a half-cut face - and the warm palette every scree-only bake in art.js now uses.
import { canvas, px, rect, fillPoly, outline, mulberry } from './px.js';
const OUT = '#1b1626';
export const OCHRE = { deep: '#3e3024', dark: '#5a4632', mid: '#7a6046', light: '#a8865a', hi: '#c8a070', pale: '#d8b888', moss: '#7a8a3a' };
/* A STACK OF CUT BLOCKS: v 0 = three in a stair, 1 = two and one on top, 2 = a single long one on chocks. Chisel marks on every face, a drill line or two. */
export function bakeQuarryBlocks(v = 0) {
  const rnd = mulberry(900 + v), [c, g] = canvas(34, 26), O = OCHRE;
  const block = (x, y, w, h) => { rect(g, x, y, w, h, O.mid); rect(g, x, y, w, 2, O.hi); rect(g, x, y, 1, h, O.light); rect(g, x + w - 2, y + 2, 2, h - 2, O.dark); rect(g, x, y + h - 1, w, 1, O.deep);
    for (let i = 0; i < Math.floor(w * h / 18); i++) { const cx = x + 2 + ((rnd() * (w - 5)) | 0), cy = y + 3 + ((rnd() * (h - 5)) | 0); px(g, cx, cy, O.dark); px(g, cx + 1, cy + 1, O.dark); }   /* the chisel's marks: short diagonal bites */
    if (w > 10 && rnd() < 0.7) { const dx = x + 3 + ((rnd() * (w - 6)) | 0); for (let yy = y + 2; yy < y + h - 1; yy += 2) px(g, dx, yy, O.deep); } };   /* a line of drill holes where it was split */
  if (v % 3 === 0) { block(1, 14, 14, 11); block(15, 14, 14, 11); block(8, 4, 14, 10); }
  else if (v % 3 === 1) { block(2, 13, 16, 12); block(18, 15, 13, 10); block(6, 3, 14, 10); }
  else { rect(g, 4, 21, 4, 4, O.deep); rect(g, 24, 21, 4, 4, O.deep); block(1, 10, 32, 11); }
  return outline(c, OUT);
}
/* THE DERRICK: shear legs of two poles lashed at the top, a guy rope, a pulley and a cut block hanging on the fall - the quarrymen's crane */
export function bakeDerrick() {
  const [c, g] = canvas(40, 58), O = OCHRE, wood = '#6a4a2c', woodL = '#8a6640', rope = '#c9b27c';
  for (let i = 0; i < 52; i++) { const t = i / 52; rect(g, Math.round(6 + t * 12), 4 + i, 3, 1, i % 9 === 0 ? woodL : wood); rect(g, Math.round(32 - t * 12), 4 + i, 3, 1, i % 9 === 4 ? woodL : wood); }   /* the two legs, splayed */
  rect(g, 16, 2, 8, 4, '#4a3020'); rect(g, 17, 1, 6, 1, woodL);   /* the lashing at the head */
  for (let y = 6; y < 30; y++) px(g, 20, y, rope);                /* the fall */
  rect(g, 18, 6, 5, 3, '#3a3a3a'); px(g, 20, 7, '#8a8a8a');        /* the pulley block */
  rect(g, 13, 30, 14, 9, O.mid); rect(g, 13, 30, 14, 2, O.hi); rect(g, 25, 32, 2, 7, O.dark); rect(g, 13, 38, 14, 1, O.deep); px(g, 16, 34, O.dark); px(g, 17, 35, O.dark); px(g, 22, 33, O.dark); px(g, 23, 34, O.dark);   /* the block on it */
  for (let i = 0; i < 18; i++) px(g, 22 + i, 4 + Math.round(i * 2.8), rope);   /* the guy rope to its stake */
  rect(g, 4, 55, 8, 3, O.dark); rect(g, 28, 55, 8, 3, O.dark);     /* the legs' footing stones */
  return outline(c, OUT);
}
/* A HALF-CUT FACE: the back wall of the cut, worked in benches, the wedge slots of the next block showing - drawn behind (bg) */
export function bakeQuarryFace() {
  const rnd = mulberry(940), [c, g] = canvas(64, 40), O = OCHRE;
  fillPoly(g, [[0, 40], [0, 8], [14, 8], [14, 18], [34, 18], [34, 4], [52, 4], [52, 22], [64, 22], [64, 40]], O.dark);
  for (const [x0, y, w] of [[0, 8, 14], [14, 18, 20], [34, 4, 18], [52, 22, 12]]) { rect(g, x0, y, w, 2, O.light); rect(g, x0, y + 2, w, 1, O.mid); }   /* the benches' lips */
  for (let i = 0; i < 40; i++) { const x = (rnd() * 62) | 0, y = 10 + ((rnd() * 28) | 0); px(g, x, y, O.mid); px(g, x + 1, y + 1, O.deep); }   /* tool marks */
  for (const [x, y] of [[38, 10], [43, 10], [48, 10], [18, 24], [24, 24], [29, 24]]) rect(g, x, y, 2, 3, O.deep);   /* the wedge slots */
  return outline(c, OUT);
}

/* THE RAM'S PEN WALL (claude/scree2, Daniel 10-08): the fold's shut walls were the generic grey drystone and read icy; this is the same dry-stone course laid in the level's OCHRE
   (warm rubble, dark joints, a lit top edge, the odd moss tuft) - used for the Ram Lord's arena only (src/main.js setWall). Same 16x16 tile, three seeds. */
export function bakeOchreWall(seed = 0) {
  const rnd = mulberry(960 + seed), [c, g] = canvas(16, 16), O = OCHRE;
  rect(g, 0, 0, 16, 16, O.deep);
  const tones = [O.mid, O.light, O.dark, O.mid];
  for (let y = 0; y < 16; y += 4) {
    let x = (y / 4) % 2 ? 2 : 0;
    while (x < 16) {
      const w = 3 + ((rnd() * 4) | 0), t = tones[(rnd() * tones.length) | 0];
      rect(g, x, y, Math.min(w, 16 - x), 3, t);
      px(g, x, y, O.hi); if (w > 3 && rnd() < 0.5) px(g, x + 1, y, O.pale);
      if (rnd() < 0.08) px(g, x + 1, y + 2, O.moss);
      x += w + 1;
    }
  }
  return c;
}

/* ---- THE RAM LORD'S ART (claude/scree3art): the boulder, the ground shock's crack / dust ring / rock-shard ridge, the boulder's socket in the pillar. All baked ONCE (lazily, on first draw)
   in the level's OCHRE; src/ram-lord.js only draws them (drawImage) - every box, radius and timer there is unchanged. ---- */
const memo = new Map(); const once = (k, f) => memo.get(k) || (memo.set(k, f()), memo.get(k));
const hsh = (a, b) => { let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const LADDER = [OCHRE.deep, OCHRE.dark, OCHRE.mid, OCHRE.light, OCHRE.hi, OCHRE.pale];
/* THE BOULDER: BOULDER_N frames of one lumpy 24x24 rock (centre 12,12, body ~r 10 so it fills the hitbox's disc). The strata, speckle, cracks and the moss tuft are laid in the ROCK's own frame
   so they turn as it rolls and its silhouette is lumpy and turns with it; the light stays on the screen's upper left. Frame k = the rock turned k * 360/BOULDER_N degrees. */
export const BOULDER_N = 12;
function bakeBoulderFrame(k) {
  const [c, g] = canvas(24, 24), a = k / BOULDER_N * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
  for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
    const dx = x - 11.5, dy = y - 11.5, rho = Math.hypot(dx, dy), bx = dx * ca + dy * sa, by = -dx * sa + dy * ca, th = Math.atan2(by, bx);
    const R = 9.6 + 0.8 * Math.sin(3 * th + 1) + 0.55 * Math.sin(5 * th + 2.3) + 0.3 * Math.sin(8 * th);
    if (rho > R) continue;
    let t = 2 + (((by + 30) / 4 | 0) % 2 ? 0 : 1);                                   /* strata bands, in the rock's frame */
    const sp = hsh(Math.floor(bx + 40), Math.floor(by + 40)); if (sp < 0.16) t -= 1; else if (sp > 0.93) t += 1;
    const lit = (-dx * 0.62 - dy * 0.78) / R; if (lit > 0.42) t += 1; if (lit > 0.78) t += 1; if (lit < -0.3) t -= 1; if (lit < -0.62) t -= 1;
    let col = LADDER[Math.max(0, Math.min(5, t))];
    const cr = Math.abs((bx * 0.82 + by * 0.57) - 2.2), cr2 = Math.abs((bx * 0.35 - by * 0.94) + 3.5);
    if ((cr < 0.55 && by < 4 && by > -8) || (cr2 < 0.5 && bx > -2 && bx < 7)) col = OCHRE.deep;   /* two cracks, one running one way, one the other */
    if (Math.hypot(bx - 3.5, by + 6.2) < 2.1 && sp > 0.25) col = sp > 0.7 ? OCHRE.moss : '#4e5a2a';   /* a moss tuft: the cue that it IS turning */
    if (rho > R - 1.1) col = lit > 0.1 ? OCHRE.hi : lit < -0.35 ? OCHRE.deep : col;
    px(g, x, y, col);
  }
  return outline(c, OUT);
}
export const boulderFrame = rot => { const k = Math.floor((((rot % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * BOULDER_N) % BOULDER_N; return once('boulder' + k, () => bakeBoulderFrame(k)); };
/* THE SOCKET the boulder works loose from: a ragged dark hollow in the pillar's face with cracks running out of it and chipped rock at its lip. 32x32, centre (16,16); drawn behind the half-rock. */
export function bakeBoulderSocket() {
  const [c, g] = canvas(32, 32), O = OCHRE;
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const dx = x - 16, dy = y - 16, th = Math.atan2(dy, dx), R = 11.8 + 1.1 * Math.sin(4 * th + 0.7) + 0.7 * Math.sin(7 * th);
    if (Math.hypot(dx, dy) <= R) px(g, x, y, Math.hypot(dx, dy) > R - 1.4 ? (dx + dy < 0 ? O.deep : O.dark) : (dy > 6 ? '#3a2e2a' : '#2a201e')); }
  for (let k = 0; k < 7; k++) { let x = 16, y = 16; const a = k * 0.9 + 0.3, len = 5 + (k * 5) % 5; for (let s = 0; s < len; s++) { x += Math.cos(a) * 1.2 + (hsh(k, s) - 0.5) * 1.1; y += Math.sin(a) * 1.2 + (hsh(s, k) - 0.5) * 1.1; if (Math.hypot(x - 16, y - 16) > 10.5) px(g, x, y, O.deep); } }   /* fractures running out of it */
  for (const [x, y] of [[3, 10], [4, 22], [27, 6], [28, 24], [10, 3], [21, 28], [6, 28], [26, 12]]) { px(g, x, y, O.light); px(g, x + 1, y + 1, O.dark); }   /* chipped rock round it */
  return c;
}
export const boulderSocket = () => once('socket', bakeBoulderSocket);
/* THE ROCK-SHARD RIDGE a ground shock travels as: 24x8, foot at row 7, centre column 12, THREE variants. The stones are 2-4 px tall + the outline, so 5 px at most above the foot (the wave hit height is 5: never taller), each a lit wedge with a dark foot; grit is the draw's. */
function bakeShardRidge(v) {
  const [c, g] = canvas(24, 8), O = OCHRE;
  rect(g, 1, 7, 22, 1, O.deep);
  for (let i = 0, x = 1 + (v % 2); x < 22; i++) { const w = 3 + (hsh(v, i) < 0.4 ? 1 : 0), h = 3 + ((hsh(v + 9, i) * 3) | 0) % 3 - (x < 4 || x > 17 ? 1 : 0), hh = Math.max(2, Math.min(4, h)), lean = hsh(v + 3, i) < 0.5 ? 0 : 1;
    for (let r = 0; r < hh; r++) { const inset = r >= hh - 1 ? 1 : 0, l = x + inset + (lean && r > 1 ? 1 : 0), ww = Math.max(1, w - inset * 2); rect(g, l, 7 - 1 - r, ww, 1, r === hh - 1 ? O.pale : O.light); px(g, l, 7 - 1 - r, r > hh - 3 ? '#f0dcb8' : O.hi); px(g, l + ww - 1, 7 - 1 - r, O.mid); }
    rect(g, x, 6, w, 1, O.dark); x += w + 1 + (hsh(v + 5, i) < 0.3 ? 1 : 0); }
  return outline(c, '#3e3024');
}
export const shardRidge = v => once('ridge' + (v % 3), () => bakeShardRidge(v % 3));
/* THE GROUND CRACK left at the hoof: 64x10 (centre 32, y 5), jagged both ways with twigs and a lit lip under the dark line; 3 variants, mirrored by the draw. */
function bakeStompCrack(v) {
  const [c, g] = canvas(64, 10), O = OCHRE;
  for (const dir of [-1, 1]) for (let b = 0; b < 3; b++) { let x = 32 + dir * (b ? 3 : 0), y = 4 + (b === 1 ? -1 : b === 2 ? 1 : 0); const len = b ? 5 : 9 - (dir > 0 ? v % 2 : 0);
    for (let s = 0; s < len; s++) { const step = 2 + ((hsh(v + b * 7, s + dir * 11) * 3) | 0); for (let q = 0; q < step; q++) { x += dir; px(g, x, y, '#1e1622'); px(g, x, y + 1, O.pale); } y += ((hsh(v + b, s * 3 + dir) * 3) | 0) - 1; y = Math.max(1, Math.min(8, y)); px(g, x, y, '#1e1622'); if (hsh(v, s + b + 20) < 0.3) px(g, x, y - 1, O.dark); } }
  rect(g, 30, 4, 5, 2, '#1e1622'); px(g, 31, 3, O.dark); px(g, 33, 6, O.pale);
  return c;
}
export const stompCrack = v => once('crack' + (v % 3), () => bakeStompCrack(v % 3));
/* THE DUST RING: DUST_N frames, 104x30 (centre 52,15): an ellipse of puffs, growing from the hoof out to 46 px wide (rx) and thinning as it goes; alpha is the draw's. */
export const DUST_N = 7;
function bakeDustRing(k) {
  const [c, g] = canvas(104, 30), O = OCHRE, f = (k + 1) / DUST_N, rx = 46 * f, ry = 11 * f, n = 26;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + hsh(k, i) * 0.12, x = 52 + Math.cos(a) * rx, y = 15 + Math.sin(a) * ry, w = Math.max(2, Math.round(4 - f * 1.5 + hsh(i, k) * 2)), h = Math.max(1, Math.round(w * 0.6));
    const far = Math.sin(a) < 0;   /* the far side behind is dimmer */
    rect(g, x - w / 2, y - h / 2, w, h, far ? O.light : O.pale); rect(g, x - w / 2, y - h / 2, w, 1, far ? O.hi : '#f0dcb8'); rect(g, x - w / 2 + 1, y + h / 2, Math.max(1, w - 1), 1, O.mid); }
  return c;
}
export const dustRing = k => once('dust' + Math.max(0, Math.min(DUST_N - 1, k)), () => bakeDustRing(Math.max(0, Math.min(DUST_N - 1, k))));
