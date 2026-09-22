// src/redraw/foes_v2.js — THE REDRAW PASS (docs/animation-audit.md): the foes met most whose animation is thinnest, redrawn. Not wired in.
// THE CONTRACT WITH THE GAME: every set keeps its old frame indices meaning what they meant (main.js picks them: see FRAMES_V2), its
// canvas anchor (ax/ay) and its hit box (w/h), so a set drops in where the old one was; the NEW frames (a hurt, a death, more steps)
// are appended after the old ones, and FRAMES_V2 says which, and the one line each needs in main.js's frame pick to use them.
// shore.js's pack(): R (facing right), L (the flip), white.{R,L} (the hit flash), ax, ay, w, h. px.js primitives only.
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';
const pack = (R, ax, ay, w, h) => ({ R, L: R.map(flipX), white: { R: R.map(c => whiten(c)), L: R.map(c => flipX(whiten(c))) }, ax, ay, w, h });
const frames = (W, H, list) => list.map(fn => { const [c, g] = canvas(W, H); fn(g); outline(c, OUT); return c; });

/* ================= THE BAT (16x10 -> 18x12; ax 8 ay 9, box 10x6) =================
   old: 0 hang, 1-2 flap.  new: 3 flap (wings level: a three-beat stroke 1-3-2), 4 hurt (tumbling), 5 death (wings folded, falling) */
export function bakeBatV2() {
  const W = 18, H = 12, cx = 8, cy = 6, C = { b: '#3a2a44', bL: '#5a4468', m: '#6a3a58', mL: '#8a5270', eye: '#ff4a4a', ear: '#2a1e32', fang: '#f0e8e0' };
  const body = (g, dy = 0) => { ellipse(g, cx, cy + dy, 2.6, 3, C.b); px(g, cx - 1, cy - 1 + dy, C.bL); rect(g, cx - 2, cy - 4 + dy, 1, 2, C.ear); rect(g, cx + 2, cy - 4 + dy, 1, 2, C.ear);
    px(g, cx - 1, cy - 1 + dy, C.eye); px(g, cx + 1, cy - 1 + dy, C.eye); px(g, cx, cy + 1 + dy, C.fang); };
  /* a wing: from the shoulder out to a tip, with two finger-bones and the membrane scalloped between them; `lift` -1 down .. 1 up */
  const wing = (g, side, lift, dy = 0) => { const sx = cx + side * 2, sy = cy - 1 + dy, tx = cx + side * 8, ty = cy - 1 - Math.round(lift * 4) + dy, mx = cx + side * 5, my = cy - Math.round(lift * 3) + dy;
    fillPoly(g, [[sx, sy], [tx, ty], [tx - side, ty + 3], [mx, my + 3], [sx, sy + 3]], C.m); line(g, sx, sy, tx, ty, C.bL); line(g, mx, my, mx - side, my + 3, C.mL); px(g, tx, ty, C.b); };
  const F = frames(W, H, [
    g => { body(g, 2); for (const s of [-1, 1]) { line(g, cx + s * 2, cy, cx + s * 3, cy + 5, C.m); } rect(g, cx - 1, 0, 3, 2, C.b); },   // 0 HANG: upside down... wrapped, hung from its claws
    g => { wing(g, -1, 1); wing(g, 1, 1); body(g); },                                                              // 1 flap: up
    g => { wing(g, -1, -1); wing(g, 1, -1); body(g); },                                                            // 2 flap: down
    g => { wing(g, -1, 0); wing(g, 1, 0); body(g); },                                                              // 3 flap: level
    g => { wing(g, -1, 1); wing(g, 1, -1); body(g, 1); px(g, cx - 1, cy, '#ffffff'); px(g, cx + 1, cy, '#ffffff'); },   // 4 HURT: knocked askew, eyes wide
    g => { ellipse(g, cx, cy + 2, 3, 3, C.b); line(g, cx - 3, cy, cx - 2, cy + 5, C.m); line(g, cx + 3, cy, cx + 2, cy + 5, C.m); px(g, cx - 1, cy + 1, '#808080'); px(g, cx + 1, cy + 1, '#808080'); },   // 5 DEATH: folded, falling
  ]);
  return pack(F, 8, 9, 10, 6);
}

/* ================= THE DEAD: ZOMBIE and the tower's APPRENTICE (26x32, ax 13 ay 32, box 26x32; buried-dead.js deadFrame) =================
   old: 0 stand, 1 walk, 2 flung (bodyFly), 3 throw/body TELL (arms up), 4 nova TELL (arms spread, glowing), 5 stuck / open (sunk, dazed),
   6 buried (a mound). new: 7 walk (the other foot), 8 hurt (head snapped back), 9 death (crumpling) */
export function bakeDeadV2(kind = 'zombie') {
  const W = 26, H = 32, X = 13, F = 31, app = kind === 'apprentice';
  const C = app ? { skin: '#9aa88a', skinD: '#6e7a62', cloth: '#4a2a7a', clothL: '#7a4ab8', clothD: '#2a1040', eye: '#c8ff9a', belt: '#8a6a3a', dirt: '#5e5040' }
    : { skin: '#7a9a5a', skinD: '#56703e', cloth: '#6a5a44', clothL: '#8a7a5a', clothD: '#443a2c', eye: '#f0e060', belt: '#4a3a2a', dirt: '#5e5040' };
  /* one body, posed: lean (px forward), step (-1/0/1 which foot forward), arms: 'reach' | 'up' | 'spread' | 'down' | 'back', drop (px sunk) */
  const body = (g, { lean = 0, step = 0, arms = 'reach', drop = 0, head = 0, glow = false } = {}) => {
    const hip = F - 9 + drop, sh = hip - 9, x = X + lean;
    // legs (or the robe's hem for the apprentice)
    if (app) { fillPoly(g, [[x - 5, sh + 4], [x + 5, sh + 4], [x + 7, F + drop - 1], [x - 7, F + drop - 1]], C.cloth); for (let k = -5; k <= 5; k += 3) px(g, x + k, F + drop - 1, C.clothD); rect(g, x - 3 + step * 2, F + drop - 1, 3, 1, C.skinD); line(g, x + 4, sh + 5, x + 6, F + drop - 2, C.clothL); }
    else { for (const s of [-1, 1]) { const fx = x + s * 3 + (s === step ? 2 : s === -step ? -1 : 0); line(g, x + s * 2, hip, fx, F + drop - 1, C.clothD); line(g, x + s * 2 + 1, hip, fx + 1, F + drop - 1, C.clothD); rect(g, fx - 1, F + drop - 1, 3, 1, C.skinD); }
      rect(g, x - 4, hip - 2, 9, 3, C.cloth); }
    // the torso: hunched forward, the shirt torn (or the robe, a satchel strap across it)
    fillPoly(g, [[x - 5, sh + 1], [x + 5, sh], [x + 5, hip], [x - 5, hip]], C.cloth); rect(g, x - 5, sh + 1, 1, hip - sh - 1, C.clothD); rect(g, x + 4, sh, 1, hip - sh, C.clothL);
    if (app) { line(g, x - 4, sh + 1, x + 4, hip - 1, C.belt); rect(g, x + 3, hip - 3, 4, 4, C.belt); } else { rect(g, x - 1, sh + 4, 3, 2, C.skin); px(g, x + 2, sh + 7, C.skinD); rect(g, x - 5, hip - 3, 10, 1, C.belt); }
    // the arms
    const arm = (s, ex, ey) => { line(g, x + s * 5, sh + 2, ex, ey, app ? C.cloth : C.skin); line(g, x + s * 5, sh + 3, ex, ey + 1, app ? C.clothD : C.skinD); rect(g, ex - 1, ey - 1, 2, 2, C.skin); };
    if (arms === 'reach') { arm(-1, x + 8, sh + 5); arm(1, x + 10, sh + 3); }
    else if (arms === 'up') { arm(-1, x - 2, sh - 9); arm(1, x + 3, sh - 10); }
    else if (arms === 'spread') { arm(-1, x - 11, sh - 3); arm(1, x + 11, sh - 3); if (glow) for (const s of [-1, 1]) { circle(g, x + s * 11, sh - 4, 2, '#c8ff9a'); px(g, x + s * 11, sh - 4, '#ffffff'); } }
    else if (arms === 'down') { arm(-1, x - 6, hip + 2); arm(1, x + 6, hip + 2); }
    else if (arms === 'back') { arm(-1, x - 8, sh - 2); arm(1, x - 3, sh + 8); }
    // the head: slack-jawed, one eye brighter; the apprentice's hood over his
    const hx = x + 2 + head, hy = sh - 5;
    ellipse(g, hx, hy, 4, 4.4, C.skin); rect(g, hx - 3, hy + 2, 6, 2, C.skinD); px(g, hx + 1, hy - 1, C.eye); px(g, hx + 3, hy - 1, C.skinD); rect(g, hx, hy + 3, 3, 1, '#2a1a1a');
    if (app) { fillPoly(g, [[hx - 5, hy + 2], [hx - 4, hy - 5], [hx + 1, hy - 7], [hx + 5, hy - 4], [hx + 5, hy - 1], [hx + 1, hy - 3], [hx - 2, hy + 3]], C.cloth); line(g, hx - 4, hy - 5, hx + 1, hy - 7, C.clothL); }
    else { px(g, hx - 2, hy - 4, C.clothD); px(g, hx, hy - 5, C.clothD); }
  };
  const Fr = frames(W, H, [
    g => body(g, {}),                                                                  // 0 stand (arms reaching)
    g => body(g, { step: 1, lean: 1 }),                                                // 1 walk
    g => body(g, { arms: 'back', lean: -3, head: -2 }),                                // 2 FLUNG (bodyFly): thrown back, limbs trailing
    g => body(g, { arms: 'up', lean: -1 }),                                            // 3 THROW / BODY TELL: arms up over the head
    g => body(g, { arms: 'spread', glow: true }),                                      // 4 NOVA TELL: arms flung wide, the grave-light in the hands
    g => body(g, { arms: 'down', drop: 6, head: 1 }),                                  // 5 STUCK / OPEN: sunk to the knees, arms hanging
    g => { ellipse(g, X, F - 1, 11, 3, C.dirt); rect(g, X - 9, F - 1, 18, 1, '#3e3428'); rect(g, X + 2, F - 4, 3, 2, C.skin); px(g, X + 3, F - 5, C.skinD); },   // 6 BURIED: a mound, a hand out of it
    g => body(g, { step: -1, lean: 1 }),                                               // 7 walk, the other foot (new)
    g => body(g, { arms: 'reach', lean: -2, head: -3 }),                               // 8 HURT: head snapped back (new)
    g => { body(g, { arms: 'down', drop: 8, head: 1, lean: 0 }); },                   // 9 DEATH: crumpling (new: then 6's mound, or the corpse linger)
  ]);
  return pack(Fr, X, H, 26, 32);
}

/* ================= THE WIGHT (12x16 -> 14x18; ax 6 ay 16, box 8x13) =================
   old: 0-3 drift (one cycle). new: 4 hurt (torn aside), 5 death (unravelling) */
export function bakeWightV2() {
  const W = 14, H = 18, cx = 6, C = { s: '#d8e0d4', sL: '#f4f8f0', sD: '#98a89a', eye: '#1a2420', glow: '#9affd0' };
  const shroud = (g, ph, tear = 0) => { const top = 2;
    ellipse(g, cx, top + 4, 4.4, 4.4, C.s); px(g, cx - 2, top + 2, C.sL);
    for (let y = top + 6; y < H - 2; y++) { const w = 4 + Math.round(Math.sin(y * 0.6 + ph) * 1.2) + ((y - top) >> 3); rect(g, cx - w + tear, y, w * 2 - tear, 1, y % 3 ? C.s : C.sD); }
    for (let k = 0; k < 4; k++) { const x = cx - 4 + k * 3 + Math.round(Math.sin(ph + k) * 1), yb = H - 2 + ((k + Math.round(ph)) % 2); line(g, x, H - 4, x + (k % 2 ? 1 : -1), yb, C.sD); }   // the tatters, streaming
    rect(g, cx - 2, top + 3, 1, 2, C.eye); rect(g, cx + 1, top + 3, 1, 2, C.eye); px(g, cx - 2, top + 3, C.glow); px(g, cx + 1, top + 3, C.glow); rect(g, cx - 1, top + 6, 2, 1, C.eye); };
  const F = frames(W, H, [0, 1.5, 3, 4.5].map(ph => g => shroud(g, ph)).concat([
    g => { shroud(g, 1, 3); line(g, cx - 5, 8, cx - 2, 12, C.sL); },                // 4 HURT: torn through
    g => { for (let y = 4; y < H - 2; y += 2) rect(g, cx - 4 + (y % 4), y, 3 + (y % 3), 1, y % 4 ? C.s : C.sD); px(g, cx - 1, 5, C.glow); },   // 5 DEATH: coming apart in strips
  ]));
  return pack(F, 6, 16, 8, 13);
}

/* ================= THE THIEF (12x16 -> 16x18; ax 7 ay 17, box 8x11) =================
   old: 0 run A / stand, 1 run B, 2 a glance back. new: 3 run C, 4 run D (a four-beat run: 0-3-1-4), 5 hurt (the sack flying) */
export function bakeThiefV2() {
  const W = 16, H = 18, x0 = 7, F = 17, C = { skin: '#6a9a3a', skinD: '#4a7028', hood: '#5a3a24', hoodL: '#7a5434', scarf: '#b83a2a', sack: '#b89a6a', sackD: '#8a6e44', eye: '#ffe060', leg: '#3a2a1e' };
  const gob = (g, { lean = 0, legA = 0, legB = 0, look = 1, sack = 0, arm = 0 } = {}) => {
    const x = x0 + lean;
    line(g, x - 1, F - 5, x - 2 + legA, F - 1, C.leg); line(g, x + 1, F - 5, x + 2 + legB, F - 1, C.leg); px(g, x - 2 + legA, F - 1, C.hood); px(g, x + 2 + legB, F - 1, C.hood);
    ellipse(g, x, F - 7, 3, 3, C.hood); rect(g, x - 3, F - 9, 6, 1, C.scarf);                                               // the body in a short cloak, a red scarf
    ellipse(g, x - 4 + sack, F - 10, 3, 3.4, C.sack); px(g, x - 5 + sack, F - 12, C.sackD); line(g, x - 2, F - 9, x - 3 + sack, F - 12, C.sackD);   // the sack over his shoulder
    line(g, x + 2, F - 8, x + 4 + arm, F - 6 - (arm > 0 ? 2 : 0), C.skin);
    ellipse(g, x + look, F - 13, 3, 2.6, C.skin); fillPoly(g, [[x - 3 + look, F - 13], [x + look, F - 17], [x + 3 + look, F - 13]], C.hood); line(g, x - 3 + look, F - 13, x + look, F - 17, C.hoodL);   // pointed hood
    px(g, x + look + (look > 0 ? 1 : -1), F - 13, C.eye); px(g, x + look + (look > 0 ? 3 : -3), F - 12, C.skinD); };                             // a big ear sticking out
  const Fr = frames(W, H, [
    g => gob(g, { lean: 1, legA: -1, legB: 2 }), g => gob(g, { lean: 1, legA: 2, legB: -1 }), g => gob(g, { look: -2, sack: 1 }),
    g => gob(g, { lean: 2, legA: 0, legB: 0, arm: 1 }), g => gob(g, { lean: 2, legA: 1, legB: 1, arm: -1 }),
    g => { gob(g, { lean: -2, look: -1, arm: 2 }); ellipse(g, 12, 3, 2.5, 2.5, C.sack); px(g, 12, 2, '#e8d8a0'); },       // 5 HURT: knocked back, the sack flying (a coin out of it)
  ]);
  return pack(Fr, 7, 17, 8, 11);
}

/* ================= THE HEDGE KNIGHT (20x19 -> 24x22; ax 11 ay 21, box 12x16) =================
   old: 0 stand, 1 walk, 2 SWING TELL (!), 3 swing, 4 leap (tell and air). new: 5 walk (the other step), 6 hurt (driven back behind the shield) */
export function bakeHedgeKnightV2() {
  const W = 24, H = 22, x0 = 11, F = 21, C = { steel: '#9aa4b0', steelL: '#c8d0da', steelD: '#6a7480', tab: '#a83a2a', cross: '#e8c24a', leaf: '#5a8a3a', leafL: '#86b454', plume: '#4a7a30', blade: '#e0e6ee', hilt: '#8a6a3a', shield: '#6a4a2a' };
  const knight = (g, { step = 0, sword = 'rest', crouch = 0, lean = 0, shieldUp = false } = {}) => {
    const x = x0 + lean, top = 4 + crouch;
    for (const s of [-1, 1]) { const fx = x + s * 2 + (s === step ? 2 : 0); rect(g, fx - 1, F - 6 + Math.min(crouch, 2), 2, 6 - Math.min(crouch, 2), C.steelD); rect(g, fx - 1, F - 1, 3, 1, C.steelD); }
    rect(g, x - 4, top + 5, 8, 9 - Math.min(crouch, 2), C.steel); rect(g, x - 3, top + 6, 6, 7, C.tab); rect(g, x - 1, top + 7, 2, 5, C.cross); rect(g, x - 2, top + 8, 4, 2, C.cross);   // tabard with its gold cross
    rect(g, x - 3, top, 7, 6, C.steel); rect(g, x - 3, top, 7, 1, C.steelL); rect(g, x, top + 2, 4, 1, '#1a1e24'); for (let k = 0; k < 3; k++) px(g, x - 3 + k * 2, top - 1 - (k % 2), k % 2 ? C.leafL : C.leaf);   // helm, visor slit, a crest of hedge leaves
    fillPoly(g, [[x - 3, top], [x - 7, top - 3], [x - 5, top + 2]], C.plume);
    const sy = shieldUp ? top + 1 : top + 6; rect(g, x - 8, sy, 5, 9, C.shield); rect(g, x - 8, sy, 5, 1, C.steelL); rect(g, x - 7, sy + 3, 3, 3, C.leaf);   // the round-topped hedge shield
    if (sword === 'rest') { line(g, x + 4, top + 7, x + 9, top + 12, C.blade); rect(g, x + 3, top + 6, 2, 2, C.hilt); }
    else if (sword === 'high') { line(g, x + 3, top + 5, x + 1, top - 6, C.blade); line(g, x + 4, top + 5, x + 2, top - 6, C.steelL); rect(g, x + 2, top + 4, 3, 2, C.hilt); px(g, x + 1, top - 6, '#ffffff'); }
    else if (sword === 'cut') { line(g, x + 4, top + 7, x + 12, top + 9, C.blade); line(g, x + 4, top + 8, x + 12, top + 10, C.steelL); rect(g, x + 3, top + 6, 2, 2, C.hilt); for (let k = 0; k < 4; k++) px(g, x + 6 + k * 2, top + 3 + k, '#ffffff'); }
    else if (sword === 'down') { line(g, x + 4, top + 7, x + 7, F - 1, C.blade); rect(g, x + 3, top + 6, 2, 2, C.hilt); } };
  const Fr = frames(W, H, [
    g => knight(g, {}), g => knight(g, { step: 1, lean: 1 }),
    g => knight(g, { sword: 'high', lean: -1 }),                                       // 2 SWING TELL: blade raised high, the edge catching the light
    g => knight(g, { sword: 'cut', lean: 2 }),                                         // 3 the cut, driven through
    g => knight(g, { sword: 'down', crouch: 3 }),                                      // 4 LEAP: gathered low, blade down to drive in
    g => knight(g, { step: -1, lean: 1 }),                                             // 5 walk, the other step (new)
    g => knight(g, { shieldUp: true, lean: -3 }),                                      // 6 HURT: driven back behind the shield (new)
  ]);
  return pack(Fr, 11, 21, 12, 16);
}

/* ================= THE CROW (15x9 -> 17x11; ax 8 ay 6, box 11x5) =================
   old: 0-2 flap cycle. new: 3 glide (wings flat), 4 hurt (feathers out) */
export function bakeCrowV2() {
  const W = 17, H = 11, C = { b: '#1e1a24', bL: '#3a3444', gloss: '#4a4a6a', beak: '#8a7a4a', eye: '#ffb84a' };
  const crow = (g, lift, extra) => { ellipse(g, 8, 6, 4, 2.2, C.b); px(g, 6, 5, C.gloss); circle(g, 12, 5, 1.8, C.b); px(g, 12, 4, C.eye); line(g, 13, 5, 15, 6, C.beak);
    fillPoly(g, [[4, 6], [0, 5], [1, 7], [4, 7]], C.b);                                                                             // the tail
    const wy = 5 - Math.round(lift * 4); fillPoly(g, [[6, 5], [9, 5], [7 - Math.round(lift), wy], [3, wy + 1]], C.bL); for (let k = 0; k < 3; k++) px(g, 3 + k, wy + 1 + (k % 2), C.b);   // the wing, fingered
    extra && extra(g); };
  const F = frames(W, H, [1, 0, -1].map(l => g => crow(g, l)).concat([g => crow(g, 0.2), g => crow(g, 0.6, g => { for (const [x, y] of [[2, 1], [10, 0], [14, 2]]) px(g, x, y, C.bL); })]));
  return pack(F, 8, 6, 11, 5);
}

/* ================= THE PETREL (24x16; ax 11 ay 15, box 10x8) =================
   old: 0-1 flap, 2 DIVE (wings swept back, a dart), 3 climb (beating up). new: 4 hurt */
export function bakePetrelV2() {
  const W = 24, H = 16, C = { b: '#3a4450', bL: '#5a6874', belly: '#d8dce0', beak: '#e8b84a', eye: '#101418', tip: '#1e242a' };
  const bird = (g, lift, pitch = 0, extra) => { const cy = 9 + pitch;
    ellipse(g, 11, cy, 5, 2.4, C.b); rect(g, 8, cy + 1, 7, 1, C.belly); circle(g, 16, cy - 1 - pitch, 2, C.b); px(g, 17, cy - 2 - pitch, C.eye); line(g, 18, cy - 1 - pitch, 21, cy - pitch, C.beak);
    fillPoly(g, [[6, cy], [2, cy - 1], [3, cy + 2]], C.b);
    const wy = cy - 1 - Math.round(lift * 6); fillPoly(g, [[9, cy - 1], [13, cy - 1], [12 - Math.round(lift * 2), wy], [4, wy - (lift > 0 ? 1 : 0)]], C.bL); line(g, 4, wy, 7, wy, C.tip);
    extra && extra(g); };
  const F = frames(W, H, [
    g => bird(g, 1), g => bird(g, -0.6),
    g => { const cy = 9; ellipse(g, 12, cy, 6, 1.8, C.b); rect(g, 8, cy + 1, 8, 1, C.belly); fillPoly(g, [[10, cy - 1], [4, cy - 3], [6, cy]], C.bL); circle(g, 18, cy, 1.8, C.b); px(g, 19, cy - 1, C.eye); line(g, 19, cy, 23, cy + 1, C.beak); for (const x of [2, 4]) px(g, x, cy - 3, '#c8d8e8'); },   // 2 DIVE: a dart, streaming
    g => bird(g, 1.2, 2), g => bird(g, 0.3, 1, g => { for (const [x, y] of [[5, 2], [14, 1], [20, 4]]) px(g, x, y, C.bL); }),
  ]);
  return pack(F, 11, 15, 10, 8);
}

/* ================= THE WASP (14x9 -> 16x11; ax 8 ay 8, box 10x7) =================
   old: 0-2 buzz, 3 hurt. (Its sting tell is in main.js's own glyph.) redrawn: a readable abdomen, bands, a stinger that SHOWS, wings a blur */
export function bakeWaspV2() {
  const W = 16, H = 11, C = { y: '#f0c030', yD: '#b88a18', k: '#1e1a14', w: '#e8f0ff', wD: '#b8c8e0', sting: '#2a2014', eye: '#8a2a2a' };
  const wasp = (g, wing, extra) => { ellipse(g, 5, 6, 3.4, 2.4, C.y); rect(g, 3, 4, 1, 5, C.k); rect(g, 6, 4, 1, 5, C.k); line(g, 1, 7, 0, 8, C.sting);   // abdomen, banded, the sting out behind
    ellipse(g, 9, 5, 1.8, 1.6, C.yD); circle(g, 12, 4, 1.8, C.k); px(g, 13, 4, C.eye); line(g, 12, 2, 14, 0, C.k);
    const wy = [0, 1, 2][wing]; fillPoly(g, [[8, 4], [5, wy], [10, wy + 1]], C.w); if (wing !== 1) fillPoly(g, [[9, 4], [8, wy + 1], [12, wy + 1]], C.wD);
    for (let k = 0; k < 3; k++) line(g, 8 + k, 6, 7 + k * 2, 9, C.k); extra && extra(g); };
  const F = frames(W, H, [0, 1, 2].map(k => g => wasp(g, k)).concat([g => wasp(g, 1, g => { px(g, 13, 3, '#ffffff'); px(g, 3, 2, C.yD); })]));
  return pack(F, 8, 8, 10, 7);
}

/* ================= THE SNUFFER (14x14 -> 16x16; ax 7 ay 15, box 10x14) =================
   old: 0 stand, 1 walk, 2 SNUFF TELL (the snuffer's cup raised to a lamp), 3 SWIPE (tell and blow). new: 4 walk (other step), 5 hurt */
export function bakeSnufferV2() {
  const W = 16, H = 16, x0 = 7, F = 15, C = { skin: '#4a7a3a', skinD: '#2e5024', robe: '#2a2a3a', robeL: '#44445a', pole: '#8a6a3a', cup: '#c8a040', eye: '#ffd060', smoke: '#8a8a9a' };
  const gob = (g, { step = 0, pole = 'rest', lean = 0 } = {}) => { const x = x0 + lean;
    fillPoly(g, [[x - 3, F - 9], [x + 3, F - 9], [x + 4, F - 1], [x - 4, F - 1]], C.robe); line(g, x + 3, F - 8, x + 4, F - 2, C.robeL); rect(g, x - 3 + step, F - 1, 2, 1, C.skinD); rect(g, x + 1 - step, F - 1, 2, 1, C.skinD);
    ellipse(g, x, F - 11, 3, 2.6, C.skin); fillPoly(g, [[x - 4, F - 10], [x - 1, F - 15], [x + 4, F - 11]], C.robe); px(g, x + 1, F - 11, C.eye); px(g, x + 3, F - 10, C.skinD);   // hooded, a lamp-eye
    if (pole === 'rest') { line(g, x + 3, F - 8, x + 6, F - 14, C.pole); rect(g, x + 5, F - 15, 3, 2, C.cup); }
    else if (pole === 'up') { line(g, x + 2, F - 9, x + 3, F - 16, C.pole); rect(g, x + 2, F - 16, 3, 2, C.cup); px(g, x + 3, F - 16, C.smoke); px(g, x + 5, F - 16, C.smoke); }   // raised to the lamp
    else if (pole === 'swipe') { line(g, x + 3, F - 8, x + 10, F - 7, C.pole); rect(g, x + 10, F - 8, 3, 2, C.cup); for (let k = 0; k < 3; k++) px(g, x + 6 + k * 2, F - 11 + k, '#ffffff'); } };
  const Fr = frames(W, H, [g => gob(g, {}), g => gob(g, { step: 1, lean: 1 }), g => gob(g, { pole: 'up' }), g => gob(g, { pole: 'swipe', lean: 1 }), g => gob(g, { step: -1, lean: 1 }),
    g => { gob(g, { lean: -2 }); px(g, 3, 3, C.smoke); }]);
  return pack(Fr, 7, 15, 10, 14);
}

/* THE WIRING TABLE: per foe, the new baker, what its old frames still mean, the new ones, and the one change to main.js's frame pick
   (lines as of this branch; the hurt frames want a `e.hurtT > 0` or `e.flash > 0.06` test at the head of each pick). */
export const FRAMES_V2 = {
  bat: { bake: bakeBatV2, keep: '0 hang, 1-2 flap', add: { flap3: 3, hurt: 4, death: 5 }, pick: "hang ? 0 : [1,3,2,3][floor(anim*16)%4]  (main.js ~19890)" },
  zombie: { bake: () => bakeDeadV2('zombie'), keep: 'deadFrame 0-6', add: { walk2: 7, hurt: 8, death: 9 }, pick: "deadFrame: walking -> [0,1,0,7][floor(anim*6)%4]  (buried-dead.js deadFrame)" },
  apprentice: { bake: () => bakeDeadV2('apprentice'), keep: 'deadFrame 0-6', add: { walk2: 7, hurt: 8, death: 9 }, pick: 'as the zombie (its own robed body now, not the zombie recoloured)' },
  wight: { bake: bakeWightV2, keep: '0-3 drift', add: { hurt: 4, death: 5 }, pick: 'unchanged, + hurt (main.js ~19926)' },
  thief: { bake: bakeThiefV2, keep: '0-1 run, 2 glance', add: { run3: 3, run4: 4, hurt: 5 }, pick: "running: [0,3,1,4][floor(anim*12)%4]  (main.js ~19888)" },
  hedgeknight: { bake: bakeHedgeKnightV2, keep: '0 stand, 1 walk, 2 swingTell, 3 swing, 4 leap', add: { walk2: 5, hurt: 6 }, pick: "walking: [1,0,5,0][floor(anim*5)%4]  (main.js ~19911)" },
  crow: { bake: bakeCrowV2, keep: '0-2 flap', add: { glide: 3, hurt: 4 }, pick: 'unchanged; glide when |vy| small (main.js ~19900)' },
  petrel: { bake: bakePetrelV2, keep: '0-1 flap, 2 dive, 3 climb', add: { hurt: 4 }, pick: 'unchanged, + hurt' },
  wasp: { bake: bakeWaspV2, keep: '0-2 buzz, 3 hurt', add: {}, pick: 'unchanged' },
  snuffer: { bake: bakeSnufferV2, keep: '0 stand, 1 walk, 2 snuffTell, 3 swipe', add: { walk2: 4, hurt: 5 }, pick: "walking: [1,0,4,0][floor(anim*9)%4]  (main.js ~19960)" },
};
