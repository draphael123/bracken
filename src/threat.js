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
export const THREAT = {
  sprig: 1, spit: 1, wasp: 1.5, hopper: 1, shield: 2, archer: 2, thorn: 2, spitter: 1.5, turtle: 1.5,
  brute: 3.5, sapper: 3, hound: 2.5, pike: 3, soldier: 3, javelin: 2.5, heavy: 4, crow: 1, bat: 1,
  sporeling: 1.5, lurker: 2.5, spitcap: 2, weaver: 3, shaman: 3, thief: 1, folk: 0, squirrel: 0,
  goat: 2, ram: 1.5, harpy: 2.5, troll: 4, spider: 3, sailer: 2, snuffer: 2.5, cutter: 3, hearthgob: 3,
  shardling: 2, suncatcher: 3, sentry: 2, lookout: 1.5, bosun: 3, cutlass: 2.5, boarder: 3, marine: 2.5,
  eel: 2, urchin: 1, angler: 2.5, siren: 3, crab: 1.5, scout: 2, tideguard: 3, petrel: 1.5, gull: 1,
  watch: 3, wight: 3, lance: 6, rockgoblin: 2.5, golem: 5, windcaller: 6, roc: 6, owl: 6, king: 6,
  assassin: 3.5, berserker: 5, grandmother: 6,
  heronfoe: 2, ramlord: 6, dog: 1.5, skybolt: 2.5, rockfall: 2, catapult: 2.5, towertop: 2,
  dropcage: 2, firepit: 1.5, firevent: 2, hotplate: 1.5, hammer: 3,
  frog: 5, chief: 5, queen: 4, mother: 5, greathound: 4, forgemaster: 5, gqueen: 6, herald: 6,
  reefmaw: 6, quarter: 6, captain: 6, lampreeve: 5, tollmaster: 6, dummy: 0, bale: 0.5, fisher: 0,
  sailor: 2.5, netter: 2, gill: 2, heart: 1, bearer: 1, master: 5, kite: 1.5, hare: 0, grub: 1.5,
  miner: 2, horn: 2, sweep: 1.5, drone: 1, stormshaman: 3,
  // THE UNDERCROWN. The propman is worth more than he hits for, because what he costs you is TIME on a set
  // you already paid for; the clinger is worth almost nothing on its own and everything over a drop.
  propman: 2.5, clinger: 2, pitwarden: 0, minerlamp: 0, timber: 0, gas: 0,
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
