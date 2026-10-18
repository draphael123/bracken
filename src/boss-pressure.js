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
  1: { gap: 1.12, dmg: 1.2, mini: { gap: 1.15, dmg: 1.25 } },   /* ACT 1 = the v2 values (measured 78%; v3 1.17/1.3 measured 50% and would wall new players - coordinator 10-13) */
  2: { gap: 1.25, dmg: 1.42, mini: { gap: 1.33, dmg: 1.5 } },
  3: { gap: 1.6, dmg: 1.9, mini: { gap: 1.4, dmg: 1.65 } },
  4: { gap: 1.45, dmg: 1.7, mini: { gap: 1.45, dmg: 1.7 } },
  5: { gap: 1.3, dmg: 1.5, mini: { gap: 1.35, dmg: 1.55 } },
};   /* v3 (10-13 evening): v2 measured act medians 78/56/56/50/22 (minis 78/100/89/89/78) - interpolated toward 60-70 (minis 75-85) off the v0/v1/v2 response curve */
/* the modes whose clock is NEVER scaled (told, open, ward, phase change, down): everything else of a boss's runs the dial's gap */
const FROZEN = /Tell$|^(sleep|wake|phase|dead|dying|stuck|downed|stun|stunned|open|broken|ward|warded|reel|reeling|intro|rest0)$/;
/* BOSSES THAT ARE TUNED INTO THE BAND BY THEIR OWN REWORK LANE take NO dial (factor 1): they would be double-tuned. Coordinator 10-13: the Cistern Queen (claude/cqueenrework,
   67% with flasks at blows x2.9), the Hourglass King (claude/bc3tune, 61%); later the Matriarch, the Hawk-Mistress and the Glass Colossus when their lanes land (listed now so the dial
   never stacks on them). Remove a name here once a later re-measure shows the boss outside the band again. */
/* MERGE NOTE (coordinator 10-13): add the NEW PYRAMID BOSS (claude/pyramidboss: the Tomb-King's Sarcophagus) here under its e.t when that lane merges - it is tuned into the band by its own lane. */
export const DIAL_EXEMPT = new Set(['cisternqueen', 'hourglassking', 'matriarch', 'hawkmistress', 'colossus', 'greatdrill', 'foremancart', 'tombking', 'scarabmother', 'fogknight', 'champion', 'paladinboss', 'deacon']);   /* (claude/church2) THE PALADIN, the hero as the boss, and THE DEACON (LIT CHURCH 2 mini): tuned into their bands by their own lane (3-seed sanity) - no dial */ /* (dr4art merge) the Deep Rails 4 boss pair: dr4tune measured them 69% / 81% with flasks BEFORE the dial existed, so they are self-tuned */
export function pressureOf(act, mini) { const r = PRESSURE[act] || PRESSURE[5]; return mini ? r.mini : r; }
/* the dt factor for one boss this frame: 1 unless his clock is a gap's */
export function gapFactor(e, act, mini, winding) {
  const g = pressureOf(act, mini).gap; if (!(g > 1) || !e || winding || DIAL_EXEMPT.has(e.t)) return 1;
  if (e.open > 0 || e.broken > 0 || e.stagger > 0 || e.warded > 0 || e.ward > 0) return 1;
  if (typeof e.mode === 'string' && FROZEN.test(e.mode)) return 1;
  return g;
}
export const dmgFactor = (act, mini, e) => (e && DIAL_EXEMPT.has(e.t) ? 1 : pressureOf(act, mini).dmg);
/* (claude/oneshotcap) THE ONE-BLOW CEILING ON THE DIAL'S BOOST: the dial's x(dmg) must never turn one blow of a boss or mini into more than BLOW_CAP of the hero's max hp on the bar
   (tools/blow-census.mjs found 5 of 58 rows over 45% of the lowest-hp hero at campaign level: Lanterneater's Snap, the Owl, the Ploughman, the Lamp-Reeve and the Serjeant minis).
   It caps only what the dial ADDED: a blow that is already over the ceiling as tuned (before the dial) is left at that tuned number, so un-dialled numbers stay as authored. `fin` is the
   chain that still runs after the dial (difficulty x tier), so the ceiling is read on what lands. DIAL_EXEMPT bosses never reach this (dmgFactor is 1). */
export const BLOW_CAP = 0.45;
export function capBoost(before, boosted, maxHp, fin = 1) { if (!(boosted > before) || !(maxHp > 0)) return boosted; const lim = Math.max(1, Math.round(BLOW_CAP * maxHp / (fin > 0 ? fin : 1))); return boosted <= lim ? boosted : Math.max(before, lim); }
