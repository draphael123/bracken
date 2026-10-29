// src/redraw/warcairn_world_art.js - THE WAR CAIRN's world, DRAWN (claude/warcairnart; the greybox was flat rects in src/war-cairn-hands.js drawWorld).
// High, bare, bright morning: grey granite with orange and green lichen, slate-blue shadow, wind-crusted snow in patches. Nothing here is timber or logs - the clan hangs
// HIDE on BONE and ANTLER, hangs slate on iron chain, and stacks stone. Immediate-mode drawing (a few dozen fillRects a prop); sizes and footprints are the greybox's, so the
// level, its hitboxes and its hash are untouched.
//   drum(g, x, y, st, time)         THE WAR DRUM: hide laced on a barrel, on two granite footings, antlers rising from the posts; st = { spent, his, beat, by, arena, answer }
//   gate(g, x, y, w, h, open, openT, id, time)   THE DRUM GATE: hide on a bone frame between stone posts; swings open on its left post (own easing per id)
//   slab(g, x, y, w, level, time)   a CHAINED SLATE SLAB between carved posts: hanging (tilted) or swung level
//   cornice(g, x, y, w, state, time)  a snow cornice: whole, cracked (a seam and a puff), (falling chunks while it goes)
//   hold(g, x, y, dir)              a DRIVEN HATCHET (a foothold): the bit sunk in the rock, the haft out
//   post(g, x, y0, y1)              a CARVED POST of a slate span (axe-mark at the head)
//   props()                         baked props: totem[2] (the deco kind 'totem')
//   drummerDrum(g, x, y, f, count, k)  the drum on THE DRUMMER's back and his sticks
//   dressChieftain(sheet)           stamps the Chieftain's gear (antler crown, war paint, bearskin mantle) onto SPR.bzchief's frames
import { canvas, px, rect, fillPoly, line, ellipse, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

const K = { g0: '#4a4744', g1: '#6e6a62', g2: '#8e8a84', g3: '#b0aca4', slate0: '#3e4656', slate1: '#5a6676', slate2: '#7a8a9c', slate3: '#a8b8c8', bone: '#e8dcc0', boneD: '#b0a488', boneDD: '#7a7058',
  hide: '#b89a72', hideD: '#8e7048', hideDD: '#5e4a30', hideL: '#d8bc90', spent: '#7a6a58', spentD: '#5a4c3e', paint: '#c0281c', paintD: '#7e140f', paintL: '#e8604a', lichenO: '#d8923a', lichenG: '#98a85a',
  rope: '#d8c8a0', steel: '#c8ccd4', steelD: '#8a93a3', steelL: '#f0f4fa', haft: '#6a4428', haftD: '#4a2e18', snow: '#f2f6fa', snowS: '#bccadc', snowD: '#8ea0b8', chain: '#5a5854', chainL: '#9a9890', ember: '#ffb04a' };
const R = Math.round;

/* ---------- granite helpers ---------- */
function granite(g, x, y, w, h, seed = 0) { rect(g, x, y, w, h, K.g1); rect(g, x, y, w, 1, K.g3); rect(g, x, y, 1, h, K.g2); rect(g, x + w - 1, y, 1, h, K.g0); rect(g, x, y + h - 1, w, 1, K.g0);
  for (let i = 0; i < 3; i++) { const a = (seed * 7 + i * 5) % Math.max(1, w - 2), b = (seed * 3 + i * 7) % Math.max(1, h - 2); px(g, x + 1 + a, y + 1 + b, K.g2); px(g, x + 1 + ((a + 3) % Math.max(1, w - 2)), y + 1 + ((b + 4) % Math.max(1, h - 2)), K.g0); }
  if (seed % 2 === 0 && w > 4) { px(g, x + 1, y, K.lichenO); px(g, x + 2, y, K.lichenO); } else if (w > 4) { px(g, x + w - 3, y, K.lichenG); px(g, x + w - 2, y, K.lichenG); } }

/* ---------- THE WAR DRUM ---------- */
export function drum(g, x, y, st, time) {
  x = R(x); y = R(y); const dim = st.spent > 0 && !st.his, body = st.his ? '#b0241a' : dim ? K.spent : K.hide, bodyD = st.his ? K.paintD : dim ? K.spentD : K.hideD, bodyL = st.his ? K.paintL : dim ? '#948470' : K.hideL;
  const bump = st.beat > 0 ? R(Math.sin(Math.min(1, (0.5 - st.beat) * 4) * Math.PI) * 2) : 0;
  /* the granite footings, a slab for the drum to sit on */
  granite(g, x - 10, y - 4, 6, 4, 1); granite(g, x + 4, y - 4, 6, 4, 2); rect(g, x - 9, y - 6, 18, 2, K.slate1); rect(g, x - 9, y - 6, 18, 1, K.slate2);
  /* the antlers: two curved tines rising from the footings, a crossbar of bone between them at the drum's head */
  for (const s of [-1, 1]) { const bx = x + s * 9; line(g, bx, y - 6, bx + s * 1, y - 14, K.bone); line(g, bx + s, y - 14, bx + s * 3, y - 22, K.bone); line(g, bx + s * 3, y - 22, bx + s * 2, y - 27, K.bone);
    line(g, bx + s, y - 17, bx + s * 4, y - 19, K.bone); line(g, bx + s * 3, y - 22, bx + s * 5, y - 24, K.boneD); px(g, bx + s * 2, y - 28, K.bone); px(g, bx + s * 5, y - 25, K.boneD); }
  /* the barrel: hide stretched and laced, a bulge in the middle, a painted band */
  fillPoly(g, [[x - 8, y - 7], [x - 9, y - 12], [x - 8, y - 17], [x + 8, y - 17], [x + 9, y - 12], [x + 8, y - 7]], body);
  rect(g, x - 9, y - 12, 1, 2, bodyD); line(g, x - 8, y - 16, x - 8, y - 8, bodyL); rect(g, x + 6, y - 16, 2, 9, bodyD); rect(g, x - 8, y - 8, 16, 1, bodyD);
  rect(g, x - 8, y - 13, 16, 3, st.his ? '#701008' : K.paint); rect(g, x - 8, y - 13, 16, 1, st.his ? K.paintL : K.paintL);                                               // the red war-paint band
  px(g, x - 2, y - 12, K.bone); px(g, x - 1, y - 11, K.bone); px(g, x, y - 12, K.bone); px(g, x + 1, y - 11, K.bone); px(g, x + 2, y - 12, K.bone);              // a white zigzag (the axe mark)
  for (let i = -7; i <= 6; i += 3) { px(g, x + i, y - 16, K.rope); px(g, x + i + 1, y - 15, K.rope); px(g, x + i, y - 8, K.rope); px(g, x + i + 1, y - 9, K.rope); }  // lacing, top and bottom
  /* the head: a pale hide ellipse (it bulges on a beat; slack, dished and dim when spent) */
  const hc = st.his ? '#e07858' : dim ? '#8a7a68' : '#ece0c4';
  ellipse(g, x, y - 17 - bump, 8, 2.6 + (dim ? 0 : 0.4), K.boneD); ellipse(g, x, y - 17 - bump, 7, 2, hc); if (dim) { ellipse(g, x + 1, y - 16.5, 4, 1, K.spentD); }
  /* the tightening glow (spent < 1.2) and HIS drum's embers */
  if (st.spent > 0 && st.spent < 1.2) { g.globalAlpha = 1 - st.spent / 1.2; rect(g, x - 8, y - 19, 16, 2, '#ffd36b'); g.globalAlpha = 1; }
  if (st.his) { for (let i = 0; i < 5; i++) { const t = (time * 1.6 + i * 0.37) % 1; g.globalAlpha = 1 - t; px(g, x - 6 + i * 3 + R(Math.sin(time * 5 + i) * 1.5), y - 20 - R(t * 14), i % 2 ? K.ember : K.paintL); } g.globalAlpha = 1; }
  /* the beat's ring and an arena drum's call */
  if (st.beatR != null && st.beat > 0) { g.globalAlpha = st.beat * 2; g.strokeStyle = st.by === 'drummer' ? '#ff4a3a' : '#ffd36b'; g.beginPath(); g.arc(x, y - 10, st.beatR, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
  if (st.arena && st.answer > 0) { g.globalAlpha = Math.min(1, st.answer); rect(g, x - 9, y - 30 - R(Math.abs(Math.sin(time * 9)) * 3), 18, 2, '#ff4a3a'); g.globalAlpha = 1; }
}

/* ---------- THE DRUM GATES ---------- */
const GATE = new Map();   /* id -> eased swing 0 (shut) .. 1 (open) */
export function gate(g, x, y, w, h, open, openT, id, time) {
  x = R(x); y = R(y); w = R(w); h = R(h);
  const e = GATE.get(id) || { p: open ? 1 : 0, t: time }; const dt = Math.max(0, Math.min(0.1, time - e.t)); e.t = time; e.p = open ? Math.min(1, e.p + dt * 5) : Math.max(0, e.p - dt * 4); GATE.set(id, e);
  /* the stone posts either side (granite), the lintel frame in bone */
  granite(g, x - 3, y - 2, 4, h + 2, 3); granite(g, x + w - 1, y - 2, 4, h + 2, 4);
  const pw = Math.max(2, R(w * (1 - e.p)));                                                                                                           // the hide swings on its LEFT post: edge-on as it opens
  if (pw > 2) {
    rect(g, x + 1, y, pw - 1, h, K.hide); rect(g, x + 1, y, pw - 1, 1, K.hideL); rect(g, x + pw - 1, y, 1, h, K.hideD);
    for (let k = 4; k < pw - 2; k += 6) { rect(g, x + k, y + 1, 1, h - 2, K.hideD); if ((k / 6 | 0) % 2) for (let j = 3; j < h - 3; j += 4) px(g, x + k + 1, y + j, K.rope); }  // stitched seams
    const mid = y + R(h / 2); if (pw > 12) { rect(g, x + R(pw / 2) - 4, mid - 3, 9, 7, K.paint); line(g, x + R(pw / 2) - 3, mid - 2, x + R(pw / 2) + 3, mid + 3, K.bone); line(g, x + R(pw / 2) + 3, mid - 2, x + R(pw / 2) - 3, mid + 3, K.bone); }   // the red crossed-axes mark
    rect(g, x + 1, y, pw - 1, 2, K.bone); rect(g, x + 1, y + h - 2, pw - 1, 2, K.bone); for (let k = 2; k < pw - 1; k += 5) { px(g, x + k, y, K.boneD); px(g, x + k, y + h - 1, K.boneD); }   // bone ribs top and bottom
  }
  rect(g, x, y - 2, 2, h + 2, K.bone); rect(g, x, y - 2, 1, h + 2, K.boneD);                                                                           // the hinge post: a bone pole
  if (e.p > 0.5 && openT > 0) { const a = Math.min(1, openT / 1.2); g.globalAlpha = a * (e.p - 0.5) * 2; rect(g, x, y - 3, w, 2, '#ffd36b'); g.globalAlpha = 1; }
}

/* ---------- THE CHAINED SLATE SLABS ---------- */
function chain(g, x, y0, y1) { for (let y = y0; y < y1; y += 2) { px(g, x, y, ((y - y0) >> 1) % 2 ? K.chainL : K.chain); if (((y - y0) >> 1) % 2) px(g, x + 1, y, K.chain); } }
export function post(g, x, y0, y1, seed = 0) { x = R(x); y0 = R(y0); const h = R(y1 - y0); if (h < 4) return; granite(g, x, y0, 7, h, seed); rect(g, x + 1, y0, 5, 2, K.slate2);
  if (h > 14) { const my = y0 + 5; line(g, x + 2, my, x + 4, my + 4, K.g0); line(g, x + 4, my, x + 2, my + 4, K.g0); px(g, x + 3, my + 2, K.paint); } }                                  // an axe-mark cut in the post, paint in the cut
export function slab(g, x, y, w, level, time) {
  x = R(x); y = R(y); w = R(w);
  post(g, x - 1, y - 42, y + 2, 1); post(g, x + w - 6, y - 42, y + 2, 2);
  chain(g, x + 3, y - 40, y); chain(g, x + w - 3, y - 40, level ? y : y + 24);
  if (level) { rect(g, x, y, w, 7, K.slate1); rect(g, x, y, w, 2, K.slate3); rect(g, x, y + 2, w, 1, K.slate2); rect(g, x, y + 6, w, 1, K.slate0);
    for (let i = 5; i < w - 3; i += 9) { px(g, x + i, y + 3, K.slate0); px(g, x + i + 1, y + 4, K.slate0); } for (let i = 3; i < w - 2; i += 13) { px(g, x + i, y, K.lichenO); px(g, x + i + 1, y, K.lichenG); }
    px(g, x + 1, y + 7, K.chain); px(g, x + w - 2, y + 7, K.chain); }
  else { fillPoly(g, [[x, y], [x + w, y + 24], [x + w, y + 31], [x, y + 7]], K.slate1); line(g, x, y, x + w, y + 24, K.slate3); line(g, x, y + 1, x + w, y + 25, K.slate2); line(g, x, y + 7, x + w, y + 31, K.slate0);
    for (let i = 6; i < w - 4; i += 11) px(g, x + i, y + 3 + R(i * 24 / w), K.slate0); } }

/* ---------- THE SNOW CORNICES ---------- */
export function cornice(g, x, y, w, state, time) {
  x = R(x); y = R(y); w = R(w);
  rect(g, x, y, w, 4, K.snow); rect(g, x, y + 4, w, 2, K.snowS); rect(g, x, y, w, 1, '#ffffff');
  for (let i = 0; i < w; i += 5) { const d = (i * 7 + 3) % 4; rect(g, x + i, y + 6, 3, 1 + d % 2, K.snowS); px(g, x + i + 1, y + 7 + d % 2, K.snowD); }                              // the scalloped underlip: wind-carved
  px(g, x, y + 4, K.snowD); px(g, x + w - 1, y + 4, K.snowD);
  if (state === 'crack') { const sh = Math.sin(time * 60); for (let k = 4; k < w; k += 9) { line(g, x + k + sh, y, x + k + 2 + sh, y + 3, K.snowD); px(g, x + k + 2 + sh, y + 4, K.g0); } for (let i = 0; i < 4; i++) px(g, x + ((time * 40 + i * 13) % w) | 0, y + 8 + ((time * 30 + i * 5) % 8 | 0), K.snow); } }

/* ---------- THE DRIVEN HATCHET ---------- */
export function hold(g, x, y, dir) {
  x = R(x); y = R(y); const wallX = x + (dir > 0 ? 16 : 0), s = dir > 0 ? -1 : 1;                                                                                  // s: toward the open air
  rect(g, wallX - (dir > 0 ? 4 : 0), y - 3, 4, 8, K.g0);                                                                                                      // the wall it bites into
  for (let i = 1; i <= 10; i++) { px(g, wallX + s * i, y + 1, K.haft); px(g, wallX + s * i, y + 2, i < 8 ? K.haft : K.haftD); if (i % 3 === 0) { px(g, wallX + s * i, y + 1, K.rope); px(g, wallX + s * i, y + 2, K.rope); } }
  px(g, wallX + s * 10, y + 1, K.bone); px(g, wallX + s * 10, y + 2, K.boneD);                                                                                // a worn pale tip: a thousand hands
  fillPoly(g, [[wallX - s * 1, y - 2], [wallX + s * 2, y + 0], [wallX + s * 2, y + 4], [wallX - s * 1, y + 6]], K.steel); line(g, wallX - s * 1, y - 2, wallX - s * 1, y + 6, K.steelL); px(g, wallX + s * 2, y + 2, K.steelD);
  px(g, wallX + s * 3, y - 1, K.g3); px(g, wallX + s * 3, y + 5, K.g3); }                                                                                       // chips of rock round the bite

/* ---------- THE DRUMMER'S DRUM AND STICKS (over his body) ---------- */
export function drummerDrum(g, x, y, face, count, tt) {
  x = R(x); y = R(y); const bx = x - face * 6;
  rect(g, bx - 4, y - 14, 8, 8, K.hide); rect(g, bx - 4, y - 14, 8, 1, K.hideL); rect(g, bx + 3, y - 14, 1, 8, K.hideD); rect(g, bx - 4, y - 10, 8, 2, K.paint); ellipse(g, bx, y - 14, 4, 1.4, '#ece0c4');
  px(g, bx - 3, y - 7, K.rope); px(g, bx - 1, y - 6, K.rope); px(g, bx + 1, y - 7, K.rope); line(g, bx - 4, y - 14, bx - 6, y - 17, K.bone); line(g, bx + 3, y - 14, bx + 5, y - 17, K.bone);   // antler tines
  if (count) { const k = Math.floor(tt * 8) % 2; rect(g, x + face * 3, y - 16 - k * 2, 1, 6, K.bone); rect(g, x + face * 3, y - 17 - k * 2, 2, 1, K.paint); } }

/* ---------- BAKED PROPS ---------- */
let PROPS = null;
function bakeTotem(v) { const W = 24, H = 52, [c, g] = canvas(W, H), cx = 12;
  granite(g, cx - 6, H - 6, 12, 6, v + 1); granite(g, cx - 4, H - 9, 8, 3, v + 2);                                                                            // a stacked-stone foot
  rect(g, cx - 3, 8, 6, H - 16, '#8a7a62'); rect(g, cx - 3, 8, 1, H - 16, '#a89878'); rect(g, cx + 2, 8, 1, H - 16, '#5e5240');                                 // the post: weathered, pale
  for (const [yy, kind] of [[12, 'skull'], [26, 'mask'], [38, 'bear']]) {
    if (kind === 'skull') { ellipse(g, cx, yy, 4, 3.4, K.bone); rect(g, cx - 3, yy + 2, 6, 3, K.bone); rect(g, cx - 2, yy - 1, 2, 2, '#2e2218'); rect(g, cx + 1, yy - 1, 2, 2, '#2e2218'); px(g, cx, yy + 2, '#2e2218'); for (let i = 0; i < 3; i++) px(g, cx - 2 + i * 2, yy + 4, '#2e2218'); }
    else if (kind === 'mask') { rect(g, cx - 5, yy - 4, 10, 9, K.paint); rect(g, cx - 5, yy - 4, 10, 1, K.paintL); rect(g, cx - 4, yy - 1, 3, 2, K.bone); rect(g, cx + 1, yy - 1, 3, 2, K.bone); px(g, cx - 3, yy - 1, '#2e2218'); px(g, cx + 2, yy - 1, '#2e2218'); rect(g, cx - 2, yy + 2, 5, 1, K.bone); for (let i = 0; i < 4; i++) px(g, cx - 2 + i * 1.3, yy + 3, K.bone); }
    else { fillPoly(g, [[cx - 6, yy - 3], [cx + 6, yy - 3], [cx + 5, yy + 5], [cx - 5, yy + 5]], '#4a3a2e'); rect(g, cx - 6, yy - 3, 12, 1, '#6e5a48'); rect(g, cx - 2, yy - 1, 1, 1, K.bone); rect(g, cx + 2, yy - 1, 1, 1, K.bone); rect(g, cx - 1, yy + 1, 3, 2, '#2e2218'); } }
  for (const s of [-1, 1]) { line(g, cx + s * 3, 9, cx + s * 7, 3, K.bone); line(g, cx + s * 7, 3, cx + s * 9, 1, K.bone); line(g, cx + s * 5, 6, cx + s * 8, 7, K.boneD); }        // antlers at the crown
  for (let i = 0; i < 4; i++) { line(g, cx - 3, 19 + i * 12, cx - 7, 24 + i * 12, K.paintD); px(g, cx - 7, 24 + i * 12, K.paint); }                               // hide strips, red, hanging
  outline(c, OUT); return c; }
export function props() { if (PROPS) return PROPS; PROPS = { totem: [bakeTotem(0), bakeTotem(1)] }; return PROPS; }

/* ---------- THE CHIEFTAIN'S GEAR on the hero Berserker's sheet ---------- */
/* find the head in a frame: the berserker's skin pixels in the upper part of the sprite (a raised axe is steel/brown, not skin) */
function headOf(c) { const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; let t0 = -1, l0 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 200) { if (t0 < 0) t0 = y; l0 = y; }
  if (t0 < 0) return null; const lim = t0 + Math.floor((l0 - t0) * 0.7); let n = 0, sx = 0, sy = 0, left = 1e9, right = -1;
  const isSkin = i => d[i + 3] > 200 && d[i] > 190 && d[i + 1] > 140 && d[i + 1] < 200 && d[i + 2] > 90 && d[i + 2] < 150 && d[i] > d[i + 1] + 25;                    // the hero's face: #eeaa77
  const isHair = i => d[i + 3] > 200 && d[i] > 170 && d[i + 1] > 70 && d[i + 1] < 130 && d[i + 2] < 70;                                                                 // and his orange hair: #cc6622
  for (let y = t0; y <= lim; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (isSkin(i)) { n++; sx += x; sy += y; if (x < left) left = x; if (x > right) right = x; } }
  if (n < 4) return null; const hx = sx / n, hy = sy / n; let top = Math.round(hy);
  for (let y = Math.round(hy) - 7; y < Math.round(hy); y++) for (let x = Math.round(hx) - 5; x <= Math.round(hx) + 5; x++) { const i = (y * c.width + x) * 4; if (y >= 0 && (isHair(i) || isSkin(i)) && y < top) top = y; }
  return { x: hx, y: hy, top, left, right }; }
export function dressChieftain(S) {
  if (!S || !S.R) return S;
  const R2 = S.R.map(c => { const h = headOf(c); if (!h) return c; const [o, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0);
    const hx = Math.round(h.x), top = Math.round(h.top), hy = Math.round(h.y);
    /* war paint: a red band across the eyes, over the skin pixels only */
    const d = g.getImageData(0, 0, c.width, c.height), data = d.data; for (let y = hy - 1; y <= hy; y++) for (let x = h.left; x <= h.right; x++) { const i = (y * c.width + x) * 4; if (data[i + 3] > 200 && data[i] > 150 && data[i] > data[i + 1] + 25) { data[i] = 192; data[i + 1] = 40; data[i + 2] = 28; } } g.putImageData(d, 0, 0);
    /* the antler-and-bone crown on the brow, two tines up and out */
    rect(g, hx - 3, top, 7, 1, K.bone); px(g, hx - 3, top + 1, K.boneD); px(g, hx + 3, top + 1, K.boneD);
    line(g, hx - 3, top, hx - 5, top - 3, K.bone); line(g, hx - 5, top - 3, hx - 7, top - 4, K.bone); line(g, hx - 4, top - 1, hx - 6, top - 1, K.boneD);
    line(g, hx + 3, top, hx + 5, top - 3, K.bone); line(g, hx + 5, top - 3, hx + 7, top - 4, K.bone); line(g, hx + 4, top - 1, hx + 6, top - 1, K.boneD);
    /* the bearskin mantle over both shoulders: a dark fur collar a few rows under the chin, with a lighter fringe */
    const my = Math.min(c.height - 8, Math.round(h.y + 4)); rect(g, hx - 7, my, 14, 3, '#4a3a2e'); rect(g, hx - 7, my, 14, 1, '#6e5a48'); for (let i = -6; i <= 6; i += 2) px(g, hx + i, my + 3, '#2e2218'); px(g, hx - 8, my + 1, '#4a3a2e'); px(g, hx + 7, my + 1, '#4a3a2e');
    outline(o, OUT); return o; });
  const W = R2.map(c => whiten(c)); S.R = R2; S.L = R2.map(c => flipX(c)); S.white = { R: W, L: W.map(c => flipX(c)) }; return S;
}

/* ---------- THE CHIEFTAIN'S HATCHET (in flight, spinning; or standing in the floor) and the crossed axes of TAKE IT ---------- */
function hatchetShape(g, len, hs) { rect(g, -len / 2, -1, len, 2, K.haft); rect(g, -len / 2 + 2, -1, 1, 2, K.rope); rect(g, -len / 2 + 5, -1, 1, 2, K.rope);
  fillPoly(g, [[len / 2 - 3, -1], [len / 2 + 1, -hs], [len / 2 + 3, -hs + 1], [len / 2 + 3, hs - 2], [len / 2 + 1, hs - 1], [len / 2 - 3, 1]], K.steel); line(g, len / 2 + 3, -hs + 1, len / 2 + 3, hs - 2, K.steelL); px(g, len / 2 - 1, 0, K.steelD); }
export function chiefHatchet(g, x, y, time, fly) { x = R(x); y = R(y); g.save(); g.translate(x, y);
  if (fly) { g.rotate(time * 22); hatchetShape(g, 13, 5); } else { g.translate(0, -7); g.rotate(-Math.PI / 2 + 0.12); hatchetShape(g, 16, 5); } g.restore();
  if (!fly) { rect(g, x - 3, y - 1, 7, 2, K.g0); px(g, x - 4, y - 2, K.g3); px(g, x + 4, y - 2, K.g3); } }
export function crossedAxes(g, x, y, hit, time) { g.save(); g.translate(R(x), R(y)); const pulse = hit ? 1 : 0.8 + 0.2 * Math.sin(time * 18);
  for (const s of [-1, 1]) { g.save(); g.rotate(s * 0.75); hatchetShape(g, 22, 7); g.restore(); } g.restore();
  g.globalAlpha = 0.5 * pulse; g.strokeStyle = hit ? '#ffffff' : '#ff9a5c'; g.beginPath(); g.arc(R(x), R(y), 15, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }

/* ---------- THE CLAN ON THE RIM (deco only: no entity, no hitbox, no level data) ----------
   crowd(g, x0, x1, y, time, st): clansmen standing along the arena's rim (feet at row y), x0..x1 in screen px. Dark slate silhouettes with a pale face dot, a hide cloak,
   antlers on some; they bob to the drum and throw an axe up when `st.cheer` (a beat lately). Positions are a pure function of the column (stable, seeded). */
export function crowd(g, x0, x1, y, time, st = {}) {
  const base = Math.floor((x0 - 6) / 11); const cheer = st.cheer ? 1 : 0;
  for (let i = base; i * 11 < x1 + 6; i++) {
    const h = Math.imul(i * 2654435761 | 0, 1274126177) >>> 0, x = i * 11 + (h % 5) - 2; if (x < x0 - 8 || x > x1 + 8) continue;
    if (h % 7 === 0) continue;                                                                    /* gaps in the line */
    const ph = ((h >> 4) % 100) / 100 * 6.28, bob = Math.max(0, Math.sin(time * 5.5 + ph)) * (cheer ? 2 : 1) | 0, yy = R(y) - bob, xx = R(x - x0 + x0);
    const tall = 9 + (h >> 9) % 3, cloak = (h >> 12) % 2 ? K.hideDD : K.slate0;
    rect(g, xx - 2, yy - tall + 4, 5, tall - 4, cloak); rect(g, xx - 2, yy - 2, 2, 2, K.g0); rect(g, xx + 1, yy - 2, 2, 2, K.g0);       /* body, legs */
    rect(g, xx - 1, yy - tall + 1, 3, 3, K.hideL); px(g, xx, yy - tall + 2, K.g0);                                                      /* head, an eye */
    rect(g, xx - 2, yy - tall, 5, 1, (h >> 14) % 3 ? K.hideDD : K.g0);                                                                   /* hair */
    if ((h >> 16) % 4 === 0) { px(g, xx - 2, yy - tall - 1, K.bone); px(g, xx + 2, yy - tall - 1, K.bone); px(g, xx - 2, yy - tall - 2, K.bone); px(g, xx + 2, yy - tall - 2, K.bone); }   /* antlers */
    if (cheer || (h >> 18) % 3 === 0) { const ax = xx + 3; rect(g, ax, yy - tall - 3 + (cheer ? 0 : 2), 1, 6, K.haft); rect(g, ax + 1, yy - tall - 3 + (cheer ? 0 : 2), 2, 2, K.steel); }   /* an axe raised */
  }
}

/* ---------- THE SKYLINE (claude/warcairnart): HIGHCROWN far below, the GREAT CAIRN far ahead; drawn over the far crag layers, under the near ones ---------- */
export function skyline(g, cx, cy, VW, VH, cairnX, time) {
  const dy = R(-cy * 0.06);
  /* HIGHCROWN: a castle on its hill at the far horizon, slow (the road starts in sight of it, the summit leaves it behind); pale blue with haze, banner on the keep */
  { const sx = R(60 - cx * 0.05), by = R(VH * 0.60) + dy; if (sx > -90 && sx < VW + 10) { g.globalAlpha = 0.62;
    rect(g, sx - 6, by - 3, 84, 3, '#8c9cb8'); rect(g, sx, by - 6, 72, 3, '#8494b0');                                              /* the hill */
    rect(g, sx + 6, by - 14, 60, 8, '#7888a6'); for (let x = sx + 6; x < sx + 66; x += 4) rect(g, x, by - 16, 2, 2, '#7888a6');       /* the curtain wall and its crenels */
    for (const [tx, th] of [[sx + 2, 20], [sx + 30, 30], [sx + 60, 22]]) { rect(g, tx, by - th - 6, 10, th, '#6e7e9e'); for (let x = tx; x < tx + 10; x += 4) rect(g, x, by - th - 8, 2, 2, '#6e7e9e'); rect(g, tx + 4, by - th - 1, 2, 3, '#4a5876'); }   /* three towers */
    rect(g, sx + 34, by - 46, 2, 16, '#6e7e9e'); rect(g, sx + 36, by - 46, 6 + R(Math.sin(time * 2) * 1), 3, '#b45a56');             /* the keep's banner */
    g.globalAlpha = 1; } }
  /* THE GREAT CAIRN: a stacked cone of dark slate with the clan's pole, antlers and a red rag at the top; it stands over the summit and comes into view as the road climbs */
  { const sx = R(VW / 2 + (cairnX - (cx + VW / 2)) * 0.35), by = R(VH * 0.74) + dy; if (sx > -60 && sx < VW + 60) { g.globalAlpha = 0.8;
    for (let i = 0; i < 9; i++) { const w = 44 - i * 4, y = by - i * 6; rect(g, sx - (w >> 1), y - 6, w, 6, i % 2 ? '#4e586a' : '#566074'); rect(g, sx - (w >> 1), y - 6, w, 1, '#7a869c'); rect(g, sx - (w >> 1) + ((i * 7) % Math.max(4, w - 6)), y - 5, 1, 4, '#3a4252'); }
    rect(g, sx - 1, by - 54 - 24, 2, 26, '#3a2e24'); rect(g, sx - 6, by - 54 - 24, 12, 1, '#e8dcc0'); rect(g, sx - 6, by - 54 - 28, 1, 4, '#e8dcc0'); rect(g, sx + 5, by - 54 - 28, 1, 4, '#e8dcc0');
    rect(g, sx + 1, by - 54 - 20, 8 + R(Math.sin(time * 3) * 1), 4, '#c0281c'); g.globalAlpha = 1; } }
}
