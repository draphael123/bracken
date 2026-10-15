// paladin_boss_art.js - THE PALADIN BOSS's poses that are his alone (claude/church2art). His body is the hero's own sheet (no new body art); these are the frames the HERO does not
// have, made FROM the hero's frames so they survive any change to his kit (the Paladin 3 hero pass, the Light-ward): the FALTER (his Light run dry: the plate gone cold and grey,
// light leaking through cracks, embers drifting off him), the REBOUND (the shield took his charge: thrown back off his feet, dust at his heels, a streak of the blow) and the REEL
// (struck on the beat: the head snapped back, a spark of impact), and the BESTIARY CARD (his idle at the size he is drawn in the fight, a rim of Light flickering round him).
// Pure pixel work on baked canvases (px.js); the foe circle's crimson under-line is HG_PAL.foe in src/holy-ground.js. DEFERRED to the pass after the hero's: the aegis ward, the
// judgement crosses + columns, the hammer leap's ring and the quake, the vigil's light, the light bar's spend ticks (they change with his kit).
import { canvas, px, line } from '../px.js';
const R = Math.round;
const bbox = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let x0 = c.width, x1 = -1, y0 = c.height, y1 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return { x0, x1, y0, y1 }; };
const copy = src => { const [c, g] = canvas(src.width, src.height); g.drawImage(src, 0, 0); return [c, g]; };
/* a row-sheared copy: feet fixed, the top thrown `amp` px (+ forward, - back); `bend` > 1 keeps the legs still and swings the shoulders */
function shear(src, amp, bend = 1.3) { const b = bbox(src); if (b.x1 < 0) return copy(src)[0]; const [c, g] = canvas(src.width, src.height), h = Math.max(1, b.y1 - b.y0);
  for (let y = b.y0; y <= b.y1; y++) { const t = (b.y1 - y) / h, dx = R(amp * Math.pow(t, bend)); g.drawImage(src, 0, y, src.width, 1, dx, y, src.width, 1); } return c; }
/* THE FALTER: the Light has gone out of him - the hero's own slump, cooled and greyed, cracks of light through the plate, embers going up */
export function falter(src) { const [c, g] = copy(src), b = bbox(c); if (b.x1 < 0) return c;
  const img = g.getImageData(0, 0, c.width, c.height), d = img.data;
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const gr = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; d[i] = R(d[i] * 0.4 + gr * 0.6 * 0.82); d[i + 1] = R(d[i + 1] * 0.4 + gr * 0.6 * 0.86); d[i + 2] = R(Math.min(255, d[i + 2] * 0.4 + gr * 0.6 * 1.0 + 8)); }
  g.putImageData(img, 0, 0);
  const w = b.x1 - b.x0, h = b.y1 - b.y0, mx = b.x0 + w * 0.5, ty = b.y0 + h * 0.3;
  const solid = (x, y) => g.getImageData(R(x), R(y), 1, 1).data[3] > 0;
  for (const [ax, ay, bx, by] of [[mx - 3, ty, mx - 1, ty + 5], [mx + 2, ty + 3, mx + 4, ty + 8], [mx - 1, ty + 9, mx + 1, ty + 13]]) { g.fillStyle = '#fff0a8';
    const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay)); for (let i = 0; i <= n; i++) { const x = R(ax + (bx - ax) * i / n), y = R(ay + (by - ay) * i / n); if (solid(x, y)) g.fillRect(x, y, 1, 1); } }   /* light through the cracks */
  for (const [dx, dy, col] of [[-6, -4, '#ffd36b'], [4, -7, '#ff9a3c'], [0, -11, '#fff6c8'], [8, -2, '#ffd36b'], [-3, -14, '#ff9a3c']]) { const x = R(mx + dx), y = R(b.y0 + dy + 4); if (y >= 0 && x >= 0 && x < c.width) px(g, x, y, col); }   /* embers rising */
  return c; }
/* THE REBOUND: thrown back off his feet by the shield - the top swung back, dust at his heels, the blow's streak in front */
export function rebound(src) { const c = shear(src, -5, 1.2), g = c.getContext('2d'), b = bbox(src); if (b.x1 < 0) return c;
  for (const [dx, dy, col] of [[-1, 0, '#b8a888'], [-4, -1, '#d8c8a8'], [-7, -2, '#b8a888'], [-3, -3, '#e8dcc0'], [-9, 0, '#d8c8a8'], [-6, -4, '#e8dcc0']]) px(g, b.x0 + dx + 4, b.y1 + dy, col);   /* dust */
  g.globalAlpha = 0.7; for (const k of [0, 1, 2]) { const y = b.y0 + R((b.y1 - b.y0) * (0.25 + k * 0.18)); line(g, b.x1 + 1, y, b.x1 + 5 - k, y, k === 1 ? '#fff6c8' : '#ffd36b'); } g.globalAlpha = 1;   /* the blow's streak */
  const sx = b.x1 + 1, sy = b.y0 + R((b.y1 - b.y0) * 0.4); px(g, sx, sy, '#ffffff'); px(g, sx + 1, sy - 1, '#ffd36b'); px(g, sx + 1, sy + 1, '#ffd36b'); px(g, sx + 2, sy, '#fff6c8');
  return c; }
/* THE REEL: struck on the beat - the head snapped back, a spark of impact where the blow landed */
export function reel(src) { const c = shear(src, -3, 1.0), g = c.getContext('2d'), b = bbox(src); if (b.x1 < 0) return c;
  const sx = b.x1 - 1, sy = b.y0 + R((b.y1 - b.y0) * 0.22); g.fillStyle = '#ffffff'; g.fillRect(sx - 1, sy, 3, 1); g.fillRect(sx, sy - 1, 1, 3); px(g, sx - 2, sy - 2, '#ffd36b'); px(g, sx + 2, sy + 2, '#ffd36b'); px(g, sx + 2, sy - 2, '#fff6c8'); px(g, sx - 2, sy + 2, '#fff6c8');
  return c; }
/* THE BESTIARY CARD: the hero's idle at the size he is fought at (x1.5, nearest), cropped to the figure; the second frame throws a rim of Light round him. ax/ay re-anchored to the crop */
export function cardFrames(idle, ax, ay, k = 1.5) { const b = bbox(idle); if (b.x1 < 0) return null; const w = b.x1 - b.x0 + 1, h = b.y1 - b.y0 + 1, W = R((w + 6) * k), H = R((h + 6) * k);
  const mk = rim => { const [c, g] = canvas(W, H); g.imageSmoothingEnabled = false;
    if (rim) { const [s, sg] = canvas(W, H); sg.imageSmoothingEnabled = false; sg.drawImage(idle, b.x0, b.y0, w, h, R(3 * k), R(3 * k), R(w * k), R(h * k)); const d = sg.getImageData(0, 0, W, H).data, o = g.getImageData(0, 0, W, H), od = o.data;
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { if (d[(y * W + x) * 4 + 3]) continue; if (d[(y * W + x - 1) * 4 + 3] || d[(y * W + x + 1) * 4 + 3] || d[((y - 1) * W + x) * 4 + 3] || d[((y + 1) * W + x) * 4 + 3]) { const i = (y * W + x) * 4; od[i] = 255; od[i + 1] = 211; od[i + 2] = 107; od[i + 3] = 150; } } g.putImageData(o, 0, 0); }
    g.drawImage(idle, b.x0, b.y0, w, h, R(3 * k), R(3 * k), R(w * k), R(h * k)); return c; };
  return { R: [mk(false), mk(true)], ax: R((ax - b.x0 + 3) * k), ay: R((ay - b.y0 + 3) * k), w: 12, h: 24 }; }
