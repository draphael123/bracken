// unburied_sets.js - THE UNBURIED FIELD's SET PIECES (claude/unburiedart): "a siege that never ended". Every piece is a big object only this place has + a verb + a
// visible consequence, or - where it has no verb - the scale and the story. Drawn ON the existing grid: art never moves a collision cell. The rubric is the trebuchet's.
//   THE ROAD, west to east: CAMP (the besiegers' dead camp) -> LINES (the mass-grave pits, the shield wall of the dead) -> KILLING-GROUND (where the charge broke: fallen horses,
//   the lance thicket, burning supply wagons; the ballista battery on its gun-deck) -> SIEGE WORKS (the toppled tower, the trebuchet) -> the sappers' bridges (the mangonel)
//   -> THE WALL (the Order's curtain wall, gatehouse and the tower that stands against it) -> THE CHAPEL (nave, aisles, apse). See unburied_siege.js and unburied_chapel.js.
// This file: the dead camp, the pits and what is round them, the corpse mound, the charge's dead horses and lances, the wagons, the lines' shield wall, and the registry main.js reads
// (decoSet: kind -> [canvas, bulky, frames]; lightOf: a fire's lamp). Deco is softened and drawn at 0.78 behind the play (main.js drawScenery), so the colours here are a step brighter.
import { K, canvas, px, rect, fillPoly, line, circle, ellipse, outline, beam, post, wheel, sack, pennant, shroud, flame, flameFrames, planks, rnd } from './unburied_art.js';
import * as SG from './unburied_siege.js';
import * as CH from './unburied_chapel.js';

const alpha = (g, a, fn) => { g.globalAlpha = a; fn(); g.globalAlpha = 1; };
const shadow = (g, cx, y, rx) => alpha(g, 0.28, () => ellipse(g, cx, y, rx, 2, '#000000'));

// ================================================================ THE DEAD CAMP (cols 0-20) ================================================================
/* a torn pavilion of the host: SLATE canvas over a ridge pole, a raven pennant on the finial, a tear in the roof with the ribs showing. v1: one that has come down */
export function ubTent(v = 0) {
  if (v === 1) { const [c, g] = canvas(60, 30); shadow(g, 30, 28, 26);
    fillPoly(g, [[2, 28], [10, 16], [30, 12], [50, 18], [58, 28]], K.slate2); fillPoly(g, [[2, 28], [10, 16], [30, 12], [26, 28]], K.slate3); line(g, 10, 16, 30, 12, K.slate4); line(g, 30, 12, 50, 18, K.slate3);
    for (let x = 6; x < 56; x += 8) line(g, x, 28, x + 3, 17 - ((x * 3) % 4), K.slate1);   /* the folds */
    beam(g, 44, 4, 52, 20, 2, K.wood3, K.wood5); fillPoly(g, [[45, 4], [57, 7], [48, 10]], K.raven);   /* the ridge pole, snapped, a rag of raven on it */
    for (let x = 4; x < 58; x += 6) { fillPoly(g, [[x, 28], [x + 3, 25], [x + 6, 28]], K.slate1); }
    line(g, 2, 28, 56, 28, K.slate0); for (const x of [8, 40]) { line(g, x, 28, x - 4, 29, K.straw1); }
    return outline(c, K.out); }
  const [c, g] = canvas(76, 60); shadow(g, 38, 58, 34);
  rect(g, 9, 30, 58, 26, K.slate1); for (let x = 14; x < 66; x += 7) rect(g, x, 30, 1, 26, K.slate0); rect(g, 9, 30, 58, 1, K.slate2);
  fillPoly(g, [[3, 31], [38, 6], [73, 31]], K.slate2); fillPoly(g, [[3, 31], [38, 6], [38, 31]], K.slate3); line(g, 3, 31, 38, 6, K.slate4); line(g, 38, 6, 73, 31, K.slate2);
  for (let x = 3; x < 72; x += 6) if ((x / 6 | 0) !== 5 && (x / 6 | 0) !== 8) fillPoly(g, [[x, 31], [x + 3, 37], [x + 6, 31]], (x / 6 | 0) % 2 ? K.slate1 : K.slate2);   /* the scalloped valance, two scallops gone */
  fillPoly(g, [[48, 14], [60, 21], [55, 30], [46, 25]], K.ash0); line(g, 48, 14, 55, 30, K.wood2); line(g, 52, 16, 58, 26, K.wood2); line(g, 49, 20, 60, 21, K.wood1);   /* the tear, and the ribs under it */
  fillPoly(g, [[30, 56], [36, 36], [42, 36], [48, 56]], K.ash0); fillPoly(g, [[48, 56], [42, 36], [52, 38], [58, 56]], K.slate1); fillPoly(g, [[52, 50], [56, 50], [58, 56], [54, 54]], K.slate0);   /* the door, and its flap hanging torn */
  rect(g, 38, 0, 1, 7, K.wood2); fillPoly(g, [[39, 0], [51, 3], [39, 7]], K.raven); line(g, 39, 3, 48, 3, K.silver);   /* the finial and the host's raven pennant, slashed with silver */
  for (const [x0, y0, x1, y1] of [[3, 31, -1, 58], [73, 31, 76, 58], [38, 7, 38, 7]]) if (y1 > 0) { line(g, x0, y0, x1, y1, K.straw1); px(g, x1, y1, K.wood2); }
  line(g, 9, 56, 67, 56, K.slate0);
  return outline(c, K.out);
}
/* a cold fire ring: stones, ash, a few dull embers, a tripod and its black pot, a tipped stool */
export function ubFireRing() {
  const [c, g] = canvas(44, 26); shadow(g, 22, 24, 20);
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, x = 22 + Math.cos(a) * 13, y = 21 + Math.sin(a) * 2.4; ellipse(g, x, y, 3, 2, i % 2 ? K.st4 : K.st3); px(g, x - 1, y - 1, K.st6); }
  ellipse(g, 22, 21, 10, 2, K.ash0); for (let i = 0; i < 7; i++) px(g, 14 + ((i * 7) % 17), 20 + (i % 2), i % 3 ? K.ash1 : K.ember);
  line(g, 12, 21, 20, 6, K.wood3); line(g, 32, 21, 24, 6, K.wood3); line(g, 22, 21, 22, 5, K.wood2); line(g, 22, 5, 22, 10, K.iron2); circle(g, 22, 12.5, 3.6, K.iron0); rect(g, 19, 9, 7, 1, K.iron2);
  rect(g, 36, 17, 5, 2, K.wood3); line(g, 36, 19, 34, 24, K.wood2); line(g, 40, 19, 41, 24, K.wood2);
  return outline(c, K.out);
}
/* a weapon rack: two posts, a crossbar, pale spears leaning, a slate shield with the raven (v1: broken, a spear on the ground) */
export function ubRack(v = 0) {
  const [c, g] = canvas(34, 36); shadow(g, 17, 34, 15);
  post(g, 4, 10, 34, 2, K.wood2, K.wood4); post(g, 28, 10, 34, 2, K.wood2, K.wood4); rect(g, 3, 14, 28, 2, K.wood3); rect(g, 3, 14, 28, 1, K.wood5);
  for (let i = 0; i < 5; i++) { const x = 7 + i * 4, lean = (i % 2 ? 1 : -1) * 2; line(g, x, 33, x + lean, 8 - (i % 3), K.cloth2); px(g, x + lean, 7 - (i % 3), K.silver); px(g, x + lean, 8 - (i % 3), K.iron4); }
  if (v === 0) { circle(g, 17, 26, 6, K.slate1); circle(g, 17, 26, 4, K.slate2); px(g, 17, 26, K.raven); rect(g, 15, 25, 5, 1, K.silver); } else { line(g, 4, 33, 30, 34, K.cloth1); }
  return outline(c, K.out);
}
/* THE CAMP'S LAST BRAZIER: an iron basket on three splayed legs, a fire in it (4 frames) */
export function ubBrazier() {
  const base = canvas(18, 34), g = base[1]; shadow(g, 9, 32, 7);
  line(g, 9, 17, 3, 32, K.iron2); line(g, 9, 17, 15, 32, K.iron2); line(g, 9, 17, 9, 32, K.iron1); rect(g, 3, 15, 13, 3, K.iron1); rect(g, 3, 15, 13, 1, K.iron3);
  fillPoly(g, [[2, 11], [16, 11], [13, 16], [5, 16]], K.iron1); line(g, 2, 11, 16, 11, K.iron3); for (let x = 4; x < 15; x += 3) px(g, x, 13, K.rust);
  const frames = flameFrames(14, 14, 4, 3).map(f => { const [c, q] = canvas(18, 34); q.drawImage(base[0], 0, 0); q.drawImage(f, 2, -4); return outline(c, K.out); });
  return frames;
}

// ================================================================ THE MASS-GRAVE PITS (the lines) ================================================================
/* the floor of a half-dug burial pit, w tiles wide: shrouded dead laid in rows head to foot and two deep, the last third still bare, a spade left standing, lime over all of it */
export function ubPit(w = 10, seed = 1) {
  const W = w * 16, [c, g] = canvas(W, 22), r = rnd(seed * 31 + w);
  const filled = Math.round(W * 0.66);
  for (let layer = 0; layer < 2; layer++) { const y = layer ? 8 : 14; let x = 3 + (layer ? 10 : 0);
    while (x < filled - (layer ? 16 : 6)) { const len = 22 + ((r() * 6) | 0); shroud(g, x, y, len, (r() * 3) | 0); x += len + 2 + ((r() * 3) | 0); } }
  for (let i = 0; i < 16; i++) { const x = (r() * (filled - 8)) | 0; px(g, x, 10 + ((r() * 11) | 0), K.lime2); px(g, x + 1, 12 + ((r() * 9) | 0), K.lime1); }   /* lime thrown over them */
  const sx = filled + 18 + ((r() * 14) | 0); line(g, sx, 20, sx - 2, 2, K.wood3); rect(g, sx - 5, 2, 5, 1, K.wood3); fillPoly(g, [[sx - 2, 20], [sx - 6, 21], [sx + 2, 21], [sx + 3, 18]], K.iron3); px(g, sx - 3, 20, K.iron4);   /* the spade, standing where the digging stopped */
  for (let i = 0; i < 9; i++) { const x = filled + 4 + ((r() * (W - filled - 10)) | 0); px(g, x, 19 + ((r() * 3) | 0), K.peat5); }
  rect(g, 0, 21, W, 1, K.peat1);
  return c;
}
/* a heap of spoil at a pit's lip, spades standing in it, lime streaked through it */
export function ubSpoil(v = 0) {
  const [c, g] = canvas(46, 24); shadow(g, 23, 22, 21);
  fillPoly(g, [[1, 22], [9, 12], [20, 5], [30, 7], [40, 14], [45, 22]], K.peat4); fillPoly(g, [[1, 22], [9, 12], [20, 5], [20, 22]], K.peat5); line(g, 9, 12, 20, 5, K.straw2);
  for (let i = 0; i < 9; i++) px(g, 6 + ((i * 11 + v * 5) % 34), 10 + ((i * 7) % 11), i % 3 ? K.peat3 : K.peat2);
  line(g, 12, 19, 22, 9, K.lime2); line(g, 22, 9, 32, 15, K.lime1); for (let i = 0; i < 6; i++) px(g, 14 + i * 4, 18 - (i % 3) * 3, K.lime2);
  for (const [x, ang] of [[27, -0.2], [34, 0.25]]) { const x1 = x + Math.sin(ang) * 18; line(g, x, 16, x1, 0, K.wood3); rect(g, Math.round(x1) - 3, 0, 5, 1, K.wood4); fillPoly(g, [[x - 2, 17], [x + 3, 17], [x + 1, 22], [x - 1, 22]], K.iron3); }
  return outline(c, K.out);
}
/* THE GRAVEDIGGER'S HANDCART: a two-wheeled tilting box, its handles on the ground, a spade and a pick in it, a sack of lime */
export function ubHandcart() {
  const [c, g] = canvas(44, 30); shadow(g, 22, 28, 20);
  fillPoly(g, [[6, 12], [34, 10], [32, 22], [8, 22]], K.wood3); fillPoly(g, [[6, 12], [34, 10], [34, 13], [6, 15]], K.wood5); for (let x = 12; x < 32; x += 6) line(g, x, 13, x, 21, K.wood1);
  wheel(g, 20, 22, 6, 6, 0.3, K.wood4, K.iron2); line(g, 34, 14, 43, 26, K.wood3); line(g, 34, 17, 43, 27, K.wood2);
  line(g, 14, 12, 4, 0, K.wood3); fillPoly(g, [[2, 0], [7, 0], [5, 4], [3, 4]], K.iron3); line(g, 26, 12, 32, 1, K.wood3); line(g, 30, 1, 35, 3, K.iron3);
  sack(g, 15, 6, 11, 9, K.cloth3, K.cloth1);
  return outline(c, K.out);
}
/* CROSSES STACKED WAITING: unmarked crosses of new pale wood leant on a rail */
export function ubCrosses() {
  const [c, g] = canvas(30, 34); shadow(g, 15, 32, 13);
  line(g, 4, 31, 10, 4, K.wood3); line(g, 26, 31, 20, 4, K.wood3); rect(g, 8, 18, 14, 2, K.wood4);
  for (let i = 0; i < 6; i++) { const x = 8 + i * 3, lean = i - 2.5; line(g, x, 31, x + lean, 8 + (i % 2) * 2, K.wood6); rect(g, Math.round(x + lean) - 3, 12 + (i % 2) * 2, 7, 2, K.wood5); px(g, Math.round(x + lean), 12 + (i % 2) * 2, K.wood6); }
  return outline(c, K.out);
}
/* THE CORPSE MOUND'S PIT: the heap of the dead under the soft ground, shrouds and shields and limbs piled to the slab; w tiles x h rows */
export function ubMoundDead(w = 5, h = 4) {
  const W = w * 16, H = h * 16, [c, g] = canvas(W, H), r = rnd(w * 7 + h);
  for (let layer = 0; layer < 4; layer++) { const y = H - 9 - layer * 11; let x = -6 + (layer % 2) * 9; while (x < W - 8) { const len = 22 + ((r() * 8) | 0), t = (r() * 3) | 0, tilt = ((r() - 0.5) * 6) | 0; shroud(g, x, y + tilt, len, t); x += len - 4 + ((r() * 6) | 0); } }
  for (let i = 0; i < 4; i++) { const x = 8 + ((r() * (W - 28)) | 0), y = 8 + ((r() * (H - 22)) | 0); circle(g, x + 6, y + 6, 6, K.iron2); circle(g, x + 6, y + 6, 4.4, i % 2 ? K.slate1 : K.red1); circle(g, x + 6, y + 6, 1.6, K.iron4); }   /* shields, in both armies' colours */
  for (let i = 0; i < 6; i++) { const x = ((r() * (W - 10)) | 0) + 2, y = 8 + ((r() * (H - 18)) | 0); line(g, x, y, x + 8, y + ((r() * 5) | 0) - 2, '#d8cdb0'); px(g, x - 1, y, '#e8dfc4'); }   /* a limb, a bone */
  for (let i = 0; i < 12; i++) px(g, (r() * W) | 0, (r() * H) | 0, K.lime2);
  rect(g, 0, H - 1, W, 1, K.peat1);
  return c;
}

// ================================================================ WHERE THE CHARGE BROKE ================================================================
/* a fallen WARHORSE in barding, lying on its side, head down to the left: v0 the host's slate and raven, v1 the Order's red and gold. 58 x 32 */
export function ubHorse(v = 0) {
  const [c, g] = canvas(60, 34), cap = v ? [K.red1, K.red2, K.gold2, K.red0] : [K.slate1, K.slate2, K.silver, K.slate0], coat = v ? '#6a4a34' : '#4a4650', coatL = v ? '#8a6648' : '#6a6672';
  shadow(g, 30, 31, 27);
  /* legs first (behind the barrel): the two hind legs stiff out to the right, the near legs folded */
  line(g, 44, 16, 57, 9, coat, 3); line(g, 46, 20, 58, 17, coat, 3); rect(g, 56, 7, 3, 3, K.iron2); rect(g, 57, 16, 3, 3, K.iron2);
  line(g, 17, 25, 9, 30, coat, 3); line(g, 22, 26, 19, 31, coat, 3); rect(g, 7, 29, 4, 2, K.iron2); rect(g, 17, 30, 4, 2, K.iron2);
  ellipse(g, 30, 19, 21, 10, coat); ellipse(g, 28, 15, 18, 5, coatL);
  /* the neck and head, down on the ground; mane; chamfron (steel) on the face */
  fillPoly(g, [[12, 12], [5, 20], [1, 25], [6, 28], [10, 25], [14, 20]], coat); fillPoly(g, [[1, 25], [4, 22], [9, 27], [6, 29]], K.iron3); px(g, 5, 25, K.iron4); px(g, 8, 24, K.out);
  line(g, 12, 11, 6, 19, '#1c1a22', 2); line(g, 16, 10, 12, 14, '#1c1a22', 2); rect(g, 10, 9, 2, 3, coat);   /* mane, an ear */
  /* the barding: a cloth over the barrel in the army's colours, a cross on it, a trim, ripped at the hem */
  fillPoly(g, [[16, 11], [40, 9], [47, 18], [41, 27], [20, 28], [13, 19]], cap[0]); fillPoly(g, [[16, 11], [40, 9], [43, 14], [20, 17]], cap[1]);
  line(g, 14, 20, 20, 28, cap[2]); line(g, 41, 27, 47, 18, cap[2]); line(g, 16, 11, 40, 9, cap[2]);
  rect(g, 28, 13, 3, 11, cap[2]); rect(g, 24, 17, 11, 3, cap[2]); for (let x = 20; x < 42; x += 5) fillPoly(g, [[x, 28], [x + 2, 31], [x + 4, 28]], cap[0]);
  /* a broken lance through it, and the saddle's cantle */
  line(g, 36, 12, 52, 2, K.cloth2); px(g, 52, 1, K.cloth1); line(g, 33, 14, 38, 11, K.wood3, 2); rect(g, 33, 9, 5, 3, K.wood2);
  return outline(c, K.out);
}
/* A THICKET OF SNAPPED LANCES leaning toward where the horse came from: w px wide, up to 34 high, scraps of pennon on a few */
export function ubLances(w = 60, seed = 1) {
  const [c, g] = canvas(w, 38), r = rnd(seed * 17 + w);
  const n = Math.max(5, Math.round(w / 5));
  for (let i = 0; i < n; i++) {
    const x0 = 2 + ((i + r() * 0.8) / n) * (w - 6), len = 16 + ((r() * 18) | 0), lean = -(2 + r() * 9) * (r() < 0.8 ? 1 : -0.4), x1 = x0 + lean * len / 22, y1 = 36 - len * 0.97;
    line(g, x0, 36, x1, y1, i % 3 ? K.cloth2 : K.wood5); line(g, x0 + 1, 36, x1 + 1, y1, K.wood2);
    if (r() < 0.5) { px(g, x1, y1 - 1, K.cloth3); px(g, x1 - 1, y1 - 2, K.cloth1); px(g, x1 + 1, y1 - 2, K.cloth1); }   /* the snapped end */
    if (r() < 0.3) fillPoly(g, [[x1, y1 + 2], [x1 + 8, y1 + 4], [x1 + 1, y1 + 6]], i % 2 ? K.red2 : K.slate3);   /* a pennon's scrap */
  }
  return outline(c, K.out);
}
/* AN OVERTURNED SUPPLY WAGON under its ledge: the bed (the tile art) is its flat top; below it the box on its side and its slats, a broken wheel up beside it, sacks and a barrel
   spilled at the foot. 64 x 64, the foot on the trench floor; the bed's top is at y 16. burning: charred, one board out */
export function ubWagon(v = 0, burning = false) {
  const [c, g] = canvas(64, 64), r = rnd(v * 13 + 5); shadow(g, 32, 62, 30);
  const body = burning ? '#5c3a22' : '#5a3e26', lit = burning ? '#8a5a30' : '#7a5634', dk = burning ? '#1c1210' : K.wood1;   /* (a burning one is scorched, not black: it has to read against the dusk) */
  rect(g, 8, 26, 48, 36, body); rect(g, 8, 26, 48, 2, lit); for (let x = 12; x < 56; x += 6) rect(g, x, 28, 1, 34, dk);
  for (const y of [34, 50]) { rect(g, 8, y, 48, 2, burning ? K.iron0 : K.iron1); rect(g, 8, y, 48, 1, K.iron2); for (let x = 12; x < 56; x += 10) px(g, x, y, K.iron4); }
  rect(g, 6, 26, 3, 36, burning ? K.ash1 : K.wood2); rect(g, 55, 26, 3, 36, burning ? K.ash1 : K.wood2);   /* the end boards */
  if (burning) { for (const [x, y, w, h] of [[14, 38, 8, 10], [34, 44, 10, 12]]) { rect(g, x, y, w, h, K.ash0); rect(g, x + 1, y + 1, w - 2, 2, K.ember); } }
  else if (v === 1) { rect(g, 30, 40, 9, 12, K.wood0); rect(g, 31, 41, 7, 2, K.wood3); }   /* a board stove in */
  wheel(g, 52, 12, 11, 8, 0.5, burning ? '#6a4428' : K.wood4, K.iron2, 3);   /* the wheel that came off, standing against it, spokes gone */
  wheel(g, 10, 55, 8, 8, 0.2, burning ? '#6a4428' : K.wood3, K.iron2, 2);
  line(g, 3, 60, 18, 52, K.wood3, 2); rect(g, 1, 59, 4, 2, K.iron3);   /* the shaft, snapped */
  sack(g, 24, 52, 11, 12, K.burlap2, K.burlap1); sack(g, 37, 54, 12, 10, K.burlap3, K.burlap1); sack(g, 51, 56, 10, 8, K.burlap2, K.burlap1);
  for (let i = 0; i < 14; i++) px(g, 20 + ((r() * 40) | 0), 60 + ((r() * 3) | 0), K.straw3);   /* grain, spilled */
  rect(g, 1, 52, 10, 11, K.wood2); rect(g, 1, 52, 10, 1, K.wood4); rect(g, 1, 55, 10, 1, K.iron2); rect(g, 1, 60, 10, 1, K.iron2);   /* a barrel */
  return outline(c, K.out);
}
/* THE SHIELD WALL OF THE DEAD: a rank of pale ghost shieldmen, shoulder to shoulder behind their shields, spears slanted over them, frozen in line (w px wide). Translucent: drawn faint */
export function ubShieldWall(w = 150) {
  const [c, g] = canvas(w, 46), r = rnd(w);
  const n = Math.round(w / 12);
  for (let i = 0; i < n; i++) { const x = 3 + i * 12, y = 12 + ((i * 7) % 3);
    ellipse(g, x + 5, y - 1, 3.2, 3.6, '#b8c4dc'); rect(g, x + 2, y - 2, 7, 2, '#8a96b4'); px(g, x + 4, y, K.ash0); px(g, x + 7, y, K.ash0);   /* a helm, hollow-eyed */
    rect(g, x, y + 3, 11, 28, '#9aa6c4'); rect(g, x, y + 3, 11, 1, '#d0dcf0'); rect(g, x + 4, y + 7, 3, 22, '#c8d4ec'); rect(g, x + 1, y + 16, 9, 3, '#c8d4ec');   /* the shield: a long ghost-pale kite with a cross */
    line(g, x + 9, 8, x + 16 + ((i % 3) * 2), -2 + 6, '#e0e8f8');   /* a spear over the wall */
    for (let k = 0; k < 5; k++) px(g, x + 1 + ((i * 3 + k * 5) % 9), y + 31 + (k % 2), '#7a86a4'); }   /* the rank dissolves at the foot */
  return c;
}

// ================================================================ THE CRATERS ================================================================
/* a crater's floor: the earth scorched black in a ring, thrown stones, a charred timber, a split shield, the fire's last embers - the battle's engines were not only on the walls. w tiles wide (sprite w*16 x 22) */
export function ubCrater(w = 6, v = 0) {
  const W = w * 16, [c, g] = canvas(W, 22), r = rnd(W + v * 7);
  alpha(g, 0.85, () => { ellipse(g, W / 2, 19, W / 2 - 3, 4.5, '#120c0c'); ellipse(g, W / 2, 19, W / 2 - 12, 3, '#1c1412'); });
  for (let i = 0; i < 14; i++) { const x = 6 + ((r() * (W - 12)) | 0), y = 14 + ((r() * 6) | 0); rect(g, x, y, 3 + ((r() * 4) | 0), 2 + ((r() * 2) | 0), i % 3 ? K.st3 : K.st4); px(g, x, y, K.st6); }
  beam(g, 8, 20, 8 + W * 0.3, 8 + (v ? 6 : 0), 3, '#2a1c14', '#4a3428'); px(g, 8 + W * 0.3, 8 + (v ? 6 : 0), K.ember);
  circle(g, W * 0.68, 16, 5, K.iron1); circle(g, W * 0.68, 16, 3.6, v ? K.slate1 : K.red1); line(g, W * 0.68 - 3, 12, W * 0.68 + 3, 20, K.ash0);
  for (let i = 0; i < 8; i++) px(g, 8 + ((r() * (W - 16)) | 0), 16 + ((r() * 5) | 0), i % 2 ? K.ember : K.fire1);
  return outline(c, K.out);
}

// ================================================================ THE SAPPERS' BRIDGES ================================================================
/* FASCINES: bundles of brushwood bound with withy, stacked in a pyramid and chocked - what the sappers laid on a ditch. 44 x 24 */
export function ubFascines(v = 0) {
  const [c, g] = canvas(46, 26), r = rnd(v * 5 + 3); shadow(g, 23, 24, 21);
  const row = (n, y, x0) => { for (let i = 0; i < n; i++) { const x = x0 + i * 13; rect(g, x, y, 13, 8, '#6a5230'); rect(g, x, y, 13, 2, '#8a6e44'); rect(g, x, y + 6, 13, 2, '#3e2e1a');
    for (let k = 0; k < 6; k++) px(g, x + 1 + ((r() * 11) | 0), y + 1 + ((r() * 6) | 0), r() < 0.5 ? '#a88a58' : '#4a381f');
    for (const lx of [x + 3, x + 9]) { rect(g, lx, y, 1, 8, K.straw2); } circle(g, x + 13, y + 4, 3.8, '#7a5e38'); circle(g, x + 13, y + 4, 1.4, '#3e2e1a'); } };
  row(3, 16, 3); row(2, 8, 9.5); row(1, 1, 16);
  return outline(c, K.out);
}
/* WHERE SAPPERS DIED: the stream bed under the bridges - fascines that never reached the deck, a spear or two, and the drowned face down in the cold water. 64 x 22 */
export function ubBedDead(v = 0) {
  const [c, g] = canvas(66, 24), r = rnd(v * 9 + 4);
  alpha(g, 0.7, () => { ellipse(g, 33, 20, 30, 3, '#3a5460'); });
  for (let i = 0; i < 2; i++) { const x = 4 + i * 22 + v * 3, y = 14 - i * 2; rect(g, x, y, 18, 7, '#4a3a24'); rect(g, x, y, 18, 2, '#6a5434'); rect(g, x, y + 5, 18, 2, '#2a2014'); for (const lx of [x + 5, x + 12]) rect(g, lx, y, 1, 7, K.straw1); circle(g, x + 18, y + 3.5, 3.5, '#5a4630'); }
  for (let i = 0; i < 2; i++) { const x = 34 + i * 17 - v * 4, y = 13 + i * 2, len = 22; ellipse(g, x + len / 2, y + 4, len / 2, 3.4, i ? '#7a8498' : '#8a96a8'); ellipse(g, x + 3, y + 3, 3, 3, '#9aa6b8'); rect(g, x + 8, y + 1, len - 8, 1, '#a8b4c4'); line(g, x + 10, y + 6, x + len, y + 7, '#4a5468'); px(g, x + 1, y + 3, K.ash0); }   /* two drowned men, slate-coated, face down */
  line(g, 28, 22, 60, 6 + v * 3, K.cloth2); px(g, 60, 5 + v * 3, K.silver);
  return outline(c, K.out);
}

// ================================================================ LIGHT (every fire is a lamp) ================================================================
/* a deco ent's lamp, or null: { x, y, r, torch, bare } - torch tints it fire-orange and bare keeps main.js from drawing a torch sprite on it; ubFlick (below) gutters the radius */
export function lightOf(e, px, pyg) {
  if (e.kind === 'ubBrazier') return { x: px, y: pyg - 20, r: 64, r0: 64, torch: true, bare: true, ubFlick: 0.14, holder: false };
  if (e.kind === 'ubWagon' && e.burning) return { x: px, y: pyg - 30, r: 86, r0: 86, torch: true, bare: true, ubFlick: 0.2 };
  if (e.kind === 'ubGlow') return { x: px, y: pyg - (e.up || 0), r: e.r || 56, warm: true, glow: !!e.cold };   /* a lit window or lamp the art draws: the lamp only (nothing to see of it) */
  return null;
}
/* the lamps gutter: fires are never steady. Called every frame by main.js with the level's lights */
export function flicker(lights, time) { for (const l of lights) if (l.ubFlick) l.r = l.r0 * (1 - l.ubFlick + l.ubFlick * (0.5 + 0.5 * Math.sin(time * 11 + l.x * 0.7) * Math.sin(time * 6.3 + l.x * 0.31))); }

/* THE FIRES, live: flame tongues over each burning thing and a few embers lifting off it (L.ubFires: { x, y, w, h } in px, y = the base of the flame) */
export function drawFires(g, fires, cx, cy, time, VW) {
  for (const f of fires) { const sx = Math.round(f.x - cx); if (sx < -60 || sx > VW + 60) continue; const sy = Math.round(f.y - cy);
    flame(g, sx, sy, f.w, f.h, time, f.x * 0.37);
    for (let i = 0; i < 6; i++) { const t = (time * 0.7 + i / 6 + f.x * 0.013) % 1, ex = sx + Math.round(Math.sin(i * 2.3 + f.x) * f.w * 0.35 + Math.sin(time * 3 + i) * 3), ey = sy - Math.round(f.h * 0.6 + t * 46); g.globalAlpha = 1 - t; g.fillStyle = i % 2 ? K.fire3 : K.fire2; g.fillRect(ex, ey, 1, 1); }
    g.globalAlpha = 1; }
}

// ================================================================ THE REGISTRY (main.js reads these) ================================================================
const memo = new Map(), once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
/* kind -> [canvas, bulky, frames?] for a deco ent e (v = variant, w = width in tiles for a pit). Only the field's own kinds; anything else is {} */
export function decoSet(e) {
  const v = e.v || 0;
  switch (e.kind) {
    case 'ubTent': return { ubTent: [once('tent' + v, () => ubTent(v)), true] };
    case 'ubFireRing': return { ubFireRing: [once('ring', ubFireRing), false] };
    case 'ubRack': return { ubRack: [once('rack' + v, () => ubRack(v)), true] };
    case 'ubBrazier': { const f = once('brazier', ubBrazier); return { ubBrazier: [f[0], false, f] }; }
    case 'ubPit': return { ubPit: [once('pit' + (e.w || 10) + 's' + v, () => ubPit(e.w || 10, v + 1)), false] };
    case 'ubSpoil': return { ubSpoil: [once('spoil' + v, () => ubSpoil(v)), false] };
    case 'ubHandcart': return { ubHandcart: [once('cart', ubHandcart), false] };
    case 'ubCrosses': return { ubCrosses: [once('crosses', ubCrosses), false] };
    case 'ubMoundDead': return { ubMoundDead: [once('mound', () => ubMoundDead(5, 4)), false] };
    case 'ubHorse': return { ubHorse: [once('horse' + v, () => ubHorse(v)), false] };
    case 'ubLances': return { ubLances: [once('lances' + (e.w || 60) + 's' + v, () => ubLances(e.w || 60, v + 1)), false] };
    case 'ubWagon': return { ubWagon: [once('wagon' + v + (e.burning ? 'b' : ''), () => ubWagon(v, !!e.burning)), false] };
    case 'ubShieldWall': return { ubShieldWall: [once('swall' + (e.w || 150), () => ubShieldWall(e.w || 150)), false] };
    case 'ubBoltRack': return { ubBoltRack: [once('rack2', SG.ubBoltRack), false] };
    case 'ubMantlet': return { ubMantlet: [once('mantlet' + v, () => SG.ubMantlet(v === 1)), false] };
    case 'ubBallistaDead': return { ubBallistaDead: [once('bdead' + v, () => SG.ubBallistaDead(v)), false] };
    case 'ubBallistaHang': return { ubBallistaHang: [once('bhang', SG.ubBallistaHang), false] };
    case 'ubGantry': return { ubGantry: [once('gantry', SG.ubGantry), false] };
    case 'ubBarbette': return { ubBarbette: [once('barbette', SG.ubBarbette), false] };
    case 'ubGlow': return { ubGlow: [once('glow', () => canvas(1, 1)[0]), false] };
    case 'ubCrater': return { ubCrater: [once('crater' + (e.w || 6) + 's' + v, () => ubCrater(e.w || 6, v)), false] };
    case 'ubFascines': return { ubFascines: [once('fasc' + v, () => ubFascines(v)), false] };
    case 'ubBedDead': return { ubBedDead: [once('bedd' + v, () => ubBedDead(v)), false] };
    case 'ubFiringStep': return { ubFiringStep: [once('fstep', SG.ubFiringStep), false] };
    case 'ubEmplace': return { ubEmplace: [once('emplace', SG.ubEmplacement), false] };
    default: return null;
  }
}
/* the FACADES the level lists (L.facades [x0, x1, y0, y1, kind]): baked once by main.js's drawFacades (kinds starting 'ub') */
export const drawTrestle = SG.drawTrestle;
/* every 'ub' structure kind (main.js drawStructures hands each one its box): the gun-deck trestles, and (claude/unburied4) the piers, cart frames and shores that hold the rest up */
export function drawStructure(g, kind, l, r, t, b, seed) {
  if (kind === 'ubtrestle') return SG.drawTrestle(g, l, r, t, b, seed);
  if (kind === 'ubpier') return SG.drawPier(g, l, r, t, b, seed, false);
  if (kind === 'ubpierCold') return SG.drawPier(g, l, r, t, b, seed, true);
  if (kind === 'ubcart') return SG.drawCartFrame(g, l, r, t, b, seed);
  if (kind === 'ubprop') return SG.drawShores(g, l, r, t, b, seed);
}
export function bakeFacade(kind, tw, th, seed, o) {
  if (kind === 'ubtower') return SG.bakeTower();
  if (kind === 'ubtower2') return SG.bakeTower2();
  return CH.bakeFacade(kind);
}
