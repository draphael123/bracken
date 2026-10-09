// ksar_props2.js - THE LONGER KSAR's PIECES AND THE ROOFTOPS, DRAWN (claude/ksar2 part B; the part A lane left every one of these as a plain rectangle).
//   THE SHAFTS      two-wide brick flues between the roofs: iron spikes on a kiln grate (ember slits), flagged posts at the lips, and the UPDRAFT - rising heat shimmer
//                   (pale wobbling streaks), a plume over the lip and a rising grit of sand, NOT an orange wash (only the grate glows)
//   THE REEDS       a lashed reed screen in a palm frame (whole), the same burning (fire climbing, stalks charring bottom up), and its ash and scorched stubs (burnt)
//   THE BRIDGE      the raised timber leaf on the far lip, hauled by a rope over a pulley beam to a cleat (raised); the rope alight and the leaf shaking (burning);
//                   the deck laid over the chasm with rope rails and the burnt rope's end dangling (down)
//   THE TRAIL       a groove of black powder with pale grains (dry); the fire's front, a sparking white-hot head, soot behind it and smoke (lit)
//   THE NESTS       a lashed palm-post nest with a woven reed screen, a striped canvas lean-to, a quiver and a lantern; BLINDED: bleached, white stars, the canvas flapping
//   THE LINES       raider-line anchors: the A-frame post with a pulley head and the rope's tied-off tail (hung), the cut rope's frayed end swinging (cut); the tower's outrigger
//                   beam and eye bolt; the teach lines' rig posts and buffer stops
//   THE TORCHES     a rack of torches in an iron frame with an oil pot (n torches), a carried / flying / lying torch (frames at its own angle), the sparks
//   THE ARCHES      rubble heaped where a bricked arch was blown
//   THE TOWER STAIR the alley tower's zigzag: a shadowed stair-well, handrails and posts at every flight, a lantern at the landings
//   THE FORTRESS    merlon crowns for every tower and the gatehouse, the KEEP on the horizon over the souq, the roofs' back parapets, rugs and drying racks
// Everything is px.js primitives and plain fillRects (tools/ksar-art-sheet.mjs paints it in Node); a function draws one thing and the hands call it.
import { canvas, px, rect, ellipse, circle, line, fillPoly, outline } from '../px.js';
import { C } from './ksar_props.js';
import { hash } from './ksar_tiles.js';

const R = Math.round, TS = 16, O = '#1b1626';
const box = (V, x, y, w, h, c) => { V.g.fillStyle = c; V.g.fillRect(R(x - V.cx), R(y - V.cy), w, h); };
const put = (V, spr, wx, wy) => V.g.drawImage(spr, R(wx - V.cx), R(wy - V.cy));
const alpha = (V, a, fn) => { V.g.globalAlpha = a; fn(); V.g.globalAlpha = 1; };
const vis = (V, x0, x1, m = 40) => x1 > V.cx - m && x0 < V.cx + V.vw + m;
const glow = (V, x, y, r, a, warm = true) => { const g = V.g; if (V.noGlow || typeof g.createRadialGradient !== 'function') return; const sx = R(x - V.cx), sy = R(y - V.cy);
  const gr = g.createRadialGradient(sx, sy, 1, sx, sy, r); gr.addColorStop(0, (warm ? 'rgba(255,170,70,' : 'rgba(255,230,160,') + a + ')'); gr.addColorStop(1, 'rgba(255,120,40,0)');
  const o = g.globalCompositeOperation; g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(sx - r, sy - r, r * 2, r * 2); g.globalCompositeOperation = o; };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
/* a line of px in world space (the Bresenham the baked art uses, on the live canvas) */
const wline = (V, x0, y0, x1, y1, c, th = 1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) box(V, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, th, th, c); };
const flame = (V, x, y, h, time, seed = 0) => {   /* a small flame standing on (x, y): red body, orange, yellow, white core; it licks with the clock */
  const f = Math.sin(time * 14 + seed * 1.7), g2 = Math.sin(time * 19 + seed * 2.3);
  box(V, x - 2, y - h * 0.55, 5, h * 0.55, '#d8481a'); box(V, x - 1 + (f > 0.3 ? 1 : 0), y - h * 0.8, 3, h * 0.45, '#ff8a2a'); box(V, x - 1, y - h * 0.62, 2, h * 0.34, '#ffc84a');
  box(V, x + (g2 > 0 ? 0 : -1), y - h - (f > 0 ? 1 : 0), 1, h * 0.45, '#ff8a2a'); box(V, x, y - h * 0.5, 1, h * 0.25, '#fff4b0'); };

/* ================================================================ THE SPIKED SHAFTS + THE UPDRAFT (q: { x0, x1, top, bottom } in tiles; the spikes lie on the grate at the bottom) */
export function drawShaft(V, q, time) {
  const x0 = q.x0 * TS, x1 = (q.x1 + 1) * TS, w = x1 - x0, top = q.top * TS, by = (q.bottom + 1) * TS, h = by - top; if (!vis(V, x0, x1, 60)) return;
  /* the flue's walls: deep brick in shadow, darker toward the grate, sooted */
  box(V, x0, top, w, h, '#2c1a16');
  for (let y = top; y < by; y += 8) { const r = ((y - top) / 8) | 0, off = (r & 1) * 8; box(V, x0, y + 7, w, 1, '#1d100e'); for (let x = x0 + off; x < x1; x += 16) box(V, x, y, 1, 7, '#1d100e'); }
  alpha(V, 0.5, () => box(V, x0, top + h * 0.45, w, h * 0.55, '#120a0a')); alpha(V, 0.28, () => box(V, x0, top + h * 0.7, w, h * 0.3, '#000000'));
  box(V, x0, top, 2, h, '#3a2420'); box(V, x1 - 2, top, 2, h, '#140c0a');   /* the inner jambs */
  for (let y = top + 10; y < by - 14; y += 24) { const sx = x0 + 3 + (hash(q.x0, y) % (w - 8)); box(V, sx, y, 2, 7, 'rgba(10,6,6,0.5)'); }   /* soot streaks */
  /* the KILN GRATE: an iron plate with ember slits, the only warm thing in the flue */
  box(V, x0, by - 4, w, 4, '#2a2a32'); box(V, x0, by - 4, w, 1, '#4a4a54');
  const pul = 0.55 + 0.45 * Math.sin(time * 5 + q.x0);
  for (let x = x0 + 2; x < x1 - 2; x += 5) alpha(V, 0.55 + 0.4 * pul, () => { box(V, x, by - 3, 3, 2, '#ff6a2a'); box(V, x + 1, by - 3, 1, 1, '#ffd36b'); });
  /* the SPIKES: iron cones in two ranks, tips glinting, a few bent */
  for (let x = x0 + 1, i = 0; x < x1 - 3; x += 5, i++) { const th = 10 + (hash(i, q.x0) % 3), bent = hash(i + 7, q.x0) % 7 === 0 ? 1 : 0;
    for (let k = 0; k < th; k++) { const hw = Math.max(0, Math.round(2.5 * (1 - k / th))); const cxk = x + 2 + (bent && k > th - 4 ? 1 : 0);
      box(V, cxk - hw, by - 4 - k, hw * 2 + 1, 1, k % 5 === 4 ? '#6a6a76' : '#8a8a96'); if (hw) box(V, cxk - hw, by - 4 - k, 1, 1, '#c8ccd8'); if (hw) box(V, cxk + hw, by - 4 - k, 1, 1, '#4a4a54'); }
    if (((Math.floor(time * 3) + i) % 5) === 0) box(V, x + 2 + (bent ? 1 : 0), by - 4 - th, 1, 1, '#ffffff'); }
  /* THE UPDRAFT: pale streaks rising and wobbling, bright where the air is fastest (the middle), thinning toward the lip */
  for (let i = 0; i < 4; i++) { const bx = x0 + 3 + i * Math.floor((w - 6) / 3);
    for (let y = by - 8; y > top - 18; y -= 3) { const kk = (by - y) / (h + 18), ph = (y * 0.11 - time * 5.5 + i * 2.1), ox = Math.sin(ph) * (1.5 + kk * 2.5), on = (Math.floor(y / 3) + Math.floor(time * 9) + i * 2) % 4;
      if (on > 1) continue; alpha(V, 0.2 * (1 - kk) + 0.05, () => box(V, bx + ox, y, 1, 3, i % 2 ? '#fff4d8' : '#ffe2a8')); } }
  /* the plume over the lip: three wavering heat lines that bend the sight line (drawn as pale ribbons) */
  for (let i = 0; i < 3; i++) for (let y = top - 4; y > top - 22; y -= 2) { const kk = (top - y) / 22, ox = Math.sin(y * 0.3 - time * 6 + i * 1.9) * (2 + kk * 3);
    alpha(V, 0.12 * (1 - kk), () => box(V, x0 + w * (0.2 + 0.3 * i) + ox, y, 2, 2, '#fff1d0')); }
  /* the GRIT: sand and ash carried up the flue, a few grains over the lip */
  for (let i = 0; i < 12; i++) { const gx = x0 + 3 + ((i * 37) % (w - 6)) + Math.sin(time * 3 + i) * 2, gy = by - 6 - ((time * (46 + (i % 3) * 14) + i * 29) % (h + 22)), kk = (by - gy) / (h + 22);
    alpha(V, 0.8 * (1 - kk * 0.8), () => { box(V, gx, gy, i % 3 ? 1 : 2, 1, i % 4 === 0 ? '#fff0c0' : i % 2 ? '#e0c898' : '#b89a68'); }); }
  glow(V, (x0 + x1) / 2, by - 6, 26, 0.3);
  /* the lips: a flagged post at each corner (a scrap of red cloth), the stone worn bright by the heat */
  for (const [px0, d] of [[x0 - 5, -1], [x1 + 1, 1]]) { box(V, px0, top - 14, 3, 14, '#5a3420'); box(V, px0, top - 14, 1, 14, '#8a5a34'); box(V, px0 - 1, top - 15, 5, 2, C.brass);
    const sw = Math.round(Math.sin(time * 5 + px0) * 1.5); for (let k = 0; k < 6; k++) box(V, d > 0 ? px0 + 3 + k : px0 - 1 - k, top - 14 + (k > 3 ? 1 : 0) + sw * (k > 2 ? 1 : 0), 1, 5 - (k >> 1), k % 2 ? '#a8302a' : '#d8483a'); }
}

/* ================================================================ THE REEDS (r: { x0, x1, y0, y1 } tiles; st whole | burning | burnt; k 0..1 the burn's progress; hot: a torch is in the hero's hand) */
export function drawReeds(V, r, st, k, time, hot) {
  const x0 = r.x0 * TS, w = (r.x1 - r.x0 + 1) * TS, y0 = r.y0 * TS, h = (r.y1 - r.y0 + 1) * TS, y1 = y0 + h; if (!vis(V, x0, x0 + w)) return;
  /* the palm frame: two posts and a top beam, always (they char but stand) */
  const frame = (char) => { for (const px0 of [x0, x0 + w - 4]) { box(V, px0, y0 - 2, 4, h + 2, char ? '#2a1e18' : '#5a3420'); box(V, px0, y0 - 2, 1, h + 2, char ? '#3a2a22' : '#8a5a34'); }
    box(V, x0 - 1, y0 - 4, w + 2, 4, char ? '#2a1e18' : '#6a4528'); box(V, x0 - 1, y0 - 4, w + 2, 1, char ? '#3a2a22' : '#9a6a3c'); };
  if (st === 'burnt') {
    frame(true);
    box(V, x0 + 4, y1 - 3, w - 8, 3, '#2a2420'); box(V, x0 + 6, y1 - 4, w - 12, 1, '#3a3430');   /* the ash bed */
    for (let x = x0 + 5, i = 0; x < x0 + w - 6; x += 3, i++) { const sh = 2 + (hash(i, r.x0) % 8); box(V, x, y1 - 3 - sh, 1, sh, '#1e1814'); if (i % 3 === 0) box(V, x, y1 - 3 - sh, 1, 1, '#4a3a2a'); }   /* scorched stubs */
    for (let i = 0; i < 3; i++) { const t = (time * 0.5 + i * 0.37) % 1; alpha(V, 0.35 * (1 - t), () => box(V, x0 + 8 + ((i * 23) % (w - 16)) + Math.sin(time * 2 + i), y1 - 6 - t * 18, 2, 2, '#8a8078')); }   /* a last thread of smoke */
    if (Math.floor(time * 3 + r.x0) % 4 === 0) box(V, x0 + 6 + ((hash(r.x0, 3) % (w - 12))), y1 - 4, 1, 1, '#ff6a2a');   /* an ember */
    return; }
  frame(false);
  /* the lashed stalks: bundles three stalks wide, three straw tones, feathered heads over the beam */
  const burnY = y1 - k * (h + 6);   /* the fire line climbing */
  for (let x = x0 + 4, i = 0; x < x0 + w - 4; x += 2, i++) { const lean = hash(i, r.x0) % 3 - 1, tone = ['#d8c27a', '#b8a060', '#e8d490', '#a8904c'][hash(i, 5) % 4], hi = i % 3 === 0;
    if (st === 'whole') { box(V, x, y0 - 1, 2, h + 1, tone); box(V, x + (hi ? 0 : 1), y0, 1, h, hi ? '#f0e0a8' : '#8a7840'); box(V, x + lean, y0 - 5 - (hash(i, 9) % 3), 1, 5, '#c8b070'); box(V, x + lean - 1, y0 - 4, 1, 2, '#e8dcb0'); }   /* a frond */
    else { const cut = Math.max(y0, Math.min(y1, burnY + (hash(i, 4) % 6) - 3));
      box(V, x, y0 - 1, 2, cut - y0 + 1, tone); box(V, x, cut, 2, y1 - cut, i % 2 ? '#1e1814' : '#2c221a'); if (y1 - cut > 3) box(V, x, cut, 2, 2, '#ff6a2a'); } }
  /* the twine: two bands with knots, a cross-lashing */
  for (const by of [y0 + 5, y1 - 11]) { const c = (st === 'burning' && by > burnY - 4) ? '#2a1e16' : '#6a5030'; box(V, x0 + 3, by, w - 6, 2, c); box(V, x0 + 3, by, w - 6, 1, st === 'burning' && by > burnY - 4 ? '#3a2a1e' : '#9a7a48'); for (let x = x0 + 6; x < x0 + w - 6; x += 9) { box(V, x, by - 1, 2, 4, c); } }
  if (st === 'whole') {
    for (let i = 0; i < 3; i++) if (((Math.floor(time * 2) + i * 2) % 5) === 0) box(V, x0 + 6 + ((hash(r.x0, i) % (w - 12))), y0 + 6 + i * 11, 1, 2, '#fffbe0');   /* dry straw glints */
    if (hot) { const p = 0.5 + 0.5 * Math.sin(time * 6); alpha(V, 0.35 + 0.4 * p, () => { for (let x = x0; x < x0 + w; x += 4) { box(V, x, y0 - 6, 2, 1, '#ff9a3c'); box(V, x, y1 + 1, 2, 1, '#ff9a3c'); } box(V, x0 - 2, y0 - 6, 1, h + 8, '#ff9a3c'); box(V, x0 + w + 1, y0 - 6, 1, h + 8, '#ff9a3c'); }); }
    return; }
  /* burning: tongues along the climbing line, a roar above, smoke */
  const ly = Math.max(y0 - 4, burnY);
  for (let x = x0 + 5, i = 0; x < x0 + w - 4; x += 3, i++) { const fh = 10 + (hash(i, 6) % 8) + Math.abs(Math.sin(time * 12 + i)) * 7; flame(V, x, Math.min(y1, ly + 10), fh, time, i); }
  glow(V, x0 + w / 2, (ly + y1) / 2, 44, 0.55);
  for (let i = 0; i < 6; i++) { const t = (time * 1.2 + i * 0.19) % 1; alpha(V, 0.5 * (1 - t), () => box(V, x0 + 4 + ((i * 29) % (w - 8)) + Math.sin(time * 3 + i) * 3, ly - 8 - t * 34, 3, 3, i % 2 ? '#5a504a' : '#3a342e')); }
  for (let i = 0; i < 4; i++) { const t = (time * 2 + i * 0.27) % 1; box(V, x0 + 4 + ((i * 41 + Math.floor(time * 7) * 5) % (w - 8)), ly - 6 - t * 26, 1, 1, '#ffd36b'); }
}

/* ================================================================ THE RAISED BRIDGE (r: { x, y0, y1, span: [x0, x1, row] } tiles; st raised | burning | down; k 0..1 the rope's burn) */
export function drawRopeBridge(V, r, st, k, time, hot) {
  const x = r.x * TS, y0 = r.y0 * TS, h = (r.y1 - r.y0 + 1) * TS, [sa, sb, row] = r.span; if (!vis(V, (sa - 2) * TS, x + 40, 80)) return;
  const postX = x + 22, beamY = y0 - 16;
  if (st === 'down') {   /* the deck over the chasm: planks, rope rails on posts, the burnt rope's end hanging from the beam */
    const dx0 = sa * TS, dx1 = (sb + 1) * TS, dy = row * TS;
    for (let xx = dx0; xx < dx1; xx += 8) { box(V, xx, dy, 7, 5, '#8a5a32'); box(V, xx, dy, 7, 1, '#b88450'); box(V, xx + 7, dy, 1, 5, '#3a2014'); }
    box(V, dx0, dy + 5, dx1 - dx0, 2, '#4a2e1a'); for (let xx = dx0 + 4; xx < dx1; xx += 24) box(V, xx, dy + 7, 1, 4, '#6a4528');   /* the stringers and their hangers */
    for (const px0 of [dx0 + 1, dx1 - 3]) { box(V, px0, dy - 14, 2, 14, '#5a3420'); box(V, px0, dy - 14, 1, 14, '#8a5a34'); }
    for (let xx = dx0 + 2; xx < dx1 - 2; xx += 2) { const sag = Math.round(Math.sin((xx - dx0) / (dx1 - dx0) * Math.PI) * 4); box(V, xx, dy - 12 + sag, 2, 1, C.rope); box(V, xx, dy - 5 + sag * 0.6, 2, 1, C.ropeLo); }
    for (let xx = dx0 + 12; xx < dx1 - 8; xx += 20) box(V, xx, dy - 12 + Math.round(Math.sin((xx - dx0) / (dx1 - dx0) * Math.PI) * 4), 1, 8, C.ropeLo);   /* the rail's hangers */
    box(V, postX - 2, beamY, 4, y0 + h - beamY, '#4a3020'); box(V, postX - 6, beamY, 14, 3, '#6a4528');
    const sw = Math.round(Math.sin(time * 2.2) * 1.5); for (let i = 0; i < 12; i++) box(V, postX - 5 + sw * (i > 6 ? 1 : 0), beamY + 3 + i, 1, 1, i > 8 ? '#2a1e16' : C.ropeLo);   /* the rope's charred end, hanging */
    return; }
  /* the pulley beam: a tall post behind the leaf with an arm out over it and a wheel */
  box(V, postX - 2, beamY - 2, 4, h + 18, '#4a3020'); box(V, postX - 2, beamY - 2, 1, h + 18, '#6a4a30'); box(V, postX - 2, y0 + h - 3, 8, 3, '#3a2a1a');
  box(V, x - 2, beamY - 3, postX - x + 4, 4, '#6a4528'); box(V, x - 2, beamY - 3, postX - x + 4, 1, '#9a6a3c'); box(V, x + 6, beamY + 1, 2, 5, '#3a2014');   /* the arm over the leaf and its brace */
  const wx = x + 8, wy = beamY - 7; box(V, wx - 3, wy - 3, 7, 7, '#3a3a42'); box(V, wx - 2, wy - 2, 5, 5, '#6a6a76'); box(V, wx, wy, 1, 1, '#1b1626'); box(V, wx - 1, wy - 3, 3, 1, '#a8a8b6');
  /* THE LEAF: iron-bound timber stood on end against the far lip: planks across, bands, hinges at the bottom, a boss */
  const shake = st === 'burning' ? Math.round(Math.sin(time * 40) * 1 + (k > 0.5 ? Math.sin(time * 23) : 0)) : 0;
  const lx = x + shake;
  box(V, lx, y0, TS, h, '#7a4a2a'); for (let yy = y0; yy < y0 + h; yy += 6) { box(V, lx, yy, TS, 1, '#3a2014'); box(V, lx + 1, yy + 1, TS - 2, 1, '#9a6234'); }
  box(V, lx, y0, 2, h, '#5a3420'); box(V, lx + TS - 2, y0, 2, h, '#3a2014'); for (const by of [y0 + 5, y0 + h - 10]) { box(V, lx, by, TS, 3, '#3a3a42'); box(V, lx, by, TS, 1, '#8a8a96'); for (let xx = lx + 2; xx < lx + TS - 2; xx += 5) box(V, xx, by + 1, 1, 1, '#c8ccd8'); }
  box(V, lx + 6, y0 + h / 2 - 3, 4, 6, '#3a3a42'); box(V, lx + 7, y0 + h / 2 - 2, 2, 2, C.brass);   /* the ring-boss */
  for (let yy = y0 + 4; yy < y0 + h; yy += h - 12) box(V, lx - 2, yy, 3, 4, '#2a2a32');   /* hinge straps */
  /* THE ROPE: from the leaf's top over the wheel, down the post to a cleat; burning: the flame walks it */
  const rA = [lx + 8, y0 + 1], rB = [wx, wy - 3], rC = [postX + 3, wy], rD = [postX + 3, y0 + h - 8];
  const ropeCol = (t) => (st === 'burning' && t <= k * 1.1 ? '#1e1814' : C.rope);
  for (let i = 0; i <= 12; i++) { const t = i / 12; wline(V, rA[0] + (rB[0] - rA[0]) * t, rA[1] + (rB[1] - rA[1]) * t, rA[0] + (rB[0] - rA[0]) * (t + 0.08), rA[1] + (rB[1] - rA[1]) * (t + 0.08), ropeCol(t * 0.4), 1); }
  wline(V, rB[0], rB[1], rC[0], rC[1], ropeCol(0.5), 1); wline(V, rC[0], rC[1], rD[0], rD[1], ropeCol(0.7 + 0.3), 1);
  box(V, rD[0] - 2, rD[1], 5, 3, '#3a2014'); box(V, rD[0] - 3, rD[1] + 1, 7, 1, '#5a3a22'); for (let i = 0; i < 3; i++) box(V, rD[0] - 2 + i * 2, rD[1] + 3, 2, 3, C.rope);   /* the cleat and its coil */
  if (st === 'raised' && hot) { const p = 0.5 + 0.5 * Math.sin(time * 6); alpha(V, 0.5 + 0.4 * p, () => { for (let a = 0; a < 6; a++) box(V, rA[0] + 6 + Math.cos(a) * 7 - 1, rA[1] - 10 + Math.sin(a) * 6, 2, 2, '#ff9a3c'); }); }
  if (st === 'burning') { const t = Math.min(1, k * 1.1), fx = rA[0] + (rB[0] - rA[0]) * Math.min(1, t * 2.4) + (t > 0.42 ? (rC[0] - rB[0]) * Math.min(1, (t - 0.42) * 2) : 0), fy = rA[1] + (rB[1] - rA[1]) * Math.min(1, t * 2.4) + (t > 0.42 ? (rC[1] - rB[1]) * Math.min(1, (t - 0.42) * 2) : 0);
    flame(V, fx, fy + 2, 9, time, 3); glow(V, fx, fy, 24, 0.5);
    for (let i = 0; i < 5; i++) { const q = (time * 3 + i * 0.21) % 1; box(V, fx + Math.sin(time * 9 + i * 2) * 5, fy - q * 20, 1, 1, '#ffd36b'); } }
}

/* ================================================================ THE POWDER TRAIL (t: { x0, x1, y, st, a, b } the world px of the burnt stretch; the fire's head is at b) */
export function drawTrail(V, t, time) {
  const x0 = t.x0 * TS, x1 = (t.x1 + 1) * TS, gy = (t.y + 1) * TS; if (!vis(V, x0, x1)) return;
  /* the groove: a shallow dark scoring in the floor, the powder heaped in it - grains, a few pale bits of salt-saltpetre */
  for (let x = x0, i = 0; x < x1; x += 2, i++) { const burnt = t.st !== 'dry' && x >= t.a - 1 && x <= t.b, hh = 1 + (hash(i, t.x0) % 3 === 0 ? 1 : 0);
    if (burnt) { box(V, x, gy - 2, 2, 2, hash(i, 2) % 3 ? '#1e1814' : '#3a2a22'); if (hash(i, 8) % 6 === 0) box(V, x, gy - 3, 1, 1, '#5a4a3e'); }
    else { box(V, x, gy - 1 - hh, 2, hh + 1, hash(i, 5) % 4 === 0 ? '#2a2630' : '#3a3640'); if (hash(i, 7) % 5 === 0) box(V, x, gy - 2 - hh, 1, 1, '#6a6670'); if (hash(i, 11) % 9 === 0) box(V, x + 1, gy - 1, 1, 1, '#d8d4c8'); } }
  box(V, x0 - 2, gy - 1, 3, 1, '#3a3640'); box(V, x1, gy - 1, 3, 1, '#3a3640');
  if (t.st === 'lit') { const hx = t.b;   /* the head: a white-hot knot, sparks thrown ahead and up, a fizz of smoke behind */
    box(V, hx - 2, gy - 4, 5, 4, '#ff8a2a'); box(V, hx - 1, gy - 5, 3, 4, '#ffc84a'); box(V, hx, gy - 4, 1, 3, '#fff4b0'); flame(V, hx, gy - 1, 7, time, 5);
    for (let i = 0; i < 7; i++) { const q = (time * 5 + i * 0.31) % 1, a = i * 1.7 + Math.floor(time * 11) * 0.9; box(V, hx + Math.cos(a) * q * 10, gy - 3 - Math.abs(Math.sin(a)) * q * 12, 1, 1, i % 2 ? '#ffd36b' : '#fff4b0'); }
    for (let i = 0; i < 5; i++) { const q = (time * 1.4 + i * 0.2) % 1; alpha(V, 0.5 * (1 - q), () => box(V, hx - 6 - i * 4 + Math.sin(time * 4 + i) * 2, gy - 5 - q * 20, 3, 3, '#6a6058')); }
    glow(V, hx, gy - 4, 30, 0.6); }
}

/* ================================================================ AN ARCHER NEST (n: { x0, x1, y } tiles - the platform's row is y; `blind`: a flask has flashed it) */
export function drawNest(V, n, blind, time) {
  const x0 = n.x0 * TS, x1 = (n.x1 + 1) * TS, y = n.y * TS, w = x1 - x0; if (!vis(V, x0, x1)) return;
  const posts = [x0 + 1, x1 - 4];
  for (const px0 of posts) { box(V, px0, y - 26, 3, 26, '#5a3420'); box(V, px0, y - 26, 1, 26, '#8a5a34'); for (let yy = y - 24; yy < y - 4; yy += 6) box(V, px0 - 1, yy, 5, 1, C.rope); }   /* palm posts, lashed */
  /* the woven reed screen along the front: a basket weave */
  for (let yy = y - 11, rr = 0; yy < y - 1; yy += 2, rr++) for (let xx = x0 + 4 + (rr & 1) * 3; xx < x1 - 4; xx += 6) { box(V, xx, yy, 5, 1, rr & 1 ? '#a8904c' : '#d8c27a'); box(V, xx, yy + 1, 5, 1, '#6a5430'); }
  box(V, x0 + 3, y - 12, w - 6, 2, '#5a3420'); box(V, x0 + 3, y - 12, w - 6, 1, '#8a5a34');   /* the rail */
  /* the lean-to: a striped canvas from a high beam down over the back, sagging; blind: it flaps and is bleached */
  const flap = blind ? Math.round(Math.sin(time * 16) * 1.5) : 0, c1 = blind ? '#d8c8c0' : '#7a2a24', c2 = blind ? '#f0e8dc' : '#d8c8a0';
  box(V, x0 - 1, y - 30, w + 2, 3, '#4a2e1a'); box(V, x0 - 1, y - 30, w + 2, 1, '#7a5030');
  for (let xx = x0 - 1; xx < x1 + 1; xx += 4) { const sag = Math.round(Math.sin((xx - x0) / w * Math.PI) * 2), c = ((xx - x0) >> 2) & 1 ? c1 : c2; box(V, xx, y - 27 + flap * ((xx >> 2) & 1), 4, 6 + sag, c); box(V, xx, y - 21 + sag + flap * ((xx >> 2) & 1), 4, 2, c); box(V, xx + 1, y - 19 + sag, 2, 1, c); }
  /* gear: a quiver hung from the rail, a lantern on the post (it flares white when blinded) */
  box(V, x0 + w * 0.55, y - 17, 4, 9, '#5a3418'); box(V, x0 + w * 0.55, y - 17, 4, 1, '#8a5a32'); for (let i = 0; i < 3; i++) { box(V, x0 + w * 0.55 + i, y - 20 + (i & 1), 1, 3, '#e8dcb0'); box(V, x0 + w * 0.55 + i, y - 21 + (i & 1), 1, 1, '#a8302a'); }
  const lx = posts[1] - 3; box(V, lx, y - 22, 1, 3, '#3a3a42'); box(V, lx - 2, y - 19, 5, 6, blind ? '#fffbe0' : '#d9a02a'); box(V, lx - 2, y - 19, 5, 1, '#3a3a42'); box(V, lx - 2, y - 13, 5, 1, '#3a3a42'); box(V, lx - 1, y - 17, 3, 3, blind ? '#ffffff' : '#fff0a0');
  if (blind) { alpha(V, 0.25 + 0.15 * Math.sin(time * 12), () => box(V, x0, y - 30, w, 30, '#ffffff'));
    for (let i = 0; i < 5; i++) { const a = time * 6 + i * 1.3; box(V, x0 + w / 2 + Math.cos(a) * (w * 0.35), y - 34 + Math.sin(a * 1.4) * 4, 2, 2, '#ffffff'); box(V, x0 + w / 2 + Math.cos(a) * (w * 0.35) - 1, y - 33 + Math.sin(a * 1.4) * 4, 4, 1, '#fff6c8'); } }
  else glow(V, lx, y - 17, 22, 0.25);
}

/* ================================================================ A RAIDER LINE's POST (r: { post: {x, y}, line: z, cut }) - and the rig at its tower end */
export function drawRaidRig(V, r, time, near) {
  const z = r.line, x = r.post.x * TS + 8, fy = (r.post.y + 1) * TS; if (!vis(V, Math.min(x, z.x0) - 20, Math.max(x, z.x0) + 20, 120)) return;
  /* THE POST: two timbers splayed and lashed at the head, an iron collar, a pulley wheel for the line, a ground anchor ring with the tail tied off and coiled */
  const hy = fy - 34; wline(V, x - 7, fy, x - 1, hy, '#5a3420', 3); wline(V, x + 7, fy, x + 1, hy, '#4a2a18', 3); wline(V, x - 7, fy, x - 1, hy, '#8a5a34', 1);
  box(V, x - 3, hy - 1, 7, 4, '#3a3a42'); box(V, x - 3, hy - 1, 7, 1, '#8a8a96'); box(V, x - 2, hy - 5, 5, 5, '#6a4528'); box(V, x - 1, hy - 4, 3, 3, '#3a3a42'); box(V, x, hy - 3, 1, 1, '#1b1626');   /* head, pulley */
  box(V, x - 5, fy - 12, 11, 2, '#5a3420'); box(V, x - 5, fy - 12, 11, 1, '#8a5a34');   /* the cross-brace */
  box(V, x + 9, fy - 3, 5, 3, '#3a3a42'); box(V, x + 10, fy - 6, 3, 3, '#6a6a76'); box(V, x + 11, fy - 5, 1, 1, '#1b1626');   /* the anchor ring */
  const cleat = [x + 11, fy - 6];
  if (!r.cut) { wline(V, x, hy - 3, z.x1 > z.x0 ? x : x, hy - 3, C.rope); wline(V, x, hy - 2, cleat[0], cleat[1], C.rope); for (let i = 0; i < 3; i++) box(V, x + 14 + i, fy - 2 - (i & 1), 2, 2, C.rope);
    if (near) { const p = 0.5 + 0.5 * Math.sin(time * 6); alpha(V, 0.4 + 0.45 * p, () => { for (let a = 0; a < 8; a++) box(V, x + Math.cos(a * 0.785) * 11 - 1, hy - 2 + Math.sin(a * 0.785) * 8, 2, 2, '#ffd36b'); }); } }
  else { const sw = Math.sin(time * 2.4) * 2;   /* the cut: the rope's frayed end whips loose and hangs, the cleat bare */
    for (let i = 0; i < 18; i++) box(V, x - 1 + sw * (i / 18), hy - 2 + i, 1, 1, i > 14 ? '#e8dcb0' : C.rope); box(V, x - 2 + sw, hy + 14, 1, 3, '#e8dcb0'); box(V, x + sw, hy + 15, 1, 3, '#e8dcb0'); box(V, x + 2 + sw, hy + 14, 1, 2, '#e8dcb0');
    box(V, cleat[0] - 1, cleat[1], 3, 1, '#d8bc84'); }
  /* the tower end: an outrigger beam out of the wall with an eye bolt, the rope's turns round it - and when cut, its end dangling */
  const tx = z.x0, ty = z.y0; box(V, tx - 4, ty - 5, 12, 3, '#5a3420'); box(V, tx - 4, ty - 5, 12, 1, '#8a5a34'); box(V, tx - 4, ty - 3, 3, 8, '#3a2a1a'); box(V, tx + 2, ty - 2, 2, 5, '#3a3a42'); box(V, tx + 1, ty + 3, 4, 3, '#6a6a76'); box(V, tx + 2, ty + 4, 2, 1, '#1b1626');
  if (r.cut) { const sw2 = Math.sin(time * 2.1 + 1) * 2; for (let i = 0; i < 20; i++) box(V, tx + 2 + sw2 * (i / 20), ty + 6 + i, 1, 1, i > 17 ? '#e8dcb0' : C.rope); }
}
/* THE TEACH LINES' RIGS: a leaning post with an eye at the high end and a padded buffer at the low end (the pulley is zipline.js's) */
export function drawZipRig(V, z) {
  if (z.raid || !vis(V, Math.min(z.x0, z.x1) - 10, Math.max(z.x0, z.x1) + 10, 60)) return;
  for (const [x, y, hi] of [[z.x0, z.y0, z.y0 <= z.y1], [z.x1, z.y1, z.y1 < z.y0]]) { const fy = y + (hi ? 22 : 12);
    box(V, x - 2, y - 4, 4, fy - y + 4, '#5a3420'); box(V, x - 2, y - 4, 1, fy - y + 4, '#8a5a34'); box(V, x - 3, y - 6, 6, 3, '#3a3a42'); box(V, x - 3, y - 6, 6, 1, '#8a8a96');
    if (hi) { wline(V, x - 2, fy - 4, x - 8, fy, '#4a2a18', 2); box(V, x - 2, y + 4, 4, 1, C.rope); box(V, x - 2, y + 7, 4, 1, C.rope); }
    else { box(V, x - 5, y - 2, 4, 9, '#a8302a'); box(V, x - 5, y - 2, 4, 1, '#d85a3a'); box(V, x - 5, y + 2, 4, 1, '#6a1e1e'); } }
}

/* ================================================================ TORCHES */
/* a rack of torches (s: { x, y, left }): an iron frame, a hooped oil pot kept lit, the torches leaning out of it */
export function drawTorchStack(V, s, time) {
  const x = R(s.x * TS + 8), y = (s.y + 1) * TS; if (!vis(V, x, x, 30)) return;
  box(V, x - 9, y - 3, 18, 3, '#2a2a32'); box(V, x - 9, y - 3, 18, 1, '#6a6a76'); wline(V, x - 8, y - 3, x - 3, y - 22, '#3a3a42', 2); wline(V, x + 8, y - 3, x + 3, y - 22, '#3a3a42', 2); box(V, x - 4, y - 24, 9, 2, '#4a4a54');   /* the frame */
  box(V, x - 6, y - 12, 13, 8, '#8a4a22'); box(V, x - 6, y - 12, 13, 1, '#c08a4a'); box(V, x - 7, y - 11, 15, 2, '#3a3a42'); box(V, x - 3, y - 14, 7, 2, '#3a2a14');   /* the oil pot and its wick */
  flame(V, x, y - 14, 8, time, s.x); glow(V, x, y - 18, 22, 0.35);
  const n = Math.max(0, s.left == null ? 2 : s.left);
  for (let i = 0; i < n; i++) { const a = (i - (n - 1) / 2) * 5; wline(V, x + a * 0.2, y - 10, x + a * 1.5, y - 30 + Math.abs(a) * 0.3, '#7a5a30', 2); box(V, x + a * 1.5 - 2, y - 33 + Math.abs(a) * 0.3, 5, 4, '#4a3018'); box(V, x + a * 1.5 - 1, y - 33 + Math.abs(a) * 0.3, 3, 1, '#8a6a3a'); }   /* unlit heads, waxed */
}
/* a torch in the hand, in the air or on the ground (state held | fly | burn): the shaft at its own angle, the head alight */
export function drawTorchItem(V, x, y, time, state) {
  const ang = state === 'fly' ? time * 14 : state === 'burn' ? 1.45 : -0.15, len = 14, hx = x + Math.sin(ang) * len, hy = y - Math.cos(ang) * len;
  wline(V, x, y, hx, hy, '#7a5a30', 2); wline(V, x, y, x + (hx - x) * 0.4, y + (hy - y) * 0.4, '#9a7a48', 1); box(V, hx - 2, hy - 2, 5, 5, '#3a2a18');
  if (state === 'burn') { const tilt = hy; flame(V, hx, hy + 1, 10, time, 2); glow(V, hx, hy - 4, 24, 0.5); box(V, x - 2, y, 4, 1, '#ff6a2a'); }
  else { flame(V, hx, hy - 1 + (state === 'fly' ? 0 : 0), 9, time, 1); if (state === 'fly') for (let i = 1; i < 4; i++) alpha(V, 0.5 - i * 0.12, () => box(V, hx - (hx - x) * 0.3 * i + Math.sin(time * 30 + i) * 2, hy + i * 3, 2, 2, '#ff9a3c')); glow(V, hx, hy - 4, 20, 0.45); }
}
/* a lit KEG's fuse: a hissing spark and a ring of the sparks it throws (kegs: lit and fused) */
export function kegSparks(V, x, y, time, big) {
  const hx = x + 1, hy = y - 22; box(V, hx - 1, hy - 1, 3, 3, '#fff4b0'); box(V, hx, hy - 2, 1, 1, '#ffffff');
  for (let i = 0; i < (big ? 9 : 6); i++) { const q = (time * 6 + i * 0.37) % 1, a = i * 2.4 + Math.floor(time * 13) * 1.1; box(V, hx + Math.cos(a) * q * 8, hy - Math.abs(Math.sin(a)) * q * 10 + q * q * 6, 1, 1, i % 2 ? '#ffd36b' : '#ff8a2a'); }
}

/* ================================================================ THE ARCHES: rubble where a bricked arch was (b: { x0, x1, y0, y1 } tiles) */
export function drawRubble(V, b) {
  const x0 = b.x0 * TS - 4, x1 = (b.x1 + 1) * TS + 4, gy = (b.y1 + 1) * TS; if (!vis(V, x0, x1)) return;
  for (let x = x0, i = 0; x < x1; x += 3, i++) { const mid = 1 - Math.abs((x - (x0 + x1) / 2) / ((x1 - x0) / 2)), hh = Math.round(2 + mid * 6 + (hash(i, b.x0) % 3));
    box(V, x, gy - hh, 4, hh, hash(i, 3) % 3 ? '#a5643f' : '#7a4429'); box(V, x, gy - hh, 4, 1, hash(i, 4) % 2 ? '#e6cf9e' : '#c8885a'); if (hash(i, 6) % 4 === 0) box(V, x + 1, gy - hh + 2, 2, 2, '#3a2418'); }
  for (let i = 0; i < 5; i++) { const sx = x0 + 3 + ((hash(i, 7) * 13) % (x1 - x0 - 6)); box(V, sx, gy - 11 - (i % 3) * 2, 3, 3, '#c8885a'); box(V, sx, gy - 11 - (i % 3) * 2, 3, 1, '#e6cf9e'); }   /* larger blocks on top */
  box(V, x0 - 4, gy - 1, x1 - x0 + 8, 1, '#4a3a2a'); alpha(V, 0.5, () => box(V, x0 - 2, gy - 2, x1 - x0 + 4, 2, '#1e1814'));   /* scorching and soot on the floor */
}

/* ================================================================ THE ALLEY TOWER'S STAIR (783-789, rows 17-33): a shadowed stair-well, rails and posts at every flight, a lantern at the landings */
export function drawTowerStair(V, time) {
  const x0 = 783 * TS, x1 = 790 * TS, top = 16 * TS, bot = 34 * TS; if (!vis(V, x0, x1, 60)) return;
  box(V, x0, top, x1 - x0, bot - top, '#3a2a28');
  for (let y = top; y < bot; y += 10) { const r = ((y - top) / 10) | 0, off = (r & 1) * 12; box(V, x0, y + 9, x1 - x0, 1, '#2a1c1a'); for (let x = x0 + off; x < x1; x += 24) box(V, x, y, 1, 9, '#2a1c1a'); }
  alpha(V, 0.35, () => box(V, x0, top, x1 - x0, bot - top, '#000000'));
  for (let yy = top + 30; yy < bot - 20; yy += 52) { box(V, x0 + 26, yy, 3, 12, '#0e0808'); box(V, x0 + 25, yy - 1, 5, 1, '#5a4438'); }   /* arrow slits */
  box(V, x0, top, 2, bot - top, '#5a3420'); box(V, x1 - 2, top, 2, bot - top, '#5a3420');   /* the stair-well's timber frame */
  for (let i = 0; i < 8; i++) { const a = i % 2 ? 786 : 783, b = i % 2 ? 789 : 786, y = (31 - i * 2) * TS;   /* a flight: its board's rail on the open side, posts at its ends */
    const px0 = (i % 2 ? b + 1 : a) * TS - (i % 2 ? 3 : 0); box(V, px0, y - 15, 3, 15, '#5a3420'); box(V, px0, y - 15, 1, 15, '#8a5a34');
    const ex = i % 2 ? a * TS : (b + 1) * TS - 3; box(V, ex, y - 15, 3, 15, '#5a3420');
    for (let xx = a * TS + 2; xx < (b + 1) * TS - 2; xx += 2) { const sag = Math.round(Math.sin((xx - a * TS) / ((b + 1 - a) * TS) * Math.PI) * 1.5); box(V, xx, y - 13 + sag, 2, 1, C.rope); }
    if (i % 2 === 0) { const lx = (i % 4 ? 788 : 784) * TS + 8; box(V, lx, y - 36, 1, 8, '#3a3a42'); box(V, lx - 2, y - 28, 5, 6, '#d9a02a'); box(V, lx - 2, y - 28, 5, 1, '#3a3a42'); box(V, lx - 1, y - 26, 3, 3, Math.floor(time * 7 + i) & 1 ? '#fff0a0' : '#ffd36b'); glow(V, lx, y - 25, 26, 0.3); } }
}

/* ================================================================ THE FORTRESS: crowns on every tower, the keep, the roofs' parapets */
const M = { body: '#a5643f', lit: '#c8885a', sh: '#7a4429', cap: '#e6cf9e', slit: '#1d1218', mort: '#6a3a26' };
/* a merlon crown along a flat top at world-px y: tall merlons, embrasures between, a corner pinnacle at each end (x0, x1 px) */
export function crown(V, x0, x1, y, o = {}) {
  if (!vis(V, x0, x1, 40)) return; const mw = o.mw || 12, gap = o.gap || 6, mh = o.mh || 10, step = mw + gap, n = Math.max(1, Math.floor((x1 - x0 - mw) / step) + 1), pad = ((x1 - x0) - (n * step - gap)) / 2;
  box(V, x0, y - 2, x1 - x0, 2, M.cap); box(V, x0, y - 1, x1 - x0, 1, M.sh);   /* the coping the merlons stand on */
  for (let i = 0; i < n; i++) { const mx = R(x0 + pad + i * step); box(V, mx, y - 2 - mh, mw, mh, M.body); box(V, mx, y - 2 - mh, 2, mh, M.sh); box(V, mx + mw - 2, y - 2 - mh, 2, mh, M.lit); box(V, mx - 1, y - 4 - mh, mw + 2, 2, M.cap); box(V, mx - 1, y - 3 - mh, mw + 2, 1, M.sh);
    box(V, mx + (mw >> 1) - 1, y - mh, 2, 5, M.slit); if (hash(mx >> 3, 3) % 3 === 0) box(V, mx + 2, y - 4, mw - 4, 1, M.mort); }
  if (o.pinnacles !== false) for (const px0 of [x0, x1 - 5]) { box(V, px0, y - 2 - mh - 6, 5, 6 + mh, M.body); box(V, px0, y - 2 - mh - 6, 1, 6 + mh, M.sh); box(V, px0 + 4, y - 2 - mh - 6, 1, 6 + mh, M.lit); box(V, px0 - 1, y - 2 - mh - 8, 7, 2, M.cap); box(V, px0 + 1, y - 2 - mh - 11, 3, 3, M.cap); box(V, px0 + 2, y - 2 - mh - 13, 1, 2, M.cap); }
}
/* the towers' crowns and the gatehouse's: drawn over their tiles (the tile kit leaves their tops flat) */
export function crowns(V) {
  for (const [a, b, row] of [[97, 102, 22], [158, 164, 21], [790, 795, 16]]) crown(V, a * TS, (b + 1) * TS, row * TS);
  crown(V, 257 * TS, 273 * TS, 15 * TS, { mw: 14, gap: 8, mh: 12 });   /* the gatehouse: its crest over the arch */
  const gx = 265 * TS; if (vis(V, gx - 20, gx + 20)) { box(V, gx - 10, 15 * TS + 10, 20, 24, '#7a4429'); box(V, gx - 8, 15 * TS + 12, 16, 20, '#a8302a'); box(V, gx - 8, 15 * TS + 12, 16, 2, '#d9b04a'); box(V, gx - 8, 15 * TS + 30, 16, 2, '#d9b04a');
    for (const [dx, dy] of [[-3, 18], [-2, 17], [-1, 16], [0, 16], [1, 16], [2, 17], [3, 18], [-4, 20], [4, 20], [-2, 20], [2, 20], [0, 22], [-1, 23], [1, 23]]) box(V, gx + dx, 15 * TS + dy, 1, 1, '#1b1626');   /* the hawk crest on a red shield */ }
}
/* THE KEEP on the horizon over the souq: a squat dark mass, four corner turrets, a taller central block with a banner, lit windows and a beacon; slow parallax (it rides at 0.12) */
export function drawKeep(g, cx, cy, vw, vh, time, dy = 0) {
  const base = vh - 76 + dy * 0.1, sx = R(vw / 2 + (316 * TS - (cx + vw / 2)) * 0.12); if (sx < -170 || sx > vw + 170) return;
  const haze = 'rgba(120,60,90,0.62)', haze2 = 'rgba(150,84,92,0.55)', lit = 'rgba(214,150,110,0.7)', dark = 'rgba(90,40,70,0.5)';
  const col = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), w, h); };
  col(sx - 120, base - 24, 240, 24, haze2); for (let x = sx - 120; x < sx + 120; x += 10) col(x, base - 29, 5, 5, haze2);   /* the curtain wall */
  col(sx - 54, base - 70, 108, 70, haze); for (let x = sx - 56; x < sx + 52; x += 12) col(x, base - 79, 7, 9, haze); col(sx - 57, base - 72, 114, 3, haze);   /* the lower keep, crowned */
  col(sx - 26, base - 118, 52, 50, haze); for (let x = sx - 28; x < sx + 24; x += 11) col(x, base - 127, 7, 9, haze); col(sx - 29, base - 120, 58, 3, haze);   /* the upper block */
  for (const tx of [-66, 56]) { col(sx + tx, base - 88, 12, 88, haze); col(sx + tx - 2, base - 92, 16, 4, haze); col(sx + tx + 2, base - 99, 8, 8, haze); col(sx + tx + 5, base - 107, 2, 8, haze); }   /* the corner turrets */
  col(sx - 54, base - 70, 5, 70, dark); col(sx + 49, base - 70, 5, 70, lit); col(sx - 26, base - 118, 4, 50, dark); col(sx + 22, base - 118, 4, 50, lit);
  for (const [wx, wy] of [[-40, -56], [-24, -56], [14, -56], [30, -56], [-14, -104], [4, -104], [-6, -86], [-30, -34], [26, -34], [0, -34]]) col(sx + wx, base + wy, 3, 6, 'rgba(255,196,110,0.8)');   /* lit windows */
  col(sx, base - 136, 2, 18, haze); const wv = Math.round(Math.sin(time * 3) * 1.5); for (let i = 0; i < 12; i++) col(sx + 2 + i, base - 136 + (i >> 2) * 0 + Math.round(Math.sin(time * 3 + i * 0.4) * 1.3 * (i / 12)), 1, 8 - (i >> 2), i < 1 ? 'rgba(80,16,20,0.9)' : 'rgba(168,48,42,0.8)');   /* the banner */
}
/* THE ROOFTOPS: the low parapets along the back of the three roofs, a prayer rug and a drying rack on each (A: ctx arena; V: { L, ... }) */
export function drawRoofTops(V, A) {
  if (!A || !A.hm) return; const { sx, R: Rr } = A.hm, fl = Rr * TS, X = c => (sx + c) * TS; if (!vis(V, X(0), X(46), 0)) return;
  const roofs = [[0, 12], [15, 29], [32, 45]];
  for (const [a, b] of roofs) { const x0 = X(a), x1 = X(b + 1);
    for (let x = Math.max(x0, Math.floor((V.cx - 20) / 16) * 16); x < Math.min(x1, V.cx + V.vw + 20); x += 16) { const m = (x >> 4) & 1;   /* the back parapet: blocks with crenel notches (behind the walkers) */
      box(V, x, fl - 7, 16, 7, '#9a5a38'); box(V, x, fl - 7, 16, 1, '#e0c898'); if (!m) { box(V, x + 1, fl - 14, 12, 7, '#a5643f'); box(V, x + 1, fl - 14, 12, 1, '#e6cf9e'); box(V, x + 1, fl - 14, 2, 7, '#7a4429'); box(V, x + 6, fl - 12, 1, 4, '#1d1218'); } }
    const rx = x0 + (x1 - x0) * 0.42; box(V, rx, fl - 2, 38, 2, '#a8302a'); box(V, rx, fl - 2, 38, 1, '#d8b050'); for (let i = 0; i < 5; i++) box(V, rx + 3 + i * 7, fl - 2, 2, 1, '#2a4a7a'); box(V, rx - 2, fl - 2, 2, 2, '#e8d8b0'); box(V, rx + 38, fl - 2, 2, 2, '#e8d8b0');   /* a rug, tasselled */
    const dx = x0 + (x1 - x0) * 0.82; if (dx + 40 < x1) { box(V, dx, fl - 28, 2, 28, '#5a3420'); box(V, dx + 28, fl - 28, 2, 28, '#5a3420'); box(V, dx - 1, fl - 28, 32, 2, '#6a4528'); box(V, dx - 1, fl - 28, 32, 1, '#9a6a3c');   /* a drying rack hung with cloths and dates */
      for (let i = 0; i < 4; i++) { const c = ['#a8302a', '#2a4a7a', '#d8b050', '#3a6a4a'][i], sw = Math.round(Math.sin(V.time * 1.7 + i + dx) * 1); box(V, dx + 3 + i * 7 + sw, fl - 26, 5, 14 + (i & 1) * 3, c); box(V, dx + 3 + i * 7 + sw, fl - 26, 5, 1, '#f0e0b0'); } } }
}

/* every baked-or-drawn piece on a sheet for tools/ksar-art-sheet.mjs (props2 mode): the states side by side */
export function sheetScene(V, time) {
  const L = V.L; let x = 8;
  drawShaft(V, { x0: 8, x1: 9, top: 2, bottom: 8 }, time); drawShaft(V, { x0: 12, x1: 13, top: 2, bottom: 8 }, time + 0.7);
  drawReeds(V, { x0: 16, x1: 17, y0: 3, y1: 8 }, 'whole', 0, time, false); drawReeds(V, { x0: 20, x1: 21, y0: 3, y1: 8 }, 'burning', 0.55, time, false); drawReeds(V, { x0: 24, x1: 25, y0: 3, y1: 8 }, 'burnt', 1, time, false);
  drawRopeBridge(V, { x: 29, y0: 3, y1: 8, span: [32, 38, 9] }, 'raised', 0, time, false); drawRopeBridge(V, { x: 41, y0: 3, y1: 8, span: [44, 50, 9] }, 'burning', 0.5, time, false); drawRopeBridge(V, { x: 53, y0: 3, y1: 8, span: [56, 62, 9] }, 'down', 1, time, false);
}
