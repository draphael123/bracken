// chars.js — the knight and the forest's enemies, baked from text grids + drawn sword.
import { kingFrames, KING_AX, KING_AY } from './king_swim.js';
import { canvas, px, rect, line, circle, ellipse, fillPoly, fromGrid, outline, flipX, whiten } from './px.js';
import { OUT } from './art.js';

const KP0 = { // knight palette
  s: '#c9d1dc', S: '#7c8797', b: '#3d5aa8', B: '#243a78', r: '#c9463d', k: '#f1c9a0',
  w: '#7a4a2a', W: '#4c2c17', y: '#e0b040', v: '#2a2f3d', o: OUT,
};
let KP = Object.assign({}, KP0);
/* WEAPON SKINS (Daniel 10-02: a weapon skin is the WEAPON, not a recolour of the whole character). A weapon's palette is {s: light, S: dark} and it
   lives HERE, apart from the hero's own palette: the bakers merge a skin into KP, but a weapon is applied only by the weapon-drawing code below
   (WL/WT), so the helm, cloth, armour and skin can never wear a weapon's colours. No weapon (STEEL) = null = every weapon keeps its own colours. */
let WP = null;
export function withWeapon(pal, fn) { const was = WP; WP = pal && pal.s && pal.S ? pal : null; try { return fn(); } finally { WP = was; } }
const hexMix = (a, b, t) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
const WT = (def, t) => WP ? hexMix(WP.S, WP.s, t) : def;   /* a weapon tone: t 0 = the skin's dark, 1 = its light (STEEL: the weapon's own colour) */
const WL = def => WT(def, 1);
/* VISUAL GEAR TIERS (claude/geartiers, Daniel 2026-10-04; the table and the level gate are src/gear-tiers.js). What a hero wears as he levels, drawn through
   the bake pipeline on EVERY pose of EVERY hero: tier 1 a CAPE, tier 2 a CRESTED HELM and gold trim, tier 3 a faint AURA, tier 4 the FULL SET (pauldrons,
   gorget, emblem, buckle, a longer gold-edged cape, a fuller aura). The tier is ambient, like a weapon skin's palette: heroSet() wraps the bake in
   withGear(tier, ...). It is drawn on the BODY ONLY, in the hero's own colours plus one shared gold, and a weapon skin never reaches it (the weapon-drawing
   code below is the only thing that reads WP) - tools/gear-tiers.mjs holds both halves. Tier 0 draws nothing at all, so a bake outside withGear is the old hero. */
let GEAR = 0;
export function withGear(tier, fn) { const was = GEAR; GEAR = tier | 0; try { return fn(); } finally { GEAR = was; } }
const GOLD = { d: '#9a6a1c', m: '#e0b040', l: '#ffe58a' };
/* the top of a head grid: its first row at least three pixels across, and the middle of that run (where a crest stands) */
function headTop(rows) {
  for (let y = 0; y < rows.length; y++) { let best = 0, at = 0, run = 0;
    for (let x = 0; x <= rows[y].length; x++) { if (x < rows[y].length && rows[y][x] !== '.') run++; else { if (run > best) { best = run; at = x - run; } run = 0; } }
    if (best >= 3) return { y, cx: Math.floor(at + (best - 1) / 2) }; }
  return { y: 0, cx: 4 };
}
const edgeCols = row => { const l = row.search(/[^.]/), r = row.length - 1 - [...row].reverse().findIndex(ch => ch !== '.'); return [l, r]; };
/* HOW A CAPE HANGS in a pose: its length and how far it streams back, from the legs the pose stands on */
function capeHang(legs, plume) {
  const run = /^(run|push|wide|skid)/.test(legs), air = /^(jump|fall)/.test(legs), low = /^(crouch|kneel|slide|tuck)/.test(legs);
  return { len: low ? 5 : air ? 8 : 9, stream: run ? 2 : air || legs === 'land' ? 1 : 0, flick: plume | 0 };
}
/* THE CAPE: drawn BEFORE the body, so only the strip behind his back shows. rows 6.. of the body, widening and lagging as he moves; a gold hem (and, in the
   full set, a gold edge down its back). o = the body's origin (x, y), the legs' key and the breath's plume. */
function gearCape(g, ox, oy, legs, plume, rich) {
  const { len, stream, flick } = capeHang(legs, plume), main = hexMix(KP.B, KP.b, 0.45), dark = hexMix(KP.B, '#000000', 0.25), fold = hexMix(KP.b, '#ffffff', 0.12);
  for (let r = 0; r < len; r++) {
    const lx = ox - 1 - Math.floor(r * 0.22) - stream * Math.floor((r + 1) / 3) - (r >= len - 2 ? flick & 1 : 0);
    for (let x = lx; x <= ox + 2; x++) px(g, x, oy + 6 + r, r === len - 1 ? ((x + r) & 1 ? GOLD.d : GOLD.m) : x === lx ? (rich && r % 2 === 0 ? GOLD.m : dark) : x === lx + 2 && r > 1 ? fold : main);
  }
}
/* THE BRIGHT PIECES, drawn over the body before the arms and the weapon: the clasp that holds the cape (1), the crest and the shoulder rims (2), the full
   set (4). head = headTop of this pose's grid; hy lifts the helm (and the crest with it), sho lifts the shoulders. */
function gearFront(g, ox, oy, head, hy, sho, body) {
  const t = GEAR, [l6, r6] = edgeCols(body[6]), [l10, r10] = edgeCols(body[10]), mid = Math.floor((l10 + r10) / 2);
  if (t >= 1) px(g, ox + l6 + 1, oy + 6 - sho, GOLD.m);                                      /* the clasp the cape hangs from */
  if (t >= 2) {
    const cx = ox + head.cx, cy = oy + hy + head.y;                                         /* THE CREST: a gold fin standing up off the crown */
    px(g, cx, cy - 1, GOLD.m); px(g, cx + 1, cy - 1, GOLD.d); px(g, cx, cy - 2, GOLD.l);
    if (t >= 4) { px(g, cx - 1, cy - 1, GOLD.d); px(g, cx + 1, cy - 2, GOLD.m); px(g, cx, cy - 3, GOLD.l); px(g, cx - 1, cy - 2, GOLD.d); }
    px(g, ox + l6, oy + 6 - sho, GOLD.m); px(g, ox + r6, oy + 6 - sho, GOLD.m);             /* the shoulder rims */
    px(g, ox + mid, oy + 10, GOLD.l); px(g, ox + mid + 1, oy + 10, GOLD.m);                  /* the buckle */
  }
  if (t >= 4) {
    for (const [a, b] of [[l6, 1], [r6, -1]]) { px(g, ox + a, oy + 6 - sho, GOLD.l); px(g, ox + a + b, oy + 6 - sho, GOLD.m); px(g, ox + a, oy + 7 - sho, GOLD.m); px(g, ox + a + b, oy + 7 - sho, GOLD.d); }   /* the pauldrons */
    px(g, ox + mid, oy + 8, GOLD.m); px(g, ox + mid + 1, oy + 8, GOLD.l); px(g, ox + mid, oy + 9, GOLD.d); px(g, ox + mid + 1, oy + 9, GOLD.m);   /* the breast emblem */
    const [a5, b5] = edgeCols(body[5]); px(g, ox + a5 + 1, oy + 5 + hy, GOLD.d); px(g, ox + b5 - 1, oy + 5 + hy, GOLD.d);   /* the gorget's two studs */
  }
}
/* THE AURA (tier 3, fuller at 4): a faint warm glow two and three pixels off the BODY'S silhouette (never the weapon: the mask is taken before the weapon
   is drawn) in alpha pixels, and a few motes that lift with the breath. Drawn after the outline, onto empty pixels only. */
function gearAura(c, mask, seed) {
  if (GEAR < 3 || !mask) return;
  const w = c.width, h = c.height, g = c.getContext('2d'), now = g.getImageData(0, 0, w, h).data, rich = GEAR >= 4, body = [];
  for (let i = 0; i < w * h; i++) if (mask.data[i * 4 + 3] > 0) body.push(i);
  const near = new Uint8Array(w * h).fill(9);
  for (const i of body) { const x = i % w, y = (i / w) | 0;
    for (let v = -3; v <= 3; v++) for (let u = -3 + Math.abs(v); u <= 3 - Math.abs(v); u++) { const X = x + u, Y = y + v; if (X < 0 || Y < 0 || X >= w || Y >= h) continue; const d = Math.abs(u) + Math.abs(v), j = Y * w + X; if (d < near[j]) near[j] = d; } }
  g.setTransform(1, 0, 0, 1, 0, 0);
  for (let j = 0; j < w * h; j++) { if (now[j * 4 + 3] !== 0 || near[j] < 2 || near[j] > 3) continue;
    g.fillStyle = near[j] === 2 ? 'rgba(255,233,160,' + (rich ? 0.42 : 0.28) + ')' : 'rgba(255,233,160,' + (rich ? 0.2 : 0.12) + ')'; g.fillRect(j % w, (j / w) | 0, 1, 1); }
  let x0 = w, x1 = 0, y0 = h; for (const i of body) { const x = i % w, y = (i / w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; }
  const motes = rich ? 4 : 2;
  for (let k = 0; k < motes; k++) { const mx = x0 - 2 + ((k * 7 + seed * 3) % Math.max(4, x1 - x0 + 5)), my = y0 + 2 + ((k * 11 + seed * 5) % 17);
    if (mx >= 0 && my >= 0 && mx < w && my < h && now[(my * w + mx) * 4 + 3] === 0) { g.fillStyle = k & 1 ? 'rgba(255,246,208,0.85)' : 'rgba(255,229,138,0.6)'; g.fillRect(mx, my, 1, 1); } }
}
const BODY = [ // 10 wide, rows 0..10 (helmet + torso + belt)
  '..rSSSS...',
  '.rSssssS..',
  'rSsssssS..',
  '.SsvvvvS..',
  '.SssssSS..',
  '..SSSS....',
  '.BbbbbB...',
  'SBbybbBS..',
  'SBbbbbBS..',
  '.BbbbbB...',
  '.wwwwww...',
];
// Plume variants for idle flutter.
const PLUME = [
  ['..rSSSS...', '.rSssssS..', 'rSsssssS..'],
  ['..rSSSS...', 'rrSssssS..', '.SsssssS..'],
  ['.rrSSSS...', '.rSssssS..', 'rSsssssS..'],
];
let BODY_REF = BODY, PLUME_REF = PLUME; // swapped while another hero bakes on the same rig
let BOSS_HORNS = false;   /* (claude/bkpolish) set only while the Blood Knight BOSS bakes (bakeReaperBoss) */
export const BOSS_HORN_TIP = '#d02840';
const LEGS = {
  stand: ['.SS..SS...', '.SS..SS...', '.ww..ww...', '.ww..ww...', 'WWW..WWW..'],
  // six-frame run: stride, gather, pass, extend, stride (other), gather
  run1:  ['.SS...SS..', 'SS.....SS.', 'ww.....ww.', 'ww......ww', 'WW.....WWW'],
  run2:  ['.SS..SS...', '.SS...SS..', '.ww...ww..', '.ww....ww.', 'WWW...WWW.'],
  run3:  ['..SSSS....', '..SSS.....', '..www.....', '..ww.w....', '.WWW.WW...'],
  run4:  ['..SS.SS...', '..SS..SS..', '..ww..ww..', '.ww....ww.', 'WWW...WWW.'],
  run5:  ['SS....SS..', '.SS....SS.', '.ww....ww.', 'ww......ww', 'WWW....WWW'],
  run6:  ['.SSS.SS...', '..SS..SS..', '..ww..ww..', '..ww.ww...', '.WWW.WWW..'],
  runC:  ['..SS.SS...', '.SS...SS..', '.ww....ww.', '.ww....ww.', 'WWW....WWW'],
  jump:  ['..SSSS....', '.SS..SS...', '.ww..ww...', 'WWW..WWW..', '..........'],
  jump2: ['.SS..SS...', '.SS..SS...', 'ww....ww..', 'ww....ww..', 'WW....WW..'],
  fall:  ['.SS..SS...', 'SS....SS..', 'ww....ww..', 'ww....ww..', 'WW....WW..'],
  fall2: ['SS....SS..', 'SS....SS..', 'ww....ww..', 'ww....ww..', 'WW....WW..'],
  crouch:['SS.SS.SS..', 'WWW.ww.WWW', '..........', '..........', '..........'],
  land:  ['.SS..SS...', 'SS....SS..', 'ww....ww..', 'WWW..WWW..', '..........'],
  // DOWN ON ONE KNEE (the Warden setting the spears): the front thigh level, its shin straight down to the boot; the back knee on the turf, the shin laid flat behind
  // THE PUSH-OFF: the front leg straight under him, the back one still extended down and behind, the toe the last thing to leave the ground
  push:  ['.SSSSS....', 'SS..SS....', 'ww...ww...', 'w....ww...', 'W....WWW..'],
  kneel: ['..........', '..........', '.SSSSSSS..', 'SWw...ww..', 'WWWw..WWW.'],
  // THE POKE's tuck: both thighs drawn up level in front of the belt, the shins hanging from the knees, the boots under them
  tuck:  ['..SSSSSSSs..', '..wwwwwwwss.', '........ww..', '........www.', '.......WWWW.'],
  wide:  ['SS.....SS.', 'SS.....SS.', 'ww.....ww.', 'ww.....ww.', 'WWW...WWW.'],
  // on a ladder: one knee up on the higher rung, the other leg straight down to the lower one, then the other way
  climbA:['.SS.SSS...', '.SS..SW...', '.ww.WWW...', '.ww.......', 'WWW.......'],
  /* THE BUTT-SLIDE (src/slide.js): sat on the ground, the legs run out level in front of him, the boots toes-up at the end; the lower row is the boot row, so it stands on the same line as the standing hero (tools/slide.mjs) */
  slide: ['....SSSSSwW.', '....wwwwwWWW'],
  climbB:['.SSSS.SS..', '.WWW..SS..', '......ww..', '......ww..', '.....WWW..'],
};
const W = 34, H = 32, BX = 11, BY = 6; // body drawn at (BX,BY); feet bottom at BY+16 = 22
export const KNIGHT_ANCHOR = { ax: 16, ay: 22 };
/* THE KITE AT HIS SIDE. The knight's shield only existed in the two frames where he raised it, so the one hero who
   carries a shield looked like he had none. Lowered it is this: five by eight, the same steel rim, oak face and gold
   cross as the raised one, small enough that the sword arm crosses in front of it and the helm still reads above it. */
const KITE = ['.SSS.', 'SswwS', 'SwywS', 'SyyyS', 'SwywS', 'SwwwS', '.SwS.', '..S..'];

/* A WIDER FRAME FOR A LONGER WEAPON. The Warden's point lands forty-four pixels out and the knight's sword only
   twenty-six, which is already drawn to the edge of a 34-wide frame. `wide` adds canvas ON THE RIGHT ONLY, so her
   body centre stays at BX+8 and the set's single anchor still reads: drawSet mirrors with `c.width - set.ax`, which
   is measured off each frame's own canvas, so a 52-wide thrust flips to the right place beside a 34-wide idle.
   The rule this serves is the one the greatsword learned: the blow may not reach where the art never went. */
let SPEARLESS = false;
let ONEAXE = false;   /* THE BERSERKER's BARE set (his off axe is thrown): every frame, the lead axe only */   /* baking the Warden's BARE set (her JAVELIN is out of her hands): every frame, no spear */
function knightFrame({ legs = 'stand', dy = 0, dx = 0, sword = null, arm = null, plume = 0, shield = false, legsDy = 0, staff = null, maul = null, glow = null, cutlass = null, pistol = null, hook = null, scythe = null, greatsword = null, spear = null, wide = 0, hy = 0, sho = 0, bits = null, kite = null, top = 0, arm2 = null, stave = null, axe = null, axe2 = null, nock = null, butt = 8 }) {   /* (butt: how far the war hammer's haft runs past the hand - 8, or less where the butt stands on the floor: batch97 integ, crouch-feet) */
  const [c, g] = canvas(W + wide, H + top); g.translate(0, top);
  const BZ = BODY_REF === BZ_BODY, rgo = BZ ? [[BX + dx + 4, top + BY + dy + hy + 3, '#ff2a1a'], [BX + dx + 5, top + BY + dy + hy + 3, '#c01c14']] : null;   /* (claude/bzart) his RAGE overlay: red eyes and veins, laid over him by drawSet while his rage is up */
  if (GEAR >= 1) gearCape(g, BX + dx, BY + dy, legs, plume, GEAR >= 4);   /* (tier 1+: behind everything, the body covers all but the strip at his back) */
  const draw = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const k = r[x]; if (k !== '.' && KP[k]) px(g, ox + x, oy + y, KP[k]); } });
  const body = PLUME_REF[plume].concat(BODY_REF.slice(3));
  if (BODY_REF === RG_BODY) { if (stave && stave[4] === 'back') rgBowAt(g, stave, dx, dy, null); rgCloakAt(g, BX + dx, BY + dy, legs, plume); rgQuiverAt(g, BX + dx, BY + dy + hy); }   /* (claude/ranger) THE QUIVER on her back, fletchings over her shoulder: behind everything */
  if (kite && kite.back) draw(KITE, BX + dx + kite.x, BY + dy + kite.y);   /* slung on his back (the ladder): drawn first, so the body covers all but its rim */
  if (!hy && !sho) draw(body, BX + dx, BY + dy);
  else { /* A BREATH IS NOT A BOB. The shoulders come up first - the outermost pixel of each torso row lifts one - and the
       helm has its own offset, so the chest can rise under a head that has not moved yet, and the head can sink after it. */
    body.slice(6).forEach((r, y) => { const l = r.search(/[^.]/), rr = r.length - 1 - [...r].reverse().findIndex(ch => ch !== '.');
      for (let x = 0; x < r.length; x++) { const k = r[x]; if (k !== '.' && KP[k]) px(g, BX + dx + x, BY + dy + 6 + y - (y < 4 && (x === l || x === rr) ? sho : 0), KP[k]); } });
    if (hy < 0) draw([body[5]], BX + dx, BY + dy + 5);   /* a lifted helm stretches the neck rather than leaving a gap under it */
    draw(body.slice(0, 6), BX + dx, BY + dy + hy); }
  draw(LEGS[legs], BX + dx, BY + 11 + legsDy);
  if (BOSS_HORNS && BODY_REF === REAP_BODY) { const hx = BX + dx, hyy = BY + dy + hy;   /* (claude/bkpolish) THE BOSS'S HORNS: each grown out and up in a bull's curve, a bone-dark base to a blood-red tip (BOSS_HORN_TIP - bkHeroSet keeps it from being darkened), so he and the hero read apart on sight */
    for (const [ox, oy, c] of [[-1, 1, 'v'], [-1, 0, 'v'], [-2, -1, 'v'], [-2, -2, 'v'], [-2, -3, 'v'], [-1, -4, 'T'], [-2, -4, 'T'], [10, 1, 'v'], [10, 0, 'v'], [11, -1, 'v'], [11, -2, 'v'], [11, -3, 'v'], [10, -4, 'T'], [11, -4, 'T']]) px(g, hx + ox, hyy + oy, c === 'T' ? BOSS_HORN_TIP : KP.v); }
  if (BODY_REF === RG_BODY) rgFeatherAt(g, BX + dx, BY + dy + hy, plume);   /* (claude/rangerart) THE RED FEATHER off the hood */
  if (GEAR) gearFront(g, BX + dx, BY + dy, headTop(body.slice(0, 6)), hy, sho, body);
  if (kite && !kite.back) draw(KITE, BX + dx + kite.x, BY + dy + kite.y);   /* on the off arm across his front: under the sword arm, over the tabard */
  if (arm2) line(g, arm2[0] + dx, arm2[1] + dy, arm2[2] + dx, arm2[3] + dy, KP.S, 2);
  if (arm2 && BODY_REF === RG_BODY) rgBracerAt(g, arm2, dx, dy);
  if (BZ && arm2) bzArmInk(g, rgo, arm2, dx, dy, top);   /* THE OFF ARM, drawn only where an ability puts it to work (a throw, a cry): over the kite, under the sword arm */
  /* THE BERSERKER'S HAND AXES (claude/berserker). Given [hand x, hand y, head x, head y, side]: a short oak haft out of the fist (its knob two
     past the hand), and at the end a BEARDED HEAD - a blade three pixels out on the +side, longest at its lower horn, with a bright edge, and a
     stub of spike on the back. side +1 puts the edge forward when the axe is held up (and down when it is held out level). Only the head takes
     a weapon skin (WT/WL). axe2 is the off hand's, drawn under the lead arm; ONEAXE (the bare set) leaves it out. */
  const axeAt = (spec, mine) => { if (!spec) return; const [x0, y0, x1, y1] = spec.slice(0, 4).map((v, i) => v + (i & 1 ? dy : dx)), side = spec[4] || 1;
    if (!mine) return hatchetAt(g, spec, dx, dy);   /* (claude/bzart) THE OFF AXE IS A HATCHET: a different tool in the other fist */
    const len0 = Math.hypot(x1 - x0, y1 - y0) || 1, len = Math.min(12, len0), ax = (x1 - x0) / len0, ay = (y1 - y0) / len0, qx = -ay * side, qy = ax * side;   /* A HAND AXE IS SHORT: a pose that asks for more reach (the rising cut, the sweep) gets the head at the haft's own length along it */
    const at = (t, o = 0) => [Math.round(x0 + ax * t + qx * o), Math.round(y0 + ay * t + qy * o)];
    for (let t = -2; t <= len - 1; t += 0.5) px(g, ...at(t), t < 1 ? '#4a2e18' : '#7a5230');   /* the haft, the grip darker */
    px(g, ...at(-2), '#2e1c0e');                                                                 /* the knob */
    for (const [t, o, k] of [[len - 3, 1, 0.35], [len - 2, 1, 0.45], [len - 1, 1, 0.5], [len, 1, 0.45], [len - 2, 2, 0.6], [len - 1, 2, 0.7], [len, 2, 0.65], [len + 1, 2, 0.55], [len - 3, 2, 0.5]]) px(g, ...at(t, o), WT('#9aa4b2', k));   /* the cheek of the blade */
    for (const t of [len - 3, len - 2, len - 1, len, len + 1]) px(g, ...at(t, 3), WL('#e8eef6'));   /* THE EDGE: the brightest thing he owns */
    px(g, ...at(len + 1, 3.6), WL('#ffffff'));                                                    /* the beard's horn */
    px(g, ...at(len - 1, 0), '#4a4e56'); px(g, ...at(len, 0), WT('#6a727e', 0.2));                /* the socket over the haft */
    px(g, ...at(len - 0.5, -1), WT('#5a626e', 0.15));                                             /* the spike on its back */
    if (mine) { const tp = at(len + 1, 2); c.axeTip = [tp[0], tp[1] + top]; } };
  axeAt(ONEAXE ? null : axe2, false);
  if (arm) line(g, arm[0] + dx, arm[1] + dy, arm[2] + dx, arm[3] + dy, KP.S, 2);
  if (arm && BODY_REF === RG_BODY) rgBracerAt(g, arm, dx, dy);
  if (BZ && arm) bzArmInk(g, rgo, arm, dx, dy, top);
  const gearMask = GEAR >= 3 ? g.getImageData(0, 0, c.width, c.height) : null;   /* the hero so far - no weapon yet: the aura follows HIM */
  axeAt(axe, true);   /* (the lead axe over the lead arm's fist) */
  if (sword && BODY_REF === RG_BODY) rgKnifeAt(g, sword, dx, dy);   /* (claude/rangerart) HER HUNTING KNIFE: a short steel blade, a leather grip, a small guard */
  else if (sword) {
    const [x0, y0, x1, y1] = sword.map((v, i) => v + (i & 1 ? dy : dx));
    line(g, x0, y0, x1, y1, WL(KP.s), 2); if (WP) line(g, x0, y0 + 1, x1, y1 + 1, WP.S, 1);   /* the blade (and, in a weapon skin, its dark edge) */
    px(g, x0, y0, KP.w); px(g, x0 + 1, y0, KP.w);
    const gx = Math.sign(x1 - x0), gy = Math.sign(y1 - y0);
    px(g, x0 + gx - gy, y0 + gy + gx, KP.y); px(g, x0 + gx + gy, y0 + gy - gx, KP.y);
  }
  if (staff) { // a wooden staff with an ember at its head
    const [x0, y0, x1, y1] = staff.map((v, i) => v + (i & 1 ? dy : dx));
    line(g, x0, y0, x1, y1, KP.w, 2); px(g, x1, y1, KP.y); px(g, x1 + Math.sign(x1 - x0), y1 + Math.sign(y1 - y0), KP.r); px(g, x1 - Math.sign(y1 - y0), y1 + Math.sign(x1 - x0), KP.r);
  }
  if (maul) { // THE PALADIN'S WAR HAMMER (claude/paladin3art, was the flanged maul): ~70% of the old maul. The long oak haft wound with leather stays; the head is now a COMPACT
    // SQUARE BLOCK - a flat strike face with a bright rim, a narrower back with a gold collar behind it, a rivet band - read by its square silhouette at game scale. BOTH hands are on the haft in every pose (the sword
    // arm at the grip, the off hand a stride up the haft, or wherever an ability's own off arm lands). ONLY the head (core, flanges, stud, spike) takes a weapon
    // skin (WT); the haft, wrap, socket and gauntlets keep their own colours.
    const [x0, y0, x1, y1] = maul.map((v, i) => v + (i & 1 ? dy : dx));
    const len = Math.hypot(x1 - x0, y1 - y0) || 1, ax = (x1 - x0) / len, ay = (y1 - y0) / len, qx = -ay, qy = ax;
    const at = (t, o = 0) => [Math.round(x0 + ax * t + qx * o), Math.round(y0 + ay * t + qy * o)];
    line(g, ...at(-butt), ...at(len - 2), '#6a4428', 2);                                       // the LONG haft, its butt eight past the hand (the head is small; the haft is the weapon)
    px(g, ...at(-butt + 1), '#8a5a34'); px(g, ...at(-butt + 2, 1), '#3a2412');
    for (let t = -4; t <= 6; t++) { px(g, ...at(t), t & 1 ? '#8a5a34' : '#3a2412'); px(g, ...at(t, 1), t & 1 ? '#3a2412' : '#8a5a34'); }   // the grip wrap
    px(g, ...at(-butt), KP.y); px(g, ...at(-butt, 1), KP.y);                                       // the gold butt-cap
    const hx = x1 - ax * 1.5, hy = y1 - ay * 1.5;
    const ROWS = { '-3': 1.5, '-2': 2.5, '-1': 3.5, 0: 3.5, 1: 3.5, 2: 3.5, 3: 3.5 };                                      // half-width by step along the haft: gold collar, the back, the block (three rows), the strike face
    const inside = new Map(), key = (X, Y) => X + ',' + Y;
    for (let X = Math.floor(hx) - 6; X <= Math.ceil(hx) + 6; X++) for (let Y = Math.floor(hy) - 6; Y <= Math.ceil(hy) + 6; Y++) {
      const ox = X - hx, oy = Y - hy, t = Math.round(ox * ax + oy * ay), o = ox * qx + oy * qy, hw = ROWS[t];
      if (hw === undefined || Math.abs(o) > hw + 0.01) continue;
      const lit = o < -0.5, dark = o > 0.5, rim = Math.abs(o) > hw - 0.9;
      inside.set(key(X, Y), t === -3 ? KP.y : t === 3 ? WT('#e8eef6', rim ? 0.55 : 1) : t === -2 ? WT('#aab6c6', lit ? 0.7 : dark ? 0.2 : 0.45) : (t === 0 && !rim && Math.abs(o) < 1.2) ? KP.y : t === 1 && rim ? WT('#aab6c6', 0.1) : WT('#aab6c6', lit ? 0.95 : dark ? 0.3 : 0.6));
    }
    for (const k of [...inside.keys()]) { const [X, Y] = k.split(',').map(Number); for (const [u, v] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!inside.has(key(X + u, Y + v))) px(g, X + u, Y + v, KP.o); }
    for (const [k, c] of inside) { const [X, Y] = k.split(',').map(Number); px(g, X, Y, c); }
    const t2 = Math.max(3, Math.min(6, len - 7)), h2 = arm2 ? [arm2[2] + dx, arm2[3] + dy] : at(t2);
    if (!arm2) { const vx = BX + 3 + dx - h2[0], vy = BY + 8 + dy - h2[1], vl = Math.hypot(vx, vy) || 1, k = Math.min(1, 3.5 / vl); line(g, Math.round(h2[0] + vx * k), Math.round(h2[1] + vy * k), h2[0], h2[1], KP.S, 2); }                      // the off arm across to the haft
    for (const [hx2, hy2] of [at(0), h2]) { px(g, hx2, hy2, KP.S); px(g, hx2 + 1, hy2, KP.S); px(g, hx2, hy2 + 1, KP.S); px(g, hx2 + 1, hy2 + 1, KP.s); }   // the gauntlets
  }
  if (spear && !SPEARLESS) { // THE WARDEN'S SPEAR: an ash haft, a bronze collar, a long leaf head, and an iron spike at the heel.
    // A sword is read by its blade and a spear by its LENGTH and its POINT, so the haft is one clean pixel the whole
    // way out and every bright pixel is saved for the last four. At sixteen pixels that point is the entire hero.
    const [x0, y0, x1, y1] = spear.map((v, i) => v + (i & 1 ? dy : dx));
    const len = Math.hypot(x1 - x0, y1 - y0) || 1, ax = (x1 - x0) / len, ay = (y1 - y0) / len, qx = -ay, qy = ax;
    const at = (t, o = 0) => [Math.round(x0 + ax * t + qx * o), Math.round(y0 + ay * t + qy * o)];
    line(g, ...at(-4), ...at(len - 5), '#8a6a42', 1);                    // the haft, heel to collar
    px(g, ...at(-3, 1), '#6a5030');                                      // a bound grip where her back hand sits
    px(g, ...at(-5), '#7c8797'); px(g, ...at(-6), '#c9d1dc');            // the butt-spike: she fights with both ends
    px(g, ...at(len - 5), KP.y);                                         // the collar the head is socketed into
    for (let t = 4; t >= 1; t--) {                                       // the head: a leaf, widest at its base
      px(g, ...at(len - t), t > 2 ? WT('#8a939f', 0.35) : WT('#e8eef6', 1));
      if (t === 3 || t === 2) px(g, ...at(len - t, 1), WT('#7c8797', 0.2));
    }
    px(g, ...at(len), '#ffffff');                                        // the point, the brightest pixel she owns
  }
  if (stave && BODY_REF === RG_BODY) { if (stave[4] !== 'back') rgBowAt(g, stave, dx, dy, nock); }   /* (claude/ranger) THE RANGER'S LONGBOW: her rig is the Geomancer's, and where the staff would be the bow is */
  else if (stave) { /* THE GEOMANCER'S STAFF (round 3, 2026-09-24: Daniel played her and the standing stone on a shaft read as a CLUB, or a
       SHOVEL). Now a TALL STAFF: a gnarled shaft one pixel through that wanders a pixel either way along its length, with knots
       standing off it; an iron-shod BUTT (the end she strikes the ground with); and at the top an AMBER GEODE held in STONE CLAWS
       - two grey prongs curling up round a bright amber stone, the brightest thing she owns, a moss tuft on one claw. The geode is
       the read: at 1x it is an orange point at the top of a long thin line, which is a staff and nothing else.
       Given butt first: [butt x, butt y, head x, head y]; nothing is drawn past len (the attack boxes were matched to it), and the
       geode's centre is kept on the canvas (c.tip) so geomancer.js can set stones orbiting it while she casts. */
    const [x0, y0, x1, y1] = stave.map((v, i) => v + (i & 1 ? dy : dx));
    const len = Math.hypot(x1 - x0, y1 - y0) || 1, ax = (x1 - x0) / len, ay = (y1 - y0) / len, qx = -ay, qy = ax;
    const at = (t, o = 0) => [Math.round(x0 + ax * t + qx * o), Math.round(y0 + ay * t + qy * o)];
    const bend = t => (t % 7 < 2 ? 0 : t % 7 < 4 ? 0.6 : t % 7 < 5 ? 0 : -0.6);   /* GNARLED: it wanders a pixel off the straight and back */
    for (let t = 1; t <= len - 4; t += 0.5) px(g, ...at(t, bend(Math.floor(t))), '#6a4e30');   /* the shaft */
    for (const t of [4, 9, 14, 19]) if (t < len - 5) { px(g, ...at(t, bend(t) + 1), '#7c5c38'); px(g, ...at(t + 1, bend(t + 1) - 1), '#4a3420'); }   /* the knots, lit on one side */
    px(g, ...at(0), '#8a929c'); px(g, ...at(-1), '#c9d1dc');   /* the iron shoe of the butt */
    /* THE CLAWS: two prongs of grey stone out of the head of the shaft, curling up and in round the geode */
    for (const s of [-1, 1]) { px(g, ...at(len - 4, s), '#6c6a60'); px(g, ...at(len - 3, s * 2), '#8c8a7e'); px(g, ...at(len - 2, s * 2), '#8c8a7e'); px(g, ...at(len - 1, s * 2), '#a8a696'); px(g, ...at(len, s), '#a8a696'); }
    px(g, ...at(len - 4, 0), '#4e4c45');   /* the socket */
    /* THE GEODE: a knot of amber in the claws, a dark facet at its foot and one near-white spark of light in it */
    for (const [t, o, col] of [[len - 3, 0, WT('#b8741c', 0.1)], [len - 2, -1, WT('#e8a83a', 0.6)], [len - 2, 0, WT('#e8a83a', 0.6)], [len - 2, 1, WT('#d08a24', 0.35)], [len - 1, -1, WT('#e8a83a', 0.6)], [len - 1, 0, WT('#ffc860', 0.85)], [len - 1, 1, WT('#e8a83a', 0.6)], [len, 0, WT('#e8a83a', 0.6)], [len - 1, -0.5, WT('#fff0c0', 1)]]) px(g, ...at(t, o), col);
    px(g, ...at(len - 2, -2.5), '#6f9a4a');   /* moss on a claw */
    const tp = at(len - 1.5); c.tip = [tp[0], tp[1] + top];   /* (the geode's centre, in this canvas - padHeroFrames carries it down with the headroom) */
  }
  /* (the head is inked from len-4 to len and the outline puts a dark ring a pixel past that, so a spear given a point
     at x lands its last lit pixel at x and its outline at x+1: the callers pull their endpoints back to suit, and the
     measured extent - not the number in the call - is what the attack box is matched to) */
  if (cutlass) { // A CURVED BLADE: a basket of brass at the hand, then a back that bends away and a bright edge
    const [x0, y0, x1, y1] = cutlass.map((v, i) => v + (i & 1 ? dy : dx));
    const len = Math.hypot(x1 - x0, y1 - y0) || 1, ax = (x1 - x0) / len, ay = (y1 - y0) / len, qx = -ay, qy = ax;
    for (let t = 0; t <= len; t++) {                       // the curve: it bows a pixel and a half off the straight
      const k = t / len, bend = Math.sin(k * Math.PI) * 1.7;
      const bx = x0 + ax * t + qx * bend, by = y0 + ay * t + qy * bend;
      px(g, Math.round(bx), Math.round(by), k > 0.82 ? WT('#ffffff', 1) : WT('#d8dee8', 0.8));
      px(g, Math.round(bx - qx), Math.round(by - qy), k > 0.5 ? WT('#8a939f', 0.4) : WT('#6e7885', 0.2));
    }
    px(g, Math.round(x0 - ax), Math.round(y0 - ay), '#3a2a18');                                   // the grip
    for (const [ox, oy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) px(g, Math.round(x0 + ox * qx - ax * 0.4), Math.round(y0 + oy * qy - ay * 0.4), '#e0b040');
  }
  if (pistol) { // A SHORT PISTOL: a brass barrel, a walnut butt, and the lock over the hand
    const [x0, y0, x1, y1] = pistol.map((v, i) => v + (i & 1 ? dy : dx));
    const len = Math.hypot(x1 - x0, y1 - y0) || 1, ax = (x1 - x0) / len, ay = (y1 - y0) / len, qx = -ay, qy = ax;
    line(g, x0, y0, x1, y1, WT('#c9a85a', 0.6), 2);
    px(g, Math.round(x1), Math.round(y1), WT('#fff0c0', 1)); px(g, Math.round(x1 - ax), Math.round(y1 - ay), WT('#e0c070', 0.8));
    for (let t = 0; t <= 3; t++) px(g, Math.round(x0 - ax * t + qx * t * 0.9), Math.round(y0 - ay * t + qy * t * 0.9), t > 1 ? '#4a2e18' : '#6a4428');
    px(g, Math.round(x0 + ax + qx), Math.round(y0 + ay + qy), '#8a8f98');                           // the lock
  }
  if (hook) { // THE GRAPNEL, on its line
    const [x0, y0, x1, y1] = hook.map((v, i) => v + (i & 1 ? dy : dx));
    line(g, x0, y0, x1, y1, '#c9b27c', 1);
    const ax = Math.sign(x1 - x0) || 1, ay2 = Math.sign(y1 - y0) || -1;
    px(g, Math.round(x1), Math.round(y1), '#8a939f'); px(g, Math.round(x1 + ax), Math.round(y1), '#c9d1dc');
    px(g, Math.round(x1), Math.round(y1 + ay2), '#c9d1dc'); px(g, Math.round(x1 + ax), Math.round(y1 + ay2), '#8a939f');
  }
  if (greatsword) { // THE GREATSWORD: a straight bar of steel as long as he is, held in both hands.
    // A scythe is read by its CURVE and a two-hander by its LENGTH and its CROSS - so the guard is drawn
    // wide and the fuller is drawn all the way up, or at sixteen pixels it is just a stick.
    const [x0, y0, x1, y1] = greatsword.map((v, i) => v + (i & 1 ? dy : dx));
    const len = Math.hypot(x1 - x0, y1 - y0) || 1, ax = (x1 - x0) / len, ay = (y1 - y0) / len, qx = -ay, qy = ax;
    line(g, Math.round(x0 - ax * 4), Math.round(y0 - ay * 4), Math.round(x0 + ax), Math.round(y0 + ay), '#2a2218', 2);   /* the long grip */
    px(g, Math.round(x0 - ax * 5), Math.round(y0 - ay * 5), '#8a7a5a');                                                  /* the pommel */
    px(g, Math.round(x0 - ax * 6), Math.round(y0 - ay * 6), '#5a4e38');
    line(g, Math.round(x0 + ax * 2), Math.round(y0 + ay * 2), Math.round(x1 - ax * 2), Math.round(y1 - ay * 2), WT('#7a828e', 0.3), 3);  /* the blade, three wide */
    line(g, Math.round(x0 + ax * 2 + qx), Math.round(y0 + ay * 2 + qy), Math.round(x1 - ax * 2 + qx), Math.round(y1 - ay * 2 + qy), WT('#c9d1dc', 1), 1);
    line(g, Math.round(x0 + ax * 3), Math.round(y0 + ay * 3), Math.round(x1 - ax * 4), Math.round(y1 - ay * 4), WT(KP.fuller || '#3e444e', 0), 1);  /* the fuller down the middle (a blood channel for the Blood Knight) */
    for (let t = 4; t < len - 3; t += 5) px(g, Math.round(x0 + ax * t), Math.round(y0 + ay * t), KP.rune || '#8fd160');             /* the runes cut into it */
    px(g, Math.round(x1), Math.round(y1), WT('#eef4fa', 1)); px(g, Math.round(x1 - ax), Math.round(y1 - ay), WT('#eef4fa', 1));        /* the point */
    line(g, Math.round(x0 + ax * 2 - qx * 4), Math.round(y0 + ay * 2 - qy * 4), Math.round(x0 + ax * 2 + qx * 4), Math.round(y0 + ay * 2 + qy * 4), '#8a939f', 2);  /* the cross */
    px(g, Math.round(x0 + ax * 2 - qx * 4), Math.round(y0 + ay * 2 - qy * 4), '#c9d1dc');
    px(g, Math.round(x0 + ax * 2 + qx * 4), Math.round(y0 + ay * 2 + qy * 4), '#c9d1dc');
  }
  if (scythe) { // THE SCYTHE: a long haft, and the blade set across the end of it, curving away and forward.
    // The haft is what he holds; the edge is a whole body-length from his hands, which is the entire hero.
    const [x0, y0, x1, y1] = scythe.map((v, i) => v + (i & 1 ? dy : dx));
    const len = Math.hypot(x1 - x0, y1 - y0) || 1, ax = (x1 - x0) / len, ay = (y1 - y0) / len, qx = -ay, qy = ax;
    line(g, x0, y0, x1, y1, '#6a5a42', 2);                                   // the haft
    line(g, Math.round(x0 - ax * 3), Math.round(y0 - ay * 3), Math.round(x0 - ax), Math.round(y0 - ay), '#3e3428', 2);
    px(g, Math.round(x1 - ax * 4 + qx), Math.round(y1 - ay * 4 + qy), '#8a7a5a');   // the grip band
    const BL = 11;                                                            // the blade, swept off the tip
    for (let t = 0; t <= BL; t++) {
      const k = t / BL, curl = k * k * 3.2;                                   // it curves forward as it goes out
      const bx = x1 + qx * t - ax * curl, by = y1 + qy * t - ay * curl;
      px(g, Math.round(bx), Math.round(by), k > 0.55 ? WT('#eef4fa', 1) : WT('#c9cfd8', 0.7));
      if (k < 0.8) px(g, Math.round(bx - ax), Math.round(by - ay), WT('#7a828e', 0.25));
    }
    px(g, Math.round(x1 + qx * BL - ax * 3.2), Math.round(y1 + qy * BL - ay * 3.2), '#ffffff');
  }
  if (glow) { const [gx, gy] = glow; px(g, gx + dx, gy + dy, '#fff6c8'); px(g, gx + dx - 1, gy + dy, KP.y); px(g, gx + dx + 1, gy + dy, KP.y); px(g, gx + dx, gy + dy - 1, KP.y); px(g, gx + dx, gy + dy + 1, KP.y); }
  if (shield) { // kite shield held out front, covering the torso: steel rim, oak face, gold boss
    const sx = BX + 9 + dx, sy = BY + 4 + dy;
    const rows = ['.SSSSS.', 'SwwwwwS', 'SwwywwS', 'SwyyywS', 'SwwywwS', 'SwwwwwS', 'SwwwwwS', '.SwwwS.', '.SwwwS.', '..SwS..', '...S...'];
    rows.forEach((r, yy) => { for (let xx = 0; xx < r.length; xx++) { const k = r[xx]; if (k !== '.') px(g, sx + xx, sy + yy, k === 'S' ? KP.S : k === 'w' ? KP.w : KP.y); } });
    px(g, sx + 1, sy + 1, KP.s); px(g, sx + 2, sy + 1, KP.s); px(g, sx + 1, sy + 2, KP.s);
  }
  if (bits) for (const [bx, by, k] of bits) { const col = k[0] === '#' ? k : k === 'n' ? WL(KP.s) : KP[k]; if (col) px(g, BX + dx + bx, BY + dy + by, col); }   /* loose pixels, over everything: a glint, a hand, a flap of cloth */
  outline(c, OUT);
  if (rgo) c.rgo = rgo;
  gearAura(c, gearMask, (plume | 0) * 2 + (dy | 0) + (dx | 0) + 8);
  { const W0 = sword || staff || maul || spear || stave || cutlass || greatsword || scythe || axe;   /* WHERE THE BLADE WAS DRAWN (hand, tip), kept for the smear pass: the arc between two beats is read off these, not guessed */
    if (W0) { const hd = arm ? [arm[2] + dx, arm[3] + dy] : [W0[0] + dx, W0[1] + dy]; c.wp = { p: [hd[0], hd[1] + top], t: [W0[2] + dx, W0[3] + dy + top] }; } }
  { const lr = LEGS[legs] || LEGS.stand; c.feet = top + BY + 11 + legsDy + lr.reduce((n, r, i) => /[^.]/.test(r) ? i : n, 0); }   /* THE ROW HIS BOOTS STAND ON, kept for tools/crouch-feet.mjs: a crouch drawn on the standing legs cut short floats */
  return c;
}
function rotQuarter(c, q) { // rotate a square canvas by q quarter turns
  const [o, g] = canvas(c.width, c.height);
  g.translate(c.width / 2, c.height / 2); g.rotate(q * Math.PI / 2); g.drawImage(c, -c.width / 2, -c.height / 2);
  return o;
}
/* LAID OUT ON THE WATER. A stroke is drawn STANDING - the kick in the legs, the reach in the arm, the weapon where that
   hero keeps it when he swims - and turned a quarter onto its front, so the head leads and the chest is to the bottom.
   The turn pivots on the canvas centre, which leaves the body a hand forward of the anchor and high; it is slid back
   over the anchor and down onto the middle of the hitbox, so a swimmer is drawn where he actually is. */
function laidOut(c, ox, oy) { const r = rotQuarter(c, 1), [o, g] = canvas(c.width, c.height); g.drawImage(r, ox, oy); return o; }
/* THE STROKE, on the knight's rig (and so on everyone who borrows it). The arm goes up past the helm (forward, laid out),
   sweeps down through the front (under him), pushes back along the belt and comes round over the back again, while the
   legs flutter. `hand(hx, hy, ux, uy)` gives the weapon in the stroke hand, `carry` whatever is slung; TREAD is upright,
   the legs working under him and the arm sculling low in front, with its own `tread(i)` carry. */
const STROKE = [[1, -8], [6, -3], [6, 1], [-2, -5]], KICK = ['run1', 'run2', 'run5', 'run4'];
const SCULL = [[5, 2], [6, 4], [5, 3], [4, 1]], TREAD_LEGS = ['run2', 'stand', 'run4', 'stand'], TREAD_DY = [0, 0, 1, 1];
function swimRig(KF, sh, { hand = null, carry = {}, tread = () => ({}), ox = -3, oy = 0 }) {
  const swim = STROKE.map(([ax, ay], i) => { const hx = sh[0] + ax, hy = sh[1] + ay, wx = 0.35, wy = -1, n = Math.hypot(wx, wy);   /* the blade is held to the lead through the whole stroke: it goes where he is going, never hangs under him */
    return laidOut(KF({ legs: KICK[i], plume: i % 3, arm: [sh[0], sh[1], hx, hy], ...carry, ...(hand ? hand(hx, hy, wx / n, wy / n) : {}) }), ox, oy); });
  const treadF = SCULL.map(([ax, ay], i) => KF({ legs: TREAD_LEGS[i], dy: TREAD_DY[i], plume: (i + 1) % 3, arm: [sh[0], sh[1] + TREAD_DY[i], sh[0] + ax, sh[1] + ay + TREAD_DY[i]], ...tread(i) }));
  return { swim, tread: treadF };
}

/* THE RUN OF THREE. The combo is three swings and it drew one: every blow of a run was the same over-the-shoulder
   chop. The second is now a BACKHAND - low behind, up through the front and over - and the third, the heavy cut, a
   THRUST: drawn back level and driven straight through. Weapon ends are offsets from the shoulder, scaled to the
   length of what the hero carries, and held inside the 34x32 frame. The fifth frame is each hero's own settle. */
function comboArcs(sh, key, len, extra = {}) {
  const k = len / 12, s = v => Math.round(v * k);
  const wp = (x0, y0, x1, y1) => ({ [key]: [sh[0] + x0, sh[1] + y0, Math.max(1, Math.min(W - 2, sh[0] + x1)), Math.max(1, Math.min(H - 2, sh[1] + y1))] });
  const f = o => knightFrame({ ...extra, ...o });
  const B = [
    f({ dx: -1, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 2, sh[1] + 4], ...wp(-2, 4, -2 - s(9), 4 + s(4)), plume: 1 }),
    f({ dx: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 3], ...wp(3, 3, 3 + s(10), 3 + s(3)), plume: 2 }),
    f({ dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] - 2], ...wp(4, -2, 4 + s(9), -2 - s(7)), plume: 2 }),
    f({ dx: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 4], ...wp(2, -4, 2 + s(4), -4 - s(10)), plume: 1 }),
  ];
  const T = [
    f({ dx: -2, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 3, sh[1] + 1], ...wp(-3, 1, -3 + s(10), 1), plume: 1 }),
    f({ dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 1], ...wp(4, 1, 4 + s(12), 1), plume: 2 }),
    f({ dx: 2, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 5, sh[1] + 1], ...wp(5, 1, 5 + s(13), 2), plume: 2 }),
    f({ dx: 1, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 3], ...wp(3, 3, 3 + s(9), 3 + s(5)), plume: 0 }),
  ];
  /* THE AIR SLASH: legs tucked, the blade taken round the body from behind and low, through the front, and up */
  const A = [
    f({ legs: 'jump2', dy: -1, arm: [sh[0], sh[1], sh[0] - 3, sh[1] + 1], ...wp(-3, 1, -3 - s(9), 1 + s(3)), plume: 1 }),
    f({ legs: 'jump2', dy: -1, arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 2], ...wp(4, 2, 4 + s(11), 2 + s(4)), plume: 2 }),
    f({ legs: 'jump', dy: -1, arm: [sh[0], sh[1], sh[0] + 4, sh[1] - 1], ...wp(4, -1, 4 + s(12), -1 - s(2)), plume: 2 }),
    f({ legs: 'jump', arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 3], ...wp(2, -3, 2 + s(7), -3 - s(8)), plume: 1 }),
  ];
  /* THE FIDGET, for standing about: the weapon up onto the shoulder, a roll of the shoulder under it, and down again */
  const I = [
    f({ legs: 'stand', arm: [sh[0], sh[1], sh[0] + 1, sh[1] - 3], ...wp(1, -3, 1 - s(7), -3 - s(6)), plume: 1 }),
    f({ legs: 'stand', dy: 1, arm: [sh[0], sh[1], sh[0] + 1, sh[1] - 2], ...wp(1, -2, 1 - s(7), -2 - s(6)), plume: 2 }),
    f({ legs: 'stand', arm: [sh[0], sh[1], sh[0] + 1, sh[1] - 3], ...wp(1, -3, 1 - s(7), -3 - s(6)), plume: 0 }),
  ];
  return { B, T, A, I };
}
/* ROOM ABOVE THE HAT. A rising weapon used to be clipped at the old frame's top and borrowed an air slash.
   All poses gain the same transparent headroom and anchor shift, leaving their feet exactly where they were.
   The new cuts can then travel overhead; the low blow bends at the knees and keeps its edge at ankle height. */
const ATTACK_HEADROOM = 24;
function padHeroFrames(F) {
  const memo = new Map(), pad = c => { if (!memo.has(c)) { const [out, g] = canvas(c.width, c.height + ATTACK_HEADROOM); g.drawImage(c, 0, ATTACK_HEADROOM); if (c.wp) out.wp = { p: [c.wp.p[0], c.wp.p[1] + ATTACK_HEADROOM], t: [c.wp.t[0], c.wp.t[1] + ATTACK_HEADROOM] }; if (c.tip) out.tip = [c.tip[0], c.tip[1] + ATTACK_HEADROOM]; if (c.rgo) out.rgo = c.rgo.map(([x, y, col]) => [x, y + ATTACK_HEADROOM, col]); if (c.feet !== undefined) out.feet = c.feet + ATTACK_HEADROOM; memo.set(c, out); } return memo.get(c); };   /* (c.tip: the Geomancer's geode, carried down with the frame) */
  for (const key in F) F[key] = Array.isArray(F[key]) ? F[key].map(c => c ? pad(c) : c) : pad(F[key]);
}
/* THE SMEAR (claude/herokeys, Daniel 10-09 art direction: "a rotated sprite, not drawn frames"). A swing is a blade at one angle in one beat and another in the
   next; between them the eye wants the ARC. For each strike beat of a hero's light chain and heavy, the blade's drawn hand and tip are read off the beat
   before (c.wp, kept by the frame bakers) and the sector the blade swept is filled in hard pixels: a bright core against the blade, a checker dither behind
   it, a sparse dither at the tail, tapering to a crescent - only onto EMPTY pixels, so it never covers a body or a weapon, and never farther out than the
   blade itself reaches (the attack boxes are data and were never matched to the drawn frame: nothing here moves one). A near-straight thrust gets two
   speed lines along the line the point travelled instead. ART ONLY: no timer, box, cost or cancel window reads any of this. */
const SMEAR_COL = { steel: ['#ffffff', '#d4def5', '#7f95c0'], gold: ['#fff6c8', '#ffd36b', '#d9a02c'], fire: ['#fff6c8', '#ffb23e', '#ff7a3c'], blood: ['#eef4fa', '#d65a68', '#8a2030'], stone: ['#fff0c0', '#e0b050', '#8f7a52'], crimson: ['#ff7a88', '#c8283c', '#5e0c18'] };   /* (claude/dk2art: crimson - the Death Knight's own blood trail: a hot white-pink core, a wet red body, a near-black rim) */
function smearBeat(cur, prev, cols, o = {}) {
  if (!cur || !prev || !cur.wp || !prev.wp) return;
  const g = cur.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); const W2 = cur.width, H2 = cur.height, img = g.getImageData(0, 0, W2, H2), d = img.data;
  const [hx, hy] = cur.wp.p, [tx, ty] = cur.wp.t, gx = prev.wp.t[0] + (hx - prev.wp.p[0]), gy = prev.wp.t[1] + (hy - prev.wp.p[1]);
  const L = Math.hypot(tx - hx, ty - hy); if (L < 6) return;
  const ac = Math.atan2(ty - hy, tx - hx); let dl = Math.atan2(gy - hy, gx - hx) - ac; while (dl > Math.PI) dl -= 2 * Math.PI; while (dl < -Math.PI) dl += 2 * Math.PI;
  const maxA = (o.max || 80) * Math.PI / 180; if (Math.abs(dl) > maxA) dl = Math.sign(dl) * maxA;
  const put = (x, y, col) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= W2 || y >= H2 || (o.floor && y > H2 - o.floor) || d[(y * W2 + x) * 4 + 3]) return; g.fillStyle = col; g.fillRect(x, y, 1, 1); d[(y * W2 + x) * 4 + 3] = 255; };
  if (Math.abs(dl) >= 12 * Math.PI / 180) {
    const steps = Math.ceil(Math.abs(dl) * L * 0.75);
    for (let i = 0; i <= steps; i++) { const k = i / steps, a = ac + dl * k, r0 = L * (0.34 + 0.46 * k), r1 = L * (1 - 0.08 * k);
      for (let r = r0; r <= r1; r += 0.5) { const x = hx + Math.cos(a) * r, y = hy + Math.sin(a) * r, xi = Math.round(x), yi = Math.round(y), rim = r > r1 - 1.1 || i === steps;
        const col = rim ? cols[2] : k < 0.3 ? cols[0] : k < 0.65 ? ((xi + yi) & 1 ? cols[0] : cols[1]) : ((xi + yi) & 1 ? null : cols[1]); if (col) put(x, y, col); } } }
  else {   /* a thrust has no arc: two speed lines laid along the shaft, either side of it, brightest at the point */
    const ux = (tx - hx) / L, uy = (ty - hy) / L, nx = -uy, ny = ux;
    for (const off of [-2, 2]) for (let r = L * 0.5; r <= L * 0.97; r++) if (Math.round(r) % 3 !== 2) put(hx + ux * r + nx * off, hy + uy * r + ny * off, r > L * 0.78 ? cols[0] : r > L * 0.64 ? cols[1] : cols[2]); }
}
/* the strike beats are the second and third frames of a chain and the second of a heavy; each reads the beat before it */
function smearPass(F, cols) { for (const [key, beats] of [['atk', [1, 2]], ['atkB', [1, 2]], ['atkC', [1, 2]], ['heavy', [1, 2]], ['air', [1, 2]], ['crescent', [1, 2]], ['rend', [1, 2]], ['sunder', [1, 2]], ['bloodMoon', [1, 2]]]) { const a = F[key]; if (Array.isArray(a)) for (const i of beats) smearBeat(a[i], a[i - 1], cols, { ...(key === 'crescent' ? { max: i === 1 ? 118 : 70 } : i === 2 ? { max: 55 } : {}), ...(cols === SMEAR_COL.crimson ? { floor: 9 } : {}) });   /* (the Death Knight's blood never smears under the ground) */ } }   /* (claude/dk2art: the crescent cleave's wide arc) */
function storeFrames(card, knight, mode, cols) {
  const F = {};
  if (mode !== 'atk' && mode !== 'weaponIcon') F.idle = card.idle();
  if (mode === true || mode === 'atk' || mode === 'weaponIcon') F.atk = card.atk();
  if (knight && F.idle && F.idle[2]) { const g = F.idle[2].getContext('2d'); g.fillStyle = '#dfe8ff'; g.fillRect(BX + 4, BY + 4, 1, 1); }
  padHeroFrames(F);
  smearPass(F, cols);   /* the same arc the full bake lays on the strike beats, or the card's frames would differ from the game's (claude/herokeys) */
  KP = Object.assign({}, KP0); BODY_REF = BODY; PLUME_REF = PLUME;
  return { R: F };
}
/* THE AIR UP-SLASH TABLES (claude/airupart). Coordinates are pixels from his feet (x forward, y up is negative), angles in degrees from straight ahead,
   counter-clockwise. A beat is: body lean/lift (dx, dy), the legs and how far they are drawn up, the helm lift (hy), the shoulder lift, the plume, and for the
   Pyromancer her trail/hem/cowl; the free arm (arm2) flings back for balance. */
const AIRUP_BODY = [
  { dx: -1, dy: 1, legs: 'jump', legsDy: 0, hy: 0, sho: 0, plume: 1, arm2: 0, trail: 1, feet: [[11, 17], [16, 16]], hemW: 12, cowl: 0 },     /* 0 the coil: crouched, the blade low and forward */
  { dx: 1, dy: -2, legs: 'jump', legsDy: -1, hy: 0, sho: 1, plume: 2, arm2: 2, trail: 2, feet: [[11, 15], [16, 14]], hemW: 11, cowl: 1 },   /* 1 the rise: stretching up, the blade through the front */
  { dx: -1, dy: -3, legs: 'jump', legsDy: -3, hy: -1, sho: 1, plume: 2, arm2: 3, trail: 3, feet: [[11, 14], [15, 13]], hemW: 10, cowl: 2 }, /* 2 the arch: long and bowed back, the blade straight over him */
  { dx: -2, dy: -1, legs: 'jump2', legsDy: -1, hy: 0, sho: 0, plume: 1, arm2: 1, trail: 2, feet: [[11, 16], [16, 15]], hemW: 11, cowl: 0 },   /* 3 the follow-through: the blade gone on behind, the body coming down */
];
const AIRUP_ANG = [4, 48, 102, 134], AIRUP_HAND = [[4, -9], [7, -15], [3, -22], [-1, -18]];
const AIRUP_WEAPON = { sword: { len: 21 }, cutlass: { len: 19, free: true }, greatsword: { len: 23, two: true, hand: [[3, -8], [6, -14], [2, -20], [-1, -17]] },
  maul: { len: 19, two: true, hand: [[2, -9], [4, -19], [1, -21], [4, -13]], ang: [335, 118, 72, 205] }, spear: { len: 27, free: true, hand: [[3, -8], [6, -13], [2, -17], [-1, -15]] },
  staff: { len: 22, two: true }, stave: { len: 23, two: true }, axe: { len: 11 } };   /* (THE BERSERKER: a hand axe; the off one stays at his guard, given in extra) */
function directionalPoses(F, weapon, { make = knightFrame, extra = {}, pyro = false, scale = 1 } = {}) {
  padHeroFrames(F);
  const ay = pyro ? 20 : 22, ax = 16, reach = weapon === 'spear' ? 40 : weapon === 'maul' ? 29 : ['greatsword', 'staff'].includes(weapon) ? 34 : 28;   /* (the war hammer: -15%, PALADIN 3 ART) */
  const pose = (kind, i) => {
    /* THE AIR UP-SLASH, hand-drawn (claude/airupart; combat3 had a procedural stand-in): the blade from low in front, up through the front,
       over his head and on behind it, in the four beats the timing already has (wind-up 0.02 s, the rise to 0.08, the blade OVER him until 0.17 -
       the live box - then the follow-through). Each beat is a body (lean, lift, helm, shoulders, tucked legs, cloth) and a hand with the weapon at
       an angle; the weapon is the same length in every beat, so the arc reads as one swing. */
    if (kind === 'airUp') { const B = AIRUP_BODY[i], W2 = AIRUP_WEAPON[weapon] || AIRUP_WEAPON.sword, ang = (W2.ang ? W2.ang[i] : AIRUP_ANG[i]) * Math.PI / 180;
      const hand = [...(W2.hand ? W2.hand[i] : AIRUP_HAND[i])], minY = -(ay + ATTACK_HEADROOM - (pyro ? 5 : 2));
      let len = W2.len; const tipAt = l => [hand[0] + Math.cos(ang) * l, hand[1] - Math.sin(ang) * l];
      while (len > 8 && (tipAt(len)[1] < minY || tipAt(len)[0] < -15)) len -= 0.5;   /* (a frame is 24 px of headroom and 32 wide: the blade shortens to stay inside it) */
      const tipR = tipAt(len).map(Math.round), xyA = ([x, y]) => [ax + x - (pyro ? 0 : B.dx), ay + y - B.dy], gA = xyA(hand), tA = xyA(tipR), armA = [16, 12 + (B.sho ? -1 : 0), ...gA];
      const arm2 = W2.two ? [11, 11, gA[0] - 2 + (i === 0 ? 1 : 0), gA[1] + 2] : W2.free && B.arm2 ? [11, 11, 8 - B.dx, 15 + B.arm2] : null;   /* (a two-hander holds on with both; the pirate and the warden fling the free arm out for balance; the shielded knight keeps it on the kite) */
      if (pyro) return pyroFrame({ top: ATTACK_HEADROOM, wide: 32, lean: B.dx, dy: B.dy, sit: 0, trail: B.trail, feet: B.feet, hemW: B.hemW, staff: [...gA, ...tA], arm: armA, arm2: arm2 || [11, 11, gA[0] - 3, gA[1] + 2], cowl: B.cowl, flame: i, flick: i % 2 });
      return make({ ...extra, ...(W2.extra ? W2.extra[i] : {}), top: ATTACK_HEADROOM, wide: 32, dx: B.dx, dy: B.dy, legs: B.legs, legsDy: B.legsDy, hy: B.hy, sho: B.sho, plume: B.plume, arm: armA, ...(arm2 ? { arm2 } : {}), [weapon]: [...gA, ...tA] }); }
    const rise = kind === 'rise', dx = [-1, 1, 2, 1][i], dy = rise ? [2, 0, -1, 0][i] : [2, 3, 3, 1][i];
    const end = rise ? [[18, -3], [weapon === 'spear' ? 14 : 24, -25], [weapon === 'spear' ? 8 : 12, weapon === 'spear' ? -43 : -39], [18, -24]][i] : [[14, -12], [reach - 5, -5], [reach - 1, -4], [20, -10]][i];
    if (rise && weapon === 'maul') end[0] = Math.round(end[0] * 0.85);   /* (the war hammer's rising cut reaches 24, not 28) */
    const hand = rise ? [[1, -7], [6, -15], [5, -21], [4, -12]][i] : [[1, -9], [5, -6], [7, -6], [3, -8]][i];
    const xy = ([x, y]) => [ax + Math.round(x / scale) - dx, ay + Math.round(y / scale) - dy];
    const grip = xy(hand), tip = xy(end), arm = [16, 12, ...grip];
    if (pyro) return pyroFrame({ top: ATTACK_HEADROOM, wide: 32, lean: dx, dy, sit: rise ? 0 : 2, trail: i === 1 || i === 2 ? 3 : 1,
      feet: rise && i === 2 ? [[11, 17], [16, 16]] : [[9, 18], [17, 18]], hemW: rise ? 11 : 13,
      staff: [...grip, ...tip], arm, arm2: [11, 11, grip[0] - 3, grip[1] + 2], cowl: i % 3, flame: i, flick: i % 2 });
    return make({ ...extra, top: ATTACK_HEADROOM, wide: 32, dx, dy, legs: rise ? (i === 2 ? 'jump2' : 'wide') : 'crouch',
      arm, [weapon]: [...grip, ...tip], plume: i === 1 || i === 2 ? 2 : 0, sho: i === 2 ? 1 : 0 });
  };
  F.rise = [0, 1, 2, 3].map(i => pose('rise', i)).concat(F.atk[4]);
  F.sweep = [0, 1, 2, 3].map(i => pose('sweep', i)).concat(F.atk[4]);
  F.airUp = [0, 1, 2, 3].map(i => pose('airUp', i)).concat(F.jump ? F.jump[1] || F.jump[0] || F.atk[4] : F.atk[4]);   /* (claude/combat3: the air up-slash, each hero's own weapon and body) */
}

/* THE BREATH, eight beats, for every hero on the knight's rig: [dy, hy, sho, plume]. The shoulders lift, the plume answers
   a beat late, the helm rises last and sinks last. Whatever rests on the ground - a sword point, a maul head - is given
   in ground coordinates by the baker, so the hands ride the chest and the weight stays put. */
const BREATH = [[0, 0, 0, 0], [0, 0, 1, 0], [0, 0, 1, 1], [0, -1, 1, 1], [0, 0, 0, 2], [1, 0, 0, 2], [1, 0, 0, 1], [0, 1, 0, 0]];
const breathLag = i => BREATH[(i + BREATH.length - 1) % BREATH.length][0];   /* cloth hangs where the body was a beat ago */
/* A FLAP of cloth below the belt: its top rides the belt, its bottom edge lags, so it stretches and gathers as he breathes */
const flap = (cols, dy, lag, k1, k2) => cols.flatMap(x => { const o = []; for (let y = 11; y <= 12 + lag - dy; y++) o.push([x, y, y === 11 ? k1 : k2]); return o; });
/* FIDGETS PLAY AT ONE STEP A TENTH: a pose held longer is simply listed more than once */
const holdFrames = seq => seq.flatMap(([f, n]) => Array(n).fill(f));
export function bakeKnight(skin = {}, bare = false, previewOnly = false) {
  KP = Object.assign({}, KP0, skin);
  const sh = [BX + 8, BY + 7]; // shoulder (front)
  /* EVERY FRAME CARRIES THE SHIELD: lowered on the off arm (KITE), square across his front where a frame raises it, and
     none at all in the BARE set - drawn while SHIELD THROW has it out of his hand, which is how you see it is gone */
  const SIDE = { x: 4, y: 6 }, BACK = { x: -3, y: 4, back: true };
  const KF = o => knightFrame({ ...o, shield: !!o.shield && !bare, kite: bare || o.shield ? null : (o.kite || SIDE) });
  const rest = (d = 0) => [sh[0] + 1, sh[1] + 2 + d, sh[0] + 3, sh[1] + 9 + d];
  // A STORE CARD NEEDS ONLY THE BREATH AND THE SWING, not the whole fighting life.
  const card = {
    idle: () => ((previewOnly === 'icon' ? (BREATH).slice(0, 1) : (BREATH)).map(([dy, hy, sho, plume]) => KF({ dy, hy, sho, plume, sword: [sh[0] + 1, sh[1] + 2, sh[0] + 3, sh[1] + 7 - dy] }))),
    atk: () => ([
      () => (// 0 anticipation: sword drawn back over the shoulder, body leans away
      KF({ dx: -2, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 1, sh[1] - 4], sword: [sh[0] - 1, sh[1] - 4, sh[0] - 7, sh[1] - 10], plume: 1 })),
      () => (// 1 swing: blade straight out, body lunges
      KF({ dx: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 1], sword: [sh[0] + 4, sh[1] + 1, sh[0] + 13, sh[1] + 1], plume: 2 })),
      () => (// 2 extended: blade angled down-forward, weight forward
      KF({ dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 3], sword: [sh[0] + 3, sh[1] + 3, sh[0] + 11, sh[1] + 8], plume: 2 })),
      () => (// 3 recover: blade low
      KF({ dx: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 4], sword: [sh[0] + 2, sh[1] + 4, sh[0] + 6, sh[1] + 11], plume: 0 })),
      () => (// 4 settle
      KF({ legs: 'stand', sword: rest(), plume: 0 }))
    ].map((make, i) => (previewOnly === 'weaponIcon' && i > 1) || (previewOnly === 'atk' && i > 2) ? null : make()))
  };
  if (previewOnly) return storeFrames(card, true, previewOnly, SMEAR_COL.steel);
  const F = {
    idle: card.idle(),   /* the point stays in the turf - by one pixel: at +9 it was three under the ground line */
    // run: body bobs, sword arm pumps
    run: [['run1', -1, 0], ['run2', 0, 1], ['run3', 1, 2], ['run4', 0, 1], ['run5', -1, 0], ['run6', 0, 1]].map(([l, dy, pump], i) =>
      KF({ legs: l, dy, plume: i % 3 === 0 ? 2 : 0, sword: [sh[0] + 1 + pump, sh[1] + 2, sh[0] + 4 + pump, sh[1] + 7 - Math.max(0, dy)], legsDy: 0 })),   /* the point skims the ground: it rides the bob up, never down into the turf */
    jump: [
      KF({ legs: 'jump', dy: -1, sword: [sh[0] + 1, sh[1] + 1, sh[0] + 5, sh[1] - 4], plume: 1 }),
      KF({ legs: 'jump2', sword: [sh[0] + 1, sh[1] + 1, sh[0] + 5, sh[1] - 3], plume: 1 }),
    ],
    fall: [
      KF({ legs: 'fall', sword: [sh[0] + 1, sh[1] + 1, sh[0] + 5, sh[1] - 4], plume: 2 }),
      KF({ legs: 'fall2', dy: -1, sword: [sh[0] + 1, sh[1] + 1, sh[0] + 4, sh[1] - 5], plume: 2 }),
    ],
    /* LANDING is three beats: the IMPACT, deep, the knees right under him and the point jarred into the turf; the SETTLE, the knees
       taking the last of it; and he STANDS up out of it (tools/ability-poses.mjs holds the two starters to all three) */
    land: [KF({ legs: 'crouch', legsDy: 3, dy: 4, sword: rest(0), plume: 2 }), KF({ legs: 'land', dy: 2, sword: rest(2), plume: 0 }), KF({ legs: 'stand', dy: 1, sword: rest(1), plume: 1 })],
    /* THE TAKE-OFF: stretched tall off the push, the back toe the last thing on the ground and the blade swung up by the lift of it */
    takeoff: KF({ legs: 'push', dy: -2, sho: 1, sword: [sh[0] + 1, sh[1] + 1, sh[0] + 6, sh[1] - 3], plume: 2 }),
    // THE TOP OF THE JUMP: legs tucked, the blade lifted, the plume settling - the one frame where he hangs
    apex: KF({ legs: 'jump2', dy: -1, sword: [sh[0] + 1, sh[1], sh[0] + 6, sh[1] - 5], plume: 0 }),
    // A SKID: turning at a run, heels dug in and leaning back against his own speed, the blade trailing
    skid: KF({ dx: -2, legs: 'wide', sword: [sh[0] - 1, sh[1] + 3, sh[0] - 6, sh[1] + 8], plume: 2 }),
    climb: [
      KF({ legs: 'climbA', arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 7], sword: [sh[0] - 3, sh[1] - 3, sh[0] - 7, sh[1] + 7], plume: 0, kite: BACK }),
      KF({ legs: 'climbB', dy: 1, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 3], sword: [sh[0] - 3, sh[1] - 3, sh[0] - 7, sh[1] + 7], plume: 1, kite: BACK }),
    ],
    atk: card.atk(),
    /* THE POKE: he tucks into a ball - helm sunk, knees drawn up level in front of him, the shield slung round onto his back - with both
       fists on the grip (gold pommel over the gauntlets, the guard under them) and the blade driven straight down past his boots, point
       first. No arc and no smear: a compact body on a long bright spike, where every swing is an upright man with the steel out ahead.
       The frame is 32 high, so the point stops eight under his feet; drawPokeStreak (main.js) carries the line on. (The warden's goes
       in on the slant: at a glance, a sword under him or a spear ahead of her.) */
    plunge: KF({ legs: 'tuck', hy: 1, kite: BACK, arm: [sh[0], sh[1], sh[0] - 1, sh[1] + 1], sword: [sh[0] - 2, sh[1] + 3, sh[0] - 2, sh[1] + 17], plume: 2,
      bits: [[6, 5, 'y'], [6, 6, 'W'], [5, 7, 'v'], [6, 7, 'v'], [7, 7, 'v'], [5, 8, 'v'], [6, 8, 'v'], [7, 8, 'v'], [6, 9, 'W'], [4, 10, 'y'], [5, 10, 'y'], [6, 10, 'y'], [7, 10, 'y'], [8, 10, 'y'],
        ...[11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(r => [7, r, 'n']), [6, 22, '#ffffff'], [6, 23, '#ffffff'], [6, 24, '#ffffff']] }),
    /* THE DASH ATTACK: his shoulder in behind the shield, square across his front, and the blade driven out past its rim - then the
       full stretch of it, and a stumble to a stop that is the price of it (the third frame is the end-lag) */
    dashAtk: [KF({ wide: 4, dx: 2, dy: 1, legs: 'runC', shield: true, arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 2], sword: [sh[0] + 3, sh[1] + 2, sh[0] + 15, sh[1] + 1], plume: 2 }),
      KF({ wide: 4, dx: 4, dy: 1, legs: 'run1', shield: true, arm: [sh[0], sh[1], sh[0] + 5, sh[1] + 1], sword: [sh[0] + 5, sh[1] + 1, sh[0] + 18, sh[1] + 1], plume: 2 }),
      KF({ dx: 1, dy: 2, legs: 'land', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 3], sword: [sh[0] + 3, sh[1] + 3, sh[0] + 10, sh[1] + 8], plume: 0 })],
    // THE SHIELD CHARGE (his held swing): braced square behind the shield while it winds, heels down and the blade kept back;
    // driven in behind it, leaning, the sword trailing; the slam, a white edge where the oak meets the body; and the shield let down
    brace: KF({ dx: -1, dy: 1, legs: 'wide', shield: true, sword: [sh[0] - 5, sh[1] + 2, sh[0] - 11, sh[1] + 6], plume: 2 }),
    rush: [KF({ dx: 2, legs: 'run1', shield: true, sword: [sh[0] - 3, sh[1] + 3, sh[0] - 9, sh[1] + 7], plume: 2 }),
      KF({ dx: 2, dy: -1, legs: 'run4', shield: true, sword: [sh[0] - 3, sh[1] + 2, sh[0] - 9, sh[1] + 6], plume: 1 })],
    bash: KF({ dx: 4, legs: 'wide', shield: true, sword: [sh[0] - 2, sh[1] + 3, sh[0] - 8, sh[1] + 8], plume: 2, bits: [[17, 3, '#fff6e0'], [17, 6, '#ffffff'], [17, 9, '#fff6e0'], [18, 6, '#fff6e0']] }),
    recover: KF({ dx: 1, dy: 1, legs: 'stand', sword: rest(1), plume: 0 }),
    // HURT is two beats too: the blow snaps him back, then he folds over it
    hurt: [KF({ dx: -1, dy: 1, legs: 'fall', sword: [sh[0] + 1, sh[1] + 2, sh[0] + 6, sh[1] + 6], plume: 2 }),
      KF({ dx: -2, dy: 2, legs: 'land', sword: [sh[0], sh[1] + 3, sh[0] + 4, sh[1] + 9], plume: 1 })],
    crouch: KF({ dy: 3, legs: 'crouch', legsDy: 3, sword: rest(-5) }),   /* (the point stays above the floor line: rest(3) put it 9 px under the boots) */
    /* THE BUTT-SLIDE (src/slide.js): sat back on the ground with the legs run out in front, leaning away from the hill, the weapon tucked behind (a second frame for the cloth) */
    slide: [0, 1].map(i => KF({ dx: -3, dy: 3, legs: 'slide', legsDy: 3, plume: i * 2, arm: [sh[0], sh[1], sh[0] - 2, sh[1] + 4], sword: [sh[0] - 2, sh[1] + 4, sh[0] - 10, sh[1] + 1], kite: BACK })),
    block: [
      KF({ legs: 'wide', shield: true, sword: [sh[0] - 4, sh[1] + 3, sh[0] - 6, sh[1] + 10] }),
      KF({ legs: 'wide', dy: 1, shield: true, sword: [sh[0] - 4, sh[1] + 4, sh[0] - 6, sh[1] + 11] }),
    ],
  };
  const tuck = KF({ dy: 4, legs: 'crouch', sword: [sh[0] + 1, sh[1] + 2, sh[0] + 5, sh[1] + 5] });
  F.roll = [0, 1, 2, 3].map(q => rotQuarter(tuck, q));
  { const arcs = comboArcs(sh, 'sword', 12, bare ? {} : { kite: SIDE }); F.atkB = [...arcs.B, F.atk[4]]; F.atkC = [...arcs.T, F.atk[4]]; F.air = [...arcs.A, F.jump[1]]; F.fidget = [...arcs.I, F.idle[0]]; }   /* the backhand and the thrust */
  /* HIS FIDGET: the blade up before his face, the light run down it from hilt to point while he bends to look, a turn of
     it to see the other edge, and it falls back into the turf with a little weight on the end */
  { const up = (tx = 0) => ({ arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 1], sword: [sh[0] + 3, sh[1] - 1, sh[0] + 3 + tx, sh[1] - 11] });
    const gl = (y, big) => [[11, y, '#ffffff'], [12, y, '#ffffff'], [13, y, '#fff6c8'], ...(big ? [[10, y, '#dfe8ff'], [11, y - 1, '#dfe8ff'], [11, y + 1, '#dfe8ff'], [14, y, '#dfe8ff']] : [])];   /* white on a pale blade is invisible: the light spills off the edge */
    const lift = KF({ arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 1], sword: [sh[0] + 2, sh[1] + 1, sh[0] + 7, sh[1] - 7], plume: 1 });
    const a = KF({ ...up(), plume: 2 }), b = KF({ ...up(), hy: 1, bits: gl(4), plume: 1 }), c = KF({ ...up(), hy: 1, bits: gl(1), plume: 0 });
    const d = KF({ ...up(), hy: 1, bits: gl(-2, true), plume: 0 }), turn = KF({ ...up(2), hy: 1, plume: 0 }), back = KF({ ...up(-1), plume: 1 });
    const drop = KF({ arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 2], sword: [sh[0] + 2, sh[1] + 2, sh[0] + 9, sh[1] + 6], plume: 2 });
    const thud = KF({ dy: 1, sword: [sh[0] + 1, sh[1] + 2, sh[0] + 3, sh[1] + 6], plume: 2 });   /* back in the turf as the idle has it: one pixel, not three */
    F.fidget = holdFrames([[lift, 2], [a, 2], [b, 2], [c, 2], [d, 3], [turn, 3], [back, 2], [drop, 2], [thud, 2], [F.idle[7], 2]]); }
  /* HIS DANCE (dances lane, 2026-09-29): THE SWORD SALUTE. The blade comes up off the turf to stand before his face, point to the
     sky, and a glint runs up it; he holds it there, sweeps it out level to the field like a man presenting arms, brings it back
     up, and then lowers it, and himself with it, in a bow. Six poses, and every one is the sword: nobody else here salutes. */
  { const at = (o = {}) => KF({ legs: 'stand', plume: 0, ...o });
    const hilt = (h, tx, ty, o = {}) => at({ arm: [sh[0], sh[1], sh[0] + 3, sh[1] - h], sword: [sh[0] + 3, sh[1] - h, tx, ty], ...o });
    const glint = (x, y) => [[x - BX, y - BY, '#ffffff'], [x - BX - 1, y - BY + 1, '#fff6c8'], [x - BX + 1, y - BY + 1, '#fff6c8'], [x - BX, y - BY - 1, '#fff6c8']];
    const ready = at({ sword: rest(), plume: 1 });
    const draw = at({ arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 1], sword: [sh[0] + 2, sh[1] + 1, sh[0] + 7, sh[1] - 7], plume: 1 });
    const up = hilt(3, sh[0] + 3, sh[1] - 11, { plume: 2 });
    const upGlint = hilt(3, sh[0] + 3, sh[1] - 11, { plume: 1, bits: glint(sh[0] + 3, sh[1] - 11) });
    const present = at({ dx: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 4, sh[1] - 1], sword: [sh[0] + 4, sh[1] - 1, sh[0] + 13, sh[1] - 3], plume: 2, bits: [[sh[0] + 13 - BX, sh[1] - 3 - BY, '#ffffff'], [sh[0] + 12 - BX, sh[1] - 3 - BY, '#fff6c8']] });
    const bow1 = at({ dy: 1, hy: 1, arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 1], sword: [sh[0] + 2, sh[1] + 1, sh[0] + 4, sh[1] + 8], plume: 2 });
    const bow2 = at({ dy: 2, hy: 2, sho: 1, arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 2], sword: [sh[0] + 3, sh[1] + 2, sh[0] + 5, sh[1] + 8], plume: 2 });
    F.dance = holdFrames([[ready, 2], [draw, 2], [up, 3], [upGlint, 2], [up, 2], [present, 3], [upGlint, 2], [bow1, 2], [bow2, 4], [bow1, 2]]); }
  /* HIS OTHER TWO DANCES (heroanim lane, 2026-10-10). The salute above is the victory card's and the H key's; these are his two
     other moods, and both are drill. dance2 = THE KATA, for a long idle: nobody is watching and he runs the old forms alone, guard,
     high cut, forward cut, low cut, shield up and the bash, and ends sheathed-on-the-turf with his head bowed over the hilt.
     dance3 = THE FLOURISH, for a boss down: the blade thrown round overhead in a full turn, planted, then the thrust to the sky
     with the shield up and a hop off both boots. Every pose is the sword or the shield: nobody else here drills. */
  { const at = (o = {}) => KF({ legs: 'stand', plume: 0, ...o });
    const ar = (hx, hy2, tx, ty, o = {}) => at({ arm: [sh[0], sh[1], sh[0] + hx, sh[1] + hy2], sword: [sh[0] + hx, sh[1] + hy2, sh[0] + tx, sh[1] + ty], ...o });
    const gl = (x, y) => [[x - BX, y - BY, '#ffffff'], [x - BX - 1, y - BY + 1, '#fff6c8'], [x - BX + 1, y - BY + 1, '#fff6c8'], [x - BX, y - BY - 1, '#fff6c8']];
    const guard = ar(4, -1, 12, -4, { shield: true, legs: 'wide', dx: 1, plume: 1 });
    const back = ar(-1, -4, -7, -10, { legs: 'wide', dx: -2, plume: 1 });
    const cutF = ar(4, 1, 13, 1, { legs: 'runC', dx: 1, plume: 2 });
    const cutFg = ar(4, 1, 13, 1, { legs: 'runC', dx: 1, plume: 2, bits: gl(sh[0] + 13, sh[1] + 1) });
    const cutLow = ar(3, 3, 11, 8, { legs: 'runC', dx: 2, plume: 2 });
    const hi = ar(3, -1, 3, -11, { plume: 2 });
    const hiBack = ar(1, -3, -5, -9, { legs: 'wide', dx: -1, plume: 1 });
    const hiCut = ar(4, -2, 11, 4, { legs: 'runC', dx: 1, plume: 2 });
    const shieldUp = at({ shield: true, legs: 'wide', sword: [sh[0] + 1, sh[1] + 2, sh[0] + 2, sh[1] + 7], plume: 1 });
    const bash = at({ shield: true, legs: 'runC', dx: 2, sword: [sh[0] + 1, sh[1] + 2, sh[0] + 2, sh[1] + 7], plume: 2 });
    const plantTwo = ar(3, 3, 4, 11, { dy: 1, hy: 1, plume: 2 });
    const bowHilt = ar(3, 3, 4, 11, { dy: 2, hy: 2, sho: 1, plume: 2 });
    F.dance2 = holdFrames([[at({ sword: rest(), plume: 1 }), 2], [guard, 3], [back, 3], [cutF, 2], [cutFg, 2], [ar(4, 1, 8, 4, { legs: 'runC', dx: 1, plume: 1 }), 2], [guard, 2],
      [hiBack, 3], [hiCut, 2], [cutLow, 3], [guard, 2], [shieldUp, 3], [bash, 2], [shieldUp, 2], [plantTwo, 3], [bowHilt, 5], [plantTwo, 2], [at({ sword: rest(), plume: 1 }), 2]]);
    const o1 = ar(5, -2, 9, -9, { legs: 'wide', plume: 1 }), o2 = ar(3, -2, 3, -12, { plume: 2 }), o3 = ar(2, -2, -4, -10, { legs: 'wide', dx: -1, plume: 2 }),
      o4 = ar(1, 0, -7, -3, { legs: 'wide', dx: -2, plume: 2 }), o5 = ar(1, 3, -5, 9, { dx: -1, plume: 2 });
    const bigHi = ar(3, -2, 3, -12, { top: 0, hy: -1, sho: 1, plume: 2, bits: gl(sh[0] + 3, sh[1] - 12) });
    const leap = at({ legs: 'jump', dy: -3, sho: 1, shield: true, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 2], sword: [sh[0] + 3, sh[1] - 2, sh[0] + 3, sh[1] - 12], plume: 2, bits: gl(sh[0] + 3, sh[1] - 12) });
    const touch = at({ legs: 'land', dy: 2, shield: true, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 1], sword: [sh[0] + 3, sh[1] - 1, sh[0] + 3, sh[1] - 11], plume: 0 });
    const hold = at({ shield: true, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 1], sword: [sh[0] + 3, sh[1] - 1, sh[0] + 3, sh[1] - 11], plume: 1, bits: gl(sh[0] + 3, sh[1] - 11) });
    F.dance3 = holdFrames([[at({ sword: rest(), plume: 1 }), 1], [o1, 2], [o2, 2], [o3, 2], [o4, 2], [o5, 2], [o1, 2], [o2, 2], [o3, 1], [o4, 1], [o5, 2], [plantTwo, 3],
      [at({ legs: 'crouch', legsDy: 3, dy: 4, arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 1], sword: [sh[0] + 3, sh[1] + 1, sh[0] + 3, sh[1] - 8], shield: true, plume: 2 }), 2], [leap, 2], [bigHi, 1], [touch, 2], [hold, 5], [at({ sword: rest(), plume: 1 }), 2]]); }
  /* FOLLOW-THROUGH (heroanim lane, 2026-10-10): the two frames a light strike plays inside its existing recovery (main.js recPose branch; the beat table
     is at the top of src/attack-animation.js). A = the weapon spent, carried on low past the target, body one pixel forward, plume still flying;
     B = it coming back to guard, the weight settling. Art only: atkRec is read, never written. */
  F.follow = [KF({ dx: 1, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 4], sword: [sh[0] + 3, sh[1] + 4, sh[0] + 9, sh[1] + 11], plume: 1 }), KF({ dy: 1, legs: 'stand', arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 3], sword: [sh[0] + 2, sh[1] + 3, sh[0] + 5, sh[1] + 10], plume: 0 })];
  /* HIS SLUMP. Not the hurt frame: nothing has hit him. The helm sinks into the shoulders, the shoulders themselves
     sag (sho below zero drops the outer pixels instead of lifting them), the kite hangs off a slack arm down by his
     knee, and the sword is not held so much as leant on, its point out in the turf in front of his boots. */
  { const down = d => KF({ dy: 2 + d, hy: 3, sho: -1, legs: 'stand', plume: 0, kite: { x: 3, y: 8 },
      arm: [sh[0], sh[1], sh[0] - 2, sh[1] + 2], sword: [sh[0] - 2, sh[1] + 2, sh[0] + 1, sh[1] + 7 - d] });
    /* the blade hangs STEEP - a sword out at forty-five degrees is what his hurt frames do, and the two must not be
       the same picture - and his feet stay together under him, where being knocked about puts them apart */
    F.slump = [down(0), down(1)]; }
  /* HIS SWIM: the kite slung on his back, where it cannot drag, and the sword kept in the stroke hand - it leads on the
     reach, which is the one knight in the sea who still looks armed. Treading, the shield comes back to the off arm. */
  { const S = swimRig(KF, sh, { carry: { kite: bare ? null : BACK }, hand: (hx, hy, ux, uy) => ({ sword: [hx, hy, Math.round(hx + ux * 6), Math.round(hy + uy * 6)] }),
      tread: i => ({ sword: [sh[0] + SCULL[i][0], sh[1] + SCULL[i][1] + TREAD_DY[i], sh[0] + SCULL[i][0] + 6, sh[1] + SCULL[i][1] + TREAD_DY[i] + 3] }) });
    F.swim = S.swim; F.tread = S.tread; }
  const mirror = f => Array.isArray(f) ? f.map(flipX) : flipX(f);
  { const c = F.idle[2], g2 = c.getContext('2d'); g2.fillStyle = '#dfe8ff'; g2.fillRect(BX + 4, BY + 4, 1, 1); }
  /* THE LOW GUARD and THE SHIELD TRIP (src/crouch-a.js, claude/croucha). Down on his heels, boots on the ground, the kite brought round
     off his arm and set square in front of his shins, the sword kept back over the hip; as a blow lands on it the rim takes a white edge and
     it rocks a pixel (he does not). The trip: the kite drawn in close, then driven out low along the floor into the ankles, a white edge
     where the rim meets them and his weight gone in behind it. */
  { const low = { dy: 3, legsDy: 3, legs: 'crouch', arm: [sh[0], sh[1], sh[0] - 2, sh[1] + 3], sword: [sh[0] - 2, sh[1] + 3, sh[0] - 9, sh[1] + 1] };
    F.lowGuard = [KF({ ...low, kite: { x: 9, y: 5 }, plume: 1 }),
      KF({ ...low, dx: -1, kite: { x: 10, y: 4 }, plume: 2, bits: [[15, 5, '#fff6e0'], [15, 7, '#ffffff'], [15, 9, '#ffffff'], [15, 11, '#fff6e0']] })];
    F.trip = [KF({ ...low, dx: -1, kite: { x: 7, y: 5 }, plume: 1 }),
      KF({ dx: 3, dy: 3, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 1, sh[1] + 3], sword: [sh[0] - 1, sh[1] + 3, sh[0] - 8, sh[1] + 2], kite: { x: 10, y: 6 }, plume: 2,
        bits: [[15, 9, '#fff6e0'], [15, 11, '#ffffff'], [15, 12, '#ffffff'], [16, 12, '#fff6e0'], [17, 13, '#c9b27c'], [18, 12, '#c9b27c']] })]; }
  directionalPoses(F, 'sword', { make: KF });
  /* THE HEAVY CUT (his held swing since 2026-09-23; it was THE SHIELD CHARGE). The WIND-UP is the sword raised over the shield, the
     kite square across him: straight up, then tipped back, then cocked right back behind the helm - one frame a stage, so how long
     he has held it is on the body (main.js reads cutStage). The CUT comes from over his head down into the floor ahead of him.
     Made after the padding, with the headroom of their own (the blade goes above the helm). */
  { const top = ATTACK_HEADROOM;
    F.windup = [KF({ top, legs: 'wide', shield: true, arm: [sh[0], sh[1], sh[0] - 1, sh[1] - 6], sword: [sh[0] - 1, sh[1] - 6, sh[0] - 2, sh[1] - 17], plume: 1 }),
      KF({ top, legs: 'wide', shield: true, arm: [sh[0], sh[1], sh[0] - 1, sh[1] - 6], sword: [sh[0] - 1, sh[1] - 6, sh[0] - 7, sh[1] - 16], plume: 2 }),
      KF({ top, legs: 'wide', dy: 1, shield: true, arm: [sh[0], sh[1], sh[0] - 2, sh[1] - 6], sword: [sh[0] - 2, sh[1] - 6, sh[0] - 11, sh[1] - 13], plume: 2 })];
    F.heavy = [KF({ top, wide: 10, dx: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 1, sh[1] - 7], sword: [sh[0] + 1, sh[1] - 7, sh[0] + 6, sh[1] - 18], plume: 2 }),
      KF({ top, wide: 10, dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] - 4], sword: [sh[0] + 4, sh[1] - 4, sh[0] + 15, sh[1] - 8], plume: 2 }),
      KF({ top, wide: 10, dx: 3, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 1], sword: [sh[0] + 4, sh[1] + 1, sh[0] + 14, sh[1] + 9], plume: 0,
        bits: [[sh[0] + 14 - BX, sh[1] + 9 - BY, '#ffffff'], [sh[0] + 15 - BX, sh[1] + 8 - BY, '#fff6c8'], [sh[0] + 13 - BX, sh[1] + 8 - BY, '#fff6c8']] })]; }
  knightKitPoses(F, KF, sh);
  smearPass(F, SMEAR_COL.steel);   /* the strike beats get their arc (claude/herokeys) */
  const R = F, L = {}; for (const k in F) L[k] = mirror(F[k]);
  const white = {}; for (const k in F) white[k] = Array.isArray(F[k]) ? F[k].map(c => whiten(c)) : whiten(F[k]);
  const whiteL = {}; for (const k in white) whiteL[k] = mirror(white[k]);
  const set = { R, L, white: { R: white, L: whiteL }, ...KNIGHT_ANCHOR, ay: KNIGHT_ANCHOR.ay + ATTACK_HEADROOM };
  if (!bare) set.bare = bakeKnight(skin, true);   /* (the recursion sets KP from the same skin, so both sets wear it) */
  return set;
}

/* EVERY ABILITY HAS A BODY: THE KNIGHT'S BOUGHT ACTIVES. Each played beside an idle knight before (tools/ability-poses.mjs); each
   now has two to four frames of its own, played by src/hero-poses.js over the ability's opening beats. Built on his rig like
   the heavy cut, after the padding, with the same headroom (a raised blade goes above the helm). OFF is the off shoulder, for
   the arm that carries the kite when an ability puts it to work; S() gives the sword arm and blade as offsets from the sword
   shoulder `sh`, as every frame of his does, and o() puts a loose pixel at such an offset. */
function knightKitPoses(F, KF, sh) {
  const top = ATTACK_HEADROOM, [X, Y] = sh, OFF = [BX + 2, BY + 7];
  const S = (x0, y0, x1, y1) => ({ arm: [X, Y, X + x0, Y + y0], sword: [X + x0, Y + y0, X + x1, Y + y1] });
  const o = (x, y, col) => [X - BX + x, Y - BY + y, col];
  const W = '#ffffff', C = '#fff6c8', G = '#ffd36b', D = '#c9b27c', R = '#ff9a5c';
  /* LUNGE: off the back foot and down behind the point, low and long - the kite trailed behind him, not raised (that is the
     dash attack) - then the pull-up with the point dropping */
  F.lunge = [KF({ top, wide: 8, dx: 1, dy: 2, legs: 'wide', ...S(5, 2, 16, 1), kite: { x: -2, y: 5 }, plume: 1 }),
    KF({ top, wide: 10, dx: 4, dy: 3, legs: 'run1', ...S(6, 2, 20, 2), kite: { x: -3, y: 5 }, plume: 2, bits: [[-4, 11, D], [-6, 11, D], [-8, 12, D]] }),
    KF({ top, wide: 6, dx: 2, dy: 1, legs: 'wide', ...S(4, 3, 12, 7), plume: 0 })];
  /* SHIELD THROW (drawn from the BARE set: the kite is already in the air): the off arm cocked right back behind him, flung
     through level at the height the shield flies, and carried on across his front as he turns into it */
  F.toss = [KF({ top, dx: -2, legs: 'wide', arm2: [OFF[0], OFF[1], OFF[0] - 6, OFF[1] - 3], ...S(1, 3, 3, 10), plume: 1 }),
    KF({ top, wide: 4, dx: 2, legs: 'runC', arm2: [OFF[0] + 1, OFF[1], X + 7, Y - 1], ...S(0, 3, -5, 9), plume: 2, bits: [o(9, -1, C), o(10, -1, W)] }),
    KF({ top, dx: 2, dy: 1, legs: 'wide', arm2: [OFF[0] + 1, OFF[1] + 1, X + 3, Y + 5], ...S(-1, 3, -6, 8), plume: 2 })];
  /* GROUND SLAM: up on his toes with the sword and the kite over his head, brought down, and the crouch the impact drives
     him into - the point in the turf and a white bite off the ground where it went in */
  const bite = [[15, 12, W], [16, 11, C], [14, 11, C], [17, 12, C], [12, 12, D], [19, 12, D]];   /* (the ground line, with dy 4) */
  F.slam = [KF({ top, dy: -2, legs: 'wide', sho: 1, kite: { x: 4, y: -5 }, ...S(0, -8, 1, -20), plume: 1 }),
    KF({ top, dy: 1, legs: 'wide', kite: { x: 5, y: 1 }, ...S(4, -1, 13, 7), plume: 2 }),
    KF({ top, dx: 1, dy: 4, legs: 'crouch', kite: { x: 4, y: 3 }, ...S(3, 1, 7, 5), plume: 2, bits: bite })];
  /* WAR CRY: the breath in, chest out and the arms coming open; then the head thrown back, the sword up and the kite out wide,
     and the shout coming off him in rings */
  const shout = k => [[11, 2, G], [12, 1, G], [12, 3, G], [13, 2, R], ...(k ? [[14, 0, G], [14, 4, G], [15, 2, R]] : [])];
  const wide = { dx: -1, dy: -1, hy: -1, sho: 1, legs: 'wide', arm2: [OFF[0], OFF[1], OFF[0] - 5, OFF[1] - 3], kite: { x: -8, y: 0 }, ...S(5, -5, 7, -17) };
  F.cry = [KF({ top, dy: -1, sho: 1, legs: 'wide', arm2: [OFF[0], OFF[1], OFF[0] - 4, OFF[1] + 1], kite: { x: -6, y: 4 }, ...S(4, -2, 8, -10), plume: 1 }),
    KF({ top, ...wide, plume: 2, bits: shout(0) }), KF({ top, ...wide, plume: 0, bits: shout(1) })];
  /* WHIRLWIND: a real spin - the blade straight out ahead, then trailing out behind, then swept up across; the draw turns
     him every sixteenth of a second, so the three together go round */
  F.whirl = [KF({ top, wide: 6, legs: 'wide', ...S(4, 0, 17, 0), plume: 2, bits: [[-3, 6, C], [-5, 7, C]] }),
    KF({ top, dy: 1, legs: 'run3', ...S(-2, 2, -13, 5), plume: 1, bits: [[13, 3, C], [15, 4, C]] }),
    KF({ top, wide: 4, legs: 'wide', ...S(3, -2, 14, -8), plume: 0, bits: [[4, 16, C], [2, 15, C]] })];
  /* DISARM, THE HOOK: the point dropped low and in under the guard, turned up to catch the rim, hauled up high, and held at
     the top as whatever it caught goes flying (the pale arc is drawKnightKit's, in the world) */
  F.hook = [KF({ top, dy: 2, legs: 'wide', ...S(1, 4, 10, 10), plume: 1 }),
    KF({ top, wide: 2, dx: 1, dy: 1, legs: 'runC', ...S(4, 3, 14, 5), plume: 2, bits: [o(14, 3, W), o(15, 2, C)] }),
    KF({ top, dx: 1, legs: 'runC', ...S(3, -2, 10, -10), plume: 2 }),
    KF({ top, legs: 'stand', ...S(1, -5, 4, -16), plume: 1, bits: [o(5, -17, W)] })];
  /* IRONCLAD: braced, the blade brought up before his face; set, the feet wide and the kite in close; then the steel coming
     over him, a white edge down the blade and across the helm */
  const set = { top, dy: 2, legs: 'wide', sho: -1, kite: { x: 5, y: 5 }, ...S(1, -2, 1, -14) };
  F.iron = [KF({ top, dy: 1, legs: 'wide', kite: { x: 5, y: 5 }, ...S(2, 0, 6, -10), plume: 1 }), KF({ ...set, plume: 2 }),
    KF({ ...set, plume: 0, bits: [o(1, -12, W), o(1, -9, W), o(1, -6, C), [3, 1, '#dfe8ff'], [4, 1, W], [5, 1, '#dfe8ff']] })];
  /* SWORD OF THE REALM: the sword taken straight up over the helm, the light gathering at the point, and the cut brought
     down and out that sends the first wave along the floor */
  const halo = [o(1, -22, W), o(0, -22, G), o(2, -22, G), o(1, -23, G), o(1, -21, G)];
  const high = { top, dy: -1, legs: 'wide', hy: -1, sho: 1, ...S(0, -8, 1, -20) };
  F.realm = [KF({ ...high, plume: 1, bits: halo.slice(0, 1) }), KF({ ...high, plume: 2, bits: [...halo, o(-1, -24, C), o(3, -24, C)] }),
    KF({ top, wide: 6, dx: 2, dy: 1, legs: 'runC', ...S(4, 1, 15, 8), plume: 2, bits: [o(16, 8, G), o(17, 8, W)] })];
  const ab = (x, y, col) => [x - BX, y - BY, col];
  /* ==== HERO PASS A ART (claude/heropassaart): the knight's three new moves. hpLn(): a line of loose pixels between two ABSOLUTE points (the blade's aura, a streak) ==== */
  const hpLn = (x0, y0, x1, y1, col, every = 1) => { const bits = [], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) if (i % every === 0) bits.push([Math.round(x0 + (x1 - x0) * i / n) - BX, Math.round(y0 + (y1 - y0) * i / n) - BY, typeof col === 'function' ? col(i, n) : col]); return bits; };
  const STEEL = '#c9d1dc', RIM = '#e8eef8';
  /* SHIELD-STEP (the dodge, 0.24 s): PLANT - the lead boot set and the kite brought square across him, the blade trailed low behind so nothing of him is ahead of the oak; SLIDE - driven off the back foot with the
     shield fixed in front of the step, a bright bar down its leading rim and the steel streaks left behind; SET - the step finished, weight dropped behind the shield, a glint on the rim and the dust off the heel */
  F.kStep = [KF({ top, dx: -1, dy: 1, legs: 'wide', shield: true, sword: [X - 4, Y + 4, X - 10, Y + 8], plume: 1, bits: [[-2, 16, D], [-4, 15, D], [-6, 16, D]] }),
    KF({ top, wide: 4, dx: 3, dy: 1, legs: 'runC', shield: true, sword: [X - 4, Y + 3, X - 11, Y + 6], plume: 2, bits: [...[5, 6, 7, 8, 9, 10, 11, 12].map(y => [16, y, RIM]), [17, 8, W], [17, 9, C], ...[[-4, 7, STEEL], [-5, 7, STEEL], [-6, 7, STEEL], [-7, 7, '#8a98ac'], [-8, 7, '#8a98ac'], [-5, 10, STEEL], [-6, 10, STEEL], [-7, 10, '#8a98ac'], [-8, 10, '#8a98ac'], [-9, 10, '#8a98ac']], [-3, 16, D], [-4, 16, D], [-5, 16, D]] }),
    KF({ top, wide: 4, dx: 2, dy: 2, legs: 'wide', shield: true, sword: [X - 3, Y + 5, X - 8, Y + 9], plume: 0, bits: [[15, 4, W], [14, 3, C], [16, 5, C], [15, 5, C], [1, 17, D], [-1, 16, D], [4, 17, D]] })];
  /* SHIELD BASH (UP+C, 0.3 s, a half step in): COCK - the whole kite hauled back into his chest with the off arm bent behind it and his weight on the back foot; PUNCH - thrown out flat and square at the full reach of the arm,
     the rim white, a star of sparks where the oak met the thing's wind-up; RECOVER - the shield coming back, the shock still ringing off the rim in two short ticks */
  F.kBash = [KF({ top, dx: -3, dy: 1, legs: 'wide', shield: true, sword: [X - 6, Y + 3, X - 12, Y + 7], plume: 1 }),
    KF({ top, wide: 8, dx: 5, dy: 1, legs: 'runC', sho: 1, shield: true, sword: [X - 3, Y + 3, X - 10, Y + 6], plume: 2, bits: [...[4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(y => [16, y, RIM]), [19, 8, W], [18, 8, W], [20, 8, C], [19, 7, C], [19, 9, C], [21, 8, G], [20, 5, C], [20, 11, C], [22, 6, G], [22, 10, G], [18, 3, C], [18, 13, C]] }),
    KF({ top, wide: 8, dx: 3, legs: 'wide', shield: true, sword: [X - 4, Y + 3, X - 10, Y + 7], plume: 1, bits: [[18, 6, C], [18, 10, C], [19, 8, G], [17, 4, STEEL], [17, 12, STEEL]] })];
  /* VALIANT STRIKE (a full bar, the heavy cut): the blade taken up over the helm in both hands with a flame of gold standing along it; thrown through with the gold dragged out behind the edge and a white core; and
     the follow-through, the steel still lit down to the point and gold falling off it */
  const auraAt = (x0, y0, x1, y1, k) => [...hpLn(x0 + 1, y0 - 1, x1 + 1, y1 - 1, (i, n) => i % 2 ? G : C), ...hpLn(x0 - 1, y0 + 1, x1 - 1, y1 + 1, G, 2), ab(x1 + 1, y1 - 2, W), ab(x1, y1 - 3, C), ab(x1 + 2, y1 - 3, G), ...(k ? [ab(x1 + 3, y1 - 1, G), ab(x0 - 2, y0 - 3, C)] : [])];
  F.valiant = [KF({ top, wide: 10, dx: 0, dy: -1, legs: 'wide', sho: 1, arm: [X, Y, X + 1, Y - 8], sword: [X + 1, Y - 8, X + 5, Y - 19], plume: 1, bits: auraAt(X + 1, Y - 8, X + 5, Y - 19, 0) }),
    KF({ top, wide: 10, dx: 2, legs: 'runC', arm: [X, Y, X + 5, Y - 4], sword: [X + 5, Y - 4, X + 16, Y - 8], plume: 2, bits: [...auraAt(X + 5, Y - 4, X + 16, Y - 8, 1), ...hpLn(X + 1, Y - 12, X + 8, Y - 15, G, 2)] }),
    KF({ top, wide: 10, dx: 3, dy: 1, legs: 'wide', arm: [X, Y, X + 4, Y + 1], sword: [X + 4, Y + 1, X + 14, Y + 9], plume: 0, bits: [...auraAt(X + 4, Y + 1, X + 14, Y + 9, 1), ab(X + 15, Y + 10, W), ab(X + 16, Y + 8, C), ab(X + 17, Y + 11, G), ab(X + 12, Y + 12, G)] }),
    KF({ top, wide: 10, dx: 2, dy: 1, legs: 'wide', arm: [X, Y, X + 3, Y + 2], sword: [X + 3, Y + 2, X + 10, Y + 10], plume: 1, bits: [...hpLn(X + 3, Y + 2, X + 10, Y + 10, G, 3), ab(X + 11, Y + 12, G), ab(X + 9, Y + 13, C)] })];
  riposteKit(F, 'knight', KF, { X, Y, OFF });
}

/* THE PARRY AND THE RIPOSTE, ON THE BODY (claude/riposteart, Daniel 2026-10-11; src/riposte.js is the rule, this is its art). Two keys on every hero:
   F.parry - two frames, the CATCH the moment the blow lands on the beat (a gold star where the guard met it), then the hold: each hero's own look
             (the knight's shield, the warden's turned shaft, the berserker's crossed axes, the paladin's aegis, the pyromancer's palm and flare,
             the geomancer's stone skin, the freebooter's bound cutlass, the death knight's blade held up in both hands).
   F.ripo  - three frames, the STRIKE out of the parry: the STEP-IN with the weapon drawn back, the CUT or THRUST (a flash of gold at the point), the FOLLOW-THROUGH.
   Built on each hero's own rig with the same headroom as his kit poses; played by main.js off P.rpPoseT / P.swingRiposte (art only: no box, timer or cost reads them). */
function riposteKit(F, hero, K, c) {
  const top = ATTACK_HEADROOM, M = o => K({ top, ...o }), { X, Y, OFF } = c;
  const o = (x, y, col) => [X - BX + x, Y - BY + y, col];
  const W = '#ffffff', C = '#fff6c8', G = '#ffd36b';
  const star = (x, y, big) => [o(x, y, W), o(x - 1, y, C), o(x + 1, y, C), o(x, y - 1, C), o(x, y + 1, C), ...(big ? [o(x - 2, y, G), o(x + 2, y, G), o(x, y - 2, G), o(x, y + 2, G)] : [])];
  const flash = (x, y) => [o(x, y, W), o(x + 1, y, C), o(x + 2, y, G), o(x, y - 1, G), o(x, y + 1, G), o(x - 1, y - 2, C), o(x - 1, y + 2, C)];
  switch (hero) {
    case 'knight': {
      const back = { sword: [X - 3, Y + 2, X - 9, Y + 7] };
      F.parry = [M({ dx: -1, dy: 1, legs: 'wide', shield: true, ...back, plume: 2, bits: [...star(11, 1, true)] }),
        M({ dy: 0, legs: 'wide', shield: true, ...back, plume: 1, bits: [o(10, -2, C), o(11, 3, C)] })];
      F.ripo = [M({ wide: 4, dx: 1, dy: 1, legs: 'wide', arm: [X, Y, X - 3, Y - 2], sword: [X - 3, Y - 2, X - 10, Y - 10], plume: 2 }),
        M({ wide: 12, dx: 3, dy: 1, legs: 'runC', arm: [X, Y, X + 5, Y - 1], sword: [X + 5, Y - 1, X + 20, Y - 3], plume: 2, bits: flash(21, -3) }),
        M({ wide: 8, dx: 3, dy: 2, legs: 'wide', arm: [X, Y, X + 4, Y + 4], sword: [X + 4, Y + 4, X + 14, Y + 10], plume: 0, bits: [o(15, 10, C), o(16, 9, G)] })];
      break; }
    case 'warden': {
      const WIDE = c.WIDE;
      F.parry = [M({ wide: WIDE, dx: -1, legs: 'wide', arm: [X, Y, X + 3, Y - 3], spear: [X - 5, Y + 8, X + 11, Y - 11], plume: 1, bits: star(8, -7, true) }),
        M({ wide: WIDE, dx: 0, legs: 'wide', arm: [X, Y, X + 3, Y - 2], spear: [X - 3, Y + 5, X + 15, Y - 5], plume: 2, bits: [o(10, -3, C), o(13, -6, G)] })];
      F.ripo = [M({ wide: WIDE + 8, dx: -2, dy: 1, legs: 'wide', arm: [X, Y, X - 3, Y + 2], spear: [X - 9, Y + 3, X + 8, Y + 4], plume: 1 }),
        M({ wide: WIDE + 20, dx: 4, dy: 2, legs: 'runC', arm: [X, Y, X + 6, Y + 1], spear: [X + 2, Y + 1, 56, Y + 2], plume: 2, bits: flash(38, 2) }),
        M({ wide: WIDE + 14, dx: 3, dy: 1, legs: 'wide', arm: [X, Y, X + 4, Y + 3], spear: [X, Y + 3, 46, Y + 6], plume: 0, bits: [o(28, 6, C), o(30, 5, G)] })];
      break; }
    case 'paladin': {
      F.parry = [M({ dx: -1, dy: 1, legs: 'wide', sho: 1, arm: [X, Y, X + 4, Y + 1], arm2: [OFF[0], OFF[1], X + 3, Y + 3], maul: [X + 5, Y + 8, X + 6, Y - 7], glow: [X + 6, Y - 11], plume: 2,
          bits: [...star(11, -1, true), o(10, -7, G), o(12, 5, G), o(13, 1, C), o(11, 9, C)] }),
        M({ dy: 0, legs: 'wide', arm: [X, Y, X + 4, Y + 1], arm2: [OFF[0], OFF[1], X + 3, Y + 3], maul: [X + 5, Y + 8, X + 6, Y - 7], glow: [X + 6, Y - 11], plume: 1, bits: [o(11, -6, G), o(12, 2, C), o(11, 8, G)] })];
      F.ripo = [M({ wide: 6, dx: 0, dy: 1, legs: 'wide', sho: 1, arm: [X, Y, X - 1, Y - 4], arm2: [OFF[0], OFF[1], X - 3, Y - 3], maul: [X - 2, Y - 6, X - 9, Y - 16], plume: 2 }),
        M({ wide: 12, dx: 3, dy: 1, legs: 'runC', arm: [X, Y, X + 5, Y - 1], arm2: [OFF[0], OFF[1], X + 3, Y + 1], maul: [X + 5, Y - 1, X + 19, Y + 3], plume: 2, bits: flash(21, 3) }),
        M({ wide: 8, dx: 3, dy: 2, legs: 'land', arm: [X, Y, X + 4, Y + 4], arm2: [OFF[0], OFF[1], X + 2, Y + 5], maul: [X + 4, Y + 5, X + 11, Y + 15], plume: 0, bits: [o(12, 16, C), o(14, 16, G), o(10, 16, C), o(9, 17, G), o(16, 17, G)] })];
      break; }
    case 'pirate': {
      const hol = c.holster;
      F.parry = [M({ wide: 4, dx: -1, legs: 'wide', arm: [X, Y, X + 4, Y - 1], cutlass: [X + 4, Y - 1, X + 11, Y - 9], pistol: hol(), plume: 2, bits: star(9, -6, true) }),
        M({ wide: 4, legs: 'wide', arm: [X, Y, X + 4, Y - 1], cutlass: [X + 4, Y - 1, X + 10, Y - 8], pistol: hol(), plume: 1, bits: [o(9, -5, C), o(11, -8, G)] })];
      F.ripo = [M({ wide: 6, dx: -1, legs: 'wide', arm: [X, Y, X - 2, Y + 1], cutlass: [X - 2, Y + 1, X - 9, Y - 2], pistol: hol(), plume: 1 }),
        M({ wide: 14, dx: 4, dy: 1, legs: 'run1', arm: [X, Y, X + 6, Y - 1], cutlass: [X + 6, Y - 1, X + 20, Y - 2], pistol: hol(), plume: 2, bits: flash(21, -2) }),
        M({ wide: 10, dx: 3, dy: 1, legs: 'wide', arm: [X, Y, X + 4, Y + 2], cutlass: [X + 4, Y + 2, X + 14, Y + 6], pistol: hol(), plume: 0, bits: [o(15, 6, C), o(16, 5, G)] })];
      break; }
    case 'reaper': {
      const lit = [[4, 3, '#ff9aa6'], [5, 3, '#ff9aa6']], RED = '#c0283a', PINK = '#ff6b6b', DRED = '#7a1020', HOT = '#ffd0d0';   /* (claude/bkpolish) the helm lights were still the old necrotic green here */
      /* HIS OWN PARRY (B16, claude/bkpolish; bkfeel ART NOTES): not the knight's held-up guard under a gold star. The greatsword is swept UP across the body in both fists, the flat turned to the blow, and the CATCH throws blood off the steel (a crimson bind, not a gold spark); then the hold, the blade levelled forward over the bound blow with blood still running off the edge */
      const bstar = (x, y) => [o(x, y, W), o(x - 1, y, HOT), o(x + 1, y, HOT), o(x, y - 1, HOT), o(x, y + 1, HOT), o(x - 2, y, PINK), o(x + 2, y, PINK), o(x, y - 2, RED), o(x, y + 2, RED)];
      F.parry = [M({ wide: 10, dx: -2, dy: 1, legs: 'wide', sho: 1, arm: [X, Y, X + 1, Y - 1], arm2: [OFF[0], OFF[1], X, Y], greatsword: [X - 3, Y + 6, X + 12, Y - 14], plume: 2, bits: [...lit, ...bstar(11, -10), o(14, -5, RED), o(16, -8, PINK), o(9, -3, DRED), o(13, -13, HOT)] }),
        M({ wide: 12, dx: -1, dy: 0, legs: 'wide', arm: [X, Y, X + 2, Y - 1], arm2: [OFF[0], OFF[1], X + 1, Y], greatsword: [X - 2, Y + 3, X + 17, Y - 8], plume: 1, bits: [...lit, o(18, -9, HOT), o(15, -4, RED), o(12, -1, PINK), o(9, 1, DRED), o(14, 0, RED), o(18, -4, DRED)] })];
      F.ripo = [M({ wide: 8, dx: 0, dy: 1, legs: 'wide', sho: 1, arm: [X, Y, X - 2, Y - 3], arm2: [OFF[0], OFF[1], X - 4, Y - 2], greatsword: [X - 3, Y - 4, X - 14, Y - 11], plume: 2, bits: lit }),
        M({ wide: 16, dx: 3, dy: 1, legs: 'runC', arm: [X, Y, X + 5, Y - 1], arm2: [OFF[0], OFF[1], X + 3, Y + 1], greatsword: [X + 5, Y - 1, X + 22, Y + 1], plume: 2, bits: [...lit, ...flash(24, 1), o(14, 4, RED), o(18, 5, PINK)] }),
        M({ wide: 12, dx: 3, dy: 2, legs: 'wide', arm: [X, Y, X + 4, Y + 4], arm2: [OFF[0], OFF[1], X + 2, Y + 5], greatsword: [X + 4, Y + 5, X + 16, Y + 13], plume: 0, bits: [...lit, o(17, 13, PINK), o(15, 14, RED)] })];
      break; }
    case 'geomancer': {
      const MS = '#8c8a7e', D = '#c9b27c', A = '#e8a83a', stone = [[3, 4, MS], [6, 5, D], [4, 8, MS], [7, 9, MS], [2, 10, D], [8, 6, MS]];
      F.parry = [M({ dx: -1, dy: 1, legs: 'wide', arm: [X, Y, X + 4, Y + 2], arm2: [OFF[0], OFF[1], X + 3, Y + 3], stave: [X + 6, Y + 11, X + 6, Y - 10], glow: [X + 6, Y - 7], plume: 2, bits: [...stone, ...star(11, 0, true)] }),
        M({ legs: 'wide', arm: [X, Y, X + 4, Y + 2], arm2: [OFF[0], OFF[1], X + 3, Y + 3], stave: [X + 6, Y + 11, X + 6, Y - 10], glow: [X + 6, Y - 7], plume: 1, bits: [...stone, o(10, -2, A), o(10, 5, D)] })];
      F.ripo = [M({ wide: 8, dx: -1, dy: 1, legs: 'wide', arm: [X, Y, X - 2, Y + 2], arm2: [OFF[0], OFF[1], X - 3, Y + 3], stave: [X - 9, Y + 4, X + 4, Y + 1], plume: 1 }),
        M({ wide: 14, dx: 3, dy: 1, legs: 'runC', arm: [X, Y, X + 6, Y - 1], arm2: [OFF[0], OFF[1], X + 4, Y], stave: [X - 3, Y + 2, X + 18, Y - 1], glow: [X + 18, Y - 2], plume: 2, bits: [...flash(21, -1), o(18, 4, MS), o(20, 3, D)] }),
        M({ wide: 10, dx: 3, dy: 2, legs: 'wide', arm: [X, Y, X + 4, Y + 3], arm2: [OFF[0], OFF[1], X + 3, Y + 4], stave: [X + 1, Y + 5, X + 13, Y + 9], plume: 0, bits: [o(14, 9, MS), o(15, 8, D)] })];
      break; }
    case 'ranger': {   /* (claude/ranger; claude/rangerart) THE BOW-BASH on the beat: the bow shoved out flat with the star where it meets the blow; the RIPOSTE is an arrow, drawn short and loosed point-blank */
      const { aimed } = c;
      F.parry = [M({ wide: 6, dx: 2, legs: 'runC', arm: [X, Y, X + 8, Y - 2], arm2: [OFF[0], OFF[1], X + 7, Y - 5], stave: [X + 10, Y + 9, X + 11, Y - 13], plume: 2, bits: star(14, -2, true) }),
        M({ wide: 4, dx: 1, legs: 'wide', arm: [X, Y, X + 7, Y - 2], arm2: [OFF[0], OFF[1], X + 6, Y - 4], stave: [X + 9, Y + 9, X + 10, Y - 13], plume: 1, bits: [o(13, -5, C), o(13, 1, G)] })];
      F.ripo = [M({ legs: 'wide', dx: -1, ...aimed(1), plume: 1 }), M({ wide: 12, legs: 'runC', dx: 1, ...aimed(null), plume: 2, bits: flash(15, -2) }), M({ legs: 'wide', ...aimed(null), arm2: [OFF[0], OFF[1], X - 3, Y + 1], plume: 0 })];
      break; }
    case 'berserker': {
      const { lead, off } = c, R = '#ff6b4a';
      F.parry = [M({ dx: -1, dy: 1, legs: 'wide', ...lead(5, -1, 11, -9, 1), ...off(3, 1, 11, -6, -1), plume: 2, bits: star(10, -6, true) }),
        M({ legs: 'wide', ...lead(5, -1, 10, -8, 1), ...off(3, 1, 10, -5, -1), plume: 1, bits: [o(10, -4, C), o(12, -8, G)] })];
      F.ripo = [M({ wide: 6, dx: 0, dy: 1, legs: 'wide', ...lead(-1, -4, -6, -12, 1), ...off(-3, 0, -9, -7, -1), plume: 2 }),
        M({ wide: 12, dx: 3, dy: 1, legs: 'runC', ...lead(6, -2, 14, 3, 1), ...off(-2, -2, -8, -9, -1), plume: 2, bits: [...flash(17, 3), o(12, 6, R)] }),
        M({ wide: 8, dx: 3, dy: 2, legs: 'wide', ...lead(4, 5, 9, 12, 1), ...off(-3, 1, -8, -5, -1), plume: 0, bits: [o(10, 12, C), o(12, 11, G)] })];
      break; }
    case 'pyro': {
      F.parry = [K({ top, lean: -1, sit: 1, staff: c.up(0, 1), arm: [16, 10, 20, 10], arm2: [11, 11, 14, 12], flare: [21, 10, true], cowl: 0, sparks: [[23, 8, 'y'], [24, 11, 'y'], [22, 13, 'r'], [22, 7, 'r']] }),
        K({ top, sit: 1, staff: c.up(0, 1), arm: [16, 10, 19, 10], arm2: [11, 11, 14, 12], palm: [20, 10], cowl: 0, flick: 1 })];
      F.ripo = [K({ top, lean: -2, sit: 1, feet: [[9, 18], [15, 18]], staff: [4, 12, 18, 9], arm: [16, 11, 14, 10], arm2: [11, 11, 10, 11], cowl: 2, bell: 1 }),
        K({ top, lean: 3, trail: 3, feet: [[8, 18], [18, 18]], staff: [12, 11, 28, 11], arm: [17, 10, 23, 11], arm2: [13, 10, 17, 11], cowl: 2, flare: [29, 11, true], flick: 1, sparks: [[30, 9, 'y'], [31, 12, 'r'], [27, 9, 'y']] }),
        K({ top, lean: 2, trail: 2, sit: 1, feet: [[9, 18], [17, 18]], staff: [11, 13, 25, 15], arm: [16, 11, 20, 13], cowl: 0, sparks: [[26, 15, 'y'], [27, 14, 'r']] })];
      break; }
  }
}

// ---------- enemies ----------
const EP = { n: '#5a3a24', N: '#3a2214', t: '#e8dcc0', T: '#b8a888', g: '#6faa4a', G: '#3f6e2c', e: '#f3f0d2', o: OUT, r: '#c9463d', R: '#8f2f28', s: '#c9d1dc', S: '#7c8797', b: '#5d4a8a', w: '#8a5a32', W: '#5c3a1d', y: '#e0b040', k: '#f0e6c8', K: '#cdbf9a', p: '#ff9a5c', d: '#2a2f3d', l: '#dfe8ff' };
const sprite = rows => outline(fromGrid(rows, EP, 1), OUT);
function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
const shiftDown = (rows, n) => Array(n).fill('.'.repeat(rows[0].length)).concat(rows.slice(0, rows.length - n));

// Sprig — goblin walker. 10×10, four-frame walk with a head bob.
export function bakeSprig() {
  /* THE SPRIG is the goblin every other goblin is drawn from, and at ten pixels every one of them was the same
     green head. So the plain one is the one with the EARS: they stand out past the head on both sides, and
     every other goblin in the family covers them with whatever its job is. */
  const w2 = r => '..' + r + '..';
  const ears = (rows, drop = 0) => rows.map((r, i) => { const a = r.split(''), k = i - drop;
    if (k === 1) { a[0] = 'G'; a[13] = 'G'; } if (k === 2) { a[1] = 'g'; a[2] = 'g'; a[11] = 'g'; a[12] = 'g'; } return a.join(''); });
  const head = ['...gggg...', '..gggggg..', '.geoggeog.', '.gggggggg.', '..gGGGGg..', '...gggg...'].map(w2);
  const cloth = ['..rrrrrr..', '..rrrrrr..'].map(w2);
  const legs = [['..GG..GG..', '.GG....GG.'], ['..GG.GG...', '..GG..GG..'], ['...GGGG...', '..GG..GG..'], ['..GG.GG...', '.GG....GG.']].map(l => l.map(w2));
  const blank = '..............';
  const bobbed = legs.map((l, i) => sprite(i & 1 ? [blank, ...ears(head.slice(0, 5)), ...cloth, ...l] : [...ears(head), ...cloth, ...l]));
  const look = sprite(ears([head[0], head[1], w2('.gggeogge.'), head[3], head[4], head[5]]).concat(cloth, legs[0]));
  // HURT: the head snaps back, the mouth opens, the knees give - and the ears go down with it
  const hurt = sprite(ears(['..........', '...gggg...', '..gggggg..', '.goggggog.', '.ggg..ggg.', '..gGGGGg..', '..rrrrrr..', '.rrrrrr...', '.GG...GG..', 'GG.....GG.'].map(w2), 1));
  /* THE BITE: it drops its head and sits back on its haunches - that is the moment - and then it leaves the ground mouth first */
  const tell = sprite([blank, ...ears(head.slice(0, 5)), ...cloth, ...['.GGG..GGG.', 'GG......GG'].map(w2)]);
  const bite = sprite(ears(['....gggg..', '...gggggg.', '..geoggeog', '..gggggg..', '..gg....gg', '...gggg...', '...rrrrrr.', '...rrrrrr.', 'GG....GG..', '.......GG.'].map(w2)));
  return pack([...bobbed, look, tell, bite, hurt], 8, 11, 8, 10);
}

// Shieldbearer — helmet, tabard, round wooden shield held out front (right). 14×14, four-frame walk.
export function bakeShield() {
  const top = [
    '...SSSSS......',
    '..SsssssS.....',
    '..SsssssS.....',
    '..gggeoggg....',
    '...gGGGg......',
  ];
  const torso = s => [
    '..bbbbbb.' + (s ? 'wwww.' : '.....'),
    '.Sbbbbbb.' + (s ? 'wwyww' : 'wwww.'),
    '.Sbbbbbb.' + (s ? 'wwyww' : 'wwyww'),
    '..bbbbbb.' + (s ? 'wwww.' : 'wwyww'),
    '..rrrrrr.' + (s ? '.....' : 'wwww.'),
    '..rrrrrr......',
  ];
  const legs = [['..GG..GG......', '..GG..GG......', '.GGG..GGG.....'], ['..GG.GG.......', '...GGGG.......', '..GGG.GG......'], ['...GGGG.......', '..GG..GG......', '.GGG..GGG.....'], ['..GG.GG.......', '..GG..GG......', '.GG...GGG.....']];
  const frames = legs.map((l, i) => sprite([...top, ...torso(i % 2 === 0), ...l]));
  /* THE TURN: he takes half a second to bring the shield round, and for that half second it is square across his front - and HURT, the shield knocked up and his helm askew */
  const turnTorso = ['..bwwwwwb.....', '.Swwwywwwb....', '.Swwyyywwb....', '..wwwywwwb....', '..rwwwwwr.....', '..rrrrrr......'];
  frames.push(sprite([...top, ...turnTorso, ...legs[0]]));
  const hurtTop = ['....SSSSS.....', '...SsssssS....', '...SsssssS....', '...gogggog....', '....gg.gg.....'];
  const hurtTorso = ['..bbbbbb..www.', '.Sbbbbbb.wwyww', '.Sbbbbbb.wwwww', '..bbbbbb......', '..rrrrrr......', '.rrrrrr.......'];
  /* THE SHOVE: he tucks the shield in and sits back on his heels, then drives off the back foot with the shield out in front of him */
  frames.push(sprite(['..SSSSS.......', '.SsssssS......', '.SsssssS......', '.gggeoggg.....', '..gGGGg.......',
    '.bbbbbbwwww...', 'Sbbbbbbwwyw...', 'Sbbbbbbwyyw...', '.bbbbbbwwyw...', '.rrrrrrwwww...', '.rrrrrr.......', '.GG...GG......', 'GG.....GG.....', 'GG......GG....']));
  frames.push(sprite(['....SSSSS.....', '...SsssssS....', '...SsssssS....', '...gggeoggg...', '....gGGGg.....',
    '...bbbbbb.wwww', '..Sbbbbbb.wwyw', '..Sbbbbbb.wyyw', '...bbbbbb.wwyw', '...rrrrrr.wwww', '..rrrrrr......', '.GGG...GG.....', 'GG.......GG...', 'G..........GG.']));
  frames.push(sprite([...hurtTop, ...hurtTorso, '..GG...GG.....', '.GG.....GG....', 'GG.......GG...']));
  return pack(frames, 7, 15, 10, 14);
}

// THE MERROW BRUTE - built on the shieldbearer's own frames (walk, the slow turn, the tucked shove) because the
// tribe's heavy needs exactly that lesson: turn slowly, so cross behind it and strike, or plunge from above.
// What is hers: teal-green scaled hide where the goblin's was, a barnacled, pale-nacre clam shell in place of
// the round wood shield, and a kelp-wrap where the blue tabard was. Not throwable - it is the heavy.
const MB = Object.assign({}, EP, { g: '#3d8a72', G: '#1f5a48', b: '#1d4a44', w: '#e8d4d0', y: '#c9a0c0', r: '#b8483a' });
const mbSprite = rows => outline(fromGrid(rows, MB, 1), OUT);
export function bakeMerrowBrute() {
  const top = [
    '...SSSSS......',
    '..SsssssS.....',
    '..SsssssS.....',
    '..gggeoggg....',
    '...gGGGg......',
  ];
  const torso = s => [
    '..bbbbbb.' + (s ? 'wwww.' : '.....'),
    '.Sbbbbbb.' + (s ? 'wwyww' : 'wwww.'),
    '.Sbbbbbb.' + (s ? 'wwyww' : 'wwyww'),
    '..bbbbbb.' + (s ? 'wwww.' : 'wwyww'),
    '..rrrrrr.' + (s ? '.....' : 'wwww.'),
    '..rrrrrr......',
  ];
  const legs = [['..GG..GG......', '..GG..GG......', '.GGG..GGG.....'], ['..GG.GG.......', '...GGGG.......', '..GGG.GG......'], ['...GGGG.......', '..GG..GG......', '.GGG..GGG.....'], ['..GG.GG.......', '..GG..GG......', '.GG...GGG.....']];
  const frames = legs.map((l, i) => mbSprite([...top, ...torso(i % 2 === 0), ...l]));
  const turnTorso = ['..bwwwwwb.....', '.Swwwywwwb....', '.Swwyyywwb....', '..wwwywwwb....', '..rwwwwwr.....', '..rrrrrr......'];
  frames.push(mbSprite([...top, ...turnTorso, ...legs[0]]));
  const hurtTop = ['....SSSSS.....', '...SsssssS....', '...SsssssS....', '...gogggog....', '....gg.gg.....'];
  const hurtTorso = ['..bbbbbb..www.', '.Sbbbbbb.wwyww', '.Sbbbbbb.wwwww', '..bbbbbb......', '..rrrrrr......', '.rrrrrr.......'];
  frames.push(mbSprite(['..SSSSS.......', '.SsssssS......', '.SsssssS......', '.gggeoggg.....', '..gGGGg.......',
    '.bbbbbbwwww...', 'Sbbbbbbwwyw...', 'Sbbbbbbwyyw...', '.bbbbbbwwyw...', '.rrrrrrwwww...', '.rrrrrr.......', '.GG...GG......', 'GG.....GG.....', 'GG......GG....']));
  frames.push(mbSprite(['....SSSSS.....', '...SsssssS....', '...SsssssS....', '...gggeoggg...', '....gGGGg.....',
    '...bbbbbb.wwww', '..Sbbbbbb.wwyw', '..Sbbbbbb.wyyw', '...bbbbbb.wwyw', '...rrrrrr.wwww', '..rrrrrr......', '.GGG...GG.....', 'GG.......GG...', 'G..........GG.']));
  frames.push(mbSprite([...hurtTop, ...hurtTorso, '..GG...GG.....', '.GG.....GG....', 'GG.......GG...']));
  return pack(frames, 7, 15, 10, 14);
}

// Spitter — toadstool that spits seeds. 14×12. Frames: idle, cap-tilt, mouth open.
export function bakeSpitter() {
  const cap = ['....rrrrrr....', '..rrrerrrrer..', '.rrrrrrrrrrrr.', 'rrerrrrrerrrrr', 'rrrrrrrrrrrrrr', '.RRRRRRRRRRRR.'];
  const capL = ['...rrrrrr.....', '.rrrerrrrer...', 'rrrrrrrrrrrr..', 'rerrrrrerrrrrr', 'rrrrrrrrrrrrrr', '.RRRRRRRRRRRR.'];
  const stem = ['...kkkkkkkk...', '...kokkkkok...', '...kkkkkkkk...', '...kkkGGkkk...', '...kkkkkkkk...', '..kkkkkkkkkk..'];
  const stemOpen = ['...kkkkkkkk...', '...kokkkkok...', '...kkGGGGkk...', '...kkGGGGkk...', '...kkkGGkkk...', '..kkkkkkkkkk..'];
  return pack([sprite([...cap, ...stem]), sprite([...capL, ...stem]), sprite([...cap, ...stemOpen])], 8, 13, 12, 12);
}

// Wasp — striped flyer. 12×8, three wing frames.
export function bakeWasp() {
  const body = ['..oyoyoyoy..', '.ooyoyoyoyo.', '..oyoyoyoyo.', '...ooooo..o.'];
  const a = sprite(['...ll..ll...', '..llll.llll.', '...llllll...', ...body]);
  const b = sprite(['............', '...ll..ll...', '..llllllll..', ...body]);
  const c = sprite(['............', '............', '..ll.ll.ll..', ...body]);
  const hurt = sprite(['............', '..l......l..', '...l.ll.l...', '..oyoyoyo...', '.ooyoyoyoo..', '..oyoyoyo.o.', '....ooooo...']);   /* curled up round the sting, wings crumpled */
  return pack([a, b, c, hurt], 7, 7, 10, 7);
}

export function bakeSeed() {
  const c = sprite(['.pp.', 'pppp', 'pppp', '.pp.']);
  return pack([c], 3, 3, 4, 4);
}

// Thornback — armoured beetle with a spined back. Four-frame leg scuttle.
// Spike goblin (the 'thorn' kind) — a goblin in a spiked iron helm and back plate. 14×11, four-frame walk. Faces right.
export function bakeThornback() {
  const top = ['..S..S..S.....', '.SSSSSSSSSS...', '.SsssssssssS..', '..gggggeogg...', '..gggGGGGgg...'];
  const back = ['.S.S.SS.S.S...', 'SSSSSSSSSSSSS.', '.SrrrrrrrrrS..', '..rrrrrrrrr...'];
  const legs = [['..GG..GG......', '.GG....GG.....'], ['..GG.GG.......', '..GG..GG......'], ['...GGGG.......', '..GG..GG......'], ['..GG.GG.......', '.GG....GG.....']];
  return pack(legs.map(l => sprite([...top, ...back, ...l])), 7, 12, 12, 11);
}

// Spitter pieces for its death: the cap pops off, the stem crumples.
export function bakeSpitterParts() {
  const cap = ['....rrrrrr....', '..rrrerrrrer..', '.rrrrrrrrrrrr.', 'rrerrrrrerrrrr', 'rrrrrrrrrrrrrr', '.RRRRRRRRRRRR.'];
  const stem = ['...kkkkkkkk...', '...kkkkkkkk...', '...kkGGGGkk...', '...kkkkkkkk...', '..kkkkkkkkkk..'];
  return { cap: pack([sprite(cap)], 8, 7, 12, 6), stem: pack([sprite(stem)], 8, 6, 12, 5) };
}

// Hornet Queen - a crowned hornet in three segments: a striped abdomen, a furred thorax, and a head of eyes under a circlet.
// 24x12, facing right. Frames: 0 flap up, 1 flap down, 2 aim (reared, abdomen dropped, legs tucked), 3 dive (raked head-down),
// 4 volley (abdomen curled under, the sting at the floor), 5 slam hang (wings flat, braced), 6 winded (down, wings crumpled), 7 sweep (low and level).
export function bakeQueen() {
  const QP = Object.assign({}, EP, { Y: '#fff1a0', c: '#ffd34a', C: '#c9962a', L: '#9ab0d8', v: '#8fd160', d: '#6a4a2a', D: '#3a2618', r: '#ff6b3a', R: '#c9463d' });
  const q = rows => outline(fromGrid(rows, QP, 1), OUT);
  const P = '........................';
  const crownPts = '.................c.c.c..', crownBand = '................ccCccc..';
  const brow = '................dddddd..', eyeA = '...............drrRRrrd.', eyeB = '...............drrRRrrd.', jaw = '................dDDDDd..';
  const thx = [
    '...........Dddddd.......',
    'DyYyyYyyYyDdddddd.......',
    'yYyyYyyYyyDdddddd.......',
    'DyYyyYyyYyDDddddD.......',
    '.DyyDDyyDDD.............',
  ];
  const legs = 'D...dd..dd..dd..........', legsTuck = 'D.....Dd.dd.dD..........', legsSplay = 'D..d...d..d...d.........';
  const wUp = ['....llll.lllll..........', '..lLllllLlllll..........', '.llllLllllll............'];
  const wDn = [P, '...llll.lllll...........', '..lLllllLllll...........'];
  const wHi = ['..lll.llll..............', '.lLlllllLlll............', '..llllLlllll............'];
  const wFlat = [P, 'llllllLlllllll..........', '.lLlllllLllll...........'];
  const hover = w => q([crownPts, crownBand, merge(w[0], brow), merge(w[1], eyeA), merge(w[2], eyeB), jaw, ...thx, legs]);
  // 2 aim: she rears, head high, abdomen swung down behind her, legs pulled in
  const aim = q([
    crownPts, crownBand,
    merge(wHi[0], brow), merge(wHi[1], eyeA), merge(wHi[2], eyeB),
    '.....DdddddD....dDDDDd..',
    '..DyYyyYyyYyD...........',
    '.DyYyyYyyYyyD...........',
    '..DyYyyYyyYD............',
    '...DyyDDyyD.............',
    '....DDyyD...............',
    legsTuck,
  ]);
  // 3 dive: raked from top-left to bottom-right, wings swept to stubs
  const dive = q([
    '..ll....................',
    '..lLll..................',
    'DyYyyYyD................',
    '.yYyyYyyYD..............',
    '..DyYyyYyyD.............',
    '....Ddddddd..c.c.c......',
    '.......DddddccCccc......',
    '..........ddddddddd.....',
    '..........ddrrRRrrd.....',
    '..........ddrrRRrrd.....',
    '...........dDDDDd.......',
    P,
  ]);
  // 4 volley: hanging, the abdomen curled under her, the sting pointed at the floor
  const volley = q([
    crownPts, crownBand,
    merge(wUp[0], brow), merge(wUp[1], eyeA), merge(wUp[2], eyeB), jaw,
    '..........Ddddddd.......',
    '..DyYyyYyyDdddddd.......',
    '...DyYyyYyDDddddD.......',
    '....DyYyyYD.............',
    '.....DyyDD..............',
    '......DvD...............',
  ]);
  // 5 slam hang: wings out flat, legs braced under her, the whole body compressed
  const slam = q([
    P, crownPts, crownBand,
    merge(wFlat[1], eyeA), merge(wFlat[2], eyeB), jaw, ...thx, legs,
  ]);
  // 6 winded: on the floor, wings crumpled, head drooped, legs splayed
  const winded = q([
    P, P,
    '..ll..ll................',
    '..lLl.lLl.......c.c.c...',
    '.....DdddddD...ccCccc...',
    'DyYyyYyyYyDdddd.dddddd..',
    'yYyyYyyYyyDdddddrrRRrrd.',
    'DyYyyYyyYyDDdddddrrRRrd.',
    '.DyyDDyyDDD......dDDDd..',
    legsSplay,
    P, P,
  ]);
  // 7 sweep: low and level, wings streaming back behind her
  const sweep = q([
    P, P,
    '.lL.....................',
    '.llll...........c.c.c...',
    '..lLllL........ccCccc...',
    '.....DdddddD....dddddd..',
    'DyYyyYyyYyDdddddrrRRrrd.',
    'yYyyYyyYyyDdddddrrRRrrd.',
    'DyYyyYyyYyDDddddDDDDDd..',
    '.DyyDDyyDDD.............',
    '....dd..dd..dd..........',
    P,
  ]);
  return pack([hover(wUp), hover(wDn), aim, dive, volley, slam, winded, sweep], 12, 14, 22, 12);
}

function merge(a, b) { let s = ''; for (let i = 0; i < Math.max(a.length, b.length); i++) { const x = a[i] || '.', y = b[i] || '.'; s += x !== '.' ? x : y; } return s; }

// Goblin archer — hooded sprig with a shortbow. 12×12. Frames: idle, draw (bow bent, arrow nocked), walk1, walk2.
export function bakeArcher(over = {}) {   /* over: a palette on top of his - the caverns' bone archer is this archer with the meat off */
  /* THE ARCHER is his BOW: a stave as tall as he is, strung and carried upright at his front, so the goblin
     with a long curve standing off the side of him is the one that shoots. It was three pixels of stick. */
  const hood = ['....HHHH....', '...HHHHHH...', '..HHgeoggeH.', '..HHgggggg..', '...HgGGGg...'];
  const bodyIdle = ['..bbbbbb....', '..bbbbbb....', '..rrrrrr....', '..GG..GG....', '.GG....GG...'];
  const bodyDraw = ['..bbbbbb....', '..bbbbbbaaaa', '..rrrrrr....', '..GG..GG....', '.GG....GG...'];
  const walk1 = ['..bbbbbb....', '..bbbbbb....', '..rrrrrr....', '..GG.GG.....', '..GG..GG....'];
  const walk2 = ['..bbbbbb....', '..bbbbbb....', '..rrrrrr....', '...GGGG.....', '..GG..GG....'];
  const P2 = Object.assign({}, EP, { H: '#3f5a33', b: '#6b4a2a', a: '#e8dcc0', l: '#e8dcc0' }, over);
  const spr = rows => outline(fromGrid(rows, P2, 1), OUT);
  const hoodLook = [hood[0], hood[1], '..HHggeogge.', hood[3], hood[4]];
  const bow = (rows, drawn) => { const out = ['............', '............', ...rows].map(r => r.split(''));
    const put = (y, x, ch) => { if (out[y] && (out[y][x] === '.' || ch === 'w')) out[y][x] = ch; };
    put(0, 9, 'w'); put(1, 10, 'w'); for (let y = 2; y <= 9; y++) put(y, 11, 'w'); put(10, 10, 'w'); put(11, 9, 'w');
    for (let y = 1; y <= 10; y++) put(y, drawn === 2 && y > 3 && y < 10 ? 7 : drawn && y > 4 && y < 9 ? 8 : 9, 'l');   /* drawn 2: the string all the way back */
    return out.map(a => a.join('')); };
  /* THE SHOT IN THREE BEATS: the arrow nocked, the string all the way to his cheek, and the release with the arm thrown forward - and a hurt frame, hood knocked back */
  const bodyFull = ['..bbbbbb....', '..bbbbbbaaaa', '..rrrrrr....', '.GG...GG....', 'GG.....GG...'];
  const bodyLoose = ['..bbbbbb....', '..bbbbbbbaa.', '..rrrrrr....', '..GG..GG....', '.GG....GG...'];
  const hurtRows = ['............', '....HHHH....', '...HHHHHH...', '..HHgoggog..', '..HHgg..gg..', '..bbbbbb....', '.bbbbbb.....', '..rrrrrr....', '.GG...GG....', 'GG.....GG...'];
  return pack([spr(bow([...hood, ...bodyIdle])), spr(bow([...hood, ...bodyDraw], true)), spr(bow([...hood, ...walk1])), spr(bow([...hood, ...walk2])), spr(bow([...hoodLook, ...bodyIdle])),
    spr(bow([...hood, ...bodyFull], 2)), spr(bow([...hood, ...bodyLoose])), spr(bow(hurtRows)),
    /* (claude/stockade2art) 8 DOZE: sat on the walk, hood down over the face, the bow across his knees, the horn at his belt | 9 WIND: the horn blower's own pose - head back, cheeks full, the bow slung, one arm up to the horn (the horn is drawn at his mouth) */
    spr(['............', '............', '............', '............', '............', '....HHHH....', '...HHHHHH...', '..HHHHHHHH..', '..HHggHHHH..', '..bbbbbbbaa.', '.wwwwwwwwwwl', 'GGGGGGGGGGG.']),
    spr(['............', '............', '....HHHH....', '...HHHHHH...', '.wHHgeoggeH.', '.wHHggooggg.', '.w.HgGGGg...', '.wbbbbbb.aa.', '.wbbbbbbaa..', '..rrrrrr....', '..GG..GG....', '.GG....GG...'])], 6, 13, 8, 10);
}

// Bird — scatters from bushes. 6×4, two wing frames.
export function bakeBird() {
  const P2 = { b: '#3a3040', w: '#5a5068', y: '#e0b040' };
  const f = rows => outline(fromGrid(rows, P2, 1), OUT);
  return pack([f(['w....w', '.wbbw.', '..bby.', '......']), f(['......', '..bby.', '.wbbw.', 'w....w'])], 4, 4, 6, 4);
}

// The Bullfrog King — 32×18. Frames: sit, inflated (croak), mouth open.
export function bakeFrog() {
  const P2 = { F: '#5a9a3a', D: '#3a6a2a', L: '#8fc85a', B: '#d8e0a0', e: '#f3f0d2', o: OUT, r: '#c9463d', R: '#8f2f28', y: '#e0b040', p: '#ff7a9a' };
  const f = rows => outline(fromGrid(rows, P2, 1), OUT);
  const sit = [
    '......yyy....................yyy',
    '.....DeeoD..................DeeoD',
    '....DFeeoFD................DFeeoFD',
    '...DFFFFFFFDDDDDDDDDDDDDDDDDFFFFFFFD',
    '..DFFLLFFFFFFFFFFFFFFFFFFFFFFFFLLFFD',
    '.DFFLLFFFFFFFFFFFFFFFFFFFFFFFFFFLLFFD',
    '.DFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD',
    'DFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD',
    'DFFFFRRRRRRRRRRRRRRRRRRRRRRRRRRRFFFFD',
    'DFFBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBFFD',
    '.DFBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBFD.',
    '.DDFFBBBBBBBBBBBBBBBBBBBBBBBBBBFFDD..',
    '..DFFFFDDD..DFFFFFFFFFFFD..DDDFFFFD..',
    '.DDFFFD......DDDDDDDDDDD......DFFFDD.',
    'DDDDDD..........................DDDDDD',
  ];
  const inflated = sit.map((r, i) => (i >= 8 && i <= 11) ? r.replace(/B/g, 'L') : r);
  const open = sit.map((r, i) => i === 8 ? r.replace(/R/g, 'r') : i === 9 ? r.replace(/B/g, 'r') : i === 10 ? r.replace(/B/g, 'R') : r);
  const pad = '.'.repeat(38);
  // The leap reads in the whole body, not the feet: he squashes to gather, stretches in the air, splats on landing.
  // 3 crouch: two body rows out, padded down. He is low and wide and about to go.
  const crouch = [pad, pad, ...sit.slice(0, 6), ...sit.slice(8, 12),
    '..DFFFFFDD..DFFFFFFFFFFFD..DDFFFFFD..',
    '.DDFFFFFD....DDDDDDDDDDD....DFFFFFDD.',
    'DDDFFDDDD..................DDDDFFDDD.'];
  // 4 leap: two body rows in, and the legs trail straight down under him
  const leap = [...sit.slice(0, 7), sit[6], sit[6], ...sit.slice(7, 12),
    '...DFFFD.....DFFFFFFFFD.....DFFFD....',
    '...DFFFD......DDDDDDDD......DFFFD....',
    '...DFFD........................DFFD..',
    '...DDD..........................DDD..'];
  // 5 land: three rows out and the legs thrown wide. He hits the boards flat.
  const land = [pad, pad, pad, pad, ...sit.slice(0, 5), ...sit.slice(8, 12),
    'DFFFFDD.....DFFFFFFFFFFFD.....DDFFFFD',
    'DDDDDD.........DDDDDDDDD........DDDDD'];
  // 6 dazed: down on the boards, the eyes gone, the mouth hanging open
  const dazed = [pad, pad, pad,
    '.....DDDDD..................DDDDD....',
    '....DFDDDFD................DFDDDFD...',
    ...sit.slice(3, 8),
    'DFFFFrrrrrrrrrrrrrrrrrrrrrrrrrrrFFFFD',
    'DFFrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrFFD',
    '.DFRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRFD.',
    'DFFFFDD.....DFFFFFFFFFFFD.....DDFFFFD'];
  return pack([f(sit), f(inflated), f(open), f(crouch), f(leap), f(land), f(dazed)], 19, 16, 32, 14);
}

// Hopper — a marsh frog that leaps at you. 10×8. Frames: sit, leap.
export const HOPPER_COLORS = {
  green: { F: '#5a9a3a', D: '#3a6a2a', L: '#8fc85a', B: '#d8e0a0' },
  yellow: { F: '#d9b83a', D: '#9a7a1a', L: '#f5e07a', B: '#f7f0c0' },
  blue: { F: '#3a6aa0', D: '#244a78', L: '#6fa0d8', B: '#c8d8f0' },
};
export function bakeHopper(color = 'green') {
  const P2 = Object.assign({}, EP, HOPPER_COLORS[color] || HOPPER_COLORS.green);
  const f = rows => outline(fromGrid(rows, P2, 1), OUT);
  const sit = ['.eo....eo.', 'DFFFFFFFFD', 'FFLFFFFLFF', 'FBBBBBBBBF', '.DFFDDFFD.', '.DD....DD.'];
  const leap = ['.eo....eo.', 'DFFFFFFFFD', 'FFLFFFFLFF', 'FBBBBBBBBF', 'DFD....DFD', 'D........D'];
  const crouch = ['..........', '.eo....eo.', 'DFFFFFFFFD', 'FFLFFFFLFF', 'FBBBBBBBBF', 'DDFFDDFFDD'];
  const fall = ['.eo....eo.', 'DFFFFFFFFD', 'FFLFFFFLFF', 'FBBBBBBBBF', '.DFD..DFD.', '..D....D..'];
  return pack([f(sit), f(leap), f(crouch), f(fall)], 6, 7, 9, 6);
}

// ---------- Stockade goblins ----------
// Sapper — sprig with a bomb held overhead. 10×13. Frames: run1, run2.
export function bakeSapper() {
  const bomb = ['....oo....', '...oooo...', '...oooo...', '....oo....'];
  const head = ['...gggg...', '..gggggg..', '.geoggeog.', '.gggggggg.', '..gGGGGg..'];
  const legs = [['..rrrrrr..', '..GG..GG..', '.GG....GG.'], ['..rrrrrr..', '..GG.GG...', '..GG..GG..'], ['..rrrrrr..', '...GGG....', '..GG.GG...'], ['..rrrrrr..', '..GG.GG...', '.GG...GG..']];
  const spr = rows => outline(fromGrid(rows, EP, 1), OUT);
  const arms = [['..........', 'g........g', '.g......g.', '..........'], ['..........', '.g......g.', 'g........g', '..........']];
  return pack([...legs.map(l => spr([...bomb, ...head, ...l])), spr([...arms[0], ...head, ...legs[0]]), spr([...arms[1], ...head, ...legs[2]])], 6, 14, 8, 13);
}
export function bakeBomb() { const c = outline(fromGrid(['.oo.', 'oooo', 'oooo', '.oo.'], { o: '#1b1626' }, 1), '#5f5a52'); return pack([c], 3, 3, 4, 4); }
// Brute — a big goblin with a club. 16×16. Frames: stand, walk, raise (overhead tell), swing.
export function bakeBrute() {
  const P2 = Object.assign({}, EP, { c: '#8a6438', C: '#5a3c1c', v: '#7ab558' });
  //                        18 wide, hunched: the shoulders are the widest part of him
  const head = ['.....gggggggg.....', '....gggggggggg....', '...ggeoggggeogg...', '...ggggggggggggg..', '....gtGGGGGGtg....', '.....gggggggg.....'];
  const shldr = ['..GGGgggggggGGG...', '.GGGGGggggGGGGGG..', 'GGGvGGGGGGGGGvGGG.'];
  const body = ['.GbbbbbbbbbbbbbG..', '.GbbbbrrrrbbbbbG..', '..GbbbbbbbbbbG....', '..rrrrrrrrrrrr....'];
  const legsA = ['...GGGG....GGGG...', '...GGGG....GGGG...', '..GGGGG....GGGGG..'];
  const legsB = ['....GGGG..GGGG....', '....GGGG..GGGG....', '...GGGGG..GGGGG...'];
  const spr = rows => outline(fromGrid(rows, P2, 1), OUT);
  const pad = ['..................', '..................', '..................', '..................'];
  // the club, carried low in his right fist, its head down by his shin
  const low = rows => { const o = rows.slice(); o[o.length - 3] = o[o.length - 3].slice(0, 15) + 'ccc'; o[o.length - 2] = o[o.length - 2].slice(0, 15) + 'cCC'; o[o.length - 1] = o[o.length - 1].slice(0, 15) + 'cCc'; return o; };
  const stand = spr(low([...pad, ...head, ...shldr, ...body, ...legsA]));
  const walk = spr(low([...pad, ...head, ...shldr, ...body, ...legsB]));
  const raise = spr(['.......cccc.......', '......cCCCCc......', '......cCCCCc......', '.......cccc.......', ...head, ...shldr, ...body, ...legsA]);
  const swing = spr([...pad, ...head, ...shldr, body[0], body[1].slice(0, 15) + 'ccc', body[2].slice(0, 14) + 'cCCc', body[3].slice(0, 14) + 'ccc.', ...legsB]);
  /* hurt: the head snapped back and the eyes shut, the upper body leaning off the blow, the club flung up behind him */
  const lean = r => r.slice(1) + '.';
  const hurt = spr(['cc................', 'cCc...............', '.cCc..............', '..cc..............', ...head.map((r, i) => lean(i === 2 ? '...ggGGggggGGgg...' : r)), ...shldr.map(lean), ...body, ...legsA]);
  return pack([stand, walk, raise, swing, hurt], 10, 21, 14, 18);
}
// War hound — low, fast. 14×7. Frames: run1, run2, leap.
export function bakeHound(pal = {}) {
  const P2 = Object.assign({}, EP, { h: '#5a4a3a', H: '#3a2e22' }, pal);
  const spr = rows => outline(fromGrid(rows, P2, 1), OUT);
  const body = ['..hhhhhhhhh.hh', '.hhhhhhhhhhhhh', 'hhhhhhhhhhhh..', 'hHhhhhhhhhhH..'];
  const a = spr(['...........eh.', ...body, '.HH.HH..HH.HH.', '.H...H..H...H.']);
  const b = spr(['...........eh.', ...body, '..HH.HH.HH.HH.', '..H...H.H...H.']);
  const l = spr(['...........eh.', ...body, 'HH.......HH...', 'H.........H...']);
  return pack([a, b, l], 8, 8, 12, 7);
}
// Fox — freed from a cage, fights for you a while. 12×6.
export function bakeFox() {
  const P2 = { f: '#d9782a', F: '#a0521a', w: '#fff6e0', e: '#1b1626' };
  const spr = rows => outline(fromGrid(rows, P2, 1), OUT);
  const a = spr(['.........fe.', 'ff...ffffff.', 'wffffffffff.', '.wffffffff..', '.FF..FF.FF..']);
  const b = spr(['.........fe.', 'ff...ffffff.', 'wffffffffff.', '.wffffffff..', '..FF.FF..FF.']);
  return pack([a, b], 6, 6, 10, 6);
}
// The Goblin Chieftain — helmed, huge, two-handed club. 24×21. Frames: stand, walk, raise, slam, sweep, grab.
export function bakeChief() {
  // The war chief: a horned iron helm, red war paint, a wolf-pelt pauldron, a trophy skull on the belt, a blood-red cloak.
  const P2 = Object.assign({}, EP, { c: '#6b4a2a', C: '#4c2c17', b: '#8f2f28', f: '#8a7a68', F: '#5a4e42', h: '#e8dcc0', q: '#5a1a1a', Q: '#3a1010' });
  const helm = ['....t...SSSSSSSS...t....', '.....t.SsssssssS..t.....', '......tSsssyysssSt......', '.......SssssssssS.......'];
  const head = ['.......ggeorrggeog......', '......ggrgggggggrgg.....', '.......ggGGGGGGgg.......', '........gggggggg........'];
  const body = ['...ffffbbbbbbbbbbbb.....', '..fFffgbbbbbbbbbbbbg....', '..fFf.gbbbhhbbbbbbbg....', '.qq...gbbbhhbbbbbbbg....', '.qq...rrrhhrrrrrrr......', '.qq...rrrrrrrrrrrr......'];
  const legsA = ['.qq...GGGG....GGGG......', '.q....GGGG....GGGG......', '.....GGGGG....GGGGG.....'];
  const legsB = ['.qq....GGGG..GGGG.......', '.q.....GGGG..GGGG.......', '......GGGGG..GGGGG......'];
  const spr = rows => outline(fromGrid(rows, P2, 1), OUT);
  const top = [...helm, ...head];
  const pad = ['........................', '........................', '........................', '........................'];
  const stand = spr([...pad, ...top, ...body, ...legsA]);
  const walk = spr([...pad, ...top, ...body, ...legsB]);
  const raise = spr(['..........ccccc.........', '.........cCCCCCc........', '.........cCCCCCc........', '..........ccccc.........', ...top, ...body, ...legsA]);
  const slam = spr([...pad, ...top, body[0], body[1], body[2], body[3].slice(0, 19) + 'ccccc', body[4].slice(0, 19) + 'cCCCC', body[5].slice(0, 19) + 'ccccc', ...legsB]);
  const sweep = spr([...pad, ...top, body[0], body[1].slice(0, 19) + 'ccccc', body[2].slice(0, 19) + 'cCCCC', body[3].slice(0, 19) + 'ccccc', body[4], body[5], ...legsB]);
  const grab = spr([...pad, ...top, body[0], body[1].slice(0, 19) + 'ggggg', body[2].slice(0, 19) + 'ggggg', body[3], body[4], body[5], ...legsB]);
  // sword and shield: round shield held out front, blade up behind it
  const swordUp = ['........................', '....................l...', '....................l...', '....................l...'];
  const guard = spr([...swordUp, helm[0], helm[1], helm[2], helm[3].slice(0, 20) + 'l...', head[0].slice(0, 20) + 'l...', head[1], head[2], head[3], body[0].slice(0, 18) + '.SSS..', body[1].slice(0, 18) + 'SsssS.', body[2].slice(0, 18) + 'SssyS.', body[3].slice(0, 18) + 'SsssS.', body[4].slice(0, 18) + '.SSS..', body[5], ...legsA]);
  const slash = spr([...pad, ...top, body[0], body[1].slice(0, 18) + 'llllll', body[2].slice(0, 18) + '.SSS..', body[3].slice(0, 18) + 'SsssS.', body[4].slice(0, 18) + '.SSS..', body[5], ...legsB]);
  // the bow: a tall curve out front, arrow nocked
  const bow = spr([...pad, ...top, body[0].slice(0, 19) + '.w...', body[1].slice(0, 19) + '..w..', body[2].slice(0, 18) + 'lll.w.', body[3].slice(0, 19) + '..w..', body[4].slice(0, 19) + '.w...', body[5], ...legsA]);
  const leap = spr([...pad, ...top, ...body, '.....GGGGG..GGGGG.......', '......GGG....GGG........', '........................']);
  // walk cycles: legs alternate and the body drops a row on the passing step (one extra blank row on top, last leg row trimmed)
  const pad5 = [...pad, '........................'];
  const legsC = ['......GGGG....GGGG......', '.....GGGGG....GGGGG.....'];
  const stand2 = spr([...pad5, ...top, ...body, ...legsC]);
  const guardRows = [helm[0], helm[1], helm[2], helm[3].slice(0, 20) + 'l...', head[0].slice(0, 20) + 'l...', head[1], head[2], head[3], body[0].slice(0, 18) + '.SSS..', body[1].slice(0, 18) + 'SsssS.', body[2].slice(0, 18) + 'SssyS.', body[3].slice(0, 18) + 'SsssS.', body[4].slice(0, 18) + '.SSS..', body[5]];
  const guardWalk = spr([...swordUp, ...guardRows, ...legsB]);
  const guardWalk2 = spr(['........................', ...swordUp, ...guardRows, ...legsC]);
  const bowRows = [...top, body[0].slice(0, 19) + '.w...', body[1].slice(0, 19) + '..w..', body[2].slice(0, 18) + 'lll.w.', body[3].slice(0, 19) + '..w..', body[4].slice(0, 19) + '.w...', body[5]];
  const bowWalk = spr([...pad, ...bowRows, ...legsB]);
  const bowWalk2 = spr([...pad5, ...bowRows, ...legsC]);
  return pack([stand, walk, raise, slam, sweep, grab, guard, slash, bow, leap, stand2, guardWalk, guardWalk2, bowWalk, bowWalk2], 12, 22, 16, 18);
}

// ---------- Sporewood ----------
const SP = Object.assign({}, EP, { m: '#9a5aa8', M: '#6a3a7a', t: '#e8e0f0', c: '#4aa0b0', C: '#2a6a7a', v: '#7a5aa8', V: '#4a2a6a', k: '#f0e6c8',
  i: '#4a3560', I: '#2a1c3c', z: '#c97a3a', Z: '#8a4418', q: '#d8cfe8', Q: '#9a8fb0', j: '#7fe0c8', J: '#3a8a78' });   /* the inky, the earthstar's rays, the morel's pits, the drone's veil */
const sspr = rows => outline(fromGrid(rows, SP, 1), OUT);
// Sporeling — a walking cap. 10×10, two frames.
export function bakeSporeling() {
  // FIVE FUNGI, NOT ONE CAP IN FIVE PAINTS. The sporeling, the lurker, the spitcap and the shaman all had
  // the same silhouette - a smooth dome with white dots on a pale stub - and you told them apart by hue,
  // which is no use at all in a purple wood at night. Each of them is a different MUSHROOM now, and the
  // difference is in the outline. This one is the little agaric: a wide dome and a SKIRT round its stem.
  const cap = ['...mmmm...', '..mmtmmm..', '.mmmmmmtm.', 'mmmmmmmmmm', '.MMMMMMMM.'];
  const skirt = '..kKKKKKk.';
  const a = sspr([...cap, skirt, '..kkeokok.', '..kkkkkk..', '..kk..kk..', '.kk....kk.']);
  const b = sspr([...cap, skirt, '..kkeokok.', '..kkkkkk..', '...kkkk...', '..kk..kk..']);
  const c2 = sspr(['..........', ...cap, skirt, '..kkeokok.', '..kk..kk..', '..kk..kk..']);
  const d = sspr([...cap, skirt, '..kkeokok.', '..kkkkkk..', '..kkk.kk..', '.kk...kk..']);
  /* HURT: the cap crushes down over the stalk and it folds at the foot */
  const hurt = sspr(['..........', '..mmmmmm..', '.mmmtmmmm.', 'mmmmmmmmmm', '.MMMMMMMM.', '..kKKKKKk.', '..kkoookk.', '..kk..kk..', '.kk....kk.', '..........']);
  return pack([a, b, c2, d, hurt], 6, 11, 8, 10);
}

// Lurker — looks like a scenery mushroom until it lunges. 14×12: frame 0 hidden, frame 1 mouth open.
export function bakeLurker() {
  // AN INKY CAP: tall, narrow, bell-shaped, and going off at the rim - it hangs there looking like the
  // scenery it is standing in until the front of it opens. Nothing else in the wood is this NARROW.
  const bell = ['.....ii.....', '....iiii....', '...iiqiii...', '...iiiiii...', '..iiiiiiii..', '..iIiiiiIi..', '.iIiIiIiIiI.', '.I.I.I.I.I.I'];
  const a = sspr([...bell, '....kkkk....', '....kkkk....', '....kkkk....', '....kkkk....', '...kkkkkk...']);
  const b = sspr([...bell, '....kkkk....', '...keokok...', '..kRRRRRRk..', '..kRrrrrRk..', '...kkkkkk...']);
  const half = sspr([...bell, '....kkkk....', '...keokok...', '...kkkkkk...', '..kRRRRRRk..', '...kkkkkk...']);
  return pack([a, b, half], 6, 14, 10, 12);   /* the stalk's foot a row into the ground like every walker's: at 13 it stood two rows in */
}

// SPITCAP — a tall rooted mushroom with a bladder for a cap. It swells, then lobs a spore bomb over your head.
// 12×14. Frames: rest, swell (the bladder up and tight), spit (the bladder collapsed and the mouth open).
export function bakeSpitcap() {
  // AN EARTHSTAR. The cap does not dome, it SPLITS - four rays folded back off a sac in the middle, and
  // the sac is what swells and what it lobs at you. The star is readable at a glance and at any hue.
  const stalk = ['...kkkkkk...', '...kkkkkk...', '...kokkok...', '...kkkkkk...', '...kkkkkk...', '..kk....kk..', '.kk......kk.'];
  const rest = sspr(['.z........z.', '.zz.mmmm.zz.', 'zZzmmttmmzZz', '.ZZmmmmmmZZ.', '..MMMMMMMM..', ...stalk]);
  const swell = sspr(['z..........z', 'zz..mmmm..zz', 'Zz.mmmmmm.zZ', 'Z.mmmttmmm.Z', '..mmmmmmmm..', '..MMMMMMMM..', ...stalk.slice(1)]);
  const spit = sspr(['zz........zz', '.Zz.MMMM.zZ.', '..ZmMttMmZ..', '..mMMMMMMm..', '..MMMMMMMM..', ...stalk.slice(1)]);
  return pack([rest, swell, spit], 6, 15, 12, 14);
}

// WEAVER — the pale spider that hangs in the fungus. Fatter and softer than a wood spider, and it spits its
// web at you instead of dropping on you. 12×9. Frames: hang, spit, scuttle1, scuttle2.
export function bakeWeaver() {
  const WP = Object.assign({}, EP, { b: '#c8bcd0', B: '#8a7e9a', r: '#ff4a3a', l: '#6a6278' });
  const w = rows => outline(fromGrid(rows, WP, 1), OUT);
  const hang = w(['.....bb.....', '..l.bbbb.l..', '.l.bBBBBb.l.', 'l.bbrbbrbb.l', '.lbBBBBBBbl.', 'l..bbbbbb..l', '.l..bbbb..l.', 'l...l..l...l']);
  const spit = w(['.....bb.....', '.l..bbbb..l.', 'l..bbrrbb..l', '.lbbrbbrbbl.', 'l.bBBBBBBb.l', '.l.bbbbbb.l.', 'l...bbbb...l', '.l..l..l..l.']);
  const sc1 = w(['l....bb....l', '.l..bbbb..l.', '..lbBBBBbl..', '..bbrbbrbb..', '.lbBBBBBBbl.', 'l..bbbbbb..l', '....bbbb....', '...l....l...']);
  const sc2 = w(['.l...bb...l.', 'l...bbbb...l', '.l.bBBBBb.l.', '..bbrbbrbb..', '..lbBBBBbl..', '.l.bbbbbb.l.', 'l...bbbb...l', '....l..l....']);
  return pack([hang, spit, sc1, sc2], 7, 9, 10, 8);
}
// Spore drone — a floating puffball with a dark eye. 10×8, two frames (breathing).
export function bakeDrone() {
  // A SPORE VEIL, not a blob. A little cap with a long skirt of threads under it, drifting - the threads
  // are the whole silhouette and they are what tells you it is floating rather than standing.
  const a = sspr(['...qqqq...', '..qqqqqq..', '.qqqeoqqq.', '.qQQQQQQq.', '..j.jj.j..', '..j.jj.j..', '...j..j...']);
  const b = sspr(['..qqqqqq..', '.qqqqqqqq.', 'qqqqqeoqqq', '.qQQQQQQq.', '..jj..jj..', '.j.j..j.j.', '.j......j.']);
  const blink = sspr(['...qqqq...', '..qqqqqq..', '.qqqooqqq.', '.qQQQQQQq.', '..j.jj.j..', '...jjjj...', '...j..j...']);
  const mid = sspr(['..qqqqqq..', '.qqqqqqqq.', '.qqqeoqqq.', 'qQQQQQQQQq', '..jj..jj..', '..j.jj.j..', '..j....j..']);
  return pack([a, b, blink, mid], 6, 8, 9, 7);
}

// Toad shaman — a toadstool that walks, wears a bone circlet, casts. 14×13: idle, cast.
export function bakeShaman() {
  // A MOREL: a tall pitted cone instead of a cap, honeycombed all over, and a bone circlet round the foot
  // of it. Nothing else in the wood has a POINT on top.
  const cap = ['.....cc.....', '....cCcC....', '...cCccCc...', '...cCccCc...', '..cCccCccC..', '..cCccCccC..', '.cCccCccCcc.', '.CCcCCcCCcC.', 'cccccccccccc', '.CCCCCCCCCC.'];
  const stem = ['...kkkkkk...', '...kokkok...', '...kkkkkk...', '...kkGGkk...', '...kkkkkk...', '..kk....kk..', '.kk......kk.'];
  const cast = ['..tkkkkkkt..', '..tkokkokt..', '...kkkkkk...', '...kGGGGk...', '...kkkkkk...', '..kk....kk..', '.kk......kk.'];
  const walkA = [...stem.slice(0, 5), '...kk...kk..', '..kk....kk..'], walkB = [...stem.slice(0, 5), '..kk...kk...', '...kk...kk..'];
  const cast2 = ['.t.kkkkkk.t.', 't.tkokkokt.t', '...kkkkkk...', '...kGGGGk...', '...kkkkkk...', '..kk....kk..', '.kk......kk.'];
  return pack([sspr([...cap, ...stem]), sspr([...cap, ...cast]), sspr([...cap, ...walkA]), sspr([...cap, ...walkB]), sspr([...cap, ...cast2])], 6, 17, 10, 16);
}


// ---------- Kingswood ----------
const KG = Object.assign({}, EP, { h: '#5a4a3a', H: '#3a2e22', q: '#5a1a1a', Q: '#3a1010', f: '#8a7a68', F: '#5a4e42', a: '#e8dcc0', x: '#c9b27c', z: '#7a5a2a' });
const kspr = rows => outline(fromGrid(rows, KG, 1), OUT);
// Thief — a goblin with a sack, hunched. 10×11. Frames: run1, run2, look.
export function bakeThief() {
  /* THE THIEF has already been somewhere: a SACK over his shoulder bigger than his head, riding up behind
     him, so the goblin with a hump is the one that takes things. */
  const head = ['...gggg...', '..gggggg..', '.geoggeog.', '.gggggggg.', '..gGGGGg..'];
  const sack = ['.zzz.rrrr.', 'zzzzzrrrr.', 'zzzzzrrrr.', '.zzz.rrrr.'];
  const hump = rows => ['.zzz......', 'zzzzz.....', 'zzzzzz....'].concat(rows.map((r, i) => { const a = r.split(''); if (i < 2) { if (a[0] === '.') a[0] = 'z'; if (a[1] === '.') a[1] = 'z'; } return a.join(''); }));
  const run1 = ['..GG.GG...', '.GG...GG..'], run2 = ['...GGG....', '..GG.GG...'];
  const look = kspr(hump([head[0], head[1], '.gggeogge.', head[3], head[4], ...sack, '..GG..GG..', '.GG....GG.']));
  return pack([kspr(hump([...head, ...sack, ...run1])), kspr(hump([...head, ...sack, ...run2])), look], 6, 15, 8, 11);
}
// Pikeman — a goblin behind a long pike. 22×12. Frames: guard, thrust.
export function bakePike() {
  const head = ['...gggg...............', '..gggggg..............', '.geoggeog.............', '.gggggggg.............', '..gGGGGg..............'];
  const bodyG = ['..bbbbbb.hhhhhhhhhhhss', '..bbbbbb..............', '..rrrrrr..............', '..GG..GG..............', '.GG....GG.............'];
  const bodyT = ['..bbbbbb..............', '..bbbbbbhhhhhhhhhhhhss', '..rrrrrr..............', '...GG.GG..............', '..GG...GG.............'];
  const bodyB = ['..bbbbbb..............', 'hhbbbbbbhhhhhhhhss....', '..rrrrrr..............', '.GG..GG...............', 'GG....GG..............'];
  // HURT: the pike drops across him and the head goes back
  const hurtP = kspr(['......................', '...gggg...............', '..gggggg..............', '.goggggog.............', '..gGGGGg..............', '..bbbbbb.hhhh.........', '..bbbbbbhhhh..........', '..rrrrrr..............', '.GG...GG..............', 'GG.....GG.............']);
  return pack([kspr([...head, ...bodyG]), kspr([...head, ...bodyT]), kspr([...head, ...bodyB]), hurtP], 6, 11, 10, 12);
}
// Townsfolk — small unarmed goblins in aprons and hoods, two colours. 8×9. Frames: run1, run2, cower.
export function bakeFolk(alt) {
  const P2 = Object.assign({}, KG, alt ? { x: '#b8c8e0', r: '#5a6a9a' } : {});
  const f = rows => outline(fromGrid(rows, P2, 1), OUT);
  const head = ['..gggg..', '.geogeo.', '.gggggg.', '..gGGg..'];
  return pack([f([...head, '.xxxxxx.', '.xxxxxx.', '.GG.GG..', 'GG...GG.']), f([...head, '.xxxxxx.', '.xxxxxx.', '..GGG...', '.GG.GG..']), f(['........', '..gggg..', '.geogeo.', '.gggggg.', '.xxxxxx.', 'xxxxxxxx', '.GG.GG..', '........'])], 4, 10, 6, 9);
}
// Hound Master — a big goblin in a fur cloak on a great hound. 24×16 mounted (2 run frames); on foot 12×14 (stand, whip).
export function bakeMaster() {
  const rider = ['........gggggg..........', '.......fggeoggf.........', '.......ffggggff.........', '......fffbbbbbff........', '.......ffbbbbff.........'];
  const houndA = ['...hhhhhhhhhhhhhh.h.....', '..hhhhhhhhhhhhhhhhhh..hh', '.hHhhhhhhhhhhhhhhhhhhhh.', 'hHh..hhhhhhhhhhhhhhh.eh.', '.HH.HH.......HH.HH......', '.H...H.......H...H......'];
  const houndB = ['...hhhhhhhhhhhhhh.h.....', '..hhhhhhhhhhhhhhhhhh..hh', '.hHhhhhhhhhhhhhhhhhhhhh.', 'hHh..hhhhhhhhhhhhhhh.eh.', '..HH.HH.....HH.HH.......', '..H...H.....H...H.......'];
  const mA = kspr([...rider, ...houndA]), mB = kspr([...rider, ...houndB]);
  const footHead = ['....gggggg..', '...fggeoggf.', '...ffggggff.'];
  const stand = kspr([...footHead, '..fffbbbbff.', '...ffbbbbff.', '....rrrrrr..', '....GG..GG..', '...GG....GG.']);
  const whip = kspr([...footHead, '..fffbbbbffz', '...ffbbbbffzz', '....rrrrrr.zz', '....GG..GG..', '...GG....GG.']);
  return { mounted: pack([mA, mB], 12, 12, 20, 16), foot: pack([stand, whip], 6, 9, 10, 14) };
}
// King Gorm Underleaf — seated on the throne (24×20: idle, throw, shout) and standing (24×26: stand, slam).
export function bakeKing() {
  const KP2 = Object.assign({}, KG, { y: '#ffd36b', c: '#c9463d', C: '#8f2f28', t: '#e8dcc0' });
  const k = rows => outline(fromGrid(rows, KP2, 1), OUT);
  const crown = ['.......y.y.y.y..........', '.......yyyyyyy..........'];
  const face = ['......ggggggggg.........', '.....ggeogggeogg........', '.....gggggggggg.........', '......ggGGGGGgg.........', '.......ggggggg..........'];
  const seated = ['....cccccccccccc........', '...ccccccccccccc........', '..cccccccccccccc........', '..cccyyyycccccc.........', '.ttt.cccccccccc.........', '.ttt.cccccccccc.........', '....GGGG..GGGG..........', '....GGGG..GGGG..........'];
  const seatedThrow = ['....cccccccccccc..yy....', '...ccccccccccccc.yy.....', '..ccccccccccccccff......', '..cccyyyycccccc.........', '.ttt.cccccccccc.........', '.ttt.cccccccccc.........', '....GGGG..GGGG..........', '....GGGG..GGGG..........'];
  const shoutFace = ['......ggggggggg.........', '.....ggeogggeogg........', '.....gggggggggg.........', '......ggRRRRRgg.........', '.......ggRRRgg..........'];
  const idle = k([...crown, ...face, ...seated]), thr = k([...crown, ...face, ...seatedThrow]), sh = k([...crown, ...shoutFace, ...seated]);
  const standBody = ['....cccccccccccc........', '...ccccccccccccc........', '..cccccccccccccc........', '..cccyyyycccccc.........', '..ccccccccccccc.........', '..ccccccccccccc.........', '...cccccccccccc.........', '....rrrrrrrrrr..........', '....GGGG..GGGG..........', '....GGGG..GGGG..........', '...GGGGG..GGGGG.........'];
  const slamBody = ['....cccccccccccc.zzzz...', '...ccccccccccccczzzzzz..', '..ccccccccccccccczzzz...', '..cccyyyycccccc.........', '..ccccccccccccc.........', '..ccccccccccccc.........', '...cccccccccccc.........', '....rrrrrrrrrr..........', '....GGGG..GGGG..........', '....GGGG..GGGG..........', '...GGGGG..GGGGG.........'];
  const pad3 = ['........................', '........................', '........................'];
  return { seated: pack([idle, thr, sh], 11, 16, 18, 15), standing: pack([k([...pad3, ...crown, ...face, ...standBody]), k([...crown, ...face, ...slamBody, '........................', '........................', '........................'])], 11, 22, 18, 21) };
}

// KING GORM at three times the size: drawn with primitives, not a grid. Seated frames 72×48 (feet at the bottom edge), standing frames 64×64.
// Frames — seated: idle, throw, shout, reach (the grab), held. Standing: stand, walk, slam, reach, grab, lift, kneel.
export function bakeKingBig() {
  const SK = '#6faa4a', SKD = '#3f6e2c', RB = '#c9463d', RBD = '#8f2f28', RBL = '#e07060', FUR = '#e8dcc0', GLD = '#ffd36b', GLD2 = '#a07a1c', EYE = '#f3f0d2', BELT = '#3a2e22', TOOTH = '#fff6e0', WOOD = '#5c3a1d';
  const head = (g, x, y, mouth) => { // 30 wide, 22 tall; x,y = top-left. mouth: 0 shut, 1 open (shout), 2 gritted
    rect(g, x + 3, y, 24, 6, SK); rect(g, x, y + 4, 30, 14, SK); rect(g, x - 4, y + 8, 38, 11, SK); rect(g, x - 2, y + 18, 34, 4, SKD); rect(g, x + 1, y + 21, 28, 3, SK); rect(g, x + 3, y + 23, 24, 1, SKD); /* cheeks, jowls, a second chin */ // skull, jaw, underbite shadow
    rect(g, x + 1, y + 5, 3, 5, SKD); rect(g, x + 26, y + 5, 3, 5, SKD); // ear roots
    rect(g, x - 3, y + 3, 5, 7, SK); rect(g, x + 28, y + 3, 5, 7, SK); // ears
    rect(g, x + 6, y + 7, 6, 5, EYE); rect(g, x + 18, y + 7, 6, 5, EYE); rect(g, x + 9, y + 8, 2, 3, OUT); rect(g, x + 21, y + 8, 2, 3, OUT); // eyes
    rect(g, x + 5, y + 6, 8, 1, SKD); rect(g, x + 17, y + 6, 8, 1, SKD); // brows
    rect(g, x + 13, y + 11, 4, 3, SKD); // nose
    if (mouth === 1) { rect(g, x + 8, y + 15, 14, 6, RBD); rect(g, x + 9, y + 15, 2, 2, TOOTH); rect(g, x + 19, y + 15, 2, 2, TOOTH); rect(g, x + 13, y + 19, 4, 2, RBL); }
    else { rect(g, x + 8, y + 16, 14, 1, SKD); rect(g, x + 7, y + 15, 2, 3, TOOTH); rect(g, x + 21, y + 15, 2, 3, TOOTH); if (mouth === 2) rect(g, x + 10, y + 16, 10, 2, TOOTH); } // tusks up from the underbite
  };
  const crown = (g, x, y) => { rect(g, x, y + 3, 26, 5, GLD); rect(g, x, y + 7, 26, 1, GLD2); for (let i = 0; i < 5; i++) { rect(g, x + 1 + i * 6, y, 2, 4, GLD); px(g, x + 1 + i * 6, y, '#fff6e0'); } rect(g, x + 4, y + 4, 2, 2, RB); rect(g, x + 12, y + 4, 2, 2, '#4a90e0'); rect(g, x + 20, y + 4, 2, 2, '#4aa05a'); };
  const arm = (g, x, y, dx, dy, fist) => { // an upper arm from (x,y) to (x+dx,y+dy), 7 thick, a fist at the end
    line(g, x, y, x + dx, y + dy, RB, 7); line(g, x, y, x + dx, y + dy, RBD, 2); const fx = x + dx, fy = y + dy; rect(g, fx - 4, fy - 4, 9, 9, SK); rect(g, fx - 4, fy + 3, 9, 2, SKD); if (fist === 'open') { rect(g, fx + 4, fy - 5, 4, 2, SK); rect(g, fx + 4, fy - 1, 4, 2, SK); rect(g, fx + 4, fy + 3, 4, 2, SK); }
  };
  const sceptre = (g, x0, y0, x1, y1) => { line(g, x0, y0, x1, y1, WOOD, 3); circle(g, x1, y1, 4, GLD); circle(g, x1, y1, 2, RB); };
  const boots = (g, x, y, apart) => { rect(g, x, y, 14, 8, SKD); rect(g, x, y + 6, 15, 2, OUT); rect(g, x + apart, y, 14, 8, SKD); rect(g, x + apart, y + 6, 15, 2, OUT); };
  const robe = (g, x, y, w, h) => { rect(g, x, y, w, h, RB); rect(g, x - 4, y + 8, w + 8, h - 14, RB); rect(g, x - 2, y + 9, 6, h - 18, RBL); rect(g, x - 4, y + h - 8, w + 8, 2, RBD); /* the belly, out over the belt on both sides */ rect(g, x + 2, y + 2, w - 4, 3, RBL); rect(g, x, y + h - 4, w, 4, RBD); rect(g, x - 2, y, w + 4, 4, FUR); for (let i = 0; i < w; i += 5) px(g, x + i, y + 1, '#c8bca0'); rect(g, x + 6, y + Math.floor(h / 2), w - 12, 4, BELT); rect(g, x + Math.floor(w / 2) - 3, y + Math.floor(h / 2) - 1, 6, 6, GLD); rect(g, x + Math.floor(w / 2) - 1, y + Math.floor(h / 2) + 1, 2, 2, GLD2); };
  const finish = c => outline(c, OUT);
  // ---- seated ----
  const seated = (pose) => { const [c, g] = canvas(100, 48); g.translate(12, 0);
    boots(g, 16, 40, 26); // feet on the litter
    robe(g, 4, 17, 64, 27); // the belly
    if (pose === 'throw') arm(g, 66, 22, 8, -16, 'fist'); else if (pose === 'reach') arm(g, 66, 24, 12, 6, 'open'); else arm(g, 66, 24, 6, 12, 'fist');
    if (pose !== 'reach') sceptre(g, 74, 36, 82, 10);
    arm(g, 4, 24, -6, 12, 'fist');
    head(g, 21 + 15 - 15 + 0, pose === 'held' ? 6 : 0, pose === 'shout' ? 1 : pose === 'reach' ? 2 : 0); crown(g, 23, pose === 'held' ? 2 : -4);
    return finish(c); };
  // ---- standing ----
  const standing = (pose) => { const [c, g] = canvas(92, 64); g.translate(14, 0);
    const kneel = pose === 'kneel', walk = pose === 'walk';
    if (kneel) { rect(g, 6, 52, 18, 10, SKD); rect(g, 40, 52, 18, 10, SKD); rect(g, 6, 60, 52, 2, OUT); } else boots(g, 9, 56, walk ? 36 : 32);
    const by = kneel ? 30 : 20; robe(g, -2, by, 68, kneel ? 24 : 36);
    if (pose === 'slam') { arm(g, 62, by + 4, 6, -22, 'fist'); sceptre(g, 68, by - 18, 52, by - 30); }
    else if (pose === 'reach') { arm(g, 62, by + 6, 14, 4, 'open'); }
    else if (pose === 'grab') { arm(g, 62, by + 6, 12, 10, 'fist'); }
    else if (pose === 'lift') { arm(g, 62, by + 4, 4, -20, 'open'); arm(g, 2, by + 4, -4, -20, 'open'); }
    else { arm(g, 62, by + 6, 4, 16, 'fist'); sceptre(g, 66, by + 26, 74, by - 6); }
    if (pose !== 'lift') arm(g, 2, by + 6, -4, 16, 'fist');
    head(g, 17, by - 20, pose === 'slam' ? 1 : pose === 'reach' || pose === 'grab' ? 2 : 0); crown(g, 19, by - 24);
    return finish(c); };
  return {
    seated: pack(['idle', 'throw', 'shout', 'reach', 'held'].map(seated), 48, 48, 70, 45),
    standing: pack(['stand', 'walk', 'slam', 'reach', 'grab', 'lift', 'kneel'].map(standing), 46, 64, 58, 60),
  };
}
// A hall chandelier: an iron ring of candles on a chain. 24×16, hangs from its top.
export function bakeChandelier() { const [c, g] = canvas(24, 16); rect(g, 11, 0, 2, 5, '#5a6270'); rect(g, 2, 9, 20, 3, '#3a3e48'); rect(g, 2, 9, 20, 1, '#8a919c'); for (let i = 0; i < 4; i++) { const x = 3 + i * 6; rect(g, x, 5, 2, 4, '#e8e0d0'); px(g, x, 4, '#ffd36b'); px(g, x + 1, 3, '#ff9a5c'); } rect(g, 4, 12, 16, 2, '#2a2c36'); return outline(c, OUT); }

// ---------- The Crags: hill folk and beasts ----------
const CP = Object.assign({}, EP, { h: '#8a8478', H: '#5a5448', f: '#e8e0d0', F: '#b8b0a0', v: '#7a5a8a', V: '#4a3a5a', c: '#5a4a3a', x: '#c9b27c', z: '#3a2e22', m: '#c9a83a' });
const cspr = rows => outline(fromGrid(rows, CP, 1), OUT);
// Crag harpy — a grey-winged diver with a hooked beak. 16×10. Frames: glide, flap, dive (wings folded), downed.
export function bakeHarpy() {
  const glide = cspr(['hh............hh', '.hhh........hhh.', '..hhhhhHHhhhh...', '....hhheehhh....', '.....hhmhhh.....', '......hhhh......', '.....H....H.....']);
  const flap = cspr(['................', '......hhhhh.....', '..hhhhhHHhhhhh..', 'hhh.hhheehhh.hhh', '.....hhmhhh.....', '......hhhh......', '.....H....H.....']);
  const dive = cspr(['................', '................', '......hheehh....', '.....hhhmhhhh...', '....hhhhhhhhhh..', '..hhhhhhhhhhhh..', '.hh.........hh..']);
  const down = cspr(['................', '................', '................', 'hhhh..hhhhhh.hhh', 'hhhhhhhheehhhhhh', '.hhhhhhhmhhhhh..', '..H..H....H..H..']);
  /* THE STOOP: wings thrown up and talons forward, the beat before it drops (4); and hit (5), wings crumpled and tumbling */
  const aim = cspr(['hh............hh', 'hhh..........hhh', '.hhh..hhhh..hhh.', '...hhhheehhhh...', '.....hhmhhh.....', '......hhhh......', '....HH....HH....']);
  const hurt = cspr(['................', '...h........h...', '..hhh.hhhh.hhh..', '...hhhheehhhh...', '....hhhmmhhh....', '.....hhhhhh.....', '......H..H......']);
  return pack([glide, flap, dive, down, aim, hurt], 9, 7, 14, 7);
}
// Goat rider — a hill goblin on a shaggy crag goat. 16×13. Frames: run1, run2, buck (goat rearing), riderless goat run.
export function bakeGoatRider() {
  const rider = ['.......gggggg...', '......fggeoggf..', '......ffggggff..', '.....ffvvvvvff..', '......ffvvvvff..'];
  const goatBody = ['ff...ffffffff.ff', '.fffffffffffffff', 'ffFffffffffffe.f', 'fFF..ffffffff.zz'];
  const run1 = cspr([...rider, ...goatBody, '.zz.zz....zz.zz.', '.z...z....z...z.']);
  const run2 = cspr([...rider, ...goatBody, '..zz.zz..zz.zz..', '..z...z..z...z..']);
  const buck = cspr(['.......gggggg...', '......fggeoggf..', '......ffggggff..', '.....ffvvvvvff..', '......ffvvvvff..', '..........ffffff', '.....fffffffffef', 'ffFfffffffffff.z', 'fFFffffff.......', '.zz.zz..zz......', '.z...z..z.......']);
  const goat1 = cspr(['................', '................', '................', '................', '................', ...goatBody, '.zz.zz....zz.zz.', '.z...z....z...z.']);
  const goat2 = cspr(['................', '................', '................', '................', '................', ...goatBody, '..zz.zz..zz.zz..', '..z...z..z...z..']);
  return pack([run1, run2, buck, goat1, goat2], 9, 12, 14, 11);
}
// The Ram Lord — a bighorn the size of a cart, curled horns like millstones. 30×20. Frames: stand, run1, run2, lower (charge tell), crash (head in the wall), rear.
export function bakeRamLord() {
  const RP = Object.assign({}, CP, { f: '#d8d0c0', F: '#a8a090', m: '#c9a83a', M: '#8a6a1a', r: '#c9463d' });
  const r = rows => outline(fromGrid(rows, RP, 1), OUT);
  const horns = ['......mmm..............mmm....', '.....mMMmm............mmMMm...', '....mM..mmm..........mmm..Mm..', '....mM.mmmm..........mmmm.Mm..', '.....mmmmff..........ffmmmm...'];
  const head = ['.......fffffffffffffffff......', '......ffffffffffffffffffe.....', '......fFfffffffffffffffff.....', '.......ffffffffffffffff.......'];
  const bodyStand = ['.....fffffffffffffffffff......', '....ffffffffffffffffffff......', '....ffFFffffffffffFFffff......', '....ffFFffffffffffFFffff......', '....zz.zz........zz.zz........', '....zz.zz........zz.zz........'];
  const bodyRun1 = ['.....fffffffffffffffffff......', '....ffffffffffffffffffff......', '....ffFFffffffffffFFffff......', '...ffFFfffffffffffffFFff......', '..zz...zz......zz...zz........', '.zz.....zz....zz.....zz.......'];
  const bodyRun2 = ['.....fffffffffffffffffff......', '....ffffffffffffffffffff......', '....ffFFffffffffffFFffff......', '....ffFFffffffffffFFffff......', '.....zzzz........zzzz.........', '......zz..........zz..........'];
  const stand = r([...horns, ...head, ...bodyStand]);
  const run1 = r([...horns, ...head, ...bodyRun1]);
  const run2 = r([...horns, ...head, ...bodyRun2]);
  const lowerHorns = ['..............................', '......mmm..............mmm....', '.....mMMmm............mmMMm...', '....mM..mmm..........mmm..Mm..', '....mM.mmmm..........mmmm.Mm..'];
  const lowerHead = ['.....mmmmfffffffffffffffmmmm..', '......fffffffffffffffffffffe..', '......fFfffffffffffffffffff...', '.......ffffffffffffffffff.....'];
  const lower = r([...lowerHorns, ...lowerHead, ...bodyStand]);
  const crashHead = ['....rmmmmfffffffffffffffmmmm..', '...r..fffffffffffffffffffffe..', '....r.fFfffffffffffffffffff...', '.......ffffffffffffffffff.....'];
  const crash = r([...lowerHorns, ...crashHead, ...bodyStand]);
  const rearHorns = ['......mmm..............mmm....', '.....mMMmm............mmMMm...', '....mM..mmm..........mmm..Mm..', '....mM.mmmm..........mmmm.Mm..', '.....mmmmff..........ffmmmm...'];
  const rearBody = ['.......fffffffffffffffff......', '......ffffffffffffffffffe.....', '......fFfffffffffffffffff.....', '......ffffffffffffffffff......', '.....ffffffffffffffffff.......', '....ffffffffffffffff..........', '....ffFFffffffffffff..........', '....ffFFffffffffff............', '....zz.zz.....zz.zz...........', '....zz.zz.....zz.zz...........'];
  const rear = r([...rearHorns, ...rearBody]);
  const bodyLeap = bodyStand.map((row, i) => i === 4 ? '.....zzzz........zzzz.........' : i === 5 ? '......zz..........zz..........' : row);
  const leap = r([...lowerHorns, ...lowerHead, ...bodyLeap]);
  return pack([stand, run1, run2, lower, crash, rear, leap], 16, 16, 26, 14);
}
// The shepherd — an old hill woman with a crook and a plaid. 10×16. Frames: idle, wave.
export function bakeShepherd() {
  const SP = Object.assign({}, CP, { p: '#7a4a5a', P: '#4a2a3a', t: '#e8dcc0', w: '#8a5a32' });
  const s = rows => outline(fromGrid(rows, SP, 1), OUT);
  const idle = s(['...ffff...', '..fFFFFf..', '..fteetf..', '..ftttf.w.', '...tttt.w.', '..ppPppww.', '.ppppppp.w', '.pPppppP.w', '..pppppp.w', '..PppppP.w', '...pppp..w', '..zz..zz..']);
  const wave = s(['...ffff.f.', '..fFFFFff.', '..fteetff.', '..ftttfw..', '...tttt.w.', '..ppPppww.', '.ppppppp.w', '.pPppppP.w', '..pppppp.w', '..PppppP.w', '...pppp..w', '..zz..zz..']);
  return pack([idle, wave], 6, 13, 8, 12);
}
// Sheep — 12×8, woolly. Frames: graze, look up, walk.
export function bakeSheep() {
  const s = rows => outline(fromGrid(rows, CP, 1), OUT);
  const graze = s(['..ffffffff..', '.ffffffffff.', '.ffffffffffz', '..ffffffff.z', '..z..z.z..ze', '..z..z.z..z.']);
  const look = s(['..ffffffffzz', '.fffffffffze', '.ffffffffffz', '..ffffffff..', '..z..z.z..z.', '..z..z.z..z.']);
  const walk = s(['..ffffffff..', '.ffffffffff.', '.ffffffffffz', '..ffffffff.z', '.z..z...z.ze', '.z..z...z.z.']);
  return pack([graze, look, walk], 7, 7, 10, 6);
}

export function bakeKeeperOld() {
  const KP = Object.assign({}, EP, { b: '#3a3448', B: '#1b1626', f: '#e8e0d0', a: '#c9b27c', A: '#8a5a32' });
  const k = rows => outline(fromGrid(rows, KP, 1), OUT);
  const head = ['...bbbbbb...', '..bfbbbbfb..', '..bfbeebfb..', '..bbffffbb..', '...bbBBbb...'];
  const talk = ['...bbbbbb...', '..bfbbbbfb..', '..bfbeebfb..', '..bbffffbb..', '...bBBBBb...'];
  const body = ['..aaaaaaaa..', '.aaAaaaaAaa.', '.aaaaaaaaaa.', '..aaaaaaaa..', '..bb....bb..'];
  return pack([k([...head, ...body]), k([...talk, ...body])], 7, 11, 10, 10);
}


// ---------- Talking folk of the lower woods ----------
const FP = Object.assign({}, EP, { c: '#3f6e2c', C: '#2a4a1c', k: '#f1c9a0', h: '#8a5a32', a: '#c9d1dc', A: '#7c8797', v: '#7a4a2a', V: '#4c2c17', q: '#5a4a3a', z: '#3a2214', d: '#3d5aa8', D: '#243a78', u: '#c9a83a', i: '#e8e0d0', I: '#7fe0e8', j: '#4aa0b0', O: '#fff6c8', x: '#5a6a9a', X: '#3a4a7a' });
const fspr = rows => outline(fromGrid(rows, FP, 1), OUT);
// The woodsman — broad, bearded, green cap, an axe over his shoulder. 12×14. Frames: idle, talk (the axe comes up).
export function bakeWoodsman() {
  const head = ['....cccc....', '...cCCCCc...', '..kkkkkkkk..', '..kokkkkok..'];
  const idle = fspr([...head, '..kkkkkkkk..', '..hhhhhhhh..', '...hhhhhh...', '..vvvvvvvv.a', '.vVvvvvvvVaA', '.vvvvvvvvv.q', '.vVvvvvvvV.q', '..vvvvvvvv.q', '..zz..zz....', '..zz..zz....']);
  const talk = fspr([...head, '..kkkkkkkk.a', '..hhhhhhhhaA', '...hhhhhh..q', '..vvvvvvvv.q', '.vVvvvvvvV.q', '.vvvvvvvvv..', '.vVvvvvvvV..', '..vvvvvvvv..', '..zz..zz....', '..zz..zz....']);
  return pack([idle, talk], 7, 15, 10, 14);
}
// The ferryman — a stooped man in a grey-blue hood with a pole. 12×13. Frames: idle, talk.
export function bakeFerryman() {
  const idle = fspr(['...xxxx...q.', '..xxxxxx..q.', '..xkkkkx..q.', '..xkokokx.q.', '..xxkkkxx.q.', '.xxxxxxxxqq.', '.xXxxxxxxXq.', '.xxxxxxxxxq.', '.xXxxxxxXxq.', '.xxxxxxxxx..', '.xXxxxxxXx..', '..xxxxxxxx..', '..zz...zz...']);
  const talk = fspr(['...xxxx..q..', '..xxxxxx.q..', '..xkkkkx.q..', '..xkokokxq..', '..xxkkkxxq..', '.xxxxxxxkq..', '.xXxxxxxxXq.', '.xxxxxxxxxq.', '.xXxxxxxXxq.', '.xxxxxxxxx..', '.xXxxxxxXx..', '..xxxxxxxx..', '..zz...zz...']);
  return pack([idle, talk], 7, 14, 10, 13);
}
// The squire — a fair-haired youth in the realm's blue tabard, no helm. 12×13. Frames: idle, wave.
export function bakeSquire() {
  const head = ['...uuuuuu...', '..uuuuuuuu..', '..ukkkkkku..', '..ukokkoku..', '...kkkkkk...', '....kkkk....'];
  const idle = fspr([...head, '...dddddd...', '..dDdyydDd..', '..dddyyddd..', '..dDddddDd..', '...dddddd...', '...zz..zz...', '...zz..zz...']);
  const wave = fspr([...head, '...dddddd.k.', '..dDdyydDdk.', '..dddyydddd.', '..dDddddDd..', '...dddddd...', '...zz..zz...', '...zz..zz...']);
  return pack([idle, wave], 7, 14, 10, 13);
}
// The elder — an old myconid, a wide clean cap over a pale face with a beard of mycelium. 12×13. Frames: idle, nod.
export function bakeElder() {
  const body = ['...tttttt...', '...tottot...', '...tttttt...', '..i.tttt.i..', '..i.tttt.i..', '....tttt....', '....tt.tt...', '....tt.tt...'];
  const idle = fspr(['...jjjjjj...', '..jIIIIIIj..', '.jIIOIIIOIj.', '.jIIIIIIIIj.', '.jjjjjjjjjj.', ...body]);
  const nod = fspr(['............', '..jjjjjjjj..', '.jIIOIIIOIj.', '.jIIIIIIIIj.', '.jjjjjjjjjj.', ...body]);
  return pack([idle, nod], 7, 14, 10, 13);
}

// Crag ram — a wild shaggy ram, horns curled tight, no rider. 16×9. Frames: run1, run2, rear, run1, run2 (the last two stand in for the old riderless goat).
export function bakeCragRam() {
  // THE HORN IS THE ANIMAL. It had three gold pixels for one and a fleece with no shape in it, so it read
  // as a sheep going sideways. A crag ram is a heavy curl of horn over a dark face, a barrel of fleece
  // with the light on top of it and the shadow slung under, a beard, and four black legs. 18x12.
  const RP = Object.assign({}, CP, { f: '#d8d0c0', F: '#a8a090', G: '#7e786c', m: '#c9a83a', M: '#8a6a1a', n: '#8a7f70', z: '#3a2e22', o: '#1b1626' });
  /* EVERY FRAME THIRTEEN ROWS: the rear is a row taller than the walk, and on one anchor a taller frame stands lower, so it bucked
     a row deeper into the scree than it walked. The short frames get an empty row on top, and the anchor is the hooves' row. */
  const r = rows => outline(fromGrid(rows.length < 13 ? ['..................', ...rows] : rows, RP, 1), OUT);
  const head = [
    '.............mmM..',
    '............mMmMm.',
    '............mM.Mm.',
    '.....fffff..mMMm..',
    '...fffffffffnnnn..',
    '..ffffffffffnnonn.',
    '..fFffffffffFnnn..',
    '..FFfffffffff.n...',
    '...GFFFFFFFFG.....'];
  const run1 = r([...head, '..zz.zz....zz.zz..', '..z...z....z...z..', '..o...o....o...o..']);
  const run2 = r([...head, '...zz.zz..zz.zz...', '...z...z..z...z...', '...o...o..o...o...']);
  const rear = r([
    '..........mmM.....',
    '.........mMmMm....',
    '.........mM.Mm....',
    '..........mMMm....',
    '.........fnnnn....',
    '........ffnnonn...',
    '.......fffFnnn....',
    '.....ffffffff.....',
    '...ffFffffff......',
    '..FFffffffzz......',
    '..GFFFFFFz.z......',
    '..zz.zz...........',
    '..z...z...........']);
  /* hurt: the head thrown back and the eye shut, the legs splayed as it takes the blow */
  const hurt = r([...head.map((row, i) => (i === 5 ? '..ffffffffffnnnnn.' : row).slice(1) + '.'), '.zz...z....z...zz.', 'z.....z....z.....z', 'o.....o....o.....o']);
  return pack([run1, run2, rear, run1, run2, hurt], 9, 14, 14, 9);
}

// Hill troll — a hulking mossy brute, taller than a door, that hurls boulders. 18×17. Frames: stand, walk1, walk2, throw (rock up), swat.
export function bakeTroll() {
  const TP = Object.assign({}, CP, { t: '#6a7a5a', T: '#46543a', m: '#3f6e2c', s: '#8a919c', S: '#5a6270', o: OUT });
  const tr = rows => outline(fromGrid(rows, TP, 1), OUT);
  const head = ['.....tttttttt.....', '....ttttttttttt...', '....ttoottotttt...', '....tttttttttt....', '.....ttTTTTtt.....'];
  const body = ['..mmmtttttttttmmm.', '.mttttttttttttttm.', '.tttTttttttttTttt.', '.tttTttttttttTttt.', '.tttTttttttttTttt.', '.TTTTtttttttttTTT.', '....tttttttttt....', '....ttttttttttt...'];
  const pad = (rows, n) => Array(n).fill('.'.repeat(18)).concat(rows);
  const stand = tr(pad([...head, ...body, '.....TTT..TTT.....', '.....TTT..TTT.....', '.....TTT..TTT.....', '....TTTT..TTTT....'], 2));
  const walk1 = tr(pad([...head, ...body, '....TTT....TTT....', '...TTT......TTT...', '...TTT......TTT...', '..TTTT......TTTT..'], 2));
  const walk2 = tr(pad([...head, ...body, '......TTTTTT......', '......TTT.TTT.....', '.....TTT...TTT....', '....TTTT...TTTT...'], 2));
  const throwF = tr(['..............sss.', '.............sSSs.', '.....tttttttt.sss.', '....ttttttttttttt.', '....ttoottotttTtt.', '....ttttttttttTtt.', '.....ttTTTTtt.Ttt.', '..mmmttttttttttmm.', '.mtttttttttttttt..', '.tttTttttttttttt..', '.tttTtttttttttt...', '.tttTttttttttt....', '.TTTTttttttttt....', '....tttttttttt....', '....ttttttttttt...', '.....TTT..TTT.....', '.....TTT..TTT.....', '.....TTT..TTT.....', '....TTTT..TTTT....']);
  const swat = tr(pad([...head, '..mmmtttttttttmmm.', '.mttttttttttttttm.', '.tttTtttttttttttTT', '.tttTttttttttttTTT', '.tttTtttttttttt...', '.TTTTttttttttt....', '....tttttttttt....', '....ttttttttttt...', '.....TTT..TTT.....', '.....TTT..TTT.....', '.....TTT..TTT.....', '....TTTT..TTTT....'], 2));
  return pack([stand, walk1, walk2, throwF, swat], 10, 20, 16, 18);
}


// ---------- The Great Hound, the Hanging Village's beasts, and the Owl Reeve ----------
const HP2 = Object.assign({}, EP, { h: '#5a4a3a', H: '#3a2e22', l: '#8a7a68', r: '#ff4a3a', t: '#e8dcc0', z: '#2a2018' });
const hspr = rows => outline(fromGrid(rows, HP2, 1), OUT);
// The Great Hound — a beast the length of a cart, low and fast. 32×12. Frames: stand, run1, run2, crouch (tell), pounce, howl, stunned.
export function bakeGreatHound() {
  const head = ['.........................hh.....', '........................hHhh....'];
  const body = ['....hhhhhhhhhhhhhhhhhhhhhhhhhh..', '...hhhhhhhhhhhhhhhhhhhhhhhhhhhh.', '..hhhlhhhhhhhhhhhhhhhhhhhhhrhhht', '..hhhhhhhhhhhhhhhhhhhhhhhhhhhhtt', '.hHhhhhhhhhhhhhhhhhhhhhhhhhhhhh.', '.hHhhhhhhhhhhhhhhhhhhhhhhhhhh...', '..hhhhhhhhhhhhhhhhhhhhhhhhhh....'];
  const legsA = ['...HHHH...HHHH.......HHHH.HHHH..', '...HHH.....HHH.......HHH...HHH..', '...HHH.....HHH.......HHH...HHH..'];
  const legsB = ['..HHHH.....HHHH....HHHH....HHHH.', '.HHH.........HHH..HHH........HHH', 'HHH...........HHHHH...........HH'];
  const legsC = ['......HHHHHHH.......HHHHHHH.....', '.......HHHHH.........HHHHH......', '........HHH...........HHH.......'];
  const stand = hspr([...head, ...body, ...legsA]);
  const run1 = hspr([...head, ...body, ...legsB]);
  const run2 = hspr([...head, ...body, ...legsC]);
  const crouch = hspr(['................................', '................................', '.........................hh.....', '........................hHhh....', '....hhhhhhhhhhhhhhhhhhhhhhhhhh..', '...hhhhhhhhhhhhhhhhhhhhhhhhhhhh.', '..hhhlhhhhhhhhhhhhhhhhhhhhhrhhht', '..hhhhhhhhhhhhhhhhhhhhhhhhhhhhtt', '.hHhhhhhhhhhhhhhhhhhhhhhhhhhhhh.', 'HHHHHHHH...HHHHH.....HHHHH...HHH', 'HH....HH.....HH.......HH......HH', '................................']);
  const pounce = hspr(['..................hh............', '.................hHhh...........', '....hhhhhhhhhhhhhhhhhhhhhh......', '...hhhhhhhhhhhhhhhhhhhhhhhhh....', '..hhhlhhhhhhhhhhhhhhhhhhhhhrhht.', '..hhhhhhhhhhhhhhhhhhhhhhhhhhhhtt', '.hHhhhhhhhhhhhhhhhhhhhhhhhhhhh..', 'HHHhhhhhhhhhhhhhhhhhhhhhhhHHH...', 'HH..hhhhhhhhhhhhhhhhhhhhhh..HHH.', '.......................HHH...HH.', '......................HH........', '................................']);
  const howl = hspr(['.........................hhh....', '........................hhhht...', '.......................hhhhh....', '....hhhhhhhhhhhhhhhhhhhhHrhh....', '...hhhhhhhhhhhhhhhhhhhhhhhh.....', '..hhhlhhhhhhhhhhhhhhhhhhhh......', '..hhhhhhhhhhhhhhhhhhhhhhh.......', '.hHhhhhhhhhhhhhhhhhhhhhh........', '..hhhhhhhhhhhhhhhhhhhh..........', '...HHHH...HHHH....HHHH.HHHH.....', '...HHH.....HHH....HHH...HHH.....', '...HHH.....HHH....HHH...HHH.....']);
  const stun = hspr(['................................', '................................', '...........HH.HH....HH.HH.......', '.........HHHHHHHHHHHHHHHHH......', '....hhhhhhhhhhhhhhhhhhhhhhhhhh..', '...hhhhhhhhhhhhhhhhhhhhhhhhhhhh.', '..hhhhhhhhhhhhhhhhhhhhhhhhhhhhh.', '..hhhlhhhhhhhhhhhhhhhhhhhhhhrht.', '.hHhhhhhhhhhhhhhhhhhhhhhhhhhhhtt', '..hhhhhhhhhhhhhhhhhhhhhhhhhhhh..', '................................', '................................']);
  return pack([stand, run1, run2, crouch, pounce, howl, stun], 17, 12, 26, 12);
}
// Bough spider — hangs on a thread, drops on you. 12×8. Frames: hang, drop (legs wide).
export function bakeSpider() {
  const SP2 = Object.assign({}, EP, { b: '#3a3448', B: '#1b1626', r: '#ff4a3a', l: '#5a5468' });
  const s = rows => outline(fromGrid(rows, SP2, 1), OUT);
  const hang = s(['.....bb.....', '..l.bbbb.l..', '.l.bbbbbb.l.', 'l.bbrbbrbb.l', '.lbbbbbbbbl.', 'l..bbbbbb..l', '.l..bbbb..l.', 'l...l..l...l']);
  const drop = s(['l....bb....l', '.l..bbbb..l.', '..lbbbbbbl..', 'lllbbrbbrlll', '...bbbbbb...', '..l.bbbb.l..', '.l..l..l..l.', 'l..........l']);
  const hang2 = s(['.....bb.....', '.l..bbbb..l.', '..lbbbbbbl..', '.lbbrbbrbbl.', 'l.bbbbbbbb.l', '.l.bbbbbb.l.', 'l...bbbb...l', '.l..l..l..l.']);
  const climb1 = s(['l....bb....l', '.l..bbbb..l.', '..lbbbbbbl..', '..bbrbbrbb..', '.lbbbbbbbbl.', 'l..bbbbbb..l', '....bbbb....', '...l....l...']);
  const climb2 = s(['.l...bb...l.', 'l...bbbb...l', '.l.bbbbbb.l.', '..bbrbbrbb..', '..lbbbbbbl..', '.l.bbbbbb.l.', 'l...bbbb...l', '....l..l....']);
  /* hurt: legs curled in under it and the red eyes gone dark */
  const hurt = s(['.....bb.....', '....bbbb....', '..lbbbbbbl..', '.lbbBbbBbbl.', '..bbbbbbbb..', '.l.bbbbbb.l.', '..l.bbbb.l..', '...l....l...']);
  return pack([hang, drop, hang2, climb1, climb2, hurt], 7, 9, 10, 8);
}
// Squirrel knight — a red squirrel in a blue tabard, sword on its back, a plume of a tail. 12×11. Frames: run1, run2, leap.
export function bakeSquirrel() {
  const QP = Object.assign({}, EP, { q: '#c9463d', Q: '#8f2f28', d: '#3d5aa8', D: '#243a78', y: '#e0b040', s: '#c9d1dc', o: OUT });
  const q = rows => outline(fromGrid(rows, QP, 1), OUT);
  const run1 = q(['qq.......q..', 'qq......qqq.', '.qq....qqoq.', '..qqq..qqqq.', '...qqddddq..', '..QqqdydDq..', '..Q.qdddd...', '.Q..qqqq....', '....q..q....', '...qq..qq...', '............']);
  const run2 = q(['.qq......q..', 'qq......qqq.', 'qq.....qqoq.', '.qqqq..qqqq.', '...qqddddq..', '..QqqdydDq..', '..Q.qdddd...', '.Q..qqqq....', '.....qq.....', '....qqqq....', '............']);
  const leap = q(['............', 'qqq......q..', '.qqq....qqq.', '..qqqq.qqoq.', '....qqqqqqq.', '....qqddddqq', '...QqqdydDq.', '..Q.qdddd.q.', '.Q..qqqq..q.', '...qq..qq...', '............']);
  return pack([run1, run2, leap], 7, 12, 10, 10);
}
// The Owl Reeve — a great horned owl, wings like sails. 32×20. Frames: perch, wings up, wings down, screech (grounded, beak open), crash (on its back),
// glide, dive, land, and the round-two set: mantle (the skim's tell), skim, pinned (under the dead bough), stuck (talons in the boards), plunge.
export function bakeOwl() {
  // HER OFFICE OUTLASTS THE CLOTH: a tarnished chain over a torn tabard, pale eyes inside dark sails.
  const frames=[];
  for(let f=0;f<20;f++) {   /* (claude/hangpolish) 17-18 the SAW (she is at a rope: head down, the strand in her beak, the sails half open for balance; two frames, the head working left and right), 19 the FALL WITH HER PERCH (the sails thrown up, the talons clutching, the beak wide) */   /* (claude/owl3art) 13 the WING BEAT's windup (the sails hoisted up and back, the body crouched under them), 14 its release (the sails driven down, the tips trailing up, the air torn off them), 15 the PELLET cough (hunched, the throat full), 16 the pellet out (beak wide, the pellet in it) - each its own body (B16) */
    const [c,g]=canvas(116,66), down=[4,10,15].includes(f), spread=![0,11,15,16].includes(f), lift=[1,7,8,12].includes(f)?-18:(f===17||f===18)?-5:f===19?-20:0, saw=f===17||f===18;
    const poly=(p,col)=>{g.fillStyle=col;g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
    /* THE SAILS, for the two beat poses: an arm from the shoulder to the wrist, then the primaries fanned from the wrist (angle in degrees, 0 out, -90 up, +90 down; length; width) and the secondaries hung off the arm */
    const sail=(side,S,W,prim,sec)=>{const X=n=>58+side*n;
      const tips=prim.map(([ang,len])=>[W[0]+Math.cos(ang*Math.PI/180)*len,W[1]+Math.sin(ang*Math.PI/180)*len]);poly([[X(S[0]),S[1]-4],[X(W[0]),W[1]-3],...tips.map(([x,y])=>[X(x),y]),[X(S[0]+2),S[1]+13]],'#2a2634');   /* the sail's mass first, the feathers over it */
      g.strokeStyle='#302c3c';g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(X(S[0]),S[1]);g.lineTo(X(W[0]),W[1]);g.stroke();
      sec.forEach(([t,ang,len,wd],i)=>{const a=ang*Math.PI/180,bx=S[0]+(W[0]-S[0])*t,by=S[1]+(W[1]-S[1])*t,tx=bx+Math.cos(a)*len,ty=by+Math.sin(a)*len,nx=-Math.sin(a),ny=Math.cos(a);
        poly([[X(bx+nx*wd/2),by+ny*wd/2],[X(tx+nx*wd*.2),ty+ny*wd*.2],[X(tx-nx*wd*.2),ty-ny*wd*.2],[X(bx-nx*wd/2),by-ny*wd/2]],i%2?'#4a4152':'#3a3342');});
      prim.forEach(([ang,len,wd],i)=>{const a=ang*Math.PI/180,tx=W[0]+Math.cos(a)*len,ty=W[1]+Math.sin(a)*len,nx=-Math.sin(a),ny=Math.cos(a);
        poly([[X(W[0]+nx*wd/2),W[1]+ny*wd/2],[X(tx+nx*wd*.22),ty+ny*wd*.22],[X(tx+Math.cos(a)*2),ty+Math.sin(a)*2],[X(tx-nx*wd*.22),ty-ny*wd*.22],[X(W[0]-nx*wd/2),W[1]-ny*wd/2]],i%2?'#665a6c':'#4a4152');
        g.strokeStyle='#8a7a86';g.lineWidth=1;g.beginPath();g.moveTo(X(W[0]),W[1]);g.lineTo(X(W[0]+(tx-W[0])*.8),W[1]+(ty-W[1])*.8);g.stroke();});
      g.fillStyle='#8a7a86';g.fillRect(Math.round(X(W[0]))-1,W[1]-1,3,3);};   /* the wrist's pale knuckle */
    if(f===13||f===14) for(const side of [-1,1]) {
      if(f===13) sail(side,[9,36],[28,28],[[-14,26,12],[-34,27,12],[-54,26,12],[-74,26,12],[-94,25,11],[-114,22,10]],[[.25,-40,16,10],[.5,-8,18,10],[.75,20,17,10]]);
      else sail(side,[9,30],[30,38],[[96,24,12],[78,25,12],[58,25,12],[38,25,12],[18,24,11],[0,23,10]],[[.3,-95,14,9],[.55,-75,15,9],[.8,-52,14,9]]);
    } else for(const side of [-1,1]) {
      const X=n=>58+side*n;
      poly([[X(8),28],[X(spread?50:22),14+lift],[X(spread?55:25),27+lift],[X(spread?42:21),44],[X(15),51]],'#302c3c');
      for(let k=0;k<7;k++){const x=14+k*(spread?5:1.4),y=29+k*.9+lift*(k/7);poly([[X(x),y],[X(x+8),y-5],[X(x+3),y+15],[X(x-2),y+10]],k%2?'#554b5d':'#403747');g.fillStyle='#81717c';g.fillRect(Math.round(X(x)),Math.round(y+5),side*5,2);}
      if(f===16||f===15){ /* the wings are drawn round the cough: the shoulders ride up and the tips come out under the hunch */
        poly([[X(10),24],[X(26),27+(f===15?2:0)],[X(24),38],[X(12),36]],'#403747');g.fillStyle='#81717c';g.fillRect(Math.round(X(13)),30,side*7,2); }
    }
    poly([[43,23],[71,23],[78,44],[69,57],[46,57],[38,44]],'#4a3d4e');
    poly([[46,39],[69,39],[70,56],[64,53],[60,59],[55,54],[47,57]],'#374b54');
    if(f===13){ /* crouched under the sails: the chest drawn in */ g.fillStyle='#3a3040';g.fillRect(44,30,3,22);g.fillRect(70,30,3,22); }
    const hdy=f===13?3:f===14?-2:f===15?7:f===16?5:saw?7:f===19?-3:0, hdx=f===17?-3:f===18?3:0;
    g.save();g.translate(hdx,hdy);
    poly([[42,20],[41,4],[51,13],[64,13],[75,4],[73,24]],'#302c3c');
    if(f===13) { /* the tufts flattened back by the effort */ poly([[42,20],[39,9],[51,14],[64,14],[77,9],[73,24]],'#302c3c'); }
    poly([[43,18],[51,14],[58,19],[66,14],[74,19],[71,31],[63,36],[57,33],[49,35],[42,27]],'#d9ceb2');
    for(const x of [48,63]){g.fillStyle='#5a4d4e';g.fillRect(x-2,20,10,8);g.fillStyle='#edb24e';
      if(f===13||saw){g.fillRect(x,23,6,3);g.fillStyle='#241d28';g.fillRect(x+2,23,2,3);g.fillStyle='#5a4d4e';g.fillRect(x-2,20,10,3);}   /* narrowed, brows down: she sets herself */
      else if(f===14||f===19){g.fillRect(x-1,20,8,8);g.fillStyle='#241d28';g.fillRect(x+1,22,4,5);g.fillStyle='#fff2c8';g.fillRect(x,21,2,2);}   /* eyes huge and round: the beat is thrown */
      else if(f===15){g.fillRect(x,24,6,1);g.fillStyle='#241d28';g.fillRect(x+1,25,4,1);}   /* screwed shut */
      else if(f===16){g.fillRect(x-1,21,8,6);g.fillStyle='#241d28';g.fillRect(x+3,21,2,6);g.fillStyle='#fff2c8';g.fillRect(x,21,1,1);}   /* strained wide, the pupils pulled to a slit */
      else {g.fillRect(x,down?24:21,6,down?1:5);if(!down){g.fillStyle='#241d28';g.fillRect(x+2,21,2,5);}}}
    if(f===16){ /* THE PELLET OUT: the upper beak thrown up, the lower dropped, the mouth dark and the pellet held in it */
      poly([[53,28],[63,28],[61,33],[56,33]],'#b49a5e');g.fillStyle='#d6bc78';g.fillRect(55,29,5,1);
      g.fillStyle='#34202b';g.fillRect(54,33,9,8);g.fillStyle='#6a2c38';g.fillRect(56,38,5,2);
      poly([[54,41],[63,41],[61,46],[56,46]],'#9a8450');g.fillStyle='#c4aa68';g.fillRect(56,42,4,1);
      g.fillStyle='#e8e0cc';g.beginPath();g.ellipse(58.5,37,4,2.6,0,0,7);g.fill();g.fillStyle='#a8997a';g.fillRect(55,37,3,1);g.fillRect(59,38,3,1);g.fillStyle='#fffbea';g.fillRect(57,35,2,1);g.fillRect(61,36,1,1);   /* the fur, the bone */
      g.fillStyle='#bcd2d8';g.fillRect(58,46,1,3);g.fillRect(60,47,1,2); }   /* spit */
    else if(f===15){ poly([[55,31],[62,30],[61,36],[56,35]],'#b49a5e');g.fillStyle='#34202b';g.fillRect(56,35,5,2);   /* the beak just cracked */ }
    else if(saw){ /* THE SAW: the beak bared and set on the strand, the mouth dark, the strand pale between the halves */ poly([[55,29],[62,28],[61,34],[56,33]],'#b49a5e');g.fillStyle='#34202b';g.fillRect(55,34,7,3);g.fillStyle='#b49a5e';g.fillRect(56,37,5,2);g.fillStyle='#f4e8c0';g.fillRect(55,34,7,1);g.fillRect(58,36,3,1); }
    else if(f===19){ /* THE FALL: the beak wide open, a cry */ poly([[54,27],[63,26],[61,32],[56,31]],'#b49a5e');g.fillStyle='#34202b';g.fillRect(55,32,7,6);g.fillStyle='#6a2c38';g.fillRect(57,36,3,2);poly([[54,38],[63,38],[61,43],[56,43]],'#9a8450'); }
    else poly([[55,28],[62,27],[60,35],[56,33]],'#b49a5e');
    g.restore();
    if(saw){ /* THE STRAND: a hemp line pulled taut from her beak, one cut end frayed, loose fibres flying (the rope she is cutting; B16: this is the cutting pose, not the cast frame) */
      const dir=f===17?-1:1, bx=58+hdx, by=hdy+37;
      for(let k=0;k<16;k++){const px=bx+dir*k*1.1,py=by+k*0.7;g.fillStyle='#2a1c0c';g.fillRect(Math.round(px)-1,Math.round(py),3,3);}
      for(let k=0;k<16;k++){const px=bx+dir*k*1.1,py=by+k*0.7;g.fillStyle=k%2?'#e0c68a':'#9a7e48';g.fillRect(Math.round(px),Math.round(py)+(k%2),2,1);}
      const ex=Math.round(bx+dir*17),ey=Math.round(by+11.5);g.fillStyle='#f4e8c0';g.fillRect(ex,ey,2,2);for(const [ox,oy,c] of [[dir*2,2,'#e0c68a'],[dir*3,1,'#9a7e48'],[dir*4,3,'#e0c68a'],[dir*2,4,'#9a7e48']]){g.fillStyle=c;g.fillRect(ex+ox,ey+oy,1,1);}
      g.fillStyle='#fff2c8';g.fillRect(bx-dir*5,by-2,1,1);g.fillRect(bx-dir*8,by+3,1,1);   /* the fibres thrown back */
      g.strokeStyle='#8a7a86';g.lineWidth=1;g.beginPath();g.moveTo(bx-dir*10+.5,by-5.5);g.lineTo(bx-dir*15+.5,by-8.5);g.stroke(); }   /* (a shiver line off the head: the work) */
    if(f===19){ /* the feathers torn off by the fall */ for(const [fx,fy] of [[24,26],[92,24],[30,10],[88,8],[18,42],[98,44]]){poly([[fx,fy],[fx+4,fy-3],[fx+2,fy+4]],'#665a6c');g.fillStyle='#8a7a86';g.fillRect(fx+1,fy,2,1);} }
    if(f===14){ /* the thrown beat: pale wind-lines torn off the wing tips */ g.strokeStyle='#c9d1dc';g.lineWidth=1;for(const side of [-1,1]){const X=n=>58+side*n;for(let k=0;k<3;k++){g.globalAlpha=.7-k*.18;g.beginPath();g.moveTo(X(30+k*7),38+k*6);g.quadraticCurveTo(X(46+k*5),32+k*8,X(52+k*4),22+k*9);g.stroke();}}g.globalAlpha=1; }
    for(let k=0;k<9;k++){g.fillStyle=k%2?'#b59a55':'#756448';g.fillRect(46+k*3,35+Math.round(Math.sin(k/8*Math.PI)*7),2,3);}g.fillStyle='#bea15c';g.fillRect(56,42,5,5);
    for(const x of [47,64]){g.fillStyle='#b79a60';g.fillRect(x,53,3,7);for(let k=0;k<3;k++){g.fillRect(x-3+k*3,59,2,3);g.fillStyle='#e4cf99';g.fillRect(x-3+k*3,61,2,2);g.fillStyle='#b79a60';}}
    if(f===10){g.fillStyle='#513b30';g.fillRect(22,42,72,7);g.fillStyle='#83613c';g.fillRect(25,43,65,2);}
    if(f===3){g.fillStyle='#34202b';g.fillRect(56,32,5,5);}
    if(f===15){ /* THE THROAT FULL: a lump under the beak the width of her neck, the ruff stood up round it, the gag lines at the beak */
      g.fillStyle='#4a3d4e';g.beginPath();g.ellipse(58.5,47,8,5.5,0,0,7);g.fill();g.fillStyle='#cfc3a6';g.beginPath();g.ellipse(58.5,47,5.5,3.6,0,0,7);g.fill();g.fillStyle='#a8997a';g.fillRect(55,48,7,1);g.fillRect(57,45,3,1);g.fillStyle='#fffbea';g.fillRect(56,46,2,1);
      g.fillStyle='#bcd2d8';g.fillRect(52,38,1,3);g.fillRect(65,39,1,2); }
    frames.push(outline(c,OUT));
  }
return pack(frames,58,63,44,26);
}

// ---------- The Pyromancer. Not the knight in a hood any more: her own body, drawn from scratch. ----------
// A tall cowl that droops back with two embers for eyes in the dark of it, a capelet, a robe to the
// ankles that flares and trails and bells out when she drops, a rope belt, and a staff taller than she
// is with a caged flame at the head. Same canvas and anchor as the knight, so nothing else changes.
// Palette keys (the skins recolour these): s/S robe, b/B capelet + the dark of the hood, r the glow
// (eyes, hem, the flame), y brass, w/W the staff, k hands.
const PYRO_PAL = { s: '#b8462e', S: '#6a1e1e', b: '#3a2a4a', B: '#241a30', r: '#ffb040', k: '#f1c9a0', w: '#5a3a24', W: '#3a2214', y: '#ffd36b', v: '#f1c9a0', o: OUT };
// three cowls: 0 at rest, 1 streaming back (running), 2 blown up (falling, hurt). 11 wide, drawn so the
// face opening is at the front (right); '.' is empty.
const COWL = [
  ['....SS.....', '...Sss.....', '..Ssssss...', '.Sssssss...', '.SssbBBBs..', 'SssbBrBrs..', '.SsbBBBBs..', '..SSbbbS...'],
  ['SSS........', '.SSsss.....', '..Ssssss...', '.Sssssss...', '.SssbBBBs..', 'SssbBrBrs..', '.SsbBBBBs..', '..SSbbbS...'],
  ['...........', '..SSs......', '.Sssssss...', 'SSssssss...', '.SssbBBBs..', 'SssbBrBrs..', '.SsbBBBBs..', '..SSbbbS...'],
];
function pyroFrame(o = {}) {
  const { lean = 0, dy = 0, trail = 0, hemW = 11, bell = 0, feet = [[11, 18], [15, 18]], arm = null, arm2 = null,
    staff = null, cowl = 0, flick = 0, sit = 0, flare = null, palm = null, flame = null, sparks = null, top: headroom = 0, wide = 0 } = o;
  const [c, g] = canvas(W + wide, H + headroom); g.translate(0, headroom);
  const put = (x, y, k) => { if (KP[k]) px(g, Math.round(x), Math.round(y), KP[k]); };
  // the staff goes behind her when she carries it, in front when she works it
  const wpx = new Set();   /* where the staff's cage and flame went: a gear tier never paints over them */
  const putW = (x, y, k) => { wpx.add(Math.round(x) + ',' + Math.round(y)); if (WP && (k === 'r' || k === 'y')) px(g, Math.round(x), Math.round(y), k === 'y' ? WP.s : WP.S); else put(x, y, k); };   /* the staff's cage and flame: the weapon skin's, never the robe's */
  const drawStaff = () => { if (!staff) return;
    const [x0, y0, x1, y1] = staff; line(g, x0, y0 + dy, x1, y1 + dy, KP.w, 2);   /* (the shaft keeps its wood: a recoloured shaft across her sleeve read as a blue band on the robe, not a staff) */
    const ux = Math.sign(x1 - x0), uy = Math.sign(y1 - y0);
    // a brass cage at the head with the flame in it
    const hx = x1, hy = y1 + dy;
    if (flame !== null) { /* THE FLAME AT REST stands straight up out of the cage whatever the lean of the staff, and burns a
         different shape on every beat: 0-3 the licks, 4 the flare when it is fed */
      putW(hx - 1, hy, 'y'); putW(hx + 1, hy, 'y'); putW(hx - 1, hy - 1, 'y'); putW(hx + 1, hy - 1, 'y'); putW(hx, hy, 'r'); putW(hx, hy - 1, 'y');
      const LICK = [[[0, -2, 'r'], [0, -3, 'r']], [[0, -2, 'y'], [1, -2, 'r'], [1, -3, 'r']], [[0, -2, 'r']], [[0, -2, 'y'], [-1, -2, 'r'], [0, -3, 'r']],
        [[0, -2, 'y'], [-1, -2, 'r'], [1, -2, 'r'], [0, -3, 'y'], [-1, -3, 'r'], [1, -3, 'r'], [0, -4, 'r'], [-2, -1, 'r'], [2, -1, 'r']]];
      for (const [ox, oy, k] of LICK[flame]) putW(hx + ox, hy + oy, k);
      return; }
    putW(hx - uy, hy + ux, 'y'); putW(hx + uy, hy - ux, 'y'); putW(hx + ux, hy + uy, 'y');
    putW(hx, hy, flick ? 'y' : 'r'); putW(hx + ux * 2, hy + uy * 2, flick ? 'r' : 'y');
    putW(hx + ux * 2 - uy, hy + uy * 2 + ux, 'r'); };
  if (GEAR >= 1) { /* THE CAPE: behind the robe, hanging from the shoulders and streaming back with her trail */
    const t0 = 8 + sit, h0 = 17 - Math.round(bell / 2), main = hexMix(KP.B, KP.b, 0.45), dark = hexMix(KP.B, '#000000', 0.25), fold = hexMix(KP.b, '#ffffff', 0.12), st = trail > 1 ? 2 : trail > 0 ? 1 : 0;
    for (let y = t0 + 1; y < h0; y++) { const t = (y - t0) / Math.max(1, h0 - t0), w0 = Math.round(7 + (hemW + bell - 7) * Math.pow(t, 1.3)), cx0 = 13 + lean * (1 - t) - trail * t * t, l0 = Math.round(cx0 - w0 / 2), r = y - t0 - 1;
      const lx = l0 - 1 - Math.floor(r * 0.15) - st * Math.floor((r + 1) / 3);
      for (let x = lx; x <= l0 + 1; x++) px(g, x, y + dy, y === h0 - 1 ? ((x + y) & 1 ? GOLD.d : GOLD.m) : x === lx ? (GEAR >= 4 && r % 2 === 0 ? GOLD.m : dark) : x === lx + 2 && r > 1 ? fold : main); } }
  if (staff && staff[4] === 'back') drawStaff();
  // boots, under the hem
  for (const [fx, fy] of feet) { put(fx, fy + dy, 'W'); put(fx + 1, fy + dy, 'W'); }
  // the robe: shoulders to hem, flaring, leaning with the body and trailing behind it
  const top = 8 + sit, hem = 17 - Math.round(bell / 2);
  for (let y = top; y <= hem; y++) {
    const t = (y - top) / Math.max(1, hem - top);
    const w = Math.round(7 + (hemW + bell - 7) * Math.pow(t, 1.3));
    const cx = 13 + lean * (1 - t) - trail * t * t;
    const l = Math.round(cx - w / 2), r = l + w - 1;
    for (let x = l; x <= r; x++) put(x, y + dy, x === l ? 'S' : x === r ? 's' : (x === Math.round(cx) - 1 && y > top + 3) ? 'S' : 's');
    if (y === hem) for (let x = l; x <= r; x++) if ((x + y) % 2 === 0 || bell) put(x, y + dy, 'r'); // the hem glows where it is singed
  }
  // the capelet over the shoulders, and the rope belt
  for (let x = 10 + lean; x <= 16 + lean; x++) { put(x, top + dy, 'b'); put(x, top + 1 + dy, x === 10 + lean || x === 16 + lean ? 'B' : 'b'); }
  put(9 + lean, top + 1 + dy, 'B'); put(17 + lean, top + 1 + dy, 'B');
  for (let x = 11 + lean; x <= 15 + lean; x++) put(x, top + 4 + dy, 'y'); put(12 + lean, top + 5 + dy, 'y'); put(12 + lean, top + 6 + dy, 'W');
  // the cowl
  const cw = COWL[cowl], hx = 8 + lean, hy = top - 8 + dy;
  cw.forEach((row, yy) => { for (let xx = 0; xx < row.length; xx++) { const k = row[xx]; if (k !== '.') put(hx + xx, hy + yy, k === 'r' && flick ? 'y' : k); } });
  if (GEAR >= 1) { /* her gear tiers: the clasp (1); the circlet-crest on the cowl's peak and the capelet's gold rim (2); the full set (4) - see gearFront for the knight's */
    const G = (x, y, c) => { if (!wpx.has(Math.round(x) + ',' + Math.round(y + dy))) px(g, Math.round(x), Math.round(y + dy), c); }, ht = headTop(cw), cx = hx + ht.cx, cy = hy - dy + ht.y;
    G(9 + lean, top + 1, GOLD.m);
    if (GEAR >= 2) { G(cx, cy - 1, GOLD.m); G(cx + 1, cy - 1, GOLD.d); G(cx, cy - 2, GOLD.l); G(10 + lean, top, GOLD.m); G(16 + lean, top, GOLD.m); G(13 + lean, top + 4, GOLD.l);
      if (GEAR >= 4) { G(cx - 1, cy - 1, GOLD.d); G(cx + 1, cy - 2, GOLD.m); G(cx, cy - 3, GOLD.l); G(cx - 1, cy - 2, GOLD.d); } }
    if (GEAR >= 4) { for (const [a, b] of [[10 + lean, 1], [16 + lean, -1]]) { G(a, top, GOLD.l); G(a + b, top, GOLD.m); G(a, top + 1, GOLD.m); G(a + b, top + 1, GOLD.d); }
      G(12 + lean, top + 2, GOLD.m); G(13 + lean, top + 2, GOLD.l); G(12 + lean, top + 3, GOLD.d); G(13 + lean, top + 3, GOLD.m); G(hx + 4, hy - dy + 7, GOLD.d); G(hx + 6, hy - dy + 7, GOLD.d); } }
  const gearMask = GEAR >= 3 ? g.getImageData(0, 0, c.width, c.height) : null;   /* her, before the sleeves, the staff and the flames: the aura follows HER */
  // sleeves: wide at the cuff, a hand at the end of each
  const sleeve = a => { if (!a) return; const [x0, y0, x1, y1] = a; line(g, x0, y0 + dy, x1, y1 + dy, KP.s, 2); put(x1, y1 + dy, 'S'); put(x1 + Math.sign(x1 - x0 || 1), y1 + dy, 'k'); };
  sleeve(arm2);
  if (!staff || staff[4] !== 'back') drawStaff();
  sleeve(arm);
  if (palm) { const [x, y] = palm; put(x, y + dy, 'y'); put(x + 1, y + dy, 'r'); put(x, y - 1 + dy, 'r'); put(x, y + 1 + dy, 'r'); put(x + 2, y + dy, flick ? 'y' : 'r'); }
  if (flare) { const [x, y, big] = flare; const pts = big ? [[0, 0, 'y'], [1, 0, 'y'], [2, 0, 'r'], [1, -1, 'r'], [1, 1, 'r'], [3, 0, 'r'], [2, -2, 'y'], [2, 2, 'y'], [0, -1, 'y'], [0, 1, 'y'], [4, -1, 'r'], [4, 1, 'r']] : [[0, 0, 'y'], [1, 0, 'r'], [0, -1, 'r'], [0, 1, 'r'], [2, 0, 'y']];
    for (const [ddx, ddy, k] of pts) put(x + ddx, y + ddy + dy, k); }
  if (sparks) for (const [x, y, k] of sparks) put(x, y + dy, k);   /* loose sparks, over everything */
  outline(c, OUT);
  gearAura(c, gearMask, (cowl | 0) * 2 + (dy | 0) + (lean | 0) + 8);
  if (staff) { const hd = arm ? [arm[2], arm[3] + dy] : [staff[0], staff[1] + dy]; c.wp = { p: [hd[0], hd[1] + headroom], t: [staff[2], staff[3] + dy + headroom] }; }   /* (see knightFrame: the blade's own hand and tip, for the smear pass) */
  c.feet = headroom + Math.max(...feet.map(f => f[1])) + dy;   /* the row her boots stand on (tools/crouch-feet.mjs) */
  return c;
}
/* EVERY ABILITY HAS A BODY: THE PYROMANCER'S BOUGHT ACTIVES (lane P, 2026-09-24). Vent, Wisp and Fire Wall played beside an idle
   pyromancer, Cinder Step drew the dodge roll, and Meteor and Ring of Fire shared the one ember-off-the-palm cast. Each now has frames
   of its own on her rig, played by src/hero-poses.js; added after the padding with the same headroom (a raised staff goes over the cowl). */
function pyroKitPoses(F, up) {
  const top = ATTACK_HEADROOM, P = o => pyroFrame({ top, ...o });
  /* VENT: hunched in round the heat with both sleeves drawn to her; then flung open, the robe belled out and the fire leaving her
     every way; and the settle, cold, the cowl down */
  F.vent = [P({ sit: 2, hemW: 10, staff: up(0, 2), arm: [16, 12, 15, 13], arm2: [11, 12, 13, 13], cowl: 0, sparks: [[13, 12, 'r']] }),
    P({ dy: -1, bell: 3, hemW: 14, staff: [9, 18, 10, 0, 'back'], arm: [16, 10, 22, 6], arm2: [11, 10, 5, 6], cowl: 2, flick: 1,
      sparks: [[3, 5, 'r'], [24, 4, 'y'], [2, 11, 'y'], [25, 10, 'r'], [13, -2, 'y'], [6, 1, 'r'], [21, 0, 'r'], [4, 16, 'r'], [23, 16, 'y']] }),
    P({ sit: 1, hemW: 12, staff: up(), arm: [16, 11, 18, 13], arm2: [11, 11, 9, 14], cowl: 0 })];
  /* WISP: the flame cupped low in the free palm, lifted up to her face, and let go - she watches it rise */
  F.wisp = [P({ sit: 1, staff: up(), arm: [16, 11, 17, 12], arm2: [11, 11, 14, 14], palm: [15, 14], cowl: 0 }),
    P({ staff: up(), arm: [16, 11, 17, 11], arm2: [11, 10, 14, 5], palm: [15, 4], cowl: 0, flick: 1 }),
    P({ staff: up(), arm: [16, 11, 17, 11], arm2: [11, 10, 13, 7], cowl: 2, sparks: [[15, 0, 'y'], [16, -1, 'r'], [14, -1, 'r'], [15, -2, 'y']] })];
  /* FIRE WALL: the staff taken up behind her head in both hands; brought down along the ground ahead with the flare at its foot;
     and held there, low, while the wall goes up */
  F.wall = [P({ lean: -2, dy: -1, staff: [4, 6, 20, 1], arm: [15, 9, 13, 5], arm2: [11, 9, 9, 5], cowl: 2, bell: 1 }),
    P({ lean: 3, trail: 3, sit: 1, feet: [[8, 18], [18, 18]], staff: [13, 12, 29, 18], arm: [17, 10, 21, 13], arm2: [13, 10, 17, 13], cowl: 1, flare: [29, 17, true] }),
    P({ lean: 2, trail: 2, sit: 2, feet: [[8, 18], [18, 18]], staff: [13, 13, 28, 18], arm: [17, 11, 20, 14], arm2: [13, 11, 16, 14], cowl: 0, sparks: [[29, 16, 'r'], [30, 17, 'y'], [27, 15, 'y']] })];
  /* CINDER STEP: low and flat through the gap, the staff carried behind, the hem streaming and shedding embers; and the pull-up */
  const trailS = [[3, 17, 'r'], [1, 16, 'y'], [4, 14, 'r'], [0, 18, 'r']];
  F.cinder = [P({ lean: 3, sit: 2, trail: 4, hemW: 13, feet: [[8, 18], [17, 18]], staff: [5, 16, 22, 8, 'back'], arm: [17, 11, 20, 12], cowl: 1, sparks: trailS.slice(0, 2) }),
    P({ lean: 4, sit: 3, trail: 5, hemW: 14, feet: [[7, 18], [19, 18]], staff: [4, 17, 23, 9, 'back'], arm: [17, 12, 21, 12], cowl: 1, flick: 1, sparks: trailS }),
    P({ lean: -2, sit: 1, trail: -1, hemW: 12, feet: [[10, 18], [16, 18]], staff: [15, 17, 20, 3], arm: [16, 11, 18, 11], cowl: 2, sparks: [[6, 18, 'r']] })];
  /* METEOR: the staff swung up; then held straight up over the cowl in both hands, the fire at its head calling the sky down */
  F.meteor = [P({ lean: 1, staff: [11, 14, 24, 2], arm: [16, 10, 20, 7], arm2: [11, 10, 16, 8], cowl: 2 }),
    P({ dy: -1, staff: [15, 15, 16, -7], arm: [16, 10, 16, 2], arm2: [11, 10, 15, 3], cowl: 2, bell: 1, flare: [16, -8, true] })];
  /* RING OF FIRE: the staff lifted high in both hands; then driven straight down into the ground before her, and the ring coming
     off its foot along the floor both ways */
  F.ring = [P({ dy: -1, staff: [15, 10, 17, -5], arm: [16, 10, 16, 3], arm2: [11, 10, 15, 4], cowl: 0 }),
    P({ sit: 2, hemW: 13, staff: [17, 21, 18, 3], arm: [16, 12, 17, 9], arm2: [11, 12, 16, 10], cowl: 1, flick: 1,
      sparks: [[11, 20, 'r'], [23, 20, 'r'], [8, 19, 'y'], [26, 19, 'y'], [5, 20, 'r'], [29, 20, 'r']] })];
  /* THE LATE ACTIVES' OWN POSES (claude/heroposes). FLASHOVER: the free palm cupped round a spark, close in to her; then both sleeves snapped
     straight out ahead and the big flare going off at the ends of them (what burns, goes); and the recoil, the cowl back, embers hanging */
  F.flash = [P({ lean: -1, sit: 1, staff: up(0, 2), arm: [16, 12, 15, 13], arm2: [11, 11, 14, 13], palm: [14, 13], cowl: 0 }),
    P({ lean: 3, trail: 2, sit: 1, feet: [[8, 18], [18, 18]], staff: [5, 15, 10, 4, 'back'], arm: [17, 10, 24, 9], arm2: [12, 10, 21, 10], cowl: 1, flare: [25, 8, true], flick: 1,
      sparks: [[28, 5, 'y'], [29, 11, 'r'], [27, 13, 'y'], [26, 4, 'r'], [30, 8, 'y']] }),
    P({ lean: -1, bell: 2, hemW: 13, staff: up(), arm: [16, 10, 19, 9], arm2: [11, 10, 13, 12], cowl: 2, sparks: [[23, 6, 'y'], [26, 10, 'r'], [24, 14, 'y'], [20, 4, 'r']] })];
  /* FIRESTORM: the staff swung up flat over her head in both hands; then held there crosswise with a flare on each end and the robe
     belled, the sky coming down on every side; and the staff brought down to the ground, embers still falling */
  F.storm = [P({ dy: -1, staff: [7, 1, 24, 1], arm: [16, 9, 20, 2], arm2: [11, 9, 10, 2], cowl: 2 }),
    P({ dy: -2, bell: 3, hemW: 14, staff: [6, -2, 26, -2], arm: [16, 8, 21, -1], arm2: [11, 8, 9, -1], cowl: 2, flare: [27, -3, true], flick: 1,
      sparks: [[2, -3, 'r'], [3, -1, 'y'], [1, 4, 'r'], [30, 4, 'y'], [31, -1, 'r'], [4, 9, 'y'], [29, 10, 'r'], [2, 14, 'y'], [31, 15, 'r'], [13, -6, 'y'], [17, -5, 'r']] }),
    P({ sit: 2, hemW: 13, staff: [17, 20, 18, 4], arm: [16, 12, 17, 10], arm2: [11, 12, 16, 11], cowl: 1,
      sparks: [[4, 2, 'r'], [28, 5, 'y'], [8, 9, 'y'], [26, 12, 'r'], [3, 15, 'r'], [30, 16, 'y']] })];
  /* ==== HERO PASS A ART (claude/heropassaart): the EMBER BLINK. OUT - thrown flat and long off the toes with the staff trailed behind, the whole robe stretched into a streak and a rope of embers left on the line she
     came down; IN - arrived (she is not drawn between the two), the robe still belled, the cowl thrown back and the flare going off around her as she lands ==== */
  F.eBlink = [P({ lean: 5, sit: 3, trail: 8, hemW: 15, feet: [[7, 18], [20, 18]], staff: [3, 17, 24, 8, 'back'], arm: [17, 12, 23, 12], cowl: 1, flick: 1, flare: [25, 11, true],
      sparks: [[2, 13, 'y'], [-1, 15, 'r'], [4, 10, 'r'], [0, 18, 'y'], [-3, 16, 'r'], [-2, 12, 'y'], [-5, 14, 'y'], [-6, 17, 'r'], [27, 8, 'y'], [28, 13, 'r']] }),
    P({ lean: -2, dy: -1, bell: 3, hemW: 14, staff: up(), arm: [16, 10, 20, 7], arm2: [11, 10, 8, 8], cowl: 2, flick: 1,
      sparks: [[3, 5, 'r'], [24, 4, 'y'], [2, 11, 'y'], [25, 10, 'r'], [13, -2, 'y'], [6, 1, 'r'], [21, 0, 'r'], [4, 16, 'r'], [23, 16, 'y'], [9, -3, 'y'], [18, -4, 'r']] })];
  riposteKit(F, 'pyro', P, { X: 19, Y: 13, OFF: [13, 13], up });
}
/* EVERY ABILITY HAS A BODY: THE PALADIN'S BOUGHT ACTIVES (lane P, 2026-09-24). Divine Shield played beside an idle paladin, Holy
   Charge drew the dodge roll, Hammer Leap the plain jump, and Consecrate, Spear of Light and Blessed Hammer all shared MEND's hand-up
   cast. Each now has frames of its own on his rig; OFF is the off shoulder, and a() puts a loose pixel at an absolute point. */
function paladinKitPoses(F, sh) {
  const top = ATTACK_HEADROOM, [X, Y] = sh, OFF = [BX + 2, BY + 7], K = o => knightFrame({ top, ...o });
  const a = (x, y, col) => [x - BX, y - BY, col], G = '#ffd36b', C = '#fff6c8', W = '#ffffff', D = '#c9b27c';
  /* HOLY CHARGE: behind the maul stood upright before him like a banner, the head lit, shoulder down; the full stride with the light
     streaming off him; and the pull-up, heavy, on his heels */
  F.charge = [K({ wide: 4, dx: 2, dy: 1, legs: 'runC', arm: [X, Y, X + 4, Y + 1], arm2: [OFF[0], OFF[1], X + 3, Y + 3], maul: [X + 4, Y + 8, X + 5, Y - 6], glow: [X + 5, Y - 10], plume: 2 }),
    K({ wide: 6, dx: 4, dy: 1, legs: 'run1', arm: [X, Y, X + 4, Y + 1], arm2: [OFF[0], OFF[1], X + 3, Y + 3], maul: [X + 4, Y + 8, X + 6, Y - 6], glow: [X + 6, Y - 10], plume: 2,
      bits: [a(4, 10, G), a(1, 11, C), a(3, 15, G), a(0, 16, D), a(5, 5, C)] }),
    K({ dx: 1, dy: 2, legs: 'land', arm: [X, Y, X + 3, Y + 3], maul: [X + 3, Y + 4, X + 7, Y + 9], plume: 0 })];
  /* DIVINE SHIELD: the maul lifted across his chest in both hands; raised straight overhead, level, the light gathering on it; and
     the light closed round him, a ring of it standing off his plate */
  const high = { dy: -1, sho: 1, hy: -1, legs: 'wide', arm: [X, Y, X + 1, Y - 8], arm2: [OFF[0], OFF[1], X - 5, Y - 8], maul: [X - 6, Y - 8, X + 6, Y - 8], glow: [X, Y - 12] };
  const ring = [a(5, -3, G), a(9, -1, C), a(12, 3, G), a(13, 9, C), a(12, 15, G), a(9, 19, C), a(5, 21, G), a(29, -1, C), a(26, -3, G), a(31, 3, G), a(32, 9, C), a(31, 15, G), a(29, 19, C), a(26, 21, G)];
  F.halo = [K({ legs: 'wide', arm: [X, Y, X + 2, Y - 1], arm2: [OFF[0], OFF[1], X - 3, Y - 1], maul: [X - 5, Y - 1, X + 6, Y - 1], plume: 1 }),
    K({ ...high, plume: 2 }), K({ ...high, plume: 0, bits: ring })];
  /* HAMMER LEAP, the arc (chosen by his climb, not a clock): the maul taken back over his shoulder on the rise, straight up over
     the helm at the top, and swung down ahead of him on the drop */
  F.leap = [K({ legs: 'jump', dy: -1, arm: [X, Y, X - 1, Y - 5], maul: [X - 1, Y - 4, X - 7, Y - 12], plume: 2 }),
    K({ legs: 'jump2', dy: -1, sho: 1, arm: [X, Y, X + 1, Y - 7], arm2: [OFF[0], OFF[1], X, Y - 7], maul: [X + 1, Y - 6, X + 2, Y - 18], glow: [X + 2, Y - 21], plume: 1 }),
    K({ legs: 'fall', arm: [X, Y, X + 4, Y + 1], arm2: [OFF[0], OFF[1], X + 3, Y + 2], maul: [X + 4, Y + 1, X + 11, Y + 10], glow: [X + 12, Y + 11], plume: 2 })];
  /* ...and where he comes down: the head of the maul in the ground before him, a gold bite off the turf; then up off it */
  const bite = [a(X + 8, Y + 4, W), a(X + 9, Y + 3, G), a(X + 7, Y + 3, G), a(X + 11, Y + 4, D), a(X + 5, Y + 4, D)];   /* (the ground line, with dy 4) */
  F.leapLand = [K({ dx: 1, dy: 4, legs: 'crouch', legsDy: 3, arm: [X, Y, X + 3, Y + 2], arm2: [OFF[0], OFF[1], X + 2, Y + 3], maul: [X + 3, Y + 1, X + 7, Y + 3], plume: 2, bits: bite }),
    K({ dy: 2, legs: 'wide', arm: [X, Y, X + 3, Y + 3], maul: [X + 3, Y + 3, X + 6, Y + 7], plume: 1 })];
  /* HAMMER OF DAWN (B16, claude/plunges - his plunge has its OWN windup and release). The windup: up on his toes with the maul hauled plumb over the helm in both hands, the head lit; then the fall, the
     maul driven down under him with the light streaming up off the haft. The release (hammerHit, played as it lands): the head of the maul in the ground, a gold star off it; then him coming up off it. */
  F.hammerWind = [K({ dy: -1, sho: 1, hy: -1, legs: 'jump2', arm: [X, Y, X + 1, Y - 8], arm2: [OFF[0], OFF[1], X - 1, Y - 8], maul: [X, Y - 7, X, Y - 19], glow: [X, Y - 21], plume: 2 }),
    K({ legs: 'tuck', hy: 1, arm: [X, Y, X - 1, Y + 2], arm2: [OFF[0], OFF[1], X - 2, Y + 2], maul: [X - 1, Y + 2, X - 1, Y + 15], glow: [X - 1, Y + 16], plume: 2,
      bits: [a(X - 6, Y - 3, G), a(X + 5, Y - 5, C), a(X - 4, Y - 9, G), a(X + 3, Y - 12, C), a(X - 2, Y - 15, G)] })];
  F.hammerHit = [K({ dy: 4, legs: 'crouch', legsDy: 3, arm: [X, Y, X + 1, Y + 5], arm2: [OFF[0], OFF[1], X, Y + 5], maul: [X + 1, Y + 4, X + 2, Y + 10], glow: [X + 2, Y + 11], plume: 2,
      bits: [a(X - 4, Y + 10, G), a(X + 8, Y + 10, G), a(X - 6, Y + 8, C), a(X + 10, Y + 8, C), a(X + 2, Y + 12, W), a(X - 2, Y + 11, G), a(X + 6, Y + 11, G)] }),
    K({ dy: 2, legs: 'wide', arm: [X, Y, X + 2, Y + 3], arm2: [OFF[0], OFF[1], X + 1, Y + 4], maul: [X + 2, Y + 3, X + 4, Y + 9], plume: 1, bits: [a(X - 5, Y + 9, D), a(X + 9, Y + 9, D), a(X + 1, Y + 11, G)] })];
  /* CONSECRATE: the maul lifted straight up before him; then down on one knee with the head set in the turf, both hands on the
     haft, the light coming up out of the ground round it */
  F.hallow = [K({ dy: -1, legs: 'wide', arm: [X, Y, X + 2, Y - 3], arm2: [OFF[0], OFF[1], X + 1, Y - 2], maul: [X + 2, Y - 2, X + 3, Y - 13], plume: 1 }),
    K({ dy: 2, legs: 'kneel', arm: [X, Y, X + 4, Y - 2], arm2: [OFF[0], OFF[1], X + 3, Y - 1], maul: [X + 4, Y - 3, X + 6, Y + 5], plume: 2,
      bits: [a(X + 2, Y + 6, G), a(X + 10, Y + 6, G), a(X + 6, Y + 3, C), a(X, Y + 4, C), a(X + 12, Y + 4, C), a(X + 6, Y - 5, W)] })];
  F.hallowQ = F.hallow;   /* (claude/palart) the same two frames on a 0.25 s beat: the circle MOVED, tapped again while one stands (hero-poses.js POSE_BEATS) */
  /* EMPOWER, SANCTIFY (claude/palart: the placeholder's real frames). WINDUP: up on his toes, the maul straight up over the helm in both hands, his
     helm tipped back to it, the head of it lit white and a ring of light standing off it with a ray up and a mote falling either side; RELEASE: driven
     two-handed straight down in front of him, head bowed over it, the head of it in the turf with a flash, and a column of light going up off the ground on
     BOTH sides of him (white at the root, gold at the top, a ground-line splash under each) - the circle answering. (ab() is a() for a frame with a body dy.) */
  const ab = (x, y, col, d = 0) => [x - BX, y - BY - d, col];
  const colm = (x0, h, d) => { const o = []; for (let j = 0; j < h; j++) { const y = 21 - j, c = j < 2 ? W : j < 6 ? C : G; o.push(ab(x0, y, c, d)); if (j < h - 3) o.push(ab(x0 + 1, y, j & 1 ? G : C, d)); } o.push(ab(x0, 22, W, d), ab(x0 + 1, 22, W, d), ab(x0 - 1, 22, G, d), ab(x0 + 2, 22, G, d), ab(x0 - 2, 22, D, d), ab(x0 + 3, 22, D, d)); return o; };
  F.sanctify = [K({ dy: -2, hy: -1, sho: 1, legs: 'wide', arm: [X, Y, X + 1, Y - 8], arm2: [OFF[0], OFF[1], X, Y - 8], maul: [X + 1, Y - 7, X + 1, Y - 19], glow: [X + 1, Y - 22], plume: 2,
      bits: [a(X + 1, Y - 17, W), a(X, Y - 16, W), a(X + 2, Y - 16, W), a(X - 5, Y - 18, C), a(X - 6, Y - 15, G), a(X + 7, Y - 18, C), a(X + 8, Y - 15, G), a(X + 1, Y - 25, C), a(X + 1, Y - 27, G),
        a(X - 3, Y - 23, G), a(X + 5, Y - 23, G), a(X - 7, Y - 8, C), a(X + 9, Y - 10, G), a(X - 8, Y - 3, G), a(X + 10, Y - 4, C)] }),
    K({ dy: 1, hy: 1, legs: 'wide', arm: [X, Y, X + 4, Y + 1], arm2: [OFF[0], OFF[1], X + 3, Y + 2], maul: [X + 4, Y, X + 5, Y + 8], plume: 2,
      bits: [...colm(5, 15, 1), ...colm(29, 12, 1), ab(X + 3, 22, W, 1), ab(X + 6, 22, W, 1), ab(X + 5, 22, G, 1), ab(X + 9, 22, C, 1), ab(X + 1, 20, G, 1), ab(8, 7, C, 1), ab(25, 9, W, 1), ab(3, 11, G, 1), ab(31, 13, C, 1)] })];
  /* SPEAR OF LIGHT: the maul drawn back level behind him and the off hand out, sighting; then driven straight out level, the light
     leaving the head of it */
  F.beam = [K({ dx: -1, legs: 'wide', arm: [X, Y, X - 1, Y - 1], maul: [X - 1, Y - 1, X - 10, Y - 2], arm2: [OFF[0], OFF[1], X + 5, Y - 2], plume: 1 }),
    K({ wide: 8, dx: 2, legs: 'runC', arm: [X, Y, X + 5, Y - 1], arm2: [OFF[0], OFF[1], X + 4, Y], maul: [X + 5, Y - 1, X + 16, Y - 2], glow: [X + 19, Y - 2], plume: 2,
      bits: [a(X + 21, Y - 2, C), a(X + 22, Y - 2, W)] })];
  /* BLESSED HAMMER: the off hand low behind him with the light in it, the maul grounded; then flung through high, and the hammer of
     light gone off it */
  F.hurlH = [K({ dx: -1, legs: 'wide', arm2: [OFF[0], OFF[1], OFF[0] - 5, OFF[1] + 3], maul: rest(), glow: [OFF[0] - 6, OFF[1] + 4], plume: 1 }),
    K({ wide: 4, dx: 2, legs: 'runC', arm2: [OFF[0] + 1, OFF[1], X + 7, Y - 4], maul: rest(), glow: [X + 10, Y - 5], plume: 2, bits: [a(X + 12, Y - 5, C)] })];
  function rest() { return [X + 2, Y + 1, X + 5, Y + 9]; }
  /* THE LATE ACTIVES' OWN POSES (claude/heroposes). DAWNBURST: the maul brought in against his chest, head bowed, the light gathering;
     then the head thrown back and the maul swung up high and forward, the flare going off as rays level with his chest; and the glow dying on the plate */
  const rays = [a(X + 10, Y - 2, W), a(X + 13, Y - 2, G), a(X + 16, Y - 2, C), a(X + 19, Y - 2, G), a(X + 9, Y - 6, G), a(X + 12, Y - 9, C), a(X + 9, Y + 3, G), a(X + 12, Y + 6, C),
    a(X - 7, Y - 2, G), a(X - 10, Y - 2, C), a(X - 13, Y - 2, G), a(X - 6, Y - 7, C), a(X - 8, Y + 3, C), a(X + 2, Y - 18, G), a(X - 1, Y - 15, C)];
  F.dawn = [K({ hy: 1, legs: 'wide', arm: [X, Y, X + 1, Y + 1], arm2: [OFF[0], OFF[1], X - 1, Y], maul: [X, Y, X + 1, Y - 12], plume: 0 }),
    K({ hy: -1, sho: 1, dy: -1, legs: 'wide', arm: [X, Y, X + 5, Y - 6], arm2: [OFF[0], OFF[1], X + 1, Y - 5], maul: [X + 5, Y - 6, X + 10, Y - 17], glow: [X + 11, Y - 20], plume: 2, bits: rays }),
    K({ legs: 'wide', arm: [X, Y, X + 3, Y - 4], arm2: [OFF[0], OFF[1], X, Y - 3], maul: [X + 3, Y - 4, X + 6, Y - 14], plume: 1, bits: [a(X + 9, Y - 3, G), a(X - 5, Y - 3, C), a(X + 6, Y - 17, D)] })];
  /* HOLY WRATH: the maul cocked far back over the shoulder, level, in a stance wide as a wall; then it comes round and is held out
     level before him with the light standing up off both shoulders like fire */
  const fire = [a(BX + 1, BY + 2, G), a(BX, BY - 1, C), a(BX + 2, BY - 3, G), a(BX + 17, BY + 2, G), a(BX + 18, BY - 1, C), a(BX + 16, BY - 3, G), a(BX + 7, BY - 5, W), a(BX + 11, BY - 4, G), a(BX + 4, BY - 2, G), a(BX + 14, BY - 2, G)];
  F.wrath = [K({ dx: -1, dy: 1, legs: 'wide', arm: [X, Y, X - 3, Y - 3], arm2: [OFF[0], OFF[1], X - 5, Y - 3], maul: [X - 3, Y - 3, X - 13, Y - 9], plume: 1 }),
    K({ wide: 6, dx: 2, dy: 1, legs: 'wide', sho: 1, hy: -1, arm: [X, Y, X + 6, Y - 1], arm2: [OFF[0], OFF[1], X + 4, Y], maul: [X + 6, Y - 1, X + 17, Y - 3], glow: [X + 19, Y - 3], plume: 2, bits: fire }),
    K({ dy: 1, legs: 'wide', hy: -1, arm: [X, Y, X + 3, Y - 2], arm2: [OFF[0], OFF[1], X + 2, Y - 1], maul: [X + 3, Y - 2, X + 6, Y - 9], plume: 2, bits: fire.slice(0, 6) })];
  /* ==== PALADIN 3 ART (claude/paladin3art, Daniel 10-15; B16: every tier of CONVICTION has its OWN windup + release - none borrows 'sanctify' or the consecrate kneel) ====
     A ring of sun-rays round a point (the head of the maul, or his helm): n spokes at radius r, alternating white / cream / gold, the long ones horizontal. */
  const sunAt = (cx, cy, r, n = 8, k = 0) => { const o = []; for (let i = 0; i < n; i++) { const an = k + i * Math.PI * 2 / n, c = i % 4 === 0 ? W : i % 2 ? C : G; o.push(a(Math.round(cx + Math.cos(an) * r), Math.round(cy + Math.sin(an) * r * 0.8), c)); if (r > 6) o.push(a(Math.round(cx + Math.cos(an) * (r + 3)), Math.round(cy + Math.sin(an) * (r + 3) * 0.8), i % 2 ? G : D)); } return o; };
  /* SMITE (1 pip, the quick strike): the war hammer drawn back low at the hip, a short sharp step in behind it; then snapped forward and up with the head lit
     and a spark of light off the face of it - the column comes down where it points. A flick, not a swing: it is a pip's worth. */
  F.smiteQ = [K({ dx: -1, dy: 1, legs: 'wide', arm: [X, Y, X - 1, Y + 3], arm2: [OFF[0], OFF[1], X - 2, Y + 4], maul: [X - 1, Y + 3, X - 8, Y + 9], plume: 1 }),
    K({ wide: 8, dx: 2, legs: 'runC', sho: 1, arm: [X, Y, X + 5, Y - 3], arm2: [OFF[0], OFF[1], X + 4, Y - 1], maul: [X + 5, Y - 3, X + 14, Y - 11], glow: [X + 17, Y - 13], plume: 2,
      bits: [a(X + 20, Y - 14, W), a(X + 22, Y - 11, C), a(X + 19, Y - 17, G), a(X + 22, Y - 15, G), a(X + 16, Y - 8, C)] })];
  /* RADIANCE (3 pips, the burst): the hammer stood upright before him in both hands, helm bowed, the light gathering at the head; then the helm thrown back and
     the head lifted, the light going off round his chest in a ring of spokes; and the glow settling on the plate */
  F.radiance = [K({ hy: 1, legs: 'wide', arm: [X, Y, X + 3, Y + 1], arm2: [OFF[0], OFF[1], X + 2, Y + 2], maul: [X + 3, Y + 9, X + 4, Y - 5], glow: [X + 4, Y - 9], plume: 1, bits: [a(X + 1, Y - 9, C), a(X + 7, Y - 9, C)] }),
    K({ hy: -1, sho: 1, dy: -1, legs: 'wide', arm: [X, Y, X + 2, Y - 3], arm2: [OFF[0], OFF[1], X + 1, Y - 2], maul: [X + 2, Y + 2, X + 3, Y - 12], glow: [X + 3, Y - 16], plume: 2, bits: [...sunAt(X + 1, Y + 2, 9), ...sunAt(X + 1, Y + 2, 14, 8, 0.39)] }),
    K({ legs: 'wide', arm: [X, Y, X + 3, Y], arm2: [OFF[0], OFF[1], X + 2, Y + 1], maul: [X + 3, Y + 4, X + 4, Y - 8], plume: 1, bits: [a(X - 6, Y + 2, G), a(X + 10, Y + 2, C), a(X + 4, Y - 11, G), a(X - 3, Y + 6, D), a(X + 9, Y + 6, D)] })];
  /* SUNFALL (5 pips, the finisher): up on his toes with the hammer stretched straight up in both arms and his helm thrown right back, a sun of spokes standing over
     the head of it; lifted off the ground on the light of it, the sun full and white; then the hammer driven into the turf and him down on a knee over it, a
     column going up off the ground on both sides (the sun he called falling) */
  F.sunfall = [K({ dy: -1, hy: -1, sho: 1, legs: 'wide', arm: [X, Y, X + 1, Y - 9], arm2: [OFF[0], OFF[1], X, Y - 9], maul: [X + 1, Y - 8, X + 1, Y - 20], glow: [X + 1, Y - 23], plume: 2, bits: sunAt(X + 1, Y - 22, 6) }),
    K({ dy: -3, legsDy: -2, hy: -1, sho: 1, legs: 'jump2', arm: [X, Y, X + 1, Y - 10], arm2: [OFF[0], OFF[1], X, Y - 10], maul: [X + 1, Y - 9, X + 1, Y - 21], glow: [X + 1, Y - 24], plume: 1, bits: [...sunAt(X + 1, Y - 23, 7), ...sunAt(X + 1, Y - 23, 12, 8, 0.39), a(X + 1, Y - 17, W), a(X, Y - 15, W), a(X + 2, Y - 15, W)] }),
    K({ dy: 2, hy: 1, legs: 'kneel', arm: [X, Y, X + 4, Y - 1], arm2: [OFF[0], OFF[1], X + 3, Y], maul: [X + 4, Y - 2, X + 6, Y + 6], plume: 2, bits: [...colm(4, 17, 2), ...colm(29, 14, 2), ab(X + 5, 22, W, 2), ab(X + 8, 22, G, 2), ab(10, 6, C, 2), ab(24, 8, W, 2), ab(2, 12, G, 2), ab(32, 11, C, 2)] })];
  /* VERDICT (hold X): THREE poses. WIND (played by how far the hold has come, three beats): the hammer lifted off the ground at his side, then stood upright
     beside his shoulder in the strong hand, then carried up to arm's length with the helm tipped back to it and a halo of light opening over the head;
     HOLD (once a sigil is down or the wind is full): the hammer held aloft, the halo turning (two frames, the second brighter), his stance set wide;
     RELEASE: the head of the hammer brought down level and pointed at them like a gavel, the light leaving it downward in lines - he does not swing it. */
  const halo = (r, k) => { const o = [], cx = X + 1, cy = Y - 25; for (let i = -r; i <= r; i++) { const hy2 = Math.round(Math.sqrt(Math.max(0, r * r - i * i)) * 0.35); o.push(a(cx + i, cy - hy2, (i + k) & 2 ? C : G), a(cx + i, cy + hy2, (i + k) & 2 ? G : D)); } o.push(a(cx, cy, W)); return o; };
  F.vWind = [K({ dx: -1, legs: 'wide', arm: [X, Y, X - 1, Y - 2], arm2: [OFF[0], OFF[1], X - 2, Y - 1], maul: [X - 1, Y - 1, X - 5, Y - 11], plume: 1 }),
    K({ legs: 'wide', sho: 1, arm: [X, Y, X + 1, Y - 6], arm2: [OFF[0], OFF[1], X, Y - 5], maul: [X + 1, Y - 5, X + 2, Y - 17], glow: [X + 2, Y - 20], plume: 2 }),
    K({ dy: -1, hy: -1, sho: 1, legs: 'wide', arm: [X, Y, X + 1, Y - 8], arm2: [OFF[0], OFF[1], X, Y - 8], maul: [X + 1, Y - 7, X + 1, Y - 19], glow: [X + 1, Y - 22], plume: 2, bits: halo(5, 0) })];
  F.vHold = [0, 1].map(i => K({ dy: -1, hy: -1, sho: 1, legs: 'wide', arm: [X, Y, X + 1, Y - 8], arm2: [OFF[0], OFF[1], X, Y - 8], maul: [X + 1, Y - 7, X + 1, Y - 19], glow: [X + 1, Y - 22], plume: i ? 1 : 2,
    bits: [...halo(i ? 7 : 6, i * 2), a(X - 5, Y - 18, i ? W : C), a(X + 7, Y - 18, i ? C : W), a(X + 1, Y - 29 - i, G)] }));
  F.vRel = [K({ wide: 8, dx: 1, dy: 1, legs: 'wide', sho: 1, arm: [X, Y, X + 5, Y - 4], arm2: [OFF[0], OFF[1], X + 4, Y - 2], maul: [X + 5, Y - 4, X + 15, Y + 2], glow: [X + 18, Y + 3], plume: 2,
      bits: [a(X + 19, Y + 6, W), a(X + 19, Y + 9, C), a(X + 19, Y + 12, G), a(X + 21, Y + 5, G), a(X + 21, Y + 11, C), a(X + 17, Y + 8, G)] }),
    K({ dx: 1, dy: 1, legs: 'wide', arm: [X, Y, X + 3, Y + 1], arm2: [OFF[0], OFF[1], X + 2, Y + 2], maul: [X + 3, Y + 1, X + 5, Y + 9], plume: 1, bits: [a(X + 9, Y + 9, G), a(X + 11, Y + 7, C)] })];
  /* BULWARK ADVANCE (the aegis held, pressing ahead): a stride cycle behind the hammer stood upright before him, shoulder leaning into it, a leaf of light standing
     in the air ahead of the haft that the foes are shoved off. Four frames, the bob on every other one. */
  const leaf = [a(X + 8, Y - 8, C), a(X + 9, Y - 5, G), a(X + 9, Y - 2, C), a(X + 9, Y + 1, G), a(X + 9, Y + 4, C), a(X + 8, Y + 7, G), a(X + 7, Y - 11, W), a(X + 7, Y + 9, W)];
  F.bulwark = ['run1', 'run3', 'run4', 'run6'].map((lg, i) => K({ dx: 2, dy: i & 1 ? 1 : 0, legs: lg, sho: 1, arm: [X, Y, X + 3, Y + 2], arm2: [OFF[0], OFF[1], X + 3, Y + 3], maul: [X + 3, Y + 9, X + 3, Y - 5], glow: [X + 3, Y - 9], plume: i & 1 ? 1 : 2, bits: i & 1 ? leaf.slice(0, 6) : leaf }));
  /* ==== PALADIN 4 ART (claude/paladin4art, Daniel 10-15): the poses the Paladin 4 kit borrowed ====
     ln(): a line of loose pixels from (x0, y0) to (x1, y1) at absolute points (a spear shaft, a streak of light) */
  const ln = (x0, y0, x1, y1, col, every = 1) => { const o = [], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) if (i % every === 0) o.push(a(Math.round(x0 + (x1 - x0) * i / (n || 1)), Math.round(y0 + (y1 - y0) * i / (n || 1)), col)); return o; };
  const halo4 = (cx, cy, r, k) => { const o = []; for (let j = -r; j <= r; j++) { const hy2 = Math.round(Math.sqrt(Math.max(0, r * r - j * j)) * 0.3); o.push(a(cx + j, cy - hy2, (j + k) & 2 ? C : G)); } return o; };
  /* SANCTUARY STEP (the dodge, 0.26 s): PLANT - the lead foot set, the hammer brought across his body level in both hands (a bar before him, not a brace), weight dropping; PUSH - driven off the back
     foot, long and low, the hammer still across, a smear of light left where he stood; LAND - the step finished, the weight settled, the hammer lowered, a spark off the heel */
  F.sStep = [K({ dx: -1, dy: 1, legs: 'wide', sho: 1, arm: [X, Y, X + 2, Y + 1], arm2: [OFF[0], OFF[1], X + 1, Y + 2], maul: [X - 5, Y + 2, X + 9, Y - 1], plume: 1, bits: [a(X - 7, Y + 12, G), a(X - 9, Y + 13, C)] }),
    K({ wide: 8, dx: 3, dy: 1, legs: 'runC', sho: 1, arm: [X, Y, X + 5, Y + 1], arm2: [OFF[0], OFF[1], X + 4, Y + 2], maul: [X - 1, Y + 2, X + 13, Y - 1], plume: 2, bits: [...ln(X - 12, Y + 9, X - 5, Y + 9, G, 2), ...ln(X - 14, Y + 5, X - 8, Y + 5, C, 2), a(X - 6, Y + 13, W), a(X - 10, Y + 12, G)] }),
    K({ dx: 1, dy: 2, legs: 'land', arm: [X, Y, X + 3, Y + 3], arm2: [OFF[0], OFF[1], X + 2, Y + 4], maul: [X - 2, Y + 4, X + 9, Y + 3], plume: 0, bits: [a(X - 3, Y + 13, G), a(X - 5, Y + 12, C), a(X + 6, Y + 13, D)] })];
  /* PRAYER: down on one knee, the maul planted upright with BOTH hands clasped on the haft at his brow, helm bowed to them; a thin halo set over the bowed head and light gathering at the head of the
     maul. The second beat breathes: the halo wider, motes rising off the hands, a cross of light at the head of the haft (held there once his bar is full) */
  const crossAt = (cx, cy, r) => [a(cx, cy, W), a(cx - 1, cy, C), a(cx + 1, cy, C), a(cx, cy - 1, C), a(cx, cy + 1, C), a(cx - r, cy, G), a(cx + r, cy, G), a(cx, cy - r, G), a(cx, cy + r, G)];
  F.pray = [0, 1].map(i => K({ dy: 3, hy: 2, legs: 'kneel', arm: [X, Y, X + 3, Y], arm2: [OFF[0], OFF[1], X + 3, Y + 1], maul: [X + 4, Y + 9, X + 4, Y - 9], glow: [X + 4, Y - 13 - i], plume: 0,
    bits: i ? [...halo4(X - 2, Y - 8, 6, 1), ...crossAt(X + 4, Y - 18, 3), a(X + 8, Y - 4, C), a(X + 9, Y - 8, G), a(X, Y - 11, W), a(X + 7, Y - 12, C)] : [...halo4(X - 2, Y - 8, 5, 0), a(X + 4, Y - 16, C), a(X + 7, Y - 3, G)] }));
  /* TWIN SMITE's second blow (smiteB): the hammer back across the OTHER shoulder, the whole body turned into it; then the backhand - brought flat through and up, the head lit white, a second spark off the face */
  F.smiteB = [K({ dx: -2, dy: 1, legs: 'wide', sho: 1, arm: [X, Y, X - 3, Y - 4], arm2: [OFF[0], OFF[1], X - 4, Y - 2], maul: [X - 3, Y - 4, X - 9, Y - 12], plume: 1 }),
    K({ wide: 10, dx: 3, legs: 'runC', sho: 1, arm: [X, Y, X + 6, Y - 1], arm2: [OFF[0], OFF[1], X + 5, Y + 1], maul: [X + 6, Y - 1, X + 17, Y - 9], glow: [X + 20, Y - 11], plume: 2,
      bits: [a(X + 23, Y - 12, W), a(X + 24, Y - 9, C), a(X + 21, Y - 15, G), a(X + 25, Y - 13, G), a(X + 18, Y - 6, C), a(X + 12, Y - 2, G), a(X + 9, Y, C)] })];
  /* RADIANCE+ (4 pips, the empowered burst): the hammer lifted high in both hands over a bowed helm, a second ring of light standing about the head of it; then the helm thrown right back, the double ring of
     spokes out to a wider radius with a halo over the head and a glint on the plate; then the settle, a green mote (the mend) rising off the chest */
  F.radiancePlus = [K({ dy: -1, hy: 1, sho: 1, legs: 'wide', arm: [X, Y, X + 2, Y - 6], arm2: [OFF[0], OFF[1], X + 1, Y - 5], maul: [X + 2, Y - 5, X + 3, Y - 17], glow: [X + 3, Y - 20], plume: 2, bits: [...sunAt(X + 3, Y - 20, 5), a(X + 3, Y - 26, C)] }),
    K({ dy: -2, hy: -1, sho: 1, legs: 'wide', arm: [X, Y, X + 2, Y - 4], arm2: [OFF[0], OFF[1], X + 1, Y - 3], maul: [X + 2, Y + 1, X + 3, Y - 14], glow: [X + 3, Y - 18], plume: 2, bits: [...sunAt(X + 1, Y + 2, 10), ...sunAt(X + 1, Y + 2, 15, 12, 0.26), ...halo4(X + 1, Y - 12, 6, 0), a(X - 4, Y - 6, W), a(X + 7, Y - 5, W)] }),
    K({ legs: 'wide', arm: [X, Y, X + 3, Y], arm2: [OFF[0], OFF[1], X + 2, Y + 1], maul: [X + 3, Y + 4, X + 4, Y - 8], plume: 1, bits: [a(X - 7, Y + 2, G), a(X + 11, Y + 2, C), a(X - 3, Y - 2, '#8fd160'), a(X + 3, Y - 6, '#8fd160'), a(X + 7, Y - 1, '#8fd160'), a(X - 4, Y + 6, D), a(X + 10, Y + 6, D)] })];
  /* JUDGED (the Verdict at five pips): the hammer's head brought level like a gavel with a crown of light standing over it and a pair of scales hung above (a bar, two pans), light leaving it in a wider fan;
     then the long recover with the scales still ringing */
  const scales = (cx, cy) => [...ln(cx - 6, cy, cx + 6, cy, G), a(cx, cy - 1, W), a(cx, cy - 2, C), ...ln(cx - 6, cy + 1, cx - 6, cy + 3, C), ...ln(cx + 6, cy + 1, cx + 6, cy + 3, C), ...ln(cx - 8, cy + 4, cx - 4, cy + 4, G), ...ln(cx + 4, cy + 4, cx + 8, cy + 4, G)];
  F.vRelJ = [K({ wide: 8, dx: 1, dy: 1, legs: 'wide', sho: 1, arm: [X, Y, X + 5, Y - 4], arm2: [OFF[0], OFF[1], X + 4, Y - 2], maul: [X + 5, Y - 4, X + 15, Y + 2], glow: [X + 18, Y + 3], plume: 2,
      bits: [...halo4(X + 11, Y - 13, 7, 0), ...scales(X + 11, Y - 18), a(X + 19, Y + 6, W), a(X + 19, Y + 9, C), a(X + 19, Y + 12, G), a(X + 21, Y + 5, G), a(X + 21, Y + 11, C), a(X + 16, Y + 8, G), a(X + 23, Y + 8, C)] }),
    K({ dx: 1, dy: 1, legs: 'wide', arm: [X, Y, X + 3, Y + 1], arm2: [OFF[0], OFF[1], X + 2, Y + 2], maul: [X + 3, Y + 1, X + 5, Y + 9], plume: 1, bits: [...scales(X + 6, Y - 14).filter((_, j) => j % 2 === 0), a(X + 9, Y + 9, G), a(X + 11, Y + 7, C)] })];
  /* SPEAR OF LIGHT: LANCE DRAW (the 0.5 s told wind-up, two beats) - the strong hand reaching up and back over the shoulder and a spear of light FORMING in it: a short gold shaft and a spark of a head, the
     off hand out ahead sighting; then the full spear drawn back level behind his ear, long, white at the head, the stance wide and low. LANCE THROW - the arm flung forward and the weight
     behind it, the spear gone and its first streak still standing before the hand; then the follow-through, arm out and a bar of light fading */
  F.lanceDraw = [K({ dx: -1, legs: 'wide', arm: [X, Y, X - 3, Y - 5], arm2: [OFF[0], OFF[1], X + 5, Y - 1], maul: rest(), plume: 1, bits: [...ln(X - 4, Y - 7, X + 3, Y - 10, G), a(X + 4, Y - 10, W), a(X + 5, Y - 11, C), a(X - 5, Y - 8, C)] }),
    K({ dx: -2, dy: 1, legs: 'wide', sho: 1, arm: [X, Y, X - 4, Y - 4], arm2: [OFF[0], OFF[1], X + 5, Y - 2], maul: rest(), plume: 2, bits: [...ln(X - 12, Y - 5, X + 4, Y - 9, G), ...ln(X - 11, Y - 5, X + 3, Y - 8, C, 2), a(X + 5, Y - 9, W), a(X + 6, Y - 9, W), a(X + 4, Y - 11, C), a(X + 4, Y - 7, C), a(X + 7, Y - 9, G), a(X - 13, Y - 4, G), a(X - 3, Y - 12, G)] })];
  F.lanceThrow = [K({ wide: 8, dx: 3, legs: 'runC', sho: 1, arm: [X, Y, X + 6, Y - 3], arm2: [OFF[0], OFF[1], X + 1, Y + 1], maul: rest(), plume: 2, bits: [...ln(X + 7, Y - 4, X + 17, Y - 5, C, 2), a(X + 18, Y - 5, W), a(X + 19, Y - 5, G)] }),
    K({ wide: 4, dx: 2, dy: 1, legs: 'wide', arm: [X, Y, X + 5, Y - 2], arm2: [OFF[0], OFF[1], X + 2, Y + 1], maul: rest(), plume: 1, bits: [a(X + 8, Y - 3, G), a(X + 11, Y - 3, C), a(X + 14, Y - 3, G)] })];
  riposteKit(F, 'paladin', K, { X, Y, OFF });
}
/* EVERY ABILITY HAS A BODY: THE FREEBOOTER'S BOUGHT ACTIVES (lane P, 2026-09-24). THE BLACK SPOT and KEELHAUL played beside an idle
   freebooter; GRAPESHOT and BROADSIDE shared the one pistol shot, and RUM and BOARDING PARTY the grapnel cast. Each now has frames
   of its own on his rig; OFF is the off shoulder, a() puts a loose pixel at an absolute point, and the frames carry the headroom. */
function pirateKitPoses(F, sh, holster, carry) {
  const top = ATTACK_HEADROOM, [X, Y] = sh, OFF = [BX + 2, BY + 7], K = o => knightFrame({ top, ...o });
  const a = (x, y, col) => [x - BX, y - BY, col], INK = '#1a1620', RED = '#ff6b6b', SMOKE = '#9aa39a', PALE = '#d8dcd0', G = '#ffd36b', W = '#fff6c8';
  /* THE BLACK SPOT: the cutlass point levelled at the one he means; the spot on the end of it, his chin up; and the blade brought
     back up in front of his face, a salute to a dead man */
  F.spot = [K({ wide: 6, legs: 'wide', arm: [X, Y, X + 5, Y - 2], cutlass: [X + 5, Y - 2, X + 16, Y - 4], pistol: holster(), plume: 1 }),
    K({ wide: 6, legs: 'wide', hy: -1, arm: [X, Y, X + 5, Y - 2], cutlass: [X + 5, Y - 2, X + 16, Y - 4], pistol: holster(), plume: 2,
      bits: [a(X + 17, Y - 6, INK), a(X + 18, Y - 6, INK), a(X + 17, Y - 5, INK), a(X + 18, Y - 5, INK), a(X + 16, Y - 7, RED), a(X + 19, Y - 7, RED), a(X + 16, Y - 4, RED), a(X + 19, Y - 4, RED)] }),
    K({ legs: 'stand', arm: [X, Y, X + 2, Y - 2], cutlass: [X + 2, Y - 2, X + 3, Y - 12], pistol: holster(), plume: 0 })];
  /* KEELHAUL: the grapnel flung out flat along the deck at him; the line hauled in hand over hand, leaning back on it; and the
     whole catch heaved over his shoulder behind him */
  F.haul = [K({ wide: 14, dx: 1, legs: 'runC', arm: [X, Y, X + 5, Y - 2], hook: [X + 5, Y - 2, X + 26, Y - 3], cutlass: carry(), pistol: holster(), plume: 2 }),
    K({ wide: 6, dx: -2, legs: 'wide', sho: 1, arm: [X, Y, X - 1, Y + 1], arm2: [OFF[0], OFF[1], X + 4, Y - 1], hook: [X - 1, Y + 1, X + 14, Y + 1], cutlass: carry(1), pistol: holster(), plume: 1 }),
    K({ dx: -1, legs: 'wide', hy: 1, arm: [X, Y, X - 3, Y - 4], arm2: [OFF[0], OFF[1], X - 4, Y - 3], hook: [X - 3, Y - 4, X - 11, Y - 9], cutlass: carry(1), pistol: holster(), plume: 2 })];
  /* GRAPESHOT: the pistol snapped off from the hip, low, the smoke thrown out of the muzzle; then the kick of it throwing the barrel up */
  F.grape = [K({ wide: 4, legs: 'wide', arm: [X, Y, X + 4, Y + 3], pistol: [X + 4, Y + 3, X + 11, Y + 2], cutlass: carry(), plume: 1,
      bits: [a(X + 12, Y + 2, W), a(X + 13, Y + 1, G), a(X + 13, Y + 3, G), a(X + 14, Y + 2, SMOKE), a(X + 15, Y + 1, PALE)] }),
    K({ wide: 4, dx: -1, legs: 'wide', arm: [X, Y, X + 3, Y + 1], pistol: [X + 3, Y + 1, X + 9, Y - 3], cutlass: carry(), plume: 2,
      bits: [a(X + 11, Y - 3, SMOKE), a(X + 12, Y - 2, PALE), a(X + 13, Y - 4, SMOKE)] })];
  /* BROADSIDE: set low and square with the pistol out in both hands, the whole charge going off at once; then thrown back off his
     feet by it, arms up, the barrel at the sky */
  F.broad = [K({ wide: 6, dy: 2, legs: 'wide', arm: [X, Y, X + 5, Y - 1], arm2: [OFF[0], OFF[1], X + 4, Y], pistol: [X + 5, Y - 1, X + 12, Y - 1], cutlass: carry(), plume: 2,
      bits: [a(X + 14, Y - 1, '#ffffff'), a(X + 15, Y - 1, W), a(X + 14, Y - 2, G), a(X + 14, Y, G), a(X + 16, Y - 1, '#ff9a5c'), a(X + 15, Y - 3, G), a(X + 15, Y + 1, G)] }),
    K({ dx: -3, legs: 'fall', hy: -1, arm: [X, Y, X + 1, Y - 6], arm2: [OFF[0], OFF[1], OFF[0] - 2, OFF[1] - 5], pistol: [X + 1, Y - 6, X + 4, Y - 12], cutlass: carry(), plume: 2,
      bits: [a(X + 7, Y - 2, SMOKE), a(X + 9, Y - 3, PALE), a(X + 8, Y, SMOKE), a(X + 11, Y - 1, PALE)] })];
  /* RUM: the bottle brought up in the off hand; tipped up with his head back and a drop going; and the back of the hand wiped
     across his mouth, the bottle gone back in the coat */
  const B1 = '#3f7a44', B2 = '#b8f0a0', CORK = '#e8dcc0';   /* green glass: brown went into his coat */
  F.rum = [K({ legs: 'stand', arm2: [OFF[0], OFF[1], X - 1, Y - 2], cutlass: [X + 1, Y + 2, X + 7, Y + 7], pistol: holster(), plume: 0,
      bits: [a(X - 1, Y - 3, B1), a(X, Y - 3, B1), a(X - 1, Y - 4, B2), a(X, Y - 4, B1), a(X - 1, Y - 5, B1), a(X - 1, Y - 6, CORK)] }),
    K({ legs: 'stand', hy: -1, sho: 1, arm2: [OFF[0], OFF[1], X - 2, Y - 5], cutlass: [X + 1, Y + 2, X + 7, Y + 7], pistol: holster(), plume: 1,
      bits: [a(X - 3, Y - 7, B1), a(X - 2, Y - 7, B1), a(X - 3, Y - 6, B2), a(X - 2, Y - 6, B1), a(X - 1, Y - 5, B1), a(X, Y - 4, B1), a(X + 1, Y - 3, B2)] }),
    K({ legs: 'stand', arm2: [OFF[0], OFF[1], X + 1, Y - 3], cutlass: [X + 1, Y + 2, X + 7, Y + 7], pistol: holster(), plume: 2 })];
  /* BOARDING PARTY: the grapnel flung high ahead off the off hand; then swung in on the line, knees drawn up, the cutlass out in
     front for whoever is standing where he comes down */
  F.board = [K({ wide: 8, legs: 'jump', dy: -1, arm2: [OFF[0], OFF[1], X + 2, Y - 7], hook: [X + 2, Y - 7, X + 14, Y - 22], cutlass: carry(), pistol: holster(), plume: 2 }),
    K({ wide: 8, dx: 1, legs: 'tuck', arm2: [OFF[0], OFF[1], X - 1, Y - 8], hook: [X - 1, Y - 8, X + 2, Y - 24], arm: [X, Y, X + 5, Y - 1], cutlass: [X + 5, Y - 1, X + 15, Y - 2], pistol: holster(), plume: 2 })];
  /* THE LATE ACTIVES' OWN POSES (claude/heroposes). POWDER KEG: down on his heels with the little cask held low in both hands and the fuse
     lit; then the underhand lob with the cask up and away trailing a spark; and the follow-through, empty-handed, one hand up to shade his eyes */
  const BR = '#7a4a24', BD = '#4a2c14', BB = '#c9b27c', FY = '#ffd36b', FR = '#ff6b3c';
  const keg = (x, y) => [a(x, y, BR), a(x + 1, y, BR), a(x + 2, y, BR), a(x + 3, y, BR), a(x, y + 1, BB), a(x + 1, y + 1, BB), a(x + 2, y + 1, BB), a(x + 3, y + 1, BB), a(x, y + 2, BR), a(x + 1, y + 2, BD), a(x + 2, y + 2, BD), a(x + 3, y + 2, BR),
    a(x, y + 3, BB), a(x + 1, y + 3, BB), a(x + 2, y + 3, BB), a(x + 3, y + 3, BB), a(x, y + 4, BR), a(x + 1, y + 4, BR), a(x + 2, y + 4, BR), a(x + 3, y + 4, BR), a(x + 2, y - 1, BD), a(x + 3, y - 2, FY), a(x + 4, y - 3, FR)];
  F.keg = [K({ dy: 3, legs: 'crouch', legsDy: 2, arm: [X, Y, X + 4, Y + 4], arm2: [OFF[0], OFF[1], X + 3, Y + 5], cutlass: carry(), pistol: holster(), plume: 1, bits: keg(X + 4, Y + 3) }),
    K({ wide: 10, dx: 2, legs: 'runC', arm: [X, Y, X + 6, Y - 6], arm2: [OFF[0], OFF[1], X + 4, Y - 4], cutlass: carry(), pistol: holster(), plume: 2, bits: [...keg(X + 11, Y - 12), a(X + 8, Y - 8, FY), a(X + 6, Y - 6, FR)] }),
    K({ dx: 1, legs: 'wide', arm: [X, Y, X + 3, Y - 4], arm2: [OFF[0], OFF[1], OFF[0] + 1, OFF[1] + 2], cutlass: carry(), pistol: holster(), plume: 0, bits: [a(X + 5, Y - 6, FY), a(X + 4, Y - 7, FR)] })];
  /* HEAVY SEAS: the cutlass taken back over his shoulder, bracing; then swept low and out in front of him and the sea standing up in a wall
     off the point of it, spray flying; and the wave rolling on, him leaning after it */
  const SEA = '#3f8fc0', FOAM = '#e8f6ff', SPR = '#9fd8f0';
  const sea = (x0, h) => { const o = []; for (let i = 0; i < 4; i++) { const cx = x0 + i * 4, ch = Math.max(2, h - (i === 3 ? 4 : i === 2 ? 1 : 0)); for (let j = 0; j < ch; j++) o.push(a(cx, Y + 9 - j, j >= ch - 1 ? FOAM : SEA), a(cx + 1, Y + 9 - j, j >= ch - 2 ? SPR : SEA)); } return o; };
  F.seas = [K({ wide: 2, dx: -2, dy: 1, legs: 'wide', arm: [X, Y, X - 3, Y - 4], cutlass: [X - 3, Y - 4, X - 11, Y - 12], pistol: holster(), plume: 2 }),
    K({ wide: 22, dx: 2, dy: 2, legs: 'wide', sho: 1, arm: [X, Y, X + 6, Y + 3], cutlass: [X + 6, Y + 3, X + 17, Y + 7], pistol: holster(), plume: 1, bits: [...sea(X + 9, 4), a(X + 12, Y - 1, SPR), a(X + 18, Y - 2, FOAM), a(X + 15, Y - 4, SPR)] }),
    K({ wide: 24, dx: 3, dy: 1, legs: 'runC', arm: [X, Y, X + 5, Y + 1], cutlass: [X + 5, Y + 1, X + 13, Y + 4], pistol: holster(), plume: 2, bits: [...sea(X + 12, 6), a(X + 16, Y - 3, FOAM), a(X + 22, Y - 1, SPR), a(X + 20, Y - 5, FOAM)] })];
  /* BOARDING (B16, claude/plunges - his plunge has its OWN windup, ride and leap). The windup: the cutlass reversed point-down in his fist over his head, the other hand reaching ahead for a collar; then the
     drop, knees up, the blade plumb under him. The RIDE (boardRide, a rocking cycle): crouched on a back, one fist in its collar, the cutlass thrown high behind him for balance. The LEAP (boardLeap): the heel
     kicked off it and a hand pushing down on its shoulder; then both arms flung up with the cutlass overhead - the second jump. */
  F.boardFall = [K({ wide: 4, dy: -1, sho: 1, hy: -1, legs: 'jump2', arm: [X, Y, X + 3, Y - 7], cutlass: [X + 3, Y - 7, X + 3, Y - 17], arm2: [OFF[0], OFF[1], X + 7, Y - 4], pistol: holster(), plume: 2 }),
    K({ wide: 4, legs: 'tuck', hy: 1, arm: [X, Y, X, Y + 2], cutlass: [X, Y + 2, X, Y + 15], arm2: [OFF[0], OFF[1], X + 6, Y + 3], pistol: holster(), plume: 2, bits: [a(X - 5, Y - 4, SMOKE), a(X + 4, Y - 7, PALE)] })];
  F.boardRide = [K({ wide: 4, dy: 5, legs: 'crouch', legsDy: 4, arm: [X, Y, X + 5, Y + 6], arm2: [OFF[0], OFF[1], X + 4, Y + 7], cutlass: [X - 1, Y - 4, X - 4, Y - 16], pistol: holster(), plume: 1 }),
    K({ wide: 4, dy: 4, legs: 'crouch', legsDy: 4, hy: -1, arm: [X, Y, X + 5, Y + 5], arm2: [OFF[0], OFF[1], X + 4, Y + 6], cutlass: [X, Y - 4, X - 2, Y - 17], pistol: holster(), plume: 2 })];
  F.boardLeap = [K({ wide: 4, dx: 1, dy: 2, legs: 'tuck', arm: [X, Y, X + 3, Y + 7], cutlass: [X - 1, Y - 2, X - 5, Y - 12], pistol: holster(), plume: 1 }),
    K({ wide: 4, dy: -2, sho: 1, hy: -1, legs: 'jump2', arm: [X, Y, X + 2, Y - 9], arm2: [OFF[0], OFF[1], X - 2, Y - 8], cutlass: [X + 2, Y - 9, X + 6, Y - 20], pistol: holster(), plume: 2, bits: [a(X - 3, Y + 12, PALE), a(X + 5, Y + 13, PALE)] })];
  /* ==== HERO PASS A ART (claude/heropassaart): the POWDER FLASH. FLING - down on one heel with the flask of black powder dashed at the floor under him and the fuse lit; FLASH - he is a hunched shape in the roll inside a
     white-hot burst, the black smoke standing up off it; OUT - up and through the smoke at a run with the grit still in the air behind him ==== */
  const FLASK = '#3a2a22', GRIT = '#2a2630', FLASHW = '#ffffff', FLASHY = '#ffd36b', FLASHO = '#ff9a5c';
  const burst = (cx, cy, r) => { const o = []; for (let k = 0; k < 12; k++) { const an = k / 12 * Math.PI * 2; for (const rr of [r - 2, r]) o.push(a(Math.round(cx + Math.cos(an) * rr), Math.round(cy + Math.sin(an) * rr * 0.8), rr === r ? (k & 1 ? FLASHO : FLASHY) : FLASHW)); } return o; };
  F.powder = [K({ wide: 4, dx: 1, dy: 2, legs: 'wide', arm: [X, Y, X + 4, Y + 6], cutlass: carry(), pistol: holster(), plume: 1, bits: [a(X + 5, Y + 8, FLASK), a(X + 6, Y + 8, FLASK), a(X + 5, Y + 9, FLASK), a(X + 7, Y + 7, FLASHY), a(X + 8, Y + 6, FLASHW)] }),
    K({ wide: 6, dx: 1, dy: 4, hy: 2, legs: 'crouch', legsDy: 3, arm: [X, Y, X + 2, Y + 6], cutlass: carry(), plume: 2, bits: [...burst(X + 4, Y + 7, 6), a(X + 4, Y + 7, FLASHW), a(X + 5, Y + 7, FLASHW), a(X + 3, Y + 7, FLASHW), a(X + 4, Y + 6, FLASHW), a(X + 4, Y + 8, FLASHW), a(X + 3, Y - 2, SMOKE), a(X + 4, Y - 3, GRIT), a(X + 6, Y - 3, SMOKE), a(X + 5, Y - 5, PALE)] }),
    K({ wide: 6, dx: 2, dy: 1, sho: 1, legs: 'runC', arm: [X, Y, X + 3, Y + 3], cutlass: carry(), plume: 2, bits: [a(X - 6, Y + 2, GRIT), a(X - 7, Y + 3, SMOKE), a(X - 9, Y + 1, GRIT), a(X - 8, Y + 6, SMOKE), a(X - 10, Y + 5, PALE), a(X - 5, Y - 3, SMOKE), a(X - 7, Y - 4, GRIT), a(X - 3, Y + 9, GRIT), a(X - 12, Y + 3, SMOKE)] })];
  riposteKit(F, 'pirate', K, { X, Y, OFF, holster });
}
/* EVERY ABILITY HAS A BODY: THE DEATH KNIGHT'S BOUGHT ACTIVES (lane P, 2026-09-24). BLOOD WELL and THE RED CALL played beside an idle
   death knight, and CRIMSON TIDE, RED GROUND, BLOOD LEECH and BLOOD CHAIN all shared the one RAISE cast with SUMMON THRALL - which
   keeps it, because the free hand down and the green coming up out of the ground is exactly what raising one is. The other five
   now have frames of their own on his rig; OFF is the off shoulder, and a() puts a loose pixel at an absolute point. */
function reaperKitPoses(F, sh) {
  const top = ATTACK_HEADROOM, [X, Y] = sh, OFF = [BX + 2, BY + 7], K = o => knightFrame({ top, ...o });
  const a = (x, y, col) => [x - BX, y - BY, col], RED = '#c0283a', PINK = '#ff6b6b', GRN = '#ff4a5a', DGRN = '#7a1020', LIT = '#ffd0d0', BONE = '#c9a8b0';
  const lit = [[4, 3, LIT], [5, 3, LIT]];   /* the two lights in the helm, up bright */
  const low = [X - 3, Y + 3, X + 12, Y + 6];   /* the long blade held low across him, as he breathes (the idle's own guard) */
  /* BLOOD WELL: hunched over the blade stood point-down before him, both hands on it; flung open with the blade out wide and the
     blood coming up off him every way; and the settle back to guard */
  F.boil = [K({ dy: 2, hy: 1, legs: 'wide', arm: [X, Y, X + 2, Y - 1], arm2: [OFF[0], OFF[1], X + 1, Y - 1], greatsword: [X + 2, Y - 1, X + 3, Y + 12], plume: 0, bits: [a(X - 2, Y + 7, RED), a(X + 5, Y + 7, RED)] }),
    K({ wide: 6, dy: -1, sho: 1, legs: 'wide', arm: [X, Y, X + 5, Y - 3], greatsword: [X + 5, Y - 3, X + 17, Y - 9], arm2: [OFF[0], OFF[1], OFF[0] - 5, OFF[1] - 4], plume: 2,
      bits: [...lit, a(X - 13, Y - 8, RED), a(X - 10, Y - 12, PINK), a(X - 15, Y - 1, PINK), a(X - 12, Y + 6, RED), a(X + 9, Y + 4, PINK), a(X + 12, Y + 1, RED), a(X - 4, Y - 14, RED), a(X + 3, Y - 13, PINK), a(X - 9, Y + 7, PINK), a(X + 6, Y + 7, RED)] }),
    K({ dy: 1, legs: 'stand', arm: [X, Y, X - 1, Y + 3], greatsword: low, plume: 1, bits: [a(X - 8, Y + 6, RED), a(X + 7, Y + 6, RED)] })];
  /* BLOODWORMS (claude/bkkit2; it was THE RED CALL): the blade driven into the ground beside him; the off hand raised with the blood in it, the lights in the helm up;
     and the green coming up out of the ground on both sides of him */
  const stood = { arm: [X, Y, X + 3, Y - 1], greatsword: [X + 3, Y - 2, X + 4, Y + 13] };
  const flame = [a(OFF[0] - 3, OFF[1] - 11, GRN), a(OFF[0] - 4, OFF[1] - 10, GRN), a(OFF[0] - 2, OFF[1] - 10, GRN), a(OFF[0] - 3, OFF[1] - 12, LIT)];
  F.call = [K({ legs: 'wide', ...stood, arm2: [OFF[0], OFF[1], OFF[0] - 1, OFF[1] + 3], plume: 1 }),
    K({ legs: 'wide', hy: -1, ...stood, arm2: [OFF[0], OFF[1], OFF[0] - 3, OFF[1] - 9], plume: 2, bits: [...lit, ...flame] }),
    K({ legs: 'wide', hy: -1, ...stood, arm2: [OFF[0], OFF[1], OFF[0] - 3, OFF[1] - 9], plume: 0,
      bits: [...lit, ...flame, a(X - 14, Y + 8, GRN), a(X - 11, Y + 7, DGRN), a(X - 13, Y + 5, GRN), a(X + 9, Y + 8, GRN), a(X + 12, Y + 7, DGRN), a(X + 10, Y + 5, GRN), a(X - 16, Y + 6, LIT), a(X + 13, Y + 4, LIT)] })];
  /* BLOOD LEECH: the off hand drawn back with the knot of blood in it; then flung out past him, and the coil gone off the fingers */
  F.coil = [K({ dx: -1, legs: 'wide', arm: [X, Y, X - 1, Y + 3], greatsword: low, arm2: [OFF[0], OFF[1], OFF[0] - 5, OFF[1] - 1], plume: 1,
      bits: [a(OFF[0] - 6, OFF[1] - 2, RED), a(OFF[0] - 7, OFF[1] - 1, PINK), a(OFF[0] - 6, OFF[1], RED)] }),
    K({ wide: 4, dx: 1, legs: 'runC', arm: [X, Y, X - 1, Y + 3], greatsword: low, arm2: [OFF[0], OFF[1], X + 7, Y - 2], plume: 2,
      bits: [a(X + 10, Y - 3, RED), a(X + 11, Y - 2, PINK), a(X + 12, Y - 3, RED), a(X + 11, Y - 4, PINK)] })];
  /* CRIMSON TIDE: down on his haunches with the fist raised; then the fist driven into the ground before him, and the green running
     off along it the way the hands will come up */
  F.tide = [K({ dy: 4, legs: 'crouch', legsDy: 3, arm: [X, Y, X - 2, Y + 2], greatsword: [X - 2, Y + 2, X - 14, Y - 3], arm2: [OFF[0], OFF[1], X + 3, Y - 6], plume: 1, bits: [a(X + 3, Y - 7, BONE)] }),
    K({ wide: 6, dy: 4, legs: 'crouch', legsDy: 3, arm: [X, Y, X - 2, Y + 2], greatsword: [X - 2, Y + 2, X - 14, Y - 3], arm2: [OFF[0], OFF[1], X + 5, Y + 4], plume: 2,
      bits: [...lit, a(X + 5, Y + 5, BONE), a(X + 9, Y + 4, GRN), a(X + 12, Y + 4, DGRN), a(X + 15, Y + 4, GRN), a(X + 18, Y + 4, DGRN), a(X + 7, Y + 3, LIT), a(X + 13, Y + 3, GRN)] })];
  /* RED GROUND: the blade taken low and back behind him in both hands; then swept flat along the floor ahead, the green left
     on the ground where the edge went */
  F.unholy = [K({ dx: -1, dy: 1, legs: 'wide', arm: [X, Y, X - 3, Y + 3], arm2: [OFF[0], OFF[1], X - 4, Y + 3], greatsword: [X - 4, Y + 3, X - 17, Y + 7], plume: 1 }),
    K({ wide: 10, dx: 2, dy: 2, legs: 'runC', arm: [X, Y, X + 4, Y + 3], arm2: [OFF[0], OFF[1], X + 3, Y + 3], greatsword: [X + 4, Y + 3, X + 21, Y + 6], plume: 2,
      bits: [a(X + 8, Y + 7, GRN), a(X + 12, Y + 7, DGRN), a(X + 16, Y + 7, GRN), a(X + 20, Y + 7, DGRN), a(X + 4, Y + 7, DGRN), a(X + 10, Y + 6, LIT)] })];
  /* BLOOD CHAIN: the off hand thrown out ahead, clawed, with the green off the fingers; then the fist hauled back in to his chest,
     the green line coming with it */
  F.grip = [K({ wide: 4, dx: 1, legs: 'wide', arm: [X, Y, X - 1, Y + 3], greatsword: low, arm2: [OFF[0], OFF[1], X + 8, Y - 2], plume: 2,
      bits: [a(X + 9, Y - 3, BONE), a(X + 10, Y - 2, BONE), a(X + 9, Y - 1, BONE), a(X + 11, Y - 2, GRN), a(X + 12, Y - 3, LIT)] }),
    K({ dx: -1, sho: 1, legs: 'wide', arm: [X, Y, X - 1, Y + 3], greatsword: low, arm2: [OFF[0], OFF[1], X - 1, Y - 1], plume: 1,
      bits: [...lit, a(X - 1, Y - 1, BONE), a(X + 3, Y - 1, GRN), a(X + 6, Y - 1, DGRN), a(X + 9, Y - 1, GRN)] })];
  /* (claude/bkkit2) THE RED HOST'S OWN BODIES. BLOOD BOLT: the blade held low across him and the off palm drawn along its edge, the blood welling in the hand;
     then the palm flung out flat at chest height, leaning into it, the bolt leaving the fingers with a wet streak behind it */
  F.bkBolt = [K({ dy: 1, legs: 'wide', arm: [X, Y, X + 1, Y + 3], greatsword: [X + 1, Y + 3, X + 15, Y + 1], arm2: [OFF[0], OFF[1], X + 5, Y + 2], plume: 1,
      bits: [a(X + 6, Y + 2, RED), a(X + 7, Y + 2, PINK), a(X + 6, Y + 4, DGRN), a(X + 9, Y + 2, RED)] }),
    K({ wide: 6, dx: 2, legs: 'runC', sho: 1, arm: [X, Y, X - 1, Y + 3], greatsword: low, arm2: [OFF[0], OFF[1], X + 9, Y - 5], plume: 2,
      bits: [...lit, a(X + 11, Y - 6, PINK), a(X + 12, Y - 5, LIT), a(X + 13, Y - 6, RED), a(X + 10, Y - 4, DGRN), a(X + 15, Y - 6, RED), a(X + 18, Y - 5, PINK)] })];
  /* DRAIN: the off hand thrown out high and clawed at the foe, the fingers wet; then back on his heels with the fist closed at his chest, the blood coming
     in to it in a line of beads; and held there, the helm lights up as it fills him */
  const bead = (n, c0) => Array.from({ length: n }, (_, i) => a(X + 8 + i * 3, Y - 3 + (i & 1), i % 2 ? c0 : RED));
  F.bkDrain = [K({ wide: 4, dx: 1, dy: -1, legs: 'wide', arm: [X, Y, X - 2, Y + 3], greatsword: low, arm2: [OFF[0], OFF[1], X + 9, Y - 7], plume: 2,
      bits: [a(X + 10, Y - 8, RED), a(X + 11, Y - 7, PINK), a(X + 10, Y - 6, RED), a(X + 9, Y - 9, DGRN)] }),
    K({ dx: -2, sho: 1, legs: 'wide', arm: [X, Y, X - 2, Y + 3], greatsword: low, arm2: [OFF[0], OFF[1], X + 5, Y - 3], plume: 1, bits: [a(X + 6, Y - 3, PINK), ...bead(4, PINK)] }),
    K({ dx: -2, sho: 1, hy: -1, legs: 'wide', arm: [X, Y, X - 2, Y + 3], greatsword: low, arm2: [OFF[0], OFF[1], X + 5, Y - 3], plume: 2, bits: [...lit, a(X + 6, Y - 3, LIT), a(X + 5, Y - 4, RED), ...bead(5, LIT)] })];
  /* THE LATE ACTIVES' OWN POSES (claude/heroposes). OSSUARY MAIL: both arms crossed hard over his chest on the flat of the blade; then the
     head back and the lights up while plates of bone close over the shoulders, ribs and arms; and the last plate seated, the blade low */
  const PLATE = '#b02238';
  const plateA = [a(X - 1, Y - 5, PLATE), a(X, Y - 6, PLATE), a(X + 1, Y - 6, PLATE), a(X - 2, Y - 4, PLATE), a(X - 9, Y - 5, PLATE), a(X - 8, Y - 6, PLATE), a(X - 7, Y - 6, PLATE), a(X - 10, Y - 4, PLATE)];
  const plateB = [a(X - 6, Y - 1, PLATE), a(X - 3, Y - 1, PLATE), a(X - 5, Y + 1, PLATE), a(X - 4, Y + 3, PLATE), a(X - 6, Y + 5, PLATE), a(X - 3, Y + 5, PLATE), a(X - 2, Y + 8, PLATE), a(X - 7, Y + 8, PLATE)];
  F.bone = [K({ dy: 1, legs: 'wide', arm: [X, Y, X - 6, Y - 1], arm2: [OFF[0], OFF[1], X - 2, Y], greatsword: [X - 12, Y - 3, X + 8, Y + 1], plume: 0, bits: [a(X - 14, Y + 6, PLATE), a(X + 11, Y + 5, PLATE), a(X - 10, Y + 12, GRN)] }),
    K({ hy: -1, sho: 1, dy: -1, legs: 'wide', arm: [X, Y, X + 4, Y - 3], arm2: [OFF[0], OFF[1], OFF[0] - 4, OFF[1] - 4], greatsword: [X + 4, Y - 3, X + 5, Y + 11], plume: 2, bits: [...lit, ...plateA, ...plateB, a(X - 13, Y - 10, GRN), a(X + 12, Y - 8, PLATE), a(X + 11, Y + 6, GRN)] }),
    K({ legs: 'stand', arm: [X, Y, X - 1, Y + 3], greatsword: low, plume: 1, bits: [...plateA.slice(0, 4), ...plateB.slice(0, 4), a(X - 6, Y - 6, LIT)] })];
  /* THE REAPING: the blade drawn back behind him to the hilt and the off hand open; the great scything cut swung clean across ahead of
     him, a pale-green crescent standing where it passed; and the off hand drawing the soul back in to his chest, the lights flaring */
  const ARC = [a(X + 7, Y - 12, LIT), a(X + 11, Y - 8, GRN), a(X + 13, Y - 3, LIT), a(X + 13, Y + 2, GRN), a(X + 11, Y + 7, DGRN), a(X + 8, Y + 11, GRN), a(X + 15, Y - 5, GRN), a(X + 16, Y + 1, DGRN)];
  F.reap = [K({ dx: -1, legs: 'wide', arm: [X, Y, X - 4, Y - 5], arm2: [OFF[0], OFF[1], OFF[0] - 5, OFF[1] - 1], greatsword: [X - 4, Y - 5, X - 16, Y - 15], plume: 1 }),
    K({ wide: 12, dx: 3, dy: 1, legs: 'runC', arm: [X, Y, X + 6, Y - 2], arm2: [OFF[0], OFF[1], X + 4, Y - 1], greatsword: [X + 6, Y - 2, X + 20, Y + 9], plume: 2, bits: ARC }),
    K({ dx: -1, hy: -1, sho: 1, legs: 'wide', arm: [X, Y, X - 1, Y + 3], greatsword: low, arm2: [OFF[0], OFF[1], X + 2, Y - 2], plume: 2, bits: [...lit, a(X + 4, Y - 4, LIT), a(X + 6, Y - 6, GRN), a(X + 8, Y - 9, DGRN), a(X + 3, Y - 3, GRN)] })];
  /* ==== HERO PASS A ART (claude/heropassaart): the SHADOW-STEP (now the BLOOD STEP, claude/bloodstep: crimson mist). UNMOOR - his edges coming away into shade at the feet and the lights in the helm flaring, the blade hauled low behind him; STEP - flat, long and gone forward
     with the blade trailing a dozen pixels and the shade he leaves a dark ribbon down his back; REFORM - the shade falling off him as he comes together, the green flick in the helm ==== */
  const SHADE = '#a01a2c', SHADE2 = '#6a1020', SHADEG = '#ff6b6b';   /* (claude/bloodstep) the BLOOD STEP: crimson mist, not shade */
  F.shadowStep = [K({ wide: 4, dx: -1, legs: 'wide', arm: [X, Y, X - 3, Y + 3], arm2: [OFF[0], OFF[1], X - 4, Y + 3], greatsword: [X - 4, Y + 4, X - 17, Y + 8], plume: 1, bits: [...lit, a(X - 2, Y + 14, SHADE), a(X, Y + 15, SHADE2), a(X + 3, Y + 14, SHADE), a(X - 5, Y + 12, SHADE2), a(X + 6, Y + 15, SHADE2)] }),
    K({ wide: 10, dx: 4, dy: 2, legs: 'runC', sho: 1, arm: [X, Y, X + 3, Y + 4], arm2: [OFF[0], OFF[1], X + 2, Y + 4], greatsword: [X - 2, Y + 5, X - 22, Y + 9], plume: 2, bits: [...lit, ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => a(X - 6 - i, Y + 1 + (i >> 1), i % 3 ? SHADE : SHADE2)), ...[0, 1, 2, 3, 4, 5].map(i => a(X - 5 - i, Y + 9 - (i >> 1), SHADE2)), a(X - 14, Y + 4, SHADEG), a(X - 17, Y + 6, SHADEG), a(X - 12, Y + 12, SHADE)] }),
    K({ wide: 6, dx: 2, dy: 1, legs: 'wide', sho: 1, arm: [X, Y, X + 1, Y + 3], arm2: [OFF[0], OFF[1], X, Y + 3], greatsword: [X - 2, Y + 3, X + 10, Y + 7], plume: 1, bits: [...lit, a(X - 7, Y + 2, SHADE), a(X - 8, Y + 6, SHADE2), a(X - 6, Y + 10, SHADE), a(X - 9, Y + 9, SHADEG), a(X - 4, Y + 15, SHADE2)] })];
  riposteKit(F, 'reaper', K, { X, Y, OFF });
}
export function bakePyro(skin = {}, previewOnly = false) {
  KP = Object.assign({}, KP0, PYRO_PAL, skin);
  const up = (dx = 0, d = 0) => [17 + dx, 18 + d, 18 + dx, 0 + d]; // the staff stood upright in the front hand, taller than her
  const hand = [16, 11, 17, 12];                                      // the front sleeve down to the staff
  // A STORE CARD NEEDS ONLY THE BREATH AND THE SWING, not the whole fighting life.
  const card = {
    idle: () => ((previewOnly === 'icon' ? ([[0, 0], [0, 0], [1, 0], [1, 1], [1, 1], [0, 1], [0, 0], [0, -1]]).slice(0, 1) : ([[0, 0], [0, 0], [1, 0], [1, 1], [1, 1], [0, 1], [0, 0], [0, -1]])).map(([sit, trail], i) => pyroFrame({ sit, trail, staff: [17, 18, 19, 5], arm: [16, 11 + sit, 17, 11 + sit], flame: [0, 1, 2, 3, 1, 0, 3, 2][i], flick: i === 4 ? 1 : 0, cowl: 0 }))),
    atk: () => ([
      () => (pyroFrame({ lean: -1, sit: 1, feet: [[10, 18], [16, 18]], staff: [3, 11, 16, 10], arm: [15, 10, 13, 11], arm2: [11, 10, 9, 11], cowl: 0 })),
      () => (pyroFrame({ lean: 2, trail: 2, feet: [[9, 18], [17, 18]], staff: [9, 11, 25, 10], arm: [16, 10, 20, 10], arm2: [12, 10, 15, 11], cowl: 1, flare: [26, 10, false] })),
      () => (pyroFrame({ lean: 2, trail: 2, feet: [[9, 18], [17, 18]], staff: [10, 11, 26, 10], arm: [16, 10, 21, 10], arm2: [12, 10, 16, 11], cowl: 1, flare: [27, 10, true], flick: 1 })),
      () => (pyroFrame({ lean: 1, feet: [[10, 18], [16, 18]], staff: [8, 13, 21, 8], arm: [16, 10, 18, 11], cowl: 0 })),
      () => (pyroFrame({ staff: up(), arm: hand, cowl: 0 }))
    ].map((make, i) => (previewOnly === 'weaponIcon' && i > 1) || (previewOnly === 'atk' && i > 2) ? null : make()))
  };
  if (previewOnly) return storeFrames(card, false, previewOnly, SMEAR_COL.fire);
  const F = {
    /* HER BREATH: the shoulders and the cowl settle a pixel while the hem and the boots stay where they stand, the robe
       swings a beat behind them, and the fire in the cage licks a new way on every beat. The staff is planted at a lean
       so the flame has room under the top of the frame. */
    idle: card.idle(),
    // she runs low and quick, the robe streaming behind and the staff carried like a lance
    run: [0, 1, 2, 3, 4, 5].map(i => pyroFrame({ lean: 2, dy: [0, -1, 0, 0, -1, 0][i], trail: 3 + (i % 3 === 1 ? 1 : 0), hemW: 11,
      feet: [[[9, 18], [16, 17]], [[11, 18], [15, 18]], [[13, 17], [12, 18]], [[16, 17], [9, 18]], [[15, 18], [11, 18]], [[12, 18], [13, 17]]][i],
      staff: [7, 17, 22, 5, 'back'], arm: [17, 10, 19, 11], cowl: 1, flick: i % 2 })),
    jump: [pyroFrame({ dy: -1, hemW: 12, feet: [[11, 17], [15, 17]], staff: [15, 16, 22, 1], arm: [16, 10, 18, 9], cowl: 0 }),
      pyroFrame({ hemW: 12, bell: 1, feet: [[11, 17], [15, 17]], staff: [15, 16, 22, 1], arm: [16, 10, 18, 9], cowl: 2 })],
    // falling, the robe bells out and her feet show
    fall: [pyroFrame({ bell: 3, hemW: 12, feet: [[11, 18], [15, 18]], staff: [14, 16, 21, 1], arm: [16, 9, 19, 7], arm2: [10, 9, 7, 7], cowl: 2 }),
      pyroFrame({ bell: 4, hemW: 13, dy: -1, feet: [[11, 18], [15, 19]], staff: [14, 16, 21, 1], arm: [16, 9, 19, 6], arm2: [10, 9, 7, 6], cowl: 2, flick: 1 })],
    /* LANDING in three beats: the IMPACT sunk right down into the robe with the hem belled out on the ground, the SETTLE, and up */
    land: [pyroFrame({ sit: 4, bell: 2, hemW: 14, staff: up(0, 3), arm: [16, 14, 17, 15], arm2: [11, 13, 9, 15], cowl: 2 }), pyroFrame({ sit: 2, hemW: 13, staff: up(0, 2), arm: [16, 13, 17, 14], cowl: 0 }), pyroFrame({ sit: 1, hemW: 12, staff: up(0, 1), arm: [16, 12, 17, 13], cowl: 0 })],
    /* THE TAKE-OFF: up on the toes of the push, the robe drawn narrow and trailing, the staff swung up ahead of her */
    takeoff: pyroFrame({ dy: -2, hemW: 9, trail: 2, feet: [[12, 18], [15, 19]], staff: [14, 16, 23, 2], arm: [16, 10, 19, 8], cowl: 1 }),
    apex: pyroFrame({ bell: 2, hemW: 12, feet: [[11, 17], [15, 17]], staff: [15, 16, 22, 1], arm: [16, 10, 18, 9], cowl: 1 }),   /* the top of the jump: the robe opens and hangs */
    skid: pyroFrame({ lean: -3, trail: 3, hemW: 12, feet: [[9, 18], [15, 18]], staff: [14, 17, 20, 3], arm: [15, 11, 17, 12], cowl: 2 }),   /* turning at a run: heels in, the robe still going */
    // on a ladder: the staff across her back, a hand up for the next rung and a foot up on it, then the other
    climb: [
      pyroFrame({ hemW: 9, feet: [[11, 18], [15, 15]], staff: [7, 17, 21, 4, 'back'], arm: [16, 10, 18, 3], arm2: [11, 10, 13, 7], cowl: 0 }),
      pyroFrame({ dy: 1, hemW: 9, feet: [[11, 15], [15, 18]], staff: [7, 17, 21, 4, 'back'], arm: [16, 10, 18, 6], arm2: [11, 10, 13, 3], cowl: 0, flick: 1 }),
    ],
    // the thrust: staff drawn back, driven straight out, flame off the end of it, pulled home
    atk: card.atk(),
    // the plunge: the staff goes down first and she rides it, robe streaming up
    // HOLD THE FLAME: she gathers it back low with both hands and then drives the staff forward level
    heavy: [
      pyroFrame({ lean: -2, dy: 1, hemW: 12, staff: [9, 16, 2, 9], arm: [14, 12, 11, 13], arm2: [12, 10, 9, 11], cowl: 2, flick: 1, trail: 2 }),
      pyroFrame({ lean: 3, hemW: 11, staff: [15, 13, 27, 11], arm: [17, 11, 20, 11], cowl: 1, flick: 0, trail: 3 }),
      pyroFrame({ lean: 2, dy: 1, hemW: 11, staff: [16, 14, 26, 14], arm: [17, 12, 20, 13], cowl: 0, flick: 1, trail: 1 }),
    ],
    // THE FIRE STOMP: unchanged from the robe's own committed dive - bell wide, the staff already a fire poker driven
    // straight down the whole height of the frame - but the point now carries its own flare, so the picture says
    // meteor before the landing ring (main.js, plungeWave) ever gets to say it in particles.
    plunge: pyroFrame({ bell: 4, hemW: 12, feet: [[11, 17], [15, 17]], staff: [13, 6, 13, 26], arm: [15, 10, 14, 13], arm2: [11, 10, 12, 13], cowl: 2, flick: 1, flare: [13, 26, true] }),
    /* THE FLAMING SLIDE: low and quick, the way she runs - sit drops her a beat into the frame, the hem trails hard
       behind the staff's own smear, and the fire never leaves the tip. No arc: the staff stays roughly level with the
       ground the whole way through, which is the one shape none of her ground attacks make (they lift the tip). */
    dashAtk: [
      pyroFrame({ lean: -1, sit: 1, trail: 1, hemW: 11, feet: [[10, 18], [16, 18]], staff: [6, 15, 17, 12], arm: [15, 11, 13, 13], arm2: [11, 11, 9, 13], cowl: 1 }),
      pyroFrame({ lean: 3, sit: 2, trail: 3, hemW: 13, feet: [[8, 18], [17, 18]], staff: [9, 15, 27, 10], arm: [16, 10, 21, 11], arm2: [12, 10, 16, 12], cowl: 2, flare: [28, 10, true], flick: 1 }),
      pyroFrame({ lean: 1, sit: 1, dy: 1, hemW: 12, feet: [[10, 18], [16, 18]], staff: [10, 16, 18, 6], arm: [16, 11, 18, 10], cowl: 0 }),
    ],
    hurt: [pyroFrame({ lean: -2, trail: -1, dy: 1, feet: [[10, 18], [15, 18]], staff: [5, 17, 13, 3, 'back'], arm: [15, 9, 18, 6], arm2: [10, 9, 7, 6], cowl: 2 }),
      pyroFrame({ lean: -3, trail: -2, dy: 2, feet: [[10, 18], [15, 18]], staff: [5, 18, 13, 4, 'back'], arm: [15, 10, 18, 8], arm2: [10, 10, 7, 8], cowl: 2 })],
    crouch: pyroFrame({ sit: 3, hemW: 13, staff: up(0, -1), arm: [16, 14, 17, 15], cowl: 0 }),
    /* THE BUTT-SLIDE (src/slide.js): sat back in her robe with the hem run out along the ground and the boots toes-up at the end, the staff slung behind her */
    slide: [0, 1].map(i => pyroFrame({ sit: 3, lean: -2, trail: i, hemW: 13, feet: [[21, 18], [23, 18]], staff: [13, 15, 2, 4, 'back'], arm: [15, 14, 14, 17], cowl: i,
      sparks: [[16, 18, 's'], [17, 18, 's'], [18, 18, 's'], [19, 18, 's'], [20, 18, 's'], [17, 17, 's'], [18, 17, 's'], [19, 17, 's'], [20, 17, 'W'], [21, 17, 'W']] })),
    /* THE EMBER WARD (src/ember-ward.js): down in the crouch with the staff slung back and the free palm pushed out with the fire in it -
       the dome is raised off that palm (main.js draws it). Two beats of the palm's fire, and THE FLARE: arms flung wide, cowl thrown back */
    ward: [pyroFrame({ sit: 3, hemW: 13, staff: [9, 17, 10, 3, 'back'], arm: [16, 13, 20, 12], palm: [21, 12], cowl: 0 }),
      pyroFrame({ sit: 3, hemW: 13, staff: [9, 17, 10, 3, 'back'], arm: [16, 13, 20, 13], palm: [21, 13], cowl: 0, flick: 1 }),
      pyroFrame({ sit: 3, hemW: 14, bell: 1, staff: [9, 17, 10, 3, 'back'], arm: [16, 12, 21, 9], arm2: [11, 12, 7, 9], palm: [22, 8], cowl: 2, flick: 1, sparks: [[20, 5, 'y'], [23, 6, 'r'], [6, 7, 'y']] })],
    // the jet: braced wide, the staff levelled in both hands
    block: [0, 1].map(i => pyroFrame({ lean: 1, feet: [[9, 18], [17, 18]], staff: [7, 12, 23, 10], arm: [16, 10, 20, 11], arm2: [12, 10, 15, 12], cowl: 0, flick: i, trail: -i })),
    // an ember off the palm: the other hand does the work, the staff stays up
    cast: [pyroFrame({ lean: 1, feet: [[10, 18], [16, 18]], staff: [9, 18, 10, 0, 'back'], arm: [16, 10, 20, 9], cowl: 0, palm: [21, 9] }),
      pyroFrame({ lean: 2, trail: 1, feet: [[10, 18], [16, 18]], staff: [9, 18, 10, 0, 'back'], arm: [16, 10, 21, 9], cowl: 1, palm: [22, 9], flick: 1 })],
    // the pyre: the staff goes up over her head in both hands, then comes down like a hammer
    blast: [pyroFrame({ lean: -1, dy: -1, feet: [[10, 18], [16, 18]], staff: [6, 2, 21, 0], arm: [15, 9, 17, 3], arm2: [11, 9, 10, 3], cowl: 2, flick: 1, bell: 1 }),
      pyroFrame({ lean: 3, trail: 3, feet: [[8, 18], [18, 18]], staff: [11, 13, 25, 7], arm: [16, 10, 21, 9], arm2: [12, 10, 17, 10], cowl: 1, flare: [26, 6, true] })],
  };
  const tuck = pyroFrame({ sit: 4, hemW: 12, bell: 2, staff: [9, 17, 19, 7], arm: [15, 13, 16, 14], cowl: 2 });
  F.roll = [0, 1, 2, 3].map(q => rotQuarter(tuck, q));
  /* HER RUN OF THREE: the staff swept up from the ground, and then driven straight out with the fire on the end of it */
  F.atkB = [
    pyroFrame({ dy: 1, feet: [[10, 18], [16, 18]], staff: [4, 16, 18, 13], arm: [15, 11, 13, 13], arm2: [11, 11, 9, 13], cowl: 0 }),
    pyroFrame({ lean: 1, trail: 1, feet: [[9, 18], [17, 18]], staff: [8, 15, 24, 8], arm: [16, 10, 19, 11], arm2: [12, 10, 14, 12], cowl: 1 }),
    pyroFrame({ lean: 2, trail: 2, feet: [[9, 18], [17, 18]], staff: [10, 14, 22, 2], arm: [16, 10, 20, 8], arm2: [12, 10, 15, 9], cowl: 1, flare: [22, 2, true] }),
    pyroFrame({ lean: 1, feet: [[10, 18], [16, 18]], staff: [11, 16, 17, 2], arm: [16, 10, 18, 9], cowl: 0 }),
    F.atk[4],
  ];
  /* her air slash, the staff swung flat round her with the hem flying, and her fidget, the staff twirled in one hand */
  F.air = [
    pyroFrame({ bell: 2, hemW: 12, feet: [[11, 17], [15, 17]], staff: [2, 15, 16, 12], arm: [15, 11, 13, 13], cowl: 1 }),
    pyroFrame({ bell: 3, hemW: 12, feet: [[11, 17], [15, 17]], staff: [9, 14, 25, 12], arm: [16, 10, 20, 12], cowl: 2, flare: [26, 12, false] }),
    pyroFrame({ bell: 3, hemW: 12, feet: [[11, 17], [15, 17]], staff: [10, 12, 25, 7], arm: [16, 10, 20, 9], cowl: 2, flare: [26, 6, true] }),
    pyroFrame({ bell: 2, hemW: 12, feet: [[11, 17], [15, 17]], staff: [12, 15, 19, 2], arm: [16, 10, 18, 9], cowl: 1 }),
    F.jump[1],
  ];
  /* HER FIDGET: a spark lit in the free palm, tossed and watched up and caught, tossed again - into the cage, which flares */
  { const p = (arm2, sparks, flame = 0, o = {}) => pyroFrame({ staff: [17, 18, 19, 5], arm: [16, 11, 17, 11], cowl: 0, arm2, sparks, flame, ...o });
    const low = [11, 10, 13, 12], hi = [11, 10, 13, 10];
    F.fidget = holdFrames([
      [p(low, null, 0, { palm: [14, 11] }), 3], [p(hi, [[14, 7, 'y'], [14, 8, 'r']], 1), 1], [p(low, [[14, 4, 'y']], 2, { flick: 1 }), 2],
      [p(low, [[15, 2, 'y']], 3, { flick: 1 }), 2], [p(low, [[15, 4, 'y'], [15, 5, 'r']], 1, { flick: 1 }), 1], [p(hi, [[14, 9, 'y']], 0), 2],
      [p([11, 10, 14, 11], [[16, 7, 'y'], [15, 8, 'r']], 2), 1], [p(low, [[18, 3, 'y']], 3), 1], [p(low, null, 4, { flick: 1 }), 2], [p(low, null, 4), 2], [F.idle[0], 2]]); }
  /* HER DANCE, for the victory card: she stands the staff in the turf and goes round it. Her body is a ROBE, so the
     dance is danced with the hem - it swings out on the step and gathers on the drop - and her free hand throws
     sparks that climb while the cage licks a different way on every beat. The fidget is one spark, stood still; this
     is her feet, her hem and a fire she is feeding. */
  { /* the staff is STOOD IN THE GROUND, so on the beats where she leaves the floor its ends are given back whatever
       the hop took off them - a planted staff that hops with her is a stick she is holding, not one she is round */
    const jig = (o = {}) => { const d = o.dy || 0; return pyroFrame({ staff: [17, 18 - d, 18, 2 - d], arm: [16, 11, 17, 12], cowl: 0, ...o }); };
    const a = jig({ lean: -2, bell: 1, feet: [[10, 17], [15, 18]], arm2: [11, 10, 8, 7], palm: [7, 6], flame: 1, sparks: [[6, 3, 'y'], [8, 4, 'r']] });
    const b = jig({ lean: -1, bell: 2, dy: -1, hemW: 12, feet: [[11, 17], [16, 16]], arm2: [11, 10, 9, 4], palm: [8, 3], flame: 2, flick: 1, sparks: [[7, 0, 'y'], [9, 1, 'r'], [5, 1, 'r']] });
    const c = jig({ lean: 1, trail: 2, bell: 1, feet: [[12, 18], [16, 16]], arm2: [11, 10, 10, 6], palm: [9, 5], flame: 3, sparks: [[8, 2, 'r'], [10, 3, 'y']] });
    const d = jig({ lean: 2, trail: 3, sit: 1, hemW: 13, feet: [[12, 17], [15, 18]], arm2: [11, 11, 12, 13], flame: 4, flick: 1 });
    const e = jig({ bell: 2, dy: -1, hemW: 12, feet: [[11, 17], [15, 16]], arm2: [11, 10, 9, 6], palm: [8, 5], flame: 0, sparks: [[7, 2, 'y']] });
    F.dance = holdFrames([[a, 2], [b, 2], [c, 2], [d, 2], [e, 1]]); }
  /* HER OTHER TWO DANCES (heroanim lane, 2026-10-10). dance2 = THE JUGGLE, her long-idle solo: three sparks lit one at a time in the free
     palm and kept up between palm and cage in a slow arc, her weight rocking heel to heel under the hem, the cage flaring each time one
     lands in it. dance3 = THE PYRE TURN, a boss down: the staff comes off the turf, goes round her head in a full circle with the hem
     flying and the cowl thrown back, and is brought down on the ground with a burst of fire; she stands in it with both arms open. */
  { const st = (o = {}) => pyroFrame({ staff: [17, 18, 18, 2], arm: [16, 11, 17, 12], cowl: 0, ...o });
    const lo = [11, 10, 13, 12], hi = [11, 10, 14, 9];
    F.dance2 = holdFrames([[st({ arm2: lo, palm: [14, 11], feet: [[10, 18], [15, 18]] }), 2], [st({ arm2: hi, sparks: [[14, 7, 'y']], flame: 1, lean: -1, feet: [[10, 18], [15, 18]] }), 2],
      [st({ arm2: lo, sparks: [[14, 4, 'y'], [11, 2, 'r']], flame: 2, bell: 1, feet: [[11, 17], [16, 18]] }), 2], [st({ arm2: hi, sparks: [[16, 3, 'y'], [13, 5, 'r']], flame: 3, bell: 2, dy: -1, hemW: 12, feet: [[11, 17], [15, 16]] }), 2],
      [st({ arm2: [11, 10, 12, 8], sparks: [[17, 1, 'y'], [9, 3, 'r'], [14, 2, 'y']], flame: 3, flick: 1, lean: 1, feet: [[11, 18], [16, 18]] }), 2],
      [st({ arm2: hi, sparks: [[10, 4, 'y'], [16, 5, 'y']], flame: 4, flick: 1, bell: 1, feet: [[12, 18], [15, 18]] }), 2], [st({ arm2: lo, sparks: [[14, 8, 'y']], flame: 4, lean: 1, trail: 1, hemW: 12, feet: [[12, 17], [16, 18]] }), 2],
      [st({ arm2: lo, palm: [14, 11], flame: 1, sit: 1, feet: [[10, 18], [15, 18]] }), 2], [st({ arm2: hi, sparks: [[13, 6, 'r'], [15, 4, 'y']], flame: 2, lean: -1, feet: [[10, 18], [15, 18]] }), 2],
      [st({ arm2: lo, flame: 3, flick: 1, bell: 1, feet: [[11, 18], [15, 18]] }), 2], [F.idle[0], 2]]);
    const sp = (stf, a, a2, o = {}) => pyroFrame({ staff: stf, arm: a, arm2: a2, cowl: 2, bell: 2, hemW: 13, feet: [[9, 18], [17, 18]], ...o });
    const t1 = sp([6, 3, 22, 1], [15, 9, 17, 3], [11, 9, 10, 3], { lean: -1, flick: 1 }), t2 = sp([9, 4, 25, 8], [16, 10, 20, 8], [12, 10, 16, 8], { lean: 2, trail: 2, flare: [26, 8, true] }),
      t3 = sp([12, 14, 18, 3], [16, 11, 18, 8], [12, 11, 14, 8], { lean: 3, trail: 3, dy: -1, feet: [[10, 17], [17, 17]] }), t4 = sp([12, 4, 3, 10], [14, 9, 10, 7], [11, 9, 7, 8], { lean: -2, trail: -2, dy: -1, feet: [[10, 17], [16, 17]] }),
      t5 = sp([9, 3, 5, 18], [14, 10, 8, 13], [11, 10, 7, 14], { lean: -3, trail: -3, hemW: 14, flare: [4, 19, true] });
    const slam = pyroFrame({ lean: 2, trail: 2, sit: 2, feet: [[9, 18], [17, 18]], staff: [10, 14, 20, 19], arm: [16, 11, 19, 15], arm2: [12, 11, 15, 16], cowl: 1, flare: [21, 19, true], sparks: [[22, 16, 'y'], [20, 14, 'r'], [24, 18, 'y']] });
    const open = pyroFrame({ bell: 2, hemW: 14, staff: [17, 18, 18, 2], arm: [16, 11, 21, 7], arm2: [11, 11, 6, 7], cowl: 2, flame: 4, flick: 1, sparks: [[22, 4, 'y'], [5, 4, 'y'], [18, 0, 'r']] });
    F.dance3 = holdFrames([[st({ flame: 1 }), 1], [t1, 2], [t2, 2], [t3, 2], [t4, 2], [t5, 2], [t1, 2], [t2, 2], [t3, 1], [t4, 1], [t5, 1], [slam, 3], [open, 3], [pyroFrame({ bell: 2, hemW: 14, staff: [17, 18, 18, 2], arm: [16, 11, 21, 7], arm2: [11, 11, 6, 7], cowl: 2, flame: 3, sparks: [[23, 3, 'y'], [5, 3, 'r']] }), 4], [F.idle[0], 2]]); }
  /* FOLLOW-THROUGH (heroanim lane, 2026-10-10): the two frames a light strike plays inside its existing recovery (main.js recPose branch; the beat table
     is at the top of src/attack-animation.js). A = the weapon spent, carried on low past the target, body one pixel forward, plume still flying;
     B = it coming back to guard, the weight settling. Art only: atkRec is read, never written. */
  F.follow = [pyroFrame({ lean: 2, trail: 2, dy: 1, feet: [[9, 18], [17, 18]], staff: [11, 15, 22, 17], arm: [16, 11, 18, 14], arm2: [12, 11, 14, 14], cowl: 1 }), pyroFrame({ lean: 1, dy: 1, feet: [[10, 18], [16, 18]], staff: [11, 16, 17, 9], arm: [16, 11, 18, 12], cowl: 0 })];
  /* HER SLUMP: the staff turned over. She holds it by the foot with the cage down by her boots, so the one bright
     thing she owns is guttering in the dirt - the flame stands up out of the cage wherever the cage is - and she is
     sunk into her own robe (sit drops the shoulders and the cowl while the hem stays on the ground). */
  { const low = (s, flame) => pyroFrame({ sit: s, hemW: 12, staff: [17, 10, 24, 20], arm: [16, 11, 17, 11], arm2: [11, 12, 9, 15], cowl: 0, flame });
    F.slump = [low(3, 2), low(4, 0)]; }
  F.atkC = [
    pyroFrame({ lean: -2, feet: [[10, 18], [16, 18]], staff: [1, 11, 15, 11], arm: [14, 11, 12, 11], arm2: [10, 11, 8, 11], cowl: 0 }),
    pyroFrame({ lean: 3, trail: 3, feet: [[8, 18], [17, 18]], staff: [11, 11, 26, 11], arm: [17, 10, 21, 11], arm2: [13, 10, 16, 11], cowl: 2, flare: [27, 11, false] }),
    pyroFrame({ lean: 3, trail: 3, feet: [[8, 18], [17, 18]], staff: [11, 11, 26, 11], arm: [17, 10, 22, 11], arm2: [13, 10, 17, 11], cowl: 2, flare: [27, 11, true], flick: 1 }),
    pyroFrame({ lean: 1, feet: [[10, 18], [16, 18]], staff: [9, 13, 23, 10], arm: [16, 10, 19, 11], cowl: 0 }),
    F.atk[4],
  ];
  /* HER SWIM, on her own rig: the robe drawn narrow and trailing, the boots kicking, the stroke arm reaching past the
     cowl, and the staff along her back with the fire still in the cage - she will not let the sea have it. Treading,
     the robe floats up round her, both sleeves scull, and the staff is held up in front with the flame over the water. */
  { const kick = [[[10, 18], [15, 19]], [[11, 19], [15, 18]], [[10, 19], [15, 17]], [[11, 18], [15, 18]]];
    F.swim = STROKE.map(([ax, ay], i) => laidOut(pyroFrame({ hemW: 9, feet: kick[i], arm: [16, 10, 16 + ax, 10 + ay], staff: [9, 20, 12, 2, 'back'], flame: i % 4, cowl: 1, flick: i % 2 }), -7, 1));
    F.tread = SCULL.map(([ax, ay], i) => pyroFrame({ bell: 3 - TREAD_DY[i], hemW: 12, dy: TREAD_DY[i], feet: kick[i], arm: [16, 10, 16 + ax, 10 + ay], arm2: [10, 10, 10 - ax, 10 + ay],
      staff: [18, 19, 20, 3], flame: (i + 1) % 4, cowl: 2 })); }
  const mirror = f => Array.isArray(f) ? f.map(flipX) : flipX(f);
  directionalPoses(F, 'staff', { pyro: true });
  pyroKitPoses(F, up);
  smearPass(F, SMEAR_COL.fire);   /* the strike beats get their arc (claude/herokeys) */
  const R = F, L = {}; for (const k in F) L[k] = mirror(F[k]);
  const white = {}; for (const k in F) white[k] = Array.isArray(F[k]) ? F[k].map(c => whiten(c)) : whiten(F[k]);
  const whiteL = {}; for (const k in white) whiteL[k] = mirror(white[k]);
  KP = Object.assign({}, KP0);
  /* HER FEET ARE TWO ROWS HIGHER IN HER FRAME than the knight's are in his (pyroFrame stands her boots on row 18, the staff's
     butt a row under them), so on the knight's anchor she stood two pixels off every floor. Her own foot line puts the boots on
     the ground and the butt of the staff a pixel into it. */
  return { R, L, white: { R: white, L: whiteL }, ...KNIGHT_ANCHOR, ay: KNIGHT_ANCHOR.ay - 2 + ATTACK_HEADROOM };
}

// The keeper — an old badger merchant: spectacles, striped snout, a leather apron with a coin pouch, sleeves rolled. 14×16. Frames: idle, talk (a paw raised over the counter).
// The scullion - Gorm's cook-boy, an apron, a ladle and a worried face. 12x13. Frames: idle, talk.
export function bakeCook() {
  const CK = Object.assign({}, EP, { a: '#e8e0d0', A: '#b8a888', q: '#8a5a32', Q: '#5c3a1d', k: '#f1c9a0', c: '#8f2f28', o: OUT });
  const f = rows => outline(fromGrid(rows, CK, 1), OUT);
  const hat = ['...aaaaa....', '..aaaaaaa...', '..qkkkkkq...'];
  const face = ['..kkokkok...', '..kkkkkkk...'];
  const body = ['..qaaaaaq.s.', '.qaaaaaaaqs.', '.qaaaaaaaqS.', '.qaAAAAAaq..', '..qaaaaaq...', '..QQ...QQ...', '..QQ...QQ...'];
  const idle = f([...hat, ...face, '...kkkkk....', ...body]);
  const talk = f([...hat, ...face, '...kkckk....', ...body]);
  return pack([idle, talk], 7, 14, 10, 13);
}
export function bakeKeeper() {
  const KP2 = Object.assign({}, EP, { b: '#3a3448', B: '#1b1626', f: '#e8e0d0', a: '#8a5a32', A: '#5c3a1d', g: '#c9a83a', p: '#5a4a3a', o: OUT, e: '#f3f0d2', s: '#ffffff' });
  const k = rows => outline(fromGrid(rows, KP2, 1), OUT);
  const head = ['....bbbbbb....', '...bfbbbbfb...', '...bfbbbbfb...', '..bbfffffffb..', '..bfggfggfbb..', '..bfgegegfb...', '...bffffffb...', '...bbbBBbbb...'];
  const talk = ['....bbbbbb....', '...bfbbbbfb...', '...bfbbbbfb...', '..bbfffffffb..', '..bfggfggfbb..', '..bfgegegfb...', '...bffffffb...', '...bbBBBBbb...'];
  const body = ['..aaaaaaaaaa..', '.aaAaaaaaaAaa.', '.aaaaaaaaaaaa.', '.aaaaggaaaaaa.', '..aaaaaaaaaa..', '..bbb....bbb..', '..bbb....bbb..', '..pp......pp..'];
  const bodyTalk = ['..aaaaaaaaaab.', '.aaAaaaaaaAab.', '.aaaaaaaaaaaab', '.aaaaggaaaaaa.', '..aaaaaaaaaa..', '..bbb....bbb..', '..bbb....bbb..', '..pp......pp..'];
  return pack([k([...head, ...body]), k([...talk, ...bodyTalk])], 8, 17, 12, 16);
}
// The bard — a hedgehog with a lute and a feathered cap. 12×13. Frames: idle, strum.
export function bakeBard() {
  const BP = Object.assign({}, EP, { q: '#6a4a3a', Q: '#3a2214', k: '#f1c9a0', c: '#3f6e2c', r: '#c9463d', w: '#8a5a32', W: '#5c3a1d', y: '#e0b040', o: OUT });
  const b = rows => outline(fromGrid(rows, BP, 1), OUT);
  const idle = b(['...r.cccc...', '..rccccccc..', '..qQqQqQqq..', '.qQqkkkkqQq.', '.qqqkokokqq.', '..qqkkkkqq..', '..qqqqqqqq..', '.qqqqqqqqqw.', '.qqqqqqqqwW.', '..qqqqqqwWy.', '...qq..qq.y.', '...QQ..QQ...']);
  const strum = b(['...r.cccc...', '..rccccccc..', '..qQqQqQqq..', '.qQqkkkkqQq.', '.qqqkokokqq.', '..qqkkkkqq..', '..qqqqqqqqk.', '.qqqqqqqqqw.', '.qqqqqqqqwW.', '..qqqqqqwWy.', '...qq..qq.y.', '...QQ..QQ...']);
  return pack([idle, strum], 7, 13, 10, 12);
}
// The old knight — a retired veteran in a dented helm and a patched surcoat, leaning on a stick. 12×15. Frames: idle, nod.
export function bakeOldKnight() {
  const OK = Object.assign({}, EP, { s: '#9aa3b0', S: '#5a6270', b: '#6a5a8a', B: '#3a2a4a', k: '#f1c9a0', w: '#8a5a32', W: '#5c3a1d', g: '#b8b0a0', o: OUT });
  const o = rows => outline(fromGrid(rows, OK, 1), OUT);
  const idle = o(['...sSSSs....', '..sssssss...', '..sSSSSSs...', '..skkkkks...', '..sgggggs...', '...ggggg....', '..bbbbbbb...', '.bBbbbbbBb.w', '.bbbbbbbbb.w', '.bBbbbbbBb.w', '..bbbbbbb..w', '..SS...SS..w', '..SS...SS..w', '..WW...WW..w']);
  const nod = o(['............', '...sSSSs....', '..sssssss...', '..sSSSSSs...', '..skkkkks...', '..sgggggs...', '..bbbbbbb...', '.bBbbbbbBb.w', '.bbbbbbbbb.w', '.bBbbbbbBb.w', '..bbbbbbb..w', '..SS...SS..w', '..SS...SS..w', '..WW...WW..w']);
  return pack([idle, nod], 7, 15, 10, 14);
}


// ---------- The Mineworks ----------
// Goblin miner — a hard hat with a candle, a pick over the shoulder. 12×12. Frames: walk1, walk2, dig (pick down), swing (pick forward).
// The foreman — a barrel-chested man in a flat cap with a lamp pinned to it, a grey beard, a red waistcoat and a ledger under one arm. 12×14. Frames: idle, talk.
export function bakeForeman() {
  const P2 = Object.assign({}, KG, { c: '#3a3444', C: '#26222e', k: '#f1c9a0', y: '#ffd36b', s: '#c9d1dc', S: '#8a919c', v: '#8a2a2a', V: '#5a1a1a', a: '#e8e0d0', x: '#c9b27c', h: '#4a3a2a', z: '#2a1a10' });
  const f = rows => outline(fromGrid(rows, P2, 1), OUT);
  const head = ['....y.......', '...cccccc...', '..cCCCCCCc..', '..kkkkkkkk..', '..kokkkkok..', '..kkkkkkkk..', '..sSssssSs..', '...ssssss...'];
  const idle = f([...head, '..avvvvvva..', '.aavVvvVvaax', '.a.vvvvvv.ax', '...vvvvvv..x', '...hhhhhh...', '..zz...zz...']);
  const talk = f([...head, '..avvvvvvaa.', '.aavVvvVvaax', '.a.vvvvvv.ax', '...vvvvvv...', '...hhhhhh...', '..zz...zz...']);
  return pack([idle, talk], 7, 15, 10, 14);
}
// The lamplighter — a thin figure in a long dark coat and a tall hat, carrying a pole with a lit wick at the top. 12×16. Frames: idle, talk (pole lifts).
export function bakeLamplighter() {
  const P2 = Object.assign({}, KG, { c: '#2a2a34', C: '#1a1a22', k: '#f1c9a0', y: '#ffd36b', Y: '#ff9a5c', q: '#8a5a32', v: '#3a3a5a', V: '#24243a', a: '#c9b27c', h: '#2a2a34', z: '#1a1a12' });
  const f = rows => outline(fromGrid(rows, P2, 1), OUT);
  const idle = f(['..........Y.', '...cccc...y.', '...cccc...q.', '..cccccc..q.', '..kkkkkk..q.', '..kokkok..q.', '...kkkk...q.', '..vvvvvv..q.', '.vvVvvVvv.q.', '.vvvvvvvvvq.', '.v.vvvvvv.q.', '...vvvvvv.q.', '...vvvvvv...', '...vvvvvv...', '...hh..hh...', '...zz..zz...']);
  const talk = f(['.........Y..', '...cccc..y..', '...cccc..q..', '..cccccc.q..', '..kkkkkkkq..', '..kokkokaq..', '...kkkk.aq..', '..vvvvvvvq..', '.vvVvvVvvq..', '.vvvvvvvvq..', '.v.vvvvvvq..', '...vvvvvv...', '...vvvvvv...', '...vvvvvv...', '...hh..hh...', '...zz..zz...']);
  return pack([idle, talk], 7, 17, 10, 16);
}
export function bakeMiner() {
  /* THE MINER carries his PICK over his shoulder, head up above his cap, so his outline has a hook on top of
     it that nothing else in the family has. When he digs, the pick is where it always was: in his hands. */
  const MP = Object.assign({}, KG, { c: '#c9b27c', C: '#8a7a5a', y: '#ffd36b', i: '#8a919c', I: '#5a6270' });
  const mspr = rows => outline(fromGrid(rows, MP, 1), OUT);
  const E = '............';
  const shoulder = rows => ['.......IIII.', '......I..i..', '.........i..'].concat(rows.map((r, i) => { const a = r.split(''); if (i < 6 && a[9] === '.') a[9] = 'i'; return a.join(''); }));
  const head = ['....y.......', '...cccccc...', '..cCCCCCCc..', '..ggeoggeog.', '...gggggg...', '...gGGGGg...'];
  const walk1 = mspr(shoulder([...head, '..xxxxxxx...', '.xxxxxxxx...', '..xxxxxx....', '..GG..GG....', '.GG....GG...']));
  const walk2 = mspr(shoulder([...head, '..xxxxxxx...', '.xxxxxxxx...', '..xxxxxx....', '...GGGG.....', '...GG.GG....']));
  const dig = mspr([E, E, E, ...head, '..xxxxxxxxx.', '.xxxxxxxxxxi', '..xxxxxx..II', '..GG..GG..I.', '.GG....GG...']);
  const swing = mspr([E, E, E, '....y.......', '...cccccc...', '..cCCCCCCcii', '..ggeoggeoII', '...gggggg.I.', '...gGGGGgxI.', '..xxxxxxxxx.', '.xxxxxxxxx..', '..xxxxxx....', '..GG..GG....', '.GG....GG...']);
  /* WITHOUT IT (2026-09-23, the pick is thrown now): the same goblin with nothing on his shoulder, which is the whole read -
     the hook is gone off the top of his outline. Then the throw's windup (the pick right back behind his head) and HELPLESS,
     both hands up, which is what he is until he has it back. */
  const bare1 = mspr([E, E, E, ...head, '..xxxxxxx...', '.xxxxxxxx...', '..xxxxxx....', '..GG..GG....', '.GG....GG...']);
  const bare2 = mspr([E, E, E, ...head, '..xxxxxxx...', '.xxxxxxxx...', '..xxxxxx....', '...GGGG.....', '...GG.GG....']);
  const throwTell = mspr(['IIII........', '.Ii.........', '..ix........', '...xy.......', '...cccccc...', '..cCCCCCCc..', '..ggeoggeog.', '...gggggg...', '...gGGGGg...', '..xxxxxxx...', '.xxxxxxxx...', '..xxxxxx....', '..GG..GG....', '.GG....GG...']);
  const helpless = mspr([E, E, '.x.......x..', '.x..y....x..', '..xcccccx...', '..cCCCCCCc..', '..ggeoggeog.', '...gggggg...', '...gGGGGg...', '...xxxxx....', '..xxxxxx....', '..xxxxxx....', '..GG..GG....', '.GG....GG...']);
  return pack([walk1, walk2, dig, swing, bare1, bare2, throwTell, helpless], 7, 15, 10, 11);
}

/* ============================================================================================
   THE ORE ROAD'S OWN THREE (2026-09-25). F10 asks every level for a creature the game has never seen, and the
   Ore Road brought NONE - the miner has been in the mines since the Undercrown, and a boss does not count.
   These three are read from ACROSS THE SCREEN by the tool each carries, because that is all a 12 px goblin has:
     THE TIPPLER   a bar the full width of the sprite, held level. Nothing else in the game is that wide and that straight.
     THE SHEARGOB  a V of open blades standing over his head, taller than he is.
     THE GAFFER    a pole out in FRONT of him with a hook on the end - the longest thing any foe in the game carries.
   ============================================================================================ */
/* THE TIPPLER - 12x11. The goblin who works a tipping frame: an iron hood against what comes off the skip, a
   leather apron, and the BAR. He does not chase you; he heaves the bar and a skipful of ore goes over the edge
   onto whatever is under him. Frames: idle1, idle2, heave (the bar up over his head, which is the tell), tip
   (the bar gone over and him leaning after it), swing (the bar shoved forward, close in). */
export function bakeTippler() {
  const TP = Object.assign({}, KG, { i: '#8a919c', I: '#5a6270', h: '#5a4a3a', H: '#3a2e22' });
  const t = rows => outline(fromGrid(rows, TP, 1), OUT);
  const hood = ['..IIIIIIII..', '.IiiiiiiiiI.', '..ggeoggeo..', '...gggggg...'];
  const body = ['..hhhhhhhh..', '.hhhhhhhhhh.', '..hhhhhhhh..', '..hhhhhhhh..'];
  const legsA = ['..GG....GG..', '..GG....GG..'], legsB = ['...GG..GG...', '..GG....GG..'];
  const BAR = 'IIIIIIIIIIII';
  const idle1 = t([...hood, BAR, ...body, ...legsA]);
  const idle2 = t([...hood, BAR, ...body, ...legsB]);
  const heave = t([BAR, ...hood, ...body, ...legsA]);
  const tip = t([...hood, ...body, BAR, ...legsA]);
  const swing = t([...hood, '..hhhhhhIIII', '.hhhhhhhhhh.', '..hhhhhhhh..', '..hhhhhhhh..', ...legsB]);
  return pack([idle1, idle2, heave, tip, swing], 7, 12, 12, 12);
}
/* THE SHEARGOB - 12x13. A lineman with the long cable shears. He is thin, he works high on the cable, and the
   whole read is the V standing over his head: closed he is only carrying them, OPEN is the tell, shut is the cut.
   Frames: walk1, walk2, open (the tell), cut (driven down), snip (a short close blow). */
export function bakeSheargob() {
  const SP = Object.assign({}, KG, { s: '#c9d1dc', S: '#8a919c' });
  const s = rows => outline(fromGrid(rows, SP, 1), OUT);
  const head = ['...gggggg...', '..ggeoggeo..', '...gggggg...', '...gGGGGg...'];
  const torso = ['...xxxxxx...', '..xxxxxxxx..', '...xxxxxx...'];
  const legsA = ['...GG..GG...', '..GG....GG..'], legsB = ['....GGGG....', '...GG..GG...'];
  const shut = ['.....SS.....', '.....SS.....', '.....SS.....', '....sSSs....'];
  const wide = ['.SS......SS.', '..SS....SS..', '...SS..SS...', '....sSSs....'];
  const walk1 = s([...shut, ...head, ...torso, ...legsA]);
  const walk2 = s([...shut, ...head, ...torso, ...legsB]);
  const open = s([...wide, ...head, ...torso, ...legsA]);
  const cut = s(['............', '............', '.....SS.....', '....sSSs....', ...head, ...torso.slice(0, 2), '...xxxSSSS..', ...legsA]);
  const snip = s(['............', '............', '............', '....sSSs....', ...head, '...xxxxxxSS.', '..xxxxxxSS..', '...xxxxxx...', ...legsB]);
  return pack([walk1, walk2, open, cut, snip], 7, 14, 10, 12);
}
/* THE GAFFER - 16x11. A dock goblin with a boat hook eight feet long, and the reach IS the creature: he takes
   you off a bucket that is going past him. The pole is drawn out in front in every frame, so his silhouette
   says his range before he ever swings. Frames: walk1, walk2, draw (the hook pulled back over his shoulder -
   the tell), hook (the pole at full stretch), haft (the shaft brought across, close in). */
export function bakeGaffer() {
  const GP = Object.assign({}, KG, { s: '#c9d1dc', S: '#8a919c', f: '#8a7a68', F: '#5a4e42', w: '#8a5a32', W: '#5c3a1d' });
  const q = rows => outline(fromGrid(rows, GP, 1), OUT);
  const head = ['...gggg.........', '..gggggg........', '..geoggeo.......', '...gggggg.......', '...gGGGGg.......'];
  const legsA = ['...GG.GG........', '..GG...GG.......'], legsB = ['...GGGG.........', '...GG.GG........'];
  const walk1 = q([...head, '..ffffffwwwwwwwS', '.ffffffff.....SS', '..ffffff........', '..ffffff........', ...legsA]);
  const walk2 = q([...head, '..ffffffwwwwwwwS', '.ffffffff.....SS', '..ffffff........', '..ffffff........', ...legsB]);
  const draw = q(['S...............', 'SSw.gggg........', '..wgggggg.......', '...wgeoggeo.....', '...wgggggg......', '...gGGGGg.......', '..ffffff........', '.ffffffff.......', '..ffffff........', '..ffffff........', '...GG.GG........']);
  const hook = q(['................', '...gggg.........', '..gggggg........', '..geoggeo.......', '...gggggg.......', '..fffffwwwwwwwww', '.ffffffff......S', '..ffffff......SS', '..ffffff........', ...legsA]);
  const haft = q(['................', '...gggg.........', '..gggggg........', '..geoggeo.......', '..wgggggg.......', '..wgGGGGg.......', '..wffffff.......', '.wffffffff......', '..ffffff........', ...legsB]);
  return pack([walk1, walk2, draw, hook, haft], 6, 12, 10, 11);
}
// ============================================================================================
// THE UNDERCROWN, two of them (the Pit Warden is retired: THE BURIED PRINCE has his tomb, in src/redraw/prince.js).
// ============================================================================================
// THE PROPMAN — 12x12. A goblin whose whole job is to hold the mine up, and who has been doing it so
// long he is bent to the shape of the timber he carries. He does not want to fight you. He wants to get
// to the set you broke and PUT IT BACK, and every one he puts back is a collapse you have to buy twice.
// He is read by the PROP: a pit prop carried across both shoulders, the widest thing in the level.
export function bakePropman() {
  const PP = Object.assign({}, KG, { w: '#8a5a32', W: '#5c3a1d', m: '#6a707c', c: '#c9b27c' });
  const p = rows => outline(fromGrid(rows, PP, 1), OUT);
  const head = ['...cccc.....', '..cCCCCc....', '..ggeoggo...', '...gggg.....'];
  const carry = ['wwwwwwwwwwww', 'WWWWWWWWWWWW'];
  const walk1 = p([...carry, ...head, '..GGGGGG....', '.GGGGGGGG...', '..GGGGGG....', '..GG..GG....', '.GG....GG...']);
  const walk2 = p([...carry, ...head, '..GGGGGG....', '.GGGGGGGG...', '..GGGGGG....', '...GGGG.....', '...GG.GG....']);
  /* SETTING IT: down on one knee with the prop stood on end, which is the two seconds he is worth killing in */
  const setUp = p(['.....ww.....', '.....ww.....', '...cccc.ww..', '..cCCCCc.ww.', '..ggeoggo.ww', '...gggg...ww', '..GGGGGG..ww', '.GGGGGGGG.ww', '..GGGGGG..ww', '..GGGG....ww', '.GGGGGG...ww']);
  const run = p([...carry, ...head, '..GGGGGGG...', '.GGGGGGGGG..', '..GGGGGG....', '.GG...GGG...', 'GG......GG..']);
  return pack([walk1, walk2, setUp, run], 7, 12, 12, 11);
}
// THE CLINGER — 10x10. Pale, blind and boneless; it has spent its whole life on the wall of a shaft with
// its back to the rock. It does not walk and it cannot be fought on the ground, because it only ever
// commits when you are IN THE AIR beside it: it lets go, falls with you, and takes hold.
export function bakeClinger() {
  const CP = Object.assign({}, EP, { p: '#cfc8b8', P: '#9a9280', v: '#6a5a70', r: '#c9463d', e: '#f6f6ee' });
  const c = rows => outline(fromGrid(rows, CP, 1), OUT);
  /* ON THE WALL: flattened against it, limbs folded, nothing showing but a pale seam */
  const cling = c(['..pppp....', '.pPPPPp...', '.pvrrvp...', '.pPPPPp...', '..pppp....', '..pPPp....', '.p.PP.p...', 'p..pp..p..', '...pp.....', '..p..p....']);
  /* FALLING: everything open at once - four arms out and the mouth with it */
  const fall1 = c(['p..pppp..p', '.pPPPPPPp.', 'p.pvrrvp.p', '.pPPPPPPp.', 'p..pppp..p', '..pPPPPp..', '.p.pppp.p.', 'p...pp...p', '..p.pp.p..', '.p..pp..p.']);
  const fall2 = c(['.p.pppp.p.', 'p.pPPPPp.p', '.ppvrrvpp.', 'p.pPPPPp.p', '.p.pppp.p.', '..pPPPPp..', 'p..pppp..p', '.p..pp..p.', 'p...pp...p', '..p.pp.p..']);
  /* HOLDING ON: wrapped round whatever it caught */
  const hold = c(['..pppp....', '.pPPPPp...', '.pvrrvp...', 'ppPPPPpp..', 'p.pppp.p..', 'p.pPPp.p..', '.p.pp.p...', '..pppp....', '..p..p....', '.p....p...']);
  return pack([cling, fall1, fall2, hold], 5, 10, 10, 10);
}
// ============================================================================================
// THE DEEP, three of them. Two of the three do not want your blood, they want your WEIGHT.
// ============================================================================================
// THE PRISE — 14x10. One claw the size of the rest of it and one that is no use at all. It has
// spent a hundred years prising things off the bottom and it does not much care that this one
// has hands. It is drawn lopsided on purpose: whatever it is going to do, it does with THAT.
export function bakePrise() {
  const PP = Object.assign({}, EP, { c: '#b8a898', C: '#8a7a68', p: '#e0d4c4', k: '#3a3028', r: '#c9463d', e: '#f6f6ee' });
  const p = rows => outline(fromGrid(rows, PP, 1), OUT);
  const legs = '.C.C....C.C...';
  const walk1 = p(['....cccc......', '...cCCCCc.....', '...cerreC.ppp.', '...cCCCCc.pppp', '....cccc..pppp', '..C.CCCC..ppp.', legs, 'C.........C...', '..............', '..............']);
  const walk2 = p(['....cccc......', '...cCCCCc.....', '...cerreC..ppp', '...cCCCCc..ppp', '....cccc...ppp', '..C.CCCC...pp.', '.C.C....C.C...', '..C.......C...', '..............', '..............']);
  /* THE REACH: the claw comes up and OPENS, which is the only warning you get and all you need */
  const reach = p(['....cccc...pp.', '...cCCCCc.p..p', '...cerreC.p...', '...cCCCCc.p..p', '....cccc...pp.', '..C.CCCC..ppp.', legs, 'C.........C...', '..............', '..............']);
  const snap = p(['....cccc..pppp', '...cCCCCc.pppp', '...cerreCppppp', '...cCCCCc.pppp', '....cccc..pppp', '..C.CCCC..ppp.', legs, 'C.........C...', '..............', '..............']);
  return pack([walk1, walk2, reach, snap], 7, 10, 14, 10);
}
// THE HOLDFAST — 12x14. Rooted to the wreck it grew on and it has never moved in its life. It does
// not chase, it does not aim, and it does not let go: while it has you, the water above you may as
// well be rock. Read it by the FRONDS - open and drifting means it is waiting for you.
export function bakeHoldfast() {
  const HP = Object.assign({}, EP, { f: '#4a8a7a', F: '#2e5a50', m: '#c9463d', M: '#7a2a28', s: '#6a8a80', S: '#3e5a54', e: '#f6f6ee' });
  const h = rows => outline(fromGrid(rows, HP, 1), OUT);
  const stalk = ['....SS......', '....SS......', '....SS......', '...sSSs.....', '...sSSs.....', '..sSSSSs....'];
  const open = h(['f..f..f..f..', '.f.f..f.f...', '..ff..ff....', '..fMMMMf....', '..fMmmMf....', '..ffMMff....', ...stalk]);
  const furl = h(['............', '...ff..ff...', '...ffffff...', '...fMMMMf...', '...fMmmMf...', '...ffffff...', ...stalk]);
  /* SHUT: everything folded in on whatever it caught, and one red seam down the middle of it */
  const shut = h(['............', '............', '...ffffff...', '...fFFFFf...', '...fFmmFf...', '...fFFFFf...', ...stalk]);
  return pack([open, furl, shut], 6, 14, 12, 14);
}
// THE DROWNED KING — 30x32, and he is the answer to the first three sentences of this game. Plate
// gone green, a crown that has not been off in thirty years, and the chain of every ship he ever
// took wound round him twice. He is the heaviest thing in the world and he has never once come up.
export function bakeDrownedKing() {
  // HE IS THE HEAVIEST THING IN THE WORLD AND HE SHOULD LOOK IT. The first one was thirty columns wide and
  // NINETEEN rows tall - a goblin chieftain's build - and packed against an anchor eleven pixels below the
  // bottom of its own image, so the last boss in the game hovered over the floor of his own hoard. This one
  // is 44x30 and built on a silhouette: a barnacled crown, a narrow head with two lamps in it, a mantle of
  // chain and weed spread wider than anything else in the game, a torso INSIDE that spread with the arms
  // clear of it, and greaves gone into the silt. Frames: stand, walk, THE DEBT, THE SLAM, THE UNDERTOW.
  const DP = Object.assign({}, EP, { p: '#5e9c86', P: '#3a6a5c', s: '#a8b8b2', S: '#6e7e7a', y: '#e0bc44', Y: '#a07e22',   /* lifted a shade to read under the throne room's water, with his swimming frames (king_swim.js) */
    i: '#7a8494', I: '#4e5664', g: '#7ff0e0', k: '#12201e', w: '#bcd0c8', e: '#f6f6ee', v: '#3e8a60', V: '#2a5a40', b: '#b8c0b4' });
  const d = rows => outline(fromGrid(rows, DP, 1), OUT);
  const over = (base, arms) => base.map((b, i) => b.split('').map((ch, k) => arms[i][k] !== '.' ? arms[i][k] : ch).join(''));
  const crown = ['...............y.y.y.y.y....................', '..............yyyyyyyyyyy...................', '..............yYYYYYYYYYy...................'];
  const head = ['...............sssssssss....................', '..............sSSSSSSSSSs...................', '..............sSggSSSggSs...................', '..............sSSSSSSSSSs...................', '...............wSSSSSSSw....................', '................wwwwwww.....................'];
  const mantle = ['.........iiiiiiivvvvvvviiiiiii..............', '.......iiIIIIIIIIIIIIIIIIIIIIIii............', '......iIIIIIIIIIIIIIIIIIIIIIIIIIi...........', '.....iIIIIvIIIIIIIIIIIIIIIIvIIIIIi..........'];
  const torso = ['..........ppppppppppppppp...................', '..........pPPPPPPPPPPPPPp...................', '..........pPPiiiiiiiiiPPp...................', '..........pPPiyyyyyyyiPPp...................', '..........pPPiiiiiiiiiPPp...................', '..........pPPPPPPPPPPPPPp...................', '..........pPPPPPPPPPPPPPp...................', '..........pPPvvPPPPPvvPPp...................', '..........ppppppppppppppp...................'];
  const down = ['.....ii..................ii.................', '....iIIi................iIIi................', '....iIIi................iIIi................', '....iIIi................iIIi................', '....iIIi................iIIi................', '....sSSs................sSSs................', '.....ss.................iIIi................', '........................sSSs................', '.........................ii.................'];
  const up = ['ii.....................................ii...', 'iIIi..................................iIIi..', 'iIIi..................................iIIi..', '.iIIi................................iIIi...', '..iIIi..............................iIIi....', '...sSSs............................sSSs.....', '....ss..............................ss......', '............................................', '............................................'];
  const slam = ['.........................iiiiiiiiiii........', '........................iIIIIIIIIIIIi.......', '.....ii..................iIIIIIIIIIi........', '....iIIi..................iiiiiiiii.........', '....iIIi....................................', '....sSSs....................................', '.....ss.....................................', '............................................', '............................................'];
  const wide = ['iIIi..................................iIIi..', '.sSSs................................sSSs...', '..ss..................................ss....', '............................................', '............................................', '............................................', '............................................', '............................................', '............................................'];
  const legsA = ['.........pPPPPPP...PPPPPPp..................', '.........pPPPPPP...PPPPPPp..................', '........iIIIIIIi...iIIIIIIi.................', '........iIIIIIIi...iIIIIIIi.................', '.......sSSSSSSSs...sSSSSSSSs................', '.......sSSSSSSSs...sSSSSSSSs................', '......vvvvvvvvvv...vvvvvvvvvv...............', '.....VVVVVVVVVVVVVVVVVVVVVVVVV..............'];
  const legsB = ['........pPPPPPPPP.PPPPPPPPp.................', '.......pPPPPPPP.....PPPPPPPp................', '.......iIIIIIIi.....iIIIIIIi................', '......iIIIIIIi.......iIIIIIIi...............', '.....sSSSSSSSs.......sSSSSSSSs..............', '.....sSSSSSSSs.......sSSSSSSSs..............', '....vvvvvvvvvv.......vvvvvvvvvv.............', '...VVVVVVVVVVVVVVVVVVVVVVVVVVVVV............'];
  const put = (a, legs) => d([...crown, ...head, ...mantle, ...over(torso, a), ...legs]);
  /* and in the water: the stroke, the glide, the turn, the dive and the rise, every tell and blow of his swimming, and his hurt last (king_swim.js) */
  return pack(kingFrames([put(down, legsA), put(down, legsB), put(up, legsA), put(slam, legsB), put(wide, legsA)]), KING_AX, KING_AY, 30, 32);
}
// Cave bat — 12×6. Frames: hang (wings folded), fly1, fly2.
export function bakeBat() {
  // IT WAS A SMUDGE WITH A RED SLIT IN IT. A bat is ears, a small body and two big scalloped wings, and
  // the scallop is the whole read: a smooth wing is a bird. 14x8. Frames: hanging (folded), and two beats.
  const BP2 = Object.assign({}, EP, { b: '#3a3448', B: '#5a5468', r: '#ff4a3a' });
  const b = rows => outline(fromGrid(rows, BP2, 1), OUT);
  const hang = b(['...b......b...', '...bb....bb...', '....bbbbbb....', '...bbbrrbbb...', '....bBbbBb....', '.....bbbb.....', '......bb......', '.....b..b.....']);
  const fly1 = b(['b............b', 'bb..........bb', '.bb.b..b.b.bb.', '..bbbbbbbbbb..', '...b.bbbb.b...', '...bBbrrbBb...', '....bbbbbb....', '.....b..b.....']);
  const fly2 = b(['..............', '..............', '...bbbbbbbb...', '..bBbbrrbbBb..', '.bbbbbbbbbbbb.', 'bb.b.bbbb.b.bb', 'b...b....b...b', '.....b..b.....']);
  return pack([hang, fly1, fly2], 7, 8, 10, 6);
}

// STORM CROW — they come down the moor wind in strings. 10x5, three wingbeats, facing right.
export function bakeCrow() {
  // A BIRD, NOT A BAR. It was a flat dark rectangle with a red dot in it: no beak, no tail, no wing. A
  // crow in the air is a head, a wedge of body, a fanned tail and two wings that go up, level and down -
  // and the wingbeat is the only thing that says BIRD at this size. 13x8, facing right.
  const CP = Object.assign({}, EP, { k: '#2a2433', K: '#4a4458', r: '#ff4a3a', y: '#c9a83a' });
  const c = rows => outline(fromGrid(rows, CP, 1), OUT);
  const body = ['kkkkkkkkKkkry', '.kkkkkkkkkkk.', '..kkkkkkkk...', '....k...k....'];
  const up = c(['..k.....k....', '..kk...kk....', '...kkkkk.....', ...body]);
  const mid = c(['.............', 'kkk.......k..', '.kkkkkkkkk...', ...body]);
  const down = c(['.............', '.............', '.............', ...body, '..kk...kk....', '..k.....k....']);
  return pack([up, mid, down], 7, 5, 11, 5);
}

// HORNBLOWER — a goblin with a ram's horn. Frames: idle (horn at the hip), tell (horn raised), blow (horn at the mouth).
export function bakeHornblower() {
  /* THE HORNBLOWER carries a horn bigger than his head, slung so it rides in a HOOP over him - a ring above a
     goblin is a horn before it is anything else. When he lifts it, it stands up off his face like a tusk. */
  const head = ['...gggg.......', '..gggggg......', '.geoggeog.....', '.gggggggg.....', '..gGGGGg......', '...gggg.......'];
  const legs = ['..GG..GG......', '.GG....GG.....'];
  const hoop = ['..yyyy........', '.y....y.......', 'y......y......'];
  const slung = rows => rows.map((r, i) => { const a = r.split(''); if (i === 0) { a[0] = 'y'; } if (i === 1) { a[1] = a[1] === '.' ? 'y' : a[1]; } return a.join(''); });
  const E = '..............';
  const idle = sprite([...hoop, ...slung(head), '..rrrrrr......', '..rrrrrr......', ...legs]);
  const tell = sprite(['............y.', '...........yy.', '..........yy..', '...gggg...yy..', '..gggggg.yy...', '.geoggeogy....', head[3], head[4], head[5], '..rrrrrr......', '..rrrrrr......', ...legs]);
  const blow = sprite([E, E, E, head[0], head[1], '.geoggeogyyy..', '.gGgggggg.yyyy', '..gGGGGg...yy.', head[5], '..rrrrrr......', '..rrrrrr......', ...legs]);
  return pack([idle, tell, blow], 6, 14, 8, 10);
}
// THE FREEBOOTER: what is left of a crew whose ship you took. No plate on him anywhere - a tricorne with a
// feather in it, a patch over one eye, a dark coat with brass on it and a red sash - and he carries a cutlass
// in one hand and a pistol in the other. Frames as the knight's, plus cast (the hook) and blast (the shot).
const FREE_BODY = [
  '...vvvv...',
  '..vvvvvv..',
  'vvvvvvvvvv',
  '..kvkkkk..',
  '..kWWkk...',
  '...ssss...',
  '.bBssssBb.',
  '.bBrrrrBb.',
  '.bBbssbBb.',
  '.bbbyybbb.',
  '..wwwwww..',
];
const FREE_PLUME = [
  ['.r.vvvv...', '..vvvvvv..', 'vvvvvvvvvv'],
  ['r..vvvv...', '..vvvvvv..', 'vvvvvvvvvv'],
  ['..rvvvv...', '..vvvvvv..', 'vvvvvvvvvv'],
];
const FREE_PAL = { s: '#e8e0cc', S: '#b0a68e', b: '#2c3a56', B: '#18202f', r: '#a8323a', y: '#e0b040',
  k: '#d8a878', w: '#5c3f24', W: '#3a2a18', v: '#15181f' };
export function bakeFreebooter(skin = {}, previewOnly = false) {
  KP = Object.assign({}, KP0, FREE_PAL, skin); BODY_REF = FREE_BODY; PLUME_REF = FREE_PLUME;
  const sh = [BX + 8, BY + 7];
  const rest = (d = 0) => [sh[0] + 1, sh[1] + 2 + d, sh[0] + 7, sh[1] + 7 + d];      // the cutlass low and out, ready
  const carry = (d = 0) => [sh[0], sh[1] + 3 + d, sh[0] + 5, sh[1] + 9 + d];         // and down at his side at a run
  const holster = (d = 0) => [sh[0] - 2, sh[1] + 3 + d, sh[0] - 5, sh[1] + 2 + d];   // the pistol through his belt
  // A STORE CARD NEEDS ONLY THE BREATH AND THE SWING, not the whole fighting life.
  const card = {
    idle: () => ((previewOnly === 'icon' ? (BREATH).slice(0, 1) : (BREATH)).map(([dy, hy, sho, plume], i) => { const lag = breathLag(i);
      return knightFrame({ dy, hy, sho, plume, cutlass: [sh[0] + 1, sh[1] + 2, sh[0] + 7, sh[1] + 7 + lag - dy], pistol: holster(), bits: flap([1], dy, lag, 'b', 'B') }); })),
    atk: () => ([
      () => (knightFrame({ dx: -1, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 1, sh[1] - 3], cutlass: [sh[0] - 1, sh[1] - 3, sh[0] - 6, sh[1] - 7], pistol: holster(), plume: 1 })),
      () => (knightFrame({ dx: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 4], cutlass: [sh[0] + 3, sh[1] - 4, sh[0] + 9, sh[1] - 6], pistol: holster(), plume: 2 })),
      () => (knightFrame({ dx: 2, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 4, sh[1] - 1], cutlass: [sh[0] + 4, sh[1] - 1, sh[0] + 12, sh[1] + 1], pistol: holster(), plume: 2 })),
      () => (knightFrame({ dx: 2, dy: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 2], cutlass: [sh[0] + 4, sh[1] + 2, sh[0] + 10, sh[1] + 7], pistol: holster(1), plume: 0 })),
      () => (knightFrame({ cutlass: rest(), pistol: holster(), plume: 0 }))
    ].map((make, i) => (previewOnly === 'weaponIcon' && i > 1) || (previewOnly === 'atk' && i > 2) ? null : make()))
  };
  if (previewOnly) return storeFrames(card, false, previewOnly, SMEAR_COL.steel);
  const F = {
    /* HIS BREATH: the hat and the feather ride it, the coat tail hangs a beat behind, and the cutlass point dips after the hand */
    idle: card.idle(),
    run: [['run1', -1], ['run2', 0], ['run3', 1], ['run4', 0], ['run5', -1], ['run6', 0]].map(([l, dy], i) => knightFrame({ legs: l, dy, plume: i % 3, cutlass: [sh[0], sh[1] + 3, sh[0] + 5, sh[1] + 8 - Math.max(0, dy)], pistol: holster() })),   /* carried down at his side, the point clear of the deck: carry()'s point went two and three pixels into it on the stride */
    jump: [knightFrame({ legs: 'jump', dy: -1, cutlass: [sh[0] + 1, sh[1], sh[0] + 7, sh[1] - 5], pistol: holster(), plume: 1 }), knightFrame({ legs: 'jump2', cutlass: [sh[0] + 1, sh[1], sh[0] + 7, sh[1] - 4], pistol: holster(), plume: 1 })],
    fall: [knightFrame({ legs: 'fall', cutlass: [sh[0] + 1, sh[1] + 1, sh[0] + 7, sh[1] - 4], pistol: holster(), plume: 2 }), knightFrame({ legs: 'fall2', dy: -1, cutlass: [sh[0] + 1, sh[1] + 1, sh[0] + 6, sh[1] - 5], pistol: holster(), plume: 2 })],
    /* LANDING in three beats, as the starters': the IMPACT deep on bent knees with the cutlass point down near the boards, the SETTLE, and up */
    land: [knightFrame({ legs: 'crouch', legsDy: 3, dy: 4, cutlass: [sh[0] + 1, sh[1] + 1, sh[0] + 7, sh[1] + 4], pistol: holster(), plume: 2 }), knightFrame({ legs: 'land', dy: 2, cutlass: rest(2), pistol: holster(2) }), knightFrame({ legs: 'stand', dy: 1, cutlass: rest(1), pistol: holster(1), plume: 1 })],
    /* THE TAKE-OFF: stretched off the push, the cutlass thrown up by the lift of it */
    takeoff: knightFrame({ legs: 'push', dy: -2, sho: 1, cutlass: [sh[0] + 1, sh[1], sh[0] + 6, sh[1] - 7], pistol: holster(), plume: 2 }),
    apex: knightFrame({ legs: 'jump2', dy: -1, cutlass: [sh[0] + 1, sh[1], sh[0] + 7, sh[1] - 6], pistol: holster(), plume: 0 }),
    skid: knightFrame({ dx: -2, legs: 'wide', cutlass: [sh[0] - 1, sh[1] + 3, sh[0] - 6, sh[1] + 8], pistol: holster(1), plume: 2 }),
    // THE PISTOL: he brings it up across his body, levels it, and it goes off
    heavy: [
      knightFrame({ dx: -1, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 2, sh[1] - 2], pistol: [sh[0] - 2, sh[1] - 2, sh[0] - 6, sh[1] - 5], cutlass: carry(), plume: 2 }),
      knightFrame({ legs: 'wide', arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 3], pistol: [sh[0] + 3, sh[1] - 3, sh[0] + 10, sh[1] - 4], cutlass: carry(1), plume: 1 }),
      knightFrame({ dx: -1, legs: 'wide', dy: 1, arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 4], pistol: [sh[0] + 2, sh[1] - 4, sh[0] + 9, sh[1] - 7], cutlass: carry(1), plume: 0 }),
    ],
    climb: [
      knightFrame({ legs: 'climbA', arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 7], cutlass: carry(), plume: 0 }),
      knightFrame({ legs: 'climbB', dy: 1, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 3], cutlass: carry(1), plume: 1 }),
    ],
    // FIVE BLOWS: nobody else gets a run this long, and none of them weigh anything
    atk: card.atk(),
    /* THE BOARDING STOMP: boot-first, the same tuck the knight's poke uses (both knees drawn up level, the legs
       gone from under him) so he reads as a man dropping onto a deck, not a man still falling - the cutlass trails
       point-down past his boots, one hand only, the pistol kept through the belt for when he lands. */
    plunge: knightFrame({ legs: 'tuck', hy: 1, arm: [sh[0], sh[1], sh[0] - 1, sh[1] + 2], cutlass: [sh[0] - 2, sh[1] + 3, sh[0] - 2, sh[1] + 15], pistol: holster(), plume: 2 }),
    /* THE BOARDING LUNGE: the cutlass thrust out flat, level with the shoulder - no arc, no overhead, just the point
       going where the run was already taking him - and the coat streams the way it does at a full run, not a swing. */
    dashAtk: [
      knightFrame({ wide: 3, dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 2], cutlass: [sh[0] + 3, sh[1] - 2, sh[0] + 14, sh[1] - 3], pistol: holster(), plume: 2 }),
      knightFrame({ wide: 5, dx: 4, legs: 'run1', arm: [sh[0], sh[1], sh[0] + 6, sh[1] - 3], cutlass: [sh[0] + 6, sh[1] - 3, sh[0] + 20, sh[1] - 4], pistol: holster(), plume: 2 }),
      knightFrame({ dx: 1, dy: 1, legs: 'land', arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 1], cutlass: [sh[0] + 3, sh[1] - 1, sh[0] + 9, sh[1] + 2], pistol: holster(1), plume: 0 }),
    ],
    hurt: [knightFrame({ dx: -1, dy: 1, legs: 'fall', cutlass: [sh[0] + 1, sh[1] + 3, sh[0] + 6, sh[1] + 6], plume: 2 }), knightFrame({ dx: -2, dy: 2, legs: 'land', cutlass: [sh[0], sh[1] + 3, sh[0] + 5, sh[1] + 8], pistol: holster(2), plume: 1 })],
    crouch: knightFrame({ dy: 3, legs: 'crouch', legsDy: 3, cutlass: rest(-4), pistol: holster(0) }),
    /* THE BUTT-SLIDE (src/slide.js): sat back on the ground with the legs run out in front, leaning away from the hill, the weapon tucked behind (a second frame for the cloth) */
    slide: [0, 1].map(i => knightFrame({ dx: -3, dy: 3, legs: 'slide', legsDy: 3, plume: i * 2, arm: [sh[0], sh[1], sh[0] - 2, sh[1] + 4], cutlass: [sh[0] - 2, sh[1] + 4, sh[0] - 9, sh[1] + 2], pistol: holster(0) })),
    // THE PARRY: the blade up across him, both hands, and no shield anywhere
    block: [0, 1].map(i => knightFrame({ legs: 'wide', dy: i, arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 2], cutlass: [sh[0] + 2, sh[1] + 4, sh[0] + 4, sh[1] - 8], pistol: holster(i) })),
    // THE HOOK: the line away from the free hand
    cast: [0, 1].map(i => knightFrame({ legs: 'stand', arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 3], cutlass: carry(), hook: [sh[0] + 3, sh[1] - 3, sh[0] + 11 + i * 3, sh[1] - 8 - i * 2] })),
    // THE SHOT, and the arm thrown up by it
    blast: [knightFrame({ legs: 'wide', arm: [sh[0], sh[1], sh[0] + 4, sh[1] - 3], pistol: [sh[0] + 4, sh[1] - 3, sh[0] + 11, sh[1] - 4], cutlass: carry() }),
      knightFrame({ dx: -1, legs: 'wide', dy: 1, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 5], pistol: [sh[0] + 3, sh[1] - 5, sh[0] + 9, sh[1] - 10], cutlass: carry(1) })],
  };
  // the dodge is a roll: he is the only one of them who has ever had to get out of the way for a living
  F.roll = [0, 1, 2, 3].map(i => knightFrame({ dy: 2, legs: i % 2 ? 'crouch' : 'wide', cutlass: carry(2), pistol: holster(2) }));
  { const arcs = comboArcs(sh, 'cutlass', 9, { pistol: holster() }); F.atkB = [...arcs.B, F.atk[4]]; F.atkC = [...arcs.T, F.atk[4]]; F.air = [...arcs.A, F.jump[1]]; F.fidget = [...arcs.I, F.idle[0]]; }   /* a cutlass backhand, and a lunge */
  /* HIS FIDGET: the pistol out of his belt, spun twice round the trigger finger, caught level, and the muzzle put to the
     brim of his hat to tip it before it goes home */
  { const hx = sh[0] + 4, hy0 = sh[1] + 1, arm = [sh[0], sh[1], hx, hy0];
    const SPIN = [[5, 0], [4, 3], [0, 5], [-4, 3], [-5, 0], [-4, -3], [0, -5], [4, -3]];
    const pf = v => knightFrame({ arm, cutlass: rest(), pistol: [hx, hy0, hx + v[0], hy0 + v[1]], plume: 0 });
    const spins = SPIN.map(pf), draw = knightFrame({ arm: [sh[0], sh[1], sh[0] - 1, sh[1] + 4], cutlass: rest(), pistol: holster(), plume: 1 });
    const tip = knightFrame({ hy: -1, arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 1], cutlass: rest(), pistol: [sh[0] + 2, sh[1] - 1, sh[0] + 3, sh[1] - 6], plume: 2 });
    const lower = knightFrame({ arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 1], cutlass: rest(), pistol: [sh[0] + 2, sh[1] - 1, sh[0] + 3, sh[1] - 6], plume: 1 });
    F.fidget = holdFrames([[draw, 1], [spins[0], 2], ...[1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0].map(k => [spins[k], 1]), [tip, 3], [lower, 1], [draw, 1], [F.idle[7], 1]]); }
  /* HIS DANCE, for the victory card: a HORNPIPE. He is the only hero holding something in each hand, so both go up -
     the cutlass one side and the pistol the other, a V over the tricorne that nobody else in the wood can make - and
     the work is all in the feet, a stride each way and a hop off the deck between them. */
  { const hp = (legs, dy, cut, pis, plume) => knightFrame({ legs, dy, plume, cutlass: cut, pistol: pis });
    const A = hp('run1', 0, [sh[0] + 2, sh[1] - 4, sh[0] + 8, sh[1] - 9], [sh[0] - 2, sh[1] - 4, sh[0] - 7, sh[1] - 7], 1);
    const B = hp('run5', 1, [sh[0] + 2, sh[1] - 3, sh[0] + 7, sh[1] - 7], [sh[0] - 2, sh[1] - 3, sh[0] - 6, sh[1] - 5], 2);
    const C = hp('runC', 0, [sh[0] + 3, sh[1] - 5, sh[0] + 9, sh[1] - 10], [sh[0] - 3, sh[1] - 5, sh[0] - 8, sh[1] - 8], 0);
    const D = hp('wide', 1, [sh[0] + 2, sh[1] - 2, sh[0] + 8, sh[1] - 6], [sh[0] - 2, sh[1] - 2, sh[0] - 7, sh[1] - 4], 2);
    const hop = hp('jump2', -2, [sh[0] + 2, sh[1] - 5, sh[0] + 8, sh[1] - 11], [sh[0] - 2, sh[1] - 5, sh[0] - 7, sh[1] - 9], 1);
    F.dance = holdFrames([[A, 2], [B, 2], [hop, 1], [C, 2], [D, 2], [hop, 1]]); }
  /* HIS OTHER TWO DANCES (heroanim lane, 2026-10-10). dance2 = THE SEA-LEGS, his idle solo: a roll-and-sway on the boards with the
     pistol spun over the brim, the cutlass swung behind the back and caught the other side, a heel-and-toe, and the hat tipped.
     dance3 = THE BROADSIDE, a boss down: the pistol fired at the sky (a white flash and the smoke), the cutlass tossed up and
     caught, a leap with both arms up, and a deep sweep of the hat to the deck. He always has both hands busy. */
  { const kf = o => knightFrame({ plume: 0, pistol: holster(), cutlass: rest(), ...o });
    const fl = (x, y) => [[x - BX, y - BY, '#ffffff'], [x - BX - 1, y - BY, '#ffd36b'], [x - BX + 1, y - BY, '#ffd36b'], [x - BX, y - BY - 1, '#ffd36b'], [x - BX, y - BY + 1, '#ffd36b']];
    const hx = sh[0] + 3, hy0 = sh[1] - 2;
    const sway = (l, dx, pl) => kf({ legs: l, dx, plume: pl, cutlass: carry() });
    const spinTop = v => kf({ arm: [sh[0], sh[1], hx, hy0 - 3], pistol: [hx, hy0 - 3, hx + v[0], hy0 - 3 + v[1]], cutlass: carry(), plume: 1 });
    const behind = kf({ legs: 'wide', dx: -1, arm: [sh[0], sh[1], sh[0] - 3, sh[1] + 2], cutlass: [sh[0] - 3, sh[1] + 2, sh[0] - 9, sh[1] - 3], plume: 2 });
    const across = kf({ legs: 'wide', dx: 1, arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 1], cutlass: [sh[0] + 4, sh[1] + 1, sh[0] + 12, sh[1] - 4], plume: 1 });
    const tipHat = kf({ hy: -1, arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 2], pistol: [sh[0] + 2, sh[1] - 2, sh[0] + 3, sh[1] - 7], plume: 2 });
    F.dance2 = holdFrames([[kf({ plume: 1 }), 2], [sway('run2', -1, 1), 2], [sway('run4', 1, 2), 2], [sway('run2', -1, 1), 2], [sway('run4', 1, 2), 2],
      [spinTop([4, 2]), 2], [spinTop([0, 5]), 2], [spinTop([-4, 2]), 2], [spinTop([0, -4]), 2], [spinTop([4, 2]), 2],
      [behind, 3], [across, 3], [kf({ legs: 'runC', dx: 1, plume: 2, cutlass: carry(1) }), 2], [kf({ legs: 'run5', dy: 1, plume: 1, cutlass: carry() }), 2],
      [tipHat, 4], [kf({ plume: 1 }), 2]]);
    const gun = (o = {}) => kf({ legs: 'wide', arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 5], pistol: [sh[0] + 3, sh[1] - 5, sh[0] + 5, sh[1] - 12], cutlass: carry(), plume: 2, ...o });
    const toss = kf({ legs: 'wide', arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 3], cutlass: [sh[0] + 1, sh[1] - 7, sh[0] + 5, sh[1] - 12], pistol: [sh[0] + 2, sh[1] - 3, sh[0] + 4, sh[1] - 8], plume: 1 });
    const catchF = kf({ legs: 'wide', dy: 1, arm: [sh[0], sh[1], sh[0] + 4, sh[1] - 3], cutlass: [sh[0] + 4, sh[1] - 3, sh[0] + 10, sh[1] - 9], plume: 2 });
    const leap = kf({ legs: 'jump', dy: -3, sho: 1, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 3], cutlass: [sh[0] + 3, sh[1] - 3, sh[0] + 8, sh[1] - 11], pistol: [sh[0] - 2, sh[1] - 3, sh[0] - 6, sh[1] - 11], plume: 2 });
    const sweep1 = kf({ dy: 1, hy: 1, arm: [sh[0], sh[1], sh[0] + 5, sh[1] + 3], pistol: [sh[0] + 5, sh[1] + 3, sh[0] + 9, sh[1] + 6], cutlass: carry(1), plume: 2 });
    const sweep2 = kf({ dy: 2, hy: 2, sho: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 6, sh[1] + 5], pistol: [sh[0] + 6, sh[1] + 5, sh[0] + 10, sh[1] + 8], cutlass: carry(2), plume: 2 });
    F.dance3 = holdFrames([[kf({ plume: 1 }), 1], [gun(), 2], [gun({ bits: fl(sh[0] + 5, sh[1] - 11) }), 2], [gun({ bits: [[sh[0] + 5 - BX, sh[1] - 12 - BY, '#ffffff'], [sh[0] + 6 - BX, sh[1] - 11 - BY, '#cfcfcf'], [sh[0] + 8 - BX, sh[1] - 11 - BY, '#9a9a9a']] }), 2],
      [toss, 2], [catchF, 2], [kf({ legs: 'crouch', legsDy: 3, dy: 4, cutlass: carry(2), plume: 2 }), 2], [leap, 3], [kf({ legs: 'land', dy: 2, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 3], cutlass: [sh[0] + 3, sh[1] - 3, sh[0] + 8, sh[1] - 11], plume: 0 }), 2],
      [sweep1, 3], [sweep2, 6], [sweep1, 2], [kf({ plume: 1 }), 2]]); }
  /* FOLLOW-THROUGH (heroanim lane, 2026-10-10): the two frames a light strike plays inside its existing recovery (main.js recPose branch; the beat table
     is at the top of src/attack-animation.js). A = the weapon spent, carried on low past the target, body one pixel forward, plume still flying;
     B = it coming back to guard, the weight settling. Art only: atkRec is read, never written. */
  F.follow = [knightFrame({ dx: 1, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 4], cutlass: [sh[0] + 3, sh[1] + 4, sh[0] + 8, sh[1] + 10], pistol: holster(1), plume: 1 }), knightFrame({ dy: 1, arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 3], cutlass: rest(1), pistol: holster(1), plume: 0 })];
  /* HIS SLUMP: he sits down on the boards. The cutlass is not held at all - it is stuck in the planking beside him,
     which is where a man puts a sword he has finished with - the pistol hangs off the other hand, and the brim of
     the tricorne is down over his face. */
  { const sat = (d, hy) => knightFrame({ dy: 4 + d, hy, legs: 'crouch', plume: 0,
      arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 2], cutlass: [sh[0] + 4, sh[1] - 3 - d, sh[0] + 4, sh[1] + 5 - d],
      pistol: [sh[0] - 3, sh[1] + 3, sh[0] - 6, sh[1] + 5] });
    F.slump = [sat(0, 1), sat(1, 2)]; }
  /* HIS SWIM: the cutlass kept in the stroke hand and the pistol left through his belt - a man who boards ships from the
     water does not let go of either. Treading, the blade is held out low in front of him. */
  { const S = swimRig(knightFrame, sh, { carry: { pistol: holster() }, hand: (hx, hy, ux, uy) => ({ cutlass: [hx, hy, Math.round(hx + ux * 7), Math.round(hy + uy * 7)] }),
      tread: i => ({ pistol: holster(TREAD_DY[i]), cutlass: [sh[0] + SCULL[i][0], sh[1] + SCULL[i][1] + TREAD_DY[i], sh[0] + SCULL[i][0] + 6, sh[1] + SCULL[i][1] + TREAD_DY[i] + 2] }) });
    F.swim = S.swim; F.tread = S.tread; }
  const mirror = f => Array.isArray(f) ? f.map(flipX) : flipX(f);
  /* DUCK AND RELOAD (src/crouch-a.js, claude/croucha): down on one knee with the pistol stood muzzle-up on his thigh and the ramrod going
     in and out of it (two beats), the cutlass laid by; and THE STEADY SHOT, the arm braced level from the crouch, then the flash off the
     muzzle with the barrel barely lifted (a standing shot throws his arm up). */
  { const knee = { dy: 3, legsDy: 3, legs: 'crouch', cutlass: [sh[0] + 1, sh[1] + 3, sh[0] + 7, sh[1] + 5] };
    const rod = up => up ? [[11, 1, '#c9d1dc'], [11, 2, '#c9d1dc'], [11, 3, '#8a939f'], [12, 1, '#e8e0cc']] : [[11, 3, '#c9d1dc'], [11, 4, '#8a939f'], [12, 3, '#e8e0cc']];
    F.reload = [0, 1].map(i => knightFrame({ ...knee, plume: i, arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 3], pistol: [sh[0] + 2, sh[1] + 3, sh[0] + 3, sh[1] - 2], bits: rod(!i) }));
    F.crouchShot = [knightFrame({ ...knee, plume: 1, arm: [sh[0], sh[1], sh[0] + 5, sh[1] + 1], pistol: [sh[0] + 5, sh[1] + 1, sh[0] + 12, sh[1] + 1] }),
      knightFrame({ ...knee, plume: 2, arm: [sh[0], sh[1], sh[0] + 5, sh[1]], pistol: [sh[0] + 5, sh[1], sh[0] + 12, sh[1] - 1], bits: [[21, 6, '#fff6c8'], [22, 6, '#ffd36b'], [21, 5, '#ffd36b']] })]; }
  directionalPoses(F, 'cutlass', { extra: { pistol: holster() } });
  pirateKitPoses(F, sh, holster, carry);
  smearPass(F, SMEAR_COL.steel);   /* the strike beats get their arc (claude/herokeys) */
  const R = F, L = {}; for (const k in F) L[k] = mirror(F[k]);
  const white = {}; for (const k in F) white[k] = Array.isArray(F[k]) ? F[k].map(c => whiten(c)) : whiten(F[k]);
  const whiteL = {}; for (const k in white) whiteL[k] = mirror(white[k]);
  KP = Object.assign({}, KP0); BODY_REF = BODY; PLUME_REF = PLUME;
  return { R, L, white: { R: white, L: whiteL }, ...KNIGHT_ANCHOR, ay: KNIGHT_ANCHOR.ay + ATTACK_HEADROOM };
}
// THE BLOOD KNIGHT (the Death Knight until claude/bloodknight; id 'reaper'): a horned helm with nothing in it but two crimson lights (they were green), plate the colour of a cold
// forge, a torn red surcoat, and a two-handed sword as long as he is with runes cut down the fuller.
// The silhouette has to say KNIGHT at sixteen pixels and say it from the horns and the pauldrons, because
// that is all there is room for - so the horns are the outermost pixels of the sprite and the shoulders
// are the widest.
/* (claude/bloodknightart) THE CRIMSON PASS: the horn tips are dipped in blood (r), the pauldrons are rimmed in it, the surcoat is wider and falls to a torn red hem over the dark plate */
const REAP_BODY = [
  'r........r',
  'vv......vv',
  '.vvSSSSvv.',
  '..Skyyks..',
  '..SkkkkS..',
  '..vSSSSv..',
  'rSbbBBbbSr',
  'rSbBrrBbSr',
  '.SbrrrrbS.',
  '.bbrrrrbb.',
  '..brrrrb..',
];
const REAP_PLUME = [
  ['r........r', 'vv......vv', '.vvSSSSvv.'],
  ['r........r', 'vv.....vvr', '.vvSSSSvv.'],
  ['.r......r.', 'vv......vv', '.vvSSSSvv.'],
];
const REAP_PAL = { s: '#c9a8b0', S: '#6a4a56', b: '#2a1e26', B: '#170f15', r: '#a0182e', y: '#ff3a4a', rune: '#ff4a5a', fuller: '#5a0a18',   /* (claude/bloodknight) THE BLOOD KNIGHT: crimson lights in the helm, plate gone to a dried-blood black, the surcoat a deeper red (the crimson art lane finishes it) */
 
  k: '#0a0c10', w: '#6a5a42', W: '#3e3428', v: '#3a2c38' };
/* THE DEATH KNIGHT 2's OWN BODY (claude/dk2art, scratch/brief-dk2.md, B16: every ability its own windup + release pose). THE RED RHYTHM's three cuts each a different
   blade (a rising low diagonal / a reverse sweep along the shins that hooks / a heavy overhead drag that drinks), GRAVE KNEEL (the blade planted point-down, both
   fists on the pommel, a red gleam at the point), THE BLOOD PRICE held (four beats - the blade drinking, longer and redder with every price) and THE CRESCENT CLEAVE
   (hauled up from behind, round through the whole front of him, and the follow-through). The beats are the attack-animation table's: 0 anticipation, 1 strike
   (smear), 2 extended (the live box), 3 recover, then the settle. Built with the headroom (an overhead blade needs the room), after directionalPoses padded the rest. */
function reaperRhythmPoses(F, sh, atkOnly = false) {
  const top = ATTACK_HEADROOM, [X, Y] = sh, OFF = [BX + 2, BY + 7], K = o => knightFrame({ top, ...o });
  const a = (x, y, col) => [x - BX, y - BY, col], RED = '#c0283a', DRED = '#7a1020', PINK = '#ff6b6b', HOT = '#ffd0d0';
  const gs = (hx, hy, tx, ty) => ({ arm: [X, Y, hx, hy], greatsword: [hx, hy, tx, ty] });
  const along = (hx, hy, tx, ty, n, col0, col1) => Array.from({ length: n }, (_, i) => { const t = (i + 1) / (n + 1); return a(Math.round(hx + (tx - hx) * t), Math.round(hy + (ty - hy) * t), i % 2 ? col1 : col0); });   /* blood standing on the steel */
  const rest = F.atk[4];
  /* 1 THE RISING CUT: the blade swept back and low behind his heel; whipped up through the front from the ankle; carried on up and over the line it rose along; held high and let go */
  F.atk = [K({ dx: -1, dy: 1, legs: 'wide', ...gs(X - 3, Y + 4, X - 15, Y + 9), plume: 1, bits: [a(X - 14, Y + 8, RED)] }),
    K({ wide: 6, dx: 1, legs: 'runC', ...gs(X + 3, Y + 3, X + 16, Y + 5), plume: 2 }),
    K({ wide: 10, dx: 2, legs: 'runC', ...gs(X + 5, Y - 1, X + 18, Y - 14), plume: 2, bits: [a(X + 17, Y - 13, HOT), a(X + 14, Y - 9, PINK), a(X + 9, Y - 4, RED)] }),
    K({ wide: 4, dx: 1, legs: 'wide', ...gs(X + 3, Y - 5, X + 6, Y - 19), plume: 1, bits: [a(X + 6, Y - 18, PINK), a(X + 5, Y - 14, RED)] }), rest];
  if (atkOnly) return;   /* (batch95 integ: the store card builds only the rising cut, so its frames are the game's) */
  /* 2 THE HOOK: the blade drawn back flat behind him, at the shin; laid out along the shins past the foe; the point left out there; and HAULED BACK in a curl, the foe with it */
  F.atkB = [K({ dx: -2, dy: 2, legs: 'wide', hy: 1, ...gs(X - 3, Y + 5, X - 16, Y + 8), plume: 1, bits: [a(X - 15, Y + 7, RED)] }),
    K({ wide: 8, dx: 1, dy: 2, legs: 'runC', ...gs(X + 4, Y + 6, X + 19, Y + 8), plume: 2 }),
    K({ wide: 12, dx: 2, dy: 2, legs: 'runC', ...gs(X + 6, Y + 6, X + 23, Y + 8), plume: 2, bits: [a(X + 23, Y + 9, HOT), a(X + 24, Y + 8, PINK), a(X + 24, Y + 6, RED), a(X + 22, Y + 5, DRED)] }),   /* (the hook: the point curls back) */
    K({ wide: 4, dx: 0, dy: 2, legs: 'wide', ...gs(X + 2, Y + 5, X + 9, Y + 9), plume: 0, bits: [a(X + 12, Y + 8, '#b8a890'), a(X + 14, Y + 9, '#8a7a5a'), a(X + 10, Y + 7, RED)] }), rest];
  /* 3 THE DRAG: the blade high behind his head in both fists; over the top; brought down heavy and out in front, drinking - the blood climbs the steel to his hands; dragged on the floor behind the blow */
  F.atkC = [K({ dx: -1, legs: 'wide', ...gs(X - 1, Y - 5, X - 6, Y - 21), plume: 1, bits: [...along(X - 1, Y - 5, X - 6, Y - 21, 2, DRED, RED)] }),
    K({ wide: 6, dx: 1, legs: 'wide', dy: -1, sho: 1, ...gs(X + 3, Y - 6, X + 12, Y - 19), plume: 2 }),
    K({ wide: 10, dx: 2, dy: 2, legs: 'wide', ...gs(X + 5, Y + 1, X + 20, Y + 8), plume: 2, bits: [...along(X + 5, Y + 1, X + 20, Y + 8, 4, RED, PINK), a(X + 3, Y + 1, HOT)] }),
    K({ wide: 6, dx: 2, dy: 3, legs: 'wide', ...gs(X + 4, Y + 3, X + 15, Y + 9), plume: 0, bits: [a(X + 6, Y + 8, '#b8a890'), a(X + 9, Y + 9, '#8a7a5a'), a(X + 4, Y + 2, PINK), a(X + 3, Y + 4, RED)] }), rest];
  /* GRAVE KNEEL: down on one knee with the greatsword planted point-down in front, both fists on the pommel, the helm bowed over it - a red gleam at the point that breathes;
     the third beat is a LOW BLOW TURNED: braced, the blade ringing, the red flung up off it */
  const kneel = (i, o = {}) => K({ dy: 3, legs: 'kneel', hy: 1, ...gs(X + 4, Y - 3, X + 6, Y + 6), arm2: [OFF[0], OFF[1], X + 4, Y - 3], greatsword: [X + 5, Y - 7, X + 6, Y + 6], plume: i + 1, ...o });
  F.graveKneel = [kneel(0, { bits: [a(X + 6, Y + 9, DRED), a(X + 5, Y + 9, DRED), a(X + 7, Y + 9, DRED)] }),
    kneel(1, { sho: 1, hy: 2, bits: [a(X + 6, Y + 9, PINK), a(X + 5, Y + 9, RED), a(X + 7, Y + 9, RED), a(X + 6, Y + 5, RED), a(X + 6, Y + 1, DRED), [4, 4, '#ff4a5a'], [5, 4, '#ff4a5a']] }),
    kneel(0, { dx: -1, wide: 4, bits: [a(X + 6, Y + 9, HOT), a(X + 4, Y + 8, PINK), a(X + 8, Y + 8, PINK), a(X + 3, Y + 7, RED), a(X + 9, Y + 7, RED), a(X + 5, Y + 3, HOT), a(X + 8, Y + 3, PINK), a(X + 6, Y - 1, PINK)] })];
  /* THE BLOOD PRICE, HELD: the blade back over his shoulder, point up behind him, drinking; four beats as the prices mount - the blade LONGER and REDDER, the helm's lights going red,
     the stance dropping and leaning into it; the last (the full price) white-hot at the point */
  const hold = (n, tipx, tipy, o) => K({ dx: -1 - (n > 1 ? 1 : 0), dy: 1 + (n > 1 ? 1 : 0), legs: 'wide', ...gs(X - 3, Y - 2, tipx, tipy), plume: 2, ...o });
  F.priceHold = [hold(0, X - 12, Y - 12, { bits: [...along(X - 3, Y - 2, X - 12, Y - 12, 2, DRED, RED)] }),
    hold(1, X - 13, Y - 15, { sho: 1, bits: [[4, 3, '#ff4a5a'], ...along(X - 3, Y - 2, X - 13, Y - 15, 3, RED, PINK)] }),
    hold(2, X - 14, Y - 18, { sho: 1, hy: 1, bits: [[4, 3, '#ff4a5a'], [5, 3, '#ff4a5a'], ...along(X - 3, Y - 2, X - 14, Y - 18, 4, RED, PINK), a(X - 15, Y - 19, HOT)] }),
    hold(3, X - 15, Y - 20, { sho: 1, hy: 1, bits: [[4, 3, HOT], [5, 3, HOT], [3, 3, '#ff4a5a'], [6, 3, '#ff4a5a'], ...along(X - 3, Y - 2, X - 15, Y - 20, 5, PINK, HOT), a(X - 16, Y - 21, '#ffffff'), a(X - 14, Y - 21, HOT), a(X - 16, Y - 19, PINK)] })];
  /* THE DRAIN (the boss's signature, BLOOD SURGE's second half - the hero has no such pose): the blade held low and back in one fist, the other hand thrown out open toward the one he drinks, claw-fingered, the lights in the helm gone red;
     the second beat the hand drawn in a pace with the red running back along the line into him */
  F.drainPull = [K({ wide: 8, dx: 1, legs: 'wide', arm: [X, Y, X - 2, Y + 3], greatsword: [X - 2, Y + 3, X - 8, Y + 9], arm2: [OFF[0], OFF[1], X + 10, Y - 3], plume: 2,
      bits: [[4, 3, '#ff4a5a'], [5, 3, '#ff4a5a'], a(X + 11, Y - 4, HOT), a(X + 12, Y - 2, PINK), a(X + 14, Y - 3, RED), a(X + 17, Y - 3, DRED)] }),
    K({ wide: 8, dx: 0, dy: 1, legs: 'wide', hy: 1, arm: [X, Y, X - 2, Y + 3], greatsword: [X - 2, Y + 3, X - 8, Y + 9], arm2: [OFF[0], OFF[1], X + 7, Y - 2], plume: 1,
      bits: [[4, 3, HOT], [5, 3, HOT], a(X + 8, Y - 3, HOT), a(X + 10, Y - 3, PINK), a(X + 12, Y - 2, RED), a(X + 14, Y - 3, PINK), a(X + 5, Y + 2, RED), a(X + 3, Y + 3, PINK)] })];
  /* THE CRESCENT CLEAVE: hauled up from behind, red running off the steel; round through the whole front of him, level and wide, at the full stretch of him; then down into the follow-through, the point trailing */
  F.crescent = [K({ dx: -2, legs: 'wide', ...gs(X - 3, Y - 6, X - 12, Y - 20), plume: 1, bits: [...along(X - 3, Y - 6, X - 12, Y - 20, 3, RED, PINK)] }),
    K({ wide: 14, dx: 3, legs: 'runC', ...gs(X + 6, Y - 4, X + 25, Y - 5), plume: 2, bits: [a(X + 25, Y - 5, '#ffffff'), a(X + 22, Y - 4, HOT), a(X + 18, Y - 4, PINK), a(X + 12, Y - 3, RED)] }),
    K({ wide: 10, dx: 3, dy: 3, legs: 'wide', ...gs(X + 5, Y + 3, X + 20, Y + 9), plume: 0, bits: [a(X + 17, Y + 8, PINK), a(X + 12, Y + 7, RED), a(X + 21, Y + 9, '#b8a890'), a(X + 9, Y + 4, DRED)] })];
}
/* ==== THE BLOOD KNIGHT'S FIVE TIERS, BLOOD SPIKE AND BLOOD PRICE (claude/bloodknightart; B16: each its OWN windup + release, scratch/brief-bloodknight-1017.md).
   Wind keys (looped while the hold builds): rendWind, sunderWind, crescentWind, exsWind, moonWind. Release keys (three beats: anticipation, strike, extended):
   rend, sunder, (crescent: reaperRhythmPoses), exsanguinate, bloodMoon. Each tier's blade is wetter and its helm lights hotter than the last. ==== */
function reaperBloodPoses(F, sh) {
  const top = ATTACK_HEADROOM, [X, Y] = sh, OFF = [BX + 2, BY + 7], K = o => knightFrame({ top, ...o });
  const a = (x, y, col) => [x - BX, y - BY, col], RED = '#c0283a', DRED = '#7a1020', PINK = '#ff6b6b', HOT = '#ffd0d0', BLK = '#3a0a10', WHT = '#ffffff';
  const gs = (hx, hy, tx, ty) => ({ arm: [X, Y, hx, hy], greatsword: [hx, hy, tx, ty] });
  const gs2 = (hx, hy, tx, ty) => ({ arm: [X, Y, hx, hy], arm2: [OFF[0], OFF[1], hx, hy], greatsword: [hx, hy, tx, ty] });
  const along = (hx, hy, tx, ty, n, c0, c1) => Array.from({ length: n }, (_, i) => { const t = (i + 1) / (n + 1); return a(Math.round(hx + (tx - hx) * t), Math.round(hy + (ty - hy) * t), i % 2 ? c1 : c0); });
  const lights = c => [[4, 3, c], [5, 3, c]];
  const GROUND = 9;   /* feet, in shoulder rows */
  /* T1 REND: the blade held ACROSS his chest, the point behind him at the shoulder (the rear fist forward) - a backhand cleave cocked tight; two beats, the edge wetting */
  F.rendWind = [K({ dx: -1, legs: 'wide', ...gs2(X + 2, Y, X - 14, Y - 3), plume: 1, bits: [a(X - 13, Y - 3, DRED)] }),
    K({ dx: -1, dy: 1, legs: 'wide', ...gs2(X + 2, Y + 1, X - 15, Y - 4), plume: 2, bits: [a(X - 14, Y - 4, RED), a(X - 9, Y - 2, DRED), ...lights(PINK)] })];
  F.rend = [K({ dx: -2, dy: 1, legs: 'wide', ...gs2(X + 2, Y + 1, X - 15, Y - 4), plume: 1, bits: [a(X - 14, Y - 4, RED), a(X - 9, Y - 2, PINK)] }),
    K({ wide: 12, dx: 2, legs: 'runC', ...gs(X + 5, Y - 1, X + 22, Y - 2), plume: 2, bits: [a(X + 22, Y - 2, WHT), a(X + 18, Y - 1, HOT), a(X + 13, Y - 1, PINK), a(X + 8, Y, RED), a(X + 5, Y + 2, DRED)] }),
    K({ wide: 8, dx: 3, dy: 1, legs: 'wide', ...gs(X + 6, Y - 3, X + 16, Y - 14), plume: 0, bits: [a(X + 16, Y - 14, HOT), a(X + 14, Y - 11, PINK), a(X + 11, Y - 8, RED), a(X + 18, Y - 8, DRED), a(X + 20, Y - 5, RED)] })];
  /* T2 SUNDER: the greatsword straight up over his head in both fists, set wide and low under it - trembling; the weight of it */
  F.sunderWind = [K({ dy: 1, legs: 'wide', sho: 1, ...gs2(X + 1, Y - 6, X + 1, Y - 24), plume: 2, bits: [...along(X + 1, Y - 6, X + 1, Y - 24, 2, DRED, RED)] }),
    K({ dy: 2, legs: 'wide', sho: 1, hy: 1, ...gs2(X, Y - 5, X - 1, Y - 24), plume: 1, bits: [...lights(PINK), ...along(X, Y - 5, X - 1, Y - 24, 3, RED, PINK), a(X - 1, Y - 25, HOT)] })];
  F.sunder = [K({ dx: -1, dy: 1, legs: 'wide', sho: 1, ...gs2(X - 1, Y - 7, X - 8, Y - 24), plume: 1, bits: [...lights(PINK), ...along(X - 1, Y - 7, X - 8, Y - 24, 3, RED, PINK)] }),
    K({ wide: 8, dx: 2, dy: 1, legs: 'wide', sho: 1, ...gs2(X + 4, Y - 1, X + 14, Y + 8), plume: 2, bits: [a(X + 14, Y + 8, WHT), a(X + 13, Y + 6, HOT), a(X + 11, Y + 5, PINK), a(X + 8, Y + 2, RED)] }),
    K({ wide: 10, dx: 2, dy: 2, legs: 'wide', ...gs2(X + 5, Y + 1, X + 17, Y + 7), plume: 0, bits: [a(X + 16, Y + GROUND, BLK), a(X + 19, Y + GROUND, BLK), a(X + 13, Y + GROUND, DRED), a(X + 21, Y + GROUND - 1, DRED), a(X + 18, Y + GROUND - 3, RED), a(X + 20, Y + GROUND - 4, PINK), a(X + 15, Y + GROUND - 3, PINK), a(X + 22, Y + GROUND - 6, RED), a(X + 12, Y + GROUND - 2, RED)] })];
  /* T3 CRIMSON CRESCENT: wound round behind him - the blade low and laid right back with the red gathering in an arc on the edge; the strike + follow-through are THE CRESCENT CLEAVE (reaperRhythmPoses) */
  F.crescentWind = [K({ dx: -2, legs: 'wide', ...gs2(X - 2, Y - 2, X - 18, Y - 9), plume: 1, bits: [a(X - 18, Y - 9, RED), a(X - 14, Y - 11, DRED), a(X - 10, Y - 11, PINK)] }),
    K({ dx: -3, dy: 1, legs: 'wide', sho: 1, ...gs2(X - 3, Y - 4, X - 19, Y - 12), plume: 2, bits: [...lights(PINK), a(X - 19, Y - 12, HOT), a(X - 15, Y - 14, PINK), a(X - 11, Y - 14, RED), a(X - 8, Y - 12, PINK), a(X - 6, Y - 9, DRED)] })];
  /* T4 EXSANGUINATE: dropped low, the greatsword drawn back level along the flank and the point to the rear like a spear cocked to throw, the blood already running to the hands */
  F.exsWind = [K({ dx: -2, dy: 2, legs: 'wide', ...gs2(X - 1, Y + 3, X - 14, Y + 3), plume: 1, bits: [a(X - 14, Y + 3, RED), ...along(X - 1, Y + 3, X - 14, Y + 3, 3, DRED, RED)] }),
    K({ dx: -3, dy: 3, legs: 'crouch', legsDy: 2, sho: 1, hy: 1, ...gs2(X - 2, Y + 4, X - 15, Y + 4), plume: 2, bits: [...lights(HOT), a(X - 15, Y + 4, WHT), ...along(X - 2, Y + 4, X - 15, Y + 4, 4, RED, PINK), a(X - 6, Y + 6, RED)] })];
  /* (claude/bkpolish) THE LONG HOLD TREMBLES (bkfeel: T4/T5 are held to 1.9 / 2.6 s now): two more frames that shake the whole body a pixel and shiver the blood on the blade, cycled fast by bkWindPose */
  F.exsWind.push(K({ dx: -1, dy: 3, legs: 'crouch', legsDy: 2, sho: 1, hy: 1, ...gs2(X - 1, Y + 4, X - 14, Y + 5), plume: 0, bits: [...lights(HOT), a(X - 14, Y + 5, WHT), ...along(X - 1, Y + 4, X - 14, Y + 5, 4, PINK, RED), a(X - 8, Y + 7, DRED)] }),
    K({ dx: -3, dy: 2, legs: 'crouch', legsDy: 2, sho: 1, hy: 1, ...gs2(X - 2, Y + 3, X - 15, Y + 3), plume: 1, bits: [...lights(PINK), a(X - 15, Y + 3, HOT), ...along(X - 2, Y + 3, X - 15, Y + 3, 4, RED, PINK), a(X - 11, Y + 6, RED)] }));
  F.exsanguinate = [K({ dx: -3, dy: 3, legs: 'crouch', legsDy: 2, hy: 1, ...gs2(X - 2, Y + 4, X - 15, Y + 4), plume: 2, bits: [...lights(HOT), ...along(X - 2, Y + 4, X - 15, Y + 4, 4, RED, PINK)] }),
    K({ wide: 14, dx: 5, dy: 1, legs: 'runC', ...gs2(X + 6, Y + 1, X + 27, Y), plume: 2, bits: [a(X + 27, Y, WHT), a(X + 23, Y, HOT), a(X + 18, Y + 1, PINK), a(X + 12, Y + 1, RED), a(X + 5, Y + 3, DRED)] }),
    K({ wide: 14, dx: 4, dy: 2, legs: 'wide', ...gs2(X + 6, Y + 2, X + 26, Y + 1), plume: 0, bits: [a(X + 26, Y + 1, WHT), a(X + 27, Y + 4, RED), a(X + 27, Y + 7, DRED), a(X + 25, Y + 9, RED), a(X + 22, Y + 1, HOT), a(X + 17, Y + 2, PINK), a(X + 12, Y + 2, RED), a(X + 8, Y + 3, PINK), a(X + 5, Y + 4, DRED)] })];
  /* T5 BLOOD MOON: stretched up onto his toes, arms locked straight up and the greatsword over him with a red moon of motes gathering round the point */
  const moon = (n, c1, c2) => Array.from({ length: n }, (_, i) => { const an = i / n * Math.PI * 2; return a(Math.round(X + 1 + Math.cos(an) * 5), Math.round(Y - 27 + Math.sin(an) * 4), i % 2 ? c1 : c2); });
  F.moonWind = [K({ dy: -1, legs: 'wide', sho: 1, hy: -1, ...gs2(X + 1, Y - 8, X + 1, Y - 26), plume: 2, bits: [...lights(PINK), ...moon(5, RED, DRED)] }),
    K({ dy: -2, legs: 'stand', sho: 1, hy: -1, ...gs2(X + 1, Y - 9, X, Y - 27), plume: 1, bits: [...lights(HOT), ...moon(8, PINK, RED), a(X, Y - 28, WHT)] }),
    K({ dy: -1, legs: 'wide', sho: 1, hy: -1, ...gs2(X + 1, Y - 8, X + 1, Y - 26), plume: 0, bits: [...lights(HOT), ...moon(8, HOT, PINK), a(X + 1, Y - 27, WHT), a(X + 6, Y - 22, RED), a(X - 4, Y - 22, RED)] })];
  F.moonWind.push(K({ dx: 1, dy: -2, legs: 'stand', sho: 1, hy: -1, ...gs2(X + 2, Y - 9, X + 2, Y - 27), plume: 1, bits: [...lights(HOT), ...moon(8, HOT, PINK).map(([x, y, c]) => [x + 1, y, c]), a(X + 2, Y - 28, WHT)] }),
    K({ dx: -1, dy: -1, legs: 'wide', sho: 1, hy: -1, ...gs2(X, Y - 8, X, Y - 26), plume: 2, bits: [...lights(HOT), ...moon(8, PINK, RED).map(([x, y, c]) => [x - 1, y + 1, c]), a(X, Y - 27, WHT), a(X + 6, Y - 21, PINK), a(X - 5, Y - 23, RED)] }));   /* (claude/bkpolish) it shakes under the weight of the moon */
  const geyser = (r, col) => { const o = []; for (const sx of [-1, 1]) for (let k = 1; k <= 4; k++) for (let j = 0; j < r - k; j++) o.push(a(X + 8 + sx * k * 5, Y + GROUND - j, j > r - k - 2 ? PINK : (j % 2 ? RED : col))); return o; };
  F.bloodMoon = [K({ dy: -2, legs: 'wide', sho: 1, hy: -1, ...gs2(X, Y - 9, X - 4, Y - 26), plume: 2, bits: [...lights(HOT), ...moon(8, HOT, PINK).map(([x, y, c]) => [x - 4, y + 1, c]), a(X - 4, Y - 27, WHT)] }),
    K({ wide: 6, dx: 2, dy: 2, legs: 'wide', ...gs2(X + 4, Y - 1, X + 9, Y + 9), plume: 1, bits: [a(X + 9, Y + 9, WHT), a(X + 9, Y + 6, HOT), a(X + 8, Y + 3, PINK), a(X + 6, Y + 1, RED)] }),
    K({ wide: 14, dx: 2, dy: 2, legs: 'wide', ...gs2(X + 5, Y + 2, X + 9, Y + 9), plume: 0, bits: [...lights(HOT), ...geyser(11, DRED), a(X + 9, Y + GROUND, WHT), a(X + 8, Y + GROUND - 1, HOT), a(X + 10, Y + GROUND - 1, HOT), a(X + 13, Y + GROUND - 10, RED), a(X + 3, Y + GROUND - 11, PINK)] })];
  /* (claude/bkpolish) THE FLICK (tap C, bkfeel): the blade snapped up off the low guard in both fists with the edge turned out - a flat blood-bright streak where it cut the air - then left up and quivering a beat */
  F.bkFlick = [K({ dx: -1, dy: 1, legs: 'wide', sho: 1, ...gs2(X + 2, Y + 2, X + 14, Y + 8), plume: 2, bits: [a(X + 12, Y + 7, PINK), a(X + 8, Y + 5, DRED)] }),
    K({ wide: 6, dx: 0, legs: 'wide', ...gs2(X + 3, Y - 2, X + 12, Y - 17), plume: 1, bits: [...lights(PINK), a(X + 12, Y - 17, WHT), a(X + 11, Y - 14, HOT), a(X + 9, Y - 10, PINK), a(X + 6, Y - 5, RED), a(X + 15, Y - 12, DRED), a(X + 14, Y - 8, RED)] })];
  /* BLOOD SPIKE (the low parry, on the beat): kneeling behind the planted blade, the blow turned - crimson spikes come up out of the ground round it, short and then full height */
  const spikes = (h, cols) => { const o = []; for (const [dx0, hh] of [[-9, 0.6], [-5, 1], [-1, 0.5], [3, 0.8], [8, 1], [12, 0.7], [16, 0.5]]) { const H = Math.max(2, Math.round(h * hh)); for (let j = 0; j < H; j++) { o.push(a(X + dx0, Y + 9 - j, j >= H - 1 ? HOT : cols[j % 2])); if (j < H - 2) o.push(a(X + dx0 + 1, Y + 9 - j, j < H - 3 ? DRED : cols[0])); } } return o; };
  const kn = (o = {}) => K({ dy: 3, legs: 'kneel', hy: 1, ...gs(X + 4, Y - 3, X + 6, Y + 6), arm2: [OFF[0], OFF[1], X + 4, Y - 3], greatsword: [X + 5, Y - 7, X + 6, Y + 6], plume: 1, ...o });
  F.bloodSpike = [kn({ dx: -1, bits: [...lights(PINK), ...spikes(5, [DRED, RED])] }),
    kn({ dx: -1, sho: 1, hy: 2, plume: 2, bits: [...lights(HOT), ...spikes(11, [RED, PINK]), a(X + 6, Y + 8, HOT)] }),
    /* (claude/bkkit2) the third beat: risen half off the knee, the blade wrenched up out of the ground in both fists with the blood shaken off its point, the spikes sinking back dark */
    K({ dy: 1, legs: 'wide', sho: 1, hy: -1, ...gs(X + 5, Y - 4, X + 9, Y - 18), plume: 2, bits: [...lights(PINK), ...spikes(4, [DRED, DRED]), a(X + 9, Y - 19, HOT), a(X + 11, Y - 16, RED), a(X + 7, Y - 21, PINK), a(X + 12, Y - 12, DRED)] })];
  /* BLOOD PRICE (DOWN+C): on one knee, the greatsword laid across his knee in the right fist and the LEFT PALM drawn along the flat of the edge - the blood opens, runs down the steel, drips */
  const lay = (o = {}) => K({ dy: 3, legs: 'kneel', hy: 1, arm: [X, Y, X + 1, Y + 3], greatsword: [X + 1, Y + 3, X + 18, Y + 4], plume: 1, ...o });
  F.price = [lay({ arm2: [OFF[0], OFF[1], X + 5, Y + 2], bits: [a(X + 6, Y + 3, DRED), ...lights(PINK)] }),
    lay({ sho: 1, arm2: [OFF[0], OFF[1], X + 11, Y + 2], bits: [...lights(PINK), ...along(X + 5, Y + 4, X + 12, Y + 4, 4, RED, PINK), a(X + 12, Y + 3, HOT), a(X + 10, Y + 8, RED), a(X + 7, Y + 9, DRED)] }),
    lay({ hy: 2, arm2: [OFF[0], OFF[1], X + 16, Y + 2], bits: [...lights(HOT), ...along(X + 3, Y + 4, X + 18, Y + 4, 7, RED, PINK), a(X + 18, Y + 4, WHT), a(X + 16, Y + 8, RED), a(X + 12, Y + 9, PINK), a(X + 9, Y + 8, RED), a(X + 15, Y + 11, DRED)] })];
}
/* THE DEATH KNIGHT'S DEATH MAGIC IN THE AIR (claude/dkfeel, Daniel 10-16; B16: its own windup + release pose, not the shared knight up-cut and not a straight column):
   THE REAPING RISE (up + attack in the air): the greatsword swept back and low behind his heel; HAULED up through the front in a reaping crescent with a grave-green
   flame licking off the steel and soul wisps rising behind it; held straight up over his helm in both fists, the point to the sky, the green flaring; then let go behind him.
   THE CULL, the plunge: the blade turned point-down and driven ahead of him with a necrotic glow gathering on the point and bone-white splinters trailing off the edge, the helm's lights green;
   the second beat is the point about to bite (the glow white-hot), the spikes of the grave burst (main.js graveFall) already lifting under it. */
function reaperGravePoses(F, sh) {
  const top = ATTACK_HEADROOM, [X, Y] = sh, K = o => knightFrame({ top, ...o });
  const a = (x, y, col) => [x - BX, y - BY, col], GRN = '#ff4a5a', DGRN = '#7a1020', LGRN = '#ffb0b8', BONE = '#ffd0d0', DBONE = '#5a0a18', RED = '#c0283a', PINK = '#ff6b6b';   /* (claude/bloodknight) CRIMSON, not necrotic green; blood, not bone (the names stay so the frames below read as they did) */
  const gs = (hx, hy, tx, ty) => ({ arm: [X, Y, hx, hy], greatsword: [hx, hy, tx, ty] });
  const along = (hx, hy, tx, ty, n, c0, c1) => Array.from({ length: n }, (_, i) => { const t = (i + 1) / (n + 1); return a(Math.round(hx + (tx - hx) * t), Math.round(hy + (ty - hy) * t), i % 2 ? c1 : c0); });
  const hold = F.jump ? F.jump[1] || F.jump[0] : F.atk[4];
  F.airUp = [K({ dx: -1, dy: 0, legs: 'jump2', ...gs(X - 3, Y + 2, X - 15, Y + 6), plume: 1, bits: [a(X - 14, Y + 5, DGRN), a(X - 11, Y + 4, GRN)] }),
    K({ wide: 8, dx: 1, dy: 1, legs: 'jump2', sho: 1, ...gs(X + 4, Y - 3, X + 15, Y - 15), plume: 2, bits: [a(X + 15, Y - 15, LGRN), a(X + 16, Y - 16, GRN), a(X + 14, Y - 17, GRN), a(X + 12, Y - 11, GRN), a(X + 13, Y - 12, DGRN), a(X + 9, Y - 7, DGRN), a(X + 10, Y - 13, GRN), a(X + 17, Y - 12, DGRN), a(X - 2, Y - 14, GRN), a(X - 3, Y - 17, LGRN)] }),
    K({ wide: 6, dx: 1, dy: 0, legs: 'tuck', sho: 1, hy: 1, ...gs(X + 2, Y - 9, X + 1, Y - 24), plume: 2, bits: [a(X + 1, Y - 25, '#ffffff'), a(X + 1, Y - 22, LGRN), a(X + 2, Y - 18, GRN), a(X - 1, Y - 14, DGRN), a(X + 5, Y - 21, GRN), a(X - 4, Y - 20, LGRN), a(X + 7, Y - 15, DGRN), a(X - 1, Y - 24, GRN), a(X + 3, Y - 23, LGRN), a(X - 2, Y - 17, GRN), a(X + 4, Y - 19, GRN), a(X - 3, Y - 23, DGRN), a(X + 5, Y - 25, DGRN), a(X + 1, Y - 28, LGRN), a(X + 2, Y - 29, GRN), [4, 3, GRN], [5, 3, GRN]] }),
    K({ wide: 2, dx: 0, dy: 1, legs: 'tuck', ...gs(X - 2, Y - 7, X - 13, Y - 18), plume: 1, bits: [a(X - 13, Y - 18, GRN), a(X - 14, Y - 19, LGRN), a(X - 12, Y - 20, GRN), a(X - 9, Y - 14, DGRN), a(X - 10, Y - 17, GRN), a(X - 3, Y - 22, LGRN), a(X + 2, Y - 26, GRN), a(X + 4, Y - 29, DGRN)] }), hold];
  F.plunge = K({ legs: 'tuck', hy: 1, sho: 1, arm: [X, Y, X, Y + 1], greatsword: [X, Y - 5, X, Y + 19], plume: 2,
    bits: [a(X, Y + 19, '#ffffff'), a(X, Y + 20, '#ffffff'), a(X - 1, Y + 19, LGRN), a(X + 1, Y + 19, LGRN), a(X, Y + 21, GRN), a(X - 2, Y + 21, DGRN), a(X + 2, Y + 21, DGRN), a(X, Y + 17, LGRN), a(X + 1, Y + 14, GRN), a(X - 1, Y + 14, GRN), a(X - 2, Y + 19, DGRN), a(X + 2, Y + 20, DGRN), a(X + 3, Y + 16, BONE), a(X - 3, Y + 11, BONE), a(X + 3, Y + 8, DBONE), a(X - 2, Y + 5, BONE), [4, 3, GRN], [5, 3, GRN]] });
}
export function bakeReaperBoss(skin = {}) { BOSS_HORNS = true; try { return bakeReaper(skin); } finally { BOSS_HORNS = false; } }   /* (claude/bkpolish) the boss's own bake: the hero's body and every pose, with the bigger horns */
export function bakeReaper(skin = {}, previewOnly = false) {
  KP = Object.assign({}, KP0, REAP_PAL, skin); BODY_REF = REAP_BODY; PLUME_REF = REAP_PLUME;
  const sh = [BX + 8, BY + 7];
  /* A TWO-HANDER IS CARRIED, NOT HELD OUT. At rest and at a run it lies back over the shoulder - that is
     the pose that says greatsword from across the room, and it keeps the blade out of his own legs. */
  const rest = (d = 0) => [sh[0] - 3, sh[1] + 5 + d, sh[0] + 13, sh[1] + 9 + d];    /* low guard, across the body, point forward and down */
  const carry = (d = 0) => [sh[0] - 4, sh[1] + 6 + d, sh[0] + 12, sh[1] + 11 + d];  /* at a run the point drops further: he is dragging it */
  // A STORE CARD NEEDS ONLY THE BREATH AND THE SWING, not the whole fighting life.
  const card = {
    idle: () => ((previewOnly === 'icon' ? (BREATH).slice(0, 1) : (BREATH)).map(([dy, hy, sho, plume], i) => { const lag = breathLag(i);
      /* the hands at his hip, not his knee: the cross hangs four rows under the grip, and from +5 it and the point both went into the ground */
      return knightFrame({ dy, hy, sho, plume, arm: [sh[0], sh[1], sh[0] - 1, sh[1] + 3 - Math.max(0, dy)], greatsword: [sh[0] - 3, sh[1] + 3 - Math.max(0, dy), sh[0] + 12, sh[1] + 6 + lag - dy],
        bits: [...flap([3, 4], dy, lag, 'r', 'r'), ...(i === 6 ? [[4, 3 + hy, 'k'], [5, 3 + hy, 'k']] : [])] }); })),
    atk: () => ([
      () => (knightFrame({ dx: -1, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 3, sh[1] - 2], greatsword: [sh[0] - 3, sh[1] + 2, sh[0] - 11, sh[1] - 6], plume: 1 })),
      () => (knightFrame({ dx: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 4], greatsword: [sh[0] + 2, sh[1] - 4, sh[0] + 3, sh[1] - 16], plume: 2 })),
      /* THE ART GROWS TO MEET THE BOX (2026-09-24, Daniel: "lengthen the art"). The swathe's live frame drew its blade to sh+17 on a 34-wide
         canvas, so the point was CUT OFF at the frame's edge, and the blow landed ~9 px past the steel anyone could see. Now the frame is
         widened on the right (wide) and the blade runs out to where the box has always reached. The reach did not change; only the picture did. */
      () => (knightFrame({ wide: 8, dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 5, sh[1] - 2], greatsword: [sh[0] + 5, sh[1] - 2, sh[0] + 19, sh[1] - 1], plume: 2 })),
      () => (knightFrame({ wide: 8, dx: 2, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 1], greatsword: [sh[0] + 4, sh[1] + 1, sh[0] + 14, sh[1] + 7], plume: 0 })),   /* (widened too: its point was cut off at the old edge) */
      () => (knightFrame({ greatsword: rest(), plume: 0 }))
    ].map((make, i) => (previewOnly === 'weaponIcon' && i > 1) || (previewOnly === 'atk' && i > 2) ? null : make()))
  };
  if (previewOnly) { const out = storeFrames(card, false, previewOnly, SMEAR_COL.crimson);   /* (batch95 integ: claude/dk2art gave the full bake the rising cut and a crimson smear; the store card must draw the same frames - tools/store-preview.mjs) */
    if (out.R.atk) { KP = Object.assign({}, KP0, REAP_PAL, skin); BODY_REF = REAP_BODY; PLUME_REF = REAP_PLUME;   /* (storeFrames put the palette back) */
      const F2 = { atk: out.R.atk }; reaperRhythmPoses(F2, sh, true); smearPass(F2, SMEAR_COL.crimson); out.R.atk = F2.atk; KP = Object.assign({}, KP0); BODY_REF = BODY; PLUME_REF = PLUME; }
    return out; }
  const F = {
    /* HIS BREATH: the pauldrons lift, the torn surcoat drags a beat behind, the long point sinks after the hands, and once
       in the cycle the green in the helm goes out and comes back. The point is held a pixel short so it clears the frame. */
    idle: card.idle(),
    run: [['run1', -1], ['run2', 0], ['run3', 1], ['run4', 0], ['run5', -1], ['run6', 0]].map(([l, dy], i) => knightFrame({ legs: l, dy, plume: i % 3, arm: [sh[0], sh[1], sh[0] - 2, sh[1] + 2], greatsword: [sh[0] - 4, sh[1] + 2, sh[0] + 12, sh[1] + 6 - Math.max(0, dy)] })),   /* dragged, not buried: carry() had the cross and the point four to six pixels under the ground */
    jump: [knightFrame({ legs: 'jump', dy: -1, greatsword: [sh[0] + 1, sh[1] + 4, sh[0] - 6, sh[1] - 7], plume: 1 }), knightFrame({ legs: 'jump2', greatsword: [sh[0] + 1, sh[1] + 4, sh[0] - 7, sh[1] - 5], plume: 1 })],
    fall: [knightFrame({ legs: 'fall', greatsword: [sh[0] + 2, sh[1] + 4, sh[0] - 7, sh[1] - 4], plume: 2 }), knightFrame({ legs: 'fall2', dy: -1, greatsword: [sh[0] + 2, sh[1] + 3, sh[0] - 8, sh[1] - 2], plume: 2 })],
    /* LANDING in three beats, as the starters': the IMPACT deep on bent knees with the long blade jarred down level across him, the SETTLE, and up */
    land: [knightFrame({ legs: 'crouch', legsDy: 3, dy: 4, arm: [sh[0], sh[1], sh[0] - 1, sh[1] + 3], greatsword: [sh[0] - 3, sh[1] + 3, sh[0] + 12, sh[1] + 4], plume: 2 }), knightFrame({ legs: 'land', dy: 2, arm: [sh[0], sh[1], sh[0] - 1, sh[1] + 7], greatsword: rest(2) }), knightFrame({ legs: 'stand', dy: 1, arm: [sh[0], sh[1], sh[0] - 1, sh[1] + 6], greatsword: rest(1), plume: 1 })],
    /* THE TAKE-OFF: stretched off the push, the two-hander hauled up behind him by the lift of it */
    takeoff: knightFrame({ legs: 'push', dy: -2, sho: 1, greatsword: [sh[0] + 1, sh[1] + 4, sh[0] - 5, sh[1] - 9], plume: 2 }),
    apex: knightFrame({ legs: 'jump2', dy: -1, greatsword: [sh[0] + 1, sh[1] + 4, sh[0] - 8, sh[1] - 6], plume: 0 }),
    skid: knightFrame({ dx: -2, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 1, sh[1] + 6], greatsword: carry(1), plume: 2 }),
    /* THE PLANTED BLADE: he sets his feet, lifts the whole thing straight over his head, and drives it point-first
       into the ground in front of him - knees bent, both hands on the grip, and the earth split where it went in. */
    heavy: [
      knightFrame({ dx: -1, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 3, sh[1] - 1], greatsword: [sh[0] - 3, sh[1] + 3, sh[0] - 12, sh[1] - 5], plume: 2 }),
      knightFrame({ legs: 'wide', dy: -1, arm: [sh[0], sh[1], sh[0] + 1, sh[1] - 4], greatsword: [sh[0] + 1, sh[1] - 4, sh[0] + 2, sh[1] - 17], plume: 1 }),
      /* (the same, on the planted heavy: its box reaches ~13 px past a blade driven almost straight down, so the blade is longer and is driven
         in FORWARD, its point in the ground where the box's front is) */
      knightFrame({ wide: 8, dx: 1, legs: 'wide', dy: 3, arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 3], greatsword: [sh[0] + 4, sh[1] + 1, sh[0] + 20, sh[1] + 14], glow: [sh[0] + 19, sh[1] + 12], plume: 2 }),
    ],
    climb: [
      knightFrame({ legs: 'climbA', arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 7], greatsword: carry(), plume: 0 }),
      knightFrame({ legs: 'climbB', dy: 1, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 3], greatsword: carry(1), plume: 1 }),
    ],
    /* THE SWATHE: back over the shoulder, up, and round in one flat wide arc that takes everything in front */
    atk: card.atk(),
    /* THE GRAVE DRIVE: the same tuck the knight's poke uses - both hands stay on the grip, knees drawn up out from
       under him, and the whole length of the greatsword goes down past his boots ahead of the ground it is about
       to open (graveFall, main.js). Nothing here reads as his slow overhead swathe: the blade is a straight column,
       not an arc, and there is no wind-up left in the frame to confuse it with one. */
    plunge: knightFrame({ legs: 'tuck', hy: 1, arm: [sh[0], sh[1], sh[0], sh[1] + 1], greatsword: [sh[0], sh[1] - 5, sh[0], sh[1] + 19], plume: 2 }),
    /* THE GREATSWORD RUSH: the whole blade held out level in front at a dead run, both hands on the grip - the
       biggest weapon in the wood turned into a lance for the length of the dash, and nowhere in the frame does it
       lift off that line the way the swathe does. */
    dashAtk: [
      knightFrame({ wide: 4, dx: 2, dy: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 2], greatsword: [sh[0] + 2, sh[1] + 2, sh[0] + 18, sh[1] + 1], plume: 2 }),
      knightFrame({ wide: 6, dx: 4, dy: 1, legs: 'run1', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 2], greatsword: [sh[0] + 4, sh[1] + 2, sh[0] + 22, sh[1] + 1], plume: 2 }),
      knightFrame({ dx: 1, dy: 2, legs: 'land', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 4], greatsword: [sh[0] + 3, sh[1] + 4, sh[0] + 10, sh[1] + 9], plume: 0 }),
    ],
    hurt: [knightFrame({ dx: -1, dy: 1, legs: 'fall', greatsword: [sh[0] + 2, sh[1] + 5, sh[0] - 6, sh[1] - 1], plume: 2 }), knightFrame({ dx: -2, dy: 2, legs: 'land', greatsword: [sh[0] + 2, sh[1] + 6, sh[0] - 6, sh[1] + 2], plume: 1 })],
    crouch: knightFrame({ dy: 3, legs: 'crouch', legsDy: 3, arm: [sh[0], sh[1], sh[0] - 1, sh[1] + 2], greatsword: rest(-6) }),
    /* THE BUTT-SLIDE (src/slide.js): sat back on the ground with the legs run out in front, leaning away from the hill, the weapon tucked behind (a second frame for the cloth) */
    slide: [0, 1].map(i => knightFrame({ dx: -3, dy: 3, legs: 'slide', legsDy: 3, plume: i * 2, arm: [sh[0], sh[1], sh[0] - 3, sh[1]], greatsword: [sh[0] - 3, sh[1] - 1, sh[0] - 15, sh[1] - 10] })),
    /* BLOOD HARVEST (src/crouch-b.js): down on one knee over the body, the greatsword let down to lie ON the ground behind him (planted: its underside on the boots' row, smallfix2) and the sword
       hand reaching down into what lies there - the blood coming up into the palm, more of it on the second beat */
    harvest: [0, 1].map(i => knightFrame({ dy: 3, legs: 'kneel', arm: [sh[0], sh[1], sh[0] + 5, sh[1] + 4], greatsword: [sh[0] - 3, sh[1] + 1, sh[0] - 15, sh[1] + 2], plume: i + 1,
      bits: i ? [[13, 12, '#ff4a5a'], [14, 11, '#c0283a'], [12, 10, '#ff9a9a'], [14, 9, '#c0283a']] : [[13, 12, '#c0283a'], [14, 11, '#7a1020']] })),
    /* THE TOLL: the point driven into the ground in both hands, head down, taking it out of them */
    block: [0, 1].map(i => knightFrame({ legs: 'wide', dy: i, arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 3 + i], greatsword: [sh[0] + 2, sh[1] - 4 + i, sh[0] + 3, sh[1] + 13 + i], glow: [sh[0] + 3, sh[1] + 13] })),
    /* RAISE: the sword held off to one side and the free hand down, green coming up out of the ground */
    cast: [0, 1].map(i => knightFrame({ legs: 'stand', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 5], greatsword: [sh[0] - 2, sh[1] + 2, sh[0] - 10, sh[1] - 5], glow: [sh[0] + 5, sh[1] + 8 + i] })),
    /* THE LAST HARVEST: the blade straight up in both hands, and everything marked answers it */
    blast: [knightFrame({ legs: 'wide', dy: -1, arm: [sh[0], sh[1], sh[0], sh[1] - 6], greatsword: [sh[0], sh[1] - 3, sh[0], sh[1] - 18], glow: [sh[0], sh[1] - 20] }),
      knightFrame({ dx: 2, dy: 2, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 2], greatsword: [sh[0] + 4, sh[1] - 1, sh[0] + 16, sh[1] + 6], glow: [sh[0] + 12, sh[1] + 3] })],
  };
  /* THE PASSING: he does not roll. He goes thin and steps through. */
  F.roll = [0, 1, 2, 3].map(i => knightFrame({ dy: 1, legs: i % 2 ? 'wide' : 'runC', greatsword: carry(1), plume: i % 3 }));
  { const arcs = comboArcs(sh, 'greatsword', 16); F.atkB = [...arcs.B, F.atk[4]]; F.atkC = [...arcs.T, F.atk[4]]; F.air = [...arcs.A, F.jump[1]]; F.fidget = [...arcs.I, F.idle[0]]; }   /* the long blade rising, and driven through */
  /* HIS FIDGET: the blade turned point-down and driven a finger into the ground before him, both hands folded on the
     pommel, and his weight on it for a few slow breaths with the lights in the helm gone dim - then hauled out, back to guard */
  { const grip = (dy, o = {}) => knightFrame({ dy, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 1], greatsword: [sh[0] + 3, sh[1] - 1, sh[0] + 4, sh[1] + 15 - dy], ...o });
    const dim = hy => [[4, 3 + hy, 'k'], [5, 3 + hy, 'k']];
    const turn = knightFrame({ arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 1], greatsword: [sh[0] + 2, sh[1] + 2, sh[0] + 10, sh[1] - 8], plume: 1 });
    const lift = knightFrame({ arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 3], greatsword: [sh[0] + 3, sh[1] - 3, sh[0] + 4, sh[1] + 10], plume: 2 });
    const plant = grip(1, { plume: 2, bits: [[10, 15, '#8a7a5a'], [14, 15, '#8a7a5a'], [9, 14, '#5a4e38'], [15, 14, '#5a4e38']] });
    const lean1 = grip(1, { hy: 1, plume: 1 }), lean2 = grip(1, { hy: 1, sho: 1, plume: 0 }), lean3 = grip(1, { hy: 1, plume: 1, bits: dim(1) }), lean4 = grip(1, { hy: 1, sho: 1, plume: 0, bits: dim(1) });
    F.fidget = holdFrames([[turn, 2], [lift, 2], [plant, 2], [lean1, 3], [lean2, 3], [lean3, 3], [lean4, 3], [lean1, 2], [lift, 2], [turn, 2], [F.idle[7], 1]]); }
  /* HIS DANCE (dances lane, 2026-09-29): THE PLANT AND THE BOW. The biggest and slowest of them does not jig. The greatsword is
     hauled up, turned point-down and driven into the ground before him with both fists on the pommel, and the green in the helm
     flares as it bites. Then he bows over it - the helm goes down, the shoulders come round it, the lights hang low - holds it,
     and straightens, the lights coming up again. Where his fidget leans on the blade with the lights gone OUT, this is the
     blade planted to be honoured: the lights are lit for all of it. */
  { const lit = hy => [[4, 3 + hy, '#ffd0d0'], [5, 3 + hy, '#ffd0d0']];
    const grip = (dy, o = {}) => knightFrame({ dy, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 1], greatsword: [sh[0] + 3, sh[1] - 1, sh[0] + 4, sh[1] + 15 - dy], ...o });
    const turn = knightFrame({ arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 1], greatsword: [sh[0] + 2, sh[1] + 2, sh[0] + 10, sh[1] - 8], plume: 1 });
    const lift = knightFrame({ legs: 'wide', dy: -1, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 4], greatsword: [sh[0] + 3, sh[1] - 4, sh[0] + 4, sh[1] + 11], plume: 2, bits: lit(0) });
    const plant = grip(1, { legs: 'wide', plume: 2, bits: [...lit(0), [10, 15, '#8a7a5a'], [14, 15, '#8a7a5a'], [9, 14, '#5a4e38'], [15, 14, '#5a4e38'], [8, 15, '#5a4e38'], [16, 15, '#5a4e38']] });
    const stand = grip(1, { plume: 1, bits: lit(0) });
    const bow1 = grip(2, { hy: 1, plume: 2, bits: lit(1) });
    const bow2 = grip(3, { hy: 2, sho: 1, plume: 2, bits: lit(2) });
    F.dance = holdFrames([[turn, 2], [lift, 3], [plant, 3], [stand, 3], [bow1, 3], [bow2, 6], [bow1, 2], [stand, 3]]); }
  /* HIS OTHER TWO DANCES (heroanim lane, 2026-10-10). dance2 = THE VIGIL, his idle solo: the blade hauled up to rest across the
     shoulder, turned slowly in both fists to read the other edge, the point brought round and set; the helm turns to look each way
     with the lights flaring on the look. dance3 = THE REAPING, a boss down: the greatsword swung up behind him and brought round
     in one wide low cut that nobody is left to meet, then driven point-down with the green in the helm blazing, held, and let burn down. */
  { const lit = (hy, c = '#ffd0d0') => [[4, 3 + hy, c], [5, 3 + hy, c]];
    const g = (hx, hy2, tx, ty, o = {}) => knightFrame({ arm: [sh[0], sh[1], sh[0] + hx, sh[1] + hy2], greatsword: [sh[0] + hx, sh[1] + hy2, sh[0] + tx, sh[1] + ty], ...o });
    const shoulder = g(1, -2, -6, -9, { legs: 'wide', dx: -1, plume: 1, bits: lit(0) });
    const read1 = g(2, -2, 8, -6, { plume: 2, bits: lit(0) }), read2 = g(2, -2, 9, 1, { plume: 1, bits: lit(0) }), read3 = g(2, -1, 7, 6, { plume: 2, bits: lit(0) });
    const setP = g(3, -1, 4, 14, { dy: 1, legs: 'wide', plume: 2, bits: lit(0) });
    const look = (hy, c) => g(3, -1, 4, 14, { dy: 1, hy, plume: 1, bits: lit(hy, c) });
    F.dance2 = holdFrames([[knightFrame({ greatsword: [sh[0] + 1, sh[1] + 2, sh[0] + 4, sh[1] + 12], arm: [sh[0], sh[1], sh[0] + 1, sh[1] + 2], plume: 1 }), 2], [shoulder, 4], [read1, 2], [read2, 2], [read3, 2], [read2, 2], [read1, 2], [shoulder, 3],
      [g(2, -1, 8, -2, { legs: 'wide', plume: 2, bits: lit(0) }), 3], [setP, 3], [look(0, '#ffd0d0'), 3], [look(1, '#ffffff'), 2], [look(0, '#ff4a5a'), 3], [look(-1, '#ffffff'), 2], [look(0, '#ffd0d0'), 3], [F.idle[7], 2]]);
    const back = g(-1, -3, -8, -9, { legs: 'wide', dx: -2, plume: 1, bits: lit(0) });
    const top = g(2, -4, 4, -9, { legs: 'wide', dy: -1, sho: 1, plume: 2, bits: lit(0, '#ffffff') });
    const cutA = g(4, 0, 11, 4, { legs: 'runC', dx: 1, plume: 2, bits: lit(0) }), cutB = g(5, 3, 11, 12, { legs: 'runC', dx: 2, dy: 1, plume: 2, bits: lit(1) });
    const drive = g(3, 1, 4, 15, { dy: 1, legs: 'wide', plume: 2, bits: [...lit(0, '#ffffff'), [10, 15, '#8a7a5a'], [14, 15, '#8a7a5a'], [9, 14, '#5a4e38'], [15, 14, '#5a4e38'], [8, 15, '#5a4e38'], [16, 15, '#5a4e38']] });
    const blaze = (c, hy = 0) => g(3, -1, 4, 14, { dy: 1, hy, plume: 1, bits: [...lit(hy, c), [3, 3 + hy, '#ff4a5a'], [6, 3 + hy, '#ff4a5a'], [4, 2 + hy, '#ff4a5a'], [5, 2 + hy, '#ff4a5a']] });
    F.dance3 = holdFrames([[F.idle[7], 1], [back, 3], [top, 3], [cutA, 2], [cutB, 2], [g(5, 4, 11, 13, { legs: 'wide', dx: 2, dy: 1, plume: 2, bits: lit(1) }), 2], [back, 2], [top, 2], [cutA, 1], [cutB, 2], [drive, 3],
      [blaze('#ffffff'), 3], [blaze('#ffd0d0', 1), 3], [blaze('#ff4a5a', 1), 3], [blaze('#ffd0d0'), 2], [F.idle[7], 2]]); }
  /* FOLLOW-THROUGH (heroanim lane, 2026-10-10): the two frames a light strike plays inside its existing recovery (main.js recPose branch; the beat table
     is at the top of src/attack-animation.js). A = the weapon spent, carried on low past the target, body one pixel forward, plume still flying;
     B = it coming back to guard, the weight settling. Art only: atkRec is read, never written. */
  F.follow = [knightFrame({ dx: 1, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 4], greatsword: [sh[0] + 3, sh[1] + 4, sh[0] + 10, sh[1] + 13], plume: 1 }), knightFrame({ dy: 1, arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 3], greatsword: [sh[0] + 2, sh[1] + 3, sh[0] + 6, sh[1] + 14], plume: 0 })];
  /* HIS SLUMP: the greatsword is neither planted nor carried - it is DRAGGED, hanging off one hand with the point
     out in the dirt behind him, and both lights in the helm are gone out. His fidget leans on the blade standing
     up in front of him; this is the same blade given up on, lying the other way. */
  { const drag = (d, hy) => knightFrame({ dy: 2 + d, hy, sho: -1, legs: 'stand', plume: 0,
      arm: [sh[0], sh[1], sh[0] - 2, sh[1] + 3], greatsword: [sh[0] - 2, sh[1] + 3, sh[0] - 14, sh[1] + 7 - d],
      bits: [[4, 3 + hy, 'k'], [5, 3 + hy, 'k']] });
    F.slump = [drag(0, 1), drag(1, 2)]; }
  /* HIS SWIM: the greatsword down his back, grip at the shoulders and the point trailing past his boots, so what follows
     him through the water is a length of steel as long as he is. Treading, it goes back up over the shoulder. */
  { const S = swimRig(knightFrame, sh, { carry: { greatsword: [sh[0] - 5, sh[1] - 3, sh[0] - 4, sh[1] + 13], bits: flap([3, 4], 0, 1, 'r', 'r') },
      tread: i => ({ greatsword: [sh[0] + 1, sh[1] + 4 + TREAD_DY[i], sh[0] - 7, sh[1] - 6 + TREAD_DY[i]], bits: flap([3, 4], TREAD_DY[i], 1 - TREAD_DY[i], 'r', 'r') }) });
    F.swim = S.swim; F.tread = S.tread; }
  const mirror = f => Array.isArray(f) ? f.map(flipX) : flipX(f);
  directionalPoses(F, 'greatsword', { scale: 1.22 });
  reaperKitPoses(F, sh);
  reaperGravePoses(F, sh);   /* (claude/dkfeel) the up-air reaping rise and the Cull plunge: death magic */
  reaperBloodPoses(F, sh);   /* (claude/bloodknightart) the five tiers, blood spike, blood price */
  reaperRhythmPoses(F, sh);   /* (claude/dk2art) the rhythm, the kneel, the price held and the crescent: their own bodies */
  smearPass(F, SMEAR_COL.crimson);   /* the strike beats get their arc (claude/herokeys; the Death Knight's is crimson, claude/dk2art) */
  const R = F, L = {}; for (const k in F) L[k] = mirror(F[k]);
  const white = {}; for (const k in F) white[k] = Array.isArray(F[k]) ? F[k].map(c => whiten(c)) : whiten(F[k]);
  const whiteL = {}; for (const k in white) whiteL[k] = mirror(white[k]);
  KP = Object.assign({}, KP0); BODY_REF = BODY; PLUME_REF = PLUME;
  return { R, L, white: { R: white, L: whiteL }, ...KNIGHT_ANCHOR, ay: KNIGHT_ANCHOR.ay + ATTACK_HEADROOM };
}
// THE WARDEN — THE CLOAKED WARDEN. A long cloak and a wide-brimmed hat, and a spear.
// SHE WAS THE KNIGHT WITH A LONGER STICK. Drawn on his rig under a hood, at sixteen pixels she was his
// silhouette exactly - the same square helm, the same square body - and the only thing telling the two of
// them apart was the line of the spear, which is the ONE part of her a crowded screen paints over. So the
// read is moved off the weapon and onto the body: a BRIM wider than her shoulders, a CROWN standing over it,
// and a CLOAK that falls past her knees and hides the legs every other hero in this game runs on. Nothing
// else in the cast is a bell with a bar across the top of it, and that shape arrives before the spear does.
// Every pose is still built round WHERE THE POINT IS - stood upright at her side at rest, levelled at a run,
// driven out past the frame the others live in when she thrusts (`wide`) - but the point no longer has to
// carry the introduction on its own.
const WARD_BODY = [
  '...BBBB...',     /* 0  the crown of the hat */
  '..BBBBBB..',     /* 1 */
  '.rrrrrrrr.',     /* 2  the cord round it */
  'BBBBBBBBBBBB',   /* 3  THE BRIM, twelve across where her shoulders are ten, and carried forward: a hat pulled down over the eyes */
  '..vvvvvv..',     /* 4  her face, in the brim's shadow: she is a hat and a jaw */
  '...kkk....',     /* 5  the jaw, the one lit part of her */
  '.BbbbbB...',     /* 6  the cloak, off the shoulders */
  'BBbbbbbBB.',     /* 7 */
  'BBbbbbbBB.',     /* 8 */
  'BBbbbbbBB.',     /* 9 */
  /* AND ON PAST THE BELT. These three rows land on the same courses as the legs and are drawn BEFORE them, so the
     boots walk over the top of the cloth and the hem only shows where they are not - which is what a long cloak
     does. It is also why the hem is drawn WIDER than any stride: the flare either side of the legs is the whole
     silhouette at sixteen pixels, and a hem no wider than the boots would have been a pair of trousers. */
  'BBbbbbbBB.',     /* 11 */
  'BBbbbbbBB.',     /* 12 */
  '.BBBBBBB..',     /* 13  the weighted edge of it */
];
/* the crown and the cord, breathing: the hat leans, and the cord's end lifts behind her */
const WARD_PLUME = [
  ['...BBBB...', '..BBBBBB..', '.rrrrrrrr.'],
  ['...BBBB...', '..BBBBBB..', '.rrrrrrrrr'],
  ['..BBBB....', '.BBBBBB...', '.rrrrrrrr.'],
];
/* THE CLOAK AND THE HAT ARE THE SAME CLOTH, so both are keyed `b`/`B` - the two keys every one of her skins
   sets (WARD_SETS in main.js). Keying them to anything of their own would have left eighteen skins recolouring
   a spear and a pair of boots while the whole of the rest of her stayed green. */
const WARD_PAL = { s: '#b8c2cc', S: '#6a737e', b: '#3f6e4a', B: '#1d3524', r: '#c9b27c', k: '#d8ac82', w: '#6a4a2a', W: '#402a16', y: '#e0b040', v: '#221c28' };
export function bakeWarden(skin = {}, previewOnly = false) {
  KP = Object.assign({}, KP0, WARD_PAL, skin); BODY_REF = WARD_BODY; PLUME_REF = WARD_PLUME;
  const sh = [BX + 8, BY + 7];
  const WIDE = 30;                                                   // the canvas her forty-four pixels of reach needs
  /* AT REST IT IS PLANTED. The grip is given a pixel higher than her hand so the heel finishes on the ground line and
     not under it, and the idle passes it back UP by dy so the spear stands still while she breathes against it. */
  const rest = (d = 0) => [sh[0] + 2, sh[1] + 2 + d, sh[0] + 3, sh[1] - 12 + d];
  const carry = (d = 0) => [sh[0] - 4, sh[1] + 3 + d, sh[0] + 12, sh[1] - 2 + d];   // at a run: levelled, point leading
  const back = (d = 0) => [sh[0] + 5, sh[1] + 5 + d, sh[0] - 9, sh[1] - 5 + d];     // slung across her back on a ladder
  /* THE THRUST, in four beats and a settle: drawn back to the hip, driven, at full stretch, hauled home. Only the two
     middle frames carry the point out past the body, and those are the two frames the blow is live on. */
  const thrust = (gx, gy, tx, ty, o = {}) => knightFrame({ wide: WIDE, spear: [gx, gy, tx, ty], ...o });
  // A STORE CARD NEEDS ONLY THE BREATH AND THE SWING, not the whole fighting life.
  const card = {
    idle: () => ((previewOnly === 'icon' ? (BREATH).slice(0, 1) : (BREATH)).map(([dy, hy, sho, plume], i) => knightFrame({ dy, hy, sho, plume,
      arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 1 - Math.max(0, dy)],
      spear: rest(-dy), bits: flap([3, 4], dy, breathLag(i), 'b', 'B') }))),
    atk: () => ([
      () => (thrust(sh[0] - 6, sh[1] + 1, sh[0] + 8, sh[1] + 1, { dx: -2, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 4, sh[1] + 1], plume: 1 })),
      () => (thrust(sh[0] + 2, sh[1], 45, sh[1], { dx: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1]], plume: 2 })),
      () => (thrust(sh[0] + 5, sh[1], 57, sh[1], { dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 6, sh[1]], plume: 2 })),
      () => (thrust(sh[0] + 2, sh[1] + 2, 39, sh[1] + 2, { dx: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 2], plume: 0 })),
      () => (knightFrame({ legs: 'stand', spear: rest(), plume: 0 }))
    ].map((make, i) => (previewOnly === 'weaponIcon' && i > 1) || (previewOnly === 'atk' && i > 2) ? null : make()))
  };
  if (previewOnly) return storeFrames(card, false, previewOnly, SMEAR_COL.steel);
  const F = {
    idle: card.idle(),
    run: [['run1', -1], ['run2', 0], ['run3', 1], ['run4', 0], ['run5', -1], ['run6', 0]].map(([l, dy], i) =>
      knightFrame({ legs: l, dy, plume: i % 3, arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 1], spear: carry() })),
    jump: [knightFrame({ legs: 'jump', dy: -1, arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 1], spear: [sh[0] - 5, sh[1] + 4, sh[0] + 11, sh[1] - 6], plume: 1 }),
      knightFrame({ legs: 'jump2', arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 1], spear: [sh[0] - 5, sh[1] + 3, sh[0] + 11, sh[1] - 7], plume: 1 })],
    fall: [knightFrame({ legs: 'fall', arm: [sh[0], sh[1], sh[0] + 2, sh[1]], spear: [sh[0] - 6, sh[1] + 1, sh[0] + 10, sh[1] - 9], plume: 2 }),
      knightFrame({ legs: 'fall2', dy: -1, arm: [sh[0], sh[1], sh[0] + 2, sh[1]], spear: [sh[0] - 6, sh[1], sh[0] + 10, sh[1] - 10], plume: 2 })],
    /* three beats down, as his: the IMPACT with the heel of the spear jarred into the turf, the SETTLE, and up */
    land: [knightFrame({ legs: 'crouch', legsDy: 3, dy: 4, arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 5], spear: rest(1), plume: 2 }),
      knightFrame({ legs: 'land', dy: 2, arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 3], spear: rest(2), plume: 0 }),
      knightFrame({ legs: 'stand', dy: 1, arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 2], spear: rest(1), plume: 1 })],
    /* THE TAKE-OFF: stretched off the push with the spear swung up and forward, point leading her into the air */
    takeoff: knightFrame({ legs: 'push', dy: -2, sho: 1, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 2], spear: [sh[0] - 4, sh[1] + 5, sh[0] + 12, sh[1] - 5], plume: 2 }),
    apex: knightFrame({ legs: 'jump2', dy: -1, arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 1], spear: [sh[0] - 5, sh[1] + 2, sh[0] + 11, sh[1] - 8], plume: 0 }),
    skid: knightFrame({ dx: -2, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 1, sh[1] + 2], spear: [sh[0] + 3, sh[1] - 1, sh[0] - 11, sh[1] + 7], plume: 2 }),
    climb: [knightFrame({ legs: 'climbA', arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 7], spear: back(), plume: 0 }),
      knightFrame({ legs: 'climbB', dy: 1, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 3], spear: back(1), plume: 1 })],
    /* THE LONG THRUST */
    atk: card.atk(),
    /* THE PLUNGE: she goes down behind the point, both hands high on the haft */
    /* ON THE SLANT: the haft laid down her front from over her shoulder to a point ahead of her boots, her weight behind it - a lance
       going in, not a sword stood on (his is straight down) */
    plunge: knightFrame({ wide: WIDE, dx: -2, legs: 'fall2', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 4], spear: [sh[0] - 7, sh[1] - 8, sh[0] + 4, sh[1] + 16], plume: 2 }),
    hurt: [knightFrame({ dx: -1, dy: 1, legs: 'fall', arm: [sh[0], sh[1], sh[0] - 2, sh[1] + 3], spear: [sh[0] + 2, sh[1] + 6, sh[0] - 10, sh[1] - 2], plume: 2 }),
      knightFrame({ dx: -2, dy: 2, legs: 'land', arm: [sh[0], sh[1], sh[0] - 3, sh[1] + 4], spear: [sh[0] + 1, sh[1] + 7, sh[0] - 11, sh[1] + 1], plume: 1 })],
    crouch: knightFrame({ dy: 3, legs: 'crouch', legsDy: 3, arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 1], spear: rest(-3) }),
    /* THE BUTT-SLIDE (src/slide.js): sat back on the ground with the legs run out in front, leaning away from the hill, the weapon tucked behind (a second frame for the cloth) */
    slide: [0, 1].map(i => knightFrame({ dx: -3, dy: 3, legs: 'slide', legsDy: 3, plume: i * 2, arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 1], spear: [sh[0] + 3, sh[1] + 1, sh[0] - 14, sh[1] - 6] })),
    /* THE BRACE (C): the heel driven into the turf behind her, the point levelled at chest height, her weight down
       behind it and both hands on the haft. This is the pose a charge runs onto, so it is the pose that must read. */
    block: [0, 1].map(i => knightFrame({ wide: WIDE, dx: -1, dy: i, legs: 'wide',
      arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 1 + i],
      spear: [sh[0] - 4, sh[1] + 6 + i, 46, sh[1] - 1 + i] })),
  };
  /* THE RUN-THROUGH (her held heavy). The spinning shaft is gone - the owner did not like it, and it was the haft
     doing the work on a hero whose whole rule is the point. This is a WOUND-UP LUNGING THRUST instead: she coils
     over the back foot, then drives the whole body behind the spear and puts it through everything standing in a
     line. Three beats - the coil, the drive, the full stretch - and the point on the last of them is at SIXTY-FOUR
     on the canvas, which is forty-eight pixels of world: three tiles, and the number the attack box is cut to.
     It needs a wider frame than the rest of her (WIDE_H), because at full stretch she is longer than she is tall. */
  const WIDE_H = 38;
  F.heavy = [
    knightFrame({ wide: WIDE_H, dx: -3, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 4, sh[1] + 2], spear: [sh[0] - 6, sh[1] + 3, sh[0] + 6, sh[1] - 1], plume: 2 }),
    knightFrame({ wide: WIDE_H, dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 5, sh[1] + 1], spear: [sh[0] + 1, sh[1] + 1, 52, sh[1] + 1], plume: 1 }),
    knightFrame({ wide: WIDE_H, dx: 4, dy: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 7, sh[1] + 1], spear: [sh[0] + 5, sh[1] + 1, 64, sh[1] + 1], plume: 0 }),
  ];
  /* THE DASH ATTACK: LONG AND LOW ALONG THE SHAFT. Not the run-through (that is upright, coiled and level): out of a dash she drops her
     weight under it and the point goes in at knee height, so the whole of her is one line from the heel to the leaf. Then the point
     dips into the turf as she pulls up (the end-lag). */
  F.dashAtk = [
    knightFrame({ wide: WIDE_H, dx: 3, dy: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 6, sh[1] + 3], spear: [sh[0] - 4, sh[1] + 4, 56, sh[1] + 2], plume: 2 }),
    knightFrame({ wide: WIDE_H, dx: 5, dy: 3, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 7, sh[1] + 3], spear: [sh[0], sh[1] + 4, 62, sh[1] + 3], plume: 2 }),
    knightFrame({ wide: WIDE, dx: 2, dy: 2, legs: 'land', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 4], spear: [sh[0] - 2, sh[1] + 5, 44, sh[1] + 8], plume: 0 }),
  ];
  /* THE WIND-UP OF THE RUN-THROUGH, with frames of its own at last. While the swing was held she was drawn in the
     BRACE pose - the very move that has been taken off her - so winding the lunge looked exactly like planting the
     spear, and the owner was right to say he could see the old attacks. Three beats of LOADING it instead: the point
     comes back past her shoulder, the weight goes over the back heel, and the whole of her coils under it. The head
     stays level the whole way, so the read is a spear being DRAWN, never a spear being set in the ground. */
  F.windup = [
    knightFrame({ wide: WIDE, dx: -1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 1, sh[1] + 1], spear: [sh[0] - 6, sh[1] + 4, sh[0] + 14, sh[1] - 1], plume: 1 }),
    knightFrame({ wide: WIDE, dx: -2, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 2, sh[1] + 2], spear: [sh[0] - 9, sh[1] + 5, sh[0] + 9, sh[1]], plume: 2 }),
    knightFrame({ wide: WIDE, dx: -3, dy: 2, legs: 'crouch', sho: 1, arm: [sh[0], sh[1], sh[0] - 4, sh[1] + 3], spear: [sh[0] - 12, sh[1] + 6, sh[0] + 5, sh[1] + 1], plume: 2 }),
  ];
  /* THE DEFLECT (C): the shaft swept up across her body and out. The read at sixteen pixels is the BAR laid over the
     bell of her - the one pose where the spear crosses the silhouette instead of running out of it - and then the point
     carried out and up on the follow through, which is where it meets an arrow. Two beats, and neither plants a heel. */
  F.deflect = [
    knightFrame({ wide: WIDE, dx: -1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 2], spear: [sh[0] - 6, sh[1] + 9, sh[0] + 10, sh[1] - 10], plume: 1 }),
    knightFrame({ wide: WIDE, dx: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] - 1], spear: [sh[0] - 3, sh[1] + 6, 32, sh[1] - 7], plume: 2 }),
  ];
  /* THE POLE VAULT: the heel planted behind her, the haft raked back and dead straight, and her whole body swung up
     the outside of it. The shaft is the read here - it runs from under her boots down and back to the ground she
     left - so it is given its full length, not tucked against her where it measured four pixels wide and said nothing. */
  F.vault = [
    knightFrame({ dx: 2, dy: -4, legs: 'jump', arm: [sh[0], sh[1], sh[0] - 3, sh[1] + 3], spear: [sh[0] - 4, sh[1] + 5, sh[0] - 15, sh[1] + 17], plume: 1 }),
    knightFrame({ dx: 4, dy: -8, legs: 'jump2', arm: [sh[0], sh[1], sh[0] - 5, sh[1] + 5], spear: [sh[0] - 6, sh[1] + 8, sh[0] - 17, sh[1] + 22], plume: 2 }),
  ];
  /* THE PIN. The plunge does not bounce her off any more: the point goes THROUGH the thing and holds it on the floor,
     and she stays down over the haft with both hands on it while she decides. Two beats, because standing on the end of
     a spear is a choice she is making and not a frame she is passing through: the drive home, and the weight leant on it. */
  F.pin = [
    knightFrame({ dy: 2, legs: 'crouch', arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 5], spear: [sh[0] + 2, sh[1] - 4, sh[0] + 3, sh[1] + 16], plume: 1 }),
    knightFrame({ dy: 3, legs: 'crouch', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 6], spear: [sh[0] + 3, sh[1] - 2, sh[0] + 4, sh[1] + 17], plume: 0 }),
  ];
  /* HER DODGE IS A HOP BACKWARD, not a tumble: she gives ground with the point still up, so a foe she left behind
     is at the end of the spear again by the time she lands. Four beats of one small backward leap. */
  F.roll = [
    knightFrame({ dx: -2, dy: -2, legs: 'jump', arm: [sh[0], sh[1], sh[0] + 2, sh[1]], spear: carry(-1), plume: 1 }),
    knightFrame({ dx: -4, dy: -3, legs: 'jump2', arm: [sh[0], sh[1], sh[0] + 2, sh[1]], spear: carry(-1), plume: 2 }),
    knightFrame({ dx: -5, dy: -1, legs: 'fall', arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 1], spear: carry(), plume: 2 }),
    knightFrame({ dx: -3, dy: 1, legs: 'land', arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 2], spear: carry(1), plume: 0 }),
  ];
  /* THE SECOND AND THIRD OF HER RUN. The second is short and off the hip; the third is the one that goes all the way
     out, so the run of three ends where her reach really is. Her air thrust is the same blow with her legs tucked. */
  F.atkB = [
    thrust(sh[0] - 4, sh[1] + 3, sh[0] + 9, sh[1] + 3, { dx: -1, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 2, sh[1] + 3], plume: 1 }),
    thrust(sh[0] + 2, sh[1] + 2, 42, sh[1] + 2, { dx: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 2], plume: 2 }),
    thrust(sh[0] + 4, sh[1] + 2, 52, sh[1] + 2, { dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 5, sh[1] + 2], plume: 2 }),
    thrust(sh[0] + 2, sh[1] + 3, 38, sh[1] + 3, { dx: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 3], plume: 0 }),
    F.atk[4],
  ];
  F.atkC = [
    thrust(sh[0] - 7, sh[1] - 1, sh[0] + 7, sh[1] - 1, { dx: -2, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 5, sh[1] - 1], plume: 1 }),
    thrust(sh[0] + 3, sh[1] - 1, 49, sh[1] - 1, { dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 5, sh[1] - 1], plume: 2 }),
    thrust(sh[0] + 6, sh[1] - 1, 57, sh[1] - 1, { dx: 3, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 7, sh[1] - 1], plume: 2 }),
    thrust(sh[0] + 3, sh[1] + 1, 41, sh[1] + 1, { dx: 1, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 5, sh[1] + 1], plume: 0 }),
    F.atk[4],
  ];
  F.air = [
    thrust(sh[0] - 5, sh[1] + 1, sh[0] + 9, sh[1] + 1, { legs: 'jump2', dy: -1, arm: [sh[0], sh[1], sh[0] - 3, sh[1] + 1], plume: 1 }),
    thrust(sh[0] + 2, sh[1], 43, sh[1], { legs: 'jump2', dy: -1, arm: [sh[0], sh[1], sh[0] + 4, sh[1]], plume: 2 }),
    thrust(sh[0] + 5, sh[1], 55, sh[1], { legs: 'jump', dy: -1, arm: [sh[0], sh[1], sh[0] + 6, sh[1]], plume: 2 }),
    thrust(sh[0] + 2, sh[1] + 2, 37, sh[1] + 2, { legs: 'jump', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 2], plume: 1 }),
    F.jump[1],
  ];
  /* THE STRAIGHT-UP THRUST, for whatever is over her: she is the one hero the flyers cannot sit above */
  F.cast = [0, 1].map(i => knightFrame({ legs: 'wide', dy: i, arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 4],
    spear: [sh[0] + 2, sh[1] + 4, sh[0] + 3, sh[1] - 16 + i] }));
  /* THE PHALANX (a full VIGIL, spent). She does not level the spear any more - the old pierce buff was four and a half
     seconds of a number nobody could see. She PLANTS it: up in both hands, then driven straight down through the turf at
     her feet, and the row of spears comes up out of the ground away from her. The pose is the cause, and what the player
     watches is the line of points erupting across the room, which is drawn in the world and not on her. */
  F.blast = [knightFrame({ wide: WIDE, dy: -2, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 5], spear: [sh[0] + 2, sh[1] - 4, sh[0] + 3, sh[1] - 18], glow: [sh[0] + 2, sh[1] - 6] }),
    knightFrame({ wide: WIDE, dy: 2, legs: 'crouch', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 6], spear: [sh[0] + 3, sh[1] + 9, sh[0] + 3, sh[1] - 6], glow: [sh[0] + 3, sh[1] + 9] })];
  /* HER FIDGET: the spear taken off the ground, turned once in her hands to look down the haft, the point sighted
     along at arm's length, and set back in the turf. A woman checking a shaft she has carried a long way. */
  { const lift = knightFrame({ arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 1], spear: [sh[0] + 3, sh[1] - 1, sh[0] + 4, sh[1] - 15], plume: 1 });
    const turn = knightFrame({ arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 1], spear: [sh[0] - 4, sh[1] + 5, sh[0] + 12, sh[1] - 5], plume: 1 });
    const sight = knightFrame({ hy: 1, arm: [sh[0], sh[1], sh[0] + 4, sh[1] - 1], spear: [sh[0] - 3, sh[1] + 1, sh[0] + 13, sh[1] + 1], plume: 0 });
    const sight2 = knightFrame({ hy: 1, sho: 1, arm: [sh[0], sh[1], sh[0] + 4, sh[1] - 1], spear: [sh[0] - 3, sh[1] + 1, sh[0] + 13, sh[1] + 1], plume: 2 });
    const setDown = knightFrame({ dy: 1, arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 2], spear: rest(1), plume: 2 });
    F.fidget = holdFrames([[lift, 2], [turn, 3], [sight, 3], [sight2, 3], [sight, 2], [turn, 2], [setDown, 2], [F.idle[7], 2]]); }
  /* HER DANCE, for the victory card: THE TWIRL. Her whole rule is the point, so the point is what dances - the haft
     goes right round her hand in a flat wheel in front of her, eight beats to the turn, her feet crossing under it.
     A straight bar two-thirds as long as she is tall, going round, is not a thing any other hero here can draw.
     (Her fidget turns the spear ONCE to look down it and sets it back in the turf; this never stops.) */
  { const hx = sh[0] + 2, hy0 = sh[1] - 1;
    const TW = [0, 1, 2, 3, 4, 5, 6, 7].map(k => { const th = k * Math.PI / 4;
      return knightFrame({ legs: k % 4 === 0 ? 'stand' : k % 2 ? 'runC' : 'wide', dy: k % 4 === 2 ? 1 : 0, plume: k % 3,
        arm: [sh[0], sh[1], hx, hy0], spear: [hx, hy0, Math.round(hx + 11 * Math.cos(th)), Math.round(hy0 - 9 * Math.sin(th))] }); });
    F.dance = holdFrames(TW.map(f => [f, 1])); }
  /* HER OTHER TWO DANCES (heroanim lane, 2026-10-10). dance2 = THE SENTRY'S DRILL, her idle solo: the spear brought to the shoulder
     at the slope, a short stab at the empty air twice, shifted to the low guard, and a heel-turn with the haft crossing her body to
     stand at the ordered-arms in the turf. dance3 = THE SPEARS RAISED, a boss down: both fists up, the spear straight over her head
     and held to the light, the glint run up the shaft, and then thrown high a hand's width and caught, planted point-down with a stamp. */
  { // (S below: arm hand offset, spear base offset, spear tip offset)
    const S = (hx, hy2, bx, by, tx, ty, o = {}) => knightFrame({ arm: [sh[0], sh[1], sh[0] + hx, sh[1] + hy2], spear: [sh[0] + bx, sh[1] + by, sh[0] + tx, sh[1] + ty], ...o });
    const gl = (x, y) => [[x - BX, y - BY, '#ffffff'], [x - BX - 1, y - BY + 1, '#fff6c8'], [x - BX + 1, y - BY + 1, '#fff6c8'], [x - BX, y - BY - 1, '#fff6c8']];
    const slope = S(2, 0, -5, 6, 9, -7, { legs: 'wide', plume: 1 });
    const stab0 = S(3, -1, -3, 1, 11, -1, { legs: 'runC', dx: 1, plume: 2 }), stab1 = S(5, -1, 0, 0, 13, -1, { legs: 'runC', dx: 2, plume: 2 });
    const low = S(3, 2, -4, 6, 11, 8, { legs: 'wide', dy: 1, plume: 1 });
    const cross = S(2, -1, 9, -9, -3, 6, { legs: 'run2', plume: 2 });
    const ord = S(2, 1, 4, 14, 5, -1, { plume: 1 });
    F.dance2 = holdFrames([[S(2, 2, 1, 2, 3, 12, { plume: 1 }), 2], [slope, 4], [S(2, 0, -3, 4, 10, -8, { legs: 'wide', plume: 2 }), 2], [stab0, 2], [stab1, 2], [stab0, 2], [slope, 2], [stab0, 2], [stab1, 2], [stab0, 2],
      [low, 3], [S(3, 1, -4, 4, 11, 4, { legs: 'wide', plume: 2 }), 2], [cross, 3], [S(2, -1, 8, -10, -2, 5, { legs: 'run4', plume: 1 }), 2], [ord, 4], [F.idle[7], 2]]);
    const up = (o = {}) => S(3, -3, 4, 8, 4, -11, { plume: 2, ...o });
    const hold = up({ legs: 'wide', dy: -1, sho: 1, bits: gl(sh[0] + 4, sh[1] - 11) });
    const thrown = S(2, -3, 4, -6, 5, -12, { legs: 'jump', dy: -2, plume: 2, bits: gl(sh[0] + 5, sh[1] - 12) });
    const caught = S(3, 1, 4, 13, 3, -1, { legs: 'crouch', legsDy: 3, dy: 3, plume: 2 });
    const stamp = S(3, 1, 4, 15, 4, 0, { dy: 1, legs: 'wide', plume: 2, bits: [[10, 15, '#8a7a5a'], [14, 15, '#8a7a5a'], [9, 14, '#5a4e38'], [15, 14, '#5a4e38']] });
    F.dance3 = holdFrames([[F.idle[7], 1], [S(3, -1, 4, 8, 5, -4, { legs: 'wide', plume: 1 }), 2], [up(), 2], [hold, 3], [up({ bits: gl(sh[0] + 4, sh[1] - 8) }), 2], [hold, 3], [S(2, -2, 4, 2, 5, -9, { legs: 'wide', dy: -1, plume: 1 }), 2], [thrown, 3], [up({ dy: -1, legs: 'jump2' }), 1], [caught, 2], [stamp, 4], [ord, 3], [F.idle[7], 2]]); }
  /* FOLLOW-THROUGH (heroanim lane, 2026-10-10): the two frames a light strike plays inside its existing recovery (main.js recPose branch; the beat table
     is at the top of src/attack-animation.js). A = the weapon spent, carried on low past the target, body one pixel forward, plume still flying;
     B = it coming back to guard, the weight settling. Art only: atkRec is read, never written. */
  F.follow = [knightFrame({ dx: 1, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 3], spear: [sh[0] - 3, sh[1] + 3, sh[0] + 12, sh[1] + 9], plume: 1 }), knightFrame({ dy: 1, arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 2], spear: [sh[0] - 1, sh[1] + 4, sh[0] + 9, sh[1] + 1], plume: 0 })];
  /* HER SLUMP: she puts it DOWN. The spear is laid out on the ground at her boots and her hands are empty, which is
     the one thing in this game she never does - the brim goes down, the shoulders sag, and the longest line on the
     card is lying flat. */
  { const set = (d, hy) => knightFrame({ dy: 1 + d, hy, sho: -1, legs: 'stand', plume: 0,
      arm: [sh[0], sh[1], sh[0] + 1, sh[1] + 5], spear: [sh[0] - 8, sh[1] + 8 - d, sh[0] + 12, sh[1] + 8 - d] });
    F.slump = [set(0, 2), set(1, 3)]; }
  /* HER SWIM: the spear held along her in the off hand with the POINT LEADING - laid out, it runs on past her hat, and
     at sixteen pixels that line out in front is the whole of her. Treading, she holds it upright, point to the sky. */
  { const S = swimRig(knightFrame, sh, { carry: { spear: [sh[0] - 1, sh[1] + 9, sh[0], sh[1] - 12] },
      tread: i => ({ spear: [sh[0] + 2, sh[1] + 4 + TREAD_DY[i], sh[0] + 3, sh[1] - 11 + TREAD_DY[i]], bits: flap([3, 4], TREAD_DY[i], 1, 'b', 'B') }) });
    F.swim = S.swim; F.tread = S.tread; }
  const mirror = f => Array.isArray(f) ? f.map(flipX) : flipX(f);
  /* SET THE SPEAR and THE LOW POKE (src/crouch-a.js, claude/croucha). Down on her heels, the heel of the spear bitten into the turf
     behind her and the haft levelled low across her knee, the point out at the full reach of her thrust a hand off the floor - the thing
     a charge runs onto; then the haft bowed and the point flashing white as it takes one. The poke: drawn in along the floor, and driven
     out flat at the ankles to the end of her reach, her weight gone after it. */
  { const low = { wide: WIDE, dy: 3, legsDy: 3, legs: 'crouch' };
    F.set = [knightFrame({ ...low, plume: 1, arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 4], spear: [sh[0] - 7, sh[1] + 5, 57, sh[1] + 1] }),
      knightFrame({ ...low, dx: -1, plume: 2, arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 4], spear: [sh[0] - 8, sh[1] + 5, 55, sh[1] + 2], bits: [[45, 9, '#ffffff'], [46, 9, '#dff0d8'], [45, 8, '#dff0d8']] })];
    F.lowPoke = [knightFrame({ ...low, dx: -1, plume: 1, arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 4], spear: [sh[0] - 9, sh[1] + 4, 47, sh[1] + 2] }),
      knightFrame({ wide: 38, dx: 2, dy: 3, legs: 'wide', plume: 2, arm: [sh[0], sh[1], sh[0] + 5, sh[1] + 3], spear: [sh[0] - 2, sh[1] + 4, 59, sh[1] + 2] })]; }
  directionalPoses(F, 'spear', {});
  wardenKitPoses(F, sh, WIDE);
  smearPass(F, SMEAR_COL.steel);   /* the strike beats get their arc (claude/herokeys) */
  const R = F, L = {}; for (const k in F) L[k] = mirror(F[k]);
  const white = {}; for (const k in F) white[k] = Array.isArray(F[k]) ? F[k].map(c => whiten(c)) : whiten(F[k]);
  const whiteL = {}; for (const k in white) whiteL[k] = mirror(white[k]);
  KP = Object.assign({}, KP0); BODY_REF = BODY; PLUME_REF = PLUME;
  const set = { R, L, white: { R: white, L: whiteL }, ...KNIGHT_ANCHOR, ay: KNIGHT_ANCHOR.ay + ATTACK_HEADROOM };
  if (!SPEARLESS) { SPEARLESS = true; try { set.bare = bakeWarden(skin); } finally { SPEARLESS = false; } }   /* drawn while the JAVELIN is out: the cue that it is gone */
  return set;
}
/* EVERY ABILITY HAS A BODY: THE WARDEN'S. Skewer, Javelin, Set the Spears, Rain of Spears and Full Stretch each played beside a
   Warden standing idle, on a borrowed thrust, or on her Vigil's plant (tools/ability-poses.mjs); each has frames of its own now,
   played by src/hero-poses.js. Her whole rule is the point, so every one of these is told by where the POINT is. OFF is the off
   shoulder, for the second hand on the haft; o() puts a loose pixel at an offset from the shoulder `sh`. */
function wardenKitPoses(F, sh, WIDE) {
  const [X, Y] = sh, OFF = [BX + 2, BY + 7], KF = f => knightFrame({ top: ATTACK_HEADROOM, ...f });   /* made after the padding, with its headroom */
  const o = (x, y, col) => [X - BX + x, Y - BY + y, col];
  const W = '#ffffff', C = '#dff0d8', G = '#8fd160', D = '#c9b27c';
  /* SKEWER: coiled back over the heel, then the whole of her down behind a point driven in LOW and on the slant - through the
     thing and into the floor under it, which is the pin - and hauled back out */
  F.skewer = [KF({ wide: WIDE, dx: -2, dy: 1, legs: 'wide', arm: [X, Y, X - 3, Y + 2], spear: [X - 8, Y + 3, X + 8, Y + 4], plume: 1 }),
    KF({ wide: WIDE + 8, dx: 4, dy: 2, legs: 'runC', arm: [X, Y, X + 6, Y + 2], spear: [X + 2, Y + 1, 52, Y + 7], plume: 2, bits: [[38, 14, W], [37, 13, C], [37, 15, C]] }),
    KF({ wide: WIDE, dx: 2, dy: 1, legs: 'wide', arm: [X, Y, X + 3, Y + 3], spear: [X - 2, Y + 3, 42, Y + 7], plume: 0 })];
  /* JAVELIN (drawn from her BARE set: the spear is already in the air): the throwing arm drawn right back behind her head,
     brought through high and forward on the release, and carried down across her on the follow-through - the empty hand is
     the read, and the shaft is out ahead of it */
  F.javThrow = [KF({ dx: -2, legs: 'wide', sho: 1, arm: [X, Y, X - 6, Y - 5], arm2: [OFF[0], OFF[1], OFF[0] + 5, OFF[1] - 1], plume: 1 }),
    KF({ wide: 4, dx: 2, legs: 'runC', arm: [X, Y, X + 7, Y - 4], plume: 2, bits: [o(8, -5, C), o(9, -5, W)] }),
    KF({ dx: 2, dy: 1, legs: 'wide', arm: [X, Y, X + 4, Y + 5], arm2: [OFF[0], OFF[1], OFF[0] - 4, OFF[1] + 3], plume: 2 })];
  /* SET THE SPEARS: down on one knee (LEGS.kneel), the spear raised in both hands point-DOWN over the turf, driven in, and
     leant on while the row comes up away from her. Her Vigil's plant (blast) stands and holds the point UP: this is the knee */
  F.plant = [KF({ wide: WIDE, dy: 2, legs: 'kneel', arm: [X, Y, X + 3, Y - 6], arm2: [OFF[0], OFF[1], X + 2, Y - 4], spear: [X + 3, Y - 12, X + 4, Y + 1], plume: 1 }),
    KF({ wide: WIDE, dy: 3, legs: 'kneel', arm: [X, Y, X + 3, Y + 1], arm2: [OFF[0], OFF[1], X + 2, Y + 2], spear: [X + 3, Y - 6, X + 4, Y + 8], plume: 2, bits: [o(2, 6, D), o(6, 6, D), o(1, 5, D), o(7, 5, D)] }),
    KF({ wide: WIDE, dy: 3, sho: -1, legs: 'kneel', arm: [X, Y, X + 3, Y + 2], arm2: [OFF[0], OFF[1], X + 2, Y + 3], spear: [X + 3, Y - 5, X + 4, Y + 8], plume: 0, bits: [o(4, 5, G), o(3, 6, D), o(5, 6, D)] })];
  /* RAIN OF SPEARS: down low with the spear held back along her hip and pointing up, heaved up the whole height of her with
     both hands under it, and flung at the sky off the ends of her fingers - the green streak going up is the spear leaving */
  F.hurl = [KF({ wide: WIDE, dx: -1, dy: 2, legs: 'crouch', arm: [X, Y, X - 2, Y + 3], arm2: [OFF[0], OFF[1], X - 3, Y + 4], spear: [X - 6, Y + 5, X + 8, Y - 7], plume: 1 }),
    KF({ dy: -2, legs: 'jump', sho: 1, arm: [X, Y, X + 1, Y - 6], arm2: [OFF[0], OFF[1], X, Y - 5], spear: [X, Y - 3, X + 4, Y - 19], plume: 2 }),
    KF({ dy: -3, legs: 'jump', sho: 1, hy: -1, arm: [X, Y, X + 2, Y - 8], arm2: [OFF[0], OFF[1], X + 1, Y - 8], spear: [X + 2, Y - 10, X + 5, Y - 24], plume: 0,
      bits: [o(5, -27, G), o(5, -29, C), o(6, -31, G)] })];
  /* FULL STRETCH: from the carry, both hands slide back down the shaft to the heel, and she settles low and long behind it
     with the point out half as far again - the green running along the haft is the length she has just given it */
  F.stretch = [KF({ wide: WIDE, legs: 'wide', arm: [X, Y, X + 2, Y + 1], spear: [X - 4, Y + 2, X + 14, Y + 1], plume: 1 }),
    KF({ wide: WIDE + 4, dx: -1, legs: 'wide', arm: [X, Y, X - 2, Y + 2], arm2: [OFF[0], OFF[1], X - 3, Y + 2], spear: [X - 3, Y + 2, X + 22, Y + 1], plume: 2, bits: [o(6, 1, G), o(12, 1, G)] }),
    KF({ wide: WIDE + 6, dx: -2, dy: 1, sho: -1, legs: 'wide', arm: [X, Y, X - 3, Y + 2], arm2: [OFF[0], OFF[1], X - 4, Y + 2], spear: [X - 4, Y + 2, X + 25, Y + 1], plume: 0,
      bits: [o(8, 1, G), o(14, 1, C), o(20, 1, G)] })];
  /* ==== HERO PASS A ART (claude/heropassaart): the warden's new moves ==== */
  const ab = (x, y, col) => [x - BX, y - BY, col];
  const hpLn = (x0, y0, x1, y1, col, every = 1) => { const bits = [], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) if (i % every === 0) bits.push([Math.round(x0 + (x1 - x0) * i / n) - BX, Math.round(y0 + (y1 - y0) * i / n) - BY, typeof col === 'function' ? col(i, n) : col]); return bits; };
  const level = (dy = 0) => [X - 6, Y + 4 + dy, 44, Y + 3 + dy];   /* the spear laid LEVEL at hip height, point out: what a low blow passes under */
  /* LOW HOP (the dodge): COIL - down on both heels with the spear laid level and the whole of her sunk behind it; HOP - both knees tucked to the belt, the spear still LEVEL under the line of the blow and a
     green glint on the point; LAND - the knees giving, the point dipped and her weight forward. The five-pixel lift is the draw's (hero-pass.js drawMod); the dust under her is the world's. */
  F.wHop = [KF({ wide: WIDE, dx: -1, dy: 3, legs: 'crouch', legsDy: 3, arm: [X, Y, X + 2, Y + 3], arm2: [OFF[0], OFF[1], X, Y + 4], spear: level(1), plume: 1 }),
    KF({ wide: WIDE, dx: 1, dy: -1, legs: 'tuck', arm: [X, Y, X + 3, Y + 2], arm2: [OFF[0], OFF[1], X + 1, Y + 3], spear: level(), plume: 2, bits: [ab(44, Y + 2, C), ab(45, Y + 3, W), ab(24, Y + 5, G), ab(14, Y + 5, G)] }),
    KF({ wide: WIDE, dx: 2, dy: 2, legs: 'land', arm: [X, Y, X + 4, Y + 3], spear: [X - 3, Y + 4, 43, Y + 7], plume: 0, bits: [[0, 17, D], [-2, 16, D], [5, 17, D]] })];
  /* WALL PLANT: REACH - in the air and side-on to the wall with the spear drawn back level in both hands for the drive; DRIVEN - arms locked straight out, the point gone into the stone with the chips flying off
     it, and a white flash where it bit. Her spear is the foothold now, so she is bare-handed on the second beat. */
  F.wPlant = [KF({ wide: WIDE, dx: -2, legs: 'jump', sho: 1, arm: [X, Y, X - 2, Y + 2], arm2: [OFF[0], OFF[1], X - 3, Y + 3], spear: [X - 10, Y + 3, X + 14, Y + 2], plume: 1 }),
    KF({ wide: WIDE, dx: 3, legs: 'jump2', arm: [X, Y, X + 8, Y + 1], arm2: [OFF[0], OFF[1], X + 7, Y + 3], plume: 2, bits: [ab(X + 11, Y + 1, W), ab(X + 12, Y + 1, C), ab(X + 12, Y - 1, G), ab(X + 12, Y + 3, G), ab(X + 14, Y - 2, C), ab(X + 14, Y + 4, C), ab(X + 15, Y + 1, G)] })];
  /* PERCHED ON THE SHAFT (while she stands on the foothold): bare-handed, knees a little bent, both arms out for her balance and the cloak swaying - the spear itself is drawn in the world under her boots */
  F.wPerch = [0, 1].map(i => KF({ wide: WIDE, dy: 1, legs: i ? 'stand' : 'crouch', legsDy: i ? 0 : 1, sho: i, arm: [X, Y, X + 5, Y - 2 + i], arm2: [OFF[0], OFF[1], X - 6, Y - 1 - i], plume: i ? 2 : 0 }));
  riposteKit(F, 'warden', KF, { X, Y, OFF, WIDE });
}
// HEATHER BALE — a round bale of cut heather the wind rolls about the moor. 12x12, four turns of the straw.
export function bakeBale() {
  const BP = Object.assign({}, EP, { y: '#d9b44a', Y: '#b08a32', w: '#8a6a32', h: '#9a5aa8' });
  const frames = [];
  for (let k = 0; k < 4; k++) { const rows = [];
    for (let y = 0; y < 12; y++) { let r = ''; for (let x = 0; x < 12; x++) { const dx = x - 5.5, dy = y - 5.5;
      if (dx * dx + dy * dy > 30) { r += '.'; continue; }
      const band = ((x + y + k * 3) % 6 + 6) % 6, cross = ((x - y + k * 2) % 5 + 5) % 5;
      r += band < 2 ? 'w' : cross === 0 ? 'Y' : (x * 7 + y * 3 + k) % 11 === 0 ? 'h' : 'y'; }
      rows.push(r); }
    frames.push(outline(fromGrid(rows, BP, 1), OUT)); }
  return pack(frames, 6, 12, 12, 12);
}
// THE PALADIN: the knight's rig in pale plate - a winged helm, a blue tabard with a gold sun on it, gilded
// sabatons - and a maul instead of a sword. Frames as the knight's, plus cast (MEND) and blast (JUDGEMENT);
// the roll is a heavy step, not a tumble.
const PAL_BODY = [
  'y..SSSS...',
  'yySssssS..',
  '.ySsssssS.',
  '.SsvvvvS..',
  '.SssssSS..',
  '..SSSS....',
  '.BbbbbB...',
  'SBbyybBS..',
  'SByyyyBS..',
  '.BbyybB...',
  '.yyyyyy...',
];
const PAL_PLUME = [
  ['y..SSSS...', 'yySssssS..', '.ySsssssS.'],
  ['yy.SSSS...', '.ySssssS..', '.ySsssssS.'],
  ['y..SSSS...', 'yySssssS..', 'yySsssssS.'],
];
const PAL_PAL = { s: '#eef2f8', S: '#98a4ba', b: '#3a5ab8', B: '#243a78', r: '#f0c040', y: '#f0c040', w: '#b8c0cc', W: '#9a7a32', v: '#2a2f3d' };
export function bakePaladin(skin = {}, previewOnly = false) {
  KP = Object.assign({}, KP0, PAL_PAL, skin); BODY_REF = PAL_BODY; PLUME_REF = PAL_PLUME;
  const sh = [BX + 8, BY + 7];
  const rest = (d = 0) => [sh[0] + 2, sh[1] + 1 + d, sh[0] + 5, sh[1] + 9 + d];   // the head grounded in front of him
  const carry = (d = 0) => [sh[0] + 1, sh[1] + 3 + d, sh[0] - 8, sh[1] - 2 + d];  // slung back behind him at a run, clear of the helm
  // A STORE CARD NEEDS ONLY THE BREATH AND THE SWING, not the whole fighting life.
  const card = {
    idle: () => ((previewOnly === 'icon' ? (BREATH).slice(0, 1) : (BREATH)).map(([dy, hy, sho, plume], i) => knightFrame({ dy, hy, sho, plume, maul: [sh[0] + 3, sh[1] + 1, sh[0] + 8, sh[1] + 9 - dy], bits: flap([3, 4], dy, breathLag(i), 'b', 'B') }))),
    atk: () => ([
      () => (knightFrame({ dx: -2, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 2, sh[1] - 4], maul: [sh[0] - 2, sh[1] - 3, sh[0] - 7, sh[1] - 8], plume: 1 })),
      () => (// drawn back over the shoulder
      knightFrame({ dx: 0, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 1, sh[1] - 4], maul: [sh[0] + 1, sh[1] - 3, sh[0] + 5, sh[1] - 8], plume: 2 })),
      () => (// up and over
      knightFrame({ dx: 2, dy: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 2], maul: [sh[0] + 4, sh[1] + 2, sh[0] + 8, sh[1] + 7], plume: 2 })),
      () => (// down
      knightFrame({ dx: 2, dy: 2, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 4], maul: [sh[0] + 3, sh[1] + 4, sh[0] + 8, sh[1] + 9], plume: 0 })),
      () => (// the head in the ground
      knightFrame({ maul: rest(), plume: 0 }))
    ].map((make, i) => (previewOnly === 'weaponIcon' && i > 1) || (previewOnly === 'atk' && i > 2) ? null : make()))
  };
  if (previewOnly) return storeFrames(card, false, previewOnly, SMEAR_COL.gold);
  const F = {
    /* HIS BREATH: the head of the maul never leaves the ground - only the haft moves, with his hands - and the tabard below
       his belt gathers and falls a beat behind his chest */
    idle: card.idle(),
    run: [['run1', -1], ['run2', 0], ['run3', 1], ['run4', 0], ['run5', -1], ['run6', 0]].map(([l, dy], i) => knightFrame({ legs: l, dy, plume: i % 3, maul: carry() })),
    jump: [knightFrame({ legs: 'jump', dy: -1, maul: [sh[0] + 1, sh[1] + 1, sh[0] + 6, sh[1] - 6], plume: 1 }), knightFrame({ legs: 'jump2', maul: [sh[0] + 1, sh[1] + 1, sh[0] + 6, sh[1] - 5], plume: 1 })],
    fall: [knightFrame({ legs: 'fall', maul: [sh[0] + 1, sh[1] + 1, sh[0] + 6, sh[1] - 6], plume: 2 }), knightFrame({ legs: 'fall2', dy: -1, maul: [sh[0] + 1, sh[1] + 1, sh[0] + 5, sh[1] - 7], plume: 2 })],
    /* LANDING in three beats, as the starters': the IMPACT deep with the head of the maul jarred into the turf, the SETTLE, and up */
    land: [knightFrame({ legs: 'crouch', legsDy: 3, dy: 4, maul: [sh[0] + 2, sh[1] + 1, sh[0] + 5, sh[1] + 5], plume: 2 }), knightFrame({ legs: 'land', dy: 2, maul: rest(2) }), knightFrame({ legs: 'stand', dy: 1, maul: rest(1), plume: 1 })],
    /* THE TAKE-OFF: stretched off the push, the maul swung up by the lift of it */
    takeoff: knightFrame({ legs: 'push', dy: -2, sho: 1, maul: [sh[0] + 1, sh[1] + 1, sh[0] + 6, sh[1] - 7], plume: 2 }),
    apex: knightFrame({ legs: 'jump2', dy: -1, maul: [sh[0] + 1, sh[1], sh[0] + 6, sh[1] - 6], plume: 0 }),
    skid: knightFrame({ dx: -2, legs: 'wide', maul: [sh[0] - 1, sh[1] + 3, sh[0] - 6, sh[1] + 8], plume: 2 }),
    // HOLD THE MAUL: up in both hands, and down into the planking, and the ground carries it
    heavy: [
      knightFrame({ dx: -1, legs: 'wide', dy: -1, arm: [sh[0], sh[1], sh[0] - 1, sh[1] - 6], maul: [sh[0] - 1, sh[1] - 1, sh[0] + 1, sh[1] - 7], plume: 2 }),
      knightFrame({ dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] - 2], maul: [sh[0] + 3, sh[1] - 1, sh[0] + 8, sh[1] + 5], plume: 2 }),
      knightFrame({ dx: 2, legs: 'wide', dy: 2, arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 5], maul: [sh[0] + 2, sh[1] + 4, sh[0] + 7, sh[1] + 11], plume: 0 }),
    ],
    climb: [
      knightFrame({ legs: 'climbA', arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 7], maul: carry(), plume: 0 }),
      knightFrame({ legs: 'climbB', dy: 1, arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 3], maul: carry(1), plume: 1 }),
    ],
    atk: card.atk(),
    /* THE MAUL SLAM: the knight's tuck again - both knees drawn up, nothing left under him - with the maul driven
       straight down past his boots on the way to HAMMERFALL (main.js). His overhead swing still winds through an
       arc (atk, heavy); this is a plumb line, and that is the whole of the difference at a glance. */
    plunge: knightFrame({ legs: 'tuck', hy: 1, arm: [sh[0], sh[1], sh[0] - 1, sh[1] + 2], maul: [sh[0] - 1, sh[1] + 2, sh[0] - 1, sh[1] + 16], plume: 2 }),
    /* THE SHIELDLESS CHARGE: the maul carried level like a ram instead of over the shoulder - he has no shield to
       get in behind, so the whole of him leans into the head of it. Slowest hero in the wood, so the widest stance
       and the longest reach into the charge, not the fastest one. */
    dashAtk: [
      knightFrame({ wide: 3, dx: 2, dy: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 3], maul: [sh[0] + 3, sh[1] + 3, sh[0] + 12, sh[1] + 6], plume: 2 }),
      knightFrame({ wide: 4, dx: 4, dy: 1, legs: 'run1', arm: [sh[0], sh[1], sh[0] + 5, sh[1] + 4], maul: [sh[0] + 5, sh[1] + 4, sh[0] + 16, sh[1] + 6], plume: 2 }),
      knightFrame({ dx: 1, dy: 2, legs: 'land', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 5], maul: [sh[0] + 3, sh[1] + 5, sh[0] + 8, sh[1] + 10], plume: 0 }),
    ],
    hurt: [knightFrame({ dx: -1, dy: 1, legs: 'fall', maul: [sh[0] + 1, sh[1] + 2, sh[0] + 7, sh[1] + 5], plume: 2 }), knightFrame({ dx: -2, dy: 2, legs: 'land', maul: [sh[0], sh[1] + 3, sh[0] + 5, sh[1] + 8], plume: 1 })],
    crouch: knightFrame({ dy: 3, legs: 'crouch', legsDy: 3, maul: rest(-6) }),
    /* THE BUTT-SLIDE (src/slide.js): sat back on the ground with the legs run out in front, leaning away from the hill, the weapon tucked behind (a second frame for the cloth) */
    slide: [0, 1].map(i => knightFrame({ dx: -3, dy: 3, legs: 'slide', legsDy: 3, plume: i * 2, arm: [sh[0], sh[1], sh[0] - 1, sh[1]], maul: [sh[0] - 1, sh[1], sh[0] - 12, sh[1] - 3] })),
    /* KNEEL IN PRAYER (src/crouch-b.js): down on one knee, the maul planted upright before him with both hands on the haft and his helm
       bowed to it, the light gathering at its head - brighter, and a mote off it, on the second beat (and held there once his bar is full) */
    kneel: [0, 1].map(i => knightFrame({ dy: 3, hy: 1, legs: 'kneel', butt: 3, arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 1], maul: [sh[0] + 4, sh[1], sh[0] + 4, sh[1] - 10], glow: [sh[0] + 4, sh[1] - 15 - i], plume: 0,
      bits: i ? [[10, -6, '#ffd36b'], [15, -8, '#fff6c8']] : null })),
    // AEGIS: the maul planted upright before him, both hands on the haft
    block: [0, 1].map(i => knightFrame({ legs: 'wide', dy: i, arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 2], maul: [sh[0] + 3, sh[1] + 9, sh[0] + 3, sh[1] - 5], glow: [sh[0] + 3, sh[1] - 9] })),
    // MEND: the free hand up, the light in it
    cast: [0, 1].map(i => knightFrame({ legs: 'stand', arm: [sh[0], sh[1], sh[0] + 1, sh[1] - 7], maul: rest(), glow: [sh[0] + 1, sh[1] - 9 - i] })),
    // JUDGEMENT: the maul straight up over his head, then down
    blast: [knightFrame({ legs: 'wide', dy: -1, arm: [sh[0], sh[1], sh[0], sh[1] - 6], maul: [sh[0], sh[1] - 3, sh[0], sh[1] - 8], glow: [sh[0], sh[1] - 13] }),
      knightFrame({ dx: 2, dy: 2, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 4], maul: [sh[0] + 3, sh[1] + 4, sh[0] + 8, sh[1] + 9] })],
  };
  // the dodge is a heavy step: a lean and a stride, not a tumble
  F.roll = [0, 1, 2, 3].map(i => knightFrame({ dx: i < 2 ? i : 3 - i, dy: 1, legs: i % 2 ? 'wide' : 'runC', maul: carry(1) }));
  { const arcs = comboArcs(sh, 'maul', 8); F.atkB = [...arcs.B, F.atk[4]]; F.atkC = [...arcs.T, F.atk[4]]; F.air = [...arcs.A, F.jump[1]]; F.fidget = [...arcs.I, F.idle[0]]; }   /* the maul coming up from below, and a jab with the head */
  /* HIS FIDGET: the maul up off the ground and across him, a gauntlet wiped over the head of it - once, twice, his helm
     bent to it - until the steel catches the light, and down again with a thud */
  { const across = o => knightFrame({ arm: [sh[0], sh[1], sh[0] + 1, sh[1] + 3], maul: [sh[0] + 1, sh[1] + 3, sh[0] + 7, sh[1] - 1], ...o });
    const hand = (x, y) => [[x, y, 'b'], [x + 1, y, 'b'], [x, y + 1, 'B'], [x + 1, y + 1, 'b'], [x - 1, y + 1, 'S']];   /* a rag of the tabard's blue: a grey gauntlet vanished on grey steel */
    const lift = knightFrame({ arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 2], maul: [sh[0] + 2, sh[1] + 2, sh[0] + 6, sh[1] + 7], plume: 1 });
    const hold = across({ plume: 2 }), w1 = across({ hy: 1, plume: 1, bits: hand(13, 3) }), w2 = across({ hy: 1, plume: 0, bits: hand(15, 5) }), w3 = across({ hy: 1, plume: 0, bits: hand(17, 7) });
    const shine = across({ plume: 1, bits: [[15, 5, '#ffffff'], [14, 5, '#e8eef6'], [16, 5, '#e8eef6'], [15, 4, '#e8eef6'], [15, 6, '#e8eef6']] }), shine2 = across({ plume: 0, bits: [[15, 5, '#ffffff']] });
    const lower = knightFrame({ arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 2], maul: [sh[0] + 2, sh[1] + 1, sh[0] + 5, sh[1] + 8], plume: 2 });
    const thud = knightFrame({ dy: 1, maul: [sh[0] + 2, sh[1] + 1, sh[0] + 5, sh[1] + 8], plume: 2, bits: flap([3, 4], 1, 0, 'b', 'B') });
    F.fidget = holdFrames([[lift, 2], [hold, 2], [w1, 2], [w2, 2], [w3, 2], [w1, 1], [w2, 1], [w3, 2], [shine, 2], [shine2, 2], [lower, 2], [thud, 2], [F.idle[7], 1]]); }
  /* HIS DANCE (dances lane, 2026-09-29): THE MAUL RAISED TO THE LIGHT. It comes up across his chest, then straight up over the winged
     helm on both straight arms, and the light he spends on MEND and JUDGEMENT comes down it: the glow at the head, rays running out
     to either side, a pulse. He holds it up to be lit, the arms shake once with the weight of it, and it is brought down, blessed. */
  { const up = (o = {}) => knightFrame({ arm: [sh[0], sh[1], sh[0], sh[1] - 6], maul: [sh[0], sh[1] - 3, sh[0], sh[1] - 8], ...o });
    const across = knightFrame({ arm: [sh[0], sh[1], sh[0] + 1, sh[1] + 3], maul: [sh[0] + 1, sh[1] + 3, sh[0] + 7, sh[1] - 1], plume: 1 });
    const chest = knightFrame({ arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 1], maul: [sh[0] + 2, sh[1] + 2, sh[0] + 3, sh[1] - 6], plume: 2 });
    const rays = (r) => { const cx = sh[0] - BX, cy = sh[1] - 13 - BY, b = []; for (let i = 3; i <= 3 + r; i++) { b.push([cx - i - 1, cy + (i >> 1) + 1, '#fff6c8'], [cx + i + 1, cy + (i >> 1) + 1, '#fff6c8']); } b.push([cx, cy + 3 + r, '#ffe9a0'], [cx - 1, cy + 3 + r, '#fff6c8'], [cx + 1, cy + 3 + r, '#fff6c8']); return b; };
    const held = up({ legs: 'wide', dy: -1, plume: 1, glow: [sh[0], sh[1] - 13] });
    const lit1 = up({ legs: 'wide', dy: -1, plume: 2, glow: [sh[0], sh[1] - 13], bits: rays(1) });
    const lit2 = up({ legs: 'wide', dy: -1, plume: 0, glow: [sh[0], sh[1] - 13], bits: rays(3) });
    const strain = up({ legs: 'wide', dy: 0, hy: 1, plume: 2, glow: [sh[0], sh[1] - 13], bits: rays(2) });
    F.dance = holdFrames([[F.idle[0], 2], [chest, 2], [up({ dy: -1, plume: 1 }), 2], [held, 2], [lit1, 3], [lit2, 3], [strain, 2], [lit2, 3], [lit1, 2], [across, 2]]); }
  /* HIS OTHER TWO DANCES (heroanim lane, 2026-10-10). dance2 = THE VESPER, his idle solo: the maul set head-down before him, both
     gauntlets on the haft, down on a knee with the helm bowed, and a thread of light climbing the haft while he keeps it - then up,
     the maul taken to the shoulder. dance3 = THE HALLOWED STROKE, a boss down: the maul swung up and round overhead with the glow
     on its head, brought down hard so the light runs out along the ground either side, and the arms flung up open to it. */
  { const rays = (r, y = 15) => { const cx = sh[0] - BX, cy = y - BY, b = []; for (let i = 2; i <= 2 + r; i++) b.push([cx - i - 3, cy, '#fff6c8'], [cx + i + 3, cy, '#fff6c8']); b.push([cx + 2, cy - 1, '#ffe9a0'], [cx - 2, cy - 1, '#ffe9a0']); return b; };
    const M = (hx, hy2, bx, by, tx, ty, o = {}) => knightFrame({ arm: [sh[0], sh[1], sh[0] + hx, sh[1] + hy2], maul: [sh[0] + bx, sh[1] + by, sh[0] + tx, sh[1] + ty], ...o });
    const thread = y => [[sh[0] + 3 - BX, y - BY, '#fff6c8']];
    const set1 = M(2, 1, 2, 0, 3, 8, { plume: 1 }), kn = (d, hy, o = {}) => M(2, 0, 2, -1, 3, 7 - d, { dy: 4 + d, hy, legs: 'crouch', plume: 0, ...o });
    const onS = M(1, -1, 0, 2, -4, -9, { legs: 'wide', dx: -1, plume: 2 });
    F.dance2 = holdFrames([[F.idle[0], 2], [set1, 3], [kn(0, 0), 3], [kn(0, 1, { bits: thread(16) }), 3], [kn(1, 2, { bits: [...thread(14), ...thread(12)] }), 4], [kn(1, 2, { bits: [...thread(12), ...thread(9)], glow: [sh[0] + 2, sh[1] - 2] }), 4],
      [kn(0, 1, { glow: [sh[0] + 2, sh[1] - 2] }), 3], [kn(0, 0), 2], [set1, 3], [onS, 4], [M(2, 0, 2, 0, 4, 6, { legs: 'wide', plume: 2 }), 2], [F.idle[0], 2]]);
    const back = M(-1, -3, -2, -3, -6, -10, { legs: 'wide', dx: -2, plume: 1 }), top = M(3, -5, 3, -4, 3, -10, { legs: 'wide', dy: -1, plume: 2, glow: [sh[0] + 3, sh[1] - 11] });
    const swingF = M(4, 0, 4, 0, 11, 5, { legs: 'runC', dx: 2, plume: 2, glow: [sh[0] + 11, sh[1] + 5] });
    const slam = M(3, 3, 3, 3, 5, 12, { dy: 1, legs: 'wide', plume: 2, glow: [sh[0] + 5, sh[1] + 12], bits: rays(3, 15) });
    const slam2 = M(3, 3, 3, 3, 5, 12, { dy: 1, legs: 'wide', plume: 0, glow: [sh[0] + 5, sh[1] + 12], bits: rays(6, 15) });
    const open = knightFrame({ legs: 'wide', dy: -1, plume: 2, arm: [sh[0], sh[1], sh[0] + 5, sh[1] - 6], maul: [sh[0] + 3, sh[1] - 2, sh[0] + 3, sh[1] - 9], glow: [sh[0] + 3, sh[1] - 11], bits: rays(2, 4) });
    F.dance3 = holdFrames([[F.idle[0], 1], [back, 3], [top, 2], [M(2, -3, 1, -2, -6, -9, { legs: 'wide', dx: -1, plume: 2, glow: [sh[0] - 5, sh[1] - 9] }), 2], [swingF, 2], [slam, 3], [slam2, 3], [slam, 2],
      [M(3, 0, 3, 0, 4, 2, { legs: 'wide', dy: 1, plume: 1 }), 2], [top, 3], [open, 4], [top, 2], [F.idle[0], 2]]); }
  /* FOLLOW-THROUGH (heroanim lane, 2026-10-10): the two frames a light strike plays inside its existing recovery (main.js recPose branch; the beat table
     is at the top of src/attack-animation.js). A = the weapon spent, carried on low past the target, body one pixel forward, plume still flying;
     B = it coming back to guard, the weight settling. Art only: atkRec is read, never written. */
  F.follow = [knightFrame({ dx: 1, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 3], maul: [sh[0] + 3, sh[1] + 3, sh[0] + 8, sh[1] + 9], plume: 1 }), knightFrame({ dy: 1, arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 2], maul: [sh[0] + 2, sh[1] + 2, sh[0] + 4, sh[1] + 8], plume: 0 })];
  /* HIS SLUMP: he goes down on his knees over the maul, both gauntlets on the haft and the head of it in the
     ground, helm bowed to it - a man at a grave, not a man in a fight. There is no glow anywhere on him: the light
     is the one thing this hero always has, and the card is where he has not got it. */
  { const kneel = (d, hy) => knightFrame({ dy: 5 + d, hy, legs: 'crouch', plume: 0,
      arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 1], maul: [sh[0] + 2, sh[1] - 2, sh[0] + 4, sh[1] + 4 - d] });
    F.slump = [kneel(0, 1), kneel(1, 2)]; }
  /* HIS SWIM: the maul slung head-up across his back, where it rides above him like a keel turned over, and both
     hands free for the water. Treading, it stays slung. */
  { const S = swimRig(knightFrame, sh, { carry: { maul: [sh[0] - 3, sh[1] + 6, sh[0] - 7, sh[1] - 5] }, tread: i => ({ maul: carry(TREAD_DY[i]) }) });
    F.swim = S.swim; F.tread = S.tread; }
  const mirror = f => Array.isArray(f) ? f.map(flipX) : flipX(f);
  directionalPoses(F, 'maul', {});
  paladinKitPoses(F, sh);
  smearPass(F, SMEAR_COL.gold);   /* the strike beats get their arc (claude/herokeys) */
  const R = F, L = {}; for (const k in F) L[k] = mirror(F[k]);
  const white = {}; for (const k in F) white[k] = Array.isArray(F[k]) ? F[k].map(c => whiten(c)) : whiten(F[k]);
  const whiteL = {}; for (const k in white) whiteL[k] = mirror(white[k]);
  KP = Object.assign({}, KP0); BODY_REF = BODY; PLUME_REF = PLUME;
  return { R, L, white: { R: white, L: whiteL }, ...KNIGHT_ANCHOR, ay: KNIGHT_ANCHOR.ay + ATTACK_HEADROOM };
}
// THE QUEEN'S LANCE, redrawn as what he is: a GOBLIN knight. Green face under an open kettle helm with a red
// plume, ears out past the brim, a hooked nose and tusks; patched plate, the Queen's purple and gold, a kite
// shield on his back arm and a pennoned lance. Built from parts so every move has its own pose. 48x38.
// Frames: 0 stand, 1-4 walk, 5 couch, 6-7 charge, 8 thrustTell, 9 thrust, 10 sweepTell, 11 sweep, 12 planted,
// 13 guard, 14 guardTell, 15 guardSwing, 16-17 rush, 18 reel, 19 stumble, 20 vaultTell, 21 vault, 22 javTell,
// 23 javThrow, 24 rise, 25 bashTell, 26 bash, 27-28 guard walk.
export function bakeGoblinLance() {
  const LP = Object.assign({}, EP, { a: '#9aa3b0', A: '#5a6270', c: '#c9463d', C: '#8f2f28', p: '#5a2a7a', P: '#3e1c56', y: '#e0b040', u: '#8a5a32', U: '#4a2e1c', m: '#3a3e48', f: '#c9d1dc' });
  const W = 48, H = 38;
  const make = o => {
    const R = Array.from({ length: H }, () => Array(W).fill('.'));
    const set = (x, y, ch) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) R[y][x] = ch; };
    const run = (x, y, str) => { for (let i = 0; i < str.length; i++) if (str[i] !== '.') set(x + i, y, str[i]); };
    const seg = (x0, y0, x1, y1, ch, th = 1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1), steep = Math.abs(y1 - y0) > Math.abs(x1 - x0); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; for (let t = 0; t < th; t++) set(x + (steep ? t : 0), y + (steep ? 0 : t), ch); } };
    const dy = o.dy || 0, lean = o.lean || 0; // crouch and lean move the whole upper body
    // short, thick, bowed legs under a lot of goblin
    const leg = (hx, fx, lift, back) => { const kx = (hx + fx) / 2 + (back ? -2 : 2), ky = 32 + dy / 3 - lift / 2; seg(hx, 29 + dy, kx, ky, back ? 'A' : 'a', 4); seg(kx, ky, fx, 34 - lift, back ? 'A' : 'a', 4); run(fx - 2, 35 - lift, back ? 'UUUUU' : 'UUUUUe'); };
    const shieldAt = (sx, sy, dark) => { run(sx, sy, '.yyyyy.'); for (let k = 1; k <= 7; k++) run(sx, sy + k, 'y' + (dark ? 'PPPPP' : 'ppppp') + 'y'); run(sx + 1, sy + 8, 'ypppy'); run(sx + 2, sy + 9, 'yyy'); set(sx + 3, sy + 3, 'y'); set(sx + 2, sy + 4, 'y'); set(sx + 3, sy + 4, 'y'); set(sx + 4, sy + 4, 'y'); set(sx + 3, sy + 5, 'y'); };
    const lanceSeg = (x0, y0, x1, y1) => { seg(x0, y0, x1, y1, 'u', 1); const ux = Math.sign(x1 - x0), uy = Math.sign(y1 - y0); set(x1, y1, 'a'); set(x1 - ux, y1 - uy, 'a'); set(x1 + ux, y1 + uy, 'f'); set(x1 - ux * 4 - (uy ? 1 : 0), y1 - uy * 4 + (ux ? 1 : 0), 'c'); set(x1 - ux * 5 - (uy ? 1 : 0), y1 - uy * 5 + (ux ? 1 : 0), 'c'); set(x1 - ux * 5 - (uy ? 2 : 0), y1 - uy * 5 + (ux ? 2 : 0), 'C'); };
    if (o.shield === 'back') shieldAt(11 + lean, 15 + dy, true);
    const L1 = o.legs || [[19, 18, 0], [26, 27, 0]]; leg(19 + lean, L1[0][1], L1[0][2], true); leg(25 + lean, L1[1][1], L1[1][2], false);
    // a FAT goblin in plate: a round belly of a breastplate, the Queen's purple under it, a belt across the widest
    // part, pauldrons on shoulders that are mostly neck, and a big head sat low on all of it
    const cx = 21 + lean, ty = 12 + dy, tx = cx - 6;
    for (let k = 0; k <= 16; k++) { const hw = Math.max(3, Math.round(10 * Math.sqrt(Math.max(0, 1 - ((k - 9) / 10) ** 2)))); const y = ty + k;
      for (let x = cx - hw; x <= cx + hw; x++) { const edgeR = x >= cx + hw - 1, edgeL = x <= cx - hw;
        set(x, y, k === 11 ? (x === cx ? 'y' : 'U') : k > 11 ? (edgeL || edgeR ? 'P' : 'p') : (edgeR ? 'A' : edgeL ? 'A' : 'a')); } }
    run(cx - 3, ty + 3, 'ff'); run(cx - 4, ty + 4, 'f'); run(cx + 1, ty + 5, 'yy'); run(cx + 1, ty + 6, 'yy'); // the shine on the belly, and her boss on it
    for (let x = cx - 6; x <= cx + 6; x += 3) set(x, ty + 17, 'p'); // the tabard's ragged hem
    run(cx - 10, ty + 1, 'aaAa'); run(cx - 11, ty + 2, 'aAaaA'); run(cx + 5, ty, 'aaaAa'); run(cx + 5, ty + 1, 'aaaaAa'); set(cx + 9, ty - 1, 'e'); set(cx + 10, ty - 2, 'e'); // pauldrons, the front one spiked
    // head: big, low, pushed a little forward; a kettle helm with a brim, the face under it
    const hx = 23 + lean + (o.headDx || 0), hy = 2 + dy + (o.headDy || 0);
    run(hx - 6, hy - 3, o.plume === 'low' ? '.....' : 'cc...'); run(hx - 7, hy - 2, 'Cccc..'); run(hx - 6, hy - 1, '.Ccc');
    run(hx - 3, hy - 1, 'aaaaaaa'); run(hx - 4, hy, 'aAaaaaaaa'); run(hx - 4, hy + 1, 'aAaaaaaaaa'); run(hx - 6, hy + 2, 'AAAAAAAAAAAAAAA');
    run(hx - 3, hy + 3, 'ggggggggg'); run(hx - 3, hy + 4, 'ggggggeog'); run(hx - 3, hy + 5, 'gggggggggggg'); run(hx - 3, hy + 6, 'gGggggoooG'); run(hx - 2, hy + 7, 'GgggggggGG'); run(hx - 1, hy + 8, 'GGGGGGG');
    set(hx + 4, hy + 6, 'e'); set(hx + 2, hy + 7, 'e'); set(hx + 5, hy + 7, 'e'); // tusks
    run(hx + 7, hy + 4, 'gg'); run(hx + 8, hy + 5, 'ggG'); set(hx + 10, hy + 6, 'G'); // the nose
    run(hx - 8, hy + 2, 'gg'); run(hx - 9, hy + 1, 'gg'); set(hx - 10, hy, 'g'); run(hx - 7, hy + 3, 'Gg'); // an ear, out past the brim
    if (o.eyes === 'x') { set(hx + 3, hy + 4, 'o'); set(hx + 4, hy + 4, 'o'); }
    const sx = cx + 7, sy = ty + 3;
    const hand = o.hand || [sx + 3, sy + 6]; seg(sx, sy, hand[0], hand[1], 'a', 2); run(hand[0] - 1, hand[1], 'aAa');
    if (o.lance) lanceSeg(...o.lance);
    if (o.blade) { seg(hand[0], hand[1], o.blade[0], o.blade[1], 'f', 2); set(o.blade[0], o.blade[1], 'a'); }
    if (o.jav) { seg(o.jav[0], o.jav[1], o.jav[2], o.jav[3], 'u', 1); set(o.jav[2], o.jav[3], 'a'); }
    if (o.shield === 'front') shieldAt(o.sx !== undefined ? o.sx : tx + 12, (o.sy !== undefined ? o.sy : ty + 1));
    return R.map(r => r.join(''));
  };
  const f = rows => outline(fromGrid(rows, LP, 1), OUT);
  const up = { lance: [31, 30, 31, 1], hand: [30, 20] };
  const walkLegs = [[[19, 16, 0], [26, 29, 1]], [[19, 18, 2], [26, 27, 0]], [[19, 21, 0], [26, 24, 1]], [[19, 18, 0], [26, 27, 2]]];
  const frames = [
    make({ ...up, shield: 'back' }),
    ...walkLegs.map((legs, i) => make({ ...up, shield: 'back', legs, dy: i % 2 ? 1 : 0, lance: [31 + (i % 2), 30, 31 + (i % 2), 1 + (i % 2)] })),
    make({ shield: 'back', dy: 2, lean: -1, hand: [29, 19], lance: [18, 19, 46, 18], legs: [[19, 14, 0], [26, 30, 0]] }),
    make({ shield: 'back', dy: 2, lean: 1, hand: [30, 19], lance: [18, 19, 47, 19], legs: [[19, 13, 2], [26, 31, 0]], plume: 'low' }),
    make({ shield: 'back', dy: 1, lean: 1, hand: [30, 19], lance: [18, 19, 47, 19], legs: [[19, 20, 0], [26, 24, 3]], plume: 'low' }),
    make({ shield: 'back', lean: -2, hand: [24, 18], lance: [6, 18, 34, 17] }),
    make({ shield: 'back', lean: 2, dy: 1, hand: [34, 18], lance: [20, 18, 47, 18], legs: [[19, 14, 0], [26, 32, 0]] }),
    make({ shield: 'back', lean: -1, hand: [27, 10], lance: [12, 24, 36, 2] }),
    make({ shield: 'back', dy: 3, lean: 2, hand: [32, 24], lance: [18, 18, 46, 34], legs: [[19, 14, 0], [26, 31, 0]] }),
    make({ shield: 'back', dy: 2, lean: 1, hand: [31, 20], lance: [26, 16, 42, 36], legs: [[19, 15, 0], [26, 29, 0]], eyes: 'x' }),
    make({ shield: 'front', hand: [30, 24], blade: [36, 30] }),
    make({ shield: 'front', lean: -2, hand: [22, 12], blade: [16, 4] }),
    make({ shield: 'front', lean: 2, dy: 1, hand: [34, 22], blade: [44, 26], legs: [[19, 15, 0], [26, 31, 0]] }),
    make({ shield: 'front', sx: 31, dy: 3, lean: 1, hand: [29, 24], blade: [34, 30], legs: [[19, 13, 2], [26, 30, 0]] }),
    make({ shield: 'front', sx: 31, dy: 3, lean: 1, hand: [29, 24], blade: [34, 30], legs: [[19, 20, 0], [26, 25, 3]] }),
    make({ shield: 'back', lean: -3, dy: 1, headDx: -2, hand: [26, 12], legs: [[19, 15, 0], [26, 24, 0]], eyes: 'x' }),
    make({ shield: 'back', dy: 6, lean: 2, headDy: 1, hand: [34, 30], legs: [[19, 14, 0], [26, 32, 4]], eyes: 'x' }),
    make({ shield: 'back', dy: 5, hand: [29, 22], lance: [31, 36, 31, 6], legs: [[19, 15, 0], [26, 29, 0]] }),
    make({ shield: 'back', dy: -2, hand: [26, 22], lance: [25, 20, 25, 37], legs: [[19, 20, 4], [26, 25, 4]] }),
    make({ shield: 'back', lean: -2, hand: [20, 8], jav: [12, 10, 30, 4], lance: [36, 30, 36, 6] }),
    make({ shield: 'back', lean: 2, hand: [36, 14], lance: [38, 30, 38, 6] }),
    make({ shield: 'front', lean: -1, hand: [18, 10], lance: [4, 4, 16, 14] }),
    make({ shield: 'front', sx: 26, lean: -2, hand: [30, 20], lance: [32, 30, 32, 1] }),
    make({ shield: 'front', sx: 33, lean: 3, dy: 1, hand: [30, 20], lance: [28, 30, 28, 1], legs: [[19, 14, 0], [26, 31, 0]] }),
    make({ shield: 'front', hand: [30, 24], blade: [36, 30], dy: 1, legs: walkLegs[0] }),
    make({ shield: 'front', hand: [30, 24], blade: [36, 30], legs: walkLegs[2] }),
  ].map(f);
  return pack(frames, 24, 36, 26, 30);
}
// CHIMNEY SWEEP — a sooty goblin in a battered top hat, with a brush. He lives in the stacks and comes up out of
// them to throw soot. Frames: 0 up (brush on shoulder), 1 throw (arm over), 2 peeking (just the hat and eyes).
export function bakeSweep() {
  const SP = Object.assign({}, EP, { k: '#1e1a22', K: '#3a343e', g: '#5a7a3a', G: '#34462a', d: '#2a2630', t: '#b8a888' });
  const f = rows => outline(fromGrid(rows, SP, 1), OUT);
  const hat = ['...kkkk...', '...kKkk...', '..kkkkkk..'];
  const up = f([...hat, '..gggggg..', '.gdoggdog.', '.gggggggg.', '..gGGGGg..', '..dddddd.t', '..dddddd.t', '..dddddd.t', '..GG..GG.t', '.GG....GGt']);
  const thr = f([...hat, '..gggggg..', '.gdoggdog.', '.gggggggg.', '..gGGGGgtt', '..ddddddt.', '..dddddd..', '..dddddd..', '..GG..GG..', '.GG....GG.']);
  const peek = f(['..........', '..........', '..........', '..........', '..........', '..........', '...kkkk...', '...kKkk...', '..kkkkkk..', '..gdoggd..', '..........', '..........', '..........']);
  return pack([up, thr, peek], 6, 13, 8, 12);
}
// THE FACET — a crystal golem grown in the cavern's heart. 40×40. Frames: idle, walk1, walk2, stomp, throw, stagger. Four gems: brow, left shoulder, right shoulder, chest.
export function bakeGolem() {
  const GP = Object.assign({}, EP, { c: '#bfe6f5', C: '#7aa8c8', d: '#4a6a90', w: '#eefaff', g: '#ff7ab8', G: '#a8306a', k: '#2a3a50' });
  const f = rows => outline(fromGrid(rows, GP, 1), OUT);
  const W = 40, H = 40; const blank = () => Array.from({ length: H }, () => '.'.repeat(W));
  const put = (R, x, y, s) => { const row = R[y]; R[y] = row.slice(0, x) + s + row.slice(x + s.length); };
  const body = (legs) => { const R = blank();
    put(R, 16, 0, 'cccccccc'); put(R, 15, 1, 'cCccccccCc'); put(R, 14, 2, 'cCccggccccCc'); put(R, 14, 3, 'cCccggccccCc'); put(R, 14, 4, 'ccccccccccCc'); put(R, 15, 5, 'ckkccckkcc'); put(R, 15, 6, 'cwkccckwcc'); put(R, 16, 7, 'cccccccc'); put(R, 17, 8, 'dddddd');
    put(R, 4, 9, 'cccc........................cccc'); put(R, 3, 10, 'cggcccccccccccccccccccccccccccggc'); put(R, 2, 11, 'cggccCccccccccccccccccccccCccggc'); put(R, 2, 12, 'ccccccCcccccccccccccccccccCccccc'); put(R, 3, 13, 'CcccccccCcccccccccccccccccccccC');
    put(R, 4, 14, 'ddccccccc.ccccccccccc.cccccccdd'); for (let y = 15; y <= 20; y++) put(R, 5, y, 'dcccc.....ccccccccccccc.....ccccd'); put(R, 5, 17, 'dcccc.....cccccggggcccc.....ccccd'); put(R, 5, 18, 'dcccc.....cccccggggcccc.....ccccd');
    put(R, 5, 21, 'dccccc....cccccccccccc....cccccd'); put(R, 6, 22, 'dcccc.....CcccccccccccC.....ccccd'); put(R, 7, 23, 'ddd.......cccccccccccc.......ddd'); put(R, 12, 24, 'ddcccccccccccccdd'); put(R, 12, 25, 'dcccccccccccccccd');
    const L1 = legs === 1 ? [13, 23] : legs === 2 ? [11, 25] : [12, 24];
    for (const lx of L1) { for (let y = 26; y <= 33; y++) put(R, lx, y, 'Cccc'); put(R, lx - 1, 34, 'CccccC'); put(R, lx - 1, 35, 'dddddd'); }
    return R; };
  const idle = f(body(0)), walk1 = f(body(1)), walk2 = f(body(2));
  const stomp = f((() => { const R = body(0); for (let y = 9; y <= 14; y++) put(R, 30, y, 'cccc'); put(R, 30, 8, 'Cccc'); put(R, 30, 7, 'cccc'); put(R, 31, 6, 'ccc'); return R; })());
  const thr = f((() => { const R = body(0); put(R, 33, 6, 'cccc'); put(R, 34, 5, 'cccc'); put(R, 35, 4, 'ccc'); put(R, 36, 2, 'ww'); put(R, 35, 3, 'www'); put(R, 36, 1, 'w'); return R; })());
  const stagger = f((() => { const R = body(0); put(R, 15, 5, 'cwkccckwcc'); put(R, 15, 6, 'ckkccckkcc'); put(R, 14, 2, 'cCccGGccccCc'); put(R, 14, 3, 'cCccGGccccCc'); return R; })());
  // 6 shroud: both arms thrown wide and up, the ice coming with them
  const shroud = f((() => { const R = body(0); for (const [ax, up] of [[3, 1], [33, 1]]) { for (let y = 9; y >= 5; y--) put(R, ax, y, 'cccc'); put(R, ax, 4, 'Cccc'); put(R, ax + (ax > 20 ? 1 : -1), 3, 'wcc'); } return R; })());
  // 7 drink: it takes the beam in. Head back, chest open, every gem burning.
  const drink = f((() => { const R = body(0); put(R, 14, 2, 'cCccwwccccCc'); put(R, 14, 3, 'cCccwwccccCc');
    put(R, 5, 16, 'dcccc.....ccccwwwwcccc.....ccccd'); put(R, 5, 17, 'dcccc.....cccwwwwwwccc.....ccccd'); put(R, 5, 18, 'dcccc.....cccwwwwwwccc.....ccccd'); put(R, 5, 19, 'dcccc.....ccccwwwwcccc.....ccccd');
    for (const ax of [3, 33]) { for (let y = 9; y >= 7; y--) put(R, ax, y, 'cccc'); put(R, ax, 6, 'Cccc'); } return R; })());
  // 8 counter: it throws the light back. Head down, one arm out level, the chest a furnace.
  const counter = f((() => { const R = body(0); put(R, 15, 5, 'ckkccckkcc'); put(R, 15, 6, 'cggccckgcc');
    put(R, 5, 17, 'dcccc.....cccwwwwwwccc.....ccccd'); put(R, 5, 18, 'dcccc.....cccwwwwwwccc.....ccccd');
    for (let x = 30; x <= 36; x += 3) put(R, x, 12, 'ccc'); put(R, 36, 11, 'www'); put(R, 36, 13, 'www'); put(R, 33, 11, 'ccc'); put(R, 33, 13, 'ccc'); return R; })());
  return pack([idle, walk1, walk2, stomp, thr, stagger, shroud, drink, counter], 20, 36, 30, 34);
}
// The moor hare — fast, low, and it runs with the wind. 12×8. Frames: run1, run2, sit.
export function bakeHare() {
  // A HARE WITH NO EARS IS A LUMP. That is what it was: a brown mass with a darker back. The ears are
  // most of what a hare IS - long, laid back over the shoulders when it runs, up when it sits - and the
  // white scut and the eye do the rest. 13x9, facing right.
  const HP2 = Object.assign({}, EP, { h: '#8a6a4a', H: '#5a4230', w: '#e8dcc0', e: '#1b1626', r: '#c9463d' });
  const q = rows => outline(fromGrid(rows, HP2, 1), OUT);
  const run1 = q(['......hh.hh..', '.....hh.hh...', '.....hhhhhh..', '...hhhhhhhhh.', '.HhhhhhhhhhHe', 'whhhhhhhhhhh.', '.HhhhhhhhhH..', 'hh..hh..hh...', 'h....h....h..']);
  const run2 = q(['......hh.hh..', '.....hh.hh...', '.....hhhhhh..', '...hhhhhhhhh.', '.HhhhhhhhhhHe', 'whhhhhhhhhhh.', '.HhhhhhhhhH..', '..hhhh.hhh...', '..h..h..h....']);
  const sit = q(['.......h.h...', '.......h.h...', '.......hhh...', '....hhhhhhh..', '...hhhhhhhHe.', '.wHhhhhhhhh..', '..hhhhhhhh...', '..hhhhhhhh...', '...hh...hh...']);
  return pack([run1, run2, sit], 6, 10, 10, 7);   /* the paws a row into the ground like every walker's: at 9 it sat two rows into the moor */
}

// The peat wight — a pale hand of bog-mist that rises where you stand too long. 10×14. Frames: rise1, rise2.
/* REDRAWN (2026-09-17): it used to read as a sandcastle - a crenellated top of three separate points, then a
   pinched waist that made a second, boxier shape under it, and a "vent" nobody could see. A GHOST IS A DOME,
   NOT A TURRET: the top is now one continuous rounded crown, the taper from shoulder to tail is a single
   unbroken curve (no waist), and the tail keeps the three-lobed wave it always had - that part already read
   right. The two hollow sockets are darker now, and a small hollow mouth sits under them: the same shape
   language as the fields' own ghosts (fields_foes.js), on a wight who was never one of them but reads as
   kin now. Same 10x14 canvas, same pack(5,14,8,13): the hitbox has not moved. */
export function bakeWight() {
  const WP2 = Object.assign({}, EP, { m: '#c8d8c8', M: '#8aa08a', k: '#161a28' });
  const q = rows => outline(fromGrid(rows, WP2, 1), OUT);
  const dome = ['..mmmmmm..', '.mmmmmmmm.', 'mmmmmmmmmm', 'mMmmmmmmMm', 'mmmkmmkmmm', 'mmmmkkmmmm', 'mmmmmmmmmm', '.mmmmmmmm.', '.mmmmmmmm.', '.mMmmmmMm.', '..mmmmmm..', '..mmmmmm..'];
  const rise1 = q([...dome, '.mm.mm.mm.', 'm...m...m.']);
  const rise2 = q([...dome, 'mm.mm.mm..', '...m...m.m']);
  const rise3 = q([...dome, 'm.mm.mm..m', '..m...m.m.']);
  const rise4 = q([...dome, '.mm.mm..mm', '.m...m.m..']);
  return pack([rise1, rise2, rise3, rise4], 5, 14, 8, 13);
}
// The glow grub — a fat cave larva that lights its own way and spits acid. 16×8. Frames: crawl1, crawl2, spit.
export function bakeGrub() {
  const GP = Object.assign({}, EP, { g: '#b8d878', G: '#7a9a48', p: '#e8ff9a', P: '#ffffc8', k: '#3a3a2a' });
  const q = rows => outline(fromGrid(rows, GP, 1), OUT);
  const crawl1 = q(['......gggggggg..', '..ggggGgggGgggg.', '.gGggggggggggggP', 'gkggGgggGgggGgpP', 'gkgggggggggggggP', '.gGggggggggggggP', '..ggggGgggGgggg.', '...gg..gg..gg...']);
  const crawl2 = q(['......gggggggg..', '..ggggGgggGgggg.', '.gGggggggggggggP', 'gkggGgggGgggGgpP', 'gkgggggggggggggP', '.gGggggggggggggP', '..ggggGgggGgggg.', '.gg..gg..gg.....']);
  const spit = q(['......gggggggg..', '.gggggGgggGgggg.', 'gkGggggggggggggP', 'gkkgGgggGgggGgpP', 'gkgggggggggggggP', '.gGggggggggggggP', '..ggggGgggGgggg.', '...gg..gg..gg...']);
  return pack([crawl1, crawl2, spit], 8, 8, 14, 7);
}
// The rock goblin — a mine goblin in a stone-scale hood who throws lanterns. 12×11. Frames: walk1, walk2, throw.
export function bakeRockGoblin() {
  /* THE ROCK GOBLIN walks about with the next one already over his head, both hands under it, so you know
     what he does before he does it - and his outline is twice as tall as a goblin's. */
  const RG = Object.assign({}, KG, { h: '#8a919c', H: '#5a6270', y: '#ffd36b', l: '#ff9a5c' });
  const r = rows => outline(fromGrid(rows, RG, 1), OUT);
  const E = '............';
  const rock = ['...hhhhh....', '..hHhhhHh...', '..gHHhhHg...', '..g.hhh.g...'];
  const head = ['...hhhhhh...', '..hHhhhhHh..', '..hhhhhhhh..', '..ggeoggeo..', '...gggggg...', '...gGGGGg...'];
  const walk1 = r([...rock, ...head.slice(1), '..xxxxxxx.y.', '.xxxxxxxx.l.', '..xxxxxx..y.', '..GG..GG....', '.GG....GG...']);
  const walk2 = r([...rock, ...head.slice(1), '..xxxxxxx.y.', '.xxxxxxxx.l.', '..xxxxxx..y.', '...GGGG.....', '...GG.GG....']);
  const thr = r([E, E, E, '...hhhhhh..y', '..hHhhhhHh.l', '..hhhhhhhh.y', '..ggeoggeoxx', '...gggggg.x.', '...gGGGGg...', '..xxxxxxx...', '.xxxxxxxx...', '..xxxxxx....', '..GG..GG....', '.GG....GG...']);
  /* THE WIND-UP: the rock taken back over his shoulder and his feet set - the moment you have to move - and the hurt frame, the rock tipping off his head */
  const lift = r(['.hhhhh......', 'hHhhhHh.....', 'gHHhhHg.....', 'g.hhh.g.....', ...head.slice(1), '..xxxxxxx.y.', '.xxxxxxxx.l.', '..xxxxxx..y.', '.GG...GG....', 'GG.....GG...']);
  const hurt = r(['.....hhhhh..', '....hHhhhHh.', '....hHHhhHh.', '......hhh...', '..hhhhhhhh..', '..ggoggog...', '..gg....gg..', '...gGGGGg...', E, '..xxxxxxx...', '.xxxxxxx....', '..xxxxxx....', '.GG...GG....', 'GG.....GG...']);
  return pack([walk1, walk2, thr, lift, hurt], 7, 14, 10, 11);
}
// THE FORGEMASTER, at twice the size: a hulking smith in a steam rig. Boiler pack on his back, a furnace grate for a belly, a hammer arm as long as he is tall. 48×34.
// Frames: 0 idle, 1 raise, 2 slam, 3 drag, 4 hurl, 5 tongs wind-up (the hammer hot), 6 breath, 7-8 walk, 9 tongs (the hammer
// swung flat), 10 the chain coiled, 11 the chain low, 12 the chain high, 13 the crucible up, 14 the crucible thrown, 15 stun (hurt, LAST).
export function bakeForgemasterBig() {
  const FP = Object.assign({}, KG, { i: '#8a919c', I: '#5a6270', c: '#6a4a3a', C: '#3a2a24', y: '#ffd36b', s: '#e8e0d0', k: '#3a3a44', K: '#22222c', r: '#ff6b2c', R: '#ffd36b', x: '#c9463d' });
  /* A BLANK RING ROUND THE GRID: his helmet is drawn on row 0 and his hammer to the last column, so every frame's outline sat on its canvas edge */
  const f = rows => outline(fromGrid(['.'.repeat(W + 2), ...rows.map(r => '.' + r + '.'), '.'.repeat(W + 2)], FP, 1), OUT);
  const W = 48, H = 34; const blank = () => Array.from({ length: H }, () => '.'.repeat(W));
  const put = (rows, x, y, str) => { const row = rows[y]; rows[y] = row.slice(0, x) + str + row.slice(x + str.length); };
  const body = (eyes = 'ey', mouth = 'GGG', step = 0) => { const R = blank();
    // helmet, goggles, jaw
    put(R, 18, 0, 'iiiiiiiiii'); put(R, 17, 1, 'iiIIIIIIIIii'); put(R, 16, 2, 'iyyIIIIIIyyIi'); put(R, 16, 3, 'iy' + eyes[0] + 'yIIIIy' + eyes[1] + 'yIi'); put(R, 16, 4, 'iIIIIIIIIIIIi');
    put(R, 17, 5, 'gggggggggggg'); put(R, 17, 6, 'gg' + mouth + 'ggg' + mouth + 'gg'); put(R, 18, 7, 'ggggggggggg');
    // boiler pack
    put(R, 6, 8, 'kkkkkk'); put(R, 5, 9, 'kKKKKKKk'); put(R, 5, 10, 'kKKKKKKk'); put(R, 4, 11, 'kkKKKKKKkk'); for (let y = 12; y <= 16; y++) put(R, 4, y, 'kKKKKKKKKk'); put(R, 4, 17, 'kkKKKKKKkk'); put(R, 5, 18, 'kKKKKKKk'); put(R, 5, 19, 'kkkkkkkk'); put(R, 8, 5, 'ii'); put(R, 8, 6, 'ii'); put(R, 8, 7, 'ii'); // the chimney
    // torso and apron with the furnace grate
    put(R, 15, 8, 'IIIIIIIIIIIIIII'); put(R, 14, 9, 'IiiiiiiiiiiiiiiI'); put(R, 14, 10, 'IiiiiiiiiiiiiiiI'); put(R, 14, 11, 'IiicccccccccciiI'); put(R, 14, 12, 'IiccCCCCCCCCcciI');
    for (let y = 13; y <= 16; y++) put(R, 14, y, 'IiccCrrrrrrCcciI'); put(R, 14, 17, 'IiccCCCCCCCCcciI'); put(R, 14, 18, 'IiicccccccccciiI'); put(R, 14, 19, 'IiiiiiiiiiiiiiiI'); put(R, 15, 20, 'IIIIIIIIIIIIIII'); put(R, 16, 21, 'ccccccccccccc');
    // legs and boots
    // a stride: one leg planted back, the other swung forward with its boot lifted (step 1 and -1 are the two halves)
    const legs = step === 0 ? [[16, 0, 0], [24, 0, 0]] : step > 0 ? [[14, 0, -1], [26, 2, 1]] : [[18, 2, 1], [22, 0, -1]];
    for (const [lx, lift, lean] of legs) { put(R, lx - lean, 22, 'IIIII'); for (let y = 23; y <= 25; y++) put(R, lx - (y < 24 ? lean : 0), y, 'IiiiI'); put(R, lx, 26 - lift, 'IIIII'); put(R, lx - 1, 27 - lift, 'IIIIII'); put(R, lx - 1, 28 - lift, 'IiiiiI'); put(R, lx - 1, 29 - lift, 'IIIIII'); put(R, lx - 2, 30 - lift, 'KKKKKKK'); put(R, lx - 2, 31 - lift, 'KKKKKKK'); }
    return R; };
  const hammerDown = R => { put(R, 30, 9, 'iii'); put(R, 31, 10, 'Iii'); put(R, 32, 11, 'Iii'); put(R, 33, 12, 'Iii'); put(R, 34, 13, 'Iii'); put(R, 35, 14, 'Iii'); put(R, 36, 15, 'Iii'); put(R, 37, 16, 'Iii'); put(R, 38, 17, 'Iii'); put(R, 38, 18, 'ccc'); for (let y = 19; y <= 26; y++) put(R, 39, y, 'c'); put(R, 35, 27, 'KKKKKKKKK'); put(R, 35, 28, 'KKKKKKKKK'); put(R, 35, 29, 'KKKKKKKKK'); put(R, 35, 30, 'KKKKKKKKK'); put(R, 35, 31, 'KKKKKKKKK'); return R; };
  const hammerUp = R => { put(R, 30, 9, 'iii'); put(R, 32, 8, 'Iii'); put(R, 34, 7, 'Iii'); put(R, 36, 6, 'Iii'); put(R, 38, 5, 'Iii'); put(R, 39, 4, 'cc'); for (let y = 0; y <= 3; y++) put(R, 40, y, 'c'); put(R, 36, 0, 'KKKKKKKKK'); put(R, 36, 1, 'KKKKKKKKK'); put(R, 36, 2, 'KKKKKKKKK'); return R; };
  const hammerSlam = R => { put(R, 30, 9, 'iii'); for (let x = 33; x <= 44; x += 3) put(R, x, 10 + (x - 30) / 3 * 0, 'iii'); put(R, 33, 10, 'Iii'); put(R, 36, 10, 'Iii'); put(R, 39, 10, 'Iii'); put(R, 42, 11, 'ccc'); for (let y = 12; y <= 25; y++) put(R, 44, y, 'c'); put(R, 39, 26, 'KKKKKKKKK'); put(R, 39, 27, 'KKKKKKKKK'); put(R, 39, 28, 'KKKKKKKKK'); put(R, 39, 29, 'KKKKKKKKK'); put(R, 39, 30, 'KKKKKKKKK'); put(R, 39, 31, 'KKKKKKKKK'); return R; };
  const armOut = R => { put(R, 30, 12, 'iii'); put(R, 33, 12, 'iiiiiiiiiiiiii'); put(R, 33, 13, 'IIIIIIIIIIIIII'); put(R, 46, 11, 'y'); put(R, 46, 12, 'yy'); put(R, 46, 13, 'yy'); put(R, 46, 14, 'y'); return R; };
  const idle = f(hammerDown(body()));
  const raise = f(hammerUp(body()));
  const slam = f(hammerSlam(body()));
  const drag = f(armOut(body()));
  const hurl = f(hammerUp(body('ey', 'GGG')));
  const stun = f((() => { const R = body('xx', 'ggg'); put(R, 30, 12, 'iii'); put(R, 30, 13, 'iii'); put(R, 31, 14, 'Ii'); put(R, 31, 15, 'Ii'); put(R, 31, 16, 'Ii'); put(R, 31, 17, 'cc'); put(R, 30, 18, 'KKKK'); return R; })());
  const breath = f((() => { const R = body('rr', 'rrr'); put(R, 18, 6, 'grrrrrrrrrg'); put(R, 18, 7, 'grrrRRRrrrg'); put(R, 30, 5, 'rrRRRRrr'); put(R, 33, 6, 'rrRRrr'); put(R, 30, 7, 'rrrrr'); return hammerDown(R); })());
  const walkA = f(hammerDown(body('ey', 'GGG', 1))), walkB = f(hammerDown(body('ey', 'GGG', -1)));
  /* THE THREE NEW BLOWS, each a shape none of the others make: the hammer drawn back HOT (the flurry you stand your
     guard through) and then swung FLAT at your chest; the chain COILED at his knee, then out along the floor or over
     his head (jump the one, stay down for the other); the crucible UP over his helmet and then THROWN (it lands far,
     so the answer is to be close). */
  const hot = R => { put(R, 37, 1, 'rRRRRRRr'); put(R, 8, 3, 'ss'); put(R, 7, 2, 's'); put(R, 9, 1, 's'); return R; };
  const hammerFlat = R => { put(R, 30, 11, 'iii'); put(R, 33, 11, 'iiiiiiii'); put(R, 33, 12, 'IIIIIIII'); put(R, 41, 11, 'cc'); put(R, 41, 12, 'cc'); for (let y = 6; y <= 17; y++) put(R, 43, y, 'KKKK'); put(R, 44, 7, 'I'); return R; };
  const coil = R => { put(R, 30, 12, 'iii'); for (let y = 13; y <= 19; y++) put(R, 31, y, 'Iii'); put(R, 31, 20, 'cc'); put(R, 33, 20, 'yyyyyy'); for (let y = 21; y <= 23; y++) put(R, 33, y, 'y....y'); put(R, 33, 24, 'yyyyyy'); put(R, 38, 25, 'KK'); return R; };
  const chainLow = R => { put(R, 30, 12, 'iii'); put(R, 31, 13, 'Iii'); put(R, 32, 14, 'Iii'); put(R, 33, 15, 'Iii'); put(R, 34, 16, 'Iii'); put(R, 35, 17, 'cc'); put(R, 36, 19, 'y'); put(R, 37, 21, 'y'); put(R, 38, 23, 'y'); put(R, 39, 25, 'y'); put(R, 40, 27, 'y.y.y.y'); put(R, 46, 26, 'K'); put(R, 46, 28, 'K'); return R; };
  const chainHigh = R => { put(R, 30, 9, 'iii'); put(R, 32, 8, 'Iii'); put(R, 34, 7, 'Iii'); put(R, 36, 6, 'cc'); put(R, 38, 5, 'y'); put(R, 39, 4, 'y.y.y.y'); put(R, 45, 3, 'KK'); put(R, 45, 5, 'K'); return R; };
  const crucibleUp = R => { put(R, 30, 9, 'iii'); put(R, 31, 8, 'Iii'); put(R, 32, 7, 'Iii'); put(R, 32, 6, 'Iii'); put(R, 33, 5, 'cc'); put(R, 30, 0, '.rRRRRRr.'); put(R, 30, 1, 'KKKKKKKKK'); put(R, 30, 2, 'KIIIIIIIK'); put(R, 31, 3, 'KKKKKKK'); put(R, 33, 4, 'ccc'); return R; };
  const crucibleOut = R => { put(R, 30, 9, 'iii'); put(R, 32, 8, 'Iii'); put(R, 34, 7, 'Iii'); put(R, 36, 6, 'Iii'); put(R, 38, 5, 'cc'); put(R, 38, 1, 'KKKKKr'); put(R, 38, 2, 'KIIIKrR'); put(R, 38, 3, 'KKKKK'); put(R, 44, 0, 'rR'); put(R, 45, 3, 'r'); put(R, 46, 5, 'R'); return R; };
  const tongsWind = f(hot(hammerUp(body()))), tongsFlat = f(hammerFlat(body('ey', 'GGG', 1)));
  const whirlTell = f(coil(body('yy', 'GGG'))), whirlLow = f(chainLow(body('ey', 'ggg', 1))), whirlHigh = f(chainHigh(body('ey', 'ggg', -1)));
  const ladleTell = f(crucibleUp(body('rr', 'GGG'))), ladle = f(crucibleOut(body('ey', 'GGG', 1)));
  /* (claude/forgemasterart) THE RAILS KIT, each blow its own windup and release (B16): the CHAIN-GRAB (his arm up to the loop line, a fist on a hanging hook), the HAUL (his boots set, the chain taut down to the cart),
     the HURL's wind-up (the arm wrenched back over his head, the chain whipping) and its THROW (the arm snapped out, the chain slack), and the BRACE (a plate of iron up in front of his furnace belly). Stun stays LAST. */
  const grab = R => { put(R, 30, 9, 'iii'); put(R, 31, 7, 'Iii'); put(R, 32, 5, 'Iii'); put(R, 33, 3, 'Iii'); put(R, 33, 1, 'ccc'); put(R, 33, 2, 'ccc'); put(R, 34, 0, 'y'); put(R, 36, 0, 'y'); put(R, 36, 1, 'y'); return R; };
  const haul = R => { put(R, 30, 11, 'iii'); put(R, 32, 12, 'Iii'); put(R, 34, 13, 'IIi'); put(R, 36, 14, 'cc'); put(R, 38, 15, 'y'); put(R, 40, 17, 'y'); put(R, 42, 19, 'y'); put(R, 44, 21, 'y'); put(R, 45, 23, 'y'); put(R, 45, 25, 'KK'); return R; };
  const wind = R => { put(R, 30, 9, 'iii'); put(R, 31, 8, 'Iii'); put(R, 32, 7, 'Iii'); put(R, 33, 6, 'cc'); put(R, 35, 5, 'y'); put(R, 37, 4, 'y'); put(R, 39, 4, 'y'); put(R, 41, 5, 'y'); put(R, 42, 7, 'y'); put(R, 42, 9, 'y'); put(R, 41, 11, 'y'); put(R, 40, 12, 'KK'); return R; };
  const throwArm = R => { put(R, 30, 11, 'iii'); put(R, 33, 11, 'iiiiiiiiii'); put(R, 33, 12, 'IIIIIIIIII'); put(R, 43, 10, 'cc'); put(R, 43, 11, 'cc'); put(R, 44, 13, 'y'); put(R, 45, 15, 'y'); put(R, 45, 17, 'y'); put(R, 44, 19, 'y'); put(R, 42, 21, 'KK'); put(R, 44, 7, 's'); put(R, 46, 8, 's'); put(R, 45, 6, 's'); return R; };
  const shield = R => { put(R, 28, 12, 'iii'); put(R, 30, 6, 'iiiiiii'); for (let y = 7; y <= 20; y++) put(R, 30, y, y % 4 === 2 ? 'IiyiiyI' : 'IiiiiiI'); put(R, 30, 21, 'IIIIIII'); put(R, 31, 22, 'KKKKK'); return R; };
  const chainGrab = f(grab(body('ey', 'GGG'))), haulF = f(haul(body('ey', 'GGG', 1))), hurlWind = f(wind(body('rr', 'GGG'))), hurlThrow = f(throwArm(body('ey', 'ggg', 1))), brace = f(shield(body('ey', 'GGG')));
  return pack([idle, raise, slam, drag, hurl, tongsWind, breath, walkA, walkB, tongsFlat, whirlTell, whirlLow, whirlHigh, ladleTell, ladle, chainGrab, haulF, hurlWind, hurlThrow, brace, stun], 25, 33, 40, 32);
}
// The Forgemaster — a goblin engineer strapped into a steam rig: piston arm, boiler pack, goggles. 32×26. Frames: idle, lunge, spray, kick, scalded.
export function bakeForgemaster() {
  const FP2 = Object.assign({}, KG, { i: '#8a919c', I: '#5a6270', c: '#6a4a3a', C: '#3a2a24', y: '#ffd36b', s: '#e8e0d0' });
  const f = rows => outline(fromGrid(rows, FP2, 1), OUT);
  const headR = ['..........gggggg................', '.........ggyyggyg...............', '.........gggggggg...............', '..........ggGGgg................'];
  const pack1 = ['....cccc........................', '...cCccCc.......................', '...ccccccc......................', '...cCccCc.......................', '....cccc........................'];
  const idle = f([...headR, '.....IIIIiiiiiiiI...............', '.cccciiiiiiiiiiiiI..............', 'cCccCiiiiiiiiiiiiiIII...........', 'ccccciiiiiiiiiiiiiiiII..........', 'cCccCiiiiiiiiiiiiI..I...........', '.cccciiiiiiiiiiiiI..............', '.....IIIIiiiiiiII...............', '......II......II................', '......II......II................', '.....III.....III................']);
  const lunge = f([...headR, '.....IIIIiiiiiiiI...............', '.cccciiiiiiiiiiiiIIIIIIIIIIII...', 'cCccCiiiiiiiiiiiiiiiiiiiiiiiiIII', 'ccccciiiiiiiiiiiiIIIIIIIIIIIIIII', 'cCccCiiiiiiiiiiiiI..............', '.cccciiiiiiiiiiiiI..............', '.....IIIIiiiiiiII...............', '......II......II................', '......II......II................', '.....III.....III................']);
  const spray = f([...headR, '.....IIIIiiiiiiiI....ssss.......', '.cccciiiiiiiiiiiiI..sssssss.....', 'cCccCiiiiiiiiiiiiiIIIsssssssss..', 'ccccciiiiiiiiiiiiiiiIIsssssss...', 'cCccCiiiiiiiiiiiiI....ssss......', '.cccciiiiiiiiiiiiI..............', '.....IIIIiiiiiiII...............', '......II......II................', '......II......II................', '.....III.....III................']);
  const kick = f([...headR, '.....IIIIiiiiiiiI...............', '.cccciiiiiiiiiiiiI..............', 'cCccCiiiiiiiiiiiiiIII...........', 'ccccciiiiiiiiiiiiiiiII..........', 'cCccCiiiiiiiiiiiiI..I...........', '.cccciiiiiiiiiiiiI..............', '.....IIIIiiiiiiII...............', '......II........IIIIII..........', '......II..............II........', '.....III........................']);
  const scald = f(['..........gggggg......s.........', '.........ggoogggg....sss........', '.........gggRRggg...s.s.........', '..........ggGGgg................', '.....IIIIiiiiiiiI...............', '.cccciiiiiiiiiiiiI..............', 'cCccCiiiiiiiiiiiiiI.............', 'cccccisiiiisiiiiiii.............', 'cCccCiiiiiiiiiiiiI..............', '.cccciiiiiiiiiiiiI..............', '.....IIIIiiiiiiII...............', '......II......II................', '.....II........II...............', '....III.........III.............']);
  return pack([idle, lunge, spray, kick, scald], 14, 15, 26, 22);
}

// The shaman of the moor: a goblin in a purple robe under an antler headdress, bone beads, a crooked staff with a lit knot. 16x18. idle / cast / blink
// THE SNUFFER - a hooded goblin with a long snuffing cone on a pole. It does not want you; it wants the lamps out.
// 12x14, faces right. Frames: 0 walk1, 1 walk2, 2 reach (the cone up, about to snuff), 3 swipe (the pole across).
export function bakeSnuffer() {
  const NP = Object.assign({}, EP, { h: '#3a3448', H: '#1e1a2a', u: '#8a5a32', U: '#5c3a1d', z: '#5f5a52', Z: '#3a3444' });
  const f = rows => outline(fromGrid(rows, NP, 1), OUT);
  const hood = ['...hhhhhh...', '..hHhhhhHh..', '..hHgeogeh..', '..hhgggggh..', '...hhhhhh...'];
  const torso = ['..hhhhhhhh..', '.hHhhhhhhHh.', '.hhhhhhhhhh.', '..hhhhhhhh..'];
  const legA = ['..GG....GG..', '..GG....GG..', '.GGG....GGG.'];
  const legB = ['...GG..GG...', '..GG....GG..', '.GG......GG.'];
  // the pole and the cone: carried low while it walks, up when it reaches, level when it swings
  const poleLow = ['..........u.', '..........u.', '.........zZ.', '.........zz.'];
  const poleUp = ['.........zz.', '.........zZ.', '..........u.', '..........u.'];
  const put = (base, over) => base.map((r, i) => over[i] ? merge(over[i], r) : r);
  const walk1 = f([...hood, ...put(torso, poleLow), ...legA]);
  const walk2 = f([...hood, ...put(torso, poleLow), ...legB]);
  const reach = f(['.........zz.', '.........zZ.', ...hood.map((r, i) => i < 2 ? merge('..........u.', r) : r), ...torso, ...legA]);
  const swipe = f([...hood, ...torso.map((r, i) => i === 1 ? merge('.....uuuuzZ.', r) : i === 2 ? merge('.........zz.', r) : r), ...legB]);
  return pack([walk1, walk2, reach, swipe], 6, 15, 10, 14);
}

// THE SAILER - a moor goblin behind a plank of sail. Planted, it is nothing; in a gust it is a battering ram.
// 14x14, faces right. Frames: 0 planted (sail down, braced), 1 sailing (sail up, feet off), 2 tumbled (over on its back).
export function bakeSailer() {
  const LP = Object.assign({}, EP, { c: '#c9b27c', C: '#8a7a58', u: '#8a5a32', U: '#5c3a1d', q: '#c9463d' });
  const f = rows => outline(fromGrid(rows, LP, 1), OUT);
  const planted = f([
    '..............', '..............', '..............',
    '...gggg....u..', '..ggeoge...u..', '..gggggg..cc..', '...gGGGg..cq..',
    '..GGGGGGG.cc..', '.GGgggggG.cc..', '.GGgggggG.cc..', '..GgggggG.cc..',
    '..GG...GG.cc..', '..GG...GG.Cc..', '.GGG...GGGCC..']);
  const sailing = f([
    '.......ccccccc', '.......cqqqqqc', '.......ccccccc',
    '...gggg...u...', '..ggeoge..u...', '..gggggg..u...', '...gGGGg..u...',
    '.GGGGGGGG.u...', 'GGgggggGG.u...', 'GGgggggGG.u...', '.GgggggGG.u...',
    '..GG..GG......', '.GG....GG.....', '..............']);
  const tumbled = f([
    '..............', '..............', '..............', '..............',
    '..............', '..cccccccccc..', '..cqqqqqqqqc..',
    '..cccccccccc..', '.GGGGGGG..u...', 'GGgggeoGG.u...', 'GGgggggGG.u...',
    '.GG..GG.......', 'GG....GG......', '..............']);
  return pack([planted, sailing, tumbled], 7, 15, 12, 14);
}

// ---------- STORMHOLD ----------
// THE HEARTH GOBLIN - it lives here. It sleeps by the fire until you are close and then it fights
// with whatever is to hand: a stool. 12x13. Frames: 0 asleep, 1 waking, 2 raise, 3 swing, 4/5 walk.
export function bakeHearthGob() {
  /* THE HEARTH GOBLIN was asleep by the fire when you came in and he is still dressed for it: a NIGHTCAP, long
     and red and flopping over backwards with a bobble on the end. The one goblin whose head is not a head. */
  const HP = Object.assign({}, EP, { q: '#8a5a32', Q: '#5c3a1d', c: '#c9463d', u: '#6a4a2a' });
  const f = rows => outline(fromGrid(rows, HP, 1), OUT);
  const P = '............';
  const cap = ['k...........', '.rrrr.......', '..rrrrrr....'];
  const over = (a, b) => a.split('').map((ch, k) => (b[k] && b[k] !== '.') ? b[k] : ch).join('');
  const withCap = (rows, headRow) => { const out = [P, P, P, ...rows]; if (headRow >= 0) for (let k = 0; k < 3; k++) out[headRow + k] = over(out[headRow + k], cap[k]); return out; };
  const head = ['..gggggg....', '.ggeoggeog..', '.gggggggg...', '..gGGGGg....'];
  const shut = ['..gggggg....', '.ggQQggQQg..', '.gggggggg...', '..gGGGGg....'];
  const body = ['..cccccc....', '.cggggggc...', '.cggggggc...', '..cccccc....', '..GG..GG....', '.GGG..GGG...'];
  const stool = ['....uuuu....', '....u..u....'];
  const asleep = f(withCap(['.......zzz..', P, P, ...shut, '..cccccc....', '.cggggggc...', '.cggggggc...', '..cccccc....', '..GGGGGG....', '.GG....GG...'], 3));
  const waking = f(withCap([P, ...head, ...body, P], 1));
  const raise = f(withCap([...stool, ...head, ...body], -1));
  const swing = f(withCap([P, ...head, '..cccccc.uu.', '.cggggggcuu.', '.cggggggc...', '..cccccc....', '..GG..GG....', '.GGG..GGG...', P], 1));
  const walkA = f(withCap([P, ...head, ...body.slice(0, 4), '..GG...GG...', '.GG.....GG..'], 1));
  const walkB = f(withCap([P, ...head, ...body.slice(0, 4), '...GGGG.....', '..GG..GG....'], 1));
  /* hurt: eyes screwed shut, rocked back off the blow, the nightcap flung forward over his face */
  const back = r => r.slice(1) + '.';
  const hurt = f([P, P, '..........rk', P, ...shut.map(back), ...body.slice(0, 4).map(back), '..GG..GG....', '.GGG..GGG...', P].map((r, i) => (i === 3 ? '......rrrr..' : r)));
  return pack([asleep, waking, raise, swing, walkA, walkB, hurt], 6, 17, 10, 13);
}

// THE ROPE CUTTER - he is not interested in you. He is interested in the rope. 12x13.
// Frames: 0 walk, 1 raise (axe up), 2 chop (axe into the rope), 3 backing off.
// ============================================================================================
// UNDERLEAF'S TWO. The village is asleep, so the level is read by EAR - and these two are that
// rule made into creatures. One of them is the quietest thing in the game and one of them is
// the loudest, and neither of them fights you the way a goblin normally does.
// ============================================================================================

// THE GOBLIN ASSASSIN - 14x16. The only goblin in Underleaf who is awake, and the only one who
// is not carrying a light. He works from above: a hood, a wrap over the face, two short knives
// held point-down. Frames: 0 perch (crouched, knives in), 1/2 stalk, 3 the drop (knives out,
// falling), 4 stab, 5 gone (a smear of nothing).
export function bakeAssassin() {
  const AP = Object.assign({}, EP, { h: '#26222e', H: '#16131c', v: '#3a3448', a: '#9aa3b0', A: '#5a6270', e: '#d8e070' });
  const f = rows => outline(fromGrid(rows, AP, 1), OUT);
  const P = '..............';
  // the hood is the silhouette: a peak, a deep face, nothing of the goblin in it but two lights
  const hood = ['....hhhh......', '...hhhhhh.....', '..hhHHHHhh....', '..hHeHHeHh....', '..hhHHHHhh....', '...hvvvvh.....'];
  const perch = f([P, P, ...hood, '..hhvvvvhh....', '.hhvvvvvvhh...', '..hvvvvvvh....', '..hh....hh....', '.hh......hh...', P, P, P]);
  const stalk1 = f([P, ...hood, '..hhvvvvhh..a.', '.hhvvvvvvhhA..', '..hvvvvvvh....', '..hh...hh.....', '.hh.....hh....', '.h.......hh...', P, P, P]);
  const stalk2 = f([P, ...hood, '.a.hhvvvvhh...', '..Ahhvvvvvvh..', '..hvvvvvvh....', '...hh.hh......', '..hh...hh.....', '.hh.....h.....', P, P, P]);
  const drop = f(['a.........a...', 'A.hhhhhh..A...', 'a.hhHHHHh.a...', '..hHeHHeHh....', '..hhHHHHhh....', '...hvvvvh.....', '..hhvvvvhh....', '.hhvvvvvvhh...', '..hvvvvvvh....', '...hh..hh.....', '...hh..hh.....', '...h....h.....', P, P, P, P]);
  const stab = f([P, P, ...hood, '..hhvvvvhhaaaa', '.hhvvvvvvhAAA.', '..hvvvvvvh....', '..hh...hh.....', '.hh.....hh....', P, P, P]);
  const gone = f([P, P, P, '....vv........', '...vvvv.......', '....vv........', '.....v........', P, P, P, P, P, P, P, P, P]);
  return pack([perch, stalk1, stalk2, drop, stab, gone], 7, 17, 9, 15);
}

// THE GOBLIN BERSERKER - 20x22. No armour, no shield, no guard and no intention of stopping.
// He sleeps chained or shut in, and when he is woken he is the loudest thing in the valley.
// Frames: 0 asleep (slumped), 1 waking, 2/3 run, 4 windup (both arms back), 5 swing, 6 stumble.
export function bakeBerserker() {
  // He is a BRUTE gone wrong, so he is drawn out of the brute's own letters: the same green, the same tusks,
  // the same dark limbs. What makes him a berserker is what is missing - no tunic, no shield, nothing on him
  // at all except a band of red paint across the eyes - and the cleaver, which is the biggest single thing
  // any goblin in the game carries.
  const BP = Object.assign({}, EP, { c: '#c9463d', C: '#8f2f28', i: '#c9d1dc', I: '#7c8797', u: '#8a5a32', U: '#5c3a1d', v: '#7ab558' });
  const W = 22, H = 22;
  const ctr = str => { const l = Math.floor((W - str.length) / 2); return '.'.repeat(l) + str + '.'.repeat(W - str.length - l); };
  const pad = n => Array.from({ length: n }, () => '.'.repeat(W));
  const put = (rows, y, x, str) => { if (y < 0 || y >= rows.length) return; rows[y] = rows[y].slice(0, x) + str + rows[y].slice(x + str.length); };
  const f = rows => outline(fromGrid(rows, BP, 1), OUT);
  // THE HEAD: jammed down between the shoulders, all jaw, with the paint across both eyes
  const head = (shut) => [
    ctr('gggggg'), ctr('gggggggg'),
    ctr('cc' + (shut ? 'GGGGGG' : 'eoggeo') + 'cc'),      /* the band, and the eyes inside it */
    ctr('gggggggggg'), ctr('tgGGGGGGgt'), ctr('gggggg')];
  const shoulders = [ctr('GGGgggggggggGGG'), ctr('GGGGGgggggggGGGGG'), ctr('GGvGGGGGGGGGGvGG')];
  const chest = [ctr('GggggggggggG'), ctr('GgggccccccgggG'), ctr('GggggccccgggG'), ctr('GGggggggggGG')];
  const legs = k => k === 1 ? [ctr('GGG....GGG'), ctr('GGG......GGG'), ctr('GGGG....GGGG')]
    : k === 2 ? [ctr('....GGGGGG....'), ctr('...GGG..GGG...'), ctr('..GGGG..GGGG..')]
      : [ctr('GGGG..GGGG'), ctr('GGGG..GGGG'), ctr('GGGGG..GGGGG')];
  const body = (shut, k) => [...pad(4), ...head(shut), ...shoulders, ...chest, ...legs(k), ...pad(2)];
  // THE CLEAVER: a slab of iron on a short haft, and it is nearly as long as he is tall
  // the cleaver is a SLAB, and it has to read at 1x from across a dark street - so it is five wide and it
  // is the only pale thing on him. Overhead in the windup it is the whole top of the sprite: that is the
  // one mark he gives you and it should be impossible to mistake for anything else he does.
  const cleaverLow = rows => { for (let y = 13; y <= 15; y++) put(rows, y, 17, 'uu');
    put(rows, 16, 16, 'iiiii'); put(rows, 17, 16, 'iIIIi'); put(rows, 18, 16, 'iIIIi'); put(rows, 19, 16, 'iiiii'); return rows; };
  const cleaverUp = rows => { for (let y = 7; y <= 11; y++) put(rows, y, 15 - (y - 7), 'uu');
    put(rows, 1, 6, 'iiiiiiii'); put(rows, 2, 6, 'iIIIIIIi'); put(rows, 3, 6, 'iIIIIIIi'); put(rows, 4, 7, 'iiiiii'); put(rows, 5, 9, 'ii'); put(rows, 6, 10, 'uu'); return rows; };
  const cleaverOut = rows => { for (let y = 12; y <= 13; y++) put(rows, y, 14, 'uu');
    put(rows, 11, 16, 'iiiiii'); put(rows, 12, 16, 'iIIIIi'); put(rows, 13, 16, 'iIIIIi'); put(rows, 14, 17, 'iiiii'); return rows; };

  const asleep = (() => { const r = [...pad(9), ...head(true).slice(0, 5).map(s2 => s2), ...shoulders, ...chest, ...pad(2)];
    while (r.length < H) r.push('.'.repeat(W));
    put(r, 20, 4, 'GGGG...GGGG'); put(r, 13, 2, 'uuiiii');   /* slumped, with the cleaver across his knees */
    return f(r.slice(0, H)); })();
  const waking = f(cleaverLow(body(false, 0)));
  const run1 = f(cleaverLow(body(false, 1)));
  const run2 = f(cleaverLow(body(false, 2)));
  const wind = f(cleaverUp(body(false, 0)));
  const swing = f(cleaverOut(body(false, 2)));
  const stumble = (() => { const r = [...pad(8), ...head(true), ...shoulders, ...chest, ...pad(1)];
    while (r.length < H) r.push('.'.repeat(W));
    put(r, 21, 5, 'GG......GG'); put(r, 14, 1, 'iiiiuu');
    return f(r.slice(0, H)); })();
  return pack([asleep, waking, run1, run2, wind, swing, stumble], 11, 21, 14, 17);
}

// THE GRANDMOTHER OF UNDERLEAF - 24x26. The oldest goblin alive, in a shawl, on a stick, with two
// white eyes that have not seen anything for forty years. She is not big. She does not need to be.
// Frames: 0 sitting, 1 rising, 2/3 walking (feeling ahead with the stick), 4 listening (hand cupped,
// perfectly still), 5 the sweep, 6 the stick thrown, 7 rapping the floor (her own giveaway).
export function bakeGrandmother() {
  /* THE GRANDMOTHER, at the size of what she is: the oldest thing in Underleaf, bent double under a shawl that pools on
     the boards round her, the candles of every name in the village burning on her hood, a long goblin ear out of the
     side of it, two blind white eyes, and a crooked staff with a skull lantern on it. She was a goblin's height with a
     purple blanket over her, and she read as one more villager. 40 x 46. */
  const GP = Object.assign({}, EP, { v: '#5e4a78', V: '#3a2c50', w: '#7a64a0', y: '#c9a040', m: '#7aa85a', M: '#47693a', n: '#2a3a26',
    e: '#f6f6ee', u: '#8a5a32', U: '#5c3a1d', k: '#e8e0d0', K: '#9a9080', c: '#f0e8d0', f: '#ffb347', F: '#fff1a0', g: '#ff9a5c' });
  const W = 40, H = 46;
  const f = rows => outline(fromGrid(rows, GP, 1), OUT);
  const frame = draw => { const R = Array.from({ length: H }, () => Array(W).fill('.')); const put = (x, y, ch) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) R[y][x] = ch; };
    const ell = (cx, cy, rx, ry, ch) => { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) put(x, y, ch); };
    const line = (x0, y0, x1, y1, ch, w2 = 1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let k = 0; k <= n; k++) for (let t = 0; t < w2; t++) put(x0 + (x1 - x0) * k / n + t, y0 + (y1 - y0) * k / n, ch); };
    draw({ put, ell, line }); return f(R.map(r => r.join(''))); };
  // the pieces, each placed by an offset so every pose is the same woman
  const shawl = (P, dx, dy, spread = 0) => { for (let y = 20; y <= 45; y++) { const k = (y - 20) / 25, half = 7 + k * (8 + spread), cx = 19 + dx + k * 2;
      for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) P.put(x, y + dy, (x + y) % 7 === 0 ? 'V' : 'v'); }
    for (let x = 4 + dx; x <= 36 + dx; x++) if ((x & 1) === 0) P.put(x, 45 + dy, 'y');                          // the fringe
    P.line(10 + dx, 26 + dy, 14 + dx, 44 + dy, 'V'); P.line(24 + dx, 27 + dy, 28 + dx, 44 + dy, 'V');           // folds
    P.line(9 + dx, 22 + dy, 30 + dx, 22 + dy, 'w'); };
  const hood = (P, dx, dy) => { P.ell(20 + dx, 15 + dy, 10, 9, 'v'); P.ell(19 + dx, 12 + dy, 7, 5, 'w');
    P.ell(24 + dx, 17 + dy, 6, 5, 'n');                                                                         // the dark of the hood
    P.ell(25 + dx, 18 + dy, 4, 4, 'm'); P.put(23 + dx, 17 + dy, 'e'); P.put(27 + dx, 17 + dy, 'e'); P.put(23 + dx, 16 + dy, 'e'); P.put(27 + dx, 16 + dy, 'e');   // blind eyes
    P.line(28 + dx, 19 + dy, 32 + dx, 21 + dy, 'm'); P.put(32 + dx, 22 + dy, 'M');                              // the nose
    P.line(26 + dx, 21 + dy, 28 + dx, 21 + dy, 'M');
    P.line(11 + dx, 14 + dy, 3 + dx, 8 + dy, 'm', 2); P.put(2 + dx, 7 + dy, 'M');                              // the ear, out of the side of the hood
    for (const [cx, cy, h] of [[14, 5, 4], [19, 3, 5], [24, 5, 4]]) { P.line(cx + dx, cy + dy, cx + dx, cy + h + dy, 'c'); P.put(cx + dx, cy - 1 + dy, 'f'); P.put(cx + dx, cy - 2 + dy, 'F'); } };
  const hand = (P, x, y) => { P.ell(x, y, 2, 1.5, 'm'); P.put(x + 1, y + 1, 'M'); };
  const staff = (P, x0, y0, x1, y1, lit = false) => { P.line(x0, y0, x1, y1, 'u', 2); P.line(x0 + 1, y0, x1 + 1, y1, 'U');
    P.ell(x1, y1 - 2, 3, 3, 'k'); P.put(x1 - 1, y1 - 2, 'K'); P.put(x1 + 1, y1 - 2, 'K'); P.put(x1, y1 - 1, lit ? 'F' : 'g'); if (lit) { P.put(x1, y1 - 6, 'F'); P.put(x1 - 1, y1 - 5, 'f'); P.put(x1 + 1, y1 - 5, 'f'); } };
  const pose = (o) => frame(P => { const dx = o.dx || 0, dy = o.dy || 0;
    if (o.staffBack) staff(P, ...o.staffBack);
    shawl(P, dx, dy, o.spread || 0); hood(P, dx + (o.hx || 0), dy + (o.hy || 0));
    if (o.staff) staff(P, ...o.staff, !!o.lit); for (const hp of (o.hands || [])) hand(P, hp[0], hp[1]); });
  const sit = pose({ dy: 0, hy: 4, spread: 4, staff: [33, 44, 34, 20], hands: [[32, 30]] });
  const rise = pose({ hy: 2, staff: [33, 44, 34, 16], hands: [[32, 26]] });
  const walk = k => pose({ dx: k ? 1 : 0, hy: k ? 0 : 1, staff: [k ? 35 : 33, 44, 34, 14], hands: [[33, 24]] });
  const listen = pose({ hx: -1, hy: 1, staffBack: [6, 44, 7, 18], hands: [[6, 26], [4, 12]] });                   // a hand cupped up to the ear
  const sweep = pose({ dx: 2, hy: 3, spread: 2, staff: [18, 38, 39, 42], hands: [[22, 34]] });                   // the stick low across the boards
  const thrown = pose({ hy: 0, hands: [[34, 18]] });                                                          // the stick gone, the arm still out
  const rap = pose({ hy: 3, staff: [32, 45, 33, 26], hands: [[32, 30]] });
  const cast = pose({ hy: -1, staff: [30, 30, 31, 6], lit: true, hands: [[30, 16], [26, 18]] });                  // THE FIRE: the lantern up over her head
  const vanish = frame(P => { for (let y = 34; y <= 45; y++) { const half = 6 + (y - 34) * 1.3; for (let x = Math.round(19 - half); x <= Math.round(19 + half); x++) P.put(x, y, (x + y) % 5 === 0 ? 'V' : 'v'); }
    P.ell(20, 34, 7, 5, 'v'); P.ell(23, 35, 3, 2, 'n'); P.put(22, 35, 'e'); P.put(25, 35, 'e');
    for (const cx of [15, 20, 25]) { P.put(cx, 29, 'c'); P.put(cx, 28, 'f'); } });                             // crumpled into the shawl
  return pack([sit, rise, walk(0), walk(1), listen, sweep, thrown, rap, cast, vanish], 20, 46, 20, 40);
}

/* THE BONE GOBLIN. The same small goblin the wood is full of, dead a long time: the cutter's build with the
   meat off it, so it still reads as a goblin and never as one of the dead men. Sockets instead of eyes, a
   ribbed chest, and the skull it throws already in its hands. 10x13, frames: walk, lift, throw, turned away. */
export function bakeBoneGob() {
  const BP = Object.assign({}, EP, { g: '#d9d6c0', G: '#8c8869', e: '#241f1a', b: '#4a4436', a: '#cdbf9a', A: '#8c8869' });
  const f = rows => outline(fromGrid(rows, BP, 1), OUT);
  const head = ['..gggggg....', '.ggeoggeog..', '.gggggggg...', '..gGGGGg....'];
  const ribs = ['..gggggg....', '.gGgggGgg...', '.ggGggGgg...', '..gGGGGg....'];
  const legsA = ['..GG..GG....', '.GGG..GGG...'], legsB = ['...GGGG.....', '..GG..GG....'];
  const P = '............';
  const walk = f([P, ...head, ...ribs, ...legsA]);
  const lift = f(['....aaa.....', '....aAa.....', '.....g......', ...head, ...ribs, ...legsB]);
  const thr  = f([P, '..gggggg.aaa', '.ggeoggeogaA', '.gggggggg.a.', '..gGGGGg....', ...ribs, ...legsA]);
  const back = f([P, '..gggggg....', '.gggggggg...', '.gggggggg...', '..gGGGGg....', ...ribs, '..GG...GG...', '.GG.....GG..']);
  return pack([walk, lift, thr, back], 6, 14, 10, 13);
}

export function bakeCutter() {
  const CP = Object.assign({}, EP, { a: '#8a919c', A: '#5a6270', u: '#8a5a32', U: '#5c3a1d' });
  const f = rows => outline(fromGrid(rows, CP, 1), OUT);
  const head = ['..gggggg....', '.ggeoggeog..', '.gggggggg...', '..gGGGGg....'];
  const torso = ['..bbbbbb....', '.bbbbbbbb...', '.bbbbbbbb...', '..bbbbbb....'];
  const legsA = ['..GG..GG....', '.GGG..GGG...'], legsB = ['...GGGG.....', '..GG..GG....'];
  const P = '............';
  const walk = f([P, ...head, ...torso, ...legsA]);
  const raise = f(['........aaa.', '........aAa.', '.........u..', ...head, ...torso.map((r, i) => i === 1 ? r.slice(0, 9) + 'u..' : r), ...legsB]);
  const chop = f([P, ...head, '..bbbbbb....', '.bbbbbbbbu..', '.bbbbbbbaaa.', '..bbbbb.aAa.', ...legsA]);
  const back = f([P, ...head, ...torso, '..GG...GG...', '.GG.....GG..']);
  return pack([walk, raise, chop, back], 6, 14, 10, 13);
}

// THE QUEEN'S LANCE - the biggest goblin in the game, in plate, with a lance he cannot steer.
// 40x34. Frames: 0 stand, 1/2 walk, 3 couch (lance levelled), 4 charge, 5 thrust, 6 sweep,
// 7 planted (the lance in a post, and him with it), 8 shield stance, 9 shield swing, 10 stagger.
export function bakeLance() {
  const LP = Object.assign({}, EP, { a: '#9aa3b0', A: '#5a6270', c: '#c9463d', C: '#8f2f28', u: '#8a5a32', U: '#5c3a1d', y: '#e0b040', m: '#3a3e48' });
  const W = 40, H = 34; const blank = () => Array.from({ length: H }, () => '.'.repeat(W));
  const put = (R, x, y, str) => { if (y < 0 || y >= H) return; const row = R[y]; R[y] = row.slice(0, x) + str + row.slice(x + str.length); };
  const f = rows => outline(fromGrid(rows, LP, 1), OUT);
  const body = legs => { const R = blank();
    // a great helm with a red crest, and the shoulders of someone who has never lost
    put(R, 14, 0, '..cc..'); put(R, 13, 1, '.cccc.'); put(R, 12, 2, 'aaaaaaaa');
    put(R, 12, 3, 'aAaaaaAa'); put(R, 12, 4, 'aooaaooa'); put(R, 12, 5, 'aaaaaaaa'); put(R, 13, 6, 'aAAAAa');
    put(R, 8, 7, 'aaaaaaaaaaaaaa'); put(R, 7, 8, 'aAaaaaaaaaaaaAa');
    put(R, 7, 9, 'aAaccccccccaaAa'); put(R, 7, 10, 'aAaccyyccccaaAa'); put(R, 7, 11, 'aAaccccccccaaAa');
    put(R, 8, 12, 'aaaaaaaaaaaaaa'); put(R, 9, 13, 'aaaaaaaaaaaa'); put(R, 9, 14, 'mmmmmmmmmmmm');
    put(R, 9, 15, 'aaaaaaaaaaaa'); put(R, 10, 16, 'aaaaaaaaaa');
    const L1 = legs === 1 ? [[10, 20], [22, 20]] : legs === 2 ? [[8, 22], [24, 18]] : [[11, 21], [21, 21]];
    for (const [lx, sk] of L1) { for (let y = 17; y <= 27; y++) put(R, lx + (y > 22 ? (sk > 20 ? 1 : -1) : 0), y, 'aAaa'); put(R, lx - 1, 28, 'aaaaaa'); put(R, lx - 1, 29, 'AAAAAA'); }
    return R; };
  const lanceAt = (R, y, x0, len) => { put(R, x0, y, 'u'.repeat(Math.min(len, W - x0))); put(R, Math.min(W - 3, x0 + len), y - 1, 'aa'); put(R, Math.min(W - 3, x0 + len), y, 'aAa'); put(R, Math.min(W - 3, x0 + len), y + 1, 'aa'); };
  const stand = (() => { const R = body(0); for (let y = 4; y <= 16; y++) put(R, 24, y, 'u'); put(R, 23, 2, 'aAa'); put(R, 23, 3, 'aa'); return R; })();
  const walk1 = (() => { const R = body(1); for (let y = 4; y <= 16; y++) put(R, 24, y, 'u'); put(R, 23, 2, 'aAa'); return R; })();
  const walk2 = (() => { const R = body(2); for (let y = 4; y <= 16; y++) put(R, 25, y, 'u'); put(R, 24, 2, 'aAa'); return R; })();
  const couch = (() => { const R = body(0); lanceAt(R, 11, 16, 18); return R; })();
  const charge = (() => { const R = body(1); lanceAt(R, 12, 14, 24); return R; })();
  const thrust = (() => { const R = body(2); lanceAt(R, 10, 18, 21); return R; })();
  const sweep = (() => { const R = body(1); for (let i = 0; i < 22; i++) put(R, 16 + i, 16 - Math.floor(i / 3), 'u'); put(R, 37, 10, 'aAa'); return R; })();
  const planted = (() => { const R = body(0); for (let i = 0; i < 16; i++) put(R, 20 + i, 12 + Math.floor(i / 3), 'u'); put(R, 35, 17, 'aAa'); return R; })();
  const guard = (() => { const R = body(0); for (let y = 6; y <= 18; y++) put(R, 25, y, 'aAaa'); put(R, 25, 5, 'aaaa'); put(R, 26, 11, 'yy'); return R; })();
  const guardHit = (() => { const R = body(2); for (let y = 4; y <= 12; y++) put(R, 27, y, 'aAaa'); put(R, 24, 13, 'aaaaa'); return R; })();
  const stagger = (() => { const R = body(0); put(R, 12, 4, 'aXXaaXXa'.replace(/X/g, 'o')); put(R, 13, 1, '.cccc.'); for (let y = 6; y <= 14; y++) put(R, 27, y, 'u'); return R; })();
  return pack([stand, walk1, walk2, couch, charge, thrust, sweep, planted, guard, guardHit, stagger].map(f), 20, 30, 26, 30);
}

// SHARDLING - a knot of crystal that walks. It goes off when it dies, so mind where you are standing.
// 10x11. Frames: 0/1 walk, 2 bristling (about to burst).
export function bakeShardling() {
  const SP2 = Object.assign({}, EP, { c: '#bfe6f5', C: '#7aa8c8', w: '#eefaff', d: '#4a6a90' });
  const f = rows => outline(fromGrid(rows, SP2, 1), OUT);
  const a1 = f(['..c..c....', '.cccccc...', 'ccwccwcc..', 'ccccccccc.', '.cCcccCc..', '..ccccc...', '..dc.cd...', '..d...d...']);
  const a2 = f(['...c.c....', '..cccc....', '.ccwccwcc.', 'ccccccccc.', '.cCcccCc..', '..ccccc...', '..d.c.d...', '...d.d....']);
  const up = f(['.c..c..c..', 'cccccccc..', 'cwccccwc..', 'ccccccccc.', 'cwCcccCwc.', '.ccccccc..', '..dc.cd...', '..d...d...']);
  return pack([a1, a2, up], 5, 12, 9, 11);
}

// THE SUNCATCHER - it has been drinking this mountain's light since before the wood, and it gives it
// back as glass. 34x30. Frames: 0 still, 1/2 turning, 3 drink (open, taking the sun), 4 throw,
// 5 raise (a spire coming up), 6 struck, 7 dimmed.
// THE ROC - the harpies' mother, as big as a cart, nesting on the Sunspire's peak. A thousand years in
// the glare have turned the ends of her feathers to glass: a crystal crest, glass-tipped primaries, and
// she sheds them. 60x44, facing right, anchored at her talons. Frames: 0-2 hover (wings up, level,
// down), 3 screech, 4 dive, 5 gust (wings swept forward), 6 grounded (wings down in the glass),
// 7 stagger (head thrown up), 8 down.
// THE SENTRY - one of the Queen's castle watch: a kettle helm, her purple and gold, and legs that are for
// running to a bell. 10x10. Frames: walk1, walk2, alarm (arms up, shouting), run1, run2.
export function bakeSentry() {
  /* THE SENTRY stands and watches, so he is the one with the SPEAR: a shaft stood upright at his side and a
     head on it over his helmet - the only goblin whose outline goes up past his own head in a straight line. */
  const QP = Object.assign({}, EP, { b: '#5a2a7a', B: '#3a1850', y: '#e0b040' });
  const f = rows => outline(fromGrid(rows, QP, 1), OUT);
  const spear = rows => ['..........s.', '.........sSs', '..........S.', '..........w.'].concat(rows.map((r, i) => {
    const a = ('.' + r + '.').split(''); if (i < rows.length - 2 && a[10] === '.') a[10] = 'w'; return a.join(''); }));
  const helm = ['...SSSS...', '..SssssS..', '.SSSSSSSS.'], head = ['.geoggeog.', '.gggggggg.', '..gGGGGg..'], tab = ['..bbybbb..', '..bBbbBb..'];
  const L1 = ['..GG..GG..', '.GG....GG.'], L2 = ['..GG.GG...', '..GG..GG..'], R1 = ['.GG....GG.', 'GG......GG'], R2 = ['...GGGG...', '..GG..GG..'];
  const alarm = f(spear(['g..SSSS..g', '.gSssssSg.', '.SSSSSSSS.', '.geoggeog.', '.gggoogg..', '..gGGGGg..', ...tab, ...L1]));
  return pack([f(spear([...helm, ...head, ...tab, ...L1])), f(spear([...helm, ...head, ...tab, ...L2])), alarm, f(spear([...helm, ...head, ...tab, ...R1])), f(spear([...helm, ...head, ...tab, ...R2]))], 7, 15, 8, 10);
}
// THE GOBLIN QUEEN - old, huge and clever. An iron crown with red stones, ears like a bat's, a hooked nose
// and a grin with two tusks, an ermine collar over a gown of the Queen's purple, a cape the colour of old
// blood behind it, and an iron sceptre the length of a knight. 96x72, facing right, anchored at her feet.
// SHE IS FAT, NOT TALL. The owner's word: 'a lot fatter, she's tall enough'. So every height in her is where it
// was - the crown, the head, the hem, the feet - and everything across is not: shoulders half as wide again, a
// belly that is the widest thing on her and hangs over the belt, hips the gown has to spread round, arms like
// hams and a neck that has become a second chin. The frame table below is still written in her old 56-wide
// numbers; WIDE() maps each of them out, doubling a distance near her middle (that is body) and only adding the
// extra body to a distance far out (that is reach), so a hand is still a hand's length off the fat.
// Frames: 0 seated, 1 seated pointing, 2 seated throwing, 3 stand, 4 walk1, 5 walk2, 6 slam raised,
// 7 slam down, 8 sweep, 9 charge, 10 dazed, 11 leap, 12 throw slate, 13 struck (the storm in her crown), 14 down, 15 bell-pull windup, 16 bell-pull release.
export function bakeGoblinQueen() {
  const C = { g: '#6faa4a', G: '#3f6e2c', d: '#2c4a1e', p: '#5a2a7a', P: '#3a1850', q: '#7a3a9a', y: '#e0b040', Y: '#a0781c', w: '#f2ece0', k: '#1b1626', r: '#7a1c24', R: '#4a0e14',
    i: '#5a6270', I: '#3a3e48', j: '#8a919c', m: '#c9463d', e: '#ffd36b', t: '#f3f0d2', n: '#9a5aa8', u: '#c9b27c', U: '#6a4a28' };
  const W = 128, H = 78, CX = 64, SX = 1.32; /* SX: every body shape is drawn on the old grid and spread this much across about her middle */ /* spare rows under her boots: the outline of a planted foot (or a slam that sinks her) must not sit on the canvas edge */
  const WIDE = x => { const d = x - 28, a = Math.abs(d); return CX + (a <= 12 ? d * 2.6 : Math.sign(d) * (19 + a)); };
  const mapXs = a => a && a.map((v, i) => i % 2 === 0 && typeof v === 'number' ? WIDE(v) : v);
  const frame = (o) => {
    const { sit = 0, lean = 0, dy = 0, flare = 0, head = 'grin', tilt = 0, stars = 0, rot = 0, rope = null } = o;
    const arm = mapXs(o.arm || [34, 26, 42, 30]), arm2 = mapXs(o.arm2 || null), rod = mapXs(o.rod || null), feet = (o.feet || [[24, 58], [31, 58]]).map(([x, y]) => [WIDE(x), y]);
    /* the shoulder is out at the edge of the fat, not in the middle of her chest */
    arm[0] += 12 * Math.sign(arm[0] - CX); if (arm2) arm2[0] += 12 * Math.sign(arm2[0] - CX);
    const [c, g] = canvas(W, H);
    g.translate(0, 12); /* headroom for the crown's points */
    g.save(); g.translate(CX, 58 + dy); g.rotate(rot); g.translate(-CX, -58);
    const sh = y => (y < 34 ? lean * (34 - y) / 20 : 0);
    const poly = (pts, k) => fillPoly(g, pts.map(([x, y]) => [CX + (x - CX) * SX + sh(y), y]), C[k]);
    const P1 = (x, y, k) => px(g, Math.round(CX + (x - CX) * SX + sh(y)), Math.round(y), C[k]);
    const E = (x, y, rx, ry, k) => ellipse(g, CX + (x - CX) * SX + sh(y), y, rx * SX, ry, C[k]);
    // the cape behind everything, as wide as she is
    poly([[CX - 22, 22], [CX + 22, 22], [CX + 37 + flare, 56 - sit], [CX - 37 - flare, 56 - sit]], 'r'); poly([[CX - 24, 28], [CX - 16, 28], [CX - 35 - flare, 56 - sit], [CX - 39 - flare, 56 - sit]], 'R');
    // the sceptre when it is carried behind her
    const rodDraw = () => { if (!rod) return; const [x0, y0, x1, y1] = rod; line(g, x0, y0, x1, y1, C.I, 3); line(g, x0, y0, x1, y1, C.i, 1);
      circle(g, x1, y1, 4, C.I); circle(g, x1, y1, 3, C.j); px(g, x1, y1, C.n); px(g, x1 + 1, y1 - 1, C.q);
      for (const [a, b] of [[-5, 0], [5, 0], [0, -5], [0, 5]]) px(g, x1 + a, y1 + b, C.I); };
    if (rod && rod[4] === 'back') rodDraw();
    for (const [fx, fy] of feet) rect(g, fx - 3, fy - 1, 6, 2, C.k);
    // THE GOWN: it starts at the hips, and the hips are wide, so it is a tent before it is a bell
    const hem = 55 - sit, hw = 36 + flare * 0.8, hws = hw * SX;
    poly([[CX - 27, 38], [CX + 27, 38], [CX + hw, hem], [CX - hw, hem]], 'p');
    if (!sit) { E(CX - 21, 45, 14, 8, 'p'); E(CX + 21, 45, 14, 8, 'p'); }                     /* the hips under it (seated, her knees are where they were) */
    poly([[CX - 6, 40], [CX + 6, 40], [CX + hw * 0.2, hem], [CX - hw * 0.2, hem]], 'P');
    for (let q = 0; q < 8; q++) { const fx = CX - hws + 6 + q * ((hws * 2 - 12) / 7); line(g, CX + (fx - CX) * 0.7, 45, fx, hem - 1, C.P, 1); } /* the pleats of it */
    for (let x = Math.round(CX - hws); x <= Math.round(CX + hws); x++) { px(g, x, hem, C.y); px(g, x, hem - 1, x % 3 === 0 ? C.Y : C.y); if (x % 4 === 0) px(g, x, hem - 2, C.Y); }
    line(g, CX, 44, CX, hem - 1, C.y, 1);
    if (sit) { poly([[CX - 30, 41], [CX + 34, 41], [CX + 34, 48], [CX - 30, 48]], 'q'); line(g, CX - 30 * SX, 41, CX + 34 * SX, 41, C.y, 1); } /* her knees, over the throne's edge */
    // THE BODY. No waist anywhere: out from the shoulder and still going at the belt.
    poly([[CX - 22, 18], [CX + 22, 18], [CX + 27, 24], [CX + 30, 31], [CX + 28, 38], [CX + 22, 42], [CX - 22, 42], [CX - 28, 38], [CX - 30, 31], [CX - 27, 24]], 'q');
    // the belly: the widest part of her, round, hanging OVER the belt, which is where the weight of a body shows
    E(CX + lean * 0.2, 34, 28, 12.5, 'q');
    E(CX - 7 + lean * 0.2, 28.5, 14, 4.5, 'n'); P1(CX - 12, 27, 'n');                            /* the light on the top of it, from the upper left */
    g.globalAlpha = 0.55; E(CX + 2, 42.5, 19, 1.3, 'P'); E(CX + 26, 34, 2, 7, 'P'); g.globalAlpha = 1; /* ONE fold, under it where it hangs, and its far side turning away: more folds read as a stack of tyres */
    // the bust: full and heavy, sitting on the belly, with the shadow under
    E(CX - 10 + lean * 0.3, 23.5, 10, 6.5, 'n'); E(CX + 10 + lean * 0.3, 23.5, 10, 6.5, 'n');
    E(CX - 10 + lean * 0.3, 27.2, 9, 3, 'q'); E(CX + 10 + lean * 0.3, 27.2, 9, 3, 'q');
    E(CX - 12 + lean * 0.3, 21.5, 4.5, 2, 'q'); E(CX + 8 + lean * 0.3, 21.5, 4.5, 2, 'q');
    for (let x = Math.round(CX - 22 * SX); x <= Math.round(CX + 22 * SX); x++) { px(g, x, 42, C.y); px(g, x, 43, C.Y); }         /* the belt, UNDER her, not round her */
    P1(CX, 42, 'm'); for (const o2 of [-14, -6, 6, 14]) P1(CX + o2, 43, 'Y');
    poly([[CX - 18, 13], [CX + 18, 13], [CX + 26, 16], [CX + 30, 21], [CX + 22, 23], [CX + 10, 22], [CX, 28], [CX - 10, 22], [CX - 22, 23], [CX - 30, 21], [CX - 26, 16]], 'w'); /* the ermine across shoulders like a yoke, and a deep neckline in it */
    for (const [x, y] of [[-19, 17], [-12, 19], [12, 19], [19, 17], [-25, 18], [25, 18], [0, 16], [-6, 16], [6, 16]]) P1(CX + x, y, 'k');
    for (let q = -4; q <= 4; q++) { const nx = CX + q * 2, ny = 21 + Math.abs(q); P1(nx, ny, q === 0 ? 'm' : 'y'); if (q === 0) P1(nx, ny + 1, 'r'); } /* the stones at her throat */
    // the far arm, as thick as a leg
    if (arm2) { const [x0, y0, x1, y1] = arm2, wx = x0 + (x1 - x0) * 0.55, wy = y0 + (y1 - y0) * 0.55; circle(g, x0, y0, 7.5, C.P); line(g, x0, y0, x1, y1, C.P, 14); line(g, wx, wy, x1, y1, C.G, 10); circle(g, x1, y1, 5.5, C.G); }
    // the head: the same big green head - bat ears, a hook of a nose, yellow eyes, two tusks - on a neck that is all chin
    const hx = CX + lean, hy = 12;
    poly([[hx - 7, hy - 2], [hx - 16, hy - 6], [hx - 8, hy + 3]], 'g'); poly([[hx + 7, hy - 2], [hx + 16, hy - 6], [hx + 8, hy + 3]], 'g'); P1(hx - 12, hy - 3, 'G'); P1(hx + 12, hy - 3, 'G');
    poly([[hx - 9, hy - 3], [hx + 9, hy - 3], [hx + 17, hy + 16], [hx - 17, hy + 16]], 'P');   /* the veil, behind her head */
    ellipse(g, hx, hy + 11, 17, 5.5, C.g); ellipse(g, hx, hy + 14, 14, 1.6, C.G); ellipse(g, hx, hy + 16, 12, 2.5, C.g);               /* the neck that has become a second chin, and its fold */
    ellipse(g, hx, hy + 1, 12, 8, C.g); ellipse(g, hx, hy + 5, 14, 5.5, C.g); ellipse(g, hx + 1, hy + 5, 9, 4, C.G);
    px(g, hx - 14, hy + 3, C.y); px(g, hx - 14, hy + 4, C.Y); px(g, hx + 14, hy + 3, C.y); px(g, hx + 14, hy + 4, C.Y);   /* her earrings */
    if (head === 'daze') { for (const [a, b] of [[-6, -1], [-5, 0], [-5, -2], [6, -1], [7, 0], [7, -2]]) px(g, hx + a, hy + b, C.k); }
    else { rect(g, hx - 8, hy - 1, 4, 2, C.e); rect(g, hx + 4, hy - 1, 4, 2, C.e); px(g, hx - 6, hy - 1, C.m); px(g, hx + 6, hy - 1, C.m); line(g, hx - 9, hy - 3, hx - 3, hy - 2, C.d, 1); line(g, hx + 9, hy - 3, hx + 3, hy - 2, C.d, 1); }
    fillPoly(g, [[hx + 1, hy], [hx + 7, hy + 4], [hx + 2, hy + 5]], C.G); /* the nose */
    ellipse(g, hx, hy + 9, 13, 4, C.g); ellipse(g, hx, hy + 10.5, 10, 1.6, C.G); ellipse(g, hx - 10, hy + 6, 4, 4, C.g); ellipse(g, hx + 10, hy + 6, 4, 4, C.g);                /* the jowls, and the throat under them */
    for (const [ex, ey] of [[hx - 10, hy + 9], [hx + 10, hy + 9]]) { px(g, ex, ey, C.y); px(g, ex, ey + 1, C.Y); }   /* and more of her jewels on it */
    if (head === 'shout') { rect(g, hx - 5, hy + 5, 10, 3, C.k); px(g, hx - 4, hy + 5, C.t); px(g, hx + 4, hy + 5, C.t); }
    else { line(g, hx - 6, hy + 6, hx + 6, hy + 6, C.k, 1); for (const [a, b] of [[-5, 5], [5, 5], [-5, 4], [5, 4]]) px(g, hx + a, hy + b, C.t); }
    px(g, hx - 9, hy + 3, C.d); px(g, hx + 8, hy - 4, C.d);
    // the crown: iron, five points, a red stone in each
    g.save(); g.translate(hx, hy - 4); g.rotate(tilt); g.scale(1.3, 1);
    fillPoly(g, [[-8, 0], [8, 0], [9, -3], [-9, -3]], C.I); fillPoly(g, [[-8, -3], [8, -3], [8, -5], [-8, -5]], C.y);
    for (const k of [-8, -4, 0, 4, 8]) { fillPoly(g, [[k - 2, -5], [k + 2, -5], [k, -11 - (k === 0 ? 3 : 0)]], C.i); px(g, k, -7, C.m); }
    g.restore();
    if (stars) for (let i = 0; i < 3; i++) { const a = i * 2.1 + stars; P1(hx + Math.cos(a) * 11, hy - 12 + Math.sin(a) * 3, 'e'); }
    // the near arm and the sceptre in it: a sleeve of the gown to the wrist, and a great deal of arm in the sleeve
    if (!rod || rod[4] !== 'back') rodDraw();
    { const [x0, y0, x1, y1] = arm, wx = x0 + (x1 - x0) * 0.55, wy = y0 + (y1 - y0) * 0.55; circle(g, x0, y0, 8, C.q); line(g, x0, y0, x1, y1, C.q, 17); line(g, wx, wy, x1, y1, C.g, 11); circle(g, wx, wy, 6.5, C.n); circle(g, x1, y1, 6, C.g); } /* the sleeve past the elbow, a puffed cuff, then the green forearm and the fist: all-green from the shoulder read as a leaf */
    if (rope) { /* (claude/highcrown2bell) THE BELL-PULL: a hemp rope run up from the fists toward the bell (rope = its far end, relative to the fist), the tail hanging below them with a knot and a tassel */
      const [rx, ry] = [arm[2], arm[3]];
      line(g, rx, ry - 2, rx + rope[0], ry + rope[1], C.U, 3); line(g, rx, ry - 2, rx + rope[0], ry + rope[1], C.u, 1); line(g, rx + 1, ry + 3, rx + 2, ry + 11, C.U, 3); line(g, rx + 1, ry + 3, rx + 1, ry + 11, C.u, 1);
      circle(g, rx + 2, ry + 12, 2.2, C.U); px(g, rx + 1, ry + 11, C.u); for (const o2 of [-2, 0, 2]) line(g, rx + 2 + o2, ry + 14, rx + 2 + o2, ry + 17, C.u, 1);
      circle(g, rx, ry, 6, C.g); line(g, rx - 4, ry - 1, rx + 4, ry - 1, C.G, 1); line(g, rx - 3, ry + 2, rx + 3, ry + 2, C.G, 1); /* the fist over the rope, knuckled */ }
    g.restore();
    outline(c, OUT);
    return c;
  };
  const F = [
    frame({ sit: 8, feet: [[22, 50], [34, 50]], arm: [34, 25, 40, 36], rod: [40, 44, 44, 12], flare: 2 }),                                    /* 0 seated */
    frame({ sit: 8, feet: [[22, 50], [34, 50]], arm: [34, 24, 50, 18], rod: [18, 46, 16, 14, 'back'], arm2: [22, 25, 18, 34], head: 'shout', flare: 2 }), /* 1 pointing */
    frame({ sit: 8, feet: [[22, 50], [34, 50]], arm: [34, 24, 44, 6], rod: [18, 46, 16, 14, 'back'], head: 'shout', flare: 2 }),              /* 2 throwing */
    frame({ arm: [34, 25, 40, 36], rod: [40, 50, 44, 14] }),                                                                                   /* 3 stand */
    frame({ arm: [34, 25, 41, 35], rod: [42, 48, 47, 14], feet: [[21, 58], [34, 58]], lean: 1 }),                                                /* 4 walk1 */
    frame({ arm: [34, 25, 39, 36], rod: [40, 50, 43, 15], feet: [[26, 58], [30, 58]], dy: -1 }),                                                /* 5 walk2 */
    frame({ arm: [34, 24, 36, 4], arm2: [22, 24, 32, 4], rod: [34, 6, 12, -2], head: 'shout', lean: -2 }),                                     /* 6 slam raised */
    frame({ arm: [34, 26, 48, 44], arm2: [22, 26, 44, 44], rod: [44, 40, 52, 50], head: 'shout', lean: 4, dy: 2, flare: 2 }),                 /* 7 slam down */
    frame({ arm: [34, 26, 50, 38], rod: [30, 40, 55, 50], lean: 3, flare: 3, head: 'shout' }),                                                  /* 8 sweep */
    frame({ arm: [34, 26, 48, 30], rod: [32, 32, 54, 30], lean: 6, flare: 4, head: 'shout', feet: [[18, 58], [36, 58]] }),                     /* 9 charge */
    frame({ arm: [34, 26, 38, 40], rod: [14, 52, 50, 48, 'back'], head: 'daze', tilt: 0.45, stars: 1, lean: -1 }),                             /* 10 dazed */
    frame({ arm: [34, 24, 44, 12], rod: [40, 20, 50, -2], flare: 7, feet: [[24, 54], [31, 54]], dy: -3, head: 'shout' }),                       /* 11 leap */
    frame({ arm: [34, 24, 46, 8], arm2: [22, 25, 18, 34], rod: [18, 50, 14, 16, 'back'], head: 'shout' }),                                     /* 12 throw slate */
    frame({ arm: [34, 24, 46, 10], arm2: [22, 24, 10, 10], rod: [14, 52, 50, 48, 'back'], head: 'daze', tilt: -0.3, flare: 5, stars: 2 }),      /* 13 struck */
    frame({ arm: [34, 26, 46, 45], rod: [10, 50, 52, 48, 'back'], head: 'daze', tilt: 0.9, rot: 0.1, dy: 1, flare: 5 }),                        /* 14 down (the fist kept off the canvas's last row: the tip of her sleeve sat on it) */
    frame({ arm: [34, 24, 40, 4], arm2: [22, 25, 37, 7], rod: [12, 52, 9, 18, 'back'], lean: -3, feet: [[19, 58], [37, 58]], rope: [4, -18] }),   /* 15 BELL-PULL WINDUP (claude/highcrown2bell): both fists up on the rope, hauling back, her sceptre planted behind her */
    frame({ arm: [34, 27, 41, 41], arm2: [22, 27, 37, 39], rod: [12, 52, 9, 18, 'back'], head: 'shout', lean: 4, dy: 2, flare: 2, feet: [[19, 58], [37, 58]], rope: [5, -20] }),   /* 16 BELL-PULL RELEASE: the rope hauled to her belt, her weight thrown on it, the shout */
  ];
  return pack(F, CX, 70, 68, 50);
}
// THE THRONE - black oak and old iron, purple cushions, a skull on each post. 40x46, anchored at its foot.
export function bakeThrone() {
  const [c, g] = canvas(40, 46);
  rect(g, 4, 4, 32, 36, '#3a2214'); rect(g, 6, 6, 28, 32, '#5a3a24'); rect(g, 9, 9, 22, 26, '#5a2a7a'); rect(g, 10, 10, 20, 2, '#7a3a9a');
  for (let y = 12; y < 34; y += 4) rect(g, 18, y, 4, 2, '#e0b040');
  rect(g, 2, 30, 36, 6, '#3a2214'); rect(g, 4, 30, 32, 2, '#7a4a2a'); rect(g, 6, 36, 4, 10, '#3a2214'); rect(g, 30, 36, 4, 10, '#3a2214');
  for (const x of [1, 33]) { rect(g, x, 0, 6, 40, '#2a1a10'); circle(g, x + 3, 2, 3, '#e8dcc0'); px(g, x + 2, 2, '#1b1626'); px(g, x + 4, 2, '#1b1626'); }
  rect(g, 12, 0, 16, 4, '#5a6270'); for (const k of [13, 19, 25]) { fillPoly(g, [[k, 0], [k + 3, 0], [k + 1.5, -4]], '#5a6270'); px(g, k + 1, 1, '#c9463d'); }
  return outline(c, OUT);
}

export function bakeRoc() {
  const C = { h: '#78869b', H: '#47566f', d: '#272b3a', f: '#e8e0d0', F: '#b8b0a0', m: '#c9a83a', M: '#8a6a1a', c: '#d8c8a8', C: '#f2e8d4', q: '#9a8468', e: '#ff4a3a' };
  const W = 60, H = 44;
  const poly = (g, pts, k) => fillPoly(g, pts, C[k]);
  // a wing: shoulder, then the leading edge out to the tip, then back along the trailing edge. The last
  // few points of the trailing edge get pale barred tips, bleached by the sun over the cloud.
  const wing = (g, pts, far) => {
    poly(g, pts, far ? 'H' : 'h');
    const n = pts.length; for (let i = 2; i < n - 1; i++) { const [x, y] = pts[i]; px(g, x, y, C[i % 2 ? 'c' : 'C']); px(g, x + 1, y, C.q); }
    if (!far) { for (let i = 1; i < n - 2; i++) line(g, pts[0][0], pts[0][1], pts[i][0] + (pts[i + 1][0] - pts[i][0]) / 2, pts[i][1] + (pts[i + 1][1] - pts[i][1]) / 2, C.H, 1); }
    // the primaries splay like fingers past the tip: that is what makes it a bird of prey and not a goose
    let ti = 1, best = -1; for (let i = 1; i < n; i++) { const dd = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]); if (dd > best) { best = dd; ti = i; } }
    const [tx, ty] = pts[ti], ux = (tx - pts[0][0]) / best, uy = (ty - pts[0][1]) / best, nb = pts[(ti + 1) % n];
    for (let k = 0; k < 3; k++) { const bx = tx + (nb[0] - tx) * k * 0.28, by = ty + (nb[1] - ty) * k * 0.28, L = 5 - k;
      line(g, bx, by, bx + ux * L, by + uy * L, C[far ? 'H' : 'h'], 2); px(g, Math.round(bx + ux * (L + 1)), Math.round(by + uy * (L + 1)), C.c); }
  };
  const frame = ({ wings = 'mid', head = 'up', legs = 'hang', rot = 0, dy = 0 }) => {
    const [c, g] = canvas(W, H);
    g.save(); g.translate(30, 30 + dy); g.rotate(rot); g.translate(-30, -30);
    // far wing first (behind the body)
    const WINGS = {
      up: [[[27, 20], [23, 3], [30, 0], [36, 4], [34, 12], [31, 20]], [[23, 21], [15, 2], [22, 1], [29, 8], [29, 20]]],
      mid: [[[27, 22], [48, 11], [55, 13], [52, 17], [44, 21], [33, 25]], [[24, 22], [5, 12], [2, 17], [8, 20], [16, 24], [24, 26]]],
      down: [[[27, 23], [37, 38], [31, 42], [26, 38], [24, 28]], [[24, 24], [12, 38], [8, 35], [12, 29], [21, 25]]],
      fold: [[[18, 20], [36, 19], [34, 24], [26, 26], [16, 25]], null],
      forward: [[[30, 22], [50, 4], [57, 8], [54, 16], [46, 22], [36, 27]], [[26, 21], [40, 3], [46, 6], [42, 15], [32, 24]]],
      splay: [[[32, 24], [53, 38], [49, 42], [42, 41], [34, 32]], [[22, 24], [4, 38], [7, 42], [15, 41], [24, 31]]],
      // THE SHRIEK'S TELL: both wings thrown up into a V over her back, the whole span of glass to the sky
      crown: [[[31, 23], [42, 16], [50, 9], [52, 14], [45, 20], [36, 26]], [[25, 21], [18, 11], [12, 8], [10, 12], [15, 18], [23, 24]]],
      // THE SHRIEK: flung out flat and wide, every primary open
      flare: [[[31, 22], [44, 15], [50, 15], [49, 19], [42, 23], [34, 27]], [[24, 22], [14, 15], [9, 16], [9, 20], [15, 24], [23, 26]]],
      // THE DIVE'S WINDUP: mantled - hunched up and back over her shoulders before the stoop
      mantle: [[[31, 22], [25, 13], [16, 9], [19, 14], [25, 19], [31, 25]], [[27, 21], [24, 14], [21, 11], [20, 14], [23, 19], [27, 24]]],
    }[wings];
    if (WINGS[1]) wing(g, WINGS[1], true);
    // tail: three long feathers, glass at the ends
    poly(g, [[19, 25], [5, 21], [4, 25], [6, 29], [19, 29]], 'h'); line(g, 18, 26, 6, 23, C.H, 1); line(g, 18, 28, 6, 28, C.H, 1);
    px(g, 4, 23, C.c); px(g, 4, 26, C.C); px(g, 5, 29, C.c);
    // legs and talons
    const LEG = { hang: [[26, 32, 25, 38], [31, 32, 31, 38]], plant: [[25, 32, 22, 40], [32, 32, 35, 40]], strike: [[27, 31, 36, 36], [31, 31, 40, 34]], tuck: [[26, 32, 27, 35], [31, 32, 33, 35]], none: [] }[legs];
    for (const [x0, y0, x1, y1] of LEG) { line(g, x0, y0, x1, y1, C.M, 2); px(g, x1 - 1, y1 + 1, C.m); px(g, x1 + 1, y1 + 1, C.m); px(g, x1 + 2, y1, C.m); }
    // body: a heavy grey barrel with a pale breast
    ellipse(g, 27, 26, 11, 7.5, C.h); ellipse(g, 30, 28, 7, 4.5, C.f); line(g, 25, 29, 33, 30, C.F, 1); line(g, 26, 31, 32, 31, C.F, 1);
    // neck and head, a hooked gold beak, a crest of crystal
    // (sky: the head thrown up and back for the shriek, the beak already open)
    const HEAD = { up: [41, 15], low: [43, 27], screech: [40, 12], thrown: [36, 11], sky: [37, 12] }[head];
    const [hx, hy] = HEAD;
    poly(g, [[33, 21], [hx - 3, hy - 2], [hx + 1, hy + 2], [36, 26]], 'h');
    ellipse(g, hx, hy, 5, 4.2, C.h);
    const open = head === 'screech' || head === 'sky';
    if (open) { poly(g, [[hx + 3, hy - 3], [hx + 9, hy - 3], [hx + 11, hy - 1], [hx + 4, hy]], 'm'); poly(g, [[hx + 3, hy + 1], [hx + 9, hy + 4], [hx + 3, hy + 3]], 'M'); px(g, hx + 11, hy, C.M); }
    else { poly(g, [[hx + 3, hy - 3], [hx + 9, hy - 2], [hx + 11, hy + 1], [hx + 10, hy + 4], [hx + 8, hy + 1], [hx + 3, hy + 2]], 'm'); px(g, hx + 10, hy + 3, C.M); px(g, hx + 10, hy + 4, C.M); px(g, hx + 9, hy + 2, C.M); }
    px(g, hx + 3, hy - 2, C.f); // the cere
    line(g, hx - 2, hy - 3, hx + 4, hy - 2, C.d, 1); px(g, hx + 4, hy - 1, C.d); // the brow
    px(g, hx + 1, hy - 1, C.e); px(g, hx + 2, hy - 1, C.e); px(g, hx + 2, hy, C.d);
    // a ruff at the neck, and a crest of glass that sweeps back off the skull
    for (let k = 0; k < 4; k++) px(g, 33 + k, 21 + (k % 2), C.d);
    const crest = [[hx - 3, hy - 4, -3], [hx - 5, hy - 3, -4], [hx - 7, hy - 1, -4], [hx - 1, hy - 5, -2]];
    for (const [x, y, lx] of crest) { poly(g, [[x, y + 2], [x + lx, y - 4], [x + 2, y + 1]], 'c'); px(g, x + lx + 1, y - 3, C.C); px(g, x, y, C.q); }
    // near wing last, over the body
    wing(g, WINGS[0], false);
    g.restore();
    outline(c, OUT);
    return c;
  };
  const F = [
    frame({ wings: 'up', legs: 'hang' }),
    frame({ wings: 'mid', legs: 'hang', dy: -1 }),
    frame({ wings: 'down', legs: 'hang', dy: -2 }),
    frame({ wings: 'up', head: 'screech', legs: 'hang' }),
    frame({ wings: 'fold', head: 'low', legs: 'strike', rot: 0.55, dy: -4 }),
    frame({ wings: 'forward', legs: 'hang' }),
    frame({ wings: 'splay', head: 'low', legs: 'plant' }),
    frame({ wings: 'splay', head: 'thrown', legs: 'plant' }),
    // ROUND TWO. 8 THE SHRIEK'S TELL (wings to the sky, head back, legs drawn up), 9 THE SHRIEK (flung wide, beak open),
    // 10 THE DIVE'S WINDUP (mantled and rocked back before the stoop: it used to borrow the screech), 11 STUCK (heaving
    // her wings up against the glass that has her, alternated with 6). The hurt pose stays LAST.
    frame({ wings: 'crown', head: 'sky', legs: 'tuck' }),
    frame({ wings: 'flare', head: 'screech', legs: 'hang' }),
    frame({ wings: 'mantle', head: 'low', legs: 'strike', rot: -0.15, dy: -1 }),
    frame({ wings: 'crown', head: 'thrown', legs: 'plant' }),
    frame({ wings: 'splay', head: 'low', legs: 'none', rot: 0.25, dy: 3 }),
  ];
  const big=F.map(f=>{const [c,g]=canvas(f.width*2,f.height*2);g.imageSmoothingEnabled=false;g.drawImage(f,0,0,c.width,c.height);return c;});
  return pack(big,60,82,40,30);
}

export function bakeSuncatcher() {
  const SC = Object.assign({}, EP, { c: '#bfe6f5', C: '#7aa8c8', w: '#ffffff', y: '#ffe6a0', Y: '#e0b040', d: '#4a6a90', D: '#2e4460' });
  const W2 = 34, H2 = 30; const blank = () => Array.from({ length: H2 }, () => '.'.repeat(W2));
  const put = (R, x, y, str) => { if (y < 0 || y >= H2) return; const r = R[y]; R[y] = r.slice(0, x) + str + r.slice(x + str.length); };
  const f = rows => outline(fromGrid(rows, SC, 1), OUT);
  const body = (core, arms) => { const R = blank();
    // a crown of shards over a heavy crystal body
    put(R, 12, 0, 'c..c..c'); put(R, 11, 1, 'cc.cc.cc'); put(R, 10, 2, 'ccccccccc');
    put(R, 8, 3, 'ccccccccccccc'); put(R, 7, 4, 'cCcccccccccccCc');
    put(R, 6, 5, 'cCccc' + core + 'ccccC c'.replace(' ', 'c'));
    put(R, 6, 6, 'cCcc' + core + core + 'cccCc');
    put(R, 6, 7, 'cCccc' + core + 'cccccCc');
    put(R, 7, 8, 'cccccccccccccc'); put(R, 8, 9, 'ccccccccccccc');
    put(R, 9, 10, 'ccccccccccc'); put(R, 10, 11, 'ccccccccc');
    put(R, 11, 12, 'DDDDDDD');
    // the legs it stands on: three crystal columns
    for (const lx of [11, 15, 19]) { for (let y = 13; y <= 26; y++) put(R, lx, y, 'cC'); put(R, lx - 1, 27, 'ccc'); put(R, lx - 1, 28, 'DDD'); }
    if (arms) for (const [ax, dir] of [[3, -1], [27, 1]]) { for (let y = 4; y <= 10; y++) put(R, ax + (dir < 0 ? 0 : 0), y, 'cc'); put(R, ax, 3, 'wc'); }
    return R; };
  const still = f(body('y', false));
  const turn1 = f(body('y', false).map((r, i) => i === 6 ? r.replace('yy', 'Yy') : r));
  const turn2 = f(body('y', false).map((r, i) => i === 6 ? r.replace('yy', 'yY') : r));
  const drink = f((() => { const R = body('w', true); for (let i = 0; i < 5; i++) put(R, 4 + i * 6, 0, 'w'); return R; })());
  const thr = f((() => { const R = body('y', true); put(R, 29, 5, 'www'); put(R, 30, 4, 'ww'); return R; })());
  const raise = f((() => { const R = body('y', false); for (let y = 0; y <= 12; y++) { put(R, 2, y, 'cc'); put(R, 30, y, 'cc'); } return R; })());
  const struck = f(body('D', false));
  const dim = f((() => { const R = body('D', false); return R.map(r => r.replace(/c/g, 'C')); })());
  return pack([still, turn1, turn2, drink, thr, raise, struck, dim], 17, 30, 26, 28);
}

export function bakeGoblinShaman() {
  const SH = Object.assign({}, EP, { v: '#9a5acc', V: '#5a2a8a', m: '#f0e4ff', u: '#8a5a32', a: '#e8dcc0' });
  const r = rows => outline(fromGrid(rows, SH, 1), OUT);
  const idle = r([
    '...a..aa..a.....',
    '....a.aa.a......',
    '....aVVVVa......',
    '...vvVvvVvv.....',
    '...gggeoge...m..',
    '....ggggg...umu.',
    '....gGGGg....u..',
    '...vvvvvvv...u..',
    '..vavvvvvav..u..',
    '..vvavvvavv..u..',
    '..vvvavavvv.uu..',
    '..VvvvvvvvV.u...',
    '..VvvvvvvvV.u...',
    '...VVVVVVV..u...',
    '...GG...GG..u...',
    '...GG...GG..u...',
    '..GGG...GGG.u...',
    '................']);
  const cast = r([
    '...a..aa..a.....',
    '....a.aa.a......',
    '....aVVVVa......',
    '...vvVvvVvv.....',
    '...gggeoge......',
    '....ggggg.......',
    '....gGGGg.......',
    '...vvvvvvvgg....',
    '..vavvvvvvvvgumm',
    '..vvavvvavvuuumm',
    '..vvvavavvv..mm.',
    '..VvvvvvvvV.....',
    '..VvvvvvvvV.....',
    '...VVVVVVV......',
    '...GG...GG......',
    '...GG...GG......',
    '..GGG...GGG.....',
    '................']);
  const blink = r([
    '................',
    '..m...........m.',
    '.....a.aa.a.....',
    '.....aVVVVa.....',
    '....vvVvvVvv....',
    '....gggeoge..m..',
    '.m...ggggg...u..',
    '.....gGGGg...u..',
    '....vvvvvvv..u..',
    '...vavvvvvav.u..',
    '...vvvavavvv.u..',
    '...VvvvvvvvV.u..',
    '....VVVVVVV.u...',
    '..m..GG.GG..u.m.',
    '.....GG.GG..u...',
    '....GGG.GGG.u...',
    '................',
    '................']);
  // 3 howl: both arms up, staff high, robe streaming, mouth open on the call
  const howl = r([
    '.g.a..aa..a.g...',
    '.gg.a.aa.a.gg...',
    '..g.aVVVVa.g....',
    '...vvVvvVvv..m..',
    '...gggeoge..mum.',
    '....gRRRg....m..',
    '....gGGGg.......',
    '...vvvvvvv......',
    '..vvvvvvvvv.....',
    '.vvvavvvavvv....',
    '.vvvvvavvvvv....',
    '.VvvvvvvvvvV....',
    '..VvvvvvvvV.....',
    '...VVVVVVV......',
    '...GG...GG......',
    '..GG.....GG.....',
    '.GGG.....GGG....',
    '................']);
  // 4/5 walk: the robe swings and the staff plants. He does walk, in the last of it.
  const stride = (a, b) => r([
    '...a..aa..a.....',
    '....a.aa.a......',
    '....aVVVVa......',
    '...vvVvvVvv.....',
    '...gggeoge...m..',
    '....ggggg...umu.',
    '....gGGGg....u..',
    '...vvvvvvv...u..',
    '..vavvvvvav..u..',
    '..vvavvvavv..u..',
    '..vvvavavvv.uu..',
    '..VvvvvvvvV.u...',
    '..VvvvvvvvV.u...',
    '...VVVVVVV..u...',
    a, b,
    '..GGG...GGG.u...',
    '................']);
  const walk1 = stride('...GG..GG...u...', '..GG....GG..u...');
  const walk2 = stride('....GGGG....u...', '...GG..GG...u...');
  return pack([idle, cast, blink, howl, walk1, walk2], 8, 17, 12, 16);
}

// THE SEA WITCH - the Hurricane Deck's own caster. The storm shaman was standing her posts: a green hand with a
// bone staff, on a pirate ship, which is the one thing aboard that never signed the articles. This one did. She
// is built to the shaman's canvas and anchor so she takes his place exactly, and every pixel of her is the
// crew's instead of the camp's. The first draft put her in a hood and she came out GREEN-HEADED - the one thing
// she must not read as - so the head is a RED KERCHIEF over black hair, which is what the cutlasses wear and
// nothing in the goblin family has. Under it: a tanned face, a salt-green shawl across the shoulders only, a
// deep red sea-coat, a brass sash, and the shape that names her from across a deck - A CROOK WITH A STORM
// LANTERN ON IT, dull brass while she watches, white and violet the moment she calls. Three frames for three
// states and no walk: she watches, she casts, and she throws both arms up and brings the sky down.
const SW = Object.assign({}, EP, { r: '#8a2f3a', R: '#55202a', k: '#c9463d', s: '#4a9a8a', d: '#2a2333',
  f: '#f3d2a8', u: '#8a5a32', m: '#ffffff', v: '#c9a0ff', y: '#e0b040' });
export function bakeSeaWitch() {
  const r = rows => outline(fromGrid(rows, SW, 1), OUT);
  const idle = r([
    '............yy..',
    '...........ymmy.',
    '...........ymmy.',
    '...........yyyy.',
    '.....kkkk...u...',
    '....kkkkkk..u...',
    '....ddffdd..u...',
    '....dfoofd..u...',
    '.....ffff...u...',
    '....ssssss..u...',
    '...srrrrrrsfu...',
    '...rrryyyrr.u...',
    '...rRRyyyRR.u...',
    '...rRRRRRRRru...',
    '....RRRRRRR.....',
    '....RR...RR.....',
    '...RRR...RRR....',
    '................']);
  const cast = r([
    '...........vvvv.',
    '..........vmmmmv',
    '..........vmmmmv',
    '...........vvvv.',
    '.....kkkk...u...',
    '..f.kkkkkk..u...',
    '..f.ddffdd..u...',
    '...fdfoofd..u...',
    '.....ffff...u...',
    '....ssssss..u...',
    '...srrrrrrsfu...',
    '...rrryyyrr.u...',
    '...rRRyyyRR.u...',
    '...rRRRRRRRru...',
    '....RRRRRRR.....',
    '....RR...RR.....',
    '...RRR...RRR....',
    '................']);
  const call = r([
    '..m........vvvv.',
    '..f.......vmmmmv',
    '...f.kkkkvmmmmmv',
    '....kkkkkkvvvvv.',
    '....kkkkkk..u...',
    '....ddffdd..u...',
    '....dfoofd..u...',
    '.....ffff...u...',
    '....ssssss..u...',
    '...srrrrrrsfu...',
    '..srrryyyrrsu...',
    '..rrRRyyyRRru...',
    '..rRRRRRRRRru...',
    '...rRRRRRRRru...',
    '....RRRRRRR.....',
    '...RR.....RR....',
    '..RRR.....RRR...',
    '................']);
  return pack([idle, cast, call], 8, 17, 12, 16);
}

// THE MERROW TIDECALLER - built on the sea witch's own canvas, anchor and three-pose rig (a standing caster who
// watches, channels and lets go), because the tribe's shaman needs exactly her stillness. What is hers: a
// teal fin-crest where the kerchief was, sea-green scaled hide under a kelp-wrap instead of a sea-coat, a
// driftwood staff topped with a pale shell in place of the storm lantern - dull bone while she watches, white
// and aqua the instant the channel takes hold. She throws no bolt: the surge she calls shoves the hero along
// whatever floor or water she is standing over, and any hit that lands on her while she holds it breaks it.
const MC = Object.assign({}, EP, { r: '#1d4a44', R: '#102e2a', k: '#2a8a72', s: '#3f8a78', d: '#16221e',
  f: '#8fc4ac', u: '#7a5a3a', m: '#ffffff', v: '#7ff0e0', y: '#d9c48a' });
export function bakeMerrowCaller() {
  const r = rows => outline(fromGrid(rows, MC, 1), OUT);
  const idle = r([
    '............yy..',
    '...........ymmy.',
    '...........ymmy.',
    '...........yyyy.',
    '.....kkkk...u...',
    '....kkkkkk..u...',
    '....ddffdd..u...',
    '....dfoofd..u...',
    '.....ffff...u...',
    '....ssssss..u...',
    '...srrrrrrsfu...',
    '...rrryyyrr.u...',
    '...rRRyyyRR.u...',
    '...rRRRRRRRru...',
    '....RRRRRRR.....',
    '....RR...RR.....',
    '...RRR...RRR....',
    '................']);
  const cast = r([
    '...........vvvv.',
    '..........vmmmmv',
    '..........vmmmmv',
    '...........vvvv.',
    '.....kkkk...u...',
    '..f.kkkkkk..u...',
    '..f.ddffdd..u...',
    '...fdfoofd..u...',
    '.....ffff...u...',
    '....ssssss..u...',
    '...srrrrrrsfu...',
    '...rrryyyrr.u...',
    '...rRRyyyRR.u...',
    '...rRRRRRRRru...',
    '....RRRRRRR.....',
    '....RR...RR.....',
    '...RRR...RRR....',
    '................']);
  const call = r([
    '..m........vvvv.',
    '..f.......vmmmmv',
    '...f.kkkkvmmmmmv',
    '....kkkkkkvvvvv.',
    '....kkkkkk..u...',
    '....ddffdd..u...',
    '....dfoofd..u...',
    '.....ffff...u...',
    '....ssssss..u...',
    '...srrrrrrsfu...',
    '..srrryyyrrsu...',
    '..rrRRyyyRRru...',
    '..rRRRRRRRRru...',
    '...rRRRRRRRru...',
    '....RRRRRRR.....',
    '...RR.....RR....',
    '..RRR.....RRR...',
    '................']);
  return pack([idle, cast, call], 8, 17, 12, 16);
}


// ---------- WAYMEET ----------
// THE ROAD PEOPLE. Every soldier in BRACKEN until now has been the goblin queen's - purple livery, green
// hands. These are the first men-at-arms in the game and they are not an army: they are guests. A town
// where three roads meet has an inn worth the name, and an inn worth the name has sworn swords in it
// waiting for weather and waiting for work. Each is built on ONE shape you can read across a square: a
// kettle hat's brim, a great helm's block, a bare head running, a crossbow held flat, and a cross.
const WM = Object.assign({}, EP, { s: '#c9d1dc', S: '#7c8797', d: '#4a4f5a', a: '#e8dcc0', A: '#b8a888',
  q: '#9a3a3a', Q: '#5e2222', u: '#3a5a8a', U: '#22355a', v: '#5a3a24', V: '#33200f', z: '#e0b040', Z: '#8a6a1a',
  m: '#8a6a4a', M: '#5c3a1d', f: '#f3d2a8', j: '#2a2f3d', h: '#6a4a2a', H: '#43301c' });
const wspr = rows => outline(fromGrid(rows, WM, 1), OUT);
// one grid over another: '.' in the top layer lets the bottom one through. Arms, weapons and shields are
// LAYERS, because building them as extra rows is how they end up drawn under the feet.
const lay = (base, over) => base.map((b, i) => { const o = over[i] || ''; return b.split('').map((ch, k) => (o[k] && o[k] !== '.') ? o[k] : ch).join(''); });
const pad = (rows, w) => rows.map(r => r + '.'.repeat(Math.max(0, w - r.length)));

// THE SWORN SWORD - a kettle hat with a brim wider than his shoulders, mail to the knee, a kite shield up
// at his front and an arming sword. He is slow and he tells you everything: he is the parry lesson.
export function bakeSwornSword() {
  const W = 14;
  const base = pad([
    '.....ssss.....',      /* the dome */
    '....sSSSSSs...',
    'ssssssssssssss',      /* and the brim, wider than his shoulders: nothing else in the town has one */
    '.SSSSSSSSSSSS.',
    '....sffffs....',
    '....sfjjfs....',
    '...uuuuuuuu...',
    '..uUUUUUUUUu..',
    '..uUqqqqqqUu..',
    '..uUqqqqqqUu..',
    '..uUUUUUUUUu..',
    '...vvvvvvvv...',
    '...vv....vv...',
    '...vv....vv...',
    '..VV......VV..'], W);
  /* ONE PIXEL AT A TIME, so an added sleeve or glove never shifts a row's width the way retyping a whole
     string can. He used to be a shield and a sword with nobody holding them; a sleeve (u) and a glove (f)
     now bridge the shoulder to the grip on every layer that carries one, so no frame reads as a shield
     that walks by itself. A red feather (q) off the back of the dome gives the kettle hat a little pride. */
  const set = (r, i, c) => r.slice(0, i) + c + r.slice(i + 1);
  base[0] = set(base[0], 9, 'q'); base[1] = set(base[1], 11, 'q');   /* the feather */
  /* the shield on his near arm, and the sword low behind him */
  const guard = pad([
    '..............', '..............', '..............', '..............', '..............', '..............',
    '.ss...........', 'sSSs..........', 'sSszs.........', 'sSSs..........', 'sSSs..........', '.ss...........'], W);
  guard[5] = set(guard[5], 4, 'u'); guard[6] = set(guard[6], 3, 'f'); guard[7] = set(guard[7], 4, 'u'); guard[9] = set(guard[9], 4, 'u');   /* the shield arm: sleeve at the shoulder, a glove on the grip */
  const swordLow = pad([
    '..............', '..............', '..............', '..............', '..............', '..............',
    '..............', '..........mss.', '...........mm.', '...........m..'], W);
  swordLow[7] = set(swordLow[7], 9, 'f');   /* the sword hand, held low */
  const swordUp = pad([
    '...........ss.', '..........ss..', '.........mm...', '..............', '..............', '..............',
    '..............', '..........m...'], W);
  swordUp[2] = set(swordUp[2], 8, 'f'); swordUp[3] = set(swordUp[3], 9, 'u'); swordUp[4] = set(swordUp[4], 9, 'u'); swordUp[5] = set(swordUp[5], 9, 'u'); swordUp[6] = set(swordUp[6], 9, 'u');   /* the arm raised beside his own head for the windup */
  const swordOut = pad([
    '..............', '..............', '..............', '..............', '..............', '..............',
    '..............', '..........mmmm', '..........sss.'], W);
  swordOut[7] = set(swordOut[7], 9, 'f'); swordOut[8] = set(swordOut[8], 9, 'u');   /* the arm thrown out with the cut */
  const stepB = pad([], 0);
  const legsB = ['....vvvvvv....', '...vv....vv...', '...vv.....vv..', '..VV.......VV.'];
  const withLegs = (b, legs) => b.slice(0, 11).concat(legs);
  const walk1 = wspr(lay(base, lay(guard, swordLow)));
  const walk2 = wspr(lay(withLegs(base, legsB), lay(guard, swordLow)));
  const tell = wspr(lay(base, lay(guard, swordUp)));
  const cut = wspr(lay(withLegs(base, legsB), lay(guard, swordOut)));
  const rest = wspr(lay(base, guard));
  /* A WALK IN FOUR: the two steps between the two he had (5, 6); and HURT, the brim knocked back and the shield flung up (7) */
  const legsC = ['...vvvvvvvv...', '....vv..vv....', '....vv...vv...', '...VV.....VV..'];
  const legsD = ['...vvvvvvvv...', '...vv..vv.....', '..vv....vv....', '.VV.....VV....'];
  const legsHurt = ['...vvvvvvvv...', '...vv....vv...', '..vv......vv..', '.VV........VV.'];
  const shiftR = rows => rows.map(r => ('.' + r).slice(0, W));
  const guardUp = pad(['..............', '..............', '..............', '..............', '.ss...........', 'sSSs..........', 'sSszs.........', 'sSSs..........', 'sSSs..........', '.ss...........'], W);
  guardUp[3] = set(guardUp[3], 4, 'u'); guardUp[4] = set(guardUp[4], 3, 'f'); guardUp[5] = set(guardUp[5], 4, 'u'); guardUp[7] = set(guardUp[7], 4, 'u');   /* the shield arm, knocked up with the rest of him */
  const walk3 = wspr(lay(withLegs(base, legsC), lay(guard, swordLow)));
  const walk4 = wspr(lay(withLegs(base, legsD), lay(guard, swordLow)));
  const hurt = wspr(lay(withLegs(shiftR(base), legsHurt), guardUp));
  return pack([walk1, walk2, tell, cut, rest, walk3, walk4, hurt], 7, 15, 10, 14);
}

// THE HEDGE KNIGHT - a great helm is a BLOCK with one slit in it, and the poleaxe over his shoulder is the
// only thing in the town that breaks a man's outline above his head. His surcoat has been washed too often.
export function bakeHedgeKnight() {
  const W = 18;
  const base = pad([
    '.....ssssss.....',
    '....sSSSSSSs....',
    '....sSSSSSSs....',
    '....sjjjjjjs....',      /* the slit */
    '....sSSSSSSs....',
    '.....SSSSSS.....',
    '...ssssssssss...',
    '..sSqqqqqqqqSs..',
    '..sSqqqzzqqqSs..',
    '..sSqqzzzzqqSs..',
    '..sSqqqzzqqqSs..',
    '..sSqqqqqqqqSs..',
    '...sSSSSSSSSs...',
    '....ss....ss....',
    '....sS....Ss....',
    '....ss....ss....',
    '...dd......dd...'], W);
  const legsB = ['.....ssssss.....', '....ss....ss....', '...sS......Ss...', '..dd........dd..'];
  const shoulder = pad([
    '..........mm....', '.........mm.....', '........mm......', '.......mm.......', '......mm........'], W);
  const axeUp = pad([
    '......mMMm......', '......mMMm......', '.......mm.......', '.......mm.......', '.......mm.......'], W);
  const axeOut = pad([
    '................', '................', '................', '................', '................', '................',
    '................', '..........mmmmmm', '..........mMMMMm', '...........mmmm.'], W);
  const withLegs = (b, legs) => b.slice(0, 13).concat(legs);
  const walk1 = wspr(lay(base, shoulder));
  const walk2 = wspr(lay(withLegs(base, legsB), shoulder));
  const tell = wspr(lay(base, axeUp));
  const swing = wspr(lay(withLegs(base, legsB), axeOut));
  const leap = wspr(lay(pad([
    '.....ssssss.....', '....sSSSSSSs....', '....sSSSSSSs....', '....sjjjjjjs....', '....sSSSSSSs....', '.....SSSSSS.....',
    '...ssssssssss...', '..sSqqqqqqqqSs..', '..sSqqqzzqqqSs..', '..sSqqzzzzqqSs..', '..sSqqqzzqqqSs..', '..sSqqqqqqqqSs..',
    '...sSSSSSSSSs...', '...ss......ss...', '..ss........ss..', '.dd..........dd.'], W), axeUp));
  return pack([walk1, walk2, tell, swing, leap], 9, 18, 12, 16);
}

// THE RUNNER - a squire with no armour on and a feather in his cap, leaning into it. He is the only one in
// the town who is FAST, he barely hurts you, and he is the only one who goes and FETCHES somebody.
export function bakeRunner() {
  const W = 12;
  const head = ['....zz......', '...aaaa.....', '..aafffa....', '..aafjfa....', '...afffa....', '....aaa.....'];
  const run1 = wspr(pad([...head,
    '...hhhhh....', '..hHhhhHh...', '.mhHhhhHh...', '.m.hhhhh....', '...vv.vv....', '..vv...vv...', '.VV.....V...'], W));
  const run2 = wspr(pad([...head,
    '...hhhhh....', '..hHhhhHh...', '.mhHhhhHh...', '.m.hhhhh....', '....vvvv....', '...vv..vv...', '...V....VV..'], W));
  /* the shout's lines drawn beside the head, not stacked over it: three rows of them made the frame two rows taller than the
     walk, and on the same anchor that stood him two rows into the ground */
  const shout = wspr(pad(['.a........a.', '..a.zz...a..', '...aaaa.a...', ...head.slice(2),
    '...hhhhh....', '..hHhhhHh...', '..hHhhhHh...', '...hhhhh....', '...vv.vv....', '..vv...vv...'], W));
  const stab = wspr(pad([...head,
    '...hhhhh....', '..hHhhhHh...', '..hHhhhHhmmm', '...hhhhh.ss.', '...vv.vv....', '..vv...vv...', '.VV.....V...'], W));
  return pack([run1, run2, shout, stab], 6, 14, 8, 12);   /* his feet a row into the ground like every walker's (at 13 they were two rows in) */
}

// THE CROSSBOWMAN - the prod held flat across his chest is a horizontal bar and nothing else in the town
// has one. He stands in a window or at the head of a stair, and the bolt is the one thing a shield
// does not turn.
export function bakeCrossbowman() {
  /* THE CROSSBOWMAN - the prod held flat across his chest is a horizontal bar, and a PAVISE on his back is a
     tall painted board no one else in the town carries. Spanning, the bow points at the ground in front of
     him with his foot in the stirrup; before, that frame had no crossbow in it at all. */
  const W = 16;
  const pavise = rows => rows.map((r, i) => { if (i > 10) return r; const a = r.split(''); const c0 = i === 0 ? 'd' : i % 3 === 1 ? 'a' : 'q';
    if (a[0] === '.') a[0] = i === 0 ? 'd' : 'q'; if (a[1] === '.') a[1] = c0; return a.join(''); });
  const base = pad([
    '...ssssss.......',
    '...sSSSSs.......',
    '...sfffjs.......',
    '....sffs........',
    '...uuuuuu.......',
    '..uUUUUUUu......',
    '..uUUUUUUu......',
    '..uUUUUUUu......',
    '...uuuuuu.......',
    '...vv..vv.......',
    '...vv..vv.......',
    '..VV....VV......'], W);
  const spanning = pad([
    '................', '................', '................', '................',
    '.....mm.........', '....mmmm........', '....mMMm.m......', '.....mm..m......', '.........m......', '.........m......', '.......mmmmm....', '................'], W);
  const level = pad([
    '................', '................', '................', '................',
    '.m............m.', '.mmmmmmmmmmmmmm.', '.m..sss.....M...', '................'], W);
  const shot = pad([
    '................', '................', '................', '................',
    '.m............m.', '.mmmmmmmmmm.....', '.m..sss.........', '................'], W);
  return pack([wspr(pavise(lay(base, spanning))), wspr(pavise(lay(base, level))), wspr(pavise(lay(base, shot)))], 6, 13, 10, 12);
}

// THE CLOSED HELM - the biggest man in the game and the only one who never opens. A rounded great helm
// with one slit, pauldrons wider than a doorway, and a sword he rests POINT DOWN in front of him like a
// cross. Everything else in this town is a person; he is a shape. Frames: stand, walk, raise, cut, stamp,
// and OPEN - the one frame where the plate is not between you and him, and the only one worth a swing.
export function bakeClosedHelm() {
  const W = 28, E = '.'.repeat(W);
  const top3 = rows => [E, E, E, ...rows];
  /* THE CREST, THE DOMES AND THE CAPE. Built as a block with a bar across it he read as the sworn sword drawn
     twice as big - the pauldron bar was the kettle hat's brim all over again. So his shoulders are two domes
     with the neck between them, a red crest runs back off the crown of the helm, and a cape hangs off his
     back: three shapes nobody else in the town has. Frames: stand, walk, raise, cut, stamp, and OPEN. */
  const crest = ['.......qqqq.................', '.....qqqqqqqqq..............', '....qqQQqqqqqqq.............'];
  const cape = rows => rows.map((r, i) => { if (i < 12 || i > 25) return r; const a = r.split(''), w = i < 16 ? 2 : i < 21 ? 3 : 4;
    for (let x = 5 - w + 1; x <= 5; x++) if (x >= 0 && a[x] === '.') a[x] = i % 4 === 0 ? 'q' : 'Q'; return a.join(''); });
  const body = cape([...crest, ...pad([
    '..........ssssssss..........',
    '.........sSSSSSSSSs.........',
    '.........sSSSSSSSSs.........',
    '.........sjjjjjjjjs.........',      /* the slit */
    '.........sSSSSSSSSs.........',
    '..........SSSSSSSS..........',
    '...ssssss.dddddddd.ssssss...',      /* the domes of the pauldrons, and the gorget between them */
    '..sSSSSSSsddddddddsSSSSSSs..',
    '..sSSddSSSssssssssSSSddSSs..',
    '.....ssssssssssssssss.......',
    '.....sSqqqqqqqqqqqqSs.......',
    '.....sSqqqqzzzzqqqqSs.......',
    '.....sSqqqzzZZzzzqqSs.......',
    '.....sSqqqqzzzzqqqqSs.......',
    '.....sSqqqqqqqqqqqqSs.......',
    '.....sSSqqqqqqqqqqSSs.......',
    '......ssssssssssssss........',
    '......sSSSSSSSSSSSSs........',
    '......sddddddddddddSs.......',
    '.......ssssssssssss.........',
    '.......ss........ss.........',
    '.......sS........Ss.........',
    '.......ss........ss.........',
    '......dd..........dd........'], W)]);
  const legsB = ['........ssssssss............', '.......ss........ss.........', '......sS..........Ss........', '.....dd............dd.......'];
  /* the sword, point down, in front of him: a cross */
  const cross = top3(pad([
    E, E, E, E, E, E, E, E,
    '.........ssssssssss.........',      /* the crossguard, and it is the widest bright thing on him */
    '..........sSSSSSSs..........',
    '............ssss............',
    '............sSSs............',
    '............sSSs............',
    '............sSSs............',
    '............sSSs............',
    '............sSSs............',
    '............sSSs............',
    '............sSSs............',
    '............sSSs............',
    '.............ss.............',
    '.............ss.............',
    '..............s.............'], W));
  const raised = top3(pad([
    '.....................ssss...', '....................ssss....', '...................ssss.....', '..................mm........',
    '.................mm.........', '................mm..........'], W));
  const outCut = top3(pad([
    E, E, E, E, E, E, E, E, E, E,
    '..................ssssssssss', '..................sSSSSSSSSs',
    '...................mmm......'], W));
  const stampLegs = ['.......ss........ss.........', '......sSS........SSs........', '.....dddd........dddd.......', '.....dddd........dddd.......'];
  const withLegs = (b, legs) => b.slice(0, 23).concat(legs);
  const stand = wspr(lay(body, cross));
  const walk = wspr(lay(withLegs(body, legsB), cross));
  const raise = wspr(lay(body, raised));
  const cut = wspr(lay(withLegs(body, legsB), outCut));
  const stamp = wspr(lay(withLegs(body, stampLegs), cross));
  /* OPEN: the guard is off the line, both arms are wide and the slit has gone bright. */
  const openRows = pad([
    'ss......................ss..',
    '.ss....................ss...',
    '..ss..................ss....',
    '...ss................ss.....',
    '..........ssssssss..........',
    '.........sSSSSSSSSs.........',
    '.........sSSSSSSSSs.........',
    '.........szzzzzzzzs.........',
    '.........sSSSSSSSSs.........',
    '..........SSSSSSSS..........',
    '.....sssssssssssssssss......',
    '....sSSSSSSSSSSSSSSSSSs.....',
    '.....ssssssssssssssss.......',
    '.....sSqqqqqqqqqqqqSs.......',
    '.....sSqqqqzzzzqqqqSs.......',
    '.....sSqqqzzZZzzzqqSs.......',
    '.....sSqqqqzzzzqqqqSs.......',
    '.....sSSqqqqqqqqqqSSs.......',
    '......ssssssssssssss........',
    '......sSSSSSSSSSSSSs........',
    '.......ssssssssssss.........',
    '.......ss........ss.........',
    '.......sS........Ss.........',
    '.......ss........ss.........',
    '......dd..........dd........'], W);
  const open = wspr(top3(lay(openRows, [E, ...crest])));
  return pack([stand, walk, raise, cut, stamp, open], 14, 31, 20, 26);
}

// THE TEMPERER - the one goblin in the game whose power is something he has to GO AND GET. 10x14.
// Read him BY THE BLADE, not the body: cold he is a plain goblin in a smith's apron with an over-long
// two-hander, deliberately unremarkable, because the point is that you stop watching him. At the fire the
// same blade comes back the brightest thing in the room, and every frame of him is baked twice - once in
// steel and once in ember - off the same grids, so the hot pose is unmistakably the SAME creature.
// Frames: 0 idle, 1/2 walk, 3 cutTell (overhand up), 4 cut, 5 shove, 6/7 run, 8 at the fire,
//         9 hot idle, 10 hot walk, 11 quenchTell, 12 quench, 13 hurt (LAST: HAS_HURT reads the last frame).
export function bakeTemperer() {
  const W = 18, ROWS = 20;
  /* a = the smith's leather apron, the one thing on him that is not a goblin; m/M = the blade, and the
     whole creature is the two palettes below telling you which state he is in */
  const COLD = Object.assign({}, EP, { a: '#6b4a2a', A: '#3a2416', m: '#c9d1dc', M: '#7c8797' });
  const HOT = Object.assign({}, EP, { a: '#6b4a2a', A: '#3a2416', m: '#ffd36b', M: '#ff6b2c' });
  const blank = () => Array.from({ length: ROWS }, () => '.'.repeat(W));
  const put = (R, y, x, s) => { if (y < 0 || y >= ROWS) return; const a = R[y].split('');
    for (let k = 0; k < s.length; k++) if (s[k] !== '.' && x + k >= 0 && x + k < W) a[x + k] = s[k]; R[y] = a.join(''); };
  const f = (R, hot) => outline(fromGrid(R, hot ? HOT : COLD, 1), OUT);
  // the goblin: head, apron, and the eyes shut when he has been hit
  const body = (R, dx = 0, dy = 0, shut = false) => {
    put(R, 8 + dy, 4 + dx, 'gggggg'); put(R, 9 + dy, 3 + dx, shut ? 'ggGGggGGg' : 'ggeoggeog');
    put(R, 10 + dy, 3 + dx, 'gggggggg'); put(R, 11 + dy, 4 + dx, 'gGGGGg');
    put(R, 12 + dy, 4 + dx, 'aaaaaa'); put(R, 13 + dy, 3 + dx, 'agggggga');
    put(R, 14 + dy, 3 + dx, 'agggggga'); put(R, 15 + dy, 3 + dx, 'aaaaaaaa'); put(R, 16 + dy, 4 + dx, 'aaaaaa');
  };
  const LEGS = {
    stand: [[17, 4, 'GG..GG'], [18, 4, 'GG..GG'], [19, 3, 'GGG..GGG']],
    stepA: [[17, 5, 'GGGG'], [18, 4, 'GG..GG'], [19, 3, 'GG....GG']],
    stepB: [[17, 4, 'GG..GG'], [18, 3, 'GG....GG'], [19, 2, 'GG......GG']],
    runA: [[17, 3, 'GG...GG'], [18, 2, 'GG.....GG'], [19, 1, 'GG.......GG']],
    runB: [[17, 5, 'GGGG'], [18, 4, 'GG..GG'], [19, 4, 'GGGG']],
    lunge: [[17, 4, 'GG...GG'], [18, 2, 'GG.....GG'], [19, 1, 'GG'], [19, 11, 'GG']],
    kneel: [[18, 4, 'GGGG..GG'], [19, 3, 'GGGGG..GG']],
  };
  const legs = (R, k) => { for (const [y, x, s] of LEGS[k]) put(R, y, x, s); };
  /* THE LOW CARRY. Both hands at his hip and five rows of blade running down past his boot: it is longer
     than he is and it is the only line on him that is not a goblin's. */
  const lowBlade = (R, dx = 0, dy = 0) => { put(R, 14 + dy, 12 + dx, 'ww'); put(R, 15 + dy, 13 + dx, 'mM');
    put(R, 16 + dy, 14 + dx, 'mM'); put(R, 17 + dy, 15 + dx, 'mM'); put(R, 18 + dy, 16 + dx, 'mM'); };
  const grids = {};
  { const R = blank(); body(R); legs(R, 'stand'); lowBlade(R); grids.idle = R; }
  { const R = blank(); body(R); legs(R, 'stepA'); lowBlade(R); grids.walkA = R; }
  { const R = blank(); body(R); legs(R, 'stepB'); lowBlade(R); grids.walkB = R; }
  /* THE LONG CUT, told: the whole blade goes straight up over him, both arms with it, and it is on screen
     for every frame of the wind-up (the road people's lesson: the read is the wind-up, not a beat of it) */
  { const R = blank(); body(R); legs(R, 'stand');
    for (let y = 1; y <= 5; y++) put(R, y, 11, 'mM');
    put(R, 6, 10, 'ymMy'); put(R, 7, 11, 'ww');
    put(R, 8, 11, 'GG'); put(R, 9, 11, 'GG'); put(R, 10, 11, 'GG'); put(R, 11, 11, 'G'); put(R, 12, 10, 'G');
    grids.cutTell = R; }
  { const R = blank(); body(R); legs(R, 'stepA');
    put(R, 12, 10, 'Gww'); put(R, 13, 10, 'G.mM'); put(R, 14, 13, 'mM'); put(R, 15, 14, 'mM'); put(R, 16, 15, 'mM');
    grids.cut = R; }
  /* THE SHOULDER: he leans the whole apron into you to make room, and the blade never leaves the low carry.
     It is not much of a blow. It is how he gets out from under you, which is the thing it is really telling you. */
  { const R = blank(); body(R, 1); legs(R, 'lunge'); put(R, 12, 4, 'aaaaaaa'); put(R, 13, 4, 'aggggggga');
    lowBlade(R, 1); grids.shove = R; }
  { const R = blank(); body(R, 1); legs(R, 'runA'); lowBlade(R, 1); grids.runA = R; }
  { const R = blank(); body(R, 1); legs(R, 'runB'); lowBlade(R, 1); grids.runB = R; }
  /* AT THE FIRE: stooped over it with his back half turned, the blade held straight down into the coals in
     both hands. Nothing about this pose is a guard, and that is the whole point of it. */
  { const R = blank(); body(R, 1, 2); legs(R, 'kneel'); put(R, 13, 13, 'ww');
    for (let y = 14; y <= 19; y++) put(R, y, 13, 'mM');
    grids.fire = R; }
  { const R = blank(); body(R, -1, 0, true); legs(R, 'stand'); put(R, 13, 10, 'ww'); put(R, 14, 11, 'mM');
    put(R, 15, 12, 'mM'); put(R, 16, 13, 'mM'); put(R, 17, 14, 'mM'); grids.hurt = R; }
  return pack([f(grids.idle), f(grids.walkA), f(grids.walkB), f(grids.cutTell), f(grids.cut), f(grids.shove),
    f(grids.runA), f(grids.runB), f(grids.fire),
    /* and the same four poses again in ember: this is the whole silhouette rule, baked */
    f(grids.idle, true), f(grids.walkA, true), f(grids.cutTell, true), f(grids.cut, true),
    f(grids.hurt)], 8, 22, 10, 14);
}
/* ==== THE RANGER (claude/ranger 2026-10-14 built her kit; claude/rangerart 2026-10-14 gave her HER OWN RIG - she used to be the Geomancer's with a bow in place of the staff).
   scratch/brief-ranger.md LOOK: a hooded woodland ranger. What says RANGER at game scale, none of it a geomancer's, a goblin's or a knight's:
   - a green HOOD with its peak drooping back, and a RED FEATHER swept off the back of it (the one red on her head); the face pale in the hood's mouth;
   - a brown-green CLOAK drawn BEHIND her that streams out of her shoulders (longer when she runs), its hem ragged - no other hero has a tail of cloth;
   - a leather JERKIN laced up the front, tan leather BRACERS on both forearms, a belt with a buckle and a knife sheath, wrapped boots;
   - the QUIVER slung on her back with white-and-red FLETCHINGS standing up over the shoulder (seen in every pose, behind everything);
   - the LONGBOW, taller than she is: two limbs of yew bowed away from the string, horn nocks, a red-wrapped grip; carried low and ahead at rest, so the bow (not a staff held
     upright against her) is the second thing the eye finds - and a short HUNTING KNIFE (steel blade, brass guard, leather grip) for the knife set.
   Her palette letters a skin can recolour are the hood (b/B), the arms and trousers (s/S) and the buckle (y); the rest is hers alone. ==== */
const RG_BODY = [
  '...BB.....',     /* 0  (the peak comes from RG_PLUME) */
  '..BbbB....',     /* 1 */
  '.BbhbbbB..',     /* 2 */
  '.Bbvvekb..',     /* 3  the hood's mouth, in shadow: an eye and the brow */
  '.Bbvkkkb..',     /* 4  her face lit on the side she faces */
  '.CBbkkbBc.',     /* 5  the jaw; the cloak's edge at her front */
  'cCbhbbbCc.',     /* 6  THE MANTLE: the hood's collar over the cloak's shoulders */
  'CcllmmlLC.',     /* 7  the jerkin, its lacing down the front */
  '.ClLllLlC.',     /* 8  */
  '..lLllLl..',     /* 9  */
  '.wyWwyWw..',     /* 10 the belt: a buckle and the knife's sheath */
];
const RG_PLUME = [
  ['...BB.....', '..BbbB....', '.BbhbbbB..'],
  ['..BB......', '.BbbbB....', '.BbhbbbB..'],   /* the peak of the hood falls back a pixel as she breathes */
  ['...BBB....', '..BbhbB...', '.BbbbbbB..'],
];
/* AUTUMN RUSSET (Daniel 10-14): a DARKER rust hood (b/B) over a LIGHTER rust cloak (c/C), a tan jerkin laced in moss (m, the one green on her), dark-brown bracers and boots, a CREAM feather (f/F).
   b/B the hood (a skin's colour); c/C the cloak; h the hood's lit edge; l/L the jerkin, t its lacing; s/S the arms and the trousers (S); w/W belt leather and boots;
   y the buckle; f/F the feather and its lit edge; k the face; v the hood's shadow */
const RG_PAL = { s: '#8a6a44', S: '#6a4a2c', b: '#6a2a16', B: '#34140c', h: '#9a4a28', c: '#d47c44', C: '#96482a', l: '#c8a064', L: '#9a7440', t: '#ecd9a0', m: '#7a9a4a', k: '#f0c49c', v: '#1a0e0a', e: '#1a1410',
  w: '#5a3a1e', W: '#2e1e14', y: '#d8b450', r: '#c9352a', f: '#f4ecd0', F: '#ffffff', g: '#6a2a16', G: '#34140c' };
/* THE CLOAK, behind everything: from her shoulders back and down past the belt, a ragged hem that streams further the harder she moves (the plume count, and a run, a jump or a fall) */
function rgCloakAt(g, x, y, legs, plume) {
  const mv = /^(run|push|jump|fall|wide|climb)/.test(legs) ? 1 : 0, sw = plume + mv;
  for (let r = 0; r < 6; r++) { const yy = y + 6 + r, back = Math.floor(r * 0.2) + (r > 3 ? sw : sw >> 1), x0 = x - 1 - back, x1 = x + (r < 5 ? 2 : 3);
    if (r === 5 && ((x + r) & 1)) continue;
    for (let xx = x0; xx <= x1; xx++) { const edge = xx === x0 || r === 5, fold = (xx - x0) % 4 === 2; px(g, xx, yy, edge || fold ? KP.C : KP.c); } }
}
/* THE QUIVER on her back: a leather tube slung from the off shoulder, a brass band, and the fletchings standing up out of it over the shoulder, white and red */
function rgQuiverAt(g, x, y) {
  for (const [u, v, col] of [[1, 9, '#4a2e18'], [0, 8, '#6a4426'], [0, 7, '#4a2e18'], [-1, 7, '#6a4426'], [-1, 6, '#4a2e18'], [-2, 6, '#6a4426'], [-2, 5, '#c9a84a'], [-3, 5, '#6a4426'], [-3, 4, '#4a2e18']]) px(g, x + u, y + v, col);
  for (const [u, v, col] of [[-3, 3, '#8a6a42'], [-4, 3, '#8a6a42'], [-4, 2, '#f0ead8'], [-3, 2, '#b5532f'], [-2, 3, '#f0ead8']]) px(g, x + u, y + v, col);
}
/* THE RED FEATHER, standing off the back of the hood: a quill and a vane, swept back further as the plume count rises */
function rgFeatherAt(g, x, y, plume) {
  const sets = [[[2, 1, KP.f], [1, 0, KP.f], [1, -1, KP.f], [0, -2, KP.F], [0, -3, KP.f], [-1, -4, KP.F], [-1, -3, KP.f]], [[2, 1, KP.f], [1, 0, KP.f], [0, -1, KP.f], [0, -2, KP.F], [-1, -2, KP.f], [-2, -3, KP.F], [-1, -3, KP.f]], [[2, 1, KP.f], [1, 1, KP.f], [0, 0, KP.F], [-1, -1, KP.f], [-2, -1, KP.F], [-3, -2, KP.f], [-2, -2, KP.f]]];
  for (const [u, v, col] of sets[plume % 3]) px(g, x + u, y + v, col);
  for (const [u, v, col] of [[3 - (plume === 1 ? 1 : 0), -1, KP.B], [4 - (plume === 1 ? 1 : 0), -1, KP.b], [3 - (plume === 1 ? 1 : 0), -2, KP.B]]) px(g, x + u, y + v, col);   /* THE HOOD'S PEAK stood up two pixels: taller, upright */
}
/* BRACERS: the forearm of each arm wrapped in tan leather, and the bare hand at the end of it */
function rgBracerAt(g, a, dx, dy) {
  const [x0, y0, x1, y1] = [a[0] + dx, a[1] + dy, a[2] + dx, a[3] + dy], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= n; i++) { const t = i / n, xx = Math.round(x0 + (x1 - x0) * t), yy = Math.round(y0 + (y1 - y0) * t); if (t > 0.45 && t < 0.9) px(g, xx, yy, i % 2 ? '#6a4426' : '#4e3018'); }
  px(g, x1, y1, KP.k); px(g, x1, y1 + 1, KP.k);
}
/* THE HUNTING KNIFE: [hand x, hand y, tip x, tip y]. A leather grip out of the fist, a brass guard across it, and a short steel blade with a bright edge and a point */
function rgKnifeAt(g, spec, dx, dy) {
  const [x0, y0, x1, y1] = spec.slice(0, 4).map((v, i) => v + (i & 1 ? dy : dx)), len = Math.hypot(x1 - x0, y1 - y0) || 1, ax = (x1 - x0) / len, ay = (y1 - y0) / len, qx = -ay, qy = ax;
  const at = (t, o = 0) => [Math.round(x0 + ax * t + qx * o), Math.round(y0 + ay * t + qy * o)];
  px(g, ...at(0), '#4a2e18'); px(g, ...at(1), '#6a4426');
  px(g, ...at(2, -1), '#d8b450'); px(g, ...at(2), '#d8b450'); px(g, ...at(2, 1), '#d8b450');
  const bl = Math.max(3, Math.min(Math.round(len), 8));
  for (let t = 3; t <= bl; t++) { px(g, ...at(t), '#c9d4e0'); if (t < bl) px(g, ...at(t, 1), '#8a96a8'); }
  px(g, ...at(bl + 1), '#ffffff'); px(g, ...at(bl, -1), '#eef4fa');
}
/* THE LONGBOW. Given [low tip x, low tip y, high tip x, high tip y] (the stave spec) and an optional nock [x, y] (the draw hand): two limbs of yew that BOW toward where she aims
   (away from the string), a red-wrapped leather grip at the middle, horn nocks at the tips, and the STRING tip to tip - straight at rest, pulled back to the nock while she draws,
   with an ARROW laid from the nock out past the grip (a shaft, a steel head and a white-and-red fletching) */
function rgBowAt(g, spec, dx, dy, nock) {
  const [x0, y0, x1, y1] = spec.slice(0, 4).map((v, i) => v + (i & 1 ? dy : dx));
  const len = Math.hypot(x1 - x0, y1 - y0) || 1, ax = (x1 - x0) / len, ay = (y1 - y0) / len, qx = -ay, qy = ax, bulge = 3;
  const at = (t, o = 0) => [Math.round(x0 + ax * t + qx * o), Math.round(y0 + ay * t + qy * o)];
  for (let t = 0; t <= len; t += 0.5) { const o = bulge * Math.sin(Math.PI * t / len), mid = Math.abs(t - len / 2) < 2.2;
    px(g, ...at(t, o), mid ? '#a0302a' : t < len / 2 ? WT('#6a3c1a', 0.1) : WT('#7c4a22', 0.15));
    if (!mid && t > 1.5 && t < len - 1.5) px(g, ...at(t, o + 1), WL('#c8903e')); }   /* the belly of each limb, lit */
  px(g, ...at(len / 2, bulge + 1), '#6e1c18');                                         /* the grip's wrap, shaded */
  px(g, ...at(0.3, 0.2), '#f0e6c4'); px(g, ...at(len - 0.3, 0.2), '#f0e6c4');         /* the horn nocks */
  const s0 = at(0.5, -0.4), s1 = at(len - 0.5, -0.4);
  if (nock) { const n = [nock[0] + dx, nock[1] + dy]; line(g, s0[0], s0[1], n[0], n[1], '#efe8d0', 1); line(g, n[0], n[1], s1[0], s1[1], '#efe8d0', 1);
    const gp = at(len / 2, bulge + 1), ux = gp[0] - n[0], uy = gp[1] - n[1], ul = Math.hypot(ux, uy) || 1;
    for (let i = 0; i <= ul + 4; i++) px(g, Math.round(n[0] + ux / ul * i), Math.round(n[1] + uy / ul * i), i > ul + 3 ? '#ffffff' : i > ul + 2 ? '#c9d4e0' : '#cfa86a');   /* the arrow, its point out past the grip */
    px(g, n[0] - Math.round(ux / ul), n[1] - Math.round(uy / ul), '#f0ead8'); px(g, n[0] - Math.round(ux / ul * 2), n[1] - Math.round(uy / ul * 2), '#c9352a'); }
  else line(g, s0[0], s0[1], s1[0], s1[1], spec[4] === 'back' ? '#8a6a46' : '#e4dcc4', 1);
}
/* THE RANGER'S OWN SET (claude/rangerart). Not the Geomancer's baked again: every frame below is hers - the bow carried low and ahead (not a staff upright against her), the off hand free
   on the quiver strap, the cloak streaming behind her, the knife a short steel blade, and her own keys (the draw, the loose, the shots, the flip, the bash, the kit). Everything that stands
   in a frame stays inside the box the old (borrowed) frames filled - no hit box, timer or cost reads a pixel of this (it is art only: chars.js and nothing else). */
const rgSpin = (c, q) => { const [o, g] = canvas(c.width, c.height); g.translate(16, ATTACK_HEADROOM + BY + 8); g.rotate(q * Math.PI / 2); g.drawImage(c, -16, -(ATTACK_HEADROOM + BY + 8)); return o; };   /* a turn about the middle of her body, for the flip and the roll */
export function bakeRanger(skin = {}, previewOnly = false) {
  KP = Object.assign({}, KP0, RG_PAL, skin); BODY_REF = RG_BODY; PLUME_REF = RG_PLUME;
  const sh = [BX + 8, BY + 7], [X, Y] = sh, OFF = [BX + 2, BY + 7], WIDE = 12;
  const o = (x, y, col) => [X - BX + x, Y - BY + y, col];
  const W2 = '#ffffff', C = '#fff6c8', GR = '#c8e89a', D = '#c9b27c', BR = '#d8b050', BRD = '#8a6a28', GY = '#b8bcb0', GYD = '#8a9088';
  const KF = f => knightFrame({ top: ATTACK_HEADROOM, ...f });
  /* THE BOW AT HER SIDE: carried low and ahead in the lead hand, its foot just off the turf, its top leaning in over her front; the off hand hangs at her belt */
  const BB = [X - 11, Y + 6, X - 4, Y - 6, 'back'], BS = [X - 10, Y + 5, X - 5, Y - 3, 'back'];   /* THE BOW SLUNG ON HER BACK (drawn behind the cloak; the full bow comes out in front only to shoot), and a short one for the rolled and turned frames */
  const carry = () => ({ stave: BB, arm: [X, Y, X + 3, Y + 5], arm2: [OFF[0], OFF[1], X - 3, Y + 5] });
  /* the bow held out in the lead hand to shoot, level with her eye; pull: where the draw hand (and the nock) is - null: let go */
  const aimed = (pull, f = {}) => ({ arm: [X, Y, X + 6, Y - 2], stave: [X + 6, Y + 9, X + 6, Y - 13], ...(pull === null ? { arm2: [OFF[0], OFF[1], X - 5, Y - 1] } : { arm2: [OFF[0], OFF[1], X + pull, Y - 3], nock: [X + pull, Y - 3] }), ...f });
  const atBack = { stave: BB, arm2: [OFF[0], OFF[1], X - 4, Y + 3] };   /* the bow slung while the knife works */
  const slung = { stave: BB };
  const knife = (hx, hy, tx, ty, f = {}) => knightFrame({ ...atBack, arm: [X, Y, X + hx, Y + hy], sword: [X + hx, Y + hy, X + tx, Y + ty], ...f });
  const card = {
    idle: () => ((previewOnly === 'icon' ? BREATH.slice(0, 1) : BREATH).map(([dy, hy, sho, plume]) => knightFrame({ dy, hy, sho, plume, ...carry() }))),
    atk: () => ([
      () => knightFrame({ legs: 'wide', ...aimed(3), plume: 1 }),
      () => knightFrame({ legs: 'wide', sho: 1, ...aimed(-3), plume: 2 }),
      () => knightFrame({ wide: WIDE, legs: 'wide', ...aimed(null), plume: 2, bits: [o(15, -3, W2), o(17, -3, C)] }),
      () => knightFrame({ legs: 'wide', ...aimed(null), arm2: [OFF[0], OFF[1], X - 3, Y + 1], plume: 1 }),
      () => knightFrame({ legs: 'stand', ...carry(), plume: 0 }),
    ].map((make, i) => (previewOnly === 'weaponIcon' && i > 2) || (previewOnly === 'atk' && i > 2) ? null : make())),
  };
  if (previewOnly) return storeFrames(card, false, previewOnly, SMEAR_COL.steel);
  const F = {
    idle: card.idle(),
    run: [['run1', -1], ['run2', 0], ['run3', 1], ['run4', 0], ['run5', -1], ['run6', 0]].map(([l, dy, ], i) =>
      knightFrame({ legs: l, dy, dx: -1, plume: i % 3, arm: [X, Y, X + 2 + (i % 2) * 3, Y + 4 - (i % 2) * 3], arm2: [OFF[0], OFF[1], X - 5 + (i % 2) * 4, Y + 1 + ((i + 1) % 2) * 3], stave: BB })),   /* (upright, the arms pumping, the bow slung, the cloak streaming) */
    jump: [knightFrame({ legs: 'jump', dy: -1, arm: [X, Y, X + 4, Y - 3], arm2: [OFF[0], OFF[1], X - 5, Y], stave: BB, plume: 1 }),
      knightFrame({ legs: 'jump2', arm: [X, Y, X + 4, Y - 3], arm2: [OFF[0], OFF[1], X - 5, Y], stave: BB, plume: 1 })],
    fall: [knightFrame({ legs: 'fall', arm: [X, Y, X + 4, Y - 4], arm2: [OFF[0], OFF[1], X - 5, Y - 3], stave: BB, plume: 2 }),
      knightFrame({ legs: 'fall2', dy: -1, arm: [X, Y, X + 4, Y - 6], arm2: [OFF[0], OFF[1], X - 5, Y - 5], stave: BB, plume: 2 })],
    /* THE LANDING: a knee bent, the hands down for balance, the cloak settling after her */
    land: [knightFrame({ legs: 'crouch', legsDy: 2, dy: 2, arm: [X, Y, X + 4, Y + 4], arm2: [OFF[0], OFF[1], X - 3, Y + 4], stave: BB, plume: 2, bits: [o(5, 9, D), o(7, 9, D), o(3, 9, D)] }),
      knightFrame({ legs: 'land', dy: 1, ...carry(), plume: 0 }),
      knightFrame({ legs: 'stand', ...carry(), plume: 1 })],
    takeoff: knightFrame({ legs: 'push', dy: -1, sho: 1, arm: [X, Y, X + 3, Y - 5], arm2: [OFF[0], OFF[1], X - 5, Y + 1], stave: BB, plume: 2 }),
    apex: knightFrame({ legs: 'jump2', dy: -1, arm: [X, Y, X + 4, Y - 4], arm2: [OFF[0], OFF[1], X - 5, Y - 1], stave: BB, plume: 0 }),
    skid: knightFrame({ dx: -1, legs: 'wide', arm: [X, Y, X + 5, Y + 2], arm2: [OFF[0], OFF[1], X - 5, Y + 2], stave: BB, plume: 2 }),
    climb: [knightFrame({ legs: 'climbA', arm: [X, Y, X + 2, Y - 7], arm2: [OFF[0], OFF[1], X - 2, Y - 3], stave: BB, plume: 0 }),
      knightFrame({ legs: 'climbB', dy: 1, arm: [X, Y, X + 3, Y - 3], arm2: [OFF[0], OFF[1], X - 1, Y - 8], stave: BB, plume: 1 })],
    hurt: [knightFrame({ dx: -1, dy: 1, legs: 'fall', arm: [X, Y, X - 1, Y + 3], arm2: [OFF[0], OFF[1], X - 5, Y - 2], stave: BB, plume: 2 }),
      knightFrame({ dx: -2, dy: 2, legs: 'land', arm: [X, Y, X - 2, Y + 4], arm2: [OFF[0], OFF[1], X - 6, Y - 1], stave: BB, plume: 1 })],
    crouch: knightFrame({ dy: 3, legs: 'crouch', legsDy: 3, arm: [X, Y, X + 4, Y + 3], arm2: [OFF[0], OFF[1], X - 3, Y + 4], stave: BB, plume: 0 }),
    /* THE BUTT-SLIDE (src/slide.js): sat back on the ground, the legs run out in front, the bow slung short behind her, the cloak a second frame */
    slide: [0, 1].map(i => knightFrame({ dx: -3, dy: 3, legs: 'slide', legsDy: 3, plume: i * 2, arm: [X, Y, X - 2, Y + 4], arm2: [OFF[0], OFF[1], X - 3, Y + 3], stave: BS })),
  };
  F.atk = [knife(-2, -2, -5, -6, { dx: -1, legs: 'wide', plume: 1 }), knife(4, -1, 9, -2, { wide: 4, dx: 1, legs: 'runC', plume: 2 }), knife(6, 0, 12, 1, { wide: 6, dx: 2, legs: 'runC', plume: 2, bits: [o(13, 1, W2)] }), knife(4, 2, 8, 5, { wide: 4, dx: 1, legs: 'wide', plume: 0 }), knightFrame({ legs: 'stand', ...carry(), plume: 0 })];
  F.atkB = [knife(2, 3, -2, 6, { dx: -1, legs: 'wide', plume: 1 }), knife(5, 1, 10, -2, { wide: 4, dx: 1, legs: 'runC', plume: 2 }), knife(6, -1, 12, -4, { wide: 6, dx: 2, legs: 'runC', plume: 2, bits: [o(13, -4, W2)] }), knife(4, 0, 8, -3, { wide: 4, dx: 1, legs: 'wide', plume: 0 }), F.atk[4]];
  F.atkC = [knife(-1, -4, -3, -9, { dx: -1, legs: 'wide', sho: 1, plume: 1 }), knife(5, -3, 10, -1, { wide: 4, dx: 1, legs: 'runC', plume: 2 }), knife(7, 1, 13, 4, { wide: 6, dx: 2, dy: 1, legs: 'runC', plume: 2, bits: [o(14, 4, W2), o(12, 6, C)] }), knife(4, 3, 8, 7, { wide: 4, dx: 1, legs: 'wide', plume: 0 }), F.atk[4]];
  F.air = [knife(-3, -1, -7, -3, { legs: 'jump2', dy: -1, plume: 1 }), knife(4, 2, 9, 4, { wide: 4, legs: 'jump2', dy: -1, plume: 2 }), knife(5, -1, 11, -3, { wide: 6, legs: 'jump', dy: -1, plume: 2, bits: [o(12, -3, W2)] }), knife(3, -3, 6, -8, { wide: 4, legs: 'jump', plume: 1 }), F.jump[1]];
  F.follow = [knife(5, 3, 9, 7, { wide: 4, dx: 1, dy: 1, legs: 'wide', plume: 1 }), knife(3, 1, 6, -2, { dy: 1, plume: 0 })];
  /* THE KNIFE'S HEAVY (an empty quiver and X held): the blade reversed in the fist and driven in, her whole weight behind it */
  F.heavy = [knife(1, -5, 1, -10, { dy: -1, legs: 'wide', sho: 1, plume: 1 }), knife(6, 1, 12, 4, { wide: 6, dx: 2, legs: 'runC', plume: 2 }), knife(6, 3, 11, 8, { wide: 6, dx: 2, dy: 2, legs: 'wide', plume: 0, bits: [o(12, 8, W2), o(10, 9, D)] })];
  /* THE KNIFE'S DASH ATTACK (X early in a forward roll): the blade put out low as she comes up out of the roll */
  F.dashAtk = [knightFrame({ dx: 2, dy: 2, legs: 'push', ...atBack, arm: [X, Y, X + 2, Y + 3], sword: [X + 2, Y + 3, X + 6, Y + 6], plume: 2 }),
    knightFrame({ wide: 6, dx: 3, dy: 1, legs: 'runC', ...atBack, arm: [X, Y, X + 6, Y + 2], sword: [X + 6, Y + 2, X + 12, Y + 3], plume: 2, bits: [o(13, 3, W2)] }),
    knightFrame({ dx: 1, dy: 2, legs: 'land', ...carry(-2), plume: 0 })];
  /* HER FIDGET: she tries the string - the bow brought across her, a thumb across it twice, a look along the limb, and back to rest */
  { const pluck = (d, hy, bits) => knightFrame({ dy: d, hy, stave: [X - 9, Y - 4, X + 12, Y - 5], arm: [X, Y, X + 6, Y - 4], arm2: [OFF[0], OFF[1], X + 1, Y - 3], plume: d ? 2 : 1, bits });
    F.fidget = holdFrames([[F.idle[0], 2], [pluck(0, 0), 3], [pluck(0, 0, [o(2, -5, W2), o(8, -6, C)]), 2], [pluck(0, 1, [o(4, -3, C)]), 2], [pluck(1, 1, [o(7, -6, W2)]), 3], [pluck(0, 0), 2], [F.idle[0], 2]]); }
  /* HER DANCE (the dances lane's jig, hers: THE HUNTING HORN): the bow slung, the brass horn to her lips, a stamp on every call, and the notes going up over the wood */
  { const hornBits = [o(0, -3, BR), o(1, -3, BR), o(2, -3, BRD), o(3, -4, BR), o(4, -5, BR), o(5, -6, BRD), o(6, -7, BR), o(6, -8, BR), o(7, -8, BR), o(7, -6, BRD), o(7, -7, '#fff6c8')];
    const note = (x, y) => [o(x, y, C), o(x, y - 1, C), o(x + 1, y - 3, C)];
    const jig = (k, bits, dy, legs, plume) => knightFrame({ wide: 8, legs, dy, plume, arm: [X, Y, X + 2, Y - 3], arm2: [OFF[0], OFF[1], X + 1, Y - 3], ...slung, bits: [...hornBits, ...bits] });
    F.dance = holdFrames([jig(0, [], 0, 'wide', 0), jig(1, note(8, -11), 1, 'runC', 1), jig(2, note(10, -14), 0, 'wide', 2), jig(3, [...note(8, -11), ...note(12, -9)], 1, 'runC', 1), jig(4, note(11, -13), 0, 'wide', 0), jig(5, [...note(9, -12), ...note(13, -15)], 1, 'runC', 2)].map(f => [f, 2])); }
  /* dance2 = THE SIGHT, her idle solo: an arrow drawn from the quiver, turned in the fingers and checked along its length, nocked, sighted at the sky and let down - and the knife
     flicked into the air and caught. dance3 = THE VICTORY SHOT, a boss down: the bow flung up in both hands and a white-fletched arrow loosed at the sun, her foot planted, and a flourish */
  { const chk = (x2, y2, bits, o2 = {}) => knightFrame({ wide: 8, arm: [X, Y, X + x2, Y + y2], arm2: [OFF[0], OFF[1], X - 1, Y + 3], stave: [X + 7, Y + 8, X + 6, Y - 14], bits, ...o2 });
    const shaft = (a, b, c2, d2) => { const bits = []; const n = Math.max(Math.abs(c2 - a), Math.abs(d2 - b)); for (let i = 0; i <= n; i++) bits.push(o(Math.round(a + (c2 - a) * i / n), Math.round(b + (d2 - b) * i / n), i < 1 ? '#f0ead8' : i === n ? '#ffffff' : '#cfa86a')); return bits; };
    const sight = (hy, dxn, o2 = {}) => knightFrame({ wide: 8, hy, arm: [X, Y, X + 6, Y - 6], stave: [X + 3, Y - 2, X + 12, Y - 16], arm2: [OFF[0], OFF[1], X + dxn, Y - 5], nock: [X + dxn, Y - 5], legs: 'wide', ...o2 });
    const flick = (h) => knightFrame({ legs: 'stand', ...carry(), arm: [X, Y, X + 4, Y - 1], bits: [o(5, -h, '#c9d4e0'), o(5, -h - 1, '#ffffff'), o(6, -h - 1, '#8a6a42')] });
    F.dance2 = holdFrames([[F.idle[0], 2], [chk(3, -3, shaft(3, -5, 9, -5)), 3], [chk(4, -6, shaft(4, -8, 9, -12), { hy: -1 }), 3], [chk(2, -2, [], { dy: 0, hy: 1, sho: 1 }), 2], [sight(0, 1), 3], [sight(-1, -3), 4],
      [sight(0, -3, { plume: 2 }), 3], [knightFrame({ legs: 'stand', ...carry(), plume: 1 }), 2], [flick(4), 2], [flick(11), 2], [flick(15), 2], [flick(9), 2], [flick(3), 2], [F.idle[0], 2]]);
    const up = (arms, bits, legs, plume, o2 = {}) => knightFrame({ wide: 8, legs, plume, arm: [X, Y, X + arms[0], Y + arms[1]], arm2: [OFF[0], OFF[1], X + arms[2], Y + arms[3]], stave: [X + arms[4], Y + arms[5], X + arms[6], Y + arms[7]], bits, ...o2 });
    F.dance3 = holdFrames([[F.idle[0], 1], [up([4, -3, -2, -2, 3, 5, 5, -17], [], 'wide', 1), 2], [up([5, -7, -3, -7, 1, -3, 9, -18], [], 'jump2', 2, { dy: -1 }), 2],
      [up([5, -8, -3, -7, 1, -3, 9, -18], [o(10, -16, '#c9d4e0'), o(11, -18, '#ffffff'), o(9, -14, '#cfa86a')], 'wide', 2), 2], [up([5, -8, -3, -7, 1, -3, 9, -18], [o(11, -22, '#ffffff'), o(10, -20, '#cfa86a'), o(10, -19, '#cfa86a'), o(9, -26, '#fff6c8'), o(12, -24, '#fff6c8')], 'wide', 1), 3],
      [up([5, -8, -3, -7, 1, -3, 9, -18], [o(9, -29, '#fff6c8'), o(12, -27, C), o(7, -26, C), o(11, -30, '#ffd36b')], 'wide', 0), 3], [up([4, -5, -3, -4, 2, 3, 7, -17], [], 'wide', 1), 2], [up([4, 1, -3, 3, 3, 6, 6, -16], [], 'stand', 0), 2], [F.idle[0], 2]]); }
  /* HER SLUMP: the bow planted and her weight hung on it, the hood down on her chest */
  { const lean = (d, hy) => knightFrame({ dy: 1 + d, hy, sho: -1, legs: 'stand', plume: 0, arm: [X, Y, X + 6, Y - 2 + d], arm2: [OFF[0], OFF[1], X + 5, Y + 1 + d], stave: [X + 8, Y + 8, X + 7, Y - 12] });
    F.slump = [lean(0, 2), lean(1, 3)]; }
  /* HER SWIM: the bow slung along her back, the cloak floating out behind */
  { const S = swimRig(knightFrame, sh, { carry: { stave: BS }, tread: () => ({ stave: BS }) });
    F.swim = S.swim; F.tread = S.tread; }
  /* THE SHARED KEYS HERS STAND IN FOR: the plunge is her downward shot (rgDown), the block her bash (rgBash), a blast her mark and a cast the bow raised - set again below once those are drawn */
  F.plunge = F.jump[1]; F.block = [F.idle[0]]; F.cast = [F.idle[0]]; F.blast = [F.idle[0]]; F.roll = [F.idle[0]];
  const kmake = f => { if (f.sword) { const [a, b, c2, d2] = f.sword, L = Math.hypot(c2 - a, d2 - b) || 1, k = Math.min(1, 8 / L); f = { ...f, sword: [a, b, Math.round(a + (c2 - a) * k), Math.round(b + (d2 - b) * k)] }; } return knightFrame(f); };
  directionalPoses(F, 'sword', { make: kmake, extra: atBack });   /* her knife's rising cut, low sweep and air up-slash (the bow trailing in the off hand) */
  rgKitPoses(F, { BB, BS, X, Y, OFF, o, KF, aimed, carry, atBack, slung, knife, rgSpin, W2, C, GR, D, BR, BRD, GY, GYD });
  smearPass(F, SMEAR_COL.steel);   /* the strike beats get their arc (claude/herokeys) */
  const mirror = f => Array.isArray(f) ? f.map(flipX) : flipX(f);
  const R = F, L = {}; for (const k in F) L[k] = mirror(F[k]);
  const white = {}; for (const k in F) white[k] = Array.isArray(F[k]) ? F[k].map(c => whiten(c)) : whiten(F[k]);
  const whiteL = {}; for (const k in white) whiteL[k] = mirror(white[k]);
  KP = Object.assign({}, KP0); BODY_REF = BODY; PLUME_REF = PLUME;
  return { R, L, white: { R: white, L: whiteL }, ...KNIGHT_ANCHOR, ay: KNIGHT_ANCHOR.ay + ATTACK_HEADROOM };
}
/* HER OWN KEYS (rgKitPoses): THE DRAW, THE LOOSE, the quick and air shots, the rising shot, the downward shot (her plunge), the BOW-BASH and her parry, the SNARE, the MARK, the BACKFLIP and the
   forward roll, and EVERY ACTIVE'S OWN WINDUP AND RELEASE (B16 CAST POSES: two frames each, never a shared lean). Built with the headroom the bow needs over her hood. */
function rgKitPoses(F, h) {
  const { BB, BS, X, Y, OFF, o, KF, aimed, carry, atBack, slung, knife, rgSpin, W2, C, GR, D, BR, BRD, GY, GYD } = h;
  /* a straight line of loose pixels (an arrow in flight, a cord, a puff's tail) from (a,b) to (c,d), shoulder-relative; col(i,n) gives each pixel's colour */
  const ln = (a, b, c2, d2, col) => { const bits = [], n = Math.max(Math.abs(c2 - a), Math.abs(d2 - b), 1); for (let i = 0; i <= n; i++) bits.push(o(Math.round(a + (c2 - a) * i / n), Math.round(b + (d2 - b) * i / n), col(i, n))); return bits; };
  const shaft = (a, b, c2, d2) => ln(a, b, c2, d2, (i, n) => i === n ? '#ffffff' : i === n - 1 ? '#c9d4e0' : i === 0 ? '#c9352a' : i === 1 ? '#f0ead8' : '#cfa86a');   /* a whole arrow: fletching, shaft, head */
  /* THE DRAW (X held, rooted): she nocks, draws to the chest, and comes to full at the cheek - three beats */
  F.windup = [KF({ legs: 'wide', ...aimed(5), plume: 1 }), KF({ legs: 'wide', ...aimed(0), plume: 2 }), KF({ legs: 'wide', sho: 1, ...aimed(-3), plume: 2, bits: [o(14, -3, C), o(15, -3, W2)] })];
  /* THE LOOSE: the string snapped straight, the draw hand flown back past her ear, the bow arm held and the arrow gone out of it */
  F.rgLoose = [KF({ wide: 8, legs: 'wide', ...aimed(null), plume: 2, bits: [o(13, -2, W2), o(16, -2, C), o(10, -3, '#efe8d0')] }), KF({ legs: 'wide', ...aimed(null), arm2: [OFF[0], OFF[1], X - 3, Y + 1], plume: 1 })];
  /* THE QUICK SHOT: a half draw and gone (on her feet, and in the air) */
  F.rgShot = [KF({ legs: 'runC', ...aimed(2), plume: 1 }), KF({ wide: 8, legs: 'wide', ...aimed(null), plume: 2, bits: [o(14, -2, W2)] })];
  F.rgAirShot = [KF({ legs: 'jump2', dy: -1, ...aimed(2), plume: 1 }), KF({ wide: 8, legs: 'jump', dy: -1, ...aimed(null), plume: 2, bits: [o(14, -2, W2)] })];
  /* THE RISING SHOT: the bow brought up flat over her head, belly up, the string drawn down to her chin - and the arrow gone up */
  { const up = { stave: [X + 10, Y - 8, X - 6, Y - 11], arm: [X, Y, X + 3, Y - 8] };
    F.rgRise = [KF({ legs: 'wide', sho: 1, ...up, arm2: [OFF[0], OFF[1], X + 1, Y - 4], nock: [X + 2, Y - 4], plume: 1 }),
      KF({ legs: 'wide', ...up, arm2: [OFF[0], OFF[1], X - 3, Y - 2], plume: 2, bits: [...shaft(3, -13, 4, -20), o(2, -22, C)] })]; }
  /* THE DOWNWARD SHOT (her plunge): tucked over the bow, held flat under her, the arrow loosed straight down - and the hop up off it */
  { const dn = { stave: [X - 8, Y + 6, X + 10, Y + 6], arm: [X, Y, X + 1, Y + 6] };
    F.rgDown = [KF({ legs: 'tuck', hy: 1, ...dn, arm2: [OFF[0], OFF[1], X + 1, Y + 1], nock: [X + 1, Y + 1], plume: 2 }),
      KF({ legs: 'jump', dy: -2, ...dn, arm2: [OFF[0], OFF[1], X - 3, Y - 2], plume: 1, bits: [...shaft(1, 11, 1, 18), o(1, 20, C)] })]; }
  /* THE BOW-BASH (C): the bow drawn in to her chest in both hands, then shoved out flat like a bar; on the beat (her PARRY) it rings */
  F.rgBash = [KF({ legs: 'wide', dx: -1, arm: [X, Y, X + 3, Y - 2], arm2: [OFF[0], OFF[1], X + 2, Y - 4], stave: [X + 4, Y + 9, X + 4, Y - 13], plume: 1 }),
    KF({ wide: 6, legs: 'runC', dx: 2, arm: [X, Y, X + 8, Y - 2], arm2: [OFF[0], OFF[1], X + 7, Y - 5], stave: [X + 10, Y + 9, X + 11, Y - 13], plume: 2, bits: [o(13, -4, GR), o(13, 2, GR), o(14, -1, C)] })];
  /* THE SNARE (DOWN+C): down on one knee, the peg turned in her fingers with the cord looped about it - then driven into the turf and the open loop laid at her feet */
  F.rgSnare = [KF({ dy: 3, legs: 'kneel', arm: [X, Y, X + 5, Y + 6], ...atBack, plume: 1, bits: [o(6, 7, '#6a5236'), o(7, 8, D), o(8, 7, D), o(6, 9, D)] }),
    KF({ dy: 3, legs: 'kneel', arm: [X, Y, X + 6, Y + 8], ...atBack, plume: 0, bits: [o(6, 10, '#6a5236'), o(6, 9, '#6a5236'), o(4, 11, D), o(5, 12, D), o(7, 12, D), o(8, 12, D), o(9, 11, D), o(8, 10, D)] })];
  /* HER STANCE SWAP (claude/rangerhud, Daniel 10-23): to the KNIFE - the free hand reaches back and slings the bow, then the knife comes out ahead; to the BOW - the knife away, the bow swung round into the off hand */
  F.rgSling = [KF({ legs: 'wide', dx: -1, stave: BB, arm: [X, Y, X - 2, Y - 4], arm2: [OFF[0], OFF[1], X - 3, Y - 6], plume: 1 }), knife(5, 0, 10, -2, { wide: 4, legs: 'wide', plume: 2 })];
  F.rgBowUp = [KF({ legs: 'wide', dx: -1, ...atBack, arm: [X, Y, X + 2, Y + 4], plume: 1 }), KF({ wide: 4, legs: 'wide', ...carry(), arm: [X, Y, X + 4, Y - 1], arm2: [OFF[0], OFF[1], X + 2, Y - 4], plume: 2 })];
  /* THE MARK (UP+C, her focus spent): a hand raised to shade her eyes, the bow held at her side - then the arm thrown out at the quarry, two fingers pointing and a red tick leaping from them */
  F.rgMark = [KF({ legs: 'wide', ...carry(), arm: [X, Y, X + 4, Y - 3], arm2: [OFF[0], OFF[1], X + 2, Y - 7], plume: 1, bits: [o(3, -8, GR)] }),
    KF({ wide: 8, legs: 'wide', sho: 1, stave: BB, arm: [X, Y, X + 4, Y - 1], arm2: [OFF[0], OFF[1], X + 9, Y - 4], plume: 2, bits: [o(11, -5, '#ff7a5a'), o(12, -6, '#ff7a5a'), o(14, -7, '#ffd0c0'), o(12, -3, '#ff7a5a')] })];
  /* THE HAWK: the gauntlet raised with the bird on it, wings half open - then the arm flung up and out, the bird away off the fist in a scatter of feathers */
  const hawk = (x, y, wing) => [o(x, y, '#5a3a20'), o(x + 1, y, '#8a5a30'), o(x + 2, y - 1, '#8a5a30'), o(x, y - 1, '#6a4426'), o(x + 3, y, '#e8c860'), o(x - 1, y + 1, '#c9a070'), ...(wing ? [o(x - 1, y - 2, '#6a4426'), o(x - 2, y - 3, '#8a5a30'), o(x + 2, y - 3, '#8a5a30'), o(x + 3, y - 4, '#6a4426')] : [o(x - 1, y - 1, '#8a5a30')])];
  F.rgHawkPose = [KF({ legs: 'wide', stave: BB, arm: [X, Y, X + 5, Y - 3], arm2: [OFF[0], OFF[1], X + 1, Y - 7], plume: 1, bits: hawk(0, -10, false) }),
    KF({ wide: 10, legs: 'wide', sho: 1, stave: BB, arm: [X, Y, X + 5, Y - 3], arm2: [OFF[0], OFF[1], X + 6, Y - 9], plume: 2, bits: [...hawk(10, -14, true), o(5, -10, '#c9a070'), o(7, -12, '#c9a070'), o(3, -12, '#8a5a30')] })];
  /* LEAP BACK: down in a crouch with the bow tucked and the knee loaded, a shot at her feet - then up and away, the bow thrown out ahead of her and the cloak whipping */
  F.rgLeapPose = [KF({ dy: 3, legs: 'crouch', legsDy: 3, hy: 1, arm: [X, Y, X + 5, Y + 1], arm2: [OFF[0], OFF[1], X - 1, Y + 3], stave: BB, plume: 2, bits: [o(-3, 9, D), o(-5, 9, D)] }),
    KF({ dx: -2, dy: -3, legs: 'jump2', sho: 1, arm: [X, Y, X + 8, Y - 2], arm2: [OFF[0], OFF[1], X + 5, Y - 1], stave: BB, plume: 2, bits: [o(9, 0, '#fff6c8'), o(10, 1, W2)] })];
  /* VOLLEY: three arrows nocked in a fan, the string at her cheek - then all three away */
  F.rgVolleyPose = [KF({ legs: 'wide', ...aimed(-1), plume: 1, bits: [o(8, -6, '#cfa86a'), o(9, -7, '#c9d4e0'), o(8, 0, '#cfa86a'), o(9, 1, '#c9d4e0')] }),
    KF({ wide: 10, legs: 'wide', ...aimed(null), plume: 2, bits: [...shaft(10, -9, 16, -13), ...shaft(11, -3, 18, -3), ...shaft(10, 3, 16, 7)] })];
  /* THE BEAR TRAP: a toothed iron trap lifted from the belt, jaws sprung open in both hands - then lobbed underhand, the arm swung through and the trap tumbling out ahead */
  const trap = (x, y, open) => [...[0, 1, 2, 3, 4].map(i => o(x + i, y, '#6a727e')), ...[0, 2, 4].map(i => o(x + i, y - (open ? 2 : 1), '#c9d4e0')), ...(open ? [o(x, y - 1, '#8a96a8'), o(x + 4, y - 1, '#8a96a8')] : []), o(x + 2, y + 1, '#4a4e56')];
  F.rgTrapPose = [KF({ dy: 2, legs: 'wide', stave: BB, arm: [X, Y, X + 2, Y + 5], arm2: [OFF[0], OFF[1], X + 3, Y + 5], plume: 1, bits: trap(2, 3, true) }),
    KF({ wide: 10, dx: 1, legs: 'runC', stave: BB, arm: [X, Y, X + 8, Y + 3], arm2: [OFF[0], OFF[1], X - 4, Y + 1], plume: 2, bits: trap(10, 0, true) })];
  /* ARROW RAIN: the bow tipped up at the sky and drawn - then loosed, a spray of shafts going up and the string humming */
  { const sky = { stave: [X + 11, Y - 3, X - 2, Y - 15], arm: [X, Y, X + 3, Y - 7] };
    F.rgRainPose = [KF({ legs: 'wide', sho: 1, ...sky, arm2: [OFF[0], OFF[1], X, Y - 3], nock: [X, Y - 3], plume: 1 }),
      KF({ wide: 8, legs: 'wide', ...sky, arm2: [OFF[0], OFF[1], X - 4, Y - 1], plume: 2, bits: [...shaft(5, -16, 6, -22), ...shaft(8, -14, 11, -19), ...shaft(2, -15, 1, -21), o(6, -24, C)] })]; }
  /* SMOKE ARROW: a pitch-wrapped head dipped in the powder and nocked, grey already curling off it - then shot, a puff at the string */
  F.rgSmokePose = [KF({ legs: 'wide', ...aimed(1), plume: 1, bits: [o(14, -4, GY), o(15, -5, GYD), o(13, -5, GY), o(15, -3, GYD)] }),
    KF({ wide: 10, legs: 'wide', ...aimed(null), plume: 2, bits: [o(15, -4, GY), o(16, -6, GYD), o(18, -5, GY), o(17, -3, GYD), o(8, -6, GY), o(7, -7, GYD)] })];
  /* SECOND QUIVER: a hand reaching back over her shoulder into the quiver, the bow in the other - then a fresh sheaf drawn out and held up, the fletchings white and red */
  F.rgRefillPose = [KF({ legs: 'stand', stave: BB, arm: [X, Y, X + 5, Y - 3], arm2: [OFF[0], OFF[1], X - 6, Y - 5], plume: 1 }),
    KF({ legs: 'stand', sho: 1, stave: BB, arm: [X, Y, X + 5, Y - 3], arm2: [OFF[0], OFF[1], X - 5, Y - 9], plume: 2, bits: [o(-6, -12, '#f0ead8'), o(-4, -12, '#c9352a'), o(-5, -13, '#f0ead8'), o(-5, -11, '#cfa86a'), o(-4, -10, '#cfa86a'), o(-6, -10, '#cfa86a'), o(-2, -13, C)] })];
  /* HEARTSEEKER: down on a knee, ONE long black arrow drawn to her ear, an eye shut - then loosed, the black shaft with a red head leaving a line of dark behind it */
  F.rgHeartPose = [KF({ dy: 2, legs: 'kneel', ...aimed(-4), plume: 2, bits: [o(10, -3, '#2a2420'), o(8, -3, '#2a2420')] }),
    KF({ wide: 14, dy: 2, legs: 'kneel', ...aimed(null), plume: 1, bits: [...ln(11, -3, 20, -3, (i, n) => i === n ? '#c9352a' : '#2a2420'), o(9, -3, '#5a5a66')] })];
  /* THE WILD HUNT: the brass horn to her lips and the bow slung - then thrown up, a red wind off the bell of it in rings */
  const horn = (x, y, up) => [o(x, y, BR), o(x + 1, y, BR), o(x + 2, y - 1, BRD), o(x + 3, y - 2, BR), o(x + 4, y - 3 - (up ? 1 : 0), BR), o(x + 4, y - 2 - (up ? 1 : 0), BRD), o(x + 5, y - 4 - (up ? 1 : 0), BR)];
  F.rgHuntPose = [KF({ legs: 'wide', arm: [X, Y, X + 2, Y - 3], arm2: [OFF[0], OFF[1], X + 1, Y - 3], ...slung, plume: 1, bits: horn(0, -3, false) }),
    KF({ wide: 14, legs: 'wide', sho: 1, hy: -1, arm: [X, Y, X + 3, Y - 4], arm2: [OFF[0], OFF[1], X + 2, Y - 4], ...slung, plume: 2, bits: [...horn(1, -4, true), o(8, -9, '#ff7a5a'), o(10, -10, '#ff7a5a'), o(11, -8, '#ff7a5a'), o(13, -10, '#ffb09a'), o(12, -13, '#ff7a5a'), o(9, -12, '#ff7a5a')] })];
  /* the shared keys hers stand in for: the plunge is her downward shot, the block her bash, a blast her mark and a cast the bow raised */
  F.plunge = F.rgDown[0]; F.block = F.rgBash; F.blast = F.rgMark; F.cast = F.rgMark;
  /* THE BACKFLIP (main.js plays F.rgFlip over the dodge: she goes up and over BACKWARDS, away from what she faces, the bow clutched to her chest) - four beats: the coil, then three quarter
     turns head over heels the way she is going (counter-clockwise on the page), the cloak whipping round her */
  { const tuck = (o2 = {}) => KF({ legs: 'tuck', dy: 1, arm: [X, Y, X + 4, Y + 2], arm2: [OFF[0], OFF[1], X + 2, Y + 1], stave: BS, plume: 2, ...o2 });
    F.rgFlip = [KF({ dx: -1, dy: 3, legs: 'crouch', legsDy: 3, hy: 1, sho: 1, arm: [X, Y, X + 4, Y + 2], arm2: [OFF[0], OFF[1], X + 2, Y + 3], stave: BS, plume: 2 }),
      rgSpin(tuck({ bits: [o(-3, 9, D)] }), 3), rgSpin(tuck({ plume: 1 }), 2), rgSpin(tuck({ plume: 0, bits: [o(8, 9, D)] }), 1)];
    /* THE FORWARD ROLL (a way held toward her face): tucked over the bow, a full turn clockwise */
    const ball = (o2 = {}) => KF({ legs: 'crouch', dy: 4, arm: [X, Y, X + 3, Y + 3], arm2: [OFF[0], OFF[1], X + 1, Y + 2], stave: BS, plume: 1, ...o2 });
    F.roll = [0, 1, 2, 3].map(q => rgSpin(ball(), q)); }
  /* CROUCH TO RESTOCK (claude/rangertune wires the state; pose keys rgRestock0/1/2, also the array rgRestock): crouched low and still, (0) a hand to the leather HIP POUCH, (1) a fresh arrow drawn and its fletching checked
     in the air before her eye, (2) the arrow slid into the quiver over her shoulder with a spark of cream at its mouth */
  { const pouch = [o(-1, 5, '#6a4426'), o(0, 5, '#8a6a42'), o(-1, 6, '#4a2e18'), o(0, 6, '#6a4426'), o(-2, 5, '#c9a84a')];
    const low = (o2 = {}) => KF({ dy: 3, legs: 'crouch', legsDy: 3, stave: BB, ...o2 });
    F.rgRestock0 = low({ arm: [X, Y, X + 1, Y + 6], arm2: [OFF[0], OFF[1], X - 4, Y + 4], plume: 1, bits: [...pouch, o(2, 5, '#cfa86a'), o(3, 4, '#f0ead8')] });
    F.rgRestock1 = low({ sho: 1, arm: [X, Y, X + 4, Y + 1], arm2: [OFF[0], OFF[1], X - 4, Y + 4], plume: 2, bits: [...pouch, ...shaft(3, 0, 9, -3), o(10, -4, '#ffffff')] });
    F.rgRestock2 = low({ sho: 1, hy: 1, arm: [X, Y, X + 2, Y + 4], arm2: [OFF[0], OFF[1], X - 7, Y - 5], plume: 0, bits: [...pouch, o(-7, -8, '#cfa86a'), o(-7, -9, '#f0ead8'), o(-5, -9, '#ffffff'), o(-8, -11, '#fff6c8'), o(-4, -11, '#fff6c8'), o(-6, -12, '#ffffff')] });
    F.rgRestock = [F.rgRestock0, F.rgRestock1, F.rgRestock2]; }
  /* THE PARRY AND THE RIPOSTE ARROW (the shared key names): drawn in riposteKit('ranger') below */
  /* ==== HERO PASS A ART (claude/heropassaart). ARROW SNATCH: CATCH - the bow flung out of the way and the free hand shot straight out ahead with a seed's arrow closed in the fingers and a gold star off the fist; HELD - the hand
     drawn back with it, the arrow already across the string. KNEELING DRAW: down on one knee with the bow held LEVEL and low, the draw hand coming back along the ground-line of the shot in three beats (a quieter
     body than the standing draw: no rise on the toes, the cloak pooled behind her) ==== */
  F.rgSnatch = [KF({ legs: 'wide', dx: 1, ...carry(), arm: [X, Y, X + 2, Y + 4], arm2: [OFF[0], OFF[1], X + 8, Y - 3], plume: 2, bits: [...shaft(8, -3, 16, -4), o(18, -4, C), o(19, -4, W2), o(17, -6, C), o(17, -2, C), o(20, -3, GR)] }),
    KF({ legs: 'wide', ...aimed(2), plume: 1, bits: [o(5, -4, GR), o(4, -6, C), o(2, -6, W2)] })];
  F.rgKneelDraw = [KF({ dy: 3, legs: 'kneel', ...aimed(5, { stave: [X + 6, Y + 8, X + 6, Y - 12] }), plume: 1 }),
    KF({ dy: 3, legs: 'kneel', ...aimed(0, { stave: [X + 7, Y + 8, X + 7, Y - 12] }), plume: 2, bits: [o(9, 12, D), o(5, 13, D)] }),
    KF({ dy: 3, hy: 1, sho: 1, legs: 'kneel', ...aimed(-3, { stave: [X + 7, Y + 8, X + 7, Y - 12] }), plume: 0, bits: [o(14, -3, C), o(15, -3, W2), o(9, 12, D), o(5, 13, D), o(3, 12, GR)] })];
  /* ==== THE THREE-TIER DRAW (claude/chargetiers, greybox - the art lane redraws): held past the full draw (the windup's last beat = T1 THE LONG SHOT) her body changes with the shot.
     T2 THE PIERCING SHOT - rgDraw2: drawn PAST the ear, elbow high, the bow upright and dead level, the head glinting green; two beats, a held tremble.
     T3 THE TRIPLE SHOT - rgDraw3: down in a wide braced stance, the bow canted forward, THREE arrows nocked in a tight fan drawn right back past her ear, amber heads; two beats.
     Kneeling: rgKneelDraw2 / rgKneelDraw3, the same on one knee. LOOSES: rgLoose2 the piercing shot's flat snap (the draw hand flung straight back, a green line out of the bow);
     rgLoose3 the triple shot's heavy follow-through (rocked back a step on the recoil, the bow arm kicked up, three amber streaks off the string) ==== */
  { const G2 = '#9fdc6a', G2L = '#dfffb0', AM = '#ffb84a', AML = '#ffd68a', IR = '#3a3e46';
    const lvl = { stave: [X + 6, Y + 9, X + 6, Y - 13] }, cant = { stave: [X + 8, Y + 8, X + 4, Y - 13] };
    F.rgDraw2 = [KF({ legs: 'wide', sho: 1, hy: -1, ...aimed(-5, lvl), plume: 2, bits: [o(8, -3, G2), o(9, -3, G2L), o(7, -4, G2)] }),
      KF({ legs: 'wide', sho: 1, hy: -1, ...aimed(-5, lvl), plume: 1, bits: [o(8, -3, G2L), o(9, -3, W2), o(9, -4, G2)] })];
    F.rgDraw3 = [KF({ dy: 1, legs: 'wide', wide: 8, sho: 1, ...aimed(-6, cant), plume: 2, bits: [o(8, -5, AM), o(9, -5, AML), o(8, -3, AM), o(9, -3, AML), o(8, -1, AM), o(9, -1, AML)] }),
      KF({ dy: 1, legs: 'wide', wide: 8, sho: 1, ...aimed(-7, cant), plume: 1, bits: [o(8, -5, AM), o(9, -5, AML), o(8, -3, AM), o(10, -3, W2), o(8, -1, AM), o(9, -1, AML)] })];
    const kst = { stave: [X + 7, Y + 8, X + 7, Y - 12] };
    F.rgKneelDraw2 = [KF({ dy: 3, hy: 1, sho: 1, legs: 'kneel', ...aimed(-5, kst), plume: 0, bits: [o(8, -3, G2), o(9, -3, G2L), o(9, 12, D), o(5, 13, D)] }),
      KF({ dy: 3, hy: 1, sho: 1, legs: 'kneel', ...aimed(-5, kst), plume: 1, bits: [o(8, -3, G2L), o(9, -3, W2), o(9, 12, D), o(5, 13, D)] })];
    F.rgKneelDraw3 = [KF({ dy: 3, hy: 1, sho: 1, legs: 'kneel', ...aimed(-7, kst), plume: 0, bits: [o(8, -6, AM), o(9, -6, AML), o(8, -4, AM), o(9, -4, AML), o(8, -2, AM), o(9, -2, AML), o(9, 12, D), o(5, 13, D), o(3, 12, GR)] }),
      KF({ dy: 3, hy: 1, sho: 1, legs: 'kneel', ...aimed(-7, kst), plume: 1, bits: [o(8, -6, AM), o(9, -6, AML), o(8, -4, AM), o(10, -4, W2), o(8, -2, AM), o(9, -2, AML), o(9, 12, D), o(5, 13, D)] })];
    F.rgLoose2 = [KF({ wide: 12, legs: 'wide', ...aimed(null, lvl), arm2: [OFF[0], OFF[1], X - 7, Y - 3], plume: 2, bits: [...ln(9, -3, 17, -3, (i, n) => i === n ? W2 : i % 2 ? G2 : G2L)] }),
      KF({ legs: 'wide', ...aimed(null, lvl), arm2: [OFF[0], OFF[1], X - 5, Y - 1], plume: 1, bits: [o(15, -3, G2), o(17, -3, G2L)] })];
    F.rgLoose3 = [KF({ wide: 12, dx: -1, dy: 1, legs: 'wide', ...aimed(null, { stave: [X + 7, Y + 7, X + 6, Y - 15], arm: [X, Y, X + 6, Y - 4] }), arm2: [OFF[0], OFF[1], X - 7, Y + 1], plume: 2, bits: [o(13, -5, AM), o(15, -6, AML), o(13, -3, AM), o(16, -3, W2), o(13, -1, AM), o(15, 0, AML)] }),
      KF({ dx: -1, legs: 'wide', ...aimed(null, cant), arm2: [OFF[0], OFF[1], X - 4, Y + 2], plume: 1, bits: [o(15, -4, AM), o(17, -3, AML)] })]; }
  riposteKit(F, 'ranger', KF, { X, Y, OFF, aimed, knife });
}
/* ==== THE GEOMANCER (2026-09-24, docs/briefs/geomancer.md). A hood and a stone mantle, and (round 3) a TALL STAFF with an amber geode.
   The silhouette read, against everyone else on the knight's rig: a pointed moss-green HOOD (not a helm, not a brim), a
   MANTLE of rough stones on both shoulders that makes her the widest thing at shoulder height in the cast, and the short
   thick stave laid diagonally over the body with a standing stone for its head. The Pyromancer holds a thin staff upright
   in one hand and POINTS it; this one is two-handed, crossways, and every spell of hers starts with the iron BUTT struck
   into the ground (the heavy, block and blast frames), which is the pose that must read at sixteen pixels. ==== */
/* A GEOMANCER, NOT A RECOLOURED MAGE (2026-09-24, the rework's sprite item: Daniel played her and she read as a small brown
   monk with a club). Three things now say STONE at game scale, none of them a colour a mage or a goblin wears:
   - a SLATE-GREY ROBE and hood, cool and dark, so the stone on her is the lightest thing about her;
   - two RUNE-CARVED STONE PLATES on her shoulders, standing up past the line of her jaw like a pair of standing stones - the
     widest, squarest thing at shoulder height in the cast, pale worked stone with a moss crown and an amber rune cut in each;
   - the standing-stone STAVE, and grit and pebbles that lift off the ground and float round her while she casts (geomancer.js). */
const GEO_BODY = [
  '...BBB....',     /* 0  the peak of the hood */
  '..BbbbB...',     /* 1 */
  '.BbbbbbB..',     /* 2 */
  '.Bbvvvvb..',     /* 3  the hood's mouth, in shadow */
  '.Bbvvkkb..',     /* 4  her face lit on the side she faces */
  'hmBbkkbmh.',     /* 5  the jaw - and the crowns of THE PLATES beside it, moss on their inner edge */
  'ggBbbbBgg.',     /* 6  THE PLATES: a squared stone on each shoulder */
  'gyBbbbBgy.',     /* 7  the rune cut in each, amber */
  'GGSbbbSGG.',     /* 8  their shadowed foot, the sleeves under them */
  '..BbbbB...',     /* 9 */
  '.wywwyw...',     /* 10 the belt, studded with amber */
];
const GEO_PLUME = [
  ['...BBB....', '..BbbbB...', '.BbbbbbB..'],
  ['..BBB.....', '..BbbbB...', '.BbbbbbB..'],   /* the peak of the hood falls back a pixel as she breathes */
  ['...BB.....', '.BBbbbB...', '.BbbbbbB..'],
];
/* THE HOOD IS GREY-BROWN HOMESPUN (2026-09-24, POLISH). It was moss green, and at game scale a green hood round a small face
   is exactly what a GOBLIN is in this game - the goblins are green. The moss stays, on the mantle's stones (m), in the stave's
   rune and on its crown; the hood and robe are undyed wool, so the one green thing on her head is gone and the face reads human. */
/* (2026-09-24, THE REWORK: the robe goes SLATE - b/B, sleeves and legs S/w - and the plates g/G/h are the pale worked stone) */
const GEO_PAL = { s: '#8f928c', S: '#4e514d', b: '#6d706b', B: '#353735', m: '#6f9a4a', r: '#e0a040', k: '#cfa47c', w: '#5a5a54', W: '#2e2a24', y: '#e8a83a', v: '#18181c', g: '#aaa694', G: '#67645a', h: '#d6d1bc' };
export function bakeGeomancer(skin = {}, previewOnly = false) {
  KP = Object.assign({}, KP0, GEO_PAL, skin); BODY_REF = GEO_BODY; PLUME_REF = GEO_PLUME;
  const sh = [BX + 8, BY + 7], [X, Y] = sh, OFF = [BX + 2, BY + 7], WIDE = 12;
  const o = (x, y, col) => [X - BX + x, Y - BY + y, col];
  const A = '#e8a83a', D = '#c9b27c', M = '#8c8a7e';
  /* AT GUARD (round 3): the TALL STAFF held nearly upright at her lead side, butt by her front foot and the geode up over her hood, the
     lead hand high on it and the off hand low (it was a short stave laid across her, which read as a club) */
  const guard = (d = 0) => ({ stave: [X + 1, Y + 8 + d, X + 4, Y - 12 + d], arm: [X, Y, X + 2, Y - 2 + d], arm2: [OFF[0], OFF[1], X + 1, Y + 3 + d] });
  const card = {
    idle: () => ((previewOnly === 'icon' ? BREATH.slice(0, 1) : BREATH).map(([dy, hy, sho, plume]) => knightFrame({ dy, hy, sho, plume, ...guard(-dy) }))),
    atk: () => ([
      () => knightFrame({ dx: -1, dy: 1, legs: 'wide', arm: [X, Y, X - 1, Y - 3], arm2: [OFF[0], OFF[1], X - 3, Y - 1], stave: [X + 2, Y + 4, X - 7, Y - 10], plume: 1 }),
      () => knightFrame({ wide: WIDE, dx: 1, legs: 'runC', arm: [X, Y, X + 2, Y - 4], arm2: [OFF[0], OFF[1], X - 1, Y - 2], stave: [X - 2, Y + 2, X + 7, Y - 12], plume: 2 }),
      () => knightFrame({ wide: WIDE, dx: 2, legs: 'runC', arm: [X, Y, X + 5, Y], arm2: [OFF[0], OFF[1], X + 1, Y], stave: [X - 3, Y - 1, X + 15, Y + 2], plume: 2, bits: [o(18, 4, M), o(18, 0, M)] }),
      () => knightFrame({ wide: WIDE, dx: 1, legs: 'wide', arm: [X, Y, X + 4, Y + 2], arm2: [OFF[0], OFF[1], X, Y + 2], stave: [X - 2, Y - 3, X + 13, Y + 7], plume: 0 }),
      () => knightFrame({ legs: 'stand', ...guard(), plume: 0 }),
    ].map((make, i) => (previewOnly === 'weaponIcon' && i > 2) || (previewOnly === 'atk' && i > 2) ? null : make())),
  };
  if (previewOnly) return storeFrames(card, false, previewOnly, SMEAR_COL.stone);
  const F = {
    idle: card.idle(),
    run: [['run1', -1], ['run2', 0], ['run3', 1], ['run4', 0], ['run5', -1], ['run6', 0]].map(([l, dy], i) =>
      knightFrame({ legs: l, dy, plume: i % 3, arm: [X, Y, X + 2, Y - 1], arm2: [OFF[0], OFF[1], X, Y + 3], stave: [X - 1, Y + 8, X + 4, Y - 12] })),   /* (the staff carried upright, leaning into the run) */
    jump: [knightFrame({ legs: 'jump', dy: -1, arm: [X, Y, X + 1, Y - 3], arm2: [OFF[0], OFF[1], X - 1, Y + 2], stave: [X - 2, Y + 7, X + 4, Y - 11], plume: 1 }),
      knightFrame({ legs: 'jump2', arm: [X, Y, X + 1, Y - 3], arm2: [OFF[0], OFF[1], X - 1, Y + 2], stave: [X - 3, Y + 6, X + 5, Y - 12], plume: 1 })],
    fall: [knightFrame({ legs: 'fall', arm: [X, Y, X + 2, Y - 2], arm2: [OFF[0], OFF[1], X - 1, Y + 1], stave: [X - 4, Y + 5, X + 5, Y - 12], plume: 2 }),
      knightFrame({ legs: 'fall2', dy: -1, arm: [X, Y, X + 2, Y - 3], arm2: [OFF[0], OFF[1], X - 1, Y], stave: [X - 4, Y + 4, X + 6, Y - 12], plume: 2 })],
    /* THE LANDING is heavy: the butt jarred into the ground as she comes down on it, the settle, and up */
    land: [knightFrame({ legs: 'crouch', legsDy: 3, dy: 4, arm: [X, Y, X + 3, Y + 1], arm2: [OFF[0], OFF[1], X, Y + 3], stave: [X + 5, Y + 5, X + 1, Y - 12], plume: 2, bits: [o(5, 9, D), o(7, 9, D), o(3, 9, D)] }),
      knightFrame({ legs: 'land', dy: 2, ...guard(1), plume: 0 }),
      knightFrame({ legs: 'stand', dy: 1, ...guard(), plume: 1 })],
    takeoff: knightFrame({ legs: 'push', dy: -2, sho: 1, arm: [X, Y, X + 1, Y - 4], arm2: [OFF[0], OFF[1], X, Y + 2], stave: [X - 1, Y + 8, X + 4, Y - 11], plume: 2 }),
    apex: knightFrame({ legs: 'jump2', dy: -1, arm: [X, Y, X + 2, Y - 3], arm2: [OFF[0], OFF[1], X - 1, Y + 1], stave: [X - 3, Y + 5, X + 5, Y - 12], plume: 0 }),
    skid: knightFrame({ dx: -2, legs: 'wide', arm: [X, Y, X + 3, Y + 2], arm2: [OFF[0], OFF[1], X + 1, Y + 3], stave: [X - 5, Y - 6, X + 6, Y + 8], plume: 2 }),
    climb: [knightFrame({ legs: 'climbA', arm: [X, Y, X + 2, Y - 7], stave: [X + 3, Y + 6, X - 6, Y - 8], plume: 0 }),
      knightFrame({ legs: 'climbB', dy: 1, arm: [X, Y, X + 3, Y - 3], stave: [X + 3, Y + 7, X - 6, Y - 7], plume: 1 })],
    atk: card.atk(),
    /* STONEFALL: she comes down on the butt like a boulder, the stave straight down under her boots */
    plunge: knightFrame({ legs: 'fall2', dx: -1, arm: [X, Y, X, Y + 4], arm2: [OFF[0], OFF[1], X - 1, Y + 1], stave: [X - 1, Y + 15, X - 3, Y - 6], plume: 2 }),
    hurt: [knightFrame({ dx: -1, dy: 1, legs: 'fall', arm: [X, Y, X - 1, Y + 3], stave: [X + 4, Y + 6, X - 8, Y - 5], plume: 2 }),
      knightFrame({ dx: -2, dy: 2, legs: 'land', arm: [X, Y, X - 2, Y + 4], stave: [X + 3, Y + 7, X - 9, Y - 2], plume: 1 })],
    crouch: knightFrame({ dy: 3, legs: 'crouch', legsDy: 3, arm: [X, Y, X + 2, Y + 2], arm2: [OFF[0], OFF[1], X, Y + 4], stave: [X + 1, Y + 5, X + 4, Y - 12] }),   /* (down on her heels, the staff still upright by her) */
    /* THE BUTT-SLIDE (src/slide.js): sat back on the ground with the legs run out in front, leaning away from the hill, the weapon tucked behind (a second frame for the cloth) */
    slide: [0, 1].map(i => knightFrame({ dx: -3, dy: 3, legs: 'slide', legsDy: 3, plume: i * 2, arm: [X, Y, X - 2, Y + 4], arm2: [OFF[0], OFF[1], X - 3, Y + 3], stave: [X - 2, Y + 4, X - 13, Y - 10] })),   /* (down on her heels, the staff still upright by her) */
    /* EARTH SENSE (src/crouch-b.js): down on one knee, her head bowed to the ground and the lead palm pressed flat to it, the staff held upright
       behind her in the off hand - and the ground answering under the palm: amber at her fingers, and on the second beat a ripple out either side */
    sense: [0, 1].map(i => knightFrame({ dy: 3, hy: 1, legs: 'kneel', arm: [X, Y, X + 5, Y + 5], arm2: [OFF[0], OFF[1], X - 1, Y + 2], stave: [X - 1, Y + 5, X + 1, Y - 12], plume: i,
      bits: i ? [[13, 12, '#ffc860'], [10, 12, '#8c6a3a'], [17, 12, '#8c6a3a'], [8, 12, '#6a4e30'], [19, 12, '#6a4e30']] : [[13, 12, '#e8a83a']] })),
    /* THE RUNE-WARD (C held, round 3 - it was the ROCK SHIELD): the stave PLANTED upright in front of her, butt in the ground, both hands
       on it and her weight behind it - geomancer.js raises the ward out of the ground beyond it. She is rooted here, and it looks it */
    block: [0, 1].map(i => knightFrame({ dy: 1, legs: 'wide', arm: [X, Y, X + 3, Y - 2 + i], arm2: [OFF[0], OFF[1], X + 2, Y + i], stave: [X + 4, Y + 8, X + 4, Y - 12 + i], plume: i + 1 })),
  };
  /* ROLLING STONE (X early in a dash): the stave laid back as a lever and the boot put through a stone at her feet */
  F.dashAtk = [knightFrame({ dx: 2, dy: 1, legs: 'push', arm: [X, Y, X - 3, Y + 2], arm2: [OFF[0], OFF[1], X - 5, Y + 1], stave: [X - 10, Y + 6, X + 3, Y - 8], plume: 2 }),
    knightFrame({ wide: 4, dx: 3, legs: 'runC', arm: [X, Y, X - 2, Y + 1], arm2: [OFF[0], OFF[1], X - 5, Y], stave: [X - 11, Y + 3, X + 3, Y - 9], plume: 2, bits: [o(9, 8, M), o(10, 8, M), o(9, 7, D)] }),
    knightFrame({ dx: 1, dy: 2, legs: 'land', ...guard(1), plume: 0 })];
  /* THE BUTT-JAB (the second of her run): the stave reversed and the iron end driven straight out */
  F.atkB = [knightFrame({ dx: -1, legs: 'wide', arm: [X, Y, X - 2, Y + 1], arm2: [OFF[0], OFF[1], X - 5, Y], stave: [X + 1, Y + 1, X - 10, Y - 5], plume: 1 }),
    knightFrame({ wide: WIDE, dx: 2, legs: 'runC', arm: [X, Y, X + 5, Y + 1], arm2: [OFF[0], OFF[1], X + 1, Y], stave: [X + 12, Y + 1, X - 3, Y - 1], plume: 2 }),
    knightFrame({ wide: WIDE, dx: 3, legs: 'runC', arm: [X, Y, X + 6, Y + 1], arm2: [OFF[0], OFF[1], X + 2, Y + 1], stave: [X + 15, Y + 1, X - 1, Y - 1], plume: 2, bits: [o(19, 1, '#ffffff')] }),
    knightFrame({ wide: WIDE, dx: 1, legs: 'wide', arm: [X, Y, X + 3, Y + 2], arm2: [OFF[0], OFF[1], X - 1, Y + 1], stave: [X + 9, Y + 2, X - 5, Y - 2], plume: 0 }),
    F.atk[4]];
  /* THE SPIN (the third): a full quarterstaff turn - behind her, straight up, and the stone brought round level through the front.
     This is the blow that SHATTERS a stone piece into shards (geomancer.js), so the stone is drawn furthest out on it */
  F.atkC = [knightFrame({ dx: -2, legs: 'wide', arm: [X, Y, X - 1, Y], arm2: [OFF[0], OFF[1], X - 4, Y - 1], stave: [X + 6, Y, X - 10, Y - 2], plume: 1, bits: [o(-12, 2, M)] }),
    knightFrame({ wide: 4, legs: 'runC', sho: 1, arm: [X, Y, X + 3, Y - 2], arm2: [OFF[0], OFF[1], X + 2, Y + 1], stave: [X + 3, Y + 8, X + 3, Y - 13], plume: 2, bits: [o(-6, -8, M), o(8, -10, M)] }),
    knightFrame({ wide: WIDE + 2, dx: 2, legs: 'runC', arm: [X, Y, X + 5, Y], arm2: [OFF[0], OFF[1], X + 1, Y], stave: [X - 6, Y - 2, X + 16, Y + 1], plume: 2, bits: [o(20, -1, M), o(20, 3, M), o(21, 1, '#ffffff')] }),
    knightFrame({ wide: WIDE, dx: 1, dy: 1, legs: 'wide', arm: [X, Y, X + 4, Y + 2], arm2: [OFF[0], OFF[1], X, Y + 2], stave: [X - 4, Y - 6, X + 14, Y + 6], plume: 0 }),
    F.atk[4]];
  F.air = [knightFrame({ legs: 'jump2', dy: -1, arm: [X, Y, X - 1, Y - 3], arm2: [OFF[0], OFF[1], X - 3, Y - 1], stave: [X + 2, Y + 4, X - 7, Y - 10], plume: 1 }),
    knightFrame({ wide: WIDE, legs: 'jump2', dy: -1, arm: [X, Y, X + 2, Y - 4], arm2: [OFF[0], OFF[1], X - 1, Y - 2], stave: [X - 2, Y + 2, X + 7, Y - 12], plume: 2 }),
    knightFrame({ wide: WIDE, legs: 'jump', dy: -1, arm: [X, Y, X + 5, Y], arm2: [OFF[0], OFF[1], X + 1, Y], stave: [X - 3, Y - 1, X + 15, Y + 2], plume: 2 }),
    knightFrame({ wide: WIDE, legs: 'jump', arm: [X, Y, X + 4, Y + 2], arm2: [OFF[0], OFF[1], X, Y + 2], stave: [X - 2, Y - 3, X + 13, Y + 7], plume: 1 }),
    F.jump[1]];
  /* THE BUTT STRUCK AT HER SIDE (a cast of any kind the kit has not given frames of its own) */
  F.cast = [0, 1].map(i => knightFrame({ dy: i, legs: 'wide', arm: [X, Y, X + 3, Y - 3 + i], arm2: [OFF[0], OFF[1], X + 2, Y - 1 + i], stave: [X + 5, Y + 9 - i, X + 4, Y - 9 + i], bits: [o(4, 9 - i, D), o(7, 9 - i, D)] }));
  /* HER FIDGET: the stave hoisted across the back of her shoulders, her wrists hung over it, a roll of the neck, and back to guard */
  { const yoke = (d, hy) => knightFrame({ dy: d, hy, arm: [X, Y, X + 1, Y - 4], arm2: [OFF[0], OFF[1], X - 5, Y - 4], stave: [X - 9, Y - 3, X + 7, Y - 5], plume: d ? 2 : 1 });
    F.fidget = holdFrames([[F.idle[0], 2], [yoke(0, 0), 3], [yoke(0, 1), 3], [yoke(1, 1), 3], [yoke(0, 0), 2], [F.idle[0], 2]]); }
  /* HER DANCE (dances lane, 2026-09-29): THE STONES ROUND THE STAFF. The butt is struck into the ground upright before her, both hands
     on it, and three stones lift out of the floor and go round it - grey, sand and the amber of the geode - wide and flat like a ring
     seen from the side, the near half of each turn lower and bigger, the far half small and high. Her feet keep the time under it
     and the geode at the head burns on the beat. A stave used to be twirled like a baton here; the stones are hers, the baton is not. */
  { const cx = X + 3, cy = Y - 4, STONES = [M, D, A];
    const ring = (k, dy, legs, plume, glow) => { const b = [];
      STONES.forEach((col, s) => { const th = (k / 6 + s / 3) * Math.PI * 2, near = Math.sin(th) > 0;
        const sx = Math.round(cx + 11 * Math.cos(th)), sy = Math.round(cy + 4 * Math.sin(th) + (near ? 1 : -1));
        for (let qx = 0; qx < (near ? 3 : 2); qx++) for (let qy = 0; qy < (near ? 3 : 2); qy++) b.push(o(sx - X + qx, sy - Y + qy, col)); });
      if (glow) b.push(o(4, -13, '#fff6c8'), o(3, -12, '#fff6c8'), o(5, -12, '#fff6c8'));
      return knightFrame({ wide: 8, legs, dy, plume, arm: [X, Y, X + 3, Y - 2], arm2: [OFF[0], OFF[1], X + 3, Y + 1], stave: [X + 3, Y + 9, X + 3, Y - 10], bits: b }); };
    F.dance = holdFrames([0, 1, 2, 3, 4, 5].map(k => [ring(k, k % 3 === 2 ? 1 : 0, k % 2 ? 'wide' : 'runC', k % 3, k % 2 === 0), 2])); }
  /* HER OTHER TWO DANCES (heroanim lane, 2026-10-10). dance2 = THE CAIRN, her idle solo: the stave struck upright, and one stone after
     another lifts out of the turf, turns in the air before her and is set down on the last, until a little cairn of three stands at her
     boots; she looks at it with her head on one side and knocks it flat with the butt. dance3 = THE UPHEAVAL, a boss down: the stave
     driven down, and stones thrown up out of the ground on both sides in two columns that hang at the top, the geode blazing - and
     the arms spread as they fall. */
  { const st = (o2 = {}) => knightFrame({ wide: 8, arm: [X, Y, X + 3, Y - 2], arm2: [OFF[0], OFF[1], X + 3, Y + 1], stave: [X + 3, Y + 9, X + 3, Y - 10], ...o2 });
    const blk = (x, y, w, col) => { const b = []; for (let i = 0; i < w; i++) for (let j = 0; j < w; j++) b.push(o(x + i, y + j, col)); return b; };
    const floor = Y + 9 - Y;   /* the row the stave's butt is on, relative */
    const c1 = blk(7, floor - 2, 3, M), c2 = blk(7, floor - 4, 3, D).slice(0, 0), c2b = blk(8, floor - 4, 2, D), c3 = blk(8, floor - 6, 2, A);
    const glow = [o(4, -13, '#fff6c8'), o(3, -12, '#fff6c8'), o(5, -12, '#fff6c8')];
    F.dance2 = holdFrames([[F.idle[0], 2], [st({ dy: 1, legs: 'wide' }), 2], [st({ bits: blk(8, floor - 8, 3, M) }), 2], [st({ bits: blk(8, floor - 6, 3, M), hy: 1 }), 2], [st({ bits: c1, plume: 1 }), 2],
      [st({ bits: [...c1, ...blk(9, floor - 9, 2, D)], hy: 1 }), 2], [st({ bits: [...c1, ...c2b], plume: 1 }), 2], [st({ bits: [...c1, ...c2b, ...blk(9, floor - 10, 2, A)], hy: 1, legs: 'wide' }), 2],
      [st({ bits: [...c1, ...c2b, ...c3, ...glow], plume: 2 }), 3], [st({ bits: [...c1, ...c2b, ...c3], hy: 1 }), 4], [st({ bits: [...c1, ...c2b, ...c3], hy: 1, sho: 1 }), 3],
      [st({ dx: 1, legs: 'runC', stave: [X + 4, Y + 7, X + 6, Y + 11], bits: [...c1, ...c2b] }), 2], [st({ legs: 'wide', dy: 1, plume: 2, bits: [...blk(8, floor - 1, 2, M), ...blk(11, floor - 1, 2, D), ...blk(6, floor - 1, 2, A)] }), 3], [F.idle[0], 2]]);
    const col = (h, w) => [...blk(-6, floor - h, 3, D), ...blk(-9, floor - h + 4, 2, M), ...blk(-4, floor - h + 7, 2, A), ...blk(11, floor - h - 1, 3, A), ...blk(14, floor - h + 3, 2, M), ...blk(10, floor - h + 6, 2, D)].filter(b => b[1] >= 1 - BY + 0);
    const slam = st({ dy: 1, legs: 'wide', arm: [X, Y, X + 3, Y + 3], arm2: [OFF[0], OFF[1], X + 3, Y + 5], stave: [X + 3, Y + 11, X + 3, Y - 6], bits: [...blk(-5, floor - 2, 2, D), ...blk(12, floor - 2, 2, M)] });
    const up1 = st({ dy: -1, legs: 'jump2', arm: [X, Y, X + 5, Y - 5], arm2: [OFF[0], OFF[1], X - 4, Y - 5], bits: col(5), plume: 2 });
    const up2 = st({ dy: -1, legs: 'jump2', arm: [X, Y, X + 5, Y - 6], arm2: [OFF[0], OFF[1], X - 4, Y - 6], bits: [...col(9), ...glow], plume: 2 });
    const up3 = st({ legs: 'wide', arm: [X, Y, X + 5, Y - 6], arm2: [OFF[0], OFF[1], X - 4, Y - 6], bits: [...col(11), ...glow], plume: 0 });
    F.dance3 = holdFrames([[F.idle[0], 1], [st({ dy: 1, legs: 'wide', arm: [X, Y, X + 3, Y - 4], arm2: [OFF[0], OFF[1], X + 3, Y - 3], stave: [X + 3, Y + 2, X + 3, Y - 12] }), 2], [slam, 3], [up1, 2], [up2, 2], [up3, 4], [up2, 2],
      [st({ legs: 'wide', arm: [X, Y, X + 5, Y - 5], arm2: [OFF[0], OFF[1], X - 4, Y - 5], bits: col(6), plume: 1 }), 2], [st({ dy: 1, legs: 'wide', bits: [...blk(-5, floor - 1, 2, D), ...blk(12, floor - 1, 2, M)] }), 3], [F.idle[0], 2]]); }
  /* FOLLOW-THROUGH (heroanim lane, 2026-10-10): the two frames a light strike plays inside its existing recovery (main.js recPose branch; the beat table
     is at the top of src/attack-animation.js). A = the weapon spent, carried on low past the target, body one pixel forward, plume still flying;
     B = it coming back to guard, the weight settling. Art only: atkRec is read, never written. */
  F.follow = [knightFrame({ wide: 8, dx: 1, dy: 1, legs: 'wide', arm: [X, Y, X + 4, Y + 1], arm2: [OFF[0], OFF[1], X + 1, Y + 3], stave: [X - 2, Y - 1, X + 11, Y + 6], plume: 1 }), knightFrame({ wide: 8, dy: 1, arm: [X, Y, X + 3, Y], arm2: [OFF[0], OFF[1], X + 2, Y + 2], stave: [X + 3, Y + 8, X + 4, Y - 5], plume: 0 })];
  /* HER SLUMP: the stave planted and her weight hung on it, the hood down */
  { const lean = (d, hy) => knightFrame({ dy: 1 + d, hy, sho: -1, legs: 'stand', plume: 0, arm: [X, Y, X + 4, Y - 2 + d], arm2: [OFF[0], OFF[1], X + 3, Y + d], stave: [X + 5, Y + 9, X + 5, Y - 7] });
    F.slump = [lean(0, 2), lean(1, 3)]; }
  /* HER SWIM: the stave slung along her back, stone up */
  { const S = swimRig(knightFrame, sh, { carry: { stave: [X - 6, Y + 6, X + 2, Y - 8] }, tread: i => ({ stave: [X - 5, Y + 7 + TREAD_DY[i], X + 3, Y - 8 + TREAD_DY[i]] }) });
    F.swim = S.swim; F.tread = S.tread; }
  /* HER DODGE: a shoulder roll, the stave hugged to her */
  const tuck = knightFrame({ dy: 4, legs: 'crouch', arm: [X, Y, X + 1, Y + 2], stave: [X - 5, Y + 5, X + 5, Y - 3] });
  F.roll = [0, 1, 2, 3].map(q => rotQuarter(tuck, q));   /* (still hers in the water and on a ceiling, where there is no floor to go into) */
  /* HER DODGE IS BURROW (2026-09-24): SINK - into the floor to the waist, the stave hugged upright, earth heaped round her; UNDER -
     nothing of her but the peak of the hood riding a travelling hump of earth; BURST - up out of it, arms and stave flung high in a
     spray of rock. Everything below her feet (row 22, the floor line) is cut away, so she really is IN the ground */
  const sunk = (c, w, h) => { const g2 = c.getContext('2d'); g2.clearRect(0, 22, c.width, c.height);
    for (let r = 0; r < h; r++) { const hw = w - r * 2; g2.fillStyle = r === h - 1 ? '#8a7a5e' : '#5e4e38'; g2.fillRect(16 - hw, 21 - r, hw * 2, 1); }
    g2.fillStyle = '#8c8a7e'; g2.fillRect(16 - w + 2, 21, 1, 1); g2.fillRect(16 + w - 3, 20, 1, 1); g2.fillStyle = '#a8a696'; g2.fillRect(16 + 1, 22 - h, 1, 1); return c; };
  F.burrow = [sunk(knightFrame({ dy: 6, legs: 'crouch', legsDy: 6, arm: [X, Y, X + 1, Y - 2], arm2: [OFF[0], OFF[1], X - 1, Y - 1], stave: [X + 2, Y + 8, X + 1, Y - 9], plume: 2 }), 9, 3),
    sunk(knightFrame({ dy: 13, legs: 'crouch', legsDy: 13, plume: 1 }), 7, 3),
    knightFrame({ dy: -3, legs: 'jump', legsDy: -3, arm: [X, Y, X + 3, Y - 8], arm2: [OFF[0], OFF[1], X - 4, Y - 7], stave: [X - 6, Y - 4, X + 8, Y - 12], plume: 2,
      bits: [o(-8, 8, M), o(10, 6, M), o(-4, 11, D), o(8, 10, D), o(12, 2, M), o(-10, 3, D)] })];
  const mirror = f => Array.isArray(f) ? f.map(flipX) : flipX(f);
  directionalPoses(F, 'stave', {});
  /* THE TALL ONES, made after the padding with the headroom of their own: the stave goes up over the hood on these */
  const TK = f => knightFrame({ top: ATTACK_HEADROOM, ...f });
  /* FAULT LINE (her held X, round 3 - it was UPHEAVAL): the stave raised upright over her in both hands, then the BUTT slammed down
     into the ground ahead of her feet - where the crack starts - and her weight driven down on top of it while it runs */
  F.heavy = [TK({ dy: -1, legs: 'wide', sho: 1, arm: [X, Y, X + 3, Y - 7], arm2: [OFF[0], OFF[1], X + 2, Y - 6], stave: [X + 3, Y - 2, X + 2, Y - 18], plume: 1 }),
    TK({ wide: 4, dx: 1, dy: 2, legs: 'wide', arm: [X, Y, X + 5, Y - 2], arm2: [OFF[0], OFF[1], X + 4, Y], stave: [X + 7, Y + 9, X + 5, Y - 9], plume: 2, bits: [o(6, 9, D), o(10, 9, D), o(5, 8, M), o(11, 8, M)] }),
    TK({ wide: 4, dx: 1, dy: 3, legs: 'crouch', arm: [X, Y, X + 5, Y - 1], arm2: [OFF[0], OFF[1], X + 4, Y + 1], stave: [X + 7, Y + 9, X + 6, Y - 8], plume: 0, bits: [o(4, 9, D), o(12, 9, D), o(8, 7, A)] })];
  /* THE WIND-UP of it: the stave coming up off the guard to upright over her head, the rune waking in the stone */
  F.windup = [TK({ legs: 'wide', arm: [X, Y, X + 1, Y - 4], arm2: [OFF[0], OFF[1], X - 1, Y - 1], stave: [X + 2, Y + 6, X - 2, Y - 10], plume: 1 }),
    TK({ legs: 'wide', dy: -1, arm: [X, Y, X + 2, Y - 6], arm2: [OFF[0], OFF[1], X, Y - 4], stave: [X + 2, Y + 2, X + 1, Y - 14], plume: 2 }),
    TK({ legs: 'wide', dy: -1, sho: 1, arm: [X, Y, X + 3, Y - 7], arm2: [OFF[0], OFF[1], X + 1, Y - 6], stave: [X + 3, Y - 1, X + 2, Y - 17], plume: 2, bits: [o(2, -16, A), o(3, -17, '#fff0c0')] })];
  /* THE QUAKE (a full TREMOR, spent): the stave up over her in both hands, then PLANTED - and it stands up by itself beside her
     with the rune alight while she spreads her hands off it. The Quake radiates from the foot of it */
  F.blast = [TK({ dy: -2, legs: 'wide', sho: 1, arm: [X, Y, X + 4, Y - 8], arm2: [OFF[0], OFF[1], X - 4, Y - 8], stave: [X - 8, Y - 9, X + 8, Y - 10], plume: 1 }),
    TK({ wide: 4, dy: 1, legs: 'wide', arm: [X, Y, X + 4, Y + 3], arm2: [OFF[0], OFF[1], X - 5, Y + 2], stave: [X + 8, Y + 9, X + 8, Y - 9], plume: 2, glow: [X + 8, Y - 6], bits: [o(6, 9, D), o(10, 9, D), o(4, 9, M), o(12, 9, M)] })];
  geoKitPoses(F, sh);
  smearPass(F, SMEAR_COL.stone);   /* the strike beats get their arc (claude/herokeys) */
  const R = F, L = {}; for (const k in F) L[k] = mirror(F[k]);
  const white = {}; for (const k in F) white[k] = Array.isArray(F[k]) ? F[k].map(c => whiten(c)) : whiten(F[k]);
  const whiteL = {}; for (const k in white) whiteL[k] = mirror(white[k]);
  KP = Object.assign({}, KP0); BODY_REF = BODY; PLUME_REF = PLUME;
  return { R, L, white: { R: white, L: whiteL }, ...KNIGHT_ANCHOR, ay: KNIGHT_ANCHOR.ay + ATTACK_HEADROOM };
}

/* ==== THE BERSERKER (claude/berserker, 2026-10-04, scratch/brief-berserker.md): the fourth default hero. TWO HAND AXES, no shield, no helm.
   What says BERSERKER at game scale, none of it a goblin's (the goblin berserker is green and bald; he is a man):
   - a WILD COPPER MANE and beard round a bare face, the only hero with his head uncovered;
   - BARE ARMS AND CHEST under a FUR MANTLE on the shoulders (the widest, shaggiest thing at shoulder height), blue war-paint on the chest;
   - a belted KILT (the cloth a skin recolours) over bare legs, cross-gartered, and fur boots;
   - and the AXES: a hand axe in each fist, a short oak haft and a bearded steel head - the head is the read, and the only thing a WEAPON
     skin recolours (chars.js withWeapon: WT/WL on the head, never the haft or the man). */
const BZ_BODY = [
  '..hHhh....',     /* 0  the mane */
  '.hhhhhH...',     /* 1 */
  'hhhkkkhH..',     /* 2  the brow, the hair falling either side */
  'Hhkkvkkh..',     /* 3  the eye on the side he faces; a braid starts behind his ear (bzart) */
  'hhkkkkk...',     /* 4  the braid hangs down his back */
  'n.HHnHk...',     /* 5  the braid's bone bead, the plaited beard with its bead (bzart) */
  'FfkkkkfF..',     /* 6  THE FUR MANTLE on both shoulders, his bare chest between */
  'FfnpknfF..',     /* 7  the war-paint, and the bone necklace across his chest (bzart) */
  'Ffkkknpk..',     /* 8  the pelt hanging at his back; the trophy tooth on the necklace */
  '.WyWWyW...',     /* 9  the belt, iron-studded */
  '.bBbwBb...',     /* 10 the leather kilt, laced (a skin's colour) */
];
const BZ_PLUME = [
  ['..hHhh....', '.hhhhhH...', 'hhhkkkhH..'],
  ['.hhHh.....', 'hhhhhhH...', '.hhkkkhH..'],   /* the mane tossed back a pixel as he breathes */
  ['..hHhhh...', '.hhhhhhH..', 'hhhkkkhH..'],
];
/* s/S: his skin (S is the arm, drawn as a line, and the bare thigh); k his face and chest; h/H the copper mane; f/F the fur; p the paint; b/B the kilt;
   w the garters, W the belt and the boots, y the iron studs. */
const BZ_PAL = { n: '#e8e0c8', N: '#b8ab8a', s: '#f0c49c', S: '#d49a70', k: '#e2a77e', v: '#2a1a14', h: '#c0602e', H: '#7a3a1c', f: '#9a8466', F: '#5e4a36', p: '#3a6ab0', b: '#6a4a2a', B: '#4a3018', w: '#9a8a62', W: '#3e2e20', y: '#a8a8b0', r: '#c0602e' };
/* (claude/bzart) THE BARBARIAN'S ARMS ARE PAINTED: a blue band of war-paint every third pixel along each bare arm, and (on the rage overlay) a vein between them */
function bzArmInk(g, rg, a, dx, dy, top) { const x0 = a[0] + dx, y0 = a[1] + dy, x1 = a[2] + dx, y1 = a[3] + dy, n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 1; i < n - 1; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); if (i % 3 === 1) px(g, x, y, KP.p); else if (i % 3 === 0) rg.push([x, y + top, '#d8301f']); } }
/* (claude/bzart) THE HATCHET, the off hand's: a short pale-ash haft with a red cord wound at the grip, and a small straight-bladed head of dark iron - no beard, no spike, a bright edge three long */
function hatchetAt(g, spec, dx, dy) { const [x0, y0, x1, y1] = spec.slice(0, 4).map((v, i) => v + (i & 1 ? dy : dx)), side = spec[4] || 1;
  const len0 = Math.hypot(x1 - x0, y1 - y0) || 1, len = Math.min(9, len0), ax = (x1 - x0) / len0, ay = (y1 - y0) / len0, qx = -ay * side, qy = ax * side;
  const at = (t, o = 0) => [Math.round(x0 + ax * t + qx * o), Math.round(y0 + ay * t + qy * o)];
  for (let t = -1; t <= len - 1; t += 0.5) px(g, ...at(t), t < 1 ? '#b8905a' : '#a07a48');
  px(g, ...at(0), '#c0382c'); px(g, ...at(1), '#c0382c');
  for (const [t, o] of [[len - 2, 1], [len - 1, 1], [len, 1], [len - 1, 2], [len, 2], [len + 1, 2]]) px(g, ...at(t, o), WT('#6a727e', 0.3));
  for (const t of [len - 1, len, len + 1]) px(g, ...at(t, 3), WL('#f2f6fa'));
  px(g, ...at(len - 1, 0), '#4a4e56'); px(g, ...at(len, 0), '#4a4e56'); }
/* ONEAXE (declared by SPEARLESS): baking the BARE set (his OFF AXE is thrown and out of his hand): every frame, the lead axe only */
export function bakeBerserkerHero(skin = {}, previewOnly = false) {
  KP = Object.assign({}, KP0, BZ_PAL, skin); BODY_REF = BZ_BODY; PLUME_REF = BZ_PLUME;
  const sh = [BX + 8, BY + 7], [X, Y] = sh, OFF = [BX + 2, BY + 7], WIDE = 10;
  const o = (x, y, col) => [X - BX + x, Y - BY + y, col];
  const D = '#c9b27c', M = '#8c8a7e', R = '#ff6b4a';
  const KF = f => knightFrame(f);
  /* AT GUARD: both axes up, the lead one forward of his chest with the blade out at them, the off one crossed back over his belly - a V of
     steel heads over his fists, and his weight forward on the front foot */
  const guard = (d = 0) => ({ arm: [X, Y, X + 3, Y + 2 + d], axe: [X + 3, Y + 2 + d, X + 5, Y - 7 + d], arm2: [OFF[0], OFF[1], X - 5, Y + 4 + d], axe2: [X - 5, Y + 4 + d, X - 13, Y + 1 + d] });
  const lead = (hx, hy, tx, ty, s = 1) => ({ arm: [X, Y, X + hx, Y + hy], axe: [X + hx, Y + hy, X + tx, Y + ty, s] });
  const off = (hx, hy, tx, ty, s = 1) => ({ arm2: [OFF[0], OFF[1], X + hx, Y + hy], axe2: [X + hx, Y + hy, X + tx, Y + ty, s] });
  const card = {
    idle: () => ((previewOnly === 'icon' ? BREATH.slice(0, 1) : BREATH).map(([dy, hy, sho, plume]) => KF({ dy, hy, sho, plume, ...guard(-dy) }))),
    atk: () => ([   /* THE LEAD CHOP: up behind his head, over, down through the front, and through to the follow */
      () => KF({ dx: -1, legs: 'wide', ...lead(1, -5, -4, -12), ...off(-4, 4, -10, -1), plume: 1 }),
      () => KF({ wide: WIDE, dx: 1, legs: 'runC', ...lead(4, -4, 9, -11), ...off(-4, 4, -10, 0), plume: 2 }),
      () => KF({ wide: WIDE, dx: 2, legs: 'runC', ...lead(5, 1, 14, 3), ...off(-4, 4, -10, 1), plume: 2, bits: [o(16, 6, '#ffffff')] }),
      () => KF({ wide: WIDE, dx: 1, legs: 'wide', ...lead(4, 4, 10, 11), ...off(-4, 4, -10, 0), plume: 0 }),
      () => KF({ legs: 'stand', ...guard(), plume: 0 }),
    ].map((make, i) => (previewOnly === 'weaponIcon' && i !== 2) || (previewOnly === 'atk' && i !== 1 && i !== 2) ? null : make())),
  };
  if (previewOnly) return storeFrames(card, false, previewOnly, SMEAR_COL.steel);
  const F = {
    idle: card.idle(),
    run: [['run1', -1, 0], ['run2', 0, 1], ['run3', 1, 2], ['run4', 0, 1], ['run5', -1, 0], ['run6', 0, 1]].map(([l, dy, k], i) =>   /* the axes pumped low at his sides like fists */
      KF({ legs: l, dy, plume: i % 3, ...lead(2 + k, 3, 7 + k, -4), ...off(-3 - k, 4, -8 - k, -2) })),
    jump: [KF({ legs: 'jump', dy: -1, ...lead(3, -1, 7, -9), ...off(-4, 2, -9, -5), plume: 1 }), KF({ legs: 'jump2', ...lead(3, -2, 8, -10), ...off(-4, 1, -9, -6), plume: 1 })],
    fall: [KF({ legs: 'fall', ...lead(4, -3, 9, -10), ...off(-5, -1, -10, -8), plume: 2 }), KF({ legs: 'fall2', dy: -1, ...lead(4, -4, 8, -12), ...off(-5, -2, -9, -10), plume: 2 })],
    /* THE LANDING is a heavy man's: both fists and both heads down to the ground as his knees take it, the settle, and up */
    land: [KF({ legs: 'crouch', legsDy: 3, dy: 4, ...lead(4, 4, 9, 9, -1), ...off(-3, 5, -8, 9, -1), plume: 2, bits: [o(9, 9, D), o(-8, 9, D)] }), KF({ legs: 'land', dy: 2, ...guard(1), plume: 0 }), KF({ legs: 'stand', dy: 1, ...guard(), plume: 1 })],
    takeoff: KF({ legs: 'push', dy: -2, sho: 1, ...lead(3, -3, 6, -12), ...off(-4, 0, -8, -8), plume: 2 }),
    apex: KF({ legs: 'jump2', dy: -1, ...lead(4, -4, 10, -9), ...off(-5, -2, -11, -6), plume: 0 }),
    skid: KF({ dx: -2, legs: 'wide', ...lead(2, 3, -4, 8, -1), ...off(-4, 3, -10, 7, -1), plume: 2 }),
    climb: [KF({ legs: 'climbA', arm: [X, Y, X + 2, Y - 7], bits: [o(-4, 4, M), o(-5, 5, '#6a4428'), o(-6, 6, '#6a4428')], plume: 0 }), KF({ legs: 'climbB', dy: 1, arm: [X, Y, X + 3, Y - 3], bits: [o(-4, 4, M), o(-5, 5, '#6a4428'), o(-6, 6, '#6a4428')], plume: 1 })],   /* (the axes through his belt) */
    atk: card.atk(),
    /* AXEFALL (his plunge): both axes driven straight down under him, heads first */
    plunge: KF({ legs: 'tuck', hy: 1, ...lead(1, 3, 2, 13, -1), ...off(-2, 3, -3, 13, 1), plume: 2 }),
    hurt: [KF({ dx: -1, dy: 1, legs: 'fall', ...lead(2, 3, 8, 6, -1), ...off(-5, 2, -11, 0), plume: 2 }), KF({ dx: -2, dy: 2, legs: 'land', ...lead(1, 4, 6, 10, -1), ...off(-5, 4, -10, 8, -1), plume: 1 })],
    crouch: KF({ dy: 3, legs: 'crouch', legsDy: 3, ...lead(3, 4, 8, -2), ...off(-3, 5, -8, 0) }),
    slide: [0, 1].map(i => KF({ dx: -3, dy: 3, legs: 'slide', legsDy: 3, plume: i * 2, ...lead(-2, 4, -9, 0), ...off(-4, 3, -11, -2) })),
    /* THE BRACE (tap C): no shield - his chest. Feet set wide, both axes crossed down and out to the sides, shoulders squared and his chin up,
       daring the blow; on the second beat the fur bristles (a pixel of each mantle up) */
    block: [0, 1].map(i => KF({ dy: 1, legs: 'wide', sho: i, ...lead(4, 4, 10, 8, -1), ...off(-5, 4, -11, 8, -1), plume: i + 1 })),
  };
  /* THE SHOULDER ROLL's DASH ATTACK (X early in it): his shoulder down and the lead axe swung low through what he barges, then the stumble */
  F.dashAtk = [KF({ wide: 4, dx: 2, dy: 2, legs: 'runC', sho: 1, ...lead(4, 3, 12, 6, -1), ...off(-4, 2, -9, -4), plume: 2 }),
    KF({ wide: 6, dx: 4, dy: 2, legs: 'run1', sho: 1, ...lead(6, 2, 15, 1, -1), ...off(-3, 3, -8, -3), plume: 2 }),
    KF({ dx: 1, dy: 2, legs: 'land', ...lead(4, 4, 9, 10, -1), ...off(-4, 4, -8, 0), plume: 0 })];
  /* THE OFF CHOP (the second of his run): the other axe over his head and down, the lead one pulled back out of its way */
  F.atkB = [KF({ dx: -1, legs: 'wide', ...lead(-1, 4, -6, -1), ...off(-4, -5, -8, -12), plume: 1 }),
    KF({ wide: WIDE, dx: 1, legs: 'runC', ...lead(-1, 4, -6, -2), ...off(1, -5, 6, -12), plume: 2 }),
    KF({ wide: WIDE, dx: 2, legs: 'runC', ...lead(0, 4, -5, -2), ...off(4, 1, 13, 3), plume: 2, bits: [o(15, 6, '#ffffff')] }),
    KF({ wide: WIDE, dx: 1, legs: 'wide', ...lead(0, 4, -5, -1), ...off(3, 4, 9, 11), plume: 0 }),
    F.atk[4]];
  /* THE THIRD: both axes taken back low and swept round level through the front together - the run's heavy, two heads in one line */
  F.atkC = [KF({ dx: -2, legs: 'wide', ...lead(-2, 2, -10, -1), ...off(-4, 3, -12, 1), plume: 1 }),
    KF({ wide: WIDE, legs: 'runC', sho: 1, ...lead(3, 0, 11, -3), ...off(1, 2, 9, 0), plume: 2 }),
    KF({ wide: WIDE + 2, dx: 2, legs: 'runC', ...lead(5, 0, 14, 0), ...off(4, 3, 13, 4), plume: 2, bits: [o(16, 0, '#ffffff'), o(15, 5, '#ffffff')] }),
    KF({ wide: WIDE, dx: 1, dy: 1, legs: 'wide', ...lead(4, 3, 9, 9, -1), ...off(3, 4, 7, 10, -1), plume: 0 }),
    F.atk[4]];
  F.air = [KF({ legs: 'jump2', dy: -1, ...lead(1, -5, -4, -12), ...off(-4, 2, -9, -4), plume: 1 }),
    KF({ wide: WIDE, legs: 'jump2', dy: -1, ...lead(4, -4, 9, -11), ...off(-4, 2, -9, -4), plume: 2 }),
    KF({ wide: WIDE, legs: 'jump', dy: -1, ...lead(5, 1, 14, 3), ...off(-4, 2, -8, -5), plume: 2 }),
    KF({ wide: WIDE, legs: 'jump', ...lead(4, 4, 10, 11), ...off(-4, 2, -8, -5), plume: 1 }),
    F.jump[1]];
  /* A CAST he has no frame of his own for: the axes struck together over his head */
  F.cast = [0, 1].map(i => KF({ dy: i, legs: 'wide', ...lead(2, -6 + i, 6, -13 + i), ...off(-2, -6 + i, -6, -13 + i), bits: i ? [o(0, -14, '#ffffff'), o(-1, -15, '#fff6c8'), o(1, -15, '#fff6c8')] : [] }));
  /* HIS FIDGET: an axe tossed up end over end out of the lead hand and caught by the haft, and a roll of the neck */
  { const up = (y, tx, ty) => KF({ ...off(-4, 4, -10, 0), arm: [X, Y, X + 3, Y - 4], bits: [] , axe: [X + 3, Y - 4 - y, X + 3 + tx, Y - 4 - y + ty] });
    F.fidget = holdFrames([[F.idle[0], 2], [KF({ ...guard(), plume: 1 }), 2], [up(0, 4, -8), 2], [up(3, 8, 2), 2], [up(5, -4, 8), 2], [up(3, -8, -2), 2], [up(0, 4, -8), 2], [KF({ ...guard(), hy: 1, plume: 2 }), 3], [F.idle[0], 2]]); }
  /* HIS DANCE: THE AXE DRUM. The two heads beaten together over his head on the beat, a stamp of the foot under each, the mane tossing */
  { const beat = (k) => KF({ wide: 4, legs: k % 2 ? 'wide' : 'runC', dy: k % 2, plume: k % 3, ...lead(2, -6 + (k % 2), 6, -13 + (k % 2)), ...off(-2, -6 + (k % 2), -6, -13 + (k % 2)),
      bits: k % 2 ? [o(0, -14, '#ffffff'), o(-2, -15, '#fff6c8'), o(2, -15, '#fff6c8'), o(0, -16, '#fff6c8')] : [o(-6, 9, D), o(6, 9, D)] });
    F.dance = holdFrames([0, 1, 2, 3, 4, 5].map(k => [beat(k), 2])); }
  /* HIS OTHER TWO DANCES (berserkerport, 2026-10-11). dance2 = THE WHETSTONE, his idle solo: down on one knee, an axe laid across it, a stone
     dragged down the edge (sparks off it) and the edge tried on his thumb, the mane over his face; then up, and the axe spun back into his fist.
     dance3 = THE WAR CRY, a boss down: both axes flung up, head back, the roar, the heads crashed together over him, then driven into the turf
     either side of him and the fur shaken out. */
  { const kn = (o2 = {}) => KF({ dy: 2, legs: 'kneel', hy: 1, ...lead(4, 4, 11, 4, -1), arm2: [OFF[0], OFF[1], X + 6, Y + 3], ...o2 });
    const spark = n => n ? [o(8, 2, '#ffd36b'), o(10, 1, '#fff6c8'), o(12, 3, '#ffd36b')] : [o(9, 2, '#fff6c8')];
    const stone = [o(6, 2, '#8c8a7e'), o(7, 2, '#a8a696')];
    const thumb = KF({ dy: 2, legs: 'kneel', hy: 2, ...lead(4, 4, 10, 3, -1), arm2: [OFF[0], OFF[1], X + 5, Y + 2], bits: [o(5, 1, '#fff6c8')], plume: 1 });
    F.dance2 = holdFrames([[F.idle[0], 2], [KF({ dy: 1, legs: 'wide', ...lead(3, 3, 9, 2, -1), ...off(-4, 4, -10, 0), plume: 1 }), 2], [kn({ bits: stone, plume: 0 }), 2],
      [kn({ bits: [...stone, ...spark(0)], plume: 1 }), 2], [kn({ bits: [...stone, ...spark(1)], plume: 2 }), 2], [kn({ bits: [o(6, 4, '#8c8a7e'), ...spark(0)], plume: 1 }), 2],
      [kn({ bits: [o(9, 5, '#8c8a7e'), ...spark(1)], plume: 0 }), 2], [kn({ bits: [...stone, ...spark(1)], plume: 2 }), 2], [thumb, 4], [thumb, 2],
      [KF({ dy: 1, legs: 'wide', sho: 1, ...lead(3, -2, 7, -10), ...off(-4, 4, -10, 0), plume: 2, bits: [o(9, -11, '#ffffff')] }), 2], [KF({ dy: 1, legs: 'wide', ...guard(1), plume: 1 }), 2], [F.idle[0], 2]]); }
  { const roar = (up, extra = {}) => KF({ dy: -up, legs: 'wide', sho: 1, hy: -1, ...lead(5, -7, 11, -15), ...off(-5, -7, -11, -15), plume: 2, bits: [o(2, -4, R), o(4, -5, R), o(5, -3, R), o(0, -5, R)], ...extra });
    const cross = (k) => KF({ dy: k ? 1 : 0, legs: 'wide', ...lead(2, -7, k ? -2 : 4, -15), ...off(-2, -7, k ? 2 : -4, -15), plume: k ? 1 : 2, bits: k ? [o(0, -17, '#ffffff'), o(-2, -16, '#fff6c8'), o(2, -16, '#fff6c8'), o(0, -19, '#fff6c8')] : [] });
    const plant = (d) => KF({ dy: 2 + d, legs: 'wide', ...lead(5, 4, 8, 11, -1), ...off(-5, 4, -8, 11, -1), plume: 0, bits: d ? [o(7, 11, D), o(10, 11, D), o(-7, 11, D), o(-10, 11, D)] : [o(8, 11, D), o(-8, 11, D)] });
    F.dance3 = holdFrames([[F.idle[0], 1], [KF({ dy: 1, legs: 'wide', ...lead(2, -2, 6, -9), ...off(-2, -2, -6, -9), plume: 1 }), 2], [roar(0), 2], [roar(1), 2], [roar(0, { hy: -2 }), 3], [roar(1), 2],
      [cross(0), 2], [cross(1), 3], [cross(0), 2], [cross(1), 3], [plant(0), 2], [plant(1), 3], [KF({ dy: 1, legs: 'stand', sho: 1, ...lead(4, 3, 9, 10, -1), ...off(-4, 3, -9, 10, -1), plume: 2 }), 2], [KF({ dy: 1, legs: 'stand', ...lead(4, 3, 9, 10, -1), ...off(-4, 3, -9, 10, -1), plume: 1, hy: 1 }), 3], [F.idle[0], 2]]); }
  /* FOLLOW-THROUGH (heroanim lane, 2026-10-10): the two frames a light strike plays inside its existing recovery (main.js recPose branch). A = the
     lead axe spent, carried on low past the target, body one pixel forward, the mane still flying; B = it coming back to guard, the weight settling. */
  F.follow = [KF({ dx: 1, dy: 1, legs: 'wide', ...lead(5, 5, 11, 11, -1), ...off(-4, 4, -10, 0), plume: 1 }), KF({ dy: 1, legs: 'stand', ...lead(3, 3, 7, -3), ...off(-3, 4, -9, 0), plume: 0 })];
  /* HIS SLUMP: the axes hanging from slack fists, heads in the dirt, the mane fallen over his face */
  { const sag = d => KF({ dy: 1 + d, hy: 2, sho: -1, legs: 'stand', plume: 0, ...lead(1, 5, 3, 9, -1), ...off(-3, 5, -4, 9, -1) });
    F.slump = [sag(0), sag(1)]; }
  /* HIS SWIM: both axes through the belt at his back */
  { const S = swimRig(knightFrame, sh, { carry: { bits: [o(-5, 4, M), o(-6, 5, '#6a4428'), o(-7, 6, '#6a4428'), o(-4, 5, M)] }, tread: i => ({ bits: [o(-5, 4 + TREAD_DY[i], M), o(-6, 5 + TREAD_DY[i], '#6a4428')] }) });
    F.swim = S.swim; F.tread = S.tread; }
  /* THE SHOULDER ROLL (his dodge): a tuck over the shoulder, the axes hugged in */
  const tuck = KF({ dy: 4, legs: 'crouch', ...lead(2, 2, 6, -3), ...off(-2, 3, -5, -2) });
  F.roll = [0, 1, 2, 3].map(q => rotQuarter(tuck, q));
  /* WORKING UP (src/crouch-c.js): crouched, the two heads ground edge on edge in front of his face, sparks off them, the beard thrust out
     growling - two frames, the axes drawn across each other one way and back */
  F.grind = [0, 1].map(i => KF({ dy: 3, legs: 'crouch', legsDy: 3, hy: 1, ...lead(3, 1, 7 + i * 2, -7), ...off(-1, 2, 5 - i * 2, -7, -1), plume: i,
    bits: i ? [o(7, -9, '#ffd36b'), o(9, -10, '#fff6c8'), o(4, -10, '#ffd36b')] : [o(6, -9, '#fff6c8')] }));
  const flip1 = c => { if (!c) return c; const o = flipX(c); if (c.rgo) o.rgo = c.rgo.map(([x, y, col]) => [c.width - 1 - x, y, col]); return o; };
  const mirror = f => Array.isArray(f) ? f.map(flip1) : flip1(f);   /* (claude/bzart: his rage overlay turns with him) */
  directionalPoses(F, 'axe', { make: KF, extra: off(-4, 4, -10, 0) });   /* (the off axe kept at guard through the rising cut, the low sweep and the air up-slash) */
  const TK = f => KF({ top: ATTACK_HEADROOM, ...f });
  /* THE CROSS-CHOP (his held X): the WIND-UP takes both axes up over his head, crossed, and cocks them back as the hold grows; the CHOP brings
     both down together through the front, the hafts crossing as they come, into the ground ahead of him */
  F.windup = [TK({ legs: 'wide', ...lead(2, -6, 0, -15), ...off(-2, -6, 2, -15), plume: 1 }),
    TK({ legs: 'wide', dy: -1, sho: 1, ...lead(1, -8, -4, -16), ...off(-1, -8, -6, -15), plume: 2 }),
    TK({ legs: 'wide', dx: -1, dy: -1, sho: 1, ...lead(0, -8, -7, -14), ...off(-2, -7, -9, -12), plume: 2, bits: [o(-6, -15, '#ffffff')] })];
  F.heavy = [TK({ wide: WIDE, dx: 1, legs: 'wide', ...lead(3, -7, 9, -15), ...off(1, -7, 8, -16), plume: 2 }),
    TK({ wide: WIDE, dx: 2, legs: 'runC', ...lead(5, -1, 13, 4, 1), ...off(4, 1, 13, -4, -1), plume: 2 }),
    TK({ wide: WIDE, dx: 3, dy: 2, legs: 'wide', ...lead(5, 3, 11, 9, -1), ...off(4, 4, 13, 9, -1), plume: 0, bits: [o(12, 9, D), o(14, 9, D), o(10, 9, D), o(13, 8, '#ffffff')] })];
  /* FRENZY (a full bar, C): the roar - head thrown back, both axes flung out wide and high, chest out - then the stamp down into it */
  F.blast = [TK({ dy: -1, legs: 'wide', sho: 1, hy: -1, ...lead(4, -6, 10, -12), ...off(-5, -6, -11, -12), plume: 2, bits: [o(1, -4, R), o(2, -5, R)] }),
    TK({ dy: 2, legs: 'wide', ...lead(5, 1, 11, -5), ...off(-5, 1, -11, -5), plume: 1, bits: [o(-6, 9, D), o(6, 9, D)] })];
  /* THE AXE THROW (UP and C): the off axe cocked back over his shoulder and hurled; the lead one held */
  F.bzThrow = [TK({ dx: -1, legs: 'wide', ...lead(3, 2, 6, -7), ...off(-5, -5, -9, -11), plume: 1 }),
    TK({ wide: 6, dx: 2, legs: 'runC', ...lead(2, 3, 6, -6), arm2: [OFF[0], OFF[1], X + 6, Y - 3], plume: 2 })];
  bzKitPoses(F, sh);
  smearPass(F, SMEAR_COL.steel);   /* the strike beats get their arc (claude/herokeys): the lead axe's hand and head are kept as c.wp */
  if (ONEAXE) F.atkB = F.atk;   /* ONE-HANDED: no off chop - the lead axe cuts every blow of the run */
  /* (claude/bzart) HIS NEW KEYS, DRAWN (scratch/brief-berserker2.md 5; the aliases the berserker2 lane left are gone). Each is built with the headroom (TK) because it
     is made after directionalPoses padded the rest. The strike keys are 5 frames on the attack-animation beats (0 anticipation, 1 strike, 2 extended, 3 recover, 4 settle).
     LEAD = the BEARDED AXE, OFF = the HATCHET. One-handed (ONEAXE: the bare set) the off axe is simply not drawn; the keys that leant on it say so below. */
  { const G5 = F.atk[4], opt = (a, b) => ONEAXE ? a : b;
    const offWp = (c, hx, hy, tx, ty, dx = 0, dy = 0) => { c.wp = { p: [X + hx + dx, Y + hy + dy + ATTACK_HEADROOM], t: [X + tx + dx, Y + ty + dy + ATTACK_HEADROOM] }; return c; };
    const sp = (x, y) => [o(x, y, '#ffffff'), o(x + 1, y, '#fff6c8'), o(x, y - 1, '#fff6c8'), o(x, y + 1, '#fff6c8')];
    /* FLURRY LEFT: the bearded axe, a quick DOWN-chop from over the shoulder, short (the hatchet drawn across his belly); the shoulders turn into it */
    F.bzFlurryL = [TK({ dx: -1, legs: 'wide', sho: 1, ...lead(1, -5, -3, -12), ...off(-3, 3, -9, 0), plume: 1 }),
      TK({ wide: 6, dx: 1, legs: 'runC', sho: 1, ...lead(4, -4, 10, -10), ...off(-4, 3, -9, 3), plume: 2 }),
      TK({ wide: WIDE, dx: 2, dy: 1, legs: 'runC', ...lead(5, 1, 13, 5), ...off(-4, 4, -10, 2), plume: 2, bits: sp(15, 7) }),
      TK({ wide: 6, dx: 1, dy: 1, legs: 'wide', ...lead(4, 4, 9, 11, -1), ...off(-4, 4, -9, 1), plume: 0 }),
      G5];
    /* FLURRY RIGHT: the HATCHET, a low rising backhand - cocked low behind him, whipped up and across; the bearded axe pulled back out of its way */
    const fr = [[-4, 5, -10, 10, -1, -1, 'wide', 1], [1, 3, 7, -3, 1, 1, 'runC', 2], [5, -2, 12, -8, 1, 2, 'runC', 2], [4, -6, 8, -14, 1, 1, 'wide', 0]];
    F.bzFlurryR = [...fr.map(([hx, hy, tx, ty, sd, dx, legs, pl], i) => offWp(TK({ wide: i ? 6 : 0, dx, dy: i === 2 ? -1 : 0, legs, sho: i === 1 ? 1 : 0, ...lead(-1, 4, -6, -1), ...off(hx, hy, tx, ty, sd), plume: pl, bits: i === 2 ? sp(14, -9) : null }), hx, hy, tx, ty, dx)), G5];
    /* THE CROSS-CHOP: both axes drawn back wide, swept in together to cross in front (the bearded head high, the hatchet low) and bite where they meet */
    F.bzCross = [TK({ dx: -2, legs: 'wide', sho: 1, ...lead(-2, -4, -8, -11), ...off(-4, -3, -11, -8), plume: 1 }),
      TK({ wide: 8, legs: 'runC', sho: 1, ...lead(3, 1, 9, -6), ...off(3, -7, 9, 0, -1), plume: 2 }),
      TK({ wide: WIDE + 4, dx: 2, legs: 'runC', ...lead(5, -2, 13, -7), ...off(5, -6, 13, -2, -1), plume: 2, bits: [...sp(15, -4), o(13, -9, '#fff6c8'), o(14, 1, '#fff6c8')] }),
      TK({ wide: 8, dx: 1, dy: 1, legs: 'wide', ...lead(4, 3, 9, 10, -1), ...off(4, 2, 9, 8, -1), plume: 0 }),
      G5];
    /* THE AIR SPIN: both axes whirling round him, one ahead and one behind, a turn a beat (arms out, the heads carried round the circle) */
    const spin = k => { const a = k * 1.15 + 0.3, c = Math.cos(a), sn = Math.sin(a), P2 = (r, sg) => [Math.round(sg * r * c), Math.round(-sg * r * sn * 0.8)];
      const [lx, ly] = P2(5, 1), [lt, lty] = P2(13, 1), [ox, oy2] = P2(5, -1), [ot, oty] = P2(13, -1);
      const arc = k === 1 || k === 2 ? [o(Math.round(lt * 0.5) + 2, lty - 3, '#d4def5'), o(Math.round(lt * 0.9), lty - 2, '#ffffff'), o(Math.round(ot * 0.5) - 2, oty + 3, '#d4def5')] : [];
      return TK({ wide: 8, dx: 0, dy: -1, legs: k % 2 ? 'jump' : 'jump2', plume: k % 3, ...lead(lx, ly, lt, lty, lty < 0 ? 1 : -1), ...off(ox, oy2, ot, oty, oty < 0 ? 1 : -1), bits: arc }); };
    F.bzAirSpin = [spin(0), spin(1), spin(2), spin(3), TK({ legs: 'fall', ...lead(4, -3, 9, -10), ...off(-5, -1, -10, -8), plume: 2 })];
    /* AXEFALL, spun: both heads under his boots, crossing and uncrossing, the wind streaming up off them */
    F.bzPlunge = [TK({ wide: 2, dy: -1, sho: 1, hy: -1, legs: 'jump2', ...lead(3, -8, 4, -18, 1), ...off(-3, -8, -4, -18, -1), plume: 2, bits: [o(0, -22, '#ffffff'), o(-6, -16, '#d4def5'), o(7, -16, '#d4def5')] }),   /* (claude/plunges B16) the WINDUP: both axes hauled up crossed over his head, then the spun fall below */
      ...[0, 1].map(i => TK({ legs: 'tuck', hy: 1, dy: i, ...lead(1, 3, i ? -2 : 3, 13, -1), ...off(-2, 3, i ? 4 : -3, 13, 1), plume: 2, bits: [o(-5, 4 - i, '#d4def5'), o(6, 3 + i, '#d4def5'), o(-6, 8 - i, '#8aa0c8'), o(7, 8 + i, '#8aa0c8')] }))];
    /* AXE SPIN (B16, claude/plunges): on the foe's head, crouched, both axes whirling flat round him - a cycle of four (the bought SPIN is bzSpin: this is the plunge's own); and the release (bzSpinEnd): thrown wide off it, up */
    F.bzAxeSpin = [TK({ wide: 10, dy: 3, legs: 'crouch', legsDy: 3, ...lead(7, 1, 16, -2, -1), ...off(-7, 1, -16, 4, -1), plume: 1, bits: [o(14, -4, '#d4def5'), o(-14, 6, '#8aa0c8'), o(10, -6, '#ffffff')] }),
      TK({ wide: 10, dy: 3, legs: 'crouch', legsDy: 3, ...lead(3, 4, 8, 10, -1), ...off(-3, -2, -8, -10, 1), plume: 2, bits: [o(9, 11, '#d4def5'), o(-9, -11, '#d4def5'), o(0, 12, '#ff9a5c')] }),
      TK({ wide: 10, dy: 3, legs: 'crouch', legsDy: 3, ...lead(-7, 1, -16, -2, -1), ...off(7, 1, 16, 4, -1), plume: 0, bits: [o(-14, -4, '#d4def5'), o(14, 6, '#8aa0c8'), o(-10, -6, '#ffffff')] }),
      TK({ wide: 10, dy: 3, legs: 'crouch', legsDy: 3, ...lead(-3, -2, -8, -10, 1), ...off(3, 4, 8, 10, -1), plume: 1, bits: [o(-9, -11, '#d4def5'), o(9, 11, '#d4def5'), o(0, -12, '#ff9a5c')] })];
    F.bzSpinEnd = [TK({ wide: 10, dy: -1, legs: 'jump', ...lead(6, -3, 15, -9), ...off(-6, -3, -15, -9), plume: 2, bits: [o(16, -11, '#ffffff'), o(-16, -11, '#ffffff'), o(14, -6, '#d4def5'), o(-14, -6, '#d4def5')] }),
      TK({ wide: 4, dy: -1, legs: 'jump2', ...lead(4, -4, 9, -11), ...off(-5, -2, -10, -9), plume: 1 })];
    /* TAKE IT: the two axes crossed in an X in front of his chest, feet planted wide, chin up; then the absorb - the shudder, the fur up, the blow's sparks at the crossing */
    F.bzTake = [TK({ dy: 1, legs: 'wide', ...lead(3, 0, 10, -8), ...off(3, -6, 10, 1, -1), plume: 1, bits: [o(8, -4, '#fff6c8')] }),
      TK({ dx: -1, dy: 2, legs: 'wide', sho: 1, hy: 1, ...lead(3, 0, 10, -8), ...off(3, -6, 10, 1, -1), plume: 2, bits: [...sp(9, -4), o(12, -7, '#ffd36b'), o(12, 0, '#ffd36b')] })];
    /* COIL: down low, both axes thrust out level in front like horns, the war-paint and the eyes burning - the rage breathing in and out of him */
    F.bzCoil = [0, 1, 2].map(i => TK({ dy: 3 + (i === 1 ? 1 : 0), legs: 'crouch', legsDy: 3, hy: 1, sho: i === 1 ? 1 : 0, ...lead(4, 2, 12, 1 - i % 2, -1), ...off(3, 4, 11, 3 + i % 2, -1), plume: i,
      bits: [o(-1, 2, '#ff4a3a'), o(1, 3, '#c01c14'), ...(i === 1 ? [o(-2, -6, '#9a8a8a'), o(-1, -8, '#cfc6c0')] : [])] }));
    /* POUNCE: the push-off, then flat out axes-first - heads together at the end of his arms, the wind streaming back off his mane */
    F.bzPounce = [TK({ wide: 6, dx: 2, dy: 2, legs: 'push', sho: 1, ...lead(5, 0, 12, -3), ...off(3, 2, 11, 0), plume: 2 }),
      TK({ wide: 10, dx: 4, dy: 1, legs: 'jump2', sho: 1, ...lead(7, -2, 14, -3), ...off(6, 1, 14, 0, -1), plume: 2, bits: [o(-9, -2, '#d4def5'), o(-12, 0, '#d4def5'), o(-8, 3, '#d4def5')] })];
    /* THE COMMITTED LANDING: down in a crouch, the heads driven into the turf, dust; then the heave back up */
    F.bzPLand = [TK({ wide: 4, dx: 2, dy: 4, legs: 'crouch', legsDy: 3, hy: 1, ...lead(5, 4, 10, 9, -1), ...off(3, 5, 9, 9, -1), plume: 1, bits: [o(11, 9, D), o(13, 9, D), o(-2, 9, D), o(-5, 9, D)] }),
      TK({ wide: 4, dx: 1, dy: 2, legs: 'wide', ...lead(4, 3, 9, 6, -1), ...off(3, 3, 8, 5, -1), plume: 0, bits: [o(10, 9, D), o(-3, 9, D)] })];
    /* THE WHETSTONE: stood easy, the bearded axe held flat across him, the hatchet's flat dragged down its edge (or, one-handed, a stone), sparks off the stroke */
    F.bzWhet = [0, 1, 2, 3].map(i => { const hx = [2, 5, 8, 5][i], stone = o(hx + 3, 1, '#8c8a7e');
      return TK({ dy: 0, legs: 'stand', sho: i === 1 ? 1 : 0, hy: i === 2 ? 1 : 0, ...lead(3, 1, 11, 2, -1), ...(ONEAXE ? { arm2: [OFF[0], OFF[1], X + hx, Y + 3] } : off(hx, 3, hx + 5, -2, -1)), plume: i % 3,
        bits: [...(ONEAXE ? [stone, o(hx + 4, 1, '#a8a696')] : []), ...(i === 1 || i === 2 ? [o(hx + 6, 1, '#ffd36b'), o(hx + 8, 0, '#fff6c8')] : [o(hx + 6, 2, '#fff6c8')])] }); });
    /* THE RIPOSTE IS THE CROSS-CHOP (riposteKit's three frames, redrawn): the crossed axes' windup, the cut with the flash where they bite, the settle */
    { const C2 = '#fff6c8', G2 = '#ffd36b';
      F.ripo = [TK({ wide: 6, dx: -1, dy: 1, legs: 'wide', sho: 1, ...lead(-1, -4, -7, -11), ...off(-3, -3, -9, -8), plume: 2 }),
        TK({ wide: 14, dx: 3, dy: 1, legs: 'runC', ...lead(6, -2, 14, -6), ...off(6, -6, 14, -1, -1), plume: 2, bits: [...sp(17, -3), o(19, -3, G2), o(15, -9, C2), o(15, 3, C2), o(12, 6, '#ff6b4a')] }),
        TK({ wide: 10, dx: 3, dy: 2, legs: 'wide', ...lead(4, 4, 9, 11, -1), ...off(4, 3, 9, 9, -1), plume: 0, bits: [o(10, 11, C2), o(12, 10, G2)] })]; }
    for (const k of ['bzFlurryL', 'bzFlurryR', 'bzCross', 'bzAirSpin']) for (const i of [1, 2]) smearBeat(F[k][i], F[k][i - 1], SMEAR_COL.steel, i === 2 ? { max: 55 } : {}); }
  if (ONEAXE) F.bzFlurryR = F.bzFlurryL;   /* ONE-HANDED: the bearded axe cuts every blow of the run */
  const RR = F, L = {}; for (const k in F) L[k] = mirror(F[k]);
  const white = {}; for (const k in F) white[k] = Array.isArray(F[k]) ? F[k].map(c => whiten(c)) : whiten(F[k]);
  const whiteL = {}; for (const k in white) whiteL[k] = mirror(white[k]);
  KP = Object.assign({}, KP0); BODY_REF = BODY; PLUME_REF = PLUME;
  const set = { R: RR, L, white: { R: white, L: whiteL }, ...KNIGHT_ANCHOR, ay: KNIGHT_ANCHOR.ay + ATTACK_HEADROOM };
  if (!ONEAXE) { ONEAXE = true; try { set.bare = bakeBerserkerHero(skin); } finally { ONEAXE = false; } }   /* drawn while the OFF AXE is thrown: the cue that it is gone */
  return set;
}
/* EVERY ABILITY HAS A BODY: THE BERSERKER'S NINE (src/hero-poses.js plays them; tools/ability-poses.mjs holds him to it). Told by what the
   AXES do - and by the mane, which goes up whenever he roars */
function bzKitPoses(F, sh) {
  const [X, Y] = sh, OFF = [BX + 2, BY + 7], KF = f => knightFrame({ top: ATTACK_HEADROOM, ...f });
  const o = (x, y, col) => [X - BX + x, Y - BY + y, col];
  const lead = (hx, hy, tx, ty, s = 1) => ({ arm: [X, Y, X + hx, Y + hy], axe: [X + hx, Y + hy, X + tx, Y + ty, s] });
  const off = (hx, hy, tx, ty, s = 1) => ({ arm2: [OFF[0], OFF[1], X + hx, Y + hy], axe2: [X + hx, Y + hy, X + tx, Y + ty, s] });
  const D = '#c9b27c', R = '#ff6b4a', W2 = '#ffffff';
  /* BATTLE ROAR: the breath in, axes down and back; then head back, both fists punched up at the sky, the roar's lines off his mouth */
  F.bzRoar = [KF({ dy: 1, legs: 'wide', ...lead(1, 4, -4, 9, -1), ...off(-4, 4, -9, 9, -1), plume: 0 }),
    KF({ dy: -1, legs: 'wide', sho: 1, hy: -1, ...lead(3, -8, 5, -17), ...off(-3, -8, -5, -17), plume: 2, bits: [o(2, -4, R), o(4, -5, R), o(5, -3, R)] })];
  /* ==== THE RAGE WIND-UP (claude/chargetiers, greybox - the art lane redraws): held past the double chop's wind, his body changes with the blow.
     bzWind2 (T2 THE WHIRL held): coiled low and twisted away, both axes swept back level behind him for the turn - two shaking beats.
     bzWind3 (T3 GROUND-SPLITTER held): up on his toes, both axes high over his head together, a red glow at the heads - two shaking beats.
     bzTier2 (the cleave): the axes out level, turning - ahead, through behind (his back to them), round again, the follow - four frames.
     bzTier3 (the splitter): both axes over the top, down, and BURIED in the floor ahead with him crouched over the hafts - three frames. ==== */
  { const O = '#ff8a4c', RD = '#ff3a2a';
    F.bzWind2 = [KF({ dx: -1, dy: 2, legs: 'crouch', legsDy: 2, sho: 1, ...lead(-4, 2, -13, 0, -1), ...off(-6, 1, -15, -2, -1), plume: 2, bits: [o(-14, -1, O)] }),
      KF({ dx: -2, dy: 2, legs: 'crouch', legsDy: 2, sho: 1, ...lead(-4, 3, -13, 1, -1), ...off(-6, 2, -15, -1, -1), plume: 1, bits: [o(-16, 0, O), o(-12, 2, W2)] })];
    F.bzWind3 = [KF({ dy: -2, legs: 'jump2', sho: 1, hy: -1, ...lead(1, -9, 1, -19), ...off(-1, -9, -2, -19), plume: 2, bits: [o(0, -20, RD), o(2, -21, R)] }),
      KF({ dy: -2, legs: 'jump2', sho: 1, hy: -1, ...lead(1, -10, 2, -20), ...off(-1, -10, -1, -20), plume: 1, bits: [o(1, -22, RD), o(-1, -21, R), o(3, -19, W2)] })];
    F.bzTier2 = [KF({ wide: 10, dx: 2, legs: 'runC', ...lead(6, 0, 15, -1, -1), ...off(-6, 0, -14, 1, -1), plume: 1, bits: [o(16, -1, W2)] }),
      KF({ wide: 10, legs: 'wide', dy: 1, sho: 1, ...lead(1, 2, -6, 3, -1), ...off(2, 2, 9, 3, -1), plume: 2, bits: [o(-15, 1, O), o(14, 2, O), o(-13, 3, W2), o(12, 0, W2)] }),
      KF({ wide: 10, dx: 1, legs: 'runC', ...lead(-7, 0, -16, -1, -1), ...off(6, 0, 15, 1, -1), plume: 0, bits: [o(-17, -1, W2)] }),
      KF({ wide: 8, dx: 2, legs: 'wide', ...lead(6, 2, 13, 6, -1), ...off(4, 3, 11, 7, -1), plume: 1 })];
    F.bzTier3 = [KF({ dy: -1, legs: 'wide', sho: 1, ...lead(3, -8, 8, -17), ...off(1, -8, 6, -17), plume: 2, bits: [o(7, -18, RD)] }),
      KF({ wide: 10, dx: 2, dy: 1, legs: 'runC', ...lead(6, 0, 14, 6, 1), ...off(5, 1, 13, 5, -1), plume: 2, bits: [o(14, 7, R), o(16, 6, W2)] }),
      KF({ wide: 10, dx: 3, dy: 4, legs: 'crouch', legsDy: 3, ...lead(6, 5, 12, 11, -1), ...off(5, 6, 13, 11, -1), plume: 0, bits: [o(10, 11, D), o(15, 11, D), o(12, 12, RD), o(13, 10, RD), o(9, 12, D), o(17, 12, D), o(14, 9, W2)] })]; }
  /* THE SPIN: arms out, one head ahead and one behind, turning (a cycle of three) */
  F.bzSpin = [KF({ wide: 8, legs: 'runC', ...lead(5, 0, 14, -1, -1), ...off(-7, 0, -15, 1, -1), plume: 1 }),
    KF({ wide: 8, legs: 'wide', dy: 1, ...lead(2, 2, 6, 5, -1), ...off(-2, 2, -6, 5, -1), plume: 2, bits: [o(13, 0, W2), o(-13, 0, W2)] }),
    KF({ wide: 8, legs: 'runC', ...lead(-7, 0, -15, -1, -1), ...off(5, 0, 14, 1, -1), plume: 0 })];
  /* HARDEN: the axes dropped, fists clenched at his sides, every muscle set - his skin goes to leather (dark bits on the arms and chest) */
  F.bzHarden = [KF({ legs: 'wide', ...lead(2, 6, 4, 10, -1), ...off(-2, 6, -4, 10, -1), plume: 0 }),
    KF({ legs: 'wide', dy: 1, sho: 1, ...lead(3, 5, 6, 10, -1), ...off(-3, 5, -6, 10, -1), plume: 1, bits: [o(-2, 0, '#8a5a3a'), o(0, 1, '#8a5a3a'), o(-1, 3, '#8a5a3a')] })];
  /* GREAT CLEAVE: both hands on one axe, up behind him, then brought round in one long cut at full stretch */
  F.bzCleave = [KF({ dx: -2, legs: 'wide', ...lead(-1, -6, -8, -13), ...off(-2, -5, -9, -11), plume: 1 }),
    KF({ wide: 12, dx: 3, legs: 'runC', ...lead(7, 0, 17, 1, -1), ...off(6, 1, 15, 3, -1), plume: 2, bits: [o(19, 1, W2), o(18, 3, W2), o(17, 5, W2)] })];
  /* RAMPAGE: head down, both axes out in front like horns, at a run */
  F.bzRamp = [KF({ wide: 6, dx: 2, dy: 2, legs: 'run1', sho: 1, ...lead(5, 1, 12, -4), ...off(3, 2, 10, -3), plume: 2 }),
    KF({ wide: 6, dx: 2, dy: 1, legs: 'run4', sho: 1, ...lead(5, 2, 12, -3), ...off(3, 3, 10, -2), plume: 1 })];
  /* SHRUG IT OFF: shoulders rolled and the head shaken, the mane flying */
  F.bzShrug = [KF({ legs: 'wide', sho: 1, hy: -1, ...lead(3, 3, 7, -5), ...off(-4, 3, -8, -5), plume: 2 }),
    KF({ legs: 'stand', dy: 1, ...lead(3, 2, 6, -7), ...off(-3, 3, -7, -5), plume: 1, bits: [o(-6, -7, D), o(5, -8, D)] })];
  /* LAST STAND: one knee down, an axe planted in the ground before him like a standard, the other raised */
  F.bzStand = [KF({ dy: 2, legs: 'kneel', ...lead(5, 4, 8, 10, -1), ...off(-2, -6, -2, -15), plume: 1 }),
    KF({ dy: 2, legs: 'kneel', hy: -1, ...lead(5, 4, 8, 10, -1), ...off(-2, -7, -1, -16), plume: 2, bits: [o(-1, -18, R)] })];
  /* UNCHAINED: he tears at nothing - fists to his chest, then flung out, the war-paint glowing */
  F.bzUnch = [KF({ dy: 1, legs: 'wide', ...lead(1, 1, 4, -7), ...off(-1, 1, -4, -7), plume: 0, bits: [o(-2, 1, R), o(0, 2, R)] }),
    KF({ dy: -2, legs: 'wide', sho: 1, hy: -1, ...lead(6, -4, 13, -10), ...off(-7, -4, -14, -10), plume: 2, bits: [o(-2, 1, R), o(0, 2, R), o(-1, 4, R), o(1, -3, R)] })];
  /* AXE STORM: a hatchet from the belt flung underhand, then another overhand - the fan comes out of his arm */
  F.bzStorm = [KF({ dx: -1, legs: 'wide', ...lead(-2, 3, -6, -5), arm2: [OFF[0], OFF[1], X - 2, Y + 6], plume: 1, bits: [o(-2, 7, '#8c8a7e')] }),
    KF({ wide: 6, dx: 2, legs: 'runC', ...lead(4, -1, 8, -9), arm2: [OFF[0], OFF[1], X + 7, Y - 2], plume: 2, bits: [o(10, -4, W2), o(12, -2, W2), o(11, 0, W2)] })];
  /* ==== HERO PASS A ART (claude/heropassaart): the SHOULDER BARGE. WIND - weight dropped on the back foot, both axes hauled up and back out of the way, the shoulder dipping; DRIVE - head tucked behind the shoulder and the whole
     of him thrown forward, the axes trailing, a white bar down the line of the shoulder and the wind torn off it; SHOVE - the shoulder in, dust off the heels and the impact stars where it met them ==== */
  const bargeLines = [[11, 5, W2], [12, 5, W2], [13, 5, D], [11, 8, W2], [12, 8, D], [11, 11, D]];
  F.bzBarge = [KF({ dx: -2, dy: 2, sho: 1, legs: 'wide', ...lead(-1, -3, -8, -9, -1), ...off(-3, -2, -10, -7, -1), plume: 1 }),
    KF({ wide: 8, dx: 5, dy: 2, hy: 2, sho: 1, legs: 'run1', ...lead(-3, -2, -11, -9, -1), ...off(-4, -1, -12, -5, -1), plume: 2, bits: [...bargeLines, [-4, 6, D], [-6, 6, D], [-8, 7, '#8a7a5a'], [-5, 10, D], [-7, 10, '#8a7a5a']] }),
    KF({ wide: 8, dx: 4, dy: 1, hy: 1, sho: 1, legs: 'wide', ...lead(-2, -1, -10, -8, -1), ...off(-3, 0, -11, -4, -1), plume: 1, bits: [[16, 6, W2], [17, 5, R], [17, 8, W2], [18, 7, R], [16, 10, R], [18, 4, D], [19, 9, D], [-2, 16, D], [-4, 15, D], [0, 17, D]] })];
  riposteKit(F, 'berserker', KF, { X, Y, OFF, lead, off });
}
/* EVERY ABILITY HAS A BODY: THE GEOMANCER'S NINE (src/hero-poses.js plays them; tools/ability-poses.mjs holds her to it). Every
   one is told by what the STAVE does - and every spell begins with the butt going into the ground, so most of them start there. */
function geoKitPoses(F, sh) {
  const [X, Y] = sh, OFF = [BX + 2, BY + 7], KF = f => knightFrame({ top: ATTACK_HEADROOM, ...f });
  const o = (x, y, col) => [X - BX + x, Y - BY + y, col];
  const A = '#e8a83a', D = '#c9b27c', M = '#8c8a7e', MS = '#6f9a4a';
  /* ==== THE THREE-TIER STAVE (claude/chargetiers, greybox - the art lane redraws). gWind3 (T3 RISING PILLAR held): the stave lifted crossways over her head in both hands, the geode
     blazing, grit lifting round her feet - two beats. gShard (T1 STONE SHARD): the stave whipped forward level, a shard of stone off the geode. gPillar (T3 let go): the butt driven
     down, then both hands heaved up palms-first as the pillar comes - two frames ==== */
  { const E = '#ff8a3a', G = '#fff0c0';
    F.gWind3 = [KF({ dy: -1, legs: 'wide', sho: 1, arm: [X, Y, X + 4, Y - 8], arm2: [OFF[0], OFF[1], X - 3, Y - 8], stave: [X - 7, Y - 10, X + 9, Y - 11], plume: 2, bits: [o(9, -12, A), o(10, -13, G), o(-2, 10, D), o(4, 10, D)] }),
      KF({ dy: -1, legs: 'wide', sho: 1, arm: [X, Y, X + 4, Y - 9], arm2: [OFF[0], OFF[1], X - 3, Y - 9], stave: [X - 7, Y - 11, X + 9, Y - 12], plume: 1, bits: [o(9, -13, E), o(10, -14, G), o(0, 9, D), o(6, 9, M)] })];
    F.gShard = [KF({ wide: 6, dx: 1, legs: 'runC', arm: [X, Y, X + 5, Y - 3], arm2: [OFF[0], OFF[1], X + 2, Y - 2], stave: [X - 4, Y - 1, X + 12, Y - 5], plume: 2, bits: [o(14, -6, A), o(15, -5, M)] }),
      KF({ wide: 8, dx: 2, legs: 'wide', arm: [X, Y, X + 6, Y - 2], arm2: [OFF[0], OFF[1], X + 3, Y - 1], stave: [X - 3, Y, X + 13, Y - 3], plume: 1, bits: [o(18, -4, M), o(19, -4, D), o(17, -5, A)] })];
    F.gPillar = [KF({ wide: 4, dx: 1, dy: 2, legs: 'wide', arm: [X, Y, X + 5, Y - 1], arm2: [OFF[0], OFF[1], X + 4, Y + 1], stave: [X + 7, Y + 9, X + 6, Y - 9], plume: 2, bits: [o(6, 9, D), o(10, 9, D), o(8, 8, E)] }),
      KF({ dy: -1, legs: 'wide', sho: 1, arm: [X, Y, X + 6, Y - 6], arm2: [OFF[0], OFF[1], X + 5, Y - 7], stave: [X - 6, Y + 8, X - 2, Y - 10, 'back'], plume: 2, bits: [o(8, -9, E), o(7, -10, G), o(12, 6, M), o(12, 2, D)] })]; }
  /* EARTHFALL (B16, claude/plunges - her plunge has its OWN windup and release). The windup: the stave lifted point-down high over her head in both hands, the geode blazing; then the fall with it driven down
     under her, the butt first and grit streaming up. The release (earthHit, played as she lands): the butt of the stave in the ground, her weight on it and the grit flung off it; then her coming up off it. */
  F.earthWind = [KF({ dy: -1, sho: 1, hy: -1, legs: 'jump2', arm: [X, Y, X + 2, Y - 9], arm2: [OFF[0], OFF[1], X - 2, Y - 9], stave: [X, Y - 17, X + 1, Y + 1], plume: 2, bits: [o(-3, -19, A), o(3, -19, A)] }),
    KF({ legs: 'fall2', hy: 1, arm: [X, Y, X, Y + 3], arm2: [OFF[0], OFF[1], X - 1, Y + 2], stave: [X - 1, Y + 16, X - 2, Y - 5], plume: 2, bits: [o(-4, 3, M), o(4, 5, D), o(-5, 9, M), o(5, 12, D)] })];
  F.earthHit = [KF({ dy: 4, legs: 'crouch', legsDy: 3, arm: [X, Y, X + 2, Y + 4], arm2: [OFF[0], OFF[1], X + 1, Y + 5], stave: [X + 3, Y + 11, X + 2, Y - 4], plume: 2, bits: [o(8, 11, M), o(9, 9, M), o(10, 11, D), o(-3, 11, D), o(-5, 10, M), o(0, 8, A)] }),
    KF({ dy: 2, legs: 'wide', arm: [X, Y, X + 3, Y + 2], arm2: [OFF[0], OFF[1], X + 1, Y + 3], stave: [X + 4, Y + 9, X + 2, Y - 7], plume: 1, bits: [o(9, 9, M), o(10, 8, D), o(-4, 9, D)] })];
  /* STONE STEP: in the air, the stave jabbed straight down under her boots onto the stone that rises to meet it, knees up */
  F.gStep = [KF({ legs: 'tuck', dy: -2, arm: [X, Y, X, Y + 3], arm2: [OFF[0], OFF[1], X - 1, Y + 2], stave: [X, Y + 14, X - 2, Y - 7], plume: 1 }),
    KF({ legs: 'jump', dy: -3, sho: 1, arm: [X, Y, X + 1, Y + 1], arm2: [OFF[0], OFF[1], X, Y + 1], stave: [X + 1, Y + 11, X - 1, Y - 10], plume: 2, bits: [o(0, 12, M), o(2, 12, M), o(-2, 12, M)] })];
  /* BOULDER: down low with the stave under the stone like a lever, then HEAVED up and through - both arms flung forward after it */
  F.gHeave = [KF({ dx: -2, dy: 3, legs: 'crouch', arm: [X, Y, X + 2, Y + 4], arm2: [OFF[0], OFF[1], X - 1, Y + 4], stave: [X - 6, Y + 3, X + 9, Y + 7], plume: 1 }),
    KF({ wide: 6, dx: 2, dy: 1, legs: 'runC', arm: [X, Y, X + 6, Y - 1], arm2: [OFF[0], OFF[1], X + 4, Y - 1], stave: [X - 3, Y + 7, X + 12, Y - 4], plume: 2, bits: [o(15, -2, M), o(16, -3, M)] }),
    KF({ wide: 6, dx: 3, legs: 'wide', arm: [X, Y, X + 7, Y - 3], arm2: [OFF[0], OFF[1], X + 5, Y - 4], stave: [X - 2, Y + 6, X + 11, Y - 6], plume: 0 })];
  /* SPIKE ROW: down on one knee and the stave driven in on the slant ahead of her, the spikes going away from the point of it */
  F.gSpikes = [KF({ dy: 2, legs: 'kneel', arm: [X, Y, X + 3, Y - 5], arm2: [OFF[0], OFF[1], X + 2, Y - 4], stave: [X + 4, Y - 3, X + 1, Y - 17], plume: 1 }),
    KF({ wide: 8, dy: 3, legs: 'kneel', arm: [X, Y, X + 5, Y + 1], arm2: [OFF[0], OFF[1], X + 3, Y + 2], stave: [X + 9, Y + 8, X - 1, Y - 6], plume: 2, bits: [o(12, 6, M), o(15, 5, M), o(18, 4, M), o(11, 8, D)] })];
  /* ARCHWAY: the stave raised flat over her head in both hands, as if she were holding the arch up herself */
  F.gArch = [KF({ dy: 1, legs: 'wide', arm: [X, Y, X + 2, Y - 6], arm2: [OFF[0], OFF[1], X - 4, Y - 6], stave: [X - 8, Y - 6, X + 6, Y - 8], plume: 1 }),
    KF({ dy: -1, legs: 'wide', sho: 1, hy: -1, arm: [X, Y, X + 3, Y - 10], arm2: [OFF[0], OFF[1], X - 5, Y - 10], stave: [X - 9, Y - 10, X + 7, Y - 12], plume: 2, bits: [o(-6, -13, M), o(0, -14, M), o(5, -14, M)] })];
  /* STONE WALL (level 9, 2026-09-24 - her old C, the RAISE WALL frames it used): the stave swung up across her, then the butt driven
     into the ground in front of her with both hands high on the haft and her weight down on it, a spray of grit off its foot */
  F.gWall = [KF({ dy: -1, legs: 'wide', arm: [X, Y, X + 2, Y - 6], arm2: [OFF[0], OFF[1], X - 2, Y - 4], stave: [X - 6, Y + 2, X + 6, Y - 12], plume: 1 }),
    ...[0, 1].map(i => KF({ dy: 1 + i, legs: 'wide', arm: [X, Y, X + 4, Y - 4 + i], arm2: [OFF[0], OFF[1], X + 3, Y - 1 + i], stave: [X + 6, Y + 9 - i, X + 4, Y - 9 + i], plume: i + 1, bits: [o(5, 9 - i, D), o(8, 9 - i, D), o(4, 8 - i, M)] }))];
  /* ENTOMB: both hands on the stave, the stone swung down onto them like a lid being shut */
  F.gTomb = [KF({ dy: -1, legs: 'wide', arm: [X, Y, X + 1, Y - 6], arm2: [OFF[0], OFF[1], X - 1, Y - 6], stave: [X + 2, Y - 3, X - 6, Y - 16], plume: 1 }),
    KF({ wide: 8, dx: 2, dy: 2, legs: 'runC', arm: [X, Y, X + 5, Y + 1], arm2: [OFF[0], OFF[1], X + 3, Y + 1], stave: [X - 1, Y - 2, X + 13, Y + 6], plume: 2, bits: [o(16, 6, M), o(15, 8, M), o(17, 8, D)] })];
  /* FAULT LINE: wide-legged, the butt dragged through the ground along the line the crack will run */
  F.gFault = [KF({ dx: -1, dy: 2, legs: 'wide', arm: [X, Y, X + 3, Y + 2], arm2: [OFF[0], OFF[1], X, Y + 3], stave: [X + 9, Y + 9, X - 3, Y - 6], plume: 1 }),
    KF({ wide: 8, dx: 2, dy: 3, legs: 'wide', sho: -1, arm: [X, Y, X + 5, Y + 3], arm2: [OFF[0], OFF[1], X + 2, Y + 4], stave: [X + 13, Y + 9, X, Y - 5], plume: 2, bits: [o(15, 9, D), o(17, 9, D), o(19, 9, M)] })];
  /* GOLEM: the stave held high in one fist to call it up, the other hand beckoning it out of the ground */
  F.gGolem = [KF({ dy: -1, legs: 'wide', sho: 1, arm: [X, Y, X + 1, Y - 7], arm2: [OFF[0], OFF[1], X + 3, Y + 3], stave: [X + 1, Y - 2, X + 2, Y - 18], plume: 1, glow: [X + 2, Y - 16] }),
    KF({ legs: 'wide', arm: [X, Y, X + 1, Y - 7], arm2: [OFF[0], OFF[1], X + 6, Y + 1], stave: [X + 1, Y - 2, X + 2, Y - 18], plume: 2, bits: [o(9, 8, MS), o(10, 7, M), o(12, 8, M)] })];
  /* AVALANCHE: both arms up and the stave held flat at the sky, the hood thrown back - then brought down and the butt hammered in */
  F.gAval = [KF({ dy: -2, legs: 'wide', sho: 1, hy: -1, arm: [X, Y, X + 3, Y - 10], arm2: [OFF[0], OFF[1], X - 4, Y - 10], stave: [X - 7, Y - 12, X + 6, Y - 13], plume: 2, bits: [o(-4, -18, M), o(4, -20, M), o(9, -17, M)] }),
    KF({ dy: 3, legs: 'crouch', arm: [X, Y, X + 4, Y], arm2: [OFF[0], OFF[1], X + 3, Y + 1], stave: [X + 6, Y + 9, X + 5, Y - 8], plume: 0, bits: [o(3, 9, D), o(9, 9, D), o(1, 8, M), o(11, 8, M), o(5, -14, A)] })];
  /* ==== HERO PASS A ART (claude/heropassaart): the STONE SHRUG (her air dodge: she does not move). GATHER - hunched in the air with the stave brought flat across her shoulders and the first plates of stone lifting off
     her; SET - the stone skin shut over head, shoulders and back like a shell, the amber heart showing through the seam ==== */
  const plate = (x, y) => [o(x, y, M), o(x + 1, y, M), o(x, y + 1, D), o(x + 1, y + 1, M)];
  F.gShrug = [KF({ dy: -2, hy: 2, sho: 1, legs: 'tuck', arm: [X, Y, X + 3, Y - 5], arm2: [OFF[0], OFF[1], X - 2, Y - 5], stave: [X - 9, Y - 6, X + 9, Y - 7], plume: 1, bits: [...plate(-4, -9), ...plate(4, -9), o(-7, -3, M), o(8, -2, D), o(0, -12, M)] }),
    KF({ dy: -2, hy: 3, sho: 1, legs: 'tuck', arm: [X, Y, X + 3, Y - 4], arm2: [OFF[0], OFF[1], X - 2, Y - 4], stave: [X - 9, Y - 5, X + 9, Y - 6], plume: 0, bits: [...plate(-4, -10), ...plate(0, -12), ...plate(4, -10), ...plate(-8, -5), ...plate(8, -5), ...plate(-8, 1), ...plate(9, 0), o(-6, -8, D), o(6, -8, D), o(0, -4, A), o(1, -4, A), o(-2, -2, M), o(4, -2, D)] })];
  riposteKit(F, 'geomancer', KF, { X, Y, OFF });
}

// THE BELLMAN (UNDERLEAF 2, claude/underleaf2) - the blind night-watchman: a long watch-coat, a wide hat, a cloth over his eyes, a brass EAR
// TRUMPET at his ear and a HANDBELL at his side. 14x17, faces right. Frames: 0/1 walk, 2 listen (the trumpet up), 3 ring (the bell over his
// head), 4 swing (the bell out at you), 5 knocked back.
export function bakeBellman() {
  const BP = Object.assign({}, EP, { c: '#3a4258', C: '#262c3c', h: '#2a2430', H: '#4a3e50', k: '#e8dcc0', y: '#e0b040', Y: '#a8842a', z: '#6a5a40', N: '#3a2a1c' });
  const f = rows => outline(fromGrid(rows, BP, 1), OUT);
  const hat = ['....hhhh......', '...hHhhhh.....', '.hhhhhhhhhh...'];
  const head = ['...gkkkkgYy...', '...ggggggyyy..', '....gGGg..y...'];
  const coat = ['...cccccc.....', '..cCccccCc....', '..cccccccc....', '..cCccccccz...', '..cccccc.zz...', '..cCcccc.yyy..', '..cccccc.yyy..', '...cccc...y...'];
  const legA = ['...NN..NN.....', '..NN....NN....', '.NNN....NNN...'], legB = ['....NNNN......', '...NN..NN.....', '..NN....NN....'];
  const walkA = f([...hat, ...head, ...coat, ...legA]), walkB = f([...hat, ...head, ...coat, ...legB]);
  const listen = f([...hat, '...gkkkkgYYy..', '...ggggggyyyy.', '....gGGg..yy..', ...coat, ...legA]);
  const bare = ['...cccccc.....', '..cCccccCc....', '..cccccccc....', '..cCcccccc....', '..cccccc......', '..cCcccc......', '..cccccc......', '...cccc.......'];
  const ring = f(['....hhhh..yyy.', '...hHhhhh.yyy.', '.hhhhhhhhhyYy.', '...gkkkkg..z..', '...gggggg.zz..', '....gGGg.cc...', ...bare, ...legA]);
  const swing = f([...hat, '...gkkkkg.....', '...gggggg.....', '....gGGg......', '...cccccc.....', '..cCccccCc....', '..cccccccczzz.', '..cCcccccc.yyy', '..cccccc...yyy', '..cCcccc....y.', '..cccccc......', '...cccc.......', ...legA]);
  const stun = f(['..............', '.hhhh.........', 'hhhhhhhh......', '...gkkkkg.....', '...ggoggg.....', '....gGGg......', ...coat, ...legB]);
  return pack([walkA, walkB, listen, ring, swing, stun], 8, 18, 10, 17);
}
