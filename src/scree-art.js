// scree-art.js - THE SCREE PATH's OWN STONE (claude/scree2; Daniel 10-08: "too many 'ice blocks'"). The foothills are OCHRE: the level's scree, its
// loose rock, its standing stones and its fold gates were baked in a cold blue-grey that read as ice at 320x180, and the Glass Quarry's seam (the cut
// Suncatcher's T.CRYST floor) WAS glass. This holds the quarry's dressing - the hill folk's STONE QUARRY now: stacks of cut blocks with the chisel's marks
// on them, a shear-legs derrick with a block on its rope, a half-cut face - and the warm palette every scree-only bake in art.js now uses.
import { canvas, px, rect, fillPoly, outline, mulberry } from './px.js';
const OUT = '#1b1626';
export const OCHRE = { deep: '#3e3024', dark: '#5a4632', mid: '#7a6046', light: '#a8865a', hi: '#c8a070', pale: '#d8b888', moss: '#7a8a3a' };
/* A STACK OF CUT BLOCKS: v 0 = three in a stair, 1 = two and one on top, 2 = a single long one on chocks. Chisel marks on every face, a drill line or two. */
export function bakeQuarryBlocks(v = 0) {
  const rnd = mulberry(900 + v), [c, g] = canvas(34, 26), O = OCHRE;
  const block = (x, y, w, h) => { rect(g, x, y, w, h, O.mid); rect(g, x, y, w, 2, O.hi); rect(g, x, y, 1, h, O.light); rect(g, x + w - 2, y + 2, 2, h - 2, O.dark); rect(g, x, y + h - 1, w, 1, O.deep);
    for (let i = 0; i < Math.floor(w * h / 18); i++) { const cx = x + 2 + ((rnd() * (w - 5)) | 0), cy = y + 3 + ((rnd() * (h - 5)) | 0); px(g, cx, cy, O.dark); px(g, cx + 1, cy + 1, O.dark); }   /* the chisel's marks: short diagonal bites */
    if (w > 10 && rnd() < 0.7) { const dx = x + 3 + ((rnd() * (w - 6)) | 0); for (let yy = y + 2; yy < y + h - 1; yy += 2) px(g, dx, yy, O.deep); } };   /* a line of drill holes where it was split */
  if (v % 3 === 0) { block(1, 14, 14, 11); block(15, 14, 14, 11); block(8, 4, 14, 10); }
  else if (v % 3 === 1) { block(2, 13, 16, 12); block(18, 15, 13, 10); block(6, 3, 14, 10); }
  else { rect(g, 4, 21, 4, 4, O.deep); rect(g, 24, 21, 4, 4, O.deep); block(1, 10, 32, 11); }
  return outline(c, OUT);
}
/* THE DERRICK: shear legs of two poles lashed at the top, a guy rope, a pulley and a cut block hanging on the fall - the quarrymen's crane */
export function bakeDerrick() {
  const [c, g] = canvas(40, 58), O = OCHRE, wood = '#6a4a2c', woodL = '#8a6640', rope = '#c9b27c';
  for (let i = 0; i < 52; i++) { const t = i / 52; rect(g, Math.round(6 + t * 12), 4 + i, 3, 1, i % 9 === 0 ? woodL : wood); rect(g, Math.round(32 - t * 12), 4 + i, 3, 1, i % 9 === 4 ? woodL : wood); }   /* the two legs, splayed */
  rect(g, 16, 2, 8, 4, '#4a3020'); rect(g, 17, 1, 6, 1, woodL);   /* the lashing at the head */
  for (let y = 6; y < 30; y++) px(g, 20, y, rope);                /* the fall */
  rect(g, 18, 6, 5, 3, '#3a3a3a'); px(g, 20, 7, '#8a8a8a');        /* the pulley block */
  rect(g, 13, 30, 14, 9, O.mid); rect(g, 13, 30, 14, 2, O.hi); rect(g, 25, 32, 2, 7, O.dark); rect(g, 13, 38, 14, 1, O.deep); px(g, 16, 34, O.dark); px(g, 17, 35, O.dark); px(g, 22, 33, O.dark); px(g, 23, 34, O.dark);   /* the block on it */
  for (let i = 0; i < 18; i++) px(g, 22 + i, 4 + Math.round(i * 2.8), rope);   /* the guy rope to its stake */
  rect(g, 4, 55, 8, 3, O.dark); rect(g, 28, 55, 8, 3, O.dark);     /* the legs' footing stones */
  return outline(c, OUT);
}
/* A HALF-CUT FACE: the back wall of the cut, worked in benches, the wedge slots of the next block showing - drawn behind (bg) */
export function bakeQuarryFace() {
  const rnd = mulberry(940), [c, g] = canvas(64, 40), O = OCHRE;
  fillPoly(g, [[0, 40], [0, 8], [14, 8], [14, 18], [34, 18], [34, 4], [52, 4], [52, 22], [64, 22], [64, 40]], O.dark);
  for (const [x0, y, w] of [[0, 8, 14], [14, 18, 20], [34, 4, 18], [52, 22, 12]]) { rect(g, x0, y, w, 2, O.light); rect(g, x0, y + 2, w, 1, O.mid); }   /* the benches' lips */
  for (let i = 0; i < 40; i++) { const x = (rnd() * 62) | 0, y = 10 + ((rnd() * 28) | 0); px(g, x, y, O.mid); px(g, x + 1, y + 1, O.deep); }   /* tool marks */
  for (const [x, y] of [[38, 10], [43, 10], [48, 10], [18, 24], [24, 24], [29, 24]]) rect(g, x, y, 2, 3, O.deep);   /* the wedge slots */
  return outline(c, OUT);
}

/* THE RAM'S PEN WALL (claude/scree2, Daniel 10-08): the fold's shut walls were the generic grey drystone and read icy; this is the same dry-stone course laid in the level's OCHRE
   (warm rubble, dark joints, a lit top edge, the odd moss tuft) - used for the Ram Lord's arena only (src/main.js setWall). Same 16x16 tile, three seeds. */
export function bakeOchreWall(seed = 0) {
  const rnd = mulberry(960 + seed), [c, g] = canvas(16, 16), O = OCHRE;
  rect(g, 0, 0, 16, 16, O.deep);
  const tones = [O.mid, O.light, O.dark, O.mid];
  for (let y = 0; y < 16; y += 4) {
    let x = (y / 4) % 2 ? 2 : 0;
    while (x < 16) {
      const w = 3 + ((rnd() * 4) | 0), t = tones[(rnd() * tones.length) | 0];
      rect(g, x, y, Math.min(w, 16 - x), 3, t);
      px(g, x, y, O.hi); if (w > 3 && rnd() < 0.5) px(g, x + 1, y, O.pale);
      if (rnd() < 0.08) px(g, x + 1, y + 2, O.moss);
      x += w + 1;
    }
  }
  return c;
}
