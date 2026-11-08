/* src/bones-placements.js - THE SKELETON SET's by-level swaps (claude/foes, wolves-plan.md section 2). Data only: exact rows { level, at: [x, y], from, to } applied over a level's finished
   ents ONLY WHEN BONES_SHIPS (src/bones.js) - src/level.js wraps a level's build() with bonesPlace the way it wraps the cast pass, and ONLY while the flag is on, so with it off the build()
   is untouched and the level hash does not move. A row whose `from` is not found at `at` is a failure (tools/bones.mjs, like the cast-pass rows), never a quiet miss.
   The swap keeps every other key of the ent (face, squad, garrison): the skeleton takes the zombie's / apprentice's place in its squad.
   THE MAGE'S FOLLY (W 808, the upper route; armours and the other apprentices stay its own cast): zombie (221,5) -> SOLDIER; dead apprentice (317,5) -> ARCHER; zombie (471,9) -> MAGE.
   THE FALLING TOWER (vertical W 110 H 306): zombie (44,281) -> SOLDIER (the first floor teaches the shield); apprentice (32,257) -> ARCHER; zombie (42,217) -> SOLDIER; zombie (19,134) -> MAGE.
   (The husk 52,146, the Sexton and the chase stay.) Later, this file: the Burial Caverns + the Witchlight Stair swap about half their `bonearcher` to `skelarcher`.
   OWED before BONES_SHIPS flips: a curve restamp, `node tools/level-quality.mjs mage|fallingtower`, and a real-hero browser WALK of both levels (a swap is near-like in threat:
   zombie 38 -> soldier 44, apprentice 34 -> archer 22). Art before live: the flag stays off until the art lane merges. */
import { BONES_SHIPS } from './bones.js';

export const BONE_PLACEMENTS = [
  { level: 'mage', at: [221, 5], from: 'zombie', to: 'skelsoldier' },
  { level: 'mage', at: [317, 5], from: 'apprentice', to: 'skelarcher' },
  { level: 'mage', at: [471, 9], from: 'zombie', to: 'skelmage' },
  { level: 'fallingtower', at: [44, 281], from: 'zombie', to: 'skelsoldier' },
  { level: 'fallingtower', at: [32, 257], from: 'apprentice', to: 'skelarcher' },
  { level: 'fallingtower', at: [42, 217], from: 'zombie', to: 'skelsoldier' },
  { level: 'fallingtower', at: [19, 134], from: 'zombie', to: 'skelmage' },
];
export const BONE_LEVELS = [...new Set(BONE_PLACEMENTS.map(r => r.level))];

/* apply every row of level `id` over L.ents in place; returns the rows that found nothing (a lint's failures). `force` skips the flag (tools only) */
export function bonesPlace(L, id, o = {}) {
  const missed = [];
  if (!BONES_SHIPS && !o.force) return o.report ? missed : L;
  for (const r of BONE_PLACEMENTS) {
    if (r.level !== id) continue;
    const e = (L.ents || []).find(q => q && q.t === r.from && q.x === r.at[0] && q.y === r.at[1]);
    if (!e) { missed.push(r); continue; }
    e.t = r.to;
  }
  return o.report ? missed : L;
}
