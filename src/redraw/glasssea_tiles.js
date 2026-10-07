// glasssea_tiles.js - THE GLASS SEA's own TILE KIT (claude/glasssea art pass). It used to wear the caravan's sand and a wooden ledge.
//   GLASS     lightning-fused desert glass: a white-hot lit skin, a mint-to-teal body that darkens to near-black obsidian with depth, slanting refraction streaks,
//             trapped bubbles and VIOLET FULGURITE VEINS (the lightning's own channels) running down through it. The same streaks and veins are laid by WORLD position,
//             so they run on from tile to tile. Cliff faces catch a lit rim on the sun side and an undercut shows glass icicles.
//   SLOPES    the slick slopes drawn as their own diagonals (src/redraw/slopes.js with the glass palette): a bright specular edge along the surface, the lit face and the shaded face
//   SHELVES   (ONEWAY) a polished glass slab: bright top, a green-clear body with bubbles, a dark underside, chipped ends
//   OBELISK   the Fork Obelisk's sandstone (dark, warm, with a carved band every few rows and a pale capstone); THE SUNKEN HEAD's obsidian (black, polished, veined)
//   SAND      the Glass Edge's first columns (x < L.glassFrom) stay the caravan's sand (the kit returns null there), so SAND and GLASS read apart
// Made from px.js primitives, 16x16, baked once and memoised.   glassTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
import { canvas, px, rect } from '../px.js';
import { isSlope, SLOPE, heightAt, slopeRise } from '../slopes.js';
import { bakeSandSlopes } from './slopes.js';

export const GL = { w: '#ffffff', c1: '#e6fff6', c2: '#b4f4de', c3: '#7adcc4', c4: '#4cb8a6', c5: '#34908c', c6: '#24707a', c7: '#175260', c8: '#0f3a4c', c9: '#0a2638', c10: '#061826',
  vio: '#6a48c0', vioL: '#b89cff', cy: '#8af0ff', bub: '#d8fff4' };
const RAMP = [GL.c1, GL.c2, GL.c3, GL.c4, GL.c5, GL.c6, GL.c7, GL.c8, GL.c9, GL.c10];
/* THE THREE GLASSES: the edge and the field are SEA-GREEN, the Bone Crossing's reach is CLEAR (cyan-ice, sun-bleached), the flats past the sunset are VIOLET-BLUE (cold glass, cyan lightning) - blended over six columns at each seam */
const RAMPS = [RAMP, ['#f2ffff', '#c8f6fa', '#90e4f2', '#5cc6e0', '#3a9cc4', '#2a78a8', '#1c5688', '#123c68', '#0a2848', '#061a30'], ['#f4eeff', '#d6ccfa', '#aea4f0', '#827ed8', '#605cb8', '#464494', '#303070', '#202050', '#12122f', '#080818']];
export function toneAt(x, y) { const base = x < 196 ? 0 : x < 334 ? 1 : 2;
  for (const [b, lo, hi] of [[196, 0, 1], [334, 1, 2]]) if (Math.abs(x - b) < 6) { const t = (x - (b - 6)) / 12; return hash(x * 7, (y >> 1) + 3) % 100 < t * 100 ? hi : lo; }
  return base; }
const VEIN = [[GL.vio, GL.vioL], [GL.vio, GL.vioL], ['#4ab8e8', '#bff8ff']];
/* pixel-depth (rows under the surface) at which each stop of the ramp is fully reached */
const RAMP_AT = [0, 3, 8, 16, 30, 52, 80, 120, 170, 230];
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const hex2 = s => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const RGBS = RAMP.map(hex2);
/* the ramp colour at pixel-depth d, with a 2x2 ordered dither between neighbouring stops so the body bands smoothly without a gradient */
const BAYER = [0.125, 0.625, 0.875, 0.375];
function ramp(d, wx, wy, tn) {
  const RP = RAMPS[tn || 0]; let i = 0; while (i < RAMP_AT.length - 1 && d >= RAMP_AT[i + 1]) i++;
  if (i >= RAMP_AT.length - 1) return RP[RP.length - 1];
  const t = (d - RAMP_AT[i]) / (RAMP_AT[i + 1] - RAMP_AT[i]), b = BAYER[(wx & 1) + ((wy & 1) << 1)];
  return t > b ? RP[i + 1] : RP[i];
}
const lighter = (c, tn) => { const RP = RAMPS[tn || 0], i = RP.indexOf(c); return i > 0 ? RP[i - 1] : c; };
const darker = (c, tn) => { const RP = RAMPS[tn || 0], i = RP.indexOf(c); return i >= 0 && i < RP.length - 1 ? RP[i + 1] : c; };

/* the world-position features: a slanting streak, a bubble, a violet vein. d = the pixel depth of the cell; the three fade out with depth */
function streak(wx, wy) { const a = (wx * 2 + wy) % 61, b = (wx - wy * 2 + 4000) % 47; return a === 0 || a === 1 && hash(wx >> 3, wy >> 3) % 3 === 0 || b === 0 && hash(wx >> 4, wy >> 4) % 2 === 0; }
function bubble(wx, wy) { const cx = wx >> 3, cy = wy >> 3; if (hash(cx, cy) % 9 !== 0) return 0; const ox = 2 + hash(cx, cy + 7) % 4, oy = 2 + hash(cx + 5, cy) % 4, dx = (wx & 7) - ox, dy = (wy & 7) - oy;
  if (dx === 0 && dy === 0) return 2; if ((dx === -1 && dy === -1) || (dx === 0 && dy === -1) || (dx === -1 && dy === 0)) return 1; return 0; }
function vein(wx, wy) { const cx = Math.floor(wx / 22), seg = Math.floor(wy / 40); if (hash(cx, seg) % 4 !== 0) return 0; const xv = cx * 22 + 3 + hash(cx, 9) % 14 + Math.round(2.4 * Math.sin(wy / 7 + cx * 2.1) + 1.2 * Math.sin(wy / 3.1 + cx));
  const d = wx - xv; return d === 0 ? 2 : (d === 1 && hash(wy, cx) % 3 === 0) || (d === -1 && hash(wy, cx + 3) % 4 === 0) ? 1 : 0; }

/* ================================ GLASS: flats, fills, cliffs ================================ */
/* depth = whole tiles of glass above this one (0 = the surface tile); aL/aR/aU/aD = open air on that side; wx0/wy0 = the tile's world pixel */
function glassTile(x, y, depth, aL, aR, aU, aD, slopeAbove, tn) {
  const key = 'g' + tn + '_' + (x % 5) + '_' + (y % 5) + '_' + Math.min(depth, 15) + (aL ? 'L' : '') + (aR ? 'R' : '') + (aU ? 'U' : '') + (aD ? 'D' : '') + (slopeAbove ? 'S' : '');
  return once(key, () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16, RP = RAMPS[tn];
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
      const wx = wx0 + xx, wy = wy0 + yy, dpx = depth * 16 + yy + (slopeAbove ? 8 : 0);
      let col = ramp(dpx, wx, wy, tn);
      if (dpx > 3 && dpx < 120) { if (streak(wx, wy)) col = lighter(col, tn); }
      const bb = dpx > 6 && dpx < 150 ? bubble(wx, wy) : 0; if (bb) col = bb === 2 ? GL.bub : lighter(lighter(col, tn), tn);
      const vv = dpx > 5 ? vein(wx, wy) : 0; if (vv) col = vv === 2 ? (dpx < 90 ? VEIN[tn][1] : VEIN[tn][0]) : dpx < 90 ? VEIN[tn][0] : darker(col, tn);
      px(g, xx, yy, col); }
    if (depth === 0 && aU && !slopeAbove) {   /* the lit skin: a white-hot line with sparkle, then a pale second line */
      for (let xx = 0; xx < 16; xx++) { const h = hash(wx0 + xx, wy0); px(g, xx, 0, h % 3 === 0 ? GL.w : RP[0]); px(g, xx, 1, h % 5 === 0 ? RP[0] : RP[1]); if (h % 7 === 0) px(g, xx, 2, RP[1]); } }
    if (aL) { for (let yy = aU ? 2 : 0; yy < 16; yy++) { px(g, 0, yy, RP[1]); px(g, 1, yy, yy % 3 ? RP[2] : RP[1]); } }   /* the sun side of a cliff: a lit rim */
    if (aR) { for (let yy = aU ? 2 : 0; yy < 16; yy++) { px(g, 15, yy, RP[6]); px(g, 14, yy, RP[5]); } }
    if (aU && aL) { g.clearRect(0, 0, 2, 1); px(g, 2, 0, GL.w); px(g, 1, 1, RP[0]); }
    if (aU && aR) { g.clearRect(14, 0, 2, 1); px(g, 13, 0, GL.w); px(g, 14, 1, RP[1]); }
    if (aD) { for (let xx = 0; xx < 16; xx++) { px(g, xx, 15, RP[7]); px(g, xx, 14, RP[6]); }   /* an undercut: a dark lip and glass icicles */
      for (let k = 0; k < 3; k++) { const ix = 1 + ((hash(wx0, wy0 + k * 5) % 13)), len = 2 + hash(ix, wx0) % 3; for (let q = 0; q < len; q++) { px(g, ix, 15 - q, q === len - 1 ? GL.w : RP[2]); } } }
    return c; });
}
/* ================================ SLOPES: the glass diagonals ================================ */
const glassPal = tn => { const r = RAMPS[tn]; return { crust: r[0], crustL: GL.w, lit: r[1], base: r[2], mid: r[3], deep: r[4], band: r[5], dark: r[6], ripple: r[1], fill: r[4], grain: r[3], pebble: GL.cy, pebbleL: GL.bub, root: VEIN[tn][0] }; };
const SLP = [null, null, null];
function slopeSet(tn) {
  if (SLP[tn]) return SLP[tn];
  const S = bakeSandSlopes(glassPal(tn), 9900 + tn * 37);
  /* a slope's body goes teal where the flat's would, and the surface line is the brightest thing on it: a hard specular edge, a second pale line under it, a few violet veins in the body */
  const tune = (c, kind, under, seed) => {   /* (tn = the tone of this set) */ const g = c.getContext('2d'), img = g.getImageData(0, 0, 16, 16), d = img.data;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const i = (yy * 16 + xx) * 4; if (!d[i + 3]) continue;
      const wx = xx + seed * 16, wy = yy + seed * 7; if (hash(wx, wy) % 23 === 0) { const vc = VEIN[tn][0]; d[i] = parseInt(vc.slice(1, 3), 16); d[i + 1] = parseInt(vc.slice(3, 5), 16); d[i + 2] = parseInt(vc.slice(5, 7), 16); }   /* a vein flecks */
      else if ((xx * 2 + yy * (slopeRise(kind) > 0 ? 1 : -1) * 2 + seed) % 13 === 0 && !under) { const lc = RAMPS[tn][0]; d[i] = parseInt(lc.slice(1, 3), 16); d[i + 1] = parseInt(lc.slice(3, 5), 16); d[i + 2] = parseInt(lc.slice(5, 7), 16); } }   /* a streak running parallel to the surface */
    g.putImageData(img, 0, 0); return c; };
  for (const kind of Object.values(SLOPE)) { S[kind] = S[kind].map((c, i) => tune(c, kind, false, i + kind)); S.under[kind] = S.under[kind].map((c, i) => tune(c, kind, true, i + kind + 40)); }
  return (SLP[tn] = S);
}
/* ================================ SHELVES (ONEWAY): a polished slab ================================ */
export function shelfTile(x, y, l, r) {
  return once('sh' + (x % 4) + (l ? 'L' : '') + (r ? 'R' : ''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
    for (let yy = 0; yy < 7; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx; let col = yy === 0 ? GL.w : yy === 1 ? GL.c1 : yy === 2 ? GL.c2 : yy === 3 ? GL.c3 : yy === 4 ? GL.c4 : yy === 5 ? GL.c5 : GL.c7;
      if (yy >= 2 && yy <= 5 && ((wx * 2 + yy * 3) % 19 === 0)) col = lighter(col);
      if (yy >= 3 && yy <= 5 && hash(wx >> 2, 3) % 5 === 0 && ((wx & 3) === 1) && yy === 4) col = GL.bub;
      if (yy >= 3 && yy <= 5 && vein(wx, yy + 100) === 2) col = GL.vioL;
      px(g, xx, yy, col); }
    for (let xx = 0; xx < 16; xx++) { if (hash(wx0 + xx, 1) % 4 === 0) px(g, xx, 0, GL.c1); }
    if (l) { g.clearRect(0, 0, 2, 1); g.clearRect(0, 6, 3, 1); px(g, 2, 0, GL.w); px(g, 0, 2, GL.c3); px(g, 0, 5, GL.c6); }   /* the slab's chipped ends */
    if (r) { g.clearRect(14, 0, 2, 1); g.clearRect(13, 6, 3, 1); px(g, 13, 0, GL.w); px(g, 15, 2, GL.c3); px(g, 15, 5, GL.c6); }
    for (let k = 0; k < 2; k++) { const ix = 2 + ((hash(wx0, k + 40) % 12)); px(g, ix, 7, GL.c6); px(g, ix, 8, GL.c3); if (k === 0) px(g, ix, 9, GL.w); }   /* a glass drip under the slab */
    return c; });
}
/* ================================ OBELISK sandstone ================================ */
const OB = { s0: '#241810', s1: '#3a2616', s2: '#5a3c22', s3: '#7e5a34', s4: '#a47a48', s5: '#c89c62', s6: '#e8c488', gold: '#ffd36b' };
function obeliskTile(x, y, topRow, aL, aR, band) {
  return once('ob' + (x % 4) + '_' + (y % 3) + (topRow ? 'T' : '') + (aL ? 'L' : '') + (aR ? 'R' : '') + (band ? 'B' : ''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx, wy = wy0 + yy; let col = OB.s2; const h = hash(wx >> 1, wy >> 1) % 9;
      if (h === 0) col = OB.s1; else if (h === 1) col = OB.s3;
      if (xx < 2) col = OB.s3; if (xx > 12) col = OB.s1; if (xx === 15) col = OB.s0;   /* lit on the west, in shadow on the east */
      px(g, xx, yy, col); }
    for (let xx = 0; xx < 16; xx += 4) for (let yy = 3; yy < 14; yy++) if (hash(wx0 + xx, y) % 3) px(g, xx + 2, yy, OB.s1);   /* the carved vertical grooves */
    if (band) { rect(g, 0, 4, 16, 8, OB.s1); rect(g, 0, 5, 16, 6, OB.s3); for (let xx = 1; xx < 15; xx += 3) { const k = hash(wx0 + xx, 71) % 4; if (k === 0) rect(g, xx, 6, 2, 4, OB.s0); else if (k === 1) { px(g, xx, 6, OB.s0); px(g, xx + 1, 8, OB.s0); px(g, xx, 9, OB.s0); } else if (k === 2) rect(g, xx, 7, 2, 2, OB.gold); else { px(g, xx + 1, 6, OB.s0); px(g, xx, 7, OB.s0); px(g, xx + 1, 9, OB.s0); } } }   /* a band of the old script */
    if (topRow) { rect(g, 0, 0, 16, 2, OB.s6); rect(g, 0, 2, 16, 2, OB.s5); rect(g, 0, 4, 16, 1, OB.s0); }
    if (aL) rect(g, 0, 0, 1, 16, OB.s6);
    return c; });
}
/* ================================ THE SUNKEN HEAD's obsidian ================================ */
const OBS = { o0: '#05070c', o1: '#0c121c', o2: '#162030', o3: '#22324a', o4: '#34506c', o5: '#5a86a8', hi: '#a8d8f0' };
function obsidianTile(x, y, aU, aL, aR) {
  return once('os' + (x % 5) + '_' + (y % 5) + (aU ? 'U' : '') + (aL ? 'L' : '') + (aR ? 'R' : ''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx, wy = wy0 + yy; let col = ((wx + wy) >> 3) % 2 ? OBS.o1 : OBS.o2;
      if ((wx * 3 - wy * 2 + 4000) % 41 === 0) col = OBS.o4; if ((wx + wy * 2) % 53 === 0) col = OBS.o3;
      const vv = vein(wx, wy + 60); if (vv) col = vv === 2 ? GL.vioL : GL.vio;
      px(g, xx, yy, col); }
    if (aU) { rect(g, 0, 0, 16, 1, OBS.hi); rect(g, 0, 1, 16, 1, OBS.o5); rect(g, 0, 2, 16, 1, OBS.o4); }
    if (aL) { rect(g, 0, aU ? 2 : 0, 1, 16, OBS.o5); rect(g, 1, aU ? 2 : 0, 1, 16, OBS.o4); }
    if (aR) rect(g, 15, 0, 1, 16, OBS.o0);
    return c; });
}

/* ================================ WHICH CELL IS WHICH ================================ */
export const HEAD = { x0: 369, x1: 382, y0: 17 };   /* THE SUNKEN HEAD's carved mass (the cheek and the skull's back slope stay glass) */
export const OBELISK = { x0: 323, x1: 326, y0: 10, y1: 30 };
/* THE HOOK: the cell's own tile, or null (the caravan's sand takes the first columns, and everything that is not ground) */
export function glassTileFor(t, x, y, at, T, L) {
  if (!L || !L.glasssea) return null;
  if (x < (L.glassFrom || 0) && (t === T.SOLID || isSlope(t))) return null;
  const air = (dx, dy) => at(x + dx, y + dy) === T.AIR;
  if (t === T.ONEWAY) { const l = at(x - 1, y) === T.ONEWAY, r = at(x + 1, y) === T.ONEWAY; return shelfTile(x, y, !l, !r); }
  if (isSlope(t)) { const S = slopeSet(toneAt(x, y)); return S[t][((x * 7 + y * 13) % 3 + 3) % 3]; }
  if (t !== T.SOLID) return null;
  const aU = air(0, -1) || at(x, y - 1) === T.ONEWAY, aD = air(0, 1), aL = air(-1, 0), aR = air(1, 0);
  if (x >= OBELISK.x0 && x <= OBELISK.x1 && y >= OBELISK.y0 && y <= OBELISK.y1) return obeliskTile(x, y, y === OBELISK.y0, x === OBELISK.x0, x === OBELISK.x1, (y - OBELISK.y0) % 5 === 3);
  if (x >= HEAD.x0 && x <= HEAD.x1 && y >= HEAD.y0 && y <= 33) return obsidianTile(x, y, aU, aL, aR);
  let depth = 0; for (let k = 1; k < 16; k++) { const u = at(x, y - k); if (u === T.SOLID) depth++; else if (isSlope(u)) { depth++; break; } else break; }
  const slopeAbove = isSlope(at(x, y - 1));
  const tn = toneAt(x, y);
  if (slopeAbove) return slopeSet(tn).under[at(x, y - 1)][((x * 7 + y * 13) % 3 + 3) % 3];
  return glassTile(x, y, depth, aL, aR, aU, aD, false, tn);
}
