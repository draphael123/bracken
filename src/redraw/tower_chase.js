// src/redraw/tower_chase.js - FALLING TOWER 3 ART (claude/fallingtower3art): everything the greybox (claude/fallingtower3) left as placeholder.
//   THE CHASE ROOMS   paintChaseRoom()  the four rooms under the Archmage's stair and the core under them, each its OWN room (not the level's
//                     holed-through-to-the-night back wall: these are inside the tower and deep in it): THE SCRIPTORIUM (moonlit lancets, scroll
//                     racks, lecterns, a scribe who never left his desk), THE RELIQUARY (candlelit alcoves, relics in glass), THE CELLAR (a barrel
//                     vault, jars of specimens, stacked lids, a seep), THE FOUNDATION (cyclopean blocks, rune seams that pulse, half-buried cogs),
//                     THE CORE (the shaft up the tower's heart: rune rings, chains, his door's light a long way up).
//   THE PILLARS       paintPillar() / paintStump() / paintFall() / paintResting()  the cracked support pillars: whole, told (the crack running red),
//                     and down - and what each one drops: the library's bookcase (a stair of shelves), the lab's column across the poison, the
//                     crown's masonry, the stairwell's rubble plug, the chase's floor in chunks.
//   FLOOR FX          paintFloorCrack() the crack he runs wall to wall, paintSink() the wisp he sinks through the floor in, paintLanding().
//   THE LADDER        paintLadder()  the library's rolling ladder on its rail.
// Everything is fillRect and px.js (no paths, no rotation) so tools/ft3art-shots.mjs renders it in Node. The rooms bake ONCE (cache) and move live (flames,
// smoke, drips, cogs, pulses). Nothing here touches a tile, a box or a number: it is the painting of what src/archmage-chase.js and src/tower-supports.js
// already do. Theme: an undead mage's tower - stone, bone, iron, brass, parchment, candle wax; no logs, no timber frames (shelves and lecterns are the library's).
import { canvas, rect, fillPoly, line, mulberry } from '../px.js';

/* ---- little helpers ---- */
const A = (g, a, fn) => { g.globalAlpha = a; fn(); g.globalAlpha = 1; };
const hsh = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
/* ashlar: courses of bh, blocks of bwMin..bwMax, each block one of three shades, a light top edge and a dark joint (the wall is two steps darker than the footing) */
function ashlar(g, w, h, P, r, bh = 10, bwMin = 22, bwMax = 40) {
  rect(g, 0, 0, w, h, P.m);
  for (let y = 0, row = 0; y < h; y += bh, row++) { let x = -((row * 13) % bwMax);
    while (x < w) { const bw = bwMin + Math.floor(r() * (bwMax - bwMin)), s = r();
      rect(g, x + 1, y + 1, bw - 1, bh - 1, s < 0.3 ? P.c : s < 0.78 ? P.a : P.b); rect(g, x + 1, y + 1, bw - 1, 1, P.hi);
      if (r() < 0.14) rect(g, x + 3 + Math.floor(r() * 6), y + 3, 3, 2, P.c); x += bw; } }
}
const arch = (g, cx, y0, y1, hw, col, grad = null) => { for (let y = y0; y < y1; y++) { const up = y0 + hw - y, half = up > 0 ? Math.round(Math.sqrt(Math.max(0, hw * hw - up * up))) : hw; if (half > 0) rect(g, cx - half, y, half * 2, 1, grad ? grad(y) : col); } };
const flame = (g, x, y, h, time, ph, cols) => { const f = Math.sin(time * 14 + ph) * 0.5 + 0.5, hh = Math.round(h * (0.75 + 0.25 * f)); rect(g, x - 1, y - hh, 3, hh, cols[0]); rect(g, x, y - hh + 1, 1, Math.max(1, hh - 1), cols[1]); if (hh > 3) rect(g, x, y - hh - 1, 1, 1, cols[2]); };
/* a soft light: four stacked ellipses (rx, ry px), each a quarter of a, in steps of two rows - cheap, and round where a box was square */
const glow = (g, x, y, rx, ry, col, a) => { g.fillStyle = col; for (let i = 0; i < 4; i++) { g.globalAlpha = a / 4; const q = 1 - i * 0.22, ax = rx * q, ay = ry * q; for (let dy = -ay; dy < ay; dy += 2) { const half = Math.round(ax * Math.sqrt(1 - (dy / ay) * (dy / ay))); if (half > 0) g.fillRect(x - half, Math.round(y + dy), half * 2, 2); } } g.globalAlpha = 1; };
const GREEN = ['#1f6a3a', '#3fe08a', '#d8ffe4'], CANDLE = ['#c9463d', '#ff9b49', '#ffe9b0'], BONE = ['#6e6a58', '#a8a48c', '#d9d6c0', '#f0eedc'];

/* ---- the palettes: each room a shade of the tower's slate, never lighter than the footing (#46506a) ---- */
const PAL = {
  library: { a: '#2a3046', b: '#323a54', c: '#242a3e', m: '#171b29', hi: '#3c4662' },
  reading: { a: '#2b2539', b: '#342c46', c: '#231e31', m: '#15111f', hi: '#443a5c' },
  lab: { a: '#232d2f', b: '#2b3739', c: '#1c2527', m: '#10171a', hi: '#384648' },
  orrery: { a: '#272733', b: '#2f2f3d', c: '#1f1f29', m: '#111118', hi: '#3c3c4e' },
  dome: { a: '#222838', b: '#2a3144', c: '#1c2130', m: '#0f121c', hi: '#363e56' },
};
const WOOD = ['#241a16', '#38281f', '#4c382a'], SPINE = ['#7a2a2a', '#2a5a7a', '#6a5a2a', '#3a6a3a', '#5a3a6a', '#8a6a3a'], PAPER = '#cfc29a', BRASS = ['#5a4220', '#8a6a2e', '#c09a48', '#f0d078'], IRON = '#3a3e4c';

/* ---------------------------------------------------------------------------------------------------- THE ROOMS ---- */
function ceilingVault(g, w, P, r, ribs) {   /* the stone ceiling: a dark band, ribs coming down as corbels */
  rect(g, 0, 0, w, 14, P.m); rect(g, 0, 14, w, 2, P.c); rect(g, 0, 16, w, 1, P.hi);
  for (const x of ribs) { fillPoly(g, [[x - 14, 17], [x + 14, 17], [x + 5, 34], [x - 5, 34]], P.c); fillPoly(g, [[x - 11, 17], [x + 3, 17], [x + 1, 30], [x - 4, 30]], P.b); rect(g, x - 6, 34, 12, 3, P.hi); rect(g, x - 6, 37, 12, 1, P.m); }
}
function scroll(g, x, y, c) { rect(g, x, y, 5, 5, PAPER); rect(g, x + 1, y + 1, 3, 3, '#a89a74'); rect(g, x + 2, y + 2, 1, 1, c || '#6a2a2a'); rect(g, x, y, 5, 1, '#ece0b8'); }
function rack(g, x, y, cols, rows, r) {   /* a pigeonhole rack of scrolls: dark wood, brass nails, a scroll in most holes */
  const cw = 11, ch = 11, w = cols * cw + 4, h = rows * ch + 4; rect(g, x, y, w, h, WOOD[0]); rect(g, x, y, w, 1, WOOD[2]);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const hx = x + 2 + i * cw, hy = y + 2 + j * ch; rect(g, hx, hy, cw - 1, ch - 1, '#120d0b'); rect(g, hx, hy + ch - 2, cw - 1, 1, WOOD[1]);
    if (r() < 0.78) scroll(g, hx + 3, hy + 3, r() < 0.3 ? '#2a5a7a' : '#6a2a2a'); }
  for (let j = 0; j <= rows; j++) rect(g, x + 1, y + 1 + j * ch, w - 2, 1, WOOD[2]);
  for (const [nx, ny] of [[x + 1, y + 1], [x + w - 2, y + 1], [x + 1, y + h - 2], [x + w - 2, y + h - 2]]) rect(g, nx, ny, 1, 1, BRASS[2]);
}
function lectern(g, x, y, r) {   /* y = the floor: a slanted desk on a turned stem and a splayed foot, an open book, an inkwell and a quill */
  rect(g, x - 1, y - 20, 3, 18, WOOD[0]); rect(g, x, y - 20, 1, 18, WOOD[1]); fillPoly(g, [[x - 9, y], [x + 9, y], [x + 4, y - 4], [x - 4, y - 4]], WOOD[1]); rect(g, x - 9, y - 1, 18, 1, WOOD[0]);
  fillPoly(g, [[x - 11, y - 20], [x + 11, y - 24], [x + 11, y - 22], [x - 11, y - 18]], WOOD[2]);   /* the slope */
  fillPoly(g, [[x - 9, y - 21], [x - 1, y - 23], [x - 1, y - 21], [x - 9, y - 19]], PAPER); fillPoly(g, [[x + 1, y - 23], [x + 9, y - 25], [x + 9, y - 23], [x + 1, y - 21]], '#e2d6ae');   /* the open book: two pages */
  for (let i = 0; i < 3; i++) { rect(g, x - 8 + i * 0, y - 21 + i * 0, 0, 0, PAPER); line(g, x - 8, y - 20 + 0, x - 2, y - 22, '#8a7a56'); }
  rect(g, x + 7, y - 27, 2, 3, '#10101a'); rect(g, x + 7, y - 28, 1, 1, '#2a2a3a');   /* the inkwell */
  line(g, x + 8, y - 28, x + 12, y - 36, '#cfc29a');   /* and its quill */ rect(g, x + 12, y - 37, 2, 2, '#e8e0c8');
}
function scribe(g, x, y) {   /* the scribe at the last desk: a skeleton in a rotted habit on a stool, a pen still in the hand */
  rect(g, x - 10, y - 12, 2, 12, WOOD[0]); rect(g, x + 8, y - 12, 2, 12, WOOD[0]); rect(g, x - 12, y - 14, 24, 3, WOOD[1]); rect(g, x - 12, y - 14, 24, 1, WOOD[2]);   /* the stool */
  fillPoly(g, [[x - 8, y - 14], [x + 6, y - 14], [x + 9, y - 36], [x - 4, y - 38]], '#2c2640'); fillPoly(g, [[x - 6, y - 14], [x - 1, y - 14], [x - 1, y - 34], [x - 4, y - 36]], '#3a3350');   /* the habit */
  rect(g, x - 5, y - 28, 7, 2, '#17141f'); for (let i = 0; i < 3; i++) rect(g, x - 4, y - 28 + i * 0, 0, 0, BONE[1]);
  rect(g, x - 3, y - 47, 8, 8, BONE[2]); rect(g, x - 3, y - 47, 2, 8, BONE[1]); rect(g, x - 2, y - 45, 2, 2, '#0a100c'); rect(g, x + 2, y - 45, 2, 2, '#0a100c'); rect(g, x - 1, y - 45, 1, 1, GREEN[1]); rect(g, x + 3, y - 45, 1, 1, GREEN[1]); rect(g, x - 1, y - 40, 5, 1, BONE[0]);   /* the skull, bowed over the page */
  line(g, x + 5, y - 30, x + 14, y - 24, BONE[1], 2); rect(g, x + 14, y - 25, 3, 2, BONE[2]);   /* the arm, to the desk */
}
function bakeScriptorium(g, w, h, r) {
  const P = PAL.library; ashlar(g, w, h, P, r); ceilingVault(g, w, P, r, [70, 208, 346]);
  for (const cx of [70, 208, 346]) {   /* THE LANCETS: stone surround, leaded glass, a thin moon down the middle, the light on the floor under each */
    arch(g, cx, 46, 150, 24, P.hi); arch(g, cx, 49, 150, 21, '#0c1018'); arch(g, cx, 50, 150, 19, null, y => y < 90 ? '#1a2a52' : y < 120 ? '#14203e' : '#0e1830');
    for (let y = 50; y < 150; y += 10) rect(g, cx - 19, y, 38, 1, '#0a0e18'); rect(g, cx - 1, 50, 2, 100, '#0a0e18'); rect(g, cx - 20, 150, 40, 3, P.hi); rect(g, cx - 20, 153, 40, 1, P.m);
    for (let i = 0; i < 6; i++) rect(g, cx - 16 + ((i * 11 + cx) % 30), 56 + ((i * 17) % 80), 1, 1, '#c8d4f0');   /* a star in the glass */
    A(g, 0.07, () => fillPoly(g, [[cx - 19, 152], [cx + 19, 152], [cx + 62, h], [cx - 8, h]], '#b8c8f0')); A(g, 0.05, () => fillPoly(g, [[cx - 10, 152], [cx + 10, 152], [cx + 36, h], [cx + 4, h]], '#e8f0ff')); }
  for (const x of [8, 140, 266, 392]) { const c = x === 8 || x === 392 ? 3 : 4; rack(g, x === 392 ? w - 3 - c * 11 - 4 : x, 76, c, 7, r); }
  for (const x of [100, 238, 372]) lectern(g, x, h, r);   /* (the rooms' floor is the tiles under y = h) */
  scribe(g, 296, h);
  for (const [x, y] of [[40, h - 3], [160, h - 4], [330, h - 3]]) { rect(g, x, y, 9, 3, '#0e0c18'); rect(g, x + 2, y - 1, 5, 1, '#1a1830'); }   /* spilt ink */
  for (let i = 0; i < 14; i++) { const x = 6 + Math.floor(r() * (w - 20)), y = h - 2 - Math.floor(r() * 2); rect(g, x, y, 4, 2, PAPER); rect(g, x, y, 4, 1, '#ece0b8'); }   /* pages on the floor */
  for (const x of [139, 277]) { rect(g, x, 37, 1, 36, '#4a4e5e'); for (let k = 0; k < 18; k += 2) rect(g, x, 37 + k * 2, 1, 1, '#2a2e3c'); rect(g, x - 5, 73, 11, 3, BRASS[1]); rect(g, x - 4, 76, 9, 5, '#1a1c28'); rect(g, x - 4, 76, 9, 1, BRASS[2]); }   /* the chain lamps (flame live) */
}
function relic(g, k, x, y) {   /* what sits in an alcove, on a cushion: a skull, a hand, a crown, a chalice, a reliquary casket */
  rect(g, x - 7, y - 3, 14, 4, '#5a1a2a'); rect(g, x - 7, y - 3, 14, 1, '#9a2a3a'); rect(g, x - 5, y + 1, 10, 1, BRASS[1]);
  if (k === 0) { rect(g, x - 4, y - 12, 8, 9, BONE[2]); rect(g, x - 4, y - 12, 2, 9, BONE[1]); rect(g, x - 3, y - 9, 2, 2, '#0a100c'); rect(g, x + 1, y - 9, 2, 2, '#0a100c'); rect(g, x - 2, y - 4, 4, 1, BONE[0]); }
  else if (k === 1) { rect(g, x - 1, y - 14, 2, 11, BONE[2]); for (let i = -3; i <= 2; i += 2) rect(g, x + i, y - 16 + Math.abs(i) / 2, 1, 7, BONE[1]); rect(g, x - 3, y - 6, 7, 3, BONE[1]); }
  else if (k === 2) { rect(g, x - 6, y - 7, 12, 4, BRASS[2]); for (let i = -5; i <= 4; i += 3) rect(g, x + i, y - 11, 2, 5, BRASS[3]); rect(g, x - 6, y - 4, 12, 1, BRASS[1]); rect(g, x - 1, y - 6, 2, 2, '#c9463d'); }
  else if (k === 3) { rect(g, x - 3, y - 14, 7, 5, BRASS[2]); rect(g, x - 2, y - 9, 5, 2, BRASS[1]); rect(g, x - 1, y - 7, 3, 4, BRASS[1]); rect(g, x - 4, y - 4, 9, 1, BRASS[2]); rect(g, x - 2, y - 13, 5, 1, '#3a1a4a'); }
  else { rect(g, x - 7, y - 12, 14, 9, BRASS[1]); rect(g, x - 7, y - 12, 14, 2, BRASS[3]); fillPoly(g, [[x - 7, y - 12], [x, y - 18], [x + 7, y - 12]], BRASS[2]); rect(g, x - 2, y - 9, 4, 5, '#2a1a3a'); rect(g, x - 1, y - 8, 2, 2, GREEN[1]); }
}
function bakeReliquary(g, w, h, r) {
  const P = PAL.reading; ashlar(g, w, h, P, r, 10, 18, 32); ceilingVault(g, w, P, r, [52, 156, 260, 364]);
  const alc = [[52, 0], [156, 1], [260, 2], [364, 3]];   /* THE ALCOVES: a pointed niche each, dark, a relic on a red cushion, a gold rim */
  alc.forEach(([cx, k], i) => { arch(g, cx, 74, 156, 21, BRASS[1]); arch(g, cx, 76, 156, 19, '#0c0a12'); arch(g, cx, 78, 156, 17, null, y => y < 110 ? '#150f1e' : '#1c1428'); rect(g, cx - 21, 156, 42, 3, BRASS[1]); rect(g, cx - 21, 156, 42, 1, BRASS[2]); relic(g, k, cx, 154);
    glow(g, cx, 140, 22, 30, '#6a3a8a', 0.18); });
  for (const cx of [104, 208, 312]) { /* the pillars between: a fluted shaft up to the vault, a banner of tattered velvet */
    rect(g, cx - 5, 36, 10, h - 36, P.c); rect(g, cx - 5, 36, 3, h - 36, P.b); rect(g, cx + 3, 36, 2, h - 36, P.m); for (let y = 52; y < h; y += 14) rect(g, cx - 6, y, 12, 1, P.hi); rect(g, cx - 7, 36, 14, 3, P.hi); rect(g, cx - 7, h - 5, 14, 5, P.hi);
    if (cx !== 208) { rect(g, cx - 8, 46, 16, 52, '#4a1624'); rect(g, cx - 8, 46, 16, 3, BRASS[1]); for (let x = -8; x < 8; x += 4) fillPoly(g, [[cx + x, 98], [cx + x + 4, 98], [cx + x + 2, 104 + ((x + 8) % 3) * 2]], '#4a1624'); rect(g, cx - 1, 60, 2, 20, BRASS[1]); rect(g, cx - 4, 66, 8, 2, BRASS[1]); } }   /* (a cross-less gold glyph on the cloth: a closed eye) */
  for (const x of [30, 130, 234, 338]) { rect(g, x - 8, h - 6, 16, 6, '#26222c'); rect(g, x - 8, h - 6, 16, 1, '#3e3a48'); rect(g, x - 5, h - 20, 10, 14, '#1c1a24'); rect(g, x - 5, h - 20, 10, 1, '#3e3a48'); rect(g, x - 3, h - 18, 6, 10, '#0e1418'); rect(g, x - 1, h - 17, 2, 6, BONE[2]); rect(g, x - 3, h - 18, 1, 10, '#4a6a78'); }   /* the glass-fronted cases on their plinths (glow live) */
  for (const x of [20, 190, 286, 396]) { rect(g, x, h - 24, 2, 24, IRON); rect(g, x - 3, h - 26, 8, 3, BRASS[1]); rect(g, x - 1, h - 31, 4, 5, '#d8cfae'); rect(g, x - 1, h - 31, 4, 1, '#f0e8cc'); }   /* candle stands (flames live) */
  for (let x = 0; x < w; x += 2) { const on = (x / 38 | 0) % 2 === 0; if (on) rect(g, x, h - 3, 2, 3, '#4a1624'); }   /* the runner along the foot of the wall */
  rect(g, 0, h - 3, w, 1, '#8a6a2e'); A(g, 0.5, () => rect(g, 0, h - 3, w, 3, '#000000'));
  for (const x of [104, 312]) { rect(g, x, 37, 1, 18, '#4a4e5e'); rect(g, x - 5, 55, 11, 3, BRASS[1]); rect(g, x - 4, 58, 9, 7, '#241a10'); rect(g, x - 3, 59, 7, 1, BRASS[2]); for (let i = 0; i < 3; i++) rect(g, x - 3 + i * 3, 62, 1, 1, '#ff9b49'); }   /* censers (smoke live) */
}
function bakeCellar(g, w, h, r) {
  const P = PAL.lab; ashlar(g, w, h, P, r, 9, 14, 26);
  for (let x = 0; x < w; x += 104) { rect(g, x + 44, 0, 16, h, P.c); rect(g, x + 44, 0, 3, h, P.b); rect(g, x + 58, 0, 2, h, P.m); for (let y = 20; y < h; y += 16) rect(g, x + 43, y, 18, 1, P.hi);   /* the barrel vault: a pier and the rib springing from it... */
    fillPoly(g, [[x + 44, 40], [x + 60, 40], [x + 110, 6], [x + 94, 6]], P.c); fillPoly(g, [[x + 60, 40], [x + 44, 40], [x - 6, 6], [x + 10, 6]], P.c); }
  rect(g, 0, 0, w, 10, P.m); rect(g, 0, 10, w, 1, P.hi);
  for (const sx of [10, 160, 274]) { for (let j = 0; j < 3; j++) { const y = 76 + j * 34; rect(g, sx, y, 76, 3, '#2a2c2e'); rect(g, sx, y, 76, 1, '#4a4e50'); rect(g, sx + 2, y + 3, 2, 8, IRON); rect(g, sx + 72, y + 3, 2, 8, IRON);   /* three iron shelves of specimen jars */
      for (let i = 0; i < 5; i++) { const jx = sx + 5 + i * 14, c = (i + j * 2) % 3; rect(g, jx, y - 22, 11, 22, '#0e1618'); rect(g, jx + 1, y - 21, 9, 20, c === 0 ? '#16402a' : c === 1 ? '#2a3a22' : '#1a3a3a'); rect(g, jx + 1, y - 21, 2, 20, '#ffffff22'); rect(g, jx + 2, y - 24, 7, 3, BRASS[0]);
        if (c === 1) { rect(g, jx + 4, y - 14, 3, 3, BONE[2]); rect(g, jx + 4, y - 14, 1, 1, '#0a100c'); } else if (c === 0) { rect(g, jx + 3, y - 10, 5, 2, '#8fffb0'); rect(g, jx + 5, y - 16, 1, 6, '#8fffb0'); } else { rect(g, jx + 3, y - 12, 4, 4, BONE[1]); rect(g, jx + 7, y - 9, 2, 5, BONE[1]); } } } }
  for (let k = 0; k < 4; k++) { const x = 104 + (k % 2) * 3 - (k === 2 ? 2 : 0), y = h - 6 - k * 6; rect(g, x, y, 42, 6, '#363a40'); rect(g, x, y, 42, 1, '#5a5e64'); rect(g, x, y + 5, 42, 1, '#1c2022'); rect(g, x + 20, y + 2, 4, 2, '#4a4e54'); }   /* the stacked lids of the stone coffins, leant against the wall */
  fillPoly(g, [[392, h], [408, h], [408, 70], [398, 70]], '#363a40'); fillPoly(g, [[392, h], [398, h], [398, 70], [394, 74]], '#4a4e54'); rect(g, 400, 100, 6, 1, '#5a5e64'); rect(g, 402, 120, 4, 1, '#5a5e64');
  for (const x of [118, 236]) { rect(g, x, 12, 1, 20, '#4a4e5e'); for (let i = 0; i < 6; i++) rect(g, x - 1 + (i % 2) * 2, 32 + i * 3, 1, 2, '#6e7486'); rect(g, x - 2, 50, 5, 1, IRON); rect(g, x - 2, 51, 1, 5, IRON); rect(g, x + 2, 51, 1, 5, IRON); }   /* manacles on their chains */
  rect(g, 0, h - 6, w, 6, '#142620'); rect(g, 0, h - 6, w, 1, '#2a4a3a'); A(g, 0.5, () => rect(g, 20, h - 5, 90, 3, '#3fe08a'));   /* the seep along the floor: a green gutter */
  const cx = 330, cy = h; rect(g, cx - 14, cy - 12, 28, 3, '#3a2c20'); rect(g, cx - 14, cy - 12, 28, 1, '#5a4a38'); rect(g, cx - 16, cy - 20, 4, 8, '#3a2c20'); rect(g, cx + 12, cy - 20, 4, 8, '#3a2c20');   /* the bone cart */
  for (let i = 0; i < 7; i++) { rect(g, cx - 12 + i * 4, cy - 17 - (i % 3), 3, 6 + (i % 3), BONE[1 + (i % 2)]); } rect(g, cx - 8, cy - 22, 7, 6, BONE[2]); rect(g, cx - 7, cy - 20, 2, 2, '#0a100c'); rect(g, cx - 4, cy - 20, 2, 2, '#0a100c');
  for (const wx of [cx - 9, cx + 9]) { rect(g, wx - 5, cy - 11, 10, 10, IRON); rect(g, wx - 3, cy - 9, 6, 6, '#1a1c26'); rect(g, wx - 1, cy - 7, 2, 2, BRASS[1]); }
}
const SEAMS = [[150, 20, 90], [270, 60, 110], [24, 130, 50], [394, 120, 60]];
function bakeFoundation(g, w, h, r) {
  const P = PAL.orrery; ashlar(g, w, h, P, r, 24, 44, 80);   /* cyclopean: courses of 24 */
  for (let y = 24; y < h; y += 24) for (let x = (y / 24 % 2) * 30 + 20; x < w; x += 70 + Math.floor(r() * 30)) { rect(g, x, y + 3, 5, 1, P.hi); rect(g, x + 1, y + 6, 3, 1, P.hi); }
  for (let i = 0; i < 6; i++) { const x = 20 + Math.floor(r() * (w - 40)), y = 30 + Math.floor(r() * 120); rect(g, x, y, 8 + Math.floor(r() * 12), 2, P.m); rect(g, x + 2, y + 2, 5, 1, P.m); }
  for (const cx of [60, 360]) { const cy = 80, R = 34;   /* the great cogs half sunk in the wall: iron, with a brass hub (teeth turn live) */
    for (let a = 0; a < 360; a += 1) { const rad = a * Math.PI / 180; rect(g, cx + Math.cos(rad) * (R - 6), cy + Math.sin(rad) * (R - 6), 2, 2, '#1c1e28'); }
    for (let y = -R + 8; y <= R - 8; y++) { const half = Math.round(Math.sqrt((R - 7) * (R - 7) - y * y)); rect(g, cx - half, cy + y, half * 2, 1, y < -10 ? '#2a2c3a' : '#222430'); }
    for (let y = -10; y <= 10; y++) { const half = Math.round(Math.sqrt(100 - y * y)); rect(g, cx - half, cy + y, half * 2, 1, BRASS[y < -3 ? 2 : 1]); } rect(g, cx - 2, cy - 2, 4, 4, '#1a1620'); }
  for (const x of [128, 292]) { rect(g, x, 0, 3, h - 30, '#1a1c26'); rect(g, x, 0, 1, h - 30, '#3a3e4c'); for (let y = 10; y < h - 30; y += 22) { rect(g, x - 2, y, 7, 3, IRON); rect(g, x - 2, y, 7, 1, '#5a5e6c'); } }   /* cables down the stone */
  const ox = 208, oy = 92; for (let a = 0; a < 360; a += 3) { const rad = a * Math.PI / 180; rect(g, ox + Math.cos(rad) * 36, oy + Math.sin(rad) * 36, 2, 2, '#1a3a3a'); rect(g, ox + Math.cos(rad) * 26, oy + Math.sin(rad) * 26, 1, 1, '#1a3a3a'); }   /* the seal on the wall: two rings (glyphs glow live) */
  for (const [x, y, len] of SEAMS) { for (let i = 0; i < len; i += 2) rect(g, x + ((i * 7) % 5) - 2, y + i, 2, 2, '#14303a'); }
  rect(g, 0, h - 8, w, 8, '#1a1a22'); for (let x = 0; x < w; x += 18) rect(g, x, h - 8, 1, 8, '#101016');
}
function bakeCore(g, w, h, r) {
  const P = PAL.dome; ashlar(g, w, h, P, r, 12, 24, 44);
  for (const x of [0, w - 56]) { rect(g, x, 0, 56, h, P.c); for (let y = 0; y < h; y += 14) { rect(g, x, y, 56, 1, P.m); rect(g, x + (y / 14 % 2) * 14, y + 1, 1, 13, P.m); } rect(g, x === 0 ? 54 : w - 56, 0, 2, h, P.hi); }   /* the shaft's walls: closer courses, a lip */
  for (let y = 40; y < h - 24; y += 70) { const k = (y / 70) | 0, x0 = k % 2 ? 56 : w - 56 - 34; rect(g, x0, y, 34, 5, P.hi); rect(g, x0, y + 5, 34, 3, P.m); rect(g, x0 + 2, y - 2, 30, 2, P.c); rect(g, x0 + (k % 2 ? 2 : 30), y - 18, 2, 16, P.hi);   /* broken balconies on the shaft's walls, a railing post each */
    for (let i = 0; i < 4; i++) rect(g, x0 + 3 + i * 8, y + 8, 3, 2 + (i % 2) * 2, P.c); }
  for (const x of [88, 328]) { rect(g, x, 0, 2, h * 0.7, '#4a4e5e'); for (let y = 6; y < h * 0.7; y += 6) rect(g, x - 1 + (y / 6 % 2) * 2, y, 1, 4, '#6e7486'); }   /* chains hanging the whole height */
  { const dx = w / 2; arch(g, dx, -4, 34, 34, '#8a6a2e'); arch(g, dx, -4, 34, 30, '#2a2438'); arch(g, dx, -4, 32, 27, null, y => y < 14 ? '#fff4cf' : '#f4dc8a'); for (let y = 0; y < 34; y += 8) rect(g, dx - 27, y, 54, 1, '#c09a48'); rect(g, dx - 1, 0, 2, 34, '#c09a48'); rect(g, dx - 36, 34, 72, 3, '#8a6a2e'); }   /* HIS DOOR, a long way up: a lit arch the shaft rises to */
  rect(g, 0, h - 8, w, 8, '#161a28'); for (let x = 0; x < w; x += 16) rect(g, x, h - 8, 1, 8, '#0f121c');
  const cx = w / 2, cy = h - 22; for (let a = 0; a < 360; a += 4) { const rad = a * Math.PI / 180; rect(g, cx + Math.cos(rad) * 52, cy + Math.sin(rad) * 7, 2, 1, '#8a6a2e'); rect(g, cx + Math.cos(rad) * 38, cy + Math.sin(rad) * 5, 2, 1, '#3a3e4c'); }   /* the dais: two rings in the floor, the rug rests in the middle */
  fillPoly(g, [[cx - 46, h - 10], [cx + 46, h - 10], [cx + 40, h - 14], [cx - 40, h - 14]], '#2a2c3a'); rect(g, cx - 46, h - 10, 92, 1, '#5a5e6c');
}
const BAKE = { library: bakeScriptorium, reading: bakeReliquary, lab: bakeCellar, orrery: bakeFoundation, dome: bakeCore };
const cache = new Map();
/* THE CHASE ROOM'S BACK WALL + dressing: true when (st, tx0, ty0, w, h) is one of the chase's rooms (src/archmage-chase.js CH: columns 80-105, rows from 152, pitch 15).
   The core is 'dome' at row 227 (CH.top + 15 * 4), 24 rows tall. They do not get the level's holed-through wall: they are inside the tower. */
export function isChaseRoom(st, tx0, ty0, w, h) {
  if (tx0 !== 80 || w !== 416 || !BAKE[st]) return false;
  const k = (ty0 - 152) / 15; return Number.isInteger(k) && k >= 0 && k <= 4 && (st === 'dome' ? k === 4 && h === 384 : k < 4 && h === 208);
}
export function paintChaseRoom(g, st, sx, sy, w, h, tx0, ty0, time = 0) {
  const key = st + ':' + ty0; let c = cache.get(key);
  if (!c) { const [cv, cg] = canvas(w, h); BAKE[st](cg, w, h, mulberry(ty0 * 31 + 7)); c = cv; cache.set(key, c); }
  g.drawImage(c, sx, sy);
  const X = (x, y) => [Math.round(sx + x), Math.round(sy + y)];
  if (st === 'library') {   /* the chain lamps' green flames, moonlight dust turning in the lancets */
    for (const x of [139, 277]) { const [fx, fy] = X(x, 76); flame(g, fx, fy - 4, 9, time, x, GREEN); glow(g, fx, fy - 4, 30, 24, '#3fe08a', 0.22 + 0.05 * Math.sin(time * 9 + x)); }
    for (let i = 0; i < 18; i++) { const cx = [70, 208, 346][i % 3], t = (time * 0.1 + i * 0.37) % 1, [dx, dy] = X(cx - 20 + ((i * 53) % 60) + Math.sin(time + i) * 3, 150 + t * (h - 150)); A(g, 0.5 * Math.sin(t * Math.PI), () => { g.fillStyle = '#e8f0ff'; g.fillRect(dx, dy, 1, 1); }); } }
  else if (st === 'reading') {   /* candles, the cases' pulse, the censers' smoke */
    for (const x of [20, 190, 286, 396]) { const [fx, fy] = X(x + 1, h - 32); flame(g, fx, fy, 7, time, x, CANDLE); glow(g, fx, fy - 2, 30, 26, '#ff9b49', 0.26 + 0.07 * Math.sin(time * 11 + x)); }
    for (const x of [30, 130, 234, 338]) { const [fx, fy] = X(x, h - 15); A(g, 0.18 + 0.12 * Math.sin(time * 2.4 + x), () => { g.fillStyle = '#8fffb0'; g.fillRect(fx - 2, fy - 3, 4, 9); }); }
    for (const x of [104, 312]) for (let i = 0; i < 6; i++) { const t = (time * 0.35 + i / 6 + x * 0.01) % 1, [dx, dy] = X(x + Math.sin(time * 2 + i + x) * (3 + t * 8), 60 - t * 24); A(g, 0.55 * (1 - t), () => { g.fillStyle = '#8c8aa0'; g.fillRect(dx, dy, 2 + (t > 0.5 ? 1 : 0), 2); }); } }
  else if (st === 'lab') {   /* drips: from the vault, into the green seep; a specimen's slow bubble */
    for (let i = 0; i < 5; i++) { const x = 30 + i * 83 + (i % 2) * 17, t = (time * 0.7 + i * 0.29) % 1, [dx, dy] = X(x, 12 + t * (h - 20)); if (t < 0.97) { g.fillStyle = '#6aa8a0'; g.fillRect(dx, dy, 1, 2); } else { g.fillStyle = '#8fffb0'; g.fillRect(dx - 2, dy, 5, 1); } }
    for (let j = 0; j < 3; j++) { const t = (time * 0.5 + j * 0.31) % 1, [dx, dy] = X(190 + j * 7, 70 + j * 34 - t * 18); A(g, 1 - t, () => { g.fillStyle = '#c8ffd8'; g.fillRect(dx, dy, 2, 2); }); } }
  else if (st === 'orrery') {   /* the cogs turning (a bright tooth ring), the seams' pulse, the seal's glyphs */
    for (const cx of [60, 360]) { const R = 34, n = 14, dir = cx === 60 ? 1 : -1; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + time * 0.35 * dir, [dx, dy] = X(cx + Math.cos(a) * (R - 3), 80 + Math.sin(a) * (R - 3)); g.fillStyle = '#3a3e52'; g.fillRect(dx - 2, dy - 2, 5, 5); g.fillStyle = i % 4 === 0 ? BRASS[2] : '#5a5e72'; g.fillRect(dx - 1, dy - 1, 3, 2); } }
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + time * 0.2, [dx, dy] = X(208 + Math.cos(a) * 31, 92 + Math.sin(a) * 31); A(g, 0.5 + 0.4 * Math.sin(time * 3 + i), () => { g.fillStyle = '#6fe0c8'; g.fillRect(dx - 1, dy - 1, 3, 3); }); }
    for (const [x, y, len] of SEAMS) for (let i = 0; i < len; i += 2) { const [dx, dy] = X(x + ((i * 7) % 5) - 2, y + i); A(g, 0.35 + 0.35 * Math.sin(time * 2.2 - i * 0.12 + x), () => { g.fillStyle = '#6fe0c8'; g.fillRect(dx, dy, 2, 2); }); }
    glow(g, Math.round(sx + w / 2), Math.round(sy + h - 8), 200, 22, '#6fe0c8', 0.16 + 0.07 * Math.sin(time * 1.6)); }
  else if (st === 'dome') {   /* the updraft over the dais, motes riding it, his door's light at the very top, and the rune rings turning in the shaft */
    for (let i = 0; i < 4; i++) A(g, (0.025 + 0.008 * Math.sin(time * 2)), () => { g.fillStyle = '#e0b050'; const q = 60 - i * 13, [fx, fy] = X(w / 2 - q, 20); g.fillRect(fx, fy, q * 2, h - 30); });
    glow(g, Math.round(sx + w / 2), Math.round(sy + h - 16), 90, 18, '#f4dc8a', 0.3 + 0.08 * Math.sin(time * 2));
    for (let i = 0; i < 26; i++) { const t = (time * 0.18 + i * 0.137) % 1, [dx, dy] = X(w / 2 + Math.sin(i * 2.7 + time * 0.7) * (14 + 22 * t), (h - 24) - t * (h - 30)); A(g, 0.7 * Math.sin(t * Math.PI), () => { g.fillStyle = i % 3 ? '#f4dc8a' : '#ffffff'; g.fillRect(dx, dy, 1, i % 4 === 0 ? 2 : 1); }); }
    for (const y of [60, 150, 240]) for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2 + time * 0.5 * (y === 150 ? -1 : 1), [dx, dy] = X(w / 2 + Math.cos(a) * 70, y + Math.sin(a) * 9); A(g, 0.35 + 0.35 * Math.sin(a), () => { g.fillStyle = '#6fe0c8'; g.fillRect(dx, dy, 2, 1); }); }
    glow(g, Math.round(sx + w / 2), Math.round(sy + 8), 70, 40, '#fff0b8', 0.35 + 0.1 * Math.sin(time * 1.3)); }
  return true;
}

/* ------------------------------------------------------------------------------------------------- THE PILLARS ---- */
const STONE = ['#34304a', '#4a4660', '#5e5a78', '#6e6a88', '#8a86a4'];
/* the shaft of a cracked support pillar: x, y = its foot (bottom centre), h = height px; o: { st: 'whole' | 'tell', k: 0..1 told, time, near, arm, armed, ring, kind } */
export function paintPillar(g, x, y, h, o) {
  const sh = o.st === 'tell' ? Math.round(Math.sin(o.time * 60) * 1.2) : 0, top = y - h, t = o.time, k = o.k || 0, kind = o.kind || '';
  if (o.near > 0 && o.st === 'whole') { const a = Math.min(1, o.near * 2), lit = o.arm && !o.armed;   /* A6: it glows as you come near (gold; the chase's floor pillar, not yet ready, pale blue) */
    A(g, (0.10 + 0.14 * Math.abs(Math.sin(t * 3))) * a, () => { g.fillStyle = lit ? '#9ab0d0' : '#ffe6a0'; g.fillRect(x - 13 + sh, top - 6, 26, h + 6); });
    A(g, (0.12 + 0.2 * Math.abs(Math.sin(t * 3))) * a, () => { g.fillStyle = lit ? '#cfe0f4' : '#fff0c0'; g.fillRect(x - 9 + sh, top - 3, 18, h + 3); }); }
  if (o.armed && o.st === 'whole') { A(g, 0.22 + 0.2 * Math.abs(Math.sin(t * 5)), () => { g.fillStyle = '#ffe6a0'; g.fillRect(x - 13, top - 6, 26, h + 6); });   /* THE ONE TO STRIKE: lit, a gold chevron bobbing over it */
    const by = top - 14 + Math.round(Math.sin(t * 6) * 2); for (let i = 0; i < 4; i++) rect(g, x - 3 + i, by + i, 7 - i * 2, 1, '#ffe6a0'); rect(g, x - 1, by + 4, 3, 2, '#ffd36b'); }
  /* foot: a stepped plinth with a chisel notch on the side it falls toward */
  rect(g, x - 10 + sh, y - 5, 20, 5, STONE[2]); rect(g, x - 10 + sh, y - 5, 20, 1, STONE[4]); rect(g, x - 9 + sh, y - 8, 18, 3, STONE[1]); rect(g, x - 9 + sh, y - 8, 18, 1, STONE[3]); rect(g, x - 10 + sh, y - 1, 20, 1, STONE[0]);
  /* the shaft: lit left, shaded right, two flutes, a course joint every 12 px that steps out of true */
  rect(g, x - 6 + sh, top + 7, 12, h - 15, STONE[1]); rect(g, x - 6 + sh, top + 7, 3, h - 15, STONE[2]); rect(g, x - 5 + sh, top + 7, 1, h - 15, STONE[3]); rect(g, x + 4 + sh, top + 7, 2, h - 15, STONE[0]); rect(g, x - 1 + sh, top + 7, 1, h - 15, STONE[0]); rect(g, x + 2 + sh, top + 7, 1, h - 15, '#3e3a54');
  for (let yy = y - 20, i = 0; yy > top + 8; yy -= 12, i++) { rect(g, x - 6 + sh, yy, 12, 1, STONE[0]); rect(g, x - 6 + sh, yy + 1, 12, 1, STONE[2]); if (i % 2) rect(g, x + 3 + sh, yy - 3, 3, 3, STONE[0]); }
  rect(g, x - 7 + sh, top + Math.round(h * 0.55), 14, 3, IRON); rect(g, x - 7 + sh, top + Math.round(h * 0.55), 14, 1, '#5a5e6c'); for (const rx of [x - 5, x - 1, x + 3]) rect(g, rx + sh, top + Math.round(h * 0.55) + 1, 1, 1, '#8a8e9c');   /* the iron strap */
  rect(g, x - 2 + sh, top + 16, 5, 5, BONE[2]); rect(g, x - 1 + sh, top + 18, 1, 1, '#0a100c'); rect(g, x + 1 + sh, top + 18, 1, 1, '#0a100c'); rect(g, x - 1 + sh, top + 20, 3, 1, BONE[0]);   /* a skull cut in the shaft: this is the tower's own */
  /* head: abacus slab over a rounded echinus; what it holds, by kind */
  rect(g, x - 10 + sh, top, 20, 3, STONE[3]); rect(g, x - 10 + sh, top, 20, 1, STONE[4]); rect(g, x - 9 + sh, top + 3, 18, 1, STONE[0]); rect(g, x - 8 + sh, top + 4, 16, 3, STONE[2]); rect(g, x - 8 + sh, top + 4, 16, 1, STONE[3]); rect(g, x - 7 + sh, top + 6, 14, 1, STONE[0]);
  if (kind === 'ramp') { rect(g, x - 18 + sh, top - 3, 12, 3, IRON); rect(g, x - 18 + sh, top - 3, 12, 1, '#6a6e7c'); rect(g, x - 18 + sh, top, 2, 8, IRON); for (let i = 0; i < 3; i++) rect(g, x - 17 + i * 4 + sh, top - 8, 3, 5, SPINE[(i * 2) % 6]); }   /* an iron bracket under the shelf's end, a few books on it */
  if (kind === 'bridge') { fillPoly(g, [[x - 10 + sh, y - 8], [x - 6 + sh, y - 8], [x - 10 + sh, y - 20]], '#1a1826'); rect(g, x - 11 + sh, y - 21, 1, 12, '#8a86a4'); }   /* the notch cut at its foot, toward the gap */
  if (kind === 'crush') { rect(g, x - 14 + sh, top - 10, 28, 10, STONE[1]); rect(g, x - 14 + sh, top - 10, 28, 1, STONE[3]); rect(g, x - 2 + sh, top - 10, 1, 10, STONE[0]); rect(g, x - 20 + sh, top - 18, 14, 9, STONE[0]); rect(g, x + 6 + sh, top - 17, 14, 8, STONE[1]); rect(g, x - 20 + sh, top - 18, 14, 1, STONE[2]); }   /* the broken masonry on its head */
  if (kind === 'dark') { for (const [dx, dy, w2, h2] of [[-12, -6, 9, 6], [-3, -9, 8, 9], [5, -6, 8, 6], [-16, -2, 6, 3]]) { rect(g, x + dx + sh, top + dy, w2, h2, STONE[1]); rect(g, x + dx + sh, top + dy, w2, 1, STONE[3]); } }   /* rubble stacked and waiting on the head */
  if (kind === 'floor') { const lit = o.armed; rect(g, x - 4 + sh, top - 8, 9, 8, lit ? '#6a2a1a' : '#26283a'); rect(g, x - 3 + sh, top - 7, 7, 6, lit ? (Math.floor(t * 8) % 2 ? '#ff9b49' : '#ffd36b') : '#3a3e5a'); rect(g, x - 1 + sh, top - 6, 3, 1, '#0e1018'); rect(g, x, top - 7, 1, 5, '#0e1018'); }   /* a seal-stone: dead till he is through, then burning (the floor it holds) */
  /* THE CRACK: up the face, dark; in its tell it runs red from the foot up, with a hot core, wider as it climbs */
  const c0 = y - 8, c1 = top + 8, run = o.st === 'tell' ? c0 - (c0 - c1) * k : c1 + 1e9;
  for (let yy = c0, i = 0; yy > c1; yy -= 3, i++) { const ox = ((i * 7) % 5) - 2, burning = o.st === 'tell' && yy >= run - 1;
    rect(g, x + ox + sh, yy - 3, 1, 3, burning ? (Math.floor(t * 16 + i) % 2 ? '#ff6b6b' : '#ffd36b') : '#15121e'); rect(g, x + ox + sh + (ox > 0 ? -1 : 1), yy - 1, 1, 1, burning ? '#ffd36b' : STONE[0]);
    if (burning) A(g, 0.35, () => { g.fillStyle = '#ff9a5c'; g.fillRect(x + ox - 2 + sh, yy - 4, 5, 5); });
    if (!burning && o.st === 'whole' && i % 3 === 0) rect(g, x + ox + sh + (ox > 0 ? 1 : -2), yy - 2, 1, 1, '#7a88a6'); }   /* (a lit edge on the dead crack) */
  if (o.st === 'tell') { for (let i = 0; i < 5; i++) { const gy = top + 6 + (((t * 90 + i * 27) % Math.max(10, h - 8)) | 0); rect(g, x - 5 + ((i * 5) % 11) + sh, gy, 1, 2, '#b8b4a8'); } rect(g, x - 7, y - 2, 14, 2, '#8a8478'); A(g, 0.4, () => { g.fillStyle = '#b8b4a8'; g.fillRect(x - 9, y - 4, 18, 4); }); }   /* grit sifting off it, dust at its foot */
  if (o.ring > 0) { const rc = 'rgba(188,232,250,' + (o.ring / 0.4).toFixed(2) + ')'; rect(g, x - 11, top - 3, 22, 1, rc); rect(g, x - 11, y, 22, 1, rc); rect(g, x - 11, top - 3, 1, h + 3, rc); rect(g, x + 10, top - 3, 1, h + 3, rc); for (let i = 0; i < 4; i++) rect(g, x - 8 + i * 5, top + 12 + i * 8, 3, 1, rc); }   /* it rings off: pale runes flash on it */
}
/* the stump a fallen pillar leaves: a broken column foot, rubble, chips, dust still hanging (fx: seconds since it went, or null) */
export function paintStump(g, x, y, fx) {
  rect(g, x - 10, y - 5, 20, 5, STONE[2]); rect(g, x - 10, y - 5, 20, 1, STONE[4]); rect(g, x - 9, y - 8, 18, 3, STONE[1]);
  fillPoly(g, [[x - 6, y - 8], [x - 6, y - 15], [x - 3, y - 12], [x - 1, y - 18], [x + 2, y - 13], [x + 4, y - 16], [x + 6, y - 9], [x + 6, y - 8]], STONE[1]); rect(g, x - 6, y - 15, 3, 7, STONE[2]); rect(g, x + 4, y - 16, 2, 7, STONE[0]);
  rect(g, x - 2, y - 14, 1, 6, '#15121e'); rect(g, x - 1, y - 11, 2, 1, '#15121e');
  for (const [dx, dy, w, h] of [[-16, 0, 7, 4], [-9, -1, 5, 3], [10, 0, 8, 5], [15, -1, 4, 3], [-20, 0, 3, 2], [19, 0, 5, 2]]) { rect(g, x + dx, y - h + dy, w, h, STONE[1]); rect(g, x + dx, y - h + dy, w, 1, STONE[3]); rect(g, x + dx + w - 2, y - h + dy + 1, 2, h - 1, STONE[0]); }
  if (fx !== null && fx !== undefined && fx < 1.2) A(g, 0.5 * (1 - fx / 1.2), () => { g.fillStyle = '#a89a84'; for (let i = 0; i < 8; i++) g.fillRect(x - 14 + i * 4 + Math.round(Math.sin(i * 2 + fx * 3) * 3), y - 6 - Math.round(fx * 16) - (i % 3) * 3, 3, 3); });
}
/* ONE SHELF OF A TOPPLED BOOKCASE laid across tiles x0..x1 (tile columns) at tile row `row`, in pixels: its board is the footing (top at row * 16), books standing in the bay under it and
   a few spilled on top (never more than 2 px: the footing stays clean) */
function shelfRest(g, px0, py, wpx, seed) {
  rect(g, px0, py, wpx, 4, WOOD[2]); rect(g, px0, py, wpx, 1, '#6a5038'); rect(g, px0, py + 3, wpx, 1, WOOD[0]);
  rect(g, px0, py + 4, wpx, 11, '#140e0b'); rect(g, px0, py + 4, wpx, 1, WOOD[0]);
  for (let i = 0, x = px0 + 2; x < px0 + wpx - 4; i++) { const bw = 2 + ((i * 5 + seed) % 3), bh = 8 + ((i * 3 + seed) % 4), c = SPINE[(i * 5 + seed) % 6]; rect(g, x, py + 14 - bh, bw, bh, c); rect(g, x, py + 14 - bh, 1, bh, '#ffffff22'); rect(g, x, py + 14 - bh + 2, bw, 1, BRASS[2]); x += bw + ((i + seed) % 5 === 0 ? 2 : 0); }
  rect(g, px0, py + 14, wpx, 2, WOOD[1]);
  rect(g, px0 - 3, py - 1, 4, 17, WOOD[1]); rect(g, px0 - 3, py - 1, 4, 1, WOOD[2]); rect(g, px0 + wpx - 1, py - 1, 4, 17, WOOD[1]); rect(g, px0 + wpx - 1, py - 1, 4, 1, WOOD[2]);   /* the case's stiles, a hand past the board */
  for (let i = 0; i < wpx / 14; i++) { const bx = px0 + 4 + i * 14 + ((seed * 3 + i * 7) % 5); rect(g, bx, py - 2, 4, 2, SPINE[(i + seed) % 6]); rect(g, bx + 1, py - 2, 2, 1, PAPER); }   /* books lying on the board, two px at most */
  rect(g, px0 + 1, py + 1, 2, 1, BRASS[2]); rect(g, px0 + wpx - 3, py + 1, 2, 1, BRASS[2]);
}
function columnRest(g, x0, x1, y) {   /* the toppled column across the gap: fluted drums on the footing row, a capital at the far end, a base at the near one */
  const w = x1 - x0; rect(g, x0 + 10, y, w - 20, 14, STONE[1]); rect(g, x0 + 10, y, w - 20, 3, STONE[3]); rect(g, x0 + 10, y, w - 20, 1, STONE[4]); rect(g, x0 + 10, y + 11, w - 20, 3, STONE[0]);
  for (let xx = x0 + 22, i = 0; xx < x1 - 12; xx += 24, i++) { rect(g, xx, y, 1, 14, STONE[0]); rect(g, xx + 1, y, 1, 14, STONE[2]); if (i % 2) rect(g, xx - 2, y + 5, 5, 4, STONE[0]); }
  for (let xx = x0 + 12; xx < x1 - 10; xx += 5) { rect(g, xx, y + 5, 3, 1, STONE[0]); rect(g, xx + 1, y + 8, 2, 1, STONE[2]); }
  rect(g, x0, y - 1, 10, 16, STONE[2]); rect(g, x0, y - 1, 10, 1, STONE[4]); rect(g, x0 + 1, y + 2, 2, 12, STONE[0]);   /* its base, a plinth turned on its side */
  rect(g, x1 - 12, y - 2, 12, 18, STONE[3]); rect(g, x1 - 12, y - 2, 12, 1, STONE[4]); rect(g, x1 - 10, y + 1, 8, 2, STONE[2]); rect(g, x1 - 3, y, 3, 14, STONE[0]);   /* its capital */
  rect(g, x0 + Math.round(w * 0.45), y + 3, 6, 8, '#15121e'); rect(g, x0 + Math.round(w * 0.45) + 6, y + 6, 3, 2, '#15121e');   /* the crack it broke along */
  rect(g, x0 + 60, y - 2, 9, 5, BONE[2]); rect(g, x0 + 61, y - 1, 2, 2, '#0a100c');   /* the skull cut in its shaft, now on its side */
}
function rubble(g, x0, x1, y, seed, hmax = 12) {   /* a heap of broken masonry along a floor (y = the floor line): the stone that came down */
  for (let x = x0, i = 0; x < x1; x += 7 + (i * 3 + seed) % 6, i++) { const w = 6 + (i + seed) % 8, hh = 3 + ((i * 5 + seed) % (hmax - 3)); rect(g, x, y - hh, w, hh, STONE[1 + (i % 2)]); rect(g, x, y - hh, w, 1, STONE[3]); rect(g, x + w - 2, y - hh + 1, 2, hh - 1, STONE[0]); if (i % 3 === 0) rect(g, x + 2, y - hh + 2, 1, 3, '#15121e'); }
}
/* WHAT A FALLEN PILLAR LEFT, resting (s: the pillar object; cx, cy: the camera) */
export function paintResting(g, s, cx, cy, time) {
  const T = 16;
  if (s.kind === 'ramp') (s.spans || []).forEach(([x0, x1, row], i) => shelfRest(g, Math.round(x0 * T - cx), Math.round(row * T - cy), (x1 - x0 + 1) * T, i * 2 + 1));
  else if (s.kind === 'bridge') for (const [x0, x1, row] of s.spans || []) columnRest(g, Math.round(x0 * T - cx), Math.round((x1 + 1) * T - cx), Math.round(row * T - cy));
  else if (s.kind === 'crush' && s.crush) { const [x0, x1, , y1] = s.crush; rubble(g, Math.round(x0 * T - cx), Math.round((x1 + 1) * T - cx), Math.round((y1 + 1) * T - cy), 3, 13); }
  else if (s.kind === 'dark') { rubble(g, Math.round(s.x - 30 - cx), Math.round(s.x + 30 - cx), Math.round(s.y - cy), 5, 15); rubble(g, Math.round(s.x - 18 - cx), Math.round(s.x + 18 - cx), Math.round(s.y - 9 - cy), 9, 9); }
  void time;
}
/* THE FALL ITSELF (fx = seconds since it went, fallT = SUP.fallT): the bookcase's shelves dropping in, one after the other and each throwing books; the column swinging over like a
   tree; masonry coming down in blocks; the floor going in chunks */
export function paintFall(g, s, cx, cy, fx, fallT) {
  const T = 16, k = Math.min(1, fx / fallT), e = k * k;
  if (s.kind === 'ramp') (s.spans || []).forEach(([x0, x1, row], i) => { const kk = Math.max(0, Math.min(1, (fx - i * 0.05) / fallT)); if (kk >= 1) return; const px0 = Math.round(x0 * T - cx), py = Math.round(row * T - cy - (1 - kk * kk) * 70), wpx = (x1 - x0 + 1) * T;
    shelfRest(g, px0, py, wpx, i * 2 + 1); for (let b = 0; b < 5; b++) rect(g, px0 + ((b * 17 + i * 9) % wpx), py - 14 - ((b * 11) % 12) - Math.round(kk * 6), 4, 2, SPINE[(b + i) % 6]); });
  else if (s.kind === 'bridge' && s.spans && s.spans[0]) { const [x0, x1, row] = s.spans[0], n = Math.floor((x1 - x0 + 1) * T / 14), bx = s.x - cx, by = s.y - cy - 8, base = Math.round(x0 * T - cx), ang = (Math.PI / 2) * (1 - e), len = (x1 - x0 + 1) * T;
    if (k < 1) for (let i = 0; i < n; i++) { const d = 6 + i * (len / n), qx = Math.round(bx + Math.cos(ang) * d), qy = Math.round(by - Math.sin(ang) * d) - 6; rect(g, qx - 6, qy, 12, 12, i % 2 ? STONE[2] : STONE[1]); rect(g, qx - 6, qy, 12, 1, STONE[4]); rect(g, qx + 3, qy + 1, 3, 11, STONE[0]); }
    else void base, row; }
  else if (s.kind === 'crush' && s.crush) { const [x0, x1, y0, y1] = s.crush; if (k >= 1) return; for (let x = x0; x <= x1; x += 2) { const qx = Math.round(x * T - cx + 8), qy = Math.round(y0 * T - cy - 20 + (hsh(x, 3) * 0.4 + 0.6) * (y1 - y0 + 1) * T * e); rect(g, qx - 6, qy, 12, 10, STONE[1]); rect(g, qx - 6, qy, 12, 1, STONE[3]); rect(g, qx + 3, qy + 1, 3, 9, STONE[0]); } }
  else if (s.kind === 'floor') for (const [x0, x1, y0, y1] of s.clear || []) { if (y1 - y0 > 1 && false) continue; const wide = x1 - x0 > 3; for (let i = 0; i < (wide ? 30 : 4); i++) { const hx = x0 * T + hsh(i, x0) * (x1 - x0 + 1) * T, t2 = fx + hsh(i, 5) * 0.2, qx = Math.round(hx - cx + Math.sin(i * 3) * t2 * 14), qy = Math.round(y0 * T - cy + 520 * t2 * t2 * 0.5 * (0.5 + hsh(i, 9))); if (qy > cy + 400) continue; const sz = 4 + Math.floor(hsh(i, 2) * 8); rect(g, qx, qy, sz, sz - 1, STONE[1 + (i % 2)]); rect(g, qx, qy, sz, 1, STONE[3]); } }
}

/* ------------------------------------------------------------------------------------------------------ FLOOR FX ---- */
/* the crack he runs wall to wall: a jagged seam, dark with a hot core, grit pouring through it in columns (x0, w: the room's span in screen px; y: the floor; reach: 0..w) */
export function paintFloorCrack(g, x0, w, y, mid, k, time) {
  const reach = w * k; for (let x = 0; x < w; x += 2) { const px0 = x0 + x, d = Math.abs(px0 - mid); if (d > reach) continue; const jy = ((x * 5) % 5) - 2 + Math.round(Math.sin(x * 0.2) * 2), hot = d > reach - 14;
    rect(g, px0, y + jy, 2, 3, '#0e0c14'); rect(g, px0, y + jy + 1, 2, 1, hot || Math.floor(time * 14 + x) % 3 === 0 ? '#ffd36b' : '#ff6b6b'); if (x % 24 === 0) { rect(g, px0, y + jy - 2, 1, 2, '#ff9a5c'); } }
  A(g, 0.22 * k, () => { g.fillStyle = '#ff9a5c'; g.fillRect(x0, y - 3, w, 5); });
  for (let x = 6; x < w; x += 19) { const px0 = x0 + x; if (Math.abs(px0 - mid) > reach) continue; const t = ((time * 70 + x * 3) % 50);   /* grit pouring through */
    rect(g, px0, y + 2 + Math.round(t), 1, 4, '#b8b4a8'); rect(g, px0 + 1, y + 2 + Math.round((t + 20) % 50), 1, 2, '#8a8478'); }
}
/* he goes through the floor: a funnel of pale smoke and the green sparks of his own fire, a dark ring on the stone (t: 0..1 of the sink) */
export function paintSink(g, x, y, t, time) {
  A(g, 0.6 * (1 - t * 0.5), () => { g.fillStyle = '#0a100c'; g.fillRect(x - 14, y - 1, 28, 3); g.fillRect(x - 9, y + 2, 18, 2); });
  for (let i = 0; i < 12; i++) { const a = time * 5 + i * 0.7, r2 = 3 + (i % 4) * 3 + Math.round(t * 5); rect(g, x + Math.round(Math.cos(a) * r2), y - 2 - Math.round(((time * 30 + i * 11) % 24)), 2, 2, i % 3 ? '#3fe08a' : '#d8ffe4'); }
  A(g, 0.35, () => { g.fillStyle = '#8fffb0'; g.fillRect(x - 6, y - 14, 12, 14); });
}
/* where he hit the floor: a ring of grit running out along it (t: seconds since) */
export function paintLanding(g, x, y, t) {
  if (t > 0.5) return; const r2 = Math.round(8 + t * 90), a = 0.7 * (1 - t / 0.5);
  A(g, a, () => { g.fillStyle = '#cfc6b0'; for (const sgn of [-1, 1]) for (let i = 0; i < 4; i++) g.fillRect(x + sgn * (r2 - i * 5), y - 2 - (i % 2), 4, 2); });
  A(g, a * 0.6, () => { g.fillStyle = '#ffffff'; g.fillRect(x - r2 + 4, y - 1, r2 * 2 - 8, 1); });
}
/* THE ROLLING LADDER: a rail high on the shelves (brackets into the stone), a trolley riding it on two iron wheels, two stiles down to the step (x, y: the step's top left,
   w: its width; rx0, rx1: the rail's span; ry: the rail's y; t: time) */
export function paintLadder(g, x, y, w, rx0, rx1, ry, t, dir) {
  rect(g, rx0, ry, rx1 - rx0, 3, IRON); rect(g, rx0, ry, rx1 - rx0, 1, '#6a6e7c'); rect(g, rx0, ry + 3, rx1 - rx0, 1, '#1a1c26');
  for (let bx = rx0 + 4; bx < rx1; bx += 40) { rect(g, bx, ry + 3, 3, 8, IRON); rect(g, bx - 2, ry + 9, 7, 2, IRON); rect(g, bx, ry + 3, 1, 8, '#5a5e6c'); }   /* the brackets into the wall */
  const tx = x + Math.round(w / 2); rect(g, tx - 11, ry - 5, 22, 6, '#2a2c38'); rect(g, tx - 11, ry - 5, 22, 1, '#5a5e6c'); rect(g, tx - 11, ry + 1, 22, 1, '#14141c');   /* the trolley */
  for (const wx of [tx - 8, tx + 8]) { rect(g, wx - 3, ry - 3, 7, 7, '#1a1c26'); rect(g, wx - 2, ry - 2, 5, 5, IRON); const sp = Math.floor(t * 6 * dir) & 3; rect(g, wx - 2 + (sp & 1 ? 0 : 1), ry, 5 - (sp & 1 ? 0 : 2), 1, BRASS[2]); rect(g, wx, ry - 2 + (sp & 1 ? 1 : 0), 1, 4 - (sp & 1 ? 2 : 0), BRASS[2]); rect(g, wx, ry, 1, 1, BRASS[3]); }
  rect(g, tx - 2, ry + 1, 4, 5, BRASS[1]);
  for (const sx of [x + 6, x + w - 8]) { rect(g, sx, ry + 6, 3, y - ry - 6, WOOD[2]); rect(g, sx, ry + 6, 1, y - ry - 6, '#6a5038'); rect(g, sx - 1, ry + 5, 5, 3, BRASS[1]); rect(g, sx - 1, y - 3, 5, 3, BRASS[1]); }
  for (let yy = ry + 16; yy < y - 4; yy += 8) { rect(g, x + 9, yy, w - 18, 2, WOOD[1]); rect(g, x + 9, yy, w - 18, 1, '#6a5038'); }   /* the rungs */
  rect(g, x, y, w, 6, WOOD[1]); rect(g, x, y, w, 2, '#6a5038'); rect(g, x, y + 4, w, 2, WOOD[0]); rect(g, x, y, 3, 6, BRASS[1]); rect(g, x + w - 3, y, 3, 6, BRASS[1]); rect(g, x, y, w, 1, BRASS[2]);   /* the step: a wide board, brass-shod */
  for (let i = 0; i < 3; i++) rect(g, x + 7 + i * 12, y + 2, 1, 1, BRASS[3]);
}

/* a contact sheet for tools/ft3art-shots.mjs: every pillar state and what each kind drops, on a wall colour (Node only; newCanvas from tools/node-canvas.mjs) */
export function pillarSheet(newCanvas, SUP) {
  const kinds = ['ramp', 'bridge', 'crush', 'dark', 'floor'], W = 160, H = 130, out = newCanvas(W * kinds.length, H * 5), g = out.getContext('2d'); g.fillStyle = '#2a3044'; g.fillRect(0, 0, out.width, out.height);
  kinds.forEach((kind, i) => { const ox = i * W, h = kind === 'ramp' || kind === 'crush' ? 64 : 48;
    const base = { x: 80, y: 110, h: h / 16, kind, near: 0, arm: kind === 'floor', armed: false, ring: 0, st: 'whole', t: 0 };
    const spans = kind === 'ramp' ? [[1, 3, 4], [4, 6, 2]] : kind === 'bridge' ? [[1, 8, 7]] : null, crush = kind === 'crush' ? [1, 8, 3, 6] : null, clear = kind === 'floor' ? [[1, 8, 7, 8]] : null;
    Object.assign(base, { spans, crush, clear, x: 80 });
    const row = (r, fn) => { g.save(); g.translate(ox, H * r); fn(); g.restore(); };
    row(0, () => paintPillar(g, 80, 110, h, { st: 'whole', k: 0, time: 0.3, near: 0, arm: false, armed: false, ring: 0, kind }));
    row(1, () => { paintPillar(g, 80, 110, h, { st: 'whole', k: 0, time: 0.3, near: 1, arm: kind === 'floor', armed: kind === 'floor', ring: 0, kind }); });
    row(2, () => paintPillar(g, 80, 110, h, { st: 'tell', k: 0.55, time: 0.3, near: 0, arm: false, armed: false, ring: 0, kind }));
    row(3, () => paintFall(g, Object.assign({}, base, { spans: spans && spans.map(a => a.slice()), crush, clear }), 0, 0, 0.2, 0.45));
    row(4, () => { paintResting(g, Object.assign({}, base, { spans: spans && spans.map(a => a.slice()), crush, clear }), 0, 0, 0); if (kind !== 'floor') paintStump(g, 80, 110, null); });
  }); return out;
}
