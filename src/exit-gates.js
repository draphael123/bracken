// src/exit-gates.js - THE EXIT GATES BY REGION (claude/exitgates, 2026-10-11). ART ONLY: nothing here reads or writes the level, the grid, the
// goal trigger or the save. main.js's end-of-level gate (the `gate` it finds on the 'gate' ent, drawn where it used to blit PROP.gate) asks
// this file which landmark to draw and how open it is; the trigger (|dx|<12, |dy|<30, atGate()) and the collision are exactly as they were.
//
// Every region has its OWN landmark in its own kit - forest: a mossed stone arch; marsh: a lashed-timber stockade gate; fungus: an arch of
// two toadstools; crag: standing stones and a hide curtain; mine: a lift cage in its headframe; storm: a gatehouse with a portcullis; coast:
// a ship-timber gate with a hatch; canal: a lock with mitre gates; inland: a stone lychgate with an iron wicket (Waymeet's is the timber one);
// desert: a sandstone doorway with a sliding slab. And ONE shared read on every one of them: a GOLD LANTERN standing on top, dark until
// you come near, then lit (it flares, a ribbon of gold blows from it, the doorway fills with warm light) = "the way on".
//
// ARRIVAL: coming within LIGHT_AT px lights the lantern (a chime, once); within OPEN_AT the doors begin to open (a latch/creak, once) and they
// are fully open by the time you are in the trigger. Both ease with TIME (not the frame), so a slow walk and a run both see it. If the gate
// is locked (an arena that has not been won) the lantern stays dark and the door stays shut: it never says "go" when the game says "not yet".
//
// BAKING: every landmark is baked ONCE per kind (lazily, the first time a level of that kind is loaded - main.js calls prime() at load), never in
// a frame. The bake helpers clamp to the canvas, so a pixel can never land at a negative y.
import { canvas, outline, mulberry, shade } from './px.js';

export const W = 56, H = 60;                      /* the sprite: bottom-centre is the gate's (x, y); the old sprite was 48x52 on the same anchor */
export const LIGHT_AT = 120, OPEN_AT = 64;        /* px from the gate's x (nearest hero) */
const OUT = '#1b1626';

/* THE TABLE. Level id -> kind (the region's landmark). A level not named takes `DEFAULT`. Regions follow src/title-region.js's road order:
   forest, marsh, fungus, crag, mine, storm, coast, canal, inland, desert. */
export const KIND_OF = {
  wood: 'forest', hornetsnest: 'forest',
  marsh: 'marsh', fenroad: 'marsh', stockade: 'marsh', burning: 'marsh',
  spore: 'fungus', rootway: 'fungus', kings: 'fungus', underleaf: 'fungus',
  scree: 'crag', hanging: 'crag', spire: 'crag', moor: 'crag', rookery: 'crag', skyroad: 'crag',
  oreroad: 'mine', minecart: 'mine',
  storm: 'storm', crown: 'storm', undercrown: 'storm', kitchengate: 'storm', warcairn: 'storm',
  longwater: 'coast', reef: 'coast', flotilla: 'coast', hurricane: 'coast', lamplit: 'coast', deep: 'coast', keep: 'coast', causeway: 'coast', harbor: 'coast',
  waymeet: 'canal', towpath: 'canal', canal: 'canal', theatre: 'canal', fair: 'canal',
  church: 'inland', fields: 'inland', burial: 'inland', witchlight: 'inland', mage: 'mage', fallingtower: 'inland', unburied: 'inland',
  caravan: 'desert', welltown: 'desert', underwell: 'desert', redgorge: 'desert', glasssea: 'desert', ksar: 'desert', buriedcity: 'desert', sealedpyramid: 'desert',
};
export const DEFAULT = 'forest';
export const KINDS = ['forest', 'marsh', 'fungus', 'crag', 'mine', 'storm', 'coast', 'canal', 'inland', 'desert', 'mage'];
export const kindOf = id => KIND_OF[id] || DEFAULT;

/* ---- bake helpers (clamped to the canvas: nothing can land at y < 0) ---- */
const mk = () => { const [c, g] = canvas(W, H); return { c, g }; };
const R = (g, x, y, w, h, col) => { x |= 0; y |= 0; w |= 0; h |= 0; if (x < 0) { w += x; x = 0; } if (y < 0) { h += y; y = 0; } if (x + w > W) w = W - x; if (y + h > H) h = H - y; if (w <= 0 || h <= 0) return; g.fillStyle = col; g.fillRect(x, y, w, h); };
const P = (g, x, y, col) => R(g, x, y, 1, 1, col);
const CLR = (g, x, y, w, h) => { x |= 0; y |= 0; w |= 0; h |= 0; if (x < 0) { w += x; x = 0; } if (y < 0) { h += y; y = 0; } if (x + w > W) w = W - x; if (y + h > H) h = H - y; if (w > 0 && h > 0) g.clearRect(x, y, w, h); };
/* a half-disc of radius r on (cx, cy) going UP: fn(x, y) for each pixel */
const disc = (cx, cy, r, fn) => { for (let y = cy - r; y <= cy; y++) for (let x = cx - r; x <= cx + r; x++) { const dx = x + 0.5 - cx, dy = y + 0.5 - cy; if (dx * dx + dy * dy <= r * r) fn(x, y); } };
/* masonry: courses of blocks with a pale top edge and dark joints, seeded */
function stone(g, x, y, w, h, base, seed, course = 5, len = 8) {
  const rnd = mulberry(seed), lo = shade(base, -0.28), hi = shade(base, 0.2);
  R(g, x, y, w, h, base);
  for (let yy = 0, r = 0; yy < h; yy += course, r++) {
    R(g, x, y + yy, w, 1, lo);
    for (let xx = (r & 1) * (len >> 1); xx < w; xx += len) R(g, x + xx, y + yy, 1, course, lo);
    R(g, x, y + yy + 1, w, 1, hi);
  }
  for (let i = 0; i < w * h / 14; i++) P(g, x + ((rnd() * w) | 0), y + ((rnd() * h) | 0), rnd() < 0.5 ? lo : hi);
}
function tex(g, x, y, w, h, cols, n, seed) { const rnd = mulberry(seed); for (let i = 0; i < n; i++) P(g, x + ((rnd() * w) | 0), y + ((rnd() * h) | 0), cols[(rnd() * cols.length) | 0]); }
function planks(g, x, y, w, h, base, seed, step = 3) {
  const lo = shade(base, -0.3), hi = shade(base, 0.18); R(g, x, y, w, h, base);
  for (let xx = 0; xx < w; xx += step) { R(g, x + xx, y, 1, h, lo); R(g, x + xx + 1, y, 1, h, hi); }
  tex(g, x, y, w, h, [lo, hi], w * h / 18, seed);
}

/* ---- the shared lantern: 7x9, baked unlit and lit; sits on TOP of every gate ---- */
let LAMP = null;
function lamps() {
  if (LAMP) return LAMP;
  const out = {};
  for (const lit of [false, true]) {
    const [c, g] = canvas(9, 11);
    R(g, 3, 0, 3, 1, '#c9962c'); R(g, 2, 1, 5, 1, lit ? '#ffd36b' : '#a8802a');           /* cap and ring */
    R(g, 1, 2, 7, 1, '#c9962c'); R(g, 1, 8, 7, 1, '#c9962c'); R(g, 2, 9, 5, 1, '#8a6a22');  /* the frame, the base */
    R(g, 1, 3, 1, 5, '#c9962c'); R(g, 7, 3, 1, 5, '#c9962c');
    R(g, 2, 3, 5, 5, lit ? '#ffe9a0' : '#3a2a14');                                          /* glass: flame or dark */
    if (lit) { R(g, 3, 4, 3, 3, '#fff6cc'); R(g, 4, 3, 1, 4, '#ffffff'); P(g, 2, 7, '#ffc040'); P(g, 6, 7, '#ffc040'); } else { P(g, 3, 5, '#5a4220'); P(g, 5, 6, '#4a3418'); }
    R(g, 4, 10, 1, 1, '#8a6a22');
    out[lit ? 'on' : 'off'] = outline(c, OUT);
  }
  return (LAMP = out);
}

/* ================================ THE TEN LANDMARKS ================================
   Each baker returns { frame, door, op:[x,y,w,h], lamp:[x,bottomY], mech, glow }: `frame` is the standing structure with the doorway cleared,
   `door` is what shuts the doorway (clipped to op), `mech` is how it opens ('swing' leaves part, 'rise' it lifts), `glow` the light behind. */

function bakeForest() {
  const F = mk(), D = mk(), g = F.g, cx = 28, spring = 30, ro = 20, ri = 8, base = '#8b8378';
  const body = mk(); stone(body.g, 0, 0, W, H, base, 11, 5, 8);
  /* the mass: two piers + a half disc, cut from the masonry */
  for (let y = 10; y < H; y++) for (let x = 6; x < 50; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - spring;
    const inMass = y >= spring ? (x >= cx - ro && x < cx + ro) : (dx * dx + dy * dy <= ro * ro);
    const inHole = y >= spring ? (x >= cx - ri && x < cx + ri) : (dx * dx + dy * dy <= ri * ri);
    if (inMass && !inHole) g.drawImage(body.c, x, y, 1, 1, x, y, 1, 1);
  }
  /* voussoirs: radial joints over the arch */
  for (let a = 0; a <= 6; a++) { const t = Math.PI * (a / 6); for (let r = ri + 1; r < ro; r++) { P(g, Math.round(cx - Math.cos(t) * r), Math.round(spring - Math.sin(t) * r), '#5f5a52'); } }
  R(g, 25, 9, 6, 4, '#b3aca0'); R(g, 25, 9, 6, 1, '#d8d2c2'); R(g, 27, 11, 2, 2, '#5f5a52');                 /* keystone */
  R(g, 6, 28, 3, 3, '#5f5a52'); R(g, 47, 28, 3, 3, '#5f5a52'); R(g, 5, 58, 46, 2, '#5f5a52');               /* impost blocks, the sill */
  /* moss and ivy: on the north side, hanging from the crown, ferns in the joints */
  const rnd = mulberry(5);
  for (let i = 0; i < 70; i++) { const x = 6 + ((rnd() * 44) | 0), y = 10 + ((rnd() * 28) | 0); const ok = g.getImageData(x, y, 1, 1).data[3]; if (ok) P(g, x, y, rnd() < 0.4 ? '#3f7a2c' : rnd() < 0.6 ? '#5aa33e' : '#8fd160'); }
  for (let i = 0; i < 7; i++) { const x = 8 + ((rnd() * 40) | 0); let y = 30 + ((rnd() * 4) | 0); for (let k = 0; k < 6 + ((rnd() * 12) | 0); k++, y++) { if (x > 19 && x < 37 && y < 34) break; P(g, x + (k & 2 ? 1 : 0), y, k % 4 === 3 ? '#8fd160' : '#3f7a2c'); } }
  for (const x of [7, 10, 46, 49]) { R(g, x, 56, 1, 2, '#5aa33e'); R(g, x - 1, 55, 1, 2, '#8fd160'); R(g, x + 1, 55, 1, 2, '#3f7a2c'); }
  /* a plinth for the lantern, on the crown, with two oak leaves */
  R(g, 24, 8, 8, 2, '#b3aca0'); R(g, 23, 9, 10, 1, '#5f5a52'); P(g, 22, 8, '#5aa33e'); P(g, 33, 8, '#5aa33e'); P(g, 21, 9, '#3f7a2c'); P(g, 34, 9, '#3f7a2c');
  /* the door: two oak leaves, iron strapped */
  const d = D.g; planks(d, 20, 22, 16, 38, '#8a5a32', 7, 4);
  for (const y of [32, 46]) { R(d, 20, y, 16, 2, '#2a2430'); P(d, 22, y, '#6b6275'); P(d, 33, y, '#6b6275'); }
  R(d, 27, 22, 2, 38, '#3a2412'); R(d, 25, 40, 2, 3, '#c9962c'); R(d, 29, 40, 2, 3, '#c9962c');
  return { frame: outline(F.c, OUT), door: D.c, op: [20, 22, 16, 38], lamp: [28, 8], mech: 'swing', glow: '#ffd36b' };
}

function bakeMarsh() {
  const F = mk(), D = mk(), g = F.g;
  /* two tall rough posts, pointed, a crossbeam, lashings; reed bundles; green wet at the foot */
  for (const x0 of [8, 41]) {
    planks(g, x0, 18, 7, 42, '#6b5a40', x0, 3);
    R(g, x0, 17, 7, 1, '#6b5a40'); R(g, x0 + 1, 15, 5, 2, '#6b5a40'); R(g, x0 + 2, 13, 3, 2, '#6b5a40'); R(g, x0 + 3, 12, 1, 1, '#6b5a40');   /* the point */
    for (const y of [24, 34, 46]) { R(g, x0 - 1, y, 9, 2, '#a89a6a'); R(g, x0 - 1, y + 2, 9, 1, '#5e5236'); }                                     /* rope lashing */
    R(g, x0 - 2, 54, 11, 6, '#3d4a32'); tex(g, x0 - 2, 54, 11, 6, ['#4f6a3a', '#2c3a24', '#6a8a50'], 16, x0);                                          /* algae stain */
  }
  planks(g, 5, 26, 46, 6, '#7a6a4a', 3, 4); R(g, 5, 26, 46, 1, '#a89a6a'); R(g, 5, 31, 46, 1, '#3a3020');   /* the crossbeam, a sag */
  for (let x = 6; x < 50; x += 5) { R(g, x, 32, 1, 3 + (x % 3), '#a89a6a'); R(g, x, 35 + (x % 3), 1, 1, '#c9b878'); }                                  /* hanging reeds */
  R(g, 12, 21, 3, 5, '#a89a6a'); R(g, 13, 20, 1, 1, '#c9b878'); R(g, 41, 21, 3, 5, '#a89a6a');                                                       /* reed bundles on the beam */
  R(g, 26, 12, 4, 14, '#6b5a40'); R(g, 25, 12, 6, 2, '#7a6a4a'); R(g, 26, 10, 4, 2, '#8a7a5a');                                                       /* the lamp-post, a crooked one */
  R(g, 22, 56, 12, 4, '#3d4a32');
  /* the door: warped planks with a gap, a rope latch */
  const d = D.g; planks(d, 15, 33, 26, 27, '#7a6a4a', 9, 3);
  R(d, 15, 40, 26, 2, '#3a3020'); R(d, 15, 52, 26, 2, '#3a3020'); R(d, 27, 33, 2, 27, '#2a2418'); R(d, 24, 45, 2, 3, '#a89a6a'); R(d, 30, 45, 2, 3, '#a89a6a');
  CLR(d, 15, 33, 3, 2); CLR(d, 38, 33, 3, 1);
  return { frame: outline(F.c, OUT), door: D.c, op: [15, 33, 26, 27], lamp: [28, 10], mech: 'swing', glow: '#ffd36b' };
}

function bakeFungus() {
  const F = mk(), D = mk(), g = F.g, rnd = mulberry(77);
  /* two thick pale stalks that lean in and two caps that meet over the way; spots; gills; a glow of spores */
  for (const s of [-1, 1]) {
    for (let y = 22; y < H; y++) { const lean = Math.round(Math.max(0, (y - 40)) * 0.0), w = 9 - (y < 34 ? (34 - y) >> 2 : 0), x0 = s < 0 ? 8 : 39; R(g, x0 + lean + (s < 0 ? 0 : 9 - w), y, w, 1, y & 4 ? '#e8dcc8' : '#d8c8b0'); }
    R(g, s < 0 ? 8 : 47, 22, 1, 38, '#a89478'); R(g, s < 0 ? 10 : 39, 40, 1, 20, '#fff6e6');
    for (let y = 36; y < 58; y += 5) { R(g, s < 0 ? 8 : 40, y, 9, 1, '#b8a48a'); }                                                             /* the ring on the stem */
    tex(g, s < 0 ? 8 : 39, 22, 9, 38, ['#b8a48a', '#f4ead8'], 22, s + 3);
  }
  /* caps: two half-ellipses overlapping at the crown, magenta-violet, with pale spots */
  const cap = (cx, cy, rx, ry, col, lo, hi) => { for (let y = cy - ry; y <= cy + 3; y++) for (let x = cx - rx; x <= cx + rx; x++) { const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dx * dx + dy * dy <= 1 && y <= cy + 2) P(g, x, y, y > cy ? lo : (dy < -0.55 ? hi : col)); } };
  cap(17, 26, 15, 13, '#8a3a8a', '#4a1e52', '#b05ab8'); cap(39, 26, 15, 13, '#7a3490', '#421e5a', '#a050c0');
  for (const [x, y, r] of [[10, 20, 2], [20, 15, 2], [27, 22, 1], [34, 15, 2], [44, 20, 2], [15, 25, 1], [42, 25, 1], [24, 12, 1], [31, 11, 1]]) { R(g, x, y, r + 1, r, '#f4ead8'); P(g, x, y, '#ffffff'); }
  R(g, 4, 28, 48, 3, '#4a1e52'); for (let x = 5; x < 52; x += 2) R(g, x, 31, 1, 2 + (x % 3 === 0 ? 1 : 0), '#d8b0e0');                               /* gills under the cap */
  /* little toadstools at the foot, and a haze */
  for (const [x, y] of [[5, 56], [50, 55], [12, 58], [44, 58]]) { R(g, x, y, 1, 3, '#e8dcc8'); R(g, x - 2, y - 2, 5, 2, '#a04ab0'); P(g, x, y - 2, '#f4ead8'); }
  R(g, 25, 12, 6, 7, '#5a2a6a'); R(g, 26, 10, 4, 2, '#7a3a8a');                                                                                       /* a lamp-cap where the two caps meet */
  const d = D.g; /* the door: a veil of mycelium, pale threads and a knot of spores */
  R(d, 17, 30, 22, 30, '#cfc0d8'); for (let x = 17; x < 39; x += 2) { R(d, x, 30, 1, 30, (x & 2) ? '#a090b0' : '#e8dcf0'); }
  for (let y = 34; y < 60; y += 5) { R(d, 17, y, 22, 1, '#8a7a9a'); }
  tex(d, 17, 30, 22, 30, ['#ffffff', '#8a7a9a'], 30, 4); R(d, 27, 30, 2, 30, '#5a4a6a');
  return { frame: outline(F.c, OUT), door: D.c, op: [17, 30, 22, 30], lamp: [28, 10], mech: 'swing', glow: '#ffe9a0' };
}

function bakeCrag() {
  const F = mk(), D = mk(), g = F.g;
  /* the trilithon: two standing stones and a lintel slab, cairns and a rope with prayer flags */
  const slab = (x, y, w, h, seed) => { stone(g, x, y, w, h, '#7b7480', seed, 6, 10); R(g, x, y, w, 1, '#b0a8b8'); R(g, x, y, 1, h, '#a098a8'); R(g, x + w - 1, y, 1, h, '#4a4552'); };
  slab(7, 26, 10, 34, 21); slab(39, 24, 10, 36, 22);
  R(g, 8, 24, 8, 2, '#7b7480'); R(g, 40, 22, 8, 2, '#7b7480');
  slab(4, 14, 48, 11, 23); R(g, 4, 14, 48, 2, '#a098a8'); R(g, 4, 24, 48, 1, '#3a3542');
  tex(g, 4, 14, 48, 46, ['#5a8a5a', '#8a9a6a'], 22, 3);                                                                      /* lichen */
  for (let i = 0; i < 6; i++) { R(g, 8 + i * 7, 15 + (i % 2), 2, 1, '#2a2430'); }
  /* a cairn on the lintel to carry the lantern, and a rope of flags */
  R(g, 22, 11, 12, 3, '#8a8290'); R(g, 24, 9, 8, 2, '#9a92a0'); R(g, 26, 8, 4, 1, '#a098a8');
  R(g, 8, 27, 40, 1, '#c9b894'); const cols = ['#d8584a', '#e8c24a', '#4a8ad8', '#f0f0e0', '#4aa86a'];
  for (let i = 0; i < 8; i++) { const x = 10 + i * 5, sag = Math.round(Math.sin(i / 7 * Math.PI) * 2); R(g, x, 28 + sag, 3, 4, cols[i % 5]); R(g, x, 28 + sag, 3, 1, shade(cols[i % 5], 0.25)); }
  /* the door: a hide curtain, lashed to a pole at the top, painted with a bone-white sign */
  const d = D.g; R(d, 17, 25, 22, 35, '#9a6a44'); tex(d, 17, 25, 22, 35, ['#7a5030', '#b88458', '#8a5a38'], 90, 8);
  R(d, 17, 25, 22, 3, '#5c3a1d'); for (let x = 18; x < 39; x += 4) R(d, x, 28, 1, 5, '#e8dcc0');
  R(d, 27, 40, 2, 10, '#e8dcc0'); R(d, 24, 42, 8, 2, '#e8dcc0'); R(d, 25, 49, 6, 1, '#e8dcc0');
  return { frame: outline(F.c, OUT), door: D.c, op: [17, 25, 22, 35], lamp: [28, 9], mech: 'rise', glow: '#ffd36b' };
}

function bakeMine() {
  const F = mk(), D = mk(), g = F.g, wood = '#7a5230', woodL = '#a07040', woodD = '#4a3018';
  /* a headframe: two timber legs braced, a pulley wheel at the top, a rope down to the cage; rails at the foot */
  for (const x0 of [6, 44]) { planks(g, x0, 20, 6, 40, wood, x0, 3); R(g, x0, 20, 6, 1, woodL); R(g, x0 - 1, 56, 8, 4, '#5f5a52'); R(g, x0 - 1, 56, 8, 1, '#8b8378'); }
  line4(g, 12, 56, 20, 30, woodD); line4(g, 43, 56, 36, 30, woodD); line4(g, 12, 26, 20, 40, wood); line4(g, 43, 26, 36, 40, wood);
  planks(g, 6, 20, 44, 5, wood, 6, 4); R(g, 6, 24, 44, 1, woodD);
  /* the sheave: a wheel on its cap beam */
  R(g, 22, 13, 12, 7, woodD); R(g, 23, 12, 10, 2, wood);
  for (let a = 0; a < 16; a++) { const t = a / 16 * 6.283; P(g, 28 + Math.round(Math.cos(t) * 6), 15 + Math.round(Math.sin(t) * 5), '#8a919c'); }
  R(g, 27, 14, 3, 3, '#c9d1dc'); R(g, 28, 15, 1, 1, '#4a5058');
  R(g, 25, 20, 1, 7, '#c9b894'); R(g, 31, 20, 1, 7, '#c9b894');                                                                     /* the rope down */
  R(g, 22, 8, 12, 2, woodD); R(g, 24, 9, 8, 1, '#5f5a52');                                                                         /* a shelf for the lantern */
  /* the cage: an iron frame, its roof, mesh sides, the floor plate */
  R(g, 16, 27, 24, 3, '#3a3e48'); R(g, 16, 27, 24, 1, '#8a919c'); R(g, 15, 30, 2, 30, '#3a3e48'); R(g, 39, 30, 2, 30, '#3a3e48'); R(g, 15, 30, 1, 30, '#8a919c');
  R(g, 14, 56, 28, 4, '#3a3e48'); R(g, 14, 56, 28, 1, '#8a919c'); R(g, 20, 57, 2, 1, '#e0b040'); R(g, 34, 57, 2, 1, '#e0b040');
  R(g, 22, 25, 12, 2, '#3a3e48'); R(g, 27, 21, 2, 6, '#8a919c');                                                                  /* the hanger */
  R(g, 10, 36, 4, 1, '#e0b040'); R(g, 10, 38, 4, 1, '#3a3020'); R(g, 42, 36, 4, 1, '#e0b040'); R(g, 42, 38, 4, 1, '#3a3020');       /* hazard stripes on the legs */
  const d = D.g; R(d, 17, 30, 22, 26, '#1b1d24');
  for (let x = 17; x < 39; x += 3) R(d, x, 30, 1, 26, '#8a919c'); for (let y = 30; y < 56; y += 4) R(d, 17, y, 22, 1, '#5a6068');
  R(d, 27, 30, 2, 26, '#3a3e48'); R(d, 17, 41, 22, 3, '#3a3e48'); R(d, 17, 41, 22, 1, '#8a919c');
  return { frame: outline(F.c, OUT), door: D.c, op: [17, 30, 22, 26], lamp: [28, 8], mech: 'swing', glow: '#ffb860' };
}
function line4(g, x0, y0, x1, y1, col) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); R(g, x, y, 2, 2, col); } }

function bakeStorm() {
  const F = mk(), D = mk(), g = F.g, base = '#6a7488';
  /* a gatehouse: a keep between two towers, crenellated, arrow slits, a banner, a portcullis in the arch */
  stone(g, 4, 20, 14, 40, base, 31, 5, 7); stone(g, 38, 20, 14, 40, base, 32, 5, 7); stone(g, 18, 16, 20, 44, shade(base, -0.06), 33, 5, 7);
  for (const x0 of [4, 38]) { R(g, x0 - 1, 17, 16, 3, shade(base, 0.1)); for (let x = x0 - 1; x < x0 + 15; x += 4) R(g, x, 13, 3, 4, shade(base, 0.08)); R(g, x0 - 1, 17, 16, 1, '#a0aac0'); R(g, x0 + 5, 28, 2, 7, OUT); R(g, x0 + 5, 44, 2, 7, OUT); }
  R(g, 17, 13, 22, 3, shade(base, 0.1)); for (let x = 17; x < 39; x += 4) R(g, x, 10, 3, 3, shade(base, 0.08)); R(g, 17, 16, 22, 1, '#a0aac0');
  R(g, 3, 59, 50, 1, '#3a4254');
  /* arch cut: a pointed arch */
  for (let y = 26; y < H; y++) for (let x = 20; x < 36; x++) { if (y < 32) { const half = 3 + (y - 26) * 2.1; if (Math.abs(x + 0.5 - 28) > half) continue; } CLR(g, x, y, 1, 1); }
  R(g, 19, 32, 1, 28, '#3a4254'); R(g, 36, 32, 1, 28, '#3a4254'); for (let i = 0; i < 6; i++) { P(g, 28 - 3 - i * 2, 26 + i * 1, '#a0aac0'); }
  /* banner: a long storm-blue pennant on the left tower, a yellow bolt on it */
  R(g, 9, 21, 1, 14, '#c9b894'); R(g, 10, 21, 6, 10, '#3a5a9a'); R(g, 10, 31, 2, 2, '#3a5a9a'); R(g, 14, 31, 2, 2, '#3a5a9a'); P(g, 13, 23, '#ffd36b'); P(g, 12, 25, '#ffd36b'); P(g, 13, 26, '#ffd36b'); P(g, 12, 28, '#ffd36b');
  R(g, 22, 8, 12, 2, '#a0aac0'); R(g, 24, 9, 8, 1, '#3a4254');                                                                        /* the lantern's crest */
  const d = D.g; /* the portcullis: iron lattice */
  R(d, 20, 28, 16, 32, '#2a2e3a'); for (let x = 20; x < 36; x += 4) { R(d, x, 28, 2, 32, '#7a8498'); P(d, x, 59, '#c9d1dc'); } for (let y = 30; y < 60; y += 6) R(d, 20, y, 16, 2, '#5a6478');
  for (let x = 20; x < 36; x += 4) { R(d, x, 59, 2, 1, '#c9d1dc'); }
  return { frame: outline(F.c, OUT), door: D.c, op: [20, 26, 16, 34], lamp: [28, 8], mech: 'rise', glow: '#ffe0a0' };
}

function bakeCoast() {
  const F = mk(), D = mk(), g = F.g, wood = '#5a6a6a', woodL = '#8aa0a0', woodD = '#2f3c3c';
  /* a ship-timber gate: two masts/posts of salt-silvered timber with a crosstree, a ship's wheel, rope netting, barnacles; the hatch is a bulkhead */
  for (const x0 of [6, 43]) { planks(g, x0, 14, 7, 46, wood, x0 + 5, 3); R(g, x0, 14, 7, 1, woodL); R(g, x0 - 1, 52, 9, 8, '#c9d1d8'); tex(g, x0 - 1, 52, 9, 8, ['#8aa0a8', '#e8f0f0', '#6a7a82'], 22, x0); for (const y of [20, 30, 40]) { R(g, x0, y, 7, 1, '#c9b894'); P(g, x0 + 3, y + 1, '#8a7a54'); } }
  planks(g, 4, 22, 48, 5, wood, 2, 4); R(g, 4, 22, 48, 1, woodL); R(g, 4, 26, 48, 1, woodD);
  planks(g, 14, 15, 28, 5, '#4a5858', 6, 4);                                                                                     /* the upper yard */
  /* rope netting hanging from the crosstree */
  for (let x = 13; x < 44; x += 4) R(g, x, 27, 1, 6, '#c9b894'); R(g, 13, 29, 31, 1, '#c9b894'); R(g, 13, 32, 31, 1, '#a8946a');
  /* an anchor emblem + a ship's lamp post at the middle */
  R(g, 27, 9, 2, 6, wood); R(g, 24, 13, 8, 2, woodL);
  R(g, 27, 16, 2, 5, '#c9d1dc'); R(g, 25, 16, 6, 1, '#c9d1dc'); R(g, 25, 20, 2, 1, '#c9d1dc'); R(g, 29, 20, 2, 1, '#c9d1dc'); P(g, 24, 19, '#c9d1dc'); P(g, 31, 19, '#c9d1dc');
  /* a coil of rope and a bell? just a coil at the foot */
  R(g, 14, 56, 5, 4, '#c9b894'); R(g, 15, 57, 3, 2, '#8a7a54');
  R(g, 37, 53, 4, 7, '#7a5230'); R(g, 37, 53, 4, 1, '#a07040'); R(g, 37, 56, 4, 1, '#2a2418');                                   /* a barrel */
  const d = D.g; planks(d, 16, 33, 24, 27, '#6a5a3a', 12, 3);
  R(d, 16, 33, 24, 2, woodD); R(d, 16, 58, 24, 2, woodD); R(d, 27, 33, 2, 27, '#1e2a2a');
  for (let x = 18; x < 39; x += 6) { P(d, x, 36, '#c9d1dc'); P(d, x, 55, '#c9d1dc'); }
  R(d, 20, 42, 6, 6, '#3a4848'); R(d, 21, 43, 4, 4, '#a8d8e8'); R(d, 30, 42, 6, 6, '#3a4848'); R(d, 31, 43, 4, 4, '#a8d8e8');    /* portholes */
  return { frame: outline(F.c, OUT), door: D.c, op: [16, 33, 24, 27], lamp: [28, 9], mech: 'swing', glow: '#ffe0a0' };
}

function bakeCanal() {
  const F = mk(), D = mk(), g = F.g, brick = '#6a5a52';
  /* a lock: brick chamber walls to either side, the mitre gates meeting in a V, a balance beam over each, a windlass; the water below */
  stone(g, 2, 28, 12, 32, brick, 41, 4, 6); stone(g, 42, 28, 12, 32, brick, 42, 4, 6);
  R(g, 1, 26, 14, 3, '#8a7a70'); R(g, 41, 26, 14, 3, '#8a7a70'); R(g, 1, 26, 14, 1, '#b0a090'); R(g, 41, 26, 14, 1, '#b0a090');       /* copings */
  for (const x0 of [3, 43]) { R(g, x0 + 2, 20, 3, 6, '#2a2418'); R(g, x0 + 1, 19, 5, 1, '#8a919c'); R(g, x0 + 3, 17, 1, 3, '#8a919c'); }            /* bollards */
  /* the balance beams: long black timbers reaching out over the walls, each over its gate, with the pivot post */
  R(g, 8, 22, 22, 3, '#2a2418'); R(g, 8, 22, 22, 1, '#4a3a28'); R(g, 26, 22, 22, 3, '#2a2418'); R(g, 26, 22, 22, 1, '#4a3a28');
  R(g, 14, 18, 3, 5, '#2a2418'); R(g, 39, 18, 3, 5, '#2a2418');
  R(g, 8, 25, 4, 2, '#8a919c'); R(g, 44, 25, 4, 2, '#8a919c');                                                                  /* iron collars on the beam ends */
  R(g, 26, 12, 4, 12, '#3a3e48'); R(g, 24, 11, 8, 2, '#5a6068'); R(g, 25, 9, 6, 2, '#8a919c');                                  /* the lamp standard, between the beams */
  /* the water: pale-teal strip along the sill + wet marks up the brick */
  R(g, 14, 56, 28, 4, '#3a6a74'); for (let x = 14; x < 42; x += 3) R(g, x, 57 + (x % 2), 2, 1, '#8fd0d0'); tex(g, 2, 50, 12, 10, ['#3a4a40', '#4a6a5a'], 14, 3); tex(g, 42, 50, 12, 10, ['#3a4a40', '#4a6a5a'], 14, 4);
  CLR(g, 14, 28, 28, 28);
  /* the mitre gates (the door): two black leaves, planked, hinged at the walls, pointing to a V in the middle */
  const d = D.g; for (let x = 14; x < 42; x++) { const t = x < 28 ? (x - 14) : (41 - x); R(d, x, 30 + (t >> 2), 1, 26 - (t >> 2), (x & 1) ? '#2a2418' : '#3a3022'); }
  for (let y = 36; y < 56; y += 6) R(d, 14, y, 28, 1, '#1a140c'); R(d, 27, 33, 2, 23, '#6a5a3a'); for (const x of [16, 38]) R(d, x, 31, 3, 25, '#8a919c');
  R(d, 22, 42, 2, 2, '#8a919c'); R(d, 32, 42, 2, 2, '#8a919c');                                                               /* the paddle gear on each leaf */
  return { frame: outline(F.c, OUT), door: D.c, op: [14, 28, 28, 30], lamp: [28, 9], mech: 'swing', glow: '#ffe9b0' };
}

function bakeInland() {
  const F = mk(), D = mk(), g = F.g, base = '#7a7a82';
  /* a STONE lychgate (Waymeet's is the timber one): two squared piers, a steep slate roof with a ridge and a gap, an iron wicket with spear-points */
  stone(g, 8, 24, 9, 36, base, 51, 6, 9); stone(g, 39, 24, 9, 36, base, 52, 6, 9);
  R(g, 7, 22, 11, 3, '#9a9aa4'); R(g, 38, 22, 11, 3, '#9a9aa4'); R(g, 7, 22, 11, 1, '#c0c0c8'); R(g, 38, 22, 11, 1, '#c0c0c8');
  /* the roof: two slopes of dark slate, each course a notch higher towards the ridge */
  for (let k = 0; k < 11; k++) { const y = 21 - k, inset = k * 2; R(g, 2 + inset, y, 52 - inset * 2, 1, k % 2 ? '#4a4a58' : '#3a3a48'); }
  for (let x = 3; x < 53; x += 3) P(g, x, 20, '#6a6a7a'); R(g, 2, 21, 52, 1, '#2a2a34'); R(g, 24, 10, 8, 1, '#6a6a7a');
  R(g, 12, 21, 1, 3, '#2a2a34'); R(g, 43, 21, 1, 3, '#2a2a34');                                                                 /* dripping eaves */
  R(g, 25, 8, 6, 2, '#5a5a6a'); R(g, 26, 7, 4, 1, '#7a7a8a');                                                                  /* the ridge's lantern-seat */
  /* a bent finial-less cross on the left pier, ivy dead on the right; crows? no - a skull-less memorial slab */
  R(g, 11, 30, 3, 6, '#9a9aa4'); R(g, 10, 32, 5, 1, '#9a9aa4');
  tex(g, 39, 24, 9, 36, ['#4a5a3a', '#3a4a2c'], 22, 5); for (let i = 0; i < 8; i++) R(g, 40 + (i * 7) % 7, 24 + i * 3, 1, 4, '#3a4a2c');
  R(g, 7, 58, 42, 2, '#4a4a54'); R(g, 17, 24, 22, 1, '#2a2a34'); R(g, 17, 25, 22, 2, '#4a4a58');                                  /* the sill, the lintel plate */
  CLR(g, 17, 27, 22, 31);
  const d = D.g; /* the wicket: wrought-iron bars with spear tops and a scrolled middle */
  for (let x = 18; x < 38; x += 3) { R(d, x, 30, 1, 28, '#1e1e26'); R(d, x - 1, 28, 3, 2, '#1e1e26'); P(d, x, 27, '#3a3a46'); R(d, x, 30, 1, 1, '#5a5a6a'); }
  R(d, 17, 38, 22, 2, '#1e1e26'); R(d, 17, 52, 22, 2, '#1e1e26'); R(d, 27, 30, 2, 28, '#3a3a46'); for (const x of [21, 33]) { R(d, x - 1, 44, 3, 3, '#1e1e26'); P(d, x, 45, '#5a5a6a'); }
  R(d, 25, 46, 2, 3, '#7a7a8a'); R(d, 29, 46, 2, 3, '#7a7a8a');
  return { frame: outline(F.c, OUT), door: D.c, op: [17, 27, 22, 31], lamp: [28, 7], mech: 'swing', glow: '#ffd36b' };
}

function bakeDesert() {
  const F = mk(), D = mk(), g = F.g, sand = '#d8b878', sandL = '#ecd49a', sandD = '#a8845a';
  /* a sandstone doorway: battered (leaning) jambs, a plain lintel under a curved cornice, a winged sun carved on it, columns of glyphs; a stepped base */
  for (let y = 20; y < H; y++) { const inset = Math.round((y - 20) * 0.0) ; R(g, 6 + inset, y, 14, 1, (y & 3) ? sand : sandD); R(g, 36 - inset, y, 14, 1, (y & 3) ? sand : sandD); }
  R(g, 6, 20, 1, 40, sandL); R(g, 19, 20, 1, 40, sandD); R(g, 36, 20, 1, 40, sandL); R(g, 49, 20, 1, 40, sandD);
  tex(g, 6, 20, 44, 40, [sandL, sandD, '#c0a068'], 70, 6);
  /* the lintel + cornice (a cavetto curve) */
  R(g, 4, 14, 48, 6, sand); R(g, 4, 14, 48, 1, sandL); R(g, 4, 19, 48, 1, sandD); for (let i = 0; i < 4; i++) R(g, 2 - (i > 1 ? 0 : 0) + i, 10 + i, 52 - i * 2, 1, i % 2 ? sandL : sand);
  R(g, 4, 10, 48, 1, sandL); R(g, 2, 13, 52, 1, sandD);
  /* the sun disc between two wings */
  R(g, 25, 15, 6, 4, '#c0392b'); R(g, 26, 14, 4, 1, '#c0392b'); R(g, 27, 16, 2, 2, '#ffd36b');
  for (let i = 0; i < 6; i++) { R(g, 12 + i * 2, 16 + (i >> 1), 2, 1, '#2f5a8a'); R(g, 42 - i * 2, 16 + (i >> 1), 2, 1, '#2f5a8a'); }
  /* glyph columns on the jambs */
  for (const x of [9, 13, 40, 44]) for (let y = 24; y < 54; y += 5) { R(g, x, y, 2, 1, sandD); R(g, x, y + 2, 1, 2, sandD); R(g, x + 1, y + 3, 1, 1, '#2f5a8a'); }
  R(g, 24, 8, 8, 2, sandL); R(g, 25, 9, 6, 1, sandD);                                                                           /* the lantern's seat on the cornice */
  R(g, 3, 56, 50, 4, sandD); R(g, 3, 56, 50, 1, sandL); R(g, 2, 58, 52, 2, '#8a6a44');                                          /* the steps */
  CLR(g, 20, 20, 16, 36);
  const d = D.g; /* the slab: a single block of carved sandstone with a bronze ring */
  R(d, 20, 20, 16, 38, sand); for (let y = 20; y < 58; y += 6) R(d, 20, y, 16, 1, sandD); R(d, 20, 20, 1, 38, sandL); R(d, 35, 20, 1, 38, sandD);
  tex(d, 20, 20, 16, 38, [sandL, sandD], 40, 9); R(d, 26, 24, 4, 4, '#c0392b'); R(d, 27, 25, 2, 2, '#ffd36b'); R(d, 24, 30, 8, 1, '#2f5a8a'); R(d, 22, 33, 12, 1, sandD);
  R(d, 26, 42, 4, 4, '#b8742a'); R(d, 27, 43, 2, 2, sandD); R(d, 27, 46, 2, 1, '#b8742a');
  return { frame: outline(F.c, OUT), door: D.c, op: [20, 20, 16, 38], lamp: [28, 8], mech: 'rise', glow: '#ffe0a0' };
}

/* THE MAGE'S FOLLY: the OBSERVATORY DOOR. A round arch of violet tower-stone with a brass astrolabe ring over the lintel, rune-lit jambs, and two leaves
   of dark star-strewn wood that part on a doorway full of DAWN (rose to gold), not the lantern's warm yellow. */
function bakeMage() {
  const F = mk(), D = mk(), g = F.g, base = '#5a4a7a';
  stone(g, 7, 22, 12, 38, base, 71, 6, 8); stone(g, 37, 22, 12, 38, base, 72, 6, 8);
  R(g, 6, 20, 14, 3, '#7a6a9a'); R(g, 36, 20, 14, 3, '#7a6a9a'); R(g, 6, 20, 14, 1, '#a090c8'); R(g, 36, 20, 14, 1, '#a090c8');
  for (let k = 0; k < 7; k++) { R(g, 6 + k, 19 - k, 44 - k * 2, 1, k % 2 ? '#4a3a6a' : '#3a2a5a'); }
  R(g, 9, 12, 38, 1, '#2a1a40');
  /* the astrolabe: a brass ring on the lintel with three notches and a star */
  for (let a = 0; a < 40; a++) { const t = a / 40 * 6.2832; P(g, 28 + Math.round(Math.cos(t) * 6), 11 + Math.round(Math.sin(t) * 5), a % 10 < 2 ? '#fff0b0' : '#e0b050'); }
  R(g, 27, 10, 3, 3, '#ffd36b'); P(g, 28, 11, '#ffffff'); R(g, 18, 22, 20, 1, '#2a1a40');
  /* rune lights on the jambs */
  for (const x of [11, 15, 40, 44]) for (let y = 28; y < 56; y += 7) { R(g, x, y, 2, 1, '#b07cf0'); R(g, x, y + 2, 1, 2, '#b07cf0'); P(g, x + 1, y + 3, '#e0c8ff'); }
  R(g, 4, 58, 48, 2, '#3a2a5a'); R(g, 4, 58, 48, 1, '#7a6a9a');
  CLR(g, 19, 23, 18, 35);
  const d = D.g; /* the leaves: night-blue planks, a brass band and a scatter of stars */
  planks(d, 19, 23, 18, 35, '#2a2a5a', 73, 3); R(d, 19, 36, 18, 2, '#a8782a'); R(d, 19, 50, 18, 2, '#a8782a'); R(d, 27, 23, 2, 35, '#1a1a3a');
  for (const [x, y] of [[22, 28], [32, 31], [24, 42], [33, 45], [21, 54], [34, 26]]) { P(d, x, y, '#fff0b0'); P(d, x + 1, y, '#e0b050'); }
  R(d, 25, 40, 2, 3, '#e0b050'); R(d, 29, 40, 2, 3, '#e0b050');
  return { frame: outline(F.c, OUT), door: D.c, op: [19, 23, 18, 35], lamp: [28, 6], mech: 'swing', glow: '#ffb8a0' };
}

const BAKERS = { mage: bakeMage, forest: bakeForest, marsh: bakeMarsh, fungus: bakeFungus, crag: bakeCrag, mine: bakeMine, storm: bakeStorm, coast: bakeCoast, canal: bakeCanal, inland: bakeInland, desert: bakeDesert };
const CACHE = {};
export function sprite(kind) { const k = BAKERS[kind] ? kind : DEFAULT; return CACHE[k] || (CACHE[k] = BAKERS[k]()); }
/* main.js calls this when a level loads: bake the kind NOW, at load, never on a frame */
export function prime(levelId) { sprite(kindOf(levelId)); lamps(); }

/* ---- the draw: the doorway's light, the door (parting or rising), the frame, the lantern ---- */
const ease = k => k * k * (3 - 2 * k);
/* st: the per-gate state, kept on the gate object by the caller ({} to start). near: distance of the nearest hero in px. locked: the game says not yet.
   sfx: { light(), open() } called ONCE each on the rising edge. t: seconds (game time). Returns nothing. */
export function draw(g, kind, gx, gy, cx, cy, t, near, locked, st, sfx) {
  const S = sprite(kind), L = lamps();
  const dt = st.t === undefined ? 0 : Math.max(0, Math.min(0.1, t - st.t)); st.t = t;
  const wantLit = !locked && near < LIGHT_AT, wantOpen = !locked && near < OPEN_AT;
  st.lit = Math.max(0, Math.min(1, (st.lit || 0) + (wantLit ? dt * 3 : -dt * 1.2)));
  st.open = Math.max(0, Math.min(1, (st.open || 0) + (wantOpen ? dt * 4 : -dt * 1.2)));
  if (wantLit && !st.sl) { st.sl = 1; if (sfx && sfx.light) sfx.light(); } if (!wantLit && st.lit < 0.05) st.sl = 0;
  if (wantOpen && !st.so) { st.so = 1; if (sfx && sfx.open) sfx.open(); } if (!wantOpen && st.open < 0.05) st.so = 0;
  const x0 = Math.round(gx - W / 2 - cx), y0 = Math.round(gy - H - cy);
  if (x0 > g.canvas.width + 4 || x0 < -W - 4) return;
  const [ox, oy, ow, oh] = S.op, k = ease(st.open), a = st.lit;
  /* the doorway: dark when shut, filled with the light of the way on as it opens */
  g.fillStyle = '#0e0c14'; g.fillRect(x0 + ox, y0 + oy, ow, oh);
  if (k > 0 || a > 0) {
    const gl = S.glow, q = 0.25 * a + 0.75 * k;
    g.globalAlpha = q; g.fillStyle = gl; g.fillRect(x0 + ox, y0 + oy, ow, oh);                                          /* the warm fill, then a brighter core, then a white heart: stepped, not smooth */
    g.globalAlpha = 0.55 * k + 0.2 * a; g.fillStyle = '#fff1b8'; g.fillRect(x0 + ox + 2, y0 + oy + 2, ow - 4, oh - 2);
    g.globalAlpha = 0.5 * k; g.fillStyle = '#ffffff'; g.fillRect(x0 + ox + (ow >> 1) - 2, y0 + oy + (oh >> 1), 4, oh - (oh >> 1));
    g.globalAlpha = 0.35 * k; g.fillStyle = '#ffd36b'; for (let i = 0; i < 3; i++) g.fillRect(x0 + ox + 3 + i * ((ow - 7) >> 1), y0 + oy + 3, 1, oh - 3);   /* three rays */
    g.globalAlpha = 1;
  }
  /* the door */
  g.save(); g.beginPath(); g.rect(x0 + ox, y0 + oy, ow, oh); g.clip();
  if (S.mech === 'rise') g.drawImage(S.door, x0, y0 - Math.round(k * (oh - 3)));
  else { const hw = ow >> 1, w2 = Math.max(0, Math.round(hw * (1 - k)));
    if (w2 > 0) { g.drawImage(S.door, ox, oy, hw, oh, x0 + ox, y0 + oy, w2, oh); g.drawImage(S.door, ox + hw, oy, ow - hw, oh, x0 + ox + ow - w2, y0 + oy, w2, oh); } }
  g.restore();
  g.drawImage(S.frame, x0, y0);
  /* the lantern on top, and its light */
  const lx = x0 + S.lamp[0] - 4, ly = y0 + S.lamp[1] - 10;
  if (a > 0.02) {
    const fl = 0.85 + 0.15 * Math.sin(t * 9 + gx) + 0.05 * Math.sin(t * 23);
    g.globalAlpha = 0.16 * a * fl; g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(lx + 4, ly + 5, 22, 0, 7); g.fill();
    g.globalAlpha = 0.22 * a * fl; g.beginPath(); g.arc(lx + 4, ly + 5, 13, 0, 7); g.fill(); g.globalAlpha = 1;
  }
  g.drawImage(a > 0.3 ? L.on : L.off, lx, ly);
  /* the gold ribbon: a pennant on a short staff beside the lantern, drooping dark-gold when unlit, streaming bright when lit */
  const rx = lx + 9, sw = Math.sin(t * 4 + gx * 0.1);
  g.fillStyle = '#8a6a22'; g.fillRect(rx, ly - 1, 1, 9);
  for (let i = 0; i < 7; i++) { const w = 1 + Math.round((a > 0.3 ? 1 : 0.4) * (i < 4 ? 1 : 0.6) * 3 * (1 + 0.4 * sw)), off = Math.round(Math.sin(t * 5 + i * 0.7 + gx) * 0.6 * a); g.fillStyle = a > 0.3 ? (i & 1 ? '#ffd36b' : '#ffe9a0') : '#a8802a'; g.fillRect(rx + 1, ly + (i >> 0) * 0 + i + off - 1 + 0, w, 1); }
}
