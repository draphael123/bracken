// src/redraw/warcairn_art2.js - THE WAR CAIRN 2's ART PASS 2 (claude/warcairn2art, Sonnet, 10-30; Daniel approved the direction). DRAW-ONLY: no tile, entity or number moves, the level hash is unchanged.
// Slate and snow, war-paint red, hide and antler and bone and iron. Nothing here is timber or logs (twig nests are twigs; the hatchet's haft is a haft). Immediate mode, a few dozen
// fillRects a piece, deterministic from the inputs and the clock.
//   PROPS (a fixed table of art-only pieces, placed by column + feet row, never an entity):  banner, tent, firepit, extra totems, smoke;  snowCaps() lays drifts on every flat top and
//   wind-scoured streaks on the faces (it asks the world only "is this cell solid", through the callback it is handed).
//   THE HATCHET KIT:  hatchet, rack, hauledBridge + haulRope + cutRope, hangStone, hangTotem (+ shards), nest (+ debris), glint, carry/throw pose.
//   THE SUMMIT:  cairn (the bigger one) + brazier (iron bowl on antler legs).   THE CHIEFTAIN:  rageBar, frenzyAura, counterArc, staggerHatchet, tugThong.
import { canvas, px, rect, fillPoly, line, ellipse, outline } from '../px.js';
import { OUT } from '../art.js';

export const K = { slate0: '#2e3644', slate1: '#44505e', slate2: '#5c6a7a', slate3: '#8296aa', slate4: '#b0c2d4', snow: '#f4f8fc', snowS: '#c4d2e4', snowD: '#94a8c4',
  paint: '#c0281c', paintD: '#7e140f', paintL: '#e8604a', bone: '#e8dcc0', boneD: '#b0a488', boneDD: '#7a7058', hide: '#b89a72', hideD: '#8e7048', hideDD: '#5e4a30', hideL: '#d8bc90',
  rope: '#d8c8a0', ropeD: '#9a8a5c', iron: '#3a3a42', ironL: '#8a8a96', steel: '#c8ccd4', steelD: '#8a93a3', steelL: '#f0f4fa', haft: '#6a4428', haftD: '#4a2e18',
  ember: '#ffb04a', flame: '#ff9a3c', flameL: '#ffd36b', coal: '#2a1c18', g0: '#3a3836', g1: '#5e5a54', g2: '#7e7a72', g3: '#a09c94', twig: '#6a5a46', twigL: '#8e7c62', twigD: '#3e342a' };
const R = Math.round;
const hsh = i => Math.imul((i | 0) * 2654435761 | 0, 1274126177) >>> 0;
const tri = (g, a, b, c, col) => fillPoly(g, [a, b, c], col);
/* a soft radial glow (no hard disc): centre (x, y), radii rx / ry, colour r,g,b at alpha a falling to nothing */
function glow(g, x, y, rx, ry, r, gc, b, a) { g.save(); g.translate(R(x), R(y)); g.scale(1, ry / rx); const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, 'rgba(' + r + ',' + gc + ',' + b + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + r + ',' + gc + ',' + b + ',0)'); g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore(); }

/* ===================================================================== the PROPS table (art only; column x, feet row f, variant v) ===================================================================== */
export const BANNERS = [[17, 95, 0], [24, 88, 1], [14, 75, 2], [41, 68, 1], [113, 57, 0], [160, 48, 1], [195, 39, 2], [228, 39, 0], [237, 39, 1], [288, 33, 2], [309, 27, 0], [352, 27, 1], [393, 24, 0], [402, 19, 2], [405, 19, 1], [446, 19, 0]];
export const TENTS = [[216, 39, 0], [225, 39, 1], [356, 24, 1], [369, 24, 1]];
export const FIRES = [[221, 39], [358, 24], [371, 24]];
export const TOTEMS = [[292, 33, 0], [267, 33, 1], [331, 27, 0], [366, 27, 1]];

/* ---------- a tall HIDE BANNER on an antler pole: a red war-paint cloth snapping in the wind; v: 0 red hand, 1 crossed axes, 2 antler sigil ---------- */
export function banner(g, x, y, v, time) {
  x = R(x); y = R(y);
  for (let i = 0; i < 3; i++) { const sx = x - 5 + i * 5; rect(g, sx - 2, y - 3, 4, 3, i % 2 ? K.slate1 : K.slate2); rect(g, sx - 2, y - 3, 4, 1, K.snow); }                          // a footing of stacked slate with snow on it
  rect(g, x - 1, y - 52, 3, 50, K.boneD); rect(g, x - 1, y - 52, 1, 50, K.bone); for (let j = 8; j < 48; j += 9) px(g, x, y - j, K.boneDD);                                         // the pole: a long antler beam
  for (const s of [-1, 1]) { line(g, x + s, y - 52, x + s * 5, y - 58, K.bone); line(g, x + s * 5, y - 58, x + s * 6, y - 62, K.bone); line(g, x + s * 3, y - 55, x + s * 7, y - 55, K.boneD); px(g, x + s * 6, y - 63, K.bone); }  // the crown tines
  rect(g, x - 8, y - 48, 17, 2, K.bone); rect(g, x - 8, y - 46, 17, 1, K.boneDD); px(g, x - 9, y - 49, K.bone); px(g, x + 9, y - 49, K.bone);                                   // the crossbar of bone
  const W = 11, H = 28, x0 = x - 5, top = y - 46;
  for (let j = 0; j < H; j++) { const k = j / H, off = R(Math.sin(time * 4.2 + j * 0.33) * (0.6 + k * 2.4) + k * 3.2), c = j % 7 === 0 ? K.paintD : (j % 2 ? '#b8261a' : K.paint);
    rect(g, x0 + off, top + j, W, 1, c); px(g, x0 + off, top + j, K.paintD); px(g, x0 + off + W - 1, top + j, K.paintD); if (j % 4 === 0) px(g, x0 + off + 2 + (j % 3) * 3, top + j, K.paintL); }
  for (let j = 0; j < H; j += 1) { const k = j / H, off = R(Math.sin(time * 4.2 + j * 0.33) * (0.6 + k * 2.4) + k * 3.2), cy = top + j;                                                  // the emblem, painted white-bone on it
    if (v === 0 && j >= 6 && j <= 15) { const hx = x0 + off + 5; if (j >= 11) rect(g, hx - 2, cy, 5, 1, K.bone); else { rect(g, hx - 3 + ((j - 6) % 2 ? 0 : 0), cy, 1, 1, j < 8 ? K.bone : K.bone); if (j === 6 || j === 8 || j === 10) { px(g, hx - 3, cy, K.bone); px(g, hx - 1, cy, K.bone); px(g, hx + 1, cy, K.bone); px(g, hx + 3, cy, K.bone); } else rect(g, hx - 3, cy, 7, 1, K.bone); } }
    if (v === 1 && j >= 6 && j <= 15) { const q = j - 6, hx = x0 + off + 5; px(g, hx - 3 + Math.min(q, 6), cy, K.bone); px(g, hx + 3 - Math.min(q, 6), cy, K.bone); }
    if (v === 2 && j >= 6 && j <= 14) { const hx = x0 + off + 5; px(g, hx, cy, K.bone); if (j === 8 || j === 11) { px(g, hx - 2, cy - 1, K.bone); px(g, hx + 2, cy - 1, K.bone); px(g, hx - 1, cy, K.bone); px(g, hx + 1, cy, K.bone); } } }
  for (let t = 0; t < 3; t++) { for (let j = 0; j < 7; j++) { const k = (H + j) / H, off = R(Math.sin(time * 4.2 + (H + j) * 0.33 + t) * (0.6 + k * 2.4) + k * 3.2); px(g, x0 + off + 1 + t * 4, top + H + j, j % 2 ? K.paintD : K.paint); } }   // the fringe tails
  rect(g, x0 - 1, top, W + 2, 1, K.rope); px(g, x - 5, top + 1, K.rope); px(g, x + 5, top + 1, K.rope);                                                                           // lashed on
}

/* ---------- a HIDE TENT on crossed antler poles (v 0 big, 1 small); smoke and snow on it ---------- */
export function tent(g, x, y, v, time) {
  x = R(x); y = R(y); const w = v ? 15 : 19, h = v ? 20 : 25;
  fillPoly(g, [[x - w, y], [x, y - h], [x + w, y]], K.hide); fillPoly(g, [[x, y - h], [x + w, y], [x + 3, y]], K.hideD);                                                            // the hide cone, shade on the right
  line(g, x - w, y, x, y - h, K.hideL); line(g, x - w + 1, y, x, y - h + 1, K.hideL); line(g, x, y - h, x + w, y, K.hideDD);
  for (const s of [-0.55, 0.15]) { line(g, x + R(w * s), y, x, y - h + 2, K.hideDD); }                                                                                               // stitched seams
  for (let i = -w + 4; i < w - 3; i += 5) px(g, x + i, y - 1 - ((i + w) % 2), K.rope);
  fillPoly(g, [[x - w + 2, y - 4], [x + w - 2, y - 4], [x + w - 3, y - 7], [x - w + 3, y - 7]], K.paint); rect(g, x - w + 3, y - 7, w * 2 - 6, 1, K.paintL);                       // the red war-paint hem
  for (let i = -w + 6; i < w - 4; i += 6) { px(g, x + i, y - 5, K.bone); px(g, x + i + 1, y - 6, K.bone); px(g, x + i + 2, y - 5, K.bone); }                                       // zigzag in bone
  tri(g, [x - 4, y], [x, y - 11], [x + 4, y], '#2a2018'); line(g, x - 4, y, x - 1, y - 9, K.hideDD); line(g, x - 3, y, x - 5, y - 4, K.hideDD);                                       // the door, a flap drawn back
  for (const s of [-1, 1]) { line(g, x, y - h + 1, x + s * 5, y - h - 7, K.bone); line(g, x + s * 5, y - h - 7, x + s * 7, y - h - 10, K.bone); px(g, x + s * 8, y - h - 11, K.boneD); line(g, x + s * 3, y - h - 3, x + s * 6, y - h - 3, K.boneD); }   // the crossed antler poles
  fillPoly(g, [[x - 5, y - h + 7], [x, y - h + 1], [x + 3, y - h + 4], [x + 1, y - h + 7]], K.snow); rect(g, x - 6, y - h + 7, 6, 1, K.snowS);                                      // snow on the shoulder
  for (const s of [-1, 1]) { rect(g, x + s * (w + 1) - (s > 0 ? 0 : 1), y - 2, 2, 3, K.bone); }                                                                                       // bone pegs
  rect(g, x - w - 2, y, w * 2 + 4, 1, K.snowS); rect(g, x - w, y, w * 2, 1, K.snow);
}

/* ---------- a FIRE PIT: a ring of slate, coals and flame, smoke blowing off in the wind ---------- */
export function firepit(g, x, y, time) {
  x = R(x); y = R(y);
  glow(g, x, y - 6, 24 + Math.sin(time * 9) * 2, 16, 255, 150, 60, 0.42);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283, sx = x + R(Math.cos(a) * 8), sy = y - 2 + R(Math.sin(a) * 2); rect(g, sx - 2, sy - 2, 4, 3, i % 2 ? K.slate1 : K.slate2); rect(g, sx - 2, sy - 2, 4, 1, i % 3 ? K.snowS : K.slate3); }
  rect(g, x - 6, y - 3, 12, 2, K.coal); for (let i = 0; i < 5; i++) px(g, x - 5 + i * 2, y - 3, (Math.floor(time * 7) + i) % 3 ? K.ember : K.flameL);
  for (let i = 0; i < 4; i++) { const hh = 6 + ((Math.sin(time * 11 + i * 2.1) + 1) * 3.5) | 0, fx = x - 4 + i * 2.7; fillPoly(g, [[fx - 2, y - 3], [fx + 0.5 + Math.sin(time * 7 + i) * 1, y - 3 - hh], [fx + 2, y - 3]], i % 2 ? K.flame : '#ff7a2c'); fillPoly(g, [[fx - 1, y - 3], [fx, y - 3 - hh * 0.55], [fx + 1, y - 3]], K.flameL); }
  for (let i = 0; i < 9; i++) { const t = (time * 0.45 + i / 9) % 1, sx = x + 1 + t * 26 + Math.sin(time * 2 + i * 2.3) * 2, sy = y - 12 - t * 40; g.globalAlpha = 0.5 * (1 - t); g.fillStyle = i % 2 ? '#b8c2cc' : '#d8dee4'; const r = 1.5 + t * 3; g.fillRect(R(sx - r), R(sy - r), R(r * 2), R(r * 2)); }
  g.globalAlpha = 1;
}

/* ---------- two more TOTEMS (art only): a SKULL STACK and a CROSSED-AXE post; baked ---------- */
const BAKE = new Map();
const once = (k, fn) => { if (!BAKE.has(k)) BAKE.set(k, fn()); return BAKE.get(k); };
function bakeTotem(v) { const W = 28, H = 56, [c, g] = canvas(W, H), cx = 14;
  for (let i = 0; i < 3; i++) { rect(g, cx - 7 + i, H - 5 - i * 3 + 0, 14 - i * 2, 3, i % 2 ? K.slate1 : K.slate2); rect(g, cx - 7 + i, H - 5 - i * 3, 14 - i * 2, 1, K.slate3); }
  rect(g, cx - 7, H - 6, 14, 1, K.snow);
  rect(g, cx - 2, 6, 5, H - 14, '#8a7a62'); rect(g, cx - 2, 6, 1, H - 14, '#b0a080'); rect(g, cx + 2, 6, 1, H - 14, '#5e5240');
  const skull = (yy, s = 1) => { ellipse(g, cx, yy, 4 * s, 3.4 * s, K.bone); rect(g, cx - 3 * s, yy + 2, 6 * s, 3, K.bone); rect(g, cx - 2, yy - 1, 2, 2, '#2e2218'); rect(g, cx + 1, yy - 1, 2, 2, '#2e2218'); px(g, cx, yy + 2, '#2e2218'); };
  if (v === 0) { for (const yy of [38, 26, 14]) { skull(yy, yy === 14 ? 1.2 : 1); for (const s of [-1, 1]) { line(g, cx + s * 4, yy - 2, cx + s * 8, yy - 6, K.bone); line(g, cx + s * 8, yy - 6, cx + s * 10, yy - 7, K.boneD); } } rect(g, cx - 5, 31, 11, 2, K.paint);
    for (let i = 0; i < 3; i++) { line(g, cx - 3, 20 + i * 12, cx - 8, 25 + i * 12, K.paintD); px(g, cx - 8, 25 + i * 12, K.paint); } }
  else { for (const s of [-1, 1]) { g.save(); g.translate(cx, 20); g.rotate(s * 0.8); rect(g, -1, -16, 2, 32, K.haft); fillPoly(g, [[1, -16], [6, -18], [6, -10], [1, -10]], K.steel); rect(g, 6, -18, 1, 8, K.steelL); g.restore(); }
    rect(g, cx - 5, 31, 11, 3, K.paint); rect(g, cx - 5, 31, 11, 1, K.paintL); for (let i = 0; i < 5; i++) px(g, cx - 4 + i * 2, 33, K.bone); ellipse(g, cx, 10, 5, 4.2, K.hideDD); rect(g, cx - 3, 8, 2, 2, K.bone); rect(g, cx + 1, 8, 2, 2, K.bone); rect(g, cx - 2, 13, 5, 1, K.bone);
    for (const s of [-1, 1]) { line(g, cx + s * 4, 6, cx + s * 9, 1, K.bone); line(g, cx + s * 6, 3, cx + s * 10, 4, K.boneD); } }
  outline(c, OUT); return c; }
export function totem(g, x, y, v) { const c = once('totem' + v, () => bakeTotem(v)); g.drawImage(c, R(x) - 14, R(y) - c.height + 1); }

/* ---------- THE WORLD'S PROPS in one call (camera-relative) ---------- */
export function props(g, cx, cy, VW, time) {
  for (const [tx, f, v] of TOTEMS) { const x = tx * 16 + 8 - cx; if (x > -30 && x < VW + 30) totem(g, x, (f + 1) * 16 - cy, v); }
  for (const [tx, f, v] of TENTS) { const x = tx * 16 + 8 - cx; if (x > -40 && x < VW + 40) tent(g, x, (f + 1) * 16 - cy, v, time); }
  for (const [tx, f] of FIRES) { const x = tx * 16 + 8 - cx; if (x > -50 && x < VW + 60) firepit(g, x, (f + 1) * 16 - cy, time); }
  for (const [tx, f, v] of BANNERS) { const x = tx * 16 + 8 - cx; if (x > -30 && x < VW + 30) banner(g, x, (f + 1) * 16 - cy, v, time); }
}

/* (SNOW lies on every flat top, the wind scours the faces: baked into the slate tile, src/redraw/warcairn_tiles.js) */

/* ===================================================================== THE HATCHET KIT ===================================================================== */
/* the hatchet: a wrapped haft, a pale steel bit with a bright edge, a red-paint band; rot rad; s scale (1 = 14 px long) */
export function hatchet(g, x, y, rot, s = 1) {
  g.save(); g.translate(R(x), R(y)); g.rotate(rot || 0); if (s !== 1) g.scale(s, s);
  rect(g, -1, -7, 2, 14, K.haft); rect(g, -1, -7, 1, 14, '#8a5c38'); rect(g, 0, -4, 1, 1, K.rope); rect(g, 0, -2, 1, 1, K.rope); rect(g, -1, 6, 2, 1, K.rope);                      // haft with a hand wrap
  fillPoly(g, [[1, -7], [5, -9], [6, -8], [6, -2], [5, -1], [1, -3]], K.steel); line(g, 6, -8, 6, -2, K.steelL); px(g, 3, -6, K.steelD); px(g, 3, -4, K.steelD); px(g, 5, -9, K.steelL);   // the bit
  rect(g, -1, -2, 2, 1, K.paint); g.restore();
}
/* a four-point glint: a sparkle where a hatchet may be taken or a rope may be cut; col tints it */
export function glint(g, x, y, time, col = '#fff6c8') {
  x = R(x); y = R(y); const a = 0.45 + 0.4 * Math.sin(time * 6 + x * 0.03), k = Math.floor(time * 6 + x) % 2 ? 4 : 3; g.globalAlpha = a;
  rect(g, x - k, y, k * 2 + 1, 1, col); rect(g, x, y - k, 1, k * 2 + 1, col); px(g, x - 1, y - 1, col); px(g, x + 1, y + 1, col); g.globalAlpha = a * 0.5; g.strokeStyle = col; g.beginPath(); g.arc(x, y, 8, 0, 7); g.stroke(); g.globalAlpha = 1;
}
/* a carved slate post for hatchets: snow on its cap, an axe-mark in paint, an antler crossbar with three hatchets hung on thongs. The hatchets taken: the rack never runs out, so it is always full */
export function rack(g, x, y, near, time) {
  x = R(x); y = R(y);
  rect(g, x - 2, y - 30, 5, 28, K.slate2); rect(g, x - 2, y - 30, 1, 28, K.slate3); rect(g, x + 2, y - 30, 1, 28, K.slate1);                                                          // the carved post behind
  line(g, x - 1, y - 25, x + 1, y - 22, K.paintD); line(g, x + 1, y - 25, x - 1, y - 22, K.paintD); px(g, x, y - 24, K.paint);                                                     // the axe-mark
  rect(g, x - 4, y - 33, 9, 3, K.snow); rect(g, x - 4, y - 30, 9, 1, K.snowS); for (const s of [-1, 1]) { line(g, x + s * 4, y - 32, x + s * 6, y - 37, K.bone); px(g, x + s * 7, y - 38, K.bone); }   // snow cap, antler tines
  rect(g, x - 11, y - 11, 23, 10, K.slate2); rect(g, x - 11, y - 11, 23, 1, K.slate4); rect(g, x - 11, y - 11, 1, 10, K.slate3); rect(g, x + 11, y - 11, 1, 10, K.slate0); rect(g, x - 11, y - 2, 23, 1, K.slate0);   // the stump the hatchets are driven into
  rect(g, x - 5, y - 8, 1, 6, K.slate0); rect(g, x + 4, y - 9, 1, 7, K.slate0); rect(g, x - 11, y - 13, 23, 2, K.snow); rect(g, x - 11, y - 11, 23, 1, K.snowS);                       // joints and a lip of snow
  for (const [dx, rot] of [[-7, -0.45], [0, 0], [7, 0.45]]) hatchet(g, x + dx + rot * 5, y - 17, rot, 1.15);                                                                       // three, bits up, driven in
  rect(g, x - 11, y - 8, 22, 2, K.paint); for (let i = -9; i <= 8; i += 3) px(g, x + i, y - 7, K.bone);                                                                              // a red band with white ticks across the stump
  if (near) glint(g, x, y - 20, time);
}
/* the HAULED BRIDGE: slate treads lashed between two hemp ropes, iron staples; o = { x, y: pivot (screen), len, ang } - drawn rotated about the pivot */
export function bridge(g, o) {
  const { x, y, len, ang } = o; g.save(); g.translate(R(x), R(y + 8)); g.rotate(ang);
  rect(g, 0, -4, len, 1, K.rope); rect(g, 0, 2, len, 1, K.rope); rect(g, 0, -3, len, 1, K.ropeD); rect(g, 0, 3, len, 1, K.ropeD);                                                       // the two ropes
  for (let k = 1; k < len - 2; k += 6) { rect(g, k, -3, 5, 5, K.slate2); rect(g, k, -3, 5, 1, K.slate4); rect(g, k, 1, 5, 1, K.slate0); px(g, k + 1, -1, K.slate1); px(g, k + 3, 0, K.slate1); px(g, k, -4, K.iron); px(g, k + 4, 2, K.iron); if ((k / 6 | 0) % 4 === 0) { rect(g, k + 2, -4, 1, 7, K.ropeD); } }
  rect(g, -3, -5, 5, 9, K.iron); rect(g, -3, -5, 5, 1, K.ironL); px(g, -1, -2, K.ironL); rect(g, len - 2, -5, 3, 9, K.iron); g.restore();                                                // the hinge iron and the foot iron
}
/* the haul rope: a twisted hemp line with a bright strand; (ax, ay) the bridge's raised top, (bx, by) the tie post's knot; slack >= 0 sags it */
export function haulRope(g, ax, ay, bx, by, slack = 0) {
  const n = 18; let ox = R(ax), oy = R(ay);
  for (let i = 1; i <= n; i++) { const t = i / n, x = R(ax + (bx - ax) * t), y = R(ay + (by - ay) * t + Math.sin(t * Math.PI) * slack); line(g, ox, oy, x, y, i % 2 ? K.rope : K.ropeD); ox = x; oy = y; }
  rect(g, R(ax) - 2, R(ay) - 2, 5, 5, K.iron); px(g, R(ax), R(ay), K.ironL);                                                                                                           // the iron head block at the top of the bridge
}
/* the TIE POST on the far bank: carved slate, snow, the rope's iron cleat and a red cloth knot; `cut` shows the severed end hanging */
export function tiePost(g, x, y0, h, cut, time) {
  x = R(x); y0 = R(y0); rect(g, x, y0, 8, h, K.slate2); rect(g, x, y0, 1, h, K.slate3); rect(g, x + 7, y0, 1, h, K.slate1); rect(g, x - 1, y0 - 2, 10, 3, K.snow); rect(g, x - 1, y0 + 1, 10, 1, K.snowS);
  line(g, x + 2, y0 + 7, x + 5, y0 + 11, K.paintD); line(g, x + 5, y0 + 7, x + 2, y0 + 11, K.paintD);
  rect(g, x - 1, y0 + 14, 10, 3, K.iron); rect(g, x - 1, y0 + 14, 10, 1, K.ironL); rect(g, x + 3, y0 + 17, 2, 2, K.iron);                                                                       // the cleat
  if (!cut) { rect(g, x + 2, y0 + 12, 4, 3, K.rope); rect(g, x + 3, y0 + 12, 2, 1, K.paintL); rect(g, x + 2, y0 + 12, 1, 3, K.paint); }
  else { const sw = Math.sin(time * 3) * 1.5; for (let i = 0; i < 9; i++) px(g, R(x + 3 + sw * (i / 9)), y0 + 14 + i, i % 2 ? K.rope : K.ropeD); px(g, R(x + 3 + sw), y0 + 23, K.rope); px(g, R(x + 2 + sw), y0 + 24, K.rope); px(g, R(x + 4 + sw), y0 + 24, K.rope); }
}
/* a HANGING CAIRN STONE (w x h px): stacked slate with a red hand, lashed with rope in a sling from the slate arm. hang = true shows the rope and arm; landed shows a snow cap and cracks */
export function hangStone(g, x, y, w, h, hang, ropeTop, time) {
  x = R(x); y = R(y);
  if (hang) { const top = R(ropeTop); rect(g, x - 5, top - 3, w + 10, 4, K.slate1); rect(g, x - 5, top - 4, w + 10, 1, K.snow); rect(g, x - 5, top, w + 10, 1, K.slate0); px(g, x + w / 2, top + 1, K.iron);
    for (const s of [x + 4, x + w - 5]) { for (let j = top + 1; j < y + 2; j++) px(g, s + ((j >> 1) % 2 ? 1 : 0), j, (j >> 1) % 2 ? K.rope : K.ropeD); } }
  const c1 = h * 0.45 | 0, c2 = h * 0.8 | 0;
  rect(g, x, y, w, h, K.slate2); rect(g, x, y, w, c1, '#66768a'); rect(g, x + 2, y + c1, w - 3, c2 - c1, K.slate2); rect(g, x, y + c2, w, h - c2, K.slate1);                                      // courses of slate
  rect(g, x, y + c1, w, 1, K.slate0); rect(g, x, y + c2, w, 1, K.slate0); rect(g, x + (w >> 1) - 1, y + 1, 1, c1 - 1, K.slate0); rect(g, x + 4, y + c1 + 1, 1, c2 - c1 - 1, K.slate0); rect(g, x + w - 6, y + c2 + 1, 1, h - c2 - 2, K.slate0);
  rect(g, x, y, w, 1, K.slate4); rect(g, x, y, 1, h, K.slate3); rect(g, x + w - 1, y, 1, h, K.slate0); rect(g, x, y + h - 1, w, 1, K.slate0);
  rect(g, x + 1, y - 1, w - 2, 2, K.snow); rect(g, x + 1, y + 1, w - 2, 1, K.snowS); px(g, x + 3, y + 2, K.snowS);                                                                             // snow on it
  const hx = x + (w >> 1) - 1, hy = y + c1 + 3; rect(g, hx, hy + 3, 5, 3, K.paint); for (let i = 0; i < 4; i++) rect(g, hx + i, hy, 1, 3, K.paint); px(g, hx + 5, hy + 3, K.paint);           // a red hand print
  if (hang) { for (const s of [x + 3, x + w - 4]) { rect(g, s - 1, y + 5, 3, 1, K.rope); rect(g, s - 1, y + h - 6, 3, 1, K.rope); } line(g, x + 3, y + 5, x + w - 4, y + h - 6, K.ropeD); line(g, x + w - 4, y + 5, x + 3, y + h - 6, K.ropeD); }
  else { line(g, x + 5, y + 2, x + 8, y + 6, K.slate0); line(g, x + w - 8, y + h - 8, x + w - 5, y + h - 3, K.slate0); }
}
/* a HANGING TOTEM (w x h px): a bone-and-antler totem hung from the slate arm, bound with red hide */
export function hangTotem(g, x, y, w, h, hang, ropeTop, time) {
  const cx = R(x + w / 2); y = R(y);
  if (hang) { const top = R(ropeTop); rect(g, cx - 12, top - 3, 24, 4, K.slate1); rect(g, cx - 12, top - 4, 24, 1, K.snow); rect(g, cx - 12, top, 24, 1, K.slate0); for (let j = top + 1; j < y + 1; j++) { px(g, cx, j, (j >> 1) % 2 ? K.rope : K.ropeD); px(g, cx + 1, j, K.ropeD); } }
  rect(g, cx - 2, y + 1, 5, h - 1, '#8a7a62'); rect(g, cx - 2, y + 1, 1, h - 1, '#b0a080'); rect(g, cx + 2, y + 1, 1, h - 1, '#5e5240');
  ellipse(g, cx, y + 5, 4, 3.4, K.bone); rect(g, cx - 3, y + 7, 6, 3, K.bone); rect(g, cx - 2, y + 4, 2, 2, '#2e2218'); rect(g, cx + 1, y + 4, 2, 2, '#2e2218'); px(g, cx, y + 7, '#2e2218');            // the skull
  for (const s of [-1, 1]) { line(g, cx + s * 3, y + 3, cx + s * 8, y - 3, K.bone); line(g, cx + s * 8, y - 3, cx + s * 10, y - 4, K.bone); line(g, cx + s * 6, y, cx + s * 9, y + 1, K.boneD); px(g, cx + s * 10, y - 5, K.bone); }
  rect(g, cx - 5, y + 14, 11, 4, K.paint); rect(g, cx - 5, y + 14, 11, 1, K.paintL); rect(g, cx - 3, y + 15, 2, 1, K.bone); rect(g, cx + 1, y + 15, 2, 1, K.bone);                                    // a red war-mask
  for (let i = 0; i < 3; i++) { line(g, cx - 3 + i * 3, y + 19, cx - 4 + i * 3, y + 24, K.paintD); px(g, cx - 4 + i * 3, y + 24, K.paint); }                                                          // hide strips
}
/* the TOTEM SHATTERS, a stone breaks, a nest comes apart: shards fly and fall for ~0.9 s; kind picks the pieces; age = seconds since */
export function shards(g, x, y, age, kind) {
  if (age > 1.0) return; const cols = kind === 'totem' ? [K.bone, K.boneD, K.paint, '#8a7a62'] : kind === 'nest' ? [K.twig, K.twigL, K.bone, K.twigD] : [K.slate2, K.slate3, K.slate1, K.snow];
  for (let i = 0; i < 14; i++) { const h = hsh(i * 17 + 3), vx = ((h % 100) - 50) * 1.1, vy = -((h >> 7) % 70) - 20, t = age, X = x + vx * t, Y = y + vy * t + 360 * t * t; g.globalAlpha = Math.max(0, 1 - t / 1.0);
    const s = 1 + (h >> 11) % 3; rect(g, X, Y, s + 1, s, cols[i % cols.length]); } g.globalAlpha = 1;
}
/* a HARPY NEST (a 16-px cell + margin): a bowl of twigs and bone, dark feathers, snow dusting the rim; standing */
export function nest(g, x, y, w, time) {
  x = R(x); y = R(y); const W = w + 8, X = x - 4;
  ellipse(g, X + W / 2, y - 3, W / 2, 5, K.twigD); ellipse(g, X + W / 2, y - 4, W / 2 - 1, 4, K.twig);
  for (let i = 0; i < 16; i++) { const h = hsh(i * 29 + 7), a = (h % 100) / 100 * 6.28, r = (W / 2 - 1) * (0.55 + (h >> 8) % 45 / 100), sx = X + W / 2 + Math.cos(a) * r, sy = y - 4 + Math.sin(a) * 3, l = 3 + (h >> 4) % 5, an = ((h >> 14) % 100) / 100 * 3.14; line(g, sx, sy, sx + Math.cos(an) * l, sy + Math.sin(an) * 1.5 - 1, i % 3 ? K.twigL : K.twig); }
  rect(g, X + 2, y - 1, W - 4, 2, K.twigD); ellipse(g, X + W / 2, y - 5, W / 2 - 3, 2, K.twigD);
  rect(g, X + 3, y - 6, 2, 1, K.bone); px(g, X + 4, y - 7, K.boneD); rect(g, X + W - 6, y - 6, 3, 1, K.bone); px(g, X + W - 5, y - 8, K.bone);                                          // bones in it
  for (const s of [0.3, 0.7]) { rect(g, X + R(W * s), y - 8, 1, 3, '#2a2a34'); px(g, X + R(W * s) + 1, y - 9, '#2a2a34'); }                                                              // dark feathers
  for (let i = 0; i < 3; i++) px(g, X + 3 + i * (W / 3 | 0), y - 8 - (i % 2), K.snow); rect(g, X + 4, y - 9, 5, 1, K.snow); px(g, X + W - 8, y - 9, K.snowS);                          // snow on the rim
  rect(g, X + 1, y, W - 2, 1, K.snowS);
}

/* ---------- the hero's CARRY and THROW read: the hatchet over the shoulder, and a smear after the throw ---------- */
export function carryPose(g, x, y, face, throwing, time) {
  if (throwing) { g.globalAlpha = 0.55; g.strokeStyle = '#fff6e0'; g.lineWidth = 2; g.beginPath(); g.arc(R(x - face * 4), R(y + 2), 11, face > 0 ? -2.3 : -0.84, face > 0 ? -0.2 : -2.9, face < 0); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; hatchet(g, x + face * 6, y - 3, face * 1.4); return; }
  hatchet(g, x, y, face * (0.55 + Math.sin(time * 6) * 0.05));
}

/* ===================================================================== THE SUMMIT: THE BIGGER CAIRN and its DRUM BRAZIERS ===================================================================== */
/* the bigger cairn: nine courses of stacked slate (~3x the old), snow on every ledge, red hand prints, a niche with skulls, hatchets driven in the joints, a pole with an antler crown and a red hide banner. (x: its centre, fy: ground) */
export function cairn(g, x, fy, time) {
  x = R(x); fy = R(fy);
  for (let k = 0; k < 9; k++) { const w = 150 - k * 15, h = 14, y = fy - (k + 1) * h, l = x - (w >> 1);
    let cxp = l, i = 0; while (cxp < l + w) { const hh = hsh(k * 31 + i * 7), sw = Math.min(l + w - cxp, 12 + hh % 14), tone = (hh >> 4) % 3; const cc = tone === 0 ? K.slate2 : tone === 1 ? '#66768a' : K.slate1;
      rect(g, cxp, y + 1, sw, h - 2, cc); rect(g, cxp, y + 1, sw, 1, K.slate3); rect(g, cxp + sw - 1, y + 1, 1, h - 2, K.slate0); rect(g, cxp, y + h - 2, sw, 1, K.slate0); if ((hh >> 8) % 3 === 0) px(g, cxp + 3 + (hh >> 10) % 5, y + 5, K.slate0);
      if ((hh >> 12) % 11 === 0 && sw > 9) { rect(g, cxp + 3, y + 5, 2, 4, K.paint); rect(g, cxp + 5, y + 4, 2, 4, K.paint); rect(g, cxp + 7, y + 5, 2, 4, K.paint); rect(g, cxp + 3, y + 8, 6, 2, K.paint); }          // a red hand
      cxp += sw; i++; }
    rect(g, l, y, w, 1, K.slate0); rect(g, l - 1, y - 1, w + 2, 3, K.snow); rect(g, l - 1, y + 2, w + 2, 1, K.snowS); for (let q = l; q < l + w; q += 9) px(g, q + (hsh(q + k) % 4), y + 3, K.snowD); }
  /* a niche of skulls at the third course, hatchets driven into the joints */
  { const w = 150 - 3 * 15, l = x - (w >> 1), y = fy - 4 * 14; rect(g, x - 15, y + 3, 30, 9, K.slate0); for (let i = 0; i < 4; i++) { const sx = x - 12 + i * 7; ellipse(g, sx + 2, y + 7, 3, 2.6, K.bone); rect(g, sx, y + 8, 4, 2, K.bone); px(g, sx + 1, y + 7, '#2e2218'); px(g, sx + 3, y + 7, '#2e2218'); }
    for (const [dx, k] of [[l + 14, 1], [l + w - 16, -1], [x - 60, 1], [x + 56, -1]]) { g.save(); g.translate(R(dx), y + 11); g.rotate(k * 1.1); rect(g, -1, -9, 2, 10, K.haft); fillPoly(g, [[1, -10], [5, -12], [6, -5], [1, -4]], K.steel); g.restore(); } }
  const top = fy - 9 * 14;
  rect(g, x - 1, top - 40, 3, 40, K.boneD); rect(g, x - 1, top - 40, 1, 40, K.bone);                                                                                                       // the pole
  for (const s of [-1, 1]) { line(g, x + s, top - 38, x + s * 9, top - 48, K.bone); line(g, x + s * 9, top - 48, x + s * 11, top - 54, K.bone); line(g, x + s * 5, top - 43, x + s * 12, top - 44, K.boneD); line(g, x + s * 8, top - 47, x + s * 4, top - 52, K.boneD); px(g, x + s * 11, top - 55, K.bone); }
  for (let j = 0; j < 22; j++) { const k = j / 22, off = R(Math.sin(time * 3.6 + j * 0.4) * (1 + k * 3) + k * 6); rect(g, x + 2 + off, top - 36 + j, 17 - (j > 16 ? (j - 16) : 0), 1, j % 5 === 0 ? K.paintD : K.paint); }   // the great red banner
  for (let j = 7; j < 14; j++) { const k = j / 22, off = R(Math.sin(time * 3.6 + j * 0.4) * (1 + k * 3) + k * 6); px(g, x + 8 + off, top - 36 + j, K.bone); px(g, x + 12 + off, top - 36 + j, K.bone); if (j === 9 || j === 11) rect(g, x + 8 + off, top - 36 + j, 5, 1, K.bone); }   // a hand in bone
}
/* a DRUM BRAZIER: an iron bowl on three antler legs, lit; flare = a beat / his frenzy / his drum: red, tall, sparks */
export function brazier(g, x, y, flare, time) {
  x = R(x); y = R(y);
  if (flare) glow(g, x, y - 26, 34, 30, 255, 50, 30, 0.5); else glow(g, x, y - 24, 24, 20, 255, 150, 60, 0.4);
  for (const s of [-1, 0, 1]) { line(g, x + s * 7, y, x + s * 4, y - 10, K.bone); line(g, x + s * 4, y - 10, x + s * 5, y - 16, K.bone); px(g, x + s * 7, y, K.boneD); if (s) { px(g, x + s * 7 + s, y - 4, K.boneD); line(g, x + s * 4, y - 10, x + s * 8, y - 12, K.boneD); } }
  rect(g, x - 9, y - 19, 18, 3, K.iron); rect(g, x - 9, y - 19, 18, 1, K.ironL); rect(g, x - 8, y - 16, 16, 2, '#2a2a32'); rect(g, x - 6, y - 14, 12, 1, '#2a2a32'); rect(g, x - 8, y - 17, 16, 1, K.paintD);          // the iron bowl, a painted rim
  for (let i = -7; i <= 7; i += 4) px(g, x + i, y - 18, K.ironL);
  rect(g, x - 7, y - 20, 14, 2, K.coal); for (let i = 0; i < 6; i++) px(g, x - 6 + i * 2, y - 20, (Math.floor(time * 8) + i) % 3 ? K.ember : K.flameL);
  const tall = flare ? 15 : 9;
  for (let i = 0; i < 5; i++) { const hh = tall * (0.55 + 0.45 * ((Math.sin(time * 12 + i * 2.3) + 1) / 2)), fx = x - 6 + i * 3; fillPoly(g, [[fx - 2, y - 20], [fx + Math.sin(time * 8 + i) * 1.2, y - 20 - hh], [fx + 2, y - 20]], flare ? (i % 2 ? '#ff4a3a' : '#ff6a3a') : (i % 2 ? K.flame : '#ff7a2c'));
    fillPoly(g, [[fx - 1, y - 20], [fx, y - 20 - hh * 0.55], [fx + 1, y - 20]], flare ? '#ffb04a' : K.flameL); }
  if (flare) for (let i = 0; i < 5; i++) { const t = (time * 1.6 + i * 0.31) % 1; g.globalAlpha = 1 - t; px(g, x - 5 + i * 2 + R(Math.sin(time * 6 + i) * 2), y - 26 - R(t * 22), i % 2 ? K.flameL : K.paintL); } g.globalAlpha = 1;
}

/* ===================================================================== THE CHIEFTAIN ===================================================================== */
/* the HERO-STYLE RAGE BAR on his plate: an iron frame with bone tine caps, a red fill that burns hotter as it fills, quarter ticks in bone, flame tongues when it is full or he is in frenzy */
export function rageBar(g, x0, y, w, k, fz, locked, blink, time) {
  x0 = R(x0); y = R(y); k = Math.max(0, Math.min(1, k)); rect(g, x0 - 3, y - 3, w + 6, 9, '#14101a'); rect(g, x0 - 2, y - 2, w + 4, 7, K.iron); rect(g, x0 - 2, y - 2, w + 4, 1, K.ironL); rect(g, x0, y, w, 3, '#2a1414');
  const fw = R(w * k); for (let i = 0; i < fw; i++) { const t = i / w, c = locked ? '#6a4a46' : fz ? (blink ? '#ffd36b' : '#ff4a3a') : t > 0.75 ? '#ff4a3a' : t > 0.45 ? '#e0322a' : '#b02018'; rect(g, x0 + i, y, 1, 3, c); }
  if (fw > 2 && !locked) rect(g, x0, y, fw, 1, fz ? '#fff6c8' : '#ff9a8a');
  for (const q of [0.25, 0.5, 0.75]) rect(g, x0 + R(w * q), y, 1, 3, K.bone);
  for (const s of [-1, 1]) { const ex = s < 0 ? x0 - 3 : x0 + w + 3; line(g, ex, y + 4, ex + s * 3, y - 1, K.bone); line(g, ex + s * 3, y - 1, ex + s * 4, y - 4, K.bone); px(g, ex + s * 2, y - 3, K.boneD); }          // bone tines at each end
  if ((k >= 1 || fz) && !locked) for (let i = 0; i < 9; i++) { const hh = 2 + ((Math.sin(time * 13 + i * 1.9) + 1) * 2.2) | 0; const fx = x0 + 6 + i * (w - 12) / 8; fillPoly(g, [[fx - 2, y], [fx, y - hh], [fx + 2, y]], i % 2 ? '#ff9a3c' : '#ff4a3a'); }
}
/* his FRENZY: a ring of flame round him and a hot haze (a soft red glow, not a block); (x, y) his feet, s his size scale */
export function frenzyAura(g, x, y, time, s = 1) {
  x = R(x); y = R(y); const cyb = y - 22 * s;
  glow(g, x, cyb, 34 * s, 38 * s, 255, 40, 24, 0.42 + 0.1 * Math.sin(time * 14)); glow(g, x, cyb + 4, 20 * s, 26 * s, 255, 176, 74, 0.3);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283 + time * 1.7, rx = 24 * s, ry = 31 * s, fx = x + Math.cos(a) * rx, fy = cyb + Math.sin(a) * ry, hh = 5 + ((Math.sin(time * 15 + i * 2.2) + 1) * 3) | 0; if (fy > y + 2) continue;
    fillPoly(g, [[fx - 2, fy], [fx + Math.sin(time * 9 + i) * 1.2, fy - hh], [fx + 2, fy]], i % 2 ? '#ff4a3a' : '#ff9a3c'); px(g, R(fx), R(fy - hh * 0.4), K.flameL); }
  for (let i = 0; i < 6; i++) { const t = (time * 1.4 + i * 0.37) % 1; g.globalAlpha = 1 - t; px(g, x - 14 * s + i * 5 * s + R(Math.sin(time * 5 + i) * 2), R(y - 6 - t * 40 * s), i % 2 ? K.flameL : K.paintL); } g.globalAlpha = 1;
}
/* THE COUNTER: the riposte read: a wide red arc cocked behind him, bone-white at its edge, and the crossed axes' glint at the top; k 0..1 = how wound */
export function counterArc(g, x, y, face, k, time) {
  x = R(x); y = R(y); const cxp = x - face * 2, cyp = y - 34, r = 24, a0 = face > 0 ? -2.9 : -0.24, a1 = face > 0 ? -2.9 + 2.9 * Math.max(0.15, k) : -0.24 - 2.9 * Math.max(0.15, k);
  g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 22); g.strokeStyle = '#ff4a3a'; g.lineWidth = 4; g.beginPath(); g.arc(cxp, cyp, r, a0, a1, face < 0); g.stroke();
  g.strokeStyle = '#fff6e0'; g.lineWidth = 1; g.beginPath(); g.arc(cxp, cyp, r + 2, a0, a1, face < 0); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
  for (let i = 0; i < 5; i++) { const q = (time * 3 + i * 0.2) % 1; g.globalAlpha = 1 - q; px(g, R(x + face * (4 + q * 24)), R(y - 56 + q * 10 + i * 2), i % 2 ? K.paintL : K.flameL); } g.globalAlpha = 1;
}
/* STAGGERED: his own hatchet bitten into his shoulder, blood-red war paint running from it; (x, y) his feet, f facing */
export function staggerHatchet(g, x, y, f, time) {
  x = R(x); y = R(y); const sx = x - f * 7, sy = y - 42 + Math.sin(time * 14) * 0.7;
  hatchet(g, sx, sy - 3, -f * 0.5 + Math.PI, 1.3);                                   // the bit sunk in, the haft standing out of the shoulder
  for (let i = 0; i < 4; i++) { px(g, sx + (i % 2), sy + 2 + i * 2, i % 2 ? K.paint : K.paintD); } rect(g, sx - 2, sy + 1, 5, 1, K.paintD);
  for (let i = 0; i < 3; i++) { const q = (time * 2 + i * 0.33) % 1; g.globalAlpha = 1 - q; px(g, sx + R(Math.sin(i * 3 + time * 4) * 3), R(sy - 4 - q * 10), K.flameL); } g.globalAlpha = 1;
}
/* the TUG: his hatchet hauled back on a braided thong, taut, a bright strand running along it */
export function tugThong(g, ax, ay, bx, by, time) {
  const n = 14; let ox = R(ax), oy = R(ay); for (let i = 1; i <= n; i++) { const t = i / n, x = R(ax + (bx - ax) * t), y = R(ay + (by - ay) * t + Math.sin(t * Math.PI) * 2 + Math.sin(time * 30 + i) * 0.6); line(g, ox, oy, x, y, i % 2 ? K.rope : K.hideDD); ox = x; oy = y; }
}

/* ===================================================================== AN ELITE OF THE CLAN ===================================================================== */
/* an antler crown with a bone band, a red war-paint smear across the eyes and a wolf-tooth necklace; a slow red pulse at his feet so he reads as the one that matters. (x, y) feet, h his height */
export function eliteMark(g, x, y, face, h, time) {
  x = R(x); y = R(y); const hy = y - h, f = face;
  rect(g, x - 4, hy - 1, 9, 2, K.bone); rect(g, x - 4, hy + 1, 9, 1, K.boneDD);
  for (const s of [-1, 1]) { line(g, x + s * 4, hy - 1, x + s * 6, hy - 5, K.bone); line(g, x + s * 6, hy - 5, x + s * 8, hy - 7, K.bone); line(g, x + s * 5, hy - 3, x + s * 8, hy - 3, K.boneD); px(g, x + s * 8, hy - 8, K.bone); }
  rect(g, x - 3 + (f > 0 ? 1 : 0), hy + 3, 6, 1, K.paint);
  for (let i = -2; i <= 2; i++) px(g, x + i * 2, hy + 8 + (Math.abs(i) === 2 ? -1 : 0), i % 2 ? K.bone : K.boneD);
  g.globalAlpha = 0.18 + 0.1 * Math.sin(time * 4); g.strokeStyle = '#ff4a3a'; g.beginPath(); g.ellipse(x, y - 1, 10, 3, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
}
