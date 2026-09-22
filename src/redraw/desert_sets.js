// ============================================================================================
// THE DESERT ARC's TILE SETS AND BACKDROPS, one per place (not wired in: the level batches pick them by L.palette.set). Level 1
// (THE SUNKEN CARAVAN) is redraw/desert.js + slopes.js; these are levels 2-7 and the Sun Temple. px.js primitives only, so
// tools/desert-sets.mjs renders a scene of each in Node.
//
// Each bakeXxxSet() returns one SET, the same shape everywhere so the level code needs no per-level cases:
//   { name, pal, top: [3], fill: [3], wall: [3], ledge: [2] (a one-way, 16x6), trim: [2] (a decorated course: the level's accent),
//     sky: 16 x 180 strip | null (indoors), far: w x h (tiles across), mid: w x h (tiles across), props: { ... } }
// top = a floor tile with its lit lip; fill = what is under it; wall = the face of a standing wall / building / block course.
// THE RULE OF THE ARC'S ART (desert.js): sunlit things are pale and warm; SHADE is one cool violet step (DESERT.shade), everywhere.
// Indoors (the city, the pyramids) the light is lamps and beams, so the dark is the default and the LIT is the accent.
//
//   bakeWellTownSet()     whitewashed mud-brick, blue doors, palm-log roof beams; far: the town's white cubes and domes
//   bakeGorgeSet()        red sandstone in strata, rope-and-plank ledges, running water; far: canyon walls, mid: nearer cliffs
//   bakeGlassSet(night)   fused sand-glass, pale green and bright, cracked; night: the same under stars, only the glints lit
//   bakeTempleSet()       white limestone and gold, the sun-disc course; far: the colonnade in the heat
//   bakeCitySet()         sandstone and blue glazed tile under a roof of sand, lamplight; far: buried facades; mid: sand ceiling
//   bakePyramidSet(king)  the Sealed Pyramid's black-and-gold limestone by torchlight; king: the King's black granite and gold,
//                         for the white sunbeams to cut across. far: the painted gallery wall; the storm-face exterior as props.face
// ============================================================================================
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, mulberry, shade as tint } from '../px.js';
import { OUT } from '../art.js';
import { DESERT as D } from './desert.js';

const R = (seed) => mulberry(seed);
/* noise over a rect: each pixel has a chance of one of the given colours */
function speck(g, rnd, x0, y0, w, h, cols, p) { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (rnd() < p) px(g, x, y, cols[(rnd() * cols.length) | 0]); }
/* ashlar: courses of blocks `bh` tall, `bw` wide, offset every other course; each block's face jittered, mortar, a lit top edge and a
   shaded bottom edge on each block (so a wall reads as stone, not a pattern) */
function ashlar(g, rnd, P, { bw = 8, bh = 8, off = 4, x0 = 0, y0 = 0, w = 16, h = 16, row0 = 0 } = {}) {
  rect(g, x0, y0, w, h, P.mortar);
  for (let r = 0, y = y0; y < y0 + h; r++, y += bh) {
    const o = ((r + row0) % 2) * off;
    for (let x = x0 - o; x < x0 + w; x += bw) {
      const bx = Math.max(x0, x), bx1 = Math.min(x0 + w, x + bw - 1), by1 = Math.min(y0 + h, y + bh - 1), face = rnd() < 0.3 ? P.faceD : rnd() < 0.4 ? P.faceL : P.face;
      if (bx1 <= bx) continue;
      rect(g, bx, y, bx1 - bx, by1 - y, face); rect(g, bx, y, bx1 - bx, 1, P.edgeL); rect(g, bx, by1 - 1, bx1 - bx, 1, P.edgeD);
      speck(g, rnd, bx, y + 1, bx1 - bx, by1 - y - 2, [P.faceD, P.faceL], 0.08);
    }
  }
}
const tiles = (n, fn) => Array.from({ length: n }, (_, v) => { const [c, g] = canvas(16, 16); fn(g, v); return c; });
const strip = (w, h, fn) => { const [c, g] = canvas(w, h); fn(g); return c; };
/* a sky strip, banded top to bottom with dithered joins (the shim has no gradients) */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function skyStrip(h, bands) { return strip(16, h, g => { const n = bands.length, step = h / n;           // flat bands, each blending into the next over its last third (ordered dither)
  for (let y = 0; y < h; y++) { const f = y / step, i = Math.min(n - 1, Math.floor(f)), t = f - i;
    for (let x = 0; x < 16; x++) { const k = (t - 0.66) / 0.34, next = i + 1 < n && k > 0 && BAYER[(y & 3) * 4 + (x & 3)] / 16 < k; px(g, x, y, bands[next ? i + 1 : i]); } } }); }
/* a silhouette layer from a height function (tiles across because hf(0) must equal hf(w)) */
function ridge(w, h, hf, body, lip, extra) { return strip(w, h, g => { for (let x = 0; x < w; x++) { const t = Math.round(hf(x)); rect(g, x, t, 1, h - t, body); px(g, x, t, lip); } extra && extra(g); }); }
const per = (w, k, x) => Math.sin(x / w * Math.PI * 2 * k);
const ledgeOf = (P, rope) => [0, 1].map(v => strip(16, 6, g => { rect(g, 0, 0, 16, 4, P.plank); rect(g, 0, 0, 16, 1, P.plankL); rect(g, 0, 3, 16, 1, P.plankD);
  for (let x = v * 3 + 2; x < 16; x += 7) rect(g, x, 0, 1, 4, P.plankD); if (rope) { line(g, 0, 5, 16, 5, P.rope); px(g, 4 + v * 6, 4, P.rope); } else { rect(g, 1, 4, 2, 2, P.plankD); rect(g, 13, 4, 2, 2, P.plankD); } }));

// ============================== WELL TOWN: whitewash and mud-brick ==============================
const WT = { lime: '#f4eee0', limeL: '#fffaf0', limeD: '#d8cdb8', limeS: '#b8a8a0', brick: '#b27a52', brickD: '#8e5a3a', brickL: '#c9926a', mortar: '#9a6a48',
  earth: '#c8a070', earthL: '#dcb888', earthD: '#a88050', earthS: '#8a6a86', blue: '#2e6ea8', blueL: '#5a9ad0', blueD: '#1e4a78', viga: '#6e4a2c', vigaL: '#8e6440',
  plank: '#8e6440', plankL: '#b08458', plankD: '#5e4028', rope: '#c8b080', palm: '#5e7a3a', palmL: '#86a052', palmD: '#3e5628', trunk: '#8a6a48' };
export function bakeWellTownSet() {
  const P = WT, seed = 7100;
  const fill = tiles(3, (g, v) => { const r = R(seed + v); rect(g, 0, 0, 16, 16, P.earth); speck(g, r, 0, 0, 16, 16, [P.earthD, P.earthL, P.earthD], 0.12); if (v === 1) { rect(g, 5, 9, 3, 2, P.earthD); px(g, 6, 9, P.earthL); } });
  const top = tiles(3, (g, v) => { g.drawImage(fill[v], 0, 0); rect(g, 0, 0, 16, 2, P.earthL); rect(g, 0, 2, 16, 1, P.earth); const r = R(seed + 10 + v); speck(g, r, 0, 3, 16, 3, [P.earthD], 0.15); if (v === 2) { px(g, 9, 1, P.limeD); px(g, 10, 1, P.earthD); } });
  /* THE WALL: lime-washed mud-brick. The wash is clean and bright; where it has flaked (v 1, v 2) the brick shows through. */
  const wall = tiles(3, (g, v) => { const r = R(seed + 20 + v); rect(g, 0, 0, 16, 16, P.lime); speck(g, r, 0, 0, 16, 16, [P.limeD, P.limeL], 0.06);
    if (v >= 1) { const x0 = v === 1 ? 3 : 8, y0 = v === 1 ? 6 : 2, w = v === 1 ? 8 : 6, h = v === 1 ? 6 : 9; rect(g, x0, y0, w, h, P.mortar);
      for (let y = y0; y < y0 + h; y += 3) for (let x = x0 + ((y / 3) & 1) * 2; x < x0 + w; x += 4) rect(g, x, y, Math.min(3, x0 + w - x), 2, r() < 0.3 ? P.brickD : P.brick);
      rect(g, x0 - 1, y0 - 1, w + 2, 1, P.limeD); rect(g, x0 - 1, y0 + h, w + 2, 1, P.limeL); }
    if (v === 0) { line(g, 10, 3, 12, 8, P.limeS); px(g, 12, 9, P.limeS); } });
  /* TRIM: a blue-painted door lintel course, and the ends of the palm-log roof beams (vigas) that stick out of every roof */
  const trim = [strip(16, 16, g => { rect(g, 0, 0, 16, 16, P.lime); rect(g, 0, 10, 16, 6, P.blue); rect(g, 0, 10, 16, 1, P.blueL); for (let x = 1; x < 16; x += 5) rect(g, x, 12, 3, 3, P.blueD); rect(g, 0, 9, 16, 1, P.limeD); }),
    strip(16, 16, g => { rect(g, 0, 0, 16, 16, P.lime); speck(g, R(seed + 30), 0, 0, 16, 16, [P.limeD], 0.05); for (const x of [2, 10]) { rect(g, x, 3, 4, 3, P.viga); rect(g, x, 3, 4, 1, P.vigaL); px(g, x + 1, 4, P.plankD); rect(g, x, 6, 4, 1, P.limeS); } })];
  const ledge = ledgeOf(P, false);
  const sky = skyStrip(180, ['#6a9ccc', '#8cb4d8', '#b4cede', '#dfe2d4', '#f4e6c2']);
  /* the far layer: the town's white cubes stepping up a hill, domes, one minaret, dark doorways; hazy (a step toward the sky) */
  const far = strip(320, 80, g => { const r = R(seed + 40), c = '#e8e2d6', cd = '#c8c0bc', dd = '#a8a4b0';
    let x = 0; while (x < 320) { const w = 14 + ((r() * 18) | 0), h = 18 + ((r() * 26) | 0) + Math.round(10 * per(320, 1, x)); rect(g, x, 80 - h, w, h, c); rect(g, x + w - 3, 80 - h, 3, h, cd);
      if (r() < 0.6) rect(g, x + 3 + ((r() * (w - 8)) | 0), 80 - h + 5, 2, 3, dd); if (r() < 0.25) { ellipse(g, x + w / 2, 80 - h, w / 3, w / 4, c); rect(g, x + w / 2, 80 - h - w / 4 - 2, 1, 2, cd); }
      x += w - 1; }
    rect(g, 212, 14, 7, 66, c); rect(g, 216, 14, 3, 66, cd); rect(g, 211, 12, 9, 3, cd); ellipse(g, 215, 11, 3, 3, c); rect(g, 213, 22, 2, 3, dd); });
  /* the mid layer: palms and a well-head's shade trees against a low wall */
  const mid = strip(320, 70, g => { const r = R(seed + 50); rect(g, 0, 58, 320, 12, '#d9c8a8'); rect(g, 0, 58, 320, 1, '#efe4cc');
    for (const [x, h] of [[30, 44], [44, 36], [150, 50], [236, 42], [292, 46]]) { for (let y = 0; y < h; y++) { const bx = x + Math.round(3 * Math.sin(y / h * 1.6)); rect(g, bx, 60 - y, 2, 1, y % 3 ? P.trunk : '#6e5438'); }
      const cx = x + 3, cy = 60 - h;
      for (const [dx, dy] of [[-14, 5], [-11, 9], [-6, 11], [6, 11], [11, 9], [14, 5], [-8, -3], [8, -3], [0, -5]]) { const n = Math.max(Math.abs(dx), Math.abs(dy));
        for (let s = 0; s <= n; s++) { const fx = cx + Math.round(dx * s / n), fy = cy + Math.round(dy * s / n + (dy > 0 ? 0 : 0) + (s * s) / (n * 3)); px(g, fx, fy, s < 2 ? P.palmD : P.palm); if (s % 2) px(g, fx, fy + 1, P.palmD); if (s === n - 1) px(g, fx, fy - 1, P.palmL); } }
      circle(g, cx, cy + 1, 1.6, '#8a5a2c'); } });
  const props = { door: strip(16, 26, g => { rect(g, 0, 0, 16, 26, P.lime); rect(g, 3, 4, 10, 22, P.blue); ellipse(g, 8, 5, 5, 3, P.blue); rect(g, 4, 6, 1, 20, P.blueL); rect(g, 8, 6, 1, 20, P.blueD); px(g, 11, 16, '#e8c24a'); rect(g, 2, 25, 12, 1, P.limeS); }) };
  return { name: 'WELL TOWN', pal: P, top, fill, wall, ledge, trim, sky, far, mid, props };
}

// ============================== THE RED GORGE: red rock in strata, and water ==============================
const RG = { s0: '#c8583a', s1: '#b04a32', s2: '#d8704a', s3: '#9a3e2c', s4: '#e08a5c', crack: '#6e2a22', lip: '#f0a070', lipL: '#ffc090',
  water: '#3e8ab0', waterL: '#7ac0d8', waterD: '#2a5e84', foam: '#e0f0f0', plank: '#8a6a44', plankL: '#a88458', plankD: '#5a4028', rope: '#c8b080', shade: '#7e4a5e' };
export function bakeGorgeSet() {
  const P = RG, seed = 7300, band = [P.s0, P.s2, P.s0, P.s1, P.s0, P.s4, P.s0, P.s1, P.s3, P.s1, P.s0, P.s2];
  /* STRATA: the rock's bands run level across tiles (a band's row is the tile's y within a 48 px repeat), and wave by a pixel */
  const strata = (g, v, y0 = 0) => { const r = R(seed + v); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const w = Math.round(per(48, 1, x + v * 16) * 1.5); px(g, x, y, band[(((y + y0 + w + 48) / 4) | 0) % band.length]); }
    speck(g, r, 0, 0, 16, 16, [P.s3, P.s4], 0.03); if (v === 1) { line(g, 6, 5, 7, 10, P.crack); } if (v === 2) { rect(g, 10, 12, 3, 2, P.s3); px(g, 10, 12, P.s4); } };
  const fill = tiles(3, (g, v) => strata(g, v));
  const top = tiles(3, (g, v) => { strata(g, v); rect(g, 0, 0, 16, 2, P.lip); rect(g, 0, 0, 16, 1, P.lipL); rect(g, 0, 2, 16, 1, P.s3); if (v === 0) { px(g, 3, 1, P.s4); px(g, 12, 1, P.s0); } });
  const wall = tiles(3, (g, v) => { strata(g, v, 8); rect(g, 15, 0, 1, 16, P.s3); if (v === 2) { line(g, 2, 0, 3, 16, P.crack); } });   // a cliff face: the same bands, darker right edge
  /* WATER, four frames: the channel's surface flowing east, a foam lip; the flood's head is this at speed */
  const water = Array.from({ length: 4 }, (_, f) => strip(16, 16, g => { rect(g, 0, 0, 16, 16, P.water); rect(g, 0, 8, 16, 8, P.waterD);
    for (let x = 0; x < 16; x++) { const y = Math.round(2 + per(16, 1, x - f * 4)); px(g, x, y, P.waterL); if ((x + f * 4) % 8 === 0) px(g, x, y - 1, P.foam); }
    for (let k = 0; k < 3; k++) rect(g, (k * 6 + f * 4) % 16, 6 + k * 3, 3, 1, P.waterL); }));
  const trim = [strip(16, 16, g => { strata(g, 0, 4); for (const x of [2, 7, 12]) for (let y = 0; y < 16; y++) if ((y + x) % 7 < 5) px(g, x + (y > 8 ? 1 : 0), y, '#6a3a34'); }),     // desert varnish: dark streaks down a cliff
    strip(16, 16, g => { strata(g, 1, 4); rect(g, 0, 0, 16, 5, P.shade); rect(g, 0, 5, 16, 1, P.crack); for (let x = 1; x < 16; x += 5) rect(g, x, 1, 2, 3, '#6a3e52'); })];   // an overhang's shade band (a cave lip)
  const ledge = ledgeOf(P, true);
  const sky = skyStrip(180, ['#3e78b8', '#5a92c8', '#86b0d4', '#c4d0cc', '#f0c89c']);
  const far = strip(320, 110, g => { const c = '#c88a78', cL = '#e0a890', cD = '#b07464';   // the far canyon wall: flat-topped buttes, vertical faces, a band or two
    const tops = [[0, 30], [46, 22], [96, 40], [130, 18], [190, 34], [236, 26], [290, 30], [320, 30]];
    for (let k = 0; k < tops.length - 1; k++) { const [x0, y0] = tops[k], [x1] = tops[k + 1]; rect(g, x0, y0, x1 - x0, 110 - y0, c); rect(g, x0, y0, x1 - x0, 1, cL); rect(g, x1 - 3, y0, 3, 110 - y0, cD);
      for (let y = y0 + 8; y < 110; y += 9) rect(g, x0, y, x1 - x0 - 3, 1, cD); for (let d = 0; d < 6; d++) rect(g, x0 + d, y0 + 1 + d * 2, 1, 110, c); } });
  const mid = strip(320, 90, g => { const c = '#a4503e', cL = '#d07050', cD = '#843a30';    // the nearer cliffs: taller, darker, a lit rim, a shaded foot
    const tops = [[0, 16], [60, 34], [110, 10], [150, 28], [214, 6], [262, 24], [320, 16]];
    for (let k = 0; k < tops.length - 1; k++) { const [x0, y0] = tops[k], [x1] = tops[k + 1]; rect(g, x0, y0, x1 - x0, 90 - y0, c); rect(g, x0, y0, x1 - x0, 2, cL); rect(g, x1 - 4, y0, 4, 90 - y0, cD);
      for (let y = y0 + 6; y < 90; y += 7) rect(g, x0 + 2, y, x1 - x0 - 7, 1, (y & 8) ? cD : '#b45c46'); }
    rect(g, 0, 78, 320, 12, P.shade); });
  const props = { water, bridgePost: strip(6, 24, g => { rect(g, 1, 0, 4, 24, P.plank); rect(g, 1, 0, 1, 24, P.plankL); rect(g, 0, 2, 6, 2, P.rope); }) };
  return { name: 'THE RED GORGE', pal: P, top, fill, wall, ledge, trim, sky, far, mid, props };
}

// ============================== THE GLASS SEA: fused sand, by day and by night ==============================
const GS = { g: '#bcd8c4', gL: '#e4f4ea', gD: '#8eb4a4', gS: '#6e9488', glint: '#ffffff', vein: '#7aa090', sand: '#e2c890', plank: '#9a8a6a', plankL: '#bcae8a', plankD: '#6a5e46', rope: '#c8b080' };
const GN = { g: '#3e5a64', gL: '#6a8e98', gD: '#2a3e4a', gS: '#1e2c36', glint: '#dff4ff', vein: '#34505a', sand: '#5a5a6a', plank: '#4a4a52', plankL: '#6a6a74', plankD: '#2e2e36', rope: '#7a7a84' };
export function bakeGlassSet(night = false) {
  const P = night ? GN : GS, seed = 7500;
  /* the glass: a pale body cut by facet lines (a crack network) with a lit edge on each facet's upper-left and one bright glint.
     By night the body goes dark and only the glints and edges carry: the ground is still readable, barely - the night hunters' ground */
  const glass = (g, v) => { const r = R(seed + v); rect(g, 0, 0, 16, 16, P.g); speck(g, r, 0, 0, 16, 16, [P.gD, P.gL], 0.05);
    const cuts = [[0, 5, 9, 3], [9, 3, 16, 8], [4, 16, 9, 3], [0, 12, 6, 9]]; for (const [x0, y0, x1, y1] of cuts.slice(0, 2 + v % 3)) { line(g, x0, y0, x1, y1, P.gS); line(g, x0, y0 + 1, x1, y1 + 1, P.gL); }
    px(g, 3 + v * 4, 3 + v, P.glint); if (!night || v === 1) px(g, 4 + v * 4, 3 + v, P.gL); };
  const fill = tiles(3, (g, v) => { glass(g, v); rect(g, 0, 10, 16, 6, P.gD); speck(g, R(seed + 9 + v), 0, 10, 16, 6, [P.gS, P.g], 0.1); });
  const top = tiles(3, (g, v) => { glass(g, v); rect(g, 0, 0, 16, 1, P.glint); rect(g, 0, 1, 16, 1, P.gL); if (v === 2) { rect(g, 6, 0, 4, 1, P.sand); } });
  const wall = tiles(3, (g, v) => { glass(g, v + 1); rect(g, 0, 0, 1, 16, P.gL); rect(g, 15, 0, 1, 16, P.gS); });
  const trim = [strip(16, 16, g => { glass(g, 0); for (let k = 0; k < 3; k++) { line(g, 2 + k * 5, 16, 4 + k * 5, 4 + k * 2, P.vein); px(g, 4 + k * 5, 4 + k * 2, P.glint); } }),    // fulgurite veins: where lightning fused it
    strip(16, 16, g => { rect(g, 0, 0, 16, 16, P.gL); rect(g, 0, 0, 16, 2, P.glint); rect(g, 0, 14, 16, 2, P.gD); for (let x = 1; x < 16; x += 4) px(g, x, 7, P.glint); })];   // a mirror-bright shelf face (the Colossus's arena)
  const ledge = ledgeOf(P, true);
  const sky = night ? strip(16, 180, g => { rect(g, 0, 0, 16, 180, '#0e1428'); rect(g, 0, 120, 16, 60, '#18203a'); rect(g, 0, 160, 16, 20, '#242c48'); const r = R(seed + 70); for (let k = 0; k < 6; k++) px(g, (r() * 16) | 0, (r() * 150) | 0, r() < 0.3 ? '#ffffff' : '#8a9ac8'); })
    : skyStrip(180, ['#4a8ac8', '#76a8d8', '#a8c8e0', '#d8e8e4', '#f4f0dc']);
  const far = ridge(320, 60, x => 34 + 8 * per(320, 2, x) + 4 * per(320, 7, x), night ? '#26343e' : '#8ab4a8', night ? '#4a6470' : '#dff0e6', g => {
    const r = R(seed + 80); for (let k = 0; k < 40; k++) px(g, (r() * 320) | 0, 36 + ((r() * 20) | 0), night ? '#6a8a98' : '#ffffff'); });   // the glass dunes glinting to the horizon
  const mid = strip(320, 80, g => { rect(g, 0, 62, 320, 18, P.gS); for (let x = 0; x < 320; x++) { const y = 62 + Math.round(4 * per(320, 3, x)); rect(g, x, y, 1, 80 - y, P.gD); px(g, x, y, P.gL); }
    for (const [x, h, w] of [[20, 44, 9], [90, 30, 7], [170, 56, 11], [250, 38, 8], [300, 24, 6]]) {    // fulgurite spires: lightning-glass, branching
      for (let y = 70 - h; y < 70; y++) { const ww = Math.max(1, Math.round(w * (y - 70 + h) / h)); rect(g, x - (ww >> 1), y, ww, 1, (y % 5) ? P.gD : P.g); px(g, x - (ww >> 1), y, P.gL); px(g, x + (ww >> 1), y, P.gS); }
      line(g, x, 70 - h * 0.6, x + 7, 70 - h * 0.8, P.g); px(g, x + 7, 70 - h * 0.8, P.glint); px(g, x, 70 - h, P.glint); } });
  const props = { shard: strip(8, 8, g => { fillPoly(g, [[1, 8], [3, 1], [5, 3], [7, 8]], P.gL); line(g, 3, 1, 3, 7, P.glint); px(g, 6, 7, P.gS); }) };
  return { name: night ? 'THE GLASS SEA (night)' : 'THE GLASS SEA', pal: P, top, fill, wall, ledge, trim, sky, far, mid, props };
}

// ============================== THE SUN TEMPLE: white stone and gold ==============================
const ST = { face: '#ece2cc', faceL: '#fff8e6', faceD: '#d4c6a8', edgeL: '#fffcf2', edgeD: '#b8a888', mortar: '#c4b494', gold: '#e8c24a', goldL: '#fff0a0', goldD: '#a8801e',
  red: '#b8463a', plank: '#c4a878', plankL: '#e0c898', plankD: '#8a7450', rope: '#c8b080', shade: '#9a8aa4' };
export function bakeTempleSet() {
  const P = ST, seed = 7700;
  const fill = tiles(3, (g, v) => ashlar(g, R(seed + v), P, { row0: v }));
  const top = tiles(3, (g, v) => { ashlar(g, R(seed + 5 + v), P, { row0: v }); rect(g, 0, 0, 16, 2, P.edgeL); rect(g, 0, 2, 16, 1, P.gold); rect(g, 0, 3, 16, 1, P.goldD); });
  const wall = tiles(3, (g, v) => ashlar(g, R(seed + 10 + v), P, { bw: 16, bh: 8, off: 8, row0: v }));
  /* the SUN-DISC course: a gold band with a rayed disc on every other tile; and a painted frieze (red and gold) */
  const trim = [strip(16, 16, g => { ashlar(g, R(seed + 20), P, { bw: 16, off: 8 }); rect(g, 0, 4, 16, 8, P.gold); rect(g, 0, 4, 16, 1, P.goldL); rect(g, 0, 11, 16, 1, P.goldD);
      circle(g, 8, 8, 2.6, P.goldL); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; px(g, 8 + Math.round(Math.cos(a) * 4), 8 + Math.round(Math.sin(a) * 3), P.goldD); } }),
    strip(16, 16, g => { ashlar(g, R(seed + 21), P, { bw: 16, off: 8 }); rect(g, 0, 5, 16, 6, P.red); for (let x = 0; x < 16; x += 4) { rect(g, x, 6, 2, 4, P.gold); } rect(g, 0, 5, 16, 1, P.goldL); rect(g, 0, 10, 16, 1, P.goldD); })];
  const ledge = ledgeOf(P, false);
  const sky = skyStrip(180, ['#5a92d0', '#80aee0', '#b4d0e8', '#e8ecde', '#fff4d4']);
  const far = strip(320, 90, g => { const c = '#f0e6d4', cd = '#d8ccbc';   // the colonnade in the heat: columns, an architrave, the temple's stepped roof
    rect(g, 40, 30, 240, 8, c); rect(g, 40, 37, 240, 1, cd); fillPoly(g, [[60, 30], [160, 12], [260, 30]], c); line(g, 60, 30, 160, 12, '#fffaf0');
    for (let x = 48; x < 276; x += 18) { rect(g, x, 38, 6, 44, c); rect(g, x + 4, 38, 2, 44, cd); } rect(g, 30, 82, 260, 8, c); rect(g, 30, 82, 260, 1, '#fffaf0'); circle(g, 160, 22, 3, '#f4d67a'); });
  const mid = strip(320, 60, g => { rect(g, 0, 44, 320, 16, '#e8d4a8'); for (let x = 0; x < 320; x += 64) { rect(g, x + 8, 20, 10, 24, P.face); rect(g, x + 15, 20, 3, 24, P.faceD); rect(g, x + 6, 18, 14, 3, P.faceD); rect(g, x + 8, 30, 10, 2, P.gold); } });
  return { name: 'THE SUN TEMPLE', pal: P, top, fill, wall, ledge, trim, sky, far, mid, props: {} };
}

// ============================== THE BURIED CITY: sandstone, blue tile, lamplight, a roof of sand ==============================
const BC = { face: '#b8905c', faceL: '#d0a870', faceD: '#94703e', edgeL: '#dcb880', edgeD: '#6e5030', mortar: '#7a5a38', tile: '#2e6aa0', tileL: '#5a9ad0', tileD: '#1a4470', tileW: '#e8e0c8',
  lamp: '#ffc860', lampL: '#fff0b0', glow: '#d89a48', sand: '#c49860', sandD: '#9a7448', sandS: '#6e5238', dark: '#2a2030', plank: '#7a5a38', plankL: '#9a7a50', plankD: '#4e3822', rope: '#a8906a' };
export function bakeCitySet() {
  const P = BC, seed = 7900;
  const fill = tiles(3, (g, v) => { ashlar(g, R(seed + v), P, { row0: v }); speck(g, R(seed + 3 + v), 0, 0, 16, 16, [P.sandD], 0.04); });
  const top = tiles(3, (g, v) => { ashlar(g, R(seed + 6 + v), P, { row0: v }); rect(g, 0, 0, 16, 2, P.sand); rect(g, 0, 0, 16, 1, '#dcb478'); if (v === 1) { rect(g, 4, 2, 5, 1, P.sand); } });   // sand drifted on every floor
  const wall = tiles(3, (g, v) => ashlar(g, R(seed + 12 + v), P, { bw: 8, bh: 4, off: 4, row0: v }));     // the houses' small brick
  /* THE BLUE TILE: the city's glazed band (star-and-cross, cracked here and there) and a LAMP niche (the light the dark is read by) */
  const trim = [strip(16, 16, g => { rect(g, 0, 0, 16, 16, P.tileD); for (const [x, y] of [[0, 0], [8, 0], [0, 8], [8, 8]]) { rect(g, x, y, 7, 7, P.tile); rect(g, x, y, 7, 1, P.tileL);
      px(g, x + 3, y + 1, P.tileW); rect(g, x + 1, y + 3, 5, 1, P.tileW); px(g, x + 3, y + 5, P.tileW); px(g, x + 3, y + 3, P.lamp); } line(g, 9, 8, 13, 15, P.tileD); }),
    strip(16, 16, g => { ashlar(g, R(seed + 30), P, {}); ellipse(g, 8, 8, 5, 6, P.dark); rect(g, 3, 8, 10, 6, P.dark); rect(g, 6, 10, 4, 3, P.glow); rect(g, 7, 7, 2, 3, P.lamp); px(g, 7, 6, P.lampL); rect(g, 3, 14, 10, 1, P.edgeL); })];
  const ledge = ledgeOf(P, false);
  const sky = null;   // indoors: the backdrop is the far layer over black
  /* far: the buried street's facades - doorways, arched windows with a lamp in some, a blue-tile band - fading to black above */
  const far = strip(320, 120, g => { const r = R(seed + 40); rect(g, 0, 0, 320, 120, P.dark);
    let x = 0; while (x < 320) { const w = 36 + ((r() * 24) | 0), h = 60 + ((r() * 30) | 0); rect(g, x, 120 - h, w - 2, h, '#5a4430'); rect(g, x, 120 - h, w - 2, 2, '#6e5438'); rect(g, x, 120 - h + 8, w - 2, 3, '#24466a');
      for (let k = 0; k < 2; k++) { const wx = x + 6 + k * ((w - 16) >> 1), wy = 120 - h + 18; rect(g, wx, wy, 6, 10, '#1a1420'); ellipse(g, wx + 3, wy, 3, 2, '#1a1420'); if (r() < 0.4) { rect(g, wx + 2, wy + 4, 2, 3, P.glow); px(g, wx + 2, wy + 4, P.lamp); } }
      rect(g, x + (w >> 1) - 5, 104, 9, 16, '#1a1420'); x += w; }
    for (let y = 0; y < 30; y++) for (let xx = 0; xx < 320; xx++) if ((xx + y * 3) % (4 + (y >> 3)) === 0) px(g, xx, y, '#1e1822'); });
  /* mid: THE ROOF OF SAND - the packed sand overhead with timbers and a street's arches holding it, and a stream falling through */
  const mid = strip(320, 60, g => { rect(g, 0, 0, 320, 26, P.sandS); for (let x = 0; x < 320; x++) { const y = 26 + Math.round(3 * per(320, 4, x)); rect(g, x, 20, 1, y - 20, P.sandD); px(g, x, y, P.sand); }
    for (let x = 16; x < 320; x += 80) { rect(g, x, 26, 4, 34, '#5a4028'); rect(g, x - 10, 24, 24, 3, '#6e5034'); }
    for (let y = 29; y < 60; y++) px(g, 200 + ((y * 7) % 3), y, P.sand); });
  const props = { lamp: strip(8, 12, g => { line(g, 4, 0, 4, 3, P.plankD); fillPoly(g, [[1, 4], [7, 4], [6, 10], [2, 10]], P.goldD || '#a8801e'); rect(g, 3, 5, 2, 4, P.lamp); px(g, 3, 5, P.lampL); rect(g, 2, 10, 4, 1, P.plankD); }) };
  return { name: 'THE BURIED CITY', pal: P, top, fill, wall, ledge, trim, sky, far, mid, props };
}

// ============================== THE PYRAMIDS: black and gold ==============================
const SP = { face: '#4a4038', faceL: '#5e5246', faceD: '#3a322c', edgeL: '#6e604e', edgeD: '#241e1a', mortar: '#1e1a18', gold: '#d8a838', goldL: '#f4d67a', goldD: '#8a6418',
  torch: '#ff9a3a', torchL: '#ffe08a', paint: '#b8463a', paintB: '#2e6aa0', plank: '#5a4834', plankL: '#7a6448', plankD: '#3a2e22', rope: '#a8906a', dust: '#8a7458' };
const KP = { face: '#24222a', faceL: '#34303a', faceD: '#1a181e', edgeL: '#4a4452', edgeD: '#101014', mortar: '#0c0c10', gold: '#e8c24a', goldL: '#fff0a0', goldD: '#9a7418',
  torch: '#fff4d0', torchL: '#ffffff', paint: '#e8c24a', paintB: '#e8e0c8', plank: '#3a3440', plankL: '#524a58', plankD: '#1e1a22', rope: '#8a8070', dust: '#4a4452' };
export function bakePyramidSet(king = false) {
  const P = king ? KP : SP, seed = king ? 8300 : 8100;
  const fill = tiles(3, (g, v) => ashlar(g, R(seed + v), P, { bw: 16, bh: 8, off: 8, row0: v }));
  const top = tiles(3, (g, v) => { ashlar(g, R(seed + 5 + v), P, { bw: 16, bh: 8, off: 8, row0: v }); rect(g, 0, 0, 16, 1, P.edgeL); rect(g, 0, 1, 16, 1, P.gold); if (!king) speck(g, R(seed + 8 + v), 0, 2, 16, 2, [P.dust], 0.25); });
  const wall = tiles(3, (g, v) => { ashlar(g, R(seed + 10 + v), P, { bw: 16, bh: 8, off: 8, row0: v }); if (king && v === 1) { for (let y = 2; y < 16; y += 4) px(g, 7, y, P.goldD); } });
  /* TRIM: the hieroglyph band (a painted/gilded course: eyes, reeds, birds, sun-discs, in the pyramid's two colours) and the TORCH */
  const glyph = (g, x, y, k, c) => { if (k === 0) { ellipse(g, x + 3, y + 3, 3, 1.5, c); px(g, x + 3, y + 3, P.mortar); line(g, x + 2, y + 5, x + 1, y + 7, c); }          // an eye
    else if (k === 1) { line(g, x + 3, y, x + 3, y + 7, c); px(g, x + 2, y + 1, c); px(g, x + 4, y + 1, c); px(g, x + 2, y + 3, c); px(g, x + 4, y + 3, c); }             // a feather (maat)
    else if (k === 2) { circle(g, x + 3, y + 4, 2.2, c); rect(g, x, y + 7, 7, 1, c); }                                                                                 // a sun on the horizon
    else { ellipse(g, x + 2, y + 4, 2, 1.3, c); line(g, x + 3, y + 3, x + 4, y + 1, c); px(g, x + 5, y + 1, c); px(g, x + 6, y + 2, c); line(g, x + 2, y + 5, x + 2, y + 7, c); } };      // an ibis
  const trim = [strip(16, 16, g => { rect(g, 0, 0, 16, 16, P.face); rect(g, 0, 0, 16, 1, P.gold); rect(g, 0, 15, 16, 1, P.gold); glyph(g, 1, 4, 0, P.gold); glyph(g, 9, 4, king ? 2 : 1 + 2 * ((seed >> 1) & 1), king ? P.goldL : P.paint); }),
    strip(16, 16, g => { ashlar(g, R(seed + 30), P, { bw: 16, off: 8 }); rect(g, 6, 7, 4, 7, P.plankD); rect(g, 5, 6, 6, 2, P.goldD); ellipse(g, 8, 4, 2.5, 3.5, P.torch); rect(g, 7, 2, 2, 3, P.torchL);
      for (const [dx, dy] of [[-4, 2], [4, 2], [-5, -1], [5, -1]]) px(g, 8 + dx, 4 + dy, P.goldD); })];
  const ledge = ledgeOf(P, false);
  const sky = null;
  /* far: the painted gallery wall seen in the dark, a torch's reach lit (the rest near black), a procession of figures in the band */
  const far = strip(320, 120, g => { rect(g, 0, 0, 320, 120, king ? '#0e0c12' : '#16120f'); const band = y => { rect(g, 0, y, 320, 1, P.goldD); rect(g, 0, y + 18, 320, 1, P.goldD); };
    band(40); for (let x = 6; x < 320; x += 22) { const c = king ? '#3a3440' : '#4a3a2c'; rect(g, x + 2, 46, 5, 10, c); circle(g, x + 4, 44, 2, c); line(g, x + 7, 48, x + 11, 46, c); rect(g, x + 2, 56, 2, 2, c); rect(g, x + 5, 56, 2, 2, c); }
    for (let y = 70; y < 120; y += 8) for (let x = (y / 8 & 1) * 8; x < 320; x += 16) rect(g, x, y, 15, 7, king ? '#16141a' : '#201a16');
    if (king) for (let y = 0; y < 120; y++) { const x = 250 + (y >> 2); rect(g, x, y, 6, 1, y % 2 ? '#3a3830' : '#4a4638'); } });   // (king) a sunbeam's dust in the far dark
  const mid = strip(320, 60, g => { for (let x = 0; x < 320; x += 40) { rect(g, x + 4, 0, 10, 60, king ? '#1e1c22' : '#2a221c'); rect(g, x + 4, 0, 2, 60, king ? '#2e2a34' : '#3a3028'); rect(g, x + 2, 0, 14, 4, P.goldD); } });
  /* props.face: THE SEALED PYRAMID's outside, the steps in the storm (a 64x48 piece of the stepped face, sunlit ochre going into dust) */
  const face = strip(64, 48, g => { for (let s = 0; s < 6; s++) { const y = s * 8, x0 = s * 8; rect(g, x0, y, 64 - x0, 8, s % 2 ? '#c89a5c' : '#d4a868'); rect(g, x0, y, 64 - x0, 1, '#e8c488'); rect(g, x0, y + 7, 64 - x0, 1, '#9a7448'); rect(g, x0, y, 1, 8, '#8a6a86'); } speck(g, R(seed + 90), 0, 0, 64, 48, ['#e8d0a0'], 0.05); });
  return { name: king ? "THE KING'S PYRAMID" : 'THE SEALED PYRAMID', pal: P, top, fill, wall, ledge, trim, sky, far, mid, props: { face } };
}
export const SETS = { welltown: bakeWellTownSet, redgorge: bakeGorgeSet, glasssea: () => bakeGlassSet(false), glassnight: () => bakeGlassSet(true), suntemple: bakeTempleSet, buriedcity: bakeCitySet, sealedpyramid: () => bakePyramidSet(false), kingpyramid: () => bakePyramidSet(true) };
