/* src/variety-pass.js - THE VARIETY LANE's by-level swaps (claude/variety, Daniel 10-03): a level whose foes come from a sprinkler or a shared builder
   (the Deep and the Keep are one builder, split) cannot name a skin on each ent, so the level's build() runs this over its finished ents - the same last-wrapper
   trick as src/goblin-sweep.js. Each row: foe type -> { skin, every } : every Nth plain foe of that type (the first, then every Nth) takes the skin.
   Leaping river eels (e.leap) and old eels (e.big) are never swapped. */
export const VARIETY = {
  keep: { eel: { skin: 'shockeel', every: 3 } },   /* THE SHOCK EEL (the sea set's twist, src/main.js updateShore): it does not lunge; it charges a told ring and shocks a swimmer inside it - wading and rock-hopping are the answer */
  deep: { eel: { skin: 'shockeel', every: 3 } },
};
/* THE TIDE CRAB (claude/tidecrab): a shore crab that lies buried at low water (two eye-stalks showing) and comes up with the flood: the Long Water's tide (the Saltreach street pool, k >= 0.6) and the Causeway's (CT.k). Swaps are the same every-Nth
   rule; `add` stands extra ones at shore spots [x, y, face] (final columns, checked against the built grid by tools/one-new-foe.mjs and ambush-reach). */
export const TIDE_CRABS = {
  longwater: { swap: { crab: { skin: 'tidecrab', every: 1 } }, add: [[424, 26, 1], [441, 26, -1]] },   /* both road crabs (the Square's approach, the pre-gate shore) + two on the beach after the flats gate */
  causeway: { swap: { crab: { skin: 'tidecrab', every: 2 } }, add: [] },   /* 4 of the road's 7 crabs: 157, 324, 411, 448 */
};
export function varietyPass(L, id) {
  const tc = TIDE_CRABS[id], rows = VARIETY[id] || (tc && tc.swap); if (!rows || !L) return L;
  if (tc) for (const [x, y, face] of tc.add) L.ents.push({ t: 'crab', x, y, face, cnSkin: 'tidecrab' });
  const seen = {};
  for (const e of L.ents || []) { const r = rows[e.t]; if (!r || e.leap || e.big || e.cnSkin) continue;
    const k = seen[e.t] = (seen[e.t] || 0) + 1; if ((k - 1) % r.every === 0) e.cnSkin = r.skin; }
  return L;
}
