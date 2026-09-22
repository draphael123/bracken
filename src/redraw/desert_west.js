// desert_west.js — THE WELL TOWN's (level 2) and THE RED GORGE's (level 3) creatures and bosses (not wired in: each
// level batch adds the spawn cases, frame tables, bestiary rows and the rest of A8's wiring points). Designs:
// docs/briefs/well-town.md, docs/briefs/red-gorge.md, and the attack tables in src/desert-bosses.js (BANDIT_KING,
// ROC). px.js primitives only, so tools/desert-west-art.mjs can render every frame in Node. The contract is
// desert_foes.js's: every frame faces RIGHT (L is the flip), every frame of a sprite shares one canvas, ax = the
// body's centre column, ay = the row under the lowest pixel (grounded sprites SETTLE to it; flyers hang from one
// box). Tells follow the house marks: '!' yellow (the shield turns it), the red X (move); a tell's pose is always
// bigger and slower than the blow it leads.
//
// bakeBandit()        BANDIT        0,1 walk | 2 SLASH TELL (!, scimitar raised high and back) | 3 SLASH (swept down
//                                    and out) | 4 hurt
// bakeBanditArcher()  BANDIT ARCHER 0,1 walk | 2 DRAW TELL (!, bow at full draw) | 3 LOOSE (string snapped, arrow
//                                    away) | 4 hurt
// bakeArrow()         a loosed arrow, flying right: shaft, head, fletching
// bakeWaterThief()     WATER-THIEF  0,1 run (leant into it) | 2 CUT TELL (!, the curved knife drawn back and up) |
//                                    3 CUT (swept low) | 4 RUNNING WITH THE SIP (sprinting off, the waterskin held
//                                    tight and leaking) | 5 hurt
// bakeCliffRaptor()   CLIFF RAPTOR  a lean hawk-lizard of the cliffs (flyer, ground=false): 0 glide | 1 flap up |
//                                    2 flap down | 3 DIVE TELL (X, wings half shut, head down, eye lit red) |
//                                    4 DIVE (tucked, pitched down) | 5 perched, hunched on a ledge
// bakeGorgeCrab()     GORGE CRAB    a sandstone-shelled ledge crab: 0,1 sidle | 2 PINCH TELL (!, both claws up and
//                                    open) | 3 PINCH (snapped out level, shut) | 4 SHELL-UP GUARD (hunkered, claws
//                                    drawn in) | 5 hurt
//
// bakeBanditKing()    THE BANDIT KING (level 2 boss, src/desert-bosses.js BANDIT_KING): brass-and-mud plate, a
//                      scimitar, a sling of oil jars at his hip.
//                      0 idle | 1,2 walk | 3 SWEEP TELL (!, raised high and back) | 4 SWEEP (a wide cut across) |
//                      5 KNIVES TELL (!, the fan of knives held ready) | 6 KNIVES (thrown, in the air) |
//                      7 JAR TELL (X, a jar raised high, the wick lit) | 8 JAR (thrown, arcing low) |
//                      9 CHARGE TELL (X, shoulder dropped) | 10 CHARGE (driving forward, shoulder first) |
//                      11 BURNING (flames climbing him, from walking through his own fire) |
//                      12 OPEN (steaming, blinded, the plate gone dull: the skin poured on him) | 13 hurt
// bakeOilFire()       { patch: [3 flicker frames, 48x14, a thrown jar's burning patch], knife: a thrown knife,
//                        jar: a thrown jar } — not creatures, so no pack(): props, like desert.js's bakeCargo()
//
// bakeRoc()           THE ROC (level 3 boss, src/desert-bosses.js ROC): a great red-and-gold bird, a flyer
//                      (ground=false), ~90 px wingspan, hanging from one box.
//                      0,1 soar | 2 DIVE TELL (X, wings folding in, talons dropping) | 3 DIVE (stooping, tucked) |
//                      4 GUST TELL (!, wings thrown wide) | 5 GUST (a forward beat, the blast) |
//                      6 VOLLEY TELL (!, quills fanning from the tail) | 7 VOLLEY (quills away) |
//                      8 SNATCH TELL (X, a low pass, talons opening) | 9 SNATCH (talons forward) |
//                      10 OPEN (soaked, grounded, feathers plastered, on the bank) | 11 hurt
// bakeRocFX()         { shadow: [2 frames, a growing ground oval — the dive's mark], quill: a single quill }
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten, shade as tint, mulberry } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
function settleFrame(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, n, fn, ground = true) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return ground ? settleFrame(c) : c; });

// ================= BANDIT =================
const BD = { skin: '#c68a5c', skinD: '#96633c', cloth: '#8a3028', clothL: '#c15840', clothD: '#5e1e1a',
  wrap: '#e3d2a8', wrapD: '#b9a57e', sash: '#3e6a92', sashD: '#2c4d6c',
  blade: '#c9d1dc', bladeL: '#f0f4f8', hilt: '#6e4a2c', boot: '#3a281a', eye: '#1a1010', pants: '#7a5a3a' };
export function bakeBandit() {
  const W = 26, H = 26, gy = 24, cx = 12;
  const head = (g, x, y) => { ellipse(g, x, y, 3.6, 3.4, BD.skin); px(g, x - 3, y + 1, BD.skinD);
    ellipse(g, x, y - 2.4, 4.4, 2, BD.wrap); rect(g, x - 4, y - 2, 8, 1, BD.wrapD); px(g, x - 4, y - 3, BD.wrap);
    rect(g, x + 1, y, 2, 1, BD.eye); rect(g, x - 1, y + 2, 4, 2, BD.skinD); };
  const bodyAt = (g, x, y, legs) => { rect(g, x - 3, y, 6, 6, BD.cloth); rect(g, x - 3, y, 6, 1, BD.clothL);
    rect(g, x - 3, y + 3, 6, 1, BD.sash); px(g, x - 3, y + 3, BD.sashD); rect(g, x - 3, y + 5, 6, 1, BD.clothD);
    rect(g, x - 3, y + 6, 6, 2, BD.pants); const [a, b] = legs;
    rect(g, x - 3 + a, y + 8, 2, 3, BD.clothD); rect(g, x + 1 + b, y + 8, 2, 3, BD.clothD);
    rect(g, x - 3 + a, y + 10, 2, 1, BD.boot); rect(g, x + 1 + b, y + 10, 2, 1, BD.boot); };
  const sword = (g, hx, hy, tx, ty, lit = false) => { rect(g, hx - 1, hy - 1, 2, 2, BD.hilt);
    line(g, hx, hy, tx, ty, BD.blade); px(g, tx, ty, lit ? '#fff6c8' : BD.bladeL); };
  const F = frames(W, H, 5, (g, f) => {
    const by = gy - 11;
    if (f === 4) { bodyAt(g, cx, by + 1, [0, 0]); head(g, cx + 1, by - 3); sword(g, cx + 3, by + 2, cx + 9, by + 6); return; }   // hurt: staggered, sword drooped
    const legs = f === 0 ? [0, 1] : f === 1 ? [1, 0] : [0, 0];
    bodyAt(g, cx, by, legs); head(g, cx + 1, by - 4);
    const sh = [cx + 3, by + 1];
    if (f === 2) sword(g, ...sh, cx - 5, by - 12, true);          // SLASH TELL: raised high and back over the head, lit
    else if (f === 3) sword(g, ...sh, cx + 14, by + 3);           // SLASH: swept down and out in front
    else sword(g, ...sh, cx + 5, by + 7);                          // held low, resting
  });
  return pack(F, cx, H, 10, 16);
}

// ================= BANDIT ARCHER =================
const BA = { skin: BD.skin, skinD: BD.skinD, cloth: '#5e6e30', clothL: '#7c8f48', clothD: '#3e4a1e',
  wrap: BD.wrap, wrapD: BD.wrapD, sash: '#8a3028', bow: '#6e4a2c', string: '#e3d2a8',
  fletch: '#c9463d', shaft: '#c9a468', head: '#d8d1c0', eye: '#1a1010', pants: '#4a5424', boot: '#3a281a' };
export function bakeBanditArcher() {
  const W = 26, H = 26, gy = 24, cx = 12;
  const head = (g, x, y) => { ellipse(g, x, y, 3.6, 3.4, BA.skin); px(g, x - 3, y + 1, BA.skinD);
    ellipse(g, x, y - 2.4, 4.4, 2, BA.wrap); rect(g, x - 4, y - 2, 8, 1, BA.wrapD);
    rect(g, x + 1, y, 2, 1, BA.eye); rect(g, x - 1, y + 2, 4, 2, BA.skinD); };
  const bodyAt = (g, x, y, legs) => { rect(g, x - 3, y, 6, 6, BA.cloth); rect(g, x - 3, y, 6, 1, BA.clothL);
    rect(g, x - 3, y + 3, 6, 1, BA.sash); rect(g, x - 3, y + 5, 6, 1, BA.clothD);
    rect(g, x - 3, y + 6, 6, 2, BA.pants); const [a, b] = legs;
    rect(g, x - 3 + a, y + 8, 2, 3, BA.clothD); rect(g, x + 1 + b, y + 8, 2, 3, BA.clothD);
    rect(g, x - 3 + a, y + 10, 2, 1, BA.boot); rect(g, x + 1 + b, y + 10, 2, 1, BA.boot); };
  /* the bow: a recurve arc held out at arm's length; draw 0 relaxed .. 1 full draw, the string pulled back to it */
  const bow = (g, x, y, draw) => { for (let t = 0; t <= 1.001; t += 0.1) { const yy = y - 7 + t * 14, bend = Math.sin(t * Math.PI) * (2.6 - draw * 1.2); px(g, x + bend, yy, BA.bow); }
    line(g, x + 0.2, y - 6, x - draw * 6, y, BA.string); line(g, x - draw * 6, y, x + 0.2, y + 6, BA.string);
    if (draw > 0.3) { line(g, x - draw * 6, y, x - draw * 6 - 5, y, BA.shaft); px(g, x - draw * 6 - 6, y, BA.fletch); px(g, x - draw * 6 + 1, y, BA.head); } };
  const F = frames(W, H, 5, (g, f) => {
    const by = gy - 11;
    if (f === 4) { bodyAt(g, cx, by + 1, [0, 0]); head(g, cx + 1, by - 3); bow(g, cx + 8, by + 2, 0); return; }   // hurt
    const legs = f === 0 ? [0, 1] : f === 1 ? [1, 0] : [0, 0];
    bodyAt(g, cx, by, legs); head(g, cx + 1, by - 4);
    if (f === 2) bow(g, cx + 9, by - 1, 1);                          // DRAW TELL: the string pulled fully back
    else if (f === 3) { bow(g, cx + 9, by - 1, 0.1); line(g, cx + 9, by - 1, cx + 22, by - 2, BA.shaft); px(g, cx + 22, by - 2, BA.head); }   // LOOSE: away, string snapped forward
    else bow(g, cx + 9, by - 1, 0);
  });
  return pack(F, cx, H, 10, 16);
}
export function bakeArrow() {   // a loosed arrow, flying right: shaft, a narrow head, fletching
  const [c, g] = canvas(14, 5);
  line(g, 1, 2, 10, 2, BA.shaft); rect(g, 10, 1, 3, 2, BA.head); px(g, 13, 2, '#f0eee0');
  line(g, 0, 0, 3, 2, BA.fletch); line(g, 0, 4, 3, 2, BA.fletch);
  return c;
}

// ================= WATER-THIEF =================
const WT = { wrap: '#4a3a30', wrapD: '#2e241c', wrapL: '#63503f', eye: '#ffd36b',
  blade: '#c9d1dc', bladeL: '#f0f4f8', hilt: '#4a3420', water: '#4a8ab0', waterL: '#8ac8e0',
  skinBag: '#8a5a32', skinBagD: '#5e3a1e', boot: '#1e1610' };
export function bakeWaterThief() {
  const W = 26, H = 26, gy = 24, cx = 12;
  const head = (g, x, y, lean = 0) => { ellipse(g, x + lean, y, 3.2, 3, WT.wrap); px(g, x + lean, y - 1, WT.wrapL);
    rect(g, x + lean + 1, y, 2, 1, WT.eye); rect(g, x + lean - 1, y + 2, 3, 2, WT.wrapD); };   // a wrapped face, eyes only
  const bodyAt = (g, x, y, legs, lean = 0) => { fillPoly(g, [[x - 3 + lean, y], [x + 3 + lean, y], [x + 2, y + 9], [x - 2, y + 9]], WT.wrap);
    rect(g, x - 3 + lean, y, 6, 1, WT.wrapL); rect(g, x - 2, y + 8, 4, 1, WT.wrapD);
    const [a, b] = legs; line(g, x - 1, y + 9, x - 3 + a, y + 15, WT.wrapD, 2); line(g, x + 1, y + 9, x + 3 + b, y + 15, WT.wrapD, 2);
    px(g, x - 3 + a, y + 15, WT.boot); px(g, x + 3 + b, y + 15, WT.boot); };
  /* the knife: a short curved blade, drawn as two segments bent through a midpoint (px.js has no arc) */
  const knife = (g, hx, hy, tx, ty, lit = false) => { rect(g, hx - 1, hy - 1, 2, 2, WT.hilt);
    const mx = (hx + tx) / 2 + (ty - hy) * 0.25, my = (hy + ty) / 2 - (tx - hx) * 0.25;
    line(g, hx, hy, mx, my, WT.blade); line(g, mx, my, tx, ty, WT.blade); px(g, tx, ty, lit ? '#fff6c8' : WT.bladeL); };
  const skinBag = (g, x, y, drip = false) => { ellipse(g, x, y, 3, 3.6, WT.skinBag); rect(g, x - 1, y - 4, 2, 2, WT.skinBagD); px(g, x - 1, y - 1, WT.skinBagD);
    if (drip) { px(g, x, y + 4, WT.water); px(g, x, y + 6, WT.waterL); } };
  const F = frames(W, H, 6, (g, f) => {
    const by = gy - 15;
    if (f === 5) { bodyAt(g, cx, by + 1, [-2, 2], -2); head(g, cx - 2, by - 2, -3); return; }   // hurt: knocked back off its feet, arms thrown wide of the line
    if (f === 4) { bodyAt(g, cx, by, [3, -2], 2); head(g, cx, by - 4, 2); skinBag(g, cx + 6, by + 3, true); return; }   // RUNNING WITH THE SIP: sprinting off, leaking
    const legs = f === 0 ? [2, -2] : f === 1 ? [-2, 2] : [1, -1];
    bodyAt(g, cx, by, legs, 1); head(g, cx, by - 4, 1);
    if (f === 2) knife(g, cx + 4, by - 2, cx - 4, by - 10, true);       // CUT TELL: the blade drawn back and up, lit
    else if (f === 3) knife(g, cx + 2, by + 1, cx + 12, by + 5);         // CUT: swept low across
  });
  return pack(F, cx, H, 9, 15);
}

// ================= CLIFF RAPTOR =================
/* geometry follows desert_foes.js's bakeVulture (known to read well at this scale) reskinned: a scaly body, a low
   spiny crest instead of a ruff, an elongated snout instead of a beak, a thin whip tail instead of a fan. */
const CR = { body: '#9a5030', bodyL: '#c07048', bodyD: '#6e3820', crest: '#e04030', head: '#b8683c', headD: '#8a4c2a',
  eye: '#1a1010', eyeRed: '#ff5040', claw: '#3a2a1e', ledge: '#c08a66', ledgeL: '#d4a47e' };
export function bakeCliffRaptor() {
  const W = 40, H = 30, gy = 28, cx = 18, cy = 13;
  const wing = (g, x, y, lift, span, far = false) => { const tipX = x - 2 + span * 0.2, tipY = y - lift, col = far ? CR.bodyD : CR.body, edge = far ? CR.bodyD : CR.bodyL;
    fillPoly(g, [[x - 4, y - 1], [x + 4, y - 1], [tipX + span * 0.5, tipY], [tipX - span * 0.5, tipY - 1]], col);
    for (let k = 0; k < 4; k++) line(g, tipX - span * 0.5 + k * 2, tipY - 1, tipX - span * 0.5 + k * 2 - 2, tipY - 3 - (k & 1), CR.bodyD);
    line(g, x - 4, y - 1, tipX - span * 0.5, tipY, edge); };
  const bodyAt = (g, x, y, pitch = 0, tellEye = false) => { ellipse(g, x, y, 7, 4, CR.body); ellipse(g, x - 1, y - 1, 5, 2.4, CR.bodyL);
    for (let k = 0; k < 3; k++) px(g, x + 3 + k * 2, y - 3 + pitch * 0.5, CR.crest);                                        // the low spiny crest, clear of the head
    circle(g, x + 9, y - 3 + pitch * 1.6, 2.3, CR.head); px(g, x + 8, y - 4 + pitch * 1.6, CR.headD);
    line(g, x + 11, y - 3 + pitch * 1.6, x + 15, y - 2 + pitch * 2, CR.head); px(g, x + 15, y - 1 + pitch * 2, CR.headD);   // the long snout
    px(g, x + 9, y - 4 + pitch * 1.6, tellEye ? CR.eyeRed : CR.eye);
    fillPoly(g, [[x - 7, y - 1], [x - 15, y + 1], [x - 13, y + 3], [x - 6, y + 2]], CR.bodyD); };                            // the tail, thin and long
  const F = frames(W, H, 6, (g, f) => {
    if (f === 5) {   // perched: hunched on a ledge shelf, wings folded like a coat
      rect(g, cx - 9, gy - 1, 18, 2, CR.ledge); rect(g, cx - 9, gy - 2, 18, 1, CR.ledgeL);
      ellipse(g, cx, gy - 8, 6, 6, CR.body); ellipse(g, cx - 1, gy - 9, 4, 4, CR.bodyL);
      px(g, cx + 1, gy - 12, CR.crest); px(g, cx + 3, gy - 12, CR.crest);
      circle(g, cx + 6, gy - 13, 2.3, CR.head); line(g, cx + 8, gy - 13, cx + 12, gy - 12, CR.head); px(g, cx + 6, gy - 14, CR.eye);
      rect(g, cx - 1, gy - 2, 1, 2, CR.claw); rect(g, cx + 2, gy - 2, 1, 2, CR.claw);
      fillPoly(g, [[cx - 5, gy - 4], [cx - 9, gy - 1], [cx - 6, gy - 1]], CR.bodyD); return; }
    if (f === 4) {   // DIVE: tucked, pitched down steeply
      ellipse(g, cx, cy + 2, 4, 7, CR.body); ellipse(g, cx - 1, cy, 2.5, 5, CR.bodyL);
      circle(g, cx + 2, cy + 9, 2.2, CR.head); line(g, cx + 3, cy + 11, cx + 6, cy + 13, CR.head); px(g, cx + 2, cy + 9, CR.eyeRed);
      fillPoly(g, [[cx - 3, cy - 5], [cx - 1, cy - 11], [cx + 1, cy - 5]], CR.bodyD); return; }
    const lift = [2, 9, -4, 5][f], span = [22, 16, 18, 12][f], pitch = f === 3 ? 2 : 0;
    wing(g, cx + 1, cy, lift, span, true);
    bodyAt(g, cx, cy, pitch, f === 3);
    wing(g, cx - 1, cy + 1, lift - 1, span);
  }, false);
  return pack(F, 18, H, 22, 10);
}

// ================= GORGE CRAB =================
/* a flat, wide sandstone shell (not a bun): a serrated front lip, two eyestalks, two claws held out front and
   visibly unequal (one big, one small - the fiddler asymmetry), 3 jointed legs a side, splayed outward. */
const GC = { shell: '#c08a66', shellL: '#d4a47e', shellD: '#8e6248', shellDD: '#6a4634', crust: '#e8c4a0',
  leg: '#8e6248', legD: '#5a3c28', claw: '#8a5636', clawL: '#f0c090', clawD: '#5e3620', eye: '#1a1010', eyeStalk: '#a8785a', red: '#e04030' };
export function bakeGorgeCrab() {
  const W = 36, H = 20, gy = 18, cx = 16;
  /* THE CARAPACE: flat and wide, a shallow dome, not a ball - a serrated lip along its front (right) edge, the
     one thing that says sandstone-plated crab and not loaf of bread. `guard` domes it up higher, pulled in tight. */
  const shell = (g, x, y, guard = false) => { const rx = 13, ry = guard ? 6.6 : 4;
    ellipse(g, x, y, rx, ry, GC.shell); ellipse(g, x - 1, y - 1, rx - 2.5, ry - 1.4, GC.shellL);
    for (let k = 0; k < 7; k++) px(g, x - 8 + k * 2.6, y - ry + 1.2, GC.shellD);                 // plate seams across the back
    for (let k = 0; k < 6; k++) { const tx = x + rx - 4 + k * 1.6, ty = y - 1.6 + (k % 2 ? 1.8 : 0);   // the serrated front lip
      px(g, tx, ty, GC.shellDD); px(g, tx, ty + 1, GC.shellD); }
    rect(g, x - rx + 3, y - ry + 1, 4, 1, GC.crust); };
  const eyestalks = (g, x, y, lit = false) => { for (const dx of [-2.5, 2.5]) { line(g, x + dx, y + 2, x + dx + 1, y - 3, GC.eyeStalk); px(g, x + dx + 1, y - 4, lit ? GC.red : GC.eye); } };
  /* a JOINTED claw held out toward the front: shoulder -> elbow -> the pincer. Anchored at the shell's own front
     edge (not buried inside it) so its full reach shows against the sand, not the shell. `big` scales it up (the
     crab's one big claw, unmistakably bigger); `open` spreads the pincer. */
  const claw = (g, sx, sy, ang, reach, open, big) => { const s = big ? 1.35 : 0.75, w = big ? 3 : 2;
    const ex = sx + Math.cos(ang) * reach * 0.55, ey = sy + Math.sin(ang) * reach * 0.4;
    line(g, sx, sy, ex, ey, GC.claw, w);
    const tx = ex + Math.cos(ang) * reach * 0.5, ty = ey + Math.sin(ang) * reach * 0.35;
    line(g, ex, ey, tx, ty, GC.claw, w);
    ellipse(g, tx, ty, 2.6 * s, 2 * s, GC.clawL); ellipse(g, tx - 0.6, ty - 0.6, 1.6 * s, 1.2 * s, GC.claw);
    line(g, tx + 1, ty - 1.2 * s, tx + (5 * s), ty - 1.2 * s - open, GC.claw, big ? 2 : 1);
    line(g, tx + 1, ty + 1.2 * s, tx + (5 * s), ty + 1.2 * s + open, GC.clawD, big ? 2 : 1); };
  /* 3 jointed legs a side, splayed outward and down from the shell's flanks, each at its own angle */
  const legs = (g, x, y, ph) => { for (const side of [-1, 1]) for (let i = 0; i < 3; i++) { const k = (i + ph) % 2 ? 1 : -1;
    const hx = x + side * 6, hy = y - 2 + i * 2, spl = 4 + i * 2, mx = hx + side * spl, my = hy + 3 + k * 0.6;
    line(g, hx, hy, mx, my, GC.leg); line(g, mx, my, mx + side * 3, my + 3 + k, GC.legD); } };
  const F = frames(W, H, 6, (g, f) => {
    const cy = gy - 6;
    if (f === 5) { legs(g, cx, cy, 0); shell(g, cx, cy); eyestalks(g, cx + 7, cy - 2);                                  // hurt: pulled in, claws down
      claw(g, cx + 11, cy, 0.9, 7, 0, true); claw(g, cx + 11, cy + 3, 1.1, 5, 0, false); return; }
    if (f === 4) { legs(g, cx, cy, 0); shell(g, cx, cy, true); eyestalks(g, cx + 6, cy - 5);                            // SHELL-UP GUARD: hunkered high, claws drawn tight to the front
      claw(g, cx + 11, cy - 3, -0.5, 6, 0, true); claw(g, cx + 11, cy, 0, 5, 0, false); return; }
    legs(g, cx, cy, f === 1 ? 1 : 0); shell(g, cx, cy); eyestalks(g, cx + 7, cy - 2, f === 2);
    if (f === 2) { claw(g, cx + 11, cy - 3, -1.5, 12, 3, true); claw(g, cx + 11, cy + 1, -1.1, 9, 3, false); }          // PINCH TELL: both claws up and open, high
    else if (f === 3) { claw(g, cx + 12, cy - 2, -0.1, 12, 0, true); claw(g, cx + 12, cy + 2, 0.15, 9, 0, false); }     // PINCH: snapped out level, shut
    else { claw(g, cx + 11, cy - 1, -0.35, 10, 1, true); claw(g, cx + 11, cy + 2, 0.15, 8, 1, false); }                  // held out in front, resting
  });
  return pack(F, cx, H, 24, 10);
}

// ================= THE BANDIT KING =================
/* a big man in brass-and-mud plate, a sling of three oil jars at his hip, a scimitar. OIL JAR leaves a burning
   patch (bakeOilFire): he BURNS walking through his own fire; poured on while burning, he's OPEN - steaming,
   blinded, the plate gone soft. */
const BK = { brass: '#c9974a', brassL: '#e8bc72', brassD: '#8a6a2e', mud: '#7a5a3a', mudL: '#9a7a52', mudD: '#4a3420',
  skin: '#a8724a', skinD: '#7e5535', sleeve: '#5e4a30', wrap: '#e3d2a8', wrapD: '#b9a57e', clothD: '#5e1e1a',
  cape: '#5e1e1a', capeD: '#3e120f', rivet: '#ffe090', beard: '#4a3a2e', jewel: '#3e6a92', jewelL: '#7ac0e0',
  blade: '#c9d1dc', bladeL: '#f0f4f8', hilt: '#6e4a2c', clay: '#c0703e', clayD: '#8e4e2c', wick: '#3a2a1c',
  fire: '#ff8a30', fireL: '#ffd36b', fireD: '#c0401c', steam: '#e8ecec', steamD: '#b8c4c4', eye: '#1a1010', eyeBlind: '#e8ecec' };
export function bakeBanditKing() {
  const W = 84, H = 68, cx = 34, floor = H - 2;
  const legsAt = (g, x, y, ph, crouch = 0) => { const a = [0, 3, -3][ph] || 0, b = -a * 0.6;
    rect(g, x - 7 + a * 0.3, y + crouch, 6, 16 - crouch, BK.mud); rect(g, x + 1 + b * 0.3, y + crouch, 6, 16 - crouch, BK.mud);
    rect(g, x - 7 + a * 0.3, y + crouch, 6, 3, BK.mudL); rect(g, x + 1 + b * 0.3, y + crouch, 6, 3, BK.mudL);
    rect(g, x - 8 + a, y + 15, 8, 3, BK.brassD); rect(g, x + b, y + 15, 8, 3, BK.brassD); };
  const jars = (g, x, y) => { for (const [dx, dy] of [[-13, 4], [-15, 10], [-11, 12]]) { ellipse(g, x + dx, y + dy, 2.4, 3, BK.clay); px(g, x + dx - 1, y + dy - 2, BK.clayD); rect(g, x + dx - 1, y + dy - 4, 2, 2, BK.wick); } };
  /* the torso: a heavy cape behind, brass pauldrons WIDER than the chest, a mud-and-brass plate (three tones,
     rivets) that narrows to a belted waist. `bend` sways the ribcage sideways (a swing's follow-through);
     `lean` pushes the whole torso forward and down (a charge). */
  const torsoAt = (g, x, y, bend = 0, lean = 0) => {
    fillPoly(g, [[x - 10 + lean * 0.5, y - 2], [x + 10 + lean * 0.5, y - 2], [x + 7 + lean, y + 27], [x - 12 + lean, y + 29]], BK.cape);
    fillPoly(g, [[x - 10 + lean * 0.5, y - 2], [x - 3 + lean * 0.5, y - 2], [x - 5 + lean, y + 25], [x - 12 + lean, y + 29]], BK.capeD);
    fillPoly(g, [[x - 9 + bend + lean, y], [x + 9 + bend + lean, y], [x + 5 + lean, y + 19], [x - 5 + lean, y + 19]], BK.mud);
    fillPoly(g, [[x - 7 + bend + lean, y + 1], [x + 7 + bend + lean, y + 1], [x + 4 + lean, y + 15], [x - 4 + lean, y + 15]], BK.brass);
    rect(g, x - 6 + bend + lean, y + 2, 12, 2, BK.brassL);
    rect(g, x - 4 + lean, y + 8, 2, 3, BK.mudD); rect(g, x + 2 + lean, y + 8, 2, 3, BK.mudD);
    for (const [dx, dy] of [[-5, 5], [5, 5], [-3, 12], [3, 12]]) px(g, x + dx + bend * 0.5 + lean, y + dy, BK.rivet);
    rect(g, x - 5 + lean, y + 17, 10, 3, BK.clothD); px(g, x + lean, y + 18, BK.brassL);                                 // the belt: narrower than the shoulders
    ellipse(g, x - 12 + bend + lean, y + 1, 5, 4, BK.brass); ellipse(g, x - 13 + bend + lean, y, 3, 2.4, BK.brassL);     // the pauldrons: round, brass, WIDER than the chest
    ellipse(g, x + 12 + bend + lean, y + 1, 5, 4, BK.brass); ellipse(g, x + 13 + bend + lean, y, 3, 2.4, BK.brassL);
    jars(g, x - 2 + lean, y); };
  const headAt = (g, x, y, tilt = 0, blind = false) => {
    ellipse(g, x, y, 5.4, 5, BK.skin); px(g, x - 4, y + 1, BK.skinD);
    ellipse(g, x, y - 3.4, 6, 2.6, BK.wrap); rect(g, x - 5, y - 2.4, 10, 1, BK.wrapD); px(g, x, y - 6, BK.wrap);
    rect(g, x - 1, y - 5.6, 2, 2, BK.jewel); px(g, x, y - 5.6, BK.jewelL);                                               // the turban's jewel
    rect(g, x - 3, y + 3, 6, 3, BK.beard);
    px(g, x + 2, y, blind ? BK.eyeBlind : BK.eye); px(g, x + 4, y, blind ? BK.eyeBlind : BK.eye); };
  /* the arm: a thick, bent, two-segment limb - a sleeve to the elbow, bare forearm to the hand - never a hairline */
  const arm = (g, x0, y0, x1, y1) => { const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + Math.max(3, Math.abs(x1 - x0) * 0.15);
    line(g, x0, y0, mx, my, BK.sleeve, 3); line(g, mx, my, x1, y1, BK.skin, 3); };
  /* the scimitar: a long curved blade (~20 px), bowed through two midpoints so it reads as a curve, not a hook */
  const scimitar = (g, hx, hy, tx, ty, lit = false) => { rect(g, hx - 2, hy - 2, 4, 4, BK.hilt);
    const dx = tx - hx, dy = ty - hy, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
    const m1x = hx + ux * len * 0.4 + nx * len * 0.14, m1y = hy + uy * len * 0.4 + ny * len * 0.14;
    const m2x = hx + ux * len * 0.78 + nx * len * 0.2, m2y = hy + uy * len * 0.78 + ny * len * 0.2;
    line(g, hx, hy, m1x, m1y, BK.blade, 3); line(g, m1x, m1y, m2x, m2y, BK.blade, 3); line(g, m2x, m2y, tx, ty, BK.blade, 2);
    line(g, hx + nx, hy + ny, m1x + nx, m1y + ny, BK.bladeL); line(g, m1x + nx, m1y + ny, m2x + nx, m2y + ny, BK.bladeL);
    px(g, tx, ty, lit ? BK.fireL : BK.bladeL); };
  const jarHeld = (g, x, y, lit = false) => { ellipse(g, x, y, 3.4, 4.2, BK.clay); px(g, x - 2, y - 2, BK.clayD);
    rect(g, x - 1, y - 6, 2, 3, BK.wick); if (lit) { px(g, x, y - 7, BK.fire); px(g, x, y - 8, BK.fireL); } };
  /* flames CLIMBING him: seeded along his own silhouette (torso column x cx-9..cx+9, feet to head), not just at his feet */
  const flames = (g, x, topY, botY, n, seed) => { let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) { const fx = x - 9 + r() * 18, fy = botY - r() * (botY - topY), h = 2 + r() * 3;
      for (let k = 0; k < h; k++) px(g, fx + Math.sin(k + i) * 0.8, fy - k, k < 1 ? BK.fireL : k < h - 1 ? BK.fire : BK.fireD); } };
  const F = frames(W, H, 14, (g, f) => {
    const hip = floor - 16, sh = [cx + 13, hip - 19];
    if (f === 13) { legsAt(g, cx, hip, 0); torsoAt(g, cx - 3, hip - 22, -4, 0); headAt(g, cx - 3, hip - 30, -1);         // hurt: rocked back
      arm(g, cx + 6, hip - 19, cx + 12, hip - 4); scimitar(g, cx + 12, hip - 4, cx + 16, hip); return; }
    if (f === 12) { legsAt(g, cx, hip, 0); torsoAt(g, cx, hip - 22, 0, 1); headAt(g, cx + 1, hip - 30, 0, true);        // OPEN: steaming, blinded, the plate gone dull
      rect(g, cx - 9, hip - 19, 18, 15, 'rgba(232,236,236,0.3)');                                                       // the plate gone pale and soft under the steam
      for (let k = 0; k < 16; k++) { const a = Math.PI * (1.05 + k * 0.056), r = 13 + (k % 4) * 3; px(g, cx + Math.cos(a) * r, hip - 20 - Math.sin(a) * r * 0.7 - k * 0.6, k % 2 ? BK.steam : BK.steamD); }
      return; }
    if (f === 11) { legsAt(g, cx, hip, 1); torsoAt(g, cx, hip - 22, 0, 0); headAt(g, cx + 1, hip - 30, 0);              // BURNING: flames climbing him, from his own fire
      arm(g, ...sh, cx + 14, hip - 4); scimitar(g, cx + 14, hip - 4, cx + 18, hip); flames(g, cx, hip - 32, floor, 22, 71); return; }
    if (f === 9) { legsAt(g, cx, hip, 2, 4); torsoAt(g, cx, hip - 18, 0, 12); headAt(g, cx + 13, hip - 26, 3);          // CHARGE TELL: leaning forward low, the shoulder leading
      arm(g, cx + 24, hip - 20, cx + 18, hip - 4); scimitar(g, cx + 18, hip - 4, cx + 12, hip + 2); return; }
    if (f === 10) { legsAt(g, cx + 4, hip, 1, 6); torsoAt(g, cx + 4, hip - 16, 0, 20); headAt(g, cx + 20, hip - 22, 4);  // CHARGE: driving forward low, shoulder first
      arm(g, cx + 30, hip - 18, cx + 26, hip - 2); scimitar(g, cx + 26, hip - 2, cx + 34, hip + 2); return; }
    const ph = f === 1 ? 1 : f === 2 ? 2 : 0;
    legsAt(g, cx, hip, ph); torsoAt(g, cx, hip - 22, 0, 0); headAt(g, cx + 1, hip - 30, 0);
    if (f === 3) { arm(g, ...sh, cx - 8, hip - 36); scimitar(g, cx - 8, hip - 36, cx - 16, hip - 42); }                  // SWEEP TELL: raised high and back
    else if (f === 4) { arm(g, ...sh, cx + 38, hip - 8); scimitar(g, cx + 38, hip - 8, cx + 44, hip + 6); }              // SWEEP: swung wide out to the side, a full horizontal cut
    else if (f === 5) { arm(g, cx - 6, hip - 20, cx - 2, hip - 8); scimitar(g, cx - 2, hip - 8, cx - 8, hip - 2);        // KNIVES TELL: the fan held up and ready
      for (const [dx, dy, a] of [[12, -12, -0.5], [15, -2, 0], [12, 8, 0.5]]) { const hx = cx + dx, hy = hip + dy;
        line(g, hx, hy, hx + Math.cos(a) * 8, hy + Math.sin(a) * 8, BK.blade, 2); px(g, hx + Math.cos(a) * 8, hy + Math.sin(a) * 8, BK.bladeL); rect(g, hx - 1, hy - 1, 2, 2, BK.hilt); } }
    else if (f === 6) { arm(g, cx - 6, hip - 20, cx - 2, hip - 8); scimitar(g, cx - 2, hip - 8, cx - 8, hip - 2);        // KNIVES: thrown, a spread crossing the air
      for (const [dx, dy] of [[26, -18], [34, -2], [26, 14]]) { line(g, cx + dx, hip + dy, cx + dx + 9, hip + dy + (dy < -2 ? 3 : dy > -2 ? -3 : 0), BK.blade, 2); px(g, cx + dx + 9, hip + dy + (dy < -2 ? 3 : dy > -2 ? -3 : 0), BK.bladeL); } }
    else if (f === 7) { arm(g, ...sh, cx - 14, hip - 38); jarHeld(g, cx - 14, hip - 44, true); }                          // JAR TELL: the arm cocked back high, wick lit
    else if (f === 8) { arm(g, ...sh, cx + 26, hip - 6); jarHeld(g, cx + 28, hip - 8, true); }                            // JAR: thrown, arcing low
    else { arm(g, ...sh, cx + 10, hip + 2); scimitar(g, cx + 10, hip + 2, cx + 10, hip + 10); }                           // idle/walk: point down, resting
  });
  return pack(F, cx, H, 24, 44);
}
/* not a creature: props for the arena, so no pack(). patch: a jar's burning ring (bakeOilFire's own flicker, not
   the walk-through-fire dusting the boss's own bakeBanditKing uses); knife/jar: the thrown projectiles. */
export function bakeOilFire() {
  const patch = [0, 1, 2].map(f => { const [c, g] = canvas(48, 14), rnd = mulberry(9100 + f);
    ellipse(g, 24, 12, 22, 3, BK.fireD); ellipse(g, 24, 11, 18, 2.4, BK.fire);
    for (let i = 0; i < 16; i++) { const x = 4 + ((rnd() * 40) | 0), h = 4 + ((rnd() * 6) | 0) + (f % 2) * 2;
      for (let k = 0; k < h; k++) px(g, x + Math.round(Math.sin(k + f) * 1.2), 12 - k, k < h * 0.4 ? BK.fireL : k < h * 0.75 ? BK.fire : BK.fireD); }
    return c; });
  const [k, kg] = canvas(14, 4); rect(kg, 1, 1, 10, 2, BK.blade); px(kg, 11, 2, BK.bladeL); rect(kg, 0, 1, 2, 2, BK.hilt);
  const [j, jg] = canvas(10, 12); ellipse(jg, 5, 7, 3.4, 4.2, BK.clay); px(jg, 3, 5, BK.clayD); rect(jg, 4, 1, 2, 3, BK.wick);
  return { patch, knife: outline(k, OUT), jar: outline(j, OUT) };
}

// ================= THE ROC =================
/* a great red-and-gold bird, on its nest at the gorge head. It soars (untouchable), marks your spot and dives; the
   flood's head runs through the nest - soaked, it's grounded and OPEN. A flyer: every frame hangs from one box. */
const RC = { body: '#c0402a', bodyL: '#e06840', bodyD: '#8a2818', gold: '#e8b840', goldL: '#ffe090', goldD: '#a87820',
  head: '#e8b840', headD: '#a87820', beak: '#f0d060', beakD: '#c09030', eye: '#1a1010', eyeRed: '#ff5040',
  talon: '#3a2a1e', quill: '#c0402a', quillD: '#8a2818', wet: '#7a5a6a', wetD: '#5a3e4c' };
export function bakeRoc() {
  const W = 110, H = 80, cx = 42, cy = 34;
  /* THE WING: a solid panel of coverts from the shoulder to the wrist, then N separated primary feathers fanning
     from the wrist - alternating body-red and gold so each one reads on its own, not a single board. This is
     the sprite's dominant shape: a great bird is its wingspan. `span`/`lift` set its reach and how high it's held. */
  const wing = (g, x, y, lift, span, far = false) => {
    const col = far ? RC.bodyD : RC.body, gold = far ? RC.goldD : RC.gold;
    const wx = x + span * 0.38, wy = y - lift * 0.72;
    fillPoly(g, [[x, y - 3], [x + 4, y + 4], [wx - 2, wy + 5], [wx + 2, wy - 1]], col);
    const n = 6, spread = 1.15;
    for (let k = 0; k < n; k++) { const t = k / (n - 1), a0 = -0.1 - t * spread, a1 = a0 - 0.16, len = span * (0.62 - t * 0.05);
      const bx = wx + Math.cos(a0 + 0.06) * 2.5, by = wy + Math.sin(a0 + 0.06) * 2.5 - lift * 0.05;
      const tipx = wx + Math.cos(a0) * len, tipy = wy - lift * 0.3 + Math.sin(a0) * len * 0.55 - t * 1.6;
      const tip2x = wx + Math.cos(a1) * len * 0.95, tip2y = wy - lift * 0.3 + Math.sin(a1) * len * 0.55 * 0.95 - t * 1.6;
      fillPoly(g, [[wx, wy], [bx, by], [tipx, tipy], [tip2x, tip2y]], k % 2 ? gold : col); }
  };
  const body = (g, x, y, pitch = 0, tellEye = false) => { ellipse(g, x, y, 13, 7.6, RC.body); ellipse(g, x - 2, y - 2, 9, 4.6, RC.bodyL);
    ellipse(g, x - 4, y + 3, 7, 3.6, RC.gold);                                                                       // the gold chest
    for (let k = 0; k < 4; k++) px(g, x + 6 + k * 2, y - 7 + pitch * 0.4 - k * 0.6, RC.goldL);                        // the crest, up the neck
    ellipse(g, x + 13, y - 3 + pitch, 4.6, 4, RC.gold); px(g, x + 11, y - 5 + pitch, RC.goldD);                       // the head, gold
    fillPoly(g, [[x + 16, y - 3 + pitch], [x + 22, y - 1 + pitch * 1.4], [x + 21, y + 2 + pitch * 1.4], [x + 15, y + 1]], RC.beakD);   // a hooked dark beak
    px(g, x + 21, y + 1 + pitch * 1.4, '#2a2018');
    px(g, x + 14, y - 4 + pitch, tellEye ? RC.eyeRed : RC.eye);
    fillPoly(g, [[x - 12, y - 1], [x - 22, y + 2], [x - 20, y + 6], [x - 10, y + 4]], RC.gold); };                    // the tail, gold
  const F = frames(W, H, 12, (g, f) => {
    if (f === 11) { wing(g, cx + 4, cy - 4, 30, 40, true); body(g, cx, cy, -2); wing(g, cx - 2, cy - 2, 34, 44); return; }   // hurt: knocked back, wings thrown up
    if (f === 10) {   // OPEN: soaked, grounded, wings dragging, feathers plastered dark and wet
      const gy2 = H - 6;
      rect(g, cx - 22, gy2, 46, 2, RC.wetD); rect(g, cx - 18, gy2 - 1, 38, 1, RC.wet);
      fillPoly(g, [[cx - 4, gy2 - 6], [cx + 30, gy2 - 2], [cx + 26, gy2 + 1], [cx - 4, gy2 - 2]], RC.wetD);           // the near wing, dragging along the ground
      fillPoly(g, [[cx - 6, gy2 - 10], [cx + 24, gy2 - 6], [cx + 20, gy2 - 3], [cx - 6, gy2 - 6]], RC.wet);
      ellipse(g, cx, gy2 - 13, 10, 8, RC.wetD); ellipse(g, cx - 1, gy2 - 15, 7, 5, RC.wet);
      ellipse(g, cx + 11, gy2 - 16, 3.6, 3.2, RC.headD); px(g, cx + 10, gy2 - 17, RC.eye); line(g, cx + 14, gy2 - 16, cx + 18, gy2 - 14, RC.beakD);
      rect(g, cx - 2, gy2, 1, 3, RC.talon); rect(g, cx + 2, gy2, 1, 3, RC.talon); return; }
    if (f === 9) { wing(g, cx + 6, cy + 8, 2, 26, true); body(g, cx, cy + 10, -2); wing(g, cx - 4, cy + 9, 4, 28);     // SNATCH: low, talons forward
      rect(g, cx + 17, cy + 12, 5, 1, RC.talon); rect(g, cx + 19, cy + 14, 1, 3, RC.talon); rect(g, cx + 22, cy + 14, 1, 3, RC.talon); return; }
    if (f === 8) { wing(g, cx + 5, cy + 6, 4, 28, true); body(g, cx, cy + 8, -1, true); wing(g, cx - 4, cy + 7, 6, 30);   // SNATCH TELL: a low pass, talons just opening
      rect(g, cx + 18, cy + 11, 1, 2, RC.talon); rect(g, cx + 21, cy + 11, 1, 2, RC.talon); return; }
    if (f === 6 || f === 7) {   // VOLLEY TELL / VOLLEY: quills fanning from the tail
      wing(g, cx + 3, cy, 20, 34, true); body(g, cx, cy); wing(g, cx - 3, cy + 1, 24, 38);
      const n = f === 6 ? 5 : 8, r = f === 6 ? 12 : 26;
      for (let k = 0; k < n; k++) { const a = Math.PI * (0.78 + k * 0.42 / (n - 1)); line(g, cx - 14 + Math.cos(a) * 6, cy + 2 + Math.sin(a) * 6, cx - 14 + Math.cos(a) * r, cy + 2 + Math.sin(a) * r, RC.quill); if (f === 7) px(g, cx - 14 + Math.cos(a) * r, cy + 2 + Math.sin(a) * r, RC.goldL); }
      return; }
    if (f === 4 || f === 5) {   // GUST TELL / GUST: wings swept fully forward, a driving beat
      const span = f === 4 ? 44 : 52, lift = f === 4 ? 26 : 4;
      wing(g, cx + 6, cy - 6, lift, span, true); body(g, cx, cy - 3); wing(g, cx - 2, cy - 4, lift - 4, span);
      if (f === 5) for (let k = 0; k < 5; k++) line(g, cx - 34 - k * 4, cy - 8 + k * 3, cx - 46 - k * 4, cy - 6 + k * 3, RC.goldL);
      return; }
    if (f === 2) {   // DIVE TELL: wings folding into a tight V above the body, talons dropping
      wing(g, cx + 2, cy - 10, 34, 20, true); body(g, cx, cy - 4, -1, true); wing(g, cx - 2, cy - 8, 38, 22);
      rect(g, cx - 1, cy + 8, 1, 5, RC.talon); rect(g, cx + 3, cy + 8, 1, 5, RC.talon); return; }
    if (f === 3) {   // DIVE: wings fully tucked, a steep diagonal stoop
      ellipse(g, cx, cy + 4, 5.5, 12, RC.body); ellipse(g, cx - 1, cy + 2, 3.8, 9, RC.bodyL); ellipse(g, cx - 1, cy + 8, 3, 4, RC.gold);
      ellipse(g, cx + 2, cy + 17, 3.6, 3.2, RC.gold); px(g, cx + 1, cy + 15, RC.eyeRed); line(g, cx + 4, cy + 18, cx + 7, cy + 21, RC.beakD);
      fillPoly(g, [[cx - 4, cy - 6], [cx - 1, cy - 16], [cx + 2, cy - 6]], RC.gold);
      rect(g, cx, cy + 20, 1, 3, RC.talon); rect(g, cx + 3, cy + 20, 1, 3, RC.talon); return; }
    const lift = [10, 22][f], span = [52, 44][f];
    wing(g, cx + 3, cy, lift, span, true); body(g, cx, cy); wing(g, cx - 3, cy + 1, lift - 2, span);
  }, false);
  return pack(F, cx, H, 44, 30);
}
export function bakeRocFX() {   // not a creature: no pack(). shadow: the dive's ground mark, 2 frames growing; quill: a loosed feather
  const shadow = [0, 1].map(f => { const [c, g] = canvas(28, 10); const rx = 8 + f * 4, ry = 3 + f * 1;
    ellipse(g, 14, 5, rx, ry, 'rgba(20,10,10,0.35)'); ellipse(g, 14, 5, rx * 0.6, ry * 0.6, 'rgba(20,10,10,0.5)'); return c; });
  const [q, qg] = canvas(16, 5); line(qg, 1, 2, 12, 2, RC.quill); px(qg, 12, 2, RC.goldL);
  fillPoly(qg, [[12, 1], [16, 2], [12, 3]], RC.goldL); line(qg, 0, 1, 3, 2, RC.quillD); line(qg, 0, 3, 3, 2, RC.quillD);
  return { shadow, quill: outline(q, OUT) };
}
