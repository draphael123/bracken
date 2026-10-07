// rootway_backdrop.js - THE ROOTWAY's own BACKDROP and LANDMARKS (claude/rootway art pass). The greybox wore Sporewood's mushroom hills. This is the climb out of the fungus into a
// great tree's canopy, and the SKY WARMS as you climb (the seam Sporewood leaves for Kingswood: violet dusk -> rose -> amber-gold):
//   SKY      a three-stop gradient that goes violet -> rose -> honey-gold with the road, a low sun that comes up on the left
//   FAR      a stand of enormous trunks in the haze, crowns of leaf-clumps, level on the horizon (parallax 0.10)
//   MID      nearer trunks, ridged, hung with vines and the GOBLINS' LANTERNS (small warm lights that twinkle) (0.22)
//   LANDMARK a great feature every ~250 px on a slow parallax (0.34), so one is in view on almost every screen: THE GREAT ROOT (a root as thick as a hill arching up out of the dark,
//            moss hanging from it), THE GOBLIN GALLOWS (two posts and a cross-beam with a pulley, a rope and a trophy cage hanging and swaying - the Rootway's hoists writ large),
//            THE ROOT ARCH (a root that has grown over a gap, lantern-strung)
//   LIGHT    long shafts of low light through the canopy (additive), stronger and warmer the higher the road goes
//   CANOPY   a fringe of leaf-mass at the top of the frame when the camera is high in the tree
// Every static picture is baked ONCE per tone (cold / mid / warm; a frame crossfades two); a frame is a handful of drawImage calls.   drawBackdrop(g, cx, cy, VW, VH, L, time, dY, dusk)
import { mulberry } from '../px.js';
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const lerp = (a, b, t) => a + (b - a) * t;
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => { const A = rgbOf(a), B = rgbOf(b); return '#' + [0, 1, 2].map(i => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, '0')).join(''); };
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* THE TONES: cold = the deep fungus dusk, warm = the canopy in the late sun */
const SKY = [['#1c1432', '#3e2652', '#8a5070'], ['#34264a', '#7a4658', '#e08a5a'], ['#5a3a3e', '#c26c3a', '#ffc474']];
const TONE = [   /* [far trunk, far crown, mid trunk, mid trunk lit, mid crown, landmark body, landmark lit, haze] by tone 0 / 0.5 / 1 */
  { farT: '#3a2a5a', farC: '#46346a', midT: '#2a1c40', midL: '#4a3668', midC: '#34264e', lmB: '#1e1430', lmL: '#5a4478', haze: '176,120,170' },
  { farT: '#6a4262', farC: '#7e506a', midT: '#46283a', midL: '#7a4a58', midC: '#5a3444', lmB: '#2e1c2a', lmL: '#a8665a', haze: '236,150,120' },
  { farT: '#a46a4a', farC: '#bc7e50', midT: '#6a3a22', midL: '#b87a3c', midC: '#8a5226', lmB: '#3e2412', lmL: '#e8a050', haze: '255,196,120' }];
const tones = k => k <= 0.5 ? [0, 1, k * 2] : [1, 2, (k - 0.5) * 2];

/* ---- a trunk: a column of bark, flared at the foot, ridged, the sun on its left ---- */
function trunk(g, cx, y0, y1, w0, col, lit, seed, ridge) {
  const r = mulberry(seed);
  for (let y = y0; y < y1; y++) { const t = (y - y0) / Math.max(1, y1 - y0), w = w0 * (1 + Math.pow(Math.max(0, t - 0.78) / 0.22, 2) * 1.2) + Math.round(Math.sin(y * 0.09 + seed) * 1.2), xl = Math.round(cx - w), wd = Math.round(w * 2);
    rc(g, xl, y, wd, 1, col); rc(g, xl, y, Math.min(3, wd), 1, lit); if (ridge && r() < 0.5) { const rx = xl + 3 + ((r() * Math.max(1, wd - 6)) | 0); rc(g, rx, y, 1, 1, mix(col, '#000000', 0.35)); } rc(g, xl + wd - Math.min(4, wd >> 1), y, Math.min(4, wd >> 1), 1, mix(col, '#000000', 0.3)); } }
/* a crown: a cluster of leaf-blobs, each with a lit top and a dark underside */
function crown(g, cx, cy, rad, col, lit, seed) {
  const r = mulberry(seed), n = 5 + ((rad / 6) | 0);
  for (let i = 0; i < n; i++) { const a = r() * 6.28, d = r() * rad * 0.7, bx = cx + Math.cos(a) * d * 1.3, by = cy + Math.sin(a) * d * 0.55, br = rad * (0.3 + r() * 0.3);
    g.fillStyle = mix(col, '#000000', 0.25); g.beginPath(); g.ellipse(bx, by + 2, br * 1.15, br * 0.8, 0, 0, 7); g.fill();
    g.fillStyle = col; g.beginPath(); g.ellipse(bx, by, br * 1.15, br * 0.8, 0, 0, 7); g.fill();
    g.fillStyle = lit; g.beginPath(); g.ellipse(bx - br * 0.2, by - br * 0.3, br * 0.7, br * 0.4, 0, 0, 7); g.fill(); } }

const farLayer = tone => once('far' + tone, () => { const W = 640, H = 200, [c, g] = mk(W, H), T = TONE[tone], r = mulberry(8101 + tone);
  for (let i = 0; i < 9; i++) { const cxm = Math.round(i * 72 + 18 + r() * 30), w = 8 + ((r() * 14) | 0), top = 10 + ((r() * 50) | 0);
    for (const off of [0, cxm + w * 2 > W ? -W : 0, cxm - w * 2 < 0 ? W : 0]) { trunk(g, cxm + off, top + 30, H, w, T.farT, mix(T.farT, '#ffffff', 0.12), 900 + i, false); }
    crown(g, cxm, top + 26, 26 + w, T.farC, mix(T.farC, '#ffffff', 0.14), 700 + i); if (cxm + 50 > W) crown(g, cxm - W, top + 26, 26 + w, T.farC, mix(T.farC, '#ffffff', 0.14), 700 + i); if (cxm - 50 < 0) crown(g, cxm + W, top + 26, 26 + w, T.farC, mix(T.farC, '#ffffff', 0.14), 700 + i); }
  g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(' + T.haze + ',0)'); gr.addColorStop(1, 'rgba(' + T.haze + ',0.55)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
  return c; });
/* the lantern spots on the mid layer, in the layer's own pixels: [x, y, phase] */
export const MID_W = 576, MID_H = 230;
const LANTERNS = (() => { const r = mulberry(4401), out = []; for (let i = 0; i < 9; i++) out.push([Math.round(30 + i * 62 + r() * 24), Math.round(96 + r() * 90), r() * 6]); return out; })();
const midLayer = tone => once('mid' + tone, () => { const W = MID_W, H = MID_H, [c, g] = mk(W, H), T = TONE[tone], r = mulberry(8202 + tone);
  for (let i = 0; i < 6; i++) { const cxm = Math.round(i * 96 + 24 + r() * 40), w = 14 + ((r() * 14) | 0), top = 4 + ((r() * 30) | 0);
    const offs = [0]; if (cxm + w * 2 > W) offs.push(-W); if (cxm - w * 2 < 0) offs.push(W);
    for (const off of offs) { trunk(g, cxm + off, top + 40, H, w, T.midT, T.midL, 1900 + i, true);
      /* a bough out of the side, a vine or two hanging */
      const bd = r() < 0.5 ? -1 : 1, by = top + 60 + ((r() * 40) | 0); for (let k = 0; k < 34; k++) { const bx = cxm + off + bd * (w + k), byy = by - Math.round(k * 0.35); rc(g, bx, byy, 1, 5 - (k > 22 ? 2 : 0), T.midT); rc(g, bx, byy, 1, 1, T.midL); }
      for (let v = 0; v < 3; v++) { const vx = cxm + off - w + 2 + ((r() * w * 2) | 0), vl = 20 + ((r() * 50) | 0), vy = top + 44 + ((r() * 30) | 0); for (let k = 0; k < vl; k++) rc(g, vx + Math.round(Math.sin(k * 0.3 + v) * 1.2), vy + k, 1, 1, k % 7 === 6 ? T.midL : T.midT); }
      crown(g, cxm + off, top + 34, 36 + w, T.midC, mix(T.midC, T.midL, 0.4), 1700 + i); } }
  g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(' + T.haze + ',0)'); gr.addColorStop(1, 'rgba(' + T.haze + ',0.4)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
  /* the lanterns' own small bodies: a lamp on a bracket (the light itself is live) */
  for (const [lx, ly] of LANTERNS) { rc(g, lx - 1, ly - 4, 1, 4, '#1a1010'); rc(g, lx - 2, ly, 5, 5, '#2a1a10'); rc(g, lx - 1, ly + 1, 3, 3, '#ffcf6a'); rc(g, lx - 1, ly + 1, 3, 1, '#fff2b0'); }
  return c; });

/* THE LANDMARKS, 150 wide x 220 high, baseline at the foot */
export const LM_W = 150, LM_H = 220;
const landmark = (v, tone) => once('lm' + v + '_' + tone, () => { const [c, g] = mk(LM_W, LM_H), T = TONE[tone], r = mulberry(31 + v * 7 + tone);
  const body = T.lmB, lit = T.lmL, dk = mix(body, '#000000', 0.4);
  if (v === 0 || v === 2) {   /* THE GREAT ROOT: a root as thick as a hill, up out of the dark and over; ridged; moss hangs from the arch. v 2 is its mirror with a lantern string */
    const x0 = 12, x1 = LM_W - 14, topY = 54;
    for (let y = topY; y < LM_H; y++) { const t = (y - topY) / (LM_H - topY); const a = Math.pow(1 - t, 1.5);
      const lw = 14 + t * 16 + Math.sin(y * 0.2) * 1.2, lx = Math.round(x0 + (1 - Math.min(1, t * 1.6)) * (v === 0 ? 4 : 20));
      rc(g, lx, y, lw, 1, body); rc(g, lx, y, 3, 1, lit); rc(g, lx + lw - 5, y, 5, 1, dk);
      if ((y & 3) === 0) rc(g, lx + 4 + ((y * 7) % 8), y, 1, 2, dk);
      const rw = 12 + t * 14, rxx = Math.round(x1 - rw - Math.sin(y * 0.17) * 1.2); rc(g, rxx, y, rw, 1, body); rc(g, rxx, y, 3, 1, lit); rc(g, rxx + rw - 4, y, 4, 1, dk); }
    for (let k = 0; k < 120; k++) { const a = Math.PI * (1 - k / 119), ax = 76 + Math.cos(a) * 58, ay = topY + 6 + (1 - Math.sin(a)) * 0 + (-Math.sin(a)) * 22 + 22; const th = 9 + Math.sin(a) * 4;
      rc(g, ax, ay - th / 2 + 8, 2, th, body); rc(g, ax, ay - th / 2 + 8, 2, 2, lit); rc(g, ax, ay + th / 2 + 6, 2, 2, dk); }
    for (let i = 0; i < 8; i++) { const mx = 30 + i * 12 + ((r() * 6) | 0), ml = 8 + ((r() * 20) | 0); for (let k = 0; k < ml; k++) rc(g, mx + Math.round(Math.sin(k * 0.4 + i) * 1.1), topY + 14 + k, 1, 1, k % 5 === 4 ? lit : mix(body, '#5a8a3a', 0.45)); }   /* moss hanging */
    if (v === 2) { g.strokeStyle = mix(dk, '#c8a870', 0.4); g.lineWidth = 1; g.beginPath(); g.moveTo(24, topY + 14); g.quadraticCurveTo(76, topY + 40, 126, topY + 14); g.stroke(); for (const lx of [44, 76, 108]) { const ly = topY + 14 + Math.round(26 * (1 - Math.pow((lx - 76) / 52, 2)) * 0.62); rc(g, lx - 1, ly, 3, 4, '#2a1a10'); rc(g, lx, ly + 1, 1, 2, '#ffcf6a'); } }
  } else {   /* THE GOBLIN GALLOWS: two posts, a cross-beam out over the drop, a pulley and a rope; the cage and its rope are drawn live (they sway) */
    for (const px of [38, 98]) { rc(g, px - 4, 52, 8, LM_H - 52, body); rc(g, px - 4, 52, 3, LM_H - 52, lit); rc(g, px + 2, 52, 2, LM_H - 52, dk); for (let y = 60; y < LM_H; y += 11) rc(g, px - 5, y, 10, 2, dk); }
    rc(g, 24, 44, 98, 8, body); rc(g, 24, 44, 98, 2, lit); rc(g, 24, 50, 98, 2, dk); rc(g, 20, 46, 6, 4, dk); rc(g, 120, 46, 6, 4, dk);
    for (const [bx, dir] of [[38, 1], [98, -1]]) for (let k = 0; k < 14; k++) rc(g, bx + dir * (4 + k), 52 + k, 2, 2, body);   /* the braces */
    rc(g, 66, 52, 12, 10, dk); rc(g, 72, 62, 1, 4, mix(body, lit, 0.5)); g.fillStyle = dk; g.beginPath(); g.arc(72, 66, 4, 0, 7); g.fill(); g.fillStyle = mix(body, lit, 0.5); g.fillRect(71, 65, 2, 2);   /* the pulley block */
    for (let i = 0; i < 6; i++) { const sx = 48 + i * 7; rc(g, sx, 52, 1, 6 + (i * 5) % 7, mix(body, '#e8dcc0', 0.35)); rc(g, sx - 1, 58 + (i * 5) % 7, 3, 2, '#e8dcc0'); }   /* a row of trophy skulls on cords */
  }
  g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(0, 0, 0, LM_H); gr.addColorStop(0, 'rgba(' + T.haze + ',0.05)'); gr.addColorStop(1, 'rgba(' + T.haze + ',0.5)'); g.fillStyle = gr; g.fillRect(0, 0, LM_W, LM_H); g.globalCompositeOperation = 'source-over';
  return c; });

const SLOT = 250;
function hashI(i) { let h = Math.imul(i + 7919, 2654435761) >>> 0; h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0; return h >>> 8; }
/* a baked layer at the world's tone k (0 cold .. 1 warm): two bakes crossfaded */
function drawTone(g, bake, k, draw) { const [a, b, f] = tones(k); if (f < 0.04 || a === b) { draw(bake(a)); return; } if (f > 0.96) { draw(bake(b)); return; } draw(bake(a)); g.globalAlpha = f; draw(bake(b)); g.globalAlpha = 1; }
const glowAt = (g, x, y, r, a, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };

/* how far up the road the camera is: 0 at the start, 1 from the lookout on (the tints of src/rootway.js run the same way) */
export const toneAt = (cx, VW) => smooth(60, 330, (cx + VW / 2) / 16);

export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY, dusk) {
  const k = toneAt(cx, VW), base = VH - 40;
  /* SKY: three stops that warm with the road */
  { const [a, b, f] = tones(k), S0 = SKY[a], S1 = SKY[b], col = i => mix(S0[i], S1[i], f); const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, col(0)); gr.addColorStop(0.5, col(1)); gr.addColorStop(0.85, col(2)); gr.addColorStop(1, col(2)); g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
    /* a low sun on the left that comes up with the climb, its halo */
    const sx = Math.round(VW * 0.2 - cx * 0.02), sy = Math.round(base - 20 - 70 * k + Math.min(dY * 0.1, 30)); g.save(); g.globalCompositeOperation = 'lighter'; glowAt(g, sx, sy, 130, 0.16 + 0.22 * k, k < 0.5 ? '255,150,130' : '255,200,120'); g.restore();
    if (k > 0.15) { g.globalAlpha = 0.5 + 0.4 * k; g.fillStyle = k < 0.5 ? '#f0a888' : '#ffe7a8'; g.beginPath(); g.arc(sx, sy, 9 + 4 * k, 0, 7); g.fill(); g.globalAlpha = 1; } }
  /* FAR TRUNKS */
  { const w = 640, y = Math.round(base - 200 + 54 + Math.min(dY * 0.1, 30)); let x = ((-cx * 0.1) % w + w) % w; if (x > 0) x -= w; drawTone(g, farLayer, k, c => { for (let xx = x; xx < VW; xx += w) g.drawImage(c, Math.round(xx), y); }); }
  /* MID TRUNKS, vines and the goblins' lanterns */
  { const w = MID_W, y = Math.round(base - MID_H + 78 + Math.min(dY * 0.22, 56)); let x = ((-cx * 0.22) % w + w) % w; if (x > 0) x -= w;
    drawTone(g, midLayer, k, c => { for (let xx = x; xx < VW; xx += w) g.drawImage(c, Math.round(xx), y); });
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let xx = x; xx < VW; xx += w) for (const [lx, ly, ph] of LANTERNS) { const sx = Math.round(xx + lx), sy = y + ly + 3; if (sx < -30 || sx > VW + 30) continue; const f = 0.8 + 0.2 * Math.sin(time * 3 + ph) + 0.08 * Math.sin(time * 9.1 + ph * 2); glowAt(g, sx, sy, Math.round(26 * f), 0.22 + 0.1 * (1 - k), '255,190,100'); }
    g.restore(); }
  /* THE LANDMARKS: the great roots and the goblin gallows, every SLOT px of the world on the 0.34 layer */
  { const f = 0.34, off = cx * f, i0 = Math.floor((off - 80) / SLOT) - 1, y = Math.round(base + 36 - LM_H + Math.min(dY * f, 70));
    for (let i = i0; i <= i0 + Math.ceil((VW + 240) / SLOT) + 1; i++) { const v = [0, 1, 2, 1][((i % 4) + 4) % 4], wx = i * SLOT + 100 + ((hashI(i) % 60) - 30), sx = Math.round(wx - off - LM_W / 2); if (sx > VW + 10 || sx < -LM_W - 10) continue;
      drawTone(g, t => landmark(v, t), k, c => g.drawImage(c, sx, y));
      if (v === 1) {   /* the gallows' cage and rope, swaying */
        const sw = Math.sin(time * 0.9 + i) * 3, ch = 38 + Math.round(Math.sin(time * 0.5 + i) * 2), px = sx + 72, py = y + 66;
        const [a, b, ff] = tones(k), T = TONE[ff > 0.5 ? b : a]; g.strokeStyle = mix(T.lmB, '#c8a870', 0.45); g.lineWidth = 1; g.beginPath(); g.moveTo(px + 0.5, py); g.lineTo(px + sw + 0.5, py + ch); g.stroke();
        const cxm = px + sw, cyy = py + ch; g.fillStyle = mix(T.lmB, '#000000', 0.25); g.fillRect(Math.round(cxm - 8), Math.round(cyy), 16, 18); g.fillStyle = T.lmL; g.fillRect(Math.round(cxm - 8), Math.round(cyy), 16, 2); g.fillRect(Math.round(cxm - 8), Math.round(cyy + 16), 16, 2); for (let q = -6; q <= 6; q += 4) g.fillRect(Math.round(cxm + q), Math.round(cyy), 1, 18);
        g.fillStyle = 'rgba(255,190,100,0.5)'; g.fillRect(Math.round(cxm - 1), Math.round(cyy + 7), 3, 4); } } }
  /* the low haze of the forest floor and the warm air over it */
  { const [a, b, f] = tones(k), T0 = TONE[a], T1 = TONE[b], hz = T0.haze.split(',').map((v, i) => Math.round(lerp(+v, +T1.haze.split(',')[i], f))).join(','); const gr = g.createLinearGradient(0, base - 40, 0, VH); gr.addColorStop(0, 'rgba(' + hz + ',0)'); gr.addColorStop(1, 'rgba(' + hz + ',0.36)'); g.fillStyle = gr; g.fillRect(0, base - 40, VW, VH - base + 40); }
  /* LIGHT SHAFTS through the canopy (additive): the higher, the warmer and the stronger */
  { const kk = 0.35 + 0.65 * smooth(40, 280, (cx + VW / 2) / 16) + smooth(0, 160, dY) * 0.4; g.save(); g.globalCompositeOperation = 'lighter';
    for (let q = 0; q < 5; q++) { const x0 = ((q * 103 + 30 - cx * 0.05 + Math.sin(time * 0.06 + q) * 10) % (VW + 180) + VW + 180) % (VW + 180) - 60, w = 20 + q * 8, a0 = (0.04 + 0.014 * Math.sin(time * 0.4 + q * 2)) * kk;
      const gr = g.createLinearGradient(x0, 0, x0 - 80, VH); const col = k < 0.5 ? '255,190,170' : '255,214,140'; gr.addColorStop(0, 'rgba(' + col + ',0)'); gr.addColorStop(0.3, 'rgba(' + col + ',' + a0.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + w, 0); g.lineTo(x0 + w - 80, VH); g.lineTo(x0 - 80, VH); g.closePath(); g.fill(); }
    g.restore(); }
  /* THE CANOPY FRINGE: leaf-mass over the top of the frame when the camera is high in the tree */
  { const hi = smooth(150, 330, dY) * 0.85; if (hi > 0.02) { const c = fringe(k > 0.5 ? 1 : k > 0.2 ? 1 : 0); g.globalAlpha = hi; let x = ((-cx * 0.5) % c.width + c.width) % c.width; if (x > 0) x -= c.width; for (let xx = x; xx < VW; xx += c.width) g.drawImage(c, Math.round(xx), 0); g.globalAlpha = 1; } }
}
const fringe = tone => once('fr' + tone, () => { const W = 480, H = 60, [c, g] = mk(W, H), T = TONE[tone === 0 ? 0 : 2], r = mulberry(555 + tone);
  for (let i = 0; i < 22; i++) { const x = i * 22 + r() * 10, y = -6 + r() * 20, rad = 16 + r() * 18; g.fillStyle = mix(T.midC, '#000000', 0.5); g.beginPath(); g.ellipse(x, y + 4, rad, rad * 0.7, 0, 0, 7); g.fill(); g.fillStyle = mix(T.midC, '#000000', 0.2); g.beginPath(); g.ellipse(x, y, rad, rad * 0.65, 0, 0, 7); g.fill(); g.fillStyle = mix(T.midC, T.midL, 0.35); g.beginPath(); g.ellipse(x - 3, y - 3, rad * 0.6, rad * 0.35, 0, 0, 7); g.fill(); }
  return c; });
export const LANDMARK_SLOT = SLOT;
