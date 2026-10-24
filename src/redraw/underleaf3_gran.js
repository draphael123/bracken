// underleaf3_gran.js - THE GRANDMOTHER 3 (claude/underleafart): the goblins' old witch-matriarch, in her older look - bent double under a patched shawl, a pointed hood over a long hooked nose and two
// eyes of her own potion-light, a gnarled root staff with a WITCH-FIRE LANTERN hung from its fork, her jars on her belt. ~1.3x the old sheet (56 x 62 against 42 x 48), faces right (the left set is mirrored).
// EVERY MOVE HAS ITS OWN POSE (B16: no shared punch/cast/idle frame), a windup and a release each:
//   sleep / wake               sitting with the staff across her knees, the lantern low / rising, the first eye opening
//   walk x2                    the shuffle, the staff planted ahead, the free hand swinging
//   staffTell / staff          the staff cocked high behind her, the body coiled / swung low across the floor in a smear
//   fireballTell / cast        the lantern up on the staff, a ball of witch-fire growing in her palm / thrown, her arm out
//   jarTell green|red / hurled a jar drawn from her belt and raised over her head in its colour / the arm thrown through
//   broodTell / kick           both arms flung wide, the hood back, calling / the staff slammed down, rings at its foot
//   stirTell / stir            (phase two) the great ladle raised in both fists / plunged, sparks
//   ward                       the staff crossed before her, a palm out
//   floated                    lifted off her feet, the head back, the hair and the hem drifting, the arms limp (the bubble is drawn round her by drawGran)
//   dead                       a heap of shawl on the floor, the staff broken, the lantern out
// Two sets: phase one (the lantern burns witch-green) and phase two (it burns red-orange, her eyes blaze, embers on the shawl). bakeSets() -> { p1, p2, card }, each { R, L, white, ax, ay, w, h }.
// LANTERN[frame] = [x, y] where the flame is in each frame (drawGran lights it).
import { canvas, flipX, whiten, outline } from '../px.js';

const OUT = '#1b1626', W = 56, H = 62, AX = 28, AY = 60;
export const F = { sleep: 0, wake: 1, walk0: 2, walk1: 3, floated: 4, staffTell: 5, staff: 6, fireballTell: 7, cast: 8, jarTellG: 9, jarTellR: 10, hurledG: 11, hurledR: 12, broodTell: 13, kick: 14, stirTell: 15, stir: 16, ward: 17, dead: 18 };
export const LANTERN = {};
const C = { sh: ['#1c2412', '#2e3a1e', '#46582c', '#6a8240'], hood: ['#12180c', '#222e18', '#384a26', '#587038'], skin: ['#3a5a2a', '#5a7e3e', '#86aa5c', '#b4d080'], wood: ['#2a1a0e', '#4a3220', '#6e4e30', '#98724a'],
  patchA: '#8a6a30', patchB: '#7a4222', bone: '#e8dcc0', boneD: '#9c8c68', hair: '#ece8d6', iron: '#2a2420', ironL: '#5a544c', twine: '#cbb888' };
const FLAME = [{ lo: '#4a8a1e', mid: '#9be048', hi: '#d8ff90', core: '#f4ffd8', eye: '#d8ff90' }, { lo: '#c8381c', mid: '#ff8a3a', hi: '#ffd36b', core: '#fff1a0', eye: '#ffb070' }];
const JC = { green: ['#2e5a1c', '#5fae3a', '#9be06a'], blue: ['#24406a', '#4a8fd8', '#a8d8ff'], red: ['#6a2014', '#d8502a', '#ffb070'] };

function painter() {
  const [c, g] = canvas(W, H);
  const put = (x, y, col) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) { g.fillStyle = col; g.fillRect(x, y, 1, 1); } };
  const rect = (x, y, w, h, col) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, col); };
  const ell = (cx, cy, rx, ry, colFn) => { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { const nx = (x - cx) / rx, ny = (y - cy) / ry; if (nx * nx + ny * ny <= 1) put(x, y, typeof colFn === 'function' ? colFn(nx, ny) : colFn); } };
  const line = (x0, y0, x1, y1, col, th = 1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let k = 0; k <= n; k++) { const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n; for (let t = 0; t < th; t++) put(x + (Math.abs(y1 - y0) > Math.abs(x1 - x0) ? t : 0), y + (Math.abs(y1 - y0) > Math.abs(x1 - x0) ? 0 : t), typeof col === 'function' ? col(k / n) : col); } };
  return { c, g, put, rect, ell, line };
}
/* a lit-from-the-left ramp pick: nx, ny in -1..1 across the shape */
const shade = (ramp, nx, ny) => { const l = -nx * 0.7 - ny * 0.5; return l > 0.45 ? ramp[3] : l > 0.0 ? ramp[2] : l > -0.5 ? ramp[1] : ramp[0]; };

/* THE SHAWL: a patched, ragged cloak, bent forward; sy = shoulder row, hem = floor row; lean shifts the top forward */
function shawl(P, o) {
  const dx = o.dx || 0, dy = o.dy || 0, top = 27 + dy + (o.sink || 0), hem = (o.hem ?? 58) + (o.hemDy || 0), spread = o.spread || 0;
  for (let y = top; y <= hem; y++) { const k = (y - top) / (hem - top || 1), half = 8 + k * (10 + spread), cx = 27 + dx + (o.lean || 0) * (1 - k) + k * 1;
    for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) { const nx = (x - cx) / half; let col = shade(C.sh, nx, (y - top) / 31 - 0.5);
      if (((x * 7 + y * 13) % 29) === 0) col = C.sh[1]; P.put(x, y, col); }
    if (y === hem) for (let x = Math.round(cx - half); x <= Math.round(cx + half); x += 2) { P.put(x, hem + 1, (x % 4 ? C.patchA : C.sh[0])); } }
  /* the hunch: the back's hump, over the left shoulder */
  P.ell(14 + dx + (o.hunch || 0), 29 + dy + (o.sink || 0), 8, 7, (nx, ny) => shade(C.sh, nx, ny));
  /* patches and folds */
  const px0 = 20 + dx, pyy = 40 + dy; P.rect(px0, pyy, 5, 4, C.patchA); P.rect(px0, pyy, 5, 1, '#a88a44'); P.rect(px0 + 1, pyy + 1, 1, 1, C.twine);
  P.rect(34 + dx, 49 + dy, 4, 3, C.patchB); P.put(35 + dx, 50 + dy, C.twine);
  P.line(14 + dx, 36 + dy, 11 + dx, hem - 2, C.sh[0]); P.line(27 + dx, 38 + dy, 28 + dx, hem - 1, C.sh[1]); P.line(38 + dx, 36 + dy, 43 + dx, hem - 2, C.sh[0]);
  /* her belt and her jars on it: three, in her three colours, and a bone charm and a herb sprig */
  if (!o.noBelt) { const by = 43 + dy + (o.sink || 0); P.rect(18 + dx, by, 22, 2, C.wood[1]); P.rect(18 + dx, by, 22, 1, C.wood[2]);
    const jars = [['green', 22], ['blue', 29], ['red', 36]]; for (const [col, jx] of jars) { if (o.jarGone === col) continue; const J = JC[col]; P.rect(jx + dx, by + 2, 4, 5, J[0]); P.rect(jx + 1 + dx, by + 3, 2, 3, J[1]); P.put(jx + 1 + dx, by + 3, J[2]); P.rect(jx + dx + 1, by + 1, 2, 1, C.twine); }
    P.line(18 + dx, by + 2, 17 + dx, by + 8, C.bone); P.put(17 + dx, by + 9, C.boneD); P.put(25 + dx, by + 1, '#7ab04a'); P.put(26 + dx, by, '#9be06a'); }
}
/* THE HOOD AND THE FACE: a pointed hood hunched forward, the dark of it, two eyes of potion-light, a hooked nose, a long ear out of the side, white hair, a bone charm */
function head(P, o, fl) {
  const hx = 34 + (o.dx || 0) + (o.hx || 0), hy = 21 + (o.dy || 0) + (o.hy || 0) + (o.sink || 0), back = o.hoodBack || 0, eyes = o.eyes || 'open';
  /* the long ear first (it sits behind the hood) */
  P.line(hx - 6, hy - 2, hx - 14 - back * 2, hy - 7 - back * 3, C.skin[1], 2); P.put(hx - 15 - back * 2, hy - 8 - back * 3, C.skin[0]); P.put(hx - 9, hy - 3, C.skin[2]);
  /* the hood: a dome with a point leaning forward */
  P.ell(hx, hy, 9.5, 9.5, (nx, ny) => shade(C.hood, nx, ny));
  for (let k = 0; k < 9; k++) { const t = k / 8, x = hx + 1 + t * (7 - back * 6), y = hy - 9 - t * (9 - back * 2); P.rect(x - 3 + t * 3, y, Math.max(1, 7 - k), 1, k < 4 ? C.hood[2] : C.hood[1]); }
  P.put(hx + 7 - back * 5, hy - 18 + back * 3, C.hood[2]);
  /* the dark of it, the face in it */
  const fx = hx + 4 - back * 2, fy = hy + 1;
  P.ell(fx, fy, 5.5, 6, '#0a0e06'); P.ell(fx + 1, fy + 1, 4, 4.5, (nx, ny) => shade(C.skin, nx * 0.8, ny * 0.8 + 0.2));
  /* the nose: a long hook; a wart; the mouth: a line and one tooth */
  P.line(fx + 3, fy + 1, fx + 8, fy + 4, C.skin[2], 2); P.put(fx + 9, fy + 6, C.skin[1]); P.put(fx + 8, fy + 3, C.skin[3]); P.put(fx + 6, fy + 7, '#2a3a1c');
  P.line(fx - 1, fy + 5, fx + 3, fy + 5, '#12180c'); if (o.mouth) { P.rect(fx, fy + 4, 4, 2, '#12180c'); P.put(fx + 1, fy + 4, C.bone); P.put(fx + 3, fy + 4, C.bone); } else P.put(fx + 1, fy + 6, C.bone);
  /* eyes: closed = a line, open = two lights, blaze = bigger and a halo of pixels */
  const ex = [fx - 1, fx + 3], ey = fy - 1;
  if (eyes === 'closed') { for (const x of ex) P.put(x, ey + 1, '#12180c'); }
  else if (eyes === 'one') { P.put(ex[1], ey, fl.eye); P.put(ex[1] + 1, ey, fl.mid); P.put(ex[0], ey + 1, '#12180c'); }
  else { for (const x of ex) { P.put(x, ey, fl.eye); P.put(x + 1, ey, fl.mid); P.put(x, ey - 1, fl.lo); if (eyes === 'blaze') { P.put(x - 1, ey, fl.mid); P.put(x + 1, ey - 1, fl.hi); P.put(x, ey + 1, fl.lo); } } }
  /* white hair out of the hood's edge, a bone charm on a thread */
  const wob = o.hair || 0; P.line(hx + 1, hy + 8, hx - 1 + wob, hy + 14, C.hair); P.line(hx + 3, hy + 8, hx + 2 + wob, hy + 13, '#bdb8a4'); P.line(hx - 3, hy + 7, hx - 5 + wob, hy + 12, C.hair);
  P.line(hx - 4, hy + 3, hx - 4, hy + 9, C.twine); P.rect(hx - 5, hy + 9, 2, 3, C.bone); P.put(hx - 5, hy + 11, C.boneD);
}
/* an arm: a sleeve from the shoulder to a hand, then three long fingers */
function arm(P, sx, sy, hx, hy, o = {}) { P.line(sx, sy, hx, hy, (t) => (t < 0.5 ? C.sh[2] : C.sh[1]), 3); P.line(sx - 1, sy - 1, hx - 1, hy - 1, C.sh[3], 1);
  P.ell(hx, hy, 2, 1.6, C.skin[2]); P.put(hx + 1, hy + 1, C.skin[0]); if (!o.fist) { const d = o.fd || 1; for (let k = -1; k <= 1; k++) P.line(hx + d, hy + k, hx + d * 3, hy + k * 2, C.skin[1]); } }
/* the staff: a gnarled root from a base to a tip, a fork at the top, knots */
function staff(P, x0, y0, x1, y1, fork = true) { P.line(x0, y0, x1, y1, (t) => (t < 0.3 ? C.wood[1] : C.wood[2]), 2); P.line(x0 + 1, y0, x1 + 1, y1, C.wood[0], 1);
  const n = 4; for (let k = 1; k <= n; k++) { const t = k / (n + 1), x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; P.put(x - 1, y, C.wood[3]); P.put(x + 2, y + 1, C.wood[0]); }
  if (fork) { const dxn = x1 - x0, dyn = y1 - y0, l = Math.hypot(dxn, dyn) || 1, ux = dxn / l, uy = dyn / l; P.line(x1, y1, x1 + ux * 3 + uy * 3, y1 + uy * 3 - ux * 3, C.wood[2]); P.line(x1, y1, x1 + ux * 3 - uy * 3, y1 + uy * 3 + ux * 3, C.wood[2]); } }
/* THE WITCH-FIRE LANTERN: a little cage of bone and iron on a hook, the flame in it (size 0 = embers, 1 = lit, 2 = flaring) */
function lantern(P, lx, ly, fl, size, frame) {
  P.line(lx, ly - 4, lx, ly - 1, C.twine); P.rect(lx - 3, ly - 1, 7, 1, C.iron); P.rect(lx - 3, ly + 5, 7, 1, C.iron); P.rect(lx - 3, ly, 1, 5, C.ironL); P.rect(lx + 3, ly, 1, 5, C.iron);
  P.rect(lx - 2, ly, 5, 5, size > 0 ? fl.lo : '#2a3418');
  if (size > 0) { P.rect(lx - 1, ly + 1, 3, 3, fl.mid); P.rect(lx, ly + 1, 1, 3, fl.hi); P.put(lx, ly + 2, fl.core); if (size > 1) { P.line(lx, ly - 1, lx - 1, ly - 5, fl.mid); P.line(lx + 1, ly, lx + 2, ly - 4, fl.hi); P.put(lx, ly - 6, fl.hi); } else P.put(lx, ly - 1, fl.hi); }
  else P.put(lx, ly + 3, '#6a7a30');
  if (frame !== undefined) LANTERN[frame] = [lx, ly + 2];
}
/* a jar in her hand, in its colour */
function jarIn(P, jx, jy, col, big) { const J = JC[col], w = big ? 5 : 4, h = big ? 7 : 6; P.rect(jx - (w >> 1), jy, w, h, J[0]); P.rect(jx - (w >> 1) + 1, jy + 1, w - 2, h - 2, J[1]); P.put(jx - (w >> 1) + 1, jy + 1, J[2]); P.put(jx - (w >> 1) + 1, jy + 2, J[2]); P.rect(jx - 1, jy - 2, 3, 2, '#8a5a2a'); P.put(jx, jy - 2, '#c89a5a'); }

/* every pose */
function pose(name, fl, ph) {
  const P = painter(), fi = F[name === 'jarTellG' ? 'jarTellG' : name];
  const o0 = { dx: 0, dy: 0 };
  switch (name) {
    case 'sleep': {   /* sitting, the head down, the staff across her knees */
      const o = { sink: 14, hem: 59, spread: 6, hx: -2, hy: 3, eyes: 'closed', hoodBack: 0, noBelt: false, hair: 0 }; shawl(P, o);
      staff(P, 8, 54, 50, 50); lantern(P, 52, 47, fl, 0, fi); arm(P, 24, 44, 33, 49, { fist: true }); head(P, o, fl); break; }
    case 'wake': {
      const o = { sink: 7, hem: 58, spread: 3, hx: 0, hy: 1, eyes: 'one', hair: 1 }; shawl(P, o);
      staff(P, 44, 59, 46, 22); lantern(P, 50, 22, fl, 1, fi); arm(P, 33, 36, 45, 38, { fist: true }); head(P, o, fl); arm(P, 17, 36, 13, 50); break; }
    case 'walk0': case 'walk1': {
      const k = name === 'walk1' ? 1 : 0, o = { dx: k, hy: k ? 0 : 1, hunch: k ? -1 : 0, hair: k ? 1 : -1, hemDy: 0 }; shawl(P, o);
      staff(P, 44 + (k ? 1 : 0), 59, 46 + (k ? 1 : 0), 6); lantern(P, 50 + (k ? 1 : 0), 11, fl, 1, fi); arm(P, 33 + k, 35, 44 + (k ? 1 : 0), 33, { fist: true }); arm(P, 17 + k, 36, 12 + (k ? 2 : -1), 49 - k * 2); head(P, o, fl); break; }
    case 'floated': {   /* lifted off her feet: the hem drifting up, the head back, the arms limp, the staff adrift */
      const o = { dy: -9, hemDy: -2, hoodBack: 1, hy: -2, hx: -1, eyes: 'open', hair: 2, spread: 5, mouth: true }; staff(P, 14, 40, 44, 14); lantern(P, 47, 10, fl, 1, fi); shawl(P, o);
      arm(P, 18, 30, 8, 36); arm(P, 33, 30, 40, 40, { fd: 1 }); head(P, o, fl); for (let k = 0; k < 5; k++) P.put(16 + k * 6, 56 + (k % 2) * 2, C.sh[1]); break; }
    case 'staffTell': {   /* coiled back, the staff cocked high behind her, the free claw forward, the lantern swinging, eyes blazing */
      const o = { dx: -3, lean: -2, hunch: -2, hy: 2, hx: 1, eyes: 'blaze', mouth: true, hair: -2 }; shawl(P, o);
      staff(P, 24, 36, 10, 2); lantern(P, 7, 7, fl, 2, fi); arm(P, 26, 34, 24, 33, { fist: true }); arm(P, 36, 34, 46, 30, { fd: 1 }); head(P, o, fl);
      P.put(48, 24, '#ffd36b'); P.put(50, 21, '#ffd36b'); P.put(46, 21, '#ffd36b'); break; }
    case 'staff': {   /* lunging, the staff swung low across the floor: a smear behind it */
      const o = { dx: 4, lean: 5, hunch: 3, hy: 4, hx: 2, eyes: 'open', mouth: true }; shawl(P, o);
      for (let k = 0; k < 6; k++) P.line(26 + k, 18 + k * 5, 52, 32 + k * 4, k < 2 ? C.hair : '#bdb8a4', 1);
      staff(P, 30, 38, 54, 52); lantern(P, 55, 47, fl, 1, fi); arm(P, 36, 36, 34, 40, { fist: true }); arm(P, 18, 38, 12, 46); head(P, o, fl); break; }
    case 'fireballTell': {   /* the lantern held high, a ball of witch-fire swelling in the raised palm, the head tipped up */
      const o = { dy: -1, lean: -1, hy: -1, hx: 1, eyes: 'blaze', mouth: true, hoodBack: 0.5, hair: 1 }; shawl(P, o);
      staff(P, 20, 59, 24, 4); lantern(P, 28, 10, fl, 2, fi); arm(P, 17, 33, 22, 24, { fist: true }); arm(P, 36, 32, 46, 20, { fd: 1 });
      P.ell(50, 17, 4, 4, (nx, ny) => (nx * nx + ny * ny < 0.25 ? fl.core : nx * nx + ny * ny < 0.6 ? fl.hi : fl.mid)); P.put(48, 12, fl.hi); P.put(52, 13, fl.mid); P.put(46, 15, fl.lo); P.put(54, 19, fl.lo); head(P, o, fl); break; }
    case 'cast': {   /* the arm thrown forward, the ball gone, the sparks it leaves; the body leaning after it */
      const o = { dx: 3, lean: 4, hunch: 2, hy: 3, hx: 2, eyes: 'blaze', mouth: true, hair: -2 }; shawl(P, o);
      staff(P, 24, 59, 26, 6); lantern(P, 30, 12, fl, 1, fi); arm(P, 19, 34, 24, 28, { fist: true }); arm(P, 38, 31, 52, 29, { fd: 1 });
      for (let k = 0; k < 4; k++) { P.put(52 + (k % 2), 24 + k * 2, k % 2 ? fl.hi : fl.mid); } P.put(55, 29, fl.core); head(P, o, fl); break; }
    case 'jarTellG': case 'jarTellR': {   /* a jar drawn from her belt and held high in its colour; the head turned to the spot */
      const col = name === 'jarTellG' ? 'green' : 'red', o = { dy: -1, lean: -1, hy: 0, hx: 1, eyes: 'open', mouth: true, jarGone: col }; shawl(P, o);
      staff(P, 8, 59, 10, 10); lantern(P, 13, 15, fl, 1, fi); arm(P, 17, 34, 10, 33, { fist: true }); arm(P, 36, 32, 40, 14, { fist: true }); jarIn(P, 41, 5, col, true);
      P.put(38, 3, JC[col][2]); P.put(44, 4, JC[col][2]); P.put(41, 1, JC[col][2]); head(P, o, fl); break; }
    case 'hurledG': case 'hurledR': {   /* the throw through: the arm out and down, the jar gone, a smear of its colour */
      const col = name === 'hurledG' ? 'green' : 'red', o = { dx: 3, lean: 5, hunch: 3, hy: 4, hx: 2, eyes: 'open', mouth: true, jarGone: col }; shawl(P, o);
      staff(P, 14, 59, 16, 12); lantern(P, 19, 17, fl, 1, fi); arm(P, 22, 33, 18, 30, { fist: true }); arm(P, 37, 34, 52, 42, { fd: 1 });
      for (let k = 0; k < 5; k++) P.put(46 + k * 2, 38 + k, k % 2 ? JC[col][2] : JC[col][1]); head(P, o, fl); break; }
    case 'broodTell': {   /* both arms flung wide, the hood back, calling: the lantern flaring, glints round her */
      const o = { dy: -2, hoodBack: 1, hy: -2, hx: 0, eyes: 'blaze', mouth: true, hair: 2, spread: 3 }; shawl(P, o);
      staff(P, 8, 58, 10, 3); lantern(P, 13, 8, fl, 2, fi); arm(P, 16, 31, 8, 30, { fist: true }); arm(P, 37, 31, 50, 24, { fd: 1 });
      for (const [x, y] of [[48, 18], [53, 22], [51, 29], [4, 20], [46, 12]]) { P.put(x, y, fl.hi); P.put(x + 1, y, fl.mid); } head(P, o, fl); break; }
    case 'kick': {   /* the staff slammed down: bent over it with both fists, rings at its foot */
      const o = { dx: 2, sink: 4, lean: 4, hunch: 2, hy: 3, hx: 2, eyes: 'open', mouth: true }; shawl(P, o);
      staff(P, 44, 59, 44, 8); lantern(P, 48, 13, fl, 2, fi); arm(P, 33, 36, 43, 34, { fist: true }); arm(P, 17, 38, 14, 49);
      for (let r = 0; r < 3; r++) { P.line(32 - r * 4, 59 - r, 56, 59 - r, r ? fl.mid : fl.hi); } head(P, o, fl); break; }
    case 'stirTell': {   /* (phase two) the great ladle raised in both fists, leaning back, the hood thrown off */
      const o = { dx: -2, lean: -3, hunch: -2, hoodBack: 1, hy: 0, hx: 0, eyes: 'blaze', mouth: true, hair: 3 }; shawl(P, o);
      staff(P, 9, 56, 10, 20); lantern(P, 13, 25, fl, 2, fi);
      P.line(30, 38, 46, 2, C.bone, 2); P.ell(48, 3, 4, 3, (nx, ny) => (ny > 0.2 ? C.boneD : C.bone)); P.put(48, 4, fl.hi); arm(P, 24, 34, 34, 30, { fist: true }); arm(P, 35, 33, 40, 18, { fist: true }); head(P, o, fl); break; }
    case 'stir': {   /* the ladle plunged forward and down into the cauldron's place, sparks */
      const o = { dx: 4, lean: 6, hunch: 3, hy: 5, hx: 3, eyes: 'blaze', mouth: true, hair: -3 }; shawl(P, o);
      staff(P, 8, 59, 10, 14); lantern(P, 13, 19, fl, 2, fi); P.line(36, 34, 54, 56, C.bone, 2); P.ell(54, 57, 3, 2, C.boneD); arm(P, 25, 35, 36, 36, { fist: true }); arm(P, 18, 37, 14, 47);
      for (let k = 0; k < 6; k++) P.put(44 + k * 2, 44 - (k % 3) * 2, k % 2 ? fl.hi : fl.mid); head(P, o, fl); break; }
    case 'ward': {   /* the staff crossed before her, a palm out: nothing gets through */
      const o = { dx: -1, hy: 1, hx: 2, eyes: 'open', hair: 0 }; shawl(P, o);
      staff(P, 20, 52, 50, 16); lantern(P, 52, 21, fl, 1, fi); arm(P, 36, 34, 40, 32, { fist: true }); arm(P, 18, 34, 28, 30, { fist: true }); arm(P, 36, 34, 50, 34, { fd: 1 }); head(P, o, fl);
      for (let k = 0; k < 3; k++) { P.put(53, 26 + k * 4, fl.mid); } break; }
    case 'dead': {   /* a heap of shawl on the floor, the hood fallen, the staff broken beside her, the lantern out */
      const P2 = P; P2.ell(27, 54, 22, 6, (nx, ny) => shade(C.sh, nx, ny - 0.3)); P2.ell(22, 49, 11, 6, (nx, ny) => shade(C.sh, nx, ny)); P2.ell(40, 52, 9, 6, (nx, ny) => shade(C.hood, nx, ny - 0.2));
      P2.line(6, 58, 20, 55, C.wood[2], 2); P2.line(44, 58, 52, 53, C.wood[2], 2); P2.rect(48, 54, 4, 4, C.iron); P2.put(49, 56, '#4a5a28'); P2.rect(36, 53, 5, 2, C.skin[1]); P2.put(38, 52, C.hair); P2.line(32, 50, 28, 56, C.hair); P2.rect(16, 52, 3, 3, C.patchA);
      for (const [x, y] of [[20, 57], [27, 58], [34, 57]]) P2.rect(x, y, 3, 2, C.sh[0]); LANTERN[fi] = [50, 56]; break; }
  }
  void o0; void ph;
  outline(P.c, OUT); return P.c;
}
const ORDER = Object.keys(F);
const bakeSet = ph => { const fl = FLAME[ph], fr = ORDER.map(n => pose(n, fl, ph)); if (ph) fr.forEach((c, i) => { if (i === F.dead) return; const g = c.getContext('2d'); for (let k = 0; k < 7; k++) { g.fillStyle = k % 2 ? '#ff9a5c' : '#d8502a'; g.fillRect(14 + ((k * 7 + i * 3) % 26), 34 + ((k * 5) % 22), 1, 1); } });   /* phase two: embers on the shawl */
  return { R: fr, L: fr.map(c => flipX(c)), white: { R: fr.map(c => whiten(c)), L: fr.map(c => flipX(whiten(c))) }, ax: AX, ay: AY, w: 20, h: 40 }; };
export function bakeSets() { const p1 = bakeSet(0), p2 = bakeSet(1), pick = (s, ids) => { const fr = ids.map(i => s.R[i]); return { R: fr, L: fr.map(c => flipX(c)), white: { R: fr.map(c => whiten(c)), L: fr.map(c => flipX(whiten(c))) }, ax: AX, ay: AY, w: 20, h: 40 }; };
  return { p1, p2, card: pick(p1, [F.walk0, F.walk1]) }; }
/* the sheet's frame for what she is doing (potion-hands.js granMode -> frame); phase two draws from the second set */
export function frameOf(e) {
  const m = e.mode, t = Math.floor((e.anim || 0) * 4) % 2;
  if (m === 'sleep') return F.sleep; if (m === 'wake') return F.wake; if (m === 'floated') return F.floated;
  if (m === 'staffTell') return F.staffTell; if (m === 'staff') return F.staff;
  if (m === 'fireballTell') return F.fireballTell; if (m === 'cast') return F.cast;
  if (m === 'jarTell') return e.hurlCol === 'green' ? F.jarTellG : F.jarTellR; if (m === 'hurled') return e.hurlCol === 'green' ? F.hurledG : F.hurledR;
  if (m === 'broodTell') return F.broodTell; if (m === 'kick') return F.kick;
  if (m === 'stirTell') return F.stirTell; if (m === 'stir') return F.stir;
  if (e.ward > 0 && e.mode === 'walk') return F.ward;
  return t ? F.walk1 : F.walk0;
}
export function bakeIcon() { return bakeSets().card; }
