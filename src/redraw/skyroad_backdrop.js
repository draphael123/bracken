// skyroad_backdrop.js - THE SKY ROAD's own BACKDROP and LANDMARKS (claude/skyroadart). The greybox wore the stock crag far/mid layers; this is the high sky country:
//   far     a range of flat-topped mesas and needles in the haze, level on the horizon, with a fleet of war-kites far out drifting east on the wind (parallax 0.08)
//   mid     nearer mesas, strata and a sunlit left rim, blue with air (0.18)
//   LANDMARK  a great wind-carved feature every ~300 px on a slow parallax (0.32), three kinds in turn: THE SUN-RING (a spire with a stone ring the sky shows through, a sun glyph on top,
//             a war-kite tethered to it), THE MAST SPIRE (an iron mast and a streaming cloth banner), THE BROKEN ARCH (a piece of the old sky bridge) - so one is in view on almost
//             every screen, whichever way you face
//   THE EYRIE the Roc's black spire with the nest on its crown, high on the horizon from the first screen: it stands at the right, slides left and grows clear of the haze as the road
//             goes on, her shape circling it (so the end of the road is in sight from the start)
//   LIGHT   long shafts of low sun through the cloud (additive), warm on the left of every landmark
// Every static picture is baked ONCE (memo); a frame is a handful of drawImage calls.   drawBackdrop(g, cx, cy, VW, VH, L, time, dY)
import { mulberry } from '../px.js';
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const lerp = (a, b, t) => a + (b - a) * t;
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => { const A = rgbOf(a), B = rgbOf(b); return '#' + [0, 1, 2].map(i => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, '0')).join(''); };

/* one column of stone built row by row: halfwidth hw(y) (0 at the top, 1 at the foot), strata in bands, a lit left rim, a shaded right side; jitter makes the edge wind-cut */
function column(g, cx, y0, y1, hw, pal, seed, o = {}) {
  const r = mulberry(seed); let band = 0, bandLeft = 0, shift = 0;
  let jl = 0, jr = 0;
  for (let y = y0; y < y1; y++) {
    if (bandLeft-- <= 0) { bandLeft = 2 + ((r() * 6) | 0); band++; shift = ((r() * 3) | 0) - 1; }
    if (r() < 0.12) jl = Math.max(-1, Math.min(1, jl + (r() < 0.5 ? -1 : 1))); if (r() < 0.12) jr = Math.max(-1, Math.min(1, jr + (r() < 0.5 ? -1 : 1)));
    const t = (y - y0) / Math.max(1, y1 - y0), w = hw(t), xl = Math.round(cx - w + jl), xr = Math.round(cx + w + jr), wd = xr - xl; if (wd <= 0) continue;
    const base = pal[Math.max(0, Math.min(pal.length - 1, 2 + shift))];
    rc(g, xl, y, wd, 1, base);
    rc(g, xl, y, Math.min(2, wd), 1, pal[Math.min(pal.length - 1, 4)]);                      /* the lit rim, left */
    if (wd > 5) rc(g, xr - Math.min(4, wd >> 1), y, Math.min(4, wd >> 1), 1, pal[0]);       /* the shade, right */
    if (wd > 8) rc(g, xr - Math.min(5, wd >> 1) - 1, y, 1, 1, pal[1]);
    if (o.bedLines && band % 3 === 0 && bandLeft === 0) rc(g, xl, y, wd, 1, pal[1]);
  }
}
const PALF = ['#5a5a80', '#6e6e96', '#8a88ae', '#a8a2c0', '#cfb4b8'];   /* far: lavender, a rose rim */
const PALM = ['#3a3a62', '#4c4c78', '#66668e', '#8a86ae', '#e0a888'];   /* mid: blue stone, a warm rim */
const PALL = ['#2a2a4c', '#3c3a64', '#58547c', '#7a7498', '#f0b078'];   /* landmark: deeper, the sun on its left */

/* THE FAR RANGE: 640 wide, tileable (mesas crossing the seam are mirrored by wrapping) */
const farRange = () => once('far', () => { const W = 640, H = 100, [c, g] = mk(W, H), r = mulberry(8101);
  for (let i = 0; i < 9; i++) { const cxm = Math.round(i * 71 + 20 + r() * 30), top = 18 + ((r() * 40) | 0), hw0 = 18 + ((r() * 26) | 0), needle = r() < 0.4;
    const hwf = t => needle ? (t < 0.12 ? lerp(2, hw0 * 0.35, t / 0.12) : hw0 * 0.3 + t * hw0 * 0.35) : (t < 0.06 ? lerp(hw0 * 0.7, hw0, t / 0.06) : hw0 + t * hw0 * 0.55);
    column(g, cxm, top, H, hwf, PALF, 900 + i); if (cxm + hw0 * 1.6 > W) column(g, cxm - W, top, H, hwf, PALF, 900 + i); if (cxm - hw0 * 1.6 < 0) column(g, cxm + W, top, H, hwf, PALF, 900 + i); }
  g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(236,206,196,0)'); gr.addColorStop(1, 'rgba(236,214,196,0.7)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
  return c; });
const midRange = () => once('mid', () => { const W = 576, H = 120, [c, g] = mk(W, H), r = mulberry(8202);
  for (let i = 0; i < 6; i++) { const cxm = Math.round(i * 96 + 30 + r() * 30), top = 26 + ((r() * 40) | 0), hw0 = 22 + ((r() * 24) | 0), tier = r() < 0.5;
    const hwf = t => tier ? hw0 * (0.72 + 0.28 * (Math.floor(t * 4) / 3)) + t * 8 : (t < 0.05 ? lerp(hw0 * 0.6, hw0, t / 0.05) : hw0 + t * hw0 * 0.3);
    column(g, cxm, top, H, hwf, PALM, 1900 + i, { bedLines: true }); if (cxm + hw0 * 1.4 > W) column(g, cxm - W, top, H, hwf, PALM, 1900 + i, { bedLines: true }); if (cxm - hw0 * 1.4 < 0) column(g, cxm + W, top, H, hwf, PALM, 1900 + i, { bedLines: true }); }
  g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(200,190,230,0)'); gr.addColorStop(1, 'rgba(200,196,236,0.55)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
  return c; });

/* THE LANDMARKS, 120 wide x 210 high, baseline at the foot */
const LM_W = 120, LM_H = 210;
const landmark = v => once('lm' + v, () => { const [c, g] = mk(LM_W, LM_H), cx = 60;
  if (v === 0) {   /* THE SUN-RING: a fat spire with a ring of stone through it, a sun glyph on its crown */
    column(g, cx, 40, LM_H, t => t < 0.08 ? lerp(8, 20, t / 0.08) : 20 + t * 22, PALL, 31, { bedLines: true });
    g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.ellipse(cx, 100, 11, 15, 0, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over';
    for (let a = 0; a < 360; a += 3) { const rad = a * Math.PI / 180, x = cx + Math.cos(rad) * 12, y = 100 + Math.sin(rad) * 16; rc(g, x, y, 1, 1, a > 90 && a < 270 ? PALL[4] : PALL[0]); rc(g, x + (a > 90 && a < 270 ? 1 : -1), y, 1, 1, a > 90 && a < 270 ? PALL[3] : PALL[1]); }
    rc(g, cx - 3, 28, 6, 14, PALL[2]); rc(g, cx - 3, 28, 2, 14, PALL[4]); rc(g, cx - 5, 26, 10, 3, PALL[3]); rc(g, cx - 5, 26, 10, 1, '#ffe2a0');   /* the crown stone */
    for (const [dx, dy] of [[0, -4], [0, 4], [-4, 0], [4, 0], [3, 3], [-3, -3], [3, -3], [-3, 3]]) rc(g, cx + dx, 20 + dy, 1, 1, '#ffd870'); rc(g, cx - 1, 19, 3, 3, '#ffe9a0');   /* the sun glyph, a little gold */
  } else if (v === 1) {   /* THE MAST SPIRE: a needle with an iron mast and a streaming banner */
    column(g, cx, 60, LM_H, t => t < 0.1 ? lerp(4, 10, t / 0.1) : 10 + t * 26, PALL, 47, { bedLines: true });
    rc(g, cx - 1, 6, 2, 56, '#1c1a2a'); rc(g, cx - 1, 6, 1, 56, '#6a6a88'); rc(g, cx - 4, 5, 8, 2, '#1c1a2a'); rc(g, cx - 1, 2, 2, 4, '#f0b078');
    for (const y of [16, 30, 44]) { rc(g, cx - 3, y, 6, 1, '#1c1a2a'); }
  } else {   /* THE BROKEN ARCH: two piers and the spring of a great arch, the old sky bridge's last piece */
    column(g, cx - 28, 70, LM_H, t => 10 + t * 16, PALL, 53, { bedLines: true }); column(g, cx + 30, 100, LM_H, t => 9 + t * 14, PALL, 59, { bedLines: true });
    for (let a = 200; a <= 340; a += 2) { const rad = a * Math.PI / 180, x = cx + Math.cos(rad) * 40 + 2, y = 120 + Math.sin(rad) * 52; if (x > cx - 28 && x < cx + 16) { rc(g, x, y, 1, 7, PALL[2]); rc(g, x, y, 1, 1, PALL[4]); rc(g, x, y + 6, 1, 1, PALL[0]); } }
    rc(g, cx - 30, 66, 6, 5, PALL[3]); rc(g, cx - 30, 66, 6, 1, PALL[4]);
  }
  g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(0, 0, 0, LM_H); gr.addColorStop(0, 'rgba(60,50,100,0)'); gr.addColorStop(1, 'rgba(176,170,220,0.5)'); g.fillStyle = gr; g.fillRect(0, 0, LM_W, LM_H); g.globalCompositeOperation = 'source-over';
  return c; });

/* THE EYRIE: the Roc's spire, black basalt, a crown of nest */
const eyrie = () => once('eyrie', () => { const W = 150, H = 270, [c, g] = mk(W, H), cx = 75, PAL = ['#0c0a14', '#1a1626', '#2c2438', '#463a50', '#e08a50'];
  column(g, cx, 60, H, t => t < 0.05 ? lerp(10, 18, t / 0.05) : 18 + t * 40, PAL, 71, { bedLines: true });
  column(g, cx - 38, 150, H, t => 6 + t * 22, PAL, 73); column(g, cx + 40, 170, H, t => 5 + t * 20, PAL, 79);
  /* the nest on the crown: a basket of boughs and bones, a bone-white rim, ember light in it */
  g.fillStyle = '#4a3828'; g.beginPath(); g.ellipse(cx, 58, 26, 8, 0, 0, 7); g.fill(); g.fillStyle = '#6a5238'; g.beginPath(); g.ellipse(cx, 55, 24, 5, 0, 0, 7); g.fill(); g.fillStyle = '#1a1018'; g.beginPath(); g.ellipse(cx, 54, 18, 3, 0, 0, 7); g.fill();
  const r = mulberry(404); for (let i = 0; i < 16; i++) { const a = r() * Math.PI * 2, rr = 20 + r() * 6; rc(g, cx + Math.cos(a) * rr, 54 + Math.sin(a) * 5, 2 + r() * 3, 1, '#e4dcc8'); }
  for (const x of [cx - 17, cx + 15]) { rc(g, x, 26, 2, 30, '#1c1a2a'); rc(g, x, 26, 1, 30, '#6a6a88'); rc(g, x - 2, 24, 6, 2, '#1c1a2a'); }   /* two iron kite-masts */
  g.fillStyle = 'rgba(255,140,60,0.5)'; g.beginPath(); g.ellipse(cx, 55, 12, 2, 0, 0, 7); g.fill();
  return c; });

/* the feature slot i of the world's x: every 300 px, a kind in turn, nudged by its index so they are not a fence */
const SLOT = 300;
export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY) {
  const full = true;
  const base = VH - 52;
  /* THE SHAFTS: long low sun through the cloud, from the right (additive) - under every mountain */
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 4; k++) { const x0 = ((k * 97 + 40 - cx * 0.04 + Math.sin(time * 0.05 + k) * 8) % (VW + 160) + VW + 160) % (VW + 160) - 60, w = 22 + k * 7;
    const gr = g.createLinearGradient(x0, 0, x0 - 90, VH); gr.addColorStop(0, 'rgba(255,224,170,0.00)'); gr.addColorStop(0.3, 'rgba(255,214,150,' + (0.055 + 0.015 * Math.sin(time * 0.4 + k * 2)).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,200,130,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + w, 0); g.lineTo(x0 + w - 90, VH); g.lineTo(x0 - 90, VH); g.closePath(); g.fill(); }
  g.restore();
  /* FAR RANGE and the kite fleet on the wind */
  { const c = farRange(), w = c.width; let x = ((-cx * 0.08) % w + w) % w; if (x > 0) x -= w; const y = Math.round(base - c.height + 14 + Math.min(dY * 0.08, 22));
    for (; x < VW; x += w) g.drawImage(c, Math.round(x), y);
    for (let i = 0; i < 6; i++) { const kx = ((i * 131 + time * (5 + i) - cx * 0.1) % (VW + 100) + VW + 100) % (VW + 100) - 50, ky = y - 4 + ((i * 29) % 40) + Math.sin(time * 0.6 + i) * 3;
      g.fillStyle = i % 2 ? '#a0506a' : '#c88a6a'; g.beginPath(); g.moveTo(kx, ky - 4); g.lineTo(kx + 3, ky); g.lineTo(kx, ky + 4); g.lineTo(kx - 3, ky); g.closePath(); g.fill(); g.fillStyle = 'rgba(90,60,90,0.5)'; g.fillRect(Math.round(kx), Math.round(ky + 4), 1, 6); } }
  /* THE EYRIE on the horizon: the end of the road in sight from the start */
  { const prog = Math.max(0, Math.min(1, (cx + VW / 2) / (L.W * 16))), c = eyrie(), ex = Math.round(lerp(VW * 0.82, VW * 0.30, prog) - c.width / 2), ey = Math.round(base + 38 - c.height + Math.min(dY * 0.1, 40));
    g.globalAlpha = 0.5 + 0.5 * prog; g.drawImage(c, ex, ey); g.globalAlpha = 1;
    g.fillStyle = 'rgba(206,190,224,' + (0.42 * (1 - prog)).toFixed(3) + ')'; g.fillRect(ex, ey, c.width, c.height);   /* the haze it comes out of */
    const a = time * 0.5, rx = ex + c.width / 2 + Math.cos(a) * 54, ry = ey + 40 + Math.sin(a) * 12 + Math.sin(time * 3) * 1;   /* her, circling, small */
    g.fillStyle = '#18121c'; const wing = Math.sin(time * 5) * 2; g.beginPath(); g.moveTo(rx - 9, ry - wing); g.lineTo(rx, ry + 2); g.lineTo(rx + 9, ry - wing); g.lineTo(rx, ry - 1); g.closePath(); g.fill(); }
  /* MID RANGE */
  { const c = midRange(), w = c.width; let x = ((-cx * 0.18) % w + w) % w; if (x > 0) x -= w; const y = Math.round(base - c.height + 40 + Math.min(dY * 0.18, 44));
    for (; x < VW; x += w) g.drawImage(c, Math.round(x), y); }
  /* THE LANDMARKS, every SLOT px of the world on the 0.32 layer */
  { const f = 0.32, off = cx * f, i0 = Math.floor((off - 60) / SLOT) - 1, y = Math.round(base + 40 - LM_H + Math.min(dY * f, 60));
    for (let i = i0; i <= i0 + Math.ceil((VW + 200) / SLOT) + 1; i++) { const v = ((i % 3) + 3) % 3, wx = i * SLOT + 90 + ((hashI(i) % 50) - 25), sx = Math.round(wx - off - LM_W / 2); if (sx > VW + 10 || sx < -LM_W - 10) continue;
      g.drawImage(landmark(v), sx, y);
      const top = y;
      if (v === 0) { const kx = sx + 100 + Math.sin(time * 0.8 + i) * 6, ky = top + 60 + Math.sin(time * 1.1 + i) * 5; g.strokeStyle = 'rgba(240,226,200,0.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx + 63, top + 26); g.lineTo(kx, ky + 8); g.stroke();   /* the tethered war-kite */
        g.fillStyle = '#c9463d'; g.beginPath(); g.moveTo(kx, ky - 9); g.lineTo(kx + 7, ky); g.lineTo(kx, ky + 8); g.lineTo(kx - 7, ky); g.closePath(); g.fill(); g.fillStyle = '#efe6d2'; g.fillRect(Math.round(kx) - 1, Math.round(ky) - 8, 2, 16); }
      if (v === 1) { const bx = sx + 61, by = top + 8, fl = Math.sin(time * 2.2 + i) * 2; g.fillStyle = '#b8403a'; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + 26, by + 2 + fl); g.lineTo(bx + 40, by + 9 + fl * 1.6); g.lineTo(bx + 26, by + 16 + fl); g.lineTo(bx, by + 14); g.closePath(); g.fill();   /* the banner streaming east */
        g.fillStyle = '#efe6d2'; g.fillRect(bx + 4, by + 5, 24, 3); }
    } }
  /* the low haze of the horizon, so every range sinks into the same warm air */
  { const gr = g.createLinearGradient(0, base - 30, 0, VH); gr.addColorStop(0, 'rgba(246,214,190,0)'); gr.addColorStop(1, 'rgba(246,214,190,0.34)'); g.fillStyle = gr; g.fillRect(0, base - 30, VW, VH - base + 30); }
}
function hashI(i) { let h = Math.imul(i + 7919, 2654435761) >>> 0; h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0; return h >>> 8; }
export const LANDMARK_SLOT = SLOT;
