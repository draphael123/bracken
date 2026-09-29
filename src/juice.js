// THE JUICE TABLE (claude/juice, Daniel 2026-09-29, "weightier combat"): every blow a hero lands, every blow a hero takes, goes through
// THIS table, so the weight of a hit is the same for every hero and every foe and is tuned in one place. No per-hero rows.
// It only sets feel (a freeze, a shake, a flash, a sound, a draw-only recoil): never damage, hp, attack timings or AI.
//
//   WEIGHT CLASSES   light   a tap                      ~40 ms freeze
//                    heavy   a held / heavy / third cut  ~90 ms
//                    finish  the blow that kills          ~90 ms (a big foe's death leans harder, in main.js)
//                    open    a boss's opening hit        a little more than its class
//   SHAKE BUDGET     one cap for the whole camera: a shake never STACKS past it, it only tops up.
//   REDUCE MOTION    the one setting (SET.reduceMotion) turns shake, zoom and screen flashes off: juice() returns 0 for them.
export const JUICE = {
  /* stop: seconds the world holds still on a LANDED blow. shake/kick: camera. flash: a white breath on the foe (seconds). squash: the
     foe's stretch. recoil: draw-only pixels the foe is knocked back on screen, eased out. sfx: the SFX key (src/audio.js). */
  light:  { stop: 0.040, shake: 0,   kick: 0,   flash: 0.07, squash: 0.16, recoil: 2, sfx: 'hit' },
  heavy:  { stop: 0.090, shake: 3,   kick: 3,   flash: 0.10, squash: 0.22, recoil: 4, sfx: 'hitHeavy' },
  finish: { stop: 0.090, shake: 3,   kick: 2,   flash: 0.10, squash: 0.22, recoil: 5, sfx: 'hitFinish' },
  /* THE HERO TAKING ONE: a stronger reaction than a landed blow, and weightier for a heavy one */
  hurt:   { stop: 0.090, shake: 5,   kick: 3,   flash: 0.16, squash: 0.14, sfx: 'pHurt' },
  hurtHeavy: { stop: 0.120, shake: 7, kick: 4,   flash: 0.20, squash: 0.18, sfx: 'pHurtHeavy' },
  /* THE SHIELD TAKING ONE */
  block:  { stop: 0.050, shake: 1.5, kick: 2,   sfx: 'block' },
  blockHeavy: { stop: 0.080, shake: 3, kick: 2, sfx: 'blockHeavy' },
  openMul: 1.25,          /* a boss's opening hit: a little more freeze */
  bossMul: 0.8,           /* and a boss is not stopped dead by every touch (the old rule, kept) */
  heavyDamage: 18,        /* the same number as COMBAT.staggerDamage: a blow this big is a heavy one whoever swung it */
  heavyTaken: 20,         /* a blow this big on the hero is a heavy one */
};
/* THE BUDGET: the camera's shake never rises past CAP however many things shake it in the same breath. */
export const SHAKE_CAP = 10;
export const SHAKE_TOPUP = 0.3;   /* a second shake while one is running adds this fraction of the smaller one, then hits the cap */

export const blowClass = ({ dmg = 0, heavy = false, kill = false } = {}) => kill ? 'finish' : (heavy || dmg >= JUICE.heavyDamage) ? 'heavy' : 'light';
export const takenClass = dmg => dmg >= JUICE.heavyTaken ? 'hurtHeavy' : 'hurt';
export const blockClass = dmg => dmg >= JUICE.heavyTaken ? 'blockHeavy' : 'block';

/* THE FREEZE for a landed blow. A whiff is never asked (the caller only asks on a hit); a glance is a 0-damage hit and gets none. */
export function stopFor(cls, { boss = false, opening = false, dmg = 1 } = {}) {
  if (!(dmg > 0)) return 0;
  const row = JUICE[cls]; if (!row) return 0;
  let t = row.stop;
  if (boss) t *= JUICE.bossMul;
  if (boss && opening) t *= JUICE.openMul / JUICE.bossMul;   /* an opening lands at its class, times openMul (not also times bossMul) */
  return t;
}

/* THE SHAKE BUDGET. `cur` is the camera's running shake; a new one of size n tops it up, never past SHAKE_CAP. reduce = the setting: no shake at all. */
export function shakeAdd(cur, n, { amount = 1, reduce = false } = {}) {
  if (reduce || !(amount > 0) || !(n > 0)) return cur;
  const m = n * amount;
  return Math.min(SHAKE_CAP, Math.max(cur, m) + SHAKE_TOPUP * Math.min(cur, m));
}

/* THE KNOCKBACK CURVE: fast out, an eased stop. Speed at time t of a knock that lasts T, starting at v0 (a square ease-out). */
export const knockCurve = (v0, t, T) => t >= T ? 0 : v0 * (1 - t / T) * (1 - t / T);
/* and how far it goes in all: the integral, v0 * T / 3 */
export const knockReach = (v0, T) => Math.abs(v0) * T / 3;

/* NEVER INTO AN UNTOLD PIT. The knock the hero takes when he is hit: `vx` is what he would be thrown at, `landsSafe(dx)` says whether
   standing dx pixels along the throw (signed) is on footing that is not a pit, spikes or deadly water. It walks down 1, .6, .3, 0 of
   the throw and takes the largest that ends on something safe; a hero at a ledge rocks in place instead of flying off it. */
export const KNOCK_AIR = 0.55;   /* (about how long the 150 / -170 throw is in the air, so how far it goes) */
export function safeKnock(vx, landsSafe) {
  if (!vx) return vx;
  for (const k of [1, 0.6, 0.3]) { const dx = vx * k * KNOCK_AIR; if (landsSafe(dx) && landsSafe(dx * 0.5) && landsSafe(dx * 0.25)) return vx * k; }
  return 0;
}

/* THE ONE PLACE reduce-motion is read: how much camera / flash the setting allows (1 = as designed, 0 = none). */
export const motionScale = set => (set && set.reduceMotion) ? 0 : 1;
