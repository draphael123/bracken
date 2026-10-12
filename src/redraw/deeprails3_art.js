// deeprails3_art.js - DEEP RAILS 3's art pass (claude/dr3art): the Foreman seated in his cart (his own skin and tell poses), his armoured cart (lid, plates, brace spikes, dents),
// the switch lever and its hinged bridge, the low roofs (one per area), the perched / swinging / leaping goblins' props, and the Great Drill 3 pieces (the points-lever post and
// the ore dump, the dynamite stick, the cutter boom, the hook and chain, the collapse rubble, the gouges). Plain pixel rects on the screen, the Deep Rails kit (MP palette, glow
// sprites); src/minecart-hands.js and src/great-drill-hands.js keep every box, timing and tell - they hand this file the numbers and it draws. No per-frame bake, nothing at a
// negative y that is not clipped (the sprites are baked once at load).
import { MP, glow, zoneOf, WALLK } from './minecart_backdrop.js';
import { canvas, flipX, whiten, outline } from '../px.js';
const R = Math.round;
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const add = (g, fn) => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; };
const HAZ = ['#e8b830', '#1a1612'], DARK = '#14100e', OUT = '#1b1626';

/* ================= 1. THE FOREMAN: a goblin foreman SEATED in his cart (his own skin) =================
   A bust, 22 x 32, facing right (the set flips for left): hard hat with a brass lamp, a red waistcoat, the whip. Frames: 0 idle, 1 drift (leaning back, a hand on the brake), 2 pick (the arm
   back, the pick up), 3 ram (braced, teeth), 4 lurch (both arms up, roaring), 5 duck (down in the tub, only the hat), 6 hurt (hat knocked, eyes shut). The cart's front plate is drawn
   over the lower rows (MCA.armourFront), so he sits IN it: rows 23 and down are hidden. */
const FK = { skin: '#6faa4a', skinHi: '#8fc760', skinD: '#3f6e2c', hat: '#e0b040', hatHi: '#fff0a0', hatD: '#a8801c', vest: '#8f2f28', vestHi: '#c9463d', shirt: '#d8d0b8', eye: '#ff4030', tooth: '#f3f0d2', mouth: '#2a1010', whip: '#8a5a32', whipD: '#5c3a1d', brass: '#c8962c', lamp: '#fff0b0', iron: '#b0b0be', ironD: '#585866', belt: '#3a2214' };
function bust(p) {
  const [c, g] = canvas(22, 32), cx = 11 + (p.lean || 0), dy = p.dy || 0, r = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y + dy, w, h); };
  /* the back arm (the pick pose raises it behind) */
  if (p.arm === 'pick') { r(cx - 9, 13, 3, 9, FK.vest); r(cx - 9, 11, 3, 3, FK.skin); r(cx - 8, 2, 2, 11, FK.whip); r(cx - 8, 2, 1, 11, FK.whipD); r(cx - 12, 1, 9, 2, FK.iron); r(cx - 12, 1, 9, 1, '#e8e8f4'); r(cx - 13, 2, 2, 3, FK.ironD); r(cx - 4, 2, 2, 2, FK.ironD); }
  /* the torso: waistcoat over a shirt, shoulders wide */
  r(cx - 7, 19, 14, 13, FK.vest); r(cx - 7, 19, 14, 1, FK.vestHi); r(cx - 7, 19, 2, 13, FK.vestHi); r(cx + 5, 20, 2, 12, '#5c1c18'); r(cx - 2, 19, 4, 13, FK.shirt); r(cx - 2, 19, 4, 1, '#ffffff');
  r(cx - 1, 23, 2, 1, FK.brass); r(cx - 1, 27, 2, 1, FK.brass); r(cx - 7, 29, 14, 3, FK.belt); r(cx - 2, 29, 4, 3, FK.brass);   /* buttons, belt, buckle */
  r(cx - 2, 17, 5, 3, FK.skinD);                                                                                                   /* the neck */
  /* the head: a long jaw, big ears, a hooked nose, narrow red eyes under a heavy brow */
  r(cx - 4, 8, 9, 10, FK.skin); r(cx - 4, 8, 9, 1, FK.skinHi); r(cx - 3, 18, 7, 1, FK.skinD); r(cx - 4, 16, 1, 2, FK.skinD);
  r(cx - 9, 9, 5, 2, FK.skin); r(cx - 10, 8, 2, 2, FK.skinHi); r(cx - 8, 11, 3, 2, FK.skinD); r(cx + 5, 10, 4, 2, FK.skin); r(cx + 8, 9, 2, 2, FK.skinHi);   /* the ears */
  r(cx + 5, 12, 3, 3, FK.skin); r(cx + 7, 14, 1, 1, FK.skinD);                                                                                    /* the nose */
  if (p.eyes === 'shut') { r(cx - 1, 13, 3, 1, FK.skinD); r(cx + 3, 13, 3, 1, FK.skinD); } else { r(cx - 1, 12, 3, 2, FK.eye); r(cx + 3, 12, 3, 2, FK.eye); r(cx, 12, 1, 1, '#ffd0a0'); r(cx + 4, 12, 1, 1, '#ffd0a0'); r(cx - 2, 11, 5, 1, FK.skinD); r(cx + 3, 11, 4, 1, FK.skinD);
    if (p.eyes === 'glare') { r(cx - 2, 10, 3, 1, FK.skinD); r(cx + 4, 10, 3, 1, FK.skinD); } }
  if (p.mouth === 'open') { r(cx - 1, 15, 6, 3, FK.mouth); r(cx - 1, 15, 1, 1, FK.tooth); r(cx + 1, 15, 1, 1, FK.tooth); r(cx + 3, 15, 1, 1, FK.tooth); r(cx + 1, 17, 2, 1, '#c9463d'); }
  else if (p.mouth === 'teeth') { r(cx - 1, 15, 7, 2, FK.mouth); for (let i = -1; i < 6; i += 2) r(cx + i, 15, 1, 1, FK.tooth); r(cx - 1, 17, 1, 1, FK.tooth); }
  else { r(cx - 1, 16, 6, 1, FK.mouth); r(cx + 4, 15, 1, 1, FK.tooth); }
  /* the hard hat: a yellow dome, a ridge, a brim, a brass lamp on the front */
  const hx = cx + (p.hatX || 0), hy = p.hatY || 0;
  r(hx - 5, 4 + hy, 11, 5, FK.hat); r(hx - 4, 3 + hy, 9, 1, FK.hat); r(hx - 3, 2 + hy, 7, 1, FK.hatHi); r(hx - 1, 2 + hy, 2, 7, FK.hatHi); r(hx - 5, 8 + hy, 12, 2, FK.hatD); r(hx - 6, 9 + hy, 14, 1, FK.hatD); r(hx - 5, 4 + hy, 1, 5, FK.hatD);
  r(hx + 4, 4 + hy, 4, 4, FK.brass); r(hx + 5, 5 + hy, 2, 2, FK.lamp); r(hx + 4, 4 + hy, 4, 1, '#ffe49a');
  /* the front arm */
  if (p.arm === 'whip') { r(cx + 6, 20, 3, 6, FK.vest); r(cx + 7, 17, 3, 3, FK.skin); r(cx + 9, 9, 1, 9, FK.whip); for (let i = 0; i < 5; i++) r(cx + 10 + (i > 2 ? 1 : 0), 8 - i, 1, 1, FK.whipD); r(cx + 7, 16, 3, 2, FK.whipD); }
  if (p.arm === 'brake') { r(cx + 6, 20, 3, 4, FK.vest); r(cx + 7, 17, 3, 3, FK.skin); r(cx + 9, 14, 2, 8, FK.ironD); r(cx + 8, 12, 4, 3, '#c9463d'); r(cx + 8, 12, 4, 1, '#ff8a7a'); }
  if (p.arm === 'ram') { r(cx + 5, 19, 5, 4, FK.vest); r(cx + 9, 18, 3, 4, FK.skin); r(cx + 11, 15, 3, 6, FK.ironD); r(cx + 10, 13, 5, 3, '#ff3b3b'); r(cx + 10, 13, 5, 1, '#ffb0a0'); r(cx - 8, 20, 4, 3, FK.vest); }
  if (p.arm === 'up') { r(cx - 10, 13, 3, 8, FK.vest); r(cx - 11, 10, 4, 4, FK.skin); r(cx + 8, 13, 3, 8, FK.vest); r(cx + 8, 10, 4, 4, FK.skin); r(cx - 11, 10, 1, 1, FK.skinHi); r(cx + 11, 10, 1, 1, FK.skinHi); }
  if (p.arm === 'pick') { r(cx + 6, 20, 3, 4, FK.vest); r(cx + 7, 18, 3, 3, FK.skin); }
  if (p.arm === 'hurt') { r(cx + 7, 16, 3, 7, FK.vest); r(cx + 8, 13, 3, 4, FK.skin); r(cx - 10, 14, 3, 8, FK.vest); r(cx - 10, 12, 3, 3, FK.skin); }
  return outline(c, OUT);
}
const POSES = [{ arm: 'whip', eyes: 'open', mouth: 'smirk' }, { lean: -2, arm: 'brake', eyes: 'open', mouth: 'smirk', hatX: -1 }, { lean: -1, arm: 'pick', eyes: 'glare', mouth: 'teeth' }, { lean: 2, arm: 'ram', eyes: 'glare', mouth: 'teeth', hatY: 1 }, { arm: 'up', eyes: 'glare', mouth: 'open' }, { dy: 15, arm: 'none', eyes: 'open', mouth: 'smirk' }, { lean: -3, arm: 'hurt', eyes: 'shut', mouth: 'open', hatX: -3, hatY: 1 }];
export const FOREMAN_F = { idle: 0, drift: 1, pick: 2, ram: 3, lurch: 4, duck: 5, hurt: 6 };
export function bakeForemanSkin() {
  const fr = POSES.map(bust), white = fr.map(c => whiten(c));
  return { R: fr, L: fr.map(c => flipX(c)), white: { R: white, L: white.map(c => flipX(c)) }, ax: 11, ay: 32, w: 14, h: 30 };
}

/* ================= 2. THE FOREMAN'S ARMOURED CART =================
   Its lid is at y - 15 (the hero stands on it: src/foreman.js topDy), a squat iron wagon, plated, a ram's beak at the back (facing you), a lamp on a pole. The BACK (beak, pole, wheels) is
   drawn with the cart; the FRONT PLATE (the body from the lid down) is drawn again over the foreman so he sits in it. `rams` = stomps so far (dented plates), `stun` = rocking. */
const rockX = (time, stun) => (stun ? (Math.floor(time * 30) % 2 ? 1 : -1) : 0);
export function armourBack(g, x, y, time, v, rams, stun) {
  x = R(x + rockX(time, stun)); y = R(y);
  rc(g, x - 16, y - 16, 32, 13, DARK); rc(g, x - 14, y - 15, 28, 3, '#0c0a0e');                                   /* the tub's inside, dark */
  rc(g, x - 21, y - 11, 5, 5, MP.i3); rc(g, x - 23, y - 10, 2, 3, MP.i4); rc(g, x - 21, y - 11, 5, 1, MP.i5); rc(g, x - 22, y - 9, 1, 1, '#e8e8f4');   /* the ram's beak, at the back */
  rc(g, x - 20, y - 8, 4, 1, MP.i1);
  rc(g, x + 12, y - 33, 1, 18, MP.t2); rc(g, x + 10, y - 36, 5, 4, MP.l1); rc(g, x + 11, y - 35, 3, 2, MP.l3);                            /* the lamp pole */
  add(g, () => { g.globalAlpha = 0.5 + 0.2 * Math.sin(time * 6); g.drawImage(glow(14, '255,120,40'), x - 2, y - 48); });
  const a = time * (v || 0) / 5; for (const wx of [x - 10, x, x + 10]) { rc(g, wx - 4, y - 5, 8, 6, '#0c0a0a'); rc(g, wx - 4, y - 5, 8, 1, MP.i3); rc(g, wx - 1 + R(Math.cos(a) * 2), y - 3 + R(Math.sin(a) * 2), 2, 1, MP.i4); rc(g, wx, y - 2, 1, 1, MP.i5); }   /* wheels, turning */
}
export function armourFront(g, x, y, time, rams, stun) {
  x = R(x + rockX(time, stun)); y = R(y);
  rc(g, x - 16, y - 15, 32, 11, MP.i0); rc(g, x - 15, y - 14, 30, 9, MP.i2);                                      /* the body, from the lid down to the skirts */
  rc(g, x - 16, y - 15, 32, 2, MP.i4); rc(g, x - 16, y - 15, 32, 1, MP.i5); rc(g, x - 16, y - 13, 32, 1, MP.i1);   /* THE LID: the rim he is stood on */
  for (let i = 0; i < 3; i++) { const px = x - 15 + i * 10, dent = i < (rams || 0);
    rc(g, px + 1, y - 12, 8, 7, dent ? MP.i1 : MP.i3); rc(g, px + 1, y - 12, 8, 1, dent ? MP.i2 : MP.i5); rc(g, px + 1, y - 6, 8, 1, MP.i0);
    if (dent) { rc(g, px + 3, y - 10, 3, 2, MP.i0); rc(g, px + 6, y - 11, 1, 3, MP.i0); rc(g, px + 2, y - 8, 2, 1, MP.t3); if (rams > 1 + i) { rc(g, px + 5, y - 7, 3, 1, MP.i0); rc(g, px + 7, y - 9, 1, 2, MP.i0); } }   /* each stomp dents a plate (and a second dents it further) */
    rc(g, px + 2, y - 11, 1, 1, MP.i5); rc(g, px + 7, y - 11, 1, 1, MP.i5); }
  rc(g, x - 16, y - 9, 32, 3, HAZ[0]); for (let i = 0; i < 32; i += 6) { rc(g, x - 16 + i, y - 9, 3, 3, HAZ[1]); }   /* its hazard strip */
  rc(g, x - 16, y - 9, 32, 1, 'rgba(255,255,255,0.18)');
  rc(g, x - 17, y - 14, 1, 10, MP.i3); rc(g, x + 16, y - 14, 1, 10, MP.i2);                                         /* end plates */
}
export function armourCart(g, x, y, time, v, rams, stun) { armourBack(g, x, y, time, v, rams, stun); armourFront(g, x, y, time, rams, stun); }
/* BRACED: the lid's spikes up (k 0..1 how far): iron cones with bright tips on a hazard collar - a landing on them is turned */
export function fmSpikes(g, x, y, k, time) {
  const h = R(3 + 7 * k); rc(g, x - 15, y - 2, 30, 2, HAZ[0]); for (let i = -15; i < 15; i += 6) rc(g, x + i, y - 2, 3, 2, HAZ[1]);
  for (let i = -13; i <= 13; i += 5) { for (let r = 0; r < h; r++) { const w = Math.max(1, 3 - Math.floor(r * 3 / h)); rc(g, x + i - (w >> 1), y - 2 - r, w, 1, r > h - 3 ? MP.i5 : MP.i4); } rc(g, x + i - 1, y - 2 - h, 1, 1, '#ffffff'); }
}

/* ================= 3. THE LOW ROOF (one per area) =================
   x0..x1 screen, y = the underside of the rock (the roof's lintel hangs from y). Yard: warm timber with a lantern string; Dark Drift: black, rotted, dripping; Works: riveted iron girders and a
   hazard edge; Flooded Run: wet green-black timber, dripping, a sheen. Knee braces at the ends and every ~48 px (art only: they stop short of the line). */
export function lowRoof(g, x0, x1, y, time, seed) {
  const z = zoneOf(seed | 0), w = x1 - x0, K = z === 5 ? WALLK[5] : z === 1 ? WALLK[1] : z === 4 ? WALLK[4] : WALLK[0];
  rc(g, x0, y - 8, w, 8, K[2]); rc(g, x0, y - 8, w, 2, K[3]); for (let x = x0 + 5; x < x1 - 3; x += 17) rc(g, x, y - 5 - ((x * 7) % 3), 7, 2, K[4]);   /* the rock over it */
  rc(g, x0, y - 1, w, 1, K[0]);
  if (z === 4) {   /* THE WORKS: an iron girder */
    rc(g, x0, y, w, 6, MP.i2); rc(g, x0, y, w, 1, MP.i4); rc(g, x0, y + 5, w, 1, MP.i0); for (let x = x0 + 3; x < x1 - 2; x += 8) { rc(g, x, y + 2, 2, 2, MP.i5); }
    for (let x = x0; x < x1 - 8; x += 16) { rc(g, x, y + 6, 8, 2, HAZ[0]); rc(g, x + 8, y + 6, 8, 2, HAZ[1]); }   /* a hazard edge */
    for (let x = x0 + 24; x < x1 - 8; x += 48) { rc(g, x - 1, y, 3, 8, MP.i3); rc(g, x - 1, y, 1, 8, MP.i5); }
  } else if (z === 5) {   /* THE FLOODED RUN: wet timber, green-black */
    rc(g, x0, y, w, 6, '#1d3a30'); rc(g, x0, y, w, 1, '#3c6a58'); rc(g, x0, y + 5, w, 1, '#08140f'); for (let x = x0 + 6; x < x1 - 4; x += 19) { rc(g, x, y + 2, 9, 1, '#10261e'); rc(g, x + 3, y + 3, 4, 1, '#4a8a74'); }
    rc(g, x0, y + 6, w, 1, 'rgba(140,220,200,0.22)');
    for (let i = 0; i < 4; i++) { const px = x0 + 12 + i * (w / 4) + ((i * 29) % 11), t = (time * 0.9 + i * 0.31) % 1; rc(g, px, y + 7 + R(t * 18), 1, 2, 'rgba(160,230,220,' + (0.8 - 0.6 * t).toFixed(2) + ')'); }   /* drips falling to the water */
  } else if (z === 1) {   /* THE DARK DRIFT: rotten, almost black, a pale fungus, a slow drip */
    rc(g, x0, y, w, 6, '#0d0a0a'); rc(g, x0, y, w, 1, '#2a2020'); rc(g, x0, y + 5, w, 1, '#050404'); for (let x = x0 + 4; x < x1 - 3; x += 13) { rc(g, x, y + 2 + ((x * 3) % 3), 5, 1, '#1a1414'); }
    for (let x = x0 + 14; x < x1 - 10; x += 31) { rc(g, x, y + 6, 2, 1, '#7fa8a0'); rc(g, x + 1, y + 7, 1, 1, '#4a6a68'); }
    const t = (time * 0.6) % 1; rc(g, x0 + R(w * 0.45), y + 6 + R(t * 14), 1, 2, 'rgba(160,200,200,' + (0.7 - 0.5 * t).toFixed(2) + ')');
  } else {   /* THE YARD (and anywhere else): warm timber, a hanging lamp */
    rc(g, x0, y, w, 6, MP.t2); rc(g, x0, y, w, 1, MP.t5); rc(g, x0, y + 5, w, 1, MP.t0); for (let x = x0 + 4; x < x1 - 2; x += 22) rc(g, x, y + 2, 3, 3, MP.t1); for (let x = x0; x < x1; x += 11) rc(g, x, y + 1, 1, 4, MP.t3);
    for (let x = x0 + 30; x < x1 - 20; x += 70) { rc(g, x, y + 6, 1, 4, MP.i3); rc(g, x - 2, y + 10, 5, 4, MP.l1); rc(g, x - 1, y + 11, 3, 2, MP.l3); add(g, () => { g.globalAlpha = 0.55 + 0.1 * Math.sin(time * 5 + x); g.drawImage(glow(20, '255,160,64'), x - 20, y + 12 - 20); }); }
  }
  /* the props: knee braces at the ends and under every other beam joint, tapering, never reaching the rail */
  const brace = (bx, d) => { for (let i = 0; i < 6; i++) rc(g, bx + d * i, y + 6 + i, 3, 1, z === 4 ? MP.i3 : z === 5 ? '#17302a' : z === 1 ? '#1a1414' : MP.t3); };
  brace(x0, 1); brace(x1 - 3, -1); for (let x = x0 + 48; x < x1 - 30; x += 96) { brace(x, 1); brace(x + 3, -1); }
  rc(g, x0 - 2, y - 8, 3, 24, z === 4 ? MP.i3 : z === 5 ? '#1d3a30' : z === 1 ? '#1a1414' : MP.t3); rc(g, x1 - 1, y - 8, 3, 24, z === 4 ? MP.i3 : z === 5 ? '#1d3a30' : z === 1 ? '#1a1414' : MP.t3);   /* the end posts */
}
/* A PERCH: a roof timber over the line, a goblin crouches on it (rope lashings, an iron bracket, a lantern-hook), posts at both ends */
export function perchBeam(g, x0, x1, y) {
  rc(g, x0 - 4, y, x1 - x0 + 8, 5, MP.t3); rc(g, x0 - 4, y, x1 - x0 + 8, 1, MP.t5); rc(g, x0 - 4, y + 4, x1 - x0 + 8, 1, MP.t0); for (let x = x0 - 2; x < x1 + 2; x += 9) rc(g, x, y + 1, 1, 3, MP.t2);
  for (const px_ of [x0 - 4, x1 + 2]) { rc(g, px_, y - 40, 3, 40, MP.t2); rc(g, px_, y - 40, 1, 40, MP.t4); rc(g, px_ - 1, y - 2, 5, 3, '#cfc3a4'); rc(g, px_ - 1, y + 2, 5, 1, '#8a806a'); }   /* the lashings */
  for (let i = 0; i < 6; i++) { rc(g, x0 + 3 + i, y + 5 + i, 2, 1, MP.t2); rc(g, x1 - 4 - i, y + 5 + i, 2, 1, MP.t2); }   /* the knee braces */
}
/* the perched goblin's pick, raised (tell), or chopping down in an arc (k 0..1 the swing), on screen at his hands (x, y) facing left */
export function perchPick(g, x, y, phase, k) {
  if (phase === 'tell') { rc(g, x - 3, y - 18, 2, 14, MP.t3); rc(g, x - 8, y - 20, 9, 2, MP.i4); rc(g, x - 9, y - 19, 2, 3, MP.i2); return; }
  const a = -1.2 + k * 2.6, L = 16; for (let i = 3; i < L; i++) rc(g, x - Math.cos(a) * i - 1, y - 6 + Math.sin(a) * i, 2, 2, i > L - 4 ? MP.i5 : MP.t3);
  g.strokeStyle = 'rgba(255,230,200,0.5)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y - 6, L, Math.PI - 0.3, Math.PI + 1.8 * k, false); g.stroke();   /* the swish */
}

/* ================= 4. THE SWITCH: a red-handled bridge switch, and THE BRIDGE (a hinged span that swings down) ================= */
export function switchLever(g, x, y, set, flash, locked, time) {   /* y = the ground the stand is on; returns the y of the handle (the glint ring) */
  rc(g, x - 6, y - 4, 12, 4, MP.t1); rc(g, x - 6, y - 4, 12, 1, MP.t3);                                              /* the sleeper block */
  rc(g, x - 5, y - 12, 10, 9, MP.i1); rc(g, x - 5, y - 12, 10, 1, MP.i4); rc(g, x - 5, y - 12, 1, 9, MP.i3); rc(g, x + 4, y - 12, 1, 9, MP.i0); rc(g, x - 3, y - 10, 6, 1, MP.i0); rc(g, x - 1, y - 9, 2, 5, DARK);   /* the box, its slot */
  rc(g, x - 4, y - 11, 1, 1, MP.i5); rc(g, x + 3, y - 11, 1, 1, MP.i5);
  const a = set ? 1.15 : -0.55, L = 18, hx = x + Math.sin(a) * L, hy = y - 9 - Math.cos(a) * L;                          /* the arm: up and back = out, thrown over = laid */
  g.strokeStyle = flash ? '#ffffff' : MP.i5; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 9); g.lineTo(R(hx), R(hy)); g.stroke(); g.lineWidth = 1;
  const kc = flash ? '#ffffff' : '#d8261c'; g.fillStyle = kc; g.beginPath(); g.arc(R(hx), R(hy), 3.2, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(R(hx) - 2, R(hy) - 2, 2, 1);   /* the RED handle */
  const lens = locked ? '#6a6a6a' : set ? '#6fe08a' : '#ff5a4a'; rc(g, x - 2, y - 18, 4, 4, MP.i2); rc(g, x - 1, y - 17, 2, 2, lens);   /* a lamp: red = out, green = laid */
  add(g, () => { g.globalAlpha = 0.5; g.drawImage(glow(14, set ? '110,230,140' : '255,90,70'), x - 14, y - 17 - 14); });
  return R(hy);
}
/* THE BRIDGE: hinged at its near end (x). OUT: the span hangs down from the hinge (a broken plank, a snapped chain), ends broken; LAID: flat, rail on top. `k` 0 hanging .. 1 laid (it swings through
   the arc, bouncing a little at the end) */
export function bridge(g, x, w, y, set, time, k) {
  if (k === undefined) k = set ? 1 : 0;
  const ang = (1 - k) * (Math.PI / 2) - Math.sin(k * Math.PI) * 0.12 * (k > 0.7 ? 1 : 0);   /* 0 flat .. PI/2 hanging */
  rc(g, x - 3, y - 2, 4, 10, MP.i3); rc(g, x - 3, y - 2, 4, 1, MP.i5); rc(g, x - 2, y, 2, 2, MP.i1);          /* the hinge post */
  /* the far abutment: the broken end (while out) or the seat it lands on */
  for (let q = 0; q < 4; q++) rc(g, x + w + q * 2, y + 1 + q * 2, 3, 2, MP.t2); rc(g, x + w, y - 3, 6, 1, MP.i2); if (k < 1) { rc(g, x + w - 1, y + 2, 2, 5, MP.t1); rc(g, x + w + 1, y + 7, 3, 1, MP.t1); }
  g.save(); g.translate(x, y); g.rotate(ang);                                                                    /* the span, drawn flat then turned about the hinge */
  for (let i = 0; i < w; i += 4) rc(g, i, 1, 3, 3, i % 8 ? MP.t2 : MP.t3);                                     /* planks */
  rc(g, 0, -3, w, 1, MP.i4); rc(g, 0, -2, w, 1, MP.i2); rc(g, 0, 4, w, 1, MP.t0);                              /* the rail on the deck and the stringer */
  for (let i = 6; i < w - 2; i += 12) { rc(g, i, -1, 2, 1, MP.i5); }
  if (k < 1) { rc(g, w - 5, 3, 5, 2, MP.t1); rc(g, w - 2, 4, 2, 2, DARK); }                                    /* its free end splintered */
  g.restore();
  if (k < 1) { const sw = R(Math.sin(time * 2) * 2); rc(g, x + w - 6 + sw, y + 4, 1, 12, MP.i3); rc(g, x + w - 6 + sw, y + 16, 3, 1, MP.i4); }     /* a snapped chain swaying */
  if (k < 0.12 && Math.floor(time * 4) % 2) { rc(g, x + w - 2, y - 2, 2, 2, '#ff6b6b'); }
}
/* the dust off a bridge as it lands (t 0..1) */
export function bridgeDust(g, x, w, y, t) { g.globalAlpha = Math.max(0, 1 - t); for (let i = 0; i < 6; i++) rc(g, x + (i / 5) * w + (i % 2 ? 4 : -4), y - 4 - R(t * 10) - (i % 3), 3 + R(t * 3), 2, '#a89880'); g.globalAlpha = 1; }

/* ================= 5. THE FOES THAT COME TO YOUR LINE ================= */
/* THE SWINGING RIDER's boom and hook: a pole off his tub, the rope, the hook. x, y = his tub on screen; lineY = the rail he swings over. phase: 'tell' (hook up) | 'chop' (k 0..1 swinging down across the line) */
export function swingHook(g, x, y, lineY, phase, k, time) {
  rc(g, x - 12, y - 22, 2, 20, MP.i3); rc(g, x - 12, y - 22, 1, 20, MP.i5); rc(g, x - 22, y - 24, 12, 2, MP.i2); rc(g, x - 22, y - 24, 12, 1, MP.i4);   /* the boom */
  const hx0 = x - 21, hy0 = y - 22;
  if (phase === 'rest') { const hy = hy0 + 9; g.strokeStyle = '#cfc3a4'; g.beginPath(); g.moveTo(hx0, hy0); g.lineTo(hx0, hy); g.stroke(); hook(g, hx0, hy, 0.3); return; }
  if (phase === 'tell') { const hx = hx0 - 2 - R(Math.sin(time * 10)), hy = hy0 - 12; g.strokeStyle = '#cfc3a4'; g.beginPath(); g.moveTo(hx0, hy0); g.lineTo(hx, hy); g.stroke(); hook(g, hx, hy, -0.4); return; }
  const hx = hx0 - 12 * k - 4, hy = hy0 + (lineY - 14 - hy0) * Math.sin(Math.min(1, k * 1.15) * Math.PI / 2); g.strokeStyle = '#cfc3a4'; g.beginPath(); g.moveTo(hx0, hy0); g.lineTo(R(hx), R(hy)); g.stroke(); hook(g, R(hx), R(hy), 0.6);
  g.fillStyle = 'rgba(255,200,170,0.35)'; for (let i = 1; i < 5; i++) g.fillRect(R(hx + i * 3), R(hy - i * 4), 2, 1);
}
function hook(g, x, y, a) { g.strokeStyle = MP.i5; g.lineWidth = 2; g.beginPath(); g.arc(x, y + 4, 4, -0.6 + a, 3.4 + a); g.stroke(); g.lineWidth = 1; rc(g, x - 1, y - 3, 2, 4, MP.i4); }
/* THE LEAPER: where he will land - a dark shadow ellipse closing in, a dust ring; (x, y) on the rail; k 0..1 */
export function leapShadow(g, x, y, k, time) {
  const rx = R(13 - 5 * k); g.fillStyle = 'rgba(0,0,0,' + (0.25 + 0.4 * k).toFixed(2) + ')'; g.beginPath(); g.ellipse(x, y - 1, rx, 3, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, rx + 3, 4, 0, 0, Math.PI * 2); g.stroke();
}
/* the landing dust of a leaper / a bridge (t 0..1) */
export function landDust(g, x, y, t) { g.globalAlpha = Math.max(0, 0.8 - t); for (let i = -2; i <= 2; i++) rc(g, x + i * (3 + R(t * 9)), y - 2 - R(t * 6) - (Math.abs(i) === 1 ? 1 : 0), 3, 2, '#b8a890'); g.globalAlpha = 1; }
/* the empty cart rolling on under the boarded hero: speed streaks off its tail */
export function cartStreaks(g, x, y, time) { for (let i = 0; i < 5; i++) { const t = (time * 5 + i * 0.21) % 1; rc(g, x - 16 - t * 38, y - 8 + (i % 3) * 3, 8 + (i % 2) * 5, 1, 'rgba(200,190,170,' + (0.5 * (1 - t)).toFixed(2) + ')'); } }
/* the leap's tuck trail: a faint streak behind him */
export function leapTrail(g, x, y, face) { g.globalAlpha = 0.35; for (let i = 1; i <= 4; i++) rc(g, x - face * i * 4, y - 8 + i, 3, 1, '#e8dcc0'); g.globalAlpha = 1; }

/* ================= 6. THE GREAT DRILL 3 ================= */
/* THE POINTS-LEVER POST: a tall trackside post on a sleeper footing, a hazard-striped shaft, a big red hand-lever on a gate-head that swings DOWN when thrown, a lamp on top (gold = to the gears) */
export function pointsPost(g, px_, topY, botY, thrown, time) {
  rc(g, px_ - 3, topY, 6, botY - topY, MP.i1); rc(g, px_ - 3, topY, 1, botY - topY, MP.i3); rc(g, px_ + 2, topY, 1, botY - topY, MP.i0);
  for (let y = topY + 8; y < botY - 8; y += 12) { rc(g, px_ - 3, y, 6, 4, HAZ[0]); rc(g, px_ - 1, y, 2, 4, HAZ[1]); }
  rc(g, px_ - 9, botY - 7, 18, 7, MP.t1); rc(g, px_ - 9, botY - 7, 18, 1, MP.t3); rc(g, px_ - 6, botY - 8, 12, 2, MP.i3);
  rc(g, px_ - 9, topY - 14, 18, 16, MP.i1); rc(g, px_ - 9, topY - 14, 18, 1, MP.i4); rc(g, px_ - 9, topY - 14, 1, 16, MP.i3); rc(g, px_ + 8, topY - 14, 1, 16, MP.i0);   /* the gate-head */
  const c = thrown ? '#ffd36b' : '#7fc4e0'; g.fillStyle = c; g.beginPath(); g.arc(px_, topY - 9, 4.5, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(px_ - 3, topY - 12, 2, 2);
  const a = thrown ? 2.2 : 0.55, hx = px_ + Math.sin(a) * 15, hy = topY - 2 - Math.cos(a) * 15;                          /* the hand-lever: UP = waiting, DOWN = thrown */
  g.strokeStyle = MP.i5; g.lineWidth = 3; g.beginPath(); g.moveTo(px_, topY - 2); g.lineTo(R(hx), R(hy)); g.stroke(); g.lineWidth = 1; g.fillStyle = '#d8261c'; g.beginPath(); g.arc(R(hx), R(hy), 4, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(R(hx) - 2, R(hy) - 2, 2, 1);
  add(g, () => { g.globalAlpha = 0.5 + 0.1 * Math.sin(time * 5); g.drawImage(glow(26, thrown ? '255,200,80' : '120,190,255'), px_ - 26, topY - 9 - 26); });
}
/* THE DUMP: ore pouring out of the chute into the bare gears (rx = the gear housing's left edge, the housing top y); k 0..1 over the pour. Chunks fall, dust rises. */
export function oreDump(g, x, y0, y1, time) {
  rc(g, x - 8, y0 - 4, 16, 3, MP.i3); rc(g, x - 8, y0 - 4, 16, 1, MP.i5);   /* the chute's lip, tipped */
  for (let i = 0; i < 14; i++) { const t = (time * 2.2 + i * 0.071) % 1, cx_ = x - 5 + ((i * 7) % 11) + R(Math.sin(i + time * 3) * 1.5), cy_ = y0 + t * (y1 - y0); rc(g, cx_, cy_, 2 + (i % 2), 2, i % 4 === 0 ? MP.go2 : i % 3 === 0 ? MP.cu2 : '#8a5a38'); }
  for (let i = 0; i < 6; i++) { const t = (time * 1.6 + i * 0.17) % 1; g.fillStyle = 'rgba(190,170,140,' + (0.45 * (1 - t)).toFixed(2) + ')'; g.fillRect(R(x - 12 + i * 4 + t * 4), R(y1 - 4 - t * 14), 4 + R(t * 3), 3); }
}
/* THE DYNAMITE: a bundle of red sticks, tied with a band, a fuse that fizzes (a spark at its tip). Drawn at (x, y); tilt turns with `spin`. */
export function dynamite(g, x, y, time, spin) {
  g.save(); g.translate(x, y); g.rotate(spin || 0);
  for (let i = -1; i <= 1; i++) { rc(g, -3 + i * 3, -5, 3, 9, '#b8281c'); rc(g, -3 + i * 3, -5, 1, 9, '#e8503c'); rc(g, -3 + i * 3, -5, 3, 1, '#7a1a10'); }
  rc(g, -5, -1, 11, 2, '#e8dcc0'); rc(g, -5, -1, 11, 1, '#fff6e0');   /* the band */
  rc(g, 0, -9, 1, 4, '#3a2a1a'); rc(g, 1, -10, 1, 2, '#3a2a1a');       /* the fuse */
  if (Math.floor(time * 24) % 2) rc(g, 1, -12, 2, 2, '#ffe49a'); else rc(g, 2, -11, 1, 1, '#ff9a3c');
  g.restore();
  add(g, () => { g.globalAlpha = 0.4; g.drawImage(glow(10, '255,170,60'), R(x) - 8, R(y) - 22); });
}
/* THE DRIVER'S THROW: an arm out of the cab window (x, y = the window's centre), cocked back (k 0) .. thrown (k 1), holding the stick */
export function driverArm(g, x, y, k, time) {
  const a = -2.3 + k * 2.0, L = 10, hx = x - Math.cos(a) * L - 4, hy = y + Math.sin(a) * L; g.strokeStyle = '#4a7a30'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 2, y + 4); g.lineTo(R(hx), R(hy)); g.stroke(); g.lineWidth = 1;
  g.fillStyle = '#6aa048'; g.fillRect(R(hx) - 2, R(hy) - 2, 4, 4); if (k < 1) dynamite(g, R(hx) - 2, R(hy) - 5, time, 0.3);
}
/* THE CUTTER (the spin-up lunge): a boom out of the rig's rear and a spinning saw-head on it, at head height. (x, y) the head's centre; len the boom; on = spinning/along the line; k the wind-up 0..1 */
export function cutter(g, rx, y, len, on, k, time) {
  rc(g, rx - len, y - 2, len, 4, MP.i2); rc(g, rx - len, y - 2, len, 1, MP.i4); for (let x = rx - len + 4; x < rx - 3; x += 10) rc(g, x, y - 1, 2, 3, MP.i5);   /* the boom */
  const hx = rx - len - 2, a = time * (on ? 70 : 12 + 40 * (k || 0)); g.save(); g.translate(hx, y); const r = 11;
  g.fillStyle = '#2a2830'; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill(); g.fillStyle = '#9aa4b4'; g.beginPath(); g.arc(0, 0, r - 2, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 12; i++) { const t = a + i * Math.PI / 6; g.fillStyle = i % 2 ? '#e8e8f4' : '#585866'; g.fillRect(R(Math.cos(t) * (r - 1)) - 1, R(Math.sin(t) * (r - 1)) - 1, 3, 3); }
  g.fillStyle = '#4a5260'; g.beginPath(); g.arc(0, 0, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = MP.i5; g.fillRect(-1, -1, 2, 2); g.restore();
  for (let i = 0; i < 7; i++) { const t = (time * 7 + i / 7) % 1; rc(g, hx - 4 - t * 16, y - 9 + (i * 5) % 18 - t * 3, 2, 1, i % 2 ? MP.l3 : MP.go2); }
  add(g, () => { g.globalAlpha = on ? 0.55 : 0.25 + 0.3 * (k || 0); g.drawImage(glow(26, '255,190,90'), hx - 26, y - 26); });
}
/* THE HOOK AND CHAIN: (x0, y0) the rig's launcher, (x1, y1) the hook; links along the line; swinging when there is no target. */
export function chainHook(g, x0, y0, x1, y1, time, taut) {
  const n = Math.max(2, Math.floor(Math.hypot(x1 - x0, y1 - y0) / 4)); for (let i = 0; i <= n; i++) { const t = i / n, sag = taut ? 0 : Math.sin(t * Math.PI) * 5; const lx = x0 + (x1 - x0) * t, ly = y0 + (y1 - y0) * t + sag; rc(g, lx - 1, ly - 1, i % 2 ? 3 : 2, i % 2 ? 2 : 3, i % 2 ? MP.i4 : MP.i3); }
  g.strokeStyle = '#d8e0ec'; g.lineWidth = 2; g.beginPath(); g.arc(R(x1), R(y1) + 1, 4, -0.8, 3.2); g.stroke(); g.lineWidth = 1; rc(g, x1 + 2, y1 - 5, 2, 3, MP.i5);
  rc(g, x0 - 4, y0 - 3, 6, 6, MP.i1); rc(g, x0 - 4, y0 - 3, 6, 1, MP.i4);                                          /* the launcher */
}
/* ROOF COLLAPSE rubble: a heap that has come down (x centre, y the line, w, k 0..1 the pile growing), with a dust cloud above */
export function rubble(g, x, y, w, k, time) {
  const h = R(3 + 9 * k); for (let i = 0; i < w; i += 5) { const ph = h - ((i * 7) % 5) - Math.abs(i - w / 2) * 0.18; if (ph > 0) { rc(g, x - w / 2 + i, y - ph, 5, ph, (i / 5) & 1 ? MP.r4 : MP.r5); rc(g, x - w / 2 + i, y - ph, 5, 1, MP.r6); } }
  for (let i = 0; i < 3; i++) rc(g, x - w / 2 + 4 + i * 11, y - h + 2, 3, 2, MP.go2);
  for (let i = 0; i < 5; i++) { const t = (time * 0.9 + i * 0.2) % 1; g.fillStyle = 'rgba(150,135,115,' + (0.4 * (1 - t) * k).toFixed(2) + ')'; g.fillRect(R(x - w / 2 + i * w / 5 + Math.sin(i + time) * 3), R(y - h - t * 22), 8 + R(t * 6), 6); }
}
/* THE P3 GOUGES: a scar torn in the floor by the drill (x, y, r) */
export function gouge(g, x, y, r) { rc(g, x - r, y - 1, r * 2, 2, MP.r0); for (let i = -r; i < r; i += 4) rc(g, x + i, y - 2 - ((i * 3) & 1), 3, 1, MP.r5); rc(g, x - r + 2, y + 1, r * 2 - 4, 1, MP.r2); }
