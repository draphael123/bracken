// src/redraw/underwell_art.js - THE UNDERWELL's ART (claude/underwellart; the Opus greybox's placeholders, redrawn).
//   THE CAST: the four scorpion variants over the scorpion's seven frames (the machine names them: 0,1 walk | 2 claw tell | 3 claw | 4 sting tell | 5 sting | 6 hurt), each with its OWN
//   silhouette and not only its own colour, so they read apart at 320x180 -
//     OIL      tar-black, glossy (a specular streak), bleeding: drips from the body and the barb, a slick under the feet
//     DUST     pale, grit-crusted, a halo of flying grit round the body and pincers (the grit that blinds)
//     THIRSTY  bleached bone, gaunt (longer, leaner), ribbed, hollow-eyed, long feelers, a blue water-hungry barb
//     SPITTING the slinger's machine (its seven frames, in the slinger's order), purple, a bulging pink VENOM SAC at the barb that swells on the tell
//   and the FAST SANDWORM (slate-violet, ivory bands, red-eyed) against the plain sandworm's tan.
//   THE WORLD (drawn live by src/underwell-hands.js): the oil cells (oil / burning / wet / spent - four unmistakable looks, deep gutter oil heavier), the brood nests (papery egg-sacs
//   in webbing, charring and burning), the hanging cresset torches, THE GREAT LAMP, THE DRY FOUNTAIN, the brass tap, the silt, the gutter's grate, the grit that blinds, her cast shell,
//   and the LIGHT: warm pools for every torch / burning cell / lamp (lightPool) drawn over the dark.
import { canvas, circle, outline, flipX, whiten, rgb, px, rect } from '../px.js';
import { OUT } from '../art.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };
const lerpC = (a, b, t) => { const A = rgb(a), B = rgb(b); return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; };
const rampAt = (st, l) => l < 0.5 ? lerpC(st[0], st[1], l * 2) : lerpC(st[1], st[2], (l - 0.5) * 2);
function recolor(c, pick) { const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], l = (r + gg + b) / 765; if (l < 0.13) continue;
    const st = pick(r, gg, b, l); if (!st) continue; const o = rampAt(st, Math.min(1, l * 1.15)); p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; }
  g.putImageData(img, 0, 0); return d; }
const barbRed = (r, g) => r > 200 && g < 110;
const skin = (barb, hi, lo) => (r, g, b, l) => barbRed(r, g) ? barb : (r > g && l > 0.16) ? (l > 0.42 ? hi : lo) : null;
/* where the barb is in a frame (the base scorpion's stinger is the one bright-red cluster): its centroid, or null */
const barbAt = c => { const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; let sx = 0, sy = 0, n = 0; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (d[i + 3] && barbRed(d[i], d[i + 1])) { sx += x; sy += y; n++; } } return n ? [sx / n, sy / n] : null; };
const bodyRow = c => { const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; let best = 0, by = 0; for (let y = 0; y < c.height; y++) { let n = 0; for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) n++; if (n >= best) { best = n; by = y; } } return by; };
const bbox = c => { const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; };
/* a frame given extra pixels: its canvas is grown by `pad` all round (the anchor moves with it) so a drip or a halo is not clipped */
const grow = (c, pad, draw) => { const [d, g] = canvas(c.width + pad * 2, c.height + pad * 2); g.drawImage(c, pad, pad); if (draw) { g.save(); g.translate(pad, pad); draw(g, pad); g.restore(); } return d; };
const reskin = (set, pick, order, extra) => { const pad = extra ? extra.pad : 0; const R = (order || set.R.map((_, i) => i)).map((i, k) => { let f = recolor(set.R[i], pick); if (extra) { if (extra.scale) { const [d, g] = canvas(Math.round(f.width * extra.scale[0]), Math.round(f.height * extra.scale[1])); g.drawImage(f, 0, 0, d.width, d.height); f = d; } const base = set.R[i]; f = grow(f, pad, (g, p) => extra.draw(g, p, f, k, base)); }
    return f; });
  const fw = R[0].width, fh = R[0].height; const sx = extra && extra.scale ? extra.scale[0] : 1, sy = extra && extra.scale ? extra.scale[1] : 1;
  return pack(R, Math.round(set.ax * sx) + pad, Math.round(set.ay * sy) + pad, set.w, set.h); };

/* ---------- THE CAST ---------- */
export const OIL_PICK = skin(['#3a1a5a', '#9a5ad8', '#e8c8ff'], ['#0e0c12', '#2a2436', '#6a5a8a'], ['#060508', '#141018', '#2e2638']);
export const DUST_PICK = skin(['#b8a878', '#ece0b4', '#fffbe8'], ['#6a6458', '#b8b098', '#ece4cc'], ['#34302a', '#6a6252', '#a39a82']);
export const THIRST_PICK = skin(['#2a6aa8', '#6ac0f8', '#e0f4ff'], ['#8a8068', '#e0d4b4', '#fffaec'], ['#4a4438', '#968a70', '#cbbf9f']);
export const SPIT_PICK = skin(['#8a1a6a', '#e84ac0', '#ffd0f4'], ['#341040', '#7a3a8a', '#c07ad0'], ['#16081e', '#3a1846', '#6a3478']);
const dot = (g, x, y, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
/* OIL: a specular streak down the shell, drips off the belly and the barb, a slick under the feet */
const oilExtra = { pad: 4, draw(g, p, f, k, base) { const bb = bbox(f), b = barbAt(base);
  const by0 = bodyRow(f) - 2; for (let x = bb[0] + 7; x < bb[2] - 5; x++) if ((x * 7 + k) % 9 < 3) dot(g, x, by0 + (x % 2), '#a89ad8');                              /* the gloss */
  g.fillStyle = '#16101e'; g.fillRect(bb[0] + 3, bb[3] + 1, bb[2] - bb[0] - 4, 1); g.fillStyle = '#2e2144'; g.fillRect(bb[0] + 6, bb[3] + 1, 3, 1);   /* the slick */
  for (const [dx, len] of [[0.3, 3], [0.55, 2], [0.8, 4]]) { const x = bb[0] + Math.round((bb[2] - bb[0]) * dx), y0 = bb[3] - 2; for (let i = 0; i < len; i++) dot(g, x, y0 + i + ((k + 2) % 3 === 0 ? 1 : 0), i === len - 1 ? '#5a4686' : '#0c0914'); }   /* drips */
  if (b) { const bx = Math.round(b[0]), by = Math.round(b[1]); for (let i = 1; i <= 3; i++) dot(g, bx, by + i, i === 3 ? '#9a78d8' : '#1c1428'); } } };
/* DUST: a halo of grit round the body, thicker at the pincers (the front, right), flaring on the claw frames */
const dustExtra = { pad: 4, draw(g, p, f, k, base) { const bb = bbox(f); let s = 11 + k * 5;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  for (let i = 0; i < 22 + (k === 2 || k === 3 ? 14 : 0); i++) { const ex = k === 2 || k === 3 ? 1.6 : 1; const x = bb[0] - 1 + rnd() * (bb[2] - bb[0] + 4) + (rnd() < 0.3 ? (bb[2] - bb[0]) * 0.1 * ex : 0), y = bb[1] + 2 + rnd() * (bb[3] - bb[1] + 2); dot(g, x, y, rnd() < 0.4 ? '#f6ecc4' : rnd() < 0.5 ? '#bba984' : '#7c7258'); }
  for (let x = bb[0] + 2; x < bb[2]; x += 4) dot(g, x, bb[3] + 2, '#9c8e6c'); } };
/* THIRSTY: leaner and longer (x1.14 by x0.84), ribs, dark hollow eye, two long feelers, a dry blue drop on the barb */
const thirstExtra = { pad: 4, scale: [1.14, 0.84], draw(g, p, f, k, base) { const bb = bbox(f), b = barbAt(base);
  const brow = bodyRow(f); for (let x = bb[0] + 9; x < bb[2] - 6; x += 3) { g.fillStyle = '#7a7058'; g.fillRect(x, brow - 3, 1, 5); dot(g, x + 1, brow - 3, '#fffaec'); }
  const hx = bb[2] - 3; dot(g, hx, brow - 1, '#1a1610'); dot(g, hx - 1, brow - 1, '#1a1610');
  g.fillStyle = '#d8cca8'; g.fillRect(bb[2] - 2, brow - 4, 4, 1); g.fillRect(bb[2] + 1, brow - 5, 3, 1); g.fillRect(bb[2] - 1, brow - 2, 4, 1); dot(g, bb[2] + 3, brow - 6, '#fffaec');   /* the feelers */
  if (b) { const bx = Math.round(b[0] * 1.14), by = Math.round(b[1] * 0.84); dot(g, bx, by + 2, '#6ac0f8'); dot(g, bx, by + 3, '#2a6aa8'); } } };
/* SPITTING: a bulging pink venom sac at the barb, bigger on the tell frames; the slinger's frames are 0 stand | 1,2 the tell | 3 loose | 4,5 kick | 6 hurt, in SPIT_ORDER from the scorpion's */
const spitExtra = { pad: 4, draw(g, p, f, k, base) { const b = barbAt(base); if (!b) return; const bx = Math.round(b[0]), by = Math.round(b[1]), r = k === 1 || k === 2 ? 3 : 2;
  circle(g, bx, by, r + 0.6, '#5a1050'); circle(g, bx, by, r, '#e84ac0'); dot(g, bx - 1, by - 1, '#ffd0f4'); if (r === 3) { dot(g, bx + 3, by + 2, '#e84ac0'); dot(g, bx + 3, by + 3, '#8a1a6a'); } } };
export const bakeOilScorpion = base => reskin(base, OIL_PICK, null, oilExtra);
export const bakeDustScorpion = base => reskin(base, DUST_PICK, null, dustExtra);
export const bakeThirstScorpion = base => reskin(base, THIRST_PICK, null, thirstExtra);
/* the spitter runs the SLINGER's machine: its frames, in the slinger's order, cut from the scorpion's (stand, tail up x2, the spit, claw up, claw, hurt) */
export const SPIT_ORDER = [0, 4, 4, 5, 2, 3, 6];
export const bakeSpitScorpion = base => reskin(base, SPIT_PICK, SPIT_ORDER, spitExtra);
export function bakeGlob() { const [c, g] = canvas(9, 9); circle(g, 4, 4, 3.4, '#6a1060'); circle(g, 4, 4, 2.6, '#e84ac0'); circle(g, 4, 4, 1.4, '#ffb0ec'); px(g, 3, 3, '#ffffff'); px(g, 6, 7, '#e84ac0'); outline(c, OUT); return c; }
/* THE FAST SANDWORM: the plain worm's tan skin becomes slate violet with ivory bands, a red eye, a darker maw; the silt it rises from is the sump's own */
const WORM_MAP = { '#c89a6a': '#6a5a82', '#e8c498': '#a090c0', '#8a6040': '#3c3050', '#6e4a30': '#e0d4b8', '#3a1418': '#1a0810', '#7a2a2a': '#a82a2a' };
export function bakeFastWorm(base) {
  const map = Object.fromEntries(Object.entries(WORM_MAP).map(([a, b]) => [a.toLowerCase(), rgb(b)])); const eyes = new Set();
  const R = base.R.map(c => { const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
    for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const hex = '#' + [p[i], p[i + 1], p[i + 2]].map(v => v.toString(16).padStart(2, '0')).join(''); const m = map[hex]; if (m) { p[i] = m[0]; p[i + 1] = m[1]; p[i + 2] = m[2]; } else if (p[i] > 200 && p[i + 1] < 140 && p[i + 2] < 140) { p[i] = 255; p[i + 1] = 40; p[i + 2] = 40; } }
    g.putImageData(img, 0, 0); return d; });
  return pack(R, base.ax, base.ay, base.w, base.h);
}

/* ---------- THE WORLD ---------- */
const R = Math.round;
const hsh = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
/* a flame `h` px tall, its foot at (x, b): a teardrop, four layers, swaying more toward its tip */
export function flame(g, x, b, h, time, seed, a, w0) {
  const hh = Math.max(3, R(h * (0.78 + 0.28 * (Math.sin(time * 15 + seed * 1.7) * 0.5 + 0.5)))), wide = w0 || (3 + hh * 0.3);
  g.globalAlpha = 0.9 * a;
  for (let r = 0; r < hh; r++) { const t = r / hh, half = Math.max(0.6, wide * Math.pow(1 - t, 0.85)), sh = Math.sin(time * 13 + seed * 2.1 + r * 0.45) * t * 1.7, y = b - r - 1;
    g.fillStyle = '#b8281a'; g.fillRect(R(x - half + sh), y, R(half * 2), 1);
    if (half > 1.4) { g.fillStyle = '#ff7a22'; g.fillRect(R(x - half * 0.74 + sh), y, R(half * 1.48), 1); }
    if (half > 1.6 && t < 0.78) { g.fillStyle = '#ffc24a'; g.fillRect(R(x - half * 0.46 + sh), y, R(half * 0.92), 1); }
    if (half > 1.8 && t < 0.48) { g.fillStyle = '#fff4c8'; g.fillRect(R(x - half * 0.2 + sh), y, Math.max(1, R(half * 0.4)), 1); } }
  g.globalAlpha = 1;
}
/* ONE CELL OF OIL at screen (x, y) = the cell's top-left; st: oil | fire | wet | spent; k: its burn left 0..1; vertical: a wall/pipe streak; deep: a gutter's heavy oil */
/* (claude/underwell2, Daniel 10-06 "oil drawn floating on the wall sides") side: -1 the rock is to the cell's left, 1 to its right - the streak lies FLUSH on that rock
   face (it was drawn down the middle of the air cell, 6 px off the wall); 0 with pipe: an iron STANDPIPE stands in the cell and the oil shows in its sight slots */
export const streakX = side => (side < 0 ? 0 : side > 0 ? 12 : 6);
export function drawCell(g, x, y, st, k, time, vertical, seed, deep, side = 0, pipe = false) {
  if (vertical) { const sx = x + streakX(side);
    if (pipe) { g.fillStyle = '#2a2622'; g.fillRect(x + 4, y, 8, 16); g.fillStyle = '#5a524a'; g.fillRect(x + 4, y, 1, 16); g.fillStyle = '#16120e'; g.fillRect(x + 11, y, 1, 16); g.fillStyle = '#7a6e60'; g.fillRect(x + 4, y + 7, 8, 2); g.fillStyle = '#a89a86'; g.fillRect(x + 5, y + 7, 1, 1); g.fillRect(x + 10, y + 7, 1, 1); }   /* the pipe's iron and a riveted band */
    const col = st === 'wet' ? ['#1c2e40', '#4a78a0'] : st === 'spent' ? ['#12100e', '#2a221c'] : ['#0e0a16', '#3a2c52'];
    if (pipe) { g.fillStyle = col[0]; g.fillRect(x + 6, y + 1, 4, 5); g.fillRect(x + 6, y + 10, 4, 5); g.fillStyle = col[1]; g.fillRect(x + 6, y + 1, 1, 5); g.fillRect(x + 6, y + 10, 1, 5); }   /* the oil in its sight slots */
    else { g.fillStyle = col[0]; g.fillRect(sx, y, 4, 16); g.fillStyle = col[1]; g.fillRect(side > 0 ? sx + 3 : sx, y, 1, 16); }
    const ix = pipe ? x + 7 : side > 0 ? sx + 1 : sx + 1;
    if (st === 'oil') { const t = (time * 7 + seed * 3) % 16; g.fillStyle = '#9a78d8'; g.fillRect(ix, y + (t | 0), 1, 2); g.fillStyle = '#4aa89a'; g.fillRect(ix + 1, y + (((t + 8) % 16) | 0), 1, 1); }
    if (st === 'wet') { g.fillStyle = '#a8d4f0'; g.fillRect(ix, y + (((time * 9 + seed) % 16) | 0), 1, 2); }
    if (st === 'spent') { g.fillStyle = '#4a3a2e'; g.fillRect(ix, y + ((seed * 5) % 12), 1, 2); }
    if (st === 'fire') { const fx = pipe ? x + 8 : sx + 2; flame(g, fx, y + 16, 7 + 6 * k, time, seed, 0.9, 3.4); flame(g, fx, y + 8, 5 + 4 * k, time + 0.3, seed + 3, 0.8, 3); }
    return; }
  const b = y + 16, ht = deep ? 7 : 5;
  if (st === 'oil') {
    g.fillStyle = '#0a0710'; g.fillRect(x, b - ht, 16, ht);                                            /* the black body */
    g.fillStyle = '#4a3a78'; g.fillRect(x, b - ht, 16, 1); g.fillStyle = '#241a38'; g.fillRect(x, b - ht + 1, 16, 1);   /* the meniscus: a glossy lit edge that reads against dark stone */
    g.fillStyle = '#2e2144'; g.fillRect(x + 1 + (seed % 3), b - ht + 1, 6, 1);
    if (deep) { g.fillStyle = '#120c1c'; g.fillRect(x, b - 3, 16, 1); }
    const s1 = (time * 0.9 + seed * 0.37) % 1, s2 = (time * 0.55 + seed * 0.21 + 0.5) % 1;           /* the sheen: a violet and a teal glint sliding across */
    g.fillStyle = '#9a78d8'; g.fillRect(x + 1 + R(s1 * 12), b - ht + 1, 4, 1); g.fillStyle = '#5ab0a0'; g.fillRect(x + 2 + R(s2 * 11), b - ht + 2, 3, 1); g.fillStyle = '#d8985a'; g.fillRect(x + 6 + R(((s1 + 0.4) % 1) * 8), b - ht + 1, 2, 1);
    g.fillStyle = '#e8d8ff'; g.fillRect(x + 2 + R(s1 * 12), b - ht + 1, 1, 1); g.fillStyle = '#1c1428'; g.fillRect(x, b - 1, 16, 1);
    if (((time * 0.6 + seed) % 4) < 0.25) { g.fillStyle = '#4a3a6a'; g.fillRect(x + 4 + (seed % 7), b - ht - 1, 2, 1); }   /* a bubble */
  } else if (st === 'wet') {
    g.fillStyle = '#10161e'; g.fillRect(x, b - 3, 16, 3);                                             /* the oil under it, drowned */
    g.fillStyle = '#26384c'; g.fillRect(x, b - 4, 16, 2); g.fillStyle = '#4a78a0'; g.fillRect(x, b - 4, 16, 1);
    const r = ((time * 1.3 + seed * 0.3) % 1); g.fillStyle = '#a8d4f0'; g.fillRect(x + 3 + (seed % 8), b - 5, 1, 1);                       /* a drip */
    g.globalAlpha = 1 - r; g.fillStyle = '#c8e4f8'; g.fillRect(x + 3 + (seed % 8) - R(r * 3), b - 3, 1 + R(r * 6), 1); g.globalAlpha = 1;    /* its ring */
    g.fillStyle = '#7ab8e8'; g.fillRect(x + 10 + (seed % 3), b - 4, 2, 1);
  } else if (st === 'spent') {
    g.fillStyle = '#2a211a'; g.fillRect(x, b - 4, 16, 4); g.fillStyle = '#5a4a3c'; g.fillRect(x, b - 4, 16, 1); g.fillStyle = '#3a2e24'; g.fillRect(x + 1, b - 5, 5 + (seed % 4), 1);
    g.fillStyle = '#12100e'; for (let i = 0; i < 4; i++) g.fillRect(x + 1 + ((seed * 3 + i * 5) % 14), b - 3, 3, 1); g.fillStyle = '#8a8072'; g.fillRect(x + 2 + (seed % 9), b - 4, 3, 1); g.fillRect(x + 9 + (seed % 4), b - 3, 2, 1);                      /* the crust's cracks */
    
    const e = Math.sin(time * 3 + seed) * 0.5 + 0.5; if (e > 0.55) { g.fillStyle = '#d8501a'; g.fillRect(x + 6 + (seed % 5), b - 3, 1, 1); g.fillRect(x + 12 - (seed % 3), b - 2, 1, 1); }   /* the last ember */
  } else if (st === 'fire') {
    g.fillStyle = '#2a0e08'; g.fillRect(x, b - 3, 16, 3); g.fillStyle = '#ff7a22'; g.fillRect(x, b - 1, 16, 1); g.fillStyle = '#ffc24a'; g.fillRect(x + 2, b - 1, 12, 1);
    flame(g, x + 4, b - 1, 8 + 9 * k, time, seed, 1); flame(g, x + 11, b - 1, 7 + 8 * k, time + 0.37, seed + 5, 1); flame(g, x + 8, b - 1, 11 + 10 * k, time + 0.71, seed + 11, 1, 4.6);
    for (let i = 0; i < 2; i++) { const t = (time * 1.6 + i * 0.5 + seed * 0.13) % 1; g.fillStyle = i ? '#ffd36b' : '#ff8a2a'; g.fillRect(x + 3 + ((seed + i * 7) % 10), b - 10 - R(t * 16 * (0.6 + k)), 1, 1); }   /* sparks */
    if (k > 0.2) { g.globalAlpha = 0.28; g.fillStyle = '#0a0806'; const t = (time * 0.8 + seed * 0.2) % 1; g.fillRect(x + 5 + (seed % 5), b - 20 - R(t * 12 * k) - R(8 + 9 * k), 4, 2); g.globalAlpha = 1; }   /* smoke */
  }
}
/* THE LIGHT POOL a warm source throws on the dark: drawn 'lighter' over the dark pass (cheap: a radial gradient) */
export function lightPool(g, x, y, r, a, time, seed) { const fl = 0.88 + 0.12 * Math.sin(time * 9 + seed * 1.3) * Math.sin(time * 4.1 + seed); const gr = g.createRadialGradient(x, y, 2, x, y, r * fl);
  gr.addColorStop(0, 'rgba(255,170,80,' + (a * fl).toFixed(3) + ')'); gr.addColorStop(0.5, 'rgba(255,120,40,' + (a * 0.4 * fl).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,100,30,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }

/* A BROOD NEST over its cells (screen box l, t, w, h): papery egg-sacs in a mass of silk, ragged at the edges, dark holes with eyes in them; baked once per size, and a charred twin */
const nestMemo = new Map();
function nestSprites(w, h) { const key = w + 'x' + h; if (nestMemo.has(key)) return nestMemo.get(key);
  const P = 8, [c, g] = canvas(w + P * 2, h + P * 2); let s = w * 31 + h * 7;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  const ragged = (y) => { const edge = y < 8 || y > h - 8 ? 3 : 0; return [Math.round(rnd() * 2 + edge), Math.round(rnd() * 2 + edge)]; };
  g.fillStyle = '#3a342a'; for (let y = 0; y < h; y++) { const [a, b] = ragged(y); g.fillRect(P + a, P + y, w - a - b, 1); }
  const sacs = []; for (let i = 0; i < Math.round(w * h / 38); i++) sacs.push([3 + rnd() * (w - 6), 3 + rnd() * (h - 6), 4 + rnd() * 4]); sacs.sort((a, b) => a[1] - b[1]);
  for (const [sx, sy, r] of sacs) { for (let dy = -r; dy <= r; dy++) { const hw = Math.round(r * Math.sqrt(Math.max(0, 1 - (dy * dy) / (r * r)))); const yy = P + R(sy + dy), tone = dy < -r * 0.35 ? '#e4dcc0' : dy < r * 0.3 ? '#bcb498' : '#7a745c'; g.fillStyle = tone; g.fillRect(P + R(sx - hw), yy, hw * 2 + 1, 1); }
    g.fillStyle = '#2a261e'; g.fillRect(P + R(sx - r * 0.6), P + R(sy + r) , R(r * 1.2), 1); g.fillStyle = '#fffae0'; g.fillRect(P + R(sx - r * 0.4), P + R(sy - r * 0.7), 2, 1); }
  /* silk: strands across the mass, and hanging off it */
  g.strokeStyle = 'rgba(240,236,214,0.75)'; g.lineWidth = 1; for (let i = 0; i < 9; i++) { const y0 = P + 3 + rnd() * (h - 6); g.beginPath(); g.moveTo(P - 2, y0); g.quadraticCurveTo(P + w / 2, y0 + (rnd() - 0.5) * 8, P + w + 2, y0 + (rnd() - 0.5) * 6); g.stroke(); }
  g.strokeStyle = 'rgba(240,236,214,0.6)'; for (let i = 0; i < 6; i++) { const x0 = P + 2 + rnd() * (w - 4); g.beginPath(); g.moveTo(x0, P + h - 2); g.lineTo(x0 + (rnd() - 0.5) * 6, P + h + 3 + rnd() * 4); g.stroke(); g.beginPath(); g.moveTo(x0, P + 2); g.lineTo(x0 + (rnd() - 0.5) * 8, P - 3 - rnd() * 4); g.stroke(); }
  /* dark holes, eyes in them; a husk or two stuck in the silk */
  for (let i = 0; i < Math.max(2, Math.round(h / 28)); i++) { const hx = P + 6 + rnd() * (w - 14), hy = P + 10 + rnd() * (h - 20); g.fillStyle = '#0a0806'; g.fillRect(R(hx), R(hy), 6, 4); g.fillStyle = '#8fe04a'; g.fillRect(R(hx) + 1, R(hy) + 1, 1, 1); g.fillRect(R(hx) + 4, R(hy) + 1, 1, 1); }
  g.fillStyle = '#c8bea0'; for (let i = 0; i < 3; i++) { const hx = P + 3 + rnd() * (w - 8), hy = P + 6 + rnd() * (h - 14); g.fillRect(R(hx), R(hy), 4, 1); g.fillRect(R(hx) + 1, R(hy) + 1, 1, 2); }
  outline(c, '#0a0807');
  const [d, dg] = canvas(c.width, c.height); dg.drawImage(c, 0, 0); dg.globalCompositeOperation = 'source-atop'; dg.fillStyle = '#1a0e08'; dg.globalAlpha = 0.82; dg.fillRect(0, 0, d.width, d.height); dg.globalAlpha = 1;
  for (let i = 0; i < w * h / 24; i++) { dg.fillStyle = rnd() < 0.5 ? '#ff7a22' : '#7a2a12'; dg.fillRect(P + R(rnd() * w), P + R(rnd() * h), 1, 1); }
  const out = { c, d, P }; nestMemo.set(key, out); return out; }
export function drawNest(g, l, t, w, h, burnK, time) {
  const n = nestSprites(w, h); g.drawImage(n.c, l - n.P, t - n.P);
  if (burnK > 0) { g.globalAlpha = Math.min(1, burnK * 1.15); g.drawImage(n.d, l - n.P, t - n.P); g.globalAlpha = 1;
    for (let x = l + 4; x < l + w - 2; x += 7) flame(g, x, t + h - 2 - R(((x * 7) % 5)), 12 + 16 * burnK, time, x, 1, 4.4);
    for (let x = l + 2; x < l + w; x += 9) flame(g, x, t + R(h * 0.45), 8 + 8 * burnK, time + 0.2, x + 4, 0.9, 3.4); }
}
/* A HANGING TORCH (a cresset on a chain from the vault): lit, falling (the burning brand drops into the oil: fallDy), or the empty cresset with its ember regrowing (k 0..1); chainTop = the screen y of the vault it hangs from */
export function drawSconce(g, x, y, st, k, time, fallDy, chainTop) {
  const top = chainTop === undefined ? y - 22 : chainTop;
  g.fillStyle = '#3a3a44'; for (let cy = top; cy < y + 4; cy += 3) { g.fillRect(x - 1 + ((cy - top) % 6 === 0 ? 0 : 1), cy, (cy - top) % 6 === 0 ? 3 : 1, 2); }   /* the chain */
  g.fillStyle = '#585866'; g.fillRect(x - 1, top, 3, 1);
  /* the cresset: an iron cup on three legs */
  g.fillStyle = '#1b1b22'; g.fillRect(x - 6, y + 4, 12, 1); g.fillStyle = '#2c2c36'; g.fillRect(x - 5, y + 5, 10, 3); g.fillStyle = '#5a5a68'; g.fillRect(x - 5, y + 5, 10, 1); g.fillStyle = '#1b1b22'; g.fillRect(x - 4, y + 8, 8, 1); g.fillRect(x - 1, y + 9, 2, 2);
  g.fillStyle = '#a4742a'; g.fillRect(x - 5, y + 6, 1, 1); g.fillRect(x + 4, y + 6, 1, 1);
  if (st === 'down') { g.fillStyle = '#4a1a08'; g.fillRect(x - 3, y + 3, 6, 2); const e = Math.max(0, k); g.globalAlpha = 0.3 + 0.6 * e; g.fillStyle = '#ff7a22'; g.fillRect(x - 2, y + 3, 4, 1); g.fillStyle = '#ffd36b'; g.fillRect(x - 1, y + 3, 2, 1); g.globalAlpha = 1; if (k > 0.6) flame(g, x, y + 3, 2 + 7 * (k - 0.6) / 0.4, time, x, 0.9, 2); return; }
  const dy = fallDy || 0;
  g.fillStyle = '#4a2e14'; g.fillRect(x - 1, y - 4 + dy, 3, 9); g.fillStyle = '#6a4a22'; g.fillRect(x - 1, y - 4 + dy, 1, 9); g.fillStyle = '#1a1006'; g.fillRect(x - 2, y - 6 + dy, 5, 3);   /* the brand and its pitch-soaked rag head */
  flame(g, x + 1, y - 5 + dy, 11, time, x, 1, 4);
}
/* THE GREAT LAMP: a brazier lamp the width of a cart wheel, hung by a heavy chain from a ring in the vault; three spouts burning; fallen, the wreck of it in the fire */
export function drawLamp(g, x, top, y, st, time, swing) {
  const sx = R(x + (swing || 0));
  if (st !== 'down') { for (let cy = top, i = 0; cy < y - 8; cy += 4, i++) { const lx = R(x + (swing || 0) * (cy - top) / Math.max(1, y - top)); g.fillStyle = '#1b1b22'; g.fillRect(lx - 2, cy, 5, 3); g.fillStyle = i & 1 ? '#7a7a88' : '#4a4a56'; g.fillRect(lx - 1, cy, 3, 3); g.fillStyle = '#b4b4c0'; g.fillRect(lx - 1, cy, 1, 1); }
    g.fillStyle = '#2c2c36'; g.fillRect(R(x) - 5, top - 2, 11, 4); g.fillStyle = '#82829a'; g.fillRect(R(x) - 5, top - 2, 11, 1); }
  const ly = y;
  /* the bowl: brass-bronze, riveted, deep; handles; a pedestal foot */
  g.fillStyle = '#1b1006'; g.fillRect(sx - 20, ly - 10, 40, 1);
  for (let r = 0; r < 9; r++) { const half = 19 - Math.round(r * 0.9), yy = ly - 9 + r; g.fillStyle = r < 2 ? '#d8a444' : r < 5 ? '#a4742a' : '#6c4a10'; g.fillRect(sx - half, yy, half * 2 + 1, 1); }
  g.fillStyle = '#fcdc84'; g.fillRect(sx - 18, ly - 9, 36, 1); g.fillStyle = '#3c2a08'; g.fillRect(sx - 12, ly + 0, 25, 2); g.fillStyle = '#6c4a10'; g.fillRect(sx - 8, ly + 2, 17, 3); g.fillStyle = '#a4742a'; g.fillRect(sx - 8, ly + 2, 17, 1);
  g.fillStyle = '#d8a444'; for (const rx of [-14, -7, 0, 7, 14]) { g.fillRect(sx + rx, ly - 5, 1, 1); } g.fillStyle = '#3c2a08'; g.fillRect(sx - 20, ly - 8, 3, 2); g.fillRect(sx + 18, ly - 8, 3, 2);
  g.fillStyle = '#d8a444'; g.fillRect(sx - 6, ly - 12, 2, 3); g.fillRect(sx + 4, ly - 12, 2, 3); g.fillRect(sx - 1, ly - 12, 2, 3); g.fillRect(sx - 14, ly - 11, 2, 2); g.fillRect(sx + 12, ly - 11, 2, 2);   /* the spouts */
  if (st !== 'down') for (const fx of [-13, -5, 0, 5, 13]) flame(g, sx + fx, ly - 11, 11 + (fx === 0 ? 5 : 0), time, fx + 3, 1, fx === 0 ? 5 : 4);
  else { g.fillStyle = '#000'; g.globalAlpha = 0.5; g.fillRect(sx - 18, ly - 10, 36, 2); g.globalAlpha = 1; }
}
/* THE DRY FOUNTAIN: a round cut-stone basin, a column in it with three lion-head sockets (brass taps when fitted); full: three arcs of water into a bright basin */
export function drawFountain(g, x, b, full, have, time) {
  g.fillStyle = '#1b1816'; g.fillRect(x - 24, b - 2, 48, 2);
  g.fillStyle = '#4f463d'; g.fillRect(x - 22, b - 14, 44, 12); g.fillStyle = '#8a7c68'; g.fillRect(x - 24, b - 16, 48, 3); g.fillStyle = '#a89a82'; g.fillRect(x - 24, b - 16, 48, 1);
  g.fillStyle = '#2a2522'; for (let i = 0; i < 6; i++) g.fillRect(x - 20 + i * 8, b - 12, 1, 8); g.fillStyle = '#3b342e'; g.fillRect(x - 22, b - 5, 44, 1);
  if (!full) { g.fillStyle = '#5a4630'; g.fillRect(x - 21, b - 14, 42, 2); g.fillStyle = '#b4966a'; g.fillRect(x - 18, b - 14, 12, 1); g.fillRect(x + 4, b - 14, 10, 1); g.fillStyle = '#6a5e50'; g.fillRect(x - 8, b - 15, 3, 1); }
  g.fillStyle = '#4f463d'; g.fillRect(x - 4, b - 38, 8, 24); g.fillStyle = '#8a7c68'; g.fillRect(x - 4, b - 38, 2, 24); g.fillStyle = '#2a2522'; g.fillRect(x + 2, b - 38, 2, 24); g.fillStyle = '#a89a82'; g.fillRect(x - 6, b - 40, 12, 3); g.fillRect(x - 6, b - 40, 12, 1);
  for (let i = 0; i < 3; i++) { const tx = x - 11 + i * 11, ty = b - 30 + (i === 1 ? -4 : 0), on = i < have || full;
    g.fillStyle = '#1b1816'; g.fillRect(tx - 3, ty - 3, 7, 6); g.fillStyle = '#4f463d'; g.fillRect(tx - 2, ty - 2, 5, 4);
    if (on) { g.fillStyle = '#a4742a'; g.fillRect(tx - 2, ty - 1, 5, 2); g.fillStyle = '#fcdc84'; g.fillRect(tx - 2, ty - 1, 5, 1); g.fillStyle = '#6c4a10'; g.fillRect(tx + 1, ty + 1, 3, 2); } else { g.fillStyle = '#0a0806'; g.fillRect(tx - 1, ty - 1, 3, 2); }
    if (full) { g.fillStyle = '#7ab8e8'; for (let k = 0; k < 6; k++) { const t = (time * 2.2 + i * 0.3 + k * 0.1) % 1; g.fillRect(tx + 2 + R(t * 6) * (i === 0 ? -1 : i === 2 ? 1 : 0.3), ty + 2 + R(t * t * 10), 1, 1); } g.fillStyle = '#d0ecff'; g.fillRect(tx + 1, ty + 2, 1, b - ty - 18); } }
  if (full) { g.fillStyle = '#2a6ab0'; g.fillRect(x - 21, b - 14, 42, 4); g.fillStyle = '#5aa8e0'; g.fillRect(x - 21, b - 14, 42, 1); g.fillStyle = '#e8f6ff'; for (let k = 0; k < 4; k++) g.fillRect(x - 18 + R(((time * 12 + k * 11) % 36)), b - 13, 2, 1); }
}
/* A BRASS TAP (the themed key), lying where it fell: a glint that comes and goes */
export function drawTap(g, x, b, time) { const k = 0.5 + 0.5 * Math.sin(time * 4); g.fillStyle = '#3c2a08'; g.fillRect(x - 5, b - 6, 10, 4); g.fillStyle = '#a4742a'; g.fillRect(x - 4, b - 7, 8, 3); g.fillRect(x + 2, b - 11, 3, 5); g.fillRect(x - 1, b - 12, 7, 2);
  g.fillStyle = '#fcdc84'; g.fillRect(x - 4, b - 7, 8, 1); g.fillRect(x - 1, b - 12, 7, 1); g.globalAlpha = 0.4 + 0.5 * k; g.fillStyle = '#fffbe0'; g.fillRect(x - 3, b - 6, 2, 1); g.fillRect(x + 4, b - 12, 1, 1); g.globalAlpha = 1; }
/* the silted floor: a few grains riding the wind above the crest (the crest itself is the tile kit's) */
export function drawSand(g, x, y, w, time) { g.fillStyle = '#e8d4a4'; for (let i = 0; i < w; i += 23) { const t = (time * 6 + i * 0.7) % 23; g.globalAlpha = 0.5; g.fillRect(x + ((i + R(t * 2)) % w), y - 1 - ((i >> 2) % 3), 1, 1); } g.globalAlpha = 1; }
/* the old gutter's grate: a slot in the wall over the whole sump, an iron frame, bars with lit tops, rust drips under it */
export function drawGutter(g, x, y, w) {
  g.fillStyle = '#0a0806'; g.fillRect(x, y, w, 16);
  g.fillStyle = '#2c2c36'; g.fillRect(x, y, w, 2); g.fillStyle = '#82829a'; g.fillRect(x, y, w, 1); g.fillStyle = '#2c2c36'; g.fillRect(x, y + 14, w, 2); g.fillStyle = '#585866'; g.fillRect(x, y + 14, w, 1); g.fillStyle = '#0c0c10'; g.fillRect(x, y + 15, w, 1);
  for (let i = 0; i < w; i += 10) { g.fillStyle = '#34343e'; g.fillRect(x + i, y + 2, 2, 12); g.fillStyle = '#9a9ab0'; g.fillRect(x + i, y + 2, 1, 12); if (i % 40 === 0) { g.fillStyle = '#d4d4e0'; g.fillRect(x + i, y + 1, 1, 1); } }
  g.fillStyle = '#3a1c0c'; for (let i = 6; i < w; i += 30) g.fillRect(x + i, y + 16, 1, 4 + (i % 5));
}
/* BLINDED: the dust scorpion's grit - the screen goes dark but for a ring round the hero (k 0..1 = how much is left) */
export function drawBlind(g, hx, hy, VW, VH, k) {
  const r = R(54 + (1 - k) * 160); g.save(); g.globalAlpha = Math.min(0.92, 0.95 * k + 0.1); g.fillStyle = '#1a1408'; g.beginPath(); g.rect(0, 0, VW, VH); g.arc(R(hx), R(hy), r, 0, Math.PI * 2, true); g.fill('evenodd'); g.restore();
  g.fillStyle = '#c8b48a'; g.globalAlpha = 0.5 * k; for (let i = 0; i < 16; i++) g.fillRect(R(hx + Math.cos(i * 2.4) * (r + 4 + (i * 7) % 20)), R(hy + Math.sin(i * 2.4) * (r + 4 + (i * 5) % 20)), 2, 2); g.globalAlpha = 1;
}
/* THE BRASS TAP's pickup icon (the stray props draw it, doubled) */
export function bakeTapIcon() { const [c, g] = canvas(12, 11); g.fillStyle = '#6c4a10'; g.fillRect(1, 6, 8, 3); g.fillStyle = '#c8a040'; g.fillRect(1, 5, 8, 3); g.fillRect(7, 2, 3, 5); g.fillRect(4, 1, 7, 2); g.fillStyle = '#f0d070'; g.fillRect(2, 5, 4, 1); g.fillRect(4, 1, 7, 1); g.fillStyle = '#fffbe0'; g.fillRect(3, 5, 1, 1); g.fillRect(9, 1, 1, 1); outline(c, OUT); return c; }
/* HER CAST SHELL (the approach sets her up): a husk the length of a cart, split down the back, hollow, its tail curled over, a claw flung out - pale chitin that reads in the dark */
export function drawHusk(g, x, b) {
  const SH = ['#e0d6b6', '#c8bea0', '#9a9078', '#6a624e'];
  for (let i = 0; i < 6; i++) { const sx = x - 32 + i * 10, hh = 15 - (i === 0 || i === 5 ? 3 : 0); g.fillStyle = SH[3]; g.fillRect(sx, b - hh - 1, 10, hh + 1); g.fillStyle = SH[1]; g.fillRect(sx + 1, b - hh, 8, hh - 2); g.fillStyle = SH[0]; g.fillRect(sx + 1, b - hh, 8, 2); g.fillStyle = SH[2]; g.fillRect(sx + 8, b - hh + 2, 1, hh - 4); }
  g.fillStyle = '#1a1410'; g.fillRect(x - 24, b - 16, 44, 3); g.fillStyle = '#0a0806'; g.fillRect(x - 20, b - 13, 36, 2);   /* the split down the back, and the dark inside */
  g.fillStyle = SH[0]; for (let i = 0; i < 5; i++) g.fillRect(x - 20 + i * 8, b - 16, 2, 2);
  g.fillStyle = SH[1]; for (let i = 0; i < 6; i++) { g.fillRect(x - 30 + i * 11, b - 2, 2, 3); }   /* legs */
  for (let i = 0; i < 6; i++) { const tx = x + 30 + i * 3 - (i > 3 ? 1 : 0), ty = b - 14 - i * 6 + (i > 4 ? 3 : 0); g.fillStyle = SH[3]; g.fillRect(tx - 1, ty - 1, 8, 8); g.fillStyle = SH[1]; g.fillRect(tx, ty, 6, 6); g.fillStyle = SH[0]; g.fillRect(tx, ty, 6, 1); }   /* the tail curling up */
  g.fillStyle = '#fffae0'; g.fillRect(x + 46, b - 52, 3, 9); g.fillStyle = '#d8c8a0'; g.fillRect(x + 44, b - 46, 3, 5);   /* the barb */
  g.fillStyle = SH[1]; g.fillRect(x - 48, b - 9, 14, 7); g.fillStyle = SH[0]; g.fillRect(x - 48, b - 9, 14, 1); g.fillStyle = SH[3]; g.fillRect(x - 56, b - 14, 10, 6); g.fillStyle = SH[1]; g.fillRect(x - 55, b - 13, 8, 4); g.fillStyle = SH[0]; g.fillRect(x - 55, b - 13, 8, 1); g.fillStyle = '#0a0806'; g.fillRect(x - 58, b - 12, 4, 2);   /* a claw */
}
/* THE TORCH IN YOUR HAND (claude/underwell2): the cresset's brand lifted out - a pitch-black rag head on an ash haft, burning. (x, y) is the head; held: raised beside you,
   leaning the way you face; fly: turning over in the air; lie: on the floor, the flame lower as it burns down (k 1..0) */
export function drawHandTorch(g, x, y, st, face, time, k) {
  const f = face < 0 ? -1 : 1;
  if (st === 'lie') { g.fillStyle = '#4a2e14'; g.fillRect(x - 6, y - 2, 11, 2); g.fillStyle = '#6a4a22'; g.fillRect(x - 6, y - 2, 11, 1); g.fillStyle = '#1a1006'; g.fillRect(x + (f > 0 ? 4 : -8), y - 3, 4, 3);
    flame(g, x + (f > 0 ? 6 : -6), y - 2, 3 + 6 * Math.max(0, k), time, x, 0.95, 2.6); return; }
  if (st === 'fly') { const a = time * 14, dx = R(Math.cos(a) * 4), dy = R(Math.sin(a) * 4); g.fillStyle = '#4a2e14'; for (let i = -3; i <= 3; i++) g.fillRect(x + R(dx * i / 3), y + R(dy * i / 3), 2, 2);
    g.fillStyle = '#1a1006'; g.fillRect(x + dx - 1, y + dy - 1, 3, 3); flame(g, x + dx + 1, y + dy, 7, time, x, 1, 3); return; }
  g.fillStyle = '#4a2e14'; for (let i = 0; i < 9; i++) g.fillRect(x - f * R(i * 0.35), y + i, 2, 1); g.fillStyle = '#6a4a22'; for (let i = 0; i < 9; i += 2) g.fillRect(x - f * R(i * 0.35), y + i, 1, 1);   /* the haft */
  g.fillStyle = '#1a1006'; g.fillRect(x - 1, y - 2, 4, 3); g.fillStyle = '#3a2412'; g.fillRect(x - 1, y - 2, 4, 1);   /* the pitch-soaked rag */
  flame(g, x + 1, y - 2, 10, time, x, 1, 3.6);
}
/* ---------- THE THREE NEW RESKINS (claude/underwell2; Daniel 10-06 picked all three) - recoloured off proven machines' sheets, each with its own read ----------
   OIL THIEF      the dynamite bandit's frames (the sapper's machine): an oil-black leather coat and a grey hood, a FLASK of lamp oil where the stick was (dark glass, a
                  rag wick), and a LANTERN at his back hand (brass, lit) - the light the cistern bats scatter from, and what lights his own spilled oil when he falls
   CISTERN BAT    the bat's frames: bleached cave-grey with pale ears and the red eyes kept - a pale thing that shows in the dark it lives in
   DROWNED DEAD   the zombie's frames: waterlogged blue-green, weed in the hair and water running off him */
export const THIEF_PICK = (r, g, b, l) => (r > 140 && g < 100 && b < 100) ? ['#140c08', '#3a2416', '#7a5634'] : (r > b + 30 && g > b + 10 && l > 0.3) ? ['#2a2830', '#6a6674', '#b4b0bc'] : (r > g + 20 && r > b + 20 && l < 0.6) ? ['#120c08', '#3a2416', '#6a4a2c'] : (l > 0.55 ? null : ['#16141a', '#3e3a44', '#7a7684']);   /* the vest: oil-black leather; the hat: a grey hood; the rest dusk grey */
export const BAT_PICK = (r, g, b, l) => (r > 200 && g < 110) ? null : ['#5a6470', '#a8b4c2', '#f0f4f8'];   /* pale: it shows in the dark it lives in */
export const DROWNED_PICK = (r, g, b, l) => (r > 200 && g > 160 && b < 140) ? ['#4a8a7a', '#9ae0c8', '#e0fff4'] : ['#081416', '#2e5a58', '#8ac0b4'];
const thiefExtra = { pad: 2, draw(g, p, f, k) { const cx = 13, by = 20;
  /* the lantern at his back hand (not while he runs off) */
  if (k !== 4 && k !== 5) { const lx = cx - 4, ly = by + 6; g.fillStyle = '#5a4012'; g.fillRect(lx - 1, ly - 1, 4, 5); g.fillStyle = '#ffd36b'; g.fillRect(lx, ly, 2, 3); g.fillStyle = '#fff4c8'; g.fillRect(lx, ly + 1, 1, 1); g.fillStyle = '#a4742a'; g.fillRect(lx - 1, ly - 2, 4, 1); dot(g, lx + 1, ly - 3, '#a4742a'); }
  /* the flask in his throwing hand (dark glass, a rag wick; held high on the tell) and a scarf across his face */
  { const hx = k === 6 ? cx + 2 : cx + 5, hy = k === 6 ? by - 13 : by + 6; if (k !== 4 && k !== 5) { g.fillStyle = '#1a2a18'; g.fillRect(hx, hy - 1, 3, 4); g.fillStyle = '#4a7a40'; g.fillRect(hx, hy - 1, 1, 4); g.fillStyle = '#4a3a78'; g.fillRect(hx + 1, hy + 1, 1, 1); g.fillStyle = '#c8b48a'; g.fillRect(hx + 1, hy - 3, 1, 2); } }
  g.fillStyle = '#8a8478'; g.fillRect(cx - 1 + (k === 4 || k === 5 ? -2 : 1), by - 3, 4, 1);
  /* oil down his coat */
  for (const [dx, dy] of [[-2, 6], [1, 8], [3, 5]]) { dot(g, cx + dx, by + dy, '#0a0710'); dot(g, cx + dx, by + dy + 1, '#4a3a78'); } } };
const batExtra = { pad: 1, draw(g, p, f, k) { /* the pale ear tips */ const bb = bbox(f); dot(g, bb[0] + 4, bb[1], '#ffffff'); dot(g, bb[2] - 4, bb[1], '#ffffff'); } };
const drownedExtra = { pad: 3, draw(g, p, f, k) { const bb = bbox(f); if (bb[2] < 0) return;
  for (let i = 0; i < 4; i++) { const x = bb[0] + 2 + ((i * 5 + k * 3) % Math.max(1, bb[2] - bb[0] - 3)); dot(g, x, bb[3] - 1 - (i % 2), '#9ae0ff'); dot(g, x, bb[3] - (i % 2), '#3a7ab8'); }   /* water running off him */
  g.fillStyle = '#2a5a2a'; g.fillRect(bb[0] + 3, bb[1] + 1, 2, 3); g.fillRect(bb[2] - 6, bb[1] + 2, 1, 4); dot(g, bb[0] + 4, bb[1] + 4, '#4a8a3a'); } };   /* weed in his hair */
export const bakeOilThief = base => reskin(base, THIEF_PICK, null, thiefExtra);
export const bakeCisternBat = base => reskin(base, BAT_PICK, null, batExtra);
export const bakeDrownedDead = base => reskin(base, DROWNED_PICK, null, drownedExtra);
/* the oil thief's FLASK in flight (the bomb list draws it): dark glass, a pale meniscus, the rag wick */
export function bakeFlask() { const [c, g] = canvas(7, 9); g.fillStyle = '#1a2a18'; g.fillRect(1, 3, 5, 6); g.fillStyle = '#3a5a30'; g.fillRect(1, 3, 1, 6); g.fillStyle = '#4a3a78'; g.fillRect(2, 5, 3, 1);
  g.fillStyle = '#2a2a2a'; g.fillRect(2, 1, 3, 2); g.fillStyle = '#c8b48a'; g.fillRect(3, 0, 1, 1); outline(c, OUT); return c; }
