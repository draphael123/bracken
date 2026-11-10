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
  /* THE HERO TAKING ONE: a stronger reaction than a landed blow (80 ms: boss-openings and the slopes traces time their steps to it), and a heavy one weightier in shake, flash and sound */
  hurt:   { stop: 0.080, shake: 5,   kick: 3,   flash: 0.16, squash: 0.14, sfx: 'pHurt' },
  hurtHeavy: { stop: 0.080, shake: 7, kick: 4,   flash: 0.20, squash: 0.18, sfx: 'pHurtHeavy' },
  /* THE SHIELD TAKING ONE */
  block:  { stop: 0.050, shake: 1.5, kick: 2,   sfx: 'block' },
  blockHeavy: { stop: 0.080, shake: 3, kick: 2, sfx: 'blockHeavy' },
  /* (claude/demoimpact, Daniel 11-02) THE DEMO IMPACT PASS: what a landed heavy / finish / skill blow does in the DEFAULT shake mode ('hit'), and the parry floor.
     landShake: the fraction of the row's shake + kick a landed heavy / finish blow gives in 'hit' mode (FULL mode is unchanged: the whole row; OFF and reduce-motion: none).
     landRumble: a short weak pad buzz on a landed heavy / finish blow (none on a light one; the Rumble setting gates it); landRumbleGap: the least seconds between two (a DOT does not buzz the pad).
     parryStop: the least freeze of any hero's on-the-beat parry (the Blood Knight's own 200 ms reference parry is above it and untouched). */
  landShake: 0.5,
  landRumble: { heavy: { ms: 70, mag: 0.3 }, finish: { ms: 90, mag: 0.4 } },
  landRumbleGap: 0.25,
  parryStop: 0.08,
  openMul: 1.25,         /* a boss's opening hit: a little more freeze */
  bossMul: 0.8,           /* and a boss is not stopped dead by every touch (the old rule, kept) */
  heavyDamage: 18,        /* the same number as COMBAT.staggerDamage: a blow this big is a heavy one whoever swung it */
  heavyTaken: 20,         /* a blow this big on the hero is a heavy one */
};
/* THE BUDGET: the camera's shake never rises past CAP however many things shake it in the same breath. */
export const SHAKE_CAP = 10;
export const SHAKE_TOPUP = 0.3;   /* a second shake while one is running adds this fraction of the smaller one, then hits the cap */

/* the hurtAs() tags that name a HEAVY blow whoever swung it (a skill's dash / heavy land): 'shot' (arrows, bolts, embers) stays light */
export const HEAVY_TAGS = ['heavy', 'dash'];
export const blowClass =({ dmg = 0, heavy = false, kill = false } = {}) => kill ? 'finish' : (heavy || dmg >= JUICE.heavyDamage) ? 'heavy' : 'light';
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

/* WEAPON WEIGHT (claude/foepass; scratch/brief-bloodknight-1017.md 1: "his HITS: greatsword-weight hit-stop, small camera kick, foe knockback, the layered impact
   sounds"). Not a hero row: a WEAPON CLASS row - any hero who swings that class of weapon lands it this way. stop x on the table's freeze, kick = a small
   camera kick on every landed blow (px, toward the blow), shove = px the foe is pushed off the blow (the shared shove is 2), heavySound = the layered
   impact plays its heavy sample + body thud on every blow. */
export const WEAPON = { greatsword: { stop: 1.3, kick: 1.5, shove: 4, heavySound: true } };
export const WEAPON_OF = { reaper: 'greatsword' };
export const weaponOf = hero => WEAPON[WEAPON_OF[hero]] || null;

/* ==== JUICE2 (claude/juice1, Daniel 11-10: "hit like Ocarina of Time 3D" for the weekend demo; scratch/lane-reports/juice-plan.md section J1) ====
   ONE FLAG. JUICE2_SHIPS false = today's rows and today's code paths, byte for byte (the JUICE table above is never edited; the J2 rows below are read
   only when the flag is on). On = a longer freeze, the struck foe shaking in it, a contact star at the blade's edge, a stronger blocked clink, a kill pop,
   a particle cap and a co-op freeze cap. Feel only: no damage, hp, window, AI or real-knock change. Every accessibility toggle still gates it. */
export let JUICE2_SHIPS = false;                                /* the one-line rollback / switch (main.js turns it on at boot once J1 is green in a browser) */
export const setJuice2 = on => { JUICE2_SHIPS = !!on; };
export const JUICE2 = {
  /* per weight class: stop = real seconds of freeze; flash = the foe's white breath; recoil = draw-only px; star = contact star size px; sparks = hit sparks;
     jit = foe jitter amplitude in the freeze (px, +/- along the hit axis); jitY = extra vertical px */
  light:  { stop: 0.065, flash: 0.08, recoil: 3, star: 12, sparks: 6,  jit: 2, jitY: 0 },
  heavy:  { stop: 0.110, flash: 0.12, recoil: 6, star: 18, sparks: 10, jit: 3, jitY: 1 },
  finish: { stop: 0.130, flash: 0.14, recoil: 8, star: 24, sparks: 14, jit: 3, jitY: 1 },
  bossMul: 0.9,          /* a boss is stopped a little less than the class (was 0.8) ... */
  bossFloor: 0.055,      /* ... but never less than this on any LANDED boss blow */
  glanceStop: 0.06,      /* a blow that did nothing on a guard / armour: the clink (was 0.02) */
  glanceSparks: 6,       /* white, at the guard */
  bossJitMul: 0.5,       /* a boss shakes half as far in the freeze (at least 1 px) */
  recoilEase: 0.16,      /* seconds the recoil eases out over (was 0.14) */
  landShake: 0.65,       /* the 'hit'-mode share of a heavy / finish blow's shake (was 0.5) */
  killPopScale: 1.15, killChips: 8, killRing: 22,
  starFade: 0.033,       /* the star holds for the whole stop, then fades over two frames */
  clinkVx: 60, clinkT: 0.08, clinkKick: 1,   /* the hero's bounce-back off a blocked blow: px/s, seconds, camera px toward the hero */
  partCap: 450, hitSpawnCap: 24,             /* live particles, and the most a single landed hit may spawn */
  weaponStop: { paladin: 1.15, berserker: 1.15, pirate: 0.85, ranger: 0.85 },   /* weapon weight, FREEZE ONLY: maul / hand axes heavier, cutlass / bow lighter (the greatsword's 1.3 stays in WEAPON) */
  coop: { lightMul: 0.7, dutyWindow: 1.0, dutyMax: 0.35 },   /* >= 2 live heroes: a light stop x0.7, and a light stop is skipped past 35% freeze duty over the last second */
};
/* a class's J2 row when the flag is on, else null (callers fall back to the JUICE row) */
export const j2row = cls => JUICE2_SHIPS ? (JUICE2[cls] || null) : null;
export const weaponStopMul = hero => JUICE2_SHIPS ? (JUICE2.weaponStop[hero] || 1) : 1;
export const landShakeShare = () => JUICE2_SHIPS ? JUICE2.landShake : JUICE.landShake;
export const recoilEase = () => JUICE2_SHIPS ? JUICE2.recoilEase : 0.14;
export const partCap = () => JUICE2_SHIPS ? JUICE2.partCap : Infinity;

/* THE FREEZE FOR A LANDED BLOW, flag-aware: the one function main.js asks. Off it is exactly stopFor's old maths. */
export function stopFor2(cls, o = {}) {
  if (!JUICE2_SHIPS) return stopFor(cls, o);
  const { boss = false, opening = false, dmg = 1 } = o;
  if (!(dmg > 0)) return 0;
  const row = JUICE2[cls]; if (!row) return 0;
  let t = row.stop;
  if (boss) { t *= JUICE2.bossMul; if (opening) t *= JUICE.openMul / JUICE2.bossMul; t = Math.max(t, JUICE2.bossFloor); }
  return t;
}
/* the clink: a blow that did nothing on a guard */
export const glanceStop = () => JUICE2_SHIPS ? JUICE2.glanceStop : 0.02;

/* THE FOE'S SHAKE IN THE FREEZE (draw only): +/- amplitude, alternating each rendered frame; 0 outside a freeze / with the flag off / with reduce-motion.
   `frame` = a rendered-frame counter, `axis` = the hit direction (+1 / -1). Returns { dx, dy }. */
export function jitterFor(cls, { stopping = false, boss = false, reduce = false, frame = 0, axis = 1 } = {}) {
  const row = j2row(cls);
  if (!row || !stopping || reduce) return { dx: 0, dy: 0 };
  let a = row.jit, ay = row.jitY;
  if (boss) { a = Math.max(1, Math.round(a * JUICE2.bossJitMul)); ay = Math.round(ay * JUICE2.bossJitMul); }
  const s = (frame & 1) ? 1 : -1;
  return { dx: s * a * (axis < 0 ? -1 : 1), dy: ay ? s * ay : 0 };
}

/* THE CONTACT STAR: size by class, rays gold (white-blue on steel / stone), a white core. The draw happens in main.js with fillRect. */
export const starSize = cls => { const r = j2row(cls); return r ? r.star : 0; };
export const starAlpha = (t, held) => held ? 1 : Math.max(0, 1 - t / JUICE2.starFade);   /* held = a freeze is running: full */
export const starCols = kind => (kind === 'steel' || kind === 'stone') ? { core: '#ffffff', ray: '#bcd6ff' } : { core: '#ffffff', ray: '#ffd36b' };

/* THE PARTICLE CAP: drop the oldest non-fire particles until `len` is at most the cap; returns how many to drop from the front scan. Pure helper (main.js applies it). */
export function capParts(parts, cap = partCap()) {
  if (!(parts.length > cap)) return parts;
  let drop = parts.length - cap; const out = [];
  for (const p of parts) { if (drop > 0 && !p.fire) { drop--; continue; } out.push(p); }
  return out;
}
/* and a per-hit spawn budget: how many of n a hit may still spawn given it already spawned `used` */
export const hitBudget = (n, used) => JUICE2_SHIPS ? Math.max(0, Math.min(n, JUICE2.hitSpawnCap - used)) : n;

/* CO-OP FREEZE CAP. ONE global `stop` stays (no per-player time). duty = { e: [{t, d}] } of recent freezes. */
export const makeDuty = () => ({ e: [] });
export function dutyCovered(duty, now) {
  const w = JUICE2.coop.dutyWindow, lo = now - w; let c = 0;
  duty.e = duty.e.filter(x => x.t + x.d > lo);
  for (const x of duty.e) c += Math.min(x.t + x.d, now) - Math.max(x.t, lo);
  return Math.max(0, c) / w;
}
/* the stop a blow of `cls` really gets with `n` live heroes at real time `now` (0 = skipped); records it. Flag off or one hero: t unchanged. */
export function coopStop(duty, now, cls, t, n) {
  if (!JUICE2_SHIPS || !(t > 0) || !(n >= 2)) return t;
  if (cls === 'light') { t *= JUICE2.coop.lightMul; if (dutyCovered(duty, now) > JUICE2.coop.dutyMax) return 0; }
  duty.e.push({ t: now, d: t });
  return t;
}
