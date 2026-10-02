// canal_backdrop.js - THE FOG CANAL's own backdrop (claude/canalart). It used to borrow Waymeet's `town` parallax; the canal is a night waterway and gets its own:
//   far  (0.15)  misty fields under a low moon-grey sky, a row of poplars, a distant mill with its sails, and WAYMEET's steeple behind (the town the hero left)
//   mid  (0.30)  the towpath's hedges, lock cottages with a lit window, moored narrowboats (a lantern at the stern, a stripe of paint), a warehouse back with its hoist
//   near (0.60)  reeds, mooring posts with a rope ring, and posts with a hung lantern whose amber is the only warm light up front
//   mist         soft banks (a baked feathered blob) drifting at each layer's own pace; the base of every layer fades into mist so the ground never ends in a hard line
// Palette: night, blue-grey (#16222a .. #3a4c54), lantern amber (#ffcf6a) the only warm; the theatre's far glow is the fog's own (canal-hands.js drawCanalFog).
// Every static silhouette is baked ONCE on a long strip; each frame the visible part is copied, then the lit windows and lanterns are laid on top and flicker.
// Pure drawing: the only state is baked canvases (memo). drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full) and drawNear(g, cx, cy, VW, L, time, dY).
import { mulberry } from '../px.js';
const TS = 16;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const poly = (g, pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(Math.round(x), Math.round(y)) : g.moveTo(Math.round(x), Math.round(y))); g.closePath(); g.fill(); };
const lerp = (a, b, t) => a + (b - a) * t;
export const FAR_F = 0.15, MID_F = 0.3, NEAR_F = 0.6, SPAN = 720;
const FAR_H = 96, FAR_GL = 72, MID_H = 130, MID_GL = 112, NEAR_H = 64, NEAR_GL = 56;
/* (claude/canalfix3) the far layer is now the town's roofs and mill chimneys, the mid layer brick terraces, the near layer railings and bollards: a night city */
export const C = { sky: '#10181e', ridge: '#1b2931', ridge2: '#223239', field: '#26373d', fieldD: '#1f2e34', furrow: '#2c3e44', poplar: '#15222a', poplar2: '#1a2a32',
  mill: '#18262e', millL: '#22343c', hedge: '#1b2a2c', hedgeL: '#233638', hedgeD: '#142022', wall: '#2a3338', wallL: '#36424a', roof: '#1a2228', roofL: '#26323a', brick: '#3a2a2c', brickL: '#4a3636',
  win: '#ffcf6a', winD: '#b88a3c', mist: '#7f989c', hull: '#202830', hullL: '#2c3640', cabin: '#34404a', stripeR: '#6a2c2c', stripeG: '#2c5a50', stripeY: '#8a6a2c', reed: '#243a32', reedL: '#34503e', post: '#2a2420', rope: '#6a5a40' };

/* ---- the layout: where everything stands, once per level width (mulberry-seeded so the picture is the same every run) ---- */
function layout(LW) {
  return once('layout' + LW, () => {
    const wFar = Math.ceil(LW * TS * FAR_F) + SPAN + 160, wMid = Math.ceil(LW * TS * MID_F) + SPAN + 260, wNear = Math.ceil(LW * TS * NEAR_F) + SPAN + 260;
    const rf = mulberry(5117), rm = mulberry(7331), rn = mulberry(2909);
    const ridge = x => 30 + 6 * Math.sin(x * 0.011 + 0.4) + 3 * Math.sin(x * 0.029 + 1.7), field = x => FAR_GL - 2 + 1.5 * Math.sin(x * 0.021) + Math.sin(x * 0.057 + 2);
    const far = { poplars: [], mills: [], steeples: [], lights: [] };
    for (let x = 30; x < wFar - 30; x += 22 + Math.floor(rf() * 40)) far.poplars.push({ x, h: 20 + Math.floor(rf() * 14), w: 4 + Math.floor(rf() * 2) });
    for (let x = 260; x < wFar - 100; x += 520 + Math.floor(rf() * 260)) far.mills.push({ x, h: 34 + Math.floor(rf() * 8), ph: rf() * 6 });
    far.steeples.push({ x: 150 }, { x: Math.floor(wFar * 0.55) });   /* WAYMEET's, behind at the start (the town the hero left) and again, small, far on - the old town's own */
    const mid = { items: [], lights: [], stern: [] };
    let x = 24;
    while (x < wMid - 60) {
      const t = rm(); let w;
      if (t < 0.3) { w = 60 + Math.floor(rm() * 70); mid.items.push({ k: 'hedge', x: x + w / 2, w, h: 12 + Math.floor(rm() * 8), sd: rm() * 99 }); }
      else if (t < 0.5) { w = 34 + Math.floor(rm() * 8); const h = 28 + Math.floor(rm() * 10); mid.items.push({ k: 'cottage', x: x + w / 2, w, h, sd: rm() * 99 }); mid.lights.push({ x: x + 8 + Math.floor(rm() * (w - 16)), y: MID_GL - h * 0.55, r: 14, amp: 0.7 + rm() * 0.3, ph: rm() * 6 }); }
      else if (t < 0.78) { w = 56 + Math.floor(rm() * 10); const col = rm() < 0.4 ? C.stripeR : rm() < 0.5 ? C.stripeG : C.stripeY; mid.items.push({ k: 'boat', x: x + w / 2, w, col, sd: rm() * 99 }); if (rm() < 0.7) mid.lights.push({ x: x + 6, y: MID_GL - 17, r: 12, amp: 0.8, ph: rm() * 6, lantern: true }); }
      else if (t < 0.9) { w = 40 + Math.floor(rm() * 14); mid.items.push({ k: 'warehouse', x: x + w / 2, w, h: 46 + Math.floor(rm() * 12), sd: rm() * 99 }); mid.lights.push({ x: x + w * 0.3, y: MID_GL - 24, r: 12, amp: 0.55, ph: rm() * 6 }); }
      else { w = 16; mid.items.push({ k: 'tree', x: x + 8, w, h: 34 + Math.floor(rm() * 14) }); }
      x += w + 8 + Math.floor(rm() * 26);
    }
    const near = { items: [], lights: [] };
    for (let x = 40; x < wNear - 30; x += 54 + Math.floor(rn() * 110)) { const t = rn();
      if (t < 0.5) near.items.push({ k: 'reeds', x, n: 3 + Math.floor(rn() * 4), sd: rn() * 99 });
      else if (t < 0.8) near.items.push({ k: 'post', x, h: 20 + Math.floor(rn() * 8), rope: rn() < 0.6 });
      else { near.items.push({ k: 'lantern', x, h: 36 + Math.floor(rn() * 8) }); near.lights.push({ x: x + 5, y: NEAR_GL - 40, r: 20, ph: rn() * 6 }); } }
    return { wFar, wMid, wNear, ridge, field, far, mid, near };
  });
}

/* ---- the mist: a feathered blob baked once (soft in both directions), laid on drifting; and the fade a strip ends in ---- */
function blob(kind) {
  return once('blob' + kind, () => { const w = 160, h = 40, [c, g] = mk(w, h); const gr = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(150,172,176,0.5)'); gr.addColorStop(0.55, 'rgba(150,172,176,0.2)'); gr.addColorStop(1, 'rgba(150,172,176,0)');
    g.save(); g.translate(w / 2, h / 2); g.scale(1, h / w); g.translate(-w / 2, -w / 2); g.fillStyle = gr; g.fillRect(0, 0, w, w); g.restore(); return c; });
}
function fadeBase(g, w, h, from, a) { const gr = g.createLinearGradient(0, from, 0, h); gr.addColorStop(0, 'rgba(127,152,156,0)'); gr.addColorStop(1, 'rgba(127,152,156,' + a + ')'); g.fillStyle = gr; g.fillRect(0, from, w, h - from); }

/* ---- FAR: fields, poplars, mills, steeples ---- */
function farStrip(LW) {
  return once('far' + LW, () => { const Ly = layout(LW), w = Ly.wFar, [c, g] = mk(w, FAR_H);
    for (let x = 0; x < w; x += 2) { const y = Ly.ridge(x); rc(g, x, y, 2, FAR_GL - y, C.ridge); if ((x >> 1) % 7 === 0) rc(g, x, y + 4, 2, 1, C.ridge2); }
    for (let x = 0; x < w; x += 2) { const y = Ly.ridge(x * 0.7 + 90) + 12; rc(g, x, y, 2, FAR_GL - y, C.ridge2); }
    for (let x = 0; x < w; x++) { const y = Math.round(Ly.field(x)); rc(g, x, y, 1, FAR_H - y, C.field); }
    const rr = mulberry(31); for (let x = 0; x < w; x += 3) { const y = Math.round(Ly.field(x)) + 3 + Math.floor(rr() * 12); rc(g, x, y, 5 + Math.floor(rr() * 8), 1, rr() < 0.5 ? C.furrow : C.fieldD); }
    /* (claude/canalfix3, Daniel 10-02: a NIGHT CITY, not fields) the town's roofs: gabled terraces and their chimney stacks, where the poplars stood */
    for (const p of Ly.far.poplars) { const gy = Math.round(Ly.field(p.x)) + 1, hw = 8 + p.w * 2, h = 8 + Math.round(p.h * 0.5); rc(g, p.x - hw, gy - h, hw * 2, h, C.poplar); rc(g, p.x - hw, gy - h, hw * 2, 1, C.poplar2);
      poly(g, [[p.x - hw - 1, gy - h], [p.x + hw + 1, gy - h], [p.x + hw - 4, gy - h - 6], [p.x - hw + 4, gy - h - 6]], C.roof); rc(g, p.x + hw - 7, gy - h - 11, 3, 6, C.poplar); rc(g, p.x + hw - 8, gy - h - 12, 5, 1, C.poplar2); rc(g, p.x - hw + 4, gy - h - 9, 2, 4, C.poplar);
      if ((p.x >> 3) % 3 === 0) rc(g, p.x - 3, gy - h + 4, 2, 2, C.winD); }
    for (const m of Ly.far.mills) { const gy = Math.round(Ly.field(m.x)) + 1, h = m.h + 14; poly(g, [[m.x - 4, gy], [m.x + 4, gy], [m.x + 2, gy - h], [m.x - 2, gy - h]], C.mill); rc(g, m.x - 3, gy - h * 0.8, 1, h * 0.8, C.millL);   /* a mill chimney */
      rc(g, m.x - 3, gy - h - 2, 6, 2, C.millL); rc(g, m.x - 3, gy - h * 0.55, 6, 1, C.millL); rc(g, m.x - 14, gy - 12, 28, 12, C.mill); rc(g, m.x - 14, gy - 12, 28, 1, C.millL); for (let k = 0; k < 4; k++) rc(g, m.x - 11 + k * 7, gy - 8, 2, 3, C.winD); }
    for (const s of Ly.far.steeples) { const gy = Math.round(Ly.field(s.x)) + 2; rc(g, s.x - 12, gy - 14, 24, 14, C.mill); rc(g, s.x - 12, gy - 14, 24, 1, C.millL); poly(g, [[s.x - 13, gy - 14], [s.x + 13, gy - 14], [s.x, gy - 24]], C.roof);
      rc(g, s.x - 4, gy - 38, 8, 24, C.mill); rc(g, s.x - 3, gy - 38, 1, 24, C.millL); poly(g, [[s.x - 5, gy - 38], [s.x + 5, gy - 38], [s.x, gy - 56]], C.roof); rc(g, s.x, gy - 62, 1, 7, C.mill); rc(g, s.x - 2, gy - 60, 5, 1, C.mill);
      rc(g, s.x - 1, gy - 32, 3, 5, C.sky); rc(g, s.x - 10, gy - 10, 3, 5, C.sky); rc(g, s.x + 7, gy - 10, 3, 5, C.sky); }
    fadeBase(g, w, FAR_H, FAR_GL - 24, 0.55); return c; });
}
/* ---- MID: hedges, cottages, boats, warehouses ---- */
function midStrip(LW) {
  return once('mid' + LW, () => { const Ly = layout(LW), w = Ly.wMid, [c, g] = mk(w, MID_H), gy = MID_GL; rc(g, 0, gy, w, MID_H - gy, C.hedgeD);
    for (const it of Ly.mid.items) { const x0 = Math.round(it.x - it.w / 2), r = mulberry(Math.floor(it.sd || 1));
      if (it.k === 'hedge') { const hh = it.h + 22; rc(g, x0, gy - hh, it.w, hh, C.brick); rc(g, x0, gy - hh, it.w, 2, C.brickL); poly(g, [[x0 - 2, gy - hh], [x0 + it.w + 2, gy - hh], [x0 + it.w - 6, gy - hh - 8], [x0 + 6, gy - hh - 8]], C.roof);   /* (claude/canalfix3) a brick terrace where a hedge stood */
        for (let i = 6; i < it.w - 6; i += 12) { rc(g, x0 + i, gy - hh + 6, 5, 7, C.roof); rc(g, x0 + i, gy - hh + 17, 5, 7, C.roof); rc(g, x0 + i + 2, gy - hh - 12, 3, 6, C.brick); }
        for (let i = 0; i < it.w; i += 4) rc(g, x0 + i, gy - 7, 1, 7, C.hedgeD); rc(g, x0, gy - 7, it.w, 1, C.hedgeD); rc(g, x0, gy - 3, it.w, 1, C.hedgeD); }   /* its area railing */
      else if (it.k === 'cottage') { rc(g, x0, gy - it.h, it.w, it.h, C.wall); rc(g, x0, gy - it.h, it.w, 1, C.wallL); poly(g, [[x0 - 3, gy - it.h], [x0 + it.w + 3, gy - it.h], [x0 + it.w / 2 + 4, gy - it.h - 14], [x0 + it.w / 2 - 4, gy - it.h - 14]], C.roof);
        rc(g, x0 + it.w - 9, gy - it.h - 18, 4, 9, C.brick); rc(g, x0 + it.w - 10, gy - it.h - 19, 6, 1, C.brickL); rc(g, x0 + 5, gy - 14, 6, 14, C.hedgeD); rc(g, x0 + it.w - 14, gy - it.h * 0.65, 6, 8, C.roof);
        for (let i = 0; i < it.w; i += 4) rc(g, x0 + i, gy - it.h + 3, 1, it.h - 6, C.wallL); }
      else if (it.k === 'boat') { const hull = it.w, hy = gy - 4; poly(g, [[x0 - 3, hy - 6], [x0 + hull + 4, hy - 6], [x0 + hull - 2, hy + 3], [x0 + 3, hy + 3]], C.hull); rc(g, x0 - 3, hy - 6, hull + 7, 1, C.hullL); rc(g, x0 + 2, hy - 3, hull - 3, 2, it.col);
        rc(g, x0 + 6, hy - 14, 26, 8, C.cabin); rc(g, x0 + 6, hy - 14, 26, 1, C.hullL); rc(g, x0 + 9, hy - 12, 4, 3, C.sky); rc(g, x0 + 16, hy - 12, 4, 3, C.sky); rc(g, x0 + 23, hy - 12, 4, 3, C.sky); rc(g, x0 + 28, hy - 18, 3, 4, C.post);
        for (let i = 0; i < 4; i++) rc(g, x0 + 36 + i * 5, hy - 8, 4, 2, C.hullL); rc(g, x0 + hull - 4, hy - 9, 1, 5, C.post); rc(g, x0 - 2, hy - 7, 1, 1, C.rope); }
      else if (it.k === 'warehouse') { rc(g, x0, gy - it.h, it.w, it.h, C.brick); rc(g, x0, gy - it.h, it.w, 2, C.brickL); poly(g, [[x0 - 2, gy - it.h], [x0 + it.w + 2, gy - it.h], [x0 + it.w, gy - it.h - 9], [x0, gy - it.h - 9]], C.roof);
        rc(g, x0 + it.w - 12, gy - 20, 8, 20, C.hedgeD); rc(g, x0 + 4, gy - it.h * 0.7, 5, 7, C.roof); rc(g, x0 + 4, gy - it.h * 0.4, 5, 7, C.roof);
        rc(g, x0 + it.w - 3, gy - it.h - 9, 1, 14, C.post); rc(g, x0 + it.w - 3, gy - it.h - 9, 9, 1, C.post); rc(g, x0 + it.w + 5, gy - it.h - 9, 1, 5, C.post); /* the hoist */
        for (let i = 4; i < it.w; i += 7) for (let j = 4; j < it.h - 2; j += 5) if (r() < 0.5) rc(g, x0 + i, gy - j, 5, 1, '#31201f'); }
      else if (it.k === 'tree') { rc(g, it.x - 1, gy - 10, 2, 10, C.hedgeD); for (let i = 0; i < it.h; i++) { const k = i / it.h, hw = Math.max(1, Math.round(5 * Math.sin(Math.PI * Math.min(1, k * 0.95 + 0.05)))); rc(g, it.x - hw, gy - 8 - i, hw * 2, 1, (i + it.x) % 4 ? C.hedge : C.hedgeL); } } }
    fadeBase(g, w, MID_H, MID_GL - 30, 0.5); return c; });
}
/* ---- NEAR: reeds, posts, hung lanterns ---- */
function nearStrip(LW) {
  return once('near' + LW, () => { const Ly = layout(LW), w = Ly.wNear, [c, g] = mk(w, NEAR_H), gy = NEAR_GL;
    for (const it of Ly.near.items) { const r = mulberry(Math.floor(it.sd || it.x));
      if (it.k === 'reeds') { const w = it.n * 8 + 8; for (let i = 0; i <= w; i += 4) { rc(g, it.x + i, gy - 22, 1, 22, C.post); rc(g, it.x + i, gy - 24, 1, 2, '#3a4048'); } rc(g, it.x, gy - 20, w + 1, 1, C.post); rc(g, it.x, gy - 8, w + 1, 1, C.post); }   /* (claude/canalfix3) an iron railing, not reeds */
      else if (it.k === 'post') { rc(g, it.x, gy - 12, 6, 12, '#20262c'); rc(g, it.x - 1, gy - 14, 8, 2, '#2c3238'); rc(g, it.x - 1, gy - 14, 8, 1, '#4a525a'); if (it.rope) { rc(g, it.x + 6, gy - 9, 5, 1, C.rope); rc(g, it.x + 10, gy - 8, 1, 4, C.rope); } }   /* an iron bollard */
      else if (it.k === 'lantern') { rc(g, it.x, gy - it.h, 3, it.h, C.post); rc(g, it.x, gy - it.h, 9, 2, C.post); rc(g, it.x + 7, gy - it.h, 1, 4, C.post); rc(g, it.x + 5, gy - it.h + 4, 5, 6, '#3a2a14'); rc(g, it.x + 6, gy - it.h + 5, 3, 4, '#ffcf6a'); rc(g, it.x + 5, gy - it.h + 3, 5, 1, C.post); } }
    fadeBase(g, w, NEAR_H, NEAR_GL - 24, 0.4); return c; });
}
const SC = (() => { let s = null; return (w, h) => { if (!s || s[0].width !== w || s[0].height !== h) s = mk(w, h); return s; }; })();
function glow(g, x, y, r, a, col = '255,207,106') { if (a <= 0.01) return; const gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
/* a slow bank of mist at one layer's pace: x slides with the camera and with a drift of its own, wraps over the strip */
function mist(g, VW, y, count, speed, cx, f, time, a, seed) {
  const b = blob('a'), span = VW + 360;
  for (let i = 0; i < count; i++) { const sd = (i * 97 + seed) % 211, x = ((sd * 3.1 - cx * f + time * speed * (0.6 + (sd % 7) / 10)) % span + span) % span - 180, yy = y + ((sd % 5) - 2) * 7 + Math.sin(time * 0.15 + sd) * 2;
    g.globalAlpha = a * (0.7 + 0.3 * Math.sin(time * 0.2 + sd * 1.7)); g.drawImage(b, Math.round(x), Math.round(yy), 160 + (sd % 4) * 40, 36 + (sd % 3) * 8); }
  g.globalAlpha = 1;
}
export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full) {
  const Ly = layout(L.W);
  if (full) { const off = Math.round(cx * FAR_F), gl = Math.round(VH - 100 + dY * FAR_F), y0 = gl - FAR_GL, s = SC(VW, VH);
    s[1].clearRect(0, 0, VW, VH); s[1].drawImage(farStrip(L.W), off, 0, Math.min(VW, Ly.wFar - off), FAR_H, 0, y0, Math.min(VW, Ly.wFar - off), FAR_H); s[1].fillStyle = '#273a3f'; s[1].fillRect(0, y0 + FAR_H - 1, VW, VH); g.drawImage(s[0], 0, 0);
    for (const m of Ly.far.mills) { const mx = m.x - off; if (mx < -50 || mx > VW + 50) continue; const gy = y0 + Math.round(Ly.field(m.x)) + 1, hy = gy - m.h - 16;   /* (claude/canalfix3) smoke off the mill chimney, drifting */
      for (let i = 0; i < 5; i++) { const u = ((time * 0.12 + i / 5 + m.ph) % 1); g.globalAlpha = 0.18 * (1 - u); g.fillStyle = '#5a6a70'; g.beginPath(); g.ellipse(mx + u * 26, hy - u * 18, 3 + u * 8, 2 + u * 4, 0, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1; }
    for (const st of Ly.far.steeples) { const sx = st.x - off; if (sx < -30 || sx > VW + 30) continue; const gy = y0 + Math.round(Ly.field(st.x)) + 2; for (const [wx, wy] of [[0, 30], [-8, 8], [9, 8]]) { glow(g, sx + wx + 0.5, gy - wy, 7, 0.28); g.fillStyle = '#ffd98a'; g.fillRect(sx + wx - 1, gy - wy - 1, 3, 4); } }
    mist(g, VW, y0 + FAR_GL - 6, 3, 2.5, cx, FAR_F, time, 0.32, 11); }
  { const off = Math.round(cx * MID_F), gl = Math.round(VH - 118 + dY * MID_F), y0 = gl - MID_GL, s = SC(VW, VH);
    s[1].clearRect(0, 0, VW, VH); s[1].drawImage(midStrip(L.W), off, 0, Math.min(VW, Ly.wMid - off), MID_H, 0, y0, Math.min(VW, Ly.wMid - off), MID_H); s[1].fillStyle = '#18282a'; s[1].fillRect(0, y0 + MID_H - 1, VW, VH); g.drawImage(s[0], 0, 0);
    for (const l of Ly.mid.lights) { const x = l.x - off, y = y0 + l.y; if (x < -30 || x > VW + 30) continue; const fl = 0.85 + 0.15 * Math.sin(time * 6 + l.ph * 3 + l.x); glow(g, x, y, l.r, 0.5 * l.amp * fl);
      g.fillStyle = l.lantern ? '#ffcf6a' : C.win; g.globalAlpha = 0.9 * fl; g.fillRect(Math.round(x) - 1, Math.round(y) - 1, l.lantern ? 3 : 4, l.lantern ? 3 : 4); g.globalAlpha = 1; }
    mist(g, VW, y0 + MID_GL - 4, 4, 4, cx, MID_F, time, 0.38, 47); }
}
export function drawNear(g, cx, cy, VW, VH, L, time, dY) {
  const Ly = layout(L.W), off = Math.round(cx * NEAR_F), gl = Math.round(VH - 30 + dY * NEAR_F), y0 = gl - NEAR_GL;
  g.globalAlpha = 0.55; g.drawImage(nearStrip(L.W), off, 0, Math.min(VW, Ly.wNear - off), NEAR_H, 0, y0, Math.min(VW, Ly.wNear - off), NEAR_H); g.globalAlpha = 1;
  for (const l of Ly.near.lights) { const x = l.x - off, y = y0 + l.y; if (x < -30 || x > VW + 30) continue; glow(g, x, y, l.r, 0.32 * (0.85 + 0.15 * Math.sin(time * 5 + l.ph))); }
}
