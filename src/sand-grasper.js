// src/sand-grasper.js - THE SAND GRASPER, BURIED CITY 5's one new foe (claude/bc5, 11-10; plan scratch/lane-reports/desert-next-plan.md s4; the lategame2 GRABBER counter
// approved 11-05 Q8). Pure: no DOM, no main.js; src/glassblower-hands.js binds it. The mummy's GRAB under the city's sand-drowned skin (src/mummy.js is the rhythm's source:
// both arms out, a lurch at close quarters, no shield turns it, it HOLDS you and squeezes until you strike it or tear free).
// WHAT IT IS: the sand's own hands - a drowned one the sand kept, buried to the neck. It RISES when a sand room drains (the hands stand it up: sandWait) or when you come
//   near it on dry street: the sand BOILS (told, GRASP.boil s, the first time 'THE SAND BOILS'), the body comes up (GRASP.rise s), and it walks SLOW and WEIGHTY.
// ITS ONE MOVE (told, windup + release pose + its own sound): THE GRAB '!!' - both arms UP and wide for GRASP.grabTell s, then a lurch. ROLL THROUGH THE TELL (the roll's
//   frames clear the lurch: no clinch); caught, it HOLDS you GRASP.hold s and squeezes a tick every GRASP.tick s - STRIKE IT and you tear loose. A miss leaves it open to
//   a blow for GRASP.recover s (it has to haul its arms back).
// WHERE IT STANDS: taught alone in THE DROWNED QUARTER after the great gate drains, then once each in THE HOURGLASS HALLS and THE THRONE STREET - at most one a room - and NEVER
//   in a race window, a run line or the Glassblower's floor (tools/buried-city5.mjs counts it).
// Frames (greybox poses, the art lane draws them): grBoil | grRise | grWalk | grWind (arms up) | grGrab (lurched, arms closed) | grHold | grRecover | grHurt.
export const GRASP = { hp: 170, w: 12, h: 20, speed: 20, wake: 84, wakeY: 34, boil: 1.2, rise: 0.5, sight: 150, sightY: 34, grabR: 26, grabTell: 0.6, grab: 0.26, cd: 1.1, recover: 0.9,
  hold: 1.1, tick: 0.5, flinch: 0.2, markH: 34, dmg: { grab: 22, squeeze: 10 } };
const ev = (a, t, extra) => a.push({ t, ...extra });
export function newGrasper(x, y, o) { return { x, y, home: x, hp: GRASP.hp, mode: 'buried', t: 0, face: (o && o.face) || -1, cd: 0.6, pose: 'grBoil', n: 0, grabs: 0 }; }
/* w = { px, py, time } -> events: { t: 'boil' | 'rise' | 'tell' | 'hit', ... } */
export function graspStep(e, w, dt) {
  const out = [], d = w.px - e.x, ad = Math.abs(d), near = Math.abs(w.py - e.y) < GRASP.sightY;
  e.t -= dt; e.cd -= dt;
  switch (e.mode) {
    case 'buried': e.pose = 'grBoil';
      if (w.woke || (near && ad < GRASP.wake)) { e.mode = 'boil'; e.t = GRASP.boil; ev(out, 'boil', {}); } break;
    case 'boil': e.pose = 'grBoil'; if (e.t <= 0) { e.mode = 'rise'; e.t = GRASP.rise; e.pose = 'grRise'; ev(out, 'rise', {}); } break;
    case 'rise': e.pose = 'grRise'; if (e.t <= 0) { e.mode = 'walk'; e.cd = 0.5; } break;
    case 'walk': {
      e.pose = Math.floor(w.time * 3) % 2 ? 'grWalk' : 'grWalk2';
      const sees = near && ad < GRASP.sight; if (sees) e.face = Math.sign(d) || e.face;
      if (sees && e.cd <= 0 && ad < GRASP.grabR + 6) { e.mode = 'grabTell'; e.t = GRASP.grabTell; e.pose = 'grWind'; ev(out, 'tell', { what: 'grab', mark: '!!' }); }
      else if (!(sees && ad < GRASP.grabR - 4)) e.x += e.face * GRASP.speed * dt;
      break; }
    case 'grabTell': e.pose = 'grWind';
      if (e.t <= 0) { e.mode = 'grab'; e.t = GRASP.grab; e.pose = 'grGrab'; e.n++; e.x += e.face * 6;
        ev(out, 'hit', { what: 'grab', mark: '!!', box: [e.x + (e.face > 0 ? -4 : -GRASP.grabR - 4), e.x + (e.face > 0 ? GRASP.grabR + 4 : 4), e.y - 20, e.y], dmg: GRASP.dmg.grab, grab: true }); } break;
    case 'grab': e.pose = 'grGrab'; if (e.t <= 0) { e.mode = 'recover'; e.t = GRASP.recover; e.pose = 'grRecover'; } break;
    case 'recover': e.pose = 'grRecover'; if (e.t <= 0) { e.mode = 'walk'; e.cd = GRASP.cd; } break;
    case 'hold': e.pose = 'grHold'; break;   /* the hands keep it while it holds a hero (and set the mode back when it lets go) */
    default: e.mode = 'walk';
  }
  return out;
}
/* a blow on it: under the sand it takes nothing (it is not there yet); open (recovering) it takes a blow whole; otherwise as it comes */
export function graspTake(e, dmg) { if (e.mode === 'buried' || e.mode === 'boil') return 0; return dmg; }
export const graspOpen = e => e.mode === 'recover';
