// caravan_bandits.js — THE SUNKEN CARAVAN's three bandits (Daniel, 2026-09-25: "no goblins... new bandit enemies replacing them";
// docs/briefs/caravan-ruins-bandits.md). Their behaviour is src/desert-foes.js; tools/bandits.mjs checks every frame sits on its
// own canvas (E6) and the wiring. px.js primitives only. The contract is desert_foes.js's: every frame faces RIGHT (L is the flip),
// every frame of a sprite shares one canvas, ax = the body's centre column, ay = the row under the lowest pixel (grounded sprites
// SETTLE to it), w/h = the hit box. Men, not goblins: a man's height (about 20 px), cloth, a face wrapped against the sun.
//   bakeCutthroat()  THE CUTTHROAT  indigo robe, black face-veil with a slit of eyes, a red sash, a broad curved scimitar
//                    0,1 walk | 2 FEINT (blade half raised before his face, no glint) | 3 FEINT HOLD (the stamp: foot forward, blade
//                    dropped low behind) | 4 SLASH TELL (the blade HIGH and BACK over the head, a white glint at its tip: the
//                    real one, and it looks nothing like the feint) | 5 SLASH (swept down and out) | 6 hurt
//   bakeSlinger()    THE ROOFTOP SLINGER  a lean man in a sand tunic and a red headscarf, a leather sling and a bag of stones
//                    0 stand (the sling hanging) | 1,2 WHIRL (the tell: the arm up, the pouch going round over his head) |
//                    3 LOOSE (the arm through, the cord straight out) | 4 KICK TELL (knee up, leaning back) | 5 KICK | 6 hurt
//   bakeSlingStone() the stone in flight (one 6x6 frame)
//   bakeAmbusher()   THE SAND-CLOAKED AMBUSHER  a hooded cloak the colour of the dunes, gold eyes in the shadow of the hood, a
//                    curved knife. 0 BURIED (a mound, the hood's peak and two eyes) | 1 RISING (the sand pouring off the cloak) |
//                    2,3 walk | 4 CUT TELL (the knife up) | 5 CUT | 6 BURROWING (the cloak thrown over, going down) | 7 hurt
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
function settleFrame(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, n, fn) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return settleFrame(c); });
/* a curved blade from the hilt (hx, hy) to the tip (tx, ty), bellied `bend` px to one side, two pixels thick at the hilt */
function blade(g, hx, hy, tx, ty, bend, col, colL) { const dx = tx - hx, dy = ty - hy, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  for (let t = 0; t <= 1.001; t += 0.06) { const b = Math.sin(t * Math.PI) * bend, x = hx + dx * t + nx * b, y = hy + dy * t + ny * b; px(g, x, y, col); if (t < 0.7) px(g, x + nx, y + ny, t < 0.35 ? col : colL); }
  px(g, tx, ty, colL); }

// ================= THE CUTTHROAT =================
const CT = { skin: '#b07a52', skinD: '#83573a', robe: '#35305a', robeL: '#554e86', robeD: '#201c38', veil: '#141220', wrap: '#2a2640',
  sash: '#b8382c', sashD: '#842218', pants: '#4e3e30', boot: '#2a1c12', steel: '#c9d1dc', steelL: '#f4f8ff', hilt: '#c9962a', eye: '#f0dca0', glint: '#fff6c8' };
export function bakeCutthroat() {
  const W = 38, H = 32, cx = 15, gy = 30;
  const head = (g, x, y, tilt = 0) => { ellipse(g, x, y, 3.4, 3.4, CT.skin); ellipse(g, x - 0.5, y - 2, 4.2, 2.3, CT.wrap);   // the head-wrap
    line(g, x - 4, y - 1, x - 7, y + 3 + tilt, CT.wrap); px(g, x - 7, y + 4 + tilt, CT.robeD);                                        // its tail, blowing back
    rect(g, x - 3, y + 1, 7, 3, CT.veil); px(g, x + 3, y + 3, CT.veil);                                                               // the veil over the face
    px(g, x + 1, y - 1 + tilt, CT.eye); px(g, x + 2, y - 1 + tilt, CT.eye); };                                                        // a slit of eyes
  const body = (g, x, y, legs, lean = 0) => { const [a, b] = legs;
    rect(g, x - 3 + a, y + 9, 2, 3, CT.pants); rect(g, x + 1 + b, y + 9, 2, 3, CT.pants); rect(g, x - 3 + a, y + 11, 3, 1, CT.boot); rect(g, x + 1 + b, y + 11, 3, 1, CT.boot);
    fillPoly(g, [[x - 3 + lean, y], [x + 3 + lean, y], [x + 5, y + 9], [x - 5, y + 9]], CT.robe);                                  // the robe, flared
    line(g, x - 2 + lean, y, x - 4, y + 8, CT.robeL); line(g, x + 3 + lean, y + 1, x + 4, y + 8, CT.robeD); rect(g, x - 5, y + 9, 10, 1, CT.robeD);
    rect(g, x - 4 + lean, y + 3, 8, 2, CT.sash); px(g, x - 5 + lean, y + 5, CT.sashD); px(g, x - 6 + lean, y + 6, CT.sash); };      // the red sash, a knot hanging
  const hilt = (g, x, y) => { rect(g, x - 1, y - 1, 2, 3, CT.hilt); px(g, x + 1, y - 1, CT.hilt); };
  const F = frames(W, H, 7, (g, f) => {
    const by = gy - 12;
    if (f === 6) { body(g, cx - 1, by + 1, [0, 0], -1); head(g, cx - 2, by - 3, 1); hilt(g, cx + 2, by + 4); blade(g, cx + 2, by + 4, cx + 8, by + 10, 2, CT.steel, CT.steelL); return; }   // hurt: rocked back, blade drooping
    const legs = f === 0 ? [0, 1] : f === 1 ? [1, 0] : f === 3 ? [2, -1] : f === 5 ? [1, -1] : [0, 0];
    const dip = f === 3 ? 1 : 0, lean = f === 2 || f === 5 ? 1 : f === 4 ? -1 : 0;
    body(g, cx, by + dip, legs, lean); head(g, cx + 1 + lean, by - 4 + dip);
    const sh = [cx + 3 + lean, by + 2 + dip];
    if (f === 2) { line(g, ...sh, cx + 5, by - 2, CT.skin); hilt(g, cx + 5, by - 2); blade(g, cx + 5, by - 2, cx + 7, by - 11, -2, CT.steel, CT.steel); }            // THE FEINT: up before the face, dull
    else if (f === 3) { line(g, ...sh, cx - 1, by + 5, CT.skin); hilt(g, cx - 1, by + 5); blade(g, cx - 1, by + 5, cx - 9, by + 8, 2, CT.steel, CT.steelL); }        // THE STAMP: dropped low behind him
    else if (f === 4) { line(g, ...sh, cx - 1, by - 5, CT.skin); hilt(g, cx - 1, by - 5); blade(g, cx - 1, by - 5, cx - 9, by - 14, 3, CT.steelL, CT.steelL);      // THE REAL ONE: high and back, and it SHINES
      const [tx, ty] = [cx - 9, by - 14]; px(g, tx - 1, ty, CT.glint); px(g, tx + 1, ty, CT.glint); px(g, tx, ty - 1, CT.glint); px(g, tx, ty + 1, CT.glint); }
    else if (f === 5) { line(g, ...sh, cx + 8, by + 3, CT.skin); hilt(g, cx + 8, by + 3); blade(g, cx + 8, by + 3, cx + 19, by + 7, -3, CT.steelL, CT.steelL);    // THE SLASH: swept down and out
      for (let i = 0; i < 6; i++) px(g, cx + 6 + i * 2, by - 6 + i * 2, CT.steelL); }
    else { hilt(g, cx + 4, by + 5); blade(g, cx + 4, by + 5, cx + 12, by + 9, -2, CT.steel, CT.steelL); }                                                           // held low and ready
  });
  return pack(F, cx, H, 10, 18);
}

// ================= THE ROOFTOP SLINGER =================
const SL = { skin: '#c68a5c', skinD: '#96633c', tunic: '#cfae74', tunicL: '#ead0a0', tunicD: '#9a7a48', scarf: '#b8463a', scarfD: '#84302a',
  belt: '#5e3a1c', pants: '#7a5a3a', boot: '#3a281a', cord: '#6e4a2c', pouch: '#8a5a32', stone: '#8a8278', stoneL: '#bab2a4', blur: '#e8dcc0', eye: '#1a1010' };
export function bakeSlinger() {
  const W = 36, H = 32, cx = 14, gy = 30;
  const head = (g, x, y) => { ellipse(g, x, y, 3.2, 3.4, SL.skin); px(g, x - 3, y + 1, SL.skinD);
    ellipse(g, x - 0.5, y - 2.2, 4, 2.1, SL.scarf); line(g, x - 4, y - 2, x - 6, y + 2, SL.scarfD); px(g, x - 6, y + 3, SL.scarf);   // the red headscarf and its tail
    rect(g, x + 1, y, 2, 1, SL.eye); rect(g, x, y + 2, 3, 1, SL.skinD); };
  const body = (g, x, y, legs) => { const [a, b] = legs;
    rect(g, x - 3, y, 6, 7, SL.tunic); rect(g, x - 3, y, 6, 1, SL.tunicL); rect(g, x + 2, y + 1, 1, 6, SL.tunicD); rect(g, x - 3, y + 4, 6, 1, SL.belt);
    rect(g, x + 3, y + 4, 2, 2, SL.pouch);                                                                                              // the bag of stones at his hip
    rect(g, x - 3 + a, y + 7, 2, 4, SL.pants); rect(g, x + 1 + b, y + 7, 2, 4, SL.pants); rect(g, x - 3 + a, y + 10, 3, 1, SL.boot); rect(g, x + 1 + b, y + 10, 3, 1, SL.boot); };
  const sling = (g, hx, hy, ox, oy, loaded) => { line(g, hx, hy, ox, oy, SL.cord); rect(g, ox - 1, oy - 1, 3, 2, SL.pouch); if (loaded) px(g, ox, oy - 1, SL.stone); };
  const F = frames(W, H, 7, (g, f) => {
    const by = gy - 11;
    if (f === 6) { body(g, cx - 1, by + 1, [0, 0]); head(g, cx - 2, by - 3); sling(g, cx + 2, by + 3, cx + 3, by + 9, false); return; }    // hurt
    if (f === 4 || f === 5) {                                                                                                                 // the KICK: up close, off his roof
      const [a, b] = f === 4 ? [0, 0] : [0, 0]; rect(g, cx - 3 + a, by + 7, 2, 4, SL.pants); rect(g, cx - 3 + a, by + 10, 3, 1, SL.boot);
      rect(g, cx - 3, by, 6, 7, SL.tunic); rect(g, cx - 3, by, 6, 1, SL.tunicL); rect(g, cx - 3, by + 4, 6, 1, SL.belt); head(g, cx + (f === 4 ? -1 : 1), by - 4);
      if (f === 4) { rect(g, cx + 1 + b, by + 5, 4, 2, SL.pants); rect(g, cx + 4, by + 7, 2, 2, SL.boot); }                                // KICK TELL: the knee drawn up
      else { rect(g, cx + 1, by + 6, 7, 2, SL.pants); rect(g, cx + 8, by + 5, 2, 3, SL.boot); }                                             // KICK: the leg straight out
      sling(g, cx - 3, by + 2, cx - 5, by + 8, false); return; }
    body(g, cx, by, f === 0 ? [0, 0] : [0, 1]); head(g, cx + 1, by - 4);
    if (f === 0) sling(g, cx + 3, by + 2, cx + 5, by + 9, true);                                                                              // standing, the sling hanging loaded
    else if (f === 1 || f === 2) { line(g, cx + 2, by + 1, cx + 3, by - 7, SL.skin);                                                        // THE WHIRL: the arm up...
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; px(g, cx + 3 + Math.cos(a) * 7, by - 9 + Math.sin(a) * 2.6, SL.blur); }  // ...the pouch's circle over his head
      if (f === 1) sling(g, cx + 3, by - 7, cx - 4, by - 10, true); else sling(g, cx + 3, by - 7, cx + 10, by - 8, true); }
    else if (f === 3) { line(g, cx + 2, by + 1, cx + 8, by - 3, SL.skin); line(g, cx + 8, by - 3, cx + 16, by - 5, SL.cord); rect(g, cx + 16, by - 6, 2, 2, SL.pouch); }   // LOOSE: through, the cord out, empty
  });
  return pack(F, cx, H, 10, 16);
}
export function bakeSlingStone() { const [c, g] = canvas(6, 6); circle(g, 3, 3, 2, SL.stone); px(g, 2, 2, SL.stoneL); px(g, 3, 2, SL.stoneL); outline(c, OUT); return c; }

// ================= THE SAND-CLOAKED AMBUSHER =================
const AM = { cloak: '#d9b877', cloakL: '#f2d79c', cloakD: '#a8844e', cloakDD: '#86683a', hood: '#2e2216', eye: '#ffd36b', eyeL: '#fff4c0',
  skin: '#a8744c', pants: '#6e5434', boot: '#3a281a', steel: '#c9d1dc', steelL: '#f4f8ff', hilt: '#5e3a1c', sand: '#e2bb7a', sandL: '#f2d79c', sandD: '#bf8f63' };
export function bakeAmbusher() {
  const W = 34, H = 30, cx = 14, gy = 28;
  const hood = (g, x, y) => { fillPoly(g, [[x - 5, y + 3], [x - 3, y - 4], [x + 1, y - 6], [x + 4, y - 3], [x + 5, y + 3]], AM.cloak);      // the hood, peaked
    line(g, x - 3, y - 4, x + 1, y - 6, AM.cloakL); ellipse(g, x + 1, y, 2.8, 2.6, AM.hood);                                                // the dark inside it
    px(g, x + 1, y, AM.eye); px(g, x + 3, y, AM.eye); px(g, x + 2, y - 1, AM.eyeL); };                                                      // two gold eyes
  const cloakBody = (g, x, y, legs, spread = 0) => { const [a, b] = legs;
    rect(g, x - 2 + a, y + 9, 2, 3, AM.pants); rect(g, x + 1 + b, y + 9, 2, 3, AM.pants); rect(g, x - 2 + a, y + 11, 3, 1, AM.boot); rect(g, x + 1 + b, y + 11, 3, 1, AM.boot);
    fillPoly(g, [[x - 4, y], [x + 4, y], [x + 6 + spread, y + 10], [x - 6 - spread, y + 10]], AM.cloak);                                  // the sand cloak
    line(g, x - 3, y + 1, x - 5 - spread, y + 9, AM.cloakL); line(g, x + 3, y + 2, x + 5 + spread, y + 9, AM.cloakD);
    for (let i = -5 - spread; i <= 5 + spread; i += 2) px(g, x + i, y + 10, AM.cloakDD); };                                                // its hem, ragged
  const mound = (g, x, h) => { fillPoly(g, [[x - 12, gy], [x - 6, gy - h], [x + 6, gy - h], [x + 12, gy]], AM.sand); rect(g, x - 6, gy - h, 12, 1, AM.sandL);
    for (let i = 0; i < 6; i++) px(g, x - 10 + i * 4, gy - 1, AM.sandD); };
  const knife = (g, hx, hy, tx, ty) => { rect(g, hx - 1, hy - 1, 2, 2, AM.hilt); blade(g, hx, hy, tx, ty, 1.5, AM.steel, AM.steelL); };
  const F = frames(W, H, 8, (g, f) => {
    if (f === 0) { mound(g, cx, 4); fillPoly(g, [[cx - 3, gy - 4], [cx + 1, gy - 8], [cx + 4, gy - 4]], AM.cloakD); ellipse(g, cx + 1, gy - 4, 2.4, 1.4, AM.hood);   // BURIED: the hood's peak
      px(g, cx, gy - 4, AM.eye); px(g, cx + 2, gy - 4, AM.eye); return; }                                                                   // and two eyes
    if (f === 1) { cloakBody(g, cx, gy - 12, [0, 0], 1); hood(g, cx, gy - 15); mound(g, cx, 5);                                           // RISING: the sand pouring off the cloak
      for (let i = 0; i < 8; i++) { px(g, cx - 6 + i * 2, gy - 16 + (i % 4) * 3, AM.sandL); px(g, cx - 5 + i * 2, gy - 12 + (i % 3) * 3, AM.sand); } return; }
    if (f === 6) { mound(g, cx, 5); fillPoly(g, [[cx - 11, gy - 5], [cx - 4, gy - 11], [cx + 6, gy - 10], [cx + 11, gy - 5]], AM.cloak);   // BURROWING: the cloak thrown over, going down
      line(g, cx - 4, gy - 11, cx + 6, gy - 10, AM.cloakL); for (let i = 0; i < 5; i++) px(g, cx - 8 + i * 4, gy - 6, AM.cloakDD); return; }
    const by = gy - 12;
    if (f === 7) { cloakBody(g, cx - 1, by + 1, [0, 0]); hood(g, cx - 2, by - 2); knife(g, cx + 3, by + 5, cx + 7, by + 9); return; }        // hurt
    const legs = f === 2 ? [0, 1] : f === 3 ? [1, 0] : [0, 0];
    cloakBody(g, cx, by, legs); hood(g, cx, by - 3);
    if (f === 4) { line(g, cx + 2, by + 2, cx + 1, by - 5, AM.skin); knife(g, cx + 1, by - 5, cx - 2, by - 11); px(g, cx - 2, by - 12, AM.eyeL); }   // CUT TELL: the knife up
    else if (f === 5) { line(g, cx + 3, by + 3, cx + 8, by + 3, AM.skin); knife(g, cx + 8, by + 3, cx + 15, by + 5); for (let i = 0; i < 4; i++) px(g, cx + 9 + i * 2, by - 1 + i, AM.steelL); }   // CUT
    else knife(g, cx + 4, by + 5, cx + 8, by + 7);                                                                                           // held low under the cloak
  });
  return pack(F, cx, H, 12, 18);
}
export const BANDIT_ART = { cutthroat: bakeCutthroat, slinger: bakeSlinger, ambusher: bakeAmbusher, stone: bakeSlingStone };
