// desert_foes.js — THE SUNKEN CARAVAN's creatures and its boss (not wired in: the level and boss batches add the spawn
// cases, frame tables, bestiary rows and the rest of A8's twelve wiring points). px.js primitives only, so
// tools/desert-foes.mjs can render every frame in Node and look at them. The contract is shore.js's: every frame faces
// RIGHT (L is the flip), every frame of a sprite shares one canvas, ax = the body's centre column, ay = the row under the
// lowest pixel (the same in every frame), w/h = the hit box. Tells follow the house marks: '!' yellow (the shield turns it),
// the red X (move); the pose of a tell is always bigger and slower than the blow.
//
// bakeScorpion()   SCORPION   frames 0,1 walk | 2 CLAW TELL (!, pincers up and open) | 3 CLAW (snapped forward)
//                             | 4 STING TELL (X, tail cocked high, the barb lit red) | 5 STING (tail over the head, barb forward) | 6 hurt
// bakeVulture()    VULTURE    0 glide | 1 flap up | 2 flap down | 3 DIVE TELL (X, wings half shut, head down, eye red)
//                             | 4 DIVE (wings tucked, pitched down) | 5 perched, hunched
// bakeSandGoblin() SAND GOBLIN 0 buried (eyes in a mound) | 1 rising (sand pouring off) | 2,3 walk | 4 KNIFE TELL (!, blade up)
//                             | 5 KNIFE (cut) | 6 burrowing (head first, into it)
// bakeDuneWorm()   THE DUNE WORM (boss) 0 surfaced | 1 SPRAY TELL (!, reared back, throat lit) | 2 SPRAY (mouth wide, thrust)
//                             | 3 BREACH (bursting up, sand flying) | 4 STUCK (jammed in timbers, dazed: THE OPENING) | 5 diving
//                             bakeDuneWormLunge(): 0 rising arc | 1 over the top | 2 going in (the LUNGE's body, drawn long)
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten, shade as tint } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
/* every frame of a sprite is drawn by fn(g, f) on a W x H canvas and outlined; a grounded sprite's frames are then SETTLED:
   each one moved so its lowest pixel is on the canvas's last row, so ay = H in every frame and the feet never jump */
function settleFrame(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, n, fn, ground = true) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return ground ? settleFrame(c) : c; });

// ================= SCORPION =================
const SC = { a: '#8e5a2c', A: '#b07a40', d: '#5e3a1c', D: '#3e2612', l: '#d2a468', leg: '#6e4424', barb: '#2a1a10', red: '#e04030', redL: '#ff8a5c', eye: '#101010' };
export function bakeScorpion() {
  const W = 34, H = 20, gy = 18;   // feet on row 17, the outline on 18, ay 19
  const body = (g, dy = 0) => { for (let s = 0; s < 4; s++) { const x = 11 + s * 4; ellipse(g, x, gy - 5 + dy, 3.4, 2.6, s % 2 ? SC.a : SC.A); rect(g, x - 2, gy - 8 + dy, 3, 1, SC.l); }
    ellipse(g, 26, gy - 5 + dy, 3.6, 2.8, SC.A); px(g, 27, gy - 7 + dy, SC.eye); px(g, 28, gy - 7 + dy, SC.eye); rect(g, 10, gy - 3 + dy, 18, 1, SC.d); };
  const legs = (g, ph) => { for (let i = 0; i < 4; i++) { const x = 12 + i * 4, k = (i + ph) % 2 ? 1 : -1; line(g, x, gy - 4, x - 2 + k, gy - 1, SC.leg); px(g, x - 2 + k, gy - 1, SC.D); } };
  const claw = (g, ox, oy, open) => { line(g, 27, gy - 5, ox - 3, oy, SC.a); ellipse(g, ox, oy, 2.6, 1.8, SC.A); line(g, ox + 1, oy - 1, ox + 4, oy - 1 - open, SC.a); line(g, ox + 1, oy + 1, ox + 4, oy + 1 + open, SC.d); };
  /* the tail: five segments from the rump (x 8) curling up and forward; `cock` 0 low .. 1 high, `strike` flings it over */
  const tail = (g, cock, strike, lit) => { let x = 8, y = gy - 6; const pts = [];
    for (let s = 0; s < 5; s++) { const a = Math.PI * (0.95 - s * (0.18 + cock * 0.05) - strike * s * 0.1); x += Math.cos(a) * 3.2; y -= Math.abs(Math.sin(a)) * (2.6 + cock * 1.2); pts.push([x, y]); }
    pts.forEach(([tx, ty], i) => ellipse(g, tx, ty, 1.9 - i * 0.12, 1.7 - i * 0.1, i % 2 ? SC.a : SC.A));
    const [bx, by] = pts[4]; line(g, bx, by, bx + 2 + strike * 2, by + 2, lit ? SC.red : SC.barb); if (lit) { px(g, bx + 2, by + 1, SC.redL); px(g, bx + 3 + strike * 2, by + 2, SC.redL); } };
  const F = frames(W, H, 7, (g, f) => {
    const dy = f === 6 ? 1 : 0;
    tail(g, f === 4 ? 1 : f === 5 ? 0.6 : 0.35, f === 5 ? 1 : 0, f === 4 || f === 5);
    legs(g, f === 1 ? 1 : 0); body(g, dy);
    if (f === 2) { claw(g, 30, gy - 11, 2); }                     // CLAW TELL: up and open
    else if (f === 3) { claw(g, 32, gy - 6, 0); }                 // CLAW: snapped forward, shut
    else claw(g, 30, gy - 6, f === 6 ? 2 : 1);
  });
  return pack(F, 18, H, 16, 9);
}

// ================= VULTURE =================
const VU = { f: '#4a3428', F: '#6e5040', d: '#2e2018', ruff: '#e8dcc8', head: '#d8a098', headD: '#b07870', beak: '#c8b070', beakD: '#8a7040', eye: '#1a1010', red: '#ff5040', leg: '#8a8070' };
export function bakeVulture() {
  const W = 40, H = 30, gy = 28;
  const bodyAt = (g, cx, cy, pitch = 0) => { ellipse(g, cx, cy, 7, 4, VU.f); ellipse(g, cx - 1, cy - 1, 5, 2.4, VU.F);
    ellipse(g, cx + 6, cy - 2 + pitch, 2.6, 2, VU.ruff); circle(g, cx + 9, cy - 3 + pitch * 1.6, 2.2, VU.head); px(g, cx + 9, cy - 4 + pitch * 1.6, VU.headD);
    line(g, cx + 11, cy - 3 + pitch * 1.6, cx + 13, cy - 2 + pitch * 2, VU.beak); px(g, cx + 13, cy - 1 + pitch * 2, VU.beakD);
    fillPoly(g, [[cx - 7, cy - 1], [cx - 13, cy + 1], [cx - 12, cy + 3], [cx - 6, cy + 2]], VU.d); };   // tail
  const wing = (g, cx, cy, lift, span) => { // a long board of a wing with fingered primaries
    const tipX = cx - 2 + span * 0.2, tipY = cy - lift; fillPoly(g, [[cx - 4, cy - 1], [cx + 4, cy - 1], [tipX + span * 0.5, tipY], [tipX - span * 0.5, tipY - 1]], VU.f);
    for (let k = 0; k < 4; k++) line(g, tipX - span * 0.5 + k * 2, tipY - 1, tipX - span * 0.5 + k * 2 - 2, tipY - 3 - (k & 1), VU.d);
    line(g, cx - 4, cy - 1, tipX - span * 0.5, tipY, VU.F); };
  const F = frames(W, H, 6, (g, f) => {
    const cx = 18, cy = 14;
    if (f === 5) {   // perched: hunched on the ground, wings folded like a coat
      ellipse(g, cx, gy - 7, 6, 6, VU.f); ellipse(g, cx - 1, gy - 8, 4, 4, VU.F); ellipse(g, cx + 3, gy - 12, 3, 2, VU.ruff);
      circle(g, cx + 5, gy - 14, 2.2, VU.head); line(g, cx + 7, gy - 14, cx + 9, gy - 13, VU.beak); px(g, cx + 5, gy - 15, VU.eye);
      rect(g, cx - 1, gy - 2, 1, 2, VU.leg); rect(g, cx + 2, gy - 2, 1, 2, VU.leg); fillPoly(g, [[cx - 5, gy - 4], [cx - 9, gy - 1], [cx - 6, gy - 1]], VU.d); return; }
    if (f === 4) {   // DIVE: tucked, pitched down steeply
      ellipse(g, cx, cy + 2, 4, 7, VU.f); ellipse(g, cx - 1, cy, 2.5, 5, VU.F); circle(g, cx + 2, cy + 9, 2, VU.head); line(g, cx + 3, cy + 11, cx + 5, cy + 13, VU.beak);
      px(g, cx + 2, cy + 9, VU.red); fillPoly(g, [[cx - 3, cy - 5], [cx - 1, cy - 11], [cx + 1, cy - 5]], VU.d); return; }
    const lift = [2, 9, -4, 5][f], span = [22, 16, 18, 12][f], pitch = f === 3 ? 2 : 0;
    wing(g, cx + 1, cy, lift, span);          // the far wing, a shade darker behind
    bodyAt(g, cx, cy, pitch);
    wing(g, cx - 1, cy + 1, lift - 1, span);  // the near wing
    px(g, cx + 9, cy - 4 + pitch * 1.6, f === 3 ? VU.red : VU.eye);   // DIVE TELL: the eye goes red
    rect(g, cx + 1, cy + 3, 1, 2, VU.leg); rect(g, cx + 3, cy + 3, 1, 2, VU.leg);
  }, false);   /* a flyer: frames hang from one box, not a floor (the perch frame is drawn on the box's floor) */
  return pack(F, 18, H, 22, 10);
}

// ================= SAND GOBLIN =================
const SG = { k: '#8a9a4a', K: '#a8b860', kd: '#5e6e30', wrap: '#d8c8a0', wrapD: '#a89878', scarf: '#b8463a', scarfD: '#8a3028', eye: '#ffd36b', pupil: '#1a1010', blade: '#c9d1dc', bladeL: '#f0f4f8', hilt: '#6e4a2c', sand: '#e2bb7a', sandL: '#f2d79c', sandD: '#bf8f63', pants: '#7a5a3a' };
export function bakeSandGoblin() {
  const W = 26, H = 26, gy = 24;
  const head = (g, x, y, lookUp = 0) => { ellipse(g, x, y, 4.2, 3.6, SG.k); px(g, x - 3, y + 1, SG.kd); fillPoly(g, [[x - 4, y - 1], [x - 8, y - 3], [x - 4, y + 1]], SG.K);   // a long ear back
    ellipse(g, x, y - 2.5, 4.4, 2.2, SG.wrap); rect(g, x - 4, y - 2, 8, 1, SG.wrapD); rect(g, x + 1, y - lookUp, 2, 1, SG.eye); px(g, x + 2, y - lookUp, SG.pupil); rect(g, x - 1, y + 2, 5, 2, SG.scarf); };
  const bodyAt = (g, x, y, legs) => { rect(g, x - 3, y, 6, 6, SG.scarf); rect(g, x - 3, y, 6, 1, tint(SG.scarf, 0.2)); rect(g, x - 3, y + 5, 6, 1, SG.scarfD);
    rect(g, x - 3, y + 6, 6, 2, SG.pants); const [a, b] = legs; rect(g, x - 3 + a, y + 8, 2, 3, SG.kd); rect(g, x + 1 + b, y + 8, 2, 3, SG.kd); };
  const mound = (g, cx, h) => { fillPoly(g, [[cx - 11, gy], [cx - 6, gy - h], [cx + 6, gy - h], [cx + 11, gy]], SG.sand); rect(g, cx - 6, gy - h, 12, 1, SG.sandL); for (let i = 0; i < 5; i++) px(g, cx - 8 + i * 4, gy - 1, SG.sandD); };
  const F = frames(W, H, 7, (g, f) => {
    const cx = 12;
    if (f === 0) { head(g, cx, gy - 3, 0); mound(g, cx, 3); return; }                                       // buried: a wrap and two eyes in a mound
    if (f === 1) { bodyAt(g, cx, gy - 9, [0, 0]); head(g, cx, gy - 13); mound(g, cx, 4);                     // rising: half out, sand pouring off
      for (let i = 0; i < 6; i++) px(g, cx - 5 + i * 2, gy - 14 + (i % 3) * 3, SG.sandL); return; }
    if (f === 6) { mound(g, cx, 5); bodyAt(g, cx + 1, gy - 11, [1, -1]); rect(g, cx - 2, gy - 6, 6, 2, SG.sand); head(g, cx + 5, gy - 6, -1); return; }   // burrowing: head first into it
    const legs = f === 2 ? [0, 1] : f === 3 ? [1, 0] : [0, 0], by = gy - 11;
    bodyAt(g, cx, by, legs); head(g, cx + 1, by - 4);
    if (f === 4) { line(g, cx - 1, by + 1, cx - 3, by - 6, SG.k); line(g, cx - 3, by - 6, cx - 1, by - 13, SG.blade); px(g, cx - 2, by - 12, SG.bladeL); rect(g, cx - 4, by - 7, 3, 1, SG.hilt); }   // KNIFE TELL: up over the head
    else if (f === 5) { line(g, cx + 2, by + 2, cx + 6, by + 2, SG.k); line(g, cx + 6, by + 2, cx + 13, by + 4, SG.blade); px(g, cx + 12, by + 4, SG.bladeL); rect(g, cx + 5, by + 1, 1, 3, SG.hilt);   // KNIFE: the cut
      for (let i = 0; i < 4; i++) px(g, cx + 8 + i * 2, by - 1 + i, SG.bladeL); }
    else { line(g, cx + 2, by + 2, cx + 4, by + 5, SG.k); line(g, cx + 4, by + 5, cx + 8, by + 6, SG.blade); }   // held low
  });
  return pack(F, 12, H, 10, 16);
}

// ================= THE DUNE WORM =================
const DW = { h: '#a8805a', H: '#c49a6a', hd: '#7e5a3e', hD: '#5e4030', belly: '#dcc08e', bellyD: '#b89a6c', plate: '#8a6a4e', mouth: '#5a1e24', throat: '#ff8a4c', throatL: '#ffd36b', tooth: '#f0e6d0', toothD: '#c8baa0',
  sand: '#e2bb7a', sandL: '#f2d79c', sandD: '#bf8f63', wood: '#7a5232', woodD: '#553722', woodL: '#9c6d43', eye: '#101010', daze: '#ffd36b' };
/* the body: RINGS, not a column. Each ring is its own fat segment - lit on its upper edge, a dark groove under it, the pale
   belly down the side it faces - stacked up a swaying spine and tapering to the head. (The first bake stacked thin ellipses
   every 3 px and read as a pile of coins.) Returns the last ring [x, y, r]. */
function wormNeck(g, x0, y0, h, lean, r0 = 15) { const pts = [];
  for (let i = 0; i <= h; i += 5) { const k = i / Math.max(1, h), x = x0 + Math.sin(k * 1.6) * lean * 14 + Math.sin(k * 5) * 1.5, y = y0 - i, r = r0 - k * 5; pts.push([x, y, r]); }
  for (const [x, y, r] of pts) {
    ellipse(g, x, y, r, 4.2, DW.hd);                                  // the groove, showing under the ring above
    ellipse(g, x, y - 1, r - 0.5, 3.6, DW.h);                         // the ring
    for (let xx = Math.round(x - r + 2); xx < x + r * 0.2; xx++) px(g, xx, Math.round(y - 3.6), DW.H);   // lit upper edge, sun from the left
    ellipse(g, x + r * 0.55, y - 1, r * 0.35, 3, DW.belly); px(g, Math.round(x + r * 0.55), Math.round(y + 1), DW.bellyD); }
  return pts[pts.length - 1]; }
/* the head: a blunt armoured skull, three overlapping crown plates, a heavy lower jaw hinged under it and a maw that opens
   forward (right) with a ring of hooked teeth. open 0..1, `glow` lights the throat, `dazed` the stuck face */
function wormHead(g, x, y, open, glow, dazed = false) {
  const m = open * 9;
  ellipse(g, x, y, 13, 10, DW.h); ellipse(g, x - 2, y - 2, 10, 7, DW.H);                                         // the skull, lit
  fillPoly(g, [[x - 2, y + 4 + m * 0.3], [x + 14, y + 2 + m], [x + 12, y + 9 + m], [x - 6, y + 9]], DW.hd);         // the lower jaw, dropping as it opens
  for (let k = 0; k < 3; k++) { const px0 = x - 11 + k * 7, py0 = y - 8 + k * 1.5; ellipse(g, px0 + 3, py0, 4.5, 3, DW.plate); line(g, px0, py0 + 2, px0 + 7, py0 + 1, DW.hD); }   // crown plates
  if (m > 0.5) { fillPoly(g, [[x + 4, y + 1], [x + 15, y - m * 0.6], [x + 17, y + 2 + m * 0.4], [x + 14, y + 3 + m]], DW.mouth);
    if (glow) { ellipse(g, x + 9, y + 2, 2 + open * 2.5, 1.5 + open * 2, DW.throat); px(g, x + 9, y + 2, DW.throatL); }
    for (let t = 0; t < 4; t++) { px(g, x + 9 + t * 2, y - m * 0.35 + t * 0.2, DW.tooth); px(g, x + 9 + t * 2, y + 2 + m * 0.8 - t * 0.2, DW.tooth); } }
  else { line(g, x + 3, y + 3, x + 14, y + 2, DW.hD); for (let t = 0; t < 4; t++) px(g, x + 6 + t * 2, y + 4, DW.toothD); }
  for (let k = 0; k < 3; k++) { const ex = x + 1 + k * 3, ey = y - 3 + k * 0.3; px(g, ex, ey, dazed ? DW.daze : DW.eye); if (dazed) px(g, ex, ey - 1, k === 1 ? DW.daze : DW.hd); }
}
const sandBurst = (g, cx, gy, n, spread, h, seed) => { let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) { const a = Math.PI * (0.1 + r() * 0.8), d = r() * spread; px(g, Math.round(cx + Math.cos(a) * d * 1.6 - spread * 0.1), Math.round(gy - Math.sin(a) * d * h / spread), r() < 0.5 ? DW.sandL : DW.sand); } };
const duneFoot = (g, cx, gy, w, h) => { fillPoly(g, [[cx - w, gy], [cx - w * 0.5, gy - h], [cx + w * 0.5, gy - h], [cx + w, gy]], DW.sand); rect(g, Math.round(cx - w * 0.5), gy - h, Math.round(w), 1, DW.sandL); for (let x = -w + 2; x < w; x += 5) px(g, Math.round(cx + x), gy - 1, DW.sandD); };
export function bakeDuneWorm() {
  const W = 72, H = 84, gy = 82, cx = 30;
  const F = frames(W, H, 6, (g, f) => {
    if (f === 0) { const [hx, hy] = wormNeck(g, cx, gy - 4, 46, 0.2); wormHead(g, hx + 2, hy - 6, 0, false); duneFoot(g, cx, gy, 22, 6); }                                // surfaced
    if (f === 1) { const [hx, hy] = wormNeck(g, cx, gy - 4, 50, -0.6); wormHead(g, hx - 2, hy - 8, 0.7, true); duneFoot(g, cx, gy, 22, 6); }                            // SPRAY TELL: reared back, throat lit
    if (f === 2) { const [hx, hy] = wormNeck(g, cx, gy - 4, 44, 0.9); wormHead(g, hx + 6, hy - 4, 1, true); duneFoot(g, cx, gy, 22, 6);                                 // SPRAY: thrust, wide
      sandBurst(g, hx + 26, hy - 4, 22, 14, 10, 7); }
    if (f === 3) { const [hx, hy] = wormNeck(g, cx, gy - 4, 58, 0.05); wormHead(g, hx, hy - 8, 0.8, false); duneFoot(g, cx, gy, 26, 9); sandBurst(g, cx, gy - 8, 60, 30, 40, 3); }   // BREACH
    if (f === 4) { // STUCK: jammed up through a wagon's timbers, head lolling, eyes dazed - THE OPENING
      const [hx, hy] = wormNeck(g, cx, gy - 4, 40, 0.3); wormHead(g, hx + 3, hy - 4, 0.35, false, true); duneFoot(g, cx, gy, 26, 7);
      for (const [x0, y0, x1, y1] of [[cx - 22, gy - 30, cx + 20, gy - 38], [cx - 18, gy - 20, cx + 22, gy - 14], [cx - 8, gy - 44, cx + 4, gy - 10]]) { line(g, x0, y0, x1, y1, DW.wood); line(g, x0, y0 + 1, x1, y1 + 1, DW.woodD); px(g, x0, y0 - 1, DW.woodL); }   // the timbers across it
      for (let i = 0; i < 6; i++) { const sx = cx - 14 + i * 6, sy = gy - 50 + (i % 3) * 4; line(g, sx, sy, sx + 2, sy - 3, DW.woodL); } }                                   // splinters in the air
    if (f === 5) { const [hx, hy] = wormNeck(g, cx, gy - 4, 22, 0.8); wormHead(g, hx + 8, hy + 4, 0.1, false); duneFoot(g, cx, gy, 26, 8); sandBurst(g, cx + 10, gy - 6, 20, 16, 10, 11); }   // diving
  });
  return pack(F, cx, H, 30, 60);
}
/* THE LUNGE's body in flight, drawn long: an arc of rings out of the sand and back in (the game moves the sprite along the
   arc WORM.lungeH high; these three frames are its pose at the start, the top and the end) */
export function bakeDuneWormLunge() {
  const W = 112, H = 56;
  const F = frames(W, H, 3, (g, f) => {
    const n = 13, ph = [0.15, 0.5, 0.85][f], arc = k => H - 8 - Math.sin(Math.max(0, Math.min(1, k * 0.85 + 0.3 - ph * 0.45)) * Math.PI) * 34;
    for (let i = 0; i <= n; i++) { const k = i / n, x = 8 + k * 76, y = arc(k), r = 5 + k * 6;
      ellipse(g, x, y, 4.4, r, DW.hd); ellipse(g, x - 0.5, y, 3.8, r - 0.6, DW.h); for (let yy = Math.round(y - r + 2); yy < y; yy++) px(g, Math.round(x - 3), yy, DW.H);
      ellipse(g, x + 1, y + r * 0.45, 2.5, r * 0.35, DW.belly); }
    wormHead(g, 94, arc(1) - 2, 0.9, false);
  });
  return pack(F, 56, H, 64, 26);
}
