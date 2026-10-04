/* src/variety-pass.js - THE VARIETY LANE's by-level swaps (claude/variety, Daniel 10-03): a level whose foes come from a sprinkler or a shared builder
   (the Deep and the Keep are one builder, split) cannot name a skin on each ent, so the level's build() runs this over its finished ents - the same last-wrapper
   trick as src/goblin-sweep.js. Each row: foe type -> { skin, every } : every Nth plain foe of that type (the first, then every Nth) takes the skin.
   Leaping river eels (e.leap) and old eels (e.big) are never swapped. */
export const VARIETY = {
  keep: { eel: { skin: 'shockeel', every: 3 } },   /* THE SHOCK EEL (the sea set's twist, src/main.js updateShore): it does not lunge; it charges a told ring and shocks a swimmer inside it - wading and rock-hopping are the answer */
  deep: { eel: { skin: 'shockeel', every: 3 } },
};
export function varietyPass(L, id) {
  const rows = VARIETY[id]; if (!rows || !L) return L;
  const seen = {};
  for (const e of L.ents || []) { const r = rows[e.t]; if (!r || e.leap || e.big || e.cnSkin) continue;
    const k = seen[e.t] = (seen[e.t] || 0) + 1; if ((k - 1) % r.every === 0) e.cnSkin = r.skin; }
  return L;
}
