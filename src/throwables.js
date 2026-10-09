// throwables.js — CARRY & THROW (Daniel, 2026-09-28): a generic system, built once, so any small object a level
// wants can be walked onto, picked up (INTERACT) and thrown in an arc the way the hero faces (ATTACK). No swinging
// while it is carried; a hit or a death drops it. Today only THE BURNING VILLAGE's water buckets use it - a barrel
// or a pot before it ships is one more row in THROW_KIND, not a second system (see QUESTIONS FOR DANIEL, work/
// claude/lane-done/claude-throwables.md).
//
// This file is the pure part: what a kind of object weighs (how much it slows the walk that carries it), how it
// arcs when it is thrown, what it does to a foe it hits, and how long an empty rack waits before it is filled
// again. The engine wiring - picking a target up off the ground, stepping the arc against real tiles and real
// enemies, applying a level's own effect (a beam holds, a heap burns down, a hot door cools) - stays in main.js,
// which is the level's own business (src/burning-village.js's heaps, deckBreaks and captives), not this module's.
export const THROW_KIND = {
  // vx/vy: the launch speed the way the hero faces, in px/s (vy negative is up); g: gravity on the arc, px/s^2.
  // respawn: seconds an empty rack waits, once the thrown one lands, before it is filled again (~3s, decision 2).
  // hitSmall/hitFire: the damage a thrown one does to a foe it hits square-on - a small hit to anything, more to
  // a foe fire already owns (burngob, emberwisp - see FIRE_FOES). carrySpeed caps how fast you walk holding one.
  bucket: { vx: 210, vy: -70, g: 520, respawn: 3, hitSmall: 1, hitFire: 3, carrySpeed: 58, carrySpeedSwim: 54 },
  // (claude/burnvillage2) THE JUG: THE BURNING VILLAGE's light water - nearly a run to carry, lobbed higher and further, a small splash
  // (src/village-water.js SPLASH). Its told arc is src/carry-throw.js KINDS.jug (UP lobs, DOWN tosses short), the same numbers it flies on.
  jug: { vx: 190, vy: -150, g: 600, respawn: 2, hitSmall: 1, hitFire: 3, carrySpeed: 80, carrySpeedSwim: 56 },
  // barrel: { vx: 120, vy: -160, g: 640, respawn: 4, hitSmall: 2, hitFire: 2, carrySpeed: 46, carrySpeedSwim: 44 },
  // (claude/underleaf2) UNDERLEAF's POT: light, a noise where it breaks (src/hush-hands.js); its told arc is src/carry-throw.js KINDS.pot
  pot: { vx: 175, vy: -185, g: 600, respawn: 4, hitSmall: 1, hitFire: 2, carrySpeed: 76, carrySpeedSwim: 54 },
  // rock:   { vx: 140, vy: -150, g: 700, respawn: 5, hitSmall: 3, hitFire: 1, carrySpeed: 50, carrySpeedSwim: 46 },
  // THE HANGING VILLAGE's hoist loads (2026-09-28, the ropewalk teaching pass): a coil, a sack or a stone thrown at
  // a hoist's well. Only vx/vy/g/carrySpeed are ever READ for it (src/main.js's updateHoists reuses the load's own
  // free-fall physics for the arc, not THROW_KIND's generic stepper, and a hoist load never fights a foe or waits on
  // a clock - a lost one just walks home the way any dropped load already did). respawn/hitSmall/hitFire are set
  // here only so this row keeps THROW_KIND's own table-wide contract (tools/throwables.mjs §1, every kind arcs,
  // respawns and hurts a fire foe harder) true for a generic reader of the table, even though nothing in the hoist
  // ever consults them.
  ballast: { vx: 150, vy: -120, g: 640, respawn: 3, hitSmall: 1, hitFire: 2, carrySpeed: 58, carrySpeedSwim: 54 },
  lamp: { vx: 190, vy: -150, g: 600, respawn: 1, hitSmall: 1, hitFire: 2, carrySpeed: 62, carrySpeedSwim: 54 },
  torch: { vx: 170, vy: -175, g: 600, respawn: 1, hitSmall: 1, hitFire: 2, carrySpeed: 84, carrySpeedSwim: 54 },   /* (claude/underwell2) THE UNDERWELL's TORCH (src/underwell-hands.js): light in the hand (carrySpeed near a run); its arc is src/carry-throw.js KINDS.torch, its aim by the torch's own launch(P) hook (UP lobs, DOWN tosses short) - only carrySpeed is read here; its flight, its fire and its blow are the hands' own */   /* (claude/djinn2) A LAMP-BEARER's LAMP (src/bandit-mystic-hands.js): its flight and its burst are the mystic hands' own (a blow of MYSTIC.hitDmg and a lamp fire); only vx/vy/g/carrySpeed are read - it never goes back to a rack */
  keg: { vx: 125, vy: -190, g: 700, respawn: 8, hitSmall: 1, hitFire: 2, carrySpeed: 60, carrySpeedSwim: 44 },
  flask: { vx: 170, vy: -210, g: 640, respawn: 8, hitSmall: 1, hitFire: 2, carrySpeed: 84, carrySpeedSwim: 54 },   /* (claude/ksar) THE BANDIT KSAR's POWDER KEG (heavy: a walk) and FLASH FLASK (light): their told arcs are src/carry-throw.js KINDS.keg / .flask (src/ksar-hands.js), their blast and flash the hands' own - only carrySpeed is read here */
};
// THE FIRE FOES a thrown water kind (a bucket) does more to, and douses instead of merely hurting - the burning
// goblin's straw-ignite pauses under `doused` (main.js, updateVillage's burngob loop). The Pyromancer is not in
// this set: his own duel (a separate lane) decides what a thrown bucket costs him, not this list.
export const FIRE_FOES = new Set(['burngob', 'emberwisp']);
export const WATER_KINDS = new Set(['bucket', 'jug']);   /* (claude/burnvillage2) the thrown kinds that are water: they douse what they hit */
export const isFireFoe = t => FIRE_FOES.has(t);
export const throwDamage = (kind, foeType) => { const k = THROW_KIND[kind]; return isFireFoe(foeType) ? k.hitFire : k.hitSmall; };
// THE PYROMANCER HOOK (decision 3): when a thrown bucket lands on him, main.js sets e.thrownWaterHit = <the frame
// it landed> on his entity and nothing else - his AI is untouched here. The field name is the whole contract; the
// boss lane that builds his duel reads it (a rising edge: this frame's time versus what it last saw) to know he
// was just doused, without this lane guessing what that should do to him.
export const PYRO_HIT_FIELD = 'thrownWaterHit';
