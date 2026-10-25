// underleaf3_gran.js - THE GRANDMOTHER 3 (claude/underleafart, animated by claude/grandpolish): the goblins' old witch-matriarch, a BENT old witch - the back a hump above her head, the head hung forward out of a
// drooping hood (its tip flopped back over the hump), a long hooked nose and two eyes of her own potion-light in the dark of it, a chin and a wart, long clawed hands, a gnarled root staff with a WITCH-FIRE LANTERN on
// its fork, her jars on her belt, a ragged short hem over two bent legs and boots. 56 x 62 (~1.3x the old 42 x 48), faces right (the left set is mirrored).
// EVERY MOVE HAS ITS OWN POSES (B16: no shared punch/cast/idle frame) AND IS ANIMATED: 3 or more frames each, walked in order over the move's own length (SEQ / frameOf):
//   sleep x3 (breathing)  wake x3  idle x4 (breath, lantern sway, a blink)  walk x4 (the hobble)  hurt x3 (flinch)
//   staffTell x3 coil -> cocked   staff x3 swing -> smear -> follow-through   fireballTell x4 lantern up -> spark -> ball swelling   cast x3 arm back -> thrown -> follow
//   jarTell green|red x3 reach back to the belt -> jar drawn -> raised   hurled green|red x3 arm through -> colour smear -> follow   broodTell x4 arms rising -> flung wide -> calling -> flare
//   kick x3 staff up -> slam -> rings   stirTell x4 / stir x3 (phase two) the great ladle raised -> plunged   ward x3 hunched behind the glow, a palm out, trembling
//   floated x4 flailing in the bubble   dead x4 clutch -> kneel -> slump -> a heap of shawl (the body fades through them)
// Two sets: phase one (the lantern burns witch-green) and phase two (it burns red-orange, her eyes blaze, embers on the shawl). bakeSets() -> { p1, p2, card }, each { R, L, white, ax, ay, w, h }.
// LANTERN[frame] = [x, y] where the flame is in each frame (drawGran lights it).
import { canvas, flipX, whiten, outline } from '../px.js';

const OUT = '#1b1626', W = 56, H = 62, AX = 28, AY = 60;
export const LANTERN = {};
const C = { sh: ['#1c2412', '#2e3a1e', '#46582c', '#6a8240'], hood: ['#12180c', '#222e18', '#384a26', '#587038'], skin: ['#3a5a2a', '#5a7e3e', '#86aa5c', '#b4d080'], wood: ['#2a1a0e', '#4a3220', '#6e4e30', '#98724a'],
  patchA: '#8a6a30', patchB: '#7a4222', bone: '#e8dcc0', boneD: '#9c8c68', hair: '#ece8d6', iron: '#2a2420', ironL: '#5a544c', twine: '#cbb888', boot: '#2a1a0e' };
const FLAME = [{ lo: '#4a8a1e', mid: '#9be048', hi: '#d8ff90', core: '#f4ffd8', eye: '#d8ff90' }, { lo: '#c8381c', mid: '#ff8a3a', hi: '#ffd36b', core: '#fff1a0', eye: '#ffb070' }, { lo: '#2a5a9a', mid: '#4a8fd8', hi: '#a8d8ff', core: '#f0faff', eye: '#a8d8ff' }];   /* (claude/underleaf4art) 0 green (P1), 1 red (P3), 2 BLUE (P2) */
/* (claude/underleaf4art) HER THREE LOOKS: the shawl and hood take the phase's potion - green bramble, blue-dusk bubbles, scorched cauldron-brick (skin, wood and iron stay hers) */
const SHAWL = [null, { sh: ['#2a1410', '#4a2418', '#7a3a22', '#a8582e'], hood: ['#1a0c0a', '#30160e', '#52281a', '#7a3c24'] }, { sh: ['#141c34', '#222f58', '#3a4f86', '#5f7fb8'], hood: ['#0e1226', '#1a2446', '#2c3c6c', '#4a60a0'] }];
const SHAWL0 = { sh: C.sh.slice(), hood: C.hood.slice() };
const JC = { green: ['#2e5a1c', '#5fae3a', '#9be06a'], blue: ['#24406a', '#4a8fd8', '#a8d8ff'], red: ['#6a2014', '#d8502a', '#ffb070'] };

function painter() {
  const [c, g] = canvas(W, H);
  const put = (x, y, col) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) { g.fillStyle = col; g.fillRect(x, y, 1, 1); } };
  const rect = (x, y, w, h, col) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, col); };
  const ell = (cx, cy, rx, ry, colFn) => { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { const nx = (x - cx) / rx, ny = (y - cy) / ry; if (nx * nx + ny * ny <= 1) put(x, y, typeof colFn === 'function' ? colFn(nx, ny) : colFn); } };
  const line = (x0, y0, x1, y1, col, th = 1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let k = 0; k <= n; k++) { const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n; for (let t = 0; t < th; t++) put(x + (Math.abs(y1 - y0) > Math.abs(x1 - x0) ? t : 0), y + (Math.abs(y1 - y0) > Math.abs(x1 - x0) ? 0 : t), typeof col === 'function' ? col(k / n) : col); } };
  /* a capsule: a round limb or body from (x0,y0,r0) to (x1,y1,r1), coloured by colFn(nx, ny) */
  const cap = (x0, y0, r0, x1, y1, r1, colFn) => { const mnx = Math.floor(Math.min(x0 - r0, x1 - r1)), mxx = Math.ceil(Math.max(x0 + r0, x1 + r1)), mny = Math.floor(Math.min(y0 - r0, y1 - r1)), mxy = Math.ceil(Math.max(y0 + r0, y1 + r1)), dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy || 1;
    for (let y = mny; y <= mxy; y++) for (let x = mnx; x <= mxx; x++) { const t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / l2)), cx = x0 + dx * t, cy = y0 + dy * t, r = r0 + (r1 - r0) * t, d = Math.hypot(x - cx, y - cy); if (d <= r) put(x, y, colFn((x - cx) / r, (y - cy) / r)); } };
  return { c, g, put, rect, ell, line, cap };
}
/* a lit-from-the-left ramp pick: nx, ny in -1..1 across the shape */
const shade = (ramp, nx, ny) => { const l = -nx * 0.7 - ny * 0.5; return l > 0.45 ? ramp[3] : l > 0.0 ? ramp[2] : l > -0.5 ? ramp[1] : ramp[0]; };
const shS = (nx, ny) => shade(C.sh, nx, ny), shH = (nx, ny) => shade(C.hood, nx, ny);

/* THE HOOD AND THE FACE: a dome hung forward, its tip drooping back over the hump, the dark of it, two eyes of potion-light, a hooked nose, a pointed chin with a wart, a long ear, white hair, a bone charm */
function head(P, s, fl, hx, hy) {
  const back = s.hood || 0, eyes = s.eyes || 'open', bow = s.bow || 0;
  hy += bow;
  /* the long ear out of the back of the hood */
  P.line(hx - 6, hy - 1, hx - 13 - back * 2, hy - 6 - back * 3, C.skin[1], 2); P.put(hx - 14 - back * 2, hy - 7 - back * 3, C.skin[0]);
  /* the hood's drooping tip: up from the crown, over, and flopped back down toward the hump */
  const tip = s.tipSwing || 0;
  P.line(hx - 1, hy - 8, hx - 5, hy - 12 - back * 2, C.hood[2], 3); P.line(hx - 5, hy - 12 - back * 2, hx - 10 + tip, hy - 11 - back * 2, C.hood[1], 2); P.line(hx - 10 + tip, hy - 11 - back * 2, hx - 13 + tip, hy - 7 - back * 2, C.hood[0], 2); P.put(hx - 13 + tip, hy - 6 - back * 2, C.bone);
  /* the dome */
  P.ell(hx, hy, 8.5, 8.5, shH);
  P.rect(hx - 5, hy - 8, 9, 1, C.hood[3]);
  /* the dark of it, the face in it (the face is to the right: it is a face seen from the side, hung forward) */
  const fx = hx + 3 - back * 2, fy = hy + 1;
  P.ell(fx, fy, 5.5, 6, '#070a04'); P.ell(fx + 1, fy + 1, 4, 4.8, (nx, ny) => shade(C.skin, nx * 0.7, ny * 0.7 + 0.3));
  /* the nose: a long hook out past the hood's edge, a wart; the chin: a point; the mouth: a line and a tooth */
  P.line(fx + 3, fy, fx + 8, fy + 3, C.skin[2], 2); P.line(fx + 8, fy + 4, fx + 8, fy + 6, C.skin[1], 2); P.put(fx + 8, fy + 2, C.skin[3]); P.put(fx + 6, fy + 5, '#2a3a1c'); P.put(fx + 4, fy + 4, C.skin[0]);
  P.put(fx + 3, fy + 8, C.skin[1]); P.put(fx + 4, fy + 9, C.skin[2]); P.put(fx + 2, fy + 9, C.skin[0]); P.put(fx + 5, fy + 8, C.skin[1]);
  if (s.mouth) { P.rect(fx, fy + 5, 5, 2, '#0a0e06'); P.put(fx + 1, fy + 5, C.bone); P.put(fx + 3, fy + 5, C.bone); } else { P.line(fx - 1, fy + 6, fx + 4, fy + 6, '#0a0e06'); P.put(fx + 1, fy + 7, C.bone); }
  /* eyes: closed = a line, open = two lights under a heavy brow, blaze = bigger with a halo of pixels */
  const ex = [fx - 1, fx + 3], ey = fy - 1;
  for (const x of ex) P.put(x, ey - 2, '#0a0e06');
  if (eyes === 'closed') { for (const x of ex) { P.put(x, ey + 1, '#0a0e06'); P.put(x + 1, ey + 1, '#0a0e06'); } }
  else if (eyes === 'one') { P.put(ex[1], ey, fl.eye); P.put(ex[1] + 1, ey, fl.mid); P.put(ex[0], ey + 1, '#0a0e06'); P.put(ex[0] + 1, ey + 1, '#0a0e06'); }
  else { for (const x of ex) { P.put(x, ey, fl.eye); P.put(x + 1, ey, fl.mid); P.put(x, ey - 1, fl.lo); if (eyes === 'blaze') { P.put(x - 1, ey, fl.mid); P.put(x + 1, ey - 1, fl.hi); P.put(x, ey + 1, fl.lo); P.put(x + 1, ey + 1, fl.lo); } } }
  /* the front of the hood over the brow, so the face sits IN it */
  P.line(fx - 5, fy - 4, fx + 5, fy - 5, C.hood[1], 2); P.line(fx - 5, fy - 5, fx + 3, fy - 6, C.hood[2], 1);
  /* white hair out of the hood's lower edge, a bone charm on a thread */
  const wob = s.hair || 0; P.line(hx + 1, hy + 8, hx - 1 + wob, hy + 14, C.hair); P.line(hx + 3, hy + 8, hx + 2 + wob, hy + 13, '#bdb8a4'); P.line(hx - 3, hy + 7, hx - 5 + wob, hy + 12, C.hair);
  P.line(hx - 4, hy + 4, hx - 4, hy + 9, C.twine); P.rect(hx - 5, hy + 9, 2, 3, C.bone); P.put(hx - 5, hy + 11, C.boneD);
}
/* an arm: a sleeve from the shoulder through an elbow to a long clawed hand */
function arm(P, sx, sy, hx, hy, o = {}) {
  const ex = o.ex ?? (sx + hx) / 2 - 1, ey = o.ey ?? (sy + hy) / 2 + 3;
  P.line(sx, sy, ex, ey, (t) => (t < 0.5 ? C.sh[2] : C.sh[1]), 3); P.line(ex, ey, hx, hy, C.sh[1], 3); P.line(sx - 1, sy - 1, ex - 1, ey - 1, C.sh[3], 1); P.put(ex, ey + 1, C.sh[0]);
  P.line(hx - 2, hy - 1, hx, hy, C.patchA, 1);   /* a rag tied at the wrist */
  P.ell(hx + 1, hy, 2.3, 1.9, C.skin[2]); P.put(hx + 1, hy + 1, C.skin[0]); P.put(hx, hy - 1, C.skin[3]);
  if (!o.fist) { const d = o.fd || 1, up = o.up || 0; for (let k = -1; k <= 1; k++) P.line(hx + d * 2, hy + k, hx + d * 5, hy + k * 2 + up, C.skin[1]); P.put(hx + d * 5, hy + 2 + up, C.skin[3]); }
  else { P.put(hx + 2, hy - 1, C.skin[1]); P.put(hx + 2, hy + 1, C.skin[1]); }
}
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

/* THE BODY. s = { dx, c (crouch: lowers the hips), lean (the shoulders forward), sh (shoulder rise), hdx/hdy (the head), step:[a,b] (feet offsets), lift:[a,b] (feet raised), sit, hemDy, sway,
   fh:[x,y,opts] the front (staff) hand, bh:[x,y,opts] the back hand (null = hanging), staff:[x0,y0,x1,y1] | null, lan:[x,y,size] | null, jarGone, eyes, mouth, hood, hair, under(P), over(P, fl) }
   A pose is drawn from the back to the front: what is behind her, the back arm, the legs, the skirt, the body and the hump, the belt, the head, the front arm, the staff, the lantern, what is in front. */
function body(P, s, fl, fi) {
  const dx = s.dx || 0, c = s.c || 0, lean = s.lean || 0, hipx = 22 + dx, hipy = 46 + c, shx = hipx + 9 + lean, shy = hipy - 14 + (s.sh || 0) + (s.sit ? 1 : 0);
  const hx = shx + 7 + (s.hdx || 0), hy = shy - 2 + (s.hdy || 0), floor = 59, hem = s.sit ? 58 : Math.min(hipy + 6 + (s.hemDy || 0), 54);
  const step = s.step || [0, 0], lift = s.lift || [0, 0];
  if (s.under) s.under(P, fl);
  const staffBack = s.staffBack, drawStaff = () => { if (s.staff) staff(P, ...s.staff); };
  if (staffBack) drawStaff();
  /* the back arm, behind the body */
  const bh = s.bh === undefined ? [hipx - 7, hipy + 4, {}] : s.bh;
  if (bh && !s.bhFront) arm(P, shx - 6, shy + 4, bh[0], bh[1], bh[2] || {});
  /* the legs and boots */
  if (!s.sit) for (let i = 0; i < 2; i++) { const fx = hipx + (i ? 6 : -3) + step[i], fy = floor - 1 - lift[i], tx = hipx + (i ? 4 : -1);
    P.line(tx, hem - 1, fx + 1, fy - 1, C.skin[0], 2); P.rect(fx - 1, fy - 1, 6, 3, C.boot); P.rect(fx - 1, fy - 1, 4, 1, C.wood[2]); P.put(fx + 4, fy, C.wood[1]); }
  else { P.rect(hipx - 6, 56, 6, 3, C.boot); P.rect(hipx + 13, 56, 6, 3, C.boot); }
  /* the skirt: short, ragged, scalloped, patched; narrow at the waist (this is not a cone: the knees and the boots show) */
  const top = hipy - 3, cx0 = hipx + 2 + (s.sway || 0);
  for (let y = top; y <= hem; y++) { const k = (y - top) / (hem - top || 1), half = 7 + k * (4 + (s.spread || 0));
    for (let x = Math.round(cx0 - half); x <= Math.round(cx0 + half); x++) { const nx = (x - cx0) / half; let col = shade(C.sh, nx, k - 0.5); if (((x * 7 + y * 13) % 29) === 0) col = C.sh[1]; P.put(x, y, col); } }
  for (let x = Math.round(cx0 - 11 - (s.spread || 0)); x <= Math.round(cx0 + 11 + (s.spread || 0)); x++) if (((x * 3) & 7) < 4) P.put(x, hem + 1, ((x >> 1) % 3 ? C.sh[1] : C.patchA)); else if (((x * 3) & 7) === 5) P.put(x, hem + 2, C.sh[0]);
  P.rect(cx0 - 5, hipy + 2, 5, 4, C.patchA); P.rect(cx0 - 5, hipy + 2, 5, 1, '#a88a44'); P.rect(cx0 + 4, Math.min(hem - 4, hipy + 5), 3, 3, C.patchB); P.line(cx0 + 1, hipy + 3, cx0, hem - 1, C.sh[0]);
  /* the torso and the HUMP: the back is a great round hump higher than her head, the chest hollow, the shoulders hunched forward */
  P.cap(hipx, hipy - 1, 8, shx - 2, shy + 3, 7, shS);
  P.cap(hipx - 3, shy - 3, 8.5, shx - 8, shy - 2, 8, shS); P.cap(hipx - 3, shy - 5, 7.5, shx - 9, shy - 4, 7, shS);
  P.line(hipx - 9, shy + 2, hipx - 7, hipy + 3, C.sh[0], 1); P.line(hipx - 2, shy - 7, hipx - 1, shy + 2, C.sh[1], 1); P.rect(hipx - 6, shy - 4, 3, 3, C.patchA); P.put(hipx - 6, shy - 4, '#a88a44');
  P.cap(shx - 1, shy + 1, 5.5, shx + 3, shy + 3, 4.5, shS);   /* the stooped shoulder */
  P.line(shx - 3, shy + 6, shx + 3, shy + 9, C.sh[0]);   /* the shawl's front edge */
  /* her belt, and her jars on it: three, in her three colours, and a bone charm and a herb sprig */
  if (!s.noBelt) { const by = hipy - 2; P.rect(hipx - 4, by, 16, 2, C.wood[1]); P.rect(hipx - 4, by, 16, 1, C.wood[2]);
    const jars = [['green', hipx - 2], ['blue', hipx + 3], ['red', hipx + 8]]; for (const [col, jx] of jars) { if (s.jarGone === col) continue; const J = JC[col]; P.rect(jx, by + 2, 4, 4, J[0]); P.rect(jx + 1, by + 3, 2, 2, J[1]); P.put(jx + 1, by + 3, J[2]); P.rect(jx + 1, by + 1, 2, 1, C.twine); }
    P.put(hipx + 12, by + 2, '#7ab04a'); P.put(hipx + 13, by + 3, '#9be06a'); P.line(hipx - 5, by + 2, hipx - 5, by + 6, C.bone); P.put(hipx - 5, by + 7, C.boneD); }
  head(P, s, fl, hx, hy);
  /* the front arm and the staff: the hand closes on the staff where it passes */
  if (!staffBack) drawStaff();
  const fh = s.fh || [shx + 12, shy + 8, { fist: true }];
  arm(P, shx + 3, shy + 4, fh[0], fh[1], fh[2] || {});
  if (bh && s.bhFront) arm(P, shx - 2, shy + 5, bh[0], bh[1], bh[2] || {});
  if (s.lan) lantern(P, s.lan[0], s.lan[1], fl, s.lan[2], fi);
  if (s.over) s.over(P, fl);
}

/* the staff planted ahead and the lantern on its fork, with a little sway: the stance every walking frame shares (x shifts the staff, sw sways the lantern) */
const planted = (x = 46, sw = 0) => ({ staff: [x, 59, x + 2, 8], lan: [x + 6 + sw, 13, 1], fh: [x - 1, 41, { fist: true }] });
const ball = (x, y, r) => (P, fl) => { P.ell(x, y, r, r, (nx, ny) => (nx * nx + ny * ny < 0.25 ? fl.core : nx * nx + ny * ny < 0.6 ? fl.hi : fl.mid)); for (const [ox, oy, k] of [[-r - 2, -2, 'hi'], [r + 1, -3, 'mid'], [-1, -r - 2, 'lo'], [r + 2, 2, 'lo']]) P.put(x + ox, y + oy, fl[k]); };
const sparks = (pts) => (P, fl) => { pts.forEach(([x, y], k) => { P.put(x, y, k % 2 ? fl.hi : fl.mid); P.put(x + 1, y, fl.mid); }); };
const smearP = (x0, y0, x1, y1, col, n = 5) => P => { for (let k = 0; k < n; k++) P.line(x0 + k, y0 + k * 3, x1, y1 + k * 2, k < 2 ? col : '#bdb8a4', 1); };

/* ===== THE FRAMES: [name, count, builder(i) -> s]. The frame list is built in this order; F[name] = the first index, N[name] = the count. ===== */
const DEF = [
  ['sleep', 3, i => ({ c: 12, sit: true, hemDy: 0, hdy: 4 + [0, 1, 0][i] + (i === 2 ? 1 : 0), sh: [0, 1, 1][i], eyes: 'closed', staff: [6, 55, 50, 51 - i], lan: [52, 47 - [0, 1, 0][i], 0], fh: [33, 49, { fist: true }], bh: [14, 56, {}], hair: i, hood: 0 })],
  ['wake', 3, i => [{ c: 9, sit: true, hdy: 3, eyes: 'one', staff: [10, 56, 48, 50], lan: [52, 46, 0], fh: [34, 49, { fist: true }], bh: [14, 56, {}] },
    { c: 5, hdy: 1, eyes: 'one', hair: 1, ...planted(44), lan: [50, 22, 1], staff: [44, 59, 46, 22], fh: [43, 42, { fist: true }] },
    { c: 1, hdy: -1, eyes: 'open', hair: 1, mouth: true, staff: [44, 59, 46, 14], lan: [50, 19, 1], fh: [44, 40, { fist: true }] }][i]],
  ['idle', 4, i => ({ sh: [0, -1, 0, 1][i], hdy: [0, -1, 0, 1][i], hair: [0, 1, 0, -1][i], tipSwing: [0, 1, 0, -1][i], sway: [0, 0, 0, 1][i], eyes: i === 3 ? 'closed' : 'open', ...planted(46, [0, 1, 2, 1][i]), staff: [46, 59, 48 + [0, 1, 2, 1][i], 8], bh: [15 + [0, 0, 1, 1][i], 51 + [0, 1, 1, 0][i], {}] })],
  ['walk', 4, i => { const st = [[3, -3], [0, 0], [-3, 3], [0, 0]][i], lf = [[0, 0], [0, 2], [0, 0], [2, 0]][i]; return { c: [0, 1, 0, 1][i], lean: 1, step: st, lift: lf, hair: [-1, 0, 1, 0][i], tipSwing: [1, 0, -1, 0][i], hdy: [1, 0, 1, 0][i], ...planted(46 + [0, 1, 2, 1][i], [0, 1, 0, -1][i]), bh: [14 + [-1, 2, 3, 1][i], 49 - [0, 2, 0, 1][i], {}] }; }],
  ['hurt', 3, i => [{ lean: -5, c: 2, hdx: -2, hdy: -3, hood: 1, eyes: 'closed', mouth: true, hair: 3, tipSwing: 3, staff: [38, 59, 56, 14], lan: [58, 19, 1], fh: [50, 36, { fd: 1 }], bh: [6, 38, { fd: -1, up: -2 }], step: [-3, 2] },
    { lean: -4, c: 2, hdx: -2, hdy: -2, hood: 1, eyes: 'closed', mouth: true, hair: 2, tipSwing: 2, staff: [40, 59, 54, 13], lan: [57, 18, 1], fh: [48, 38, { fd: 1 }], bh: [8, 40, { fd: -1, up: -1 }], step: [-2, 1] },
    { lean: -2, c: 3, hdx: -1, hdy: 0, eyes: 'one', mouth: true, hair: 1, tipSwing: 1, staff: [42, 59, 52, 12], lan: [55, 17, 1], fh: [46, 40, { fist: true }], bh: [9, 46, {}] }][i]],
  ['staffTell', 3, i => [{ lean: -2, c: 1, hdx: -1, eyes: 'open', mouth: true, staff: [34, 40, 22, 14], lan: [20, 19, 1], fh: [31, 40, { fist: true }], bh: [43, 33, { fd: 1 }] },
    { lean: -4, c: 2, hdx: -2, eyes: 'blaze', mouth: true, hair: -2, tipSwing: 2, staff: [26, 38, 10, 2], lan: [7, 7, 2], fh: [26, 37, { fist: true }], bh: [46, 31, { fd: 1 }] },
    { lean: -5, c: 3, hdx: -2, eyes: 'blaze', mouth: true, hair: -3, tipSwing: 3, staff: [26, 38, 10, 2], lan: [7, 6, 2], fh: [26, 36, { fist: true }], bh: [47, 29, { fd: 1 }], over: sparks([[48, 24], [51, 21], [45, 20], [53, 26]]) }][i]],
  ['staff', 3, i => [{ dx: 1, lean: 2, c: 1, hdx: 1, mouth: true, staff: [28, 8, 48, 36], lan: [50, 41, 1], fh: [33, 22, { fist: true }], bh: [14, 44, {}], step: [2, -2], under: smearP(18, 6, 40, 14, C.hair, 4) },
    { dx: 4, lean: 5, c: 3, hdx: 2, hdy: 1, mouth: true, staff: [32, 38, 55, 53], lan: [56, 47, 1], fh: [36, 38, { fist: true }], bh: [12, 46, {}], step: [3, -3], under: smearP(26, 18, 52, 32, C.hair, 6) },
    { dx: 5, lean: 6, c: 5, hdx: 2, hdy: 2, mouth: true, staff: [33, 46, 55, 56], lan: [55, 51, 1], fh: [38, 44, { fist: true }], bh: [10, 44, {}], step: [3, -3], over: sparks([[52, 52], [54, 49], [50, 54]]) }][i]],
  ['fireballTell', 4, i => [{ lean: -1, hdy: 0, eyes: 'open', ...planted(44), lan: [49, 18, 1], staff: [44, 59, 46, 14], bh: [41, 38, { fd: 1 }] },
    { lean: -1, hdy: -1, eyes: 'open', mouth: true, staff: [20, 59, 24, 10], lan: [28, 16, 2], fh: [22, 36, { fist: true }], bh: [43, 28, { fd: 1 }], over: sparks([[47, 24]]) },
    { lean: -1, hdy: -2, hood: 0.5, eyes: 'blaze', mouth: true, staff: [20, 59, 24, 6], lan: [28, 12, 2], fh: [22, 34, { fist: true }], bh: [45, 22, { fd: 1, up: -2 }], over: ball(51, 18, 2) },
    { lean: -2, hdy: -3, hood: 1, hdx: -1, eyes: 'blaze', mouth: true, hair: 2, staff: [20, 59, 24, 4], lan: [28, 10, 2], fh: [22, 33, { fist: true }], bh: [46, 20, { fd: 1, up: -2 }], over: ball(52, 15, 4) }][i]],
  ['cast', 3, i => [{ lean: -3, c: 1, hdx: -1, eyes: 'blaze', mouth: true, staff: [22, 59, 24, 8], lan: [28, 13, 1], fh: [22, 35, { fist: true }], bh: [30, 28, { fd: -1 }], over: ball(26, 26, 3) },
    { lean: 3, c: 2, hdx: 2, hdy: 1, eyes: 'blaze', mouth: true, hair: -2, staff: [22, 59, 24, 8], lan: [28, 13, 1], fh: [22, 35, { fist: true }], bh: [52, 30, { fd: 1 }], over: sparks([[54, 26], [55, 31], [53, 34], [49, 24]]) },
    { lean: 4, c: 3, hdx: 2, hdy: 2, eyes: 'open', mouth: true, hair: -3, staff: [22, 59, 25, 8], lan: [29, 13, 1], fh: [23, 36, { fist: true }], bh: [49, 38, { fd: 1 }], over: sparks([[53, 36], [55, 40]]) }][i]],
];
for (const col of ['G', 'R']) { const cn = col === 'G' ? 'green' : 'red', J = JC[cn];
  DEF.push(['jarTell' + col, 3, i => [{ lean: 2, c: 2, hdx: 2, hdy: 1, eyes: 'open', mouth: true, jarGone: cn, staff: [44, 59, 46, 10], lan: [50, 15, 1], fh: [43, 42, { fist: true }], bh: [24, 49, { fd: -1 }] },
    { lean: 0, c: 1, hdx: 1, hdy: 0, eyes: 'open', mouth: true, jarGone: cn, staff: [44, 59, 46, 10], lan: [50, 15, 1], fh: [43, 42, { fist: true }], bh: [36, 30, { fd: -1, fist: true }], over: P => jarIn(P, 40, 24, cn, true) },
    { lean: -1, c: 0, hdx: 1, hdy: -1, eyes: 'blaze', mouth: true, jarGone: cn, staff: [44, 59, 46, 10], lan: [50, 15, 1], fh: [43, 42, { fist: true }], bh: [38, 14, { fist: true }], over: P => { jarIn(P, 42, 5, cn, true); P.put(39, 3, J[2]); P.put(45, 4, J[2]); P.put(42, 1, J[2]); } }][i]]);
  DEF.push(['hurled' + col, 3, i => [{ dx: 1, lean: 3, c: 2, hdx: 2, hdy: 1, eyes: 'open', mouth: true, jarGone: cn, staff: [44, 59, 46, 10], lan: [50, 15, 1], fh: [43, 42, { fist: true }], bh: [47, 24, { fd: 1, up: -1 }], over: P => { P.put(50, 26, J[2]); P.put(52, 28, J[1]); } },
    { dx: 3, lean: 5, c: 3, hdx: 3, hdy: 2, eyes: 'open', mouth: true, jarGone: cn, staff: [44, 59, 46, 10], lan: [50, 15, 1], fh: [43, 42, { fist: true }], bh: [53, 40, { fd: 1 }], over: P => { for (let k = 0; k < 5; k++) P.put(46 + k * 2, 34 + k * 2, k % 2 ? J[2] : J[1]); } },
    { dx: 3, lean: 6, c: 4, hdx: 3, hdy: 3, eyes: 'open', mouth: true, jarGone: cn, staff: [44, 59, 46, 10], lan: [50, 15, 1], fh: [43, 43, { fist: true }], bh: [52, 46, { fd: 1 }], over: P => { P.put(54, 46, J[1]); P.put(55, 49, J[0]); } }][i]]); }
DEF.push(
  ['broodTell', 4, i => [{ c: 1, eyes: 'open', staff: [8, 58, 10, 6], lan: [14, 11, 1], fh: [14, 33, { fist: true }], bh: [43, 38, { fd: 1 }] },
    { c: 0, hood: 0.5, eyes: 'open', mouth: true, staff: [8, 58, 10, 5], lan: [14, 10, 1], fh: [13, 29, { fist: true }], bh: [48, 28, { fd: 1 }] },
    { c: -1, hood: 1, hdy: -2, eyes: 'blaze', mouth: true, hair: 2, spread: 3, staff: [8, 58, 10, 3], lan: [14, 8, 2], fh: [12, 24, { fist: true }], bh: [51, 21, { fd: 1, up: -2 }], over: sparks([[48, 14], [53, 17], [4, 20]]) },
    { c: -2, hood: 1, hdy: -3, eyes: 'blaze', mouth: true, hair: 3, spread: 4, staff: [8, 58, 10, 0], lan: [14, 5, 2], fh: [12, 22, { fist: true }], bh: [52, 18, { fd: 1, up: -2 }], over: sparks([[48, 18], [53, 22], [51, 29], [4, 20], [46, 12], [38, 8], [20, 3]]) }][i]],
  ['kick', 3, i => [{ lean: -2, c: 1, hdx: -1, eyes: 'blaze', mouth: true, staff: [38, 40, 38, 0], lan: [42, 5, 2], fh: [37, 27, { fist: true }], bh: [38, 22, { fist: true }], bhFront: true },
    { dx: 2, lean: 4, c: 4, hdx: 2, hdy: 2, eyes: 'open', mouth: true, staff: [44, 59, 44, 14], lan: [48, 19, 2], fh: [44, 38, { fist: true }], bh: [43, 34, { fist: true }], bhFront: true, over: P => { for (let r = 0; r < 2; r++) P.line(34 - r * 4, 59 - r, 56, 59 - r, r ? '#9be048' : '#d8ff90'); } },
    { dx: 2, lean: 5, c: 5, hdx: 2, hdy: 3, eyes: 'open', mouth: true, staff: [44, 59, 44, 14], lan: [48, 19, 1], fh: [44, 40, { fist: true }], bh: [43, 36, { fist: true }], bhFront: true, over: P => { for (let r = 0; r < 3; r++) P.line(30 - r * 5, 59 - r, 56, 59 - r, r ? '#9be048' : '#d8ff90'); } }][i]],
  ['stirTell', 4, i => [{ lean: -1, c: 1, eyes: 'open', mouth: true, staff: [9, 56, 10, 20], lan: [13, 25, 1], fh: [30, 40, { fist: true }], bh: [34, 38, { fist: true }], under: P => P.line(32, 44, 38, 24, C.bone, 2) },
    { lean: -2, c: 1, hood: 0.5, eyes: 'blaze', mouth: true, staff: [9, 56, 10, 20], lan: [13, 25, 2], fh: [31, 36, { fist: true }], bh: [36, 32, { fist: true }], under: P => { P.line(32, 40, 42, 12, C.bone, 2); P.ell(43, 10, 3, 2, C.boneD); } },
    { lean: -3, c: 0, hood: 1, hdx: -1, eyes: 'blaze', mouth: true, hair: 2, staff: [9, 56, 10, 20], lan: [13, 25, 2], fh: [32, 33, { fist: true }], bh: [38, 22, { fist: true }], under: P => { P.line(30, 38, 46, 3, C.bone, 2); P.ell(48, 3, 4, 3, (nx, ny) => (ny > 0.2 ? C.boneD : C.bone)); } },
    { lean: -4, c: 0, hood: 1, hdx: -2, hdy: -1, eyes: 'blaze', mouth: true, hair: 3, tipSwing: 2, staff: [9, 56, 10, 20], lan: [13, 25, 2], fh: [32, 32, { fist: true }], bh: [38, 20, { fist: true }], under: P => { P.line(30, 38, 46, 2, C.bone, 2); P.ell(48, 3, 4, 3, (nx, ny) => (ny > 0.2 ? C.boneD : C.bone)); P.put(48, 4, '#ffd36b'); } }][i]],
  ['stir', 3, i => [{ dx: 2, lean: 3, c: 2, hdx: 2, hdy: 1, eyes: 'blaze', mouth: true, staff: [8, 59, 10, 14], lan: [13, 19, 2], fh: [36, 34, { fist: true }], bh: [38, 32, { fist: true }], under: P => { P.line(34, 28, 50, 46, C.bone, 2); P.ell(51, 47, 3, 2, C.boneD); } },
    { dx: 4, lean: 6, c: 4, hdx: 3, hdy: 3, eyes: 'blaze', mouth: true, hair: -3, staff: [8, 59, 10, 14], lan: [13, 19, 2], fh: [37, 37, { fist: true }], bh: [39, 36, { fist: true }], under: P => { P.line(36, 34, 54, 56, C.bone, 2); P.ell(54, 57, 3, 2, C.boneD); }, over: sparks([[44, 44], [48, 42], [52, 44], [54, 48], [50, 50]]) },
    { dx: 4, lean: 6, c: 4, hdx: 3, hdy: 3, eyes: 'open', mouth: true, staff: [8, 59, 10, 14], lan: [13, 19, 2], fh: [37, 37, { fist: true }], bh: [39, 36, { fist: true }], under: P => { P.line(36, 34, 54, 56, C.bone, 2); P.ell(54, 57, 3, 2, C.boneD); }, over: sparks([[46, 40], [52, 38], [55, 44]]) }][i]],
  ['ward', 3, i => ({ lean: -3, c: 5 + (i === 1 ? 1 : 0), hdx: -1, hdy: 3, bow: 1, hood: 0, eyes: i === 1 ? 'closed' : 'one', mouth: false, hair: [0, 1, 0][i], tipSwing: [0, 1, 2][i], staff: [22, 52, 50, 16], lan: [52, 21, 1], fh: [36, 36, { fist: true }], bh: [47 + i, 34, { fd: 1, up: -1 }], bhFront: true,
    over: P => { for (let k = 0; k < 3; k++) P.put(55, 24 + k * 5 + i, '#dfe8ff'); P.put(53, 30 + i * 2, '#fff'); } })],
  ['floated', 4, i => ({ dx: 0, c: -6, lean: [-2, 1, -1, 2][i], hdx: [-1, 1, -1, 0][i], hdy: [-2, -4, -3, -1][i], hood: 1, eyes: 'open', mouth: true, hair: [2, -2, 3, -3][i], tipSwing: [3, -1, 3, 0][i], spread: [4, 6, 5, 3][i], hemDy: -2, step: [[-2, 4], [3, -3], [-3, 2], [2, -4]][i], lift: [[4, 0], [0, 5], [5, 1], [0, 4]][i],
    staff: [[14, 40, 44, 14], [10, 28, 40, 38], [18, 46, 48, 20], [12, 20, 40, 46]][i], lan: [[47, 10, 1], [43, 43, 1], [51, 16, 1], [43, 51, 1]][i],
    fh: [[44, 22, { fd: 1, up: -1 }], [48, 40, { fd: 1 }], [42, 18, { fd: 1, up: -2 }], [47, 36, { fd: 1 }]][i], bh: [[8, 38, { fd: -1 }], [8, 22, { fd: -1, up: -2 }], [6, 34, { fd: -1 }], [10, 18, { fd: -1, up: -2 }]][i], bhFront: false,
    over: P => { for (let k = 0; k < 5; k++) P.put(16 + k * 6, 56 + ((k + i) % 2) * 2, C.sh[1]); } })],
  ['dead', 4, i => [{ lean: -6, c: 4, hdx: -3, hdy: 0, hood: 1, eyes: 'closed', mouth: true, hair: 3, tipSwing: 3, step: [-3, 3], staff: [40, 46, 56, 42], lan: [56, 44, 2], fh: [46, 40, { fd: 1 }], bh: [12, 40, { fd: -1, up: -2 }] },
    { c: 12, sit: true, lean: 2, hdx: 1, hdy: 5, hood: 0, eyes: 'closed', hair: 1, staff: [30, 56, 54, 36], lan: [53, 53, 1], fh: [33, 50, { fist: true }], bh: [12, 54, {}] },
    { c: 17, sit: true, lean: 5, hdx: 2, hdy: 8, eyes: 'closed', hair: 2, staff: [34, 58, 54, 51], lan: [53, 54, 0], fh: [30, 54, { fd: 1 }], bh: [12, 56, {}], noBelt: false },
    null][i]],
);
/* (claude/underleaf4) THE VINE LASH: the staff dragged low and back along the floor (green sparks run up it), then flung forward along the boards;
   THE BUBBLE TRAP: the lantern held out in both hands, a blue bubble swelling at its mouth, then pushed off */
const vineUp = k => P => { for (let q = 0; q < 3 + k; q++) { P.put(8 + q * 3, 52 - q * 2, q % 2 ? '#9be06a' : '#5fae3a'); P.put(9 + q * 3, 53 - q * 2, '#2e5a1c'); } };
const bub = (bx, by, r) => P => { for (let a = 0; a < 16; a++) { const t = a / 16 * Math.PI * 2; P.put(bx + Math.round(Math.cos(t) * r), by + Math.round(Math.sin(t) * r), a % 4 ? '#a8d8ff' : '#ffffff'); } P.put(bx - 1, by - 1, '#ffffff'); };
DEF.push(
  ['lashTell', 3, i => [{ lean: -3, c: 2, hdx: -1, eyes: 'open', mouth: true, staff: [32, 42, 8, 54], lan: [20, 30, 1], fh: [30, 42, { fist: true }], bh: [40, 40, { fd: 1 }], over: vineUp(0) },
    { lean: -5, c: 3, hdx: -2, eyes: 'blaze', mouth: true, hair: -2, tipSwing: 2, staff: [30, 44, 4, 56], lan: [16, 32, 2], fh: [28, 44, { fist: true }], bh: [42, 38, { fd: 1 }], over: vineUp(2) },
    { lean: -6, c: 4, hdx: -2, eyes: 'blaze', mouth: true, hair: -3, tipSwing: 3, staff: [30, 46, 2, 57], lan: [14, 33, 2], fh: [28, 46, { fist: true }], bh: [43, 37, { fd: 1 }], over: vineUp(4) }][i]],
  ['lash', 3, i => [{ dx: 2, lean: 3, c: 2, hdx: 1, mouth: true, staff: [30, 46, 56, 56], lan: [52, 48, 1], fh: [34, 44, { fist: true }], bh: [14, 46, {}], step: [2, -2], under: smearP(20, 50, 58, 56, '#5fae3a') },
    { dx: 4, lean: 5, c: 3, hdx: 2, hdy: 1, mouth: true, staff: [34, 48, 60, 57], lan: [56, 50, 1], fh: [38, 46, { fist: true }], bh: [12, 46, {}], step: [3, -3], over: sparks([[58, 55], [60, 52]]) },
    { dx: 4, lean: 4, c: 3, hdx: 2, hdy: 2, mouth: true, staff: [34, 48, 59, 57], lan: [55, 51, 1], fh: [38, 46, { fist: true }], bh: [12, 46, {}], step: [3, -3] }][i]],
  ['trapTell', 3, i => [{ lean: -1, c: 1, eyes: 'open', mouth: true, staff: [20, 59, 22, 10], lan: [44, 30, 1], fh: [42, 34, { fist: true }], bh: [46, 32, { fist: true }], over: bub(52, 26, 2) },
    { lean: -2, c: 1, hood: 0.5, eyes: 'blaze', mouth: true, staff: [20, 59, 22, 10], lan: [44, 28, 2], fh: [42, 32, { fist: true }], bh: [46, 30, { fist: true }], over: bub(53, 24, 4) },
    { lean: -3, c: 0, hood: 1, eyes: 'blaze', mouth: true, hair: 2, staff: [20, 59, 22, 10], lan: [44, 27, 2], fh: [42, 31, { fist: true }], bh: [46, 29, { fist: true }], over: bub(54, 22, 6) }][i]],
  ['trap', 2, i => [{ dx: 2, lean: 4, c: 2, hdx: 2, eyes: 'open', mouth: true, staff: [20, 59, 22, 10], lan: [50, 30, 1], fh: [48, 32, { fist: true }], bh: [52, 30, { fd: 1 }], over: bub(60, 26, 6) },
    { dx: 3, lean: 5, c: 3, hdx: 2, hdy: 1, eyes: 'open', mouth: true, staff: [20, 59, 22, 10], lan: [50, 32, 1], fh: [48, 34, { fist: true }], bh: [54, 34, { fd: 1 }] }][i]],
);
/* (claude/underleaf4art) WHEN A POTION BREAKS HER GUARD: P1 SINGED (the hedge burning off her: hands up over her face, reeling back, smoke off the shawl), P2 SNARED (the vine's grip: coiled round her legs and waist,
   hauled down, hunched, one arm flung out), and P2's ALOFT (hanging calm on her bubbles: the hem lifted, feet dangling, the lantern held high), so the flailing floated set is the lifted-out-of-the-fire pose only */
const smoke = k => P => { const g = ['#3a3632', '#6a645a', '#9a9488']; for (let q = 0; q < 6; q++) { const x = 16 + q * 5 + ((q * (k + 1)) % 3), y = 38 - q * 3 - k * 2; P.put(x, y, g[q % 3]); P.put(x + 1, y, g[(q + 1) % 3]); P.put(x, y + 1, g[0]); }
  for (const [x, y] of [[16, 44], [30, 41], [40, 47], [24, 36]]) P.put(x + k, y - k * 2, k % 2 ? '#ffd36b' : '#ff9a5c'); for (const [x, y] of [[20, 46], [34, 50], [26, 52]]) P.put(x, y, '#1a1410'); };
const coil = k => P => { const J = JC.green; for (const [y0, w] of [[57, 22], [51, 20], [45, 17], [39, 14]]) { const a = (y0 + k) % 3; P.line(13, y0 + a % 2, 13 + w, y0 - 2 + (a >> 1), J[1], 2); P.line(13, y0 + 1, 13 + w, y0 - 1, J[0], 1); P.put(14 + ((y0 * 3) % 11), y0 - 2, '#e8dcc0'); P.put(22 + ((y0 * 5 + k) % 9), y0 + 1, J[2]); P.put(26 + ((y0 + k) % 6), y0 - 3, '#e8dcc0'); }
  for (let y = 56; y > 30; y -= 6) { P.put(10 + (y % 5), y, J[2]); P.put(11 + (y % 5), y + 1, J[1]); } };
DEF.push(
  ['singed', 3, i => [{ lean: -6, c: 3, hdx: -3, hdy: 0, hood: 1, eyes: 'closed', mouth: true, hair: 3, tipSwing: 3, staff: [40, 59, 56, 14], lan: [58, 19, 1], fh: [33, 32, { fist: true }], bh: [29, 34, { fist: true }], step: [-3, 2], over: smoke(0) },
    { lean: -7, c: 4, hdx: -4, hdy: 1, hood: 1, eyes: 'closed', mouth: true, hair: 3, tipSwing: 2, staff: [38, 59, 55, 13], lan: [57, 18, 1], fh: [32, 34, { fist: true }], bh: [28, 36, { fist: true }], step: [-4, 3], over: smoke(1) },
    { lean: -5, c: 4, hdx: -2, hdy: 2, hood: 0, eyes: 'one', mouth: true, hair: 2, tipSwing: 1, staff: [40, 59, 54, 14], lan: [56, 19, 1], fh: [36, 36, { fist: true }], bh: [30, 38, { fist: true }], step: [-2, 2], over: smoke(2) }][i]],
  ['snared', 3, i => [{ lean: 2, c: 6, hdx: 1, hdy: 4, hood: 0, eyes: 'blaze', mouth: true, hair: -1, staff: [6, 58, 34, 55], lan: [37, 53, 0], fh: [46, 40, { fd: 1, up: -1 }], bh: [8, 44, { fd: -1 }], hemDy: 1, step: [-1, 2], over: coil(0) },
    { lean: 3, c: 7, hdx: 1, hdy: 5, hood: 0, eyes: 'closed', mouth: true, hair: 1, staff: [6, 58, 34, 55], lan: [37, 53, 0], fh: [48, 44, { fd: 1 }], bh: [6, 40, { fd: -1, up: -1 }], hemDy: 1, step: [-2, 1], over: coil(1) },
    { lean: 2, c: 7, hdx: 2, hdy: 5, hood: 0, eyes: 'blaze', mouth: true, hair: -2, staff: [6, 58, 34, 55], lan: [37, 53, 0], fh: [44, 38, { fd: 1, up: -2 }], bh: [10, 46, { fd: -1 }], hemDy: 1, step: [-1, 1], over: coil(2) }][i]],
  ['aloft', 4, i => ({ c: -5, lean: [-1, 0, 1, 0][i], hdx: 0, hdy: [-1, -2, -1, 0][i], hood: 0, eyes: 'open', mouth: false, hair: [2, 3, 2, 1][i], tipSwing: [2, 3, 1, 0][i], spread: [3, 4, 3, 2][i], hemDy: -3, step: [[-1, 3], [1, 4], [-2, 3], [0, 4]][i], lift: [[3, 0], [4, 0], [3, 1], [4, 0]][i],
    staff: [20, 59 - i % 2, 22, 10], lan: [26, 15 - (i % 2), 2], fh: [[24, 20, { fist: true }], [24, 19, { fist: true }], [24, 20, { fist: true }], [24, 21, { fist: true }]][i], bh: [[12, 40, { fd: -1 }], [10, 38, { fd: -1, up: -1 }], [12, 40, { fd: -1 }], [14, 41, { fd: -1 }]][i],
    over: P => { for (let k = 0; k < 3; k++) P.put(14 + k * 12 + (i % 2) * 3, 56 + ((k + i) % 2), '#a8d8ff'); } })],
);
export const F = {}, N = {}; const ORDER = []; for (const [name, n] of DEF) { F[name] = ORDER.length; N[name] = n; for (let i = 0; i < n; i++) ORDER.push([name, i]); }

/* the heap: a pile of shawl on the floor, the hood fallen, the staff broken beside her, the lantern out */
function heap(P, fl, fi) {
  P.ell(27, 54, 22, 6, (nx, ny) => shade(C.sh, nx, ny - 0.3)); P.ell(22, 49, 11, 6, (nx, ny) => shade(C.sh, nx, ny)); P.ell(40, 52, 9, 6, (nx, ny) => shade(C.hood, nx, ny - 0.2));
  P.line(6, 58, 20, 55, C.wood[2], 2); P.line(44, 58, 52, 53, C.wood[2], 2); P.rect(48, 54, 4, 4, C.iron); P.put(49, 56, '#4a5a28'); P.rect(36, 53, 5, 2, C.skin[1]); P.put(38, 52, C.hair); P.line(32, 50, 28, 56, C.hair); P.rect(16, 52, 3, 3, C.patchA);
  P.line(33, 52, 38, 51, C.skin[2], 2); P.put(39, 51, C.skin[3]);   /* one long hand, open on the floor */
  for (const [x, y] of [[20, 57], [27, 58], [34, 57]]) P.rect(x, y, 3, 2, C.sh[0]); LANTERN[fi] = [50, 56];
}
function pose(name, i, fl, fi) {
  const P = painter();
  if (name === 'dead' && i === 3) heap(P, fl, fi); else { const def = DEF.find(d => d[0] === name); body(P, def[2](i), fl, fi); }
  outline(P.c, OUT); return P.c;
}
const bakeSet = ph => { const fl = FLAME[ph], sw = SHAWL[ph] || SHAWL0; C.sh = sw.sh; C.hood = sw.hood; const fr = ORDER.map(([n, i], fi) => pose(n, i, fl, fi)); C.sh = SHAWL0.sh; C.hood = SHAWL0.hood;
  if (ph === 2) fr.forEach((c, i) => { if (i === F.dead + 3) return; const g = c.getContext('2d'); for (let k = 0; k < 6; k++) { const x = 14 + ((k * 7 + i * 3) % 26), y = 34 + ((k * 5) % 22); g.fillStyle = k % 2 ? '#a8d8ff' : '#4a8fd8'; g.fillRect(x, y, 1, 1); if (k % 3 === 0) { g.fillStyle = '#ffffff'; g.fillRect(x + 1, y - 1, 1, 1); } } });   /* P2: bubble motes caught in the shawl */
  if (ph === 1) fr.forEach((c, i) => { if (i === F.dead + 3) return; const g = c.getContext('2d'); for (let k = 0; k < 7; k++) { g.fillStyle = k % 2 ? '#ff9a5c' : '#d8502a'; g.fillRect(14 + ((k * 7 + i * 3) % 26), 34 + ((k * 5) % 22), 1, 1); } });   /* phase two: embers on the shawl */
  return { R: fr, L: fr.map(c => flipX(c)), white: { R: fr.map(c => whiten(c)), L: fr.map(c => flipX(whiten(c))) }, ax: AX, ay: AY, w: 20, h: 40 }; };
export function bakeSets() { const p1 = bakeSet(0), p2 = bakeSet(1), pb = bakeSet(2), pick = (s, ids) => { const fr = ids.map(i => s.R[i]); return { R: fr, L: fr.map(c => flipX(c)), white: { R: fr.map(c => whiten(c)), L: fr.map(c => flipX(whiten(c))) }, ax: AX, ay: AY, w: 20, h: 40 }; };
  return { p1, p2, pb, card: pick(p1, [F.walk, F.walk + 2]) }; }   /* p1 green (P1), p2 red/scorched (P3: SPR.grandmother2), pb blue (P2: SPR.grandmother3) */

/* THE FRAME FOR WHAT SHE IS DOING: each move walks its own frames over its own length (DUR is potion-hands.js GM's, kept here so this module needs nothing of it).
   A flinch shows over a quiet moment only - never over a windup, which is the tell. */
const DUR = { lashTell: 0.7, lash: 0.4, trapTell: 0.8, trap: 0.45, staffTell: 0.55, staff: 0.32, fireballTell: 0.85, cast: 0.5, jarTell: 0.6, hurled: 0.45, broodTell: 1.0, kick: 1.2, stirTell: 1.0, stir: 0.6, wake: 1.6 };
const along = (base, e, key) => { const n = N[base], p = Math.max(0, Math.min(0.999, 1 - Math.max(0, e.modeT) / (DUR[key || base] || 1))); return F[base] + Math.floor(p * n); };
export function frameOf(e) {
  const m = e.mode, an = e.anim || 0;
  if (m === 'sleep') return F.sleep + [0, 1, 2, 1][Math.floor(an * 1.6) % 4];
  if (m === 'wake') return along('wake', e);
  if (m === 'floated') return F.floated + (Math.floor(an * 8) % 4);
  if (m === 'lashTell') return along('lashTell', e); if (m === 'lash') return along('lash', e);   /* (claude/underleaf4) THE POTION MASTER's new moves */
  if (m === 'trapTell') return along('trapTell', e); if (m === 'trap') return along('trap', e);
  if (m === 'opened') return e.phase === 1 ? F.singed + (Math.floor(an * 5) % 3) : F.snared + (Math.floor(an * 4) % 3);   /* (claude/underleaf4art) her hedge burning off her / the vine's grip: her own staggers */
  if (m === 'reform') return F.ward + (Math.floor(an * 5) % 3);
  if (e.aloft && (m === 'walk' || m === 'kick')) return F.aloft + (Math.floor(an * 3) % 4);   /* aloft on her bubbles: calm, the hem lifted */
  if (m === 'staffTell') return along('staffTell', e); if (m === 'staff') return along('staff', e);
  if (m === 'fireballTell') return along('fireballTell', e); if (m === 'cast') return along('cast', e);
  if (m === 'jarTell') return along(e.hurlCol === 'green' ? 'jarTellG' : 'jarTellR', e, 'jarTell'); if (m === 'hurled') return along(e.hurlCol === 'green' ? 'hurledG' : 'hurledR', e, 'hurled');
  if (m === 'broodTell') return along('broodTell', e); if (m === 'kick') return along('kick', e);
  if (m === 'stirTell') return along('stirTell', e); if (m === 'stir') return along('stir', e);
  if (e.flash > 0.06) e._hurtAt = an;   /* a blow that lands: she flinches for a moment (the white flash is drawn over it) */
  if (e._hurtAt !== undefined && an - e._hurtAt < 0.26 && an >= e._hurtAt) return F.hurt + Math.min(2, Math.floor((an - e._hurtAt) / 0.09));
  const moving = Math.abs(e.vx || 0) > 5;
  if ((e.ward > 0 || e.wasBrood) && !moving) return F.ward + (Math.floor(an * 5) % 3);   /* hunched behind the glow of her brood, trembling */
  if (moving) return F.walk + (Math.floor(an * 7) % 4);
  return F.idle + (Math.floor(an * 3.2) % 4);
}
/* her death, as the body that is left (main.js bossBodies, k = 0..1 of its life): the clutch, the kneel, the slump, the heap */
export function deathFrame(k) { return F.dead + (k < 0.2 ? 0 : k < 0.42 ? 1 : k < 0.62 ? 2 : 3); }
export function bakeIcon() { return bakeSets().card; }
