// src/xp.js — WHAT A KILL IS WORTH, AND HOW MUCH OF IT MAKES A LEVEL.
//
// The hero's level was the number of woods he had walked: a point a wood, and nothing a fight could add to it. It
// comes from XP now. A foe pays by its weight in the THREAT table (src/threat.js - how much attention it takes, the
// one table, weighed once); a mini and a boss pay a purse of their own that grows with how far up the slope the
// level sits; the first time a hero finishes a wood he is paid a share of what the wood holds, and the first time
// he brings its quest home, a little more.
//
// THE CURVE IS FITTED, NOT GUESSED. `BK.xpSim()` (tools/xp.mjs) walks the campaign in order, sums what a player who
// kills four foes in five pays in every stage, and prints the level he stands at against the level the old count
// gave him. XP_C and XP_P below are the power law fitted to that walk: a straight run lands within one of the old
// level at every stage, and a full clear (every foe, every quest, both secret woods) runs one to three ahead late.
// If a wood is added, run the sim; if the run drifts past one level, refit these two numbers and nothing else.
//
// Nothing here can be farmed. A foe put back by a death, a shrine or a second walk of a finished wood pays a fifth
// (XP_AGAIN); anything summoned in a fight (a brood, a court, the pieces of a suit) pays nothing, because nothing
// placed it; and the boss rush, the trials, the practice yard and the store pay nothing at all.
import { THREAT } from './threat.js';

export const XP_PER_THREAT = 4;            /* a sprig is 4, a brute 14, a troll 16 */
export const XP_BOSS = 150, XP_MINI = 60;  /* times (1 + the level's TIER): the Hornet Queen is 150, the Archmage 503 */
export const XP_CLEAR = 0.6;               /* the first time a hero finishes a wood: this share of the XP its foes hold */
export const XP_QUEST = 0.05;              /* the first time he brings its quest home */
export const XP_AGAIN = 0.2;               /* a foe he has already put down once in this wood, or any foe in a wood he has finished */
/* THE ELITE HOOK. An elite (e.elite, when the elite pass lands) pays this many times its kind; keyed by the value of e.elite, with
   `default` for any elite the table does not name. A boss or a mini is never an elite: its purse is its own. */
export const XP_ELITE = { default: 5 };
export const XP_KILL_NORMAL = 0.8;         /* what the sim takes a straight run to kill of what a wood holds */

export const XP_C = 325, XP_P = 1.45;      /* the XP floor of level n is XP_C * n^XP_P, to the nearest ten (node tools/xp.mjs --fit) */
export const LV_TOP = 99;                  /* the loop's stop, not a cap: talent points stop at thirty and growth at twenty-four, as before */

export const eliteMul = el => el ? (XP_ELITE[el] !== undefined ? XP_ELITE[el] : XP_ELITE.default) : 1;
/* what one foe pays: role is 'boss', 'mini' or '' (see spawnEnt's tail in src/main.js), tier the level's TIER */
export function xpFoe(t, role, tier, elite) {
  if (role === 'boss') return Math.round(XP_BOSS * (1 + (tier || 0)));
  if (role === 'mini') return Math.round(XP_MINI * (1 + (tier || 0)));
  const w = THREAT[t]; if (!(w > 0)) return 0;
  return Math.max(1, Math.round(XP_PER_THREAT * w)) * eliteMul(elite);
}
export const xpFloor = n => n <= 0 ? 0 : Math.round(XP_C * Math.pow(n, XP_P) / 10) * 10;
export function levelOfXp(xp) { let n = 0; while (n < LV_TOP && xpFloor(n + 1) <= (xp || 0)) n++; return n; }
