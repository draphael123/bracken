// src/redraw/buried_city_fix_art.js - THE BURIED CITY 4 FIXES' ART (claude/bc4fix, 2026-10-15; scratch/brief-buriedcity4fix-1015.md). Daniel played BC4 live:
//   THE GEAR          the CLOCKWORK VAULT's quest item drew as the fallback blue mushroom: a real brass gear now - a toothed ring, a hub hole, four spokes, lit from the
//                     top-left, turning slowly (8 frames over one tooth) - and the same gear on the HUD's GEARS n/5 counter
//   THE COIN CACHE    the purse an elite's gate keeps: a heap of old gold coin spilling out of a toppled sandstone casket bound in brass, glints on the heap
//   THE GLASS'S LINK  what a struck hourglass moves: a trail of gold grains runs from the glass to each thing it governs (a dotted arc, its head a bright clot of sand),
//                     the dotted arc stays faint while the glass runs, gold brackets pulse round each thing it moves; idle and in reach, a ghost of the same arc shows
//                     what it is tied to before you strike
//   THE SAND LAYERS   the Hourglass King's throne room filling a layer at a time in his second phase: the band of loose sand heaving up, grains leaping off its lip
// Every function draws world pixels through a view V = { g, cx, cy, vw, vh, time } (the city's convention); the fixed pieces are baked once.
const R = Math.round;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const dot = (g, x, y, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), 1, 1); };
const OUT = [27, 22, 38];   /* the city's outline ink (#1b1626) */
const BRASS = { dd: '#3a2606', d: '#6e4c14', m: '#a8782a', b: '#d4a440', l: '#f0cc68', h: '#fff2b0' };
const GOLD = { d: '#8a5a10', m: '#c88a1c', b: '#f0b830', l: '#ffd860', h: '#fff4b8' };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
/* a 1-px dark outline round everything drawn (the sprites' rule) */
function outline(c) { const g = c.getContext('2d'), w = c.width, h = c.height, img = g.getImageData(0, 0, w, h), d = img.data, src = new Uint8ClampedArray(d);
  const on = (x, y) => x >= 0 && y >= 0 && x < w && y < h && src[(y * w + x) * 4 + 3] > 40;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (src[i + 3] > 40) continue; if (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1)) { d[i] = OUT[0]; d[i + 1] = OUT[1]; d[i + 2] = OUT[2]; d[i + 3] = 255; } }
  g.putImageData(img, 0, 0); return c; }

/* ============================================================ THE GEAR (the quest item, and its HUD icon) */
export const GEAR_FRAMES = 8;
/* size: the canvas (the drawn gear is size-2 across, the outline round it); f: its turn, 0..GEAR_FRAMES-1 over one tooth's pitch */
export function gearIcon(size, f = 0) {
  return once('gear' + size + ':' + f, () => { const [c, g] = mk(size, size);
    const cx = (size - 1) / 2, cy = cx, ro = (size - 2) / 2, rb = ro * 0.72, rh = Math.max(1.1, ro * 0.24), groove = ro * 0.5, teeth = 8, pitch = Math.PI * 2 / teeth, ph = (f % GEAR_FRAMES) / GEAR_FRAMES * pitch;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx), u = (((a - ph) % pitch) + pitch) % pitch / pitch, tooth = u > 0.18 && u < 0.68;
      if (r > ro + 0.15 || (r > rb && !tooth) || r < rh) continue;
      const lit = r < 0.01 ? 0 : (-dx - dy) / (r * Math.SQRT2);   /* the light from the top-left */
      let col;
      if (r > rb) col = lit > 0.35 ? BRASS.l : lit > -0.25 ? BRASS.b : BRASS.m;                                             /* a tooth */
      else if (r < rh + 0.9) col = BRASS.dd;                                                                                   /* the hub hole's rim */
      else if (Math.abs(r - groove) < 0.55 && size > 11) col = BRASS.d;                                                       /* the groove between the hub and the ring */
      else if (r > rb - 0.9) col = lit > 0.1 ? BRASS.h : BRASS.d;                                                              /* the ring's lit / shaded edge */
      else col = lit > 0.45 ? BRASS.l : lit > 0 ? BRASS.b : lit > -0.45 ? BRASS.m : BRASS.d;
      dot(g, x, y, col); }
    /* four spokes' windows in the web (a big enough gear): dark slots between hub and ring, turning with the teeth */
    if (size >= 12) for (let k = 0; k < 4; k++) { const a = ph * 2 + Math.PI / 4 + k * Math.PI / 2, rr = (rh + rb) / 2; dot(g, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, BRASS.dd); }
    dot(g, cx - ro * 0.35, cy - ro * 0.5, BRASS.h);   /* the shine */
    return outline(c); });
}
/* the gear in the world: big (doubled by the caller) and turning slowly; a glint runs over it every few seconds */
export const gearFrame = (time, seed = 0) => gearIcon(12, Math.floor(time * 3 + seed) % GEAR_FRAMES);
export function gearGlint(g, x, y, time, seed = 0) {   /* x, y: screen px of the gear's top-left shine */
  const p = (time * 0.45 + seed * 0.13) % 1; if (p > 0.12) return; const k = 1 - Math.abs(p / 0.06 - 1), s = R(1 + k * 3);
  g.fillStyle = '#fffbe0'; g.fillRect(R(x) - s, R(y), s * 2 + 1, 1); g.fillRect(R(x), R(y) - s, 1, s * 2 + 1); g.fillStyle = '#ffffff'; g.fillRect(R(x), R(y), 1, 1);
}

/* ============================================================ THE COIN CACHE (an elite's purse, behind his gate) */
function cacheSpr() {
  return once('cache', () => { const W = 44, H = 26, [c, g] = mk(W, H);
    /* the casket, toppled on its side behind the heap: sandstone, brass bands and corners, its lid fallen open */
    rc(g, 22, 6, 18, 14, '#b08858'); rc(g, 22, 6, 18, 2, '#d8b07a'); rc(g, 22, 18, 18, 2, '#6a4a2a'); for (let y = 9; y < 18; y += 3) rc(g, 23, y, 16, 1, '#9a7448');
    for (const x of [24, 31, 37]) { rc(g, x, 6, 2, 14, BRASS.b); rc(g, x, 6, 1, 14, BRASS.l); dot(g, x, 8, BRASS.h); dot(g, x, 16, BRASS.d); }
    rc(g, 21, 5, 3, 3, BRASS.m); rc(g, 38, 5, 3, 3, BRASS.m); rc(g, 21, 18, 3, 3, BRASS.m); rc(g, 38, 18, 3, 3, BRASS.m);
    rc(g, 26, 9, 10, 9, '#2a180c'); rc(g, 26, 9, 10, 1, '#4a2c16');   /* its open mouth */
    rc(g, 29, 12, 3, 3, BRASS.d); dot(g, 30, 13, '#1a0e04');   /* a lock plate, burst */
    for (let i = 0; i < 9; i++) { const x = 27 + (hash(i, 3) % 8), y = 14 + (hash(i, 7) % 4); dot(g, x, y, i % 2 ? GOLD.b : GOLD.l); }   /* coin glinting inside */
    rc(g, 34, 1, 9, 3, '#c8a06a'); rc(g, 34, 1, 9, 1, '#e8c890'); rc(g, 36, 1, 1, 3, BRASS.b); rc(g, 41, 1, 1, 3, BRASS.b); rc(g, 33, 3, 2, 3, '#8a6a40');   /* the lid, propped */
    /* THE HEAP: coins stacked and spilled, each a little ellipse on its face or its edge, lit from the top-left */
    const coin = (x, y, edge) => { if (edge) { rc(g, x, y, 2, 4, GOLD.m); dot(g, x, y, GOLD.l); dot(g, x + 1, y + 3, GOLD.d); return; }
      rc(g, x - 2, y, 5, 2, GOLD.b); rc(g, x - 1, y - 1, 3, 1, GOLD.l); rc(g, x - 2, y + 2, 5, 1, GOLD.d); dot(g, x - 1, y, GOLD.h); dot(g, x + 2, y + 1, GOLD.m); };
    const rows = [[25, 15, 3], [22, 13, 4], [19, 10, 5], [16, 7, 6], [13, 4, 5]];   /* [y, half-width, step] of the heap's courses, bottom up */
    for (const [y, hw] of rows) for (let x = 14 - hw; x <= 14 + hw; x += 3) coin(x + (hash(x, y) % 2), y - 2 + (hash(y, x) % 2), false);
    for (let i = 0; i < 6; i++) coin(2 + i * 6 + (hash(i, 1) % 3), 23 + (hash(i, 2) % 2), hash(i, 5) % 3 === 0);   /* the spill along the floor */
    coin(14, 6, true); coin(30, 21, true);
    rc(g, 6, 24, 34, 2, 'rgba(40,24,8,0.5)');   /* its shadow on the floor */
    return outline(c); });
}
/* x: the heap's centre (world px), floorY: the floor it stands on; open: the gate is up (the heap's glints run brighter) */
export function drawCoinCache(V, x, floorY, open) {
  const g = V.g, t = V.time, s = cacheSpr(), l = R(x - 14 - V.cx), top = R(floorY - s.height - V.cy) + 1; if (l > V.vw + 40 || l + s.width < -40) return;
  const gl = g.createRadialGradient(l + 14, top + 14, 2, l + 14, top + 14, 30); gl.addColorStop(0, 'rgba(255,200,80,' + (open ? 0.32 : 0.2) + ')'); gl.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = gl; g.fillRect(l - 16, top - 16, 60, 56);
  g.drawImage(s, l, top);
  for (let i = 0; i < 4; i++) { const p = (t * (open ? 0.9 : 0.5) + i * 0.27) % 1; if (p > 0.18) continue; const k = 1 - Math.abs(p / 0.09 - 1), gx = l + 4 + (hash(i, 11) % 22), gy = top + 6 + (hash(i, 13) % 16), n = R(1 + k * 2);
    g.fillStyle = '#fffbe0'; g.fillRect(gx - n, gy, n * 2 + 1, 1); g.fillRect(gx, gy - n, 1, n * 2 + 1); }
}

/* ============================================================ THE GLASS'S LINK: what a struck hourglass moves */
/* the arc from (x0,y0) to (x1,y1) (world px), lifted over the middle: a quadratic bezier's point at u */
const arcAt = (x0, y0, x1, y1, u) => { const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 8 - Math.abs(x1 - x0) * 0.12, a = 1 - u; return [a * a * x0 + 2 * a * u * mx + u * u * x1, a * a * y0 + 2 * a * u * my + u * u * y1]; };
/* k: how far the trail has run (0..1, the head's place); a: the dotted arc's strength behind it (0..1); ghost: the idle preview (pale, slower) */
export function drawGlassLink(V, x0, y0, x1, y1, k, a, ghost) {
  const g = V.g, t = V.time, len = Math.hypot(x1 - x0, y1 - y0) + 40, n = Math.max(6, R(len / 7));
  for (let i = 0; i <= n; i++) { const u = i / n; if (u > k) break; if (ghost && i % 2) continue; const crawl = ((u * n - t * (ghost ? 3 : 9)) % 4 + 4) % 4, hot = crawl < 1;   /* a pulse of light runs along it, glass to target */
    const [x, y] = arcAt(x0, y0, x1, y1, u), X = R(x - V.cx), Y = R(y - V.cy), s = ghost ? 1 : 2;
    g.globalAlpha = a * (ghost ? 0.35 : 0.6); g.fillStyle = '#1e1008'; g.fillRect(X - 1, Y - 1, s + 2, s + 2);   /* a dark rim, so it reads over the sand and the stone */
    g.globalAlpha = a * (ghost ? 0.55 : hot ? 1 : 0.75); g.fillStyle = ghost ? '#f0dca0' : hot ? '#fff6d0' : '#ffc850'; g.fillRect(X, Y, s, s); }
  g.globalAlpha = 1;
  if (k < 1 && !ghost) { const [hx, hy] = arcAt(x0, y0, x1, y1, k);   /* the head: a clot of bright grains tumbling along it */
    for (let j = 0; j < 7; j++) { const ox = Math.sin(t * 23 + j * 1.7) * 3, oy = Math.cos(t * 19 + j * 2.3) * 3; g.fillStyle = j % 3 ? '#ffe9a0' : '#ffffff'; g.fillRect(R(hx - V.cx + ox), R(hy - V.cy + oy), 2, 2); }
    const gl = g.createRadialGradient(hx - V.cx, hy - V.cy, 1, hx - V.cx, hy - V.cy, 12); gl.addColorStop(0, 'rgba(255,220,120,0.6)'); gl.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = gl; g.fillRect(R(hx - V.cx - 12), R(hy - V.cy - 12), 24, 24); }
}
/* gold brackets round a thing a glass moves (world rect), pulsing; a: strength */
export function drawLinkTarget(V, l, t0, w, h, a, ghost) {
  const g = V.g, t = V.time, p = ghost ? 0 : 1 + Math.sin(t * 8), x = R(l - V.cx - 2 - p), y = R(t0 - V.cy - 2 - p), W = R(w + 4 + p * 2), H = R(h + 4 + p * 2), L = Math.min(6, R(W / 3));
  g.globalAlpha = a * (ghost ? 0.45 : 0.9); g.fillStyle = ghost ? '#f0dca0' : '#ffd36b';
  for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + W - 1, y, -1, 1], [x, y + H - 1, 1, -1], [x + W - 1, y + H - 1, -1, -1]]) { g.fillRect(sx > 0 ? cx : cx - L + 1, cy, L, 1); g.fillRect(cx, sy > 0 ? cy : cy - L + 1, 1, L); }
  g.globalAlpha = 1;
}
/* the glass in reach and idle: a gold star on its crown (the STRIKE glint) */
export function drawStrikeGlint(V, x, y) {
  const g = V.g, t = V.time, k = 0.5 + 0.5 * Math.sin(t * 6), s = R(2 + k * 2), X = R(x - V.cx), Y = R(y - V.cy);
  g.fillStyle = 'rgba(255,236,160,' + (0.5 + 0.5 * k).toFixed(2) + ')'; g.fillRect(X - s, Y, s * 2 + 1, 1); g.fillRect(X, Y - s, 1, s * 2 + 1); g.fillStyle = '#ffffff'; g.fillRect(X, Y, 1, 1);
  const gl = g.createRadialGradient(X, Y, 1, X, Y, 9); gl.addColorStop(0, 'rgba(255,230,140,' + (0.35 * k).toFixed(2) + ')'); gl.addColorStop(1, 'rgba(255,230,140,0)'); g.fillStyle = gl; g.fillRect(X - 9, Y - 9, 18, 18);
}

/* ============================================================ THE SAND LAYERS (the Hourglass King's second phase) */
/* the room's sand heaving up a layer: x0..x1 (world px), y the new surface (world px), k 0..1 how far the heave has come (1 = settled) */
export function drawSandRise(V, x0, x1, y, k) {
  const g = V.g, t = V.time, l = R(x0 - V.cx), w = R(x1 - x0), Y = R(y - V.cy); if (w <= 0) return;
  if (k < 1) { const e = k * k * (3 - 2 * k), h = R(16 * (1 - e));   /* the loose band still rising into its row */
    g.fillStyle = 'rgba(236,206,140,' + (0.55 * (1 - e)).toFixed(2) + ')'; g.fillRect(l, Y, w, 16);
    g.fillStyle = 'rgba(255,240,190,0.8)'; g.fillRect(l, Y + h, w, 1);
    for (let i = 0; i < w / 6; i++) { const ph = (t * 1.8 + i * 0.37) % 1, gx = l + ((i * 37) % w), gy = Y + h - ph * 14; g.fillStyle = i % 3 ? '#ecd092' : '#fff4cc'; g.fillRect(R(gx), R(gy), 1, 2); } }
  /* the lip of the sand while it stands: a lit edge and a slow shimmer of grains running on it */
  g.fillStyle = 'rgba(255,236,176,0.55)'; g.fillRect(l, Y, w, 1);
  for (let i = 0; i < w / 9; i++) { const gx = l + (((i * 41) + t * 14) % w); g.fillStyle = 'rgba(255,248,214,0.7)'; g.fillRect(R(gx), Y - 1, 2, 1); }
}
/* the sand going out (phase three): the layers run down through the floor - a dark seep and falling grains at its lip */
export function drawSandDrain(V, x0, x1, y, k) {
  const g = V.g, t = V.time, l = R(x0 - V.cx), w = R(x1 - x0), Y = R(y - V.cy); if (w <= 0 || k >= 1) return;
  g.fillStyle = 'rgba(90,60,30,' + (0.35 * (1 - k)).toFixed(2) + ')'; g.fillRect(l, Y, w, 3);
  for (let i = 0; i < w / 8; i++) { const ph = (t * 2.2 + i * 0.29) % 1, gx = l + ((i * 53) % w); g.fillStyle = '#c49a5c'; g.fillRect(R(gx), R(Y + ph * 12), 1, 2); }
}
