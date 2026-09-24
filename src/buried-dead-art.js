// buried-dead-art.js — THE BURIED DEAD, drawn as himself (Daniel, 2026-09-24: "a unique sprite"). Until today he was
// bakeDead(true): the ZOMBIE'S baker at three times the size, so the boss of the Burial Caverns was a big zombie with a
// few bones pinned on. He is a CORPSE-KING HALF RISEN: a barrow king who never finished getting up. From the waist down
// he is still the grave - a heap of black earth with his own bones and a broken slab in it - and he moves the way the
// rest of the dead do not, dragging the whole mound with his arms. Crown rusted to the skull, a shroud gone to rags,
// a ribcage the poison lives in (it glows green when the nova is coming), and hands the size of a man.
//
// Every tell has its own pose, bigger and slower than its blow (px.js primitives only; tools/buried-dead-art.mjs renders
// the sheet in Node, docs/burial/buried-dead-sheet.png). Frames face RIGHT, one canvas, grounded (the mound sits on ay).
//
//   0,1  DRAG (idle / hauling himself along)   2  SWEEP TELL (arm flung back)     3  SLAM TELL (both fists up)
//   4    NOVA TELL (ribs open, the poison lit)  5  OPEN (slumped, head down)       6  BURIED (the mound, a crown, fingers)
//   7    THROW TELL (a body over his shoulder)  8  CALL TELL (arms up to the roof)  9  HANDS TELL (both hands in the earth)
//   10   SKULL TELL (a lit skull held up)       11 BODY-SLAM TELL (sunk and coiled) 12 BODY SLAM (out of the grave, flying)
//   13   STUCK (THE OPENING HE GIVES YOU: his arm in the floor to the shoulder)       14 RISING / SINKING (half out)
//   15   SLAM (fists in the floor)              16 SWEEP (the arm through)          17 THROWN (the arm out, hand empty)
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from './px.js';
import { OUT } from './art.js';

const C = { earth: '#2e2620', earthL: '#4a3c30', earthD: '#1e1814', clay: '#5c4a38', bone: '#d8cfb0', boneD: '#a89e80', boneS: '#76705c',
  skin: '#748459', skinL: '#98a374', skinD: '#4e5a3c', rib: '#c9c0a0', shroud: '#3a3446', shroudL: '#554c64', shroudD: '#241f2e',
  crown: '#8a6a2a', crownL: '#d4a84a', crownD: '#5a4418', rust: '#8a4a2a', eye: '#f0de85', eyeL: '#fff2bb', poison: '#a6e04a', poisonD: '#5c8a24',
  slab: '#6a6670', slabL: '#8e8a94', glow: '#ffd36b', skull: '#e8e0c4' };
export const KING_W = 112, KING_H = 118;   /* 118: his fists over his head in the slam tell reach 90 px above the mound */
const AX = 56;

/* WHICH POSE, from what he is doing. Order matters: an opening outranks the rest he takes after it, and a blow's own
   frame (e.effect, a third of a second) outranks the rest it leaves him in, so a slam is SEEN to land. */
export function kingFrame(e) {
  const m = e.mode;
  if (m === 'sleep') return 6;
  if (m === 'wake' || m === 'sinkTell') return 14;
  if (m === 'stuck') return 13;
  if (m === 'burrow' || m === 'eruptTell') return 6;
  if (m === 'bodyFly') return 12;
  const TELL = { bodyTell: 11, novaTell: 4, slamTell: 3, throwTell: 7, callTell: 8, clawTell: 9, skullTell: 10, cleaveTell: 2, rally: 8 };
  if (TELL[m] !== undefined) return TELL[m];
  if (e.effectT > 0) { const HIT = { slamTell: 15, cleaveTell: 16, throwTell: 17, skullTell: 17, clawTell: 9 }; if (HIT[e.effect] !== undefined) return HIT[e.effect]; }
  if (e.open > 0) return 5;
  return Math.abs(e.vx || 0) > 2 ? (Math.floor((e.anim || 0) * 3) % 2) : 0;
}

export function bakeBuriedDeadKing() {
  const W = KING_W, H = KING_H, cx = AX, floor = H - 1;
  /* THE MOUND: what is left of his grave, round his waist. `sh` shifts its crest (he drags it), `lo` sinks it */
  const mound = (g, sh = 0, lo = 0, wide = 42) => {
    fillPoly(g, [[cx - wide, floor], [cx - wide + 8, floor - 10 + lo], [cx - 18 + sh, floor - 19 + lo], [cx + 14 + sh, floor - 20 + lo], [cx + wide - 6, floor - 9 + lo], [cx + wide, floor]], C.earth);
    fillPoly(g, [[cx - wide + 10, floor - 9 + lo], [cx - 16 + sh, floor - 17 + lo], [cx + 12 + sh, floor - 18 + lo], [cx + 20 + sh, floor - 14 + lo], [cx - 4 + sh, floor - 12 + lo]], C.earthL);
    for (let k = 0; k < 12; k++) px(g, cx - wide + 6 + ((k * 37) % (wide * 2 - 10)), floor - 2 - ((k * 13) % 7), k & 1 ? C.clay : C.earthD);
    /* his own bones in it: a thigh bone, a jaw, finger bones, and the broken slab leaning out behind */
    line(g, cx - 30, floor - 4, cx - 20, floor - 7, C.boneD, 2); circle(g, cx - 31, floor - 4, 1.5, C.bone); circle(g, cx - 19, floor - 7, 1.5, C.bone);
    rect(g, cx + 24, floor - 5, 5, 2, C.boneD); px(g, cx + 25, floor - 6, C.bone); px(g, cx + 27, floor - 6, C.bone);
    for (let k = 0; k < 3; k++) line(g, cx + 8 + k * 3, floor - 2, cx + 9 + k * 3, floor - 5, C.boneS);
  };
  const slab = (g, lo = 0) => { fillPoly(g, [[cx - 38, floor - 12 + lo], [cx - 33, floor - 36 + lo], [cx - 25, floor - 38 + lo], [cx - 21, floor - 16 + lo]], C.slab);
    line(g, cx - 33, floor - 35 + lo, cx - 26, floor - 37 + lo, C.slabL); line(g, cx - 30, floor - 28 + lo, cx - 27, floor - 22 + lo, C.shroudD); line(g, cx - 32, floor - 25 + lo, cx - 26, floor - 26 + lo, C.shroudD); };
  /* THE TORSO: a ribcage under rotten skin, the shroud over the shoulders. wy is the waist (where the mound takes him),
     lean moves the shoulders over it, open splits the ribs for the nova */
  const torso = (g, wy, lean = 0, open = 0) => {
    const sy = wy - 34, sx = cx + lean;
    fillPoly(g, [[cx - 14, wy], [sx - 20, sy + 4], [sx - 14, sy - 2], [sx + 14, sy - 2], [sx + 20, sy + 4], [cx + 14, wy]], C.shroud);     /* the shroud, behind */
    fillPoly(g, [[cx - 11, wy], [sx - 15, sy + 4], [sx + 15, sy + 4], [cx + 11, wy]], C.skinD);
    fillPoly(g, [[cx - 9, wy - 2], [sx - 12, sy + 6], [sx + 12, sy + 6], [cx + 9, wy - 2]], C.skin);
    for (let k = 0; k < 5; k++) { const y = sy + 9 + k * 4, t = k / 5, x0 = sx - 11 + (lean * t) * 0.3 + k, x1 = sx + 11 - k;   /* the ribs */
      line(g, x0, y, cx - 2 + lean * (1 - t) * 0.5 - open, y + 1, C.rib); line(g, cx + 2 + lean * (1 - t) * 0.5 + open, y + 1, x1, y, C.rib); }
    line(g, sx, sy + 6, cx, wy - 4, C.boneD, 2);                                                                                    /* the spine, seen through */
    if (open) { ellipse(g, sx, sy + 18, open + 1, 9, C.poisonD); ellipse(g, sx, sy + 18, Math.max(1, open - 1), 6, C.poison); px(g, sx, sy + 14, '#e8ffb0'); }
    fillPoly(g, [[sx - 21, sy + 5], [sx - 16, sy - 3], [sx - 6, sy - 1], [sx - 10, sy + 10], [sx - 18, sy + 14]], C.shroudL);      /* the rag over each shoulder */
    fillPoly(g, [[sx + 21, sy + 5], [sx + 16, sy - 3], [sx + 6, sy - 1], [sx + 10, sy + 10], [sx + 18, sy + 14]], C.shroudL);
    for (let k = 0; k < 4; k++) line(g, sx - 19 + k, sy + 12 + k * 2, sx - 20 + k, sy + 16 + k * 2, C.shroudD);
    return [sx, sy];
  };
  /* THE HEAD: a skull with the face half gone, the crown rusted onto it, one eye still lit. tilt: -1 back, 1 down */
  const head = (g, x, y, tilt = 0, jaw = 0) => {
    const hy = y + tilt * 3;
    ellipse(g, x + 2, hy, 8, 9, C.bone); ellipse(g, x - 1, hy + 1, 5, 6, C.skin);                                    /* skull, rotten skin half over it */
    rect(g, x - 3, hy - 2, 4, 4, OUT); rect(g, x + 4, hy - 2, 4, 4, OUT); rect(g, x + 5, hy - 1, 2, 2, C.eye); px(g, x + 5, hy - 1, C.eyeL);
    px(g, x + 2, hy + 3, OUT); px(g, x + 3, hy + 3, OUT);
    rect(g, x - 3, hy + 6 + jaw, 11, 3, C.boneD); for (let k = 0; k < 5; k++) px(g, x - 2 + k * 2, hy + 6 + jaw, C.bone);                /* the jaw, hanging by what is left */
    if (jaw > 1) { line(g, x + 2, hy + 9 + jaw, x + 2, hy + 12 + jaw, C.poison); px(g, x + 2, hy + 13 + jaw, C.poisonD); }
    const cy0 = hy - 8 - (tilt < 0 ? 1 : 0);                                                                                           /* the crown */
    rect(g, x - 6, cy0, 16, 3, C.crown); line(g, x - 6, cy0, x + 9, cy0, C.crownL);
    for (const [dx, h] of [[-6, 5], [-1, 6], [4, 6], [9, 5]]) { fillPoly(g, [[x + dx - 1, cy0], [x + dx + 1, cy0 - h], [x + dx + 3, cy0]], C.crown); px(g, x + dx + 1, cy0 - h + 1, C.crownL); }
    px(g, x + 1, cy0 + 1, C.rust); px(g, x + 7, cy0 + 1, C.rust); px(g, x - 3, cy0 + 1, '#6fe0ff');
  };
  /* AN ARM: shoulder -> elbow -> hand, skin over bone, and a hand the size of a man's chest */
  const arm = (g, s, el, h) => { line(g, s[0], s[1], el[0], el[1], C.skinD, 4); line(g, s[0], s[1] - 1, el[0], el[1] - 1, C.skin, 2);
    line(g, el[0], el[1], h[0], h[1], C.boneD, 3); line(g, el[0], el[1] - 1, h[0], h[1] - 1, C.bone, 1); circle(g, el[0], el[1], 2, C.skinL); };
  const hand = (g, x, y, kind = 'claw', dir = 1) => {
    if (kind === 'fist') { ellipse(g, x, y, 6, 5, C.bone); for (let k = 0; k < 4; k++) line(g, x - 4 + k * 3, y - 4, x - 4 + k * 3, y - 1, C.boneS); return; }
    if (kind === 'buried') { for (let k = 0; k < 4; k++) line(g, x - 5 + k * 3, y, x - 6 + k * 3, y - 3 - (k & 1), C.bone); return; }   /* fingertips out of the earth */
    ellipse(g, x, y, 5, 4, C.boneD);
    const up = kind === 'open' ? -1 : 1;
    for (let k = 0; k < 4; k++) { const fx = x - 5 + k * 3; line(g, fx, y + 2 * up, fx + dir * (k - 1), y + 8 * up, C.bone); px(g, fx + dir * (k - 1), y + 9 * up, C.boneS); }
    line(g, x + dir * 5, y, x + dir * 9, y - 2 * up, C.bone);
  };
  const skullHeld = (g, x, y) => { circle(g, x, y, 5, C.poisonD); circle(g, x, y, 4, C.skull); rect(g, x - 3, y - 1, 2, 2, C.poison); rect(g, x + 1, y - 1, 2, 2, C.poison); rect(g, x - 2, y + 3, 5, 2, C.boneD);
    for (let k = 0; k < 5; k++) px(g, x - 6 + k * 3, y - 7 - (k & 1) * 2, C.poison); };
  const corpse = (g, x, y) => { fillPoly(g, [[x - 14, y - 4], [x + 8, y - 8], [x + 12, y - 2], [x - 10, y + 3]], C.skinD); ellipse(g, x + 12, y - 6, 4, 4, C.skinL); line(g, x - 14, y - 2, x - 20, y + 6, C.skinD, 2); line(g, x - 11, y + 1, x - 15, y + 9, C.skinD, 2); };
  const stars = (g, x, y) => { for (let k = 0; k < 4; k++) px(g, x + k * 5, y - (k & 1) * 3, C.glow); };
  const crack = (g, x, w) => { for (let k = -w; k <= w; k += 2) px(g, x + k, floor - (k % 4 === 0 ? 1 : 0), C.poison); };

  const F = [];
  for (let f = 0; f < 18; f++) {
    const [c, g] = canvas(W, H);
    const wy0 = floor - 16;                                   /* the waist, where the mound holds him */
    if (f === 6) {                                            /* BURIED: the mound, a crown's points and his fingertips */
      slab(g, 2); mound(g, 0, 4, 40);
      for (const [dx, h] of [[-4, 4], [0, 5], [4, 5], [8, 4]]) { fillPoly(g, [[cx + dx - 1, floor - 14], [cx + dx + 1, floor - 14 - h], [cx + dx + 3, floor - 14]], C.crown); px(g, cx + dx + 1, floor - 13 - h, C.crownL); }
      rect(g, cx - 5, floor - 15, 16, 2, C.crownD); hand(g, cx - 24, floor - 14, 'buried'); hand(g, cx + 26, floor - 13, 'buried');
    } else if (f === 12) {                                    /* BODY SLAM, in the air: all of him out of the grave, shroud streaming, arms wide */
      const wy = floor - 30; const [sx, sy] = torso(g, wy, 2);
      fillPoly(g, [[cx - 14, wy], [cx + 14, wy], [cx + 10, wy + 12], [cx + 2, wy + 20], [cx - 6, wy + 14], [cx - 16, wy + 22]], C.shroudD);   /* rags where his legs were */
      for (let k = 0; k < 5; k++) px(g, cx - 12 + k * 6, wy + 24 + (k & 1) * 3, C.earthL);
      arm(g, [sx - 18, sy + 4], [sx - 30, sy - 4], [sx - 40, sy - 10]); hand(g, sx - 42, sy - 12, 'claw', -1);
      arm(g, [sx + 18, sy + 4], [sx + 30, sy - 4], [sx + 40, sy - 10]); hand(g, sx + 42, sy - 12, 'claw', 1);
      head(g, sx - 1, sy - 10, -1, 3);
    } else {
      const P = {                                              /* per pose: lean, rise, sink, mound shift, rib split, head tilt, jaw */
        0: [3, 0, 0, 0, 0, 0, 1], 1: [6, 0, 0, 5, 0, 1, 1], 2: [-4, 2, 0, 0, 0, -1, 2], 3: [0, 6, 0, 0, 0, -1, 3], 4: [0, 3, 0, 0, 4, -1, 4],
        5: [10, -6, 0, 0, 0, 2, 3], 7: [-5, 2, 0, 0, 0, -1, 2], 8: [0, 6, 0, 0, 2, -1, 4], 9: [12, -4, 0, 2, 0, 1, 2], 10: [-3, 4, 0, 0, 0, -1, 2],
        11: [4, -10, 3, 0, 0, 1, 1], 13: [16, -8, 0, 0, 0, 2, 4], 14: [2, -14, 4, 0, 0, 1, 2], 15: [14, -6, 0, 0, 0, 1, 3], 16: [8, 0, 0, 0, 0, 0, 2], 17: [8, 2, 0, 0, 0, 0, 2] }[f];
      const [lean, rise, lo, msh, open, tilt, jaw] = P, wy = wy0 - rise;
      slab(g, lo);
      /* the far arm is drawn before the body, the near arm after it */
      const far = [], near = [];
      const S = (dx, dy) => [cx + lean + dx, wy - 34 + dy];
      if (f === 0 || f === 1) { const r = f ? 4 : 0; far.push(() => { arm(g, S(-18, 4), [cx - 30, wy - 14], [cx - 36 + r, floor - 14]); hand(g, cx - 36 + r, floor - 15, 'claw', -1); });
        near.push(() => { arm(g, S(18, 4), [cx + 32 + r, wy - 16], [cx + 40 + r * 2, floor - 16]); hand(g, cx + 40 + r * 2, floor - 17, 'claw'); }); }
      else if (f === 2) { far.push(() => { arm(g, S(-18, 4), [cx - 30, wy - 12], [cx - 34, floor - 14]); hand(g, cx - 34, floor - 15, 'claw', -1); });
        near.push(() => { arm(g, S(18, 2), [cx - 6, wy - 58], [cx - 26, wy - 66]); hand(g, cx - 28, wy - 68, 'claw', -1); }); }                      /* SWEEP TELL: the arm flung back over his head */
      else if (f === 3) { far.push(() => { arm(g, S(-16, 2), [cx - 22, wy - 56], [cx - 10, wy - 72]); hand(g, cx - 10, wy - 76, 'fist'); });
        near.push(() => { arm(g, S(16, 2), [cx + 24, wy - 56], [cx + 12, wy - 72]); hand(g, cx + 12, wy - 76, 'fist'); }); }                           /* SLAM TELL: both fists up */
      else if (f === 4) { far.push(() => { arm(g, S(-18, 4), [cx - 34, wy - 34], [cx - 46, wy - 44]); hand(g, cx - 48, wy - 46, 'open', -1); });
        near.push(() => { arm(g, S(18, 4), [cx + 34, wy - 34], [cx + 46, wy - 44]); hand(g, cx + 48, wy - 46, 'open'); }); }                             /* NOVA TELL: arms wide, the poison lit in him */
      else if (f === 5) { far.push(() => { arm(g, S(-14, 6), [cx - 18, wy - 8], [cx - 20, floor - 8]); hand(g, cx - 18, floor - 9, 'claw', -1); });
        near.push(() => { arm(g, S(16, 6), [cx + 26, wy - 6], [cx + 30, floor - 6]); hand(g, cx + 32, floor - 7, 'claw'); }); }                           /* OPEN: slumped over his own grave */
      else if (f === 7) { far.push(() => { arm(g, S(-18, 4), [cx - 30, wy - 12], [cx - 34, floor - 14]); hand(g, cx - 34, floor - 15, 'claw', -1); });
        near.push(() => { corpse(g, cx - 16, wy - 62); arm(g, S(16, 2), [cx + 4, wy - 56], [cx - 12, wy - 60]); hand(g, cx - 14, wy - 60, 'claw', -1); }); }   /* THROW TELL: a body over his shoulder */
      else if (f === 8) { far.push(() => { arm(g, S(-16, 2), [cx - 32, wy - 50], [cx - 38, wy - 70]); hand(g, cx - 38, wy - 72, 'open', -1); });
        near.push(() => { arm(g, S(16, 2), [cx + 32, wy - 50], [cx + 38, wy - 70]); hand(g, cx + 38, wy - 72, 'open'); for (let k = 0; k < 6; k++) px(g, cx - 30 + k * 12, wy - 80 - (k & 1) * 4, C.poison); }); }   /* CALL: arms to the roof */
      else if (f === 9) { far.push(() => { arm(g, S(-10, 6), [cx + 4, wy - 10], [cx + 24, floor - 2]); hand(g, cx + 24, floor - 1, 'buried'); });
        near.push(() => { arm(g, S(18, 6), [cx + 34, wy - 12], [cx + 44, floor - 2]); hand(g, cx + 44, floor - 1, 'buried'); crack(g, cx + 34, 16); }); }  /* THE HANDS: both of his in the earth, and the crack running */
      else if (f === 10) { far.push(() => { arm(g, S(-18, 4), [cx - 30, wy - 12], [cx - 34, floor - 14]); hand(g, cx - 34, floor - 15, 'claw', -1); });
        near.push(() => { arm(g, S(16, 2), [cx + 6, wy - 58], [cx - 8, wy - 70]); skullHeld(g, cx - 8, wy - 76); hand(g, cx - 8, wy - 70, 'claw', -1); }); }   /* SKULL TELL: a lit skull held up and back */
      else if (f === 11) { far.push(() => { arm(g, S(-18, 6), [cx - 30, wy - 4], [cx - 38, floor - 6]); hand(g, cx - 38, floor - 7, 'claw', -1); });
        near.push(() => { arm(g, S(18, 6), [cx + 30, wy - 4], [cx + 40, floor - 6]); hand(g, cx + 40, floor - 7, 'claw'); }); }                           /* BODY-SLAM TELL: sunk, coiled on his hands */
      else if (f === 13) { far.push(() => { arm(g, S(-12, 6), [cx - 16, wy - 6], [cx - 20, floor - 8]); hand(g, cx - 20, floor - 9, 'claw', -1); });
        near.push(() => { arm(g, S(16, 6), [cx + 32, wy - 4], [cx + 40, floor]); rect(g, cx + 34, floor - 2, 14, 2, C.earthD); for (let k = 0; k < 6; k++) px(g, cx + 32 + k * 3, floor - 3 - (k & 1), C.clay); stars(g, cx + 20, wy - 60); }); }   /* STUCK: the arm in to the shoulder */
      else if (f === 14) { far.push(() => { hand(g, cx - 28, floor - 14, 'claw', -1); }); near.push(() => { arm(g, S(16, 6), [cx + 28, wy - 8], [cx + 34, floor - 12]); hand(g, cx + 34, floor - 13, 'claw'); }); }   /* RISING / SINKING */
      else if (f === 15) { far.push(() => { arm(g, S(-10, 6), [cx + 6, wy - 16], [cx + 24, floor - 4]); hand(g, cx + 24, floor - 5, 'fist'); });
        near.push(() => { arm(g, S(18, 6), [cx + 34, wy - 14], [cx + 42, floor - 4]); hand(g, cx + 42, floor - 5, 'fist'); for (let k = 0; k < 8; k++) px(g, cx + 14 + k * 5, floor - 2 - (k & 1) * 3, C.earthL); }); }   /* SLAM: fists in the floor */
      else if (f === 16) { far.push(() => { arm(g, S(-18, 4), [cx - 30, wy - 12], [cx - 34, floor - 14]); hand(g, cx - 34, floor - 15, 'claw', -1); });
        near.push(() => { arm(g, S(18, 4), [cx + 38, wy - 26], [cx + 52, wy - 20]); hand(g, cx + 53, wy - 21, 'claw'); for (let k = 0; k < 5; k++) px(g, cx + 30 + k * 5, wy - 36 + k * 4, C.boneS); }); }   /* SWEEP: the arm through */
      else if (f === 17) { far.push(() => { arm(g, S(-18, 4), [cx - 30, wy - 12], [cx - 34, floor - 14]); hand(g, cx - 34, floor - 15, 'claw', -1); });
        near.push(() => { arm(g, S(18, 2), [cx + 36, wy - 40], [cx + 50, wy - 44]); hand(g, cx + 52, wy - 45, 'open'); }); }                              /* THROWN: arm out, hand empty */
      for (const d of far) d();
      const [sx, sy] = torso(g, wy, lean, open);
      mound(g, msh, lo);
      head(g, sx - 1, sy - 10, tilt, jaw);
      if (f === 5) stars(g, sx - 6, sy - 26);
      for (const d of near) d();
    }
    outline(c, OUT); F.push(c);
  }
  const R = F, L = F.map(flipX), WR = F.map(c => whiten(c));
  return { R, L, white: { R: WR, L: WR.map(flipX) }, ax: AX, ay: H, w: W, h: H };
}
