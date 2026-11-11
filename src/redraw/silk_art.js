// src/redraw/silk_art.js - THE SILK UNDERCROFT's art (claude/silkart, the SONNET ART PASS over claude/silk's greybox; flag stays OFF).
// Grey-white silk over black stone, ONE accent: torch amber (plus the egg sacs' faint sick green, the brief's "glowing faint green"). No wood, no logs.
//   TILES     silkTile(t, x, y, at, T, L): the undercroft's rough black stone (silk draped on every top face, drips under every roof, a cocooned body in some deep niches);
//             a STRAND (ONEWAY) is a twisted silk rope shelf laced below; the HIGH BRIDGE is a woven silk walk with hanging ties; a TAUT WEB (BOUNCER) is drawn tight;
//             a STICKY WALL cell (the hands keep it SOLID while whole) is a thick gummed sheet.
//   BACKDROP  drawBackdrop (the manor's footings overhead, a cellar grate lit amber, hanging sheets, the silk net under every pit)
//   PROPS     webShimmer, knot + strand, cocoon, sticky wall burning, sconce, torch in hand, egg sac (whole / pulsing / burst / burned), goo, glob, the lurker's thread
//   FOES      bakeSilkSkins() -> { skling, skspitter } sets in the spider's own 6-frame layout (hang, drop, hang2, climb1, climb2, hurt); drawLurker(...) THE SILK LURKER, every mode
// Rect-based (px.js primitives only: it runs in tools/node-canvas.mjs, tools/silk-art-sheet.mjs), baked once and memoised where it is a sprite.
import { canvas, px, rect, line, ellipse, circle, fromGrid, outline, flipX, whiten } from '../px.js';

export const SA = {
  rock: ['#262634', '#2c2c3c', '#202030', '#313144'], rockHi: '#525270', rockLo: '#14141e', joint: '#0b0b12', rockMid: '#3c3c54',
  silk: '#e9e9f2', silkMid: '#c2c2d2', silkLo: '#8e8ea4', silkDeep: '#5c5c72', silkShade: '#3a3a4c',
  amber: '#ffb04a', amberHi: '#ffe08a', amberLo: '#b8601c', amberDeep: '#6a3010', iron: '#3a3640', ironHi: '#6a6674',
  egg: '#9ae67a', eggMid: '#62a84e', eggLo: '#2e5c34', eggHi: '#dcffc8', slime: '#a8c898',
  bone: '#d4cdb6', boneLo: '#8a8470', ember: '#ff7a2a', char: '#241c1c',
};
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const R = Math.round;
const al = (hexc, k) => { const h = hexc.slice(1); return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + k.toFixed(2) + ')'; };

/* ================================ TILES (16 x 16) ================================ */
function stone(g, x, y) {
  const wx = x * 16, wy = y * 16, brick = 8;
  for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
    const gx = wx + xx, gy = wy + yy, row = (gy / brick) | 0, off = (row & 1) * 5, cx = ((gx + off) % 11 + 11) % 11;
    let c = SA.rock[hash(gx >> 2, gy >> 1) & 3];
    if (gy % brick === 0 || cx === 0) c = SA.joint;
    else if (gy % brick === 1) c = SA.rockMid;
    else if (hash(gx, gy) % 23 === 0) c = SA.rockHi;
    else if (hash(gx + 7, gy) % 17 === 0) c = SA.rockLo;
    px(g, xx, yy, c);
  }
}
/* silk draped over the top face: a pale lip with a ragged hem, a few threads hanging */
function drape(g, x, y) {
  const wx = x * 16;
  for (let xx = 0; xx < 16; xx++) { const h = hash(wx + xx, y * 3 + 1), len = 2 + (h % 3);
    px(g, xx, 0, SA.silk); px(g, xx, 1, (xx + y) & 1 ? SA.silkMid : SA.silk);
    for (let k = 2; k < len; k++) px(g, xx, k, k === len - 1 ? SA.silkDeep : SA.silkLo);
    if (h % 5 === 0) for (let k = len; k < len + 3; k++) px(g, xx, k, al(SA.silkMid, 0.7 - (k - len) * 0.2)); }
}
function sideSilk(g, left, up) {
  const x = left ? 0 : 15;
  for (let yy = 0; yy < 16; yy++) px(g, x, yy, yy % 3 === 0 ? SA.silkDeep : SA.silkLo);
  if (up) for (let k = 0; k < 4; k++) for (let j = 0; j <= 3 - k; j++) px(g, left ? j + 1 : 14 - j, k + 2, k === 0 || j === 3 - k ? SA.silkMid : al(SA.silk, 0.45));   /* a web in the corner */
}
function drips(g, x, y) {
  for (let xx = 1; xx < 16; xx += 2) { const h = hash(x * 16 + xx, y + 9); if (h % 4) continue; const len = 3 + (h >> 4) % 5;
    for (let k = 0; k < len; k++) px(g, xx, 15 - len + k + 1, k > len - 2 ? SA.silkDeep : al(SA.silkMid, 0.95 - k * 0.1)); }
}
/* a cocooned body in a deep niche: a dark recess, a bound silk lump with bands, a foot */
function niche(g, x, y) {
  rect(g, 2, 2, 12, 12, '#0c0c12'); rect(g, 2, 2, 12, 1, SA.rockLo); rect(g, 1, 3, 1, 10, SA.rockHi); rect(g, 14, 3, 1, 10, SA.rockLo);
  const lean = hash(x, y) & 1 ? 1 : -1;
  ellipse(g, 8 + lean, 8, 3.5, 5.5, SA.silkLo); ellipse(g, 8 + lean, 7.5, 2.5, 4.5, SA.silkMid);
  for (let k = 0; k < 5; k++) rect(g, 6 + lean, 4 + k * 2, 5, 1, k & 1 ? SA.silkLo : SA.silk);
  rect(g, 7 + lean, 13, 3, 1, SA.boneLo); px(g, 8 + lean, 2, SA.silkDeep);
}
export function stoneTile(x, y, o) {
  const key = ['s', x % 6, y % 4, o.up ? 'U' : '', o.aL ? 'L' : '', o.aR ? 'R' : '', o.aD ? 'D' : '', o.niche ? 'N' : ''].join('');
  return once(key, () => { const [c, g] = canvas(16, 16); stone(g, x, y);
    if (o.niche) niche(g, x, y);
    if (o.up) drape(g, x, y);
    if (o.aL) sideSilk(g, true, o.up); if (o.aR) sideSilk(g, false, o.up);
    if (o.aD) { rect(g, 0, 15, 16, 1, SA.joint); drips(g, x, y); }
    return c; });
}
/* A STRAND (one-way): a twisted rope shelf, lacing below, a knot and a tendril at the ends */
export function strandTile(x, l, r) {
  return once('st' + (l ? 'L' : '') + (r ? 'R' : '') + (x & 3), () => { const [c, g] = canvas(16, 16);
    for (let xx = 0; xx < 16; xx++) { const tw = ((xx + (x & 3) * 2) >> 1) & 1; px(g, xx, 0, SA.silk); px(g, xx, 1, tw ? SA.silkMid : SA.silk); px(g, xx, 2, tw ? SA.silkLo : SA.silkMid); px(g, xx, 3, SA.silkDeep); }
    for (let xx = 0; xx < 16; xx++) { const d = (xx + (x & 1) * 4) % 8; const yy = 4 + (d < 4 ? d : 7 - d); px(g, xx, yy, al(SA.silkMid, 0.55)); px(g, xx, yy + 1, al(SA.silkLo, 0.35)); }
    if ((x & 1) === 0) for (let k = 0; k < 4; k++) px(g, 3 + (x & 3) * 3, 4 + k, al(SA.silkLo, 0.8 - k * 0.2));
    if (l) { ellipse(g, 3, 2, 3, 3, SA.silkMid); px(g, 2, 1, SA.silk); px(g, 3, 4, SA.silkDeep); for (let k = 0; k < 5; k++) px(g, k, 6 + k, al(SA.silkLo, 0.6)); }
    if (r) { ellipse(g, 12, 2, 3, 3, SA.silkMid); px(g, 13, 1, SA.silk); px(g, 12, 4, SA.silkDeep); for (let k = 0; k < 5; k++) px(g, 15 - k, 6 + k, al(SA.silkLo, 0.6)); }
    return c; });
}
/* THE HIGH BRIDGE: a woven silk walk (a mat of cross-laid silk between two ropes), ties hanging, slack once it is cut (the ramp) */
export function bridgeTile(x, l, r, ramp) {
  return once('br' + (l ? 'L' : '') + (r ? 'R' : '') + (ramp ? 'r' : 'h') + (x & 3), () => { const [c, g] = canvas(16, 16);
    for (let xx = 0; xx < 16; xx++) { px(g, xx, 0, SA.silk); px(g, xx, 1, SA.silkMid); }
    for (let yy = 2; yy < 5; yy++) for (let xx = 0; xx < 16; xx++) px(g, xx, yy, ((xx + yy * 2 + (x & 3)) & 3) < 2 ? SA.silkLo : SA.silkDeep);
    px(g, 0, 2, SA.silk); px(g, 8, 2, SA.silk);
    for (const tx of [2, 8, 13]) { const len = ramp ? 3 + ((tx + x) & 3) : 5 + ((tx * 3 + x) % 6); for (let k = 0; k < len; k++) px(g, tx, 5 + k, al(SA.silkMid, 0.9 - k * 0.1)); px(g, tx, 5 + len, SA.silkDeep); }
    if (ramp) for (let k = 0; k < 8; k++) px(g, 1 + ((k * 5 + x * 3) & 15), 5 + (k & 1), al(SA.silkLo, 0.6));
    if (l) { rect(g, 0, 0, 2, 7, SA.silkDeep); ellipse(g, 2, 3, 2.5, 3, SA.silkMid); }
    if (r) { rect(g, 14, 0, 2, 7, SA.silkDeep); ellipse(g, 13, 3, 2.5, 3, SA.silkMid); }
    return c; });
}
/* A TAUT WEB (BOUNCER): drawn tight (no sag), three rails and a fine radial mesh, end lashings */
export function tautTile(x, l, r) {
  return once('tw' + (l ? 'L' : '') + (r ? 'R' : '') + (x & 1), () => { const [c, g] = canvas(16, 16);
    for (let xx = 0; xx < 16; xx++) { px(g, xx, 0, SA.silk); px(g, xx, 1, SA.silkMid); px(g, xx, 4, al(SA.silkMid, 0.9)); px(g, xx, 8, al(SA.silkLo, 0.8)); px(g, xx, 12, al(SA.silkDeep, 0.7)); }
    const o = (x & 1) * 4;
    for (let k = 0; k < 2; k++) { const bx = (o + k * 8) % 16; for (let j = 0; j < 12; j++) { const xx = (bx + (j >> 1) * (k ? 1 : -1) + 16) % 16; px(g, xx, 1 + j, al(SA.silkMid, 0.7 - j * 0.04)); px(g, (xx + 8) % 16, 1 + j, al(SA.silkMid, 0.5 - j * 0.03)); } }
    if (l) { ellipse(g, 1.5, 3, 2.5, 4, SA.silkLo); rect(g, 0, 0, 2, 12, SA.silkMid); }
    if (r) { ellipse(g, 14, 3, 2.5, 4, SA.silkLo); rect(g, 14, 0, 2, 12, SA.silkMid); }
    return c; });
}
/* A STICKY WALL cell: a thick gummed sheet over the stone, gum beads; the hands burn it away */
export function wallTile(x, y, top, bot) {
  return once('wl' + (top ? 'T' : '') + (bot ? 'B' : '') + (x & 3) + (y & 3), () => { const [c, g] = canvas(16, 16);
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const k = (xx + yy * 3 + (y & 1) * 5) % 8; px(g, xx, yy, k < 2 ? SA.silkLo : k < 5 ? SA.silkMid : SA.silk); }
    for (let yy = 0; yy < 16; yy += 4) for (let xx = 0; xx < 16; xx++) if ((xx + yy) % 5 === 0) px(g, xx, yy, SA.silkDeep);
    for (let k = 0; k < 3; k++) { const bx = 2 + ((k * 5 + (y & 3) * 2) % 12), by = 3 + ((k * 7 + (y & 1) * 3) % 10); circle(g, bx, by, 1.6, SA.slime); px(g, bx, by - 1, SA.eggHi); }
    rect(g, 0, 0, 1, 16, SA.silkDeep); rect(g, 15, 0, 1, 16, SA.silkDeep);
    if (top) rect(g, 0, 0, 16, 2, SA.silkDeep); if (bot) rect(g, 0, 14, 16, 2, SA.silkDeep);
    return c; });
}

/* what the level tells the tile maker: the bridge's cells and the sticky walls' cells (the hands change the grid; this reads L.sk) */
function cellSets(L) {
  if (L._skArtSets) return L._skArtSets;
  const bridge = new Map(), wall = new Map();
  for (const an of ((L.sk && L.sk.anchors) || [])) if (an.kind === 'bridge') { for (const [cx, cy] of an.hold) bridge.set(cy * 4096 + cx, 'h'); for (const [cx, cy] of an.ramp) bridge.set(cy * 4096 + cx, 'r'); }
  for (const w of ((L.sk && L.sk.walls) || [])) for (let cy = w.y0; cy <= w.y1; cy++) wall.set(cy * 4096 + w.x, [cy === w.y0, cy === w.y1]);
  return (L._skArtSets = { bridge, wall });
}
export function silkTile(t, x, y, at, T, L) {
  if (!L || !L.silk) return null;
  const S = cellSets(L);
  if (t === T.SOLID && S.wall.has(y * 4096 + x)) { const [tp, bt] = S.wall.get(y * 4096 + x); return wallTile(x, y, tp, bt); }
  if (t === T.ONEWAY) { const l = at(x - 1, y) !== T.ONEWAY, r = at(x + 1, y) !== T.ONEWAY, bk = S.bridge.get(y * 4096 + x); return bk ? bridgeTile(x, l, r, bk === 'r') : strandTile(x, l, r); }
  if (t === T.BOUNCER) return tautTile(x, at(x - 1, y) !== T.BOUNCER, at(x + 1, y) !== T.BOUNCER);
  if (t !== T.SOLID) return null;
  const open = v => v === T.AIR || v === T.ONEWAY || v === T.SPIKE || v === T.BOUNCER;
  const o = { up: open(at(x, y - 1)), aL: open(at(x - 1, y)), aR: open(at(x + 1, y)), aD: open(at(x, y + 1)) };
  if (!o.up && !o.aL && !o.aR && !o.aD && at(x, y - 2) === T.SOLID && at(x - 1, y - 1) === T.SOLID && at(x + 1, y - 1) === T.SOLID && hash(x >> 1, y) % 9 === 0 && (x & 1) === 0 && (y & 1) === 0) o.niche = true;
  return stoneTile(x, y, o);
}

/* ================================ BACKDROP ================================ */
/* THE MANOR'S FOUNDATIONS (the landmark): big cut footing stones, a shallow arch every 96 px, a cellar grate lit amber; 192 x 44, tiling */
function foundationStrip() {
  return once('fnd', () => { const W = 192, H = 44, [c, g] = canvas(W, H);
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) { const row = (yy / 11) | 0, off = (row & 1) * 24, k = (xx + off) % 48; let col = (yy % 11 === 0 || k === 0) ? '#0a0a10' : ['#26262f', '#2c2c37', '#22222b'][hash(xx >> 3, yy >> 3) % 3]; if (yy % 11 === 1) col = '#34343f'; if (hash(xx, yy) % 29 === 0) col = '#3a3a48'; px(g, xx, yy, col); }
    for (const ax of [0, 96]) for (let xx = 0; xx < 64; xx++) { const dx = xx - 32, top = 44 - Math.round(Math.sqrt(Math.max(0, 32 * 32 - dx * dx)) * 0.62); for (let yy = top; yy < H; yy++) px(g, ax + 16 + xx, yy, '#06060a'); if (top < H) px(g, ax + 16 + xx, top, '#4a4a58'); }
    for (const gx of [48, 144]) { rect(g, gx - 10, 12, 20, 14, '#0a0a10'); rect(g, gx - 9, 13, 18, 12, SA.amberDeep); for (let b = 0; b < 6; b++) rect(g, gx - 8 + b * 3, 13, 1, 12, '#15121a'); rect(g, gx - 9, 18, 18, 1, '#15121a');
      rect(g, gx - 7, 14, 14, 3, SA.amberLo); rect(g, gx - 4, 15, 8, 1, SA.amber); }
    for (let k = 0; k < 8; k++) { const sx = 4 + k * 24 + (k & 1) * 5, len = 8 + (k * 7) % 14; for (let j = 0; j < len; j++) px(g, sx, Math.min(43, 36 + j), 'rgba(210,210,225,' + Math.max(0.1, 0.5 - j * 0.03).toFixed(2) + ')'); }
    return c; });
}
function silkNet() { return once('net', () => { const [c, g] = canvas(16, 12);
  for (let xx = 0; xx < 16; xx++) { px(g, xx, 1, al(SA.silkMid, 0.85)); px(g, xx, 7, al(SA.silkLo, 0.6)); }
  for (let yy = 0; yy < 12; yy++) { px(g, 3, yy, al(SA.silkLo, 0.55)); px(g, 11, yy, al(SA.silkLo, 0.55)); }
  for (let k = 0; k < 7; k++) { px(g, 3 + k, 1 + k, al(SA.silkMid, 0.5)); px(g, 11 - k, 1 + k, al(SA.silkMid, 0.5)); } return c; }); }
/* behind the tiles: the foundations hang overhead (slow parallax), pale silk sheets in the gloom, the net across every pit */
export function drawBackdrop(g, cx, cy, VW, VH, time, sk) {
  const F = foundationStrip(), off = -((cx * 0.3) % 192);
  for (let x = off - 192; x < VW + 192; x += 192) g.drawImage(F, R(x), 0);
  rect(g, 0, 44, VW, 6, 'rgba(8,8,12,0.55)'); rect(g, 0, 50, VW, 8, 'rgba(8,8,12,0.28)');
  for (let i = 0; i < 9; i++) {
    const sx = (((i * 151 - cx * 0.5) % (VW + 90)) + VW + 90) % (VW + 90) - 45, top = 40 + (i % 3) * 8, len = 60 + (i * 37) % 90, w = 14 + (i % 4) * 5;
    for (let j = 0; j < len; j += 2) { const sw = Math.round(Math.sin(time * 0.6 + i + j * 0.07) * 1.5); rect(g, sx + sw, top + j, w - (j >> 4), 2, 'rgba(220,220,236,' + (0.07 - j / len * 0.04).toFixed(3) + ')'); }
    rect(g, sx, top, 1, len, 'rgba(235,235,248,0.18)'); rect(g, sx + w - 1, top, 1, len * 0.8, 'rgba(235,235,248,0.12)'); }
  if (sk) { const N = silkNet(); for (const pt of sk.pits) { const a0 = R(pt.x0 * 16 - cx), b0 = R((pt.x1 + 1) * 16 - cx); if (b0 < 0 || a0 > VW) continue; const ny = R(sk.catchY - 24 - cy);
    for (let x = Math.max(a0, -16); x < Math.min(b0, VW); x += 16) g.drawImage(N, x, ny + (Math.floor((x + cx) / 16) % 2 ? 1 : 0));
    rect(g, Math.max(a0, 0), ny + 12, Math.min(b0, VW) - Math.max(a0, 0), 1, 'rgba(8,8,12,0.5)'); } }
}

/* ================================ PROPS ================================ */
export function webShimmer(g, x, y, wPx, time) {   /* a bright pulse running along a taut web: held tight, it hums */
  const p = ((time * 70) % (wPx + 40)) - 20; for (let k = 0; k < 9; k++) { const xx = p + k - 4; if (xx < 0 || xx >= wPx) continue; px(g, R(x + xx), R(y), 'rgba(255,255,255,' + (0.95 - Math.abs(k - 4) * 0.2).toFixed(2) + ')'); px(g, R(x + xx), R(y + 1), 'rgba(255,255,255,' + (0.45 - Math.abs(k - 4) * 0.1).toFixed(2) + ')'); }
  const q = (((time * 50 + wPx * 0.5) % (wPx + 40)) - 20); for (let k = 0; k < 5; k++) { const xx = q + k - 2; if (xx < 0 || xx >= wPx) continue; px(g, R(x + xx), R(y + 4), 'rgba(255,255,255,' + (0.5 - Math.abs(k - 2) * 0.15).toFixed(2) + ')'); }
}
export function strandLine(g, x0, y0, x1, y1, alpha = 1) { line(g, x0, y0, x1, y1, al(SA.silkLo, 0.7 * alpha)); line(g, x0 + 1, y0, x1 + 1, y1, al(SA.silk, 0.95 * alpha)); }
const knotSprite = cut => once('kn' + cut, () => { const [c, g] = canvas(12, 12);
  if (cut) { circle(g, 6, 6, 3, SA.silkDeep); px(g, 5, 5, SA.silkLo); line(g, 6, 8, 4, 11, SA.silkDeep); line(g, 7, 8, 9, 11, SA.silkShade); return outline(c, '#0a0a10'); }
  circle(g, 6, 6, 4, SA.silkMid); circle(g, 5.5, 5.5, 2.5, SA.silk); px(g, 4, 4, '#ffffff'); rect(g, 3, 7, 6, 1, SA.silkLo); rect(g, 4, 9, 4, 1, SA.silkDeep);
  line(g, 3, 4, 9, 8, SA.silkLo); line(g, 9, 4, 3, 8, SA.silkLo); return outline(c, '#0a0a10'); });
export function drawKnot(g, x, y, cut, time, live = true) {
  g.drawImage(knotSprite(!!cut), R(x) - 6, R(y) - 6);
  if (!cut && live) { const ph = (time * 3) % 2; if (ph < 1) { px(g, R(x) - 1, R(y) - 7, '#ffffff'); px(g, R(x) + 3, R(y) - 4, '#ffffff'); } const rr = 7 + Math.floor(ph * 3); for (const [dx, dy] of [[-rr, 0], [rr, 0], [0, -rr], [0, rr]]) px(g, R(x) + dx, R(y) + dy, al(SA.amberHi, Math.max(0.1, 0.7 - ph * 0.4))); }   /* the glint: you can hit this */
}
/* the cocoon on its strand: a dead thing bound in silk, banded, a bare boot at the bottom; ~14 x 24 */
const cocoonSprite = () => once('coc', () => { const [c, g] = canvas(14, 24);
  ellipse(g, 7, 12, 5, 10, SA.silkLo); ellipse(g, 6.5, 11.5, 4, 9, SA.silkMid); ellipse(g, 6, 10, 2, 6, SA.silk);
  for (let k = 0; k < 8; k++) { const yy = 4 + k * 2.2, w = 4 - Math.abs(k - 3.5) * 0.35; rect(g, 7 - w - 1, R(yy), R(w * 2 + 2), 1, k & 1 ? SA.silkLo : SA.silkDeep); }
  rect(g, 6, 19, 3, 3, SA.boneLo); rect(g, 6, 22, 3, 1, SA.silkDeep); px(g, 7, 1, SA.silkDeep); px(g, 7, 2, SA.silkLo);
  return outline(c, '#0a0a10'); });
export function drawCocoon(g, x, top) { g.drawImage(cocoonSprite(), R(x) - 8, R(top) - 1); }
export function drawCocoonSplat(g, x, floorY) { rect(g, R(x) - 9, R(floorY) - 3, 18, 3, SA.silkMid); rect(g, R(x) - 6, R(floorY) - 5, 12, 2, SA.silk); rect(g, R(x) - 12, R(floorY) - 1, 24, 1, al(SA.slime, 0.8)); for (const dx of [-11, -4, 3, 10]) px(g, R(x) + dx, R(floorY) - 4 - Math.abs(dx % 3), SA.silkLo); }
/* sconce: an iron bracket and a bowl of amber fire, three flame frames; (x, y) is the bracket's foot */
const sconceBase = () => once('scb', () => { const [c, g] = canvas(12, 14); rect(g, 5, 4, 2, 10, SA.iron); rect(g, 2, 3, 8, 3, SA.ironHi); rect(g, 3, 5, 6, 3, SA.iron); rect(g, 4, 7, 4, 1, '#1a1820'); px(g, 3, 3, '#8a8696'); return outline(c, '#0a0a10'); });
const flameFrame = f => once('fl' + f, () => { const [c, g] = canvas(10, 14); const h = [9, 11, 8][f % 3], sw = [0, 1, -1][f % 3];
  ellipse(g, 5, 11, 4, 3, SA.amberLo); ellipse(g, 5 + sw * 0.5, 8, 3, h * 0.5, SA.ember); ellipse(g, 5 + sw, 7, 2, h * 0.4, SA.amber); ellipse(g, 5 + sw, 8, 1, h * 0.25, SA.amberHi); px(g, 5 + sw, 1 + (9 - h), SA.amber); return c; });
export function drawSconce(g, x, y, time, lit = true) { g.drawImage(sconceBase(), R(x) - 6, R(y) - 14); if (lit) { const f = Math.abs(Math.floor(time * 9 + x)) % 3; g.drawImage(flameFrame(f), R(x) - 5, R(y) - 25); } }
/* the torch in a hero's hand: a bound grip, a pitch head, the flame (it gutters when nearly out) */
export function drawTorch(g, x, y, time, low) { rect(g, R(x) - 1, R(y), 2, 9, '#3a2c24'); rect(g, R(x) - 1, R(y) + 2, 2, 1, SA.silkLo); rect(g, R(x) - 2, R(y) - 2, 4, 3, '#1a1414');
  if (low && (time * 6) % 2 < 1) { px(g, R(x), R(y) - 4, SA.amberLo); px(g, R(x) - 1, R(y) - 3, SA.amberDeep); return; } g.drawImage(flameFrame(Math.floor(time * 11) % 3), R(x) - 5, R(y) - 13); }
/* egg sac: st = 'whole' (k 0..1 = how close to bursting: pulses faster and brighter) | 'burst' | 'burned'; (x, y) = its foot */
const sacSprite = lvl => once('sac' + lvl, () => { const [c, g] = canvas(16, 18); const cols = [['#2e5c34', '#3e7a44', '#62a84e'], ['#3e7a44', '#62a84e', '#9ae67a'], ['#62a84e', '#9ae67a', '#dcffc8']][lvl];
  rect(g, 7, 0, 2, 5, SA.silkLo); line(g, 8, 4, 3, 9, SA.silkMid); line(g, 8, 4, 13, 9, SA.silkMid);
  for (const [ex, ey, r] of [[8, 11, 4.2], [4.5, 13, 3], [11.5, 13, 3]]) { circle(g, ex, ey, r, cols[0]); circle(g, ex - 0.4, ey - 0.4, r - 1, cols[1]); px(g, R(ex - 1), R(ey - 1), cols[2]); }
  for (let k = 0; k < 4; k++) px(g, 3 + k * 3, 8 + (k & 1), al(SA.silk, 0.7)); px(g, 8, 11, '#1a3a1c'); px(g, 5, 13, '#1a3a1c'); return outline(c, '#0a0a10'); });
export function drawSac(g, x, y, st, k, time) {
  if (st === 'whole') { const rate = 4 + 10 * k, on = (time * rate) % 2 < 1, lvl = k > 0.66 ? (on ? 2 : 1) : k > 0.2 ? (on ? 1 : 0) : (on && k > 0 ? 1 : 0); g.drawImage(sacSprite(lvl), R(x) - 8, R(y) - 18);
    if (lvl >= 1) { px(g, R(x) - 9, R(y) - 10, al(SA.egg, 0.5)); px(g, R(x) + 9, R(y) - 9, al(SA.egg, 0.5)); } }
  else if (st === 'burned') { rect(g, R(x) - 7, R(y) - 3, 14, 3, SA.char); rect(g, R(x) - 4, R(y) - 5, 8, 2, '#3a3030'); px(g, R(x) - 2, R(y) - 6, SA.ember); px(g, R(x) + 3, R(y) - 4, SA.amberLo); }
  else { rect(g, R(x) - 8, R(y) - 3, 16, 3, al(SA.slime, 0.8)); rect(g, R(x) - 5, R(y) - 5, 10, 2, al(SA.eggMid, 0.8)); for (const dx of [-7, -2, 4, 8]) rect(g, R(x) + dx, R(y) - 7 + Math.abs(dx) % 3, 2, 2, SA.silk); }
}
/* goo: a bubbling puddle of pale silk gum along the floor strip (x, floorTop, wPx) */
export function drawGoo(g, x, y, w, time) { rect(g, R(x), R(y) - 3, R(w), 3, al(SA.slime, 0.75)); rect(g, R(x), R(y) - 4, R(w), 1, al(SA.silk, 0.8));
  for (let k = 0; k < w; k += 5) { const h = 1 + ((k * 7 + Math.floor(time * 3 + k)) % 4 === 0 ? 2 : 0); px(g, R(x + k), R(y) - 4 - h + 1, SA.silk); if ((Math.floor(time * 2) + k) % 6 === 0) px(g, R(x + k + 1), R(y) - 7, al(SA.eggHi, 0.7)); }
  for (let k = 3; k < w; k += 9) rect(g, R(x + k), R(y) - 2, 2, 1, SA.silkDeep); }
/* the spitter's glob: a pale green blob with a trailing thread */
export function drawGlob(g, x, y, vx, vy) { const sp = Math.hypot(vx, vy) || 1, tx = -vx / sp, ty = -vy / sp; for (let k = 1; k < 6; k++) px(g, R(x + tx * k * 2), R(y + ty * k * 2), al(SA.silk, 0.8 - k * 0.14)); circle(g, R(x), R(y), 3.3, SA.eggMid); circle(g, R(x) - 0.5, R(y) - 0.5, 2.2, SA.slime); px(g, R(x) - 1, R(y) - 1, SA.eggHi); }
/* the lurker's thread (from the roof knot to the foe, or the told line down to the floor) */
export function drawThread(g, x, y0, y1, told, time) { const col = told && (time * 10) % 2 < 1 ? SA.ember : SA.silk; for (let yy = R(y0); yy < R(y1); yy++) px(g, R(x), yy, told && ((yy >> 1) & 1) ? '#ff4a2a' : (yy & 3 ? col : SA.silkLo)); if (told) for (let yy = R(y0) + 6; yy < R(y1); yy += 9) px(g, R(x) + 1, yy, '#ff4a2a'); }
/* a sticky wall that is burning: the amber fire eats up the sheet (n = 0..1 of its burn); the tile stays under it until the cell is gone */
export function drawWallBurn(g, x, top, hPx, n, time) { const front = hPx * (1 - n); for (let yy = 0; yy < hPx; yy += 2) { const inFire = yy > front - 5 && yy < front + 9; if (!inFire && yy >= front) continue; const f = Math.floor(time * 12 + yy) & 1;
    if (yy >= front) { rect(g, R(x) + 1, R(top + yy), 14, 2, al(f ? SA.ember : SA.amber, 0.9)); rect(g, R(x) + 4, R(top + yy), 6, 2, f ? SA.amberHi : SA.amber); } else rect(g, R(x), R(top + yy), 16, 2, 'rgba(36,28,28,0.85)'); }
  for (let k = 0; k < 6; k++) { const yy = front + 4 - ((time * 40 + k * 17) % 22), xx = 3 + ((k * 5 + Math.floor(time * 6)) % 10); if (yy > 0 && yy < hPx) px(g, R(x + xx), R(top + yy), al(SA.amberHi, 0.8)); } }

/* ================================ FOES ================================ */
/* the spider's own grids, tinted: SPIDERLING = pale silk-grey with a green-tinged belly (just hatched), WEB-SPITTER = a bloated olive body with a swollen glob sac */
const SP_ROWS = {
  hang: ['.....bb.....', '..l.bbbb.l..', '.l.bbbbbb.l.', 'l.bbrbbrbb.l', '.lbbbbbbbbl.', 'l..bbbbbb..l', '.l..bbbb..l.', 'l...l..l...l'],
  drop: ['l....bb....l', '.l..bbbb..l.', '..lbbbbbbl..', 'lllbbrbbrlll', '...bbbbbb...', '..l.bbbb.l..', '.l..l..l..l.', 'l..........l'],
  hang2: ['.....bb.....', '.l..bbbb..l.', '..lbbbbbbl..', '.lbbrbbrbbl.', 'l.bbbbbbbb.l', '.l.bbbbbb.l.', 'l...bbbb...l', '.l..l..l..l.'],
  climb1: ['l....bb....l', '.l..bbbb..l.', '..lbbbbbbl..', '..bbrbbrbb..', '.lbbbbbbbbl.', 'l..bbbbbb..l', '....bbbb....', '...l....l...'],
  climb2: ['.l...bb...l.', 'l...bbbb...l', '.l.bbbbbb.l.', '..bbrbbrbb..', '..lbbbbbbl..', '.l.bbbbbb.l.', 'l...bbbb...l', '....l..l....'],
  hurt: ['.....bb.....', '....bbbb....', '..lbbbbbbl..', '.lbbBbbBbbl.', '..bbbbbbbb..', '.l.bbbbbb.l.', '..l.bbbb.l..', '...l....l...'],
};
const subRow = (r, from, to) => r.split('').map((ch, j) => (ch === from ? to(j) : ch)).join('');
export function bakeSilkSkins() {
  return once('skins', () => {
    const OUT = '#0a0a10';
    const PL = { b: '#c8c8d8', h: '#eeeef8', B: '#2a2a3a', r: '#ff4a3a', l: '#8a8aa2', g: '#9ac888' };                                   /* spiderling: pale, red-eyed */
    const PS = { b: '#46503e', h: '#6a7a5a', B: '#1a1e16', r: '#ffd24a', l: '#2e3626', g: '#a6d488', G: '#d8ffc0' };                     /* spitter: yellow eyes, olive, a glob sac */
    const make = (pal, tint) => { const fr = Object.keys(SP_ROWS).map(k => outline(fromGrid(SP_ROWS[k].map((r, i) => tint(r, i, k)), pal, 1), OUT));
      return { R: fr, L: fr.map(c => flipX(c)), white: { R: fr.map(c => whiten(c)), L: fr.map(c => flipX(whiten(c))) }, ax: 7, ay: 9, w: 10, h: 8 }; };
    const skling = make(PL, (r, i) => (i === 2 ? subRow(r, 'b', j => (j % 3 === 0 ? 'h' : 'b')) : i === 5 || i === 6 ? subRow(r, 'b', () => 'g') : r));
    const skspitter = make(PS, (r, i) => (i === 4 || i === 5 ? subRow(r, 'b', j => (j > 3 && j < 8 ? 'g' : 'b')) : i === 6 ? subRow(r, 'b', () => 'G') : r));
    return { skling, skspitter };
  });
}

/* THE SILK LURKER: a long-legged pale thing that lives on the roof, a stretched grey body with a bone-pale mark and a mask of eyes. ~16 x 16, drawn per mode from (ex, ey) = e.x, e.y
   modes: hide (balled up) | threadTell (legs coming out, eyes red) | drop (legs thrown up) | ground (crouched) | biteTell (reared, fangs) | climb (hauling up) | fallen (on its back, stunned: x2) */
export function drawLurker(g, ex, ey, mode, face, time, tellOn) {
  const f = face || 1, K = '#cfcfdc', D = '#2e2e3c', M = '#6e6e86', Lg = '#a2a2b8';
  ex = R(ex); ey = R(ey);
  const leg = (x0, y0, kx, ky, x1, y1) => { line(g, ex + x0 * f, ey + y0, ex + kx * f, ey + ky, Lg); line(g, ex + kx * f, ey + ky, ex + x1 * f, ey + y1, M); px(g, ex + kx * f, ey + ky - 1, K); };
  const abd = (dy, rx = 5, ry = 4) => { ellipse(g, ex - 3 * f, ey + dy - 6, rx, ry, D); ellipse(g, ex - 3 * f, ey + dy - 7, rx - 1, ry - 1, '#3e3e50'); px(g, ex - 4 * f, ey + dy - 8, K); px(g, ex - 2 * f, ey + dy - 8, K); px(g, ex - 3 * f, ey + dy - 6, K); };
  const head = (dx, dy, eye) => { ellipse(g, ex + dx * f, ey + dy - 6, 3.6, 3, M); ellipse(g, ex + dx * f, ey + dy - 7, 2.6, 2, '#8a8aa2'); for (const k of [0, 2, 4]) px(g, ex + (dx - 1 + k * 0.5) * f, ey + dy - 7, eye); px(g, ex + (dx + 1) * f, ey + dy - 8, eye); };
  const eye = tellOn ? '#ff4a2a' : '#ffd36b';
  switch (mode) {
    case 'hide': ellipse(g, ex, ey - 4, 4.5, 3.5, D); ellipse(g, ex, ey - 5, 3.5, 2.5, '#3e3e50'); for (const dx of [-2, 0, 2]) px(g, ex + dx, ey - 5, eye); for (let k = 0; k < 4; k++) { line(g, ex - 4, ey - 4, ex - 7 + k, ey + 1, M); line(g, ex + 4, ey - 4, ex + 7 - k, ey + 1, M); } break;
    case 'threadTell': for (let k = 0; k < 4; k++) { leg(-2, -5, -8 - k, -9 + k * 3, -10 - k * 2, 2 + k); leg(2, -5, 8 + k, -9 + k * 3, 10 + k * 2, 2 + k); } abd(0); head(4, 0, '#ff4a2a'); break;
    case 'drop': for (let k = 0; k < 4; k++) { leg(-2, -5, -7 - k * 2, -12 - k, -9 - k * 3, -6 - k * 2); leg(2, -5, 7 + k * 2, -12 - k, 9 + k * 3, -6 - k * 2); } abd(-1, 4, 4); head(3, -1, '#ff4a2a'); break;
    case 'ground': for (let k = 0; k < 4; k++) { leg(-2, -4, -5 - k * 2, -9 + (k & 1), -7 - k * 3, 0); leg(2, -4, 5 + k * 2, -9 + (k & 1), 7 + k * 3, 0); } abd(2, 5, 3); head(5, 2, eye); break;
    case 'biteTell': for (let k = 0; k < 4; k++) leg(-2, -4, -5 - k * 2, -9, -7 - k * 3, 0); for (let k = 0; k < 3; k++) leg(2, -5, 6 + k * 2, -12 - k * 2, 10 + k * 3, -8 - k * 3); abd(3, 5, 4); head(5, -3, '#ff4a2a'); rect(g, ex + 7 * f - (f < 0 ? 1 : 0), ey - 6, 1, 4, K); rect(g, ex + 9 * f - (f < 0 ? 1 : 0), ey - 6, 1, 4, K); break;
    case 'climb': { const w = Math.floor(time * 8) & 1; for (let k = 0; k < 4; k++) { leg(-2, -5, -8 - k, -11 + w * 2, -6 - k * 2, -17 + w * 3); leg(2, -5, 8 + k, -11 + (1 - w) * 2, 6 + k * 2, -17 + (1 - w) * 3); } abd(2, 4, 4); head(0, -2, eye); break; }
    case 'fallen': for (let k = 0; k < 4; k++) { line(g, ex - 3, ey - 5, ex - 6 - k, ey - 12 + k, M); line(g, ex + 3, ey - 5, ex + 6 + k, ey - 12 + k, M); } ellipse(g, ex, ey - 4, 6, 3, '#3e3e50'); ellipse(g, ex, ey - 3, 5, 2, '#5e5e74'); head(5, 3, '#2a2a36'); rect(g, ex - 8, ey - 15, 16, 2, SA.amber);
      for (let k = 0; k < 3; k++) px(g, ex - 5 + k * 5 + Math.floor(Math.sin(time * 8 + k) * 2), ey - 17 - (k & 1), SA.amberHi); break;
    default: for (let k = 0; k < 4; k++) { leg(-2, -5, -6 - k * 2, -10, -8 - k * 3, 0); leg(2, -5, 6 + k * 2, -10, 8 + k * 3, 0); } abd(0); head(4, 0, eye);
  }
}
