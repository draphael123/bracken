// redgorge_backdrop.js - THE RED GORGE's own BACKDROP (claude/redgorge-art). It used to borrow the desert's sunset sky, so the gorge read as a ledge hung in the open;
// it is a canyon, and it is in SHADE:
//   sky      a narrow dusk glow (the only open sky, high over the rim), a long way up
//   mesas    far banded buttes on the horizon, parallax 0.12, seen over the plateau where the dam is (and through the gorge's top)
//   crags    the far rim's jagged silhouette (parallax 0.3), against the sky
//   wall     the gorge's BACK WALL, anchored to the world: dark strata with varnish streaks and pits, and the CHANNEL's pale scoured gully down it (the rule's second voice)
//   shade    a depth gradient over the wall (the deeper the darker; the rim keeps a warm reflected glow) - the shade is the point
// Every static picture is baked ONCE (memo); each frame is a handful of drawImage/fillRect calls. Pure drawing, no state beyond the baked canvases.
//   drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full)
import { mulberry } from '../px.js';
import { drawBackdrops as drawCanyonView } from './redgorge2_art.js';   /* THE CLIMB's height, over the Rapids and the Climb (claude/redgorge2 art pass) */
import { drawNestBackdrop } from './matriarch_ledge.js';   /* the old dam behind the Matriarch's ledge */
const TS = 16;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
export const WALL_X0 = 3 * TS, WALL_X1 = 45 * TS, CH_X0 = 22 * TS, CH_X1 = 27 * TS;
const WALL_TOP = 96;   /* world px: the far rim's average line; the sky shows over it */
export const C = { sky0: '#2a1a3a', sky1: '#6a3a52', sky2: '#c8704e', sky3: '#f0a86a', mesa0: '#3a1c24', mesa1: '#5a2a2c', mesa2: '#7a3c34', mesa3: '#9a5240', crag: '#1a0c10',
  w0: '#0c070b', w1: '#160c11', w2: '#201219', w3: '#2a1820', w4: '#38222a' };

/* the sky: baked once as a 1 x 128 strip, stretched */
const skyStrip = () => once('sky', () => { const [c, g] = mk(1, 128); const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, C.sky0); gr.addColorStop(0.35, C.sky1); gr.addColorStop(0.75, C.sky2); gr.addColorStop(1, C.sky3); g.fillStyle = gr; g.fillRect(0, 0, 1, 128); return c; });

/* the far mesas: banded buttes, a flat-topped silhouette; one strip, tiled (period 1024) */
const mesaStrip = () => once('mesa', () => { const W = 1024, H = 90, [c, g] = mk(W, H), r = mulberry(4117);
  let x = -40; while (x < W + 40) { const w = 70 + ((r() * 110) | 0), h = 30 + ((r() * 46) | 0), x0 = x;
    for (let yy = 0; yy < h; yy++) { const t = yy / h, band = (yy + ((x0 * 3) | 0)) % 9 < 3, inset = t < 0.12 ? 0 : (t < 0.5 ? ((r() < 0.5) ? 1 : 0) : 0), col = band ? C.mesa2 : (yy % 5 === 0 ? C.mesa3 : C.mesa1); rc(g, x0 + inset, H - h + yy, w - inset * 2, 1, col); }
    rc(g, x0, H - h, w, 1, C.mesa3); rc(g, x0 + w - 4, H - h + 2, 4, h - 2, C.mesa0);                      /* the shadow side */
    for (let i = 0; i < 6; i++) rc(g, x0 + ((r() * w) | 0), H - h + 4 + ((r() * (h - 6)) | 0), 1, 2 + ((r() * 5) | 0), C.mesa0);
    x += w - 18 + ((r() * 40) | 0); }
  rc(g, 0, H - 6, W, 6, C.mesa0); return c; });

/* the far rim's crags: a jagged dark line, one strip over the gorge's width plus margin */
const cragStrip = () => once('crag', () => { const W = 1400, H = 80, [c, g] = mk(W, H), r = mulberry(883);
  let y = 40; for (let x = 0; x < W; x += 2) { y += (r() - 0.5) * 7; if (r() < 0.04) y -= 14; y = Math.max(8, Math.min(60, y)); rc(g, x, y, 2, H - y, C.crag); if (r() < 0.2) rc(g, x, y, 2, 1, '#3a1a1a'); }
  return c; });

/* the back wall: a 256 x 256 tile of dark strata, varnish streaks (the long dark drips down a canyon's wall), pits, and the odd pale seam */
const wallTile = () => once('wall', () => { const S = 256, [c, g] = mk(S, S), r = mulberry(7771); const cols = [C.w1, C.w2, C.w3, C.w2, C.w1, C.w4];
  rc(g, 0, 0, S, S, C.w2);
  let y = 0; while (y < S) { const th = 3 + ((r() * 8) | 0), col = cols[(r() * cols.length) | 0]; for (let x = 0; x < S; x += 4) { const wob = Math.round(Math.sin(x / S * Math.PI * 4 + y) * 1.2); rc(g, x, y + wob, 4, th, col); } rc(g, 0, y, S, 1, C.w0); if (r() < 0.5) rc(g, 0, y + 1, S, 1, C.w4); y += th; }
  for (let i = 0; i < 26; i++) { const x = (r() * S) | 0, y0 = (r() * S) | 0, len = 20 + ((r() * 90) | 0); for (let k = 0; k < len; k++) { rc(g, (x + (k % 17 === 16 ? 1 : 0)) % S, (y0 + k) % S, 1 + (k % 9 === 0 ? 1 : 0), 1, C.w0); } }
  for (let i = 0; i < 160; i++) rc(g, (r() * S) | 0, (r() * S) | 0, 1 + ((r() * 3) | 0), 1, r() < 0.5 ? C.w0 : C.w4);
  for (let i = 0; i < 10; i++) { const x = (r() * (S - 40)) | 0, y0 = (r() * (S - 20)) | 0, w = 18 + ((r() * 30) | 0); rc(g, x, y0, w, 6, C.w0); rc(g, x + 1, y0 + 6, w - 2, 1, C.w4); }   /* a shallow niche, dark, its lower lip lit */
  return c; });

/* the channel's gully: a pale scoured stripe, wider at the top (a watercourse), polished streaks, a few dark pools of damp; 1 tile tall x (CH width + margin) */
const gully = () => once('gully', () => { const W = CH_X1 - CH_X0, H = 128, [c, g] = mk(W, H), r = mulberry(31);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const e = Math.min(x, W - 1 - x), a = Math.min(1, e / 9); g.globalAlpha = 0.34 * a + ((x + y * 3) % 11 === 0 ? 0.06 : 0); g.fillStyle = e < 2 ? '#3a1a14' : '#d8b08c'; g.fillRect(x, y, 1, 1); }
  g.globalAlpha = 1; for (let i = 0; i < 30; i++) { const x = 6 + ((r() * (W - 12)) | 0), y0 = (r() * H) | 0, len = 10 + ((r() * 40) | 0); for (let k = 0; k < len; k++) { g.globalAlpha = 0.28; rc(g, x, (y0 + k) % H, 1, 1, '#f6dcb8'); } }
  g.globalAlpha = 0.22; for (let y = 0; y < H; y += 6) rc(g, 4, y, W - 8, 1, '#7a4a38'); g.globalAlpha = 1; return c; });

export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full) {
  /* 1. the sky: screen-anchored with a slow slide, so it is only ever the high strip over the rim */
  const top = Math.round(-cy * 0.04 + dY * 0.02);
  g.drawImage(skyStrip(), 0, 0, 1, 128, 0, 0, VW, VH);
  /* 2. far mesas on the horizon, parallax 0.12, their base a little under the rim line (world y ~ 300) */
  const horizon = 330 - cy * 0.5 + top;
  if (full) { const m = mesaStrip(), off = Math.round(cx * 0.12) % 1024; for (let x = -off; x < VW; x += 1024) g.drawImage(m, x, Math.round(horizon - 90)); }
  g.fillStyle = C.mesa0; g.fillRect(0, Math.round(horizon - 2), VW, VH);
  /* 3. the far rim's crags, parallax 0.3, over the gorge's mouth (the sky slit) */
  { const cs = cragStrip(), off = Math.round(cx * 0.3) % 1400, y = Math.round(WALL_TOP - 44 - cy); if (y + 80 > 0 && y < VH) for (let x = -off; x < VW; x += 1400) g.drawImage(cs, x, y); }
  /* 4. the back wall, anchored to the world: the pattern from the camera's own origin; from the rim line down, only between the gorge's walls */
  const wx0 = Math.round(WALL_X0 - cx), wx1 = Math.round(WALL_X1 - cx), wy0 = Math.round(WALL_TOP - cy), x0 = Math.max(0, wx0), x1 = Math.min(VW, wx1);
  if (x1 > x0 && wy0 < VH) { const y0 = Math.max(0, wy0), pat = once('pat', () => g.createPattern(wallTile(), 'repeat'));
    pat.setTransform(new DOMMatrix().translate(-Math.round(cx * 0.92), -Math.round(cy * 0.92))); g.fillStyle = pat; g.fillRect(x0, y0, x1 - x0, VH - y0);
    /* the rim's jagged edge: the wall's top, ragged over the sky */
    for (let x = x0; x < x1; x += 2) { const k = ((x + Math.round(cx)) * 7 + 3) % 11; if (k < 4 && wy0 >= -4 && wy0 < VH) { g.fillStyle = C.w2; g.fillRect(x, wy0 - (k % 3) - 1, 2, 2); } }
    /* the channel's gully, 1:1 with the world (it is where the rule runs) */
    const gx = Math.round(CH_X0 - cx), gh = gully();
    { const gy = Math.floor((cy - WALL_TOP) / 128) * 128 + WALL_TOP; for (let wy = gy; wy < cy + VH; wy += 128) { const sy = Math.round(wy - cy); if (wy < WALL_TOP) continue; g.drawImage(gh, gx, sy); } }
    /* 5. THE SHADE: the deeper, the darker (a warm reflected glow only near the rim); a vertical gradient from the screen's top row to its bottom */
    const shade = wy => Math.min(0.66, Math.max(0, (wy - WALL_TOP) / 2600) * 0.66 + 0.06), a0 = shade(cy), a1 = shade(cy + VH);
    const gr = g.createLinearGradient(0, y0, 0, VH); gr.addColorStop(0, 'rgba(10,4,6,' + a0.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(10,4,6,' + a1.toFixed(3) + ')'); g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, VH - y0);
    { const glow = Math.max(0, 1 - (cy - WALL_TOP) / 520); if (glow > 0.01) { const gg = g.createLinearGradient(0, y0, 0, y0 + 220); gg.addColorStop(0, 'rgba(240,150,90,' + (0.2 * glow).toFixed(3) + ')'); gg.addColorStop(1, 'rgba(240,150,90,0)'); g.fillStyle = gg; g.fillRect(x0, y0, x1 - x0, 220); } }
    /* the gorge's side walls give a dark edge (the near walls shade their own back wall) */
    const eg = g.createLinearGradient(wx0, 0, wx0 + 90, 0); eg.addColorStop(0, 'rgba(8,2,4,0.5)'); eg.addColorStop(1, 'rgba(8,2,4,0)'); g.fillStyle = eg; g.fillRect(x0, y0, Math.min(90, x1 - x0), VH - y0);
    const eg2 = g.createLinearGradient(wx1 - 90, 0, wx1, 0); eg2.addColorStop(0, 'rgba(8,2,4,0)'); eg2.addColorStop(1, 'rgba(8,2,4,0.5)'); g.fillStyle = eg2; g.fillRect(Math.max(x0, wx1 - 90), y0, Math.min(90, x1 - x0), VH - y0); }
  drawCanyonView(g, cx, cy, VW, VH, time, full);
  drawNestBackdrop(g, cx, cy, VW, VH, L, time);
}
