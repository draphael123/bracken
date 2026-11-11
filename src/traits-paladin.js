// src/traits-paladin.js - THE PALADIN'S CORE / TRAITS SPLIT ROW (claude/palfork; passiveplan sec 2 PALADIN first cut, sec 7 row 8). Pure data; src/traits.js merges it into TRAIT_SPLIT.
// Dark behind TRAITS_SHIP like every row. Every catalog passive of his is listed once: 5 CORE, 10 TRAITS (+ sunder, aftershock merged into SHOCKWAVE), 5 FOLDED into fork sides, 1 CUT.
// THE FOLD RULE, made flag-aware: a folded id stays a SLOTTABLE trait until its fork side ships, then it is retired. The sides ship with FORKS_SHIP, so `retired` / `folded` are getters: with FORKS_SHIP
// off (TRAITS on alone, the playtest window) the five are still ordinary slottable traits; with it on they are retired because their effect now rides the side that absorbed them:
//   warded + heavyTread -> L21 SUNSTEP (A)   blessedHammer -> L22 HOMECOMING (B)   concuss -> L24 SHIELD BASH (B)   zeal -> L36 ZEAL (A)
//   fortress CUT always (walking aegis = the Knight's SHIELD ADVANCE; forkplan Q5). `names` cover the card names.
const FOLDED = { warded: 'dash:SUNSTEP', heavyTread: 'dash:SUNSTEP', blessedHammer: 'hammer:HOMECOMING', concuss: 'chain:SHIELD BASH', zeal: 'spender:ZEAL' };
export const PALADIN_FOLDED_IDS = Object.keys(FOLDED);
export const TRAIT_SPLIT_PALADIN = {
  paladin: {   /* identity: conviction earned by standing in front */
    core: ['consecrate', 'unwavering', 'reflect', 'mercy', 'wrath'],
    traits: ['litany', 'shockwave', 'smite', 'beacon', 'retribution', 'crusade', 'earthshaker', 'martyr', 'sanctuary', 'doubleJudge'],
    merged: { shockwave: ['sunder', 'aftershock'] },   /* the overhead's SHATTER and the third blow's AFTERSHOCK ride the host: on exactly when SHOCKWAVE is worn */
    folded: FOLDED,
    foldRetire: true,   /* (claude/forkmerge) the ONE flag-aware hook (foldGone, src/traits.js): FORKS_SHIP on retires the five folded ids, off keeps them slottable */
    retired: ['fortress'],
    shared: [],
    coreAt: { wrath: 19 },   /* WRATH L21 -> L19 (passiveplan: core must be on by L20; src/traits.js coreLevel) */
    defaults: ['litany', 'sanctuary'],
    /* today's order spread to L18, the DEFAULT pair first so both exist early; core keeps its catalog level except coreAt (WRATH L19) */
    learnAt: { litany: 2, sanctuary: 3, shockwave: 5, smite: 7, beacon: 9, retribution: 11, crusade: 13, earthshaker: 15, martyr: 17, doubleJudge: 18, warded: 4, heavyTread: 6, blessedHammer: 8, concuss: 12, zeal: 14 },
  },
};
