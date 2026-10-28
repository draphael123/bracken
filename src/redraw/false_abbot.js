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
//                   foot, the chain taut) | 8 ROPE TELL (crouched to leap, both hands up for the rope) | 9 SWINGING
//                   (hung from the rope, knees up, the pot flung out) | 10 SLAM (landed, the pot smashed down on the boards)
//                   | 11 COALS TELL (the pot tipped, lid open) | 12 COALS (coals falling)
//                   | 13 RITE TELL (the pot raised two-handed over the mitre) | 14 RITE (the flare) | 15 KNELL (both
//                   hands on the bell rope, hauling) | 16 DOWNED (THE OPENING: on one knee, mitre off, pot spilled)
//                   | 18 FALSE LIGHT TELL (the pot held high, flaring a sickly gold) | 19 FALSE LIGHT (thrown, arm out)
//                   | 20 RITE SPOILED (knocked off his knees, hands flung up). 13 is now THE PRAYER: kneeling, hands joined,
//                   the pot set down smoking beside him (claude/abbot2: the procession's frames became the rope's, B16)
//                   | 17 hurt | 21 FALL (tumbling, off the bridge or out of the chair) | 22 BEATEN (flat on his face before the great bell)
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
  const head = (g, x, y, o = {}) => {
    ellipse(g, x, y, 6.5, 6, A.g); ellipse(g, x - 1.5, y - 1.5, 4.5, 4, A.g);
    fillPoly(g, [[x - 6, y - 1], [x - 12, y - 5], [x - 11, y + 2], [x - 5, y + 2]], A.G);   // the ear, back-swept
    px(g, x - 9, y - 2, A.gd);
    if (o.shut) { rect(g, x + 1, y - 1, 4, 1, A.gd); px(g, x + 5, y - 2, A.gd); }          // PRAYING: the eye shut, a lash
    else if (o.wide) { rect(g, x + 1, y - 3, 4, 4, A.eye); px(g, x + 3, y - 2, A.pup); }   // SPOILED: the eye staring
    else { rect(g, x + 2, y - 2, 3, 2, A.eye); px(g, x + 4, y - 2, A.pup); }
    if (o.wide) { rect(g, x, y + 2, 5, 3, A.pup); rect(g, x + 1, y + 2, 3, 1, A.eye); }   // and the mouth open
    else rect(g, x - 1, y + 3, 6, 1, A.gd);
    px(g, x + 5, y + 1, A.G);                                                              // the snout's shadow
  };
  /* a HAND: a fist (or open, fingers spread) on the end of an arm, so a reach reads as a reach and not a stick */
  const hand = (g, x, y, open = 0) => { if (open) { rect(g, x - 1, y - 1, 3, 3, A.g); px(g, x + 2, y - 2, A.g); px(g, x + 2, y, A.g); px(g, x + 2, y + 2, A.g); px(g, x - 1, y - 1, A.G); }
    else { rect(g, x - 1, y - 1, 3, 3, A.g); px(g, x - 1, y + 1, A.G); px(g, x, y + 1, A.G); } };
  /* the sally of a bell rope: the striped wool grip a ringer holds, with the plain rope above it */
  const rope = (g, x, y0, y1) => { for (let y = y0; y <= y1; y++) { px(g, x, y, '#c8b088'); px(g, x + 1, y, y & 1 ? '#8a6a3e' : '#c8b088'); } };
  /* THE COPE: a wide triangle off the shoulders with the orphrey down its front. `bend` leans the whole mass forward. */
  const cope = (g, x, y, bend = 0, len = 30, flare = 0) => {
    fillPoly(g, [[x - 15 - flare, y + len], [x - 11 + bend, y + 2], [x + bend, y - 3], [x + 11 + bend, y + 2], [x + 16 + flare, y + len]], A.M);
    fillPoly(g, [[x - 12 - flare, y + len - 1], [x - 9 + bend, y + 3], [x + bend, y - 2], [x + 9 + bend, y + 3], [x + 13 + flare, y + len - 1]], A.m);
    fillPoly(g, [[x + 4 + bend, y + 1], [x + 9 + bend, y + 3], [x + 13 + flare, y + len - 1], [x + 7, y + len - 1]], A.h);     // the lit side
    fillPoly(g, [[x - 3 + bend, y + 1], [x + 3 + bend, y + 1], [x + 4, y + len - 1], [x - 4, y + len - 1]], A.y);      // the orphrey
    for (let k = 0; y + 6 + k * 5 < y + len - 3; k++) rect(g, x - 3, y + 6 + k * 5, 7, 1, A.Yl);
    rect(g, x - 13 - flare, y + len - 1, 28 + flare * 2, 3, A.M); for (let k = 0; k < 7 + flare; k++) px(g, x - 12 - flare + k * 4, y + len, A.y);     // the hem
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

  const F = Array.from({ length: 23 }, (_, f) => {
    const [c, g] = canvas(W, H); const floor = H - 2, hip = floor - 26, sh = hip - 6, hd = sh - 12;
    if (f === 21) {   // THE FALL (claude/abbot3art, B16): the bridge went out from under him / the chair spilled him. TUMBLING in the air - the cope a flung tent, the boots kicking up, the arms thrown wide, the mitre flying off, the pot out on its chain
      fillPoly(g, [[cx - 14, 30], [cx + 6, 14], [cx + 22, 30], [cx + 14, 50], [cx - 6, 52]], A.M);
      fillPoly(g, [[cx - 11, 30], [cx + 6, 17], [cx + 19, 30], [cx + 12, 47], [cx - 5, 49]], A.m);
      fillPoly(g, [[cx + 6, 17], [cx + 19, 30], [cx + 12, 47], [cx + 4, 33]], A.h);
      thick(g, cx - 8, 40, cx + 14, 24, A.y, 2); thick(g, cx - 5, 45, cx + 16, 29, A.Yl, 1);          // the orphrey, slewed across the mass
      for (let k = 0; k < 5; k++) px(g, cx - 10 + k * 5, 51 - k * 5 + (k & 1), A.y);                  // the hem, torn up
      rect(g, cx + 6, 52, 7, 3, A.G); rect(g, cx - 2, 55, 6, 3, A.G); px(g, cx + 6, 52, A.g); px(g, cx - 2, 55, A.g);   // the boots, kicked up behind
      head(g, cx - 11, 22, { wide: 1 });                                                               // staring, mouth open, head back
      arm(g, cx + 4, 28, cx + 25, 10); hand(g, cx + 25, 10, 1); arm(g, cx - 8, 36, cx - 24, 26); hand(g, cx - 24, 26, 1);
      mitre(g, cx - 26, 8, -9);                                                                        // flung off
      chainTo(g, cx + 25, 11, cx + 33, 20); censer(g, cx + 36, 21, 1, 1);
      for (let k = 0; k < 3; k++) { px(g, cx + 38 + k * 3, 27 + k * 3, k & 1 ? A.coal : A.coalL); }    // coals spat out of it
      for (const [dx, w, dy] of [[-18, 6, 42], [-20, 4, 47], [-14, 5, 56], [18, 5, 58], [22, 4, 52]]) rect(g, cx + dx, dy, w, 1, A.smoke);   // the speed lines, rising: he is falling
      for (const [dx, dy] of [[0, 6], [12, 4], [-12, 12]]) { px(g, cx + dx, dy, A.Yl); px(g, cx + dx - 1, dy, A.y); px(g, cx + dx + 1, dy, A.y); px(g, cx + dx, dy - 1, A.y); px(g, cx + dx, dy + 1, A.y); }   // stars
      outline(c, OUT); return c;
    }
    if (f === 22) {   // BEATEN DOWN (the finale, B16): not the opening's one knee and stars - he is FLAT on his face before the great bell, forehead on the boards, both hands out in front, the mitre rolled away, the pot upended and cold, the cope spread like a fallen tent. Only a thin gold hum over him: the bell is the last blow
      const len = 17, s2 = floor - len;
      rect(g, cx - 22, floor - 3, 7, 3, A.G); rect(g, cx - 14, floor - 2, 6, 2, A.G); px(g, cx - 22, floor - 3, A.g);   // the boots, trailing
      cope(g, cx - 2, s2, -1, len, 7);
      head(g, cx + 22, floor - 8, { shut: 1 });
      arm(g, cx + 8, s2 + 6, cx + 26, floor - 3); arm(g, cx + 4, s2 + 8, cx + 24, floor - 1); hand(g, cx + 27, floor - 3, 1); hand(g, cx + 26, floor - 1, 1);
      fillPoly(g, [[cx - 36, floor - 1], [cx - 28, floor - 12], [cx - 24, floor - 1]], A.mit); fillPoly(g, [[cx - 29, floor - 9], [cx - 24, floor - 1], [cx - 28, floor - 1]], A.mitD); rect(g, cx - 36, floor - 3, 12, 2, A.y);   // the mitre, lying on its side
      censer(g, cx + 40, floor - 6, 0, 1); for (const [dx, dy] of [[34, -1], [44, -1], [47, -2]]) px(g, cx + dx, floor + dy, A.br[0]);   // cold, upended, the ash spilled
      for (let k = 0; k < 3; k++) { rect(g, cx - 12 + k * 14, 4 + (k & 1) * 3, 8, 1, A.Yl); rect(g, cx - 8 + k * 14, 7 + (k & 1) * 3, 4, 1, A.y); }   // the hum of the bell, in gold lines over him
      outline(c, OUT); return settle(c);
    }
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
    if (f === 9) {    // SWINGING: HUNG from the bell rope by both fists, the body trailing behind his hands, the hem kicked up and the knees tucked.
                      // The grip is 52 px above the sprite's foot line (66 - 14), which is where drawAbbotRopes ends the world rope; not settled: the tucked feet ride above it.
      rope(g, cx, 0, 12);
      arm(g, cx - 9, 34, cx, 15);                                                   // the far arm, behind the head
      cope(g, cx - 9, 30, -4, 27, 3);                                               // the mass swung back behind his hands, the hem flared out
      fillPoly(g, [[cx - 29, 52], [cx - 22, 54], [cx - 20, 59], [cx - 31, 57]], A.M); // the hem kicked UP at the back
      rect(g, cx - 27, 56, 5, 1, A.y);
      rect(g, cx - 17, 59, 7, 3, A.G); rect(g, cx - 8, 61, 6, 3, A.G); px(g, cx - 17, 59, A.g); px(g, cx - 8, 61, A.g);   // the boots, drawn up under him
      mitre(g, cx - 9, 15, -4); head(g, cx - 7, 23);
      arm(g, cx - 4, 34, cx + 1, 19); hand(g, cx + 1, 15); hand(g, cx + 1, 19);   // BOTH FISTS round the sally, one over the other
      rect(g, cx - 1, 11, 4, 3, '#8e3a32'); rect(g, cx - 1, 11, 4, 1, '#efe6d2');  // the wool of the sally, above his hands
      chainTo(g, cx - 17, 40, cx - 25, 45); censer(g, cx - 27, 46, 1); smoke(g, cx - 28, 44, 3);
      for (const k of [0, 1, 2]) rect(g, cx - 30, 26 + k * 4, 2 + k, 1, A.smoke);   // the wind of it
      outline(c, OUT); return c;
    }
    if (f === 10 || f === 13 || f === 20) {   // the LOW frames: the slam (10), the prayer (13), the rite spoiled (20) - the cope pools on the boards, so it is drawn to the floor
      const len = f === 13 ? 20 : 24, s2 = floor - len;
      if (f === 13) { rect(g, cx - 17, floor - 3, 7, 3, A.G); px(g, cx - 17, floor - 3, A.g); }              // the soles of his boots, behind him: he is kneeling
      else if (f === 10) { rect(g, cx - 12, floor - 3, 7, 3, A.G); rect(g, cx + 4, floor - 3, 8, 3, A.G); px(g, cx + 4, floor - 3, A.g); }   // braced wide
      else { rect(g, cx - 14, floor - 3, 7, 3, A.G); rect(g, cx - 4, floor - 2, 6, 2, A.G); }               // sitting back on his heels
      cope(g, cx, s2, f === 10 ? 7 : f === 20 ? -7 : 2, len, f === 13 ? 3 : 1);
      if (f === 10) {   // THE SLAM: bent over the pot he has brought down two-fisted on the boards, the coals jumping out both ways, the boards cracked
        mitre(g, cx + 11, s2 - 12, 5); head(g, cx + 13, s2 - 4);
        arm(g, cx + 9, s2 + 3, cx + 21, floor - 9); arm(g, cx + 5, s2 + 6, cx + 20, floor - 7); hand(g, cx + 21, floor - 9); hand(g, cx + 20, floor - 6);
        chainTo(g, cx + 22, floor - 8, cx + 26, floor - 8); censer(g, cx + 29, floor - 8, 1, 1);
        for (const [dx, dy] of [[14, -2], [38, -3], [41, -6], [11, -5], [34, -12], [40, -10], [30, -16], [36, -19]]) px(g, cx + dx, floor + dy, dy < -9 ? A.coalL : A.coal);
        for (const [dx, w] of [[26, 3], [33, 2], [20, 2]]) { rect(g, cx + dx, floor - 1, w, 1, '#1b1626'); }        // the cracks in the boards
        for (let k = 0; k < 3; k++) { rect(g, cx + 36 + k * 3, floor - 4 - k * 2, 3, 2, A.smoke); rect(g, cx + 8 - k * 3, floor - 4 - k * 2, 3, 2, A.smoke); }   // the dust thrown off it
      } else if (f === 13) {   // THE PRAYER: down on his knees, the head bowed under the mitre, eyes shut, the hands joined with a string of beads, the censer set down smoking
        mitre(g, cx + 5, s2 - 10, 6); head(g, cx + 8, s2 - 2, { shut: 1 });
        arm(g, cx + 6, s2 + 4, cx + 14, s2 + 6); arm(g, cx + 1, s2 + 6, cx + 13, s2 + 8);
        rect(g, cx + 12, s2 + 3, 5, 5, A.g); rect(g, cx + 12, s2 + 7, 5, 1, A.G); px(g, cx + 15, s2 + 3, A.G);   // the joined hands, fingers up
        for (let k = 0; k < 4; k++) px(g, cx + 13, s2 + 9 + k, k & 1 ? A.y : A.Yl);                              // the beads hanging from them
        chainTo(g, cx + 20, floor - 4, cx + 24, floor - 6); censer(g, cx + 25, floor - 9, 1); smoke(g, cx + 25, floor - 11, 5);
      } else {   // SPOILED: rocked back, both hands flung up, the mitre KNOCKED OFF and tumbling away behind him, his bare head staring, the pot swinging loose
        head(g, cx - 3, s2 - 3, { wide: 1 });
        mitre(g, cx - 22, 15, -6);
        arm(g, cx + 4, s2 + 4, cx + 13, s2 - 12); arm(g, cx - 4, s2 + 4, cx - 11, s2 - 10); hand(g, cx + 13, s2 - 12, 1); hand(g, cx - 11, s2 - 10, 1);
        chainTo(g, cx + 6, s2 + 8, cx + 19, s2 + 17); censer(g, cx + 23, s2 + 18, 1);
        for (let k = 0; k < 3; k++) { px(g, cx - 6 + k * 5, s2 - 17 - (k & 1) * 2, A.Yl); px(g, cx - 6 + k * 5, s2 - 18 - (k & 1) * 2, A.y); }   // stars
        for (let k = 0; k < 3; k++) rect(g, cx - 24 + k * 3, s2 - 2 + k * 5, 5, 1, A.smoke);   // the shove, in lines
      }
      outline(c, OUT); return settle(c);
    }
    if (f === 8) {    // ROPE TELL: wound down into a crouch to spring - the cope pooled, the weight forward, ONE FIST REACHING for the rope out in front of the mitre, the other hauled back with the pot swinging on its chain
      const len = 25, s2 = floor - len;
      rect(g, cx - 10, floor - 3, 7, 3, A.G); rect(g, cx + 5, floor - 3, 8, 3, A.G); px(g, cx - 10, floor - 3, A.g); px(g, cx + 5, floor - 3, A.g);
      arm(g, cx - 2, s2 + 6, cx - 12, s2 + 12);                                       // the far hand hauled back
      cope(g, cx + 1, s2, 6, len, 1);
      mitre(g, cx + 8, s2 - 11, 4); head(g, cx + 10, s2 - 3);
      arm(g, cx + 9, s2 + 4, cx + 28, s2 - 18); hand(g, cx + 29, s2 - 19, 1);          // REACHING, up and out in front of the face
      chainTo(g, cx - 12, s2 + 12, cx - 16, s2 + 19); censer(g, cx - 19, s2 + 20, 1); smoke(g, cx - 19, s2 + 17, 2);
      for (const dx of [-14, -17, 12, 16]) rect(g, cx + dx, floor - 2 - (dx > 0 ? 0 : 1), 3, 1, A.smoke);   // the dust of the coil
      outline(c, OUT); return settle(c);
    }
    const ph = f === 1 ? 1 : f === 2 ? 2 : 0;
    const bend = [3, 18].includes(f) ? -3 : [4, 6, 11, 12, 19].includes(f) ? 4 : f === 7 ? 7 : f === 8 ? 5 : f === 17 ? -5 : 0;
    const bob = (f === 1 || f === 9) ? -1 : 0;   /* the whole mass lifts a pixel on the step: under a cope that reaches the floor, the BOB is the walk */
    legs(g, cx, floor - 3, ph); cope(g, cx, sh + bob, bend); mitre(g, cx + bend, hd - 3 + bob, f === 17 ? 5 : bend > 3 ? 2 : 0);
    head(g, cx + 2 + bend, hd + 5 + bob);
    switch (f) {
      case 3:  arm(g, cx + 6, sh + 4, cx - 6, sh - 10); censer(g, cx - 10, sh - 16, 1); chainTo(g, cx - 6, sh - 10, cx - 10, sh - 17); smoke(g, cx - 10, sh - 20); break;
      case 4:  arm(g, cx + 6, sh + 4, cx + 20, sh + 2);  censer(g, cx + 30, sh + 4, 1); chainTo(g, cx + 20, sh + 2, cx + 30, sh + 3); break;
      case 5:  arm(g, cx + 5, sh + 5, cx - 4, sh + 10); censer(g, cx - 8, sh + 14, 1); chainTo(g, cx - 4, sh + 10, cx - 8, sh + 13); break;
      case 6:  arm(g, cx + 6, sh + 4, cx + 18, sh + 8);  censer(g, cx + 34, sh + 12, 1); chainTo(g, cx + 18, sh + 8, cx + 34, sh + 11); break;
      case 7:  arm(g, cx + 4, sh + 6, cx + 14, sh + 14); censer(g, cx + 26, sh + 20, 1); chainTo(g, cx + 14, sh + 14, cx + 26, sh + 19); break;
      case 8:  /* THE ROPE TELL: wound down into a crouch to spring, one fist reaching FORWARD for the rope (clear of the mitre, so it cannot read as a staff), the other hand hauled back with the pot on its chain */
               break;
      case 18: /* FALSE LIGHT TELL: the pot raised in one arm out in FRONT (not up through the mitre), the other hand held open under it, and it flares a sickly gold */
               arm(g, cx + 7, sh + 2, cx + 18, hd - 3); hand(g, cx + 18, hd - 3); arm(g, cx - 4, sh + 5, cx + 11, sh - 3); hand(g, cx + 11, sh - 3, 1);
               censer(g, cx + 19, hd - 9, 1, 1); chainTo(g, cx + 18, hd - 4, cx + 19, hd - 8);
               for (const [r, col] of [[7, '#f4f0a0'], [11, '#d8d860']]) for (let t = 0; t < 22; t++) { const an = t / 22 * Math.PI * 2;
                 if (t & 1) px(g, Math.round(cx + 19 + Math.cos(an) * r), Math.round(hd - 7 + Math.sin(an) * r * 0.8), col); }
               for (const [dx, dy] of [[19, -22], [26, -16], [12, -16]]) { px(g, cx + dx, hd + dy + 12, '#f4f0a0'); px(g, cx + dx - 1, hd + dy + 12, '#d8d860'); px(g, cx + dx + 1, hd + dy + 12, '#d8d860'); } break;
      case 19: /* FALSE LIGHT: thrown - the arm whipped out and up, the body lunging after it, the chain taut and the light leaving the pot in a streak */
               arm(g, cx + 8 + bend, sh + 2, cx + 23, sh - 7); hand(g, cx + 23, sh - 7); arm(g, cx - 4, sh + 5, cx - 12, sh + 12); hand(g, cx - 12, sh + 12, 1);
               chainTo(g, cx + 24, sh - 8, cx + 33, sh - 13); censer(g, cx + 36, sh - 13, 1, 1);
               for (let k = 0; k < 5; k++) { rect(g, cx + 41 + k * 3, sh - 20 - k, 3 - (k > 2), 1, k & 1 ? '#d8d860' : '#f4f0a0'); }
               px(g, cx + 38, sh - 19, '#f4f0a0'); px(g, cx + 39, sh - 17, '#d8d860'); break;
      case 11: arm(g, cx + 6, sh + 4, cx + 16, sh + 10); censer(g, cx + 22, sh + 16, 1, 1); chainTo(g, cx + 16, sh + 10, cx + 22, sh + 12); break;
      case 12: arm(g, cx + 6, sh + 4, cx + 17, sh + 12); censer(g, cx + 24, sh + 18, 1, 1); chainTo(g, cx + 17, sh + 12, cx + 24, sh + 14);
               for (let k = 0; k < 4; k++) px(g, cx + 24 + k * 2, sh + 24 + k * 3, k & 1 ? A.coal : A.coalL); break;
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
