// src/redraw/hornets_nest_map.js - THE HORNET'S NEST on the WORLD MAP (claude/hornets2art): the landmark beside its node, like the Queen over the Lumber Trail and the frog by the marsh -
// a little great pine with its grey paper nest hung from a bough. drawMapPortrait (src/main.js) shrinks it by a WHOLE factor with the block-vote downsample, outlines it and draws it 1:1.
//   bakeMapNest(canvas, flipX) -> { R: [frame], L: [frame], ax, ay, w, h }   one frame, 40 x 44, the foot at the bottom centre
const INK = '#1a140e';
const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const NEEDLE = ['#243a1c', '#3a5a2a', '#5a8a3a', '#8ab858'], BARK = ['#2a1c12', '#4a3220', '#6e4c30'], PAPER = ['#5a5040', '#8a7e68', '#b8ac92', '#d8ceb4'];
export function bakeMapNest(canvas, flipX) {
  const W = 40, H = 44, [c, g] = canvas(W, H); g.imageSmoothingEnabled = false;
  /* the trunk, a little flared */
  for (let y = 14; y < H; y++) { const w = 4 + (y > H - 6 ? (y - (H - 6)) : 0); px(g, BARK[1], 18 - w / 2, y, w, 1); px(g, BARK[2], 18 - w / 2, y, 1, 1); px(g, BARK[0], 18 + w / 2 - 1, y, 1, 1); }
  /* the crown: four drooping tiers, widest at the bottom, lit from the top-left */
  for (const [y, hw] of [[2, 5], [9, 8], [16, 11], [23, 14]]) for (let i = -hw; i <= hw; i++) { const dy = Math.round(Math.abs(i) * 0.5), x = 18 + i;
    px(g, NEEDLE[i < -hw / 3 ? 3 : i > hw / 2 ? 0 : 2], x, y + dy, 1, 4); px(g, NEEDLE[3], x, y + dy, 1, 1); if (Math.abs(i) > hw - 3) px(g, NEEDLE[1], x, y + dy + 3, 1, 3); }
  /* the nest: an egg of grey paper tiers hung by a stalk from the right-hand bough, a dark mouth at its foot */
  { const nx = 30, ny = 31, rx = 5, ry = 7; px(g, BARK[1], nx, 24, 1, ny - ry - 24 + 1);
    for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) { const d = x * x / (rx * rx) + y * y / (ry * ry); if (d > 1) continue; const tier = Math.floor((y + ry) / 3), edge = (y + ry) % 3 === 2;
      px(g, edge ? PAPER[0] : x < -1 ? PAPER[3] : tier % 2 ? PAPER[2] : PAPER[1], nx + x, ny + y); }
    px(g, INK, nx - 1, ny + ry - 1, 3, 2); px(g, INK, nx, ny + ry - 2, 1, 1); }
  /* two specks about it */
  px(g, INK, 35, 38); px(g, '#e8b030', 35, 37); px(g, INK, 26, 27); px(g, '#e8b030', 26, 26);
  const L = flipX(c);
  return { R: [c], L: [L], ax: 18, ay: H - 1, w: W, h: H };
}
