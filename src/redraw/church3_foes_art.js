// src/redraw/church3_foes_art.js - THE ORDER PALADIN / THE UNDEAD PALADIN and THE UNDEAD PRIEST, DRAWN (claude/church3art; the greybox was claude/church3's rectangles).
// THE PALADIN (one body, two skins): a shield-and-mace knight of the order. LIVING - polished plate, a blue tabard with a gold sun, a white-and-gold plume, a kite shield with the
// sun on its boss, under a gold divine-shield dome. UNDEAD - the same man long dead: grey-green plate gone to rust, a tattered violet tabard, the plume a stub, bone at the gaps,
// a cold light in the visor, the shield cracked, a cracked blue dome. THE PRIEST: a dead cleric, tall and gaunt, in a rotted chasuble with a tarnished gold orphrey cross, a cowl
// over a skull, a bone censer on a chain trailing cold blue smoke.
// THE SHEETS (B16: every move its OWN windup + release pose, never a shared frame) - src/order-paladin.js FRAMES: idle, walk A / B, bash windup (the shield drawn in, the hips
// low) / bash release (driven out, the lunge), gleam windup (the mace hauled up over the head, the star on the shield) / gleam release (the mace down through the stroke),
// shattered (staggered, the shield arm flung wide, the shield in shards), mending (kneeling, the light threading back through the plate), hurt (the last frame: the corpse dies
// in it - a crumple, the shield dropping). src/undead-priest.js FRAMES: idle, walk A / B, bolt windup (the censer swung back over the head) / release (flung out), raise windup (down on
// the knee, both hands to the floor) / release (up, arms flung wide), mend windup (the hands drawn together) / release (spread), snuff windup (the fingers opened toward the lamp) /
// release (the pinch), flee (cowering from the flame), hurt.
// Pure pixel work (px.js; no paths, so tools/church3art-sheet.mjs bakes it in Node). Canvas W x H, the feet's centre at (AX, AY); a left-facing pose is the same canvas mirrored.
import { outline, flipX, whiten, canvas, rect, px, line } from '../px.js';
export const W = 46, H = 56, AX = 23, AY = 52;
const R = Math.round;
const PAL = {
  orderpaladin: { pl: '#aeb8c8', hi: '#e8f0fa', lo: '#6c7890', dp: '#3a4258', tab: '#2f4f9a', tabHi: '#4a72c8', tabLo: '#1e3270', gold: '#e0b040', goldHi: '#fff0a8', goldLo: '#8a6a1c', skin: '#e0b090', skinLo: '#a8745a',
    shield: '#d8dee8', shieldLo: '#8a94a8', plume: '#f4f0e4', plumeLo: '#c9b27c', eye: '#2a2030', boss: '#ffd36b', cloak: '#e8e4d8', cloakLo: '#a8a090', wood: '#6a4a2a' },
  deadpaladin: { pl: '#7e867c', hi: '#b4bcae', lo: '#4e564e', dp: '#262c28', tab: '#4a4062', tabHi: '#6a5e88', tabLo: '#2a2438', gold: '#8a7a40', goldHi: '#b8a460', goldLo: '#4a4020', skin: '#c8ccb0', skinLo: '#8a8e78',
    shield: '#8e968c', shieldLo: '#4a524c', plume: '#5a5a62', plumeLo: '#34343c', eye: '#9ff0ff', boss: '#9ab0e0', cloak: '#4a4458', cloakLo: '#2a2634', wood: '#4a3a2a', rust: '#7a5a3a', rustHi: '#a07848', bone: '#d8d4b8', boneLo: '#9a967c' },
  deadpriest: { robe: '#3a2c48', robeHi: '#5a4868', robeLo: '#221a2c', robeDp: '#140e1c', gold: '#9a8a48', goldHi: '#c8b868', goldLo: '#5a4e24', skull: '#d4d2b8', skullLo: '#8e8c74', skullDp: '#4a483c', eye: '#9ff0ff',
    bone: '#d8d4b8', boneLo: '#9a967c', cord: '#6a5a3a', censer: '#6a6a7a', censerHi: '#a8a8bc', censerLo: '#34343e', smoke: '#9ab0e0', smokeHi: '#e0eaff', wrap: '#b8b49a', wrapLo: '#7a7660' },
};
const mk = () => canvas(W, H);
/* up-coordinates: x right of the feet's centre, y up from the floor; a rect from its bottom-left */
const bx = (g, x, y, w, h, c) => rect(g, AX + R(x), AY - R(y) - h, w, h, c);
const pp = (g, x, y, c) => px(g, AX + R(x), AY - R(y) - 1, c);
const ln = (g, x0, y0, x1, y1, c, t = 1) => line(g, AX + R(x0), AY - R(y0), AX + R(x1), AY - R(y1), c, t);
const done = c => { outline(c, '#14101a'); return c; };

/* ---------------------------------------------------------------- THE PALADIN */
/* the shield: a kite shield held at (x, y) (its centre); `lit` is the gleam's star, `crack` the undead's fracture, `shards` a shattered one (a scatter, none on the arm) */
function shieldAt(g, P, kind, x, y, o = {}) {
  const dead = kind === 'deadpaladin', hw = 4, top = y + 6;
  for (let r = 0; r < 12; r++) { const yy = y + 5 - r, w = r < 9 ? hw : hw - Math.floor((r - 8) * 1.2); if (w < 1) continue;   /* the kite: square shoulders, a tapering point */
    bx(g, x - w, yy, w * 2, 1, P.shield); bx(g, x - w, yy, 1, 1, P.shieldLo); bx(g, x + w - 1, yy, 1, 1, P.hi); }
  bx(g, x - hw, top - 1, hw * 2, 1, P.hi);                           /* the top rim */
  bx(g, x - hw, y - 3, hw * 2, 1, P.shieldLo);                          /* the lower rim */
  if (dead) { bx(g, x - 2, y + 1, 2, 2, P.rust); bx(g, x + 1, y - 2, 2, 1, P.rust); }
  else { bx(g, x - 1, y + 3, 2, 1, P.gold); bx(g, x - 1, y - 2, 2, 1, P.gold); }   /* gilt bars */
  /* the boss: a sun (living) / a pale bruised ring (dead) */
  const sc = o.lit ? '#ffffff' : P.boss;
  bx(g, x - 1, y, 2, 2, sc); pp(g, x - 2, y + 1, sc); pp(g, x + 1, y + 2, sc); pp(g, x - 2, y - 1, o.lit ? '#fff6c8' : P.goldLo); pp(g, x + 1, y - 2, o.lit ? '#fff6c8' : P.goldLo);
  if (dead && !o.noCrack) { ln(g, x - 3, y + 5, x - 1, y + 2, '#14101a'); ln(g, x - 1, y + 2, x - 2, y - 1, '#14101a'); ln(g, x + 3, y - 1, x + 1, y - 3, '#14101a'); }
  if (o.lit) { /* THE GLEAM: a white star on the boss */
    bx(g, x - 4, y + 1, 9, 1, '#ffffff'); bx(g, x, y - 3, 1, 9, '#ffffff'); pp(g, x - 3, y + 3, '#fff6c8'); pp(g, x + 3, y + 3, '#fff6c8'); pp(g, x - 3, y - 1, '#fff6c8'); pp(g, x + 3, y - 1, '#fff6c8'); }
}
/* the mace: the hand at (hx, hy), the haft up along angle `a` (radians, 0 = right, + up), a flanged head */
function maceAt(g, P, kind, hx, hy, a, len = 12) {
  const dead = kind === 'deadpaladin', cs = Math.cos(a), sn = Math.sin(a), ex = hx + cs * len, ey = hy + sn * len;
  ln(g, hx, hy, ex, ey, P.wood, 2); ln(g, hx - sn * 0, hy, ex, ey, dead ? '#6a5a3a' : '#9a7a4a', 1);
  const hxh = ex + cs * 1, hyh = ey + sn * 1, nx = -sn, ny = cs;                                  /* the head: a ball with four flanges */
  bx(g, hxh - 3, hyh - 3, 6, 6, P.dp); bx(g, hxh - 2, hyh - 2, 4, 4, dead ? P.lo : P.pl); bx(g, hxh - 2, hyh + 1, 4, 1, dead ? P.pl : P.hi); pp(g, hxh + 1, hyh - 2, P.dp);
  for (const [dx, dy] of [[nx, ny], [-nx, -ny], [cs, sn]]) { const fx = hxh + dx * 4, fy = hyh + dy * 4; bx(g, fx - 1, fy - 1, 3, 3, P.dp); bx(g, fx - 1, fy, 2, 2, dead ? P.lo : P.pl); pp(g, fx, fy + 1, dead ? P.pl : P.hi); }
  ln(g, hx - cs * 2, hy - sn * 2, hx, hy, P.dp, 2);                                               /* the grip below the hand */
}
/* the body of a knight, drawn from the floor up: lean (the top forward), cr (crouch: rows lost), stride (the legs apart), kneel; returns where the shoulders and head are */
function knight(g, P, kind, o = {}) {
  const dead = kind === 'deadpaladin', lean = o.lean || 0, cr = o.cr || 0, st = o.stride || 0, kneel = !!o.kneel, shY = 21 - cr;
  const sh = y => R(lean * Math.pow(Math.max(0, (y - 8) / 14), 1.3));
  /* the cloak behind: a hanging length, the order's white-and-gold */
  const ck = o.cloak == null ? 1 : o.cloak; if (ck) { for (let y = shY - 1; y > (kneel ? 2 : 3); y--) { const x0 = sh(y) - 6 - Math.floor((shY - y) / 7) + (o.cloakSwing || 0) * Math.floor((shY - y) / 6); bx(g, x0, y, 4, 1, P.cloak); bx(g, x0, y, 1, 1, P.cloakLo); if (dead && (y % 5 === 0)) bx(g, x0 + 1, y, 1, 1, '#14101a'); }
    if (dead) for (let i = 0; i < 3; i++) bx(g, -9 + i * 2 + (o.cloakSwing || 0) * 2, 3 - (i & 1), 1, 2, P.cloakLo); }
  /* the legs: greaves and sabatons (a kneeling man has one down) */
  if (!kneel) for (const [lx, back] of [[-4 - st, 1], [1 + st, 0]]) { const lc = back ? P.lo : P.pl;
    bx(g, lx, 4, 4, 6 - cr, lc); bx(g, lx, 4, 1, 6 - cr, P.dp); if (!back) bx(g, lx + 3, 5, 1, 5 - cr, P.hi); bx(g, lx - 1 + (back ? 0 : 1), 2, 5, 3, P.dp); bx(g, lx + (back ? 0 : 1), 3, 4, 1, P.lo); bx(g, lx + 3, 1, 3, 2, P.dp);   /* knee cop, shin, the sabaton's toe */
    if (!back) bx(g, lx + 1, 9 - cr, 3, 1, dead ? P.rust : P.gold); }
  else { bx(g, -6, 2, 10, 4, P.lo); bx(g, -6, 2, 10, 1, P.dp); bx(g, 3, 4, 5, 5, P.pl); bx(g, 3, 4, 1, 5, P.dp); bx(g, 7, 2, 4, 3, P.dp); bx(g, 4, 8, 3, 1, P.hi); }
  /* the tabard skirt and the plate skirt (tassets) */
  const sk0 = 9 - cr; for (let y = sk0; y >= (kneel ? 3 : 5); y--) { const x = sh(y) - 3; bx(g, x, y, 6, 1, P.tab); bx(g, x, y, 1, 1, P.tabLo); bx(g, x + 5, y, 1, 1, P.tabHi); if (dead && y % 3 === 0) bx(g, x + 1 + (y % 2) * 3, y, 1, 1, '#14101a'); }
  bx(g, sh(sk0) - 3, kneel ? 3 : 5, 6, 1, dead ? P.goldLo : P.gold);
  /* the torso: rows from the waist up, a plate breastplate with a tabard panel and a belt */
  for (let y = sk0 + 1; y <= shY; y++) { const t = (y - sk0) / Math.max(1, shY - sk0), w = Math.round(8 + 4 * t), x0 = sh(y) - Math.floor(w / 2);
    bx(g, x0, y, w, 1, P.pl); bx(g, x0, y, 1, 1, P.dp); bx(g, x0 + 1, y, 1, 1, P.lo); bx(g, x0 + w - 2, y, 1, 1, P.hi); bx(g, x0 + w - 1, y, 1, 1, P.hi);
    if (y < shY - 1) { bx(g, x0 + Math.floor(w / 2) - 2, y, 4, 1, P.tab); bx(g, x0 + Math.floor(w / 2) - 2, y, 1, 1, P.tabLo); bx(g, x0 + Math.floor(w / 2) + 1, y, 1, 1, P.tabHi); } }
  bx(g, sh(sk0 + 1) - 4, sk0 + 1, 8, 1, dead ? P.goldLo : P.gold); bx(g, sh(sk0 + 1) - 1, sk0 + 1, 2, 1, dead ? P.goldHi : P.goldHi);   /* the belt and its buckle */
  { const cy = sk0 + 5 - Math.min(2, cr), cx = sh(cy) - 1; if (dead) { bx(g, cx, cy, 2, 2, P.goldLo); pp(g, cx, cy + 1, P.goldHi); } else { bx(g, cx, cy, 2, 2, P.gold); pp(g, cx, cy + 1, P.goldHi); bx(g, cx - 1, cy + 1, 1, 1, P.goldHi); bx(g, cx + 2, cy, 1, 1, P.goldHi); bx(g, cx, cy - 1, 2, 1, P.goldLo); } }   /* the sun on the tabard */
  if (dead) { bx(g, sh(sk0 + 4) + 2, sk0 + 4, 2, 2, P.rust); bx(g, sh(sk0 + 5) - 4, sk0 + 6, 2, 1, P.rustHi); pp(g, sh(sk0 + 3) - 1, sk0 + 3, P.bone); pp(g, sh(sk0 + 3), sk0 + 3, P.boneLo); }
  /* the pauldrons: a round steel cap on each shoulder, gold-rimmed */
  for (const [sx, hi] of [[-6, 0], [4, 1]]) { const x = sh(shY) + sx, y = shY - 2; bx(g, x, y, 4, 4, hi ? P.pl : P.lo); bx(g, x, y + 3, 4, 1, hi ? P.hi : P.pl); bx(g, x, y, 4, 1, dead ? P.rust : P.gold); if (hi) bx(g, x + 3, y + 1, 1, 2, P.hi); }
  return { shx: sh(shY), shy: shY, top: shY + 1, sh };
}
/* the helm: a great helm with a visor slit, a crest; `look` nods the head (dx, dy); bowed lowers it */
function helm(g, P, kind, bd, o = {}) {
  const dead = kind === 'deadpaladin', hx = bd.shx + (o.hx || 0), hy = bd.top + 1 + (o.hy || 0);
  bx(g, hx - 3, hy, 7, 8, P.pl); bx(g, hx - 3, hy, 1, 8, P.dp); bx(g, hx - 2, hy, 1, 7, P.lo); bx(g, hx + 3, hy + 1, 1, 6, P.hi); bx(g, hx - 3, hy + 7, 7, 1, P.hi); bx(g, hx - 2, hy + 8, 5, 1, P.pl);   /* the dome */
  bx(g, hx - 1, hy + 3, 5, 2, '#0e0b14');                                                    /* THE VISOR SLIT */
  bx(g, hx + 2, hy + 3, 2, 1, dead ? '#9ff0ff' : P.eye); if (dead) { pp(g, hx + 3, hy + 3, '#ffffff'); bx(g, hx + 1, hy + 4, 1, 1, '#4a8aa0'); }   /* (a light in the dead man's) */
  bx(g, hx + 3, hy + 3, 1, 1, dead ? '#e8ffff' : '#0e0b14'); bx(g, hx, hy, 1, 3, P.lo); bx(g, hx, hy + 5, 1, 2, P.lo);   /* the breaths */
  bx(g, hx - 2, hy - 1, 6, 1, P.lo); bx(g, hx - 2, hy - 1, 6, 1, P.dp);                      /* the gorget */
  if (dead) { ln(g, hx - 1, hy + 8, hx + 1, hy + 5, '#14101a'); pp(g, hx + 2, hy + 6, '#14101a'); bx(g, hx - 3, hy + 2, 1, 2, P.bone); }   /* the crack, a bone showing */
  /* the plume: a long white-and-gold horsehair streaming back (dead: a stub, the hair gone) */
  if (!dead) { for (let i = 0; i < 9; i++) { const y = hy + 9 + Math.round(Math.sin(i / 9 * 2.4) * 3), x = hx - 1 - Math.floor(i * 0.9) + (o.plumeBack || 0); bx(g, x, y - Math.floor(i / 4), 2, 2, i % 3 === 0 ? P.plumeLo : P.plume); }
    bx(g, hx - 1, hy + 8, 3, 2, P.gold); }
  else { bx(g, hx - 1, hy + 8, 3, 2, P.goldLo); bx(g, hx - 3, hy + 9, 2, 2, P.plumeLo); pp(g, hx - 4, hy + 8, P.plumeLo); pp(g, hx - 5, hy + 7, P.plumeLo); }
}
/* the arm: a vambrace line from the shoulder to a hand; the hand a gauntlet */
function arm(g, P, sx, sy, hx, hy, back) { ln(g, sx, sy, hx, hy, back ? P.dp : P.lo, 3); ln(g, sx, sy + 1, hx, hy + 1, back ? P.lo : P.pl, 1); bx(g, hx - 1, hy - 1, 3, 3, back ? P.lo : P.pl); pp(g, hx, hy, P.dp); }
function paladinFrame(i, kind) {
  const P = PAL[kind], [c, g] = mk(), dead = kind === 'deadpaladin';
  let bd; const draw = o => { bd = knight(g, P, kind, o); return bd; };
  switch (i) {
    case 0: { draw({}); helm(g, P, kind, bd); arm(g, P, bd.shx - 4, bd.shy, bd.shx - 6, 8, true); maceAt(g, P, kind, bd.shx - 6, 8, 1.95, 13); arm(g, P, bd.shx + 5, bd.shy, bd.shx + 7, 12, false); shieldAt(g, P, kind, bd.shx + 8, 13); break; }
    case 1: case 2: { const s = i === 1 ? 2 : -2; draw({ stride: s, lean: 1, cloakSwing: s > 0 ? 1 : 0 }); helm(g, P, kind, bd, { plumeBack: 1 }); arm(g, P, bd.shx - 4, bd.shy, bd.shx - 7, 8 + (s > 0 ? 1 : -1), true); maceAt(g, P, kind, bd.shx - 7, 8 + (s > 0 ? 1 : -1), 1.95, 13); arm(g, P, bd.shx + 5, bd.shy, bd.shx + 8, 12, false); shieldAt(g, P, kind, bd.shx + 9, 13); break; }
    case 3: { /* BASH WINDUP: the shield drawn in to the chest, the hips low, the mace arm back */
      draw({ lean: -2, cr: 2, stride: 1 }); helm(g, P, kind, bd, { hx: -1 }); arm(g, P, bd.shx - 4, bd.shy, bd.shx - 8, 9, true); maceAt(g, P, kind, bd.shx - 8, 9, 0.9, 9); arm(g, P, bd.shx + 5, bd.shy, bd.shx + 3, 11, false); shieldAt(g, P, kind, bd.shx + 3, 12); break; }
    case 4: { /* BASH RELEASE: driven out at the chest, the whole body behind it */
      draw({ lean: 5, cr: 3, stride: 2, cloakSwing: -1 }); helm(g, P, kind, bd, { hx: 1, hy: -1, plumeBack: 2 }); arm(g, P, bd.shx - 4, bd.shy, bd.shx - 5, 9, true); maceAt(g, P, kind, bd.shx - 5, 9, 1.3, 8); arm(g, P, bd.shx + 5, bd.shy, bd.shx + 12, 15, false); shieldAt(g, P, kind, bd.shx + 14, 15);
      for (let k = 0; k < 3; k++) bx(g, bd.shx + 19 + k, 13 + k * 3, 2, 1, k === 1 ? '#fff6c8' : '#ffd36b'); break; }
    case 5: { /* GLEAM WINDUP: the mace hauled straight up over the head, the star on the shield */
      draw({ lean: -2, cr: 1, cloakSwing: 1 }); helm(g, P, kind, bd, { hx: -1, plumeBack: 1 }); arm(g, P, bd.shx - 4, bd.shy, bd.shx - 3, 33, true); maceAt(g, P, kind, bd.shx - 3, 33, 1.5, 10); arm(g, P, bd.shx + 5, bd.shy, bd.shx + 7, 13, false); shieldAt(g, P, kind, bd.shx + 8, 14, { lit: true }); break; }
    case 6: { /* GLEAM RELEASE: the mace down through the stroke, the weight thrown into the lunge */
      draw({ lean: 7, cr: 4, stride: 3, cloakSwing: -2 }); helm(g, P, kind, bd, { hx: 2, hy: -2, plumeBack: 3 }); arm(g, P, bd.shx - 2, bd.shy, bd.shx + 12, 8, true); maceAt(g, P, kind, bd.shx + 12, 8, -0.5, 12); arm(g, P, bd.shx + 5, bd.shy, bd.shx + 5, 12, false); shieldAt(g, P, kind, bd.shx + 5, 12);
      ln(g, bd.shx + 16, 29, bd.shx + 26, 9, '#fff6c8', 2); break; }
    case 7: { /* SHATTERED: staggered back, the shield arm flung wide, the shield in shards */
      draw({ lean: -5, cr: 1, stride: 2, cloakSwing: 2 }); helm(g, P, kind, bd, { hx: -2, hy: 1, plumeBack: 3 }); arm(g, P, bd.shx - 4, bd.shy, bd.shx - 9, 6, true); maceAt(g, P, kind, bd.shx - 9, 6, 0.3, 9); arm(g, P, bd.shx + 5, bd.shy, bd.shx + 12, 19, false);
      for (const [dx, dy, w, h, col] of [[11, 24, 3, 2, P.shield], [15, 19, 2, 3, P.shield], [13, 14, 3, 2, P.shieldLo], [18, 25, 2, 2, P.hi], [9, 11, 2, 2, P.shield], [19, 15, 2, 2, '#ffffff'], [16, 29, 1, 2, '#fff6c8'], [7, 28, 2, 2, P.shieldLo]]) bx(g, bd.shx + dx, dy, w, h, col);
      pp(g, bd.shx + 12, 20, '#ffffff'); pp(g, bd.shx + 11, 21, '#fff6c8'); break; }
    case 8: { /* MENDING: down on one knee behind the shield, the light creeping back through the plate */
      draw({ lean: 3, cr: 5, kneel: true }); helm(g, P, kind, bd, { hx: 1, hy: -2 }); arm(g, P, bd.shx - 4, bd.shy, bd.shx - 6, 5, true); maceAt(g, P, kind, bd.shx - 6, 5, 0.6, 9); arm(g, P, bd.shx + 5, bd.shy, bd.shx + 9, 10, false); shieldAt(g, P, kind, bd.shx + 10, 11, { noCrack: true });
      for (let k = 0; k < 6; k++) { bx(g, bd.shx - 8 + k * 3, 4 + ((k * 5) % 14), 1, 2, k & 1 ? '#fff6c8' : P.boss); } for (let y = 3; y < 20; y += 3) pp(g, bd.shx + 5, y, P.boss); break; }
    default: { /* HURT / THE BODY HE LEAVES: struck, the shield dropping - the corpse is drawn in it */
      draw({ lean: -4, cr: 2, stride: 2, cloakSwing: 2 }); helm(g, P, kind, bd, { hx: -2, hy: 0, plumeBack: 3 }); arm(g, P, bd.shx - 4, bd.shy, bd.shx - 9, 12, true); maceAt(g, P, kind, bd.shx - 9, 12, 2.2, 8); arm(g, P, bd.shx + 5, bd.shy, bd.shx + 6, 8, false); shieldAt(g, P, kind, bd.shx + 6, 8);
      for (const [dx, dy] of [[-8, 28], [11, 21], [-5, 31]]) { pp(g, bd.shx + dx, dy, '#ffffff'); pp(g, bd.shx + dx + 1, dy, '#fff6c8'); pp(g, bd.shx + dx, dy + 1, '#ffd36b'); }
    }
  }
  return done(c);
}

/* ---------------------------------------------------------------- THE UNDEAD PRIEST */
/* a hand: bone, with a wrap */
const hand = (g, P, x, y, open = false) => { bx(g, x - 1, y - 1, 3, 3, P.bone); pp(g, x - 1, y - 1, P.boneLo); pp(g, x + 1, y + 1, P.boneLo); if (open) { pp(g, x + 2, y + 2, P.bone); pp(g, x + 2, y, P.bone); pp(g, x + 2, y - 2, P.bone); } };
const sleeve = (g, P, sx, sy, hx, hy, back) => { ln(g, sx, sy, hx, hy, back ? P.robeDp : P.robeLo, 4); ln(g, sx, sy + 1, hx, hy + 1, back ? P.robeLo : P.robe, 2); ln(g, sx + 1, sy + 2, hx, hy + 2, back ? P.robe : P.robeHi, 1); bx(g, hx - 2, hy - 1, 4, 2, P.wrap); pp(g, hx - 2, hy - 1, P.wrapLo); };
/* the censer: a bone-and-iron thurible on a chain from the hand at (hx, hy) to (cx, cy), cold smoke off it (`glow` is the blue gathering) */
function censer(g, P, hx, hy, cx, cy, glow) {
  const n = Math.max(3, Math.floor(Math.hypot(cx - hx, cy - hy) / 2)); for (let k = 0; k <= n; k++) { const t = k / n, x = hx + (cx - hx) * t, y = hy + (cy - hy) * t - Math.sin(t * Math.PI) * 1.5; bx(g, R(x), R(y), 1, 1, k & 1 ? P.censerHi : P.censerLo); }
  bx(g, cx - 3, cy - 5, 6, 5, P.censer); bx(g, cx - 3, cy - 5, 6, 1, P.censerHi); bx(g, cx - 2, cy - 1, 4, 1, P.censerLo); bx(g, cx - 1, cy, 2, 1, P.censerLo);   /* the bowl */
  bx(g, cx - 2, cy - 3, 1, 1, '#0e0b14'); bx(g, cx, cy - 3, 1, 1, '#0e0b14'); bx(g, cx + 1, cy - 4, 1, 1, '#0e0b14');                                           /* the pierced lid */
  bx(g, cx - 1, cy - 7, 2, 2, P.censerHi); pp(g, cx, cy - 8, P.censerLo);                                                                                   /* the knop */
  for (let k = 0; k < (glow ? 6 : 3); k++) { const y = cy + 1 + k * 2; pp(g, cx - 1 + ((k * 3) % 3), y, k % 2 ? P.smoke : P.smokeHi); } }
function priestFrame(i) {
  const P = PAL.deadpriest, [c, g] = mk();
  const st = { 0: [0, 0], 1: [2, 0], 2: [-2, 0] }[i] || [0, 0];
  const o = { 0: {}, 1: { stride: 2, lean: 1 }, 2: { stride: -2, lean: 1 }, 3: { lean: -2 }, 4: { lean: 4, stride: 2 }, 5: { cr: 6, lean: 3, kneel: true }, 6: { lean: -1, tip: 2 }, 7: { lean: 1 }, 8: { lean: 0 }, 9: { lean: 3 }, 10: { lean: 5, stride: 2 }, 11: { cr: 5, lean: -4, stride: 1 }, 12: { lean: -4, cr: 1, stride: 2 } }[i] || {};
  const lean = o.lean || 0, cr = o.cr || 0, tip = o.tip || 0, stride = o.stride || 0, shY = 29 - cr + tip;
  const sh = y => R(lean * Math.pow(Math.max(0, (y - 4) / 24), 1.25));
  /* THE ROBE: a rotted chasuble over an alb, a long skirt to the floor with a torn hem; gaunt shoulders, a gold orphrey cross down the front */
  for (let y = (o.kneel ? 3 : 1) + tip; y <= shY; y++) { const t = (y - 1) / 28, w = Math.round(6 + 6 * Math.pow(1 - t, 1.1) + (y < shY - 2 ? 0 : -2)), x0 = sh(y) - Math.floor(w / 2) - (o.kneel && y < 8 ? 2 : 0);
    bx(g, x0, y, w, 1, P.robe); bx(g, x0, y, 1, 1, P.robeDp); bx(g, x0 + 1, y, 1, 1, P.robeLo); bx(g, x0 + w - 1, y, 1, 1, P.robeHi);
    if (y % 4 === 1 && w > 7) bx(g, x0 + 2 + (y % 3), y, 1, 1, P.robeLo);   /* folds */ }
  { const y0 = 1 + tip; for (let k = 0; k < 14; k++) if (k % 3 !== 1 || k > 9) bx(g, sh(y0 + k + 1) + 4 - (k > 10 ? (k & 1) : 0), y0 + k + (o.kneel ? 2 : 0), 1, 1, P.robeLo);   /* the torn hem */ }
  { const cx = sh(shY - 3), cy0 = shY - 15; for (let y = cy0; y < shY - 1; y++) bx(g, cx - 1, y, 2, 1, y % 4 === 0 ? P.goldLo : P.gold); bx(g, cx - 4, shY - 9, 8, 1, P.gold); bx(g, cx - 4, shY - 10, 8, 1, P.goldLo); bx(g, cx - 1, shY - 9, 2, 1, P.goldHi);   /* the cross */
    bx(g, cx - 1, cy0, 2, 1, P.goldLo); }
  bx(g, sh(shY - 11) - 5, shY - 11, 10, 1, P.cord); pp(g, sh(shY - 11) + 3, shY - 12, P.goldHi); pp(g, sh(shY - 11) + 4, shY - 13, P.cord); pp(g, sh(shY - 11) + 4, shY - 14, P.cord);   /* the knotted cord */
  /* feet: bare, bone, under the hem (a kneeling man's knee) */
  if (!o.kneel) { bx(g, -4 - stride, 0, 3, 2, P.bone); bx(g, 2 + stride, 0, 3, 2, P.bone); pp(g, -4 - stride, 1, P.boneLo); pp(g, 4 + stride, 1, P.boneLo); }
  /* the shoulders: a mantle's rotted cape and bony points */
  bx(g, sh(shY) - 6, shY - 2, 12, 3, P.robeLo); bx(g, sh(shY) - 6, shY, 12, 1, P.robeHi); bx(g, sh(shY) - 6, shY - 2, 1, 3, P.robeDp);
  /* the head: a skull in a cowl; a bone mitre stub, two cold coals for eyes, the jaw open when he casts */
  const hx = sh(shY) + (o.hx || 0), hy = shY + 1 + (i === 11 ? -1 : 0) + (o.hy || 0);
  bx(g, hx - 3, hy, 7, 8, P.robeLo); bx(g, hx - 4, hy + 1, 1, 6, P.robeDp); bx(g, hx + 3, hy + 1, 1, 6, P.robeLo); bx(g, hx - 2, hy + 8, 5, 1, P.robe); bx(g, hx - 1, hy + 9, 3, 1, P.robeHi);   /* the cowl */
  bx(g, hx - 1, hy + 1, 5, 6, P.skull); bx(g, hx - 1, hy + 1, 1, 6, P.skullLo); bx(g, hx + 3, hy + 2, 1, 4, '#f2f0de'); bx(g, hx - 1, hy + 6, 5, 1, P.skullLo);   /* the skull */
  bx(g, hx, hy + 3, 2, 2, '#0e0b14'); bx(g, hx + 2, hy + 3, 2, 2, '#0e0b14'); pp(g, hx + 1, hy + 4, P.eye); pp(g, hx + 3, hy + 4, P.eye); pp(g, hx + 3, hy + 3, '#e8ffff');   /* the sockets, the coals */
  bx(g, hx + 1, hy + 2, 1, 1, P.skullDp); bx(g, hx + 1, hy + 1, 3, 1, P.skullDp); bx(g, hx, hy + 1, 4, 1, i === 4 || i === 6 || i === 10 ? '#0e0b14' : P.skullLo);   /* the nose, the teeth */
  bx(g, hx - 1, hy + 8, 6, 1, P.gold); bx(g, hx + 1, hy + 9, 2, 1, P.goldHi);   /* the mitre's gilt band */
  const sx0 = sh(shY - 2) - 5, sx1 = sh(shY - 2) + 5, sy = shY - 3;
  switch (i) {
    case 0: sleeve(g, P, sx0, sy, -5, 10, true); sleeve(g, P, sx1, sy, 7, 14, false); hand(g, P, -5, 10); hand(g, P, 7, 14); censer(g, P, 7, 14, 8, 6, false); break;
    case 1: sleeve(g, P, sx0, sy, -5, 11, true); sleeve(g, P, sx1, sy, 8, 14, false); hand(g, P, -5, 11); hand(g, P, 8, 14); censer(g, P, 8, 14, 10, 6, false); break;
    case 2: sleeve(g, P, sx0, sy, -5, 10, true); sleeve(g, P, sx1, sy, 6, 14, false); hand(g, P, -5, 10); hand(g, P, 6, 14); censer(g, P, 6, 14, 5, 6, false); break;
    case 3: sleeve(g, P, sx0, sy, -4, 15, true); sleeve(g, P, sx1, sy, -3, 36, false); hand(g, P, -4, 15); hand(g, P, -3, 36); censer(g, P, -3, 36, -9, 33, true); break;      /* BOLT WINDUP: the censer swung back over the head, the chain slack behind */
    case 4: sleeve(g, P, sx0, sy, -6, 12, true); sleeve(g, P, sx1, sy, 14, 22, false); hand(g, P, -6, 12); hand(g, P, 14, 22); censer(g, P, 14, 22, 22, 20, true); break;    /* BOLT RELEASE: flung out, the chain taut */
    case 5: sleeve(g, P, sx0, sy, -6, 3, true); sleeve(g, P, sx1, sy, 10, 3, false); hand(g, P, -6, 3, true); hand(g, P, 10, 3, true); for (let k = 0; k < 5; k++) { pp(g, -4 + k * 3, 1 + (k & 1), P.smoke); pp(g, -3 + k * 3, 2 + (k & 1), P.smokeHi); } break;   /* RAISE WINDUP: down on the knee, the hands to the floor */
    case 6: sleeve(g, P, sx0, sy, -8, 38, true); sleeve(g, P, sx1, sy, 9, 38, false); hand(g, P, -8, 38, true); hand(g, P, 9, 38, true); for (let k = 0; k < 7; k++) { pp(g, -9 + k * 3, 34 + ((k * 3) % 5), k & 1 ? P.smoke : P.smokeHi); } break;   /* RAISE RELEASE: arms flung up */
    case 7: sleeve(g, P, sx0, sy, 1, 15, true); sleeve(g, P, sx1, sy, 3, 16, false); hand(g, P, 1, 15); hand(g, P, 3, 16); for (let k = 0; k < 3; k++) pp(g, 2 + k - 1, 17 + k % 2, '#ff9a5c'); break;   /* MEND WINDUP: the hands together over the cord */
    case 8: sleeve(g, P, sx0, sy, -10, 20, true); sleeve(g, P, sx1, sy, 13, 20, false); hand(g, P, -10, 20, true); hand(g, P, 13, 20, true); for (let k = 0; k < 6; k++) { pp(g, -9 + k * 4, 22 + (k & 1) * 2, '#ff9a5c'); pp(g, -8 + k * 4, 23 + (k & 1) * 2, '#ffd36b'); } break;   /* MEND RELEASE: the hands spread */
    case 9: sleeve(g, P, sx0, sy, -5, 12, true); sleeve(g, P, sx1, sy, 16, 25, false); hand(g, P, -5, 12); hand(g, P, 16, 25, true); pp(g, 20, 28, P.smoke); pp(g, 20, 23, P.smoke); break;       /* SNUFF WINDUP: the hand out, the fingers open on the flame */
    case 10: sleeve(g, P, sx0, sy, -6, 12, true); sleeve(g, P, sx1, sy, 19, 24, false); hand(g, P, -6, 12); bx(g, 18, 23, 3, 3, P.bone); bx(g, 20, 24, 2, 1, P.bone); pp(g, 22, 24, '#ffffff'); bx(g, 22, 26, 1, 3, '#6a6a7a'); bx(g, 23, 29, 1, 2, '#6a6a7a'); break;   /* the pinch, a thread of smoke */
    case 11: sleeve(g, P, sx0, sy, -9, 13, true); sleeve(g, P, sx1, sy, -3, 22, false); hand(g, P, -9, 13); hand(g, P, -3, 22); censer(g, P, -3, 22, -7, 16, false); break;                        /* FLEE: cowering, the arm across the face */
    default: sleeve(g, P, sx0, sy, -9, 15, true); sleeve(g, P, sx1, sy, 5, 8, false); hand(g, P, -9, 15, true); hand(g, P, 5, 8); censer(g, P, 5, 8, 7, 1, false); for (const [dx, dy] of [[-6, 33], [8, 28]]) { pp(g, dx, dy, '#ffffff'); pp(g, dx + 1, dy + 1, P.smokeHi); }
  }
  return done(c);
}
/* THE SETS: { R, L, white, ax, ay, w, h } as main.js's drawSet wants them */
export function bakeSet(kind, n, w, h) { const Rr = []; for (let i = 0; i < n; i++) Rr.push(kind === 'deadpriest' ? priestFrame(i) : paladinFrame(i, kind));
  const Wt = Rr.map(c => whiten(c)); return { R: Rr, L: Rr.map(flipX), white: { R: Wt, L: Wt.map(flipX) }, ax: AX, ay: AY, w, h }; }
/* THE BESTIARY CARD: the idle (and the second frame a breath on: the star kindling / the censer swinging) at x2, cropped to the figure */
export function bakeCard(kind) {
  const idle = kind === 'deadpriest' ? [priestFrame(0), priestFrame(1)] : [paladinFrame(0, kind), paladinFrame(5, kind)];
  const bb = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let x0 = c.width, x1 = -1, y0 = c.height, y1 = -1; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return { x0, x1, y0, y1 }; };
  const b = bb(idle[0]), bx2 = bb(idle[1]), x0 = Math.min(b.x0, bx2.x0) - 2, x1 = Math.max(b.x1, bx2.x1) + 2, y0 = Math.min(b.y0, bx2.y0) - 2, y1 = Math.max(b.y1, bx2.y1) + 2, k = 2, w = x1 - x0 + 1, h = y1 - y0 + 1;
  const fr = idle.map(s => { const [c, g] = canvas(w * k, h * k); g.imageSmoothingEnabled = false; g.drawImage(s, x0, y0, w, h, 0, 0, w * k, h * k); return c; });
  return { R: fr, L: fr.map(flipX), white: { R: fr.map(c => whiten(c)), L: fr.map(c => flipX(whiten(c))) }, ax: (AX - x0) * k, ay: (AY - y0) * k, w: 14, h: 26 };
}
/* THE DIVINE SHIELD DOME, drawn live: a bubble of light of faceted cells - whole and gold (living), cracked and blue (undead); `k` 0..1 the mend's return */
export function drawDome(g, x, y, cracked, time, seed = 0, k = 1) {
  const rx = 15, ry = 19, a = (0.3 + 0.1 * Math.sin(time * 6 + seed)) * k, col = cracked ? '#9ab0e0' : '#fff6c8', hi = cracked ? '#e0eaff' : '#ffffff';
  g.globalAlpha = a * 0.45; g.fillStyle = cracked ? '#6a80c0' : '#ffd36b'; g.beginPath(); g.ellipse(x, y - 15, rx, ry, 0, 0, Math.PI * 2); g.fill();
  g.globalAlpha = a * 1.8; g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 15, rx, ry, 0, 0, Math.PI * 2); g.stroke();
  g.globalAlpha = a * 1.1; g.beginPath(); g.ellipse(x, y - 15, rx * 0.55, ry, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(x - rx, y - 15); g.lineTo(x + rx, y - 15); g.moveTo(x - rx * 0.8, y - 15 - ry * 0.6); g.lineTo(x + rx * 0.8, y - 15 - ry * 0.6); g.moveTo(x - rx * 0.8, y - 15 + ry * 0.6); g.lineTo(x + rx * 0.8, y - 15 + ry * 0.6); g.stroke();   /* the facets */
  g.globalAlpha = Math.min(1, a * 2.4); g.fillStyle = hi; const sh = Math.floor(time * 3 + seed) % 4; g.fillRect(x - 9 + sh * 2, y - 29 + sh, 3, 1); g.fillRect(x - 8 + sh * 2, y - 30 + sh, 1, 3);   /* a glint walking over it */
  if (cracked) { g.globalAlpha = 0.9 * k; g.strokeStyle = '#14101a'; g.beginPath(); g.moveTo(x - 7, y - 31); g.lineTo(x - 3, y - 24); g.lineTo(x - 6, y - 17); g.lineTo(x - 2, y - 10); g.moveTo(x + 9, y - 22); g.lineTo(x + 4, y - 18); g.lineTo(x + 7, y - 9); g.stroke();
    g.globalAlpha = 0.9 * k; g.strokeStyle = '#e0eaff'; g.beginPath(); g.moveTo(x - 6, y - 31); g.lineTo(x - 2, y - 24); g.lineTo(x - 5, y - 17); g.moveTo(x + 10, y - 22); g.lineTo(x + 5, y - 18); g.stroke(); }
  g.globalAlpha = 1; g.lineWidth = 1; }
/* THE GLEAM: a four-point star with a halo, on the shield (x, y the shield's boss on screen) */
export function drawGleam(g, x, y, time) { const k = Math.floor(time * 16) % 2, s = k ? 6 : 5; g.globalAlpha = 0.35; g.fillStyle = '#fff6c8'; g.fillRect(x - 5, y - 5, 11, 11); g.globalAlpha = 1;
  g.fillStyle = k ? '#ffffff' : '#fff6c8'; g.fillRect(x - s, y, s * 2 + 1, 1); g.fillRect(x, y - s, 1, s * 2 + 1); g.fillRect(x - 1, y - 1, 3, 3); g.fillStyle = '#ffffff'; for (const [dx, dy] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) g.fillRect(x + dx, y + dy, 1, 1); }
/* THE SHATTER: shards of the dome flying (t 0..1 since it broke) */
export function drawShards(g, x, y, t, cracked) { if (t >= 1) return; g.globalAlpha = 1 - t; for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2, d = 6 + t * 26, yy = y - 15 + Math.sin(an) * d * 1.2 + t * t * 18; g.fillStyle = i & 1 ? (cracked ? '#e0eaff' : '#ffffff') : (cracked ? '#9ab0e0' : '#ffd36b'); g.fillRect(R(x + Math.cos(an) * d), R(yy), 2 + (i & 1), 2); } g.globalAlpha = 1; }
/* OVER THEM (main.js, after the bodies): the paladin foe's DIVINE SHIELD dome (whole, cracked, flaring back as it mends), the gleam's star, the shatter's shards; the priest's bolts and his cast glows */
export function drawOver(g, foes, cx, cy, time, isPal, isPri) {
  for (const e of foes) { if (!e.alive) continue; const x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1; if (x < -40 || x > 400) continue;
    if (isPal(e)) { const cr = e.t === 'deadpaladin';
      if (e.shield) drawDome(g, x, y, cr, time, e.x, e.mode === 'mend' ? 0.5 + 0.5 * Math.max(0, 1 - e.modeT / 0.9) : 1);
      if (e.mode === 'shattered' && e.modeT > 0) drawShards(g, x, y, Math.max(0, Math.min(1, 1 - e.modeT / 1.0)), cr);
      if (e.mode === 'mend') { g.globalAlpha = 0.5; for (let i = 0; i < 5; i++) { const t = (time * 1.6 + i / 5) % 1; g.fillStyle = i & 1 ? '#fff6c8' : '#ffd36b'; g.fillRect(x - 10 + ((i * 7) % 20), R(y - 4 - t * 30), 1, 2); } g.globalAlpha = 1; }
      if (e.mode === 'gleamTell') drawGleam(g, x + f * 8, y - 13, time); }
    if (isPri(e)) { for (const b of e.bolts || []) { const bx2 = R(b.x - cx), by = R(b.y - cy), d = Math.sign(b.vx || 1) || 1;   /* THE GRAVE BOLT: a cold skull-bright core, a dragging tail of smoke */
        g.globalAlpha = 0.35; g.fillStyle = '#6a80c0'; g.fillRect(bx2 - 4 * d - (d > 0 ? 12 : 0), by - 1, 12, 3); g.globalAlpha = 0.6; g.fillRect(bx2 - 10 * d - (d > 0 ? 6 : 0), by - 2, 6, 5); g.globalAlpha = 1;
        g.fillStyle = '#9ab0e0'; g.fillRect(bx2 - 4, by - 3, 8, 6); g.fillStyle = '#e0eaff'; g.fillRect(bx2 - 2, by - 2, 4, 4); g.fillStyle = '#ffffff'; g.fillRect(bx2 - 1, by - 1, 2, 2); g.fillStyle = '#14101a'; g.fillRect(bx2 - 1 + d, by - 1, 1, 1); }
      if (/Tell$/.test(e.mode)) { const col = e.mode === 'mendTell' ? '#ff9a5c' : e.mode === 'raiseTell' ? '#6a80c0' : '#9ab0e0';   /* THE CAST GLOW: a ring of smoke gathering round him, the colour of what it will do */
        g.globalAlpha = 0.25 + 0.2 * Math.sin(time * 12); g.fillStyle = col; g.beginPath(); g.arc(x, y - 18, 14, 0, Math.PI * 2); g.fill(); g.globalAlpha = 0.9; g.fillStyle = col;
        for (let i = 0; i < 6; i++) { const t = (time * 1.3 + i / 6) % 1, an = i / 6 * Math.PI * 2 + time * 3; g.fillRect(R(x + Math.cos(an) * (16 - t * 8)), R(y - 18 + Math.sin(an) * (18 - t * 9)), 2, 2); } g.globalAlpha = 1; }
      if (e.mode === 'raiseTell' || e.mode === 'raise') { const fl = e.mode === 'raise'; g.globalAlpha = 0.6; g.fillStyle = '#6a80c0'; for (let i = 0; i < 5; i++) g.fillRect(x + f * (14 + i * 3) - 1, y - 2 - (fl ? ((i * 3) % 7) : 0), 2, 2 + (i & 1)); g.globalAlpha = 1; } } } }
export function sheetItems() { const out = []; for (const k of ['orderpaladin', 'deadpaladin']) for (let i = 0; i < 10; i++) out.push(paladinFrame(i, k)); for (let i = 0; i < 13; i++) out.push(priestFrame(i)); return out; }
