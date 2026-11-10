// src/redraw/headmistress_art.js - THE HEADMISTRESS (claude/academyart, the art pass over claude/academy's greybox; ACADEMY_SHIPS stays false).
// A severe grey-bunned schoolmistress in an academic gown the colour of old ink, a gold-tasselled mortarboard, round spectacles, a lace collar; chalk in one hand, a brass-tipped ruler in the
// other. Side view, feet at (ex, ey), facing `f`. Rect-based (px.js; no paths, no rotate): it runs in tools/node-canvas.mjs too.
// The POSE table (src/headmistress-hands.js) places the two hands (chalk [x, y], ruler [x, y] + its angle), the lean and the mouth; this file wears it, and gives EVERY mode its own read:
//   sleep (slumped over the closed register)   wake (head up, eyes open, PENS DOWN sparks)   lecture (speech-dashes, chalk by her side)
//   chalkTell (chalk raised, a red hazard ring)   chalk (the arm flung down, a dotted fall + dust)   rulerTell (ruler cocked high behind, glint)   ruler (a swat: three afterimages)
//   boltTell (chalk charging, a gold core)   bolt (arm thrust out, a muzzle star)   aboutTell (her head back, a gold eye opens on the bun)   about (the gown whirls round)
//   dispelTell (the palm up, a red rune ring)   dispel (the palm open: gold rays)   crumbleTell (the red stamp raised, a crack under her hem)   callTell (both arms up, three lesson orbs)
//   glide (leaning, streaks)   stagger (CORRECT: the cap flies, spectacles askew, stars, eyes crossed)   recover (straightening her spectacles, a sweat drop)   bell (a brass hand-bell, ringing)
//   dead (SHE CLOSES THE REGISTER: seated, the cap over her eyes, the book shut, three pale lights going up)
// Her lesson colours the stole and the air round her: 1 LEVITATION sky-blue (she hovers on a halo of paper), 2 BLINK violet (a ward-glyph beside her), 3 CONJURE STEP gold (a floating desk under her),
// 4 the finale (all three, turning). o.flash = the hit flash (white); o.alpha fades her.
import { px, rect, line, circle } from '../px.js';
import { AA } from './academy_art.js';

const R = Math.round;
const al = (hexc, k) => { const h = hexc.slice(1); return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + k.toFixed(2) + ')'; };
const C0 = { robe: '#3a2a5a', robeMid: '#52408a', robeHi: '#7a62b8', robeLo: '#241a3c', trim: '#d8a840', trimHi: '#fff0a0', trimLo: '#8a6420', lace: '#efe6d2', laceLo: '#b8aa90',
  skin: '#e8d8c8', skinLo: '#b8a090', hair: '#c8c4d4', hairLo: '#8a869c', cap: '#1a1428', capHi: '#3a2c58', lens: '#bfe4ff', glass: '#ffffff', shoe: '#1a1428',
  chalk: '#ffffff', ruler: '#c8a060', rulerHi: '#fff0a0', rulerLo: '#6a4a20', red: '#ff4a2a', mouth: '#2a0a0a', book: '#6a2a3a', bookHi: '#a04a5a', page: '#efe6d2' };
const FLASH = Object.fromEntries(Object.keys(C0).map(k => [k, '#ffffff']));
const LESSON_COL = { 1: AA.spell.levitate, 2: AA.spell.blink, 3: AA.spell.conjure };

export function drawHeadmistress(g, ex, ey, mode, pose, face, time, o = {}) {
  const P = pose || {}, f = face || 1, K = o.flash ? FLASH : C0, ls = o.lesson || 1, lc = ls === 4 ? [AA.spell.levitate, AA.spell.blink, AA.spell.conjure][((time * 2) | 0) % 3] : (LESSON_COL[ls] || AA.spell.levitate);
  ex = R(ex); ey = R(ey); const lean = P.lean || 0, dead = mode === 'dead', sleep = mode === 'sleep', stag = mode === 'stagger';
  if (o.alpha != null) g.globalAlpha = o.alpha; else if (P.dim) g.globalAlpha = 0.72;
  /* local (facing right) -> screen */
  const sh = y => R(lean * (-y) / 46 * 0.6);
  const box = (x, y, w, h, c) => { const xs = x + sh(y); rect(g, f > 0 ? ex + xs : ex - xs - w, ey + y, w, h, c); };
  const dot = (x, y, c) => { const xs = x + sh(y); px(g, ex + R(xs * f) - (f < 0 ? 0 : 0), ey + y, c); };
  const arm = (x0, y0, x1, y1, c, hi) => { line(g, ex + R((x0 + sh(y0)) * f), ey + y0, ex + R(x1 * f), ey + y1, K.robeLo, 4); line(g, ex + R((x0 + sh(y0)) * f), ey + y0, ex + R(x1 * f), ey + y1, c, 3); if (hi) line(g, ex + R((x0 + sh(y0)) * f), ey + y0 - 1, ex + R(x1 * f), ey + y1 - 1, hi); };
  const abs = (x, y, w, h, c) => rect(g, ex + R(x), ey + R(y), w, h, c);   /* screen-relative, not mirrored (fx) */
  const hy = sleep ? -22 : dead ? -18 : stag ? -37 + 1 : -37;                         /* the head's top */
  /* ---------- the halo / desk of her lesson, behind her ---------- */
  if (!dead && !sleep) {
    if (ls === 1 || ls === 4) { for (let k = 0; k < 5; k++) { const t = (time * 0.7 + k * 0.2) % 1, wx = Math.cos(time * 1.6 + k * 1.25) * (14 + k * 2); abs(wx - 2, -4 - t * 38 + 2, 4, 2, al(AA.parch, 0.7 * (1 - t))); } abs(-14, 2, 28, 1, al(AA.spell.levitate, 0.5)); abs(-9, 3, 18, 1, al(AA.spell.levitate, 0.28)); }
    if (ls === 2 || ls === 4) { const gx = f * 26; abs(gx - 3, -40, 6, 38, al(AA.spell.blink, 0.1 + 0.06 * Math.sin(time * 4))); abs(gx - 1, -40, 2, 38, al(AA.glassHi, 0.5)); for (let k = 0; k < 4; k++) abs(gx - 4, -38 + ((time * 22 + k * 10) % 36), 8, 1, al(AA.glassHi, 0.55)); }
    if (ls === 3 || ls === 4) { abs(-17, 3, 34, 3, '#6a6488'); abs(-17, 3, 34, 1, al(AA.candle, 0.9)); abs(-15, 6, 30, 1, al(AA.spell.conjure, 0.5)); abs(-13, 7, 3, 4, '#4a4658'); abs(10, 7, 3, 4, '#4a4658'); abs(-5, 1, 10, 2, C0.page); abs(-4, 2, 8, 1, C0.laceLo); for (let k = 0; k < 3; k++) { const t = (time * 1.1 + k * 0.33) % 1; abs(-8 + k * 8, 9 + t * 6, 1, 1, al(AA.candle, 1 - t)); } }
  }
  /* ---------- the gown ---------- */
  if (!dead && !sleep) {
    const flare = mode === 'about' ? 5 : mode === 'glide' ? 2 : 0;
    for (let yy = -26; yy <= -1; yy++) { const half = 6 + R((yy + 26) * 0.2) + (yy > -10 ? flare : 0), x0 = -half;
      box(x0, yy, half * 2, 1, K.robe); box(x0, yy, 2, 1, K.robeMid); box(x0 + 2, yy, 1, 1, K.robeHi); box(half - 3, yy, 3, 1, K.robeLo); if (yy % 6 === 0) box(-1, yy, 2, 1, K.robeLo); }
    box(-11 - flare, -2, 22 + flare * 2, 2, K.trim); box(-11 - flare, -2, 22 + flare * 2, 1, K.trimHi); box(-11 - flare, -1, 22 + flare * 2, 1, K.trimLo);
    box(1, -26, 3, 23, lc); box(1, -26, 1, 23, al('#ffffff', 0.55)); box(3, -26, 1, 23, K.robeLo);   /* the stole in the lesson's colour */
    if (flare) { dot(-10 - flare, -4, K.robeMid); dot(10 + flare, -6, K.robeMid); }
    box(-4, -27, 9, 2, K.lace); box(-4, -26, 9, 1, K.laceLo); for (let k = -4; k < 5; k += 2) dot(k, -25, K.laceLo);   /* the lace collar */
    box(-6, -1, 5, 2, K.shoe); box(2, -1, 5, 2, K.shoe);
  }
  if (sleep) {   /* SLUMPED: the gown a heap, the head down on the closed register */
    for (let yy = -14; yy <= -1; yy++) { const half = 8 + R((yy + 14) * 0.25); box(-half, yy, half * 2, 1, K.robe); box(-half, yy, 2, 1, K.robeMid); box(half - 3, yy, 3, 1, K.robeLo); }
    box(-11, -2, 22, 2, K.trim); box(-11, -2, 22, 1, K.trimHi);
    box(2, -16, 14, 3, K.book); box(2, -16, 14, 1, K.bookHi); box(4, -14, 11, 1, K.page); box(2, -13, 14, 1, K.trimLo);   /* the closed register */
    box(-5, -17, 9, 2, K.lace);
  }
  if (dead) {   /* SEATED, SPENT */
    for (let yy = -12; yy <= -1; yy++) { const half = 9 + R((yy + 12) * 0.2); box(-half, yy, half * 2, 1, K.robe); box(-half, yy, 2, 1, K.robeMid); box(half - 3, yy, 3, 1, K.robeLo); }
    box(-12, -2, 24, 2, K.trim); box(-12, -2, 24, 1, K.trimHi);
    box(4, -14, 12, 4, K.book); box(4, -14, 12, 1, K.bookHi); box(6, -11, 9, 1, K.page); box(4, -10, 12, 1, K.trimLo); box(8, -14, 1, 4, K.trimLo);   /* the register, SHUT, on her knees */
    box(-5, -15, 9, 2, K.lace);
  }
  /* ---------- the head ---------- */
  const hx = (stag ? -2 : 0) + (dead ? 3 : sleep ? 5 : 0);
  box(hx - 4, hy + 1, 8, 8, K.skin); box(hx - 4, hy + 7, 8, 2, K.skinLo); box(hx + 4, hy + 4, 1, 2, K.skin); box(hx - 4, hy + 1, 1, 8, K.skinLo);   /* face, the jaw, the nose */
  box(hx - 7, hy - 1, 5, 7, K.hair); box(hx - 8, hy + 1, 3, 4, K.hairLo); box(hx - 5, hy + 3, 3, 2, K.hair);      /* the bun */
  box(hx - 4, hy, 8, 2, K.hair); box(hx - 4, hy, 8, 1, '#e0dcec');                                                  /* swept-back hair */
  if (mode === 'aboutTell') { box(hx - 6, hy + 2, 2, 2, AA.brassHi); box(hx - 6, hy + 3, 1, 1, '#ff4a2a'); }       /* a gold eye opens on the BACK of her head */
  if (!sleep && !dead) {
    const ey0 = hy + 4; const turned = mode === 'aboutTell';
    if (stag) { dot(hx + 0, ey0, '#2a0a0a'); dot(hx + 2, ey0 + 1, '#2a0a0a'); dot(hx + 1, ey0, '#2a0a0a'); dot(hx + 1, ey0 + 1, '#2a0a0a'); box(hx - 1, ey0 - 1, 3, 3, K.lens); box(hx + 2, ey0 + 1, 3, 3, K.lens); box(hx - 1, ey0 + 1, 1, 1, K.glass); }   /* crossed eyes, askew spectacles */
    else { box(hx - 1, ey0, 3, 3, K.lens); box(hx + 2, ey0, 3, 3, K.lens); box(hx + 1, ey0 + 1, 1, 1, K.trimLo); box(hx - 1, ey0, 1, 1, K.glass); box(hx + 2, ey0, 1, 1, K.glass); box(hx - 1, ey0 + 3, 3, 1, K.trimLo); box(hx + 2, ey0 + 3, 3, 1, K.trimLo);
      box(hx, ey0 + 1, 1, 1, K.cap); box(hx + 3, ey0 + 1, 1, 1, K.cap); if (turned) box(hx - 3, ey0 + 1, 2, 1, K.cap); }
    box(hx - 1, ey0 - 2, 3, 1, K.hairLo); box(hx + 2, ey0 - 2, 3, 1, K.hairLo);                                       /* stern brows */
    if (P.mouth === 'open') box(hx + 2, hy + 8, 2, 1, K.mouth); else if (P.mouth === 'wide') { box(hx + 1, hy + 7, 4, 3, K.mouth); box(hx + 1, hy + 7, 4, 1, K.lace); } else box(hx + 1, hy + 8, 3, 1, K.skinLo);
  } else { box(hx, hy + 5, 4, 1, K.cap); box(hx + 1, hy + 4, 1, 1, K.skinLo); if (!dead) { abs(f * 8 + 4, hy - 8 - ((time * 6) % 6), 3, 1, al('#9fd8ff', 0.8)); abs(f * 11 + 4, hy - 12 - ((time * 6 + 2) % 6), 2, 1, al('#9fd8ff', 0.6)); } }   /* eyes shut; Zz */
  /* ---------- the mortarboard ---------- */
  if (!stag) { const cy0 = dead ? hy + 4 : hy - 4, tilt = dead ? 2 : 0;
    box(hx - 7, cy0, 14, 2, K.cap); box(hx - 7, cy0, 14, 1, K.capHi); box(hx - 4, cy0 + 2, 8, 3, K.cap); box(hx - 4, cy0 + 2, 8, 1, K.capHi);
    box(hx + 6 + tilt, cy0 + 1, 1, 6, K.trim); box(hx + 5 + tilt, cy0 + 6, 3, 3, K.trimHi); box(hx + 5 + tilt, cy0 + 8, 3, 1, K.trimLo);   /* the tassel */
    box(hx - 1, cy0 - 1, 2, 1, K.trim); }
  else { box(-20, -52, 14, 2, K.cap); box(-20, -52, 14, 1, K.capHi); box(-17, -50, 8, 2, K.cap); box(-14, -45, 1, 5, K.trim); }   /* the cap flies off */
  /* ---------- the arms and what they hold ---------- */
  const sx = -2, sy = -25;
  if (!dead && !sleep) {
    const c = P.chalk || [10, -20], r = P.ruler || [-6, -14], ang = P.ang == null ? 1.2 : P.ang;
    arm(5, sy, c[0], c[1], K.robe, K.robeMid); box(c[0] - 1, c[1] - 1, 3, 3, K.lace); box(c[0], c[1], 2, 2, K.skin);                                         /* the chalk arm + hand */
    box(c[0], c[1] - 5, 2, 5, K.chalk); box(c[0], c[1] - 5, 1, 2, '#e8f0ff');                                                                          /* the chalk */
    arm(sx, sy, r[0], r[1], K.robeMid, K.robeHi); box(r[0] - 1, r[1] - 1, 3, 3, K.lace); box(r[0], r[1], 2, 2, K.skin);                                       /* the ruler arm + hand */
    const ca = Math.cos(ang), sa = Math.sin(ang); for (let k = 0; k < 20; k += 1) { const lx = r[0] + ca * k, ly = r[1] + sa * k; const x2 = ex + R((lx + sh(ly)) * f), y2 = ey + R(ly); rect(g, x2, y2, 2, 2, k > 17 ? K.trimHi : k % 5 === 0 ? K.rulerLo : k % 2 ? K.ruler : K.rulerHi); }   /* the ruler, ticked */
  }
  if (dead || sleep) { arm(5, dead ? -13 : -12, 9, dead ? -12 : -12, K.robe, K.robeMid); box(9, dead ? -13 : -12, 2, 2, K.skin); }
  /* ---------- the mode's own signs ---------- */
  const blink8 = ((time * 8) | 0) % 2 === 0;
  if (P.chalkUp) { const c = P.chalk, cx0 = ex + R(c[0] * f); const t = 0.5 + 0.5 * Math.sin(time * 14); rect(g, cx0 - 9, ey + c[1] - 14, 18, 1, blink8 ? K.red : '#ffffff'); rect(g, cx0 - 9, ey + c[1] - 4, 18, 1, blink8 ? K.red : '#ffffff'); rect(g, cx0 - 9, ey + c[1] - 14, 1, 11, K.red); rect(g, cx0 + 8, ey + c[1] - 14, 1, 11, K.red); rect(g, cx0 - 4, ey + c[1] - 10, 9, 1, al(K.red, 0.4 + 0.5 * t)); rect(g, cx0, ey + c[1] - 13, 1, 9, al(K.red, 0.4 + 0.5 * t)); }
  if (P.glow) { const c = P.chalk, cx0 = ex + R(c[0] * f); rect(g, cx0 - 5, ey + c[1] - 9, 11, 11, al(AA.candleHi, 0.2 + 0.25 * Math.sin(time * 18) ** 2)); rect(g, cx0 - 1, ey + c[1] - 7, 3, 3, K.candleHi || '#fff6c8'); for (let k = 0; k < 4; k++) px(g, cx0 + R(Math.cos(time * 9 + k * 1.57) * 6), ey + c[1] - 5 + R(Math.sin(time * 9 + k * 1.57) * 6), '#fff6c8'); }
  if (P.palm) { const c = P.chalk, cx0 = ex + R(c[0] * f), cy0 = ey + c[1]; circle(g, cx0 + f, cy0 - 3, 5, K.skin); circle(g, cx0 + f, cy0 - 3, 3.5, blink8 ? al(K.red, 0.9) : al(AA.candle, 0.9)); rect(g, cx0 + f - 1, cy0 - 6, 2, 6, '#ffffff'); rect(g, cx0 + f - 3, cy0 - 4, 6, 2, '#ffffff'); }
  if (P.stamp) { const sx0 = ex + R(f * 2); rect(g, sx0 - 8, ey - 51, 16, 4, K.red); rect(g, sx0 - 8, ey - 51, 16, 1, '#ff9a8a'); rect(g, sx0 - 1, ey - 58, 3, 7, K.cap); rect(g, sx0 - 3, ey - 60, 7, 3, K.capHi); rect(g, sx0 - 6, ey - 49, 12, 1, '#7a1010'); }
  /* the modes that need more than a pose */
  switch (mode) {
    case 'wake': for (let k = 0; k < 5; k++) { const a = -0.4 - k * 0.55; px(g, ex + R(Math.cos(a) * 20 * f) - (f < 0 ? 0 : 0), ey - 36 + R(Math.sin(a) * 16), '#fff6c8'); } break;
    case 'lecture': for (let k = 0; k < 3; k++) { const t = (time * 1.5 + k * 0.33) % 1; abs(f * (8 + t * 20) - 2, -33 - k * 2 - t * 4, 4, 1, al(AA.parch, 0.8 * (1 - t))); } break;
    case 'chalk': { const c = P.chalk; for (let k = 1; k <= 5; k++) abs(f * c[0] + (f > 0 ? 0 : -1), c[1] + k * 4, 1, 2, al('#ffffff', 0.9 - k * 0.15)); abs(f * c[0] - 3, 0, 7, 1, al('#ffffff', 0.5)); break; }
    case 'rulerTell': { const r = P.ruler, ca = Math.cos(P.ang), sa = Math.sin(P.ang); abs(f * (r[0] + ca * 19) - 1, r[1] + sa * 19 - 1, 3, 3, ((time * 14) | 0) % 2 ? '#ffffff' : '#fff0a0'); break; }
    case 'ruler': { const r = P.ruler; for (let k = 1; k <= 3; k++) { for (let m = 6; m < 20; m += 3) abs(f * (r[0] - k * 4 + m) , r[1] + 6 - k * 5 + (m >> 2) - 3 * (k - 2), 2, 1, al('#fff0a0', 0.5 - k * 0.12)); } break; }
    case 'bolt': { const c = P.chalk, x1 = f * (c[0] + 4), y1 = c[1] - 5; abs(x1 - 1, y1 - 3, 3, 7, '#fff6c8'); abs(x1 - 3, y1, 7, 1, '#fff6c8'); abs(x1 - 1, y1 - 1, 3, 3, '#ffffff'); break; }
    case 'dispel': { const c = P.chalk, cx0 = f * c[0] + f, cy0 = c[1] - 3; for (let k = 0; k < 8; k++) { const a = k * 0.785 + time * 3; abs(cx0 + Math.cos(a) * 10, cy0 + Math.sin(a) * 10, 2, 2, AA.candleHi); abs(cx0 + Math.cos(a) * 14, cy0 + Math.sin(a) * 14, 1, 1, al(AA.candle, 0.8)); } break; }
    case 'dispelTell': { const c = P.chalk, cx0 = f * c[0] + f, cy0 = c[1] - 3; for (let k = 0; k < 6; k++) { const a = k * 1.047 - time * 4; abs(cx0 + Math.cos(a) * 9, cy0 + Math.sin(a) * 9, 1, 1, blink8 ? AA.candleHi : '#ff4a2a'); } break; }
    case 'crumbleTell': { for (const [x, y, w] of [[-8, 2, 6], [-3, 3, 3], [0, 2, 6], [5, 3, 4], [8, 2, 4]]) abs(x + (x > 0 ? 2 : 0), y, w, 1, blink8 ? K.red : '#ffffff'); abs(-2, 4, 1, 3, '#ff4a2a'); abs(3, 4, 1, 4, '#ff4a2a'); break; }
    case 'callTell': { for (const [c, i] of [[P.chalk, 0], [P.ruler, 2]]) { const x0 = f * c[0], y0 = c[1] - 8; const oc = [AA.spell.levitate, AA.spell.blink, AA.spell.conjure][i ? 1 : 0]; circle(g, ex + x0, ey + y0, 3, oc); circle(g, ex + x0, ey + y0, 5, al(oc, 0.3)); }
      circle(g, ex, ey - 60, 3, AA.spell.conjure); for (let k = 0; k < 6; k++) { const a = -1.9 + k * 0.45; abs(Math.cos(a) * 22, -38 + Math.sin(a) * 22, 1, 3, al('#ffffff', 0.5)); } break; }
    case 'glide': for (let k = 0; k < 3; k++) abs(-f * (14 + k * 6) - (f < 0 ? 8 : 0), -30 + k * 9, 9, 1, al('#ffffff', 0.55 - k * 0.12)); break;
    case 'stagger': for (let k = 0; k < 3; k++) { const a = time * 6 + k * 2.09; abs(Math.cos(a) * 11 - 1, hy - 5 + Math.sin(a) * 3, 3, 1, '#ffd36b'); abs(Math.cos(a) * 11, hy - 6 + Math.sin(a) * 3, 1, 3, '#ffd36b'); } abs(-10, hy + 7, 20, 1, al('#ffd36b', 0.25 + 0.15 * Math.sin(time * 10))); break;
    case 'recover': abs(f * 6 + 2, hy + 6 + ((time * 8) % 5), 1, 2, '#9fd8ff'); break;
    case 'bell': { const c = P.chalk, bx = f * c[0], by = c[1] - 6; abs(bx - 3, by - 4, 7, 5, AA.brass); abs(bx - 3, by - 4, 7, 1, AA.brassHi); abs(bx - 4, by + 1, 9, 2, AA.brassLo); abs(bx, by + 3, 1, 2, '#ffffff');
      for (const d of [-1, 1]) for (let k = 1; k < 3; k++) abs(bx + d * (6 + k * 4), by - 3 + k, 1, 4 - k, al('#ffffff', 0.8 - k * 0.25)); break; }
    case 'aboutTell': abs(f * 4, hy + 4, 1, 1, '#ffd36b'); break;
    default: break;
  }
  if (dead) { for (let k = 0; k < 3; k++) { const t = (time * 0.6 + k * 0.33) % 1; abs(-8 + k * 8 + Math.sin(time * 2 + k) * 2, -22 - t * 32, 2, 2, al(k === 0 ? AA.spell.levitate : k === 1 ? AA.spell.blink : AA.spell.conjure, 0.9 * (1 - t))); } }
  g.globalAlpha = 1;
}

/* the lesson-lit chalk sigil, chalk bolt, shield book and the stage-of-floor tell, for the hands' drawOver */
export function drawSigil(g, x, floorY, w, falling, k, time) {
  x = R(x);
  if (!falling) { const b = ((time * 10) | 0) % 2; rect(g, x - w, floorY - 2, w * 2, 2, b ? '#ff4a2a' : '#ffffff'); rect(g, x - w + 2, floorY - 4, w * 2 - 4, 1, al(b ? '#ff4a2a' : '#ffffff', 0.5)); for (let q = -w + 2; q < w - 1; q += 4) px(g, x + q, floorY - 3, '#ffffff'); return; }
  const yy = R(k); rect(g, x - 5, yy - 8, 10, 8, '#ffffff'); rect(g, x - 4, yy - 7, 8, 6, '#dfe6ff'); rect(g, x - 1, yy - 7, 2, 6, '#ffffff'); px(g, x - 3, yy - 5, '#9fb0e0'); px(g, x + 2, yy - 3, '#9fb0e0');
  rect(g, x - 1, yy - 20, 1, 12, al('#ffffff', 0.45)); rect(g, x + 1, yy - 15, 1, 7, al('#ffffff', 0.3));
}
export function drawBolt(g, x, y, dir, time) {
  x = R(x); y = R(y); rect(g, x - 6, y - 3, 12, 6, al('#fff6c8', 0.35)); rect(g, x - 5, y - 2, 10, 4, '#fff6c8'); rect(g, x - 3, y - 1, 6, 2, '#ffffff'); rect(g, x + 5 * dir, y - 1, 2, 2, '#ffffff');
  for (let k = 1; k <= 4; k++) rect(g, x - dir * (6 + k * 4) - (dir > 0 ? 0 : 3), y - 1 + (k & 1), 3, 1, al('#fff6c8', 0.6 - k * 0.12));
}
/* a SHIELD BOOK of hers: a closed tome ringed with a chalk-white ward */
export function drawShieldBook(g, x, y, time, i = 0) {
  x = R(x); y = R(y); rect(g, x - 8, y - 6, 16, 12, al(AA.glassHi, 0.12 + 0.06 * Math.sin(time * 5 + i)));
  rect(g, x - 6, y - 4, 12, 8, AA.books[(i * 3 + 1) % 8]); rect(g, x - 6, y - 4, 12, 1, al('#ffffff', 0.35)); rect(g, x - 6, y + 3, 12, 1, al('#000000', 0.4)); rect(g, x + 4, y - 3, 2, 6, C0.page); rect(g, x - 3, y - 4, 1, 8, AA.brass); rect(g, x + 0, y - 2, 3, 3, AA.brass); px(g, x + 1, y - 2, AA.brassHi);
}
