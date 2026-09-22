// false_abbot.js — THE FALSE ABBOT's sprite (src/false-abbot.js is the fight). px.js primitives only; rendered in Node by
// tools/false-abbot-art.mjs. shore.js's contract: frames face RIGHT, one canvas each, grounded frames settled so ay = H.
//
// THE SILHOUETTE IS THE CREATURE at 320x180, so he is built out of three shapes nothing else in the game has:
//   THE MITRE   a hard cream point a head taller than any goblin - you can find him in a crowd of his own congregation
//   THE COPE    a wide triangular mass off the shoulders, so he reads as BROAD where the priest below reads as thin
//   THE CENSER  out on its chain, away from the body: the reach you can see coming before it arrives
// He is the goblin priest's superior and wears his colours (the same green, the same maroon and saffron, the same bronze
// pot), one size up and with the abbot's own mitre on - the joke being that it does not fit him.
//
// bakeFalseAbbot()  0 idle | 1,2 walk | 3 CENSER TELL (the pot drawn back over the shoulder) | 4 CENSER (swung through)
//                   | 5 CAST TELL (wound across the body) | 6 CAST (arm out, chain flat) | 7 HAUL (pulled onto his front
//                   foot, the chain taut) | 8 PROCESSION TELL (both hands to the chain, head up) | 9,10 PROCESSION
//                   (striding, the pot whirling) | 11 COALS TELL (the pot tipped, lid open) | 12 COALS (coals falling)
//                   | 13 RITE TELL (the pot raised two-handed over the mitre) | 14 RITE (the flare) | 15 KNELL (both
//                   hands on the bell rope, hauling) | 16 DOWNED (THE OPENING: on one knee, mitre off, pot spilled)
//                   | 17 hurt
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

const A = {
  g: '#6faa4a', G: '#3f6e2c', gd: '#2a4a1e',                 // the goblin, lit / mid / shadow
  eye: '#f3f0d2', pup: '#241a10',
  m: '#8e3a32', M: '#5a1e1e', h: '#b8584a',                  // the cope: maroon
  y: '#e8a83a', Y: '#a8681c', Yl: '#ffe08a',                 // the orphrey: saffron and gold
  mit: '#f2ecd8', mitD: '#c9bda0',                           // the mitre: bleached linen over board
  br: ['#3a2a12', '#6a4a1e', '#9a7634', '#c9a44a', '#f0dc8a'],   // bronze
  chain: '#8a8478', coal: '#ff9a3c', coalL: '#ffe08a', smoke: '#d8d0c0',
};
function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(whiten);
  return { R, L, white: { R: white, L: white.map(flipX) }, ax, ay, w, h };
}
function settle(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const thick = (g, x0, y0, x1, y1, col, w = 2) => { const vert = Math.abs(y1 - y0) > Math.abs(x1 - x0);
  for (let k = 0; k < w; k++) line(g, x0 + (vert ? k : 0), y0 + (vert ? 0 : k), x1 + (vert ? k : 0), y1 + (vert ? 0 : k), col); };

export function bakeFalseAbbot() {
  const W = 80, H = 66, cx = 34;
  /* THE MITRE: two boards sewn to a point, a gold band round the brow, and the two lappets down the back. `tilt` leans it. */
  const mitre = (g, x, y, tilt = 0) => {
    fillPoly(g, [[x - 8, y + 9], [x - 6 + tilt, y - 4], [x + tilt, y - 13], [x + 6 + tilt, y - 4], [x + 8, y + 9]], A.mit);
    fillPoly(g, [[x + 1 + tilt, y - 12], [x + 6 + tilt, y - 4], [x + 8, y + 9], [x + 3, y + 9]], A.mitD);
    rect(g, x - 8, y + 6, 17, 3, A.y); rect(g, x - 8, y + 6, 17, 1, A.Yl);
    line(g, x + tilt, y - 12, x, y + 6, A.mitD);
    rect(g, x - 10, y + 9, 3, 9, A.mit); rect(g, x - 10, y + 15, 3, 3, A.y);        // a lappet hanging behind the ear
  };
  /* the head under it: a goblin's, and too small for the mitre - which is the whole joke */
  const head = (g, x, y) => {
    ellipse(g, x, y, 6.5, 6, A.g); ellipse(g, x - 1.5, y - 1.5, 4.5, 4, A.g);
    fillPoly(g, [[x - 6, y - 1], [x - 12, y - 5], [x - 11, y + 2], [x - 5, y + 2]], A.G);   // the ear, back-swept
    px(g, x - 9, y - 2, A.gd);
    rect(g, x + 2, y - 2, 3, 2, A.eye); px(g, x + 4, y - 2, A.pup);
    rect(g, x - 1, y + 3, 6, 1, A.gd); px(g, x + 5, y + 1, A.G);                            // the mouth, and the snout's shadow
  };
  /* THE COPE: a wide triangle off the shoulders with the orphrey down its front. `bend` leans the whole mass forward. */
  const cope = (g, x, y, bend = 0) => {
    fillPoly(g, [[x - 15, y + 30], [x - 11 + bend, y + 2], [x + bend, y - 3], [x + 11 + bend, y + 2], [x + 16, y + 30]], A.M);
    fillPoly(g, [[x - 12, y + 29], [x - 9 + bend, y + 3], [x + bend, y - 2], [x + 9 + bend, y + 3], [x + 13, y + 29]], A.m);
    fillPoly(g, [[x + 4 + bend, y + 1], [x + 9 + bend, y + 3], [x + 13, y + 29], [x + 7, y + 29]], A.h);     // the lit side
    fillPoly(g, [[x - 3 + bend, y + 1], [x + 3 + bend, y + 1], [x + 4, y + 29], [x - 4, y + 29]], A.y);      // the orphrey
    for (let k = 0; k < 5; k++) rect(g, x - 3, y + 6 + k * 5, 7, 1, A.Yl);
    rect(g, x - 13, y + 29, 28, 3, A.M); for (let k = 0; k < 7; k++) px(g, x - 12 + k * 4, y + 30, A.y);     // the hem
  };
  const legs = (g, x, y, ph) => { const a = [0, 3, -3][ph];                                    // only the feet show under the cope
    rect(g, x - 7 + a, y, 6, 3, A.G); rect(g, x + 2 - a, y, 6, 3, A.G); px(g, x - 7 + a, y, A.g); px(g, x + 2 - a, y, A.g); };
  const arm = (g, x0, y0, x1, y1) => { thick(g, x0, y0, (x0 + x1) / 2, (y0 + y1) / 2 + 1, A.m, 3); thick(g, (x0 + x1) / 2, (y0 + y1) / 2 + 1, x1, y1, A.G, 2); };
  const chainTo = (g, x0, y0, x1, y1) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2));
    for (let i = 0; i <= n; i++) px(g, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, i & 1 ? A.chain : A.br[0]); };
  /* THE CENSER: a bronze pot on three chains, pierced, with the coals showing through when it is lit */
  const censer = (g, x, y, lit = 1, open = 0) => {
    rect(g, x - 5, y - 1, 11, 2, A.br[1]);
    fillPoly(g, [[x - 5, y], [x + 5, y], [x + 3, y + 7], [x - 3, y + 7]], A.br[2]);
    fillPoly(g, [[x + 1, y], [x + 5, y], [x + 3, y + 7], [x + 1, y + 7]], A.br[3]);
    if (lit) for (const [dx, dy] of [[-2, 3], [0, 4], [2, 3], [-1, 5]]) px(g, x + dx, y + dy, Math.abs(dx) < 2 ? A.coalL : A.coal);
    if (open) { fillPoly(g, [[x - 5, y - 2], [x + 5, y - 2], [x + 6, y - 6], [x - 6, y - 6]], A.br[1]); if (lit) for (let k = 0; k < 4; k++) px(g, x - 3 + k * 2, y - 3, A.coalL); }
    else { fillPoly(g, [[x - 5, y - 1], [x + 5, y - 1], [x + 2, y - 5], [x - 2, y - 5]], A.br[3]); px(g, x, y - 6, A.br[4]); }
    rect(g, x - 6, y - 1, 1, 3, A.br[0]); rect(g, x + 5, y - 1, 1, 3, A.br[0]);
  };
  const smoke = (g, x, y, n = 3) => { for (let k = 0; k < n; k++) px(g, x + (k % 2 ? 1 : -1) * (1 + k), y - 3 - k * 3, k > 1 ? A.smoke : A.coalL); };

  const F = Array.from({ length: 18 }, (_, f) => {
    const [c, g] = canvas(W, H); const floor = H - 2, hip = floor - 26, sh = hip - 6, hd = sh - 12;
    if (f === 16) {   // DOWNED - THE OPENING: the bell's note went through the rite. On one knee, mitre off, the pot spilled
      rect(g, cx - 14, floor - 4, 10, 4, A.G);
      cope(g, cx, sh + 12, 6); head(g, cx + 8, hd + 18);
      arm(g, cx + 4, sh + 16, cx + 14, floor - 6);
      censer(g, cx + 22, floor - 7, 1, 1); chainTo(g, cx + 14, floor - 6, cx + 22, floor - 8);
      for (const [dx, dy] of [[26, -3], [30, -2], [22, -1]]) px(g, cx + dx, floor + dy, A.coal);      // the coals out on the boards
      mitre(g, cx - 16, floor - 10, 4);                                                                // knocked off, lying beside him
      for (let k = 0; k < 3; k++) px(g, cx + 12 + k * 3, hd + 8 - k, A.Yl);                            // stars: he is open
      outline(c, OUT); return settle(c);
    }
    const ph = f === 1 ? 1 : f === 2 ? 2 : (f === 9 ? 1 : f === 10 ? 2 : 0);
    const bend = [3, 8, 13].includes(f) ? -3 : [4, 6, 9, 10, 11, 12].includes(f) ? 4 : f === 7 ? 7 : f === 17 ? -5 : 0;
    const bob = (f === 1 || f === 9) ? -1 : 0;   /* the whole mass lifts a pixel on the step: under a cope that reaches the floor, the BOB is the walk */
    legs(g, cx, floor - 3, ph); cope(g, cx, sh + bob, bend); mitre(g, cx + bend, hd - 3 + bob, f === 17 ? 5 : bend > 3 ? 2 : 0);
    head(g, cx + 2 + bend, hd + 5 + bob);
    switch (f) {
      case 3:  arm(g, cx + 6, sh + 4, cx - 6, sh - 10); censer(g, cx - 10, sh - 16, 1); chainTo(g, cx - 6, sh - 10, cx - 10, sh - 17); smoke(g, cx - 10, sh - 20); break;
      case 4:  arm(g, cx + 6, sh + 4, cx + 20, sh + 2);  censer(g, cx + 30, sh + 4, 1); chainTo(g, cx + 20, sh + 2, cx + 30, sh + 3); break;
      case 5:  arm(g, cx + 5, sh + 5, cx - 4, sh + 10); censer(g, cx - 8, sh + 14, 1); chainTo(g, cx - 4, sh + 10, cx - 8, sh + 13); break;
      case 6:  arm(g, cx + 6, sh + 4, cx + 18, sh + 8);  censer(g, cx + 34, sh + 12, 1); chainTo(g, cx + 18, sh + 8, cx + 34, sh + 11); break;
      case 7:  arm(g, cx + 4, sh + 6, cx + 14, sh + 14); censer(g, cx + 26, sh + 20, 1); chainTo(g, cx + 14, sh + 14, cx + 26, sh + 19); break;
      case 8:  arm(g, cx + 5, sh + 3, cx + 10, sh - 6); arm(g, cx - 5, sh + 3, cx + 8, sh - 4); censer(g, cx + 14, sh - 12, 1); chainTo(g, cx + 10, sh - 6, cx + 14, sh - 13); smoke(g, cx + 14, sh - 16, 4); break;
      case 9:
      case 10: { const s = f === 9 ? -1 : 1; arm(g, cx + 6, sh + 4, cx + 16, sh + 2 + s * 6); censer(g, cx + 26, sh + 4 + s * 12, 1); chainTo(g, cx + 16, sh + 2 + s * 6, cx + 26, sh + 3 + s * 12); break; }
      case 11: arm(g, cx + 6, sh + 4, cx + 16, sh + 10); censer(g, cx + 22, sh + 16, 1, 1); chainTo(g, cx + 16, sh + 10, cx + 22, sh + 12); break;
      case 12: arm(g, cx + 6, sh + 4, cx + 17, sh + 12); censer(g, cx + 24, sh + 18, 1, 1); chainTo(g, cx + 17, sh + 12, cx + 24, sh + 14);
               for (let k = 0; k < 4; k++) px(g, cx + 24 + k * 2, sh + 24 + k * 3, k & 1 ? A.coal : A.coalL); break;
      case 13: arm(g, cx + 5, sh + 3, cx + 7, hd - 8); arm(g, cx - 5, sh + 3, cx - 1, hd - 8); censer(g, cx + 3, hd - 18, 1, 1); chainTo(g, cx + 7, hd - 8, cx + 3, hd - 12); smoke(g, cx + 3, hd - 22, 4); break;
      case 14: arm(g, cx + 5, sh + 3, cx + 7, hd - 10); arm(g, cx - 5, sh + 3, cx - 1, hd - 10); censer(g, cx + 3, hd - 20, 1, 1); chainTo(g, cx + 7, hd - 10, cx + 3, hd - 14);
               /* THE FLARE: RINGS of saffron off the censer, not discs - px.js's circle() is a FILLED one and its fifth
                  argument is the COLOUR, so asking it for an outline painted half the frame magenta. */
               for (const [r, col] of [[9, A.Yl], [14, A.y], [19, A.Y]]) for (let t = 0; t < 30; t++) { const an = t / 30 * Math.PI * 2;
                 px(g, Math.round(cx + 3 + Math.cos(an) * r), Math.round(hd - 17 + Math.sin(an) * r * 0.85), col); } break;
      case 15: { arm(g, cx + 5, sh + 2, cx + 12, sh - 8); arm(g, cx - 4, sh + 4, cx + 10, sh - 2);
               thick(g, cx + 12, sh - 26, cx + 12, sh - 8, '#c8b088', 2); rect(g, cx + 10, sh - 10, 5, 4, A.br[1]); break; }
      case 17: arm(g, cx + 4, sh + 6, cx + 16, sh + 16); censer(g, cx + 26, sh + 22, 1); chainTo(g, cx + 16, sh + 16, cx + 26, sh + 21); break;
      default: { const sw = f === 1 ? -5 : f === 2 ? 5 : 0;
               arm(g, cx + 6, sh + 5, cx + 12 + sw, sh + 13); censer(g, cx + 16 + sw * 2, sh + 20, 1); chainTo(g, cx + 12 + sw, sh + 13, cx + 16 + sw * 2, sh + 19); smoke(g, cx + 16 + sw * 2, sh + 16, 2); }
    }
    outline(c, OUT); return settle(c);
  });
  return pack(F, cx, H, 18, 40);
}
