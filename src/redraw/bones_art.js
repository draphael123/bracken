// bones_art.js - THE SKELETON SET (claude/foesart): SOLDIER, ARCHER, MAGE. Real art at the house bar: one human-size skeleton (hit box 10x20) in three kits' silhouettes, built from the shared form shader in beasts_art.js
// (taper capsules lit from above-front, cool-shadow / warm-light ramp, dither, two-bone IK for the limbs). A NEW act-IV look, not the desert tomb guard's: grave-brown bone with a bright lit edge, rusted mail, a green ember in the sockets.
// THE READ AGAINST DARK BACKDROPS (foestills note 3): the bone is the LIGHTEST thing in a haunted wood, every sprite gets a lit rim on its top and front edges, each kit carries a coloured cloth or shape of its own
// (the soldier a red tabard and a rimmed shield, the archer a hooded scarf and a pale bow, the mage a pale teal robe with a lit hem and a glowing orb), and the limbs are two bones thick, not one.
// The contract hornsman_art.js keeps: faces RIGHT (L is the flip), shared canvas, ax the centre column, ay the row under the lowest pixel, w/h the hit box.
// Frames (src/bones.js BONE_FRAMES): 0-1 idle | 2-5 walk | 6 hurt | 7 collapse heap, then
//   SOLDIER (13): 8 thrust tell (sword drawn back over the shield rim) | 9 thrust | 10 rush tell (shield set low, foot scrape) | 11 rush | 12 parried (shield arm wide)
//   ARCHER  (12): 8 aim tell (full draw) | 9 loose | 10 volley tell (bow raised high) | 11 volley
//   MAGE    (14): 8 wisp tell (skull-orb forms) | 9 cast | 10 grave tell (kneels, palm to the floor) | 11 grave | 12 blink out | 13 blink in
import { px, rect, fillPoly, line } from '../px.js';
import { pack, frames, taper, ik, ramp, tufts, rimlight } from './beasts_art.js';

export const SC = { bone: '#d8cca8', socket: '#0e0b10', ember: '#9bf07a', mail: '#8a8478', rust: '#a8602e', iron: '#b4bac6', wood: '#8a5e34', robe: '#5f8a86', cloth: '#b04a3a', string: '#efe9d2', orb: '#9ff0c0', orbL: '#e6fff4' };
const BONE = ramp(SC.bone, '#2b2540', '#fffaf0'), BONE_F = ramp('#a89a7c', '#201a34', '#e8dcbc'), MAIL = ramp(SC.mail, '#2a2538', '#e8e4d8'), RUST = ramp(SC.rust, '#2a1a24', '#f0b070'), IRON = ramp(SC.iron, '#2a3048', '#ffffff'), WOOD = ramp(SC.wood, '#2a1a20', '#f0cc90'),
  ROBE = ramp(SC.robe, '#16222a', '#d8fff0'), CLOTH = ramp(SC.cloth, '#2a1020', '#ffb08a'), GRAVE = ramp('#6a543a', '#1c1424', '#c8a878');
const LIT = '#fff8e0';

/* the skeleton, facing right. o: { dy: body lowered, lean: chest shifts forward, feet: [[x,lift] far, near] off the hip, armF/armB: the hand [x,y] (absolute), skull: {dx,dy}, jaw, hunch } */
function skeleton(g, o) {
  const dy = o.dy || 0, lean = o.lean || 0, gy = 28, cx = 14, pel = [cx - lean * 0.2, 18.5 + dy], cht = [cx + lean * 0.6, 11.6 + dy + (o.hunch || 0)], sk = [cx + 1.6 + lean + ((o.skull && o.skull.dx) || 0), 6 + dy + (o.hunch || 0) * 1.2 + ((o.skull && o.skull.dy) || 0)];
  const feet = o.feet || [[-1.5, 0], [2, 0]];
  const leg = (i) => { const far = i === 0, f = feet[i], hip = [pel[0] + (far ? -0.4 : 0.6), pel[1] + 1.2], ex = hip[0] + f[0], ey = gy - f[1] + (o.legDy || 0), [kx, ky] = ik(hip[0], hip[1], ex, ey, 5.2, 5.4, -0.9), R = far ? BONE_F : BONE;
    taper(g, hip[0], hip[1], 1.5, kx, ky, 1.25, R, { seed: 41 + i, noise: 0.08 }); taper(g, kx, ky, 1.25, ex, ey - 0.8, 1.05, R, { seed: 43 + i, noise: 0.08 }); px(g, kx, ky, LIT);
    rect(g, ex - 1, ey - 1, 4, 2, far ? '#a89a7c' : SC.bone); px(g, ex + 3, ey - 1, '#a89a7c'); };
  leg(0);
  if (o.cape) fillPoly(g, o.cape(pel, cht), CLOTH[1]);
  const arm = (a, far) => { if (!a) return; const sh = [cht[0] + (far ? -1.4 : 1.2), cht[1] - 2.6], [ex, ey, hx, hy] = ik(sh[0], sh[1], a[0], a[1], 4.8, 4.9, far ? 0.7 : -0.7), R = far ? BONE_F : BONE;
    taper(g, sh[0], sh[1], 1.3, ex, ey, 1.1, R, { seed: 51 + (far ? 1 : 0), noise: 0.08 }); taper(g, ex, ey, 1.1, hx, hy, 0.95, R, { seed: 53, noise: 0.08 }); px(g, ex, ey, LIT); rect(g, hx - 1, hy - 1, 2, 2, far ? '#a89a7c' : SC.bone); };
  arm(o.armB, 1);
  /* pelvis, spine, ribcage */
  taper(g, pel[0] - 0.4, pel[1], 3.1, pel[0] + 0.6, pel[1] + 0.4, 2.7, BONE, { seed: 61, noise: 0.1 });
  taper(g, pel[0], pel[1] - 1, 0.95, cht[0], cht[1] + 1, 1, BONE_F, { seed: 62, noise: 0 });
  taper(g, cht[0] - 0.5, cht[1] + 0.3, 4.3, cht[0] + 0.7, cht[1] - 1.2, 3.8, BONE, { seed: 63, noise: 0.1 });
  for (let i = 0; i < 3; i++) { const y = Math.round(cht[1] - 1.3 + i * 2), x = Math.round(cht[0] - 3.5 + lean * 0.1); rect(g, x, y, 8, 1, '#3a3050'); }   // the gaps between the ribs
  for (let i = 0; i < 4; i++) px(g, cht[0] - 2.4 + i * 1.8, cht[1] - 3, LIT);
  /* the rusted mail scrap over the near shoulder and a hung strap */
  if (o.mail !== false) { rect(g, cht[0] - 4.5, cht[1] - 4.5, 9, 3, MAIL[2]); rect(g, cht[0] - 4.5, cht[1] - 4.5, 9, 1, MAIL[4]); rect(g, cht[0] - 4.5, cht[1] - 2.5, 9, 1, MAIL[0]); px(g, cht[0] - 2, cht[1] - 3.5, RUST[3]); px(g, cht[0] + 2, cht[1] - 3.5, RUST[2]); px(g, cht[0] - 3, cht[1] - 1.5, RUST[1]); }
  leg(1);
  /* the skull: big and bright, dark sockets with a green ember, nose hole, teeth, the jaw (open for a shout) */
  taper(g, sk[0], sk[1], 4.4, sk[0] + 0.6, sk[1] + 0.8, 4.1, BONE, { seed: 71, noise: 0.06, gain: 1.2 });
  rect(g, sk[0] - 2.5, sk[1] + 2.8, 6, 2, SC.bone); rect(g, sk[0] - 2.5, sk[1] + 3.9, 6, 1, BONE[1]);
  const jw = o.jaw || 0; if (jw) { rect(g, sk[0] - 2, sk[1] + 4, 5, 1 + jw, SC.socket); taper(g, sk[0] - 1, sk[1] + 5 + jw, 1.1, sk[0] + 2.5, sk[1] + 5.4 + jw, 1.2, BONE_F, { noise: 0 }); } else rect(g, sk[0] - 2, sk[1] + 4.5, 5, 1, BONE[1]);
  rect(g, sk[0] + 0.3, sk[1] - 0.6, 2.4, 2.4, SC.socket); rect(g, sk[0] + 3.2, sk[1] + 0.2, 1, 1.4, SC.socket); px(g, sk[0] + 1.6, sk[1] + 0.6, SC.ember); px(g, sk[0] + 2.6, sk[1] + 0.6, SC.ember);
  px(g, sk[0] + 3.4, sk[1] + 2.6, SC.socket); for (let i = 0; i < 4; i++) px(g, sk[0] - 1.5 + i * 1.4, sk[1] + 4.1, i % 2 ? '#8a7c5e' : LIT);
  arm(o.armF, 0);
  return { pel, cht, sk, gy };
}
function heap(g) {   // the collapse: a skull, the ribcage fallen apart, long bones across it, the scrap of mail
  const gy = 28; taper(g, 17.5, gy - 3.2, 3.6, 18.2, gy - 2.8, 3.4, BONE, { seed: 81 }); rect(g, 15.5, gy - 3.8, 2, 2, SC.socket); px(g, 16.2, gy - 3.2, SC.ember);
  for (let i = 0; i < 5; i++) { taper(g, 6 + i * 2.6, gy - 2.2 - (i % 2), 1.2, 8.6 + i * 2.6, gy - 1.4, 1, i % 2 ? BONE_F : BONE, { seed: 82 + i, noise: 0.08 }); }
  taper(g, 5, gy - 0.6, 0.9, 16, gy - 2.4, 0.9, BONE, { noise: 0 }); taper(g, 9, gy - 0.8, 0.9, 22, gy - 0.6, 0.9, BONE_F, { noise: 0 }); rect(g, 4, gy - 3, 5, 3, MAIL[2]); rect(g, 4, gy - 3, 5, 1, MAIL[4]); px(g, 6, gy - 2, RUST[3]);
  rect(g, 21, gy - 1.6, 4, 2, SC.bone);
}
const finish = (c, seed) => { tufts(c, LIT, seed, 0.08, 1, 0, 0); rimlight(c, LIT, 1, seed + 3, 0.75); };

/* props */
const shield = (g, x, y, r, tilt = 0) => {   // a round board shield: dark wood, a bright iron rim, a boss, a hacked edge
  for (let a = 0; a < 40; a++) { const t = a / 40 * Math.PI * 2; px(g, x + Math.cos(t) * (r + 0.4), y + Math.sin(t) * (r * 1.12 + 0.4), a % 3 ? IRON[3] : IRON[4]); }
  taper(g, x, y - r * 0.2, r, x, y + r * 0.2, r, WOOD, { seed: 91, noise: 0.16, ly: -0.5 }); rect(g, x - r, y - 0.4, r * 2, 1, WOOD[0]); rect(g, x - 0.5, y - r, 1, r * 2, WOOD[1]);
  taper(g, x, y, 1.8, x, y, 1.8, IRON, { noise: 0 }); px(g, x - 0.5, y - 0.8, '#ffffff'); px(g, x + r - 1, y - r * 0.5, SC.socket); };
const sword = (g, x, y, ex, ey) => { line(g, x, y, ex, ey, IRON[1], 2); line(g, x, y - 0.5, ex, ey - 0.5, IRON[4], 1); px(g, ex, ey, '#ffffff'); const gd = [x + (ey - y) * 0.12, y - (ex - x) * 0.12]; rect(g, x - 1.5, y - 1.5, 3, 3, RUST[2]); px(g, gd[0], gd[1], RUST[3]); };
const bowArc = (g, x, y, h, draw, col = WOOD) => {   // a pale recurve with a taut string
  for (let i = 0; i <= h; i++) { const d = Math.round(Math.sin(i / h * Math.PI) * 3.4); px(g, x + d, y - h / 2 + i, col[i % 2 ? 3 : 2]); px(g, x + d - 1, y - h / 2 + i, col[0]); }
  px(g, x, y - h / 2, SC.string); px(g, x, y + h / 2, SC.string); line(g, x, y - h / 2, x - draw, y, SC.string, 1); line(g, x - draw, y, x, y + h / 2, SC.string, 1); };

export function bakeSkelSoldier() {
  const W = 34, H = 34;
  const F = frames(W, H, 13, (g, f, c) => {
    const walk = f >= 2 && f <= 5, ph = (f - 2) / 4, st = walk ? [[Math.sin(ph * 6.283) * 3.2, Math.max(0, Math.cos(ph * 6.283)) * 2.2], [Math.sin((ph + 0.5) * 6.283) * 3.2, Math.max(0, Math.cos((ph + 0.5) * 6.283)) * 2.2]] : null;
    let o = { feet: st || [[-1.5, 0], [2.5, 0]], armF: [20, 17], armB: [10, 17], lean: 0.5, dy: f === 1 ? 0.4 : 0 }, sh = [19, 17, 5.3], sw = null;
    if (f === 6) { o = { ...o, lean: -2.5, hunch: 1, skull: { dx: -2, dy: 1 }, armF: [15, 19], armB: [9, 16] }; sh = [14, 19, 4.8]; sw = [[10, 15], [5, 22]]; }                              // hurt
    else if (f === 7) { heap(g); finish(c, 5); return; }
    else if (f === 8) { o = { ...o, lean: -1.2, armF: [9, 7], armB: [21, 15], feet: [[-3, 0], [4, 0]] }; sh = [22, 16, 5.8]; sw = [[9, 7], [3, 1]]; }                                                 // thrust TELL: shield forward and high, the blade drawn way back over the shoulder
    else if (f === 9) { o = { ...o, lean: 3, armF: [26, 14], armB: [17, 16], feet: [[-5, 0], [6, 0]] }; sh = [14, 16, 5]; sw = [[26, 14], [34, 12]]; }                                                           // thrust: the lunge, the blade full forward
    else if (f === 10) { o = { ...o, dy: 5, lean: 3.5, hunch: 1.5, armF: [9, 22], armB: [21, 24], feet: [[-4, 0], [4, 0]], skull: { dx: 1.5, dy: 0.5 } }; sh = [23, 24, 6.4]; }                           // rush TELL: crouched low behind the shield, set like a ram, a foot scraping
    else if (f === 11) { o = { ...o, dy: 4, lean: 4.5, hunch: 1.5, armF: [9, 22], armB: [22, 22], feet: [[-6, 1.5], [3, 0]], skull: { dx: 2, dy: 0.5 } }; sh = [25, 22, 6.4]; }                           // rush: all weight behind the boards
    else if (f === 12) { o = { ...o, lean: -3.5, hunch: 0.5, armF: [10, 10], armB: [27, 4], feet: [[-4, 0], [3, 0]], jaw: 1 }; sh = [29, 5, 5.2]; sw = [[10, 10], [5, 18]]; }                       // PARRIED: the shield arm thrown wide and high, the chest bare, the sword limp
    skeleton(g, o);
    if (sw) sword(g, sw[0][0], sw[0][1], sw[1][0], sw[1][1]);
    // a red tabard over the ribs hangs from the mail: a colour that is not bone, so the figure reads on the dark wood
    if (f !== 10 && f !== 11) { fillPoly(g, [[11, 16], [18, 16], [18.5, 25], [16, 24], [14, 26], [11.5, 24]], CLOTH[2]); rect(g, 11, 16, 7, 1, CLOTH[4]); px(g, 15, 22, CLOTH[1]); }
    shield(g, sh[0], sh[1], sh[2]);
    finish(c, 9);
  });
  return pack(F, 14, H - 1, 10, 20);
}

export function bakeSkelArcher() {
  const W = 36, H = 34;
  const F = frames(W, H, 12, (g, f, c) => {
    const walk = f >= 2 && f <= 5, ph = (f - 2) / 4, st = walk ? [[Math.sin(ph * 6.283) * 3, Math.max(0, Math.cos(ph * 6.283)) * 2.2], [Math.sin((ph + 0.5) * 6.283) * 3, Math.max(0, Math.cos((ph + 0.5) * 6.283)) * 2.2]] : null;
    let o = { feet: st || [[-1.5, 0], [2, 0]], armF: [19, 15], armB: [11, 17], lean: 0, dy: f === 1 ? 0.4 : 0 }, bow = [20, 15, 14, 0];
    if (f === 6) { o = { ...o, lean: -2.5, hunch: 1, skull: { dx: -2, dy: 1 }, armF: [14, 19], armB: [9, 16] }; bow = [13, 20, 13, 0]; }
    else if (f === 7) { heap(g); finish(c, 7); return; }
    else if (f === 8) { o = { ...o, lean: 0.5, armF: [26, 11], armB: [10, 11], feet: [[-3.5, 0], [4.5, 0]] }; bow = [27, 11, 15, 8]; }                                    // AIM TELL: full draw, the arrow level, a glint on the head
    else if (f === 9) { o = { ...o, lean: -0.5, armF: [26, 11], armB: [14, 12], feet: [[-3.5, 0], [4.5, 0]] }; bow = [27, 11, 15, 0]; }                                  // loose: the string snapped back
    else if (f === 10) { o = { ...o, lean: -2, hunch: -0.5, armF: [22, 0], armB: [11, 5], feet: [[-3, 0], [3.5, 0]], skull: { dx: 0, dy: -1 } }; bow = [22, 2, 13, 6]; }       // VOLLEY TELL: the bow flung high, hauled back at a steep angle
    else if (f === 11) { o = { ...o, lean: -3, hunch: -0.5, armF: [22, 0], armB: [13, 4], feet: [[-3.5, 0], [3.5, 0]] }; bow = [22, 2, 13, 0]; }
    skeleton(g, o);
    // a scarf of rust-red cloth at the neck, and the quiver on the back with its fletching: colour and shape that are not bone
    fillPoly(g, [[10, 9.5], [16, 9.5], [15.5, 12.5], [12, 14.5], [8.5, 12.5 + (f === 8 ? 0 : 2)]], CLOTH[2]); rect(g, 10, 9.5, 6, 1, CLOTH[4]);
    taper(g, 7.5, 12, 2, 10.5, 22, 1.8, WOOD, { seed: 95 }); for (let i = 0; i < 3; i++) { px(g, 6.5 + i, 8.5 - (i % 2), '#e8e0c8'); px(g, 8 + i, 9.5 - (i % 2), CLOTH[3]); }
    bowArc(g, bow[0], bow[1], bow[2], bow[3]);
    if (f === 8) { line(g, 27, 11, 14, 11, SC.string, 1); rect(g, 29, 10, 3, 3, IRON[3]); px(g, 31, 11, '#ffffff'); px(g, 33, 9, '#ffffff'); px(g, 30, 8, '#ffffff'); px(g, 33, 13, '#ffffff'); }   // the nocked arrow and the head's glint
    else if (f === 9) { px(g, 29, 11, '#ffffff'); rect(g, 30, 11, 4, 1, IRON[4]); }
    else if (f === 10) { line(g, 22, 4, 13, 5, SC.string, 1); line(g, 22, 4, 24, -1, IRON[3], 1); }
    else if (f === 5 || f <= 1 || f === 6) { line(g, 20, 15, 20, 15, IRON[3], 1); }
    finish(c, 11);
  });
  return pack(F, 14, H - 1, 10, 20);
}

export function bakeSkelMage() {
  const W = 36, H = 36;
  const F = frames(W, H, 14, (g, f, c) => {
    const walk = f >= 2 && f <= 5, ph = (f - 2) / 4, st = walk ? [[Math.sin(ph * 6.283) * 2.2, Math.max(0, Math.cos(ph * 6.283)) * 1.6], [Math.sin((ph + 0.5) * 6.283) * 2.2, Math.max(0, Math.cos((ph + 0.5) * 6.283)) * 1.6]] : null;
    let o = { feet: st || [[-1.5, 0], [2, 0]], armF: [20, 15], armB: [10, 16], lean: 0.3, dy: f === 1 ? 0.4 : 0, mail: false }, staff = [22, 17], orb = null, flash = false;
    if (f === 6) { o = { ...o, lean: -2.5, hunch: 1, skull: { dx: -2, dy: 1 }, armF: [15, 19], armB: [9, 15] }; staff = [17, 21]; }
    else if (f === 7) { heap(g); rect(g, 6, 26, 14, 2, ROBE[2]); rect(g, 6, 26, 14, 1, ROBE[4]); line(g, 24, 28, 12, 28, SC.bone, 1); finish(c, 13); return; }
    else if (f === 8) { o = { ...o, lean: -1, armF: [20, 4], armB: [9, 13], feet: [[-2.5, 0], [3, 0]] }; staff = [20, 6]; orb = [24, 4, 4]; }                                                  // WISP TELL: the staff thrust up, a skull-orb forming over it
    else if (f === 9) { o = { ...o, lean: 2, armF: [25, 12], armB: [8, 14], feet: [[-3.5, 0], [4.5, 0]] }; staff = [25, 12]; orb = [31, 12, 2.5]; }                                      // cast: the wisp leaving the staff
    else if (f === 10) { o = { ...o, dy: 7, lean: 3.5, hunch: 1.5, armF: [22, 28], armB: [8, 22], feet: [[-5, 0], [4, 0]], legDy: 0, skull: { dx: 1.5, dy: 0.5 } }; staff = [10, 22]; }  // GRAVE TELL: kneeling, a palm flat to the floor, the staff held back
    else if (f === 11) { o = { ...o, dy: 7, lean: 3.5, hunch: 1.5, armF: [24, 28], armB: [8, 22], feet: [[-5, 0], [4, 0]], skull: { dx: 1.5, dy: 0.5 } }; staff = [10, 22]; flash = true; }
    else if (f === 12) { o = { ...o, lean: 0, armF: [14, 7], armB: [6, 8], skull: { dx: 0, dy: -1 } }; staff = [20, 15]; }                                                                  // blink out
    else if (f === 13) { o = { ...o, lean: 0, armF: [19, 15], armB: [9, 14] }; staff = [22, 17]; }
    const top = 11 + (o.dy || 0);
    skeleton(g, o);
    // the robe: a pale teal over the ribs, a lit hem, drag at the foot; dark cloth reads poorly in the forest, so it is the lightest cloth of any foe
    const rb = [[8, top + 2], [20, top + 2], [21, 30 + (o.dy ? -o.dy + 1 : 0)], [18, 31 + (o.dy ? -o.dy + 1 : 0)], [14, 29.5 + (o.dy ? -o.dy + 1 : 0)], [10, 31 + (o.dy ? -o.dy + 1 : 0)], [6.5, 29.5 + (o.dy ? -o.dy + 1 : 0)]];
    fillPoly(g, rb, ROBE[2]); fillPoly(g, [[8, top + 2], [20, top + 2], [19, top + 4], [9, top + 4]], ROBE[3]);
    for (let i = 0; i < 4; i++) rect(g, 9 + i * 3, top + 5, 1, 17 - o.dy * 2.2, ROBE[1]);
    rect(g, 6.5, 29 - (o.dy || 0) * 0.9, 14, 1, '#d8fff0'); px(g, 9, 30, '#d8fff0'); px(g, 16, 30, '#d8fff0');
    // the femur staff: a skull lantern at its head
    line(g, staff[0], staff[1] + 11, staff[0], staff[1] - 1, SC.bone, 1); line(g, staff[0] + 1, staff[1] + 11, staff[0] + 1, staff[1] - 1, BONE_F[1], 1);
    taper(g, staff[0], staff[1] - 3.2, 2.5, staff[0], staff[1] - 3.2, 2.5, BONE, { noise: 0 }); rect(g, staff[0] - 1.5, staff[1] - 3.8, 1, 1.4, SC.socket); rect(g, staff[0] + 0.5, staff[1] - 3.8, 1, 1.4, SC.socket); px(g, staff[0] - 1, staff[1] - 3.4, SC.ember); px(g, staff[0] + 1, staff[1] - 3.4, SC.ember);
    if (orb) { const [ox, oy, r] = orb; for (let a = 0; a < 16; a++) { const t = a / 16 * 6.283; px(g, ox + Math.cos(t) * (r + 1.5), oy + Math.sin(t) * (r + 1.5), '#5fb890'); }
      taper(g, ox, oy, r, ox, oy, r, ramp(SC.orb, '#2a6a58', '#ffffff'), { noise: 0, ly: -0.6 }); px(g, ox - 0.5, oy - 0.8, SC.orbL); rect(g, ox - 1.5, oy - 0.6, 1, 1, SC.socket); rect(g, ox + 0.5, oy - 0.6, 1, 1, SC.socket); }
    if (flash) for (let i = 0; i < 6; i++) rect(g, 22 + i * 2.2, 27, 1, 2, i % 2 ? '#9bf07a' : '#e6fff4');
    if (f === 12) for (const [x, y] of [[4, 8], [22, 12], [5, 22], [21, 24], [12, 4], [26, 18]]) px(g, x, y, SC.ember);
    finish(c, 15);
  });
  return pack(F, 14, H - 1, 10, 20);
}
