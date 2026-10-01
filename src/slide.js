/* src/slide.js - THE BUTT-SLIDE (claude/slide, Daniel 2026-10-01: "holding down on any slope is a butt-slide, like you're on your
   butt sliding"). The MOVEMENT is the sand slide that already lived in src/slopes.js (slideStep): hold DOWN on a slope tile and you go
   downhill, speeding up with the grade; it ends when DOWN is let go, when the hero leaves the ground (the carry/leap: a jump out of
   it is always available) or when the flat takes the speed back (below SLIDE.endSpeed). This file adds what that movement lacked:
     - THE HIT: feet first, a low box ahead of the boots, one blow per foe per slide, scaled by slide speed.
         WEAK foes (no or light poise bar: the common ones) take it, and are knocked flat if they live; you keep sliding.
         STRONG foes (heavy poise, a mini, a big one, an ELITE) take it and STOP you: you bounce off and land on your back for FLAT_T
         seconds, a real risk window (no i-frames; the foe's own touch and swing still hurt).
         BOSSES (a maxHp foe) take a chip (x CHIP of the blow) and stop you the same way.
     - THE LOOK: the dust the heels kick up, the pose key 'slide' (src/chars.js), the scrape of the sound.
   Pure rules are exported so tools/slide.mjs can read them; the one function that touches the world takes a context from main.js. */
export const BUTT = {
  minSpeed: 70,      // px/s under which the boots are not a weapon (the start of a slide, the end of a skid)
  topSpeed: 180,     // the steep hill's own top speed (SLIDE.maxSteep): the scale's top
  base: 0.35,        // a blow's share of a sword cut at minSpeed ...
  gain: 0.75,        // ... and what the rest of the speed adds on top, up to topSpeed
  chip: 0.05,        // a boss takes this share of the blow (the game's chip rule)
  strongShare: 0.7,  // a strong foe's share of the blow: it hurts it, it does not break it
  flatT: 0.9,        // on your back after a bounce
  bounceVx: 120, bounceVy: -150,
  reach: 15,         // the box ahead of the boots, px
};
/* THE BLOW: a share of one sword cut, scaled with how fast you are going (a low told hit, not a weapon you ride) */
export function slideBlow(speed, cut) {
  const k = Math.max(0, Math.min(1, (Math.abs(speed) - BUTT.minSpeed) / (BUTT.topSpeed - BUTT.minSpeed)));
  return Math.max(1, Math.round(cut * (BUTT.base + BUTT.gain * k)));
}
/* WHAT A FOE IS TO A SLIDE: 'boss' (chip, stops you), 'strong' (damaged, stops you), 'weak' (dies or is knocked flat, you slide on).
   poiseMax is main.js's own table (0 for a foe with no bar, POISE_LIGHT for the small tier, 40+ for the heavy), so "weak" is the
   game's own idea of a light body. */
export function classify(e, poiseMax) {
  if (e.maxHp && !e.mini) return 'boss';
  if (e.elite || e.mini || e.big) return 'strong';
  return poiseMax(e) > 24 ? 'strong' : 'weak';
}
/* THE BOX AHEAD OF THE BOOTS (dir is the way down the hill) */
export function bootBox(P, dir) { return dir > 0 ? { l: P.x, r: P.x + BUTT.reach, t: P.y - 10, b: P.y } : { l: P.x - BUTT.reach, r: P.x, t: P.y - 10, b: P.y }; }

/* EVERY FRAME, after the slide block of updatePlayer has run. c = { P, ss, dt, time, enemies, box, overlap, poiseMax, swordDmg, hurtEnemy, knockFoe,
   SFX, dust, parts, shakeCam, hitstop, sparks, squash, lowParts, stunned } */
export function buttUpdate(c) {
  const { P, ss, dt } = c;
  if (P.flatT > 0) {   /* ON YOUR BACK: skidding to a stop, helpless */
    P.flatT -= dt; ss.sliding = false; ss.carry = false; P.slideOn = false; P.vx *= Math.max(0, 1 - 7 * dt);
    if (P.flatT <= 0) P.flatT = 0; return; }
  const was = !!P.slideOn, on = !!(ss && ss.sliding && P.ground && !P.dead && !P.swim);
  P.slideOn = on;
  if (!on) { P.slideHits = null; return; }
  const speed = Math.abs(P.vx), dir = Math.sign(P.vx) || P.face || 1;
  if (!was) { P.slideHits = new Set(); c.SFX.slide && c.SFX.slide(); }
  if (speed > 20) P.face = dir;   /* feet first, the way down the hill */
  P.slideDust = (P.slideDust || 0) - dt;
  if (P.slideDust <= 0 && speed > 30) { P.slideDust = c.lowParts ? 0.12 : 0.045;
    c.parts.push({ x: P.x - dir * 4, y: P.y - 1, vx: -dir * (20 + speed * 0.25), vy: -18 - Math.random() * 22, life: 0.3, max: 0.3, col: Math.random() < 0.5 ? '#c9b27c' : '#8a7a5a', size: 1, grav: 60 });
    if (speed > 110 && !c.lowParts) c.parts.push({ x: P.x + dir * 12, y: P.y - 1, vx: dir * 10, vy: -12, life: 0.2, max: 0.2, col: '#e8dcb4', size: 1, grav: 30 }); }
  if (speed < BUTT.minSpeed) return;
  const bb = bootBox(P, dir);
  for (const e of c.enemies) {
    if (!e.alive || e.harmless || e.gone > 0 || e.turncoat || e.trainer || e.t === 'dummy' || P.slideHits.has(e) || !c.overlap(bb, c.box(e))) continue;
    P.slideHits.add(e);
    const kind = classify(e, c.poiseMax), blow = slideBlow(speed, c.swordDmg());
    P.slideLast = { t: e.t, kind, blow, speed: Math.round(speed) };
    if (kind === 'boss') { c.hurtEnemy(e, Math.max(1, Math.round(blow * BUTT.chip)), P.x, false); bounce(c, dir); return; }
    if (kind === 'strong') { c.hurtEnemy(e, Math.max(1, Math.round(blow * BUTT.strongShare)), P.x, false); bounce(c, dir); return; }
    c.hurtEnemy(e, blow, P.x, false);   /* WEAK: it dies, or it is knocked flat and you slide on over it */
    if (e.alive) { c.knockFoe(e, dir, 140 + speed * 0.6); e.stagger = Math.max(e.stagger || 0, 1.0); e.vx = 0; }
    c.SFX.thud && c.SFX.thud(); c.sparks(e.x, e.y - 6, dir, 4); c.hitstop(0.03); P.vx *= 0.92; ss.vx = P.vx;
  }
}
function bounce(c, dir) {
  const { P, ss } = c;
  P.vx = -dir * BUTT.bounceVx; P.vy = BUTT.bounceVy; P.ground = false; ss.vx = P.vx; ss.sliding = false; ss.carry = false; P.slideOn = false;
  P.flatT = BUTT.flatT; P.sqT = 0.12; P.sqX = 1.2; P.sqY = 0.8; P.face = dir;   /* (he faces the thing that stopped him, flat on his back) */
  c.SFX.slideHit && c.SFX.slideHit(); c.SFX.clank && c.SFX.clank(); c.shakeCam(3, -dir * 2); c.hitstop(0.06); c.sparks(P.x + dir * 10, P.y - 6, dir, 7); c.dust(P.x, P.y, 5);
}
