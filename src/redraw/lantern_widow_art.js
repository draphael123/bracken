// src/redraw/lantern_widow_art.js - THE LANTERN WIDOW's art (claude/wispart, the SONNET ART PASS over claude/wispwood's greybox; WISPWOOD_SHIPS stays false).
// A ghost bride who keeps every light that comes into her glade: a pale tattered wedding gown that frays into mist where it should touch the ground, a long veil, a crown of dead orange blossom,
// dark hair, eyes that are two black holes with tear-tracks, and in her hand THE WOOD'S GREAT LANTERN - a wrought-iron lantern as tall as her head. Its flame is the target: dim when the glade is
// lit, blazing white-gold with a pulsing ring while she holds stolen light (STRIKE IT).
// Every POSE mode of src/lantern-widow-hands.js (the brief: lantern hand, free hand, veil spread, lean, mouth, what shows) is drawn, and each move's windup differs from its release:
//   sleep wake drift perch glide | veilTell veil | wailTell wail | handsTell hands | theftTell (the beckon) | reel (her opening: staggered, the lantern guttering, gold stars) | lament |
//   marchTell march (the hand bell) | hurt (flash) | dead (she unravels into petals; the lantern falls, burns a moment, goes out).
// Her ATTACKS in the world are drawn here too: the wail's rings, the hands that erupt, the wedding march's mourners and the toll-gate that tells it, the false lights.
// Rect-based (px.js primitives only). The boss draws into a scratch sheet so a hit can flash it white.
import { canvas, px, rect, line, circle, ellipse } from '../px.js';
import { WA, drawHand, drawHandTell } from './wispwood_art.js';

const R = Math.round;
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const al = (hexc, k) => { const h = hexc.slice(1); return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + k.toFixed(2) + ')'; };
export const WI = {
  gown: '#d6dcec', gownHi: '#f4f7ff', gownLo: '#9aa4c0', gownDk: '#5a6482', lace: '#f8faff', skin: '#eef2fa', skinLo: '#bfc8dc', hair: '#2a3048', hairHi: '#4a5478', veil: '#e8ecf8',
  blossom: '#c8c4b8', blossomLo: '#8a8678', iron: '#3a3e48', ironHi: '#8a8e98', ironLo: '#1c1e26', brass: '#c8a040', brassHi: '#f0d890', brassLo: '#7a5a1c',
  glow: '#ffe9a0', hot: '#fff6c8', white: '#ffffff', dark: '#0a0a14', tear: '#bfe6ff',
};
const glow = (g, x, y, r, col, a) => { circle(g, x, y, r, al(col, a)); circle(g, x, y, r * 0.55, al(col, a * 0.9)); };
const thick = (g, x0, y0, x1, y1, c, w) => { const steep = Math.abs(y1 - y0) > Math.abs(x1 - x0); for (let k = 0; k < w; k++) { const o = k - (w >> 1); if (steep) line(g, x0 + o, y0, x1 + o, y1, c); else line(g, x0, y0 + o, x1, y1 + o, c); } };

/* THE GREAT LANTERN (cx, cy = its middle). stolen: she holds your light (blazing, the target ring); dim: her opening (cracked, guttering); out: dead */
export function drawGreatLantern(g, cx, cy, time, o = {}) {
  const { stolen, dim, out, ring } = o;
  if (!out) { if (stolen) { const p = 0.5 + 0.5 * Math.sin(time * 9); glow(g, cx, cy, 22, WI.hot, 0.07); glow(g, cx, cy, 15, WI.hot, 0.11); } else if (!dim) glow(g, cx, cy, 14, WI.glow, 0.07); else glow(g, cx, cy, 8, WA.ember, 0.07); }
  rect(g, cx - 1, cy - 12, 3, 2, WI.iron); px(g, cx, cy - 13, WI.ironHi); rect(g, cx - 4, cy - 10, 9, 1, WI.ironHi); rect(g, cx - 5, cy - 9, 11, 3, WI.iron); rect(g, cx - 5, cy - 9, 11, 1, WI.ironHi); rect(g, cx - 4, cy - 6, 9, 1, WI.ironLo);   /* the cap, the finial */
  const glass = out ? '#1c2028' : stolen ? WI.hot : dim ? '#8a6a3a' : WI.glow;
  rect(g, cx - 4, cy - 5, 9, 11, glass); rect(g, cx - 4, cy - 5, 2, 11, out ? '#2a2e38' : stolen ? '#ffffff' : dim ? '#a08050' : WI.hot);
  if (!out) { const f = 0.5 + 0.5 * Math.sin(time * (stolen ? 16 : 9)); rect(g, cx - 2, cy - 3, 4, 7, stolen ? '#ffffff' : dim ? '#ffd090' : '#fffbe8'); rect(g, cx - 1, cy - 5 - (f > 0.5 ? 1 : 0), 2, 3, stolen ? '#ffffff' : WI.hot); }
  rect(g, cx - 5, cy - 5, 1, 11, WI.iron); rect(g, cx + 5, cy - 5, 1, 11, WI.iron); rect(g, cx, cy - 5, 1, 11, WI.iron); px(g, cx - 3, cy - 5, WI.ironHi);   /* the bars */
  rect(g, cx - 5, cy + 6, 11, 2, WI.iron); rect(g, cx - 4, cy + 8, 9, 1, WI.ironLo); px(g, cx - 5, cy + 9, WI.iron); px(g, cx + 5, cy + 9, WI.iron);   /* the base and its feet */
  if (dim) { px(g, cx - 1, cy - 3, '#1c1e26'); px(g, cx, cy - 2, '#1c1e26'); px(g, cx + 1, cy - 1, '#1c1e26'); px(g, cx + 2, cy, '#1c1e26'); }   /* cracked */
  if (stolen && ring !== false) { const k = (time * 1.6) % 1, r = 11 + k * 7; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; px(g, R(cx + Math.cos(a) * r), R(cy + Math.sin(a) * r), al(WI.glow, 0.85 * (1 - k))); }   /* STRIKE HERE */
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + time * 1.5; line(g, R(cx + Math.cos(a) * 9), R(cy + Math.sin(a) * 9), R(cx + Math.cos(a) * 15), R(cy + Math.sin(a) * 15), al(WI.hot, 0.5)); } }
}
let SCR = null; const scratch = () => (SCR = SCR || (() => { const [c, g] = canvas(170, 130); return { c, g }; })());
const OX = 85, OY = 92;   /* her feet in the scratch sheet */

/* THE BRIDE. mode = e.mode (or 'dead'); p = POSE[mode]: { lan, hand, veil, lean, mouth, head, bow, beckon, bell, dim, bright }; o: stolen, flash, t (seconds since death) */
export function drawWidow(g, ex, ey, mode, p, f, time, o = {}) {
  const { c, g: sg } = scratch(); sg.clearRect(0, 0, 170, 130);
  const X = (lx, w = 0) => (f > 0 ? OX + lx : OX - lx - w), Y = ly => OY + ly;
  const rc = (lx, ly, w, h, col) => rect(sg, X(lx, w), Y(ly), w, h, col);
  const pxx = (lx, ly, col) => px(sg, X(lx, 1), Y(ly), col);
  const pl = (x0, y0, x1, y1, col, w = 1) => thick(sg, f > 0 ? OX + x0 : OX - x0, Y(y0), f > 0 ? OX + x1 : OX - x1, Y(y1), col, w);
  const dead = mode === 'dead', t = o.t || 0, sleep = mode === 'sleep', lean = (p.lean || 0), sway = Math.sin(time * 2.2) * 1.2;
  const lx = (p.lan || [12, -16])[0], ly = (p.lan || [12, -16])[1], hx = (p.hand || [-6, -16])[0], hy = (p.hand || [-6, -16])[1];
  const bodyX = lean * 0.18, headY = -32 + (p.head || 0) + (p.bow ? 3 : 0), headX = lean * 0.4 + (p.bow ? 2 : 0);
  /* ---- the veil, behind her: it streams back; spread is how wide (the sweep throws it forward) ---- */
  const vs = p.veil || 6, flow = mode === 'glide' ? 12 : mode === 'veilTell' ? 1 : 5;
  for (let k = 0; k < 4; k++) { const w = 4 + vs * 0.45 + k * 2, vx = -4 - k * (flow * 0.5) - bodyX * 0.5 + Math.sin(time * 2.4 + k) * 1.2, a = 0.34 - k * 0.05; rc(vx - w / 2, -40 + k * 2, w, 36 - k * 2 + (sleep ? -4 : 0), al(WI.veil, a)); }
  rc(-7, -38, 3, 34, al(WI.veil, 0.5)); rc(-8, -6, 4, 4, al(WI.veil, 0.3)); rc(-11 - (flow >> 1), -4 + R(sway), 5, 3, al(WI.veil, 0.2));   /* the train, ragged */
  if (mode === 'veil') for (let k = 0; k < 4; k++) { const fx = 6 + k * 7, fh = 30 - k * 3; rc(fx, -34 + k * 2, 6, fh, al(WI.veil, 0.46 - k * 0.08)); rc(fx, -34 + k * 2, 1, fh, al(WI.white, 0.6 - k * 0.12)); rc(fx + 5, -4 + k, 2, 3, al(WI.veil, 0.4)); }   /* THE SWEEP: the veil flung forward */
  if (mode === 'veilTell') { rc(-18, -34, 2, 24, al(WI.veil, 0.55)); rc(-16, -36, 4, 3, al(WI.veil, 0.7)); for (let k = 0; k < 3; k++) rc(2 + k * 5, -26 + k * 3, 3, 1, al(WI.white, 0.4 - k * 0.1)); }   /* drawn back, taut: the pull before it snaps */
  /* ---- hair, under the veil ---- */
  rc(-5 + headX, headY - 2, 4, 28, WI.hair); rc(-6 + headX, headY + 6, 2, 22 + R(sway), WI.hair); rc(-5 + headX, headY, 1, 18, WI.hairHi); if (p.mouth === 'wide') { rc(-9 + headX, headY + 4, 4, 14, WI.hair); rc(-12 + headX, headY + 8, 3, 10, WI.hair); }
  /* ---- the gown: a bell skirt that frays into mist, a bodice with a faded sash, lace at the hem ---- */
  for (let y = -17; y <= -1; y++) { const half = 3 + (y + 17) * 0.45, sh = bodyX * (1 - (-y) / 24), ragged = y > -5 ? (hash(y, 3) % 3 - 1) : 0, w = R(half * 2) + ragged;
    rc(R(-half + sh), y, w, 1, y % 5 === 0 ? WI.gownLo : WI.gown); rc(R(-half + sh), y, 1, 1, WI.gownHi); rc(R(half + sh) - 1, y, 1, 1, WI.gownLo); if (y % 4 === 0) rc(R(sh) - 1, y, 1, 1, WI.gownHi); }
  for (let k = 0; k < 6; k++) { const px0 = -9 + k * 3.4 + bodyX * 0.2; rc(R(px0), -3 + (k & 1), 3, 2, WI.lace); }
  rc(R(-7 + bodyX * 0.2), -1, 14, 1, al(WI.gown, 0.55)); for (let k = 0; k < 5; k++) { const mt = (time * 0.9 + k * 0.2) % 1; rc(-8 + k * 4 + bodyX * 0.2, 0 + R(mt * 8), 2, 2, al(WI.veil, 0.4 * (1 - mt))); }   /* where she should touch the ground: mist */
  rc(R(-3 + bodyX), -27, 6, 10, WI.gown); rc(R(-3 + bodyX), -27, 1, 10, WI.gownHi); rc(R(2 + bodyX), -27, 1, 10, WI.gownLo); rc(R(-3 + bodyX), -19, 6, 2, '#7a86a8'); rc(R(-3 + bodyX), -19, 6, 1, '#9aa6c8'); pxx(R(bodyX), -26, WI.lace); pxx(R(bodyX), -24, WI.lace); pxx(R(bodyX) - 1, -22, WI.gownDk);
  /* ---- the free arm: lace sleeve, a thin hand (a bell on a march; a hooked finger on the beckon) ---- */
  const shX = R(-2 + bodyX), shY = -25;
  pl(shX, shY, hx, hy, WI.gown, 2); pl(shX, shY + 1, hx, hy + 1, WI.gownLo, 1); rc(hx - 2, hy - 2, 4, 4, WI.skin); pxx(hx + 1, hy + 1, WI.skinLo);
  if (p.beckon) { rc(hx + 1, hy - 4, 1, 4, WI.skin); rc(hx + 2, hy - 5, 1, 2, WI.skin); rc(hx + 3, hy - 2, 1, 3, WI.skin); const k = (time * 3) % 1; for (let i = 0; i < 3; i++) { const r = 4 + ((k + i / 3) % 1) * 10; rc(hx + 2 + R(r), hy - 2 + i * 2 - 2, 2, 1, al(WI.glow, 0.7 * (1 - ((k + i / 3) % 1)))); } }   /* the crooked finger, beckoning */
  if (p.bell) { const sw2 = mode === 'march' ? R(Math.sin(time * 18) * 4) : R(Math.sin(time * 9) * 2); rc(hx - 1 + sw2, hy - 7, 2, 4, WI.brassLo); rc(hx - 4 + sw2, hy - 4, 8, 6, WI.brass); rc(hx - 4 + sw2, hy - 4, 2, 6, WI.brassHi); rc(hx - 5 + sw2, hy + 1, 10, 2, WI.brassLo); px(sg, X(hx + sw2, 1), Y(hy + 4), '#2a2010'); }   /* the hand bell */
  if (mode === 'handsTell' || mode === 'hands') { const dl = mode === 'hands' ? 12 : 7; for (let k = 0; k < 4; k++) { const tt = (time * 1.6 + k * 0.25) % 1; rc(hx - 2 + k, hy + 2 + R(tt * dl), 1, 2, al('#6a52a8', 0.8 * (1 - tt))); } rc(hx - 3, hy + 3, 6, 1, 'rgba(20,10,34,0.7)'); }   /* dark runs off the fingers into the ground */
  /* ---- the head: pale, eyeless, tear-tracked; the wreath of dead blossom under the veil ---- */
  const hxc = headX, hyt = headY - 5;
  ellipse(sg, X(hxc, 0) + (f > 0 ? 0 : 0), Y(headY), 4, 5, WI.skin); rc(R(hxc) - 4, headY - 3, 1, 6, WI.skinLo); rc(R(hxc) + 2, headY - 4, 2, 8, WI.skinLo);
  const eyeY = headY - 1; const shut = sleep;
  if (shut) { rc(R(hxc) - 2, eyeY, 2, 1, WI.dark); rc(R(hxc) + 1, eyeY, 2, 1, WI.dark); } else { rc(R(hxc) - 2, eyeY - 1, 2, 3, WI.dark); rc(R(hxc) + 1, eyeY - 1, 2, 3, WI.dark); if (mode === 'wake' || mode === 'theftTell' || p.mouth === 'wide') { pxx(R(hxc) - 1, eyeY, WI.tear); pxx(R(hxc) + 2, eyeY, WI.tear); } }
  rc(R(hxc) - 2, eyeY + 2, 1, 5, al(WI.tear, 0.8)); rc(R(hxc) + 2, eyeY + 2, 1, 4 + (R(time * 2) & 1), al(WI.tear, 0.8));   /* the tears */
  const my = headY + 3; if (p.mouth === 'wide') { rc(R(hxc) - 1, my - 1, 3, 4, WI.dark); rc(R(hxc), my + 1, 1, 1, '#3a1a2a'); } else if (p.mouth === 'open') { rc(R(hxc) - 1, my, 3, 2, WI.dark); } else rc(R(hxc) - 1, my + 1, 3, 1, '#6a6488');
  rc(R(hxc) - 5, hyt, 10, 2, WI.blossomLo); for (let k = 0; k < 5; k++) { rc(R(hxc) - 5 + k * 2, hyt - 1 - (k & 1), 2, 2, WI.blossom); pxx(R(hxc) - 5 + k * 2, hyt - 2 - (k & 1), WI.skin); }   /* the crown of dead orange blossom */
  if (mode === 'wailTell') for (let k = 0; k < 6; k++) { const tt = (time * 2 + k * 0.17) % 1; pxx(R(hxc) + 14 - R(tt * 12) + (k % 3) * 2, headY - 8 + (k % 4) * 4 - R(tt * 2), al(WA.cyan, 0.7 * tt)); }   /* breath drawn in */
  if (mode === 'wail') { for (let k = 0; k < 3; k++) { const rr = 7 + k * 5 + R(Math.sin(time * 20 + k) * 1); rc(R(hxc) + rr, headY - 5, 1, 10, al(WA.cyan, 0.8 - k * 0.2)); rc(R(hxc) + rr + 1, headY - 3 + (k & 1), 1, 6, al(WA.cyanHi, 0.5 - k * 0.12)); } rc(R(hxc) - 3, headY - 7, 8, 1, al(WA.cyanHi, 0.5)); }   /* the keening: arcs of sound off her mouth */
  /* ---- the lantern arm and THE GREAT LANTERN ---- */
  const lanHand = [lx, ly - 10];
  pl(R(2 + bodyX), shY, lanHand[0], lanHand[1] + 1, WI.gown, 2); pl(R(2 + bodyX), shY + 1, lanHand[0], lanHand[1] + 2, WI.gownLo, 1); rc(lanHand[0] - 2, lanHand[1] - 1, 4, 3, WI.skin);
  rc(lanHand[0], lanHand[1] + 2, 1, 3, WI.ironHi);   /* the chain */
  if (mode === 'lament') { pl(R(-2 + bodyX), shY, 0, -48, WI.gown, 2); rc(-2, -50, 4, 3, WI.skin); }   /* both hands up, the lantern lifted */
  const reeling = mode === 'reel';
  drawLantern(sg, f > 0 ? OX + lx : OX - lx, Y(ly), time, { stolen: o.stolen && !reeling, dim: reeling || mode === 'sleep', out: false, ring: !reeling });
  if (mode === 'theftTell') for (let k = 0; k < 6; k++) { const tt = (time * 1.4 + k / 6) % 1, sx = 30 - tt * 28, sy = -14 + (k % 3) * 7 - tt * 18; rc(R(sx), R(sy), 2, 2, al(WI.glow, 0.9 * (1 - tt))); rc(R(sx) + 2, R(sy) + 1, 2, 1, al(WI.glow, 0.5 * (1 - tt))); }   /* every flame in the glade, drawn to her hand */
  if (mode === 'reel') { for (let k = 0; k < 5; k++) { const tt = (time * 1.1 + k * 0.2) % 1; rc(lx - 3 + (k * 3) % 8, ly + 6 + R(tt * 22), 1, 2, al(WA.ember, 0.9 * (1 - tt))); }   /* sparks from the cracked glass */
    for (let k = 0; k < 4; k++) { const a = time * 4 + k * 1.57; const sx = R(Math.cos(a) * 9), sy = R(Math.sin(a) * 3); rc(sx - 1, headY - 10 + sy, 3, 1, WI.glow); rc(sx, headY - 11 + sy, 1, 3, WI.glow); } }   /* gold stars: she is open */
  if (mode === 'lament') { for (let k = 0; k < 6; k++) { const tt = (time * 0.7 + k / 6) % 1; rc(-12 + k * 5 + R(Math.sin(time + k) * 2), -42 + R(tt * 44), 2, 1, al(WI.blossom, 0.8 * (1 - tt * 0.6))); } rc(-3, -52, 6, 1, al(WI.glow, 0.6)); }
  if (mode === 'sleep') { rc(R(hxc) - 3, headY - 7, 7, 1, al(WI.veil, 0.5)); const tt = (time * 0.6) % 1; rc(8, headY - 6 - R(tt * 8), 2, 1, al(WI.veil, 0.5 * (1 - tt))); }   /* a veil drawn over, a breath of petals */
  if (mode === 'wake') { rc(R(hxc) - 3, eyeY, 2, 1, WI.tear); rc(R(hxc) + 1, eyeY, 2, 1, WI.tear); for (let k = 0; k < 5; k++) { const tt = (time * 1.4 + k * 0.2) % 1; rc(-12 + k * 6, -36 + R(tt * 6), 1, 1, al(WA.cyan, 0.7 * (1 - tt))); } }
  if (mode === 'glide') for (let k = 1; k < 4; k++) { rc(-14 - k * 8, -26 + k, 10 - k, 18, al(WI.veil, 0.22 - k * 0.05)); }   /* the after-image of her passing */
  if (p.bright || mode === 'perch') { rc(f > 0 ? -5 : -5, -36, 1, 20, al(WA.cyanHi, 0.6)); }   /* rim-lit in the stolen light */
  if (dead) { /* she comes apart, bottom first, into blossom */
    const thr = Math.min(1, Math.max(0, (t - 0.5) / 2.2)), blocks = 3;
    for (let by = -52; by < 12; by += blocks) for (let bx = -26; bx < 26; bx += blocks) { const hh = (hash(bx, by) % 100) / 100, bias = (by + 52) / 64; if (hh < thr * 1.5 - (1 - bias) * 0.5) sg.clearRect(OX + bx, OY + by, blocks, blocks); }
  }
  if (o.flash && !dead) { sg.globalCompositeOperation = 'source-in'; sg.fillStyle = '#ffffff'; sg.fillRect(0, 0, 170, 130); sg.globalCompositeOperation = 'source-over'; }
  g.globalAlpha = p.dim ? 0.78 : 0.94; g.drawImage(c, R(ex) - OX, R(ey) - OY); g.globalAlpha = 1;
}
/* (the lantern draws at absolute scratch coordinates) */
function drawLantern(sg, cx, cy, time, o) { drawGreatLantern(sg, cx, cy, time, o); }

/* HER DEATH: the gown is gone into petals, the lantern falls and burns on the ground a moment, then goes out (t = seconds since she fell; lx, ly = where the lantern hung) */
export function drawDeathLantern(g, x, floorY, lx, ly, t, time) {
  if (t > 4.4) return;
  const fall = Math.min(1, t / 0.9), y = R(ly + (floorY - 10 - ly) * fall * fall + (t > 0.9 && t < 1.2 ? -Math.sin((t - 0.9) / 0.3 * Math.PI) * 5 : 0));
  const on = t < 3.0; drawGreatLantern(g, R(lx + (x - lx) * fall), y, time, { out: !on, dim: t > 2.2, ring: false });
  for (let k = 0; k < 10; k++) { const tt = (t * 0.45 + k * 0.1) % 1, a = 1 - Math.min(1, t / 4.2); const bx = R(x - 22 + ((k * 37) % 44) + Math.sin(t * 2 + k) * 4), by = R(floorY - 52 + tt * 56);
    rect(g, bx, by, 2, 1, al(WI.blossom, 0.8 * a)); rect(g, bx + 1, by + 1, 1, 1, al(WI.blossomLo, 0.8 * a)); }   /* blossom falling where she was */
  if (t < 3.0 && t > 1.0) for (let k = 0; k < 3; k++) { const tt = (time * 1.5 + k / 3) % 1; rect(g, R(x) - 2 + k * 2, y - 12 - R(tt * 12), 1, 2, al(WI.glow, 0.6 * (1 - tt))); }
}

/* ================================ HER ATTACKS IN THE WORLD ================================ */
/* THE WAIL: two rings of sound running out along the ground (x, y = where she keened; rad = how far) */
export function drawWailRing(g, x, y, rad, k, time) {
  for (const s of [-1, 1]) for (let q = 0; q < 3; q++) { const r = Math.max(0, rad - q * 7), bx = R(x + s * r), a = (0.85 - q * 0.25) * (1 - k * 0.5);
    for (let i = 0; i < 9; i++) { const dy = i - 4, bow = Math.abs(dy) * (dy < 0 ? 0.5 : 0.5); rect(g, bx - R(bow) * s - (s > 0 ? 1 : 0), y - 8 + i * 2, 2, 2, al(i === 4 ? WA.cyanHi : WA.cyan, a)); }
    if (q === 0) { rect(g, bx - s * 6, y + 2, 5, 1, al(WA.cyan, 0.4)); rect(g, bx - s * 11, y + 2, 4, 1, al(WA.cyan, 0.25)); } }   /* dust shaken up behind the crest */
}
/* HER HANDS: the told ripple (t > 0.15) then the hand that erupts (x, y = on the ground; k = the tell's progress) */
export function drawHandSpot(g, x, y, t, time) {
  if (t > 0.15) { const k = Math.min(1, Math.max(0, 1 - (t - 0.15) / 1.65)); drawHandTell(g, x, y, x, k, time); if ((time * 10) % 2 < 1) rect(g, x - 6, y - 1, 12, 1, '#ff4a2a'); }
  else drawHand(g, x, y, Math.min(1, 1.4 - t * 6), 0, time);
}
/* THE WEDDING MARCH: a procession of mourners, hooded, veiled, each with a stub of candle, sweeping low across the floor (x = the head of it, dir = which way) */
export function drawMourners(g, x, floorY, dir, h, time) {
  for (let k = 0; k < 4; k++) { const mx = R(x - dir * k * 14), a = 0.95 - k * 0.2, step = R(Math.sin(time * 14 + k * 1.7)), by = floorY - h;
    rect(g, mx - 4, by + 4, 8, h - 4, al('#3a3e52', a)); rect(g, mx - 4, by + 4, 2, h - 4, al('#5a6082', a)); rect(g, mx - 3, by, 6, 6, al('#2a2e42', a)); rect(g, mx - 2, by + 2, 4, 3, al('#c8cee0', a * 0.8)); px(g, mx - 1, by + 3, '#0a0a14'); px(g, mx + 1, by + 3, '#0a0a14');   /* the cowl and a veiled face */
    rect(g, mx - 3 + step, floorY - 3, 3, 3, al('#2a2e42', a)); rect(g, mx + 1 - step, floorY - 3, 3, 3, al('#2a2e42', a));
    rect(g, mx + dir * 5, by + 9, 2, 5, al('#e8e4d4', a)); rect(g, mx + dir * 5, by + 6, 2, 3, al(WA.cyan, a)); px(g, mx + dir * 5, by + 5, al(WA.cyanHi, a));   /* a stub of candle, the cold flame */
    rect(g, mx - dir * 8, by + 10, 4, h - 10, al('#3a3e52', a * 0.35)); }
  rect(g, R(x) - 6, floorY - 1, 12, 1, 'rgba(90,100,140,0.4)');
}
/* THE TOLL-GATE: the march's tell, at the far wall - a dark arch, the bell tolling over it, the red bar */
export function drawMarchGate(g, x, floorY, time, toll) {
  const hot = (time * 8) % 2 < 1;
  rect(g, x - 8, floorY - 44, 16, 44, '#0c0c18'); rect(g, x - 9, floorY - 46, 18, 3, '#2a2e42'); rect(g, x - 6, floorY - 49, 12, 3, '#2a2e42'); rect(g, x - 8, floorY - 44, 1, 44, '#4a5078');
  const sw = R(Math.sin(time * 12) * 3); rect(g, x - 1 + sw, floorY - 58, 2, 6, '#7a5a1c'); rect(g, x - 4 + sw, floorY - 52, 8, 5, WI.brass); rect(g, x - 5 + sw, floorY - 47, 10, 2, WI.brassLo);
  rect(g, x - 3, floorY - 40, 6, 40, hot ? '#ff4a2a' : '#ff9a5c'); for (let k = 0; k < 3; k++) px(g, x - 5 + k * 5, floorY - 30 - k * 5, hot ? '#ffd0a0' : '#ff4a2a');
}
/* A FALSE LIGHT: a copy of her lantern, small and cold, that orbits her (struck: popped, nothing) */
export function drawFalseLight(g, x, y, time, k = 0) {
  glow(g, x, y, 9, WA.cyan, 0.08); rect(g, x - 3, y - 4, 7, 8, '#6a7080'); rect(g, x - 2, y - 3, 5, 6, '#fff6c8'); rect(g, x - 1, y - 2, 3, 4, '#ffffff'); rect(g, x - 3, y - 5, 7, 1, '#8a8e98'); rect(g, x, y - 7, 1, 2, '#8a8e98');
  for (let i = 0; i < 3; i++) { const a = time * 5 + i * 2.1 + k; px(g, R(x + Math.cos(a) * 7), R(y + Math.sin(a) * 5), al(WA.cyanHi, 0.8)); }
}
