// fair_backdrop.js - THE HARVEST FAIR's backdrop (claude/fairfix2-backdrop): the fair reads as a FAIRGROUND at dusk, not as Waymeet's town.
//   far   (slow)  harvest fields (stubble rows, stooks, hedgerows), distant bonfires with their smoke, WAYMEET's steeple on the horizon (the town the hero came from)
//   mid           striped big tops with pennants, stall awnings, a lit big wheel turning in the distance, lantern strings swaying between poles
//   near          the crowd (fair_world.js drawCrowd, called from main.js) and bunting strings (drawNear)
//   sky           fireflies in the dusk fields, sparks off the bonfires and drifting up late on
//   effigy        the wicker effigy going up behind the fair (moved here from fair_rides.js) and burning: an entry with `burns: true` is ALIGHT once burnT > 0 (about six seconds to
//                 fully ablaze); an entry with stage 'ash' is the burnt frame (charred ribs, embers, a smoke column)
// Colour: every static silhouette is baked ONCE in daylight colours on a long strip; each frame the visible part of a strip is copied to a scratch canvas, the dynamic bits
// (wheel, strings) are added, and the whole is tinted warm at the gate and deep blue by the end (L.duskStart/duskLen) before it is laid on the screen. The lamps (wheel rim,
// lantern strings, tent doors, bonfires, church windows) are added AFTER the tint and brighten with the dark: by the level's dusk, and by height (L.fairNight, the night sky
// fair_rides.js paints over these layers). Pure drawing; the only state is baked canvases (memo) and the last burnT (so fair_rides.js drawNight can keep the fire lit).
import { mulberry } from '../px.js';
import { nightK } from '../fair-games.js';
import * as FAW from './fair_world.js';
const TS = 16;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const flame = (g, x, y, w, h, tip, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x - w * 1.15, y - h * 0.55, x + tip, y - h); g.quadraticCurveTo(x + w * 1.15, y - h * 0.5, x + w, y); g.closePath(); g.fill(); };
const tri = (g, a, b, c, d, e, f, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.lineTo(e, f); g.closePath(); g.fill(); };
const ln = (g, x0, y0, x1, y1, col, w = 1) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = v => Math.max(0, Math.min(1, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const F_FAR = 0.15, F_MID = 0.3, F_NEAR = 0.6, SPAN = 720;   // parallax factors (the effigy and the crowd are at 0.6); SPAN: the widest view a strip must cover
let lastBurnT = 0;   // the burning effigy's clock, remembered from drawEffigies so the night overlay can leave its glow lit (fireHoles)

/* ================= THE LAYOUT: where everything stands, once per level width ================= */
function layout(LW) {
  return once('layout' + LW, () => {
    const wFar = Math.ceil(LW * TS * F_FAR) + SPAN + 160, wMid = Math.ceil(LW * TS * F_MID) + SPAN + 260;
    const colX = (col, f) => Math.round(col * TS * f) + 120;   // the column whose backdrop slides under the screen's left part when the camera is at that column
    const rf = mulberry(4417), rm = mulberry(9021);
    const hillFar = x => 34 + 5 * Math.sin(x * 0.013 + 1) + 3 * Math.sin(x * 0.033 + 2);
    const hillBack = x => 18 + 7 * Math.sin(x * 0.007) + 4 * Math.sin(x * 0.021 + 0.5);
    const hillMid = x => 112 + 2.2 * Math.sin(x * 0.016) + 1.4 * Math.sin(x * 0.047 + 1);
    // the far fires: every few hundred px, more of them later
    const fires = []; for (let x = 260; x < wFar - 100; x += 150 + Math.floor(rf() * 190)) fires.push({ x, y: FAR_GL - hillFar(x) + 7 + rf() * 10, sd: rf() });
    // the mid layer: things stand on the ground line in order, but not on the wheels' sites
    const wheels = [];   /* (claude/fairfix5: the two small mid-layer wheels are gone - ONE big lit wheel stands on the skyline from screen one now: drawLandmark) */
    const items = [], poles = [], strings = [], lights = [], tops = [];
    let x = 40, lastPole = null;
    const cols = [['#b8382c', '#ece0c4'], ['#2f5f9a', '#ece0c4'], ['#c8901c', '#7a2418'], ['#3f7a4a', '#ece0c4'], ['#8a3a6a', '#e8d8b0']];
    while (x < wMid - 60) {
      const t = rm(), col = cols[Math.floor(rm() * cols.length)];
      const sparse = x < colX(40, F_MID) ? 0.55 : 1;   // the gate: the fair has not begun
      if (wheels.some(w => Math.abs(x - w.x) < w.r + 50)) { x += 20; continue; }
      let w;
      if (t < 0.24 * sparse) { w = 66 + Math.floor(rm() * 36); items.push({ k: 'top', x: x + w / 2, w, wh: 20 + Math.floor(rm() * 8), ph: 24 + Math.floor(w * 0.34), col, round: false }); const gy = hillMid(x); tops.push({ x: x + w / 2, y: gy - 20 - 8 - 24 - Math.floor(w * 0.34) - 14 }); lights.push({ x: x + w / 2, y: gy - 9, r: 15, k: 'door' }); }
      else if (t < 0.4 * sparse) { w = 38 + Math.floor(rm() * 18); items.push({ k: 'top', x: x + w / 2, w, wh: 9 + Math.floor(rm() * 4), ph: 22 + Math.floor(w * 0.3), col, round: true }); const gy = hillMid(x); tops.push({ x: x + w / 2, y: gy - 10 - 22 - Math.floor(w * 0.3) - 10 }); }
      else if (t < 0.84) { const n = 1 + Math.floor(rm() * 3); w = 0; for (let i = 0; i < n; i++) { const sw = 28 + Math.floor(rm() * 14); items.push({ k: 'stall', x: x + w + sw / 2, w: sw, h: 22 + Math.floor(rm() * 6), col: cols[Math.floor(rm() * cols.length)] }); lights.push({ x: x + w + sw / 2, y: hillMid(x + w) - 17, r: 10, k: 'stall' }); w += sw + 1; } }
      else if (t < 0.92) { w = 22; items.push({ k: 'tree', x: x + 11, w, h: 26 + Math.floor(rm() * 14) }); }
      else { w = 24; items.push({ k: 'rick', x: x + 12, w }); }
      x += w + 6 + Math.floor(rm() * 30);
      // a pole at the gaps, strung to the last one
      if (rm() < 0.55) { const px = x - 3 - Math.floor(rm() * 4), top = hillMid(px) - 58 - Math.floor(rm() * 10), p = { x: px, y: top }; poles.push(p);
        if (lastPole && px - lastPole.x < 230 && px - lastPole.x > 40) strings.push({ x0: lastPole.x, y0: lastPole.y, x1: px, y1: top, sag: 10 + Math.floor((px - lastPole.x) / 14), sd: rm() * 6 }); lastPole = p; }
    }
    // the near bunting poles (parallax 0.6): from a little way in, every ~130 px
    const nearPoles = []; for (let x = colX(34, F_NEAR) + Math.floor(rm() * 40); x < Math.ceil(LW * TS * F_NEAR) + SPAN; x += 112 + Math.floor(rm() * 50)) nearPoles.push({ x, h: 104 + Math.floor(rm() * 14) });
    const flies = Array.from({ length: 22 }, () => ({ u: rm(), v: rm(), p: rm() * 6.28 })), embers = Array.from({ length: 16 }, () => ({ u: rm(), v: rm(), p: rm() * 6.28 }));
    return { wFar, wMid, hillFar, hillBack, hillMid, fires, wheels, items, poles, strings, lights, tops, nearPoles, flies, embers, steeple: { x: colX(2, F_FAR) - 96 }, N: LW };   /* (claude/fairfix5) Waymeet's steeple: a small mark at the far left, where you came from - not the middle of screen one */
  });
}

/* ================= THE STRIPS: baked once in daylight colours ================= */
const FAR_H = 150, FAR_GL = 104, MID_H = 190, MID_GL = 112;
function stripe(g, x0, x1, y, h, a, b, step) { for (let x = x0, i = 0; x < x1; x += step, i++) rc(g, x, y, Math.min(step, x1 - x), h, i & 1 ? b : a); }
function bigTop(g, it, gy) {
  const { x, w, wh, ph, col, round } = it, [A, B] = col, top = gy - wh, ax = x, ay = top - ph;
  const n = Math.max(6, Math.round(w / 6)), ex = 3;
  for (let xx = x - w / 2, i = 0; xx < x + w / 2; xx += 5, i++) rc(g, xx, top, Math.min(5, x + w / 2 - xx), wh, i & 1 ? B : A);   // the wall
  rc(g, x - w / 2, gy - 2, w, 2, 'rgba(0,0,0,0.25)');
  for (let i = 0; i < n; i++) { const xa = x - w / 2 - ex + i * (w + ex * 2) / n, xb = x - w / 2 - ex + (i + 1) * (w + ex * 2) / n; tri(g, xa, top, xb, top, ax, round ? ay : ay, i & 1 ? B : A); }   // the roof's wedges
  for (let xx = x - w / 2 - ex, i = 0; xx < x + w / 2 + ex - 1; xx += 5, i++) tri(g, xx, top, xx + 5, top, xx + 2.5, top + 4, i & 1 ? A : B);   // the valance
  ln(g, x - w / 2 - ex, top + 0.5, ax, ay, 'rgba(40,16,24,0.55)'); ln(g, x + w / 2 + ex, top + 0.5, ax, ay, 'rgba(40,16,24,0.55)');
  const dw = Math.min(12, Math.round(w * 0.16)); rc(g, x - dw / 2, gy - wh * 0.75, dw, wh * 0.75, '#2a1814'); rc(g, x - dw / 2 + 1, gy - 5, dw - 2, 5, '#a8682c');   // the door and the light inside
  ln(g, ax, ay, ax, ay - 9, '#3a2a22', 1);
}
function stall(g, it, gy) {
  const { x, w, h, col } = it, [A, B] = col, top = gy - h;
  rc(g, x - w / 2 + 1, top, w - 2, h, '#43301f'); rc(g, x - w / 2 + 1, gy - 9, w - 2, 2, '#9a6a3a'); rc(g, x - w / 2 + 2, gy - 7, w - 4, 7, '#2e2016');
  for (let i = 0; i < Math.floor(w / 5); i++) rc(g, x - w / 2 + 3 + i * 5, gy - 11, 2, 2, ['#e8c23a', '#d85a4a', '#9fd0e0', '#ece0c4'][i % 4]);   // the goods
  g.fillStyle = A; g.beginPath(); g.moveTo(x - w / 2 - 2, top - 6); g.lineTo(x + w / 2 + 2, top - 6); g.lineTo(x + w / 2 + 3, top + 4); g.lineTo(x - w / 2 - 3, top + 4); g.closePath(); g.fill();
  g.save(); g.clip(); for (let xx = x - w / 2 - 3, i = 0; xx < x + w / 2 + 3; xx += 4, i++) if (i & 1) rc(g, xx, top - 7, 4, 12, B); g.restore();
  for (let xx = x - w / 2 - 3, i = 0; xx < x + w / 2 + 3 - 1; xx += 4, i++) tri(g, xx, top + 4, xx + 4, top + 4, xx + 2, top + 7, i & 1 ? B : A);
  rc(g, x - w / 2 - 1, top + 4, 1, h - 4, '#2a1c14'); rc(g, x + w / 2, top + 4, 1, h - 4, '#2a1c14');
}
function tree(g, it, gy) { const { x, h } = it; rc(g, x - 1, gy - h * 0.45, 3, h * 0.45, '#3a2a1c'); g.fillStyle = '#34452c'; g.beginPath(); g.ellipse(x, gy - h * 0.62, 9, h * 0.38, 0, 0, 6.3); g.fill(); g.fillStyle = '#41573a'; g.beginPath(); g.ellipse(x - 2, gy - h * 0.7, 5, h * 0.2, 0, 0, 6.3); g.fill(); }
function rick(g, it, gy) { const { x } = it; g.fillStyle = '#c9a548'; g.beginPath(); g.ellipse(x, gy - 6, 11, 8, 0, Math.PI, 0); g.lineTo(x + 11, gy); g.lineTo(x - 11, gy); g.fill(); rc(g, x - 11, gy - 2, 22, 2, '#8e7234'); }
function farStrip(LW) {
  return once('farStrip' + LW, () => {
    const Ly = layout(LW), W = Ly.wFar, [c, g] = mk(W, FAR_H);
    // the back ridge, and a hedgerow along it
    g.fillStyle = '#6f7a58'; g.beginPath(); g.moveTo(0, FAR_H); for (let x = 0; x <= W; x += 3) g.lineTo(x, FAR_GL - Ly.hillBack(x)); g.lineTo(W, FAR_H); g.fill();
    const r = mulberry(31); g.fillStyle = '#4c5e3c'; for (let x = 0; x < W; x += 8 + Math.floor(r() * 18)) { const y = FAR_GL - Ly.hillBack(x); g.beginPath(); g.ellipse(x, y + 1, 3 + r() * 5, 2 + r() * 2, 0, 0, 6.3); g.fill(); }
    for (let x = 14; x < W; x += 40 + Math.floor(r() * 60)) { const y = FAR_GL - Ly.hillBack(x); rc(g, x, y - 3, 1, 4, '#3a4a30'); g.fillStyle = '#425636'; g.beginPath(); g.arc(x + 0.5, y - 5, 3, 0, 6.3); g.fill(); }   // a far tree
    // the harvested field: stubble in rows following the ground
    g.fillStyle = '#a8924e'; g.beginPath(); g.moveTo(0, FAR_H); for (let x = 0; x <= W; x += 3) g.lineTo(x, FAR_GL - Ly.hillFar(x)); g.lineTo(W, FAR_H); g.fill();
    for (let i = 1; i < 9; i++) { g.strokeStyle = i & 1 ? '#bfa85e' : '#8a7640'; g.lineWidth = 1; g.beginPath(); for (let x = 0; x <= W; x += 4) { const y = FAR_GL - Ly.hillFar(x) + i * (2 + i * 0.55); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    // stooks: little sheaves stood in lines, bigger near the bottom of the field
    for (let i = 0; i < 6; i++) for (let x = 5 + (i * 11) % 17; x < W; x += 15 + Math.floor(r() * 24)) { if (r() < 0.3) continue; const y = FAR_GL - Ly.hillFar(x) + 3 + i * (2 + i * 0.55), s = 0.7 + i * 0.22; tri(g, x - 2 * s, y, x + 2 * s, y, x, y - 5 * s, '#d4b45c'); rc(g, x - 0.5, y - 2 * s, 1, 2 * s, '#9a7a34'); }
    // hedgerows across the field, and a gate-gap or two
    for (let x = 40; x < W; x += 90 + Math.floor(r() * 130)) { const y = FAR_GL - Ly.hillFar(x) + 4 + Math.floor(r() * 8), w = 26 + Math.floor(r() * 48); g.fillStyle = '#45583a'; for (let xx = x; xx < x + w; xx += 4) { g.beginPath(); g.ellipse(xx, y, 3.5, 2.6 + (r() * 1.4), 0, 0, 6.3); g.fill(); } }
    // the fires' dark pile
    for (const f of Ly.fires) rc(g, f.x - 3, f.y - 1, 7, 2, '#2a1c14');
    // WAYMEET: a church and a few roofs on the rise, the spire above them all
    { const sx = Ly.steeple.x, gy = FAR_GL - Ly.hillFar(sx) + 3;
      for (const [dx, w, h, col] of [[-62, 16, 9, '#5e3a34'], [-40, 20, 12, '#6a4038'], [34, 24, 11, '#5e3a34'], [60, 14, 8, '#6a4038'], [78, 18, 10, '#5a3630']]) { rc(g, sx + dx, gy - h, w, h, '#8a7a70'); tri(g, sx + dx - 2, gy - h, sx + dx + w + 2, gy - h, sx + dx + w / 2, gy - h - 7, col); rc(g, sx + dx + 4, gy - h + 3, 2, 2, '#ffcf70'); }
      rc(g, sx - 22, gy - 16, 34, 16, '#8a7a70'); tri(g, sx - 24, gy - 16, sx + 14, gy - 16, sx - 5, gy - 28, '#5e3a34');   // the nave
      rc(g, sx + 4, gy - 40, 13, 40, '#7d6e66'); rc(g, sx + 4, gy - 40, 2, 40, '#948478'); rc(g, sx + 8, gy - 34, 5, 7, '#2a1c20'); rc(g, sx + 9, gy - 33, 3, 5, '#ffcf70'); rc(g, sx + 8, gy - 22, 5, 5, '#2a1c20'); rc(g, sx + 9, gy - 21, 3, 3, '#ffcf70');
      tri(g, sx + 2, gy - 40, sx + 19, gy - 40, sx + 10.5, gy - 66, '#4e3a3a'); tri(g, sx + 10.5, gy - 66, sx + 10, gy - 40, sx + 19, gy - 40, '#5e4646'); rc(g, sx + 10, gy - 74, 1, 9, '#2a1c20'); rc(g, sx + 8, gy - 71, 5, 1, '#2a1c20'); rc(g, sx - 12, gy - 11, 3, 6, '#ffcf70'); rc(g, sx - 2, gy - 11, 3, 6, '#ffcf70'); }
    return c; });
}
function midStrip(LW) {
  return once('midStrip' + LW, () => {
    const Ly = layout(LW), W = Ly.wMid, [c, g] = mk(W, MID_H);
    g.fillStyle = '#56603a'; g.beginPath(); g.moveTo(0, MID_H); for (let x = 0; x <= W; x += 3) g.lineTo(x, Ly.hillMid(x) + 1 - 0); g.lineTo(W, MID_H); g.fill();
    g.fillStyle = '#3f4730'; g.fillRect(0, MID_GL + 14, W, MID_H);
    const r = mulberry(55); g.fillStyle = '#6b7544'; for (let x = 0; x < W; x += 5) if (r() < 0.5) rc(g, x, Ly.hillMid(x) + 1, 2, 1, '#6e7a46');
    for (const p of Ly.poles) { const gy = Ly.hillMid(p.x); rc(g, p.x - 1, p.y, 2, gy - p.y, '#3a2a22'); rc(g, p.x - 2, p.y - 1, 4, 2, '#2a1c18'); }
    for (const it of Ly.items) { const gy = Ly.hillMid(it.x); if (it.k === 'top') bigTop(g, it, gy); else if (it.k === 'stall') stall(g, it, gy); else if (it.k === 'tree') tree(g, it, gy); else rick(g, it, gy); }
    for (const w of Ly.wheels) { const gy = Ly.hillMid(w.x), hy = gy - w.r - 10; ln(g, w.x, hy, w.x - w.r * 0.55, gy, '#3a2a24', 3); ln(g, w.x, hy, w.x + w.r * 0.55, gy, '#3a2a24', 3); ln(g, w.x - w.r * 0.55, gy - 1, w.x + w.r * 0.55, gy - 1, '#2a1c18', 2); }
    return c; });
}
const glowSpr = () => once('glow', () => { const [c, g] = mk(64, 64), gr = g.createRadialGradient(32, 32, 1, 32, 32, 32); gr.addColorStop(0, 'rgba(255,214,130,1)'); gr.addColorStop(0.35, 'rgba(255,160,70,0.45)'); gr.addColorStop(1, 'rgba(255,110,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c; });
let SC = null;   // the scratch canvas the far and mid layers are put together on, then tinted, then laid down
const scratch = (VW, VH) => { if (!SC || SC.width !== VW || SC.height !== VH) { SC = document.createElement('canvas'); SC.width = VW; SC.height = VH; } const d = SC.getContext('2d'); d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, VW, VH); return d; };
/* THE DARK of a light's place: by the level's dusk and by the height it hangs at (the night sky comes down from the top, L.fairNight) */
const darkAt = (L, d, yWorld) => clamp01(Math.max(d * 0.9, nightK(L.fairNight, yWorld)));
function lamp(g, x, y, r, lit, tw = 1) {   // a warm light added to what is there
  const a = lit * tw; if (a < 0.03) return; const s = glowSpr();
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, a * 0.95); g.drawImage(s, Math.round(x - r), Math.round(y - r), r * 2, r * 2); g.globalAlpha = 1; g.restore();
}
const dot = (g, x, y, col, s = 2) => { g.fillStyle = col; g.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s); };
const tint = (d2, d, far) => {   // the sunset at the gate, the deep blue at the end
  const t = smooth(0, 1, d), a = far ? lerp(0.5, 0.78, t) : lerp(0.2, 0.56, t), rr = lerp(210, 22, t), gg = lerp(110, 26, t), bb = lerp(96, 64, t);
  d2.globalCompositeOperation = 'source-atop'; d2.fillStyle = 'rgba(' + Math.round(rr) + ',' + Math.round(gg) + ',' + Math.round(bb) + ',' + a.toFixed(3) + ')'; d2.fillRect(0, 0, d2.canvas.width, d2.canvas.height); d2.globalCompositeOperation = 'source-over'; };

/* ================= FAR and MID: laid in place of the town's layers ================= */
export function drawBackdrop(g, cx, cy, VW, VH, L, time, d, dY, full) {
  const Ly = layout(L.W);
  // ---- the far layer: fields, fires, the steeple ----
  if (full) {
    const off = Math.round(cx * F_FAR), gl = Math.round(VH - 62 + dY * F_FAR), y0 = gl - FAR_GL, s = scratch(VW, VH);
    s.drawImage(farStrip(L.W), off, 0, Math.min(VW, Ly.wFar - off), FAR_H, 0, y0, Math.min(VW, Ly.wFar - off), FAR_H);
    s.fillStyle = '#4a4630'; s.fillRect(0, y0 + FAR_H - 1, VW, VH);
    tint(s, d, true); g.drawImage(SC, 0, 0);
    // the fires: flame, smoke column, a spark or two later on; the steeple's windows
    for (const f of Ly.fires) { const x = f.x - off, y = gl - FAR_GL + f.y; if (x < -30 || x > VW + 30 || y < -60 || y > VH + 20) continue;
      const dk = darkAt(L, d, y + cy), fl = 3 + Math.sin(time * 11 + f.sd * 60) * 1.2 + Math.sin(time * 5.3 + f.sd * 9) * 0.8;
      for (let i = 0; i < 9; i++) { const p = (time * 0.1 + i / 9 + f.sd) % 1, sx = x + Math.sin(p * 6 + i + f.sd * 9) * 3 + p * 9, sy = y - 4 - p * 46; g.fillStyle = 'rgba(' + Math.round(lerp(120, 40, dk)) + ',' + Math.round(lerp(96, 40, dk)) + ',' + Math.round(lerp(96, 60, dk)) + ',' + ((1 - p) * 0.4).toFixed(2) + ')'; const sz = 2 + p * 4; g.fillRect(Math.round(sx - sz / 2), Math.round(sy - sz / 2), Math.round(sz), Math.round(sz)); }
      lamp(g, x, y - 3, 17, 0.55 + dk * 0.45, 0.85 + 0.15 * Math.sin(time * 13 + f.sd * 40));
      rc(g, x - 1, y - 1 - fl, 3, fl + 1, '#e8601c'); rc(g, x, y - 2 - fl * 0.6, 1, fl * 0.7 + 1, '#ffd060');
      if (d > 0.2 || dk > 0.3) for (let i = 0; i < 4; i++) { const p = (time * 0.45 + i * 0.25 + f.sd * 3) % 1; g.fillStyle = 'rgba(255,' + Math.round(150 + 60 * (1 - p)) + ',70,' + ((1 - p) * 0.9).toFixed(2) + ')'; g.fillRect(Math.round(x + Math.sin(i * 3 + p * 6 + f.sd * 8) * 5), Math.round(y - 5 - p * 30), 1, 1); } }
    { const sx = Ly.steeple.x - off; if (sx > -120 && sx < VW + 120) { const gy = gl - FAR_GL + (FAR_GL - Ly.hillFar(Ly.steeple.x) + 3), dk = darkAt(L, d, gy + cy);
      for (const [wx, wy] of [[9, 33], [10, 21], [-11, 8], [-1, 8]]) { const x = sx + wx + 1, y = gy - wy; lamp(g, x, y, 6, 0.25 + dk * 0.7, 1); dot(g, x, y, '#ffe9a0', 2); } } }
  }
  drawLandmark(g, cx, cy, VW, VH, L, time, d, dY);
  // ---- the mid layer: tents, stalls, the wheel, the strings ----
  { const off = Math.round(cx * F_MID), gl = Math.round(VH - 94 + dY * F_MID), y0 = gl - MID_GL, s = scratch(VW, VH);
    s.drawImage(midStrip(L.W), off, 0, Math.min(VW, Ly.wMid - off), MID_H, 0, y0, Math.min(VW, Ly.wMid - off), MID_H);
    s.fillStyle = '#3a4030'; s.fillRect(0, y0 + MID_H - 1, VW, VH);
    for (const w of Ly.wheels) { const hx = w.x - off; if (hx < -w.r - 20 || hx > VW + w.r + 20) continue; const gyw = y0 + Ly.hillMid(w.x), hy = gyw - w.r - 10, ang = time * 0.09;
      s.strokeStyle = '#4a382e'; s.lineWidth = 1; for (let i = 0; i < 12; i++) { const a = ang + i * Math.PI / 6; s.beginPath(); s.moveTo(hx, hy); s.lineTo(hx + Math.cos(a) * w.r, hy + Math.sin(a) * w.r); s.stroke(); }
      s.lineWidth = 2; s.beginPath(); s.arc(hx, hy, w.r, 0, 6.3); s.stroke(); s.lineWidth = 1; s.beginPath(); s.arc(hx, hy, w.r - 5, 0, 6.3); s.stroke(); s.beginPath(); s.arc(hx, hy, w.r * 0.4, 0, 6.3); s.stroke();
      for (let i = 0; i < 8; i++) { const a = ang + i * Math.PI / 4, gx = hx + Math.cos(a) * w.r, gyy = hy + Math.sin(a) * w.r; ln(s, gx, gyy, gx, gyy + 3, '#2a1c18'); rc(s, gx - 2, gyy + 3, 5, 4, i % 3 === 0 ? '#9a3a30' : i % 3 === 1 ? '#c8901c' : '#2f5f9a'); }
      rc(s, hx - 3, hy - 3, 6, 6, '#6a5030'); }
    for (const st of Ly.strings) { if (st.x1 - off < -20 || st.x0 - off > VW + 20) continue; const sw = Math.sin(time * 1.3 + st.sd), pts = Math.max(4, Math.round((st.x1 - st.x0) / 9));
      s.strokeStyle = '#2a1c1c'; s.lineWidth = 1; s.beginPath();
      for (let i = 0; i <= pts; i++) { const u = i / pts, x = lerp(st.x0, st.x1, u) - off + Math.sin(time * 1.1 + st.sd + u * 3) * 0.7 * u * (1 - u) * 4, y = y0 + lerp(st.y0, st.y1, u) + st.sag * 4 * u * (1 - u) * (1 + 0.1 * sw); i ? s.lineTo(x, y) : s.moveTo(x, y); }
      s.stroke(); }
    for (const t of Ly.tops) { const tx = t.x - off; if (tx < -20 || tx > VW + 20) continue; const fy = y0 + t.y, fw = 7 + Math.sin(time * 4 + t.x) * 1.2; tri(s, tx, fy, tx + fw, fy + 2 + Math.sin(time * 5 + t.x) * 0.8, tx, fy + 4, '#c8341c'); }
    tint(s, d, false); g.drawImage(SC, 0, 0);
    // the lamps: tent doors, stall lamps, the wheel's rim, the strings' bulbs
    for (const l of Ly.lights) { const x = l.x - off, y = y0 + l.y; if (x < -30 || x > VW + 30 || y < -30 || y > VH + 30) continue; const dk = darkAt(L, d, y + cy); lamp(g, x, y, l.r, 0.4 + dk * 0.7, 0.92 + 0.08 * Math.sin(time * 7 + l.x)); if (l.k === 'stall') dot(g, x, y + 2, '#ffe9a0', 2); }
    for (const w of Ly.wheels) { const hx = w.x - off; if (hx < -w.r - 20 || hx > VW + w.r + 20) continue; const hy = y0 + Ly.hillMid(w.x) - w.r - 10, dk = darkAt(L, d, hy + cy), ang = time * 0.09;
      lamp(g, hx, hy, w.r * 1.15, dk * 0.28, 1);
      for (let i = 0; i < 30; i++) { const a = ang * 0.5 + i * Math.PI / 15, tw = ((i * 7 + Math.floor(time * 2.2 + i * 0.7)) % 5 === 0) ? 0.25 : 1, x = hx + Math.cos(a) * (w.r - 1), y = hy + Math.sin(a) * (w.r - 1), a2 = (0.45 + dk * 0.55) * tw; if (a2 < 0.2) continue; dot(g, x, y, i % 6 === 0 ? '#ff7060' : i % 6 === 3 ? '#9fe0ff' : '#ffd36b', 2); lamp(g, x, y, 4, a2 * 0.8); }
      for (let i = 0; i < 12; i++) { const a = ang + i * Math.PI / 6; dot(g, hx + Math.cos(a) * (w.r * 0.4), hy + Math.sin(a) * (w.r * 0.4), '#ffd36b', 1); }
      dot(g, hx, hy, '#ffe9a0', 3); }
    for (const st of Ly.strings) { if (st.x1 - off < -20 || st.x0 - off > VW + 20) continue; const sw = Math.sin(time * 1.3 + st.sd), n = Math.max(3, Math.round((st.x1 - st.x0) / 10));
      for (let i = 1; i < n; i++) { const u = i / n, x = lerp(st.x0, st.x1, u) - off + Math.sin(time * 1.1 + st.sd + u * 3) * 0.7 * u * (1 - u) * 4, y = y0 + lerp(st.y0, st.y1, u) + st.sag * 4 * u * (1 - u) * (1 + 0.1 * sw) + 2 + Math.sin(time * 2.1 + i * 1.3 + st.sd) * 0.5, dk = darkAt(L, d, y + cy), a = 0.4 + dk * 0.6;
        dot(g, x, y, i % 3 === 0 ? '#ffb070' : '#ffe08a', 2); lamp(g, x, y, 5 + dk * 3, a * 0.6, 0.85 + 0.15 * Math.sin(time * 3 + i * 2 + st.sd)); } }
  }
}

/* ================= THE LANDMARK (claude/fairfix5; the review: "no landmark pulling you on"): THE BIG WHEEL, lit, on the skyline from the first screen. A very low parallax
   (LM_F) anchored on the real wheel (L.wheel, col 304): far off it stands small at the right of the sky and comes toward the middle as you come, growing; near it, it
   gives way to the real one (a fade, so there are never two); past it, it stays behind you at the left. Its rim bulbs chase, brighter with the dusk ================= */
const LM_F = 0.025;
function drawLandmark(g, cx, cy, VW, VH, L, time, d, dY) {
  const Wr = L.wheel; if (!Wr) return; const ref = Wr.px - VW / 2, far = Math.abs(cx - ref), a0 = clamp01((far - 140) / 260); if (a0 <= 0.02) return;
  const prox = clamp01(1 - far / Math.max(1, ref)), r = 30 + 44 * Math.pow(prox, 1.4), hx = VW / 2 - (cx - ref) * LM_F, base = Math.round(VH - 94 + dY * F_MID) - 6, hy = base - r - 12;
  if (hx < -r - 30 || hx > VW + r + 30) return; const ang = time * 0.07, lit = clamp01(0.45 + d * 0.6 + prox * 0.3);
  g.save(); g.globalAlpha = a0;
  ln(g, hx, hy, hx - r * 0.62, base + 20, '#2a1c1e', 3); ln(g, hx, hy, hx + r * 0.62, base + 20, '#2a1c1e', 3); ln(g, hx - r * 0.42, hy + r * 0.7, hx + r * 0.42, hy + r * 0.7, '#2a1c1e', 2);   /* its A-frame legs */
  g.strokeStyle = '#3a2a2a'; g.lineWidth = 1; for (let i = 0; i < 16; i++) { const a = ang + i * Math.PI / 8; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + Math.cos(a) * r, hy + Math.sin(a) * r); g.stroke(); }
  g.lineWidth = 2; g.beginPath(); g.arc(hx, hy, r, 0, 6.3); g.stroke(); g.lineWidth = 1; g.beginPath(); g.arc(hx, hy, r * 0.42, 0, 6.3); g.stroke();
  for (let i = 0; i < 8; i++) { const a = ang + i * Math.PI / 4, gx = hx + Math.cos(a) * r, gy = hy + Math.sin(a) * r, s = Math.max(3, r / 9); ln(g, gx, gy, gx, gy + s * 0.6, '#1e1418'); rc(g, gx - s * 0.6, gy + s * 0.6, s * 1.2, s * 0.8, ['#9a3a30', '#c8901c', '#2f5f9a'][i % 3]); }
  rc(g, hx - 3, hy - 3, 6, 6, '#6a5030');
  lamp(g, hx, hy, r * 1.25, lit * 0.32 * a0, 1); g.globalAlpha = a0;
  const nb = Math.round(24 + r * 0.3); for (let i = 0; i < nb; i++) { const a = ang * 0.6 + i * 2 * Math.PI / nb, on = (i + Math.floor(time * 6)) % 4 !== 0, x = hx + Math.cos(a) * (r - 1), y = hy + Math.sin(a) * (r - 1);
    if (on) { dot(g, x, y, i % 8 === 0 ? '#ff7060' : i % 8 === 4 ? '#9fe0ff' : '#ffe08a', r > 50 ? 2 : 1); } }
  for (let i = 0; i < 16; i++) { const a = ang + i * Math.PI / 8; dot(g, hx + Math.cos(a) * r * 0.42, hy + Math.sin(a) * r * 0.42, '#ffd36b', 1); }
  dot(g, hx, hy, '#ffe9a0', 3); g.restore();
}

/* ================= SPARKS and FIREFLIES: over the layers, under the world ================= */
export function drawMotes(g, cx, cy, VW, VH, L, time, d, dY) {
  const Ly = layout(L.W), gl = VH - 94 + dY * F_MID, fl = smooth(0.12, 0.45, d) * (1 - 0.35 * smooth(0.8, 1, d)), em = smooth(0.45, 0.85, d);
  if (fl > 0.02) for (const f of Ly.flies) { const W = VW + 160, x = (((f.u * W * 3 - cx * 0.45 + Math.sin(time * 0.35 + f.p) * 14) % W) + W) % W - 80, y = gl - 4 - f.v * 38 + Math.sin(time * 0.8 + f.p * 2) * 5;
    if (y < 0 || y > VH) continue; const a = fl * (0.5 + 0.5 * Math.sin(time * 1.9 + f.p * 5)); if (a < 0.1) continue;
    lamp(g, x, y, 5, a * 0.6); dot(g, x, y, 'rgba(226,246,130,' + a.toFixed(2) + ')', 1); }
  if (em > 0.02) for (let i = 0; i < Ly.embers.length; i++) { const e = Ly.embers[i], W = VW + 80, p = ((e.v - time * (0.04 + (i % 4) * 0.012)) % 1 + 1) % 1, x = (((e.u * W * 4 - cx * 0.55 + Math.sin(time * 0.6 + e.p) * 12 + time * 6) % W) + W) % W - 40, y = p * (VH + 20) - 10;
    const a = em * Math.sin(p * 3.14) * (0.6 + 0.4 * Math.sin(time * 6 + e.p * 4)); if (a < 0.08) continue; dot(g, x, y, 'rgba(255,' + Math.round(130 + 80 * p) + ',60,' + a.toFixed(2) + ')', i % 3 ? 1 : 2); }
  /* (claude/fairfix5) THE FAIR'S OWN WEATHER (it was Waymeet's pollen): CHAFF AND STRAW blowing through the turnstiles and down the midway, thinning by the rides yard;
     ASH drifting down once the effigy has burned (L.effigies' burning one: past its column) */
  const col = (cx + VW / 2) / TS, chaff = clamp01((260 - col) / 140);
  if (chaff > 0.05) for (let i = 0; i < 26; i++) { const W = VW + 60, u = ((i * 0.6180339) % 1), x = (((u * W * 3 - cx * 0.9 + time * (38 + (i % 5) * 9)) % W) + W) % W - 30, y = ((i * 0.381966 % 1) * VH * 0.85 + Math.sin(time * 1.7 + i) * 9 + time * (4 + i % 3)) % VH;
    if (i / 26 > chaff) continue; const ang = time * (2 + i % 3) + i; g.fillStyle = i % 3 ? 'rgba(232,200,110,0.75)' : 'rgba(200,160,90,0.7)'; g.fillRect(Math.round(x), Math.round(y), i % 4 ? 2 : 3, 1); if (Math.sin(ang) > 0.3) g.fillRect(Math.round(x + 1), Math.round(y - 1), 1, 1); }
  const burn = (L.effigies || []).find(q => q.burns), ash = burn && (lastBurnT > 2 || lastDone) ? clamp01((col - burn.x + 10) / 40) : 0;
  if (ash > 0.05) for (let i = 0; i < 22; i++) { const W = VW + 40, x = ((((i * 0.7548) % 1) * W * 2 - cx * 0.7 + Math.sin(time * 0.5 + i) * 18) % W + W) % W - 20, y = ((i * 0.5698 % 1) * VH + time * (10 + i % 4 * 3)) % VH;
    g.fillStyle = i % 5 === 0 ? 'rgba(255,140,60,' + (0.7 * ash).toFixed(2) + ')' : 'rgba(150,140,140,' + (0.55 * ash).toFixed(2) + ')'; g.fillRect(Math.round(x), Math.round(y), i % 3 ? 1 : 2, 1); }
}

/* ================= NEAR: the bunting strings (the crowd is FAW.drawCrowd, drawn by main.js just before) ================= */
export function drawNear(g, cx, cy, VW, L, d, time) {
  const Ly = layout(L.W), gy = (L.green ? L.green.floor : 28) * TS - cy, off = cx * F_NEAR, t = smooth(0, 1, d), mixc = (c) => 'rgb(' + Math.round(lerp(c[0], 24, t * 0.6)) + ',' + Math.round(lerp(c[1], 28, t * 0.6)) + ',' + Math.round(lerp(c[2], 70, t * 0.6)) + ')';
  const FL = [[200, 56, 44], [236, 224, 196], [214, 160, 40], [52, 120, 160]].map(mixc), line = mixc([42, 28, 36]);
  if (gy < -140 || gy - 130 > 260) return;
  let prev = null;
  for (const p of Ly.nearPoles) { const x = p.x - off, top = gy - 20 - p.h; if (x < -140 && prev === null) { prev = { x, top }; continue; } if (prev && prev.x > VW + 4) break;
    if (x > -10 && x < VW + 10) { g.fillStyle = line; g.fillRect(Math.round(x) - 1, Math.round(top), 2, Math.round(gy - 20 - top)); g.fillRect(Math.round(x) - 2, Math.round(top) - 1, 4, 2); }
    if (prev && !(x < -2 || prev.x > VW + 2)) { const sag = 13 + (x - prev.x) / 12, n = Math.max(4, Math.round((x - prev.x) / 7)), sw = Math.sin(time * 1.2 + p.x * 0.05);
      g.strokeStyle = line; g.lineWidth = 1; g.beginPath(); const pts = [];
      for (let i = 0; i <= n; i++) { const u = i / n, px = lerp(prev.x, x, u), py = lerp(prev.top, top, u) + sag * 4 * u * (1 - u) * (1 + 0.08 * sw); pts.push([px, py]); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
      for (let i = 0; i < n; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], mx = (ax + bx) / 2, my = (ay + by) / 2, wob = Math.sin(time * 2.4 + i + p.x) * 0.9; if (mx < -6 || mx > VW + 6) continue;
        tri(g, ax, ay, bx, by, mx + wob, my + 8, FL[(i + Math.floor(p.x)) & 3]); } }
    prev = { x, top }; }
}

/* ================= THE EFFIGY: five stages going up; one catches fire; then the ash ================= */
function effigyBody(g, sx, gy, stage, time, s = 1.15) {
  const ink = 'rgba(30,20,40,0.92)';
  const wv = (path, fill, hatch) => { g.save(); g.beginPath(); path(); g.fillStyle = fill; g.fill(); g.clip(); g.strokeStyle = hatch; g.lineWidth = 1; for (let i = -140; i < 140; i += 4) { g.beginPath(); g.moveTo(sx + i, gy - 150); g.lineTo(sx + i + 60, gy + 10); g.stroke(); } g.restore(); };
  const P = (x, y) => [sx + x * s, gy - y * s];
  const poly = pts => () => { pts.forEach(([x, y], i) => { const [a, b] = P(x, y); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.closePath(); };
  if (stage >= 1) { wv(poly([[-16, 0], [-6, 0], [-3, 44], [-15, 46]]), '#5a4520', '#3a2c12'); wv(poly([[6, 0], [16, 0], [15, 46], [3, 44]]), '#5a4520', '#3a2c12'); }
  if (stage >= 2) { wv(poly([[-19, 44], [19, 44], [22, 60], [16, 92], [-16, 92], [-22, 60]]), '#644c22', '#3a2c12'); }
  if (stage >= 3) { wv(poly([[-22, 84], [-58, 108], [-62, 100], [-24, 74]]), '#5a4520', '#3a2c12'); wv(poly([[22, 84], [58, 108], [62, 100], [24, 74]]), '#5a4520', '#3a2c12');
    g.strokeStyle = '#5a4520'; g.lineWidth = 3; g.beginPath(); const [ha, hb] = P(0, 110); g.arc(ha, hb, 15 * s, 0, 6.3); g.stroke(); }
  if (stage >= 4) { const [ha, hb] = P(0, 110); g.fillStyle = '#644c22'; g.beginPath(); g.arc(ha, hb, 14 * s, 0, 6.3); g.fill();
    g.fillStyle = '#c8901c'; for (let i = -3; i <= 3; i++) { const a = -1.57 + i * 0.38, [x0, y0] = [ha + Math.cos(a) * 14 * s, hb + Math.sin(a) * 14 * s]; g.beginPath(); g.moveTo(x0 - 3, y0); g.lineTo(x0 + Math.cos(a) * 14, y0 + Math.sin(a) * 14); g.lineTo(x0 + 3, y0); g.fill(); }   // the crown of wheat
    g.globalCompositeOperation = 'lighter'; const gl = 0.5 + 0.4 * Math.sin(time * 3); for (const ex of [-5, 5]) { g.fillStyle = 'rgba(255,120,40,' + gl + ')'; g.fillRect(Math.round(ha + ex * s - 1), Math.round(hb - 2), 3, 3); } g.globalCompositeOperation = 'source-over'; }
  if (stage < 4) {   // the scaffold: poles, beams and braces, and the little dark builders on it
    const top = 138 - stage * 8; g.strokeStyle = ink; g.lineWidth = 2;
    for (const x of [-52, 52]) { const [a, b] = P(x, 0), [c, d] = P(x, top); g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }
    for (const y of [36, 76, 116].filter(y => y < top)) { const [a, b] = P(-52, y), [c, d] = P(52, y); g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }
    g.lineWidth = 1; for (const [x0, y0, x1, y1] of [[-52, 0, 52, 36], [52, 0, -52, 36], [-52, 36, 52, 76]]) { const [a, b] = P(x0, y0), [c, d] = P(x1, y1); g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }
    for (let i = 0; i < 2 + (stage & 1); i++) { const [a, b] = P(-40 + i * 40 + Math.sin(time * 0.6 + i) * 6, 36 + (i % 2) * 40); g.fillStyle = ink; g.fillRect(Math.round(a), Math.round(b - 9), 3, 9); g.fillRect(Math.round(a) - 1, Math.round(b - 11), 5, 3); } }
}
const FIRE_PTS = once('firepts', () => { const r = mulberry(808), pts = []; const add = (x, y, w) => pts.push({ x: x + (r() - 0.5) * w, y, ph: r() * 6.3, sz: 0.8 + r() * 0.7 });
  for (let i = 0; i < 9; i++) add(i & 1 ? 10 : -10, 2 + i * 5, 8); for (let i = 0; i < 12; i++) add(-18 + (i % 4) * 12, 46 + Math.floor(i / 4) * 16, 8); for (let i = 0; i < 8; i++) { const u = (i >> 1) / 3; const sd = i & 1 ? 1 : -1; add(sd * (24 + u * 34), 86 + u * 20, 6); }
  for (let i = 0; i < 7; i++) add(-12 + i * 4, 106 + (i % 3) * 5, 3); return pts.sort((a, b) => a.y - b.y); });
function effigyFire(g, sx, gy, bt, time, s = 1.15) {
  const k = clamp01(bt / 6), out = clamp01((bt - 10) / 14), sz = s / 1.15, glow = once('glowE', () => { const [c, gg] = mk(128, 128), gr = gg.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, 'rgba(255,190,90,1)'); gr.addColorStop(0.4, 'rgba(255,110,40,0.5)'); gr.addColorStop(1, 'rgba(255,60,20,0)'); gg.fillStyle = gr; gg.fillRect(0, 0, 128, 128); return c; });
  const fk = 0.85 + 0.15 * Math.sin(time * 9) + 0.08 * Math.sin(time * 23);
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, 0.15 + k * 0.85) * fk * 0.7 * (1 - 0.5 * out); const R = (70 + k * 120) * sz; g.drawImage(glow, sx - R, gy - 78 * s - R * 0.9, R * 2, R * 2); g.restore();
  // smoke first (behind the flames): a thick brown-black column going up and leaning with the wind
  for (let i = 0; i < 16; i++) { const p = (time * 0.18 + i / 16) % 1, rise = 40 + p * (120 + k * 90), x = sx + Math.sin(p * 5 + i * 1.7) * (4 + p * 10) + p * p * 40, y = gy - 120 * s * (0.4 + k * 0.6) - rise * 0.8, z = (3 + p * 11) * (0.4 + k * 0.6);
    g.fillStyle = 'rgba(' + Math.round(54 - 20 * p) + ',' + Math.round(38 - 14 * p) + ',' + Math.round(40 - 8 * p) + ',' + ((1 - p) * 0.55 * k).toFixed(2) + ')'; g.fillRect(Math.round(x - z / 2), Math.round(y - z / 2), Math.round(z), Math.round(z)); }
  // the flames climb the figure from the feet
  for (let i = 0; i < FIRE_PTS.length; i++) { const f = FIRE_PTS[i], on = clamp01((k - (f.y / 125) * 0.75 - 0.03) / 0.2); if (on <= 0) continue;
    const h = (9 + 11 * f.sz) * s * (1 - 0.65 * out) * (0.45 + 0.55 * on) * (1 + 0.28 * Math.sin(time * 9 + f.ph) + 0.15 * Math.sin(time * 17 + f.ph * 2)), w = 5.6 * f.sz * s * (0.6 + 0.4 * on), x = sx + f.x * s + Math.sin(time * 3 + f.ph) * 1.2, y = gy - f.y * s;
    const tp = Math.sin(time * 7 + f.ph) * 2; flame(g, x, y, w, h, tp, 'rgba(214,56,16,0.9)'); flame(g, x, y, w * 0.68, h * 0.8, tp * 0.7, 'rgba(255,138,32,0.95)'); flame(g, x, y, w * 0.36, h * 0.52, 0, 'rgba(255,226,120,0.98)'); }
  if (k > 0.7) for (let i = 0; i < 5; i++) { const u = (k - 0.7) / 0.3 * (1 - 0.8 * out), h = (26 + 12 * Math.sin(time * 8 + i * 2)) * u * s, x = sx + (i - 2) * 6 * s, y = gy - 112 * s; flame(g, x, y, 6, h, Math.sin(time * 5 + i) * 2, 'rgba(255,120,30,0.85)'); flame(g, x, y, 3, h * 0.62, 0, 'rgba(255,224,120,0.95)'); }   // the head is a torch
  for (let i = 0; i < 26; i++) { const p = (time * 0.55 + i * 0.173) % 1, a = (1 - p) * clamp01(k * 1.3); if (a < 0.05) continue; g.fillStyle = 'rgba(255,' + Math.round(140 + 90 * (1 - p)) + ',60,' + a.toFixed(2) + ')'; g.fillRect(Math.round(sx + Math.sin(i * 2.7 + p * 5) * (10 + p * 36) * s), Math.round(gy - (30 + i % 5 * 14) * s - p * (60 + (i % 7) * 12)), 1 + (i % 4 === 0), 1); }
}
function effigyAsh(g, sx, gy, time, s = 1.15) {
  const P = (x, y) => [Math.round(sx + x * s), Math.round(gy - y * s)], col = '#0e0a09';
  const L2 = (x0, y0, x1, y1, w) => { const [a, b] = P(x0, y0), [c, d] = P(x1, y1); ln(g, a + 0.5, b + 0.5, c + 0.5, d + 0.5, col, w); };
  g.save(); L2(-10, 0, -9, 42, 5); L2(10, 0, 8, 38, 5); L2(-20, 44, -15, 92, 4); L2(19, 44, 16, 70, 4);   // the legs and the torso's two posts, one snapped
  for (let i = 0; i < 4; i++) { const y = 52 + i * 10; L2(-18 + i * 0.5, y, 16 - i * 0.5, y + 2, 1); }   // the ribs
  L2(-22, 84, -50, 100, 4); L2(24, 78, 38, 84, 3);   // an arm and a stub
  L2(-52, 0, -52, 70, 2); L2(52, 0, 52, 24, 2);   // the scaffold's poles, burnt through
  g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); const [ha, hb] = P(0, 110); g.arc(ha, hb, 12, 0.5, 4.1); g.stroke();   // what is left of the head
  for (let i = 0; i < 14; i++) { const [a, b] = P(-16 + (i * 13) % 34, 2 + (i * 37) % 90), p = 0.5 + 0.5 * Math.sin(time * 2.4 + i * 1.9); g.fillStyle = 'rgba(255,' + Math.round(90 + 80 * p) + ',30,' + (0.35 + 0.55 * p).toFixed(2) + ')'; g.fillRect(a, b, 2, 1); }   // the embers
  g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; const gl = glowSprE(); g.globalAlpha = 0.28 + 0.1 * Math.sin(time * 2); g.drawImage(gl, sx - 34 * s / 1.15, gy - 28 * s / 1.15, 68 * s / 1.15, 40 * s / 1.15); g.restore();
  for (let i = 0; i < 12; i++) { const p = (time * 0.07 + i / 12) % 1, x = sx + Math.sin(p * 4 + i) * (3 + p * 8) + p * p * 30, y = gy - 70 - p * 170, z = 3 + p * 9; g.fillStyle = 'rgba(48,40,46,' + ((1 - p) * 0.38).toFixed(2) + ')'; g.fillRect(Math.round(x - z / 2), Math.round(y - z / 2), Math.round(z), Math.round(z)); }   // the smoke column, thin and slow
}
const glowSprE = () => once('glowAsh', () => { const [c, gg] = mk(68, 40), gr = gg.createRadialGradient(34, 30, 1, 34, 30, 32); gr.addColorStop(0, 'rgba(255,120,40,0.9)'); gr.addColorStop(1, 'rgba(255,60,20,0)'); gg.fillStyle = gr; gg.fillRect(0, 0, 68, 40); return c; });
const WORLD_S = 1.3;   // the effigy that stands IN the world (world: true) is bigger: a little over eleven tiles
const effX = (e, cx) => e.world ? Math.round(e.x * TS + 8 - cx) : Math.round((e.x * TS - cx) * F_NEAR + 90);
let lastDone = false;
export function drawEffigies(g, cx, cy, VW, L, time, dusk, burnT, burnDone) {
  lastBurnT = burnT || 0; lastDone = !!burnDone; const gy = (L.green ? L.green.floor : 28) * TS - cy;
  for (const e of L.effigies || []) { const sx = effX(e, cx), s = e.world ? WORLD_S : 1.15; if (sx < -160 || sx > VW + 160) continue;
    const burning = e.burns && burnT > 0 && !burnDone, al = Math.min(0.85, 0.4 + dusk * 0.5);
    if (e.world ? e.burns && burnDone : e.stage === 'ash' && burnDone) { g.globalAlpha = e.world ? 1 : Math.min(0.9, 0.45 + dusk * 0.5); effigyAsh(g, sx, gy, time, s); g.globalAlpha = 1; continue; }   // the burnt frame
    const stage = e.stage === 'ash' ? 3 : e.stage, bt = burning ? burnT : 0, charred = clamp01((bt - 8) / 6);   // an ash entry is still a building effigy until the burn is done
    g.globalAlpha = (burning ? 1 : e.world ? 1 : al) * (1 - 0.75 * charred); effigyBody(g, sx, gy, stage, time, s); g.globalAlpha = 1;
    if (charred > 0) { g.globalAlpha = charred; effigyAsh(g, sx, gy, time, s); g.globalAlpha = 1; }
    if (burning) effigyFire(g, sx, gy, burnT, time, s); }
}
/* the night overlay (fair_rides.js drawNight) cuts a hole round a burning effigy so its glow is not dimmed to nothing: [[x, y, radius, strength]] in screen px */
export function fireHoles(cx, cy, VW, L) {
  const out = []; if (!(lastBurnT > 0) || lastDone) return out; const gy = (L.green ? L.green.floor : 28) * TS - cy, k = clamp01(lastBurnT / 6);
  for (const e of L.effigies || []) if (e.burns) { const sx = effX(e, cx), s = e.world ? WORLD_S : 1.15; if (sx > -200 && sx < VW + 200) out.push([sx, gy - 77 * s, (60 + k * 90) * s / 1.15, 0.35 + 0.6 * k]); }
  return out;
}
