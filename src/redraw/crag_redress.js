// ============================================================================================
// THE CRAG REDRESS (docs/visual-audit.md): Scree Path, the Hanging Village and Stormhold share one grey gravel slab, one purple
// dusk sky and one set of purple hills, so they read as one place. This gives each its own sky and backdrops, and all three a
// ground that is ROCK (layered strata, grass that wraps its corners, stones, cracks) instead of a slab. Not wired in.
//
// It is built to the game's own plumbing so wiring is config, not code:
//   bakeCragGround(theme)  -> the SET2 shape resolveTiles() reads (main.js ~701): { top: {'00','01','10','11': [4]}, edge: {'01','10',
//                             '11': [2]}, fill: [4], silt: [3], wet: [3], ledge: [3], ledgeL, ledgeR } - one of 'scree' | 'hanging' | 'storm'
//   bakeCragSky(theme, h)  -> a 16 x h strip (BG.sky)
//   bakeCragFar(theme)     -> 320 x 90 (BG.far: the same size as bakeFarCrags)
//   bakeCragMid(theme)     -> 480 x 140 (BG.mid, as bakeMidCrags)
//   bakeCragNear(theme)    -> 640 x 300 (BG.near, as bakeNearCrag): mostly clear, big near shapes at the foot
//   bakeCragProps(theme)   -> { pine, boulder, cairn, tuft, flowers, post, thorn } and CRAG_KITS[theme] (dressing kinds + density)
// THE LIGHT: Scree is DUSK (a low sun from the west: warm rims on west faces, long violet shade), the Hanging Village is MORNING (a
// cool clear light, pale stone), Stormhold is STORM (slate, the rims lit by lightning, not sun).
// ============================================================================================
import { canvas, px, rect, fillPoly, line, ellipse, circle, mulberry } from '../px.js';

const T = 16;
export const CRAG_PAL = {
  scree: { r: ['#8a7a70', '#9c8b7e', '#7a6a62', '#6c5d56'], crack: '#4a3e3a', peb: '#b0a090', pebD: '#5e514a', soil: '#4a3a30', grass: '#7a8a3a', grassL: '#b0bc50', grassD: '#4e5a2a', rim: '#d8aa7c', shade: '#5a4a58', mud: '#5e4a3a', mudL: '#8a7058', water: '#6a6a8a', plank: '#6e6258', plankL: '#a09080', plankD: '#443a34' },
  hanging: { r: ['#7a6e62', '#8c8072', '#6a5e54', '#584e46'], crack: '#3e362e', peb: '#b0a490', pebD: '#4e463e', soil: '#3e3228', grass: '#5e9a44', grassL: '#8ccc5c', grassD: '#3a6a2e', rim: '#f0e6cc', shade: '#6a6a7e', mud: '#5a5044', mudL: '#8a7e6a', water: '#7a9ab8', plank: '#7e7a70', plankL: '#b4b0a2', plankD: '#4e4a44' },
  storm: { r: ['#5a5e68', '#686c76', '#4e525c', '#42454e'], crack: '#2e3038', peb: '#848894', pebD: '#383a42', soil: '#2e2c30', grass: '#4a6a4a', grassL: '#6e9068', grassD: '#2e4430', rim: '#a8bcd0', shade: '#34384a', mud: '#3a3a40', mudL: '#5a5a64', water: '#4a5a70', plank: '#50535c', plankL: '#7c808c', plankD: '#2c2e34' },
};
const tile = fn => { const [c, g] = canvas(T, T); fn(g); return c; };
const wave = (x, s) => Math.round(Math.sin((x + s * 7) * 0.45) * 0.8 + Math.sin((x + s * 3) * 0.19) * 0.9);
/* THE ROCK: strata four rows deep that wave a pixel or two and carry on across tiles (the band depends on the world row, not the
   tile), speckle, now and then a pebble set in it or a crack running down */
function strata(g, P, rnd, s, y0 = 0) {
  const band = [P.r[0], P.r[1], P.r[0], P.r[2], P.r[0], P.r[3]];
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) px(g, x, y, band[(((y + y0 + wave(x, s) + 24) / 4) | 0) % band.length]);
  for (let k = 0; k < 10; k++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, rnd() < 0.5 ? P.r[3] : P.r[1]);
  if (rnd() < 0.18) { const x = 3 + ((rnd() * 9) | 0), y = 5 + ((rnd() * 8) | 0); rect(g, x, y, 3, 2, P.peb); px(g, x + 2, y + 1, P.pebD); }   /* now and then a stone set in the rock */
  if (rnd() < 0.12) { let x = 3 + ((rnd() * 10) | 0); for (let y = (rnd() * 6) | 0, n = 0; n < 6; y++, n++) { px(g, x, y, P.crack); if (rnd() < 0.4) x += rnd() < 0.5 ? -1 : 1; } }
}
function topTile(P, seed, eL, eR) { const rnd = mulberry(seed);
  return tile(g => { strata(g, P, rnd, seed, 6);
    const depth = []; for (let x = 0; x < T; x++) depth.push(3 + ((rnd() * 2.2) | 0));
    for (let x = 0; x < T; x++) { rect(g, x, depth[x], 1, 2, P.soil); rect(g, x, 0, 1, depth[x], P.grass); px(g, x, depth[x] - 1, P.grassD); }
    for (let x = 0; x < T; x++) if (rnd() < 0.55) px(g, x, 0, P.grassL); for (let k = 0; k < 3; k++) px(g, (rnd() * T) | 0, 1, P.grassL);
    if (rnd() < 0.35) { const x = 2 + ((rnd() * 12) | 0); px(g, x, 1, '#e8e0a0'); }                                  /* a flower in the turf */
    /* an open side: the corner rounded off, the grass lipping over it, the rock face under lit (west, at dusk/morning) or shaded */
    for (const [open, side] of [[eL, 0], [eR, 1]]) { if (!open) continue; const x = side ? T - 1 : 0, xi = side ? T - 2 : 1;
      g.clearRect(x, 0, 1, 1); rect(g, x, 1, 1, 4, P.grassD); px(g, x, 5, P.grassD); px(g, xi, 5, P.grass);
      rect(g, x, 6, 1, T - 6, side ? P.r[3] : P.rim); if (!side) rect(g, xi, 7, 1, T - 7, P.r[1]); } }); }
function edgeTile(P, seed, eL, eR) { const rnd = mulberry(seed);
  return tile(g => { strata(g, P, rnd, seed, 0);
    if (eL) { rect(g, 0, 0, 1, T, P.rim); rect(g, 1, 0, 1, T, P.r[1]); if (rnd() < 0.6) { const y = 3 + ((rnd() * 9) | 0); rect(g, 0, y, 2, 2, P.grassD); px(g, 0, y, P.grass); } }
    if (eR) { rect(g, T - 1, 0, 1, T, P.r[3]); rect(g, T - 2, 0, 1, T, P.shade); if (rnd() < 0.5) { const y = 4 + ((rnd() * 8) | 0); ellipse(g, T - 2, y, 1.4, 1.2, P.pebD); } } }); }
function fillTile(P, seed) { const rnd = mulberry(seed); return tile(g => strata(g, P, rnd, seed, 0)); }
function siltTile(P, seed, wet) { const rnd = mulberry(seed);
  return tile(g => { rect(g, 0, 0, T, T, P.mud); for (let k = 0; k < 18; k++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, rnd() < 0.5 ? P.mudL : P.soil);
    if (wet) { rect(g, 0, 0, T, 2, P.grassD); for (let x = 0; x < T; x++) if (rnd() < 0.4) px(g, x, 0, P.grass); ellipse(g, 6 + ((rnd() * 4) | 0), 5, 3, 1, P.water); } }); }
/* THE LEDGE: a slab of the same rock jutting out, a lit top, its underside in shade, chipped at an end */
function slab(P, seed, end) { const rnd = mulberry(seed);
  return tile(g => { const x0 = end === 'L' ? 1 : 0, x1 = end === 'R' ? T - 1 : T;
    rect(g, x0, 3, x1 - x0, 6, P.plank); rect(g, x0, 3, x1 - x0, 1, P.plankL); rect(g, x0, 8, x1 - x0, 1, P.plankD); rect(g, x0, 9, x1 - x0, 2, P.shade);
    for (let k = 0; k < 5; k++) px(g, x0 + ((rnd() * (x1 - x0)) | 0), 4 + ((rnd() * 4) | 0), rnd() < 0.5 ? P.plankD : P.plankL);
    if (end === 'L') { g.clearRect(x0, 3, 1, 1); g.clearRect(x0, 8, 1, 3); } if (end === 'R') { g.clearRect(x1 - 1, 3, 1, 1); g.clearRect(x1 - 1, 8, 1, 3); }
    if (rnd() < 0.5) rect(g, x0 + 2 + ((rnd() * 8) | 0), 3, 3, 1, P.grass); }); }
export function bakeCragGround(theme = 'scree') {
  const P = CRAG_PAL[theme], s0 = { scree: 8800, hanging: 8900, storm: 9000 }[theme], top = {}, edge = {};
  for (const eL of [0, 1]) for (const eR of [0, 1]) { const k = eL + '' + eR; top[k] = [0, 1, 2, 3].map(i => topTile(P, s0 + i * 3 + eL * 11 + eR * 17, eL, eR)); if (eL || eR) edge[k] = [0, 1].map(i => edgeTile(P, s0 + 40 + i + eL * 5 + eR * 7, eL, eR)); }
  return { top, edge, fill: [0, 1, 2, 3].map(i => fillTile(P, s0 + 60 + i)), silt: [0, 1, 2].map(i => siltTile(P, s0 + 70 + i, false)), wet: [0, 1, 2].map(i => siltTile(P, s0 + 75 + i, true)),
    ledge: [0, 1, 2].map(i => slab(P, s0 + 80 + i, null)), ledgeL: slab(P, s0 + 85, 'L'), ledgeR: slab(P, s0 + 86, 'R') };
}

// ---------------- THE SKIES ----------------
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function bandSky(h, bands) { const [c, g] = canvas(16, h), n = bands.length, step = h / n;
  for (let y = 0; y < h; y++) { const f = y / step, i = Math.min(n - 1, Math.floor(f)), t = f - i; for (let x = 0; x < 16; x++) { const k = (t - 0.6) / 0.4, nx = i + 1 < n && k > 0 && BAYER[(y & 3) * 4 + (x & 3)] / 16 < k; px(g, x, y, bands[nx ? i + 1 : i]); } }
  return c; }
export function bakeCragSky(theme = 'scree', h = 180) {
  return bandSky(h, { scree: ['#3a2c5a', '#5a3a6a', '#8a4a6a', '#c0606a', '#e08a6a', '#f2b87a', '#f8d898'],        // dusk: violet over rose over amber
    hanging: ['#6a9ad0', '#86b0dc', '#a6c6e2', '#c8dce6', '#e6e2d6', '#f6dcc0'],                                    // morning: clear blue to a peach horizon
    storm: ['#1e2230', '#2a2e3e', '#363a4c', '#44485a', '#545a6a', '#6a7080'] }[theme]); }                          // storm: slate, lighter where the rain is

// ---------------- THE FAR RANGE (320 x 90, tiles across) ----------------
const per = (w, k, x, p = 0) => Math.sin(x / w * Math.PI * 2 * k + p);
function range(g, W, H, hf, body, lip, snow, snowLine) { for (let x = 0; x < W; x++) { const t = Math.round(hf(x)); rect(g, x, t, 1, H - t, body); px(g, x, t, lip); if (snow && t < snowLine) { const d = Math.min(snowLine - t, 3 + ((x * 7) % 5)); rect(g, x, t, 1, d, snow); } } }
export function bakeCragFar(theme = 'scree') {
  const W = 320, H = 90, [c, g] = canvas(W, H);
  if (theme === 'scree') { circle(g, 236, 60, 9, '#ffe8b0'); circle(g, 236, 60, 7, '#fff6d8');                          // the low sun, behind the range
    range(g, W, H, x => 44 + 12 * per(W, 2, x) + 8 * per(W, 5, x, 1) + 4 * per(W, 11, x), '#a67890', '#c898a8', '#e8c8d0', 44);
    range(g, W, H, x => 60 + 10 * per(W, 3, x, 2) + 5 * per(W, 7, x) , '#7e5a7e', '#a07a98', null, 0); }
  else if (theme === 'hanging') { range(g, W, H, x => 38 + 16 * per(W, 2, x, 0.5) + 6 * per(W, 6, x) + 3 * per(W, 13, x), '#9ab0c8', '#c0d0e0', '#f4f6fa', 44);
    range(g, W, H, x => 58 + 9 * per(W, 3, x, 1) + 5 * per(W, 8, x, 2), '#7e94ae', '#a0b4c8', '#e0e8f0', 56); }
  else { range(g, W, H, x => 34 + 18 * Math.abs(per(W, 3, x)) + 8 * per(W, 9, x) + 5 * per(W, 17, x), '#2c3040', '#8a9ab8', null, 0);   // jagged, lit at the rim by the lightning
    range(g, W, H, x => 56 + 10 * per(W, 4, x, 1) + 6 * per(W, 11, x, 2), '#222634', '#3e4458', null, 0);
    for (let k = 0; k < 3; k++) { let x = 60 + k * 110, y = 0; while (y < 40) { const nx = x + (((x * 13 + y * 7) % 5) - 2); line(g, x, y, nx, y + 5, '#c8d8f0'); x = nx; y += 5; } } }   // a bolt behind the peaks
  return c; }

// ---------------- THE MIDDLE DISTANCE (480 x 140) ----------------
function pine(g, x, base, h, col, colL) { for (let k = 0; k < h; k++) { const w = Math.max(1, Math.round((k / h) * h * 0.34)); rect(g, x - w, base - h + k, w * 2 + 1, 1, (k % 4 === 0) ? colL : col); } rect(g, x, base, 1, 2, col); }
export function bakeCragMid(theme = 'scree') {
  const W = 480, H = 140, [c, g] = canvas(W, H);
  if (theme === 'scree') {
    range(g, W, H, x => 62 + 18 * per(W, 2, x, 0.3) + 8 * per(W, 5, x) + 3 * per(W, 13, x), '#6a4e6a', '#b0788a', null, 0);    // the foothills, west faces warm
    for (let k = 0; k < 6; k++) { const x0 = 30 + k * 80; for (let y = 0; y < 50; y++) { const w = 2 + (y >> 2); for (let x = 0; x < w; x += 2) px(g, x0 + x - (y >> 3), 80 + y, '#8a6a7e'); } }   // scree fans down the slopes
    for (let k = 0; k < 26; k++) { const x = (k * 37 + 11) % W, b = 90 + ((k * 13) % 40); pine(g, x, b, 12 + (k % 4) * 3, '#3e3448', '#54465e'); }
    rect(g, 330, 58, 10, 26, '#5a4458'); rect(g, 328, 56, 14, 3, '#6e5470'); rect(g, 333, 64, 3, 5, '#2a2030'); px(g, 334, 66, '#ffc860');   // a ruined watchtower, one lamp still lit
  } else if (theme === 'hanging') {
    range(g, W, H, x => 18 + 8 * per(W, 3, x) + 4 * per(W, 11, x, 1), '#7e7468', '#b0a490', null, 0);                          // the cliff face the village hangs on (warm, and a step darker than the sky)
    for (let k = 0; k < 16; k++) { const y = 34 + k * 7, x0 = (k * 71) % W; for (let x = 0; x < 90 + (k % 3) * 30; x++) { px(g, (x0 + x) % W, y + Math.round(Math.sin(x * 0.1) * 1.5), '#a8a498'); px(g, (x0 + x) % W, y + 1 + Math.round(Math.sin(x * 0.1) * 1.5), '#6e6c66'); } }   // ledges along the strata, lit over shaded
    for (let k = 0; k < 40; k++) { const x = (k * 97) % W, y = 30 + (k * 43) % 100; rect(g, x, y, 3 + (k % 3), 2, k % 2 ? '#6e8a4c' : '#587040'); }   // moss and scrub in the cracks
    for (let k = 0; k < 12; k++) { let x = (k * 41 + 9) % W; for (let y = 24 + (k * 17) % 40, n = 0; n < 30; y++, n++) { px(g, x, y, '#5e5c58'); if (n % 5 === 0) x += (k % 2) ? 1 : -1; } }   // cracks down the face
    const houses = [[30, 60], [70, 40], [120, 72], [170, 50], [230, 30], [280, 66], [340, 44], [400, 70], [440, 36]];
    for (const [x, y] of houses) { rect(g, x, y, 22, 16, '#a08462'); rect(g, x, y, 22, 2, '#c09a70'); fillPoly(g, [[x - 2, y], [x + 11, y - 8], [x + 24, y]], '#7a4a3a'); rect(g, x + 4, y + 5, 3, 4, '#ffd070'); rect(g, x + 14, y + 5, 3, 4, (x % 3) ? '#ffd070' : '#3a2e28');
      line(g, x + 2, y + 16, x - 4, y + 30, '#6a5040'); line(g, x + 20, y + 16, x + 26, y + 30, '#6a5040'); }                  // stilts into the rock
    for (let k = 0; k < houses.length - 1; k++) { const [x0, y0] = houses[k], [x1, y1] = houses[k + 1]; for (let s = 0; s <= 20; s++) { const t = s / 20; px(g, x0 + 22 + (x1 - x0 - 22) * t, y0 + 10 + (y1 - y0) * t + Math.sin(t * Math.PI) * 6, '#5a4430'); } }   // rope bridges
  } else {
    range(g, W, H, x => 70 + 10 * per(W, 2, x) + 5 * per(W, 7, x, 1), '#262a38', '#4a5268', null, 0);
    const wall = (x0, x1, y) => { rect(g, x0, y, x1 - x0, 60, '#343848'); for (let x = x0; x < x1; x += 6) rect(g, x, y - 3, 3, 3, '#343848'); rect(g, x0, y, x1 - x0, 1, '#5a6278'); };
    wall(120, 360, 58); for (const [x, h] of [[120, 40], [200, 56], [300, 48], [356, 38]]) { rect(g, x - 6, 58 - h, 14, h, '#3a3e50'); for (let k = 0; k < 14; k += 5) rect(g, x - 6 + k, 58 - h - 3, 3, 3, '#3a3e50'); rect(g, x - 1, 58 - h + 8, 3, 5, (x % 2) ? '#ffcf70' : '#1e2028'); }
    line(g, 200, 2, 200, 8, '#5a6278'); fillPoly(g, [[200, 2], [212, 4], [200, 6]], '#8a3a3a');                                 // the hold's banner, torn
    for (let k = 0; k < 120; k++) { const x = (k * 53) % W, y = (k * 29) % H; line(g, x, y, x - 2, y + 6, '#5a6680'); }        // rain
  }
  return c; }

// ---------------- THE NEAR SHAPES (640 x 300: clear but for the foot) ----------------
export function bakeCragNear(theme = 'scree') {
  const W = 640, H = 300, [c, g] = canvas(W, H), P = CRAG_PAL[theme], dark = { scree: '#3a2c3a', hanging: '#4e4c50', storm: '#1a1c24' }[theme], lit = { scree: '#6a4a52', hanging: '#76747a', storm: '#3a4050' }[theme];
  for (const [x, w, h] of [[0, 70, 150], [180, 50, 90], [330, 90, 120], [520, 80, 170]]) {                                   /* buttresses and boulders standing up out of the foot */
    fillPoly(g, [[x, H], [x + 6, H - h + 20], [x + w * 0.4, H - h], [x + w * 0.8, H - h + 14], [x + w, H]], dark);
    line(g, x + 6, H - h + 20, x + w * 0.4, H - h, lit); }
  if (theme !== 'hanging') for (let k = 0; k < 10; k++) { const x = 20 + k * 64 + ((k * 17) % 30); pine(g, x, H - 20 - ((k * 23) % 40), 30 + (k % 3) * 12, dark, lit); }
  else for (const [x, top] of [[20, H - 140], [350, H - 110], [545, H - 160]]) { for (let y = top; y < H; y += 6) rect(g, x, y, 8, 1, '#5a4430'); rect(g, x, top, 1, H - top, '#5a4430'); rect(g, x + 7, top, 1, H - top, '#5a4430'); }   // ladders up the buttresses, from their tops
  if (theme === 'storm') for (let k = 0; k < 200; k++) { const x = (k * 67) % W, y = (k * 41) % H; line(g, x, y, x - 3, y + 9, '#4a5670'); }
  rect(g, 0, H - 16, W, 16, dark);
  return c; }

// ---------------- THE DRESSING ----------------
export function bakeCragProps(theme = 'scree') {
  const P = CRAG_PAL[theme], mk = (w, h, fn) => { const [c, g] = canvas(w, h); fn(g); return c; };
  return {
    pine: mk(14, 26, g => { for (let k = 0; k < 22; k++) { const w = Math.round(k * 0.3); rect(g, 7 - w, k, w * 2 + 1, 1, k % 5 === 0 ? P.grassL : k % 2 ? P.grassD : P.grass); } rect(g, 6, 22, 2, 4, P.soil); }),
    boulder: mk(16, 11, g => { ellipse(g, 8, 6, 7, 5, P.r[2]); ellipse(g, 6, 4, 4, 2.5, P.r[1]); px(g, 5, 3, P.rim); rect(g, 2, 9, 12, 2, P.shade); px(g, 11, 7, P.crack); }),
    cairn: mk(9, 13, g => { ellipse(g, 4, 11, 4, 2, P.r[2]); ellipse(g, 4, 8, 3, 1.6, P.r[1]); ellipse(g, 4, 5, 2.4, 1.4, P.r[0]); ellipse(g, 4, 2, 1.6, 1.2, P.peb); px(g, 3, 1, P.rim); }),
    tuft: mk(8, 5, g => { for (const [x, h] of [[1, 3], [3, 5], [4, 4], [6, 3]]) { rect(g, x, 5 - h, 1, h, P.grass); px(g, x, 5 - h, P.grassL); } }),
    flowers: mk(8, 6, g => { for (const [x, h, c] of [[1, 4, '#e8d060'], [4, 6, theme === 'storm' ? '#8a9ab8' : '#e090b0'], [6, 3, '#f0f0e0']]) { rect(g, x, 6 - h, 1, h, P.grassD); px(g, x, 6 - h, c); } }),
    post: mk(8, 14, g => { rect(g, 3, 2, 2, 12, P.plank); px(g, 3, 2, P.plankL); line(g, 4, 5, 8, 4, P.plankD); line(g, 0, 9, 3, 8, P.plankD); }),
    thorn: mk(14, 10, g => { for (let k = 0; k < 7; k++) line(g, 7, 9, 1 + k * 2, 1 + (k % 3) * 2, P.grassD); for (let k = 0; k < 6; k++) px(g, 2 + k * 2, 2 + (k % 2) * 3, P.crack); }),
  };
}
export const CRAG_KITS = {
  scree: { kinds: ['tuft', 'tuft', 'flowers', 'boulder', 'cairn', 'pine', 'post'], density: 0.34 },
  hanging: { kinds: ['tuft', 'flowers', 'flowers', 'pine', 'post', 'boulder'], density: 0.3 },
  storm: { kinds: ['tuft', 'thorn', 'boulder', 'cairn', 'post'], density: 0.28 },
};
