// src/forks-knight.js - THE KNIGHT'S A/B FORKS THAT ALREADY HAVE EFFECT CODE (claude/forkframe; forkplan sec 4 KNIGHT table). Pure data, read by src/forks.js.
// Four of the eleven rungs are built from code that exists on master / claude/kfork: BLOCK (L27), HEAVY (L32), SPENDER (L36), CAPSTONE (L50). The other seven
// (dash L21, shield throw L22, chain L24, rising cut L29, ground slam L38, plunge L43, ironclad L48) are the KNIGHTFORK lane's (forkplan lane 2): until it writes them
// those levels are plain levels (stat card + milestone perk).
//   side id  what main.js asks: tech('klong') etc. while FORKS_SHIP is on (src/forks.js legacyTech answers from the pick). 'kironlinks' answers upg('ukeep') / upg('uwind').
// Dropped from claude/kfork: the L30/L40/L50 pair DATA (superseded by this ladder; the pair-card machinery in progression.js stays as dormant generic code), SHIELD HOOK (parked:
// forkplan Q4, SHIELD THROW B is TWIN SHIELDS), COUNTER-THRUST (riposte is CORE since RECS158-d, so block A is LONG GUARD alone).
// Boss law holds for every side: damage and guard breaks on bosses stay as the effect code has them (no pins, no new mitigation).
import { KNIGHT_RUNG_FORKS, KNIGHT_TRAIT_FORKS } from './forks-knight-rungs.js';   /* (claude/knightfork) the other seven rungs and the ten trait pairs */
export const KNIGHT_FORKS = {
  block: { slot: 'block', ability: 'block', name: 'THE SHIELD UP', trade: 'TURN IT OR MARCH',
    A: { id: 'klong', name: 'LONG GUARD', input: 'PERFECT GUARD A SHOT',
      what: 'A SHOT YOU GUARD ON THE BEAT FLIES BACK HARDER AND MARKS THE SHOOTER',
      teach: 'RAISE THE SHIELD ON THE BEAT AS A SHOT ARRIVES: IT GOES BACK A HALF HARDER, AND THE ONE WHO FIRED IT TAKES YOUR NEXT BLOW 30% HARDER' },
    B: { id: 'kadvance', name: 'SHIELD ADVANCE', input: 'HOLD C, THEN WALK',
      what: 'MARCH WITH THE SHIELD UP: SMALL FOES ARE SHOVED AHEAD OF YOU',
      teach: 'HOLD C AND WALK: SLOW, THE SHIELD UP, SMALL FOES SHOVED BEFORE YOU. A PERFECT GUARD ON THE MARCH REELS WHAT HIT YOU' } },
  heavy: { slot: 'heavy', ability: 'heavy', name: 'THE HEAVY CUT', trade: 'FINISH IT OR OPEN IT',
    A: { id: 'kpunish', name: 'PUNISH', input: 'HOLD X ON A GUARD-BROKEN FOE',
      what: 'THE HEAVY CUT FALLS AT ONCE ON A FOE WHOSE GUARD IS BROKEN, AND LANDS HARDER',
      teach: 'A FOE WITH ITS GUARD BROKEN TAKES THE HEAVY CUT AT ONCE: PRESS X, NO HOLD, AND IT LANDS HARDER' },
    B: { id: 'klinkcut', name: 'LINK CUT', input: 'HOLD X WITH A LINK',
      what: 'SPEND ONE LINK: THE HEAVY CUT FALLS AT ONCE, BREAKS THE GUARD AND SHOVES THE FRONT MAN',
      teach: 'HOLD X WITH A LINK: THE HEAVY CUT FALLS A BEAT SOONER, BREAKS THE GUARD AND SHOVES THE MAN IN FRONT. IT COSTS ONE LINK' } },
  spender: { slot: 'spender', ability: 'links', name: 'THE LINKS', trade: 'HOLD THEM OR CALL THEM',
    A: { id: 'kironlinks', name: 'IRON LINKS', input: 'GUARD CHAIN',
      what: 'THE CHAIN HOLDS LONGER IDLE AND A FLASK GIVES YOU A LINK WHEN YOU HAVE NONE',
      teach: 'THE GUARD CHAIN HOLDS 1.5 S LONGER, A TURNED BLOW KEEPS IT 5 S, AND A FLASK GIVES A LINK WHEN YOU HAVE NONE' },
    B: { id: 'korders', name: 'RALLY ORDERS', input: 'HOLD C, THEN TAP X',
      what: 'A BRASS HORN: YOUR NEXT THREE CUTS, AND YOUR ALLIES\', BREAK POISE 30% FASTER',
      teach: 'HOLD C THEN TAP X: A BRASS HORN. THE NEXT THREE CUTS (YOURS AND YOUR ALLIES\') BREAK POISE 30% FASTER. EIGHTEEN SECONDS TO CALL IT AGAIN' } },
  ult: { slot: 'ult', ability: 'ult', capstone: true, name: 'SHIELD CHARGE', trade: 'CLOSE OR FAR',
    A: { id: 'kcharge2', name: 'LONG CHARGE', input: 'UP+C AT 3 LINKS',
      what: 'THE SHIELD CHARGE ENDS IN A SECOND, WIDER SLAM',
      teach: 'THE SHIELD CHARGE NOW CHAINS A SECOND SLAM, WIDER THAN THE FIRST, A BEAT AFTER IT' },
    B: { id: 'kwheel', name: 'BREAKING WHEEL', input: 'UP+C AT 3 LINKS',
      what: 'THE SHIELD IS HURLED DOWN THE ROOM THROUGH EVERY GUARD IT CROSSES, AND ROLLS HOME',
      teach: 'UP+C AT THREE LINKS NOW HURLS THE SHIELD THE LENGTH OF THE ROOM: EVERY GUARD IT CROSSES IS BROKEN, THE BIG ONES JUST TAKE THE BLOW. IT RETURNS TO YOUR HAND' } },
};
Object.assign(KNIGHT_FORKS, KNIGHT_RUNG_FORKS, KNIGHT_TRAIT_FORKS);   /* (claude/knightfork) all 11 rungs + 10 trait forks */
