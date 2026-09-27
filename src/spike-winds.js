// src/spike-winds.js — THE SPIKED MOAT AND ITS WINDS (the Witchlight Stair's battlements and the Gate Gargoyle's room).
// Daniel, 2026-09-27 (the Gate Gargoyle, round three): "The arena floor is SPIKES... A player who falls onto the spikes takes ONE hit
// and wind tunnels carry them back up... After the stomp, WINDS carry the player back up."
// A WIND ZONE is a stretch of spiked floor with WELLS in it: rune-lit grates among the spikes with the tower's loose magic streaming up
// out of them. What falls onto the spikes of a zone is the ZONE'S to handle, not the engine's:
//   A HERO who reaches the spikes takes ONE bite (WIND.bite of his health, never his last point - a fall is not a life, the Ore Road's
//     pit rule) and the wind has him: up first, then along, to an EXIT - the nearest one AT OR BEHIND where he fell (so a fall costs
//     the stretch again and never skips ahead), or in the Gargoyle's room the nearest slab still standing. Moved by the level, not by
//     his legs (a ride, told by the wells roaring and the streaks), guarded while it lasts.
//   A HERO WHO STOMPS something lying stunned on the spikes (the Gate Gargoyle, a whelp) bounces off it and the wind takes him at
//     once, WITHOUT a bite: that is the reward, and the way back up.
// Data (tiles, the level's final coordinates): L.winds = [{ x0, x1, row, wells: [x...], exits: [[x, airRow]...], arena? }], `row` the
// row of spike tiles. main.js calls windCatch from the engine's two spike checks, windStep once a frame, and drawWinds.
export const WIND = {
  bite: 0.2,          /* a fifth of his health, once */
  up: 300, along: 240, /* px/s at most: up the well, then along to the exit */
  over: 22,           /* he is let go this far over the exit's footing, falling at `drop` px/s, and lands on it */
  drop: 30, maxT: 6,  /* a ride that has not arrived in six seconds lets go where it is (it never should) */
  bounce: -230,       /* a stomp's bounce, before the wind takes him */
};
const TS = 16;
/* the zone a tile is in: its columns, and within a row of its spikes */
export const windZoneAt = (L, tx, ty) => (L && L.winds || []).find(z => tx >= z.x0 && tx <= z.x1 && ty >= z.row - 1 && ty <= z.row + 1) || null;
/* is this point (px) over a zone's spikes, low enough that what lies there lies ON them */
export const onSpikes = (L, x, y) => { const tx = Math.floor(x / TS), z = windZoneAt(L, tx, Math.floor((y - 1) / TS)); return z && y >= z.row * TS + 4 ? z : null; };
/* WHERE THE WIND PUTS HIM: the nearest exit at or behind the fall (behind = towards the zone's start, x0), else the nearest; in the
   Gargoyle's room the nearest slab still standing (given by the caller) - returns { x, y, m } in px, `m` the slab if it is one */
export function windExit(z, fx, slabs) {
  if (z.arena && slabs && slabs.length) { const cen = m => m.x + m.w / 2, low = Math.max(...slabs.map(m => m.y)), score = m => Math.abs(cen(m) - fx) + (low - m.y) * 0.5;   /* the nearest, the lower tier first */
    const m = slabs.slice().sort((a, b) => score(a) - score(b))[0]; return { x: cen(m), y: m.y, m }; }
  const ex = (z.exits || []).map(([x, row]) => ({ x: x * TS + 8, y: (row + 1) * TS, m: null }));
  if (!ex.length) return { x: z.x0 * TS - 8, y: z.row * TS, m: null };
  const back = ex.filter(e => e.x <= fx + 8).sort((a, b) => b.x - a.x)[0];
  return back || ex.sort((a, b) => Math.abs(a.x - fx) - Math.abs(b.x - fx))[0];
}
/* THE ONE BITE: how much a fall onto a zone's spikes takes (never the last point) */
export const windBite = P => Math.max(0, Math.min(Math.round(P.maxHp * WIND.bite), P.hp - 1));
/* START A RIDE. `why` is 'fall' (he pays the bite) or 'stomp' (he does not). Returns the ride. */
export function windCatch(P, z, why, slabs) {
  const to = windExit(z, P.x, slabs); P.windRide = { z, why, t: 0, to, fromX: P.x, well: nearestWell(z, P.x) };
  P.ground = false; P.onMover = null; P.climb = false; return P.windRide;
}
export const nearestWell = (z, x) => { const w = (z.wells || []).map(c => c * TS + 8).sort((a, b) => Math.abs(a - x) - Math.abs(b - x))[0]; return w === undefined ? x : w; };
/* ONE FRAME OF A RIDE: moves P itself (no collision - it is the wind), and returns true when it has let him go. `slabs` re-picks a
   slab exit that broke under the ride. */
export function windStep(P, dt, slabs) {
  const k = P.windRide; if (!k) return false;
  k.t += dt; if (k.to.m && (k.to.m.broken || !slabs.includes(k.to.m))) k.to = windExit(k.z, P.x, slabs);
  if (k.to.m) { k.to.x = Math.max(k.to.m.x + 6, Math.min(k.to.m.x + k.to.m.w - 6, k.to.x)); k.to.y = k.to.m.y; }
  const lx = k.to.x, ly = k.to.y - WIND.over, dy = ly - P.y, dx = lx - P.x;
  const vy = Math.sign(dy) * Math.min(WIND.up, Math.abs(dy) * 5 + 30), vx = P.y > ly + 40 ? 0 : Math.sign(dx) * Math.min(WIND.along, Math.abs(dx) * 4 + 40);   /* up first, then along */
  P.x += vx * dt; P.y += vy * dt; P.vx = 0; P.vy = 0; P.ground = false; P.onMover = null; P.climb = false; P.inv = Math.max(P.inv || 0, 0.2);
  if (Math.sign(dx)) P.face = Math.sign(dx); k.vx = vx; k.vy = vy;
  if ((Math.abs(dx) < 5 && Math.abs(dy) < 5) || k.t > WIND.maxT) { P.windRide = null; P.vy = WIND.drop; P.vx = 0; return true; }
  return false;
}
/* A STOMP: a hero coming DOWN onto the top of a body (px; e.x its middle, e.y its feet, e.w/e.h its box). The same test as the
   engine's own stomp, over the whole of a lying body's back */
export const stompOn = (P, e) => !P.dead && !P.windRide && P.vy > 40 && Math.abs(P.x - e.x) < (e.w || 12) / 2 + 5 && P.y >= e.y - e.h - 6 && P.y <= e.y - e.h + 12;

/* THE LOOK: the wells among the spikes (a grate, rune-lit, with loose magic always streaming up out of it, faint) - and while the
   wind has someone, the well he went down by ROARS and a column of streaks carries him (C1/C5: the way out is seen from inside) */
export function drawWinds(g, L, P, cx, cy, time, VW, VH) {
  for (const z of (L.winds || [])) { const fy = z.row * TS + TS - cy; if (fy < -40 || fy > VH + 200) continue;
    const busy = P && P.windRide && P.windRide.z === z ? P.windRide : null;
    for (const w of (z.wells || [])) { const x = Math.round(w * TS + 8 - cx); if (x < -40 || x > VW + 40) continue; const hot = busy && Math.abs(busy.well - (w * TS + 8)) < 2;
      g.fillStyle = '#1b1626'; g.fillRect(x - 9, fy - 5, 18, 5); g.fillStyle = '#3a3450'; g.fillRect(x - 8, fy - 4, 16, 3);
      for (let j = -6; j <= 6; j += 3) { g.fillStyle = '#120e18'; g.fillRect(x + j, fy - 4, 1, 3); }
      g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 3 + w); g.fillStyle = '#9affd8'; g.fillRect(x - 1, fy - 5, 2, 1); g.globalAlpha = 1;   /* the rune on its lip */
      const n = hot ? 10 : 4, a0 = hot ? 0.6 : 0.22, rise = hot ? 220 : 90;
      for (let j = 0; j < n; j++) { const ph = ((time * (hot ? 2.6 : 0.9) + j / n + w * 0.17) % 1), yy = fy - 6 - ph * rise;
        g.globalAlpha = a0 * (1 - ph); g.fillStyle = j % 3 ? '#e0f4ff' : '#c8a0ff'; g.fillRect(Math.round(x - 6 + ((j * 7) % 13)), Math.round(yy), 1, hot ? 7 : 4); } g.globalAlpha = 1; } }
  const k = P && P.windRide; if (!k) return;
  const x = Math.round(P.x - cx), y = Math.round(P.y - cy);   /* the wind round him: streaks going the way he goes */
  for (let j = 0; j < 9; j++) { const ph = (time * 3 + j / 9) % 1; g.globalAlpha = 0.55 * (1 - ph); g.fillStyle = j % 2 ? '#e0f4ff' : '#9affd8';
    const ox = ((j * 5) % 17) - 8, oy = 8 - ((j * 11) % 30);
    if (Math.abs(k.vy || 0) > Math.abs(k.vx || 0)) g.fillRect(x + ox, y + oy + Math.round(ph * 24), 1, 6); else g.fillRect(x + oy - Math.round(ph * 24) * Math.sign(k.vx || 1), y - 10 + ox * 0.6, 6, 1); }
  g.globalAlpha = 1;
}
