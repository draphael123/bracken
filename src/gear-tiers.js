// src/gear-tiers.js - VISUAL GEAR TIERS (Daniel 2026-10-04, brief-leveling2 item 6). What a hero WEARS as he levels: a cape, a crested helm and
// trim, a faint aura, a full set. ONE table and ONE function decide it, so the leveling lane can hook a milestone into it without touching the art:
//   gearTier(level) -> 0..4        the tier a hero of that level wears (0 = nothing)
//   gearTier(level, true) -> 0     the player has chosen to HIDE gear tiers (Settings > Look), so nobody is drawn with any
// The art lives in src/chars.js (withGear(tier, fn) around a hero bake): every pose of every hero is drawn through the bake pipeline, in the
// hero's OWN colours, on the body only - a weapon skin never reaches it (a weapon is applied by the weapon-drawing code alone).
export const GEAR_TIERS = [
  { tier: 1, level: 10, id: 'cape', name: 'CAPE' },
  { tier: 2, level: 20, id: 'crest', name: 'CRESTED HELM' },
  { tier: 3, level: 30, id: 'aura', name: 'AURA' },
  { tier: 4, level: 50, id: 'set', name: 'FULL SET' },
];
export function gearTier(level, hidden = false) {
  if (hidden) return 0;
  let t = 0; for (const g of GEAR_TIERS) if ((level | 0) >= g.level) t = g.tier;
  return t;
}
/* the milestone a level has just reached, for a level-up card to mention (null when it is not a gear level) */
export const gearAtLevel = level => GEAR_TIERS.find(g => g.level === (level | 0)) || null;
