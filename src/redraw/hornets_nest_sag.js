// hornets_nest_sag.js - THE HORNET'S NEST 2's HONEY WORKS, drawn (claude/hornetsnest2art; SONNET over the greybox claude/hornetsnest2). ART ONLY: every box, count and timing is the hands'
// (src/hornets-nest-hands.js, tower-collapse.js); this draws what they say.
//   sagComb(g, c, cx, cy, time, text)     a SAGGING COMB (L.crumbles kind 'comb'): whole = honey strings and a heavy lip; counting = the belly bows down, wax stretches, drops pinch off; down = a faint
//                                         ghost that fills back in as the comb regrows
//   drip(g, d, tell, time, glob)          a HONEY DRIP: the string off the comb or roof, the waiting nub, the bead swelling on its neck (the neck thins, pinches off), then the glob falls
//   bed(g, x, y, w, time)                 the sticky BED (sump, well): a glossy honey skin over the wax tiles, a sheen sliding across, bubbles rising and popping
//   hiveWall(g, c0, c1, r0, r1, cx, cy, VW, VH) the capped-cell wall of the sump and the well (world-anchored pattern, honey-stained toward the bed)
//   bloom(g, x, y, r, age)                a smoke pot BURSTING: the flash, the ring and the clay shards in a cloud's first third of a second
import { canvas } from '../px.js';
import { COMB, WAX } from './hornets_nest_tiles.js';
import { HONEY_PAL as H } from './hornets_nest_honey.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h ^ (h >>> 16); };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
const TS = 16;

/* ---------------- a honey string: 1 px, two golds, a thicker knot every so often, a glint that slides down it ---------------- */
function string(g, x, y0, y1, time, seed) {
  for (let y = y0; y < y1; y++) { const knot = (y + seed) % 9 === 0; R(g, (y + seed) % 3 ? H[2] : H[3], x, y, 1, 1); if (knot) { R(g, H[1], x - 1, y, 1, 1); R(g, H[3], x + 1, y, 1, 1); } }
  const gy = y0 + ((time * 9 + seed * 3) % Math.max(4, y1 - y0)); if (gy < y1) R(g, H[5], x, gy, 1, 1);
}

/* ---------------- a SAGGING COMB ---------------- */
export function sagComb(g, c, cx, cy, time, text) {
  const x = Math.round(c.x0 * TS - cx), y = Math.round(c.row * TS - cy), w = (c.x1 - c.x0 + 1) * TS, rows = c.rows || 1, bot = y + rows * TS;
  if (c.st === 'down') {   /* the gap: a ghost of the comb that grows back in (it is back in `back` s) */
    const p = Math.min(1, (c.downT || 0) / (c.back || 4)); g.globalAlpha = 0.1 + 0.2 * p; g.strokeStyle = WAX[3]; g.setLineDash([3, 3]); g.strokeRect(x + 0.5, y + 0.5, w - 1, rows * TS - 1); g.setLineDash([]);
    g.globalAlpha = 0.05 + 0.22 * p * p; g.fillStyle = WAX[2]; g.fillRect(x + 1, y + Math.round((1 - p) * (rows * TS - 2)) + 1, w - 2, Math.round(p * (rows * TS - 2))); g.globalAlpha = 1;
    for (let k = 0; k < 3; k++) { const ph = (time * 0.7 + k / 3 + c.x0 * 0.31) % 1; g.globalAlpha = 0.7 * (1 - ph); R(g, H[4], x + 4 + ((hash(c.x0, k) % Math.max(1, w - 8))), y + rows * TS - 2 - ph * 10, 1, 1); } g.globalAlpha = 1;   /* wax seeping up as it knits */
    return; }
  const counting = c.st === 'count', k = counting ? Math.min(1, 1 - c.t / c.count) : 0, hot = counting && c.t < 1, jig = hot ? Math.round(Math.sin(time * 50)) : 0, X = x + jig;
  const depth = counting ? Math.round(1 + 8 * (k < 0.5 ? k * 1.2 : 0.6 + (k - 0.5) * 0.8)) : 1;   /* how far the belly bows below the shelf */
  /* the belly: a bowed lip of wax hanging under the shelf (the tile above is the comb tile; this is the weight of it) */
  for (let i = 1; i < w - 1; i++) { const u = Math.sin(Math.PI * (i + 0.5) / w), d = Math.max(1, Math.round(depth * (0.35 + 0.65 * u)));
    for (let j = 0; j < d; j++) { const lastRow = j === d - 1, hex = ((i + (j >> 1) % 2 * 3) % 6) === 0;
      R(g, lastRow ? COMB[0] : hex ? COMB[1] : j === 0 ? COMB[2] : (counting && k > 0.5 && j > d - 3) ? '#c8681e' : COMB[2 + (hash(i, j) % 5 === 0 ? 1 : 0)], X + i, bot + j, 1, 1); }
    if (counting && d > 3 && hash(i + c.x0, 5) % 4 === 0) R(g, H[4], X + i, bot + d - 2, 1, 1); }   /* wax glistening where it stretches */
  /* strings and beads hanging off the lip; they lengthen as it sags */
  const n = Math.max(2, Math.round(w / 14));
  for (let s = 0; s < n; s++) { const sx = X + 3 + Math.round(((s + 0.5) / n) * (w - 6)) + (hash(c.x0, s) % 3) - 1, u = Math.sin(Math.PI * (sx - x + 0.5) / w), base = bot + Math.max(1, Math.round(depth * (0.35 + 0.65 * u))), len = 2 + (hash(c.x0 + s, 2) % 4) + Math.round(k * (4 + (s % 3) * 2));
    string(g, sx, base, base + len, time, s * 4 + c.x0); R(g, H[0], sx - 1, base + len, 3, 1); R(g, H[3], sx - 1, base + len + 1, 3, 2); R(g, H[0], sx, base + len + 3, 1, 1); R(g, H[5], sx - 1, base + len + 1, 1, 1); }
  if (!counting) {   /* whole: a few seams on its face and a warm sheen along the lip */
    g.globalAlpha = 0.5; for (let q = 5; q < w - 4; q += 9 + (hash(c.x0, q) % 6)) R(g, COMB[0], x + q, y + 2 + (hash(q, c.x0) % 3), 1, 3); g.globalAlpha = 1;
    return; }
  /* counting: the top glows (amber, red in the last second), wax bleeding off the ends, drops pinching off the belly */
  g.globalAlpha = 0.14 + 0.3 * k; R(g, hot ? '#ff6b6b' : '#ffb070', X, y, w, 3); g.globalAlpha = 1;
  for (let i = 0; i < 3; i++) { const ph = (time * (0.9 + 1.8 * k) + i / 3 + c.x0 * 0.17) % 1, dx = Math.round((0.2 + 0.3 * i + (hash(c.x0, i + 8) % 20) / 100) * w), u = Math.sin(Math.PI * (dx + 0.5) / w), by = bot + Math.max(1, Math.round(depth * (0.35 + 0.65 * u))) + 4 + Math.round(k * 4);
    g.globalAlpha = 1 - ph * ph; R(g, H[3], X + dx, by + ph * 16, 2, 2 + Math.round(ph * 2)); R(g, H[5], X + dx, by + ph * 16, 1, 1); g.globalAlpha = 1; }
  if (text) { const nn = Math.max(1, Math.ceil(c.t)), col = nn >= 3 ? '#ffd36b' : nn === 2 ? '#ff9a5c' : '#ff6b6b', pop = 1 + Math.max(0, (c.t % 1) - 0.8) * 2; text(String(nn), Math.round(x + w / 2), Math.round(y - 22 - 4 * pop), col, 'center', nn === 1 ? 16 : 12); }
}

/* ---------------- a HONEY DRIP ---------------- */
/* the nub hanging under the comb/roof (3 px dark socket, amber, a gold tip): baked */
const nubSprite = () => once('dripnub', () => { const [c, g] = canvas(5, 5); R(g, H[0], 1, 0, 3, 1); R(g, H[1], 1, 1, 3, 1); R(g, H[3], 2, 1, 1, 1); R(g, H[2], 2, 2, 1, 2); R(g, H[4], 2, 3, 1, 1); R(g, H[0], 2, 4, 1, 1); return c; });
/* the bead at step s (0..7): a drop growing on a thinning neck */
const beadSprite = s => once('dripbead' + s, () => { const r = 1.4 + s * 0.42, neck = Math.max(0, 5 - Math.round(s * 0.5)), [c, g] = canvas(13, 20), cxm = 6, cyb = 2 + neck + Math.round(r);
  for (let j = 0; j < neck; j++) { const w = s >= 6 ? 1 : j < 2 ? 3 : 1 + (s < 3 ? 1 : 0); R(g, H[1], cxm - (w >> 1), j, w, 1); if (w > 1) R(g, H[3], cxm, j, 1, 1); }
  for (let y = -Math.ceil(r); y <= Math.ceil(r); y++) for (let x = -Math.ceil(r); x <= Math.ceil(r); x++) { const d = Math.hypot(x, y * 0.92); if (d > r) continue; const edge = d > r - 1.05, lit = x + y < -r * 0.45 && !edge, shade = x + y > r * 0.5 && !edge;
    R(g, edge ? H[0] : lit ? H[4] : shade ? H[2] : H[3], cxm + x, cyb + y, 1, 1); }
  R(g, H[5], cxm - Math.round(r * 0.45), cyb - Math.round(r * 0.45), 1, 1); if (r > 2.6) R(g, H[5], cxm - Math.round(r * 0.45), cyb - Math.round(r * 0.45) + 1, 1, 1);
  return c; });
/* d = { x, y0, top, st: wait|swell|fall, s, y, vy }; x is the world px centre (cx already taken off), y the comb's underside row (cy taken off); tell = the swell time; glob(g, x, y, vy, time) draws the falling drop */
export function drip(g, d, X, Y, tell, time, glob, topY, cy) {
  if (topY < Y - 1) string(g, X, Math.round(topY), Y - 1, time, d.x * 5);   /* the string from the comb or the roof it hangs from */
  g.drawImage(nubSprite(), X - 2, Y - 2);
  if (d.st === 'swell') { const k = Math.min(1, d.s / tell), s = Math.min(7, Math.floor(k * 8)), wob = k > 0.8 ? Math.round(Math.sin(time * 40)) : 0;
    g.drawImage(beadSprite(s), X - 6 + wob, Y + 2 - 1);
    if (k > 0.88) { g.globalAlpha = 0.8; R(g, H[4], X, Y + 1, 1, 2); g.globalAlpha = 1; }   /* the neck about to let go */
    if (Math.floor(time * 12) % 3 === 0) R(g, H[5], X - 1, Y + 4 + Math.round(k * 4), 1, 1); }
  else if (d.st === 'fall') {
    const since = (d.y - (d.y0 * TS + 4)); if (since < 14) { g.globalAlpha = 1 - since / 14; R(g, H[4], X, Y + 1, 1, 3); R(g, H[5], X, Y + 3, 1, 1); g.globalAlpha = 1; }   /* the neck snapping back up */
    glob(g, X, d.y - cy, d.vy, time); }
}

/* ---------------- the sticky BED: the honey skin ---------------- */
export function bed(g, x, y, w, time) {
  x = Math.round(x); y = Math.round(y);
  g.globalAlpha = 0.86; R(g, H[3], x, y, w, 1); R(g, H[2], x, y + 1, w, 2); R(g, H[1], x, y + 3, w, 1); g.globalAlpha = 1;   /* the skin on the wax tiles' top */
  R(g, H[0], x, y + 4, w, 1);
  /* the sheen: pale lozenges sliding across, each its own pace */
  for (let i = 0; i < w / 20; i++) { const sp = 7 + (i % 3) * 3, px_ = ((time * sp + i * 41 + hash(x, i)) % (w + 16)) - 8; if (px_ < 0 || px_ > w - 6) continue; R(g, H[5], x + px_, y, 5, 1); R(g, H[4], x + px_ + 1, y + 1, 3, 1); }
  /* bubbles: a dome swelling, a ring, a pop */
  for (let b = 0; b < w / 26; b++) { const ph = (time * 0.33 + (hash(x, b + 4) % 100) / 100) % 1, bx = x + 6 + (hash(x, b + 9) % Math.max(1, w - 14));
    if (ph < 0.6) { const r = ph < 0.3 ? 1 : 2; R(g, H[4], bx, y - r, 2 * r, r); R(g, H[5], bx, y - r, 1, 1); R(g, H[0], bx - 1, y, 2 * r + 2, 1); }
    else if (ph < 0.68) { R(g, H[5], bx - 1, y - 2, 1, 1); R(g, H[5], bx + 3, y - 2, 1, 1); R(g, H[4], bx + 1, y - 3, 1, 1); } }
  /* threads where a heel has pulled it: short strings standing up off the skin */
  for (let s = 0; s < w / 40; s++) { const sx = x + 10 + (hash(x, s + 20) % Math.max(1, w - 20)), len = 2 + Math.round((Math.sin(time * 1.3 + s * 2.1) + 1)); g.globalAlpha = 0.7; R(g, H[4], sx, y - len, 1, len); R(g, H[5], sx, y - len, 1, 1); g.globalAlpha = 1; }
}

/* ---------------- the capped-cell wall ---------------- */
/* 96 x 64: 8 cells x 8 courses (cell 12 x 8, every other course shifted 6): capped (a pale lid), honey-filled (amber, glinting) or empty (dark); wax walls between */
const wallPat = () => once('hivewall', () => { const [c, g] = canvas(96, 64);
  R(g, '#2a1808', 0, 0, 96, 64);
  for (let row = 0; row < 8; row++) for (let col = -1; col < 9; col++) {
    const ox = col * 12 + (row & 1) * 6, oy = row * 8, h = hash(col & 7, row), kind = h % 7 < 3 ? 'cap' : h % 7 < 5 ? 'honey' : 'void';
    const body = (cx_, cy_, ww, hh, color) => { R(g, color, cx_ + 1, cy_, ww - 2, hh); R(g, color, cx_, cy_ + 1, ww, hh - 2); };
    body(ox + 1, oy + 1, 10, 6, '#4a300c');   /* the wax wall round it */
    if (kind === 'cap') { body(ox + 2, oy + 2, 8, 4, '#8a6420'); R(g, '#a8741e', ox + 3, oy + 2, 6, 1); R(g, '#c8921e', ox + 3, oy + 3, 2, 1); R(g, '#5a3c0c', ox + 3, oy + 5, 6, 1); R(g, '#3a2208', ox + 5, oy + 3, 2, 1); }
    else if (kind === 'honey') { body(ox + 2, oy + 2, 8, 4, '#a8600a'); R(g, '#d8901a', ox + 2, oy + 3, 8, 2); R(g, '#f0b434', ox + 3, oy + 3, 3, 1); R(g, '#ffd36b', ox + 3, oy + 3, 1, 1); R(g, '#6a3a06', ox + 3, oy + 5, 6, 1); }
    else { body(ox + 2, oy + 2, 8, 4, '#150a04'); R(g, '#2a1808', ox + 3, oy + 2, 6, 1); R(g, '#3a2208', ox + 3, oy + 5, 4, 1); } }
  return c; });
/* the whole wall of one chamber, baked ONCE (a pattern fill + a gradient every frame cost ~20 fps at a phone's 4x CPU); a frame is one blit of what is on screen. [c0, c1, r0, r1] = the chamber's columns / rows */
const wallSprite = (c0, c1, r0, r1) => once('hivewall' + [c0, c1, r0, r1], () => { const w = (c1 - c0 + 1) * TS, h = (r1 - r0 + 1) * TS, [c, g] = canvas(w, h, true); g.imageSmoothingEnabled = false;
  const pat = g.createPattern(wallPat(), 'repeat'); pat.setTransform(new DOMMatrix().translate(-((c0 * TS) % 96), -((r0 * TS) % 64))); g.fillStyle = pat; g.fillRect(0, 0, w, h);
  /* honey-stained toward the bed (a gradient up the wall from the floor) */
  const top = Math.max(0, h - 160), gr = g.createLinearGradient(0, top, 0, h); gr.addColorStop(0, 'rgba(216,144,26,0)'); gr.addColorStop(1, 'rgba(240,180,52,0.34)'); g.fillStyle = gr; g.fillRect(0, top, w, h - top);
  return c; });
export function hiveWall(g, c0, c1, r0, r1, cx, cy, VW, VH) {
  const wx = c0 * TS - cx, wy = r0 * TS - cy, w = (c1 - c0 + 1) * TS, h = (r1 - r0 + 1) * TS, x0 = Math.max(0, wx), y0 = Math.max(0, wy), x1 = Math.min(VW, wx + w), y1 = Math.min(VH, wy + h); if (x1 <= x0 || y1 <= y0) return;
  g.drawImage(wallSprite(c0, c1, r0, r1), Math.round(x0 - wx), Math.round(y0 - wy), Math.round(x1 - x0), Math.round(y1 - y0), Math.round(x0), Math.round(y0), Math.round(x1 - x0), Math.round(y1 - y0));
}

/* ---------------- a smoke pot bursting ---------------- */
export function bloom(g, x, y, r, age) {
  if (age > 0.42) return; const a = age / 0.42; x = Math.round(x); y = Math.round(y);
  g.globalAlpha = (1 - a) * 0.85; g.strokeStyle = '#f4f6f8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 4 + a * r * 0.8, 0, 7); g.stroke(); g.lineWidth = 1;   /* the shock ring */
  if (a < 0.35) { g.globalAlpha = (1 - a / 0.35) * 0.9; g.fillStyle = '#fff6e0'; g.beginPath(); g.arc(x, y, 7 * (1 - a / 0.35) + 2, 0, 7); g.fill(); }   /* the flash */
  g.globalAlpha = 1 - a;
  for (let i = 0; i < 9; i++) { const an = i * 0.7 + 0.3, sp = 20 + (i % 3) * 14, px_ = x + Math.cos(an) * sp * a * 1.4, py = y + Math.sin(an) * sp * a * 1.1 + 30 * a * a; R(g, i % 3 === 0 ? '#d09a5a' : i % 3 === 1 ? '#8a5030' : '#ffc860', px_, py, i % 2 ? 2 : 1, i % 2 ? 2 : 1); }   /* shards of the clay, and ember specks */
  g.globalAlpha = 1;
}
