// src/map-pixel.js - THE WORLD MAP AT ONE PIXEL SCALE (claude/mapscale, art-direction fix 3; docs/style-guide "Pixel scale").
// The map is drawn on the 320x180 buffer, shown at 4x: ONE map pixel is one buffer pixel, and everything on it - the hero token, the
// store's hut, the landmark critters, the node discs, the clouds, the labels - is built from whole pixels of that size. This file holds the
// pure helpers that keep it so: hard-edged discs and rings (no ctx.arc, which anti-aliases), an ordered 2x2 dither mask, an
// integer block-vote downsample (no fractional drawImage scale on a pixel sprite), and the blurb fitter for the info card.
// No game state in here; main.js passes the context in. tools/map-spacing.mjs and tools/map-scale.mjs call the pure parts.

/* the half-width of a filled disc of radius r at row dy (pixel centres: a disc of radius 2 is 5 wide) */
const hw = (r, dy) => Math.floor(Math.sqrt(Math.max(0, (r + 0.5) * (r + 0.5) - dy * dy)));
/* A FILLED DISC of whole pixels centred on pixel (cx, cy) */
export function discRows(r) { const out = []; for (let dy = -r; dy <= r; dy++) { const w = hw(r, dy); out.push([dy, -w, w]); } return out; }
export function fillDisc(g, cx, cy, r, col, checker = false) {
  if (col) g.fillStyle = col; cx = Math.round(cx); cy = Math.round(cy);
  for (const [dy, a, b] of discRows(r)) {
    if (!checker) { g.fillRect(cx + a, cy + dy, b - a + 1, 1); continue; }
    for (let x = a; x <= b; x++) if (((cx + x + cy + dy) & 1) === 0) g.fillRect(cx + x, cy + dy, 1, 1);   /* ordered 2x2: every other pixel, phase locked to the map so it never shimmers */
  }
}
/* A RING one pixel thick, whole pixels; dashed = alternate arcs of two pixels (a spur's rim, the grammar the road uses for its stub) */
export function ringPixels(r, dashed = false) {
  const pts = [];
  for (let dy = -r; dy <= r; dy++) {
    const o = hw(r, dy), inn = Math.abs(dy) <= r - 1 ? hw(r - 1, dy) : -1;
    for (let x = -o; x <= o; x++) { if (inn >= 0 && Math.abs(x) <= inn) continue;
      if (dashed && (Math.floor((Math.atan2(dy, x) + Math.PI) * r / 2) & 1)) continue; pts.push([x, dy]); }
  }
  return pts;
}
const RINGS = new Map();
export function strokeRing(g, cx, cy, r, col, dashed = false) {
  const k = r + (dashed ? 'd' : ''); let pts = RINGS.get(k); if (!pts) RINGS.set(k, pts = ringPixels(r, dashed));
  g.fillStyle = col; cx = Math.round(cx); cy = Math.round(cy); for (const [x, y] of pts) g.fillRect(cx + x, cy + y, 1, 1);
}

/* THE BLOCK-VOTE DOWNSAMPLE: a pixel sprite drawn smaller by a WHOLE factor k - each k x k block becomes the colour most of it has
   (transparent unless half the block is lit), so the result is the same hard pixel art at a smaller size, not a smeared bilinear copy and
   not a 0.75 drawImage scale. `grey` dims and mutes the colours (a cleared place goes quiet without going see-through). */
export function blockVote(src, k, { grey = false, outline = null } = {}) {
  if (k <= 1 && !grey) return src;
  const w = Math.ceil(src.width / k), h = Math.ceil(src.height / k), s = src.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, src.width, src.height).data;
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), o = x.createImageData(w, h);
  for (let by = 0; by < h; by++) for (let bx = 0; bx < w; bx++) {
    const votes = new Map(); let n = 0, lit = 0;
    for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) { const sx = bx * k + i, sy = by * k + j; if (sx >= src.width || sy >= src.height) continue; n++;
      const p = (sy * src.width + sx) * 4; if (s[p + 3] < 128) continue; lit++; const key = (s[p] << 16) | (s[p + 1] << 8) | s[p + 2]; votes.set(key, (votes.get(key) || 0) + 1); }
    if (lit * 2 < n || !lit) continue;
    let best = 0, bv = -1; for (const [key, v] of votes) if (v > bv) { bv = v; best = key; }
    let r = best >> 16, gg = (best >> 8) & 255, b = best & 255;
    if (grey) { const l = r * 0.3 + gg * 0.59 + b * 0.11; r = Math.round((r * 0.7 + l * 0.3) * 0.6); gg = Math.round((gg * 0.7 + l * 0.3) * 0.6); b = Math.round((b * 0.7 + l * 0.3) * 0.62); }   /* (a cleared place's critter is dimmed, not greyed out and not see-through) */
    const q = (by * w + bx) * 4; o.data[q] = r; o.data[q + 1] = gg; o.data[q + 2] = b; o.data[q + 3] = 255;
  }
  x.putImageData(o, 0, 0);
  if (!outline) return c;
  /* one pixel of ink round it (the vote eats the source's own outline when it halves it) */
  const out = document.createElement('canvas'); out.width = w + 2; out.height = h + 2; const y = out.getContext('2d'); y.imageSmoothingEnabled = false;
  const solid = (i, j) => i >= 0 && j >= 0 && i < w && j < h && o.data[(j * w + i) * 4 + 3] > 0;
  y.fillStyle = outline;
  for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) if (!solid(i, j) && (solid(i - 1, j) || solid(i + 1, j) || solid(i, j - 1) || solid(i, j + 1))) y.fillRect(i + 1, j + 1, 1, 1);
  y.drawImage(c, 1, 1); return out;
}

/* THE BLURB ON THE INFO CARD: one whole line that fits. A blurb that is too long for its line is cut back to the last whole word that leaves a finished
   phrase (never mid-word, never on a trailing comma or 'and'/'the'...). `widthOf` measures in the face the card is drawn in. Better than cutting: a level
   carries a shorter `MAP_BLURB[id]` (src/map-blurbs.js) that says it whole, and tools/map-scale.mjs fails if any blurb still does not fit. */
const DANGLE = /^(a|an|the|and|of|to|in|on|at|for|from|up|out|into|by|with|as|is|are|that|where|his|her|its|their)$/i;
export function fitBlurb(sub, maxW, widthOf) {
  sub = String(sub || '').trim(); if (widthOf(sub) <= maxW) return sub;
  const words = sub.split(/s+/);
  for (let n = words.length - 1; n >= 1; n--) { if (DANGLE.test(words[n - 1])) continue; const t = words.slice(0, n).join(' ').replace(/[,;:-]+$/, ''); if (widthOf(t) <= maxW) return t; }
  return words[0];
}
