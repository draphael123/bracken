// rookery_world.js - THE ROOKERY's RULE MACHINES and PROPS DRAWN (claude/rookeryart). The greybox drew the cracked rocks and the nests as flat boxes (src/rookery-hands.js). Here they are the place's own things:
//   THE CRACKED FLOOR   a slab of the crag split across, limed white where the harpies have worked at it, hairline cracks running out, a painted ring on it that glints; broken, it is a ragged rim of rubble
//   THE CRACKED PILLAR  a stone column on the lip - strata, a guano cap, a black fracture across it with the lime wash round it; it topples and lies across the gap as a bridge (round broken ends)
//   THE BONE NEST       a great woven bowl of sticks and bones, eggs in it, guano on the rim, hung from a cracked arm of rock by three twig lashings; when the arm goes the nest drops and lies as a platform
//   THE CRACKED SLAB    an overhang over the cliff, split; it slides down the face and lies as a stair of broken blocks
//   THE ROOSTS + EGG NESTS   a bone nest on a knob of crag where a harpy lives; the swallows' and the harpies' egg caches on the ledges
//   THE UPDRAFT         a stone flue with feathers on its lip; pale spiral lines and lifted feathers when it blows, a whistle of lines and a shiver of feathers just before
//   THE AREA PLATE      the banner when you come into a named area: a dark plate with a bone frame
// Static art is baked once and memoised; the fall and the glints are drawn live over it. The machines' LOGIC is src/rookery-hands.js; nothing here changes the level.
import { canvas, rect as R, mulberry } from '../px.js';
import { PAL, GUANO, BONE, TWIG, EGG, RED, zoneOf, hash, mix } from './rookery_pal.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const LIME = ['#b8b4a8', '#d8d4c6', '#ece8dc', '#faf8f0'], CRACK = '#1c1a22';

/* THE CRACKED FLOOR: a slab (w px wide, 6 tall) in the floor's top, seen from the side: lit lip, split, lime */
function bakeFloor(w, z) {
  return once('fl' + w + z, () => {
    const [c, g] = canvas(w, 7), r = mulberry(w + z), S = PAL[z].s;
    R(g, 0, 0, w, 7, S[4]); R(g, 0, 0, w, 1, S[6]); R(g, 0, 1, w, 1, S[5]); R(g, 0, 6, w, 1, S[1]);
    for (let i = 0; i < 4; i++) { const x = 2 + ((r() * (w - 8)) | 0), l = 5 + ((r() * 9) | 0); R(g, x, 1, l, 2, LIME[1 + (i & 1)]); R(g, x + 1, 1, l - 2, 1, LIME[3]); }   /* the lime wash worked in */
    /* the fracture: a jagged black line across, with side cracks */
    let x = (w * 0.22) | 0, y = 0; R(g, x, y, 1, 1, CRACK);
    while (x < w - 5) { const dx = 2 + ((r() * 3) | 0); for (let k = 0; k < dx; k++) R(g, x + k, y, 1, 1, CRACK); x += dx; const dy = r() < 0.5 ? 1 : 2; R(g, x, y, 1, dy + 1, CRACK); y = Math.min(6, y + (r() < 0.7 ? dy : -1)); y = Math.max(0, y); }
    for (let i = 0; i < 5; i++) { const sx = 3 + ((r() * (w - 8)) | 0); R(g, sx, 1 + ((r() * 2) | 0), 1, 2 + ((r() * 3) | 0), CRACK); R(g, sx + 1, 4, 2, 1, S[1]); }
    return c; });
}
/* THE CRACKED PILLAR: a hoodoo of the crag's own stone, ~14 wide, h tall: a wind-worn profile (waist, bulges, chipped notches), lit left, strata, flutes, a guano cap, a black FRACTURE across it with the lime wash worked round */
function pillarHalf(y, h, r) { const t = y / h; return 6.2 + Math.sin(y * 0.19) * 1.1 + Math.sin(y * 0.071 + 1.3) * 1.3 + (t > 0.86 ? (t - 0.86) * 18 : 0) - (t < 0.1 ? 0.6 : 0); }
function bakePillar(h, z) {
  return once('pl' + h + z, () => {
    const [c, g] = canvas(30, h + 8), r = mulberry(h * 7 + z), S = PAL[z].s, cx = 15, top = 4, fy = Math.round(h * 0.42);
    const hw = [], jl = [], jr = []; for (let y = 0; y < h; y++) { hw.push(pillarHalf(y, h, r)); jl.push(Math.round((r() - 0.5) * 1.6)); jr.push(Math.round((r() - 0.5) * 1.6)); }
    for (let y = 0; y < h; y++) { const shift = y > fy ? 1 : 0, l = Math.round(cx - hw[y] + jl[y] + shift), rr = Math.round(cx + hw[y] + jr[y] + shift), yy = top + y, w = rr - l, bed = (y % 11 === 5) || (y % 17 === 2);
      R(g, l, yy, w, 1, S[3]); R(g, l, yy, Math.max(2, w * 0.3 | 0), 1, S[5]); R(g, l, yy, 1, 1, S[6]); R(g, rr - Math.max(2, w * 0.28 | 0), yy, Math.max(2, w * 0.28 | 0), 1, S[1]); R(g, rr - 1, yy, 1, 1, S[0]);
      if (bed) { R(g, l + 1, yy, w - 2, 1, S[1]); R(g, l + 1, yy + 1, Math.max(2, w * 0.3 | 0), 1, S[6]); }
      if ((y + 3) % 7 === 0 && r() < 0.7) R(g, l + 2 + ((r() * Math.max(1, w - 6)) | 0), yy, 1 + ((r() * 3) | 0), 1, S[2]);   /* flutes and chips */
      if (r() < 0.05) { R(g, l - 1, yy, 1, 2, S[1]); } }
    /* guano: the cap and a drip over the lit side; a streak down the shaft */
    R(g, cx - 9, 2, 18, 3, S[4]); R(g, cx - 9, 2, 18, 1, S[6]); R(g, cx - 8, 0, 16, 3, GUANO[2]); R(g, cx - 6, 0, 12, 1, GUANO[3]); R(g, cx - 3, 4, 3, 4, GUANO[2]); R(g, cx + 3, 4, 2, 7, GUANO[1]); R(g, cx + 3, 11, 2, 1, GUANO[0]);
    for (let q = 0; q < 14; q++) R(g, cx - 4, top + 6 + q, 1, 1, q % 5 === 4 ? GUANO[1] : GUANO[2]);
    const lc = PAL[z].lichen; R(g, cx + 2, top + Math.round(h * 0.7), 2, 1, lc[0]); R(g, cx - 5, top + Math.round(h * 0.25), 2, 1, lc[1]);
    /* THE FRACTURE: the black zigzag clean across (the upper half sits a pixel off its lower), lime wash round it, hairline cracks above and below */
    const w0 = Math.round(cx - hw[fy] - 1), w1 = Math.round(cx + hw[fy] + 3), fyy = top + fy;
    for (let k = 0; k < 7; k++) { const px = w0 + ((r() * (w1 - w0 - 3)) | 0), py = fyy - 3 + ((r() * 7) | 0), ww = 2 + ((r() * 4) | 0); R(g, px, py, ww, 1, LIME[1 + (k & 1)]); if (k % 3 === 0) R(g, px + 1, py - 1, Math.max(1, ww - 2), 1, LIME[3]); }
    let x = w0, y = fyy - 1; R(g, x, y, 1, 1, CRACK); while (x < w1) { const dx = 2 + ((r() * 2) | 0); R(g, x, y, dx, 1, CRACK); x += dx; const dy = 1 + ((r() * 2) | 0), sg = r() < 0.5 ? -1 : 1; for (let q = 0; q < dy; q++) R(g, x, y + q * sg, 1, 1, CRACK); y += dy * sg; if (y < fyy - 3) y = fyy - 2; if (y > fyy + 3) y = fyy + 2; }
    R(g, cx - 3, fyy - 8, 1, 5, CRACK); R(g, cx - 2, fyy - 4, 1, 1, CRACK); R(g, cx + 2, fyy + 4, 1, 6, CRACK); R(g, cx + 1, fyy + 9, 1, 1, CRACK); R(g, cx - 6, fyy + 6, 3, 1, CRACK);
    return c; });
}
/* THE FALLEN PILLAR, lying across a gap: len px long, the same stone laid on its side, round broken ends */
function bakeFallen(len, z) {
  return once('fn' + len + z, () => {
    const [c, g] = canvas(len, 15), r = mulberry(len + z), S = PAL[z].s;
    for (let x = 0; x < len; x++) { const e = x < 5 ? 5 - x : x >= len - 5 ? x - (len - 5) : 0, hw = 6 + Math.round(Math.sin(x * 0.17) * 0.9 + Math.sin(x * 0.061) * 1.1), y0 = 7 - hw + (e > 0 ? e >> 1 : 0) + 1, y1 = 7 + hw - (e > 0 ? e >> 1 : 0), bed = x % 11 === 5 || x % 17 === 2;
      R(g, x, y0, 1, y1 - y0, S[3]); R(g, x, y0, 1, 2, S[5]); R(g, x, y1 - 3, 1, 3, S[1]); R(g, x, y1 - 1, 1, 1, S[0]); if (bed) { R(g, x, y0 + 1, 1, y1 - y0 - 2, S[1]); }
      if (r() < 0.07) R(g, x, y0 + 3 + ((r() * Math.max(1, y1 - y0 - 6)) | 0), 1, 1, S[2]); }
    R(g, 3, 0, len - 6, 2, GUANO[2]); R(g, 6, 0, Math.max(2, len - 14), 1, GUANO[3]); R(g, 10, 2, 3, 2, GUANO[1]);
    for (let k = 0; k < 3; k++) { const x = 8 + ((r() * Math.max(1, len - 28)) | 0); R(g, x, 3, 8, 3, LIME[1]); R(g, x + 1, 3, 4, 1, LIME[3]); R(g, x + 1, 5, 1, 5, CRACK); R(g, x + 2, 9, 3, 1, CRACK); }
    R(g, 0, 5, 3, 6, S[1]); R(g, len - 3, 5, 3, 6, S[0]);
    return c; });
}
/* THE BONE NEST: a woven bowl w wide, 16 tall: sticks laid in courses, bones set in the rim, cream eggs, guano; hung = three twig lashings run up to the arm */
function bakeNest(w, z, hung) {
  return once('ne' + w + z + (hung ? 'h' : ''), () => {
    const H = 18, [c, g] = canvas(w, H), r = mulberry(w * 3 + z);
    /* the bowl: elliptical, filled with stick strokes of three browns */
    for (let y = 4; y < H; y++) { const q = (y - 4) / (H - 4), hw = Math.round((w / 2 - 1) * Math.sqrt(Math.max(0, 1 - q * q * 0.9))); R(g, (w >> 1) - hw, y, hw * 2, 1, TWIG[1]); }
    for (let i = 0; i < w * 1.3; i++) { const x = 1 + ((r() * (w - 4)) | 0), y = 5 + ((r() * (H - 6)) | 0), l = 3 + ((r() * 6) | 0), col = [TWIG[0], TWIG[2], TWIG[3], BONE[1]][(r() * 4) | 0], dir = r() < 0.5 ? 1 : -1;
      for (let k = 0; k < l; k++) { const px = x + k, py = y + ((k * dir * 0.25) | 0); const q = (py - 4) / (H - 4), hw = Math.round((w / 2 - 1) * Math.sqrt(Math.max(0, 1 - q * q * 0.9))); if (Math.abs(px - (w >> 1)) <= hw && py < H) R(g, px, py, 1, 1, col); } }
    R(g, 1, H - 3, w - 2, 3, TWIG[0]); R(g, 3, H - 1, w - 6, 1, '#14100c');
    /* the rim: bones and sticks poking out, lit */
    R(g, 0, 4, w, 2, TWIG[2]); R(g, 0, 4, w, 1, TWIG[3]);
    for (let k = 0; k < w; k += 5) { const bx = k + ((r() * 2) | 0), bl = 3 + ((r() * 4) | 0); if (r() < 0.55) { R(g, bx, 3 - (bl >> 1), 2, bl, BONE[2]); R(g, bx, 3 - (bl >> 1), 1, bl, BONE[3]); R(g, bx - 1, 3 - (bl >> 1), 4, 1, BONE[2]); } else { R(g, bx, 3, 5, 1, TWIG[3]); R(g, bx + 3, 2, 1, 1, TWIG[2]); } }
    /* the eggs inside, cream with a shadowed side; a feather */
    for (const ex of [(w * 0.3) | 0, (w * 0.52) | 0, (w * 0.7) | 0]) if (ex > 4 && ex < w - 8) { R(g, ex, 1, 5, 5, EGG[1]); R(g, ex + 1, 0, 3, 1, EGG[2]); R(g, ex + 1, 1, 2, 1, '#ffffff'); R(g, ex + 4, 3, 1, 3, EGG[0]); R(g, ex + 1, 5, 4, 1, EGG[0]); }
    R(g, 2, 5, 3, 1, GUANO[3]); R(g, 3, 6, 6, 1, GUANO[2]); R(g, (w >> 1) + 4, 5, 5, 1, GUANO[2]); R(g, w - 6, 6, 3, 2, GUANO[1]);   /* guano over the rim */
    if (hung) for (const lx of [3, (w >> 1), w - 4]) { for (let y = 4; y < 8; y++) R(g, lx, y, 1, 1, TWIG[3]); }
    return c; });
}
/* the arm a nest hangs from: a cracked spur of rock, w long */
function bakeArm(w, z) {
  return once('ar' + w + z, () => {
    const [c, g] = canvas(w, 12), r = mulberry(w + 9), S = PAL[z].s;
    for (let x = 0; x < w; x++) { const t = x / w, y0 = Math.round(1 + t * 1.5), y1 = Math.round(11 - t * 5 + (x === w - 1 ? 2 : 0)); R(g, x, y0, 1, y1 - y0, S[3]); R(g, x, y0, 1, 2, S[5]); R(g, x, y1 - 2, 1, 2, S[1]); }
    R(g, 0, 0, w, 1, S[6]); R(g, 2, 0, w - 4, 1, GUANO[2]);
    const cx0 = (w * 0.5) | 0; R(g, cx0 - 1, 2, 4, 6, LIME[1]); R(g, cx0, 2, 1, 2, CRACK); R(g, cx0 + 1, 4, 1, 2, CRACK); R(g, cx0, 6, 1, 3, CRACK); R(g, cx0 + 2, 7, 2, 1, CRACK);
    R(g, w - 5, 8, 4, 3, TWIG[2]); R(g, w - 5, 8, 4, 1, TWIG[3]);   /* the lashing's knot */
    return c; });
}
/* THE CRACKED SLAB over the cliff: w wide, 11 tall, split, guano-capped, lime-washed */
function bakeSlab(w, z) {
  return once('sb' + w + z, () => {
    const [c, g] = canvas(w, 12), r = mulberry(w * 5 + z), S = PAL[z].s;
    R(g, 0, 1, w, 8, S[3]); R(g, 0, 1, w, 2, S[5]); R(g, 0, 0, w, 1, S[6]); R(g, 0, 8, w, 3, S[1]); R(g, 0, 10, w, 1, S[0]);
    for (let x = 4; x < w - 3; x += 7 + ((r() * 5) | 0)) { R(g, x, 9, 2, 1 + ((r() * 3) | 0), S[2]); }   /* chipped underside */
    R(g, 2, 0, w - 4, 2, GUANO[2]); R(g, 4, 0, w - 10, 1, GUANO[3]); R(g, w - 9, 2, 3, 3, GUANO[1]);
    for (let k = 0; k < 2; k++) { const x = 6 + ((r() * (w - 22)) | 0); R(g, x, 2, 9, 5, LIME[1]); R(g, x + 1, 2, 5, 1, LIME[3]); }
    let x = 3, y = 1; while (x < w - 4) { const dx = 2 + ((r() * 3) | 0); R(g, x, y, dx, 1, CRACK); x += dx; const dy = 1 + ((r() * 2) | 0); R(g, x, y, 1, dy + 1, CRACK); y = Math.min(9, y + dy); if (y > 8) y = 3; }
    return c; });
}
/* a harpy's ROOST: a knob of crag with a broad bone nest on it, a splash of guano, a skull and a feather */
function bakeRoost(z) {
  return once('ro' + z, () => {
    const [c, g] = canvas(34, 22), r = mulberry(88 + z), S = PAL[z].s, nest = bakeNest(30, z, false);
    for (let y = 0; y < 8; y++) { const hw = 10 + y; R(g, 17 - hw, 14 + y, hw * 2, 1, y < 2 ? S[4] : S[3]); R(g, 17 - hw, 14 + y, 3, 1, S[5]); R(g, 17 + hw - 3, 14 + y, 3, 1, S[1]); }
    R(g, 8, 14, 18, 1, S[6]); R(g, 11, 13, 9, 1, GUANO[3]); R(g, 21, 14, 4, 5, GUANO[2]); R(g, 21, 19, 4, 1, GUANO[0]); R(g, 6, 16, 2, 6, GUANO[1]);
    g.drawImage(nest, 2, 1);
    R(g, 3, 12, 5, 3, BONE[2]); R(g, 3, 12, 5, 1, BONE[3]); R(g, 4, 13, 1, 1, '#14100c'); R(g, 6, 13, 1, 1, '#14100c');   /* a skull */
    return c; });
}
/* an egg cache on a ledge: a small nest, two or three eggs */
function bakeEggs(z, v) {
  return once('eg' + z + v, () => { const [c, g] = canvas(22, 12), r = mulberry(v * 5 + 1);
    R(g, 1, 7, 20, 4, TWIG[1]); R(g, 2, 10, 18, 2, TWIG[0]); R(g, 0, 8, 22, 1, TWIG[2]); for (let k = 0; k < 5; k++) { R(g, 1 + k * 4, 6 + (k % 2), 3, 1, k % 2 ? BONE[2] : TWIG[3]); R(g, 2 + k * 4, 11, 2, 1, TWIG[2]); }
    for (const ex of [4, 9, 14]) if (v + ex & 1 || ex === 9) { R(g, ex, 2, 5, 6, EGG[1]); R(g, ex + 1, 1, 3, 1, EGG[2]); R(g, ex + 1, 2, 2, 1, '#ffffff'); R(g, ex + 4, 4, 1, 4, EGG[0]); R(g, ex + 1, 7, 4, 1, EGG[0]); }
    R(g, 2, 6, 5, 1, GUANO[3]); R(g, 16, 6, 3, 1, GUANO[2]); return c; });
}

const Z = x => Math.min(4, zoneOf(x));
const sd = d => (d.cleat ? d.cleat[0] : 0);

/* ----------------------------------------------------------------- the machines ----------------------------------------------------------------- */
/* a cracked rock whole / breaking / broken. sx, sy = the mark's screen x and the floor's screen y under it (rookery-hands markX/markY); c = { d, state, fold, t } */
export function drawCrack(g, c, ctx) {
  const { d, state, fold } = c, { cx, cy, TS, time, cells, solidAt } = ctx, mx = d.cleat[0] * TS + 8, my = (d.cleat[1] + 1) * TS, sx = Math.round(mx - cx), sy = Math.round(my - cy), z = Z(d.cleat[0]), whole = state === 'whole';
  const top = d.top !== undefined ? d.top : d.cleat[1] - 4;
  if (d.load === 'drop') {
    if (whole) { const fl = bakeFloor(36, z); g.drawImage(fl, sx - 18, sy - 1); }
    else { const k = state === 'break' ? fold : 1;   /* the floor drops out: bits of it falling, then the rim's rubble */
      if (state === 'break') { for (let q = 0; q < 5; q++) { const px = sx - 16 + q * 8, py = sy + Math.round(k * k * (30 + q * 6)); R(g, px, py - 1, 7, 4, PAL[z].s[3]); R(g, px, py - 1, 7, 1, PAL[z].s[5]); R(g, px + 3, py + 1, 1, 2, CRACK); } }
      else { R(g, sx - 21, sy - 1, 4, 3, PAL[z].s[3]); R(g, sx - 21, sy - 1, 4, 1, PAL[z].s[5]); R(g, sx + 18, sy - 1, 4, 3, PAL[z].s[3]); R(g, sx + 18, sy - 1, 4, 1, PAL[z].s[5]); R(g, sx - 19, sy + 2, 2, 2, LIME[1]); R(g, sx + 19, sy + 2, 2, 1, LIME[1]); } }
  } else if (d.load === 'span') {
    const bx = Math.round(d.x * TS + 8 - cx), foot = Math.round((d.cleat[1] + 1) * TS - cy), h = Math.max(18, foot - Math.round(top * TS - cy)), dir = Math.sign(d.span[0] - d.x) || 1;
    if (whole || state === 'break') { const sp = bakePillar(h, z); g.save(); g.translate(bx, foot); g.rotate(dir * (state === 'break' ? fold * fold : 0) * Math.PI / 2); g.drawImage(sp, -15, -h - 4); g.restore(); }
    else { const s0 = Math.round(d.span[0] * TS - cx), s1 = Math.round((d.span[1] + 1) * TS - cx), yy = Math.round(d.span[2] * TS - cy), len = s1 - s0; g.drawImage(bakeFallen(len, z), s0, yy - 4); }
  } else if (d.load === 'nest') {
    const ax = Math.round(d.x * TS + 8 - cx), ay = Math.round(top * TS - cy), s0 = Math.round(d.span[0] * TS - cx), s1 = Math.round((d.span[1] + 1) * TS - cx), ny = Math.round(d.span[2] * TS - cy), nw = Math.max(26, s1 - s0), nx = Math.round((s0 + s1) / 2);
    if (whole) { const dirx = Math.sign(nx - ax) || 1, aw = Math.abs(nx - ax) + 8, arm = bakeArm(Math.max(14, aw), z), nest = bakeNest(nw, z, true);
      g.save(); g.translate(ax, ay - 2); if (dirx < 0) g.scale(-1, 1); g.drawImage(arm, -4, 0); g.restore();
      g.fillStyle = TWIG[3]; for (const lx of [-0.34, 0, 0.34]) { const px = Math.round(nx + lx * nw), py = ay + 14; g.fillRect(px, py, 1, ay + 24 - py + 6); }   /* the lashings */
      g.drawImage(nest, nx - (nw >> 1), ay + 24); }
    else if (state === 'break') { const nest = bakeNest(nw, z, false), yy = Math.round(ay + 24 + (ny - ay - 24 - 12) * fold * fold); g.save(); g.translate(nx, yy + 9); g.rotate(Math.sin(fold * 7) * 0.12 * (1 - fold)); g.drawImage(nest, -(nw >> 1), -9); g.restore(); }
    else { g.drawImage(bakeNest(nw, z, false), nx - (nw >> 1), ny - 9); }
  } else if (d.load === 'steps') {
    const xs = cells.map(q => q[0]), x0 = Math.min(...xs), x1 = Math.max(...xs) + 1, ty = Math.round(top * TS - cy), wpx = (x1 - x0) * TS;
    if (whole) g.drawImage(bakeSlab(wpx, z), Math.round(x0 * TS - cx), ty - 1);
    else if (state === 'break') { g.save(); g.translate(Math.round(x0 * TS - cx), Math.round(ty + (sy - ty - 8) * fold * fold * 0.7)); g.drawImage(bakeSlab(wpx, z), 0, 0); g.restore(); }
    else for (const [x, y, k] of cells) { const px = Math.round(x * TS - cx), py = Math.round(y * TS - cy); if (k === 'S') { if (!solidAt || !solidAt(x, y - 1) || true) { R(g, px + 2, py - 1, 6, 1, LIME[1]); R(g, px + 9, py - 2, 3, 1, GUANO[3]); } } }
  }
}
/* THE MARK on the footing: a lime ring painted on the stone and a glint; whole cracks only */
export function drawMark(g, sx, sy, time) {
  const k = 0.5 + 0.5 * Math.sin(time * 5);
  g.strokeStyle = 'rgba(250,248,240,0.85)'; g.lineWidth = 1; g.beginPath(); g.ellipse(sx, sy - 1, 12, 3, 0, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(255,211,107,' + (0.45 + 0.4 * k).toFixed(2) + ')'; g.beginPath(); g.ellipse(sx, sy - 1, 14, 4, 0, 0, Math.PI * 2); g.stroke();
  for (let q = 0; q < 4; q++) { const a = time * 1.6 + q * 1.57; R(g, Math.round(sx + Math.cos(a) * 13), Math.round(sy - 1 + Math.sin(a) * 3.5), 1, 1, '#fff6c8'); }
}
/* the result's ghost: a dashed gold outline over its cells + a faint fill, so what it will do is shown first */
export function drawGhost(g, cells, cx, cy, TS, time) {
  g.fillStyle = 'rgba(255,233,160,0.16)'; g.strokeStyle = 'rgba(255,233,160,0.62)'; if (g.setLineDash) g.setLineDash([2, 3]);
  for (const [x, y, k] of cells) { const sx = Math.round(x * TS - cx), sy = Math.round(y * TS - cy);
    if (k === 'A') { g.strokeRect(sx + 0.5, sy + 0.5, TS - 1, TS - 1); }
    else if (k === 'O') { g.fillRect(sx + 1, sy, TS - 2, 4); g.strokeRect(sx + 1.5, sy + 0.5, TS - 3, 3); }
    else if (!cells.some(q => q[0] === x && q[1] === y - 1)) { g.fillRect(sx + 1, sy, TS - 2, 3); g.strokeRect(sx + 1.5, sy + 0.5, TS - 3, 2); } }
  if (g.setLineDash) g.setLineDash([]);
}
export function drawRoost(g, sx, sy, z) { const sp = bakeRoost(z); g.drawImage(sp, sx - 17, sy - 14); }
export function drawEggs(g, sx, sy, z, v) { const sp = bakeEggs(z, v); g.drawImage(sp, sx - 11, sy - 11); }

/* THE UPDRAFT (L.rookery's 'vent' wind props): a stone flue; pale spiral lines and lifted feathers while it blows; the whistle and the shiver just before */
export function drawUpdraft(g, pr, cx, cy, time) {
  const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy), hw = pr.w || 13, top = y - pr.h, ph = (time + (pr.phase || 0)) % pr.period, on = pr.active, warm = !on && ph > pr.period - 1, z = Z(pr.x / 16);
  const S = PAL[z].s;
  /* the column: a soft shaft, brighter while it blows */
  const gr = g.createLinearGradient(0, top, 0, y); gr.addColorStop(0, 'rgba(236,240,255,0)'); gr.addColorStop(1, 'rgba(236,240,255,' + (on ? 0.26 : warm ? 0.12 : 0.045) + ')'); g.fillStyle = gr; g.fillRect(x - hw, top, hw * 2, pr.h);
  g.globalAlpha = on ? 0.7 : 0.28; g.fillStyle = '#eef2ff'; for (let xx = x - hw; xx < x + hw; xx += 4) g.fillRect(xx, top - 1, 2, 1); g.globalAlpha = 1;   /* the top of the lift, dashed */
  if (on) {
    /* spiral streams: long pale S-curves rising */
    g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 1;
    for (let k = 0; k < 6; k++) { const yy = y - 6 - ((time * 150 + k * pr.h / 6) % pr.h), amp = hw * 0.55, xx = x + Math.sin(yy * 0.07 + k * 1.7 + time * 3) * amp; g.beginPath(); g.moveTo(xx, yy); g.lineTo(x + Math.sin((yy - 14) * 0.07 + k * 1.7 + time * 3) * amp, yy - 14); g.stroke(); }
    /* feathers carried up */
    for (let k = 0; k < 5; k++) { const t = ((time * 0.55 + k * 0.2) % 1), yy = y - 4 - t * pr.h, xx = x + Math.sin(t * 11 + k * 2.3) * (hw - 3), cc = k % 2 ? '#eceaf2' : '#c6c4d4';
      g.fillStyle = cc; g.fillRect(Math.round(xx), Math.round(yy), 3, 1); g.fillRect(Math.round(xx) + 1, Math.round(yy) + 1, 2, 1); g.fillStyle = '#8a88a0'; g.fillRect(Math.round(xx) + 3, Math.round(yy) - 1, 1, 1); }
  } else if (warm) {
    /* the WHISTLE: short lines flicker at the flue's mouth, feathers shiver on the lip */
    g.fillStyle = 'rgba(255,255,255,0.65)'; for (let k = 0; k < 4; k++) { const yy = y - 8 - ((time * 60 + k * 11) % 26); if (Math.floor(time * 14 + k) % 2) g.fillRect(x - 6 + k * 4, Math.round(yy), 1, 5); }
  }
  /* the flue's mouth: a ring of stones, a dark hole, a bone and feathers on the lip */
  R(g, x - 11, y - 3, 22, 3, S[2]); R(g, x - 11, y - 3, 22, 1, S[5]); R(g, x - 9, y - 6, 18, 3, S[3]); R(g, x - 9, y - 6, 18, 1, S[6]); R(g, x - 6, y - 4, 12, 2, on ? '#dfe6ff' : '#0e0c14'); R(g, x - 5, y - 4, 10, 1, on ? '#ffffff' : '#241f30');
  R(g, x - 12, y - 4, 3, 2, GUANO[2]); R(g, x + 9, y - 4, 3, 2, GUANO[1]); R(g, x + 7, y - 8, 4, 2, BONE[2]); R(g, x + 7, y - 8, 4, 1, BONE[3]);
  const fl = on ? Math.round(Math.sin(time * 18) * 1) : warm ? Math.round(Math.sin(time * 40)) : 0; R(g, x - 8 + fl, y - 8, 4, 1, '#eceaf2'); R(g, x - 7 + fl, y - 9, 2, 1, '#c6c4d4'); R(g, x - 4, y - 7, 3, 1, '#eceaf2');
}
/* THE AREA PLATE: the name of the place, in a dark plate with a bone frame and two talons */
export function drawPlate(g, text, VW, a, ctxText) {
  const w = Math.min(VW - 40, 12 + text.length * 9), x = Math.round((VW - w) / 2), y = 22; g.globalAlpha = a;
  R(g, x, y, w, 20, '#181420'); R(g, x, y, w, 1, BONE[2]); R(g, x, y + 19, w, 1, BONE[1]); R(g, x, y, 1, 20, BONE[2]); R(g, x + w - 1, y, 1, 20, BONE[1]);
  for (const [px, fl] of [[x - 4, 1], [x + w + 1, -1]]) { R(g, px, y + 6, 3, 2, BONE[3]); R(g, px + fl, y + 8, 2, 4, BONE[2]); R(g, px, y + 12, 3, 2, BONE[3]); }
  R(g, x + 3, y + 3, w - 6, 1, '#2c2638'); R(g, x + 3, y + 16, w - 6, 1, '#2c2638');
  if (ctxText) ctxText(text, Math.round(VW / 2), y + 6, '#ece8dc', 'center', 8); g.globalAlpha = 1;
}
export const zoneIdx = x => Z(x);

/* ----------------------------------------------------------------- THE PIERS: the stone that holds a ledge up (src/forest-supports.js, p.rk) -----------------------------------------------------------------
   a hoodoo of the crag's own rock under each shelf: a flared capital, a waist, a talus foot - or, with no ground under it, the underbelly of a floating crag, tapering to a point.
   Strata and lit left like the tiles (the zone's stone), white guano streaked down it from the slab above, lichen, a bone caught in a crack. Baked once per support. */
const PIER = new Map();
function pierHalf(r, len, w0, free) {
  const base = w0 / 2;
  if (free) return Math.max(0.5, base * Math.pow(1 - r / len, 0.85) + 0.5);
  const waist = Math.max(5, base * 0.78), foot = Math.min(14.5, base + 3 + len / 24), F = Math.min(70, len * 0.5), cap = Math.max(0, 1 - r / 12), t2 = Math.max(0, Math.min(1, (r - (len - F)) / F));
  return waist + (base - waist) * cap + (foot - waist) * Math.pow(t2, 1.7);
}
export function drawPier(g, p, cx, cy) {
  const key = p.x + ',' + p.y + ',' + p.bottom + ',' + (p.w || 0) + (p.free ? 'f' : ''); let s = PIER.get(key);
  if (!s) { const len = Math.max(4, Math.round((p.bottom - p.y) * 16 - 10)), w0 = Math.max(10, Math.min(26, p.w || 16)), free = !!p.free, sdd = (p.x * 31 + p.y * 17) | 0, z = Z(p.x), S = PAL[z].s, top = 5, CX = 22;
    const [c, gg] = canvas(44, len + 10), r = mulberry(sdd), rowL = [], rowR = [];
    for (let q = 0; q < len; q++) { const hw = pierHalf(q, len, w0, free), bl = Math.sin(q / 6.2 + sdd) * 1.6 + Math.sin(q / 2.9 + sdd * 0.3) * 0.7, jl = Math.round((((hash(sdd, q >> 2) % 100) / 100) - 0.5) * 3 + bl), jr = Math.round((((hash(sdd + 9, q >> 2) % 100) / 100) - 0.5) * 3 - bl * 0.8); rowL.push(Math.round(CX - hw - jl)); rowR.push(Math.round(CX + hw + jr)); }
    /* the corbel under the slab */
    R(gg, rowL[0] - 3, top - 4, rowR[0] - rowL[0] + 7, 4, S[2]); R(gg, rowL[0] - 3, top - 4, rowR[0] - rowL[0] + 7, 1, S[5]); R(gg, rowL[0] - 3, top - 1, rowR[0] - rowL[0] + 7, 1, S[0]);
    for (let q = 0; q < len; q++) { const l = rowL[q], rr = rowR[q], y = top + q, bed = hash((q + p.y * 16) >> 1, 77 + z) % 9;
      for (let x = l; x <= rr; x++) { const eL = x - l, eR = rr - x; let col = bed === 0 ? S[2] : bed === 1 ? S[4] : S[3]; if (eL <= 1) col = eL === 0 ? S[6] : S[5]; else if (eR <= 2) col = eR === 0 ? S[0] : eR === 1 ? S[1] : S[2]; if (q < 3) col = S[1]; R(gg, x, y, 1, 1, col); }
      R(gg, l - 1, y, 1, 1, S[0]); R(gg, rr + 1, y, 1, 1, S[0]); }
    /* GUANO: streaks running down from the slab, a white core with a grey side, a drip end; a cap on the corbel */
    R(gg, rowL[0] - 2, top - 5, rowR[0] - rowL[0] + 5, 1, GUANO[3]); R(gg, rowL[0], top - 4, rowR[0] - rowL[0] + 1, 1, GUANO[2]);
    const ns = 2 + (len > 60 ? 1 : 0); for (let k = 0; k < ns; k++) { const q0 = 2 + ((r() * 6) | 0), sx = rowL[q0] + 3 + ((r() * Math.max(1, rowR[q0] - rowL[q0] - 7)) | 0), ln = Math.min(len - 4, 12 + ((r() * Math.max(8, len * 0.55)) | 0)); for (let q = 0; q < ln; q++) { const row = q0 + q; if (sx < rowL[row] + 2 || sx > rowR[row] - 2) break; R(gg, sx, top + row, 1, 1, q % 6 === 5 ? GUANO[1] : GUANO[2]); R(gg, sx - 1, top + row, 1, 1, GUANO[0]); } }
    for (let k = 0; k < Math.max(1, (len / 70) | 0); k++) { const q = 10 + ((r() * Math.max(1, len - 24)) | 0), x = rowL[q] + 2 + ((r() * Math.max(1, rowR[q] - rowL[q] - 5)) | 0), L2 = PAL[z].lichen[k & 1]; R(gg, x, top + q, 2, 1, L2); R(gg, x, top + q + 1, 1, 1, mix(L2, '#20201c', 0.35)); }
    if (!free) { /* a ledge of rock stepping out, guano-capped; the talus foot of rubble */
      for (let q = 20 + (sdd & 7), i = 0; q < len - 24; q += 32 + ((r() * 16) | 0), i++) { const w = 5 + ((r() * 3) | 0), left = (i + sdd) & 1, bx = left ? rowL[q] - w + 1 : rowR[q] - 1; R(gg, bx, top + q, w, 4, S[left ? 3 : 2]); R(gg, bx, top + q, w, 1, S[5]); R(gg, bx, top + q + 3, w, 1, S[0]); R(gg, bx + 1, top + q - 1, w - 2, 1, GUANO[2]); }
      const by = top + len - 1; for (let k = 0; k < 6; k++) { const bw = 3 + ((r() * 4) | 0), bx = k < 3 ? rowL[len - 1] - 3 + k * 3 : rowR[len - 1] - 6 + (k - 3) * 3; R(gg, bx, by - 2 - (k % 2), bw, 3 + (k % 2), S[k % 2 ? 2 : 1]); R(gg, bx, by - 2 - (k % 2), bw, 1, S[5]); }
    }
    s = { c, top }; PIER.set(key, s); }
  g.drawImage(s.c, Math.round(p.x * 16 + 8 - 22 - cx), Math.round(p.y * 16 + 10 - s.top - cy));
}
/* every baked prop in one list, for tools/rookeryart-sheet.mjs (the contact sheet) and tools/rookeryart.mjs */
export const SPRITES = () => ({ floor: bakeFloor(36, 0), pillar: bakePillar(110, 1), fallen: bakeFallen(100, 1), nest: bakeNest(60, 1, true), nestPlain: bakeNest(60, 3, false), arm: bakeArm(40, 1), slab: bakeSlab(48, 0), roost: bakeRoost(1), eggs: bakeEggs(1, 1), eggs2: bakeEggs(3, 2) });

/* THE SUMMIT (claude/rookerypolish): the boss floor's cracked slabs, rubble and the snatcher's stones, in the Sisters' Crag rose stone (zone 4). Baked once; the glint ring is live.
   Same stone, lime wash and black fracture as the cracked floor / pillar above. */
export function bakeSummitSlab(w) { return bakeFloor(w, 4); }
/* the slab broken: a rim of tumbled blocks (lit tops, dark undersides, lime dust, one black crack) with the floor below showing */
export function bakeSummitRubble(w) {
  return once('sr' + w, () => {
    const [c, g] = canvas(w, 8), r = mulberry(w * 3 + 5), S = PAL[4].s; let x = 0, k = 0;
    while (x < w) { const bw = Math.min(w - x, 5 + ((r() * 4) | 0)), last = w - x <= bw, bh = 3 + ((k + (r() * 2)) % 3 | 0), y = 4 - bh + 1 + (k & 1);
      R(g, x, y + 1, bw, bh, S[3]); R(g, x, y, bw, 1, S[6]); R(g, x, y + 1, Math.max(1, bw >> 1), 1, S[5]); R(g, x + bw - 1, y + 1, 1, bh, S[1]); R(g, x + 1, y + bh, Math.max(1, bw - 1), 1, S[0]);
      if (r() < 0.5) R(g, x + 1, y + 1, Math.max(1, bw - 3), 1, LIME[1 + (k & 1)]); if (r() < 0.4) R(g, x + 1 + ((r() * Math.max(1, bw - 2)) | 0), y + 2, 1, bh - 1, CRACK);
      x += last ? w : bw - 1; k++; }
    R(g, 0, 6, w, 2, S[1]); for (let i = 0; i < 6; i++) R(g, (r() * (w - 3)) | 0, 5 + ((r() * 2) | 0), 2 + ((r() * 3) | 0), 1, LIME[1 + (i & 1)]);
    return c; });
}
/* a stone the Snatcher left: a 20x11 boulder, lit left, strata, guano cap, a black fracture */
export function bakeSummitStone() {
  return once('ss', () => {
    const [c, g] = canvas(20, 12), S = PAL[4].s;
    const prof = [4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4];   /* the top edge, cut away at the corners so it reads as a rounded rock */
    for (let x = 0; x < 20; x++) { const t = prof[x] + 1, h = 11 - t - (x < 2 || x > 17 ? 1 : 0); R(g, x, t, 1, h, x < 8 ? S[4] : x > 14 ? S[2] : S[3]); R(g, x, t, 1, 1, x < 12 ? S[6] : S[5]); R(g, x, t + h - 1, 1, 1, S[0]); }
    R(g, 2, 6, 15, 1, S[2]); R(g, 3, 7, 5, 1, S[5]); R(g, 11, 4, 6, 1, S[2]);   /* strata */
    R(g, 3, 0, 11, 2, GUANO[2]); R(g, 5, 0, 7, 1, GUANO[3]); R(g, 8, 2, 2, 3, GUANO[1]);   /* the guano cap and a drip */
    R(g, 11, 2, 1, 2, CRACK); R(g, 12, 4, 1, 2, CRACK); R(g, 11, 6, 1, 2, CRACK); R(g, 10, 8, 1, 2, CRACK); R(g, 12, 3, 2, 1, LIME[2]); R(g, 9, 7, 2, 1, LIME[2]);
    return c; });
}
/* (claude/sisters2) THE SISTERS' SIGNATURE MOVES' summit pieces, same rose stone / lime / guano / black fracture as the slabs:
   bakeSummitEcho - a floor tile the Shrieker's CRACKING ECHO split: a star fracture from a pale bruise, raw stone flaked up at its edges, lime dust blown out
   bakeBoulder    - the Snatcher's BOULDER (the BOULDER DROP): bigger than the stones she used to leave, strata, guano cap, a fracture, lit from the left
   bakeSummitLip  - the summit's crumbling LIP at each end (where the SHOCK SHRIEK shoves you): the edge stone split into loose blocks, fissures, pebbles about to go */
export function bakeSummitEcho(w) {
  return once('se' + w, () => {
    const [c, g] = canvas(w, 8), r = mulberry(w * 7 + 3), S = PAL[4].s, m = w >> 1;
    R(g, 0, 1, w, 7, S[4]); R(g, 0, 1, w, 1, S[6]); R(g, 0, 7, w, 1, S[1]);
    R(g, m - 4, 1, 9, 2, LIME[2]); R(g, m - 2, 1, 5, 1, LIME[3]); R(g, m - 3, 3, 7, 1, S[5]);   /* the bruise where the scream struck */
    for (const [dx, dy, l] of [[-1, 0, 6], [1, 0, 7], [-1, 1, 4], [1, 1, 5], [0, 1, 5]]) { let x = m, y = 1; for (let k = 0; k < l; k++) { x += dx * (1 + (r() < 0.4 ? 1 : 0)); y = Math.min(7, y + (dy || (r() < 0.35 ? 1 : 0))); if (x < 0 || x >= w) break; R(g, x, y, 1, 1, CRACK); } }
    for (const x of [1, w - 4]) { R(g, x, 0, 3, 2, S[5]); R(g, x, 0, 3, 1, S[6]); R(g, x + 1, 2, 2, 1, S[1]); }   /* raw flakes kicked up at the edges */
    for (let i = 0; i < 4; i++) R(g, (r() * (w - 2)) | 0, 2 + ((r() * 3) | 0), 1, 1, LIME[1 + (i & 1)]);
    return c; });
}
export function bakeBoulder() {
  return once('bd', () => {
    const [c, g] = canvas(26, 18), S = PAL[4].s;
    const prof = [7, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 3, 4, 5, 8];
    for (let x = 0; x < 26; x++) { const t = prof[x], h = 17 - t - (x < 2 || x > 23 ? 2 : 0); R(g, x, t, 1, h, x < 9 ? S[4] : x > 18 ? S[2] : S[3]); R(g, x, t, 1, 1, x < 14 ? S[6] : S[5]); R(g, x, t + h - 1, 1, 1, S[0]); R(g, x, t + h - 2, 1, 1, S[1]); }
    R(g, 3, 8, 19, 1, S[2]); R(g, 4, 9, 6, 1, S[5]); R(g, 14, 5, 8, 1, S[2]); R(g, 6, 12, 14, 1, S[2]);   /* strata */
    R(g, 5, 0, 13, 2, GUANO[2]); R(g, 7, 0, 8, 1, GUANO[3]); R(g, 10, 2, 2, 4, GUANO[1]); R(g, 15, 2, 1, 2, GUANO[1]);   /* the guano cap, two drips */
    for (const [x, y] of [[15, 3], [16, 5], [15, 7], [14, 9], [15, 11], [16, 13]]) R(g, x, y, 1, 2, CRACK); R(g, 16, 4, 2, 1, LIME[2]); R(g, 12, 10, 2, 1, LIME[2]);
    return c; });
}
export function bakeSummitLip(side) {
  return once('lp' + side, () => {
    const [c, g] = canvas(30, 14), r = mulberry(side > 0 ? 41 : 17), S = PAL[4].s;
    for (let x = 0; x < 30; x++) { const k = side > 0 ? x : 29 - x, drop = k > 22 ? (k - 22) : 0, t = 1 + drop + (k > 14 && r() < 0.3 ? 1 : 0);   /* the stone slumps toward the edge */
      R(g, x, t, 1, 13 - t, S[3 + (k < 10 ? 1 : 0)]); R(g, x, t, 1, 1, S[k < 18 ? 6 : 5]); }
    for (let i = 0; i < 4; i++) { const k = 6 + i * 6, x = side > 0 ? k : 29 - k; for (let y = 1; y < 12; y++) R(g, x + (y % 3 === 0 ? (side > 0 ? 1 : -1) : 0), y, 1, 1, CRACK); }   /* fissures: the lip is splitting off in blocks */
    for (let i = 0; i < 7; i++) { const k = 4 + ((r() * 24) | 0), x = side > 0 ? k : 29 - k; R(g, x, 0, 2, 1, i % 2 ? S[5] : GUANO[2]); }   /* loose pebbles on top */
    for (let i = 0; i < 3; i++) R(g, (r() * 28) | 0, 3 + ((r() * 6) | 0), 2, 1, LIME[2]);
    return c; });
}
/* (claude/rookery2art) a bone nest sitting ON a shelf whose top is at sy, w wide (the boss room's perch and shelves) */
export function drawNest(g, sx, sy, w, z) { g.drawImage(bakeNest(w, z, false), Math.round(sx - (w >> 1)), Math.round(sy - 9)); }

