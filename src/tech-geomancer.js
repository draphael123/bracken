// src/tech-geomancer.js - THE GEOMANCER'S L25-L50 KIT (claude/geopack, Daniel 11-04 11:19 + 11:24): three fixed techniques (L25, L35, L45) and three PICK-1-OF-2 forks
// (L30, L40, and the L50 CAPSTONE pair). Pure data (progression.js imports it; the effects live in src/geo-tech.js and are read through tech() / upg()).
// Her identity is "she moves the ground": stone and earth, terrain verbs, no fire and no blood. Her resource since claude/geoid is HER STONES (the board:
// three standing pieces, four with THE FOURTH STONE); the old TREMOR bar is gone, so the brief's TREMOR gates read as stones here:
//   SEISMIC WELL needs a bare floor (no stone of hers up: DOWN+C with a stone standing is DETONATE), both capstones SPEND THE BOARD through the one ultimate input (UP+C at
//   a full board, the chord MOUNTAIN COLLAPSE already uses). Pick a capstone and that chord fires it instead of MOUNTAIN COLLAPSE, on a 40 s cooldown.
// Every number is swordDmg x k (src/geo-tech.js dmg(); no flat damage). k below is the multiplier of ONE hit; `par` is the parity sheet tools/geo-tech.mjs reads.
//   input   where the player does it     k  damage multiplier (null: none)     cd / cost  seconds / stamina     teach  the line the card / banner says
export const GEO_TECH = {
  25: { id: 'gsling', name: 'SLINGSTONE', input: 'UP+C (BOARD NOT FULL)', role: 'offence', k: 1.3, cd: 3, cost: 20,
    what: 'TEAR A LOOSE STONE FROM THE FLOOR AND HURL IT IN AN ARC. IT PIERCES ONE FOE',
    teach: 'PRESS UP+C WITH THE BOARD NOT FULL: SHE TEARS UP A STONE AND SLINGS IT IN AN ARC THROUGH ONE FOE AND INTO THE NEXT. THREE SECONDS TO SLING AGAIN' },
  30: { fork: [
    { role: 'offence', trade: 'CRUSH OR CLIMB', id: 'gtopple', name: 'TOPPLE', input: 'THIRD CUT ON A STONE', k: 0.9, cd: 0, cost: 0,
      what: 'THE STONE FIST KNOCKS ONE OF YOUR STANDING PILLARS OVER: IT FALLS ALONG THE FLOOR AND CRUSHES WHAT IT LANDS ON',
      teach: 'LAND THE THIRD CUT ON ONE OF YOUR PILLARS: IT TOPPLES AWAY FROM YOU AS A SLAB, CRUSHING EVERYTHING IN ITS LINE AND HOLDING THE FIRST FOE UNDER IT A SECOND. THE STONE IS THE COST' },
    { role: 'mobility', trade: 'CRUSH OR CLIMB', id: 'gstep', name: 'STONE STEP', input: 'UP+C BESIDE A STONE', k: null, cd: 2, cost: 10,
      what: 'RISE ON ONE OF YOUR PILLARS AS IT GROWS TWO CELLS TALLER: A LEDGE IN ONE PRESS',
      teach: 'STAND BESIDE ONE OF YOUR PILLARS AND PRESS UP+C: IT GROWS TWO CELLS AND CARRIES YOU UP ON ITS TOP, UP TO A LEDGE. NO ROOM OVERHEAD, NO STEP' } ] },
  35: { id: 'gwell', name: 'SEISMIC WELL', input: 'DOWN+C, NO STONE UP', role: 'control', k: 0.6, cd: 14, cost: 0,
    what: 'A STONE SUMP: FOES INSIDE ARE SLOWED AND DRAWN TO ITS CENTRE, THEN IT POPS WITH A QUAKE. BOSSES ARE SLOWED, NEVER PULLED',
    teach: 'WITH NO STONE OF YOURS STANDING, PRESS DOWN+C: THE FLOOR AHEAD SINKS INTO A SUMP THAT SLOWS AND DRAWS FOES IN FOR A SECOND AND A HALF, THEN POPS. FOURTEEN SECONDS TO RAISE ANOTHER' },
  40: { fork: [
    { role: 'defence', trade: 'BURST OR MINES', id: 'gshatter', name: 'SHATTER RECALL', input: 'TAP DOWN, A FOE NEAR', k: 0.45, cd: 0, cost: 0,
      what: 'THE RECALL IS BIGGER: WITH A FOE NEAR, YOUR STONES BURST ON ARRIVAL AND THROW IT OFF YOU. THEY ARE SPENT',
      teach: 'TAP DOWN WITH A FOE NEAR: THE STONES COME TO YOUR FEET AND BURST ON ARRIVAL, KNOCKING DOWN WHAT IS AROUND YOU. A FOE TAKES AT MOST TWO BURSTS. WITH NOTHING NEAR, THEY RE-PLANT AS BEFORE' },
    { role: 'control', trade: 'BURST OR MINES', id: 'gcairn', name: 'CAIRN', input: 'A STONE OF YOURS IS BROKEN', k: 0.4, cd: 0, cost: 0,
      what: 'WHEN A FOE BREAKS ONE OF YOUR STONES IT LEAVES THREE GRAVEL MINES THAT BURST WHEN FOES PASS',
      teach: 'WHEN A FOE GNAWS OR RAMS ONE OF YOUR STONES TO RUBBLE IT LEAVES THREE HEAPS OF GRAVEL. THE NEXT FOE TO WALK OVER ONE SETS IT OFF. A FOE TAKES AT MOST TWO' } ] },
  45: { id: 'ggeode', name: 'GEODE', input: 'HOLD X PAST THE PILLAR TIER', role: 'offence', k: 2.0, cd: 0, cost: 38,
    what: 'A FULL HOLD ENCASES A FOE IN CRYSTAL THAT BURSTS A BEAT LATER. A BOSS IS NOT ENCASED: IT IS OPENED UP',
    teach: 'HOLD X PAST THE RISING PILLAR: THE FOE THE PILLAR FINDS IS CRYSTALLISED AND BURSTS ONE AND A HALF SECONDS LATER. A BOSS IS NEVER ENCASED: IT TAKES THE BURST AND IS OPENED UP' },
  50: { fork: [
    { role: 'wave', trade: 'FAULT OR HOST', capstone: true, id: 'gfault', name: 'THE GREAT FAULT', input: 'UP+C AT A FULL BOARD', k: 0.8, cd: 40, cost: 0,
      what: 'THREE WAVES RUN THE LENGTH OF THE SCREEN, EACH RAISING A ROCK SHELF. THE BOARD IS SPENT',
      teach: 'UP+C AT A FULL BOARD NOW OPENS THE GREAT FAULT INSTEAD OF THE MOUNTAIN COLLAPSE: THREE WAVES, A BEAT APART, EACH THROWING UP A SHELF YOU CAN STAND ON. FORTY SECONDS TO CALL IT AGAIN' },
    { role: 'host', trade: 'FAULT OR HOST', capstone: true, id: 'ghost', name: 'THE STONE HOST', input: 'UP+C AT A FULL BOARD', k: 0.2, cd: 40, cost: 0,
      what: 'EVERY STANDING STONE WAKES AS A GOLEM FOR TEN SECONDS AND CHARGES THE NEAREST FOE',
      teach: 'UP+C AT A FULL BOARD NOW WAKES THE HOST INSTEAD OF THE MOUNTAIN COLLAPSE: EACH STONE BECOMES A GOLEM FOR TEN SECONDS THAT CHARGES THE NEAREST FOE. FORTY SECONDS TO CALL IT AGAIN' } ] },
};
// PARITY SHEET (tools/geo-tech.mjs): dps = k x hits (the most one foe can take from one use) / cycle seconds (the use + the stones it costs to bring back). Where B deals no damage
// (STONE STEP is a mobility verb) there is nothing to compare; the pairs that deal damage are within 10%.
export const GEO_PAR = {
  gshatter: { hits: 2, cycle: 8.0 },   // 2 x 0.45 = 0.90 per recall; three stones to bring back is ~6 s of the fist's plants + the 1.8 s recall cooldown
  gcairn: { hits: 2, cycle: 7.0 },     // 2 x 0.40 = 0.80 per broken stone; a foe breaks one about every 7 s once it is pressing (GEO.stone.gnaw x hp 3 + the walk)
  gfault: { hits: 3, cycle: 40 },      // three waves x 0.8 = 2.4 on any foe on the screen
  ghost: { hits: 12, cycle: 40 },      // 12 golem hits x 0.2 = 2.4 on one foe (the per-foe cap), the same board spent a different way
};
// Upgrades: ranked I / II (II needs I). Nine for the Geomancer. Dropped from the brief because the thing they raised is gone: TREMOR FLOW (no TREMOR bar since claude/geoid)
// and WIDE QUAKE (a wider MOUNTAIN COLLAPSE zone would hit a foe with more than its n boulders: it breaks the damage parity the avalanche was built on).
// Every one is wired in src/geo-tech.js / src/geomancer.js / src/main.js; none is a card that does nothing.
export const GEO_UPGRADES = [
  { id: 'uemp', name: 'EMPOWERED+', what: ['THE EMPOWERED WINDOW IS 4 S, NOT 3', 'AND EMPOWERED BLOWS HIT 8% HARDER STILL'] },
  { id: 'ushard', name: 'SHARDS+', what: ['THE STONE SHARD FIRES TWO', 'THREE, AND THEY PIERCE'] },
  { id: 'urift', name: 'FAULT LINE+', what: ['THE RIFT AND THE SPIKE LAUNCH FOES 25% HIGHER', 'AND THE FAULT LINE RUNS 40% LONGER'] },
  { id: 'ulight', name: 'LIGHT STONE', what: ['THE RISING PILLAR COSTS 8 STAMINA LESS', 'AND THE STONE WALL COSTS 8 LESS'] },
  { id: 'uboulder', name: 'BOULDER+', what: ['THE BOULDER BOUNCES ONE MORE TIME', 'AND ONE MORE'] },
  { id: 'ugolem', name: 'GOLEM+', what: ['THE GOLEM STANDS 12 S, NOT 10', 'AND HITS 30% HARDER'] },
  { id: 'utomb', name: 'ENTOMB+', what: ['THE TOMB BREAKS ON THE SECOND BLOW, NOT THE THIRD', 'AND A BLOW ON IT LANDS 20% HARDER STILL'] },
  { id: 'uquarry', name: 'QUARRY', what: ['THE STONE FIST PLANTS A KNEE STONE 0.8 S SOONER', 'AND 1.6 S SOONER: THE BOARD REFILLS FASTER FOR THE CAPSTONES'] },
  { id: 'urecall', name: 'RECALL+', what: ['THE RECALL CAN BE USED 0.5 S SOONER', 'AND THE STONES BOWL 30% HARDER'] },
];
