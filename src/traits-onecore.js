// src/traits-onecore.js - ONE CORE PASSIVE PER HERO (claude/onecore-d; Daniel 11-11: "all passives being on is overpowered; a hero should have ONE passive by default,
// the others unlockable"). Pure data; src/traits.js reads it only while ONECORE is on (setOnecoreShip / ?onecore=on / tools BOSS_ONECORE=on).
//
// With ONECORE on, a hero's split row (TRAIT_SPLIT in traits.js / traits-b.js) is replaced by a DERIVED row (traits.js oneCoreRow):
//   core     = [ONECORE[h].core]                      the one passive that is always on (at its catalog level, as core always was)
//   traits   = the row's traits + every OTHER former core id (they are LEARNED by level and WORN in a slot, like any trait)
//   learnAt  = the row's learnAt + a moved core's ONECORE[h].learnAt, else its catalog level capped at 18 (every trait reaches rank III by L20)
//   defaults = ONECORE[h].defaults ?? the row's defaults
// Slots are unchanged (1, a 2nd at L20). The PALADIN has no split on master (paladin: null): ONECORE gives him a full row here (PALADIN_BASE), built on master's
// Paladin catalog ids and the shape of claude/palfork's src/traits-paladin.js (merged SHOCKWAVE; fork-folded ids kept slottable; FORTRESS kept as a trait, NOT cut).
// OFF (the shipped value) = nothing here is read: the game is master byte-for-byte.
// RANK NOTE: a moved core shows I/II/III like any trait, but its effect site in main.js does not multiply by trk() (core never scaled), so it acts at full value at every
// rank. Wiring rank into those ~40 effect sites is a tuning job, left for after Daniel approves the picks.
export const ONECORE_SHIP = false;

export const ONECORE = {
  knight:    { core: 'thirdCut' },     /* the run of three ending in a heavy third: the tutorial's first lesson ("THREE BLOWS IN A RUN: A HEAVY THIRD") */
  warden:    { core: 'keenPoint' },    /* reach is the verb: the tip band is what makes her poke a warden's poke */
  ranger:    { core: 'rgFletch' },     /* the quiver refill (5 s, not 11): without it the bow button runs dry and reads broken */
  geomancer: { core: 'geoTall' },      /* her step is the map: HIGHER GROUND from L1 */
  pyro:      { core: 'kindle' },       /* stand in fire: without it his own fire burns him */
  pirate:    { core: 'cutthroat' },    /* the run of five: the fifth blow is the pirate's whole melee */
  reaper:    { core: 'longHaft' },     /* the scythe's reach: without it the rhythm and heavy reach most of a tile short */
  berserker: { core: 'bzReturn' },     /* UP+C again calls the axe home: without it the second press of the throw does nothing */
  paladin:   { core: 'unwavering' },   /* the aegis holds while the wind lasts: without it the block drops after a breath and a half with the button still held */
};

/* THE PALADIN'S ROW under ONECORE (master has none). Every catalog passive of his is listed once. Its core is claude/palfork's five; ONECORE derives the one-core row from it like every hero. */
export const PALADIN_BASE = {
  core: ['consecrate', 'unwavering', 'reflect', 'mercy', 'wrath'],   /* palfork's five; ONECORE keeps UNWAVERING and moves the other four into traits (learnAt below) */
  traits: ['litany', 'sanctuary', 'shockwave', 'smite', 'beacon', 'retribution', 'crusade', 'earthshaker', 'martyr', 'doubleJudge', 'fortress'],
  merged: { shockwave: ['sunder', 'aftershock'] },   /* (as palfork) the overhead's SHATTER and the third blow's AFTERSHOCK ride SHOCKWAVE */
  folded: { warded: 'dash:SUNSTEP', heavyTread: 'dash:SUNSTEP', blessedHammer: 'hammer:HOMECOMING', concuss: 'chain:SHIELD BASH', zeal: 'spender:ZEAL' },   /* (as palfork) slottable until the forks ship */
  retired: [],
  shared: [],
  defaults: ['litany', 'sanctuary'],   /* (as palfork) the holy circle mends twice as fast; the held aegis mends */
  learnAt: { litany: 2, sanctuary: 3, reflect: 4, warded: 4, mercy: 5, shockwave: 5, heavyTread: 6, consecrate: 7, smite: 7, blessedHammer: 8, beacon: 9, retribution: 11, concuss: 12,
    crusade: 13, zeal: 14, earthshaker: 15, martyr: 17, wrath: 18, doubleJudge: 18, fortress: 18 },
};
