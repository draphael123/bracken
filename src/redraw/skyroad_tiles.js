// skyroad_tiles.js - THE SKY ROAD's own TILE KIT (claude/skyroadart). The greybox wore the stock crag dirt; this is a high windswept country of mesas:
//   ROCK     WIND-CUT STRATA. Every cliff is banded in horizontal beds (the bands are laid by the world row, so a bed runs on across a whole mesa face and the next mesa along),
//            scoured by the wind into vertical flutes, the lit side on the left (the sun is low in the west-south). Each zone of the road is its own stone:
//            0 THE MESA STEPS      sun-baked ochre sandstone, rust beds
//            1 THE RIDERS' STATION cream limestone, rose and rust beds, the riders' ropes and rings let into it
//            2 THE HARPY ROOSTS    slate-violet pillars, white guano streaked down the faces
//            3 THE BROKEN SKY BRIDGE pale grey cut stone: ashlar of the old bridge, chamfered, cracked
//            4 THE EYRIE           black basalt, ember-rust beds, bone white
//   TOPS     a lit lip, a bleached cap of wind-scoured stone, drift sand in the joints, a few dry tufts; the cracked spans (L.crumbles) are fractured pale slabs
//   DEEP     the rock falls away into the CLOUD SEA: below row 46 it fades into the cloud's violet-white, so a pillar goes down INTO the cloud, not into black earth
//   LEDGES   lashed stone slabs on iron brackets (the mesas, the bridge), KITE-CLOTH DECKS stretched on bone poles (the roosts, the kite platform), woven reed and bone boards (the Eyrie)
// Made from px.js primitives, 16x16, baked lazily and memoised.   skyTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
import { canvas, px, rect, mulberry } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const mix = (a, b, t) => { const A = rgbOf(a), B = rgbOf(b); return '#' + [0, 1, 2].map(i => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, '0')).join(''); };

/* WHICH PART OF THE ROAD: 0 mesa steps, 1 station, 2 roosts, 3 bridge, 4 eyrie */
export const zoneOf = x => x < 104 ? 0 : x < 190 ? 1 : x < 298 ? 2 : x < 388 ? 3 : 4;
/* each zone's stone: a ramp of seven, dark to light (s0 deepest shadow ... s6 the sun-lit lip) and its beds' accent (a rust, a rose, a violet) */
export const ZONE = [
  { s: ['#2a1a14', '#42291c', '#5e3b26', '#7d5233', '#9d6c42', '#bd8a56', '#dcae78'], acc: '#a8482a', bone: '#e6d8b8' },     /* ochre sandstone */
  { s: ['#2c2220', '#473733', '#695049', '#8d7266', '#b09484', '#cfb8a2', '#ead8c0'], acc: '#b0584a', bone: '#f0e6d0' },     /* cream limestone, rose beds */
  { s: ['#1c1a2c', '#2c2a44', '#443f62', '#605a82', '#7e789e', '#a09ac0', '#c8c2e0'], acc: '#8a6aa0', bone: '#eee8e0' },     /* slate-violet */
  { s: ['#22242a', '#383c46', '#545a66', '#757c88', '#9aa0aa', '#bcc2c8', '#dde0e0'], acc: '#8a7a68', bone: '#e8e6dc' },     /* pale cut stone */
  { s: ['#0e0c12', '#1e1a24', '#322a34', '#4a3e44', '#685850', '#8a7466', '#b0988a'], acc: '#c0562a', bone: '#e4dcc8' }];     /* basalt */
export const CLOUDC = '#aab4d4';   /* what the rock fades into at the cloud sea */

/* THE BEDS: for one zone, a table by ABSOLUTE pixel row of [colour index shift, is a bed line] - so strata run level across every tile of a mesa */
const beds = zone => once('beds' + zone, () => { const r = mulberry(zone * 977 + 13), out = []; let y = 0;
  while (y < 1100) { const th = 5 + ((r() * 10) | 0), sh = ((r() * 3) | 0) - 1, acc = r() < 0.25, seam = r() < 0.45; for (let k = 0; k < th && y < 1100; k++, y++) out.push([sh, k === 0 && seam ? 1 : 0, acc && k < 3 ? 1 : 0]); }
  return out; });
/* the colour of one pixel of rock: base ramp index (1..5) shifted by the bed it lies in; line = the bed's dark seam; acc = an accent bed */
const rockPx = (zone, absY, base, lit) => { const b = beds(zone)[absY] || [0, 0, 0], Z = ZONE[zone];
  if (b[1]) return Z.s[Math.max(0, base - 2)]; if (b[2] && base >= 2) return mix(Z.s[Math.min(6, base)], Z.acc, 0.38); return Z.s[Math.max(0, Math.min(6, base + b[0] + (lit ? 1 : 0)))]; };
/* the fade into the cloud sea (rows below 44): 0 .. 0.62 */
const seaFade = y => y < 44 ? 0 : Math.min(0.62, (y - 44) * 0.052);

function rockFill(g, zone, y, x, base, lit, rr) {   /* a whole 16x16 of strata with wind flutes */
  for (let py = 0; py < 16; py++) { const ay = y * 16 + py; for (let pxl = 0; pxl < 16; pxl++) { const fl = ((hash(x * 16 + pxl, y * 2 + (py >> 3)) >> 3) % 13) === 0 ? -1 : 0; px2(g, pxl, py, rockPx(zone, ay, base + fl, lit)); } }
}
function tint(g, y, col, a) { g.globalAlpha = a; rect(g, 0, 0, 16, 16, col); g.globalAlpha = 1; }

/* ============================ TOP: a lit lip on bleached cap stone, strata under it ============================ */
function topTile(zone, x, y, eL, eR, crack) {
  return once('tp' + zone + '_' + (x & 7) + '_' + y + (eL ? 'l' : '') + (eR ? 'r' : '') + (crack ? 'c' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y) + zone * 31), Z = ZONE[zone];
    rockFill(g, zone, y, x, 3, false, r);
    rect(g, 0, 0, 16, 3, Z.s[5]); rect(g, 0, 0, 16, 1, Z.s[6]); rect(g, 0, 3, 16, 1, Z.s[4]); rect(g, 0, 4, 16, 1, Z.s[2]);   /* the lit lip, the cap, its shadow line */
    for (let i = 0; i < 7; i++) px2(g, (r() * 16) | 0, 1 + ((r() * 2) | 0), r() < 0.5 ? Z.s[4] : Z.s[6]);                              /* scoured grain in the cap */
    for (let k = 0; k < 16; k += 2) if (r() < 0.5) px2(g, k, 3, mix(Z.s[3], '#d8c090', 0.55));                                      /* drift sand in the joint */
    if (r() < 0.45) { const tx = 1 + ((r() * 13) | 0); px2(g, tx, -1 + 1, '#b8a870'); px2(g, tx + 1, 0, '#d8c888'); }                    /* a dry tuft's tip on the lip */
    if (eL) { rect(g, 0, 3, 1, 13, Z.s[5]); px2(g, 0, 2, Z.s[6]); }                                                                  /* the sunward face of the corner */
    if (eR) { rect(g, 15, 2, 1, 14, Z.s[1]); px2(g, 15, 1, Z.s[3]); }
    if (crack) {   /* THE CRACKED SPAN: pale cut stone split in three beats - fractures, a chipped lip, sky showing in the deepest */
      for (let k = 0; k < 2; k++) { let cx = 3 + k * 8 + ((r() * 4) | 0); for (let yy = 1; yy < 15; yy++) { px2(g, cx, yy, Z.s[0]); if (yy % 3 === 0) px2(g, cx + 1, yy, Z.s[4]); if (r() < 0.45) cx += r() < 0.5 ? -1 : 1; } }
      px2(g, 7, 0, Z.s[1]); px2(g, 8, 0, Z.s[1]); px2(g, 12, 0, Z.s[2]);
    }
    tint(g, y, CLOUDC, seaFade(y));
    return c; });
}
/* ============================ FACE: strata, flutes, the lit and the shaded side ============================ */
function faceTile(zone, x, y, eL, eR) {
  return once('fc' + zone + '_' + (x & 7) + '_' + y + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y) + zone * 47), Z = ZONE[zone];
    rockFill(g, zone, y, x, eL ? 3 : 2, !!eL, r);
    /* vertical flutes the wind has cut down the face, a pale lit rib beside each dark groove */
    for (const fx of [2 + ((r() * 4) | 0), 9 + ((r() * 5) | 0)]) { const len = 6 + ((r() * 10) | 0), y0 = (r() * (16 - len)) | 0; for (let yy = y0; yy < y0 + len; yy++) { px2(g, fx, yy, Z.s[1]); px2(g, fx + 1, yy, eL ? Z.s[5] : Z.s[3]); } }
    if (zone === 2) for (let i = 0; i < 2; i++) { const gx = 1 + ((r() * 14) | 0), len = 4 + ((r() * 9) | 0); for (let yy = 0; yy < len; yy++) px2(g, gx, yy + ((r() * 3) | 0), i ? Z.bone : '#d8d4e4'); }    /* guano down the roost pillars */
    if (zone === 3) { rect(g, 0, 7, 16, 1, Z.s[1]); rect(g, 0, 15, 16, 1, Z.s[1]); const jx = (hash(x, y) % 9) + 3; rect(g, jx, 0, 1, 7, Z.s[1]); rect(g, (jx + 8) % 14 + 1, 8, 1, 7, Z.s[1]); }   /* ashlar joints */
    if (eL) { rect(g, 0, 0, 1, 16, Z.s[6]); rect(g, 1, 0, 1, 16, Z.s[5]); }
    if (eR) { rect(g, 15, 0, 1, 16, Z.s[0]); rect(g, 14, 0, 1, 16, Z.s[1]); g.globalAlpha = 0.18; rect(g, 11, 0, 3, 16, '#000'); g.globalAlpha = 1; }
    tint(g, y, CLOUDC, seaFade(y));
    return c; });
}
/* ============================ CEILING: an overhang's dark scoured underside ============================ */
function ceilTile(zone, x, y, eL, eR) {
  return once('ce' + zone + '_' + (x & 7) + '_' + y + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y) + zone * 53), Z = ZONE[zone];
    rockFill(g, zone, y, x, 2, false, r);
    g.globalAlpha = 0.55; rect(g, 0, 9, 16, 7, '#000'); g.globalAlpha = 0.3; rect(g, 0, 5, 16, 4, '#000'); g.globalAlpha = 1;
    for (let k = 0; k < 4; k++) { const nx = (r() * 15) | 0, nl = 1 + ((r() * 3) | 0); rect(g, nx, 15 - nl, 1, nl, Z.s[1]); px2(g, nx, 15, Z.s[0]); }       /* eroded nubs hanging from the underside */
    rect(g, 0, 15, 16, 1, Z.s[0]); if (eL) rect(g, 0, 0, 1, 16, Z.s[5]); if (eR) rect(g, 15, 0, 1, 16, Z.s[0]);
    tint(g, y, CLOUDC, seaFade(y));
    return c; });
}
/* ============================ MASS: the rock behind the faces, darker the deeper, and blue into the cloud ============================ */
function massTile(zone, x, y, d) {
  return once('ma' + zone + '_' + (x & 7) + '_' + y + '_' + Math.min(d, 6), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y) + 41 + zone);
    rockFill(g, zone, y, x, d <= 2 ? 3 : 2, false, r);
    g.globalAlpha = [0, 0.04, 0.09, 0.15, 0.21, 0.27, 0.32][Math.min(d, 6)]; rect(g, 0, 0, 16, 16, '#0a0812'); g.globalAlpha = 1;
    for (let i = 0; i < 5; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, r() < 0.5 ? ZONE[zone].s[1] : ZONE[zone].s[3]);
    tint(g, y, CLOUDC, seaFade(y) * 1.1);
    return c; });
}

/* ============================ LEDGES ============================ */
/* a LASHED STONE SLAB on iron brackets: the mesas' scaffold and the bridge's boards */
function slab(zone, l, rr, v) {
  return once('sl' + zone + (l ? 'l' : '') + (rr ? 'r' : '') + v, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 11 + zone), Z = ZONE[zone];
    rect(g, 0, 0, 16, 5, Z.s[4]); rect(g, 0, 0, 16, 1, Z.s[6]); rect(g, 0, 1, 16, 1, Z.s[5]); rect(g, 0, 4, 16, 1, Z.s[2]); rect(g, 0, 5, 16, 2, Z.s[1]); rect(g, 0, 7, 16, 1, Z.s[0]);
    for (let i = 0; i < 5; i++) px2(g, (r() * 16) | 0, 1 + ((r() * 3) | 0), r() < 0.5 ? Z.s[3] : Z.s[6]);
    if (v === 0) rect(g, 7, 1, 1, 4, Z.s[2]);
    /* the lashing: a turn of cord every few tiles and an iron strap underneath */
    if (v !== 1) { rect(g, 3, 0, 2, 7, '#7a5a34'); rect(g, 3, 0, 2, 1, '#c8a060'); px2(g, 3, 3, '#4a3418'); px2(g, 4, 5, '#4a3418'); }
    rect(g, 0, 7, 16, 1, '#2a2a34'); rect(g, 0, 6, 16, 1, '#4a4a58'); for (const rx of [2, 13]) px2(g, rx, 6, '#9a9ab0');
    for (let x = 1; x < 16; x += 3) px2(g, x, 8 + (x & 1), Z.s[0]);                                                                       /* the ragged underside */
    g.globalAlpha = 0.3; rect(g, 0, 8, 16, 3, '#000'); g.globalAlpha = 1;
    if (l) { rect(g, 0, 1, 1, 7, Z.s[1]); px2(g, 0, 0, Z.s[5]); } if (rr) { rect(g, 15, 1, 1, 7, Z.s[1]); px2(g, 15, 0, Z.s[5]); }
    return c; });
}
/* a KITE-CLOTH DECK: sail-cloth stretched taut on a bone-and-iron frame, in the riders' red and cream, hem scalloped below, tied off at every post */
function clothDeck(l, rr, v) {
  return once('cl' + (l ? 'l' : '') + (rr ? 'r' : '') + (v & 3), () => { const [c, g] = canvas(16, 16), red = ['#8a2a22', '#c9463d', '#e8705a'], cr = ['#c8b894', '#efe6d2', '#fffaee'];
    const stripe = (v & 1) ? 0 : 1;   /* which of the two cloths this tile is */
    rect(g, 0, 0, 16, 1, '#e6d8b8'); rect(g, 0, 1, 16, 1, '#a89870');                                                                   /* the bone rail along the top edge */
    const A = stripe ? red : cr, B = stripe ? cr : red;
    rect(g, 0, 2, 16, 3, A[1]); rect(g, 0, 2, 16, 1, A[2]); rect(g, 0, 4, 16, 1, A[0]);                                                  /* the cloth, lit on its top */
    rect(g, 4, 2, 4, 3, B[1]); rect(g, 4, 2, 4, 1, B[2]); rect(g, 4, 4, 4, 1, B[0]); rect(g, 12, 2, 2, 3, B[1]); rect(g, 12, 2, 2, 1, B[2]);   /* a bar of the other colour */
    rect(g, 0, 5, 16, 1, '#5a4a38'); rect(g, 0, 6, 16, 1, '#3a2e22');                                                                    /* the lower rail */
    for (let x = 0; x < 16; x += 4) { rect(g, x, 7, 3, 2, A[0]); px2(g, x + 1, 9, A[0]); }                                                /* the scalloped hem below, stirring */
    for (const x of [1, 8, 14]) { px2(g, x, 5, '#efe6d2'); px2(g, x, 6, '#a89870'); }                                                     /* the ties */
    g.globalAlpha = 0.28; rect(g, 0, 9, 16, 2, '#000'); g.globalAlpha = 1;
    if (l) { rect(g, 0, 0, 2, 9, '#e6d8b8'); rect(g, 0, 0, 1, 9, '#fffaee'); rect(g, 1, 2, 1, 7, '#8a7a58'); } if (rr) { rect(g, 14, 0, 2, 9, '#e6d8b8'); rect(g, 15, 0, 1, 9, '#8a7a58'); }
    return c; });
}
/* the EYRIE's woven boards: reed and bone lashed in a basket weave, bleached feathers caught in it */
function woven(l, rr, v) {
  return once('wv' + (l ? 'l' : '') + (rr ? 'r' : '') + (v % 3), () => { const [c, g] = canvas(16, 16), r = mulberry(v * 5 + 2);
    rect(g, 0, 0, 16, 6, '#6a5238'); rect(g, 0, 0, 16, 1, '#e4dcc8'); rect(g, 0, 1, 16, 1, '#b09a70');
    for (let x = 0; x < 16; x += 4) { rect(g, x, 2, 3, 2, (x / 4 + v) & 1 ? '#8a6c44' : '#a68a58'); rect(g, x + 2, 4, 3, 1, '#3a2c1c'); }
    rect(g, 0, 5, 16, 1, '#3a2c1c'); rect(g, 0, 6, 16, 2, '#2a2018'); for (let x = 1; x < 16; x += 3) px2(g, x, 8 + (x & 1), '#1a1410');
    for (let i = 0; i < 3; i++) { const fx = (r() * 14) | 0; px2(g, fx, 1, '#f0ece0'); px2(g, fx + 1, 0, '#d8d0c0'); }
    g.globalAlpha = 0.3; rect(g, 0, 8, 16, 3, '#000'); g.globalAlpha = 1;
    if (l) rect(g, 0, 0, 1, 8, '#2a2018'); if (rr) rect(g, 15, 0, 1, 8, '#2a2018');
    return c; });
}

// ================================ THE HOOK ================================
export function skyTile(t, x, y, at, T, L) {
  const open = (dx, dy) => { const v = at(x + dx, y + dy); return v === T.AIR || v === T.NET; };
  const zone = zoneOf(x);
  if (t === T.ONEWAY) {
    const same = k => at(x + k, y) === t, l = !same(-1), r = !same(1), v = ((x * 5 + y) % 3 + 3) % 3;
    if (zone === 4) return woven(l, r, x);
    if (zone === 2 || (x >= 226 && x <= 233)) return clothDeck(l, r, x + (l ? 1 : 0));
    return slab(zone, l, r, v);
  }
  if (t !== T.SOLID) return null;
  const up = open(0, -1), down = open(0, 1), eL = open(-1, 0), eR = open(1, 0);
  if (up) { const crack = (L.crumbles || []).some(q => q.row === y && x >= q.x0 && x <= q.x1); return topTile(crack ? 3 : zone, x, y, eL, eR, crack); }
  if (down) return ceilTile(zone, x, y, eL, eR);
  if (eL || eR) return faceTile(zone, x, y, eL, eR);
  let d = 6; for (let k = 1; k <= 5 && d === 6; k++) for (let dy = -k; dy <= k && d === 6; dy++) for (let dx = -k; dx <= k; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== k) continue; if (open(dx, dy)) { d = k; break; } }
  return massTile(zone, x, y, d);
}
