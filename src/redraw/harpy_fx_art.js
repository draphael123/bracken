// src/redraw/harpy_fx_art.js - THE HARPY PASS's EFFECTS ART (claude/harpyart): the sisters' hatching EGG and the GUST HARPY's wind. DRAWING ONLY; plain fillRect pixels (renders in Node: tools/harpy-art.mjs).
//   drawEgg(g, ex, ey, k, time)   a speckled cream egg (k 0..1 = how near the hatch): rocks harder, a crack zig-zags across and glows, shell flakes jump, then a yellow beak and a wet down-feathered
//                                 head push through the top; the yellow ! over it (hurry)
//   drawGustTell(g, x, y, dir, len, k, time)   the told lane: a faint streak line and chevrons feeding into her wings, brightening as k -> 1
//   drawGustBlast(g, x, y, dir, h, life, turned, time)   the blast: a tall CRESCENT of pale wind built from stacked pixel columns (white core, blue-grey body, a trailing ghost), grit and torn feathers in it;
//                                                         green-gold when it has been turned back
const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
export function drawEgg(g, ex, ey, k, time) {
  ex = Math.round(ex); ey = Math.round(ey);
  const rows = [[2, 3], [1, 5], [0, 7], [0, 7], [0, 7], [0, 7], [1, 5], [2, 3]];   // an egg: a narrow top, a full belly
  rows.forEach(([o, w], i) => { const y = ey - 9 + i; R(g, ex - 3 + o, y, w, 1, '#f4ecd8'); if (w > 2) { R(g, ex - 3 + o, y, 1, 1, '#ffffff'); R(g, ex - 3 + o + w - 1, y, 1, 1, '#c8b898'); } });
  R(g, ex - 2, ey - 1, 5, 1, '#d8ccb0'); for (const [dx, dy] of [[-1, -6], [2, -4], [-2, -3], [1, -7]]) R(g, ex + dx, ey + dy, 1, 1, '#a88c68');   // the speckles
  if (k > 0.3) { const pts = [[-3, -5], [-2, -5], [-2, -4], [-1, -4], [-1, -3], [0, -3], [0, -4], [1, -4], [1, -5], [2, -5]]; const n = Math.min(pts.length, Math.round(pts.length * (k - 0.2) / 0.8));
    for (let i = 0; i < n; i++) { R(g, ex + pts[i][0], ey + pts[i][1], 1, 1, '#2a2018'); if (k > 0.75 && i % 3 === 0) R(g, ex + pts[i][0], ey + pts[i][1] + 1, 1, 1, '#ffd36b'); } }
  if (k > 0.8) { const out = Math.min(1, (k - 0.8) / 0.2); R(g, ex - 2, ey - 10 - Math.round(out * 2), 5, 3, '#ffe9a0'); R(g, ex - 1, ey - 10 - Math.round(out * 2), 3, 1, '#fff6c8'); R(g, ex + 2, ey - 9 - Math.round(out * 2), 3, 2, '#f0b830'); R(g, ex, ey - 10 - Math.round(out * 2), 1, 1, '#2a2018'); }   // the chick's head and beak
  if (k > 0.5) for (let i = 0; i < 3; i++) { const ph = (time * 3 + i * 0.37) % 1; g.globalAlpha = 1 - ph; R(g, ex - 4 + i * 4 + Math.sin(i * 3 + time * 20), ey - 6 - ph * 10, 1, 1, '#f4ecd8'); g.globalAlpha = 1; }   // shell flakes jumping
  if (Math.floor(time * 6) % 2) { R(g, ex, ey - 22, 2, 5, '#ffd36b'); R(g, ex, ey - 16, 2, 2, '#ffd36b'); R(g, ex - 1, ey - 23, 4, 1, '#8a5a1a'); }
}
export function drawGustTell(g, x, y, dir, len, k, time) {
  x = Math.round(x); y = Math.round(y);
  g.globalAlpha = 0.2 + 0.5 * k; for (let s = 12; s < len; s += 9) R(g, x + dir * s, y, 5, 1, '#e8f0ff');
  for (let i = 0; i < 4; i++) { const s = (time * 80 + i * len / 4) % len, q = Math.round(x + dir * s); for (let j = 0; j < 4; j++) { R(g, q - j * dir, y - j, 1, 1, j < 2 ? '#ffffff' : '#c8d4ff'); R(g, q - j * dir, y + j, 1, 1, j < 2 ? '#ffffff' : '#c8d4ff'); } }
  g.globalAlpha = 1;
}
export function drawGustBlast(g, x, y, dir, h, life, turned, time) {
  x = Math.round(x); y = Math.round(y); const a = Math.min(1, life / 0.3), half = Math.round(h / 2);
  const cols = turned ? ['#f4ffd0', '#b8f08a', '#6aa84a'] : ['#ffffff', '#d4e4f4', '#8a9cc0'];
  for (let layer = 0; layer < 3; layer++) {   // three nested crescents, each a little further back
    g.globalAlpha = a * (0.95 - layer * 0.28);
    for (let dy = -half + layer * 3; dy <= half - layer * 3; dy += 1) { const f = dy / (half - layer * 1.5), lead = Math.round((1 - f * f) * 7), tx = x - dir * (layer * 5 + 2) + dir * lead - dir * 7;
      R(g, tx - (dir > 0 ? 1 : 0), y + dy, 2 + (layer === 0 ? 1 : 0), 1, cols[layer]); } }
  g.globalAlpha = a * 0.55; for (let i = 0; i < 6; i++) { const yy = y - half + 3 + ((i * 7 + Math.floor(time * 30)) % Math.max(6, h - 6)); R(g, x - dir * (8 + (i * 5) % 14), yy, 2, 1, '#c8c4d0'); }   // grit
  g.globalAlpha = a; const fy = y - half + 6 + ((Math.floor(time * 12)) % Math.max(4, h - 12)); R(g, x - dir * 12, fy, 3, 1, '#e6e4ec'); R(g, x - dir * 13, fy + 1, 2, 1, '#9aaac4');   // a torn feather
  g.globalAlpha = 1;
}
