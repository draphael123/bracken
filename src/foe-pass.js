// src/foe-pass.js - THE FOE PASS: WHERE ITS LEVERS ARE LIVE (claude/foepass, the ONE OPUS CORE lane; scratch/brief-foepass-1016.md).
//
// Daniel 10-16: "you can just largely ignore them, particularly in later levels." The core built the levers; THIS TABLE says which levels
// stand them. The act sweep lanes (sonnet, one per act) add their levels here as they place route-holding squads and re-stamp the level's
// mash / pilot / walker rows - so a level's numbers never move without its own lane measuring it.
//   pursue   LEVER 1: hounds, bandits and knights PURSUE a hero who runs past (src/foe-pursuit.js), on a leash, never for ever
//   lead     LEVER 1: archers LEAD their shots (where you are going, not where you were)
//   affix    LEVER 3: AFFIXES from act II (src/foe-affix.js) at the act's density (AFFIX_ACT), or this level's own share
// GLOBAL (every level, not in this table): the break bar's varied / stale fill and the finisher's refund (src/foe-break.js), every family's
// told attack (src/told-attacks.js), squad roles (src/foe-pursuit.js assignRoles), the Death Knight's ward-release parry read.
// tools/foe-pass.mjs checks this table: every id is a campaign level, no affix in act I, the density never falls along the acts.

export const FOEPASS = {
  /* THE FIRST APPLICATION (the core lane): two act I levels with the pursuit and the lead, two act II levels with the affixes too */
  marsh: { pursue: true, lead: true },
  stockade: { pursue: true, lead: true },
  moor: { pursue: true, lead: true, affix: true },
  oreroad: { pursue: true, lead: true, affix: true },
  /* THE ACT I-II SWEEP (claude/sweepact12, 10-20): every other act I-II level goes live - the Lumber Trail (wood; reworked 10-20, Old Tusker) and the Marsh (Marsh 3) left to their own later pass */
  spore: { pursue: true, lead: true },
  rootway: { pursue: true, lead: true },
  burning: { lead: true },   /* (NO pursuit: the walker read 5.5 / 2.5 / 5.0 deaths a hero with it, 4.5 / 1.5 / 2.5 without, base 2.5 / 2.5 / 3.0 - a village on fire; act I wants 0.5-1.5) */
  kings: { pursue: true },   /* (no archer lead: the level-1 pilot lost 4 deaths a 3-run row with it, act I wants <= 3) */
  underleaf: { pursue: true, lead: true },
  scree: { pursue: true, lead: true, affix: 0.1 },   /* (0.1 not 0.15: the pilot read 9 deaths / 412% once and 4-7 deaths twice - a wall at the act's ceiling) */
  hanging: { pursue: true, lead: true, affix: true },
  spire: { pursue: true, lead: true, affix: true },
  skyroad: { pursue: true, lead: true, affix: true },
  minecart: { pursue: true, lead: true, affix: true },
  storm: { pursue: true, lead: true, affix: true },
  crown: { pursue: true, lead: true, affix: 0.1 },   /* (0.1 not 0.15: 5-10 deaths / 399-541% across three pilots - the act II ceiling is 400%) */
  undercrown: { pursue: true, lead: true, affix: true },
};
/* THE AFFIX DENSITY BY ACT: the share of a level's eligible common foes that carry one (never more than one each). Act I none: "from act 2". */
export const AFFIX_ACT = { 1: 0, 2: 0.15, 3: 0.2, 4: 0.25, 5: 0.3 };
export const live = (id, lever) => { const r = FOEPASS[id]; return !!(r && r[lever]); };
/* the share for level id in act `act`, x the difficulty mode's 'affix' (src/difficulty.js: Very Easy x0.5, Normal x1, Master x1.5) */
export const densityOf = (id, act, mul = 1) => { const r = FOEPASS[id]; if (!r || !r.affix || !(act >= 2)) return 0;
  const d = typeof r.affix === 'number' ? r.affix : (AFFIX_ACT[act] || 0); return Math.max(0, Math.min(0.6, d * mul)); };
