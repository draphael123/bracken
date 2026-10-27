// rookery_anchor_art.js - THE ROOKERY'S STRUCTURE, DRAWN (claude/rookery2art; brief scratch/brief-rookery2-1027.md A3, Daniel 10-27: "stone ledges and pillars that end in mid-air, a lantern gibbet
// on nothing"). Every roost, gale perch and hung nest's arm hangs on SOMETHING (src/rookery-anchors.js says what); this draws it, in the crag's own stone (rookery_pal.js) so it reads as part
// of the cliff and not a prop:
//   SPIRE     a hoodoo of wind-scoured rock rising from the footing - strata, a lit west face and a dark east one, guano streaked down from the nest, cracks, a lichen patch, its foot
//             spread into scree - with the nest LASHED to its neck: sinew wraps over a stone shoulder, bone toggles, a rope tail hanging
//   BRACKET   a CORBEL: a stepped stone brace growing out of the crag face under the nest (three courses, a diagonal buttress into the wall), pegged, lashed, guano dripping off its lip
//   CHAIN     chains from the overhang above: a staple of iron and bone set in the rock, links of dark iron (lit on one side), two chains meeting a hide-wrapped ring at the nest's rim
//   CAP       (the walkable-top cap is in rookery_tiles.js)
// drawAnchor(g, q, cx, cy, TS, time, z)   q: { what, x, y, a: { kind, ... } } as src/rookery-anchors.js gives it.   Baked and memoised: a spire is one drawImage.
import { canvas, rect as R, mulberry } from '../px.js';
import { PAL, GUANO, BONE, TWIG, IRON, hash } from './rookery_pal.js';
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const px = (g, x, y, c) => R(g, x, y, 1, 1, c);
const SINEW = ['#5a4a32', '#8a7650', '#b8a47a', '#d8c8a0'];

/* a SPIRE: h tall (from the nest knob's foot down to the footing), canvas 40 wide, its axis at x = 20. The top is the neck (half-width 6), widening to the foot (half-width 13 + scree) */
function bakeSpire(h, z, seed) {
  return once('sp' + h + '_' + z + '_' + seed, () => {
    const W = 40, [c, g] = canvas(W, h + 8), r = mulberry(seed * 7 + h + z * 3), S = PAL[z].s, cxm = 20;
    const half = y => { const t = y / Math.max(1, h), base = 6 + 7 * Math.pow(t, 1.55), wob = Math.sin(y * 0.31 + seed) * 1.1 + Math.sin(y * 0.11 + seed * 2) * 1.6; return Math.max(5, Math.round(base + wob + (y > h - 5 ? (y - (h - 5)) * 1.6 : 0))); };
    for (let y = 0; y < h + 6; y++) {
      const hw = half(Math.min(y, h)), x0 = cxm - hw, x1 = cxm + hw, bed = hash(y >> 1, seed + 5 + z) % 9, tone = bed === 0 ? -1 : bed === 1 ? 1 : 0;
      for (let x = x0; x < x1; x++) {
        const u = (x - x0) / (hw * 2);   /* 0 west .. 1 east: lit on the west, dark on the east */
        let k = u < 0.18 ? 5 : u < 0.4 ? 4 : u < 0.68 ? 3 : u < 0.88 ? 2 : 1;
        k = Math.max(0, Math.min(6, k + tone)); const j = hash(x, y + seed) % 23; if (j === 0) k = Math.max(0, k - 1); else if (j === 1) k = Math.min(6, k + 1);
        px(g, x, y, S[k]);
      }
      px(g, x0, y, S[6]); px(g, x1 - 1, y, S[0]);   /* the rim light and the dark edge */
    }
    for (let q = 0; q < Math.floor(h / 22); q++) { const y = 16 + q * 22 + ((r() * 8) | 0), hw = half(y); R(g, cxm - hw + 1, y, hw * 2 - 2, 1, S[1]); R(g, cxm - hw + 2, y + 1, hw * 2 - 5, 1, S[5]); }   /* strata: a dark bed line and a lit one under it */
    /* guano streaks from the nest down the west-centre face, a white core and a grey side, long drips */
    for (const [dx, len] of [[-3, Math.min(h - 6, 26 + ((r() * 18) | 0))], [2, Math.min(h - 6, 14 + ((r() * 18) | 0))], [-7, Math.min(h - 6, 10 + ((r() * 10) | 0))]]) { for (let y = 6; y < 6 + len; y++) { px(g, cxm + dx, y, y % 6 === 5 ? GUANO[1] : GUANO[2]); px(g, cxm + dx + 1, y, GUANO[1]); if (y % 4 === 0) px(g, cxm + dx - 1, y, GUANO[0]); } px(g, cxm + dx, 6 + len, GUANO[1]); }
    /* a black crack, a lichen patch */
    { let x = cxm + 2 + ((r() * 4) | 0), y = 24 + ((r() * Math.max(1, h * 0.3)) | 0); for (let i = 0; i < 12 && y < h - 6; i++) { px(g, x, y, S[0]); y++; if (i % 3 === 1) x += r() < 0.5 ? -1 : 1; } }
    { const L = PAL[z].lichen, lx = cxm - 6 + ((r() * 4) | 0), ly = 12 + ((r() * Math.max(1, h * 0.4)) | 0); R(g, lx, ly, 3, 2, L[0]); px(g, lx + 3, ly, L[1]); px(g, lx + 1, ly - 1, L[1]); }
    /* the foot: scree and a white splash of guano where it meets the ledge */
    for (let k = 0; k < 9; k++) { const x = 4 + ((r() * 32) | 0), y = h + ((r() * 4) | 0); R(g, x, y, 2 + ((r() * 3) | 0), 2, r() < 0.5 ? S[3] : S[4]); px(g, x, y, S[5]); }
    return c; });
}
/* the LASHING at a nest's neck: sinew wrapped in a diagonal band over the stone, a bone toggle through each side, a rope tail hanging with a knot */
function lashing(g, x, y, hw, seed) {
  const r = mulberry(seed);
  for (let b = 0; b < 3; b++) { const yy = y + b * 3; for (let xx = -hw; xx < hw; xx++) px(g, x + xx, yy + ((xx + b) & 1), SINEW[(xx + b) & 1 ? 1 : 2]); R(g, x - hw, yy, hw * 2, 1, SINEW[0]); for (let xx = -hw; xx < hw; xx += 3) px(g, x + xx, yy, SINEW[3]); }
  for (const s of [-1, 1]) { R(g, x + s * (hw - 1) - (s > 0 ? 0 : 3), y + 1, 4, 2, BONE[2]); px(g, x + s * (hw - 1) - (s > 0 ? 0 : 3), y + 1, BONE[3]); px(g, x + s * (hw + 1) - (s > 0 ? 0 : 1), y + 2, BONE[1]); }
  const tx = x + ((r() * 5) | 0) - 2; for (let i = 0; i < 9; i++) px(g, tx + (i > 5 ? 1 : 0), y + 8 + i, i % 2 ? SINEW[1] : SINEW[2]); R(g, tx - 1, y + 17, 3, 2, SINEW[0]);
}
/* a CORBEL (bracket): span px out from the face on side s (the wall is at x = wallX), seat at y; three stepped courses and a buttress. Local origin: the wall's face at (0, 0), growing toward +x */
function bakeCorbel(span, z, seed) {
  return once('cb' + span + '_' + z + '_' + seed, () => {
    const W = span + 4, Hh = Math.min(40, 14 + Math.round(span * 0.5)), [c, g] = canvas(W, Hh), r = mulberry(seed + span), S = PAL[z].s;
    const bh = Math.min(Hh - 3, 8 + Math.round(span * 0.55));
    for (let x = 0; x < span; x++) { const t = x / span, hh = Math.max(4, Math.round(bh * (1 - t * 0.82))); for (let y = 0; y < hh; y++) { const k = y < 2 ? 5 : y > hh - 3 ? 1 : 3 + ((x + y) % 5 === 0 ? 1 : 0); px(g, x, y + 4, S[Math.max(0, Math.min(6, k))]); } }   /* the buttress: a wedge, tall at the wall, thin at the tip */
    for (let k = 0; k < 3; k++) { const x0 = Math.round(span * (0.25 + k * 0.25)); R(g, x0, 4, 1, Math.max(2, Math.round(bh * (1 - (x0 / span) * 0.82))), S[1]); }   /* the courses' joints */
    R(g, 0, 1, span + 2, 3, S[4]); R(g, 0, 1, span + 2, 1, S[6]); R(g, 0, 3, span + 2, 1, S[1]); R(g, 2, 0, span - 2, 1, GUANO[3]); R(g, 4, 1, span - 8 > 0 ? span - 8 : 2, 1, GUANO[2]);   /* the seat slab, capped with guano */
    R(g, span + 1, 1, 2, 3, S[3]); px(g, span + 2, 1, S[5]);
    for (let k = 0; k < 3; k++) { const x = 3 + ((r() * Math.max(1, span - 6)) | 0); for (let y = 4; y < 8 + ((r() * 5) | 0); y++) px(g, x, y, y % 2 ? GUANO[1] : GUANO[2]); }   /* guano dripping off the lip */
    for (const x of [Math.round(span * 0.3), Math.round(span * 0.65)]) { R(g, x, 4, 3, 2, BONE[2]); px(g, x, 4, BONE[3]); px(g, x + 3, 5, BONE[1]); }   /* the bone pegs the lashings hold on */
    return c; });
}
/* a CHAIN hanging dy px: alternate end-on and side-on links, dark iron lit on the west edge */
function chain(g, x, y0, dy, seed) {
  for (let y = 0; y < dy; y += 3) { const side = ((y / 3) | 0) % 2 === 0; if (side) { R(g, x - 1, y0 + y, 3, 3, IRON[1]); R(g, x, y0 + y + 1, 1, 1, '#000'); px(g, x - 1, y0 + y, IRON[3]); px(g, x + 1, y0 + y + 2, IRON[0]); } else { R(g, x, y0 + y, 1, 3, IRON[2]); px(g, x, y0 + y, IRON[3]); } }
}
function staple(g, x, y, z) {
  const S = PAL[z].s; R(g, x - 4, y - 1, 9, 4, IRON[1]); R(g, x - 4, y - 1, 9, 1, IRON[3]); R(g, x - 4, y + 2, 9, 1, IRON[0]); px(g, x - 3, y, IRON[0]); px(g, x + 3, y, IRON[0]); R(g, x - 1, y + 3, 3, 2, IRON[2]); px(g, x, y + 5, IRON[1]);   /* the plate, rivets, the eye */
  R(g, x - 6, y - 2, 2, 1, S[5]); R(g, x + 5, y - 2, 2, 1, S[1]); R(g, x - 1, y + 4, 3, 1, BONE[2]);   /* chipped rock round it, a bone washer */
}

export function drawAnchor(g, q, cx, cy, TS, time, z) {
  const a = q.a; if (!a || a.kind === 'stand') return;
  const x = Math.round(q.x * TS + 8 - cx), y = Math.round((q.y + 1) * TS - cy), seed = (q.x * 31 + q.y * 17) & 255;
  if (a.kind === 'spire') {
    const arm = q.what === 'arm', fy = Math.round(a.foot * TS - cy), top = arm ? Math.round(q.y * TS - cy) + 6 : y + 7, h = Math.max(12, fy - top);   /* (an ARM's spire rises right to the arm's root: the arm grows OUT of it, it does not float beside it) */
    const sp = bakeSpire(h, z, seed); g.drawImage(sp, x - 20, top);
    lashing(g, x, top + (arm ? 5 : 1), 8, seed);
    if (arm) { const S = PAL[z].s; R(g, x - 10, top - 1, 20, 4, S[4]); R(g, x - 10, top - 1, 20, 1, S[6]); R(g, x - 10, top + 2, 20, 1, S[1]); R(g, x - 7, top - 2, 9, 1, GUANO[3]); px(g, x + 6, top + 3, GUANO[1]); }   /* the capital the arm springs from */
  } else if (a.kind === 'bracket') {
    const side = a.side, wx = Math.round((side > 0 ? a.wall * TS : (a.wall + 1) * TS) - cx), span = Math.max(8, Math.abs(x - wx) + 12), cb = bakeCorbel(span, z, seed);
    g.save(); g.translate(wx, y + 6); if (side > 0) g.scale(-1, 1); g.drawImage(cb, 0, 0); g.restore();
    const nx = x; lashing(g, nx, y + 7, 9, seed);
  } else if (a.kind === 'chain') {
    const ty = Math.round((a.top + 1) * TS - cy);
    for (const dx of [-12, 12]) { staple(g, x + dx, ty, z); chain(g, x + dx + (dx < 0 ? 0 : 0), ty + 5, Math.max(6, y + 5 - ty - 5), seed); }
    for (const dx of [-12, 12]) { R(g, x + dx - 2, y + 2, 5, 3, SINEW[1]); R(g, x + dx - 2, y + 2, 5, 1, SINEW[3]); R(g, x + dx - 1, y + 5, 3, 2, BONE[2]); }   /* the hide-wrapped rings at the nest's rim */
  }
}
export const SPRITES = () => ({ spire: bakeSpire(80, 1, 3), corbel: bakeCorbel(36, 1, 5), spireStair: bakeSpire(60, 3, 9) });
