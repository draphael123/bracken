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
export const THREAT = { burngob: 2.5, emberwisp: 2, pyromander: 5, captive: 0, watertrough: 0, villagewell: 0,   /* THE BURNING VILLAGE: a hearth goblin's swing plus the ground it lights; a slow touch you steer round; the boss; and the village's own things, which fight nobody */
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
  miner: 2, horn: 2, sweep: 1.5, drone: 1, stormshaman: 3, seawitch: 3,   /* the Hurricane's own caster does the shaman's job, so she is worth what he was */
  /* THE MERROW: the sea's own tribe. The spearfisher is worth what a sailor is (a reach weapon and a reel to
     answer); the tidecaller is worth what a caster is (a read, then a long window to punish); the brute is a
     shield you must go round or break, so it sits between the shieldgob and a knight's plate. */
  merrowspear: 2.5, merrowcaller: 3, merrowbrute: 3,
  // THE UNDERCROWN. The propman is worth more than he hits for, because what he costs you is TIME on a set
  // you already paid for; the clinger is worth almost nothing on its own and everything over a drop.
  propman: 2.5, clinger: 2, prince: 0, courtier: 0, minerlamp: 0, timber: 0, gas: 0,
  prise: 3, holdfast: 2.5, bellcrab: 0, bellguard: 3, drownedking: 0, ballast: 0,
  /* THE ROAD PEOPLE, weighed against the men already in the table: a soldier is 34 health and a 14 point
     swing and he is a 3, so a sworn sword at 44 and 18 is more than that; a heavy knight is 120 and an
     unblockable overhead at 4, and a hedge knight is 92 with an unblockable leap. And the runner is
     worth more than the hurt he does, because what he costs you is everybody else. */
  swornsword: 3.5, hedgeknight: 4.5, runner: 1.5, crossbow: 3, closedhelm: 0,
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
  /* the mage is a shooter that moves and a floor you must leave: the storm shaman's job with a red half, at his weight */
  gobmage: 3,
  /* THE HEXED FIELDS: a scarecrow is a read (where are you looking), a rook a step as much as a threat, the wisp worth more to you dead */
  /* THE MAGE'S FOLLY: a topiary is a read (it shivers first), the armour a slow wall, a piece and a broom nearly nothing, a mimic a trap, an imp a shooter that moves, a turret one that does not */
  topiary: 3, armour: 3.5, piece: 0.5, broom: 1.5, mimic: 2.5, imp: 2.5, turret: 2, tome: 2.5, homunculus: 5, archmage: 6, glyph: 0, gplate: 0, vatspit: 0, rune: 0,
  scarecrow: 3, rook: 1.5, farmhand: 3, pumpkin: 2.5, marshlight: 1.5, haunt: 2.5, boo: 2.5, ploughman: 5, strawking: 6, hexspill: 0, croppole: 0, thresher: 0,
  /* SEA WILDLIFE: a puffer is nearly nothing until it swells, a jelly is a timing problem more than a fight, a
     lamprey costs you air rather than health, and a manta is a diving strike off her own open water */
  puffer: 1, jelly: 1, lamprey: 2.5, manta: 2.5,
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
