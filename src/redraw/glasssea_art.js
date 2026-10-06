// src/redraw/glasssea_art.js - THE GLASS SEA's ART (claude/glasssea art pass, after the greybox). Pure drawing; no geometry, rule or number moves.
//   THE CAST          the skins (src/redraw/glasssea_foes.js): GLASS SCORPION, SHARD THROWER, NIGHT HUNTER, GLASS SENTINEL, and THE SKITTER (re-exported here for main.js)
//   THE SKY           the hour: a bleached blue day with a high white sun -> a violet dusk with the sun on the glass horizon -> night with stars, a cold moon and an aurora over the sea;
//                     the arena's three phases (dusk, night, dawn) use their own
//   THE HORIZON       the far glass dunes in two layers and the mirage, and THE GLASS COLOSSUS's silhouette growing as you go (src/redraw/glass_colossus_art.js bakes it)
//   THE RULE          the mirrors (a bronze hood on a post, a polished disc by its notch, a brass dial of three studs), the beams (a white-hot core in a soft glow, motes running
//                     along it), the TARGET RINGS (crisp pixel rings; locked on = a bloom), the sand heaps (a pile of pale sand; white-hot when a beam is on it), the fused glass
//                     (a polished slab, scorched at the leading edge), the cracks (a dark fissure; HELD = a warm calm glow and a sleeping swarm; BOILING = violet, roiling, red eyes)
//   LIGHT             campfires (a bone-and-ember pit, flames, a pool of warm light on the glass), the night's dark with a pool for every fire and every fire beam, a dusk grade
//   THE METER         the frost meter, the sun meter's night twin
import { canvas, px, rect, rgb } from '../px.js';
import { GL, hash } from './glasssea_tiles.js';
import * as FARART from './glass_colossus_art.js';
export { bakeGlassScorpion, bakeShardThrower, bakeNightHunter, bakeGlassSentinel, bakeSkitter } from './glasssea_foes.js';

const R = Math.round;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const c255 = v => Math.max(0, Math.min(255, R(v)));
const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return 'rgb(' + c255(A[0] + (B[0] - A[0]) * t) + ',' + c255(A[1] + (B[1] - A[1]) * t) + ',' + c255(A[2] + (B[2] - A[2]) * t) + ')'; };
const mixc = (rgbStr, hexc, t) => { const m = /(\d+),\s*(\d+),\s*(\d+)/.exec(rgbStr), B = rgb(hexc); return 'rgb(' + c255(+m[1] + (B[0] - m[1]) * t) + ',' + c255(+m[2] + (B[1] - m[2]) * t) + ',' + c255(+m[3] + (B[2] - m[3]) * t) + ')'; };
const mix3 = (s, k) => (k < 0.5 ? mix(s[0], s[1], k * 2) : mix(s[1], s[2], (k - 0.5) * 2));

/* ---------- THE SKY: k 0 = day, 0.5 = dusk, 1 = night; the arena's phases override (ph 3 = dawn) ---------- */
const SKY = { top: ['#5aa6dc', '#4a3a8c', '#050a20'], mid: ['#a8dcea', '#b0609c', '#0c1c46'], bot: ['#fbf0cc', '#ffb070', '#1c3866'] };
export function drawSky(g, vw, vh, k, time, ph) {
  k = Number.isFinite(k) ? Math.max(0, Math.min(1, k)) : 0;
  const dawn = ph === 3, base = R(vh * 0.62);
  const dw = dawn ? Math.max(0, Math.min(1, 1 - (k - 0.15) / 0.5)) : 0;   /* the dawn's colours come in as the hour eases down to 0.15 */
  const top = dw ? mixc(mix3(SKY.top, k), '#7aa0d8', dw) : mix3(SKY.top, k), mid = dw ? mixc(mix3(SKY.mid, k), '#e8b8c0', dw) : mix3(SKY.mid, k), bot = dw ? mixc(mix3(SKY.bot, k), '#fbd8a0', dw) : mix3(SKY.bot, k);
  const gr = g.createLinearGradient(0, 0, 0, base + 10); gr.addColorStop(0, top); gr.addColorStop(0.55, mid); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, vw, vh);
  /* the sun: high and white by day, slides down the west to the glass horizon by dusk, goes under; at dawn it comes up in the east */
  const s = Math.min(1, k / 0.62);
  if (dawn || s < 1) { const sx = dawn ? vw * 0.84 : vw * (0.52 - 0.44 * s), sy = dawn ? base - 6 : vh * 0.16 + (base - vh * 0.16 + 4) * s * s, r = dawn ? 11 : 9 + 4 * s;
    const gl = g.createRadialGradient(sx, sy, 2, sx, sy, r * 5); const a = dawn ? 0.5 : 0.42 - 0.12 * s; gl.addColorStop(0, 'rgba(255,226,140,' + a + ')'); gl.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = gl; g.fillRect(sx - r * 5, sy - r * 5, r * 10, r * 10);
    g.fillStyle = dawn ? '#fff4d0' : mix('#fffbd8', '#ff9a40', s); g.beginPath(); g.arc(sx, sy, r, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(sx - r * 0.3, sy - r * 0.3, r * 0.5, 0, Math.PI * 2); g.fill(); }
  /* high wisps by day and dusk (they go gold, then pink) */
  if (k < 0.8 && !(ph === 2)) { g.globalAlpha = (1 - k) * 0.55; g.fillStyle = k < 0.35 ? '#ffffff' : '#ffc8b0'; for (let i = 0; i < 6; i++) { const x = ((i * 83 + time * (3 + i)) % (vw + 120)) - 60, y = 14 + (i * 19) % 60; g.fillRect(R(x), y, 40 + (i * 13) % 50, 1); g.fillRect(R(x + 8), y + 1, 26 + (i * 7) % 30, 1); } g.globalAlpha = 1; }
  /* night: stars, a cold moon, an aurora ribbon over the sea */
  if (k > 0.55 && !dawn) { const n = Math.min(1, (k - 0.55) * 2.4);
    g.fillStyle = '#e8f4ff'; for (let i = 0; i < 70; i++) { const x = (i * 97) % vw, y = (i * 53) % R(vh * 0.58); g.globalAlpha = n * (0.35 + 0.65 * ((i * 7 + R(time * (1 + (i % 3)) * 1.5)) % 5) / 5); g.fillRect(x, y, 1, i % 11 === 0 ? 2 : 1); }
    g.globalAlpha = n; const mx = vw * 0.8, my = vh * 0.2; const mg = g.createRadialGradient(mx, my, 3, mx, my, 30); mg.addColorStop(0, 'rgba(200,225,255,0.55)'); mg.addColorStop(1, 'rgba(160,200,255,0)'); g.fillStyle = mg; g.fillRect(mx - 30, my - 30, 60, 60);
    g.fillStyle = '#e8f2ff'; g.beginPath(); g.arc(mx, my, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = '#c0d4ec'; g.fillRect(mx - 3, my - 2, 2, 2); g.fillRect(mx + 1, my + 1, 3, 2);
    g.globalAlpha = 1; for (let b = 0; b < 3; b++) { const col = b === 1 ? '110,90,220' : '60,230,190'; for (let x = 0; x < vw; x += 4) { const y = vh * (0.14 + b * 0.07) + Math.sin(x / 38 + time * 0.25 + b * 1.7) * 9 + Math.sin(x / 15 + time * 0.5 + b) * 3, h = 16 + 8 * Math.sin(x / 21 + b * 2 + time * 0.3);
        const a = 0.2 * n; g.fillStyle = 'rgba(' + col + ',' + (a * 0.4).toFixed(3) + ')'; g.fillRect(x, R(y), 4, R(h)); g.fillStyle = 'rgba(' + col + ',' + (a * 0.9).toFixed(3) + ')'; g.fillRect(x, R(y + h * 0.25), 4, R(h * 0.4)); } }   /* (a soft ribbon: two stacked bands, no gradient per column) */
    g.globalAlpha = 1; }
}
/* ---------- THE HORIZON: far glass dunes (two layers, glints) and the Colossus's silhouette, growing as the road goes ---------- */
export function drawHorizon(g, vw, vh, cx, prog, k, time, inArena) {
  k = Number.isFinite(k) ? Math.max(0, Math.min(1, k)) : 0;
  const base = R(vh * 0.62), far = mix3(['#a4d4cc', '#7a5a9a', '#14264e'], k), near = mix3(['#7cc0b4', '#5a4686', '#0e1c40'], k), lit = mix3(['#e8fff6', '#ffc890', '#4a7ab0'], k);
  const dune = (col, par, amp, y0, f1, f2) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, vh); for (let x = 0; x <= vw; x += 4) g.lineTo(x, y0 + R(Math.sin((x + cx * par) * f1) * amp + Math.sin((x + cx * par) * f2) * amp * 0.45)); g.lineTo(vw, vh); g.fill(); };
  dune(far, 0.08, 6, base - 6, 0.014, 0.041);
  /* the Colossus (the landmark: a silhouette at the edge of the sea, bigger every section) */
  if (!inArena) { const s = 0.4 + 0.8 * prog, sp = FARART.farSprite(k), hx = R(vw * 0.8 - prog * vw * 0.2), w = R(sp.width * s), h = R(sp.height * s), hy = base + 3;
    g.drawImage(sp, hx - R(w / 2), hy - h, w, h);
    const eyeA = k > 0.35 ? 0.5 + 0.5 * Math.sin(time * 1.3) : 0.2; g.globalCompositeOperation = 'lighter'; g.fillStyle = k > 0.5 ? 'rgba(138,244,255,' + eyeA + ')' : 'rgba(255,240,180,' + eyeA * 0.7 + ')';
    const ey = hy - R(h * 0.9); g.fillRect(hx - R(4 * s), ey, Math.max(1, R(3 * s)), 1); g.fillRect(hx + R(2 * s), ey, Math.max(1, R(3 * s)), 1); g.globalCompositeOperation = 'source-over'; }
  dune(near, 0.18, 7, base + 4, 0.019, 0.053);
  g.fillStyle = lit; g.globalAlpha = 0.5; for (let x = 0; x < vw; x += 4) { const y = base + 4 + R(Math.sin((x + cx * 0.18) * 0.019) * 7 + Math.sin((x + cx * 0.18) * 0.053) * 3.15); g.fillRect(x, y, 4, 1); } g.globalAlpha = 1;   /* the lit ridge line of the near dunes */
  if (k < 0.6) { g.globalAlpha = 0.14 * (1 - k); for (let i = 0; i < 4; i++) { g.fillStyle = '#ffffff'; g.fillRect(0, base + 8 + i * 5 + R(Math.sin(time * 1.4 + i) * 1.5), vw, 1); } g.globalAlpha = 1; }   /* the mirage shimmer on the glass horizon */
  const hz = g.createLinearGradient(0, base - 18, 0, base + 18); hz.addColorStop(0, 'rgba(255,240,200,0)'); hz.addColorStop(0.5, k < 0.6 ? 'rgba(255,236,190,0.22)' : 'rgba(120,150,230,0.18)'); hz.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = hz; g.fillRect(0, base - 18, vw, 36);
}

/* ---------- A CRACK: a dark fissure; held = warm and calm, a sleeping swarm; boiling = violet, roiling, red eyes; dark = a night crack far from the hero ---------- */
/* THE SHADE a skiff, a spire, the obelisk casts: the sun meter's boxes (world px) painted as a cool soft shadow (light at the top, dark at the ground, soft sides); by day only */
export function drawShade(g, x0, x1, y0, y1, a) {
  const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(40,28,96,' + (0.05 * a).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(34,24,88,' + (0.36 * a).toFixed(3) + ')'); g.fillStyle = gr;
  g.fillRect(x0 + 6, y0, x1 - x0 - 12, y1 - y0); g.globalAlpha = 0.7; g.fillRect(x0 + 3, y0, 3, y1 - y0); g.fillRect(x1 - 6, y0, 3, y1 - y0); g.globalAlpha = 0.35; g.fillRect(x0, y0, 3, y1 - y0); g.fillRect(x1 - 3, y0, 3, y1 - y0); g.globalAlpha = 1;
}
export function drawCrack(g, x, y, w, st, time, boilH, hpx) {
  const H = hpx || 160;
  const gr = g.createLinearGradient(0, y, 0, y + H + 40); gr.addColorStop(0, '#0c2832'); gr.addColorStop(0.25, '#071a24'); gr.addColorStop(1, '#010409'); g.fillStyle = gr; g.fillRect(x, y, w, H + 40);
  /* broken glass teeth on both walls */
  for (let side = 0; side < 2; side++) for (let i = 0; i < 7; i++) { const ty = y + 10 + ((i * 37 + (side ? 11 : 0)) % Math.max(20, H - 20)), len = 2 + (i + side) % 3, tx = side ? x + w - len : x; g.fillStyle = GL.c5; g.fillRect(tx, ty, len, 2); g.fillStyle = GL.c3; g.fillRect(tx, ty, len, 1); }
  const glow = st === 'held' ? '255,176,80' : st === 'boil' ? '154,122,216' : '58,160,150';
  const ga = st === 'boil' ? 0.5 + 0.2 * Math.sin(time * 9) : st === 'held' ? 0.62 + 0.08 * Math.sin(time * 2) : 0.16;
  const bg = g.createLinearGradient(0, y + (st === 'held' ? 0 : H - 70), 0, y + H + 10); bg.addColorStop(0, 'rgba(' + glow + ',0)'); bg.addColorStop(1, 'rgba(' + glow + ',' + ga.toFixed(3) + ')'); g.fillStyle = bg; g.fillRect(x, y + (st === 'held' ? 0 : H - 70), w, st === 'held' ? H + 10 : 80);   /* the glow at the bottom of the fissure (a held crack glows the whole way: the fire's warmth reaches down it) */
  /* the lip: a row of bright teeth, with a coloured edge by state */
  g.fillStyle = st === 'held' ? '#ffd8a0' : st === 'boil' ? '#c8a8ff' : GL.c2; g.fillRect(x, y, w, 1);
  for (let i = 0; i < w; i += 6) { const h = 1 + hash(i, R(w)) % 3; g.fillStyle = GL.c1; g.fillRect(x + i, y - h + 1, 2, h); }
  if (st === 'held') { g.globalAlpha = 0.28 + 0.06 * Math.sin(time * 2.5); g.fillStyle = '#ffb050'; g.fillRect(x, y - 7, w, 7); g.globalAlpha = 1;   /* the fire's warmth on the lip, and the swarm curled asleep far down */
    for (let i = 0; i < Math.max(2, w >> 4); i++) { const sx = x + 6 + i * 16 + (i % 2) * 5, sy = y + H - 8 - (i % 3) * 5; g.fillStyle = '#2a2040'; g.fillRect(sx, sy, 6, 3); g.fillStyle = '#5a46a0'; g.fillRect(sx + 1, sy, 4, 1); g.fillStyle = '#6a3030'; g.fillRect(sx + 5, sy + 1, 1, 1); } }
  if (st === 'boil') {
    for (let i = 0; i < 22; i++) { const sx = x + ((i * 37 + R(time * 34)) % Math.max(1, w - 6)), k = ((i * 13 + R(time * 58)) % boilH) / boilH, sy = y - k * boilH; g.fillStyle = i % 3 ? '#2a1e50' : '#5a46a0'; g.fillRect(sx, R(sy), 5, 3); g.fillStyle = '#e8dcb0'; if (i % 4 === 0) g.fillRect(sx + 4, R(sy), 1, 1); g.fillStyle = '#ff5a5a'; g.fillRect(sx + 3, R(sy) + 1, 1, 1); g.fillStyle = '#120c26'; g.fillRect(sx - 1, R(sy) + 3, 1, 1); g.fillRect(sx + 3, R(sy) + 3, 1, 1); }   /* the swarm standing up out of it */
    g.globalAlpha = 0.2 + 0.1 * Math.sin(time * 9); const bgr = g.createLinearGradient(0, y - boilH, 0, y + 6); bgr.addColorStop(0, 'rgba(154,122,216,0)'); bgr.addColorStop(1, 'rgba(154,122,216,0.75)'); g.fillStyle = bgr; g.fillRect(x - 4, y - boilH, w + 8, boilH + 6); g.globalAlpha = 1;   /* the violet haze over it */
    g.fillStyle = '#d8c8ff'; for (let i = 0; i < w; i += 5) { if ((i + R(time * 14)) % 3 === 0) g.fillRect(x + i, y + 1 + (i % 4), 1, 2); } }   /* sparks off the lip */
}
/* ---------- THE HEAP a beam lands on: a pile of pale sand with a few glass glints; white-hot while a beam is on it ---------- */
export function drawHeap(g, x, y, hit, time) {
  const pile = [[-9, 2], [-7, 3], [-5, 4], [-3, 5], [-1, 6], [1, 6], [3, 5], [5, 4], [7, 3], [9, 2]];
  for (const [dx, h] of pile) for (let i = 0; i < h; i++) { g.fillStyle = hit ? (i >= h - 2 ? '#ffffff' : i >= h - 4 ? '#fff0b0' : '#ffd070') : i === h - 1 ? '#f8e0aa' : i >= h - 3 ? '#ecc888' : '#d8aa6a'; g.fillRect(x + dx, y - 1 - i, 2, 1); }
  g.fillStyle = hit ? '#ffffff' : '#b88a52'; for (let i = 0; i < 4; i++) g.fillRect(x - 7 + i * 4 + (i & 1), y - 1 - (i % 2), 1, 1);
  if (hit) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 12); const gl = g.createRadialGradient(x, y - 4, 1, x, y - 4, 14); gl.addColorStop(0, 'rgba(255,230,160,0.9)'); gl.addColorStop(1, 'rgba(255,200,100,0)'); g.fillStyle = gl; g.fillRect(x - 14, y - 18, 28, 28); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 4; i++) { const t = (time * 2 + i * 0.25) % 1; g.fillStyle = '#fff6c8'; g.fillRect(x - 4 + i * 3, R(y - 6 - t * 12), 1, 1); } }
}
/* ---------- FUSED GLASS: a polished slab (the shelf tile), scorched white at the leading edge while the beam walks it ---------- */
export function drawFused(g, shelf, x, y, k, time, hit, l, r) {
  g.globalAlpha = 0.55 + 0.45 * k; g.drawImage(shelf, x, y); g.globalAlpha = 1;
  if (k < 1 || hit) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = (hit ? 0.3 : 0.5) * (1 - k * 0.5) + 0.1 * Math.sin(time * 14 + x); g.fillStyle = '#ffe9a0'; g.fillRect(x, y, 16, 3); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
}
/* ---------- TARGET RINGS: crisp pixel rings (a beam's end, a crack's ring). on = locked: a double ring and a bloom */
const ring = (r, col) => once('ring' + r + col, () => { const [c, g] = canvas(2 * r + 3, 2 * r + 3); const cx = r + 1;
  for (let a = 0; a < 64; a++) { const t = a / 64 * Math.PI * 2; px(g, R(cx + Math.cos(t) * r), R(cx + Math.sin(t) * r), col); } return c; });
export function drawRing(g, x, y, on, time, crack, col) {
  const k = 0.5 + 0.5 * Math.sin(time * 6), c = crack ? (on ? '#ffc070' : '#b89aff') : on ? '#fff6c8' : col === 'fire' ? '#ffb050' : col === 'gaze' ? '#9ae8ff' : '#ffe9a0';
  g.globalAlpha = on ? 1 : 0.55 + 0.35 * k; const r0 = ring(6, c), r1 = ring(on ? 4 : 8, c);
  g.drawImage(r0, x - 7, y - 7); if (!on) g.drawImage(r1, x - 9, y - 9); else { g.drawImage(r1, x - 5, y - 5); }
  const rot = R(time * 3) % 4; g.fillStyle = c; for (let i = 0; i < 4; i++) { const dx = [0, 1, 0, -1][(i + rot) % 4], dy = [-1, 0, 1, 0][(i + rot) % 4], t = on ? 9 : 10 + (k > 0.5 ? 1 : 0); g.fillRect(x + dx * t - (dx ? 0 : 0), y + dy * t, dx ? 2 : 1, dy ? 2 : 1); }
  g.globalAlpha = 1;
  if (on) { g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(x, y, 1, x, y, 16); gl.addColorStop(0, crack ? 'rgba(255,190,90,0.7)' : 'rgba(255,246,200,0.8)'); gl.addColorStop(1, 'rgba(255,220,140,0)'); g.fillStyle = gl; g.fillRect(x - 16, y - 16, 32, 32); g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 1, 3, 3); }
}
/* ---------- BEAMS: a soft glow, a mid band, a white-hot core (crisp, axis-aligned) and motes running down it */
const BEAM = { sun: ['#ffffff', '#fff2a8', '#ffa828', 'rgba(255,214,110,0.22)'], sunset: ['#fff0e0', '#ffc080', '#ff7030', 'rgba(255,150,70,0.22)'], fire: ['#fff4dc', '#ffcc70', '#ff7a20', 'rgba(255,140,50,0.22)'], gaze: ['#ffffff', '#c8f6ff', '#2aa8e8', 'rgba(110,210,255,0.22)'] };
export function drawBeam(g, x0, y0, x1, y1, col, time) {
  const c = BEAM[col] || BEAM.sun, xa = R(Math.min(x0, x1)), xb = R(Math.max(x0, x1)), ya = R(Math.min(y0, y1)), yb = R(Math.max(y0, y1)), hor = (yb - ya) < (xb - xa) || (yb === ya);
  const pulse = 0.85 + 0.15 * Math.sin(time * 18);
  /* a warm halo (additive), then three opaque bands: a saturated edge (it reads on the pale day sky), a pale middle, a white-hot core */
  g.globalCompositeOperation = 'lighter'; g.fillStyle = c[3];
  if (hor) g.fillRect(xa, ya - 5, xb - xa + 1, 11); else g.fillRect(xa - 5, ya, 11, yb - ya + 1);
  g.globalCompositeOperation = 'source-over';
  if (hor) { g.fillStyle = c[2]; g.globalAlpha = 0.75; g.fillRect(xa, ya - 2, xb - xa + 1, 5); g.globalAlpha = 1; g.fillStyle = c[1]; g.globalAlpha = pulse; g.fillRect(xa, ya - 1, xb - xa + 1, 3); g.globalAlpha = 1; g.fillStyle = c[0]; g.fillRect(xa, ya, xb - xa + 1, 1); }
  else { g.fillStyle = c[2]; g.globalAlpha = 0.75; g.fillRect(xa - 2, ya, 5, yb - ya + 1); g.globalAlpha = 1; g.fillStyle = c[1]; g.globalAlpha = pulse; g.fillRect(xa - 1, ya, 3, yb - ya + 1); g.globalAlpha = 1; g.fillStyle = c[0]; g.fillRect(xa, ya, 1, yb - ya + 1); }
  const len = hor ? xb - xa : yb - ya; for (let i = 0; i < len / 22; i++) { const t = ((time * 70 + i * 22) % Math.max(22, len)), mx = hor ? xa + t : xa, my = hor ? ya : ya + t; g.fillStyle = '#ffffff'; g.fillRect(mx - (hor ? 1 : 2), my - (hor ? 2 : 1), hor ? 3 : 5, hor ? 5 : 3); g.fillStyle = c[0]; g.fillRect(mx, my - 1, 1, 3); }
}
/* ---------- A CAMPFIRE: a pit ringed with glass lumps, bleached bones laid crossed over embers, flames in three layers; its light is the night's (drawNight) and a pool on the ground here ---------- */
export function drawFire(g, x, y, time, seed) {
  for (const [dx, w, h, col] of [[-8, 4, 3, GL.c4], [-4, 3, 2, GL.c3], [3, 3, 2, GL.c3], [5, 4, 3, GL.c5]]) { g.fillStyle = col; g.fillRect(x + dx, y - h, w, h); g.fillStyle = GL.c1; g.fillRect(x + dx, y - h, w, 1); }   /* glass lumps round the pit */
  g.fillStyle = '#e8dcc0'; g.fillRect(x - 6, y - 4, 12, 2); g.fillStyle = '#f8f0dc'; g.fillRect(x - 6, y - 4, 12, 1); g.fillStyle = '#a8967a'; g.fillRect(x - 4, y - 6, 8, 2); g.fillStyle = '#d8c8a8'; g.fillRect(x - 4, y - 6, 8, 1);   /* bleached bones, crossed */
  g.fillStyle = '#7a2a10'; g.fillRect(x - 5, y - 3, 10, 2); g.fillStyle = '#ff6a20'; for (let i = 0; i < 5; i++) if ((i + R(time * 6)) % 2) g.fillRect(x - 4 + i * 2, y - 3, 1, 1);
  for (let i = 0; i < 3; i++) { const h = 7 + 5 * Math.abs(Math.sin(time * 7 + i * 2.1 + seed)) - i * 1.5, w = 5 - i, cx0 = x - R(w / 2) + R(Math.sin(time * 5 + i + seed) * 1);
    g.fillStyle = ['#ff6a2a', '#ffb050', '#fff2a0'][i]; g.fillRect(cx0, R(y - 5 - h), w, R(h)); g.fillRect(cx0 + (w >> 1), R(y - 6 - h), 1, 2); }
  for (let i = 0; i < 3; i++) { const t = (time * 0.9 + i * 0.33 + seed * 0.13) % 1; g.fillStyle = i % 2 ? '#ffd890' : '#ffb050'; g.fillRect(R(x - 3 + i * 3 + Math.sin(t * 6 + i) * 2), R(y - 12 - t * 18), 1, 1); }   /* sparks */
  g.globalCompositeOperation = 'lighter'; const pool = g.createRadialGradient(x, y, 2, x, y, 38); pool.addColorStop(0, 'rgba(255,170,80,0.34)'); pool.addColorStop(1, 'rgba(255,140,60,0)'); g.fillStyle = pool; g.save(); g.translate(x, y); g.scale(1, 0.32); g.translate(-x, -y); g.fillRect(x - 40, y - 40, 80, 80); g.restore(); g.globalCompositeOperation = 'source-over';   /* a pool of warm light on the glass */
}
/* ---------- A MIRROR: the glass at (x, y) by its notch ('sky' = flat to the sky, '/' and '\\' slanted); a bronze hood on a post (foot = px down to the ground, 'hood' = a tripod over a fire) and a brass dial of studs under it ---------- */
const BRONZE = { d: '#4a2e1a', m: '#8a5a2a', l: '#c89a4a', h: '#ffd36b' };
export function drawMirror(g, x, y, st, n, of, flash, time, locked, foot, hood) {
  const gy = y + (foot || 24);
  if (hood) { for (const dx of [-9, 9]) { g.fillStyle = BRONZE.d; for (let i = 0; i < gy - y - 6; i++) g.fillRect(x + R(dx * (1 - i / (gy - y)) * 1) , y + 6 + i, 2, 1); g.fillStyle = BRONZE.l; g.fillRect(x + dx, gy - 2, 3, 2); } }   /* a tripod's two legs straddling the fire */
  else { g.fillStyle = BRONZE.d; g.fillRect(x - 2, y + 4, 4, gy - y - 4); g.fillStyle = BRONZE.m; g.fillRect(x - 2, y + 4, 2, gy - y - 4); g.fillStyle = BRONZE.l; g.fillRect(x - 2, y + 4, 1, gy - y - 4); g.fillStyle = BRONZE.d; g.fillRect(x - 6, gy - 3, 12, 3); g.fillStyle = BRONZE.m; g.fillRect(x - 6, gy - 3, 12, 1); }   /* the post and its foot plate */
  /* the hood: a bronze half shell behind the disc, and the disc */
  g.fillStyle = BRONZE.d; g.fillRect(x - 3, y + 2, 6, 5); g.fillStyle = BRONZE.l; g.fillRect(x - 2, y + 2, 4, 1);
  const glass = flash > 0 ? '#ffffff' : '#d8f8ff', rimL = BRONZE.h, rimD = BRONZE.d;
  if (st === 'sky') { for (let i = -7; i <= 7; i++) { const t = i / 7, hh = R((1 - t * t) * 3); g.fillStyle = rimD; g.fillRect(x + i, y - hh - 1, 1, 2 * hh + 3); g.fillStyle = glass; g.fillRect(x + i, y - hh, 1, 2 * hh + 1); if (hh > 1) { g.fillStyle = '#7ad0e8'; g.fillRect(x + i, y + hh - 1, 1, 1); } } g.fillStyle = rimL; g.fillRect(x - 7, y, 1, 1); g.fillRect(x + 7, y, 1, 1);
    g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(x - 3, y - 2, 3, 1); }   /* flat, face up to the sky: no beam */
  else { const sgn = st === '/' ? -1 : 1;   /* '/' rises to the right: the strip runs from lower left to upper right */
    for (let i = -8; i <= 8; i++) { const yy = y + i * (-sgn) * 1 * (st === '/' ? 1 : 1); const xx = x + i; const px0 = xx, py0 = st === '/' ? y - i : y + i;
      g.fillStyle = rimD; g.fillRect(px0, py0 - 2, 1, 5); g.fillStyle = glass; g.fillRect(px0, py0 - 1, 1, 3); g.fillStyle = '#7ad0e8'; g.fillRect(px0, py0 + 1, 1, 1); if (Math.abs(i) > 6) { g.fillStyle = rimL; g.fillRect(px0, py0, 1, 1); } }
    const gl = (R(time * 4) % 9) - 4; g.fillStyle = '#ffffff'; g.fillRect(x + gl, (st === '/' ? y - gl : y + gl) - 1, 1, 1); }
  g.fillStyle = BRONZE.h; g.fillRect(x - 1, y - 1, 3, 3); g.fillStyle = BRONZE.d; g.fillRect(x, y, 1, 1);   /* the pivot */
  if (flash > 0) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, flash * 2.5); const f = g.createRadialGradient(x, y, 1, x, y, 20); f.addColorStop(0, 'rgba(255,250,210,0.9)'); f.addColorStop(1, 'rgba(255,230,150,0)'); g.fillStyle = f; g.fillRect(x - 20, y - 20, 40, 40); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  /* the dial: a brass plate with one stud per notch - the lit stud is where it throws; the stuck one is dark red with a keyhole */
  const dw = of * 5 + 3, dx0 = x - R(dw / 2), dy0 = y + 9; g.fillStyle = BRONZE.d; g.fillRect(dx0, dy0, dw, 5); g.fillStyle = BRONZE.m; g.fillRect(dx0, dy0, dw, 1);
  for (let i = 0; i < of; i++) { const stuck = locked && i === of - 1, on = i === n; g.fillStyle = on ? '#fff0a0' : stuck ? '#7a2020' : '#2a2a34'; g.fillRect(dx0 + 2 + i * 5, dy0 + 1, 3, 3); if (on) { g.fillStyle = '#ffffff'; g.fillRect(dx0 + 3 + i * 5, dy0 + 1, 1, 1); } if (stuck) { g.fillStyle = '#1a0808'; g.fillRect(dx0 + 3 + i * 5, dy0 + 2, 1, 1); } }
}
/* ---------- A SHARD PATCH (a shattered scorpion's glass in the sand) and a DAZZLE (sparks round a stunned glass scorpion) ---------- */
export function drawPatch(g, x, y, k, time) { g.globalAlpha = 0.4 + 0.6 * k; for (let i = 0; i < 8; i++) { const dx = -15 + i * 4 + (i & 1), h = 3 + (i * 5) % 4; g.fillStyle = i % 2 ? GL.c3 : GL.c2; g.fillRect(x + dx, y - h, 2, h); g.fillStyle = GL.w; g.fillRect(x + dx, y - h, 1, 1); } g.globalAlpha = 1; }
export function drawDazzle(g, x, y, time) { g.fillStyle = Math.floor(time * 16) % 2 ? '#ffffff' : '#9ae8d0'; for (let i = 0; i < 5; i++) g.fillRect(x - 9 + ((i * 7 + R(time * 30)) % 18), y - 4 - (i % 3) * 3, 1, 2); g.fillRect(x - 1, y - 12, 3, 1); g.fillRect(x, y - 13, 1, 3); }
/* ---------- THE DARK: the night's blue dark, darkAt(worldX) 0..0.5 by column, with a pool of warm light at every light (a fire, a fire beam); and the dusk's grade (k) ---------- */
export function drawNight(g, vw, vh, cx, cy, darkAt, lights, time) {
  for (let sx = 0; sx < vw; sx += 16) { const a = darkAt(cx + sx + 8); if (a <= 0.01) continue; g.fillStyle = 'rgba(6,12,38,' + a.toFixed(3) + ')'; g.fillRect(sx, 0, 16, vh); }
  g.globalCompositeOperation = 'lighter';
  for (const q of lights) { const x = q.x - cx, y = q.y - cy; if (x < -q.r || x > vw + q.r || y < -q.r || y > vh + q.r) continue; const a = darkAt(q.x); if (a <= 0.02) continue; const fl = 0.92 + 0.08 * Math.sin(time * 9 + q.x);
    const gr = g.createRadialGradient(x, y, 2, x, y, q.r); gr.addColorStop(0, 'rgba(255,176,96,' + (a * 0.85 * fl).toFixed(3) + ')'); gr.addColorStop(0.5, 'rgba(255,150,70,' + (a * 0.35).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,140,60,0)'); g.fillStyle = gr; g.fillRect(x - q.r, y - q.r, q.r * 2, q.r * 2); }
  g.globalCompositeOperation = 'source-over';
}
/* the dusk's grade over the whole picture: amber as the sun goes under (k 0.25..0.7), a cold blue wash deepening at night */
export function drawGrade(g, vw, vh, k) {
  const d = Math.max(0, 1 - Math.abs(k - 0.45) / 0.25); if (d > 0.01) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,120,50,' + (0.09 * d).toFixed(3) + ')'; g.fillRect(0, 0, vw, vh); g.globalCompositeOperation = 'source-over'; }
  if (k > 0.6) { g.fillStyle = 'rgba(30,70,150,' + (0.1 * Math.min(1, (k - 0.6) * 2.5)).toFixed(3) + ')'; g.fillRect(0, 0, vw, vh); }
}
/* ---------- THE FROST METER: the sun meter's twin by night (a frost star, a pale-blue bar, frost pips at full) ---------- */
export function drawFrostMeter(g, x, y, v, warm, time, stage) {
  g.fillStyle = '#10203c'; g.fillRect(x - 13, y - 3, 11, 11); g.fillStyle = '#1c3460'; g.fillRect(x - 12, y - 2, 9, 9);
  g.fillStyle = v >= 1 ? '#ffffff' : '#bfe4ff'; g.fillRect(x - 8, y, 1, 7); g.fillRect(x - 11, y + 3, 7, 1); g.fillRect(x - 10, y + 1, 1, 1); g.fillRect(x - 5, y + 1, 1, 1); g.fillRect(x - 10, y + 5, 1, 1); g.fillRect(x - 5, y + 5, 1, 1);   /* a six-armed frost star */
  g.fillStyle = 'rgba(10,18,40,0.78)'; g.fillRect(x, y, 44, 7); g.fillStyle = '#2a4a78'; g.fillRect(x, y, 44, 1);
  g.fillStyle = v >= 1 ? '#ffffff' : v > 0.55 ? '#9ad0f0' : '#5a90c0'; g.fillRect(x + 1, y + 2, R(42 * v), 3); if (v > 0.05) { g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x + 1, y + 2, R(42 * v), 1); }
  if (stage) for (let i = 0; i < 3; i++) { g.fillStyle = i < stage ? (Math.floor(time * 6) % 2 ? '#e8f8ff' : '#9ad0f0') : 'rgba(20,30,50,0.5)'; g.fillRect(x + 47 + i * 5, y + 1, 3, 5); }
}
/* THE GLASS SHARD (the quest's pickup): a green-white sliver of fused glass with a lit facet and a violet fleck, 10 x 14 */
export function bakeShardIcon() { const [c, g] = canvas(10, 14);
  for (let y = 0; y < 12; y++) { const t = y / 11, hw = y < 8 ? 1 + y * 0.45 : 4.2 - (y - 8) * 1.1; for (let x = Math.round(5 - hw); x <= Math.round(5 + hw); x++) { const f = (x - (5 - hw)) / Math.max(1, 2 * hw); px(g, x, y + 1, f < 0.35 ? '#e6fff6' : f < 0.7 ? '#7adcc4' : '#34908c'); } }
  px(g, 5, 0, '#ffffff'); px(g, 4, 2, '#ffffff'); px(g, 4, 3, '#ffffff'); px(g, 6, 8, '#8a6ad8'); px(g, 5, 9, '#b89cff'); px(g, 3, 6, '#bfffee');
  const o = canvas(10, 14); o[1].drawImage(c, 0, 0);
  const d = o[1].getImageData(0, 0, 10, 14), p = d.data, solid = new Uint8Array(140); for (let i = 0; i < 140; i++) solid[i] = p[i * 4 + 3] ? 1 : 0;
  for (let y = 0; y < 14; y++) for (let x = 0; x < 10; x++) { if (solid[y * 10 + x]) continue; if ((x > 0 && solid[y * 10 + x - 1]) || (x < 9 && solid[y * 10 + x + 1]) || (y > 0 && solid[(y - 1) * 10 + x]) || (y < 13 && solid[(y + 1) * 10 + x])) px(o[1], x, y, '#0a1c26'); }
  return o[0];
}
