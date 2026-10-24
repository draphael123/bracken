// src/redraw/hornets_nest_hall.js - THE HONEY HALL (the Hornet Queen's P2), drawn (claude/hornets2art; SONNET over the greybox rects). ART ONLY: every box, timing and number is the
// hands' (src/hornets-nest-hands.js, src/hornet-queen-hands.js); this draws what they say.
//   TEAR      the vault ripped open over the royal cell: a ragged hole with the daylight of the pines through it, torn-paper rims and flaps, a beam of light down to the flood
//   FLOOD     the honey on the floor: a rolling glossy skin that climbs the walls a little, bubbles, sticky threads, drips falling from the tear's lip to ring on it
//   STALKS    the torn combs and THE LAST COMB hang from the tear on ropes of ragged paper sheathed in honey
//   ROYAL     THE LAST COMB: the royal comb - a halo, a crown medallion, jewelled queen cells, three capped queen cells hanging under it
//   SPLASH    a comb dropping into the honey: a crown of drops and rings across the flood
//   PIN       the queen under the comb: the comb drawn back over her hindquarters, honey squeezed out round it, a ring of stars
import { canvas } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h ^ (h >>> 16); };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
export const TEAR = { cx: 5024, y0: 100, y1: 190, hw: 142 };   /* world px: the hall's vault centre; the hole's top, its lower lip (the camera's top edge is ~y 139: the hole is the lower half of this) */
const PAPERS = ['#2a1c10', '#4a3420', '#6a4e30', '#8a6c46', '#a8896a', '#c8aa84'];
const gpu = c => { const [o, g] = canvas(c.width, c.height, true); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0); return o; };
const hardAlpha = (c, g, thr = 110) => { const d = g.getImageData(0, 0, c.width, c.height), a = d.data; for (let i = 3; i < a.length; i += 4) a[i] = a[i] >= thr ? 255 : 0; g.putImageData(d, 0, 0); };
const lerp = (a, b, t) => a + (b - a) * t;

/* ---- the tear's baked hole (300 x 124): the jagged outline, its rims, the light and the pine tops beyond ---- */
function outline(scale, oy = 0) { const pts = [], cx = 150, cy = 54, N = 46;
  for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, top = Math.sin(a) < 0, tooth = (hash(i, 7) % 100) / 100, j = (i % 2 ? 1 : 0.55) * (top ? 7 : 15) * tooth, rx = 138 + (hash(i, 3) % 7), ry = (top ? 30 : 38) + j;
    pts.push([cx + Math.cos(a) * rx * scale, cy + Math.sin(a) * ry * scale + oy + (Math.abs(Math.cos(a)) > 0.8 ? 6 : 0)]); } return pts; }
function tearSprite() { return once('tear', () => { const [c, g] = canvas(300, 124); g.imageSmoothingEnabled = false;
  const path = pts => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
  /* the rims: a dark thickness of torn paper, a paler fibre ring */
  g.fillStyle = PAPERS[1]; path(outline(1.06, 3)); g.fill(); g.fillStyle = PAPERS[3]; path(outline(1.04, 1)); g.fill(); g.fillStyle = PAPERS[5]; path(outline(1.016)); g.fill();
  /* the hole: the light, and the far pines the hall now looks out on */
  g.save(); path(outline(0.99)); g.clip(); const gr = g.createLinearGradient(0, 14, 0, 100); gr.addColorStop(0, '#c8dc98'); gr.addColorStop(0.4, '#f6ecb4'); gr.addColorStop(1, '#ecc866'); g.fillStyle = gr; g.fillRect(0, 0, 300, 124);
  for (const [x, w, h] of [[70, 20, 22], [96, 14, 15], [200, 18, 20], [222, 14, 12], [168, 22, 26]]) { g.fillStyle = '#7a9a58'; g.beginPath(); g.moveTo(x, 100); g.lineTo(x + w / 2, 100 - h); g.lineTo(x + w, 100); g.fill(); g.fillStyle = '#9ab870'; g.beginPath(); g.moveTo(x + w * 0.3, 100); g.lineTo(x + w / 2, 100 - h); g.lineTo(x + w * 0.55, 100); g.fill(); }
  g.restore();
  hardAlpha(c, g);
  /* the fibre: bright flecks along the inner lip, dark flecks in the rim */
  for (let i = 0; i < 70; i++) { const a = (hash(i, 11) % 628) / 100, rx = 138 + (hash(i, 5) % 6), ry = (Math.sin(a) < 0 ? 31 : 40); const x = 150 + Math.cos(a) * rx, y = 54 + Math.sin(a) * ry + (Math.abs(Math.cos(a)) > 0.8 ? 6 : 0); R(g, i % 3 ? PAPERS[5] : PAPERS[1], x, y, 2 + (i % 3), 1); }
  /* flaps of paper hanging off the lower lip, curled */
  for (const [x, len] of [[48, 18], [84, 24], [128, 14], [172, 26], [214, 20], [246, 16]]) { for (let q = 0; q < len; q++) { const w = Math.max(1, 6 - (q >> 2)), sx = x + Math.round(Math.sin(q * 0.35) * 2); R(g, q % 6 < 3 ? PAPERS[3] : PAPERS[2], sx, 86 + q, w, 1); R(g, PAPERS[5], sx, 86 + q, 1, 1); R(g, PAPERS[0], sx + w, 86 + q, 1, 1); } }
  return gpu(c); }); }
function beamSprite() { return once('beam', () => { const [c, g] = canvas(380, 260, true), gr = g.createLinearGradient(0, 0, 0, 260); gr.addColorStop(0, 'rgba(255,236,150,0.20)'); gr.addColorStop(0.6, 'rgba(255,220,120,0.08)'); gr.addColorStop(1, 'rgba(255,210,100,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(80, 0); g.lineTo(300, 0); g.lineTo(372, 260); g.lineTo(8, 260); g.closePath(); g.fill(); return c; }); }
const puffLight = () => once('puffL', () => { const [c, g] = canvas(64, 32, true), gr = g.createRadialGradient(32, 16, 1, 32, 16, 30); gr.addColorStop(0, 'rgba(255,224,120,0.9)'); gr.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 32); return c; });
/* tell = 0..1 cracks spreading from the royal cell; open = 0..1 the hole opening (1: torn); deb = 0..1 falling debris. World px: the hall's own vault. */
export function tear(g, cx, cy, time, { tell = 0, open = 0, deb = 0 } = {}) {
  const X = TEAR.cx - cx, Y = TEAR.y0 - cy;
  if (X > 640 + 200 || X < -200) return;
  if (open > 0) { const spr = tearSprite(), k = Math.min(1, open), w = Math.round(300 * (0.35 + 0.65 * k)), h = Math.round(124 * (0.3 + 0.7 * k));
    g.drawImage(spr, Math.round(X - w / 2), Math.round(Y + 54 - h * 54 / 124 - 6), w, h);
    g.globalAlpha = Math.min(1, open) * (0.8 + 0.2 * Math.sin(time * 2.1)); g.drawImage(beamSprite(), Math.round(X - 190), Math.round(Y + 70)); g.globalAlpha = 1;
    /* motes drifting down the beam */
    for (let i = 0; i < 12; i++) { const ph = (time * 0.12 + i * 0.083) % 1, mx = X - 70 + (hash(i, 2) % 140) + ph * ((hash(i, 9) % 60) - 30), my = Y + 80 + ph * 220; g.globalAlpha = 0.6 * Math.sin(ph * Math.PI); R(g, '#fff6c8', mx, my, 1 + (i % 2), 1); } g.globalAlpha = 1; }
  if (tell > 0 && open < 1) { /* cracks run out of the royal cell across the paper: a dark seam, a bright core, growing with the tell; the vault dusts and shivers */
    const ox = TEAR.cx - cx, oy = 168 - cy;
    g.globalAlpha = 0.12 + 0.1 * tell; g.fillStyle = '#d8c8a0'; for (let q = 0; q < 6; q++) g.fillRect(Math.round(ox - 120 + q * 40 + Math.sin(time * 30 + q) * 2), Math.round(140 - cy), 22, Math.round(40 + 140 * tell)); g.globalAlpha = 1;
    for (let c = 0; c < 14; c++) { const a = c / 14 * Math.PI * 2 + 0.3, L = 24 + (hash(c, 4) % 120) * Math.min(1, tell * 1.1); let x = ox, y = oy; for (let s = 0; s < L; s += 3) { x += Math.cos(a + Math.sin(s * 0.3 + c) * 0.5) * 3; y += Math.sin(a + Math.sin(s * 0.3 + c) * 0.5) * 3 * 0.55; R(g, '#140a06', x, y, 2, 2); if (s % 6 === 0) R(g, '#ffe9a0', x, y, 1, 1); } } }
  if (deb > 0) { /* shards of comb and scraps of paper sifting and falling from the lip */
    for (let i = 0; i < 30; i++) { const ph = (time * (0.7 + (i % 4) * 0.13) + i * 0.173) % 1, dx = (hash(i, 6) % 260) - 130, x = X + dx + Math.sin(ph * 9 + i) * 3, y = Y + 40 + ph * 250, sz = 2 + (i % 4);
      if ((hash(i, 8) % 100) / 100 > deb) continue; g.globalAlpha = 1 - ph * 0.5; R(g, i % 3 === 0 ? '#e0b040' : i % 3 === 1 ? '#c8aa84' : '#6a4e30', x, y, sz, 1 + (i & 1)); if (i % 3 === 0) R(g, '#fff1a0', x, y, 1, 1); } g.globalAlpha = 1; }
}

/* ---- the flood: the skin is drawn per column (a rolling profile), light on its crests ---- */
const crest = (x, t) => 2.4 + 1.2 * Math.sin(x * 0.075 + t * 1.3) + 0.8 * Math.sin(x * 0.19 - t * 0.9) + 0.5 * Math.sin(x * 0.043 + t * 0.5);
export function flood(g, x0, x1, floorY, cx, cy, time, VW = 640) {
  const xs = Math.max(Math.round(x0 - cx), -4), xe = Math.min(Math.round(x1 - cx), VW + 4), fy = Math.round(floorY - cy);
  for (let x = xs; x < xe; x++) { const wx = x + cx, h = Math.round(crest(wx, time)) + 3, edgeUp = Math.max(0, 5 - Math.min(wx - x0, x1 - wx) / 2.5);   /* a meniscus climbs the walls */
    const top = fy - h - Math.round(edgeUp), slope = crest(wx + 1, time) - crest(wx - 1, time);
    R(g, '#8a4c08', x, fy - 2, 1, 2);
    R(g, '#b86c10', x, top + 3, 1, Math.max(1, fy - 2 - top - 3));
    R(g, '#d88a1a', x, top + 1, 1, 2);
    R(g, slope < -0.18 ? '#fff0a0' : slope > 0.22 ? '#f0b434' : '#f8c24a', x, top, 1, 1); }
  for (let k = 0; k < 6; k++) { const bx0 = x0 + 40 + k * ((x1 - x0 - 80) / 5), ph = (time * 0.3 + k * 0.37) % 1, x = bx0 - cx + Math.sin(ph * 6 + k) * 3; if (x < -4 || x > VW + 4) continue;
    const y = fy - 2 - ph * 6; if (ph < 0.85) { R(g, '#ffe08a', x, y - 3, 2, 1); R(g, '#fff4b0', x, y - 4, 1, 1); } else { R(g, '#fff4b0', x - 2, fy - 8, 1, 1); R(g, '#fff4b0', x + 2, fy - 8, 1, 1); } }
  for (let s = 0; s < 5; s++) { const sx = x0 + 70 + s * ((x1 - x0 - 140) / 4) - cx; if (sx < -4 || sx > VW + 4) continue; const len = 4 + (hash(s, 33) % 4) + Math.round(Math.sin(time * 1.3 + s * 1.7) * 1.2);
    const ty = fy - Math.round(crest(sx + cx, time)) - 3 - len; g.globalAlpha = 0.7; R(g, '#ffd36b', sx, ty, 1, len); R(g, '#fff4b0', sx, ty, 1, 1); g.globalAlpha = 1; }
}
/* a thin film over whoever stands in it (drawn in FRONT of the heroes: they wade) */
export function floodFront(g, x0, x1, floorY, cx, cy, time, VW = 640) {
  const xs = Math.max(Math.round(x0 - cx), -4), xe = Math.min(Math.round(x1 - cx), VW + 4), fy = Math.round(floorY - cy);
  g.globalAlpha = 0.5; for (let x = xs; x < xe; x++) { const h = Math.round(crest(x + cx + 3, time + 0.4) * 0.45) + 1; R(g, '#d88a1a', x, fy - h - 1, 1, h + 1); R(g, '#f8c24a', x, fy - h - 1, 1, 1); } g.globalAlpha = 1;
}
/* the drips off the tear's lip: a strand grows, a bulb swells and lets go, falls and rings the flood */
export function drips(g, floorY, cx, cy, time, VW = 640, open = 1) {
  if (open < 0.9) return;
  for (let k = 0; k < 7; k++) { const wx = TEAR.cx - 118 + k * 39 + (hash(k, 4) % 12), lipY = TEAR.y1 - 4 + ((k % 3) * 5), x = Math.round(wx - cx); if (x < -4 || x > VW + 4) continue;
    const per = 3.4 + (k % 3) * 0.7, ph = ((time + k * 0.91) % per) / per, grow = Math.min(1, ph / 0.42), L = 7 + grow * 24, y0 = Math.round(lipY - cy), sl = Math.round(L * (ph < 0.5 ? 1 : 0.35));
    R(g, '#c47a14', x, y0, 2, sl); R(g, '#f8c24a', x, y0, 1, sl);
    if (ph < 0.5) { R(g, '#ffd36b', x - 1, y0 + L, 4, 3); R(g, '#fff4b0', x, y0 + L, 1, 1); }                     /* the bulb */
    else if (ph < 0.72) { const fall = (ph - 0.5) / 0.22, fy2 = y0 + L + fall * fall * (floorY - cy - (y0 + L) - 6); R(g, '#ffd36b', x, fy2, 3, 4); R(g, '#fff4b0', x, fy2, 1, 2); R(g, '#c47a14', x + 1, fy2 - 5, 1, 4); }
    else if (ph < 0.88) { const r = (ph - 0.72) / 0.16, fy = Math.round(floorY - cy); g.globalAlpha = 1 - r; g.strokeStyle = '#ffe08a'; g.beginPath(); g.ellipse(x + 1, fy - 5, 2 + r * 10, 1 + r * 1.5, 0, 0, 7); g.stroke(); g.globalAlpha = 1; } }
}

/* ---- the stalks: ragged ropes of paper sheathed in honey, from the tear's lip to the comb ---- */
function stalk(g, ax, ay, bx, by, hw, time, seed) {
  const n = Math.max(2, Math.round(by - ay));
  for (let q = 0; q < n; q++) { const t = q / n, x = lerp(ax, bx, t) + Math.sin(t * 6 + seed) * 2 * (1 - t) + (hash(q, seed) % 3 === 0 ? 1 : 0), w = hw + (t > 0.85 ? Math.round((t - 0.85) * 18) : 0), y = ay + q;
    R(g, PAPERS[1], x - w, y, w * 2, 1); R(g, q % 6 < 3 ? PAPERS[3] : PAPERS[2], x - w + 1, y, w * 2 - 2, 1); R(g, PAPERS[4], x - w + 1, y, 1, 1);
    if (q % 5 < 2) R(g, '#c47a14', x + w - 2, y, 2, 1); if (q % 9 === 0) R(g, '#f8c24a', x + w - 2, y, 1, 1); }
  /* the honey runs down it: a glint travelling, a bead hanging at its foot */
  const ph = (time * 0.5 + seed * 0.13) % 1, gy = ay + ph * n; R(g, '#fff0a0', lerp(ax, bx, ph) + hw - 2, gy, 1, 3);
  R(g, '#ffd36b', bx + hw - 1, by + 1, 2, 3); R(g, '#c47a14', bx + hw, by + 3, 1, 3);
  /* the torn top: frayed wisps flaring out into the lip */
  for (let f = -2; f <= 2; f++) { const L = 5 + (hash(f + seed, 5) % 6); for (let q = 0; q < L; q++) R(g, q % 3 === 0 ? PAPERS[5] : PAPERS[3], ax + f * 2 + Math.round(f * q * 0.35), ay - q, 1, 1); }
}
/* c: a hanging comb of the hall (x0..x1 tiles, row), x/y its top-left on screen, w its width */
export function tornStalks(g, c, x, y, w, cx, cy, time) {
  const topY = TEAR.y1 - cy - 6;
  if (c.last) { for (const [dx, ax] of [[0.14, -64], [0.5, 0], [0.86, 64]]) stalk(g, TEAR.cx - cx + ax, topY, x + w * dx, y, dx === 0.5 ? 3 : 4, time, 3 + dx * 10); return; }
  const west = (c.x0 + c.x1) / 2 < 313.5, ax = TEAR.cx - cx + (west ? -92 : 92);
  stalk(g, ax, topY, x + w * (west ? 0.7 : 0.3), y, 4, time, west ? 1 : 2); stalk(g, ax + (west ? 20 : -20), topY + 2, x + w * (west ? 0.9 : 0.1), y, 3, time, west ? 5 : 6);
}

/* ---- THE ROYAL COMB (THE LAST COMB): baked per (w, h, set) ---- */
function royalSprite(w, h, set) { return once('royal' + w + 'x' + h + (set ? 's' : 'f'), () => {
  const PAD = 18, [c, g] = canvas(w + 4, h + PAD + 4), pal = set ? ['#2a1604', '#7a4c0e', '#c88a1e', '#e8b434', '#f6d060', '#fff0b0'] : ['#3a1e06', '#9a5e0e', '#e8a824', '#ffd24a', '#fff0a0', '#ffffff'];
  for (let y = 0; y < h; y++) { const t = y / Math.max(1, h - 1), inset = Math.round((1 - Math.min(1, y / 5)) * 3 + Math.pow(t, 3) * 4 + (y > h - 3 ? 2 : 0));
    for (let x = inset; x < w - inset; x++) { const row = Math.floor((y + 1) / 4), cu = (((x + (row & 1) * 3) % 6) + 6) % 6, cv = (y + 1) % 4, wall = cv === 0 ? cu >= 1 && cu <= 4 : (cv !== 3 && (cu === 0 || cu === 5)) || (cv === 3 && (cu === 0 || cu === 5));
      let col = wall ? pal[1] : (x - inset < 2 || (cv === 1 && cu === 1)) ? pal[4] : pal[3 - (t > 0.75 ? 1 : 0)];
      if (!wall && hash(x, y) % 15 === 0) col = pal[5]; if (y === 0 || x === inset || x === w - inset - 1 || y === h - 1) col = pal[0]; if (y === 1 && x > inset && x < w - inset - 1) col = pal[5]; if (y === 2 && x > inset + 1 && x < w - inset - 2) col = '#fff6d0';   /* a pale wax lip */
      if (set && ((x * 5 + y * 3) % 37 === 0 || (x * 3 - y * 7 + 220) % 41 === 0)) col = pal[0];
      R(g, col, x, y, 1, 1); } }
  /* jewelled queen cells set in the face: a dark gold ring, a red-orange glowing core */
  const jewel = (jx, jy, r) => { for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) { const d = Math.abs(xx) * 0.8 + Math.abs(yy) * 0.9; if (d > r) continue; R(g, d > r - 1 ? pal[0] : d > r - 2.2 ? pal[2] : '#ff7a2a', jx + xx, jy + yy, 1, 1); } R(g, '#ffd8a0', jx - 1, jy - 1, 1, 1); R(g, '#fff6e0', jx - 1, jy - 2, 1, 1); };
  const n = Math.max(3, Math.floor(w / 40)); for (let k = 0; k < n; k++) { const jx = Math.round((k + 0.5) * w / n); if (Math.abs(jx - w / 2) < 22) continue; jewel(jx, Math.round(h * 0.52), 6); }
  /* the crown medallion at the middle: a gold hex ring and a crown cut into it */
  { const mx = Math.round(w / 2), my = Math.round(h * 0.5), r = Math.min(15, h / 2 - 2); for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) { const d = Math.max(Math.abs(xx) * 0.87 + Math.abs(yy) * 0.5, Math.abs(yy)); if (d > r) continue; R(g, d > r - 1.2 ? pal[0] : d > r - 3 ? pal[5] : '#a8581a', mx + xx, my + yy, 1, 1); }
    for (const [dx, dy, ww, hh] of [[-6, 2, 13, 3], [-6, -3, 2, 5], [-1, -5, 2, 7], [4, -3, 2, 5]]) R(g, '#3a1e06', mx + dx, my + dy, ww, hh);   /* the crown: a band with three points */
    for (const dx of [-6, -1, 4]) R(g, '#ffe27a', mx + dx, my + (dx === -1 ? -5 : -3), 2, 1); }
  /* three capped queen cells hanging from its underside (peanut-shaped, pale wax) */
  if (!set) for (const fx of [0.2, 0.5, 0.8]) { const qx = Math.round(w * fx), top = h - 1; for (let yy = 0; yy < 14; yy++) { const ww = Math.round(3.4 + 1.8 * Math.sin(Math.min(1, yy / 13) * Math.PI) + (yy > 8 ? -0.5 : 0.4)); for (let xx = -ww; xx <= ww; xx++) R(g, Math.abs(xx) >= ww ? pal[0] : xx < -ww + 2 ? '#fff6c8' : yy > 9 ? '#d8b048' : '#ecc860', qx + xx, top + yy, 1, 1); } R(g, pal[1], qx - 2, top + 5, 5, 1); }
  return gpu(c); }); }
export function royal(g, x, y, w, h, set, time) {
  x = Math.round(x); y = Math.round(y);
  if (!set) { g.globalAlpha = 0.22 + 0.08 * Math.sin(time * 2.2); g.drawImage(puffLight(), x + w / 2 - 150, y + h / 2 - 60, 300, 120); g.globalAlpha = 1; }
  g.drawImage(royalSprite(w, h, set), x - 2, y);
  if (!set) { /* the jewels glint and the honey runs off the cells under it */
    for (let k = 0; k < 4; k++) { const ph = (time * 0.7 + k * 0.26) % 1; if (ph < 0.25) R(g, '#ffffff', x + 12 + ((k * 61) % (w - 24)), y + 4 + ((k * 17) % (h - 10)), 1 + (ph < 0.12 ? 1 : 0), 1); }
    for (const fx of [0.2, 0.5, 0.8]) { const ph = (time * 0.6 + fx * 3) % 1, qx = x + Math.round(w * fx); R(g, '#ffd36b', qx, y + h + 13 + Math.round(ph * 10), 1, 2 + (ph > 0.6 ? 1 : 0)); } }
}
/* bake the hall's pictures at the level's load (a first draw in the fight was a hitch) */
export function warmHall(combs) { tearSprite(); beamSprite(); puffLight(); for (const c of combs) if (c.last) for (const set of [false, true]) royalSprite((c.x1 - c.x0 + 1) * 16, c.rows * 16, set); }

/* ---- a comb dropping into the honey: a crown of drops and rings; age 0..1 over ~0.9 s ---- */
export function splash(g, x, y, w, age, time) {
  const k = age, fade = 1 - k; g.globalAlpha = Math.min(1, fade * 1.6);
  for (let d = 0; d < 16; d++) { const side = d % 2 ? 1 : -1, fromEdge = x + side * (w / 2 - 4 - (d % 4) * 5), v = 30 + (hash(d, 5) % 70), dx = side * v * k * 0.9 + ((hash(d, 8) % 9) - 4) * k * 4, dy = -(v * 1.7 * k - 95 * k * k);
    R(g, d % 3 ? '#ffd36b' : '#fff4b0', fromEdge + dx, y - 4 + dy, d % 4 === 0 ? 3 : 2, d % 4 === 0 ? 3 : 2); R(g, '#c47a14', fromEdge + dx, y - 4 + dy + 2, 1, 1); }
  g.strokeStyle = '#ffe08a'; for (let r = 0; r < 2; r++) { const rk = Math.max(0, k - r * 0.18); if (rk <= 0) continue; g.globalAlpha = Math.min(1, fade * 1.2) * 0.8; g.beginPath(); g.ellipse(x, y - 3, w / 2 + rk * 60, 2 + rk * 3, 0, 0, 7); g.stroke(); }
  g.globalAlpha = 1; void time;
}
/* ---- the pin: the comb drawn back over the queen's hindquarters (drawComb paints it, clipped to x0..x1 over its rows), honey squeezed from under it, stars ---- */
export function pinOver(g, drawComb, clipX0, clipX1, topY, botY, time, sideX) {
  g.save(); g.beginPath(); g.rect(Math.round(clipX0), Math.round(topY - 4), Math.round(clipX1 - clipX0), Math.round(botY - topY + 10)); g.clip(); drawComb(); g.restore();
  for (let k = 0; k < 3; k++) { const ph = (time * 1.4 + k / 3) % 1; R(g, '#ffd36b', sideX + (k - 1) * 4 + ph * 3, botY - 3 - ph * 5, 2, 2); R(g, '#c47a14', sideX + (k - 1) * 4 + ph * 3, botY - 1, 2, 1); }
  for (let k = 0; k < 3; k++) { const an = time * 5 + k * 2.1; R(g, '#fff0a0', sideX + Math.cos(an) * 12, topY - 8 + Math.sin(an) * 3, 2, 2); }
}
