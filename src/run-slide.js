/* src/run-slide.js - THE RUNNING SLIDE (claude/slope, Daniel 10-11 interview, scratch/brief-combat2.md section 2). DOWN pressed while RUNNING on flat
   ground: a short slide on the hip (RUN_SLIDE.t), at the pace he ran in with, his hurt box a duck's (src/duck.js DUCK_H: a high blow, a beam, a level
   arrow goes over him), and into a foe's legs it is a LOW blow - main.js hurtAs('sweep'), so it is the B14 SWEEP key and it TRIPS a small foe as the low
   sweep does. It costs wind and has a cooldown: it is not a faster run (it keeps the run's pace, it never adds to it), and it cannot be chained.
   Reaching a slope going DOWN it hands over: DOWN still held, the butt-slide (src/slopes.js slideStep) takes the pace it came in with; let go, the run
   down the hill (SLOPE MOMENTUM, src/slopes.js HILL_RUN) does. What is NOT this: the plain duck (DOWN with no way held, standing: unchanged), drop-through
   (DOWN + jump on a board: the jump still fires out of the slide), the low sweep (DOWN + attack: an attack ends the slide and is the sweep), the butt-slide
   (DOWN on a slope: it starts only on the flat). Pure rules here for tools/run-slide.mjs; the one function that touches the world takes main.js's context. */
import { slideBlow, classify } from './slide.js';

export const RUN_SLIDE = {
  t: 0.45,          // s on the hip
  minRun: 0.7,      // the run he must be at (share of a run, MOVE.RUN) for DOWN to be a slide and not a stumble
  cost: 6,          // wind (a low sweep costs 5)
  cd: 0.5,          // s after one ends before the next
  reach: 13,        // px: the low box ahead of the boots
  strongShare: 0.7, // a strong foe (elite, mini, big, heavy poise) takes this share and STOPS the slide at his feet
  stopBack: 60,     // px/s he is knocked back off a strong foe's shins
};
/* the low box ahead of the boots, dir the way he slides */
export const slideLowBox = (P, dir) => dir > 0 ? { l: P.x - 3, r: P.x + RUN_SLIDE.reach, t: P.y - 9, b: P.y } : { l: P.x - RUN_SLIDE.reach, r: P.x + 3, t: P.y - 9, b: P.y };
/* may DOWN, pressed this frame, start one? (c: the frame's facts main.js already has) */
export function canStart(P, c) {
  return c.pressed && P.ground && c.move !== 0 && Math.sign(P.vx) === c.move && Math.abs(P.vx) >= c.run * RUN_SLIDE.minRun && !c.slope && !(P.rslCd > 0) && !c.busy;
}

/* EVERY FRAME, before the sand slide (so a slope met this frame is the butt-slide's from this frame on). c = { P, dt, time, keys, move, run, slopeAhead (the slope
   kind under the foot, 0 on the flat), busy (attacking, rolling, stunned, hurt, swimming, climbing, guarding, carrying, riding), spend, enemies, box, overlap, poiseMax,
   swordDmg, hurtAs, trip, SFX, dust, parts, sparks, hitstop, lowParts, number, seen } */
export function update(c) {
  const { P, dt } = c;
  P.rslCd = Math.max(0, (P.rslCd || 0) - dt);
  const pressed = !!c.keys.down && !P.rslDownWas; P.rslDownWas = !!c.keys.down;
  if (P.rsl > 0) {
    const dir = P.rslDir;
    /* what ends it: its time, the air (a jump, an edge), a blow, a roll, anything that takes the legs; a wall; a slope (handed to the hill) */
    if (c.busy || !P.ground || Math.abs(P.vx) < 20 || c.slopeAhead) { end(P); return; }
    P.rsl -= dt; P.vx = dir * P.rslV; P.face = dir;
    P.rslDust = (P.rslDust || 0) - dt;
    if (P.rslDust <= 0) { P.rslDust = c.lowParts ? 0.1 : 0.04;
      c.parts.push({ x: P.x - dir * 3, y: P.y - 1, vx: -dir * (25 + P.rslV * 0.25), vy: -14 - Math.random() * 18, life: 0.28, max: 0.28, col: Math.random() < 0.5 ? '#c9b27c' : '#8a7a5a', size: 1, grav: 60 }); }
    const bb = slideLowBox(P, dir);
    for (const e of c.enemies) {
      if (!e.alive || e.harmless || e.gone > 0 || e.turncoat || e.trainer || P.rslHits.has(e) || !c.overlap(bb, c.box(e))) continue;
      P.rslHits.add(e);
      const kind = e.t === 'dummy' ? 'weak' : classify(e, c.poiseMax), blow = slideBlow(P.rslV, c.swordDmg());
      P.rslLast = { t: e.t, kind, blow };
      if (kind === 'weak') { c.hurtAs('sweep', e, blow, P.x, false); if (e.alive || e.t === 'dummy') c.trip(e); c.SFX.thud && c.SFX.thud(); c.sparks(e.x, e.y - 3, dir, 4); c.hitstop(0.03); P.rslV *= 0.9; continue; }
      /* a strong foe or a boss: the blow lands low (a sweep: the key, the trip it may take) and his shins stop you at his feet */
      c.hurtAs('sweep', e, kind === 'strong' ? Math.max(1, Math.round(blow * RUN_SLIDE.strongShare)) : blow, P.x, false); if (e.alive) c.trip(e);
      c.SFX.clank && c.SFX.clank(); c.sparks(P.x + dir * 8, P.y - 4, dir, 6); c.hitstop(0.05); c.dust(P.x, P.y, 3);
      end(P); P.vx = -dir * RUN_SLIDE.stopBack; return;
    }
    if (P.rsl <= 0) end(P);
    return;
  }
  if (canStart(P, { pressed, move: c.move, run: c.run, slope: c.slopeAhead, busy: c.busy }) && c.spend(RUN_SLIDE.cost)) {
    P.rsl = RUN_SLIDE.t; P.rslDir = c.move; P.rslV = Math.abs(P.vx); P.rslHits = new Set(); P.lowSlide = true; P.rslN = (P.rslN || 0) + 1;
    c.SFX.slide && c.SFX.slide(); c.dust(P.x - c.move * 4, P.y, 3);
    if (c.seen && !c.seen()) c.number(P.x, P.y - 26, 'RUNNING SLIDE: LOW, AND UNDER HIGH BLOWS', '#e8dcb4');
  }
}
export function end(P) { if (!(P.rsl > 0) && !P.lowSlide) return; P.rsl = 0; P.lowSlide = false; P.rslCd = RUN_SLIDE.cd; }
