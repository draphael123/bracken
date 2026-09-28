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
  // barrel: { vx: 120, vy: -160, g: 640, respawn: 4, hitSmall: 2, hitFire: 2, carrySpeed: 46, carrySpeedSwim: 44 },
  // pot:    { vx: 170, vy: -190, g: 600, respawn: 2, hitSmall: 1, hitFire: 1, carrySpeed: 62, carrySpeedSwim: 56 },
  // rock:   { vx: 140, vy: -150, g: 700, respawn: 5, hitSmall: 3, hitFire: 1, carrySpeed: 50, carrySpeedSwim: 46 },
};
// THE FIRE FOES a thrown water kind (a bucket) does more to, and douses instead of merely hurting - the burning
// goblin's straw-ignite pauses under `doused` (main.js, updateVillage's burngob loop). The Pyromancer is not in
// this set: his own duel (a separate lane) decides what a thrown bucket costs him, not this list.
export const FIRE_FOES = new Set(['burngob', 'emberwisp']);
export const isFireFoe = t => FIRE_FOES.has(t);
export const throwDamage = (kind, foeType) => { const k = THROW_KIND[kind]; return isFireFoe(foeType) ? k.hitFire : k.hitSmall; };
// THE PYROMANCER HOOK (decision 3): when a thrown bucket lands on him, main.js sets e.thrownWaterHit = <the frame
// it landed> on his entity and nothing else - his AI is untouched here. The field name is the whole contract; the
// boss lane that builds his duel reads it (a rising edge: this frame's time versus what it last saw) to know he
// was just doused, without this lane guessing what that should do to him.
export const PYRO_HIT_FIELD = 'thrownWaterHit';
