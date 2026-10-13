// src/boss-pressure.js - THE GLOBAL BOSS PRESSURE DIAL, ONE TABLE PER ACT (claude/flasklever, Daniel + coordinator 2026-10-13).
//
// WHY: the human bot with flasks wins ~94% of boss rows (dry ~75%) against the 60-70% band (B6 amended; minis 75-85%). The brief for the flask lever says the
// fix is not per-boss edits first: ONE dial per act, applied to every boss and mini of that act, in this table.
//   gap  how much FASTER a boss's own clock runs while he is NOT telling, NOT open, NOT broken and NOT staggered - his cooldowns, his walk, his idle - so the gaps
//        between attacks shrink by 1/gap. (src/main.js updateEnemies hands the boss's hands a scaled dt in those moments only.) A windup, a told blow's own
//        timing, an opening (B10), a ward after it (B3) and his poise break are NEVER scaled: tells stay at their authored length (>= the 0.5 s floor), openings
//        stay as long as they were told.
//   dmg  how much more every blow he lands does (src/main.js damagePlayer0, after the other per-boss tables; DOT/hazards and drains are not his blow).
// NO extra hp. B10-B15 are untouched: no new windup, no new invulnerability, the 0.4x resistance floor and every opening are as authored.
// Rows: act 1..5 as src/foe-react.js ACTS (actOf). 'mini' is its own column (B6: minis 75-85%).
export const PRESSURE = {
  1: { gap: 1.12, dmg: 1.2, mini: { gap: 1.15, dmg: 1.25 } },
  2: { gap: 1.33, dmg: 1.55, mini: { gap: 1.25, dmg: 1.35 } },
  3: { gap: 1.75, dmg: 2.15, mini: { gap: 1.3, dmg: 1.5 } },
  4: { gap: 1.63, dmg: 2.0, mini: { gap: 1.35, dmg: 1.55 } },
  5: { gap: 1.63, dmg: 2.0, mini: { gap: 1.35, dmg: 1.55 } },
};
/* the modes whose clock is NEVER scaled (told, open, ward, phase change, down): everything else of a boss's runs the dial's gap */
const FROZEN = /Tell$|^(sleep|wake|phase|dead|dying|stuck|downed|stun|stunned|open|broken|ward|warded|reel|reeling|intro|rest0)$/;
/* BOSSES THAT ARE TUNED INTO THE BAND BY THEIR OWN REWORK LANE take NO dial (factor 1): they would be double-tuned. Coordinator 10-13: the Cistern Queen (claude/cqueenrework,
   67% with flasks at blows x2.9), the Hourglass King (claude/bc3tune, 61%); later the Matriarch, the Hawk-Mistress and the Glass Colossus when their lanes land (listed now so the dial
   never stacks on them). Remove a name here once a later re-measure shows the boss outside the band again. */
export const DIAL_EXEMPT = new Set(['cisternqueen', 'hourglassking', 'matriarch', 'hawkmistress', 'colossus']);
export function pressureOf(act, mini) { const r = PRESSURE[act] || PRESSURE[5]; return mini ? r.mini : r; }
/* the dt factor for one boss this frame: 1 unless his clock is a gap's */
export function gapFactor(e, act, mini, winding) {
  const g = pressureOf(act, mini).gap; if (!(g > 1) || !e || winding || DIAL_EXEMPT.has(e.t)) return 1;
  if (e.open > 0 || e.broken > 0 || e.stagger > 0 || e.warded > 0 || e.ward > 0) return 1;
  if (typeof e.mode === 'string' && FROZEN.test(e.mode)) return 1;
  return g;
}
export const dmgFactor = (act, mini, e) => (e && DIAL_EXEMPT.has(e.t) ? 1 : pressureOf(act, mini).dmg);
