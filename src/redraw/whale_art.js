// whale_art.js - THE WHALE'S LEVEL KIT (claude/whaleart, 2026-11-12). The Whale greybox (src/whale-hands.js) laid flat rectangles: pink squares for nerves, a flat red ellipse for the heart, a plain pink plank for the tongue,
// a green wash for the bile. This is the inside of a whale: FLESH that is wet and fibrous and veined (the room changes with the section: the maw's pale gums, the tongue's papillae, the gullet's ridges, the stomach's acid-etched
// browns, the rib cage's bone, the heart chamber's raw red), SINEW hung off every ceiling, and the pieces the rules use - the NERVE (idle / flare / spent), the MEMBRANE (shut / quiver / open; the sealed cardia with its
// gold sphincter), the HEART (beating, fast, flayed in the last phase), the TONGUE (a lift), the wreck RAFT (a swallowed ship's tarred planks), the BILE (surface, scum, bubbles), the LUNG (the HUD read of the breath).
// Pure drawing, fillRect only (tools/wh-art-sheet.mjs rasterises it in node, no browser). Draw-only overlays: no number, box or cell moved.
import { Layer, ell, cap, poly, line, px as pset, flush, mixC, clamp, lerp } from './sr_draw.js';
const R = Math.round, TS = 16;
export const WCOL = {
  out: '#12060a',
  flesh: ['#3a1220', '#5e1f30', '#8a3042', '#b0485a', '#d8808a'], pale: ['#8a4a50', '#c88a88', '#e8b8b0', '#f8dcd0'], gum: ['#a05a60', '#d8a0a0', '#f0ccc4'], vein: ['#3a1a4a', '#5a2a6a', '#7a3a82'],
  bone: ['#6a6048', '#8a8068', '#b8ae94', '#d8d0b8', '#ece4d0'], acid: ['#2e3a10', '#586c1c', '#8aa22c', '#c8e070'], stomach: ['#3a2418', '#5a3a28', '#7a5a3a', '#9a7a48'],
  blood: ['#2a0a12', '#5a1422', '#8a2232', '#c04050'], heart: ['#3a0a14', '#5a1420', '#8a2232', '#c04050', '#e87888'], raw: ['#4a1018', '#8a2030', '#c04050', '#e8808a'],
  tar: ['#120f0d', '#241e19', '#3a3228', '#5a4a3c'], barn: ['#6a6259', '#a8a392', '#cfc9bd'], rope: ['#6a5a3a', '#9a8458', '#c8b078'], iron: ['#2a3036', '#474e58', '#6e7886', '#aab4c4'],
  glow: '#f4d0d8', hot: '#fff0f4', gold: '#ffd36b', white: '#f6fbfc', red: '#ff6b6b', grey: '#9ab0c0', sheen: '#f4c0cc', spark: '#ffe8ee',
};
const C = WCOL;
const hash = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return (h ^ (h >>> 16)) >>> 0; };
let g_, ox_ = 0, oy_ = 0, REC = null;
const rect = (x, y, w, h, c, a = 1) => { if (REC) { REC.push([x, y, w, h, c, a]); return; } if (a !== 1) g_.globalAlpha = a; g_.fillStyle = c; g_.fillRect(R(ox_ + x), R(oy_ + y), R(w), R(h)); if (a !== 1) g_.globalAlpha = 1; };
const FLM = (L, oc = C.out, a = 1) => flush(L, (dx, dy, w, h, c, al) => rect(dx, dy, w, h, c, al * a), oc);
function at(g, x, y) { g_ = g; ox_ = R(x); oy_ = R(y); }
/* a baked drawing: built once into a list of rects (key), replayed at (x, y) */
const BAKE = new Map();
function baked(g, x, y, key, build) { let r = BAKE.get(key); if (!r) { REC = []; ox_ = 0; oy_ = 0; try { build(); } finally { r = REC; REC = null; } BAKE.set(key, r); } at(g, x, y); for (const q of r) rect(q[0], q[1], q[2], q[3], q[4], q[5]); }
export const sectionOf = tx => tx < 50 ? 'maw' : tx < 126 ? 'tongue' : tx < 171 ? 'gullet' : tx < 263 ? 'stomach' : tx < 323 ? 'rib' : 'heart';
const SEC = {
  maw: { base: '#7a2c3c', lit: C.gum[1], wash: 0.62 }, tongue: { base: '#a04456', lit: C.pale[2], wash: 0.66 }, gullet: { base: '#5e1f30', lit: C.sheen, wash: 0.66 },
  stomach: { base: '#4a2c22', lit: C.stomach[3], wash: 0.7 }, rib: { base: '#8a8068', lit: C.bone[4], wash: 0.7 }, heart: { base: '#5a1420', lit: C.heart[4], wash: 0.68 },
};

/* ---- THE FLESH: per solid tile, world-aligned. A wash of the section's colour over whatever tile art is there, then fibres, veins, pores and the wet edges. isSolid(tx, ty) = the level. ---- */
export function drawFleshTex(g, cx, cy, t, VW, VH, isSolid, W = 400, H = 48) {
  at(g, 0, 0);
  const tx0 = Math.max(0, Math.floor(cx / TS) - 1), tx1 = Math.min(W - 1, Math.ceil((cx + VW) / TS) + 1), ty0 = Math.max(0, Math.floor(cy / TS) - 1), ty1 = Math.min(H - 1, Math.ceil((cy + VH) / TS) + 1);
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
    if (!isSolid(tx, ty)) continue;
    const sec = sectionOf(tx), bone = sec === 'rib' && ty <= 43, S = SEC[sec], h = hash(tx * 3 + 1, ty * 5 + 2), x = tx * TS - cx, y = ty * TS - cy;
    const top = !isSolid(tx, ty - 1), below = !isSolid(tx, ty + 1), left = !isSolid(tx - 1, ty), right = !isSolid(tx + 1, ty);
    rect(x, y, TS, TS, bone ? C.bone[1] : S.base, bone ? 0.72 : S.wash);
    if (bone) {
      /* a rib: long striations down the bone, knobs of growth, a pale polished edge */
      for (let k = 0; k < 3; k++) { const hk = hash(tx, ty * 3 + k), sx = 2 + k * 5 + (hk % 3); rect(x + sx, y, 1, TS, C.bone[0], 0.5); rect(x + sx + 1, y + (hk >> 3) % 6, 1, 6 + (hk >> 5) % 6, C.bone[4], 0.3); }
      if (h % 4 === 0) { rect(x + 3 + (h >> 4) % 9, y + 4 + (h >> 7) % 7, 3, 2, C.bone[0], 0.7); rect(x + 4 + (h >> 4) % 9, y + 4 + (h >> 7) % 7, 1, 1, C.bone[4], 0.7); }
      if (h % 7 === 2) { const cxx = x + 3 + (h >> 5) % 9; for (let k = 0; k < 6; k++) rect(cxx + (k % 3 === 1 ? 1 : 0), y + 2 + k * 2, 1, 2, C.out, 0.5); }
    } else {
      /* muscle fibres: three wavering streaks the long way (the tile's direction wanders with the column, so it reads as grain, not tiles), one pale, two dark */
      for (let k = 0; k < 3; k++) { const hk = hash(tx >> 1, ty * 7 + k), sy = 2 + k * 5 + (hk % 3), ln = 8 + (hk >> 7) % 8, x0 = (hk >> 4) % 6;
        for (let i = 0; i < ln; i++) rect(x + x0 + i, y + sy + Math.round(Math.sin((i + tx * 4) * 0.55 + k) * 1.2), 1, 1, k === 1 ? S.lit : C.flesh[0], k === 1 ? 0.3 : 0.45); }
      /* pores */
      for (let k = 0; k < 4; k++) { const hp = hash(h + k, 9); rect(x + hp % 15, y + (hp >> 4) % 15, 1, 1, k & 1 ? S.lit : C.flesh[0], k & 1 ? 0.35 : 0.6); }
      /* veins (purple, branching): one in four tiles; thick in the heart chamber */
      if (h % 4 === 1 || (sec === 'heart' && h % 3 === 1)) { const vx = x + 2 + (h >> 4) % 10, vy = y + 1 + (h >> 8) % 4, th = sec === 'heart' ? 2 : 1;
        for (let k = 0; k < 9; k++) rect(vx + (k % 4 === 2 ? 1 : 0) - (k >> 2), vy + k, th, 1, C.vein[1], 0.75); rect(vx + 2, vy + 5, 3, 1, C.vein[1], 0.7); rect(vx + 5, vy + 6, 1, 3, C.vein[0], 0.7); }
      if (sec === 'stomach') {
        /* the stomach: pits the acid has eaten, a yellow-green stain creeping up from below, foamy dissolve specks */
        for (let k = 0; k < 2; k++) { const hp = hash(h + k, 31); if (hp % 3) continue; const px = x + 2 + (hp >> 3) % 11, py = y + 3 + (hp >> 8) % 9; rect(px, py, 3, 2, C.stomach[0], 0.8); rect(px + 1, py + 1, 1, 1, C.acid[2], 0.8); rect(px, py - 1, 3, 1, C.stomach[3], 0.4); }
        if (ty >= 40) { rect(x, y + TS - 5, TS, 5, C.acid[1], 0.28); rect(x + (h >> 4) % 10, y + TS - 6, 4, 1, C.acid[2], 0.4); } }
      if (sec === 'tongue' && top) for (let k = 0; k < 5; k++) { const px = x + 1 + k * 3 + ((h >> k) & 1); rect(px, y - 1, 2, 2, C.pale[2]); rect(px, y - 1, 2, 1, C.pale[3]); rect(px + 1, y + 1, 1, 1, C.flesh[2], 0.6); }   /* the papillae */
      if (sec === 'gullet') for (let k = 0; k < 2; k++) rect(x, y + 4 + k * 8 + (h & 1), TS, 1, C.flesh[0], 0.45), rect(x, y + 5 + k * 8 + (h & 1), TS, 1, C.sheen, 0.2);   /* the ridges of the throat */
      if (sec === 'maw' && top) { rect(x, y, TS, 2, C.gum[2], 0.8); rect(x, y + 2, TS, 1, C.gum[0], 0.6); }   /* pale gum along the floor of the mouth */
    }
    /* the wet edge: a glossy sheen on every exposed top and side face, a bright glint that moves */
    if (top) { rect(x, y, TS, 1, bone ? C.bone[4] : C.sheen, 0.55); rect(x, y + 1, TS, 1, bone ? C.bone[0] : C.flesh[0], 0.5); const gl = (Math.sin(t * 2.2 + tx * 0.8 + (h & 7)) + 1) / 2; rect(x + (h >> 3) % 12, y, 3, 1, C.white, 0.18 + 0.5 * gl); }
    if (left) { rect(x, y, 2, TS, bone ? C.bone[0] : C.flesh[0], 0.5); rect(x, y, 1, TS, bone ? C.bone[3] : C.sheen, 0.3); }
    if (right) { rect(x + TS - 2, y, 2, TS, bone ? C.bone[0] : C.flesh[0], 0.5); rect(x + TS - 1, y, 1, TS, bone ? C.bone[3] : C.sheen, 0.3); }
    if (below) {
      rect(x, y + TS - 2, TS, 2, C.out, 0.5);
      /* sinew hung off the ceiling: a pale strand with a bulb, a bile drip that runs */
      if (h % 3 === 0) { const sx = x + 3 + (h >> 4) % 9, ln = 3 + (h >> 8) % 6, sw = Math.round(Math.sin(t * 1.4 + tx) * 0.8); rect(sx + sw, y + TS, 1, ln, bone ? C.bone[3] : C.pale[1]); rect(sx + sw - 1, y + TS + ln, 3, 2, bone ? C.bone[2] : C.pale[2]); rect(sx + sw, y + TS + ln, 1, 1, C.pale[3]); }
      if (h % 5 === 2) { const dx = x + 2 + (h >> 6) % 12, fall = (t * 0.6 + (h & 15) / 15) % 1; rect(dx, y + TS, 1, 2, C.acid[2], 0.5); rect(dx, y + TS + 2 + fall * 8, 1, 2, C.acid[3], 0.8 * (1 - fall)); } }
  }
}

/* ---- THE NERVE: a ganglion rooted in the wall. st = { glow 0..1, flare (s left, > 0 = flaring), cool (s left), coolMax }. (x, feet) = the foot centre on screen. ---- */
export function drawNerve(g, x, feet, st = {}, t = 0) {
  at(g, x, feet); const fl = (st.flare || 0) > 0, spent = !fl && (st.cool || 0) > 0, gl = clamp(st.glow == null ? 0.55 : st.glow), pulse = 0.5 + 0.5 * Math.sin(t * 6 + x * 0.1), sh = fl ? R(Math.sin(t * 90) * 1) : 0;
  if (gl > 0.05 && !spent) { for (let r = 0; r < 2; r++) { const rr = 9 + r * 4 + gl * 5 + pulse * 2 * gl; for (let d = 0; d < 360; d += 30) rect(Math.cos(d * Math.PI / 180) * rr - 1, -8 + Math.sin(d * Math.PI / 180) * rr * 0.9, 2, 2, fl ? C.hot : C.glow, (fl ? 0.55 : 0.2) * gl * (1 - r * 0.4)); } }
  const L = new Layer();
  ell(L, 0, -1, 7.5, 3.2, C.flesh, { tex: C.flesh[0] });   /* where it enters the wall: a lip of flesh */
  for (const [dx, dy] of [[-7, -2], [7, -3], [-4, -1], [4, 0]]) line(L, dx, dy, dx * 0.5, dy - 3, spent ? C.vein[0] : C.vein[2], 1);   /* the strands into the flesh */
  poly(L, [[-2.6, -4], [2.6, -4], [3.4, -9], [-3.4, -9]], spent ? [C.pale[0], C.flesh[2]] : [C.pale[1], C.pale[0]]);   /* the stalk */
  const col = spent ? [mixC(C.pale[0], C.grey, 0.3), mixC(C.pale[1], C.grey, 0.35), mixC(C.pale[1], C.grey, 0.45)] : [C.pale[1], C.pale[2], C.pale[3]];
  ell(L, sh, -9.5, spent ? 4.3 : 5.4, spent ? 4.6 : 5.8, col, { tex: spent ? C.pale[0] : undefined });   /* the ganglion bulb */
  ell(L, sh, -9.5, 2.4, 2.8, spent ? [C.vein[0], C.vein[0], C.vein[1]] : fl ? [C.hot, C.hot, C.hot] : [C.sheen, C.glow, C.hot]);   /* its core */
  for (const s of [-1, 1]) line(L, s * 4, -12, s * 7, -14 + s, spent ? C.vein[0] : C.vein[2], 1);   /* the small branches off the top */
  pset(L, sh - 1, -11, spent ? C.grey : C.white); pset(L, sh, -17, spent ? C.grey : C.spark);
  FLM(L);
  if (fl) { for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + t * 8, r0 = 8, r1 = 13 + (k & 1) * 3; for (let i = r0; i < r1; i += 2) rect(Math.cos(a) * i - 1, -9.5 + Math.sin(a) * i, 2, 2, k & 1 ? C.white : C.glow, 0.85); } rect(sh - 5, -11, 11, 3, C.hot, 0.3); }
  if (spent) { const k = clamp((st.cool || 0) / (st.coolMax || 6.8)); rect(-6, 2, 12, 1, C.out, 0.6); rect(-6, 2, R(12 * k), 1, C.grey); }
}

/* ---- THE MEMBRANE: a taut sheet of flesh over a gap. st = { open, kind ('breath' | 'sealed'), quiver (px), shut (s since it closed) }. (x, y) = its top-left on screen, w x h its cells. ---- */
export function drawMembrane(g, x, y, w, h, st = {}, t = 0) {
  at(g, x, y); const sealed = st.kind === 'sealed', q = st.quiver || 0;
  if (st.open) {
    /* drawn back to the walls: puckered folds hugging each side, a wet string or two where it was */
    for (const side of [0, 1]) { const fx = side ? w - 5 : 0;
      for (let j = 0; j < h; j += 6) { const bulge = 3 + (hash(j, side + 3) % 3); const L = new Layer(); ell(L, side ? w - bulge * 0.5 : bulge * 0.5, j + 3, bulge, 3.4, [C.flesh[1], C.flesh[2], C.flesh[3]]); FLM(L); }
      rect(fx, 0, 1, h, C.sheen, 0.2); }
    for (let k = 0; k < 2; k++) { const sy = 6 + (hash(k, 77) % Math.max(1, h - 12)), sw = Math.sin(t * 3 + k) * 1.2; rect(4, sy + sw, w - 8, 1, C.pale[1], 0.45); rect(w / 2 + sw * 2, sy + 1, 1, 3, C.sheen, 0.5); }
    if (sealed) rect(w / 2 - 3, h / 2 - 1, 6, 2, C.gold, 0.5);
    return; }
  /* shut: a taut vascular sheet. rims top and bottom and sides (thick lips of flesh), fibres across, branching veins, a bright wet sheen sliding down */
  const body = sealed ? [C.flesh[1], '#7a2a3e', '#a03a50'] : [C.flesh[2], C.flesh[3], '#c06070'];
  rect(q, 0, w, h, body[1]); rect(q, 0, w, h, body[0], 0.0);
  for (let yy = 3; yy < h; yy += 7) { rect(q + 1, yy, w - 2, 1, body[0], 0.6); rect(q + 2, yy + 1, w - 4, 1, body[2], 0.5); }   /* the fibres, across the span */
  for (let k = 0; k < Math.max(2, R(h / 40)); k++) { const hk = hash(R(x / TS), 11 + k), vx = 4 + hk % Math.max(1, w - 8), vy0 = 6 + (hk >> 6) % Math.max(1, h - 40);
    for (let j = 0; j < 30; j++) rect(q + vx + R(Math.sin(j * 0.45 + k) * 2), vy0 + j, 1, 1, C.vein[1], 0.8); for (let j = 0; j < 8; j++) rect(q + vx + 2 + j, vy0 + 12 + R(j * 0.5), 1, 1, C.vein[1], 0.7); }
  const sy = ((t * 26 + x) % (h + 20)) - 10; rect(q + 2, sy, w - 4, 2, C.white, 0.18); rect(q + 2, sy + 2, w - 4, 1, C.sheen, 0.25);   /* the wet sheen sliding down */
  /* the lips: a thick rim of flesh round the opening, top and bottom and both sides, outlined */
  const L = new Layer(); for (const [ex, ey, ew, eh] of [[0, 0, w, 4], [0, h - 5, w, 5], [0, 0, 3, h], [w - 3, 0, 3, h]]) for (let j = 0; j < eh; j++) for (let i = 0; i < ew; i++) L.set(q + ex + i, ey + j, (j + i) & 3 ? C.flesh[2] : C.flesh[1]);
  FLM(L); rect(q + 3, 4, w - 6, 1, C.sheen, 0.4);
  if (sealed) {
    /* THE CARDIA: a sphincter at the middle (concentric puckered rings), a gold clasp, stitches of sinew over it: it needs a forced breath */
    const mx = q + w / 2, my = h / 2; for (let r = 11; r >= 3; r -= 2) { const L2 = new Layer(); ell(L2, mx, my, r * 0.9, r * 1.25, r % 4 === 3 ? [C.flesh[0], C.flesh[1], C.flesh[1]] : [C.flesh[1], C.flesh[2], C.flesh[3]]); FLM(L2, r === 11 ? C.out : C.flesh[0], 0.9); }
    rect(mx - 1, my - 4, 3, 8, C.gold); rect(mx - 4, my - 1, 9, 3, C.gold); rect(mx - 1, my - 1, 3, 3, '#fff0a0');
    for (let k = -2; k <= 2; k++) if (k) { rect(mx - 12, my + k * 6, 6, 1, C.pale[2], 0.9); rect(mx + 7, my + k * 6, 6, 1, C.pale[2], 0.9); }
  }
}

/* ---- THE HEART: beating behind her. beat 0..1 (the pulse), fast = the last phase (raw, flayed, glowing cracks). (x, y) = its centre on screen. Baked per beat bucket; the glow is not. ---- */
export function drawHeart(g, x, y, beat = 0, rate = 1, t = 0) {
  const fast = rate > 1.15, bb = Math.round(clamp(beat) * 5), key = 'heart' + bb + (fast ? 'f' : 'n');
  baked(g, x, y, key, () => {
    const s = 1 + bb / 5 * 0.1, L = new Layer();
    for (const [dx, tilt, w] of [[-7, -8, 6], [8, 10, 5]]) cap(L, dx * s, -26 * s, dx * s + tilt, -52, w * s, w * s * 0.9, [C.flesh[1], C.flesh[2], C.flesh[3]]);   /* the great vessels up into the ceiling */
    cap(L, 14 * s, -22 * s, 22 * s, -44, 3, 3, [C.vein[0], C.vein[1], C.vein[2]]);
    ell(L, -12 * s, -18 * s, 15 * s, 13 * s, C.heart, { tex: C.heart[0] });   /* the left lobe (atrium) */
    ell(L, 13 * s, -16 * s, 14 * s, 12 * s, C.heart, { tex: C.heart[0] });    /* the right lobe */
    ell(L, 0, 4 * s, 24 * s, 28 * s, C.heart, { rot: -8, tex: C.heart[0] });   /* the ventricles: one great swollen mass */
    ell(L, -7 * s, -2 * s, 15 * s, 18 * s, [C.heart[2], C.heart[3], C.heart[4]], { rot: -8 });   /* the lit shoulder */
    for (let k = 0; k < 11; k++) { const a = k * 0.5, vx = -10 + Math.sin(a * 1.7) * 14 * s + k * 1.6, vy = -16 + k * 3.8 * s; pset(L, vx, vy, C.vein[2]); pset(L, vx + 1, vy, C.vein[1]); }   /* the coronary veins */
    line(L, -2, -14 * s, 5, 16 * s, C.heart[0], 1); line(L, -1, -14 * s, 6, 16 * s, C.heart[1], 1);   /* the groove between the chambers */
    for (const [dx, dy, r2] of [[-16, 6, 3], [10, 10, 2.6], [-6, 22, 2.4], [16, -4, 2.2]]) { ell(L, dx * s, dy * s, r2, r2 * 0.8, [C.pale[0], C.pale[1], C.pale[2]]); pset(L, dx * s - 1, dy * s - 1, C.pale[3]); }   /* fat knots */
    if (fast) for (const [dx, dy, r2] of [[-10, -4, 5], [6, 4, 6], [-4, 16, 5], [14, -10, 4]]) { ell(L, dx * s, dy * s, r2, r2 * 0.72, C.raw); pset(L, dx * s - 1, dy * s - 1, C.raw[3]); pset(L, dx * s + 2, dy * s, C.raw[3]); }   /* flayed: the skin of the heart torn away in patches */
    FLM(L);
    for (const [px, py] of [[-14, -22], [-9, -6], [-6, 10]]) { rect(px * s, py * s, 3, 2, C.heart[4], 0.7); rect(px * s + 1, py * s - 1, 1, 1, C.white, 0.6); }   /* wet glints */
  });
  at(g, x, y);
  if (beat > 0.25) { const k = beat; for (let d = 0; d < 360; d += 20) rect(Math.cos(d * Math.PI / 180) * (34 + k * 6) - 1, -4 + Math.sin(d * Math.PI / 180) * (38 + k * 6), 2, 2, C.red, 0.3 * k); }
  if (fast) { const k = 0.5 + 0.5 * Math.sin(t * 14); rect(-18, -3, 36, 1, C.red, 0.25 + 0.3 * k); }
}

/* ---- THE TONGUE: the lift. (x, y) = the top-left of the pad on screen, w its width (px). ---- */
export function drawTongue(g, x, y, w, t = 0) {
  at(g, x, y); const L = new Layer();
  for (let i = 0; i < w; i++) { const e = Math.min(i, w - 1 - i), r = e < 3 ? 3 - e : 0; for (let j = 0 + r; j < 10 - r - (i % 7 === 3 ? 1 : 0); j++) L.set(i, j, j < 2 ? C.pale[2] : j < 5 ? C.flesh[3] : j < 8 ? C.flesh[2] : C.flesh[1]); }
  for (let i = 3; i < w - 2; i += 3) { L.set(i, -1, C.pale[2]); L.set(i + 1, -1, C.pale[3]); }   /* the papillae on top: this is what you stand on */
  FLM(L);
  rect(2, 2, w - 4, 1, C.pale[3], 0.5); for (let i = 5; i < w - 3; i += 7) { rect(i, 4, 2, 1, C.flesh[1], 0.7); rect(i + 1, 6, 1, 1, C.vein[1], 0.8); }
  rect(w / 2, 2, 1, 6, C.flesh[1], 0.6);   /* the groove down the middle */
  const gl = (Math.sin(t * 2.4 + x * 0.05) + 1) / 2; rect(R((x * 7) % Math.max(4, w - 8)) + 2, 0, 4, 1, C.white, 0.2 + 0.4 * gl);
  rect(3, 10, 1, 2 + R(gl * 1.5), C.pale[1], 0.7); rect(w - 5, 10, 1, 3, C.pale[1], 0.7);   /* a thread of spit under the edge */
}

/* ---- THE WRECK RAFT: a swallowed ship's planking on the bile. ---- */
export function drawRaft(g, x, y, w, t = 0) {
  at(g, x, y); const L = new Layer();
  for (let i = 0; i < w; i++) for (let j = 0; j < 9; j++) { const e = Math.min(i, w - 1 - i); if (e < 2 && j > 6 - e * 2) continue; L.set(i, j, j < 2 ? C.tar[3] : j < 6 ? C.tar[2] : C.tar[1]); }
  FLM(L, C.out);
  for (let sx = 11; sx < w - 3; sx += 12 + (hash(sx, 3) % 3)) rect(sx, 1, 1, 8, C.tar[0], 0.9);   /* the seams between planks */
  for (let sx = 5; sx < w - 3; sx += 12) { rect(sx, 3, 2, 2, C.iron[2]); rect(sx, 3, 1, 1, C.iron[3]); }   /* iron nails */
  for (let k = 0; k < Math.max(2, R(w / 22)); k++) { const bx = 6 + (hash(k, 5) % Math.max(1, w - 14)); rect(bx, 6, 3, 2, C.barn[1]); rect(bx, 6, 3, 1, C.barn[2]); rect(bx + 1, 5, 1, 1, C.barn[2]); }   /* barnacles */
  rect(1, 1, 3, 1, C.rope[2]); rect(1, 2, 4, 2, C.rope[1]); rect(2, 3, 1, 1, C.rope[0]);   /* a coil of rope at one end */
  rect(w - 5, -2, 1, 3, C.tar[2]); rect(w - 4, -3, 1, 2, C.tar[3]);   /* a splintered end */
  const k = (Math.sin(t * 3 + x * 0.1) + 1) / 2; rect(0, 8, w, 1, C.acid[2], 0.3 + 0.2 * k);   /* the bile lapping at its waterline */
}

/* ---- THE BILE: the surface and the body over a flooded pool. x0, x1 = the span on screen, (y, h) = the surface row and the depth. ---- */
export function drawBile(g, x0, x1, y, h, t = 0) {
  at(g, 0, 0); const w = x1 - x0, i0 = x0;
  rect(i0, y, w, h, C.acid[1], 0.3); rect(i0, y + 8, w, Math.max(0, h - 8), C.acid[0], 0.22); rect(i0, y + Math.max(0, h - 6), w, Math.min(6, h), C.acid[0], 0.25);
  /* the surface: a scum band, a bright wavering lip, pale-yellow foam flecks */
  for (let xx = x0 - (x0 % 3); xx < x1; xx += 3) { const wv = Math.round(Math.sin(xx * 0.21 + t * 2.4) * 1), cl = Math.max(xx, x0); rect(cl, y + wv, Math.min(3, x1 - cl), 1, C.acid[3], 0.8); rect(cl, y + 1 + wv, Math.min(3, x1 - cl), 1, C.acid[2], 0.45); }
  for (let xx = x0 - (x0 % 11) + R(t * 6) % 11; xx < x1; xx += 11) { const hh = hash(xx >> 2, 4); if (hh % 3) continue; rect(Math.max(xx, x0), y - 1, 3, 1, '#e8f0b0', 0.7); rect(Math.max(xx, x0) + 1, y - 2, 1, 1, '#e8f0b0', 0.5); }
  /* bubbles rising, bits of shell and krill drifting, caustic specks */
  for (let xx = x0 - (x0 % 23); xx < x1; xx += 23) { const hb = hash(xx, 6), bx = xx + hb % 17; if (bx < x0 || bx > x1 - 2) continue; const rise = (t * 0.55 + (hb & 31) / 31) % 1, by = y + h - 4 - rise * Math.max(6, h - 6); rect(bx + R(Math.sin(t * 3 + hb) * 1.5), by, 2, 2, C.acid[3], 0.6 * (1 - rise * 0.5)); rect(bx + 1, by, 1, 1, C.white, 0.5); }
  for (let xx = x0 - (x0 % 37); xx < x1; xx += 37) { const hb = hash(xx, 8), bx = xx + hb % 29; if (bx < x0 || bx > x1 - 3) continue; const by = y + 6 + (hb >> 5) % Math.max(1, h - 10) + Math.round(Math.sin(t * 1.3 + hb) * 2); rect(bx + R(Math.sin(t * 0.8 + hb) * 3), by, 3, 1, C.pale[1], 0.55); rect(bx + 1 + R(Math.sin(t * 0.8 + hb) * 3), by + 1, 1, 1, C.pale[2], 0.5); }
  for (let xx = x0 - (x0 % 9); xx < x1; xx += 9) { const hb = hash(xx, 12); if (hb % 3) continue; const k = (Math.sin(t * 2 + xx * 0.4) + 1) / 2; rect(Math.max(xx, x0), y + 3 + (hb >> 4) % 6, 2, 1, C.acid[3], 0.15 + 0.3 * k); }
}

/* ---- THE LUNG (the HUD read of the breath): two lobes holding a fill, a bronchus between. fill 0..1 (full on the inhale). tell = the flash. (x, y) = the top-left, 60 x 7. ---- */
export function drawLung(g, x, y, fill, tell, t = 0) {
  at(g, x, y); const w = 60, f = clamp(fill), pink = tell ? [C.white, C.white, C.white] : [C.pale[1], C.sheen, C.glow], L = new Layer();
  for (const [x0, x1] of [[0, 27], [32, 59]]) for (let i = x0; i <= x1; i++) { const e = Math.min(i - x0, x1 - i), r = e < 3 ? 3 - e : 0; for (let j = r; j < 7 - r; j++) L.set(i, j, C.flesh[0]); }
  FLM(L, C.out);
  const fw = R(w * f); for (const [x0, x1] of [[0, 27], [32, 59]]) for (let i = x0; i <= x1; i++) { if (i >= fw) continue; const e = Math.min(i - x0, x1 - i), r = e < 3 ? 3 - e : 0; for (let j = r + 1; j < 6 - r; j++) rect(i, j, 1, 1, j < 3 ? pink[2] : pink[1]); }
  rect(28, 2, 4, 3, C.pale[0]); rect(28, 3, 4, 1, C.pale[2]);   /* the bronchus joining the lobes */
  for (let i = 3; i < w - 3; i += 6) if (i < fw && (i < 25 || i > 33)) rect(i, 2, 1, 3, C.flesh[2], 0.5);   /* the airways, branching */
  rect(1, 1, 3, 1, C.white, 0.4);
  if (tell) { rect(-1, -1, w + 2, 1, C.white, 0.5); rect(-1, 7, w + 2, 1, C.white, 0.5); }
  void t;
}
