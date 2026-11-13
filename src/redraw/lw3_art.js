// lw3_art.js - SALTREACH's PIECES (claude/saltart, 2026-11-13): the greybox rectangles of src/longwater3-hands.js, drawn. Pure drawing, fillRect only (tools/lw3-art-sheet.mjs rasterises it in node, no
// browser). Same method as claude/srart: every body part is its OWN outlined mass (src/redraw/sr_draw.js Layer: ell / cap / poly / line, toon ramps, one outline ring, run-length flush).
// Theme: a salt-marsh fishing village under sea-mist - limestone, tarred cord, verdigris'd brass, lantern amber; the ONLY timber is a boat's hull (she is a boat). No crates, no logs.
//   drawBell        THE SEA BELL on its iron gallows and stone plinth (swing 0..1 while it tolls; a fresh stroke shakes loose a ring of verdigris-green sparks)
//   drawSluice      THE SLUICE WHEEL: an iron handwheel on a stone pier, the gate behind it (slate slab in iron guides) that drops when held; held 0..1 = the gold hold bar, cool 0..1 = the grey wind-back bar
//   drawBoat        a clinker fishing boat: tarred hull with strake lines, a painted wale, coiled net, a bollard and a hanging lantern; her deck is the platform (y = deck top)
//   drawMooring     the iron bollard on its stone, the rope round it (and the rope to the boat while it holds: drawn by the caller from the bollard's top)
//   drawTrap        THE FISH TRAP: a domed pot of tarred cord on iron hoops, a stone weight in its foot, the rope it hangs by; a coin trap shows coins through the weave
//   drawSmokehouse  a stone smokehouse: slate roof, louvred cowl, a lit amber hatch, split fish on rails   |  drawLocal  a villager in an oilskin   |  drawGulls  a perch of gulls that lift as you come
//   drawMillWheel   the mill's iron-rimmed wheel with slate buckets (no timber)   |  drawJelly  a jellyfish   |  drawLighthouse  THE TIDE-CLOCK LIGHTHOUSE: whitewash, red bands, a gallery, a lit lantern and the DIAL
//   drawWave / drawSpear / drawSwirl   the Herald's water: a curling crest, a rising column with a glaive-head, the undertow    |  drawFoam  the tide's lip   |  SALT_SKIN  the A3 dial in brass and sea-glass
import { Layer, ell, cap, poly, line, px as pset, flush, mixC, clamp } from './sr_draw.js';
import * as SD from './sea_dial.js';
const R = Math.round, TS = 16;
export const LK = {
  out: '#0a0e12', stone: ['#1c232b', '#2c3640', '#445562', '#6a7e8a', '#98aab2', '#cddada'], iron: ['#14161a', '#2a2e36', '#4a505c', '#7a8290', '#aab2bc'], brass: ['#4a3410', '#8a6a1c', '#c9a340', '#f0d070'],
  verd: ['#1e4a40', '#2a6e5e', '#3f8f7d', '#78c8b0'], tar: ['#0e0b09', '#1e1812', '#352a20', '#54442f'], cord: ['#17110a', '#2e2314', '#54442a', '#86734a'], slate: ['#10161c', '#1c262e', '#2c3a44', '#445664'],
  white: ['#9aa8ac', '#cdd8d8', '#eef4f2'], red: ['#6a2418', '#a8402e', '#d0604a'], amber: ['#a8802c', '#e6c070', '#fff0b0'], oil: ['#6a4e14', '#b08a28', '#e8c24c'], weed: ['#16301f', '#244a30', '#3a6a42', '#5c9250'],
  foam: ['#dff2f8', '#9fc8d0', '#6fa0ac'], water: ['#1a4a58', '#2f7a88', '#7cc8c8'], glass: ['#d8f0ee', '#a0d0d0'], silver: ['#8aa0a8', '#c8dce0', '#f0f8f8'], jelly: ['#8a6ab8', '#c8a8e8', '#e2c8ff'],
};
/* the A3 dial in Saltreach's case: weathered brass and sea-glass green (src/redraw/sea_dial.js takes a plain object) */
export const SALT_SKIN = { name: 'saltbrass', case: ['#1c1a12', '#4a4020', '#8a7a3a', '#c9b45a', '#f0e4a0'], glass: '#06121a', glassHi: '#1a3a3c', water: ['#1a5a64', '#3a9a9a', '#7cd0c8'], lip: '#dff7ee', pip: '#e6c070', arrowIn: '#ff8a5c',
  arrowOut: '#9fd6c8', knob: '#e6c070', arm: '#c9b45a', plate: ['#12161a', '#2a3238', '#4a5660'], shape: 'dial' };
let g_, ox_ = 0, oy_ = 0, FX_ = 1;
const rect = (x, y, w, h, c, a = 1) => { if (a !== 1) g_.globalAlpha = a; g_.fillStyle = c; g_.fillRect(R(ox_ + FX_ * x - (FX_ < 0 ? w : 0)), R(oy_ + y), R(w), R(h)); if (a !== 1) g_.globalAlpha = 1; };
const FL = (L, a = 1, oc = LK.out) => flush(L, (dx, dy, w, h, c, al) => rect(dx, dy, w, h, c, al * a), oc);
const at = (g, x, y, f = 1) => { g_ = g; ox_ = R(x); oy_ = R(y); FX_ = f < 0 ? -1 : 1; };
const H = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return (h ^ (h >>> 16)) >>> 0; };
const ring = (L, cx, cy, r, c, th = 1) => { for (let d = 0; d < 360; d += 360 / (r * 7)) { const a = d * Math.PI / 180; for (let k = 0; k < th; k++) pset(L, cx + Math.cos(a) * (r - k), cy + Math.sin(a) * (r - k), c); } };

/* THE SEA BELL. (x, feet) on screen; swing 0..1 = ringing; fresh 0..1 = a stroke just struck */
export function drawBell(g, x, feet, swing = 0, t = 0, fresh = 0) {
  at(g, x, feet); const sw = Math.sin(t * 18) * 3.2 * swing, L = new Layer();
  poly(L, [[-9, 0], [-8, -5], [8, -5], [9, 0]], LK.stone[2]); poly(L, [[-9, 0], [-8, -5], [-3, -5], [-3, 0]], LK.stone[3]); for (const dx of [-5, 1, 5]) pset(L, dx, -2, LK.stone[1]); pset(L, -7, -4, LK.stone[5]);   /* the plinth */
  cap(L, 0, -5, 0, -29, 1.8, 1.6, LK.iron); cap(L, 0, -29, 12, -29, 1.4, 1.4, LK.iron); cap(L, 0, -11, 7, -26, 1, 1, LK.iron); pset(L, 12, -31, LK.brass[3]); FL(L);   /* the iron gallows and its brace */
  for (const dy of [-12, -20]) rect(-2, dy, 5, 1, LK.iron[3]);
  const B = new Layer(), bx = 11 + sw;   /* the bell: verdigris'd bronze, a lit lip */
  poly(B, [[bx - 2, -28], [bx + 2, -28], [bx + 3, -22], [bx + 6, -16], [bx + 7, -12], [bx - 7, -12], [bx - 6, -16], [bx - 3, -22]], LK.verd[2]); poly(B, [[bx - 2, -28], [bx, -28], [bx, -12], [bx - 7, -12], [bx - 6, -16], [bx - 3, -22]], LK.verd[3]);
  for (let i = -5; i <= 5; i += 3) pset(B, bx + i, -13, LK.brass[3]); line(B, bx - 5, -17, bx + 5, -17, LK.verd[1]); pset(B, bx - 3, -22, LK.white[2]); pset(B, bx - 4, -19, LK.white[1]); FL(B);
  rect(bx - 1 + sw * 0.5, -11, 3, 3, LK.iron[3]); rect(bx + sw * 0.5, -11, 1, 1, LK.white[2]);   /* the clapper */
  for (let i = 0; i < 5; i++) rect(-7 + i * 3, 0, 2, 1, LK.weed[1 + (i & 1)]);   /* weed at the plinth foot */
  if (fresh > 0.05 || swing > 0.15) { const k = Math.max(fresh, swing * 0.5); for (let i = 0; i < 6; i++) { const a = i * 1.05 + t * 3, r = 10 + (1 - k) * 8; rect(bx + Math.cos(a) * r, -18 + Math.sin(a) * r * 0.6, 2, 1, LK.verd[3], k); } }
}
/* THE SLUICE WHEEL. held 0..1 = the hold left (the wheel turns, the gate is down: water stopped), cool 0..1 = the wind-back left */
export function drawSluice(g, x, feet, held = 0, cool = 0, t = 0) {
  at(g, x, feet); const L = new Layer(), on = held > 0;
  poly(L, [[-10, 0], [-9, -7], [9, -7], [10, 0]], LK.stone[2]); poly(L, [[-10, 0], [-9, -7], [-3, -7], [-3, 0]], LK.stone[3]); for (const dx of [-6, 2, 6]) pset(L, dx, -3, LK.stone[1]);   /* the pier */
  cap(L, -6, -7, -6, -30, 1.5, 1.5, LK.iron); cap(L, 6, -7, 6, -30, 1.5, 1.5, LK.iron); cap(L, -7, -30, 7, -30, 1.4, 1.4, LK.iron);                                                  /* the guides + the head */
  poly(L, [[-5, on ? -16 : -26], [5, on ? -16 : -26], [5, -8], [-5, -8]], LK.slate[2]); for (let i = 0; i < 4; i++) line(L, -4, (on ? -14 : -24) + i * 4, 4, (on ? -14 : -24) + i * 4, LK.slate[1]); pset(L, -4, on ? -15 : -25, LK.slate[3]);   /* the gate slab */
  FL(L);
  const W = new Layer(), a0 = on ? t * 4.2 : 0.2; ring(W, 0, -36, 9, LK.iron[3], 1); ring(W, 0, -36, 8, LK.iron[2], 1);                                                                      /* the handwheel */
  for (let i = 0; i < 6; i++) { const a = a0 + i * Math.PI / 3; line(W, 0, -36, Math.cos(a) * 8, -36 + Math.sin(a) * 8, LK.iron[3]); pset(W, Math.cos(a) * 9, -36 + Math.sin(a) * 9, LK.brass[2]); }
  ell(W, 0, -36, 2.4, 2.4, LK.brass); pset(W, -1, -37, LK.brass[3]); FL(W);
  if (on) { rect(-11, -50, 22, 3, LK.iron[0]); rect(-10, -49, R(20 * clamp(held)), 1, LK.amber[1]); rect(-10, -49, R(20 * clamp(held)), 1, LK.amber[2], 0.4); }                                    /* the hold bar */
  else if (cool > 0) { rect(-11, -50, 22, 3, LK.iron[0]); rect(-10, -49, R(20 * clamp(cool)), 1, LK.water[1]); }                                                                                /* the wind-back */
  if (on) for (let i = 0; i < 3; i++) rect(-4 + i * 4, -9 + ((t * 20 + i * 5) % 8), 1, 2, LK.foam[0], 0.7);                                                                                  /* water dripping at the gate foot */
  for (let i = 0; i < 4; i++) rect(-8 + i * 5, 0, 2, 1, LK.weed[1 + (i & 1)]);
}
/* A FISHING BOAT: (x, y) = the deck's top-left on screen (y = the platform), w px, t = clock, st = { lit, loose (afloat), cut }. Clinker strakes, the wale, a coil of net, a bollard, a lantern. */
/* (claude/saltlook) THE STILL PART OF A BOAT IS BAKED ONCE PER (width, lantern): the procedural poly/outline pass cost ~3 ms a frame on screen (tools/saltlook-perf.mjs, saltlook-prof.mjs); only the foam of a loose boat moves.
   Browser only (a node sheet has no document and draws the layers each time, as before). Pixels are the same: tools/saltlook-same.mjs. */
const BOATS = new Map();
export function drawBoat(g, x, y, w, t = 0, st = {}) {
  w = R(w); const key = w + (st.lit === false ? 'd' : 'l'); let c = BOATS.get(key);
  if (!c && typeof document !== 'undefined' && document.createElement) { c = document.createElement('canvas'); c.width = w + 24; c.height = 48; boatBody(c.getContext('2d'), 10, 30, w, st); BOATS.set(key, c); }
  if (c) g.drawImage(c, R(x) - 10, R(y) - 30); else boatBody(g, x, y, w, st);
  if (st.loose) { at(g, x, y); for (let i = 0; i < 3; i++) rect(2 + i * (w / 3) + Math.sin(t * 2 + i) * 2, 12, 4, 1, LK.foam[0], 0.6); }
}
function boatBody(g, x, y, w, st) {
  at(g, x, y); const L = new Layer(), HULL = 11;
  poly(L, [[-4, -5], [-1, 0], [w + 1, 0], [w + 4, -5], [w + 1, 3 + HULL - 4], [w - 6, HULL + 1], [6, HULL + 1], [1, 3 + HULL - 4]], LK.tar[2]);   /* the hull, bow and stern rising */
  poly(L, [[-4, -5], [-1, 0], [8, 0], [6, HULL + 1], [1, 3 + HULL - 4]], LK.tar[3]);
  for (let r = 0; r < 3; r++) { const yy = 2 + r * 3; for (let xx = 3 - r; xx < w - 3 + r; xx++) pset(L, xx, yy, (xx + r) % 11 === 0 ? LK.tar[3] : LK.tar[1]); }   /* the strake lines, joints staggered */
  for (let xx = 0; xx < w + 2; xx++) { pset(L, xx, 0, LK.tar[3]); pset(L, xx, 1, LK.tar[0]); }                                                       /* the gunwale / deck lip */
  FL(L);
  rect(3, 4, w - 6, 2, LK.red[1]); rect(3, 4, w - 6, 1, LK.red[2]); rect(3, 6, w - 6, 1, LK.red[0]);                                              /* the painted wale */
  for (let i = 0; i < Math.floor((w - 8) / 7); i++) rect(7 + i * 7 + (H(i, 3) & 1), 9, 2, 1, LK.white[1]);                                       /* barnacles and weed along the waterline */
  for (let i = 0; i < w - 6; i += 5) if (H(i, 5) % 3 === 0) rect(4 + i, 10, 1, 3, LK.weed[1 + (i & 1)]);
  /* on deck: a coil of net, a bollard, a lantern on a short post */
  const C = new Layer(); ell(C, 7, -3, 5, 2.4, LK.cord); for (let k = 0; k < 4; k++) pset(C, 3 + k * 2, -3 + (k & 1), LK.cord[0]); FL(C);
  const Bo = new Layer(); cap(Bo, w - 8, 0, w - 8, -6, 2, 1.6, LK.iron); pset(Bo, w - 9, -6, LK.iron[4]); FL(Bo);
  if (w > 40) { const P = new Layer(); cap(P, R(w * 0.55), 0, R(w * 0.55), -16, 1.2, 1, LK.iron); FL(P); rect(R(w * 0.55) - 2, -20, 5, 5, LK.glass[1], 0.9); rect(R(w * 0.55) - 1, -19, 3, 3, st.lit === false ? LK.glass[1] : LK.amber[1]); rect(R(w * 0.55) - 3, -21, 7, 1, LK.iron[2]); }
}
/* THE MOORING: (x, feet) the iron bollard on its stone; cut = the rope is gone (a frayed end hangs) */
export function drawMooring(g, x, feet, cut = false, t = 0) {
  at(g, x, feet); const L = new Layer();
  poly(L, [[-6, 0], [-5, -5], [5, -5], [6, 0]], LK.stone[2]); poly(L, [[-6, 0], [-5, -5], [-1, -5], [-1, 0]], LK.stone[3]); cap(L, 0, -5, 0, -13, 2.6, 2, LK.iron); ell(L, 0, -14, 3.6, 2, LK.iron); FL(L);
  if (!cut) { for (let i = 0; i < 3; i++) { rect(-3, -12 + i * 2, 7, 1, LK.cord[2 + (i & 1)]); } rect(2, -12, 2, 6, LK.cord[2]); } else { rect(1, -10, 1, 5 + R(Math.sin(t * 3)), LK.cord[2]); rect(2, -7, 1, 2, LK.cord[1]); }
  for (let i = 0; i < 3; i++) rect(-5 + i * 4, 0, 2, 1, LK.weed[1 + (i & 1)]);
}
/* THE FISH TRAP: (x, top) on screen; (x, top) = the top of the pot, 12 wide x 12 tall; hang = the rope goes up to ropeTop; kind 'coins' shows coins */
export function drawTrap(g, x, top, hang = true, ropeTop = null, kind = 'crush', t = 0) {
  at(g, x, top);
  if (hang && ropeTop != null) { for (let yy = ropeTop; yy < 0; yy += 2) rect(0, yy, 1, 2, (yy >> 1) & 1 ? LK.cord[3] : LK.cord[2]); rect(-5, ropeTop - 2, 11, 3, LK.iron[1]); rect(-5, ropeTop - 2, 11, 1, LK.iron[3]); }
  const L = new Layer(); poly(L, [[-6, 12], [-6, 5], [-3, 1], [3, 1], [6, 5], [6, 12]], LK.cord[1]);
  for (let yy = 2; yy < 12; yy++) for (let xx = -5; xx <= 5; xx++) { const a = (xx + yy) & 3, b = (xx - yy + 64) & 3; if (L.has(xx, yy) && (a === 0 || b === 0)) pset(L, xx, yy, a === 0 && b === 0 ? LK.cord[3] : LK.cord[2]); }
  for (const yy of [3, 8]) line(L, -6 + (yy < 5 ? 3 : 0), yy, 6 - (yy < 5 ? 3 : 0), yy, LK.iron[3]); line(L, -6, 11, 6, 11, LK.iron[2]); FL(L);
  rect(-2, 0, 5, 2, LK.iron[3]); rect(-1, 0, 3, 1, LK.iron[4]);   /* the hoop ring the rope ties to */
  if (kind === 'coins') { for (const [dx, dy] of [[-3, 7], [0, 5], [2, 8], [-1, 9]]) { rect(dx, dy, 2, 2, '#ffd34a'); rect(dx, dy, 1, 1, '#fff0a0'); } if (Math.sin(t * 5) > 0.6) rect(1, 5, 1, 1, '#ffffff'); }
  else { rect(-5, 9, 10, 2, LK.stone[1]); rect(-5, 9, 4, 1, LK.stone[3]); }   /* a stone weight sewn in the foot */
  rect(-5, 11, 1, 2, LK.weed[2]); rect(4, 11, 1, 3, LK.weed[1]);
}
/* THE SMOKEHOUSE: (x, feet), 30 wide, 36 tall. t = clock */
export function drawSmokehouse(g, x, feet, t = 0) {
  at(g, x, feet); const L = new Layer();
  poly(L, [[-14, 0], [-14, -22], [14, -22], [14, 0]], LK.stone[2]); poly(L, [[-14, 0], [-14, -22], [-6, -22], [-6, 0]], LK.stone[3]);
  for (let r = 0; r < 4; r++) { line(L, -13, -4 - r * 5, 13, -4 - r * 5, LK.stone[1]); for (let xx = -13 + (r & 1) * 5; xx < 14; xx += 10) line(L, xx, -4 - r * 5, xx, -9 - r * 5, LK.stone[1]); }      /* coursed rubble */
  poly(L, [[-17, -22], [-9, -33], [9, -33], [17, -22]], LK.slate[2]); for (let i = 0; i < 4; i++) line(L, -16 + i * 2, -23 - i * 2.4, 16 - i * 2, -23 - i * 2.4, LK.slate[i & 1 ? 1 : 3]); poly(L, [[-17, -22], [-9, -33], [-4, -33], [-9, -22]], LK.slate[3]);   /* the slate roof */
  poly(L, [[-3, -33], [3, -33], [3, -38], [-3, -38]], LK.iron[2]); for (let i = 0; i < 3; i++) line(L, -2, -34 - i * 1.6, 2, -34 - i * 1.6, LK.iron[0]); poly(L, [[-4, -38], [4, -38], [2, -40], [-2, -40]], LK.iron[3]);   /* the louvred cowl */
  poly(L, [[2, 0], [2, -10], [11, -10], [11, 0]], LK.tar[1]); poly(L, [[3, 0], [3, -9], [10, -9], [10, 0]], LK.tar[0]);   /* the door */
  FL(L);
  rect(-11, -17, 8, 7, LK.iron[1]); rect(-10, -16, 6, 5, LK.amber[0]); rect(-10, -16, 6, 2, LK.amber[1]); rect(-9, -16, 3, 1, LK.amber[2]); rect(-7, -16, 1, 5, LK.iron[1]);   /* the lit hatch */
  for (let i = 0; i < 3; i++) { rect(-12 + i * 2 + (i === 1 ? 14 : 0), -10, 1, 5, LK.silver[1]); rect(-12 + i * 2 + (i === 1 ? 14 : 0), -10, 1, 1, LK.silver[2]); }   /* split fish on a rail */
  rect(-13, -10, 8, 1, LK.iron[3]);
}
/* A LOCAL: 10 x 17. dir -1/1 = the way he walks; step = the clock for the walk; stoop 0..1 (ducking from the bell). An oilskin, a sou'wester, sea boots. */
export function drawLocal(g, x, feet, t = 0, dir = 1, kind = 0) {
  at(g, x, feet, dir); const L = new Layer(), bob = Math.round(Math.sin(t * 7)), w = Math.sin(t * 6) > 0 ? 1 : -1, oil = kind ? LK.oil : [LK.stone[1], LK.stone[2], LK.stone[3]];
  cap(L, -1 + w, -1, -1 + w, -5, 1.6, 1.4, [LK.tar[1], LK.tar[2]]); cap(L, 2 - w, -1, 2 - w, -5, 1.6, 1.4, [LK.tar[1], LK.tar[2]]);   /* boots */
  poly(L, [[-4, -5 + bob], [4, -5 + bob], [3, -13 + bob], [-3, -13 + bob]], oil[1]); poly(L, [[-4, -5 + bob], [-1, -5 + bob], [-1, -13 + bob], [-3, -13 + bob]], oil[2]); line(L, 0, -5 + bob, 0, -12 + bob, oil[0]);
  cap(L, 3, -11 + bob, 5 + w, -7 + bob, 1, 1, oil); ell(L, 0, -15 + bob, 2.4, 2.4, [LK.silver[0], '#e0c8a8', '#f0dcc0']); poly(L, [[-4, -16 + bob], [4, -16 + bob], [5, -14 + bob], [-3, -15 + bob]], oil[1]); poly(L, [[-2, -19 + bob], [3, -19 + bob], [4, -16 + bob], [-3, -16 + bob]], oil[1]);   /* the sou'wester's brim */
  FL(L); rect(1, -16 + bob, 1, 1, LK.out);
}
/* GULLS: (x, feet) a perch of three; up 0..1 = they lift; t = clock */
export function drawGulls(g, x, feet, up = 0, t = 0) {
  at(g, x, feet); rect(-14, -2, 28, 2, LK.iron[1]); rect(-14, -2, 28, 1, LK.iron[3]); rect(-14, -2, 2, 5, LK.iron[2]); rect(12, -2, 2, 5, LK.iron[2]);   /* the rail */
  for (let i = 0; i < 3; i++) { const hx = -8 + i * 8 + Math.sin(t * 3 + i) * 1, hy = -3 - up * (9 + i * 7) - (up > 0.05 ? Math.abs(Math.sin(t * 13 + i)) * 2 : 0), fl = up > 0.2, fw = Math.sin(t * 20 + i * 2);
    const L = new Layer(); ell(L, hx, hy - 3, 3.4, 2.2, [LK.white[0], LK.white[1], LK.white[2]]); ell(L, hx + 3, hy - 5, 1.8, 1.6, LK.white); pset(L, hx + 5, hy - 5, '#e8c24c'); pset(L, hx + 4, hy - 6, LK.out);
    if (fl) { line(L, hx - 1, hy - 4, hx - 7, hy - 7 - fw * 3, LK.white[0]); line(L, hx + 1, hy - 4, hx + 7, hy - 7 + fw * 3, LK.white[1]); } else { poly(L, [[hx - 2, hy - 4], [hx - 6, hy - 3], [hx - 2, hy - 2]], '#7a8890'); }
    FL(L, 1, '#3a464e'); }
}
/* THE MILL WHEEL: (x, cy) the hub on screen, r = 20; a = the angle; slate buckets round an iron rim; wet = how much it streams */
export function drawMillWheel(g, x, cy, a = 0, wet = 0, t = 0) {
  at(g, x, cy); const L = new Layer();
  ring(L, 0, 0, 20, LK.iron[3], 2); ring(L, 0, 0, 14, LK.iron[2], 1);
  for (let i = 0; i < 8; i++) { const b = a + i * Math.PI / 4, c = Math.cos(b), s = Math.sin(b); line(L, 0, 0, c * 19, s * 19, LK.iron[3], 2);
    poly(L, [[c * 19 - s * 3, s * 19 + c * 3], [c * 19 + s * 3, s * 19 - c * 3], [c * 23 + s * 3, s * 23 - c * 3], [c * 23 - s * 3, s * 23 + c * 3]], LK.slate[3]); }   /* the buckets */
  ell(L, 0, 0, 4, 4, LK.iron); pset(L, -1, -1, LK.iron[4]); FL(L);
  if (wet > 0.1) for (let i = 0; i < 6; i++) { const b = a * 0.4 + i * 1.05; rect(Math.cos(b) * 22, 12 + ((t * 40 + i * 9) % 18), 1, 2, LK.foam[0], 0.7 * wet); }
}
/* A JELLYFISH: (x, y) the centre of the bell, t = clock */
export function drawJelly(g, x, y, t = 0, i = 0) {
  at(g, x, y); const p = Math.sin(t * 3 + i), sq = 1 + p * 0.12; g_.globalAlpha = 1;
  const L = new Layer(); ell(L, 0, 0, 5 * sq, 3.2 / sq, LK.jelly); for (const dx of [-3, 0, 3]) pset(L, dx, -1, LK.jelly[2]); FL(L, 0.85, '#3a2a5a');
  for (let k = -3; k <= 3; k += 2) for (let q = 0; q < 7; q++) rect(k + Math.sin(t * 4 + q * 0.7 + k) * 1.2, 3 + q, 1, 1, q < 4 ? LK.jelly[1] : LK.jelly[0], 0.8 - q * 0.07);
}
/* THE LIGHTHOUSE: (x, feet), 18 wide x 134 tall; gb = the bay gauge row { k, tell, ph, t, coming } (the dial); far = the horizon copy (small, no dial detail beyond the glass) */
export function drawLighthouse(g, x, feet, gb = null, t = 0, far = false) {
  const h = far ? 70 : 120, key = far ? 'f' : 'n'; let c = LHS.get(key);
  /* (claude/saltlook) the still masses are baked once (a: the tower + lantern glass; b: rail, bars, window, base); the glow and the dial stay live. Same pixels: tools/saltlook-same.mjs */
  if (!c && typeof document !== 'undefined' && document.createElement) { c = { a: document.createElement('canvas'), b: document.createElement('canvas') }; for (const k of 'ab') { c[k].width = 34; c[k].height = h + 44; lhPart(c[k].getContext('2d'), 17, h + 32, far, k === 'a'); } LHS.set(key, c); }
  at(g, x, feet);
  if (c) { g.globalAlpha = 1; g.drawImage(c.a, R(x) - 17, R(feet) - h - 32); } else lhPart(g, x, feet, far, true);
  const glow = 0.7 + 0.3 * Math.sin(t * 2); at(g, x, feet); rect(-2, -h - 13, 4, 5, LK.amber[2], glow);   /* the lit lantern's glow */
  if (c) g.drawImage(c.b, R(x) - 17, R(feet) - h - 32); else lhPart(g, x, feet, far, false);
  at(g, x, feet); SD.drawDial(g, ox_, oy_ - (far ? 44 : 84), gb || { k: 0.5 }, t, SALT_SKIN);                                                                                                       /* THE DIAL: the bay's tide */
}
const LHS = new Map();
function lhPart(g, x, feet, far, partA) {
  at(g, x, feet); const h = far ? 70 : 120;
  if (partA) {
    const L = new Layer();
    poly(L, [[-11, 0], [-8, -h], [8, -h], [11, 0]], LK.white[1]); poly(L, [[-11, 0], [-8, -h], [-2, -h], [-5, 0]], LK.white[2]); poly(L, [[6, 0], [11, 0], [8, -h], [4, -h]], LK.white[0]);
    for (const f of far ? [0.2, 0.55] : [0.12, 0.42, 0.72]) { const yy = -h * f; poly(L, [[-10 + 3 * f, yy], [10 - 3 * f, yy], [10 - 3 * f - 1, yy - 9], [-10 + 3 * f + 1, yy - 9]], LK.red[1]); poly(L, [[-10 + 3 * f, yy], [-4, yy], [-4, yy - 9], [-10 + 3 * f + 1, yy - 9]], LK.red[2]); }
    poly(L, [[-13, -h], [13, -h], [13, -h - 4], [-13, -h - 4]], LK.iron[2]); poly(L, [[-13, -h], [-5, -h], [-5, -h - 4], [-13, -h - 4]], LK.iron[3]);                      /* the gallery */
    poly(L, [[-7, -h - 4], [7, -h - 4], [7, -h - 16], [-7, -h - 16]], LK.iron[1]); poly(L, [[-9, -h - 16], [9, -h - 16], [0, -h - 24]], LK.iron[2]); pset(L, 0, -h - 25, LK.brass[3]);   /* the lantern room and its cap */
    FL(L, far ? 0.85 : 1);
    rect(-5, -h - 15, 10, 10, LK.glass[0]); rect(-4, -h - 14, 8, 8, LK.amber[1]);   /* the lantern's glass and flame */
  } else {
    for (const dx of [-5, 0, 4]) rect(dx, -h - 15, 1, 10, LK.iron[1]);   /* the lantern's bars (over the glow) */
    for (let xx = -12; xx <= 12; xx += 3) rect(xx, -h - 9, 1, 5, LK.iron[3]);   /* the gallery rail */
    if (!far) { rect(-2, -h * 0.5, 4, 8, LK.iron[1]); rect(-1, -h * 0.5 + 1, 2, 5, LK.amber[0]); }   /* a lit window */
    if (!far) rect(-9, 0, 18, 2, LK.stone[2]);
  }
}
/* THE HERALD'S WATER. A wave crest: (x, top, bot) the crest's leading edge, dir +1 = running right */
export function drawWave(g, x, top, bot, dir, t = 0) {
  at(g, x, bot, dir); const hgt = bot - top, L = new Layer();
  poly(L, [[-34, 0], [-30, -hgt * 0.35], [-18, -hgt * 0.6], [-6, -hgt * 0.92], [4, -hgt], [10, -hgt * 0.85], [9, -hgt * 0.55], [5, 0]], LK.water[1]);
  poly(L, [[-34, 0], [-30, -hgt * 0.35], [-18, -hgt * 0.6], [-6, -hgt * 0.92], [-10, -hgt * 0.55], [-20, -hgt * 0.25], [-24, 0]], LK.water[2]);
  for (let i = 0; i < 5; i++) { const yy = -hgt * (0.1 + i * 0.16); line(L, -28 + i * 4, yy, -6 + i * 2, yy - 1, LK.water[0]); }
  FL(L, 0.9, '#0e3a44');
  for (let i = 0; i < 9; i++) { const hx = -4 + Math.sin(t * 20 + i) * 4 + i, hy = -hgt - 2 + (i & 3) * 3; rect(hx, hy, 3, 2, LK.foam[0]); }   /* the curling lip's foam */
  rect(4, -hgt, 6, 2, LK.foam[0]); rect(9, -hgt * 0.8, 2, 3, LK.foam[1]);
}
/* A WATER SPEAR: (x, floor) the column, hh = its height now, s = life (the head fades) */
export function drawSpear(g, x, floor, hh, t = 0) {
  at(g, x, floor); hh = R(hh); if (hh < 2) return; const L = new Layer();
  poly(L, [[-5, 0], [-4, -hh + 8], [0, -hh], [4, -hh + 8], [5, 0]], LK.water[1]); poly(L, [[-5, 0], [-4, -hh + 8], [0, -hh], [-1, 0]], LK.water[2]);
  for (let i = 1; i < 5; i++) line(L, -3, -hh * i / 5, 3, -hh * i / 5 - 1, LK.water[0]); FL(L, 0.9, '#0e3a44');
  rect(-1, -hh + 1, 2, Math.min(8, hh), LK.foam[0]); for (let i = 0; i < 5; i++) rect(-7 + i * 3, -2 - ((t * 60 + i * 11) % 9), 1, 1, LK.foam[0], 0.8);
  rect(-8, 0, 16, 2, LK.foam[1], 0.7);
}
/* THE UNDERTOW: a ring of swirl streaks round (x, y), t = clock, r = reach */
export function drawSwirl(g, x, y, t = 0, r = 140) {
  at(g, x, y); for (let i = 0; i < 18; i++) { const a = t * 3.4 + i * 0.7, rr = 22 + ((t * 70 + i * 23) % (r - 22)), k = 1 - rr / r; for (let j = 0; j < 4; j++) { const aa = a - j * 0.16, q = rr * (1 + j * 0.01);
      rect(Math.cos(aa) * q, -4 + Math.sin(aa) * q * 0.16 - (i % 3) * 3, j < 2 ? 3 : 2, 1, j === 0 ? LK.foam[0] : j < 3 ? LK.water[2] : LK.water[1], 0.35 + 0.6 * k); } }
}
/* THE FOAM: the tide's lip from x0 to x1 at y; ph 'warn' = white */
export function drawFoam(g, x0, x1, y, t, ph) {
  at(g, 0, 0); const w = ph === 'warn';
  for (let x = x0 - (x0 % 7) + R(t * 18) % 7; x < x1; x += 7) { const k = H(x, 1) % 3; rect(x, y - 2, 4, 1, w ? '#ffffff' : LK.foam[0], w ? 0.95 : 0.75); rect(x + 1, y - 1, 5, 1, w ? LK.foam[0] : LK.foam[1], 0.6); if (k === 0) rect(x + 2, y - 3, 2, 1, LK.foam[0], 0.7); }
}
export const PIECE_SET = ['drawBell', 'drawSluice', 'drawBoat', 'drawMooring', 'drawTrap', 'drawSmokehouse', 'drawLocal', 'drawGulls', 'drawMillWheel', 'drawJelly', 'drawLighthouse', 'drawWave', 'drawSpear', 'drawSwirl', 'drawFoam'];
export { mixC };
