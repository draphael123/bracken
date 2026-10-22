// kingswood_areas.js - THE KING'S HUNTING WOOD's FIVE AREAS, each with its own back wall (claude/kingswood2art, Sonnet art pass; the Rootway's rootway_areas.js is the model). Art only: nothing here is a
// tile, an entity, a hitbox or a number - every picture is anchored to the world's own coordinates (the sections of src/kingswood.js) and drawn once a frame from main.js, behind the tiles.
//   THE ROYAL ROAD          (0-122)    the court's road: banners on tall poles down the verge with lantern strings between them, the milestone and toll posts, THE CHECKPOINT's timber gate frame over
//                                      the road, the GATEHOUSE's towers behind the captain's yard (arrow slits, merlons, the court's standards)
//   THE HUNTING STANDS      (122-206)  the King's hunting towers: lashed timber legs and braces, three decks, shingled roofs, ladders, stag banners; the hounds' meadow in front - stakes and nets, hay, a spear rack,
//                                      bunting strung between the towers
//   THE CAGE GROVE          (206-306)  the great trunks of the grove, hung with the King's catch: iron cages on chains at every height, wasps' paper nests, bone chimes, rags, moss, a canopy of red leaves
//   THE COURT'S PROCESSION  (306-416)  a colonnade of great red oaks over the carpet road, long crimson banners hung between them, lantern chains, the court's stands with their bunting, and at its end THE COURT
//                                      GATE's stone piers and arch round the portcullis
//   THE KING'S HALL         (416-490)  the inside of his hall: carved timber panels trimmed in gold, tall arched windows with the sunset in them, boughs for rafters with the sky and the oak's crown in the gaps, antlers
// Baked once, in chunks of 256 px, the first time a chunk comes into view (a frame is a few drawImage calls); lights are one baked glow, drawn additive.   drawAreas(g, cx, cy, VW, VH, time, dY, full, L)
import { mulberry } from '../px.js';
import { cageSprite, CREST as W } from './kingswood_props.js';
import { hash } from './kingswood_tiles.js';
import * as FX from './gorm_fx.js';

const TS = 16, R = Math.round, CH = 256;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const pxl = (g, x, y, c) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); };

/* ---------------- shared pieces ---------------- */
/* a great trunk: ridged bark, a lit left edge, furrows, knots, a root flare at its foot (if rooted), moss patches */
function trunk(g, cx, top, bot, w, seed, pal, rooted = true) {
  const x0 = R(cx - w / 2), r = mulberry(seed);
  for (let y = top; y < bot; y += 2) { const sw = Math.round(Math.sin(y * 0.02 + seed) * 2); rc(g, x0 + sw, y, w, 2, pal[1]); rc(g, x0 + sw, y, 2, 2, pal[3]); rc(g, x0 + sw + w - 3, y, 3, 2, pal[0]); }
  for (let x = x0 + 4; x < x0 + w - 3; x += 4 + ((r() * 5) | 0)) { const s0 = top + ((r() * 40) | 0); for (let y = s0; y < bot - 4; y += 2) { if (r() < 0.06) { y += 6 + ((r() * 14) | 0); continue; } rc(g, x + Math.round(Math.sin(y * 0.03 + x) * 1.5), y, 1, 2, r() < 0.5 ? pal[0] : pal[2]); } }
  for (let i = 0; i < Math.max(2, ((bot - top) / 120) | 0); i++) { const kx = x0 + 6 + ((r() * (w - 12)) | 0), ky = top + 20 + ((r() * (bot - top - 40)) | 0), kr = 3 + ((r() * 3) | 0);
    for (let dy = -kr; dy <= kr; dy++) for (let dx = -kr; dx <= kr; dx++) { const d = Math.hypot(dx, dy * 1.3); if (d > kr) continue; pxl(g, kx + dx, ky + dy, d < kr * 0.4 ? pal[0] : d < kr * 0.75 ? pal[1] : pal[3]); } }
  for (let i = 0; i < 4; i++) { const my = top + ((r() * (bot - top - 30)) | 0), mx = x0 + ((r() * (w - 8)) | 0); rc(g, mx, my, 5 + ((r() * 5) | 0), 3, '#4a5a2a'); rc(g, mx, my, 4, 1, '#7a9a3a'); }
  if (rooted) for (const s of [-1, 1]) for (let i = 0; i < 18; i++) { const t = i / 18, rx = s < 0 ? x0 - t * 16 : x0 + w + t * 16 - 6, ry = bot - 20 + t * t * 20; rc(g, rx - (s < 0 ? 0 : 0), ry - 6 * (1 - t), 6, 6 * (1 - t) + 4, pal[1]); rc(g, rx, ry - 6 * (1 - t), 2, 3, pal[3]); }
}
const TRUNKPAL = [['#1a0c10', '#3a1c1c', '#52281e', '#74382a'], ['#1c1014', '#40201e', '#58301f', '#7e4228']];
/* a banner on a pole (standing) or a long cloth hung from a bough: v 0 crimson / 1 green */
function banner(g, x, top, w, h, v, hung) {
  const cl = v ? ['#0e2a14', '#1f4a2a', '#3a7a40'] : [W.redD, W.red, W.redL];
  if (hung) { rc(g, x - w / 2 - 2, top, w + 4, 3, '#3a2412'); rc(g, x - w / 2 - 2, top, w + 4, 1, W.woodL); rc(g, x - w / 2 - 3, top, 2, 3, W.gold); rc(g, x + w / 2 + 1, top, 2, 3, W.gold); }
  else { rc(g, x - 1, top - 4, 3, h + 40, '#1e1208'); rc(g, x - 1, top - 4, 2, h + 40, W.wood); rc(g, x - 2, top - 6, 5, 3, W.gold); rc(g, x - w / 2 - 2, top, w + 4, 2, '#3a2412'); rc(g, x - w / 2 - 3, top - 1, 2, 4, W.gold); rc(g, x + w / 2 + 1, top - 1, 2, 4, W.gold); }
  const y0 = top + 3; rc(g, x - w / 2, y0, w, h, cl[0]); rc(g, x - w / 2 + 1, y0, w - 2, h - 2, cl[1]); rc(g, x - w / 2 + 1, y0, 3, h - 2, cl[2]);
  for (let k = 0; k < 3; k++) rc(g, x - w / 2 + 6 + k * Math.max(4, w / 4), y0 + 2, 1, h - 6, cl[0]);
  rc(g, x - w / 2, y0, w, 2, W.gold); rc(g, x - w / 2, y0 + 2, w, 1, W.goldD); rc(g, x - w / 2, y0 + h - 3, w, 1, W.gold);
  for (const tx of [x - w / 2 + 1, x + w / 2 - 3]) for (let t = 0; t < 3; t++) rc(g, tx, y0 + h - 2, 2, 3 + (t % 2), cl[0]);
  const ey = y0 + (h >> 1) - 2;
  if (!v) { rc(g, x - 5, ey, 10, 5, W.gold); rc(g, x - 5, ey, 10, 1, W.goldL); rc(g, x - 5, ey - 4, 2, 4, W.gold); rc(g, x - 1, ey - 6, 2, 6, W.gold); rc(g, x + 3, ey - 4, 2, 4, W.gold); rc(g, x - 4, ey + 7, 8, 7, '#1e0e0a'); rc(g, x - 3, ey + 9, 2, 2, W.goldL); rc(g, x + 1, ey + 9, 2, 2, W.goldL); }
  else { for (const s of [-1, 1]) for (let k = 0; k < 10; k++) rc(g, x + s * (2 + k * 0.5) - (s > 0 ? 0 : 1), ey - k + 4, 2, 1, W.gold); rc(g, x - 4, ey + 4, 8, 6, W.gold); rc(g, x - 3, ey + 6, 2, 2, '#0e2a14'); rc(g, x + 1, ey + 6, 2, 2, '#0e2a14'); }
}
const lantern = (g, x, y) => { rc(g, x, y - 4, 1, 4, '#1e1208'); rc(g, x - 2, y, 5, 6, '#1e1208'); rc(g, x - 1, y + 1, 3, 4, '#ffc474'); rc(g, x - 1, y + 1, 3, 1, '#fff0a8'); rc(g, x - 2, y, 5, 1, '#4a4a54'); };
function stringLine(g, x0, y0, x1, y1, sag, lamps, seed) {
  const n = 28; let ppx = x0, ppy = y0;
  for (let i = 1; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * sag; g.strokeStyle = '#2a1a10'; g.lineWidth = 1; g.beginPath(); g.moveTo(ppx + 0.5, ppy + 0.5); g.lineTo(x + 0.5, y + 0.5); g.stroke(); ppx = x; ppy = y; }
  for (let i = 1; i <= lamps; i++) { const t = i / (lamps + 1), x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * sag; if (seed % 2) { rc(g, x - 1, y, 6, 4, i % 2 ? W.red : W.gold); rc(g, x - 1, y, 6, 1, W.goldL); rc(g, x + 1, y + 4, 2, 2, i % 2 ? W.red : W.gold); } else lantern(g, R(x), R(y)); }
}
/* a lashed-timber hunting tower: four legs, cross-braces, decks, a shingled roof, a ladder, a stag banner */
function tower(g, cx, base, h, w, seed) {
  const x0 = cx - w / 2, r = mulberry(seed), dkY = [base - h * 0.34, base - h * 0.66, base - h * 0.92];
  for (const lx of [x0, x0 + w - 5]) { rc(g, lx, base - h, 5, h, '#1e1208'); rc(g, lx + 1, base - h, 3, h, '#5a3a1e'); rc(g, lx + 1, base - h, 1, h, '#8a5a32'); for (let y = base - h + 10; y < base; y += 22) { rc(g, lx - 1, y, 7, 2, W.rope); rc(g, lx - 1, y + 2, 7, 1, W.ropeD); } }
  for (let k = 0; k < 3; k++) { const y0 = k === 0 ? base : dkY[k - 1], y1 = dkY[k]; for (let t = 0; t <= 20; t++) { const f = t / 20; rc(g, x0 + 3 + (w - 9) * f, y0 + (y1 - y0) * f, 3, 3, k % 2 ? '#3a2412' : '#5a3a1e'); rc(g, x0 + 3 + (w - 9) * (1 - f), y0 + (y1 - y0) * f, 3, 3, '#3a2412'); } }
  for (const dy of dkY) { rc(g, x0 - 6, dy, w + 12, 5, '#1e1208'); rc(g, x0 - 5, dy, w + 10, 4, '#7a4e28'); rc(g, x0 - 5, dy, w + 10, 1, '#c08a50'); for (let x = x0 - 3; x < x0 + w + 6; x += 8) rc(g, x, dy + 1, 1, 3, '#3a2412'); rc(g, x0 - 5, dy - 7, 2, 7, '#3a2412'); rc(g, x0 + w + 3, dy - 7, 2, 7, '#3a2412'); rc(g, x0 - 5, dy - 7, w + 10, 1, '#3a2412'); }
  /* the roof: a pointed shingled cap and a lookout under it */
  const ry = dkY[2] - 7; rc(g, x0 - 2, ry - 12, w + 4, 12, '#2a1a10'); rc(g, x0, ry - 12, w, 11, '#6a4424');
  for (let i = 0; i < 14; i++) { const k = i / 13, ww = (w + 14) * (1 - k * 0.92), yy = ry - 12 - i * 2; rc(g, cx - ww / 2, yy, ww, 2, i % 2 ? '#7a2a1a' : '#a83a2a'); rc(g, cx - ww / 2, yy, ww, 1, i % 2 ? '#a83a2a' : '#c9463d'); }
  rc(g, cx - 1, ry - 40, 2, 12, '#1e1208'); rc(g, cx + 1, ry - 40, 9, 5, W.red); rc(g, cx + 1, ry - 40, 9, 1, W.gold);
  rc(g, cx - 5, ry - 11, 10, 9, '#0e0808'); rc(g, cx - 4, ry - 10, 8, 2, '#ffc474');   /* a lit slit */
  /* the ladder */
  const lx = x0 + w / 2 - 3; rc(g, lx, dkY[0], 1, base - dkY[0], '#3a2412'); rc(g, lx + 5, dkY[0], 1, base - dkY[0], '#3a2412'); for (let y = dkY[0] + 3; y < base; y += 5) rc(g, lx, y, 6, 1, '#6a4424');
  /* a stag banner on the first deck's rail */
  banner(g, x0 + w + 12, dkY[1] - 22, 12, 22, 1, true);
}
/* a gatehouse: two towers and the arch between, merlons, arrow slits, standards */
function gatehouse(g, cx, base, tw, th, gw, seed) {
  const P = ['#17121a', '#2a2228', '#463a3a', '#66564c', '#8a7660'];
  for (const s of [-1, 1]) { const x0 = s < 0 ? cx - gw / 2 - tw : cx + gw / 2;
    rc(g, x0, base - th, tw, th, P[1]); rc(g, x0 + 2, base - th, tw - 4, th, P[2]); rc(g, x0 + 2, base - th, 3, th, P[3]); rc(g, x0 + tw - 6, base - th, 4, th, P[1]);
    for (let y = base - th + 6; y < base; y += 8) { rc(g, x0, y, tw, 1, P[1]); for (let x = x0 + ((y / 8) & 1 ? 8 : 0); x < x0 + tw; x += 16) rc(g, x, y, 1, 8, P[1]); }
    for (let x = x0; x < x0 + tw; x += 10) { rc(g, x, base - th - 8, 7, 8, P[2]); rc(g, x, base - th - 8, 7, 2, P[3]); }
    for (const sy of [th * 0.35, th * 0.62]) { rc(g, x0 + tw / 2 - 2, base - sy, 4, 12, '#0a0608'); rc(g, x0 + tw / 2 - 1, base - sy + 2, 2, 3, '#ffc474'); }
    rc(g, x0 - 3, base - th + 14, tw + 6, 3, P[1]); rc(g, x0 - 3, base - th + 14, tw + 6, 1, P[3]); }
  /* the arch: the deep dark of the way through, a stone lintel, the court's crest over it */
  rc(g, cx - gw / 2, base - th * 0.78, gw, th * 0.78, '#0a0608'); for (let i = 0; i < 18; i++) { const w = gw * Math.sqrt(1 - Math.pow((18 - i) / 18, 2)); rc(g, cx - w / 2 - 3, base - th * 0.78 - i, w + 6, 1, P[2]); }
  rc(g, cx - gw / 2 - 5, base - th * 0.78 - 4, gw + 10, 4, P[3]); rc(g, cx - 7, base - th * 0.78 - 14, 14, 6, W.gold); rc(g, cx - 7, base - th * 0.78 - 14, 14, 1, W.goldL); rc(g, cx - 5, base - th * 0.78 - 19, 2, 5, W.gold); rc(g, cx - 1, base - th * 0.78 - 21, 2, 7, W.gold); rc(g, cx + 3, base - th * 0.78 - 19, 2, 5, W.gold);
  for (const s of [-1, 1]) { const x = cx + s * (gw / 2 + tw * 0.5); rc(g, x - 1, base - th - 36, 2, 30, '#1e1208'); rc(g, x + (s > 0 ? 1 : -9), base - th - 36, 9, 7, W.red); rc(g, x + (s > 0 ? 1 : -9), base - th - 36, 9, 1, W.gold); }
}
/* the court's own gate frame over the road: two great posts, a lintel with the crest, a toll board and the lamps */
function gateFrame(g, cx, base, w, h) {
  for (const s of [-1, 1]) { const x = cx + s * w / 2 - 4; rc(g, x, base - h, 9, h, '#1e1208'); rc(g, x + 1, base - h, 7, h, W.wood); rc(g, x + 1, base - h, 2, h, W.woodL); rc(g, x + 6, base - h, 2, h, W.woodD);
    for (let y = base - h + 8; y < base - 4; y += 16) { rc(g, x, y, 9, 2, W.iron); rc(g, x, y, 9, 1, W.ironL); } rc(g, x - 1, base - 6, 11, 6, '#463a3a'); rc(g, x - 1, base - 6, 11, 1, '#8a7660'); }
  rc(g, cx - w / 2 - 8, base - h - 4, w + 16, 12, '#1e1208'); rc(g, cx - w / 2 - 7, base - h - 3, w + 14, 10, W.wood); rc(g, cx - w / 2 - 7, base - h - 3, w + 14, 2, W.woodL); rc(g, cx - w / 2 - 7, base - h + 4, w + 14, 3, W.woodD);
  rc(g, cx - 12, base - h - 10, 24, 14, W.gold); rc(g, cx - 12, base - h - 10, 24, 2, W.goldL); rc(g, cx - 12, base - h + 2, 24, 2, W.goldD); rc(g, cx - 8, base - h - 18, 3, 8, W.gold); rc(g, cx - 1, base - h - 22, 3, 12, W.gold); rc(g, cx + 5, base - h - 18, 3, 8, W.gold); rc(g, cx - 6, base - h - 6, 12, 7, '#a83a2a');
  for (const s of [-1, 1]) lantern(g, cx + s * (w / 2 - 14), base - h + 8);
}
/* a milestone / court post: a squat stone with the crown cut in it */
const stone = (g, x, base) => { rc(g, x - 6, base - 22, 13, 22, '#2a2228'); rc(g, x - 5, base - 22, 11, 21, '#66564c'); rc(g, x - 5, base - 22, 3, 21, '#8a7660'); rc(g, x - 7, base - 25, 15, 4, '#8a7660'); rc(g, x - 7, base - 25, 15, 1, '#b09a76'); rc(g, x - 2, base - 15, 5, 3, '#2a2228'); rc(g, x - 1, base - 18, 1, 3, '#2a2228'); rc(g, x + 1, base - 18, 1, 3, '#2a2228'); };
const hive = (g, x, y, s) => { for (let dy = -s * 1.3; dy <= s * 1.3; dy++) { const w = Math.round(s * Math.sqrt(1 - (dy * dy) / (s * s * 1.7))); rc(g, x - w, y + dy, w * 2, 1, ((dy + 99) | 0) % 3 === 0 ? '#8a7a4a' : '#b8a468'); } rc(g, x - s + 1, y - s, 2, s, '#d8c88a'); rc(g, x - 2, y + s, 5, 3, '#1e1208'); rc(g, x - 1, y + s + 1, 3, 2, '#0a0608'); };
const chimes = (g, x, y, n, seed) => { rc(g, x - 5, y, 11, 2, '#3a2412'); for (let i = 0; i < n; i++) { const cx = x - 4 + i * 4, l = 8 + ((hash(seed, i) >> 3) % 10); rc(g, cx, y + 2, 1, l, W.ropeD); rc(g, cx - 1, y + 2 + l, 3, 5, '#e8dcc0'); rc(g, cx - 1, y + 2 + l, 3, 1, '#fff6e0'); } };

/* ============================ THE BURNING WOOD and THE KING'S GLADE (claude/gorm2art): the wood the court fired, behind the run; the ash-lit clearing round his oak ============================ */
const CHAR = ['#0e0606', '#1e0e0a', '#33160e', '#5a2412'];
/* a charred trunk: black bark with a fire-lit left edge, glowing cracks, a burnt crown stump (and, for some, a lick of flame at the break) */
function charTrunk(g, cx, top, bot, w, seed, lit) {
  const x0 = R(cx - w / 2), r = mulberry(seed);
  for (let y = top; y < bot; y += 2) { const sw = Math.round(Math.sin(y * 0.03 + seed) * 2); rc(g, x0 + sw, y, w, 2, CHAR[1]); rc(g, x0 + sw, y, 2, 2, lit ? '#8a3414' : CHAR[3]); rc(g, x0 + sw + w - 3, y, 3, 2, CHAR[0]); }
  for (let x = x0 + 3; x < x0 + w - 2; x += 3 + ((r() * 4) | 0)) { const s0 = top + ((r() * 60) | 0); for (let y = s0; y < bot - 6; y += 2) { if (r() < 0.07) { y += 8 + ((r() * 18) | 0); continue; } rc(g, x + Math.round(Math.sin(y * 0.04 + x) * 1.2), y, 1, 2, r() < 0.7 ? CHAR[0] : (r() < 0.5 ? '#e0601a' : '#a8301a')); } }
  for (const s of [-1, 1]) for (let i = 0; i < 12; i++) { const t = i / 12, rx = s < 0 ? x0 - t * 12 : x0 + w + t * 12 - 5, ry = bot - 14 + t * t * 14; rc(g, rx, ry - 5 * (1 - t), 5, 5 * (1 - t) + 4, CHAR[1]); }
}
/* a burnt canopy mass: black leaf clumps, fire along their undersides, a few leaves still red on the far side */
function burntCrown(g, cx, cy, rx, ry, seed) {
  const r = mulberry(seed);
  for (let i = 0; i < 18; i++) { const a = r() * 6.283, d = r(), x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d, w = 14 + ((r() * 18) | 0), h = 8 + ((r() * 8) | 0);
    rc(g, x - w / 2, y - h / 2, w, h, CHAR[(i % 2) ? 1 : 2]); rc(g, x - w / 2 + 1, y - h / 2, w - 2, 1, '#7a2a10'); if (r() < 0.5) rc(g, x - w / 2 + 2, y + h / 2 - 1, w - 4, 2, r() < 0.5 ? '#e0601a' : '#a8301a');
    for (let k = 0; k < 4; k++) rc(g, x - w / 2 + ((r() * w) | 0), y + ((r() * h) | 0), 2, 1, r() < 0.5 ? '#ff9a3c' : '#c9463d'); }
}
const smokeBand = (g, x, y, w, h, a) => { g.save(); g.globalAlpha = a; for (let i = 0; i < w / 18; i++) { rc(g, x + i * 18 + ((i * 7) % 6), y + ((i * 5) % 9), 24 + ((i * 11) % 14), h - ((i * 3) % 7), '#241410'); } g.restore(); };
const skyGlow = (g, x, w, y0, y1, a0) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(60,10,8,0)'); gr.addColorStop(0.55, 'rgba(190,60,20,' + (a0 * 0.55).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(255,140,40,' + a0.toFixed(2) + ')'); g.fillStyle = gr; g.fillRect(x, y0, w, y1 - y0); };
/* ============================ the five areas: bands, base layers and feature lists ============================ */
const surf = (L, tx, from = 0) => { for (let y = from; y < L.H; y++) if (L.grid[y * L.W + tx] === 1) return y * TS; return L.H * TS; };
const AREAS = [
  { id: 'road', x0: 0, x1: 122, y0: 288, y1: 656, alpha: 0.9,
    feats(L) { const out = [], r = mulberry(7101);
      /* banners on tall poles down the verge, a lantern string between each pair, milestones between */
      for (let x = 8; x < 122; x += 11 + ((r() * 3) | 0)) { const by = surf(L, x); out.push({ x: x * TS, w: 40, draw: (g, ox) => banner(g, x * TS, by - 74, 18, 30, (x / 11 | 0) % 3 === 2 ? 1 : 0, false) }); }
      for (let x = 8; x < 108; x += 22) { const x1 = x + 11, y0 = surf(L, x) - 70, y1 = surf(L, Math.min(x1, 121)) - 70; if (Math.abs(y0 - y1) < 40) out.push({ x: x * TS, w: 11 * TS + 8, draw: g => stringLine(g, x * TS, y0, x1 * TS, y1, 14, 3, x) }); }
      for (const x of [13, 29, 70, 104]) out.push({ x: x * TS - 12, w: 24, draw: g => stone(g, x * TS, surf(L, x)) });
      /* the checkpoint's gate frame, on the road before its wall */
      out.push({ x: 42 * TS, w: 11 * TS, draw: g => gateFrame(g, 47 * TS, surf(L, 47), 8 * TS, 6 * TS) });
      /* the gatehouse behind the captain's yard */
      out.push({ x: 93 * TS, w: 24 * TS, draw: g => gatehouse(g, 104 * TS, surf(L, 104), 6 * TS, 9 * TS, 5 * TS, 3) });
      return out; },
    lights: [[47 * TS - 56, 36 * TS - 30, 40, 0.22], [47 * TS + 56, 36 * TS - 30, 40, 0.22], [104 * TS, 24 * TS, 46, 0.2], [96 * TS, 27 * TS, 30, 0.14]] },
  { id: 'stands', x0: 122, x1: 206, y0: 224, y1: 656, alpha: 0.88,
    feats(L) { const out = [], r = mulberry(7202);
      for (const [x, h, w] of [[131, 170, 40], [160, 210, 46], [189, 190, 42]]) out.push({ x: x * TS - w, w: w * 2 + 30, draw: g => tower(g, x * TS, 39 * TS, h, w, x) });
      for (const [a, b, s] of [[131, 160, 0], [160, 189, 1]]) out.push({ x: a * TS, w: (b - a) * TS, draw: g => stringLine(g, a * TS, 39 * TS - 160, b * TS, 39 * TS - 195, 18, 6, s) });
      /* the meadow: stakes with nets, hay stacks, a spear rack, long grass */
      for (let x = 126; x < 204; x += 5 + ((r() * 7) | 0)) { const k = (r() * 4) | 0, by = Math.min(surf(L, x), 39 * TS); out.push({ x: x * TS - 14, w: 30, draw: g => {
        if (k === 0) { rc(g, x * TS - 1, by - 22, 3, 22, '#3a2412'); rc(g, x * TS - 1, by - 22, 1, 22, '#8a5a32'); rc(g, x * TS + 11, by - 22, 3, 22, '#3a2412'); for (let q = 0; q < 6; q++) { rc(g, x * TS + 1, by - 20 + q * 3, 10, 1, '#6a5a3a'); rc(g, x * TS + 1 + q * 2, by - 20, 1, 16, '#6a5a3a'); } }
        else if (k === 1) { for (let dy = 0; dy < 12; dy++) { const w = 11 - dy * 0.4 + (dy < 2 ? -3 : 0); rc(g, x * TS + 6 - w, by - 12 + dy, w * 2, 1, dy % 3 === 0 ? '#a8924a' : '#c9aa5a'); } rc(g, x * TS + 5, by - 14, 2, 2, '#a8924a'); }
        else if (k === 2) { rc(g, x * TS - 2, by - 26, 18, 2, '#3a2412'); rc(g, x * TS - 2, by - 8, 18, 2, '#3a2412'); for (let q = 0; q < 4; q++) { rc(g, x * TS + q * 5, by - 34 - (q % 2) * 3, 1, 28, '#5a3a1e'); rc(g, x * TS - 1 + q * 5, by - 38 - (q % 2) * 3, 3, 5, '#c0c0c8'); } }
        else { for (let q = 0; q < 9; q++) { rc(g, x * TS - 6 + q * 3, by - 5 - (hash(x, q) % 5), 1, 5 + (hash(x, q) % 5), q % 2 ? '#8a7a2a' : '#c9a83a'); } } } }); }
      return out; },
    lights: [[131 * TS, 39 * TS - 150, 30, 0.18], [160 * TS, 39 * TS - 192, 32, 0.18], [189 * TS, 39 * TS - 172, 30, 0.18]] },
  { id: 'grove', x0: 206, x1: 306, y0: 0, y1: 520, alpha: 0.9,
    feats(L) { const out = [], r = mulberry(7303);
      for (let x = 210; x < 306; x += 13 + ((r() * 5) | 0)) { const w = 22 + ((r() * 20) | 0), by = Math.min(surf(L, x), 30 * TS); out.push({ x: x * TS - w - 20, w: w * 2 + 40, draw: g => trunk(g, x * TS, 0, by + 4, w, x * 7, TRUNKPAL[x & 1], true) }); }
      /* the King's catch: cages on chains at every height between the trunks, wasp nests on the boughs, bone chimes and rags */
      for (let x = 208; x < 304; x += 6 + ((r() * 5) | 0)) { const y = 40 + ((r() * 220) | 0), cl = 14 + ((r() * 40) | 0), k = (r() * 6) | 0;
        out.push({ x: x * TS - 24, w: 48, draw: g => {
          if (k < 3) { rc(g, x * TS - 3, y - 70, 7, 6, '#3a2412'); for (let q = y - 64; q < y; q += 3) { rc(g, x * TS, q, 3, 2, '#1e1e26'); rc(g, x * TS + 1, q, 1, 2, '#9a9aa6'); } g.drawImage(cageSprite(false), x * TS - 20, y - 4); }
          else if (k === 3) { rc(g, x * TS - 8, y, 24, 5, '#3a1c12'); rc(g, x * TS - 8, y, 24, 1, '#74382a'); hive(g, x * TS + 4, y + 14, 9); }
          else if (k === 4) chimes(g, x * TS, y, 4, x);
          else { rc(g, x * TS, y, 1, cl, W.ropeD); rc(g, x * TS - 2, y + cl, 6, 9, '#7a2a1a'); rc(g, x * TS - 2, y + cl, 6, 1, '#a83a2a'); } } }); }
      /* a canopy of red leaves overhead and hanging moss */
      for (let x = 206 * TS; x < 306 * TS; x += 26 + ((r() * 24) | 0)) { const y = -6 + ((r() * 40) | 0), rr = 22 + ((r() * 22) | 0); out.push({ x: x - rr * 1.4, w: rr * 3, draw: g => { for (let i = 0; i < rr * 5; i++) { const h = hash(x, i), a = (h % 628) / 100, d = ((h >> 8) % 100) / 100 * rr; rc(g, x + Math.cos(a) * d * 1.4 - 2, y + Math.sin(a) * d * 0.7, 4, 3, ['#7a2a1a', '#a83a2a', '#c9463d', '#e07a30'][(h >> 16) % 4]); } } }); }
      return out; },
    lights: [] },
  { id: 'procession', x0: 306, x1: 416, y0: 0, y1: 250, alpha: 0.9,
    feats(L) { const out = [], r = mulberry(7404);
      for (let x = 312; x < 408; x += 16) { const w = 22 + ((r() * 10) | 0); out.push({ x: x * TS - w - 20, w: w * 2 + 40, draw: g => trunk(g, x * TS, 0, 14 * TS + 2, w, x * 3, TRUNKPAL[(x / 16) & 1], true) }); }
      for (let x = 318; x < 400; x += 12) out.push({ x: x * TS - 20, w: 40, draw: g => banner(g, x * TS, 28 + ((x * 5) % 24), 20, 62, ((x / 12) | 0) % 3 === 1 ? 1 : 0, true) });
      for (let x = 312; x < 404; x += 24) out.push({ x: x * TS, w: 12 * TS + 8, draw: g => stringLine(g, x * TS, 20, (x + 12) * TS, 20, 16, 4, x) });
      /* the court's stands' bunting (386-396 / 412-418) */
      out.push({ x: 384 * TS, w: 14 * TS, draw: g => stringLine(g, 386 * TS, 11 * TS - 34, 396 * TS, 11 * TS - 34, 10, 5, 1) });
      /* THE COURT GATE: stone piers, the arch, the crown (the portcullis is a tile column at 410) */
      out.push({ x: 404 * TS, w: 12 * TS, draw: g => { const cx = 410 * TS + 8, base = 14 * TS;
        for (const s of [-1, 1]) { const x0 = cx + s * 38 - 12; rc(g, x0, 0, 24, base, '#2a2228'); rc(g, x0 + 2, 0, 20, base, '#66564c'); rc(g, x0 + 2, 0, 5, base, '#8a7660'); rc(g, x0 + 18, 0, 4, base, '#463a3a'); for (let y = 8; y < base; y += 10) rc(g, x0, y, 24, 1, '#2a2228'); rc(g, x0 - 3, 40, 30, 5, '#8a7660'); rc(g, x0 - 3, 40, 30, 1, '#b09a76'); }
        rc(g, cx - 52, 18, 104, 10, '#463a3a'); rc(g, cx - 52, 18, 104, 2, '#8a7660'); rc(g, cx - 16, 6, 32, 14, W.gold); rc(g, cx - 16, 6, 32, 2, W.goldL); rc(g, cx - 12, -2, 4, 8, W.gold); rc(g, cx - 2, -6, 4, 12, W.gold); rc(g, cx + 8, -2, 4, 8, W.gold); rc(g, cx - 10, 10, 20, 7, '#a83a2a'); rc(g, cx - 10, 10, 20, 1, W.goldL);
        for (const s of [-1, 1]) lantern(g, cx + s * 20, 34); } });
      return out; },
    lights: [[410 * TS + 8, 34, 50, 0.22]] },
  { id: 'hall', x0: 416, x1: 490, y0: 0, y1: 240, alpha: 0.96,
    feats(L) { const out = [], r = mulberry(7505);
      /* the back wall: carved timber panels trimmed in gold, ranks of them */
      out.push({ x: 416 * TS, w: 74 * TS, draw: g => { for (let x = 416 * TS; x < 490 * TS; x += 28) { rc(g, x, 24, 28, 200, '#241418'); rc(g, x + 1, 24, 26, 200, ((x / 28) | 0) % 2 ? '#32202a' : '#2a1820'); rc(g, x + 1, 24, 2, 200, '#4a2e3a'); rc(g, x + 25, 24, 2, 200, '#140a10'); rc(g, x + 5, 40, 18, 150, '#1c1016'); rc(g, x + 5, 40, 18, 1, '#e0b040'); rc(g, x + 5, 189, 18, 1, '#8a6a20'); for (let y = 54; y < 186; y += 14) { rc(g, x + 8, y, 12, 1, '#463648'); } } } });
      /* the rafters: boughs for tie-beams, kingposts, braces, with gaps of sky above */
      out.push({ x: 416 * TS, w: 74 * TS, draw: g => { for (let x = 418 * TS; x < 490 * TS; x += 8 * TS) { rc(g, x - 4, 0, 8, 30, '#1c1014'); rc(g, x - 3, 0, 6, 30, '#3a1c1c'); rc(g, x - 3, 0, 2, 30, '#5a2a22'); }
        for (let x = 416 * TS; x < 490 * TS; x += 16) { const k = (x / 16) & 3; if (k === 0) { rc(g, x, 24, 16, 6, '#2a1218'); rc(g, x, 24, 16, 2, '#52281e'); } }
        rc(g, 416 * TS, 22, 74 * TS, 4, '#52281e'); rc(g, 416 * TS, 22, 74 * TS, 1, '#8a4a30'); rc(g, 416 * TS, 26, 74 * TS, 3, '#1a0c10'); } });
      /* the tall arched windows with the sunset in them, the court's standards between */
      for (const c of [430, 442, 454, 466, 478]) out.push({ x: c * TS - 20, w: 40, draw: g => { const cx = c * TS + 8; rc(g, cx - 14, 60, 28, 90, '#0e0810'); for (let i = 0; i < 14; i++) rc(g, cx - 14 + (14 - Math.sqrt(196 - (14 - i) * (14 - i)) | 0), 60 - 14 + i, 28 - 2 * (14 - Math.sqrt(196 - (14 - i) * (14 - i)) | 0), 1, '#0e0810');
        const gr = g.createLinearGradient(0, 50, 0, 150); gr.addColorStop(0, '#f6b060'); gr.addColorStop(0.5, '#e0703a'); gr.addColorStop(1, '#a83a2a'); g.fillStyle = gr; g.fillRect(cx - 11, 54, 22, 92);
        for (let i = 0; i < 12; i++) { const w = 22 * Math.sqrt(1 - Math.pow((12 - i) / 12, 2)); rc(g, cx - w / 2, 54 - 12 + i, w, 1, '#f6b060'); }
        rc(g, cx - 1, 46, 2, 100, '#241418'); rc(g, cx - 11, 100, 22, 2, '#241418'); rc(g, cx - 15, 148, 30, 4, '#52281e'); rc(g, cx - 15, 148, 30, 1, '#8a4a30'); } });
      for (const c of [436, 448, 460, 472, 484]) out.push({ x: c * TS - 14, w: 28, draw: g => banner(g, c * TS + 8, 34, 16, 70, c === 448 || c === 472 ? 1 : 0, true) });
      /* antlers on plaques over the dais side */
      for (const c of [424, 456, 486]) out.push({ x: c * TS - 20, w: 40, draw: g => { const cx = c * TS, y = 168; rc(g, cx - 8, y, 16, 12, '#3a2412'); rc(g, cx - 8, y, 16, 1, '#8a5a32'); for (const s of [-1, 1]) for (let k = 0; k < 16; k++) { rc(g, cx + s * (3 + k * 0.9) - (s > 0 ? 0 : 1), y - k * 0.9, 2, 2, '#cdb88a'); if (k % 5 === 3) rc(g, cx + s * (3 + k * 0.9) - (s > 0 ? 0 : 1), y - k * 0.9 - 6, 2, 6, '#e8dcc0'); } } });
      return out; },
    lights: [[430 * TS + 8, 100, 62, 0.16], [442 * TS + 8, 100, 62, 0.16], [454 * TS + 8, 100, 62, 0.16], [466 * TS + 8, 100, 62, 0.16], [478 * TS + 8, 100, 62, 0.16]] },
  { id: 'burn', x0: 490, x1: 600, y0: 0, y1: 300, alpha: 0.97,
    feats(L) { const out = [], r = mulberry(7606), X0 = 490 * TS, W = 110 * TS;
      out.push({ x: X0, w: W, draw: g => { rc(g, X0, 0, W, 300, 'rgba(26,6,4,0.5)'); skyGlow(g, X0, W, 40, 300, 0.7); smokeBand(g, X0, 0, W, 44, 0.85); smokeBand(g, X0, 30, W, 34, 0.6); smokeBand(g, X0, 84, W, 26, 0.32); } });
      /* far trunks, dim, then near ones with the fire on their faces, a burnt crown over the whole run */
      for (let x = 492; x < 598; x += 9) { const w = 10 + ((r() * 8) | 0), tx = x * TS + ((r() * 40) | 0), tp = 20 + ((r() * 30) | 0); out.push({ x: tx - w - 14, w: w * 2 + 28, draw: g => charTrunk(g, tx, tp, 14 * TS + 2, w, tx, false) }); }
      for (let x = 494; x < 598; x += 15) { const w = 18 + ((r() * 12) | 0), tx = x * TS + ((r() * 70) | 0); out.push({ x: tx - w - 14, w: w * 2 + 28, draw: g => charTrunk(g, tx, 0, 16 * TS + 8, w, tx + 3, true) }); }
      for (let x = 492; x < 600; x += 10) { const cxx = x * TS + ((r() * 60) | 0), cyy = 14 + ((r() * 40) | 0); out.push({ x: cxx - 110, w: 220, draw: g => burntCrown(g, cxx, cyy, 90, 24, cxx) }); }
      for (let x = 498; x < 600; x += 13) { const fx = x * TS + ((r() * 60) | 0); out.push({ x: fx - 10, w: 20, draw: g => { FX.flame(g, fx, 224, 'L', 0.3, fx); FX.flame(g, fx + 9, 224, 'M', 0.9, fx); } }); }
      return out; },
    lights: [510, 523, 536, 549, 562, 575, 588].map((c, i) => [c * TS + ((i * 29) % 40), 110 + ((i * 17) % 50), 90, 0.2])
  },
  { id: 'glade', x0: 600, x1: 650, y0: 0, y1: 260, alpha: 0.95,
    feats(L) { const out = [], r = mulberry(7707), X0 = 600 * TS, W = 50 * TS;
      out.push({ x: X0, w: W, draw: g => { rc(g, X0, 0, W, 260, 'rgba(26,6,4,0.3)'); skyGlow(g, X0, W, 20, 250, 0.55); smokeBand(g, X0, 0, W, 36, 0.6); smokeBand(g, X0, 28, W, 26, 0.35); } });
      for (let x = 601; x < 650; x += 8) { const w = 10 + ((r() * 10) | 0), tx = x * TS + ((r() * 40) | 0), tp = 10 + ((r() * 30) | 0); if (Math.abs(tx - (624 * TS + 8)) < 50) continue; out.push({ x: tx - w - 14, w: w * 2 + 28, draw: g => charTrunk(g, tx, tp, 14 * TS + 2, w, tx, false) }); }
      for (let x = 602; x < 650; x += 9) { const cxx = x * TS + ((r() * 50) | 0), cyy = 10 + ((r() * 30) | 0); out.push({ x: cxx - 110, w: 220, draw: g => burntCrown(g, cxx, cyy, 80, 18, cxx) }); }
      return out; },
    lights: [606, 614, 634, 644].map((c, i) => [c * TS + 8, 90 + i * 12, 100, 0.17]) },
];

/* a chunk of an area, baked the first time it is seen */
function chunk(A, ci, L) {
  return once(A.id + ':' + ci, () => {
    const X0 = A.x0 * TS + ci * CH, [c, g] = mk(CH, A.y1 - A.y0); g.translate(-X0, -A.y0);
    A.fe = A.fe || A.feats(L);
    for (const f of A.fe) if (f.x + f.w > X0 - 8 && f.x < X0 + CH + 8) f.draw(g);
    g.setTransform(1, 0, 0, 1, 0, 0);
    /* the back wall recedes: a cool wash over what was drawn, never over what is not */
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(40,20,36,0.24)'; g.fillRect(0, 0, CH, c.height);
    /* its ends fade into the next area over 8 tiles */
    g.globalCompositeOperation = 'destination-in'; const gr = g.createLinearGradient(0, 0, CH, 0), F = 8 * TS, ax0 = A.x0 * TS, ax1 = A.x1 * TS;
    for (let i = 0; i <= 8; i++) { const wx = X0 + CH * i / 8, a = Math.max(0, Math.min(1, (wx - ax0) / F, (ax1 - wx) / F)); gr.addColorStop(i / 8, 'rgba(0,0,0,' + a.toFixed(3) + ')'); }
    g.fillStyle = gr; g.fillRect(0, 0, CH, c.height); g.globalCompositeOperation = 'source-over';
    return c; });
}
const glowSpr = once('glow', () => { const [c, g] = mk(64, 64), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,200,120,1)'); gr.addColorStop(0.4, 'rgba(255,170,90,0.4)'); gr.addColorStop(1, 'rgba(255,150,70,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c; });
export function drawAreas(g, cx, cy, VW, VH, time, dY, full, L) {
  if (!L) return;
  for (const A of AREAS) {
    if (A.x1 * TS < cx - 8 || A.x0 * TS > cx + VW + 8) continue;
    const sy = A.y0 - cy; if (sy > VH || sy + (A.y1 - A.y0) < 0) continue;
    const c0 = Math.max(0, Math.floor((cx - A.x0 * TS) / CH)), c1 = Math.min(Math.ceil((A.x1 - A.x0) * TS / CH) - 1, Math.floor((cx + VW - A.x0 * TS) / CH));
    g.globalAlpha = A.alpha; for (let ci = c0; ci <= c1; ci++) g.drawImage(chunk(A, ci, L), A.x0 * TS + ci * CH - cx, sy); g.globalAlpha = 1;
    if (A.lights.length) { g.save(); g.globalCompositeOperation = 'lighter'; for (const [lx, ly, r, a] of A.lights) { const x = lx - cx, y = ly - cy; if (x < -r || x > VW + r || y < -r || y > VH + r) continue; g.globalAlpha = a * (0.85 + 0.15 * Math.sin(time * 5 + lx)); g.drawImage(glowSpr, R(x - r), R(y - r), r * 2, r * 2); } g.restore(); }
  }
}
/* (claude/gorm2art) bake an area's chunks now (the level's load): the hall, the burning wood and the glade, so the fight never hitches on a first look */
export function warmAreas(L, ids) { for (const A of AREAS) { if (!ids.includes(A.id)) continue; const n = Math.ceil((A.x1 - A.x0) * TS / CH); for (let ci = 0; ci < n; ci++) chunk(A, ci, L); } }
