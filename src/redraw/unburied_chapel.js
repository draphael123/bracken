// unburied_chapel.js - THE CHAPEL OF THE FALLEN ORDER and the fort it stands in (claude/unburiedart): the destination of "a siege that never ended".
//   THE LANDMARK (drawFort): a low-parallax chapel-fort on its hill - curtain wall, gatehouse, a bell tower, one lit window - on the skyline from the first screen, growing as you come
//   THE WALL (facade 'ubwall', cols 326-376): the Order's curtain wall and gatehouse standing IN the play layer behind the tiles, banners red and gold (the Order's colours on the chapel,
//     the host's slate in the west: Daniel 10-03), arrow slits, a lit window, the breach in the yard wall; the Rider's PORT (tiles) is the portcullis in the gate arch
//   THE NAVE (facade 'ubnave', cols 360-433): the yard's broken west wall, the nave's back wall with lancet windows lit ember, buttresses, broken roof trusses against the sky, pews against the wall,
//     the crypt door at the ambush, the crypt tomb (on piers: R.structures)
//   THE APSE (facade 'ubapse', cols 434-479): the arena - the apse, the altar, a ROSE WINDOW in cold violet glass behind the Death Knight (never red, never green: his tells are), the two tomb ledges on piers (R.structures)
//     built into the wall, moonlight through the broken roof
//   THE GREAT STANDARD (facade 'ubstandard'): the host's war banner on its barrow, 30 rows tall
import { K, canvas, px, rect, fillPoly, line, circle, ellipse, outline, beam, post, wheel, pennant, rnd } from './unburied_art.js';

const alpha = (g, a, fn) => { g.globalAlpha = a; fn(); g.globalAlpha = 1; };
/* coursed ashlar over a box: blocks 12-20 wide, 7 high, mortar dark, a few paler or darker, the top edge lit */
function ashlar(g, x, y, w, h, base, lit, dark, seed, deepK = 0) {
  const r = rnd(seed); rect(g, x, y, w, h, dark);
  for (let row = 0, yy = y; yy < y + h; row++, yy += 8) { let xx = x - ((row * 7 + seed) % 14); while (xx < x + w) { const bw = 12 + ((r() * 9) | 0), t = r(); const x0 = Math.max(x, xx + 1), x1 = Math.min(x + w, xx + bw);
    if (x1 > x0) { rect(g, x0, yy + 1, x1 - x0, Math.min(7, y + h - yy - 1), t < 0.2 ? lit : t < 0.35 ? dark : base); rect(g, x0, yy + 1, x1 - x0, 1, t < 0.3 ? lit : base); } xx += bw; } }
  if (deepK) alpha(g, deepK, () => rect(g, x, y, w, h, '#000'));
}
const merlons = (g, x, y, w, base, lit, dark, every = 20, mw = 12, mh = 10, gaps = []) => { for (let xx = x; xx < x + w - mw + 1; xx += every) { if (gaps.some(([a, b]) => xx + mw > a && xx < b)) continue; rect(g, xx, y - mh, mw, mh, base); rect(g, xx, y - mh, mw, 1, lit); rect(g, xx + mw - 1, y - mh, 1, mh, dark); } };
/* a lancet window: a pointed arch of width w and height h, glass in `glass` (top lit), lead lines, a stone surround; lit: it glows */
function lancet(g, x, y, w, h, glass, surround, lead) {
  const pts = []; for (let i = 0; i <= w; i++) { const t = (i / w) * 2 - 1, top = (1 - Math.pow(Math.abs(t), 1.7)) * w * 0.62; pts.push([x + i, y + (w * 0.62 - top)]); }
  fillPoly(g, [[x - 2, y + h], ...pts.map(([a, b]) => [a, b - 1]), [x + w + 2, y + h]], surround);
  fillPoly(g, [[x, y + h], ...pts, [x + w, y + h]], glass[0]);
  fillPoly(g, [[x + 2, y + h - 2], ...pts.map(([a, b], i) => [a + (i < w / 2 ? 2 : -2), b + 3]), [x + w - 2, y + h - 2]], glass[1]);
  rect(g, x + (w >> 1), y + 3, 1, h - 3, lead); for (let yy = y + (w >> 1); yy < y + h; yy += 12) rect(g, x, yy, w, 1, lead); rect(g, x, y + h - 1, w, 2, surround);
}

// ================================================================ THE LANDMARK (the far layer) ================================================================
let FORT = null, fortHidden = false;
export const hideFort = b => { fortHidden = !!b; };
const FW = 190, FH = 120;
/* the fort baked once at its base size (190 x 120): a hill, a curtain wall with merlons, a gatehouse between two towers, the chapel's gable and its bell tower with a spire, the Order's red banner, one lit window */
function bakeFort() {
  const [c, g] = canvas(FW, FH), r = rnd(11);
  fillPoly(g, [[0, FH], [0, 100], [24, 90], [60, 82], [100, 78], [150, 84], [190, 98], [190, FH]], '#241b30');   /* the hill */
  const wall = '#2c2238', wallL = '#6a4a58';
  rect(g, 26, 62, 138, 26, wall); merlons(g, 26, 62, 138, wall, wallL, '#1a1424', 14, 8, 6); rect(g, 26, 62, 138, 1, wallL);   /* the curtain wall and its merlons */
  rect(g, 18, 40, 22, 52, wall); fillPoly(g, [[16, 40], [29, 22], [42, 40]], '#1e1628'); line(g, 16, 40, 29, 22, wallL); rect(g, 18, 40, 22, 1, wallL);   /* the west tower and its cone */
  rect(g, 72, 34, 38, 54, wall); merlons(g, 72, 34, 38, wall, wallL, '#1a1424', 10, 6, 6); rect(g, 72, 34, 38, 1, wallL); fillPoly(g, [[84, 88], [84, 66], [91, 58], [98, 66], [98, 88]], '#0c0812');   /* the gatehouse and its arch */
  for (const x of [78, 100]) rect(g, x, 46, 2, 7, '#0c0812');
  rect(g, 112, 46, 56, 18, '#271e34'); fillPoly(g, [[108, 48], [140, 26], [172, 48]], '#1e1628'); line(g, 108, 48, 140, 26, wallL); line(g, 140, 26, 172, 48, '#4a3248');   /* the chapel's nave and its gable */
  for (const x of [118, 126, 154, 162]) fillPoly(g, [[x, 62], [x, 52], [x + 2, 49], [x + 4, 52], [x + 4, 62]], '#0c0812');   /* lancets, dark */
  rect(g, 138, 16, 22, 50, wall); rect(g, 140, 14, 18, 3, wallL); fillPoly(g, [[138, 16], [149, 0], [160, 16]], '#1a1424'); line(g, 138, 16, 149, 0, wallL);   /* the bell tower, its spire */
  rect(g, 144, 24, 10, 12, '#0c0812'); rect(g, 148, 28, 3, 6, '#3a2a44');   /* the belfry and a bell */
  rect(g, 149, -0, 1, 3, '#a8342c');
  /* the one lit window, and the Order's banner hung from the gatehouse */
  rect(g, 143, 44, 4, 9, '#ffb050'); rect(g, 144, 45, 2, 6, '#ffe0a0'); alpha(g, 0.2, () => { rect(g, 140, 41, 10, 15, '#ffb050'); });
  rect(g, 90, 36, 2, 20, '#8a2a28'); rect(g, 87, 36, 8, 14, '#a8342c'); fillPoly(g, [[87, 50], [91, 55], [95, 50]], '#a8342c'); rect(g, 90, 40, 2, 7, '#d8b04a'); rect(g, 88, 43, 6, 2, '#d8b04a');
  for (let i = 0; i < 40; i++) px(g, (r() * FW) | 0, 70 + ((r() * 40) | 0), '#1a1424');
  /* a haze at the foot: the distance eats it */
  const gr = g.createLinearGradient(0, 60, 0, FH); gr.addColorStop(0, 'rgba(150,100,110,0)'); gr.addColorStop(1, 'rgba(170,110,110,0.55)'); g.globalCompositeOperation = 'source-atop'; g.fillStyle = gr; g.fillRect(0, 0, FW, FH); g.globalCompositeOperation = 'source-over';
  return c;
}
/* where the fort is on the screen for a camera at camX: it climbs from far and small (col 0) to near and large (col 300+), drifting toward the middle of the screen */
export function fortRect(camX, VW, VH) {
  const p = Math.max(0, Math.min(1, camX / 5800)), s = 0.46 + 1.0 * p, w = Math.round(FW * s), h = Math.round(FH * s), x = Math.round(VW - w - 4 - 70 * (1 - p) + 8 * p - 40 * p), y = Math.round(VH - 52 - h * 0.86);
  return { x, y, w, h, s };
}
/* the fort in the far layer, over the ridge, under the mid layer (main.js calls it between them) */
export function drawFort(g, cx, cy, VW, VH, time) {
  if (fortHidden) return; if (!FORT) FORT = bakeFort();
  const R = fortRect(cx, VW, VH); g.imageSmoothingEnabled = true; g.globalAlpha = 0.92; g.drawImage(FORT, R.x, R.y, R.w, R.h); g.globalAlpha = 1; g.imageSmoothingEnabled = false;
  const k = 0.75 + 0.25 * Math.sin(time * 1.7), wx = R.x + R.w * (145 / FW), wy = R.y + R.h * (48 / FH);   /* its one window breathes a little */
  g.globalAlpha = 0.16 * k; g.fillStyle = '#ffb050'; g.fillRect(Math.round(wx - 4 * R.s), Math.round(wy - 5 * R.s), Math.round(10 * R.s), Math.round(13 * R.s)); g.globalAlpha = 1;
}

// ================================================================ THE WALL AND GATEHOUSE (cols 326-376, rows 18-36) ================================================================
/* facade [326, 376, 18, 36]: 51 x 19 tiles = 816 x 304. Origin (326, 18). The curtain wall behind the Rider's barrow ground, the gatehouse towers either side of the gate arch (355-357),
   the yard wall beyond, breached at 366-370. The tiles carry the arch's lintel and the portcullis (T.PORT at 356) */
export function bakeWall(o = {}) {
  /* (claude/unburied4) o.gap = [col, n]: the bailey was cut in at col, n wide - everything east of it slides n east, and what spans it (the yard wall) runs on across it as the inner ward's wall */
  const [gc, gn] = o.gap || [9999, 0], W = (51 + gn) * 16, H = 19 * 16, [c, g] = canvas(W, H), r = rnd(326), X = col => (col - 326 + (col >= gc ? gn : 0)) * 16, Y = row => (row - 18) * 16;
  const wl = '#4a4648', wb = '#3a3638', wd = '#242022';
  /* the curtain wall: west of the gatehouse, tall, with a wall-walk and merlons, a long dark seam where a siege engine's stone struck */
  ashlar(g, X(326), Y(25), X(351) - X(326), Y(37) - Y(25), wb, wl, wd, 3); merlons(g, X(326), Y(25), X(351) - X(326), wb, wl, wd, 24, 14, 10, [[X(338), X(342)]]); rect(g, X(326), Y(25), X(351) - X(326), 2, '#64605e');
  for (const x of [X(331), X(345)]) { rect(g, x, Y(28), 3, 12, '#0e0a0c'); }   /* arrow slits */
  alpha(g, 0.3, () => { for (let i = 0; i < 5; i++) { const x = X(327) + i * 90 + ((i * 37) % 30); rect(g, x, Y(27) + 4, 2, 60, '#000'); } });   /* weather streaks */
  /* the gatehouse: two towers of ashlar, taller than the wall, machicolated, with the red banners */
  for (const [a, b] of [[351, 355], [358, 362]]) { const x0 = X(a), x1 = X(b);
    ashlar(g, x0, Y(19), x1 - x0, Y(37) - Y(19), '#403c3e', '#5a5658', wd, a, 0.04); rect(g, x0 - 4, Y(19) - 6, x1 - x0 + 8, 8, '#524e50'); merlons(g, x0 - 4, Y(19) - 6, x1 - x0 + 8, '#4a4648', '#6a6668', wd, 16, 10, 9);
    for (let i = 0; i < (x1 - x0 - 4) / 7; i++) rect(g, x0 - 2 + i * 7 + 2, Y(19) + 2, 3, 5, '#0e0a0c');   /* machicolations */
    rect(g, x0 + 26, Y(23), 4, 18, '#0e0a0c'); rect(g, x0 + 26, Y(31), 4, 12, '#0e0a0c'); }
  /* the lit window in the east tower (warm: the Order's hearth) and the banners of the Order, red and gold, long and still */
  rect(g, X(360) + 2, Y(26), 8, 14, '#ffb050'); rect(g, X(360) + 4, Y(26) + 2, 4, 9, '#ffe0a0'); rect(g, X(360) + 5, Y(26), 1, 14, '#6a4a30'); rect(g, X(360), Y(26) - 2, 12, 2, '#524e50');
  for (const [bx, by, hh] of [[X(352) + 6, Y(22), 56], [X(359) + 4, Y(22), 64]]) { rect(g, bx - 4, by - 3, 18, 2, K.wood3); fillPoly(g, [[bx - 3, by - 1], [bx + 13, by - 1], [bx + 13, by + hh], [bx + 5, by + hh - 9], [bx - 3, by + hh]], K.red2); rect(g, bx - 3, by - 1, 2, hh, K.red1); rect(g, bx + 8, by + 8, 3, 26, K.gold2); rect(g, bx + 2, by + 17, 14, 3, K.gold2); }
  /* the gate arch: the pointed stone frame the portcullis hangs in, the dark of the passage in it */
  const ax0 = X(355), ax1 = X(358), ay = Y(32);
  /* (claude/unburied4, Daniel 10-05 "this is floating": the gallery and the drawbridge's walk crossed the gap between the two towers with the sky under them - the gatehouse had
     no middle. It has one now: the gate passage's block of ashlar between the towers, from the wall-walk down to the arch, with the portcullis slot and two murder holes in it) */
  ashlar(g, ax0, Y(21), ax1 - ax0, Y(37) - Y(21), '#3a3638', '#504c4e', wd, 355, 0.04); rect(g, ax0, Y(21), ax1 - ax0, 2, '#5a5658');
  rect(g, ax0 + 6, Y(27), ax1 - ax0 - 12, 3, '#0e0a0c'); for (const mx of [ax0 + 12, ax1 - 16]) rect(g, mx, Y(25), 4, 4, '#0e0a0c');
  fillPoly(g, [[ax0 - 6, Y(37)], [ax0 - 6, ay - 8], [(ax0 + ax1) / 2, ay - 40], [ax1 + 6, ay - 8], [ax1 + 6, Y(37)]], '#5a5658');
  fillPoly(g, [[ax0, Y(37)], [ax0, ay - 4], [(ax0 + ax1) / 2, ay - 32], [ax1, ay - 4], [ax1, Y(37)]], '#0e0a0c');
  for (let i = 0; i < 9; i++) { const t = i / 8, x = ax0 - 6 + (ax1 - ax0 + 12) * t; px(g, Math.round(x), ay - 8 - Math.round(Math.sin(t * Math.PI) * 30), '#8a8688'); }
  /* the yard wall beyond: lower, breached at 366-370 - its stones lie across the foot, the chapel's gable standing behind the gap */
  ashlar(g, X(362), Y(29), X(366) - X(362), Y(37) - Y(29), wb, wl, wd, 9); ashlar(g, X(371), Y(29), X(377) - X(371), Y(37) - Y(29), wb, wl, wd, 11);
  merlons(g, X(362), Y(29), X(366) - X(362), wb, wl, wd, 20, 12, 8); merlons(g, X(371), Y(29), X(377) - X(371), wb, wl, wd, 20, 12, 8);
  fillPoly(g, [[X(366), Y(29)], [X(366) + 6, Y(32)], [X(367), Y(35)], [X(368) + 8, Y(33)], [X(370), Y(30)], [X(371), Y(29)], [X(371), Y(37)], [X(366), Y(37)]], wd);   /* the breach, dark */
  for (let i = 0; i < 14; i++) { const x = X(365) + ((r() * 100) | 0), y = Y(37) - 6 - ((r() * 12) | 0), w = 8 + ((r() * 10) | 0); rect(g, x, y, w, 6, i % 3 ? wb : wl); rect(g, x, y, w, 1, '#6a6668'); }   /* the stones that came down */
  /* the Order's old standard-bearer's cairn and a fallen scaling ladder against the west curtain */
  line(g, X(340), Y(37), X(345), Y(24), K.wood3, 2); line(g, X(342), Y(37), X(347), Y(24), K.wood3, 2); for (let k = 0; k < 8; k++) line(g, X(340) + k * 0.7 + 1, Y(36) - k * 24 / 2 + 2, X(342) + k * 0.7, Y(36) - k * 24 / 2 + 3, K.wood5);
  return outline(c, '#120c10');
}

// ================================================================ THE BREACH (claude/unburied4: the bailey's east end, its facade [b62..b71, rows 24-36]) ================================================================
/* facade 10 x 13 tiles = 160 x 208, origin (b62, 24). The tiles carry the breach itself (b64-b69, rows G-2..G: the inner wall's rubble). Drawn behind them: the broken stump of the inner
   gate tower rising out of the rubble, and on it, STANDING ON IT (posts down onto the wall's top), the Order's timber hoarding where its dead bowmen stand (row 29: drawn live), with the
   Order's red banner hung under it. Origin x: X(k) = (k - 62) * 16 for bailey column k; Y(row) = (row - 24) * 16 */
export function bakeBreach() {
  const W = 10 * 16, H = 13 * 16, [c, g] = canvas(W, H), X = k => (k - 62) * 16, Y = row => (row - 24) * 16;
  const wb = '#3a3638', wl = '#524e50', wd = '#221e20';
  /* the gate tower's stump: ashlar from the breach up to a ragged top at row 25-26 */
  ashlar(g, X(64), Y(26), X(70) - X(64), H - Y(26), wb, wl, wd, 64);
  fillPoly(g, [[X(64), Y(26)], [X(65), Y(25)], [X(67), Y(26) - 4], [X(68), Y(25)], [X(70), Y(26)], [X(70), Y(27)], [X(64), Y(27)]], wb);
  rect(g, X(66) + 4, Y(31), 4, 14, '#0e0a0c'); rect(g, X(68) + 6, Y(32), 3, 10, '#0e0a0c');   /* arrow slits */
  /* THE HOARDING: a deck at row 30's top on four posts that stand on the rubble (row 34's top), braced; a rail; the banner under it */
  for (const x of [X(64) + 2, X(66) + 8, X(68) + 4, X(70) - 4]) { rect(g, x, Y(30), 4, Y(34) - Y(30), K.wood2); rect(g, x, Y(30), 1, Y(34) - Y(30), K.wood4); }
  rect(g, X(63) + 8, Y(30), X(70) - X(63) - 8, 5, K.wood3); rect(g, X(63) + 8, Y(30), X(70) - X(63) - 8, 1, K.wood5); rect(g, X(63) + 8, Y(30) + 4, X(70) - X(63) - 8, 1, K.wood0);
  for (let x = X(63) + 10; x < X(70) - 2; x += 6) rect(g, x, Y(29), 2, 16, K.wood2); rect(g, X(63) + 8, Y(29), X(70) - X(63) - 8, 2, K.wood3);   /* its rail */
  line(g, X(64) + 4, Y(32) + 10, X(66) + 8, Y(30) + 4, K.wood3, 2); line(g, X(68) + 6, Y(32) + 10, X(70) - 4, Y(30) + 4, K.wood3, 2);   /* braces */
  { const bx = X(66) + 14, by = Y(30) + 5, hh = 40; fillPoly(g, [[bx, by], [bx + 14, by], [bx + 14, by + hh], [bx + 7, by + hh - 8], [bx, by + hh]], K.red2); rect(g, bx, by, 2, hh, K.red1); rect(g, bx + 6, by + 6, 3, 22, K.gold2); rect(g, bx + 2, by + 13, 11, 3, K.gold2); }   /* the Order's red */
  return outline(c, '#120c10');
}

// ================================================================ THE NAVE (cols 360-433, rows 12-36) ================================================================
/* facade [360, 433, 12, 36]: 74 x 25 tiles = 1184 x 400. Origin (360, 12). Floor at y 400 (row 37's top). Walls end ragged at rows 19-22; the roof is a few trusses and the sky */
export function bakeNave() {
  const W = 74 * 16, H = 25 * 16, [c, g] = canvas(W, H), r = rnd(360), X = col => (col - 360) * 16, Y = row => (row - 12) * 16;
  const wb = '#383436', wl = '#524e50', wd = '#221e20';
  /* THE YARD'S WEST WALL STUB (360-377): the chapel's west front, broken: a doorway arch and a stump of wall to the left, nothing above row 23 */
  ashlar(g, X(371), Y(24), X(378) - X(371), Y(37) - Y(24), wb, wl, wd, 5); fillPoly(g, [[X(371), Y(24)], [X(373), Y(21)], [X(375), Y(23)], [X(378), Y(22)], [X(378), Y(24)]], wb);
  fillPoly(g, [[X(373), Y(37)], [X(373), Y(30)], [X(374.5), Y(27)], [X(376), Y(30)], [X(376), Y(37)]], '#0c0810'); line(g, X(373), Y(30), X(374.5), Y(27), '#78747a'); line(g, X(374.5), Y(27), X(376), Y(30), '#78747a');
  /* THE NAVE'S BACK WALL (378-433): ragged top, lancet windows lit ember between buttresses, a string course */
  const top = col => Y(19) + Math.round(Math.sin(col * 0.9) * 14 + Math.sin(col * 0.31) * 20);
  for (let x = X(378); x < X(434); x += 2) { const t = top(x / 16 + 360); rect(g, x, t, 2, H - t, ((x >> 3) + 1) % 2 ? wb : '#3e3a3c'); }
  for (let y = Y(22); y < H; y += 8) for (let x = X(378); x < X(434); x += 14) { const o = (y >> 3) % 2 ? 7 : 0; px(g, x + o, y, wd); rect(g, x + o + 6, y, 1, 7, wd); }   /* courses, drawn in the mortar */
  rect(g, X(378), Y(27), X(434) - X(378), 2, wl); rect(g, X(378), Y(27) + 2, X(434) - X(378), 1, wd);   /* the string course */
  for (const col of [383, 394, 405, 416]) { const x = X(col) - 12; lancet(g, x, Y(21), 24, 84, ['#ff9a40', '#ffd890'], '#6a6668', '#3a2410'); alpha(g, 0.1, () => fillPoly(g, [[x, Y(21) + 84], [x + 24, Y(21) + 84], [x + 70, H], [x - 50, H]], '#ffb050')); }
  for (const col of [377, 388, 399, 410, 421, 433]) { const x = X(col) - 10; rect(g, x, Y(21), 20, H - Y(21), '#3e3a3c'); rect(g, x, Y(21), 2, H - Y(21), wl); rect(g, x + 18, Y(21), 2, H - Y(21), wd); rect(g, x - 3, Y(21) - 2, 26, 4, wl); }   /* the buttresses */
  /* THE ROOF: five trusses, three whole, two broken; a purlin or two; a few slate patches clinging to rafters - the sky is behind all of it */
  for (const [col, broken] of [[383, 0], [394, 1], [405, 0], [416, 1], [428, 0]]) { const cx = X(col), base = Y(19) + 6, rise = 8 * 16 - 10, hw = 80;
    beam(g, cx - hw, base, cx - 4, base - rise, 4, K.wood2, K.wood4); if (!broken) beam(g, cx + hw, base, cx + 4, base - rise, 4, K.wood2, K.wood4); else { beam(g, cx + hw, base, cx + hw - 38, base - rise * 0.46, 4, K.wood2, K.wood4); px(g, cx + hw - 38, base - rise * 0.46, K.wood6); }
    beam(g, cx - hw + 6, base, cx + (broken ? 30 : hw - 6), base, 4, K.wood3, K.wood5); line(g, cx, base - rise + 6, cx, base - 6, K.wood2, 2); line(g, cx - 4, base - rise + 4, cx - hw / 2, base - 4, K.wood2); if (!broken) line(g, cx + 4, base - rise + 4, cx + hw / 2, base - 4, K.wood2); }
  for (let i = 0; i < 9; i++) { const col = 380 + i * 6, cx = X(col) + ((i * 11) % 30); if (((i * 7) % 3) === 0) continue; for (let k = 0; k < 4; k++) rect(g, cx + k * 6, Y(19) - 42 + k * 12 + ((i * 5) % 8), 7, 4, i % 2 ? '#2a2630' : '#322e3a'); }
  /* THE CRYPT DOOR at the ambush's west wall: an arched door of black oak and iron, chained shut, a lamp bracket by it */
  const dx = X(379), dy = Y(31);
  fillPoly(g, [[dx - 3, H], [dx - 3, dy + 6], [dx + 21, dy - 14], [dx + 45, dy + 6], [dx + 45, H]], '#6a6668'); fillPoly(g, [[dx, H], [dx, dy + 8], [dx + 21, dy - 10], [dx + 42, dy + 8], [dx + 42, H]], '#1a1210');
  for (let x = dx + 4; x < dx + 40; x += 8) rect(g, x, dy + 2, 1, H - dy - 2, '#2a1c14'); rect(g, dx, dy + 18, 42, 3, K.iron1); rect(g, dx, dy + 18, 42, 1, K.iron3); rect(g, dx, dy + 36, 42, 3, K.iron1); line(g, dx + 6, dy + 18, dx + 36, dy + 38, K.iron2); line(g, dx + 36, dy + 18, dx + 6, dy + 38, K.iron2);   /* the chain across */
  /* PEWS against the wall, in two long ranks east of the ambush, a few thrown over: low dark oak benches with their backs to the wall */
  for (const [a, b] of [[408, 416], [422, 432]]) for (let x = X(a); x < X(b) - 10; x += 36) { const o = ((x * 7) % 3), by = H - 14, tip = (x / 36 | 0) % 4 === 1;
    if (tip) { fillPoly(g, [[x, by + 12], [x + 30, by + 6], [x + 32, by + 10], [x + 2, by + 14]], K.wood2); rect(g, x + 2, by - 4, 4, 14, K.wood3); continue; }
    rect(g, x, by + 4, 30, 4, K.wood3); rect(g, x, by + 4, 30, 1, K.wood5); rect(g, x + 2, by + 8, 3, 6, K.wood1); rect(g, x + 25, by + 8, 3, 6, K.wood1); rect(g, x, by - 6 + o, 30, 3, K.wood2); rect(g, x + 2, by - 3 + o, 3, 7, K.wood1); rect(g, x + 25, by - 3 + o, 3, 7, K.wood1); }
  /* THE CRYPT TOMB (the ledge at 380-384, row 34) */
  /* (claude/unburied4: its corbels stood out of the wall over nothing - the lid stands on two piers now, R.structures 'ubpier', drawn in the play layer by src/redraw/unburied_siege.js drawPier) */
  return outline(c, '#120c10');
}

// ================================================================ THE APSE (cols 434-479, rows 6-36) ================================================================
/* facade [434, 479, 6, 36]: 46 x 31 tiles = 736 x 496. Origin (434, 6). The nave's east end where the Death Knight holds the room: an apse with a rose window of COLD VIOLET glass, an altar, side
   arcades into the dark, the two tomb-shelves on their piers, the vault broken open to the moon. Nothing red or green and bright stands here: his tells are those colours */
export function bakeApse() {
  const W = 46 * 16, H = 31 * 16, [c, g] = canvas(W, H), r = rnd(434), X = col => (col - 434) * 16, Y = row => (row - 6) * 16;
  const wb = '#34303c', wl = '#4e4a58', wd = '#1e1a26';   /* the stone gone cold: a violet-grey, not the nave's warm one */
  /* the back wall: the apse's half-round recess (cols 452-468), flat arcade wings either side, ragged at the top where the vault fell */
  const top = x => Y(11) + Math.round(Math.sin(x * 0.045) * 16 + Math.sin(x * 0.017) * 22);
  for (let x = 0; x < W; x += 2) { const t = top(x) - (x > X(450) - X(434) && x < X(470) - X(434) ? 70 : 0); rect(g, x, t, 2, H - t, ((x >> 3) % 2) ? wb : '#38343f'); }
  for (let y = Y(16); y < H; y += 8) for (let x = 0; x < W; x += 14) { const o = (y >> 3) % 2 ? 7 : 0; px(g, x + o, y, wd); rect(g, x + o + 6, y, 1, 7, wd); }
  /* the half-dome of the recess: a darker ribbed niche */
  const nx0 = X(452), nx1 = X(469), ncx = (nx0 + nx1) / 2, nr = (nx1 - nx0) / 2;
  fillPoly(g, [[nx0, H], [nx0, Y(17)], ...Array.from({ length: 17 }, (_, i) => { const a = Math.PI - (i / 16) * Math.PI; return [ncx + Math.cos(a) * nr, Y(17) - Math.sin(a) * nr * 0.9]; }), [nx1, Y(17)], [nx1, H]], '#16121e');
  for (let k = 1; k < 5; k++) { const a = Math.PI - (k / 5) * Math.PI; line(g, ncx, Y(17), ncx + Math.cos(a) * nr, Y(17) - Math.sin(a) * nr * 0.9, '#2a2436'); }   /* the ribs */
  /* THE ROSE WINDOW: in the face of the wall above the recess - a ring of stone, twelve petals of cold violet glass, a pale hub; centre (ncx, Y(15)), radius 40 */
  const rx = ncx, ry = Y(14), R0 = 40;
  circle(g, rx, ry, R0 + 5, '#5a566a'); circle(g, rx, ry, R0 + 3, '#2a2636'); circle(g, rx, ry, R0, K.vio1);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, a2 = (i + 1) / 12 * Math.PI * 2, glass = [K.vio2, K.vio3, K.vio2, K.vio4][i % 4];
    fillPoly(g, [[rx + Math.cos(a) * 9, ry + Math.sin(a) * 9], [rx + Math.cos(a) * (R0 - 2), ry + Math.sin(a) * (R0 - 2)], [rx + Math.cos((a + a2) / 2) * (R0 + 0), ry + Math.sin((a + a2) / 2) * (R0 + 0)], [rx + Math.cos(a2) * (R0 - 2), ry + Math.sin(a2) * (R0 - 2)], [rx + Math.cos(a2) * 9, ry + Math.sin(a2) * 9]], glass); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(g, rx + Math.cos(a) * 9, ry + Math.sin(a) * 9, rx + Math.cos(a) * R0, ry + Math.sin(a) * R0, K.vio0); }
  for (const rr of [14, 26]) for (let a = 0; a < 360; a += 4) px(g, rx + Math.cos(a * Math.PI / 180) * rr, ry + Math.sin(a * Math.PI / 180) * rr, K.vio0);
  circle(g, rx, ry, 8, K.vio0); circle(g, rx, ry, 6.5, '#8a76c8'); circle(g, rx, ry, 3, '#c8b6ff');   /* the hub: pale violet */
  /* THE ALTAR in the recess: a stone table under a dark cloth, a broken cross above it, two tall stands whose flames burn a cold white-violet (never the Death Knight's colours) */
  const ax0 = X(458), ax1 = X(463) + 16, ay = H - 36;
  rect(g, ax0, ay, ax1 - ax0, 36, '#4a4658'); rect(g, ax0 - 4, ay - 4, ax1 - ax0 + 8, 5, '#6a667a'); rect(g, ax0 - 4, ay - 4, ax1 - ax0 + 8, 1, '#8a869a'); rect(g, ax0 + 2, ay + 2, ax1 - ax0 - 4, 14, '#1e1a2a');
  for (let x = ax0 + 6; x < ax1 - 6; x += 8) rect(g, x, ay + 2, 1, 14, '#2a2638');
  rect(g, ncx - 2, ay - 40, 4, 38, '#5a566a'); rect(g, ncx - 12, ay - 30, 24, 4, '#5a566a'); line(g, ncx - 2, ay - 40, ncx - 6, ay - 52, '#5a566a', 2);   /* the cross, snapped */
  for (const cxl of [ax0 - 20, ax1 + 14]) { rect(g, cxl, ay - 20, 3, 56, '#3a3648'); rect(g, cxl - 4, ay - 24, 11, 4, '#5a566a'); fillPoly(g, [[cxl - 1, ay - 24], [cxl + 1.5, ay - 38], [cxl + 4, ay - 24]], '#d8d0ff'); fillPoly(g, [[cxl, ay - 24], [cxl + 1.5, ay - 32], [cxl + 3, ay - 24]], '#ffffff'); }
  /* the wings' arcades: pointed arches on short piers into the dark of the side aisles, cold lancets above them */
  for (const [a, b] of [[436, 450], [470, 478]]) for (let col = a; col <= b - 4; col += 6) { const x = X(col); fillPoly(g, [[x, H], [x, Y(28)], [x + 24, Y(23)], [x + 48, Y(28)], [x + 48, H]], '#14101c'); line(g, x, Y(28), x + 24, Y(23), '#6a667a'); line(g, x + 24, Y(23), x + 48, Y(28), '#6a667a'); rect(g, x - 5, Y(27), 6, H - Y(27), '#4e4a58'); rect(g, x - 5, Y(27), 1, H - Y(27), '#7a768a'); }
  for (const col of [438, 445, 474]) lancet(g, X(col), Y(14), 20, 66, ['#5a4ca0', '#9a8ae0'], '#5a566a', '#1e1a30');
  /* THE TOMB-SHELVES (the ledges at 442-445 and 462-465, row 34) */
  /* (claude/unburied4, Daniel 10-05: "floating things" - the stepped corbels read as pedestals hung in the air in front of the dark arcades. Each lid stands on two stone piers now,
     R.structures 'ubpierCold', drawn in the play layer by src/redraw/unburied_siege.js drawPier) */
  /* MOONLIGHT through the broken vault: three long pale shafts down onto the floor, faint, cold (drawn here, behind the actors) */
  for (const [x, w, k] of [[X(441), 36, 0.1], [X(456), 50, 0.12], [X(472), 30, 0.09]]) alpha(g, k, () => fillPoly(g, [[x, 0], [x + w, 0], [x + w + 90, H], [x + 60, H]], '#c8d2ff'));
  return outline(c, '#120c14');
}

// ================================================================ THE GREAT STANDARD (on the Rider's barrow, col 338) ================================================================
/* facade [333, 346, 4, 36]: 14 x 33 tiles = 224 x 528. Origin (333, 4). The host's great war banner: a pole thirty rows tall on the barrow, a banner of slate cloth with the raven, torn, its hem burning
   (the fire itself is live: L.ubFires). Pole at x = X(338) */
export function bakeStandard() {
  const W = 14 * 16, H = 33 * 16, [c, g] = canvas(W, H), px0 = 5 * 16 + 8, r = rnd(338);
  rect(g, px0 - 2, 8, 5, H - 8, K.wood2); rect(g, px0 - 2, 8, 1, H - 8, K.wood4); rect(g, px0 + 2, 8, 1, H - 8, K.wood0);
  for (let y = 40; y < H - 20; y += 60) { rect(g, px0 - 3, y, 7, 3, K.iron1); px(g, px0 - 1, y, K.iron3); }
  fillPoly(g, [[px0 - 5, 8], [px0 + 5, 8], [px0, -2]], K.gold2); circle(g, px0, 4, 3, K.gold3);
  rect(g, px0 - 2, 14, 66, 3, K.wood3);   /* the crossbar */
  const bx = px0 + 2, by = 18, bw = 62, bh = 170;
  for (let x = 0; x < bw; x++) { const tear = x > bw - 18 ? ((x * 5 + 3) % 13) : 0, len = bh - tear - Math.round(Math.sin(x * 0.4) * 5); rect(g, bx + x, by, 1, len, x < 6 ? K.slate3 : (x + ((by + x) >> 4)) % 9 === 0 ? K.slate0 : K.slate1); }
  rect(g, bx, by, bw, 3, K.slate3);
  for (let k = 0; k < 3; k++) rect(g, bx + 4 + k * 20, by + 6, 2, bh - 24 - k * 11, K.slate0);   /* the folds */
  /* the raven, wings spread, in black with a silver slash across it */
  fillPoly(g, [[bx + 12, by + 62], [bx + 31, by + 48], [bx + 50, by + 62], [bx + 38, by + 60], [bx + 31, by + 72], [bx + 24, by + 60]], K.raven); circle(g, bx + 31, by + 54, 5, K.raven); fillPoly(g, [[bx + 33, by + 52], [bx + 41, by + 55], [bx + 33, by + 57]], K.silver);
  line(g, bx + 6, by + 100, bx + 56, by + 30, K.silver);
  for (let i = 0; i < 9; i++) px(g, bx + ((r() * bw) | 0), by + bh - 24 + ((r() * 22) | 0), K.fire2);   /* the hem going to embers */
  return outline(c, K.out);
}

export function bakeFacade(kind, o) {
  if (kind === 'ubwall') return bakeWall(o || {});
  if (kind === 'ubbreach') return bakeBreach();
  if (kind === 'ubnave') return bakeNave();
  if (kind === 'ubapse') return bakeApse();
  if (kind === 'ubstandard') return bakeStandard();
  return null;
}
