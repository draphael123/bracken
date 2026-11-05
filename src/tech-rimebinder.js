// src/tech-rimebinder.js - THE RIMEBINDER'S L25-L50 KIT (claude/rimebinder 11-05): six tech levels and eight ranked upgrades, in the FORK shape of
// claude/kfork / claude/ltfork (L30, L40 and L50 are PICK ONE OF TWO: {fork: [A, B]}, A the RECOMMENDED, both share `trade`, distinct `role`, the L50 pair
// `capstone`). Pure data (progression.js imports it; main.js reads the numbers through tech() / upg() and src/rimebinder.js).
// Every number is swordDmg x k x amul (the late-game law): k is the multiplier, never a flat hit.
//   input  where the player does it      k  damage multiplier (null: none)      cd / cost  seconds / stamina      teach  the unlock banner's one line
// UNTIL claude/kfork MERGES master's card reads one technique a level (no `fork`): progression.js takes flatTech(RIME_TECH) - each fork's option A, so
// nothing on master meets a {fork} it cannot read. When kfork merges, that one line becomes RIME_TECH.
export const RIME_TECH = {
  25: { id: 'rmbrittle', name: 'BRITTLE BLOW', input: 'X (THE STAFF) ON A FROZEN FOE', k: 2.0, cd: 0, cost: 0,
    what: 'THE STAFF ON A FROZEN FOE SHATTERS ITS ICE: A HEAVY BLOW, AND A CORPSE IF IT DIES',
    teach: 'STRIKE A FROZEN FOE WITH THE STAFF: THE ICE BREAKS FOR TWICE THE BLOW, AND WHAT DIES OF IT LIES AS A RIME CORPSE' },
  30: { fork: [
    { role: 'host', trade: 'THE HOST OR THE STORM', id: 'rmwarden', name: 'COLD WARDEN', input: 'UP+C (RAISE)', k: null, cd: 0, cost: 0,
      what: 'A RAISED THRALL STANDS BETWEEN YOU AND THE NEAREST FOE: IT TAKES SHOTS MEANT FOR YOU',
      teach: 'YOUR THRALLS NOW KEEP CLOSE AND STOP THE SHOTS THAT CROSS THEM. THEY MELT A LITTLE FASTER FOR IT' },
    { role: 'storm', trade: 'THE HOST OR THE STORM', id: 'rmsleet', name: 'SLEET', input: 'HOLD X TO T2', k: 0.4, cd: 0, cost: 0,
      what: 'A PIERCING LANCE LEAVES A STRIP OF SLEET BEHIND IT THAT CHILLS WHAT WALKS IN IT',
      teach: 'A T2 OR T3 LANCE NOW DRAGS A STRIP OF SLEET ALONG THE FLOOR UNDER ITS FLIGHT: THREE SECONDS OF COLD' } ] },
  35: { id: 'rmhoarfrost', name: 'HOARFROST', input: 'DOWN+C (SHATTER)', k: 1.4, cd: 0, cost: 0,
    what: 'A SHATTER THROWS SHARDS THAT RIME WHAT THEY KILL: ONE CORPSE CAN MAKE TWO',
    teach: 'SHATTER A CORPSE: ITS SHARDS NOW FLY FURTHER, AND A FOE THEY KILL LIES AS A NEW RIME CORPSE' },
  40: { fork: [
    { role: 'host', trade: 'KEEP THEM OR SPEND THEM', id: 'rmbound', name: 'BOUND IN ICE', input: 'UP+C ON A THRALL', k: null, cd: 0, cost: 0,
      what: 'RAISE AGAIN ON YOUR OWN THRALL: IT IS MADE WHOLE AND STANDS TEN SECONDS MORE',
      teach: 'UP+C BESIDE YOUR THRALL WITH A THIRD OF THE BAR: IT IS REFROZEN WHOLE AND STANDS ANOTHER TEN SECONDS' },
    { role: 'burst', trade: 'KEEP THEM OR SPEND THEM', id: 'rmcorpsebomb', name: 'GRAVE CHARGE', input: 'DOWN+C ON A THRALL', k: 2.2, cd: 0, cost: 0,
      what: 'SHATTER YOUR OWN THRALL FOR A BURST TWICE AS WIDE AND HARD AS A CORPSE',
      teach: 'DOWN+C BESIDE YOUR THRALL: IT GOES UP AS A GRAVE CHARGE, TWICE THE BURST OF A CORPSE, AND EVERYTHING IN IT IS CHILLED TO THE FULL' } ] },
  45: { id: 'rmwhiteout', name: 'WHITEOUT', input: 'DODGE (THE MIST STEP)', k: null, cd: 12, cost: 8,
    what: 'A MIST STEP THROUGH A FOE HIDES YOU: FOES LOSE YOU FOR A BEAT AND YOUR NEXT BOLT IS A LANCE',
    teach: 'MIST-STEP THROUGH A FOE: THE MIST HIDES YOU A MOMENT, AND THE NEXT TAP OF X LOOSES A FULL LANCE. TWELVE SECONDS TO DO IT AGAIN' },
  50: { fork: [
    { role: 'host', trade: 'THE COURT OR THE WINTER', capstone: true, id: 'rmcourt', name: 'THE FROZEN COURT', input: 'UP+C AT A FULL BAR', k: 1.6, cd: 0, cost: 0,
      what: 'THE LONG WINTER RAISES WHAT IT KILLS: EVERY FOE IT FELLS STANDS UP AS A THRALL (STILL TWO AT ONCE)',
      teach: 'THE LONG WINTER NOW RAISES WHAT IT KILLS, WHOLE. THE CAP OF TWO HOLDS: THE OLDEST MELTS' },
    { role: 'storm', trade: 'THE COURT OR THE WINTER', capstone: true, id: 'rmglaciate', name: 'GLACIATE', input: 'UP+C AT A FULL BAR', k: 2.4, cd: 0, cost: 0,
      what: 'THE LONG WINTER BECOMES A WALL OF ICE THAT ROLLS THE LENGTH OF THE ROOM, FREEZING THE WEAK IT CROSSES',
      teach: 'UP+C AT A FULL BAR NOW SENDS A GLACIER DOWN THE ROOM: EVERY WEAK FOE IT CROSSES IS FROZEN, THE BIG ONES CHILLED AND STRUCK' } ] },
};
// Upgrades: ranked I / II (II needs I). Eight (the thin-hero rule): 'what' is [rank I text, rank II text].
export const RIME_UPGRADES = [
  { id: 'urmbolt', name: 'COLDER BOLT', what: ['THE FROST BOLT CHILLS 15% MORE', 'AND 30% MORE'] },
  { id: 'urmlance', name: 'QUICK LANCE', what: ['THE LANCE TIERS COME 0.05 S SOONER', 'AND 0.1 S SOONER'] },
  { id: 'urmthrall', name: 'HARDER THRALLS', what: ['THRALLS STRIKE 15% HARDER', 'AND 30% HARDER'] },
  { id: 'urmlife', name: 'DEEP FREEZE', what: ['THRALLS STAND 2 S LONGER', 'AND 4 S LONGER'] },
  { id: 'urmshatter', name: 'WIDE SHATTER', what: ['THE SHATTER IS 15% WIDER', 'AND 30% WIDER'] },
  { id: 'urmwall', name: 'THICK WALL', what: ['THE ICE WALL COSTS 15% LESS WIND', 'AND 25% LESS'] },
  { id: 'urmparry', name: 'COLD BEAT', what: ['THE PARRY WINDOW +0.03 S', 'AND +0.06 S IN ALL'] },
  { id: 'urmbar', name: 'GRAVE HUNGER', what: ['THE RIME BAR FILLS 10% FASTER', 'AND 20% FASTER'] },
];
/* each fork's option A: the master-safe shape until claude/kfork's fork card merges */
export const flatTech = tech => Object.fromEntries(Object.entries(tech).map(([lv, t]) => [lv, t.fork ? t.fork[0] : t]));
