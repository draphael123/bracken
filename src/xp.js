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

/* THE CURVE TO FIFTY (LEVELING, Daniel 2026-10-03, scratch audit-econ sec.7A). 325*n^1.455 was fitted on ~28 woods and the nine newest
   pay well under a step, so from wood ~20 a straight run fell 3-5 levels behind and only catch-up x3 carried it. 400*n^1.365 keeps L10 where
   it was (9,270) and only LOWERS every threshold above it (L24 30.6k, L32 45.4k, L50 83.4k): no save loses a level or an unlock. */
export const XP_C = 400, XP_P = 1.365;     /* the XP floor of level n is XP_C * n^XP_P, to the nearest ten (node tools/xp.mjs --fit) */
export const LV_TOP = 99;                  /* the loop's stop */
export const LV_MAX = 50;                  /* THE LAST LEVEL: XP stops at xpFloor(LV_MAX) (gainXp clamps there; xpCap below) */

export const eliteMul = el => el ? (XP_ELITE[el] !== undefined ? XP_ELITE[el] : XP_ELITE.default) : 1;
/* XP-ONLY WEIGHTS AND TIERS (LEVELING, audit-econ sec.2 bugs). THREAT and TIER are combat tables too (TIER scales foe health and blows in
   main.js), so the three woods with no TIER (canal, theatre, fair: their bosses paid the tier-0 purse, 150 against 470-525 next door) and the
   placed foes weighed 0 for attention (the moor's hares, the theatre's brute and harlequin) are paid HERE without changing a fight. */
export const XP_THREAT = { hare: 2, marionette: 2, harlequin: 2.5 };
export const XP_TIER = { canal: 2.0, theatre: 2.0, fair: 2.2 };
export const xpTier = (id, tier) => XP_TIER[id] !== undefined ? XP_TIER[id] : (tier || 0);
/* what one foe pays: role is 'boss', 'mini' or '' (see spawnEnt's tail in src/main.js), tier the level's TIER (xpTier) */
export function xpFoe(t, role, tier, elite) {
  if (role === 'boss') return Math.round(XP_BOSS * (1 + (tier || 0)));
  if (role === 'mini') return Math.round(XP_MINI * (1 + (tier || 0)));
  const w = XP_THREAT[t] !== undefined ? XP_THREAT[t] : THREAT[t]; if (!(w > 0)) return 0;
  return Math.max(1, Math.round(XP_PER_THREAT * w)) * eliteMul(elite);
}
/* BELOW TEN THE OLD CURVE IS THE LOWER ONE (the two cross at L10: 325*n^1.455 is 3,380 at L5 where 400*n^1.365 is 3,600), so the floor is the
   lower of the two: no threshold ever RISES, the first ten woods keep the fit the audit found exact, and from L10 up it is the new curve. */
export const XP_C0 = 325, XP_P0 = 1.455;
export const xpFloor = n => n <= 0 ? 0 : Math.min(Math.round(XP_C * Math.pow(n, XP_P) / 10), Math.round(XP_C0 * Math.pow(n, XP_P0) / 10)) * 10;
export function levelOfXp(xp) { let n = 0; while (n < LV_TOP && xpFloor(n + 1) <= (xp || 0)) n++; return n; }
export const xpCap = () => xpFloor(LV_MAX);

/* THE SOFT CAP (LEVELING, Daniel 2026-10-03). Keyed to the wood's expected level E (its depth on the gate chain + 1: a hero who has finished
   it should read E): a hero at E+2 or under is paid in full, E+3..E+5 half, E+6 and over a fifth. It stacks with XP_AGAIN (a finished wood's
   replay is a fifth of a fifth over-levelled), and catch-up (below the curve) never meets it. So nobody out-levels the late arcs farming
   Bracken Wood, and a second hero still catches up fast. */
export const SOFT_CAP = [[2, 1], [5, 0.5], [Infinity, 0.2]];
export function softCapMul(level, depth) { const over = (level || 0) - ((depth || 0) + 1); for (const [k, m] of SOFT_CAP) if (over <= k) return m; return 0.2; }
export function xpSoftCap(n, level, depth) { if (!(n > 0)) return 0; return Math.max(1, Math.round(n * softCapMul(level, depth))); }

/* CATCH-UP (Daniel, 2026-09-24). A hero BELOW the level the wood expects (its depth on the gate chain, src/campaign-order.js
   depthsOf: the curve above is fitted so level = levels finished) is paid XP_CATCHUP times what a kill, a share or a quest pays,
   so a Pyromancer or a Death Knight bought mid-campaign walks up to the others instead of starting every wood outmatched. The
   extra STOPS AT THE CURVE: it never takes him past the floor of the expected level, and a hero at or above it is paid exactly n.
   So nothing new is farmable: XP_AGAIN still cuts a second kill to a fifth before this sees it, and the most a catching-up hero
   can ever gain from the multiplier is the gap he is catching up. */
export const XP_CATCHUP = 3;
export function xpCatchUp(n, xp, expected) { if (!(n > 0)) return 0; const gap = xpFloor(expected || 0) - (xp || 0);
  return gap > 0 ? n + Math.min(n * (XP_CATCHUP - 1), gap) : n; }
