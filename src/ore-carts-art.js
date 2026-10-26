// src/ore-carts-art.js - THE LAUNCHED CARTS' DRAWN THINGS (claude/oreroadminor): the short rail, its buffer stops, the ore cart, the barricade (and its planks flying when it breaks), and the trip chain that runs up to a cold lamp.
// Reuses THE DEEP RAILS' art (src/redraw/minecart_art.js: rail, buffer, tub, prowLamp) so the two levels' carts are the same iron; the barricade and the chain are this level's own. Plain fillRect pixel art on the screen.
// Browser-only (the Deep Rails art builds canvases): main.js imports it and hands it to src/ore-works.js; the physics stays pure in src/ore-carts.js.
import * as MCA from './redraw/minecart_art.js';
import { OC } from './ore-carts.js';
const R = Math.round, TS = 16;
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const WOOD = ['#1e130c', '#35241a', '#5a3e24', '#7a5632', '#a07a48', '#c8a266'], IRON = ['#14141a', '#2a2a32', '#46464f', '#6a6a76', '#9a9aa8'];

/* THE RAIL: sleepers + the iron head tile by tile from the first buffer to the last, then the buffers (the west one faces east, the east one is its mirror) */
export function drawRail(g, c, cx, cy, time, endX, eastBuf = true) {
  const sx0 = R(c.x0 - cx), sy = R(c.y - cy), x1 = endX == null ? c.x1 : endX, n = Math.round((x1 - c.x0) / TS);
  if (sx0 > 1000 || sx0 + n * TS < -40) return;
  for (let i = 0; i < n; i++) MCA.rail(g, sx0 + i * TS, sy, Math.round(c.x0 / TS) + i);
  MCA.buffer(g, sx0, sy, true, time);
  if (eastBuf) { g.save(); g.translate(R(x1 - cx), 0); g.scale(-1, 1); MCA.buffer(g, 0, sy, true, time); g.restore(); }
}
/* THE CART: the Deep Rails' ore tub (iron-banded, riveted, a heap of copper and gold nuggets, the wheels turning with the roll) and a hand lantern hooked on its tail so a dark stretch can see it coming */
export function drawCart(g, c, cx, cy, time, lit) {
  const x = R(c.x - cx), y = R(c.y - cy) - 2, j = c.jolt > 0 ? R(Math.sin(time * 90) * c.jolt * 1.4) : 0;
  if (x < -40 || x > 1000) return;
  g.save(); g.translate(j, 0);
  MCA.tub(g, x, y, 'wood', c.wheel * 6, 0);                                            // the Deep Rails tub in its plain hull (brighter than the ore kind, which sinks into this cavern's dark)...
  rc(g, x - 11, y - 12, 22, 1, '#d8b878'); rc(g, x - 10, y - 11, 20, 1, '#a07a48'); rc(g, x - 11, y - 11, 1, 9, '#b89868');   // ...a lit rim and a lit near edge
  for (let i = 0; i < 6; i++) rc(g, x - 9 + i * 3 + (i & 1), y - 16 + (i % 3), 3, 4, i % 2 ? '#3aa87c' : '#c8803c');          // the heap of copper and iron
  rc(g, x - 6, y - 16, 2, 1, '#fff0a0'); rc(g, x + 2, y - 15, 2, 1, '#8ae8bc'); rc(g, x + 6, y - 17, 2, 1, '#e8b830');       // with gold in it
  rc(g, x - 10, y - 2, 20, 1, '#14100e');
  /* the lantern on the tail: a cage and a flame (its pool is a hole in the dark: OWK.holes) */
  const tx = x - (c.face || 1) * 13;
  rc(g, tx - 1, y - 14, 3, 1, IRON[3]); rc(g, tx - 2, y - 13, 5, 6, IRON[1]); rc(g, tx - 1, y - 12, 3, 4, lit ? '#ffd36b' : '#7a5a2a'); if (lit) rc(g, tx, y - 11, 1, 2, '#fff6c8');
  g.restore();
}
/* THE BARRICADE (a rock-solid plug at build time, drawn as a timber barricade): standing planks, two iron straps, a cross-brace, a hazard band and a plate that says what it is. r = { l, r, t, b } px */
export function drawBarricade(g, r, cx, cy, time, near) {
  const x = R(r.l - cx), y = R(r.t - cy), w = R(r.r - r.l), h = R(r.b - r.t), sh = near ? R(Math.sin(time * 70)) : 0;
  if (x < -w - 8 || x > 1000) return;
  rc(g, x - 1, y - 1, w + 2, h + 2, WOOD[0]);                                       // outline
  const px = w / 4;
  for (let k = 0; k < 4; k++) {                                                       // four standing planks, each its own tone and grain
    const cx0 = R(x + k * px), tone = (k * 3 + (R(r.l) >> 4)) % 3;
    rc(g, cx0, y, R(px) - 1, h, WOOD[2 + tone % 2]); rc(g, cx0, y, 1, h, WOOD[4]); rc(g, cx0 + R(px) - 2, y, 1, h, WOOD[1]);
    for (let gy = 5 + k * 3; gy < h - 2; gy += 11) rc(g, cx0 + 1 + (gy % 3), y + gy, 1, 3, WOOD[1]);
  }
  rc(g, x, y, w, 4, WOOD[1]);                                                         // the top rail
  for (let i = 0; i < w; i += 6) { rc(g, x + i, y + 1, 3, 2, i % 12 === 0 ? '#e8b830' : '#14100e'); }   // the hazard band
  for (const sy of [y + 10, y + h - 12]) { rc(g, x, sy, w, 3, IRON[1]); rc(g, x, sy, w, 1, IRON[4]); rc(g, x + 2, sy + 1, 1, 1, IRON[0]); rc(g, x + w - 3, sy + 1, 1, 1, IRON[0]); }   // the straps and their rivets
  for (let k = 0; k < h - 14; k++) { const px2 = x + 2 + R(k * (w - 5) / Math.max(1, h - 15)), py = y + 12 + k; rc(g, px2 + sh, py, 2, 1, WOOD[0]); }   // the cross-brace
  rc(g, x + 3, y + R(h / 2) - 2, w - 6, 6, IRON[1]); rc(g, x + 3, y + R(h / 2) - 2, w - 6, 1, IRON[3]);                                          // the plate
  rc(g, x + 5, y + R(h / 2), 2, 2, '#e8b830'); rc(g, x + 8, y + R(h / 2), 3, 1, '#e8b830'); rc(g, x + 8, y + R(h / 2) + 2, 3, 1, '#e8b830');   // a hazard mark on it, not a word
}
/* THE PLANKS OF A BREAKING BARRICADE: pieces thrown out, turning, falling; the level's step moves them */
export function spawnDebris(arr, r, dir) {
  const w = r.r - r.l, h = r.b - r.t;
  for (let k = 0; k < 14; k++) arr.push({ x: r.l + Math.random() * w, y: r.t + Math.random() * h, vx: dir * (90 + Math.random() * 160) + (Math.random() - 0.5) * 60, vy: -80 - Math.random() * 120, a: Math.random() * 6, va: (Math.random() - 0.5) * 14, w: 3 + Math.floor(Math.random() * 7), h: 2 + Math.floor(Math.random() * 3), col: k % 5 === 0 ? IRON[2] : WOOD[2 + (k % 3)], life: 0.9 + Math.random() * 0.5 });
}
export function stepDebris(arr, dt) { for (const d of arr) { d.vy += 520 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.a += d.va * dt; d.life -= dt; } return arr.filter(d => d.life > 0); }
export function drawDebris(g, arr, cx, cy) {
  for (const d of arr) { g.save(); g.translate(R(d.x - cx), R(d.y - cy)); g.rotate(d.a); g.globalAlpha = Math.min(1, d.life * 2); g.fillStyle = d.col; g.fillRect(-d.w / 2, -d.h / 2, d.w, d.h); g.fillStyle = WOOD[0]; g.fillRect(-d.w / 2, d.h / 2 - 1, d.w, 1); g.restore(); }
  g.globalAlpha = 1;
}
/* THE TRIP CHAIN: an iron post at a rail's end with a lever on it; a chain climbs from the lever's ring straight up to the lamp's cage. Pulled (t > 0), the lever swings down and the chain jerks.
   (x, y) the lever's foot on the rail's surface; ly the cage's bottom; pulled 0..1 */
export function drawTrip(g, x0, y0, ly, cx, cy, time, pulled) {
  const x = R(x0 - cx), y = R(y0 - cy), top = R(ly - cy), p = Math.max(0, Math.min(1, pulled));
  rc(g, x - 3, y - 18, 5, 18, IRON[0]); rc(g, x - 2, y - 17, 3, 17, IRON[2]); rc(g, x - 2, y - 17, 1, 17, IRON[4]);          // the post
  rc(g, x - 5, y - 2, 9, 2, IRON[1]); rc(g, x - 5, y - 3, 9, 1, IRON[3]);                                                      // its foot plate
  const ay = y - 16 + R(p * 5);                                                                                                // the lever arm, swung down when pulled
  rc(g, x - 8, ay, 7, 2, IRON[0]); rc(g, x - 8, ay, 7, 1, IRON[4]); rc(g, x - 9, ay - 1, 3, 4, '#c8583a');                    // arm + a red knob
  const jerk = p > 0 && p < 1 ? R(Math.sin(time * 40) * 1.2) : 0;
  for (let yy = top; yy < ay - 3; yy += 3) { const k = ((yy - top) / 3) & 1; rc(g, x + jerk - 6 + (k ? 0 : 0), yy, 2, 3, IRON[0]); rc(g, x + jerk - 6, yy, 1, 2, k ? IRON[2] : IRON[4]); }   // the chain, link on link
  rc(g, x - 7 + jerk, ay - 2, 3, 2, '#d8b04a');                                                                                // a brass ring on the arm
}
