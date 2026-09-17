// storm.js — THE HURRICANE DECK: ONE SHIP IN A STORM. She had the Flotilla's layers (a fleet on the horizon, moored hulls, the
// flank of another ship) under a storm sky, which said there were other ships out here and there are not. Now there is only
// her and the sea: a horizon of grey water heaving under squall lines, rain hanging off the cloud in sheets, the swells
// coming at her with the spume blown off their tops, and the whole of it going over with her when she rolls. In front of the
// lens: the rags of her canvas flapping off a yard, a block swinging on its fall, and the sea coming over her rail in bursts.
// Lightning shows the whole backdrop as a black cut-out for a moment - and never while something is winding up at you.
//   bakeStormSea()      640 x 170, horizon row 60: the open sea, squall curtains, a far headland with its light
//   bakeSwells()        640 x 170, crest row ~50: the near swells, spume streaks (drawn scrolling: the sea moves)
//   bakeRainSheets()    160 x 220: long slanting streaks, drawn twice at two speeds between the far sea and the swells
//   bakeStormFront()    { rag: [3 strips x 4 frames], spray: [6 frames], bolt: [3 forks] }
//   silhouette(c)       a copy of a layer in one flat colour (what the lightning leaves of it)
//   drawStormBack(g, S, o)    o: { cx, dY, time, VW, VH, tilt, flash, boltI }   the far sea, the rain, the swells
//   drawStormFront(g, S, o)   o: { cx, cy, time, VW, VH, TS, rails, quiet }     the rags, the block, the spray over the rail
import { canvas, px, mulberry } from '../px.js';

const wrapper = w => x => ((Math.round(x) % w) + w) % w;
const h01 = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };

export function bakeStormSea() {
  const w = 640, h = 170, H0 = 60, rnd = mulberry(8101), wrap = wrapper(w), [c, g] = canvas(w, h);
  const P = (x, y, col) => { if (y >= 0 && y < h) px(g, wrap(x), y, col); };
  // the squall curtains: dark rain hanging off the cloud base to the water, thicker at the foot, in bands you can count
  for (const [x0, ww, dark] of [[20, 70, 0.34], [150, 40, 0.22], [300, 110, 0.4], [470, 60, 0.26], [560, 50, 0.3]])
    for (let y = 0; y < H0; y++) { const k = y / H0; for (let a = 0; a < ww; a++) { const edge = Math.min(a, ww - 1 - a) / 10; if (h01(a + x0, y) > Math.min(1, edge) * (0.3 + k * 0.6)) continue;
      if (((a + y * 2) % 3) === 0) P(x0 + a + Math.round(y * 0.35), y, 'rgba(30,38,46,' + (dark * (0.4 + k * 0.6)).toFixed(3) + ')'); } }
  // a headland, far off to one side, and the light on it (it turns: drawStormBack)
  for (let x = 380; x < 470; x++) { const u = (x - 380) / 90, top = Math.round(H0 - 3 - 12 * Math.sin(Math.PI * Math.pow(u, 0.7))); for (let y = top; y < H0; y++) P(x, y, y === top ? '#3a4650' : '#27313a'); }
  for (let y = H0 - 22; y < H0 - 12; y++) { P(412, y, '#4a545c'); P(413, y, '#3a444c'); }
  // the sea to the horizon: slate at the edge of the world, going to green-black under you
  const band = y => { const t = (y - H0) / (h - H0); return t < 0.03 ? '#56666c' : t < 0.14 ? '#44545a' : t < 0.34 ? '#3a4a50' : t < 0.6 ? '#2c3a3e' : '#202c30'; };
  for (let y = H0; y < h; y++) for (let x = 0; x < w; x++) { const a = band(y), b = band(y + 1); P(x, y, a !== b && ((x + y) & 1) ? b : a); }
  // swell ridges: long low backs of water with their lit shoulders, bigger as they come, and the whitecaps breaking off them
  for (let y = H0 + 4; y < h; y += 3 + Math.round((y - H0) * 0.09)) { const r = y - H0, n = Math.round(w / (26 + r * 0.8));
    for (let i = 0; i < n; i++) { const x = (rnd() * w) | 0, len = 8 + ((rnd() * (10 + r)) | 0), amp = 1 + ((r / 40) | 0);
      for (let k = 0; k < len; k++) { const yy = y - Math.round(amp * Math.sin(Math.PI * k / len)); P(x + k, yy, r < 20 ? '#7a8a90' : '#566a70'); P(x + k, yy + 1, '#1c2629'); }
      if (rnd() < 0.5) for (let k = 0; k < 3 + (r >> 10); k++) P(x + (len >> 1) + k, y - amp - 1, rnd() < 0.5 ? '#c8d4d6' : '#9aaaae'); } }
  c.H0 = H0; c.light = [412, H0 - 23]; return c;
}

export function bakeSwells() {
  const w = 640, h = 170, rnd = mulberry(8202), wrap = wrapper(w), [c, g] = canvas(w, h);
  const P = (x, y, col) => { if (y >= 0 && y < h) px(g, wrap(x), y, col); };
  // three great swells across the width, each a hump with a steep face, a crest of broken white and spume combed off it
  const crest = x => { const u = x / w * Math.PI * 2; return Math.round(50 - 16 * Math.max(0, Math.sin(u * 3 + 0.4)) - 5 * Math.sin(u * 7 + 1.3)); };
  for (let x = 0; x < w; x++) { const t0 = crest(x), slope = crest(x + 1) - t0;
    for (let y = t0; y < h; y++) { const d = y - t0; P(x, y, d < 2 ? '#62747a' : d < 5 ? '#445a60' : d < 14 ? (slope > 0 ? '#34464c' : '#2a3a40') : d < 40 ? '#23323a' : '#1a262c'); }
    if (t0 < 42 && rnd() < 0.55) { P(x, t0 - 1, rnd() < 0.5 ? '#9aaaae' : '#7a8c92'); if (rnd() < 0.3) P(x, t0, '#b0bec2'); } }
  // the foam laced across the backs of them, and streaks of spume the wind has laid along the water
  for (let i = 0; i < 180; i++) { const x = (rnd() * w) | 0, y = crest(x) + 6 + ((rnd() * 90) | 0), len = 3 + ((rnd() * 12) | 0);
    for (let k = 0; k < len; k++) if (rnd() < 0.8) P(x + k, y + Math.round(k * 0.12), y - crest(x) < 30 ? '#5e7278' : '#3e5056'); }
  return c;
}

export function bakeRainSheets() {
  const w = 160, h = 220, rnd = mulberry(8303), [c, g] = canvas(w, h);
  for (let i = 0; i < 70; i++) { const x = (rnd() * w) | 0, y = (rnd() * h) | 0, len = 10 + ((rnd() * 22) | 0), a = 0.14 + rnd() * 0.16;
    for (let k = 0; k < len; k++) px(g, ((x - Math.round(k * 0.3)) % w + w) % w, (y + k) % h, 'rgba(170,190,200,' + a.toFixed(3) + ')'); }
  return c;
}

export function silhouette(c, col = '#0c1016') {
  const [s, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height);
  return s;
}

let FRONT = null;
export function bakeStormFront() {
  if (FRONT) return FRONT;
  const rnd = mulberry(8404);
  // RAGS: what is left of a topsail, torn into strips hanging off the yard, streaming out and snapping back
  const rag = [0, 1, 2].map(v => [0, 1, 2, 3].map(f => { const L = 26 + v * 9, [c, g] = canvas(L + 8, 14);
    for (let k = 0; k < L; k++) { const u = k / L, y0 = Math.round(3 + Math.sin(u * 5 + f * 1.6 + v) * 3 * u + u * (f % 2 ? 2 : 4)), wd = Math.max(1, Math.round((1 - u) * (5 - v) + 1));
      for (let b = 0; b < wd; b++) px(g, k, y0 + b, b === 0 ? '#9aa2a0' : (k + b) % 7 === 0 ? '#4e5654' : '#727a78'); if (k > L - 4 && (k + f) % 2) px(g, k + 1, y0 + 1, '#5a6260'); }
    return c; }));
  // SPRAY: the sea coming over the rail - a throw of water up and over, then the fall of it (grey-green, not white: it is behind nothing that matters)
  const drops = Array.from({ length: 70 }, () => ({ x: (rnd() - 0.5) * 16, vx: (rnd() - 0.3) * 30, vy: -40 - rnd() * 50, s: rnd() < 0.3 ? 2 : 1 }));
  const spray = [0, 1, 2, 3, 4, 5].map(f => { const t = (f + 1) / 6 * 0.9, [c, g] = canvas(64, 48);
    for (const d of drops) { const x = 24 + d.x + d.vx * t, y = 44 + d.vy * t + 120 * t * t; if (y > 47 || y < 0) continue;
      g.fillStyle = f < 2 ? 'rgba(206,222,224,0.85)' : f < 4 ? 'rgba(180,200,204,0.7)' : 'rgba(150,172,178,0.5)'; g.fillRect(Math.round(x), Math.round(y), d.s + (f < 2 ? 1 : 0), d.s + (f < 3 ? 1 : 0)); }
    if (f < 3) for (let a = 0; a < 30; a++) { const hgt = Math.round((14 - f * 4) * Math.sin(Math.PI * a / 29)); for (let b = 0; b < hgt; b++) if (h01(a, b + f) < 0.6) { g.fillStyle = 'rgba(190,210,214,' + (0.6 - b / 40).toFixed(2) + ')'; g.fillRect(10 + a, 46 - b, 1, 1); } }
    return c; });
  // BOLTS: a fork across the sky, three of them
  const bolt = [0, 1, 2].map(v => { const r = mulberry(8500 + v), [c, g] = canvas(90, 120);
    const fork = (x, y, len, d) => { for (let k = 0; k < len; k++) { x += (r() - 0.5) * 5 + d; y += 2 + r() * 2; if (y > 118) break; g.fillStyle = '#f4f6ff'; g.fillRect(Math.round(x), Math.round(y), 2, 3); g.fillStyle = 'rgba(160,180,255,0.4)'; g.fillRect(Math.round(x) - 1, Math.round(y), 4, 3); if (r() < 0.06 && len > 12) fork(x, y, len * 0.5, (r() - 0.5) * 2); } };
    fork(45, 0, 44, (r() - 0.5) * 1.2); return c; });
  FRONT = { rag, spray, bolt }; return FRONT;
}

/* THE SEA BEHIND HER. `tilt` rolls the horizon about the middle of the frame (the heel, and the swell under it); `flash` is the
   lightning (0..1): the sky goes white-lilac and the sea and the swells are their own black shapes against it. */
export function drawStormBack(g, S, o) {
  const { cx, dY, time, VW, VH, tilt, flash, calm = 0 } = o, far = S.far, mid = S.mid;
  const fy = Math.round(VH - 199 + dY * 0.15), hy = fy + far.H0;
  const rolled = tilt && Math.abs(tilt) > 0.001;
  if (rolled) { g.save(); g.translate(VW / 2, hy); g.rotate(tilt); g.translate(-VW / 2, -hy); }
  if (flash > 0) { g.fillStyle = 'rgba(214,220,246,' + (0.75 * flash).toFixed(3) + ')'; g.fillRect(-VW, -VH, VW * 3, hy + VH + 2); }
  const tile = (c, f, y, extra) => { const w = c.width; let x = ((-(cx * f + extra)) % w + w) % w; if (x > 0) x -= w; x -= w; for (; x < VW + w; x += w) g.drawImage(c, Math.round(x), y); };
  if (fy < VH) tile(flash > 0.35 ? S.farS : far, 0.15, fy, 0);
  if (flash > 0.35 && o.boltX !== undefined) { const B = bakeStormFront().bolt[(o.boltI || 0) % 3]; g.drawImage(B, Math.round(o.boltX - cx * 0.15 - 45), hy - 118); }   /* the fork, where it came down in the sky */
  if (fy < VH && flash <= 0.35) {   /* the light on the headland, going round */
    const w = far.width; let x = ((-(cx * 0.15)) % w + w) % w; if (x > 0) x -= w; x -= w;
    const k = Math.max(0, Math.sin(time * 1.4)); for (; x < VW + w; x += w) { const lx = Math.round(x + far.light[0]), ly = fy + far.light[1]; if (lx < -20 || lx > VW + 20) continue;
      g.globalAlpha = 0.25 + 0.6 * k; g.fillStyle = '#ffe8a0'; g.fillRect(lx, ly, 2, 2); g.globalAlpha = 0.12 * k; g.fillRect(lx - 14 + Math.round(Math.cos(time * 1.4) * 10), ly - 1, 28, 3); g.globalAlpha = 1; } }
  // the rain, two sheets at two speeds, between the far sea and the swells
  for (const [f, sp, a] of [[0.2, 90, 0.5], [0.35, 150, 0.7]]) { const R = S.rain, w = R.width, hh = R.height;
    let x = ((-(cx * f - time * sp * 0.3)) % w + w) % w; if (x > 0) x -= w; const y0 = ((time * sp) % hh + hh) % hh - hh;
    g.globalAlpha = a * (flash > 0 ? 0.4 : 1) * (1 - calm); for (let xx = x - w; xx < VW + w; xx += w) for (let yy = y0 - hh; yy < VH; yy += hh) g.drawImage(R, Math.round(xx), Math.round(yy)); g.globalAlpha = 1; }
  // the swells, running: they travel along under her on the game clock as well as sliding with the camera
  const my = Math.round(VH - 222 + dY * 0.3);
  if (my < VH) { if (rolled) { g.restore(); g.save(); g.translate(VW / 2, hy); g.rotate(tilt * 0.6); g.translate(-VW / 2, -hy); }
    tile(flash > 0.35 ? S.midS : mid, 0.3, my + Math.round(Math.sin(time * 1.65) * 2), time * 14); }
  if (rolled) g.restore();
}

/* IN FRONT OF THE LENS. The rags of her canvas stream off a yard along the top of the frame and a block swings on its fall; both
   are placed by where they are along her (the camera's x at the front layer's 1.25), never by where they fall on the screen.
   The sea comes over the rail at the rail tiles themselves (`rails`: world tile x of each place it can), each place on its own
   clock, and not at all while `quiet` (something is winding up, the wash is building, the sky is marking a strike). */
export function drawStormFront(g, S, o) {
  const { cx, cy, time, VW, VH, TS, rails, quiet, calm } = o, F = bakeStormFront();
  const span = 520, base = cx * 1.25, k0 = Math.floor((base - 60) / span), k1 = Math.floor((base + VW + 60) / span);
  for (let k = k0; k <= k1; k++) { const hsh = h01(k, 7), sx = Math.round(k * span + hsh * 200 - base), yardY = -4 + Math.round(hsh * 6);
    if (hsh < 0.25) continue;
    g.fillStyle = '#20282a'; g.fillRect(sx - 40, yardY, 120, 4); g.fillStyle = '#394446'; g.fillRect(sx - 40, yardY, 120, 1);   /* the yard itself, just into the frame */
    for (let r = 0; r < 3; r++) { const fr = Math.floor(time * (7 + r) + hsh * 10 + r * 1.3) % 4, rag = F.rag[r][fr];
      g.globalAlpha = 0.9 * (1 - calm * 0.7); g.drawImage(rag, sx - 30 + r * 34, yardY + 3); }
    g.globalAlpha = 1;
    // the block on its fall, swinging with her
    const px2 = sx + 70, py2 = yardY + 3, ang = Math.sin(time * 1.9 + hsh * 6) * 0.5 * (1 - calm * 0.8), len = 34 + Math.round(hsh * 20);
    const bx = Math.round(px2 + Math.sin(ang) * len), by = Math.round(py2 + Math.cos(ang) * len);
    g.strokeStyle = '#5a5044'; g.lineWidth = 1; g.beginPath(); g.moveTo(px2 + 0.5, py2); g.lineTo(bx + 0.5, by); g.stroke();
    g.fillStyle = '#2a2420'; g.fillRect(bx - 3, by, 7, 9); g.fillStyle = '#5a4a38'; g.fillRect(bx - 2, by + 1, 2, 7); g.fillStyle = '#8a8478'; g.fillRect(bx, by + 3, 1, 3);
  }
  if (quiet || calm > 0.5) return;
  for (const [rx, ry] of rails) { const X = rx * TS - cx; if (X < -60 || X > VW + 20) continue;
    const per = 5.5 + h01(rx, 3) * 5, t = (time + h01(rx, 9) * per) % per; if (t > 0.9) continue;
    const f = Math.min(5, Math.floor(t / 0.15)), y = ry * TS + 8 - cy - 44;
    g.globalAlpha = 0.8; g.drawImage(F.spray[f], Math.round(X - 16), Math.round(y)); g.globalAlpha = 1; }
}
