// src/theatre-foes.js - THE STAGEHAND (claude/theatre, THEATRE2: Daniel's pick C, the level's one new common foe). Pure step + a greybox sprite.
// A crew brute in a leather apron with a sandbag on a line. Slow, heavy, and dangerous one-on-one by what he does, not by his health:
//   THE SWING (red !!, told 0.8 s: the sandbag goes up over his shoulder): it comes down in front of him - nothing turns it. Step back out of it, then
//     cut him while he hauls it in (1.1 s open).
//   THE DROP (red !!, told 1.0 s: he hauls on a line and a shadow grows under YOU): when you are above him - on a gallery, a balcony, a box - he lets a
//     sandbag go from the flies onto the spot you stood on when he started. Move off the shadow.
// The hands (src/theatre-hands.js updateStagehand) move him and land the blows; the mark table rows are in src/marks.js (BY_HAND, ANSWER, HEIGHT).
export const STAGEHAND = { w: 14, h: 24, hp: 56, walk: 30, sight: 260, reach: 34, swingT: 0.8, strikeT: 0.2, swingDmg: 18, recover: 1.1,
  dropRange: 80, dropT: 1.0, dropDmg: 16, dropCd: 5, dropFall: 96 };
export const newStagehand = (x, y, face = -1) => ({ x, y, face, mode: 'walk', t: 0, vx: 0, dropCd: 2 });
/* one frame: w = { hero: { x, y, alive } | null (the nearest), canStep(dir) }. Sets s.vx; returns events: swingTell, swing { box, dmg }, dropTell { x, y },
   drop { x, y, dmg } */
export function stagehandStep(s, w, dt) {
  const C = STAGEHAND, evs = [], h = w.hero; s.vx = 0; s.dropCd = Math.max(0, (s.dropCd || 0) - dt);
  const dx = h ? h.x - s.x : 0, dy = h ? h.y - s.y : 0, same = h && Math.abs(dy) < 24 && Math.abs(dx) < C.sight;
  switch (s.mode) {
    case 'walk':
      if (!h) break;
      if (same) { s.face = Math.sign(dx) || s.face;
        if (Math.abs(dx) <= C.reach) { s.mode = 'swingTell'; s.t = C.swingT; evs.push({ t: 'swingTell' }); break; }
        if (!w.canStep || w.canStep(s.face)) s.vx = s.face * C.walk; break; }
      if (dy < -40 && dy > -200 && Math.abs(dx) < C.dropRange && s.dropCd <= 0) { s.mode = 'dropTell'; s.t = C.dropT; s.aimX = h.x; s.aimY = h.y; s.face = Math.sign(dx) || s.face; evs.push({ t: 'dropTell', x: s.aimX, y: s.aimY }); }
      break;
    case 'swingTell': s.t -= dt; if (s.t <= 0) { s.mode = 'swing'; s.t = C.strikeT; const x0 = s.face > 0 ? s.x : s.x - C.reach - 8; evs.push({ t: 'swing', dmg: C.swingDmg, box: [x0, x0 + C.reach + 8, s.y - 30, s.y] }); } break;
    case 'swing': s.t -= dt; if (s.t <= 0) { s.mode = 'recover'; s.t = C.recover; } break;
    case 'recover': s.t -= dt; if (s.t <= 0) s.mode = 'walk'; break;
    case 'dropTell': s.t -= dt; if (s.t <= 0) { s.mode = 'recover'; s.t = C.recover * 0.6; s.dropCd = C.dropCd; evs.push({ t: 'drop', x: s.aimX, y: s.aimY, dmg: C.dropDmg }); } break;
    default: s.mode = 'walk';
  }
  return evs;
}

/* THE SPRITES (src/redraw/theatre_foes.js): the stagehand's frames, and this level's own cast - the masked patron, the usher, the house's ghosts, the flying props */
export { bakeStagehand, bakeTheatreCast, foeSet, hauntThrown } from './redraw/theatre_foes.js';
