/* The browser half of the whole-game footing audit. It asks the live renderer to draw each declared structure twice at the
   same instant, once with its structure layer and once without it. The pixels that disappear are the support a player can
   actually see. A facade behind the deck is never accepted as the structure's ink. Keep this beside visible-supports.mjs so
   a change to the game's renderer cannot silently be replaced by a second, approximate drawing in the tool. */
import { LEVELS, T } from '../src/level.js';
import { drawRouteSupports } from '../src/route-art.js';
import { drawStructure as drawUnburiedStructure } from '../src/redraw/unburied_sets.js';

const KEYED = {
  unburied: [
    [248, 252, 21, 'inside the toppled tower: its timber frame, hoarding and hide wall stand round and under the deck, cross-braced to the ground'],
    [248, 250, 27, 'inside the toppled tower: same frame'],
    [259, 262, 21, 'the tower crest deck: two diagonal braces drawn down to the tower body'],
    [342, 346, 24, 'the standing siege tower: its own boarded frame and ladder, the deck is its top floor'],
    [354, 362, 24, 'the gatehouse gallery: a truss of struts under it into the wall'],
    [355, 355, 31, 'the gate arch, stone over the portcullis'], [357, 357, 31, 'the gate arch, stone over the portcullis'],
  ],
};
const keyed = (id, x0, x1, y) => (KEYED[id] || []).find(k => k[0] <= x0 && k[1] >= x1 && k[2] === y)?.[3];

function overhangs(L) {
  const { W, H, grid: g } = L, out = [];
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W;) {
    const t = g[y * W + x];
    if (t === T.AIR || t === T.NET || g[(y + 1) * W + x] !== T.AIR) { x++; continue; }
    let x1 = x;
    while (x1 + 1 < W && g[y * W + x1 + 1] !== T.AIR && g[y * W + x1 + 1] !== T.NET && g[(y + 1) * W + x1 + 1] === T.AIR) x1++;
    let air = 0; while (y + 1 + air < H && g[(y + 1 + air) * W + x] === T.AIR) air++;
    if (air >= 3) out.push({ x0: x, x1, row: y, air, tile: Object.keys(T).find(n => T[n] === t) || String(t) });
    x = x1 + 1;
  }
  return out;
}

/* A support is visible only if its foreground ink keeps at least three adjacent pixels on EVERY row and one unbroken
   eight-connected route from the deck to its foot. Its declared foot must also meet solid geometry. A two-pixel leg or a
   pretty shape in the far layer is not enough at the game's native 320 by 180 view. */
function inspect(mask, w, h, grounded) {
  if (!grounded) return 'its declared foot does not meet solid geometry';
  const on = (x, y) => mask[y * w + x];
  for (let y = 0; y < h; y++) {
    let run = 0, best = 0;
    for (let x = 0; x < w; x++) { run = on(x, y) ? run + 1 : 0; best = Math.max(best, run); }
    if (best < 3) return 'its drawn body thins to ' + best + ' px at row ' + y + ' of ' + h;
  }
  const seen = new Uint8Array(w * h), todo = [];
  for (let x = 0; x < w; x++) if (on(x, 0)) { seen[x] = 1; todo.push(x); }
  while (todo.length) {
    const j = todo.pop(), x = j % w, y = (j / w) | 0;
    if (y === h - 1) return null;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const k = yy * w + xx; if (!seen[k] && on(xx, yy)) { seen[k] = 1; todo.push(k); }
    }
  }
  return 'no unbroken foreground path from deck to foot';
}

function groundedRock(L) {
  const { W, H, grid: g } = L, yes = new Uint8Array(W * H), todo = [], rock = t => t === T.SOLID || t === T.PALISADE || t === T.ICE || t === T.CRYST;
  const add = k => { if (!yes[k] && rock(g[k])) { yes[k] = 1; todo.push(k); } };
  for (let x = 0; x < W; x++) add((H - 1) * W + x);
  for (let y = 0; y < H; y++) { add(y * W); add(y * W + W - 1); }
  while (todo.length) { const k = todo.pop(), x = k % W, y = (k / W) | 0;
    if (x) add(k - 1); if (x + 1 < W) add(k + 1); if (y) add(k - W); if (y + 1 < H) add(k + W); }
  return yes;
}

function rockInk(s, L, connected) {
  /* A short stone lip keyed into a whole wall reads as a corbel. A long gallery does not acquire a visible support
     merely because its last tile touches a wall: it still needs posts or braces under its span. */
  if (s.row + 3 >= L.H || s.x1 - s.x0 > 2) return null;
  const S = BK.tileSpr(), { W, grid: g } = L, rock = t => t === T.SOLID || t === T.PALISADE || t === T.ICE || t === T.CRYST;
  for (const x of [s.x0 - 1, s.x1 + 1]) {
    if (x < 0 || x >= W) continue;
    const k = (s.row + 1) * W + x;
    if (!connected[k] || !rock(g[k]) || !rock(g[k + W]) || !rock(g[k + 2 * W])) continue;
    const mask = new Uint8Array(16 * 48);
    for (let dy = 0; dy < 3; dy++) { const c = S[k + dy * W]; if (!c || c.width < 16 || c.height < 16) break;
      const d = c.getContext('2d').getImageData(0, 0, 16, 16).data;
      for (let j = 0; j < 256; j++) mask[dy * 256 + j] = +(d[j * 4 + 3] > 128); }
    if (!inspect(mask, 16, 48, true)) return 'visible grounded rock wall at ' + x;
  }
  return null;
}

function routeInk(p, L) {
  if (p.free) return 'its visible foot tapers free in the air';
  const w = 32, h = Math.max(1, (p.bottom - p.y) * 16), c = document.createElement('canvas'); c.width = w; c.height = h;
  drawRouteSupports(c.getContext('2d'), { routeSupports: [p] }, p.x * 16 - 8, p.y * 16);
  const d = c.getContext('2d').getImageData(0, 0, w, h).data, mask = new Uint8Array(w * h);
  for (let j = 0; j < mask.length; j++) mask[j] = +(d[j * 4 + 3] > 128);
  let top = 0; while (top < Math.min(16, h) && !mask.subarray(top * w, (top + 1) * w).some(Boolean)) top++;
  if (top >= Math.min(16, h)) return 'its drawn post never reaches the deck';
  const row = Math.min(L.H - 1, p.bottom), grounded = p.bottom >= L.H || L.grid[row * L.W + p.x] !== T.AIR;
  return inspect(mask.subarray(top * w), w, h - top, grounded);
}

function unburiedInk(z, L) {
  const w = (z.x1 - z.x0 + 1) * 16, h = (z.floor - z.top) * 16, c = document.createElement('canvas');
  if (w <= 0 || h <= 0) return 'empty support box';
  c.width = w; c.height = h; drawUnburiedStructure(c.getContext('2d'), z.kind, 0, w, 0, h, z.x0);
  const d = c.getContext('2d').getImageData(0, 0, w, h).data, mask = new Uint8Array(w * h);
  for (let j = 0; j < mask.length; j++) mask[j] = +(d[j * 4 + 3] > 128);
  /* The original Unburied check was drawn on a transparent sheet by this exact function. Keep its reading of the
     siege and ruin kits; a black wash on the live frame must not make a sound pier disappear from the audit. */
  return inspect(mask, w, h, true);
}

function structureInk(z, L) {
  const left = z.x0 * 16, top = z.top * 16, w = (z.x1 - z.x0 + 1) * 16, h = (z.floor - z.top) * 16;
  if (w <= 0 || h <= 0 || w * h > 800000) return 'structure box too large to verify';
  const mask = new Uint8Array(w * h), vw = BK.view.VW, vh = BK.view.VH;
  const was = BK.hide.structures; BK.hideHero = true;
  try {
    /* Stitch the structure box from native-size frames. The overlap keeps every edge row in view even when a support is
       taller than the screen; each pair is rendered at the same camera and game time. */
    for (let yy = top; yy < top + h; yy += Math.max(16, vh - 32)) for (let xx = left; xx < left + w; xx += Math.max(16, vw - 32)) {
      const tx = Math.floor((xx + Math.min(w, vw) / 2) / 16), ty = Math.floor((yy + Math.min(h, vh) / 2) / 16);
      BK.hide.structures = false; const v = BK.look(tx, ty);
      const a = BK.view.buf.getContext('2d').getImageData(0, 0, vw, vh).data.slice();
      BK.hide.structures = true; BK.look(tx, ty);
      const b = BK.view.buf.getContext('2d').getImageData(0, 0, vw, vh).data;
      const x0 = Math.max(left, v.cx, xx), x1 = Math.min(left + w, v.cx + vw, xx + vw);
      const y0 = Math.max(top, v.cy, yy), y1 = Math.min(top + h, v.cy + vh, yy + vh);
      for (let py = y0; py < y1; py++) for (let px = x0; px < x1; px++) {
        const i = ((py - v.cy) * vw + px - v.cx) * 4;
        if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) >= 3) mask[(py - top) * w + px - left] = 1;
      }
    }
  } finally { BK.hide.structures = was; BK.hideHero = false; }
  const groundY = Math.min(L.H - 1, z.floor), grounded = z.floor >= L.H || Array.from({ length: z.x1 - z.x0 + 1 }, (_, i) => z.x0 + i).some(x => L.grid[groundY * L.W + x] !== T.AIR);
  return inspect(mask, w, h, grounded);
}

export function sweep(id) {
  const index = LEVELS.findIndex(l => l.id === id);
  if (index < 0) return { id, error: 'no such level' };
  BK.load(index); BK.start(); BK.god = true; BK.sim(60);   /* let the start fade clear before comparing two foreground frames */
  const L = BK.L, spans = overhangs(L), cache = new Map(), connected = groundedRock(L), findings = [], accepted = [];
  for (const s of spans) {
    const reason = keyed(id, s.x0, s.x1, s.row);
    if (reason) { accepted.push({ ...s, reason: 'KEYED: ' + reason }); continue; }
    const wall = rockInk(s, L, connected);
    if (wall) { accepted.push({ ...s, reason: wall }); continue; }
    const zs = (L.structures || []).filter(z => (s.tile === 'SOLID' || s.tile === 'PALISADE' ? z.x0 <= s.x0 && z.x1 >= s.x1 : z.x1 >= s.x0 && z.x0 <= s.x1) && z.top <= s.row + 3 && z.floor > s.row + 1);
    const ps = (L.routeSupports || []).filter(p => p.x >= s.x0 - 1 && p.x <= s.x1 + 1 && p.y >= s.row - 1 && p.y <= s.row + 1 && p.bottom > s.row + 3);
    const results = [...zs.map(z => { if (!cache.has(z)) cache.set(z, z.kind === 'timber' ? null : z.kind.startsWith('ub') ? unburiedInk(z, L) : structureInk(z, L)); return { kind: z.kind, reason: cache.get(z) }; }),
      ...ps.map(p => { if (!cache.has(p)) cache.set(p, routeInk(p, L)); return { kind: 'route ' + (p.kind || 'post'), reason: cache.get(p) }; })];
    const visible = results.find(r => !r.reason);
    if (visible) accepted.push({ ...s, reason: 'visible ' + visible.kind + ' from deck to ground' });
    else findings.push({ ...s, reason: results.length ? results.map(r => r.kind + ': ' + r.reason).join('; ') : 'no declared foreground structure beneath the overhang' });
  }
  return { id, total: spans.length, accepted: accepted.length, findings, keyed: accepted.filter(a => a.reason.startsWith('KEYED:')).length };
}
