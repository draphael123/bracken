// src/ending.js - THE END OF THE ROAD, FOR NOW (claude/shipfix, Daniel 10-11). The card after the last level of the main road, solo or co-op:
// what the player did, in figures the save already holds (their BEST run of each level, added up - the save keeps no lifetime clock), and
// 'more road is coming'. Pure: src/main.js draws it, tools/ending.mjs asserts it.
import { chainOf } from './campaign-order.js';

/* the last level of the main road: the end of the gate chain (src/campaign-order.js), never a hard-coded id - so the day a level is added past
   The Buried City the card moves with it, and the co-op victory card can never again fire mid-road (it was tied to 'mage', the middle of five acts) */
export const roadOf = levels => chainOf(levels.filter(l => !l.hidden)).road;
export const roadEndId = levels => { const r = roadOf(levels); return r[r.length - 1] || ''; };

/* COMPLETION: of everything the road offers a save - a level cleared (1) and its medal (0-3: bronze, silver, gold) - how much is held. A first
   figure the later 100% lane can replace; it lives here so the title, the save card and this card can all ask the same function. */
export function completion(prog, levels) {
  const vis = levels.filter(l => !l.hidden); if (!vis.length) return 0; let pts = 0;
  for (const l of vis) { const p = prog[l.id] || {}; if (p.cleared) pts += 1 + Math.min(3, p.medal || 0); }
  return Math.round(100 * pts / (vis.length * 4));
}
export function roadTally(prog, levels) {
  const road = roadOf(levels), t = { levels: road.length, cleared: 0, time: 0, deaths: 0, medals: [0, 0, 0, 0] };
  for (const id of road) { const p = prog[id]; if (!p || !p.cleared) continue; t.cleared++; t.time += +p.best || 0; t.deaths += +p.deaths || 0; t.medals[Math.min(3, p.medal || 0)]++; }
  t.pct = completion(prog, levels); return t;
}
