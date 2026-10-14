// src/world-react.js - THE WORLD REACTS (Daniel 10-12, claude/feelplatform). Art only: nothing here touches collision, hp or a timer.
//   a plank, a rope net or a wooden ledge DIPS one pixel under a landing (and the hero with it) for a moment, with a creak;
//   vines, ropes, banners, bunting, hung cloth and moss SWAY as you pass through them; grass and bushes brush aside as you run;
//   loose pebbles skitter off the edge of a ledge you run along, and jump from a hard landing.
// Every piece is cheap per frame: a Map of at most a few tiles, a one-time regex per deco, a handful of 1 px particles.
// main.js owns the calls (and gates every one of them on Reduce motion); this file is the data and the rules, so a check can test them.
export const SWAY_RE = /vine|rope|banner|bunting|pennant|streamer|clothstrip|curtain|moss|weed|kelp|reed|chime|garland|flag|washing|ivy|root/i;
export const SWAY_DECOR = new Set(['tuft', 'flower', 'fern', 'cattail', 'bush']);
export const PEBBLE_COLS = ['#8d8576', '#6e675a', '#a89f8c', '#5a5448'];
/* does this tile give under a weight? wood and rope kinds only: a plank, a net, and a ledge that is wood underfoot (surface() says so) */
export const dippable = (t, T, surf) => t === T.PLANK || t === T.NET || (t === T.ONEWAY && surf === 'wood');
export const newDips = () => new Map();
export const dipLand = (m, idxs, dur = 0.16) => { for (const i of idxs) m.set(i, dur); };
export function dipTick(m, dt) { if (!m.size) return; for (const [i, t] of m) { if (t - dt <= 0) m.delete(i); else m.set(i, t - dt); } }
export const dipOf = (m, i) => (m.size && m.has(i) ? 1 : 0);
/* a sway is a whole pixel either way, never more than 1 (a sprite is never smeared): amp 0..1, phase per deco */
export const swayPx = (amp, time, ph = 0) => (amp > 0 ? Math.round(Math.sin(time * 26 + ph) * Math.min(1, amp) * 1.6) : 0);
export const swaysAs = kind => SWAY_RE.test(kind || '');
/* (batch92 integ) rnd: main.js passes its private art stream so a pebble never draws from the seeded gameplay one. n pebbles off a point: dir 0 = a scatter both ways, +-1 = off an edge that way. They are 1 px, live under half a second, fall under their own gravity */
export function pebbles(parts, x, y, dir, n, rnd = Math.random) {
  for (let i = 0; i < n; i++) {
    const d = dir || (i % 2 ? 1 : -1);
    parts.push({ x: x + d * (1 + rnd() * 3), y: y - 1, vx: d * (24 + rnd() * 40), vy: -(26 + rnd() * 40), life: 0.45, max: 0.45, col: PEBBLE_COLS[(rnd() * PEBBLE_COLS.length) | 0], size: 1, grav: 520 });
  }
}
/* is the ground you run along ending within `reach` px ahead? solidAt(tx, ty) answers for a solid or one-way tile */
export function ledgeAhead(solidAt, x, y, dir, TS, reach = 9) {
  if (!dir) return false;
  const ty = Math.floor((y + 1) / TS), here = solidAt(Math.floor(x / TS), ty), ahead = solidAt(Math.floor((x + dir * reach) / TS), ty);
  return here && !ahead;
}
