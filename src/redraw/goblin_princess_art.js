// src/redraw/goblin_princess_art.js - THE GOBLIN PRINCESS's sprite set (claude/hc3art, over the greybox claude/highcrown3). DRAWING ONLY.
// px.js primitives only (no paths), so tools/hc3art-sheet.mjs renders every frame in Node with no browser. The contract is the other bosses': every frame faces RIGHT
// (L is the flip), one canvas size, ax = the body's centre column, ay = the row under the feet, w/h = the hit box (12 x 20, src/goblin-princess.js GP).
// She is a small green goblin in a pink gown with a gold tiara, a thin rapier, a feather-edged fan and a purse of gems; her mother's purple on the sash.
// Frames (GPF), the LAST one is her hurt pose (main.js HAS_HURT):
//   0,1 stand | 2-5 run | 6 lunge told (blade drawn back, glint) | 7 lunge | 8 flurry told (blade up) | 9,10 the pokes | 11 trinket told (hand in the purse) | 12 the toss
//   13 fan told | 14 fan gust | 15 hop told (crouch) | 16 hop (air) | 17 tiara told (it comes off her head) | 18 tiara thrown (no tiara) | 19 stomp told | 20 stomp
//   21,22 preen | 23 PINNED (cowering under the grate) | 24 STUNNED (conked, tiara over one eye) | 25 stagger | 26,27 bolt (flee) | 28 hide | 29 perch | 30 escape (MOTHER!)
//   31 defeat (sat down, crying) | 32 the chase's handbell | 33 hurt
import { canvas, px, rect, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

export const GPF = { stand: 0, stand2: 1, run: 2, lungeTell: 6, lunge: 7, flurryTell: 8, poke: 9, trinketTell: 11, trinket: 12, fanTell: 13, fan: 14, hopTell: 15, hop: 16, tiaraTell: 17, tiara: 18,
  stompTell: 19, stomp: 20, preen: 21, pinned: 23, stunned: 24, stagger: 25, bolt: 26, hide: 28, perch: 29, escape: 30, defeat: 31, bell: 32, hurt: 33 };
export const GP_FRAMES = 34;
export const GPC = { skin: '#6faa4a', skinL: '#8fd160', skinD: '#4a7a32', gown: '#c8508a', gownL: '#e8a0c8', gownD: '#8a2c5e', gold: '#e0c04a', goldL: '#fff6c8', goldD: '#a8841c',
  hair: '#2c1a3a', hairL: '#4a3060', purple: '#7a3aa0', shoe: '#f0d0e8', steel: '#c9d1dc', steelL: '#ffffff', fan: '#f0d0e8', fanD: '#c98ab0', gem: ['#ff4a6a', '#4ad0ff', '#7aff8a', '#ffd04a', '#c97aff'],
  eye: '#fff6c8', pupil: '#2a1020', blush: '#e86a8a', tear: '#9ad8ff' };
const C = GPC;
const W = 54, H = 46, CX = 24, G = 43;

/* pose: { by body bob (px, + is down), lean (px the head and shoulders go forward), crouch (px the hips drop), legs [a, b] foot offsets, skirt (px the hem flares: + back, - forward),
   fa [dx, dy] front hand, ba [dx, dy] back hand (from the shoulder), blade [dx0, dy0, dx1, dy1] from the front hand, fan 0|1|2 (closed / half / open) in the back hand, tiara 'on' | 'off' | 'crooked' | 'hand',
   eyes 'open' | 'shut' | 'angry' | 'wide' | 'spiral' | 'cry', mouth 'smile' | 'open' | 'pout' | 'shout' | 'wail' | 'grin', ears 0|1|2 (flat / up / drooped), purse, glint, tilt (head x lean), fx (g, ...) extra } */
function draw(g, p) {
  const by = p.by || 0, lean = p.lean || 0, crouch = p.crouch || 0, sk = p.skirt || 0, hipY = G - 15 + crouch + by, waistY = G - 21 + crouch + by, shY = waistY - 2 - (p.slump || 0);
  const hx = CX + lean + (p.tilt || 0), hy = G - 30 + crouch + by + (p.slump || 0) * 2 - (p.air || 0);
  /* legs: two thin green legs under the hem, pink slippers */
  const [la, lb] = p.legs || [0, 0];
  if (!p.sit) { for (const [off, sh] of [[lb, 0], [la, 1]]) { const fx = CX + off, ft = hipY + 4, fy = G - 1 - (sh ? (p.lift || 0) : 0); line(g, CX + (sh ? 2 : -2), ft, fx + (sh ? 1 : -1), fy - 2, C.skinD, 2); rect(g, fx - 2 + (sh ? 1 : -1), fy - 1, 5, 2, C.shoe); px(g, fx + 2 + (sh ? 1 : -1), fy - 2, C.gownL); } }
  /* the gown: a bodice, a bell skirt with a purple sash and a gold hem line */
  const hemY = p.sit ? G - 2 : hipY + 8, hw = 8 + (p.flare || 0);
  for (let y = waistY + 3; y <= hemY; y++) { const k = (y - waistY - 3) / Math.max(1, hemY - waistY - 3), half = Math.round(3 + k * hw), off = Math.round(k * sk);
    rect(g, CX - half + off, y, half * 2 + 1, 1, y >= hemY - 1 ? C.gold : k > 0.55 ? C.gownL : C.gown); rect(g, CX - half + off, y, 1, 1, C.gownD); rect(g, CX + half + off, y, 1, 1, C.gownD); }
  for (let k = 0; k < 4; k++) { const x = CX - 6 + k * 4 + Math.round(sk * 0.8); rect(g, x, hemY - 5, 1, 4, C.gownD); }                  // the folds
  rect(g, CX - 3 + lean, waistY, 7, 4, C.gownL); rect(g, CX - 3 + lean, waistY, 7, 1, C.gold); rect(g, CX - 3 + lean, waistY + 3, 7, 2, C.purple); px(g, CX + lean, waistY + 3, C.gold);   // bodice and the Queen's purple sash
  /* the back arm (behind: the fan hand), then the head, then the front arm (the blade hand) */
  const sh = [CX + lean + 2, shY + 2], bsh = [CX + lean - 3, shY + 2];
  const ba = p.ba || [-5, 5], fa = p.fa || [5, 6];
  line(g, bsh[0], bsh[1], bsh[0] + ba[0], bsh[1] + ba[1], C.skinD, 2);
  const bhx = bsh[0] + ba[0], bhy = bsh[1] + ba[1];
  if (p.fan !== undefined && p.fan !== null) { const o = p.fan, fl = o === 2 ? 11 : o === 1 ? 7 : 4;
    for (let i = 0; i < fl; i++) { const a = (-0.9 + (o === 0 ? 0.9 : i / Math.max(1, fl - 1) * 1.8 - 0.0)) * (p.fanDir || 1); const fx2 = bhx + Math.round(Math.cos(a - 1.2) * (4 + (o ? i * 0.3 : 0)) * (p.fanDir || 1) * 1), fy2 = bhy - 4 - i * (o ? 0.5 : 0.7) + (o ? Math.abs(i - fl / 2) * 0.4 : 0);
      px(g, bhx + (o === 0 ? 0 : (i - fl / 2) * 1.6 * (p.fanDir || 1)) + (p.fanDir || 1) * 2, bhy - 3 - (o === 0 ? i * 0.8 : 6 - Math.abs(i - fl / 2) * 0.9), i & 1 ? C.fan : C.fanD); void fx2; void fy2; }
    if (o) { rect(g, bhx + (p.fanDir || 1) * 2 - 4, bhy - 8, 9, 1, C.fan); rect(g, bhx + (p.fanDir || 1) * 2 - 3, bhy - 9, 7, 1, C.fanD); } else { line(g, bhx, bhy, bhx + 2, bhy - 7, C.fanD, 1); px(g, bhx + 2, bhy - 7, C.fan); }
    rect(g, bhx - 1, bhy - 1, 3, 3, C.gold); }
  circle(g, bhx, bhy, 2, C.skin);
  /* HEAD: a big round goblin head, long ears, a ponytail and a bun, the tiara */
  const eu = p.ears === 1 ? -3 : p.ears === 2 ? 3 : 0;
  line(g, hx - 4, hy - 1, hx - 12, hy - 4 + eu, C.skin, 2); line(g, hx - 12, hy - 4 + eu, hx - 13, hy - 5 + eu, C.skinL, 1); px(g, hx - 10, hy - 3 + eu, C.blush);          // the far ear
  circle(g, hx, hy, 6, C.skin); ellipse(g, hx + 1, hy - 1, 4, 3, C.skinL);
  rect(g, hx - 6, hy - 6, 13, 3, C.hair); rect(g, hx - 6, hy - 3, 3, 5, C.hair); px(g, hx - 5, hy - 5, C.hairL); px(g, hx - 2, hy - 6, C.hairL);
  line(g, hx - 6, hy - 1, hx - 10 - (p.fly || 0), hy + 6 + (p.air ? -3 : 0) + (p.crouch ? -1 : 0), C.hair, 2); px(g, hx - 10 - (p.fly || 0), hy + 6, C.hairL);                  // the ponytail
  circle(g, hx - 3, hy - 8, 2, C.hair); px(g, hx - 3, hy - 9, C.hairL); px(g, hx - 3, hy - 7, C.gold);                                                                              // the bun with a pin
  line(g, hx + 5, hy - 2, hx + 13, hy - 5 + eu, C.skin, 2); line(g, hx + 13, hy - 5 + eu, hx + 14, hy - 6 + eu, C.skinL, 1); px(g, hx + 11, hy - 4 + eu, C.blush);                  // the near ear
  const ey = hy - 1, ex = hx + 2;
  const eyes = p.eyes || 'open';
  if (eyes === 'open' || eyes === 'wide' || eyes === 'angry') { const r = eyes === 'wide' ? 2 : 1; rect(g, ex, ey - r, 2 + r, 2 + r, C.eye); rect(g, ex + r, ey - r + 1, 1, 2, C.pupil);
    rect(g, ex - 4, ey - r, 2 + r, 2 + r, C.eye); rect(g, ex - 3 + r - 1 + 1, ey - r + 1, 1, 2, C.pupil);
    if (eyes === 'angry') { line(g, ex - 5, ey - 4, ex - 1, ey - 2, C.hair, 1); line(g, ex + 4, ey - 4, ex, ey - 2, C.hair, 1); } }
  else if (eyes === 'shut') { rect(g, ex - 4, ey, 3, 1, C.pupil); rect(g, ex, ey, 3, 1, C.pupil); px(g, ex - 4, ey - 1, C.pupil); px(g, ex + 2, ey - 1, C.pupil); }
  else if (eyes === 'spiral') { for (const x0 of [ex - 4, ex]) { rect(g, x0, ey - 1, 3, 3, C.eye); px(g, x0 + 1, ey, C.pupil); px(g, x0 + 1, ey - 1, C.pupil); px(g, x0 + 2, ey + 1, C.pupil); } }
  else if (eyes === 'cry') { rect(g, ex - 4, ey - 1, 3, 2, C.pupil); rect(g, ex, ey - 1, 3, 2, C.pupil); px(g, ex - 4, ey + 1, C.tear); px(g, ex + 2, ey + 1, C.tear); px(g, ex - 4, ey + 2, C.tear); px(g, ex + 2, ey + 3, C.tear); }
  const mouth = p.mouth || 'smile', my = hy + 3;
  if (mouth === 'smile') { rect(g, ex - 2, my, 4, 1, C.pupil); px(g, ex - 3, my - 1, C.pupil); px(g, ex + 2, my - 1, C.pupil); }
  else if (mouth === 'grin') { rect(g, ex - 3, my - 1, 7, 2, C.pupil); rect(g, ex - 2, my - 1, 5, 1, C.eye); }
  else if (mouth === 'pout') { rect(g, ex - 1, my, 3, 1, C.pupil); px(g, ex - 2, my + 1, C.pupil); px(g, ex + 2, my + 1, C.pupil); }
  else if (mouth === 'shout') { rect(g, ex - 2, my - 1, 5, 4, C.pupil); rect(g, ex - 1, my - 1, 3, 1, C.eye); px(g, ex, my + 2, C.blush); }
  else if (mouth === 'wail') { rect(g, ex - 3, my - 1, 7, 4, C.pupil); rect(g, ex - 2, my, 5, 1, C.eye); rect(g, ex - 1, my + 2, 3, 1, C.blush); }
  else { rect(g, ex - 1, my, 3, 2, C.pupil); }
  px(g, ex - 5, ey + 2, C.blush); px(g, ex + 4, ey + 2, C.blush); px(g, ex - 1, ey + 1, C.skinD);                                                                                     // cheeks and a nose
  /* the tiara */
  const tiara = p.tiara || 'on';
  if (tiara === 'on' || tiara === 'crooked') { const tx = hx - 4 + (tiara === 'crooked' ? 3 : 0), ty = hy - 8 + (tiara === 'crooked' ? 3 : 0);
    rect(g, tx, ty + 2, 9, 2, C.gold); rect(g, tx, ty + 2, 9, 1, C.goldL); for (const k of [0, 2, 4, 6, 8]) { rect(g, tx + k, ty - (k === 4 ? 2 : 0) + (k === 2 || k === 6 ? 1 : 0), 1, 3 + (k === 4 ? 2 : 0) - (k === 2 || k === 6 ? 1 : 0), k & 2 ? C.gold : C.goldL); }
    px(g, tx + 4, ty + 2, '#ff4a6a'); px(g, tx + 2, ty + 3, '#4ad0ff'); px(g, tx + 6, ty + 3, '#7aff8a'); }
  /* the front arm and what it holds */
  const fsx = sh[0], fsy = sh[1], fhx = fsx + fa[0], fhy = fsy + fa[1];
  line(g, fsx, fsy, fhx, fhy, C.skin, 2); line(g, fsx, fsy + 1, fhx, fhy + 1, C.skinD, 1); rect(g, fsx - 1, fsy - 1, 3, 3, C.gownL);
  if (p.blade) { const [x0, y0, x1, y1] = p.blade; line(g, fhx + x0, fhy + y0, fhx + x1, fhy + y1, C.steel, 1); px(g, fhx + x1, fhy + y1, C.steelL);
    rect(g, fhx - 2, fhy - 1, 5, 2, C.gold); px(g, fhx + 2, fhy + 1, C.goldL); line(g, fhx + 1, fhy, fhx + Math.round(x1 * 0.2), fhy + Math.round(y1 * 0.2), C.steelL, 1);
    if (p.glint) { const gx = fhx + x1, gy = fhy + y1; rect(g, gx - 3, gy, 7, 1, C.steelL); rect(g, gx, gy - 3, 1, 7, C.steelL); px(g, gx - 1, gy - 1, C.steelL); px(g, gx + 1, gy + 1, C.steelL); px(g, gx + 1, gy - 1, C.steelL); px(g, gx - 1, gy + 1, C.steelL); } }
  circle(g, fhx, fhy, 2, C.skin);
  if (p.tiara === 'hand') { const tx = fhx - 4, ty = fhy - 4; rect(g, tx, ty + 2, 9, 2, C.gold); rect(g, tx, ty + 2, 9, 1, C.goldL); for (const k of [0, 2, 4, 6, 8]) rect(g, tx + k, ty - (k === 4 ? 2 : 0) + (k === 2 || k === 6 ? 1 : 0), 1, 3 + (k === 4 ? 2 : 0) - (k === 2 || k === 6 ? 1 : 0), k & 2 ? C.gold : C.goldL); px(g, tx + 4, ty + 2, '#ff4a6a'); }
  if (p.purse) { const px0 = CX + lean - 6, py0 = hipY + 2; rect(g, px0, py0, 5, 5, C.purple); rect(g, px0, py0, 5, 1, C.gold); px(g, px0 + 2, py0 + 5, C.purple); px(g, px0 + 1, py0 - 1, C.gold); if (p.purse > 1) { for (let i = 0; i < 3; i++) px(g, px0 + 1 + i, py0 - 1 - (i & 1), C.gem[i]); } }
  if (p.handbell) { const bx = fhx, by2 = fhy - 8; rect(g, bx - 1, by2 + 6, 3, 2, C.gold); rect(g, bx - 3, by2, 7, 6, C.gold); rect(g, bx - 3, by2, 3, 6, C.goldL); rect(g, bx - 4, by2 + 6, 9, 1, C.goldD); px(g, bx, by2 + 8, C.goldD); rect(g, bx, by2 - 2, 1, 2, C.goldD);
    for (const [dx, dy] of [[-6, -1], [-7, 3], [6, -1], [7, 3]]) px(g, bx + dx, by2 + dy, C.goldL); }
  if (p.fx) p.fx(g, { hx, hy, fhx, fhy, hipY, waistY, hemY });
}

/* the pose of every frame */
function pose(f) {
  const rp = (i) => ({ by: i & 1 ? 1 : 0, legs: [[5, -5], [2, -2], [-5, 5], [-2, 2]][i], lean: 3, skirt: -2 - (i & 1), flare: 2, fa: [6, 4], ba: [-6, 3], blade: [8, -2, 17, -7], fan: 0, fly: 2, lift: i === 1 ? 2 : i === 3 ? 0 : 0, mouth: 'smile' });
  switch (f) {
    case 0: return { legs: [1, -1], fa: [6, 4], ba: [-5, 6], blade: [8, -2, 18, -8], fan: 0, ears: 0 };
    case 1: return { by: 1, legs: [1, -1], fa: [6, 5], ba: [-5, 6], blade: [8, -1, 18, -6], fan: 0, ears: 1, eyes: 'shut', mouth: 'smile' };
    case 2: case 3: case 4: case 5: return rp(f - 2);
    case 6: return { crouch: 3, lean: -2, legs: [-6, 5], fa: [-6, 3], ba: [-3, 3], blade: [-2, -4, 12, -4], glint: 1, skirt: 3, eyes: 'angry', mouth: 'grin', ears: 1 };
    case 7: return { crouch: 3, lean: 6, legs: [9, -7], fa: [12, 2], ba: [-7, 1], blade: [4, 0, 22, -3], skirt: 6, eyes: 'angry', mouth: 'shout', fan: 0, fly: 3 };
    case 8: return { lean: 0, legs: [3, -3], fa: [3, -9], ba: [-6, 4], blade: [1, -4, 6, -17], glint: 1, eyes: 'angry', mouth: 'grin', ears: 1 };
    case 9: return { lean: 3, crouch: 1, legs: [4, -4], fa: [10, 1], ba: [-6, 3], blade: [4, 0, 19, -2], eyes: 'angry', mouth: 'shout', skirt: 2 };
    case 10: return { lean: 4, crouch: 1, legs: [5, -4], fa: [9, -4], ba: [-6, 3], blade: [4, -1, 18, -9], eyes: 'angry', mouth: 'shout', skirt: 2 };
    case 11: return { lean: 1, legs: [1, -1], fa: [-3, 8], ba: [-5, 5], blade: null, purse: 2, eyes: 'open', mouth: 'grin', ears: 1, fx: (g, o) => { px(g, o.fhx - 1, o.fhy - 2, C.gem[0]); px(g, o.fhx + 1, o.fhy - 3, C.gem[1]); } };
    case 12: return { lean: 3, legs: [3, -3], fa: [11, -4], ba: [-6, 4], blade: null, purse: 1, eyes: 'open', mouth: 'shout', fx: (g, o) => { for (let i = 0; i < 3; i++) rect(g, o.fhx + 4 + i * 4, o.fhy - 6 + i * 2, 3, 3, C.gem[i]), px(g, o.fhx + 4 + i * 4, o.fhy - 6 + i * 2, C.goldL); } };
    case 13: return { lean: -1, legs: [2, -2], fa: [4, 2], ba: [-4, -3], blade: [6, -1, 13, -5], fan: 1, fanDir: -1, mouth: 'smile', eyes: 'open', ears: 1 };
    case 14: return { lean: -4, legs: [-3, 6], fa: [4, 2], ba: [6, -2], blade: null, fan: 2, fanDir: 1, skirt: 4, flare: 3, fly: 6, mouth: 'shout', eyes: 'shut', fx: (g, o) => { for (let i = 0; i < 4; i++) { rect(g, o.fhx + 10 + i * 3, o.hy - 6 + i * 4, 6, 1, C.fan); px(g, o.fhx + 17 + i * 3, o.hy - 5 + i * 4, C.goldL); } } };
    case 15: return { crouch: 7, lean: 0, legs: [-3, 3], fa: [3, 6], ba: [-4, 6], blade: null, fan: 0, skirt: 0, flare: 1, mouth: 'grin', eyes: 'open', ears: 1 };
    case 16: return { air: 8, by: -6, lean: 1, legs: [-5, 4], lift: 5, fa: [7, -8], ba: [-7, -7], blade: null, fan: 0, skirt: 5, flare: 3, fly: 4, eyes: 'wide', mouth: 'shout', ears: 1 };
    case 17: return { lean: 0, legs: [1, -1], fa: [3, -12], ba: [-5, 5], blade: null, tiara: 'hand', eyes: 'open', mouth: 'grin', ears: 1 };
    case 18: return { lean: 3, legs: [3, -3], fa: [12, -3], ba: [-5, 5], blade: null, tiara: 'off', eyes: 'angry', mouth: 'shout', ears: 1 };
    case 19: return { lean: 0, crouch: 0, legs: [1, -1], lift: 5, fa: [5, 6], ba: [-5, 6], blade: null, eyes: 'angry', mouth: 'shout', ears: 1, flare: 1,
      fx: (g, o) => { for (const s of [-1, 1]) { px(g, o.hx + s * 11, o.hy - 9, C.goldL); px(g, o.hx + s * 12, o.hy - 6, C.goldL); } } };
    case 20: return { crouch: 4, lean: 0, legs: [6, -6], fa: [8, 2], ba: [-8, 2], blade: null, eyes: 'angry', mouth: 'wail', ears: 2, skirt: 0, flare: 3,
      fx: (g, o) => { for (const s of [-1, 1]) for (let i = 0; i < 3; i++) rect(g, CX + s * (11 + i * 5), G - 2 - i, 3, 2, i ? C.skinD : C.skinL); } };
    case 21: return { lean: -1, legs: [1, -1], fa: [-2, -9], ba: [-5, 5], blade: [2, 0, 9, 3], eyes: 'shut', mouth: 'smile', ears: 1, tilt: -1 };
    case 22: return { by: 0, lean: -1, legs: [1, -1], fa: [-6, -3], ba: [3, -8], blade: [2, 2, 4, 14], fan: 1, fanDir: 1, eyes: 'shut', mouth: 'pout', ears: 1, tilt: 1 };
    case 23: return { crouch: 9, slump: 3, lean: -2, legs: [-4, 4], fa: [-3, -9], ba: [-1, -8], blade: null, eyes: 'cry', mouth: 'wail', ears: 2, tiara: 'crooked', skirt: 0, flare: 4,
      fx: (g, o) => { rect(g, o.hx - 11, o.hy - 14, 24, 1, '#34343f'); for (let x = o.hx - 10; x < o.hx + 13; x += 5) { rect(g, x, o.hy - 14, 2, 30, '#34343f'); rect(g, x, o.hy - 14, 1, 30, '#8a8aa0'); } } };
    case 24: return { lean: -2, legs: [-3, 2], fa: [5, 5], ba: [-6, 5], blade: null, eyes: 'spiral', mouth: 'wail', ears: 2, tiara: 'crooked', tilt: -2, slump: 1,
      fx: (g, o) => { for (let i = 0; i < 3; i++) { const a = i * 2.1; px(g, Math.round(o.hx + Math.cos(a) * 9), Math.round(o.hy - 12 + Math.sin(a) * 2), C.gold); px(g, Math.round(o.hx + Math.cos(a) * 9) + 1, Math.round(o.hy - 12 + Math.sin(a) * 2), C.goldL); } } };
    case 25: return { lean: -5, legs: [-4, 5], fa: [7, -5], ba: [-8, -4], blade: [4, -1, 12, -6], eyes: 'wide', mouth: 'shout', ears: 1, tilt: -2, skirt: 5, flare: 3, fan: null };
    case 26: case 27: { const k = f - 26; return { by: k, lean: 4, legs: k ? [-6, 6] : [6, -6], lift: k ? 3 : 1, fa: [-3, 6], ba: [-8, -6], blade: null, eyes: 'wide', mouth: 'shout', ears: 1, skirt: -6, flare: 3, fly: 4, tilt: -2,
      fx: (g, o) => { px(g, o.hx - 13, o.hy - 8, C.tear); px(g, o.hx - 15, o.hy - 5, C.tear); } }; }
    case 28: return { crouch: 9, slump: 2, lean: 2, legs: [-3, 3], fa: [2, -9], ba: [-3, -9], blade: null, eyes: 'wide', mouth: 'pout', ears: 2, skirt: 0, flare: 4 };
    case 29: return { crouch: 8, lean: 1, legs: [-4, 4], fa: [5, 4], ba: [-3, 3], blade: null, fan: 1, fanDir: -1, eyes: 'open', mouth: 'grin', ears: 1, skirt: -1, flare: 3 };
    case 30: return { lean: 3, legs: [6, -6], lift: 2, fa: [5, -12], ba: [-6, -12], blade: null, eyes: 'cry', mouth: 'wail', ears: 2, skirt: -5, flare: 3, fly: 4, by: -1 };
    case 31: return { sit: 1, crouch: 11, slump: 3, lean: 0, legs: [0, 0], fa: [-3, -5], ba: [3, -4], blade: null, eyes: 'cry', mouth: 'wail', ears: 2, tiara: 'off', skirt: 0, flare: 6,
      fx: (g, o) => { rect(g, CX + 16, G - 3, 9, 3, C.gold); rect(g, CX + 16, G - 3, 9, 1, C.goldL); for (const k of [0, 3, 6]) rect(g, CX + 16 + k, G - 6, 1, 3, C.gold); px(g, CX + 20, G - 3, '#ff4a6a'); rect(g, CX - 11, G - 3, 4, 2, C.shoe); } };
    case 32: return { lean: 1, legs: [1, -1], fa: [5, -9], ba: [-6, 5], blade: null, handbell: 1, eyes: 'wide', mouth: 'shout', ears: 1 };
    default: return { by: 1, lean: -3, legs: [-2, 3], fa: [-4, -4], ba: [-6, -3], blade: [-2, 0, 4, 6], eyes: 'shut', mouth: 'wail', ears: 2, tilt: -3, skirt: 3, flare: 2, fan: null };
  }
}

export function bakeGoblinPrincess() {
  const F = Array.from({ length: GP_FRAMES }, (_, f) => { const [c, g] = canvas(W, H); draw(g, pose(f)); outline(c, OUT); return c; });
  return { R: F, L: F.map(c => flipX(c)), white: { R: F.map(c => whiten(c)), L: F.map(c => flipX(whiten(c))) }, ax: CX, ay: G, w: 12, h: 20 };
}

/* which frame a mode wears (src/goblin-princess.js H.frame calls this). e.anim runs while she moves; e.vx her speed; e.mode her move. */
export function gpFrame(e) {
  const m = e.mode, a = e.anim || 0, moving = Math.abs(e.vx || 0) > 4, A = Math.floor(a * 9);
  switch (m) {
    case 'lungeTell': return GPF.lungeTell; case 'lunge': return GPF.lunge;
    case 'flurryTell': return GPF.flurryTell; case 'flurry': return GPF.poke + (Math.floor(a * 16) & 1);
    case 'trinketTell': return GPF.trinketTell; case 'trinket': return GPF.trinket;
    case 'fanTell': return GPF.fanTell; case 'fan': return GPF.fan;
    case 'hopTell': return GPF.hopTell; case 'hop': return GPF.hop;
    case 'tiaraTell': return GPF.tiaraTell; case 'tiara': case 'tiaraWait': return GPF.tiara;
    case 'stompTell': return GPF.stompTell; case 'stomp': return GPF.stomp;
    case 'preen': return GPF.preen + (Math.floor(a * 3) & 1);
    case 'pinned': return GPF.pinned; case 'stunned': return GPF.stunned; case 'stagger': return GPF.stagger;
    case 'bolt': return GPF.bolt + (A & 1); case 'escape': return GPF.escape; case 'hide': case 'ducked': return GPF.hide; case 'perch': return GPF.perch;
    case 'walk': case 'recover': return moving ? GPF.run + (A & 3) : (Math.floor(a * 2) & 1 ? 1 : 0);
    default: return moving ? GPF.run + (A & 3) : 0;
  }
}

// ---------------- PARTS: the gems she throws, the tiara in flight, the stomp's ripple, the fan's gust ----------------
export function drawGem(g, x, y, col, time, id = 0) {                                                    // a cut gem, four pixels across, with a glint that turns
  const X = Math.round(x), Y = Math.round(y), k = Math.floor(time * 14 + id) & 3;
  rect(g, X - 2, Y - 1, 5, 3, col); rect(g, X - 1, Y - 2, 3, 1, col); rect(g, X - 1, Y + 2, 3, 1, col); rect(g, X - 2, Y - 1, 5, 1, '#fff6c8'); px(g, X + (k < 2 ? -1 : 1), Y, '#ffffff');
  px(g, X - 3 + k, Y - 3 + (k & 1) * 6, '#fff6c8'); }
export function drawTiaraFlying(g, x, y, time, home) {                                                   // the toy tiara: spins end over end; green-white when you have parried it home
  const X = Math.round(x), Y = Math.round(y), a = Math.floor(time * 16) & 3, gold = home ? '#8fd160' : C.gold, hi = home ? '#e8ffd0' : C.goldL;
  if (a & 1) { rect(g, X - 2, Y - 5, 4, 11, gold); rect(g, X - 2, Y - 5, 1, 11, hi); px(g, X, Y - 6, hi); px(g, X, Y + 6, hi); px(g, X, Y, '#ff4a6a'); }
  else { rect(g, X - 6, Y - 1, 12, 3, gold); rect(g, X - 6, Y - 1, 12, 1, hi); for (const k of [-6, -3, 0, 3, 5]) rect(g, X + k, Y - 3 - (k === 0 ? 2 : 0), 1, 3 + (k === 0 ? 2 : 0), gold); px(g, X, Y, '#ff4a6a'); px(g, X - 3, Y + 1, '#4ad0ff'); px(g, X + 3, Y + 1, '#7aff8a'); }
  g.globalAlpha = 0.35; rect(g, X - 9 + (a & 1) * 3, Y - 1, 3, 1, hi); g.globalAlpha = 1; }
export function drawRipple(g, x, fy, time, k = 0) {                                                      // the stomp's shock: a travelling wave of cracked flagstone you jump
  const X = Math.round(x), a = Math.floor(time * 18) & 1;
  rect(g, X - 6, fy - 5, 12, 5, '#7a7a8a'); rect(g, X - 6, fy - 5, 12, 1, '#c9c9d6'); rect(g, X - 4, fy - 7 - a, 8, 2, '#a0a0b0'); rect(g, X - 2, fy - 9 - a, 4, 2, '#c9c9d6');
  rect(g, X - 8, fy - 1, 3, 1, '#3a3a44'); rect(g, X + 5, fy - 1, 3, 1, '#3a3a44'); px(g, X - 7, fy - 2, '#c9c9d6'); px(g, X + 6, fy - 3, '#c9c9d6'); void k; }
export function drawFanGust(g, x, y, face, time, len = 60) {                                             // a gust of pink feather-light air: three streaks and fluttering down
  for (let i = 0; i < 3; i++) { const xx = Math.round(x + face * (8 + ((time * 120 + i * 17) % len))), yy = Math.round(y - 8 + i * 5 + Math.sin(time * 20 + i) * 1.5); rect(g, face > 0 ? xx : xx - 6, yy, 6, 1, i & 1 ? C.fan : '#ffffff'); px(g, xx + face * 6, yy + 1, C.fanD); } }

/* ONE sheet for the whole game: main.js SPR.gprincess and src/goblin-princess.js's chase actor share it */
let SHEET = null;
export function sheet() { return SHEET || (SHEET = bakeGoblinPrincess()); }
