// caravan2_art.js - THE SUNKEN CARAVAN's art pass (claude/caravan2art, 2026-10-10). Pure canvas bakes + draw helpers (no DOM, no main.js); px.js primitives,
// the desert's palette (src/redraw/desert.js DESERT). Daniel 10-09: the logs are gone, so the level's wood is only what a wagon is made of - sun-bleached,
// split and iron-banded - and the rest is ROCK and what the caravan carried, half in the sand.
//
//   bakeWagonBeds()    [3] 40x22   THE SINKING WAGON BED (a `pad` with wreck: true, 32 wide): 0 afloat | 1 going in | 2 lip only (about to go under)
//   bakeSlabs()        { L, M, R, S } 16x16 tiles: THE ROAD'S SLABS lying on the quicksand (chiselled top, a cracked corner, sand drifted at the foot)
//   bakeWreckage()     { crateStack[2], rockPile[2], brokenWheel, tornCanvas, bedWreck } - the dressing L.wreckage names (drawn behind the play, nothing to climb)
//   bakeSandBreath()   -> drawSandBreath(g, ...) the cone as grains, never a polygon
//   drawWardShell(g, x, y, k, t)   the Dune Worm's ward as a ring of pixels (violet = WARDED, the shared read)
//   drawGrit(g, VW, VH, k, t)      GRIT IN YOUR EYES as an ordered-dither vignette
//   drawLedgePiers(g, x0, w, top, fy, S)   the rising ledges' two piers, masonry courses
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, mulberry } from '../px.js';
import { OUT } from '../art.js';
import { DESERT as D } from './desert.js';

/* the wagon's own timber, sun-bleached: grey-brown boards, a dark split, iron bands and a rim of a wheel */
const WD = { hi: '#b7a283', mid: '#9a8466', lo: '#7a6850', sh: '#5a4a38', gap: '#2e2418', iron: '#4a4a52', ironL: '#7a7a84', rust: '#8a5a3c', cloth: '#d9c9a0', clothD: '#b4a07a', sand: D.dune, sandL: D.duneL, sandD: D.duneD };
const SAND = ['#e2bb7a', '#f2d79c', '#bf8f63', '#fff1c8'];

// ---------------- THE SINKING WAGON BED ----------------
export function bakeWagonBeds() {
  const out = [];
  for (let st = 0; st < 3; st++) {
    const [c, g] = canvas(40, 22), r = mulberry(70 + st);
    const top = 8 + st;                                              // the bed's top edge sinks a row per state, the lip stays above the sand
    const x0 = 3, w = 32;
    // the bed: a deep box, three board courses, the near side's planks split and uneven
    rect(g, x0, top, w, 7, WD.mid);
    for (let i = 0; i < w; i++) { const hgt = 7; if (i % 7 === 6) rect(g, x0 + i, top, 1, hgt, WD.gap); }                      // board joints
    rect(g, x0, top, w, 1, WD.hi); rect(g, x0, top + 3, w, 1, WD.lo); rect(g, x0, top + 6, w, 1, WD.sh);                      // lit edge, a course line, the foot's shade
    for (let k = 0; k < 7; k++) px(g, x0 + 2 + ((r() * (w - 4)) | 0), top + 1 + ((r() * 5) | 0), r() < 0.5 ? WD.hi : WD.sh);   // grain flecks
    // a split plank end hanging at the sunk end (left), and the tailboard standing up at the far end
    rect(g, x0 - 2, top + 1, 3, 2, WD.lo); px(g, x0 - 3, top + 2, WD.sh);
    rect(g, x0 + w - 5, top - 5, 5, 6, WD.lo); rect(g, x0 + w - 5, top - 5, 5, 1, WD.hi); rect(g, x0 + w - 5, top - 5, 1, 6, WD.sh);
    px(g, x0 + w - 3, top - 3, WD.gap); px(g, x0 + w - 2, top - 2, WD.gap);                                                  // nail holes
    // iron straps over the bed, a rust bloom at each rivet
    for (const sx of [x0 + 7, x0 + 20]) { rect(g, sx, top, 2, 7, WD.iron); px(g, sx, top + 1, WD.ironL); px(g, sx + 1, top + 5, WD.rust); }
    // the cover's bows: two ribs of the tilt-cloth standing bare, a rag of canvas on one
    for (const bx of [x0 + 11, x0 + 24]) { line(g, bx, top, bx - 1, top - 5, WD.lo); line(g, bx - 1, top - 5, bx + 3, top - 8, WD.mid); px(g, bx + 3, top - 8, WD.hi); }
    line(g, x0 + 12, top - 5, x0 + 22, top - 7, WD.clothD); line(g, x0 + 13, top - 4, x0 + 21, top - 5, WD.cloth); px(g, x0 + 21, top - 4, WD.clothD); px(g, x0 + 22, top - 3, WD.clothD);
    // a wheel's rim standing out of the sand at the near end: ring, two spokes, a hub
    { const wx = x0 + 5, wy = top + 7; for (let a = 0; a < 40; a++) { const t = Math.PI * 1.02 + a / 40 * Math.PI * 0.96; px(g, wx + Math.round(Math.cos(t) * 6), wy + Math.round(Math.sin(t) * 6), WD.iron); px(g, wx + Math.round(Math.cos(t) * 5), wy + Math.round(Math.sin(t) * 5), WD.lo); }
      line(g, wx, wy, wx - 4, wy - 4, WD.lo); line(g, wx, wy, wx + 4, wy - 4, WD.lo); line(g, wx, wy, wx, wy - 6, WD.mid); px(g, wx, wy - 1, WD.iron); }
    // sand: drifted up the sunk end, spilling over the lip as it goes under (st)
    for (let i = 0; i < 12 + st * 6; i++) { const sx = x0 + ((r() * 14) | 0) - 2, sy = top + 5 + st + ((r() * 3) | 0); px(g, sx, sy, SAND[(r() * 3) | 0]); }
    if (st) for (let x = x0 + 2; x < x0 + w - 1; x++) { const dp = Math.round(Math.sin(x * 0.9) * 0.6 + st * 0.8); rect(g, x, top - dp, 1, dp + 1, x % 2 ? SAND[0] : SAND[1]); }   // drift riding up the near edge
    rect(g, x0 - 2, 21, w + 4, 1, D.qsD); rect(g, x0, 20, w, 1, D.qsL);                                                       // the quicksand it rests on
    outline(c, OUT); out.push(c);
  }
  return out;
}

// ---------------- THE ROAD'S SLABS ----------------
const SL = { top: '#f6dcbc', lit: '#e8c4a0', mid: '#d4a47e', dark: '#b07e60', deep: '#8a5e46', crack: '#5e3a2a' };
export function bakeSlabs() {
  const mk = (kind, seed) => { const [c, g] = canvas(16, 16), r = mulberry(900 + seed);
    rect(g, 0, 0, 16, 16, 'rgba(0,0,0,0)');
    // a 10-row cut slab: the chiselled crust, two courses of grain, the lower edge in shade, sand drifted up its foot
    rect(g, 0, 2, 16, 11, SL.mid); rect(g, 0, 2, 16, 2, SL.lit); rect(g, 0, 2, 16, 1, SL.top); rect(g, 0, 10, 16, 3, SL.dark); rect(g, 0, 12, 16, 1, SL.deep);
    for (let k = 0; k < 14; k++) px(g, (r() * 16) | 0, 4 + ((r() * 6) | 0), r() < 0.5 ? SL.lit : SL.dark);
    if (kind === 'L' || kind === 'S') { rect(g, 0, 2, 1, 11, SL.dark); px(g, 0, 2, SL.lit); px(g, 1, 12, SL.deep); rect(g, 0, 11, 2, 2, 'rgba(0,0,0,0)'); }   // a broken-off corner on the left end
    if (kind === 'R' || kind === 'S') { rect(g, 15, 2, 1, 11, SL.dark); rect(g, 14, 2, 2, 1, SL.mid); px(g, 15, 3, 'rgba(0,0,0,0)'); px(g, 15, 12, 'rgba(0,0,0,0)'); }
    // the crack that goes under the foot, and a smaller one
    px(g, 6, 3, SL.crack); px(g, 7, 4, SL.crack); px(g, 7, 5, SL.crack); px(g, 8, 6, SL.crack); px(g, 8, 7, SL.crack); px(g, 9, 8, SL.crack);
    px(g, 12, 6, SL.crack); px(g, 11, 7, SL.crack);
    // sand piled against the foot and a dribble over the lip
    for (let x = 0; x < 16; x++) { const h2 = 1 + ((x * 5 + seed) % 3 === 0 ? 1 : 0); rect(g, x, 13, 1, h2, x % 3 ? SAND[0] : SAND[2]); }
    px(g, 3, 2, SAND[1]); px(g, 4, 2, SAND[1]); px(g, 11, 3, SAND[0]);
    outline(c, OUT); return c; };
  return { L: mk('L', 1), M: mk('M', 2), R: mk('R', 3), S: mk('S', 4) };
}

// ---------------- WRECKAGE AND ROCK (dressing, drawn behind the play) ----------------
export function bakeWreckage() {
  const crate = (g, x, y, w, h, tilt = 0, hi = WD.mid) => { rect(g, x, y, w, h, hi); rect(g, x, y, w, 1, WD.hi); rect(g, x, y + h - 1, w, 1, WD.sh);
    rect(g, x, y, 1, h, WD.lo); rect(g, x + w - 1, y, 1, h, WD.sh);
    line(g, x, y, x + w - 1, y + h - 1, WD.lo); if (tilt) line(g, x + w - 1, y, x, y + h - 1, WD.gap);
    px(g, x + 1, y + 1, WD.ironL); px(g, x + w - 2, y + 1, WD.ironL); px(g, x + 1, y + h - 2, WD.ironL); px(g, x + w - 2, y + h - 2, WD.ironL); };
  const crateStack = [0, 1].map(v => { const [c, g] = canvas(34, 26), r = mulberry(300 + v);
    // two crates, a third skewed on them, an amphora lying beside them, sand to the sills
    crate(g, 3, 14, 12, 10); crate(g, 16, 16, 10, 8, 1); crate(g, v ? 8 : 6, 5, 11, 10, 0, WD.lo);
    if (v) { rect(g, 24, 10, 3, 6, WD.sh); rect(g, 23, 9, 5, 2, WD.lo); }                                     // a stave sticking out of the broken one
    ellipse(g, v ? 29 : 28, 21, 4, 2.4, D.clayD); ellipse(g, v ? 29 : 28, 20, 4, 2.2, D.clay); px(g, 25, 20, D.clayD); px(g, 31, 20, D.clayL); px(g, 28, 19, D.clayL);   // an amphora on its side
    rect(g, v ? 26 : 25, 18, 3, 2, D.clayD);                                                                  // its neck
    for (let x = 0; x < 34; x++) { const hgt = 1 + (((x * 7 + v) % 4) === 0 ? 1 : 0); rect(g, x, 24 - hgt + 1, 1, hgt + 1, SAND[x % 3 === 0 ? 1 : 0]); }
    px(g, 12, 15, WD.cloth); px(g, 13, 16, WD.clothD);
    outline(c, OUT); return c; });
  const rockPile = [0, 1].map(v => { const [c, g] = canvas(v ? 40 : 30, v ? 26 : 20), r = mulberry(500 + v), W2 = c.width, H2 = c.height;
    const blocks = v ? [[2, 12, 16, 12], [16, 8, 14, 16], [28, 14, 10, 10], [10, 3, 14, 10]] : [[2, 8, 14, 12], [14, 4, 14, 16]];
    for (const [bx, by, bw, bh] of blocks) { rect(g, bx, by, bw, bh, SL.mid); rect(g, bx, by, bw, 2, SL.lit); rect(g, bx, by, bw, 1, SL.top); rect(g, bx + bw - 3, by + 2, 3, bh - 2, SL.dark); rect(g, bx, by + bh - 2, bw, 2, SL.deep);
      for (let k = 0; k < 5; k++) px(g, bx + 1 + ((r() * (bw - 2)) | 0), by + 3 + ((r() * (bh - 5)) | 0), r() < 0.5 ? SL.lit : SL.dark); }
    px(g, 8, 9, SL.crack); px(g, 9, 10, SL.crack); px(g, 9, 11, SL.crack); px(g, W2 - 12, 7, SL.crack); px(g, W2 - 11, 8, SL.crack);
    for (let x = 0; x < W2; x++) { const hgt = 1 + (((x * 5 + v) % 4) === 0 ? 1 : 0); rect(g, x, H2 - hgt - 1, 1, hgt + 1, SAND[x % 3 === 0 ? 1 : 0]); }
    outline(c, OUT); return c; });
  const brokenWheel = (() => { const [c, g] = canvas(26, 26); const wx = 12, wy = 12;
    // a cart wheel half-sunk, leaning: the rim, six spokes (two snapped), a hub with an iron cap
    for (let a = 0; a < 64; a++) { const t = a / 64 * Math.PI * 2; const x = wx + Math.round(Math.cos(t) * 10), y = wy + Math.round(Math.sin(t) * 10); if (y < 6 && Math.cos(t) > 0.7) continue;   // the rim has a bite out of it
      px(g, x, y, WD.iron); px(g, wx + Math.round(Math.cos(t) * 9), wy + Math.round(Math.sin(t) * 9), WD.lo); }
    for (let s = 0; s < 6; s++) { const t = s / 6 * Math.PI * 2 + 0.3, len = s === 1 || s === 4 ? 4 : 9; line(g, wx, wy, wx + Math.round(Math.cos(t) * len), wy + Math.round(Math.sin(t) * len), s % 2 ? WD.mid : WD.lo); }
    circle(g, wx, wy, 2, WD.iron); px(g, wx, wy, WD.ironL);
    for (let x = 0; x < 26; x++) { const hgt = 1 + (((x * 3) % 5) === 0 ? 1 : 0); if (x < 24) rect(g, x, 24 - hgt + 1, 1, hgt + 2, SAND[x % 3 === 0 ? 1 : 0]); }
    rect(g, 0, 17, 26, 9, 'rgba(0,0,0,0)');                                                                    // (the lower half is under the sand: a clean cut)
    for (let x = 0; x < 26; x++) { const hgt = 2 + (((x * 3) % 5) === 0 ? 1 : 0); rect(g, x, 20 - hgt + 1, 1, hgt + 1, SAND[x % 3 === 0 ? 1 : 0]); }
    outline(c, OUT); return c; })();
  const tornCanvas = (() => { const [c, g] = canvas(30, 12);
    // a strip of the tilt-cloth lying in the sand: striped, frayed, one corner lifted by the wind
    for (let x = 0; x < 28; x++) { const y = 6 + Math.round(Math.sin(x * 0.45) * 1.4), col = ((x >> 2) & 1) ? D.red : D.cloth, dk = ((x >> 2) & 1) ? D.redD : D.clothD;
      rect(g, x, y, 1, 3, col); px(g, x, y + 3, dk); if (x > 21 && x % 2) px(g, x, y - 1 - ((x - 21) >> 1), col); }
    px(g, 28, 7, D.clothD); px(g, 29, 8, D.clothD); px(g, 2, 9, D.cloth); px(g, 11, 10, D.cloth);                  // the fray
    for (let x = 0; x < 30; x++) if (x % 5 === 1) px(g, x, 9 + (x % 2), SAND[x % 3 ? 0 : 1]);
    outline(c, OUT); return c; })();
  // THE GREAT RIBCAGE is baked by desert2.js (bakeGreatRibcage); it is drawn as a backdrop here: see drawWreckage in main.js
  return { crateStack, rockPile, brokenWheel, tornCanvas };
}

// ---------------- THE DUNE WORM: sand breath, ward, grit, piers ----------------
/* THE SAND BREATH as grains: a cone from the mouth (mx, my) out `reach` px along `f` (+1/-1) to the floor `fy`, `k` 0..1 how far it has run, `t` time.
   Two-pixel grains in four sand tones, densest at the mouth, thinning to a ragged dithered edge; no polygon, no alpha. */
export function drawSandBreath(g, mx, my, f, reach, k, fy, hCone, t) {
  const R = reach * k, N = 150;
  for (let i = 0; i < N; i++) {
    const a = (i * 0.6180339 + Math.floor(t * 14) * 0.137 * ((i % 3) + 1)) % 1;        // along the cone, the grains re-roll ~14 times a second (a sandstorm's flicker)
    const b = ((i * 0.7548776 + Math.floor(t * 14) * 0.31) % 1);                       // across it
    const d = Math.pow(a, 0.8) * R, spread = 4 + (d / Math.max(1, reach)) * (fy - my + hCone * 0.3);
    const x = mx + f * d, y = my + (b - 0.35) * spread * 1.6 + (d / Math.max(1, reach)) * (fy - my) * 0.6;
    if (y > fy) continue;
    const dense = 1 - d / Math.max(1, reach) * 0.6;
    if (b > dense + 0.15) continue;
    g.fillStyle = SAND[(i % 4 === 0) ? 3 : (i % 3)]; g.fillRect(Math.round(x), Math.round(y), (i & 1) ? 2 : 1, (i & 2) ? 2 : 1);
  }
  g.fillStyle = SAND[1]; for (let s = 0; s < 6; s++) g.fillRect(Math.round(mx + f * (s * 4 + 2)), Math.round(my + (s % 2) * 2 - 2), 3, 2);   // the solid plume at the lip
}
/* THE WARD (B3/B10): a shell of running sand over his hide - a dotted ellipse in pixels, the dots walking round it; violet is the shared WARDED colour */
export function drawWardShell(g, x, y, rx, ry, t) {
  const n = 36; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + t * 2.2; if (i % 3 === Math.floor(t * 6) % 3) continue;
    const px0 = Math.round(x + Math.cos(a) * rx), py0 = Math.round(y + Math.sin(a) * ry);
    g.fillStyle = (i % 4 === 0) ? '#efe2ff' : '#c9b0e0'; g.fillRect(px0, py0, 2, 2); if (i % 6 === 0) { g.fillStyle = '#7a5fa0'; g.fillRect(px0 + 1, py0 + 2, 1, 2); } }
}
/* GRIT IN YOUR EYES: an ordered 4x4 dither of sand closing in from the edges, strongest at the corners, and a few streaks that run with the wind */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export function drawGrit(g, VW, VH, k, t) {
  const cell = 4, cx = VW / 2, cy = VH / 2, maxd = Math.hypot(cx, cy), jit = Math.floor(t * 10);
  for (let y = 0; y < VH; y += cell) for (let x = 0; x < VW; x += cell) {
    const dd = Math.hypot(x - cx, (y - cy) * 1.5) / maxd;                             // 0 centre .. 1 corner
    const lvl = Math.max(0, (dd - 0.4) / 0.6) * k * 12 + k * 1;                      // 0..13
    const th = BAYER[((y / cell + jit) & 3) * 4 + ((x / cell) & 3)];
    if (lvl > th) { g.fillStyle = (x + y) % 8 ? '#c8a064' : '#e2bb7a'; g.fillRect(x, y, cell, cell); }
  }
  g.fillStyle = 'rgba(242,215,156,0.8)'; for (let i = 0; i < 24; i++) g.fillRect(Math.round((i * 97 + t * 320) % VW), Math.round((i * 53 + t * 36) % VH), 3, 1);
}
/* THE RISING LEDGES' PIERS: two short masonry piers under a slab, coursed (a bright rim, a dark joint every 4 rows), drawn BEHIND the play. `top` is the slab's
   y, `fy` the sand; clipped by the caller. */
export function drawLedgePiers(g, x0, w, top, fy, TS) {
  for (const px0 of [x0 + 2, x0 + w - 9]) { const y0 = top + TS, h = fy - y0; if (h <= 0) continue;
    g.fillStyle = OUT; g.fillRect(px0 - 1, y0, 9, h + 1);
    g.fillStyle = SL.mid; g.fillRect(px0, y0, 7, h);
    g.fillStyle = SL.lit; g.fillRect(px0, y0, 2, h); g.fillStyle = SL.dark; g.fillRect(px0 + 5, y0, 2, h);
    g.fillStyle = SL.deep; for (let y = y0 + 3; y < fy - 1; y += 4) g.fillRect(px0, y, 7, 1);
    g.fillStyle = SL.top; g.fillRect(px0 - 1, y0, 9, 1);
  }
}

// ---------------- THE DUNE SLIDES: wind ripples on the steep face ----------------
/* baked once per slide from the level's own grid: a transparent overlay from the crest column to the foot column, ripple dashes of the sand's own darker and lighter tones a few px
   under the surface (the wind has combed the lee face), so the hill reads as a SLIDE before a hero touches it. Returns { c, x0, y0 } (x0, y0 in px) or null. */
import { heightAt } from '../slopes.js';
export function bakeSlideRipples(grid, W, H, TS, c0, c1) {
  const isS = t => t >= 20 && t <= 25;
  const tops = [], rows = [];
  for (let x = c0; x <= c1; x++) { let ty = -1; for (let y = 0; y < H; y++) { const t = grid[y * W + x]; if (t !== 0 && t !== 8 && t !== 9) { ty = y; break; } } if (ty < 0) return null; tops.push([ty, grid[ty * W + x]]); rows.push(ty); }
  const r0 = Math.min(...rows) - 1, r1 = Math.max(...rows) + 1, w = (c1 - c0 + 1) * TS, h = (r1 - r0 + 1) * TS, [c, g] = canvas(w, h);
  for (let i = 0; i < tops.length; i++) { const [ty, t] = tops[i]; if (!isS(t)) continue;
    for (let px0 = 0; px0 < TS; px0++) { const sy = (ty - r0) * TS + Math.round(heightAt(t, px0 + 0.5)), gx = i * TS + px0, n = i * TS + px0;
      // three combed bands under the lip: a dark dash, a light dash, a dark dash - spaced so they do not line up (a hand-drawn ripple, not a stripe)
      if ((n + 3) % 9 < 4) { g.fillStyle = D.duneD; g.fillRect(gx, sy + 3, 1, 1); }
      if ((n + 7) % 11 < 3) { g.fillStyle = D.duneL; g.fillRect(gx, sy + 6, 1, 1); }
      if ((n + 1) % 13 < 5) { g.fillStyle = D.duneD; g.fillRect(gx, sy + 9, 1, 1); } } }
  return { c, x0: c0 * TS, y0: r0 * TS };
}

// ---------------- QUICKSAND: the trap's own read ----------------
/* THE QUICKSAND, TEACH -> EXAM (Daniel 10-09): it must read as a different, wrong kind of ground from fifty tiles off. Three tile sets x 4 frames, 16x16, drawn over the level's quicksand
   zone (L.quicksand): a wet, darker body that deepens toward the bottom row, a pale crust lip with a sheen that moves, a slow whirl of ring segments turning in on themselves and
   a bubble that breaks every few frames; the END tiles (L, R) have the dune wall dropping in at the pit's edge, so the pit has a mouth, not a seam. */
export function bakeQuicksandTiles() {
  const out = { L: [], M: [], R: [] };
  for (const kind of ['L', 'M', 'R']) for (let f = 0; f < 4; f++) {
    const [c, g] = canvas(16, 16), r = mulberry(7700 + f * 13 + (kind === 'M' ? 0 : kind === 'L' ? 1 : 2));
    rect(g, 0, 0, 16, 16, D.qs);
    rect(g, 0, 6, 16, 4, D.qsD); rect(g, 0, 10, 16, 6, '#7a5030');                                                // deepening: lit crust, brown body, wet dark bottom
    for (let i = 0; i < 26; i++) px(g, (r() * 16) | 0, 3 + ((r() * 12) | 0), r() < 0.4 ? D.qsL : (r() < 0.5 ? D.qsD : '#6a4428'));
    rect(g, 0, 0, 16, 1, D.qsD); rect(g, 0, 1, 16, 1, D.qsW);                                                      // the lip: a dark seam, then the pale crust sheen
    for (let x = f * 3; x < 16; x += 7) px(g, x, 1, '#f0d8a8');                                                    // sheen glints walk along the crust
    // the whirl: two ring arcs (an upper and a lower) turning in on themselves, drawn as 3-px dashes that shift a step a frame
    for (const [ry, rx, ph] of [[5, 6, 0], [10, 5, 2]]) for (let a = 0; a < 12; a++) { const t = (a / 12 + (f + ph) / 8) * Math.PI * 2, x = 8 + Math.round(Math.cos(t) * rx), y = ry + Math.round(Math.sin(t) * (ry === 5 ? 1.2 : 1.6));
      if ((a + f) % 3 !== 0 && x >= 0 && x < 16) px(g, x, y, ry === 5 ? D.qsW : D.qsL); }
    if (f === 1) { px(g, 4, 4, D.qsW); px(g, 5, 4, D.qsL); px(g, 4, 3, D.qsW); }                                  // a bubble swells...
    if (f === 2) { px(g, 4, 3, '#f0d8a8'); px(g, 3, 4, D.qsD); px(g, 6, 4, D.qsD); }                               // ...and breaks
    // the mouth: the dune wall falling into the pit at each end
    if (kind !== 'M') { const L2 = kind === 'L';
      for (let y = 0; y < 16; y++) { const w = Math.max(0, 5 - Math.floor(y * 0.34)); for (let x = 0; x < w; x++) px(g, L2 ? x : 15 - x, y, x === w - 1 ? D.duneD : (y < 4 ? D.dune : '#c89a62')); }
      px(g, L2 ? 5 : 10, 0, D.duneL); px(g, L2 ? 4 : 11, 0, D.duneL); }
    out[kind].push(c); }
  return out;
}
