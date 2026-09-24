// chars.js — the knight and the forest's enemies, baked from text grids + drawn sword.
import { kingFrames, KING_AX, KING_AY } from './king_swim.js';
import { canvas, px, rect, line, circle, ellipse, fillPoly, fromGrid, outline, flipX, whiten } from './px.js';
import { OUT } from './art.js';

const KP0 = { // knight palette
  s: '#c9d1dc', S: '#7c8797', b: '#3d5aa8', B: '#243a78', r: '#c9463d', k: '#f1c9a0',
  w: '#7a4a2a', W: '#4c2c17', y: '#e0b040', v: '#2a2f3d', o: OUT,
};
let KP = Object.assign({}, KP0);
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
let SPEARLESS = false;   /* baking the Warden's BARE set (her JAVELIN is out of her hands): every frame, no spear */
function knightFrame({ legs = 'stand', dy = 0, dx = 0, sword = null, arm = null, plume = 0, shield = false, legsDy = 0, staff = null, maul = null, glow = null, cutlass = null, pistol = null, hook = null, scythe = null, greatsword = null, spear = null, wide = 0, hy = 0, sho = 0, bits = null, kite = null, top = 0, arm2 = null, stave = null }) {
  const [c, g] = canvas(W + wide, H + top); g.translate(0, top);
  const draw = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const k = r[x]; if (k !== '.' && KP[k]) px(g, ox + x, oy + y, KP[k]); } });
  const body = PLUME_REF[plume].concat(BODY_REF.slice(3));
  if (kite && kite.back) draw(KITE, BX + dx + kite.x, BY + dy + kite.y);   /* slung on his back (the ladder): drawn first, so the body covers all but its rim */
  if (!hy && !sho) draw(body, BX + dx, BY + dy);
  else { /* A BREATH IS NOT A BOB. The shoulders come up first - the outermost pixel of each torso row lifts one - and the
       helm has its own offset, so the chest can rise under a head that has not moved yet, and the head can sink after it. */
    body.slice(6).forEach((r, y) => { const l = r.search(/[^.]/), rr = r.length - 1 - [...r].reverse().findIndex(ch => ch !== '.');
      for (let x = 0; x < r.length; x++) { const k = r[x]; if (k !== '.' && KP[k]) px(g, BX + dx + x, BY + dy + 6 + y - (y < 4 && (x === l || x === rr) ? sho : 0), KP[k]); } });
    if (hy < 0) draw([body[5]], BX + dx, BY + dy + 5);   /* a lifted helm stretches the neck rather than leaving a gap under it */
    draw(body.slice(0, 6), BX + dx, BY + dy + hy); }
  draw(LEGS[legs], BX + dx, BY + 11 + legsDy);
  if (kite && !kite.back) draw(KITE, BX + dx + kite.x, BY + dy + kite.y);   /* on the off arm across his front: under the sword arm, over the tabard */
  if (arm2) line(g, arm2[0] + dx, arm2[1] + dy, arm2[2] + dx, arm2[3] + dy, KP.S, 2);   /* THE OFF ARM, drawn only where an ability puts it to work (a throw, a cry): over the kite, under the sword arm */
  if (arm) line(g, arm[0] + dx, arm[1] + dy, arm[2] + dx, arm[3] + dy, KP.S, 2);
  if (sword) {
    const [x0, y0, x1, y1] = sword.map((v, i) => v + (i & 1 ? dy : dx));
    line(g, x0, y0, x1, y1, KP.s, 2);
    px(g, x0, y0, KP.w); px(g, x0 + 1, y0, KP.w);
    const gx = Math.sign(x1 - x0), gy = Math.sign(y1 - y0);
    px(g, x0 + gx - gy, y0 + gy + gx, KP.y); px(g, x0 + gx + gy, y0 + gy - gx, KP.y);
  }
  if (staff) { // a wooden staff with an ember at its head
    const [x0, y0, x1, y1] = staff.map((v, i) => v + (i & 1 ? dy : dx));
    line(g, x0, y0, x1, y1, KP.w, 2); px(g, x1, y1, KP.y); px(g, x1 + Math.sign(x1 - x0), y1 + Math.sign(y1 - y0), KP.r); px(g, x1 - Math.sign(y1 - y0), y1 + Math.sign(x1 - x0), KP.r);
  }
  if (maul) { // THE PALADIN'S MAUL: an oak haft, a gold langet, and a squared steel head wedged across the
    // end of it. It was one thin bar laid over a stick, which at this size reads as an axe blade.
    const [x0, y0, x1, y1] = maul.map((v, i) => v + (i & 1 ? dy : dx));
    const len = Math.hypot(x1 - x0, y1 - y0) || 1, ax = (x1 - x0) / len, ay = (y1 - y0) / len, qx = -ay, qy = ax;
    line(g, x0, y0, x1, y1, '#6a4428', 2);                                              // the haft
    px(g, Math.round(x0 - ax), Math.round(y0 - ay), '#4a2e18');                          // its butt
    const hx = x1 - ax * 0.5, hy = y1 - ay * 0.5;
    const across = (t, hw, col) => line(g,
      Math.round(hx + ax * t - qx * hw), Math.round(hy + ay * t - qy * hw),
      Math.round(hx + ax * t + qx * hw), Math.round(hy + ay * t + qy * hw), col, 1);
    for (let t = -2; t <= 2; t++) across(t, 3.5, KP.o);                                   // the block, outlined all round
    for (let t = -1; t <= 1; t++) across(t, 2.5, t === -1 ? '#6e7a8c' : t === 1 ? '#e8eef6' : '#aab6c6');
    across(-3, 1.6, KP.y);                                                                // the langet, gold on the haft
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
      px(g, ...at(len - t), t > 2 ? '#8a939f' : '#e8eef6');
      if (t === 3 || t === 2) px(g, ...at(len - t, 1), '#7c8797');
    }
    px(g, ...at(len), '#ffffff');                                        // the point, the brightest pixel she owns
  }
  if (stave) { /* THE GEOMANCER'S STAVE: short, thick and two-handed - an oak haft two pixels through, an iron-shod BUTT (the end
       she strikes the ground with, so it is the end drawn brightest after the stone), rawhide lashing, and a raw STANDING
       STONE for a head, wider than her own head and set along the haft. Grey stone, a tuft of moss, one faint amber rune.
       Given butt first: [butt x, butt y, head x, head y]. */
    const [x0, y0, x1, y1] = stave.map((v, i) => v + (i & 1 ? dy : dx));
    const len = Math.hypot(x1 - x0, y1 - y0) || 1, ax = (x1 - x0) / len, ay = (y1 - y0) / len, qx = -ay, qy = ax;
    const at = (t, o = 0) => [Math.round(x0 + ax * t + qx * o), Math.round(y0 + ay * t + qy * o)];
    /* (2026-09-24, POLISH: the head was a 6x5 ROUNDED SLAB, as wide as it was long and symmetric about the haft, on a thin
       handle - which at 1x is a SHOVEL. A standing stone is TALLER THAN IT IS WIDE, lumpy and lopsided, and a lashed one has
       the wood running up INTO its foot under two turns of rawhide. So: an eight-pixel stone, wider than her hood, that swells off one side of the
       haft and ends in a BLUNT, lopsided crown (a point would make it a spearhead); the haft carried two pixels into its foot; two pale bands crossing it.
       Nothing is drawn past `len`, so the reach every attack box was matched to is unchanged.) */
    line(g, ...at(1), ...at(len - 5), '#6a4e30', 2);                     /* the haft, two through, run up into the foot of the stone */
    for (let t = 2; t <= len - 6; t += 0.5) px(g, ...at(t, 1.5), '#4a3420');   /* its shadowed side, the whole way: a THICK shaft, not a handle */
    px(g, ...at(0), '#8a929c'); px(g, ...at(0, 1), '#5a6068'); px(g, ...at(-1), '#c9d1dc');   /* the iron shoe of the butt */
    /* THE STONE, its foot at len-8 and its crown at len: half-widths either side of the haft, one row a pixel, so it is
       lopsided on purpose - it bellies out on the near side, and the crown is broad and flat-ish, never a point */
    const NEAR = [1.5, 2, 2.5, 3, 3, 3, 3, 2.5, 1.5], FAR = [1.5, 2, 2, 2, 2, 2, 1.5, 1.5, 0.5];
    for (let k = 0; k < NEAR.length; k++) { const t = len - 8 + k;
      for (let o = -NEAR[k]; o <= FAR[k] + 0.01; o += 0.5) {
        const edge = o <= -NEAR[k] + 0.5, lit = o >= FAR[k] - 0.5;
        px(g, ...at(t, o), edge ? '#4e4c45' : lit ? '#a4a294' : k > 6 ? '#939184' : '#7c7a70'); } }
    px(g, ...at(len - 3, -1), '#6c6a60'); px(g, ...at(len - 4, -1.5), '#6c6a60');   /* a crack down its face, so it reads as ROCK */
    for (const t of [len - 7.5, len - 6]) for (let o = -1.5; o <= 1.5; o += 0.5) px(g, ...at(t, o), o > 0.5 ? '#6a5030' : '#9a7a4c');   /* THE LASHING: two dark turns of rawhide round the foot, the stone showing between */
    px(g, ...at(len - 3.5, 0.5), '#e8a83a');                             /* the rune, faint amber in the grey */
    px(g, ...at(len - 1, -1), '#6f9a4a'); px(g, ...at(len - 2, -2), '#557a38');   /* moss on the shoulder of it */
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
      px(g, Math.round(bx), Math.round(by), k > 0.82 ? '#ffffff' : '#d8dee8');
      px(g, Math.round(bx - qx), Math.round(by - qy), k > 0.5 ? '#8a939f' : '#6e7885');
    }
    px(g, Math.round(x0 - ax), Math.round(y0 - ay), '#3a2a18');                                   // the grip
    for (const [ox, oy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) px(g, Math.round(x0 + ox * qx - ax * 0.4), Math.round(y0 + oy * qy - ay * 0.4), '#e0b040');
  }
  if (pistol) { // A SHORT PISTOL: a brass barrel, a walnut butt, and the lock over the hand
    const [x0, y0, x1, y1] = pistol.map((v, i) => v + (i & 1 ? dy : dx));
    const len = Math.hypot(x1 - x0, y1 - y0) || 1, ax = (x1 - x0) / len, ay = (y1 - y0) / len, qx = -ay, qy = ax;
    line(g, x0, y0, x1, y1, '#c9a85a', 2);
    px(g, Math.round(x1), Math.round(y1), '#fff0c0'); px(g, Math.round(x1 - ax), Math.round(y1 - ay), '#e0c070');
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
    line(g, Math.round(x0 + ax * 2), Math.round(y0 + ay * 2), Math.round(x1 - ax * 2), Math.round(y1 - ay * 2), '#7a828e', 3);  /* the blade, three wide */
    line(g, Math.round(x0 + ax * 2 + qx), Math.round(y0 + ay * 2 + qy), Math.round(x1 - ax * 2 + qx), Math.round(y1 - ay * 2 + qy), '#c9d1dc', 1);
    line(g, Math.round(x0 + ax * 3), Math.round(y0 + ay * 3), Math.round(x1 - ax * 4), Math.round(y1 - ay * 4), '#3e444e', 1);  /* the fuller down the middle */
    for (let t = 4; t < len - 3; t += 5) px(g, Math.round(x0 + ax * t), Math.round(y0 + ay * t), '#8fd160');             /* the runes cut into it */
    px(g, Math.round(x1), Math.round(y1), '#eef4fa'); px(g, Math.round(x1 - ax), Math.round(y1 - ay), '#eef4fa');        /* the point */
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
      px(g, Math.round(bx), Math.round(by), k > 0.55 ? '#eef4fa' : '#c9cfd8');
      if (k < 0.8) px(g, Math.round(bx - ax), Math.round(by - ay), '#7a828e');
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
  if (bits) for (const [bx, by, k] of bits) { const col = k[0] === '#' ? k : KP[k]; if (col) px(g, BX + dx + bx, BY + dy + by, col); }   /* loose pixels, over everything: a glint, a hand, a flap of cloth */
  outline(c, OUT);
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
    f({ dx: -2, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 3, sh[1] + 1], ...wp(-3, 1, -3 + s(10), 1), plume: 1 }),
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
  const memo = new Map(), pad = c => { if (!memo.has(c)) { const [out, g] = canvas(c.width, c.height + ATTACK_HEADROOM); g.drawImage(c, 0, ATTACK_HEADROOM); memo.set(c, out); } return memo.get(c); };
  for (const key in F) F[key] = Array.isArray(F[key]) ? F[key].map(c => c ? pad(c) : c) : pad(F[key]);
}
function storeFrames(card, knight, mode) {
  const F = {};
  if (mode !== 'atk' && mode !== 'weaponIcon') F.idle = card.idle();
  if (mode === true || mode === 'atk' || mode === 'weaponIcon') F.atk = card.atk();
  if (knight && F.idle && F.idle[2]) { const g = F.idle[2].getContext('2d'); g.fillStyle = '#dfe8ff'; g.fillRect(BX + 4, BY + 4, 1, 1); }
  padHeroFrames(F);
  KP = Object.assign({}, KP0); BODY_REF = BODY; PLUME_REF = PLUME;
  return { R: F };
}
function directionalPoses(F, weapon, { make = knightFrame, extra = {}, pyro = false, scale = 1 } = {}) {
  padHeroFrames(F);
  const ay = pyro ? 20 : 22, ax = 16, reach = weapon === 'spear' ? 40 : ['maul', 'greatsword', 'staff'].includes(weapon) ? 34 : 28;
  const pose = (kind, i) => {
    const rise = kind === 'rise', dx = [-1, 1, 2, 1][i], dy = rise ? [2, 0, -1, 0][i] : [2, 3, 3, 1][i];
    const end = rise ? [[18, -3], [weapon === 'spear' ? 14 : 24, -25], [weapon === 'spear' ? 8 : 12, weapon === 'spear' ? -43 : -39], [18, -24]][i] : [[14, -12], [reach - 5, -5], [reach - 1, -4], [20, -10]][i];
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
      KF({ dx: -2, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 1, sh[1] - 4], sword: [sh[0] - 1, sh[1] - 4, sh[0] - 7, sh[1] - 10], plume: 1 })),
      () => (// 1 swing: blade straight out, body lunges
      KF({ dx: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 1], sword: [sh[0] + 4, sh[1] + 1, sh[0] + 13, sh[1] + 1], plume: 2 })),
      () => (// 2 extended: blade angled down-forward, weight forward
      KF({ dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 3], sword: [sh[0] + 3, sh[1] + 3, sh[0] + 11, sh[1] + 8], plume: 2 })),
      () => (// 3 recover: blade low
      KF({ dx: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 4], sword: [sh[0] + 2, sh[1] + 4, sh[0] + 6, sh[1] + 11], plume: 0 })),
      () => (// 4 settle
      KF({ legs: 'stand', sword: rest(), plume: 0 }))
    ].map((make, i) => (previewOnly === 'weaponIcon' && i !== 1) || (previewOnly === 'atk' && i !== 1 && i !== 2) ? null : make()))
  };
  if (previewOnly) return storeFrames(card, true, previewOnly);
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
        ...[11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(r => [7, r, 's']), [6, 22, '#ffffff'], [6, 23, '#ffffff'], [6, 24, '#ffffff']] }),
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
    crouch: KF({ dy: 3, legs: 'crouch', sword: rest(3) }),
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
  /* HIS DANCE, for the victory card. He is the one hero in the wood carrying a BOARD, so his jig is a beat on it: the
     blade swung up over the shoulder and rung off the top rim of the kite, twice, a stamp under each stroke and the
     sparks coming off the steel. Nobody else has anything to hit, which is the whole reason this one is his. */
  { const up = o => KF({ shield: true, ...o });
    const spark = extra => [[14, 3, '#ffffff'], [13, 2, '#fff6c8'], [15, 2, '#fff6c8'], [15, 4, '#fff6c8'], ...(extra ? [[16, 1, '#fff6c8'], [12, 5, '#dfe8ff']] : [])];
    const hiA = up({ dx: -1, legs: 'run1', arm: [sh[0], sh[1], sh[0] - 2, sh[1] - 4], sword: [sh[0] - 2, sh[1] - 4, sh[0] - 8, sh[1] - 10], plume: 1 });
    const hiB = up({ dx: -1, legs: 'run5', arm: [sh[0], sh[1], sh[0] - 1, sh[1] - 5], sword: [sh[0] - 1, sh[1] - 5, sh[0] - 6, sh[1] - 11], plume: 2 });
    /* the stroke lands ON the rim: the shield is painted after the sword, so the last inch of the blade goes behind
       the oak and the spark - which is painted after everything - is what says the two of them met */
    const ring = o => up({ dy: 1, arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 5], sword: [sh[0] + 2, sh[1] - 5, sh[0] + 7, sh[1] - 2], ...o });
    const ring1 = ring({ legs: 'runC', plume: 2, bits: spark(false) });
    const ring2 = ring({ legs: 'wide', plume: 0, bits: spark(true) });
    const lift = up({ legs: 'stand', arm: [sh[0], sh[1], sh[0] + 1, sh[1] - 2], sword: [sh[0] + 1, sh[1] - 2, sh[0] - 3, sh[1] - 8], plume: 1 });
    F.dance = holdFrames([[hiA, 2], [ring1, 2], [lift, 1], [hiB, 2], [ring2, 2], [lift, 1]]); }
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

/* THE LEADFOOT — the drowned keep's man-at-arms, sealed in plate, who WALKS where everything else swims.
   Drawn AGAINST his level: every other body in the Underwater Keep is a long horizontal shape and he is an
   upright one, a head taller than any of them, helm shut with a black slit and no face behind it. The halberd
   rides upright on the march so the silhouette stays vertical from across a flooded hall, and the anchor hangs
   at his back hip on its chain. The bubble line out of his seams is not in the sprite: it is emitted by
   updateLeadfoot, because it has to be there when he is off screen too.
   18x22 grid. frames: 0-3 walk (a heavy shuffle with a one-pixel sink on the contact frames)
     4 plant tell (braced wide, the haft brought down across his front)   5 sweep tell (drawn back low behind)
     6 sweep (out low in front, along the floor)                          7 plant (driven straight up overhead)
     8 anchor tell (anchor swung back on its chain)                       9 anchor (thrown, chain out in front)
     10 hurt (helm snapped back, knees gone, the haft dropped)  -- LAST, which is the frame HAS_HURT reads. */
const LF = Object.assign({}, EP, { S: '#6b7783', s: '#98a5b1', D: '#3c4650', v: '#3f8f7d', r: '#8a4a2a',
  w: '#6b4a2a', W: '#42301c', b: '#cfd8e0', c: '#8a919c', e: '#0d1216', d: '#2a323a' });
const LFW = 18, LFH = 22;
const lfBlank = () => Array(LFH).fill('.'.repeat(LFW));
const lfPut = (rows, x, y, ch) => { if (y < 0 || y >= LFH || x < 0 || x >= LFW) return;
  const a = rows[y].split(''); a[x] = ch; rows[y] = a.join(''); };
const lfStamp = (rows, art, x0, y0) => art.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') lfPut(rows, x0 + i, y0 + j, r[i]); });
const lfLine = (rows, x0, y0, x1, y1, ch) => { const n = Math.max(1, Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) lfPut(rows, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), ch); };
const LF_HELM = ['.DDDDDD.', 'DSSSSSSD', 'DSssssSD', 'DSeeeeSD', 'DSSSSSSD', '.DvvvvD.'];
const LF_TORSO = ['SSSSSSSSSS', 'DSSSSSSSSD', 'DSsvvvvsSD', 'DSSSSSSSSD', '.DSSSSSSD.', '.DSrrrrSD.', '..DSSSSD..', '..DSSSSD..'];
const LF_LEGS = [
  ['..SS..SS..', '..SS..SS..', '..SS..SS..', '..SS..SS..', '..SS..SS..', '..SS..SS..', '.DSSD.DSSD', '.dddd.dddd'],
  ['..SS..SS..', '..SS..SS..', '..SS..SS..', '.SS....SS.', '.SS....SS.', '.SS....SS.', 'DSSD..DSSD', 'dddd..dddd'],
  ['..SS..SS..', '..SS..SS..', '..SS..SS..', '..SS..SS..', '..SS...SS.', '..SS...SS.', '.DSSD.DSSD', '.dddd.dddd'],
  ['..SS..SS..', '..SS..SS..', '..SS..SS..', '..SS...SS.', '.SS....SS.', '.SS....SS.', 'DSSD..DSSD', 'dddd..dddd'],
];
const LF_BRACE = ['..SS..SS..', '..SS..SS..', '.SS....SS.', '.SS....SS.', 'SS......SS', 'SS......SS', 'SS......SS', 'dddd..dddd'];
const LF_BUCKLE = ['..........', '..SS..SS..', '..SS..SS..', '.SS....SS.', '.SS....SS.', 'SS......SS', 'SSD....DSS', 'ddd....ddd'];
const LF_AXE_UP = ['.b.', '.b.', '.bb', 'bbb', '.bb', '.b.'];
const LF_AXE_R = ['..b', 'bbb', 'bbb', '..b'];
const LF_AXE_L = ['b..', 'bbb', 'bbb', 'b..'];
const LF_ANCHOR = ['.c.', 'ccc', '.c.', 'c.c', 'ccc'];
export function bakeLeadfoot() {
  const lf = rows => outline(fromGrid(rows, LF, 1), OUT);
  const body = (rows, dy) => { lfStamp(rows, LF_HELM, 4, dy); lfStamp(rows, LF_TORSO, 3, 6 + dy); };
  const shoulderArms = (rows, dy) => { lfLine(rows, 12, 9 + dy, 14, 10 + dy, 'S'); lfPut(rows, 13, 12 + dy, 'S'); };
  const upright = (rows, dy) => { lfLine(rows, 14, 2 + dy, 14, 17, 'w'); lfPut(rows, 14, 17, 'W'); lfStamp(rows, LF_AXE_UP, 13, dy); shoulderArms(rows, dy); };
  const frames = [];
  for (let i = 0; i < 4; i++) { const r = lfBlank(), dy = i % 2 === 0 ? 1 : 0;
    lfStamp(r, LF_ANCHOR, 0, 11 + dy); lfPut(r, 3, 11 + dy, 'c');
    body(r, dy); lfStamp(r, LF_LEGS[i], 3, 14); upright(r, dy); frames.push(lf(r)); }
  { const r = lfBlank(); body(r, 0); lfStamp(r, LF_BRACE, 3, 14); lfStamp(r, LF_ANCHOR, 0, 11);   /* 4 THE PLANT, told: he sets his feet and drops the haft across his front */
    lfLine(r, 11, 10, 15, 17, 'w'); lfPut(r, 11, 10, 'W'); lfStamp(r, LF_AXE_R, 15, 16); lfLine(r, 12, 10, 13, 12, 'S'); frames.push(lf(r)); }
  { const r = lfBlank(); body(r, 0); lfStamp(r, LF_LEGS[0], 3, 14); lfStamp(r, LF_ANCHOR, 0, 11);   /* 5 THE HALBERD SWEEP, told: the whole haft drawn back behind his heels */
    lfLine(r, 13, 11, 2, 18, 'w'); lfPut(r, 13, 11, 'W'); lfStamp(r, LF_AXE_L, 0, 17); lfLine(r, 12, 11, 13, 12, 'S'); frames.push(lf(r)); }
  { const r = lfBlank(); body(r, 1); lfStamp(r, LF_BRACE, 3, 14);                                   /* 6 THE SWEEP: a long low arc out along the floor */
    lfLine(r, 5, 12, 15, 19, 'w'); lfPut(r, 5, 12, 'W'); lfStamp(r, LF_AXE_R, 15, 18); lfLine(r, 11, 13, 13, 15, 'S'); frames.push(lf(r)); }
  { const r = lfBlank(); body(r, 0); lfStamp(r, LF_BRACE, 3, 14); lfStamp(r, LF_ANCHOR, 0, 11);     /* 7 THE PLANT: driven straight up into the water over him */
    lfLine(r, 10, 13, 15, 2, 'w'); lfPut(r, 10, 13, 'W'); lfStamp(r, LF_AXE_UP, 14, 0); lfLine(r, 12, 7, 14, 4, 'S'); frames.push(lf(r)); }
  { const r = lfBlank(); body(r, 0); lfStamp(r, LF_LEGS[0], 3, 14); upright(r, 0);                  /* 8 THE ANCHOR THROW, told: it comes off his hip and swings back behind his shoulder */
    lfStamp(r, LF_ANCHOR, 0, 5); lfLine(r, 2, 8, 4, 11, 'c'); frames.push(lf(r)); }
  { const r = lfBlank(); body(r, 0); lfStamp(r, LF_BRACE, 3, 14); upright(r, 0);                    /* 9 THE ANCHOR, out in front on its chain */
    lfStamp(r, LF_ANCHOR, 15, 7); lfLine(r, 12, 10, 15, 9, 'c'); frames.push(lf(r)); }
  { const r = lfBlank(); body(r, 1); lfStamp(r, LF_BUCKLE, 3, 14); lfStamp(r, LF_ANCHOR, 0, 12);    /* 10 HURT */
    lfLine(r, 12, 12, 16, 19, 'w'); lfPut(r, 12, 12, 'W'); lfStamp(r, LF_AXE_R, 15, 18); frames.push(lf(r)); }
  return pack(frames, 8, LFH + 1, 12, LFH);
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
    spr(bow([...hood, ...bodyFull], 2)), spr(bow([...hood, ...bodyLoose])), spr(bow(hurtRows))], 6, 13, 8, 10);
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
    rect(g, x + 3, y, 24, 6, SK); rect(g, x, y + 4, 30, 14, SK); rect(g, x + 2, y + 18, 26, 4, SKD); // skull, jaw, underbite shadow
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
  const boots = (g, x, y, apart) => { rect(g, x, y, 12, 8, SKD); rect(g, x, y + 6, 13, 2, OUT); rect(g, x + apart, y, 12, 8, SKD); rect(g, x + apart, y + 6, 13, 2, OUT); };
  const robe = (g, x, y, w, h) => { rect(g, x, y, w, h, RB); rect(g, x + 2, y + 2, w - 4, 3, RBL); rect(g, x, y + h - 4, w, 4, RBD); rect(g, x - 2, y, w + 4, 4, FUR); for (let i = 0; i < w; i += 5) px(g, x + i, y + 1, '#c8bca0'); rect(g, x + 6, y + Math.floor(h / 2), w - 12, 4, BELT); rect(g, x + Math.floor(w / 2) - 3, y + Math.floor(h / 2) - 1, 6, 6, GLD); rect(g, x + Math.floor(w / 2) - 1, y + Math.floor(h / 2) + 1, 2, 2, GLD2); };
  const finish = c => outline(c, OUT);
  // ---- seated ----
  const seated = (pose) => { const [c, g] = canvas(72, 48);
    boots(g, 22, 40, 16); // feet on the litter
    robe(g, 14, 18, 44, 26); // the belly
    if (pose === 'throw') arm(g, 52, 22, 8, -16, 'fist'); else if (pose === 'reach') arm(g, 52, 24, 18, 6, 'open'); else arm(g, 52, 24, 6, 12, 'fist');
    if (pose !== 'reach') sceptre(g, 58, 36, 66, 10);
    arm(g, 18, 24, -6, 12, 'fist');
    head(g, 21, pose === 'held' ? 6 : 0, pose === 'shout' ? 1 : pose === 'reach' ? 2 : 0); crown(g, 23, pose === 'held' ? 2 : -4);
    return finish(c); };
  // ---- standing ----
  const standing = (pose) => { const [c, g] = canvas(64, 64);
    const kneel = pose === 'kneel', walk = pose === 'walk';
    if (kneel) { rect(g, 14, 52, 14, 10, SKD); rect(g, 36, 52, 14, 10, SKD); rect(g, 14, 60, 36, 2, OUT); } else boots(g, 16, 56, walk ? 22 : 18);
    const by = kneel ? 30 : 20; robe(g, 12, by, 40, kneel ? 24 : 36);
    if (pose === 'slam') { arm(g, 48, by + 4, 6, -22, 'fist'); sceptre(g, 54, by - 18, 38, by - 30); }
    else if (pose === 'reach') { arm(g, 48, by + 6, 16, 4, 'open'); }
    else if (pose === 'grab') { arm(g, 48, by + 6, 14, 10, 'fist'); }
    else if (pose === 'lift') { arm(g, 48, by + 4, 4, -20, 'open'); arm(g, 16, by + 4, -4, -20, 'open'); }
    else { arm(g, 48, by + 6, 4, 16, 'fist'); sceptre(g, 52, by + 26, 60, by - 6); }
    if (pose !== 'lift') arm(g, 16, by + 6, -4, 16, 'fist');
    head(g, 17, by - 20, pose === 'slam' ? 1 : pose === 'reach' || pose === 'grab' ? 2 : 0); crown(g, 19, by - 24);
    return finish(c); };
  return {
    seated: pack(['idle', 'throw', 'shout', 'reach', 'held'].map(seated), 36, 48, 54, 45),
    standing: pack(['stand', 'walk', 'slam', 'reach', 'grab', 'lift', 'kneel'].map(standing), 32, 64, 44, 60),
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
  for(let f=0;f<13;f++) {
    const [c,g]=canvas(116,66), down=[4,10].includes(f), spread=![0,11].includes(f), lift=[1,7,8,12].includes(f)?-18:0;
    const poly=(p,col)=>{g.fillStyle=col;g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
    for(const side of [-1,1]) {
      const X=n=>58+side*n;
      poly([[X(8),28],[X(spread?50:22),14+lift],[X(spread?55:25),27+lift],[X(spread?42:21),44],[X(15),51]],'#302c3c');
      for(let k=0;k<7;k++){const x=14+k*(spread?5:1.4),y=29+k*.9+lift*(k/7);poly([[X(x),y],[X(x+8),y-5],[X(x+3),y+15],[X(x-2),y+10]],k%2?'#554b5d':'#403747');g.fillStyle='#81717c';g.fillRect(Math.round(X(x)),Math.round(y+5),side*5,2);}
    }
    poly([[43,23],[71,23],[78,44],[69,57],[46,57],[38,44]],'#4a3d4e');
    poly([[46,39],[69,39],[70,56],[64,53],[60,59],[55,54],[47,57]],'#374b54');
    poly([[42,20],[41,4],[51,13],[64,13],[75,4],[73,24]],'#302c3c');
    poly([[43,18],[51,14],[58,19],[66,14],[74,19],[71,31],[63,36],[57,33],[49,35],[42,27]],'#d9ceb2');
    for(const x of [48,63]){g.fillStyle='#5a4d4e';g.fillRect(x-2,20,10,8);g.fillStyle='#edb24e';g.fillRect(x,down?24:21,6,down?1:5);if(!down){g.fillStyle='#241d28';g.fillRect(x+2,21,2,5);}}
    poly([[55,28],[62,27],[60,35],[56,33]],'#b49a5e');
    for(let k=0;k<9;k++){g.fillStyle=k%2?'#b59a55':'#756448';g.fillRect(46+k*3,35+Math.round(Math.sin(k/8*Math.PI)*7),2,3);}g.fillStyle='#bea15c';g.fillRect(56,42,5,5);
    for(const x of [47,64]){g.fillStyle='#b79a60';g.fillRect(x,53,3,7);for(let k=0;k<3;k++){g.fillRect(x-3+k*3,59,2,3);g.fillStyle='#e4cf99';g.fillRect(x-3+k*3,61,2,2);g.fillStyle='#b79a60';}}
    if(f===10){g.fillStyle='#513b30';g.fillRect(22,42,72,7);g.fillStyle='#83613c';g.fillRect(25,43,65,2);}
    if(f===3){g.fillStyle='#34202b';g.fillRect(56,32,5,5);}
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
  const drawStaff = () => { if (!staff) return;
    const [x0, y0, x1, y1] = staff; line(g, x0, y0 + dy, x1, y1 + dy, KP.w, 2);
    const ux = Math.sign(x1 - x0), uy = Math.sign(y1 - y0);
    // a brass cage at the head with the flame in it
    const hx = x1, hy = y1 + dy;
    if (flame !== null) { /* THE FLAME AT REST stands straight up out of the cage whatever the lean of the staff, and burns a
         different shape on every beat: 0-3 the licks, 4 the flare when it is fed */
      put(hx - 1, hy, 'y'); put(hx + 1, hy, 'y'); put(hx - 1, hy - 1, 'y'); put(hx + 1, hy - 1, 'y'); put(hx, hy, 'r'); put(hx, hy - 1, 'y');
      const LICK = [[[0, -2, 'r'], [0, -3, 'r']], [[0, -2, 'y'], [1, -2, 'r'], [1, -3, 'r']], [[0, -2, 'r']], [[0, -2, 'y'], [-1, -2, 'r'], [0, -3, 'r']],
        [[0, -2, 'y'], [-1, -2, 'r'], [1, -2, 'r'], [0, -3, 'y'], [-1, -3, 'r'], [1, -3, 'r'], [0, -4, 'r'], [-2, -1, 'r'], [2, -1, 'r']]];
      for (const [ox, oy, k] of LICK[flame]) put(hx + ox, hy + oy, k);
      return; }
    put(hx - uy, hy + ux, 'y'); put(hx + uy, hy - ux, 'y'); put(hx + ux, hy + uy, 'y');
    put(hx, hy, flick ? 'y' : 'r'); put(hx + ux * 2, hy + uy * 2, flick ? 'r' : 'y');
    put(hx + ux * 2 - uy, hy + uy * 2 + ux, 'r'); };
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
  /* CONSECRATE: the maul lifted straight up before him; then down on one knee with the head set in the turf, both hands on the
     haft, the light coming up out of the ground round it */
  F.hallow = [K({ dy: -1, legs: 'wide', arm: [X, Y, X + 2, Y - 3], arm2: [OFF[0], OFF[1], X + 1, Y - 2], maul: [X + 2, Y - 2, X + 3, Y - 13], plume: 1 }),
    K({ dy: 2, legs: 'kneel', arm: [X, Y, X + 4, Y - 2], arm2: [OFF[0], OFF[1], X + 3, Y - 1], maul: [X + 4, Y - 3, X + 6, Y + 5], plume: 2,
      bits: [a(X + 2, Y + 6, G), a(X + 10, Y + 6, G), a(X + 6, Y + 3, C), a(X, Y + 4, C), a(X + 12, Y + 4, C), a(X + 6, Y - 5, W)] })];
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
}
/* EVERY ABILITY HAS A BODY: THE DEATH KNIGHT'S BOUGHT ACTIVES (lane P, 2026-09-24). BLOOD BOIL and GRAVECALL played beside an idle
   death knight, and GRAVE TIDE, UNHOLY GROUND, DEATH COIL and DEATH GRIP all shared the one RAISE cast with SUMMON SKELETON - which
   keeps it, because the free hand down and the green coming up out of the ground is exactly what raising one is. The other five
   now have frames of their own on his rig; OFF is the off shoulder, and a() puts a loose pixel at an absolute point. */
function reaperKitPoses(F, sh) {
  const top = ATTACK_HEADROOM, [X, Y] = sh, OFF = [BX + 2, BY + 7], K = o => knightFrame({ top, ...o });
  const a = (x, y, col) => [x - BX, y - BY, col], RED = '#c0283a', PINK = '#ff6b6b', GRN = '#8fd160', DGRN = '#4f7a3a', LIT = '#dfffc0', BONE = '#b9c2cf';
  const lit = [[4, 3, LIT], [5, 3, LIT]];   /* the two lights in the helm, up bright */
  const low = [X - 3, Y + 3, X + 12, Y + 6];   /* the long blade held low across him, as he breathes (the idle's own guard) */
  /* BLOOD BOIL: hunched over the blade stood point-down before him, both hands on it; flung open with the blade out wide and the
     blood coming up off him every way; and the settle back to guard */
  F.boil = [K({ dy: 2, hy: 1, legs: 'wide', arm: [X, Y, X + 2, Y - 1], arm2: [OFF[0], OFF[1], X + 1, Y - 1], greatsword: [X + 2, Y - 1, X + 3, Y + 12], plume: 0, bits: [a(X - 2, Y + 7, RED), a(X + 5, Y + 7, RED)] }),
    K({ wide: 6, dy: -1, sho: 1, legs: 'wide', arm: [X, Y, X + 5, Y - 3], greatsword: [X + 5, Y - 3, X + 17, Y - 9], arm2: [OFF[0], OFF[1], OFF[0] - 5, OFF[1] - 4], plume: 2,
      bits: [...lit, a(X - 13, Y - 8, RED), a(X - 10, Y - 12, PINK), a(X - 15, Y - 1, PINK), a(X - 12, Y + 6, RED), a(X + 9, Y + 4, PINK), a(X + 12, Y + 1, RED), a(X - 4, Y - 14, RED), a(X + 3, Y - 13, PINK), a(X - 9, Y + 7, PINK), a(X + 6, Y + 7, RED)] }),
    K({ dy: 1, legs: 'stand', arm: [X, Y, X - 1, Y + 3], greatsword: low, plume: 1, bits: [a(X - 8, Y + 6, RED), a(X + 7, Y + 6, RED)] })];
  /* GRAVECALL: the blade driven into the ground beside him; the off hand raised with the green in it, the lights in the helm up;
     and the green coming up out of the ground on both sides of him */
  const stood = { arm: [X, Y, X + 3, Y - 1], greatsword: [X + 3, Y - 2, X + 4, Y + 13] };
  const flame = [a(OFF[0] - 3, OFF[1] - 11, GRN), a(OFF[0] - 4, OFF[1] - 10, GRN), a(OFF[0] - 2, OFF[1] - 10, GRN), a(OFF[0] - 3, OFF[1] - 12, LIT)];
  F.call = [K({ legs: 'wide', ...stood, arm2: [OFF[0], OFF[1], OFF[0] - 1, OFF[1] + 3], plume: 1 }),
    K({ legs: 'wide', hy: -1, ...stood, arm2: [OFF[0], OFF[1], OFF[0] - 3, OFF[1] - 9], plume: 2, bits: [...lit, ...flame] }),
    K({ legs: 'wide', hy: -1, ...stood, arm2: [OFF[0], OFF[1], OFF[0] - 3, OFF[1] - 9], plume: 0,
      bits: [...lit, ...flame, a(X - 14, Y + 8, GRN), a(X - 11, Y + 7, DGRN), a(X - 13, Y + 5, GRN), a(X + 9, Y + 8, GRN), a(X + 12, Y + 7, DGRN), a(X + 10, Y + 5, GRN), a(X - 16, Y + 6, LIT), a(X + 13, Y + 4, LIT)] })];
  /* DEATH COIL: the off hand drawn back with the knot of blood in it; then flung out past him, and the coil gone off the fingers */
  F.coil = [K({ dx: -1, legs: 'wide', arm: [X, Y, X - 1, Y + 3], greatsword: low, arm2: [OFF[0], OFF[1], OFF[0] - 5, OFF[1] - 1], plume: 1,
      bits: [a(OFF[0] - 6, OFF[1] - 2, RED), a(OFF[0] - 7, OFF[1] - 1, PINK), a(OFF[0] - 6, OFF[1], RED)] }),
    K({ wide: 4, dx: 1, legs: 'runC', arm: [X, Y, X - 1, Y + 3], greatsword: low, arm2: [OFF[0], OFF[1], X + 7, Y - 2], plume: 2,
      bits: [a(X + 10, Y - 3, RED), a(X + 11, Y - 2, PINK), a(X + 12, Y - 3, RED), a(X + 11, Y - 4, PINK)] })];
  /* GRAVE TIDE: down on his haunches with the fist raised; then the fist driven into the ground before him, and the green running
     off along it the way the hands will come up */
  F.tide = [K({ dy: 4, legs: 'crouch', legsDy: 3, arm: [X, Y, X - 2, Y + 2], greatsword: [X - 2, Y + 2, X - 14, Y - 3], arm2: [OFF[0], OFF[1], X + 3, Y - 6], plume: 1, bits: [a(X + 3, Y - 7, BONE)] }),
    K({ wide: 6, dy: 4, legs: 'crouch', legsDy: 3, arm: [X, Y, X - 2, Y + 2], greatsword: [X - 2, Y + 2, X - 14, Y - 3], arm2: [OFF[0], OFF[1], X + 5, Y + 4], plume: 2,
      bits: [...lit, a(X + 5, Y + 5, BONE), a(X + 9, Y + 4, GRN), a(X + 12, Y + 4, DGRN), a(X + 15, Y + 4, GRN), a(X + 18, Y + 4, DGRN), a(X + 7, Y + 3, LIT), a(X + 13, Y + 3, GRN)] })];
  /* UNHOLY GROUND: the blade taken low and back behind him in both hands; then swept flat along the floor ahead, the green left
     on the ground where the edge went */
  F.unholy = [K({ dx: -1, dy: 1, legs: 'wide', arm: [X, Y, X - 3, Y + 3], arm2: [OFF[0], OFF[1], X - 4, Y + 3], greatsword: [X - 4, Y + 3, X - 17, Y + 7], plume: 1 }),
    K({ wide: 10, dx: 2, dy: 2, legs: 'runC', arm: [X, Y, X + 4, Y + 3], arm2: [OFF[0], OFF[1], X + 3, Y + 3], greatsword: [X + 4, Y + 3, X + 21, Y + 6], plume: 2,
      bits: [a(X + 8, Y + 7, GRN), a(X + 12, Y + 7, DGRN), a(X + 16, Y + 7, GRN), a(X + 20, Y + 7, DGRN), a(X + 4, Y + 7, DGRN), a(X + 10, Y + 6, LIT)] })];
  /* DEATH GRIP: the off hand thrown out ahead, clawed, with the green off the fingers; then the fist hauled back in to his chest,
     the green line coming with it */
  F.grip = [K({ wide: 4, dx: 1, legs: 'wide', arm: [X, Y, X - 1, Y + 3], greatsword: low, arm2: [OFF[0], OFF[1], X + 8, Y - 2], plume: 2,
      bits: [a(X + 9, Y - 3, BONE), a(X + 10, Y - 2, BONE), a(X + 9, Y - 1, BONE), a(X + 11, Y - 2, GRN), a(X + 12, Y - 3, LIT)] }),
    K({ dx: -1, sho: 1, legs: 'wide', arm: [X, Y, X - 1, Y + 3], greatsword: low, arm2: [OFF[0], OFF[1], X - 1, Y - 1], plume: 1,
      bits: [...lit, a(X - 1, Y - 1, BONE), a(X + 3, Y - 1, GRN), a(X + 6, Y - 1, DGRN), a(X + 9, Y - 1, GRN)] })];
}
export function bakePyro(skin = {}, previewOnly = false) {
  KP = Object.assign({}, KP0, PYRO_PAL, skin);
  const up = (dx = 0, d = 0) => [17 + dx, 18 + d, 18 + dx, 0 + d]; // the staff stood upright in the front hand, taller than her
  const hand = [16, 11, 17, 12];                                      // the front sleeve down to the staff
  // A STORE CARD NEEDS ONLY THE BREATH AND THE SWING, not the whole fighting life.
  const card = {
    idle: () => ((previewOnly === 'icon' ? ([[0, 0], [0, 0], [1, 0], [1, 1], [1, 1], [0, 1], [0, 0], [0, -1]]).slice(0, 1) : ([[0, 0], [0, 0], [1, 0], [1, 1], [1, 1], [0, 1], [0, 0], [0, -1]])).map(([sit, trail], i) => pyroFrame({ sit, trail, staff: [17, 18, 19, 5], arm: [16, 11 + sit, 17, 11 + sit], flame: [0, 1, 2, 3, 1, 0, 3, 2][i], flick: i === 4 ? 1 : 0, cowl: 0 }))),
    atk: () => ([
      () => (pyroFrame({ lean: -1, feet: [[10, 18], [16, 18]], staff: [3, 11, 16, 10], arm: [15, 10, 13, 11], arm2: [11, 10, 9, 11], cowl: 0 })),
      () => (pyroFrame({ lean: 2, trail: 2, feet: [[9, 18], [17, 18]], staff: [9, 11, 25, 10], arm: [16, 10, 20, 10], arm2: [12, 10, 15, 11], cowl: 1, flare: [26, 10, false] })),
      () => (pyroFrame({ lean: 2, trail: 2, feet: [[9, 18], [17, 18]], staff: [10, 11, 26, 10], arm: [16, 10, 21, 10], arm2: [12, 10, 16, 11], cowl: 1, flare: [27, 10, true], flick: 1 })),
      () => (pyroFrame({ lean: 1, feet: [[10, 18], [16, 18]], staff: [8, 13, 21, 8], arm: [16, 10, 18, 11], cowl: 0 })),
      () => (pyroFrame({ staff: up(), arm: hand, cowl: 0 }))
    ].map((make, i) => (previewOnly === 'weaponIcon' && i !== 1) || (previewOnly === 'atk' && i !== 1 && i !== 2) ? null : make()))
  };
  if (previewOnly) return storeFrames(card, false, previewOnly);
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
    crouch: pyroFrame({ sit: 3, hemW: 13, staff: up(0, 3), arm: [16, 14, 17, 15], cowl: 0 }),
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
      () => (knightFrame({ dx: -1, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 1, sh[1] - 3], cutlass: [sh[0] - 1, sh[1] - 3, sh[0] - 6, sh[1] - 7], pistol: holster(), plume: 1 })),
      () => (knightFrame({ dx: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 3, sh[1] - 4], cutlass: [sh[0] + 3, sh[1] - 4, sh[0] + 9, sh[1] - 6], pistol: holster(), plume: 2 })),
      () => (knightFrame({ dx: 2, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 4, sh[1] - 1], cutlass: [sh[0] + 4, sh[1] - 1, sh[0] + 12, sh[1] + 1], pistol: holster(), plume: 2 })),
      () => (knightFrame({ dx: 2, dy: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 2], cutlass: [sh[0] + 4, sh[1] + 2, sh[0] + 10, sh[1] + 7], pistol: holster(1), plume: 0 })),
      () => (knightFrame({ cutlass: rest(), pistol: holster(), plume: 0 }))
    ].map((make, i) => (previewOnly === 'weaponIcon' && i !== 1) || (previewOnly === 'atk' && i !== 1 && i !== 2) ? null : make()))
  };
  if (previewOnly) return storeFrames(card, false, previewOnly);
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
    crouch: knightFrame({ dy: 3, legs: 'crouch', cutlass: rest(3), pistol: holster(3) }),
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
  directionalPoses(F, 'cutlass', { extra: { pistol: holster() } });
  pirateKitPoses(F, sh, holster, carry);
  const R = F, L = {}; for (const k in F) L[k] = mirror(F[k]);
  const white = {}; for (const k in F) white[k] = Array.isArray(F[k]) ? F[k].map(c => whiten(c)) : whiten(F[k]);
  const whiteL = {}; for (const k in white) whiteL[k] = mirror(white[k]);
  KP = Object.assign({}, KP0); BODY_REF = BODY; PLUME_REF = PLUME;
  return { R, L, white: { R: white, L: whiteL }, ...KNIGHT_ANCHOR, ay: KNIGHT_ANCHOR.ay + ATTACK_HEADROOM };
}
// THE DEATH KNIGHT: a horned helm with nothing in it but two green lights, plate the colour of a cold
// forge, a torn red surcoat, and a two-handed sword as long as he is with runes cut down the fuller.
// The silhouette has to say KNIGHT at sixteen pixels and say it from the horns and the pauldrons, because
// that is all there is room for - so the horns are the outermost pixels of the sprite and the shoulders
// are the widest.
const REAP_BODY = [
  's........s',
  'vv......vv',
  '.vvSSSSvv.',
  '..Skyyks..',
  '..SkkkkS..',
  '..vSSSSv..',
  'SSbbBBbbSS',
  'SSbBrrBbSS',
  '.SbbrrbbS.',
  '.bbbrrbbb.',
  '..bbbbbb..',
];
const REAP_PLUME = [
  ['s........s', 'vv......vv', '.vvSSSSvv.'],
  ['s........s', 'vv.....vvs', '.vvSSSSvv.'],
  ['.s......s.', 'vv......vv', '.vvSSSSvv.'],
];
const REAP_PAL = { s: '#b9c2cf', S: '#68707e', b: '#232a38', B: '#141824', r: '#5e1822', y: '#8fd160',
  k: '#0a0c10', w: '#6a5a42', W: '#3e3428', v: '#39404e' };
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
      () => (knightFrame({ dx: -1, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 3, sh[1] - 2], greatsword: [sh[0] - 3, sh[1] + 2, sh[0] - 11, sh[1] - 6], plume: 1 })),
      () => (knightFrame({ dx: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 2, sh[1] - 4], greatsword: [sh[0] + 2, sh[1] - 4, sh[0] + 3, sh[1] - 16], plume: 2 })),
      /* THE ART GROWS TO MEET THE BOX (2026-09-24, Daniel: "lengthen the art"). The swathe's live frame drew its blade to sh+17 on a 34-wide
         canvas, so the point was CUT OFF at the frame's edge, and the blow landed ~9 px past the steel anyone could see. Now the frame is
         widened on the right (wide) and the blade runs out to where the box has always reached. The reach did not change; only the picture did. */
      () => (knightFrame({ wide: 8, dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 5, sh[1] - 2], greatsword: [sh[0] + 5, sh[1] - 2, sh[0] + 19, sh[1] - 1], plume: 2 })),
      () => (knightFrame({ wide: 8, dx: 2, dy: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 1], greatsword: [sh[0] + 4, sh[1] + 1, sh[0] + 14, sh[1] + 7], plume: 0 })),   /* (widened too: its point was cut off at the old edge) */
      () => (knightFrame({ greatsword: rest(), plume: 0 }))
    ].map((make, i) => (previewOnly === 'weaponIcon' && i !== 1) || (previewOnly === 'atk' && i !== 1 && i !== 2) ? null : make()))
  };
  if (previewOnly) return storeFrames(card, false, previewOnly);
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
    crouch: knightFrame({ dy: 3, legs: 'crouch', arm: [sh[0], sh[1], sh[0] - 1, sh[1] + 8], greatsword: rest(3) }),
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
  /* HIS DANCE, for the victory card. The biggest and slowest of them does not jig: he HOISTS the two-hander over
     his head on straight arms and stamps, and the whole frame goes up and down with him. Two beats where everyone
     else has four, and the green in the helm comes up bright on each of them - the same two lights his fidget puts
     OUT. A bar of steel as long as he is, held level above the horns, is a silhouette only he owns. */
  { const st = (x0, y0, x1, y1, legs, dy, plume, lit) => knightFrame({ legs, dy, plume,
      arm: [sh[0], sh[1], sh[0], sh[1] - 6], greatsword: [x0, y0, x1, y1],
      bits: lit ? [[4, 3, '#dfffc0'], [5, 3, '#dfffc0']] : null });
    const hoist = st(sh[0] - 6, sh[1] - 8, sh[0] + 8, sh[1] - 8, 'wide', -1, 1, true);
    const dropL = st(sh[0] - 6, sh[1] - 5, sh[0] + 7, sh[1] - 9, 'runC', 1, 2, false);
    const hoist2 = st(sh[0] - 6, sh[1] - 8, sh[0] + 8, sh[1] - 8, 'run3', -1, 2, true);
    const dropR = st(sh[0] - 6, sh[1] - 9, sh[0] + 7, sh[1] - 5, 'wide', 1, 0, false);
    F.dance = holdFrames([[hoist, 3], [dropL, 3], [hoist2, 3], [dropR, 3]]); }
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
      () => (thrust(sh[0] - 6, sh[1] + 1, sh[0] + 8, sh[1] + 1, { dx: -2, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 4, sh[1] + 1], plume: 1 })),
      () => (thrust(sh[0] + 2, sh[1], 45, sh[1], { dx: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1]], plume: 2 })),
      () => (thrust(sh[0] + 5, sh[1], 57, sh[1], { dx: 2, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 6, sh[1]], plume: 2 })),
      () => (thrust(sh[0] + 2, sh[1] + 2, 39, sh[1] + 2, { dx: 1, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 2], plume: 0 })),
      () => (knightFrame({ legs: 'stand', spear: rest(), plume: 0 }))
    ].map((make, i) => (previewOnly === 'weaponIcon' && i !== 1) || (previewOnly === 'atk' && i !== 1 && i !== 2) ? null : make()))
  };
  if (previewOnly) return storeFrames(card, false, previewOnly);
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
    crouch: knightFrame({ dy: 3, legs: 'crouch', arm: [sh[0], sh[1], sh[0] + 2, sh[1] + 5], spear: rest(3) }),
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
  directionalPoses(F, 'spear', {});
  wardenKitPoses(F, sh, WIDE);
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
    idle: () => ((previewOnly === 'icon' ? (BREATH).slice(0, 1) : (BREATH)).map(([dy, hy, sho, plume], i) => knightFrame({ dy, hy, sho, plume, maul: [sh[0] + 2, sh[1] + 1, sh[0] + 5, sh[1] + 9 - dy], bits: flap([3, 4], dy, breathLag(i), 'b', 'B') }))),
    atk: () => ([
      () => (knightFrame({ dx: -2, legs: 'wide', arm: [sh[0], sh[1], sh[0] - 2, sh[1] - 4], maul: [sh[0] - 2, sh[1] - 3, sh[0] - 7, sh[1] - 8], plume: 1 })),
      () => (// drawn back over the shoulder
      knightFrame({ dx: 0, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 1, sh[1] - 4], maul: [sh[0] + 1, sh[1] - 3, sh[0] + 5, sh[1] - 8], plume: 2 })),
      () => (// up and over
      knightFrame({ dx: 2, dy: 1, legs: 'runC', arm: [sh[0], sh[1], sh[0] + 4, sh[1] + 2], maul: [sh[0] + 4, sh[1] + 2, sh[0] + 8, sh[1] + 7], plume: 2 })),
      () => (// down
      knightFrame({ dx: 2, dy: 2, legs: 'wide', arm: [sh[0], sh[1], sh[0] + 3, sh[1] + 4], maul: [sh[0] + 3, sh[1] + 4, sh[0] + 8, sh[1] + 9], plume: 0 })),
      () => (// the head in the ground
      knightFrame({ maul: rest(), plume: 0 }))
    ].map((make, i) => (previewOnly === 'weaponIcon' && i !== 1) || (previewOnly === 'atk' && i !== 1 && i !== 2) ? null : make()))
  };
  if (previewOnly) return storeFrames(card, false, previewOnly);
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
    crouch: knightFrame({ dy: 3, legs: 'crouch', maul: rest(3) }),
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
  /* HIS DANCE, for the victory card: he SWINGS THE MAUL. It goes up over the winged helm and over again, side to
     side on a long arc, and the light he spends on MEND and JUDGEMENT comes on at the top of every swing. The head
     of a maul is a block of steel seven pixels across - it is the biggest thing any hero swings through the air
     here, and following it round is the whole read. His fidget only ever polishes it standing still. */
  { const hx = sh[0] + 1, hy0 = sh[1] - 2;
    const sw = (mx, my, legs, dy, plume, glow) => knightFrame({ legs, dy, plume, glow,
      arm: [sh[0], sh[1], hx, hy0], maul: [hx, hy0, mx, my] });
    const outL = sw(sh[0] - 6, sh[1] - 7, 'wide', 0, 1, null);
    const overA = sw(sh[0] + 1, sh[1] - 10, 'runC', -1, 2, [sh[0] + 1, sh[1] - 14]);
    const outR = sw(sh[0] + 8, sh[1] - 7, 'wide', 0, 2, null);
    const overB = sw(sh[0] + 1, sh[1] - 10, 'run5', -1, 0, [sh[0] + 1, sh[1] - 14]);
    F.dance = holdFrames([[outL, 2], [overA, 2], [outR, 2], [overB, 2]]); }
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
  return pack([idle, raise, slam, drag, hurl, tongsWind, breath, walkA, walkB, tongsFlat, whirlTell, whirlLow, whirlHigh, ladleTell, ladle, stun], 25, 33, 40, 32);
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
// 7 slam down, 8 sweep, 9 charge, 10 dazed, 11 leap, 12 throw slate, 13 struck (the storm in her crown), 14 down.
export function bakeGoblinQueen() {
  const C = { g: '#6faa4a', G: '#3f6e2c', d: '#2c4a1e', p: '#5a2a7a', P: '#3a1850', q: '#7a3a9a', y: '#e0b040', Y: '#a0781c', w: '#f2ece0', k: '#1b1626', r: '#7a1c24', R: '#4a0e14',
    i: '#5a6270', I: '#3a3e48', j: '#8a919c', m: '#c9463d', e: '#ffd36b', t: '#f3f0d2', n: '#9a5aa8' };
  const W = 96, H = 78, CX = 48; /* spare rows under her boots: the outline of a planted foot (or a slam that sinks her) must not sit on the canvas edge */
  const WIDE = x => { const d = x - 28, a = Math.abs(d); return CX + (a <= 12 ? d * 2 : Math.sign(d) * (12 + a)); };
  const mapXs = a => a && a.map((v, i) => i % 2 === 0 && typeof v === 'number' ? WIDE(v) : v);
  const frame = (o) => {
    const { sit = 0, lean = 0, dy = 0, flare = 0, head = 'grin', tilt = 0, stars = 0, rot = 0 } = o;
    const arm = mapXs(o.arm || [34, 26, 42, 30]), arm2 = mapXs(o.arm2 || null), rod = mapXs(o.rod || null), feet = (o.feet || [[24, 58], [31, 58]]).map(([x, y]) => [WIDE(x), y]);
    /* the shoulder is out at the edge of the fat, not in the middle of her chest */
    arm[0] += 7 * Math.sign(arm[0] - CX); if (arm2) arm2[0] += 7 * Math.sign(arm2[0] - CX);
    const [c, g] = canvas(W, H);
    g.translate(0, 12); /* headroom for the crown's points */
    g.save(); g.translate(CX, 58 + dy); g.rotate(rot); g.translate(-CX, -58);
    const sh = y => (y < 34 ? lean * (34 - y) / 20 : 0);
    const poly = (pts, k) => fillPoly(g, pts.map(([x, y]) => [x + sh(y), y]), C[k]);
    const P1 = (x, y, k) => px(g, Math.round(x + sh(y)), Math.round(y), C[k]);
    const E = (x, y, rx, ry, k) => ellipse(g, x + sh(y), y, rx, ry, C[k]);
    // the cape behind everything, as wide as she is
    poly([[CX - 22, 22], [CX + 22, 22], [CX + 37 + flare, 56 - sit], [CX - 37 - flare, 56 - sit]], 'r'); poly([[CX - 24, 28], [CX - 16, 28], [CX - 35 - flare, 56 - sit], [CX - 39 - flare, 56 - sit]], 'R');
    // the sceptre when it is carried behind her
    const rodDraw = () => { if (!rod) return; const [x0, y0, x1, y1] = rod; line(g, x0, y0, x1, y1, C.I, 3); line(g, x0, y0, x1, y1, C.i, 1);
      circle(g, x1, y1, 4, C.I); circle(g, x1, y1, 3, C.j); px(g, x1, y1, C.n); px(g, x1 + 1, y1 - 1, C.q);
      for (const [a, b] of [[-5, 0], [5, 0], [0, -5], [0, 5]]) px(g, x1 + a, y1 + b, C.I); };
    if (rod && rod[4] === 'back') rodDraw();
    for (const [fx, fy] of feet) rect(g, fx - 3, fy - 1, 6, 2, C.k);
    // THE GOWN: it starts at the hips, and the hips are wide, so it is a tent before it is a bell
    const hem = 55 - sit, hw = 36 + flare * 0.8;
    poly([[CX - 27, 38], [CX + 27, 38], [CX + hw, hem], [CX - hw, hem]], 'p');
    if (!sit) { E(CX - 21, 45, 14, 8, 'p'); E(CX + 21, 45, 14, 8, 'p'); }                     /* the hips under it (seated, her knees are where they were) */
    poly([[CX - 6, 40], [CX + 6, 40], [CX + hw * 0.2, hem], [CX - hw * 0.2, hem]], 'P');
    for (let q = 0; q < 8; q++) { const fx = CX - hw + 5 + q * ((hw * 2 - 10) / 7); line(g, CX + (fx - CX) * 0.7, 45, fx, hem - 1, C.P, 1); } /* the pleats of it */
    for (let x = Math.round(CX - hw); x <= Math.round(CX + hw); x++) { px(g, x, hem, C.y); px(g, x, hem - 1, x % 3 === 0 ? C.Y : C.y); if (x % 4 === 0) px(g, x, hem - 2, C.Y); }
    line(g, CX, 44, CX, hem - 1, C.y, 1);
    if (sit) { poly([[CX - 30, 41], [CX + 34, 41], [CX + 34, 48], [CX - 30, 48]], 'q'); line(g, CX - 30, 41, CX + 34, 41, C.y, 1); } /* her knees, over the throne's edge */
    // THE BODY. No waist anywhere: out from the shoulder and still going at the belt.
    poly([[CX - 22, 18], [CX + 22, 18], [CX + 27, 24], [CX + 30, 31], [CX + 28, 38], [CX + 22, 42], [CX - 22, 42], [CX - 28, 38], [CX - 30, 31], [CX - 27, 24]], 'q');
    // the belly: the widest part of her, round, hanging OVER the belt, which is where the weight of a body shows
    E(CX + lean * 0.2, 33, 27, 10.5, 'q');
    E(CX - 7 + lean * 0.2, 28.5, 14, 4.5, 'n'); P1(CX - 12, 27, 'n');                            /* the light on the top of it, from the upper left */
    g.globalAlpha = 0.55; E(CX + 2, 40.5, 19, 1.3, 'P'); E(CX + 25, 33, 2, 6, 'P'); g.globalAlpha = 1; /* ONE fold, under it where it hangs, and its far side turning away: more folds read as a stack of tyres */
    // the bust: full and heavy, sitting on the belly, with the shadow under
    E(CX - 10 + lean * 0.3, 23.5, 10, 6.5, 'n'); E(CX + 10 + lean * 0.3, 23.5, 10, 6.5, 'n');
    E(CX - 10 + lean * 0.3, 27.2, 9, 3, 'q'); E(CX + 10 + lean * 0.3, 27.2, 9, 3, 'q');
    E(CX - 12 + lean * 0.3, 21.5, 4.5, 2, 'q'); E(CX + 8 + lean * 0.3, 21.5, 4.5, 2, 'q');
    for (let x = CX - 22; x <= CX + 22; x++) { px(g, x, 42, C.y); px(g, x, 43, C.Y); }         /* the belt, UNDER her, not round her */
    P1(CX, 42, 'm'); for (const o2 of [-14, -6, 6, 14]) P1(CX + o2, 43, 'Y');
    poly([[CX - 18, 13], [CX + 18, 13], [CX + 26, 16], [CX + 30, 21], [CX + 22, 23], [CX + 10, 22], [CX, 28], [CX - 10, 22], [CX - 22, 23], [CX - 30, 21], [CX - 26, 16]], 'w'); /* the ermine across shoulders like a yoke, and a deep neckline in it */
    for (const [x, y] of [[-19, 17], [-12, 19], [12, 19], [19, 17], [-25, 18], [25, 18], [0, 16], [-6, 16], [6, 16]]) P1(CX + x, y, 'k');
    for (let q = -4; q <= 4; q++) { const nx = CX + q * 2, ny = 21 + Math.abs(q); P1(nx, ny, q === 0 ? 'm' : 'y'); if (q === 0) P1(nx, ny + 1, 'r'); } /* the stones at her throat */
    // the far arm, as thick as a leg
    if (arm2) { const [x0, y0, x1, y1] = arm2, wx = x0 + (x1 - x0) * 0.55, wy = y0 + (y1 - y0) * 0.55; circle(g, x0, y0, 6, C.P); line(g, x0, y0, x1, y1, C.P, 11); line(g, wx, wy, x1, y1, C.G, 8); circle(g, x1, y1, 4.5, C.G); }
    // the head: the same big green head - bat ears, a hook of a nose, yellow eyes, two tusks - on a neck that is all chin
    const hx = CX + lean, hy = 12;
    poly([[hx - 7, hy - 2], [hx - 16, hy - 6], [hx - 8, hy + 3]], 'g'); poly([[hx + 7, hy - 2], [hx + 16, hy - 6], [hx + 8, hy + 3]], 'g'); P1(hx - 12, hy - 3, 'G'); P1(hx + 12, hy - 3, 'G');
    poly([[hx - 9, hy - 3], [hx + 9, hy - 3], [hx + 17, hy + 16], [hx - 17, hy + 16]], 'P');   /* the veil, behind her head */
    ellipse(g, hx, hy + 11, 12, 5, C.g); ellipse(g, hx, hy + 13.5, 10, 1.4, C.G);               /* the neck that has become a second chin, and its fold */
    ellipse(g, hx, hy + 1, 9, 8, C.g); ellipse(g, hx, hy + 5, 9.5, 4.5, C.g); ellipse(g, hx + 1, hy + 4.5, 6.5, 4, C.G);
    P1(hx - 11, hy + 1, 'y'); P1(hx - 11, hy + 2, 'Y'); P1(hx + 11, hy + 1, 'y'); P1(hx + 11, hy + 2, 'Y');   /* her earrings */
    if (head === 'daze') { P1(hx - 3, hy - 1, 'k'); P1(hx - 2, hy, 'k'); P1(hx - 2, hy - 2, 'k'); P1(hx + 3, hy - 1, 'k'); P1(hx + 4, hy, 'k'); P1(hx + 4, hy - 2, 'k'); }
    else { rect(g, hx - 4, hy - 1, 3, 2, C.e); rect(g, hx + 2, hy - 1, 3, 2, C.e); P1(hx - 2, hy - 1, 'm'); P1(hx + 4, hy - 1, 'm'); line(g, hx - 5, hy - 3, hx - 1, hy - 2, C.d, 1); line(g, hx + 6, hy - 3, hx + 2, hy - 2, C.d, 1); }
    poly([[hx + 1, hy], [hx + 6, hy + 3], [hx + 2, hy + 4]], 'G'); /* the nose */
    ellipse(g, hx, hy + 9, 9, 3.2, C.g); ellipse(g, hx, hy + 10, 7.5, 1.6, C.G);                /* the jowls, and the throat under them */
    for (const [ex, ey] of [[hx - 7, hy + 8], [hx + 7, hy + 8]]) { P1(ex, ey, 'y'); P1(ex, ey + 1, 'Y'); }   /* and more of her jewels on it */
    if (head === 'shout') { rect(g, hx - 3, hy + 5, 7, 3, C.k); P1(hx - 2, hy + 5, 't'); P1(hx + 3, hy + 5, 't'); }
    else { line(g, hx - 4, hy + 6, hx + 4, hy + 6, C.k, 1); P1(hx - 3, hy + 5, 't'); P1(hx + 3, hy + 5, 't'); P1(hx - 3, hy + 4, 't'); P1(hx + 3, hy + 4, 't'); }
    P1(hx - 6, hy + 3, 'd'); P1(hx + 5, hy - 4, 'd');
    // the crown: iron, five points, a red stone in each
    g.save(); g.translate(hx, hy - 4); g.rotate(tilt);
    fillPoly(g, [[-8, 0], [8, 0], [9, -3], [-9, -3]], C.I); fillPoly(g, [[-8, -3], [8, -3], [8, -5], [-8, -5]], C.y);
    for (const k of [-8, -4, 0, 4, 8]) { fillPoly(g, [[k - 2, -5], [k + 2, -5], [k, -11 - (k === 0 ? 3 : 0)]], C.i); px(g, k, -7, C.m); }
    g.restore();
    if (stars) for (let i = 0; i < 3; i++) { const a = i * 2.1 + stars; P1(hx + Math.cos(a) * 11, hy - 12 + Math.sin(a) * 3, 'e'); }
    // the near arm and the sceptre in it: a sleeve of the gown to the wrist, and a great deal of arm in the sleeve
    if (!rod || rod[4] !== 'back') rodDraw();
    { const [x0, y0, x1, y1] = arm, wx = x0 + (x1 - x0) * 0.55, wy = y0 + (y1 - y0) * 0.55; circle(g, x0, y0, 6.5, C.q); line(g, x0, y0, x1, y1, C.q, 13); line(g, wx, wy, x1, y1, C.g, 8); circle(g, wx, wy, 5, C.n); circle(g, x1, y1, 5, C.g); } /* the sleeve past the elbow, a puffed cuff, then the green forearm and the fist: all-green from the shoulder read as a leaf */
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
  ];
  return pack(F, CX, 70, 52, 50);
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
/* ==== THE GEOMANCER (2026-09-24, docs/briefs/geomancer.md). A hood and a stone mantle, and THE STAVE held ACROSS her.
   The silhouette read, against everyone else on the knight's rig: a pointed moss-green HOOD (not a helm, not a brim), a
   MANTLE of rough stones on both shoulders that makes her the widest thing at shoulder height in the cast, and the short
   thick stave laid diagonally over the body with a standing stone for its head. The Pyromancer holds a thin staff upright
   in one hand and POINTS it; this one is two-handed, crossways, and every spell of hers starts with the iron BUTT struck
   into the ground (the heavy, block and blast frames), which is the pose that must read at sixteen pixels. ==== */
const GEO_BODY = [
  '...BBB....',     /* 0  the peak of the hood */
  '..BbbbB...',     /* 1 */
  '.BbbbbbB..',     /* 2 */
  '.Bbvvvvb..',     /* 3  the hood's mouth, in shadow */
  '.Bbvvkkb..',     /* 4  her face lit on the side she faces */
  '..Bbkkb...',     /* 5  the jaw */
  'mGBbbbBGm.',     /* 6  THE MANTLE: a rough stone on each shoulder, wider than any helm, moss on the outer edge of each */
  'GgSbybSgG.',     /* 7  the amber rune-stone at her breast */
  '.SBbbbBS..',     /* 8 */
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
const GEO_PAL = { s: '#b0ae9e', S: '#6e6c60', b: '#7a6c58', B: '#433a2e', m: '#6f9a4a', r: '#e0a040', k: '#d8ac82', w: '#6a5034', W: '#3a2c1c', y: '#e8a83a', v: '#1e1a22', g: '#8c8a7e', G: '#5a584e' };
export function bakeGeomancer(skin = {}, previewOnly = false) {
  KP = Object.assign({}, KP0, GEO_PAL, skin); BODY_REF = GEO_BODY; PLUME_REF = GEO_PLUME;
  const sh = [BX + 8, BY + 7], [X, Y] = sh, OFF = [BX + 2, BY + 7], WIDE = 12;
  const o = (x, y, col) => [X - BX + x, Y - BY + y, col];
  const A = '#e8a83a', D = '#c9b27c', M = '#8c8a7e';
  /* AT GUARD, ACROSS HER: the stone head up and forward over the lead hand, the butt low behind her heel, both hands on it */
  const guard = (d = 0) => ({ stave: [X - 7, Y + 7 + d, X + 5, Y - 10 + d], arm: [X, Y, X + 1, Y - 3 + d], arm2: [OFF[0], OFF[1], X - 3, Y + 2 + d] });
  const card = {
    idle: () => ((previewOnly === 'icon' ? BREATH.slice(0, 1) : BREATH).map(([dy, hy, sho, plume]) => knightFrame({ dy, hy, sho, plume, ...guard(-dy) }))),
    atk: () => ([
      () => knightFrame({ dx: -1, legs: 'wide', arm: [X, Y, X - 1, Y - 3], arm2: [OFF[0], OFF[1], X - 3, Y - 1], stave: [X + 2, Y + 4, X - 7, Y - 10], plume: 1 }),
      () => knightFrame({ wide: WIDE, dx: 1, legs: 'runC', arm: [X, Y, X + 2, Y - 4], arm2: [OFF[0], OFF[1], X - 1, Y - 2], stave: [X - 2, Y + 2, X + 7, Y - 12], plume: 2 }),
      () => knightFrame({ wide: WIDE, dx: 2, legs: 'runC', arm: [X, Y, X + 5, Y], arm2: [OFF[0], OFF[1], X + 1, Y], stave: [X - 3, Y - 1, X + 15, Y + 2], plume: 2, bits: [o(18, 4, M), o(18, 0, M)] }),
      () => knightFrame({ wide: WIDE, dx: 1, legs: 'wide', arm: [X, Y, X + 4, Y + 2], arm2: [OFF[0], OFF[1], X, Y + 2], stave: [X - 2, Y - 3, X + 13, Y + 7], plume: 0 }),
      () => knightFrame({ legs: 'stand', ...guard(), plume: 0 }),
    ].map((make, i) => (previewOnly === 'weaponIcon' && i !== 2) || (previewOnly === 'atk' && i !== 1 && i !== 2) ? null : make())),
  };
  if (previewOnly) return storeFrames(card, false, previewOnly);
  const F = {
    idle: card.idle(),
    run: [['run1', -1], ['run2', 0], ['run3', 1], ['run4', 0], ['run5', -1], ['run6', 0]].map(([l, dy], i) =>
      knightFrame({ legs: l, dy, plume: i % 3, arm: [X, Y, X + 2, Y - 1], arm2: [OFF[0], OFF[1], X - 3, Y + 2], stave: [X - 8, Y + 5, X + 7, Y - 7] })),
    jump: [knightFrame({ legs: 'jump', dy: -1, arm: [X, Y, X + 1, Y - 3], arm2: [OFF[0], OFF[1], X - 3, Y + 1], stave: [X - 7, Y + 6, X + 6, Y - 9], plume: 1 }),
      knightFrame({ legs: 'jump2', arm: [X, Y, X + 1, Y - 3], arm2: [OFF[0], OFF[1], X - 3, Y + 1], stave: [X - 7, Y + 5, X + 7, Y - 9], plume: 1 })],
    fall: [knightFrame({ legs: 'fall', arm: [X, Y, X + 2, Y - 2], arm2: [OFF[0], OFF[1], X - 4, Y], stave: [X - 8, Y + 3, X + 7, Y - 10], plume: 2 }),
      knightFrame({ legs: 'fall2', dy: -1, arm: [X, Y, X + 2, Y - 3], arm2: [OFF[0], OFF[1], X - 4, Y - 1], stave: [X - 8, Y + 2, X + 8, Y - 10], plume: 2 })],
    /* THE LANDING is heavy: the butt jarred into the ground as she comes down on it, the settle, and up */
    land: [knightFrame({ legs: 'crouch', legsDy: 3, dy: 4, arm: [X, Y, X + 3, Y + 1], arm2: [OFF[0], OFF[1], X, Y + 3], stave: [X + 5, Y + 5, X + 1, Y - 12], plume: 2, bits: [o(5, 9, D), o(7, 9, D), o(3, 9, D)] }),
      knightFrame({ legs: 'land', dy: 2, ...guard(1), plume: 0 }),
      knightFrame({ legs: 'stand', dy: 1, ...guard(), plume: 1 })],
    takeoff: knightFrame({ legs: 'push', dy: -2, sho: 1, arm: [X, Y, X + 1, Y - 4], arm2: [OFF[0], OFF[1], X - 2, Y], stave: [X - 6, Y + 8, X + 5, Y - 11], plume: 2 }),
    apex: knightFrame({ legs: 'jump2', dy: -1, arm: [X, Y, X + 2, Y - 3], arm2: [OFF[0], OFF[1], X - 3, Y], stave: [X - 7, Y + 4, X + 8, Y - 9], plume: 0 }),
    skid: knightFrame({ dx: -2, legs: 'wide', arm: [X, Y, X + 3, Y + 2], arm2: [OFF[0], OFF[1], X + 1, Y + 3], stave: [X - 5, Y - 6, X + 6, Y + 8], plume: 2 }),
    climb: [knightFrame({ legs: 'climbA', arm: [X, Y, X + 2, Y - 7], stave: [X + 3, Y + 6, X - 6, Y - 8], plume: 0 }),
      knightFrame({ legs: 'climbB', dy: 1, arm: [X, Y, X + 3, Y - 3], stave: [X + 3, Y + 7, X - 6, Y - 7], plume: 1 })],
    atk: card.atk(),
    /* STONEFALL: she comes down on the butt like a boulder, the stave straight down under her boots */
    plunge: knightFrame({ legs: 'fall2', dx: -1, arm: [X, Y, X, Y + 4], arm2: [OFF[0], OFF[1], X - 1, Y + 1], stave: [X - 1, Y + 15, X - 3, Y - 6], plume: 2 }),
    hurt: [knightFrame({ dx: -1, dy: 1, legs: 'fall', arm: [X, Y, X - 1, Y + 3], stave: [X + 4, Y + 6, X - 8, Y - 5], plume: 2 }),
      knightFrame({ dx: -2, dy: 2, legs: 'land', arm: [X, Y, X - 2, Y + 4], stave: [X + 3, Y + 7, X - 9, Y - 2], plume: 1 })],
    crouch: knightFrame({ dy: 3, legs: 'crouch', arm: [X, Y, X + 2, Y + 2], arm2: [OFF[0], OFF[1], X - 2, Y + 4], stave: [X - 6, Y + 6, X + 6, Y - 7] }),
    /* RAISE WALL (C): the butt driven into the ground in front of her, both hands high on the haft, her weight down on it */
    block: [0, 1].map(i => knightFrame({ dy: 1 + i, legs: 'wide', arm: [X, Y, X + 4, Y - 4 + i], arm2: [OFF[0], OFF[1], X + 3, Y - 1 + i], stave: [X + 6, Y + 9 - i, X + 4, Y - 9 + i], plume: i + 1, bits: [o(5, 9 - i, D), o(8, 9 - i, D), o(4, 8 - i, M)] })),
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
  /* HER DANCE: the stave twirled round her two hands like a baton, a full turn in eight, her feet stepping under it */
  { const hx = X, hy0 = Y - 1;
    F.dance = holdFrames([0, 1, 2, 3, 4, 5, 6, 7].map(k => { const th = k * Math.PI / 4;
      return [knightFrame({ legs: k % 4 === 0 ? 'stand' : k % 2 ? 'runC' : 'wide', dy: k % 4 === 2 ? 1 : 0, plume: k % 3, arm: [X, Y, hx, hy0], arm2: [OFF[0], OFF[1], hx - 1, hy0 + 1],
        stave: [Math.round(hx - 8 * Math.cos(th)), Math.round(hy0 + 8 * Math.sin(th)), Math.round(hx + 8 * Math.cos(th)), Math.round(hy0 - 8 * Math.sin(th))] }), 1]; })); }
  /* HER SLUMP: the stave planted and her weight hung on it, the hood down */
  { const lean = (d, hy) => knightFrame({ dy: 1 + d, hy, sho: -1, legs: 'stand', plume: 0, arm: [X, Y, X + 4, Y - 2 + d], arm2: [OFF[0], OFF[1], X + 3, Y + d], stave: [X + 5, Y + 9, X + 5, Y - 7] });
    F.slump = [lean(0, 2), lean(1, 3)]; }
  /* HER SWIM: the stave slung along her back, stone up */
  { const S = swimRig(knightFrame, sh, { carry: { stave: [X - 6, Y + 6, X + 2, Y - 8] }, tread: i => ({ stave: [X - 5, Y + 7 + TREAD_DY[i], X + 3, Y - 8 + TREAD_DY[i]] }) });
    F.swim = S.swim; F.tread = S.tread; }
  /* HER DODGE: a shoulder roll, the stave hugged to her */
  const tuck = knightFrame({ dy: 4, legs: 'crouch', arm: [X, Y, X + 1, Y + 2], stave: [X - 5, Y + 5, X + 5, Y - 3] });
  F.roll = [0, 1, 2, 3].map(q => rotQuarter(tuck, q));
  const mirror = f => Array.isArray(f) ? f.map(flipX) : flipX(f);
  directionalPoses(F, 'stave', {});
  /* THE TALL ONES, made after the padding with the headroom of their own: the stave goes up over the hood on these */
  const TK = f => knightFrame({ top: ATTACK_HEADROOM, ...f });
  /* UPHEAVAL (her held X): the stave raised upright over her in both hands, then the BUTT struck down into the ground ahead of her
     feet - where the pillar comes up - and her weight driven down on top of it. The same strike as the wall, taken higher and harder */
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
  const R = F, L = {}; for (const k in F) L[k] = mirror(F[k]);
  const white = {}; for (const k in F) white[k] = Array.isArray(F[k]) ? F[k].map(c => whiten(c)) : whiten(F[k]);
  const whiteL = {}; for (const k in white) whiteL[k] = mirror(white[k]);
  KP = Object.assign({}, KP0); BODY_REF = BODY; PLUME_REF = PLUME;
  return { R, L, white: { R: white, L: whiteL }, ...KNIGHT_ANCHOR, ay: KNIGHT_ANCHOR.ay + ATTACK_HEADROOM };
}
/* EVERY ABILITY HAS A BODY: THE GEOMANCER'S NINE (src/hero-poses.js plays them; tools/ability-poses.mjs holds her to it). Every
   one is told by what the STAVE does - and every spell begins with the butt going into the ground, so most of them start there. */
function geoKitPoses(F, sh) {
  const [X, Y] = sh, OFF = [BX + 2, BY + 7], KF = f => knightFrame({ top: ATTACK_HEADROOM, ...f });
  const o = (x, y, col) => [X - BX + x, Y - BY + y, col];
  const A = '#e8a83a', D = '#c9b27c', M = '#8c8a7e', MS = '#6f9a4a';
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
  /* LODESTONE: the stone head levelled straight at them and the off hand open behind it, the rune pulling */
  F.gLode = [KF({ wide: 8, dx: -1, legs: 'wide', arm: [X, Y, X + 4, Y], arm2: [OFF[0], OFF[1], X + 1, Y - 3], stave: [X - 6, Y + 1, X + 12, Y - 1], plume: 1 }),
    KF({ wide: 8, dx: -2, legs: 'wide', sho: 1, arm: [X, Y, X + 4, Y], arm2: [OFF[0], OFF[1], X + 2, Y - 5], stave: [X - 6, Y + 1, X + 12, Y - 1], plume: 2, bits: [o(15, -1, A), o(16, -2, A), o(16, 1, A), o(17, -1, '#fff0c0')] })];
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
}
