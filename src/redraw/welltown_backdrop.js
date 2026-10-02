// welltown_backdrop.js - THE WELL TOWN's own backdrop (claude/welltown3-art). It used to wear the caravan's mesas and dunes; the town gets its own:
//   horizon (0.02)  the KASBAH's crenellated towers on the skyline: they are there from the gate on, nearly still, and the road walks up to them
//   far     (0.15)  hot dunes (a lit windward face, a shaded slip face) and a distant OASIS LINE: palms and a thread of water with a glint
//   mid     (0.30)  the town's skyline: flat roofs with parapets and laundry, domes, a minaret, stall awnings, palms and THE DOVECOTE's pigeon-holed tower (with its birds)
//   near    (0.60)  a few palm crowns and a sail, faint (drawNear is not called: the level has no near layer; they ride on the mid layer's pass at low alpha)
// Anchored to where the STREET is on screen (not to the bottom of the level), so it sits right at any zoom and any storey: the layers' ground lines hide behind the tiles.
// Everything static is baked ONCE on a strip per level width (memo); each frame the visible slice is copied and the few live things (birds, glints, pennants) are laid on top.
//   drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full)   as the canal's
//   paintRoom(g, st, sx, sy, w, h, tx0, ty0, time)       the back wall of the town's rooms (wtCistern, wtQueen, wtHouse, wtDovecote); true when painted
import { mulberry } from '../px.js';
const TS = 16;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const poly = (g, pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(Math.round(x), Math.round(y)) : g.moveTo(Math.round(x), Math.round(y))); g.closePath(); g.fill(); };
export const HOR_F = 0.02, FAR_F = 0.15, MID_F = 0.3, SPAN = 720;
const FAR_H = 96, FAR_GL = 80, MID_H = 124, MID_GL = 104;
export const C = {
  dune0: '#dca78c', dune0L: '#f0c4a0', dune1: '#c98e76', dune1L: '#e6ae88', slip: '#a8706a', slip2: '#94606a', oasis: '#6d7d66', oasisD: '#58685a', water: '#ead6bc', waterD: '#c9aa98',
  wall: '#946058', wallL: '#cc906a', wallD: '#6c4048', roofL: '#b87c60', win: '#3a2432', door: '#52303a', dome: '#a87464', domeL: '#e0a27a', domeD: '#7a4c52', crown: '#7a5a44',
  wash: '#ead6bc', blue: '#4c6e98', red: '#b4524a', ochre: '#d29a54', trunk: '#5e4636', frond: '#586a54', frondD: '#445446',
  kas: '#a2686a', kasL: '#d99c78', kasD: '#7c4c5a', hole: '#2c1c24', ledge: '#e8d0b0' };

/* ---- the layout: where things stand, once per level (seeded: the picture is the same every run) ---- */
function layout(L) {
  const LW = L.W, sec = L.sections || {}, kas = sec['THE KASBAH'] != null ? sec['THE KASBAH'] : 426, dv = (L.interiors || []).find(r => r[4] === 'wtDovecote'), dove = dv ? dv[0] : 320;
  return once('layout' + LW + '_' + kas + '_' + dove, () => {
    const wFar = Math.ceil(LW * TS * FAR_F) + SPAN + 200, wMid = Math.ceil(LW * TS * MID_F) + SPAN + 300, rm = mulberry(8101), rf = mulberry(4421);
    const doveX = Math.round(dove * TS * MID_F + 112 + 4 * TS * MID_F);
    const mid = []; let x = 16, placed = false;
    while (x < wMid - 80) {
      if (!placed && x > doveX - 26) { placed = true; mid.push({ k: 'dove', x: doveX, w: 30, h: 70 }); x = doveX + 22; continue; }
      const t = rm(); let w;
      if (t < 0.38) { w = 28 + Math.floor(rm() * 34); mid.push({ k: 'house', x, w, h: 22 + Math.floor(rm() * 26), up: rm() < 0.4, line: rm() < 0.22, sd: Math.floor(rm() * 999) }); }
      else if (t < 0.52) { w = 32 + Math.floor(rm() * 14); mid.push({ k: 'dome', x, w, h: 20 + Math.floor(rm() * 10), sd: Math.floor(rm() * 999) }); }
      else if (t < 0.58) { w = 12; mid.push({ k: 'minaret', x, w, h: 64 + Math.floor(rm() * 18), sd: 1 }); }
      else if (t < 0.72) { w = 24 + Math.floor(rm() * 10); mid.push({ k: 'stall', x, w, h: 12 + Math.floor(rm() * 5), col: rm() < 0.5 ? C.red : rm() < 0.5 ? C.blue : C.ochre, sd: 1 }); }
      else if (t < 0.9) { w = 14; mid.push({ k: 'palms', x, w, h: 26 + Math.floor(rm() * 16), n: 1 + Math.floor(rm() * 3), sd: Math.floor(rm() * 999) }); }
      else { w = 6 + Math.floor(rm() * 14); }
      x += w + 2 + Math.floor(rm() * 14);
    }
    const far = { palms: [], boats: [] }; for (let px = 40; px < wFar - 40; px += 12 + Math.floor(rf() * 22)) far.palms.push({ x: px, h: 8 + Math.floor(rf() * 7), lean: rf() < 0.5 ? -1 : 1 });
    for (let px = 200; px < wFar - 200; px += 400 + Math.floor(rf() * 300)) far.boats.push({ x: px });
    return { wFar, wMid, mid, far, kas, dove, doveX };
  });
}

/* ---- FAR: dunes and the oasis line ---- */
function farStrip(L) {
  const Ly = layout(L); return once('far' + Ly.wFar, () => { const w = Ly.wFar, [c, g] = mk(w, FAR_H);
    const back = x => FAR_GL - 36 + 9 * Math.sin(x * 0.012 + 0.7) + 5 * Math.sin(x * 0.031 + 2.1), front = x => FAR_GL - 20 + 6 * Math.sin(x * 0.019 + 3.1) + 3 * Math.sin(x * 0.047);
    for (let x = 0; x < w; x++) { const y = Math.round(back(x)), sl = back(x + 1) - back(x - 1); rc(g, x, y, 1, FAR_GL - y, sl > 0.15 ? C.slip : C.dune0); if (sl <= 0.15 && sl > -0.35) rc(g, x, y, 1, 1, C.dune0L); }
    /* the oasis: a thread of water and a dark line of palms standing in the haze between the dunes */
    for (let x = 0; x < w; x++) { const y = FAR_GL - 18 + Math.round(1.5 * Math.sin(x * 0.02)); rc(g, x, y, 1, 18, C.oasisD); }
    const lake = (x0, x1) => { for (let x = x0; x < x1; x++) { const y = FAR_GL - 17 + Math.round(1.5 * Math.sin(x * 0.02)); rc(g, x, y, 1, 2, C.water); rc(g, x, y + 2, 1, 1, C.waterD); } };
    for (let x = 100; x < w - 160; x += 330) lake(x, x + 90 + (x % 7) * 6);
    for (const p of Ly.far.palms) { const y = FAR_GL - 17 + Math.round(1.5 * Math.sin(p.x * 0.02)); rc(g, p.x, y - p.h, 1, p.h, C.oasisD); for (let k = -3; k <= 3; k++) rc(g, p.x + k, y - p.h - 1 + Math.abs(k) * 0.6, 1, 2, k % 2 ? C.oasis : C.oasisD); rc(g, p.x - 1, y - p.h - 2, 3, 1, C.oasis); }
    for (let x = 0; x < w; x++) { const y = Math.round(front(x)), sl = front(x + 1) - front(x - 1); rc(g, x, y, 1, FAR_H - y, sl > 0.2 ? C.slip2 : C.dune1); if (sl <= 0.2 && sl > -0.4) rc(g, x, y, 1, 2, C.dune1L); if (sl > 0.2) rc(g, x, y, 1, 1, C.dune1L); }
    const r = mulberry(61); for (let i = 0; i < w / 5; i++) { const x = (r() * w) | 0, y = Math.round(front(x)) + 3 + ((r() * 14) | 0); if (front(x + 1) - front(x - 1) <= 0.2) rc(g, x, y, 3 + ((r() * 4) | 0), 1, C.dune1L); }
    const gr = g.createLinearGradient(0, FAR_GL - 40, 0, FAR_GL); gr.addColorStop(0, 'rgba(244,206,160,0)'); gr.addColorStop(1, 'rgba(244,206,160,0.32)'); g.fillStyle = gr; g.fillRect(0, FAR_GL - 40, w, 40);
    return c; });
}
/* ---- THE KASBAH on the horizon: three crenellated towers, a curtain wall, a gate, pennants (drawn live) ---- */
function kasbahSprite() {
  return once('kasbah', () => { const [c, g] = mk(176, 96), gy = 96;
    const tower = (x, w, h) => { rc(g, x, gy - h, w, h, C.kas); rc(g, x + w - 4, gy - h, 4, h, C.kasD); rc(g, x, gy - h, 3, h, C.kasL); rc(g, x - 2, gy - h - 4, w + 4, 4, C.kas); rc(g, x - 2, gy - h - 4, w + 4, 1, C.kasL);
      for (let k = x - 2; k < x + w + 2; k += 5) rc(g, k, gy - h - 9, 3, 5, C.kas), rc(g, k, gy - h - 9, 3, 1, C.kasL);
      for (let k = 0; k < 2; k++) rc(g, x + w / 2 - 1, gy - h + 12 + k * 18, 3, 6, C.hole); };
    rc(g, 24, gy - 30, 128, 30, C.kas); rc(g, 24, gy - 30, 128, 2, C.kasL); for (let k = 24; k < 152; k += 6) rc(g, k, gy - 35, 4, 5, C.kas), rc(g, k, gy - 35, 4, 1, C.kasL);
    tower(6, 22, 66); tower(76, 26, 84); tower(148, 22, 60);
    rc(g, 84, gy - 18, 10, 18, C.hole); poly(g, [[84, gy - 18], [94, gy - 18], [89, gy - 25]], C.hole);
    for (let k = 0; k < 3; k++) { rc(g, 40 + k * 28, gy - 20, 3, 6, C.hole); }
    rc(g, 88, gy - 98, 1, 12, C.kasD); return c; });
}
/* ---- MID: the skyline ---- */
function house(g, it, gy) {
  const r = mulberry(it.sd || 1), x0 = it.x, w = it.w, h = it.h; rc(g, x0, gy - h, w, h, C.wall); rc(g, x0 + w - 3, gy - h, 3, h, C.wallD); rc(g, x0, gy - h, 2, h, C.wallL); rc(g, x0 - 1, gy - h - 3, w + 2, 3, C.roofL); rc(g, x0 - 1, gy - h - 3, w + 2, 1, C.domeL);
  if (it.up) { const w2 = Math.round(w * 0.5), x2 = x0 + (r() < 0.5 ? 2 : w - w2 - 2), h2 = 12 + Math.floor(r() * 8); rc(g, x2, gy - h - h2, w2, h2, C.wall); rc(g, x2, gy - h - h2, 2, h2, C.wallL); rc(g, x2 + w2 - 2, gy - h - h2, 2, h2, C.wallD); rc(g, x2 - 1, gy - h - h2 - 3, w2 + 2, 3, C.roofL); rc(g, x2 + w2 / 2 - 1, gy - h - h2 + 4, 3, 5, C.win); }
  rc(g, x0 + 4, gy - 11, 6, 11, C.door); for (let i = 0; i < 2; i++) { const wx = x0 + 14 + i * 10 + Math.floor(r() * 3); if (wx < x0 + w - 5) rc(g, wx, gy - h + 8 + Math.floor(r() * 6), 3, 5, C.win); }
  if (r() < 0.4) rc(g, x0 + w - 9, gy - h - 7, 4, 5, C.wall), rc(g, x0 + w - 9, gy - h - 7, 4, 1, C.roofL);
  if (it.line) { const y = gy - h - 6; rc(g, x0 - 4, y - 8, 1, 14, C.crown); rc(g, x0 + w + 3, y - 8, 1, 14, C.crown); for (let k = 0; k < 4; k++) { const cx = x0 - 2 + k * (w + 4) / 4; rc(g, cx, y - 7 + (k === 1 || k === 2 ? 1 : 0), 4, 5, k % 2 ? C.wash : k === 2 ? C.blue : C.red); } }
}
function dome(g, it, gy) {
  const x0 = it.x, w = it.w, h = it.h, rad = w * 0.4, cx = x0 + w / 2, cy = gy - h; rc(g, x0, cy, w, h, C.wall); rc(g, x0, cy, 2, h, C.wallL); rc(g, x0 + w - 3, cy, 3, h, C.wallD); rc(g, x0 - 1, cy - 2, w + 2, 2, C.roofL);
  for (let yy = 0; yy < rad; yy++) { const hw = Math.sqrt(rad * rad - yy * yy); rc(g, cx - hw, cy - 2 - yy, hw * 2, 1, C.dome); rc(g, cx + hw - 3, cy - 2 - yy, 3, 1, C.domeD); rc(g, cx - hw, cy - 2 - yy, 2, 1, C.domeL); }
  rc(g, cx, cy - rad - 8, 1, 7, C.crown); rc(g, cx - 1, cy - rad - 4, 3, 1, C.crown); rc(g, cx - 3, gy - h + 6, 6, 9, C.door); poly(g, [[cx - 3, gy - h + 6], [cx + 3, gy - h + 6], [cx, gy - h + 3]], C.door);
}
function minaret(g, it, gy) {
  const x0 = it.x, w = it.w, h = it.h, cx = x0 + w / 2; rc(g, x0, gy - h, w, h, C.wall); rc(g, x0, gy - h, 2, h, C.wallL); rc(g, x0 + w - 3, gy - h, 3, h, C.wallD);
  rc(g, x0 - 3, gy - h * 0.72, w + 6, 3, C.roofL); rc(g, x0 - 3, gy - h * 0.72 + 3, w + 6, 1, C.wallD); rc(g, x0 - 3, gy - h * 0.72 - 3, w + 6, 1, C.crown);
  rc(g, x0 + 1, gy - h * 0.72 - 9, w - 2, 6, C.wall); rc(g, cx - 1, gy - h * 0.72 - 7, 3, 4, C.win);
  poly(g, [[x0 - 1, gy - h], [x0 + w + 1, gy - h], [cx, gy - h - 16]], C.dome); poly(g, [[cx - 1, gy - h], [cx - 3, gy - h], [cx, gy - h - 14]], C.domeL); rc(g, cx, gy - h - 22, 1, 7, C.crown); rc(g, cx - 1, gy - h - 20, 3, 1, C.crown);
  for (let k = 0; k < 3; k++) rc(g, cx - 1, gy - h * 0.4 + k * 9, 2, 5, C.win);
}
function stall(g, it, gy) {
  const x0 = it.x, w = it.w, h = it.h; rc(g, x0 + 1, gy - h, 2, h, C.crown); rc(g, x0 + w - 3, gy - h, 2, h, C.crown);
  for (let k = 0; k < w; k++) { const sag = Math.round(2 * Math.sin(k / w * Math.PI)); rc(g, x0 + k, gy - h - 2 + sag, 1, 6, (k >> 2) & 1 ? C.wash : it.col); }
  rc(g, x0 + 4, gy - 5, w - 8, 5, C.wallD); rc(g, x0 + 6, gy - 9, 4, 4, C.ochre); rc(g, x0 + w - 12, gy - 8, 4, 3, C.red);
}
function palms(g, it, gy) {
  const r = mulberry(it.sd || 1); for (let i = 0; i < it.n; i++) { const x = it.x + i * 6 + Math.floor(r() * 3), h = it.h - Math.floor(r() * 8), lean = r() < 0.5 ? -1 : 1;
    for (let y = 0; y < h; y++) rc(g, x + Math.round(lean * y * y / (h * 9)), gy - y, 2, 1, C.trunk);
    const tx = x + Math.round(lean * h / 9), ty = gy - h;
    for (const [dx, dy] of [[-8, 2], [-6, -2], [-3, -4], [0, -5], [3, -4], [6, -2], [8, 2]]) { for (let s = 0; s < 6; s++) { const px = tx + Math.round(dx * s / 6), py = ty + Math.round(dy * s / 6 + (s * s) / 14); rc(g, px, py, 2, 1, s > 3 ? C.frondD : C.frond); } } }
}
function dovecote(g, it, gy) {
  const x0 = Math.round(it.x - it.w / 2), w = it.w, h = it.h; rc(g, x0, gy - h, w, h, C.wall); rc(g, x0, gy - h, 3, h, C.wallL); rc(g, x0 + w - 4, gy - h, 4, h, C.wallD);
  rc(g, x0 - 2, gy - h - 4, w + 4, 4, C.roofL); rc(g, x0 - 2, gy - h - 4, w + 4, 1, C.domeL); for (let k = x0 - 2; k < x0 + w + 2; k += 6) rc(g, k, gy - h - 8, 3, 4, C.roofL);
  for (let row = 0; row < 7; row++) for (let col = 0; col < 4; col++) { const hx = x0 + 4 + col * 6, hy = gy - h + 8 + row * 8; rc(g, hx, hy, 4, 4, C.hole); rc(g, hx - 1, hy + 4, 6, 1, C.ledge); }
  rc(g, x0 + w / 2 - 3, gy - 12, 6, 12, C.door);
}
function midStrip(L) {
  const Ly = layout(L); return once('mid' + Ly.wMid + '_' + Ly.doveX, () => { const w = Ly.wMid, [c, g] = mk(w, MID_H), gy = MID_GL; rc(g, 0, gy, w, MID_H - gy, C.wallD);
    for (const it of Ly.mid) { if (it.k === 'house') house(g, it, gy); else if (it.k === 'dome') dome(g, it, gy); else if (it.k === 'minaret') minaret(g, it, gy); else if (it.k === 'stall') stall(g, it, gy); else if (it.k === 'palms') palms(g, it, gy); else if (it.k === 'dove') dovecote(g, it, gy); }
    const gr = g.createLinearGradient(0, gy - 34, 0, gy); gr.addColorStop(0, 'rgba(244,196,150,0)'); gr.addColorStop(1, 'rgba(244,196,150,0.36)'); g.fillStyle = gr; g.fillRect(0, gy - 34, w, 34);
    return c; });
}
const SC = (() => { let s = null; return (w, h) => { if (!s || s[0].width !== w || s[0].height !== h) s = mk(w, h); return s; }; })();

export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full) {
  const Ly = layout(L), S = L.START ? L.START.y + 1 : 30, ref = S * TS - 0.6 * VH, gl = f => Math.round(0.6 * VH + 18 + (ref - cy) * f);
  if (full) {
    /* the Kasbah, on the horizon, behind the dunes: centred when the hero stands at its gate */
    const ks = kasbahSprite(), kx = Math.round(VW / 2 + HOR_F * (Ly.kas * TS - VW / 2 - cx)), gh = gl(FAR_F) - 14;
    if (kx > -120 && kx < VW + 120) { g.globalAlpha = 0.9; g.drawImage(ks, kx - 88, gh - 96); g.globalAlpha = 1;
      for (const fx of [kx - 2]) { const fl = Math.sin(time * 5) * 1.2; g.fillStyle = C.red; g.fillRect(fx, gh - 98, 6 + Math.round(fl), 3); } }
    const off = Math.round(cx * FAR_F), y0 = gl(FAR_F) - FAR_GL, s = SC(VW, VH), wv = Math.min(VW, Ly.wFar - off);
    s[1].clearRect(0, 0, VW, VH); s[1].drawImage(farStrip(L), off, 0, wv, FAR_H, 0, y0, wv, FAR_H); s[1].fillStyle = C.dune1; s[1].fillRect(0, y0 + FAR_H - 1, VW, VH); g.drawImage(s[0], 0, 0);
    for (const b of Ly.far.boats) { const bx = b.x - off; if (bx < -20 || bx > VW + 20) continue; const by = y0 + FAR_GL - 17 - 1; g.fillStyle = C.wash; g.fillRect(bx, by - 7, 1, 7); g.beginPath(); g.moveTo(bx + 1, by - 7); g.lineTo(bx + 6, by - 1); g.lineTo(bx + 1, by - 1); g.closePath(); g.fill(); g.fillStyle = C.oasisD; g.fillRect(bx - 2, by, 8, 1); }
    for (let i = 0; i < 6; i++) { const gx = ((i * 211 + 40) % (VW + 80)) - 20, tw = Math.sin(time * 2.2 + i * 1.9); if (tw > 0.6) { g.fillStyle = '#fff4dc'; g.fillRect(gx, y0 + FAR_GL - 16 + (i % 2), 1, 1); } }
  }
  { const off = Math.round(cx * MID_F), y0 = gl(MID_F) - MID_GL, s = SC(VW, VH), wv = Math.min(VW, Ly.wMid - off);
    s[1].clearRect(0, 0, VW, VH); s[1].drawImage(midStrip(L), off, 0, wv, MID_H, 0, y0, wv, MID_H); s[1].fillStyle = C.wallD; s[1].fillRect(0, y0 + MID_H - 1, VW, VH); g.drawImage(s[0], 0, 0);
    /* THE DOVECOTE's birds: a loose ring of pigeons round the tower, a few darting off */
    const dx = Ly.doveX - off, dyy = y0 + MID_GL - 62;
    if (dx > -60 && dx < VW + 60) { g.fillStyle = '#4a3a48'; for (let i = 0; i < 7; i++) { const a = time * (0.7 + (i % 3) * 0.2) + i * 0.9, bx = dx + Math.cos(a) * (22 + (i % 3) * 7), by = dyy + Math.sin(a * 1.3) * 12 + (i % 2) * 8; g.fillRect(Math.round(bx), Math.round(by), 2, 1); if (((time * 6 + i) | 0) % 2) g.fillRect(Math.round(bx) - 1, Math.round(by) - 1, 1, 1); else g.fillRect(Math.round(bx) + 2, Math.round(by) - 1, 1, 1); } }
    /* the near layer, faint: palm crowns high on the sky side and a sail */
    if (full) { const noff = Math.round(cx * 0.6), ng = gl(0.6) - 60; g.globalAlpha = 0.26; for (let k = 0; k < 14; k++) { const x = ((k * 173 + 60) % (Ly.wMid * 2)) - noff, wrapX = ((x % 1900) + 1900) % 1900 - 80; if (wrapX > VW + 40) continue; const h = 50 + (k * 37) % 34, top = ng - h; g.fillStyle = '#4a3a3a'; g.fillRect(wrapX, top, 2, h); g.fillStyle = '#3c4a3c'; for (let s2 = 0; s2 < 7; s2++) { const ang = -Math.PI * (0.1 + s2 * 0.13); g.fillRect(Math.round(wrapX + 1 + Math.cos(ang) * 9), Math.round(top + 1 + Math.sin(ang) * 4 + 4), 8, 1); } } g.globalAlpha = 1; }
  }
}

// ================================ THE ROOMS' BACK WALLS ================================
const PAT = (key, w, h, draw) => once('pat' + key, () => { const [c, g] = mk(w, h); draw(g); return c.getContext('2d').createPattern(c, 'repeat'); });
function stonePattern(dry) {
  return PAT('stone' + dry, 32, 32, g => { const r = mulberry(dry ? 91 : 53); rc(g, 0, 0, 32, 32, dry ? '#2a3340' : '#222f3e');
    for (let row = 0; row < 4; row++) { const off = (row & 1) ? 8 : 0; rc(g, 0, row * 8 + 7, 32, 1, '#121a24');
      for (let bx = -16; bx < 32; bx += 16) { const t = r(), x = bx + off; rc(g, x, row * 8, 1, 7, '#121a24'); rc(g, x + 1, row * 8, 15, 7, t < 0.3 ? '#27374a' : '#212e3e'); rc(g, x + 1, row * 8, 15, 1, '#2e4054'); } }
    if (!dry) for (let i = 0; i < 5; i++) { const x = (r() * 32) | 0, h = 5 + ((r() * 12) | 0); for (let y = 0; y < h; y++) rc(g, x, y, 1, 1, y < h - 1 ? '#17212c' : '#2a4a50'); }
    else for (let i = 0; i < 9; i++) rc(g, (r() * 32) | 0, (r() * 32) | 0, 2, 1, '#3a4452'); });
}
function plasterPattern() { return PAT('plaster', 32, 32, g => { const r = mulberry(17); rc(g, 0, 0, 32, 32, '#c9a478'); for (let i = 0; i < 18; i++) rc(g, (r() * 30) | 0, (r() * 30) | 0, 2 + ((r() * 3) | 0), 1, r() < 0.5 ? '#b8946a' : '#d6b88c'); rc(g, 0, 0, 32, 2, '#a88260'); }); }
function dovePattern() { return PAT('dove', 32, 32, g => { rc(g, 0, 0, 32, 32, '#7a5a42'); for (let i = 0; i < 12; i++) rc(g, (i * 13) % 32, (i * 7) % 32, 3, 1, '#6a4c38'); for (const [hx, hy] of [[4, 4], [20, 4], [12, 20], [28 - 4, 20]]) { rc(g, hx, hy, 5, 5, '#2a1a10'); rc(g, hx - 1, hy + 5, 7, 1, '#d8c8a8'); rc(g, hx - 1, hy + 6, 7, 1, '#a89878'); } }); }
export function paintRoom(g, st, sx, sy, w, h, tx0, ty0, time) {
  if (st === 'wtCistern' || st === 'wtQueen') { const dry = st === 'wtQueen'; g.fillStyle = stonePattern(dry); g.fillRect(sx, sy, w, h);
    /* the hall breathes: a cool gradient from the vault down, the damp light on the floor, a drip now and then */
    const gr = g.createLinearGradient(0, sy, 0, sy + h); gr.addColorStop(0, 'rgba(6,10,18,0.5)'); gr.addColorStop(0.5, 'rgba(6,10,18,0)'); gr.addColorStop(1, 'rgba(40,70,90,0.18)'); g.fillStyle = gr; g.fillRect(sx, sy, w, h);
    if (!dry) for (let i = 0; i < Math.min(40, w / 40); i++) { const x = sx + ((i * 97 + tx0 * 7) % Math.max(1, w - 4)) + 2, ph = (time * 0.5 + i * 0.37) % 1; if (ph < 0.42 && x > -4 && x < 700) { g.fillStyle = '#7ab8d8'; g.fillRect(Math.round(x), Math.round(sy + 4 + ph * (h - 8) * 2.3), 1, 2); } }
    return true; }
  if (st === 'wtHouse') { g.fillStyle = plasterPattern(); g.fillRect(sx, sy, w, h); g.fillStyle = 'rgba(50,28,16,0.42)'; g.fillRect(sx, sy, w, h); g.fillStyle = '#4a2c1a'; g.fillRect(sx, sy, w, 3); return true; }
  if (st === 'wtDovecote') { g.fillStyle = dovePattern(); g.fillRect(sx, sy, w, h); g.fillStyle = 'rgba(30,16,8,0.4)'; g.fillRect(sx, sy, w, h);
    for (let i = 0; i < 4; i++) { const a = time * (0.9 + i * 0.2) + i * 1.7, bx = sx + w / 2 + Math.cos(a) * (w / 2 - 4), by = sy + h * (0.25 + 0.18 * i) + Math.sin(a * 1.4) * 4; g.fillStyle = '#d8d0e0'; g.fillRect(Math.round(bx), Math.round(by), 3, 1); g.fillRect(Math.round(bx) + (((time * 5) | 0) % 2 ? -1 : 2), Math.round(by) - 1, 1, 1); }
    return true; }
  return false;
}
