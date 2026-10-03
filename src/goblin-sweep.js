/* src/goblin-sweep.js - the GOBLIN SWEEP's by-level reskin table (claude/goblinsweep, Daniel 10-02/10-03: no LIVING goblins past the Goblin Queen).
   A level whose foes are placed by a sprinkler (a table of kinds, not hand-placed ents) cannot name a skin on each ent, so the level's build() runs
   this over its finished ents instead (src/level.js, the last build wrapper). Each skin is the goblin AI's own body under a recolour of its sheet
   (src/redraw/undercrown_skins.js; main.js draws, kills and names it by e.cnSkin). The Undercrown's hand-placed foes name their skin inline. */
export const SWEEP_SKINS = {
  lamplit: { snuffer: 'lampsnuffer' },        /* the snuffer's goblin pole-walk becomes a night-warden in a black coat with a brass snuffing cup */
  witchlight: { hound: 'gravehound' },        /* the one war hound ('goblin dog') on the Warden's Lawn: a pale grave hound, the Stair's own dead */
};
export function sweepSkins(L, id) {
  const m = SWEEP_SKINS[id]; if (!m || !L) return L;
  for (const e of L.ents || []) if (m[e.t] && !e.cnSkin) e.cnSkin = m[e.t];
  for (const A of L.ambushes || []) for (const w of A.waves || []) for (const q of w) if (m[q[0]]) { q[3] = Object.assign({}, q[3] || {}); if (!q[3].cnSkin) q[3].cnSkin = m[q[0]]; }
  return L;
}
