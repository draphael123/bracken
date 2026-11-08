// src/redraw/gob_geomancer_art.js - THE GOBLIN GEOMANCER's sprite set and his stone (claude/gobgeo). DRAWING ONLY.
// px.js primitives only (no paths), so tools/gobgeo-sheet.mjs renders every frame in Node with no browser. The contract is the other foes': every frame faces
// RIGHT (L is the flip), one canvas size, ax = the body's centre column, ay = the row under the feet; the LAST frame is his hurt pose (main.js HAS_HURT).
// THE LOOK (the Frog King bar, scratch/lane-reports/frogking2b-poses.png): a dark outline, four- and five-tone ramps lit from the upper left, round volumes
// (the head, the hood, the geode, the robe's bell) shaded by their normal, not flat fills. He is the Queen's court: her PURPLE and GOLD robes and hood, a gold
// circlet on the hood, an old goblin's long nose and a wispy white beard with a gold bead; a STONE staff with a claw holding an AMETHYST GEODE; and the chunks
// of slate that float round him (drawn live by the hands: drawChunk). The hero Geomancer (earth browns, a stone fist) never wears purple.
// Frames (GGF): 0,1 idle | 2-5 walk | 6 rock told (staff up, a chunk over his head) | 7 the throw | 8 slate told (staff planted, crouched) | 9 the slate sweep |
//   10 shell told (hunched, arms in) | 11 shell burst (arms flung wide) | 12 stagger | 13 death (fallen) | 14 hurt
import { canvas, px, rect, line, circle, fillPoly, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

export const GGF = { idle: 0, walk: 2, rockTell: 6, rock: 7, slateTell: 8, slate: 9, shellTell: 10, shell: 11, stagger: 12, death: 13, hurt: 14 };
export const GG_FRAMES = 15;
/* the ramps: [deepest, dark, mid, light, highlight] */
export const GGC = {
  robe: ['#1e0c2e', '#3a1656', '#5a2a86', '#7e4ab4', '#a87ad8'],
  gold: ['#5e4010', '#9a7018', '#d0a630', '#f0d058', '#fff6c0'],
  skin: ['#22401a', '#3f6e2c', '#5f9a3a', '#86c450', '#bfe88a'],
  stone: ['#24242e', '#3e3e4c', '#5c5c6e', '#868698', '#b8b8c8'],
  gem: ['#2a0e48', '#5a2a9a', '#9a5ae0', '#d0a8ff', '#ffffff'],
  beard: ['#7a7a88', '#a8a8b8', '#d8d8e4', '#f4f4fa'],
  eye: '#ffb84a', eyeHi: '#fff2c0', mouth: '#2a0e18', glow: '#c99aff',
};
const C = GGC;
const W = 58, H = 60, CX = 25, G = 56;

/* ---------- shading helpers ---------- */
const LX = -0.62, LY = -0.78;   /* the light: from the upper left */
const pick = (ramp, k) => ramp[Math.max(0, Math.min(ramp.length - 1, k))];
/* a round volume: ellipse (cx, cy, rx, ry) lit by its normal; bias shifts the whole ramp (+ lighter) */
function ball(g, cx, cy, rx, ry, ramp, bias = 0) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry, d = nx * nx + ny * ny; if (d > 1) continue;
    const nz = Math.sqrt(Math.max(0, 1 - d)), l = -(nx * LX + ny * LY) * 0.75 + nz * 0.55 + bias;   /* lambert-ish, -0.8..1.3 */
    const rim = d > 0.82;
    px(g, x, y, pick(ramp, rim ? Math.min(1, Math.round(l * 2.2 + 1)) : Math.round(l * 2.4 + 1.4)));
  }
}
/* a bell (the robe): rows y0..y1, half width from w0 to w1 (eased), centre drifting by sway px at the hem; lit across the row, folds below `fold` */
function bell(g, cx, y0, y1, w0, w1, ramp, sway = 0, fold = 0.45) {
  for (let y = y0; y <= y1; y++) { const k = (y - y0) / Math.max(1, y1 - y0), hw = Math.round(w0 + (w1 - w0) * Math.pow(k, 0.8)), c0 = Math.round(cx + sway * k * k);
    for (let x = c0 - hw; x <= c0 + hw; x++) { const t = (x - (c0 - hw)) / Math.max(1, 2 * hw); let s = t < 0.16 ? 3 : t < 0.42 ? 2 : t < 0.78 ? 1 : 0;
      if (k < 0.12) s = Math.min(4, s + 1);   /* the shoulders catch the light */
      if (k > fold && ((x - c0 + 40) % 5 === 0) && t > 0.1 && t < 0.92) s = Math.max(0, s - 1);   /* the folds */
      if (k > fold && ((x - c0 + 41) % 5 === 0) && t < 0.5) s = Math.min(4, s + 1);
      px(g, x, y, ramp[s]); } }
}
/* a shaft (the staff): a thick line, lit on its upper-left edge */
function shaft(g, x0, y0, x1, y1, ramp) {
  const n = Math.max(1, Math.hypot(x1 - x0, y1 - y0)), ux = (x1 - x0) / n, uy = (y1 - y0) / n;
  let ox = Math.round(-uy), oy = Math.round(ux); if (ox * LX + oy * LY < 0) { ox = -ox; oy = -oy; }   /* the lit side */
  line(g, x0, y0, x1, y1, ramp[1], 3);
  line(g, x0 + ox, y0 + oy, x1 + ox, y1 + oy, ramp[3], 1);
  line(g, x0, y0, x1, y1, ramp[2], 1);
  for (let i = 5; i < n - 2; i += 7) px(g, Math.round(x0 + ux * i), Math.round(y0 + uy * i), ramp[0]);   /* the joints in the stone */
}
/* THE GEODE on the staff's head: a stone claw round an amethyst; glow 0..1 */
function geode(g, x, y, glow = 0, cracked = false) {
  for (const [dx, dy] of [[-3, 1], [3, 1], [-2, 3], [2, 3]]) { px(g, x + dx, y + dy, C.stone[1]); px(g, x + dx, y + dy - 1, C.stone[3]); }   /* the claw */
  ball(g, x, y - 1, 3, 3.5, C.gem, glow * 0.4);
  if (!cracked) { px(g, x - 1, y - 3, C.gem[4]); px(g, x, y - 2, C.gem[3]); } else { line(g, x - 2, y - 3, x + 1, y + 1, C.gem[0], 1); }
  if (glow > 0.3) { for (const [dx, dy] of [[0, -6], [-5, -2], [5, -2], [0, 4]]) px(g, x + dx, y + dy, C.glow); }
}
/* a floating chunk of slate (also drawn live round him by the hands) */
export function drawChunk(g, x, y, k = 0, glow = 0) {
  const X = Math.round(x), Y = Math.round(y), f = k & 3;
  const shape = [[[-2, -2, 5, 4]], [[-3, -1, 6, 3], [-1, -2, 3, 1]], [[-2, -2, 4, 5]], [[-2, -1, 5, 3], [0, -3, 2, 2]]][f];
  for (const [dx, dy, w, h] of shape) rect(g, X + dx, Y + dy, w, h, C.stone[2]);
  for (const [dx, dy, w] of shape) rect(g, X + dx, Y + dy, w, 1, C.stone[3]);
  px(g, X + shape[0][0], Y + shape[0][1], C.stone[4]);
  const [dx, dy, w, h] = shape[0]; rect(g, X + dx + w - 1, Y + dy + 1, 1, h - 1, C.stone[1]); rect(g, X + dx, Y + dy + h - 1, w, 1, C.stone[0]);
  px(g, X, Y, glow > 0.2 ? C.glow : C.gem[2]);   /* a rune scratched in it, lit when he calls on it */
}

/* ---------- THE FIGURE ---------- pose: { by, lean, crouch, sway, staff [hx, hy, tx, ty] (front hand, staff top, from CX/G), ba [dx, dy] (back hand from its shoulder),
   held (a chunk over his head: size), glow 0..1, eyes 'glow'|'wide'|'shut'|'swirl', mouth 'shut'|'open'|'grin'|'shout', hood 0|1 (1 = blown back a little), legs [a, b], fx(g) } */
function draw(g, p) {
  const by = p.by || 0, lean = p.lean || 0, cr = p.crouch || 0;
  const shY = G - 18 + cr + by, hemY = G - 1, hx = CX + 2 + lean, hy = G - 22 + cr + by;
  /* feet: goblin toes under the hem */
  const [la, lb] = p.legs || [0, 0];
  for (const [o, d] of [[lb - 3, 0], [la + 3, 1]]) { rect(g, CX + o - 1, G - 2, 4, 2, C.skin[d ? 2 : 1]); px(g, CX + o + 2, G - 2, C.skin[d ? 3 : 2]); px(g, CX + o - 1, G - 1, C.skin[0]); }
  /* the back arm (behind the robe) */
  const bsh = [CX - 3 + lean, shY + 3], ba = p.ba || [-4, 7], bhx = bsh[0] + ba[0], bhy = bsh[1] + ba[1];
  line(g, bsh[0], bsh[1], bhx, bhy, C.robe[1], 3); circle(g, bhx, bhy, 1.6, C.skin[2]); px(g, bhx - 1, bhy - 1, C.skin[3]);
  if ((p.glow || 0) > 0.3 && p.handGlow) { for (const [dx, dy] of [[0, -3], [-3, 0], [3, 0], [0, 3]]) px(g, bhx + dx, bhy + dy, C.glow); }
  /* THE ROBE: a purple bell, a gold hem, a gold stole down the front with the Queen's marks, the gold mantle on the shoulders */
  bell(g, CX + lean * 0.6, shY, hemY - (p.sitting ? 0 : 0), 4, 9 + (p.flare || 0), C.robe, p.sway || 0);
  const sw = p.sway || 0;
  for (let x = -10; x <= 10; x++) { const xx = Math.round(CX + lean * 0.6 + sw + x); const k = Math.abs(x) <= 9 + (p.flare || 0) ? 1 : 0; if (!k) continue; px(g, xx, hemY - 1, C.gold[x < -3 ? 3 : x < 4 ? 2 : 1]); px(g, xx, hemY, C.gold[1]); }
  for (let y = shY + 3; y <= hemY - 2; y++) { const k = (y - shY) / (hemY - shY), x = Math.round(CX + 1 + lean * 0.6 + sw * k * k); px(g, x, y, C.gold[2]); px(g, x + 1, y, C.gold[1]); if ((y - shY) % 5 === 2) { px(g, x, y, C.gold[4]); px(g, x + 1, y, C.robe[0]); } }
  ball(g, CX + lean * 0.7, shY + 1, 5.5, 2.2, C.gold, 0.1);                                                     // the mantle
  px(g, CX + 1 + lean, shY + 2, C.gem[2]); px(g, CX + 1 + lean, shY + 1, C.gem[4]);                           // its clasp: an amethyst
  /* THE HEAD in THE HOOD: the cowl behind, the face, the ears through slits, the nose, the beard, the circlet */
  /* the hood's cowl behind his head, its point hanging down his back */
  for (let i = 0; i < 9; i++) { const x = hx - 8 - Math.round(i * 0.45), y = hy + 2 + i; rect(g, x - 1, y, 3, 1, C.robe[i < 3 ? 2 : 1]); px(g, x + 1, y, C.robe[0]); }   /* the hood's point, down his back */
  ball(g, hx - 2, hy - 1, 7.5, 7.5, C.robe, 0.12);
  /* THE FACE: big and round, lit from the left */
  ball(g, hx + 1, hy + 1, 6, 5.5, C.skin, 0.05);
  /* THE EAR, a long goblin leaf out of the hood's slit, swept back and up */
  { const ear = p.hood ? -3 : 0, tx = hx - 15, ty = hy - 6 + ear;
    fillPoly(g, [[hx - 4, hy - 3], [hx - 4, hy + 2], [tx, ty]], C.skin[2]);
    line(g, hx - 4, hy - 3, tx, ty, C.skin[4], 1); line(g, hx - 5, hy + 1, tx + 2, ty + 1, C.skin[1], 1); line(g, hx - 6, hy - 1, tx + 4, ty, C.skin[1], 1); px(g, tx, ty, C.skin[3]); }
  /* THE HOOD's opening: an arch over his face (low at the cheeks), edged in gold; the Queen's circlet across his brow */
  for (let x = hx - 6; x <= hx + 6; x++) { const u = (x - hx - 0.5) / 6.5, edge = Math.round(hy - 5 + u * u * 5);
    const top = Math.ceil(hy - 1 - 7.5 * Math.sqrt(Math.max(0, 1 - Math.pow((x + 0.5 - hx + 2) / 7.5, 2))));
    for (let y = top; y < edge; y++) px(g, x, y, C.robe[y < hy - 7 ? (u < 0 ? 3 : 2) : u < -0.3 ? 2 : 1]);
    px(g, x, edge, C.gold[u < -0.4 ? 4 : u < 0.3 ? 3 : 1]); }
  px(g, hx, hy - 6, C.gold[3]); px(g, hx + 1, hy - 7, C.gem[3]); px(g, hx + 1, hy - 6, C.gem[2]); px(g, hx + 2, hy - 6, C.gold[2]);
  /* the eyes: amber, deep under a heavy brow */
  const ex = hx + 2, ey = hy - 1, eyes = p.eyes || 'glow';
  line(g, ex - 4, ey - 1, ex + 3, ey - 1, C.skin[1], 1);
  if (eyes === 'shut') { line(g, ex - 3, ey + 1, ex - 1, ey + 1, C.skin[0], 1); line(g, ex + 1, ey + 1, ex + 3, ey + 1, C.skin[0], 1); }
  else if (eyes === 'swirl') { px(g, ex - 2, ey, C.eyeHi); px(g, ex - 3, ey + 1, C.eye); px(g, ex - 1, ey + 1, C.eye); px(g, ex + 2, ey, C.eyeHi); px(g, ex + 1, ey + 1, C.eye); px(g, ex + 3, ey + 1, C.eye); }
  else { const r = eyes === 'wide' ? 1 : 0; rect(g, ex - 3, ey - r, 2, 2 + r, C.eye); rect(g, ex + 1, ey - r, 2, 2 + r, C.eye); px(g, ex - 2, ey - r, C.eyeHi); px(g, ex + 2, ey - r, C.eyeHi); px(g, ex - 3, ey + 1, C.mouth); px(g, ex + 1, ey + 1, C.mouth);
    if (eyes === 'glow') { px(g, ex - 4, ey - 1, C.glow); px(g, ex + 3, ey - 1, C.glow); } }
  /* THE NOSE, long and hooked, over the beard */
  ball(g, hx + 7, hy + 2, 3, 2, C.skin, 0.1); px(g, hx + 9, hy + 3, C.skin[1]); px(g, hx + 10, hy + 4, C.skin[1]); px(g, hx + 9, hy + 4, C.skin[0]); px(g, hx + 6, hy + 1, C.skin[4]);
  /* a wart: an old goblin */
  px(g, hx - 1, hy + 3, C.skin[1]);
  /* the beard, wispy and white, with a gold bead; the mouth in it */
  const m = p.mouth || 'shut';
  for (let i = 0; i < 8; i++) { const bx = hx + 3 - Math.round(i * 0.5), byy = hy + 4 + i, w = i < 2 ? 4 : i < 5 ? 3 : i < 7 ? 2 : 1;
    for (let k = 0; k < w; k++) px(g, bx - k + 1, byy, C.beard[k === 0 ? (i < 3 ? 3 : 2) : k === w - 1 ? 0 : 1]); }
  px(g, hx, hy + 9, C.gold[4]); px(g, hx, hy + 10, C.gold[2]);
  if (m === 'open' || m === 'shout') { rect(g, hx + 2, hy + 5, m === 'shout' ? 4 : 3, m === 'shout' ? 3 : 2, C.mouth); px(g, hx + 3, hy + 5, C.beard[3]); }
  else if (m === 'grin') { line(g, hx + 1, hy + 5, hx + 5, hy + 5, C.mouth, 1); px(g, hx + 3, hy + 5, '#fff6e0'); px(g, hx + 5, hy + 4, C.mouth); }
  else line(g, hx + 2, hy + 5, hx + 5, hy + 5, C.mouth, 1);
  /* a chunk held over his head (the rock lob's tell) */
  if (p.held) { const r = p.held; ball(g, hx - 1 + (p.heldDx || 0), hy - 13 - r, r + 1.5, r + 0.5, C.stone, 0.2); px(g, hx - 1 + (p.heldDx || 0), hy - 13 - r, C.glow); px(g, hx - 3 + (p.heldDx || 0), hy - 14 - r, C.stone[4]);
    if ((p.glow || 0) > 0.3) for (const [dx, dy] of [[-6, 0], [6, -1], [0, -6], [-4, -5], [4, -5]]) px(g, hx - 1 + (p.heldDx || 0) + dx, hy - 13 - r + dy, C.glow); }
  /* the front arm and THE STAFF */
  const st = p.staff || [6, 4, 9, -26], fsh = [CX + 3 + lean, shY + 3], fhx = CX + st[0] + lean, fhy = shY + st[1];
  if (st) { const tx = CX + st[2] + lean, ty = G + st[3]; const ux = tx - fhx, uy = ty - fhy, n = Math.hypot(ux, uy) || 1, back = uy < 0 ? Math.min(10, (G - 1 - fhy) / (-uy / n)) : 10, bx = Math.round(fhx - ux / n * back), byy = Math.round(fhy - uy / n * back);   /* the butt of the staff stops at the floor */
    shaft(g, bx, byy, Math.round(tx), Math.round(ty), C.stone); geode(g, Math.round(tx + ux / n * 3), Math.round(ty + uy / n * 3), p.glow || 0, p.cracked); }
  line(g, fsh[0], fsh[1], fhx, fhy, C.robe[2], 3); px(g, fsh[0] - 1, fsh[1] - 1, C.robe[3]);                    // the sleeve
  rect(g, fhx - 2, fhy - 1, 3, 1, C.gold[2]);                                                                  // its gold cuff
  circle(g, fhx, fhy + 1, 1.6, C.skin[2]); px(g, fhx - 1, fhy, C.skin[3]);
  if (p.fx) p.fx(g);
}

/* the fallen body (death): his robe a heap on the stones, the hood off, the staff down and its geode dark */
function drawDead(g) {
  bell(g, CX + 2, G - 7, G - 1, 6, 13, C.robe, 2, 0.2);
  for (let x = -12; x <= 15; x++) px(g, CX + 2 + x, G - 1, C.gold[x < 0 ? 2 : 1]);
  ball(g, CX + 2, G - 7, 7, 2.5, C.gold, -0.1);
  ball(g, CX + 13, G - 4, 4.4, 3.6, C.skin, -0.1);                                 // the head, on the floor
  line(g, CX + 16, G - 3, CX + 20, G - 1, C.skin[2], 2);                           // the nose
  line(g, CX + 11, G - 7, CX + 6, G - 11, C.skin[2], 2);                           // an ear
  line(g, CX + 12, G - 4, CX + 14, G - 4, C.skin[0], 1); line(g, CX + 12, G - 3, CX + 13, G - 2, C.skin[0], 1);   // the eyes shut (an x)
  for (let i = 0; i < 4; i++) px(g, CX + 12 - i, G - 1, C.beard[2]);
  ball(g, CX - 9, G - 5, 5, 4, C.robe, -0.1);                                       // the hood, fallen off
  shaft(g, CX - 18, G - 2, CX + 9, G - 3, C.stone); geode(g, CX - 20, G - 3, 0, true);
  for (const [dx, dy, k] of [[-14, -2, 1], [16, -1, 2], [24, -2, 0]]) drawChunk(g, CX + dx, G + dy, k, 0);   // his stone, fallen with him
}

function pose(f) {
  switch (f) {
    case 0: return { staff: [9, 3, 13, -36], eyes: 'glow', legs: [0, 0] };
    case 1: return { by: 1, staff: [9, 4, 13, -35], eyes: 'glow', legs: [0, 0], sway: 1 };
    case 2: case 3: case 4: case 5: { const k = f - 2, s = [1, 0, -1, 0][k], b = [0, 1, 0, 1][k], sw = [-2, 1, 2, -1][k]; return { by: b, lean: 1, sway: sw, legs: [s * 3, -s * 3], staff: [9, 2 + b, 13 + s, -34 + b], ba: [-3 - s, 7] }; }
    case 6: return { by: -1, lean: -1, staff: [10, -4, 12, -44], ba: [-2, -10], held: 3, glow: 1, handGlow: 1, eyes: 'wide', mouth: 'open', sway: -2, hood: 1 };
    case 7: return { lean: 3, staff: [11, 1, 20, -30], ba: [4, -4], eyes: 'glow', mouth: 'shout', sway: 3, legs: [3, -2] };
    case 8: return { crouch: 3, lean: 1, staff: [10, 6, 12, -24], ba: [-6, 4], glow: 0.8, handGlow: 1, eyes: 'glow', mouth: 'grin', flare: 1,
      fx: g => { for (const [dx, h] of [[16, 5], [21, 7], [26, 4]]) { rect(g, CX + dx, G - h, 3, h, C.stone[2]); rect(g, CX + dx, G - h, 3, 1, C.stone[4]); rect(g, CX + dx + 2, G - h + 1, 1, h - 1, C.stone[1]); } } };
    case 9: return { lean: 4, staff: [12, 0, 25, -18], ba: [-6, -2], eyes: 'glow', mouth: 'shout', sway: 3, legs: [4, -3] };
    case 10: return { crouch: 2, lean: -1, staff: [8, 4, 11, -32], ba: [2, 3], glow: 0.7, eyes: 'shut', mouth: 'shut', flare: -1, sway: 0 };
    case 11: return { by: -1, lean: 0, staff: [11, -3, 18, -42], ba: [-9, -6], glow: 1, handGlow: 1, eyes: 'wide', mouth: 'shout', flare: 2, hood: 1,
      fx: g => { for (let a = 0; a < 8; a++) { const r = 16, x = CX + Math.round(Math.cos(a * Math.PI / 4) * r), y = G - 14 + Math.round(Math.sin(a * Math.PI / 4) * r * 0.75); px(g, x, y, C.glow); px(g, x + 1, y, C.stone[3]); } } };
    case 12: return { lean: -4, by: 1, staff: [5, 6, -4, -30], ba: [-7, -3], eyes: 'swirl', mouth: 'open', sway: -3, legs: [-3, 2], hood: 1,
      fx: g => { for (const [dx, dy] of [[-4, -44], [3, -46], [9, -43]]) { px(g, CX + dx, G + dy, '#fff6c0'); px(g, CX + dx - 1, G + dy + 1, '#ffd36b'); px(g, CX + dx + 1, G + dy + 1, '#ffd36b'); } } };
    case 14: return { lean: -3, by: 1, staff: [7, 5, 6, -33], ba: [-6, 0], eyes: 'shut', mouth: 'open', sway: -2, hood: 1 };
    default: return {};
  }
}

export function bakeGobGeomancer() {
  const F = Array.from({ length: GG_FRAMES }, (_, f) => { const [c, g] = canvas(W, H); if (f === GGF.death) drawDead(g); else draw(g, pose(f)); outline(c, OUT); return c; });
  return { R: F, L: F.map(c => flipX(c)), white: { R: F.map(c => whiten(c)), L: F.map(c => flipX(whiten(c))) }, ax: CX, ay: G, w: 12, h: 22 };
}

/* which frame a mode wears (src/gobgeo-hands.js frame). */
export function ggFrame(e) {
  const m = e.mode, a = e.anim || 0, moving = Math.abs(e.vx || 0) > 4;
  switch (m) {
    case 'rockTell': return GGF.rockTell;
    case 'slateTell': return GGF.slateTell;
    case 'shellTell': return GGF.shellTell;
    case 'release': return e.relMove === 'slateTell' ? GGF.slate : e.relMove === 'shellTell' ? GGF.shell : GGF.rock;
    case 'stagger': return GGF.stagger;
    default: return moving ? GGF.walk + (Math.floor(a * 8) & 3) : GGF.idle + (Math.floor(a * 1.6) & 1);
  }
}

// ---------------- HIS STONE IN FLIGHT ----------------
/* a lobbed rock: spinning; green-white once SENT BACK */
export function drawRock(g, x, y, time, back = false, id = 0) {
  const X = Math.round(x), Y = Math.round(y), k = (Math.floor(time * 12) + id) & 3;
  ball(g, X, Y, 4, 3.6, back ? ['#2a4a1a', '#4a8a2a', '#8fd160', '#c8f08a', '#ffffff'] : C.stone, 0.1);
  const rx = [[1, -1], [1, 1], [-1, 1], [-1, -1]][k]; px(g, X + rx[0], Y + rx[1], back ? '#ffffff' : C.glow);
  g.globalAlpha = 0.4; px(g, X - Math.sign(rx[0]) * 6, Y, back ? '#c8f08a' : C.glow); g.globalAlpha = 1;
}
/* a slate shard: a flat blade of stone, pointing the way it flies */
export function drawSlate(g, x, y, vx, vy, back = false) {
  const X = Math.round(x), Y = Math.round(y), d = Math.hypot(vx, vy) || 1, ux = vx / d, uy = vy / d;
  for (let i = -4; i <= 4; i++) { const c = i > 2 ? (back ? '#ffffff' : C.stone[4]) : i > -2 ? (back ? '#8fd160' : C.stone[3]) : (back ? '#4a8a2a' : C.stone[1]); px(g, Math.round(X + ux * i), Math.round(Y + uy * i), c); px(g, Math.round(X + ux * i - uy), Math.round(Y + uy * i + ux), back ? '#2a4a1a' : C.stone[0]); }
}
/* the shell burst: a ring of his chunks flying out, r px, k 0..1 of its life */
export function drawShell(g, x, y, r, k) {
  for (let a = 0; a < 6; a++) { const t = a * Math.PI / 3 + k; drawChunk(g, x + Math.cos(t) * r, y + Math.sin(t) * r * 0.7, a, 1); }
  g.globalAlpha = 0.5 * (1 - k); for (let a = 0; a < 24; a++) { const t = a * Math.PI / 12; px(g, Math.round(x + Math.cos(t) * (r + 3)), Math.round(y + Math.sin(t) * (r + 3) * 0.7), C.glow); } g.globalAlpha = 1;
}

// ---------------- THE ROOM'S STONE: THE SEALS A SENT-BACK ROCK BREAKS ----------------
/* THE GEODE SEAL on a barred gate: a cracked amethyst set in an iron lock plate; it pulses while whole. k 0..1 its shatter (1 = gone) */
export function drawSeal(g, x, y, time, k = 0) {
  const X = Math.round(x), Y = Math.round(y);
  if (k >= 1) { for (const [dx, dy] of [[-3, 4], [2, 5], [4, 3]]) px(g, X + dx, Y + dy, C.gem[1]); return; }
  rect(g, X - 6, Y - 7, 13, 14, '#2a2630'); rect(g, X - 6, Y - 7, 13, 1, '#6a6474'); rect(g, X - 6, Y + 6, 13, 1, '#151218');
  for (const [dx, dy] of [[-5, -6], [5, -6], [-5, 5], [5, 5]]) px(g, X + dx, Y + dy, '#9a94a4');   // its rivets
  const pul = 0.5 + 0.5 * Math.sin(time * 4);
  ball(g, X, Y, 4.2, 5, C.gem, 0.2 + pul * 0.3);
  line(g, X - 2, Y - 4, X + 1, Y, C.gem[0], 1); line(g, X + 1, Y, X - 1, Y + 4, C.gem[0], 1); line(g, X + 1, Y, X + 3, Y + 2, C.gem[0], 1);   // the crack: stone breaks it
  px(g, X - 2, Y - 3, C.gem[4]);
  g.globalAlpha = 0.25 + 0.25 * pul; for (const [dx, dy] of [[0, -9], [-8, 0], [8, 0], [0, 9]]) px(g, X + dx, Y + dy, C.glow); g.globalAlpha = 1;
}
/* THE OLD STONE (a secret): a few ashlars of the tower face with a hairline crack and a faint amethyst vein, w x h px, top-left (x, y) */
export function drawCrackedFace(g, x, y, w, h, time) {
  const X = Math.round(x), Y = Math.round(y);
  g.globalAlpha = 0.85; line(g, X + 3, Y + 2, X + 7, Y + h * 0.4, '#14121a', 1); line(g, X + 7, Y + h * 0.4, X + 4, Y + h * 0.7, '#14121a', 1); line(g, X + 7, Y + h * 0.4, X + w - 3, Y + h * 0.55, '#14121a', 1); line(g, X + 4, Y + h * 0.7, X + 8, Y + h - 2, '#14121a', 1); g.globalAlpha = 1;
  const k = 0.5 + 0.5 * Math.sin(time * 2.2); g.globalAlpha = 0.35 + 0.3 * k; px(g, X + 7, Y + Math.round(h * 0.4), C.gem[3]); px(g, X + 6, Y + Math.round(h * 0.4) + 1, C.gem[2]); px(g, X + 5, Y + Math.round(h * 0.7), C.gem[2]); g.globalAlpha = 1;
}

let SHEET = null;
export function sheet() { return SHEET || (SHEET = bakeGobGeomancer()); }
