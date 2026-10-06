// unburied_siege.js - THE UNBURIED FIELD's SIEGE WORKS (claude/unburiedart): the engines, the cover and the structures. "A siege that never ended": every engine is still loaded.
//   THE TOPPLED SIEGE TOWER, drawn (a facade over cols 228-264: its hide-covered shell, its broken floors, the wheels; the five beams ARE its decks, the peg wall at 246 its hide side)
//   THE BALLISTA BATTERY: one timber gun-deck on trestles (drawTrestle for R.structures kind 'ubtrestle'), bolt racks, dead ballistae, a broken one hanging off the edge, mantlets,
//   the wrecked mangonel frames the two catapult-arm swings hang from
//   THE ENGINES YOU WORK, baked and drawn live by drawField: ballista, trebuchet (frame, windlass, sling, counterweight box, stone pile), siege oil on its cart with a brazier,
//   the MANGONEL (a low frame and a spoon arm - not the trebuchet's shape) and the bowmen's palisade on the far bank
//   COVER, no crate shapes: wheeled pavises, a supply wagon, the overturned cart, the ghost shieldmen
import { K, canvas, px, rect, fillPoly, line, circle, ellipse, outline, beam, post, wheel, sack, pennant, flame, planks, rnd } from './unburied_art.js';

const alpha = (g, a, fn) => { g.globalAlpha = a; fn(); g.globalAlpha = 1; };
const shadow = (g, cx, y, rx) => alpha(g, 0.28, () => ellipse(g, cx, y, rx, 2, '#000000'));
const hideTone = ['#5a4a3e', '#74604c', '#907a62'];
/* a timber of the siege: a thick stroke from (x0, y0) to (x1, y1) with its lit edge, its dark underside and a nail at each end */
function timber(g, x0, y0, x1, y1, th = 4, wet = false) { beam(g, x0, y0, x1, y1, th, wet ? K.wood1 : K.wood2); line(g, x0, y0, x1, y1, wet ? K.wood3 : K.wood4); px(g, x0 + 1, y0 + 1, K.iron3); px(g, x1 - 1, y1 + th - 2, K.iron3); }
/* a strip of wet hide hung from a line, ragged at the foot */
function hidePanel(g, x, y, w, h, seed) { const r = rnd(seed); rect(g, x, y, w, h, hideTone[1]); for (let i = 0; i < 6; i++) rect(g, x + ((r() * (w - 4)) | 0), y + ((r() * (h - 4)) | 0), 3 + ((r() * 6) | 0), 3 + ((r() * 6) | 0), hideTone[(r() * 3) | 0]);
  for (let i = 0; i < w; i += 3) rect(g, x + i, y + h, 2, 1 + ((r() * 5) | 0), hideTone[0]); rect(g, x, y, w, 2, K.wood3); for (let i = 2; i < w; i += 6) px(g, x + i, y + 1, K.iron4); }

// ================================================================ THE TOPPLED SIEGE TOWER ================================================================
/* the facade over cols 228..264 x rows 17..36 (592 x 320 px). Origin (228, 17). The tower's body is cols 246..258 (the hide wall on the west, the fallen base on the east); the
   floors that came down are the five decks, stepping to the west, propped on what is left of its legs. Painted BEHIND the tiles: the tiles carry the hide wall and the base */
export function bakeTower() {
  const W = 37 * 16, H = 20 * 16, [c, g] = canvas(W, H), r = rnd(228), X = col => (col - 228) * 16, Y = row => (row - 17) * 16;
  /* THE INSIDE: dark wet planking between the hide wall and the base, ragged at the top where the crown was torn off */
  const x0 = X(246), x1 = X(259);
  for (let x = x0; x < x1; x++) { const top = Y(18) + 6 + ((Math.sin(x * 0.7) * 6 + Math.sin(x * 0.23) * 9) | 0) + (x > x1 - 40 ? -8 : 0); rect(g, x, top, 1, H - top, (x >> 2) % 2 ? '#2e2218' : '#36281c'); }
  for (let x = x0 + 5; x < x1; x += 10) rect(g, x, Y(18) + 20, 1, H, '#1e1610');
  /* the floors that are still there: heavy beams across the inside, the east ends held, the west ends snapped off */
  for (const [row, a, b] of [[21, 250, 258], [24, 248, 256], [27, 248, 258], [30, 252, 258], [33, 249, 258]]) {
    const ya = Y(row) + 8; timber(g, X(a), ya, X(b), ya, 6); for (let x = X(a) + 6; x < X(b); x += 14) rect(g, x, ya + 6, 3, 8, K.wood1);   /* the joists under */
    for (let k = 0; k < 4; k++) px(g, X(a) + (r() * 6) | 0, ya + 1 + k % 2, K.wood6); }   /* the splintered end */
  /* the frame: posts and X braces, a timber broken at the top */
  for (const col of [247, 252, 257]) { const bx = X(col) + 6; timber(g, bx, Y(18) + ((col * 7) % 24), bx, H, 5); }
  for (const [ca, cb, ra, rb] of [[248, 252, 28, 34], [252, 256, 22, 28], [249, 253, 23, 29]]) { timber(g, X(ca), Y(ra), X(cb), Y(rb), 3); timber(g, X(cb), Y(ra), X(ca), Y(rb), 3); }
  /* THE CROWN: the fighting platform's hoarding, torn, with the host's raven pennant hung off it (the host built this tower; the Order's wall stopped it) */
  for (let i = 0; i < 6; i++) { const bx = x0 + 6 + i * 31, th = 12 + ((i * 5) % 14); timber(g, bx, Y(18) - 4 - th, bx, Y(18) + 14, 4); if (i % 2) rect(g, bx - 8, Y(18) - 6 - th, 22, 2, K.wood4); }
  hidePanel(g, x0 + 40, Y(18) + 6, 46, 30, 3); hidePanel(g, x0 + 130, Y(18) + 12, 40, 26, 5);
  rect(g, x0 + 96, Y(18) - 36, 1, 50, K.wood2); fillPoly(g, [[x0 + 97, Y(18) - 36], [x0 + 128, Y(18) - 30], [x0 + 97, Y(18) - 20]], K.raven); line(g, x0 + 98, Y(18) - 31, x0 + 118, Y(18) - 29, K.silver);
  /* THE DECKS ON THE WEST: the five that fell, propped at their free ends on the stubs of the tower's legs, with a ladder hanging between them */
  for (const [a, b, row] of [[236, 240, 33], [241, 245, 30], [241, 245, 24]]) {
    const yy = Y(row) + 9; for (const px0 of [X(a) + 6, X(b) + 4]) { timber(g, px0, yy, px0 + ((px0 % 2) ? 6 : -6), yy + 36, 4, true); }
    timber(g, X(a), yy + 2, X(b) + 14, yy + 12, 3, true); line(g, X(a) + 6, yy, X(b) + 4, yy + 18, K.wood1); }
  for (let k = 0; k < 7; k++) { const lx = X(242) + k * 2, ly = Y(25) + k * 14; line(g, lx, ly, lx + 24, ly + 3, K.wood4); }   /* a ladder, hanging, rungs */
  line(g, X(242), Y(25), X(242) + 4, Y(30), K.wood3); line(g, X(242) + 24, Y(25) + 3, X(242) + 28, Y(30) + 2, K.wood3);
  /* THE WHEELS: one half sunk at the foot with its spokes broken, one thrown up on the debris with its axle */
  wheel(g, X(243) + 4, H - 14, 28, 10, 0.2, K.wood3, K.iron2, 4);
  /* (claude/unburied4: the second wheel hung in the sky at row 26 beside the crest, "thrown up on the debris" with no debris under it - Daniel 10-05. It lies on the ground now,
     against the fallen base, its broken axle in the spoil; and the crest ledge it hid is held by a knee brace into the base) */
  wheel(g, X(262) + 2, H - 21, 20, 8, 0.6, K.wood3, K.iron2, 3); timber(g, X(262) + 2, H - 21, X(264) + 6, H - 4, 4); alpha(g, 0.6, () => ellipse(g, X(262) + 2, H - 2, 18, 3, K.peat3));
  timber(g, X(262) + 10, Y(22) + 2, X(259), Y(25) + 8, 4); timber(g, X(260) + 4, Y(22) + 2, X(259), Y(23) + 10, 3); rect(g, X(259), Y(22), X(263) - X(259), 4, K.wood2);
  /* the foot: splintered timbers and a heap of hides, the host's fallen scaling ladders against the base */
  for (let i = 0; i < 9; i++) { const bx = X(245) + i * 27, by = H - 6 - ((i * 7) % 12); timber(g, bx, by, bx + 26 - ((i * 5) % 14), by - 10 + ((i * 9) % 18), 3, i % 2 === 0); }
  for (let i = 0; i < 5; i++) hidePanel(g, X(249) + i * 22, H - 18 - (i % 2) * 6, 20, 12, 20 + i);
  return outline(c, K.out);
}

// ================================================================ THE BALLISTA BATTERY ================================================================
/* a trestle bent for the gun-deck, drawn into main.js's drawStructures box (l..r px, t..b px): two stout posts at the ends and one between on a long run, X braces, a cap beam under the
   deck, mud splashed up the feet - and the lashings. Real timber, because it IS timber (siege engines, siege works, trestles) */
export function drawTrestle(g, l, r, t, b, seed = 0) {
  const w = r - l, n = Math.max(2, Math.round(w / 56) + 1), rr = rnd(seed + Math.round(l));
  const xs = []; for (let i = 0; i < n; i++) xs.push(Math.round(l + 5 + (w - 14) * i / (n - 1)));
  for (const x of xs) { rect(g, x, t, 6, b - t, K.wood2); rect(g, x, t, 2, b - t, K.wood4); rect(g, x + 5, t, 1, b - t, K.wood0);
    for (let y = t + 10; y < b - 4; y += 24) { rect(g, x - 1, y, 8, 2, K.iron1); px(g, x + 1, y, K.iron3); }
    g.fillStyle = K.wet; g.fillRect(x - 1, b - 10, 8, 10); g.fillStyle = K.peat4; for (let i = 0; i < 3; i++) g.fillRect(x + ((rr() * 6) | 0), b - 12 + ((rr() * 6) | 0), 1, 1); }
  for (let i = 0; i + 1 < xs.length; i++) { const a = xs[i] + 3, c = xs[i + 1] + 3, ya = t + 14, yb = b - 6; line(g, a, ya, c, yb, K.wood3, 2); line(g, c, ya, a, yb, K.wood3, 2); rect(g, a, t + 12, c - a, 3, K.wood3); rect(g, a, t + 12, c - a, 1, K.wood5); }
  rect(g, l, t, w, 6, K.wood3); rect(g, l, t, w, 1, K.wood6); rect(g, l, t + 5, w, 1, K.wood0);   /* the cap beam the deck rests on */
}
/* (claude/unburied4, Daniel 10-05 "floating things") WHAT HOLDS THE REST UP - R.structures kinds drawn into main.js's drawStructures box (l..r px, t..b px):
   'ubpier'  a stone pier under a tomb-shelf's end: a plinth on the floor, a squared shaft, a moulded cap under the lid (the slabs stood on corbels over nothing)
   'ubcart'  a wrecked cart's chassis under its bed: two wheels on the ground, the axle-trees, a shaft dug into the mud (the bed hung a row over its wreck)
   'ubprop'  two raking shores under a fallen deck of the toppled tower, their feet in the spoil */
export function drawPier(g, l, r, t, b, seed = 0, cold = false) {
  const w = r - l, cx = Math.round((l + r) / 2), sw = Math.min(12, w - 4), x = cx - (sw >> 1), S = cold ? ['#2a2632', '#3c3848', '#56526a', '#8a869a'] : ['#2e2a2c', '#4a4648', '#5a5658', '#7a7678'];
  rect(g, x, t, sw, b - t, S[2]); rect(g, x, t, 2, b - t, S[3]); rect(g, x + sw - 2, t, 2, b - t, S[0]);
  for (let y = t + 7; y < b - 6; y += 8) { rect(g, x + 1, y, sw - 2, 1, S[1]); px(g, x + ((y >> 3) % 2 ? 4 : sw - 5), y + 1, S[1]); }   /* the courses */
  rect(g, x - 2, t, sw + 4, 4, S[3]); rect(g, x - 2, t + 3, sw + 4, 1, S[0]);   /* the cap under the lid */
  rect(g, x - 3, b - 5, sw + 6, 5, S[1]); rect(g, x - 3, b - 5, sw + 6, 1, S[3]);   /* the plinth on the floor */
  void seed;
}
export function drawCartFrame(g, l, r, t, b, seed = 0) {
  const rr = rnd(seed + 7), w = r - l;
  rect(g, l + 2, t, w - 4, 5, K.wood2); rect(g, l + 2, t, w - 4, 1, K.wood4); rect(g, l + 2, t + 4, w - 4, 1, K.wood0);   /* the chassis under the bed */
  for (const x of [l + 7, r - 9]) { rect(g, x, t + 4, 3, b - t - 14, K.wood1); }   /* the axle-trees down to the hubs */
  wheel(g, l + 9, b - 10, 9, 8, 0.3 + rr(), K.wood4, K.iron2, 1); wheel(g, r - 8, b - 10, 9, 8, 0.8 + rr(), K.wood3, K.iron2, 2);   /* one wheel whole, one with spokes gone: both on the ground */
  line(g, l + 12, t + 6, l - 4, b - 1, K.wood3, 2);   /* the shaft, down into the mud */
  alpha(g, 0.6, () => { ellipse(g, l + 9, b - 1, 9, 2, K.peat3); ellipse(g, r - 8, b - 1, 9, 2, K.peat3); });
}
export function drawShores(g, l, r, t, b, seed = 0) {
  const w = r - l;
  for (const [x0, x1] of [[l + 4, l - 6], [r - 6, r + 4]]) { timber(g, x0, t, x1, b - 2, 4, (seed & 1) === 0); rect(g, Math.min(x0, x1) - 2, b - 4, 12, 4, K.wood1); }   /* raking shores, splayed out, their feet in the spoil */
  timber(g, l + 6, t + Math.round((b - t) * 0.45), r - 8, t + Math.round((b - t) * 0.45), 3);   /* a cross tie */
  rect(g, l, t, w, 4, K.wood3); rect(g, l, t, w, 1, K.wood5);   /* the sill under the deck */
}
/* a bolt rack: a stand with a ballista's iron-headed bolts leaning in it. 24 x 30 */
export function ubBoltRack() {
  const [c, g] = canvas(26, 32); shadow(g, 13, 30, 11);
  post(g, 3, 8, 30, 3, K.wood2, K.wood4); post(g, 20, 8, 30, 3, K.wood2, K.wood4); rect(g, 2, 16, 22, 2, K.wood3); rect(g, 2, 16, 22, 1, K.wood5); rect(g, 2, 26, 22, 2, K.wood3);
  for (let i = 0; i < 6; i++) { const x = 6 + i * 3, lean = (i - 2.5) * 0.7; line(g, x, 28, x + lean, 5 + (i % 2), K.wood5); fillPoly(g, [[x + lean - 1, 7 + (i % 2)], [x + lean + 0.5, 1 + (i % 2)], [x + lean + 2, 7 + (i % 2)]], K.iron4); rect(g, x + lean - 1, 8, 3, 1, K.cloth2); }
  return outline(c, K.out);
}
/* a mantlet: the moveable timber shield the crews stood behind - a wicker-and-plank board on a prop leg, an arrow slit, the host's raven burnt on it. 26 x 30 */
export function ubMantlet(broken = false) {
  const [c, g] = canvas(30, 34); shadow(g, 15, 32, 13);
  fillPoly(g, [[3, 31], [3, 7], [8, 2], [22, 2], [27, 7], [27, 31]], K.wood3); fillPoly(g, [[3, 31], [3, 7], [8, 2], [15, 2], [15, 31]], K.wood4);
  for (let x = 8; x < 27; x += 5) rect(g, x, 5, 1, 26, K.wood1); rect(g, 3, 12, 24, 2, K.iron1); rect(g, 3, 24, 24, 2, K.iron1); for (let x = 5; x < 27; x += 6) { px(g, x, 12, K.iron4); px(g, x, 24, K.iron4); }
  rect(g, 12, 6, 2, 8, K.ash0); fillPoly(g, [[16, 16], [24, 18], [20, 22], [16, 21]], K.raven);   /* the slit, the raven */
  line(g, 24, 31, 29, 33, K.wood2, 2); line(g, 4, 31, 0, 33, K.wood2, 2);
  if (broken) { fillPoly(g, [[14, 2], [30, 2], [30, 14], [24, 9]], '#00000000'); g.clearRect(16, 0, 14, 11); for (let i = 0; i < 4; i++) px(g, 16 + i * 3, 11 + (i % 2), K.wood5); for (let i = 0; i < 3; i++) { line(g, 6 + i * 7, 19 + (i % 2), 6 + i * 7, 11, K.wood6); px(g, 5 + i * 7, 11, K.silver); } }
  return outline(c, K.out);
}
/* a dead ballista: the frame stood on its post, the torsion bundles gone slack, the bowstring cut, no bolt. 44 x 34. v1: tipped on its side */
export function ubBallistaDead(v = 0) {
  const [c, g] = canvas(46, 36); shadow(g, 23, 34, 20);
  if (v === 1) { timber(g, 4, 30, 40, 26, 4); timber(g, 10, 24, 38, 31, 3, true); wheel(g, 36, 22, 9, 6, 0.4, K.wood3, K.iron2, 2); line(g, 6, 22, 16, 14, K.wood2, 3); circle(g, 14, 26, 4, K.iron1); circle(g, 14, 26, 2, K.rust); line(g, 20, 29, 30, 12, K.wood4, 2); return outline(c, K.out); }
  post(g, 20, 14, 33, 5, K.wood2, K.wood4); timber(g, 6, 33, 20, 22, 3, true); timber(g, 38, 33, 24, 22, 3, true);
  rect(g, 6, 10, 34, 5, K.wood3); rect(g, 6, 10, 34, 1, K.wood5); rect(g, 4, 6, 7, 12, K.iron1); rect(g, 35, 6, 7, 12, K.iron1); for (const x of [6, 37]) for (let y = 7; y < 17; y += 3) rect(g, x, y, 3, 1, K.rust);   /* the spring-cases */
  line(g, 7, 12, 16, 20, K.straw2); line(g, 38, 12, 30, 20, K.straw2);   /* the cords, slack */
  rect(g, 18, 8, 10, 3, K.wood5); rect(g, 24, 2, 3, 8, K.wood2);   /* the slider and its winch handle */
  return outline(c, K.out);
}
/* THE ONE HANGING OFF THE EDGE: a ballista tipped over the end of the deck, held only by a rope, nose down. 30 x 40 (anchored at its rope: the top) */
export function ubBallistaHang() {
  const [c, g] = canvas(34, 44); line(g, 6, 0, 10, 14, K.straw2, 2);
  timber(g, 6, 14, 28, 36, 4); timber(g, 12, 12, 30, 28, 3, true); rect(g, 20, 20, 8, 4, K.wood2);
  rect(g, 24, 30, 6, 10, K.iron1); rect(g, 23, 34, 8, 2, K.rust); line(g, 8, 18, 2, 30, K.wood4, 2); circle(g, 10, 30, 3, K.iron2);
  return outline(c, K.out);
}
/* THE WRECKED MANGONEL'S FRAME the catapult-arm swing hangs from: a mast on the deck, a jib with the pivot, its snapped arm and a winch drum. 44 x 140. The pivot is at (x=22, y=12) of the sprite */
export function ubGantry() {
  const [c, g] = canvas(48, 126); shadow(g, 16, 124, 16);
  timber(g, 3, 123, 14, 14, 5); timber(g, 28, 123, 18, 14, 5); rect(g, 12, 12, 9, 4, K.wood3); rect(g, 0, 10, 36, 5, K.wood3); rect(g, 0, 10, 36, 1, K.wood6);   /* the A-frame, the jib */
  circle(g, 16, 13, 4, K.iron1); circle(g, 16, 13, 2, K.iron3); line(g, 16, 14, 16, 30, K.straw2); /* the pivot (x 16, y 13 of the sprite) and its rope */
  for (const y of [34, 58, 82, 104]) { const k = (y - 14) / 109, xl = 3 + (14 - 3) * (1 - k) * 0 + 11 * (1 - k), xr = 28 - 10 * (1 - k); timber(g, 14 - 11 * k, y + 14, 18 + 10 * k, y, 3); }   /* the cross-braces */
  rect(g, 10, 70, 12, 12, K.wood2); rect(g, 10, 70, 12, 1, K.wood5); circle(g, 16, 76, 4, K.iron1); line(g, 16, 70, 16, 46, K.straw1);   /* the winch drum and its cord */
  timber(g, 38, 28, 24, 12, 3); px(g, 39, 29, K.wood6); px(g, 38, 27, K.wood6);   /* the arm, snapped off short */
  return outline(c, K.out);
}
/* THE WORKING BALLISTA'S STAND: it was set on a timber barbette bolted to the deck, three rows over the planks. 44 x 36: its top plank is where the engine's feet are */
export function ubBarbette() {
  const [c, g] = canvas(46, 38); shadow(g, 23, 36, 19);
  rect(g, 2, 2, 42, 5, K.wood3); rect(g, 2, 2, 42, 1, K.wood6); rect(g, 2, 6, 42, 1, K.wood0); for (let x = 6; x < 44; x += 8) px(g, x, 4, K.iron3);
  timber(g, 6, 7, 3, 36, 4, true); timber(g, 38, 7, 41, 36, 4, true); timber(g, 6, 12, 40, 30, 2); timber(g, 40, 12, 6, 30, 2); rect(g, 18, 7, 8, 29, K.wood2); rect(g, 18, 7, 1, 29, K.wood4);
  return outline(c, K.out);
}
/* THE TREBUCHET'S EMPLACEMENT: an earth-and-timber revetment it stands in, a stone pile beside it. 110 x 34 */
export function ubEmplacement() {
  const [c, g] = canvas(112, 36); shadow(g, 56, 34, 50);
  fillPoly(g, [[2, 34], [10, 16], [24, 10], [88, 10], [102, 16], [110, 34]], K.peat4); fillPoly(g, [[2, 34], [10, 16], [24, 10], [40, 10], [40, 34]], K.peat5); line(g, 10, 16, 24, 10, K.straw2);
  for (let x = 14; x < 100; x += 10) { rect(g, x, 12, 4, 22, K.wood2); rect(g, x, 12, 1, 22, K.wood4); }   /* the stakes of the revetment */
  rect(g, 10, 22, 92, 3, K.wood3); rect(g, 10, 22, 92, 1, K.wood5); rect(g, 12, 30, 88, 3, K.wood3);
  for (let i = 0; i < 8; i++) { const x = 90 + (i % 4) * 5 - (i > 3 ? 3 : 0), y = 28 - ((i / 4) | 0) * 5; circle(g, x, y, 3.4, i % 2 ? K.st3 : K.st4); px(g, x - 1, y - 1, K.st6); }   /* the stones, piled for the sling */
  return outline(c, K.out);
}

// ================================================================ THE ENGINES YOU WORK (drawn live by drawField) ================================================================
const BAL = (() => { let c; return () => c || (c = ((() => { const [cv, g] = canvas(40, 34); shadow(g, 20, 32, 17);
  timber(g, 6, 31, 20, 19, 3, true); timber(g, 34, 31, 20, 19, 3, true); post(g, 18, 17, 31, 5, K.wood2, K.wood4);
  rect(g, 3, 13, 34, 5, K.wood3); rect(g, 3, 13, 34, 1, K.wood5); rect(g, 1, 8, 8, 13, K.iron1); rect(g, 31, 8, 8, 13, K.iron1); rect(g, 1, 8, 8, 1, K.iron3); rect(g, 31, 8, 8, 1, K.iron3);
  for (const x of [2, 33]) for (let y = 9; y < 20; y += 3) rect(g, x, y, 5, 1, K.straw2);   /* the torsion bundles: twisted cord in iron cases */
  line(g, 6, 11, 20, 17, K.straw3); line(g, 34, 11, 20, 17, K.straw3);   /* the bowstring, drawn */
  rect(g, 16, 14, 14, 3, K.wood5); rect(g, 12, 15, 4, 6, K.wood2); rect(g, 8, 18, 3, 7, K.wood2); circle(g, 9, 26, 3, K.iron1); circle(g, 9, 26, 1.4, K.iron3);   /* the slider, the winch and its drum */
  return outline(cv, K.out); })())); })();
export function drawBallista(g, x, y, ready, aimX, aimY) {
  g.drawImage(BAL(), x - 20, y - 33);
  if (ready) { g.fillStyle = K.iron4; g.fillRect(x - 12, y - 20, 28, 2); g.fillStyle = K.silver; g.fillRect(x + 14, y - 22, 4, 4); g.fillStyle = K.cloth2; g.fillRect(x - 12, y - 21, 3, 4);   /* the loaded bolt, its head at the aim */
    g.globalAlpha = 0.25; g.strokeStyle = '#ffd36b'; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(x, y - 12); g.lineTo(aimX, aimY); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; }
}
/* THE TREBUCHET: its A-frame legs and base sill, the windlass, the arm on its axle with the counterweight box (iron-bound, full of stone) hung at the short end and the sling at the long, the stone in it.
   READY: the long arm lies back down the west with the stone in its sling, the box up; WIND: the box drops and the arm swings up and over; SPENT: the arm up and forward, the sling flung, the box down.
   state: 'ready' | 'wind' | 'spent', t2 the wind's clock (1 -> 0). x, y: the foot, centre. */
export function drawTrebuchet(g, x, y, state, t2, ready, aimX, aimY) {
  const ax = x, ay = y - 34, th = state === 'ready' ? 2.59 : state === 'wind' ? 2.59 + (1 - Math.max(0, t2)) * 2.79 : 5.38;
  rect(g, x - 22, y - 5, 44, 5, K.wood1); rect(g, x - 22, y - 5, 44, 1, K.wood4);
  timber(g, x - 17, y - 5, ax - 2, ay, 4); timber(g, x + 17, y - 5, ax + 2, ay, 4); timber(g, x - 4, y - 5, ax, ay + 2, 3, true);
  line(g, x - 15, y - 14, ax + 1, ay + 4, K.wood3); line(g, x + 15, y - 14, ax - 1, ay + 4, K.wood3);
  rect(g, x + 16, y - 12, 9, 12, K.wood2); circle(g, x + 20, y - 7, 4.5, K.wood4); circle(g, x + 20, y - 7, 1.6, K.iron2);   /* the windlass */
  const ca = Math.cos(th), sa = Math.sin(th), lx = Math.round(ax + ca * 34), ly = Math.round(ay + sa * 34), sx = Math.round(ax - ca * 12), sy = Math.round(ay - sa * 12);
  line(g, sx, sy, lx, ly, K.wood3, 3); line(g, sx, sy, lx, ly, K.wood5);
  rect(g, ax - 3, ay - 2, 6, 5, K.iron2); rect(g, ax - 3, ay - 2, 6, 1, K.iron4);
  const bx = sx, by = sy + 6;   /* the counterweight box hangs from the short end */
  line(g, sx, sy, bx, by - 2, K.iron2); rect(g, bx - 6, by - 2, 12, 11, K.iron1); rect(g, bx - 6, by - 2, 12, 1, K.iron3); rect(g, bx - 5, by, 10, 8, K.st2); for (const q of [[-3, 1], [1, 3], [-1, 5]]) px(g, bx + q[0], by + q[1], K.st4); rect(g, bx - 6, by + 4, 12, 1, K.rust);
  if (state === 'ready') { line(g, lx, ly, lx - 3, ly + 6, K.straw2); circle(g, lx - 3, ly + 8, 3.6, K.st4); px(g, lx - 4, ly + 7, K.st6); }   /* the sling, and the stone in it */
  else if (state === 'wind') { const k = Math.min(1, (1 - t2) * 1.4); line(g, lx, ly, lx + Math.round(5 * k), ly - Math.round(7 * k) + 4, K.straw2); circle(g, lx + Math.round(5 * k), ly - Math.round(9 * k) + 5, 3.6, K.st4); }
  else line(g, lx, ly, lx + 5, ly + 5, K.straw2);   /* spent: the sling empty, flung */
  if (ready) { g.globalAlpha = 0.25; g.strokeStyle = '#ffd36b'; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(x, y - 40); g.quadraticCurveTo((x + aimX) / 2, y - 140, aimX, aimY); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; }
}
/* SIEGE OIL on its cart: a two-wheeled cart, two pitch barrels chocked on it, a lit brazier beside them. tilt: the barrel going over (0..1). used: the barrels gone, a black pool and the cart empty */
export function drawOil(g, x, y, state, tilt, time) {
  const used = state === 'spent';
  rect(g, x - 20, y - 11, 34, 4, K.wood3); rect(g, x - 20, y - 11, 34, 1, K.wood5); wheel(g, x - 6, y - 6, 6, 6, 0.3, K.wood4, K.iron2); line(g, x + 13, y - 9, x + 22, y - 3, K.wood3, 2); rect(g, x - 20, y - 14, 3, 5, K.wood2);
  if (!used) { for (const [dx, tl] of [[-10, 0], [3, tilt]]) { const bx = x + dx + Math.round(tl * 6), bh = 15 - Math.round(tl * 4);
      rect(g, bx - 6, y - 11 - bh, 12, bh, '#3a2a1c'); rect(g, bx - 6, y - 11 - bh, 12, 1, K.wood4); rect(g, bx - 6, y - 8 - bh + 3, 12, 2, K.iron3); rect(g, bx - 6, y - 14, 12, 2, K.iron3); rect(g, bx - 3, y - 13 - bh, 6, 2, K.ash0); rect(g, bx - 2, y - 8 - bh + 6, 4, 3, K.fire2); } }
  else { rect(g, x - 18, y - 2, 28, 2, K.ash0); ellipse(g, x + 4, y - 1, 15, 2, K.ash0); rect(g, x - 8, y - 14, 8, 3, K.wood2); }
  line(g, x + 17, y - 16, x + 17, y, K.iron2, 2); rect(g, x + 13, y - 20, 9, 4, K.iron1); rect(g, x + 13, y - 20, 9, 1, K.iron3);   /* the brazier on its stand, beside them */
  flame(g, x + 17, y - 20, 8, 9, time, x * 0.1);
}

// ================================================================ THE MANGONEL AND THE FAR BANK ================================================================
/* THE MANGONEL (the field's second engine you work): a LOW timber frame on four small wheels, a single upright arm with a SPOON at its tip (a bucket, not a sling), the skein of twisted cord across the
   frame and a throwing-stop beam. arm: -0.5 cocked back, 1.0 thrown (forward over the frame). 56 x 36. Faces east */
export function drawMangonel(g, x, y, arm, state, ready, aimX, aimY, time) {
  rect(g, x - 22, y - 8, 44, 5, K.wood2); rect(g, x - 22, y - 8, 44, 1, K.wood5); rect(g, x - 22, y - 4, 44, 1, K.wood0);
  wheel(g, x - 15, y - 3, 4.5, 6, 0.2, K.wood4, K.iron2); wheel(g, x + 15, y - 3, 4.5, 6, 0.9, K.wood4, K.iron2);
  timber(g, x - 14, y - 8, x - 12, y - 20, 3); timber(g, x + 6, y - 8, x + 4, y - 20, 3); rect(g, x - 14, y - 22, 22, 4, K.wood3); rect(g, x - 14, y - 22, 22, 1, K.wood6);   /* the side frames and the cross-piece the skein is wound on */
  for (let i = 0; i < 4; i++) rect(g, x - 11 + i * 4, y - 22, 2, 4, K.straw2);   /* the twisted skein */
  const px0 = x - 4, py0 = y - 20, len = 28, ca = Math.cos(arm - Math.PI / 2), sa = Math.sin(arm - Math.PI / 2), tx = px0 + Math.round(ca * len), ty = py0 + Math.round(sa * len);
  line(g, px0, py0, tx, ty, K.wood3, 3); line(g, px0, py0, tx, ty, K.wood5);
  fillPoly(g, [[tx - 5, ty + 1], [tx + 5, ty + 1], [tx + 3, ty + 7], [tx - 3, ty + 7]], K.wood2); rect(g, tx - 5, ty, 11, 2, K.iron2);   /* the spoon */
  if (state === 'ready') { circle(g, tx, ty - 1.5, 3.6, K.st4); px(g, tx - 1, ty - 3, K.st6); }
  rect(g, x + 18, y - 24, 3, 17, K.wood1); rect(g, x + 14, y - 26, 12, 3, K.wood3);   /* the stop beam the arm comes up against */
  rect(g, x - 24, y - 7, 5, 2, K.iron2);
  if (ready) { g.globalAlpha = 0.25; g.strokeStyle = '#ffd36b'; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(tx, ty - 4); g.quadraticCurveTo((tx + aimX) / 2, Math.min(ty, aimY) - 90, aimX, aimY); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; }
}
/* THE FAR BANK'S ARCHER PALISADE: a plank-and-stake wall with a firing step, the bowmen's loopholes, stakes lashed along its top, a raven pennant. 52 x 64: stands on the bank (bottom-centre).
   state: 'whole' | 'smashed' - the stone has broken it: the top half down, the planks thrown out as a step of rubble */
export function bakeFarPalisade(smashed = false) {
  const [c, g] = canvas(60, 72), r = rnd(smashed ? 4 : 3); shadow(g, 30, 70, 27);
  if (!smashed) {
    for (let x = 4; x < 56; x += 6) { const top = 8 + ((x * 7) % 5); rect(g, x, top, 6, 62 - top, (x / 6 | 0) % 2 ? K.wood3 : K.wood2); rect(g, x, top, 1, 62 - top, K.wood4); fillPoly(g, [[x, top], [x + 3, top - 6], [x + 6, top]], K.wood4); }
    rect(g, 2, 26, 56, 3, K.wood1); rect(g, 2, 44, 56, 3, K.wood1); for (let x = 8; x < 56; x += 12) { rect(g, x, 20, 2, 6, K.ash0); rect(g, x, 36, 2, 6, K.ash0); }
    rect(g, 6, 58, 48, 10, K.wood1); rect(g, 6, 58, 48, 1, K.wood3); pennant(g, 52, 18, 18, K.raven, 12, true, K.silver);
  } else {
    for (let x = 4; x < 56; x += 6) { const top = 38 + ((x * 11) % 12); rect(g, x, top, 6, 62 - top, (x / 6 | 0) % 2 ? K.wood3 : K.wood2); rect(g, x, top, 1, 62 - top, K.wood4); fillPoly(g, [[x, top], [x + 2, top - 3 - ((x * 3) % 5)], [x + 6, top]], K.wood5); }
    for (let i = 0; i < 12; i++) { const x = 2 + ((r() * 50) | 0), y = 52 + ((r() * 14) | 0); rect(g, x, y, 8 + ((r() * 8) | 0), 3, i % 2 ? K.wood3 : K.wood4); }
    line(g, 6, 66, 24, 48, K.wood3, 3); line(g, 40, 66, 54, 52, K.wood2, 3); rect(g, 6, 62, 48, 6, K.wood1);
  }
  return outline(c, K.out);
}

// ================================================================ COVER (no crate shapes) ================================================================
const coverMemo = new Map();
/* the field's cover props as sprites, anchored bottom-centre on (cv.x, cv.y): wheeled pavises, a supply wagon, the overturned cart, the ghost shieldmen */
/* (claude/unburied4) THE WHEELED MANTLET YOU PUSH (a pushblock 20 x 24, drawn 2 px proud all round: 24 x 28): the host's tall shield of planks on a pair of small iron-shod wheels, its
   face (east, toward the breach) bristling with the Order's spent arrows, a raven daubed on it, a pushing bar on the back. Slate and raven: the besiegers' */
export function bakeMantletPush() {
  const [c, g] = canvas(24, 28); shadow(g, 12, 27, 11);
  rect(g, 4, 2, 14, 20, K.wood3); for (let x = 5; x < 18; x += 3) rect(g, x, 2, 1, 20, K.wood2); rect(g, 4, 2, 14, 1, K.wood5); rect(g, 17, 2, 1, 20, K.wood1);   /* the planks */
  rect(g, 4, 7, 14, 2, K.iron1); rect(g, 4, 16, 14, 2, K.iron1); px(g, 6, 7, K.iron3); px(g, 15, 16, K.iron3);   /* the iron bands */
  fillPoly(g, [[8, 10], [11, 8], [14, 10], [12, 11], [11, 14], [10, 11]], K.raven); px(g, 12, 9, K.silver);   /* the host's raven, daubed */
  for (const [x, y] of [[18, 5], [18, 12], [19, 18], [18, 9]]) { line(g, x, y, x + 4, y - 1, K.wood4); px(g, x + 4, y - 1, K.cloth3); }   /* the Order's spent arrows in its face */
  rect(g, 1, 10, 4, 2, K.wood2); rect(g, 1, 10, 1, 8, K.wood2);   /* the pushing bar */
  wheel(g, 7, 23, 3.5, 5, 0.3, K.wood4, K.iron2); wheel(g, 16, 23, 3.5, 5, 0.9, K.wood4, K.iron2);
  return outline(c, K.out);
}
export function coverSprite(kind) {
  if (coverMemo.has(kind)) return coverMemo.get(kind);
  let c;
  if (kind === 'mantlet') c = ubMantlet(false); else if (kind === 'brokenMantlet') c = ubMantlet(true);
  else if (kind === 'wagon') { const [cv, g] = canvas(44, 34); shadow(g, 22, 32, 20);
    rect(g, 4, 16, 36, 9, K.wood3); rect(g, 4, 16, 36, 1, K.wood5); for (let x = 8; x < 40; x += 5) rect(g, x, 17, 1, 8, K.wood1);
    fillPoly(g, [[6, 16], [10, 6], [34, 6], [38, 16]], K.slate2); fillPoly(g, [[6, 16], [10, 6], [22, 6], [22, 16]], K.slate3); line(g, 10, 6, 34, 6, K.slate4); for (let x = 12; x < 36; x += 6) line(g, x, 7, x - 1, 16, K.slate1);   /* the canvas hood over the load */
    wheel(g, 12, 26, 7, 8, 0.2, K.wood4, K.iron2); wheel(g, 32, 26, 7, 8, 0.7, K.wood4, K.iron2); line(g, 38, 22, 44, 30, K.wood3, 2); sack(g, 18, 9, 8, 7, K.burlap2, K.burlap1);
    c = outline(cv, K.out); }
  else if (kind === 'cart') { const [cv, g] = canvas(44, 34); shadow(g, 22, 32, 20);
    fillPoly(g, [[3, 31], [5, 9], [32, 10], [36, 31]], K.wood3); fillPoly(g, [[3, 31], [5, 9], [14, 9], [14, 31]], K.wood4); for (let y = 14; y < 30; y += 5) rect(g, 4, y, 32, 1, K.wood1); rect(g, 3, 10, 33, 2, K.iron1); rect(g, 3, 26, 33, 2, K.iron1);
    wheel(g, 34, 10, 9, 8, 0.4, K.wood4, K.iron2, 2); line(g, 2, 31, 14, 27, K.wood2, 2); for (let i = 0; i < 7; i++) px(g, 24 + ((i * 5) % 18), 30 + (i % 2), K.straw3);
    c = outline(cv, K.out); }
  else { /* shields: the line that held - three ghost shieldmen, shoulder to shoulder, translucent pale */
    const [cv, g] = canvas(46, 36); alpha(g, 0.85, () => { for (let i = 0; i < 3; i++) { const x = 3 + i * 13;
      ellipse(g, x + 6, 6, 3.4, 3.8, '#b8c4dc'); rect(g, x + 3, 4, 7, 2, '#8a96b4'); px(g, x + 5, 7, K.ash0); px(g, x + 8, 7, K.ash0);
      rect(g, x, 10, 12, 24, '#9aa6c4'); rect(g, x, 10, 12, 1, '#d0dcf0'); rect(g, x + 5, 13, 3, 19, '#c8d4ec'); rect(g, x + 2, 20, 9, 3, '#c8d4ec'); } });
    c = cv; }
  coverMemo.set(kind, c); return c;
}

// ================================================================ THE BREACH (the trebuchet's stone, after) ================================================================
/* the tower's base after the stone: over the four removed columns (the hide wall 246-247 and the base 257-258, rows G-5..G) the dark inside of the tower shows through a jagged hole, the hide wall's planks
   hanging splintered from its edge, rubble and timber heaped on the road it opened. Drawn over the (now empty) cells only. cx, cy: the camera */
export function drawBreach(g, cx, cy, G, VW) {
  for (const [c0, c1] of [[246, 247], [257, 258]]) {
    const x0 = c0 * 16 - cx, w = (c1 - c0 + 1) * 16, y0 = (G - 5) * 16 - cy, h = 6 * 16; if (x0 > VW || x0 + w < 0) continue;
    g.fillStyle = '#0c0806'; g.globalAlpha = 0.93; g.fillRect(x0, y0, w, h); g.globalAlpha = 1;
    g.fillStyle = '#1e1610'; g.fillRect(x0 + 2, y0 + 8, w - 4, h - 12); g.fillStyle = '#2e2218'; for (let k = 0; k < w; k += 6) g.fillRect(x0 + k, y0 + 10, 1, h - 14);   /* the inside's planking, dark */
    for (let k = 0; k < w; k += 4) { const tooth = 3 + ((k * 7 + c0) % 11); g.fillStyle = (k >> 2) % 2 ? K.wood3 : K.wood2; g.fillRect(x0 + k, y0, 4, tooth); g.fillStyle = K.wood5; g.fillRect(x0 + k, y0 + tooth - 1, 2, 1); }   /* the plank ends hanging from above */
    for (let k = 0; k < 5; k++) { const sy = y0 + 14 + ((k * 19 + c0) % (h - 36)), len = 5 + ((k * 3) % 7); g.fillStyle = K.wood4; g.fillRect(x0, sy, len, 2); g.fillRect(x0 + w - len, sy + 5, len, 2); }   /* splinters from the sides */
    for (let k = 0; k < 9; k++) { const rx = x0 + 2 + ((k * 13 + c0 * 3) % (w - 8)), ry = y0 + h - 4 - ((k * 5) % 7); g.fillStyle = k % 3 ? K.st4 : K.wood3; g.fillRect(rx, ry, 5 + (k % 3) * 2, 3 + (k % 2)); g.fillStyle = K.st6; g.fillRect(rx, ry, 2, 1); }   /* rubble across the opened road */
  }
}

// ================================================================ THE STANDING SIEGE TOWER AND ITS DRAWBRIDGE ================================================================
/* THE TOWER THAT STILL STANDS (the Order's wall stopped the first one; this one reached it): facade [341, 364, 18, 36], 24 x 19 tiles = 384 x 304, origin (341, 18). The tower body is cols 343..350 against the
   curtain wall in the Rider's arena's east end, wet hides over a timber frame, its ladder (the NET) up its west face, its top deck (the ONEWAY row 24) under a hoarding with the host's raven pennant, and the
   drawbridge's hinge on its east face; the wall-walk gallery (357-362) is hung off the gatehouse's east tower. All behind the tiles: the floor under the tower stays a fighting floor */
export function bakeTower2() {
  const W = 27 * 16, H = 19 * 16, [c, g] = canvas(W, H), X = col => (col - 338) * 16, Y = row => (row - 18) * 16;
  const x0 = X(340), x1 = X(348), top = Y(21);
  /* the body: a frame of posts and floors, hide panels hung over it, the wet dark showing between */
  rect(g, x0, top, x1 - x0, H - top, '#2a1e16'); for (let x = x0 + 4; x < x1; x += 8) rect(g, x, top, 1, H - top, '#1e1610');
  for (const fy of [Y(24), Y(28), Y(32), Y(36)]) { rect(g, x0 - 3, fy + 8, x1 - x0 + 6, 6, K.wood3); rect(g, x0 - 3, fy + 8, x1 - x0 + 6, 1, K.wood5); rect(g, x0 - 3, fy + 13, x1 - x0 + 6, 1, K.wood0); }
  for (const px0 of [x0 - 3, X(344) - 2, x1 - 3]) { rect(g, px0, top - 8, 6, H - top + 8, K.wood2); rect(g, px0, top - 8, 2, H - top + 8, K.wood4); rect(g, px0 + 5, top - 8, 1, H - top + 8, K.wood0); }
  for (const [pa, pb, ya, yb] of [[x0, X(344), 25, 28], [X(344), x1, 29, 32], [x0, X(344), 33, 36]]) hidePanel(g, pa + 5, Y(ya) + 14, pb - pa - 10, Y(yb) - Y(ya) - 10, ya * 3);
  timber(g, x0, Y(28) + 8, X(344), Y(32) + 6, 3); timber(g, X(344), Y(28) + 8, x0, Y(32) + 6, 3); timber(g, X(344), Y(32) + 8, x1, Y(36) + 6, 3);
  /* the top: a hoarding of planks and hides round the deck, the raven pennant on a pole */
  rect(g, x0 - 4, top, x1 - x0 + 8, 6, K.wood3); rect(g, x0 - 4, top, x1 - x0 + 8, 1, K.wood6); for (let x = x0 - 4; x < x1 + 4; x += 12) { rect(g, x, top - 10, 9, 10, K.wood2); rect(g, x, top - 10, 9, 1, K.wood4); }
  hidePanel(g, x0, top + 6, X(344) - x0 - 2, 28, 5); rect(g, X(344) + 12, top - 38, 1, 40, K.wood2); fillPoly(g, [[X(344) + 13, top - 38], [X(344) + 42, top - 32], [X(344) + 13, top - 22]], K.raven); line(g, X(344) + 14, top - 33, X(344) + 32, top - 31, K.silver);
  /* the wheels: two heavy wheels at the foot, iron-shod, mud to the hubs */
  wheel(g, X(342) + 8, H - 18, 22, 10, 0.2, K.wood3, K.iron2); wheel(g, X(346) + 4, H - 18, 22, 10, 0.5, K.wood3, K.iron2);
  for (const wx of [X(342) + 8, X(346) + 4]) alpha(g, 0.7, () => ellipse(g, wx, H - 4, 20, 5, K.peat3));
  /* the drawbridge's hinge on the east face: a big iron pin in a timber knee, its chains running up to a pulley block at the top */
  rect(g, x1 - 2, Y(24) - 2, 12, 12, K.iron1); rect(g, x1 - 2, Y(24) - 2, 12, 1, K.iron3); circle(g, x1 + 4, Y(24) + 4, 3, K.iron3);
  line(g, x1 - 12, Y(21) - 4, x1 + 2, Y(24) - 2, K.iron3); rect(g, x1 - 16, Y(21) - 8, 10, 8, K.iron1); circle(g, x1 - 11, Y(21) - 4, 3, K.iron2);
  /* THE GALLERY on the gatehouse's east face (cols 353-363): a timber hoarding hung off it on corbels, its floor the ONEWAY row 24, a rail and a roof of slats */
  const gx0 = X(353), gx1 = X(363);
  rect(g, gx0, Y(24) + 8, gx1 - gx0 + 4, 7, K.wood3); rect(g, gx0, Y(24) + 8, gx1 - gx0 + 4, 1, K.wood5);
  for (let x = gx0 + 6; x < gx1; x += 22) { rect(g, x, Y(24) + 15, 4, 20, K.wood2); timber(g, x + 2, Y(24) + 33, x + 20, Y(24) + 15, 3, true); }
  for (const x of [gx0 + 4, gx0 + 52, gx0 + 100]) { rect(g, x, Y(22), 3, 24, K.wood2); rect(g, x, Y(22), 1, 24, K.wood4); }
  rect(g, gx0, Y(22), gx1 - gx0, 3, K.wood3); rect(g, gx0, Y(22), gx1 - gx0, 1, K.wood5); for (let x = gx0 + 2; x < gx1; x += 5) rect(g, x, Y(21) + 6, 3, 10, K.wood2);
  /* (claude/unburied4) its east end, out past the gatehouse tower over the yard: a post down to the yard wall's top, so the corner where the rope ladder hangs stands on something */
  post(g, X(362) + 10, Y(24) + 14, Y(29) + 2, 4, K.wood2, K.wood4); timber(g, X(362) + 12, Y(27), X(361) + 4, Y(25) + 2, 3);
  return outline(c, K.out);
}
/* THE DRAWBRIDGE LEAF, drawn live: hinged at (hx, hy) (the top surface level on the tower's east face), seven tiles long, raised (ang -PI/2: standing up against the tower) to flat (0: lying across the gap). Two chains
   from its tip to the pulley block at the tower's top. down: the chains slack, a little dust at the far end */
export function drawDrawbridge(g, hx, hy, ang, state, time) {
  const len = 112, th = 8, ca = Math.cos(ang), sa = Math.sin(ang), tx = Math.round(hx + ca * len), ty = Math.round(hy + sa * len), nx = -sa, ny = ca;
  const pulley = [hx - 11, hy - 52];
  g.fillStyle = K.iron3; const chain = (x0, y0, x1, y1, slack) => { const n = 14; for (let i = 0; i <= n; i++) { const t = i / n, sag = slack ? Math.sin(t * Math.PI) * 9 : 0; g.fillRect(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t + sag), 1, i % 2 ? 2 : 1); } };
  chain(pulley[0], pulley[1], tx, ty - 2, state === 'down'); chain(pulley[0] + 6, pulley[1] + 2, Math.round(hx + ca * len * 0.62), Math.round(hy + sa * len * 0.62) - 2, state === 'down');
  if (state !== 'down') {
    const quad = [[hx, hy], [hx + ca * len, hy + sa * len], [hx + ca * len + nx * th, hy + sa * len + ny * th], [hx + nx * th, hy + ny * th]];
    fillPoly(g, quad.map(([a, b]) => [Math.round(a), Math.round(b)]), K.wood3);
    for (let k = 1; k < 8; k++) { const f = k / 8; line(g, Math.round(hx + ca * len * f), Math.round(hy + sa * len * f), Math.round(hx + ca * len * f + nx * th), Math.round(hy + sa * len * f + ny * th), K.wood1); }
    line(g, Math.round(hx), Math.round(hy), tx, ty, K.wood5); line(g, Math.round(hx + nx * th), Math.round(hy + ny * th), Math.round(hx + ca * len + nx * th), Math.round(hy + sa * len + ny * th), K.wood0);
    for (const f of [0.18, 0.5, 0.82]) { const ix = hx + ca * len * f, iy = hy + sa * len * f; line(g, Math.round(ix), Math.round(iy), Math.round(ix + nx * th), Math.round(iy + ny * th), K.iron1, 2); }
  }
  circle(g, Math.round(hx), Math.round(hy + 1), 2.2, K.iron3);
  if (state === 'down' && time % 3 < 0.5) { g.globalAlpha = 0.5 - (time % 3); g.fillStyle = K.peat5; for (let i = 0; i < 4; i++) g.fillRect(tx + 4 + i * 3, ty - 3 - i, 2, 1); g.globalAlpha = 1; }
}
/* THE CLEAT: the rope the tower's bridge is tied off to, on the deck - the thing to strike (it glints). tied: the rope taut up to the raised leaf; cut: it hangs slack */
export function drawCleat(g, x, y, tied) {
  rect(g, x - 5, y - 9, 10, 9, K.wood2); rect(g, x - 5, y - 9, 10, 1, K.wood5); rect(g, x - 7, y - 12, 14, 3, K.iron2); rect(g, x - 7, y - 12, 14, 1, K.iron4);
  if (tied) { for (let i = 0; i < 4; i++) line(g, x - 4, y - 8 + i * 2, x + 4, y - 7 + i * 2, K.straw2); line(g, x, y - 12, x + 3, y - 60, K.straw1); }
  else { line(g, x, y - 12, x - 6, y - 4, K.straw1); line(g, x - 6, y - 4, x - 10, y, K.straw1); }
}

// ================================================================ THE FAR BANK'S BOWMEN ================================================================
/* THE BOWMEN'S FIRING STEP behind the palisade: a low plank platform, a barrel of arrows, the raven pennant on a pole. 60 x 46 */
export function ubFiringStep() {
  const [c, g] = canvas(60, 46); shadow(g, 30, 44, 26);
  rect(g, 4, 30, 52, 6, K.wood3); rect(g, 4, 30, 52, 1, K.wood5); for (const x of [8, 26, 44]) rect(g, x, 36, 5, 8, K.wood2);
  rect(g, 40, 14, 12, 16, K.wood2); rect(g, 40, 14, 12, 1, K.wood5); rect(g, 40, 19, 12, 2, K.iron2); for (let i = 0; i < 5; i++) { line(g, 42 + i * 2, 14, 41 + i * 2, 4, K.cloth2); px(g, 41 + i * 2, 3, K.silver); }
  pennant(g, 12, 32, 30, K.raven, 14, false, K.silver);
  return outline(c, K.out);
}
/* THE PALISADE, SMASHED (drawn over the cells where the top row has gone): splintered planks, a heap of rubble. cx, cy: the camera; G: the field's row */
export function drawFarbankRubble(g, cx, cy, G, VW) {
  const x0 = 320 * 16 - cx; if (x0 > VW + 20 || x0 < -80) return; const y = (G + 1) * 16 - cy;
  for (let i = 0; i < 9; i++) { const rx = x0 - 4 + i * 5, ry = y - 4 - ((i * 7) % 6), w = 7 + ((i * 3) % 6); g.fillStyle = i % 2 ? K.wood3 : K.wood2; g.fillRect(rx, ry, w, 4); g.fillStyle = K.wood5; g.fillRect(rx, ry, w, 1); }
  for (let i = 0; i < 4; i++) { g.fillStyle = K.wood4; g.fillRect(x0 + 2 + i * 8, y - 14 + (i % 2) * 3, 2, 10 - (i % 2) * 3); g.fillRect(x0 + 1 + i * 8, y - 15 + (i % 2) * 3, 4, 1); }
}
