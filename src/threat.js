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
  leadfoot: 3.5,
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
  /* THE SERJEANT: a charge down a bridge you cannot walk round, and a man with a sword when he is off the horse */
  lancer: 5,
  /* THE DRUNK: 22 health and a lob you can see the ring of - but he is always above the thing you are crossing */
  drunk: 2.5,
  /* THE DROWNED CAUSEWAY: a feeler is a lash you have to read at your feet; the Kraken is the coast's last word; a bell is furniture */
  feeler: 2.5, kraken: 6, krakenarm: 0, tidebell: 0, knell: 0,
  /* THE MONASTERY: a bell and a prayer wheel are furniture */
  tbell: 0, pwheel: 0,
  /* and the goblins who moved in: the priest throws no blow at all, but a blessed room takes twice the killing, so it is worth what it costs you */
  gobpriest: 2,
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
     table says one thing instead of two. The grave warden stays a mini, and the Tide Reaver, the only other mini
     here, is a 4. Every INDEX taken before this - and before 77a559a, which gave the five common dead any weight at
     all - was read off a table that scored part of its own input as nothing, so it is SMALLER THAN THE TRUTH. */
  /* THE UNBURIED FIELD. THE FALLEN are a zombie's weight (2): a told cut and 30 health, inert alone, but under a banner
     they come back, so they cost more than their health says. THE BANNER-BEARER is the shaman's 3: a support that makes the
     crowd, with a told pole of his own. THE BARROW RIDER is a mini like the grave warden (4); THE FIRST DEATH KNIGHT a boss (6). */
  corpse: 2, bannerbearer: 3, barrowrider: 4, deathknight: 6, cover: 0, ballista: 0, trebuchet: 0, oilbarrel: 0,
  burieddead: 6, undeadmage: 6, harbormaster: 6, hedgewarden: 6, gargoyle: 6, gravewarden: 4,
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
  /* THE DUNE WORM, the caravan's boss (2026-09-25): a boss is a 6. awningwinch is his trap and the camp's machine - furniture */
  duneworm: 6, awningwinch: 0,
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
