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

// ---------- BOAR (claude/oldtusker, redrawn claude/oldtuskerart) ----------
// bakeBoar()  THE BOAR - the Lumber Trail's charger (replaces the badger: the same AI, its told charge and the plunge-on-its-back lesson; reusable on any wood level
//   as ent('badger', x, y, { cnSkin: 'boar' })). A dark bristled wedge, high at the shoulder, grey-frosted along the withers with a stiff mane, mud on the belly, a pale snout disc, two stained tusks.
//   frames: 0, 1 walk, 2 CHARGE TELL (head down, a fore hoof raking and the dust, eye red), 3 CHARGE (long and low, legs flung, dust trail), 4 DAZED (sat back, head down, eye shut, stars)
//   canvas 36x20   anchor ax 15, ay 18   pack w/h 18x12
const BO = { hide: '#5c3c28', hideM: '#6b4630', hideL: '#85603f', hideH: '#a47c52', hideD: '#3a2418', hideDD: '#24140c', bristle: '#22160e', frost: '#a89a88', mud: '#46301e', snout: '#b88a78', snoutD: '#6a4232', tusk: '#f2ead2', tuskD: '#b49a64', hoof: '#1a120c', eye: '#ffcf6a', red: '#ff4a2a', dust: '#c9b27c', dustD: '#8a6a40', star: '#ffd36b' };
export function bakeBoar() {
  const W = 36, H = 20, G = 17;
  const frame = (pose, step) => {
    const [c, g] = canvas(W, H);
    const tell = pose === 'tell', charge = pose === 'charge', dazed = pose === 'dazed';
    const bx = 15 + (charge ? 1 : 0), by = dazed ? 12 : tell ? 10 : 10.5, rx = charge ? 12.5 : 11, ry = dazed ? 4.2 : 4.8;
    /* far legs, in shade: a thigh and a thin cannon, a split hoof */
    const legsF = charge ? [[bx - 10, -2], [bx + 7, 2]] : dazed ? [[bx - 8, 0], [bx + 6, 1]] : step ? [[bx - 7, 1], [bx + 5, -1]] : [[bx - 8, -1], [bx + 6, 1]];
    for (const [lx, sh] of legsF) { rect(g, lx + 1 + sh, by + 2, 2, G - by - 1, BO.hideDD); px(g, lx + 1 + sh, G, BO.hoof); px(g, lx + 2 + sh, G, BO.hoof); }
    /* the barrel: a deep dark loaf, the shoulder humped higher than the rump, lit along the back, mud on the belly, the old grey frosting the withers */
    ellipse(g, bx - 1, by + 0.5, rx, ry, BO.hide); ellipse(g, bx + 3, by - 1.4, rx * 0.55, ry * 0.9, BO.hide);
    ellipse(g, bx - 1, by - 1.6, rx - 2, ry - 2.4, BO.hideM); ellipse(g, bx + 3, by - 3, rx * 0.4, ry * 0.4, BO.hideL);
    for (let x = Math.round(bx + 1); x < bx + 6; x++) px(g, x, Math.round(by - ry + 0.6), BO.hideH);
    for (let x = Math.round(bx - rx + 3); x < bx + rx - 2; x += 2) px(g, x, Math.round(by + ry - 1), BO.mud);
    for (let i = 0; i < 6; i++) px(g, Math.round(bx + 1 + (i * 5) % 8), Math.round(by - ry + 1 + (i % 2)), BO.frost);
    px(g, Math.round(bx - 3), Math.round(by), BO.hideL); px(g, Math.round(bx - 2), Math.round(by + 1), BO.hideL);   /* a scar */
    /* the mane: stiff spikes standing off the spine, tallest at the shoulder; the tail a kinked wisp */
    for (let x = Math.round(bx - rx + 3); x < bx + rx - 4; x += 2) { const y = Math.round(by - ry - 1 + (tell ? (bx - x) * 0.1 : 0)), tall = (x > bx - 3 && x < bx + 5) ? 3 : 2; rect(g, x, y - tall + 2, 1, tall, BO.bristle); if (tall === 3) px(g, x, y - 1, BO.frost); }
    px(g, Math.round(bx - rx), Math.round(by - 1), BO.hideDD); px(g, Math.round(bx - rx - 1), Math.round(by - 2), BO.hideDD); px(g, Math.round(bx - rx - 1), Math.round(by - 3), BO.bristle);
    /* near legs */
    const legsN = charge ? [[bx - 9, -3], [bx + 8, 3]] : dazed ? [[bx - 7, 0], [bx + 5, 2]] : step ? [[bx - 8, -1], [bx + 6, 1]] : [[bx - 7, 1], [bx + 5, -1]];
    for (const [lx, sh] of legsN) { const lift = tell && lx > bx ? 3 : 0; rect(g, lx + sh, by + 2, 3, G - by - 1 - lift, BO.hide); rect(g, lx + sh, by + 2, 1, G - by - 1 - lift, BO.hideL); rect(g, lx + sh, G - lift - 2, 3, 1, BO.mud); rect(g, lx + sh, G - lift, 1, 1, BO.hoof); rect(g, lx + sh + 2, G - lift, 1, 1, BO.hoof); }
    /* the head: a long wedge, grey at the muzzle, the pale snout disc, the stained tusk rising from the jaw, a notched ear, a heavy brow */
    const hx = bx + rx - 3 + (charge ? 2 : 0), hy = by - 3 + (tell ? 3 : dazed ? 4 : charge ? 1 : 0);
    fillPoly(g, [[hx - 2, hy - 1], [hx + 4, hy], [hx + 9, hy + 3], [hx + 9, hy + 6], [hx + 3, hy + 7], [hx - 2, hy + 5]], BO.hide);
    fillPoly(g, [[hx + 2, hy + 3], [hx + 8, hy + 4], [hx + 8, hy + 6], [hx + 3, hy + 7]], BO.frost);
    rect(g, hx + 8, hy + 3, 2, 3, BO.snout); px(g, hx + 9, hy + 4, BO.snoutD); px(g, hx + 8, hy + 6, BO.hideDD);
    px(g, hx + 6, hy + 3, BO.tuskD); px(g, hx + 6, hy + 2, BO.tusk); px(g, hx + 7, hy + 1, BO.tusk); px(g, hx + 7, hy, BO.tusk);   /* the tusk curling up past the snout */
    px(g, hx - 1, hy - 3, BO.hideDD); px(g, hx, hy - 3, BO.hideDD); px(g, hx - 1, hy - 2, BO.hideD); px(g, hx, hy - 2, BO.snoutD);
    rect(g, hx + 2, hy + 1, 3, 1, BO.hideDD);   /* the brow */
    px(g, hx + 3, hy + 2, dazed ? BO.hideDD : tell || charge ? BO.red : BO.eye);
    if (tell || charge) px(g, hx + 4, hy + 2, BO.red);
    if (tell) { for (let i = 0; i < 3; i++) px(g, hx + 3 + i, G, BO.dustD); px(g, hx + 5, G - 1, BO.dust); px(g, hx + 7, G - 1, BO.dustD); px(g, hx + 9, G - 2, BO.dust); }
    if (charge) { for (let i = 0; i < 3; i++) { px(g, 1 + i * 2, G - (i % 2), BO.dust); px(g, i, G - 2 - i, BO.dustD); } }
    if (dazed) { px(g, hx - 2, hy - 5, BO.star); px(g, hx + 3, hy - 6, BO.star); px(g, hx + 7, hy - 4, BO.star); }
    return outline(c, OUT);
  };
  return pack([frame('walk', 0), frame('walk', 1), frame('tell', 0), frame('charge', 0), frame('dazed', 0)], 15, 18, 18, 12);
}
// bakePineMoth()  THE PINE MOTH (claude/oldtusker, redrawn claude/oldtuskerart) - a big pale timber moth that hangs over water and clearings in the pines: the wasp's hover (a stepping stone
//   with wings for the plunge; high, the rising cut's mark), never a wasp. Broad bark-grey wings with a pale upper edge, a green eyespot on each, a furred body, feathered feelers.
//   frames 0-2 wing beats (up, mid, down), 3 hurt (wings folded flat over the back, dim). canvas 14x10, anchor 7,8, pack 10x7
const MO = { wing: '#d8d0b0', wingL: '#f0ead0', wingD: '#a89a74', wingDD: '#7a6c4c', eye: '#241a10', body: '#8a7a5a', bodyL: '#b4a47a', bodyD: '#5e5038', spot: '#6a8a4a', spotL: '#a8d070', ring: '#3a4a28' };
export function bakePineMoth() {
  const frame = k => { const [c, g] = canvas(14, 10);
    if (k === 3) { fillPoly(g, [[7, 3], [4, 5], [4, 8], [7, 9], [10, 8], [10, 5]], MO.wingD); rect(g, 6, 3, 2, 6, MO.wingDD); px(g, 5, 5, MO.wingDD); px(g, 9, 6, MO.wingDD); px(g, 7, 2, MO.eye); px(g, 6, 2, MO.bodyD); return outline(c, OUT); }
    const up = [-3, -1, 1][k];
    const wing = d => { const o = d < 0 ? 0 : 13;   /* a broad wing: a pale upper edge, a darker hem, the veins and the eyespot */
      fillPoly(g, [[7, 5], [o, 4 + up], [o - d, 6 + up * 0.5], [d < 0 ? 2 : 11, 7 + up * 0.3], [7, 7]], MO.wing);
      fillPoly(g, [[7, 5], [d < 0 ? 4 : 9, 4.5 + up * 0.5], [d < 0 ? 4 : 9, 6 + up * 0.3], [7, 6.4]], MO.wingL);
      for (let i = 1; i < 5; i++) px(g, Math.round(d < 0 ? 7 - i * 1.2 : 7 + i * 1.2), 7 + Math.round(up * 0.2) - (i % 2), MO.wingD);
      px(g, d < 0 ? 3 : 11, 5 + Math.round(up * 0.5), MO.ring); px(g, d < 0 ? 3 : 11, 6 + Math.round(up * 0.4), MO.spot); px(g, d < 0 ? 2 : 12, 5 + Math.round(up * 0.5), MO.spotL); };
    wing(-1); wing(1);
    rect(g, 6, 3, 2, 5, MO.body); px(g, 6, 4, MO.bodyL); px(g, 6, 5, MO.bodyL); px(g, 7, 7, MO.bodyD); px(g, 6, 7, MO.bodyD);
    px(g, 7, 2, MO.eye); px(g, 6, 2, MO.eye); px(g, 5, 1, MO.bodyD); px(g, 4, 0, MO.bodyD); px(g, 8, 1, MO.bodyD); px(g, 9, 0, MO.bodyD);   /* the feathered feelers */
    return outline(c, OUT); };
  return pack([frame(0), frame(1), frame(2), frame(3)], 7, 8, 10, 7);
}
