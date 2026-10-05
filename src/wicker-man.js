// src/wicker-man.js - THE WICKER MAN, the Harvest Fair's one new foe (claude/fairfix6, Daniel's 10-05 live playtest: "somewhat similar to the Wicker Queen ...
// it launches fireballs that you hit back to make it vulnerable, like the Queen"). A tall wicker effigy stuffed with straw, built for the fair's bonfire: a
// lesser echo of THE WICKER QUEEN, and the place her verb is taught before her arena.
//
//   THE FAIR'S RULE (src/mummer.js's facing rule, the Queen's): its FEET move only while no hero looks at it. Looked at, it stands - but its ARMS are not its
//     feet: it throws and it swings whether you look or not.
//   ITS FIRE        !!  told (WM.throwTell s: it lights a bundle of its own straw over its head, '!!'), then BOWLED along the ground at you: it hurts what
//     stands in its WM.ballTop px - JUMP it, or STRIKE IT BACK. Struck back it rolls home and the wicker CATCHES: that is its opening.
//     THE STRIKE-BACK IS THE QUEEN'S OWN RULE (src/main.js wqBallsStep; the numbers are hers, WQ.retReach / retLate / retSet, read here and never written):
//     a blow BEGUN as the ball comes into your reach (between retLate and retReach px in front of you, where it flashes white) by a hero who had held his
//     blade WQ.retSet s - a mashed blade only scatters sparks off it - or the Pyromancer's EMBER FLARE, sends it back.
//   ITS ARMS        !   in its reach (WM.reach px) it raises both long arms over its head (WM.swingTell s, a yellow !) and brings them down: heavy, slow, and a
//     shield turns it.
//   CAUGHT          a returned ball reaching it sets it ALIGHT: it catches (WM.catchT s), then BURNS for WM.burnT s - it stands in its fire and throws nothing,
//     and a blow is worth WM.burnMul. Then it STAMPS IT OUT (WM.stampT s, told: smoke, and it beats at itself) and fights on. Anywhere else the wicker
//     takes a blow and stands, as the Queen's does: a blow is worth WM.ward. So it is cut down in its fire, never through it.
// It is deadly one-on-one through its fire and its arms (and the rule: face it to strike its ball, and your back is to whatever else is there), never
// through health.
// PURE: no DOM, no main.js. src/wicker-man-hands.js binds it to the game (its ball, the strike-back, its drawing); tools/wicker-man.mjs proves it.
import { WQ } from './wicker-queen.js';

export const WM = {
  w: 14, h: 40, hp: 150,   /* (measured, tools/wicker-man.mjs: one 3 s fire, cut point-blank at the fair's depth (L23), takes 50 (warden) to 211 (pirate) - so one to three fires, the knight's two at a walk-in) */
  creep: 26,                           /* px/s while no hero looks at it: slower than a mummer (40); the Queen's 68 */
  sight: 300, sightY: 110,             /* how far it sees a hero to fight (its look is the fair's: the host says whether a hero is looking at IT) */
  throwFirst: 1.2, throwEvery: 4.0, throwTell: 1.0, throwT: 0.35, throwMin: 60, throwMax: 280, throwDy: 56,
  ballSpeed: 110, ballTop: 14, ballLife: 5, ballDmg: 15,   /* (the Queen's ball rolls 150 and hurts 17: a lesser fire) */
  retSpeed: 240, retHit: 14,           /* struck back it comes home at the Queen's speed, and catches this near it */
  reach: 30, swingTell: 0.9, swingT: 0.22, swingRecover: 1.0, swingReach: 40, swingDmg: 19,
  catchT: 0.35, burnT: 3.0, stampT: 0.9,
  burnMul: 1.0, ward: 0.05,            /* a blow in its fire lands whole; on the standing wicker it is a scratch (the Queen's WQ.ward) */
};
/* the strike-back's numbers ARE the Queen's (one rule for the fair's fire): reach, too-late and the held blade */
export const RET = { reach: WQ.retReach, late: WQ.retLate, set: WQ.retSet };
export const WM_TELLS = ['throwTell', 'swingTell'];
/* the frames of bakeWickerMan (src/redraw/wicker_man_art.js) */
export const WM_F = { still: 0, creep: [1, 2], throwTell: 3, throw: 4, swingTell: 5, swing: 6, catch: 7, burn: [8, 9], stamp: 10, hurt: 11, dead: 12 };
export const WM_FRAMES = 13;

export const wmOpen = s => s.mode === 'burn' || s.mode === 'catch';
/* WHAT A BLOW IS WORTH: burning (or catching), whole; the standing wicker shrugs it off */
export const wmTake = s => (wmOpen(s) ? WM.burnMul : WM.ward);

export function newWickerMan(x, y, face = -1) { return { x, y, face, mode: 'still', t: 0, vx: 0, anim: 0, throwCd: WM.throwFirst, n: { throw: 0, swing: 0, catch: 0, burn: 0, stamp: 0 } }; }

/* IT CATCHES: its own fire, struck back into it. False while it is already alight (or stamping it out: the fire is going out of it, not into it) */
export function wmIgnite(s) {
  if (s.mode === 'catch' || s.mode === 'burn' || s.mode === 'stamp' || s.dead) return false;
  s.mode = 'catch'; s.t = WM.catchT; s.vx = 0; s.n.catch++; return true;
}

/* WHERE A BALL IT THROWS STARTS: in front of it, on the ground */
export const ballFrom = s => ({ x: s.x + (s.face || -1) * 10, dir: s.face || -1 });

/* IS THIS A STRIKE-BACK? the Queen's rule, as a pure judgement. h = { x, y, face, low (feet on the ground near the ball's level), begun (a blow began this
   frame), fresh (the blade had been held RET.set s), flare (the pyromancer's ember flare is up) }; b = { x, dir }. Returns 'back' | 'wild' | 'ripe' | null */
export function strikeJudge(h, b) {
  const toward = Math.sign(h.x - b.x) === b.dir, ahead = (b.x - h.x) * (h.face || 1);
  if (h.flare && Math.abs(h.x - b.x) < 34) return 'back';
  if (!toward || !h.low || ahead < RET.late || ahead > RET.reach) return null;
  if (h.begun && h.fresh) return 'back';
  if (h.begun) return 'wild';
  return 'ripe';
}

/* ONE FRAME. w = { heroes: [{x, y, face, alive}], seen (a hero is looking at it - the host asks the fair's look, its dark included), canStep(dir) }.
   Sets s.vx (px/s: the host moves the body). Events: throwTell, throw { x, dir }, swingTell, swing { box [l, r, t, b], dmg }, burn, stamp, out */
export function wickerManStep(s, w, dt) {
  const ev = []; s.vx = 0; s.anim = (s.anim || 0) + dt; s.t -= dt; s.throwCd = Math.max(0, (s.throwCd || 0) - dt);
  const heroes = (w.heroes || []).filter(h => h && h.alive !== false);
  let near = null, nd = 1e9; for (const h of heroes) { const d = Math.abs(h.x - s.x); if (d < nd && d <= WM.sight && Math.abs((h.y || 0) - (s.y || 0)) <= WM.sightY) { nd = d; near = h; } }
  const toward = () => { if (near) s.face = Math.sign(near.x - s.x) || s.face || -1; };
  switch (s.mode) {
    case 'catch': if (s.t <= 0) { s.mode = 'burn'; s.t = WM.burnT; s.n.burn++; ev.push({ t: 'burn' }); } return ev;
    case 'burn': if (s.t <= 0) { s.mode = 'stamp'; s.t = WM.stampT; s.n.stamp++; ev.push({ t: 'stamp' }); } return ev;
    case 'stamp': if (s.t <= 0) { s.mode = 'still'; s.throwCd = Math.max(s.throwCd, WM.throwEvery * 0.6); ev.push({ t: 'out' }); } return ev;
    case 'throwTell':   /* the bundle lit over its head: committed (a look does not stop its arms) */
      toward(); if (s.t <= 0) { s.mode = 'throw'; s.t = WM.throwT; s.n.throw++; const b = ballFrom(s); ev.push({ t: 'throw', x: b.x, dir: b.dir }); } return ev;
    case 'throw': if (s.t <= 0) { s.mode = 'still'; s.throwCd = WM.throwEvery; } return ev;
    case 'swingTell':
      if (s.t <= 0) { s.mode = 'swing'; s.t = WM.swingT; s.n.swing++; const x0 = s.face > 0 ? s.x - 4 : s.x - WM.swingReach, box = [x0, x0 + WM.swingReach + 4, s.y - 34, s.y];
        ev.push({ t: 'swing', box, dmg: WM.swingDmg }); } return ev;
    case 'swing': if (s.t <= 0) { s.mode = 'recover'; s.t = WM.swingRecover; } return ev;
    case 'recover': if (s.t <= 0) s.mode = 'still'; return ev;
  }
  if (!near) { s.mode = 'still'; return ev; }
  const dy = Math.abs((near.y || 0) - (s.y || 0));
  /* IN REACH: the arms come down (looked at or not) */
  if (nd <= WM.reach && dy < 40) { toward(); s.mode = 'swingTell'; s.t = WM.swingTell; ev.push({ t: 'swingTell' }); return ev; }
  /* AT RANGE: it lights a bundle and bowls it (looked at or not) */
  if (s.throwCd <= 0 && nd >= WM.throwMin && nd <= WM.throwMax && dy <= WM.throwDy) { toward(); s.mode = 'throwTell'; s.t = WM.throwTell; ev.push({ t: 'throwTell' }); return ev; }
  /* ITS FEET: only while no hero looks at it */
  if (!w.seen) { toward(); if (!w.canStep || w.canStep(s.face)) s.vx = s.face * WM.creep; s.mode = 'creep'; }
  else s.mode = 'still';
  return ev;
}

export function wmFrame(s, hurt) {
  switch (s.mode) {
    case 'throwTell': return WM_F.throwTell; case 'throw': return WM_F.throw;
    case 'swingTell': return WM_F.swingTell; case 'swing': return WM_F.swing; case 'recover': return WM_F.still;
    case 'catch': return WM_F.catch; case 'burn': return WM_F.burn[Math.floor((s.anim || 0) * 8) % 2]; case 'stamp': return WM_F.stamp;
    case 'creep': return WM_F.creep[Math.floor((s.anim || 0) * 4) % 2];
  }
  return hurt ? WM_F.hurt : WM_F.still;
}
