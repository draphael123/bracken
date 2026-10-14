// src/hero-silhouette.js - A LOCKED HERO'S BLACK SILHOUETTE (claude/heroroster, Daniel 10-12): baked from the hero's REAL idle frame, so it is his
// outline - solid black inside, a faint cool rim one pixel out so it reads on the dark pick screen. Cached per frame (a WeakMap).
// factory(w, h) -> a canvas; it is injected so the check can bake one without a page.
const cache = new WeakMap();
export function silhouetteOf(frame, make = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }) {
  if (!frame || !frame.width) return frame;
  let s = cache.get(frame); if (s) return s;
  const w = frame.width, h = frame.height, pad = 1, mask = make(w, h), mg = mask.getContext('2d');
  mg.drawImage(frame, 0, 0); mg.globalCompositeOperation = 'source-in'; mg.fillStyle = '#000'; mg.fillRect(0, 0, w, h);   /* the hero's own alpha, solid black */
  s = make(w + pad * 2, h + pad * 2); const g = s.getContext('2d');
  /* the rim: the same outline pushed one pixel each way, tinted, under the black (only the outer ring shows) */
  const rim = make(w, h), rg = rim.getContext('2d'); rg.drawImage(mask, 0, 0); rg.globalCompositeOperation = 'source-in'; rg.fillStyle = 'rgba(150,140,190,0.55)'; rg.fillRect(0, 0, w, h);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) g.drawImage(rim, pad + dx, pad + dy);
  g.drawImage(mask, pad, pad);
  cache.set(frame, s); return s;
}
