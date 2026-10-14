// towpath_backdrop.js - THE TOWPATH's own backdrop (claude/towpath2art): the river road by NIGHT - a cold blue-green sky and a low moon, Waymeet's roofs behind the first
// screens fading to silhouette, then drowned willows, poplars, lock cottages with one lit window each, reed beds, a ruined arch standing far off (the aqueduct's
// foreshadow), mist at every layer's own pace. Palette: moonlit blue-green (#0c161a .. #3a5a5a), the lantern amber the only warm.
//   far  (0.15)  Waymeet's roofs and steeple at the west, the water-meadows' ridge, a treeline of poplars, a far mill chimney
//   mid  (0.30)  drowned willows, lock cottages (a lit window), hay ricks, a ruined arch, poplars, a far gibbet
//   near (0.60)  reeds and bulrushes along the foot, mooring posts
// Every static silhouette is baked ONCE on a long strip; each frame the visible part is copied, then the moon, lit windows and mist laid on top.
// Pure drawing: the only state is baked canvases (memo). drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full) and drawNear(g, cx, cy, VW, VH, L, time, dY).
import { mulberry } from '../px.js';
const TS = 16;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const poly = (g, pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(Math.round(x), Math.round(y)) : g.moveTo(Math.round(x), Math.round(y))); g.closePath(); g.fill(); };
export const FAR_F = 0.15, MID_F = 0.3, NEAR_F = 0.6, SPAN = 720;
const FAR_H = 100, FAR_GL = 80, MID_H = 120, MID_GL = 104, NEAR_H = 56, NEAR_GL = 50;
export const C = { sky: '#0c161a', ridge: '#16262c', ridge2: '#1c3036', field: '#1a2c30', fieldD: '#142226', roof: '#101a1e', roofL: '#1e3036', wall: '#18262c', wallL: '#24383e', moon: '#d8e8e4', moonD: '#a8c4c0',
  willow: '#0e1c1a', willowL: '#18302a', willowD: '#0a1412', poplar: '#102220', poplarL: '#183230', win: '#ffcf6a', winD: '#b88a3c', mist: '#8aa8aa', hay: '#2a3226', hayL: '#3a4632',
  stone: '#1c2c32', stoneL: '#2c444a', reed: '#122a22', reedL: '#1e4232', post: '#1c2022', rope: '#4a4a3a' };

function layout(LW) {
  return once('layout' + LW, () => {
    const wFar = Math.ceil(LW * TS * FAR_F) + SPAN + 160, wMid = Math.ceil(LW * TS * MID_F) + SPAN + 260, wNear = Math.ceil(LW * TS * NEAR_F) + SPAN + 260;
    const rf = mulberry(8123), rm = mulberry(3377), rn = mulberry(6151);
    const ridge = x => 40 + 7 * Math.sin(x * 0.009 + 0.9) + 4 * Math.sin(x * 0.026 + 2.1), field = x => FAR_GL - 2 + 1.5 * Math.sin(x * 0.02) + Math.sin(x * 0.05 + 2);
    const far = { poplars: [], roofs: [], chim: [] };
    for (let x = 300; x < wFar - 30; x += 18 + Math.floor(rf() * 34)) far.poplars.push({ x, h: 16 + Math.floor(rf() * 16), w: 2 + Math.floor(rf() * 2) });
    for (let x = 10; x < 330; x += 20 + Math.floor(rf() * 14)) far.roofs.push({ x, w: 22 + Math.floor(rf() * 14), h: 12 + Math.floor(rf() * 14) });   /* WAYMEET's roofs, behind the lane at the start */
    far.chim.push({ x: 700 }, { x: 1500 });
    const mid = { items: [], lights: [] };
    let x = 24;
    while (x < wMid - 60) { const t = rm(); let w;
      if (t < 0.34) { w = 40 + Math.floor(rm() * 20); mid.items.push({ k: 'willow', x: x + w / 2, w, h: 30 + Math.floor(rm() * 16), sd: rm() * 99 }); }
      else if (t < 0.5) { w = 30 + Math.floor(rm() * 8); const h = 22 + Math.floor(rm() * 8); mid.items.push({ k: 'cottage', x: x + w / 2, w, h }); mid.lights.push({ x: x + 6 + Math.floor(rm() * (w - 14)), y: MID_GL - h * 0.5, r: 12, amp: 0.5, ph: rm() * 6 }); }
      else if (t < 0.62) { w = 16 + Math.floor(rm() * 6); mid.items.push({ k: 'rick', x: x + w / 2, w }); }
      else if (t < 0.74) { w = 46; mid.items.push({ k: 'ruin', x: x + w / 2, w, h: 40 + Math.floor(rm() * 10) }); }
      else if (t < 0.9) { w = 14; mid.items.push({ k: 'poplar', x: x + 7, w, h: 38 + Math.floor(rm() * 18) }); }
      else { w = 12; mid.items.push({ k: 'gibbet', x: x + 6, w }); }
      x += w + 10 + Math.floor(rm() * 30); }
    const near = { items: [] };
    for (let x = 30; x < wNear - 30; x += 40 + Math.floor(rn() * 90)) { const t = rn(); near.items.push(t < 0.7 ? { k: 'reeds', x, n: 3 + Math.floor(rn() * 5), sd: rn() * 99 } : { k: 'post', x, h: 14 + Math.floor(rn() * 8) }); }
    return { wFar, wMid, wNear, ridge, field, far, mid, near };
  });
}
function blob() { return once('blob', () => { const w = 160, h = 40, [c, g] = mk(w, h); const gr = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(150,176,178,0.5)'); gr.addColorStop(0.55, 'rgba(150,176,178,0.2)'); gr.addColorStop(1, 'rgba(150,176,178,0)');
  g.save(); g.translate(w / 2, h / 2); g.scale(1, h / w); g.translate(-w / 2, -w / 2); g.fillStyle = gr; g.fillRect(0, 0, w, w); g.restore(); return c; }); }
function fadeBase(g, w, h, from, a) { const gr = g.createLinearGradient(0, from, 0, h); gr.addColorStop(0, 'rgba(110,140,142,0)'); gr.addColorStop(1, 'rgba(110,140,142,' + a + ')'); g.fillStyle = gr; g.fillRect(0, from, w, h - from); }

function farStrip(LW) {
  return once('far' + LW, () => { const Ly = layout(LW), w = Ly.wFar, [c, g] = mk(w, FAR_H);
    for (let x = 0; x < w; x += 2) { const y = Ly.ridge(x); rc(g, x, y, 2, FAR_GL - y, C.ridge); if ((x >> 1) % 9 === 0) rc(g, x, y + 4, 2, 1, C.ridge2); }
    for (let x = 0; x < w; x++) { const y = Math.round(Ly.field(x)); rc(g, x, y, 1, FAR_H - y, C.field); }
    for (const p of Ly.far.poplars) { const gy = Math.round(Ly.field(p.x)) + 1; for (let i = 0; i < p.h; i++) { const k = i / p.h, hw = Math.max(1, Math.round((p.w + 1) * Math.sin(Math.PI * Math.min(1, k * 0.9 + 0.1)))); rc(g, p.x - hw, gy - i, hw * 2, 1, C.poplar); } rc(g, p.x - 1, gy - 2, 2, 3, C.poplar); }
    /* WAYMEET: gabled roofs and a steeple, going to silhouette (the town the hero left) - a pale rim on the moon side */
    for (const r of Ly.far.roofs) { const gy = Math.round(Ly.field(r.x)) + 2; rc(g, r.x, gy - r.h, r.w, r.h, C.roof); poly(g, [[r.x - 2, gy - r.h], [r.x + r.w + 2, gy - r.h], [r.x + r.w / 2 + 3, gy - r.h - 9], [r.x + r.w / 2 - 3, gy - r.h - 9]], C.roof);
      rc(g, r.x - 2, gy - r.h - 1, r.w + 4, 1, C.roofL); rc(g, r.x + 3, gy - r.h - 14, 3, 7, C.roof); if (r.x % 3 === 0) rc(g, r.x + 5, gy - r.h + 4, 2, 2, C.winD); }
    { const sx = 140, gy = Math.round(Ly.field(sx)) + 2; rc(g, sx - 4, gy - 50, 8, 40, C.roof); rc(g, sx - 3, gy - 50, 1, 40, C.roofL); poly(g, [[sx - 5, gy - 50], [sx + 5, gy - 50], [sx, gy - 70]], C.roof); rc(g, sx, gy - 78, 1, 8, C.roof); rc(g, sx - 2, gy - 75, 5, 1, C.roof);
      rc(g, sx - 1, gy - 42, 3, 6, C.sky); }
    for (const m of Ly.far.chim) { const gy = Math.round(Ly.field(m.x)) + 1; poly(g, [[m.x - 3, gy], [m.x + 3, gy], [m.x + 2, gy - 36], [m.x - 2, gy - 36]], C.roof); rc(g, m.x - 3, gy - 38, 6, 2, C.roofL); rc(g, m.x - 12, gy - 10, 24, 10, C.roof); }
    fadeBase(g, w, FAR_H, FAR_GL - 26, 0.5); return c; });
}
function midStrip(LW) {
  return once('mid' + LW, () => { const Ly = layout(LW), w = Ly.wMid, [c, g] = mk(w, MID_H), gy = MID_GL; rc(g, 0, gy, w, MID_H - gy, C.willowD);
    for (const it of Ly.mid.items) { const x0 = Math.round(it.x - it.w / 2), r = mulberry(Math.floor(it.sd || it.x));
      if (it.k === 'willow') { rc(g, it.x - 2, gy - it.h * 0.55, 4, it.h * 0.55, C.willowD); for (let a = 0; a < 9; a++) { const sx = it.x + (a - 4) * 4, len = 12 + Math.floor(r() * (it.h * 0.5)); rc(g, sx, gy - it.h + Math.abs(a - 4) * 2, 2, len, a & 1 ? C.willow : C.willowL); }
        rc(g, it.x - 20, gy - it.h, 40, 4, C.willow); rc(g, it.x - 14, gy - it.h - 3, 28, 4, C.willowL); rc(g, it.x - 8, gy - it.h - 5, 16, 3, C.willow); }
      else if (it.k === 'cottage') { rc(g, x0, gy - it.h, it.w, it.h, C.wall); rc(g, x0, gy - it.h, it.w, 1, C.wallL); poly(g, [[x0 - 3, gy - it.h], [x0 + it.w + 3, gy - it.h], [x0 + it.w / 2 + 3, gy - it.h - 11], [x0 + it.w / 2 - 3, gy - it.h - 11]], C.roof);
        rc(g, x0 + it.w - 8, gy - it.h - 14, 4, 8, C.wall); rc(g, x0 + 4, gy - 11, 5, 11, C.willowD); }
      else if (it.k === 'rick') { for (let i = 0; i < 12; i++) { const k = i / 12, hw = Math.round(it.w / 2 * (1 - k * k)); rc(g, it.x - hw, gy - i, hw * 2, 1, i % 3 ? C.hay : C.hayL); } }
      else if (it.k === 'ruin') { const x1 = x0 + it.w; rc(g, x0, gy - it.h, 8, it.h, C.stone); rc(g, x0, gy - it.h, 8, 2, C.stoneL); rc(g, x1 - 8, gy - it.h + 10, 8, it.h - 10, C.stone); rc(g, x1 - 8, gy - it.h + 10, 8, 2, C.stoneL);
        for (let x = x0 + 8; x < x1 - 8; x++) { const t = (x - x0 - 8) / (it.w - 16), yy = gy - it.h + 4 + Math.round(10 * Math.sin(Math.PI * t) * -1 + 10); rc(g, x, yy, 1, 4, C.stone); } }
      else if (it.k === 'poplar') { for (let i = 0; i < it.h; i++) { const k = i / it.h, hw = Math.max(1, Math.round(4 * Math.sin(Math.PI * Math.min(1, k * 0.9 + 0.1)))); rc(g, it.x - hw, gy - 6 - i, hw * 2, 1, (i + it.x) % 4 ? C.poplar : C.poplarL); } rc(g, it.x - 1, gy - 6, 2, 6, C.willowD); }
      else if (it.k === 'gibbet') { rc(g, it.x - 1, gy - 30, 2, 30, C.willowD); rc(g, it.x - 1, gy - 30, 12, 2, C.willowD); rc(g, it.x + 9, gy - 28, 1, 8, C.willowD); rc(g, it.x + 6, gy - 20, 7, 9, C.willowD); } }
    fadeBase(g, w, MID_H, MID_GL - 30, 0.45); return c; });
}
function nearStrip(LW) {
  return once('near' + LW, () => { const Ly = layout(LW), w = Ly.wNear, [c, g] = mk(w, NEAR_H), gy = NEAR_GL;
    for (const it of Ly.near.items) { const r = mulberry(Math.floor(it.sd || it.x));
      if (it.k === 'reeds') { for (let i = 0; i < it.n * 3; i++) { const x = it.x + i * 3 + Math.floor(r() * 2), h = 16 + Math.floor(r() * 22); rc(g, x, gy - h, 1, h, i % 3 ? C.reed : C.reedL); if (r() < 0.4) { rc(g, x - 1, gy - h - 5, 3, 6, '#1a2a1e'); } } }
      else { rc(g, it.x, gy - it.h, 5, it.h, C.post); rc(g, it.x - 1, gy - it.h - 2, 7, 2, '#2c3438'); } }
    fadeBase(g, w, NEAR_H, NEAR_GL - 22, 0.35); return c; });
}
const SC = (() => { let s = null; return (w, h) => { if (!s || s[0].width !== w || s[0].height !== h) s = mk(w, h); return s; }; })();
function glow(g, x, y, r, a, col = '255,207,106') { if (a <= 0.01) return; const gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
function mist(g, VW, y, count, speed, cx, f, time, a, seed) {
  const b = blob(), span = VW + 360;
  for (let i = 0; i < count; i++) { const sd = (i * 97 + seed) % 211, x = ((sd * 3.1 - cx * f + time * speed * (0.6 + (sd % 7) / 10)) % span + span) % span - 180, yy = y + ((sd % 5) - 2) * 7 + Math.sin(time * 0.15 + sd) * 2;
    g.globalAlpha = a * (0.7 + 0.3 * Math.sin(time * 0.2 + sd * 1.7)); g.drawImage(b, Math.round(x), Math.round(yy), 160 + (sd % 4) * 40, 36 + (sd % 3) * 8); }
  g.globalAlpha = 1;
}
/* THE MOON: a pale disc with a halo, low in the sky and a touch of parallax; its cold light is the only light on the sky */
function moon(g, VW, VH, cx, time) {
  const mx = Math.round(VW * 0.74 - cx * 0.02), my = Math.round(VH * 0.2);
  glow(g, mx, my, 62, 0.22, '190,225,225'); glow(g, mx, my, 30, 0.3, '210,236,232');
  g.fillStyle = C.moon; g.beginPath(); g.arc(mx, my, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = C.moonD; for (const [dx, dy, r] of [[-3, -2, 3], [3, 3, 2], [4, -4, 1.5]]) { g.beginPath(); g.arc(mx + dx, my + dy, r, 0, Math.PI * 2); g.fill(); }
  const r = mulberry(404); g.fillStyle = '#c8dcd8'; for (let i = 0; i < 38; i++) { const x = Math.round(r() * VW - cx * 0.01), y = Math.round(r() * VH * 0.5), tw = 0.5 + 0.5 * Math.sin(time * (0.6 + r()) + i); g.globalAlpha = 0.25 + 0.5 * tw; g.fillRect(((x % VW) + VW) % VW, y, 1, 1); } g.globalAlpha = 1;
}
export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full) {
  const Ly = layout(L.W);
  moon(g, VW, VH, cx, time);
  if (full) { const off = Math.round(cx * FAR_F), gl = Math.round(VH - 100 + dY * FAR_F), y0 = gl - FAR_GL, s = SC(VW, VH);
    s[1].clearRect(0, 0, VW, VH); s[1].drawImage(farStrip(L.W), off, 0, Math.min(VW, Ly.wFar - off), FAR_H, 0, y0, Math.min(VW, Ly.wFar - off), FAR_H); s[1].fillStyle = '#16282c'; s[1].fillRect(0, y0 + FAR_H - 1, VW, VH); g.drawImage(s[0], 0, 0);
    for (const m of Ly.far.chim) { const mx = m.x - off; if (mx < -50 || mx > VW + 50) continue; const gy = y0 + Math.round(Ly.field(m.x)) + 1, hy = gy - 40;
      for (let i = 0; i < 5; i++) { const u = ((time * 0.1 + i / 5 + m.x) % 1); g.globalAlpha = 0.16 * (1 - u); g.fillStyle = '#5a7274'; g.beginPath(); g.ellipse(mx + u * 24, hy - u * 18, 3 + u * 8, 2 + u * 4, 0, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1; }
    mist(g, VW, y0 + FAR_GL - 6, 3, 2.5, cx, FAR_F, time, 0.3, 11); }
  { const off = Math.round(cx * MID_F), gl = Math.round(VH - 118 + dY * MID_F), y0 = gl - MID_GL, s = SC(VW, VH);
    s[1].clearRect(0, 0, VW, VH); s[1].drawImage(midStrip(L.W), off, 0, Math.min(VW, Ly.wMid - off), MID_H, 0, y0, Math.min(VW, Ly.wMid - off), MID_H); s[1].fillStyle = '#0a1214'; s[1].fillRect(0, y0 + MID_H - 1, VW, VH); g.drawImage(s[0], 0, 0);
    for (const l of Ly.mid.lights) { const x = l.x - off, y = y0 + l.y; if (x < -30 || x > VW + 30) continue; const fl = 0.85 + 0.15 * Math.sin(time * 6 + l.ph * 3 + l.x); glow(g, x, y, l.r, 0.5 * l.amp * fl);
      g.fillStyle = C.win; g.globalAlpha = 0.9 * fl; g.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 4); g.globalAlpha = 1; }
    mist(g, VW, y0 + MID_GL - 4, 4, 4, cx, MID_F, time, 0.36, 47); }
}
export function drawNear(g, cx, cy, VW, VH, L, time, dY) {
  const Ly = layout(L.W), off = Math.round(cx * NEAR_F), gl = Math.round(VH - 24 + dY * NEAR_F), y0 = gl - NEAR_GL;
  g.globalAlpha = 0.5; g.drawImage(nearStrip(L.W), off, 0, Math.min(VW, Ly.wNear - off), NEAR_H, 0, y0, Math.min(VW, Ly.wNear - off), NEAR_H); g.globalAlpha = 1;
}
