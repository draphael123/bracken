// desert2.js — the desert arc's second art set (not wired in): the Sunken Caravan draft's landmarks, the storm, the worm's
// hollow, level 2's well and mud, the oasis a mirage shows, and the UI pieces. px.js primitives only (tools/desert-art2.mjs
// renders them in Node). Colours from DESERT (desert.js) so it all sits in one palette; the violet shade means shade everywhere.
//
//   bakeGreatRibcage()   224x128  THE GREAT RIBCAGE: a dead beast's ribs arching over the road, its spine across the top. Drawn
//                        BEHIND the tiles: its outer ribs stand where the draft puts NET rungs, its spine where the ONEWAY row is
//   bakeCaravanserai()   112x160  THE SINKING CARAVANSERAI's face, over its SOLID blocks: coursed sandstone, the door arch, slit
//                        windows, a broken parapet, a dune drifted up its windward side
//   bakeArchPillar()     16x64    the sandstone pillar drawn behind the dune sea's lintel (two of them)
//   bakeWinch()          24x24    the camp's awning winch: a drum, a crank, the rope; bakeCanopy() 32x14 a tileable length of the great awning
//   bakeDustSheets()     { near, far } 160x90 each, tileable both ways: the sandstorm's blowing dust, two speeds
//   bakeHollow()         320x140  THE WORM'S HOLLOW behind the arena: sand walls, wreck silhouettes half out of them, the bore
//   bakeWell()           32x34    a well with its windlass and bucket (level 2's water); bakeMudWall() [3] 16x16 mud-brick tiles
//   bakeOasis()          56x34    palms over a pool: a real oasis, and what a mirage shows (the shimmer is done at runtime)
//   bakeUI()             { sun: [4 sunstroke stages 12x12], meter: 44x7 frame, skin: [4 waterskin states 12x12], node: 24x24 map node }
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, mulberry, shade as tint } from '../px.js';
import { OUT } from '../art.js';
import { DESERT as D } from './desert.js';

const BONE = { b: '#ece2c8', m: '#cfc3a4', d: '#a8997a', s: '#7e7058' };
const STONE = { l: '#e8c8a0', b: '#d4a87e', m: '#bc8e66', d: '#9a7050', s: '#6e4e38', mortar: '#8a6448' };
const thick = (g, x0, y0, x1, y1, col, w) => { for (let k = 0; k < w; k++) line(g, x0 + k, y0, x1 + k, y1, col); };

// ---------------- THE GREAT RIBCAGE ----------------
export function bakeGreatRibcage() {
  const W = 224, H = 128, [c, g] = canvas(W, H), rnd = mulberry(8101);
  const spineY = 8;
  /* THE RIBS BOW AND TAPER: each leaves the spine thick, bellies out toward the head (right) and thins to a point in the sand.
     (The first bake drew straight bars and read as a fence; the skull at the front is what says BEAST at a glance.) */
  for (let i = 0; i < 8; i++) { const x = 10 + i * 24, belly = 8 + Math.sin(i / 7 * Math.PI) * 10, len = H - spineY - 16 - Math.abs(i - 3.5) * 3;
    for (let t = 0; t <= 1.001; t += 0.015) { const y = spineY + 6 + t * len, xx = x + Math.sin(t * Math.PI * 0.9) * belly, w = Math.max(1, Math.round(5 * (1 - t * 0.8)));
      rect(g, xx - w / 2, y, w, 2, t < 0.35 ? BONE.b : t < 0.75 ? BONE.m : BONE.d); px(g, xx + w / 2, y, BONE.s); } }
  // the spine: vertebrae across the top, each a knuckle with a spur
  for (let x = 2; x < W - 2; x += 8) { ellipse(g, x + 4, spineY + 3, 4.5, 3.5, BONE.b); rect(g, x + 3, spineY - 3, 2, 4, BONE.m); px(g, x + 4, spineY + 5, BONE.d); px(g, x + 1, spineY + 3, BONE.s); }
  // the skull, lying at the front end, jaw in the sand, horn up: THE BEAST
  { const sx = W - 30, sy = H - 34; ellipse(g, sx, sy, 22, 14, BONE.b); ellipse(g, sx - 4, sy - 4, 16, 8, '#f6eedb'); fillPoly(g, [[sx + 8, sy + 2], [sx + 30, sy + 8], [sx + 28, sy + 16], [sx + 4, sy + 14]], BONE.m);   // cranium, the long snout
    ellipse(g, sx + 2, sy - 1, 5, 4, BONE.s); ellipse(g, sx + 2, sy - 1, 3, 2.5, '#2a2230');                                            // the eye socket
    for (let k = 0; k < 14; k++) { const a = -0.3 - k * 0.1; rect(g, sx - 10 + Math.cos(a) * k * 2.2, sy - 10 - k * 2 + k * k * 0.07, 3, 3, k < 8 ? BONE.m : BONE.d); }   // the horn, sweeping back
    for (let t = 0; t < 5; t++) rect(g, sx + 12 + t * 3, sy + 12, 2, 3, '#f6eedb'); }                                                   // teeth
  // cracks, a hole, the sand drifted into its foot
  for (let i = 0; i < 12; i++) { const x = 10 + ((rnd() * (W - 20)) | 0), y = spineY + 12 + ((rnd() * 80) | 0); px(g, x, y, BONE.s); }
  for (let x = 0; x < W; x++) { const h = 6 + Math.round(4 * Math.sin(x * 0.05) + 3 * Math.sin(x * 0.13)); for (let y = H - h; y < H; y++) px(g, x, y, y === H - h ? D.duneL : D.dune); }
  return outline(c, OUT);
}
// ---------------- THE SINKING CARAVANSERAI ----------------
export function bakeCaravanserai() {
  const W = 112, H = 160, [c, g] = canvas(W, H), rnd = mulberry(8201);
  // coursed sandstone, each block its own tone, mortar lines between
  for (let y = 8; y < H; y += 8) { const off = ((y / 8) & 1) * 8; for (let x = -off; x < W; x += 16) { const t = rnd(); rect(g, x, y, 15, 7, t < 0.3 ? STONE.m : t < 0.8 ? STONE.b : STONE.l); rect(g, x, y, 15, 1, STONE.l); rect(g, x + 15, y, 1, 8, STONE.mortar); } rect(g, 0, y + 7, W, 1, STONE.mortar); }
  // the broken parapet: merlons along the top, two gone
  for (let x = 0; x < W; x += 16) if (x !== 48 && x !== 80) { rect(g, x, 0, 10, 9, STONE.b); rect(g, x, 0, 10, 1, STONE.l); }
  // slit windows, dark, with a lit sill
  for (const [x, y] of [[26, 30], [70, 30], [48, 70], [26, 100]]) { rect(g, x, y, 5, 14, STONE.s); rect(g, x - 1, y + 14, 7, 2, STONE.l); }
  // the door arch at the foot (column 0 in the draft: the left wall's bottom three tiles)
  fillPoly(g, [[0, H], [0, H - 40], [4, H - 46], [12, H - 48], [16, H - 46], [16, H]], STONE.s); rect(g, 0, H - 48, 18, 2, STONE.l);
  // a lean: a crack from the parapet down, and the dune up the windward (left) side
  let x = 60; for (let y = 10; y < 90; y += 2) { px(g, x, y, STONE.s); px(g, x, y + 1, STONE.s); if (rnd() < 0.4) x += rnd() < 0.5 ? -1 : 1; }
  for (let xx = 0; xx < W; xx++) { const h = Math.max(0, Math.round(34 - xx * 0.5 + 3 * Math.sin(xx * 0.2))); for (let y = H - h; y < H; y++) if (!(xx < 16 && y > H - 46)) px(g, xx, y, y === H - h ? D.duneL : D.dune); }
  return outline(c, OUT);
}
export function bakeArchPillar() {
  const [c, g] = canvas(16, 64);
  for (let y = 0; y < 64; y += 8) { rect(g, 1, y, 14, 7, (y / 8) & 1 ? STONE.b : STONE.m); rect(g, 1, y, 14, 1, STONE.l); rect(g, 1, y + 7, 14, 1, STONE.mortar); }
  rect(g, 0, 0, 16, 5, STONE.l); rect(g, 0, 4, 16, 1, STONE.d); rect(g, 12, 6, 3, 58, STONE.d);   // capital, and the shaded side
  for (let y = 50; y < 64; y++) rect(g, 0, y, Math.round((y - 50) * 0.6), 1, D.dune);             // sand drifted against its foot
  return outline(c, OUT);
}
// ---------------- THE CAMP'S WINCH AND ITS GREAT AWNING ----------------
export function bakeWinch() {
  const [c, g] = canvas(24, 24);
  rect(g, 2, 8, 3, 16, D.woodD); rect(g, 19, 8, 3, 16, D.woodD); rect(g, 0, 22, 24, 2, D.woodD);     // the frame
  ellipse(g, 12, 12, 8, 5, D.wood); for (let k = 0; k < 4; k++) rect(g, 5, 9 + k * 2, 14, 1, k & 1 ? D.cloth : D.clothD);   // the drum, wound with awning
  line(g, 20, 12, 23, 6, D.iron); rect(g, 22, 4, 2, 3, D.ironL);                                    // the crank
  line(g, 12, 7, 12, 0, D.clothD);                                                                  // the rope up to the awning
  return outline(c, OUT);
}
export function bakeCanopy() { const [c, g] = canvas(32, 14); for (let x = 0; x < 32; x++) { const sag = Math.round(2 * Math.sin(x / 32 * Math.PI)), col = (x >> 3) & 1 ? D.red : D.cloth;
  for (let y = sag; y < sag + 8; y++) px(g, x, y, y === sag ? tint(col, 0.2) : col); if (x % 8 < 5) px(g, x, sag + 8, col); px(g, x, sag + 7, tint(col, -0.25)); }
  return c; }   // tileable: no outline, drawn in a run
// ---------------- THE SANDSTORM'S DUST ----------------
export function bakeDustSheets() {
  const make = (seed, n, cols, len) => { const [c, g] = canvas(160, 90), rnd = mulberry(seed);
    for (let i = 0; i < n; i++) { const x = (rnd() * 160) | 0, y = (rnd() * 90) | 0, l = len + ((rnd() * len) | 0), col = cols[(rnd() * cols.length) | 0];
      for (let k = 0; k < l; k++) px(g, (x + k) % 160, (y + ((k / 6) | 0)) % 90, col); }   // streaks leaning with the wind, wrapped so the sheet tiles
    for (let i = 0; i < n / 3; i++) { const x = (rnd() * 160) | 0, y = (rnd() * 90) | 0; for (let k = 0; k < 9; k++) px(g, (x + (k % 3)) % 160, (y + ((k / 3) | 0)) % 90, cols[0]); }   // clots of blown sand
    return c; };
  return { far: make(8301, 70, ['rgba(214,176,120,0.35)', 'rgba(190,150,100,0.3)'], 6), near: make(8302, 45, ['rgba(226,187,122,0.6)', 'rgba(242,215,156,0.5)', 'rgba(191,143,99,0.55)'], 12) };
}
// ---------------- THE WORM'S HOLLOW ----------------
export function bakeHollow() {
  const W = 320, H = 140, [c, g] = canvas(W, H), rnd = mulberry(8401);
  // the bore: a darker throat in the back wall where it comes and goes
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const wall = 30 + 14 * Math.sin(x * 0.02 + 1) + 8 * Math.sin(x * 0.05);   // the rim line
    if (y < wall) continue; const dx = (x - 200) / 46, dy = (y - 92) / 34, bore = dx * dx + dy * dy < 1;
    const r2 = dx * dx + dy * dy, deep = y > 96 ? Math.min(1, (y - 96) / 40) : 0, bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5][(y & 3) * 4 + (x & 3)] / 16;   /* the walls darken toward the floor, dithered, never banded */
    px(g, x, y, r2 < 0.5 ? '#3e2c22' : r2 < 0.75 ? '#5a4030' : r2 < 1 ? ((Math.atan2(dy, dx) * 8 | 0) & 1 ? '#8a6a4a' : '#7a5a40') : r2 < 1.12 ? D.duneD
      : (y - wall < 2 ? D.duneL : ((x * 7 + y * 3) % 11 === 0 ? D.duneD : deep > bayer ? D.duneS : D.dune))); }   /* the bore: a dark throat, its rim ribbed where it turned */
  for (let i = 0; i < 40; i++) { const t = i / 40; px(g, 200 - 40 + Math.round(t * 30), 60 + Math.round(t * t * 30), D.duneL); px(g, 236 + Math.round(t * 6), 64 + Math.round(t * 24), D.dune); }   // sand trickling in over its lip
  // the caravan in the walls: a wheel, a wagon bed, a rib of canopy, a crate, all half out of the sand
  const wheel = (x, y, r) => { for (let a = 0; a < Math.PI * 2; a += 0.05) { px(g, x + Math.cos(a) * r, y + Math.sin(a) * r, D.woodD); px(g, x + Math.cos(a) * (r - 1), y + Math.sin(a) * (r - 1), D.wood); } for (let s = 0; s < 6; s++) line(g, x, y, x + Math.cos(s + 0.3) * r, y + Math.sin(s + 0.3) * r, D.woodD); };
  wheel(46, 78, 12); wheel(282, 70, 10);
  for (let x = 90; x < 138; x++) { const y = 66 + ((x - 90) * 0.3) | 0; rect(g, x, y, 1, 6, x % 7 ? D.wood : D.woodD); } for (const hx of [100, 120]) for (let a = Math.PI; a < Math.PI * 2; a += 0.04) px(g, hx + Math.cos(a) * 12, 66 + Math.sin(a) * 12, D.woodD);
  rect(g, 250, 104, 14, 12, D.wood); rect(g, 250, 104, 14, 2, D.woodL); line(g, 250, 104, 264, 116, D.woodD);
  for (let i = 0; i < 20; i++) px(g, (rnd() * W) | 0, 40 + ((rnd() * 90) | 0), BONE.m);   // bones in the sand
  return c;   // a backdrop: no outline
}
// ---------------- LEVEL 2: THE WELL, THE MUD ----------------
export function bakeWell() {
  const [c, g] = canvas(32, 34);
  for (let y = 20; y < 34; y += 5) for (let x = 2; x < 30; x += 7) { rect(g, x + ((y / 5) & 1) * 3, y, 6, 4, STONE.b); rect(g, x + ((y / 5) & 1) * 3, y, 6, 1, STONE.l); }   // the stone ring
  rect(g, 2, 18, 28, 3, STONE.m); rect(g, 2, 18, 28, 1, STONE.l); rect(g, 6, 19, 20, 2, '#3a5a78');   // the rim, and the water's dark glint
  rect(g, 4, 2, 2, 17, D.woodD); rect(g, 26, 2, 2, 17, D.woodD); rect(g, 3, 2, 26, 2, D.wood);          // the frame
  ellipse(g, 16, 6, 6, 2.5, D.wood); line(g, 16, 8, 16, 13, D.clothD); rect(g, 13, 13, 6, 5, D.woodD); rect(g, 14, 13, 4, 1, '#6aa0c8');   // the windlass, the rope, the bucket
  line(g, 22, 6, 27, 3, D.iron);
  return outline(c, OUT);
}
export function bakeMudWall() { return [0, 1, 2].map(v => { const [c, g] = canvas(16, 16), rnd = mulberry(8501 + v);
  rect(g, 0, 0, 16, 16, '#8a6a4a'); for (let y = 0; y < 16; y += 4) { const off = ((y / 4) & 1) * 4; for (let x = -off; x < 16; x += 8) { rect(g, x, y, 7, 3, rnd() < 0.5 ? '#9a7a56' : '#8e6e4c'); rect(g, x, y, 7, 1, '#aa8a64'); } }
  for (let i = 0; i < 6; i++) px(g, (rnd() * 16) | 0, (rnd() * 16) | 0, '#c8b070');   // straw in the brick
  line(g, 3 + v * 3, 0, 5 + v * 3, 9, '#5e4630');                                      // a crack: it will give to water
  return c; }); }
// ---------------- THE OASIS ----------------
export function bakeOasis() {
  const [c, g] = canvas(56, 34), rnd = mulberry(8601);
  ellipse(g, 28, 29, 24, 4, '#3a7a9a'); ellipse(g, 26, 28, 16, 2, '#6ab0d0'); ellipse(g, 28, 32, 26, 2.5, D.duneD);   // the pool, a glint, its bank
  const palm = (x, lean) => { for (let y = 0; y < 22; y++) { const xx = x + Math.round(lean * y / 22 * 4); rect(g, xx, 26 - y, 2, 1, y % 3 ? '#8a6a44' : '#6e5234'); }
    const tx = x + lean * 4, ty = 4; for (let k = 0; k < 6; k++) { const a = -Math.PI + k * Math.PI / 5; for (let t = 0; t < 9; t++) px(g, tx + Math.cos(a) * t, ty + Math.sin(a) * t * 0.6 + t * t * 0.06, t < 6 ? '#4a8a3a' : '#6aaa4a'); } };
  palm(14, -1); palm(38, 1); palm(27, 0.3);
  for (let i = 0; i < 8; i++) px(g, 6 + ((rnd() * 44) | 0), 30, '#5a9a4a');
  return outline(c, OUT);
}
// ---------------- UI ----------------
export function bakeUI() {
  const sun = [0, 1, 2, 3].map(k => { const [c, g] = canvas(12, 12), col = ['#ffe8a0', '#ffd36b', '#ff9a4c', '#ff5a3c'][k];
    circle(g, 6, 6, 3.2, col); for (let a = 0; a < 8; a++) { const r = 4.6 + (k >= 2 && a % 2 ? 0.8 : 0); px(g, 6 + Math.cos(a * Math.PI / 4) * r, 6 + Math.sin(a * Math.PI / 4) * r, col); }
    if (k === 3) { px(g, 5, 5, '#7a1a10'); px(g, 7, 5, '#7a1a10'); rect(g, 5, 8, 3, 1, '#7a1a10'); }   // at the top it scowls: it is hurting you now
    return outline(c, OUT); });
  const [m, mg] = canvas(44, 7); rect(mg, 0, 0, 44, 7, '#2a2230'); rect(mg, 1, 1, 42, 5, '#4a4050'); for (let x = 1; x < 43; x++) px(mg, x, 1, '#5a5060');
  px(mg, Math.round(1 + 42 * 0.55), 1, '#ffd36b'); px(mg, Math.round(1 + 42 * 0.55), 5, '#ffd36b');   // the tick where the view starts to swim
  const skin = [0, 1, 2, 3].map(sips => { const [c, g] = canvas(12, 12); ellipse(g, 6, 7, 4.5, 4, '#8a5a32'); rect(g, 5, 1, 3, 3, '#6e4424'); rect(g, 4, 1, 5, 1, '#a0703e');
    if (sips) ellipse(g, 6, 8 + (3 - sips), 3.2, Math.max(0.8, sips * 0.9), '#6ab0d0'); return outline(c, OUT); });
  const [n, ng] = canvas(24, 24); circle(ng, 12, 12, 11, '#2a2230'); circle(ng, 12, 12, 10, '#6fa3cf');
  for (let x = 2; x < 22; x++) { const h = 13 + Math.round(3 * Math.sin(x * 0.4)); for (let y = h; y < 22; y++) if ((x - 12) ** 2 + (y - 12) ** 2 < 100) px(ng, x, y, y === h ? D.duneL : D.dune); }
  circle(ng, 16, 7, 3, '#ffd36b'); rect(ng, 6, 9, 5, 5, '#c69a86'); rect(ng, 7, 7, 3, 2, '#c69a86');   // the sun, and a pyramid on the horizon: where the arc is going
  return { sun, meter: m, skin, node: n };
}
