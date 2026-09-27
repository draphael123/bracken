// queue_bosses2.js — two more queued bosses, baked ahead of their batches (NOT wired: each build adds its spawn case, frame
// table and the rest, as the Grave and Hedge Wardens did from queue_bosses.js). Looks from the briefs:
// .claude/briefs/unburied-field.md (THE FIRST DEATH KNIGHT; its first mini, THE STANDARD-BEARER, was cut on 2026-09-24 for THE BARROW RIDER, whose art is src/unburied-foes.js) and stormhold-extension.md (THE GATE SERJEANT).
// px.js primitives only; tools/queue-bosses2.mjs renders them in Node. Contract as queue_bosses.js: frames face RIGHT, one canvas
// size per sprite, grounded frames settled so ay = H, ax the body's centre. Every tell is bigger and slower than its blow, and
// each boss has the pose of the OPENING the player makes.
//
// bakeDeathKnight()     0 idle | 1,2 walk | 3 SWATHE TELL (the scythe drawn back high) | 4 SWATHE (low across the front, the
//                       blade out) | 5 REAPING TELL (the scythe level over his head) | 6 REAPING (blade out to the side, cloak
//                       flared) | 7 THE PASSING (lunging through, streaks) | 8 RAISE (the free hand up, green) | 9 OPEN (THE
//                       OPENING: the scythe caught in his own dead, doubled over) | 10 hurt
// bakeGateSerjeant()    0 idle | 1,2 walk | 3 CHOP TELL (the halberd up) | 4 CHOP | 5 THRUST TELL (drawn back) | 6 THRUST |
//                       7 hurt
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
const thick = (g, x0, y0, x1, y1, col, w = 2) => { const v = Math.abs(y1 - y0) > Math.abs(x1 - x0); for (let k = 0; k < w; k++) line(g, x0 + (v ? k : 0), y0 + (v ? 0 : k), x1 + (v ? k : 0), y1 + (v ? 0 : k), col); };

// ================= THE FIRST DEATH KNIGHT =================
/* the one whose armour and scythe the class inherits: black plate edged in bone, a horned helm with a pale green slit, a
   tattered cloak, and a great scythe - the blade steel, its edge lit green */
const DK = { plate: '#34343f', plateL: '#56566a', plateD: '#1f1f28', bone: '#cfc6aa', cloak: '#2a1e2c', cloakL: '#40304a', horn: '#b8ad90', hornD: '#7e7560',
  soul: '#8fe0a8', soulL: '#dfffe8', haft: '#3e2e24', haftL: '#5e4636', blade: '#9aa2ae', bladeL: '#d6dde6' };
export function bakeDeathKnight() {
  const W = 96, H = 70, cx = 40;
  const cloak = (g, x, y, flare = 0) => fillPoly(g, [[x - 6, y], [x + 4, y], [x - 4 - flare, y + 30], [x - 10 - flare * 2, y + 34], [x - 13 - flare * 2, y + 28], [x - 17 - flare * 3, y + 33], [x - 12, y + 6]], DK.cloak);
  const legs = (g, x, y, ph) => { const a = [0, 2, -2][ph]; for (const [s, o] of [[-1, a], [1, -a]]) { const lx = x + s * 4 + o; rect(g, lx - 2, y, 5, 13, DK.plate); rect(g, lx - 2, y, 5, 1, DK.plateL); rect(g, lx - 3, y + 13, 7, 3, DK.plateD); rect(g, lx - 2, y + 5, 5, 2, DK.bone); } };
  const body = (g, x, y, lean = 0) => { fillPoly(g, [[x - 9 + lean, y], [x + 9 + lean, y], [x + 8, y + 17], [x - 8, y + 17]], DK.plate);
    line(g, x - 8 + lean, y + 1, x + 8 + lean, y + 1, DK.plateL); line(g, x + lean, y + 2, x, y + 16, DK.plateD);
    for (let k = 0; k < 3; k++) line(g, x - 6 + lean, y + 5 + k * 4, x + 6 + lean, y + 5 + k * 4, DK.bone);         // ribs of bone laid on the plate
    ellipse(g, x - 10 + lean, y + 2, 5, 4, DK.plateL); ellipse(g, x + 10 + lean, y + 2, 5, 4, DK.plateL); px(g, x - 10 + lean, y, DK.bone); px(g, x + 10 + lean, y, DK.bone); };
  const head = (g, x, y) => { rect(g, x - 5, y - 11, 11, 12, DK.plate); rect(g, x - 5, y - 11, 11, 2, DK.plateL); rect(g, x - 3, y - 6, 8, 2, DK.soul); px(g, x + 3, y - 6, DK.soulL);
    fillPoly(g, [[x - 5, y - 9], [x - 9, y - 12], [x - 11, y - 18], [x - 8, y - 16], [x - 4, y - 11]], DK.horn); fillPoly(g, [[x + 6, y - 9], [x + 10, y - 12], [x + 12, y - 18], [x + 9, y - 16], [x + 5, y - 11]], DK.horn);
    px(g, x - 10, y - 17, DK.hornD); px(g, x + 11, y - 17, DK.hornD); };
  const arm = (g, x0, y0, x1, y1) => { thick(g, x0, y0, x1, y1, DK.plate, 3); rect(g, x1 - 2, y1 - 2, 4, 4, DK.plateD); };
  /* the scythe: the haft from the grip (gx,gy) through the hands to its head (hx,hy); the blade curls from the head, `dir` +1
     curling down-forward, -1 down-back */
  const scythe = (g, gx, gy, hx, hy, dir = 1, glow = 0) => { thick(g, gx, gy, hx, hy, DK.haft, 2); line(g, gx, gy, hx, hy, DK.haftL);
    const a = Math.atan2(hy - gy, hx - gx), nx = -Math.sin(a) * dir, ny = Math.cos(a) * dir, pts = [];
    for (let k = 0; k <= 10; k++) { const t = k / 10, r = 26 * t; pts.push([hx + nx * r + Math.cos(a) * (8 * Math.sin(t * Math.PI)), hy + ny * r + Math.sin(a) * (8 * Math.sin(t * Math.PI))]); }
    const inner = pts.map(([x, y], k) => [x - Math.cos(a) * (4 * (1 - k / 10)), y - Math.sin(a) * (4 * (1 - k / 10))]).reverse();
    fillPoly(g, pts.concat(inner), DK.blade); for (let k = 1; k < pts.length; k++) line(g, pts[k - 1][0], pts[k - 1][1], pts[k][0], pts[k][1], glow ? DK.soulL : DK.bladeL); };
  const F = frames(W, H, 11, (g, f) => {
    const floor = H - 2, hip = floor - 16, ph = f === 1 ? 1 : f === 2 ? 2 : 0;
    if (f === 9) { // OPEN - THE OPENING: the scythe caught fast in the body of his own dead, him doubled over it
      rect(g, cx + 8, floor - 4, 18, 4, DK.bone); ellipse(g, cx + 24, floor - 5, 3, 3, DK.bone);
      scythe(g, cx - 6, hip - 8, cx + 16, floor - 6, 1); legs(g, cx - 2, hip + 1, 2); cloak(g, cx - 2, hip - 16); body(g, cx - 2, hip - 16, 6); head(g, cx + 5, hip - 15);
      arm(g, cx + 6, hip - 13, cx + 8, hip - 2); for (let k = 0; k < 3; k++) px(g, cx + 12 + k * 4, hip - 30 - (k & 1) * 2, DK.soul); return; }
    const flare = f === 6 ? 3 : f === 7 ? 2 : 0, lean = f === 7 ? 5 : f === 3 ? -2 : 0;
    if (f === 7) for (let k = 0; k < 4; k++) line(g, cx - 34, hip - 20 + k * 7, cx - 12, hip - 20 + k * 7, k & 1 ? DK.soul : DK.cloakL);   // THE PASSING: streaks behind him
    cloak(g, cx, hip - 18, flare); legs(g, cx, hip, ph); body(g, cx, hip - 18, lean); head(g, cx + 1 + lean, hip - 18);
    const sh = [cx + 8 + lean, hip - 15];
    if (f === 3) { arm(g, ...sh, cx - 6, hip - 30); scythe(g, cx + 6, hip - 4, cx - 18, hip - 44, -1); }                        // SWATHE TELL: drawn back high
    else if (f === 4) { arm(g, ...sh, cx + 18, hip - 4); scythe(g, cx - 6, hip - 10, cx + 30, hip + 2, 1, 1); }                 // SWATHE: low across the front
    else if (f === 5) { arm(g, ...sh, cx + 4, hip - 34); scythe(g, cx - 22, hip - 36, cx + 26, hip - 36, 1); }                   // REAPING TELL: level overhead
    else if (f === 6) { arm(g, ...sh, cx + 22, hip - 14); scythe(g, cx + 4, hip - 14, cx + 40, hip - 20, 1, 1);                // REAPING: out to the side, the circle
      g.globalAlpha = 0.5; for (let a = 0; a < Math.PI * 2; a += 0.2) px(g, cx + Math.cos(a) * 38, hip - 12 + Math.sin(a) * 10, DK.soul); g.globalAlpha = 1; }
    else if (f === 7) { arm(g, ...sh, cx + 20, hip - 10); scythe(g, cx + 2, hip - 6, cx + 34, hip - 18, 1, 1); }                // THE PASSING: lunging through
    else if (f === 8) { arm(g, ...sh, cx + 12, hip - 4); scythe(g, cx + 12, floor - 3, cx + 16, hip - 40, -1); arm(g, cx - 6, hip - 15, cx - 10, hip - 38);   // RAISE
      circle(g, cx - 10, hip - 42, 4, DK.soul); px(g, cx - 10, hip - 42, DK.soulL); for (let k = 0; k < 5; k++) px(g, cx - 18 + k * 4, floor - 1 - (k & 1) * 3, DK.soul); }
    else { arm(g, ...sh, cx + 14, hip - 6); scythe(g, cx + 6, floor - 2, cx + 22, hip - 36, -1); }                               // idle/walk/hurt: held diagonally, blade high behind
  });
  return pack(F, cx, H, 20, 38);
}

// ================= THE GATE SERJEANT =================
/* a heavy goblin in a kettle helm and a studded brigandine, a halberd, and the curtain wall's winch key on a chain at his belt */
const GS = { skin: '#6f9a4a', skinD: '#4e7034', helm: '#8a8c94', helmL: '#bcbec6', helmD: '#5a5c64', brig: '#7a3a2a', brigD: '#5a2a1e', stud: '#d0b060',
  haft: '#6e4a2c', haftL: '#8e6a44', blade: '#a0a8b4', bladeL: '#dfe6ee', key: '#c9a040', keyD: '#8a6a22', eye: '#ffd36b', boot: '#3a2a22' };
export function bakeGateSerjeant() {
  const W = 60, H = 48, cx = 24;
  const body = (g, x, y, lean = 0) => { fillPoly(g, [[x - 8 + lean, y], [x + 8 + lean, y], [x + 9, y + 13], [x - 9, y + 13]], GS.brig); line(g, x - 7 + lean, y + 1, x + 7 + lean, y + 1, GS.brigD);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) px(g, x - 6 + k * 4 + lean, y + 3 + r * 4, GS.stud);
    rect(g, x - 9, y + 12, 18, 2, GS.brigD); line(g, x + 5, y + 13, x + 9, y + 18, GS.keyD);                            // belt, the key's chain
    rect(g, x + 8, y + 17, 3, 6, GS.key); rect(g, x + 7, y + 22, 5, 2, GS.key); px(g, x + 9, y + 18, GS.keyD); };
  const legs = (g, x, y, ph) => { const a = [0, 2, -2][ph]; for (const [s, o] of [[-1, a], [1, -a]]) { const lx = x + s * 4 + o; rect(g, lx - 2, y, 5, 7, GS.skinD); rect(g, lx - 3, y + 7, 7, 3, GS.boot); } };
  const head = (g, x, y) => { ellipse(g, x, y, 6, 5, GS.skin); fillPoly(g, [[x - 5, y - 1], [x - 12, y - 4], [x - 6, y + 2]], GS.skin);   // head and a long ear
    px(g, x + 3, y, GS.eye); rect(g, x + 2, y + 3, 4, 1, GS.skinD); px(g, x + 5, y + 2, '#e8e0c8');
    ellipse(g, x, y - 3, 8, 3, GS.helm); rect(g, x - 5, y - 7, 11, 4, GS.helm); rect(g, x - 5, y - 7, 11, 1, GS.helmL); line(g, x - 8, y - 2, x + 8, y - 2, GS.helmD); };
  const arm = (g, x0, y0, x1, y1) => { thick(g, x0, y0, x1, y1, GS.skin, 3); rect(g, x1 - 1, y1 - 1, 3, 3, GS.skinD); };
  const halberd = (g, gx, gy, tx, ty) => { thick(g, gx, gy, tx, ty, GS.haft, 2); line(g, gx, gy, tx, ty, GS.haftL);
    const a = Math.atan2(ty - gy, tx - gx), ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    fillPoly(g, [[tx - ux * 3 + nx * 1, ty - uy * 3 + ny * 1], [tx - ux * 6 + nx * 7, ty - uy * 6 + ny * 7], [tx + ux * 2 + nx * 8, ty + uy * 2 + ny * 8], [tx + ux * 2 + nx * 1, ty + uy * 2 + ny * 1]], GS.blade);   // the axe
    line(g, tx - ux * 5 + nx * 7, ty - uy * 5 + ny * 7, tx + ux * 1 + nx * 8, ty + uy * 1 + ny * 8, GS.bladeL);
    fillPoly(g, [[tx, ty], [tx + ux * 8 - nx * 1, ty + uy * 8 - ny * 1], [tx + ux * 1 - nx * 2, ty + uy * 1 - ny * 2]], GS.bladeL);   // the spike
    fillPoly(g, [[tx - ux * 2 - nx * 1, ty - uy * 2 - ny * 1], [tx - ux * 1 - nx * 5, ty - uy * 1 - ny * 5], [tx + ux * 1 - nx * 1, ty + uy * 1 - ny * 1]], GS.blade); };   // the hook behind
  const F = frames(W, H, 8, (g, f) => {
    const floor = H - 2, hip = floor - 10, ph = f === 1 ? 1 : f === 2 ? 2 : 0, lean = f === 4 || f === 6 ? 3 : f === 7 ? -2 : 0;
    legs(g, cx, hip, ph); body(g, cx, hip - 13, lean); head(g, cx + 1 + lean, hip - 19);
    const sh = [cx + 6 + lean, hip - 11];
    if (f === 3) { arm(g, ...sh, cx + 4, hip - 26); halberd(g, cx + 2, hip - 8, cx - 8, hip - 34); }                           // CHOP TELL: up and back
    else if (f === 4) { arm(g, ...sh, cx + 16, hip - 8); halberd(g, cx + 4, hip - 16, cx + 30, hip + 2); }                    // CHOP: down in front
    else if (f === 5) { arm(g, ...sh, cx - 2, hip - 8); halberd(g, cx + 12, hip - 10, cx - 12, hip - 12); }                   // THRUST TELL: drawn back
    else if (f === 6) { arm(g, ...sh, cx + 18, hip - 10); halberd(g, cx - 2, hip - 10, cx + 34, hip - 12); }                  // THRUST
    else { arm(g, ...sh, cx + 10, hip - 4); halberd(g, cx + 10, floor - 1, cx + 12, hip - 30); }                              // at rest, butt grounded
  });
  return pack(F, cx, H, 16, 28);
}
