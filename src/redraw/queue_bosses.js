// queue_bosses.js — the next three bosses in Daniel's queue, baked ahead of their batches (not wired in: each batch adds its
// spawn case, frame table and the rest of A8). Looks from the briefs: .claude/briefs/burial-rework.md (THE GRAVE WARDEN) and
// witchlight-stair.md (THE HEDGE WARDEN, THE GATE GARGOYLE). px.js primitives only: tools/queue-bosses.mjs renders them in
// Node. shore.js's contract: frames face RIGHT, one canvas per sprite, grounded frames settled so ay = H, ax the body's
// centre. Every tell pose is bigger and slower than its blow, and each boss has its OPENING pose, the one the player makes.
//
// bakeGraveWarden()  0 idle | 1,2 walk | 3 SPADE CLEAVE TELL (spade behind the head) | 4 CLEAVE | 5 GRAVE TOSS TELL (scooping)
//                    | 6 TOSS | 7,8 LANTERN SWING (the lantern out on its chain, two sides) | 9 DIG TELL (spade raised to drive
//                    down) | 10 DIG (spade in the floor) | 11 TOLL (lantern up, ringing) | 12 KNEELING (THE OPENING: pitched to
//                    his knees in a grave, spade sunk) | 13 hurt
// bakeHedgeWarden()  0 stand | 1,2 walk | 3 CUT TELL (the clipped sword up) | 4 CUT | 5 THORN TELL (arms flung wide, thorns
//                    bristling red) | 6 THORNS | 7 STUMP (cut down: roots and a stump) | 8,9 REGROWING (half, nearly)
// bakeGateGargoyle() 0 PERCHED (on the gate, wings folded) | 1,2 fly | 3 DIVE TELL (high, wings wide) | 4 DIVE | 5 GUST TELL
//                    (wings drawn back) | 6 GUST | 7 SPIT TELL (head back, throat lit) | 8 SPIT | 9 SHRIEK | 10 HANGING
//                    (THE OPENING: clinging by the claws to a broken slab's edge)
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten, shade as tint } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
function settleFrame(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, n, fn, ground = true) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return ground ? settleFrame(c) : c; });
const thick = (g, x0, y0, x1, y1, col, w = 2) => { for (let k = 0; k < w; k++) line(g, x0 + (Math.abs(y1 - y0) > Math.abs(x1 - x0) ? k : 0), y0 + (Math.abs(y1 - y0) > Math.abs(x1 - x0) ? 0 : k), x1 + (Math.abs(y1 - y0) > Math.abs(x1 - x0) ? k : 0), y1 + (Math.abs(y1 - y0) > Math.abs(x1 - x0) ? 0 : k), col); };

// ================= THE GRAVE WARDEN =================
/* the ossuary's keeper: huge, slow, an armoured skeleton in a gravedigger's hood; a spade; a bell-lantern on a chain */
const GW = { bone: '#e0d6bc', boneD: '#b0a58a', boneS: '#7e7560', hood: '#3a3040', hoodD: '#261e2c', hoodL: '#54485c', iron: '#6e6a64', ironL: '#9a958c', ironD: '#4a4640',
  rust: '#8a5a3a', haft: '#6e4a2c', haftL: '#8e6a44', blade: '#8a919c', bladeL: '#c9d1dc', glow: '#ffd36b', glowL: '#fff6c8', eye: '#9ae0ff', dirt: '#5a4636', dirtL: '#7a6450', chain: '#8a857c' };
export function bakeGraveWarden() {
  const W = 72, H = 60, cx = 30;
  const skull = (g, x, y, tilt = 0) => { ellipse(g, x, y, 5, 5.5, GW.bone); rect(g, x - 3, y + 3, 7, 3, GW.boneD); px(g, x - 1, y + tilt, GW.hoodD); rect(g, x + 1, y - 1 + tilt, 2, 2, GW.hoodD); px(g, x + 2, y + tilt, GW.eye); for (let t = 0; t < 3; t++) px(g, x - 1 + t * 2, y + 5, GW.boneS); };
  /* the COWL: a peaked hood over the skull, its opening framing the face, the cloth falling to the shoulders both sides
     (drawn in two parts: the back before the skull, the brim after it) */
  const hood = (g, x, y) => { fillPoly(g, [[x - 9, y + 8], [x - 8, y - 4], [x - 4, y - 10], [x - 1, y - 13], [x + 3, y - 9], [x + 8, y - 3], [x + 9, y + 6], [x + 5, y + 9], [x - 5, y + 9]], GW.hood);
    line(g, x - 7, y - 4, x - 2, y - 11, GW.hoodL); line(g, x - 8, y + 2, x - 8, y + 7, GW.hoodL); };
  const brim = (g, x, y) => { for (let a = Math.PI * 1.05; a < Math.PI * 1.95; a += 0.12) { px(g, x + 1 + Math.cos(a) * 6, y + 1 + Math.sin(a) * 6.5, GW.hoodD); px(g, x + 1 + Math.cos(a) * 7, y + 1 + Math.sin(a) * 7.5, GW.hood); } };
  /* the torso: a rusted breastplate over ribs, a ragged mantle; `bend` leans it forward */
  const torso = (g, x, y, bend = 0) => { fillPoly(g, [[x - 9 + bend, y], [x + 8 + bend, y], [x + 7, y + 16], [x - 8, y + 16]], GW.hoodD);
    fillPoly(g, [[x - 7 + bend, y + 1], [x + 7 + bend, y + 1], [x + 6, y + 12], [x - 6, y + 12]], GW.iron); line(g, x - 6 + bend, y + 2, x + 6 + bend, y + 2, GW.ironL); rect(g, x - 1, y + 3, 2, 8, GW.ironD);
    for (let k = 0; k < 3; k++) px(g, x - 4 + k * 4, y + 6 + k, GW.rust);
    rect(g, x - 5, y + 12, 10, 3, GW.boneD); for (let k = 0; k < 4; k++) px(g, x - 4 + k * 3, y + 13, GW.boneS); };   // the pelvis under the plate
  const legs = (g, x, y, ph) => { const a = [0, 2, -2][ph], b = -a; thick(g, x - 3, y, x - 4 + a, y + 13, GW.bone); thick(g, x + 3, y, x + 3 + b, y + 13, GW.bone);
    rect(g, x - 6 + a, y + 13, 5, 2, GW.ironD); rect(g, x + 1 + b, y + 13, 5, 2, GW.ironD); };
  const arm = (g, x0, y0, x1, y1) => { thick(g, x0, y0, (x0 + x1) / 2, (y0 + y1) / 2 + 2, GW.bone); thick(g, (x0 + x1) / 2, (y0 + y1) / 2 + 2, x1, y1, GW.boneD); };
  const spade = (g, hx, hy, tx, ty) => { thick(g, hx, hy, tx, ty, GW.haft); const a = Math.atan2(ty - hy, tx - hx), bx = Math.cos(a), by = Math.sin(a);
    fillPoly(g, [[tx - by * 4, ty + bx * 4], [tx + by * 4, ty - bx * 4], [tx + by * 3 + bx * 9, ty - bx * 3 + by * 9], [tx + bx * 12, ty + by * 12], [tx - by * 3 + bx * 9, ty + bx * 3 + by * 9]], GW.blade);
    line(g, tx + by * 3, ty - bx * 3, tx + bx * 11, ty + by * 11, GW.bladeL); };
  const lantern = (g, x, y, lit = 1) => { rect(g, x - 3, y - 4, 7, 8, GW.ironD); rect(g, x - 2, y - 3, 5, 6, lit ? GW.glow : GW.rust); if (lit) px(g, x, y - 1, GW.glowL); rect(g, x - 4, y - 5, 9, 1, GW.iron); rect(g, x - 4, y + 4, 9, 1, GW.iron); px(g, x, y - 6, GW.iron); };
  const chainTo = (g, x0, y0, x1, y1) => { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2); for (let i = 0; i <= n; i += 1) px(g, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, i & 1 ? GW.chain : GW.ironD); };
  const graveDirt = (g, x, w) => { fillPoly(g, [[x - w, H - 1], [x - w + 3, H - 5], [x + w - 3, H - 5], [x + w, H - 1]], GW.dirt); for (let k = 0; k < w; k += 3) px(g, x - w + 3 + k, H - 5, GW.dirtL); };
  const F = frames(W, H, 14, (g, f) => {
    const floor = H - 2, hip = floor - 15;
    if (f === 12) { // KNEELING - THE OPENING: pitched to his knees in the soft ground of a grave, the spade sunk in it
      graveDirt(g, cx + 10, 18); spade(g, cx + 6, hip - 2, cx + 18, floor - 2); rect(g, cx - 10, floor - 6, 12, 5, GW.boneD);
      torso(g, cx - 2, hip - 8, 5); hood(g, cx + 5, hip - 13); skull(g, cx + 6, hip - 12, 1); brim(g, cx + 6, hip - 12); arm(g, cx + 4, hip - 4, cx + 10, hip + 2);
      for (let k = 0; k < 3; k++) { px(g, cx + 10 + k * 3, hip - 22 - k, GW.glow); }   // stars: dazed
      lantern(g, cx - 12, floor - 4, 0); return; }
    const ph = f === 1 ? 1 : f === 2 ? 2 : 0, bend = [3, 4].includes(f) ? 3 : [9, 10, 5].includes(f) ? 4 : 0;
    legs(g, cx, hip, ph); torso(g, cx, hip - 16, bend); hood(g, cx + 2 + bend, hip - 22); skull(g, cx + 3 + bend, hip - 21, f === 13 ? 1 : 0); brim(g, cx + 3 + bend, hip - 21);
    const sh = [cx + 5 + bend, hip - 13];   // the shoulder
    if (f === 3) { arm(g, ...sh, cx - 2, hip - 32); spade(g, cx - 2, hip - 32, cx - 14, hip - 40); }                               // CLEAVE TELL: spade behind the head
    else if (f === 4) { arm(g, ...sh, cx + 16, hip - 4); spade(g, cx + 16, hip - 4, cx + 24, floor - 4); }                         // CLEAVE: down in front
    else if (f === 5) { arm(g, ...sh, cx + 12, hip + 6); spade(g, cx + 6, hip - 2, cx + 18, floor - 3); graveDirt(g, cx + 22, 6); }   // TOSS TELL: scooping grave dirt
    else if (f === 6) { arm(g, ...sh, cx + 14, hip - 24); spade(g, cx + 8, hip - 14, cx + 20, hip - 28); for (const [dx, dy] of [[28, -34], [34, -28], [40, -22]]) ellipse(g, cx + dx, hip + dy, 2.5, 2, GW.dirt); }   // TOSS: three clods
    else if (f === 9) { arm(g, ...sh, cx + 12, hip - 30); spade(g, cx + 12, hip - 30, cx + 12, hip - 44); }                        // DIG TELL: raised to drive down
    else if (f === 10) { arm(g, ...sh, cx + 12, hip - 6); spade(g, cx + 12, hip - 10, cx + 13, floor + 1); for (let k = 0; k < 5; k++) px(g, cx + 6 + k * 3, floor - 1 - (k % 2), GW.dirtL); }   // DIG
    else { arm(g, ...sh, cx + 10, hip - 4); spade(g, cx + 10, hip - 20, cx + 11, floor - 5); }                                      // the spade grounded like a staff
    // the lantern, in the other hand, on its chain
    const lh = [cx - 5, hip - 12];
    if (f === 7) { arm(g, cx - 4, hip - 13, cx - 12, hip - 10); chainTo(g, cx - 12, hip - 10, cx - 30, hip - 4); lantern(g, cx - 30, hip - 2); }        // LANTERN SWING, out to the side
    else if (f === 8) { arm(g, cx - 4, hip - 13, cx + 2, hip - 8); chainTo(g, cx + 2, hip - 8, cx + 30, hip + 2); lantern(g, cx + 32, hip + 4); }      // ...and round the front
    else if (f === 11) { arm(g, cx - 4, hip - 13, cx - 6, hip - 34); chainTo(g, cx - 6, hip - 34, cx - 6, hip - 40); lantern(g, cx - 6, hip - 44); for (let k = 0; k < 4; k++) px(g, cx - 12 + k * 4, hip - 50 - (k & 1) * 2, GW.glowL); }   // TOLL: rung high
    else { arm(g, ...lh.map((v, i) => i ? hip - 13 : cx - 4), cx - 8, hip); chainTo(g, cx - 8, hip, cx - 8, hip + 5); lantern(g, cx - 8, hip + 9); }
  });
  return pack(F, cx, H, 20, 40);
}

// ================= THE HEDGE WARDEN =================
/* a giant topiary knight: clipped box hedge for armour, a helm with a clipped plume, a hedge-sword; cut down to a stump he
   REGROWS, so the stump and the regrowth are frames too */
const HW = { g: '#3e7a3a', G: '#5ea050', gd: '#2e5a2c', gD: '#1e3e20', leaf: '#86c060', trunk: '#6e4a2c', trunkL: '#8e6a44', trunkD: '#4a301c', flower: '#e8a0c0', flowerL: '#ffd0e0', thorn: '#e04030', eye: '#ffd36b', soil: '#5a4636', soilL: '#7a6450' };
export function bakeHedgeWarden() {
  const W = 64, H = 58, cx = 28;
  const clipped = (g, x, y, rx, ry, seed = 0) => { ellipse(g, x, y, rx, ry, HW.g); ellipse(g, x - rx * 0.25, y - ry * 0.3, rx * 0.65, ry * 0.55, HW.G);
    for (let k = 0; k < rx * ry / 6; k++) { const a = (k * 2.39996 + seed), r = Math.sqrt((k + 0.5) / (rx * ry / 6)); px(g, x + Math.cos(a) * r * (rx - 1), y + Math.sin(a) * r * (ry - 1), k % 3 ? HW.gd : HW.leaf); } };
  /* THE KNIGHT'S SHAPE, CLIPPED: a square breastplate of box hedge, round pauldrons, a great helm with a dark visor band and a
     clipped crest, a round topiary shield on the near arm. (The first bake was a barrel of hedge and read as a cactus: the
     silhouette has to say KNIGHT before the colour says hedge.) */
  const block = (g, x0, y0, w, h, seed) => { rect(g, x0, y0, w, h, HW.g); rect(g, x0 + 1, y0 + 1, w - 3, Math.max(1, h / 3), HW.G); rect(g, x0, y0 + h - 1, w, 1, HW.gd);
    for (let k = 0; k < w * h / 7; k++) { const a = k * 2.39996 + seed; px(g, x0 + 1 + ((Math.cos(a) * 0.5 + 0.5) * (w - 2)), y0 + 1 + ((Math.sin(a * 1.3) * 0.5 + 0.5) * (h - 2)), k % 3 ? HW.gd : HW.leaf); } };
  const knight = (g, f, grow = 1) => {
    const floor = H - 2, s = grow, hip = floor - 15 * s, ph = f === 1 ? 1 : f === 2 ? 2 : 0, a = [0, 2, -2][ph];
    block(g, cx - 7 + a, hip, 6, 15 * s, 1); block(g, cx + 2 - a, hip, 6, 15 * s, 2);
    rect(g, cx - 8 + a, floor - 1, 8, 1, HW.gD); rect(g, cx + 1 - a, floor - 1, 8, 1, HW.gD);
    block(g, cx - 10, hip - 20 * s, 20, 21 * s, 3);
    rect(g, cx - 10, hip - 2, 20, 2, HW.trunkD);
    line(g, cx, hip - 18 * s, cx, hip - 4, HW.gd);
    clipped(g, cx - 10, hip - 19 * s, 5, 4 * s, 5); clipped(g, cx + 10, hip - 19 * s, 5, 4 * s, 6);
    block(g, cx - 6, hip - 33 * s, 13, 13 * s, 7);
    rect(g, cx - 1, hip - 29 * s, 8, 2, HW.gD); px(g, cx + 3, hip - 29 * s, HW.eye); px(g, cx + 5, hip - 29 * s, HW.eye);
    for (let k = 0; k < 5; k++) clipped(g, cx - 4 + k * 2, hip - 36 * s - (k === 2 ? 2 : k % 2), 1.6, 2.4, 8 + k);
    for (let k = 0; k < 3; k++) px(g, cx - 6 + k * 5, hip - 12 * s + (k % 2) * 4, k % 2 ? HW.flower : HW.flowerL);
    if (s > 0.6) { clipped(g, cx - 13, hip - 10 * s, 6, 7 * s, 9); ellipse(g, cx - 13, hip - 10 * s, 2, 2, HW.trunk); px(g, cx - 13, hip - 10 * s, HW.trunkL); }
    return { floor, hip: hip - 5 }; };
  /* the sword: a wooden grip and cross-guard, the blade a long clipped leaf-blade, pointed */
  const sword = (g, hx, hy, tx, ty) => { const n = Math.hypot(tx - hx, ty - hy), ux = (tx - hx) / n, uy = (ty - hy) / n; thick(g, hx, hy, hx + ux * 5, hy + uy * 5, HW.trunk, 2);
    line(g, hx + ux * 5 - uy * 4, hy + uy * 5 + ux * 4, hx + ux * 5 + uy * 4, hy + uy * 5 - ux * 4, HW.trunkL);
    fillPoly(g, [[hx + ux * 6 - uy * 2.5, hy + uy * 6 + ux * 2.5], [tx - uy * 1.5, ty + ux * 1.5], [tx + ux * 4, ty + uy * 4], [tx + uy * 1.5, ty - ux * 1.5], [hx + ux * 6 + uy * 2.5, hy + uy * 6 - ux * 2.5]], HW.g);
    line(g, hx + ux * 6, hy + uy * 6, tx + ux * 3, ty + uy * 3, HW.G); };
  const F = frames(W, H, 10, (g, f) => {
    if (f === 7) { const floor = H - 2; fillPoly(g, [[cx - 12, floor], [cx - 8, floor - 3], [cx + 8, floor - 3], [cx + 12, floor]], HW.soil);   // STUMP: cut to the root
      rect(g, cx - 5, floor - 11, 10, 9, HW.trunk); rect(g, cx - 5, floor - 11, 10, 2, HW.trunkL); for (let k = 0; k < 3; k++) { rect(g, cx - 3 + k * 3, floor - 10, 1, 1, HW.trunkD); }
      for (const [dx, dy] of [[-9, -2], [8, -1], [-6, -4], [11, -3]]) line(g, cx + dx * 0.5, floor - 3, cx + dx, floor + dy + 2, HW.trunkD);   // roots
      for (let k = 0; k < 5; k++) px(g, cx - 4 + k * 2, floor - 12 - (k % 2), HW.leaf); return; }                                                 // the first green, already
    if (f === 8 || f === 9) { const s = f === 8 ? 0.45 : 0.8; const { hip } = knight(g, 0, s); rect(g, cx - 4, H - 8, 8, 6, HW.trunk);    // REGROWING: from the stump up
      for (let k = 0; k < 8; k++) px(g, cx - 12 + k * 3, hip - 4 - (k % 3) * 5, HW.leaf); return; }
    const { floor, hip } = knight(g, f);
    const sh = [cx + 8, hip - 16];
    if (f === 3) sword(g, sh[0], sh[1], cx - 2, hip - 44);                                     // CUT TELL: raised high over the helm
    else if (f === 4) sword(g, sh[0], sh[1], cx + 34, floor - 4);                              // CUT: down and out in front
    else if (f === 5 || f === 6) { sword(g, sh[0], sh[1], cx + 22, hip - 24);                  // THORN TELL / THORNS: bristling
      const n = f === 5 ? 10 : 14, r = f === 5 ? 15 : 22; for (let k = 0; k < n; k++) { const a = -Math.PI * 0.95 + k * Math.PI * 0.95 / (n - 1), x0 = cx + Math.cos(a) * 11, y0 = hip - 10 + Math.sin(a) * 11;
        line(g, x0, y0, cx + Math.cos(a) * r, hip - 10 + Math.sin(a) * r, f === 5 ? HW.thorn : HW.trunkD); if (f === 6) px(g, cx + Math.cos(a) * r, hip - 10 + Math.sin(a) * r, HW.thorn); } }
    else sword(g, sh[0], sh[1], cx + 20, floor - 3);                                           // resting on the point
  });
  return pack(F, cx, H, 22, 40);
}

// ================= THE GATE GARGOYLE =================
/* a huge stone gargoyle bolted over the tower's outer gate, woken by the loose magic: carved stone, moss in the cracks, an
   iron collar with a broken chain, and the witchlight in its eyes and throat */
const GG = { s: '#8a8a94', S: '#a6a6b0', sd: '#6e6e78', sD: '#4e4e58', moss: '#6a8a4a', mossL: '#8aaa5a', iron: '#4a4a52', ironL: '#7a7a84', witch: '#b8ff9a', witchL: '#effff0', claw: '#3e3e46', slab: '#7a7a84', slabL: '#9a9aa4', slabD: '#5a5a64' };
export function bakeGateGargoyle() {
  const W = 84, H = 64, cx = 40;
  /* A BAT'S WING IN STONE: the arm up from the shoulder to the WRIST, three fingers FANNING from the wrist - up-back, back,
     down-back - and the membrane between them scalloped toward the wrist. (The first pass ran the fingers from the wrist down to
     the body, so a raised wing was a tall slab.) `lift` raises the wrist; `spread` is how long the fingers are. */
  const wing = (g, x, y, lift, spread, far = false) => { const wx = x - spread * 0.45, wy = y - Math.max(-4, lift) * 0.5 - 4, col = far ? GG.sd : GG.s, bone = far ? GG.sD : GG.S;   /* the wrist goes up AND BACK */
    const th0 = lift > 12 ? -0.72 * Math.PI : lift < 0 ? -0.95 * Math.PI : -0.8 * Math.PI, tips = [0, 1, 2].map(k => { const th = th0 - k * 0.24 * Math.PI, len = spread * (0.85 - k * 0.12); return [wx + Math.cos(th) * len, wy + Math.sin(th) * len]; });   /* the fingers sweep behind: a sail, not a column */
    const pull = (a, b) => [(a[0] + b[0]) / 2 + (wx - (a[0] + b[0]) / 2) * 0.35, (a[1] + b[1]) / 2 + (wy - (a[1] + b[1]) / 2) * 0.35];   // the scallop, drawn in toward the wrist
    fillPoly(g, [[x, y - 2], [wx, wy], tips[0], pull(tips[0], tips[1]), tips[1], pull(tips[1], tips[2]), tips[2], [x - 3, y + 6]], col);
    thick(g, x, y - 1, wx, wy, bone, 2); for (const t of tips) line(g, wx, wy, t[0], t[1], bone); px(g, wx, wy - 1, GG.claw); px(g, wx + 1, wy - 2, GG.claw); };
  const body = (g, x, y, crouch = 0, head = 0) => {
    ellipse(g, x, y, 11, 9 - crouch, GG.s); ellipse(g, x - 2, y - 3, 8, 5, GG.S);                                        // the hunched torso
    rect(g, x + 2, y - 10, 10, 3, GG.iron); rect(g, x + 2, y - 10, 10, 1, GG.ironL); line(g, x + 3, y - 8, x - 4, y - 2, GG.iron);   // the collar and its broken chain
    const hx = x + 11, hy = y - 12 - head * 3;
    ellipse(g, hx, hy, 7, 6, GG.s); ellipse(g, hx - 1, hy - 2, 5, 3, GG.S);
    for (const [ox, len] of [[-3, 11], [1, 9]]) { let hx0 = hx + ox, hy0 = hy - 4; for (let k = 0; k < len; k++) { const a = -Math.PI / 2 - 0.9 - k * 0.09; hx0 += Math.cos(a) * 1.1; hy0 += Math.sin(a) * 1.1; ellipse(g, hx0, hy0, 1.6 - k * 0.1, 1.6 - k * 0.1, k % 3 ? GG.sd : GG.sD); } }
    rect(g, hx - 3, hy - 4, 9, 2, GG.sD);
    fillPoly(g, [[hx + 3, hy - 2], [hx + 12, hy + 1 - head * 2], [hx + 11, hy + 4 - head], [hx + 3, hy + 4]], GG.S); px(g, hx + 11, hy + 1 - head * 2, GG.sD);
    line(g, hx + 4, hy + 4, hx + 10, hy + 4 - head, GG.sD); for (const fx of [5, 8]) { px(g, hx + fx, hy + 5 - head * 0.5, '#e8e4d8'); px(g, hx + fx, hy + 6 - head * 0.5, '#e8e4d8'); }
    rect(g, hx + 1, hy - 2, 3, 2, GG.sD); px(g, hx + 2, hy - 2, GG.witch); px(g, hx + 3, hy - 2, GG.witchL);
    for (let k = 0; k < 5; k++) px(g, x - 8 + k * 4, y + 2 + (k % 2) * 2, k % 2 ? GG.moss : GG.mossL);                      // moss in the cracks
    line(g, x - 3, y - 6, x + 1, y + 1, GG.sD);                                                                          // a crack across the chest
    return [hx, hy]; };
  const legs = (g, x, y, reach = 0) => { for (const dx of [-6, 5]) { thick(g, x + dx, y + 4, x + dx + 1 + reach, y + 11, GG.sd, 3); for (let t = 0; t < 3; t++) line(g, x + dx + reach + t * 2 - 1, y + 12, x + dx + reach + t * 2, y + 14, GG.claw); } };
  const F = frames(W, H, 11, (g, f) => {
    const floor = H - 3, y = floor - 16;
    if (f === 0) { rect(g, cx - 16, floor - 2, 32, 3, GG.slabD); rect(g, cx - 16, floor - 3, 32, 1, GG.slabL);   // PERCHED on the gate's ledge, wings folded like a cloak
      wing(g, cx - 2, y - 2, -4, 12, true); legs(g, cx, y - 1); body(g, cx, y, 2); wing(g, cx, y, -6, 10); return; }
    if (f === 10) { // HANGING - THE OPENING: smashed through a cracked slab, clinging by the claws to the broken edge
      const ey = 14; rect(g, cx - 30, ey, 26, 6, GG.slab); rect(g, cx - 30, ey, 26, 1, GG.slabL); for (let k = 0; k < 4; k++) line(g, cx - 6 - k, ey + k * 2, cx - 2 + k, ey + 6, GG.slabD);   // the broken slab
      for (let t = 0; t < 4; t++) line(g, cx - 8 + t * 2, ey - 1, cx - 6 + t * 2, ey + 3, GG.claw);
      thick(g, cx - 6, ey + 2, cx - 2, ey + 14, GG.sd, 3); body(g, cx + 2, ey + 24, 0, -2); wing(g, cx, ey + 22, -18, 14, true); wing(g, cx + 2, ey + 24, -20, 16);   // dangling, wings limp
      for (let k = 0; k < 6; k++) px(g, cx - 12 + k * 4, ey + 34 + (k % 3) * 3, GG.slabD); return; }                                                    // grit falling
    const lift = [0, 0, 22, -8, 30, 4, 26, 0, 0, 20][f] ?? 0, spread = [0, 0, 26, 24, 30, 16, 30, 20, 20, 26][f] ?? 22;
    if (f === 4) { // DIVE: plummeting, wings swept back, claws first
      wing(g, cx + 6, y - 14, 18, 14, true); body(g, cx, y - 4, 0, -2); wing(g, cx + 8, y - 12, 22, 16); legs(g, cx + 2, y + 2, 3); return; }
    wing(g, cx - 2, y - 4, lift + 4, spread, true);
    legs(g, cx, y, f === 3 ? -1 : 0);
    const [hx, hy] = body(g, cx, y, 0, f === 7 ? 2 : f === 9 ? 3 : 0);
    wing(g, cx, y - 2, lift, spread);
    if (f === 7) { ellipse(g, hx + 7, hy, 2.5, 2.5, GG.witch); px(g, hx + 7, hy, GG.witchL); }                                   // SPIT TELL: head back, the throat lit
    if (f === 8) for (const [dx, dy] of [[18, -6], [24, 0], [20, 6]]) { rect(g, hx + dx, hy + dy, 4, 4, GG.sd); px(g, hx + dx, hy + dy, GG.S); }   // SPIT: three chunks of masonry
    if (f === 9) { fillPoly(g, [[hx + 4, hy - 1], [hx + 12, hy - 7], [hx + 12, hy + 3]], GG.sD); for (let k = 0; k < 3; k++) line(g, hx + 14 + k * 3, hy - 6 - k * 2, hx + 16 + k * 3, hy - 9 - k * 2, GG.witch); }   // SHRIEK
    if (f === 5) for (let k = 0; k < 3; k++) px(g, cx + 20 + k * 4, y - 20 + k * 3, GG.witchL);                                // GUST TELL: the air gathering
    if (f === 6) for (let k = 0; k < 6; k++) line(g, cx + 16, y - 16 + k * 5, cx + 34, y - 18 + k * 5, GG.slabL);                // GUST: the blast
  }, true);
  return pack(F, cx, H, 30, 30);
}
