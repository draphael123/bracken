/* src/forest-supports-art.js - the drawn supports of the forest and crag levels (see src/forest-supports.js). p = {x, y, bottom, kind, free}; tile coords. Drawn behind the tiles. */
import { drawRockPier } from './scree-rock.js';
import { drawPier as drawRkPier } from './redraw/rookery_world.js';
import { drawSpireSupport } from './spire-supports-art.js';
import { drawCrib } from './redraw/lumber_trail_tiles.js'; import { drawStalkSupport } from './redraw/sporewood2_world.js';   /* (claude/sporewood2art) SPOREWOOD 2's cap stalks */   /* (claude/lumbertrailart) THE LUMBER TRAIL's cribwork */
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const PAL = {
  rock: ['#4b4640', '#7d756b', '#2e2a27', '#5f7d3b'], vine: ['#6e5236', '#9a7a52', '#3e2c1c', '#d8bc78'], pile: ['#2f2a24', '#5d5446', '#1c1915', '#8a5f93'],
  crib: ['#6b4a2a', '#a67c4e', '#3d2816', '#c9a46a'], cloud: ['#b9c4dc', '#f0f5ff', '#8392b5', '#dfe8f8'], root: ['#4d3622', '#85633b', '#2e1f13', '#6a8f3a'], ice: ['#4fa9c4', '#d5f6ff', '#2a6f8f', '#8fe0ee'], rune: ['#2e2842', '#524a73', '#1a1626', '#b790ff'],
  stilt: ['#3a3026', '#6a5a44', '#211b15', '#5a8a4a'], reed: ['#5f7a3a', '#9ab85a', '#3d5226', '#c9b27c'],   /* (claude/marsh2) MARSH WOOD: bog-oak stilts, reed bundles */
};
export function drawForestSupport(g, p, cx, cy) {
  if (p.kind === 'beam' || p.kind === 'pier') { drawSpireSupport(g, p, cx, cy); return; }   /* THE MONASTERY's scaffold posts and masonry piers (claude/screefix, src/spire-supports.js) */
  if (p.kind === 'stalk') { drawStalkSupport(g, p, cx, cy); return; }   /* (claude/sporewood2art) a shelf fungus stands on a stalk of the wood, not a post */
  if (p.kind === 'crib') { drawCrib(g, p, cx, cy); return; }   /* THE LUMBER TRAIL's own cribs (claude/lumbertrailart, src/redraw/lumber_trail_tiles.js) */
  if (p.kind === 'rock' && p.rk) { drawRkPier(g, p, cx, cy); return; }   /* (claude/rookeryart) THE ROOKERY's piers: its own stone, guano streaked down them */
  if (p.kind === 'rock') { drawRockPier(g, p, cx, cy); return; }   /* THE SCREE PATH's own rock piers (claude/screefix, src/scree-rock.js) */
  const k = p.kind, c = PAL[k], h0 = Math.round(p.y * 16 + 10 - cy), bot = Math.round(p.bottom * 16 - cy), len = bot - h0;
  if (len < 3) return;
  const sd = (p.x * 7 + p.y * 13) & 7, w = k === 'rock' ? 8 : k === 'cloud' ? 8 : k === 'ice' ? 6 : k === 'rune' ? 6 : 5, x = Math.round(p.x * 16 + 8 - w / 2 - cx);
  const tip = p.free ? Math.min(len, 22) : 0, body = len - tip;   /* a free end tapers over its last rows */
  if (k !== 'reed') { R(g, c[0], x, h0, w, body); R(g, c[1], x, h0, 1, body); R(g, c[2], x + w - 1, h0, 1, body); }   /* (a reed bundle is its stems, drawn below) */
  /* the taper: a stalactite / a dangling root / a cloud's hem / a crystal point */
  for (let t = 0; t < tip; t += 2) { const f = 1 - t / tip, ww = Math.max(1, Math.round(w * f)), xx = x + ((w - ww) >> 1); R(g, c[0], xx, h0 + body + t, ww, 2); R(g, c[1], xx, h0 + body + t, 1, 2); }
  if (k === 'rock') {   /* strata and a corbel under the slab */
    R(g, c[2], x - 2, h0 - 3, w + 4, 3); R(g, c[1], x - 2, h0 - 3, w + 4, 1);
    for (let y = h0 + 6; y < h0 + body - 2; y += 9 + (sd & 3)) R(g, c[2], x, y, w, 1);
    if (sd & 1) R(g, c[3], x + 1, h0 + 4, 3, 2);
    if (!p.free) { R(g, c[0], x - 2, bot - 4, w + 4, 4); R(g, c[1], x - 2, bot - 4, w + 4, 1); }
  } else if (k === 'vine') {   /* THE HANGING VILLAGE's post (claude/hangingpolish, Daniel 10-25: the old vine-wrapped poles looked cheap): a carved post, its hemp lashings every few rows (a knot and a tail on each), a bracket under the board, a stone-footed sill - or, over open air, a hawser with a tassel */
    const hemp = '#d8bc78', hempD = '#a88848', hempL = '#f0dc9c';
    R(g, c[1], x - 2, h0 - 2, w + 4, 2); R(g, c[2], x - 2, h0, w + 4, 1);   /* the bracket the board rests on */
    R(g, c[1], x - 1, h0 + 1, 1, 4); R(g, c[2], x + w, h0 + 1, 1, 4); R(g, c[1], x - 2, h0 + 4, 1, 1); R(g, c[1], x + w + 1, h0 + 4, 1, 1);   /* its knees */
    for (let y = h0 + 12; y < h0 + body - 3; y += 19) {   /* a lashing: three turns of hemp, a knot, a tail */
      R(g, hemp, x - 1, y, w + 2, 2); R(g, hempL, x - 1, y, w + 2, 1); R(g, hempD, x - 1, y + 2, w + 2, 1);
      const side = ((y + sd) & 1) ? x + w + 1 : x - 2; R(g, hempD, side, y + 1, 1, 3); R(g, hemp, side, y + 3, 1, 1); }
    for (let y = h0 + 6; y < h0 + body - 2; y += 5) { R(g, c[2], x + 1 + (((y >> 2) + sd) & 1), y, 1, 3); if (y % 10 === 1) R(g, c[1], x + w - 2, y + 1, 1, 2); }   /* the adze marks of the carving */
    if (p.free) { for (let d = 0; d < 3; d++) { R(g, hempD, x + 1 + (d >> 1) * 2 - 0, h0 + body + d * 3, 1, 3); } R(g, hemp, x - 1, h0 + body + 9, w + 2, 2); R(g, hempL, x - 1, h0 + body + 9, w + 2, 1); for (let d = 0; d < w; d += 2) R(g, hempD, x + d, h0 + body + 11, 1, 3 + (d & 2)); }   /* a hawser end, whipped and left to hang in a tassel */
    else { R(g, c[2], x - 3, bot - 3, w + 6, 3); R(g, c[1], x - 3, bot - 4, w + 6, 1); R(g, '#6e6a60', x - 3, bot - 2, w + 6, 1); R(g, hemp, x - 1, bot - 7, w + 2, 2); }   /* the sill, the foot lashed to it */
  } else if (k === 'pile') {   /* bog-oak pile, heather at the board */
    R(g, c[1], x - 1, h0 - 2, w + 2, 2); R(g, c[3], x - 1, h0 - 4, 2, 2); R(g, c[3], x + w - 1, h0 - 4, 2, 2);
    for (let y = h0 + 5; y < h0 + body - 1; y += 8) R(g, c[2], x, y, w, 1);
    if (!p.free) { R(g, c[2], x - 2, bot - 3, w + 4, 3); R(g, c[3], x - 1, bot - 4, 2, 2); }
  } else if (k === 'stilt') {   /* (claude/marsh2) a bog-oak stilt lashed with reed cord, a green waterline (claude/marsh2art: a knee brace under the board, a pale cut head) */
    R(g, c[1], x - 1, h0 - 2, w + 2, 2); { const dir = (sd & 1) ? 1 : -1; for (let i = 0; i < 6; i++) R(g, c[1], x + (dir > 0 ? w : -2) + dir * (i >> 1) + (dir > 0 ? 0 : 0), h0 + i, 2, 1); } for (let y = h0 + 4; y < h0 + body - 2; y += 10) { R(g, c[3], x - 1, y, w + 2, 1); R(g, '#c9b27c', x, y + 1, w, 1); }
    if (!p.free) { R(g, c[2], x - 2, bot - 2, w + 4, 2); R(g, c[3], x - 1, bot - 5, w + 2, 1); }
  } else if (k === 'reed') {   /* (claude/marsh2) a bundle of reed stalks under a tuft */
    /* (claude/marsh3art) a bundle of reed STEMS, not a bamboo pole: six stalks of different tone and length side by side (olive, straw, green), a nick in one or two now and then,
       a rope wrap with a knot-tail and a pair of blades peeling off it every ~40 px, the head splaying under the tuft and the foot splaying into the mud */
    const top = h0 - 2, hh = body + 2, TONE = ['#5f7a3a', '#a2b050', '#7a8a3a', '#c4b878', '#8aa04a', '#4a5f2c'];
    for (let i = 0; i < 6; i++) { R(g, TONE[i], x - 1 + i, top, 1, hh); }   /* (every stem reaches the head: the support never thins at its top) */
    R(g, '#2c3a1a', x + 5, top + 2, 1, hh - 2); R(g, '#d8e090', x, top + 4, 1, 2);
    for (let y = top + 9 + sd, j = 0; y < bot - 6; y += 17, j++) R(g, '#2c3a1a', x - 1 + ((j * 5 + sd) % 6), y, 1, 2);
    for (let y = top + 14, i = 0; y < bot - 8; y += 38, i++) { const sd2 = (i + sd) & 1;
      R(g, '#8e7a52', x - 2, y, 8, 2); R(g, '#c9b27c', x - 2, y, 8, 1); R(g, '#8e7a52', sd2 ? x + 5 : x - 3, y + 2, 1, 3);
      R(g, TONE[2], sd2 ? x - 5 : x + 6, y - 2, 3, 1); R(g, TONE[4], sd2 ? x - 6 : x + 8, y - 3, 2, 1); R(g, TONE[0], sd2 ? x - 4 : x + 7, y - 1, 2, 1); }
    R(g, TONE[1], x - 2, top + 1, 1, 4); R(g, TONE[2], x + 6, top + 2, 1, 3);
    if (!p.free) { R(g, '#2a2218', x - 4, bot - 2, 13, 2); R(g, TONE[2], x - 3, bot - 6, 1, 5); R(g, TONE[0], x + 7, bot - 5, 1, 4); R(g, TONE[3], x - 2, bot - 4, 1, 2); R(g, '#3d5226', x - 2, bot - 3, 9, 1); }
  } else if (k === 'cloud') {   /* a cloud-stone pillar: banded drum, capital, a puff at the foot or hem */
    R(g, c[2], x - 2, h0 - 2, w + 4, 3); R(g, c[1], x - 2, h0 - 2, w + 4, 1);
    for (let y = h0 + 5; y < h0 + body; y += 8) { R(g, c[2], x, y, w, 1); R(g, c[1], x, y + 1, w, 1); }
    const by = p.free ? h0 + body + (tip >> 1) : bot - 3; R(g, c[3], x - 4, by, w + 8, 4); R(g, c[1], x - 2, by - 2, w + 4, 2); R(g, c[3], x - 6, by + 2, w + 12, 2);
  } else if (k === 'crib') {   /* (claude/lumbertrail) THE LUMBER TRAIL: a woodsman's squared timber post, axe-cut, a cross-brace, a log sill at its foot (the art lane redraws it) */
    R(g, c[1], x - 1, h0 - 2, w + 2, 2); R(g, c[3], x + 1, h0 - 1, 2, 1);
    for (let y = h0 + 6; y < h0 + body - 3; y += 12) { R(g, c[2], x - 2, y, w + 4, 1); R(g, c[1], x - 2, y - 1, w + 4, 1); }
    if (!p.free) { R(g, c[0], x - 3, bot - 3, w + 6, 3); R(g, c[1], x - 3, bot - 3, w + 6, 1); R(g, c[2], x - 3, bot - 1, w + 6, 1); }
  } else if (k === 'root') {   /* a gnarled root: side roots, a curl */
    R(g, c[1], x - 1, h0 - 2, w + 2, 2);
    for (let y = h0 + 4, i = 0; y < h0 + body - 3; y += 11, i++) { const Lf = (i + sd) & 1; R(g, c[0], Lf ? x - 3 : x + w, y, 3, 2); R(g, c[1], Lf ? x - 3 : x + w, y, 3, 1); R(g, c[2], Lf ? x - 4 : x + w + 2, y + 2, 2, 2); }
    if (!p.free) { R(g, c[0], x - 4, bot - 3, w + 8, 3); R(g, c[2], x - 4, bot - 1, w + 8, 1); R(g, c[3], x - 2, bot - 4, 2, 2); }
  } else if (k === 'ice') {   /* a glass pedestal: faceted, a bright edge, a flared foot */
    R(g, c[1], x + 1, h0, 1, body); R(g, c[3], x + 2, h0 + 4, 1, Math.max(0, body - 8)); R(g, c[2], x - 1, h0 - 2, w + 2, 3); R(g, c[1], x - 1, h0 - 2, w + 2, 1);
    if (!p.free) { R(g, c[0], x - 2, bot - 4, w + 4, 4); R(g, c[1], x - 2, bot - 4, w + 4, 1); }
  } else if (k === 'rune') {   /* a rune-stone pillar: a violet mark every few rows */
    R(g, c[1], x - 1, h0 - 2, w + 2, 2);
    for (let y = h0 + 5; y < h0 + body - 3; y += 14) { R(g, c[3], x + 2, y, 2, 4); R(g, c[3], x + 1, y + 1, 4, 1); }
    if (!p.free) { R(g, c[0], x - 2, bot - 4, w + 4, 4); R(g, c[1], x - 2, bot - 4, w + 4, 1); }
  }
}
