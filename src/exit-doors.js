// src/exit-doors.js - THE WAY OUT AFTER THE BOSS (claude/exitgates2, 2026-10-18; Daniel approved 10-18, questions-1018 B5).
// Until now a boss level ended where the boss fell: the win card landed on the spot (main.js: bossWon -> winLevel) unless the level was built with
// L.gateAfterBoss (the Mage's Folly, the desert, the canal, ... - the boss opens its gate and you WALK to it). Two kinds of level were left without that:
//   ADD   no exit object at all (marsh, spore, kings, scree, crown, causeway, fields, oreroad, unburied): a themed gate stands on the footing past/behind the boss
//   MOVE  Bracken Wood: its gate stood at 514, OUTSIDE the arena's west wall (the old end of the wood, before the Queen), so it never worked: moved to the arena's far end
//   OPEN  a gate was in the level data but, with no gateAfterBoss, was never walked to (the kill won the level first): the flag is all they were missing
// The art is src/exit-gates.js (KIND_OF: the region's landmark - a stockade gate in the marsh, a toadstool arch in the fungus, a trilithon in the crag, a
// headframe in the mine, a gatehouse in the storm hold, a ship-timber gate on the coast, a lychgate inland); the boss kill opens it (main.js 'THE ROAD GOES ON'),
// the arena walls drop with the boss, and you walk out = the level-end transition's start point. Nothing is drawn or fought differently until he falls.
// Applied in ONE place (applyExits, called last at the end of level.js, outside every pass) so no builder is edited and no rework lane's file is touched.
//
// NOT HERE (and why): lamplit (claude/lamplit3), church / lit-church (claude/church3 - it already has its gate), flotilla and hurricane (reworks next week);
// witchlight (the arena is a spike pit with drifting slabs: no footing for a door without a new ledge the boss fight would use); spire (its gate stands
// behind a spike gauntlet); stockade (its escape gate exists: main.js chiefDies); harbor (off the map).
export const ADD = {   /* level id -> [x, y] (tile column, the row you stand on) of the new gate */
  marsh: [496, 16, { drop: [['deco', 495, 16]] }],   /* the dais behind the Frog King's throne; the east frog statue (deco 495,16) stood where the gate does */
  spore: [549, 19, { drop: [['deco', 550, 19], ['deco', 547, 19]] }],   /* the apron past the Mother's Knot; the goblin pennant (550) and warning post (547) stood where the gate does */
  kings: [668, 13],                                  /* the road out of the court, past the east wall */
  scree: [644, 8],                                   /* the pass beyond the ram's wall */
  crown: [932, 17],                                  /* behind the Goblin Queen's throne, on her dais */
  causeway: [594, 23],                               /* the last dry stretch of the causeway, west of the Kraken's water */
  fields: [696, 33],                                 /* the field gate, between the two low walls at the east end of the Scarecrow King's field */
  oreroad: [520, 13],                                /* the east end of the winch house floor, beside the miner's lamp */
  unburied: [547, 36, { drop: [['deco', 549, 36]] }],                             /* past the east wall of the battlefield; the siege wreck (deco 549,36) stood where the gate does, its coins stay */
};
export const MOVE = { wood: [550, 8] };              /* the Queen's hive: its old gate (514,8) was outside the arena */
export const OPEN = ['hanging', 'moor', 'storm', 'longwater', 'reef', 'underleaf', 'deep', 'keep', 'waymeet', 'undercrown', 'burial', 'burning'];   /* gate already in the data, on footing, at/after the arena */

export function applyExits(levels) {
  const rule = {};
  for (const [id, a] of Object.entries(ADD)) rule[id] = { at: a, opts: a[2] || {}, replace: false };
  for (const [id, a] of Object.entries(MOVE)) rule[id] = { at: a, opts: a[2] || {}, replace: true };
  for (const id of OPEN) rule[id] = rule[id] || { at: null, opts: {}, replace: false };
  for (const lv of levels) {
    const r = rule[lv.id]; if (!r) continue;
    const build = lv.build;
    lv.build = (...a) => {
      const L = build(...a);
      if (r.at) {
        const gone = e => (r.replace && e.t === 'gate') || (r.opts.drop || []).some(([t, x, y]) => e.t === t && e.x === x && e.y === y);
        for (let i = L.ents.length - 1; i >= 0; i--) if (gone(L.ents[i])) L.ents.splice(i, 1);   /* in place: nothing that holds the array loses it */
        L.ents.push({ t: 'gate', x: r.at[0], y: r.at[1] });
      }
      L.gateAfterBoss = true;
      return L;
    };
  }
  return levels;
}
