// src/redraw/church3_foes_art.js - THE ORDER PALADIN / THE UNDEAD PALADIN and THE UNDEAD PRIEST, GREYBOX (claude/church3). Every frame is its own pose (B16: each move
// its own windup + release); the art lane (claude/church3art) redraws all of this as a proper sheet - see the lane report's ART LIST. Shapes only: a body, a head,
// the arms, the shield / the mace / the censer, a few lit pixels. Frames are in src/order-paladin.js FRAMES / src/undead-priest.js FRAMES order.
import { outline, flipX, whiten } from '../px.js';
const W = 34, H = 40, AX = 17, AY = 36;
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const PAL = {
  orderpaladin: { body: '#c9d1dc', dark: '#7a8494', tabard: '#3a5a8a', trim: '#e0b040', skin: '#e0b090', shield: '#d8dce4', boss: '#ffd36b', eye: '#1b1626' },
  deadpaladin: { body: '#8a9088', dark: '#4a4e48', tabard: '#3a3448', trim: '#8a7a40', skin: '#b8c0a8', shield: '#9aa0a0', boss: '#9ab0e0', eye: '#9ff0ff' },
  deadpriest: { body: '#4a3a52', dark: '#2a2030', tabard: '#7a6a4a', trim: '#a8a070', skin: '#c8ccb0', shield: '#b8b8c8', boss: '#8ab8ff', eye: '#9ff0ff' },
};
const R = Math.round;
/* a figure: o = { lean, crouch, armF: [dx, dy] (front hand from the shoulder), armB, prop(g, P, hx, hy) }, drawn facing right */
function figure(g, P, o = {}) { const lean = o.lean || 0, cr = o.crouch || 0, by = AY, top = by - 24 + cr;
  const r = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(AX + x, y, w, h); };
  /* legs */ r(-4 + (o.stride || 0), by - 8, 3, 8 - (o.kneel ? 4 : 0), P.dark); r(1 - (o.stride || 0), by - 8, 3, 8, P.dark);
  /* body + tabard */ r(-5 + lean, top + 6, 10, 11 - cr, P.body); r(-3 + lean, top + 8, 6, 9 - cr, P.tabard); r(-3 + lean, top + 8, 6, 1, P.trim);
  /* head */ r(-3 + lean, top, 6, 6, o.hood ? P.dark : P.body); r(-2 + lean, top + 1, 4, 4, P.skin); r(1 + lean, top + 2, 1, 1, P.eye);
  if (o.hood) { r(-4 + lean, top - 1, 8, 2, P.body); r(-4 + lean, top, 1, 6, P.body); }
  else { r(-3 + lean, top - 1, 6, 1, P.dark); r(-1 + lean, top - 3, 2, 2, P.trim); }   /* a helm, its crest */
  const sx = lean, sy = top + 7, hx = sx + (o.armF ? o.armF[0] : 4), hy = sy + (o.armF ? o.armF[1] : 5), bx = sx + (o.armB ? o.armB[0] : -4), bby = sy + (o.armB ? o.armB[1] : 5);
  g.strokeStyle = P.dark; g.lineWidth = 2; g.beginPath(); g.moveTo(AX + sx + 3, sy); g.lineTo(AX + hx, hy); g.moveTo(AX + sx - 3, sy); g.lineTo(AX + bx, bby); g.stroke(); g.lineWidth = 1;
  if (o.prop) o.prop(g, P, AX + hx, hy, AX + bx, bby); }
const shieldAt = (g, P, x, y, lit) => { g.fillStyle = P.shield; g.fillRect(x - 3, y - 5, 6, 9); g.fillStyle = P.dark; g.fillRect(x - 3, y + 4, 6, 1); g.fillStyle = lit ? '#ffffff' : P.boss; g.fillRect(x - 1, y - 2, 2, 3); };
const maceAt = (g, P, x, y, up) => { g.strokeStyle = '#6a5a3a'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (up ? 1 : 6), y + (up ? -9 : -2)); g.stroke(); g.fillStyle = '#9aa0aa'; g.fillRect(x + (up ? 0 : 5) - 1, y + (up ? -12 : -5), 4, 4); };
const gleam = (g, x, y) => { g.fillStyle = '#ffffff'; g.fillRect(x - 4, y, 9, 1); g.fillRect(x, y - 4, 1, 9); g.fillRect(x - 2, y - 2, 1, 1); g.fillRect(x + 2, y - 2, 1, 1); g.fillRect(x - 2, y + 2, 1, 1); g.fillRect(x + 2, y + 2, 1, 1); };
/* THE PALADIN FOE's frames (src/order-paladin.js FRAMES) */
function paladinFrame(i, P) { const c = mk(), g = c.getContext('2d');
  const sh = (lit) => (gg, PP, hx, hy, bx, by) => shieldAt(gg, PP, hx + 2, hy - 2, lit);
  const both = (mUp, lit, shF) => (gg, PP, hx, hy, bx, by) => { maceAt(gg, PP, bx, by, mUp); shieldAt(gg, PP, hx + (shF || 2), hy - 2, lit); };
  switch (i) {
    case 0: figure(g, P, { prop: both(false, false) }); break;
    case 1: figure(g, P, { stride: 1, prop: both(false, false) }); break;
    case 2: figure(g, P, { stride: -1, prop: both(false, false) }); break;
    case 3: figure(g, P, { lean: -2, armF: [1, 4], prop: both(false, false, 0) }); break;                       /* bash windup: the shield drawn in */
    case 4: figure(g, P, { lean: 2, stride: 1, armF: [9, 3], prop: both(false, false, 3) }); break;             /* bash release: driven out */
    case 5: figure(g, P, { lean: -1, armB: [-1, -8], prop: (gg, PP, hx, hy, bx, by) => { maceAt(gg, PP, bx, by, true); shieldAt(gg, PP, hx + 2, hy - 2, true); gleam(gg, hx + 2, hy - 3); } }); break;   /* the gleam: the mace up, the star on the shield */
    case 6: figure(g, P, { lean: 3, stride: 1, armB: [8, 2], prop: (gg, PP, hx, hy, bx, by) => { maceAt(gg, PP, bx, by, false); shieldAt(gg, PP, hx - 1, hy, false); } }); break;   /* the overhead down */
    case 7: figure(g, P, { lean: -3, armF: [7, -4], armB: [-7, -2], prop: (gg, PP, hx, hy, bx, by) => { maceAt(gg, PP, bx, by, true); g.fillStyle = PP.shield; g.fillRect(hx, hy - 6, 3, 9); for (let k = 0; k < 4; k++) { g.fillStyle = '#ffffff'; g.fillRect(hx - 4 + k * 3, hy - 9 - (k & 1) * 2, 1, 1); } } }); break;   /* shattered: flung wide */
    case 8: figure(g, P, { crouch: 4, kneel: true, prop: (gg, PP, hx, hy, bx, by) => { shieldAt(gg, PP, hx + 1, hy, false); g.globalAlpha = 0.6; g.fillStyle = '#fff6c8'; g.fillRect(AX - 7, 8, 1, 26); g.fillRect(AX + 7, 8, 1, 26); g.globalAlpha = 1; } }); break;   /* mending: the light creeping back */
    default: figure(g, P, { lean: -2, prop: both(false, false) }); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';   /* hurt */
  }
  return outline(c); }
/* THE UNDEAD PRIEST's frames (src/undead-priest.js FRAMES) */
function priestFrame(i, P) { const c = mk(), g = c.getContext('2d');
  const censer = (dx, dy, glow) => (gg, PP, hx, hy) => { gg.strokeStyle = '#8a8a9a'; gg.beginPath(); gg.moveTo(hx, hy); gg.lineTo(hx + dx, hy + dy); gg.stroke(); gg.fillStyle = PP.shield; gg.fillRect(hx + dx - 2, hy + dy, 4, 3); if (glow) { gg.fillStyle = PP.boss; gg.fillRect(hx + dx - 1, hy + dy - 2, 2, 2); } };
  const hands = (col) => (gg, PP, hx, hy, bx, by) => { gg.fillStyle = col; gg.fillRect(hx - 1, hy - 1, 2, 2); gg.fillRect(bx - 1, by - 1, 2, 2); };
  switch (i) {
    case 0: figure(g, P, { hood: true, prop: censer(1, 6, false) }); break;
    case 1: figure(g, P, { hood: true, stride: 1, prop: censer(2, 6, false) }); break;
    case 2: figure(g, P, { hood: true, stride: -1, prop: censer(0, 6, false) }); break;
    case 3: figure(g, P, { hood: true, lean: -2, armF: [-1, -6], prop: censer(-2, -6, true) }); break;               /* bolt windup: the censer swung back over the head */
    case 4: figure(g, P, { hood: true, lean: 2, armF: [9, 0], prop: censer(5, 1, true) }); break;                  /* bolt release: flung out */
    case 5: figure(g, P, { hood: true, crouch: 3, armF: [3, 9], armB: [-3, 9], prop: hands('#9ab0e0') }); break;      /* raise windup: hands to the floor */
    case 6: figure(g, P, { hood: true, lean: -1, armF: [4, -8], armB: [-4, -8], prop: hands('#9ab0e0') }); break;    /* raise release: arms flung up */
    case 7: figure(g, P, { hood: true, armF: [1, 2], armB: [1, 3], prop: hands('#ff9a5c') }); break;                 /* mend windup: hands together */
    case 8: figure(g, P, { hood: true, armF: [7, 1], armB: [-7, 1], prop: hands('#ff9a5c') }); break;               /* mend release: spread */
    case 9: figure(g, P, { hood: true, lean: 1, armF: [9, -3], prop: (gg, PP, hx, hy) => { gg.fillStyle = '#c8ccb0'; gg.fillRect(hx, hy - 2, 1, 1); gg.fillRect(hx, hy + 1, 1, 1); } }); break;   /* snuff windup: the fingers open */
    case 10: figure(g, P, { hood: true, lean: 2, armF: [10, -3], prop: (gg, PP, hx, hy) => { gg.fillStyle = '#c8ccb0'; gg.fillRect(hx, hy - 1, 2, 2); gg.fillStyle = '#6a6a7a'; gg.fillRect(hx + 2, hy - 4, 1, 2); } }); break;   /* the pinch */
    case 11: figure(g, P, { hood: true, crouch: 3, lean: -3, armF: [-2, -5], armB: [-5, -4], stride: 1 }); break;    /* flee: cowering from the flame */
    default: figure(g, P, { hood: true, lean: -2 }); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
  }
  return outline(c); }
/* THE SETS: { R, L, white, ax, ay, w, h } as main.js's drawSet wants them */
export function bakeSet(kind, n, w, h) { const Rr = []; for (let i = 0; i < n; i++) Rr.push(kind === 'deadpriest' ? priestFrame(i, PAL.deadpriest) : paladinFrame(i, PAL[kind]));
  const Wt = Rr.map(c => whiten(c)); return { R: Rr, L: Rr.map(flipX), white: { R: Wt, L: Wt.map(flipX) }, ax: AX, ay: AY, w, h }; }
/* OVER THEM (main.js, after the bodies): the paladin foe's DIVINE SHIELD dome (whole, cracked, gone), the gleam's star, the priest's bolts and his cast glow */
export function drawOver(g, foes, cx, cy, time, isPal, isPri) {
  for (const e of foes) { if (!e.alive) continue; const x = R(e.x - cx), y = R(e.y - cy); if (x < -40 || x > 400) continue;
    if (isPal(e)) { if (e.shield) { const cracked = e.t === 'deadpaladin'; g.globalAlpha = 0.28 + 0.12 * Math.sin(time * 6 + e.x); g.strokeStyle = cracked ? '#9ab0e0' : '#fff6c8'; g.beginPath(); g.ellipse(x, y - 14, 13, 17, 0, 0, Math.PI * 2); g.stroke();
        if (cracked) { g.beginPath(); g.moveTo(x - 6, y - 26); g.lineTo(x - 2, y - 20); g.lineTo(x - 5, y - 14); g.moveTo(x + 7, y - 8); g.lineTo(x + 3, y - 12); g.stroke(); } g.globalAlpha = 1; }
      if (e.mode === 'gleamTell') { const k = Math.floor(time * 16) % 2; g.fillStyle = k ? '#ffffff' : '#fff6c8'; const gx = x + (e.face || 1) * 7, gy = y - 18; g.fillRect(gx - 5, gy, 11, 1); g.fillRect(gx, gy - 5, 1, 11); } }
    if (isPri(e)) { for (const b of e.bolts || []) { const bx = R(b.x - cx), by = R(b.y - cy); g.fillStyle = '#9ab0e0'; g.fillRect(bx - 3, by - 2, 6, 4); g.fillStyle = '#e8f0ff'; g.fillRect(bx - 1, by - 1, 2, 2); g.globalAlpha = 0.4; g.fillRect(bx - 8 * Math.sign(b.vx), by, 5, 1); g.globalAlpha = 1; }
      if (/Tell$/.test(e.mode)) { g.globalAlpha = 0.3 + 0.25 * Math.sin(time * 12); g.fillStyle = e.mode === 'mendTell' ? '#ff9a5c' : '#9ab0e0'; g.beginPath(); g.arc(x, y - 14, 12, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; } } } }
