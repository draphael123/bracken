// redgorge_tiles.js - THE RED GORGE's own TILE KIT (claude/redgorge-art). Banded red sandstone in strata that goes DARKER the deeper it is (the whole gorge is in
// the canyon's shade), a LIT LIP on every standable edge (the canalart rule: found from across the gorge), overhangs with a hanging shadow under them, the CHANNEL's
// scoured pale rock (the rule's second voice: lighter than anything else in the gorge, top to bottom), the old dam's cut masonry (x >= DAM_X), lashed-plank rope bridges
// and rock-shelf climbing ledges, and the thick knotted climbing rope. Made from px.js primitives; each tile 16x16, baked once and memoised.
//   gorgeTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
// The rules: a wall mass is darker than the floor on it; every ledge top is warm-lit (reflected light off the far wall); the channel is the palest thing on the screen.
import { canvas, px, rect, mulberry } from '../px.js';
import { tile as newGroundTile } from './redgorge2_art.js';   /* THE RAPIDS' rock, the nest ledge's pillars and bed (claude/redgorge2 art pass) */

export const DAM_X = 48;
export const RK = { r0: '#240f0e', r1: '#3c1a16', r2: '#5c2c20', r3: '#76382a', r4: '#92503a', r5: '#ae6646', lip0: '#b8683e', lip1: '#e0905a', lip2: '#f6c488',
  pale0: '#7a5844', pale1: '#9c7860', pale2: '#bd9878', pale3: '#ecc4a6', pale4: '#f2d8b4',
  mas0: '#3a1c18', mas1: '#58302a', mas2: '#76443a', mas3: '#92584a', mort: '#1a0c0c',
  w0: '#2a1c12', w1: '#46301c', w2: '#6a4a2a', w3: '#8e683a', w4: '#b08a50', rope: '#c8a868', ropeD: '#7a5c34', ropeL: '#e8d09a', iron: '#3a3a42' };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };

/* THE STRATA: a global table of bands by pixel row (thickness 3-8 px, a tone 0-4 each); tone drifts with depth so the gorge gets darker the lower it is */
const BANDS = (() => { const rr = mulberry(9041), out = []; let y = 0, k = 0; while (y < 2900) { const th = 4 + ((rr() * 6) | 0), tone = [0, 1, 1, 2, 2, 3, 3, 4][(rr() * 8) | 0]; out.push({ y0: y, y1: y + th, tone, k: k++ }); y += th; } return out; })();
const bandAt = sy => { let lo = 0, hi = BANDS.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (BANDS[m].y0 <= sy) lo = m; else hi = m - 1; } return BANDS[lo]; };
const TONE = [RK.r2, RK.r3, RK.r4, RK.r5, RK.r3];
const dark = (c, a) => { const n = parseInt(c.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; const q = v => Math.max(0, Math.round(v * a)).toString(16).padStart(2, '0'); return '#' + q(r) + q(g) + q(b); };
/* the shade: rows nearer the rim see a little sky, the rows deep in the gorge nearly none */
const shadeAt = ty => ty < 20 ? 1.0 : ty < 60 ? 0.94 : ty < 110 ? 0.86 : 0.76;

/* a wall face tile: strata bands with a wavy edge, seams, pits and fine cracks; edges say which sides touch air */
function face(tx, ty, e, deep, pale) {
  return once('f' + (tx & 3) + '_' + ty + '_' + e + deep + pale, () => { const [c, g] = canvas(16, 16), r = mulberry(hash(tx & 3, ty) + 11), sh = shadeAt(ty) * (deep ? 0.72 : 1);
    for (let x = 0; x < 16; x++) { const gx = (tx & 3) * 16 + x, wob = Math.round(Math.sin(gx / 64 * Math.PI * 2 * 2 + ty * 1.3) * 1.5);
      let last = -1; for (let y = 0; y < 16; y++) { const sy = ty * 16 + y + wob, b = bandAt(sy), seam = sy === b.y0, lit = sy === b.y0 + 1 && b.tone >= 2;
        let col = pale ? [RK.pale0, RK.pale1, RK.pale2, RK.pale2, RK.pale1][b.tone] : dark(TONE[b.tone], sh);
        if (seam) col = pale ? RK.pale0 : RK.r0; else if (lit) col = pale ? RK.pale3 : dark(RK.r5, sh * 0.9); px(g, x, y, col); last = b.k; } }
    for (let i = 0; i < 7; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, pale ? RK.pale0 : dark(RK.r1, sh));                                   /* pits */
    for (let i = 0; i < 4; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, pale ? RK.pale4 : dark(RK.r5, sh * 0.8));                                /* flecks of lit grain */
    if (r() < 0.35) { let x = (r() * 14 + 1) | 0; for (let y = 2 + ((r() * 6) | 0); y < 14; y++) { px2(g, x, y, pale ? RK.pale0 : RK.r0); if (r() < 0.4) x += r() < 0.5 ? -1 : 1; } }   /* a hairline crack */
    if (!pale) { const side = (x0, w, col, a) => { g.globalAlpha = a; rect(g, x0, 0, w, 16, col); g.globalAlpha = 1; };
      if (e & 1) { rect(g, 0, 0, 1, 16, RK.r0); side(1, 2, '#000', 0.3); }                                              /* air to the west: a shadowed face */
      if (e & 2) { rect(g, 15, 0, 1, 16, dark(RK.lip0, sh * 0.8)); side(13, 2, RK.lip0, 0.16); } }                        /* air to the east: the reflected light on the edge */
    else { if (e & 1) rect(g, 0, 0, 1, 16, RK.pale0); if (e & 2) rect(g, 15, 0, 1, 16, RK.pale4); }
    if (e & 4) {   /* air below: the overhang's hanging shadow, ragged */
      for (let x = 0; x < 16; x++) { const d = 3 + ((hash(x + (tx & 3) * 16, ty) % 3)); for (let y = 16 - d; y < 16; y++) px2(g, x, y, y > 16 - d + 1 ? (pale ? RK.pale0 : RK.r0) : (pale ? RK.pale1 : RK.r1)); }
      g.globalAlpha = 0.35; rect(g, 0, 8, 16, 5, '#000'); g.globalAlpha = 1; }
    return c; });
}
/* a TOP tile: the lit lip (warm light catching the edge), a ragged bevel under it, then the strata */
function top(tx, ty, e, pale) {
  return once('t' + (tx & 3) + '_' + ty + '_' + e + pale, () => { const base = face(tx, ty, e & 3, 0, pale), [c, g] = canvas(16, 16), r = mulberry(hash(tx & 3, ty) + 99); g.drawImage(base, 0, 0);
    const L0 = pale ? RK.pale4 : RK.lip2, L1 = pale ? RK.pale3 : RK.lip1, L2 = pale ? RK.pale2 : RK.lip0;
    rect(g, 0, 0, 16, 1, L0); rect(g, 0, 1, 16, 1, L1); rect(g, 0, 2, 16, 1, L2);
    for (let x = 0; x < 16; x++) { const d = (hash(x + (tx & 3) * 16, ty + 7) % 3); if (d === 0) px2(g, x, 3, L2); if (d === 1) px2(g, x, 2, L1); }
    for (let i = 0; i < 3; i++) px2(g, (r() * 16) | 0, 0, L0);
    g.globalAlpha = 0.28; rect(g, 0, 3, 16, 3, '#000'); g.globalAlpha = 1;                                                                   /* the lip's own shadow on the face under it */
    if (e & 1) { px2(g, 0, 0, RK.r1); px2(g, 0, 1, RK.r1); } return c; });
}
/* the dam's cut masonry: ashlar courses 8 rows high, blocks offset, dark mortar, a few chipped blocks; a coped lit top */
function ashlar(tx, ty, isTop, e) {
  return once('a' + (tx & 3) + '_' + ty + isTop + e, () => { const [c, g] = canvas(16, 16), r = mulberry(hash(tx & 3, ty) + 5); rect(g, 0, 0, 16, 16, RK.mort);
    for (let row = 0; row < 2; row++) { const off = ((ty * 2 + row) & 1) ? 8 : 0; for (let bx = -8; bx < 16; bx += 16) { const x = bx + off, t = r(); const col = t < 0.2 ? RK.mas3 : t < 0.55 ? RK.mas2 : RK.mas1;
      rect(g, x + 1, row * 8 + 1, 15, 7, col); rect(g, x + 1, row * 8 + 1, 15, 1, t < 0.3 ? RK.mas3 : RK.mas2); rect(g, x + 1, row * 8 + 7, 15, 1, RK.mas0);
      for (let i = 0; i < 4; i++) px2(g, x + 2 + ((r() * 13) | 0), row * 8 + 2 + ((r() * 5) | 0), RK.mas0); } }
    if (isTop) { rect(g, 0, 0, 16, 5, RK.mas2); rect(g, 0, 0, 16, 1, RK.lip2); rect(g, 0, 1, 16, 1, RK.lip1); rect(g, 0, 2, 16, 1, RK.lip0); rect(g, 0, 5, 16, 1, RK.mort); rect(g, 7 + (tx & 1) * 3, 2, 1, 3, RK.mas0); }
    if (e & 1) rect(g, 0, 0, 1, 16, RK.mort); if (e & 2) { rect(g, 15, 0, 1, 16, RK.mas3); }
    g.globalAlpha = 0.28; rect(g, 0, 0, 16, 16, '#000'); g.globalAlpha = 1; return c; });
}
/* a ROCK SHELF (a climbing ledge): a slab with a lit top, a strata edge, a ragged dark underside */
function shelf(l, r, v) {
  return once('sh' + l + r + v, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 7 + 3); rect(g, 0, 0, 16, 8, RK.r4); rect(g, 0, 0, 16, 1, RK.lip2); rect(g, 0, 1, 16, 1, RK.lip1); rect(g, 0, 2, 16, 1, RK.lip0);
    rect(g, 0, 3, 16, 1, RK.r5); rect(g, 0, 5, 16, 1, RK.r3); rect(g, 0, 6, 16, 2, RK.r2); rect(g, 0, 8, 16, 1, RK.r0);
    for (let x = 0; x < 16; x++) { const d = (rr() * 3) | 0; if (d) px2(g, x, 8 + (d - 1), RK.r1); }
    for (let i = 0; i < 4; i++) px2(g, (rr() * 16) | 0, 4 + ((rr() * 3) | 0), RK.r1);
    if (l) { rect(g, 0, 1, 2, 7, RK.r5); px2(g, 0, 0, RK.r4); px2(g, 0, 7, RK.r1); } if (r) { rect(g, 14, 1, 2, 7, RK.r3); px2(g, 15, 0, RK.r4); px2(g, 15, 7, RK.r1); }
    return c; });
}
/* a ROPE BRIDGE's span: lashed planks (the deck lit on top, joints every eight columns bound with cord), a log beam under it with its own lashing, ends strapped */
function deck(l, r, v, mid) {
  return once('dk' + l + r + v + mid, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 5, RK.w3); rect(g, 0, 0, 16, 1, '#e6c88a'); rect(g, 0, 1, 16, 1, RK.w4); rect(g, 0, 4, 16, 1, RK.w1);
    for (let x = 3 + (v & 1) * 2; x < 16; x += 8) { rect(g, x, 1, 1, 4, RK.w1); rect(g, x + 1, 1, 1, 3, RK.w4); }                                   /* the plank joints */
    rect(g, 0, 5, 16, 3, RK.w1); rect(g, 0, 5, 16, 1, RK.w0); rect(g, 0, 7, 16, 1, RK.w0); rect(g, 0, 6, 16, 1, RK.w2);                              /* the beam under the deck */
    const bind = x => { rect(g, x, 0, 3, 9, RK.rope); rect(g, x, 0, 1, 9, RK.ropeL); rect(g, x + 2, 0, 1, 9, RK.ropeD); for (let y = 1; y < 9; y += 2) px2(g, x + 1, y, RK.ropeD); };   /* a lashing: three turns of cord */
    bind(mid ? 6 : 2); if (!mid) bind(11);
    rect(g, 0, 9, 16, 1, '#100806'); for (let x = 1; x < 16; x += 5) px2(g, x, 10, '#1c100a');                                                       /* the drop-through, dark under it */
    if (l) { rect(g, 0, 0, 3, 9, RK.iron); px2(g, 1, 2, '#8a8a96'); px2(g, 1, 6, '#8a8a96'); } if (r) { rect(g, 13, 0, 3, 9, RK.iron); px2(g, 14, 2, '#8a8a96'); px2(g, 14, 6, '#8a8a96'); }
    return c; });
}
/* the climbing ROPE: a thick twisted strand, a knot every fourth row with a cross-lashed handhold, a frayed end where a run ends */
function ropeTile(y, endTop, endBot) {
  return once('rp' + (y & 3) + endTop + endBot, () => { const [c, g] = canvas(16, 16), k = (y & 3) === 0;
    for (let yy = 0; yy < 16; yy++) { const t = ((yy + (y & 3) * 4) >> 1) & 1; rect(g, 6, yy, 4, 1, RK.ropeD); px2(g, 6 + (t ? 0 : 2), yy, RK.rope); px2(g, 7 + (t ? 0 : 1), yy, RK.ropeL); px2(g, 9, yy, '#4a3820'); }
    if (k) { rect(g, 4, 6, 8, 5, RK.rope); rect(g, 4, 6, 8, 1, RK.ropeL); rect(g, 4, 10, 8, 1, RK.ropeD); rect(g, 3, 7, 10, 1, RK.ropeD); for (let x = 5; x < 12; x += 2) px2(g, x, 8, RK.ropeD); px2(g, 5, 7, RK.ropeL); }
    if (endBot) { px2(g, 5, 15, RK.rope); px2(g, 10, 15, RK.rope); px2(g, 6, 14, RK.ropeL); px2(g, 9, 14, RK.ropeL); }
    if (endTop) { rect(g, 5, 0, 6, 2, '#2a2018'); rect(g, 6, 2, 4, 1, RK.iron); }
    return c; });
}

// ================================ THE HOOK ================================
export function gorgeTile(t, x, y, at, T, L) {
  { const ng = newGroundTile(t, x, y, at, T, L); if (ng) return ng; }
  const air = (dx, dy) => at(x + dx, y + dy) === T.AIR;
  if (t === T.NET) return ropeTile(y, at(x, y - 1) !== T.NET && at(x, y - 1) !== T.SOLID, at(x, y + 1) !== T.NET);
  if (t === T.ONEWAY) {
    const sameRow = k => at(x + k, y) === t, zs = L.ledgeZones || [], br = zs.some(z => y >= z[2] && y <= z[3] && x >= z[0] && x <= z[1]);
    if (br) return deck(!sameRow(-1), !sameRow(1), x, ((x * 7 + y) & 1) === 1);
    return shelf(!sameRow(-1), !sameRow(1), ((x * 5 + y) % 3 + 3) % 3);
  }
  if (t !== T.SOLID) return null;
  const e = (air(-1, 0) ? 1 : 0) | (air(1, 0) ? 2 : 0) | (air(0, 1) ? 4 : 0), tp = air(0, -1);
  if (x >= DAM_X && y <= 32) return ashlar(x, y, tp, e & 3);
  const chs = (L.channels || []).filter(c => c.id === 'gorge'), pale = chs.some(c => x >= c.x0 && x <= c.x1);
  if (tp) return top(x, y, e, pale);
  let depth = 0; for (let k = 1; k <= 5; k++) { if (at(x, y - k) === T.AIR) break; depth++; }
  return face(x, y, e, !e && depth >= 4 ? 1 : 0, pale);
}
