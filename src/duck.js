// src/duck.js — THE UNIVERSAL DUCK (claude/duck, Daniel 2026-09-29: "crouch = universal duck").
//
// Hold DOWN on the ground, standing still, and every hero crouches: his hurt box drops from his full height to DUCK_H, and a
// HIGH blow goes over him - an arrow or a bolt loosed level, a thrown line, a head-high thrust or scythe, a crow at the face.
// A LOW blow (a sweep, a wave, a roll, a slam) finds a ducker the same as a stander; the ones answered with a jump are jumped.
// Which blow is which is src/marks.js HEIGHT, one row per told blow of every common foe; the windup of a high one wears the
// DUCK MARK beside its ! or !! and a blow answered with a jump the JUMP MARK (drawTells in src/main.js, laneOf in marks.js).
// Brace (down braces against a gust), the low sweep (down + swing), drop-through (down + jump on a board) and the slide down a
// slope are what they were: the duck is only down held with nothing else asked of it.
//
// THE API FOR OTHER ENGINES (the chase, the minecart and the Rockslide levels ducking under beams). In src/main.js:
//   P.ducking            true this frame when the hero is ducked (set in updatePlayer; false in the air, climbing, swimming,
//                        walking, swinging, blocking, rolling). A second co-op hero carries his own.
//   duckBox(P)           the hero's hurt box as it stands now: the full body standing, DUCK_H tall ducked
//   duckClears(P, y)     true when a beam, a bar or a hazard whose LOWEST point is at world y goes over the ducked hero
//                        (y <= P.y - DUCK_H) - test a beam with this instead of reading the down key
//   blowHigh(e, now)     true while creature e's last told blow is a high one and still landing (seeds it throws then are
//                        stamped s.high by updateEnemies); damagePlayer lets such a blow go over a ducked hero
// and BK.duck() for the tools (tools/duck.mjs).
import { HEIGHT, tellKey } from './marks.js';

export const DUCK_H = 8;          // a ducked hero's hurt box, in px (every hero stands 14): the crouch pose's head is at 9-10
export const DUCK_WINDOW = 0.9;   // a told blow is still THAT blow this long after its windup ends (the swing, the thrust, the flight)
/* THE MODES A CREATURE RESTS IN: a told blow does not go on being "that blow" into its walk (a crow's whole flight is its dive,
   so 'fly' is not one of these) */
const AT_REST = new Set(['walk', 'idle', 'rest', 'stand', 'patrol', 'guard', 'pace', 'recover', 'stalk', 'hover', 'drift', 'perch',
  'wait', 'sleep', 'scan', 'ready', 'span', 'still', 'shut', 'hide', 'crawl', 'swim', 'stunned', 'reel', 'dazed', 'winded']);

export const duckBox = b => ({ l: b.x - b.w / 2, r: b.x + b.w / 2, t: b.y - (b.ducking ? DUCK_H : b.h), b: b.y });
export const duckClears = (b, y) => !!b.ducking && y <= b.y - DUCK_H;

/* WHAT A WINDUP LEAVES ON ITS CREATURE: called every frame it winds up (updateEnemies), it notes the blow it is telling */
export function noteTell(e, now) { e.toldK = tellKey(e); e.toldAt = now; e.blowMode = null; }
/* ...and the first mode it goes into after, which is the blow itself for as long as it lasts */
export function noteRelease(e) { if (e.toldK && e.blowMode === null) e.blowMode = e.mode; }
export const blowHigh = (e, now) => !!(e && e.toldK && HEIGHT[e.toldK] === 'high' &&
  (now - e.toldAt < DUCK_WINDOW || (e.blowMode && e.mode === e.blowMode && !AT_REST.has(e.mode))));
/* A HIGH SEED GOES OVER A DUCKER while it flies near level: an arrow loosed along the same floor dips at most 0.6 of its run by
   the time it arrives, and one shot DOWN from a ledge comes in steeper than 0.8 and still finds him */
export const seedOver = (b, s) => !!(b.ducking && s.high && Math.abs(s.vy || 0) <= Math.abs(s.vx || 0) * 0.8);
