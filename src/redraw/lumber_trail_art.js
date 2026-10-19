// lumber_trail_art.js - THE LUMBER TRAIL's own drawn pieces (claude/lumbertrailart, the SONNET art pass over the greybox claude/lumbertrail).
// BRACKEN WOOD (level id 'wood', the game's first level, L.lumberKit) is a trail of felled timber, so every piece is the woodsman's: the MARKED PINE (a blaze,
// a tally board nailed on it, bite wedges that deepen a stroke at a time, chips at its foot, a lean), the STUMP it leaves, the TRUNK that lies (a bridge, a lean-to,
// a drop), the chalked fall line and the ground LANDING MARK, the CABIN and the chopping block with the axe, the camp's SAW FRAME, the TRAPPER'S CAGES (a pay-out
// you can see: the purse in the cage), the LOG RAFT, and the boughs the vines hang from. Tiles/supports are src/redraw/lumber_trail_tiles.js, the landmark
// src/redraw/lumber_trail_backdrop.js. Art only: no hitbox, number or geometry is read from here.
import { canvas, px, rect, fillPoly, mulberry, outline } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
const P = (g, c, x, y) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); };
/* THE WOODSMAN'S PALETTE: bark (dark to sunlit), the cut wood, the pine's needles, rope, resin */
export const BARK = ['#1c120a', '#2e1c0f', '#4a2f19', '#6a4425', '#8c6034', '#b07e48', '#d2a566'];
export const CUT = ['#f4e6bd', '#e2cb92', '#c7a766', '#9a7442', '#6e4d28'];
export const NEEDLE = ['#12261d', '#1c3b2a', '#2a5636', '#3a7440', '#53944a', '#78b45c'];
export const ROPE = ['#7a6238', '#a8905a', '#d2bd82'];
const OUT = '#0e1a12';

/* ===== THE STANDING MARKED PINE: foot at (CX, H); one sprite per (strokes taken, lean direction, role) ===== */
const PW = 40, PH = 104, CX = 20;
function bakePine(s, dir, role) {
  const [c, g] = canvas(PW, PH), rr = mulberry(77 + (role === 'hive' ? 9 : 0));
  const hw = y => { const t = (PH - y) / PH; let w = 4.4 - t * 2.0; if (y > PH - 9) w += (y - (PH - 9)) * 0.42; return w; };   /* half-width of the trunk at row y: tapering, flaring into roots at the foot */
  /* the trunk: grain by column, lit left */
  for (let y = 6; y < PH; y++) { const w = hw(y), x0 = Math.round(CX - w), x1 = Math.round(CX + w);
    for (let x = x0; x < x1; x++) { const k = (x - x0) / Math.max(1, x1 - x0 - 1); let sh = k < 0.2 ? 5 : k < 0.45 ? 4 : k < 0.7 ? 3 : k < 0.9 ? 2 : 1; const gr = hash(x, (y >> 3) + 3) % 7; if (gr === 0) sh = Math.max(0, sh - 1); else if (gr === 5 && k < 0.8) sh = Math.min(6, sh + 1); P(g, BARK[sh], x, y); }
    P(g, BARK[0], x0, y); P(g, BARK[0], x1 - 1, y); }
  for (let y = 30; y < PH - 6; y += 9 + (hash(y, 4) % 5)) { const x = CX - 3 + (hash(y, 9) % 6); R(g, BARK[1], x, y, 1, 3 + (hash(y, 2) % 3)); }   /* the bark's furrows */
  for (const ky of [58, 84]) { const kx = CX + (ky === 58 ? 1 : -2); R(g, BARK[1], kx, ky, 3, 3); P(g, BARK[4], kx, ky); P(g, BARK[5], kx + 1, ky + 1); }   /* knots */
  /* the boughs: seven drooping tiers, a scalloped hem, lit from the upper left, needle-flecked */
  const tiers = [[8, 5], [18, 8], [29, 11], [41, 14], [53, 17], [64, 19]];
  for (let i = tiers.length - 1; i >= 0; i--) { const [ty, tw] = tiers[i], seed = hash(i, 31);
    const hem = []; for (let k = -tw; k <= tw; k++) { const e = Math.abs(k) / tw, sag = Math.round(10 - e * 7 + ((hash(k + 40, i) % 3) - 1)); hem.push([k, sag]); }
    for (const [k, sag] of hem) { const top = Math.round(ty - 8 + Math.abs(k) * 0.35), bot = Math.round(ty + sag - 4);
      for (let y = top; y <= bot; y++) { const t = (y - top) / Math.max(1, bot - top); let sh = t < 0.25 ? 3 : t < 0.6 ? 2 : 1; if (k < -tw * 0.25) sh += 1; if (k > tw * 0.4) sh -= 1; if ((hash(k + 99, y + i * 13) % 9) === 0) sh += 1; if (t > 0.82) sh = Math.max(0, sh - 1); P(g, NEEDLE[Math.max(0, Math.min(5, sh))], CX + k, y); } }
    for (let n = 0; n < tw; n++) { const k = ((hash(n, seed) % (2 * tw + 1)) - tw), e = Math.abs(k) / tw; P(g, NEEDLE[5], CX + k, Math.round(ty - 5 + Math.abs(k) * 0.35 + (hash(n, seed + 1) % 4))); P(g, NEEDLE[0], CX + k, Math.round(ty + (10 - e * 7) - 5)); } }
  /* the apex */
  R(g, NEEDLE[3], CX, 0, 1, 4); P(g, NEEDLE[5], CX, 1);
  /* the woodsman's blaze: a pale axe-cut, with the ochre band painted under it (only a marked pine wears it) */
  const by = 66; R(g, BARK[0], CX - 3, by - 1, 6, 11); R(g, CUT[1], CX - 2, by, 4, 9); R(g, CUT[0], CX - 2, by, 1, 9); R(g, CUT[3], CX + 1, by + 1, 1, 8); P(g, CUT[4], CX - 1, by + 4); P(g, CUT[4], CX, by + 4);
  R(g, '#c4552d', CX - 4, by + 12, 8, 2); R(g, '#e07a45', CX - 4, by + 12, 8, 1);
  /* the tally board nailed over the boughs' hem: four slits, a stroke fills one */
  { const tx = CX - 7, ty = 76; R(g, BARK[0], tx - 1, ty - 1, 16, 9); R(g, '#a8814a', tx, ty, 14, 7); R(g, '#c9a468', tx, ty, 14, 1); R(g, '#6a4a28', tx, ty + 6, 14, 1); P(g, '#2a1a0c', tx + 1, ty + 1); P(g, '#2a1a0c', tx + 12, ty + 1);
    for (let k = 0; k < 4; k++) { const cut = k < s; R(g, cut ? '#ffd36b' : '#2a1a0c', tx + 2 + k * 3, ty + 2, 2, 4); if (cut) { P(g, '#fff2b0', tx + 2 + k * 3, ty + 2); } } }
  /* the stroke's bite: a wedge out of the trunk's lean side, deeper a stroke at a time, raw wood in it; chips on the ground; the splintered crack above it at the last strokes */
  if (s > 0) { const by2 = 90, d = Math.min(5, 1 + s), sd = dir > 0 ? 1 : -1, edge = x => (sd > 0 ? CX + Math.round(hw(by2)) - 1 - x : CX - Math.round(hw(by2)) + x);
    for (let k = 0; k < 7; k++) { const depth = Math.max(0, Math.round(d * (1 - Math.abs(k - 3) / 3.4))); for (let x = 0; x < depth; x++) { const wx = edge(x); g.clearRect(wx, by2 + k, 1, 1); }
      if (depth > 0) { const wx = edge(depth); P(g, k === 3 ? CUT[3] : CUT[k < 3 ? 0 : 2], wx, by2 + k); if (depth > 1) P(g, CUT[1], edge(depth - 1) + (sd > 0 ? 0 : 0), by2 + k); } }
    for (let n = 0; n < 2 + s * 2; n++) { const x = CX + sd * (5 + (hash(n, s) % 9)) , y = PH - 2 - (hash(n, 7) % 2); R(g, n % 3 ? CUT[1] : CUT[0], x, y, 1 + (n & 1), 1); }
    if (s >= 3) { R(g, BARK[0], CX + sd * 2, by2 - 7, 1, 7); P(g, CUT[0], CX + sd * 3, by2 - 4); P(g, CUT[1], CX + sd * 4, by2 - 2); } }
  /* the Queen's pine carries her comb on its lean-side bough (the pine you fell is the one her comb hangs from) */
  if (role === 'hive') drawComb(g, CX + (dir > 0 ? 6 : -16), 36, 1);
  return outline(c, OUT);
}
export function pineSprite(s, dir, role) { return once('pine' + s + (dir > 0 ? 'e' : 'w') + (role === 'hive' ? 'h' : ''), () => bakePine(Math.max(0, Math.min(4, s)), dir, role)); }
/* the standing pine: translate to its foot first; lean in radians */
export function drawPine(g, x, y, lean, s, dir, role, shake, t) {
  g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(lean + (shake > 0 ? Math.sin(t * 40) * 0.025 : 0)); g.drawImage(pineSprite(s, dir, role), -CX, -PH); g.restore();
}
/* the paper comb: grey-gold hexagon cells, a dark mouth, honey dripping */
function drawComb(g, x, y, k) {
  const w = 12, h = 17; R(g, '#3a2c1c', x + 5, y - 3, 2, 4);
  for (let j = 0; j < h; j++) { const hw2 = Math.round(Math.sqrt(Math.max(0, 1 - Math.pow((j - h * 0.38) / (h * 0.62), 2))) * w / 2 + (j < 3 ? 2 : 0)); for (let i = -hw2; i < hw2; i++) { const cell = ((i + j * 3) % 4 === 0) || (j % 3 === 0); P(g, cell ? '#6a5a40' : (i < 0 ? '#c8ad6e' : '#9a8250'), x + 6 + i, y + j); } }
  R(g, '#241a10', x + 4, y + 9, 4, 3); P(g, '#f0b840', x + 5, y + h); P(g, '#f0b840', x + 5, y + h + 1); P(g, '#ffe080', x + 9, y + h - 2);
}

/* ===== THE STUMP A FELLED PINE LEAVES: foot at (x, y): bark sides, a pale ringed face, the hinge's splintered tongue toward the fall ===== */
function bakeStump(dir) {
  const [c, g] = canvas(30, 18); const cx = 15, top = 5;
  for (let y = top + 2; y < 17; y++) { const f = y > 13 ? (y - 13) : 0, x0 = cx - 6 - f, x1 = cx + 6 + f; for (let x = x0; x < x1; x++) { const k = (x - x0) / (x1 - x0 - 1), sh = k < 0.25 ? 5 : k < 0.5 ? 4 : k < 0.75 ? 3 : 2; P(g, BARK[hash(x, y >> 2) % 6 === 0 ? sh - 1 : sh], x, y); } P(g, BARK[0], x0, y); P(g, BARK[0], x1 - 1, y); }
  for (let x = cx - 6; x < cx + 6; x++) for (let y = top - 3; y <= top + 3; y++) { const d = Math.hypot((x - cx + 0.5) / 6, (y - top) / 3.2); if (d <= 1) P(g, d > 0.85 ? CUT[3] : d > 0.62 ? CUT[1] : d > 0.5 ? CUT[2] : d > 0.3 ? CUT[1] : CUT[0], x, y); }
  P(g, CUT[4], cx, top); P(g, CUT[3], cx - 1, top);
  /* the hinge: the wood that held a moment longer, splintered, leaning the way it fell */
  const sd = dir > 0 ? 1 : -1; for (let k = 0; k < 6; k++) R(g, k % 2 ? CUT[1] : CUT[0], cx + sd * (3 + k) - (sd < 0 ? 0 : 0), top - 4 - (k < 3 ? k : 5 - k), 1, 2 + (k % 2));
  for (let n = 0; n < 6; n++) R(g, n % 2 ? CUT[0] : CUT[2], cx - 12 + (hash(n, 5) % 24), 16 + (hash(n, 8) % 2), 1 + (n & 1), 1);   /* chips round the foot */
  return outline(c, OUT);
}
export function drawStump(g, x, y, dir) { g.drawImage(once('stump' + (dir > 0 ? 'e' : 'w'), () => bakeStump(dir)), Math.round(x) - 15, Math.round(y) - 16); }

/* ===== THE FELLED TRUNK: len tiles, foot (the stump end) at x = 0, crown at the far end. Trunk rows 4..13 under a 16 px canvas (the walking line is its top). ===== */
function bakeTrunk(len, role) {
  const w = len * 16, [c, g] = canvas(w, 16), cw = 28;   /* cw: the crown's length */
  const top = (x) => 4, thick = x => Math.max(6, Math.round(10 - (x / Math.max(1, w - cw)) * 3.4));
  for (let x = 0; x < w - cw + 6; x++) { const th = thick(x), y0 = top(x);
    for (let k = 0; k < th; k++) { const t = k / (th - 1); let sh = t < 0.1 ? 6 : t < 0.28 ? 5 : t < 0.55 ? 4 : t < 0.8 ? 3 : 2; if (k === th - 1) sh = 1; const gr = hash(x >> 1, k + 40) % 11; if (gr === 0 && k > 1) sh = Math.max(1, sh - 1); P(g, BARK[sh], x, y0 + k); }
    if (hash(x, 3) % 17 === 0) { const l = 3 + (hash(x, 6) % 5), yy = y0 + 2 + (hash(x, 7) % Math.max(1, th - 5)); R(g, BARK[1], x, yy, l, 1); } }
  /* knots, a broken branch stub or two (low, so the line stays clean) and a resin bead */
  for (let x = 20; x < w - cw - 8; x += 26 + (hash(x, 1) % 14)) { const th = thick(x); R(g, BARK[1], x, top(x) + th - 1, 3, 2); P(g, BARK[3], x + 1, top(x) + th); R(g, BARK[1], x + 1, top(x) + th - 5, 2, 2); P(g, BARK[5], x + 1, top(x) + th - 5); }
  for (let x = 12; x < w - cw - 8; x += 30 + (hash(x, 8) % 16)) P(g, '#ffd36b', x, top(x) + 2);
  /* needle litter fallen on the top */
  for (let x = 6; x < w - cw; x += 7 + (hash(x, 2) % 6)) { R(g, NEEDLE[3], x, top(x) - 1, 2, 1); P(g, NEEDLE[2], x + 1, top(x)); }
  /* the foot: the cut, pale, with its rings and the hinge splinters */
  for (let k = 0; k < thick(0); k++) { R(g, k < 2 || k > thick(0) - 3 ? CUT[3] : CUT[1], 0, top(0) + k, 3, 1); }
  R(g, CUT[0], 0, top(0) + 2, 1, thick(0) - 4); R(g, CUT[4], 2, top(0) + 3, 1, thick(0) - 6);
  for (let k = 0; k < 4; k++) { R(g, CUT[k % 2 ? 0 : 2], 3 + k, top(0) - 1 + (k % 2), 2, 1); R(g, CUT[k % 2 ? 2 : 0], 3 + k, top(0) + thick(0) - (k % 2), 2, 1); }
  /* the crown: boughs fanned out at the far end, lit from above */
  const x0 = w - cw, mid = 8;
  for (let i = 0; i < 4; i++) { const bx = x0 + i * 6, spread = 7 - i, by = mid + (i % 2 ? -1 : 1);
    for (let k = -spread; k <= spread; k++) for (let j = 0; j < 4 + (spread - Math.abs(k)) / 1.4; j++) { const yy = Math.round(by + k * 0.95), xx = bx + j; if (xx >= w || yy < 0 || yy > 15) continue; P(g, NEEDLE[Math.max(0, Math.min(5, 3 - (k > 0 ? 1 : 0) + (j < 2 ? 1 : 0) - (k > 3 ? 1 : 0) + (hash(xx, yy) % 5 === 0 ? 1 : 0)))], xx, yy); } }
  for (let n = 0; n < 16; n++) P(g, NEEDLE[5], x0 + (hash(n, 5) % (cw - 2)), 2 + (hash(n, 6) % 12));
  for (let k = 0; k < 4; k++) R(g, BARK[2], x0 - 3 + k * 2, top(x0) + 3, 2, 3 - (k >> 1));   /* the bole thinning into the crown */
  if (role === 'hive') drawComb(g, w - 20, 0, 1);   /* her comb lies on her pine's crown, fallen into the clearing */
  return outline(c, OUT);
}
export function trunkSprite(len, role) { return once('trunk' + len + (role === 'hive' ? 'h' : ''), () => bakeTrunk(len, role)); }

/* ===== THE FALL LINE: chalk ticks the woodsman laid along the ground, an arrowhead at the crown's end, and the LANDING MARK (a chalk X in a ring, a peg and rag for a drop) ===== */
export function fallLine(g, o) {   /* o: { pts: [[x, y]...] (world px, the line), kx, ky (the landing), drop, hot, time, cx, cy, tick } */
  const { pts, kx, ky, drop, hot, time, cx, cy } = o, col = drop ? '#ff7a6b' : '#ffe08a', dim = drop ? '#8a2f2a' : '#a8884a';
  g.save(); g.globalAlpha = (hot ? 0.95 : 0.6) * (0.78 + 0.22 * Math.sin(time * 5));
  for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], X = Math.round(x - cx), Y = Math.round(y - cy); if (i % 2) continue; R(g, dim, X, Y, 4, 3); R(g, col, X, Y, 4, 2); P(g, '#fff6d8', X + 1, Y); }
  g.globalAlpha = hot ? 1 : 0.85;
  const lx = Math.round(kx - cx), ly = Math.round(ky - cy), pulse = 1 + Math.round(Math.sin(time * 4));
  /* the ring and the X, chalked on the ground where the crown will lie */
  for (let a = 0; a < 16; a++) { const an = a / 16 * Math.PI * 2, rx = Math.round(Math.cos(an) * (7 + pulse)), ry = Math.round(Math.sin(an) * 2.2); if (a % 2) continue; R(g, dim, lx + rx, ly + ry + 1, 2, 1); R(g, col, lx + rx, ly + ry, 2, 1); }
  for (let k = -2; k <= 2; k++) { P(g, col, lx + k * 2, ly - 1 + (k > 0 ? 0 : 0) + (Math.abs(k) > 1 ? 1 : 0)); P(g, col, lx + k * 2, ly + 1 - (Math.abs(k) > 1 ? 1 : 0)); }
  R(g, col, lx - 3, ly - 2, 1, 1); R(g, col, lx + 3, ly - 2, 1, 1); R(g, col, lx - 3, ly + 2, 1, 1); R(g, col, lx + 3, ly + 2, 1, 1);
  if (drop) { R(g, BARK[2], lx + 9, ly - 9, 2, 10); R(g, '#c43a2d', lx + 11, ly - 9, 5, 3 + Math.round(Math.sin(time * 6))); P(g, '#ff9a8a', lx + 11, ly - 9); }   /* the peg and its red rag: out from under */
  g.restore();
}

/* ===== THE TRAPPER'S CAGE (a pay-out you can read): slatted spruce, a hinged lid, an iron strap, the songbird on its perch, and the trapper's PURSE tied to the bars - open: the lid thrown, the purse flat and empty ===== */
function bakeCage(open) {
  const [c, g] = canvas(20, 22);
  R(g, BARK[2], 2, 19, 16, 2); R(g, BARK[4], 2, 19, 16, 1); R(g, BARK[0], 2, 21, 16, 1);   /* the sill */
  for (const x of [3, 8, 13, 16]) { R(g, BARK[3], x, 6, 2, 13); R(g, BARK[5], x, 6, 1, 13); R(g, BARK[1], x + 1, 6, 1, 13); }   /* the slats */
  R(g, BARK[2], 2, 5, 16, 2); R(g, BARK[5], 2, 5, 16, 1); R(g, '#5a6068', 2, 12, 16, 1); P(g, '#a8b0b8', 5, 12); P(g, '#a8b0b8', 11, 12);   /* the rail and the iron strap */
  if (!open) { R(g, BARK[3], 2, 3, 16, 3); R(g, BARK[5], 2, 3, 16, 1); R(g, BARK[1], 2, 5, 16, 1); R(g, '#5a6068', 9, 1, 2, 3); P(g, '#a8b0b8', 9, 1); }   /* the lid, shut, a ring on it */
  else { fillPoly(g, [[2, 5], [0, 0], [7, 0], [9, 5]], BARK[3]); R(g, BARK[5], 0, 0, 7, 1); }   /* the lid thrown back on its hinge */
  /* the purse: a leather pouch tied with cord to the bars, a gold coin at its mouth (open: slack and empty) */
  if (!open) { R(g, '#6a3f22', 12, 14, 6, 5); R(g, '#8c5a32', 12, 14, 2, 5); R(g, '#3d2210', 17, 15, 1, 4); R(g, ROPE[2], 12, 13, 6, 1); P(g, '#ffd36b', 14, 13); P(g, '#fff2b0', 14, 12); R(g, '#ffd36b', 15, 12, 2, 1); }
  else { R(g, '#6a3f22', 12, 17, 7, 2); R(g, '#3d2210', 12, 19, 7, 1); R(g, ROPE[2], 17, 16, 2, 1); }
  return c;
}
export function cageSprite(open) { return once('cage' + (open ? 1 : 0), () => bakeCage(open)); }
/* the songbird inside: a small blue-grey finch on its perch (the game's bird sprite is drawn by main.js; this is the perch) */
export function drawPerch(g, x, y) { R(g, BARK[2], x - 4, y, 8, 1); }

/* ===== THE LOG RAFT: five logs lashed side by side with cross-poles and a pole stuck in the stern, drawn at the mover's (x, y), w wide, 8 tall deck ===== */
function bakeRaft(w) {
  const [c, g] = canvas(w, 14);
  for (let x = 0; x < w; x++) { const lit = (x + 3) % 16; for (let k = 0; k < 8; k++) { let sh = k < 1 ? 6 : k < 3 ? 5 : k < 5 ? 4 : k < 7 ? 3 : 2; if (hash(x >> 2, k) % 13 === 0) sh--; P(g, BARK[Math.max(1, sh)], x, k + 1); } }
  R(g, BARK[0], 0, 9, w, 1);
  for (let x = 14; x < w - 8; x += 16) { R(g, BARK[1], x, 1, 1, 8); }   /* the gaps between the logs */
  for (const x of [5, w - 9]) { R(g, ROPE[0], x, 0, 4, 10); R(g, ROPE[2], x, 0, 4, 1); R(g, ROPE[1], x, 2, 4, 1); R(g, ROPE[1], x, 5, 4, 1); R(g, ROPE[0], x, 7, 4, 1); }   /* the lashings round the cross-poles */
  for (let k = 0; k < 4; k++) { R(g, CUT[k % 2 ? 1 : 0], 0, 1 + k * 2, 2, 2); R(g, CUT[2], w - 2, 1 + k * 2, 2, 2); }   /* sawn log ends at each side */
  R(g, BARK[3], w - 20, -0, 2, 1);
  return outline(c, OUT);
}
export function drawRaft(g, m, cx, cy, time) {
  const w = Math.round(m.w), x = Math.round(m.x) - cx, y = Math.round(m.y) - cy, bob = Math.round(Math.sin(time * 2 + m.x * 0.01) * 0.6);
  g.drawImage(once('raft' + w, () => bakeRaft(w)), x, y - 1 + bob);
  /* the pole stuck in the stern and the coil of rope */
  R(g, BARK[3], x + w - 12, y - 14 + bob, 2, 14); R(g, BARK[5], x + w - 12, y - 14 + bob, 1, 14); R(g, BARK[1], x + w - 11, y - 14 + bob, 1, 14);
  R(g, ROPE[1], x + 6, y - 3 + bob, 5, 2); R(g, ROPE[0], x + 6, y - 1 + bob, 5, 1); R(g, ROPE[2], x + 7, y - 3 + bob, 2, 1);
  /* ripples at the water line: it floats, it is not on rails */
  g.globalAlpha = 0.35; R(g, '#dff0f0', x - 2, y + 8, w + 4, 1); g.globalAlpha = 0.2; R(g, '#dff0f0', x + 6, y + 10, w - 12, 1); g.globalAlpha = 1;
}
/* the bough a vine hangs from: a pine limb with a needle tuft, drawn over the swing's pivot */
export function drawBough(g, px0, py0, cx, cy) {
  const x = Math.round(px0 - cx), y = Math.round(py0 - cy);
  g.drawImage(once('bough', () => { const [c, gg] = canvas(40, 14); for (let i = 0; i < 40; i++) { const t = Math.sin(i / 39 * Math.PI), yy = 6 - Math.round(t * 1); R(gg, BARK[3], i, yy, 1, 3); P(gg, BARK[5], i, yy); P(gg, BARK[1], i, yy + 2); }
    for (let n = 0; n < 9; n++) { const bx = 4 + n * 4; R(gg, NEEDLE[2 + (n & 1)], bx, 8 + (n % 3), 3, 3); P(gg, NEEDLE[5], bx, 8 + (n % 3)); R(gg, NEEDLE[1], bx + 1, 11 + (n % 2), 2, 1); }
    R(gg, BARK[1], 19, 4, 3, 6); return outline(c, OUT); }), x - 20, y - 8);
}

/* ===== THE CABIN: stacked logs with notched corners, a plank-and-sod roof, a lit window, a door with strap hinges, a lantern, firewood on the left wall ===== */
function bakeCabin() {
  const W = 112, H = 52, [c, g] = canvas(W, H), x0 = 20, wallW = 70, wallTop = 20, floor = 52;
  /* firewood stacked end-on on the left (a cord), a pale face to each */
  for (let row = 0; row < 3; row++) for (let i = 0; i < 4; i++) { const cxx = 3 + i * 5 + (row % 2) * 2, cyy = floor - 3 - row * 5; R(g, BARK[3], cxx - 2, cyy - 2, 5, 5); R(g, BARK[1], cxx - 2, cyy + 2, 5, 1); R(g, CUT[1], cxx - 1, cyy - 1, 3, 3); P(g, CUT[3], cxx, cyy); P(g, CUT[0], cxx - 1, cyy - 1); }
  /* the walls: log courses, each a lit top edge, a dark seam, bark flecks; the corners' log ends stick out in alternation */
  for (let y = wallTop; y < floor; y += 5) { const row = (y - wallTop) / 5 | 0; R(g, BARK[3], x0, y, wallW, 5); R(g, BARK[5], x0, y, wallW, 1); R(g, BARK[4], x0, y + 1, wallW, 1); R(g, BARK[1], x0, y + 3, wallW, 1); R(g, BARK[0], x0, y + 4, wallW, 1);
    for (let x = x0 + 4; x < x0 + wallW - 4; x += 5 + (hash(x, y) % 6)) R(g, BARK[2], x, y + 2, 2 + (hash(x, row) % 3), 1);
    const o = row % 2; R(g, BARK[3], x0 - 3 + o * 2, y, 5, 5); R(g, CUT[1], x0 - 2 + o * 2, y + 1, 3, 3); P(g, CUT[3], x0 - 1 + o * 2, y + 2); R(g, BARK[3], x0 + wallW - 2 - o * 2, y, 5, 5); R(g, CUT[1], x0 + wallW - 1 - o * 2, y + 1, 3, 3); P(g, CUT[3], x0 + wallW + o * -2, y + 2); }
  /* the roof: a low plank gable under a sod ridge, the eave deep, shadowed; the woodshed's deck above it is the level's own */
  fillPoly(g, [[x0 - 8, wallTop + 2], [x0 + wallW / 2, 0], [x0 + wallW + 8, wallTop + 2]], BARK[2]);
  for (let k = 0; k < 4; k++) { const yy = 6 + k * 4; for (let x = x0 - 8 + k * 6; x < x0 + wallW + 8 - k * 6; x += 6) R(g, k % 2 ? BARK[3] : BARK[4], x + (k % 2) * 3, yy, 5, 3); }
  for (let x = x0 - 8; x < x0 + wallW + 8; x += 1) { const yy = Math.round(wallTop + 2 - Math.min(x - (x0 - 8), x0 + wallW + 8 - x) * (wallTop + 2) / (wallW / 2 + 8)); if (hash(x, 3) % 3 === 0) P(g, NEEDLE[3], x, yy); P(g, BARK[0], x, yy + 1); }
  R(g, BARK[0], x0 - 8, wallTop + 2, wallW + 16, 2); R(g, BARK[1], x0 - 6, wallTop + 4, wallW + 12, 1);
  /* the stone chimney: river cobbles, a darkened throat */
  R(g, '#58606a', x0 + wallW - 14, 0, 9, 22); for (let y = 1; y < 22; y += 4) for (let x = 0; x < 9; x += 4) R(g, (x + y) & 4 ? '#7d868f' : '#444b54', x0 + wallW - 14 + x + (y % 8 ? 2 : 0), y, 4, 3); R(g, '#2a2f36', x0 + wallW - 15, 0, 11, 2);
  /* the window, lit from within: a warm pane under a cross-mullion, a shutter hung back */
  R(g, BARK[0], x0 + 9, 28, 14, 13); R(g, '#f6c860', x0 + 10, 29, 12, 11); R(g, '#ffe9a0', x0 + 10, 29, 5, 4); R(g, '#e09a3a', x0 + 15, 33, 7, 7); R(g, BARK[1], x0 + 15, 29, 1, 11); R(g, BARK[1], x0 + 10, 34, 12, 1);
  R(g, BARK[2], x0 + 5, 28, 4, 13); R(g, BARK[4], x0 + 5, 28, 1, 13); R(g, BARK[2], x0 + 24, 28, 4, 13);
  /* the door: planks with a strap hinge, a latch, a worn step */
  R(g, BARK[0], x0 + 40, 25, 18, 27); R(g, BARK[2], x0 + 41, 26, 16, 26); for (let k = 0; k < 4; k++) R(g, k % 2 ? BARK[3] : BARK[4], x0 + 41 + k * 4, 26, 3, 26); R(g, '#3c424a', x0 + 41, 30, 16, 2); R(g, '#3c424a', x0 + 41, 44, 16, 2); P(g, '#a8b0b8', x0 + 43, 30); P(g, '#a8b0b8', x0 + 43, 44); R(g, '#d2bd82', x0 + 54, 38, 2, 3);
  R(g, BARK[3], x0 + 38, floor - 2, 22, 2); R(g, BARK[5], x0 + 38, floor - 2, 22, 1);
  /* the lantern by the door, lit */
  R(g, BARK[0], x0 + 62, 22, 1, 5); R(g, '#1c120a', x0 + 61, 26, 4, 1); R(g, '#ffd36b', x0 + 61, 27, 4, 5); R(g, '#fff2b0', x0 + 62, 28, 2, 2); R(g, '#1c120a', x0 + 61, 32, 4, 1);
  return c;
}
export function cabinSprite() { return once('cabin', bakeCabin); }

/* ===== THE CHOPPING BLOCK WITH THE AXE (the handover): a round of oak, its top scored by blades, the woodsman's axe stood in it, a glint on the edge ===== */
function bakeBlock() {
  const [c, g] = canvas(34, 30);
  for (let y = 14; y < 29; y++) { const f = y > 25 ? y - 25 : 0; for (let x = 6 - f; x < 24 + f; x++) { const k = (x - (6 - f)) / (18 + 2 * f); P(g, BARK[k < 0.3 ? 5 : k < 0.6 ? 4 : k < 0.85 ? 3 : 2], x, y); } }
  for (let x = 6; x < 24; x++) for (let y = 9; y <= 19; y++) { const d = Math.hypot((x - 14.5) / 9, (y - 14) / 4.2); if (d <= 1) P(g, d > 0.88 ? CUT[3] : d > 0.7 ? CUT[2] : d > 0.55 ? CUT[1] : d > 0.4 ? CUT[2] : d > 0.2 ? CUT[1] : CUT[0], x, y); }
  for (const [a, b, l] of [[8, 13, 5], [13, 16, 6], [10, 11, 4], [17, 14, 4]]) R(g, CUT[4], a, b, l, 1);   /* the blade scores */
  R(g, BARK[0], 6, 22, 1, 6); R(g, BARK[0], 23, 22, 1, 6);
  /* chips lying round it */
  for (const [a, b] of [[2, 28], [27, 28], [29, 27], [0, 27], [31, 28]]) { R(g, CUT[1], a, b, 2, 1); P(g, CUT[0], a, b); }
  /* the axe: a long ash haft, a broad bright blade bitten into the block */
  for (let k = 0; k < 20; k++) { const x = 17 + (k >> 2), y = 14 - k; R(g, BARK[4], x, y, 2, 1); P(g, BARK[2], x + 2, y); }   /* haft leaning right and up */
  fillPoly(g, [[16, 11], [8, 9], [6, 14], [16, 15]], '#8a929a'); fillPoly(g, [[16, 11], [8, 9], [7, 11], [15, 12]], '#c4ccd4'); R(g, '#3c424a', 14, 12, 3, 3); P(g, '#ffffff', 8, 10);
  return outline(c, OUT);
}
export function blockSprite() { return once('block', bakeBlock); }
/* the woodsman at the cabin: a stocky figure in a red-checked coat and a wool cap, an axe held out haft-first, his back to the smoke */
function bakeWoodsman(frame) {
  const [c, g] = canvas(24, 30); const bob = frame ? 1 : 0;
  R(g, '#2a1c14', 6, 26, 5, 4); R(g, '#2a1c14', 13, 26, 5, 4); R(g, '#3a2a1c', 7, 21, 4, 6); R(g, '#3a2a1c', 13, 21, 4, 6);   /* boots, trousers */
  R(g, '#8c2a22', 6, 11 + bob, 12, 11); for (let y = 11 + bob; y < 22; y += 3) R(g, '#c8483a', 6, y, 12, 1); for (let x = 7; x < 18; x += 3) R(g, '#5a1814', x, 11 + bob, 1, 11); R(g, '#2a1c14', 6, 20 + bob, 12, 2); P(g, '#e8c860', 11, 20 + bob);   /* the checked coat, the belt */
  R(g, '#d9a47a', 8, 4 + bob, 8, 7); R(g, '#e8b88e', 8, 4 + bob, 3, 7); P(g, '#2a1c14', 10, 7 + bob); P(g, '#2a1c14', 14, 7 + bob); R(g, '#b8b0a4', 8, 9 + bob, 8, 3); R(g, '#d8d0c4', 9, 11 + bob, 6, 2);   /* the face, the grey beard */
  R(g, '#3a5a7a', 7, 2 + bob, 10, 3); R(g, '#5a82a8', 7, 2 + bob, 10, 1); R(g, '#3a5a7a', 8, 0 + bob, 8, 2); R(g, '#e8e0d0', 11, 0 + bob, 2, 1);   /* the wool cap */
  R(g, '#8c2a22', 18, 12 + bob, 4, 3); R(g, '#d9a47a', 22, 12 + bob, 2, 3);   /* the arm out, the hand open */
  R(g, BARK[4], 22, 6 + bob, 1, 14); R(g, BARK[2], 23, 6 + bob, 1, 14);   /* the axe held haft-first: the blade up top */
  R(g, '#8a929a', 19, 5 + bob, 5, 4); R(g, '#c4ccd4', 19, 5 + bob, 5, 1);
  return outline(c, OUT);
}
export function woodsmanSprite(f) { return once('wm' + f, () => bakeWoodsman(f)); }

/* ===== THE SAW FRAME over the sawpit: two stout posts and a cross-beam, a two-man pit saw hung in a log laid on trestles, sawdust heaped under ===== */
function bakeSawFrame() {
  const W = 72, H = 52, [c, g] = canvas(W, H);
  for (const x of [4, 60]) { R(g, BARK[3], x, 6, 6, 46); R(g, BARK[5], x, 6, 1, 46); R(g, BARK[1], x + 5, 6, 1, 46); for (let y = 12; y < 50; y += 9) R(g, BARK[1], x + 1, y, 4, 1); R(g, BARK[2], x - 2, 48, 10, 4); }
  R(g, BARK[2], 0, 4, W, 6); R(g, BARK[5], 0, 4, W, 1); R(g, BARK[1], 0, 9, W, 1); P(g, '#a8b0b8', 8, 6); P(g, '#a8b0b8', 62, 6);
  /* the log on its trestles, half through, the saw standing in the cut */
  R(g, BARK[3], 12, 26, 48, 9); R(g, BARK[5], 12, 26, 48, 1); R(g, BARK[1], 12, 34, 48, 1); R(g, CUT[1], 12, 28, 3, 5); R(g, CUT[0], 12, 28, 1, 5);
  fillPoly(g, [[28, 8], [44, 8], [44, 14], [28, 14]], '#2a2f36'); R(g, '#9aa2aa', 30, 14, 12, 22); for (let x = 30; x < 42; x += 2) R(g, '#5a6068', x, 35, 1, 2); R(g, '#c4ccd4', 30, 14, 1, 22); R(g, BARK[3], 34, 4, 4, 5);
  for (const x of [16, 50]) { R(g, BARK[2], x, 35, 3, 14); R(g, BARK[2], x - 3, 47, 9, 2); }
  for (let i = 0; i < 40; i++) R(g, i % 3 ? CUT[1] : CUT[0], 14 + (hash(i, 4) % 46), 47 + (hash(i, 5) % 4), 2, 1);
  return outline(c, OUT);
}
export function sawFrameSprite() { return once('sawframe', bakeSawFrame); }

/* ===== THE CAMP PALISADE (fence v0) and its GATE (v1): sharpened logs lashed with rope, a plank gate with an iron strap and a hung lantern ===== */
function bakePalisade(gate) {
  const W = gate ? 48 : 32, H = 40, [c, g] = canvas(W, H);
  const post = (x, h, top) => { R(g, BARK[3], x, top, 6, h); R(g, BARK[5], x, top, 1, h); R(g, BARK[1], x + 5, top, 1, h); for (let k = 0; k < 4; k++) R(g, BARK[3 + (k % 2)], x + k, top - 3 + k, 6 - k * 2 > 0 ? 6 - k * 2 : 1, 1); P(g, BARK[1], x + 2, top + 8); P(g, BARK[1], x + 3, top + 17); };
  if (!gate) { for (let i = 0; i < 5; i++) { const h = 24 + (i % 2) * 3; post(i * 6, h, H - h); }
    R(g, ROPE[0], 0, 18, W - 2, 2); R(g, ROPE[2], 0, 18, W - 2, 1); R(g, ROPE[0], 0, 30, W - 2, 2); R(g, ROPE[2], 0, 30, W - 2, 1); }
  else { for (const x of [0, 6, 36, 42]) post(x, 36, 4); R(g, BARK[2], 12, 14, 24, 26); for (let k = 0; k < 6; k++) R(g, k % 2 ? BARK[3] : BARK[4], 12 + k * 4, 14, 3, 26); R(g, '#3c424a', 12, 20, 24, 2); R(g, '#3c424a', 12, 34, 24, 2); R(g, BARK[1], 24, 14, 1, 26); R(g, BARK[3], 6, 4, 36, 4); R(g, BARK[5], 6, 4, 36, 1);
    R(g, BARK[0], 21, 8, 1, 6); R(g, '#ffd36b', 19, 14, 5, 4); R(g, '#fff2b0', 20, 15, 2, 2); R(g, BARK[0], 19, 18, 5, 1); }
  return outline(c, OUT);
}
export function palisadeSprite(gate) { return once('pal' + (gate ? 1 : 0), () => bakePalisade(gate)); }
/* a stack of split firewood and cord, for the camp (deco logPile): end-on rounds in a pyramid */
function bakeLogPile() {
  const W = 56, H = 34, [c, g] = canvas(W, H);
  for (let row = 0; row < 4; row++) { const n = 6 - row; for (let i = 0; i < n; i++) { const cxx = 6 + row * 4 + i * 8, cyy = H - 5 - row * 7; R(g, BARK[3], cxx - 4, cyy - 3, 8, 7); R(g, BARK[5], cxx - 3, cyy - 3, 5, 1); R(g, BARK[1], cxx - 3, cyy + 3, 7, 1); R(g, CUT[hash(i, row) % 2 ? 1 : 2], cxx - 2, cyy - 2, 5, 5); P(g, CUT[3], cxx, cyy); R(g, CUT[0], cxx - 2, cyy - 2, 2, 1); } }
  R(g, BARK[2], 0, H - 2, W, 2);
  return outline(c, OUT);
}
export function logPileSprite() { return once('logpile', bakeLogPile); }
/* the skid sled: a log sled with a chain and a half-load of logs, a drag rope, left on the camp's yard */
function bakeSled() {
  const W = 56, H = 24, [c, g] = canvas(W, H);
  R(g, BARK[1], 2, 20, 52, 3); R(g, BARK[3], 2, 19, 52, 1); for (const x of [8, 26, 44]) R(g, BARK[2], x, 14, 5, 6);
  for (let i = 0; i < 3; i++) { R(g, BARK[4 - (i & 1)], 6 + i * 2, 9 - i * 6 + 6, 44 - i * 4, 5); R(g, BARK[6], 6 + i * 2, 9 - i * 6 + 6, 44 - i * 4, 1); R(g, CUT[1], 6 + i * 2, 9 - i * 6 + 7, 2, 3); }
  R(g, '#5a6068', 5, 13, 46, 1); R(g, ROPE[1], 0, 21, 8, 1);
  return outline(c, OUT);
}
export function sledSprite() { return once('sled', bakeSled); }

/* ===== THE CAMP TENT (deco campTent): a canvas lean-to, rain-greyed, two lashed poles, a bedroll and a billy-can ===== */
function bakeTent() {
  const W = 56, H = 36, [c, g] = canvas(W, H);
  fillPoly(g, [[4, 35], [28, 2], [52, 35]], '#b8a888'); fillPoly(g, [[28, 2], [52, 35], [34, 35]], '#8e8068'); R(g, '#6a5c46', 28, 2, 1, 33); fillPoly(g, [[24, 35], [29, 15], [34, 35]], '#2a2118');
  R(g, BARK[3], 26, 0, 4, 3); R(g, BARK[3], 0, 33, 56, 2);
  for (let k = 0; k < 5; k++) R(g, '#9a8a6a', 10 + k * 5, 14 + k * 3 - (k > 2 ? (k - 2) * 6 : 0), 3, 1);
  R(g, '#3c424a', 46, 30, 6, 5); R(g, '#8a929a', 46, 30, 6, 1); R(g, BARK[0], 47, 28, 4, 2);
  return outline(c, OUT);
}
export function tentSprite() { return once('tent', bakeTent); }

/* ===== the store and den mouths: a timber lintel on two posts over a cave, a lantern in the dark (store) or a bone-and-rag charm (den) ===== */
export function bakeMouth(wTiles, hTiles, den) {
  const W = wTiles * 16 + 12, H = hTiles * 16 + 10, [c, g] = canvas(W, H);
  for (const x of [0, W - 7]) { R(g, BARK[3], x, 4, 7, H - 4); R(g, BARK[5], x, 4, 1, H - 4); R(g, BARK[1], x + 6, 4, 1, H - 4); for (let y = 10; y < H - 4; y += 9) R(g, BARK[1], x + 1, y, 5, 1); }
  R(g, BARK[2], 0, 0, W, 7); R(g, BARK[5], 0, 0, W, 1); R(g, BARK[1], 0, 6, W, 1); for (let x = 4; x < W - 4; x += 10) R(g, BARK[1], x, 3, 3, 1);
  if (!den) { R(g, BARK[0], W / 2 - 1, 7, 1, 5); R(g, '#ffd36b', W / 2 - 3, 12, 5, 5); R(g, '#fff2b0', W / 2 - 2, 13, 2, 2); R(g, BARK[0], W / 2 - 3, 17, 5, 1); }
  else { R(g, ROPE[1], 8, 7, 1, 9); R(g, '#d8d0c0', 6, 15, 5, 4); R(g, '#2a1c14', 7, 16, 1, 1); R(g, '#2a1c14', 9, 16, 1, 1); R(g, '#7a3a8a', W - 18, 7, 6, 8); R(g, '#a85ab8', W - 18, 7, 6, 1); R(g, '#7a3a8a', W - 16, 15, 2, 3); }
  return outline(c, OUT);
}
export function mouthSprite(w, h, den) { return once('mouth' + w + '_' + h + (den ? 'd' : ''), () => bakeMouth(w, h, den)); }

/* ===== THE DECO TABLE: [sprite, bg] by kind, this level's own ===== */
export function decoOf(e) {
  switch (e.kind) {
    case 'cabin': return [cabinSprite(), true];
    case 'stump': return e.v === 0 ? [blockSprite(), false] : null;
    case 'woodsman': return [woodsmanSprite(0), false, [woodsmanSprite(0), woodsmanSprite(1)]];
    case 'sawFrame': return [sawFrameSprite(), true];
    case 'fence': return [palisadeSprite(e.v === 1), true];
    case 'logPile': return [logPileSprite(), false];
    case 'skidSled': return [sledSprite(), false];
    case 'campTent': return [tentSprite(), true];
    case 'storeMouth': return [mouthSprite(9, 3, false), true];
    case 'denMouth': return [mouthSprite(10, 3, true), true];
    default: return null;
  }
}
