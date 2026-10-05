// src/mummer.js - THE FACING RULE (claude/fair1). A reusable rule for any level: a foe that MOVES ONLY WHILE NOBODY LOOKS AT IT.
// Pure, no DOM: tools/harvest-fair.mjs drives it headless and through the page; src/main.js holds the hook (updateMummer, drawMummer).
//
// THE RULE (the Harvest Fair's: DON'T TURN YOUR BACK ON THEM):
//   a hero LOOKS at a foe when he is alive, on the same screen (sight px across, sightY px up or down) and FACES ITS SIDE (his `face` points at it).
//   CO-OP: a foe is FROZEN if ANY hero looks at it; it moves only when EVERY hero has his back to it.
//   A frozen foe can still be HIT (that is the whole answer to it: face it and cut it down).
//
//   THE MUMMER (masked player, sackcloth, painted wooden mask, cap bells): creeps toward the nearest hero ONLY while faced by nobody; the bells JINGLE
//     as it creeps (the audio tell, and only while it moves); within strike reach its mask GLOWS RED for MUMMER.glow seconds (the visual tell), then it
//     strikes; a look at any time during the glow cancels it.
//   THE HOBBY-HORSE (the elite): the moment the hero's back is turned it rears (HORSE.wind s, a told beat a look cancels) and CHARGES a fixed run
//     (HORSE.dist px, HORSE.charge px/s), committed even if the hero then turns. It FREEZES where the charge ends and will not charge again until it
//     has been looked at once.
//   THE CAROUSEL: a riding hero is turned round (and cannot turn back for `lock` s) every `period` s, after a `warn` s warning.
// A foe's state `s` is the one the game keeps in e.st: { x, y, face, mode, t, vx, bellT, armed, dir, run }. The step sets s.vx (px/s) and the HOST
// moves the body (moveBody) and writes the real x back, so walls, edges and slopes stay the game's.
export const TS = 16;
export const MUMMER = { w: 10, h: 22, hp: 40, creep: 40, reach: 22, glow: 0.6, strike: 0.15, dmg: 14, recover: 1.1, sight: 300, sightY: 120, bell: 0.4 };
export const HORSE = { w: 26, h: 22, hp: 96, wind: 0.45, charge: 230, dist: 190, dmg: 22, sight: 320, sightY: 120, skid: 0.35 };
export const CAROUSEL = { period: 5, warn: 1.3, lock: 0.9 };

/* does ONE hero look at this foe? */
export function looks(e, h, sight = MUMMER.sight, sightY = MUMMER.sightY) {
  if (!h || h.alive === false) return false;
  if (h.blind) return false;   /* a wall between (the corn maze's blind corners, src/fair-games.js blocked): you cannot look at what you cannot see */
  const dx = e.x - h.x; if (Math.abs(dx) > sight || Math.abs((e.y || 0) - (h.y || 0)) > sightY) return false;
  return h.mirror || dx === 0 || Math.sign(dx) === (h.face >= 0 ? 1 : -1);   /* h.mirror: the hall of mirrors' glass ahead of him watches what is at his back (src/fair-games.js mirrorSees) */
}
/* is the foe faced by ANY hero (co-op: one is enough)? */
export const facedBy = (e, heroes, sight = MUMMER.sight, sightY = MUMMER.sightY) => (heroes || []).some(h => looks(e, h, sight, sightY));
/* the nearest living hero within sight, or null */
export function nearestHero(e, heroes, sight = MUMMER.sight, sightY = MUMMER.sightY) {
  let best = null, bd = 1e9;
  for (const h of heroes || []) { if (h.alive === false) continue; const d = Math.abs(h.x - e.x); if (d <= sight && Math.abs((e.y || 0) - (h.y || 0)) <= sightY && d < bd) { bd = d; best = h; } }
  return best;
}

/* (claude/fairfix6, Daniel 10-05: "a watched mummer just freezes - a free win") THE MIME. In THE HARVEST FAIR only (w.mime; the Theatre's mummers never mime), a mummer held
 in a look does not simply stand: its feet still never CREEP (the facing rule), but it COPIES its watcher - the nearest hero looking at it - in the mirror:
   - HIS STEPS: as he steps it steps back at him, mirrored (his vx flipped, at most MIME.step px/s), and never closer than MIME.keep px on its own;
   - HIS SWING: a blow he begins within MIME.r px is answered - a told beat (MIME.tell s, a YELLOW ! - the shield turns it), then it swings back (MIME.dmg).
   So you time your cut between its mimicked swings. Unwatched it is the mummer it always was: it creeps, its bells ring, and the red glow comes before its strike.
   w.heroes[i] may carry vx (px/s) and swing (a blow begun this frame) for the mime to copy */
export const MIME = { step: 30, keep: 30, r: 72, tell: 0.42, swing: 0.14, dmg: 9, recover: 0.55 };
/* its watcher: the nearest hero looking at it (co-op: the nearest of them) */
export function watcherOf(e, heroes, sight = MUMMER.sight, sightY = MUMMER.sightY) { let best = null, bd = 1e9; for (const h of heroes || []) { if (!looks(e, h, sight, sightY) || h.mirror) continue; const d = Math.abs(h.x - e.x); if (d < bd) { bd = d; best = h; } } return best; }
export const newMummer = (x, y, face = -1) => ({ x, y, face, mode: 'still', t: 0, vx: 0, bellT: MUMMER.bell * 0.5 });
/* one frame of a mummer. world = { heroes:[{x,y,face,alive}], canStep(x, dir) -> can it walk on }. Returns events: freeze, wake, bell, glow, strike { box, dmg } */
export function mummerStep(s, w, dt) {
  const evs = [], C = w.C || MUMMER; s.vx = 0;   /* w.C: a level's own sharper mummer (THE HARVEST FAIR's, claude/fairfix2: src/fair-keys.js FAIR_MUMMER); the theatre keeps MUMMER */
  /* w.sight / w.sightY: a shorter LOOK (THE WICKER QUEEN's full dark, claude/fair3: only a near look holds her crowd). It finds its hero as far as ever */
  const near = nearestHero(s, w.heroes, C.sight, C.sightY), seen = facedBy(s, w.heroes, w.sight || C.sight, w.sightY || C.sightY);
  const toward = () => { if (near) s.face = Math.sign(near.x - s.x) || s.face; };
  switch (s.mode) {
    case 'still':
      if (near && !seen) { s.mode = 'creep'; toward(); evs.push({ t: 'wake' }); break; }
      if (seen && w.mime) { const h = watcherOf(s, w.heroes, w.sight || C.sight, w.sightY || C.sightY); if (!h) break; s.face = Math.sign(h.x - s.x) || s.face; const d = Math.abs(h.x - s.x);
        if (h.swing && d <= MIME.r && Math.abs((h.y || 0) - (s.y || 0)) < 40) { s.mode = 'mimeTell'; s.t = MIME.tell; evs.push({ t: 'mimeTell' }); break; }   /* HE SWINGS: it will swing back */
        const v = -(h.vx || 0), sp = Math.min(MIME.step, Math.abs(v)); if (sp > 6) { const dir = Math.sign(v); if (!(dir === s.face && d <= MIME.keep) && (!w.canStep || w.canStep(s.x, dir))) { s.vx = dir * sp; evs.push({ t: 'mimeStep' }); } } }   /* HE STEPS: it steps, mirrored */
      break;
    case 'mimeTell': s.t -= dt; if (s.t <= 0) { s.mode = 'mimeSwing'; s.t = MIME.swing; const x0 = s.face > 0 ? s.x : s.x - (C.reach + 10); evs.push({ t: 'mimeSwing', dmg: MIME.dmg, box: [x0, x0 + C.reach + 10, s.y - C.h, s.y] }); } break;   /* told and committed, like any yellow blow */
    case 'mimeSwing': s.t -= dt; if (s.t <= 0) { s.mode = 'mimeRecover'; s.t = MIME.recover; } break;
    case 'mimeRecover': s.t -= dt; if (s.t <= 0) s.mode = 'still'; break;
    case 'creep':
      if (seen) { s.mode = 'still'; evs.push({ t: 'freeze' }); break; }
      if (!near) { s.mode = 'still'; break; }
      toward();
      if (Math.abs(near.x - s.x) <= C.reach && Math.abs((near.y || 0) - (s.y || 0)) < 40) { s.mode = 'glow'; s.t = C.glow; evs.push({ t: 'glow' }); break; }
      if (!w.canStep || w.canStep(s.x, s.face)) s.vx = s.face * C.creep;
      s.bellT -= dt; if (s.bellT <= 0) { s.bellT = C.bell; evs.push({ t: 'bell' }); }
      break;
    case 'glow':
      if (seen) { s.mode = 'still'; evs.push({ t: 'freeze' }); break; }
      toward(); s.t -= dt;
      if (s.t <= 0) { s.mode = 'strike'; s.t = C.strike; const x0 = s.face > 0 ? s.x : s.x - (C.reach + 10);
        evs.push({ t: 'strike', dmg: C.dmg, box: [x0, x0 + C.reach + 10, s.y - C.h, s.y] }); }
      break;
    case 'strike': s.t -= dt; if (s.t <= 0) { s.mode = 'recover'; s.t = C.recover; } break;
    case 'recover': s.t -= dt; if (s.t <= 0) s.mode = 'still'; break;
    default: s.mode = 'still';
  }
  return evs;
}

export const newHorse = (x, y, face = -1) => ({ x, y, face, mode: 'still', t: 0, vx: 0, armed: true, dir: face, run: 0 });
/* one frame of the hobby-horse. Events: freeze (looked at), wind, charge, end (the charge is over: it stands where it stopped) */
export function horseStep(s, w, dt) {
  const evs = [], C = w.C || HORSE; s.vx = 0;   /* w.C: the fair's own horse (src/fair-keys.js FAIR_HORSE) */
  const near = nearestHero(s, w.heroes, w.near || C.sight, C.sightY), seen = facedBy(s, w.heroes, w.sight || C.sight, w.sightY || C.sightY);   /* w.near (claude/fairfix): in the dark it finds you only this near; w.sight: the dark (src/fair-games.js sightFor) shortens the look, as it does the mummer's */
  switch (s.mode) {
    case 'still':
      if (seen) { if (!s.armed) evs.push({ t: 'freeze' }); s.armed = true; break; }
      if (near && s.armed) { s.mode = 'rear'; s.t = C.wind; s.face = s.dir = Math.sign(near.x - s.x) || s.face; evs.push({ t: 'rear' }); }
      break;
    case 'rear':
      if (seen) { s.mode = 'still'; s.armed = true; evs.push({ t: 'freeze' }); break; }
      s.t -= dt; if (s.t <= 0) { s.mode = 'charge'; s.run = 0; evs.push({ t: 'charge' }); }
      break;
    case 'charge': {   // committed: a look no longer stops it
      const step = C.charge * dt;
      if (s.run >= C.dist || (w.canStep && !w.canStep(s.x, s.dir))) { s.mode = 'skid'; s.t = C.skid; s.armed = false; evs.push({ t: 'end' }); break; }
      s.vx = s.dir * C.charge; s.run += step; break; }
    case 'skid': s.t -= dt; s.vx = s.dir * C.charge * Math.max(0, s.t / C.skid) * 0.5; if (s.t <= 0) { s.mode = 'still'; s.vx = 0; } break;
    default: s.mode = 'still';
  }
  return evs;
}

/* THE CAROUSEL: c is the rider's clock; `riding` is whether he is on the disc. Events: warn (once per turn), turn (flip him and lock his facing) */
export const newCarousel = () => ({ t: 0, warned: false });
export function carouselStep(c, spec, riding, dt) {
  const evs = [], period = spec.period || CAROUSEL.period, warn = spec.warn || CAROUSEL.warn;
  if (!riding) { c.t = 0; c.warned = false; return evs; }
  c.t += dt;
  if (!c.warned && c.t >= period - warn) { c.warned = true; evs.push({ t: 'warn', in: warn }); }
  if (c.t >= period) { c.t = 0; c.warned = false; evs.push({ t: 'turn', lock: spec.lock || CAROUSEL.lock }); }
  return evs;
}
