// wildwood.js — THE FIRST TWO WOODS' OWN CREATURES: the badger of Bracken Wood and the gar of the Marsh.
// Both are drawn silhouette first, at game scale: a low, wide, striped wedge that reads as a BADGER from across the
// screen, and a long thin fish with a needle snout that reads as nothing else in the water. All frames face RIGHT (L is
// the flip); every frame of a set shares one canvas, so the anchor holds. Anchors follow chars.js: ax = the body's
// centre column, ay = the row under the lowest pixel (the outline row).
//
// bakeBadger()  BADGER — grey-grizzled back, black legs and belly, the white head with the black band through the eye
//   from the ear to the nose.
//   frames: 0, 1 walk (legs swapped), 2 CHARGE TELL (rump up, head down, fore claws dug in, eye red), 3 CHARGE (long and
//           low, legs flung fore and aft, eye red), 4 DAZED (sat back on its haunches, head down, eye shut)
//   canvas 32x16   anchor ax 13, ay 14   pack w/h 14x9
//
// bakeGar()  LONGNOSE GAR — olive back spotted dark, a pale belly, a long needle snout lined with teeth, a gold eye.
//   frames: 0, 1 swim (tail up, tail down), 2 LUNGE (straight, jaws open), 3, 4 BEACHED (bent one way and the other, flopping)
//   canvas 36x14   anchor ax 15, ay 12   pack w/h 18x6
import { canvas, px, rect, ellipse, fillPoly, outline, flipX, whiten, mulberry } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}

// ---------- BADGER ----------
const BA = { fur: '#8a8690', furL: '#b4b0ba', furD: '#5e5a66', black: '#24202a', white: '#eeeae0', whiteD: '#c8c2b4', claw: '#d8d0b8', eye: '#9aa0a8', red: '#ff5a2a', nose: '#141018' };
export function bakeBadger() {
  const W = 32, H = 16, GROUND = 13;   /* the lowest pixel row: ay = 14 */
  const frame = (pose, step) => {
    const [c, g] = canvas(W, H), rnd = mulberry(77 + step);
    const tell = pose === 'tell', charge = pose === 'charge', dazed = pose === 'dazed';
    const bx = 13 + (charge ? 1 : 0), by = dazed ? 9.5 : tell ? 7 : 8, rx = charge ? 10.5 : 9, ry = dazed ? 3.2 : 3.4;
    // far legs, in shadow
    const legs = charge ? [[bx - 9, -1], [bx + 6, 2]] : dazed ? [[bx - 7, 0], [bx + 5, 1]] : step ? [[bx - 6, 1], [bx + 4, -1]] : [[bx - 7, -1], [bx + 5, 1]];
    for (const [lx, sh] of legs) { rect(g, lx + 1 + sh, by + 1, 2, GROUND - by, BA.black); }
    // the body: a low grizzled loaf, darker under, a lit ridge along the spine
    ellipse(g, bx, by, rx, ry, BA.fur, BA.furD);
    ellipse(g, bx - 0.5, by - 1, rx - 1.5, ry - 1.6, BA.fur);
    for (let x = Math.round(bx - rx + 3); x < bx + rx - 2; x++) px(g, x, Math.round(by - ry + 1 + (tell ? (bx - x) * 0.08 : 0)), BA.furL);
    for (let i = 0; i < 10; i++) px(g, Math.round(bx - rx + 2 + rnd() * (rx * 2 - 4)), Math.round(by - 1 + rnd() * 2), BA.furL);   /* the grizzle */
    rect(g, Math.round(bx - rx + 2), Math.round(by + ry - 1.5), Math.round(rx * 2 - 4), 2, BA.black);   /* the black underside */
    // the tail: a short pale tuft
    fillPoly(g, [[bx - rx, by - 2], [bx - rx - 3, by - (tell ? 4 : 2)], [bx - rx - 2, by + 1]], BA.furL);
    // near legs, black, pale claws
    const near = charge ? [[bx - 8, -3], [bx + 7, 3]] : dazed ? [[bx - 6, 0], [bx + 4, 2]] : step ? [[bx - 7, -1], [bx + 5, 1]] : [[bx - 6, 1], [bx + 4, -1]];
    for (const [lx, sh] of near) { rect(g, lx + sh, by + 1, 3, GROUND - by, BA.black); rect(g, lx + sh + (charge && sh > 0 ? 1 : 0) + 1, GROUND, 2, 1, BA.claw); }
    // the head: a white wedge, snout forward and down; lower still on the tell and the daze
    const hx = bx + rx - 3 + (charge ? 2 : 0), hy = by - 3 + (tell ? 3 : dazed ? 4 : charge ? 1 : 0);
    fillPoly(g, [[hx - 1, hy], [hx + 4, hy + 1], [hx + 9, hy + 4], [hx + 9, hy + 6], [hx + 3, hy + 7], [hx - 2, hy + 5]], BA.white);
    fillPoly(g, [[hx + 1, hy + 5], [hx + 8, hy + 5.5], [hx + 3, hy + 7], [hx - 1, hy + 6]], BA.whiteD);   /* the jaw in shade */
    fillPoly(g, [[hx - 1, hy + 1.5], [hx + 3, hy + 2.2], [hx + 9, hy + 4.4], [hx + 8.5, hy + 5.2], [hx + 2, hy + 4.4], [hx - 1.5, hy + 3.8]], BA.black);   /* the band through the eye */
    px(g, hx - 1, hy - 1, BA.white); px(g, hx, hy - 1, BA.whiteD);   /* the ear */
    px(g, hx + 9, hy + 4, BA.nose); px(g, hx + 9, hy + 5, BA.nose);
    if (!dazed) px(g, hx + 3, hy + 3, tell || charge ? BA.red : BA.eye); else px(g, hx + 3, hy + 3, BA.furD);
    if (tell) for (let i = 0; i < 3; i++) px(g, hx + 5 + i, GROUND, BA.claw);   /* the fore claws dug into the ground */
    return outline(c, OUT);
  };
  return pack([frame('walk', 0), frame('walk', 1), frame('tell', 0), frame('charge', 0), frame('dazed', 0)], 13, 14, 14, 9);
}

// ---------- GAR ----------
const GA = { back: '#5e6e34', backD: '#3e4a22', side: '#8a9a4e', belly: '#d4d2a0', spot: '#26301a', fin: '#4a5a2a', finL: '#7a8a44', snout: '#9aa05a', tooth: '#f0ecd8', eye: '#e8c040', red: '#ff5a2a', mouth: '#7a2a2a' };
export function bakeGar() {
  const W = 36, H = 14;
  const frame = (pose, k) => {
    const [c, g] = canvas(W, H), rnd = mulberry(311);
    const lunge = pose === 'lunge', beached = pose === 'beached';
    // the body as a run of short slices along a centre line that can bend (a flop) or wave (a swim)
    const bend = beached ? (k ? 2.4 : -2.4) : 0, wave = pose === 'swim' ? (k ? 1 : -1) : 0;
    const cy = x => 7 + bend * Math.sin((x - 4) / 22 * Math.PI) + (x < 10 ? wave * (10 - x) / 8 : 0);
    for (let x = 4; x <= 25; x++) { const t = (x - 4) / 21, half = 2.6 * Math.sin(Math.min(1, t * 1.25 + 0.12) * Math.PI) + 0.4, y = cy(x);
      rect(g, x, Math.round(y - half), 1, Math.max(1, Math.round(half * 2)), GA.side);
      px(g, x, Math.round(y - half), GA.backD); px(g, x, Math.round(y - half) + 1, GA.back);
      if (half > 1.4) px(g, x, Math.round(y + half) - 1, GA.belly); }
    for (let i = 0; i < 9; i++) { const x = 6 + Math.floor(rnd() * 17); px(g, x, Math.round(cy(x) - 1 - rnd()), GA.spot); }   /* the spots */
    // the tail fin and the back fin, both set far back as a gar's are
    const ty = cy(4);
    fillPoly(g, [[4, ty - 0.5], [0, ty - 3.5 - wave], [1, ty + 0.5], [0, ty + 3.5 - wave], [4, ty + 1]], GA.fin);
    px(g, 1, Math.round(ty - 2 - wave), GA.finL);
    fillPoly(g, [[7, cy(7) - 2], [9, cy(8) - 4.5], [11, cy(11) - 2]], GA.fin);
    fillPoly(g, [[8, cy(8) + 2], [10, cy(9) + 4], [12, cy(12) + 2]], GA.fin);
    // the snout: a long needle, jaws apart on the lunge, a row of teeth
    const sy = cy(25), open = lunge ? 1.5 : 0;
    rect(g, 26, Math.round(sy - 1 - open), 9, 1, GA.snout); rect(g, 26, Math.round(sy + open), 8, 1, GA.side);
    if (lunge) { rect(g, 26, Math.round(sy - open), 6, Math.round(open * 2), GA.mouth); for (let x = 27; x < 33; x += 2) { px(g, x, Math.round(sy - open), GA.tooth); px(g, x + 1, Math.round(sy + open) - 1, GA.tooth); } }
    else for (let x = 27; x < 34; x += 2) px(g, x, Math.round(sy), GA.tooth);
    px(g, 23, Math.round(sy - 1), lunge ? GA.red : GA.eye);
    return outline(c, OUT);
  };
  return pack([frame('swim', 0), frame('swim', 1), frame('lunge', 0), frame('beached', 0), frame('beached', 1)], 15, 12, 18, 6);
}
