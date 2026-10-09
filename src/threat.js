// src/threat.js — WHAT EACH CREATURE IS WORTH, in one place.
//
// This table lived twice: once in src/playtest.js and once in tools/curve.mjs, with a comment in the second
// one saying "kept in step with the same table in src/playtest.js". A convention nothing checks is a wish.
// They had drifted by TWENTY entries - miner, grub, master, netter, sailor, kite, horn, sweep, drone,
// stormshaman and the rest were all weighted in the bot and weighted at ZERO in the tool, so every level
// that used them read easier in the tool than it is, and the difficulty ramp the tool printed was measured
// on a count that was short. Both import this now, so they cannot disagree again.
//
// It is not health. It is how much ATTENTION a thing takes: a sprig you walk through is 1, a thing you have
// to stop and read is 3, a boss is 6. A hazard the player can turn against them (a hanging battering ram on
// a lever, a firepit) is weighted low - it is not aimed at you until you aim it.
export const THREAT = { burngob: 2.5, emberwisp: 2, pyromancer: 5, captive: 0, watertrough: 0, villagewell: 0,   /* THE BURNING VILLAGE: a hearth goblin's swing plus the ground it lights; a slow touch you steer round; the boss; and the village's own things, which fight nobody */
  familiar:5, lanternshade:2.5,bonecorsair:3,tidemarauder:4,
  sprig: 1, spit: 1, wasp: 1.5, hopper: 1, shield: 2, archer: 2, thorn: 2, spitter: 1.5, turtle: 1.5,
  brute: 3.5, sapper: 3, hound: 2.5, pike: 3, soldier: 3, javelin: 2.5, heavy: 4, crow: 1, bat: 1,
  sporeling: 1.5, lurker: 2.5, spitcap: 2, weaver: 3, shaman: 3, thief: 1, folk: 0, squirrel: 0,
  goat: 2, ram: 1.5, harpy: 2.5, troll: 4, spider: 3, sailer: 2, snuffer: 2.5, cutter: 3, hearthgob: 3,
  shardling: 2, fledgling: 2, suncatcher: 3, sentry: 2, lookout: 1.5, bosun: 3, cutlass: 2.5, boarder: 3, marine: 2.5,
  eel: 2, urchin: 1, angler: 2.5, siren: 3, crab: 1.5, scout: 2, tideguard: 3, petrel: 1.5, gull: 1,
  watch: 3, wight: 3, lance: 6, rockgoblin: 2.5, golem: 5, windcaller: 6, roc: 6, owl: 6, king: 6,
  assassin: 3.5, berserker: 5, grandmother: 6,
  heronfoe: 2, badger: 2.5, gar: 2, ramlord: 6, dog: 1.5, skybolt: 2.5, rockfall: 2, catapult: 2.5, towertop: 2,
  dropcage: 2, firepit: 1.5, firevent: 2, hotplate: 1.5, hammer: 3,
  frog: 5, chief: 5, queen: 4, mother: 5, greathound: 4, forgemaster: 5, gqueen: 6, herald: 6,
  reefmaw: 6, quarter: 6, captain: 6, masthead: 6, lampreeve: 5, tollmaster: 6, dummy: 0, bale: 0.5, fisher: 0,
  sailor: 2.5, netter: 2, gill: 2, heart: 1, bearer: 1, master: 5, kite: 1.5, hare: 0, grub: 1.5,
  miner: 2, horn: 2, sweep: 1.5, drone: 1, stormshaman: 3, seawitch: 3,
  /* THE ORE ROAD'S OWN THREE, weighed against the men already here rather than invented. A rockfall is a 2 and a
     javelineer 2.5, and the TIPPLER is a rockfall with a mind, so 2.5. A soldier is a 3 and the SHEARGOB does
     less damage than one but takes the floor away, which costs more than the blow. The GAFFER is worth what a
     brute is (3.5) because the reach is the creature: he is the only foe in the game you cannot walk past. */
  tippler: 2.5, sheargob: 3, gaffer: 3.5,   /* the Hurricane's own caster does the shaman's job, so she is worth what he was */
  /* THE MERROW: the sea's own tribe. The spearfisher is worth what a sailor is (a reach weapon and a reel to
     answer); the tidecaller is worth what a caster is (a read, then a long window to punish); the brute is a
     shield you must go round or break, so it sits between the shieldgob and a knight's plate. */
  merrowspear: 2.5, merrowcaller: 3, merrowbrute: 3,
  /* THE LEADFOOT sits over both of the Keep's other heavies. He is slower than the Tideguard and the Merrow Brute and
     harder to LEAVE than either, because leaving him is the thing he charges for: the way round him costs you air. */
  drownedknight: 3.5, drownedcaptain: 6,   /* THE DROWNED KNIGHT swims after you with a told lunge (a Tideguard is 3; the Leadfoot he replaced was 3.5); his captain adds a combo and holds a gate */
  // THE UNDERCROWN. The propman is worth more than he hits for, because what he costs you is TIME on a set
  // you already paid for; the clinger is worth almost nothing on its own and everything over a drop.
  propman: 2.5, clinger: 2, prince: 6, courtier: 0, minerlamp: 0, timber: 0, gas: 0,
  prise: 3, holdfast: 2.5, bellcrab: 6, bellguard: 3, drownedking: 6, ballast: 0,
  /* THE ROAD PEOPLE, weighed against the men already in the table: a soldier is 34 health and a 14 point
     swing and he is a 3, so a sworn sword at 44 and 18 is more than that; a heavy knight is 120 and an
     unblockable overhead at 4, and a hedge knight is 92 with an unblockable leap. And the runner is
     worth more than the hurt he does, because what he costs you is everybody else. */
  swornsword: 3.5, hedgeknight: 4.5, runner: 1.5, crossbow: 3, closedhelm: 6,
  /* THE TEMPERER, weighed the same way and for the same reason: a soldier is 3, and cold he is under one -
     but what he costs you is ATTENTION in somebody else's fight, which is the Runner's argument exactly, and
     unlike the Runner the thing he comes back with is unblockable. A soldier's weight, no more. */
  temperer: 3,
  /* THE SCALDER: an archer's reach, aimed down a column instead of across a floor, on a creature that never leaves his post */
  scalder: 2.5,
  whelp: 2.5,   /* THE GARGOYLE WHELP: 28 health and a 9 point swoop, but the swoop is a SHOVE placed over a fall, and it is stone until it moves (an imp is 2.5) */
  /* THE SERJEANT: a charge down a bridge you cannot walk round, and a man with a sword when he is off the horse */
  lancer: 5,
  /* THE DRUNK: 22 health and a lob you can see the ring of - but he is always above the thing you are crossing */
  drunk: 2.5,
  /* THE DROWNED CAUSEWAY: a feeler is a lash you have to read at your feet; the Kraken is the coast's last word; a bell is furniture */
  feeler: 2.5, kraken: 6, krakenarm: 0, tidebell: 0, knell: 0,
  /* THE MONASTERY: a bell and a prayer wheel are furniture */
  tbell: 0, pwheel: 0,
  /* and the goblins who moved in: a blessed room takes twice the killing, and since 2026-09-25 the priest throws its censer at range and
     rings you back with its bell up close - the drunk's price for the drunk's lob, on top of the rite */
  gobpriest: 2.5,
  /* THE FALSE ABBOT: a boss, and one whose ward makes every other thing in the room worth more */
  abbot: 6,
  /* THE WINCHMASTER: a boss, on a housing no jump reaches */
  winchmaster: 6,
  /* the mage is a shooter that moves and a floor you must leave: the storm shaman's job with a red half, at his weight */
  gobmage: 3,
  /* THE HEXED FIELDS: a scarecrow is a read (where are you looking), a rook a step as much as a threat, the wisp worth more to you dead */
  /* THE MAGE'S FOLLY: a topiary is a read (it shivers first), the armour a slow wall, a piece and a broom nearly nothing, a mimic a trap, an imp a shooter that moves, a turret one that does not */
  topiary: 3, armour: 3.5, piece: 0.5, broom: 1.5, mimic: 2.5, imp: 2.5, turret: 2, tome: 2.5, homunculus: 5, archmage: 6, glyph: 0, gplate: 0, vatspit: 0, rune: 0,
  scarecrow: 3, rook: 1.5, farmhand: 3, pumpkin: 2.5, marshlight: 1.5, haunt: 2.5, boo: 2.5, ploughman: 5, strawking: 6, hexspill: 0, croppole: 0, thresher: 0,
  /* THE DEAD, who had no weight at all until 2026-09-23 - 153 placements of them across the Burial Caverns, the
     Folly, the Falling Tower, the Witchlight Stair and the Undercrown, every one scoring ZERO, including the Burial
     Caverns' single most common enemy. Weighed against the men already in this table rather than invented: a soldier
     is 34 health and a 14 point swing and he is a 3, an archer is a 2 and a crossbowman a 3, an imp - 'a shooter that
     moves' - is 2.5, a shieldgob is 2 and a rock goblin 2.5.
       zombie      38 health, 12, slow and telegraphed, but it rises out of the ground and its grab SNARES you
       bonegob     30 health, 14: a skeleton of the shieldgob's weight, without the shield
       bonearcher  26 health, 16 and a thrown skull: an archer that also lobs, so over the plain archer
       apprentice  34 health, 12 and an ember it throws: the imp's job exactly, at the imp's price
       husk        74 health, 16 AND a gas cloud: twice the soldier's health and more than his swing */
  zombie: 2, bonegob: 2, bonearcher: 2.5, apprentice: 2.5, husk: 3,
  /* AND THEIR BOSSES. This table says plainly that a boss is a 6, and abbot, winchmaster, archmage, kraken, roc, owl,
     king and the rest all are. closedhelm, bellcrab, drownedking and prince were written 0 with nothing explaining
     why, and were left alone and flagged because which convention was right was Daniel's call rather than a thing to
     settle inside a bug fix. HE RULED ON 2026-09-23: A BOSS IS A 6, and those four are 6 now like the rest, so this
     table says one thing instead of two. The grave warden stays a mini, a 4 (the Tide Reaver, the other
     mini here then, was removed 2026-09-25). Every INDEX taken before this - and before 77a559a, which gave the five common dead any weight at
     all - was read off a table that scored part of its own input as nothing, so it is SMALLER THAN THE TRUTH. */
  /* THE UNBURIED FIELD. THE FALLEN are a zombie's weight (2): a told cut and 30 health, inert alone, but under a banner
     they come back, so they cost more than their health says. THE BANNER-BEARER is the shaman's 3: a support that makes the
     crowd, with a told pole of his own. THE BARROW RIDER is a mini like the grave warden (4); THE FIRST DEATH KNIGHT a boss (6). */
  corpse: 2, bannerbearer: 3, barrowrider: 4, deathknight: 6, bloodknight: 6, cover: 0, ballista: 0, trebuchet: 0, oilbarrel: 0,
  burieddead: 6, undeadmage: 6, harbormaster: 6, hedgewarden: 6, gargoyle: 6, gravewarden: 4,
  sexton: 4,   /* THE SEXTON, the Falling Tower's mini (2026-09-25): a mini like the grave warden and the barrow rider */
  /* SEA WILDLIFE: a puffer is nearly nothing until it swells, a jelly is a timing problem more than a fight, a
     lamprey costs you air rather than health, and a manta is a diving strike off her own open water */
  puffer: 1, jelly: 1, lamprey: 2.5, manta: 2.5,
  /* THE SUNKEN CARAVAN's four, weighed BEFORE the level is placed rather than after. A creature missing from this table
     is silently worth nothing (`undefined > 0` is false), so the first desert level would have read easier than it is -
     which is the exact bug tools/threat-holes.mjs exists to catch, and it cannot catch this one until the level is in
     LEVELS. Weighed off src/desert-foes.js's real numbers against the soldier, who is 34 health and a 14 point swing
     and is a 3:
       scorpion  34 health, and TWO tells with two different answers - the claw (! 8, the shield turns it) and the
                 sting (X 12, over its own back, you move). A soldier's health and one more thing to read.
       vulture   22 health, one told dive (X 10) at a spot it marks - and it LANDS OPEN afterwards, every time, so it
                 hands back a free punish. Below the harpy at 2.5 for that; the fledgling's price.
       sandgob   26 health and a small knife (! 7, twice), but untouchable while it is a mound and it burrows to come
                 up AHEAD of you. What it costs is position and time, not health: the lurker's job, the lurker's price.
     bandit is the odd one out and its number is PROVISIONAL: it is a roster name in the greybox with NO behaviour
     module yet (src/desert-foes.js has the other three and nothing for him), so this weighs a looter with a blade
     against the human melee line - the cutlass at 2.5, under the soldier at 3. Re-weigh him when he is written. */
  scorpion: 3, vulture: 2, sandgob: 2.5, bandit: 2.5,
  /* THE BANDITS, written (2026-09-25; src/desert-foes.js): the cutthroat is a soldier's 38 health with a 10 point cut, and the FEINT
     in front of every other one is a read the soldier never asks for - a 3; the slinger is 24 health and a stone (! 8) from where you
     cannot reach him, told long, and open when you climb to him - the archer's 2.5; the ambusher is the sand goblin's trick with more
     health and a heavier knife - 2.5 as the sand goblin was */
  cutthroat: 3, slinger: 2.5, ambusher: 2.5,
  /* THE HARVEST FAIR (src/mummer.js; docs/briefs/harvest-fair.md): a mummer is 40 health and a 14 blow that comes only from behind you, told by a
     glowing mask and its bells - a read (where to LOOK) rather than a fight. WEIGHED UP after Daniel approved the greybox (2026-09-29): the fair read INDEX 34 against ~117 and no bodies are to be added, so a mummer is a 5 (constant attention: you may never turn your back) and the hobby-horse a 6 (the elite that charges 22 the moment
     a back is turned, committed and long) */
  mummer: 5, hobbyhorse: 6, stringjack: 5, barker: 7, wickerman: 7,   /* (claude/fairfix) the string-jack weighs a mummer; the barker an elite caller who does little harm himself but turns every hero */
  stagehand: 5,   /* THE STAGEHAND (the Maskwright's Theatre): 56 health, an unblockable 18 in front and a 16 dropped on you from above; slow */
  spotlamp: 0, flylock: 0, flatwinch: 0, stagetrap: 0, startrap: 0,   /* THE MASKWRIGHT'S THEATRE's machinery (src/theatre-rig.js): a lamp, a rope-lock, a winch, a stage trap and the star trap fight nobody */
  /* THE FOG CANAL (src/canal-foes.js; docs/briefs/fog-canal.md): the GRINDYLOW is 20 health and a told ankle grab (!!, jump it) that pulls you into the
     canal (the water's 20 is the real cost), hidden under the surface until it rises - a read and a punish more than a fight, so a 3 (a sprig is 2);
     the WILL-O'-THE-WISP is one blow of health and a small told flare, but it LURES you off the bank: a 1.5 (the marshlight). The canal's machinery
     (a lock's paddle, a swing bridge's capstan, a foghorn, a lantern post) fights nobody */
  grindylow: 3, willowisp: 1.5, locksluice: 0, swingcap: 0, foghorn: 0, lanternpost: 0,
  /* THE WELL TOWN (src/well-town.js, claude/welltown): the WATER-THIEF is the cutthroat's feint and cut (a 3, as the cutthroat) on a lighter, faster body that
     cuts your skin and runs for a well: a 3. THE CISTERN QUEEN is a boss: a 6; THE GANG LEADER a mini: a 5 (claude/welltown3). The town's wells, mud walls, fires, windlasses and dry cistern fight nobody */
  /* THE SANDWORM (claude/desertfoes, src/desert-foes2.js): the sand goblin's buried strike with the Dune Worm's told ripple and an open beat after it: a 2.5 */
  sandworm: 2.5,
  waterthief: 3, cisternqueen: 6, gangleader: 5, qwindlass: 0, djwindlass: 0, djinn: 6, skinwell: 0, mudwall: 0, oilfire: 0, windlass: 0, cistern: 0,
  gsmirror: 0, gscampfire: 0, colmirror: 0, gsheap: 0, gscrack: 0, skitter: 0.6, colossus: 6, trophyhunter: 2.5, huntmaster: 6, hoist: 0,   /* THE ROOTWAY (claude/rootway): the trophy-hunter rides a hoist down and lunges (a runner, as the kite-rider); THE GOBLIN HUNTMASTER a boss */   /* THE GLASS SEA (claude/glasssea): its mirrors, fires, sand heaps and cracks are things you work; the skitter is a swarm's small biter; THE GLASS COLOSSUS */
  mcpoints: 0, mccrusher: 0, mcgate: 0, mcrock: 0, mcbeam: 0, mcgap: 0, mcgobcart: 0, drillpoints: 0, oretip: 0, greatdrill: 6,   /* THE DEEP RAILS (claude/minecart): its points, crushers, gates, rockfalls, beams, boost gaps and goblin carts are things you ride or work; THE GREAT DRILL */   /* THE GLASS SEA (claude/glasssea): its mirrors, fires, sand heaps and cracks are things you work; the skitter is a swarm's small biter; THE GLASS COLOSSUS */
  sconce: 0, nestplug: 0, greatlamp: 0, fountain: 0,   /* THE UNDERWELL (claude/underwell): its wall torches, brood nests, great lamp and dry fountain are things you work, not foes */
  /* THE RED GORGE (src/red-gorge.js, claude/redgorge): the CLIFF RAPTOR is the vulture's dive (a 2) over a bridge with a flood under it: a 2.5. THE GREAT RED CRAB is a
     boss: a 6. The gorge's sluice wheels, jams, water-wheels and the old nest fight nobody */
  raptor: 2.5, gorgecrab: 6, sluice: 0, jam: 0, waterwheel: 0, oldnest: 0,
  /* THE SKY ROAD (src/sky-road.js, claude/skyroad): the GOBLIN KITE-RIDER circles in a thermal and swoops (a told kick a shield turns), falls to his feet when his line is cut or the air dies: a 2.5, as the harpy.
     The sun-stones, the sun-disc, the cloak, the riders' loft and the Eyrie's kite-masts fight nobody */
  kiterider: 2.5, sunstone: 0, sundisc: 0, cloak: 0, loft: 0, mast: 0,
  /* (claude/redgorge2) THE RAPTOR MATRIARCH is a boss: a 6; her ledge's sluice levers fight nobody */
  matriarch: 6, mlever: 0,
  /* THE BANDIT KSAR (claude/ksar): THE HAWK SCOUT is a vulture's marked stoop (a 2) whose shriek sends the lookouts running: a 2.5. THE HAWK-MISTRESS is a boss: a 6. The gongs, keg stacks,
     flask racks, set kegs, bricked arches, the winch and the strongroom fight nobody */
  hawkscout: 2.5, hawkmistress: 6, ksgong: 0, kskegs: 0, ksflasks: 0, kskeg: 0, ksbarricade: 0, kswinch: 0, ksvault: 0,
  /* THE LIT CHURCH (claude/litchurch): THE PALADIN is a boss: a 6. The lamps, fires, bellows, the key desk, the grates and the reliquary fight nobody */
  acolyte: 1.5,   /* (claude/litchurch) the runner's body: he does not fight - he relights (a support and a runner) */
  paladinboss: 6, lclamp: 0, lcsource: 0, lcbellows: 0, lcdesk: 0, lcgrate: 0, lcreliquary: 0,
  /* THE TOWPATH (claude/towpath): THE FOG KNIGHT is a boss: a 6. The paddles, capstans, lamps, the lantern, the lychgate and the church door fight nobody */
  fogknight: 6, tppaddle: 0, tpcapstan: 0, tplamp: 0, tplantern: 0, tplychgate: 0, tpchurch: 0,
  /* THE WICKER QUEEN, the fair's boss (claude/fair3): a boss is a 6 */
  wickerqueen: 6,
  /* THE FAIR'S GAMES (claude/fairlevel, src/fair-games.js): a striker's pad, a gallery's target, a ticket and the prize booth are machines you work, not foes - furniture, written down at 0 so the tools read them as gadgets */
  striker: 0, gtarget: 0, ticket: 0, booth: 0,
  /* THE LANTERN-EATER, THE FOG CANAL's boss (claude/lanterneater; Jenny Greenteeth before it, benched): a boss is a 6 */
  lanterneater: 6,
  /* THE DUNE WORM, the caravan's boss (2026-09-25): a boss is a 6. awningwinch is his trap and the camp's machine - furniture */
  duneworm: 6, awningwinch: 0,
  /* THE PUPPETEER, the Maskwright's Theatre's boss (claude/puppeteer): a boss is a 6; his soldier, harlequin and masterpiece are his fight, not a crowd of their own */
  puppeteer: 6, marionette: 0, harlequin: 0, acrobat: 0, masterpiece: 0,
  /* GALE MOOR's half-built windmill frame on the goblin scaffold (claude/moor2): a thing you cut down, not a foe */
  gustframe: 0,
};

// THE INDEX, also in one place: what a level CONTAINS, not how a player does. Deliberately crude and
// deliberately static - it is for spotting a level out of order with its neighbours, not for tuning a number.
// A tall level is long, it is just long upwards, so the span counts height at three columns a row.
export const spanOf = (W, H) => W + Math.max(0, H - 30) * 3;
export const indexOf = ({ threat, kinds, hazTiles = 0, gap, span }) =>
  Math.round(threat / (span / 100) * 2 + kinds * 3 + hazTiles / (span / 100) * 1.5 + gap / 20);

// AND WHAT COUNTS AS OUT OF LINE. The two tools disagreed on this as well - the bot allowed a drop of
// eight and the tool allowed six, so the same campaign passed one and failed the other.
//
// A campaign is not a straight line, it is ACTS. Each one opens a little under the last one's peak and
// ends above it, and that small step down at a boundary is pacing, not a flaw: the Queen's castle finishes
// the crags and the Long Water opens the sea, and the river is meant to breathe. What the rule is for is a
// COLLAPSE - a level that gives back half of what the one before it asked - and a WALL, a step so big the
// player has nowhere to have learned it.
/* WHAT A LEVEL CONTAINS, COUNTED ONCE (2026-09-25). tools/curve.mjs and the bot (src/playtest.js) each counted a built level's
   foes, threat, kinds and hazard for themselves - the same drift the THREAT table had before it lived here - and they had
   drifted again: the bot never counted an AMBUSH room's crowd at all, and neither counted a floor that gives way. Both call
   this now. What it counts:
     - every weighed creature; a mini twice its weight and an elite three times
     - an AMBUSH ROOM's crowd, which is not in the entity list until the room shuts - and its CAPTAIN as the elite it is
       (it was counted as a common one, so a room's elite was worth a third of the same elite stood on the road)
     - HAZARD: spike tiles, harmful pools (a tile in four), swim pools (a tile in eight: breath), and FLOOR THAT GIVES WAY -
       the Falling Tower's failing stone (L.crumbles), the Hurricane's splitting deck and the Burning Village's logs
       (L.deckBreaks), one tile each, as a spike is. A floor that drops you costs the climb back and the fight you were in;
       it was invisible to the index, so the level whose whole rule it is read as having almost no hazard in it. */
export function measureLevel(R, { T, TS = 16 }) {
  let foes = 0, threat = 0, checks = 0, hazTiles = 0; const kinds = new Set(), unweighed = new Set();
  for (const e of (R.ents || [])) { if (e.t === 'check') { checks++; continue; }
    const w = THREAT[e.t]; if (w === undefined) { unweighed.add(e.t); continue; }
    if (w > 0) { foes++; threat += w * (e.mini ? 2 : e.elite ? 3 : 1); kinds.add(e.t); } }
  for (const A of (R.ambushes || [])) for (const w of A.waves) for (const [t, , , o] of w) { const v = THREAT[t]; if (v > 0) { foes++; threat += v * (o && o.elite ? 3 : 1); kinds.add(t); } }
  for (let i = 0; i < R.grid.length; i++) if (R.grid[i] === T.SPIKE) hazTiles++;
  for (const p of (R.pools || [])) { if (p.harm) hazTiles += Math.round((p.x1 - p.x0) / TS / 4); else if (p.swim) hazTiles += Math.round((p.x1 - p.x0) / TS / 8); }
  for (const c of (R.crumbles || [])) hazTiles += c.x1 - c.x0 + 1;
  /* THE BORE (THE LONG WATER, 2026-09-25): a wave up the river every twenty seconds that knocks down anyone below a rock's top, for 12
     and unblockable. It knocks you back, it does not drown you, so it is counted as a swim pool is, a tile in eight of its run. It was
     never counted at all, so the level whose river it is read as having less in it than it has. */
  if (R.bore) hazTiles += Math.round((R.bore.x1 - R.bore.x0) / TS / 8);
  for (const z of (R.deckBreaks || [])) hazTiles += z.x1 - z.x0 + 1;
  const span = spanOf(R.W, R.H), gap = worstGap(R.ents, R.W, R.H, R.arena);
  return { foes, threat, kinds: kinds.size, kindSet: kinds, checks, hazTiles, gap, span, unweighed, index: indexOf({ threat, kinds: kinds.size, hazTiles, gap, span }) };
}
export const RAMP_DROP = -8;   // a step down bigger than this is a collapse, not an act opening
export const RAMP_WALL = 26;   // a step up bigger than this is a wall

// THE WORST RUN WITH NO CHECKPOINT IN IT - and the arena is not one of them. Every level that ends in a
// boss put its last checkpoint at the arena DOOR, which is right, and then the measure counted the whole
// fight as a run with no checkpoint in it, which made Stormhold read a hundred and twenty-six and Kingswood
// a hundred and eighteen for doing exactly the correct thing. A boss arena is not a walk. It stops at the
// door. (A TALL level is measured by height, because that is the direction you travel it.)
export function worstGap(ents, W, H, arena) {
  const tall = H > 60, key = e => tall ? e.y : e.x;
  const end = arena ? Math.round((tall ? arena.floor : arena.x0) / 16) : (tall ? H : W);
  const cx = (ents || []).filter(e => e.t === 'check').map(key).sort((a, b) => a - b);
  let gap = cx.length ? cx[0] : end;
  for (let i = 1; i < cx.length; i++) gap = Math.max(gap, cx[i] - cx[i - 1]);
  return Math.max(gap, end - (cx[cx.length - 1] || 0));
}
