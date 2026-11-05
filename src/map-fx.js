// src/map-fx.js - THE MAP'S WEATHER, TRAVELLERS AND FOG (claude/mappolish, Daniel 11-05). Cheap pixel-art life over the world map, all drawn in the map's own camera
// (world coordinates, g is already translated by -camY). Everything is a pure function of the clock: no state, no allocation per frame, so a pause cannot desync it.
// reduced (SET.reduceMotion): no weather, no travellers, nothing turns; fog and banners still show, still. weather === false (SET.weather): no weather.
export const regionOf = y => y < 180 ? 'desert' : y < 360 ? 'inland' : y < 540 ? 'coast' : y < 720 ? 'crags' : 'wood';
const hash = i => { let t = Math.imul(i + 1, 0x9E3779B1); t = Math.imul(t ^ (t >>> 15), 0x85EBCA6B); t ^= t >>> 13; return (t >>> 0) / 4294967296; };
const LEAF = ['#6fa83c', '#c98a2e', '#a8552a', '#8fd160'];

/* WEATHER: 44 motes through the camera's view; each takes the kind of the region it is over (leaves / snow / sand / foam). */
export function drawWeather(g, o) {
  if (o.reduced || o.weather === false) return;
  const { time, camY, VW, VH } = o;
  for (let i = 0; i < 44; i++) {
    const r1 = hash(i), r2 = hash(i + 100), r3 = hash(i + 200);
    const wy = camY + ((r1 * VH + time * (8 + r3 * 6)) % VH), reg = regionOf(wy);
    const y = Math.round(wy);
    if (reg === 'wood') {
      const x = Math.round((r2 * VW + Math.sin(time * 1.3 + i) * 9 + time * 2) % VW);
      g.fillStyle = LEAF[i & 3]; g.fillRect(x, y, 2, 1); if (((time * 3 + i) | 0) & 1) g.fillRect(x + 1, y + 1, 1, 1);
    } else if (reg === 'crags') {
      const x = Math.round((r2 * VW + Math.sin(time * 0.9 + i * 2) * 6 + time * 7) % VW);
      g.globalAlpha = 0.85; g.fillStyle = '#f4f8ff'; g.fillRect(x, y, i % 3 ? 1 : 2, i % 3 ? 1 : 2); g.globalAlpha = 1;
    } else if (reg === 'desert') {
      const x = Math.round(((r2 * VW + time * (44 + r3 * 30)) % (VW + 20)) - 10);   // sand streaks blow across, level
      const yy = Math.round(camY + ((r1 * VH * 7) % VH)); if (regionOf(yy) !== 'desert') continue;
      g.globalAlpha = 0.55; g.fillStyle = '#e8c878'; g.fillRect(x, yy, 3 + (i & 1), 1); g.globalAlpha = 0.3; g.fillRect(x - 3, yy, 2, 1); g.globalAlpha = 1;
    } else if (reg === 'coast') {
      const yy = Math.round(camY + ((r1 * VH * 7) % VH)); if (regionOf(yy) !== 'coast') continue;
      const ph = (time * 0.5 + r2) % 1, x = Math.round(r3 * VW + Math.sin(time * 0.4 + i) * 3);   // a crest swells and fades: foam
      g.globalAlpha = Math.sin(ph * Math.PI) * 0.75; g.fillStyle = '#eaf6ff'; g.fillRect(x, yy, 5, 1); g.fillRect(x + 1, yy + 1, 3, 1); g.globalAlpha = 1;
    }
  }
}

/* TRAVELLERS: a small cart and its walker go back and forth along the PATH between a pair of stores (legs = [[pathIndexA, pathIndexB], ...]). */
const lenCache = new WeakMap();
function pathLen(PATH) { let c = lenCache.get(PATH); if (!c) { c = [0]; for (let i = 1; i < PATH.length; i++) c.push(c[i - 1] + Math.hypot(PATH[i][0] - PATH[i - 1][0], PATH[i][1] - PATH[i - 1][1])); lenCache.set(PATH, c); } return c; }
function atDist(PATH, c, d) { let i = 1; while (i < c.length - 1 && c[i] < d) i++; const a = PATH[i - 1], b = PATH[i], t = Math.max(0, Math.min(1, (d - c[i - 1]) / ((c[i] - c[i - 1]) || 1))); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, Math.sign(b[0] - a[0]) || 1]; }
export function drawTravellers(g, o) {
  if (o.reduced) return;
  const { time, camY, VH, PATH, legs } = o, c = pathLen(PATH);
  legs.forEach(([ia, ib], k) => {
    const lo = Math.min(ia, ib), hi = Math.max(ia, ib), d0 = c[lo], span = c[hi] - d0; if (span < 20) return;
    const u = (time * 7 + k * 53) % (2 * span), fwd = u < span, d = d0 + (fwd ? u : 2 * span - u);
    const [x, y, sx] = atDist(PATH, c, d); if (y < camY - 12 || y > camY + VH + 12) return;
    const f = (fwd ? 1 : -1) * sx, X = Math.round(x), Y = Math.round(y), step = ((time * 6) | 0) & 1;
    g.fillStyle = '#2a1c12'; g.fillRect(X - 5, Y - 4, 7, 1); g.fillRect(X - 5, Y - 4, 1, 3);   // cart rim
    g.fillStyle = '#8a5a30'; g.fillRect(X - 4, Y - 3, 5, 2);                                  // bed
    g.fillStyle = '#e8d296'; g.fillRect(X - 3, Y - 5, 3, 2);                                  // sacks
    g.fillStyle = '#2a1c12'; g.fillRect(X - 4, Y - 1, 2, 2); g.fillRect(X, Y - 1, 2, 2);      // wheels
    const hx = X + (f > 0 ? 4 : -6);                                                          // the walker leads it: cloak, face, hat, two legs
    g.fillStyle = '#4a6a3a'; g.fillRect(hx, Y - 5, 2, 3); g.fillStyle = '#e0b890'; g.fillRect(hx, Y - 7, 2, 2); g.fillStyle = '#6a3a22'; g.fillRect(hx - 1, Y - 8, 4, 1);
    g.fillStyle = '#2a1c12'; g.fillRect(hx + step, Y - 2, 1, 2); g.fillRect(hx + 1 - step, Y - 2, 1, 2);
  });
}

/* A NODE'S MARK OF STATE. A place you can enter and have not cleared keeps a campfire at its foot; clear it and the fire is ash and a small red banner goes up on a pole. */
export function drawNodeStates(g, o) {
  const { time, camY, VH, nodes, locked, cleared, reduced } = o;
  for (const n of nodes) {
    if (n.kind !== 'level' || n.y < camY - 24 || n.y > camY + VH + 24 || locked(n)) continue;
    const fx = n.x + 11, fy = n.y + 1;
    if (cleared(n)) {
      g.fillStyle = '#2a1c12'; g.fillRect(fx - 1, fy + 1, 3, 1); g.fillStyle = '#58505c'; g.fillRect(fx, fy, 1, 1);
      const wv = reduced ? 0 : Math.round(Math.sin(time * 5 + n.x) * 0.6 + 0.5);
      g.fillStyle = '#4a3220'; g.fillRect(fx + 3, fy - 9, 1, 10); g.fillStyle = '#c9463d'; g.fillRect(fx + 4, fy - 9, 4, 3 + wv); g.fillStyle = '#ffd36b'; g.fillRect(fx + 5, fy - 8, 1, 1);
    } else {
      const fl = reduced ? 0 : (((time * 9 + n.x * 0.3) | 0) % 3);
      g.fillStyle = '#3a2418'; g.fillRect(fx - 2, fy + 1, 5, 1); g.fillStyle = '#c9463d'; g.fillRect(fx - 1, fy - (fl === 1 ? 2 : 1), 3, 2);
      g.fillStyle = '#ffb040'; g.fillRect(fx, fy - (fl === 2 ? 3 : 2), 1, 2); g.fillStyle = '#fff0a0'; g.fillRect(fx, fy, 1, 1);
      if (!reduced && fl === 0) { g.globalAlpha = 0.4; g.fillStyle = '#b8b0a8'; g.fillRect(fx, fy - 5 - (((time * 2) | 0) & 1), 1, 1); g.globalAlpha = 1; }
    }
  }
}

/* THE WATER WHEEL (on the wood river) and THE WINDMILL (in the desert): a few pixels that turn. */
export function drawMills(g, o) {
  const { time, camY, VH, reduced } = o, ph = reduced ? 0 : ((time * 3) | 0) & 3;
  { const x = 292, y = 801;
    if (y > camY - 16 && y < camY + VH + 16) {
      g.fillStyle = '#2a1c12'; g.fillRect(x - 7, y - 6, 14, 3); g.fillStyle = '#6e4d2c'; g.fillRect(x - 6, y - 6, 12, 2); g.fillStyle = '#4a3220'; g.fillRect(x - 7, y - 3, 2, 8); g.fillRect(x + 5, y - 3, 2, 8);
      const sp = [[0, -5], [4, -4], [5, 0], [4, 4], [0, 5], [-4, 4], [-5, 0], [-4, -4]];
      sp.forEach(([dx, dy], k) => { g.fillStyle = (k + ph) & 1 ? '#8a5a30' : '#c9a066'; g.fillRect(x + dx - 1, y + 3 + dy - 1, 2, 2); });
      g.fillStyle = '#2a1c12'; g.fillRect(x - 1, y + 2, 2, 2);
    } }
  { const x = 262, y = 98;
    if (y > camY - 30 && y < camY + VH + 30) {
      g.fillStyle = '#2a1c12'; g.fillRect(x - 5, y - 9, 10, 14); g.fillStyle = '#d8b878'; g.fillRect(x - 4, y - 8, 8, 12); g.fillStyle = '#b8955a'; g.fillRect(x - 4, y - 8, 2, 12);
      g.fillStyle = '#6a3a22'; g.fillRect(x - 1, y, 3, 5); g.fillStyle = '#a8552a'; g.fillRect(x - 3, y - 11, 6, 3);
      const a = reduced ? 0.3 : time * 1.2;
      for (let k = 0; k < 4; k++) { const t = a + k * Math.PI / 2; for (let d = 2; d <= 9; d++) { g.fillStyle = d > 4 ? '#f0e8d0' : '#4a3220'; const s = d > 4 ? 2 : 1; g.fillRect(Math.round(x + Math.cos(t) * d), Math.round(y - 5 + Math.sin(t) * d), s, s); } }
    } }
}

/* FOG over the regions not reached: north of the furthest open node (frontierY, the smallest y of any open node) a checkered veil, thin near the frontier and thick far off,
   drifting a pixel. It lifts as nodes open. Whole 2px checker (the map's own dither), never a blur. */
let fogPat = null;
function pattern(g) {
  if (fogPat) return fogPat;
  try { const c = document.createElement('canvas'); c.width = 2; c.height = 2; const q = c.getContext('2d'); q.fillStyle = '#dfe6ee'; q.fillRect(0, 0, 1, 1); q.fillRect(1, 1, 1, 1); fogPat = g.createPattern(c, 'repeat'); } catch (e) { fogPat = null; }
  return fogPat;
}
export function drawFog(g, o) {
  const { time, camY, VW, VH, frontierY, reduced } = o;
  if (frontierY === undefined || frontierY <= 24) return;
  const vt = camY, vb = camY + VH, pat = pattern(g), drift = reduced ? 0 : Math.round(time * 2) % 2;
  const band = (yA, yB, fill, a) => { const t = Math.max(vt, yA), b = Math.min(vb, yB); if (b > t) { g.globalAlpha = a; g.fillStyle = fill; g.fillRect(drift - 2, t, VW + 4, b - t); } };
  band(frontierY - 80, frontierY - 40, pat || '#dfe6ee', 0.55);          // thin: a checker
  band(frontierY - 150, frontierY - 80, pat || '#dfe6ee', 0.9);           // thicker
  band(frontierY - 150, frontierY - 80, '#c8d2de', 0.25);
  band(-10, frontierY - 150, '#c8d2de', 0.55);                            // far: a pale solid
  band(-10, frontierY - 150, pat || '#dfe6ee', 0.9);
  g.globalAlpha = 1;
}
