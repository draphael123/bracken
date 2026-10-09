// src/hero-move.js - THE HEROES' BASE MOVEMENT, ONE COPY (claude/reachcore, Daniel 10-07: the reach model must use the numbers the game uses).
// main.js's updatePlayer reads every number here (the run, the sprint, the jump, the arc's gravity, the air control, the coyote grace), and
// src/reach-hero.js flies the same numbers to tell the reach tools how far EACH hero jumps. Change a number here and both move together;
// a number copied into either by hand is the bug this file exists to stop (the Glass Sea's slide gap passed every check on a six-tile jump
// nobody has). Base movement only: no mobility skill (the warden's vault, a dash, a roll's pace) and no charm - A7 asks for the slowest legs.
export const MOVE = {
  RUN: 92, GRAV: 1000, JUMPV: -320,
  JUMP_CUT: -110,                     // let go of jump while rising faster than this and the rise is cut to it (the short hop)
  APEX_VY: 62, APEX_G: 0.62,          // THE ARC: light at the apex (|vy| under APEX_VY) ...
  FALL_G: 1.2, FAST_FALL_G: 2.1,      // ... heavier coming down, heaviest with DOWN held (fast fall)
  MAX_FALL: 270, MAX_FAST_FALL: 380,
  ACC_GROUND: 1000, ACC_SLICK: 260, ACC_AIR: 700, ACC_SWIM: 900,
  OVER_BLEED: 400,                    // faster than the cap with the stick held that way: the speed bleeds down to it at this rate
  FRIC_GROUND: 1100, FRIC_SLICK: 70, FRIC_AIR: 200, FRIC_ATTACK: 1600,
  COYOTE: 0.1, COYOTE_ASSIST: 0.2,
  SPRINT_AFTER: 1.1, SPRINT_RAMP: 0.6, SPRINT_BONUS: 0.15,   // hold a run (faster than SPRINT_HOLD of RUN, on the ground) this long and the legs open up, over the ramp
  SPRINT_HOLD: 0.86,
  BODY_W: 10, BODY_H: 14,
  DT: 1 / 60,
};
/* THE LEGS PER HERO: the run cap's multiplier on the ground and in the air. The Death Knight and the Geomancer are heavy on their FEET, not in
   the air (the levels' gaps are measured for the knight's jump); the pyromancer is quicker, the paladin slower, everywhere. */
export const HERO_RUN = {
  knight: { ground: 1, air: 1 }, warden: { ground: 1, air: 1 }, pirate: { ground: 1, air: 1 },
  pyro: { ground: 1.15, air: 1.15 }, paladin: { ground: 0.9, air: 0.9 },
  reaper: { ground: 0.8, air: 1 }, geomancer: { ground: 0.92, air: 1 },
};
export const HERO_MOVE_IDS = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'];
export const heroRunMul = (hero, ground) => { const h = HERO_RUN[hero] || HERO_RUN.knight; return ground ? h.ground : h.air; };
export const sprintK = runT => runT > MOVE.SPRINT_AFTER ? Math.min(1, (runT - MOVE.SPRINT_AFTER) / MOVE.SPRINT_RAMP) : 0;
/* THE RIDES' OWN NUMBERS that a jump carries into (one copy, read by the level's hands AND by src/reach-hero.js): the Sky Road cloak's glide
   (src/sky-road-hands.js GLIDE.fall: hold jump as you fall and you sink this fast) and the Glass Sea's slick glass (src/glass-sea-hands.js
   GS.slideAcc / GS.slideCap: a glass slope's slide builds this much more, up to this multiple of the hill's own top speed, and keeps it) */
export const RIDE_MOVE = { GLIDE_FALL: 40, GLASS_SLIDE_ACC: 120, GLASS_SLIDE_CAP: 1.3 };
/* WHAT THROWS YOU (one copy; main.js reads these, and src/reach-hero.js flies them): a springy tile (a rick, a mushroom cap) - plain, jump held, plunged
   onto - and a Fair awning's share of it; a bud pad (no press: landing is the trigger). A foe's head is src/pogo-chain.js POGO_CHAIN (every hero but
   the warden). THE WARDEN'S SPEAR (she never bounces): over a drop she VAULTS forward off the head (VAULT_HIGH with jump held, carried at VAULT_FWD for
   VAULT_CARRY s); with footing within FOOT_ROWS under it she PERCHES and kicks off with a press (PERCH_KICK, PERCH_BACK px/s away from her facing). */
export const SPRING_MOVE = { BOUNCE: -400, BOUNCE_HELD: -480, BOUNCE_PLUNGED: -560, AWNING: 0.82, BUD: -420 };
export const WARDEN_SPEAR = { PERCH_WIN: 0.34, PERCH_KICK: -430, PERCH_BACK: 60, VAULT_LOW: -300, VAULT_HIGH: -345, VAULT_FWD: 110, VAULT_CARRY: 0.28, FOOT_ROWS: 2 };
