// src/tech-knight.js - THE KNIGHT'S L25-L50 KIT (claude/knightid, Daniel 10-31 18:07 + 11-01): six fixed techniques, one per tech level, and
// eight ranked upgrades (I then II). Pure data (progression.js imports it; main.js reads the numbers through tech() / upg()).
// brief-l50abilities-1101.md sec 7.1, rewritten for the GUARD CHAIN (brief-heroidentity-1101.md sec 2.1: RESOLVE is gone; 3 links earned by perfect
// guards, UP+C at 3 links = SHIELD CHARGE). Every number is swordDmg x k x amul (the late-game law): k is the multiplier here, never a flat hit.
//   input   where the player does it (builder asserts no conflict in tools/keys.mjs)
//   k       damage multiplier (or null: no damage)     cd / cost  seconds / stamina     teach  the one line the unlock banner says
export const KNIGHT_TECH = {
  25: { id: 'kcounter', name: 'COUNTER-THRUST', input: 'X after a PERFECT GUARD', k: 2.0, cd: 0, cost: 0,
    what: 'THE RIPOSTE IS A THRUST THROUGH THE GUARD. IT PAYS THE STAMINA BACK',
    teach: 'PARRY ON THE BEAT, THEN PRESS X: A THRUST THROUGH ANY GUARD. THE LINKS STILL ADD THEIR RIDERS' },
  30: { fork: [
    { role: 'defence', trade: 'GUARD OR STRIKE', id: 'kadvance', name: 'SHIELD ADVANCE', input: 'HOLD C, THEN WALK', k: null, cd: 0, cost: 4,
      what: 'MARCH WITH THE SHIELD UP: SMALL FOES ARE SHOVED AHEAD OF YOU',
      teach: 'HOLD C AND WALK: SLOW, THE SHIELD UP, SMALL FOES SHOVED BEFORE YOU. A PERFECT GUARD ON THE MARCH REELS WHAT HIT YOU' },
    { id: 'klinkcut', name: 'LINK CUT', input: 'HOLD X WITH A LINK', role: 'offence', trade: 'GUARD OR STRIKE', k: 2.0, cd: 0, cost: 0, links: 1,
      what: 'SPEND ONE LINK FOR A HEAVY CUT AT ONCE: IT BREAKS THE GUARD AND SHOVES THE FRONT MAN',
      teach: 'HOLD X WITH A LINK: THE HEAVY CUT FALLS A BEAT SOONER, BREAKS THE GUARD AND SHOVES THE MAN IN FRONT. IT COSTS ONE LINK' } ] },
  35: { id: 'kpunish', name: 'PUNISH', input: 'HOLD X ON A GUARD-BROKEN FOE', k: 2.0, cd: 0, cost: 0,
    what: 'THE HEAVY CUT FALLS AT ONCE ON A FOE WHOSE GUARD IS BROKEN',
    teach: 'A FOE WITH ITS GUARD BROKEN TAKES THE HEAVY CUT AT ONCE: PRESS X, NO HOLD, AND IT LANDS HARDER' },
  40: { fork: [
    { role: 'defence', trade: 'TURN IT OR HOOK IT', id: 'klong', name: 'LONG GUARD', input: 'PERFECT GUARD A SHOT', k: 1.5, cd: 0, cost: 0,
      what: 'A PERFECTLY GUARDED SHOT FLIES BACK HARDER AND MARKS THE SHOOTER',
      teach: 'RAISE THE SHIELD ON THE BEAT AS A SHOT ARRIVES: IT GOES BACK A HALF HARDER, AND THE ONE WHO FIRED IT TAKES YOUR NEXT BLOW 30% HARDER' },
    { id: 'kshook', name: 'SHIELD HOOK', input: 'F (SHIELD THROW) AT A SHOOTER', role: 'control', trade: 'TURN IT OR HOOK IT', k: null, cd: 0, cost: 0,
      what: 'THE THROWN SHIELD CATCHES ONE SHOOTER BY ITS RIM AND DRAGS IT TO YOU ON THE WAY HOME',
      teach: 'THROW THE SHIELD AT AN ARCHER OR SPITTER: IT HOOKS THE ONE IT STRIKES AND DRAGS IT ALONG THE GROUND BACK TO YOUR FEET, DAZED' } ] },
  45: { id: 'korders', name: 'STANDING ORDERS', input: 'HOLD C, THEN TAP X', k: null, cd: 18, cost: 10,
    what: 'A RALLY: YOUR NEXT THREE CUTS BREAK POISE 30% FASTER, AND YOUR ALLIES\'',
    teach: 'HOLD C THEN TAP X: A BRASS HORN. THE NEXT THREE CUTS (YOURS AND YOUR ALLIES\') BREAK POISE 30% FASTER. EIGHTEEN SECONDS TO CALL IT AGAIN' },
  50: { fork: [
    { role: 'close', trade: 'CLOSE OR FAR', capstone: true, id: 'kcharge2', name: 'THE LONG CHARGE', input: 'TAP C AT 3 LINKS', k: 0.9, cd: 0, cost: 0,
      what: 'THE SHIELD CHARGE ENDS IN A SECOND, WIDER SLAM',
      teach: 'THE SHIELD CHARGE NOW CHAINS A SECOND SLAM, WIDER THAN THE FIRST, A BEAT AFTER IT' },
    { id: 'kwheel', name: 'THE BREAKING WHEEL', input: 'TAP C AT 3 LINKS', role: 'far', trade: 'CLOSE OR FAR', capstone: true, k: 1.5, cd: 0, cost: 0, links: 3,
      what: 'THREE LINKS SPENT: THE SHIELD IS HURLED DOWN THE ROOM THROUGH EVERY GUARD IT CROSSES, AND ROLLS HOME',
      teach: 'UP+C AT THREE LINKS NOW HURLS THE SHIELD THE LENGTH OF THE ROOM: EVERY GUARD IT CROSSES IS BROKEN, THE BIG ONES JUST TAKE THE BLOW. IT RETURNS TO YOUR HAND' } ] },
};
// Upgrades: ranked I / II (II needs I). 8 for the Knight (the thin-hero rule, Daniel Q8 "thin heroes 10 vs 8" read: the priority five get 10).
// 'what' is [rank I text, rank II text].
export const KNIGHT_UPGRADES = [
  { id: 'ukeep', name: 'IRON LINKS', what: ['THE CHAIN HOLDS 1.5 S LONGER IDLE', 'AND A TURNED BLOW KEEPS IT 5 S, NOT 3'] },
  { id: 'utime', name: 'SHIELD TIMING', what: ['THE PERFECT GUARD WINDOW +0.03 S', 'AND +0.06 S IN ALL'] },
  { id: 'uwind', name: 'SECOND WIND', what: ['A FLASK GIVES A LINK WHEN YOU HAVE NONE', 'AND KEEPS THE CHAIN 6 S'] },
  { id: 'usunder', name: 'DEEP SUNDER', what: ['THE SUNDERED BLOW LANDS 15% HARDER', 'AND 30% HARDER'] },
  { id: 'ucalm', name: 'WHIRLWIND CALM', what: ['WHIRLWIND WAITS 0.5 S LESS', 'AND 1 S LESS'] },
  { id: 'uthrow', name: 'SHIELD THROW+', what: ['THE THROWN SHIELD HITS 20% HARDER', 'AND 40% HARDER'] },
  { id: 'urise', name: 'RISING CUT+', what: ['THE RISING CUT HITS 20% HARDER', 'AND 40% HARDER'] },
  { id: 'ustam', name: 'GUARD STAMINA', what: ['BLOCKS COST 15% LESS', 'AND 25% LESS'] },
];
