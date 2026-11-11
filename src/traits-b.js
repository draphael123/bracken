// src/traits-b.js - TRAITDATA-B: the CORE / TRAITS split rows for PYROMANCER (pyro), FREEBOOTER (pirate), BLOOD KNIGHT (reaper), BERSERKER (claude/traitdata-b,
// docs: scratch/lane-reports/passiveplan.md sec 2). Pure data; src/traits.js merges it into TRAIT_SPLIT (Object.assign), so TRAITDATA-A's rows never share a line with these.
// Dark behind TRAITS_SHIP like everything in traits.js. Every catalog passive of each hero is listed once (tools/traits.mjs fails on an unlisted id: unlisted = a CUT).
//   learnAt: every slottable trait arrives by L18 (spread L2..18 in today's order, the slot-1 DEFAULT first so it exists from L2 and every default by L10); core keeps its catalog level.
//   names:   card names that differ from the catalog (shown only while the flag is on).   tags: a requirement shown on the row ('NEEDS THE JET' / 'NEEDS BLOODWORMS'; display hook owed to the menu lane).
export const TRAIT_SPLIT_B = {
  pyro: {   /* identity: heat, stand in fire */
    core: ['pilot', 'conflagration', 'smoulder', 'kindle', 'backdraft'],
    traits: ['emberSkin', 'heatShield', 'brand', 'emberHeart', 'wildfire', 'phoenix', 'longFlame', 'jetWalk', 'scatter', 'twin'],
    merged: { phoenix: ['phoenixTrail'], longFlame: ['searing', 'sunder'], jetWalk: ['updraft'], scatter: ['skip'], twin: ['stoke'] },
    folded: { blaze: 'sig:WHITE HEAT', inferno: 'sig:BELLOWED' },   /* the L43 heat-bar fork absorbs them: slottable traits until FORKS_SHIP is on */
    foldRetire: true,   /* (claude/forkmerge) blaze / inferno retire through the one foldGone hook (src/traits.js) while FORKS_SHIP is on */
    retired: [],
    shared: [],
    defaults: ['emberSkin', 'phoenix'],   /* (claude/traittune-d) was ['emberSkin', 'heatShield']: TRAITS ON cost the bot pyro 11/12 -> 3/12 at THE DROWNED CAUSEWAY (practiced, L29); a revive in slot 2 gets 8/12 (heatShield+phoenix 10/12) */
    learnAt: { emberSkin: 2, longFlame: 3, twin: 4, scatter: 5, heatShield: 6, brand: 8, jetWalk: 10, blaze: 12, emberHeart: 14, phoenix: 10, wildfire: 17, inferno: 18 },
    tags: { longFlame: 'JET', jetWalk: 'JET', scatter: 'EMBER', twin: 'EMBER' },
    names: { sunder: 'SCORCHED EARTH' },
  },
  pirate: {   /* identity: run of five, pistol, purse */
    core: ['cutthroat', 'haulCut', 'quickHands', 'deepPockets', 'greased'],
    traits: ['longBarrel', 'powderBurn', 'looter', 'shareOut', 'deadEye', 'ransom', 'pieces', 'runThrough', 'secondBarrel', 'hotBarrel'],
    merged: {},
    folded: { longLine: 'hook:LONG LINE', turncoat: 'block:TURNCOAT B', parryCut: 'block:SLIPKNOT A', noQuarter: 'spender:FULL PURSE' },
    foldRetire: true,   /* (claude/forkmerge) the four folded ids retire through the one foldGone hook while FORKS_SHIP is on */
    retired: [],
    shared: ['swash'],   /* SWASHBUCKLE -> the shared AIR ROLL (SHARED lane: add pirate:'swash' to the airRoll legacy row and make the roll hero-agnostic) */
    cut: ['sunder', 'rollCut', 'paidInGold'],   /* HOLED (2nd mark), TUMBLING CUT (dash-strike spam), PAID IN GOLD (gold skips cooldowns): deliberate cuts, off while the flag is on */
    defaults: ['longBarrel', 'secondBarrel'],
    learnAt: { longBarrel: 2, longLine: 3, powderBurn: 4, looter: 5, shareOut: 6, secondBarrel: 7, turncoat: 8, deadEye: 9, ransom: 10, pieces: 12, runThrough: 14, noQuarter: 15, hotBarrel: 16, parryCut: 18 },
  },
  reaper: {   /* identity: pay back the ledger */
    core: ['longHaft', 'drainWalk', 'wardPull', 'bloodMark', 'rend'],
    traits: ['gleaner', 'press', 'secondDeath', 'longPassing', 'fullCircle', 'dueRites', 'deepRed', 'coldComfort', 'gripAll'],
    merged: { gleaner: ['ossuary'], secondDeath: ['graveProvides'] },
    folded: { overflow: 'ward:DEEP WARD' },
    foldRetire: true,   /* (claude/bkfork) OVERFLOW retires as a slottable trait while FORKS_SHIP is on: it lives on as the L27 ward fork side B (DEEP WARD); flag off it stays slottable */
    retired: [],
    shared: ['winnow'],   /* WINNOWED -> the shared EXECUTIONER (its legacy row already names reaper:'winnow') */
    cut: ['sunder', 'lastRites'],   /* LAID OPEN (2nd mark): a deliberate cut; LAST RITES (claude/repoint, Daniel 11-10 Q10): it boosted the old surge / lastHarvest, dead since CRIMSON FRENZY and gone with it - cut with the Frenzy by the rework */
    defaults: ['deepRed', 'longPassing'],
    learnAt: { deepRed: 2, gleaner: 3, press: 5, longPassing: 6, fullCircle: 8, dueRites: 10, coldComfort: 14, secondDeath: 16, gripAll: 17, overflow: 18 },
    tags: { gleaner: 'BLOODWORMS', press: 'BLOODWORMS', secondDeath: 'BLOODWORMS' },
  },
  berserker: {   /* identity: momentum costs */
    core: ['bzBite', 'bzCool', 'bzReturn', 'bzChain', 'bzUnflinch'],
    traits: ['bzLong', 'bzBraceLong', 'bzBraceBack', 'bzHot', 'bzScar', 'bzWide', 'bzPrice', 'bzIronBrace', 'bzHaft', 'bzUnbowed'],
    merged: { bzLong: ['bzMist'], bzHot: ['bzBurn'], bzWide: ['bzSpinChop'], bzHaft: ['bzStagger'] },
    folded: { bzHide: 'spender:SHORT FUSE', bzSplit: 'skill:bzCleave:OVERHEAD' },   /* (claude/bersfork) THICK HIDE is baked into the L36 SHORT FUSE side, SPLITTER into the L38 OVERHEAD side: slottable traits until FORKS_SHIP is on */
    foldRetire: true,   /* (claude/forkmerge) bzHide / bzSplit retire through the one foldGone hook while FORKS_SHIP is on */
    retired: [],
    shared: [],
    defaults: ['bzHot', 'bzIronBrace'],
    learnAt: { bzHot: 2, bzLong: 3, bzBraceLong: 4, bzBraceBack: 5, bzScar: 6, bzIronBrace: 7, bzWide: 8, bzPrice: 10, bzHide: 12, bzHaft: 14, bzSplit: 16, bzUnbowed: 18 },
    names: { bzPrice: 'RED FEAST' },   /* BLOOD PRICE is the Blood Knight's skill */
  },
};
