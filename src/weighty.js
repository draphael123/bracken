// src/weighty.js — COMBAT: CLASSIC / WEIGHTY (claude/ssproto, Daniel 2026-09-29: a Salt & Sanctuary-style prototype, OFF BY DEFAULT).
//
// ONE SWITCH. Settings > Combat (saved), or ?combat=weighty / ?combat=classic in the address for a playtest (the address wins and is
// not saved). With it off every line of the game runs exactly as it did: each rule below is asked through weighty(), and the
// classic numbers are the ones already in the code (tools/weighty.mjs proves it).
//
// WITH IT ON:
//   1. THE HORNET QUEEN IS ALWAYS HITTABLE. Her swarm no longer closes over her (it turned 55% of every blow while two drones
//      flew): every blow lands whole, and her two openings (winded, stuck) are the BONUS they always paid on top. Her health is
//      raised a fifth (queen.hp): about what the swarm armour was worth to a player, less what the recovery costs him. The pilot bot is
//      no guide here (it fights LONGER at x1 than in classic: the recovery stops its jump-cuts), so this is a reasoned number.
//   2. THE BLADE COMMITS (every hero, every level). A swing ends in a RECOVERY by its weight (recovery.*): no jump out of the swing
//      or its recovery, no dodge, no guard. Mashing is a string of commitments you cannot leave.
//   3. SHE HOLDS AND SHE FEINTS. Her dive and her slam may be held past their usual beat (queen.holdMax), and one dive in
//      queen.feintP is a FEINT: she rears exactly as for a dive, drops a hand's breadth and goes back up - no blow, so no mark.
//   4. THE BODY FIRST. Her windups are longer (queen.windK) and the mark over them arrives queen.markAt of the way in: she rears
//      back for a dive before the ! appears. Every attack is still told; the icon is just no longer the first thing you see.
//   5-7. IN KINGSWOOD (levels): POISE - a brute or a plate swings through the first poise.absorb blows (no flinch) and the next one
//      BREAKS him (a short stagger window); a shield, a pike or a soldier flinches only to a heavy blow or a blow from behind.
//      A SHIELD PARRIES MASHING: parry.hits blows on its guard inside parry.window and it throws you off (you reel) and counters
//      with a told bash. A BRUTE FEINTS (feint.p of his swings: the overhead's pose, held, lowered - no blow and no mark), a PIKE
//      LUNGES (it closes lunge.reach with its thrust), and an ARCHER BACKS OFF to keep archer.keep between you.
//   8. commonDamage 1.25 -> 1.4.
// Common foes get NO more health, anywhere.

export const WEIGHTY = {
  commonDamage: 1.4,
  recovery: { light: 0.16, slow: 0.22, heavy: 0.28 },
  queen: { hp: 1.2, windK: 1.3, markAt: 0.5, holdP: 0.5, holdMax: 0.45, feintP: 0.3, rear: 14 },
  poise: { absorb: 2, reset: 1.6, broken: 0.9 },
  parry: { hits: 3, window: 1.4, reel: 0.3, tell: 0.6, cd: 2.5 },
  lunge: { reach: 84, speed: 260, time: 0.2 },
  archer: { keep: 110 },
  feint: { p: 0.35, t: 0.5, rest: 0.2 },
  levels: ['kings'],
};
export const ABSORB = new Set(['brute', 'heavy']);           // swing through the first blows, then break
export const GUARDED = new Set(['shield', 'pike', 'soldier']); // flinch only to a heavy blow or a blow from behind

let on = false;
export const weighty = () => on;
export const setWeighty = v => (on = !!v);
/* the address wins ('weighty' or 'classic'), else the saved setting; anything else is classic */
export const combatFrom = (param, saved) => (param === 'weighty' || param === 'classic') ? param : saved === 'weighty' ? 'weighty' : 'classic';
export const weightyHere = levelId => on && WEIGHTY.levels.includes(levelId);
export const recoveryFor = (heavy, slow) => heavy ? WEIGHTY.recovery.heavy : slow ? WEIGHTY.recovery.slow : WEIGHTY.recovery.light;

/* A BLOW THAT LANDED on a Kingswood foe, while the switch is on: 'absorb' (no flinch: he swings through it), 'break' (the poise
   is gone: a short stagger window), 'guard' (a shield, pike or soldier hit light from the front: no flinch) or '' (classic). */
export function poiseRule(e, t, heavy, behind) {
  if (e.broken > 0 || e.maxHp || e.mini || e.elite) return '';
  if (ABSORB.has(e.t)) {
    if (!(e.wpT > t)) e.wpN = 0;
    e.wpN = (e.wpN || 0) + (heavy ? 2 : 1); e.wpT = t + WEIGHTY.poise.reset;
    if (e.wpN > WEIGHTY.poise.absorb) { e.wpN = 0; return 'break'; }
    return 'absorb';
  }
  if (GUARDED.has(e.t) && !heavy && !behind) return 'guard';
  return '';
}
/* A BLOW TURNED ON A SHIELD's guard: true when it is the one that makes it PARRY (parry.hits inside parry.window) */
export function guardCount(e, t) {
  if (e.parryCd > t) return false;
  if (!(e.gT > t)) e.gN = 0;
  e.gN = (e.gN || 0) + 1; e.gT = t + WEIGHTY.parry.window;
  if (e.gN >= WEIGHTY.parry.hits) { e.gN = 0; e.parryCd = t + WEIGHTY.parry.cd; return true; }
  return false;
}
