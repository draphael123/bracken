// src/fair-foes.js - THE HARVEST FAIR's two new foes (claude/fairfix, Daniel 2026-09-30). Pure, no DOM: tools/harvest-fair.mjs drives them headless and in the
// page; src/main.js holds their hands (updateMummer steps the marionette, updateBarker the barker). Both are built on THE FACING RULE (src/mummer.js looks).
//
//   THE MARIONETTE   THE RULE TURNED INSIDE OUT: it moves ONLY WHILE A HERO LOOKS AT IT. Strings run up from it into the dark; put your back to it and it hangs
//                    limp where it is. CO-OP: one hero looking is enough to work its strings. In the hall of mirrors the true glass that watches your back works
//                    its strings too (a hero's `mirror` look, src/fair-games.js mirrorSees) - the glass is the mummer's answer and the marionette's weapon. Within
//                    reach, while it is looked at, it JERKS (the tell, a yellow !: the shield turns it) and then cuts; turn your back during the jerk and it hangs
//                    limp again (the cut never comes). It walks quicker than a mummer creeps: facing it to hold a mummer is facing it to bring it on.
//   THE BARKER       an elite: the fair's caller on a crate, with a speaking trumpet and a cane. He keeps his distance and every few seconds he CALLS: a told
//                    wind-up (the trumpet comes up, rings go out from it, the organ-pipe blast is heard: callTell), then the call TURNS EVERY HERO in range to face
//                    him and holds the facing a moment (BARKER.lock) - pulling your look off the mummers he stands among. A blow in the wind-up cuts the call
//                    short. Come within a cane's length and he swings the cane (caneTell, a yellow !). CO-OP: the call turns every hero in its range, each one.
// A foe's state is kept in e.st, as mummer.js keeps its: the step sets s.vx (px/s) and the HOST moves the body and writes the real x back.
import { looks, nearestHero } from './mummer.js';

export const MARIONETTE = { w: 10, h: 24, hp: 36, walk: 66, reach: 22, jerk: 0.45, strike: 0.12, dmg: 16, recover: 0.8, sight: 300, sightY: 120 };
export const BARKER = { w: 14, h: 26, hp: 70, walk: 34, keep: 96, callR: 250, callY: 130, every: 4.4, first: 1.6, callTell: 0.8, lock: 0.9, caneReach: 26, caneTell: 0.5, cane: 0.14, dmg: 14, recover: 0.8 };

/* does ANY hero work its strings (look at it)? the mirror's look counts; a dark look is short (w.sight) */
export const worked = (e, heroes, sight = MARIONETTE.sight, sightY = MARIONETTE.sightY) => (heroes || []).some(h => looks(e, h, sight, sightY));

export const newMarionette = (x, y, face = -1) => ({ x, y, face, mode: 'hang', t: 0, vx: 0 });
/* one frame of a marionette. world = { heroes, canStep(x, dir), sight, sightY }. Events: work (it starts to move), drop (it hangs limp), jerk, strike { box, dmg } */
export function marionetteStep(s, w, dt) {
  const evs = [], C = MARIONETTE; s.vx = 0;
  const near = nearestHero(s, w.heroes, C.sight, C.sightY), on = worked(s, w.heroes, w.sight || C.sight, w.sightY || C.sightY);
  const toward = () => { if (near) s.face = Math.sign(near.x - s.x) || s.face; };
  switch (s.mode) {
    case 'hang':
      if (on && near) { s.mode = 'walk'; toward(); evs.push({ t: 'work' }); }
      break;
    case 'walk':
      if (!on || !near) { s.mode = 'hang'; evs.push({ t: 'drop' }); break; }
      toward();
      if (Math.abs(near.x - s.x) <= C.reach && Math.abs((near.y || 0) - (s.y || 0)) < 40) { s.mode = 'jerk'; s.t = C.jerk; evs.push({ t: 'jerk' }); break; }
      if (!w.canStep || w.canStep(s.x, s.face)) s.vx = s.face * C.walk;
      break;
    case 'jerk':
      if (!on) { s.mode = 'hang'; evs.push({ t: 'drop' }); break; }   /* the strings go slack: the cut never comes */
      toward(); s.t -= dt;
      if (s.t <= 0) { s.mode = 'strike'; s.t = C.strike; const x0 = s.face > 0 ? s.x : s.x - (C.reach + 10);
        evs.push({ t: 'strike', dmg: C.dmg, box: [x0, x0 + C.reach + 10, s.y - C.h, s.y - 10] }); }   /* a cut at the chest: a ducking hero lets it over him (HEIGHT high) */
      break;
    case 'strike': s.t -= dt; if (s.t <= 0) { s.mode = 'recover'; s.t = C.recover; } break;
    case 'recover': s.t -= dt; if (s.t <= 0) s.mode = on ? 'walk' : 'hang'; break;
    default: s.mode = 'hang';
  }
  return evs;
}

export const newBarker = (x, y, face = -1) => ({ x, y, face, mode: 'stand', t: 0, vx: 0, callT: BARKER.first });
/* one frame of the barker. world = { heroes, canStep(x, dir) }. Events: callTell, call { turned: [heroes] }, caneTell, cane { box, dmg }.
   The CALL is his to make: it turns each hero in range (the host flips h.face and sets its lock) */
export function barkerStep(s, w, dt) {
  const evs = [], C = BARKER; s.vx = 0;
  const near = nearestHero(s, w.heroes, C.callR, C.callY);
  const inRange = h => h && h.alive !== false && Math.abs(h.x - s.x) <= C.callR && Math.abs((h.y || 0) - (s.y || 0)) <= C.callY;
  switch (s.mode) {
    case 'stand': case 'walk': {
      if (!near) { s.mode = 'stand'; s.callT = Math.max(s.callT, C.first); break; }
      s.face = Math.sign(near.x - s.x) || s.face;
      const d = Math.abs(near.x - s.x);
      if (d <= C.caneReach && Math.abs((near.y || 0) - (s.y || 0)) < 40) { s.mode = 'caneTell'; s.t = C.caneTell; evs.push({ t: 'caneTell' }); break; }
      s.callT -= dt;
      if (s.callT <= 0) { s.mode = 'callTell'; s.t = C.callTell; evs.push({ t: 'callTell' }); break; }
      /* he keeps his distance: backs off a hero who comes in, and stays put otherwise (he calls from his crate, he does not chase) */
      if (d < C.keep && (!w.canStep || w.canStep(s.x, -s.face))) { s.vx = -s.face * C.walk; s.mode = 'walk'; } else s.mode = 'stand';
      break; }
    case 'callTell':
      s.t -= dt; if (s.t <= 0) { const turned = (w.heroes || []).filter(inRange); s.mode = 'call'; s.t = 0.35; s.callT = C.every; evs.push({ t: 'call', turned, lock: C.lock }); }
      break;
    case 'call': s.t -= dt; if (s.t <= 0) s.mode = 'stand'; break;
    case 'caneTell':
      s.t -= dt; if (s.t <= 0) { s.mode = 'cane'; s.t = C.cane; const x0 = s.face > 0 ? s.x : s.x - (C.caneReach + 8);
        evs.push({ t: 'cane', dmg: C.dmg, box: [x0, x0 + C.caneReach + 8, s.y - C.h, s.y] }); }
      break;
    case 'cane': s.t -= dt; if (s.t <= 0) { s.mode = 'recover'; s.t = C.recover; } break;
    case 'recover': s.t -= dt; if (s.t <= 0) s.mode = 'stand'; break;
    default: s.mode = 'stand';
  }
  return evs;
}
/* THE CALL on one hero: he turns to face the barker (the host applies it and locks his facing for `lock` s) */
export const callFace = (s, h) => (Math.sign(s.x - h.x) || h.face || 1);
