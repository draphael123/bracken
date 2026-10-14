// minecart_tiles.js - THE DEEP RAILS' own TILE KIT (claude/minecartart). The greybox wore the grass-and-dirt ground. This is the mine:
//   FLOORS     a rail bed of dark ballast over raw rock with a LIT LIP (the lantern light on the standable edge); where the line lies the bed is cinder, the works' floor is iron-plated
//   WALLS      raw rock faces, shored: a timber post (iron-strapped) up the open side
//   CEILINGS   jagged rock with a cap-timber every fourth tile
//   MASS       blocky rock, darker the deeper from the air, with copper veins and gold flecks (the same ore the backdrop glitters with); the cave-in's rock is cracked, the smelter's has slag in it
//   SLOPES     the same rock, cut on the diagonal with the bed and its lip along the surface
//   RAIL       the trestle deck: a timber stringer, bolted and strapped, with corbels under it (the sleepers and the iron are drawn by src/minecart-hands.js on top)
// Made from px.js primitives, 16x16, baked once and memoised.   mineTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
import { canvas, px, rect, mulberry } from '../px.js';
import { isSlope, heightAt, slopeRise } from '../slopes.js';
import { MP, hash, zoneOf } from './minecart_backdrop.js';

/* the ground's warm ramp: it must read IN FRONT of the slate wall behind it */
export const GP = { g0: '#150e0d', g1: '#221612', g2: '#33231b', g3: '#4a3427', g4: '#634836', g5: '#80604a', ballast: '#2a1d18', ballastL: '#5a4434', lip: '#a77c52', lipL: '#dca868', cinder: '#1a1210', slag: '#e0701c', slag2: '#ffb04c' };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };
const open = (at, T) => (dx, dy, x, y) => { const v = at(x + dx, y + dy); return v === T.AIR || v === T.SPIKE || v === T.ONEWAY; };

/* the rock itself (a block texture), tone 0 dark .. 3 lit */
function rockBlock(g, r, ox, oy, ramp, w = 16, h = 16) {
  rect(g, ox, oy, w, h, ramp[1]);
  /* raw rock: ragged-edged slabs of uneven size, some joints dark, some lost; a chip of light on the upper left of each, a shadow under */
  for (let y = 0; y < h;) { const rh = 3 + ((r() * 5) | 0); let x = -((r() * 4) | 0);
    while (x < w) { const bw = 3 + ((r() * 9) | 0), t = r(), col = ramp[t < 0.22 ? 2 : t < 0.6 ? 1 : t < 0.85 ? 0 : 3 > 2 ? 2 : 1], x0 = Math.max(0, x), x1 = Math.min(w, x + bw);
      if (x1 > x0) { rect(g, ox + x0, oy + y, x1 - x0, Math.min(rh, h - y), t > 0.85 ? ramp[0] : col); if (r() < 0.7) rect(g, ox + x1 - 1, oy + y, 1, Math.min(rh, h - y), ramp[0]); px2(g, ox + x0 + 1, oy + y, ramp[3]); if (rh > 4 && r() < 0.5) px2(g, ox + x0 + 2, oy + y + 1, ramp[2]); if (r() < 0.55) rect(g, ox + x0, oy + Math.min(h - 1, y + rh - 1), x1 - x0, 1, ramp[0]); }
      x += bw; }
    y += rh; }
}
const RAMPS = [[GP.g0, GP.g1, GP.g2, GP.g3], [GP.g1, GP.g2, GP.g3, GP.g4]];
/* THE AREAS' OWN ROCK (claude/deeprailsart): one kit a zone (zoneOf) - the yard's warm brown, the drift's cold blue-black (a headlamp-cold lip), the goblin line's moss green, the
   cavern's ember red, the works' slate iron, the flooded run's teal, the smelter's char. A kit: five rock tones g0 (joint) .. g4, the bed, and the lit lip. */
const mkKit = (g, ballast, ballastL, lip, lipL) => ({ g0: g[0], R: [[g[0], g[1], g[2], g[3]], [g[1], g[2], g[3], g[4]]], ballast, ballastL, lip, lipL });
const KIT = [
  { g0: GP.g0, R: RAMPS, ballast: GP.ballast, ballastL: GP.ballastL, lip: GP.lip, lipL: GP.lipL },
  mkKit(['#07080e', '#0e1119', '#171b29', '#252c40', '#323b56'], '#11141d', '#2c3550', '#6a7ea6', '#a8c0e8'),
  mkKit(['#0a1008', '#141d0e', '#202f16', '#33481f', '#46612b'], '#18220f', '#3a5222', '#93ad4c', '#cde27a'),
  mkKit(['#150708', '#260d0e', '#3c1613', '#5a211a', '#76301f'], '#2a0e0c', '#5a2216', '#e0702e', '#ffb858'),
  mkKit(['#0b0d12', '#171b24', '#252b38', '#373f52', '#4a546c'], '#1c2029', '#3c4458', '#a4aec4', '#dce4f4'),
  mkKit(['#050f0f', '#0a1b1c', '#122d2e', '#1c4344', '#285a5a'], '#0c1e1f', '#1f4a4a', '#5cb8ac', '#a4f0e2'),
  mkKit(['#130808', '#241010', '#391a14', '#54261a', '#72361e'], '#241210', '#4e2a1c', '#e8741e', '#ffc060'),
];

/* ORE in the rock: a copper vein run and a gold fleck, placed by the cell's hash */
function ore(g, r, seed, strong) {
  const h = hash(seed, 3); if (h % (strong ? 5 : 11) !== 0) return;
  let x = 1 + (h >> 4) % 10, y = 1 + (h >> 8) % 10; const dx = (h >> 12) & 1 ? 1 : -1;
  for (let k = 0; k < 6; k++) { px2(g, x, y, k === 2 ? MP.cu2 : MP.cu1); if (r() < 0.5) px2(g, x + 1, y, MP.cu0); x += dx * (r() < 0.6 ? 1 : 0); y += 1; }
  if (h % 3 === 0) { const fx = 2 + (h >> 16) % 11, fy = 2 + (h >> 20) % 11; px2(g, fx, fy, MP.go2); px2(g, fx + 1, fy, MP.go1); px2(g, fx, fy - 1, MP.go3); }
}

/* a FLOOR (open above): the bed, the lip, the rock under it */
function floorTile(x, y, eL, eR, zone) {
  const K = KIT[zone] || KIT[0];
  return once('fl' + (hash(x, 5) % 6) + '_' + eL + eR + '_' + zone + '_' + (y & 1), () => { const [c, g] = canvas(16, 16), r = mulberry(hash(x, y) + 7);
    rockBlock(g, r, 0, 0, K.R[0]);
    /* the bed: cinder and ballast over the rock, 4 rows, the top lit */
    rect(g, 0, 0, 16, 4, zone === 4 ? '#2a2630' : K.ballast);
    for (let i = 0; i < 16; i++) { const t = r(); if (t < 0.5) px2(g, i, 1 + ((r() * 3) | 0), K.ballastL); else if (t < 0.7) px2(g, i, 2 + ((r() * 2) | 0), K.g0); }
    rect(g, 0, 0, 16, 1, K.lip); for (let i = 0; i < 16; i++) if (r() < 0.45) px2(g, i, 0, K.lipL); rect(g, 0, 4, 16, 1, K.g0);
    if (zone === 4) { /* the works' floor is iron-plated: a riveted plate in every third cell */ if (x % 3 === 0) { rect(g, 0, 0, 16, 4, MP.i2); rect(g, 0, 0, 16, 1, MP.i4); px2(g, 2, 2, MP.i5); px2(g, 13, 2, MP.i5); rect(g, 7, 1, 2, 2, MP.i1); } }
    if (zone === 6) { for (let i = 0; i < 5; i++) { const sx = (r() * 15) | 0, sy = 6 + ((r() * 9) | 0); px2(g, sx, sy, GP.slag); if (r() < 0.5) px2(g, sx + 1, sy, GP.slag2); } }   /* slag in the smelter's rock */
    ore(g, r, hash(x, y), zone === 1);
    if (zone === 3) { let cx_ = 3 + ((r() * 10) | 0); for (let k = 5; k < 16; k++) { px2(g, cx_, k, K.g0); if (r() < 0.4) cx_ += r() < 0.5 ? -1 : 1; } }   /* the cave-in's cracked rock */
    if (eL) { g.clearRect(0, 0, 1, 1); px2(g, 0, 1, K.lip); rect(g, 0, 2, 1, 14, K.g0); px2(g, 1, 5, K.g0); }
    if (eR) { g.clearRect(15, 0, 1, 1); px2(g, 15, 1, K.lip); rect(g, 15, 2, 1, 14, K.g0); px2(g, 14, 5, K.g0); }
    return c; });
}
/* a WALL face (air to one side): rock, with a shoring post up the open side */
function wallTile(x, y, eL, eR, zone) {
  const K = KIT[zone] || KIT[0];
  return once('wl' + (hash(x, y) % 5) + '_' + eL + eR + '_' + zone + '_' + (y & 3), () => { const [c, g] = canvas(16, 16), r = mulberry(hash(x, y) + 19);
    rockBlock(g, r, 0, 0, K.R[0]); ore(g, r, hash(x, y), zone === 1);
    const post = x0 => { rect(g, x0, 0, 4, 16, MP.t2); rect(g, x0, 0, 1, 16, MP.t4); rect(g, x0 + 3, 0, 1, 16, MP.t0); for (let k = 3; k < 16; k += 7) px2(g, x0 + 1 + (k & 1), k, MP.t1); if ((y & 3) === 1) { rect(g, x0, 6, 4, 2, MP.i2); rect(g, x0, 6, 4, 1, MP.i4); } };
    if (eL) { post(0); rect(g, 4, 0, 1, 16, K.g0); }
    else if (eR) { post(12); rect(g, 11, 0, 1, 16, K.g0); }
    return c; });
}
/* a CEILING (open below): ragged rock with a cap-timber */
function ceilTile(x, y, zone) {
  const K = KIT[zone] || KIT[0];
  return once('ce' + (hash(x, y) % 5) + '_' + zone + '_' + (x & 3), () => { const [c, g] = canvas(16, 16), r = mulberry(hash(x, y) + 31);
    rockBlock(g, r, 0, 0, K.R[0]); ore(g, r, hash(x, y), zone === 1);
    for (let i = 0; i < 16; i++) { const d = r() < 0.3 ? 3 : r() < 0.6 ? 2 : 1; g.clearRect(i, 16 - d, 1, d); }                    /* the ragged underside */
    for (let i = 0; i < 16; i++) { const t = r(); if (t < 0.25) px2(g, i, 12 - ((r() * 2) | 0), K.g0); }
    if ((x & 3) === 0) { rect(g, 0, 9, 16, 5, MP.t2); rect(g, 0, 9, 16, 1, MP.t4); rect(g, 0, 13, 16, 1, MP.t0); px2(g, 3, 11, MP.t1); px2(g, 11, 11, MP.t1); rect(g, 7, 9, 2, 5, MP.i2); }
    return c; });
}
/* the MASS: raw rock, darker the farther from the air */
function massTile(x, y, d, zone) {
  const K = KIT[zone] || KIT[0];
  return once('ms' + (hash(x, y) % 7) + '_' + Math.min(d, 6) + '_' + zone, () => { const [c, g] = canvas(16, 16), r = mulberry(hash(x, y) + 43);
    rockBlock(g, r, 0, 0, d <= 2 ? K.R[1] : K.R[0]); ore(g, r, hash(x, y), zone === 1 || zone === 5);
    if (d >= 4) { g.globalAlpha = 0.25 + Math.min(0.35, (d - 4) * 0.1); rect(g, 0, 0, 16, 16, '#000'); g.globalAlpha = 1; }
    if (zone === 6) { for (let i = 0; i < 2; i++) { const sx = (r() * 15) | 0, sy = (r() * 15) | 0; px2(g, sx, sy, GP.slag); } }
    if (zone === 3 && hash(x, y) % 6 === 0) { let cx_ = 2 + ((r() * 12) | 0); for (let k = 0; k < 16; k++) { px2(g, cx_, k, K.g0); if (r() < 0.4) cx_ += r() < 0.5 ? -1 : 1; } }
    return c; });
}
/* a SLOPE: the rock cut on the diagonal, the bed and its lip along the surface */
function slopeTile(t, x, y, zone, under) {
  const K = KIT[zone] || KIT[0];
  return once('sp' + t + '_' + (hash(x, y) % 4) + '_' + zone + under, () => { const [c, g] = canvas(16, 16), r = mulberry(hash(x, y) + t * 3);
    const [rk, rg] = canvas(16, 16); rockBlock(rg, r, 0, 0, K.R[0]); ore(rg, r, hash(x, y), zone === 1);
    for (let xx = 0; xx < 16; xx++) { const h = Math.round(heightAt(t, xx + 0.5)); for (let yy = Math.max(0, h); yy < 16; yy++) g.drawImage(rk, xx, yy, 1, 1, xx, yy, 1, 1);
      if (h < 16) { const bed = Math.min(16, h + 3); rect(g, xx, h, 1, bed - h, K.ballast); if (r() < 0.45) px2(g, xx, h + 1 + ((r() * 2) | 0), K.ballastL); px2(g, xx, h, r() < 0.4 ? K.lipL : K.lip); px2(g, xx, bed, K.g0); } }
    return c; });
}
/* the trestle DECK (T.RAIL): a bolted timber stringer with corbels */
function deckTile(x, y) {
  return once('dk' + (x & 3) + '_' + (y & 1), () => { const [c, g] = canvas(16, 16), r = mulberry(hash(x & 3, 9));
    rect(g, 0, 0, 16, 7, MP.t2); rect(g, 0, 0, 16, 1, MP.t4); rect(g, 0, 1, 16, 1, MP.t3); rect(g, 0, 6, 16, 1, MP.t0); rect(g, 0, 7, 16, 1, '#0a0604');
    for (let i = 0; i < 6; i++) px2(g, (r() * 15) | 0, 2 + ((r() * 3) | 0), MP.t1);   /* grain */
    rect(g, 7, 0, 2, 7, MP.i2); rect(g, 7, 0, 2, 1, MP.i4); px2(g, 7, 3, MP.i5); px2(g, 8, 3, MP.i1);   /* an iron fishplate and its bolt */
    for (const cx_ of [2, 12]) { for (let k = 0; k < 4; k++) { rect(g, cx_ + (cx_ < 8 ? k : -k), 8 + k, 2, 1, MP.t1); } px2(g, cx_ + (cx_ < 8 ? 0 : 1), 8, MP.t3); }   /* corbels under the beam */
    return c; });
}

/* (deeprails5, GREYBOX - the art lane's) THE SPOIL: a pit floor / a heap on the walk of broken pit-props and rubble, splintered ends up - it bites (SPIKE) */
function spoilTile(x, y) {
  return once('sp5_' + (x & 3), () => { const [c, g] = canvas(16, 16), r = mulberry(hash(x & 3, 41));
    rect(g, 0, 11, 16, 5, '#2a2018'); for (let i = 0; i < 5; i++) px2(g, (r() * 15) | 0, 12 + ((r() * 3) | 0), '#4a3a2a');   /* the rubble bed */
    for (const [px, h] of [[1, 8], [5, 11], [9, 7], [13, 10]]) { rect(g, px, 16 - h - 2, 2, h, MP.t2); px2(g, px, 16 - h - 2, '#e8d8b0'); px2(g, px + 1, 16 - h - 3, '#c8b890'); }   /* the splintered props */
    return c; });
}
// ================================ THE HOOK ================================
export function mineTile(t, x, y, at, T, L) {
  const zone = zoneOf(x), op = open(at, T);
  if (t === T.RAIL || t === T.ONEWAY) return deckTile(x, y);   /* (deeprails5: THE SPOIL PITS' catwalk planks are the trestle deck's timber) */
  if (t === T.SPIKE) return spoilTile(x, y);
  if (isSlope(t)) return slopeTile(t, x, y, zone, 0);
  if (t !== T.SOLID) return null;
  const up = op(0, -1, x, y), down = op(0, 1, x, y), eL = op(-1, 0, x, y), eR = op(1, 0, x, y);
  const upSlope = isSlope(at(x, y - 1));
  if (upSlope) return massTile(x, y, 2, zone);
  if (up) return floorTile(x, y, eL ? 1 : 0, eR ? 1 : 0, zone);
  if (down) return ceilTile(x, y, zone);
  if (eL || eR) return wallTile(x, y, eL ? 1 : 0, eR ? 1 : 0, zone);
  let d = 6; for (let k = 1; k <= 5 && d === 6; k++) for (let dy = -k; dy <= k && d === 6; dy++) for (let dx = -k; dx <= k; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== k) continue; if (op(dx, dy, x, y)) { d = k; break; } }
  return massTile(x, y, d, zone);
}
