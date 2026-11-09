// src/bones-placements.js - WHERE THE SKELETON SET STANDS IN THE LIVE LEVELS (claude/beastsbones; plan scratch/lane-reports/wolves-plan.md section 2, "PLACEMENTS IN LIVE LEVELS").
// Exact rows { level, at: [x, y], from, to } applied over a level's build() ents ONLY when BONES_SHIPS (src/bones.js) is true: a row whose `from` is not found at `at` fails
// tools/bones.mjs (like the cast-pass rows), and the level DATA is untouched, so the level hash does not move while the flag is off.
// Same-index swaps: the ents array keeps its length and order, so the spawn loop's indices (and every k-th reference) stay what they were.
//   THE MAGE'S FOLLY (mage, W 808), the upper route: zombie -> SOLDIER, dead apprentice -> ARCHER, zombie -> MAGE (armours and the other apprentices stay its own cast).
//   THE FALLING TOWER (fallingtower, vertical W 110 H 306): the first floor teaches the shield (soldier), then an archer, a second soldier, a mage (the husk, the Sexton and the chase untouched).
// LATER, same file (the placement lane, not this one): swap about half of BURIAL CAVERNS' and WITCHLIGHT's bonearcher (12 / 10) to skelarcher; Wispwood / Silk Undercroft / Hollow Manor
// place the set natively in their greybox lanes. A curve restamp, tools/level-quality.mjs mage|fallingtower and a real-hero browser WALK of both levels are OWED before BONES_SHIPS flips.
import { BONES_SHIPS } from './bones.js';

export const BONES_PLACEMENTS = [
  { level: 'mage', at: [221, 5], from: 'zombie', to: 'skelsoldier' },
  { level: 'mage', at: [317, 5], from: 'apprentice', to: 'skelarcher' },
  { level: 'mage', at: [471, 9], from: 'zombie', to: 'skelmage' },
  { level: 'fallingtower', at: [44, 281], from: 'zombie', to: 'skelsoldier' },
  { level: 'fallingtower', at: [32, 257], from: 'apprentice', to: 'skelarcher' },
  { level: 'fallingtower', at: [42, 217], from: 'zombie', to: 'skelsoldier' },
  { level: 'fallingtower', at: [19, 134], from: 'zombie', to: 'skelmage' },
];
const hit = (e, r) => e && e.t === r.from && e.x === r.at[0] && e.y === r.at[1];
/* the ents of a level with the rows applied (the SAME array when the flag is off or the level has no rows) */
export function applyBonesPlacements(levelId, ents, shipped = BONES_SHIPS) {
  if (!shipped || !ents) return ents;
  const rows = BONES_PLACEMENTS.filter(r => r.level === levelId); if (!rows.length) return ents;
  return ents.map(e => { const r = rows.find(q => hit(e, q)); return r ? { ...e, t: r.to } : e; });
}
/* rows whose target is missing: [] when every row finds its `from` at `at` */
export function placementProblems(levelId, ents) {
  const out = []; for (const r of BONES_PLACEMENTS) if (r.level === levelId && !(ents || []).some(e => hit(e, r))) out.push(r.level + ' ' + r.from + ' at ' + r.at.join(',') + ' not found');
  return out;
}
