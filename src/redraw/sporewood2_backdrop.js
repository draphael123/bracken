// sporewood2_backdrop.js - SPOREWOOD 2's OWN BACKDROP (claude/sporewood2art). The greybox wore the shared violet forest in every place. Each of the six areas now has its own air, far line and
// mid row (palette + shapes from sporewood2_pal.js), crossfading at the seams, and THE MOTHER'S KNOT stands behind them on the skyline (src/redraw/sporewood_knot.js):
//   THE MYCELIUM GLADE   a grey-green morning under tall pale toadstools, light shafts, motes of spore
//   THE LANTERN HOLLOWS  dark indigo under a roof of cap-undersides hung with gills, foxfire clusters twinkling on the stems
//   THE PUFFBALL BOG     olive peat air, great pale puffballs on the far bank, horsetail reeds, a low mist
//   THE WEB LARDER       bone-grey, great webs strung between the stems, cocoons hanging, a thin mist
//   THE MOTHER'S KNOT    her roots, root-red and warm, arching over the way, foxfire in their seams
//   THE MOTHER'S HOLLOW  plum dark, the vault of her gills overhead, veins of foxfire on the walls
// Every static picture is baked ONCE; a frame is ~50 drawImage calls. ART ONLY: nothing here reads or changes a hitbox or a number.
//   drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full, knotFn)   sky + far + the knot (knotFn) + mid
//   drawNear(g, cx, cy, VW, VH, L, time, dY)                     near stems and roots at the edges, hanging gills, foxfire fireflies
import { canvas, mulberry } from '../px.js';
import { PAL, GLOW, ZONES, zoneOf, palAt, mix, hash } from './sporewood2_pal.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/* how much light each place lets down (god rays), how thick its mist, how many stems stand in its mid row, whether foxfire shows */
const LOOK = [
  { rays: 0.16, mist: 0.5, dens: 62, fox: 0.2 },   /* glade */
  { rays: 0.0, mist: 0.3, dens: 78, fox: 1.0 },    /* hollows */
  { rays: 0.07, mist: 0.9, dens: 52, fox: 0.35 },  /* bog */
  { rays: 0.05, mist: 0.55, dens: 58, fox: 0.25 }, /* larder */
  { rays: 0.0, mist: 0.4, dens: 46, fox: 0.7 },    /* knot */
  { rays: 0.0, mist: 0.35, dens: 40, fox: 0.9 },   /* hollow */
];

/* ------------------------------------------------------------------ baked pieces ------------------------------------------------------------------ */
/* a stem: a column of pale flesh lit on the left, fibrous lines, a ragged ring (annulus) a third of the way up, a flared foot with root fingers. w = half width; hazy = 0..1 toward the air */
function bakeStem(z, seed, w, h, hazy) {
  const P = PAL[z], r = mulberry(seed * 31 + z * 7), W = w * 2 + 40, [c, g] = canvas(W, h), cxs = W >> 1, st = P.stem.map(col => mix(col, P.haze, hazy));
  for (let y = 0; y < h; y++) { const t = y / h, flare = y > h - 28 ? Math.pow((y - (h - 28)) / 28, 1.7) * (w * 0.7 + 6) : 0, ww = w + Math.round(Math.sin(y * 0.05 + seed) * 1.2) + flare, xl = Math.round(cxs - ww), wd = Math.max(2, Math.round(ww * 2));
    R(g, st[1], xl, y, wd, 1); R(g, st[2], xl, y, Math.max(1, wd >> 2), 1); R(g, st[0], xl + wd - Math.max(1, wd >> 2), y, Math.max(1, wd >> 2), 1);
    if (wd > 8) { const fl = 1 + ((hash(seed, y >> 4) % 2)); for (let f = 1; f <= fl; f++) if (((y >> 2) + f * 3 + seed) % 5 !== 0) R(g, mix(st[1], st[0], 0.5), xl + Math.round(wd * f / (fl + 1)), y, 1, 1); } void t; }
  /* the ring: a ragged skirt */
  const ry = Math.round(h * 0.34); for (let k = -w - 4; k <= w + 4; k++) { const drop = 3 + (hash(k + seed, 9) % 4); R(g, st[2], cxs + k, ry, 1, 1); R(g, st[1], cxs + k, ry + 1, 1, drop - 1); R(g, st[0], cxs + k, ry + drop, 1, 1); }
  /* root fingers at the foot */
  for (let i = 0; i < 6; i++) { const d = i % 2 ? 1 : -1, len = 5 + ((r() * 9) | 0); for (let k = 0; k < len; k++) R(g, st[0], cxs + d * (w + 4 + k), h - 1 - Math.round(k * 0.3), 1, 1 + (k < 3 ? 1 : 0)); }
  return c;
}
/* a cap (dome) seen from the side, w = half width: lit on the left, spotted, a pale gill line under the rim */
function bakeCap(z, seed, w, hh, hazy) {
  const P = PAL[z], r = mulberry(seed * 13 + z), [c, g] = canvas(w * 2 + 6, hh + 8), cp = P.cap.map(col => mix(col, P.haze, hazy)), CX = w + 3;
  for (let y = 0; y < hh; y++) { const t = (y + 1) / hh, ww = Math.round(w * Math.sqrt(1 - Math.pow(1 - t, 2))), xl = CX - ww;
    R(g, y < 2 ? cp[2] : cp[1], xl, y, ww * 2, 1); R(g, cp[2], xl, y, Math.max(1, Math.round(ww * 0.35)), 1); R(g, cp[0], CX + Math.round(ww * 0.55), y, Math.max(1, Math.round(ww * 0.45)), 1); }
  for (let i = 0; i < 5 + (w >> 3); i++) { const sx = CX + Math.round((r() - 0.5) * w * 1.5), sy = 2 + ((r() * (hh - 5)) | 0); R(g, mix(cp[2], '#ffffff', 0.35), sx, sy, 2, 1); }
  R(g, mix(cp[0], '#000000', 0.2), CX - w, hh - 1, w * 2, 1); R(g, mix('#e8ddc0', P.haze, hazy), CX - w + 1, hh, w * 2 - 2, 1);
  for (let k = -w + 2; k < w - 1; k += 2) R(g, mix('#9c8c66', P.haze, hazy), CX + k, hh + 1, 1, 2);
  return c;
}
/* a far toadstool: a cap on a thin stem, in haze */
function bakeFarShroom(z, seed) {
  const P = PAL[z], r = mulberry(seed * 5 + z * 3), capW = 16 + ((r() * 18) | 0), stemH = 70 + ((r() * 60) | 0), [c, g] = canvas(capW * 2 + 8, stemH + 30), CX = capW + 4;
  const stem = bakeStem(z, seed + 50, 3 + ((r() * 2) | 0), stemH, 0.72), cap = bakeCap(z, seed + 70, capW, 8 + ((r() * 8) | 0), 0.72);
  g.drawImage(stem, CX - (stem.width >> 1), 24); g.drawImage(cap, CX - (cap.width >> 1), 18 - ((cap.height - 8) >> 1) + 4);
  return c;
}
/* a GILL ROOF: the underside of a great cap hanging across the top of the view, scalloped, with gill lines and drip tips; 160 wide, tiles */
function bakeGills(z, seed, depth) {
  const P = PAL[z], r = mulberry(seed * 11 + z), W = 160, H = depth + 18, [c, g] = canvas(W, H), cp = P.cap, dark = mix(cp[0], '#000000', 0.45);
  R(g, dark, 0, 0, W, depth - 8);
  for (let x = 0; x < W; x++) { const e = depth - 8 + Math.round(Math.sin(x / W * Math.PI * 4 + seed) * 5 + Math.sin(x / W * Math.PI * 9) * 2); R(g, dark, x, 0, 1, e); R(g, cp[0], x, e - 2, 1, 2); R(g, mix(cp[1], '#d8ccb0', 0.25), x, e, 1, 1); }
  for (let x = 0; x < W; x += 3) { const e = depth - 8 + Math.round(Math.sin(x / W * Math.PI * 4 + seed) * 5 + Math.sin(x / W * Math.PI * 9) * 2), len = 4 + ((hash(x, seed) % 8)); R(g, mix(cp[1], '#d8ccb0', 0.3), x, e + 1, 1, len); R(g, cp[0], x + 1, e + 1, 1, Math.max(1, len - 2)); }
  if (z === 1 || z === 5) for (let i = 0; i < 6; i++) { const x = (r() * W) | 0, e = depth - 8 + Math.round(Math.sin(x / W * Math.PI * 4 + seed) * 5 + Math.sin(x / W * Math.PI * 9) * 2); R(g, GLOW.mid, x, e + 4 + ((r() * 6) | 0), 1, 1); R(g, GLOW.hi, x, e + 3, 1, 1); }
  return c;
}
/* a big radial WEB 64 x 64 (hung off the upper-left corner by a thread): spokes, concentric sags, a few dewdrops */
function bakeWeb(seed) {
  const r = mulberry(seed * 3 + 1), [c, g] = canvas(64, 64), cx0 = 30, cy0 = 30, col = '#e6e2d2', dim = '#a8a490'; const spokes = 9;
  const pt = (a, d) => [cx0 + Math.cos(a) * d, cy0 + Math.sin(a) * d * 0.95];
  for (let s = 0; s < spokes; s++) { const a = s / spokes * Math.PI * 2 + 0.2; for (let d = 2; d < 30; d++) { const [x, y] = pt(a, d); R(g, d % 3 ? col : dim, x, y, 1, 1); } }
  for (let ring = 6; ring <= 28; ring += 5 + ((r() * 2) | 0)) for (let s = 0; s < spokes; s++) { const a0 = s / spokes * Math.PI * 2 + 0.2, a1 = (s + 1) / spokes * Math.PI * 2 + 0.2; for (let t = 0; t <= 1; t += 0.12) { const sag = Math.sin(t * Math.PI) * 1.5, [x, y] = pt(a0 + (a1 - a0) * t, ring - sag); R(g, ring % 2 ? col : dim, x, y, 1, 1); } }
  for (let i = 0; i < 6; i++) { const [x, y] = pt(r() * 6.28, 6 + r() * 22); R(g, '#ffffff', x, y, 1, 1); }
  for (let d = 0; d < 30; d++) R(g, dim, 29 - d, 29 - d * 0.95, 1, 1);
  return c;
}
/* a COCOON: a husk bundled in silk, hung by a thread; 12 x 40 */
function bakeCocoon(seed) {
  const [c, g] = canvas(14, 44), r = mulberry(seed);
  R(g, '#a8a490', 6, 0, 1, 14);
  for (let y = 0; y < 24; y++) { const w = Math.round(2 + 4 * Math.sin((y + 2) / 26 * Math.PI)); R(g, y % 4 === 0 ? '#8c8878' : '#cfc9b4', 7 - w, 14 + y, w * 2, 1); R(g, '#efe9d4', 7 - w, 14 + y, 1, 1); R(g, '#7e7a68', 6 + w - 1, 14 + y, 1, 1); }
  for (let i = 0; i < 3; i++) R(g, '#7e7a68', 4 + ((r() * 6) | 0), 18 + i * 6, 5, 1);
  return c;
}
/* a PUFFBALL on a short root: a pale sphere shaded left-lit, pores, a little burst-scar; r = radius */
function bakePuff(z, seed, rad) {
  const P = PAL[z], r = mulberry(seed * 7 + 5), [c, g] = canvas(rad * 2 + 6, rad * 2 + 10), cx0 = rad + 3, cy0 = rad + 3, base = mix('#d8d2bc', P.haze, 0.18), hi = mix('#f4f0e0', P.haze, 0.1), lo = mix('#8a8670', P.haze, 0.2);
  for (let y = -rad; y <= rad; y++) for (let x = -rad; x <= rad; x++) { const d = Math.hypot(x, y); if (d > rad) continue; const lit = (-x * 0.6 - y * 0.8) / rad; R(g, lit > 0.45 ? hi : lit > -0.1 ? base : lit > -0.55 ? mix(base, lo, 0.55) : lo, cx0 + x, cy0 + y, 1, 1); }
  for (let i = 0; i < rad; i++) { const a = r() * 6.28, d = r() * rad * 0.85; R(g, mix(lo, base, 0.4), cx0 + Math.cos(a) * d, cy0 + Math.sin(a) * d, 1, 1); }
  R(g, lo, cx0 - 1, cy0 - rad + 1, 3, 2);   /* the vent it will burst from */
  R(g, lo, cx0 - 2, cy0 + rad, 5, 2); return c;
}
/* a horsetail REED (bog): jointed stalk with whorls; 12 x h */
function bakeReed(z, seed, h) {
  const P = PAL[z], [c, g] = canvas(12, h), col = mix(P.fung[1], P.haze, 0.5), dk = mix(P.fung[0], P.haze, 0.35);
  for (let y = 0; y < h; y++) { R(g, y % 9 === 0 ? dk : col, 5, y, 2, 1); } for (let y = 6; y < h; y += 9) { R(g, col, 2, y, 8, 1); R(g, dk, 1, y + 1, 2, 1); R(g, dk, 9, y + 1, 2, 1); } return c;
}
/* a ROOT ARCH (her knot's approach): a great twisted root swinging up and over, foxfire in its seams; 120 x 150, foot at the bottom both sides */
function bakeRootArch(seed) {
  const P = PAL[4], r = mulberry(seed * 9 + 2), [c, g] = canvas(150, 190), s = P.s.map(col => mix(col, P.haze, 0.45));
  for (let side = -1; side <= 1; side += 2) { for (let t = 0; t <= 1; t += 0.004) { const x = 75 + side * (62 - 48 * Math.pow(t, 1.4)) + Math.sin(t * 14 + seed) * 2, y = 190 - t * 175, w = 7 * (1 - t * 0.55) + 1; for (let dx = -w; dx <= w; dx++) R(g, dx < -w * 0.4 ? s[4] : dx > w * 0.4 ? s[1] : s[2], x + dx, y, 1, 1); if (hash(Math.round(t * 400), seed) % 9 === 0) R(g, GLOW.mid, x + 1, y, 1, 1); } }
  for (let i = 0; i < 12; i++) R(g, s[3], 62 + ((r() * 26) | 0), 8 + ((r() * 10) | 0), 3, 1);
  return c;
}
/* a FOXFIRE CLUSTER: tiny glowing buds on a stem, 14 x 12 (the halo is drawn live) */
function bakeFox(seed) { const r = mulberry(seed), [c, g] = canvas(16, 14); R(g, '#3a4a46', 7, 6, 2, 8);
  for (let i = 0; i < 5; i++) { const x = 3 + ((r() * 10) | 0), y = 1 + ((r() * 6) | 0), w = 2 + ((r() * 2) | 0); R(g, GLOW.mid, x - 1, y + 1, w + 2, 1); R(g, GLOW.c, x, y, w, 1); R(g, GLOW.hi, x, y, 1, 1); } return c; }
/* a soft band (mist) and a soft glow disc */
function bakeMist(rgb, a) { const [c, g] = canvas(1, 48); for (let y = 0; y < 48; y++) { const k = Math.sin((y / 47) * Math.PI); g.fillStyle = 'rgba(' + rgb + ',' + (k * k * a).toFixed(3) + ')'; g.fillRect(0, y, 1, 1); } return c; }
function bakeHalo(rgb) { const [c, g] = canvas(48, 48), gr = g.createRadialGradient(24, 24, 0, 24, 24, 24); gr.addColorStop(0, 'rgba(' + rgb + ',0.5)'); gr.addColorStop(0.4, 'rgba(' + rgb + ',0.16)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)'); g.fillStyle = gr; g.fillRect(0, 0, 48, 48); return c; }

/* ------------------------------------------------------------------ placement ------------------------------------------------------------------ */
const farBase = (VH, dY) => Math.round(VH * 0.52 + dY * 0.05), midBase = (VH, dY) => Math.round(VH * 0.7 + dY * 0.12);
/* a deterministic list of world-anchored items on a parallax layer: [{ sx, z, hs }] with spacing s and a per-zone density (0..100) */
function row(cx, VW, f, s, salt, densOf) {
  const out = [], mid = cx + VW / 2, i0 = Math.floor((mid * f - VW / 2 - 70) / s), i1 = Math.ceil((mid * f + VW / 2 + 70) / s);
  for (let i = i0; i <= i1; i++) { const hs = hash(i, salt), U = i * s + (hs % Math.max(2, s >> 1)), t = (U / f) / 16, z = zoneOf(t); if ((hs >>> 5) % 100 >= densOf(z)) continue;
    out.push({ sx: Math.round(VW / 2 + U - mid * f), z, hs, t }); }
  return out;
}

/* ------------------------------------------------------------------ the frame ------------------------------------------------------------------ */
export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full, knotFn) {
  const mid = cx + VW / 2, tM = mid / 16, A = palAt(tM), z = A.z, P = A.P, Q = A.Q, fb = farBase(VH, dY), mb = midBase(VH, dY), look = LOOK[z];
  /* SKY / BACK COLOUR: the place's two colours, a seam crossfade to the next place */
  { const c0 = mix(P.sky[0], Q.sky[0], A.k), c1 = mix(P.sky[1], Q.sky[1], A.k); const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, c0); gr.addColorStop(0.75, c1); gr.addColorStop(1, mix(c1, '#000000', 0.2)); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); }
  /* LIGHT SHAFTS (the glade's morning, a little in the bog and the larder): slow slanted bars, additive */
  { const rays = look.rays; if (rays > 0.01) { g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { const x0 = ((i * 83 - cx * 0.08 + time * 1.5 * (i % 2 ? 1 : -1)) % (VW + 120) + VW + 120) % (VW + 120) - 60, w = 14 + (i * 7) % 16; g.globalAlpha = rays * (0.6 + 0.4 * Math.sin(time * 0.4 + i * 2));
      g.fillStyle = mix(P.sky[1], '#fff6d0', 0.55); g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + w, 0); g.lineTo(x0 + w - 46, VH); g.lineTo(x0 - 46, VH); g.fill(); } g.restore(); g.globalAlpha = 1; } }
  /* FAR (0.12): hazy toadstools, a haze floor */
  if (full) {
    g.globalAlpha = 0.5; g.fillStyle = mix(P.haze, P.s[1], 0.55); g.fillRect(0, fb + 6, VW, VH - fb); g.globalAlpha = 1;
    for (const o of row(cx, VW, 0.12, 38, 13, () => 78)) { const sp = once('fs' + o.z + '_' + (o.hs % 5), () => bakeFarShroom(o.z, o.hs % 5 + 1)); g.drawImage(sp, o.sx - (sp.width >> 1), fb - sp.height + 36 + (o.hs % 6)); }
    /* far foxfire (the hollows, her hollow, her knot): pin-points twinkling in the dark */
    if (look.fox > 0.3) for (let i = 0; i < 16; i++) { const hs = hash(i, 301), U = (hs % 900) - 220, sx = Math.round(((U - cx * 0.1) % (VW + 100) + VW + 100) % (VW + 100)) - 50, sy = 14 + (hs >> 5) % Math.round(VH * 0.55), tw = 0.5 + 0.5 * Math.sin(time * (1.1 + (hs % 5) * 0.2) + hs); g.globalAlpha = look.fox * 0.7 * tw; R(g, GLOW.c, sx, sy, 1, 1); g.globalAlpha = 1; }
  }
  /* THE MOTHER'S KNOT on the skyline: behind the mid row, over the far line (the caller's callback) */
  if (knotFn) knotFn();
  /* a pale bank of the place's air between the far line and the mid row */
  { const ph = Math.sin(time * 0.12) * 12, mc = P.haze.slice(1).match(/../g).map(h => parseInt(h, 16)).join(','); g.globalAlpha = Math.min(1, 0.5 * look.mist + 0.12); g.drawImage(once('mA' + z, () => bakeMist(mc, 0.6)), 0, 0, 1, 48, Math.round(ph) - 14, fb - 24, VW + 28, 52); g.globalAlpha = 1; }
  /* THE GILL ROOF (the hollows, her hollow): the undersides of the great caps across the top of the view */
  if (z === 1 || z === 5 || (z === 4 && A.k > 0)) { const k = z === 4 ? 1 : 1, depth = z === 5 ? 56 : 40, sp = once('gr' + (z === 4 ? 5 : z), () => bakeGills(z === 4 ? 5 : z, 5, depth)), so = ((-(cx * 0.3)) % 160 + 160) % 160, top = Math.round(-6 - Math.min(14, Math.max(0, 40 - dY * 0.1)) * 0) - (z === 5 ? 0 : 8);
    g.globalAlpha = k * (z === 1 ? 0.92 : 0.85); for (let X = -160 + so; X < VW; X += 160) g.drawImage(sp, Math.round(X), top); g.globalAlpha = 1; }
  /* MID (0.30): the stems of the place - and each place's own things on the stems */
  { const dens = zz => LOOK[zz].dens;
    for (const o of row(cx, VW, 0.3, 54, 71, dens)) { const v = o.hs % 4, w = 9 + (o.hs % 4) * 3, hz = 0.28;
      const sp = once('ms' + o.z + '_' + v, () => bakeStem(o.z, v + 1, w, 300, hz)), X = o.sx - (sp.width >> 1), Y = mb - 300 + 4 - (o.hs & 3);
      g.drawImage(sp, X, Y);
      /* per place */
      if (o.z === 1 || o.z === 5) { for (let q = 0; q < 2; q++) { const fx = o.sx + ((o.hs >> (q * 3)) % 2 ? 1 : -1) * (w + 2), fy = mb - 40 - ((o.hs >> (q + 4)) % 120), tw = 0.55 + 0.45 * Math.sin(time * 1.7 + o.hs * 0.1 + q * 2);
          g.drawImage(once('fx' + q, () => bakeFox(q + 1)), fx - 8, fy - 7); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5 * tw; g.drawImage(once('halo', () => bakeHalo(GLOW.rgb)), fx - 24, fy - 24); g.restore(); g.globalAlpha = 1; } }
      if (o.z === 3) { const wb = once('web' + (o.hs % 3), () => bakeWeb(o.hs % 3 + 1)); g.globalAlpha = 0.55; g.drawImage(wb, o.sx + w - 8, mb - 200 - (o.hs % 60)); g.globalAlpha = 1;
        if (o.hs % 3 === 0) { const sw = Math.round(Math.sin(time * 0.7 + o.hs) * 1.5); g.globalAlpha = 0.85; g.drawImage(once('cc', () => bakeCocoon(3)), o.sx - 7 + sw, mb - 190 - (o.hs % 50)); g.globalAlpha = 1; } }
      if (o.z === 2) { const rd = once('rd' + (o.hs % 3), () => bakeReed(2, o.hs % 3, 70 + (o.hs % 3) * 20)); for (let q = 0; q < 3; q++) g.drawImage(rd, o.sx + 16 + q * 7 + Math.round(Math.sin(time * 0.8 + q + o.hs) * 1), mb - rd.height + 4 + q * 2); } }
    /* THE BOG'S PUFFBALLS: great pale spheres along the far bank, between the stems (and a few in the larder's dark) */
    for (const o of row(cx, VW, 0.3, 70, 233, zz => zz === 2 ? 80 : 0)) { const rad = 10 + (o.hs % 3) * 5, sp = once('pb' + (o.hs % 3), () => bakePuff(2, o.hs % 3 + 1, rad)), bob = Math.round(Math.sin(time * 0.9 + o.hs) * 0.8); g.globalAlpha = 0.92; g.drawImage(sp, o.sx + 22 - (sp.width >> 1), mb - sp.height + 6 + bob); g.globalAlpha = 1; }
    /* HER ROOTS (the knot's approach): great roots arching over the way */
    for (const o of row(cx, VW, 0.3, 110, 419, zz => zz === 4 ? 90 : 0)) { const sp = once('ra' + (o.hs % 2), () => bakeRootArch(o.hs % 2 + 1)); g.globalAlpha = 0.9; g.drawImage(sp, o.sx - 75, mb - 186); g.globalAlpha = 1; } }
  /* a low bank of mist laid over the mid foot */
  { const ph = Math.sin(time * 0.17 + 1) * 16, mc = P.haze.slice(1).match(/../g).map(h => parseInt(h, 16)).join(','); g.globalAlpha = Math.min(1, 0.7 * look.mist); g.drawImage(once('mB' + z, () => bakeMist(mc, 0.5)), 0, 0, 1, 48, Math.round(ph) - 16, mb - 30, VW + 32, 48); g.globalAlpha = 1; }
}

/* ---------------- NEAR (0.55): the dark stems you walk past, hanging gills over the top, foxfire fireflies ---------------- */
export function drawNear(g, cx, cy, VW, VH, L, time, dY) {
  const mid = cx + VW / 2, tM = mid / 16, f = 0.55, z0 = zoneOf(tM), yoff = Math.round(VH - 250 + Math.min(80, dY * 0.16));
  for (const o of row(cx, VW, f, 130, 41, zz => LOOK[zz].dens * 0.5)) { const w = 12 + (o.hs % 3) * 4, sp = once('ns' + o.z + '_' + (o.hs % 3), () => { const [c, g2] = canvas(w * 2 + 40, 250); g2.drawImage(bakeStem(o.z, o.hs % 3 + 9, w, 250, 0), 0, 0); const img = g2.getImageData(0, 0, c.width, c.height), d = img.data; for (let i = 0; i < d.length; i += 4) { d[i] *= 0.42; d[i + 1] *= 0.42; d[i + 2] *= 0.46; } g2.putImageData(img, 0, 0); return c; });
    g.globalAlpha = 0.72; g.drawImage(sp, o.sx - (sp.width >> 1), yoff); g.globalAlpha = 1; }
  /* gills / threads hanging across the top edge (the hollows and her hollow) and mycelium curtains elsewhere, swaying */
  if (z0 === 1 || z0 === 5 || z0 === 4) { const s2 = 100, j0 = Math.floor((mid * 0.5 - VW / 2 - 40) / s2), j1 = Math.ceil((mid * 0.5 + VW / 2 + 40) / s2);
    for (let j = j0; j <= j1; j++) { const hs = hash(j, 59), U = j * s2 + (hs % 50); if (zoneOf((U / 0.5) / 16) === 2) continue; const sx = Math.round(VW / 2 + U - mid * 0.5), sw = Math.round(Math.sin(time * 0.5 + hs * 0.02) * 1.5), P = PAL[zoneOf((U / 0.5) / 16)];
      const sp = once('hg' + (hs % 3) + '_' + zoneOf((U / 0.5) / 16), () => { const [c, g2] = canvas(48, 60), r = mulberry(hs % 3 + 5); R(g2, mix(P.cap[0], '#000', 0.5), 0, 0, 48, 3); for (let i = 0; i < 14; i++) { const x = 2 + ((r() * 44) | 0), len = 8 + ((r() * 40) | 0) * (1 - Math.abs(x - 24) / 40); for (let k = 0; k < len; k++) R(g2, k > len - 3 ? P.thread : mix(P.cap[1], '#000', 0.4 + 0.2 * (k / len)), x, 2 + k, 1, 1); } return c; });
      g.globalAlpha = 0.8; g.drawImage(sp, sx - 24 + sw, -22 + Math.min(0, Math.round(dY * 0.05) - 4)); g.globalAlpha = 1; } }
  /* foxfire fireflies drifting in the hollows, her knot's approach and her hollow */
  const fox = LOOK[z0].fox; if (fox > 0.3) for (let i = 0; i < 9; i++) { const hs = hash(i, 777), a = time * (0.25 + (hs % 5) * 0.05) + hs, X = ((hs % 400) - cx * 0.55 % 400 + 400) % 400 - 40 + Math.round(Math.sin(a) * 14), Y = 20 + (hs >> 4) % Math.round(VH * 0.6) + Math.round(Math.sin(a * 1.3) * 8), tw = 0.5 + 0.5 * Math.sin(time * 2 + hs);
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35 * fox * tw; g.drawImage(once('halo', () => bakeHalo(GLOW.rgb)), X - 12, Y - 12, 24, 24); g.restore(); g.globalAlpha = fox * (0.5 + 0.5 * tw); R(g, GLOW.hi, X, Y, 1, 1); g.globalAlpha = 1; }
}
export { ZONES };
