/* src/forest-supports-art.js - the drawn supports of the forest and crag levels (see src/forest-supports.js). p = {x, y, bottom, kind, free}; tile coords. Drawn behind the tiles. */
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const PAL = {
  rock: ['#4b4640', '#7d756b', '#2e2a27', '#5f7d3b'], vine: ['#44331f', '#7a5c36', '#2c2214', '#3e8040'], pile: ['#2f2a24', '#5d5446', '#1c1915', '#8a5f93'],
  cloud: ['#b9c4dc', '#f0f5ff', '#8392b5', '#dfe8f8'], root: ['#4d3622', '#85633b', '#2e1f13', '#6a8f3a'], ice: ['#4fa9c4', '#d5f6ff', '#2a6f8f', '#8fe0ee'], rune: ['#2e2842', '#524a73', '#1a1626', '#b790ff'],
};
export function drawForestSupport(g, p, cx, cy) {
  const k = p.kind, c = PAL[k], h0 = Math.round(p.y * 16 + 10 - cy), bot = Math.round(p.bottom * 16 - cy), len = bot - h0;
  if (len < 3) return;
  const sd = (p.x * 7 + p.y * 13) & 7, w = k === 'rock' ? 8 : k === 'cloud' ? 8 : k === 'ice' ? 6 : k === 'rune' ? 6 : 5, x = Math.round(p.x * 16 + 8 - w / 2 - cx);
  const tip = p.free ? Math.min(len, 22) : 0, body = len - tip;   /* a free end tapers over its last rows */
  R(g, c[0], x, h0, w, body); R(g, c[1], x, h0, 1, body); R(g, c[2], x + w - 1, h0, 1, body);
  /* the taper: a stalactite / a dangling root / a cloud's hem / a crystal point */
  for (let t = 0; t < tip; t += 2) { const f = 1 - t / tip, ww = Math.max(1, Math.round(w * f)), xx = x + ((w - ww) >> 1); R(g, c[0], xx, h0 + body + t, ww, 2); R(g, c[1], xx, h0 + body + t, 1, 2); }
  if (k === 'rock') {   /* strata and a corbel under the slab */
    R(g, c[2], x - 2, h0 - 3, w + 4, 3); R(g, c[1], x - 2, h0 - 3, w + 4, 1);
    for (let y = h0 + 6; y < h0 + body - 2; y += 9 + (sd & 3)) R(g, c[2], x, y, w, 1);
    if (sd & 1) R(g, c[3], x + 1, h0 + 4, 3, 2);
    if (!p.free) { R(g, c[0], x - 2, bot - 4, w + 4, 4); R(g, c[1], x - 2, bot - 4, w + 4, 1); }
  } else if (k === 'vine') {   /* a bough wrapped in vine, leaf tufts */
    R(g, c[1], x - 1, h0 - 2, w + 2, 2);
    for (let y = h0 + 3; y < h0 + body; y += 7) { R(g, c[3], x - 1 + ((y >> 2) & 1), y, w + 1, 2); if (((y + sd) & 3) === 0) R(g, '#79b552', x + w, y - 1, 2, 2); }
    if (p.free) for (let d = 0; d < 3; d++) { R(g, c[3], x + d * 2 - 1, h0 + body, 1, tip + 4 - d * 3); R(g, '#79b552', x + d * 2 - 1, h0 + body + tip + 3 - d * 3, 2, 2); }
    else { R(g, c[2], x - 3, bot - 3, w + 6, 3); R(g, c[3], x - 2, bot - 4, 3, 2); R(g, c[3], x + w - 1, bot - 4, 3, 2); }
  } else if (k === 'pile') {   /* bog-oak pile, heather at the board */
    R(g, c[1], x - 1, h0 - 2, w + 2, 2); R(g, c[3], x - 1, h0 - 4, 2, 2); R(g, c[3], x + w - 1, h0 - 4, 2, 2);
    for (let y = h0 + 5; y < h0 + body - 1; y += 8) R(g, c[2], x, y, w, 1);
    if (!p.free) { R(g, c[2], x - 2, bot - 3, w + 4, 3); R(g, c[3], x - 1, bot - 4, 2, 2); }
  } else if (k === 'cloud') {   /* a cloud-stone pillar: banded drum, capital, a puff at the foot or hem */
    R(g, c[2], x - 2, h0 - 2, w + 4, 3); R(g, c[1], x - 2, h0 - 2, w + 4, 1);
    for (let y = h0 + 5; y < h0 + body; y += 8) { R(g, c[2], x, y, w, 1); R(g, c[1], x, y + 1, w, 1); }
    const by = p.free ? h0 + body + (tip >> 1) : bot - 3; R(g, c[3], x - 4, by, w + 8, 4); R(g, c[1], x - 2, by - 2, w + 4, 2); R(g, c[3], x - 6, by + 2, w + 12, 2);
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
