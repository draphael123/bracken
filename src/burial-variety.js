// burial-variety.js — THE BURIAL CAVERNS' DARK AND THE ROTTEN BRIDGES, at run time (2026-09-24; the level is src/burial-caverns.js since
// claude/burial2). The builder places the boards (L.crumble) and the dark (L.darkZones); this file makes them behave.
//
// THE ROTTEN BRIDGES: two spans of rotten board over green water. A board holds a moment and no more: it cracks (you see it and hear
// it) and drops half a second later, so you cross at a walk and never stop on one. Chains at every end of the poison climb you out
// (C5), and a span puts itself back five seconds after its last board fell, and whole on every respawn (B4).
//
// THE DARK IS FAIR (C1/C3): the dark is a darkZone (the engine's own - main.js eases into it as you walk), so a foe inside it gets a
// rim whatever the setting says; every mark over a head is drawn after the dark (drawTells); and anything that is about to hurt you
// carries a little light (burialHoles): a vent that hisses or puffs, and anything thrown or loosed. A BURNING VENT is a lamp, and the
// fire in your hand is a small one.
export const BURIAL_DARK = 0.6;                     /* the Ore Road is 0.34 over everything; a zone can go darker because it ends */
export const CRUMBLE = { hold: 0.55, back: 5 };     /* seconds a cracked board holds; seconds a span waits, after its last board fell, to come back */

/* ---- THE BOARDS, at run time. io: { air, spr(i) -> sprite, setSpr(i, s), crack(tx, ty), fall(tx, ty), back(z), emit(p) } ---- */
const onSpan = (L, tx, ty) => (L.crumble || []).find(z => z.row === ty && tx >= z.x0 && tx <= z.x1);
export function crumbleState(L) { return L.crumbleState || (L.crumbleState = {}); }
export function updateCrumble(L, P, dt, io) {
  if (!L.crumble || !L.crumble.length) return;
  const st = crumbleState(L), W = L.W;
  if (!P.dead && P.ground && !P.swim) { const ty = Math.floor((P.y + 1) / 16);
    for (const fx of [P.x - 4, P.x + 4]) { const tx = Math.floor(fx / 16), z = onSpan(L, tx, ty); if (!z) continue;
      const i = ty * W + tx; if (st[i] || L.grid[i] !== z.tile) continue;
      st[i] = { st: 'crack', t: CRUMBLE.hold, z }; io.crack(tx, ty); } }
  for (const k in st) { const s = st[k], i = +k; if (s.st !== 'crack') continue;
    s.t -= dt; const tx = i % W, ty = Math.floor(i / W);
    if (io.emit && Math.random() < dt * 16) io.emit({ x: tx * 16 + 2 + Math.random() * 12, y: ty * 16 + 4, vx: 0, vy: 20, life: 0.4, max: 0.4, col: Math.random() < 0.5 ? '#6a5436' : '#a6e04a', size: 1, grav: 260 });
    if (s.t <= 0) { s.st = 'gone'; s.saved = io.spr(i); L.grid[i] = io.air; io.setSpr(i, null); s.z.quiet = 0; io.fall(tx, ty); } }
  for (const z of L.crumble) {
    const gone = []; let cracking = false;
    for (let x = z.x0; x <= z.x1; x++) { const s = st[z.row * W + x]; if (!s) continue; if (s.st === 'gone') gone.push(z.row * W + x); else cracking = true; }
    if (!gone.length || cracking) { z.quiet = 0; continue; }
    z.quiet += dt;
    const onIt = P.x > z.x0 * 16 - 8 && P.x < (z.x1 + 1) * 16 + 8 && P.y > (z.row - 1) * 16 && P.y < (z.row + 1) * 16 + 4;
    if (z.quiet >= CRUMBLE.back && !onIt) { for (const i of gone) { L.grid[i] = z.tile; io.setSpr(i, st[i].saved || null); delete st[i]; } z.quiet = 0; io.back(z); }
  }
}
/* EVERY ATTEMPT FINDS THE BRIDGES WHOLE (spawnEntities): a death in the poison must not leave the way on in pieces */
export function crumbleReset(L, io) {
  const st = L.crumbleState; if (!st) return;
  for (const k in st) { const s = st[k], i = +k; if (s.st === 'gone') { L.grid[i] = s.z.tile; io.setSpr(i, s.saved || null); } }
  L.crumbleState = {}; for (const z of L.crumble || []) z.quiet = 0;
}
/* THE ROT, drawn over the boards: every board wears it (dark knots and a green drip under it - a bridge that says it will not
   hold before it is asked to), and a board you have stepped on splits along a crack that grows until it goes */
export function drawCrumble(g, L, cx, cy, time) {
  if (!L.crumble) return; const st = L.crumbleState || {}, W = L.W;
  for (const z of L.crumble) { if (z.x1 * 16 - cx < -20 || z.x0 * 16 - cx > g.canvas.width + 20) continue;
    for (let x = z.x0; x <= z.x1; x++) { const i = z.row * W + x, s = st[i], px = Math.round(x * 16 - cx), py = Math.round(z.row * 16 - cy);
      if (L.grid[i] !== z.tile) continue;
      const h = (x * 73856093) >>> 0;
      g.fillStyle = '#2a1e14'; g.fillRect(px + 2 + (h % 9), py + 1, 2, 1); g.fillRect(px + 5 + ((h >> 4) % 7), py + 3, 3, 1);
      g.fillStyle = '#5c8a24'; g.fillRect(px + 3 + ((h >> 8) % 10), py + 4, 1, 2 + Math.round(1 + Math.sin(time * 2 + x)));
      if (!s || s.st !== 'crack') continue;
      const k = 1 - Math.max(0, s.t) / CRUMBLE.hold, j = Math.floor(time * 30) % 2;
      g.fillStyle = '#140c06'; for (let n = 0; n < 1 + Math.round(k * 6); n++) g.fillRect(px + 7 + ((n % 2) ? 1 : -1) * Math.min(7, n) + j, py + Math.min(5, n), 1, 2);
      g.fillStyle = '#e8d8b0'; g.fillRect(px + 1, py - 1 - j, 3, 1); g.fillRect(px + 12, py - 1 - (1 - j), 3, 1); }
  }
}
/* LIGHT IN THE DARK THAT IS ABOUT TO HURT YOU: a vent that hisses or puffs, and anything thrown or loosed, inside a burial dark zone */
export function burialHoles(L, hole, cx, cy, time, seeds, P) {
  if (!L.darkZones || !L.gasVents) return;
  const inDark = (x, y) => L.darkZones.some(z => x > z.x0 - 32 && x < z.x1 + 32 && y > z.y0 - 32 && y < z.y1 + 32);
  if (!inDark(P.x, P.y)) return;
  for (const v of L.gasVents) { const x = v.x * 16 + 8, y = v.y * 16;
    if (x - cx < -120 || x - cx > 440 || !inDark(x, y)) continue;
    if (v.litT > 0) { hole(x - cx, y - 16 - cy, 96 * (v.litT < 3 ? 0.7 + 0.3 * Math.abs(Math.sin(time * 9)) : 1), 1); continue; }   /* A BURNING VENT IS A LAMP (VENT.light) */
    if (v.state === 'warn') hole(x - cx, y - 10 - cy, 30, 0.7); else if (v.state === 'puff') hole(x - cx, y - 28 - cy, 46, 0.9); }
  for (const c of L.candles || []) { const x = c.x * 16 + 8, y = c.y * 16 - 8; if (x - cx > -60 && x - cx < 380 && inDark(x, y)) hole(x - cx, y - cy, 40, 0.8); }
  if (P.candle > 0 && !P.dead) hole(P.x - cx, P.y - 14 - cy, 44, 0.85);
  for (const s of seeds || []) if (!s.dead && inDark(s.x, s.y)) hole(s.x - cx, s.y - cy, 18, 0.8);
}
