// src/redraw/glasssea_art.js - THE GLASS SEA's GREYBOX ART (claude/glasssea). Placeholders only: Daniel approves the concept before any art pass.
//   THE CAST's skins (each a recolour of its proven machine's frames, so it reads apart at 320x180): GLASS SCORPION (pale green-white glass), SHARD THROWER
//   (the slinger, glass-cyan), NIGHT HUNTER (the cutthroat, bone-pale and blue), GLASS SENTINEL (the shield guard, bottle-green glass), and THE SKITTER (new:
//   a hand-sized glass crawler, 5 frames). THE WORLD (drawn live by src/glass-sea-hands.js): the sky by the hour, the horizon and THE COLOSSUS's silhouette,
//   the props (bone skiffs, fulgurite spires, the obelisk, the sunken head, the ridges, the dark cut), the cracks (a pit; boiling with the swarm; held in
//   firelight), the sand heaps and the fused glass, the beams and their target rings, the campfires, the mirrors and their notch dials, the night's dark
//   with a hole for every fire, and THE FROST METER.
import { canvas, outline, flipX, whiten, rgb, rect, px } from '../px.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };
const lerp3 = (st, l) => { const A = rgb(st[0]), B = rgb(st[1]), C = rgb(st[2]); const [a, b, t] = l < 0.5 ? [A, B, l * 2] : [B, C, (l - 0.5) * 2]; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
/* a reskin: every lit pixel's lightness is laid on the skin's three-stop ramp (the outline, below 0.13, is kept) */
function tint(c, ramp, keepRed) { const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], l = (r + gg + b) / 765; if (l < 0.13) continue; if (keepRed && r > 200 && gg < 110) continue; const o = lerp3(ramp, Math.min(1, l * 1.2)); p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; }
  g.putImageData(img, 0, 0); return d; }
const reskin = (set, ramp, keepRed) => { if (!set || !set.R) return set; return pack(set.R.map(c => tint(c, ramp, keepRed)), set.ax, set.ay, set.w, set.h); };
export const bakeGlassScorpion = base => reskin(base, ['#3a6a62', '#9ae8d0', '#f0fff8']);
export const bakeShardThrower = base => reskin(base, ['#2a4a6a', '#7ad0e8', '#e8fcff']);
export const bakeNightHunter = base => reskin(base, ['#1e2a44', '#8a9ac0', '#e8eef8'], true);
export const bakeGlassSentinel = base => reskin(base, ['#1a3a2a', '#4aa878', '#c8f8d8']);
/* THE SKITTER: 0,1 run | 2 bite tell | 3 bite | 4 hurt; 12x8, anchored at its feet */
export function bakeSkitter() {
  const F = [];
  for (let k = 0; k < 5; k++) { const [c, g] = canvas(12, 8);
    const body = k === 4 ? '#ffffff' : '#5a4a8a', hi = '#b8a8f0', leg = '#2a2036', up = k === 2 ? -2 : 0, fw = k === 3 ? 2 : 0;
    rect(g, 2 + fw, 3 + up, 7, 3, body); rect(g, 3 + fw, 3 + up, 5, 1, hi);   /* the glass shell */
    rect(g, 8 + fw, 2 + up, 2, 2, body); px(g, 9 + fw, 2 + up, '#ff6b6b');       /* the head and its eye */
    if (k === 2) { px(g, 10, 0, '#e8dcb0'); px(g, 11, 1, '#e8dcb0'); }              /* mandibles open */
    if (k === 3) { rect(g, 11, 3, 1, 2, '#e8dcb0'); }
    for (let i = 0; i < 3; i++) { const lx = 3 + fw + i * 2, ph = (k + i) % 2; px(g, lx, 6, leg); px(g, lx + (ph ? 1 : -1), 7, leg); }
    outline(c, '#120c1a'); F.push(c); }
  return pack(F, 6, 8, 9, 6);
}

/* ---------- THE WORLD ---------- */
const R = Math.round;
/* THE SKY: k 0 = gold day, 0.5 = violet dusk, 1 = night blue; arena phases override (dusk, night, dawn) */
export function drawSky(g, vw, vh, k, time, ph) {
  const stops = ph === 3 ? [['#f8c878', '#f0a0a8'], ['#c8d8f0', '#f8d8a0']] : null;
  const top = ph === 3 ? '#7aa0d8' : mix3(['#e8b860', '#6a3a8a', '#0e1430'], k), bot = ph === 3 ? '#f8c890' : mix3(['#f8e0a0', '#c87aa0', '#1e2850'], k);
  const gr = g.createLinearGradient(0, 0, 0, vh); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, vw, vh);
  if (k > 0.6 && ph !== 3) { g.fillStyle = '#e8eef8'; for (let i = 0; i < 40; i++) { const x = (i * 97) % vw, y = (i * 53) % (vh * 0.6); g.globalAlpha = (k - 0.6) * 2 * (0.4 + 0.6 * ((i * 7) % 5) / 5); g.fillRect(x, y, 1, 1); } g.globalAlpha = 1; }
  if (stops) {}
}
const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return 'rgb(' + R(A[0] + (B[0] - A[0]) * t) + ',' + R(A[1] + (B[1] - A[1]) * t) + ',' + R(A[2] + (B[2] - A[2]) * t) + ')'; };
const mix3 = (s, k) => (k < 0.5 ? mix(s[0], s[1], k * 2) : mix(s[1], s[2], (k - 0.5) * 2));
/* THE HORIZON: glass dunes, and THE COLOSSUS's silhouette - small and far at the edge, bigger section by section (prog 0..1), its eyes lit */
export function drawHorizon(g, vw, vh, cx, prog, k, time) {
  const base = R(vh * 0.62); g.fillStyle = mix3(['#d8c890', '#7a5a8a', '#1a2040'], k);
  g.beginPath(); g.moveTo(0, vh); for (let x = 0; x <= vw; x += 8) g.lineTo(x, base + R(Math.sin((x + cx * 0.15) * 0.02) * 6 + Math.sin((x + cx * 0.15) * 0.05) * 3)); g.lineTo(vw, vh); g.fill();
  const s = 0.35 + 1.1 * prog, hx = R(vw * 0.78 - prog * vw * 0.18), hy = base + 4, hh = R(60 * s), hw = R(22 * s);
  g.fillStyle = mix3(['#7a8a9a', '#3a2a5a', '#0a0e20'], k); g.globalAlpha = 0.85;
  g.fillRect(hx - R(hw * 0.35), hy - hh, R(hw * 0.7), hh);                        /* the trunk */
  g.fillRect(hx - hw / 2, hy - R(hh * 0.85), hw, R(hh * 0.3));                    /* the shoulders */
  g.fillRect(hx - R(hw * 0.18), hy - hh - R(9 * s), R(hw * 0.36), R(10 * s));     /* the head */
  g.globalAlpha = 1; g.fillStyle = k > 0.5 ? '#9ae8ff' : '#fff2c0'; const ey = hy - hh - R(5 * s); g.fillRect(hx - R(3 * s), ey, Math.max(1, R(2 * s)), 1); g.fillRect(hx + R(1 * s), ey, Math.max(1, R(2 * s)), 1);
}
export function drawDecor(g, d, cx, cy, ts, time) {
  const X = x => R(x * ts - cx), Y = y => R(y * ts - cy);
  if (d.kind === 'skiff') { const x = X(d.x) + 8, y = Y(d.y + 1); g.fillStyle = '#e8dcc0'; for (let i = -2; i <= 2; i++) { g.fillRect(x + i * 7 - 1, y - 22 + Math.abs(i) * 3, 2, 22 - Math.abs(i) * 3); } g.fillRect(x - 18, y - 4, 36, 3); g.fillStyle = 'rgba(120,90,150,0.18)'; g.fillRect(x - 36, y - 32, 72, 32); }
  else if (d.kind === 'spire') { const x = X(d.x) + 8; g.fillStyle = '#a8d8c8'; g.fillRect(x - 3, Y(d.top), 6, Y(d.y + 1) - Y(d.top)); g.fillStyle = '#e8fff8'; g.fillRect(x - 1, Y(d.top), 1, Y(d.y + 1) - Y(d.top)); }
  else if (d.kind === 'obelisk') { g.fillStyle = '#5a4a3a'; g.fillRect(X(d.x0), Y(d.top), (d.x1 - d.x0 + 1) * ts, Y(d.y + 1) - Y(d.top)); g.fillStyle = '#8a7050'; g.fillRect(X(d.x0) + 2, Y(d.top), 3, Y(d.y + 1) - Y(d.top));
    g.fillStyle = '#ffd36b'; g.fillRect(X(d.x0), Y(d.eye) + 4, (d.x1 - d.x0 + 1) * ts, 8); g.fillStyle = '#1a1210'; g.fillRect(X(d.x0) + 2, Y(d.y - 2), (d.x1 - d.x0 + 1) * ts - 4, 3 * ts); }
  else if (d.kind === 'head') { g.fillStyle = 'rgba(110,100,90,0.9)'; g.fillRect(X(d.x0 + 9), Y(d.y0), (d.x1 - d.x0 - 9) * ts, ts * 2); g.fillStyle = '#ffe9a0'; g.fillRect(X(d.x0 + 3), Y(d.y0 + 7), 6, 2); g.fillRect(X(d.x0 + 6), Y(d.y0 + 7), 6, 2); }
  else if (d.kind === 'ridge') { g.fillStyle = 'rgba(160,230,210,0.35)'; g.fillRect(X(d.x0), Y(d.y), (d.x1 - d.x0 + 1) * ts, 3); }
  else if (d.kind === 'cut') { g.fillStyle = 'rgba(20,24,50,0.35)'; g.fillRect(X(d.x0), Y(d.y1 + 1), (d.x1 - d.x0 + 1) * ts, 3 * ts); }
  else if (d.kind === 'templeDoor') { const x = X(d.x), y = Y(d.y + 1); g.fillStyle = '#8a6a3a'; g.fillRect(x - 6, y - 40, 28, 40); g.fillStyle = '#3a2a18'; g.fillRect(x, y - 32, 16, 32); g.fillStyle = '#ffd36b'; g.fillRect(x + 6, y - 38, 4, 4); }
  else if (d.kind === 'heap') {}
}
/* A CRACK: a pit in the glass; boiling (the swarm stands up out of it, told), held (a warm glow on its lip), dark (a night crack far from the hero) */
export function drawCrack(g, x, y, w, st, time, boilH) {
  g.fillStyle = 'rgba(10,8,20,0.55)'; g.fillRect(x, y, w, 10 * 16);
  g.fillStyle = st === 'held' ? '#ffb050' : st === 'boil' ? '#9a7ad8' : '#3a6a62'; g.fillRect(x, y, w, 1);
  if (st === 'boil') { for (let i = 0; i < 18; i++) { const sx = x + ((i * 37 + R(time * 30)) % Math.max(1, w)), sy = y - ((i * 13 + R(time * 60)) % boilH); g.fillStyle = i % 3 ? '#5a4a8a' : '#e8dcb0'; g.fillRect(sx, sy, 3, 2); }
    g.globalAlpha = 0.18 + 0.1 * Math.sin(time * 9); g.fillStyle = '#9a7ad8'; g.fillRect(x - 4, y - boilH, w + 8, boilH); g.globalAlpha = 1; }
  if (st === 'held') { g.globalAlpha = 0.25; g.fillStyle = '#ffb050'; g.fillRect(x, y - 6, w, 6); g.globalAlpha = 1; }
}
export function drawHeap(g, x, y, hit, time) { g.fillStyle = hit ? '#fff2c0' : '#d8c08a'; g.fillRect(x - 6, y - 3, 12, 3); g.fillRect(x - 3, y - 5, 6, 2); if (hit) { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 12); g.fillStyle = '#ffffff'; g.fillRect(x - 2, y - 7, 4, 2); g.globalAlpha = 1; } }
export function drawFused(g, x, y, k, time, seed) { g.globalAlpha = 0.55 + 0.4 * k; g.fillStyle = '#9ae8d0'; g.fillRect(x, y, 16, 4); g.fillStyle = '#f0fff8'; g.fillRect(x + (seed * 5) % 12, y, 3, 1); g.globalAlpha = 1; }
export function drawRing(g, x, y, on, time, crack, col) { const k = 0.5 + 0.5 * Math.sin(time * 6); g.strokeStyle = crack ? (on ? '#ffb050' : '#9a7ad8') : on ? '#fff6c8' : col === 'fire' ? '#ffb050' : '#ffe9a0'; g.globalAlpha = on ? 0.9 : 0.45 + 0.3 * k; g.lineWidth = 1;
  g.beginPath(); g.arc(x, y, 6 + 2 * k, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
export function drawBeam(g, x0, y0, x1, y1, col, time) { const c = col === 'fire' ? ['rgba(255,170,80,0.35)', '#ffd08a'] : col === 'gaze' ? ['rgba(150,230,255,0.35)', '#e0faff'] : ['rgba(255,240,180,0.4)', '#fffbe0'];
  g.strokeStyle = c[0]; g.lineWidth = 5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = c[1]; g.lineWidth = 1 + (Math.sin(time * 20) > 0 ? 1 : 0); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.lineWidth = 1; }
export function drawFire(g, x, y, time, seed) { g.fillStyle = '#4a3020'; g.fillRect(x - 6, y - 2, 12, 2); for (let i = 0; i < 3; i++) { const h = 6 + 4 * Math.abs(Math.sin(time * 7 + i * 2 + seed)); g.fillStyle = ['#ff6a2a', '#ffb050', '#fff2a0'][i]; g.fillRect(x - 3 + i * 2 - 1, R(y - 2 - h + i * 2), 3, R(h - i * 2)); } }
/* A MIRROR on its post: the glass by its notch (the sky = flat, '/' and '\\' slanted), and a dial of notches under it (the lit one is its notch) */
export function drawMirror(g, x, y, st, n, of, flash, time, locked) {
  g.fillStyle = '#6a5a4a'; g.fillRect(x - 1, y + 2, 3, 22);                                      /* the post (two rows down to the ground) */
  g.save(); g.translate(x, y); g.rotate(st === 'sky' ? 0 : st === '/' ? -Math.PI / 4 : Math.PI / 4);
  g.fillStyle = flash > 0 ? '#ffffff' : '#c8f0ff'; g.fillRect(-7, -1, 14, 3); g.fillStyle = '#5a8a9a'; g.fillRect(-7, 2, 14, 1); g.restore();
  for (let i = 0; i < of; i++) { g.fillStyle = i === n ? '#ffd36b' : locked && i === of - 1 ? '#5a3a3a' : '#4a4a5a'; g.fillRect(x - 5 + i * 4, y + 14, 3, 2); }
}
export function drawPatch(g, x, y, k, time) { g.globalAlpha = 0.4 + 0.5 * k; g.fillStyle = '#9ae8d0'; for (let i = 0; i < 6; i++) g.fillRect(x - 14 + i * 5, y - 3 - (i % 2) * 2, 2, 3 + (i % 2) * 2); g.globalAlpha = 1; }
export function drawDazzle(g, x, y, time) { g.fillStyle = Math.floor(time * 16) % 2 ? '#ffffff' : '#9ae8d0'; for (let i = 0; i < 4; i++) g.fillRect(x - 8 + ((i * 7 + R(time * 30)) % 16), y - 4 - (i % 2) * 3, 1, 1); }
/* THE NIGHT: the blue dark, darkAt(worldX) 0..0.5 by column, with a soft hole at every light (screen strips 16 px wide) */
export function drawNight(g, vw, vh, cx, cy, darkAt, lights, time) {
  for (let sx = 0; sx < vw; sx += 16) { const a = darkAt(cx + sx + 8); if (a <= 0.01) continue; g.fillStyle = 'rgba(8,12,34,' + a.toFixed(3) + ')'; g.fillRect(sx, 0, 16, vh); }
  g.globalCompositeOperation = 'lighter';
  for (const q of lights) { const x = q.x - cx, y = q.y - cy; if (x < -q.r || x > vw + q.r || y < -q.r || y > vh + q.r) continue; const a = darkAt(q.x); if (a <= 0.02) continue;
    const gr = g.createRadialGradient(x, y, 2, x, y, q.r); gr.addColorStop(0, 'rgba(255,170,90,' + (a * 0.7).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,140,60,0)'); g.fillStyle = gr; g.fillRect(x - q.r, y - q.r, q.r * 2, q.r * 2); }
  g.globalCompositeOperation = 'source-over';
}
/* THE FROST METER: the sun meter's twin by night (pale blue, frost pips at full) */
export function drawFrostMeter(g, x, y, v, warm, time, stage) {
  g.fillStyle = '#1a2440'; g.fillRect(x - 12, y - 2, 9, 9); g.fillStyle = v >= 1 ? '#e8f8ff' : '#9ad0f0'; g.fillRect(x - 9, y + 1, 3, 3); g.fillRect(x - 11, y + 2, 7, 1); g.fillRect(x - 8, y - 1, 1, 7);   /* a frost star */
  g.fillStyle = 'rgba(10,14,30,0.7)'; g.fillRect(x, y, 44, 7); g.fillStyle = v >= 1 ? '#e8f8ff' : v > 0.55 ? '#9ad0f0' : '#5a90c0'; g.fillRect(x + 1, y + 2, R(42 * v), 3);
  if (stage) for (let i = 0; i < 3; i++) { g.fillStyle = i < stage ? (Math.floor(time * 6) % 2 ? '#e8f8ff' : '#9ad0f0') : 'rgba(20,30,50,0.5)'; g.fillRect(x + 47 + i * 5, y + 1, 3, 5); }
}
/* THE GLASS SHARD (the quest's pickup): a green-white sliver of fused glass, 10x12 */
export function bakeShardIcon() { const [c, g] = canvas(10, 12); g.fillStyle = '#9ae8d0'; g.beginPath(); g.moveTo(5, 0); g.lineTo(9, 7); g.lineTo(5, 11); g.lineTo(1, 6); g.closePath(); g.fill(); g.fillStyle = '#f0fff8'; g.fillRect(4, 2, 1, 6); g.fillStyle = '#3a6a62'; g.fillRect(6, 7, 2, 2); outline(c, '#1b1626'); return c; }
